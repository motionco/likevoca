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
  setDoc,
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
// 필터 공유 모듈 import
import {
  VocabularyFilterManager,
  VocabularyFilterProcessor,
  setupVocabularyFilters,
} from "../../utils/vocabulary-filter-shared.js";
// 공통 번역 유틸리티 import
import {
  translateDomain,
  translateCategory,
  translateDomainCategory,
} from "../../utils/translation-utils.js";

let currentUser = null;
let allConcepts = [];
let filteredConcepts = [];

// 전역에서 접근 가능하도록 설정
window.allConcepts = allConcepts;
let displayCount = 12;
let lastVisibleConcept = null;
let firstVisibleConcept = null;
let userLanguage = "ko";

// 다국어 번역 텍스트
const pageTranslations = {
  ko: {
    no_concepts: "개념이 없습니다.",
    loading: "로딩 중...",
    error: "오류가 발생했습니다.",
    add_concept: "개념 추가",
    bulk_import: "일괄 가져오기",
    search_placeholder: "검색어를 입력하세요...",
    view_details: "자세히 보기",
    edit: "편집",
    delete: "삭제",
    error_title: "오류 발생!",
    error_message: "페이지를 로드하는 중 문제가 발생했습니다.",
    error_details: "세부 정보:",
    login_required: "로그인이 필요합니다.",
  },
  en: {
    no_concepts: "No concepts found.",
    loading: "Loading...",
    error: "An error occurred.",
    add_concept: "Add Concept",
    bulk_import: "Bulk Import",
    search_placeholder: "Enter search term...",
    view_details: "View Details",
    edit: "Edit",
    delete: "Delete",
    error_title: "Error Occurred!",
    error_message: "There was a problem loading the page.",
    error_details: "Details:",
    login_required: "Login required.",
  },
  ja: {
    no_concepts: "コンセプトが見つかりません。",
    loading: "読み込み中...",
    error: "エラーが発生しました。",
    add_concept: "コンセプト追加",
    bulk_import: "一括インポート",
    search_placeholder: "検索語を入力してください...",
    view_details: "詳細を見る",
    edit: "編集",
    delete: "削除",
    error_title: "エラーが発生しました！",
    error_message: "ページの読み込み中に問題が発生しました。",
    error_details: "詳細:",
    login_required: "ログインが必要です。",
  },
  zh: {
    no_concepts: "未找到概念。",
    loading: "加载中...",
    error: "发生错误。",
    add_concept: "添加概念",
    bulk_import: "批量导入",
    search_placeholder: "请输入搜索词...",
    view_details: "查看详情",
    edit: "编辑",
    delete: "删除",
    error_title: "发生错误!",
    error_message: "加载页面时出现问题。",
    error_details: "详细信息:",
    login_required: "需要登录。",
  },
};

// 문법 번역 매핑
const grammarTranslations = {
  ko: {
    noun: "명사",
    verb: "동사",
    adjective: "형용사",
    adverb: "부사",
    preposition: "전치사",
    conjunction: "접속사",
    pronoun: "대명사",
    interjection: "감탄사",
    article: "관사",
    determiner: "한정사",
  },
  en: {
    명사: "noun",
    동사: "verb",
    형용사: "adjective",
    부사: "adverb",
    전치사: "preposition",
    접속사: "conjunction",
    대명사: "pronoun",
    감탄사: "interjection",
    관사: "article",
    한정사: "determiner",
  },
  ja: {
    noun: "名詞",
    verb: "動詞",
    adjective: "形容詞",
    adverb: "副詞",
    preposition: "前置詞",
    conjunction: "接続詞",
    pronoun: "代名詞",
    interjection: "感嘆詞",
    article: "冠詞",
    determiner: "限定詞",
  },
  zh: {
    noun: "名词",
    verb: "动词",
    adjective: "形容词",
    adverb: "副词",
    preposition: "介词",
    conjunction: "连词",
    pronoun: "代词",
    interjection: "感叹词",
    article: "冠词",
    determiner: "限定词",
  },
};

// 다국어 번역 텍스트 가져오기 함수 (공통 모듈 사용)
function getTranslatedText(key) {
  // 1. 페이지 번역에서 먼저 확인
  if (pageTranslations[userLanguage] && pageTranslations[userLanguage][key]) {
    return pageTranslations[userLanguage][key];
  }

  // 2. 도메인 번역에서 확인 (공통 모듈 사용)
  const domainTranslation = translateDomain(key, userLanguage);
  if (domainTranslation !== key) {
    return domainTranslation;
  }

  // 3. 카테고리 번역에서 확인 (공통 모듈 사용)
  const categoryTranslation = translateCategory(key, userLanguage);
  if (categoryTranslation !== key) {
    return categoryTranslation;
  }

  // 4. 영어 폴백
  if (pageTranslations.en && pageTranslations.en[key]) {
    return pageTranslations.en[key];
  }

  const domainTranslationEn = translateDomain(key, "en");
  if (domainTranslationEn !== key) {
    return domainTranslationEn;
  }

  const categoryTranslationEn = translateCategory(key, "en");
  if (categoryTranslationEn !== key) {
    return categoryTranslationEn;
  }

  // 5. 원본 키 반환
  return key;
}

// 도메인 번역 함수 (공통 모듈 사용)
function translateDomainKey(domainKey, lang = null) {
  return translateDomain(domainKey, lang);
}

// 카테고리 번역 함수 (공통 모듈 사용)
function translateCategoryKey(categoryKey, lang = null) {
  return translateCategory(categoryKey, lang);
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

// 개념 카드 생성 함수 (공통 번역 모듈 사용)
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

  // 도메인과 카테고리 번역 (공통 모듈 사용)
  const domain = conceptInfo.domain || concept.domain || "other";
  const category = conceptInfo.category || concept.category || "other";
  const domainCategoryText = translateDomainCategory(
    domain,
    category,
    userLanguage
  );

  // 예문 가져오기 (concepts 컬렉션의 대표 예문 사용)
  let example = null;

  // 1. representative_example 확인 (새 구조와 기존 구조 모두 지원)
  if (concept.representative_example) {
    const repExample = concept.representative_example;

    // 새로운 구조: 직접 언어별 텍스트
    if (repExample[sourceLanguage] && repExample[targetLanguage]) {
      example = {
        source: repExample[sourceLanguage],
        target: repExample[targetLanguage],
      };
    }
    // 기존 구조: translations 객체
    else if (repExample.translations) {
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
    }
  }

  // 2. examples 배열에서 첫 번째 예문 사용 (fallback)
  if (!example && concept.examples && concept.examples.length > 0) {
    const firstExample = concept.examples[0];
    if (firstExample.translations) {
      example = {
        source:
          firstExample.translations[sourceLanguage]?.text ||
          firstExample.translations[sourceLanguage] ||
          "",
        target:
          firstExample.translations[targetLanguage]?.text ||
          firstExample.translations[targetLanguage] ||
          "",
      };
    }
  }

  // 날짜 포맷팅
  let formattedDate = "";
  try {
    const dateValue = concept.created_at || concept.createdAt;
    if (dateValue) {
      let date;
      if (dateValue.toDate && typeof dateValue.toDate === "function") {
        date = dateValue.toDate();
      } else if (dateValue.seconds) {
        date = new Date(dateValue.seconds * 1000);
      } else {
        date = new Date(dateValue);
      }

      if (!isNaN(date.getTime())) {
        formattedDate = date.toLocaleDateString("ko-KR", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        });
      }
    }
  } catch (error) {
    console.error("날짜 포맷팅 오류:", error);
    formattedDate = "";
  }

  // 카드 HTML 생성
  const card = document.createElement("div");
  card.className =
    "bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-transform duration-300 border border-gray-200 cursor-pointer word-card";

  card.innerHTML = `
    <div class="flex items-start justify-between mb-4" style="border-left: 4px solid ${colorTheme}">
      <div class="flex items-center space-x-3 pl-3">
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
        ${domainCategoryText}
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
      example && (example.source || example.target)
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
        <i class="fas fa-book mr-1 text-green-500"></i> ${getTranslatedText(
          "view_details"
        )}
      </span>
      <span class="flex items-center">
        <i class="fas fa-clock mr-1"></i> ${formattedDate}
      </span>
    </div>
  `;

  // 클릭 이벤트 추가
  card.addEventListener("click", () => {
    showConceptModal(concept, sourceLanguage, targetLanguage);
  });

  return card;
}

// 나머지 함수들은 원본 vocabulary.js에서 가져와야 합니다...
// (이 부분은 실제로는 원본 파일의 나머지 모든 함수들이 포함되어야 합니다)

console.log("Vocabulary page with common translation module loaded");
