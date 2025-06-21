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

// 번역 함수들은 이제 translation-utils.js에서 import

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

// 개념 카드에서 도메인/카테고리 표시 함수 (공통 모듈 사용)
function displayDomainCategory(domain, category) {
  return translateDomainCategory(domain, category, userLanguage);
}

// 나머지 함수들은 기존과 동일하게 유지...
// (이 부분은 실제로는 기존 vocabulary.js의 나머지 모든 함수들이 포함되어야 합니다)

console.log("Vocabulary page with common translation module loaded");
