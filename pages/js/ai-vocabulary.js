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
    meaning: "Meaning",
    examples: "Examples",
    ai_generated: "AI Generated",
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
    meaning: "意味",
    examples: "例文",
    ai_generated: "AI生成",
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
    meaning: "意思",
    examples: "例句",
    ai_generated: "AI生成",
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

// 다국어 번역 텍스트 가져오기 함수
function getTranslatedText(key) {
  return pageTranslations[userLanguage][key] || pageTranslations.en[key] || key;
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
    console.log("개념 보기 모달 로드 완료");
  } catch (error) {
    console.error("개념 보기 모달 로드 실패:", error);
  }
}

// AI 개념 편집 모달 로드
async function loadEditConceptModal() {
  try {
    const response = await fetch("../components/edit-concept-modal.html");
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
    console.log("AI 개념 편집 모달 로드 완료");

    // 편집 모달 스크립트 로드
    const editModalScript = document.createElement("script");
    editModalScript.type = "module";
    editModalScript.src = "../components/js/edit-concept-modal.js";
    document.head.appendChild(editModalScript);
    console.log("AI 개념 편집 모달 스크립트 로드 완료");
  } catch (error) {
    console.error("AI 개념 편집 모달 로드 실패:", error);
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

    // 모달들 직접 로드
    await loadConceptViewModal();
    await loadEditConceptModal();

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

  // 언어 전환 버튼
  const swapLanguagesBtn = document.getElementById("swap-languages");
  if (swapLanguagesBtn) {
    swapLanguagesBtn.addEventListener("click", () => {
      swapLanguages();
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

  // AI 개념 수정 완료 이벤트 리스너 추가
  document.addEventListener("concept-saved", async (event) => {
    console.log("🔔 AI 개념 수정 완료 이벤트 감지");
    try {
      // AI 개념 목록 다시 로드
      await loadConcepts();
      // 필터 및 정렬 다시 적용
      applyFiltersAndSort();
      console.log("✅ AI 개념 목록 업데이트 완료");
    } catch (error) {
      console.error("❌ AI 개념 목록 업데이트 실패:", error);
    }
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
    console.log("AI 개념 로드 시작");
    // ai-recommend 컬렉션에서 사용자의 AI 개념 가져오기
    allConcepts = await conceptUtils.getUserAIConcepts(currentUser.email);
    console.log("로드된 AI 개념 수:", allConcepts.length);
    console.log("로드된 AI 개념 샘플:", allConcepts.slice(0, 2));

    updateConceptCount();
  } catch (error) {
    console.error("AI 개념 로드 중 오류:", error);
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
    // 기존 users 컬렉션의 사용량 관리 사용
    const usage = await conceptUtils.getUsage(currentUser.uid);
    const usageText = document.getElementById("ai-usage-text");
    const usageBar = document.getElementById("ai-usage-bar");

    if (usageText && usageBar) {
      const aiUsed = usage.aiUsed || 0;
      const aiLimit = usage.aiLimit || 100;
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
        const aWord = a.expressions?.[targetLanguage]?.word || "";
        const bWord = b.expressions?.[targetLanguage]?.word || "";
        return aWord.localeCompare(bWord);
      case "z-a":
        const targetLanguageRev =
          document.getElementById("target-language")?.value || "english";
        const aWordRev = a.expressions?.[targetLanguageRev]?.word || "";
        const bWordRev = b.expressions?.[targetLanguageRev]?.word || "";
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

  // 새로운 구조에서 이모지와 정보 가져오기
  const emoji =
    concept.concept_info?.unicode_emoji || concept.concept_info?.emoji || "📝";
  const category = concept.concept_info?.category || "기타";
  const domain = concept.concept_info?.domain || "";
  const colorTheme = concept.concept_info?.color_theme || "#9C27B0";

  // 예문 찾기 (새로운 구조 우선, 기존 구조 fallback)
  let example = null;
  if (concept.featured_examples && concept.featured_examples.length > 0) {
    const firstExample = concept.featured_examples[0];
    if (firstExample.translations) {
      example = {
        source: firstExample.translations[sourceLanguage]?.text || "",
        target: firstExample.translations[targetLanguage]?.text || "",
      };
    }
  }
  // 기존 구조의 examples도 지원
  else if (concept.examples && concept.examples.length > 0) {
    const firstExample = concept.examples[0];
    example = {
      source: firstExample[sourceLanguage] || "",
      target: firstExample[targetLanguage] || "",
    };
  }

  // 날짜 포맷팅 개선
  let formattedDate = "";
  try {
    const dateValue = concept.created_at || concept.createdAt;
    if (dateValue) {
      let date;
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

  card.innerHTML = `
    <div class="mb-4 flex justify-between items-start" style="border-left: 4px solid ${colorTheme}; padding-left: 12px;">
      <div>
        <h2 class="text-xl font-bold">${emoji} ${targetExpr.word || "N/A"}</h2>
        <p class="text-sm text-gray-500">${
          targetExpr.pronunciation || targetExpr.romanization || ""
        }</p>
      </div>
      <span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
        ${getTranslatedText(domain)}${
    domain && category ? "/" : ""
  }${getTranslatedText(category)}
      </span>
    </div>
    
    <div class="border-t border-gray-200 pt-3 mt-3">
      <div class="flex items-center">
        <span class="font-medium">${sourceExpr.word || ""}</span>
      </div>
      <p class="text-sm text-gray-600 mt-1">${
        sourceExpr.definition || targetExpr.definition || ""
      }</p>
    </div>
    
    ${
      example && (example.source || example.target)
        ? `
    <div class="border-t border-gray-200 pt-3 mt-3">
      ${example.target ? `<p class="text-sm mb-1">${example.target}</p>` : ""}
      ${
        example.source
          ? `<p class="text-sm text-gray-600">${example.source}</p>`
          : ""
      }
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
      ${
        formattedDate
          ? `
      <span class="flex items-center">
        <i class="fas fa-clock mr-1"></i> ${formattedDate}
      </span>
      `
          : ""
      }
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

// 언어 전환 함수
function swapLanguages() {
  const sourceLanguageElement = document.getElementById("source-language");
  const targetLanguageElement = document.getElementById("target-language");
  const swapButton = document.getElementById("swap-languages");

  if (!sourceLanguageElement || !targetLanguageElement || !swapButton) {
    console.error("언어 전환 요소를 찾을 수 없습니다.");
    return;
  }

  const sourceLanguage = sourceLanguageElement.value;
  const targetLanguage = targetLanguageElement.value;

  // 같은 언어인 경우 전환하지 않음
  if (sourceLanguage === targetLanguage) {
    return;
  }

  // 버튼 애니메이션 효과
  const icon = swapButton.querySelector("i");

  // 회전 애니메이션 추가
  icon.style.transform = "rotate(180deg)";
  icon.style.transition = "transform 0.3s ease";

  // 언어 순서 변경
  sourceLanguageElement.value = targetLanguage;
  targetLanguageElement.value = sourceLanguage;

  // 버튼 색상 변경으로 피드백 제공
  swapButton.classList.add("text-[#4B63AC]", "bg-gray-100");

  // 필터 및 정렬 다시 적용
  applyFiltersAndSort();

  // 애니메이션 후 원래 상태로 복원
  setTimeout(() => {
    icon.style.transform = "rotate(0deg)";
    swapButton.classList.remove("text-[#4B63AC]", "bg-gray-100");
  }, 300);
}
