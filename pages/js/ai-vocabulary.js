import {
  auth,
  db,
  conceptUtils,
  supportedLanguages,
} from "../../js/firebase/firebase-init.js";
import { getActiveLanguage } from "../../utils/language-utils.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
import { showConceptModal } from "../../components/js/ai-concept-modal.js";
import { handleAIConceptRecommendation } from "../../utils/ai-concept-utils.js";
// 필터 공유 모듈 import
import {
  VocabularyFilterBuilder,
  VocabularyFilterManager,
  VocabularyFilterProcessor,
  setupVocabularyFilters,
} from "../../utils/vocabulary-filter-shared.js";
// 공통 번역 유틸리티 import
// translation-utils.js 제거됨 - language-utils.js의 번역 시스템 사용
// 도메인 필터 언어 초기화는 vocabulary-filter-shared.js에서 처리됨

// 로컬 환경 감지
const isLocalEnvironment =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";

let currentUser = null;
let allConcepts = [];
let filteredConcepts = [];
let displayedConcepts = [];
const CONCEPTS_PER_PAGE = 12;
let currentPage = 1;
let userLanguage = "ko"; // 기본값

// 다국어 번역 텍스트
const pageTranslations = {
  ko: {
    meaning: "의미",
    examples: "예문",
    ai_generated: "AI 생성",
  },
  en: {
    meaning: "Meaning",
    examples: "Examples",
    ai_generated: "AI Generated",
  },
  ja: {
    meaning: "意味",
    examples: "例文",
    ai_generated: "AI生成",
  },
  zh: {
    meaning: "意思",
    examples: "例句",
    ai_generated: "AI生成",
  },
};

/**
 * =================================================================
 * 유틸리티 함수
 * =================================================================
 */
// 다국어 번역 텍스트 가져오기
function getTranslatedText(key) {
  const currentLang = userLanguage || "ko";
  // 페이지별 번역 우선
  if (pageTranslations[currentLang] && pageTranslations[currentLang][key]) {
    return pageTranslations[currentLang][key];
  }
  // 공통 번역 사용
  return (
    window.translations?.[currentLang]?.[key] ||
    pageTranslations.en?.[key] ||
    key
  );
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

    // 언어 변경 이벤트 리스너 추가
    setupLanguageChangeListener();
  } catch (error) {
    console.error("언어 설정 로드 실패:", error);
    userLanguage = "ko"; // 기본값
  }
}

// 언어 변경 이벤트 리스너 설정
function setupLanguageChangeListener() {
  // 언어 변경 이벤트 감지
  window.addEventListener("languageChanged", (event) => {
    console.log("🌐 AI단어장: 언어 변경 감지", event.detail.language);

    // 개념 카드들을 다시 렌더링
    if (displayedConcepts && displayedConcepts.length > 0) {
      renderConcepts();
    }

    // 필터 UI도 업데이트
    if (typeof window.updateDomainCategoryEmojiLanguage === "function") {
      window.updateDomainCategoryEmojiLanguage();
    }
  });

  console.log("✅ AI단어장: 언어 변경 리스너 설정 완료");
}

// 전역 함수로 내보내기
window.showConceptModal = showConceptModal;

// 전역 렌더링 함수들 (언어 동기화에서 사용)
window.renderAIConceptCards = function () {
  console.log("🔄 AI단어장: 개념 카드 다시 렌더링");
  console.log("📊 현재 상태:", {
    allConcepts: allConcepts?.length || 0,
    displayedConcepts: displayedConcepts?.length || 0,
    filteredConcepts: filteredConcepts?.length || 0,
  });

  // 표시할 개념이 없으면 전체 개념으로 다시 설정
  if (!displayedConcepts || displayedConcepts.length === 0) {
    console.log("⚠️ 표시된 개념이 없음, 필터 적용 후 다시 로드");
    if (allConcepts && allConcepts.length > 0) {
      applyFiltersAndSort();
    }
  } else {
    renderConcepts();
  }
};

window.updateFilterUI = function () {
  console.log("🔄 AI단어장: 필터 UI 업데이트");
  if (typeof window.updateDomainCategoryEmojiLanguage === "function") {
    window.updateDomainCategoryEmojiLanguage();
  }
};

// 모달 로드 함수
async function loadConceptViewModal() {
  try {
    // 현재 경로에 따라 상대 경로 조정
    const currentPath = window.location.pathname;
    let modalPath = "../components/concept-view-modal.html";

    // locales 내에서 실행되는 경우 경로 조정
    if (currentPath.includes("/locales/")) {
      modalPath = "../../components/concept-view-modal.html";
    }

    console.log("개념 보기 모달 로드 경로:", modalPath);
    const response = await fetch(modalPath);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();

    // modal-container가 없으면 생성
    let modalContainer = document.getElementById("modal-container");
    if (!modalContainer) {
      modalContainer = document.createElement("div");
      modalContainer.id = "modal-container";
      document.body.appendChild(modalContainer);
    }

    modalContainer.innerHTML = html;

    // 로드 후 필수 요소들이 존재하는지 확인
    const requiredElements = [
      "concept-view-modal",
      "concept-view-emoji",
      "concept-view-title",
      "concept-view-pronunciation",
      "language-tabs",
      "language-content",
      "examples-container",
    ];

    const missingElements = requiredElements.filter(
      (id) => !document.getElementById(id)
    );
    if (missingElements.length > 0) {
      console.warn("필수 모달 요소들이 누락됨:", missingElements);
    } else {
    }
  } catch (error) {
    console.error("개념 보기 모달 로드 실패:", error);
  }
}

// AI 개념 편집 모달 로드 (AI 전용 JS 사용)
async function loadEditConceptModal() {
  try {
    // 현재 경로에 따라 상대 경로 조정
    const currentPath = window.location.pathname;
    let modalPath = "../components/ai-edit-concept-modal.html";
    let scriptPath = "../components/js/ai-edit-concept-modal.js";

    // locales 내에서 실행되는 경우 경로 조정
    if (currentPath.includes("/locales/")) {
      modalPath = "../../components/ai-edit-concept-modal.html";
      scriptPath = "../../components/js/ai-edit-concept-modal.js";
    }

    console.log("AI 개념 편집 모달 로드 경로:", modalPath);
    const response = await fetch(modalPath);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();

    // modal-container에 편집 모달 추가
    let modalContainer = document.getElementById("modal-container");
    if (!modalContainer) {
      modalContainer = document.createElement("div");
      modalContainer.id = "modal-container";
      document.body.appendChild(modalContainer);
    }

    // 기존 내용에 편집 모달 추가
    modalContainer.innerHTML += html;

    // AI 전용 편집 모달 스크립트 로드
    const editModalScript = document.createElement("script");
    editModalScript.type = "module";
    editModalScript.src = scriptPath;
    editModalScript.onload = () => {
      console.log("✅ AI 편집 모달 스크립트 로드 완료");
    };
    editModalScript.onerror = (error) => {
      console.error("❌ AI 전용 개념 편집 모달 스크립트 로드 실패:", error);
    };
    document.head.appendChild(editModalScript);
  } catch (error) {
    console.error("AI 개념 편집 모달 로드 실패:", error);
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  try {
    // 사용자 언어 설정 초기화 (실패해도 계속 진행)
    try {
      await initializeUserLanguage();
    } catch (error) {
      console.error("언어 초기화 실패, 기본값 사용:", error);
      userLanguage = "ko";
    }

    // 네비게이션 바는 navbar.js에서 자동 처리됨

    // 모달들 직접 로드
    await loadConceptViewModal();
    await loadEditConceptModal();

    // 도메인 필터 언어 초기화는 vocabulary-filter-shared.js에서 처리됨
    if (window.initializeVocabularyFilterLanguage) {
      window.initializeVocabularyFilterLanguage();
    }

    // 필터 언어 즉시 업데이트
    setTimeout(() => {
      if (typeof window.updateVocabularyFilterLanguage === "function") {
        window.updateVocabularyFilterLanguage();
      }
    }, 500);

    // 로컬 환경인지 확인
    if (isLocalEnvironment) {
      // 로컬 환경 알림 메시지 추가
      const alertDiv = document.createElement("div");
      alertDiv.className =
        "fixed top-0 right-0 m-4 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 max-w-md z-50";
      alertDiv.innerHTML = `
        <div class="flex">
          <div class="py-1"><svg class="w-6 h-6 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg></div>
          <div>
            <p class="font-bold">로컬 환경 알림</p>
            <p class="text-sm">로컬 환경에서는 제한된 AI 기능이 제공됩니다. 테스트 데이터를 사용합니다.</p>
            <button class="mt-2 bg-yellow-200 px-2 py-1 rounded text-xs" onclick="this.parentElement.parentElement.parentElement.remove()">닫기</button>
          </div>
        </div>
      `;
      document.body.appendChild(alertDiv);
    }

    initializeEventListeners();

    onAuthStateChanged(auth, async (user) => {
      if (user) {
        currentUser = user;
        await initializePage();
      } else {
        console.log("❌ 사용자가 로그인되지 않았습니다.");
        // alert 메시지 제거하고 바로 리디렉션
        if (typeof window.redirectToLogin === "function") {
          window.redirectToLogin();
        } else {
          // 대체 방법: 직접 언어별 로그인 페이지로 리디렉션
          const currentLanguage = localStorage.getItem("userLanguage") || "ko";
          window.location.href = `/locales/${currentLanguage}/login.html`;
        }
      }
    });
  } catch (error) {
    console.error("페이지 초기화 중 오류:", error);
  }
});

function initializeEventListeners() {
  // 네비게이션바 이벤트 설정 (햄버거 메뉴 등)
  if (typeof window.setupBasicNavbarEvents === "function") {
    window.setupBasicNavbarEvents();
    console.log("✅ AI단어장: 네비게이션바 이벤트 설정 완료");
  } else {
    console.warn("⚠️ setupBasicNavbarEvents 함수를 찾을 수 없습니다.");
  }

  // AI 개념 추천 버튼 (모든 언어 페이지에서 통일된 ID 사용)
  const aiAddBtn = document.getElementById("ai-add-concept");
  if (aiAddBtn) {
    aiAddBtn.addEventListener("click", () => {
      if (currentUser) {
        handleAIConceptRecommendation(currentUser, db);
      }
    });
  }

  // 필터 공유 모듈을 사용하여 이벤트 리스너 설정 (언어 전환 버튼 포함)
  const filterManager = setupVocabularyFilters(() => {
    // 필터 변경 시 실행될 콜백 함수
    applyFiltersAndSort();
  });

  // AI 단어장 언어 필터 기본값 설정
  initializeAILanguageFilters();

  // 더 보기 버튼
  const loadMoreBtn = document.getElementById("load-more");
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener("click", loadMoreConcepts);
  }

  // AI 개념 수정 완료 이벤트 리스너 추가
  document.addEventListener("concept-saved", async (event) => {
    try {
      // AI 개념 목록 다시 로드
      await loadConcepts();
      // 필터 및 정렬 다시 적용
      applyFiltersAndSort();
    } catch (error) {
      console.error("❌ AI 개념 목록 업데이트 실패:", error);
    }
  });
}

// 현재 언어 감지 함수 추가
function detectCurrentLanguage() {
  const path = window.location.pathname;

  if (path.includes("/locales/en/") || path.includes("/en/")) {
    return "en";
  } else if (path.includes("/locales/ja/") || path.includes("/ja/")) {
    return "ja";
  } else if (path.includes("/locales/zh/") || path.includes("/zh/")) {
    return "zh";
  } else if (path.includes("/locales/ko/") || path.includes("/ko/")) {
    return "ko";
  }

  return "ko"; // 기본값
}

// AI 단어장 언어 필터 기본값 설정
function initializeAILanguageFilters() {
  console.log("🔧 AI 단어장: 언어 필터 기본값 설정 시작");

  // 환경 언어 감지
  const currentLang = detectCurrentLanguage();
  console.log("🌐 현재 환경 언어:", currentLang);

  // 언어 코드 매핑
  const languageMap = {
    ko: "korean",
    en: "english",
    ja: "japanese",
    zh: "chinese",
  };

  // 원본 언어는 환경 언어로 설정
  const sourceLanguage = languageMap[currentLang] || "korean";

  // 대상 언어는 기본적으로 영어, 원본이 영어인 경우 한국어
  const targetLanguage = sourceLanguage === "english" ? "korean" : "english";

  console.log("📊 AI 단어장: 언어 필터 기본값:", {
    sourceLanguage,
    targetLanguage,
    environmentLang: currentLang,
  });

  // 언어 필터 요소 찾기
  const sourceSelect = document.getElementById("source-language");
  const targetSelect = document.getElementById("target-language");

  if (sourceSelect && targetSelect) {
    // 기본값 설정
    sourceSelect.value = sourceLanguage;
    targetSelect.value = targetLanguage;

    console.log("✅ AI 단어장: 언어 필터 기본값 설정 완료");
  } else {
    console.warn("⚠️ AI 단어장: 언어 필터 요소를 찾을 수 없습니다");
  }
}

async function initializePage() {
  try {
    await loadConcepts();
    await updateUsageDisplay();
    applyFiltersAndSort();
  } catch (error) {
    console.error("페이지 초기화 중 오류:", error);
  }
}

async function loadConcepts() {
  try {
    // ai-recommend 컬렉션에서 사용자의 AI 개념 가져오기 (분리된 컬렉션 구조)
    allConcepts = await conceptUtils.getUserAIConcepts(currentUser.email);

    updateConceptCount();
  } catch (error) {
    console.error("❌ AI 개념 로드 중 오류:", error);
    allConcepts = [];
  }
}

function updateConceptCount() {
  const countElement = document.getElementById("filtered-count");
  if (countElement) {
    countElement.textContent = allConcepts.length;
  }
}

async function updateUsageDisplay() {
  try {
    // 로그인된 사용자인지 확인
    if (!currentUser) {
      console.log("로그인되지 않은 사용자입니다.");
      return;
    }

    // 기존 users 컬렉션의 사용량 관리 사용 (이메일 사용)
    const usage = await conceptUtils.getUsage(currentUser.email);
    console.log("🔍 AI 단어장 사용량 정보:", usage);

    const usageText = document.getElementById("ai-usage-text");
    const usageBar = document.getElementById("ai-usage-bar");

    if (usageText && usageBar) {
      const aiUsed = usage.aiUsed || 0;
      const aiLimit = usage.aiLimit || 10; // DB에서 가져온 실제 값 사용
      const percentage = Math.min((aiUsed / aiLimit) * 100, 100);

      usageText.textContent = `${aiUsed}/${aiLimit}`;
      usageBar.style.width = `${percentage}%`;

      // 색상 업데이트
      if (percentage >= 90) {
        usageBar.classList.remove("bg-[#4B63AC]", "bg-yellow-500");
        usageBar.classList.add("bg-red-500");
      } else if (percentage >= 70) {
        usageBar.classList.remove("bg-[#4B63AC]", "bg-red-500");
        usageBar.classList.add("bg-yellow-500");
      } else {
        usageBar.classList.remove("bg-red-500", "bg-yellow-500");
        usageBar.classList.add("bg-[#4B63AC]");
      }
    }
  } catch (error) {
    console.error("AI 사용량 표시 업데이트 중 오류:", error);

    // 권한 오류인 경우 기본값으로 표시
    if (
      error.code === "permission-denied" ||
      error.message.includes("Missing or insufficient permissions")
    ) {
      console.log("권한 오류로 인해 기본 사용량 표시");
      const usageText = document.getElementById("ai-usage-text");
      const usageBar = document.getElementById("ai-usage-bar");

      if (usageText && usageBar) {
        usageText.textContent = "0/10";
        usageBar.style.width = "0%";
        usageBar.classList.remove("bg-red-500", "bg-yellow-500");
        usageBar.classList.add("bg-[#4B63AC]");
      }
    }
  }
}

// 필터 관련 함수들은 공유 모듈로 대체됨

function applyFiltersAndSort() {
  console.log("🔄 AI 단어장: 필터 및 정렬 적용 시작");

  // 필터 공유 모듈을 사용하여 현재 필터 값들 가져오기
  const filterManager = new VocabularyFilterManager();
  const filters = filterManager.getCurrentFilters();

  console.log("🔍 AI 단어장: 현재 필터 값들:", filters);

  // 필터 공유 모듈을 사용하여 필터링 및 정렬 수행
  filteredConcepts = VocabularyFilterProcessor.processFilters(
    allConcepts,
    filters
  );

  console.log("📊 AI 단어장: 필터링 결과:", {
    전체개념수: allConcepts.length,
    필터링된개념수: filteredConcepts.length,
  });

  // 필터된 개념 수 업데이트
  const filteredCountElement = document.getElementById("filtered-count");
  if (filteredCountElement) {
    filteredCountElement.textContent = filteredConcepts.length;
  }

  // 페이지 리셋 및 표시
  currentPage = 1;
  displayedConcepts = [];

  // 개념 목록 초기화 (기존 카드들 제거)
  const conceptList = document.getElementById("concept-list");
  if (conceptList) {
    conceptList.innerHTML = "";
  }

  loadMoreConcepts();

  console.log("✅ AI 단어장: 필터 및 정렬 적용 완료");
}

// 더 많은 개념 로드 (페이지네이션)
function loadMoreConcepts() {
  console.log("📄 더 많은 개념 로드 중...");

  // 필터 공유 모듈을 사용하여 현재 언어 값 가져오기
  const filterManager = new VocabularyFilterManager();
  const filters = filterManager.getCurrentFilters();
  const sourceLanguage = filters.sourceLanguage || "korean";
  const targetLanguage = filters.targetLanguage || "english";

  console.log("🔍 현재 언어 설정:", { sourceLanguage, targetLanguage });

  const conceptList = document.getElementById("concept-list");
  const loadMoreBtn = document.getElementById("load-more");

  if (!conceptList) return;

  const startIndex = displayedConcepts.length;
  const endIndex = Math.min(
    startIndex + CONCEPTS_PER_PAGE,
    filteredConcepts.length
  );
  const conceptsToAdd = filteredConcepts.slice(startIndex, endIndex);

  conceptsToAdd.forEach((concept) => {
    const conceptCard = createConceptCard(
      concept,
      sourceLanguage,
      targetLanguage
    );
    conceptList.appendChild(conceptCard);
  });

  displayedConcepts.push(...conceptsToAdd);

  // 더 보기 버튼 표시/숨김
  if (loadMoreBtn) {
    loadMoreBtn.style.display =
      displayedConcepts.length < filteredConcepts.length ? "block" : "none";
  }

  console.log(
    `📊 개념 로드 완료: ${displayedConcepts.length}/${filteredConcepts.length}`
  );
}

// 개념 렌더링 (초기 로드 시)
function renderConcepts() {
  console.log("🎨 개념 렌더링 시작");

  const conceptList = document.getElementById("concept-list");
  if (!conceptList) return;

  // 필터 공유 모듈을 사용하여 현재 언어 값 가져오기
  const filterManager = new VocabularyFilterManager();
  const filters = filterManager.getCurrentFilters();
  const sourceLanguage = filters.sourceLanguage || "korean";
  const targetLanguage = filters.targetLanguage || "english";

  console.log("🔍 렌더링 언어 설정:", { sourceLanguage, targetLanguage });

  if (currentPage === 1) {
    conceptList.innerHTML = "";
  }

  displayedConcepts
    .slice((currentPage - 2) * CONCEPTS_PER_PAGE)
    .forEach((concept) => {
      const conceptCard = createConceptCard(
        concept,
        sourceLanguage,
        targetLanguage
      );
      conceptList.appendChild(conceptCard);
    });
}

// 개념 카드 생성 함수
function createConceptCard(concept, sourceLanguage, targetLanguage) {
  const card = document.createElement("div");
  card.className =
    "bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300 cursor-pointer border border-gray-200";

  // 개념 정보 추출
  const conceptInfo = concept.concept_info || {};
  const domain = conceptInfo.domain || "other";
  const category = conceptInfo.category || "other";
  const emoji = conceptInfo.unicode_emoji || conceptInfo.emoji || "📝";

  // 언어별 표현 추출
  const sourceExpr = concept.expressions?.[sourceLanguage] || {};
  const targetExpr = concept.expressions?.[targetLanguage] || {};

  // 예시 문장 추출 (대표 예문 우선, 없으면 일반 예문)
  let example = null;

  // 먼저 representative_example에서 찾기
  if (concept.representative_example) {
    const repExample = concept.representative_example;
    example = {
      source: repExample[sourceLanguage] || "",
      target: repExample[targetLanguage] || "",
    };
  }

  // representative_example이 없으면 일반 examples에서 찾기
  if (!example || (!example.source && !example.target)) {
    const examples = concept.examples || [];
    if (examples.length > 0) {
      example = examples[0];
    }
  }

  // 사용자 언어 가져오기 (현재 환경 언어 우선)
  const userLanguage =
    (typeof getCurrentUILanguage === "function"
      ? getCurrentUILanguage()
      : null) ||
    localStorage.getItem("userLanguage") ||
    "ko";

  // 색상 테마 설정
  const colorTheme = getDomainColor(domain);

  // 날짜 포맷팅
  let formattedDate = "";
  try {
    if (concept.created_at) {
      let date;
      const dateValue = concept.created_at;

      if (dateValue.toDate && typeof dateValue.toDate === "function") {
        // Firestore Timestamp 객체인 경우
        date = dateValue.toDate();
      } else if (dateValue.seconds) {
        // Firestore Timestamp 형태의 객체인 경우
        date = new Date(dateValue.seconds * 1000);
      } else {
        // 일반 Date 객체나 문자열인 경우
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

  // 도메인/카테고리 번역 (window.translateDomainCategory 사용)
  const domainCategoryText =
    typeof window.translateDomainCategory === "function"
      ? window.translateDomainCategory(domain, category, userLanguage)
      : `${domain} > ${category}`;

  card.innerHTML = `
    <div class="flex items-start justify-between mb-4" style="border-left: 4px solid ${colorTheme}">
      <div class="flex items-center space-x-3 pl-3">
        <span class="text-3xl">${emoji}</span>
        <div>
          <h3 class="text-lg font-semibold text-gray-800 mb-1">
            ${targetExpr.word || "N/A"}
          </h3>
          <p class="text-sm text-gray-500">${
            targetExpr.pronunciation || targetExpr.romanization || ""
          }</p>
        </div>
      </div>
      <span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
        ${domainCategoryText}
      </span>
    </div>
    
    <div class="border-t border-gray-200 pt-3 mt-3">
      <div class="flex items-center">
        <span class="font-medium">${sourceExpr.word || "N/A"}</span>
      </div>
      <p class="text-sm text-gray-600 mt-1 line-clamp-2" title="${
        targetExpr.definition || ""
      }">${targetExpr.definition || ""}</p>
    </div>
    
    ${
      example && (example.source || example.target)
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
        <i class="fas fa-robot mr-1 text-blue-500"></i> AI
      </span>
      <span class="flex items-center">
        <i class="fas fa-clock mr-1"></i> ${formattedDate}
      </span>
    </div>
  `;

  card.addEventListener("click", () => {
    const sourceLanguage =
      document.getElementById("source-language")?.value || "korean";
    const targetLanguage =
      document.getElementById("target-language")?.value || "english";
    showConceptModal(concept, sourceLanguage, targetLanguage);
  });

  return card;
}

// 디바운스 함수
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// 도메인 및 정렬 필터는 HTML에서 직접 정의됨 (중복 제거)

// 도메인별 색상 테마 가져오기
function getDomainColor(domain) {
  const colorMap = {
    daily: "#4B63AC",
    food: "#FF6B6B",
    travel: "#4ECDC4",
    business: "#45B7D1",
    education: "#96CEB4",
    nature: "#FECA57",
    technology: "#9C27B0",
    health: "#FF9FF3",
    sports: "#54A0FF",
    entertainment: "#5F27CD",
    culture: "#00D2D3",
    other: "#747D8C",
  };
  return colorMap[domain] || "#747D8C";
}

// 도메인 필터 언어 업데이트는 vocabulary-filter-shared.js에서 처리됨

// 언어 전환 함수는 공유 모듈로 대체됨
