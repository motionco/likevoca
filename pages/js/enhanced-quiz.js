import { loadNavbar } from "../../components/js/navbar.js";
import {
  db,
  conceptUtils,
  quizTemplateUtils,
  userProgressUtils,
  mediaUtils,
} from "../../js/firebase/firebase-init.js";
import { getActiveLanguage } from "../../utils/language-utils.js";

// 퀴즈 전역 변수
let currentUser = null;
let currentQuiz = null;
let quizQuestions = [];
let currentQuestionIndex = 0;
let score = 0;
let timeLeft = 0;
let timerInterval = null;
let quizStartTime = null;

// 퀴즈 설정
let quizSettings = {
  fromLanguage: "korean",
  toLanguage: "english",
  difficulty: "basic",
  questionCount: 10,
  timeLimit: 300, // 5분
  questionTypes: ["translation", "multiple_choice", "fill_blank"],
  showHints: true,
  playAudio: true,
};

// 퀴즈 타입별 설정
const quizTypeConfigs = {
  translation: {
    name: "번역 퀴즈",
    description: "단어나 문장을 다른 언어로 번역",
    points: 10,
    timePerQuestion: 30,
  },
  multiple_choice: {
    name: "객관식 퀴즈",
    description: "정답을 선택지에서 고르기",
    points: 8,
    timePerQuestion: 20,
  },
  fill_blank: {
    name: "빈칸 채우기",
    description: "문장의 빈칸에 알맞은 단어 입력",
    points: 12,
    timePerQuestion: 25,
  },
  pronunciation: {
    name: "발음 퀴즈",
    description: "올바른 발음 선택하기",
    points: 8,
    timePerQuestion: 15,
  },
  matching: {
    name: "매칭 퀴즈",
    description: "단어와 의미 연결하기",
    points: 6,
    timePerQuestion: 20,
  },
};

// 페이지 초기화
document.addEventListener("DOMContentLoaded", async () => {
  try {
    await loadNavbar();

    // 사용자 인증 상태 확인
    const { onAuthStateChanged } = await import(
      "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js"
    );
    const { auth } = await import("../../js/firebase/firebase-init.js");

    onAuthStateChanged(auth, (user) => {
      currentUser = user;
      if (user) {
        initializeQuizInterface();
      } else {
        showLoginRequired();
      }
    });
  } catch (error) {
    console.error("페이지 초기화 중 오류 발생:", error);
  }
});

// 퀴즈 인터페이스 초기화
async function initializeQuizInterface() {
  try {
    // 사용자 진도 정보 로드
    const userProgress = await userProgressUtils.getUserProgress(
      currentUser.email
    );
    updateUserStats(userProgress);

    // 퀴즈 설정 UI 초기화
    setupQuizSettings();

    // 이벤트 리스너 등록
    setupEventListeners();

    // 퀴즈 템플릿 로드
    await loadQuizTemplates();
  } catch (error) {
    console.error("퀴즈 인터페이스 초기화 중 오류:", error);
  }
}

// 퀴즈 설정 UI 설정
function setupQuizSettings() {
  // 언어 선택 옵션 설정
  const fromLangSelect = document.getElementById("quiz-from-language");
  const toLangSelect = document.getElementById("quiz-to-language");

  if (fromLangSelect && toLangSelect) {
    const languages = [
      { code: "korean", name: "한국어" },
      { code: "english", name: "영어" },
      { code: "japanese", name: "일본어" },
      { code: "chinese", name: "중국어" },
    ];

    languages.forEach((lang) => {
      fromLangSelect.innerHTML += `<option value="${lang.code}">${lang.name}</option>`;
      toLangSelect.innerHTML += `<option value="${lang.code}">${lang.name}</option>`;
    });

    fromLangSelect.value = quizSettings.fromLanguage;
    toLangSelect.value = quizSettings.toLanguage;
  }

  // 난이도 선택
  const difficultySelect = document.getElementById("quiz-difficulty");
  if (difficultySelect) {
    difficultySelect.value = quizSettings.difficulty;
  }

  // 문제 수 설정
  const questionCountInput = document.getElementById("quiz-question-count");
  if (questionCountInput) {
    questionCountInput.value = quizSettings.questionCount;
  }

  // 퀴즈 타입 체크박스 설정
  const quizTypesContainer = document.getElementById("quiz-types");
  if (quizTypesContainer) {
    Object.entries(quizTypeConfigs).forEach(([type, config]) => {
      const isChecked = quizSettings.questionTypes.includes(type);
      quizTypesContainer.innerHTML += `
        <label class="flex items-center space-x-2">
          <input type="checkbox" value="${type}" ${isChecked ? "checked" : ""} 
                 class="quiz-type-checkbox">
          <span>${config.name}</span>
          <span class="text-sm text-gray-500">(${config.points}점)</span>
        </label>
      `;
    });
  }
}

// 이벤트 리스너 설정
function setupEventListeners() {
  // 퀴즈 시작 버튼
  document.getElementById("start-quiz")?.addEventListener("click", startQuiz);

  // 퀴즈 설정 변경
  document
    .getElementById("quiz-from-language")
    ?.addEventListener("change", (e) => {
      quizSettings.fromLanguage = e.target.value;
    });

  document
    .getElementById("quiz-to-language")
    ?.addEventListener("change", (e) => {
      quizSettings.toLanguage = e.target.value;
    });

  document
    .getElementById("quiz-difficulty")
    ?.addEventListener("change", (e) => {
      quizSettings.difficulty = e.target.value;
    });

  document
    .getElementById("quiz-question-count")
    ?.addEventListener("change", (e) => {
      quizSettings.questionCount = parseInt(e.target.value);
    });

  // 퀴즈 타입 체크박스
  document.querySelectorAll(".quiz-type-checkbox").forEach((checkbox) => {
    checkbox.addEventListener("change", updateQuizTypes);
  });

  // 답안 제출 버튼
  document
    .getElementById("submit-answer")
    ?.addEventListener("click", submitAnswer);

  // 다음 문제 버튼
  document
    .getElementById("next-question")
    ?.addEventListener("click", nextQuestion);

  // 퀴즈 종료 버튼
  document.getElementById("end-quiz")?.addEventListener("click", endQuiz);
}

// 퀴즈 타입 업데이트
function updateQuizTypes() {
  const checkedTypes = Array.from(
    document.querySelectorAll(".quiz-type-checkbox:checked")
  ).map((cb) => cb.value);
  quizSettings.questionTypes = checkedTypes;
}

// 퀴즈 템플릿 로드
async function loadQuizTemplates() {
  try {
    const templates = await quizTemplateUtils.getAllQuizTemplates();
    const templateSelect = document.getElementById("quiz-template");

    if (templateSelect && templates.length > 0) {
      templateSelect.innerHTML = '<option value="">사용자 정의</option>';
      templates.forEach((template) => {
        templateSelect.innerHTML += `
          <option value="${template.id}">${template.name}</option>
        `;
      });

      templateSelect.addEventListener("change", async (e) => {
        if (e.target.value) {
          const template = await quizTemplateUtils.getQuizTemplate(
            e.target.value
          );
          applyQuizTemplate(template);
        }
      });
    }
  } catch (error) {
    console.error("퀴즈 템플릿 로드 중 오류:", error);
  }
}

// 퀴즈 템플릿 적용
function applyQuizTemplate(template) {
  if (template.settings) {
    Object.assign(quizSettings, template.settings);
    setupQuizSettings(); // UI 다시 설정
  }
}

// 퀴즈 시작
async function startQuiz() {
  try {
    showLoadingState("퀴즈 문제를 생성하는 중...");

    // 퀴즈 문제 생성
    quizQuestions = await generateQuizQuestions();

    if (quizQuestions.length === 0) {
      throw new Error("퀴즈 문제를 생성할 수 없습니다.");
    }

    // 퀴즈 상태 초기화
    currentQuestionIndex = 0;
    score = 0;
    quizStartTime = new Date();

    // UI 전환
    hideElement("quiz-setup");
    showElement("quiz-container");

    // 첫 번째 문제 표시
    displayQuestion(quizQuestions[currentQuestionIndex]);

    // 타이머 시작
    startQuizTimer();
  } catch (error) {
    console.error("퀴즈 시작 중 오류:", error);
    alert("퀴즈를 시작할 수 없습니다: " + error.message);
  } finally {
    hideLoadingState();
  }
}

// 퀴즈 문제 생성
async function generateQuizQuestions() {
  const questions = [];

  try {
    // 개념 데이터 가져오기
    const concepts = await conceptUtils.getConceptsForQuiz(
      quizSettings.fromLanguage,
      quizSettings.toLanguage,
      quizSettings.difficulty,
      quizSettings.questionCount * 2 // 여유분 확보
    );

    if (concepts.length === 0) {
      throw new Error("해당 조건에 맞는 단어를 찾을 수 없습니다.");
    }

    // 문제 타입별로 문제 생성
    for (
      let i = 0;
      i < quizSettings.questionCount && i < concepts.length;
      i++
    ) {
      const concept = concepts[i];
      const questionType =
        quizSettings.questionTypes[i % quizSettings.questionTypes.length];

      const question = await createQuestion(concept, questionType, i + 1);
      if (question) {
        questions.push(question);
      }
    }

    return questions;
  } catch (error) {
    console.error("퀴즈 문제 생성 중 오류:", error);
    throw error;
  }
}

// 개별 문제 생성
async function createQuestion(concept, type, questionNumber) {
  const fromExpr = concept.expressions[quizSettings.fromLanguage];
  const toExpr = concept.expressions[quizSettings.toLanguage];

  if (!fromExpr || !toExpr) return null;

  const baseQuestion = {
    id: `q_${questionNumber}`,
    conceptId: concept.id,
    type: type,
    number: questionNumber,
    points: quizTypeConfigs[type]?.points || 10,
    timeLimit: quizTypeConfigs[type]?.timePerQuestion || 30,
    concept: concept,
    fromExpression: fromExpr,
    toExpression: toExpr,
  };

  switch (type) {
    case "translation":
      return createTranslationQuestion(baseQuestion);
    case "multiple_choice":
      return await createMultipleChoiceQuestion(baseQuestion);
    case "fill_blank":
      return createFillBlankQuestion(baseQuestion);
    case "pronunciation":
      return createPronunciationQuestion(baseQuestion);
    case "matching":
      return createMatchingQuestion(baseQuestion);
    default:
      return createTranslationQuestion(baseQuestion);
  }
}

// 번역 문제 생성
function createTranslationQuestion(baseQuestion) {
  return {
    ...baseQuestion,
    question: `다음 단어를 ${getLanguageName(
      quizSettings.toLanguage
    )}로 번역하세요:`,
    prompt: baseQuestion.fromExpression.word,
    correctAnswer: baseQuestion.toExpression.word,
    answerType: "text",
    hints: quizSettings.showHints
      ? [
          baseQuestion.concept.quiz_data?.hint_text?.[
            quizSettings.toLanguage
          ] || "",
          `품사: ${baseQuestion.toExpression.part_of_speech || ""}`,
          `첫 글자: ${baseQuestion.toExpression.word.charAt(0)}...`,
        ].filter((h) => h)
      : [],
  };
}

// 객관식 문제 생성
async function createMultipleChoiceQuestion(baseQuestion) {
  // 오답 선택지 생성을 위해 다른 개념들 가져오기
  const distractors = await conceptUtils.getConceptsForQuiz(
    quizSettings.fromLanguage,
    quizSettings.toLanguage,
    null, // 난이도 제한 없음
    10
  );

  const options = [baseQuestion.toExpression.word];

  // 오답 선택지 추가
  distractors.forEach((concept) => {
    if (
      concept.id !== baseQuestion.conceptId &&
      concept.expressions[quizSettings.toLanguage] &&
      options.length < 4
    ) {
      const word = concept.expressions[quizSettings.toLanguage].word;
      if (!options.includes(word)) {
        options.push(word);
      }
    }
  });

  // 선택지 섞기
  const shuffledOptions = options.sort(() => 0.5 - Math.random());

  return {
    ...baseQuestion,
    question: `"${baseQuestion.fromExpression.word}"의 ${getLanguageName(
      quizSettings.toLanguage
    )} 번역은?`,
    options: shuffledOptions,
    correctAnswer: baseQuestion.toExpression.word,
    answerType: "choice",
  };
}

// 빈칸 채우기 문제 생성
function createFillBlankQuestion(baseQuestion) {
  const examples = baseQuestion.concept.featured_examples || [];
  let sentence = "";
  let blankWord = "";

  if (examples.length > 0) {
    const example = examples[0];
    const exampleText =
      example.translations?.[quizSettings.toLanguage]?.text || "";
    if (exampleText) {
      sentence = exampleText.replace(baseQuestion.toExpression.word, "______");
      blankWord = baseQuestion.toExpression.word;
    }
  }

  // 예문이 없으면 간단한 문장 생성
  if (!sentence) {
    sentence = `This is a ______.`; // 기본 문장
    blankWord = baseQuestion.toExpression.word;
  }

  return {
    ...baseQuestion,
    question: "다음 문장의 빈칸에 알맞은 단어를 입력하세요:",
    prompt: sentence,
    correctAnswer: blankWord,
    answerType: "text",
    hints: quizSettings.showHints
      ? [
          `힌트: ${baseQuestion.fromExpression.word}`,
          `품사: ${baseQuestion.toExpression.part_of_speech || ""}`,
        ].filter((h) => h)
      : [],
  };
}

// 발음 문제 생성
function createPronunciationQuestion(baseQuestion) {
  const correctPronunciation =
    baseQuestion.toExpression.pronunciation ||
    baseQuestion.toExpression.phonetic ||
    "";

  // 가짜 발음 생성 (실제로는 더 정교한 로직 필요)
  const fakePronunciations = [
    correctPronunciation.replace(/æ/g, "e"),
    correctPronunciation.replace(/θ/g, "s"),
    correctPronunciation.replace(/ð/g, "d"),
  ].filter((p) => p !== correctPronunciation);

  const options = [
    correctPronunciation,
    ...fakePronunciations.slice(0, 3),
  ].sort(() => 0.5 - Math.random());

  return {
    ...baseQuestion,
    question: `"${baseQuestion.toExpression.word}"의 올바른 발음은?`,
    options: options,
    correctAnswer: correctPronunciation,
    answerType: "choice",
  };
}

// 매칭 문제 생성 (단순화된 버전)
function createMatchingQuestion(baseQuestion) {
  return {
    ...baseQuestion,
    question: `"${baseQuestion.fromExpression.word}"와 의미가 같은 단어는?`,
    prompt:
      baseQuestion.fromExpression.definition ||
      baseQuestion.fromExpression.word,
    correctAnswer: baseQuestion.toExpression.word,
    answerType: "text",
  };
}

// 문제 표시
function displayQuestion(question) {
  const container = document.getElementById("question-container");
  if (!container) return;

  // 진행률 업데이트
  updateProgressBar();

  // 문제 번호와 타입 표시
  document.getElementById(
    "question-number"
  ).textContent = `문제 ${question.number}/${quizQuestions.length}`;
  document.getElementById("question-type").textContent =
    quizTypeConfigs[question.type]?.name || question.type;

  // 문제 내용 표시
  document.getElementById("question-text").textContent = question.question;

  // 프롬프트 표시 (있는 경우)
  const promptElement = document.getElementById("question-prompt");
  if (question.prompt) {
    promptElement.textContent = question.prompt;
    promptElement.style.display = "block";
  } else {
    promptElement.style.display = "none";
  }

  // 답안 입력 영역 설정
  setupAnswerInput(question);

  // 힌트 표시 (있는 경우)
  displayHints(question.hints || []);

  // 오디오 재생 버튼 (있는 경우)
  setupAudioButton(question);

  // 이미지 표시 (있는 경우)
  displayQuestionImage(question);
}

// 답안 입력 영역 설정
function setupAnswerInput(question) {
  const answerContainer = document.getElementById("answer-container");
  answerContainer.innerHTML = "";

  if (question.answerType === "choice") {
    // 객관식
    question.options.forEach((option, index) => {
      answerContainer.innerHTML += `
        <label class="block p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
          <input type="radio" name="answer" value="${option}" class="mr-2">
          ${option}
        </label>
      `;
    });
  } else {
    // 주관식
    answerContainer.innerHTML = `
      <input type="text" id="text-answer" 
             class="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500"
             placeholder="답을 입력하세요...">
    `;
  }
}

// 힌트 표시
function displayHints(hints) {
  const hintsContainer = document.getElementById("hints-container");
  if (hints.length === 0) {
    hintsContainer.style.display = "none";
    return;
  }

  hintsContainer.innerHTML = `
    <button id="show-hints" class="text-purple-600 hover:text-purple-800">
      💡 힌트 보기 (${hints.length}개)
    </button>
    <div id="hints-list" class="hidden mt-2 space-y-1">
      ${hints
        .map(
          (hint, i) => `
        <div class="text-sm text-gray-600 p-2 bg-yellow-50 rounded">
          ${i + 1}. ${hint}
        </div>
      `
        )
        .join("")}
    </div>
  `;

  document.getElementById("show-hints").addEventListener("click", () => {
    document.getElementById("hints-list").classList.toggle("hidden");
  });

  hintsContainer.style.display = "block";
}

// 오디오 버튼 설정
function setupAudioButton(question) {
  const audioContainer = document.getElementById("audio-container");

  if (quizSettings.playAudio && question.toExpression.audio) {
    audioContainer.innerHTML = `
      <button id="play-audio" class="flex items-center space-x-2 text-purple-600 hover:text-purple-800">
        <span>🔊</span>
        <span>발음 듣기</span>
      </button>
    `;

    document.getElementById("play-audio").addEventListener("click", () => {
      playAudio(question.toExpression.audio);
    });

    audioContainer.style.display = "block";
  } else {
    audioContainer.style.display = "none";
  }
}

// 문제 이미지 표시
function displayQuestionImage(question) {
  const imageContainer = document.getElementById("question-image");

  if (question.concept.media?.images?.primary) {
    imageContainer.innerHTML = `
      <img src="${question.concept.media.images.primary}" 
           alt="${question.fromExpression.word}"
           class="w-32 h-32 object-cover rounded-lg">
    `;
    imageContainer.style.display = "block";
  } else if (question.concept.concept_info?.unicode_emoji) {
    imageContainer.innerHTML = `
      <div class="text-6xl">${question.concept.concept_info.unicode_emoji}</div>
    `;
    imageContainer.style.display = "block";
  } else {
    imageContainer.style.display = "none";
  }
}

// 답안 제출
function submitAnswer() {
  const currentQuestion = quizQuestions[currentQuestionIndex];
  let userAnswer = "";

  if (currentQuestion.answerType === "choice") {
    const selectedOption = document.querySelector(
      'input[name="answer"]:checked'
    );
    userAnswer = selectedOption ? selectedOption.value : "";
  } else {
    userAnswer = document.getElementById("text-answer").value.trim();
  }

  if (!userAnswer) {
    alert("답을 입력해주세요.");
    return;
  }

  // 정답 확인
  const isCorrect = checkAnswer(userAnswer, currentQuestion.correctAnswer);

  // 점수 업데이트
  if (isCorrect) {
    score += currentQuestion.points;
  }

  // 결과 표시
  displayAnswerResult(isCorrect, currentQuestion);

  // 다음 문제 버튼 활성화
  document.getElementById("submit-answer").style.display = "none";
  document.getElementById("next-question").style.display = "block";
}

// 정답 확인
function checkAnswer(userAnswer, correctAnswer) {
  // 대소문자 무시하고 비교
  return userAnswer.toLowerCase().trim() === correctAnswer.toLowerCase().trim();
}

// 답안 결과 표시
function displayAnswerResult(isCorrect, question) {
  const resultContainer = document.getElementById("answer-result");

  resultContainer.innerHTML = `
    <div class="p-4 rounded-lg ${
      isCorrect ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
    }">
      <div class="font-bold">
        ${isCorrect ? "✅ 정답!" : "❌ 오답"}
      </div>
      <div class="mt-2">
        정답: ${question.correctAnswer}
      </div>
      ${
        question.toExpression.definition
          ? `
        <div class="mt-1 text-sm">
          의미: ${question.toExpression.definition}
        </div>
      `
          : ""
      }
    </div>
  `;

  resultContainer.style.display = "block";
}

// 다음 문제
function nextQuestion() {
  currentQuestionIndex++;

  if (currentQuestionIndex >= quizQuestions.length) {
    endQuiz();
  } else {
    // UI 초기화
    document.getElementById("answer-result").style.display = "none";
    document.getElementById("submit-answer").style.display = "block";
    document.getElementById("next-question").style.display = "none";

    // 다음 문제 표시
    displayQuestion(quizQuestions[currentQuestionIndex]);
  }
}

// 퀴즈 종료
async function endQuiz() {
  try {
    // 타이머 정지
    if (timerInterval) {
      clearInterval(timerInterval);
    }

    // 퀴즈 결과 계산
    const totalQuestions = quizQuestions.length;
    const correctAnswers = Math.round(score / 10); // 기본 점수가 10점이라고 가정
    const accuracy = Math.round((correctAnswers / totalQuestions) * 100);
    const timeSpent = Math.round((new Date() - quizStartTime) / 1000);

    // 사용자 진도 업데이트
    if (currentUser) {
      await userProgressUtils.updateQuizStats(
        currentUser.email,
        quizSettings.toLanguage,
        accuracy,
        timeSpent
      );

      // 학습 활동 기록
      await userProgressUtils.recordActivity(currentUser.email, {
        activity_type: "quiz",
        quiz_type: "mixed",
        language: quizSettings.toLanguage,
        concepts: quizQuestions.map((q) => q.conceptId),
        score: accuracy,
        time_spent: timeSpent,
        difficulty: quizSettings.difficulty,
        questions_count: totalQuestions,
      });

      // 단어별 진도 업데이트
      for (const question of quizQuestions) {
        const status = accuracy >= 80 ? "known" : "weak";
        await userProgressUtils.updateVocabularyProgress(
          currentUser.email,
          quizSettings.toLanguage,
          question.conceptId,
          status
        );
      }
    }

    // 결과 화면 표시
    showQuizResults({
      score: accuracy,
      totalQuestions,
      correctAnswers,
      timeSpent,
      difficulty: quizSettings.difficulty,
    });
  } catch (error) {
    console.error("퀴즈 종료 처리 중 오류:", error);
  }
}

// 퀴즈 결과 표시
function showQuizResults(results) {
  hideElement("quiz-container");
  showElement("quiz-results");

  document.getElementById("final-score").textContent = `${results.score}점`;
  document.getElementById(
    "correct-count"
  ).textContent = `${results.correctAnswers}/${results.totalQuestions}`;
  document.getElementById("time-spent").textContent = `${Math.floor(
    results.timeSpent / 60
  )}분 ${results.timeSpent % 60}초`;
  document.getElementById("difficulty-level").textContent = results.difficulty;

  // 성과 메시지
  let message = "";
  if (results.score >= 90) {
    message = "🎉 완벽해요! 훌륭한 실력입니다!";
  } else if (results.score >= 80) {
    message = "👏 잘했어요! 좋은 성과입니다!";
  } else if (results.score >= 70) {
    message = "👍 괜찮아요! 조금 더 연습해보세요!";
  } else {
    message = "💪 더 열심히! 다시 도전해보세요!";
  }

  document.getElementById("achievement-message").textContent = message;
}

// 퀴즈 타이머 시작
function startQuizTimer() {
  timeLeft = quizSettings.timeLimit;
  updateTimerDisplay();

  timerInterval = setInterval(() => {
    timeLeft--;
    updateTimerDisplay();

    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      endQuiz();
    }
  }, 1000);
}

// 타이머 표시 업데이트
function updateTimerDisplay() {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  document.getElementById("quiz-timer").textContent = `${minutes}:${seconds
    .toString()
    .padStart(2, "0")}`;
}

// 진행률 업데이트
function updateProgressBar() {
  const progress = ((currentQuestionIndex + 1) / quizQuestions.length) * 100;
  document.getElementById("quiz-progress").style.width = `${progress}%`;
}

// 사용자 통계 업데이트
function updateUserStats(userProgress) {
  const stats =
    userProgress.vocabulary_progress?.[quizSettings.toLanguage]?.quiz_stats ||
    {};

  document.getElementById("total-quizzes").textContent =
    stats.total_quizzes || 0;
  document.getElementById("average-score").textContent =
    stats.average_score || 0;
  document.getElementById("best-score").textContent = stats.best_score || 0;
}

// 유틸리티 함수들
function getLanguageName(code) {
  const names = {
    korean: "한국어",
    english: "영어",
    japanese: "일본어",
    chinese: "중국어",
  };
  return names[code] || code;
}

function showElement(id) {
  document.getElementById(id).style.display = "block";
}

function hideElement(id) {
  document.getElementById(id).style.display = "none";
}

function showLoadingState(message) {
  // 로딩 상태 표시 구현
  console.log("Loading:", message);
}

function hideLoadingState() {
  // 로딩 상태 숨김 구현
  console.log("Loading complete");
}

function showLoginRequired() {
  document.body.innerHTML = `
    <div class="min-h-screen flex items-center justify-center">
      <div class="text-center">
        <h1 class="text-2xl font-bold mb-4">로그인이 필요합니다</h1>
        <p class="text-gray-600 mb-4">퀴즈 기능을 사용하려면 로그인해주세요.</p>
        <a href="/login.html" class="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700">
          로그인하기
        </a>
      </div>
    </div>
  `;
}

function playAudio(audioUrl) {
  const audio = new Audio(audioUrl);
  audio.play().catch((error) => {
    console.error("오디오 재생 실패:", error);
  });
}

// 퀴즈 재시작
function restartQuiz() {
  hideElement("quiz-results");
  showElement("quiz-setup");

  // 상태 초기화
  currentQuestionIndex = 0;
  score = 0;
  quizQuestions = [];

  if (timerInterval) {
    clearInterval(timerInterval);
  }
}

// 전역 함수로 내보내기 (HTML에서 사용)
window.restartQuiz = restartQuiz;
