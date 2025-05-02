import { loadNavbar } from "../../components/js/navbar.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
import {
  auth,
  db,
  conceptUtils,
  supportedLanguages,
} from "../../js/firebase/firebase-init.js";

// 현재 사용자
let currentUser = null;

// 현재 학습 설정
let currentLearningConcepts = [];
let currentConceptIndex = 0;
let sourceLanguage = "korean";
let targetLanguage = "english";

// 학습 결과 추적
let typingStats = {
  correct: 0,
  wrong: 0,
};

// 퀴즈 모드 변수
let currentQuizOptions = [];
let selectedAnswerIndex = null;

document.addEventListener("DOMContentLoaded", async () => {
  try {
    // 네비게이션바 로드
    loadNavbar();

    // 이벤트 리스너 등록
    setupEventListeners();

    // 사용자 인증 상태 관찰
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        currentUser = user;

        // 언어 설정 로드
        sourceLanguage = document.getElementById("source-language").value;
        targetLanguage = document.getElementById("target-language").value;

        // 학습 데이터 로드
        await loadLearningConcepts();
      } else {
        alert("로그인이 필요합니다.");
        window.location.href = "../login.html";
      }
    });
  } catch (error) {
    console.error("페이지 초기화 중 오류 발생:", error);
    showError("페이지를 불러오는 중 문제가 발생했습니다: " + error.message);
  }
});

// 이벤트 리스너 설정
function setupEventListeners() {
  // 언어 선택 변경
  const sourceLanguageSelect = document.getElementById("source-language");
  const targetLanguageSelect = document.getElementById("target-language");

  if (sourceLanguageSelect) {
    sourceLanguageSelect.addEventListener("change", async function () {
      sourceLanguage = this.value;
      await loadLearningConcepts();
    });
  }

  if (targetLanguageSelect) {
    targetLanguageSelect.addEventListener("change", async function () {
      targetLanguage = this.value;
      await loadLearningConcepts();
    });
  }

  // 학습 모드 선택
  const flashcardModeBtn = document.getElementById("flashcard-mode");
  const quizModeBtn = document.getElementById("quiz-mode");
  const typingModeBtn = document.getElementById("typing-mode");

  if (flashcardModeBtn) {
    flashcardModeBtn.addEventListener("click", () => {
      showMode("flashcard");
      initFlashcardMode();
    });
  }

  if (quizModeBtn) {
    quizModeBtn.addEventListener("click", () => {
      showMode("quiz");
      initQuizMode();
    });
  }

  if (typingModeBtn) {
    typingModeBtn.addEventListener("click", () => {
      showMode("typing");
      initTypingMode();
    });
  }

  // 플래시카드 관련 이벤트
  const flipCard = document.getElementById("flip-card");
  const prevCard = document.getElementById("prev-card");
  const nextCard = document.getElementById("next-card");
  const flashcardElement = document.querySelector(".flip-card");

  if (flipCard) {
    flipCard.addEventListener("click", toggleFlipCard);
  }

  if (prevCard) {
    prevCard.addEventListener("click", () => {
      showPreviousConcept("flashcard");
    });
  }

  if (nextCard) {
    nextCard.addEventListener("click", () => {
      showNextConcept("flashcard");
    });
  }

  if (flashcardElement) {
    flashcardElement.addEventListener("click", toggleFlipCard);
  }

  // 퀴즈 관련 이벤트
  const nextQuestion = document.getElementById("next-question");

  if (nextQuestion) {
    nextQuestion.addEventListener("click", () => {
      showNextConcept("quiz");
    });
  }

  // 타이핑 관련 이벤트
  const checkAnswer = document.getElementById("check-answer");
  const nextTyping = document.getElementById("next-typing");
  const typingAnswer = document.getElementById("typing-answer");

  if (checkAnswer) {
    checkAnswer.addEventListener("click", checkTypingAnswer);
  }

  if (nextTyping) {
    nextTyping.addEventListener("click", () => {
      showNextConcept("typing");
    });
  }

  if (typingAnswer) {
    typingAnswer.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        checkTypingAnswer();
      }
    });
  }
}

// 학습 모드 표시
function showMode(mode) {
  // 모든 모드 숨기기
  document.getElementById("flashcard-container").classList.add("hidden");
  document.getElementById("quiz-container").classList.add("hidden");
  document.getElementById("typing-container").classList.add("hidden");

  // 선택한 모드 표시
  document.getElementById(`${mode}-container`).classList.remove("hidden");
}

// 학습 개념 로드
async function loadLearningConcepts() {
  try {
    if (!currentUser) return;

    // concepts 가져오기
    currentLearningConcepts = await conceptUtils.getConceptsForLearning(
      sourceLanguage,
      targetLanguage
    );

    // 인덱스 초기화
    currentConceptIndex = 0;

    // 학습 데이터가 없으면 메시지 표시
    if (currentLearningConcepts.length === 0) {
      showError(
        "학습할 단어가 없습니다. 다른 언어를 선택하거나 단어장에 단어를 추가해주세요."
      );
      return;
    }

    // 학습 통계 초기화
    typingStats = {
      correct: 0,
      wrong: 0,
    };

    updateTypingStats();
  } catch (error) {
    console.error("학습 데이터 로드 중 오류 발생:", error);
    showError("학습 데이터를 불러올 수 없습니다: " + error.message);
  }
}

// 오류 메시지 표시
function showError(message) {
  const container = document.querySelector("main");
  if (container) {
    // 기존 오류 메시지 제거
    const existingError = container.querySelector(".error-message");
    if (existingError) {
      existingError.remove();
    }

    // 새 오류 메시지 추가
    const errorDiv = document.createElement("div");
    errorDiv.className =
      "bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative my-4 error-message";
    errorDiv.innerHTML = `
      <strong class="font-bold">오류!</strong>
      <span class="block sm:inline">${message}</span>
    `;

    container.appendChild(errorDiv);
  }
}

// 플래시카드 모드 초기화
function initFlashcardMode() {
  if (currentLearningConcepts.length === 0) return;

  // 첫 번째 단어 표시
  displayFlashcard(currentLearningConcepts[currentConceptIndex]);

  // 진행 상황 표시
  updateProgress(
    "card",
    currentConceptIndex + 1,
    currentLearningConcepts.length
  );
}

// 플래시카드 표시
function displayFlashcard(concept) {
  if (!concept) return;

  const sourceExpression = concept.fromExpression;
  const targetExpression = concept.toExpression;

  // 카테고리 표시
  document.getElementById("card-category").textContent =
    concept.conceptInfo.domain + " / " + concept.conceptInfo.category;

  // 앞면 (원본 언어)
  document.getElementById("front-word").textContent = sourceExpression.word;
  document.getElementById("front-pronunciation").textContent =
    sourceExpression.pronunciation || "";

  // 뒷면 (대상 언어)
  document.getElementById("back-word").textContent = targetExpression.word;
  document.getElementById("back-pronunciation").textContent =
    targetExpression.pronunciation || "";
  document.getElementById("back-definition").textContent =
    targetExpression.definition || "";

  // 예문
  const exampleContainer = document.getElementById("example-container");

  if (concept.examples && concept.examples.length > 0) {
    exampleContainer.classList.remove("hidden");
    document.getElementById("example").textContent =
      concept.examples[0].from || "";
    document.getElementById("example-translation").textContent =
      concept.examples[0].to || "";
  } else {
    exampleContainer.classList.add("hidden");
  }

  // 카드 초기화 (앞면 보이게)
  resetFlipCard();
}

// 플래시카드 뒤집기
function toggleFlipCard() {
  const card = document.querySelector(".flip-card");
  card.classList.toggle("flipped");
}

// 플래시카드 초기화 (앞면으로)
function resetFlipCard() {
  const card = document.querySelector(".flip-card");
  card.classList.remove("flipped");
}

// 퀴즈 모드 초기화
function initQuizMode() {
  if (currentLearningConcepts.length === 0) return;

  // 첫 번째 문제 표시
  displayQuiz(currentLearningConcepts[currentConceptIndex]);

  // 진행 상황 표시
  updateProgress(
    "quiz",
    currentConceptIndex + 1,
    currentLearningConcepts.length
  );
}

// 퀴즈 표시
function displayQuiz(concept) {
  if (!concept) return;

  const sourceExpression = concept.fromExpression;
  const targetExpression = concept.toExpression;

  // 퀴즈 카테고리 표시
  document.getElementById("quiz-category").textContent =
    concept.conceptInfo.domain + " / " + concept.conceptInfo.category;

  // 문제 표시
  document.getElementById(
    "quiz-question"
  ).textContent = `"${sourceExpression.word}"의 ${supportedLanguages[targetLanguage].nameKo} 표현은?`;

  // 정답 선택지 만들기
  createQuizOptions(concept);

  // 결과 영역 초기화
  const resultElement = document.getElementById("quiz-result");
  resultElement.classList.add("hidden");

  // 다음 문제 버튼 숨기기
  document.getElementById("next-question").classList.add("hidden");
}

// 퀴즈 선택지 생성
function createQuizOptions(concept) {
  // 정답
  const correctAnswer = concept.toExpression.word;

  // 오답 가져오기 (최대 3개)
  const wrongAnswers = getWrongAnswers(correctAnswer, 3);

  // 선택지 생성 (정답 + 오답, 무작위 순서)
  const options = [correctAnswer, ...wrongAnswers];
  shuffleArray(options);

  // 선택지 인덱스 저장
  currentQuizOptions = options;
  selectedAnswerIndex = null;

  // 선택지 UI 생성
  const optionsContainer = document.getElementById("quiz-options");
  optionsContainer.innerHTML = "";

  options.forEach((option, index) => {
    const optionElement = document.createElement("button");
    optionElement.className =
      "border p-4 rounded text-left hover:bg-gray-100 transition";
    optionElement.textContent = option;
    optionElement.dataset.index = index;

    optionElement.addEventListener("click", function () {
      checkQuizAnswer(this.dataset.index);
    });

    optionsContainer.appendChild(optionElement);
  });
}

// 퀴즈 오답 생성
function getWrongAnswers(correctAnswer, count) {
  // 다른 단어들에서 오답 선택
  const wrongAnswers = [];

  // 현재 단어와 다른 언어 표현에서 가져오기
  for (const concept of currentLearningConcepts) {
    const wrongOption = concept.toExpression.word;

    if (wrongOption !== correctAnswer && !wrongAnswers.includes(wrongOption)) {
      wrongAnswers.push(wrongOption);

      if (wrongAnswers.length >= count) {
        break;
      }
    }
  }

  // 충분한 오답이 없으면 더미 데이터로 채우기
  while (wrongAnswers.length < count) {
    const dummyOption = "Dummy option " + (wrongAnswers.length + 1);
    wrongAnswers.push(dummyOption);
  }

  return wrongAnswers;
}

// 퀴즈 답변 확인
function checkQuizAnswer(index) {
  if (selectedAnswerIndex !== null) return; // 이미 답변했으면 무시

  selectedAnswerIndex = index;
  const currentConcept = currentLearningConcepts[currentConceptIndex];
  const correctAnswer = currentConcept.toExpression.word;
  const selectedAnswer = currentQuizOptions[index];

  // 모든 선택지 비활성화
  const optionElements = document.querySelectorAll("#quiz-options button");
  optionElements.forEach((elem) => {
    elem.disabled = true;
  });

  // 선택한 답변 강조
  const selectedOption = document.querySelector(
    `#quiz-options button[data-index="${index}"]`
  );

  if (selectedAnswer === correctAnswer) {
    // 정답
    selectedOption.classList.add(
      "bg-green-100",
      "border-green-500",
      "font-bold"
    );

    // 결과 메시지
    const resultElement = document.getElementById("quiz-result");
    resultElement.textContent = "정답입니다! 👏";
    resultElement.className = "mt-6 p-4 rounded bg-green-100 text-green-800";
    resultElement.classList.remove("hidden");
  } else {
    // 오답
    selectedOption.classList.add("bg-red-100", "border-red-500");

    // 정답 표시
    optionElements.forEach((elem) => {
      if (elem.textContent === correctAnswer) {
        elem.classList.add("bg-green-100", "border-green-500", "font-bold");
      }
    });

    // 결과 메시지
    const resultElement = document.getElementById("quiz-result");
    resultElement.innerHTML = `<p>오답입니다. 정답은 <strong>"${correctAnswer}"</strong> 입니다.</p>`;
    if (currentConcept.toExpression.pronunciation) {
      resultElement.innerHTML += `<p class="mt-2">발음: ${currentConcept.toExpression.pronunciation}</p>`;
    }
    resultElement.className = "mt-6 p-4 rounded bg-red-100 text-red-800";
    resultElement.classList.remove("hidden");
  }

  // 다음 문제 버튼 표시
  document.getElementById("next-question").classList.remove("hidden");
}

// 타이핑 모드 초기화
function initTypingMode() {
  if (currentLearningConcepts.length === 0) return;

  // 첫 번째 단어 표시
  displayTypingQuestion(currentLearningConcepts[currentConceptIndex]);

  // 진행 상황 표시
  updateProgress(
    "typing",
    currentConceptIndex + 1,
    currentLearningConcepts.length
  );

  // 통계 업데이트
  updateTypingStats();
}

// 타이핑 문제 표시
function displayTypingQuestion(concept) {
  if (!concept) return;

  const sourceExpression = concept.fromExpression;

  // 카테고리 표시
  document.getElementById("typing-category").textContent =
    concept.conceptInfo.domain + " / " + concept.conceptInfo.category;

  // 문제 단어 표시
  document.getElementById("typing-word").textContent = sourceExpression.word;
  document.getElementById("typing-pronunciation").textContent =
    sourceExpression.pronunciation || "";

  // 입력창 초기화
  const answerInput = document.getElementById("typing-answer");
  answerInput.value = "";
  answerInput.disabled = false;
  answerInput.focus();

  // 결과 영역 초기화
  const resultElement = document.getElementById("typing-result");
  resultElement.classList.add("hidden");

  // 확인 버튼 표시, 다음 버튼 숨기기
  document.getElementById("check-answer").classList.remove("hidden");
  document.getElementById("next-typing").classList.add("hidden");
}

// 타이핑 답변 확인
function checkTypingAnswer() {
  const currentConcept = currentLearningConcepts[currentConceptIndex];
  const correctAnswer = currentConcept.toExpression.word;
  const userAnswer = document.getElementById("typing-answer").value.trim();

  // 입력창 비활성화
  document.getElementById("typing-answer").disabled = true;

  // 버튼 토글
  document.getElementById("check-answer").classList.add("hidden");
  document.getElementById("next-typing").classList.remove("hidden");

  // 결과 표시
  const resultElement = document.getElementById("typing-result");

  if (userAnswer.toLowerCase() === correctAnswer.toLowerCase()) {
    // 정답
    resultElement.textContent = "정답입니다! 👏";
    resultElement.className = "mt-4 p-4 rounded bg-green-100 text-green-800";
    typingStats.correct++;
  } else {
    // 오답
    resultElement.innerHTML = `
      <p>오답입니다. 정답은 <strong>"${correctAnswer}"</strong> 입니다.</p>
      ${
        currentConcept.toExpression.pronunciation
          ? `<p class="mt-2">발음: ${currentConcept.toExpression.pronunciation}</p>`
          : ""
      }
      ${
        currentConcept.toExpression.definition
          ? `<p class="mt-2">의미: ${currentConcept.toExpression.definition}</p>`
          : ""
      }
    `;
    resultElement.className = "mt-4 p-4 rounded bg-red-100 text-red-800";
    typingStats.wrong++;
  }

  resultElement.classList.remove("hidden");

  // 통계 업데이트
  updateTypingStats();
}

// 타이핑 통계 업데이트
function updateTypingStats() {
  document.getElementById(
    "typing-correct"
  ).textContent = `맞춘 개수: ${typingStats.correct}`;
  document.getElementById(
    "typing-wrong"
  ).textContent = `틀린 개수: ${typingStats.wrong}`;
}

// 진행 상황 업데이트
function updateProgress(mode, current, total) {
  const progressElement = document.getElementById(`${mode}-progress`);
  if (progressElement) {
    progressElement.textContent = `${current}/${total}`;
  }
}

// 다음 개념 표시
function showNextConcept(mode) {
  if (currentConceptIndex >= currentLearningConcepts.length - 1) {
    // 마지막 단어면 첫 번째로 돌아가기
    currentConceptIndex = 0;
  } else {
    // 다음 단어
    currentConceptIndex++;
  }

  // 모드에 따라 표시 함수 호출
  switch (mode) {
    case "flashcard":
      displayFlashcard(currentLearningConcepts[currentConceptIndex]);
      updateProgress(
        "card",
        currentConceptIndex + 1,
        currentLearningConcepts.length
      );
      break;
    case "quiz":
      displayQuiz(currentLearningConcepts[currentConceptIndex]);
      updateProgress(
        "quiz",
        currentConceptIndex + 1,
        currentLearningConcepts.length
      );
      break;
    case "typing":
      displayTypingQuestion(currentLearningConcepts[currentConceptIndex]);
      updateProgress(
        "typing",
        currentConceptIndex + 1,
        currentLearningConcepts.length
      );
      break;
  }
}

// 이전 개념 표시
function showPreviousConcept(mode) {
  if (currentConceptIndex <= 0) {
    // 첫 번째 단어면 마지막으로 이동
    currentConceptIndex = currentLearningConcepts.length - 1;
  } else {
    // 이전 단어
    currentConceptIndex--;
  }

  // 모드에 따라 표시 함수 호출
  switch (mode) {
    case "flashcard":
      displayFlashcard(currentLearningConcepts[currentConceptIndex]);
      updateProgress(
        "card",
        currentConceptIndex + 1,
        currentLearningConcepts.length
      );
      break;
  }
}

// 배열 무작위 섞기 (Fisher-Yates 알고리즘)
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
