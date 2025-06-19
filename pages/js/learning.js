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

// 네비게이션 중복 실행 방지
let isNavigating = false;

// 플래시카드 뒤집기 상태
let isFlipped = false;

// 언어 스왑 중복 이벤트 방지 플래그
let isLanguageSwapping = false;

// 영역별 데이터 분리 저장
let areaData = {
  vocabulary: [],
  grammar: [],
  reading: [],
};

// 현재 데이터 getter 함수
function getCurrentData() {
  console.log(
    `🔍 getCurrentData 호출 - currentLearningArea: ${currentLearningArea}`
  );
  console.log(`🔍 areaData 전체:`, areaData);

  const data = areaData[currentLearningArea] || [];
  console.log(
    `🔍 getCurrentData: area=${currentLearningArea}, length=${data.length}`
  );

  if (data.length > 0) {
    console.log(`🔍 첫 번째 데이터 샘플:`, data[0]);
  }

  return data;
}

// 현재 데이터 setter 함수
function setCurrentData(data) {
  if (currentLearningArea) {
    areaData[currentLearningArea] = data;
    console.log(
      `📝 setCurrentData: area=${currentLearningArea}, length=${data.length}`
    );
  } else {
    console.warn(`⚠️ setCurrentData: currentLearningArea가 설정되지 않음`);
  }
}

// Firebase 초기화 대기 함수 수정
async function waitForFirebaseInit() {
  return new Promise((resolve) => {
    const checkFirebase = () => {
      if (window.firebaseInit && window.firebaseInit.db) {
        console.log("✅ Firebase 초기화 완료");
        resolve();
      } else {
        console.log("⏳ Firebase 초기화 대기 중...");
        setTimeout(checkFirebase, 100);
      }
    };
    checkFirebase();
  });
}

// DOM 로드 완료 시 초기화
document.addEventListener("DOMContentLoaded", function () {
  console.log("📚 학습 페이지 초기화");

  // Firebase 인증 확인
  onAuthStateChanged(auth, (user) => {
    if (user) {
      currentUser = user;
      console.log("👤 사용자 로그인됨:", user.email);
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
    showAreaSelection();

    // 초기 번역 적용
    applyTranslations();

    // 데이터 프리로딩 시작
    startDataPreloading();
  }, 100);

  // 언어 변경 핸들러 초기화
  handleLanguageChange();
});

// 전역 함수들 노출
window.showAreaSelection = showAreaSelection;
window.showLearningModes = showLearningModes;

function initializeLanguageSettings() {
  // 언어 설정 초기화
  if (!window.languageSettings) {
    window.languageSettings = {
      sourceLanguage: sessionStorage.getItem("sourceLanguage") || "korean",
      targetLanguage: sessionStorage.getItem("targetLanguage") || "english",
      currentUILanguage:
        sessionStorage.getItem("currentUILanguage") || "korean",
    };
  }

  // 전역 변수 업데이트
  sourceLanguage = window.languageSettings.sourceLanguage;
  targetLanguage = window.languageSettings.targetLanguage;
  currentUILanguage = window.languageSettings.currentUILanguage;

  // 같은 언어 선택 방지
  if (sourceLanguage === targetLanguage) {
    const otherLanguages = ["korean", "english", "japanese", "chinese"].filter(
      (lang) => lang !== sourceLanguage
    );
    targetLanguage = otherLanguages[0];
    window.languageSettings.targetLanguage = targetLanguage;
    sessionStorage.setItem("targetLanguage", targetLanguage);
  }

  console.log("🌐 언어 설정 초기화:", {
    sourceLanguage,
    targetLanguage,
    currentUILanguage,
  });
}

// 필터 변경 핸들러
function handleFilterChange() {
  console.log("🔍 필터 변경 감지");

  // 현재 학습 중인 경우 데이터 다시 로드
  if (currentLearningArea && currentLearningMode) {
    console.log("🔄 필터 변경으로 인한 데이터 재로드");
    currentIndex = 0; // 인덱스 초기화
    startLearningMode(currentLearningArea, currentLearningMode);
  }
}

// 현재 필터 설정 가져오기
function getCurrentFilters() {
  const domainFilter = document.getElementById("domain-filter");
  const difficultyFilter = document.getElementById("difficulty-level");
  const situationFilter = document.getElementById("situation-filter");
  const purposeFilter = document.getElementById("purpose-filter");

  return {
    domain: domainFilter ? domainFilter.value : "all",
    difficulty: difficultyFilter ? difficultyFilter.value : "all",
    situation: situationFilter ? situationFilter.value : "all",
    purpose: purposeFilter ? purposeFilter.value : "all",
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

// 언어 변경 핸들러
function handleLanguageChange() {
  // UI 언어 변경 이벤트 리스너
  document.addEventListener("languageChanged", function (event) {
    console.log("🌐 UI 언어 변경 감지:", event.detail.language);
    currentUILanguage = event.detail.language;

    // 언어 선택 요소들 업데이트
    updateLanguageSelectors();

    // 번역 적용
    applyTranslations();
    applyAdditionalTranslations();

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
    }
  });

  // 중복된 언어 스왑 버튼 이벤트 리스너 제거됨 - setupEventListeners 함수 하단에 올바른 버전 존재

  // 언어 선택 드롭다운 변경 이벤트
  const sourceSelect = document.getElementById("source-language");
  const targetSelect = document.getElementById("target-language");

  if (sourceSelect) {
    sourceSelect.addEventListener("change", (e) => {
      // 스왑 중인 경우 이벤트 무시
      if (isLanguageSwapping) {
        return;
      }

      sourceLanguage = e.target.value;
      window.languageSettings.sourceLanguage = sourceLanguage;
      sessionStorage.setItem("sourceLanguage", sourceLanguage);

      console.log("🌐 원본 언어 변경:", sourceLanguage);

      // 같은 언어 선택 방지
      if (sourceLanguage === targetLanguage) {
        // 대상 언어를 다른 언어로 자동 변경
        const otherLanguages = [
          "korean",
          "english",
          "japanese",
          "chinese",
        ].filter((lang) => lang !== sourceLanguage);
        targetLanguage = otherLanguages[0];
        targetLanguageSelect.value = targetLanguage;
        window.languageSettings.targetLanguage = targetLanguage;
        sessionStorage.setItem("targetLanguage", targetLanguage);
      }

      handleFilterChange();
    });
  }

  if (targetSelect) {
    targetSelect.addEventListener("change", (e) => {
      // 스왑 중인 경우 이벤트 무시
      if (isLanguageSwapping) {
        return;
      }

      targetLanguage = e.target.value;
      window.languageSettings.targetLanguage = targetLanguage;
      sessionStorage.setItem("targetLanguage", targetLanguage);

      console.log("🌐 대상 언어 변경:", targetLanguage);

      // 같은 언어 선택 방지
      if (sourceLanguage === targetLanguage) {
        // 원본 언어를 다른 언어로 자동 변경
        const otherLanguages = [
          "korean",
          "english",
          "japanese",
          "chinese",
        ].filter((lang) => lang !== targetLanguage);
        sourceLanguage = otherLanguages[0];
        sourceLanguageSelect.value = sourceLanguage;
        window.languageSettings.sourceLanguage = sourceLanguage;
        sessionStorage.setItem("sourceLanguage", sourceLanguage);
      }

      handleFilterChange();
    });
  }
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

  if (sourceLanguageSelect && targetLanguageSelect) {
    sourceLanguageSelect.value = sourceLanguage;
    targetLanguageSelect.value = targetLanguage;
    console.log("🔄 언어 선택 요소 업데이트:", {
      sourceLanguage,
      targetLanguage,
    });
  }
}

function setupEventListeners() {
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
      // 스왑 중인 경우 이벤트 무시
      if (isLanguageSwapping) {
        return;
      }

      sourceLanguage = e.target.value;
      window.languageSettings.sourceLanguage = sourceLanguage;
      sessionStorage.setItem("sourceLanguage", sourceLanguage);

      console.log("🌐 원본 언어 변경:", sourceLanguage);

      // 같은 언어 선택 방지
      if (sourceLanguage === targetLanguage) {
        // 대상 언어를 다른 언어로 자동 변경
        const otherLanguages = [
          "korean",
          "english",
          "japanese",
          "chinese",
        ].filter((lang) => lang !== sourceLanguage);
        targetLanguage = otherLanguages[0];
        targetLanguageSelect.value = targetLanguage;
        window.languageSettings.targetLanguage = targetLanguage;
        sessionStorage.setItem("targetLanguage", targetLanguage);
      }

      handleFilterChange();
    });

    targetLanguageSelect.addEventListener("change", (e) => {
      // 스왑 중인 경우 이벤트 무시
      if (isLanguageSwapping) {
        return;
      }

      targetLanguage = e.target.value;
      window.languageSettings.targetLanguage = targetLanguage;
      sessionStorage.setItem("targetLanguage", targetLanguage);

      console.log("🌐 대상 언어 변경:", targetLanguage);

      // 같은 언어 선택 방지
      if (sourceLanguage === targetLanguage) {
        // 원본 언어를 다른 언어로 자동 변경
        const otherLanguages = [
          "korean",
          "english",
          "japanese",
          "chinese",
        ].filter((lang) => lang !== targetLanguage);
        sourceLanguage = otherLanguages[0];
        sourceLanguageSelect.value = sourceLanguage;
        window.languageSettings.sourceLanguage = sourceLanguage;
        sessionStorage.setItem("sourceLanguage", sourceLanguage);
      }

      handleFilterChange();
    });
  }

  // 언어 전환 버튼 이벤트 리스너
  const swapButton = document.getElementById("swap-languages");
  if (swapButton) {
    swapButton.addEventListener("click", () => {
      console.log("🔄 언어 스왑 버튼 클릭");

      // 중복 이벤트 방지 플래그 설정
      isLanguageSwapping = true;

      // 버튼 애니메이션 효과
      swapButton.style.transform = "scale(0.9) rotate(180deg)";

      setTimeout(() => {
        // 언어 전환
        const tempLanguage = sourceLanguage;
        sourceLanguage = targetLanguage;
        targetLanguage = tempLanguage;

        // 전역 설정 업데이트
        window.languageSettings.sourceLanguage = sourceLanguage;
        window.languageSettings.targetLanguage = targetLanguage;
        sessionStorage.setItem("sourceLanguage", sourceLanguage);
        sessionStorage.setItem("targetLanguage", targetLanguage);

        // UI 업데이트 (드롭다운 값 변경)
        const sourceLanguageSelect = document.getElementById("source-language");
        const targetLanguageSelect = document.getElementById("target-language");

        if (sourceLanguageSelect && targetLanguageSelect) {
          sourceLanguageSelect.value = sourceLanguage;
          targetLanguageSelect.value = targetLanguage;
        }

        console.log("🔄 언어 전환:", { sourceLanguage, targetLanguage });

        // 버튼 애니메이션 복원
        swapButton.style.transform = "scale(1) rotate(0deg)";

        // 필터 변경 처리
        handleFilterChange();

        // 플래그 해제
        setTimeout(() => {
          isLanguageSwapping = false;
        }, 100);
      }, 150);
    });
  }

  // 필터 이벤트 리스너 추가
  const domainFilter = document.getElementById("domain-filter");
  const difficultyFilter = document.getElementById("difficulty-level");
  const situationFilter = document.getElementById("situation-filter");
  const purposeFilter = document.getElementById("purpose-filter");

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
    prevFlashcardBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      navigateContent(-1);
    });
    prevFlashcardBtn.setAttribute("data-listener-added", "true");
  }

  if (
    nextFlashcardBtn &&
    !nextFlashcardBtn.hasAttribute("data-listener-added")
  ) {
    nextFlashcardBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      navigateContent(1);
    });
    nextFlashcardBtn.setAttribute("data-listener-added", "true");
  }

  // 독해 학습 네비게이션 버튼들
  const prevReadingBtn = document.getElementById("prev-reading");
  const nextReadingBtn = document.getElementById("next-reading");

  if (prevReadingBtn) {
    prevReadingBtn.removeEventListener("click", prevReadingHandler);
    prevReadingBtn.addEventListener("click", prevReadingHandler);
  }

  if (nextReadingBtn) {
    nextReadingBtn.removeEventListener("click", nextReadingHandler);
    nextReadingBtn.addEventListener("click", nextReadingHandler);
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
    "back-to-dashboard-pronunciation",
    "back-to-dashboard-pattern",
    "back-to-dashboard-practice",
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
    prevFlashcardBtn.addEventListener("click", () => navigateContent(-1));
  }
  if (nextFlashcardBtn) {
    nextFlashcardBtn.removeEventListener("click", () => navigateContent(1));
    nextFlashcardBtn.addEventListener("click", () => navigateContent(1));
  }
  if (flipFlashcardBtn) {
    flipFlashcardBtn.removeEventListener("click", flipCard);
    flipFlashcardBtn.addEventListener("click", flipCard);
  }

  // 타이핑 모드 버튼들
  const prevTypingBtnNew = document.getElementById("prev-typing-btn");
  const nextTypingBtnNew = document.getElementById("next-typing-btn");

  if (prevTypingBtnNew) {
    prevTypingBtnNew.removeEventListener("click", () => navigateContent(-1));
    prevTypingBtnNew.addEventListener("click", () => navigateContent(-1));
  }
  if (nextTypingBtnNew) {
    nextTypingBtnNew.removeEventListener("click", () => navigateContent(1));
    nextTypingBtnNew.addEventListener("click", () => navigateContent(1));
  }
  if (checkTypingAnswerBtn) {
    checkTypingAnswerBtn.removeEventListener("click", checkTypingAnswer);
    checkTypingAnswerBtn.addEventListener("click", checkTypingAnswer);
  }

  // 독해 모드 버튼들 (기존 변수 사용)
  if (prevReadingBtn) {
    prevReadingBtn.removeEventListener("click", () => navigateContent(-1));
    prevReadingBtn.addEventListener("click", () => navigateContent(-1));
  }
  if (nextReadingBtn) {
    nextReadingBtn.removeEventListener("click", () => navigateContent(1));
    nextReadingBtn.addEventListener("click", () => navigateContent(1));
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
  const flipReadingCardBtn = document.getElementById("flip-reading-card");
  if (flipReadingCardBtn) {
    flipReadingCardBtn.removeEventListener("click", flipReadingCard);
    flipReadingCardBtn.addEventListener("click", (e) => {
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
function prevGrammarHandler(e) {
  e.preventDefault();
  e.stopPropagation();
  navigateContent(-1);
}

function nextGrammarHandler(e) {
  e.preventDefault();
  e.stopPropagation();
  navigateContent(1);
}

function prevPatternHandler(e) {
  e.preventDefault();
  e.stopPropagation();
  navigateContent(-1);
}

function nextPatternHandler(e) {
  e.preventDefault();
  e.stopPropagation();
  navigateContent(1);
}

function prevPracticeHandler(e) {
  e.preventDefault();
  e.stopPropagation();
  navigateContent(-1);
}

function nextPracticeHandler(e) {
  e.preventDefault();
  e.stopPropagation();
  navigateContent(1);
}

function prevCardHandler(e) {
  e.preventDefault();
  e.stopPropagation();
  navigateContent(-1);
}

function nextCardHandler(e) {
  e.preventDefault();
  e.stopPropagation();
  navigateContent(1);
}

function prevReadingHandler(e) {
  e.preventDefault();
  e.stopPropagation();
  navigateContent(-1);
}

function nextReadingHandler(e) {
  e.preventDefault();
  e.stopPropagation();
  navigateContent(1);
}

function nextTypingHandler(e) {
  e.preventDefault();
  e.stopPropagation();
  navigateContent(1);
  // 결과 숨기기
  const resultDiv = document.getElementById("typing-result");
  if (resultDiv) {
    resultDiv.classList.add("hidden");
  }
  const nextBtn = document.getElementById("next-typing");
  if (nextBtn) {
    nextBtn.classList.add("hidden");
  }
}

function backToAreasHandler(e) {
  e.preventDefault();
  e.stopPropagation();
  showAreaSelection();
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

function showAreaSelection() {
  console.log("🏠 통합 학습 대시보드 표시");
  hideAllSections();

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
  updateRecentActivity();
  updateLearningStreak();
}

// 로딩 상태 표시 함수
function showLoadingState(card) {
  const originalContent = card.innerHTML;
  card.innerHTML = `
    <div class="flex items-center justify-center h-full">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      <span class="ml-3 text-white">로딩 중...</span>
    </div>
  `;

  // 3초 후 원래 내용으로 복원 (에러 방지)
  setTimeout(() => {
    if (card.innerHTML.includes("로딩 중...")) {
      card.innerHTML = originalContent;
    }
  }, 3000);
}

// 최근 활동 업데이트
function updateRecentActivity() {
  const recentActivityEl = document.getElementById("recent-activity");
  const lastArea = sessionStorage.getItem("lastLearningArea");
  const lastMode = sessionStorage.getItem("lastLearningMode");
  const lastTime = sessionStorage.getItem("lastLearningTime");

  if (lastArea && lastMode && lastTime) {
    const timeAgo = getTimeAgo(new Date(lastTime));
    const areaName = getAreaName(lastArea);
    const modeName = getModeName(lastMode);

    recentActivityEl.innerHTML = `
      <div class="text-sm">
        <div class="font-medium">${areaName} - ${modeName}</div>
        <div class="text-gray-500">${timeAgo}</div>
      </div>
    `;

    // 학습 이어하기 버튼 표시
    const quickContinueBtn = document.getElementById("quick-continue");
    if (quickContinueBtn) {
      quickContinueBtn.classList.remove("hidden");
    }
  }

  // 추천 학습도 함께 업데이트
  updateRecommendedLearning();
}

// 추천 학습 업데이트 (실제 학습 패턴 기반)
function updateRecommendedLearning() {
  const recommendedEl = document.getElementById("recommended-mode");

  // 학습 기록에서 패턴 분석
  const learningHistory = JSON.parse(
    localStorage.getItem("learningHistory") || "[]"
  );
  const lastWeekHistory = learningHistory.filter((record) => {
    const recordDate = new Date(record.timestamp);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return recordDate > weekAgo;
  });

  let recommendation = getSmartRecommendation(lastWeekHistory);

  recommendedEl.innerHTML = `
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
      <div class="text-xs text-gray-500">
        ${recommendation.reason}
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
    title: "단어 플래시카드",
    subtitle: "기본 단어 학습",
    icon: "fas fa-clone",
    color: "blue",
    reason: "새로운 학습을 시작해보세요",
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
      subtitle: "균형잡힌 학습",
      icon: modes[neglectedArea].icon,
      color: modes[neglectedArea].color,
      reason: "최근 학습하지 않은 영역입니다",
    };
  } else if (mostStudiedArea) {
    // 가장 많이 학습한 영역의 다른 모드 추천
    const areaHistory = history.filter((r) => r.area === mostStudiedArea);
    const usedModes = [...new Set(areaHistory.map((r) => r.mode))];

    const allModes = {
      vocabulary: ["flashcard", "typing", "pronunciation"],
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
        subtitle: "새로운 학습 방식",
        icon: modeIcons[recommendedMode] || "fas fa-star",
        color:
          mostStudiedArea === "vocabulary"
            ? "blue"
            : mostStudiedArea === "grammar"
            ? "green"
            : "purple",
        reason: "새로운 학습 방식을 시도해보세요",
      };
    }
  }

  return recommendation;
}

// 학습 연속일 업데이트
function updateLearningStreak() {
  const streakEl = document.getElementById("learning-streak");
  const streak = parseInt(localStorage.getItem("learningStreak") || "0");

  if (streakEl) {
    streakEl.querySelector(".text-2xl").textContent = streak;
  }
}

// 시간 차이 계산
function getTimeAgo(date) {
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins}분 전`;
  if (diffHours < 24) return `${diffHours}시간 전`;
  return `${diffDays}일 전`;
}

// 영역 이름 가져오기
function getAreaName(area) {
  const names = {
    vocabulary: "단어 학습",
    grammar: "문법 학습",
    reading: "독해 학습",
  };
  return names[area] || area;
}

// 모드 이름 가져오기
function getModeName(mode) {
  const names = {
    flashcard: "플래시카드",
    typing: "타이핑",
    pronunciation: "발음 연습",
    pattern: "패턴 분석",
    practice: "실습 문제",
    example: "예문 학습",
    flash: "플래시 모드",
  };
  return names[mode] || mode;
}

// 학습 연속일 업데이트 (학습 시작 시)
function updateLearningStreakOnStart() {
  const today = new Date().toDateString();
  const lastLearningDate = localStorage.getItem("lastLearningDate");
  const currentStreak = parseInt(localStorage.getItem("learningStreak") || "0");

  if (lastLearningDate !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (lastLearningDate === yesterday.toDateString()) {
      // 연속 학습
      localStorage.setItem("learningStreak", (currentStreak + 1).toString());
    } else if (
      !lastLearningDate ||
      lastLearningDate !== yesterday.toDateString()
    ) {
      // 첫 학습 또는 연속성 끊김
      localStorage.setItem("learningStreak", "1");
    }

    localStorage.setItem("lastLearningDate", today);
    console.log(
      `📅 학습 연속일 업데이트: ${localStorage.getItem("learningStreak")}일`
    );
  }
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
        data = await loadVocabularyData();
        break;
      case "grammar":
        data = await loadGrammarData();
        break;
      case "reading":
        data = await loadReadingData();
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
  const currentLang = getCurrentLanguage();
  if (
    window.translations &&
    window.translations[currentLang] &&
    window.translations[currentLang][key]
  ) {
    return window.translations[currentLang][key];
  }
  return key;
}

// 필터 옵션 업데이트 함수 (언어 변경 시 호출)
function updateFilterOptionsLanguage() {
  loadSituationAndPurposeFilterOptions();
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

    // 상황 필터 옵션 생성
    const situationFilter = document.getElementById("situation-filter");
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

      console.log(
        `✅ 상황 필터 옵션 로드 완료: ${situationTags.length}개 태그`
      );
    }

    // 목적 필터 옵션 생성
    const purposeFilter = document.getElementById("purpose-filter");
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

      console.log(`✅ 목적 필터 옵션 로드 완료: ${purposeTags.length}개 태그`);
    }
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
      if (uploadBtn) uploadBtn.classList.remove("hidden");
      if (uploadTitle)
        uploadTitle.setAttribute("data-i18n", "vocabulary_data_upload");
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
      if (uploadBtn) uploadBtn.classList.remove("hidden");
      if (uploadTitle)
        uploadTitle.setAttribute("data-i18n", "grammar_pattern_data_upload");
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
      if (uploadBtn) uploadBtn.classList.remove("hidden");
      if (uploadTitle)
        uploadTitle.setAttribute("data-i18n", "reading_data_upload");
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

  // 현재 학습 영역과 모드 설정
  currentLearningArea = area;
  currentLearningMode = mode;
  currentIndex = 0;

  // 학습 기록 저장
  try {
    const learningRecord = {
      area: area,
      mode: mode,
      timestamp: new Date().toISOString(),
      date: new Date().toDateString(),
    };

    // 최근 학습 기록 업데이트
    let recentLearning = JSON.parse(
      localStorage.getItem("recentLearning") || "[]"
    );
    recentLearning.unshift(learningRecord);
    recentLearning = recentLearning.slice(0, 5); // 최근 5개만 유지
    localStorage.setItem("recentLearning", JSON.stringify(recentLearning));

    console.log("📊 학습 기록 저장:", learningRecord);
  } catch (error) {
    console.warn("학습 기록 저장 실패:", error);
  }

  // 데이터 로드
  await loadLearningData(area);

  const currentData = getCurrentData();
  if (!currentData || currentData.length === 0) {
    console.log(`❌ ${area} 영역에 데이터가 없습니다.`);
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
        case "pronunciation":
          showPronunciationMode();
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
    switch (area) {
      case "vocabulary":
        await loadVocabularyData();
        break;

      case "grammar":
        await loadGrammarData();
        break;

      case "reading":
        await loadReadingData();
        break;

      default:
        console.error(`❌ 알 수 없는 학습 영역: ${area}`);
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

async function loadVocabularyData() {
  console.log("🔍 단어 데이터 소스 확인...");

  let data = [];

  // 1. sessionStorage에서 단어 데이터 확인
  const sessionData = sessionStorage.getItem("conceptsData");
  if (sessionData) {
    try {
      const parsedData = JSON.parse(sessionData);
      if (Array.isArray(parsedData) && parsedData.length > 0) {
        console.log(`💾 sessionStorage에서 ${parsedData.length}개 단어 발견`);
        data = parsedData;
      }
    } catch (error) {
      console.error("❌ sessionStorage 데이터 파싱 실패:", error);
    }
  }

  // 2. sessionStorage에 데이터가 없으면 DB에서 로드
  if (data.length === 0) {
    try {
      // Firebase가 초기화되었는지 확인
      if (!window.firebaseInit || !window.firebaseInit.collection) {
        throw new Error("Firebase가 초기화되지 않았습니다.");
      }

      console.log("🔍 DB에서 단어 데이터 로드 시도...");
      const conceptsRef = window.firebaseInit.collection(
        window.firebaseInit.db,
        "concepts"
      );
      const querySnapshot = await window.firebaseInit.getDocs(
        window.firebaseInit.query(conceptsRef, window.firebaseInit.limit(50))
      );

      if (!querySnapshot.empty) {
        data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        console.log(`📚 DB에서 ${data.length}개 단어 로드`);

        // sessionStorage에 저장
        sessionStorage.setItem("conceptsData", JSON.stringify(data));
      } else {
        console.log("📚 DB에 단어 데이터 없음");
      }
    } catch (error) {
      console.error("❌ DB 단어 데이터 로드 실패:", error);
    }
  }

  // 필터 적용
  const filteredData = applyFilters(data);

  // vocabulary 영역에 데이터 저장 (전역 areaData 사용)
  areaData.vocabulary = filteredData;

  console.log(
    `💾 sessionStorage에서 단어 데이터: ${filteredData.length}개 (필터 적용 후)`
  );
  return filteredData;
}

async function loadGrammarData() {
  console.log("📝 문법 패턴 데이터 로딩 시작...");

  try {
    // Firebase가 초기화되었는지 확인
    if (!window.firebaseInit || !window.firebaseInit.collection) {
      throw new Error("Firebase가 초기화되지 않았습니다.");
    }

    const grammarRef = window.firebaseInit.collection(
      window.firebaseInit.db,
      "grammar"
    );
    const querySnapshot = await window.firebaseInit.getDocs(
      window.firebaseInit.query(grammarRef, window.firebaseInit.limit(30))
    );

    if (!querySnapshot.empty) {
      console.log(`📝 grammar 컬렉션에서 ${querySnapshot.size}개 패턴 발견`);

      const data = querySnapshot.docs.map((doc) => {
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

      // 필터 적용
      const filteredData = applyFilters(data);

      // grammar 영역에 데이터 저장 (전역 areaData 사용)
      areaData.grammar = filteredData;

      console.log(
        `✅ 문법 패턴 데이터 로딩 완료: ${filteredData.length}개 (필터 적용 후)`
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

async function loadReadingData() {
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

    // examples 컬렉션에서 데이터 가져오기
    const examplesRef = window.firebaseInit.collection(
      window.firebaseInit.db,
      "examples"
    );
    const query = window.firebaseInit.query(
      examplesRef,
      window.firebaseInit.limit(20)
    ); // 독해 데이터 제한
    console.log("📖 기본 쿼리 성공");

    const querySnapshot = await window.firebaseInit.getDocs(query);
    console.log("📖 쿼리 결과:", querySnapshot.size, "개 문서");

    if (!querySnapshot.empty) {
      console.log("📖 examples 컬렉션에서", querySnapshot.size, "개 예문 발견");

      const data = querySnapshot.docs
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

      // 언어별 필터링
      const filteredData = filterDataByLanguage(data);
      console.log(`📖 언어 필터링 후: ${filteredData.length}개`);

      if (filteredData.length > 0) {
        // 필터 적용 - reading 영역 전용 데이터 저장
        const finalData = applyFilters(filteredData);

        // reading 영역에 데이터 저장 (전역 areaData 사용)
        areaData.reading = finalData;

        console.log(
          `✅ examples에서 독해 데이터 로딩 완료: ${finalData.length}개 (필터 적용 후)`
        );
        return finalData;
      }
    } else {
      console.log("📖 examples 컬렉션에 문서가 없음");
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
    "flashcard-container",
    "typing-container",
    "grammar-container",
    "reading-container",
    "flashcard-mode",
    "typing-mode",
    "pronunciation-mode",
    "grammar-pattern-mode",
    "grammar-practice-mode",
    "reading-mode",
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
    "flashcard-container",
    "typing-container",
    "grammar-container",
    "reading-container",
    "flashcard-mode",
    "typing-mode",
    "pronunciation-mode",
    "grammar-pattern-mode",
    "grammar-practice-mode",
    "reading-mode",
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

  if (frontWordElement) frontWordElement.textContent = frontText;
  if (frontPronElement) frontPronElement.textContent = frontPronunciation;
  if (backWordElement) backWordElement.textContent = backText;
  if (backDefElement) backDefElement.textContent = backDefinition;
  if (progressElement) {
    progressElement.textContent = `${currentIndex + 1} / ${currentData.length}`;
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
  const typingMode = document.getElementById("typing-container");
  if (typingMode) {
    typingMode.classList.remove("hidden");
    updateTyping();

    // 번역 적용
    setTimeout(() => {
      applyTranslations();
    }, 50);

    // 엔터키 이벤트 리스너 추가
    const answerInput = document.getElementById("typing-answer");
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
  if (!currentData || currentData.length === 0) return;

  const concept = currentData[currentIndex];

  // 최신 언어 설정 사용
  const currentSourceLanguage =
    window.languageSettings?.sourceLanguage || sourceLanguage || "korean";
  const currentTargetLanguage =
    window.languageSettings?.targetLanguage || targetLanguage || "english";

  const wordElement = document.getElementById("typing-word");
  const pronunciationElement = document.getElementById("typing-pronunciation");
  const answerInput = document.getElementById("typing-answer");
  const resultDiv = document.getElementById("typing-result");

  let sourceText = "";
  let sourcePronunciation = "";
  let correctAnswer = "";

  // 1. concepts 데이터 구조 (expressions 있음)
  if (concept.expressions) {
    const sourceExpr = concept.expressions[currentSourceLanguage];
    const targetExpr = concept.expressions[currentTargetLanguage];

    if (sourceExpr && targetExpr) {
      sourceText = sourceExpr.word || "";
      sourcePronunciation = sourceExpr.pronunciation || "";
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
  }
  if (pronunciationElement) {
    pronunciationElement.textContent = sourcePronunciation;
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
  const progress = document.getElementById("typing-progress");
  if (progress) {
    progress.textContent = `${currentIndex + 1} / ${currentData.length}`;
  }
}

function checkTypingAnswer() {
  const answerInput = document.getElementById("typing-answer");
  const resultDiv = document.getElementById("typing-result");

  if (!answerInput || !resultDiv) return;

  const userAnswer = answerInput.value.toLowerCase().trim();
  const correctAnswer = answerInput.dataset.correctAnswer;

  if (userAnswer === correctAnswer) {
    resultDiv.textContent = "정답입니다! 🎉";
    resultDiv.className = "mt-4 p-3 bg-green-100 text-green-800 rounded";
  } else {
    resultDiv.textContent = `틀렸습니다. 정답: ${correctAnswer}`;
    resultDiv.className = "mt-4 p-3 bg-red-100 text-red-800 rounded";
  }

  resultDiv.classList.remove("hidden");

  // 2초 후 다음 문제로
  setTimeout(() => {
    navigateContent(1);
  }, 2000);
}

function showPronunciationMode() {
  console.log("🎤 발음 연습 모드 (구현 예정)");

  const pronunciationMode = document.getElementById("pronunciation-mode");
  if (pronunciationMode) {
    pronunciationMode.classList.remove("hidden");

    // 번역 적용
    setTimeout(() => {
      applyTranslations();
    }, 50);
  } else {
    alert("발음 연습 모드는 아직 구현중입니다.");
    showAreaSelection();
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
    card.classList.toggle("flipped");
  }
}

function showReadingExampleMode() {
  console.log("📖 예문 독해 모드 시작");
  const readingContainer = document.getElementById("reading-container");
  if (readingContainer) {
    readingContainer.classList.remove("hidden");

    // 모드 제목 업데이트
    const modeTitle = document.getElementById("reading-mode-title");
    if (modeTitle) {
      const translatedTitle =
        getTranslatedText("reading_example_learning") || "예문 학습";
      modeTitle.textContent = translatedTitle;
      modeTitle.setAttribute("data-i18n", "reading_example_learning");
    }

    updateReadingExample();

    // 예문 모드에서는 뒤집기 버튼 숨김
    const flipBtn = document.getElementById("flip-reading-card");
    if (flipBtn) {
      flipBtn.style.display = "none";
    }

    // 번역 적용
    setTimeout(() => {
      applyTranslations();
    }, 50);
  } else {
    console.error("❌ 독해 모드 요소를 찾을 수 없음");
    alert("독해 모드를 시작할 수 없습니다.");
    showAreaSelection();
  }
}

function showReadingFlashMode() {
  console.log("⚡ 플래시 독해 모드 시작");
  const readingContainer = document.getElementById("reading-container");
  if (readingContainer) {
    readingContainer.classList.remove("hidden");

    // 모드 제목 업데이트
    const modeTitle = document.getElementById("reading-mode-title");
    if (modeTitle) {
      const translatedTitle =
        getTranslatedText("reading_flash_mode") || "플래시 모드";
      modeTitle.textContent = translatedTitle;
      modeTitle.setAttribute("data-i18n", "reading_flash_mode");
    }

    updateReadingFlash();

    // 플래시 모드에서는 뒤집기 버튼 표시
    const flipBtn = document.getElementById("flip-reading-card");
    if (flipBtn) {
      flipBtn.style.display = "inline-block";
    }

    // 번역 적용
    setTimeout(() => {
      applyTranslations();
    }, 50);
  } else {
    console.error("❌ 독해 모드 요소를 찾을 수 없음");
    alert("독해 모드를 시작할 수 없습니다.");
    showAreaSelection();
  }
}

function updateReadingExample() {
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
  const progress = document.getElementById("reading-progress");
  if (progress) {
    progress.textContent = `${currentIndex + 1} / ${currentData.length}`;
  }
}

function updateReadingFlash() {
  if (!currentData || currentData.length === 0) return;

  const example = currentData[currentIndex];
  const sourceLanguage = window.languageSettings?.sourceLanguage || "korean";
  const targetLanguage = window.languageSettings?.targetLanguage || "english";

  const container = document.getElementById("reading-example-container");
  if (!container) return;

  // 디버깅 로그 추가
  console.log("🔍 updateReadingFlash - example 데이터:", example);
  console.log("🔍 example.situation:", example.situation);
  console.log(
    "🔍 Array.isArray(example.situation):",
    Array.isArray(example.situation)
  );
  console.log(
    "🔍 situation 값:",
    Array.isArray(example.situation) && example.situation.length > 0
      ? example.situation[0]
      : example.situation || "플래시 모드"
  );

  // 상황 정보 준비
  const situationInfo =
    Array.isArray(example.situation) && example.situation.length > 0
      ? example.situation.join(", ")
      : example.situation || "일반";

  // 플래시 모드 - 간단한 카드 형태
  container.innerHTML = `
    <div class="flip-card w-full max-w-lg mx-auto" id="reading-flash-card">
      <div class="flip-card-inner">
        <div class="flip-card-front bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg shadow-lg p-8">
          <div class="text-center">
            <h3 class="text-2xl font-bold mb-4">
              ${
                example.translations?.[sourceLanguage] ||
                example[sourceLanguage] ||
                example.original ||
                "원문"
              }
            </h3>
            <p class="text-purple-100 mt-8">(카드를 클릭하여 번역 보기)</p>
          </div>
        </div>
        <div class="flip-card-back bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg shadow-lg p-8">
          <div class="text-center">
            <h3 class="text-2xl font-bold mb-4">
              ${
                example.translations?.[targetLanguage] ||
                example[targetLanguage] ||
                example.translation ||
                "번역"
              }
            </h3>
            <div class="flex flex-wrap gap-2 justify-center mt-4">
              <span class="text-sm text-blue-100 bg-blue-400 bg-opacity-30 px-3 py-1 rounded-full">
                📍 ${situationInfo}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="mt-6 text-center" id="reading-flash-delete-container">
      <button class="delete-btn bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm" 
              data-item-id="${example.id}" 
              data-item-type="reading">
        🗑️ 삭제
      </button>
    </div>
  `;

  // 진행 상황 업데이트
  const progress = document.getElementById("reading-progress");
  if (progress) {
    progress.textContent = `${currentIndex + 1} / ${currentData.length}`;
  }
}

function navigateContent(direction) {
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
  currentIndex += direction;

  // 순환 처리
  if (currentIndex >= currentData.length) {
    currentIndex = 0;
  } else if (currentIndex < 0) {
    currentIndex = currentData.length - 1;
  }

  console.log(`🔄 네비게이션: ${oldIndex} → ${currentIndex}`);

  // 현재 모드에 따라 업데이트
  try {
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
    korean: "korean",
    english: "english",
    japanese: "japanese",
    chinese: "chinese",
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
    card.classList.toggle("flipped");
    console.log("🔄 뒤집기 후 클래스:", card.className);
    console.log("✅ 독해 플래시 카드 뒤집기 완료");
  } else {
    console.error("❌ reading-flash-card 요소를 찾을 수 없습니다");
  }
}
