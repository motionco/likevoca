// grammar-learning.js - 완전히 새로 작성된 파일

// Firebase import
import {
  auth,
  db,
  collection,
  getDocs,
  query,
  limit,
  onAuthStateChanged,
  where,
  orderBy,
} from "../../js/firebase/firebase-init.js";

// 전역 변수
let currentUser = null;
let currentData = [];
let currentIndex = 0;
let currentLearningArea = null;
let currentLearningMode = null;

// 언어 설정 변수
let sourceLanguage = "korean";
let targetLanguage = "english";
let currentUILanguage = "korean";

// 네비게이션 중복 실행 방지
let isNavigating = false;

// Firebase 초기화 대기 함수 수정
async function waitForFirebaseInit() {
  let attempts = 0;
  const maxAttempts = 100; // 10초 대기

  while (attempts < maxAttempts) {
    if (window.firebaseInit && window.firebaseInit.db) {
      console.log("✅ Firebase 초기화 확인됨");
      return true;
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
    attempts++;
  }

  console.error("❌ Firebase 초기화 대기 시간 초과");
  return false;
}

// DOM 로드 완료 시 초기화
document.addEventListener("DOMContentLoaded", function () {
  console.log("📚 학습 페이지 초기화");

  // Firebase 인증 확인
  onAuthStateChanged(auth, (user) => {
    if (user) {
      currentUser = user;
      console.log("👤 사용자 로그인됨:", user.email);
    } else {
      console.log("❌ 사용자 로그인되지 않음");
    }
  });

  // 언어 설정 초기화
  initializeLanguageSettings();
  setupEventListeners();

  // 네비게이션바 로드 후 초기화
  setTimeout(() => {
    showAreaSelection();
  }, 100);
});

// 전역 함수들 노출
window.showAreaSelection = showAreaSelection;
window.showLearningModes = showLearningModes;

function initializeLanguageSettings() {
  // 언어 설정 초기화
  if (!window.languageSettings) {
    window.languageSettings = {
      sourceLanguage: sessionStorage.getItem("sourceLanguage") || "korean",
      targetLanguage: sessionStorage.getItem("targetLanguage") || "english",
      currentUILanguage:
        sessionStorage.getItem("currentUILanguage") || "korean",
    };
  }

  // 전역 변수 업데이트
  sourceLanguage = window.languageSettings.sourceLanguage;
  targetLanguage = window.languageSettings.targetLanguage;
  currentUILanguage = window.languageSettings.currentUILanguage;

  console.log("🌐 언어 설정 초기화:", {
    sourceLanguage,
    targetLanguage,
    currentUILanguage,
  });
}

// 필터 변경 핸들러
function handleFilterChange() {
  console.log("🔍 필터 변경 감지");

  // 현재 학습 중인 경우 데이터 다시 로드
  if (currentLearningArea && currentLearningMode) {
    console.log("🔄 필터 변경으로 인한 데이터 재로드");
    currentIndex = 0; // 인덱스 초기화
    startLearningMode(currentLearningArea, currentLearningMode);
  }
}

// 현재 필터 설정 가져오기
function getCurrentFilters() {
  const domainFilter = document.getElementById("domain-filter");
  const difficultyFilter = document.getElementById("difficulty-level");
  const patternTypeFilter = document.getElementById("pattern-type");

  return {
    domain: domainFilter ? domainFilter.value : "all",
    difficulty: difficultyFilter ? difficultyFilter.value : "all",
    patternType: patternTypeFilter ? patternTypeFilter.value : "all",
  };
}

// 데이터에 필터 적용
function applyFilters(data) {
  const filters = getCurrentFilters();
  console.log("🔍 필터 적용:", filters);
  console.log("🔍 원본 데이터 샘플:", data.slice(0, 3));

  // 정의된 도메인 목록
  const definedDomains = [
    "daily",
    "business",
    "academic",
    "travel",
    "food",
    "nature",
    "technology",
    "health",
    "sports",
    "entertainment",
    "other",
  ];

  const filteredData = data.filter((item) => {
    console.log("🔍 아이템 검사:", {
      id: item.id,
      domain: item.domain,
      difficulty: item.difficulty,
      pattern_type: item.pattern_type,
      concept_info: item.concept_info,
    });

    // 도메인 필터 - 여러 가능한 필드 확인
    if (filters.domain !== "all") {
      let itemDomain = item.domain || item.concept_info?.domain || "other";

      // general 도메인이나 정의되지 않은 도메인을 other로 매핑
      if (itemDomain === "general" || !definedDomains.includes(itemDomain)) {
        itemDomain = "other";
        console.log(`🔍 도메인 매핑: ${item.domain || "undefined"} → other`);
      }

      if (itemDomain !== filters.domain) {
        console.log(
          `🔍 도메인 필터로 제외: ${itemDomain} !== ${filters.domain}`
        );
        return false;
      }
    }

    // 난이도 필터
    if (filters.difficulty !== "all") {
      const itemDifficulty =
        item.difficulty || item.concept_info?.difficulty || "beginner";
      if (itemDifficulty !== filters.difficulty) {
        console.log(
          `🔍 난이도 필터로 제외: ${itemDifficulty} !== ${filters.difficulty}`
        );
        return false;
      }
    }

    // 패턴 유형 필터 (문법 패턴에만 적용)
    if (filters.patternType !== "all" && item.pattern_type) {
      if (item.pattern_type !== filters.patternType) {
        console.log(
          `🔍 패턴 유형 필터로 제외: ${item.pattern_type} !== ${filters.patternType}`
        );
        return false;
      }
    }

    console.log("🔍 필터 통과:", item.id);
    return true;
  });

  console.log(`🔍 필터링 결과: ${data.length}개 → ${filteredData.length}개`);
  return filteredData;
}

function handleLanguageChange() {
  // 언어 버튼 변경 감지
  document.addEventListener("languageChanged", (event) => {
    console.log("🌐 언어 변경 감지:", event.detail);

    // 언어 설정 업데이트
    if (event.detail.sourceLanguage) {
      sourceLanguage = event.detail.sourceLanguage;
      window.languageSettings.sourceLanguage = sourceLanguage;
      sessionStorage.setItem("sourceLanguage", sourceLanguage);
    }

    if (event.detail.targetLanguage) {
      targetLanguage = event.detail.targetLanguage;
      window.languageSettings.targetLanguage = targetLanguage;
      sessionStorage.setItem("targetLanguage", targetLanguage);
    }

    if (event.detail.currentUILanguage) {
      currentUILanguage = event.detail.currentUILanguage;
      window.languageSettings.currentUILanguage = currentUILanguage;
      sessionStorage.setItem("currentUILanguage", currentUILanguage);
    }

    // 현재 학습 중인 경우 데이터 다시 로드
    if (currentLearningArea && currentLearningMode) {
      console.log("🔄 언어 변경으로 인한 데이터 재로드");
      startLearningMode(currentLearningArea, currentLearningMode);
    }
  });
}

function setupEventListeners() {
  // 기존 이벤트 리스너들 제거
  document.removeEventListener("click", globalClickHandler);

  // 필터 이벤트 리스너 추가
  const domainFilter = document.getElementById("domain-filter");
  const difficultyFilter = document.getElementById("difficulty-level");
  const patternTypeFilter = document.getElementById("pattern-type");

  if (domainFilter) {
    domainFilter.addEventListener("change", handleFilterChange);
  }
  if (difficultyFilter) {
    difficultyFilter.addEventListener("change", handleFilterChange);
  }
  if (patternTypeFilter) {
    patternTypeFilter.addEventListener("change", handleFilterChange);
  }

  // 네비게이션 버튼들 - 개별 이벤트 리스너만 사용
  const prevBtn = document.getElementById("prev-grammar");
  const nextBtn = document.getElementById("next-grammar");

  if (prevBtn) {
    prevBtn.removeEventListener("click", prevGrammarHandler);
    prevBtn.addEventListener("click", prevGrammarHandler);
  }

  if (nextBtn) {
    nextBtn.removeEventListener("click", nextGrammarHandler);
    nextBtn.addEventListener("click", nextGrammarHandler);
  }

  // 문법 패턴 모드 버튼들
  const prevPatternBtn = document.getElementById("prev-pattern");
  const nextPatternBtn = document.getElementById("next-pattern");

  if (prevPatternBtn) {
    prevPatternBtn.removeEventListener("click", prevPatternHandler);
    prevPatternBtn.addEventListener("click", prevPatternHandler);
  }

  if (nextPatternBtn) {
    nextPatternBtn.removeEventListener("click", nextPatternHandler);
    nextPatternBtn.addEventListener("click", nextPatternHandler);
  }

  // 문법 실습 모드 버튼들
  const prevPracticeBtn = document.getElementById("prev-practice");
  const nextPracticeBtn = document.getElementById("next-practice");

  if (prevPracticeBtn) {
    prevPracticeBtn.removeEventListener("click", prevPracticeHandler);
    prevPracticeBtn.addEventListener("click", prevPracticeHandler);
  }

  if (nextPracticeBtn) {
    nextPracticeBtn.removeEventListener("click", nextPracticeHandler);
    nextPracticeBtn.addEventListener("click", nextPracticeHandler);
  }

  // 플래시카드 관련 버튼들 (단어 학습용)
  const flipCardBtn = document.getElementById("flip-card");
  if (flipCardBtn) {
    flipCardBtn.removeEventListener("click", flipCard);
    flipCardBtn.addEventListener("click", flipCard);
  }

  const prevCardBtn = document.getElementById("prev-card");
  const nextCardBtn = document.getElementById("next-card");

  if (prevCardBtn) {
    prevCardBtn.removeEventListener("click", prevCardHandler);
    prevCardBtn.addEventListener("click", prevCardHandler);
  }

  if (nextCardBtn) {
    nextCardBtn.removeEventListener("click", nextCardHandler);
    nextCardBtn.addEventListener("click", nextCardHandler);
  }

  // 독해 학습 네비게이션 버튼들
  const prevReadingBtn = document.getElementById("prev-reading");
  const nextReadingBtn = document.getElementById("next-reading");

  if (prevReadingBtn) {
    prevReadingBtn.removeEventListener("click", prevReadingHandler);
    prevReadingBtn.addEventListener("click", prevReadingHandler);
  }

  if (nextReadingBtn) {
    nextReadingBtn.removeEventListener("click", nextReadingHandler);
    nextReadingBtn.addEventListener("click", nextReadingHandler);
  }

  // 타이핑 관련 버튼들
  const checkAnswerBtn = document.getElementById("check-answer");
  if (checkAnswerBtn) {
    checkAnswerBtn.removeEventListener("click", checkTypingAnswer);
    checkAnswerBtn.addEventListener("click", checkTypingAnswer);
  }

  const nextTypingBtn = document.getElementById("next-typing");
  if (nextTypingBtn) {
    nextTypingBtn.removeEventListener("click", nextTypingHandler);
    nextTypingBtn.addEventListener("click", nextTypingHandler);
  }

  // 홈 버튼
  const homeBtn = document.getElementById("home-btn");
  if (homeBtn) {
    homeBtn.removeEventListener("click", showAreaSelection);
    homeBtn.addEventListener("click", showAreaSelection);
  }

  // 돌아가기 버튼들 설정
  const backToAreasBtn = document.getElementById("back-to-areas");
  if (backToAreasBtn) {
    backToAreasBtn.removeEventListener("click", backToAreasHandler);
    backToAreasBtn.addEventListener("click", backToAreasHandler);
  }

  // 모든 돌아가기 버튼들 설정
  const backButtons = [
    "back-from-flashcard",
    "back-from-typing",
    "back-from-grammar",
    "back-from-reading",
  ];

  backButtons.forEach((buttonId) => {
    const button = document.getElementById(buttonId);
    if (button) {
      button.removeEventListener("click", showAreaSelection);
      button.addEventListener("click", () => {
        console.log(`🔙 ${buttonId} 클릭`);
        showAreaSelection();
      });
    }
  });

  // 전역 이벤트 리스너 추가 (중복 방지)
  document.addEventListener("click", globalClickHandler);
}

// 이벤트 핸들러 함수들 정의
function prevGrammarHandler(e) {
  e.preventDefault();
  e.stopPropagation();
  console.log("⬅️ 문법 이전 버튼");
  navigateContent(-1);
}

function nextGrammarHandler(e) {
  e.preventDefault();
  e.stopPropagation();
  console.log("➡️ 문법 다음 버튼");
  navigateContent(1);
}

function prevPatternHandler(e) {
  e.preventDefault();
  e.stopPropagation();
  console.log("⬅️ 패턴 이전 버튼");
  navigateContent(-1);
}

function nextPatternHandler(e) {
  e.preventDefault();
  e.stopPropagation();
  console.log("➡️ 패턴 다음 버튼");
  navigateContent(1);
}

function prevPracticeHandler(e) {
  e.preventDefault();
  e.stopPropagation();
  console.log("⬅️ 실습 이전 버튼");
  navigateContent(-1);
}

function nextPracticeHandler(e) {
  e.preventDefault();
  e.stopPropagation();
  console.log("➡️ 실습 다음 버튼");
  navigateContent(1);
}

function prevCardHandler(e) {
  e.preventDefault();
  e.stopPropagation();
  console.log("⬅️ 카드 이전 버튼");
  navigateContent(-1);
}

function nextCardHandler(e) {
  e.preventDefault();
  e.stopPropagation();
  console.log("➡️ 카드 다음 버튼");
  navigateContent(1);
}

function prevReadingHandler(e) {
  e.preventDefault();
  e.stopPropagation();
  console.log("⬅️ 독해 이전 버튼");
  navigateContent(-1);
}

function nextReadingHandler(e) {
  e.preventDefault();
  e.stopPropagation();
  console.log("➡️ 독해 다음 버튼");
  navigateContent(1);
}

function nextTypingHandler(e) {
  e.preventDefault();
  e.stopPropagation();
  navigateContent(1);
  // 결과 숨기기
  const resultDiv = document.getElementById("typing-result");
  if (resultDiv) {
    resultDiv.classList.add("hidden");
  }
  const nextBtn = document.getElementById("next-typing");
  if (nextBtn) {
    nextBtn.classList.add("hidden");
  }
}

function backToAreasHandler(e) {
  e.preventDefault();
  e.stopPropagation();
  console.log("🔙 영역 선택으로 돌아가기");
  showAreaSelection();
}

// 전역 클릭 핸들러
function globalClickHandler(e) {
  // 홈 버튼 (중복 ID 처리)
  if (e.target.id === "home-btn" || e.target.matches(".home-btn")) {
    e.preventDefault();
    e.stopPropagation();
    console.log("🏠 홈 버튼 클릭");
    showAreaSelection();
    return;
  }

  // 문법 카드 뒤집기
  if (e.target.matches("#grammar-card, #grammar-card *")) {
    e.preventDefault();
    e.stopPropagation();
    console.log("🔄 문법 카드 뒤집기");
    flipGrammarCard();
    return;
  }

  // 독해 플래시 카드 뒤집기
  if (e.target.matches("#reading-flash-card, #reading-flash-card *")) {
    e.preventDefault();
    e.stopPropagation();
    console.log("🔄 독해 플래시 카드 뒤집기");
    flipReadingCard();
    return;
  }

  // 삭제 버튼 처리
  if (e.target.matches(".delete-btn")) {
    e.preventDefault();
    e.stopPropagation();
    const itemId = e.target.getAttribute("data-item-id");
    const itemType = e.target.getAttribute("data-item-type");
    console.log(`🗑️ 삭제 버튼 클릭: ${itemType} - ${itemId}`);
    deleteItem(itemId, itemType);
    return;
  }
}

function showAreaSelection() {
  console.log("🏠 학습 영역 선택 화면 표시");
  hideAllSections();

  const areaSelection = document.getElementById("area-selection");
  if (areaSelection) {
    areaSelection.classList.remove("hidden");
  }

  // 학습 영역 카드들에 이벤트 리스너 추가 (기존 리스너가 없을 때만)
  const areaCards = document.querySelectorAll(".learning-area-card");
  console.log(`🎯 학습 영역 카드 ${areaCards.length}개 발견`);

  if (areaCards.length === 0) {
    console.warn(
      "⚠️ 학습 영역 카드를 찾을 수 없습니다. HTML 구조를 확인해주세요."
    );
  }

  areaCards.forEach((card, index) => {
    console.log(
      `🔍 카드 ${index + 1}: data-area="${card.getAttribute("data-area")}"`
    );

    // 이미 이벤트 리스너가 있는지 확인
    if (!card.hasAttribute("data-listener-added")) {
      card.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        const area = this.getAttribute("data-area");
        console.log(`🎯 학습 영역 카드 클릭됨: ${area}`);
        if (area) {
          showLearningModes(area);
        } else {
          console.error("❌ data-area 속성이 없습니다.");
        }
      });
      card.setAttribute("data-listener-added", "true");
      console.log(`✅ 카드 ${index + 1}에 이벤트 리스너 추가됨`);
    } else {
      console.log(`⚠️ 카드 ${index + 1}에 이미 이벤트 리스너가 있습니다.`);
    }
  });
}

function showLearningModes(area) {
  console.log(`📖 학습 모드 선택 화면 표시: ${area}`);

  const modeSection = document.getElementById("mode-selection");
  const modeTitle = document.getElementById("mode-title");
  const modeContainer = document.getElementById("mode-container");
  const uploadBtn = document.getElementById("mode-upload-btn");
  const uploadTitle = document.getElementById("mode-upload-title");

  if (!modeSection || !modeTitle || !modeContainer) {
    console.error("❌ 모드 선택 요소들을 찾을 수 없음");
    alert("페이지 요소를 찾을 수 없습니다. 페이지를 새로고침해주세요.");
    return;
  }

  // 영역 선택 화면은 유지하고 모드 선택만 표시
  // hideAllSections() 대신 개별 학습 모드 섹션만 숨김
  hideLearningModeSections();

  let title = "";
  let modes = [];

  switch (area) {
    case "vocabulary":
      title = "단어 학습 모드";
      if (uploadBtn) uploadBtn.classList.remove("hidden");
      if (uploadTitle) uploadTitle.textContent = "단어 데이터 업로드";
      modes = [
        {
          id: "flashcard",
          name: "플래시카드",
          icon: "fas fa-clone",
          color: "blue",
          description: "카드를 뒤집어가며 단어와 의미 학습",
        },
        {
          id: "typing",
          name: "타이핑",
          icon: "fas fa-keyboard",
          color: "green",
          description: "듣고 정확하게 타이핑하여 스펠링 연습",
        },
        {
          id: "pronunciation",
          name: "발음 연습",
          icon: "fas fa-microphone",
          color: "purple",
          description: "음성 인식으로 정확한 발음 훈련",
        },
      ];
      break;
    case "grammar":
      title = "문법 학습 모드";
      if (uploadBtn) uploadBtn.classList.remove("hidden");
      if (uploadTitle) uploadTitle.textContent = "문법 패턴 데이터 업로드";
      modes = [
        {
          id: "pattern",
          name: "패턴 분석",
          icon: "fas fa-search",
          color: "blue",
          description: "문법 구조와 패턴을 체계적으로 학습",
        },
        {
          id: "practice",
          name: "실습 연습",
          icon: "fas fa-edit",
          color: "green",
          description: "플래시카드 방식으로 문법 패턴 연습",
        },
      ];
      break;
    case "reading":
      title = "독해 학습 모드";
      if (uploadBtn) uploadBtn.classList.remove("hidden");
      if (uploadTitle) uploadTitle.textContent = "예문 데이터 업로드";
      modes = [
        {
          id: "example",
          name: "예문 학습",
          icon: "fas fa-book-open",
          color: "blue",
          description: "예문을 통한 일반적인 독해 학습",
        },
        {
          id: "flash",
          name: "플래시 모드",
          icon: "fas fa-bolt",
          color: "purple",
          description: "플래시카드 방식으로 빠른 독해 연습",
        },
      ];
      break;
    default:
      console.error(`❌ 알 수 없는 학습 영역: ${area}`);
      return;
  }

  modeTitle.textContent = title;
  modeContainer.innerHTML = modes
    .map(
      (mode) => `
    <div class="learning-mode-card bg-gradient-to-br from-${
      mode.color
    }-500 to-${
        mode.color
      }-600 text-white p-6 rounded-lg cursor-pointer hover:from-${
        mode.color
      }-600 hover:to-${
        mode.color
      }-700 transition-all duration-300 transform hover:scale-105"
         data-area="${area}" data-mode="${mode.id}">
      <div class="flex items-center justify-center mb-4">
        <i class="${mode.icon} text-4xl"></i>
      </div>
      <div class="text-center">
      <div class="font-bold text-xl mb-2">${mode.name}</div>
        ${
          mode.description
            ? `<p class="text-sm opacity-90 leading-tight">${mode.description}</p>`
            : ""
        }
      </div>
    </div>
  `
    )
    .join("");

  console.log("🔧 모드 선택 HTML 생성 완료:", modes.length, "개 모드");
  console.log("🖥️ 모드 선택 섹션 표시...");

  modeSection.classList.remove("hidden");

  // 학습 모드 카드들에 이벤트 리스너 추가
  const modeCards = modeContainer.querySelectorAll(".learning-mode-card");
  console.log(`🎯 학습 모드 카드 ${modeCards.length}개에 이벤트 리스너 추가`);

  modeCards.forEach((card, index) => {
    const cardArea = card.getAttribute("data-area");
    const cardMode = card.getAttribute("data-mode");
    console.log(`🔍 모드 카드 ${index + 1}: ${cardArea} - ${cardMode}`);

    card.addEventListener(
      "click",
      function (e) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();

        console.log(`🎯 학습 모드 카드 직접 클릭: ${cardArea} - ${cardMode}`);

        if (cardArea && cardMode) {
          console.log(`✅ startLearningMode 호출: ${cardArea} - ${cardMode}`);
          startLearningMode(cardArea, cardMode);
        } else {
          console.error("❌ data-area 또는 data-mode 속성이 없습니다.");
        }
      },
      { capture: true }
    );

    console.log(`✅ 모드 카드 ${index + 1}에 새 이벤트 리스너 추가됨`);
  });

  console.log(
    "✅ 모드 선택 화면 표시 완료, 섹션 visible:",
    !modeSection.classList.contains("hidden")
  );
}

window.startLearningMode = async function startLearningMode(area, mode) {
  console.log(`🎯 학습 모드 시작: ${area} - ${mode}`);

  currentLearningArea = area;
  currentLearningMode = mode;

  try {
    await loadLearningData(area);

    if (!currentData || currentData.length === 0) {
      console.log("📭 학습할 데이터가 없어서 학습 모드를 시작할 수 없습니다.");
      showNoDataMessage(area);
      return;
    }

    console.log(`📚 ${currentData.length}개의 데이터로 학습 시작`);

    hideAllSections();
    currentIndex = 0;

    // 학습 모드별 분기
    switch (area) {
      case "vocabulary":
        switch (mode) {
          case "flashcard":
            showFlashcardMode();
            break;
          case "typing":
            showTypingMode();
            break;
          case "pronunciation":
            showPronunciationMode();
            break;
          default:
            console.error(`❌ 알 수 없는 단어 학습 모드: ${mode}`);
            showAreaSelection();
        }
        break;
      case "grammar":
        switch (mode) {
          case "pattern":
            showGrammarPatternMode();
            break;
          case "practice":
            showGrammarPracticeMode();
            break;
          default:
            console.error(`❌ 알 수 없는 문법 학습 모드: ${mode}`);
            showAreaSelection();
        }
        break;
      case "reading":
        switch (mode) {
          case "example":
            showReadingExampleMode();
            break;
          case "flash":
            showReadingFlashMode();
            break;
          default:
            console.error(`❌ 알 수 없는 독해 학습 모드: ${mode}`);
            showAreaSelection();
        }
        break;
      default:
        console.error(`❌ 알 수 없는 학습 영역: ${area}`);
        showAreaSelection();
    }
  } catch (error) {
    console.error("학습 모드 시작 중 오류:", error);
    alert("학습을 시작할 수 없습니다. 다시 시도해주세요.");
    showAreaSelection();
  }
};

async function loadLearningData(area) {
  console.log(
    `📚 ${area} 영역 데이터 로딩 시작 (원본: ${sourceLanguage}, 대상: ${targetLanguage})`
  );

  try {
    currentData = [];

    switch (area) {
      case "vocabulary":
        await loadVocabularyData();
        break;

      case "grammar":
        await loadGrammarData();
        break;

      case "reading":
        await loadReadingData();
        break;

      default:
        console.error(`❌ 알 수 없는 학습 영역: ${area}`);
    }

    if (currentData.length === 0) {
      showNoDataMessage(area);
    } else {
      console.log(`✅ ${area} 데이터 로딩 완료: ${currentData.length}개`);
    }
  } catch (error) {
    console.error("데이터 로딩 중 오류:", error);
    showNoDataMessage(area);
  }
}

async function loadVocabularyData() {
  console.log("🔍 단어 데이터 소스 확인...");

  // 1. sessionStorage에서 학습 데이터 확인 (가장 우선)
  try {
    const storedData = sessionStorage.getItem("learningConcepts");
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      currentData = filterDataByLanguage(parsedData);
      // 필터 적용
      currentData = applyFilters(currentData);
      console.log(
        `💾 sessionStorage에서 단어 데이터: ${currentData.length}개 (필터 적용 후)`
      );
      return;
    }
  } catch (error) {
    console.warn("sessionStorage 로드 실패:", error);
  }

  // 2. window 전역 변수들 확인
  const globalSources = ["allConcepts", "currentConcepts"];
  for (const sourceName of globalSources) {
    if (window[sourceName] && Array.isArray(window[sourceName])) {
      currentData = filterDataByLanguage(window[sourceName]);
      // 필터 적용
      currentData = applyFilters(currentData);
      console.log(
        `💾 window.${sourceName}에서 단어 데이터: ${currentData.length}개 (필터 적용 후)`
      );
      return;
    }
  }

  // 3. Firebase에서 직접 로드
  console.log("🔥 Firebase에서 단어 데이터 직접 로드 시도...");
  try {
    const conceptsRef = collection(db, "concepts");
    const q = query(conceptsRef, limit(50));
    const snapshot = await getDocs(q);

    const rawData = [];
    snapshot.forEach((doc) => {
      rawData.push({
        id: doc.id,
        concept_id: doc.id,
        ...doc.data(),
      });
    });

    currentData = filterDataByLanguage(rawData);
    // 필터 적용
    currentData = applyFilters(currentData);
    console.log(
      `🔥 Firebase에서 단어 데이터: ${currentData.length}개 (필터 적용 후)`
    );
  } catch (error) {
    console.warn("Firebase 직접 로드 실패:", error);
    currentData = [];
  }
}

async function loadGrammarData() {
  console.log("📝 문법 패턴 데이터 로딩 시작...");

  try {
    // grammar 컬렉션에서만 로드 (examples 컬렉션 사용 안함)
    const patternsRef = collection(db, "grammar");
    const patternsQuery = query(patternsRef, limit(30));
    const patternsSnapshot = await getDocs(patternsQuery);

    if (patternsSnapshot.size > 0) {
      console.log(`📝 grammar 컬렉션에서 ${patternsSnapshot.size}개 패턴 발견`);

      currentData = [];
      patternsSnapshot.forEach((doc) => {
        const data = doc.data();

        // 새 템플릿 구조에 맞게 데이터 처리
        const processedData = {
          id: doc.id,
          pattern_id: data.pattern_id || doc.id,
          pattern_name: data.pattern_name || "문법 패턴",
          pattern_type: data.pattern_type || "basic",
          difficulty: data.difficulty || "beginner",
          tags: data.tags || [],
          learning_focus: data.learning_focus || [],
          title: getLocalizedPatternTitle(data),
          structure: getLocalizedPatternStructure(data),
          explanation: getLocalizedPatternExplanation(data),
          examples: getLocalizedPatternExamples(data),
          source: "grammar", // 실제 DB 데이터 마킹
          ...data,
          // source 필드를 마지막에 다시 설정하여 덮어쓰기 방지
        };
        processedData.source = "grammar";

        currentData.push(processedData);
      });

      // 필터 적용
      currentData = applyFilters(currentData);
      console.log(
        `✅ 문법 패턴 데이터 로딩 완료: ${currentData.length}개 (필터 적용 후)`
      );
      return;
    }
  } catch (error) {
    console.warn("grammar 컬렉션 로드 실패:", error);
  }

  // DB에 데이터가 없으면 빈 배열로 설정 (메시지 표시용)
  currentData = [];
  console.log("📝 문법 패턴 DB 데이터 없음");
}

async function loadReadingData() {
  console.log("📖 독해 예문 데이터 로딩 시작...");

  try {
    // Firebase 초기화 확인
    if (!db) {
      console.error("❌ Firebase db가 초기화되지 않음");
      currentData = [];
      return;
    }

    // examples 컬렉션에서 독해용 예문들 로드
    const examplesRef = collection(db, "examples");
    let examplesQuery;
    let examplesSnapshot;

    console.log("📖 examples 컬렉션 쿼리 시작...");

    // 먼저 기본 쿼리로 시도 (order_index 없이)
    try {
      examplesQuery = query(examplesRef, limit(50));
      examplesSnapshot = await getDocs(examplesQuery);
      console.log("📖 기본 쿼리 성공");
    } catch (basicError) {
      console.error("📖 기본 쿼리 실패:", basicError);
      currentData = [];
      return;
    }

    console.log(`📖 쿼리 결과: ${examplesSnapshot.size}개 문서`);

    if (examplesSnapshot.size > 0) {
      console.log(
        `📖 examples 컬렉션에서 ${examplesSnapshot.size}개 예문 발견`
      );

      currentData = [];
      examplesSnapshot.forEach((doc) => {
        const data = doc.data();
        console.log("📖 원본 예문 데이터:", data);

        const localizedExample = getLocalizedReadingExample(data);
        console.log("📖 지역화된 예문:", localizedExample);

        if (localizedExample) {
          const processedData = {
            id: doc.id,
            example_id: data.example_id || doc.id,
            context: data.context || "general",
            difficulty: data.difficulty || "beginner",
            tags: data.tags || [],
            ...localizedExample,
            source: "examples", // 실제 DB 데이터 마킹
          };
          // source 필드를 확실히 설정
          processedData.source = "examples";
          console.log("📖 처리된 예문 데이터:", processedData);
          currentData.push(processedData);
        } else {
          console.warn("📖 예문 지역화 실패:", data);
        }
      });

      // 언어별 필터링
      const filteredData = filterDataByLanguage(currentData);
      console.log(`📖 언어 필터링 후: ${filteredData.length}개`);

      if (filteredData.length > 0) {
        currentData = filteredData;
        // 필터 적용
        currentData = applyFilters(currentData);
        console.log(
          `✅ examples에서 독해 데이터 로딩 완료: ${currentData.length}개 (필터 적용 후)`
        );
        return;
      }
    } else {
      console.log("📖 examples 컬렉션에 문서가 없음");
    }
  } catch (error) {
    console.error("📖 examples 컬렉션 로드 실패:", error);
  }

  // DB에 데이터가 없으면 빈 배열로 설정 (메시지 표시용)
  currentData = [];
  console.log(
    "📖 독해 예문 DB 데이터 없음 - 최종 currentData.length:",
    currentData.length
  );
}

function showNoDataMessage(area) {
  const messageMap = {
    vocabulary: "단어",
    grammar: "문법 패턴",
    reading: "독해 예문",
  };

  const dataType = messageMap[area] || "학습";

  hideAllSections();
  const noDataSection = document.getElementById("no-data-message");
  if (noDataSection) {
    noDataSection.classList.remove("hidden");
    const messageElement = noDataSection.querySelector("p");
    if (messageElement) {
      messageElement.textContent = `${dataType} 데이터가 없습니다. 먼저 데이터를 업로드해주세요.`;
    }
  } else {
    alert(`${dataType} 데이터가 없습니다. 먼저 데이터를 업로드해주세요.`);
    showAreaSelection();
  }
}

function hideAllSections() {
  const sections = [
    "area-selection",
    "mode-selection",
    "flashcard-container",
    "typing-container",
    "grammar-container",
    "reading-container",
    "flashcard-mode",
    "typing-mode",
    "pronunciation-mode",
    "grammar-pattern-mode",
    "grammar-practice-mode",
    "reading-mode",
    "no-data-message",
  ];

  sections.forEach((sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.classList.add("hidden");
    } else {
      console.log(`⚠️ 섹션을 찾을 수 없음: ${sectionId}`);
    }
  });
}

function hideLearningModeSections() {
  // 학습 모드 섹션들만 숨김 (영역 선택과 모드 선택은 유지)
  const learningModeSections = [
    "flashcard-container",
    "typing-container",
    "grammar-container",
    "reading-container",
    "flashcard-mode",
    "typing-mode",
    "pronunciation-mode",
    "grammar-pattern-mode",
    "grammar-practice-mode",
    "reading-mode",
    "no-data-message",
  ];

  learningModeSections.forEach((sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.classList.add("hidden");
    }
  });
}

function showFlashcardMode() {
  console.log("🃏 플래시카드 모드 시작");
  const flashcardMode = document.getElementById("flashcard-container");
  if (flashcardMode) {
    flashcardMode.classList.remove("hidden");
    updateFlashcard();

    // 플래시카드 클릭 이벤트 추가 (기존 리스너 제거 후 새로 추가)
    const flashcard = document.querySelector(".flip-card");
    if (flashcard) {
      // 기존 리스너 제거
      flashcard.removeEventListener("click", flipCard);
      // 새 리스너 추가
      flashcard.addEventListener("click", (e) => {
        // 버튼이 아닌 경우만 뒤집기
        if (!e.target.matches("button, .btn")) {
          e.preventDefault();
          e.stopPropagation();
          flipCard();
        }
      });
    }

    // 플래시카드 버튼들 이벤트 리스너 재설정
    setTimeout(() => {
      const flipBtn = document.getElementById("flip-card");
      const prevBtn = document.getElementById("prev-card");
      const nextBtn = document.getElementById("next-card");

      if (flipBtn) {
        flipBtn.removeEventListener("click", flipCard);
        flipBtn.addEventListener("click", flipCard);
      }

      if (prevBtn) {
        prevBtn.removeEventListener("click", () => navigateContent(-1));
        prevBtn.addEventListener("click", () => navigateContent(-1));
      }

      if (nextBtn) {
        nextBtn.removeEventListener("click", () => navigateContent(1));
        nextBtn.addEventListener("click", () => navigateContent(1));
      }
    }, 100);
  } else {
    console.error("❌ 플래시카드 모드 요소를 찾을 수 없음");
    alert("플래시카드 모드를 시작할 수 없습니다.");
    showAreaSelection();
  }
}

function updateFlashcard() {
  if (!currentData || currentData.length === 0) return;

  const concept = currentData[currentIndex];

  // 최신 언어 설정 사용
  const currentSourceLanguage =
    window.languageSettings?.sourceLanguage || sourceLanguage || "korean";
  const currentTargetLanguage =
    window.languageSettings?.targetLanguage || targetLanguage || "english";

  console.log("🔄 플래시카드 업데이트:", {
    conceptId: concept.id,
    sourceLanguage: currentSourceLanguage,
    targetLanguage: currentTargetLanguage,
    concept: concept,
  });

  // 언어별 표현 가져오기
  const sourceExpression = concept.expressions?.[currentSourceLanguage];
  const targetExpression = concept.expressions?.[currentTargetLanguage];

  if (!sourceExpression || !targetExpression) {
    console.warn("⚠️ 언어별 표현을 찾을 수 없음:", {
      concept,
      sourceLanguage: currentSourceLanguage,
      targetLanguage: currentTargetLanguage,
      sourceExpression,
      targetExpression,
    });
    return;
  }

  // 앞면 업데이트
  const frontWord = document.getElementById("front-word");
  const frontPronunciation = document.getElementById("front-pronunciation");

  if (frontWord) frontWord.textContent = sourceExpression.word || "";
  if (frontPronunciation) {
    frontPronunciation.textContent = sourceExpression.pronunciation || "";
  }

  // 뒷면 업데이트
  const backWord = document.getElementById("back-word");
  const backPronunciation = document.getElementById("back-pronunciation");
  const backMeaning = document.getElementById("back-meaning");

  if (backWord) backWord.textContent = targetExpression.word || "";
  if (backPronunciation) {
    backPronunciation.textContent = targetExpression.pronunciation || "";
  }
  if (backMeaning) backMeaning.textContent = targetExpression.meaning || "";

  // 이모지와 카테고리 업데이트 - 다양한 필드에서 이모지 찾기
  const frontEmoji = document.getElementById("front-emoji");
  const backEmoji = document.getElementById("back-emoji");
  const backCategory = document.getElementById("back-category");

  // 이모지 우선순위: concept_info.unicode_emoji > emoji > representative_emoji > 기본값
  const emoji =
    concept.concept_info?.unicode_emoji ||
    concept.concept_info?.emoji ||
    concept.emoji ||
    concept.representative_emoji ||
    "📝";

  const category =
    concept.concept_info?.category ||
    concept.category ||
    concept.main_category ||
    "일반";

  console.log("🎨 이모지 및 카테고리 설정:", {
    emoji,
    category,
    concept_info: concept.concept_info,
  });

  if (frontEmoji) frontEmoji.textContent = emoji;
  if (backEmoji) backEmoji.textContent = emoji;
  if (backCategory) backCategory.textContent = category;

  // 대표 예문 표시
  const backExample = document.getElementById("back-example");
  if (
    backExample &&
    sourceExpression.examples &&
    sourceExpression.examples.length > 0
  ) {
    backExample.textContent = sourceExpression.examples[0];
  } else if (backExample) {
    backExample.textContent = "";
  }

  // 진행 상황 업데이트
  const progress = document.getElementById("flashcard-progress");
  if (progress) {
    progress.textContent = `${currentIndex + 1} / ${currentData.length}`;
  }

  // 삭제 버튼 추가
  const deleteButtonContainer = document.getElementById(
    "flashcard-delete-container"
  );
  if (deleteButtonContainer) {
    deleteButtonContainer.innerHTML = `
      <button class="delete-btn bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm" 
              data-item-id="${concept.id}" 
              data-item-type="vocabulary">
        🗑️ 삭제
      </button>
    `;
  }

  // 카드 앞면으로 리셋
  const card = document.getElementById("flashcard");
  if (card) {
    card.classList.remove("flipped");
  }
}

function flipCard() {
  const card = document.querySelector(".flip-card");
  if (card) {
    card.classList.toggle("flipped");
    console.log("🔄 카드 뒤집기 상태:", card.classList.contains("flipped"));
  } else {
    console.log("❌ .flip-card 요소를 찾을 수 없음");
  }
}

function showTypingMode() {
  console.log("⌨️ 타이핑 모드 시작");
  const typingMode = document.getElementById("typing-container");
  if (typingMode) {
    typingMode.classList.remove("hidden");
    updateTyping();

    // 엔터키 이벤트 리스너 추가
    const answerInput = document.getElementById("typing-answer");
    if (answerInput) {
      answerInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          checkTypingAnswer();
        }
      });
    }
  } else {
    console.error("❌ 타이핑 모드 요소를 찾을 수 없음");
    alert("타이핑 모드를 시작할 수 없습니다.");
    showAreaSelection();
  }
}

function updateTyping() {
  if (!currentData || currentData.length === 0) return;

  const concept = currentData[currentIndex];

  const wordElement = document.getElementById("typing-word");
  const pronunciationElement = document.getElementById("typing-pronunciation");
  const answerInput = document.getElementById("typing-answer");
  const resultDiv = document.getElementById("typing-result");

  if (
    concept.expressions &&
    concept.expressions[sourceLanguage] &&
    concept.expressions[targetLanguage]
  ) {
    const sourceExpr = concept.expressions[sourceLanguage];
    const targetExpr = concept.expressions[targetLanguage];

    if (wordElement) {
      wordElement.textContent = sourceExpr.word || "";
    }
    if (pronunciationElement) {
      pronunciationElement.textContent = sourceExpr.pronunciation || "";
    }

    // 정답 저장
    if (answerInput) {
      answerInput.dataset.correctAnswer = targetExpr.word.toLowerCase();
    }
  } else {
    // 대체 데이터 구조 지원
    if (wordElement) {
      wordElement.textContent =
        concept[sourceLanguage] || concept.word || "단어";
    }
    if (pronunciationElement) {
      pronunciationElement.textContent = "";
    }

    if (answerInput) {
      const answer = concept[targetLanguage] || concept.meaning || "answer";
      answerInput.dataset.correctAnswer = answer.toLowerCase();
    }
  }

  // 입력 필드 초기화
  if (answerInput) {
    answerInput.value = "";
    answerInput.focus();
  }

  if (resultDiv) {
    resultDiv.classList.add("hidden");
  }

  // 진행 상황 업데이트 (HTML에서 타이핑 진행 상황 요소가 있는지 확인 필요)
  const progress = document.getElementById("typing-progress");
  if (progress) {
    progress.textContent = `${currentIndex + 1} / ${currentData.length}`;
  }
}

function checkTypingAnswer() {
  const answerInput = document.getElementById("typing-answer");
  const resultDiv = document.getElementById("typing-result");

  if (!answerInput || !resultDiv) return;

  const userAnswer = answerInput.value.toLowerCase().trim();
  const correctAnswer = answerInput.dataset.correctAnswer;

  if (userAnswer === correctAnswer) {
    resultDiv.textContent = "정답입니다! 🎉";
    resultDiv.className = "mt-4 p-3 bg-green-100 text-green-800 rounded";
  } else {
    resultDiv.textContent = `틀렸습니다. 정답: ${correctAnswer}`;
    resultDiv.className = "mt-4 p-3 bg-red-100 text-red-800 rounded";
  }

  resultDiv.classList.remove("hidden");

  // 2초 후 다음 문제로
  setTimeout(() => {
    navigateContent(1);
  }, 2000);
}

function showPronunciationMode() {
  console.log("🎤 발음 연습 모드 (구현 예정)");
  alert("발음 연습 모드는 아직 구현중입니다.");
  showAreaSelection();
}

function showGrammarPatternMode() {
  console.log("📝 문법 패턴 모드 시작");
  const patternMode = document.getElementById("grammar-pattern-mode");
  if (patternMode) {
    patternMode.classList.remove("hidden");
    updateGrammarPatterns();
  } else {
    console.error("❌ 문법 패턴 모드 요소를 찾을 수 없음");
    alert("문법 패턴 모드를 시작할 수 없습니다.");
    showAreaSelection();
  }
}

function updateGrammarPatterns() {
  if (!currentData || currentData.length === 0) return;

  const pattern = currentData[currentIndex];
  console.log("📝 문법 패턴 데이터:", pattern);

  const patternTitle = document.getElementById("pattern-title");
  const patternStructure = document.getElementById("pattern-structure");
  const patternExplanation = document.getElementById("pattern-explanation");
  const patternExamples = document.getElementById("pattern-examples");

  // 실제 DB 구조에 맞게 데이터 추출
  const title = getLocalizedPatternTitle(pattern);
  const structure = getLocalizedPatternStructure(pattern);
  const explanation = getLocalizedPatternExplanation(pattern);
  const examples = getLocalizedPatternExamples(pattern);

  if (patternTitle) patternTitle.textContent = title;
  if (patternStructure) patternStructure.textContent = structure;
  if (patternExplanation) patternExplanation.textContent = explanation;

  if (patternExamples && examples && Array.isArray(examples)) {
    patternExamples.innerHTML = examples
      .map((example) => `<li class="mb-2">${example}</li>`)
      .join("");
  }

  // 진행 상황 업데이트
  const progress = document.getElementById("pattern-progress");
  if (progress) {
    progress.textContent = `${currentIndex + 1} / ${currentData.length}`;
  }

  // 삭제 버튼 추가
  const deleteButtonContainer = document.getElementById(
    "pattern-delete-container"
  );
  if (deleteButtonContainer) {
    deleteButtonContainer.innerHTML = `
      <button class="delete-btn bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm" 
              data-item-id="${pattern.id}" 
              data-item-type="grammar">
        🗑️ 삭제
      </button>
    `;
  }
}

function showGrammarPracticeMode() {
  console.log("📚 문법 실습 모드 시작");
  const practiceMode = document.getElementById("grammar-practice-mode");
  if (practiceMode) {
    practiceMode.classList.remove("hidden");
    updateGrammarPractice();

    // 문법 카드 클릭 이벤트 추가
    setTimeout(() => {
      const grammarCard = document.getElementById("grammar-card");
      if (grammarCard) {
        grammarCard.removeEventListener("click", flipGrammarCard);
        grammarCard.addEventListener("click", (e) => {
          if (!e.target.matches("button, .btn")) {
            e.preventDefault();
            e.stopPropagation();
            flipGrammarCard();
          }
        });
      }
    }, 100);
  } else {
    console.error("❌ 문법 실습 모드 요소를 찾을 수 없음");
    alert("문법 실습 모드를 시작할 수 없습니다.");
    showAreaSelection();
  }
}

function updateGrammarPractice() {
  if (!currentData || currentData.length === 0) return;

  const pattern = currentData[currentIndex];
  console.log("📚 문법 실습 데이터:", pattern);

  // 실제 DB 구조에 맞게 데이터 추출
  const title = getLocalizedPatternTitle(pattern);
  const structure = getLocalizedPatternStructure(pattern);
  const explanation = getLocalizedPatternExplanation(pattern);
  const examples = getLocalizedPatternExamples(pattern);

  // 앞면: 패턴 구조
  const frontStructure = document.getElementById("grammar-front-structure");
  const frontTitle = document.getElementById("grammar-front-title");

  if (frontTitle) frontTitle.textContent = title;
  if (frontStructure) frontStructure.textContent = structure;

  // 뒷면: 설명과 예문
  const backExplanation = document.getElementById("grammar-back-explanation");
  const backExamples = document.getElementById("grammar-back-examples");

  if (backExplanation) backExplanation.textContent = explanation;

  if (backExamples && examples && Array.isArray(examples)) {
    backExamples.innerHTML = examples
      .map((example) => `<li class="mb-1">${example}</li>`)
      .join("");
  }

  // 진행 상황 업데이트
  const progress = document.getElementById("grammar-practice-progress");
  if (progress) {
    progress.textContent = `${currentIndex + 1} / ${currentData.length}`;
  }

  // 삭제 버튼 추가
  const deleteButtonContainer = document.getElementById(
    "grammar-delete-container"
  );
  if (deleteButtonContainer) {
    deleteButtonContainer.innerHTML = `
      <button class="delete-btn bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm" 
              data-item-id="${pattern.id}" 
              data-item-type="grammar">
        🗑️ 삭제
      </button>
    `;
  }

  // 카드 앞면으로 리셋
  const card = document.getElementById("grammar-card");
  if (card) {
    card.classList.remove("flipped");
  }
}

function flipGrammarCard() {
  const card = document.getElementById("grammar-card");
  if (card) {
    card.classList.toggle("flipped");
  }
}

function showReadingExampleMode() {
  console.log("📖 예문 독해 모드 시작");
  const readingContainer = document.getElementById("reading-container");
  if (readingContainer) {
    readingContainer.classList.remove("hidden");
    updateReadingExample();
  } else {
    console.error("❌ 독해 모드 요소를 찾을 수 없음");
    alert("독해 모드를 시작할 수 없습니다.");
    showAreaSelection();
  }
}

function showReadingFlashMode() {
  console.log("⚡ 플래시 독해 모드 시작");
  const readingContainer = document.getElementById("reading-container");
  if (readingContainer) {
    readingContainer.classList.remove("hidden");
    updateReadingFlash();
  } else {
    console.error("❌ 독해 모드 요소를 찾을 수 없음");
    alert("독해 모드를 시작할 수 없습니다.");
    showAreaSelection();
  }
}

function updateReadingExample() {
  if (!currentData || currentData.length === 0) return;

  const example = currentData[currentIndex];
  const sourceLanguage = window.languageSettings?.sourceLanguage || "korean";
  const targetLanguage = window.languageSettings?.targetLanguage || "english";

  const container = document.getElementById("reading-example-container");
  if (!container) return;

  // 예문 학습 모드 - 상세한 정보 표시
  container.innerHTML = `
    <div class="space-y-6">
      <div class="text-center">
        <div class="text-sm bg-purple-100 text-purple-800 px-3 py-1 rounded-full inline-block mb-4">
          예문 학습 모드
        </div>
        <h3 class="text-2xl font-bold mb-4">
          ${example[sourceLanguage] || example.original || "원문"}
        </h3>
        <p class="text-lg text-gray-600 mb-4">
          ${example[targetLanguage] || example.translation || "번역"}
        </p>
        ${
          example.context
            ? `<p class="text-sm text-gray-500 bg-gray-100 p-3 rounded">상황: ${example.context}</p>`
            : ""
        }
      </div>
      
      <div class="border-t pt-4">
        <h4 class="font-semibold mb-2">학습 포인트:</h4>
        <ul class="text-sm text-gray-700 space-y-1">
          <li>• 문장 구조와 의미를 파악해보세요</li>
          <li>• 핵심 단어와 표현을 기억해보세요</li>
          <li>• 실제 상황에서 어떻게 사용되는지 생각해보세요</li>
        </ul>
      </div>
      
      <div class="text-center pt-4 border-t" id="reading-delete-container">
        <button class="delete-btn bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm" 
                data-item-id="${example.id}" 
                data-item-type="reading">
          🗑️ 삭제
        </button>
      </div>
    </div>
  `;

  // 진행 상황 업데이트
  const progress = document.getElementById("reading-progress");
  if (progress) {
    progress.textContent = `${currentIndex + 1} / ${currentData.length}`;
  }
}

function updateReadingFlash() {
  if (!currentData || currentData.length === 0) return;

  const example = currentData[currentIndex];
  const sourceLanguage = window.languageSettings?.sourceLanguage || "korean";
  const targetLanguage = window.languageSettings?.targetLanguage || "english";

  const container = document.getElementById("reading-example-container");
  if (!container) return;

  // 플래시 모드 - 간단한 카드 형태
  container.innerHTML = `
    <div class="text-center">
      <div class="text-sm bg-purple-100 text-purple-800 px-3 py-1 rounded-full inline-block mb-6">
        플래시 모드
      </div>
      
      <div class="flip-card w-full max-w-lg mx-auto" id="reading-flash-card">
        <div class="flip-card-inner">
          <div class="flip-card-front bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg shadow-lg p-8">
            <div class="text-center">
              <h3 class="text-2xl font-bold mb-4">
                ${example[sourceLanguage] || example.original || "원문"}
              </h3>
              <p class="text-purple-100 mt-8">(카드를 클릭하여 번역 보기)</p>
            </div>
          </div>
          <div class="flip-card-back bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg shadow-lg p-8">
            <div class="text-center">
              <h3 class="text-2xl font-bold mb-4">
                ${example[targetLanguage] || example.translation || "번역"}
              </h3>
              ${
                example.context
                  ? `<p class="text-blue-100 text-sm mt-4">상황: ${example.context}</p>`
                  : ""
              }
            </div>
          </div>
        </div>
      </div>
      
      <div class="mt-6" id="reading-flash-delete-container">
        <button class="delete-btn bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm" 
                data-item-id="${example.id}" 
                data-item-type="reading">
          🗑️ 삭제
        </button>
      </div>
    </div>
  `;

  // 진행 상황 업데이트
  const progress = document.getElementById("reading-progress");
  if (progress) {
    progress.textContent = `${currentIndex + 1} / ${currentData.length}`;
  }
}

function navigateContent(direction) {
  if (isNavigating) {
    console.log("⚠️ 네비게이션 진행 중, 중복 실행 방지");
    return;
  }

  if (!currentData || currentData.length === 0) {
    console.log("❌ 네비게이션: 데이터가 없음");
    return;
  }

  isNavigating = true;

  console.log(
    `🔄 네비게이션: 현재 인덱스 ${currentIndex}, 방향 ${direction}, 총 데이터 ${currentData.length}개`
  );

  const oldIndex = currentIndex;
  currentIndex += direction;

  // 순환 처리
  if (currentIndex >= currentData.length) {
    currentIndex = 0;
  } else if (currentIndex < 0) {
    currentIndex = currentData.length - 1;
  }

  console.log(`🔄 네비게이션: ${oldIndex} → ${currentIndex}`);

  // 현재 모드에 따라 업데이트
  try {
    switch (currentLearningArea) {
      case "vocabulary":
        switch (currentLearningMode) {
          case "flashcard":
            updateFlashcard();
            break;
          case "typing":
            updateTyping();
            break;
        }
        break;
      case "grammar":
        switch (currentLearningMode) {
          case "pattern":
            updateGrammarPatterns();
            break;
          case "practice":
            updateGrammarPractice();
            break;
        }
        break;
      case "reading":
        switch (currentLearningMode) {
          case "example":
            updateReadingExample();
            break;
          case "flash":
            updateReadingFlash();
            break;
          default:
            updateReadingExample();
        }
        break;
    }
  } finally {
    // 네비게이션 완료 후 플래그 해제
    setTimeout(() => {
      isNavigating = false;
    }, 100);
  }
}

// 독해 플래시 카드 뒤집기 함수
function flipReadingCard() {
  const card = document.getElementById("reading-flash-card");
  if (card) {
    card.classList.toggle("flipped");
  }
}

// 전역 함수로 내보내기
window.startLearningMode = startLearningMode;
window.flipCard = flipCard;
window.checkTypingAnswer = checkTypingAnswer;
window.flipGrammarCard = flipGrammarCard;
window.flipReadingCard = flipReadingCard;

// Enter 키로 타이핑 모드 답안 확인
document.addEventListener("keypress", function (e) {
  if (e.key === "Enter" && currentLearningMode === "typing") {
    checkTypingAnswer();
  }
});

// 언어별 데이터 필터링 함수
function filterDataByLanguage(data) {
  if (!Array.isArray(data)) return [];

  return data.filter((item) => {
    // expressions가 있는 경우 (개념 데이터)
    if (item.expressions) {
      const hasSource = item.expressions[sourceLanguage]?.word;
      const hasTarget = item.expressions[targetLanguage]?.word;
      return hasSource && hasTarget;
    }

    // 독해 데이터 필터링 (언어별 텍스트가 있는지 확인)
    if (item[sourceLanguage] && item[targetLanguage]) {
      return true;
    }

    // translations 구조가 있는 경우
    if (item.translations) {
      const hasSource = item.translations[sourceLanguage];
      const hasTarget = item.translations[targetLanguage];
      return hasSource && hasTarget;
    }

    // 기타 데이터는 모두 포함
    return true;
  });
}

// 다국어 문법 패턴 생성 함수
function generateMultilingualGrammarPatterns() {
  const patterns = [];

  // 언어별 기본 문법 패턴 정의
  const grammarPatterns = {
    korean: [
      {
        title: "현재진행형",
        structure: "동사 + 고 있다",
        explanation: "현재 진행 중인 동작이나 상태를 나타냅니다.",
        examples: [
          "나는 공부하고 있다.",
          "그는 책을 읽고 있다.",
          "우리는 영화를 보고 있다.",
        ],
      },
      {
        title: "과거형",
        structure: "동사 + 았/었다",
        explanation: "과거에 일어난 일을 나타냅니다.",
        examples: ["어제 친구를 만났다.", "영화를 봤다.", "맛있게 먹었다."],
      },
    ],
    english: [
      {
        title: "Present Continuous",
        structure: "be + V-ing",
        explanation: "Actions happening now or around now.",
        examples: [
          "I am studying English.",
          "She is reading a book.",
          "They are playing soccer.",
        ],
      },
      {
        title: "Past Perfect",
        structure: "had + past participle",
        explanation: "Actions completed before another past action.",
        examples: [
          "I had finished homework before dinner.",
          "She had left when I arrived.",
          "They had been friends for years.",
        ],
      },
    ],
    japanese: [
      {
        title: "現在進行形",
        structure: "動詞 + ている",
        explanation: "現在進行中の動作や状態を表します。",
        examples: ["勉強している。", "本を読んでいる。", "映画を見ている。"],
      },
      {
        title: "過去形",
        structure: "動詞 + た/だ",
        explanation: "過去に起こったことを表します。",
        examples: ["昨日友達に会った。", "映画を見た。", "美味しく食べた。"],
      },
    ],
    chinese: [
      {
        title: "现在进行时",
        structure: "正在 + 动词",
        explanation: "表示正在进行的动作或状态。",
        examples: ["我正在学习。", "他正在看书。", "我们正在看电影。"],
      },
      {
        title: "过去时",
        structure: "动词 + 了",
        explanation: "表示过去发生的事情。",
        examples: ["昨天见了朋友。", "看了电影。", "吃得很好。"],
      },
    ],
  };

  // 원본 언어의 패턴들을 기반으로 생성
  const sourcePatterns =
    grammarPatterns[sourceLanguage] || grammarPatterns.english;

  sourcePatterns.forEach((pattern, index) => {
    patterns.push({
      id: `${sourceLanguage}_pattern_${index + 1}`,
      pattern_id: `${sourceLanguage}_pattern_${index + 1}`,
      title: pattern.title,
      structure: pattern.structure,
      explanation: pattern.explanation,
      examples: pattern.examples,
      source: "generated_multilingual",
    });
  });

  return patterns;
}

// 기본 독해 예문 생성 함수
function generateBasicReadingExamples() {
  const examples = [];

  const basicExamples = {
    korean: {
      english: [
        {
          korean: "안녕하세요. 만나서 반갑습니다.",
          english: "Hello. Nice to meet you.",
          context: "첫 만남 인사",
        },
        {
          korean: "오늘 날씨가 정말 좋네요.",
          english: "The weather is really nice today.",
          context: "일상 대화",
        },
        {
          korean: "어디서 오셨나요?",
          english: "Where are you from?",
          context: "자기소개",
        },
      ],
      japanese: [
        {
          korean: "안녕하세요. 만나서 반갑습니다.",
          japanese: "こんにちは。はじめまして。",
          context: "첫 만남 인사",
        },
        {
          korean: "오늘 날씨가 정말 좋네요.",
          japanese: "今日はとてもいい天気ですね。",
          context: "일상 대화",
        },
        {
          korean: "어디서 오셨나요?",
          japanese: "どちらからいらっしゃいましたか？",
          context: "자기소개",
        },
      ],
      chinese: [
        {
          korean: "안녕하세요. 만나서 반갑습니다.",
          chinese: "你好。很高兴见到你。",
          context: "첫 만남 인사",
        },
        {
          korean: "오늘 날씨가 정말 좋네요.",
          chinese: "今天天气真好。",
          context: "일상 대화",
        },
        {
          korean: "어디서 오셨나요?",
          chinese: "你从哪里来？",
          context: "자기소개",
        },
      ],
    },
    english: {
      korean: [
        {
          english: "Hello. Nice to meet you.",
          korean: "안녕하세요. 만나서 반갑습니다.",
          context: "First meeting",
        },
        {
          english: "The weather is really nice today.",
          korean: "오늘 날씨가 정말 좋네요.",
          context: "Daily conversation",
        },
        {
          english: "Where are you from?",
          korean: "어디서 오셨나요?",
          context: "Self-introduction",
        },
      ],
      japanese: [
        {
          english: "Hello. Nice to meet you.",
          japanese: "こんにちは。はじめまして。",
          context: "First meeting",
        },
        {
          english: "The weather is really nice today.",
          japanese: "今日はとてもいい天気ですね。",
          context: "Daily conversation",
        },
        {
          english: "Where are you from?",
          japanese: "どちらからいらっしゃいましたか？",
          context: "Self-introduction",
        },
      ],
      chinese: [
        {
          english: "Hello. Nice to meet you.",
          chinese: "你好。很高兴见到你。",
          context: "First meeting",
        },
        {
          english: "The weather is really nice today.",
          chinese: "今天天气真好。",
          context: "Daily conversation",
        },
        {
          english: "Where are you from?",
          chinese: "你从哪里来？",
          context: "Self-introduction",
        },
      ],
    },
  };

  const sourceExamples =
    basicExamples[sourceLanguage]?.[targetLanguage] ||
    basicExamples.korean.english;

  sourceExamples.forEach((example, index) => {
    examples.push({
      id: `reading_${index + 1}`,
      example_id: `reading_${index + 1}`,
      [sourceLanguage]: example[sourceLanguage],
      [targetLanguage]: example[targetLanguage],
      context: example.context,
      source: "generated_basic",
    });
  });

  return examples;
}

// 지역화 헬퍼 함수들
function getLocalizedPatternTitle(data) {
  // 실제 DB 구조: pattern_name 필드 우선 사용
  if (data.pattern_name) {
    return data.pattern_name;
  }

  // 기존 구조 지원
  if (data.title) {
    return data.title;
  }

  // 패턴 ID에서 제목 생성
  if (data.pattern_id) {
    return generatePatternTitle(data.pattern_id, data);
  }

  return "문법 패턴";
}

function getLocalizedPatternStructure(data) {
  // 실제 DB 구조: structural_pattern 필드 사용
  if (data.structural_pattern) {
    return data.structural_pattern;
  }

  // 새 템플릿 구조 지원
  if (data.explanations && data.explanations[currentUILanguage]) {
    return data.explanations[currentUILanguage].pattern || "";
  }

  // 기존 구조 지원
  if (data.structure) {
    return data.structure;
  }

  return "구조 정보 없음";
}

function getLocalizedPatternExplanation(data) {
  const currentLanguage =
    window.languageSettings?.currentUILanguage || "korean";

  // 실제 DB 구조: explanations 객체에서 현재 언어로 설명 가져오기
  if (data.explanations && data.explanations[currentLanguage]) {
    return data.explanations[currentLanguage];
  }

  // 기본 언어(한국어) 설명 시도
  if (data.explanations && data.explanations.korean) {
    return data.explanations.korean;
  }

  // 기존 구조 지원
  if (data.explanation) {
    return data.explanation;
  }

  return "설명 정보 없음";
}

function getLocalizedPatternExamples(data) {
  const currentLanguage =
    window.languageSettings?.currentUILanguage || "korean";
  const sourceLanguage = window.languageSettings?.sourceLanguage || "korean";
  const targetLanguage = window.languageSettings?.targetLanguage || "english";

  // 실제 DB 구조: usage_examples 배열에서 다국어 예문 가져오기
  if (data.usage_examples && Array.isArray(data.usage_examples)) {
    return data.usage_examples
      .map((example) => {
        if (typeof example === "object") {
          // 다국어 객체 형태의 예문
          const sourceText = example[sourceLanguage] || example.korean || "";
          const targetText = example[targetLanguage] || example.english || "";
          return sourceText && targetText
            ? `${sourceText} → ${targetText}`
            : sourceText || targetText;
        }
        // 문자열 형태의 예문
        return example;
      })
      .filter((example) => example); // 빈 예문 제거
  }

  // teaching_notes에서 예문 추출 시도
  if (data.teaching_notes && data.teaching_notes[currentLanguage]) {
    return [data.teaching_notes[currentLanguage]];
  }

  // learning_focus를 예문으로 변환
  if (data.learning_focus && Array.isArray(data.learning_focus)) {
    return data.learning_focus.map((focus) => `${focus} 관련 학습`);
  }

  // 기존 구조 지원
  if (data.examples && Array.isArray(data.examples)) {
    return data.examples;
  }

  return ["사용 예문이 없습니다."];
}

function getLocalizedExample(data) {
  if (data.translations) {
    const sourceText = data.translations[sourceLanguage];
    const targetText = data.translations[targetLanguage];
    if (sourceText && targetText) {
      const source =
        typeof sourceText === "object" ? sourceText.text : sourceText;
      const target =
        typeof targetText === "object" ? targetText.text : targetText;
      return `${source} → ${target}`;
    }
  }
  return "예문";
}

function getLocalizedReadingExample(data) {
  console.log("🔍 독해 예문 지역화:", data);

  // 현재 언어 설정 가져오기
  const currentSourceLanguage =
    window.languageSettings?.sourceLanguage || "korean";
  const currentTargetLanguage =
    window.languageSettings?.targetLanguage || "english";

  // 새로운 translations 구조 지원
  if (data.translations) {
    const sourceText = data.translations[currentSourceLanguage];
    const targetText = data.translations[currentTargetLanguage];

    if (sourceText && targetText) {
      const result = {
        [currentSourceLanguage]:
          typeof sourceText === "object" ? sourceText.text : sourceText,
        [currentTargetLanguage]:
          typeof targetText === "object" ? targetText.text : targetText,
        context: data.context || "일반",
        difficulty: data.difficulty || "beginner",
        romanization:
          (typeof sourceText === "object" ? sourceText.romanization : "") || "",
        phonetic:
          (typeof targetText === "object" ? targetText.phonetic : "") || "",
      };
      console.log("✅ translations 구조로 변환:", result);
      return result;
    }
  }

  // 기존 구조 지원 (직접 언어 필드가 있는 경우)
  if (data[currentSourceLanguage] && data[currentTargetLanguage]) {
    const result = {
      [currentSourceLanguage]: data[currentSourceLanguage],
      [currentTargetLanguage]: data[currentTargetLanguage],
      context: data.context || "일반",
      difficulty: data.difficulty || "beginner",
    };
    console.log("✅ 직접 언어 필드로 변환:", result);
    return result;
  }

  // 기본 텍스트 필드 지원
  if (data.text || data.content) {
    const text = data.text || data.content;
    const result = {
      [currentSourceLanguage]: text,
      [currentTargetLanguage]: text, // 번역이 없으면 동일한 텍스트 사용
      context: data.context || "일반",
      difficulty: data.difficulty || "beginner",
    };
    console.log("✅ 기본 텍스트로 변환:", result);
    return result;
  }

  console.log("❌ 변환 실패 - 지원되지 않는 구조");
  return null;
}

function generatePatternTitle(patternId, data) {
  // 패턴 ID에서 제목 추론
  if (patternId.includes("present")) return "현재형";
  if (patternId.includes("past")) return "과거형";
  if (patternId.includes("future")) return "미래형";
  if (patternId.includes("continuous")) return "진행형";
  return patternId.replace(/_/g, " ");
}

function extractPatternStructure(data) {
  // 예문에서 구조 추론
  return "기본 문장 구조";
}

function generatePatternExplanation(patternId, data) {
  return `${patternId} 패턴에 대한 설명입니다.`;
}

// 현재 학습 모드 업데이트 함수
function updateCurrentLearningMode() {
  console.log(
    `🔄 현재 학습 모드 업데이트: ${currentLearningArea} - ${currentLearningMode}`
  );

  // 현재 인덱스 초기화
  currentIndex = 0;

  // 학습 모드별 화면 업데이트
  switch (currentLearningMode) {
    case "flashcard":
      updateFlashcard();
      break;
    case "typing":
      updateTyping();
      break;
    case "grammar-pattern":
      updateGrammarPatterns();
      break;
    case "grammar-practice":
      updateGrammarPractice();
      break;
    case "reading-example":
      updateReadingExample();
      break;
    case "reading-flash":
      updateReadingFlash();
      break;
    default:
      console.log(`⚠️ 알 수 없는 학습 모드: ${currentLearningMode}`);
  }
}

// 삭제 기능 수정 - sessionStorage와 생성된 데이터 처리
async function deleteItem(itemId, itemType) {
  if (!itemId || !itemType) {
    console.error("❌ 삭제할 항목 정보가 부족합니다.");
    return;
  }

  const confirmDelete = confirm(
    `이 ${getItemTypeName(
      itemType
    )} 항목을 삭제하시겠습니까?\n삭제된 데이터는 복구할 수 없습니다.`
  );

  if (!confirmDelete) {
    console.log("🚫 삭제 취소됨");
    return;
  }

  try {
    console.log(`🗑️ 삭제 시작: ${itemType} - ${itemId}`);

    // 먼저 삭제할 항목 정보 확인 (배열에서 제거하기 전에)
    const currentItem = currentData.find((item) => item.id === itemId);
    console.log(`🔍 삭제할 항목:`, currentItem);

    // 실제 DB 데이터인지 확인
    // Firebase 문서 ID는 보통 15-20자의 영숫자 조합
    const isFirebaseDocId =
      itemId.length >= 15 && /^[a-zA-Z0-9]+$/.test(itemId);

    // 실제 DB 데이터 판별 조건:
    // 1. source 필드가 컬렉션명인 경우
    // 2. Firebase 문서 ID 형태인 경우
    const shouldDeleteFromFirebase =
      currentItem &&
      (currentItem.source === "examples" ||
        currentItem.source === "grammar" ||
        currentItem.source === "concepts" ||
        isFirebaseDocId);

    console.log(
      `🔍 삭제 데이터 확인: ID=${itemId}, source=${currentItem?.source}, isFirebaseDocId=${isFirebaseDocId}, shouldDeleteFromFirebase=${shouldDeleteFromFirebase}`
    );

    // Firebase에서 먼저 삭제 (실제 DB 데이터인 경우)
    if (shouldDeleteFromFirebase) {
      console.log("🔥 Firebase에서 실제 삭제 진행...");

      const isFirebaseReady = await waitForFirebaseInit();
      if (isFirebaseReady) {
        try {
          const { db, doc, deleteDoc } = window.firebaseInit;

          let collectionName;
          switch (itemType) {
            case "vocabulary":
              collectionName = "concepts";
              break;
            case "grammar":
              collectionName = "grammar";
              break;
            case "reading":
              collectionName = "examples";
              break;
            default:
              console.error("❌ 알 수 없는 항목 타입:", itemType);
              return;
          }

          const docRef = doc(db, collectionName, itemId);
          await deleteDoc(docRef);

          console.log(`✅ Firebase에서 삭제 완료: ${itemId}`);
        } catch (firebaseError) {
          console.warn("⚠️ Firebase 삭제 중 오류:", firebaseError);
          alert(
            "원격 데이터 삭제 중 오류가 발생했습니다. 로컬 삭제는 계속 진행됩니다."
          );
        }
      } else {
        console.warn(
          "⚠️ Firebase 초기화가 완료되지 않았지만 로컬 삭제는 진행됩니다."
        );
      }
    } else {
      console.log("📝 생성된 데이터이므로 Firebase 삭제 건너뜀");
    }

    // 현재 데이터에서 제거
    if (currentData && Array.isArray(currentData)) {
      const itemIndex = currentData.findIndex((item) => item.id === itemId);
      if (itemIndex !== -1) {
        currentData.splice(itemIndex, 1);
        console.log(
          `✅ 로컬 데이터에서 제거 완료. 남은 데이터: ${currentData.length}개`
        );

        // 인덱스 조정
        if (currentIndex >= currentData.length) {
          currentIndex = Math.max(0, currentData.length - 1);
        }

        // 데이터가 없으면 영역 선택으로 돌아가기
        if (currentData.length === 0) {
          const areaName = getItemTypeName(itemType);
          alert(
            `모든 ${areaName} 데이터가 삭제되었습니다.\n\n새로운 데이터를 업로드하거나 다른 학습 영역을 선택해주세요.`
          );
          showAreaSelection();
          return;
        }

        // UI 업데이트
        updateCurrentView();
      }
    }

    // sessionStorage에서도 제거 (단어 학습의 경우)
    if (itemType === "vocabulary") {
      try {
        const vocabularyData = JSON.parse(
          sessionStorage.getItem("vocabularyData") || "[]"
        );
        const filteredData = vocabularyData.filter(
          (item) => item.id !== itemId
        );
        sessionStorage.setItem("vocabularyData", JSON.stringify(filteredData));
        console.log("✅ sessionStorage에서 단어 데이터 제거 완료");
      } catch (error) {
        console.warn("⚠️ sessionStorage 처리 중 오류:", error);
      }
    }

    alert("삭제가 완료되었습니다.");
  } catch (error) {
    console.error("❌ 삭제 중 오류 발생:", error);
    alert("삭제 중 오류가 발생했습니다. 다시 시도해주세요.");
  }
}

function getItemTypeName(itemType) {
  switch (itemType) {
    case "vocabulary":
      return "단어";
    case "grammar":
      return "문법";
    case "reading":
      return "독해";
    default:
      return "항목";
  }
}

// 현재 뷰 업데이트 함수
function updateCurrentView() {
  if (!currentLearningArea || !currentLearningMode) {
    console.warn("⚠️ 현재 영역 또는 모드가 설정되지 않음");
    return;
  }

  try {
    switch (currentLearningArea) {
      case "vocabulary":
        if (currentLearningMode === "flashcard") {
          updateFlashcard();
        } else if (currentLearningMode === "typing") {
          updateTyping();
        } else if (currentLearningMode === "pronunciation") {
          // 발음 모드는 아직 구현되지 않음
          console.log("🎤 발음 모드 업데이트 (구현 예정)");
        }
        break;
      case "grammar":
        if (currentLearningMode === "pattern") {
          updateGrammarPatterns();
        } else if (currentLearningMode === "practice") {
          updateGrammarPractice();
        }
        break;
      case "reading":
        if (currentLearningMode === "example") {
          updateReadingExample();
        } else if (currentLearningMode === "flash") {
          updateReadingFlash();
        }
        break;
    }
    console.log("✅ 현재 뷰 업데이트 완료");
  } catch (error) {
    console.error("❌ 뷰 업데이트 중 오류:", error);
  }
}
