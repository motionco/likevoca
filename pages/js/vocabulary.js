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
import { showConceptViewModal } from "../../components/js/concept-view-modal.js";
import { getTranslatedDomainCategory } from "../../components/js/concept-modal-shared.js";
import {
  getActiveLanguage,
  updateMetadata,
} from "../../utils/language-utils.js";
// 필터 공유 모듈 import
import {
  VocabularyFilterBuilder,
  VocabularyFilterManager,
  VocabularyFilterProcessor,
  setupVocabularyFilters,
} from "../../utils/vocabulary-filter-shared.js";
// 언어 필터 초기화 유틸리티 import
import {
  getSystemLanguage,
  getInitialLanguageSettings,
  loadLanguageFilterSettings,
  saveLanguageFilterSettings,
  initializeLanguageFilterElements,
  updateLanguageFilterElements,
  updateLanguageFilterOnUIChange,
  initializeLanguageFilterSync,
} from "../../utils/language-utils.js";

// 전역 변수
let allConcepts = [];
let filteredConcepts = [];
let userLanguage = "ko"; // 기본값
let currentPage = 1;
let conceptsPerPage = 12;
let userBookmarks = [];
let currentUser = null; // 현재 로그인된 사용자
let displayCount = 12; // 표시할 개념 수
let lastVisibleConcept = null;
let firstVisibleConcept = null;

// 전역에서 접근 가능하도록 설정
window.allConcepts = allConcepts;

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

// 번역 텍스트 가져오기 함수
function getTranslatedText(key) {
  try {
    // 1. window.getI18nText 함수 사용 (우선순위)
    if (typeof window.getI18nText === "function") {
      const result = window.getI18nText(key);
      if (result !== key) {
        return result;
      }
    }

    // 2. window.translations 직접 사용
    const currentLang = userLanguage || "ko";
    if (
      window.translations &&
      window.translations[currentLang] &&
      window.translations[currentLang][key]
    ) {
      return window.translations[currentLang][key];
    }

    // 3. pageTranslations fallback 사용
    if (pageTranslations[currentLang] && pageTranslations[currentLang][key]) {
      return pageTranslations[currentLang][key];
    }

    // 4. 기본값 반환
    return key;
  } catch (error) {
    console.error(`번역 텍스트 가져오기 실패 (${key}):`, error);
    return key;
  }
}

// 페이지별 번역 키
const pageTranslations = {
  ko: {
    meaning: "뜻:",
    example: "예문:",
    examples: "예문",
    edit: "편집",
    delete: "삭제",
    error_title: "오류 발생!",
    error_message: "페이지를 불러오는 중 문제가 발생했습니다.",
    error_details: "자세한 내용:",
    login_required: "로그인이 필요합니다.",
  },
  en: {
    meaning: "Meaning:",
    example: "Example:",
    examples: "Examples",
    edit: "Edit",
    delete: "Delete",
    error_title: "Error!",
    error_message: "A problem occurred while loading the page.",
    error_details: "Details:",
    login_required: "Login required.",
  },
  ja: {
    meaning: "意味:",
    example: "例文:",
    examples: "例文",
    edit: "編集",
    delete: "削除",
    error_title: "エラーが発生しました!",
    error_message: "ページの読み込み中に問題が発生しました。",
    error_details: "詳細:",
    login_required: "ログインが必要です。",
  },
  zh: {
    meaning: "意思:",
    example: "例句:",
    examples: "例句",
    edit: "编辑",
    delete: "删除",
    error_title: "发生错误!",
    error_message: "加载页面时出现问题。",
    error_details: "详细信息:",
    login_required: "需要登录。",
  },
};

// 도메인 번역 매핑 (ai-concept-utils.js와 동일)
const domainTranslations = {
  daily: { ko: "일상생활", en: "Daily Life", ja: "日常生活", zh: "日常生活" },
  food: {
    ko: "음식/요리",
    en: "Food/Cooking",
    ja: "食べ物/料理",
    zh: "食物/烹饪",
  },
  travel: { ko: "여행", en: "Travel", ja: "旅行", zh: "旅行" },
  business: {
    ko: "비즈니스/업무",
    en: "Business/Work",
    ja: "ビジネス/業務",
    zh: "商务/工作",
  },
  education: { ko: "교육", en: "Education", ja: "教育", zh: "教育" },
  nature: {
    ko: "자연/환경",
    en: "Nature/Environment",
    ja: "自然/環境",
    zh: "自然/环境",
  },
  technology: {
    ko: "기술/IT",
    en: "Technology/IT",
    ja: "技術/IT",
    zh: "技术/IT",
  },
  health: {
    ko: "건강/의료",
    en: "Health/Medical",
    ja: "健康/医療",
    zh: "健康/医疗",
  },
  sports: {
    ko: "스포츠/운동",
    en: "Sports/Exercise",
    ja: "スポーツ/運動",
    zh: "体育/运动",
  },
  entertainment: {
    ko: "엔터테인먼트",
    en: "Entertainment",
    ja: "エンターテインメント",
    zh: "娱乐",
  },
  culture: {
    ko: "문화/전통",
    en: "Culture/Tradition",
    ja: "文化/伝統",
    zh: "文化/传统",
  },
  other: { ko: "기타", en: "Other", ja: "その他", zh: "其他" },
  // 호환성을 위한 추가 매핑
  academic: { ko: "교육", en: "Education", ja: "教育", zh: "教育" },
  general: { ko: "일반", en: "General", ja: "一般", zh: "一般" },
};

// ... rest of the code ...

// 개념 카드 생성 함수 (확장된 구조 지원 및 디버깅 개선)
function createConceptCard(concept) {
  // 필터 공유 모듈을 사용하여 현재 언어 값 가져오기
  const filterManager = new VocabularyFilterManager();
  const filters = filterManager.getCurrentFilters();
  const sourceLanguage = filters.sourceLanguage || "korean";
  const targetLanguage = filters.targetLanguage || "english";

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

  // 언어 코드 매핑 함수 (단어장 페이지용)
  function getLanguageCode(langCode) {
    const languageCodeMap = {
      korean: "korean",
      english: "english",
      japanese: "japanese",
      chinese: "chinese",
    };
    return languageCodeMap[langCode] || langCode;
  }

  // 언어 코드 변환
  const sourceLanguageCode = getLanguageCode(sourceLanguage);
  const targetLanguageCode = getLanguageCode(targetLanguage);

  // 1. representative_example 확인 (새 구조와 기존 구조 모두 지원)
  if (concept.representative_example) {
    const repExample = concept.representative_example;

    // 새로운 구조: 직접 언어별 텍스트
    if (repExample[sourceLanguageCode] && repExample[targetLanguageCode]) {
      example = {
        source: repExample[sourceLanguageCode],
        target: repExample[targetLanguageCode],
      };
    }
    // 기존 구조: translations 객체
    else if (repExample.translations) {
      example = {
        source:
          repExample.translations[sourceLanguageCode]?.text ||
          repExample.translations[sourceLanguageCode] ||
          "",
        target:
          repExample.translations[targetLanguageCode]?.text ||
          repExample.translations[targetLanguageCode] ||
          "",
      };
    }
  }
  // 2. featured_examples 확인 (기존 방식)
  else if (concept.featured_examples && concept.featured_examples.length > 0) {
    const firstExample = concept.featured_examples[0];
    if (firstExample.translations) {
      example = {
        source: firstExample.translations[sourceLanguageCode]?.text || "",
        target: firstExample.translations[targetLanguageCode]?.text || "",
      };
    }
  }
  // 3. core_examples 확인 (기존 방식 - 하위 호환성)
  else if (concept.core_examples && concept.core_examples.length > 0) {
    const firstExample = concept.core_examples[0];
    // 번역 구조 확인
    if (firstExample.translations) {
      example = {
        source: firstExample.translations[sourceLanguageCode]?.text || "",
        target: firstExample.translations[targetLanguageCode]?.text || "",
      };
    } else {
      // 직접 언어 속성이 있는 경우
      example = {
        source: firstExample[sourceLanguageCode] || "",
        target: firstExample[targetLanguageCode] || "",
      };
    }
  }
  // 4. 기존 examples 확인 (하위 호환성)
  else if (concept.examples && concept.examples.length > 0) {
    const firstExample = concept.examples[0];
    example = {
      source: firstExample[sourceLanguageCode] || "",
      target: firstExample[targetLanguageCode] || "",
    };
  }

  // 개념 ID 생성 (document ID 우선 사용)
  const conceptId =
    concept.id ||
    concept._id ||
    `${sourceExpression.word}_${targetExpression.word}`;

  return `
    <div 
      class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200 cursor-pointer concept-card"
      onclick="showConceptViewModal(window.allConcepts.find(c => c.id === '${conceptId}' || c._id === '${conceptId}'), '${sourceLanguage}', '${targetLanguage}')"
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
        <div class="flex items-center space-x-2">
          ${currentUser ? `
          <button 
            class="bookmark-btn p-2 rounded-full hover:bg-gray-100 transition-colors duration-200" 
            onclick="event.stopPropagation(); toggleBookmark('${conceptId}')"
            data-concept-id="${conceptId}"
            title="북마크"
          >
            <i class="fas fa-bookmark text-gray-400"></i>
          </button>
          ` : ''}
        <span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
          ${getTranslatedDomainCategory(
            conceptInfo.domain,
            conceptInfo.category,
            localStorage.getItem("preferredLanguage") || userLanguage || "ko"
          )}
        </span>
        </div>
      </div>
      
      <div class="border-t border-gray-200 pt-3 mt-3">
        <div class="flex items-center">
          <span class="font-medium">${sourceExpression.word || "N/A"}</span>
        </div>
        <p class="text-sm text-gray-600 mt-1 line-clamp-2" title="${
          targetExpression.definition || ""
        }">${targetExpression.definition || ""}</p>
      </div>
      
      ${
        example && example.source && example.target
          ? `
      <div class="border-t border-gray-200 pt-3 mt-3">
        <p class="text-sm text-gray-700 font-medium truncate" title="${example.target}">${example.target}</p>
        <p class="text-sm text-gray-500 italic truncate" title="${example.source}">${example.source}</p>
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
// 언어 순서 바꾸기 함수는 공유 모듈로 대체됨

// 날짜 포맷팅 함수
function formatDate(timestamp) {
  if (!timestamp) return "";

  try {
    let date;
    if (timestamp.toDate && typeof timestamp.toDate === "function") {
      date = timestamp.toDate();
    } else if (timestamp.seconds) {
      date = new Date(timestamp.seconds * 1000);
    } else {
      date = new Date(timestamp);
    }

    if (isNaN(date.getTime())) {
      return "";
    }

    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  } catch (error) {
    console.error("날짜 포맷팅 오류:", error);
    return "";
  }
}

// 북마크 토글 함수 (개선된 버전)
async function toggleBookmark(conceptId) {
  try {
    const currentUser = window.auth?.currentUser;
    if (!currentUser) {
      showMessage("북마크 기능을 사용하려면 로그인이 필요합니다.", "warning");
      return;
    }

    // 현재 북마크 상태 확인
    const bookmarkButton = document.querySelector(
      `.bookmark-btn[data-concept-id="${conceptId}"]`
    );
    if (!bookmarkButton) {
      console.error("북마크 버튼을 찾을 수 없습니다:", conceptId);
      return;
    }

    const icon = bookmarkButton.querySelector("i");
    const isCurrentlyBookmarked = icon.classList.contains("text-yellow-500");

    try {
      // Firebase 업데이트 - 올바른 방식으로 접근
      const userEmail = currentUser.email;
      const bookmarksRef = window.firebaseInit.doc(
        window.firebaseInit.db,
        "bookmarks",
        userEmail
      );

      // 현재 북마크 목록 가져오기
      const bookmarkDoc = await window.firebaseInit.getDoc(bookmarksRef);
      let currentBookmarks = [];

      if (bookmarkDoc.exists()) {
        const data = bookmarkDoc.data();
        currentBookmarks = data.concept_ids || [];
      }

      let updatedBookmarks;
      if (isCurrentlyBookmarked) {
        // 북마크 제거
        updatedBookmarks = currentBookmarks.filter((id) => id !== conceptId);
        showMessage("북마크가 해제되었습니다.", "success");
      } else {
        // 북마크 추가
        updatedBookmarks = [...currentBookmarks, conceptId];
        showMessage("북마크가 추가되었습니다.", "success");
      }

      // Firebase에 저장
      await window.firebaseInit.setDoc(bookmarksRef, {
        user_email: userEmail,
        concept_ids: updatedBookmarks,
        updated_at: new Date().toISOString(),
      });

      // UI 즉시 업데이트 (성공 후)
      if (isCurrentlyBookmarked) {
        icon.className = "fas fa-bookmark text-gray-400";
        bookmarkButton.title = "북마크";
      } else {
        icon.className = "fas fa-bookmark text-yellow-500";
        bookmarkButton.title = "북마크 해제";
      }
    } catch (error) {
      console.error("북마크 업데이트 실패:", error);
      showMessage("북마크 업데이트 중 오류가 발생했습니다.", "error");
    }
  } catch (error) {
    console.error("북마크 토글 오류:", error);
    showMessage("북마크 기능 오류가 발생했습니다.", "error");
  }
}

// 메시지 표시 함수
function showMessage(message, type = "info") {
  const messageContainer = document.createElement("div");
  const bgColor =
    type === "success"
      ? "bg-green-100 border-green-400 text-green-700"
      : type === "error"
      ? "bg-red-100 border-red-400 text-red-700"
      : type === "warning"
      ? "bg-yellow-100 border-yellow-400 text-yellow-700"
      : "bg-blue-100 border-blue-400 text-blue-700";

  messageContainer.className = `fixed top-4 right-4 ${bgColor} px-4 py-3 rounded z-50 border shadow-lg`;
  messageContainer.innerHTML = `
    <div class="flex items-center">
      <span>${message}</span>
      <button onclick="this.parentElement.parentElement.remove()" class="ml-3 text-lg font-bold hover:opacity-70">×</button>
    </div>
  `;

  document.body.appendChild(messageContainer);

  setTimeout(() => {
    if (messageContainer.parentElement) {
      messageContainer.remove();
    }
  }, 4000);
}

// 전역 함수로 노출
window.toggleBookmark = toggleBookmark;

// 검색 및 필터링 함수 (공유 모듈 사용)
function handleSearch() {
  displayCount = 12;
  lastVisibleConcept = null;
  firstVisibleConcept = null;

  // 필터 공유 모듈을 사용하여 현재 필터 값들 가져오기
  const filterManager = new VocabularyFilterManager();
  const filters = filterManager.getCurrentFilters();

  // 필터 공유 모듈을 사용하여 필터링 및 정렬 수행
  filteredConcepts = VocabularyFilterProcessor.processFilters(
    allConcepts,
    filters
  );

  // 표시
  displayConceptList();
}

// 정렬 함수는 공유 모듈로 대체됨

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

  // HTML 삽입 (그리드 레이아웃 적용)
  conceptList.innerHTML = `
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      ${cardHTMLs.join("")}
    </div>
  `;

  // 북마크 상태 업데이트
  updateBookmarkStates();

  // 더 보기 버튼 표시/숨김
  if (loadMoreBtn) {
    if (filteredConcepts.length > displayCount) {
      loadMoreBtn.style.display = "block";
    } else {
      loadMoreBtn.style.display = "none";
    }
  }
}

// 북마크 상태 업데이트 함수
async function updateBookmarkStates() {
  try {
    const currentUser = window.auth?.currentUser;
    if (!currentUser) return; // 로그인하지 않은 경우 북마크 상태 업데이트 안함

    const userEmail = currentUser.email;
    const bookmarksRef = window.firebaseInit.doc(
      window.firebaseInit.db,
      "bookmarks",
      userEmail
    );

    const bookmarkDoc = await window.firebaseInit.getDoc(bookmarksRef);
    let bookmarkedIds = [];

    if (bookmarkDoc.exists()) {
      const data = bookmarkDoc.data();
      bookmarkedIds = data.concept_ids || [];
    }

    // 모든 북마크 버튼 업데이트
    const bookmarkButtons = document.querySelectorAll(".bookmark-btn");
    bookmarkButtons.forEach((button) => {
      const conceptId = button.getAttribute("data-concept-id");
      const icon = button.querySelector("i");

      if (bookmarkedIds.includes(conceptId)) {
        icon.className = "fas fa-bookmark text-yellow-500";
        button.title = "북마크 해제";
      } else {
        icon.className = "fas fa-bookmark text-gray-400";
        button.title = "북마크";
      }
    });
  } catch (error) {
    console.error("북마크 상태 업데이트 실패:", error);
  }
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

    // 편집 모달 스크립트 동적 로드
    if (!window.editConceptModalLoaded) {
      const script = document.createElement("script");
      script.src = "../../components/js/edit-concept-modal.js";
      script.type = "module";
      script.onload = () => {
        window.editConceptModalLoaded = true;
      };
      script.onerror = () => {
        console.error("❌ 편집 모달 스크립트 로드 실패");
      };
      document.head.appendChild(script);
    }
  } catch (error) {
    console.error("모달 로드 중 오류 발생:", error);
  }
}

// 관리자 UI 업데이트 함수
async function updateAdminUI(user) {
  try {
    const userEmail = user.email;
    const userRef = doc(db, "users", userEmail);
    const userDoc = await getDoc(userRef);

    const isAdmin = userDoc.exists() && userDoc.data().role === "admin";
    
    // 관리자 기능 버튼 표시/숨김
    const addConceptBtn = document.getElementById("add-concept-btn");
    const bulkImportBtn = document.getElementById("bulk-add-btn");
    
    if (isAdmin) {
      if (addConceptBtn) addConceptBtn.style.display = 'block';
      if (bulkImportBtn) bulkImportBtn.style.display = 'block';
    } else {
      if (addConceptBtn) addConceptBtn.style.display = 'none';
      if (bulkImportBtn) bulkImportBtn.style.display = 'none';
    }
  } catch (error) {
    console.error("관리자 UI 업데이트 실패:", error);
    // 오류 시 기본적으로 버튼 숨김
    const addConceptBtn = document.getElementById("add-concept-btn");
    const bulkImportBtn = document.getElementById("bulk-add-btn");
    if (addConceptBtn) addConceptBtn.style.display = 'none';
    if (bulkImportBtn) bulkImportBtn.style.display = 'none';
  }
}

// 사용량 UI 업데이트
async function updateUsageUI() {
  try {
    if (!currentUser) {
      return;
    }

    // conceptUtils.getUsage를 사용하여 DB에서 실제 값 가져오기
    const usage = await conceptUtils.getUsage(currentUser.email);

    const conceptCount = usage.wordCount || 0;
    const maxConcepts = usage.maxWordCount || 50; // DB에서 가져온 실제 값 사용

    // UI 업데이트 (실제 HTML ID 사용)
    const usageText = document.getElementById("usage-text");
    const usageBar = document.getElementById("usage-bar");

    if (usageText) {
      usageText.textContent = `${conceptCount}/${maxConcepts}`;
    } else {
      console.error("❌ usage-text 요소를 찾을 수 없음");
    }

    if (usageBar) {
      const usagePercentage = (conceptCount / maxConcepts) * 100;
      const widthPercentage = Math.min(usagePercentage, 100);

      // Tailwind 기본 클래스 사용 + style로 width 설정
      usageBar.className =
        "bg-[#4B63AC] h-2.5 rounded-full transition-all duration-300";
      usageBar.style.width = `${widthPercentage}%`;

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
    } else {
      console.error("❌ usage-bar 요소를 찾을 수 없음");
    }
  } catch (error) {
    console.error("❌ updateUsageUI 사용량 업데이트 중 오류 발생:", error);
  }
}

// 개념 데이터 가져오기 (ID 포함 및 디버깅 개선)
async function fetchAndDisplayConcepts() {
  try {
    // 분리된 컬렉션과 통합 컬렉션 모두에서 개념 가져오기
    allConcepts = [];

    try {
      const conceptsRef = collection(db, "concepts");

      // Firebase 연결 상태 확인
      if (!db) {
        throw new Error("Firebase 데이터베이스가 초기화되지 않았습니다.");
      }

      // 전체 조회 후 필터링 (더 안전한 방식)
      const querySnapshot = await getDocs(conceptsRef);

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        data.id = doc.id;
        if (!data._id) {
          data._id = doc.id;
        }

        // AI 생성 개념 제외하고 모든 개념 포함 (분리된 컬렉션과 기존 구조 모두)
        if (!data.isAIGenerated) {
          allConcepts.push(data);
        }
      });

      if (allConcepts.length === 0) {
        // 빈 상태 표시
        const conceptList = document.getElementById("concept-list");
        if (conceptList) {
          conceptList.innerHTML = `
            <div class="col-span-full text-center py-12">
              <div class="text-gray-400 text-6xl mb-4">📝</div>
              <h3 class="text-xl font-medium text-gray-600 mb-2">아직 단어가 없습니다</h3>
              <p class="text-gray-500 mb-6">새로운 단어를 추가해보세요!</p>
              <button onclick="document.getElementById('add-concept-btn').click()" 
                      class="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                첫 번째 단어 추가하기
              </button>
            </div>
          `;
        }
        return;
      }
    } catch (queryError) {
      console.error("❌ concepts 컬렉션 조회 실패:", queryError);

      // Firebase 연결 문제인 경우 사용자에게 알림
      if (
        queryError.code === "unavailable" ||
        queryError.message.includes("Failed to get document")
      ) {
        const conceptList = document.getElementById("concept-list");
        if (conceptList) {
          conceptList.innerHTML = `
            <div class="col-span-full text-center py-12">
              <div class="text-red-400 text-6xl mb-4">🔌</div>
              <h3 class="text-xl font-medium text-gray-600 mb-2">연결 문제가 발생했습니다</h3>
              <p class="text-gray-500 mb-6">인터넷 연결을 확인하고 페이지를 새로고침해주세요.</p>
              <button onclick="window.location.reload()" 
                      class="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                페이지 새로고침
              </button>
            </div>
          `;
        }
        return;
      }

      allConcepts = [];
      throw queryError;
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

    // 전역 변수 업데이트 (편집 모달에서 접근 가능하도록)
    window.allConcepts = allConcepts;

    // 학습 페이지에서 사용할 수 있도록 sessionStorage에도 저장
    try {
      sessionStorage.setItem(
        "learningConcepts",
        JSON.stringify(allConcepts.slice(0, 100))
      ); // 성능을 위해 최대 100개
    } catch (error) {
      console.warn("⚠️ sessionStorage 저장 실패:", error);
    }

    // 현재 필터로 검색 및 표시
    handleSearch();
  } catch (error) {
    console.error("❌ 개념 데이터 가져오기 오류:", error);

    // 사용자에게 친화적인 오류 메시지 표시
    const conceptList = document.getElementById("concept-list");
    if (conceptList) {
      conceptList.innerHTML = `
        <div class="col-span-full text-center py-12">
          <div class="text-red-400 text-6xl mb-4">⚠️</div>
          <h3 class="text-xl font-medium text-gray-600 mb-2">데이터 로드 실패</h3>
          <p class="text-gray-500 mb-6">단어 데이터를 불러오는 중 문제가 발생했습니다.</p>
          <button onclick="window.location.reload()" 
                  class="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
            다시 시도
          </button>
        </div>
      `;
    }

    console.error("Error details:", error);
  }
}

// 개념 상세 보기 모달 열기 함수 (전역 함수, ID 조회 개선)
window.openConceptViewModal = async function (conceptId) {
  try {
    // 사용자 언어 설정 업데이트 (AI 단어장과 동일하게)
    try {
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

    // conceptUtils가 정의되어 있는지 확인
    if (!conceptUtils) {
      throw new Error("conceptUtils가 정의되지 않았습니다.");
    }

    // 현재 선택된 언어 설정 가져오기
    const sourceLanguage = document.getElementById("source-language").value;
    const targetLanguage = document.getElementById("target-language").value;

    // 먼저 메모리에서 개념 찾기 (빠른 검색)
    let conceptData = allConcepts.find(
      (concept) =>
        concept.id === conceptId ||
        concept._id === conceptId ||
        `${concept.expressions?.[sourceLanguage]?.word}_${concept.expressions?.[targetLanguage]?.word}` ===
          conceptId
    );

    // 메모리에서 찾지 못했으면 Firebase에서 조회
    if (!conceptData) {
      try {
        conceptData = await conceptUtils.getConcept(conceptId);
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
        }
      }
    }

    if (!conceptData) {
      console.error("개념을 찾을 수 없습니다. conceptId:", conceptId);
      alert("개념 정보를 찾을 수 없습니다.");
      return;
    }

    console.log("모달 표시 시작...");
    // 새로운 모달 시스템 사용
    showConceptViewModal(conceptData, sourceLanguage, targetLanguage);

    console.log("모달 열기 완료");
  } catch (error) {
    console.error("개념 상세 보기 모달 열기 중 오류 발생:", error);
    console.error("Error stack:", error.stack);
    alert("개념 정보를 불러올 수 없습니다: " + error.message);
  }
};

// 언어 변경 이벤트 리스너 설정
function setupLanguageChangeListener() {
  // 언어 변경 이벤트 감지
  window.addEventListener("languageChanged", async (event) => {
    userLanguage = event.detail.language;

    // 환경 언어 변경 시 언어 필터 리셋
    await updateLanguageFilterOnUIChange(
      event.detail.language,
      "vocabularyLanguageFilter"
    );

    // 개념 카드들을 다시 렌더링
    if (allConcepts && allConcepts.length > 0) {
      displayConceptList();
    }

    // 필터 UI도 업데이트
    if (typeof window.updateDomainCategoryEmojiLanguage === "function") {
      window.updateDomainCategoryEmojiLanguage();
    }
  });
}

// 페이지 로드 시 언어 변경 리스너 설정
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", setupLanguageChangeListener);
} else {
  setupLanguageChangeListener();
}

// 전역 렌더링 함수들 (언어 동기화에서 사용)
window.renderConceptCards = function () {
  // 필터링된 개념이 없으면 전체 개념으로 다시 설정
  if (!filteredConcepts || filteredConcepts.length === 0) {
    filteredConcepts = [...allConcepts];
  }

  if (filteredConcepts && filteredConcepts.length > 0) {
    displayConceptList();
  } else {
    console.warn("⚠️ 표시할 개념이 없습니다");
  }
};

window.updateFilterUI = function () {
  if (typeof window.updateDomainCategoryEmojiLanguage === "function") {
    window.updateDomainCategoryEmojiLanguage();
  }
};

// 관리자 권한 체크 함수
async function checkAdminPermission() {
  if (!auth.currentUser) {
    showMessage("이 기능을 사용하려면 로그인이 필요합니다.", "info");

    // 현재 언어 감지
    const currentLanguage =
      (typeof getCurrentUILanguage === "function"
        ? getCurrentUILanguage()
        : null) ||
      localStorage.getItem("userLanguage") ||
      "ko";

    // 언어별 로그인 페이지로 리디렉션 (모든 언어를 locales 폴더로)
    setTimeout(() => {
      window.location.href = `../../locales/${currentLanguage}/login.html`;
    }, 1500);
    return false;
  }

  try {
    const userEmail = auth.currentUser.email;
    const userRef = doc(db, "users", userEmail);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists() && userDoc.data().role === "admin") {
      return true;
    } else {
      showMessage("관리자 권한이 필요한 기능입니다.", "error");
      return false;
    }
  } catch (error) {
    console.error("권한 확인 오류:", error);
    showMessage("권한 확인 중 오류가 발생했습니다.", "error");
    return false;
  }
}

// 이벤트 리스너 설정
function setupEventListeners() {
  // 네비게이션바 이벤트 설정 (햄버거 메뉴 등)
  if (typeof window.setupBasicNavbarEvents === "function") {
    window.setupBasicNavbarEvents();
  }

  // 새 개념 추가 버튼 이벤트
  const addConceptBtn = document.getElementById("add-concept-btn");
  if (addConceptBtn) {
    addConceptBtn.addEventListener("click", async () => {
      if (await checkAdminPermission()) {
        if (typeof window.openConceptModal === "function") {
          window.openConceptModal();
        } else {
          console.error("openConceptModal 함수를 찾을 수 없습니다.");
        }
      }
    });
  }

  // 대량 추가 버튼 이벤트
  const bulkImportBtn = document.getElementById("bulk-add-btn");
  if (bulkImportBtn) {
    bulkImportBtn.addEventListener("click", async () => {
      if (await checkAdminPermission()) {
        if (typeof window.openBulkImportModal === "function") {
          window.openBulkImportModal();
        } else {
          console.error("openBulkImportModal 함수를 찾을 수 없습니다.");
        }
      }
    });
  }

  // 더 보기 버튼 이벤트
  const loadMoreBtn = document.getElementById("load-more");
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener("click", handleLoadMore);
  }

  // 필터 공유 모듈을 사용하여 이벤트 리스너 설정 (언어 전환 버튼 포함)
  const filterManager = setupVocabularyFilters(() => {
    // 필터 변경 시 실행될 콜백 함수
    handleSearch();
  });

  // 언어 필터 초기화 (새로고침 시 설정 유지) - DOM 로드 후 실행
  setTimeout(() => {
    initializeLanguageFilterElements(
      "source-language",
      "target-language",
      "vocabularyLanguageFilter"
    );

    // 언어 필터 변경 시 설정 저장 이벤트 리스너 추가
    const sourceLanguageSelect = document.getElementById("source-language");
    const targetLanguageSelect = document.getElementById("target-language");

    if (sourceLanguageSelect) {
      sourceLanguageSelect.addEventListener("change", () => {
        saveLanguageFilterSettings(
          sourceLanguageSelect.value,
          targetLanguageSelect.value,
          "vocabularyLanguageFilter"
        );
      });
    }

    if (targetLanguageSelect) {
      targetLanguageSelect.addEventListener("change", () => {
        saveLanguageFilterSettings(
          sourceLanguageSelect.value,
          targetLanguageSelect.value,
          "vocabularyLanguageFilter"
        );
      });
    }
  }, 100);

  // 필터 초기화 버튼
  const resetFiltersBtn = document.getElementById("reset-filters");
  if (resetFiltersBtn) {
    resetFiltersBtn.addEventListener("click", () => {
      // 필터 초기화
      const searchInput = document.getElementById("search-input");
      const domainFilter = document.getElementById("domain-filter");
      const categoryFilter = document.getElementById("category-filter");
      const sortFilter = document.getElementById("sort-filter");

      if (searchInput) searchInput.value = "";
      if (domainFilter) domainFilter.value = "";
      if (categoryFilter) categoryFilter.value = "";
      if (sortFilter) sortFilter.value = "latest";

      // 검색 다시 실행
      handleSearch();
    });
  }

  // 개념 추가/수정 완료 이벤트 리스너 (다중 등록)
  const handleConceptSaved = async (event) => {
    try {
      // 개념 목록 다시 로드 및 표시
      await fetchAndDisplayConcepts();

      // 메시지 표시
      showMessage("새 개념이 추가되었습니다!", "success");
    } catch (error) {
      console.error("❌ 단어장 목록 업데이트 실패:", error);
      showMessage("목록 업데이트 중 오류가 발생했습니다.", "error");
    }
  };

  // document와 window 모두에 이벤트 리스너 등록
  document.addEventListener("concept-saved", handleConceptSaved);
  window.addEventListener("concept-saved", handleConceptSaved);
}

// 오류 메시지 표시
function showError(message, details = "") {
  console.error("오류:", message, details);

  // 사용자에게 친화적인 메시지 표시
  const errorMessage = details ? `${message}\n상세 정보: ${details}` : message;

  // 모달이나 토스트 메시지가 있다면 사용, 없으면 alert 사용
  if (typeof window.showMessage === "function") {
    window.showMessage(errorMessage, "error");
  } else {
    alert(errorMessage);
  }
}

// 페이지 초기화 함수
async function initializePage() {
  try {
    // 네비게이션바 로드
    if (typeof window.loadNavbar === 'function') {
      await window.loadNavbar();
    }
    
    // Footer 로드
    if (typeof window.loadFooter === 'function') {
      await window.loadFooter();
    }
    
    // 사용자 언어 초기화
    await initializeUserLanguage();

    // 모달 HTML 로드
    await loadModals([
      "../../components/concept-view-modal.html",
      "../../components/add-concept-modal.html",
      "../../components/bulk-import-modal.html",
      "../../components/edit-concept-modal.html",
    ]);

    // 모달 초기화
    await initializeConceptModal();
    await initializeBulkImportModal();

    // 이벤트 리스너 설정
    setupEventListeners();

    // 언어 변경 감지 설정
    setupLanguageChangeListener();

    // 사용자 인증 상태 감지
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        currentUser = user;

        // 개념 로드 및 표시
        await fetchAndDisplayConcepts();

        // 사용자 로그인 후 사용량 UI 업데이트
        await updateUsageUI();
        
        // 관리자 기능 버튼 표시 (관리자인 경우에만)
        await updateAdminUI(user);
      } else {
        // 로그인하지 않은 사용자도 단어장 볼 수 있도록 개념 로드
        currentUser = null;
        await fetchAndDisplayConcepts();
        
        // 로그인 없이는 사용량 UI 숨김
        const usageSection = document.querySelector('.usage-section');
        if (usageSection) {
          usageSection.style.display = 'none';
        }
        
        // 관리자 기능 버튼 숨김
        const addConceptBtn = document.getElementById("add-concept-btn");
        const bulkImportBtn = document.getElementById("bulk-add-btn");
        if (addConceptBtn) addConceptBtn.style.display = 'none';
        if (bulkImportBtn) bulkImportBtn.style.display = 'none';
      }
    });
  } catch (error) {
    console.error("페이지 초기화 실패:", error);
    showError(
      getTranslatedText("error_message"),
      getTranslatedText("error_details") + " " + error.message
    );
  }
}

// 페이지 로드 시 초기화 실행
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializePage);
} else {
  initializePage();
}
