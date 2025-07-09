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
import { CollectionManager } from "../../js/firebase/firebase-collection-manager.js";

// 전역 변수
let currentUser = null;
let quizData = null;
let timerInterval = null;
let elements = {};
let collectionManager = new CollectionManager();

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
    } else {
      console.log("❌ 사용자가 로그인되지 않았습니다.");
      // alert 메시지 제거하고 바로 리디렉션
      if (typeof window.redirectToLogin === "function") {
        window.redirectToLogin();
      } else {
        // 대체 방법: 직접 언어별 로그인 페이지로 리디렉션
        const currentLanguage = localStorage.getItem("userLanguage") || "ko";
        window.location.href = `/locales/${currentLanguage}/login.html`;
      }
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

// 퀴즈 문제 생성 (개인화된 학습 기반)
async function generateQuizQuestions(settings) {
  try {
    console.log("📝 개인화된 퀴즈 문제 생성 중:", settings);

    // 현재 사용자 확인
    if (!currentUser) {
      throw new Error("사용자가 로그인되지 않았습니다.");
    }

    console.log("🔍 사용자 정보:", {
      uid: currentUser.uid,
      email: currentUser.email,
    });

    // 🎯 개념 데이터 조회 (간단한 방법으로 임시 변경)
    let personalizedConcepts = [];

    try {
      // 우선 간단하게 모든 개념 조회
      console.log("📚 전체 개념 조회 시작");
      const allConcepts = await collectionManager.getConceptsOnly(50);
      console.log(`📚 전체 개념 조회 결과: ${allConcepts.length}개`);

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

      console.log(`🎯 필터링된 개념: ${personalizedConcepts.length}개`);
    } catch (error) {
      console.error("❌ 개념 조회 실패:", error);
      personalizedConcepts = [];
    }

    if (personalizedConcepts.length === 0) {
      console.log("❌ 사용 가능한 개념이 없습니다 - 테스트 데이터로 대체");

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

      console.log(`🧪 테스트 데이터 사용: ${personalizedConcepts.length}개`);
    }

    // 🎓 난이도 필터링 (difficulty 설정이 'all'이 아닌 경우)
    let filteredConcepts = personalizedConcepts;
    if (settings.difficulty !== "all") {
      filteredConcepts = personalizedConcepts.filter(
        (concept) => concept.conceptInfo?.difficulty === settings.difficulty
      );

      // 특정 난이도의 개념이 부족하면 전체 개념 사용
      if (filteredConcepts.length < settings.questionCount) {
        console.log(
          `⚠️ ${settings.difficulty} 난이도 개념 부족, 전체 개념 사용`
        );
        filteredConcepts = personalizedConcepts;
      }
    }

    console.log(`✅ 최종 필터링된 개념: ${filteredConcepts.length}개`);

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

    console.log(`🎯 최종 생성된 문제: ${questions.length}개`);
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

    // 문제 방향 결정 (settings에 따라 고정)
    // sourceLanguage가 korean이고 targetLanguage가 english인 경우
    // 영어 의미 제시 → 한국어 단어 선택 (한국어 학습 강화)
    const isKoreanToEnglish =
      settings.sourceLanguage === "korean" &&
      settings.targetLanguage === "english";
    const questionExpr = isKoreanToEnglish ? toExpr : fromExpr; // 영어 의미 제시
    const answerExpr = isKoreanToEnglish ? fromExpr : toExpr; // 한국어 단어 선택

    // 오답 선택지 생성 (같은 방향의 다른 개념들 사용)
    const potentialWrongOptions = allConcepts
      .filter((c) => c.id !== concept.id)
      .map((c) =>
        isKoreanToEnglish ? c.fromExpression?.word : c.toExpression?.word
      )
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
        const word = isKoreanToEnglish
          ? c.fromExpression?.word
          : c.toExpression?.word;
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
        const word = isKoreanToEnglish
          ? c.fromExpression?.word
          : c.toExpression?.word;
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
    const translatePrompt =
      getTranslatedText("translate_this_word") || "다음 단어를 번역하세요";

    // 카테고리 정보 생성
    const categoryInfo =
      concept.conceptInfo?.domain && concept.conceptInfo?.category
        ? `${concept.conceptInfo.domain} / ${concept.conceptInfo.category}`
        : concept.conceptInfo?.domain || "일반";

    return {
      id: concept.id,
      conceptId: concept.id, // 🎯 user_progress 업데이트를 위한 conceptId 추가
      type: "translation",
      questionText: `${translatePrompt}: "${questionExpr.word}"`,
      hint:
        isKoreanToEnglish && questionExpr.pronunciation
          ? `발음: ${questionExpr.pronunciation}`
          : questionExpr.pronunciation || "",
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

    // 언어 방향에 따라 발음 문제 생성
    // 한국어 → 영어 학습인 경우, 영어 단어의 발음을 묻는 문제 생성
    const isKoreanToEnglish =
      settings.sourceLanguage === "korean" &&
      settings.targetLanguage === "english";

    let questionWord, questionPronunciation, hintText;

    if (isKoreanToEnglish) {
      // 영어 단어의 발음을 묻는 문제
      if (!toExpr?.word || !toExpr?.pronunciation) {
        console.error("❌ 영어 발음 데이터가 부족합니다:", concept.id);
        return null;
      }
      questionWord = toExpr.word;
      questionPronunciation = toExpr.pronunciation;
      hintText = fromExpr.word ? `의미: ${fromExpr.word}` : "";
    } else {
      // 한국어 단어의 발음을 묻는 문제 (기존 로직)
      if (!fromExpr?.word || !fromExpr?.pronunciation) {
        console.error("❌ 한국어 발음 데이터가 부족합니다:", concept.id);
        return null;
      }
      questionWord = fromExpr.word;
      questionPronunciation = fromExpr.pronunciation;
      hintText = toExpr.word ? `의미: ${toExpr.word}` : "";
    }

    // 같은 방향의 발음 데이터에서 오답 선택지 생성
    const wrongPronunciations = allConcepts
      .filter((c) => c.id !== concept.id)
      .map((c) =>
        isKoreanToEnglish
          ? c.toExpression?.pronunciation
          : c.fromExpression?.pronunciation
      )
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

    return {
      id: concept.id,
      conceptId: concept.id,
      type: "pronunciation",
      questionText: `다음 단어의 올바른 발음을 선택하세요: "${questionWord}"`,
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

    // 언어 방향에 따른 매칭 문제 생성
    const isKoreanToEnglish =
      settings.sourceLanguage === "korean" &&
      settings.targetLanguage === "english";

    let questionWord, answerWord, hintText;

    if (isKoreanToEnglish) {
      // 한국어 → 영어 학습: 영어 정의/설명 제시하고 한국어 단어를 선택지로 (의미 이해 능력 측정)
      const englishDefinition =
        toExpr.definition ||
        concept.conceptInfo?.definition ||
        `A word that means ${fromExpr.word}`;
      questionWord = englishDefinition; // 영어 정의/설명 제시
      answerWord = fromExpr.word; // 한국어 단어 (정답)
      hintText = toExpr.pronunciation ? `발음: ${toExpr.pronunciation}` : ""; // 영어 발음 힌트
    } else {
      // 영어 → 한국어 학습: 한국어 정의/설명 제시하고 영어 단어를 선택지로 (의미 이해 능력 측정)
      const koreanDefinition =
        fromExpr.definition ||
        concept.conceptInfo?.definition ||
        `${toExpr.word}을/를 의미하는 단어`;
      questionWord = koreanDefinition; // 한국어 정의/설명 제시
      answerWord = toExpr.word; // 영어 단어 (정답)
      hintText = fromExpr.pronunciation
        ? `발음: ${fromExpr.pronunciation}`
        : ""; // 한국어 발음 힌트
    }

    // 오답 선택지 생성 (정답과 같은 언어로)
    const wrongAnswers = wrongPairs.map((c) =>
      isKoreanToEnglish ? c.fromExpression.word : c.toExpression.word
    );

    const options = shuffleArray([answerWord, ...wrongAnswers]);

    const categoryInfo =
      concept.conceptInfo?.domain && concept.conceptInfo?.category
        ? `${concept.conceptInfo.domain} / ${concept.conceptInfo.category}`
        : concept.conceptInfo?.domain || "일반";

    return {
      id: concept.id,
      conceptId: concept.id,
      type: "matching",
      questionText: isKoreanToEnglish
        ? `다음 설명에 해당하는 한국어 단어를 선택하세요:\n"${questionWord}"`
        : `다음 설명에 해당하는 영어 단어를 선택하세요:\n"${questionWord}"`,
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

    // 언어 방향에 따른 빈칸 채우기 문제 생성
    const isKoreanToEnglish =
      settings.sourceLanguage === "korean" &&
      settings.targetLanguage === "english";

    let sentence, blankWord, hintText;

    if (isKoreanToEnglish) {
      // 한국어 → 영어 학습: 영어 문장에서 영어 단어를 빈칸으로 (영어 학습)
      if (
        concept.exampleInfo?.sentences &&
        concept.exampleInfo.sentences.length > 0
      ) {
        const exampleSentence = concept.exampleInfo.sentences[0];
        sentence = exampleSentence.english || `This is ${toExpr.word}.`;
        blankWord = toExpr.word; // 영어 단어가 정답
      } else {
        // 기본 영어 문장 패턴 생성
        sentence = `This is ${toExpr.word}.`;
        blankWord = toExpr.word; // 영어 단어가 정답
      }
      hintText = fromExpr.word
        ? `의미: ${fromExpr.word}` // 한국어 의미를 힌트로
        : "";

      // 영어 오답 선택지 생성
      const wrongOptions = allConcepts
        .filter((c) => c.id !== concept.id && c.toExpression?.word)
        .map((c) => c.toExpression.word)
        .filter((word) => word && word !== blankWord);

      if (wrongOptions.length < 2) {
        console.warn("⚠️ 영어 빈칸 채우기 선택지가 부족합니다:", concept.id);
        return null;
      }

      const selectedWrongOptions = shuffleArray(wrongOptions).slice(0, 3);
      var options = shuffleArray([blankWord, ...selectedWrongOptions]);
    } else {
      // 영어 → 한국어 학습: 한국어 문장에서 한국어 단어를 빈칸으로 (한국어 학습)
      if (
        concept.exampleInfo?.sentences &&
        concept.exampleInfo.sentences.length > 0
      ) {
        const exampleSentence = concept.exampleInfo.sentences[0];
        sentence = exampleSentence.korean || exampleSentence.sentence;
        blankWord = fromExpr.word; // 한국어 단어가 정답
      } else {
        // 기본 한국어 문장 패턴 생성
        sentence = `이것은 ${fromExpr.word}입니다.`;
        blankWord = fromExpr.word; // 한국어 단어가 정답
      }
      hintText = toExpr.word
        ? `의미: ${toExpr.word}` // 영어 의미를 힌트로
        : "";

      // 한국어 오답 선택지 생성
      const wrongOptions = allConcepts
        .filter((c) => c.id !== concept.id && c.fromExpression?.word)
        .map((c) => c.fromExpression.word)
        .filter((word) => word && word !== blankWord);

      if (wrongOptions.length < 2) {
        console.warn("⚠️ 한국어 빈칸 채우기 선택지가 부족합니다:", concept.id);
        return null;
      }

      const selectedWrongOptions = shuffleArray(wrongOptions).slice(0, 3);
      var options = shuffleArray([blankWord, ...selectedWrongOptions]);
    }

    // 단어를 빈칸으로 치환
    const questionText = sentence.replace(blankWord, "______");

    const categoryInfo =
      concept.conceptInfo?.domain && concept.conceptInfo?.category
        ? `${concept.conceptInfo.domain} / ${concept.conceptInfo.category}`
        : concept.conceptInfo?.domain || "일반";

    return {
      id: concept.id,
      conceptId: concept.id,
      type: "fill_blank",
      questionText: `다음 빈칸에 알맞은 단어를 선택하세요:\n${questionText}`,
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
      beginner: "bg-green-100 text-green-800", // beginner 추가
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

  // 힌트 표시 (발음 또는 의미 정보)
  const hintElement = document.getElementById("question-hint");
  if (hintElement && question.hint && question.hint.trim()) {
    hintElement.classList.remove("hidden");
    const hintSpan = hintElement.querySelector("span");
    if (hintSpan) {
      hintSpan.textContent = question.hint; // 이미 "발음:" 또는 "의미:" 레이블이 포함됨
    }
  } else if (hintElement) {
    hintElement.classList.add("hidden");
  }

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
    conceptId: question.conceptId, // 🎯 user_progress 업데이트를 위한 conceptId 추가
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
    conceptId: question.conceptId, // 🎯 user_progress 업데이트를 위한 conceptId 추가
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
    console.log("💾 퀴즈 결과 저장 시작:", result);

    // 1. 퀴즈 결과 저장 (자동 ID 사용)
    const resultDoc = {
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

    const quizRef = doc(collection(db, "quiz_records"));
    await setDoc(quizRef, resultDoc);
    console.log("✅ 퀴즈 결과 저장 완료");

    // 2. 🎯 개인 학습 진도 업데이트
    try {
      await collectionManager.updateUserProgressFromQuiz(currentUser.email, {
        answers: result.answers,
        totalTime: result.totalTime,
        score: result.score,
      });
      console.log("✅ 학습 진도 업데이트 완료");
    } catch (progressError) {
      console.error(
        "⚠️ 학습 진도 업데이트 실패 (퀴즈 결과는 저장됨):",
        progressError
      );
    }

    // 3. 퀴즈 기록 새로고침
    await loadQuizHistory();
  } catch (error) {
    console.error("❌ 퀴즈 결과 저장 중 오류:", error);
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

    // quiz_records 컬렉션에서 퀴즈 기록 조회
    const historyQuery = query(
      collection(db, "quiz_records"),
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
