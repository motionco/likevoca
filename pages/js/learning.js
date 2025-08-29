// grammar-learning.js - 완전히 새로 작성된 파일

// Firebase import
import {
  auth,
  db,
  collection,
  getDocs,
  query,
  limit,
  onAuthStateChanged,
  where,
  orderBy,
} from "../../js/firebase/firebase-init.js";

// CollectionManager import
import { CollectionManager } from "../../js/firebase/firebase-collection-manager.js";

// 전역 변수
let currentUser = null;
let currentData = [];
let currentIndex = 0;
let currentLearningArea = null;
let currentLearningMode = null;

// 언어 설정 변수
let sourceLanguage = "korean";
let targetLanguage = "english";
let currentUILanguage = "korean";

// ✅ 캐싱 시스템 추가
let cachedData = {
  vocabulary: { data: null, timestamp: null },
  grammar: { data: null, timestamp: null },
  reading: { data: null, timestamp: null },
};
const CACHE_DURATION = 10 * 60 * 1000; // 10분

// ✅ Firebase 읽기 비용 모니터링
let firebaseReadCount = 0;

// Firebase 읽기 추적 함수
function trackFirebaseRead(queryName, docCount) {
  firebaseReadCount += docCount;

  if (firebaseReadCount > 50) {
    console.warn("⚠️ Firebase 읽기 횟수가 많습니다:", firebaseReadCount);
  }
}

// 📚 학습 활동 추적을 위한 변수들
let collectionManager = null;
let learningSessionData = {
  startTime: null,
  conceptsStudied: new Set(),
  totalInteractions: 0,
  correctAnswers: 0,
  sessionActive: false,
  trackedInteractions: new Set(), // �� 중복 상호작용 방지
};

// 네비게이션 중복 실행 방지
let isNavigating = false;

// 플래시카드 뒤집기 상태
let isFlipped = false;

// 언어 스왑 중복 이벤트 방지 플래그
let isLanguageSwapping = false;

// 세션별 데이터 오프셋 (10개씩 세션 관리)
let sessionOffset = 0;

// 영역별 데이터 분리 저장
let areaData = {
  vocabulary: [],
  grammar: [],
  reading: [],
};

// 현재 데이터 getter 함수 (세션별 10개씩 반환)
function getCurrentData() {
  console.log(
    `🔍 getCurrentData 호출 - currentLearningArea: ${currentLearningArea}, sessionOffset: ${sessionOffset}`
  );

  const allData = areaData[currentLearningArea] || [];
  
  // 현재 세션의 10개만 반환 (sessionOffset부터 sessionOffset+10까지)
  const sessionData = allData.slice(sessionOffset, sessionOffset + 10);
  
  console.log(
    `🔍 getCurrentData: 전체=${allData.length}개, 세션=${sessionData.length}개 (${sessionOffset}~${sessionOffset + 10})`
  );

  if (sessionData.length > 0) {
    console.log(`🔍 세션 데이터 샘플:`, sessionData[0]);
  }

  return sessionData;
}

// 현재 데이터 setter 함수
function setCurrentData(data) {
  if (currentLearningArea) {
    areaData[currentLearningArea] = data;
  } else {
    console.warn(`⚠️ setCurrentData: currentLearningArea가 설정되지 않음`);
  }
}

// Firebase 초기화 대기 함수 수정
async function waitForFirebaseInit() {
  return new Promise((resolve) => {
    const checkFirebase = () => {
      if (window.firebaseInit && window.firebaseInit.db) {
        resolve();
      } else {
        setTimeout(checkFirebase, 100);
      }
    };
    checkFirebase();
  });
}

// DOM 로드 완료 시 초기화
document.addEventListener("DOMContentLoaded", async function () {
  // 네비게이션바 로드
  if (typeof window.loadNavbar === 'function') {
    await window.loadNavbar();
  }
  
  // Footer 로드
  if (typeof window.loadFooter === 'function') {
    await window.loadFooter();
  }
  
  // CollectionManager 초기화
  collectionManager = new CollectionManager();

  // Firebase 인증 확인
  onAuthStateChanged(auth, (user) => {
    if (user) {
      currentUser = user;
    } else {
      console.log("❌ 사용자 로그인되지 않음");
    }
  });

  // 언어 설정 초기화
  initializeLanguageSettings();
  setupEventListeners();

  // 네비게이션바 로드 후 초기화
  setTimeout(() => {
    // 언어 선택 요소들 초기화
    updateLanguageSelectors();

    // 언어 필터 강제 초기화
    import("../../utils/language-utils.js").then((module) => {
      const { initializeLanguageFilterSync } = module;

      // 모바일 언어 필터 초기화
      const mobileSettings = initializeLanguageFilterSync(
        "source-language",
        "target-language",
        "learningLanguageFilter"
      );

      // 데스크탑 언어 필터 초기화
      const desktopSettings = initializeLanguageFilterSync(
        "source-language-desktop",
        "target-language-desktop",
        "learningLanguageFilter"
      );

      // 전역 변수 업데이트
      sourceLanguage = mobileSettings.sourceLanguage;
      targetLanguage = mobileSettings.targetLanguage;

      if (window.languageSettings) {
        window.languageSettings.sourceLanguage = sourceLanguage;
        window.languageSettings.targetLanguage = targetLanguage;
      }

      console.log("🔄 언어 필터 강제 초기화 완료:", {
        sourceLanguage,
        targetLanguage,
      });
    });

    showAreaSelection();

    // 초기 번역 적용
    applyTranslations();

    // 데이터 프리로딩 시작
    startDataPreloading();
  }, 100);

  // 언어 변경 핸들러는 제거 (중복 방지)
  // handleLanguageChange();

  // 언어 변경 이벤트 리스너 추가
  window.addEventListener("languageChanged", (event) => {
    console.log("🌐 언어 변경 이벤트 수신 - 학습 페이지 업데이트");

    // 변경된 언어 가져오기
    const newUILanguage =
      event.detail?.language || localStorage.getItem("userLanguage") || "ko";
    currentUILanguage = newUILanguage === "auto" ? "ko" : newUILanguage;

    // 언어 필터 초기화 (환경 언어 변경 시 기존 설정 무시)
    import("../../utils/language-utils.js").then((module) => {
      const { updateLanguageFilterOnUIChange, loadLanguageFilterSettings } =
        module;

      // 환경 언어 변경에 따른 언어 필터 초기화
      updateLanguageFilterOnUIChange(
        currentUILanguage,
        "learningLanguageFilter"
      );

      // 새로운 언어 설정 로드 및 전역 변수 업데이트
      const newSettings = loadLanguageFilterSettings("learningLanguageFilter");
      sourceLanguage = newSettings.sourceLanguage;
      targetLanguage = newSettings.targetLanguage;

      if (window.languageSettings) {
        window.languageSettings.sourceLanguage = sourceLanguage;
        window.languageSettings.targetLanguage = targetLanguage;
      }

      // 언어 선택 요소 업데이트
      updateLanguageSelectors();

      console.log("🔄 환경 언어 변경에 따른 언어 필터 초기화:", {
        newUILanguage: currentUILanguage,
        sourceLanguage,
        targetLanguage,
      });
    });

    // 번역 다시 적용
    if (typeof window.applyLanguage === "function") {
      window.applyLanguage();
    }

    // 필터 옵션 언어 업데이트
    updateFilterOptionsLanguage();

    // 현재 학습 중인 내용이 있으면 실시간 업데이트
    if (currentLearningArea && currentLearningMode) {
      console.log("🔄 언어 변경으로 인한 학습 내용 실시간 업데이트:", {
        area: currentLearningArea,
        mode: currentLearningMode,
      });

      // 각 학습 모드별로 업데이트
      switch (currentLearningArea) {
        case "vocabulary":
          switch (currentLearningMode) {
            case "flashcard":
              updateFlashcard();
              break;
            case "typing":
              updateTyping();
              break;
          }
          break;

        case "grammar":
          switch (currentLearningMode) {
            case "pattern":
              updateGrammarPatterns();
              break;
            case "practice":
              updateGrammarPractice();
              break;
          }
          break;

        case "reading":
          switch (currentLearningMode) {
            case "example":
              updateReadingExample();
              break;
            case "flash":
              updateReadingFlash();
              break;
          }
          break;
      }
    } else {
      // 현재 화면 다시 렌더링
      showAreaSelection();
    }
  });
});

// 전역 함수들 노출
window.showAreaSelection = showAreaSelection;
window.showLearningModes = showLearningModes;
window.updateFilterOptionsLanguage = updateFilterOptionsLanguage;

function initializeLanguageSettings() {
  // 현재 언어 감지
  const detectedLanguage = getCurrentLanguage();

  // 사용자 언어 설정 가져오기
  const userLanguage = localStorage.getItem("userLanguage") || detectedLanguage;

  // 언어 필터 설정 임포트 및 초기화
  import("../../utils/language-utils.js").then((module) => {
    const { loadLanguageFilterSettings, saveLanguageFilterSettings } = module;

    // 언어 필터 설정 로드 (시스템 언어 기반 초기값 사용)
    const filterSettings = loadLanguageFilterSettings("learningLanguageFilter");

    // 언어 설정 초기화
    if (!window.languageSettings) {
      window.languageSettings = {
        sourceLanguage: filterSettings.sourceLanguage,
        targetLanguage: filterSettings.targetLanguage,
        currentUILanguage:
          userLanguage === "auto" ? detectedLanguage : userLanguage,
      };
    }

    // 전역 변수 업데이트
    sourceLanguage = window.languageSettings.sourceLanguage;
    targetLanguage = window.languageSettings.targetLanguage;
    currentUILanguage = window.languageSettings.currentUILanguage;

    // 같은 언어 선택 방지
    if (sourceLanguage === targetLanguage) {
      const otherLanguages = [
        "korean",
        "english",
        "japanese",
        "chinese",
        "spanish",
      ].filter((lang) => lang !== sourceLanguage);
      targetLanguage = otherLanguages[0];
      window.languageSettings.targetLanguage = targetLanguage;

      // 언어 필터 설정도 업데이트
      const updatedSettings = {
        sourceLanguage,
        targetLanguage,
      };
      saveLanguageFilterSettings(updatedSettings, "learningLanguageFilter");
    }

    console.log("🌐 언어 설정 초기화:", {
      sourceLanguage,
      targetLanguage,
      currentUILanguage,
      userLanguage,
    });

    // 언어 선택 요소 즉시 초기화
    updateLanguageSelectors();
  });
}

// 필터 변경 핸들러
function handleFilterChange() {
  console.log("🔍 필터 변경 감지 - 클라이언트 측 필터링");

  // 현재 학습 중인 경우 기존 데이터에 필터만 적용 (DB 재조회 없음)
  if (currentLearningArea && currentLearningMode) {
    console.log("🔄 필터 변경 - 기존 데이터 활용");

    // ✅ DB 재조회 없이 기존 데이터에 필터만 적용
    if (
      preloadedData[currentLearningArea] &&
      preloadedData[currentLearningArea].length > 0
    ) {
      const filteredData = applyFilters(preloadedData[currentLearningArea]);
      areaData[currentLearningArea] = filteredData;
      currentIndex = 0; // 인덱스 초기화

      console.log(`✅ 클라이언트 필터링 완료: ${filteredData.length}개`);

      // UI만 업데이트
      updateCurrentView();
    } else {
      // 프리로드된 데이터가 없는 경우에만 DB 조회
      console.log("⚠️ 프리로드 데이터 없음 - DB 재조회");
      currentIndex = 0;
      startLearningMode(currentLearningArea, currentLearningMode);
    }
  }
}

// 현재 필터 설정 가져오기
function getCurrentFilters() {
  // 데스크탑용 필터 요소들
  const domainFilter = document.getElementById("domain-filter");
  const difficultyFilter = document.getElementById("difficulty-level");
  const situationFilter = document.getElementById("situation-filter");
  const purposeFilter = document.getElementById("purpose-filter");

  // 모바일용 필터 요소들
  const domainFilterMobile = document.getElementById("domain-filter-mobile");
  const difficultyFilterMobile = document.getElementById(
    "difficulty-level-mobile"
  );
  const situationFilterMobile = document.getElementById(
    "situation-filter-mobile"
  );
  const purposeFilterMobile = document.getElementById("purpose-filter-mobile");

  return {
    domain:
      (domainFilter && domainFilter.value) ||
      (domainFilterMobile && domainFilterMobile.value) ||
      "all",
    difficulty:
      (difficultyFilter && difficultyFilter.value) ||
      (difficultyFilterMobile && difficultyFilterMobile.value) ||
      "all",
    situation:
      (situationFilter && situationFilter.value) ||
      (situationFilterMobile && situationFilterMobile.value) ||
      "all",
    purpose:
      (purposeFilter && purposeFilter.value) ||
      (purposeFilterMobile && purposeFilterMobile.value) ||
      "all",
  };
}

// 데이터에 필터 적용
function applyFilters(data) {
  const filters = getCurrentFilters();
  console.log("🔍 필터 적용:", filters);
  console.log("🔍 원본 데이터 샘플:", data.slice(0, 3));

  // 정의된 도메인 목록
  const definedDomains = [
    "daily",
    "business",
    "academic",
    "travel",
    "food",
    "nature",
    "technology",
    "health",
    "sports",
    "entertainment",
    "other",
  ];

  const filteredData = data.filter((item) => {
    console.log("🔍 아이템 검사:", {
      id: item.id,
      domain: item.domain,
      difficulty: item.difficulty,
      pattern_type: item.pattern_type,
      concept_info: item.concept_info,
    });

    // 도메인 필터 - 여러 가능한 필드 확인
    if (filters.domain !== "all") {
      let itemDomain = item.domain || item.concept_info?.domain || "other";

      // general 도메인이나 정의되지 않은 도메인을 other로 매핑
      if (itemDomain === "general" || !definedDomains.includes(itemDomain)) {
        itemDomain = "other";
        console.log(`🔍 도메인 매핑: ${item.domain || "undefined"} → other`);
      }

      if (itemDomain !== filters.domain) {
        console.log(
          `🔍 도메인 필터로 제외: ${itemDomain} !== ${filters.domain}`
        );
        return false;
      }
    }

    // 난이도 필터
    if (filters.difficulty !== "all") {
      const itemDifficulty =
        item.difficulty || item.concept_info?.difficulty || "beginner";
      if (itemDifficulty !== filters.difficulty) {
        console.log(
          `🔍 난이도 필터로 제외: ${itemDifficulty} !== ${filters.difficulty}`
        );
        return false;
      }
    }

    // 상황 필터 (situation 배열에 포함된 항목 필터링)
    if (filters.situation !== "all") {
      const itemSituations = item.situation || [];
      if (
        !Array.isArray(itemSituations) ||
        !itemSituations.includes(filters.situation)
      ) {
        console.log(
          `🔍 상황 필터로 제외: ${JSON.stringify(
            itemSituations
          )} does not include ${filters.situation}`
        );
        return false;
      }
    }

    // 목적 필터 (purpose 필드 직접 비교)
    if (filters.purpose !== "all") {
      const itemPurpose = item.purpose || "";
      if (itemPurpose !== filters.purpose) {
        console.log(
          `🔍 목적 필터로 제외: ${itemPurpose} !== ${filters.purpose}`
        );
        return false;
      }
    }

    console.log("🔍 필터 통과:", item.id);
    return true;
  });

  console.log(`🔍 필터링 결과: ${data.length}개 → ${filteredData.length}개`);
  return filteredData;
}

// 언어 변경 핸들러 (사용하지 않음 - 중복 방지)
function handleLanguageChange() {
  // 이 함수는 더 이상 사용하지 않습니다.
  // 언어 변경 처리는 window.addEventListener("languageChanged")에서 통합 처리합니다.
}

// 번역 적용 함수
function applyTranslations() {
  // language-utils.js의 applyLanguage 함수 호출
  if (window.applyLanguage) {
    window.applyLanguage();
  }
}

// 추가 번역 키들을 직접 처리하는 함수
function applyAdditionalTranslations() {
  const currentLang = getCurrentLanguage();
  console.log("🌐 학습 페이지 추가 번역 적용:", currentLang);

  // 추가 번역 키들 정의
  const additionalTranslations = {
    ko: {
      flashcard_learning: "🃏 플래시카드 학습",
      typing_learning: "⌨️ 타이핑 학습",
      pronunciation_practice: "🎤 발음 연습",
      grammar_pattern_analysis: "📝 문법 패턴 분석",
      grammar_practice: "📚 문법 실습 연습",
      reading_learning: "독해 학습",
      reading_flash_card: "플래시 카드",
      click_to_check_meaning: "클릭하여 의미 확인",
      click_to_see_word: "다시 클릭하여 단어 보기",
      typing_answer_placeholder: "답안을 입력하세요",
      check: "확인",
      pronunciation_coming_soon: "발음 연습 모드는 준비 중입니다.",
      play_pronunciation: "발음 듣기",
      click_to_see_explanation: "클릭하여 설명 보기",
      original_text: "원문",
      translation: "번역",
      context: "상황",
      home: "홈으로",
      back_to_home: "홈으로 돌아가기",
      no_data: "데이터가 없습니다",
      no_data_description:
        "학습할 데이터가 없습니다. 먼저 데이터를 업로드해주세요.",
      concept_upload: "개념 업로드",
      grammar_pattern_upload: "문법 패턴 업로드",
      example_upload: "예문 업로드",
      upload_csv_json_concept:
        "CSV 또는 JSON 파일을 업로드하여 개념을 추가하세요.",
      upload_csv_json_grammar:
        "CSV 또는 JSON 파일을 업로드하여 문법 패턴을 추가하세요.",
      upload_csv_json_example:
        "CSV 또는 JSON 파일을 업로드하여 예문을 추가하세요.",
      upload: "업로드",
      download_template: "템플릿 다운로드",
      // 학습 모드 카드 번역
      flashcard_mode: "플래시카드",
      flashcard_mode_desc: "카드를 뒤집어가며 단어와 의미 학습",
      typing_mode: "타이핑",
      typing_mode_desc: "듣고 정확하게 타이핑하여 스펠링 연습",
      listening_mode: "듣기 연습",
      listening_mode_desc: "음성 듣기 학습",
      pronunciation_mode: "발음 연습",
      pronunciation_mode_desc: "음성 인식으로 정확한 발음 훈련",
      pattern_analysis_mode: "패턴 분석",
      pattern_analysis_mode_desc: "문법 구조와 패턴을 체계적으로 학습",
      practice_mode: "실습 연습",
      practice_mode_desc: "플래시카드 방식으로 문법 패턴 연습",
      example_learning_mode: "예문 학습",
      example_learning_mode_desc: "예문을 통한 일반적인 독해 학습",
      flash_mode: "플래시 모드",
      flash_mode_desc: "플래시카드 방식으로 빠른 독해 연습",
      // 학습 모드 제목 번역
      vocabulary_learning_modes: "단어 학습 모드",
      grammar_learning_modes: "문법 학습 모드",
      reading_learning_modes: "독해 학습 모드",
      vocabulary_data_upload: "단어 데이터 업로드",
      grammar_pattern_data_upload: "문법 패턴 데이터 업로드",
      reading_data_upload: "독해 데이터 업로드",
    },
    en: {
      flashcard_learning: "🃏 Flashcard Learning",
      typing_learning: "⌨️ Typing Learning",
      listening_practice: "🎧 Listening Practice",
      pronunciation_practice: "🎤 Pronunciation Practice",
      grammar_pattern_analysis: "📝 Grammar Pattern Analysis",
      grammar_practice: "📚 Grammar Practice",
      reading_learning: "Reading Learning",
      reading_flash_card: "Flashcard Reading",
      click_to_check_meaning: "Click to check meaning",
      click_to_see_word: "Click again to see word",
      typing_answer_placeholder: "Enter your answer",
      check: "Check",
      pronunciation_coming_soon: "Pronunciation practice mode is coming soon.",
      listening_coming_soon: "Listening practice mode is coming soon.",
      play_pronunciation: "Play Pronunciation",
      click_to_see_explanation: "Click to see explanation",
      original_text: "Original Text",
      translation: "Translation",
      context: "Context",
      home: "Home",
      back_to_home: "Back to Home",
      no_data: "No Data Available",
      no_data_description:
        "There is no data to learn. Please upload data first.",
      concept_upload: "Concept Upload",
      grammar_pattern_upload: "Grammar Pattern Upload",
      example_upload: "Example Upload",
      upload_csv_json_concept: "Upload CSV or JSON files to add concepts.",
      upload_csv_json_grammar:
        "Upload CSV or JSON files to add grammar patterns.",
      upload_csv_json_example: "Upload CSV or JSON files to add examples.",
      upload: "Upload",
      download_template: "Download Template",
      // 학습 모드 카드 번역
      flashcard_mode: "Flashcard",
      flashcard_mode_desc: "Learn words and meanings by flipping cards",
      typing_mode: "Typing",
      typing_mode_desc: "Practice spelling by listening and typing accurately",
      pronunciation_mode: "Pronunciation",
      pronunciation_mode_desc:
        "Train accurate pronunciation with voice recognition",
      pattern_analysis_mode: "Pattern Analysis",
      pattern_analysis_mode_desc:
        "Systematically learn grammar structures and patterns",
      practice_mode: "Practice",
      practice_mode_desc: "Practice grammar patterns with flashcard method",
      example_learning_mode: "Example Learning",
      example_learning_mode_desc:
        "General reading comprehension through examples",
      flash_mode: "Flash Mode",
      flash_mode_desc: "Quick reading practice with flashcard method",
      // 학습 모드 제목 번역
      vocabulary_learning_modes: "Vocabulary Learning Modes",
      grammar_learning_modes: "Grammar Learning Modes",
      reading_learning_modes: "Reading Learning Modes",
      vocabulary_data_upload: "Vocabulary Data Upload",
      grammar_pattern_data_upload: "Grammar Pattern Data Upload",
      reading_data_upload: "Reading Data Upload",
    },
    ja: {
      flashcard_learning: "🃏 フラッシュカード学習",
      typing_learning: "⌨️ タイピング学習",
      pronunciation_practice: "🎤 発音練習",
      grammar_pattern_analysis: "📝 文法パターン分析",
      grammar_practice: "📚 文法実習練習",
      reading_learning: "読解学習",
      reading_flash_card: "フラッシュカード",
      click_to_check_meaning: "クリックして意味を確認",
      click_to_see_word: "再度クリックして単語を見る",
      typing_answer_placeholder: "答えを入力してください",
      check: "確認",
      pronunciation_coming_soon: "発音練習モードは準備中です。",
      play_pronunciation: "発音を聞く",
      click_to_see_explanation: "クリックして説明を見る",
      original_text: "原文",
      translation: "翻訳",
      context: "状況",
      home: "ホーム",
      back_to_home: "ホームに戻る",
      no_data: "データがありません",
      no_data_description:
        "学習するデータがありません。まずデータをアップロードしてください。",
      concept_upload: "概念アップロード",
      grammar_pattern_upload: "文法パターンアップロード",
      example_upload: "例文アップロード",
      upload_csv_json_concept:
        "CSVまたはJSONファイルをアップロードして概念を追加してください。",
      upload_csv_json_grammar:
        "CSVまたはJSONファイルをアップロードして文法パターンを追加してください。",
      upload_csv_json_example:
        "CSVまたはJSONファイルをアップロードして例文を追加してください。",
      upload: "アップロード",
      download_template: "テンプレートダウンロード",
      // 학습 모드 카드 번역
      flashcard_mode: "フラッシュカード",
      flashcard_mode_desc: "カードをめくって単語と意味を学習",
      typing_mode: "タイピング",
      typing_mode_desc: "聞いて正確にタイピングしてスペリング練習",
      listening_mode: "聴解練習",
      listening_mode_desc: "音声聞き取り学習",
      pronunciation_mode: "発音練習",
      pronunciation_mode_desc: "音声認識で正確な発音を訓練",
      pattern_analysis_mode: "パターン分析",
      pattern_analysis_mode_desc: "文法構造とパターンを体系的に学習",
      practice_mode: "実習練習",
      practice_mode_desc: "フラッシュカード方式で文法パターン練習",
      example_learning_mode: "例文学習",
      example_learning_mode_desc: "例文を通じた一般的な読解学習",
      flash_mode: "フラッシュモード",
      flash_mode_desc: "フラッシュカード方式で素早い読解練習",
      // 학습 모드 제목 번역
      vocabulary_learning_modes: "単語学習モード",
      grammar_learning_modes: "文法学習モード",
      reading_learning_modes: "読解学習モード",
      vocabulary_data_upload: "単語データアップロード",
      grammar_pattern_data_upload: "文法パターンデータアップロード",
      reading_data_upload: "読解データアップロード",
    },
    zh: {
      flashcard_learning: "🃏 闪卡学习",
      typing_learning: "⌨️ 打字学习",
      pronunciation_practice: "🎤 发音练习",
      grammar_pattern_analysis: "📝 语法模式分析",
      grammar_practice: "📚 语法练习",
      reading_learning: "阅读学习",
      reading_flash_card: "闪卡阅读",
      click_to_check_meaning: "点击查看含义",
      click_to_see_word: "再次点击查看单词",
      typing_answer_placeholder: "请输入您的答案",
      check: "检查",
      pronunciation_coming_soon: "发音练习模式即将推出。",
      play_pronunciation: "播放发音",
      click_to_see_explanation: "点击查看解释",
      original_text: "原文",
      translation: "翻译",
      context: "语境",
      home: "首页",
      back_to_home: "返回首页",
      no_data: "无数据",
      no_data_description: "没有学习数据。请先上传数据。",
      concept_upload: "概念上传",
      grammar_pattern_upload: "语法模式上传",
      example_upload: "例句上传",
      upload_csv_json_concept: "上传CSV或JSON文件以添加概念。",
      upload_csv_json_grammar: "上传CSV或JSON文件以添加语法模式。",
      upload_csv_json_example: "上传CSV或JSON文件以添加例句。",
      upload: "上传",
      download_template: "下载模板",
      // 학습 모드 카드 번역
      flashcard_mode: "闪卡",
      flashcard_mode_desc: "翻转卡片学习单词和含义",
      typing_mode: "打字",
      typing_mode_desc: "听写并准确打字练习拼写",
      listening_mode: "听力练习",
      listening_mode_desc: "语音听力学习",
      pronunciation_mode: "发音练习",
      pronunciation_mode_desc: "通过语音识别训练准确发音",
      pattern_analysis_mode: "模式分析",
      pattern_analysis_mode_desc: "系统学习语法结构和模式",
      practice_mode: "练习",
      practice_mode_desc: "用闪卡方式练习语法模式",
      example_learning_mode: "例句学习",
      example_learning_mode_desc: "通过例句进行一般阅读理解",
      flash_mode: "闪读模式",
      flash_mode_desc: "用闪卡方式进行快速阅读练习",
      // 학습 모드 제목 번역
      vocabulary_learning_modes: "词汇学习模式",
      grammar_learning_modes: "语法学习模式",
      reading_learning_modes: "阅读学习模式",
      vocabulary_data_upload: "词汇数据上传",
      grammar_pattern_data_upload: "语法模式数据上传",
      reading_data_upload: "阅读数据上传",
    },
  };

  // 현재 언어의 번역 적용
  if (additionalTranslations[currentLang]) {
    const translations = additionalTranslations[currentLang];
    console.log("🔍 번역 키 개수:", Object.keys(translations).length);

    // 일반 텍스트 요소 번역
    const i18nElements = document.querySelectorAll("[data-i18n]");
    console.log("🔍 data-i18n 요소 개수:", i18nElements.length);

    i18nElements.forEach((element) => {
      const key = element.getAttribute("data-i18n");
      if (translations[key]) {
        element.textContent = translations[key];
        console.log("✅ 번역 적용:", key, "->", translations[key]);
      }
    });

    // placeholder 속성 번역
    const placeholderElements = document.querySelectorAll(
      "[data-i18n-placeholder]"
    );
    console.log(
      "🔍 data-i18n-placeholder 요소 개수:",
      placeholderElements.length
    );

    placeholderElements.forEach((element) => {
      const key = element.getAttribute("data-i18n-placeholder");
      if (translations[key]) {
        element.placeholder = translations[key];
        console.log("✅ placeholder 번역 적용:", key, "->", translations[key]);
      }
    });
  } else {
    console.warn("⚠️ 해당 언어의 번역 데이터가 없습니다:", currentLang);
  }
}

// 현재 언어 가져오기 함수
function getCurrentLanguage() {
  // URL 경로에서 언어 감지 (locales 구조)
  const path = window.location.pathname;
  if (path.includes("/locales/")) {
    const pathParts = path.split("/");
    const langIndex = pathParts.indexOf("locales") + 1;
    if (langIndex < pathParts.length) {
      const detectedLang = pathParts[langIndex];
      if (["ko", "en", "ja", "zh", "es"].includes(detectedLang)) {
        console.log("🔍 URL 경로에서 언어 감지:", detectedLang);
        return detectedLang;
      }
    }
  }

  // utils/language-utils.js와 동일한 방식으로 언어 감지
  const savedLanguage = localStorage.getItem("preferredLanguage");
  if (savedLanguage) {
    console.log("🔍 localStorage에서 언어 감지:", savedLanguage);
    return savedLanguage;
  }

  const sessionLanguage = sessionStorage.getItem("currentUILanguage");
  if (sessionLanguage) {
    console.log("🔍 sessionStorage에서 언어 감지:", sessionLanguage);
    return sessionLanguage;
  }

  console.log("🔍 기본 언어 사용: ko");
  return "ko";
}

// 언어 선택 요소들 업데이트 함수
function updateLanguageSelectors() {
  const sourceLanguageSelect = document.getElementById("source-language");
  const targetLanguageSelect = document.getElementById("target-language");
  const sourceLanguageDesktopSelect = document.getElementById(
    "source-language-desktop"
  );
  const targetLanguageDesktopSelect = document.getElementById(
    "target-language-desktop"
  );

  // 모바일 언어 선택 요소
  if (sourceLanguageSelect && targetLanguageSelect) {
    sourceLanguageSelect.value = sourceLanguage;
    targetLanguageSelect.value = targetLanguage;
    console.log("🔄 모바일 언어 선택 요소 업데이트:", {
      sourceLanguage,
      targetLanguage,
    });
  }

  // 데스크탑 언어 선택 요소
  if (sourceLanguageDesktopSelect && targetLanguageDesktopSelect) {
    sourceLanguageDesktopSelect.value = sourceLanguage;
    targetLanguageDesktopSelect.value = targetLanguage;
    console.log("🔄 데스크탑 언어 선택 요소 업데이트:", {
      sourceLanguage,
      targetLanguage,
    });
  }
}

function setupEventListeners() {
  // 네비게이션바 이벤트 설정 (햄버거 메뉴 등)
  if (typeof window.setupBasicNavbarEvents === "function") {
    window.setupBasicNavbarEvents();
    console.log("✅ 학습: 네비게이션바 이벤트 설정 완료");
  } else {
    console.warn("⚠️ setupBasicNavbarEvents 함수를 찾을 수 없습니다.");
  }

  // 기존 이벤트 리스너들 제거
  document.removeEventListener("click", globalClickHandler);

  // 언어 선택 요소들 설정
  const sourceLanguageSelect = document.getElementById("source-language");
  const targetLanguageSelect = document.getElementById("target-language");

  if (sourceLanguageSelect && targetLanguageSelect) {
    // 초기 값 설정
    sourceLanguageSelect.value = sourceLanguage;
    targetLanguageSelect.value = targetLanguage;

    // 언어 변경 이벤트 리스너
    sourceLanguageSelect.addEventListener("change", (e) => {
      handleLanguageSelectChange(e, "source");
    });

    targetLanguageSelect.addEventListener("change", (e) => {
      handleLanguageSelectChange(e, "target");
    });
  }

  // 데스크탑용 언어 선택 요소들 설정
  const sourceLanguageDesktopSelect = document.getElementById(
    "source-language-desktop"
  );
  const targetLanguageDesktopSelect = document.getElementById(
    "target-language-desktop"
  );

  if (sourceLanguageDesktopSelect && targetLanguageDesktopSelect) {
    // 초기 값 설정
    sourceLanguageDesktopSelect.value = sourceLanguage;
    targetLanguageDesktopSelect.value = targetLanguage;

    // 언어 변경 이벤트 리스너
    sourceLanguageDesktopSelect.addEventListener("change", (e) => {
      handleLanguageSelectChange(e, "source");
    });

    targetLanguageDesktopSelect.addEventListener("change", (e) => {
      handleLanguageSelectChange(e, "target");
    });
  }

  // 언어 전환 버튼 이벤트 리스너 (모바일용)
  const swapButton = document.getElementById("swap-languages");
  if (swapButton) {
    swapButton.addEventListener("click", () => {
      handleLanguageSwap();
    });
  }

  // 데스크탑용 언어 전환 버튼 이벤트 리스너
  const swapDesktopButton = document.getElementById("swap-languages-desktop");
  if (swapDesktopButton) {
    swapDesktopButton.addEventListener("click", () => {
      handleLanguageSwap();
    });
  }

  // 공통 언어 선택 변경 핸들러
  function handleLanguageSelectChange(e, type) {
    // 스왑 중인 경우 이벤트 무시
    if (isLanguageSwapping) {
      return;
    }

    const newValue = e.target.value;

    if (type === "source") {
      sourceLanguage = newValue;
      window.languageSettings.sourceLanguage = sourceLanguage;

      console.log("🌐 원본 언어 변경:", {
        newValue,
        sourceLanguage,
        targetLanguage,
        windowSettings: window.languageSettings,
      });

      // 같은 언어 선택 방지
      if (sourceLanguage === targetLanguage) {
        // 대상 언어를 다른 언어로 자동 변경
        const otherLanguages = [
          "korean",
          "english",
          "japanese",
          "chinese",
          "spanish",
        ].filter((lang) => lang !== sourceLanguage);
        targetLanguage = otherLanguages[0];

        // 모든 대상 언어 선택 요소 업데이트
        if (targetLanguageSelect) targetLanguageSelect.value = targetLanguage;
        if (targetLanguageDesktopSelect)
          targetLanguageDesktopSelect.value = targetLanguage;

        window.languageSettings.targetLanguage = targetLanguage;
      }
    } else if (type === "target") {
      targetLanguage = newValue;
      window.languageSettings.targetLanguage = targetLanguage;

      console.log("🌐 대상 언어 변경:", {
        newValue,
        sourceLanguage,
        targetLanguage,
        windowSettings: window.languageSettings,
      });

      // 같은 언어 선택 방지
      if (sourceLanguage === targetLanguage) {
        // 원본 언어를 다른 언어로 자동 변경
        const otherLanguages = [
          "korean",
          "english",
          "japanese",
          "chinese",
          "spanish",
        ].filter((lang) => lang !== targetLanguage);
        sourceLanguage = otherLanguages[0];

        // 모든 원본 언어 선택 요소 업데이트
        if (sourceLanguageSelect) sourceLanguageSelect.value = sourceLanguage;
        if (sourceLanguageDesktopSelect)
          sourceLanguageDesktopSelect.value = sourceLanguage;

        window.languageSettings.sourceLanguage = sourceLanguage;
      }
    }

    // 언어 설정 저장
    import("../../utils/language-utils.js").then((module) => {
      const { saveLanguageFilterSettings } = module;
      saveLanguageFilterSettings(
        sourceLanguage,
        targetLanguage,
        "learningLanguageFilter"
      );
    });

    handleFilterChange();
  }

  // 공통 언어 전환 핸들러
  function handleLanguageSwap() {
    console.log("🔄 언어 스왑 버튼 클릭 - 이전:", {
      sourceLanguage,
      targetLanguage,
      windowSettings: window.languageSettings,
    });

    // 중복 이벤트 방지 플래그 설정
    isLanguageSwapping = true;

    // 언어 전환
    const tempLanguage = sourceLanguage;
    sourceLanguage = targetLanguage;
    targetLanguage = tempLanguage;

    // 전역 설정 업데이트
    window.languageSettings.sourceLanguage = sourceLanguage;
    window.languageSettings.targetLanguage = targetLanguage;

    console.log("🔄 언어 스왑 완료 - 이후:", {
      sourceLanguage,
      targetLanguage,
      windowSettings: window.languageSettings,
    });

    // 모든 언어 선택 요소 업데이트
    if (sourceLanguageSelect) sourceLanguageSelect.value = sourceLanguage;
    if (targetLanguageSelect) targetLanguageSelect.value = targetLanguage;
    if (sourceLanguageDesktopSelect)
      sourceLanguageDesktopSelect.value = sourceLanguage;
    if (targetLanguageDesktopSelect)
      targetLanguageDesktopSelect.value = targetLanguage;

    console.log("🔄 언어 전환:", { sourceLanguage, targetLanguage });

    // 언어 설정 저장
    import("../../utils/language-utils.js").then((module) => {
      const { saveLanguageFilterSettings } = module;
      saveLanguageFilterSettings(
        sourceLanguage,
        targetLanguage,
        "learningLanguageFilter"
      );
    });

    // 필터 변경 처리
    handleFilterChange();

    // 플래그 해제
    setTimeout(() => {
      isLanguageSwapping = false;
    }, 100);
  }

  // 필터 이벤트 리스너 추가
  const domainFilter = document.getElementById("domain-filter");
  const difficultyFilter = document.getElementById("difficulty-level");
  const situationFilter = document.getElementById("situation-filter");
  const purposeFilter = document.getElementById("purpose-filter");

  // 모바일용 필터 요소들
  const domainFilterMobile = document.getElementById("domain-filter-mobile");
  const difficultyFilterMobile = document.getElementById(
    "difficulty-level-mobile"
  );
  const situationFilterMobile = document.getElementById(
    "situation-filter-mobile"
  );
  const purposeFilterMobile = document.getElementById("purpose-filter-mobile");

  // 데스크탑 필터 이벤트 리스너
  if (domainFilter) {
    domainFilter.addEventListener("change", handleFilterChange);
  }
  if (difficultyFilter) {
    difficultyFilter.addEventListener("change", handleFilterChange);
  }
  if (situationFilter) {
    situationFilter.addEventListener("change", handleFilterChange);
  }
  if (purposeFilter) {
    purposeFilter.addEventListener("change", handleFilterChange);
  }

  // 모바일 필터 이벤트 리스너 및 동기화
  if (domainFilterMobile) {
    domainFilterMobile.addEventListener("change", (e) => {
      // 데스크탑 필터와 동기화
      if (domainFilter) domainFilter.value = e.target.value;
      handleFilterChange();
    });
  }
  if (difficultyFilterMobile) {
    difficultyFilterMobile.addEventListener("change", (e) => {
      // 데스크탑 필터와 동기화
      if (difficultyFilter) difficultyFilter.value = e.target.value;
      handleFilterChange();
    });
  }
  if (situationFilterMobile) {
    situationFilterMobile.addEventListener("change", (e) => {
      // 데스크탑 필터와 동기화
      if (situationFilter) situationFilter.value = e.target.value;
      handleFilterChange();
    });
  }
  if (purposeFilterMobile) {
    purposeFilterMobile.addEventListener("change", (e) => {
      // 데스크탑 필터와 동기화
      if (purposeFilter) purposeFilter.value = e.target.value;
      handleFilterChange();
    });
  }

  // 데스크탑 필터 변경 시 모바일 필터도 동기화
  if (domainFilter) {
    domainFilter.addEventListener("change", (e) => {
      if (domainFilterMobile) domainFilterMobile.value = e.target.value;
      handleFilterChange();
    });
  }
  if (difficultyFilter) {
    difficultyFilter.addEventListener("change", (e) => {
      if (difficultyFilterMobile) difficultyFilterMobile.value = e.target.value;
      handleFilterChange();
    });
  }
  if (situationFilter) {
    situationFilter.addEventListener("change", (e) => {
      if (situationFilterMobile) situationFilterMobile.value = e.target.value;
      handleFilterChange();
    });
  }
  if (purposeFilter) {
    purposeFilter.addEventListener("change", (e) => {
      if (purposeFilterMobile) purposeFilterMobile.value = e.target.value;
      handleFilterChange();
    });
  }

  // 네비게이션 버튼들 - 개별 이벤트 리스너만 사용
  const prevBtn = document.getElementById("prev-grammar");
  const nextBtn = document.getElementById("next-grammar");

  if (prevBtn) {
    prevBtn.removeEventListener("click", prevGrammarHandler);
    prevBtn.addEventListener("click", prevGrammarHandler);
  }

  if (nextBtn) {
    nextBtn.removeEventListener("click", nextGrammarHandler);
    nextBtn.addEventListener("click", nextGrammarHandler);
  }

  // 문법 패턴 모드 버튼들
  const prevPatternBtn = document.getElementById("prev-pattern");
  const nextPatternBtn = document.getElementById("next-pattern");

  if (prevPatternBtn) {
    prevPatternBtn.removeEventListener("click", prevPatternHandler);
    prevPatternBtn.addEventListener("click", prevPatternHandler);
  }

  if (nextPatternBtn) {
    nextPatternBtn.removeEventListener("click", nextPatternHandler);
    nextPatternBtn.addEventListener("click", nextPatternHandler);
  }

  // 문법 실습 모드 버튼들
  const prevPracticeBtn = document.getElementById("prev-practice");
  const nextPracticeBtn = document.getElementById("next-practice");

  if (prevPracticeBtn) {
    prevPracticeBtn.removeEventListener("click", prevPracticeHandler);
    prevPracticeBtn.addEventListener("click", prevPracticeHandler);
  }

  if (nextPracticeBtn) {
    nextPracticeBtn.removeEventListener("click", nextPracticeHandler);
    nextPracticeBtn.addEventListener("click", nextPracticeHandler);
  }

  // 플래시카드 관련 버튼들 (단어 학습용) - 올바른 ID 사용
  const flipFlashcardBtn = document.getElementById("flip-flashcard-btn");
  if (
    flipFlashcardBtn &&
    !flipFlashcardBtn.hasAttribute("data-listener-added")
  ) {
    flipFlashcardBtn.addEventListener("click", flipCard);
    flipFlashcardBtn.setAttribute("data-listener-added", "true");
  }

  const prevFlashcardBtn = document.getElementById("prev-flashcard-btn");
  const nextFlashcardBtn = document.getElementById("next-flashcard-btn");

  if (
    prevFlashcardBtn &&
    !prevFlashcardBtn.hasAttribute("data-listener-added")
  ) {
    prevFlashcardBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      e.stopPropagation();
      await navigateContent(-1);
    });
    prevFlashcardBtn.setAttribute("data-listener-added", "true");
  }

  if (
    nextFlashcardBtn &&
    !nextFlashcardBtn.hasAttribute("data-listener-added")
  ) {
    nextFlashcardBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      e.stopPropagation();
      await navigateContent(1);
    });
    nextFlashcardBtn.setAttribute("data-listener-added", "true");
  }

  // 독해 예문 학습 네비게이션 버튼들
  const prevReadingExampleBtn = document.getElementById(
    "prev-reading-example-btn"
  );
  const nextReadingExampleBtn = document.getElementById(
    "next-reading-example-btn"
  );

  if (prevReadingExampleBtn) {
    prevReadingExampleBtn.removeEventListener("click", prevReadingHandler);
    prevReadingExampleBtn.addEventListener("click", prevReadingHandler);
  }

  if (nextReadingExampleBtn) {
    nextReadingExampleBtn.removeEventListener("click", nextReadingHandler);
    nextReadingExampleBtn.addEventListener("click", nextReadingHandler);
  }

  // 독해 플래시 학습 네비게이션 버튼들
  const prevReadingFlashBtn = document.getElementById("prev-reading-flash-btn");
  const nextReadingFlashBtn = document.getElementById("next-reading-flash-btn");

  if (prevReadingFlashBtn) {
    prevReadingFlashBtn.removeEventListener("click", prevReadingHandler);
    prevReadingFlashBtn.addEventListener("click", prevReadingHandler);
  }

  if (nextReadingFlashBtn) {
    nextReadingFlashBtn.removeEventListener("click", nextReadingHandler);
    nextReadingFlashBtn.addEventListener("click", nextReadingHandler);
  }

  // 타이핑 관련 버튼들
  const checkTypingAnswerBtn = document.getElementById(
    "check-typing-answer-btn"
  );
  if (checkTypingAnswerBtn) {
    checkTypingAnswerBtn.removeEventListener("click", checkTypingAnswer);
    checkTypingAnswerBtn.addEventListener("click", checkTypingAnswer);
  }

  const nextTypingBtn = document.getElementById("next-typing-btn");
  if (nextTypingBtn) {
    nextTypingBtn.removeEventListener("click", nextTypingHandler);
    nextTypingBtn.addEventListener("click", nextTypingHandler);
  }

  // 홈 버튼
  const homeBtn = document.getElementById("home-btn");
  if (homeBtn) {
    homeBtn.removeEventListener("click", showAreaSelection);
    homeBtn.addEventListener("click", showAreaSelection);
  }

  // 돌아가기 버튼들 설정
  const backToAreasBtn = document.getElementById("back-to-areas");
  if (backToAreasBtn) {
    backToAreasBtn.removeEventListener("click", backToAreasHandler);
    backToAreasBtn.addEventListener("click", backToAreasHandler);
  }

  // 모든 돌아가기 버튼들 설정
  const backButtons = [
    "back-from-vocabulary",
    "back-from-grammar",
    "back-from-reading",
    "back-from-flashcard",
    "back-from-typing",
    "back-to-dashboard-listening",
    "back-to-dashboard-pronunciation",
    "back-to-dashboard-pattern",
    "back-to-dashboard-practice",
    "back-to-dashboard-reading-example",
    "back-to-dashboard-reading-flash",
    "back-to-dashboard-nodata",
  ];

  backButtons.forEach((buttonId) => {
    const button = document.getElementById(buttonId);
    if (button) {
      button.removeEventListener("click", backToAreasHandler);
      button.addEventListener("click", backToAreasHandler);
    }
  });

  // 새로운 통합 버튼들 설정
  // 플래시카드 모드 버튼들 (기존 변수 사용)
  if (prevFlashcardBtn) {
    prevFlashcardBtn.removeEventListener("click", () => navigateContent(-1));
    prevFlashcardBtn.addEventListener("click", async () => await navigateContent(-1));
  }
  if (nextFlashcardBtn) {
    nextFlashcardBtn.removeEventListener("click", () => navigateContent(1));
    nextFlashcardBtn.addEventListener("click", async () => await navigateContent(1));
  }
  if (flipFlashcardBtn) {
    flipFlashcardBtn.removeEventListener("click", flipCard);
    flipFlashcardBtn.addEventListener("click", flipCard);
  }

  // 학습 종료 버튼들 설정
  const finishLearningButtons = [
    "finish-learning-flashcard",
    "finish-learning-typing",
    "finish-learning-listening",
    "finish-learning-grammar",
    "finish-learning-grammar-practice",
    "finish-learning-reading-example",
    "finish-learning-reading-flash",
  ];

  finishLearningButtons.forEach((buttonId) => {
    const button = document.getElementById(buttonId);
    if (button) {
      button.removeEventListener("click", finishLearningHandler);
      button.addEventListener("click", finishLearningHandler);
    }
  });

  // 타이핑 모드 버튼들
  const prevTypingBtnNew = document.getElementById("prev-typing-btn");
  const nextTypingBtnNew = document.getElementById("next-typing-btn");

  if (prevTypingBtnNew) {
    prevTypingBtnNew.removeEventListener("click", () => navigateContent(-1));
    prevTypingBtnNew.addEventListener("click", async () => await navigateContent(-1));
  }
  if (nextTypingBtnNew) {
    nextTypingBtnNew.removeEventListener("click", () => navigateContent(1));
    nextTypingBtnNew.addEventListener("click", async () => await navigateContent(1));
  }
  if (checkTypingAnswerBtn) {
    checkTypingAnswerBtn.removeEventListener("click", checkTypingAnswer);
    checkTypingAnswerBtn.addEventListener("click", checkTypingAnswer);
  }

  // 듣기 모드 버튼들
  const prevListeningBtn = document.getElementById("prev-listening-btn");
  const nextListeningBtn = document.getElementById("next-listening-btn");
  if (prevListeningBtn) {
    prevListeningBtn.removeEventListener("click", () => navigateContent(-1));
    prevListeningBtn.addEventListener("click", async () => await navigateContent(-1));
  }
  if (nextListeningBtn) {
    nextListeningBtn.removeEventListener("click", () => navigateContent(1));
    nextListeningBtn.addEventListener("click", async () => await navigateContent(1));
  }

  // 문법 실습 뒤집기 버튼
  const flipGrammarPracticeBtn = document.getElementById(
    "flip-grammar-practice-btn"
  );
  if (flipGrammarPracticeBtn) {
    flipGrammarPracticeBtn.removeEventListener("click", flipGrammarCard);
    flipGrammarPracticeBtn.addEventListener("click", flipGrammarCard);
  }

  // 대시보드로 돌아가기 버튼들
  // 우측 상단 돌아가기 버튼들 (기존 돌아가기 버튼이 없는 모드들)
  const backToDashboardBtns = [
    "back-to-dashboard-pronunciation",
    "back-to-dashboard-pattern",
    "back-to-dashboard-practice",
    "back-to-dashboard-nodata",
  ];

  backToDashboardBtns.forEach((btnId) => {
    const btn = document.getElementById(btnId);
    if (btn) {
      btn.removeEventListener("click", showAreaSelection);
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        showAreaSelection();
      });
    }
  });

  // 전역 이벤트 리스너 추가 (중복 방지)
  document.addEventListener("click", globalClickHandler);

  // 독해 플래시카드 뒤집기 버튼
  const flipReadingFlashBtn = document.getElementById("flip-reading-flash-btn");
  if (flipReadingFlashBtn) {
    flipReadingFlashBtn.removeEventListener("click", flipReadingCard);
    flipReadingFlashBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      // 플래시 모드일 때만 뒤집기 기능 작동
      if (currentLearningMode === "flash") {
        flipReadingCard();
      }
    });
  }
}

// 이벤트 핸들러 함수들 정의
async function prevGrammarHandler(e) {
  e.preventDefault();
  e.stopPropagation();
  await navigateContent(-1);
}

async function nextGrammarHandler(e) {
  e.preventDefault();
  e.stopPropagation();
  await navigateContent(1);
}

async function prevPatternHandler(e) {
  e.preventDefault();
  e.stopPropagation();
  await navigateContent(-1);
}

async function nextPatternHandler(e) {
  e.preventDefault();
  e.stopPropagation();
  await navigateContent(1);
}

async function prevPracticeHandler(e) {
  e.preventDefault();
  e.stopPropagation();
  await navigateContent(-1);
}

async function nextPracticeHandler(e) {
  e.preventDefault();
  e.stopPropagation();
  await navigateContent(1);
}

async function prevCardHandler(e) {
  e.preventDefault();
  e.stopPropagation();
  await navigateContent(-1);
}

async function nextCardHandler(e) {
  e.preventDefault();
  e.stopPropagation();
  await navigateContent(1);
}

async function prevReadingHandler(e) {
  e.preventDefault();
  e.stopPropagation();
  await navigateContent(-1);
}

async function nextReadingHandler(e) {
  e.preventDefault();
  e.stopPropagation();
  await navigateContent(1);
}

async function nextTypingHandler(e) {
  e.preventDefault();
  e.stopPropagation();
  await navigateContent(1);
  // 결과 숨기기
  const resultDiv = document.getElementById("typing-mode-result");
  if (resultDiv) {
    resultDiv.classList.add("hidden");
  }
}

function backToAreasHandler(e) {
  e.preventDefault();
  e.stopPropagation();

  // 🔄 학습 데이터 초기화 (새로운 데이터 로드를 위해)
  console.log("🔄 학습 데이터 초기화: 돌아가기 후 새로운 데이터 로드 준비");
  areaData = {
    vocabulary: [],
    grammar: [],
    reading: [],
  };

  // 🔧 모든 학습 상태 변수 초기화
  currentLearningArea = null;
  currentLearningMode = null;
  currentIndex = 0;
  isFlipped = false;
  isNavigating = false;

  // 🧹 학습 세션 데이터 초기화
  if (typeof learningSessionData !== "undefined") {
    learningSessionData = {
      area: null,
      mode: null,
      startTime: null,
      conceptsStudied: new Set(),
      totalInteractions: 0,
      correctAnswers: 0,
    };
  }

  console.log("🔧 플래시카드에서 돌아가기 - 모든 학습 상태 초기화 완료");

  showAreaSelection();
}

// 학습 종료 핸들러 - 중간에 학습을 완전히 종료하고 진도에 반영
async function finishLearningHandler(e) {
  e.preventDefault();
  e.stopPropagation();

  console.log("🏁 학습 종료 버튼 클릭 - 현재 진도 저장 후 종료");

  // 현재 학습 세션 상태 확인
  console.log("🔍 현재 학습 세션 상태:", {
    sessionActive: learningSessionData?.sessionActive,
    area: learningSessionData?.area,
    mode: learningSessionData?.mode,
    conceptsStudied: learningSessionData?.conceptsStudied?.size || 0,
    totalInteractions: learningSessionData?.totalInteractions || 0,
    correctAnswers: learningSessionData?.correctAnswers || 0,
    startTime: learningSessionData?.startTime,
  });

  // 현재 학습 세션 완료 처리
  if (typeof learningSessionData !== "undefined" && learningSessionData.area) {
    console.log("💾 학습 세션 완료 처리 중:", learningSessionData);

    // 세션 종료 시간 기록
    learningSessionData.endTime = new Date();
    learningSessionData.duration =
      learningSessionData.endTime - learningSessionData.startTime;

    // 🎯 중간 종료 시에는 최소 조건 무시하고 강제 저장
    const conceptsCount = learningSessionData.conceptsStudied.size;
    console.log(`💾 강제 세션 완료 처리: ${conceptsCount}개 개념 학습됨`);

    // learningSessionData 최소값 보장 - 실제 상호작용 수 사용
    if (learningSessionData.totalInteractions === 0 && conceptsCount > 0) {
      // 상호작용이 전혀 없었다면 최소 1회로 설정 (세션이 시작되었다는 의미)
      learningSessionData.totalInteractions = 1;
      learningSessionData.correctAnswers = 1;
    }

    // 학습 세션 완료 처리 (기존 함수 활용)
    try {
      const savedSessionData = await completeLearningSession(true); // forceComplete = true
      console.log("✅ 학습 세션 완료 처리 성공");

      // 모달에 표시할 데이터 (저장된 세션 데이터 사용)
      const sessionStats = {
        conceptsCount,
        duration: savedSessionData?.duration || 1,
        interactions:
          savedSessionData?.interactions ||
          learningSessionData.totalInteractions,
        efficiency: savedSessionData?.session_quality || 0, // 저장된 효율 값 사용
      };

      console.log("📋 학습 완료 팝업 데이터:", sessionStats);
      await showLearningCompleteWithStats(sessionStats);
      console.log("✅ 학습 완료 팝업 표시 완료 - 함수 종료");
    } catch (error) {
      console.error("❌ 학습 세션 완료 처리 실패:", error);

      // completeLearningSession이 실패하면 직접 저장 시도
      if (conceptsCount > 0) {
        try {
          const duration =
            Math.round(
              (learningSessionData.endTime - learningSessionData.startTime) /
                1000 /
                60
            ) || 1;
          // 🔥 learningSessionData 디버깅
          console.log("[DEBUG] learningSessionData:", {
            area: learningSessionData.area,
            mode: learningSessionData.mode,
            conceptsStudied: Array.from(learningSessionData.conceptsStudied),
            correctAnswers: learningSessionData.correctAnswers,
            totalInteractions: learningSessionData.totalInteractions,
          });

          const activityData = {
            type: learningSessionData.area,
            learning_mode: learningSessionData.mode,
            conceptIds: Array.from(learningSessionData.conceptsStudied),
            session_duration: Math.max(duration, 1),
            concepts_studied: conceptsCount,
            correct_answers: learningSessionData.correctAnswers,
            total_interactions: learningSessionData.totalInteractions,
            sourceLanguage: sourceLanguage || "korean",
            targetLanguage: targetLanguage || "english",
            session_quality: Math.min(100, conceptsCount * 10), // 간단한 품질 계산
            conceptType:
              learningSessionData.area === "reading"
                ? "examples"
                : learningSessionData.area, // conceptType 수정: reading → examples
          };

          if (
            typeof collectionManager !== "undefined" &&
            collectionManager.updateLearningActivity
          ) {
            await collectionManager.updateLearningActivity(
              currentUser.email,
              activityData
            );
            console.log("✅ 직접 학습 기록 저장 성공");
          }
        } catch (directSaveError) {
          console.error("❌ 직접 학습 기록 저장도 실패:", directSaveError);
        }
      }
    }
  }

  // 학습한 개념 수 계산
  const conceptsCount = learningSessionData.conceptsStudied.size;

  // 학습 완료 팝업 표시 (세션 완료 후)
  if (conceptsCount > 0) {
    console.log("🎉 학습 종료 - 완료 팝업 표시");
    console.log("📊 학습 완료 통계:", {
      conceptsCount,
      duration:
        Math.round(
          (learningSessionData.endTime - learningSessionData.startTime) /
            1000 /
            60
        ) || 1,
      interactions: learningSessionData.totalInteractions,
      correctAnswers: learningSessionData.correctAnswers,
    });

    // 완료 팝업에 필요한 통계 계산
    const duration =
      Math.round(
        (learningSessionData.endTime - learningSessionData.startTime) /
          1000 /
          60
      ) || 1;

    // 전체 데이터 수 가져오기 (저장 시 계산과 동일하게)
    const currentData = getCurrentData();
    const totalAvailableData = currentData ? currentData.length : conceptsCount;

    // 학습 효율 계산 (Firebase 저장과 동일한 방식)
    let baseScore;
    if (currentLearningArea === "reading" && currentLearningMode === "flash") {
      // 독해 플래시 모드: 모든 카드를 본 것을 기준으로 기본 점수
      const allConceptsPresented =
        conceptsCount >= Math.min(10, totalAvailableData);
      baseScore = allConceptsPresented
        ? 60
        : (conceptsCount / totalAvailableData) * 60;
    } else if (
      learningSessionData.mode === "flashcard" ||
      learningSessionData.mode === "listening" ||
      learningSessionData.mode === "example"
    ) {
      // presentation 기반 모드: 실제 비율로 계산
      baseScore = Math.min(60, (conceptsCount / totalAvailableData) * 60);
    } else {
      // 기존 방식 (typing, pattern, practice 등): 실제 학습한 개념 수 기준
      baseScore = Math.min(60, conceptsCount * 6);
    }
  } else {
    console.log("🏁 학습 종료 - 학습한 개념이 없어 바로 영역 선택으로 이동");
    // 🔄 학습 데이터 초기화
    console.log("🔄 학습 데이터 초기화: 학습 종료 후 초기화");
    areaData = {
      vocabulary: [],
      grammar: [],
      reading: [],
    };

    // 🔧 모든 학습 상태 변수 초기화
    currentLearningArea = null;
    currentLearningMode = null;
    currentIndex = 0;
    sessionOffset = 0; // 세션 오프셋 리셋
    isFlipped = false;
    isNavigating = false;

    // 🧹 학습 세션 데이터 초기화
    if (typeof learningSessionData !== "undefined") {
      learningSessionData = {
        area: null,
        mode: null,
        startTime: null,
        conceptsStudied: new Set(),
        totalInteractions: 0,
        correctAnswers: 0,
      };
    }

    showAreaSelection();
  }
}

// 전역 클릭 핸들러
function globalClickHandler(e) {
  // 돌아가기 버튼 처리 (우선순위 높음)
  if (
    e.target.id === "back-from-flashcard" ||
    e.target.closest("#back-from-flashcard")
  ) {
    e.preventDefault();
    e.stopPropagation();
    console.log("🔙 back-from-flashcard 버튼 클릭 (globalClickHandler)");
    backToAreasHandler(e);
    return;
  }

  // 다른 돌아가기 버튼들도 처리
  const backButtonIds = [
    "back-from-vocabulary",
    "back-from-grammar",
    "back-from-reading",
    "back-from-typing",
    "back-to-dashboard-pronunciation",
    "back-to-dashboard-pattern",
    "back-to-dashboard-practice",
    "back-to-dashboard-nodata",
  ];

  for (const buttonId of backButtonIds) {
    if (e.target.id === buttonId || e.target.closest(`#${buttonId}`)) {
      e.preventDefault();
      e.stopPropagation();
      console.log(`🔙 ${buttonId} 버튼 클릭 (globalClickHandler)`);
      backToAreasHandler(e);
      return;
    }
  }

  // 홈 버튼 (중복 ID 처리)
  if (e.target.id === "home-btn" || e.target.matches(".home-btn")) {
    e.preventDefault();
    e.stopPropagation();
    console.log("🏠 홈 버튼 클릭");
    showAreaSelection();
    return;
  }

  // 단어 학습 플래시카드 뒤집기
  if (e.target.closest("#flashcard-mode-card")) {
    e.preventDefault();
    e.stopPropagation();
    console.log("🔄 단어 학습 플래시카드 클릭");
    console.log("🔍 현재 학습 모드:", currentLearningMode);
    // 플래시카드 모드일 때만 뒤집기 기능 작동
    if (currentLearningMode === "flashcard") {
      console.log("✅ 플래시카드 모드 확인됨, 뒤집기 실행");
      flipCard();
    } else {
      console.log("❌ 플래시카드 모드가 아님, 뒤집기 실행 안함");
    }
    return;
  }

  // 문법 카드 뒤집기
  if (e.target.matches("#grammar-card, #grammar-card *")) {
    e.preventDefault();
    e.stopPropagation();
    console.log("🔄 문법 카드 뒤집기");
    flipGrammarCard();
    return;
  }

  // 독해 플래시 카드 뒤집기
  if (e.target.closest("#reading-flash-card")) {
    // 카드 뒤집기
    e.preventDefault();
    e.stopPropagation();
    console.log("🔄 독해 플래시 카드 클릭");
    console.log("🔍 현재 학습 모드:", currentLearningMode);
    // 플래시 모드일 때만 뒤집기 기능 작동
    if (currentLearningMode === "flash") {
      console.log("✅ 플래시 모드 확인됨, 뒤집기 실행");
      flipReadingCard();
    } else {
      console.log("❌ 플래시 모드가 아님, 뒤집기 실행 안함");
    }
    return;
  }

  // 삭제 버튼 처리
  if (e.target.matches(".delete-btn")) {
    e.preventDefault();
    e.stopPropagation();
    const itemId = e.target.getAttribute("data-item-id");
    const itemType = e.target.getAttribute("data-item-type");
    console.log(`🗑️ 삭제 버튼 클릭: ${itemType} - ${itemId}`);
    deleteItem(itemId, itemType);
    return;
  }
}

async function showAreaSelection() {
  console.log("🏠 통합 학습 대시보드 표시");
  hideAllSections();

  // 학습 모드 비활성화 시 body에서 클래스 제거 (통계 카드 표시용)
  document.body.classList.remove("learning-mode-active");

  const areaSelection = document.getElementById("area-selection");
  if (areaSelection) {
    areaSelection.classList.remove("hidden");
  }

  // 번역 적용
  setTimeout(() => {
    applyTranslations();
    applyAdditionalTranslations();
  }, 50);

  // 통합 학습 모드 카드들에 이벤트 리스너 추가
  const modeCards = document.querySelectorAll(".learning-mode-card");
  console.log(`🎯 통합 학습 모드 카드 ${modeCards.length}개 발견`);

  if (modeCards.length === 0) {
    console.warn(
      "⚠️ 학습 모드 카드를 찾을 수 없습니다. HTML 구조를 확인해주세요."
    );
  }

  modeCards.forEach((card, index) => {
    const area = card.getAttribute("data-area");
    const mode = card.getAttribute("data-mode");
    console.log(`🔍 카드 ${index + 1}: ${area} - ${mode}`);

    // 이미 이벤트 리스너가 있는지 확인
    if (!card.hasAttribute("data-listener-added")) {
      card.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        const cardArea = this.getAttribute("data-area");
        const cardMode = this.getAttribute("data-mode");
        console.log(`🎯 통합 학습 모드 카드 클릭됨: ${cardArea} - ${cardMode}`);

        if (cardArea && cardMode) {
          // 로딩 표시
          showLoadingState(this);
          // 바로 학습 모드 시작
          startLearningMode(cardArea, cardMode);
        } else {
          console.error("❌ data-area 또는 data-mode 속성이 없습니다.");
        }
      });
      card.setAttribute("data-listener-added", "true");
      console.log(`✅ 카드 ${index + 1}에 이벤트 리스너 추가됨`);
    } else {
      console.log(`⚠️ 카드 ${index + 1}에 이미 이벤트 리스너가 있습니다.`);
    }
  });

  // 학습 이어하기 버튼 이벤트 리스너
  const quickContinueBtn = document.getElementById("quick-continue");
  if (
    quickContinueBtn &&
    !quickContinueBtn.hasAttribute("data-listener-added")
  ) {
    quickContinueBtn.addEventListener("click", function (e) {
      e.preventDefault();
      const lastArea = sessionStorage.getItem("lastLearningArea");
      const lastMode = sessionStorage.getItem("lastLearningMode");
      if (lastArea && lastMode) {
        console.log(`🔄 학습 이어하기: ${lastArea} - ${lastMode}`);
        startLearningMode(lastArea, lastMode);
      }
    });
    quickContinueBtn.setAttribute("data-listener-added", "true");
  }

  // 최근 학습 기록 표시
  await updateRecentActivity();
}

// 로딩 상태 표시 함수
function showLoadingState(card) {
  const originalContent = card.innerHTML;
  card.innerHTML = `
    <div class="flex items-center justify-center h-full">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              <span class="ml-3 text-white">${getTranslatedText(
                "loading"
              )}</span>
    </div>
  `;

  // 3초 후 원래 내용으로 복원 (에러 방지)
  setTimeout(() => {
    if (card.innerHTML.includes(getTranslatedText("loading"))) {
      card.innerHTML = originalContent;
    }
  }, 3000);
}

// 최근 활동 업데이트
async function updateRecentActivity() {
  const recentActivityEl = document.getElementById("recent-activity");

  // 학습 기록에서 최근 3개 가져오기
  let learningHistory = JSON.parse(
    localStorage.getItem("learningHistory") || "[]"
  );

  // Firebase에서 추가 학습 기록 가져오기 (로그인된 경우)
  try {
    if (
      window.firebaseInit &&
      window.firebaseInit.auth &&
      window.firebaseInit.auth.currentUser
    ) {
      const user = window.firebaseInit.auth.currentUser;
      const userRef = window.firebaseInit.doc(
        window.firebaseInit.db,
        "users",
        user.email
      );
      const userDoc = await window.firebaseInit.getDoc(userRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const firebaseHistory = userData.learning_history || [];

        // Firebase 데이터와 로컬 데이터 병합 (중복 제거)
        const combinedHistory = [...learningHistory];
        firebaseHistory.forEach((record) => {
          const exists = combinedHistory.some(
            (local) =>
              local.timestamp === record.timestamp &&
              local.area === record.area &&
              local.mode === record.mode
          );
          if (!exists) {
            combinedHistory.push(record);
          }
        });

        learningHistory = combinedHistory;
      }
    }
  } catch (error) {
    console.warn("📊 Firebase 학습 기록 로드 실패:", error);
  }

  // 시간순 정렬 후 최근 3개만 가져오기
  const recentActivities = learningHistory
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 3);

  if (recentActivities.length > 0) {
    const activitiesHTML = recentActivities
      .map((activity) => {
        const timeAgo = getTimeAgo(new Date(activity.timestamp));
        const areaName = getAreaName(activity.area);
        const modeName = getModeName(activity.mode);

        return `
        <div class="mb-2 p-2 bg-white rounded border-l-4 border-blue-200">
          <div class="text-sm flex justify-between items-center">
            <div class="flex items-center">
              <span class="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full mr-2">${areaName}</span>
              <span>${modeName}</span>
            </div>
            <span class="text-gray-500 text-xs">${timeAgo}</span>
          </div>
        </div>
      `;
      })
      .join("");

    recentActivityEl.innerHTML = activitiesHTML;

    // 학습 이어하기 버튼 표시 (가장 최근 학습 기준)
    const quickContinueBtn = document.getElementById("quick-continue");
    if (quickContinueBtn) {
      quickContinueBtn.classList.remove("hidden");
    }
  } else {
    // 최근 학습 기록이 없는 경우 메시지 표시
    recentActivityEl.innerHTML = `
      <div class="text-sm text-gray-500">
        <div>${getTranslatedText("no_recent_activity")}</div>
        <div class="text-xs">${getTranslatedText("start_new_learning")}</div>
      </div>
    `;
  }

  // 추천 학습도 함께 업데이트
  await updateRecommendedLearning();
}

// 추천 학습 업데이트 (실제 학습 패턴 기반)
async function updateRecommendedLearning() {
  const recommendedEl = document.getElementById("recommended-mode");

  // 학습 기록에서 패턴 분석 (로컬 + Firebase 데이터 결합)
  let learningHistory = JSON.parse(
    localStorage.getItem("learningHistory") || "[]"
  );

  // Firebase에서 추가 학습 기록 가져오기 (로그인된 경우)
  try {
    if (
      window.firebaseInit &&
      window.firebaseInit.auth &&
      window.firebaseInit.auth.currentUser
    ) {
      const user = window.firebaseInit.auth.currentUser;
      const userRef = window.firebaseInit.doc(
        window.firebaseInit.db,
        "users",
        user.email
      );
      const userDoc = await window.firebaseInit.getDoc(userRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const firebaseHistory = userData.learning_history || [];

        // Firebase 데이터와 로컬 데이터 병합 (중복 제거)
        const combinedHistory = [...learningHistory];
        firebaseHistory.forEach((record) => {
          const exists = combinedHistory.some(
            (local) =>
              local.timestamp === record.timestamp &&
              local.area === record.area &&
              local.mode === record.mode
          );
          if (!exists) {
            combinedHistory.push(record);
          }
        });

        // 시간순 정렬 후 최근 5개만 유지 (최근 활동 표시용)
        learningHistory = combinedHistory
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
          .slice(0, 5);

        console.log(
          "📊 Firebase 학습 기록과 병합 완료 (최근 5개만):",
          learningHistory.length
        );
      }
    }
  } catch (error) {
    console.warn("📊 Firebase 학습 기록 로드 실패:", error);
  }

  // 🔧 추천 시스템 최적화: 최근 7일 데이터만 사용 (DB 조회 최소화)
  const lastWeekHistory = learningHistory.filter((record) => {
    const recordDate = new Date(record.timestamp);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return recordDate > weekAgo;
  });

  let recommendation = getSmartRecommendation(lastWeekHistory);

  recommendedEl.innerHTML = `
    <div class="text-xs text-gray-500 mb-3">
      ${recommendation.reason}
    </div>
    <div class="space-y-2">
      <div class="flex items-center justify-between p-2 bg-white rounded border cursor-pointer hover:bg-gray-50" 
           onclick="startLearningMode('${recommendation.area}', '${recommendation.mode}')">
        <div class="flex items-center">
          <i class="${recommendation.icon} text-${recommendation.color}-500 mr-2"></i>
          <div>
            <div class="font-medium">${recommendation.title}</div>
            <div class="text-xs text-gray-500">${recommendation.subtitle}</div>
          </div>
        </div>
        <span class="text-xs text-green-600 font-medium" data-i18n="recommended">추천</span>
      </div>
    </div>
  `;
}

// 스마트 추천 로직
function getSmartRecommendation(history) {
  // 기본 추천
  let recommendation = {
    area: "vocabulary",
    mode: "flashcard",
    title: getTranslatedText("vocabulary_flashcard"),
    subtitle: getTranslatedText("basic_vocabulary_learning"),
    icon: "fas fa-clone",
    color: "blue",
    reason: getTranslatedText("recommendation_reason"),
  };

  if (history.length === 0) {
    return recommendation;
  }

  // 최근 학습 패턴 분석
  const areaCounts = {};
  const modeCounts = {};
  const recentAreas = [];

  history.forEach((record) => {
    areaCounts[record.area] = (areaCounts[record.area] || 0) + 1;
    modeCounts[record.mode] = (modeCounts[record.mode] || 0) + 1;
    recentAreas.push(record.area);
  });

  // 가장 많이 학습한 영역
  const mostStudiedArea = Object.keys(areaCounts).reduce((a, b) =>
    areaCounts[a] > areaCounts[b] ? a : b
  );

  // 최근 3일간 학습하지 않은 영역 찾기
  const recent3Days = history.filter((record) => {
    const recordDate = new Date(record.timestamp);
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    return recordDate > threeDaysAgo;
  });

  const recent3DaysAreas = [...new Set(recent3Days.map((r) => r.area))];
  const allAreas = ["vocabulary", "grammar", "reading"];
  const neglectedAreas = allAreas.filter(
    (area) => !recent3DaysAreas.includes(area)
  );

  // 추천 로직
  if (neglectedAreas.length > 0) {
    // 소홀한 영역 추천
    const neglectedArea = neglectedAreas[0];
    const modes = {
      vocabulary: { mode: "flashcard", icon: "fas fa-clone", color: "blue" },
      grammar: { mode: "pattern", icon: "fas fa-search", color: "green" },
      reading: { mode: "flash", icon: "fas fa-bolt", color: "purple" },
    };

    recommendation = {
      area: neglectedArea,
      mode: modes[neglectedArea].mode,
      title: `${getAreaName(neglectedArea)} - ${getModeName(
        modes[neglectedArea].mode
      )}`,
      subtitle: getTranslatedText("balanced_learning"),
      icon: modes[neglectedArea].icon,
      color: modes[neglectedArea].color,
      reason: getTranslatedText("neglected_area"),
    };
  } else if (mostStudiedArea) {
    // 가장 많이 학습한 영역의 다른 모드 추천
    const areaHistory = history.filter((r) => r.area === mostStudiedArea);
    const usedModes = [...new Set(areaHistory.map((r) => r.mode))];

    const allModes = {
      vocabulary: ["flashcard", "typing"],
      grammar: ["pattern", "practice"],
      reading: ["example", "flash"],
    };

    const unusedModes = allModes[mostStudiedArea]?.filter(
      (mode) => !usedModes.includes(mode)
    );

    if (unusedModes && unusedModes.length > 0) {
      const recommendedMode = unusedModes[0];
      const modeIcons = {
        flashcard: "fas fa-clone",
        typing: "fas fa-keyboard",
        pronunciation: "fas fa-microphone",
        pattern: "fas fa-search",
        practice: "fas fa-edit",
        example: "fas fa-book-open",
        flash: "fas fa-bolt",
      };

      recommendation = {
        area: mostStudiedArea,
        mode: recommendedMode,
        title: `${getAreaName(mostStudiedArea)} - ${getModeName(
          recommendedMode
        )}`,
        subtitle: getTranslatedText("new_learning_method"),
        icon: modeIcons[recommendedMode] || "fas fa-star",
        color:
          mostStudiedArea === "vocabulary"
            ? "blue"
            : mostStudiedArea === "grammar"
            ? "green"
            : "purple",
        reason: getTranslatedText("recommendation_reason"),
      };
    }
  }

  return recommendation;
}

// 시간 차이 계산
function getTimeAgo(date) {
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins}${getTranslatedText("minutes_ago")}`;
  if (diffHours < 24) return `${diffHours}${getTranslatedText("hours_ago")}`;
  return `${diffDays}${getTranslatedText("days_ago")}`;
}

// 영역 이름 가져오기
function getAreaName(area) {
  const names = {
    vocabulary: getTranslatedText("vocabulary_learning"),
    grammar: getTranslatedText("grammar_learning"),
    reading: getTranslatedText("reading_learning"),
  };
  return names[area] || area;
}

// 모드 이름 가져오기
function getModeName(mode) {
  const names = {
    flashcard: getTranslatedText("flashcard_mode"),
    typing: getTranslatedText("typing_mode"),
    pronunciation: getTranslatedText("pronunciation_mode"),
    pattern: getTranslatedText("pattern_mode"),
    practice: getTranslatedText("practice_mode"),
    example: getTranslatedText("example_mode"),
    flash: getTranslatedText("flash_mode"),
  };
  return names[mode] || mode;
}

// 데이터 프리로딩 (백그라운드에서 미리 로드)
// 📝 프리로딩 설명:
// - 화면 표시와 무관하게 백그라운드에서 데이터를 미리 로드
// - 사용자가 학습 모드를 클릭했을 때 즉시 시작 가능
// - 프리로딩이 완료되지 않아도 화면은 정상 표시됨
// - 프리로딩 실패 시 일반 로드 방식으로 자동 전환
//
// 🚀 효율성 및 비용 최적화:
// - 모든 DB 데이터를 다운로드하지 않음 (limit 적용)
// - 단어: 최대 50개, 문법: 최대 30개, 독해: 최대 20개만 프리로드
// - 필터링된 데이터만 로드하여 트래픽 최소화
// - 사용자가 실제 학습을 시작할 때만 추가 데이터 로드
let preloadedData = {
  vocabulary: null,
  grammar: null,
  reading: null,
};

// 페이지 로드 시 데이터 프리로딩 시작
function startDataPreloading() {
  console.log("🔄 데이터 프리로딩 시작 (백그라운드)");
  console.log("📌 프리로딩은 화면 표시와 무관하게 진행됩니다");

  // 각 영역별로 순차적으로 프리로드 (동시에 하면 부하가 클 수 있음)
  setTimeout(() => preloadAreaData("vocabulary"), 1000);
  setTimeout(() => preloadAreaData("grammar"), 2000);
  setTimeout(() => preloadAreaData("reading"), 3000);

  // 상황 및 목적 필터 옵션 로드
  setTimeout(() => loadSituationAndPurposeFilterOptions(), 500);
}

// 특정 영역 데이터 프리로드
async function preloadAreaData(area) {
  if (preloadedData[area]) return; // 이미 로드됨

  try {
    console.log(`📦 ${area} 데이터 프리로딩 중...`);

    let data = [];
    switch (area) {
      case "vocabulary":
        data = await loadVocabularyData(20); // 프리로딩 시 20개
        break;
      case "grammar":
        data = await loadGrammarData(20); // 프리로딩 시 20개
        break;
      case "reading":
        data = await loadReadingData(20); // 프리로딩 시 20개
        break;
    }

    if (data && data.length > 0) {
      preloadedData[area] = data;
      console.log(`✅ ${area} 데이터 프리로딩 완료: ${data.length}개`);
    }
  } catch (error) {
    console.warn(`⚠️ ${area} 데이터 프리로딩 실패:`, error);
  }
}

// 프리로드된 데이터 사용하도록 loadLearningData 수정
async function loadLearningDataOptimized(area) {
  console.log(`📚 ${area} 학습 데이터 로드 시작`);

  // 프리로드된 데이터가 있으면 사용
  if (preloadedData[area]) {
    console.log(`⚡ ${area} 프리로드된 데이터 사용`);
    currentData = applyFilters(preloadedData[area]);
    return;
  }

  // 프리로드된 데이터가 없으면 일반 로드
  await loadLearningData(area);
}

// 번역 텍스트 가져오기 함수
function getTranslatedText(key) {
  // window.translations 사용
  if (window.translations && window.translations[currentUILanguage]) {
    // 상황과 목적 필터의 경우 접두사 추가
    let translationKey = key;
    if (
      [
        "formal",
        "casual",
        "polite",
        "urgent",
        "work",
        "school",
        "social",
        "travel",
        "shopping",
        "home",
        "public",
        "online",
        "medical",
      ].includes(key)
    ) {
      translationKey = `situation_${key}`;
    } else if (
      [
        "greeting",
        "thanking",
        "request",
        "question",
        "opinion",
        "agreement",
        "refusal",
        "apology",
        "instruction",
        "description",
        "suggestion",
        "emotion",
      ].includes(key)
    ) {
      translationKey = `purpose_${key}`;
    }

    return (
      window.translations[currentUILanguage][translationKey] ||
      window.translations[currentUILanguage][key] ||
      key
    );
  }

  // 기본 번역 (하위 호환성)
  const translations = {
    ko: {
      vocabulary: "단어",
      grammar: "문법",
      reading: "독해",
      flashcards: "플래시카드",
      typing: "타이핑",
      pronunciation: "발음",
      pattern: "패턴",
      practice: "연습",
      example: "예시",
      flash: "플래시",
    },
    en: {
      vocabulary: "Vocabulary",
      grammar: "Grammar",
      reading: "Reading",
      flashcards: "Flashcards",
      typing: "Typing",
      pronunciation: "Pronunciation",
      pattern: "Pattern",
      practice: "Practice",
      example: "Example",
      flash: "Flash",
    },
    ja: {
      vocabulary: "単語",
      grammar: "文法",
      reading: "読解",
      flashcards: "フラッシュカード",
      typing: "タイピング",
      pronunciation: "発音",
      pattern: "パターン",
      practice: "練習",
      example: "例",
      flash: "フラッシュ",
    },
    zh: {
      vocabulary: "词汇",
      grammar: "语法",
      reading: "阅读",
      flashcards: "闪卡",
      typing: "打字",
      pronunciation: "发音",
      pattern: "模式",
      practice: "练习",
      example: "例子",
      flash: "闪现",
    },
    es: {
      vocabulary: "Vocabulario",
      grammar: "Gramática",
      reading: "Lectura",
      flashcards: "Tarjetas Flash",
      typing: "Escritura",
      pronunciation: "Pronunciación",
      pattern: "Patrón",
      practice: "Práctica",
      example: "Ejemplo",
      flash: "Flash",
    },
  };

  return translations[currentUILanguage]?.[key] || key;
}

// 필터 옵션 업데이트 함수 (언어 변경 시 호출)
function updateFilterOptionsLanguage() {
  loadSituationAndPurposeFilterOptions();

  // 난이도 필터 옵션 번역 업데이트
  const difficultyFilter = document.getElementById("difficulty-level");
  if (difficultyFilter) {
    const currentValue = difficultyFilter.value;
    Array.from(difficultyFilter.options).forEach((option) => {
      const i18nKey = option.getAttribute("data-i18n");
      if (
        i18nKey &&
        window.translations &&
        window.translations[currentUILanguage]
      ) {
        const translation = window.translations[currentUILanguage][i18nKey];
        if (translation) {
          option.textContent = translation;
        }
      }
    });
    difficultyFilter.value = currentValue;
  }
}

// 전역 함수로 등록
window.updateFilterOptionsLanguage = updateFilterOptionsLanguage;

// 상황 및 목적 필터 옵션 동적 로드
async function loadSituationAndPurposeFilterOptions() {
  try {
    console.log("🏷️ 상황 및 목적 필터 옵션 로드 중...");

    // 상황 태그 목록 정의
    const situationTags = [
      "formal", // 격식
      "casual", // 비격식
      "polite", // 정중한
      "urgent", // 긴급한
      "work", // 직장
      "school", // 학교
      "social", // 사교
      "travel", // 여행
      "shopping", // 쇼핑
      "home", // 가정
      "public", // 공공장소
      "online", // 온라인
      "medical", // 의료
    ];

    // 목적 태그 목록 정의
    const purposeTags = [
      "greeting", // 인사
      "thanking", // 감사
      "request", // 요청
      "question", // 질문
      "opinion", // 의견
      "agreement", // 동의
      "refusal", // 거절
      "apology", // 사과
      "instruction", // 지시
      "description", // 설명
      "suggestion", // 제안
      "emotion", // 감정표현
    ];

    // 상황 필터 옵션 생성 (데스크톱과 모바일)
    const situationFilters = [
      document.getElementById("situation-filter"),
      document.getElementById("situation-filter-mobile"),
    ];

    situationFilters.forEach((situationFilter) => {
      if (situationFilter) {
        // 기존 옵션 제거 (전체 상황 옵션 제외)
        const allSituationOption = situationFilter.querySelector(
          'option[value="all"]'
        );
        situationFilter.innerHTML = "";
        if (allSituationOption) {
          situationFilter.appendChild(allSituationOption);
        }

        // 상황 태그 옵션 추가 (환경 언어에 맞게 번역)
        situationTags.forEach((tag) => {
          const option = document.createElement("option");
          option.value = tag;
          option.textContent = getTranslatedText(tag) || tag;
          situationFilter.appendChild(option);
        });
      }
    });

    console.log(`✅ 상황 필터 옵션 로드 완료: ${situationTags.length}개 태그`);

    // 목적 필터 옵션 생성 (데스크톱과 모바일)
    const purposeFilters = [
      document.getElementById("purpose-filter"),
      document.getElementById("purpose-filter-mobile"),
    ];

    purposeFilters.forEach((purposeFilter) => {
      if (purposeFilter) {
        // 기존 옵션 제거 (전체 목적 옵션 제외)
        const allPurposeOption = purposeFilter.querySelector(
          'option[value="all"]'
        );
        purposeFilter.innerHTML = "";
        if (allPurposeOption) {
          purposeFilter.appendChild(allPurposeOption);
        }

        // 목적 태그 옵션 추가 (환경 언어에 맞게 번역)
        purposeTags.forEach((tag) => {
          const option = document.createElement("option");
          option.value = tag;
          option.textContent = getTranslatedText(tag) || tag;
          purposeFilter.appendChild(option);
        });
      }
    });

    console.log(`✅ 목적 필터 옵션 로드 완료: ${purposeTags.length}개 태그`);
  } catch (error) {
    console.error("❌ 상황 및 목적 필터 옵션 로드 실패:", error);
  }
}

function showLearningModes(area) {
  console.log(`📖 학습 모드 선택 화면 표시: ${area}`);

  const modeSection = document.getElementById("mode-selection");
  const modeTitle = document.getElementById("mode-title");
  const modeContainer = document.getElementById("mode-container");
  const uploadBtn = document.getElementById("mode-upload-btn");
  const uploadTitle = document.getElementById("mode-upload-title");

  // 업로드 버튼 숨김 처리 (사용하지 않음)
  if (uploadBtn) uploadBtn.classList.add("hidden");
  if (uploadTitle) uploadTitle.classList.add("hidden");

  if (!modeSection || !modeTitle || !modeContainer) {
    console.error("❌ 모드 선택 요소들을 찾을 수 없음");
    alert("페이지 요소를 찾을 수 없습니다. 페이지를 새로고침해주세요.");
    return;
  }

  // 영역 선택 화면은 유지하고 모드 선택만 표시
  // hideAllSections() 대신 개별 학습 모드 섹션만 숨김
  hideLearningModeSections();

  let title = "";
  let modes = [];

  switch (area) {
    case "vocabulary":
      title = "vocabulary_learning_modes";
      modes = [
        {
          id: "flashcard",
          nameKey: "flashcard_mode",
          icon: "fas fa-clone",
          color: "blue",
          descriptionKey: "flashcard_mode_desc",
        },
        {
          id: "typing",
          nameKey: "typing_mode",
          icon: "fas fa-keyboard",
          color: "green",
          descriptionKey: "typing_mode_desc",
        },
        {
          id: "pronunciation",
          nameKey: "pronunciation_mode",
          icon: "fas fa-microphone",
          color: "purple",
          descriptionKey: "pronunciation_mode_desc",
        },
      ];
      break;
    case "grammar":
      title = "grammar_learning_modes";
      modes = [
        {
          id: "pattern",
          nameKey: "pattern_analysis_mode",
          icon: "fas fa-search",
          color: "blue",
          descriptionKey: "pattern_analysis_mode_desc",
        },
        {
          id: "practice",
          nameKey: "practice_mode",
          icon: "fas fa-edit",
          color: "green",
          descriptionKey: "practice_mode_desc",
        },
      ];
      break;
    case "reading":
      title = "reading_learning_modes";
      modes = [
        {
          id: "example",
          nameKey: "example_learning_mode",
          icon: "fas fa-book-open",
          color: "blue",
          descriptionKey: "example_learning_mode_desc",
        },
        {
          id: "flash",
          nameKey: "flash_mode",
          icon: "fas fa-bolt",
          color: "purple",
          descriptionKey: "flash_mode_desc",
        },
      ];
      break;
    default:
      console.error(`❌ 알 수 없는 학습 영역: ${area}`);
      return;
  }

  modeTitle.setAttribute("data-i18n", title);
  modeContainer.innerHTML = modes
    .map(
      (mode) => `
    <div class="learning-mode-card bg-gradient-to-br from-${
      mode.color
    }-500 to-${
        mode.color
      }-600 text-white p-6 rounded-lg cursor-pointer hover:from-${
        mode.color
      }-600 hover:to-${
        mode.color
      }-700 transition-all duration-300 transform hover:scale-105"
         data-area="${area}" data-mode="${mode.id}">
      <div class="flex items-center justify-center mb-4">
        <i class="${mode.icon} text-4xl"></i>
      </div>
      <div class="text-center">
      <div class="font-bold text-xl mb-2" data-i18n="${
        mode.nameKey
      }">Loading...</div>
        ${
          mode.descriptionKey
            ? `<p class="text-sm opacity-90 leading-tight" data-i18n="${mode.descriptionKey}">Loading...</p>`
            : ""
        }
      </div>
    </div>
  `
    )
    .join("");

  console.log("🔧 모드 선택 HTML 생성 완료:", modes.length, "개 모드");
  console.log("🖥️ 모드 선택 섹션 표시...");

  modeSection.classList.remove("hidden");

  // 번역 적용
  setTimeout(() => {
    applyTranslations();
    applyAdditionalTranslations();
  }, 50);

  // 학습 모드 카드들에 이벤트 리스너 추가
  const modeCards = modeContainer.querySelectorAll(".learning-mode-card");
  console.log(`🎯 학습 모드 카드 ${modeCards.length}개에 이벤트 리스너 추가`);

  modeCards.forEach((card, index) => {
    const cardArea = card.getAttribute("data-area");
    const cardMode = card.getAttribute("data-mode");
    console.log(`🔍 모드 카드 ${index + 1}: ${cardArea} - ${cardMode}`);

    card.addEventListener(
      "click",
      function (e) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();

        console.log(`🎯 학습 모드 카드 직접 클릭: ${cardArea} - ${cardMode}`);

        if (cardArea && cardMode) {
          console.log(`✅ startLearningMode 호출: ${cardArea} - ${cardMode}`);
          startLearningMode(cardArea, cardMode);
        } else {
          console.error("❌ data-area 또는 data-mode 속성이 없습니다.");
        }
      },
      { capture: true }
    );

    console.log(`✅ 모드 카드 ${index + 1}에 새 이벤트 리스너 추가됨`);
  });

  console.log(
    "✅ 모드 선택 화면 표시 완료, 섹션 visible:",
    !modeSection.classList.contains("hidden")
  );
}

window.startLearningMode = async function startLearningMode(area, mode) {
  console.log(`🎯 학습 모드 시작: ${area} - ${mode}`);

  // 이전 세션이 있다면 완료 처리
  if (learningSessionData.sessionActive) {
    await completeLearningSession();
  }

  // 새 학습 세션 시작
  startLearningSession(area, mode);

  // 학습 모드 활성화 시 body에 클래스 추가 (통계 카드 숨김용)
  document.body.classList.add("learning-mode-active");

  // 🔧 학습 상태 완전 초기화
  currentLearningArea = area;
  currentLearningMode = mode;
  currentIndex = 0;
  isFlipped = false;
  isNavigating = false;

  console.log("🔧 새로운 학습 모드 시작 - 모든 상태 초기화 완료");

  // 학습 기록 저장
  try {
    const learningRecord = {
      area: area,
      mode: mode,
      timestamp: new Date().toISOString(),
      date: new Date().toDateString(),
    };

    // 최근 학습 기록 업데이트 (localStorage)
    let recentLearning = JSON.parse(
      localStorage.getItem("recentLearning") || "[]"
    );
    recentLearning.unshift(learningRecord);
    recentLearning = recentLearning.slice(0, 5); // 최근 5개만 유지
    localStorage.setItem("recentLearning", JSON.stringify(recentLearning));

    // sessionStorage에도 최근 학습 정보 저장 (최근 학습 활동 표시용)
    sessionStorage.setItem("lastLearningArea", area);
    sessionStorage.setItem("lastLearningMode", mode);
    sessionStorage.setItem("lastLearningTime", new Date().toISOString());

    // 학습 히스토리 업데이트 (추천 시스템용)
    let learningHistory = JSON.parse(
      localStorage.getItem("learningHistory") || "[]"
    );
    learningHistory.unshift(learningRecord);
    learningHistory = learningHistory.slice(0, 50); // 최근 50개만 유지
    localStorage.setItem("learningHistory", JSON.stringify(learningHistory));

    // Firebase 사용자별 학습 기록 저장 (로그인된 경우)
    await saveLearningRecordToFirebase(learningRecord);

    console.log("📊 학습 기록 저장:", learningRecord);
  } catch (error) {
    console.warn("학습 기록 저장 실패:", error);
  }

  // 데이터 로드
  await loadLearningData(area);

  // 데이터 검증 (areaData와 getCurrentData 모두 확인)
  const allAreaData = areaData[area] || [];
  const currentData = getCurrentData();
  
  console.log(`🔍 데이터 검증: areaData[${area}]=${allAreaData.length}개, currentData=${currentData?.length || 0}개`);
  
  if (!currentData || currentData.length === 0) {
    console.log(`❌ ${area} 영역에 학습할 데이터가 없습니다.`);
    showNoDataMessage(area);
    return;
  }

  console.log(`📚 ${currentData.length}개의 데이터로 학습 시작`);

  // 모드별 화면 표시
  hideAllSections();

  switch (area) {
    case "vocabulary":
      switch (mode) {
        case "flashcard":
          showFlashcardMode();
          break;
        case "typing":
          showTypingMode();
          break;

        case "listening":
          showListeningMode();
          break;
        default:
          console.error(`❌ 알 수 없는 단어 학습 모드: ${mode}`);
          showAreaSelection();
      }
      break;

    case "grammar":
      switch (mode) {
        case "pattern":
          showGrammarPatternMode();
          break;
        case "practice":
          showGrammarPracticeMode();
          break;
        default:
          console.error(`❌ 알 수 없는 문법 학습 모드: ${mode}`);
          showAreaSelection();
      }
      break;

    case "reading":
      switch (mode) {
        case "example":
          showReadingExampleMode();
          break;
        case "flash":
          showReadingFlashMode();
          break;
        default:
          console.error(`❌ 알 수 없는 독해 학습 모드: ${mode}`);
          showAreaSelection();
      }
      break;

    default:
      console.error(`❌ 알 수 없는 학습 영역: ${area}`);
      showAreaSelection();
  }
};

async function loadLearningData(area) {
  console.log(`📚 ${area} 학습 데이터 로드 시작`);

  try {
    // ✅ 프리로드된 데이터가 있으면 우선 사용
    if (preloadedData[area] && preloadedData[area].length > 0) {
      console.log(
        `⚡ ${area} 프리로드된 데이터 사용: ${preloadedData[area].length}개`
      );
      areaData[area] = applyFilters(preloadedData[area]);
      return;
    }

    // ✅ 캐시된 데이터가 있고 유효하면 사용
    const now = Date.now();
    if (
      cachedData[area].data &&
      now - cachedData[area].timestamp < CACHE_DURATION
    ) {
      console.log(
        `⚡ ${area} 캐시된 데이터 사용: ${cachedData[area].data.length}개`
      );
      areaData[area] = applyFilters(cachedData[area].data);
      return;
    }

    // ✅ 캐시가 없거나 만료된 경우에만 DB 조회
    console.log(`🔄 ${area} DB에서 새로운 데이터 로드`);
    switch (area) {
      case "vocabulary":
        areaData[area] = await loadVocabularyData(); // 일반 학습 시 10개
        break;

      case "grammar":
        areaData[area] = await loadGrammarData(); // 일반 학습 시 10개
        break;

      case "reading":
        areaData[area] = await loadReadingData(); // 일반 학습 시 10개
        break;

      default:
        console.error(`❌ 알 수 없는 학습 영역: ${area}`);
    }

    // ✅ 로드된 데이터를 캐시에 저장
    if (areaData[area] && areaData[area].length > 0) {
      cachedData[area] = {
        data: [...areaData[area]], // 깊은 복사
        timestamp: now,
      };
      console.log(`💾 ${area} 데이터 캐시 저장: ${areaData[area].length}개`);
    }

    const currentData = getCurrentData();
    if (currentData.length === 0) {
      showNoDataMessage(area);
    } else {
      console.log(`✅ ${area} 데이터 로딩 완료: ${currentData.length}개`);
    }
  } catch (error) {
    console.error("데이터 로딩 중 오류:", error);
    showNoDataMessage(area);
  }
}

async function loadVocabularyData(limitCount = 10) {
  console.log(`🔍 학습용 단어 데이터 로드 시작 (${limitCount}개 제한)...`);

  let data = [];

  try {
    // Firebase가 초기화되었는지 확인
    if (!window.firebaseInit || !window.firebaseInit.collection) {
      throw new Error("Firebase가 초기화되지 않았습니다.");
    }

    console.log("🎲 DB에서 진짜 랜덤 단어 10개 로드...");

    // 🎯 효율적인 랜덤 조회 방식 (randomField 활용)
    try {
      const conceptsRef = window.firebaseInit.collection(
        window.firebaseInit.db,
        "concepts"
      );

      console.log("🚀 randomField를 활용한 효율적인 조회 시작...");

      // 효율적인 랜덤 쿼리 (매개변수로 전달받은 개수만큼 읽음)
      const randomValue = Math.random();
      const randomQuery = window.firebaseInit.query(
        conceptsRef,
        window.firebaseInit.where("randomField", ">=", randomValue),
        window.firebaseInit.limit(limitCount)
      );

      const randomSnapshot = await window.firebaseInit.getDocs(randomQuery);

      if (randomSnapshot.size >= limitCount) {
        // 충분한 데이터가 있는 경우
        data = randomSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        console.log(`💰 효율적인 조회 성공: ${data.length}개 단어 (1개 쿼리)`);
        trackFirebaseRead("단어 랜덤 조회", randomSnapshot.size); // ✅ 읽기 추적
      } else {
        // 충분하지 않은 경우 추가 조회
        const additionalQuery = window.firebaseInit.query(
          conceptsRef,
          window.firebaseInit.where("randomField", "<", randomValue),
          window.firebaseInit.limit(limitCount - randomSnapshot.size)
        );

        const additionalSnapshot = await window.firebaseInit.getDocs(
          additionalQuery
        );

        const firstBatch = randomSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const secondBatch = additionalSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        data = [...firstBatch, ...secondBatch];
        console.log(`💰 효율적인 조회 성공: ${data.length}개 단어 (2개 쿼리)`);
        trackFirebaseRead(
          "단어 추가 조회",
          randomSnapshot.size + additionalSnapshot.size
        ); // ✅ 읽기 추적
      }

      // Fisher-Yates 셔플 적용
      for (let i = data.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [data[i], data[j]] = [data[j], data[i]];
      }

      console.log(
        "🎲 선택된 단어들:",
        data.map((d) => d.expressions?.korean || "Unknown").slice(0, 3)
      );
    } catch (dbError) {
      console.error("❌ 랜덤 DB 조회 실패:", dbError);
      throw dbError;
    }
  } catch (error) {
    console.error("❌ DB 단어 데이터 로드 실패:", error);

    // 실패 시 sessionStorage에서 폴백 시도
    console.log("🔄 sessionStorage 폴백 시도...");
    const sessionData = sessionStorage.getItem("conceptsData");
    if (sessionData) {
      try {
        const parsedData = JSON.parse(sessionData);
        if (Array.isArray(parsedData) && parsedData.length > 0) {
          // sessionStorage 데이터도 랜덤하게 지정된 개수만 선택
          const shuffled = [...parsedData];
          for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
          }
          data = shuffled.slice(0, limitCount);
          console.log(`📦 sessionStorage에서 랜덤 ${data.length}개 단어 선택`);
        }
      } catch (parseError) {
        console.error("❌ sessionStorage 데이터 파싱 실패:", parseError);
      }
    }
  }

  // 필터 적용
  const filteredData = applyFilters(data);

  // vocabulary 영역에 데이터 저장 (전역 areaData 사용)
  areaData.vocabulary = filteredData;

  console.log(
    `✅ 학습용 단어 데이터 로드 완료: ${filteredData.length}개 (진짜 랜덤 방식)`
  );
  return filteredData;
}

async function loadGrammarData(limitCount = 10) {
  console.log("📝 문법 패턴 데이터 로딩 시작...");

  try {
    // Firebase가 초기화되었는지 확인
    if (!window.firebaseInit || !window.firebaseInit.collection) {
      throw new Error("Firebase가 초기화되지 않았습니다.");
    }

    console.log("🎲 DB에서 진짜 랜덤 문법 패턴 로드...");

    const grammarRef = window.firebaseInit.collection(
      window.firebaseInit.db,
      "grammar"
    );

    // 🎯 효율적인 랜덤 조회 방식 (randomField 활용)
    let grammarData = [];

    try {
      console.log("🚀 문법 패턴 - randomField를 활용한 효율적인 조회...");

      // 효율적인 랜덤 쿼리 (최대 20개만 읽음)
      const randomValue = Math.random();
      const randomQuery = window.firebaseInit.query(
        grammarRef,
        window.firebaseInit.where("randomField", ">=", randomValue),
        window.firebaseInit.limit(limitCount)
      );

      const randomSnapshot = await window.firebaseInit.getDocs(randomQuery);

      if (randomSnapshot.size >= limitCount) {
        // 충분한 데이터가 있는 경우
        grammarData = randomSnapshot.docs.map((doc) => {
          const docData = doc.data();
          return {
            id: doc.id,
            pattern_id: doc.id,
            pattern_name: docData.pattern_name || "문법 패턴",
            pattern_type: docData.pattern_type || "basic",
            difficulty: docData.difficulty || "intermediate",
            domain: docData.domain || "daily",
            ...docData,
          };
        });
        console.log(
          `💰 문법 패턴 효율적인 조회 성공: ${grammarData.length}개 (1개 쿼리)`
        );
        trackFirebaseRead("문법 패턴 랜덤 조회", randomSnapshot.size); // ✅ 읽기 추적
      } else {
        // 충분하지 않은 경우 추가 조회
        const additionalQuery = window.firebaseInit.query(
          grammarRef,
          window.firebaseInit.where("randomField", "<", randomValue),
          window.firebaseInit.limit(limitCount - randomSnapshot.size)
        );

        const additionalSnapshot = await window.firebaseInit.getDocs(
          additionalQuery
        );

        const firstBatch = randomSnapshot.docs.map((doc) => {
          const docData = doc.data();
          return {
            id: doc.id,
            pattern_id: doc.id,
            pattern_name: docData.pattern_name || "문법 패턴",
            pattern_type: docData.pattern_type || "basic",
            difficulty: docData.difficulty || "intermediate",
            domain: docData.domain || "daily",
            ...docData,
          };
        });

        const secondBatch = additionalSnapshot.docs.map((doc) => {
          const docData = doc.data();
          return {
            id: doc.id,
            pattern_id: doc.id,
            pattern_name: docData.pattern_name || "문법 패턴",
            pattern_type: docData.pattern_type || "basic",
            difficulty: docData.difficulty || "intermediate",
            domain: docData.domain || "daily",
            ...docData,
          };
        });

        grammarData = [...firstBatch, ...secondBatch];
        console.log(
          `💰 문법 패턴 효율적인 조회 성공: ${grammarData.length}개 (2개 쿼리)`
        );
        trackFirebaseRead(
          "문법 패턴 추가 조회",
          randomSnapshot.size + additionalSnapshot.size
        ); // ✅ 읽기 추적
      }

      // Fisher-Yates 셔플 적용
      for (let i = grammarData.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [grammarData[i], grammarData[j]] = [grammarData[j], grammarData[i]];
      }
    } catch (error) {
      console.error("❌ 문법 패턴 랜덤 조회 실패:", error);
      grammarData = [];
    }

    if (grammarData.length > 0) {
      // 필터 적용
      const filteredData = applyFilters(grammarData);

      // grammar 영역에 데이터 저장 (전역 areaData 사용)
      areaData.grammar = filteredData;

      console.log(
        `✅ 문법 패턴 데이터 로딩 완료: ${filteredData.length}개 (효율적인 랜덤 방식)`
      );
      return filteredData;
    } else {
      console.log("📝 grammar 컬렉션에 문서가 없음");
    }
  } catch (error) {
    console.error("📝 문법 패턴 데이터 로딩 실패:", error);
  }

  console.log("📝 문법 패턴 DB 데이터 없음");
  return [];
}

async function loadReadingData(limitCount = 10) {
  console.log("📖 독해 예문 데이터 로딩 시작...");

  // 현재 언어 설정 가져오기
  const currentSourceLanguage =
    window.languageSettings?.sourceLanguage || "korean";
  const currentTargetLanguage =
    window.languageSettings?.targetLanguage || "english";

  try {
    // Firebase가 초기화되었는지 확인
    if (!window.firebaseInit || !window.firebaseInit.collection) {
      throw new Error("Firebase가 초기화되지 않았습니다.");
    }

    console.log("📖 examples 컬렉션 쿼리 시작...");

    // 🎯 진짜 랜덤 조회 방식 (전체 예문 수 파악 후 랜덤 선택)
    const examplesRef = window.firebaseInit.collection(
      window.firebaseInit.db,
      "examples"
    );

    console.log("🎲 DB에서 진짜 랜덤 독해 예문 로드...");

    let exampleData = [];

    try {
      console.log("🚀 독해 예문 - randomField를 활용한 효율적인 조회...");

      // 효율적인 랜덤 쿼리 (최대 10개만 읽음)
      const randomValue = Math.random();
      const randomQuery = window.firebaseInit.query(
        examplesRef,
        window.firebaseInit.where("randomField", ">=", randomValue),
        window.firebaseInit.limit(limitCount) // 매개변수로 제어
      );

      const randomSnapshot = await window.firebaseInit.getDocs(randomQuery);

      if (randomSnapshot.size >= limitCount) {
        // 충분한 데이터가 있는 경우
        exampleData = randomSnapshot.docs
          .map((doc) => {
            const docData = doc.data();
            console.log("📖 원본 예문 데이터:", docData);

            // 지역화된 예문 생성
            const localizedExample = getLocalizedReadingExample({
              id: doc.id,
              ...docData,
            });
            console.log("📖 지역화된 예문:", localizedExample);

            if (localizedExample) {
              const processedData = {
                id: doc.id,
                example_id: doc.id,
                ...localizedExample,
                tags: [], // 빈 태그 배열로 초기화
              };
              console.log("📖 처리된 예문 데이터:", processedData);
              return processedData;
            }
            return null;
          })
          .filter(Boolean);

        console.log(
          `💰 독해 예문 효율적인 조회 성공: ${exampleData.length}개 (1개 쿼리)`
        );
        trackFirebaseRead("독해 예문 랜덤 조회", randomSnapshot.size); // ✅ 읽기 추적
      } else {
        // 충분하지 않은 경우 추가 조회
        const additionalQuery = window.firebaseInit.query(
          examplesRef,
          window.firebaseInit.where("randomField", "<", randomValue),
          window.firebaseInit.limit(10 - randomSnapshot.size) // ✅ 15에서 10으로 최적화
        );

        const additionalSnapshot = await window.firebaseInit.getDocs(
          additionalQuery
        );

        const firstBatch = randomSnapshot.docs
          .map((doc) => {
            const docData = doc.data();
            const localizedExample = getLocalizedReadingExample({
              id: doc.id,
              ...docData,
            });

            if (localizedExample) {
              return {
                id: doc.id,
                example_id: doc.id,
                ...localizedExample,
                tags: [],
              };
            }
            return null;
          })
          .filter(Boolean);

        const secondBatch = additionalSnapshot.docs
          .map((doc) => {
            const docData = doc.data();
            const localizedExample = getLocalizedReadingExample({
              id: doc.id,
              ...docData,
            });

            if (localizedExample) {
              return {
                id: doc.id,
                example_id: doc.id,
                ...localizedExample,
                tags: [],
              };
            }
            return null;
          })
          .filter(Boolean);

        exampleData = [...firstBatch, ...secondBatch];
        console.log(
          `💰 독해 예문 효율적인 조회 성공: ${exampleData.length}개 (2개 쿼리)`
        );
        trackFirebaseRead(
          "독해 예문 추가 조회",
          randomSnapshot.size + additionalSnapshot.size
        ); // ✅ 읽기 추적
      }

      // Fisher-Yates 셔플 적용
      for (let i = exampleData.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [exampleData[i], exampleData[j]] = [exampleData[j], exampleData[i]];
      }
    } catch (error) {
      console.error("❌ 독해 예문 랜덤 조회 실패:", error);
      exampleData = [];
    }

    if (exampleData.length > 0) {
      // 언어별 필터링
      const filteredData = filterDataByLanguage(exampleData);
      console.log(`📖 언어 필터링 후: ${filteredData.length}개`);

      if (filteredData.length > 0) {
        // 필터 적용 - reading 영역 전용 데이터 저장
        const finalData = applyFilters(filteredData);

        // reading 영역에 데이터 저장 (전역 areaData 사용)
        areaData.reading = finalData;

        console.log(
          `✅ examples에서 독해 데이터 로딩 완료: ${finalData.length}개 (효율적인 랜덤 방식)`
        );
        return finalData;
      }
    }
  } catch (error) {
    console.error("📖 examples 컬렉션 로드 실패:", error);
  }

  // DB에 데이터가 없으면 빈 배열 반환
  console.log("📖 독해 예문 DB 데이터 없음");
  return [];
}

function showNoDataMessage(area) {
  const messageMap = {
    vocabulary: "단어",
    grammar: "문법 패턴",
    reading: "독해 예문",
  };

  const dataType = messageMap[area] || "학습";

  hideAllSections();
  const noDataSection = document.getElementById("no-data-message");
  if (noDataSection) {
    noDataSection.classList.remove("hidden");
    const messageElement = noDataSection.querySelector("p");
    if (messageElement) {
      messageElement.textContent = `${dataType} 데이터가 없습니다. 먼저 데이터를 업로드해주세요.`;
    }

    // 번역 적용
    setTimeout(() => {
      applyTranslations();
    }, 50);
  } else {
    alert(`${dataType} 데이터가 없습니다. 먼저 데이터를 업로드해주세요.`);
    showAreaSelection();
  }
}

function hideAllSections() {
  const sections = [
    "area-selection",
    "mode-selection",
    "flashcard-mode",
    "typing-mode",
    "pronunciation-mode",
    "listening-mode",
    "grammar-pattern-mode",
    "grammar-practice-mode",
    "reading-example-mode",
    "reading-flash-mode",
    "no-data-message",
  ];

  sections.forEach((sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.classList.add("hidden");
    } else {
      console.log(`⚠️ 섹션을 찾을 수 없음: ${sectionId}`);
    }
  });
}

function hideLearningModeSections() {
  // 학습 모드 섹션들만 숨김 (영역 선택과 모드 선택은 유지)
  const learningModeSections = [
    "flashcard-mode",
    "typing-mode",
    "pronunciation-mode",
    "listening-mode",
    "grammar-pattern-mode",
    "grammar-practice-mode",
    "reading-example-mode",
    "reading-flash-mode",
    "no-data-message",
  ];

  learningModeSections.forEach((sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.classList.add("hidden");
    }
  });
}

function showFlashcardMode() {
  console.log("🃏 플래시카드 모드 시작");
  const flashcardMode = document.getElementById("flashcard-mode");
  if (flashcardMode) {
    flashcardMode.classList.remove("hidden");
    updateFlashcard();

    // 번역 적용
    setTimeout(() => {
      applyTranslations();
    }, 50);

    // back-from-flashcard 버튼에 직접 이벤트 리스너 등록
    setTimeout(() => {
      const backButton = document.getElementById("back-from-flashcard");
      console.log("🔍 플래시카드 돌아가기 버튼 찾기:", backButton);
      if (backButton) {
        // 기존 이벤트 리스너 제거 후 새로 등록
        backButton.removeEventListener("click", backToAreasHandler);
        backButton.addEventListener("click", backToAreasHandler);
        console.log("✅ back-from-flashcard 이벤트 리스너 등록 완료");
      } else {
        console.error("❌ back-from-flashcard 버튼을 찾을 수 없음");
      }
    }, 100);
  } else {
    console.error("❌ 플래시카드 모드 요소를 찾을 수 없음");
    alert("플래시카드 모드를 시작할 수 없습니다.");
    showAreaSelection();
  }
}

function updateFlashcard() {
  const currentData = getCurrentData();
  if (!currentData || currentData.length === 0) return;

  const concept = currentData[currentIndex];

  // 최신 언어 설정 사용
  const currentSourceLanguage =
    window.languageSettings?.sourceLanguage || sourceLanguage || "korean";
  const currentTargetLanguage =
    window.languageSettings?.targetLanguage || targetLanguage || "english";

  console.log("🔄 플래시카드 업데이트:", {
    conceptId: concept.id,
    sourceLanguage: currentSourceLanguage,
    targetLanguage: currentTargetLanguage,
    concept: concept,
    domain: concept.domain || concept.concept_info?.domain,
    category: concept.category || concept.concept_info?.category,
  });

  let frontText = "";
  let backText = "";
  let frontPronunciation = "";
  let backDefinition = "";

  // 1. concepts 데이터 구조 (expressions 있음) - 단어 학습
  if (concept.expressions) {
    const sourceExpression = concept.expressions[currentSourceLanguage];
    const targetExpression = concept.expressions[currentTargetLanguage];

    console.log("✅ concepts 데이터 구조 사용");

    if (sourceExpression && targetExpression) {
      // 단어 학습: 앞면은 대상언어 단어, 뒤면은 원본언어 단어
      frontText = targetExpression.word || "";
      backText = sourceExpression.word || "";
      frontPronunciation = targetExpression.pronunciation || "";
      backDefinition = sourceExpression.definition || "";
    }
  }
  // concepts 데이터가 아닌 경우 에러 처리
  else {
    console.error("❌ 단어 학습에 잘못된 데이터 구조:", concept);
    alert("단어 학습 데이터에 문제가 있습니다. 새로고침 후 다시 시도해주세요.");
    showAreaSelection();
    return;
  }

  // UI 업데이트 - 올바른 HTML ID 사용
  const frontWordElement = document.getElementById("flashcard-front-word");
  const frontPronElement = document.getElementById(
    "flashcard-front-transcription"
  );
  const backWordElement = document.getElementById("flashcard-back-word");
  const backDefElement = document.getElementById("flashcard-back-definition");
  const progressElement = document.getElementById("flashcard-mode-progress");
  const categoryElement = document.getElementById("flashcard-back-category");

  if (frontWordElement) frontWordElement.textContent = frontText;
  if (frontPronElement) frontPronElement.textContent = frontPronunciation;
  if (backWordElement) backWordElement.textContent = backText;
  if (backDefElement) backDefElement.textContent = backDefinition;
  if (progressElement) {
    progressElement.textContent = `${currentIndex + 1} / ${currentData.length}`;
  }

  // 카테고리/도메인 정보 표시
  if (categoryElement) {
    const category = concept.category || concept.concept_info?.category || "일반";
    const domain = concept.domain || concept.concept_info?.domain || "daily";
    
    // locales 시스템을 사용한 번역
    const translatedDomain = getTranslatedText(`domain_${domain}`) || domain;
    const translatedCategory = getTranslatedText(`category_${category}`) || category;
    categoryElement.textContent = `${translatedDomain} > ${translatedCategory}`;
  }

  // 플래시카드 뒷면에서 발음과 예문 요소 숨기기
  const backTranscriptionElement = document.getElementById("flashcard-back-transcription");
  const backExampleElement = document.getElementById("flashcard-back-example");
  
  if (backTranscriptionElement) {
    backTranscriptionElement.style.display = "none";
  }
  if (backExampleElement) {
    backExampleElement.style.display = "none";
  }

  console.log("✅ 플래시카드 업데이트 완료:", {
    frontText,
    backText,
    frontPronunciation,
    backDefinition,
  });

  // 카드 뒤집기 상태 초기화 (앞면 표시)
  isFlipped = false;
  const flashcardElement = document.querySelector(".flashcard");
  if (flashcardElement) {
    flashcardElement.classList.remove("flipped");
  }

  // 📊 학습 상호작용 추적 (플래시카드 표시)
  const conceptId = concept.id || concept.concept_id || `vocab_${currentIndex}`;
  trackLearningInteraction(conceptId, false, "view"); // view는 단순 조회이므로 정답으로 계산하지 않음
}

function flipCard() {
  console.log("🔄 flipCard 함수 시작");
  const card = document.getElementById("flashcard-mode-card");
  console.log("🔍 카드 요소 찾기:", card);

  if (card) {
    console.log("🔍 현재 카드 클래스:", card.className);
    isFlipped = !isFlipped;
    console.log("🔄 뒤집기 상태 변경:", isFlipped);

    if (isFlipped) {
      card.classList.add("flipped");
      console.log("✅ 'flipped' 클래스 추가됨");

      // 📊 학습 상호작용 추적 (카드 뒤집기)
      const currentData = getCurrentData();
      if (currentData && currentData[currentIndex]) {
        const concept = currentData[currentIndex];
        const conceptId =
          concept.id || concept.concept_id || `vocab_${currentIndex}`;
        trackLearningInteraction(conceptId, true, "flip");
      }
    } else {
      card.classList.remove("flipped");
      console.log("✅ 'flipped' 클래스 제거됨");
    }

    console.log("🔍 변경 후 카드 클래스:", card.className);
    console.log("🔄 카드 뒤집기 상태:", isFlipped);
  } else {
    console.error("❌ flashcard-mode-card 요소를 찾을 수 없음");
    // 전체 DOM에서 플래시카드 요소 찾기
    const allFlipCards = document.querySelectorAll(".flip-card");
    console.log("🔍 전체 flip-card 요소들:", allFlipCards);
  }
}

function showTypingMode() {
  console.log("⌨️ 타이핑 모드 시작");
  const typingMode = document.getElementById("typing-mode");
  if (typingMode) {
    typingMode.classList.remove("hidden");

    // 타이핑 모드 요소들의 번역 속성 제거 (번역 시스템이 콘텐츠를 덮어쓰지 않도록)
    const typingElements = [
      "typing-word",
      "typing-pronunciation",
      "typing-meaning",
    ];
    typingElements.forEach((id) => {
      const element = document.getElementById(id);
      if (element) {
        element.removeAttribute("data-i18n");
      }
    });

    // 데이터가 로드되었는지 확인 후 UI 업데이트
    const currentData = getCurrentData();
    if (currentData && currentData.length > 0) {
      updateTyping();
    } else {
      console.warn(
        "⚠️ 타이핑 모드: 데이터가 아직 로드되지 않음, 잠시 후 재시도"
      );
      // 데이터가 로드될 때까지 잠시 대기 후 재시도
      setTimeout(() => {
        const retryData = getCurrentData();
        if (retryData && retryData.length > 0) {
          updateTyping();
        } else {
          console.error("❌ 타이핑 모드: 데이터 로드 실패");
        }
      }, 100);
    }

    // 번역 적용 (타이핑 모드 콘텐츠 제외)
    setTimeout(() => {
      // 타이핑 모드의 핵심 요소들을 번역에서 제외
      const excludeElements = [
        "typing-word",
        "typing-pronunciation",
        "typing-meaning",
      ];
      excludeElements.forEach((id) => {
        const element = document.getElementById(id);
        if (element) {
          element.removeAttribute("data-i18n");
        }
      });
      applyTranslations();
    }, 50);

    // 엔터키 이벤트 리스너 추가
    const answerInput = document.getElementById("typing-mode-answer");
    if (answerInput) {
      answerInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          checkTypingAnswer();
        }
      });
    }
  } else {
    console.error("❌ 타이핑 모드 요소를 찾을 수 없음");
    alert("타이핑 모드를 시작할 수 없습니다.");
    showAreaSelection();
  }
}

function updateTyping() {
  const currentData = getCurrentData();
  if (!currentData || currentData.length === 0) {
    console.warn("⚠️ updateTyping: 데이터가 없음");
    return;
  }

  const concept = currentData[currentIndex];
  if (!concept) {
    console.warn("⚠️ updateTyping: 현재 인덱스의 개념이 없음", {
      currentIndex,
      dataLength: currentData.length,
    });
    return;
  }

  console.log("🔄 타이핑 모드 업데이트:", {
    conceptId: concept.id,
    currentIndex,
    concept: concept,
  });

  // 최신 언어 설정 사용
  const currentSourceLanguage =
    window.languageSettings?.sourceLanguage || sourceLanguage || "korean";
  const currentTargetLanguage =
    window.languageSettings?.targetLanguage || targetLanguage || "english";

  const wordElement = document.getElementById("typing-word");
  const pronunciationElement = document.getElementById("typing-pronunciation");
  const meaningElement = document.getElementById("typing-meaning");
  const answerInput = document.getElementById("typing-mode-answer");
  const resultDiv = document.getElementById("typing-mode-result");

  let sourceText = "";
  let sourcePronunciation = "";
  let targetMeaning = "";
  let correctAnswer = "";

  // 1. concepts 데이터 구조 (expressions 있음)
  if (concept.expressions) {
    const sourceExpr = concept.expressions[currentSourceLanguage];
    const targetExpr = concept.expressions[currentTargetLanguage];

    if (sourceExpr && targetExpr) {
      sourceText = sourceExpr.word || "";
      sourcePronunciation = sourceExpr.pronunciation || "";
      targetMeaning = targetExpr.word || "";
      correctAnswer = targetExpr.word.toLowerCase();
      console.log("✅ 타이핑 모드: concepts 데이터 구조 사용");
    } else {
      console.warn(
        "⚠️ 타이핑 모드: concepts 데이터에서 언어별 표현을 찾을 수 없음"
      );
      return;
    }
  }
  // 2. examples 데이터 구조 (직접 언어별 텍스트)
  else if (concept[currentSourceLanguage] && concept[currentTargetLanguage]) {
    sourceText = concept[currentSourceLanguage];
    sourcePronunciation = concept.pronunciation || "";
    targetMeaning = concept[currentTargetLanguage];
    correctAnswer = concept[currentTargetLanguage].toLowerCase();
    console.log("✅ 타이핑 모드: examples 데이터 구조 사용");
  }
  // 3. 지원되지 않는 구조
  else {
    console.warn("⚠️ 타이핑 모드: 지원되지 않는 데이터 구조:", concept);
    return;
  }

  if (wordElement) {
    wordElement.textContent = sourceText;
    // data-i18n 속성 제거하여 번역 시스템이 덮어쓰지 않도록 함
    wordElement.removeAttribute("data-i18n");
    console.log("✅ 타이핑 모드 UI 업데이트:", {
      sourceText,
      sourcePronunciation,
      targetMeaning,
      correctAnswer,
    });
  } else {
    console.error("❌ typing-word 요소를 찾을 수 없음");
  }
  if (pronunciationElement) {
    pronunciationElement.textContent = sourcePronunciation;
    pronunciationElement.removeAttribute("data-i18n");
  }
  if (meaningElement) {
    // 의미 표시를 숨김 (타이핑 모드에서는 정답을 미리 보여주지 않음)
    meaningElement.style.display = "none";
    meaningElement.removeAttribute("data-i18n");
  }

  // 📊 학습 상호작용 추적 (타이핑 문제 표시) - 단순 조회는 카운트하지 않음
  // const conceptId = concept.id || concept.concept_id || `vocab_${currentIndex}`;
  // trackLearningInteraction(conceptId, false, "view"); // 중복 방지를 위해 주석 처리

  // 카테고리/도메인 정보 표시
  const categoryElement = document.getElementById("typing-category");
  if (categoryElement) {
    const category =
      concept.category || concept.concept_info?.category || "일반";
    const domain = concept.domain || concept.concept_info?.domain || "daily";
    
    // locales 시스템을 사용한 번역
    const translatedDomain = getTranslatedText(`domain_${domain}`) || domain;
    const translatedCategory = getTranslatedText(`category_${category}`) || category;
    categoryElement.textContent = `${translatedDomain} > ${translatedCategory}`;
  }

  // 정답 저장
  if (answerInput) {
    answerInput.dataset.correctAnswer = correctAnswer;
  }

  // 입력 필드 초기화
  if (answerInput) {
    answerInput.value = "";
    answerInput.focus();
  }

  if (resultDiv) {
    resultDiv.classList.add("hidden");
  }

  // 진행 상황 업데이트 (HTML에서 타이핑 진행 상황 요소가 있는지 확인 필요)
  const progress = document.getElementById("typing-mode-progress");
  if (progress) {
    progress.textContent = `${currentIndex + 1} / ${currentData.length}`;
  }

  // 정답 확인 버튼 이벤트 리스너 설정 (여러 ID 시도)
  const checkButtonIds = [
    "check-typing-answer",
    "check-answer",
    "check-typing-answer-btn",
  ];
  let checkButton = null;

  for (const buttonId of checkButtonIds) {
    checkButton = document.getElementById(buttonId);
    if (checkButton) {
      console.log(`✅ 정답 확인 버튼 발견: ${buttonId}`);
      break;
    }
  }

  if (checkButton) {
    // 기존 이벤트 리스너 제거 후 새로 등록
    checkButton.removeEventListener("click", checkTypingAnswer);
    checkButton.addEventListener("click", checkTypingAnswer);
    console.log("✅ 정답 확인 버튼 이벤트 리스너 등록 완료");
  } else {
    console.warn("⚠️ 정답 확인 버튼을 찾을 수 없음");
  }
}

function checkTypingAnswer() {
  const answerInput = document.getElementById("typing-mode-answer");
  const resultDiv = document.getElementById("typing-mode-result");

  if (!answerInput || !resultDiv) return;

  const userAnswer = answerInput.value.toLowerCase().trim();
  const correctAnswer = answerInput.dataset.correctAnswer;
  const isCorrect = userAnswer === correctAnswer;

  if (isCorrect) {
    resultDiv.textContent = getTranslatedText("correct_answer");
    resultDiv.className = "mt-4 p-3 bg-green-100 text-green-800 rounded";
  } else {
    resultDiv.textContent = `${getTranslatedText(
      "wrong_answer"
    )} ${correctAnswer}`;
    resultDiv.className = "mt-4 p-3 bg-red-100 text-red-800 rounded";
  }

  resultDiv.classList.remove("hidden");

  // 📊 학습 상호작용 추적 (타이핑 답안 확인)
  const currentData = getCurrentData();
  if (currentData && currentData[currentIndex]) {
    const concept = currentData[currentIndex];
    const conceptId =
      concept.id || concept.concept_id || `vocab_${currentIndex}`;
    trackLearningInteraction(conceptId, isCorrect, "typing");
  }

  // 2초 후 다음 문제로
  setTimeout(async () => {
    await navigateContent(1);
  }, 2000);
}

function showListeningMode() {
  console.log("🎧 듣기 연습 모드 시작");

  const listeningMode = document.getElementById("listening-mode");
  if (listeningMode) {
    listeningMode.classList.remove("hidden");

    // 듣기 모드 초기화
    updateListeningMode();

    // 번역 적용
    setTimeout(() => {
      applyTranslations();
    }, 50);
  } else {
    console.error("❌ 듣기 연습 모드 요소를 찾을 수 없음");
    alert("듣기 연습 모드를 시작할 수 없습니다.");
    showAreaSelection();
  }
}

// 🎧 브라우저 내장 음성 합성을 사용한 발음 재생
function playWordAudio(text, language = "korean") {
  if (!text) {
    console.warn("⚠️ 재생할 텍스트가 없습니다.");
    return;
  }

  // 음성 합성 지원 확인
  if (!window.speechSynthesis) {
    console.warn("⚠️ 이 브라우저는 음성 합성을 지원하지 않습니다.");
    alert("이 브라우저는 음성 재생을 지원하지 않습니다.");
    return;
  }

  try {
    // 기존 음성 중지
    window.speechSynthesis.cancel();

    // 새 음성 생성
    const utterance = new SpeechSynthesisUtterance(text);

    // 언어별 설정
    const languageMap = {
      korean: "ko-KR",
      english: "en-US",
      japanese: "ja-JP",
      chinese: "zh-CN",
      spanish: "es-ES",
    };

    // 기존 음성 재생 중지 (중복 방지)
    window.speechSynthesis.cancel();

    utterance.lang = languageMap[language] || "ko-KR";
    utterance.rate = 0.8; // 속도 (0.1 ~ 10)
    utterance.pitch = 1; // 음높이 (0 ~ 2)
    utterance.volume = 1; // 볼륨 (0 ~ 1)

    // 재생 이벤트
    utterance.onstart = () => {
      console.log(`🎧 음성 재생 시작: "${text}" (${language})`);
    };

    utterance.onend = () => {
      console.log(`✅ 음성 재생 완료: "${text}"`);
    };

    utterance.onerror = (event) => {
      console.error("❌ 음성 재생 오류:", event.error);
    };

    // 음성 재생
    window.speechSynthesis.speak(utterance);
  } catch (error) {
    console.error("❌ 음성 재생 중 오류 발생:", error);
    alert("음성 재생 중 오류가 발생했습니다.");
  }
}

function updateListeningMode() {
  const currentData = getCurrentData();
  if (!currentData || currentData.length === 0) return;

  const concept = currentData[currentIndex];
  console.log("🎧 듣기 연습 데이터:", concept);

  // 듣기 모드 요소들
  const listeningWord = document.getElementById("listening-word");
  const listeningPronunciation = document.getElementById(
    "listening-pronunciation"
  );
  const listeningMeaning = document.getElementById("listening-meaning");
  const listeningCategory = document.getElementById("listening-category");
  const listeningProgress = document.getElementById("listening-progress");
  const playAudioBtn = document.getElementById("play-audio-btn");

  // 언어 설정 가져오기 (다른 모드와 동일)
  const currentSourceLanguage =
    document.getElementById("source-language")?.value ||
    document.getElementById("source-language-desktop")?.value ||
    "korean";
  const currentTargetLanguage =
    document.getElementById("target-language")?.value ||
    document.getElementById("target-language-desktop")?.value ||
    "english";

  // 개념 데이터 추출 (듣기 모드 특성에 맞게 수정)
  // 듣기 모드: 대상 언어 단어를 듣고 원본 언어 의미를 확인
  let sourceWord = "단어"; // 화면에 표시될 대상 언어 단어
  let targetWord = "의미"; // 화면에 표시될 원본 언어 의미
  let pronunciation = "";
  let category = "카테고리";

  if (concept.expressions) {
    // 듣기 모드에서는 대상 언어를 듣고 원본 언어 의미를 확인
    const listenLanguageExpr = concept.expressions[currentTargetLanguage]; // 들을 언어
    const meaningLanguageExpr = concept.expressions[currentSourceLanguage]; // 의미를 확인할 언어

    if (listenLanguageExpr) {
      sourceWord =
        listenLanguageExpr.word || listenLanguageExpr.expression || "단어";
      pronunciation =
        listenLanguageExpr.pronunciation ||
        listenLanguageExpr.transcription ||
        "";
    }

    if (meaningLanguageExpr) {
      targetWord =
        meaningLanguageExpr.word || meaningLanguageExpr.expression || "의미";
    }
  }

  // 카테고리 추출
  category = concept.category || concept.concept_info?.category || "일반";

  // UI 업데이트
  if (listeningWord) listeningWord.textContent = sourceWord;
  if (listeningPronunciation)
    listeningPronunciation.textContent = pronunciation;
  if (listeningMeaning) listeningMeaning.textContent = targetWord;
  if (listeningCategory) listeningCategory.textContent = category;

  // 진행 상황 업데이트
  if (listeningProgress) {
    listeningProgress.textContent = `${currentIndex + 1} / ${
      currentData.length
    }`;
  }

  // 발음 버튼 이벤트 설정
  if (playAudioBtn) {
    playAudioBtn.onclick = () => {
      // 듣기 모드에서는 대상 언어(듣는 언어)로 재생
      playWordAudio(sourceWord, currentTargetLanguage);
      // 📊 학습 상호작용 추적 (발음 듣기)
      const conceptId =
        concept.id || concept.concept_id || `listening_${currentIndex}`;
      trackLearningInteraction(conceptId, true, "listen");
    };
  }

  // 📊 학습 상호작용 추적 (듣기 모드 표시)
  const conceptId =
    concept.id || concept.concept_id || `listening_${currentIndex}`;
  trackLearningInteraction(conceptId, true, "view");

  // 삭제 버튼 추가
  const deleteButtonContainer = document.getElementById(
    "listening-delete-container"
  );
  if (deleteButtonContainer) {
    deleteButtonContainer.innerHTML = `
      <button class="delete-btn bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm" 
              data-item-id="${concept.id}" 
              data-item-type="vocabulary">
        🗑️ 삭제
      </button>
    `;
  }
}

function showGrammarPatternMode() {
  console.log("📝 문법 패턴 모드 시작");
  const patternMode = document.getElementById("grammar-pattern-mode");
  if (patternMode) {
    patternMode.classList.remove("hidden");

    // 언어 설정이 완전히 로드된 후 업데이트
    setTimeout(() => {
      updateGrammarPatterns();
    }, 100);

    // 번역 적용
    setTimeout(() => {
      applyTranslations();
    }, 50);
  } else {
    console.error("❌ 문법 패턴 모드 요소를 찾을 수 없음");
    alert("문법 패턴 모드를 시작할 수 없습니다.");
    showAreaSelection();
  }
}

function updateGrammarPatterns() {
  const currentData = getCurrentData();
  if (!currentData || currentData.length === 0) return;

  const pattern = currentData[currentIndex];
  console.log("📝 문법 패턴 데이터:", pattern);

  const patternTitle = document.getElementById("pattern-title");
  const patternStructure = document.getElementById("pattern-structure");
  const patternExplanation = document.getElementById("pattern-explanation");
  const patternExamples = document.getElementById("pattern-examples");

  // 실제 DB 구조에 맞게 데이터 추출
  const title = getLocalizedPatternTitle(pattern);
  const structure = getLocalizedPatternStructure(pattern);
  const explanation = getLocalizedPatternExplanation(pattern);
  const examples = getLocalizedPatternExamples(pattern);

  if (patternTitle) patternTitle.textContent = title;
  if (patternStructure) patternStructure.textContent = structure;
  if (patternExplanation) patternExplanation.textContent = explanation;

  if (patternExamples && examples && Array.isArray(examples)) {
    patternExamples.innerHTML = examples
      .map((example) => `<li class="mb-2">${example}</li>`)
      .join("");
  }

  // 진행 상황 업데이트
  const progress = document.getElementById("pattern-progress");
  if (progress) {
    progress.textContent = `${currentIndex + 1} / ${currentData.length}`;
  }

  // 삭제 버튼 추가
  const deleteButtonContainer = document.getElementById(
    "pattern-delete-container"
  );
  if (deleteButtonContainer) {
    deleteButtonContainer.innerHTML = `
      <button class="delete-btn bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm" 
              data-item-id="${pattern.id}" 
              data-item-type="grammar">
        🗑️ 삭제
      </button>
    `;
  }

  // 📊 학습 상호작용 추적 (문법 패턴 표시) - view 상호작용 제거
  // const conceptId = pattern.id || pattern.concept_id || `grammar_${currentIndex}`;
  // trackLearningInteraction(conceptId, true, "view"); // 주석 처리 - navigate_completed만 사용
}

function showGrammarPracticeMode() {
  console.log("📚 문법 실습 모드 시작");
  const practiceMode = document.getElementById("grammar-practice-mode");
  if (practiceMode) {
    practiceMode.classList.remove("hidden");

    // 언어 설정이 완전히 로드된 후 업데이트
    setTimeout(() => {
      updateGrammarPractice();
    }, 100);

    // 번역 적용
    setTimeout(() => {
      applyTranslations();
    }, 50);

    // 문법 카드 클릭 이벤트 추가
    setTimeout(() => {
      const grammarCard = document.getElementById("grammar-card");
      if (grammarCard) {
        grammarCard.removeEventListener("click", flipGrammarCard);
        grammarCard.addEventListener("click", (e) => {
          if (!e.target.matches("button, .btn")) {
            e.preventDefault();
            e.stopPropagation();
            flipGrammarCard();
          }
        });
      }
    }, 100);
  } else {
    console.error("❌ 문법 실습 모드 요소를 찾을 수 없음");
    alert("문법 실습 모드를 시작할 수 없습니다.");
    showAreaSelection();
  }
}

function updateGrammarPractice() {
  const currentData = getCurrentData();
  if (!currentData || currentData.length === 0) return;

  const pattern = currentData[currentIndex];
  console.log("📚 문법 실습 데이터:", pattern);

  // 실제 DB 구조에 맞게 데이터 추출
  const title = getLocalizedPatternTitle(pattern);
  const structure = getLocalizedPatternStructure(pattern);
  const explanation = getLocalizedPatternExplanation(pattern);
  const examples = getLocalizedPatternExamples(pattern);

  // 앞면: 패턴 구조
  const frontStructure = document.getElementById("grammar-front-structure");
  const frontTitle = document.getElementById("grammar-front-title");

  if (frontTitle) frontTitle.textContent = title;
  if (frontStructure) frontStructure.textContent = structure;

  // 뒷면: 설명과 예문
  const backExplanation = document.getElementById("grammar-back-explanation");
  const backExamples = document.getElementById("grammar-back-examples");

  if (backExplanation) backExplanation.textContent = explanation;

  if (backExamples && examples && Array.isArray(examples)) {
    backExamples.innerHTML = examples
      .map((example) => `<li class="mb-1">${example}</li>`)
      .join("");
  }

  // 진행 상황 업데이트
  const progress = document.getElementById("grammar-practice-progress");
  if (progress) {
    progress.textContent = `${currentIndex + 1} / ${currentData.length}`;
  }

  // 📊 학습 상호작용 추적 (문법 실습 표시) - view 상호작용 제거
  // const conceptId = pattern.id || pattern.concept_id || `grammar_${currentIndex}`;
  // trackLearningInteraction(conceptId, true, "view"); // 주석 처리 - grammar_flip만 사용

  // 삭제 버튼 추가
  const deleteButtonContainer = document.getElementById(
    "grammar-delete-container"
  );
  if (deleteButtonContainer) {
    deleteButtonContainer.innerHTML = `
      <button class="delete-btn bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm" 
              data-item-id="${pattern.id}" 
              data-item-type="grammar">
        🗑️ 삭제
      </button>
    `;
  }

  // 카드 앞면으로 리셋
  const card = document.getElementById("grammar-card");
  if (card) {
    card.classList.remove("flipped");
  }
}

function flipGrammarCard() {
  const card = document.getElementById("grammar-card");
  if (card) {
    const wasFlipped = card.classList.contains("flipped");
    card.classList.toggle("flipped");
    const isNowFlipped = card.classList.contains("flipped");

    // 📊 학습 상호작용 추적 (카드가 뒤집혔을 때만)
    if (!wasFlipped && isNowFlipped) {
      const currentData = getCurrentData();
      if (currentData && currentData[currentIndex]) {
        const concept = currentData[currentIndex];
        const conceptId =
          concept.id || concept.concept_id || `grammar_${currentIndex}`;
        trackLearningInteraction(conceptId, true, "grammar_flip");
      }
    }
  }
}

function showReadingExampleMode() {
  console.log("📖 예문 독해 모드 시작");
  const readingContainer = document.getElementById("reading-example-mode");
  if (readingContainer) {
    readingContainer.classList.remove("hidden");

    updateReadingExample();

    // 번역 적용
    setTimeout(() => {
      applyTranslations();
    }, 50);
  } else {
    console.error("❌ 독해 예문 모드 요소를 찾을 수 없음");
    alert("독해 예문 모드를 시작할 수 없습니다.");
    showAreaSelection();
  }
}

function showReadingFlashMode() {
  console.log("⚡ 플래시 독해 모드 시작");
  const readingContainer = document.getElementById("reading-flash-mode");
  if (readingContainer) {
    readingContainer.classList.remove("hidden");

    updateReadingFlash();

    // 번역 적용
    setTimeout(() => {
      applyTranslations();
    }, 50);
  } else {
    console.error("❌ 독해 플래시 모드 요소를 찾을 수 없음");
    alert("독해 플래시 모드를 시작할 수 없습니다.");
    showAreaSelection();
  }
}

function updateReadingExample() {
  const currentData = getCurrentData();
  if (!currentData || currentData.length === 0) return;

  const example = currentData[currentIndex];
  const sourceLanguage = window.languageSettings?.sourceLanguage || "korean";
  const targetLanguage = window.languageSettings?.targetLanguage || "english";

  const container = document.getElementById("reading-example-container");
  if (!container) return;

  // 디버깅 로그 추가
  console.log("🔍 updateReadingExample - example 데이터:", example);
  console.log("🔍 example.situation:", example.situation);
  console.log(
    "🔍 Array.isArray(example.situation):",
    Array.isArray(example.situation)
  );
  console.log(
    "🔍 situation 값:",
    Array.isArray(example.situation) && example.situation.length > 0
      ? example.situation[0]
      : example.situation || "예문 학습"
  );

  // 상황 정보 준비
  const situationInfo =
    Array.isArray(example.situation) && example.situation.length > 0
      ? example.situation.join(", ")
      : example.situation || "일반";

  container.innerHTML = `
    <div class="space-y-6">
      <div class="text-center">
        <h3 class="text-2xl font-bold mb-4">
          ${
            example.translations?.[sourceLanguage] ||
            example[sourceLanguage] ||
            example.original ||
            "원문"
          }
        </h3>
        <p class="text-lg text-gray-600 mb-4">
          ${
            example.translations?.[targetLanguage] ||
            example[targetLanguage] ||
            example.translation ||
            "번역"
          }
        </p>
        <div class="flex flex-wrap gap-2 justify-center">
          <span class="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
            📍 ${situationInfo}
          </span>
        </div>
      </div>
      
      <div class="text-center pt-4 border-t" id="reading-delete-container">
        <button class="delete-btn bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm" 
                data-item-id="${example.id}" 
                data-item-type="reading">
          🗑️ 삭제
        </button>
      </div>
    </div>
  `;

  // 진행 상황 업데이트
  const progress = document.getElementById("reading-example-progress");
  if (progress) {
    progress.textContent = `${currentIndex + 1} / ${currentData.length}`;
  }

  // 📊 view 상호작용 추적 제거 - 독해 예문은 단순 조회이므로 상호작용으로 계산하지 않음
}

function updateReadingFlash() {
  const currentData = getCurrentData();
  if (!currentData || currentData.length === 0) return;

  const example = currentData[currentIndex];
  const sourceLanguage = window.languageSettings?.sourceLanguage || "korean";
  const targetLanguage = window.languageSettings?.targetLanguage || "english";

  // 플래시 카드 요소들 직접 업데이트
  const frontText = document.getElementById("reading-flash-front-text");
  const backTranslation = document.getElementById(
    "reading-flash-back-translation"
  );
  const backContext = document.getElementById("reading-flash-back-context");

  // 디버깅 로그 추가
  console.log("🔍 updateReadingFlash - example 데이터:", example);
  console.log("🔍 example.situation:", example.situation);

  if (frontText) {
    frontText.textContent =
      example.translations?.[sourceLanguage] ||
      example[sourceLanguage] ||
      example.original ||
      "원문";
  }

  if (backTranslation) {
    backTranslation.textContent =
      example.translations?.[targetLanguage] ||
      example[targetLanguage] ||
      example.translation ||
      "번역";
  }

  if (backContext) {
    const situationInfo =
      Array.isArray(example.situation) && example.situation.length > 0
        ? example.situation.join(", ")
        : example.situation || "일반";
    backContext.textContent = situationInfo;
  }

  // 진행 상황 업데이트
  const progress = document.getElementById("reading-flash-progress");
  if (progress) {
    progress.textContent = `${currentIndex + 1} / ${currentData.length}`;
  }

  // 독해 플래시 카드 뒤집기 상태 초기화 (새 카드는 앞면부터 시작)
  const flashCard = document.getElementById("reading-flash-card");
  if (flashCard) {
    flashCard.classList.remove("flipped");
  }

  // 📊 학습 상호작용 추적 (독해 플래시 표시) - 단순 조회는 카운트하지 않음
  // const conceptId = example.id || example.concept_id || `reading_${currentIndex}`;
  // trackLearningInteraction(conceptId, false, "view"); // 중복 방지를 위해 주석 처리
}

async function navigateContent(direction) {
  if (isNavigating) {
    console.log("⚠️ 네비게이션 진행 중, 중복 실행 방지");
    return;
  }

  const currentData = getCurrentData();
  if (!currentData || currentData.length === 0) {
    console.log("❌ 네비게이션: 데이터가 없음");
    return;
  }

  isNavigating = true;

  console.log(
    `🔄 네비게이션: 현재 인덱스 ${currentIndex}, 방향 ${direction}, 총 데이터 ${currentData.length}개`
  );

  const oldIndex = currentIndex;

  // 📚 현재 항목 학습 완료로 추적 (다음으로 넘어갈 때)
  const currentItem = currentData[currentIndex];
  if (direction > 0 && currentItem) {
    const conceptId =
      currentItem.id ||
      currentItem.concept_id ||
      `${currentLearningArea}_${currentIndex}`;

    // 🎯 타이핑 모드에서 답변하지 않고 다음으로 넘어가는 경우 처리
    if (currentLearningMode === "typing") {
      const answerInput = document.getElementById("typing-mode-answer");
      const resultDiv = document.getElementById("typing-mode-result");

      // 입력값이 있지만 결과가 표시되지 않았다면 (정답 확인 안 함)
      if (
        answerInput &&
        answerInput.value.trim() &&
        resultDiv &&
        resultDiv.classList.contains("hidden")
      ) {
        // 답변은 했지만 확인하지 않은 경우 - 타이핑 모드에서는 상호작용으로 계산하지 않음
        console.log(`⚠️ 타이핑 모드: 답변했지만 확인하지 않음 - 상호작용 무시`);
      } else if (answerInput && !answerInput.value.trim()) {
        // 아예 답변하지 않은 경우 - 타이핑 모드에서는 상호작용으로 계산하지 않음
        console.log(`⚠️ 타이핑 모드: 답변하지 않음 - 상호작용 무시`);
      }
      // 이미 정답 확인을 했다면 checkTypingAnswer에서 이미 추적했으므로 중복 추적하지 않음
    } else {
      // 다른 모드들의 기존 로직
      // 🎯 다음 버튼 클릭 시 카드 뒤집기 여부 확인
      const isFlashcardMode = currentLearningMode === "flashcard";
      const isReadingFlashMode =
        currentLearningArea === "reading" && currentLearningMode === "flash";

      if (isFlashcardMode) {
        // 플래시카드 모드: 카드를 뒤집지 않고 다음 버튼 누른 경우만 추적
        if (!isFlipped) {
          trackLearningInteraction(conceptId, false, "navigate_unflipped");
        }
        // 카드를 뒤집었다면 flip 시점에서 이미 추적했으므로 중복 추적하지 않음
      } else if (isReadingFlashMode) {
        // 독해 플래시 모드에서는 뒤집기 여부를 추적하지 않음
        // 하지만 개념 제시는 추적해야 함
        trackLearningInteraction(conceptId, true, "navigate_completed");
      } else {
        // 다른 모드들: 기본적으로 정상 완료로 처리
        trackLearningInteraction(conceptId, true, "navigate_completed");
      }
    }

    checkSessionCompletion();
  }

  currentIndex += direction;

  // 🚫 범위 제한 - 데이터 끝에서 멈춤
  if (currentIndex >= currentData.length) {
    currentIndex = currentData.length - 1; // 마지막에서 멈춤
    showLearningComplete(); // 학습 완료 UI 표시
    return;
  } else if (currentIndex < 0) {
    currentIndex = 0; // 첫 번째에서 멈춤
  }

  console.log(`🔄 네비게이션: ${oldIndex} → ${currentIndex}`);

  // 현재 모드에 따라 업데이트
  try {
    // 모든 카드 타입의 뒤집기 상태 초기화 (새 카드는 항상 앞면부터 시작)
    isFlipped = false;

    // 일반 플래시카드 뒤집기 상태 초기화 (정확한 ID 사용)
    const flashcardModeCard = document.getElementById("flashcard-mode-card");
    if (flashcardModeCard) {
      flashcardModeCard.classList.remove("flipped");
      console.log("🔄 플래시카드 뒤집기 상태 초기화: flipped 클래스 제거");
    }

    // 다른 방식의 플래시카드도 확인
    const flashcardElement = document.querySelector(".flashcard");
    if (flashcardElement) {
      flashcardElement.classList.remove("flipped");
    }

    // 독해 플래시카드 뒤집기 상태 초기화
    const readingFlashCard = document.getElementById("reading-flash-card");
    if (readingFlashCard) {
      readingFlashCard.classList.remove("flipped");
    }

    switch (currentLearningArea) {
      case "vocabulary":
        switch (currentLearningMode) {
          case "flashcard":
            updateFlashcard();
            break;
          case "typing":
            updateTyping();
            break;
          case "listening":
            updateListeningMode();
            break;
        }
        break;
      case "grammar":
        switch (currentLearningMode) {
          case "pattern":
            updateGrammarPatterns();
            break;
          case "practice":
            updateGrammarPractice();
            break;
        }
        break;
      case "reading":
        switch (currentLearningMode) {
          case "example":
            updateReadingExample();
            break;
          case "flash":
            updateReadingFlash();
            break;
          default:
            updateReadingExample();
        }
        break;
    }
  } finally {
    // 네비게이션 완료 후 플래그 해제 (더 짧은 시간으로 조정)
    setTimeout(() => {
      isNavigating = false;
    }, 50);
  }
}

// 전역 함수로 내보내기
window.startLearningMode = startLearningMode;
window.flipCard = flipCard;
window.checkTypingAnswer = checkTypingAnswer;
window.flipGrammarCard = flipGrammarCard;
window.flipReadingCard = flipReadingCard;

// Enter 키로 타이핑 모드 답안 확인
document.addEventListener("keypress", function (e) {
  if (e.key === "Enter" && currentLearningMode === "typing") {
    checkTypingAnswer();
  }
});

// 언어별 데이터 필터링 함수
function filterDataByLanguage(data) {
  if (!Array.isArray(data)) return [];

  return data.filter((item) => {
    // expressions가 있는 경우 (개념 데이터)
    if (item.expressions) {
      const hasSource = item.expressions[sourceLanguage]?.word;
      const hasTarget = item.expressions[targetLanguage]?.word;
      return hasSource && hasTarget;
    }

    // 독해 데이터 필터링 (언어별 텍스트가 있는지 확인)
    if (item[sourceLanguage] && item[targetLanguage]) {
      return true;
    }

    // translations 구조가 있는 경우
    if (item.translations) {
      const hasSource = item.translations[sourceLanguage];
      const hasTarget = item.translations[targetLanguage];
      return hasSource && hasTarget;
    }

    // 기타 데이터는 모두 포함
    return true;
  });
}

// 다국어 문법 패턴 생성 함수
function generateMultilingualGrammarPatterns() {
  const patterns = [];

  // 언어별 기본 문법 패턴 정의
  const grammarPatterns = {
    korean: [
      {
        title: "현재진행형",
        structure: "동사 + 고 있다",
        explanation: "현재 진행 중인 동작이나 상태를 나타냅니다.",
        examples: [
          "나는 공부하고 있다.",
          "그는 책을 읽고 있다.",
          "우리는 영화를 보고 있다.",
        ],
      },
      {
        title: "과거형",
        structure: "동사 + 았/었다",
        explanation: "과거에 일어난 일을 나타냅니다.",
        examples: ["어제 친구를 만났다.", "영화를 봤다.", "맛있게 먹었다."],
      },
    ],
    english: [
      {
        title: "Present Continuous",
        structure: "be + V-ing",
        explanation: "Actions happening now or around now.",
        examples: [
          "I am studying English.",
          "She is reading a book.",
          "They are playing soccer.",
        ],
      },
      {
        title: "Past Perfect",
        structure: "had + past participle",
        explanation: "Actions completed before another past action.",
        examples: [
          "I had finished homework before dinner.",
          "She had left when I arrived.",
          "They had been friends for years.",
        ],
      },
    ],
    japanese: [
      {
        title: "現在進行形",
        structure: "動詞 + ている",
        explanation: "現在進行中の動作や状態を表します。",
        examples: ["勉強している。", "本を読んでいる。", "映画を見ている。"],
      },
      {
        title: "過去形",
        structure: "動詞 + た/だ",
        explanation: "過去に起こったことを表します。",
        examples: ["昨日友達に会った。", "映画を見た。", "美味しく食べた。"],
      },
    ],
    chinese: [
      {
        title: "现在进行时",
        structure: "正在 + 动词",
        explanation: "表示正在进行的动作或状态。",
        examples: ["我正在学习。", "他正在看书。", "我们正在看电影。"],
      },
      {
        title: "过去时",
        structure: "动词 + 了",
        explanation: "表示过去发生的事情。",
        examples: ["昨天见了朋友。", "看了电影。", "吃得很好。"],
      },
    ],
  };

  // 원본 언어의 패턴들을 기반으로 생성
  const sourcePatterns =
    grammarPatterns[sourceLanguage] || grammarPatterns.english;

  sourcePatterns.forEach((pattern, index) => {
    patterns.push({
      id: `${sourceLanguage}_pattern_${index + 1}`,
      pattern_id: `${sourceLanguage}_pattern_${index + 1}`,
      title: pattern.title,
      structure: pattern.structure,
      explanation: pattern.explanation,
      examples: pattern.examples,
      source: "generated_multilingual",
    });
  });

  return patterns;
}

// 기본 독해 예문 생성 함수
function generateBasicReadingExamples() {
  const examples = [];

  const basicExamples = {
    korean: {
      english: [
        {
          korean: "안녕하세요. 만나서 반갑습니다.",
          english: "Hello. Nice to meet you.",
          context: "첫 만남 인사",
        },
        {
          korean: "오늘 날씨가 정말 좋네요.",
          english: "The weather is really nice today.",
          context: "일상 대화",
        },
        {
          korean: "어디서 오셨나요?",
          english: "Where are you from?",
          context: "자기소개",
        },
      ],
      japanese: [
        {
          korean: "안녕하세요. 만나서 반갑습니다.",
          japanese: "こんにちは。はじめまして。",
          context: "첫 만남 인사",
        },
        {
          korean: "오늘 날씨가 정말 좋네요.",
          japanese: "今日はとてもいい天気ですね。",
          context: "일상 대화",
        },
        {
          korean: "어디서 오셨나요?",
          japanese: "どちらからいらっしゃいましたか？",
          context: "자기소개",
        },
      ],
      chinese: [
        {
          korean: "안녕하세요. 만나서 반갑습니다.",
          chinese: "你好。很高兴见到你。",
          context: "첫 만남 인사",
        },
        {
          korean: "오늘 날씨가 정말 좋네요.",
          chinese: "今天天气真好。",
          context: "일상 대화",
        },
        {
          korean: "어디서 오셨나요?",
          chinese: "你从哪里来？",
          context: "자기소개",
        },
      ],
      spanish: [
        {
          korean: "안녕하세요. 만나서 반갑습니다.",
          spanish: "Hola. Encantado de conocerte.",
          context: "첫 만남 인사",
        },
        {
          korean: "오늘 날씨가 정말 좋네요.",
          spanish: "El clima está muy agradable hoy.",
          context: "일상 대화",
        },
        {
          korean: "어디서 오셨나요?",
          spanish: "¿De dónde eres?",
          context: "자기소개",
        },
      ],
    },
    english: {
      korean: [
        {
          english: "Hello. Nice to meet you.",
          korean: "안녕하세요. 만나서 반갑습니다.",
          context: "First meeting",
        },
        {
          english: "The weather is really nice today.",
          korean: "오늘 날씨가 정말 좋네요.",
          context: "Daily conversation",
        },
        {
          english: "Where are you from?",
          korean: "어디서 오셨나요?",
          context: "Self-introduction",
        },
      ],
      japanese: [
        {
          english: "Hello. Nice to meet you.",
          japanese: "こんにちは。はじめまして。",
          context: "First meeting",
        },
        {
          english: "The weather is really nice today.",
          japanese: "今日はとてもいい天気ですね。",
          context: "Daily conversation",
        },
        {
          english: "Where are you from?",
          japanese: "どちらからいらっしゃいましたか？",
          context: "Self-introduction",
        },
      ],
      chinese: [
        {
          english: "Hello. Nice to meet you.",
          chinese: "你好。很高兴见到你。",
          context: "First meeting",
        },
        {
          english: "The weather is really nice today.",
          chinese: "今天天气真好。",
          context: "Daily conversation",
        },
        {
          english: "Where are you from?",
          chinese: "你从哪里来？",
          context: "Self-introduction",
        },
      ],
      spanish: [
        {
          english: "Hello. Nice to meet you.",
          spanish: "Hola. Encantado de conocerte.",
          context: "First meeting",
        },
        {
          english: "The weather is really nice today.",
          spanish: "El clima está muy agradable hoy.",
          context: "Daily conversation",
        },
        {
          english: "Where are you from?",
          spanish: "¿De dónde eres?",
          context: "Self-introduction",
        },
      ],
    },
    spanish: {
      korean: [
        {
          spanish: "Hola. Encantado de conocerte.",
          korean: "안녕하세요. 만나서 반갑습니다.",
          context: "Primera reunión",
        },
        {
          spanish: "El clima está muy agradable hoy.",
          korean: "오늘 날씨가 정말 좋네요.",
          context: "Conversación diaria",
        },
        {
          spanish: "¿De dónde eres?",
          korean: "어디서 오셨나요?",
          context: "Autopresentación",
        },
      ],
      english: [
        {
          spanish: "Hola. Encantado de conocerte.",
          english: "Hello. Nice to meet you.",
          context: "Primera reunión",
        },
        {
          spanish: "El clima está muy agradable hoy.",
          english: "The weather is really nice today.",
          context: "Conversación diaria",
        },
        {
          spanish: "¿De dónde eres?",
          english: "Where are you from?",
          context: "Autopresentación",
        },
      ],
      japanese: [
        {
          spanish: "Hola. Encantado de conocerte.",
          japanese: "こんにちは。はじめまして。",
          context: "Primera reunión",
        },
        {
          spanish: "El clima está muy agradable hoy.",
          japanese: "今日はとてもいい天気ですね。",
          context: "Conversación diaria",
        },
        {
          spanish: "¿De dónde eres?",
          japanese: "どちらからいらっしゃいましたか？",
          context: "Autopresentación",
        },
      ],
      chinese: [
        {
          spanish: "Hola. Encantado de conocerte.",
          chinese: "你好。很高兴见到你。",
          context: "Primera reunión",
        },
        {
          spanish: "El clima está muy agradable hoy.",
          chinese: "今天天气真好。",
          context: "Conversación diaria",
        },
        {
          spanish: "¿De dónde eres?",
          chinese: "你从哪里来？",
          context: "Autopresentación",
        },
      ],
    },
  };

  const sourceExamples =
    basicExamples[sourceLanguage]?.[targetLanguage] ||
    basicExamples.korean.english;

  sourceExamples.forEach((example, index) => {
    examples.push({
      id: `reading_${index + 1}`,
      example_id: `reading_${index + 1}`,
      [sourceLanguage]: example[sourceLanguage],
      [targetLanguage]: example[targetLanguage],
      context: example.context,
      source: "generated_basic",
    });
  });

  return examples;
}

// 지역화 헬퍼 함수들
function getLocalizedPatternTitle(data) {
  // 더 안정적인 언어 감지 로직
  const currentLanguage =
    currentUILanguage ||
    getCurrentLanguage() ||
    window.languageSettings?.currentUILanguage ||
    localStorage.getItem("preferredLanguage") ||
    "korean";

  // 짧은 언어 코드를 긴 언어 이름으로 매핑
  const languageMap = {
    ko: "korean",
    en: "english",
    ja: "japanese",
    zh: "chinese",
    es: "spanish",
    korean: "korean",
    english: "english",
    japanese: "japanese",
    chinese: "chinese",
    spanish: "spanish",
  };

  const mappedLanguage = languageMap[currentLanguage] || currentLanguage;
  console.log(`🌐 제목 언어 매핑: ${currentLanguage} → ${mappedLanguage}`);

  // pattern 객체 안의 현재 언어 데이터에서 제목 확인
  if (
    data.pattern &&
    data.pattern[mappedLanguage] &&
    data.pattern[mappedLanguage].title
  ) {
    console.log(`✅ pattern.${mappedLanguage}.title에서 제목 발견`);
    return data.pattern[mappedLanguage].title;
  }

  // pattern 객체 안의 한국어 데이터에서 제목 확인 (fallback)
  if (data.pattern && data.pattern.korean && data.pattern.korean.title) {
    console.log(`✅ fallback: pattern.korean.title에서 제목 발견`);
    return data.pattern.korean.title;
  }

  // pattern 객체 안의 제목 확인
  if (data.pattern && data.pattern.title) {
    console.log(`✅ pattern.title에서 제목 발견`);
    return data.pattern.title;
  }

  // pattern 객체 안의 name 확인
  if (data.pattern && data.pattern.name) {
    console.log(`✅ pattern.name에서 제목 발견`);
    return data.pattern.name;
  }

  // pattern 객체 안의 pattern_name 확인
  if (data.pattern && data.pattern.pattern_name) {
    console.log(`✅ pattern.pattern_name에서 제목 발견`);
    return data.pattern.pattern_name;
  }

  // 실제 DB 구조: pattern_name 필드 우선 사용
  if (data.pattern_name && data.pattern_name !== "문법 패턴") {
    console.log(`✅ data.pattern_name에서 제목 발견`);
    return data.pattern_name;
  }

  // 기존 구조 지원
  if (data.title) {
    console.log(`✅ data.title에서 제목 발견`);
    return data.title;
  }

  // purpose와 category 기반으로 제목 생성
  if (data.purpose || data.category) {
    const purpose = data.purpose || "";
    const category = data.category || "";

    // purpose를 한국어로 변환
    const purposeMap = {
      description: "설명",
      request: "요청",
      greeting: "인사",
      question: "질문",
      statement: "진술",
      command: "명령",
    };

    const categoryMap = {
      general: "일반",
      formal: "격식",
      casual: "비격식",
    };

    const koreanPurpose = purposeMap[purpose] || purpose;
    const koreanCategory = categoryMap[category] || category;

    if (koreanPurpose && koreanCategory) {
      console.log(
        `✅ purpose-category 기반 제목 생성: ${koreanPurpose} - ${koreanCategory}`
      );
      return `${koreanPurpose} - ${koreanCategory}`;
    } else if (koreanPurpose) {
      console.log(`✅ purpose 기반 제목 생성: ${koreanPurpose} 패턴`);
      return `${koreanPurpose} 패턴`;
    } else if (koreanCategory) {
      console.log(`✅ category 기반 제목 생성: ${koreanCategory} 문법`);
      return `${koreanCategory} 문법`;
    }
  }

  // 패턴 ID에서 제목 생성
  if (data.pattern_id) {
    console.log(`✅ pattern_id 기반 제목 생성`);
    return generatePatternTitle(data.pattern_id, data);
  }

  console.log(`⚠️ 기본 제목 사용: 문법 패턴`);
  return "문법 패턴";
}

function getLocalizedPatternStructure(data) {
  // structure는 대상언어 → 원본언어 순으로 표시 (예문과 반대)
  const sourceLanguage = window.languageSettings?.sourceLanguage || "korean";
  const targetLanguage = window.languageSettings?.targetLanguage || "english";

  let sourceStructure = "";
  let targetStructure = "";

  // 원본언어의 structure 확인
  if (
    data.pattern &&
    data.pattern[sourceLanguage] &&
    data.pattern[sourceLanguage].structure
  ) {
    sourceStructure = data.pattern[sourceLanguage].structure;
  } else if (
    data.pattern &&
    data.pattern.korean &&
    data.pattern.korean.structure
  ) {
    sourceStructure = data.pattern.korean.structure;
  } else if (data.structural_pattern) {
    sourceStructure = data.structural_pattern;
  } else if (data.structure) {
    sourceStructure = data.structure;
  }

  // 대상언어의 structure 확인
  if (
    data.pattern &&
    data.pattern[targetLanguage] &&
    data.pattern[targetLanguage].structure
  ) {
    targetStructure = data.pattern[targetLanguage].structure;
  } else if (
    data.pattern &&
    data.pattern.english &&
    data.pattern.english.structure
  ) {
    targetStructure = data.pattern.english.structure;
  }

  // 대상언어 → 원본언어 순으로 표시
  if (targetStructure && sourceStructure) {
    return `${targetStructure} → ${sourceStructure}`;
  } else if (sourceStructure) {
    return sourceStructure;
  } else if (targetStructure) {
    return targetStructure;
  }

  // 새 템플릿 구조 지원
  if (data.explanations && data.explanations[sourceLanguage]) {
    const structure = data.explanations[sourceLanguage].pattern || "";
    return structure;
  }

  return "구조 정보 없음";
}

function getLocalizedPatternExplanation(data) {
  // 더 안정적인 언어 감지 로직
  const currentLanguage =
    currentUILanguage ||
    getCurrentLanguage() ||
    window.languageSettings?.currentUILanguage ||
    localStorage.getItem("preferredLanguage") ||
    "korean";

  // 짧은 언어 코드를 긴 언어 이름으로 매핑
  const languageMap = {
    ko: "korean",
    en: "english",
    ja: "japanese",
    zh: "chinese",
    korean: "korean",
    english: "english",
    japanese: "japanese",
    chinese: "chinese",
  };

  const mappedLanguage = languageMap[currentLanguage] || currentLanguage;
  console.log(`🌐 설명 언어 매핑: ${currentLanguage} → ${mappedLanguage}`);

  // 1. 최상위 descriptions 객체에서 현재 언어 확인 (가장 일반적인 구조)
  if (data.descriptions && data.descriptions[mappedLanguage]) {
    console.log(`✅ descriptions.${mappedLanguage}에서 설명 발견`);
    return data.descriptions[mappedLanguage];
  }

  // 2. pattern 객체 안의 현재 언어 데이터에서 설명 확인
  if (
    data.pattern &&
    data.pattern[mappedLanguage] &&
    data.pattern[mappedLanguage].explanation
  ) {
    console.log(`✅ pattern.${mappedLanguage}.explanation에서 설명 발견`);
    return data.pattern[mappedLanguage].explanation;
  }

  // 3. pattern 객체 안의 현재 언어 데이터에서 description 확인
  if (
    data.pattern &&
    data.pattern[mappedLanguage] &&
    data.pattern[mappedLanguage].description
  ) {
    console.log(`✅ pattern.${mappedLanguage}.description에서 설명 발견`);
    return data.pattern[mappedLanguage].description;
  }

  // 4. pattern 객체 안의 다국어 설명 확인
  if (
    data.pattern &&
    data.pattern.explanations &&
    data.pattern.explanations[mappedLanguage]
  ) {
    console.log(`✅ pattern.explanations.${mappedLanguage}에서 설명 발견`);
    return data.pattern.explanations[mappedLanguage];
  }

  // 5. pattern 객체 안의 descriptions 확인
  if (
    data.pattern &&
    data.pattern.descriptions &&
    data.pattern.descriptions[mappedLanguage]
  ) {
    console.log(`✅ pattern.descriptions.${mappedLanguage}에서 설명 발견`);
    return data.pattern.descriptions[mappedLanguage];
  }

  // 6. 새로운 단일 설명 구조: explanation 문자열 (현재 언어가 한국어인 경우만)
  if (
    data.explanation &&
    typeof data.explanation === "string" &&
    mappedLanguage === "korean"
  ) {
    console.log(`✅ explanation 문자열에서 설명 발견 (한국어)`);
    return data.explanation;
  }

  // 7. 한국어 fallback들 (현재 언어가 한국어가 아닌 경우 마지막에 시도)
  if (mappedLanguage !== "korean") {
    // 영어 fallback 시도
    if (mappedLanguage === "english") {
      if (data.descriptions && data.descriptions.english) {
        console.log(`✅ fallback: descriptions.english에서 설명 발견`);
        return data.descriptions.english;
      }
      if (
        data.pattern &&
        data.pattern.english &&
        data.pattern.english.explanation
      ) {
        console.log(`✅ fallback: pattern.english.explanation에서 설명 발견`);
        return data.pattern.english.explanation;
      }
      if (
        data.pattern &&
        data.pattern.english &&
        data.pattern.english.description
      ) {
        console.log(`✅ fallback: pattern.english.description에서 설명 발견`);
        return data.pattern.english.description;
      }
    }

    // 일본어 fallback 시도
    if (mappedLanguage === "japanese") {
      if (data.descriptions && data.descriptions.japanese) {
        console.log(`✅ fallback: descriptions.japanese에서 설명 발견`);
        return data.descriptions.japanese;
      }
      if (
        data.pattern &&
        data.pattern.japanese &&
        data.pattern.japanese.explanation
      ) {
        console.log(`✅ fallback: pattern.japanese.explanation에서 설명 발견`);
        return data.pattern.japanese.explanation;
      }
      if (
        data.pattern &&
        data.pattern.japanese &&
        data.pattern.japanese.description
      ) {
        console.log(`✅ fallback: pattern.japanese.description에서 설명 발견`);
        return data.pattern.japanese.description;
      }
    }

    // 중국어 fallback 시도
    if (mappedLanguage === "chinese") {
      if (data.descriptions && data.descriptions.chinese) {
        console.log(`✅ fallback: descriptions.chinese에서 설명 발견`);
        return data.descriptions.chinese;
      }
      if (
        data.pattern &&
        data.pattern.chinese &&
        data.pattern.chinese.explanation
      ) {
        console.log(`✅ fallback: pattern.chinese.explanation에서 설명 발견`);
        return data.pattern.chinese.explanation;
      }
      if (
        data.pattern &&
        data.pattern.chinese &&
        data.pattern.chinese.description
      ) {
        console.log(`✅ fallback: pattern.chinese.description에서 설명 발견`);
        return data.pattern.chinese.description;
      }
    }
  }

  // 8. 한국어 데이터에서 설명 확인 (최종 fallback)
  if (data.descriptions && data.descriptions.korean) {
    console.log(`✅ final fallback: descriptions.korean에서 설명 발견`);
    return data.descriptions.korean;
  }

  if (data.pattern && data.pattern.korean && data.pattern.korean.explanation) {
    console.log(`✅ final fallback: pattern.korean.explanation에서 설명 발견`);
    return data.pattern.korean.explanation;
  }

  if (data.pattern && data.pattern.korean && data.pattern.korean.description) {
    console.log(`✅ final fallback: pattern.korean.description에서 설명 발견`);
    return data.pattern.korean.description;
  }

  // 9. pattern 객체 안의 설명 확인
  if (data.pattern && data.pattern.explanation) {
    console.log(`✅ pattern.explanation에서 설명 발견`);
    return data.pattern.explanation;
  }

  // 10. pattern 객체 안의 description 확인
  if (data.pattern && data.pattern.description) {
    console.log(`✅ pattern.description에서 설명 발견`);
    return data.pattern.description;
  }

  // 11. 새로운 단일 설명 구조: explanation 문자열
  if (data.explanation && typeof data.explanation === "string") {
    console.log(`✅ explanation 문자열에서 설명 발견`);
    return data.explanation;
  }

  // 12. purpose나 category 기반으로 기본 설명 생성 (최후의 수단)
  if (data.purpose || data.category) {
    const purpose = data.purpose || "일반";
    const category = data.category || "기본";
    console.log(`⚠️ 기본 설명 생성: ${purpose} - ${category}`);
    return `${purpose} 상황에서 사용하는 ${category} 문법 패턴입니다.`;
  }

  console.log(`❌ 설명을 찾을 수 없음`);
  return "설명 정보 없음";
}

function getLocalizedPatternExamples(data) {
  const currentLanguage =
    window.languageSettings?.currentUILanguage || "korean";
  const sourceLanguage = window.languageSettings?.sourceLanguage || "korean";
  const targetLanguage = window.languageSettings?.targetLanguage || "english";

  // 새로운 단일 예문 구조: example 객체 - 대상언어 → 원본언어 순으로 표시
  if (data.example && typeof data.example === "object") {
    const sourceText =
      data.example[sourceLanguage] || data.example.korean || "";
    const targetText =
      data.example[targetLanguage] || data.example.english || "";

    if (sourceText && targetText) {
      return [`${targetText} → ${sourceText}`];
    } else if (sourceText) {
      return [sourceText];
    }
  }

  // examples 배열 구조 (이전 호환성) - 대상언어 → 원본언어 순으로 표시
  if (data.examples && Array.isArray(data.examples)) {
    return data.examples
      .map((example) => {
        if (typeof example === "object") {
          const sourceText = example[sourceLanguage] || example.korean || "";
          const targetText = example[targetLanguage] || example.english || "";
          return sourceText && targetText
            ? `${targetText} → ${sourceText}`
            : sourceText || targetText;
        }
        return example;
      })
      .filter((example) => example);
  }

  // explanation을 예문으로 사용 (fallback)
  if (data.explanation) {
    return [data.explanation];
  }

  // teaching_notes에서 예문 추출 시도
  if (data.teaching_notes && data.teaching_notes[currentLanguage]) {
    return [data.teaching_notes[currentLanguage]];
  }

  // learning_focus를 예문으로 변환
  if (data.learning_focus && Array.isArray(data.learning_focus)) {
    return data.learning_focus.map((focus) => `${focus} 관련 학습`);
  }

  return ["사용 예문이 없습니다."];
}

function getLocalizedExample(data) {
  if (data.translations) {
    const sourceText = data.translations[sourceLanguage];
    const targetText = data.translations[targetLanguage];
    if (sourceText && targetText) {
      const source =
        typeof sourceText === "object" ? sourceText.text : sourceText;
      const target =
        typeof targetText === "object" ? targetText.text : targetText;
      return `${source} → ${target}`;
    }
  }
  return "예문";
}

function getLocalizedReadingExample(data) {
  // 현재 언어 설정 가져오기
  const currentSourceLanguage =
    window.languageSettings?.sourceLanguage || "korean";
  const currentTargetLanguage =
    window.languageSettings?.targetLanguage || "english";

  // 새로운 translations 구조 지원
  if (data.translations) {
    const sourceText = data.translations[currentSourceLanguage];
    const targetText = data.translations[currentTargetLanguage];

    if (sourceText && targetText) {
      const result = {
        [currentSourceLanguage]:
          typeof sourceText === "object" ? sourceText.text : sourceText,
        [currentTargetLanguage]:
          typeof targetText === "object" ? targetText.text : targetText,
        context: data.context || "일반",
        difficulty: data.difficulty || "beginner",
        situation: data.situation, // situation 속성 추가
        domain: data.domain, // domain 속성 추가
        purpose: data.purpose, // purpose 속성 추가
        romanization:
          (typeof sourceText === "object" ? sourceText.romanization : "") || "",
        phonetic:
          (typeof targetText === "object" ? targetText.phonetic : "") || "",
      };
      return result;
    }
  }

  // 기존 구조 지원 (직접 언어 필드가 있는 경우)
  if (data[currentSourceLanguage] && data[currentTargetLanguage]) {
    const result = {
      [currentSourceLanguage]: data[currentSourceLanguage],
      [currentTargetLanguage]: data[currentTargetLanguage],
      context: data.context || "일반",
      difficulty: data.difficulty || "beginner",
      situation: data.situation, // situation 속성 추가
      domain: data.domain, // domain 속성 추가
      purpose: data.purpose, // purpose 속성 추가
    };
    return result;
  }

  // 기본 텍스트 필드 지원
  if (data.text || data.content) {
    const text = data.text || data.content;
    const result = {
      [currentSourceLanguage]: text,
      [currentTargetLanguage]: text, // 번역이 없으면 동일한 텍스트 사용
      context: data.context || "일반",
      difficulty: data.difficulty || "beginner",
      situation: data.situation, // situation 속성 추가
      domain: data.domain, // domain 속성 추가
      purpose: data.purpose, // purpose 속성 추가
    };
    return result;
  }

  return null;
}

function generatePatternTitle(patternId, data) {
  // 패턴 ID에서 제목 추론
  if (patternId.includes("present")) return "현재형";
  if (patternId.includes("past")) return "과거형";
  if (patternId.includes("future")) return "미래형";
  if (patternId.includes("continuous")) return "진행형";
  return patternId.replace(/_/g, " ");
}

function extractPatternStructure(data) {
  // 예문에서 구조 추론
  return "기본 문장 구조";
}

function generatePatternExplanation(patternId, data) {
  return `${patternId} 패턴에 대한 설명입니다.`;
}

// 현재 학습 모드 업데이트 함수
function updateCurrentLearningMode() {
  console.log(
    `🔄 현재 학습 모드 업데이트: ${currentLearningArea} - ${currentLearningMode}`
  );

  // 현재 인덱스 초기화
  currentIndex = 0;

  // 학습 모드별 화면 업데이트
  switch (currentLearningMode) {
    case "flashcard":
      updateFlashcard();
      break;
    case "typing":
      updateTyping();
      break;
    case "grammar-pattern":
      updateGrammarPatterns();
      break;
    case "grammar-practice":
      updateGrammarPractice();
      break;
    case "reading-example":
      updateReadingExample();
      break;
    case "reading-flash":
      updateReadingFlash();
      break;
    default:
      console.log(`⚠️ 알 수 없는 학습 모드: ${currentLearningMode}`);
  }
}

// 삭제 기능 수정 - sessionStorage와 생성된 데이터 처리
async function deleteItem(itemId, itemType) {
  if (!itemId || !itemType) {
    console.error("❌ 삭제할 항목 정보가 부족합니다.");
    return;
  }

  const confirmDelete = confirm(
    `이 ${getItemTypeName(
      itemType
    )} 항목을 삭제하시겠습니까?\n삭제된 데이터는 복구할 수 없습니다.`
  );

  if (!confirmDelete) {
    console.log("🚫 삭제 취소됨");
    return;
  }

  try {
    console.log(`🗑️ 삭제 시작: ${itemType} - ${itemId}`);

    // 먼저 삭제할 항목 정보 확인 (배열에서 제거하기 전에)
    const currentItem = currentData.find((item) => item.id === itemId);
    console.log(`🔍 삭제할 항목:`, currentItem);

    // 실제 DB 데이터인지 확인
    // Firebase 문서 ID는 보통 15-20자의 영숫자 조합
    const isFirebaseDocId =
      itemId.length >= 15 && /^[a-zA-Z0-9]+$/.test(itemId);

    // 실제 DB 데이터 판별 조건:
    // 1. source 필드가 컬렉션명인 경우
    // 2. Firebase 문서 ID 형태인 경우
    const shouldDeleteFromFirebase =
      currentItem &&
      (currentItem.source === "examples" ||
        currentItem.source === "grammar" ||
        currentItem.source === "concepts" ||
        isFirebaseDocId);

    console.log(
      `🔍 삭제 데이터 확인: ID=${itemId}, source=${currentItem?.source}, isFirebaseDocId=${isFirebaseDocId}, shouldDeleteFromFirebase=${shouldDeleteFromFirebase}`
    );

    // Firebase에서 먼저 삭제 (실제 DB 데이터인 경우)
    if (shouldDeleteFromFirebase) {
      console.log("🔥 Firebase에서 실제 삭제 진행...");

      const isFirebaseReady = await waitForFirebaseInit();
      if (isFirebaseReady) {
        try {
          const { db, doc, deleteDoc } = window.firebaseInit;

          let collectionName;
          switch (itemType) {
            case "vocabulary":
              collectionName = "concepts";
              break;
            case "grammar":
              collectionName = "grammar";
              break;
            case "reading":
              collectionName = "examples";
              break;
            default:
              console.error("❌ 알 수 없는 항목 타입:", itemType);
              return;
          }

          const docRef = doc(db, collectionName, itemId);
          await deleteDoc(docRef);

          console.log(`✅ Firebase에서 삭제 완료: ${itemId}`);
        } catch (firebaseError) {
          console.warn("⚠️ Firebase 삭제 중 오류:", firebaseError);
          alert(
            "원격 데이터 삭제 중 오류가 발생했습니다. 로컬 삭제는 계속 진행됩니다."
          );
        }
      } else {
        console.warn(
          "⚠️ Firebase 초기화가 완료되지 않았지만 로컬 삭제는 진행됩니다."
        );
      }
    } else {
      console.log("📝 생성된 데이터이므로 Firebase 삭제 건너뜀");
    }

    // 현재 데이터에서 제거
    if (currentData && Array.isArray(currentData)) {
      const itemIndex = currentData.findIndex((item) => item.id === itemId);
      if (itemIndex !== -1) {
        currentData.splice(itemIndex, 1);
        console.log(
          `✅ 로컬 데이터에서 제거 완료. 남은 데이터: ${currentData.length}개`
        );

        // 인덱스 조정
        if (currentIndex >= currentData.length) {
          currentIndex = Math.max(0, currentData.length - 1);
        }

        // 데이터가 없으면 영역 선택으로 돌아가기
        if (currentData.length === 0) {
          const areaName = getItemTypeName(itemType);
          alert(
            `모든 ${areaName} 데이터가 삭제되었습니다.\n\n새로운 데이터를 업로드하거나 다른 학습 영역을 선택해주세요.`
          );
          showAreaSelection();
          return;
        }

        // UI 업데이트
        updateCurrentView();
      }
    }

    // sessionStorage에서도 제거 (단어 학습의 경우)
    if (itemType === "vocabulary") {
      try {
        const vocabularyData = JSON.parse(
          sessionStorage.getItem("vocabularyData") || "[]"
        );
        const filteredData = vocabularyData.filter(
          (item) => item.id !== itemId
        );
        sessionStorage.setItem("vocabularyData", JSON.stringify(filteredData));
        console.log("✅ sessionStorage에서 단어 데이터 제거 완료");
      } catch (error) {
        console.warn("⚠️ sessionStorage 처리 중 오류:", error);
      }
    }

    alert("삭제가 완료되었습니다.");
  } catch (error) {
    console.error("❌ 삭제 중 오류 발생:", error);
    alert("삭제 중 오류가 발생했습니다. 다시 시도해주세요.");
  }
}

function getItemTypeName(itemType) {
  switch (itemType) {
    case "vocabulary":
      return "단어";
    case "grammar":
      return "문법";
    case "reading":
      return "독해";
    default:
      return "항목";
  }
}

// 현재 뷰 업데이트 함수
function updateCurrentView() {
  if (!currentLearningArea || !currentLearningMode) {
    console.warn("⚠️ 현재 영역 또는 모드가 설정되지 않음");
    return;
  }

  try {
    switch (currentLearningArea) {
      case "vocabulary":
        if (currentLearningMode === "flashcard") {
          updateFlashcard();
        } else if (currentLearningMode === "typing") {
          updateTyping();
        } else if (currentLearningMode === "pronunciation") {
          // 발음 모드는 아직 구현되지 않음
          console.log("🎤 발음 모드 업데이트 (구현 예정)");
        }
        break;
      case "grammar":
        if (currentLearningMode === "pattern") {
          updateGrammarPatterns();
        } else if (currentLearningMode === "practice") {
          updateGrammarPractice();
        }
        break;
      case "reading":
        if (currentLearningMode === "example") {
          updateReadingExample();
        } else if (currentLearningMode === "flash") {
          updateReadingFlash();
        }
        break;
    }
    console.log("✅ 현재 뷰 업데이트 완료");
  } catch (error) {
    console.error("❌ 뷰 업데이트 중 오류:", error);
  }
}

// 독해 플래시 카드 뒤집기 함수
function flipReadingCard() {
  console.log("🔄 flipReadingCard 함수 실행");
  const card = document.getElementById("reading-flash-card");
  console.log("🔍 카드 요소 찾기:", card);

  if (card) {
    console.log("✅ 카드 요소 발견, 현재 클래스:", card.className);
    const wasFlipped = card.classList.contains("flipped");
    card.classList.toggle("flipped");
    const isNowFlipped = card.classList.contains("flipped");

    console.log("🔄 뒤집기 후 클래스:", card.className);

    // 카드를 처음 뒤집었을 때만 학습 참여로 추적
    if (!wasFlipped && isNowFlipped) {
      const currentData = getCurrentData();
      if (currentData && currentData[currentIndex]) {
        const concept = currentData[currentIndex];
        const conceptId =
          concept.id || concept.concept_id || `reading_${currentIndex}`;
        trackLearningInteraction(conceptId, true, "flip"); // 뒤집기는 적극적인 학습 참여로 추적
        console.log("📊 독해 플래시 카드 뒤집기 추적됨:", conceptId);
      }
    } else if (wasFlipped && !isNowFlipped) {
      // 카드를 다시 앞면으로 뒤집은 경우는 추가 카운트하지 않음
      console.log("🔄 카드를 앞면으로 뒤집음 - 추가 카운트하지 않음");
    }

    console.log("✅ 독해 플래시 카드 뒤집기 완료");
  } else {
    console.error("❌ reading-flash-card 요소를 찾을 수 없습니다");
  }
}

// Firebase 사용자별 학습 기록 저장 (스냅샷 포함)
async function saveLearningRecordToFirebase(learningRecord) {
  try {
    // Firebase 인증 확인
    if (!window.firebaseInit || !window.firebaseInit.auth) {
      console.log("🔐 Firebase 인증이 초기화되지 않음");
      return;
    }

    const user = window.firebaseInit.auth.currentUser;
    if (!user) {
      console.log("🔐 로그인되지 않은 사용자");
      return;
    }

    // 사용자별 학습 기록 저장
    const userRef = window.firebaseInit.doc(
      window.firebaseInit.db,
      "users",
      user.email
    );

    // 기존 사용자 데이터 가져오기
    const userDoc = await window.firebaseInit.getDoc(userRef);
    const userData = userDoc.exists() ? userDoc.data() : {};

    // 학습 기록 업데이트
    const learningHistory = userData.learning_history || [];
    learningHistory.unshift(learningRecord);
    const trimmedHistory = learningHistory.slice(0, 100); // 최근 100개만 유지

    // Firebase에 업데이트
    await window.firebaseInit.setDoc(
      userRef,
      {
        learning_history: trimmedHistory,
        last_updated: new Date().toISOString(),
      },
      { merge: true }
    );

    console.log("☁️ Firebase 학습 기록 저장 완료:", {
      historyCount: trimmedHistory.length,
    });

    // 학습 시작 시에는 캐시 무효화 불필요 (완료 시에만 처리)
  } catch (error) {
    console.warn("☁️ Firebase 학습 기록 저장 실패:", error);
  }
}

// Firebase에서 사용자 학습 데이터 동기화
async function syncUserLearningData() {
  try {
    if (!window.firebaseInit || !window.firebaseInit.auth) {
      return;
    }

    const user = window.firebaseInit.auth.currentUser;
    if (!user) {
      return;
    }

    const userRef = window.firebaseInit.doc(
      window.firebaseInit.db,
      "users",
      user.email
    );
    const userDoc = await window.firebaseInit.getDoc(userRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();

      // 학습 히스토리 동기화 (로컬이 비어있는 경우에만)
      const localHistory = JSON.parse(
        localStorage.getItem("learningHistory") || "[]"
      );
      if (localHistory.length === 0 && userData.learning_history) {
        localStorage.setItem(
          "learningHistory",
          JSON.stringify(userData.learning_history)
        );
      }

      console.log("🔄 사용자 학습 데이터 동기화 완료");
    }
  } catch (error) {
    console.warn("🔄 사용자 학습 데이터 동기화 실패:", error);
  }
}

// 📚 학습 세션 시작 (개선된 버전)
function startLearningSession(area, mode) {
  learningSessionData = {
    startTime: new Date(),
    conceptsStudied: new Set(),
    totalInteractions: 0,
    correctAnswers: 0,
    sessionActive: true,
    area: area,
    mode: mode,
    trackedInteractions: new Set(), // 🎯 중복 상호작용 방지
  };
  console.log("📚 학습 세션 시작:", {
    area: area,
    mode: mode,
    startTime: learningSessionData.startTime,
  });
}

// 📚 학습 상호작용 추적 (개선된 버전) - 제시된 개념과 상호작용 분리
function trackLearningInteraction(
  conceptId,
  isCorrect = true,
  interactionType = "view"
) {
  if (!learningSessionData.sessionActive) return;

  // 🎯 제시된 개념 추적 (상호작용과 무관하게 모든 제시된 개념)
  if (conceptId) {
    learningSessionData.conceptsStudied.add(conceptId);
    console.log(
      `📚 개념 제시 추가: ${conceptId} (총 ${learningSessionData.conceptsStudied.size}개)`
    );
  }

  // 🚫 view는 상호작용으로 계산하지 않음
  if (interactionType === "view") {
    console.log(`�️ view 이벤트는 상호작용으로 계산하지 않음:`, {
      conceptId,
      interactionType,
      mode: learningSessionData.mode,
      area: learningSessionData.area,
    });
    return;
  }

  console.log(`🔍 상호작용 추적 시도:`, {
    conceptId,
    isCorrect,
    interactionType,
    mode: learningSessionData.mode,
    area: learningSessionData.area,
  });

  // 🎯 의미 있는 상호작용만 계산 (view는 이미 제외됨)
  const isFlashcardMode = learningSessionData.mode === "flashcard";
  const isTypingMode = learningSessionData.mode === "typing";
  const isFlashMode = learningSessionData.mode === "flash";
  const isGrammarPracticeMode = learningSessionData.mode === "practice";
  const isListeningMode = learningSessionData.mode === "listening";

  // 각 모드별 의미 있는 상호작용 정의
  let isMeaningfulInteraction = false;

  if (isFlashcardMode) {
    // 플래시카드 모드: 뒤집기와 네비게이션 모두 상호작용
    isMeaningfulInteraction =
      interactionType === "flip" || interactionType === "navigate_completed";
  } else if (isFlashMode) {
    // 독해 플래시 모드: 뒤집기만 상호작용 (navigate_completed 제외)
    isMeaningfulInteraction = interactionType === "flip";
  } else if (isGrammarPracticeMode) {
    // 문법실습 모드: 뒤집기만 상호작용
    isMeaningfulInteraction = interactionType === "grammar_flip";
  } else if (isTypingMode) {
    // 타이핑 모드: 정답 확인만 상호작용 (view는 제외)
    isMeaningfulInteraction = interactionType === "typing";
  } else if (isListeningMode) {
    // 듣기 모드: 발음 듣기만 상호작용 (view는 제외)
    isMeaningfulInteraction = interactionType === "listen";
  } else {
    // 기타 모드 (예문 학습 등): navigate_completed를 포함한 실제 상호작용 (view는 제외)
    isMeaningfulInteraction = interactionType !== "view";
  }

  if (!isMeaningfulInteraction) {
    return;
  }

  // 🎯 타이핑 모드 중복 방지: 같은 개념에 대해 정답 확인 후 skip은 무시
  if (isTypingMode && interactionType === "typing_skip") {
    const typingKey = `${conceptId}_typing`;
    if (
      learningSessionData.trackedInteractions &&
      learningSessionData.trackedInteractions.has(typingKey)
    ) {
      return;
    }
  }

  // 🎯 중복 방지: 같은 개념의 같은 상호작용 타입은 1회만 계산
  const interactionKey = `${conceptId}_${interactionType}`;

  if (!learningSessionData.trackedInteractions) {
    learningSessionData.trackedInteractions = new Set();
  }

  // 이미 추적된 상호작용인지 확인 (중복 방지)
  if (learningSessionData.trackedInteractions.has(interactionKey)) {
    return;
  }

  learningSessionData.trackedInteractions.add(interactionKey);
  learningSessionData.totalInteractions++;

  if (isCorrect) {
    learningSessionData.correctAnswers++;
  }

  // 간소화된 상호작용 추적 로그 (5개 단위로만)
  if (learningSessionData.totalInteractions % 5 === 0) {
    console.log("📊 학습 상호작용 추적:", {
      totalInteractions: learningSessionData.totalInteractions,
      correctAnswers: learningSessionData.correctAnswers,
      conceptsCount: learningSessionData.conceptsStudied.size,
    });
  }
}

// �� 학습 세션 완료 (10개 학습 후 또는 영역 전환 시)
async function completeLearningSession(forceComplete = false) {
  if (
    !learningSessionData.sessionActive ||
    !currentUser ||
    !collectionManager
  ) {
    return;
  }

  // 🚫 중복 실행 방지
  if (learningSessionData.isCompleting) {
    console.log("⚠️ 학습 세션 완료 중, 중복 실행 방지");
    return;
  }

  learningSessionData.isCompleting = true;

  // 🎯 최소 학습 조건 확인 (2개 이상 개념 학습 또는 1분 이상 학습)
  const studiedConceptsCount = learningSessionData.conceptsStudied.size; // 실제 학습한 개념 수
  const totalAvailableData = getCurrentData()?.length || 0; // 전체 제시된 데이터 수
  const endTime = new Date();
  const duration = Math.round(
    (endTime - learningSessionData.startTime) / 1000 / 60
  ); // 분 단위

  const shouldSaveSession =
    forceComplete || studiedConceptsCount >= 2 || duration >= 1;

  if (!shouldSaveSession) {
    // 세션 저장 조건 미달 (로그 제거)
    learningSessionData.sessionActive = false;
    return;
  }

  console.log("📊 세션 저장 조건:", {
    studiedConceptsCount,
    totalAvailableData,
    duration,
    forceComplete,
    shouldSaveSession,
  });

  // 현재 언어 설정을 여러 소스에서 확인
  function getCurrentLanguageSettings() {
    // 1. window.languageSettings 우선
    if (
      window.languageSettings?.sourceLanguage &&
      window.languageSettings?.targetLanguage
    ) {
      return {
        sourceLanguage: window.languageSettings.sourceLanguage,
        targetLanguage: window.languageSettings.targetLanguage,
      };
    }

    // 2. DOM 요소에서 직접 확인
    const sourceSelect =
      document.getElementById("source-language") ||
      document.getElementById("source-language-desktop");
    const targetSelect =
      document.getElementById("target-language") ||
      document.getElementById("target-language-desktop");

    if (sourceSelect?.value && targetSelect?.value) {
      return {
        sourceLanguage: sourceSelect.value,
        targetLanguage: targetSelect.value,
      };
    }

    // 3. 전역 변수 사용
    return {
      sourceLanguage: sourceLanguage || "korean",
      targetLanguage: targetLanguage || "english",
    };
  }

  const currentLanguageSettings = getCurrentLanguageSettings();
  const currentSourceLanguage = currentLanguageSettings.sourceLanguage;
  const currentTargetLanguage = currentLanguageSettings.targetLanguage;

  console.log("🔍 학습 활동 언어 설정 확인:", {
    windowSettings: window.languageSettings,
    domSourceValue:
      document.getElementById("source-language")?.value ||
      document.getElementById("source-language-desktop")?.value,
    domTargetValue:
      document.getElementById("target-language")?.value ||
      document.getElementById("target-language-desktop")?.value,
    globalSourceLanguage: sourceLanguage,
    globalTargetLanguage: targetLanguage,
    finalSourceLanguage: currentSourceLanguage,
    finalTargetLanguage: currentTargetLanguage,
  });

  const activityData = {
    user_email: currentUser?.email, // 사용자 이메일 명시적 추가
    type: learningSessionData.area,
    learning_mode: learningSessionData.mode, // 🆕 세부 학습 모드 추가
    conceptIds: Array.from(learningSessionData.conceptsStudied),
    session_duration: Math.max(duration, 1), // 최소 1분으로 설정
    concepts_studied: studiedConceptsCount, // 실제 학습한 개념 수
    correct_answers: learningSessionData.correctAnswers,
    total_interactions: learningSessionData.totalInteractions,
    sourceLanguage: currentSourceLanguage,
    targetLanguage: currentTargetLanguage,
    conceptType:
      learningSessionData.area === "reading"
        ? "examples"
        : learningSessionData.area, // 🔥 conceptType 추가
    // 학습 효율 계산 (0-100점) - 사용자 제시 공식 적용
    session_quality: (() => {
      // 1. 개념 점수 - 학습한 개념 수 × 6점 (최대 60점)
      const conceptScore = Math.min(60, studiedConceptsCount * 6);

      // 2. 시간 점수 - 1분까지 20점 만점, 1분 초과 시 감점 (최대 20점)
      let timeScore = 20;
      if (duration > 1) {
        // 1분 초과 시 적절히 감점 (분당 2점씩 감점)
        timeScore = Math.max(5, 20 - (duration - 1) * 2);
      }

      // 3. 상호작용 점수 - 상호작용 회수 × 2점 (최대 20점)
      const interactionScore = Math.min(
        20,
        learningSessionData.totalInteractions * 2
      );

      const totalQuality = conceptScore + timeScore + interactionScore;

      // 상세한 학습 효율 계산 로그
      console.log("📊 학습 효율 상세 계산 (사용자 공식):", {
        mode: currentLearningMode,
        area: currentLearningArea,
        studiedConceptsCount,
        duration,
        totalInteractions: learningSessionData.totalInteractions,
        conceptScore: conceptScore.toFixed(1),
        timeScore: timeScore.toFixed(1),
        interactionScore: interactionScore.toFixed(1),
        totalQuality: totalQuality.toFixed(1),
        finalQuality: Math.min(100, totalQuality),
      });

      // 최종 점수 반환 (100점 만점)
      return Math.min(100, totalQuality);
    })(),
  };

  try {
    console.log("[DEBUG] updateLearningActivity 호출 직전 데이터 검증:", {
      user_email: currentUser?.email,
      activityData: {
        type: activityData.type,
        learning_mode: activityData.learning_mode,
        conceptIds_count: activityData.conceptIds.length,
        session_duration: activityData.session_duration,
        concepts_studied: activityData.concepts_studied,
        correct_answers: activityData.correct_answers,
        total_interactions: activityData.total_interactions,
        session_quality: activityData.session_quality,
        conceptType: activityData.conceptType, // 🔥 conceptType 추가
        hasSessionQuality:
          activityData.session_quality !== undefined &&
          activityData.session_quality !== null,
      },
    });

    // 🔥 전체 activityData 객체 확인
    console.log("[DEBUG] 전체 activityData 객체:", activityData);

    const docRef = await collectionManager.updateLearningActivity(
      currentUser.email,
      activityData
    );
    console.log("✅ 학습 세션 저장 완료:", {
      studiedConceptsCount,
      totalAvailableData,
      duration: Math.max(duration, 1),
      interactions: learningSessionData.totalInteractions,
      learningEfficiency: activityData.session_quality, // 원본 값 그대로 표시
    });

    // 🆕 진도 페이지 캐시 무효화를 위한 타임스탬프 설정
    try {
      const targetLanguage = activityData.targetLanguage || "english";
      const invalidationTime = Date.now().toString();

      // 캐시 무효화 타임스탬프 설정
      localStorage.setItem(
        `cache_invalidated_${targetLanguage}`,
        invalidationTime
      );

      // 관련 캐시 삭제
      localStorage.removeItem(`total_words_cache_${targetLanguage}`);
      localStorage.removeItem(`mastered_words_cache_${targetLanguage}`);
      localStorage.removeItem(`stats_cache_${targetLanguage}`);

      console.log(
        `🔄 진도 페이지 캐시 무효화 완료 - 대상 언어: ${targetLanguage}, 타임스탬프: ${invalidationTime}`
      );
      console.log(
        `🗑️ 관련 캐시 삭제 완료 - 학습한 개념: ${activityData.conceptIds.length}개`
      );
    } catch (cacheError) {
      console.warn("⚠️ 진도 페이지 캐시 무효화 실패:", cacheError);
    }

    // 📚 학습 완료 데이터를 localStorage에 저장 (진도 페이지 자동 업데이트용)
    const learningCompletionData = {
      userId: currentUser?.uid,
      userEmail: currentUser?.email,
      area: learningSessionData.area,
      mode: learningSessionData.mode,
      conceptsCount: studiedConceptsCount,
      totalAvailableData,
      duration: Math.max(duration, 1),
      interactions: learningSessionData.totalInteractions,
      efficiency: activityData.session_quality, // 통일된 효율 값 사용
      timestamp: new Date().toISOString(),
    };

    localStorage.setItem(
      "learningCompletionUpdate",
      JSON.stringify(learningCompletionData)
    );

    console.log("📤 Progress 페이지 업데이트 신호 전송:", {
      efficiency: activityData.session_quality, // 반올림 제거
      docId: docRef?.id || null,
      studiedConcepts: studiedConceptsCount,
      totalConcepts: totalAvailableData,
    });

    // 세션 데이터 반환 (모달에서 사용)
    return {
      session_quality: activityData.session_quality,
      concepts_studied: studiedConceptsCount,
      duration: Math.max(duration, 1),
      interactions: learningSessionData.totalInteractions,
    };
  } catch (error) {
    console.error("❌ 학습 세션 저장 실패:", error);
    return null;
  }

  // 세션 초기화
  learningSessionData.sessionActive = false;
  learningSessionData.isCompleting = false;
}

// 📚 학습 세션 자동 완료 체크 (동적 완료 조건)
function checkSessionCompletion() {
  const conceptsCount = learningSessionData.conceptsStudied.size;
  const currentData = getCurrentData();
  const totalAvailableData = currentData ? currentData.length : 0;

  // 🎯 10개씩 세션으로 나누어 학습 - 10개 완료 시 자동 종료
  let completionThreshold = 10; // 항상 10개로 고정
  let shouldAutoComplete = false;

  if (
    learningSessionData.mode === "flashcard" ||
    learningSessionData.mode === "flash"
  ) {
    // 플래시카드/플래시 모드: 실제 뒤집은 카드 수가 10개 이상이어야 완료
    shouldAutoComplete = conceptsCount >= completionThreshold;
  } else if (learningSessionData.mode === "typing") {
    // 타이핑 모드: 실제 정답 확인한 개념 수가 10개 이상이어야 완료
    shouldAutoComplete = conceptsCount >= completionThreshold;
  } else {
    // 기타 모드: 10개 완료 시 자동 종료
    shouldAutoComplete = conceptsCount >= completionThreshold;
  }

  if (shouldAutoComplete && learningSessionData.sessionActive) {
    console.log(
      `🎯 ${conceptsCount}개 개념 학습 완료 - 세션 자동 종료 (${learningSessionData.mode} 모드, 목표: ${completionThreshold}개)`
    );
    completeLearningSession();

    // 🔄 새로운 세션 자동 시작 비활성화 (사용자가 명시적으로 새 세션 시작하도록)
    console.log("✅ 학습 세션 완료 - 새 세션 자동 시작 안함");
  } else if (conceptsCount % 5 === 0 && conceptsCount > 0) {
    console.log(
      `📊 진행 상황: ${conceptsCount}개 개념 학습 완료 (목표: ${completionThreshold}개)`
    );
  }
}

// 페이지 로드 시 사용자 데이터 동기화
window.addEventListener("load", async () => {
  // Firebase 초기화 대기
  await waitForFirebaseInit();

  // 사용자 데이터 동기화
  await syncUserLearningData();

  // UI 업데이트
  await updateRecentActivity();
});

// 페이지 이탈 시 진행 중인 세션 완료 (조건부)
window.addEventListener("beforeunload", () => {
  if (learningSessionData.sessionActive) {
    const conceptsCount = learningSessionData.conceptsStudied.size;
    const duration = Math.round(
      (new Date() - learningSessionData.startTime) / 1000 / 60
    );

    // 최소 조건 충족 시에만 저장 (2개 개념 또는 1분 이상)
    if (conceptsCount >= 2 || duration >= 1) {
      console.log("🔄 페이지 이탈 시 세션 저장:", { conceptsCount, duration });
      completeLearningSession();
    } else {
      console.log("🔄 페이지 이탈 시 세션 저장 조건 미달:", {
        conceptsCount,
        duration,
      });
      learningSessionData.sessionActive = false;
    }
  }
});

// 📚 학습 완료 UI 표시 (외부 통계 전달)
async function showLearningCompleteWithStats(sessionStats) {
  console.log("🎉 학습 완료! (통계 전달됨)", sessionStats);

  // 기존 완료 화면이 있다면 제거
  const existingOverlay = document.querySelector(
    ".learning-completion-overlay"
  );
  if (existingOverlay) {
    existingOverlay.remove();
    console.log("🗑️ 기존 완료 화면 제거됨");
  }

  // 현재 학습 모드와 영역에 따라 다른 완료 메시지 표시
  const completionMessage = generateCompletionMessage(sessionStats);
  console.log("📝 완료 메시지 생성:", completionMessage);

  // 완료 화면 HTML 생성 (data-i18n 속성 사용)
  const completionHTML = `
    <div class="learning-completion-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-8 max-w-md mx-4 text-center shadow-2xl">
        <div class="mb-6">
          <div class="text-6xl mb-4">🎉</div>
          <h2 class="text-2xl font-bold text-gray-800 mb-2" data-i18n="learning_completed">학습 완료!</h2>
          <p class="text-gray-600">${completionMessage}</p>
        </div>
        
        <div class="bg-gray-50 rounded-lg p-4 mb-6">
          <div class="grid grid-cols-3 gap-4 text-sm">
            <div>
              <div class="text-gray-500" data-i18n="concepts_presented">제시된 개념</div>
              <div class="font-bold text-lg">${sessionStats.conceptsCount}<span data-i18n="concepts_unit"></span></div>
            </div>
            <div>
              <div class="text-gray-500" data-i18n="learning_time">학습 시간</div>
              <div class="font-bold text-lg">${sessionStats.duration}<span data-i18n="minutes_unit">분</span></div>
            </div>
            <div>
              <div class="text-gray-500" data-i18n="interactions">상호작용</div>
              <div class="font-bold text-lg">${sessionStats.interactions}<span data-i18n="times_unit">회</span></div>
            </div>
          </div>
          <div class="mt-4 pt-4 border-t border-gray-200">
            <div class="text-center">
              <div class="text-gray-500 text-sm" data-i18n="learning_efficiency">학습 효율</div>
              <div class="font-bold text-2xl text-blue-600">${Math.round(sessionStats.efficiency)}%</div>
            </div>
          </div>
        </div>
        
        <div class="space-y-3">
          <button id="restart-learning-btn" class="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 rounded-lg font-medium transition-colors">
            ${getRestartButtonText(learningSessionData.area)}
          </button>
          <button id="back-to-areas-btn" class="w-full bg-gray-500 hover:bg-gray-600 text-white py-2 px-6 rounded-lg font-medium transition-colors" data-i18n="back_to_areas">🏠 영역 선택으로 돌아가기</button>
        </div>
      </div>
    </div>
  `;

  // 완료 화면을 DOM에 추가
  document.body.insertAdjacentHTML("beforeend", completionHTML);
  console.log("🎨 완료 화면 DOM에 추가됨");

  // 🌐 번역 적용
  setTimeout(() => {
    applyTranslations();
    console.log("🌐 학습 완료 모달 번역 적용됨");
  }, 50);

  // 추가된 요소 확인
  const addedOverlay = document.querySelector(".learning-completion-overlay");
  if (addedOverlay) {
    console.log("✅ 완료 화면 요소 확인됨:", addedOverlay);
  } else {
    console.error("❌ 완료 화면 요소를 찾을 수 없습니다!");
    return;
  }

  // 이벤트 리스너 등록
  document
    .getElementById("restart-learning-btn")
    .addEventListener("click", async () => {
      await restartLearningWithNewData();
    });

  document.getElementById("back-to-areas-btn").addEventListener("click", () => {
    // 🔧 학습 상태 초기화 (영역 선택으로 돌아갈 때)
    currentIndex = 0;
    sessionOffset = 0; // 세션 오프셋 리셋
    isFlipped = false;
    isNavigating = false;
    currentLearningArea = null;
    currentLearningMode = null;

    // 🎲 프리로드 데이터 랜덤화 (다음 학습을 위해)
    Object.keys(preloadedData).forEach(area => {
      if (preloadedData[area] && preloadedData[area].length > 0) {
        const shuffled = [...preloadedData[area]];
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        preloadedData[area] = shuffled;
        console.log(`🎲 ${area} 프리로드 데이터 랜덤화 완료`);
      }
    });

    // 🔄 학습 데이터 초기화
    areaData = {
      vocabulary: [],
      grammar: [],
      reading: [],
    };

    // 🧹 학습 세션 데이터 초기화
    if (typeof learningSessionData !== "undefined") {
      learningSessionData = {
        area: null,
        mode: null,
        startTime: null,
        conceptsStudied: new Set(),
        totalInteractions: 0,
        correctAnswers: 0,
        sessionActive: false,
      };
    }

    console.log("🏠 영역 선택으로 돌아가기 - 학습 상태 초기화 완료");

    removeCompletionOverlay();
    showAreaSelection();
  });

  console.log("✅ 학습 완료 화면 표시 완료");
}

// 📚 학습 완료 UI 표시
async function showLearningComplete() {
  console.log("🎉 학습 완료!");

  // 현재 세션 완료 처리 (모든 카드를 본 경우 강제 완료)
  if (learningSessionData.sessionActive) {
    await completeLearningSession(true); // forceComplete = true
  }

  // 학습 통계 계산
  const sessionStats = calculateSessionStats();

  // 현재 학습 모드와 영역에 따라 다른 완료 메시지 표시
  const completionMessage = generateCompletionMessage(sessionStats);

  // 완료 화면 HTML 생성 (data-i18n 속성 사용)
  const completionHTML = `
    <div class="learning-completion-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-8 max-w-md mx-4 text-center shadow-2xl">
        <div class="mb-6">
          <div class="text-6xl mb-4">🎉</div>
          <h2 class="text-2xl font-bold text-gray-800 mb-2" data-i18n="learning_completed">학습 완료!</h2>
          <p class="text-gray-600">${completionMessage}</p>
        </div>
        
        <div class="bg-gray-50 rounded-lg p-4 mb-6">
          <div class="grid grid-cols-3 gap-4 text-sm">
            <div>
              <div class="text-gray-500" data-i18n="concepts_presented">제시된 개념</div>
              <div class="font-bold text-lg">${sessionStats.conceptsCount}<span data-i18n="concepts_unit"></span></div>
            </div>
            <div>
              <div class="text-gray-500" data-i18n="learning_time">학습 시간</div>
              <div class="font-bold text-lg">${sessionStats.duration}<span data-i18n="minutes_unit">분</span></div>
            </div>
            <div>
              <div class="text-gray-500" data-i18n="interactions">상호작용</div>
              <div class="font-bold text-lg">${sessionStats.interactions}<span data-i18n="times_unit">회</span></div>
            </div>
          </div>
          <div class="mt-4 pt-4 border-t border-gray-200">
            <div class="text-center">
              <div class="text-gray-500 text-sm" data-i18n="learning_efficiency">학습 효율</div>
              <div class="font-bold text-2xl text-blue-600">${sessionStats.efficiency}%</div>
            </div>
          </div>
        </div>
        
        <div class="space-y-3">
          <button id="restart-learning-btn" class="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 rounded-lg font-medium transition-colors">
            ${getRestartButtonText(learningSessionData.area)}
          </button>
          <button id="back-to-areas-btn" class="w-full bg-gray-500 hover:bg-gray-600 text-white py-2 px-6 rounded-lg font-medium transition-colors" data-i18n="back_to_areas">🏠 영역 선택으로 돌아가기</button>
        </div>
      </div>
    </div>
  `;

  // 완료 화면을 DOM에 추가
  document.body.insertAdjacentHTML("beforeend", completionHTML);
  
  // 🌐 번역 적용
  setTimeout(() => {
    applyTranslations();
    console.log("🌐 학습 완료 모달 번역 적용됨");
  }, 50);

  // 이벤트 리스너 등록
  document
    .getElementById("restart-learning-btn")
    .addEventListener("click", async () => {
      await restartLearningWithNewData();
    });

  document.getElementById("back-to-areas-btn").addEventListener("click", () => {
    // 🔧 학습 상태 초기화 (영역 선택으로 돌아갈 때)
    currentIndex = 0;
    sessionOffset = 0; // 세션 오프셋 리셋
    isFlipped = false;
    isNavigating = false;
    currentLearningArea = null;
    currentLearningMode = null;

    // 🎲 프리로드 데이터 랜덤화 (다음 학습을 위해)
    Object.keys(preloadedData).forEach(area => {
      if (preloadedData[area] && preloadedData[area].length > 0) {
        const shuffled = [...preloadedData[area]];
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        preloadedData[area] = shuffled;
        console.log(`🎲 ${area} 프리로드 데이터 랜덤화 완료`);
      }
    });

    // 🔄 학습 데이터 초기화
    areaData = {
      vocabulary: [],
      grammar: [],
      reading: [],
    };

    // 🧹 학습 세션 데이터 초기화
    if (typeof learningSessionData !== "undefined") {
      learningSessionData = {
        area: null,
        mode: null,
        startTime: null,
        conceptsStudied: new Set(),
        totalInteractions: 0,
        correctAnswers: 0,
        sessionActive: false,
      };
    }

    console.log("🏠 영역 선택으로 돌아가기 - 학습 상태 초기화 완료");

    removeCompletionOverlay();
    showAreaSelection();
  });

  console.log("✅ 학습 완료 화면 표시 완료");
}

// 📊 세션 통계 계산
function calculateSessionStats() {
  const studiedConceptsCount = learningSessionData.conceptsStudied.size; // 실제 학습한 개념 수
  const totalAvailableData = getCurrentData()?.length || 0; // 전체 제시된 데이터 수
  const duration = Math.round(
    (new Date() - learningSessionData.startTime) / 1000 / 60
  );
  const interactions = learningSessionData.totalInteractions;

  // 학습 효율 계산 (저장된 계산과 동일한 방식)
  let baseScore = 0;

  if (currentLearningMode === "typing") {
    // 타이핑 모드: 정답률에 따른 기본 점수 (최대 60점)
    const actualCorrect = learningSessionData.correctAnswers || 0;
    const actualAttempts =
      learningSessionData.totalInteractions || totalAvailableData;
    const accuracyRate = actualCorrect / Math.max(actualAttempts, 1);
    baseScore = accuracyRate * 60; // 정답률 기반 기본 점수

    console.log("📊 완료 화면 - 타이핑 모드 정답률 계산:", {
      actualCorrect,
      actualAttempts,
      studiedConceptsCount,
      totalAvailableData,
      accuracyRate: (accuracyRate * 100).toFixed(1) + "%",
      baseScore: baseScore.toFixed(1),
    });
  } else if (
    currentLearningMode === "flash" &&
    currentLearningArea === "reading"
  ) {
    // 독해 플래시 모드: 모든 카드를 본 것을 기준으로 기본 점수 (최대 60점)
    // 카드를 모두 넘어가며 보는 것 자체가 학습이므로 전체 데이터 기준으로 계산
    baseScore = 60; // 모든 개념을 제시받았으므로 기본 점수 만점
  } else if (currentLearningMode === "practice") {
    // 문법 실습 모드: 제시된 개념 수 기준으로 기본 점수 (최대 60점)
    // 패턴 분석과 동일한 계산 방식 적용
    baseScore = Math.min(60, totalAvailableData * 6);
  } else if (currentLearningMode === "listening") {
    // 듣기 연습 모드: 모든 개념을 본 것을 기준으로 기본 점수 (최대 60점)
    // 모든 개념을 순차적으로 보는 것 자체가 학습이므로 전체 데이터 기준으로 계산
    baseScore = 60; // 모든 개념을 제시받았으므로 기본 점수 만점
  } else if (currentLearningMode === "flashcard") {
    // 단어 플래시카드 모드: 모든 카드를 본 것을 기준으로 기본 점수 (최대 60점)
    // 카드를 모두 넘어가며 보는 것 자체가 학습이므로 전체 데이터 기준으로 계산
    baseScore = 60; // 모든 개념을 제시받았으므로 기본 점수 만점
  } else {
    // 다른 모드: 기존 방식 (최대 60점)
    baseScore = Math.min(60, studiedConceptsCount * 6);
  }

  // 시간 효율 점수 계산 - 전체 데이터 기준
  const conceptsPerMinute = totalAvailableData / Math.max(duration, 1);
  let timeScore = 0;
  if (conceptsPerMinute >= 1 && conceptsPerMinute <= 10) {
    timeScore = 20;
  } else if (conceptsPerMinute > 10) {
    timeScore = Math.max(5, 20 - (conceptsPerMinute - 10) * 1);
  } else {
    timeScore = Math.max(5, conceptsPerMinute * 20);
  }

  // 참여도 점수 계산 - 전체 데이터 기준
  let participationScore = 0;
  if (currentLearningMode === "typing") {
    // 타이핑 모드: 실제 답변 시도 기준으로 참여도 계산 (최대 20점)
    const actualAttempts = learningSessionData.totalInteractions || 0;
    const participationRate = actualAttempts / Math.max(totalAvailableData, 1);
    participationScore = Math.min(20, participationRate * 20);

    console.log("📊 완료 화면 - 타이핑 모드 참여도 계산:", {
      actualAttempts,
      studiedConceptsCount,
      totalAvailableData,
      participationRate: (participationRate * 100).toFixed(1) + "%",
      participationScore: participationScore.toFixed(1),
    });
  } else if (
    currentLearningMode === "flash" &&
    currentLearningArea === "reading"
  ) {
    // 독해 플래시 모드: 카드 뒤집기 참여도 기반 계산 (최대 20점)
    const meaningfulInteractions = learningSessionData.correctAnswers; // flip 액션 카운트
    const maxPossibleFlips = totalAvailableData; // 각 카드당 최대 1번 뒤집기
    const participationRate = meaningfulInteractions / maxPossibleFlips;
    participationScore = participationRate * 20;
  } else if (currentLearningMode === "practice") {
    // 문법 실습 모드: 일반 상호작용 기반 참여도 계산 (최대 20점)
    // 패턴 분석과 동일한 계산 방식 적용
    const meaningfulInteractions = learningSessionData.correctAnswers;
    participationScore = Math.min(
      20,
      (meaningfulInteractions / Math.max(totalAvailableData, 1)) * 20
    );
  } else if (currentLearningMode === "listening") {
    // 듣기 모드: 발음 듣기 상호작용 기준 참여도 계산 (최대 20점)
    const meaningfulInteractions = learningSessionData.correctAnswers; // listen 액션만 카운트
    const maxPossibleListens = totalAvailableData; // 각 개념당 최대 1번 듣기
    const participationRate = meaningfulInteractions / maxPossibleListens;
    participationScore = participationRate * 20;
  } else if (currentLearningMode === "flashcard") {
    // 단어 플래시카드 모드: 카드 뒤집기 참여도 기반 계산 (최대 20점)
    const meaningfulInteractions = learningSessionData.correctAnswers; // flip 액션 카운트
    const maxPossibleFlips = totalAvailableData; // 각 카드당 최대 1번 뒤집기
    const participationRate = meaningfulInteractions / maxPossibleFlips;
    participationScore = participationRate * 20;
  } else {
    // 다른 모드: 기존 방식 (상호작용 기반, 최대 20점)
    const meaningfulInteractions = learningSessionData.correctAnswers;
    participationScore = Math.min(
      20,
      (meaningfulInteractions / Math.max(totalAvailableData, 1)) * 20
    );
  }

  const efficiency = Math.min(
    100,
    Math.round(baseScore + timeScore + participationScore)
  );

  console.log("📊 완료 화면 - 최종 효율 계산:", {
    mode: currentLearningMode,
    area: currentLearningArea,
    studiedConceptsCount,
    totalAvailableData,
    baseScore: baseScore.toFixed(1),
    timeScore: timeScore.toFixed(1),
    participationScore: participationScore.toFixed(1),
    efficiency,
  });

  return {
    conceptsCount: totalAvailableData, // 화면 표시용 (총 제시된 개념 수)
    studiedConceptsCount, // 실제 상호작용한 개념 수
    duration: Math.max(duration, 1),
    interactions,
    efficiency,
  };
}
// 💬 완료 메시지 생성
function generateCompletionMessage(stats) {
  const area = learningSessionData.area;
  const mode = learningSessionData.mode;
  const currentLang = getCurrentLanguage();

  // 번역된 영역 이름 가져오기
  const areaName = getTranslatedText(`area_${area}`) || getTranslatedText(area) || area;
  const modeName = getTranslatedText(`mode_${mode}`) || getTranslatedText(mode) || mode;

  // 완료 메시지 번역 키 선택
  let messageKey = 'completion_message_basic';
  if (stats.efficiency >= 80) {
    messageKey = 'completion_message_excellent';
  } else if (stats.efficiency >= 60) {
    messageKey = 'completion_message_good';
  }

  // 번역된 완료 메시지 가져오기
  const messageTemplate = getTranslatedText(messageKey);
  
  // 메시지가 번역되지 않은 경우 기본 메시지 반환
  if (messageTemplate === messageKey) {
    // 기본 메시지 (한국어)
    if (stats.efficiency >= 80) {
      return `${areaName} ${modeName}을 훌륭하게 완료했습니다!`;
    } else if (stats.efficiency >= 60) {
      return `${areaName} ${modeName}을 잘 완료했습니다!`;
    } else {
      return `${areaName} ${modeName}을 완료했습니다!`;
    }
  }
  
  // {area}와 {mode} 플레이스홀더를 실제 값으로 치환
  return messageTemplate
    .replace('{area}', areaName)
    .replace('{mode}', modeName);
}

// 🔄 다시 학습 버튼 텍스트 생성
function getRestartButtonText(area) {
  const allData = areaData[area] || [];
  const hasNextSession = (sessionOffset + 10) < allData.length;
  
  // 번역된 영역 이름 가져오기
  const areaName = getTranslatedText(`area_${area}`) || getTranslatedText(area) || area;
  
  if (hasNextSession) {
    // "다음 10개 [영역] 학습" 번역
    const nextButtonText = getTranslatedText('next_10_items_learning');
    if (nextButtonText !== 'next_10_items_learning') {
      return nextButtonText.replace('{area}', areaName);
    }
    
    // 기본 텍스트 (번역이 없는 경우)
    const defaultNextTexts = {
      vocabulary: "📚 다음 10개 단어 학습",
      grammar: "📚 다음 10개 문법 학습", 
      reading: "📚 다음 10개 독해 학습",
    };
    return defaultNextTexts[area] || "📚 다음 10개 학습";
  } else {
    // "새로운 [영역]으로 다시 학습" 번역
    const restartButtonText = getTranslatedText('restart_with_new_items');
    if (restartButtonText !== 'restart_with_new_items') {
      return restartButtonText.replace('{area}', areaName);
    }
    
    // 기본 텍스트 (번역이 없는 경우)
    const defaultRestartTexts = {
      vocabulary: "🔄 새로운 단어로 다시 학습",
      grammar: "🔄 새로운 문법으로 다시 학습",
      reading: "🔄 새로운 독해로 다시 학습",
    };
    return defaultRestartTexts[area] || "🔄 다시 학습";
  }
}

// 🔄 다음 세션 또는 새로운 데이터로 학습 시작
async function restartLearningWithNewData() {
  try {
    const area = learningSessionData.area;
    const mode = learningSessionData.mode;
    const allData = areaData[area] || [];
    const hasNextSession = (sessionOffset + 10) < allData.length;

    // 완료 화면 제거
    removeCompletionOverlay();

    if (hasNextSession) {
      // 다음 10개 세션으로 이동
      console.log(`📚 다음 10개 세션으로 이동: ${sessionOffset} → ${sessionOffset + 10}`);
      
      sessionOffset += 10;
      currentIndex = 0;
      isFlipped = false;
      isNavigating = false;

      // 🔄 모든 플래시카드 DOM 요소의 뒤집기 상태 초기화
      const flashcardElements = [
        document.getElementById("flashcard-mode-card"),
        document.querySelector(".flashcard"),
        document.getElementById("reading-flash-card")
      ];
      flashcardElements.forEach(element => {
        if (element) {
          element.classList.remove("flipped");
        }
      });

      // 세션 데이터 초기화
      learningSessionData.conceptsStudied.clear();
      learningSessionData.totalInteractions = 0;
      learningSessionData.correctAnswers = 0;
      learningSessionData.trackedInteractions.clear();

      // 새로운 세션 시작
      startLearningSession(area, mode);
      await startLearningMode(area, mode);
      
      console.log("✅ 다음 세션 시작 완료");
    } else {
      // 모든 세션 완료 - 새로운 데이터 로드
      console.log("🔄 모든 세션 완료. 새로운 데이터로 다시 학습 시작...");

      // 로딩 상태 표시
      showRestartLoading();

      // 세션 오프셋 리셋
      sessionOffset = 0;
      currentIndex = 0;
      isFlipped = false;
      isNavigating = false;

      // 🔄 모든 플래시카드 DOM 요소의 뒤집기 상태 초기화
      const flashcardElements = [
        document.getElementById("flashcard-mode-card"),
        document.querySelector(".flashcard"),
        document.getElementById("reading-flash-card")
      ];
      flashcardElements.forEach(element => {
        if (element) {
          element.classList.remove("flipped");
        }
      });

      // ✅ 모든 캐시 무효화 - 새로운 데이터 강제 로드
      preloadedData[area] = null;
      
      if (typeof cachedData !== 'undefined' && cachedData[area]) {
        cachedData[area] = { data: null, timestamp: 0 };
      }
      
      if (window.cachedData && window.cachedData[area]) {
        window.cachedData[area] = null;
      }
      
      sessionStorage.removeItem("conceptsData");
      sessionStorage.removeItem("vocabularyData");
      console.log("🗑️ 모든 캐시 무효화 완료");

      // 영역별 새로운 데이터 로드
      await loadLearningData(area);

      // 새로운 세션 시작
      startLearningSession(area, mode);

      // 로딩 화면 제거
      hideRestartLoading();

      // 학습 모드 다시 시작
      await startLearningMode(area, mode);

      console.log("✅ 새로운 데이터로 학습 재시작 완료");
    }
  } catch (error) {
    console.error("❌ 학습 재시작 중 오류:", error);
    hideRestartLoading();
    alert("학습 재시작 중 오류가 발생했습니다. 다시 시도해주세요.");
  }
}

// 🗑️ 완료 화면 제거
function removeCompletionOverlay() {
  const overlay = document.querySelector(".learning-completion-overlay");
  if (overlay) {
    overlay.remove();
  }
}

// ⏳ 재시작 로딩 화면 표시
function showRestartLoading() {
  const loadingHTML = `
    <div class="learning-restart-loading fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-8 text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p class="text-gray-600">새로운 학습 데이터를 불러오는 중...</p>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML("beforeend", loadingHTML);
}

// 🔄 재시작 로딩 화면 제거
function hideRestartLoading() {
  const loading = document.querySelector(".learning-restart-loading");
  if (loading) {
    loading.remove();
  }
}

