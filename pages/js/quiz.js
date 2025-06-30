import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
import {
  auth,
  db,
  supportedLanguages,
} from "../../js/firebase/firebase-init.js";
import {
  collection,
  query,
  getDocs,
  orderBy,
  where,
  limit,
  doc,
  setDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

// 전역 변수
let currentUser = null;
let quizData = null;
let timerInterval = null;
let elements = {};

// 페이지 초기화
document.addEventListener("DOMContentLoaded", async () => {
  try {
    console.log("🎯 퀴즈 페이지 초기화 시작");

    // 네비게이션바 로드
    await loadQuizNavbar();

    // DOM 요소 초기화
    initializeElements();

    // 이벤트 리스너 등록
    registerEventListeners();

    console.log("✅ 퀴즈 페이지 초기화 완료");
  } catch (error) {
    console.error("❌ 퀴즈 페이지 초기화 중 오류:", error);
    showError("페이지 초기화 중 오류가 발생했습니다.");
  }
});

// 네비게이션바 로드
async function loadQuizNavbar() {
  const navbarContainer = document.getElementById("navbar-container");
  if (navbarContainer) {
    try {
      const userLanguage = localStorage.getItem("userLanguage") || "ko";
      let navbarPath = `../locales/${userLanguage}/navbar.html`;

      // 현재 경로에 따라 상대 경로 조정
      if (window.location.pathname.includes("/locales/")) {
        navbarPath = "navbar.html";
      }

      const response = await fetch(navbarPath);
      if (response.ok) {
        const navbarHTML = await response.text();
        navbarContainer.innerHTML = navbarHTML;
        console.log("네비게이션바 로드 완료");
      } else {
        console.error("네비게이션바 로드 실패:", response.status);
      }
    } catch (error) {
      console.error("네비게이션바 로드 오류:", error);
    }
  }
}

// DOM 요소 초기화
function initializeElements() {
  elements = {
    sourceLanguage: document.getElementById("quiz-source-language"),
    targetLanguage: document.getElementById("quiz-target-language"),
    quizType: document.getElementById("quiz-type"),
    difficulty: document.getElementById("quiz-difficulty"),
    questionCount: document.getElementById("quiz-question-count"),
    startQuizBtn: document.getElementById("start-quiz-btn"),
    quizContainer: document.getElementById("quiz-container"),
    currentQuestion: document.getElementById("current-question"),
    totalQuestions: document.getElementById("total-questions"),
    quizProgress: document.getElementById("quiz-progress"),
    questionText: document.getElementById("question-text"),
    questionOptions: document.getElementById("question-options"),
    quizTimer: document.getElementById("quiz-timer"),
    skipBtn: document.getElementById("skip-question-btn"),
    quitBtn: document.getElementById("quit-quiz-btn"),
    quizResults: document.getElementById("quiz-results"),
    correctAnswers: document.getElementById("correct-answers"),
    quizScore: document.getElementById("quiz-score"),
    timeTaken: document.getElementById("time-taken"),
    retryBtn: document.getElementById("retry-quiz-btn"),
    newQuizBtn: document.getElementById("new-quiz-btn"),
    quizHistory: document.getElementById("quiz-history"),
  };
}

// 이벤트 리스너 등록
function registerEventListeners() {
  if (elements.startQuizBtn) {
    elements.startQuizBtn.addEventListener("click", startQuiz);
  }

  if (elements.skipBtn) {
    elements.skipBtn.addEventListener("click", skipQuestion);
  }

  if (elements.quitBtn) {
    elements.quitBtn.addEventListener("click", quitQuiz);
  }

  if (elements.retryBtn) {
    elements.retryBtn.addEventListener("click", retryQuiz);
  }

  if (elements.newQuizBtn) {
    elements.newQuizBtn.addEventListener("click", resetQuizSettings);
  }

  // 사용자 인증 상태 관찰
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      currentUser = user;
      await loadQuizHistory();
    } else {
      console.log("❌ 사용자가 로그인되지 않았습니다.");
      alert("로그인이 필요합니다.");
      window.redirectToLogin();
    }
  });
}

// 퀴즈 시작
async function startQuiz() {
  try {
    console.log("🎯 퀴즈 시작");

    const settings = {
      sourceLanguage: elements.sourceLanguage.value,
      targetLanguage: elements.targetLanguage.value,
      quizType: elements.quizType.value,
      difficulty: elements.difficulty.value,
      questionCount: parseInt(elements.questionCount.value),
    };

    if (settings.sourceLanguage === settings.targetLanguage) {
      showError("원어와 대상 언어가 같을 수 없습니다.");
      return;
    }

    elements.startQuizBtn.disabled = true;
    elements.startQuizBtn.textContent = "문제 준비 중...";

    const questions = await generateQuizQuestions(settings);

    if (questions.length === 0) {
      showError("선택한 조건에 맞는 문제를 찾을 수 없습니다.");
      elements.startQuizBtn.disabled = false;
      elements.startQuizBtn.textContent = "퀴즈 시작";
      return;
    }

    quizData = {
      settings,
      questions,
      currentQuestionIndex: 0,
      userAnswers: [],
      startTime: new Date(),
      isActive: true,
    };

    // UI 전환
    document.querySelector(
      ".bg-white.rounded-lg.shadow-md.p-6.mb-6"
    ).style.display = "none";
    elements.quizContainer.classList.remove("hidden");
    elements.quizResults.classList.add("hidden");

    displayQuestion();
    startTimer();

    console.log(`✅ 퀴즈 시작 완료: ${questions.length}문제`);
  } catch (error) {
    console.error("❌ 퀴즈 시작 중 오류:", error);
    showError("퀴즈를 시작할 수 없습니다.");
    elements.startQuizBtn.disabled = false;
    elements.startQuizBtn.textContent = "퀴즈 시작";
  }
}

// 퀴즈 문제 생성
async function generateQuizQuestions(settings) {
  try {
    console.log("📝 퀴즈 문제 생성 중:", settings);

    let conceptsQuery = query(
      collection(db, "concepts"),
      where("search_metadata.languages", "array-contains-any", [
        settings.sourceLanguage,
        settings.targetLanguage,
      ]),
      limit(settings.questionCount * 3)
    );

    if (settings.difficulty !== "all") {
      conceptsQuery = query(
        collection(db, "concepts"),
        where("search_metadata.languages", "array-contains-any", [
          settings.sourceLanguage,
          settings.targetLanguage,
        ]),
        where("concept_info.difficulty", "==", settings.difficulty),
        limit(settings.questionCount * 3)
      );
    }

    const conceptsSnapshot = await getDocs(conceptsQuery);
    const concepts = [];

    for (const docSnap of conceptsSnapshot.docs) {
      const conceptData = docSnap.data();

      if (
        conceptData.expressions?.[settings.sourceLanguage]?.word &&
        conceptData.expressions?.[settings.targetLanguage]?.word
      ) {
        concepts.push({
          id: docSnap.id,
          ...conceptData,
        });
      }
    }

    const questions = [];
    const shuffledConcepts = shuffleArray([...concepts]);

    for (
      let i = 0;
      i < Math.min(settings.questionCount, shuffledConcepts.length);
      i++
    ) {
      const concept = shuffledConcepts[i];
      const question = createTranslationQuestion(concept, settings, concepts);

      if (question) {
        questions.push(question);
      }
    }

    console.log(`✅ ${questions.length}개 문제 생성 완료`);
    return questions;
  } catch (error) {
    console.error("❌ 퀴즈 문제 생성 중 오류:", error);
    return [];
  }
}

// 번역 문제 생성
function createTranslationQuestion(concept, settings, allConcepts) {
  const sourceExpr = concept.expressions[settings.sourceLanguage];
  const targetExpr = concept.expressions[settings.targetLanguage];

  const isSourceToTarget = Math.random() < 0.5;
  const questionExpr = isSourceToTarget ? sourceExpr : targetExpr;
  const answerExpr = isSourceToTarget ? targetExpr : sourceExpr;

  const wrongOptions = allConcepts
    .filter((c) => c.id !== concept.id)
    .map((c) =>
      isSourceToTarget
        ? c.expressions[settings.targetLanguage]?.word
        : c.expressions[settings.sourceLanguage]?.word
    )
    .filter(Boolean)
    .slice(0, 3);

  const options = shuffleArray([answerExpr.word, ...wrongOptions]);

  return {
    id: concept.id,
    type: "translation",
    questionText: `다음 단어를 번역하세요: "${questionExpr.word}"`,
    hint: questionExpr.pronunciation || questionExpr.romanization || "",
    options,
    correctAnswer: answerExpr.word,
    explanation: answerExpr.definition || "",
    concept,
  };
}

// 문제 표시
function displayQuestion() {
  const question = quizData.questions[quizData.currentQuestionIndex];
  const progress =
    ((quizData.currentQuestionIndex + 1) / quizData.questions.length) * 100;

  // 진행률 업데이트
  elements.currentQuestion.textContent = quizData.currentQuestionIndex + 1;
  elements.totalQuestions.textContent = quizData.questions.length;
  elements.quizProgress.style.width = `${progress}%`;

  // 카테고리 표시
  const categoryElement = document.getElementById("question-category");
  if (categoryElement && question.concept) {
    const category = question.concept.concept_info?.category || "일반";
    const domain = question.concept.concept_info?.domain || "기타";
    categoryElement.textContent = `${domain} / ${category}`;
  }

  // 문제 텍스트 표시
  elements.questionText.textContent = question.questionText;

  // 힌트 표시
  const hintElement = document.getElementById("question-hint");
  if (hintElement && question.hint) {
    hintElement.classList.remove("hidden");
    hintElement.querySelector("span").textContent = question.hint;
  } else if (hintElement) {
    hintElement.classList.add("hidden");
  }

  // 이전 피드백 숨기기
  const feedbackElement = document.getElementById("answer-feedback");
  if (feedbackElement) {
    feedbackElement.classList.add("hidden");
  }

  // 선택지 생성
  elements.questionOptions.innerHTML = "";

  question.options?.forEach((option, index) => {
    const optionElement = document.createElement("button");
    optionElement.className =
      "w-full p-4 text-left border-2 border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 text-lg font-medium";
    optionElement.innerHTML = `
      <div class="flex items-center">
        <span class="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-4 text-sm font-bold">
          ${String.fromCharCode(65 + index)}
        </span>
        <span>${option}</span>
      </div>
    `;

    optionElement.addEventListener("click", () =>
      selectAnswer(option, optionElement)
    );
    elements.questionOptions.appendChild(optionElement);
  });
}

// 답안 선택
function selectAnswer(answer, optionElement) {
  const question = quizData.questions[quizData.currentQuestionIndex];
  const isCorrect = answer === question.correctAnswer;

  // 모든 선택지 비활성화
  const allOptions = elements.questionOptions.querySelectorAll("button");
  allOptions.forEach((btn) => {
    btn.disabled = true;
    btn.classList.remove("hover:border-blue-300", "hover:bg-blue-50");
  });

  // 선택한 옵션 스타일 업데이트
  if (isCorrect) {
    optionElement.classList.add(
      "border-green-500",
      "bg-green-50",
      "text-green-800"
    );
    optionElement.querySelector("span").classList.add("bg-green-200");
  } else {
    optionElement.classList.add("border-red-500", "bg-red-50", "text-red-800");
    optionElement.querySelector("span").classList.add("bg-red-200");

    // 정답 표시
    allOptions.forEach((btn) => {
      const optionText = btn.querySelector("span:last-child").textContent;
      if (optionText === question.correctAnswer) {
        btn.classList.add("border-green-500", "bg-green-50", "text-green-800");
        btn.querySelector("span").classList.add("bg-green-200");
      }
    });
  }

  // 피드백 표시
  showAnswerFeedback(isCorrect, question);

  // 답안 기록
  quizData.userAnswers.push({
    questionId: question.id,
    questionType: question.type,
    userAnswer: answer,
    correctAnswer: question.correctAnswer,
    isCorrect: isCorrect,
    timeSpent: (new Date() - quizData.startTime) / 1000,
  });

  // 2초 후 다음 문제로 이동
  setTimeout(() => {
    nextQuestion();
  }, 2000);
}

// 답안 피드백 표시
function showAnswerFeedback(isCorrect, question) {
  const feedbackElement = document.getElementById("answer-feedback");
  const feedbackContent = document.getElementById("feedback-content");

  if (!feedbackElement || !feedbackContent) return;

  if (isCorrect) {
    feedbackElement.className =
      "mt-6 p-4 rounded-lg bg-green-50 border border-green-200";
    feedbackContent.innerHTML = `
      <div class="flex items-center justify-center text-green-800">
        <i class="fas fa-check-circle text-2xl mr-3"></i>
        <div>
          <div class="font-bold text-lg">정답입니다!</div>
          ${
            question.explanation
              ? `<div class="text-sm mt-1">${question.explanation}</div>`
              : ""
          }
        </div>
      </div>
    `;
  } else {
    feedbackElement.className =
      "mt-6 p-4 rounded-lg bg-red-50 border border-red-200";
    feedbackContent.innerHTML = `
      <div class="flex items-center justify-center text-red-800">
        <i class="fas fa-times-circle text-2xl mr-3"></i>
        <div>
          <div class="font-bold text-lg">틀렸습니다</div>
          <div class="text-sm mt-1">정답: <span class="font-semibold">${
            question.correctAnswer
          }</span></div>
          ${
            question.explanation
              ? `<div class="text-sm mt-1">${question.explanation}</div>`
              : ""
          }
        </div>
      </div>
    `;
  }

  feedbackElement.classList.remove("hidden");
}

// 다음 문제
function nextQuestion() {
  quizData.currentQuestionIndex++;

  if (quizData.currentQuestionIndex >= quizData.questions.length) {
    finishQuiz();
  } else {
    displayQuestion();
  }
}

// 문제 건너뛰기
function skipQuestion() {
  const question = quizData.questions[quizData.currentQuestionIndex];

  quizData.userAnswers.push({
    questionId: question.id,
    questionType: question.type,
    userAnswer: null,
    correctAnswer: question.correctAnswer,
    isCorrect: false,
    timeSpent: 0,
    skipped: true,
  });

  nextQuestion();
}

// 퀴즈 종료
function quitQuiz() {
  if (confirm("정말로 퀴즈를 종료하시겠습니까?")) {
    quizData.isActive = false;
    resetQuizSettings();
  }
}

// 퀴즈 완료
async function finishQuiz() {
  try {
    console.log("🏁 퀴즈 완료");

    quizData.isActive = false;
    const endTime = new Date();
    const totalTime = Math.round((endTime - quizData.startTime) / 1000);

    const correctCount = quizData.userAnswers.filter((a) => a.isCorrect).length;
    const totalCount = quizData.userAnswers.length;
    const score = Math.round((correctCount / totalCount) * 100);

    await saveQuizResult({
      settings: quizData.settings,
      answers: quizData.userAnswers,
      score,
      correctCount,
      totalCount,
      totalTime,
      completedAt: endTime,
    });

    displayResults(correctCount, score, totalTime);

    console.log(`✅ 퀴즈 완료: ${correctCount}/${totalCount} (${score}%)`);
  } catch (error) {
    console.error("❌ 퀴즈 완료 처리 중 오류:", error);
  }
}

// 결과 표시
function displayResults(correctCount, score, totalTime) {
  elements.quizContainer.classList.add("hidden");
  elements.quizResults.classList.remove("hidden");

  elements.correctAnswers.textContent = correctCount;
  elements.quizScore.textContent = `${score}%`;
  elements.timeTaken.textContent = formatTime(totalTime);

  stopTimer();
}

// 퀴즈 결과 저장
async function saveQuizResult(result) {
  try {
    const resultId = `${currentUser.email}_quiz_${Date.now()}`;
    const resultDoc = {
      result_id: resultId,
      user_email: currentUser.email,
      quiz_type: result.settings.quizType,
      source_language: result.settings.sourceLanguage,
      target_language: result.settings.targetLanguage,
      difficulty: result.settings.difficulty,
      score: result.score,
      correct_answers: result.correctCount,
      total_questions: result.totalCount,
      time_spent: result.totalTime,
      answers: result.answers,
      completed_at: serverTimestamp(),
    };

    await setDoc(doc(db, "quiz_results", resultId), resultDoc);
    await loadQuizHistory();
  } catch (error) {
    console.error("퀴즈 결과 저장 중 오류:", error);
  }
}

// 퀴즈 재시도
function retryQuiz() {
  quizData = {
    settings: quizData.settings,
    questions: [],
    currentQuestionIndex: 0,
    userAnswers: [],
    startTime: null,
    isActive: false,
  };

  startQuiz();
}

// 퀴즈 설정 초기화
function resetQuizSettings() {
  document.querySelector(
    ".bg-white.rounded-lg.shadow-md.p-6.mb-6"
  ).style.display = "block";
  elements.quizContainer.classList.add("hidden");
  elements.quizResults.classList.add("hidden");

  elements.startQuizBtn.disabled = false;
  elements.startQuizBtn.textContent = "퀴즈 시작";

  stopTimer();

  quizData = {
    settings: {},
    questions: [],
    currentQuestionIndex: 0,
    userAnswers: [],
    startTime: null,
    isActive: false,
  };
}

// 퀴즈 기록 로드
async function loadQuizHistory() {
  try {
    if (!currentUser) return;

    // orderBy 제거하고 간단한 where 쿼리만 사용
    const historyQuery = query(
      collection(db, "quiz_results"),
      where("user_email", "==", currentUser.email),
      limit(10)
    );

    const historySnapshot = await getDocs(historyQuery);

    if (historySnapshot.empty) {
      elements.quizHistory.innerHTML = `
        <p class="text-gray-500 text-center py-8">아직 퀴즈 기록이 없습니다.</p>
      `;
      return;
    }

    // JavaScript로 정렬
    const sortedResults = historySnapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .sort((a, b) => {
        const aTime = a.completed_at?.toDate?.() || new Date(a.completed_at);
        const bTime = b.completed_at?.toDate?.() || new Date(b.completed_at);
        return bTime.getTime() - aTime.getTime(); // 최신순
      })
      .slice(0, 10); // 상위 10개만

    let historyHTML = "";
    sortedResults.forEach((data) => {
      historyHTML += `
        <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
          <div>
            <span class="font-medium">${data.quiz_type} 퀴즈</span>
            <span class="text-sm text-gray-600 ml-2">
              ${data.source_language} → ${data.target_language}
            </span>
          </div>
          <div class="text-right">
            <div class="font-medium text-${
              data.score >= 80 ? "green" : data.score >= 60 ? "yellow" : "red"
            }-600">
              ${data.score}%
            </div>
            <div class="text-xs text-gray-500">
              ${data.completed_at ? formatDate(data.completed_at.toDate()) : ""}
            </div>
          </div>
        </div>
      `;
    });

    elements.quizHistory.innerHTML = historyHTML;
  } catch (error) {
    console.error("퀴즈 기록 로드 중 오류:", error);
    elements.quizHistory.innerHTML = `
      <p class="text-red-500 text-center py-8">기록을 불러올 수 없습니다.</p>
    `;
  }
}

// 타이머 시작
function startTimer() {
  let seconds = 0;

  timerInterval = setInterval(() => {
    seconds++;
    elements.quizTimer.textContent = formatTime(seconds);
  }, 1000);
}

// 타이머 정지
function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

// 유틸리티 함수들
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
    .toString()
    .padStart(2, "0")}`;
}

function formatDate(date) {
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function showError(message) {
  alert(message);
}
