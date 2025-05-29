import { loadNavbar } from "../../components/js/navbar.js";
import {
  auth,
  db,
  conceptUtils,
  supportedLanguages,
} from "../../js/firebase/firebase-init.js";
import { getActiveLanguage } from "../../utils/language-utils.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
import { showConceptModal } from "../../components/js/concept-modal.js";
import { handleAIConceptRecommendation } from "../../utils/ai-concept-utils.js";

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

// 다국어 번역 텍스트 가져오기 함수
function getTranslatedText(key) {
  return pageTranslations[userLanguage][key] || pageTranslations.en[key];
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

// 전역 함수로 내보내기
window.showConceptModal = showConceptModal;

// 모달 로드 함수
async function loadConceptViewModal() {
  try {
    const response = await fetch("../components/concept-view-modal.html");
    const html = await response.text();

    // modal-container가 없으면 생성
    let modalContainer = document.getElementById("modal-container");
    if (!modalContainer) {
      modalContainer = document.createElement("div");
      modalContainer.id = "modal-container";
      document.body.appendChild(modalContainer);
    }

    modalContainer.innerHTML = html;
    console.log("개념 모달 로드 완료");
  } catch (error) {
    console.error("개념 모달 로드 실패:", error);
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  console.log("AI 단어장 페이지 초기화 시작");

  try {
    // 사용자 언어 설정 초기화 (실패해도 계속 진행)
    try {
      await initializeUserLanguage();
      console.log("언어 초기화 완료:", userLanguage);
    } catch (error) {
      console.error("언어 초기화 실패, 기본값 사용:", error);
      userLanguage = "ko";
    }

    await loadNavbar();

    // 모달 직접 로드
    await loadConceptViewModal();

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
        console.log("사용자 로그인됨:", user.uid);
        await initializePage();
      } else {
        console.log("사용자 로그인 필요");
        alert("로그인이 필요합니다.");
        window.location.href = "../login.html";
      }
    });
  } catch (error) {
    console.error("페이지 초기화 중 오류:", error);
  }
});

function initializeEventListeners() {
  // AI 개념 추천 버튼
  const aiAddBtn = document.getElementById("ai-add-concept");
  if (aiAddBtn) {
    aiAddBtn.addEventListener("click", () => {
      if (currentUser) {
        handleAIConceptRecommendation(currentUser, db);
      }
    });
  }

  // 검색 입력
  const searchInput = document.getElementById("search-input");
  if (searchInput) {
    searchInput.addEventListener("input", debounce(handleSearch, 300));
  }

  // 언어 필터
  const sourceLanguage = document.getElementById("source-language");
  const targetLanguage = document.getElementById("target-language");
  if (sourceLanguage) sourceLanguage.addEventListener("change", handleFilter);
  if (targetLanguage) targetLanguage.addEventListener("change", handleFilter);

  // 카테고리 필터
  const categoryFilter = document.getElementById("category-filter");
  if (categoryFilter) categoryFilter.addEventListener("change", handleFilter);

  // 정렬 옵션
  const sortOption = document.getElementById("sort-option");
  if (sortOption) sortOption.addEventListener("change", handleSort);

  // 더 보기 버튼
  const loadMoreBtn = document.getElementById("load-more");
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener("click", loadMoreConcepts);
  }

  // 언어 변경 이벤트 리스너 추가
  document.addEventListener("languageChanged", async (event) => {
    console.log("언어 변경 감지:", event.detail.language);
    // 사용자 언어 설정 업데이트 (실패해도 계속 진행)
    try {
      await initializeUserLanguage();
    } catch (error) {
      console.error("언어 변경 시 초기화 실패:", error);
      userLanguage = "ko";
    }
    // 카드 재렌더링
    applyFiltersAndSort();
  });
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
    console.log("개념 로드 시작");
    allConcepts = await conceptUtils.getUserConcepts(currentUser.uid);
    console.log("로드된 개념 수:", allConcepts.length);
    console.log("로드된 개념 샘플:", allConcepts.slice(0, 2));

    // 로컬 환경에서는 모든 개념 표시, 실제 환경에서는 AI 생성 개념만 표시
    if (isLocalEnvironment) {
      console.log("로컬 환경: 모든 개념 표시");
    } else {
      // AI 생성 개념만 필터링
      const originalCount = allConcepts.length;
      allConcepts = allConcepts.filter(
        (concept) => concept.isAIGenerated === true
      );
      console.log(
        `AI 생성 개념 필터링: ${originalCount} -> ${allConcepts.length}`
      );
    }

    updateConceptCount();
  } catch (error) {
    console.error("개념 로드 중 오류:", error);
    allConcepts = [];
  }
}

function updateConceptCount() {
  const countElement = document.getElementById("concept-count");
  if (countElement) {
    countElement.textContent = allConcepts.length;
  }
}

async function updateUsageDisplay() {
  try {
    const usage = await conceptUtils.getUsage(currentUser.uid);
    const usageText = document.getElementById("ai-usage-text");
    const usageBar = document.getElementById("ai-usage-bar");

    if (usageText && usageBar) {
      const aiUsed = usage.aiUsed || 0;
      const aiLimit = usage.aiLimit || 100;
      const percentage = Math.min((aiUsed / aiLimit) * 100, 100);

      usageText.textContent = `${aiUsed}/${aiLimit}`;
      usageBar.style.width = `${percentage}%`;
    }
  } catch (error) {
    console.error("사용량 표시 업데이트 중 오류:", error);
  }
}

function handleSearch() {
  applyFiltersAndSort();
}

function handleFilter() {
  applyFiltersAndSort();
}

function handleSort() {
  applyFiltersAndSort();
}

function applyFiltersAndSort() {
  const searchTerm =
    document.getElementById("search-input")?.value.toLowerCase() || "";
  const sourceLanguage =
    document.getElementById("source-language")?.value || "korean";
  const targetLanguage =
    document.getElementById("target-language")?.value || "english";
  const category = document.getElementById("category-filter")?.value || "all";
  const sortOption = document.getElementById("sort-option")?.value || "latest";

  console.log("필터링 적용:", {
    searchTerm,
    sourceLanguage,
    targetLanguage,
    category,
    sortOption,
  });
  console.log("전체 개념 수:", allConcepts.length);

  // 필터링
  filteredConcepts = allConcepts.filter((concept) => {
    // 검색어 필터
    if (searchTerm) {
      const searchInExpressions = Object.values(concept.expressions || {}).some(
        (expr) =>
          expr.word?.toLowerCase().includes(searchTerm) ||
          expr.definition?.toLowerCase().includes(searchTerm) ||
          expr.pronunciation?.toLowerCase().includes(searchTerm)
      );

      const searchInCategory = concept.concept_info?.category
        ?.toLowerCase()
        .includes(searchTerm);
      const searchInDomain = concept.concept_info?.domain
        ?.toLowerCase()
        .includes(searchTerm);

      if (!searchInExpressions && !searchInCategory && !searchInDomain) {
        return false;
      }
    }

    // 카테고리 필터
    if (category !== "all" && concept.concept_info?.category !== category) {
      return false;
    }

    // 언어 필터 (원본 언어와 대상 언어에 해당하는 표현이 있는지 확인)
    const hasSourceLang = concept.expressions?.[sourceLanguage]?.word;
    const hasTargetLang = concept.expressions?.[targetLanguage]?.word;

    return hasSourceLang && hasTargetLang;
  });

  console.log("필터링 후 개념 수:", filteredConcepts.length);

  // 정렬
  filteredConcepts.sort((a, b) => {
    switch (sortOption) {
      case "latest":
        return (
          new Date(b.createdAt || b.created_at || 0) -
          new Date(a.createdAt || a.created_at || 0)
        );
      case "oldest":
        return (
          new Date(a.createdAt || a.created_at || 0) -
          new Date(b.createdAt || b.created_at || 0)
        );
      case "a-z":
        const aWord = a.expressions?.[sourceLanguage]?.word || "";
        const bWord = b.expressions?.[sourceLanguage]?.word || "";
        return aWord.localeCompare(bWord);
      case "z-a":
        const aWordRev = a.expressions?.[sourceLanguage]?.word || "";
        const bWordRev = b.expressions?.[sourceLanguage]?.word || "";
        return bWordRev.localeCompare(aWordRev);
      default:
        return 0;
    }
  });

  // 필터된 개념 수 업데이트
  const filteredCountElement = document.getElementById("filtered-count");
  if (filteredCountElement) {
    filteredCountElement.textContent = filteredConcepts.length;
  }

  // 페이지 리셋 및 표시
  currentPage = 1;
  displayedConcepts = [];
  loadMoreConcepts();
}

function loadMoreConcepts() {
  const startIndex = (currentPage - 1) * CONCEPTS_PER_PAGE;
  const endIndex = startIndex + CONCEPTS_PER_PAGE;
  const newConcepts = filteredConcepts.slice(startIndex, endIndex);

  displayedConcepts = [...displayedConcepts, ...newConcepts];
  renderConcepts();

  currentPage++;

  // 더 보기 버튼 표시/숨김
  const loadMoreBtn = document.getElementById("load-more");
  if (loadMoreBtn) {
    if (endIndex >= filteredConcepts.length) {
      loadMoreBtn.classList.add("hidden");
    } else {
      loadMoreBtn.classList.remove("hidden");
    }
  }
}

function renderConcepts() {
  const conceptList = document.getElementById("concept-list");
  if (!conceptList) return;

  const sourceLanguage =
    document.getElementById("source-language")?.value || "korean";
  const targetLanguage =
    document.getElementById("target-language")?.value || "english";

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
    "bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-transform duration-300 border border-gray-200 cursor-pointer word-card";

  const sourceExpr = concept.expressions?.[sourceLanguage] || {};
  const targetExpr = concept.expressions?.[targetLanguage] || {};
  const emoji = concept.concept_info?.emoji || "📝";
  const category = concept.concept_info?.category || "기타";
  const domain = concept.concept_info?.domain || "";

  // 예문 찾기 (첫 번째 예문의 해당 언어 표현)
  const example =
    concept.examples && concept.examples.length > 0
      ? concept.examples[0]
      : null;
  const sourceExample = example?.[sourceLanguage];
  const targetExample = example?.[targetLanguage];

  card.innerHTML = `
    <div class="mb-4 flex justify-between items-start">
      <div>
        <h2 class="text-xl font-bold">${emoji} ${sourceExpr.word || "N/A"}</h2>
        <p class="text-sm text-gray-500">${sourceExpr.pronunciation || ""}</p>
      </div>
      <span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
        ${domain}${domain && category ? "/" : ""}${category}
      </span>
    </div>
    
    <div class="border-t border-gray-200 pt-3 mt-3">
      <div class="flex items-center">
        <span class="text-gray-500 text-sm mr-2">${getTranslatedText(
          "meaning"
        )}</span>
        <span class="font-medium">${targetExpr.word || ""}</span>
      </div>
      <p class="text-sm text-gray-600 mt-1">${
        targetExpr.definition || sourceExpr.definition || ""
      }</p>
    </div>
    
    ${
      sourceExample && targetExample
        ? `
    <div class="border-t border-gray-200 pt-3 mt-3">
      <p class="text-xs text-gray-500 mb-1">${getTranslatedText("examples")}</p>
      <p class="text-sm mb-1">${sourceExample}</p>
      <p class="text-sm text-gray-600">${targetExample}</p>
    </div>
    `
        : ""
    }
    
    <div class="flex justify-between text-xs text-gray-500 mt-3">
      <span class="flex items-center">
        <i class="fas fa-robot mr-1 text-blue-500"></i> ${getTranslatedText(
          "ai_generated"
        )}
      </span>
      <span class="flex items-center">
        <i class="fas fa-clock mr-1"></i> ${
          concept.createdAt || concept.created_at
            ? new Date(
                concept.createdAt || concept.created_at
              ).toLocaleDateString("ko-KR", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
              })
            : ""
        }
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
