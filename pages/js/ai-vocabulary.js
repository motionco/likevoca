import { loadNavbar } from "../../components/js/navbar.js";
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
  VocabularyFilterManager,
  VocabularyFilterProcessor,
  setupVocabularyFilters,
} from "../../utils/vocabulary-filter-shared.js";

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
    daily: "일상",
    food: "음식",
    travel: "여행",
    business: "비즈니스",
    academic: "학술",
    nature: "자연",
    technology: "기술",
    health: "건강",
    sports: "스포츠",
    entertainment: "엔터테인먼트",
    culture: "문화",
    education: "교육",
    other: "기타",
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
    daily: "Daily Life",
    food: "Food",
    travel: "Travel",
    business: "Business",
    academic: "Academic",
    nature: "Nature",
    technology: "Technology",
    health: "Health",
    sports: "Sports",
    entertainment: "Entertainment",
    culture: "Culture",
    education: "Education",
    other: "Other",
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
    daily: "日常",
    food: "食べ物",
    travel: "旅行",
    business: "ビジネス",
    academic: "学術",
    nature: "自然",
    technology: "技術",
    health: "健康",
    sports: "スポーツ",
    entertainment: "エンターテインメント",
    culture: "文化",
    education: "教育",
    other: "その他",
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
    daily: "日常",
    food: "食物",
    travel: "旅行",
    business: "商务",
    academic: "学术",
    nature: "自然",
    technology: "技术",
    health: "健康",
    sports: "体育",
    entertainment: "娱乐",
    culture: "文化",
    education: "教育",
    other: "其他",
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
    const response = await fetch("../components/ai-edit-concept-modal.html");
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
    editModalScript.src = "../components/js/ai-edit-concept-modal.js";
    editModalScript.onload = () => {};
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
        await initializePage();
      } else {
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

  // 언어 전환 버튼 (공유 모듈의 swapLanguages 사용)
  const swapLanguagesBtn = document.getElementById("swap-languages");
  if (swapLanguagesBtn) {
    swapLanguagesBtn.addEventListener("click", () => {
      filterManager.swapLanguages();
      applyFiltersAndSort();
    });
  }

  // 필터 공유 모듈을 사용하여 이벤트 리스너 설정
  const filterManager = setupVocabularyFilters(() => {
    // 필터 변경 시 실행될 콜백 함수
    applyFiltersAndSort();
  });

  // 더 보기 버튼
  const loadMoreBtn = document.getElementById("load-more");
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener("click", loadMoreConcepts);
  }

  // 언어 변경 이벤트 리스너 추가
  document.addEventListener("languageChanged", async (event) => {
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

// 필터 관련 함수들은 공유 모듈로 대체됨

function applyFiltersAndSort() {
  // 필터 공유 모듈을 사용하여 현재 필터 값들 가져오기
  const filterManager = new VocabularyFilterManager();
  const filters = filterManager.getCurrentFilters();

  // 필터 공유 모듈을 사용하여 필터링 및 정렬 수행
  filteredConcepts = VocabularyFilterProcessor.processFilters(
    allConcepts,
    filters
  );

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

  // 예문 찾기 (다국어 단어장과 동일한 구조)
  let example = null;

  // 1. 대표 예문 확인 (다국어 단어장 구조)
  if (concept.representative_example?.translations) {
    example = {
      source: concept.representative_example.translations[sourceLanguage] || "",
      target: concept.representative_example.translations[targetLanguage] || "",
    };
  }
  // 2. 기존 구조 호환성 (분리된 컬렉션 구조)
  else if (concept.representative_example) {
    example = {
      source: concept.representative_example[sourceLanguage] || "",
      target: concept.representative_example[targetLanguage] || "",
    };
  }
  // 3. 추가 예문들 확인
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
        ${getTranslatedText(domain)}${
    domain && category ? "/" : ""
  }${getTranslatedText(category)}
      </span>
    </div>
    
    <div class="border-t border-gray-200 pt-3 mt-3">
      <div class="flex items-center">
        <span class="font-medium">${sourceExpr.word || "N/A"}</span>
      </div>
      <p class="text-sm text-gray-600 mt-1">${targetExpr.definition || ""}</p>
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
        <i class="fas fa-robot mr-1 text-blue-500"></i> ${getTranslatedText(
          "ai_generated"
        )}
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

// 언어 전환 함수는 공유 모듈로 대체됨
