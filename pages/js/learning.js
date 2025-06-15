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
} from "../../js/firebase/firebase-init.js";

// 전역 변수
let currentUser = null;
let currentData = [];
let currentIndex = 0;
let currentLearningArea = null;
let currentLearningMode = null;

// DOM 로드 완료 시 초기화
document.addEventListener("DOMContentLoaded", function () {
  console.log("📚 문법 학습 페이지 초기화");

  // Firebase 인증 확인
  onAuthStateChanged(auth, (user) => {
    if (user) {
      currentUser = user;
      console.log("👤 사용자 로그인됨:", user.email);
    } else {
      console.log("❌ 사용자 로그인되지 않음");
    }
  });

  setupEventListeners();
  showAreaSelection();
});

function setupEventListeners() {
  // 네비게이션 버튼들
  const prevBtn = document.getElementById("prev-grammar");
  const nextBtn = document.getElementById("next-grammar");

  if (prevBtn) {
    prevBtn.addEventListener("click", () => navigateContent(-1));
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => navigateContent(1));
  }

  // 플래시카드 관련 버튼들
  const flipCardBtn = document.getElementById("flip-card");
  if (flipCardBtn) {
    flipCardBtn.addEventListener("click", flipCard);
  }

  const prevCardBtn = document.getElementById("prev-card");
  const nextCardBtn = document.getElementById("next-card");

  if (prevCardBtn) {
    prevCardBtn.addEventListener("click", () => navigateContent(-1));
  }

  if (nextCardBtn) {
    nextCardBtn.addEventListener("click", () => navigateContent(1));
  }

  // 타이핑 관련 버튼들
  const checkAnswerBtn = document.getElementById("check-answer");
  if (checkAnswerBtn) {
    checkAnswerBtn.addEventListener("click", checkTypingAnswer);
  }

  const nextTypingBtn = document.getElementById("next-typing");
  if (nextTypingBtn) {
    nextTypingBtn.addEventListener("click", () => {
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
    });
  }

  // 홈 버튼
  const homeBtn = document.getElementById("home-btn");
  if (homeBtn) {
    homeBtn.addEventListener("click", showAreaSelection);
  }

  // 돌아가기 버튼들 설정
  const backToAreasBtn = document.getElementById("back-to-areas");
  if (backToAreasBtn) {
    backToAreasBtn.addEventListener("click", () => {
      console.log("🔙 영역 선택으로 돌아가기");
      showAreaSelection();
    });
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
      button.addEventListener("click", () => {
        console.log(`🔙 ${buttonId} 클릭`);
        showAreaSelection();
      });
    }
  });

  // 추가로 모든 home-btn 버튼들도 설정 (중복 ID 포함)
  document.addEventListener("click", (e) => {
    if (e.target.id === "home-btn" || e.target.matches(".home-btn")) {
      console.log("🏠 홈 버튼 클릭");
      showAreaSelection();
    }

    // 뒤집기 버튼들
    if (e.target.id === "flip-card" || e.target.matches(".flip-card-trigger")) {
      console.log("🔄 카드 뒤집기");
      flipCard();
    }

    // 플래시카드 직접 클릭
    if (
      e.target.matches(
        ".flip-card, .flip-card *, .flip-card-inner, .flip-card-inner *"
      )
    ) {
      const flipCard = e.target.closest(".flip-card");
      if (flipCard && !e.target.matches("button")) {
        // 버튼이 아닌 경우만
        console.log("🔄 플래시카드 직접 클릭");
        flipCard.classList.toggle("flipped");
      }
    }

    // 문법 카드 뒤집기
    if (e.target.matches("#grammar-card, #grammar-card *")) {
      console.log("🔄 문법 카드 뒤집기");
      flipGrammarCard();
    }

    // 네비게이션 버튼들 (중복 ID 처리)
    if (e.target.id === "prev-grammar" || e.target.matches(".prev-btn")) {
      console.log("⬅️ 이전 버튼");
      navigateContent(-1);
    }

    if (e.target.id === "next-grammar" || e.target.matches(".next-btn")) {
      console.log("➡️ 다음 버튼");
      navigateContent(1);
    }
  });

  // 학습 모드 카드 버튼들 설정
  document.addEventListener("click", (e) => {
    if (e.target.matches(".learning-mode-card")) {
      const area = e.target.getAttribute("data-area") || currentLearningArea;
      const mode = e.target.getAttribute("data-mode");

      if (area && mode) {
        console.log(`🎯 학습 모드 카드 클릭: ${area} - ${mode}`);
        startLearningMode(area, mode);
      }
    }
  });
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

  areaCards.forEach((card) => {
    // 이미 이벤트 리스너가 있는지 확인
    if (!card.hasAttribute("data-listener-added")) {
      card.addEventListener("click", function () {
        const area = this.getAttribute("data-area");
        console.log(`🎯 학습 영역 선택: ${area}`);
        showLearningModes(area);
      });
      card.setAttribute("data-listener-added", "true");
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
    <div class="bg-gradient-to-br from-${mode.color}-500 to-${
        mode.color
      }-600 text-white p-6 rounded-lg cursor-pointer hover:from-${
        mode.color
      }-600 hover:to-${
        mode.color
      }-700 transition-all duration-300 transform hover:scale-105"
         onclick="startLearningMode('${area}', '${mode.id}')">
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

  console.log(
    "✅ 모드 선택 화면 표시 완료, 섹션 visible:",
    !modeSection.classList.contains("hidden")
  );
}

async function startLearningMode(area, mode) {
  console.log(`🎯 학습 모드 시작: ${area} - ${mode}`);
  console.log("📞 startLearningMode 호출 스택:", new Error().stack);

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
}

async function loadLearningData(area) {
  console.log(`📚 ${area} 영역 데이터 로딩 시작`);

  try {
    currentData = [];

    switch (area) {
      case "vocabulary":
        // 단어 데이터 로드 - 여러 소스에서 시도
        console.log("🔍 단어 데이터 소스 확인...");

        // 1. sessionStorage에서 학습 데이터 확인 (가장 우선)
        try {
          const storedData = sessionStorage.getItem("learningConcepts");
          if (storedData) {
            currentData = JSON.parse(storedData);
            console.log(
              `💾 sessionStorage에서 단어 데이터: ${currentData.length}개`
            );
          }
        } catch (error) {
          console.warn("sessionStorage 로드 실패:", error);
        }

        // 2. window.allConcepts 확인 (multilingual-dictionary.js에서 설정)
        if (
          (!currentData || currentData.length === 0) &&
          window.allConcepts &&
          Array.isArray(window.allConcepts)
        ) {
          currentData = window.allConcepts;
          console.log(
            `💾 window.allConcepts에서 단어 데이터: ${currentData.length}개`
          );
        }
        // 3. window.currentConcepts 확인 (다른 페이지에서 설정)
        if (
          (!currentData || currentData.length === 0) &&
          window.currentConcepts &&
          Array.isArray(window.currentConcepts)
        ) {
          currentData = window.currentConcepts;
          console.log(
            `💾 window.currentConcepts에서 단어 데이터: ${currentData.length}개`
          );
        }
        // 4. 전역 allConcepts 변수 확인
        if (
          (!currentData || currentData.length === 0) &&
          typeof allConcepts !== "undefined" &&
          Array.isArray(allConcepts)
        ) {
          currentData = allConcepts;
          console.log(
            `💾 전역 allConcepts에서 단어 데이터: ${currentData.length}개`
          );
        }
        // 5. Firebase에서 직접 로드 시도
        if (!currentData || currentData.length === 0) {
          console.log("🔥 Firebase에서 단어 데이터 직접 로드 시도...");
          try {
            const conceptsRef = collection(db, "concepts");
            const q = query(conceptsRef, limit(50)); // 성능을 위해 제한
            const snapshot = await getDocs(q);

            currentData = [];
            snapshot.forEach((doc) => {
              currentData.push({
                id: doc.id,
                concept_id: doc.id,
                ...doc.data(),
              });
            });
            console.log(`🔥 Firebase에서 단어 데이터: ${currentData.length}개`);
          } catch (error) {
            console.warn("Firebase 직접 로드 실패:", error);
            currentData = [];
          }
        }

        console.log(`✅ 최종 단어 데이터: ${currentData.length}개`);
        break;

      case "grammar":
        // 문법 패턴 더미 데이터 (실제 구현 시 Firebase에서 로드)
        currentData = [
          {
            id: "1",
            title: "현재진행형",
            structure: "be + V-ing",
            explanation: "현재 진행 중인 동작을 나타내는 문법입니다.",
            examples: [
              "I am studying English now.",
              "She is reading a book.",
              "They are playing soccer.",
            ],
          },
          {
            id: "2",
            title: "과거완료형",
            structure: "had + p.p",
            explanation:
              "과거의 어떤 시점보다 더 이전에 일어난 일을 나타냅니다.",
            examples: [
              "I had finished my homework before dinner.",
              "She had already left when I arrived.",
              "They had been friends for years.",
            ],
          },
        ];
        console.log(`📊 문법 패턴 데이터: ${currentData.length}개`);
        break;

      case "reading":
        // 독해 예문 더미 데이터 (실제 구현 시 Firebase에서 로드)
        currentData = [
          {
            id: "1",
            korean: "안녕하세요. 만나서 반갑습니다.",
            english: "Hello. Nice to meet you.",
            context: "첫 만남 인사",
          },
          {
            id: "2",
            korean: "오늘 날씨가 정말 좋네요.",
            english: "The weather is really nice today.",
            context: "일상 대화",
          },
        ];
        console.log(`📖 독해 예문 데이터: ${currentData.length}개`);
        break;

      default:
        console.error(`❌ 알 수 없는 학습 영역: ${area}`);
    }

    if (currentData.length === 0) {
      showNoDataMessage(area);
    }
  } catch (error) {
    console.error("데이터 로딩 중 오류:", error);
    showNoDataMessage(area);
  }
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

    // 플래시카드 클릭 이벤트 추가
    const flashcard = document.querySelector(".flip-card");
    if (flashcard) {
      flashcard.addEventListener("click", flipCard);
    }
  } else {
    console.error("❌ 플래시카드 모드 요소를 찾을 수 없음");
    alert("플래시카드 모드를 시작할 수 없습니다.");
    showAreaSelection();
  }
}

function updateFlashcard() {
  if (!currentData || currentData.length === 0) return;

  const concept = currentData[currentIndex];
  const sourceLanguage = window.languageSettings?.sourceLanguage || "korean";
  const targetLanguage = window.languageSettings?.targetLanguage || "english";

  // 앞면: 원본 언어
  const frontWord = document.getElementById("front-word");
  const frontPronunciation = document.getElementById("front-pronunciation");

  if (concept.expressions && concept.expressions[sourceLanguage]) {
    const sourceExpr = concept.expressions[sourceLanguage];
    if (frontWord) frontWord.textContent = sourceExpr.word || "";
    if (frontPronunciation)
      frontPronunciation.textContent = sourceExpr.pronunciation || "";
  } else {
    // 대체 데이터 구조 지원
    if (frontWord)
      frontWord.textContent = concept[sourceLanguage] || concept.word || "단어";
    if (frontPronunciation) frontPronunciation.textContent = "";
  }

  // 뒷면: 목표 언어
  const backWord = document.getElementById("back-word");
  const backDefinition = document.getElementById("back-definition");

  if (concept.expressions && concept.expressions[targetLanguage]) {
    const targetExpr = concept.expressions[targetLanguage];
    if (backWord) backWord.textContent = targetExpr.word || "";
    if (backDefinition)
      backDefinition.textContent = targetExpr.definition || "";
  } else {
    // 대체 데이터 구조 지원
    if (backWord)
      backWord.textContent =
        concept[targetLanguage] || concept.meaning || "의미";
    if (backDefinition) backDefinition.textContent = concept.definition || "";
  }

  // 진행 상황 업데이트
  const progress = document.getElementById("card-progress");
  if (progress) {
    progress.textContent = `${currentIndex + 1} / ${currentData.length}`;
  }

  // 카드 앞면으로 리셋
  const card = document.querySelector(".flip-card");
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
  const sourceLanguage = window.languageSettings?.sourceLanguage || "korean";
  const targetLanguage = window.languageSettings?.targetLanguage || "english";

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

  const patternTitle = document.getElementById("pattern-title");
  const patternStructure = document.getElementById("pattern-structure");
  const patternExplanation = document.getElementById("pattern-explanation");
  const patternExamples = document.getElementById("pattern-examples");

  if (patternTitle) patternTitle.textContent = pattern.title || "문법 패턴";
  if (patternStructure) patternStructure.textContent = pattern.structure || "";
  if (patternExplanation)
    patternExplanation.textContent = pattern.explanation || "";

  if (patternExamples && pattern.examples) {
    patternExamples.innerHTML = pattern.examples
      .map((example) => `<li class="mb-2">${example}</li>`)
      .join("");
  }

  // 진행 상황 업데이트
  const progress = document.getElementById("pattern-progress");
  if (progress) {
    progress.textContent = `${currentIndex + 1} / ${currentData.length}`;
  }
}

function showGrammarPracticeMode() {
  console.log("📚 문법 실습 모드 시작");
  const practiceMode = document.getElementById("grammar-practice-mode");
  if (practiceMode) {
    practiceMode.classList.remove("hidden");
    updateGrammarPractice();
  } else {
    console.error("❌ 문법 실습 모드 요소를 찾을 수 없음");
    alert("문법 실습 모드를 시작할 수 없습니다.");
    showAreaSelection();
  }
}

function updateGrammarPractice() {
  if (!currentData || currentData.length === 0) return;

  const pattern = currentData[currentIndex];

  // 앞면: 패턴 구조
  const frontStructure = document.getElementById("grammar-front-structure");
  const frontTitle = document.getElementById("grammar-front-title");

  if (frontTitle) frontTitle.textContent = pattern.title || "문법 패턴";
  if (frontStructure) frontStructure.textContent = pattern.structure || "";

  // 뒷면: 설명과 예문
  const backExplanation = document.getElementById("grammar-back-explanation");
  const backExamples = document.getElementById("grammar-back-examples");

  if (backExplanation) backExplanation.textContent = pattern.explanation || "";

  if (backExamples && pattern.examples) {
    backExamples.innerHTML = pattern.examples
      .map((example) => `<li class="mb-1">${example}</li>`)
      .join("");
  }

  // 진행 상황 업데이트
  const progress = document.getElementById("grammar-practice-progress");
  if (progress) {
    progress.textContent = `${currentIndex + 1} / ${currentData.length}`;
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
      
      <div class="mt-6">
        <button onclick="flipReadingCard()" class="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-lg">
          카드 뒤집기
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
  if (!currentData || currentData.length === 0) return;

  currentIndex += direction;

  // 순환 처리
  if (currentIndex >= currentData.length) {
    currentIndex = 0;
  } else if (currentIndex < 0) {
    currentIndex = currentData.length - 1;
  }

  // 현재 모드에 따라 업데이트
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
