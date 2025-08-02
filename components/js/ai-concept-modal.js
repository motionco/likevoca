import {
  auth,
  db,
  supportedLanguages,
  conceptUtils,
} from "../../js/firebase/firebase-init.js";
import { getActiveLanguage } from "../../utils/language-utils.js";
import {
  formatGrammarTags,
  getPOSList,
  getGrammarFeatures,
} from "../../js/grammar/grammar-tags-system.js";
import {
  deleteDoc,
  doc,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";
import {
  getTranslatedDomainCategory,
  getTranslatedPartOfSpeech,
  getTranslatedLevel,
  getTranslatedLanguageName,
} from "./concept-modal-shared.js";

// 전역 변수
let currentConcept = null;
let userLanguage = "ko"; // 기본값

// 다국어 번역 텍스트
const pageTranslations = {
  ko: {
    concept_detail_view: "개념 상세 보기",
    meaning: "의미",
    part_of_speech: "품사",
    level: "수준",
    examples: "예문",
    last_updated: "마지막 업데이트",
    edit: "편집",
    delete: "삭제",
    close: "닫기",
    no_examples: "예문이 없습니다.",
    category: "카테고리",
    domain: "도메인",
    grammar: "문법",
    grammar_info: "문법 정보",
    synonyms: "동의어",
    antonyms: "반의어",
    collocations: "연어",
    compound_words: "합성어",
    word_family: "어족",
    representative_example: "대표 예문",
    additional_examples: "추가 예문",
    related_words: "관련 단어",
    // 수준 번역
    beginner: "초급",
    intermediate: "중급",
    advanced: "고급",
    basic: "기초",
  },
  en: {
    concept_detail_view: "Concept Detail View",
    meaning: "Meaning",
    part_of_speech: "Part of Speech",
    level: "Level",
    examples: "Examples",
    last_updated: "Last Updated",
    edit: "Edit",
    delete: "Delete",
    close: "Close",
    no_examples: "No examples available.",
    category: "Category",
    domain: "Domain",
    grammar: "Grammar",
    grammar_info: "Grammar Info",
    synonyms: "Synonyms",
    antonyms: "Antonyms",
    collocations: "Collocations",
    compound_words: "Compound Words",
    word_family: "Word Family",
    representative_example: "Representative Example",
    additional_examples: "Additional Examples",
    related_words: "Related Words",
    // 수준 번역
    beginner: "Beginner",
    intermediate: "Intermediate",
    advanced: "Advanced",
    basic: "Basic",
  },
  ja: {
    concept_detail_view: "概念詳細表示",
    meaning: "意味",
    part_of_speech: "品詞",
    level: "レベル",
    examples: "例文",
    last_updated: "最終更新",
    edit: "編集",
    delete: "削除",
    close: "閉じる",
    no_examples: "例文がありません。",
    category: "カテゴリ",
    domain: "ドメイン",
    grammar: "文法",
    grammar_info: "文法情報",
    synonyms: "類義語",
    antonyms: "反義語",
    collocations: "連語",
    compound_words: "複合語",
    word_family: "語族",
    representative_example: "代表例文",
    additional_examples: "追加例文",
    related_words: "関連語",
    // 수준 번역
    beginner: "初級",
    intermediate: "中級",
    advanced: "上級",
    basic: "基礎",
  },
  zh: {
    concept_detail_view: "概念详细视图",
    meaning: "意思",
    part_of_speech: "词性",
    level: "级别",
    examples: "例句",
    last_updated: "最后更新",
    edit: "编辑",
    delete: "删除",
    close: "关闭",
    no_examples: "没有例句。",
    category: "类别",
    domain: "领域",
    grammar: "语法",
    grammar_info: "语法信息",
    synonyms: "同义词",
    antonyms: "反义词",
    collocations: "搭配",
    compound_words: "复合词",
    word_family: "词族",
    representative_example: "代表例句",
    additional_examples: "补充例句",
    related_words: "相关词汇",
    // 수준 번역
    beginner: "初级",
    intermediate: "中级",
    advanced: "高级",
    basic: "基础",
  },
};

// 다국어 번역 텍스트 가져오기 함수
function getTranslatedText(key) {
  // 최신 환경 언어 가져오기
  const currentLang =
    localStorage.getItem("preferredLanguage") || userLanguage || "ko";

  // 전역 번역 시스템 사용 (language-utils.js에서 로드)
  if (
    window.translations &&
    window.translations[currentLang] &&
    window.translations[currentLang][key]
  ) {
    return window.translations[currentLang][key];
  }

  // 로컬 번역 시스템 fallback
  return pageTranslations[currentLang][key] || pageTranslations.en[key] || key;
}

// 웹사이트 언어를 DB 언어 코드로 변환하는 함수
function getUserLanguageCode() {
  const languageCodeMap = {
    ko: "korean",
    en: "english",
    ja: "japanese",
    zh: "chinese",
    es: "spanish",
  };
  return languageCodeMap[userLanguage] || "korean";
}

// 사용자 언어 초기화
async function initializeUserLanguage() {
  try {
    // getActiveLanguage가 정의되어 있는지 확인
    if (typeof getActiveLanguage === "function") {
      userLanguage = await getActiveLanguage();
    } else {
      console.warn(
        "getActiveLanguage 함수를 찾을 수 없습니다. 기본값을 사용합니다."
      );
      userLanguage = "ko";
    }
  } catch (error) {
    console.error("언어 설정 로드 실패:", error);
    userLanguage = "ko"; // 기본값
  }
}

// 발음 효과 스타일 추가
function addSpeakingStyles() {
  if (!document.getElementById("speaking-effect-style")) {
    const styleElement = document.createElement("style");
    styleElement.id = "speaking-effect-style";
    styleElement.textContent = `
      @keyframes speakingPulse {
        0% { color: #1a56db; transform: scale(1); }
        50% { color: #3182ce; transform: scale(1.05); }
        100% { color: #1a56db; transform: scale(1); }
      }
      .speaking-effect {
        animation: speakingPulse 1s infinite ease-in-out;
        color: #1a56db;
        font-weight: bold;
      }
    `;
    document.head.appendChild(styleElement);
  }
}

// 모든 상태 초기화 함수
function resetAllState() {
  // currentConcept는 초기화하지 않음 (모달이 열려있는 동안 유지되어야 함)
}

// 모달 이벤트 리스너 설정
function setupModalEventListeners() {
  addSpeakingStyles();

  const modal = document.getElementById("concept-view-modal");
  const closeBtn = document.getElementById("close-concept-view-modal");
  const editBtn = document.getElementById("edit-concept-button");
  const deleteBtn = document.getElementById("delete-concept-button");

  if (closeBtn) {
    closeBtn.addEventListener("click", closeModal);
  }

  if (editBtn) {
    editBtn.addEventListener("click", editConcept);
  }

  if (deleteBtn) {
    deleteBtn.addEventListener("click", deleteConcept);
  }

  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal && !modal.classList.contains("hidden")) {
      closeModal();
    }
  });
}

// 개념 모달 표시
export async function showConceptModal(
  concept,
  sourceLanguage = null,
  targetLanguage = null
) {
  // 사용자 언어 설정 업데이트 (실패해도 계속 진행)
  try {
    await initializeUserLanguage();
  } catch (error) {
    console.error("모달 언어 초기화 실패, 기본값 사용:", error);
    userLanguage = "ko";
  }

  // 언어 설정을 전역 변수로 저장
  window.currentSourceLanguage = sourceLanguage;
  window.currentTargetLanguage = targetLanguage;

  if (!concept) {
    console.error("개념 데이터가 없습니다.");
    return;
  }

  // currentConcept를 먼저 설정
  currentConcept = concept;

  const modal = document.getElementById("concept-view-modal");
  if (!modal) {
    console.error("모달 요소를 찾을 수 없습니다.");
    return;
  }

  // 언어 탭 순서 재정렬: 원본언어, 대상언어, 나머지 언어 순
  const availableLanguages = Object.keys(concept.expressions || {});

  if (availableLanguages.length === 0) {
    console.error("사용 가능한 언어 표현이 없습니다.");
    return;
  }

  // 언어 탭 순서 재정렬: 대상언어, 원본언어, 나머지 언어 순
  const orderedLanguages = [];

  // 1. 대상언어 먼저 추가
  if (targetLanguage && availableLanguages.includes(targetLanguage)) {
    orderedLanguages.push(targetLanguage);
  }

  // 2. 원본언어 추가 (대상언어와 다른 경우)
  if (
    sourceLanguage &&
    availableLanguages.includes(sourceLanguage) &&
    sourceLanguage !== targetLanguage
  ) {
    orderedLanguages.push(sourceLanguage);
  }

  // 3. 나머지 언어들 추가
  availableLanguages.forEach((lang) => {
    if (!orderedLanguages.includes(lang)) {
      orderedLanguages.push(lang);
    }
  });

  // 기본 개념 정보 설정 - 대상언어로 고정
  const primaryLang =
    targetLanguage && availableLanguages.includes(targetLanguage)
      ? targetLanguage
      : orderedLanguages[0];
  const primaryExpr = concept.expressions[primaryLang];

  // 이모지 설정 개선 (안전한 접근)
  const emoji =
    concept.concept_info?.emoji ||
    concept.unicode_emoji ||
    concept.concept_info?.unicode_emoji ||
    "📝";

  const emojiElement = document.getElementById("concept-view-emoji");
  if (emojiElement) {
    emojiElement.textContent = emoji;
  } else {
    console.warn("concept-view-emoji 요소를 찾을 수 없습니다.");
  }
  console.log("이모지 설정:", emoji, "원본 데이터:", concept.concept_info);

  // 헤더를 대상언어로 고정
  const primaryWordElement = document.getElementById("concept-view-title");
  if (primaryWordElement) {
    primaryWordElement.textContent = primaryExpr?.word || "N/A";
  } else {
    console.warn("concept-view-title 요소를 찾을 수 없습니다.");
  }

  const primaryPronElement = document.getElementById(
    "concept-view-pronunciation"
  );
  if (primaryPronElement) {
    primaryPronElement.textContent = primaryExpr?.pronunciation || "";
  } else {
    console.warn("concept-view-pronunciation 요소를 찾을 수 없습니다.");
  }

  // 카테고리와 도메인을 하나로 합쳐서 표시
  const categoryDomainElement = document.getElementById(
    "concept-view-domain-category"
  );
  if (categoryDomainElement) {
    const categoryKey =
      concept.concept_info?.category || concept.category || "general";
    const domainKey =
      concept.concept_info?.domain || concept.domain || "general";

    console.log("🏷️ AI 단어장 - 도메인/카테고리 정보:", {
      domainKey,
      categoryKey,
      concept,
    });

    // 공통 번역 시스템 사용
    const currentLang =
      localStorage.getItem("preferredLanguage") || userLanguage || "ko";
    const translatedDomainCategory = getTranslatedDomainCategory(
      domainKey,
      categoryKey,
      currentLang
    );

    console.log(
      "🌐 AI 단어장 - 번역된 도메인/카테고리:",
      translatedDomainCategory
    );

    // 도메인/카테고리 형태로 결합
    categoryDomainElement.textContent = translatedDomainCategory;
  } else {
    console.warn("❌ concept-view-domain-category 요소를 찾을 수 없습니다");
  }

  // 업데이트 날짜 설정
  const updatedAt =
    concept.updatedAt || concept.createdAt || concept.created_at;
  if (updatedAt) {
    // 날짜 포맷팅 개선 (ai-vocabulary.js와 동일한 로직 사용)
    let formattedDate = "";
    try {
      let date;
      if (updatedAt.toDate && typeof updatedAt.toDate === "function") {
        // Firestore Timestamp 객체인 경우
        date = updatedAt.toDate();
      } else if (updatedAt.seconds) {
        // Firestore Timestamp 형태의 객체인 경우
        date = new Date(updatedAt.seconds * 1000);
      } else {
        // 일반 Date 객체나 문자열인 경우
        date = new Date(updatedAt);
      }

      if (!isNaN(date.getTime())) {
        formattedDate = date.toLocaleDateString("ko-KR", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        });
      }
    } catch (error) {
      console.error("날짜 포맷팅 오류:", error);
      formattedDate = "";
    }

    const updatedAtElement = document.getElementById("concept-updated-at");
    if (updatedAtElement) {
      updatedAtElement.textContent = formattedDate || "날짜 정보 없음";
    }
  }

  // 탭 생성
  const tabsContainer = document.getElementById("language-tabs");
  const contentContainer = document.getElementById("language-content");

  if (tabsContainer && contentContainer) {
    // 탭 버튼들 생성 (재정렬된 순서 사용)
    const tabsHTML = orderedLanguages
      .map((lang, index) => {
        return `
      <button 
        class="py-2 px-4 ${
          index === 0
            ? "text-blue-600 border-b-2 border-blue-600 font-medium"
            : "text-gray-500 hover:text-gray-700"
        }"
        onclick="showLanguageTab('${lang}', this)"
      >
        ${getLanguageName(lang)}
      </button>
    `;
      })
      .join("");

    tabsContainer.innerHTML = tabsHTML;

    // 첫 번째 언어 내용 표시 (재정렬된 순서의 첫 번째)
    showLanguageContent(orderedLanguages[0], concept);

    // 예문 표시 (초기 로드 시)
    displayExamples(
      concept,
      orderedLanguages[0],
      sourceLanguage,
      targetLanguage
    );
  }

  // 모달 표시
  modal.classList.remove("hidden");

  // 모달 이벤트 리스너 설정
  setupModalEventListeners();

  console.log("✅ AI 개념 모달 표시 완료");
}

// 언어 이름 가져오기 (환경설정 언어에 맞게)
function getLanguageName(langCode) {
  const languageNames = {
    ko: {
      korean: "한국어",
      english: "영어",
      japanese: "일본어",
      chinese: "중국어",
      spanish: "스페인어",
    },
    en: {
      korean: "Korean",
      english: "English",
      japanese: "Japanese",
      chinese: "Chinese",
      spanish: "Spanish",
    },
    ja: {
      korean: "韓国語",
      english: "英語",
      japanese: "日本語",
      chinese: "中国語",
      spanish: "スペイン語",
    },
    zh: {
      korean: "韩语",
      english: "英语",
      japanese: "日语",
      chinese: "中文",
      spanish: "西班牙语",
    },
    es: {
      korean: "Coreano",
      english: "Inglés",
      japanese: "Japonés",
      chinese: "Chino",
      spanish: "Español",
    },
  };

  return (
    languageNames[userLanguage]?.[langCode] ||
    languageNames.en[langCode] ||
    langCode
  );
}

// 언어별 내용 표시
function showLanguageContent(lang, concept) {
  const expression = concept.expressions[lang];
  const targetExpression = concept.expressions[window.currentTargetLanguage];

  if (!expression) {
    console.error(`No expression found for language: ${lang}`);
    return;
  }

  const contentContainer = document.getElementById("language-content");
  if (!contentContainer) {
    console.error("Language content container not found");
    return;
  }

  let contentHtml = '<div class="space-y-4">';

  // 언어 코드를 DB 언어 코드로 변환하는 함수
  function getLanguageCode(langCode) {
    const languageCodeMap = {
      ko: "korean",
      en: "english",
      ja: "japanese",
      zh: "chinese",
      es: "spanish",
    };
    return languageCodeMap[langCode] || "korean";
  }

  // 기본 정보 - 품사 옆 단어값은 환경 언어로 고정
  const envLanguage =
    localStorage.getItem("preferredLanguage") || userLanguage || "ko";
  const envLanguageCode = getLanguageCode(envLanguage);
  const displayWord = concept.expressions[envLanguageCode]?.word || "N/A";

  contentHtml += `
    <div class="bg-gray-50 p-4 rounded-lg">
      <div class="flex items-center gap-2 mb-3">
        <div class="text-xl font-bold text-gray-900">${displayWord}</div>
        ${
          expression.part_of_speech
            ? `<span class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">${getLocalizedPartOfSpeech(
                expression.part_of_speech
              )}</span>`
            : ""
        }
      </div>
      ${
        expression && expression.definition
          ? `<div class="text-sm font-medium text-blue-800 mb-2">${
              getTranslatedText("definition") || "정의"
            }</div>
            <div class="text-gray-700">${expression.definition}</div>`
          : ""
      }
    </div>
  `;

  // 1. 문법 태그 표시
  if (expression.grammar_tags && expression.grammar_tags.length > 0) {
    const pos = expression.grammar_tags.find((tag) => !tag.includes(":"));
    const features = expression.grammar_tags.filter((tag) => tag.includes(":"));
    const formatted = formatGrammarTags(lang, pos, features);

    contentHtml += `
      <div class="bg-blue-50 p-3 rounded-lg">
        <div class="text-sm font-medium text-blue-700 mb-2">${
          getTranslatedText("grammar") || "문법"
        }</div>
        <div>${formatted}</div>
      </div>
    `;
  }

  // 2. 관련 단어들을 하나의 박스로 통합 표시
  const relatedWordsData = [];

  // 각 관련 단어 유형별로 수집
  if (expression.synonyms && expression.synonyms.length > 0) {
    relatedWordsData.push({
      type: "synonyms",
      label: getTranslatedText("synonyms") || "유의어",
      words: expression.synonyms,
      color: "green",
    });
  }

  if (expression.antonyms && expression.antonyms.length > 0) {
    relatedWordsData.push({
      type: "antonyms",
      label: getTranslatedText("antonyms") || "반의어",
      words: expression.antonyms,
      color: "red",
    });
  }

  if (expression.collocations && expression.collocations.length > 0) {
    relatedWordsData.push({
      type: "collocations",
      label: getTranslatedText("collocations") || "연어",
      words: expression.collocations,
      color: "blue",
    });
  }

  if (expression.compound_words && expression.compound_words.length > 0) {
    relatedWordsData.push({
      type: "compound_words",
      label: getTranslatedText("compound_words") || "복합어",
      words: expression.compound_words,
      color: "purple",
    });
  }

  if (expression.word_family && expression.word_family.length > 0) {
    relatedWordsData.push({
      type: "word_family",
      label: getTranslatedText("word_family") || "어족",
      words: expression.word_family,
      color: "yellow",
    });
  }

  // 관련 단어들이 있으면 하나의 박스로 표시
  if (relatedWordsData.length > 0) {
    let relatedSections = relatedWordsData
      .map(
        (item) => `
      <div class="mb-3">
        <div class="text-sm font-medium text-${item.color}-700 mb-2">${
          item.label
        }</div>
        <div class="flex flex-wrap gap-1">
          ${item.words
            .map(
              (word) =>
                `<span class="text-sm bg-${item.color}-100 text-${item.color}-800 px-2 py-1 rounded">${word}</span>`
            )
            .join(" ")}
        </div>
      </div>
    `
      )
      .join("");

    // related_words 번역 적용
    const currentLang =
      localStorage.getItem("preferredLanguage") || userLanguage || "ko";
    const relatedWordsLabel =
      getTranslatedText("related_words") ||
      (currentLang === "ko"
        ? "관련 단어"
        : currentLang === "en"
        ? "Related Words"
        : currentLang === "ja"
        ? "関連語"
        : currentLang === "zh"
        ? "相关词汇"
        : "관련 단어");

    contentHtml += `
      <div class="bg-gray-50 p-4 rounded-lg">
        <div class="text-sm font-medium text-gray-700 mb-3">${relatedWordsLabel}</div>
        ${relatedSections}
      </div>
    `;
  }

  contentHtml += "</div>";

  // 언어별 내용 업데이트
  contentContainer.innerHTML = contentHtml;

  // 예문 표시 (현재 언어로 업데이트)
  displayExamples(
    concept,
    lang,
    window.currentSourceLanguage,
    window.currentTargetLanguage
  );
}

// 수준을 해당 언어에 맞게 번역하는 함수
function getLocalizedLevel(level, targetLang) {
  const levelTranslations = {
    korean: {
      beginner: "초급",
      intermediate: "중급",
      advanced: "고급",
      basic: "기초",
    },
    english: {
      beginner: "Beginner",
      intermediate: "Intermediate",
      advanced: "Advanced",
      basic: "Basic",
    },
    japanese: {
      beginner: "初級",
      intermediate: "中級",
      advanced: "上級",
      basic: "基礎",
    },
    chinese: {
      beginner: "初级",
      intermediate: "中级",
      advanced: "高级",
      basic: "基础",
    },
  };

  return levelTranslations[targetLang]?.[level] || level || "N/A";
}

// 품사를 사용자 언어로 번역하는 함수
function getLocalizedPartOfSpeech(pos) {
  if (!pos) return "N/A";

  // 1단계: 각 언어의 품사를 영어로 정규화
  const posNormalization = {
    // 일본어 품사 → 영어
    名詞: "noun",
    動詞: "verb",
    形容詞: "adjective",
    副詞: "adverb",
    代名詞: "pronoun",
    前置詞: "preposition",
    接続詞: "conjunction",
    感嘆詞: "interjection",
    限定詞: "determiner",
    助詞: "particle",

    // 중국어 품사 → 영어
    名词: "noun",
    动词: "verb",
    形容词: "adjective",
    副词: "adverb",
    代词: "pronoun",
    介词: "preposition",
    连词: "conjunction",
    感叹词: "interjection",
    限定词: "determiner",
    助词: "particle",

    // 한국어 품사 → 영어
    명사: "noun",
    동사: "verb",
    형용사: "adjective",
    부사: "adverb",
    대명사: "pronoun",
    전치사: "preposition",
    접속사: "conjunction",
    감탄사: "interjection",
    한정사: "determiner",
    조사: "particle",
  };

  // 정규화된 영어 품사 얻기
  const normalizedPos = posNormalization[pos] || pos.toLowerCase();

  // 2단계: 환경설정 언어로 번역
  const posTranslations = {
    korean: {
      noun: "명사",
      verb: "동사",
      adjective: "형용사",
      adverb: "부사",
      pronoun: "대명사",
      preposition: "전치사",
      conjunction: "접속사",
      interjection: "감탄사",
      determiner: "한정사",
      particle: "조사",
    },
    english: {
      noun: "Noun",
      verb: "Verb",
      adjective: "Adjective",
      adverb: "Adverb",
      pronoun: "Pronoun",
      preposition: "Preposition",
      conjunction: "Conjunction",
      interjection: "Interjection",
      determiner: "Determiner",
      particle: "Particle",
    },
    japanese: {
      noun: "名詞",
      verb: "動詞",
      adjective: "形容詞",
      adverb: "副詞",
      pronoun: "代名詞",
      preposition: "前置詞",
      conjunction: "接続詞",
      interjection: "感嘆詞",
      determiner: "限定詞",
      particle: "助詞",
    },
    chinese: {
      noun: "名词",
      verb: "动词",
      adjective: "形容词",
      adverb: "副词",
      pronoun: "代词",
      preposition: "介词",
      conjunction: "连词",
      interjection: "感叹词",
      determiner: "限定词",
      particle: "助词",
    },
  };

  // 환경설정 언어 확인 (기본값은 한국어)
  let userLangCode = "korean";
  try {
    if (typeof getUserLanguageCode === "function") {
      userLangCode = getUserLanguageCode();
    } else if (typeof userLanguage !== "undefined" && userLanguage) {
      const languageCodeMap = {
        ko: "korean",
        en: "english",
        ja: "japanese",
        zh: "chinese",
      };
      userLangCode = languageCodeMap[userLanguage] || "korean";
    }
  } catch (error) {
    console.warn("환경설정 언어 확인 실패, 기본값 사용:", error);
    userLangCode = "korean";
  }

  const result =
    posTranslations[userLangCode]?.[normalizedPos] ||
    posTranslations.korean[normalizedPos] ||
    pos;
  console.log(
    "품사 번역 - 원본:",
    pos,
    "정규화:",
    normalizedPos,
    "사용자 언어:",
    userLangCode,
    "결과:",
    result
  );
  return result;
}

// 모달 헤더 업데이트 함수 (언어 탭 변경시 상단 정보 업데이트)
function updateModalHeader(lang, concept) {
  // AI 단어장에서는 헤더(제목, 발음)를 각 언어탭과 동일하게 변경
  console.log(`모달 헤더 업데이트 - 현재 탭: ${lang}`);

  const expression = concept.expressions[lang];
  if (expression) {
    // 제목 업데이트
    const titleElement = document.getElementById("concept-view-title");
    if (titleElement) {
      titleElement.textContent = expression.word || "N/A";
    }

    // 발음 업데이트
    const pronunciationElement = document.getElementById(
      "concept-view-pronunciation"
    );
    if (pronunciationElement) {
      pronunciationElement.textContent = expression.pronunciation || "";
    }
  }

  // 도메인/카테고리 표시 (공통 번역 시스템 사용)
  const domainElement = document.getElementById("concept-view-domain-category");
  if (domainElement && (concept.concept_info || concept.domain)) {
    const categoryKey =
      concept.concept_info?.category || concept.category || "general";
    const domainKey =
      concept.concept_info?.domain || concept.domain || "general";

    const currentLang =
      localStorage.getItem("preferredLanguage") || userLanguage || "ko";
    const translatedDomainCategory = getTranslatedDomainCategory(
      domainKey,
      categoryKey,
      currentLang
    );
    domainElement.textContent = translatedDomainCategory;
  }
}

// 기본 정보 업데이트 함수 수정 (품사는 사용자 언어로 고정)
function updateBasicInfo(lang, concept) {
  const expression = concept.expressions[lang];
  if (!expression) return;

  // 상단 기본 정보 업데이트
  const emojiElement = document.getElementById("concept-view-emoji");
  const wordElement = document.getElementById("concept-primary-word");
  const pronunciationElement = document.getElementById(
    "concept-primary-pronunciation"
  );
  const categoryDomainElement = document.getElementById(
    "concept-category-domain"
  );

  if (emojiElement) {
    // 이모지 수정: concept_info 또는 unicode_emoji에서 가져오기
    const emoji =
      concept.concept_info?.emoji ||
      concept.unicode_emoji ||
      concept.concept_info?.unicode_emoji ||
      "📝";
    emojiElement.textContent = emoji;
  }

  if (wordElement) {
    wordElement.textContent = expression.word || "N/A";
  }

  if (pronunciationElement) {
    pronunciationElement.textContent = expression.pronunciation || "";
  }

  // 카테고리와 도메인을 하나로 합쳐서 표시
  if (categoryDomainElement) {
    const categoryKey =
      concept.concept_info?.category || concept.category || "general";
    const domainKey =
      concept.concept_info?.domain || concept.domain || "general";

    // 공통 번역 시스템 사용
    const currentLang =
      localStorage.getItem("preferredLanguage") || userLanguage || "ko";
    const translatedDomainCategory = getTranslatedDomainCategory(
      domainKey,
      categoryKey,
      currentLang
    );

    // 도메인/카테고리 형태로 결합
    categoryDomainElement.textContent = translatedDomainCategory;
  }
}

// 언어 탭 전환 함수 (전역으로 노출)
function showLanguageTab(lang, button) {
  // 모든 탭 버튼 비활성화
  const tabButtons = document.querySelectorAll("#language-tabs button");
  tabButtons.forEach((btn) => {
    btn.classList.remove(
      "text-blue-600",
      "border-b-2",
      "border-blue-600",
      "font-medium"
    );
    btn.classList.add("text-gray-500", "hover:text-gray-700");
  });

  // 클릭된 버튼 활성화
  if (button) {
    button.classList.remove("text-gray-500", "hover:text-gray-700");
    button.classList.add(
      "text-blue-600",
      "border-b-2",
      "border-blue-600",
      "font-medium"
    );
  }

  // 언어 내용 표시
  if (currentConcept) {
    // 헤더(제목, 발음) 업데이트
    updateModalHeader(lang, currentConcept);
    showLanguageContent(lang, currentConcept);
    // 예문도 해당 언어로 업데이트
    displayExamples(
      currentConcept,
      lang,
      window.currentSourceLanguage,
      window.currentTargetLanguage
    );
  }
}

// 전역 함수로 노출
window.showLanguageTab = showLanguageTab;

function closeModal() {
  const modal = document.getElementById("concept-view-modal");
  if (modal) {
    modal.classList.add("hidden");
  }

  // 모달이 닫힐 때만 currentConcept 초기화
  currentConcept = null;
  console.log("모달 닫힘, currentConcept 초기화됨");
}

async function deleteConcept() {
  if (!currentConcept || !auth.currentUser) {
    console.error("삭제할 개념이나 사용자 정보가 없습니다.");
    return;
  }

  const primaryLang = Object.keys(currentConcept.expressions)[0];
  const word = currentConcept.expressions[primaryLang]?.word || "이 개념";

  if (
    !confirm(
      getTranslatedText("confirm_delete_concept") ||
        `"${word}"을(를) 정말 삭제하시겠습니까?`
    )
  ) {
    return;
  }

  try {
    console.log("삭제할 개념:", currentConcept);

    // AI 개념인지 일반 개념인지 판단
    const isAIConcept =
      currentConcept.isAIGenerated ||
      currentConcept._id?.startsWith("ai_") ||
      window.location.pathname.includes("ai-vocabulary");

    if (isAIConcept) {
      console.log("AI 개념 삭제 시도...");
      // AI 개념 삭제
      const success = await conceptUtils.deleteAIConcept(
        auth.currentUser.email,
        currentConcept._id || currentConcept.id
      );

      if (success) {
        console.log("AI 개념 삭제 성공");
        alert(
          getTranslatedText("concept_deleted_success") ||
            "개념이 성공적으로 삭제되었습니다."
        );
      } else {
        throw new Error(
          getTranslatedText("concept_delete_error") ||
            "AI 개념 삭제에 실패했습니다."
        );
      }
    } else {
      console.log("일반 개념 삭제 시도...");
      // 일반 개념 삭제
      await conceptUtils.deleteConcept(currentConcept.id || currentConcept._id);
      console.log("일반 개념 삭제 성공");
      alert(
        getTranslatedText("concept_deleted_success") ||
          "개념이 성공적으로 삭제되었습니다."
      );
    }

    closeModal();

    // 페이지 새로고침
    window.location.reload();
  } catch (error) {
    console.error("개념 삭제 중 오류:", error);
    alert(
      (getTranslatedText("concept_delete_error") ||
        "개념 삭제 중 오류가 발생했습니다") +
        ": " +
        error.message
    );
  }
}

function editConcept() {
  if (!currentConcept) {
    console.error("편집할 개념이 없습니다.");
    return;
  }

  const conceptId =
    currentConcept.concept_id || currentConcept.id || currentConcept._id;

  if (!conceptId) {
    console.error("개념 ID를 찾을 수 없습니다.");
    alert("편집할 개념의 ID를 찾을 수 없습니다.");
    return;
  }

  console.log("📝 개념 편집 모달 열기:", conceptId);

  // 현재 보기 모달 닫기
  closeModal();

  // 편집 모달 열기 (AI 단어장인지 확인하여 적절한 모달 사용)
  if (
    window.openAIEditConceptModal &&
    window.location.pathname.includes("ai-vocabulary")
  ) {
    window.openAIEditConceptModal(conceptId);
  } else if (window.openEditConceptModal) {
    window.openEditConceptModal(conceptId);
  } else {
    console.error(
      "❌ 편집 모달 함수를 찾을 수 없습니다. 해당 모달 스크립트가 로드되었는지 확인하세요."
    );
    alert(
      "편집 기능을 불러올 수 없습니다. 페이지를 새로고침 후 다시 시도해주세요."
    );
  }
}

// 언어 변경 이벤트 리스너 추가
document.addEventListener("languageChanged", async (event) => {
  try {
    await initializeUserLanguage();
  } catch (error) {
    console.error("모달 언어 변경 실패:", error);
    userLanguage = "ko";
  }

  // 현재 모달이 열려있다면 새로운 언어로 업데이트
  if (
    currentConcept &&
    !document.getElementById("concept-view-modal").classList.contains("hidden")
  ) {
    const currentTab = document.querySelector(
      "#language-tabs button.text-blue-600"
    );
    if (currentTab) {
      const lang = currentTab.getAttribute("onclick").match(/'([^']+)'/)[1];
      showLanguageContent(lang, currentConcept);
    }
  }
});

// 시간 표시 설정 함수 (다국어 단어장과 동일한 로직)
function setupConceptTimestamp(conceptData) {
  const timestampElement = document.getElementById("concept-timestamp");
  if (timestampElement && conceptData) {
    let timeText = getTranslatedText("registration_time") || "등록 시간";

    console.log("⏰ AI 개념 시간 설정 시도:", conceptData);

    // 여러 가능한 시간 필드 확인 (분리된 컬렉션 구조 우선)
    let dateValue = null;

    if (conceptData.metadata?.created_at) {
      dateValue = conceptData.metadata.created_at;
    } else if (conceptData.created_at) {
      dateValue = conceptData.created_at;
    } else if (conceptData.createdAt) {
      dateValue = conceptData.createdAt;
    } else if (conceptData.ai_metadata?.generation_timestamp) {
      dateValue = conceptData.ai_metadata.generation_timestamp;
    }

    if (dateValue) {
      try {
        let date;
        if (dateValue.toDate && typeof dateValue.toDate === "function") {
          // Firestore Timestamp
          date = dateValue.toDate();
        } else if (dateValue instanceof Date) {
          date = dateValue;
        } else if (dateValue.seconds) {
          // Firestore Timestamp 형태의 객체
          date = new Date(dateValue.seconds * 1000);
        } else if (
          typeof dateValue === "string" ||
          typeof dateValue === "number"
        ) {
          date = new Date(dateValue);
        }

        if (date && !isNaN(date.getTime())) {
          timeText = date.toLocaleDateString("ko-KR", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          });
          console.log("✅ AI 개념 시간 설정 성공:", timeText);
        }
      } catch (error) {
        console.error("❌ AI 개념 시간 파싱 오류:", error);
      }
    } else {
      console.log("⚠️ AI 개념 시간 정보 없음, 기본값 사용");
    }

    timestampElement.textContent = timeText;
  }
}

// 초기화
document.addEventListener("DOMContentLoaded", () => {
  setupModalEventListeners();
});

// 개선된 예문 표시 함수
function displayExamples(
  concept,
  currentLang,
  sourceLanguage = null,
  targetLanguage = null
) {
  const examplesContainer = document.getElementById("examples-container");

  if (!examplesContainer) {
    console.warn("examples-container를 찾을 수 없습니다.");
    return;
  }

  examplesContainer.innerHTML = "";

  let hasExamples = false;

  console.log("AI 모달 예문 표시 시작:", {
    currentLang,
    sourceLanguage,
    targetLanguage,
    representative_example: concept.representative_example,
  });

  // 1. 대표 예문 확인 (다국어 단어장 구조)
  if (concept.representative_example) {
    console.log("대표 예문 발견:", concept.representative_example);

    const exampleDiv = document.createElement("div");
    exampleDiv.className = "border p-4 rounded mb-4 bg-blue-50";
    exampleDiv.innerHTML = ``;

    let exampleContent = "";
    const languagesToShow = [];

    // 다국어 단어장 구조 (translations 객체)
    if (concept.representative_example.translations) {
      const translations = concept.representative_example.translations;

      // 첫 번째 줄: 각 언어탭의 언어 예문
      if (translations[currentLang]) {
        languagesToShow.push({
          code: currentLang,
          name: getLanguageName(currentLang),
          text: translations[currentLang],
          isFirst: true,
        });
      }

      // 두 번째 줄: 환경 언어 예문
      const envLanguageCode = getUserLanguageCode();
      if (translations[envLanguageCode] && envLanguageCode !== currentLang) {
        languagesToShow.push({
          code: envLanguageCode,
          name: getLanguageName(envLanguageCode),
          text: translations[envLanguageCode],
          isFirst: false,
        });
      }
    }
    // 기존 구조 (언어 직접 접근)
    else {
      // 첫 번째 줄: 각 언어탭의 언어 예문
      if (concept.representative_example[currentLang]) {
        languagesToShow.push({
          code: currentLang,
          name: getLanguageName(currentLang),
          text: concept.representative_example[currentLang],
          isFirst: true,
        });
      }

      // 두 번째 줄: 환경 언어 예문
      const envLanguageCode = getUserLanguageCode();
      if (
        concept.representative_example[envLanguageCode] &&
        envLanguageCode !== currentLang
      ) {
        languagesToShow.push({
          code: envLanguageCode,
          name: getLanguageName(envLanguageCode),
          text: concept.representative_example[envLanguageCode],
          isFirst: false,
        });
      }
    }

    console.log("AI 모달 예문 언어 매핑:", {
      currentLang,
      envLanguageCode: getUserLanguageCode(),
      languagesToShow,
      hasTranslations: !!concept.representative_example.translations,
    });

    languagesToShow.forEach((lang, index) => {
      if (lang.isFirst) {
        // 첫 번째(대상언어) - 강조 표시
        exampleContent += `
          <p class="text-sm text-gray-700 font-medium mb-2">${lang.text}</p>
        `;
      } else {
        // 두 번째(각 탭의 언어) - 이탤릭 표시
        exampleContent += `
          <p class="text-sm text-gray-500 italic">${lang.text}</p>
        `;
      }
    });

    exampleDiv.innerHTML += exampleContent;
    examplesContainer.appendChild(exampleDiv);
    hasExamples = true;
  }

  // 2. 추가 예문들은 보기 모달에서 표시하지 않음 (편집 모달에서만 표시)
  // AI 단어장과 다국어 단어장 모두 보기 모달에서는 대표 예문만 표시

  // 예문이 없는 경우
  if (!hasExamples) {
    examplesContainer.innerHTML = `<p class="text-gray-500 text-sm">${getTranslatedText(
      "no_examples"
    )}</p>`;
  }
}
