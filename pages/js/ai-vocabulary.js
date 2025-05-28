import { loadNavbar } from "../../components/js/navbar.js";
import {
  auth,
  db,
  conceptUtils,
  supportedLanguages,
} from "../../js/firebase/firebase-init.js";
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

function createConceptCard(concept, sourceLanguage, targetLanguage) {
  const card = document.createElement("div");
  card.className =
    "word-card bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-all duration-300";

  const sourceExpr = concept.expressions?.[sourceLanguage] || {};
  const targetExpr = concept.expressions?.[targetLanguage] || {};
  const emoji = concept.concept_info?.emoji || "📝";
  const category = concept.concept_info?.category || "기타";

  card.innerHTML = `
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center space-x-3">
        <span class="text-3xl">${emoji}</span>
        <span class="text-xl font-bold text-gray-800">${
          sourceExpr.word || "N/A"
        }</span>
      </div>
      <span class="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">${category}</span>
    </div>
    <div class="space-y-2">
      <div class="text-sm text-gray-500">${sourceExpr.pronunciation || ""}</div>
      <div class="text-lg text-gray-600">${targetExpr.word || "N/A"}</div>
      <div class="text-sm text-gray-700 line-clamp-2">${
        targetExpr.definition || sourceExpr.definition || ""
      }</div>
    </div>
    <div class="mt-4 flex items-center justify-between">
      <span class="text-xs text-gray-400">
        ${
          concept.createdAt || concept.created_at
            ? new Date(
                concept.createdAt || concept.created_at
              ).toLocaleDateString()
            : ""
        }
      </span>
      <div class="flex items-center space-x-1">
        <i class="fas fa-robot text-blue-500 text-xs"></i>
        <span class="text-xs text-blue-500">AI</span>
      </div>
    </div>
  `;

  card.addEventListener("click", () => {
    showConceptModal(concept);
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
