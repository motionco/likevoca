import { loadNavbar } from "../../components/js/navbar.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
import {
  auth,
  db,
  conceptUtils,
  supportedLanguages,
} from "../../js/firebase/firebase-init.js";
import {
  collection,
  query,
  getDocs,
  orderBy,
  doc,
  getDoc,
  updateDoc,
  where,
  limit,
  startAfter,
  endBefore,
  limitToLast,
  Timestamp,
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

import { initialize as initializeConceptModal } from "../../components/js/add-concept-modal.js";
import { initialize as initializeBulkImportModal } from "../../components/js/bulk-import-modal.js";
import {
  getActiveLanguage,
  updateMetadata,
} from "../../utils/language-utils.js";

let currentUser = null;
let allConcepts = [];
let filteredConcepts = [];

// 전역에서 접근 가능하도록 설정
window.allConcepts = allConcepts;
let displayCount = 12;
let lastVisibleConcept = null;
let firstVisibleConcept = null;
let userLanguage = "ko";

// 페이지별 번역 키
const pageTranslations = {
  ko: {
    meaning: "뜻:",
    example: "예문:",
    error_title: "오류 발생!",
    error_message: "페이지를 불러오는 중 문제가 발생했습니다.",
    error_details: "자세한 내용:",
    login_required: "로그인이 필요합니다.",
    // 카테고리 번역
    fruit: "과일",
    food: "음식",
    animal: "동물",
    daily: "일상",
    travel: "여행",
    business: "비즈니스",
    transportation: "교통",
    greeting: "인사",
    emotion: "감정",
    education: "교육",
    nature: "자연",
    subject: "과목",
    // 도메인 번역
    general: "일반",
  },
  en: {
    meaning: "Meaning:",
    example: "Example:",
    error_title: "Error!",
    error_message: "A problem occurred while loading the page.",
    error_details: "Details:",
    login_required: "Login required.",
    // 카테고리 번역
    fruit: "Fruit",
    food: "Food",
    animal: "Animal",
    daily: "Daily Life",
    travel: "Travel",
    business: "Business",
    transportation: "Transportation",
    greeting: "Greeting",
    emotion: "Emotion",
    education: "Education",
    nature: "Nature",
    subject: "Subject",
    // 도메인 번역
    general: "General",
  },
  ja: {
    meaning: "意味:",
    example: "例文:",
    error_title: "エラーが発生しました!",
    error_message: "ページの読み込み中に問題が発生しました。",
    error_details: "詳細:",
    login_required: "ログインが必要です。",
    // 카테고리 번역
    fruit: "果物",
    food: "食べ物",
    animal: "動物",
    daily: "日常",
    travel: "旅行",
    business: "ビジネス",
    transportation: "交通",
    greeting: "挨拶",
    emotion: "感情",
    education: "教育",
    nature: "自然",
    subject: "科目",
    // 도메인 번역
    general: "一般",
  },
  zh: {
    meaning: "意思:",
    example: "例句:",
    error_title: "发生错误!",
    error_message: "加载页面时出现问题。",
    error_details: "详细信息:",
    login_required: "需要登录。",
    // 카테고리 번역
    fruit: "水果",
    food: "食物",
    animal: "动物",
    daily: "日常",
    travel: "旅行",
    business: "商务",
    transportation: "交通",
    greeting: "问候",
    emotion: "情绪",
    education: "教育",
    nature: "自然",
    subject: "学科",
    // 도메인 번역
    general: "一般",
  },
};

// 문법 용어 번역 테이블
const grammarTranslations = {
  ko: {
    // 영어 문법 용어
    "simple present tense": "현재 시제",
    "present tense": "현재 시제",
    "simple past tense": "과거 시제",
    "past tense": "과거 시제",
    "simple future tense": "미래 시제",
    "future tense": "미래 시제",
    "present continuous": "현재 진행형",
    "past continuous": "과거 진행형",
    "future continuous": "미래 진행형",
    "present perfect": "현재 완료형",
    "past perfect": "과거 완료형",
    "future perfect": "미래 완료형",
    "present perfect continuous": "현재 완료 진행형",
    "past perfect continuous": "과거 완료 진행형",
    "future perfect continuous": "미래 완료 진행형",
    "modal verb": "조동사",
    "auxiliary verb": "조동사",
    "passive voice": "수동태",
    "active voice": "능동태",
    conditional: "조건문",
    subjunctive: "가정법",
    imperative: "명령문",
    gerund: "동명사",
    infinitive: "부정사",
    participle: "분사",
    "present participle": "현재분사",
    "past participle": "과거분사",
    comparative: "비교급",
    superlative: "최상급",
    "countable noun": "가산명사",
    "uncountable noun": "불가산명사",
    plural: "복수형",
    singular: "단수형",
    article: "관사",
    "definite article": "정관사",
    "indefinite article": "부정관사",
    preposition: "전치사",
    conjunction: "접속사",
    adverb: "부사",
    adjective: "형용사",
    pronoun: "대명사",
    "relative clause": "관계절",
    "subordinate clause": "종속절",
    "main clause": "주절",

    // 일본어 문법 용어
    hiragana: "히라가나",
    katakana: "가타카나",
    kanji: "한자",
    keigo: "경어",
    sonkeigo: "존경어",
    kenjougo: "겸양어",
    teineigo: "정중어",
    "masu form": "마스형",
    "te form": "테형",
    "potential form": "가능형",
    "causative form": "사역형",
    "passive form": "수동형",
    "volitional form": "의지형",
    "conditional form": "조건형",
    "imperative form": "명령형",
    "negative form": "부정형",
    "past tense": "과거형",
    "present tense": "현재형",
    particle: "조사",
    "wa particle": "는/은 조사",
    "ga particle": "가/이 조사",
    "wo particle": "를/을 조사",
    "ni particle": "에 조사",
    "de particle": "에서 조사",
    "to particle": "와/과 조사",

    // 중국어 문법 용어
    pinyin: "병음",
    tone: "성조",
    "first tone": "1성",
    "second tone": "2성",
    "third tone": "3성",
    "fourth tone": "4성",
    "neutral tone": "경성",
    "measure word": "양사",
    classifier: "양사",
    "sentence final particle": "문말사",
    "aspect marker": "상 표지",
    "perfective aspect": "완료상",
    "progressive aspect": "진행상",
    "experiential aspect": "경험상",
  },
  en: {
    // 기본적으로 영어는 그대로 유지
    "simple present tense": "simple present tense",
    "present tense": "present tense",
    "simple past tense": "simple past tense",
    "past tense": "past tense",
    // ... 나머지도 그대로
  },
  ja: {
    // 영어 문법 용어를 일본어로
    "simple present tense": "現在時制",
    "present tense": "現在時制",
    "simple past tense": "過去時制",
    "past tense": "過去時制",
    "simple future tense": "未来時制",
    "future tense": "未来時制",
    "present continuous": "現在進行形",
    "past continuous": "過去進行形",
    "future continuous": "未来進行形",
    "present perfect": "現在完了形",
    "past perfect": "過去完了形",
    "future perfect": "未来完了形",
    "modal verb": "助動詞",
    "auxiliary verb": "助動詞",
    "passive voice": "受動態",
    "active voice": "能動態",
    conditional: "条件文",
    subjunctive: "仮定法",
    imperative: "命令文",
    gerund: "動名詞",
    infinitive: "不定詞",
    participle: "分詞",
    "present participle": "現在分詞",
    "past participle": "過去分詞",
    comparative: "比較級",
    superlative: "最上級",
    "countable noun": "可算名詞",
    "uncountable noun": "不可算名詞",
    plural: "複数形",
    singular: "単数形",
    article: "冠詞",
    "definite article": "定冠詞",
    "indefinite article": "不定冠詞",
    preposition: "前置詞",
    conjunction: "接続詞",
    adverb: "副詞",
    adjective: "形容詞",
    pronoun: "代名詞",

    // 일본어 문법 용어는 그대로
    hiragana: "ひらがな",
    katakana: "カタカナ",
    kanji: "漢字",
    keigo: "敬語",
    "masu form": "ます形",
    "te form": "て形",
    particle: "助詞",
  },
  zh: {
    // 영어 문법 용어를 중국어로
    "simple present tense": "一般现在时",
    "present tense": "现在时",
    "simple past tense": "一般过去时",
    "past tense": "过去时",
    "simple future tense": "一般将来时",
    "future tense": "将来时",
    "present continuous": "现在进行时",
    "past continuous": "过去进行时",
    "future continuous": "将来进行时",
    "present perfect": "现在完成时",
    "past perfect": "过去完成时",
    "future perfect": "将来完成时",
    "modal verb": "情态动词",
    "auxiliary verb": "助动词",
    "passive voice": "被动语态",
    "active voice": "主动语态",
    conditional: "条件句",
    subjunctive: "虚拟语气",
    imperative: "祈使句",
    gerund: "动名词",
    infinitive: "不定式",
    participle: "分词",
    "present participle": "现在分词",
    "past participle": "过去分词",
    comparative: "比较级",
    superlative: "最高级",
    "countable noun": "可数名词",
    "uncountable noun": "不可数名词",
    plural: "复数",
    singular: "单数",
    article: "冠词",
    "definite article": "定冠词",
    "indefinite article": "不定冠词",
    preposition: "介词",
    conjunction: "连词",
    adverb: "副词",
    adjective: "形容词",
    pronoun: "代词",

    // 중국어 문법 용어는 그대로
    pinyin: "拼音",
    tone: "声调",
    "measure word": "量词",
    classifier: "量词",
  },
};

// 다국어 번역 텍스트 가져오기 함수
function getTranslatedText(key) {
  return pageTranslations[userLanguage][key] || pageTranslations.en[key] || key;
}

// 문법 설명을 환경 언어로 번역하는 함수
function translateGrammarNote(grammarNote) {
  if (!grammarNote || !userLanguage) return grammarNote;

  const translations = grammarTranslations[userLanguage];
  if (!translations) return grammarNote;

  // 소문자로 변환해서 매칭 시도
  const lowerNote = grammarNote.toLowerCase();

  // 정확히 일치하는 번역이 있는지 확인
  if (translations[lowerNote]) {
    return translations[lowerNote];
  }

  // 부분 일치 시도 (더 긴 용어부터 확인)
  const sortedKeys = Object.keys(translations).sort(
    (a, b) => b.length - a.length
  );

  for (const key of sortedKeys) {
    if (lowerNote.includes(key)) {
      return grammarNote.replace(new RegExp(key, "gi"), translations[key]);
    }
  }

  // 번역이 없으면 원본 반환
  return grammarNote;
}

// 언어 이름 가져오기 (환경 설정 언어에 맞게)
function getLanguageName(langCode) {
  const languageNames = {
    ko: {
      korean: "한국어",
      english: "영어",
      japanese: "일본어",
      chinese: "중국어",
    },
    en: {
      korean: "Korean",
      english: "English",
      japanese: "Japanese",
      chinese: "Chinese",
    },
    ja: {
      korean: "韓国語",
      english: "英語",
      japanese: "日本語",
      chinese: "中国語",
    },
    zh: {
      korean: "韩语",
      english: "英语",
      japanese: "日语",
      chinese: "中文",
    },
  };

  return (
    languageNames[userLanguage]?.[langCode] ||
    languageNames.en[langCode] ||
    langCode
  );
}

// 개념 카드 생성 함수 (확장된 구조 지원 및 디버깅 개선)
function createConceptCard(concept) {
  const sourceLanguage = document.getElementById("source-language").value;
  const targetLanguage = document.getElementById("target-language").value;

  // 새로운 구조와 기존 구조 모두 지원
  const sourceExpression = concept.expressions?.[sourceLanguage] || {};
  const targetExpression = concept.expressions?.[targetLanguage] || {};

  // 빈 표현인 경우 건너뛰기
  if (!sourceExpression.word || !targetExpression.word) {
    return "";
  }

  // concept_info 가져오기 (새 구조 우선, 기존 구조 fallback)
  const conceptInfo = concept.concept_info || {
    domain: concept.domain || "기타",
    category: concept.category || "일반",
    unicode_emoji: concept.emoji || concept.unicode_emoji || "📝",
    color_theme: concept.color_theme || "#4B63AC",
  };

  // 색상 테마 가져오기 (안전한 fallback)
  const colorTheme =
    conceptInfo.color_theme || concept.color_theme || "#4B63AC";

  // 이모지 가져오기 (실제 데이터 구조에 맞게 우선순위 조정)
  const emoji =
    conceptInfo.unicode_emoji ||
    conceptInfo.emoji ||
    concept.emoji ||
    concept.unicode_emoji ||
    "📝";

  // 예문 가져오기 (concepts 컬렉션의 대표 예문 사용)
  let example = null;

  console.log("카드 예문 디버깅 - 개념 데이터:", concept);

  // 1. representative_example 확인 (새 구조 - 우선순위 최고)
  if (concept.representative_example) {
    console.log("representative_example 발견:", concept.representative_example);
    const repExample = concept.representative_example;

    if (repExample.translations) {
      example = {
        source:
          repExample.translations[sourceLanguage]?.text ||
          repExample.translations[sourceLanguage] ||
          "",
        target:
          repExample.translations[targetLanguage]?.text ||
          repExample.translations[targetLanguage] ||
          "",
      };
      console.log("representative_example에서 예문 추출:", example);
    }
  }
  // 2. featured_examples 확인 (기존 방식)
  else if (concept.featured_examples && concept.featured_examples.length > 0) {
    console.log("featured_examples 발견:", concept.featured_examples);
    const firstExample = concept.featured_examples[0];
    if (firstExample.translations) {
      example = {
        source: firstExample.translations[sourceLanguage]?.text || "",
        target: firstExample.translations[targetLanguage]?.text || "",
      };
      console.log("featured_examples에서 예문 추출:", example);
    }
  }
  // 3. core_examples 확인 (기존 방식 - 하위 호환성)
  else if (concept.core_examples && concept.core_examples.length > 0) {
    console.log("core_examples 발견:", concept.core_examples);
    const firstExample = concept.core_examples[0];
    // 번역 구조 확인
    if (firstExample.translations) {
      example = {
        source: firstExample.translations[sourceLanguage]?.text || "",
        target: firstExample.translations[targetLanguage]?.text || "",
      };
      console.log("core_examples에서 예문 추출:", example);
    } else {
      // 직접 언어 속성이 있는 경우
      example = {
        source: firstExample[sourceLanguage] || "",
        target: firstExample[targetLanguage] || "",
      };
      console.log("core_examples 직접 언어 속성에서 예문 추출:", example);
    }
  }
  // 4. 기존 examples 확인 (하위 호환성)
  else if (concept.examples && concept.examples.length > 0) {
    console.log("기존 examples 발견:", concept.examples);
    const firstExample = concept.examples[0];
    example = {
      source: firstExample[sourceLanguage] || "",
      target: firstExample[targetLanguage] || "",
    };
    console.log("기존 examples에서 예문 추출:", example);
  }

  console.log("최종 예문 결과:", example);

  // 개념 ID 생성 (document ID 우선 사용)
  const conceptId =
    concept.id ||
    concept._id ||
    `${sourceExpression.word}_${targetExpression.word}`;

  return `
    <div 
      class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200 cursor-pointer concept-card"
      onclick="openConceptViewModal('${conceptId}')"
      style="border-left: 4px solid ${colorTheme}"
    >
      <div class="flex items-start justify-between mb-4">
        <div class="flex items-center space-x-3">
          <span class="text-3xl">${emoji}</span>
        <div>
            <h3 class="text-lg font-semibold text-gray-800 mb-1">
              ${targetExpression.word || "N/A"}
            </h3>
          <p class="text-sm text-gray-500">${
            targetExpression.pronunciation ||
            targetExpression.romanization ||
            ""
          }</p>
          </div>
        </div>
        <span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
          ${getTranslatedText(conceptInfo.domain)}/${getTranslatedText(
    conceptInfo.category
  )}
        </span>
      </div>
      
      <div class="border-t border-gray-200 pt-3 mt-3">
        <div class="flex items-center">
          <span class="font-medium">${sourceExpression.word || "N/A"}</span>
        </div>
        <p class="text-sm text-gray-600 mt-1">${
          targetExpression.definition || ""
        }</p>
      </div>
      
      ${
        example && example.source && example.target
          ? `
      <div class="border-t border-gray-200 pt-3 mt-3">
        <p class="text-sm text-gray-700 font-medium">${example.target}</p>
        <p class="text-sm text-gray-500 italic">${example.source}</p>
      </div>
      `
          : ""
      }
      
      <div class="flex justify-between text-xs text-gray-500 mt-3">
        <span class="flex items-center">
          <i class="fas fa-language mr-1"></i> ${sourceLanguage} → ${targetLanguage}
        </span>
        <span class="flex items-center">
          <i class="fas fa-clock mr-1"></i> ${formatDate(
            concept.metadata?.created_at ||
              concept.created_at ||
              concept.timestamp
          )}
        </span>
      </div>
    </div>
  `;
}

// 언어 전환 함수
function swapLanguages(elements) {
  const sourceLanguage = elements.sourceLanguage.value;
  const targetLanguage = elements.targetLanguage.value;

  // 같은 언어인 경우 전환하지 않음
  if (sourceLanguage === targetLanguage) {
    return;
  }

  // 버튼 애니메이션 효과
  const swapButton = elements.swapButton;
  const icon = swapButton.querySelector("i");

  // 회전 애니메이션 추가
  icon.style.transform = "rotate(180deg)";
  icon.style.transition = "transform 0.3s ease";

  // 언어 순서 변경
  elements.sourceLanguage.value = targetLanguage;
  elements.targetLanguage.value = sourceLanguage;

  // 버튼 색상 변경으로 피드백 제공
  swapButton.classList.add("text-[#4B63AC]", "bg-gray-100");

  // 검색 및 화면 업데이트
  handleSearch(elements);

  // 애니메이션 후 원래 상태로 복원
  setTimeout(() => {
    icon.style.transform = "rotate(0deg)";
    swapButton.classList.remove("text-[#4B63AC]", "bg-gray-100");
  }, 300);
}

// 날짜 포맷팅 함수
function formatDate(timestamp) {
  if (!timestamp) return "";

  const date =
    timestamp instanceof Timestamp
      ? timestamp.toDate()
      : timestamp instanceof Date
      ? timestamp
      : new Date(timestamp);

  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

// 검색 및 필터링 함수 (확장된 구조 지원 및 디버깅 개선)
function handleSearch(elements) {
  displayCount = 12;
  lastVisibleConcept = null;
  firstVisibleConcept = null;

  const searchValue = elements.searchInput.value.toLowerCase();
  const sourceLanguage = elements.sourceLanguage.value;
  const targetLanguage = elements.targetLanguage.value;
  const categoryFilter = elements.categoryFilter.value;
  const sortOption = elements.sortOption.value;

  console.log("검색 및 필터링 시작:", {
    searchValue,
    sourceLanguage,
    targetLanguage,
    categoryFilter,
    sortOption,
    totalConcepts: allConcepts.length,
  });

  // 필터링 로직 (새 구조와 기존 구조 모두 지원)
  filteredConcepts = allConcepts.filter((concept) => {
    // 표현 확인 (더 유연한 조건)
    const sourceExpression = concept.expressions?.[sourceLanguage];
    const targetExpression = concept.expressions?.[targetLanguage];

    // 적어도 하나의 언어에는 단어가 있어야 함 (두 언어 모두 필수는 아님)
    const hasAnyExpression = Object.values(concept.expressions || {}).some(
      (expr) => expr.word
    );

    if (!hasAnyExpression) {
      console.log("표현이 없는 개념 필터링:", concept.id || concept._id);
      return false;
    }

    // 현재 선택된 언어 조합에서 적어도 하나는 있어야 함
    if (!sourceExpression?.word && !targetExpression?.word) {
      console.log(
        "선택된 언어 조합에 표현이 없는 개념:",
        concept.id || concept._id
      );
      return false;
    }

    // concept_info 가져오기 (새 구조 우선, 기존 구조 fallback)
    const conceptInfo = concept.concept_info || {
      domain: concept.domain || "기타",
      category: concept.category || "일반",
    };

    // 카테고리 필터
    if (categoryFilter !== "all" && conceptInfo.category !== categoryFilter) {
      return false;
    }

    // 검색어 필터
    if (searchValue) {
      const sourceWord = sourceExpression?.word?.toLowerCase() || "";
      const targetWord = targetExpression?.word?.toLowerCase() || "";
      const sourceDefinition =
        sourceExpression?.definition?.toLowerCase() || "";
      const targetDefinition =
        targetExpression?.definition?.toLowerCase() || "";

      // 태그도 검색에 포함 (새 구조)
      const tags = conceptInfo.tags
        ? conceptInfo.tags.join(" ").toLowerCase()
        : "";

      // 도메인과 카테고리도 검색에 포함
      const domain = conceptInfo.domain?.toLowerCase() || "";
      const category = conceptInfo.category?.toLowerCase() || "";

      const matchesSearch =
        sourceWord.includes(searchValue) ||
        targetWord.includes(searchValue) ||
        sourceDefinition.includes(searchValue) ||
        targetDefinition.includes(searchValue) ||
        tags.includes(searchValue) ||
        domain.includes(searchValue) ||
        category.includes(searchValue);

      if (!matchesSearch) {
        return false;
      }
    }

    return true;
  });

  console.log(`필터링 결과: ${filteredConcepts.length}개 개념`);

  // 정렬
  sortFilteredConcepts(sortOption);

  // 표시
  displayConceptList();
}

// 정렬 함수 (확장된 구조 지원)
function sortFilteredConcepts(sortOption) {
  const getConceptTime = (concept) => {
    // 최상위 레벨 created_at만 처리
    if (concept.created_at instanceof Timestamp) {
      return concept.created_at.toMillis();
    }
    if (concept.created_at) {
      return new Date(concept.created_at).getTime();
    }

    // timestamp 확인 (더 오래된 데이터)
    if (concept.timestamp instanceof Timestamp) {
      return concept.timestamp.toMillis();
    }
    if (concept.timestamp) {
      return new Date(concept.timestamp).getTime();
    }

    // 시간 정보가 없으면 현재 시간으로 간주
    return Date.now();
  };

  switch (sortOption) {
    case "latest":
      filteredConcepts.sort((a, b) => {
        return getConceptTime(b) - getConceptTime(a);
      });
      break;
    case "oldest":
      filteredConcepts.sort((a, b) => {
        return getConceptTime(a) - getConceptTime(b);
      });
      break;
    case "a-z":
      filteredConcepts.sort((a, b) => {
        const targetLanguage = document.getElementById("target-language").value;
        const wordA =
          a.expressions?.[targetLanguage]?.word?.toLowerCase() || "";
        const wordB =
          b.expressions?.[targetLanguage]?.word?.toLowerCase() || "";
        return wordA.localeCompare(wordB);
      });
      break;
    case "z-a":
      filteredConcepts.sort((a, b) => {
        const targetLanguage = document.getElementById("target-language").value;
        const wordA =
          a.expressions?.[targetLanguage]?.word?.toLowerCase() || "";
        const wordB =
          b.expressions?.[targetLanguage]?.word?.toLowerCase() || "";
        return wordB.localeCompare(wordA);
      });
      break;
  }
}

// 개념 목록 표시 함수 (디버깅 개선)
function displayConceptList() {
  const conceptList = document.getElementById("concept-list");
  const loadMoreBtn = document.getElementById("load-more");
  const conceptCount = document.getElementById("concept-count");

  if (!conceptList) {
    console.error("❌ concept-list 요소를 찾을 수 없습니다!");
    return;
  }

  // 표시할 개념 선택
  const conceptsToShow = filteredConcepts.slice(0, displayCount);

  // 개념 수 업데이트
  if (conceptCount) {
    conceptCount.textContent = filteredConcepts.length;
  }

  if (conceptsToShow.length === 0) {
    conceptList.innerHTML = `
      <div class="col-span-full text-center py-8 text-gray-500">
        표시할 개념이 없습니다. 다른 언어 조합이나 필터를 시도해보세요.
      </div>
    `;
    if (loadMoreBtn) loadMoreBtn.classList.add("hidden");
    return;
  }

  // 개념 카드 생성 및 표시
  const cardHTMLs = conceptsToShow
    .map((concept) => createConceptCard(concept))
    .filter((html) => html); // 빈 HTML 제거

  // HTML 삽입
  conceptList.innerHTML = cardHTMLs.join("");

  // 더 보기 버튼 표시/숨김
  if (loadMoreBtn) {
    if (filteredConcepts.length > displayCount) {
      loadMoreBtn.classList.remove("hidden");
    } else {
      loadMoreBtn.classList.add("hidden");
    }
  }

  console.log(`📄 ${cardHTMLs.length}개 카드 표시 완료`);
}

// 더 보기 버튼 처리
function handleLoadMore() {
  displayCount += 12;
  displayConceptList();
}

// 모달 로드 함수
async function loadModals(modalPaths) {
  try {
    const responses = await Promise.all(modalPaths.map((path) => fetch(path)));
    const htmlContents = await Promise.all(
      responses.map((response) => response.text())
    );

    const modalContainer = document.getElementById("modal-container");
    if (modalContainer) {
      modalContainer.innerHTML = htmlContents.join("");
    }
  } catch (error) {
    console.error("모달 로드 중 오류 발생:", error);
  }
}

// 사용량 UI 업데이트
async function updateUsageUI() {
  try {
    if (!currentUser) return;

    // 사용자 문서 가져오기
    const userRef = doc(db, "users", currentUser.email);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) return;

    const userData = userDoc.data();
    const conceptCount = userData.conceptCount || 0;
    const maxConcepts = userData.maxConcepts || 100;

    // UI 업데이트
    const usageText = document.getElementById("concept-usage-text");
    const usageBar = document.getElementById("concept-usage-bar");

    if (usageText) {
      usageText.textContent = `${conceptCount}/${maxConcepts}`;
    }

    if (usageBar) {
      const usagePercentage = (conceptCount / maxConcepts) * 100;
      usageBar.style.width = `${Math.min(usagePercentage, 100)}%`;

      // 색상 업데이트
      if (usagePercentage >= 90) {
        usageBar.classList.remove("bg-[#4B63AC]");
        usageBar.classList.add("bg-red-500");
      } else if (usagePercentage >= 70) {
        usageBar.classList.remove("bg-[#4B63AC]", "bg-red-500");
        usageBar.classList.add("bg-yellow-500");
      } else {
        usageBar.classList.remove("bg-red-500", "bg-yellow-500");
        usageBar.classList.add("bg-[#4B63AC]");
      }
    }
  } catch (error) {
    console.error("사용량 업데이트 중 오류 발생:", error);
  }
}

// 개념 데이터 가져오기 (ID 포함 및 디버깅 개선)
async function fetchAndDisplayConcepts() {
  try {
    if (!currentUser) return;

    console.log("개념 데이터 가져오기 시작...");

    // 분리된 컬렉션과 통합 컬렉션 모두에서 개념 가져오기
    allConcepts = [];
    const conceptsRef = collection(db, "concepts");

    // 분리된 컬렉션만 조회 (metadata.created_at 필드가 있는 개념들)
    console.log("🔍 분리된 컬렉션에서 개념 조회 중...");

    try {
      // metadata.created_at으로 정렬하여 분리된 컬렉션 개념만 조회
      const queryWithMetadataOrder = query(
        conceptsRef,
        orderBy("metadata.created_at", "desc")
      );
      const querySnapshot = await getDocs(queryWithMetadataOrder);

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        data.id = doc.id;
        if (!data._id) {
          data._id = doc.id;
        }

        // AI 생성 개념 제외, 분리된 컬렉션 개념만 포함
        if (!data.isAIGenerated && data.metadata?.created_at) {
          allConcepts.push(data);
          console.log("📊 분리된 컬렉션 개념 로딩:", data.id, data.expressions);
        }
      });

      console.log(
        `📚 분리된 컬렉션 조회 완료: ${allConcepts.length}개 개념 로딩`
      );
    } catch (metadataOrderError) {
      console.warn(
        "metadata.created_at 정렬 실패, 전체 조회로 분리된 컬렉션 개념 필터링"
      );

      // 정렬 실패 시 전체 조회 후 분리된 컬렉션 개념만 필터링
      const querySnapshot = await getDocs(conceptsRef);

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        data.id = doc.id;
        if (!data._id) {
          data._id = doc.id;
        }

        // AI 생성 개념 제외, 분리된 컬렉션 개념만 포함 (metadata.created_at 필드로 구분)
        if (!data.isAIGenerated && data.metadata?.created_at) {
          allConcepts.push(data);
          console.log("📊 분리된 컬렉션 개념 로딩:", data.id, data.expressions);
        }
      });

      console.log(
        `📚 필터링 후 분리된 컬렉션 개념: ${allConcepts.length}개 로딩`
      );
    }

    // JavaScript에서 정렬 (분리된 컬렉션과 통합 컬렉션 모두 지원)
    allConcepts.sort((a, b) => {
      const getTime = (concept) => {
        // 분리된 컬렉션: metadata.created_at 우선 확인
        if (concept.metadata?.created_at) {
          return concept.metadata.created_at.toDate
            ? concept.metadata.created_at.toDate().getTime()
            : new Date(concept.metadata.created_at).getTime();
        }
        // 통합 컬렉션: 최상위 레벨 created_at 확인
        if (concept.created_at) {
          return concept.created_at.toDate
            ? concept.created_at.toDate().getTime()
            : new Date(concept.created_at).getTime();
        }
        // concept_info.created_at 확인
        if (concept.concept_info?.created_at) {
          return concept.concept_info.created_at.toDate
            ? concept.concept_info.created_at.toDate().getTime()
            : new Date(concept.concept_info.created_at).getTime();
        }
        // timestamp 확인 (더 오래된 데이터)
        if (concept.timestamp) {
          return concept.timestamp.toDate
            ? concept.timestamp.toDate().getTime()
            : new Date(concept.timestamp).getTime();
        }
        // 시간 정보가 없으면 현재 시간으로 간주 (최신으로 표시)
        return Date.now();
      };

      return getTime(b) - getTime(a); // 내림차순 정렬
    });

    console.log(`📚 총 ${allConcepts.length}개 개념 로딩 완료`);

    // 전역 변수 업데이트 (편집 모달에서 접근 가능하도록)
    window.allConcepts = allConcepts;
    console.log(
      "🌍 전역 allConcepts 업데이트 완료:",
      window.allConcepts.length
    );

    // 학습 페이지에서 사용할 수 있도록 sessionStorage에도 저장
    try {
      sessionStorage.setItem(
        "learningConcepts",
        JSON.stringify(allConcepts.slice(0, 100))
      ); // 성능을 위해 최대 100개
      console.log("💾 학습용 개념 데이터 sessionStorage에 저장 완료");
    } catch (error) {
      console.warn("⚠️ sessionStorage 저장 실패:", error);
    }

    // 현재 필터로 검색 및 표시
    const elements = {
      searchInput: document.getElementById("search-input"),
      sourceLanguage: document.getElementById("source-language"),
      targetLanguage: document.getElementById("target-language"),
      categoryFilter: document.getElementById("category-filter"),
      sortOption: document.getElementById("sort-option"),
    };

    handleSearch(elements);
  } catch (error) {
    console.error("❌ 개념 데이터 가져오기 오류:", error);
    throw error;
  }
}

// 개념 상세 보기 모달 열기 함수 (전역 함수, ID 조회 개선)
window.openConceptViewModal = async function (conceptId) {
  try {
    console.log("모달 열기 시도, conceptId:", conceptId);

    // conceptUtils가 정의되어 있는지 확인
    if (!conceptUtils) {
      throw new Error("conceptUtils가 정의되지 않았습니다.");
    }

    // 현재 선택된 언어 설정 가져오기
    const sourceLanguage = document.getElementById("source-language").value;
    const targetLanguage = document.getElementById("target-language").value;

    console.log("현재 언어 설정:", { sourceLanguage, targetLanguage });

    // 먼저 메모리에서 개념 찾기 (빠른 검색)
    let conceptData = allConcepts.find(
      (concept) =>
        concept.id === conceptId ||
        concept._id === conceptId ||
        `${concept.expressions?.[sourceLanguage]?.word}_${concept.expressions?.[targetLanguage]?.word}` ===
          conceptId
    );

    console.log("메모리에서 개념 찾기 결과:", conceptData ? "발견" : "없음");

    // 메모리에서 찾지 못했으면 Firebase에서 조회
    if (!conceptData) {
      console.log("Firebase에서 개념 조회 시도...");
      try {
        conceptData = await conceptUtils.getConcept(conceptId);
        console.log("Firebase 조회 결과:", conceptData);
      } catch (error) {
        console.error("Firebase 조회 실패:", error);

        // ID가 word 조합 형태인 경우 메모리에서 다시 검색
        if (conceptId.includes("_")) {
          const [sourceWord, targetWord] = conceptId.split("_");
          conceptData = allConcepts.find((concept) => {
            const srcExpr = concept.expressions?.[sourceLanguage];
            const tgtExpr = concept.expressions?.[targetLanguage];
            return srcExpr?.word === sourceWord && tgtExpr?.word === targetWord;
          });
          console.log(
            "단어 조합으로 재검색 결과:",
            conceptData ? "발견" : "없음"
          );
        }
      }
    }

    if (!conceptData) {
      console.error("개념을 찾을 수 없습니다. conceptId:", conceptId);
      console.log(
        "사용 가능한 개념들:",
        allConcepts.map((c) => ({
          id: c.id || c._id,
          sourceWord: c.expressions?.[sourceLanguage]?.word,
          targetWord: c.expressions?.[targetLanguage]?.word,
        }))
      );
      alert("개념 정보를 찾을 수 없습니다.");
      return;
    }

    const modal = document.getElementById("concept-view-modal");
    if (!modal) {
      throw new Error("concept-view-modal 요소를 찾을 수 없습니다.");
    }

    console.log("모달 콘텐츠 채우기 시작...");
    // 모달 콘텐츠 채우기 (언어 설정 전달)
    fillConceptViewModal(conceptData, sourceLanguage, targetLanguage);

    console.log("모달 표시...");
    // 모달 표시 (CSS 우선순위 문제 해결)
    modal.classList.remove("hidden");
    modal.style.display = "flex"; // 강제로 표시
    console.log("🔍 모달 표시 후 상태:", {
      classList: Array.from(modal.classList),
      display: getComputedStyle(modal).display,
      visibility: getComputedStyle(modal).visibility,
    });

    // 모달이 표시된 후에 예문 로드
    console.log("📖 모달 표시 완료, 예문 로드 시작...");
    await loadAndDisplayExamples(
      conceptData.id,
      sourceLanguage,
      targetLanguage
    );

    console.log("모달 열기 완료");
  } catch (error) {
    console.error("개념 상세 보기 모달 열기 중 오류 발생:", error);
    console.error("Error stack:", error.stack);
    alert("개념 정보를 불러올 수 없습니다: " + error.message);
  }
};

// 개념 상세 보기 모달 채우기 (분리된 컬렉션 지원)
function fillConceptViewModal(conceptData, sourceLanguage, targetLanguage) {
  if (!conceptData) {
    console.error("개념 데이터가 없습니다");
    return;
  }

  console.log("모달 채우기:", conceptData);

  // 기본 정보 설정
  const sourceExpression = conceptData.expressions?.[sourceLanguage] || {};
  const targetExpression = conceptData.expressions?.[targetLanguage] || {};

  // 제목과 기본 정보
  const titleElement = document.getElementById("concept-view-title");
  const pronunciationElement = document.getElementById(
    "concept-view-pronunciation"
  );

  if (titleElement) {
    titleElement.textContent = targetExpression.word || "N/A";
  }
  if (pronunciationElement) {
    pronunciationElement.textContent =
      targetExpression.pronunciation || targetExpression.romanization || "";
  }

  // 개념 정보
  const conceptInfo = conceptData.concept_info || {};
  console.log("🏷️ 개념 정보:", conceptInfo);

  // 이모지와 색상 (개념 카드와 동일한 우선순위 적용)
  const emoji =
    conceptInfo.unicode_emoji ||
    conceptInfo.emoji ||
    conceptData.emoji ||
    conceptData.unicode_emoji ||
    "📝";
  const colorTheme = conceptInfo.color_theme || "#4B63AC";

  console.log("🔍 이모지 선택 디버깅:", {
    conceptInfo_unicode_emoji: conceptInfo.unicode_emoji,
    conceptInfo_emoji: conceptInfo.emoji,
    conceptData_emoji: conceptData.emoji,
    conceptData_unicode_emoji: conceptData.unicode_emoji,
    final_emoji: emoji,
    concept_info: conceptInfo,
    concept_data: conceptData,
  });

  const emojiElement = document.getElementById("concept-view-emoji");
  console.log("🔍 이모지 요소 검색:", {
    emojiElement: emojiElement,
    modal: document.getElementById("concept-view-modal"),
    allEmojiElements: document.querySelectorAll("#concept-view-emoji"),
    modalContent: document
      .getElementById("concept-view-modal")
      ?.innerHTML?.substring(0, 500),
  });

  // 요소를 찾을 수 없을 때 DOM 상태 상세 분석
  if (!emojiElement) {
    console.log("🔍 DOM 상세 분석:");
    const modalExists = !!document.getElementById("concept-view-modal");
    const modalVisible =
      modalExists &&
      window.getComputedStyle(document.getElementById("concept-view-modal"))
        .display !== "none";
    const allDivs = document.querySelectorAll("div[id*='concept']");
    const allEmojis = document.querySelectorAll("div[id*='emoji']");

    console.log({
      modalExists,
      modalVisible,
      allConceptDivs: allDivs.length,
      allEmojiDivs: allEmojis.length,
      allConceptIds: Array.from(allDivs).map((d) => d.id),
      allEmojiIds: Array.from(allEmojis).map((d) => d.id),
    });

    // 약간의 지연 후 재시도
    setTimeout(() => {
      const delayedEmojiElement = document.getElementById("concept-view-emoji");
      console.log("🔄 지연 후 이모지 요소 재검색:", delayedEmojiElement);
      if (delayedEmojiElement && emoji) {
        delayedEmojiElement.textContent = emoji;
        console.log("✅ 지연 후 보기 모달 이모지 설정 완료:", emoji);
      }
    }, 100);
  }

  if (emojiElement && emoji) {
    emojiElement.textContent = emoji;
    console.log("✅ 보기 모달 이모지 설정 완료:", emoji);
  } else if (!emojiElement) {
    console.log(
      "❌ concept-view-emoji 요소를 찾을 수 없습니다. 모달이 제대로 로드되지 않았을 수 있습니다."
    );
  } else if (!emoji) {
    console.log("❌ emoji가 없습니다.");
  }

  const headerElement = document.querySelector(".concept-view-header");
  if (headerElement) {
    headerElement.style.borderLeftColor = colorTheme;
  }

  // 날짜 정보 (분리된 컬렉션 메타데이터 우선)
  const createdDate =
    conceptData.metadata?.created_at ||
    conceptData.created_at ||
    conceptData.timestamp;

  const dateElement = document.getElementById("concept-updated-at");
  if (dateElement && createdDate) {
    dateElement.textContent = formatDate(createdDate);
  }

  // 언어별 표현 채우기
  fillLanguageExpressions(conceptData, sourceLanguage, targetLanguage);

  // 모달 버튼 설정
  setupModalButtons(conceptData);
}

// 분리된 컬렉션에서 예문 로드 및 표시
async function loadAndDisplayExamples(
  conceptId,
  sourceLanguage,
  targetLanguage
) {
  try {
    // 보기 모달 내부의 examples-container만 찾기
    const viewModal = document.getElementById("concept-view-modal");
    const examplesContainer = viewModal
      ? viewModal.querySelector("#examples-container")
      : null;
    if (!examplesContainer) {
      console.error("❌ 보기 모달 내 examples-container를 찾을 수 없습니다");
      return;
    }

    let examplesHTML = "";
    const allExamples = [];

    // 1. 현재 개념에서 representative_example만 사용 (중복 방지)
    const currentConcept = allConcepts.find(
      (c) => c.id === conceptId || c._id === conceptId
    );

    if (currentConcept?.representative_example) {
      console.log("대표 예문 발견:", currentConcept.representative_example);

      const repExample = currentConcept.representative_example;
      if (repExample.translations) {
        console.log("🔍 대표 예문 translations 구조:", repExample.translations);
        console.log(
          "🔍 sourceLanguage:",
          sourceLanguage,
          "targetLanguage:",
          targetLanguage
        );

        const sourceText =
          repExample.translations[sourceLanguage]?.text ||
          repExample.translations[sourceLanguage] ||
          "";
        const targetText =
          repExample.translations[targetLanguage]?.text ||
          repExample.translations[targetLanguage] ||
          "";

        console.log("📝 추출된 예문:", { sourceText, targetText });

        if (sourceText && targetText) {
          allExamples.push({
            sourceText,
            targetText,
            priority: repExample.priority || 10,
            context: repExample.context || "대표 예문",
            isRepresentative: true,
          });
          console.log("✅ 대표 예문을 allExamples에 추가함");
        } else {
          console.log("⚠️ sourceText 또는 targetText가 비어있음");
        }
      } else {
        console.log("⚠️ repExample.translations가 없음");
      }
    }

    // 3. 대표 예문이 없는 경우에만 기존 구조에서 예문 확인 (하위 호환성)
    if (allExamples.length === 0 && currentConcept) {
      // featured_examples 확인
      if (
        currentConcept.featured_examples &&
        currentConcept.featured_examples.length > 0
      ) {
        currentConcept.featured_examples.forEach((example, index) => {
          if (example.translations) {
            const sourceText = example.translations[sourceLanguage]?.text || "";
            const targetText = example.translations[targetLanguage]?.text || "";

            if (sourceText && targetText) {
              allExamples.push({
                sourceText,
                targetText,
                priority: example.priority || 10 - index,
                context: example.context || "추천",
                isRepresentative: index === 0, // 첫 번째만 대표
              });
            }
          }
        });
      }

      // core_examples 확인 (featured_examples가 없는 경우에만)
      if (
        allExamples.length === 0 &&
        currentConcept.core_examples &&
        currentConcept.core_examples.length > 0
      ) {
        currentConcept.core_examples.forEach((example, index) => {
          if (example.translations) {
            const sourceText = example.translations[sourceLanguage]?.text || "";
            const targetText = example.translations[targetLanguage]?.text || "";

            if (sourceText && targetText) {
              allExamples.push({
                sourceText,
                targetText,
                priority: example.priority || 10 - index,
                context: example.context || "핵심",
                isRepresentative: index === 0, // 첫 번째만 대표
              });
            }
          }
        });
      }
    }

    // priority가 높은 순으로 정렬
    allExamples.sort((a, b) => (b.priority || 0) - (a.priority || 0));

    // 상위 3개만 표시 (중복 방지)
    allExamples.slice(0, 3).forEach((example) => {
      // 배지 제거 - 깔끔하게 예문만 표시
      examplesHTML += `
        <div class="bg-gray-50 p-3 rounded-lg mb-3">
          <p class="text-gray-800 mb-1">${example.targetText}</p>
          <p class="text-gray-600 text-sm">${example.sourceText}</p>
        </div>
      `;
    });

    console.log(
      `모달에 표시할 예문 수: ${allExamples.length} (concepts 컬렉션에서만)`
    );
    console.log("🔍 생성된 examplesHTML:", examplesHTML);
    console.log("📋 examplesContainer 요소:", examplesContainer);

    if (examplesHTML) {
      console.log("✅ 예문 HTML을 컨테이너에 삽입 중...");
      console.log("🔍 컨테이너 삽입 전 스타일:", {
        display: getComputedStyle(examplesContainer).display,
        visibility: getComputedStyle(examplesContainer).visibility,
        opacity: getComputedStyle(examplesContainer).opacity,
        height: getComputedStyle(examplesContainer).height,
      });
      examplesContainer.innerHTML = examplesHTML;
      console.log(
        "✅ 예문 HTML 삽입 완료, 컨테이너 내용:",
        examplesContainer.innerHTML
      );
      console.log("🔍 컨테이너 삽입 후 스타일:", {
        display: getComputedStyle(examplesContainer).display,
        visibility: getComputedStyle(examplesContainer).visibility,
        opacity: getComputedStyle(examplesContainer).opacity,
        height: getComputedStyle(examplesContainer).height,
      });
      console.log("🔍 컨테이너 부모 요소:", examplesContainer.parentElement);
      console.log("🔍 모달 표시 상태:", {
        modal: document.getElementById("concept-view-modal"),
        modalDisplay: getComputedStyle(
          document.getElementById("concept-view-modal")
        ).display,
      });
    } else {
      console.log("⚠️ 예문 HTML이 비어있음, 기본 메시지 표시");
      examplesContainer.innerHTML = `
        <div class="text-center text-gray-500 py-4">
          <i class="fas fa-quote-left text-2xl mb-2"></i>
          <p>등록된 예문이 없습니다.</p>
        </div>
      `;
    }
  } catch (error) {
    console.error("예문 로드 중 오류:", error);
    console.error("오류 스택:", error.stack);
    const examplesContainer = document.getElementById("examples-container");
    if (examplesContainer) {
      examplesContainer.innerHTML = `
        <div class="text-center text-red-500 py-4">
          <p>예문을 불러오는 중 오류가 발생했습니다.</p>
        </div>
      `;
    } else {
      console.error("❌ catch 블록에서도 examples-container를 찾을 수 없음");
    }
  }
}

// 언어별 표현 정보 채우기 함수 (확장된 구조 지원)
function fillLanguageExpressions(conceptData, sourceLanguage, targetLanguage) {
  const tabContainer = document.getElementById("language-tabs");
  const contentContainer = document.getElementById("language-content");

  if (!tabContainer || !contentContainer) {
    console.error("탭 컨테이너를 찾을 수 없습니다:", {
      tabContainer,
      contentContainer,
    });
    return;
  }

  tabContainer.innerHTML = "";
  contentContainer.innerHTML = "";

  // 언어탭 순서: 대상언어 → 원본언어 → 나머지 언어들
  const orderedLanguages = [];

  // 1. 대상언어 먼저 추가 (있는 경우)
  if (targetLanguage && conceptData.expressions?.[targetLanguage]?.word) {
    orderedLanguages.push(targetLanguage);
  }

  // 2. 원본언어 추가 (있고, 대상언어와 다른 경우)
  if (
    sourceLanguage &&
    conceptData.expressions?.[sourceLanguage]?.word &&
    sourceLanguage !== targetLanguage
  ) {
    orderedLanguages.push(sourceLanguage);
  }

  // 3. 나머지 언어들 추가 (원본언어, 대상언어 제외)
  Object.keys(conceptData.expressions || {}).forEach((langCode) => {
    if (
      !orderedLanguages.includes(langCode) &&
      conceptData.expressions[langCode]?.word
    ) {
      orderedLanguages.push(langCode);
    }
  });

  if (orderedLanguages.length === 0) {
    console.error("표시할 언어가 없습니다.");
    return;
  }

  // 각 언어별 탭과 컨텐츠 생성
  orderedLanguages.forEach((langCode, index) => {
    const expression = conceptData.expressions[langCode];
    const sourceExpression = conceptData.expressions?.[sourceLanguage] || {};
    const langInfo = supportedLanguages[langCode] || {
      nameKo: langCode,
      code: langCode,
    };

    // 탭 생성
    const tab = document.createElement("button");
    tab.id = `view-${langCode}-tab`;
    tab.className = `px-4 py-2 border-b-2 ${
      index === 0
        ? "border-blue-500 text-blue-600"
        : "border-transparent text-gray-500 hover:text-gray-700"
    }`;
    tab.textContent = getLanguageName(langCode);
    tab.onclick = () => switchViewTab(langCode);

    tabContainer.appendChild(tab);

    // 컨텐츠 패널 생성 (간소화)
    const panel = document.createElement("div");
    panel.id = `view-${langCode}-content`;
    panel.className = `${index === 0 ? "" : "hidden"} p-4`;

    contentContainer.appendChild(panel);

    // 첫 번째 언어탭의 경우 즉시 내용 업데이트
    if (index === 0) {
      updateLanguageContent(langCode, conceptData, sourceLanguage);
    }
  });

  // 탭 전환 함수 정의
  window.switchViewTab = (langCode) => {
    // 모든 탭 비활성화
    document.querySelectorAll("[id^='view-'][id$='-tab']").forEach((tab) => {
      tab.className =
        "px-4 py-2 border-b-2 border-transparent text-gray-500 hover:text-gray-700";
    });

    // 모든 컨텐츠 패널 숨기기
    document
      .querySelectorAll("[id^='view-'][id$='-content']")
      .forEach((content) => {
        content.classList.add("hidden");
      });

    // 선택된 탭 활성화
    const selectedTab = document.getElementById(`view-${langCode}-tab`);
    if (selectedTab) {
      selectedTab.className =
        "px-4 py-2 border-b-2 border-blue-500 text-blue-600";
    }

    // 선택된 컨텐츠 표시
    const selectedContent = document.getElementById(`view-${langCode}-content`);
    if (selectedContent) {
      selectedContent.classList.remove("hidden");
    }

    // 모달 제목과 발음 정보만 업데이트 (뜻과 품사는 환경 언어로 유지)
    const currentExpression = conceptData.expressions?.[langCode] || {};
    const titleElement = document.getElementById("concept-view-title");
    const pronunciationElement = document.getElementById(
      "concept-view-pronunciation"
    );

    if (titleElement) {
      titleElement.textContent = currentExpression.word || "N/A";
    }
    if (pronunciationElement) {
      pronunciationElement.textContent =
        currentExpression.pronunciation ||
        currentExpression.romanization ||
        currentExpression.phonetic ||
        "";
    }

    // 각 언어별 컨텐츠 패널 내용 다시 생성 (환경 언어 기준 뜻과 품사 유지)
    updateLanguageContent(langCode, conceptData, sourceLanguage);

    // 언어탭 변경에 따라 예문의 대상 언어도 업데이트
    console.log(
      `🔄 언어탭 변경: ${sourceLanguage} → ${langCode}, 예문 업데이트 중...`
    );
    loadAndDisplayExamples(conceptData.id, sourceLanguage, langCode);
  };

  // 시간 표시 설정
  setupConceptTimestamp(conceptData);

  // 모달 버튼 이벤트 설정
  setupModalButtons(conceptData);
}

// 언어별 컨텐츠 업데이트 함수 (환경 언어 기준)
function updateLanguageContent(langCode, conceptData, sourceLanguage) {
  const panel = document.getElementById(`view-${langCode}-content`);
  if (!panel || !conceptData) return;

  const expression = conceptData.expressions?.[langCode] || {};

  // 환경 언어(sourceLanguage)의 표현에서 번역어 가져오기
  const envExpression =
    conceptData.expressions?.[sourceLanguage] ||
    conceptData.expressions?.korean ||
    {};

  // 환경 설정 언어에 따른 레이블 가져오기
  const getUILabels = (userLang) => {
    const labels = {
      ko: {
        synonyms: "유의어",
        antonyms: "반의어",
        word_family: "어족",
        compound_words: "복합어",
        collocations: "연어",
        partOfSpeech: {
          noun: "명사",
          verb: "동사",
          adjective: "형용사",
          adverb: "부사",
          pronoun: "대명사",
          preposition: "전치사",
          conjunction: "접속사",
          interjection: "감탄사",
        },
      },
      en: {
        synonyms: "Synonyms",
        antonyms: "Antonyms",
        word_family: "Word Family",
        compound_words: "Compound Words",
        collocations: "Collocations",
        partOfSpeech: {
          noun: "noun",
          verb: "verb",
          adjective: "adjective",
          adverb: "adverb",
          pronoun: "pronoun",
          preposition: "preposition",
          conjunction: "conjunction",
          interjection: "interjection",
        },
      },
      ja: {
        synonyms: "類義語",
        antonyms: "反意語",
        word_family: "語族",
        compound_words: "複合語",
        collocations: "連語",
        partOfSpeech: {
          noun: "名詞",
          verb: "動詞",
          adjective: "形容詞",
          adverb: "副詞",
          pronoun: "代名詞",
          preposition: "前置詞",
          conjunction: "接続詞",
          interjection: "感嘆詞",
        },
      },
      zh: {
        synonyms: "同义词",
        antonyms: "反义词",
        word_family: "词族",
        compound_words: "复合词",
        collocations: "搭配词",
        partOfSpeech: {
          noun: "名词",
          verb: "动词",
          adjective: "形容词",
          adverb: "副词",
          pronoun: "代词",
          preposition: "介词",
          conjunction: "连词",
          interjection: "感叹词",
        },
      },
    };
    return labels[userLang] || labels.ko;
  };

  const uiLabels = getUILabels(userLanguage);

  // 품사 번역
  const translatePartOfSpeech = (pos) => {
    if (!pos) return "";
    return uiLabels.partOfSpeech[pos] || pos;
  };

  console.log(`🔍 ${langCode} 언어 표현 데이터:`, expression);

  panel.innerHTML = `
    <div class="mb-4">
      <div class="flex items-center gap-2 mb-1">
        <h3 class="text-xl font-bold text-blue-600">${
          envExpression.word || "N/A"
        }</h3>
        ${
          envExpression.part_of_speech
            ? `<span class="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">${translatePartOfSpeech(
                envExpression.part_of_speech
              )}</span>`
            : ""
        }
      </div>

    </div>
    ${
      expression.definition
        ? `<div class="mb-4">
        <p class="text-sm text-gray-600">${expression.definition}</p>
      </div>`
        : ""
    }
    ${
      expression.synonyms && expression.synonyms.length > 0
        ? `<div class="mb-3">
        <h4 class="text-sm font-medium text-gray-700 mb-1">${
          uiLabels.synonyms
        }</h4>
        <div class="flex flex-wrap gap-1">
          ${expression.synonyms
            .map(
              (synonym) =>
                `<span class="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">${synonym}</span>`
            )
            .join("")}
        </div>
      </div>`
        : ""
    }
    ${
      expression.antonyms && expression.antonyms.length > 0
        ? `<div class="mb-3">
        <h4 class="text-sm font-medium text-gray-700 mb-1">${
          uiLabels.antonyms
        }</h4>
        <div class="flex flex-wrap gap-1">
          ${expression.antonyms
            .map(
              (antonym) =>
                `<span class="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">${antonym}</span>`
            )
            .join("")}
        </div>
      </div>`
        : ""
    }
    ${
      expression.word_family && expression.word_family.length > 0
        ? `<div class="mb-3">
        <h4 class="text-sm font-medium text-gray-700 mb-1">${
          uiLabels.word_family
        }</h4>
        <div class="flex flex-wrap gap-1">
          ${expression.word_family
            .map(
              (word) =>
                `<span class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">${word}</span>`
            )
            .join("")}
        </div>
      </div>`
        : ""
    }
    ${
      expression.compound_words && expression.compound_words.length > 0
        ? `<div class="mb-3">
        <h4 class="text-sm font-medium text-gray-700 mb-1">${
          uiLabels.compound_words
        }</h4>
        <div class="flex flex-wrap gap-1">
          ${expression.compound_words
            .map(
              (word) =>
                `<span class="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded">${word}</span>`
            )
            .join("")}
        </div>
      </div>`
        : ""
    }
    ${
      expression.collocations && expression.collocations.length > 0
        ? `<div class="mb-3">
        <h4 class="text-sm font-medium text-gray-700 mb-1">${
          uiLabels.collocations
        }</h4>
        <div class="flex flex-wrap gap-1">
          ${expression.collocations
            .map(
              (collocation) =>
                `<span class="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">${collocation}</span>`
            )
            .join("")}
        </div>
      </div>`
        : ""
    }
  `;
}

// 개념 시간 표시 설정
function setupConceptTimestamp(conceptData) {
  const timestampElement = document.getElementById("concept-timestamp");
  if (timestampElement && conceptData) {
    let timeText = "등록 시간";

    console.log("⏰ 시간 설정 시도:", conceptData);

    // 여러 가능한 시간 필드 확인
    let dateValue = null;

    if (conceptData.metadata?.created_at) {
      dateValue = conceptData.metadata.created_at;
    } else if (conceptData.metadata?.timestamp) {
      dateValue = conceptData.metadata.timestamp;
    } else if (conceptData.createdAt) {
      dateValue = conceptData.createdAt;
    } else if (conceptData.timestamp) {
      dateValue = conceptData.timestamp;
    } else if (conceptData.created_at) {
      dateValue = conceptData.created_at;
    }

    if (dateValue) {
      try {
        let date;
        if (dateValue.toDate) {
          // Firestore Timestamp
          date = dateValue.toDate();
        } else if (dateValue instanceof Date) {
          date = dateValue;
        } else if (
          typeof dateValue === "string" ||
          typeof dateValue === "number"
        ) {
          date = new Date(dateValue);
        }

        if (date && !isNaN(date.getTime())) {
          timeText = formatDate(date);
          console.log("✅ 시간 설정 성공:", timeText);
        }
      } catch (error) {
        console.error("❌ 시간 파싱 오류:", error);
      }
    } else {
      console.log("⚠️ 시간 정보 없음, 기본값 사용");
    }

    timestampElement.textContent = timeText;
  }
}

// 모달 버튼 이벤트 설정
function setupModalButtons(conceptData) {
  // 편집 버튼 이벤트
  const editButton = document.getElementById("edit-concept-button");
  if (editButton) {
    editButton.onclick = () => {
      // 개념 수정 모달 열기
      const viewModal = document.getElementById("concept-view-modal");
      if (viewModal) {
        viewModal.classList.add("hidden");
        viewModal.style.display = "none"; // 강제로 숨기기
      }

      const conceptId =
        conceptData.concept_id || conceptData.id || conceptData._id;
      console.log("🔧 편집 버튼 클릭, conceptId:", conceptId);

      // 약간의 지연 후 편집 모달 열기 (DOM 업데이트 대기)
      setTimeout(() => {
        if (window.openEditConceptModal) {
          window.openEditConceptModal(conceptId);
        } else {
          console.error("❌ openEditConceptModal 함수가 정의되지 않았습니다.");
        }
      }, 100);
    };
  }

  // 삭제 버튼 이벤트
  const deleteButton = document.getElementById("delete-concept-button");
  if (deleteButton) {
    deleteButton.onclick = async () => {
      if (confirm("정말로 이 개념을 삭제하시겠습니까?")) {
        try {
          await conceptUtils.deleteConcept(conceptData.id || conceptData._id);
          alert("개념이 성공적으로 삭제되었습니다.");

          // 모달 닫기
          const viewModal = document.getElementById("concept-view-modal");
          if (viewModal) {
            viewModal.classList.add("hidden");
            viewModal.style.display = "none";
            console.log("✅ 삭제 후 모달 닫기 완료");
          }

          // 목록 새로고침
          window.dispatchEvent(new CustomEvent("concept-saved"));
        } catch (error) {
          console.error("개념 삭제 중 오류 발생:", error);
          alert("개념 삭제 중 오류가 발생했습니다: " + error.message);
        }
      }
    };
  }

  // 모달 닫기 버튼 이벤트 (여러 방법으로 설정)
  const closeButton = document.getElementById("close-concept-view-modal");
  if (closeButton) {
    // 기존 이벤트 리스너 제거
    closeButton.onclick = null;

    // 새로운 이벤트 리스너 추가
    const closeModal = (e) => {
      e.preventDefault();
      e.stopPropagation();
      const modal = document.getElementById("concept-view-modal");
      if (modal) {
        modal.classList.add("hidden");
        modal.style.display = "none"; // 강제로 숨기기
        console.log("✅ 모달 닫기 완료");
      }
    };

    closeButton.addEventListener("click", closeModal);
    closeButton.onclick = closeModal; // 백업용
    console.log("✅ 모달 닫기 버튼 이벤트 설정 완료");
  } else {
    console.error("❌ close-concept-view-modal 버튼을 찾을 수 없습니다");
  }

  // 모달 배경 클릭으로도 닫기
  const modal = document.getElementById("concept-view-modal");
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.classList.add("hidden");
        modal.style.display = "none";
        console.log("✅ 모달 배경 클릭으로 닫기");
      }
    });
  }
}

// 페이지 초기화
document.addEventListener("DOMContentLoaded", async () => {
  try {
    console.log("🚀 DOMContentLoaded 이벤트 시작");

    // 현재 활성화된 언어 코드 가져오기
    userLanguage = await getActiveLanguage();
    console.log("✅ 언어 설정 완료:", userLanguage);

    // 네비게이션바 로드
    console.log("📋 네비게이션바 로드 시작");
    const navbarContainer = document.getElementById("navbar-container");
    console.log("📋 네비게이션 바 컨테이너:", navbarContainer);

    if (!navbarContainer) {
      console.error("❌ navbar-container를 찾을 수 없습니다!");
      throw new Error("navbar-container 요소가 없습니다.");
    }

    await loadNavbar(navbarContainer);
    console.log("✅ 네비게이션바 로드 완료");

    // 네비게이션바가 실제로 로드되었는지 확인
    setTimeout(() => {
      const loadedNavbar = document.querySelector("#navbar-container nav");
      console.log("🔍 로드된 네비게이션바:", loadedNavbar);
      if (!loadedNavbar) {
        console.error("❌ 네비게이션바가 제대로 로드되지 않았습니다!");
      }
    }, 1000);

    // 모달 초기화
    console.log("🔧 모달 초기화 시작");
    await loadModals([
      "../components/add-concept-modal.html",
      "../components/edit-concept-modal.html",
      "../components/concept-view-modal.html",
      "../components/bulk-import-modal.html",
    ]);
    console.log("✅ 모달 초기화 완료");

    // 모달 컴포넌트 초기화
    console.log("⚙️ 모달 컴포넌트 초기화 시작");
    await initializeConceptModal();
    initializeBulkImportModal();
    console.log("✅ 모달 컴포넌트 초기화 완료");

    // 이벤트 리스너 설정
    console.log("🔗 이벤트 리스너 설정 시작");
    setupEventListeners();
    console.log("✅ 이벤트 리스너 설정 완료");

    // 메타데이터 업데이트
    console.log("📄 메타데이터 업데이트 시작");
    await updateMetadata("dictionary");
    console.log("✅ 메타데이터 업데이트 완료");

    // 사용자 인증 상태 관찰
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        console.log("👤 사용자 로그인 확인:", user.email);
        currentUser = user;
        await fetchAndDisplayConcepts();
        await updateUsageUI();
      } else {
        alert(getTranslatedText("login_required"));
        window.location.href = "../login.html";
      }
    });
  } catch (error) {
    console.error("❌ 다국어 단어장 페이지 초기화 중 오류 발생:", error);
    showError("페이지를 불러오는 중 문제가 발생했습니다.", error.message);
  }
});

// 이벤트 리스너 설정
function setupEventListeners() {
  console.log("🔧 setupEventListeners 함수 시작");

  const elements = {
    searchInput: document.getElementById("search-input"),
    sourceLanguage: document.getElementById("source-language"),
    targetLanguage: document.getElementById("target-language"),
    categoryFilter: document.getElementById("category-filter"),
    sortOption: document.getElementById("sort-option"),
    swapButton: document.getElementById("swap-languages"),
    loadMoreButton: document.getElementById("load-more"),
    addConceptButton: document.getElementById("add-concept"),
    bulkAddButton: document.getElementById("bulk-add-concept"),
  };

  // 모든 요소가 제대로 찾아졌는지 확인
  console.log("🔍 Found elements:", {
    addConceptButton: !!elements.addConceptButton,
    bulkAddButton: !!elements.bulkAddButton,
    searchInput: !!elements.searchInput,
    sourceLanguage: !!elements.sourceLanguage,
    targetLanguage: !!elements.targetLanguage,
    categoryFilter: !!elements.categoryFilter,
    sortOption: !!elements.sortOption,
    swapButton: !!elements.swapButton,
    loadMoreButton: !!elements.loadMoreButton,
  });

  // 검색 이벤트
  if (elements.searchInput) {
    elements.searchInput.addEventListener("input", () =>
      handleSearch(elements)
    );
    console.log("✅ 검색 이벤트 리스너 등록됨");
  } else {
    console.error("❌ search-input 요소를 찾을 수 없습니다");
  }

  // 언어 변경 이벤트
  [elements.sourceLanguage, elements.targetLanguage].forEach((select) => {
    if (select) {
      select.addEventListener("change", () => {
        fetchAndDisplayConcepts();
      });
    }
  });

  // 카테고리 필터 이벤트
  if (elements.categoryFilter) {
    elements.categoryFilter.addEventListener("change", () => {
      handleSearch(elements);
    });
  }

  // 정렬 옵션 이벤트
  if (elements.sortOption) {
    elements.sortOption.addEventListener("change", () => {
      sortFilteredConcepts(elements.sortOption.value);
      displayConceptList();
    });
  }

  // 언어 순서 바꾸기 이벤트
  if (elements.swapButton) {
    elements.swapButton.addEventListener("click", () =>
      swapLanguages(elements)
    );
  }

  // 더 보기 버튼 이벤트
  if (elements.loadMoreButton) {
    elements.loadMoreButton.addEventListener("click", handleLoadMore);
  }

  // 새 개념 추가 버튼 이벤트
  if (elements.addConceptButton) {
    console.log("➕ 새 개념 추가 버튼 이벤트 리스너 등록 중...");
    elements.addConceptButton.addEventListener("click", () => {
      console.log("🖱️ 새 개념 추가 버튼 클릭됨");
      if (window.openConceptModal) {
        console.log("✅ openConceptModal 함수 호출");
        window.openConceptModal();
      } else {
        console.error("❌ openConceptModal 함수가 정의되지 않았습니다.");
      }
    });
    console.log("✅ 새 개념 추가 버튼 이벤트 리스너 등록 완료");
  } else {
    console.error("❌ add-concept 버튼 요소를 찾을 수 없습니다");
  }

  // 대량 개념 추가 버튼 이벤트
  if (elements.bulkAddButton) {
    console.log("📦 대량 개념 추가 버튼 이벤트 리스너 등록 중...");
    elements.bulkAddButton.addEventListener("click", () => {
      console.log("🖱️ 대량 개념 추가 버튼 클릭됨");
      if (window.openBulkImportModal) {
        console.log("✅ openBulkImportModal 함수 호출");
        window.openBulkImportModal();
      } else {
        console.error("❌ openBulkImportModal 함수가 정의되지 않았습니다.");
      }
    });
    console.log("✅ 대량 개념 추가 버튼 이벤트 리스너 등록 완료");
  } else {
    console.error("❌ bulk-add-concept 버튼 요소를 찾을 수 없습니다");
  }

  // 개념 저장 이벤트 리스너 (모달에서 호출)
  window.addEventListener("concept-saved", () => {
    console.log("💾 개념 저장 이벤트 수신");
    fetchAndDisplayConcepts();
    updateUsageUI();
  });

  // 개념 삭제 이벤트 리스너
  window.addEventListener("concept-deleted", () => {
    console.log("🗑️ 개념 삭제 이벤트 수신");
    fetchAndDisplayConcepts();
    updateUsageUI();
  });

  // 대량 개념 추가 이벤트 리스너
  window.addEventListener("concepts-bulk-saved", () => {
    console.log("📦 대량 개념 저장 이벤트 수신");
    fetchAndDisplayConcepts();
    updateUsageUI();
  });

  console.log("✅ setupEventListeners 함수 완료");
}

// 오류 표시 함수
function showError(message, details = "") {
  console.error("오류:", message, details);
  alert(
    `${getTranslatedText("error_title")} ${message} ${
      details ? `\n${getTranslatedText("error_details")} ${details}` : ""
    }`
  );
}
