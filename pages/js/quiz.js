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
  getDoc,
  orderBy,
  where,
  limit,
  doc,
  setDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";
import { CollectionManager } from "../../js/firebase/firebase-collection-manager.js";
import {
  getCurrentLanguage,
  getActiveLanguage,
  getI18nText,
} from "../../utils/language-utils.js";

// 전역 변수
let currentUser = null;
let quizData = null;
let timerInterval = null;
let elements = {};
let collectionManager = new CollectionManager();

// ✅ 캐싱 시스템 추가
let cachedQuizData = {
  data: null,
  timestamp: null,
  settings: null,
};
const CACHE_DURATION = 10 * 60 * 1000; // 10분

// 퀴즈 기록 캐시 시스템
let quizHistoryCache = null;
let quizHistoryCacheTimestamp = null;
const QUIZ_HISTORY_CACHE_DURATION = 5 * 60 * 1000; // 5분 캐시 유효 시간

// ✅ Firebase 읽기 비용 모니터링 (개발 모드에서만)
let firebaseReadCount = 0;

// Firebase 읽기 추적 함수 (개발 모드에서만 동작)
function trackFirebaseRead(queryName, docCount) {
  // 개발 모드에서만 모니터링 활성화
  if (
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.hostname.includes("vercel.app") ||
    window.location.hostname.includes("netlify.app")
  ) {
    firebaseReadCount += docCount;
    console.log(
      `📊 Firebase 읽기: ${queryName} (+${docCount}), 총 ${firebaseReadCount}회`
    );

    if (firebaseReadCount > 30) {
      console.warn("⚠️ Firebase 읽기 횟수가 많습니다:", firebaseReadCount);
    }
  }
}

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

  console.log("📋 DOM 요소 초기화 완료");
}

// 로그인 상태에 따라 기능 표시/숨김
function showAuthenticatedFeatures(isAuthenticated) {
  // 퀴즈 히스토리 관련 요소들
  const historySection = document.getElementById("quiz-history");
  const loginNotice = document.getElementById("login-notice");
  
  if (isAuthenticated) {
    if (historySection) historySection.style.display = "block";
    if (loginNotice) loginNotice.style.display = "none";
  } else {
    if (historySection) historySection.style.display = "none";
    if (loginNotice) {
      loginNotice.style.display = "block";
      loginNotice.innerHTML = `
        <div class="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p class="text-blue-700 mb-2">퀴즈 결과 저장 및 히스토리 확인은 로그인 후 이용 가능합니다.</p>
          <a href="../login.html" class="text-blue-600 hover:text-blue-800 underline">로그인하러 가기</a>
        </div>
      `;
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

  // 언어 필터 초기화
  setTimeout(() => {
    initializeLanguageFilters();
  }, 100);
}

// 로그인 상태에 따라 기능 표시/숨김
function showAuthenticatedFeatures(isAuthenticated) {
  // 퀴즈 히스토리 관련 요소들
  const historySection = document.getElementById("quiz-history");
  const loginNotice = document.getElementById("login-notice");
  
  if (isAuthenticated) {
    if (historySection) historySection.style.display = "block";
    if (loginNotice) loginNotice.style.display = "none";
  } else {
    if (historySection) historySection.style.display = "none";
    if (loginNotice) {
      loginNotice.style.display = "block";
      loginNotice.innerHTML = `
        <div class="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p class="text-blue-700 mb-2">퀴즈 결과 저장 및 히스토리 확인은 로그인 후 이용 가능합니다.</p>
          <a href="../login.html" class="text-blue-600 hover:text-blue-800 underline">로그인하러 가기</a>
        </div>
      `;
    }
  }
}

// 언어 필터 초기화
function initializeLanguageFilters() {
  import("../../utils/language-utils.js").then((module) => {
    const { initializeLanguageFilterElements } = module;

    // 언어 필터 요소 초기화
    initializeLanguageFilterElements(
      "quiz-source-language",
      "quiz-target-language",
      "quizLanguageFilter"
    );

    console.log("🎯 퀴즈 페이지 언어 필터 초기화 완료");
  });
}

// 이벤트 리스너 등록
function registerEventListeners() {
  // 네비게이션바 이벤트 설정 (햄버거 메뉴 등)
  if (typeof window.setupBasicNavbarEvents === "function") {
    window.setupBasicNavbarEvents();
    console.log("✅ 퀴즈: 네비게이션바 이벤트 설정 완료");
  } else {
    console.warn("⚠️ setupBasicNavbarEvents 함수를 찾을 수 없습니다.");
  }

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
      // 로그인한 사용자는 퀴즈 결과 저장 가능
      showAuthenticatedFeatures(true);
    } else {
      // 로그인하지 않은 사용자도 퀴즈 가능, 단 결과 저장 불가
      currentUser = null;
      console.log("ℹ️ 게스트 모드로 퀴즈를 진행합니다. 결과 저장은 로그인 후 가능합니다.");
      showAuthenticatedFeatures(false);
    }
  });

  // 언어 변경 이벤트 리스너 추가
  window.addEventListener("languageChanged", (event) => {
    console.log("🌐 언어 변경 이벤트 수신 - 퀴즈 페이지 업데이트");

    // 변경된 언어 가져오기
    const newUILanguage =
      event.detail?.language || localStorage.getItem("userLanguage") || "ko";
    const currentUILanguage = newUILanguage === "auto" ? "ko" : newUILanguage;

    // 언어 필터 초기화 (환경 언어 변경 시 기존 설정 무시)
    import("../../utils/language-utils.js").then((module) => {
      const { updateLanguageFilterOnUIChange } = module;

      // 환경 언어 변경에 따른 언어 필터 초기화
      updateLanguageFilterOnUIChange(currentUILanguage, "quizLanguageFilter");

      console.log("🔄 환경 언어 변경에 따른 퀴즈 페이지 언어 필터 초기화:", {
        newUILanguage: currentUILanguage,
      });
    });

    // 번역 다시 적용
    if (typeof window.applyLanguage === "function") {
      window.applyLanguage();
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

    const activeLanguage = await getActiveLanguage();

    if (settings.sourceLanguage === settings.targetLanguage) {
      showError(
        getI18nText("same_language_error", activeLanguage) ||
          "원어와 대상 언어가 같을 수 없습니다."
      );
      return;
    }

    elements.startQuizBtn.disabled = true;
    elements.startQuizBtn.textContent =
      getI18nText("preparing_questions", activeLanguage) || "문제 준비 중...";

    const questions = await generateQuizQuestions(settings);

    if (questions.length === 0) {
      showError(
        getI18nText("no_questions_found", activeLanguage) ||
          "선택한 조건에 맞는 문제를 찾을 수 없습니다."
      );
      elements.startQuizBtn.disabled = false;
      elements.startQuizBtn.textContent =
        getI18nText("start_quiz", activeLanguage) || "퀴즈 시작";
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
    const activeLanguage = await getActiveLanguage();
    console.error("❌ 퀴즈 시작 중 오류:", error);
    showError(
      getI18nText("quiz_start_error", activeLanguage) ||
        "퀴즈를 시작할 수 없습니다."
    );
    elements.startQuizBtn.disabled = false;
    elements.startQuizBtn.textContent =
      getI18nText("start_quiz", activeLanguage) || "퀴즈 시작";
  }
}

// 퀴즈 문제 생성 (개인화된 학습 기반)
async function generateQuizQuestions(settings) {
  try {
    console.log("📝 개인화된 퀴즈 문제 생성 중:", settings);

    // 현재 사용자 확인 (로그인하지 않은 사용자도 퀴즈 가능)
    if (!currentUser) {
      console.log("ℹ️ 게스트 모드로 퀴즈 문제를 생성합니다.");
    }

    // 🎯 개념 데이터 조회 (최적화된 캐싱 방법)
    let personalizedConcepts = [];

    try {
      // ✅ 캐시된 데이터가 있고 유효하면 사용
      const now = Date.now();
      const currentSettings = JSON.stringify(settings);

      if (
        cachedQuizData.data &&
        now - cachedQuizData.timestamp < CACHE_DURATION &&
        cachedQuizData.settings === currentSettings
      ) {
        personalizedConcepts = cachedQuizData.data;
        trackFirebaseRead("퀴즈 캐시 사용", 0); // 캐시 사용 시 읽기 비용 0
      } else {
        // ✅ 캐시가 없거나 만료된 경우에만 DB 조회 (개수 최적화: 50 → 20)
        const allConcepts = await collectionManager.getConceptsOnly(20); // ✅ 50개에서 20개로 감소
        trackFirebaseRead("퀴즈 개념 조회", allConcepts.length);

        // 개념 데이터를 퀴즈용 형식으로 변환
        personalizedConcepts = allConcepts
          .filter((concept) => {
            const hasSourceLang =
              concept.expressions?.[settings.sourceLanguage]?.word;
            const hasTargetLang =
              concept.expressions?.[settings.targetLanguage]?.word;
            return hasSourceLang && hasTargetLang;
          })
          .map((concept) => ({
            id: concept.id,
            conceptInfo: concept.concept_info,
            fromExpression: concept.expressions[settings.sourceLanguage],
            toExpression: concept.expressions[settings.targetLanguage],
            representativeExample: null,
            media: concept.media,
            created_at: concept.metadata?.created_at || concept.created_at,
          }));

        // ✅ 조회된 데이터를 캐시에 저장
        cachedQuizData = {
          data: [...personalizedConcepts], // 깊은 복사
          timestamp: now,
          settings: currentSettings,
        };
      }
    } catch (error) {
      console.error("❌ 개념 조회 실패:", error);
      personalizedConcepts = [];
    }

    if (personalizedConcepts.length === 0) {
      // 🚨 테스트용 더미 데이터 (실제 개념이 없을 때만 사용)
      personalizedConcepts = [
        {
          id: "test_1",
          conceptInfo: {
            difficulty: "beginner",
            domain: "test",
            category: "vocabulary",
          },
          fromExpression: {
            word: "안녕",
            pronunciation: "annyeong",
            definition: "인사말",
          },
          toExpression: {
            word: "hello",
            pronunciation: "həˈloʊ",
            definition: "greeting",
          },
        },
        {
          id: "test_2",
          conceptInfo: {
            difficulty: "beginner",
            domain: "test",
            category: "vocabulary",
          },
          fromExpression: {
            word: "감사",
            pronunciation: "gamsa",
            definition: "고마움을 표현",
          },
          toExpression: {
            word: "thanks",
            pronunciation: "θæŋks",
            definition: "expressing gratitude",
          },
        },
        {
          id: "test_3",
          conceptInfo: {
            difficulty: "beginner",
            domain: "test",
            category: "vocabulary",
          },
          fromExpression: {
            word: "물",
            pronunciation: "mul",
            definition: "액체",
          },
          toExpression: {
            word: "water",
            pronunciation: "ˈwɔtər",
            definition: "liquid",
          },
        },
        {
          id: "test_4",
          conceptInfo: {
            difficulty: "beginner",
            domain: "test",
            category: "vocabulary",
          },
          fromExpression: {
            word: "책",
            pronunciation: "chaek",
            definition: "읽는 것",
          },
          toExpression: {
            word: "book",
            pronunciation: "bʊk",
            definition: "reading material",
          },
        },
        {
          id: "test_5",
          conceptInfo: {
            difficulty: "beginner",
            domain: "test",
            category: "vocabulary",
          },
          fromExpression: {
            word: "집",
            pronunciation: "jip",
            definition: "거주지",
          },
          toExpression: {
            word: "house",
            pronunciation: "haʊs",
            definition: "residence",
          },
        },
      ];
    }

    // 🎓 난이도 필터링 (difficulty 설정이 'all'이 아닌 경우)
    let filteredConcepts = personalizedConcepts;
    if (settings.difficulty !== "all") {
      filteredConcepts = personalizedConcepts.filter(
        (concept) => concept.conceptInfo?.difficulty === settings.difficulty
      );

      // 특정 난이도의 개념이 부족하면 전체 개념 사용
      if (filteredConcepts.length < settings.questionCount) {
        filteredConcepts = personalizedConcepts;
      }
    }

    // 🎲 퀴즈 문제 생성
    const questions = [];
    const usedConcepts = new Set();
    const availableCount = Math.min(
      settings.questionCount,
      filteredConcepts.length
    );

    // 개념을 섞어서 랜덤 선택
    const shuffledConcepts = shuffleArray([...filteredConcepts]);

    for (let i = 0; i < availableCount; i++) {
      const concept = shuffledConcepts[i];

      if (usedConcepts.has(concept.id)) {
        continue;
      }

      usedConcepts.add(concept.id);

      let question;
      if (settings.quizType === "translation") {
        question = createTranslationQuestion(
          concept,
          settings,
          filteredConcepts
        );
      } else if (settings.quizType === "pronunciation") {
        question = createPronunciationQuestion(
          concept,
          settings,
          filteredConcepts
        );
      } else if (settings.quizType === "matching") {
        question = createMatchingQuestion(concept, settings, filteredConcepts);
      } else if (
        settings.quizType === "fill_blank" ||
        settings.quizType === "fill_in_blank"
      ) {
        question = createFillBlankQuestion(concept, settings, filteredConcepts);
      }
      // 추후 다른 퀴즈 타입 추가 가능

      if (question) {
        questions.push(question);
      }
    }

    return questions;
  } catch (error) {
    console.error("❌ 퀴즈 문제 생성 중 오류:", error);
    return [];
  }
}

// 번역 문제 생성 (개인화된 개념 구조 기반)
function createTranslationQuestion(concept, settings, allConcepts) {
  try {
    // 새로운 개념 구조: fromExpression, toExpression 사용
    const fromExpr = concept.fromExpression;
    const toExpr = concept.toExpression;

    if (!fromExpr?.word || !toExpr?.word) {
      console.error("❌ 언어 데이터가 부족합니다:", concept.id);
      return null;
    }

    // 문제 방향 결정 (대상 언어가 질문, 원본 언어가 선택지)
    // 예: 영어→한국어 학습 시: 한국어 단어 제시 → 영어 뜻 선택
    // 예: 한국어→영어 학습 시: 영어 단어 제시 → 한국어 뜻 선택
    const questionExpr = toExpr; // 대상 언어가 질문
    const answerExpr = fromExpr; // 원본 언어가 정답

    // 오답 선택지 생성 (원본 언어의 다른 단어들 사용)
    const potentialWrongOptions = allConcepts
      .filter((c) => c.id !== concept.id)
      .map((c) => c.fromExpression?.word)
      .filter((word) => word && word !== answerExpr.word);

    // 같은 카테고리/도메인 우선 선택
    const sameCategory = allConcepts.filter(
      (c) =>
        c.id !== concept.id &&
        c.conceptInfo?.category === concept.conceptInfo?.category
    );

    const sameDomain = allConcepts.filter(
      (c) =>
        c.id !== concept.id &&
        c.conceptInfo?.domain === concept.conceptInfo?.domain &&
        !sameCategory.find((sc) => sc.id === c.id)
    );

    let wrongOptions = [];

    // 같은 카테고리에서 우선 선택
    if (sameCategory.length > 0) {
      const shuffled = shuffleArray(sameCategory);
      for (const c of shuffled) {
        const word = c.fromExpression?.word;
        if (word && word !== answerExpr.word && !wrongOptions.includes(word)) {
          wrongOptions.push(word);
          if (wrongOptions.length >= 2) break;
        }
      }
    }

    // 같은 도메인에서 추가
    if (wrongOptions.length < 3 && sameDomain.length > 0) {
      const shuffled = shuffleArray(sameDomain);
      for (const c of shuffled) {
        const word = c.fromExpression?.word;
        if (word && word !== answerExpr.word && !wrongOptions.includes(word)) {
          wrongOptions.push(word);
          if (wrongOptions.length >= 3) break;
        }
      }
    }

    // 나머지 개념에서 추가
    if (wrongOptions.length < 3) {
      const shuffled = shuffleArray(potentialWrongOptions);
      for (const word of shuffled) {
        if (!wrongOptions.includes(word)) {
          wrongOptions.push(word);
          if (wrongOptions.length >= 3) break;
        }
      }
    }

    // 선택지가 부족하면 문제 생성 실패
    if (wrongOptions.length < 2) {
      console.warn("⚠️ 오답 선택지가 부족합니다:", concept.id);
      return null;
    }

    // 모든 선택지 섞기 (최대 4개)
    const options = shuffleArray([
      answerExpr.word,
      ...wrongOptions.slice(0, 3),
    ]);

    // 문제 텍스트 생성
    const currentLang = getCurrentLanguage();
    const translatePrompt = getI18nText("translate_this_word", currentLang);

    // 카테고리 정보 생성
    const categoryInfo =
      concept.conceptInfo?.domain && concept.conceptInfo?.category
        ? `${concept.conceptInfo.domain} / ${concept.conceptInfo.category}`
        : concept.conceptInfo?.domain || "일반";

    return {
      id: concept.id,
      conceptId: concept.id, // 🎯 user_progress 업데이트를 위한 conceptId 추가
      type: "translation",
      questionText: {
        instruction: translatePrompt,
        main: questionExpr.word,
      },
      hint: questionExpr.pronunciation
        ? `발음: ${questionExpr.pronunciation}`
        : "",
      options,
      correctAnswer: answerExpr.word,
      explanation:
        answerExpr.definition || concept.conceptInfo?.definition || "",
      category: categoryInfo,
      difficulty: concept.conceptInfo?.difficulty || "basic",
      emoji: concept.conceptInfo?.unicode_emoji || "📝",
      concept,
    };
  } catch (error) {
    console.error("❌ 번역 문제 생성 오류:", error, concept.id);
    return null;
  }
}

// 발음 문제 생성
function createPronunciationQuestion(concept, settings, allConcepts) {
  try {
    const fromExpr = concept.fromExpression;
    const toExpr = concept.toExpression;

    // 대상 언어가 질문, 원본 언어가 힌트
    // 예: 영어→한국어 학습 시: 한국어 단어의 발음 제시 → 영어 뜻을 힌트로
    // 예: 한국어→영어 학습 시: 영어 단어의 발음 제시 → 한국어 뜻을 힌트로
    const questionWord = toExpr.word; // 대상 언어가 질문
    const questionPronunciation = toExpr.pronunciation; // 대상 언어의 발음
    const hintText = fromExpr.word ? `의미: ${fromExpr.word}` : ""; // 원본 언어가 힌트

    if (!questionWord || !questionPronunciation) {
      console.error("❌ 발음 데이터가 부족합니다:", concept.id);
      return null;
    }

    // 대상 언어의 발음 데이터에서 오답 선택지 생성
    const wrongPronunciations = allConcepts
      .filter((c) => c.id !== concept.id)
      .map((c) => c.toExpression?.pronunciation)
      .filter((pron) => pron && pron !== questionPronunciation);

    if (wrongPronunciations.length < 2) {
      console.warn("⚠️ 발음 선택지가 부족합니다:", concept.id);
      return null;
    }

    const wrongOptions = shuffleArray(wrongPronunciations).slice(0, 3);
    const options = shuffleArray([questionPronunciation, ...wrongOptions]);

    const categoryInfo =
      concept.conceptInfo?.domain && concept.conceptInfo?.category
        ? `${concept.conceptInfo.domain} / ${concept.conceptInfo.category}`
        : concept.conceptInfo?.domain || "일반";

    const currentLang = getCurrentLanguage();
    const pronPrompt = getI18nText("choose_pronunciation", currentLang);

    return {
      id: concept.id,
      conceptId: concept.id,
      type: "pronunciation",
      questionText: {
        instruction: pronPrompt,
        main: questionWord,
      },
      hint: hintText,
      options,
      correctAnswer: questionPronunciation,
      explanation: concept.conceptInfo?.definition || "",
      category: categoryInfo,
      difficulty: concept.conceptInfo?.difficulty || "basic",
      emoji: concept.conceptInfo?.unicode_emoji || "🔊",
      concept,
    };
  } catch (error) {
    console.error("❌ 발음 문제 생성 오류:", error, concept.id);
    return null;
  }
}

// 매칭 문제 생성
function createMatchingQuestion(concept, settings, allConcepts) {
  try {
    const fromExpr = concept.fromExpression;
    const toExpr = concept.toExpression;

    if (!fromExpr?.word || !toExpr?.word) {
      console.error("❌ 매칭 데이터가 부족합니다:", concept.id);
      return null;
    }

    // 여러 단어쌍 생성 (정답 + 오답들)
    const wrongPairs = allConcepts
      .filter(
        (c) =>
          c.id !== concept.id && c.fromExpression?.word && c.toExpression?.word
      )
      .slice(0, 3);

    if (wrongPairs.length < 3) {
      console.warn("⚠️ 매칭 선택지가 부족합니다:", concept.id);
      return null;
    }

    // 대상 언어의 정의/설명 제시하고 원본 언어의 단어를 선택지로
    // 예: 영어→한국어 학습: 한국어 정의 제시 → 영어 단어 선택
    // 예: 한국어→영어 학습: 영어 정의 제시 → 한국어 단어 선택
    const questionDefinition =
      toExpr.definition ||
      concept.conceptInfo?.definition ||
      `${fromExpr.word}을/를 의미하는 단어`;
    const questionWord = questionDefinition; // 대상 언어의 정의/설명 제시
    const answerWord = fromExpr.word; // 원본 언어의 단어 (정답)
    const hintText = toExpr.pronunciation
      ? `발음: ${toExpr.pronunciation}`
      : ""; // 대상 언어 발음 힌트

    // 오답 선택지 생성 (원본 언어의 다른 단어들)
    const wrongAnswers = wrongPairs.map((c) => c.fromExpression.word);

    const options = shuffleArray([answerWord, ...wrongAnswers]);

    const categoryInfo =
      concept.conceptInfo?.domain && concept.conceptInfo?.category
        ? `${concept.conceptInfo.domain} / ${concept.conceptInfo.category}`
        : concept.conceptInfo?.domain || "일반";

    const currentLang = getCurrentLanguage();
    const matchPrompt = getI18nText("choose_matching_word", currentLang);

    return {
      id: concept.id,
      conceptId: concept.id,
      type: "matching",
      questionText: {
        instruction: matchPrompt,
        main: questionWord,
      },
      hint: hintText,
      options, // 선택지 형태로 변경
      correctAnswer: answerWord,
      explanation: concept.conceptInfo?.definition || "",
      category: categoryInfo,
      difficulty: concept.conceptInfo?.difficulty || "basic",
      emoji: concept.conceptInfo?.unicode_emoji || "🔗",
      concept,
    };
  } catch (error) {
    console.error("❌ 매칭 문제 생성 오류:", error, concept.id);
    return null;
  }
}

// 빈칸 채우기 문제 생성
function createFillBlankQuestion(concept, settings, allConcepts) {
  try {
    const fromExpr = concept.fromExpression;
    const toExpr = concept.toExpression;

    if (!fromExpr?.word || !toExpr?.word) {
      console.error("❌ 빈칸 채우기 데이터가 부족합니다:", concept.id);
      return null;
    }

    // 대상 언어의 문장에서 대상 언어의 단어를 빈칸으로
    // 예: 영어→한국어 학습: 한국어 문장에서 한국어 단어 빈칸
    // 예: 한국어→영어 학습: 영어 문장에서 영어 단어 빈칸
    let sentence, blankWord, hintText;

    if (
      concept.exampleInfo?.sentences &&
      concept.exampleInfo.sentences.length > 0
    ) {
      const exampleSentence = concept.exampleInfo.sentences[0];
      sentence =
        exampleSentence[settings.targetLanguage] ||
        exampleSentence.english ||
        exampleSentence.korean ||
        exampleSentence.japanese ||
        exampleSentence.chinese ||
        `This is ${toExpr.word}.`;
      blankWord = toExpr.word; // 대상 언어 단어가 정답
    } else {
      // 대상 언어에 따른 기본 문장 패턴 생성
      const languagePatterns = {
        korean: `이것은 ${toExpr.word}입니다.`,
        english: `This is ${toExpr.word}.`,
        japanese: `これは${toExpr.word}です。`,
        chinese: `这是${toExpr.word}。`,
      };
      sentence =
        languagePatterns[settings.targetLanguage] || `This is ${toExpr.word}.`;
      blankWord = toExpr.word; // 대상 언어 단어가 정답
    }
    hintText = fromExpr.word
      ? `의미: ${fromExpr.word}` // 원본 언어 의미를 힌트로
      : "";

    // 대상 언어 오답 선택지 생성
    const wrongOptions = allConcepts
      .filter((c) => c.id !== concept.id && c.toExpression?.word)
      .map((c) => c.toExpression.word)
      .filter((word) => word && word !== blankWord);

    if (wrongOptions.length < 2) {
      console.warn("⚠️ 빈칸 채우기 선택지가 부족합니다:", concept.id);
      return null;
    }

    const selectedWrongOptions = shuffleArray(wrongOptions).slice(0, 3);
    var options = shuffleArray([blankWord, ...selectedWrongOptions]);

    // 단어를 빈칸으로 치환
    const questionText = sentence.replace(blankWord, "______");

    const categoryInfo =
      concept.conceptInfo?.domain && concept.conceptInfo?.category
        ? `${concept.conceptInfo.domain} / ${concept.conceptInfo.category}`
        : concept.conceptInfo?.domain || "일반";

    const currentLang = getCurrentLanguage();
    const blankPrompt = getI18nText("choose_blank_word", currentLang);

    return {
      id: concept.id,
      conceptId: concept.id,
      type: "fill_blank",
      questionText: {
        instruction: blankPrompt,
        main: questionText,
      },
      hint: hintText,
      options,
      correctAnswer: blankWord,
      explanation: concept.conceptInfo?.definition || "",
      category: categoryInfo,
      difficulty: concept.conceptInfo?.difficulty || "basic",
      emoji: concept.conceptInfo?.unicode_emoji || "📝",
      concept,
    };
  } catch (error) {
    console.error("❌ 빈칸 채우기 문제 생성 오류:", error, concept.id);
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
  // Tailwind 기본 클래스 사용 + style로 width 설정
  elements.quizProgress.className =
    "bg-blue-600 h-2 rounded-full transition-all duration-300";
  elements.quizProgress.style.width = `${progress}%`;

  // 카테고리 표시 (이모지 포함)
  const categoryElement = document.getElementById("question-category");
  if (categoryElement) {
    const emoji = question.emoji || "📝";
    const category = question.category || "일반";
    const difficulty = question.difficulty || "basic";

    // 카테고리 동적 번역
    const currentLang = getCurrentLanguage();
    let translatedCategory = category;

    // 카테고리가 "domain / category" 형태인 경우 분리하여 번역
    if (category.includes(" / ")) {
      const [domain, cat] = category.split(" / ");
      const translatedDomain =
        getI18nText(`domain_${domain.toLowerCase()}`, currentLang) || domain;
      const translatedCat =
        getI18nText(`category_${cat.toLowerCase()}`, currentLang) || cat;
      translatedCategory = `${translatedDomain} / ${translatedCat}`;
    } else {
      // 단일 카테고리인 경우
      translatedCategory =
        getI18nText(`category_${category.toLowerCase()}`, currentLang) ||
        category;
    }

    // 난이도 표시를 위한 색상 설정
    const difficultyColors = {
      basic: "bg-green-100 text-green-800",
      beginner: "bg-green-100 text-green-800", // beginner 추가
      intermediate: "bg-yellow-100 text-yellow-800",
      advanced: "bg-red-100 text-red-800",
      fluent: "bg-purple-100 text-purple-800",
      technical: "bg-gray-100 text-gray-800",
    };

    const colorClass =
      difficultyColors[difficulty] || "bg-blue-100 text-blue-800";
    categoryElement.className = `text-sm px-3 py-1 rounded-full inline-block mb-4 ${colorClass}`;
    categoryElement.textContent = `${emoji} ${translatedCategory}`;
  }

  // 문제 지시문/본문 표시
  let instruction = "";
  let main = "";
  if (
    typeof question.questionText === "object" &&
    question.questionText !== null
  ) {
    instruction = question.questionText.instruction || "";
    main = question.questionText.main || "";
  } else {
    // 하위 호환: 기존 string 타입
    main = question.questionText || "";
  }
  let html = "";
  if (instruction) {
    html += `<div class="text-base sm:text-lg text-gray-500 mb-2">${instruction}</div>`;
  }
  if (main) {
    html += `<div class="text-2xl font-bold text-gray-900 mb-4">${main}</div>`;
  }

  // 힌트 표시 (발음 또는 의미 정보)
  if (question.hint && question.hint.trim()) {
    let hintIcon = "";
    let hintText = question.hint.trim();
    if (hintText.startsWith("발음:")) {
      hintIcon = "🔊";
      hintText = hintText.replace(/^발음:\s*/, "");
    } else if (hintText.startsWith("의미:")) {
      hintIcon = "💡";
      hintText = hintText.replace(/^의미:\s*/, "");
    }
    html += `<div class="flex justify-center"><div class="text-sm text-blue-500 italic mb-2 flex items-center gap-1"><span>${hintIcon}</span><span>${hintText}</span></div></div>`;
  }

  elements.questionText.innerHTML = html;

  // 이전 피드백 숨기기
  const feedbackElement = document.getElementById("answer-feedback");
  if (feedbackElement) {
    feedbackElement.classList.add("hidden");
  }

  // 퀴즈 타입에 따른 UI 렌더링
  elements.questionOptions.innerHTML = "";

  if (question.options && question.options.length > 0) {
    // 일반 선택지 문제 (translation, pronunciation, fill_blank)
    question.options.forEach((option, index) => {
      const optionElement = document.createElement("button");
      optionElement.className =
        "w-full px-4 py-3 text-left border-2 border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 text-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500";

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
    concept_id: question.conceptId, // concept_id로 통일
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

  const currentLang = getCurrentLanguage();
  // 번역된 메시지 가져오기
  const correctMsg =
    getI18nText("correct_answer", currentLang) || "정답입니다! 🎉";
  const wrongMsg = getI18nText("wrong_answer", currentLang) || "틀렸습니다";

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
    concept_id: question.conceptId, // concept_id로 통일
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
    getI18nText("quit_quiz_confirm") || "정말로 퀴즈를 종료하시겠습니까?";
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

    // 로그인한 사용자만 결과 저장
    if (currentUser) {
      await saveQuizResult({
        settings: quizData.settings,
        answers: quizData.userAnswers,
        score,
        correctCount,
        totalCount,
        totalTime,
        completedAt: endTime,
      });
      
      // 퀴즈 기록 캐시 무효화 및 새로고침
      quizHistoryCache = null;
      quizHistoryCacheTimestamp = null;
      await loadQuizHistory(); // 퀴즈 히스토리 다시 로드
    } else {
      console.log("ℹ️ 게스트 사용자는 퀴즈 결과가 저장되지 않습니다.");
    }
    console.log("🔄 퀴즈 기록 캐시 무효화 및 새로고침 시작");
    quizHistoryCache = null;
    quizHistoryCacheTimestamp = null;
    await loadQuizHistory();
    console.log("✅ 퀴즈 기록 새로고침 완료");

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
    console.log("💾 퀴즈 결과 저장 시작:", result);

    // 1. 🎯 quiz_records 컬렉션에 상세 퀴즈 기록 저장
    // 퀴즈에서 사용된 개념 ID들 추출 (다양한 필드에서)
    const conceptIds = result.answers
      .map((answer) => {
        return (
          answer.conceptId ||
          answer.concept_id ||
          answer.questionId ||
          answer.id
        );
      })
      .filter((id) => id && typeof id === "string");

    console.log(
      `📋 퀴즈에서 추출된 개념 ID들: ${conceptIds.length}개`,
      conceptIds
    );

    const quizRecord = {
      user_email: currentUser.email,
      quiz_type: result.settings.quizType,
      language_pair: {
        source: result.settings.sourceLanguage,
        target: result.settings.targetLanguage,
      },
      difficulty: result.settings.difficulty,
      score: result.score,
      correct_answers: result.correctCount,
      total_questions: result.totalCount,
      accuracy: Math.round((result.correctCount / result.totalCount) * 100),
      time_spent: result.totalTime,
      answers: result.answers,
      concept_ids: conceptIds, // 개념 ID 추가
      completed_at: new Date(),
      timestamp: new Date(),
      metadata: {
        created_at: new Date(),
        question_count: result.totalCount,
        settings: result.settings,
      },
    };

    // quiz_records에 저장
    const quizRef = doc(collection(db, "quiz_records"));
    await setDoc(quizRef, quizRecord);
    console.log("✅ quiz_records에 퀴즈 기록 저장 완료");

    // 2. 🎯 user_records에 통합 통계 업데이트
    console.log("🎯 퀴즈 완료 - 언어 설정 확인:", {
      sourceLanguage: result.settings.sourceLanguage,
      targetLanguage: result.settings.targetLanguage,
      score: result.score,
      correctCount: result.correctCount,
      totalCount: result.totalCount,
    });

    try {
      await collectionManager.updateUserProgressFromQuiz(currentUser.email, {
        answers: result.answers,
        totalTime: result.totalTime,
        score: result.score,
        accuracy: quizRecord.accuracy,
        correctCount: result.correctCount,
        totalCount: result.totalCount,
        // 언어 정보 추가
        sourceLanguage: result.settings.sourceLanguage,
        targetLanguage: result.settings.targetLanguage,
      });
      console.log("✅ user_records 퀴즈 통계 업데이트 완료");
    } catch (progressError) {
      console.error("❌ user_records 업데이트 실패:", progressError);
      // quiz_records는 저장되었으므로 계속 진행
    }

    // 3. 🔄 개념 스냅샷 자동 저장 (새로운 DB 구조 지원)
    try {
      if (conceptIds.length > 0) {
        console.log(
          `📋 퀴즈 개념 스냅샷 자동 저장 시작: ${conceptIds.length}개 개념`
        );

        // 퀴즈에서 사용된 개념들의 타입을 확인하여 적절한 타입으로 저장
        for (const conceptId of conceptIds) {
          // 개념 ID를 기반으로 컬렉션을 확인하여 타입 결정
          let conceptType = "vocabulary"; // 기본값

          try {
            // concepts, grammar, examples 컬렉션에서 확인
            const { doc, getDoc, db } = window.firebaseInit;

            // concepts 컬렉션 확인
            const conceptRef = doc(db, "concepts", conceptId);
            const conceptDoc = await getDoc(conceptRef);

            if (conceptDoc.exists()) {
              conceptType = "vocabulary";
            } else {
              // grammar 컬렉션 확인
              const grammarRef = doc(db, "grammar", conceptId);
              const grammarDoc = await getDoc(grammarRef);

              if (grammarDoc.exists()) {
                conceptType = "grammar";
              } else {
                // examples 컬렉션 확인
                const examplesRef = doc(db, "examples", conceptId);
                const examplesDoc = await getDoc(examplesRef);

                if (examplesDoc.exists()) {
                  conceptType = "examples";
                }
              }
            }
          } catch (error) {
            console.warn(`⚠️ 개념 타입 확인 실패: ${conceptId}`, error);
            conceptType = "vocabulary"; // 기본값 사용
          }

          // 타입별로 개별 저장
          await collectionManager.saveConceptSnapshotWithType(
            currentUser.email,
            conceptId,
            conceptType,
            result.settings.targetLanguage || "english"
          );
        }

        console.log("✅ 퀴즈 개념 스냅샷 자동 저장 완료");
      }
    } catch (snapshotError) {
      console.error("❌ 퀴즈 개념 스냅샷 저장 실패:", snapshotError);
      // 메인 기능은 완료되었으므로 계속 진행
    }

    // 🆕 진도 페이지 캐시 무효화를 위한 타임스탬프 설정
    try {
      const targetLanguage = result.settings.targetLanguage || "english";
      const invalidationTime = Date.now().toString();

      // 캐시 무효화 타임스탬프 설정
      localStorage.setItem(
        `cache_invalidated_${targetLanguage}`,
        invalidationTime
      );

      // 관련 캐시 삭제
      localStorage.removeItem(`total_words_cache_${targetLanguage}`);
      localStorage.removeItem(`mastered_words_cache_${targetLanguage}`);
      localStorage.removeItem(`stats_cache_${targetLanguage}`);

      console.log(
        `🔄 퀴즈 완료 - 진도 페이지 캐시 무효화 완료: ${targetLanguage}, 타임스탬프: ${invalidationTime}`
      );
      console.log(
        `🗑️ 관련 캐시 삭제 완료 - 퀴즈한 개념: ${conceptIds.length}개`
      );
    } catch (cacheError) {
      console.warn("⚠️ 퀴즈 완료 - 진도 페이지 캐시 무효화 실패:", cacheError);
    }

    // 진도 페이지 자동 업데이트를 위한 localStorage 신호
    localStorage.setItem(
      "quizCompletionUpdate",
      JSON.stringify({
        userEmail: currentUser.email,
        timestamp: new Date().toISOString(),
        score: result.score,
        correctCount: result.correctCount,
        totalCount: result.totalCount,
      })
    );

    console.log("✅ 퀴즈 결과 저장 및 진도 업데이트 완료");
  } catch (error) {
    console.error("❌ 퀴즈 결과 저장 중 오류:", error);
    throw error;
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
  elements.startQuizBtn.textContent = getI18nText("start_quiz") || "퀴즈 시작";

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
    console.log("📊 퀴즈 기록 로드 시작");
    if (!currentUser) {
      console.log("❌ 사용자 정보 없음 - 퀴즈 기록 로드 중단");
      return;
    }

    if (!elements.quizHistory) {
      console.log("❌ quizHistory 요소를 찾을 수 없음");
      return;
    }

    // 현재 언어 설정 가져오기
    const currentLanguage = getCurrentLanguage();
    const activeLanguage = await getActiveLanguage();
    const locale =
      activeLanguage === "ko"
        ? "ko-KR"
        : activeLanguage === "en"
        ? "en-US"
        : activeLanguage === "ja"
        ? "ja-JP"
        : activeLanguage === "zh"
        ? "zh-CN"
        : "en-US";

    // Firestore에서 퀴즈 기록 로드 (인덱스 오류 방지를 위해 단순화)
    const quizRecordsRef = collection(db, "quiz_records");
    const q = query(
      quizRecordsRef,
      where("user_email", "==", currentUser.email),
      limit(5)
    );

    const querySnapshot = await getDocs(q);
    console.log(`📊 퀴즈 기록 조회 결과: ${querySnapshot.size}개 문서`);

    if (querySnapshot.empty) {
      console.log("📊 퀴즈 기록 없음");
      elements.quizHistory.innerHTML = `
        <p class="text-gray-500 text-center py-8">${
          getI18nText("no_quiz_history", activeLanguage) ||
          "아직 퀴즈 기록이 없습니다."
        }</p>
      `;
      return;
    }

    // 필요한 필드만 추출 (select() 대신 클라이언트 필터링)
    const quizRecords = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      quizRecords.push({
        id: doc.id,
        quiz_type: data.quiz_type,
        accuracy: data.accuracy,
        correct_answers: data.correct_answers,
        total_questions: data.total_questions,
        completed_at: data.completed_at,
        timestamp: data.timestamp,
        language_pair: data.language_pair,
        sourceLanguage: data.sourceLanguage,
        targetLanguage: data.targetLanguage,
        // 정렬용
        sortDate:
          data.completed_at?.toDate?.() ||
          data.timestamp?.toDate?.() ||
          new Date(),
      });
    });

    // 클라이언트에서 날짜순 정렬 (최신순)
    quizRecords.sort((a, b) => b.sortDate - a.sortDate);
    console.log(`📊 정렬된 퀴즈 기록: ${quizRecords.length}개`);

    let historyHTML = "";
    quizRecords.forEach((data) => {
      const accuracy =
        data.accuracy ||
        Math.round((data.correct_answers / data.total_questions) * 100) ||
        0;
      const questions = data.total_questions || 5;
      const completedDate = data.sortDate;
      const sourceLangCode =
        data.language_pair?.source || data.sourceLanguage || "korean";
      const targetLangCode =
        data.language_pair?.target || data.targetLanguage || "english";
      const sourceLang =
        getI18nText(sourceLangCode, activeLanguage) || sourceLangCode;
      const targetLang =
        getI18nText(targetLangCode, activeLanguage) || targetLangCode;
      let quizTypeKey = `quiz_${data.quiz_type || "translation"}`;
      if (data.quiz_type === "fill_in_blank") {
        quizTypeKey = "quiz_fill_blank";
      }
      const quizTypeText =
        getI18nText(quizTypeKey, activeLanguage) || data.quiz_type || "어휘";
      const questionCountText =
        getI18nText("question_count", activeLanguage) || "문제";
      historyHTML += `
        <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
          <div>
            <span class="font-medium">${quizTypeText}</span>
            <span class="text-sm text-gray-600 ml-2">
              ${sourceLang} → ${targetLang} (${questions}${questionCountText})
            </span>
          </div>
          <div class="text-right">
            <div class="font-medium text-${
              accuracy >= 80 ? "green" : accuracy >= 60 ? "yellow" : "red"
            }-600">
              ${accuracy}%
            </div>
            <div class="text-xs text-gray-500">
              ${completedDate.toLocaleDateString(locale, {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>
        </div>
      `;
    });

    elements.quizHistory.innerHTML = historyHTML;
    console.log(
      `📝 퀴즈 기록 UI 렌더링 완료 - HTML 길이: ${historyHTML.length}자`
    );
  } catch (error) {
    console.error("❌ 퀴즈 기록 로드 중 오류:", error);
    const currentLanguage = getCurrentLanguage();
    elements.quizHistory.innerHTML = `
      <p class="text-red-500 text-center py-8">${
        getI18nText("error_loading_quiz_history", currentLanguage) ||
        "퀴즈 기록을 불러오는 중 오류가 발생했습니다."
      }</p>
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
