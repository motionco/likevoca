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
      showError(
        getTranslatedText("same_language_error") ||
          "원어와 대상 언어가 같을 수 없습니다."
      );
      return;
    }

    elements.startQuizBtn.disabled = true;
    elements.startQuizBtn.textContent =
      getTranslatedText("preparing_questions") || "문제 준비 중...";

    const questions = await generateQuizQuestions(settings);

    if (questions.length === 0) {
      showError(
        getTranslatedText("no_questions_found") ||
          "선택한 조건에 맞는 문제를 찾을 수 없습니다."
      );
      elements.startQuizBtn.disabled = false;
      elements.startQuizBtn.textContent =
        getTranslatedText("start_quiz") || "퀴즈 시작";
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
    showError(
      getTranslatedText("quiz_start_error") || "퀴즈를 시작할 수 없습니다."
    );
    elements.startQuizBtn.disabled = false;
    elements.startQuizBtn.textContent =
      getTranslatedText("start_quiz") || "퀴즈 시작";
  }
}

// 퀴즈 문제 생성 (concepts 컬렉션 기반)
async function generateQuizQuestions(settings) {
  try {
    console.log("📝 퀴즈 문제 생성 중:", settings);

    // 현재 사용자 확인
    if (!currentUser) {
      throw new Error("사용자가 로그인되지 않았습니다.");
    }

    // concepts 컬렉션에서 사용자 데이터 조회 (다양한 필드 시도)
    console.log("🔍 사용자 정보:", {
      uid: currentUser.uid,
      email: currentUser.email,
    });

    // 먼저 userId로 시도
    let conceptsQuery = query(
      collection(db, "concepts"),
      where("userId", "==", currentUser.uid),
      limit(100)
    );

    let conceptsSnapshot = await getDocs(conceptsQuery);
    console.log(`📚 userId로 조회 결과: ${conceptsSnapshot.docs.length}개`);

    // userId로 조회되지 않으면 user_email로 시도
    if (conceptsSnapshot.docs.length === 0) {
      console.log("🔄 user_email로 재시도...");
      conceptsQuery = query(
        collection(db, "concepts"),
        where("userId", "==", currentUser.email),
        limit(100)
      );
      conceptsSnapshot = await getDocs(conceptsQuery);
      console.log(
        `📚 user_email로 조회 결과: ${conceptsSnapshot.docs.length}개`
      );
    }

    // 여전히 없으면 전체 컬렉션에서 조회 (테스트용)
    if (conceptsSnapshot.docs.length === 0) {
      console.log("🔧 전체 concepts 컬렉션에서 조회 중...");
      conceptsSnapshot = await getDocs(
        query(collection(db, "concepts"), limit(100))
      );
      console.log(`📚 전체 조회 결과: ${conceptsSnapshot.docs.length}개`);

      // 각 문서의 구조를 로깅
      if (conceptsSnapshot.docs.length > 0) {
        const sampleDoc = conceptsSnapshot.docs[0].data();
        console.log("📋 샘플 문서 구조:", {
          id: conceptsSnapshot.docs[0].id,
          hasUserId: !!sampleDoc.userId,
          hasUserEmail: !!sampleDoc.user_email,
          keys: Object.keys(sampleDoc),
        });
      }
    }

    const allConcepts = [];

    console.log(`📚 총 ${conceptsSnapshot.docs.length}개 개념 데이터 조회`);

    // 각 개념 데이터를 파싱하고 필터링
    for (const docSnap of conceptsSnapshot.docs) {
      const conceptData = docSnap.data();

      // expressions 필드에서 source/target 언어 데이터 확인
      const sourceExpression =
        conceptData.expressions?.[settings.sourceLanguage];
      const targetExpression =
        conceptData.expressions?.[settings.targetLanguage];

      if (sourceExpression?.word && targetExpression?.word) {
        // 난이도 필터링
        if (
          settings.difficulty === "all" ||
          conceptData.concept_info?.difficulty === settings.difficulty
        ) {
          allConcepts.push({
            id: docSnap.id,
            ...conceptData,
          });
        }
      }
    }

    console.log(`✅ 필터링된 개념: ${allConcepts.length}개`);

    if (allConcepts.length === 0) {
      console.log("❌ 조건에 맞는 개념이 없습니다");
      return [];
    }

    // 퀴즈 문제 생성
    const questions = [];
    const usedConcepts = new Set();
    const availableCount = Math.min(settings.questionCount, allConcepts.length);

    // 개념을 섞어서 랜덤 선택
    const shuffledConcepts = shuffleArray([...allConcepts]);

    for (let i = 0; i < availableCount; i++) {
      const concept = shuffledConcepts[i];

      if (usedConcepts.has(concept.id)) {
        continue;
      }

      usedConcepts.add(concept.id);

      let question;
      if (settings.quizType === "translation") {
        question = createTranslationQuestion(concept, settings, allConcepts);
      }
      // 추후 다른 퀴즈 타입 추가 가능

      if (question) {
        questions.push(question);
      }
    }

    console.log(`🎯 최종 생성된 문제: ${questions.length}개`);
    return questions;
  } catch (error) {
    console.error("❌ 퀴즈 문제 생성 중 오류:", error);
    return [];
  }
}

// 번역 문제 생성 (concepts 구조 기반)
function createTranslationQuestion(concept, settings, allConcepts) {
  try {
    const sourceExpr = concept.expressions[settings.sourceLanguage];
    const targetExpr = concept.expressions[settings.targetLanguage];

    if (!sourceExpr?.word || !targetExpr?.word) {
      console.error("❌ 언어 데이터가 부족합니다:", concept.id);
      return null;
    }

    // 문제 방향 결정 (원어 → 대상언어 또는 그 반대)
    const isSourceToTarget = Math.random() < 0.5;
    const questionExpr = isSourceToTarget ? sourceExpr : targetExpr;
    const answerExpr = isSourceToTarget ? targetExpr : sourceExpr;
    const answerLanguage = isSourceToTarget
      ? settings.targetLanguage
      : settings.sourceLanguage;

    // 같은 카테고리나 도메인에서 오답 선택지 생성
    const sameCategory = allConcepts.filter(
      (c) =>
        c.id !== concept.id &&
        c.concept_info?.category === concept.concept_info?.category &&
        c.expressions[answerLanguage]?.word
    );

    const sameDomain = allConcepts.filter(
      (c) =>
        c.id !== concept.id &&
        c.concept_info?.domain === concept.concept_info?.domain &&
        c.expressions[answerLanguage]?.word &&
        !sameCategory.find((sc) => sc.id === c.id)
    );

    const otherConcepts = allConcepts.filter(
      (c) =>
        c.id !== concept.id &&
        c.expressions[answerLanguage]?.word &&
        !sameCategory.find((sc) => sc.id === c.id) &&
        !sameDomain.find((sd) => sd.id === c.id)
    );

    // 오답 선택지 우선순위: 같은 카테고리 > 같은 도메인 > 다른 개념
    let wrongOptions = [];

    // 같은 카테고리에서 1-2개
    if (sameCategory.length > 0) {
      const shuffledSameCategory = shuffleArray(sameCategory);
      wrongOptions.push(
        ...shuffledSameCategory
          .slice(0, 2)
          .map((c) => c.expressions[answerLanguage].word)
      );
    }

    // 같은 도메인에서 추가
    if (wrongOptions.length < 3 && sameDomain.length > 0) {
      const shuffledSameDomain = shuffleArray(sameDomain);
      const needed = 3 - wrongOptions.length;
      wrongOptions.push(
        ...shuffledSameDomain
          .slice(0, needed)
          .map((c) => c.expressions[answerLanguage].word)
      );
    }

    // 다른 개념에서 나머지 채우기
    if (wrongOptions.length < 3 && otherConcepts.length > 0) {
      const shuffledOthers = shuffleArray(otherConcepts);
      const needed = 3 - wrongOptions.length;
      wrongOptions.push(
        ...shuffledOthers
          .slice(0, needed)
          .map((c) => c.expressions[answerLanguage].word)
      );
    }

    // 중복 제거 및 정답과 다른지 확인
    wrongOptions = [...new Set(wrongOptions)]
      .filter((option) => option !== answerExpr.word)
      .slice(0, 3);

    // 선택지가 부족하면 문제 생성 실패
    if (wrongOptions.length < 2) {
      console.warn("⚠️ 오답 선택지가 부족합니다:", concept.id);
      return null;
    }

    // 모든 선택지 섞기
    const options = shuffleArray([answerExpr.word, ...wrongOptions]);

    // 문제 텍스트 생성
    const translatePrompt =
      getTranslatedText("translate_this_word") || "다음 단어를 번역하세요";

    // 카테고리 정보 생성
    const categoryInfo =
      concept.concept_info?.domain && concept.concept_info?.category
        ? `${concept.concept_info.domain} / ${concept.concept_info.category}`
        : concept.concept_info?.domain || "일반";

    return {
      id: concept.id,
      type: "translation",
      questionText: `${translatePrompt}: "${questionExpr.word}"`,
      hint: questionExpr.pronunciation || "",
      options,
      correctAnswer: answerExpr.word,
      explanation: answerExpr.definition || targetExpr.definition || "",
      category: categoryInfo,
      difficulty: concept.concept_info?.difficulty || "basic",
      emoji: concept.concept_info?.unicode_emoji || "📝",
      concept,
    };
  } catch (error) {
    console.error("❌ 번역 문제 생성 오류:", error, concept.id);
    return null;
  }
}

// 문제 표시 (새로운 concepts 구조 지원)
function displayQuestion() {
  const question = quizData.questions[quizData.currentQuestionIndex];
  const progress =
    ((quizData.currentQuestionIndex + 1) / quizData.questions.length) * 100;

  // 진행률 업데이트
  elements.currentQuestion.textContent = quizData.currentQuestionIndex + 1;
  elements.totalQuestions.textContent = quizData.questions.length;
  elements.quizProgress.style.width = `${progress}%`;

  // 카테고리 표시 (이모지 포함)
  const categoryElement = document.getElementById("question-category");
  if (categoryElement) {
    const emoji = question.emoji || "📝";
    const category = question.category || "일반";
    const difficulty = question.difficulty || "basic";

    // 난이도 표시를 위한 색상 설정
    const difficultyColors = {
      basic: "bg-green-100 text-green-800",
      intermediate: "bg-yellow-100 text-yellow-800",
      advanced: "bg-red-100 text-red-800",
      fluent: "bg-purple-100 text-purple-800",
      technical: "bg-gray-100 text-gray-800",
    };

    const colorClass =
      difficultyColors[difficulty] || "bg-blue-100 text-blue-800";
    categoryElement.className = `text-sm px-3 py-1 rounded-full inline-block mb-4 ${colorClass}`;
    categoryElement.textContent = `${emoji} ${category}`;
  }

  // 문제 텍스트 표시
  elements.questionText.textContent = question.questionText;

  // 힌트 표시 (발음 정보)
  const hintElement = document.getElementById("question-hint");
  if (hintElement && question.hint && question.hint.trim()) {
    hintElement.classList.remove("hidden");
    const hintSpan = hintElement.querySelector("span");
    if (hintSpan) {
      hintSpan.textContent = `발음: ${question.hint}`;
    }
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

  if (question.options && question.options.length > 0) {
    question.options.forEach((option, index) => {
      const optionElement = document.createElement("button");
      optionElement.className =
        "w-full p-4 text-left border-2 border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 text-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500";

      optionElement.innerHTML = `
        <div class="flex items-center">
          <span class="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-4 text-sm font-bold">
            ${String.fromCharCode(65 + index)}
          </span>
          <span class="flex-1">${option}</span>
        </div>
      `;

      optionElement.addEventListener("click", () =>
        selectAnswer(option, optionElement)
      );

      // 키보드 접근성 추가
      optionElement.setAttribute("tabindex", "0");
      optionElement.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          selectAnswer(option, optionElement);
        }
      });

      elements.questionOptions.appendChild(optionElement);
    });
  } else {
    // 선택지가 없는 경우 오류 메시지
    elements.questionOptions.innerHTML = `
      <div class="text-center text-red-600 p-4">
        <i class="fas fa-exclamation-triangle text-2xl mb-2"></i>
        <p>문제 선택지를 불러올 수 없습니다.</p>
      </div>
    `;
  }
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

// 답안 피드백 표시 (concepts 구조 기반)
function showAnswerFeedback(isCorrect, question) {
  const feedbackElement = document.getElementById("answer-feedback");
  const feedbackContent = document.getElementById("feedback-content");

  if (!feedbackElement || !feedbackContent) return;

  // 번역된 메시지 가져오기
  const correctMsg = getTranslatedText("correct_answer") || "정답입니다! 🎉";
  const wrongMsg = getTranslatedText("wrong_answer") || "틀렸습니다";

  if (isCorrect) {
    feedbackElement.className =
      "mt-6 p-4 rounded-lg bg-green-100 border border-green-300";
    feedbackContent.innerHTML = `
      <div class="flex items-start text-green-800">
        <i class="fas fa-check-circle text-2xl mr-3 mt-1"></i>
        <div class="flex-1">
          <div class="font-bold text-lg">${correctMsg}</div>
          ${
            question.explanation
              ? `
            <div class="text-sm mt-2 p-2 bg-green-50 rounded-lg">
              <i class="fas fa-info-circle mr-1"></i>
              ${question.explanation}
            </div>
          `
              : ""
          }
          ${
            question.category
              ? `
            <div class="text-xs text-green-600 mt-2">
              ${question.emoji || "📝"} ${question.category}
            </div>
          `
              : ""
          }
        </div>
      </div>
    `;
  } else {
    feedbackElement.className =
      "mt-6 p-4 rounded-lg bg-red-100 border border-red-300";
    feedbackContent.innerHTML = `
      <div class="flex items-start text-red-800">
        <i class="fas fa-times-circle text-2xl mr-3 mt-1"></i>
        <div class="flex-1">
          <div class="font-bold text-lg">${wrongMsg}</div>
          <div class="text-lg font-bold mt-1 text-red-900">정답: ${
            question.correctAnswer
          }</div>
          ${
            question.explanation
              ? `
            <div class="text-sm mt-2 p-2 bg-red-50 rounded-lg">
              <i class="fas fa-info-circle mr-1"></i>
              ${question.explanation}
            </div>
          `
              : ""
          }
          ${
            question.category
              ? `
            <div class="text-xs text-red-600 mt-2">
              ${question.emoji || "📝"} ${question.category}
            </div>
          `
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
  const confirmMsg =
    getTranslatedText("quit_quiz_confirm") || "정말로 퀴즈를 종료하시겠습니까?";
  if (confirm(confirmMsg)) {
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
  elements.startQuizBtn.textContent =
    getTranslatedText("start_quiz") || "퀴즈 시작";

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

// 번역 텍스트 가져오기 함수 (language-utils에서 가져옴)
function getTranslatedText(key) {
  try {
    // 전역 번역 함수가 있으면 사용
    if (typeof window.getTranslatedText === "function") {
      return window.getTranslatedText(key);
    }

    // localStorage에서 번역 데이터 직접 가져오기
    const currentLanguage = localStorage.getItem("userLanguage") || "ko";
    const translations = JSON.parse(
      localStorage.getItem(`translations_${currentLanguage}`)
    );
    return translations && translations[key] ? translations[key] : null;
  } catch (error) {
    console.error("번역 텍스트 가져오기 오류:", error);
    return null;
  }
}
