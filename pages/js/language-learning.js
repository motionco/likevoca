import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
  getFirestore,
  collection,
  query,
  where,
  limit,
  getDocs,
  orderBy,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
// 기타 유틸리티는 필요시 동적으로 로드

// Firebase 설정을 동적으로 로드
let app, db, auth;

async function initializeFirebase() {
  try {
    const response = await fetch('/api/config');
    const configData = await response.json();

    if (configData.firebase) {
      app = initializeApp(configData.firebase);
      db = getFirestore(app);
      auth = getAuth(app);
    } else {
      console.error('Firebase 설정을 가져올 수 없습니다.');
    }
  } catch (error) {
    console.error('Firebase 초기화 실패:', error);
  }
}

// 현재 사용자
let currentUser = null;

// 현재 학습 설정 (확장됨)
let currentLearningData = {
  concepts: [],
  examples: [],
  grammarPatterns: [],
  readingPassages: [],
  listeningContent: [],
};

let currentItemIndex = 0;
let sourceLanguage = "korean";
let targetLanguage = "english";
let difficultyLevel = "all";
let currentArea = null;
let currentMode = null;

// 학습 통계 (확장됨)
let learningStats = {
  wordsLearned: 0,
  timeStudied: 0,
  correctAnswers: 0,
  totalAnswers: 0,
  startTime: null,
};

// 학습 영역 및 모드 설정
const learningAreas = {
  vocabulary: {
    name: "단어 학습",
    icon: "fas fa-book",
    modes: [
      {
        id: "flashcard",
        name: "플래시카드",
        icon: "fas fa-copy",
        desc: "단어 앞면/뒷면으로 학습",
      },
      {
        id: "pronunciation",
        name: "발음 연습",
        icon: "fas fa-microphone",
        desc: "발음을 듣고 따라하기",
      },
    ],
  },
  grammar: {
    name: "문법 학습",
    icon: "fas fa-language",
    modes: [
      {
        id: "grammar-learning",
        name: "문법 규칙",
        icon: "fas fa-book-open",
        desc: "문법 패턴 학습",
      },
      {
        id: "grammar-practice",
        name: "문법 연습",
        icon: "fas fa-pencil",
        desc: "문법 문제 풀이",
      },
    ],
  },
  reading: {
    name: "독해 학습",
    icon: "fas fa-file-text",
    modes: [
      {
        id: "vocabulary-in-context",
        name: "문맥 속 어휘",
        icon: "fas fa-highlighter",
        desc: "지문 속 단어 학습",
      },
    ],
  },
  listening: {
    name: "듣기 학습",
    icon: "fas fa-headphones",
    modes: [
      {
        id: "dictation",
        name: "받아쓰기",
        icon: "fas fa-edit",
        desc: "들은 내용 입력하기",
      },
    ],
  },
};

// 기존 학습 결과 추적
let typingStats = {
  correct: 0,
  wrong: 0,
};

document.addEventListener("DOMContentLoaded", async function () {
  console.log("다국어 학습 페이지 로딩 시작...");

  // 네비게이션바 로드
  try {
    const userLanguage = localStorage.getItem("userLanguage") || "ko";
    const response = await fetch(`../locales/${userLanguage}/navbar.html`);
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

  // 사용자 인증 상태 확인
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      currentUser = user;

      console.log("다국어 학습 페이지에서 로그인 상태 확인됨");

      // 로그인된 상태에서 바로 초기화
      initializePage();
    } else {
      console.log("로그인되지 않음, 게스트 모드로 실행");
      // 로그인하지 않은 상태에서도 기본 기능 사용 가능 (샘플 데이터)
      currentUser = null;
      initializePage();
    }
  });
});

// 언어 설정 함수
function setupLanguageSettings() {
  // 언어 설정 로드
  sourceLanguage = document.getElementById("source-language").value;
  targetLanguage = document.getElementById("target-language").value;
  difficultyLevel = document.getElementById("difficulty-level").value;

  // 언어 변경 이벤트 리스너
  document
    .getElementById("source-language")
    .addEventListener("change", handleSettingsChange);
  document
    .getElementById("target-language")
    .addEventListener("change", handleSettingsChange);
  document
    .getElementById("difficulty-level")
    .addEventListener("change", handleSettingsChange);
}

// 페이지 초기화
async function initializePage() {
  setupEventListeners();
  setupLanguageSettings();

  // 분리된 업로드 모달 로드
  await loadBulkImportModal();

  console.log("다국어 학습 페이지 초기화 완료");
}

// 이벤트 리스너 설정
function setupEventListeners() {
  // 언어 및 난이도 선택 변경
  ["source-language", "target-language", "difficulty-level"].forEach((id) => {
    const element = document.getElementById(id);
    if (element) {
      element.addEventListener("change", handleSettingsChange);
    }
  });

  // 영역별 학습 버튼
  Object.keys(learningAreas).forEach((areaId) => {
    const button = document.getElementById(`${areaId}-area`);
    if (button) {
      button.addEventListener("click", () => selectLearningArea(areaId));
    }
  });

  // 학습 단어장 추가 버튼
  const addVocabularyBtn = document.getElementById("add-vocabulary-wordbook");
  if (addVocabularyBtn) {
    addVocabularyBtn.addEventListener("click", (e) => {
      e.stopPropagation(); // 부모 클릭 이벤트 방지
      openBulkImportModal("concepts");
    });
  }

  // 언어 선택 변경 (기존 이벤트)
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

  // 학습 모드 선택 (기존 - 하위 호환성)
  const flashcardModeBtn = document.getElementById("flashcard-mode");
  const typingModeBtn = document.getElementById("typing-mode");

  if (flashcardModeBtn) {
    flashcardModeBtn.addEventListener("click", () => {
      showMode("flashcard");
      initFlashcardMode();
    });
  }

  if (typingModeBtn) {
    typingModeBtn.addEventListener("click", () => {
      showMode("typing");
      initTypingMode();
    });
  }

  // 기존 플래시카드 및 타이핑 이벤트 (하위 호환성)
  setupLegacyEventListeners();

  // 새로운 학습 모드 이벤트
  setupNewLearningModeEvents();
}

// 설정 변경 처리
async function handleSettingsChange() {
  sourceLanguage = document.getElementById("source-language").value;
  targetLanguage = document.getElementById("target-language").value;
  difficultyLevel = document.getElementById("difficulty-level").value;

  // 현재 활성화된 영역이 있다면 데이터 다시 로드
  if (currentArea) {
    await loadLearningData(currentArea);
  }
}

// 학습 영역 선택
async function selectLearningArea(areaId) {
  try {
    currentArea = areaId;

    // 모든 영역 버튼 비활성화
    document.querySelectorAll(".skill-button").forEach((btn) => {
      btn.classList.remove("skill-active");
    });

    // 선택된 영역 활성화
    const selectedButton = document.getElementById(`${areaId}-area`);
    if (selectedButton) {
      selectedButton.classList.add("skill-active");
    }

    // 해당 영역의 학습 모드 표시
    displayLearningModes(areaId);

    // 학습 데이터 로드
    await loadLearningData(areaId);

    console.log(`${areaId} 영역 선택됨`);
  } catch (error) {
    console.error("학습 영역 선택 중 오류:", error);
    showError("학습 영역을 로드하는 중 문제가 발생했습니다.");
  }
}

// 학습 모드 표시
function displayLearningModes(areaId) {
  const modeSection = document.getElementById("learning-mode-section");
  const modeContainer = document.getElementById("mode-buttons-container");

  if (!modeSection || !modeContainer) return;

  const area = learningAreas[areaId];
  if (!area) return;

  // 모드 버튼 생성
  modeContainer.innerHTML = area.modes
    .map(
      (mode) => `
    <button 
      id="${mode.id}-mode" 
      class="mode-button bg-gradient-to-br from-indigo-500 to-indigo-600 text-white p-4 rounded-lg hover:from-indigo-600 hover:to-indigo-700 transition-all duration-300"
      data-mode="${mode.id}"
    >
      <i class="${mode.icon} text-2xl mb-2"></i>
      <div class="font-bold">${mode.name}</div>
      <p class="text-sm opacity-80">${mode.desc}</p>
    </button>
  `
    )
    .join("");

  // 모드 버튼 이벤트 추가
  area.modes.forEach((mode) => {
    const button = document.getElementById(`${mode.id}-mode`);
    if (button) {
      button.addEventListener("click", () => selectLearningMode(mode.id));
    }
  });

  modeSection.classList.remove("hidden");
}

// 학습 모드 선택
async function selectLearningMode(modeId) {
  try {
    currentMode = modeId;

    // 모든 모드 버튼 비활성화
    document.querySelectorAll(".mode-button").forEach((btn) => {
      btn.classList.remove("mode-active");
    });

    // 선택된 모드 활성화
    const selectedButton = document.getElementById(`${modeId}-mode`);
    if (selectedButton) {
      selectedButton.classList.add("mode-active");
    }

    // 모든 학습 컨테이너 숨기기
    hideAllLearningContainers();

    // 선택한 모드 표시 및 초기화
    await initializeLearningMode(modeId);

    console.log(`${modeId} 모드 선택됨`);
  } catch (error) {
    console.error("학습 모드 선택 중 오류:", error);
    showError("학습 모드를 시작하는 중 문제가 발생했습니다.");
  }
}

// 모든 학습 컨테이너 숨기기
function hideAllLearningContainers() {
  const containers = [
    "flashcard-container",
    "typing-container",
    "pronunciation-container",
    "multiple-choice-container",
    "sentence-completion-container",
    "grammar-learning-container",
    "reading-comprehension-container",
    "listening-comprehension-container",
  ];

  containers.forEach((containerId) => {
    const container = document.getElementById(containerId);
    if (container) {
      container.classList.add("hidden");
    }
  });
}

// 학습 데이터 로드 (개선된 버전)
async function loadLearningData(areaId) {
  try {
    console.log(`${areaId} 영역 데이터 로딩 시작...`);

    currentLearningData = {
      concepts: [],
      grammarPatterns: [],
      readingPassages: [],
      listeningContent: [],
    };

    // Firebase에서 개념 데이터 로드 시도
    let concepts = [];

    try {
      // Firebase 연결 상태 확인
      const auth = getAuth();

      const conceptsRef = collection(db, "concepts");
      let conceptsQuery;

      // 언어 및 난이도 필터링
      if (difficultyLevel === "all") {
        conceptsQuery = query(conceptsRef, limit(50));
      } else {
        conceptsQuery = query(
          conceptsRef,
          where("concept_info.difficulty", "==", difficultyLevel),
          limit(50)
        );
      }

      // 타임아웃과 함께 데이터 로드 시도
      const snapshotPromise = getDocs(conceptsQuery);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Firebase 연결 타임아웃")), 15000)
      );

      const snapshot = await Promise.race([snapshotPromise, timeoutPromise]);

      snapshot.forEach((doc) => {
        const data = doc.data();
        data.id = doc.id;
        concepts.push(data);
      });

      console.log(`Firebase에서 로드된 개념 수: ${concepts.length}`);

      // 데이터가 없으면 샘플 데이터 추가
      if (concepts.length === 0) {
        console.log("Firebase 데이터가 비어있음, 샘플 데이터 추가");
        concepts = generateSampleConcepts();
      }
    } catch (error) {
      console.warn("Firebase 데이터 로딩 실패, 샘플 데이터 사용:", error);

      // 샘플 데이터 생성
      concepts = generateSampleConcepts();
      console.log(`샘플 데이터 생성됨: ${concepts.length}개`);
    }

    // 학습 영역별 데이터 구성
    switch (areaId) {
      case "vocabulary":
        currentLearningData.concepts = concepts;
        break;

      case "grammar":
        // 개념에서 문법 정보 추출
        currentLearningData.grammarPatterns = [];

        concepts.forEach((concept, index) => {
          // featured_examples에서 문법 정보 추출
          if (
            concept.featured_examples &&
            Array.isArray(concept.featured_examples)
          ) {
            concept.featured_examples.forEach((example, exampleIndex) => {
              if (example.grammar_system) {
                const grammarPattern = {
                  id: `${concept.id}_example_${exampleIndex}`,
                  concept_id: concept.id,
                  pattern_name:
                    example.grammar_system.pattern_name || "문법 패턴",
                  structural_pattern:
                    example.grammar_system.structural_pattern || "",
                  difficulty:
                    example.difficulty ||
                    concept.concept_info?.difficulty ||
                    "beginner",
                  domain: concept.concept_info?.domain || "general",
                  category: concept.concept_info?.category || "general",
                  grammar_tags: example.grammar_system.grammar_tags || [],
                  learning_focus: example.grammar_system.learning_focus || [],
                  example_translations: example.translations || {},
                  concept_data: {
                    word: concept.expressions?.[sourceLanguage]?.word || "",
                    expressions: concept.expressions,
                  },
                  source: "concepts",
                };
                currentLearningData.grammarPatterns.push(grammarPattern);
              }
            });
          }

          // expressions에서 문법 정보 추출
          if (concept.expressions) {
            Object.entries(concept.expressions).forEach(([lang, expr]) => {
              if (expr.grammar_system) {
                const grammarPattern = {
                  id: `${concept.id}_expr_${lang}`,
                  concept_id: concept.id,
                  pattern_name:
                    expr.grammar_system.pattern_name || `${lang} 문법`,
                  structural_pattern:
                    expr.grammar_system.structural_pattern || "",
                  difficulty: concept.concept_info?.difficulty || "beginner",
                  domain: concept.concept_info?.domain || "general",
                  category: concept.concept_info?.category || "general",
                  grammar_tags: expr.grammar_system.grammar_tags || [],
                  learning_focus: expr.grammar_system.learning_focus || [],
                  example_translations: {
                    [lang]: {
                      text: expr.word || "",
                      grammar_notes: expr.grammar_system.notes || "",
                    },
                  },
                  concept_data: {
                    word: concept.expressions?.[sourceLanguage]?.word || "",
                    expressions: concept.expressions,
                  },
                  source: "concepts",
                };
                currentLearningData.grammarPatterns.push(grammarPattern);
              }
            });
          }
        });

        // 기본 문법 패턴 추가 (데이터가 부족한 경우)
        if (currentLearningData.grammarPatterns.length === 0) {
          currentLearningData.grammarPatterns = getDefaultGrammarPatterns();
        }

        console.log(
          `추출된 문법 패턴 수: ${currentLearningData.grammarPatterns.length}`
        );
        break;

      case "reading":
        // 개념에서 독해 지문 생성
        currentLearningData.readingPassages = concepts
          .slice(0, 10)
          .map((concept, index) => {
            const primaryLang = sourceLanguage;
            const secondaryLang = targetLanguage;

            const word = concept.expressions?.[primaryLang]?.word || "단어";
            const definition =
              concept.expressions?.[secondaryLang]?.definition || "정의";

            return {
              id: `reading_${concept.id}`,
              title: `${word}에 대하여`,
              content: `${word}는 ${definition}입니다. 이 단어는 ${
                concept.concept_info?.category || "일반"
              } 분야에서 자주 사용됩니다.`,
              difficulty: concept.concept_info?.difficulty || "beginner",
              vocabulary: [
                {
                  word: word,
                  meaning: definition,
                  pronunciation:
                    concept.expressions?.[primaryLang]?.pronunciation || "",
                },
              ],
              questions: [
                {
                  question: `${word}의 의미는 무엇입니까?`,
                  options: [
                    definition,
                    "다른 의미1",
                    "다른 의미2",
                    "다른 의미3",
                  ],
                  correct: 0,
                },
              ],
            };
          });
        break;

      case "listening":
        // 개념에서 듣기 콘텐츠 생성
        currentLearningData.listeningContent = concepts
          .slice(0, 5)
          .map((concept, index) => {
            const word = concept.expressions?.[sourceLanguage]?.word || "단어";
            const pronunciation =
              concept.expressions?.[sourceLanguage]?.pronunciation || "";

            return {
              id: `listening_${concept.id}`,
              title: `${word} 발음 연습`,
              audioUrl: concept.expressions?.[sourceLanguage]?.audio || "",
              transcript: `${word}의 올바른 발음은 ${pronunciation}입니다.`,
              difficulty: concept.concept_info?.difficulty || "beginner",
              questions: [
                {
                  question: "들은 단어는 무엇입니까?",
                  options: [word, "다른단어1", "다른단어2", "다른단어3"],
                  correct: 0,
                },
              ],
            };
          });
        break;
    }

    console.log(`${areaId} 영역 데이터 로딩 완료`);
    return true;
  } catch (error) {
    console.error(`${areaId} 데이터 로딩 중 오류:`, error);

    // 오류 발생 시 기본 데이터 사용
    switch (areaId) {
      case "vocabulary":
        currentLearningData.concepts = generateSampleConcepts();
        break;
      case "grammar":
        currentLearningData.grammarPatterns = getDefaultGrammarPatterns();
        break;
      case "reading":
        currentLearningData.readingPassages = getDefaultReadingPassages();
        break;
      case "listening":
        currentLearningData.listeningContent = getDefaultListeningContent();
        break;
    }

    return false;
  }
}

// 학습 모드 초기화
async function initializeLearningMode(modeId) {
  const container = document.getElementById(
    `${modeId.replace("-", "-")}-container`
  );
  if (container) {
    container.classList.remove("hidden");
  }

  switch (modeId) {
    case "flashcard":
      initFlashcardMode();
      break;
    case "typing":
      initTypingMode();
      break;
    case "pronunciation":
      initPronunciationMode();
      break;
    case "multiple-choice":
      initMultipleChoiceMode();
      break;
    case "sentence-completion":
      initSentenceCompletionMode();
      break;
    case "grammar-learning":
      initGrammarLearningMode();
      break;
    case "reading-comprehension":
      initReadingComprehensionMode();
      break;
    case "listening-comprehension":
      initListeningComprehensionMode();
      break;
  }
}

// ============ 기존 플래시카드 및 타이핑 모드 (업데이트) ============

function initFlashcardMode() {
  if (currentLearningData.concepts.length === 0) {
    showError("학습할 단어가 없습니다.");
    return;
  }

  displayFlashcard(currentLearningData.concepts[currentItemIndex]);
  updateProgress(
    "flashcard",
    currentItemIndex + 1,
    currentLearningData.concepts.length
  );
}

function displayFlashcard(concept) {
  if (!concept) return;

  const sourceExpression = concept.expressions?.[sourceLanguage];
  const targetExpression = concept.expressions?.[targetLanguage];

  if (!sourceExpression || !targetExpression) return;

  // 앞면 표시
  document.getElementById("card-category").textContent =
    concept.concept_info?.domain || "";
  document.getElementById("card-emoji").textContent =
    concept.concept_info?.unicode_emoji || "📚";
  document.getElementById("front-word").textContent =
    sourceExpression.word || "";
  document.getElementById("front-pronunciation").textContent =
    sourceExpression.pronunciation || "";

  // 뒷면 표시
  document.getElementById("back-word").textContent =
    targetExpression.word || "";
  document.getElementById("back-pronunciation").textContent =
    targetExpression.pronunciation || "";
  document.getElementById("back-definition").textContent =
    targetExpression.definition || "";

  // 예문 표시 (대표 예문 또는 첫 번째 예문)
  const example = concept.representative_example || concept.core_examples?.[0];
  if (example) {
    const exampleText = example.translations?.[targetLanguage]?.text || "";
    const sourceExample = example.translations?.[sourceLanguage]?.text || "";

    document.getElementById("example").textContent = exampleText;
    document.getElementById("example-translation").textContent = sourceExample;
  } else {
    document.getElementById("example").textContent = "";
    document.getElementById("example-translation").textContent = "";
  }

  // 카드 뒤집기 상태 초기화
  resetFlipCard();
}

function initTypingMode() {
  if (currentLearningData.concepts.length === 0) {
    showError("학습할 단어가 없습니다.");
    return;
  }

  displayTypingQuestion(currentLearningData.concepts[currentItemIndex]);
  updateProgress(
    "typing",
    currentItemIndex + 1,
    currentLearningData.concepts.length
  );

  // 타이핑 통계 초기화
  learningStats.correctAnswers = 0;
  learningStats.totalAnswers = 0;
  updateTypingStats();
}

function displayTypingQuestion(concept) {
  if (!concept) return;

  const sourceExpression = concept.expressions?.[sourceLanguage];
  const targetExpression = concept.expressions?.[targetLanguage];

  if (!sourceExpression || !targetExpression) return;

  document.getElementById("typing-category").textContent =
    concept.concept_info?.domain || "";
  document.getElementById("typing-word").textContent =
    sourceExpression.word || "";
  document.getElementById("typing-pronunciation").textContent =
    sourceExpression.pronunciation || "";

  // 정답 저장 (data attribute)
  const answerInput = document.getElementById("typing-answer");
  if (answerInput) {
    answerInput.value = "";
    answerInput.dataset.correctAnswer = targetExpression.word || "";
    answerInput.focus();
  }

  // 결과 숨기기
  const resultDiv = document.getElementById("typing-result");
  const nextBtn = document.getElementById("next-typing");
  if (resultDiv) resultDiv.classList.add("hidden");
  if (nextBtn) nextBtn.classList.add("hidden");
}

// ============ 새로운 학습 모드들 ============

function initPronunciationMode() {
  if (currentLearningData.concepts.length === 0) {
    showError("학습할 단어가 없습니다.");
    return;
  }

  displayPronunciationCard(currentLearningData.concepts[currentItemIndex]);
  updateProgress(
    "pronunciation",
    currentItemIndex + 1,
    currentLearningData.concepts.length
  );
}

function displayPronunciationCard(concept) {
  if (!concept) return;

  const targetExpression = concept.expressions?.[targetLanguage];
  if (!targetExpression) return;

  document.getElementById("pronunciation-category").textContent =
    concept.concept_info?.domain || "";
  document.getElementById("pronunciation-emoji").textContent =
    concept.concept_info?.unicode_emoji || "🎤";
  document.getElementById("pronunciation-word").textContent =
    targetExpression.word || "";
  document.getElementById("pronunciation-phonetic").textContent =
    targetExpression.pronunciation || "";
  document.getElementById("pronunciation-definition").textContent =
    targetExpression.definition || "";
}

function initMultipleChoiceMode() {
  if (currentLearningData.concepts.length === 0) {
    showError("학습할 단어가 없습니다.");
    return;
  }

  generateMultipleChoiceQuestion(
    currentLearningData.concepts[currentItemIndex]
  );
  updateProgress(
    "quiz",
    currentItemIndex + 1,
    currentLearningData.concepts.length
  );
}

function generateMultipleChoiceQuestion(concept) {
  if (!concept) return;

  const sourceExpression = concept.expressions?.[sourceLanguage];
  const targetExpression = concept.expressions?.[targetLanguage];

  if (!sourceExpression || !targetExpression) return;

  // 질문 생성
  const question = `"${sourceExpression.word}"의 ${targetLanguage} 번역은?`;
  document.getElementById("quiz-question").textContent = question;
  document.getElementById("quiz-category").textContent =
    concept.concept_info?.domain || "";

  // 정답과 오답 선택지 생성
  const correctAnswer = targetExpression.word;
  const distractors = generateDistractors(correctAnswer, 3);
  const options = [correctAnswer, ...distractors].sort(
    () => Math.random() - 0.5
  );

  // 선택지 표시
  const optionsContainer = document.getElementById("quiz-options");
  if (optionsContainer) {
    optionsContainer.innerHTML = options
      .map(
        (option, index) => `
      <button class="quiz-option w-full p-3 text-left border rounded-lg hover:bg-blue-50 transition"
              data-answer="${option}" data-correct="${
          option === correctAnswer
        }">
        ${String.fromCharCode(65 + index)}. ${option}
      </button>
    `
      )
      .join("");

    // 선택지 클릭 이벤트
    optionsContainer.querySelectorAll(".quiz-option").forEach((button) => {
      button.addEventListener("click", () => checkMultipleChoiceAnswer(button));
    });
  }
}

function generateDistractors(correctAnswer, count) {
  // 현재 학습 데이터에서 다른 단어들을 오답으로 사용
  const otherWords = currentLearningData.concepts
    .map((c) => c.expressions?.[targetLanguage]?.word)
    .filter((word) => word && word !== correctAnswer)
    .sort(() => Math.random() - 0.5)
    .slice(0, count);

  // 부족한 경우 기본 오답 추가
  while (otherWords.length < count) {
    otherWords.push(`오답${otherWords.length + 1}`);
  }

  return otherWords;
}

function checkMultipleChoiceAnswer(selectedButton) {
  const isCorrect = selectedButton.dataset.correct === "true";
  const resultDiv = document.getElementById("quiz-result");

  // 모든 선택지 비활성화
  document.querySelectorAll(".quiz-option").forEach((btn) => {
    btn.disabled = true;
    if (btn.dataset.correct === "true") {
      btn.classList.add("bg-green-100", "border-green-500");
    } else if (btn === selectedButton && !isCorrect) {
      btn.classList.add("bg-red-100", "border-red-500");
    }
  });

  // 결과 표시
  if (resultDiv) {
    resultDiv.className = `mt-4 p-4 rounded ${
      isCorrect ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
    }`;
    resultDiv.textContent = isCorrect
      ? "정답입니다! 🎉"
      : "틀렸습니다. 다시 시도해보세요.";
    resultDiv.classList.remove("hidden");
  }

  // 통계 업데이트
  learningStats.totalAnswers++;
  if (isCorrect) {
    learningStats.correctAnswers++;
    learningStats.wordsLearned++;
  }
  updateLearningStats();

  // 다음 버튼 표시
  const nextBtn = document.getElementById("next-quiz");
  if (nextBtn) {
    nextBtn.classList.remove("hidden");
  }
}

function initSentenceCompletionMode() {
  if (currentLearningData.concepts.length === 0) {
    showError("학습할 단어가 없습니다.");
    return;
  }

  generateSentenceCompletionQuestion(
    currentLearningData.concepts[currentItemIndex]
  );
  updateProgress(
    "sentence",
    currentItemIndex + 1,
    currentLearningData.concepts.length
  );
}

function generateSentenceCompletionQuestion(concept) {
  if (!concept) return;

  const targetExpression = concept.expressions?.[targetLanguage];
  const example = concept.representative_example || concept.core_examples?.[0];

  if (!targetExpression || !example) return;

  const targetWord = targetExpression.word;
  const sentence = example.translations?.[targetLanguage]?.text || "";

  if (!sentence.includes(targetWord)) return;

  // 문장에서 단어를 빈칸으로 변경
  const template = sentence.replace(targetWord, "______");

  document.getElementById("sentence-category").textContent =
    concept.concept_info?.domain || "";
  document.getElementById("sentence-template").textContent = template;
  document.getElementById("sentence-hint-text").textContent =
    targetExpression.definition || "";

  // 정답 저장
  const answerInput = document.getElementById("sentence-answer");
  if (answerInput) {
    answerInput.value = "";
    answerInput.dataset.correctAnswer = targetWord;
    answerInput.focus();
  }
}

function initGrammarLearningMode() {
  if (currentLearningData.grammarPatterns.length === 0) {
    showError("학습할 문법 패턴이 없습니다.");
    return;
  }

  displayGrammarPattern(currentLearningData.grammarPatterns[currentItemIndex]);
  updateProgress(
    "grammar",
    currentItemIndex + 1,
    currentLearningData.grammarPatterns.length
  );
}

function displayGrammarPattern(pattern) {
  if (!pattern) return;

  // === 수정: 새로운 분리된 컬렉션 구조에 맞게 속성 접근 ===

  // 패턴 카테고리 (도메인/카테고리)
  const categoryText =
    pattern.domain || pattern.category || pattern.pattern_type || "기본 문법";
  document.getElementById("grammar-category").textContent = categoryText;

  // 패턴 제목 (pattern_name 우선, 없으면 pattern_id)
  const titleText = pattern.pattern_name || pattern.pattern_id || "문법 패턴";
  document.getElementById("grammar-title").textContent = titleText;

  // 패턴 설명 (teaching_notes에서 추출하거나 기본 설명)
  let descriptionText = "";
  if (pattern.teaching_notes?.primary_focus) {
    descriptionText = pattern.teaching_notes.primary_focus;
  } else if (pattern.learning_focus && pattern.learning_focus.length > 0) {
    descriptionText = pattern.learning_focus.join(", ");
  } else if (pattern.description?.[targetLanguage]) {
    descriptionText = pattern.description[targetLanguage];
  } else {
    descriptionText = "문법 패턴을 학습해보세요.";
  }
  document.getElementById("grammar-description").textContent = descriptionText;

  // 구조적 패턴 (structural_pattern)
  const structureText =
    pattern.structural_pattern ||
    pattern.structure?.[targetLanguage] ||
    "기본 문장 구조";
  document.getElementById("grammar-structure").textContent = structureText;

  // 예문 표시 (example_translations 우선, 없으면 examples)
  const examplesContainer = document.getElementById("grammar-examples");
  if (examplesContainer) {
    let examplesHTML = "";

    // 새로운 구조: example_translations
    if (pattern.example_translations) {
      const targetExample =
        pattern.example_translations[targetLanguage]?.text || "";
      const sourceExample =
        pattern.example_translations[sourceLanguage]?.text || "";

      if (targetExample || sourceExample) {
        examplesHTML = `
          <div class="bg-white p-3 rounded border-l-4 border-blue-500">
            <div class="font-medium">${targetExample}</div>
            <div class="text-sm text-gray-600 mt-1">${sourceExample}</div>
          </div>
        `;
      }
    }
    // 기존 구조: examples 배열
    else if (pattern.examples && Array.isArray(pattern.examples)) {
      examplesHTML = pattern.examples
        .map(
          (example) => `
        <div class="bg-white p-3 rounded border-l-4 border-blue-500">
          <div class="font-medium">${example[targetLanguage] || ""}</div>
          <div class="text-sm text-gray-600 mt-1">${
            example[sourceLanguage] || ""
          }</div>
        </div>
      `
        )
        .join("");
    }

    if (examplesHTML) {
      examplesContainer.innerHTML = examplesHTML;
    } else {
      examplesContainer.innerHTML = `
        <div class="bg-gray-50 p-3 rounded text-center text-gray-500">
          <p>예문이 곧 추가될 예정입니다.</p>
        </div>
      `;
    }
  }

  // 연습 문제 생성
  generateGrammarExercise(pattern);
}

function generateGrammarExercise(pattern) {
  const exerciseContainer = document.getElementById("grammar-exercise");
  if (!exerciseContainer) return;

  // 간단한 연습 문제 생성 (향후 확장 가능)
  exerciseContainer.innerHTML = `
    <div class="border rounded-lg p-4">
      <h4 class="font-medium mb-3">연습 문제</h4>
      <p class="text-sm text-gray-600 mb-4">다음 문장에서 문법 패턴을 찾아보세요:</p>
      <div class="bg-gray-50 p-3 rounded">
        <p class="text-gray-700">문제가 곧 추가될 예정입니다.</p>
      </div>
    </div>
  `;
}

function initReadingComprehensionMode() {
  if (currentLearningData.readingPassages.length === 0) {
    showError("학습할 독해 지문이 없습니다.");
    return;
  }

  displayReadingPassage(currentLearningData.readingPassages[currentItemIndex]);
  updateProgress(
    "reading",
    currentItemIndex + 1,
    currentLearningData.readingPassages.length
  );
}

function displayReadingPassage(passage) {
  if (!passage) return;

  document.getElementById("reading-category").textContent =
    passage.category || "";

  const passageContainer = document.getElementById("reading-passage");
  if (passageContainer) {
    passageContainer.textContent = passage.text || "";
  }

  // 주요 어휘 표시
  const vocabularyContainer = document.getElementById("vocabulary-list");
  if (vocabularyContainer && passage.vocabulary) {
    vocabularyContainer.innerHTML = passage.vocabulary
      .map(
        (vocab) => `
      <div class="bg-white p-2 rounded border">
        <div class="font-medium text-sm">${vocab.word}</div>
        <div class="text-xs text-gray-600">${vocab.meaning}</div>
      </div>
    `
      )
      .join("");
  }

  // 이해 문제 생성
  generateReadingQuestions(passage);
}

function generateReadingQuestions(passage) {
  const questionsContainer = document.getElementById("reading-questions");
  if (!questionsContainer) return;

  // 기본 독해 문제 생성 (향후 확장 가능)
  questionsContainer.innerHTML = `
    <div class="space-y-4">
      <div class="border rounded-lg p-3">
        <p class="text-sm font-medium mb-2">1. 이 지문의 주제는?</p>
        <div class="space-y-2">
          <label class="flex items-center">
            <input type="radio" name="reading-q1" value="a" class="mr-2">
            <span class="text-sm">주제 A</span>
          </label>
          <label class="flex items-center">
            <input type="radio" name="reading-q1" value="b" class="mr-2">
            <span class="text-sm">주제 B</span>
          </label>
        </div>
      </div>
    </div>
  `;
}

function initListeningComprehensionMode() {
  if (currentLearningData.listeningContent.length === 0) {
    showError("학습할 듣기 콘텐츠가 없습니다.");
    return;
  }

  displayListeningContent(
    currentLearningData.listeningContent[currentItemIndex]
  );
  updateProgress(
    "listening",
    currentItemIndex + 1,
    currentLearningData.listeningContent.length
  );
}

function displayListeningContent(content) {
  if (!content) return;

  document.getElementById("listening-category").textContent =
    content.category || "";
  document.getElementById("listening-question-text").textContent =
    content.question || "다음 오디오를 듣고 질문에 답하세요.";

  // 오디오 컨트롤 설정
  setupListeningControls(content);

  // 듣기 문제 생성
  generateListeningQuestions(content);
}

function setupListeningControls(content) {
  const playBtn = document.getElementById("play-listening");
  const pauseBtn = document.getElementById("pause-listening");
  const replayBtn = document.getElementById("replay-listening");

  // 실제 오디오 기능은 향후 구현
  if (playBtn) {
    playBtn.addEventListener("click", () => {
      console.log("오디오 재생 (구현 예정)");
    });
  }
}

function generateListeningQuestions(content) {
  const optionsContainer = document.getElementById("listening-options");
  if (!optionsContainer) return;

  // 기본 듣기 문제 생성
  optionsContainer.innerHTML = `
    <button class="listening-option w-full p-3 text-left border rounded-lg hover:bg-blue-50 transition">
      A. 옵션 1 (구현 예정)
    </button>
    <button class="listening-option w-full p-3 text-left border rounded-lg hover:bg-blue-50 transition">
      B. 옵션 2 (구현 예정)
    </button>
  `;
}

// ============ 새로운 이벤트 리스너들 ============

function setupNewLearningModeEvents() {
  // 발음 관련 이벤트
  const playPronunciation = document.getElementById("play-pronunciation");
  const recordPronunciation = document.getElementById("record-pronunciation");
  const prevPronunciation = document.getElementById("prev-pronunciation");
  const nextPronunciation = document.getElementById("next-pronunciation");

  if (playPronunciation) {
    playPronunciation.addEventListener("click", () => {
      console.log("발음 재생 (구현 예정)");
    });
  }

  if (recordPronunciation) {
    recordPronunciation.addEventListener("click", () => {
      console.log("발음 녹음 (구현 예정)");
    });
  }

  if (prevPronunciation) {
    prevPronunciation.addEventListener("click", () => {
      showPreviousItem("pronunciation");
    });
  }

  if (nextPronunciation) {
    nextPronunciation.addEventListener("click", () => {
      showNextItem("pronunciation");
    });
  }

  // 문장 완성 관련 이벤트
  const checkSentence = document.getElementById("check-sentence");
  const nextSentence = document.getElementById("next-sentence");
  const sentenceAnswer = document.getElementById("sentence-answer");

  if (checkSentence) {
    checkSentence.addEventListener("click", checkSentenceAnswer);
  }

  if (nextSentence) {
    nextSentence.addEventListener("click", () => {
      showNextItem("sentence-completion");
    });
  }

  if (sentenceAnswer) {
    sentenceAnswer.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        checkSentenceAnswer();
      }
    });
  }

  // 문법 관련 이벤트
  const prevGrammar = document.getElementById("prev-grammar");
  const nextGrammar = document.getElementById("next-grammar");

  if (prevGrammar) {
    prevGrammar.addEventListener("click", () => {
      showPreviousItem("grammar-learning");
    });
  }

  if (nextGrammar) {
    nextGrammar.addEventListener("click", () => {
      showNextItem("grammar-learning");
    });
  }

  // 퀴즈 관련 이벤트
  const prevQuiz = document.getElementById("prev-quiz");
  const nextQuiz = document.getElementById("next-quiz");

  if (prevQuiz) {
    prevQuiz.addEventListener("click", () => {
      showPreviousItem("multiple-choice");
    });
  }

  if (nextQuiz) {
    nextQuiz.addEventListener("click", () => {
      showNextItem("multiple-choice");
    });
  }
}

// ============ 공통 기능들 ============

function checkSentenceAnswer() {
  const answerInput = document.getElementById("sentence-answer");
  const resultDiv = document.getElementById("sentence-result");
  const nextBtn = document.getElementById("next-sentence");

  if (!answerInput || !resultDiv) return;

  const userAnswer = answerInput.value.trim();
  const correctAnswer = answerInput.dataset.correctAnswer;
  const isCorrect = userAnswer.toLowerCase() === correctAnswer.toLowerCase();

  // 결과 표시
  resultDiv.className = `mt-4 p-4 rounded ${
    isCorrect ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
  }`;
  resultDiv.textContent = isCorrect
    ? "정답입니다! 🎉"
    : `틀렸습니다. 정답: ${correctAnswer}`;
  resultDiv.classList.remove("hidden");

  // 통계 업데이트
  learningStats.totalAnswers++;
  if (isCorrect) {
    learningStats.correctAnswers++;
    learningStats.wordsLearned++;
  }
  updateLearningStats();

  // 다음 버튼 표시
  if (nextBtn) {
    nextBtn.classList.remove("hidden");
  }
}

function showNextItem(mode) {
  const dataArray = getCurrentDataArray();
  if (currentItemIndex < dataArray.length - 1) {
    currentItemIndex++;
    refreshCurrentMode();
  } else {
    alert("모든 학습을 완료했습니다!");
  }
}

function showPreviousItem(mode) {
  if (currentItemIndex > 0) {
    currentItemIndex--;
    refreshCurrentMode();
  }
}

function getCurrentDataArray() {
  switch (currentArea) {
    case "vocabulary":
      return currentLearningData.concepts;
    case "grammar":
      return currentLearningData.grammarPatterns;
    case "reading":
      return currentLearningData.readingPassages;
    case "listening":
      return currentLearningData.listeningContent;
    default:
      return [];
  }
}

function refreshCurrentMode() {
  if (currentMode) {
    initializeLearningMode(currentMode);
  }
}

function updateLearningStats() {
  // 학습 시간 계산
  const timeStudied = learningStats.startTime
    ? Math.floor((Date.now() - learningStats.startTime) / 60000)
    : 0;

  // 정답률 계산
  const accuracyRate =
    learningStats.totalAnswers > 0
      ? Math.round(
          (learningStats.correctAnswers / learningStats.totalAnswers) * 100
        )
      : 0;

  // UI 업데이트
  const wordsLearnedEl = document.getElementById("words-learned");
  const timeStudiedEl = document.getElementById("time-studied");
  const accuracyRateEl = document.getElementById("accuracy-rate");
  const streakDaysEl = document.getElementById("streak-days");

  if (wordsLearnedEl) wordsLearnedEl.textContent = learningStats.wordsLearned;
  if (timeStudiedEl) timeStudiedEl.textContent = `${timeStudied}분`;
  if (accuracyRateEl) accuracyRateEl.textContent = `${accuracyRate}%`;
  if (streakDaysEl) streakDaysEl.textContent = "1일"; // 연속 학습일은 추후 구현
}

// ============ 기본 데이터 (분리된 컬렉션이 없을 때) ============

function getDefaultGrammarPatterns() {
  return [
    {
      id: "default_present",
      pattern_name: "현재 시제 기본형",
      structural_pattern: "주어 + 동사 + 목적어",
      grammar_tags: ["present_tense", "basic_sentence"],
      difficulty: "beginner",
      domain: "daily",
      category: "grammar",
      example_translations: {
        korean: { text: "나는 사과를 먹어요." },
        english: { text: "I eat an apple." },
        japanese: { text: "私はりんごを食べます。" },
        chinese: { text: "我吃苹果。" },
      },
      teaching_notes: {
        primary_focus: "현재 시제의 기본 구조",
        practice_tips: ["단순 문장 연습", "시제 변환 연습"],
      },
    },
    {
      id: "default_past",
      pattern_name: "과거 시제",
      structural_pattern: "주어 + 과거동사 + 목적어",
      grammar_tags: ["past_tense", "completed_action"],
      difficulty: "beginner",
      domain: "daily",
      category: "grammar",
      example_translations: {
        korean: { text: "어제 영화를 봤어요." },
        english: { text: "I watched a movie yesterday." },
        japanese: { text: "昨日映画を見ました。" },
        chinese: { text: "昨天我看了电影。" },
      },
      teaching_notes: {
        primary_focus: "과거 시제 표현",
        practice_tips: ["일기 쓰기", "과거 경험 말하기"],
      },
    },
    {
      id: "default_question",
      pattern_name: "의문문",
      structural_pattern: "의문사 + 주어 + 동사?",
      grammar_tags: ["question", "interrogative"],
      difficulty: "beginner",
      domain: "daily",
      category: "grammar",
      example_translations: {
        korean: { text: "무엇을 하고 있어요?" },
        english: { text: "What are you doing?" },
        japanese: { text: "何をしていますか？" },
        chinese: { text: "你在做什么？" },
      },
      teaching_notes: {
        primary_focus: "질문 형태의 문장 구조",
        practice_tips: ["질문 만들기 연습", "대화 연습"],
      },
    },
  ];
}

function getDefaultReadingPassages() {
  return [
    {
      id: "default_reading_1",
      title: "자기소개",
      content:
        "안녕하세요. 저는 김민수입니다. 한국에서 왔습니다. 저는 학생입니다. 한국어를 공부하고 있습니다.",
      difficulty: "beginner",
      vocabulary: [
        {
          word: "안녕하세요",
          meaning: "hello",
          pronunciation: "an-nyeong-ha-se-yo",
        },
        { word: "학생", meaning: "student", pronunciation: "hak-saeng" },
        { word: "공부", meaning: "study", pronunciation: "gong-bu" },
      ],
      questions: [
        {
          question: "민수는 어디에서 왔습니까?",
          options: ["한국", "일본", "중국", "미국"],
          correct: 0,
        },
      ],
    },
    {
      id: "default_reading_2",
      title: "취미 이야기",
      content:
        "저의 취미는 음악을 듣는 것입니다. 특히 클래식 음악을 좋아합니다. 주말에는 친구들과 영화를 봅니다.",
      difficulty: "beginner",
      vocabulary: [
        { word: "취미", meaning: "hobby", pronunciation: "chwi-mi" },
        { word: "음악", meaning: "music", pronunciation: "eum-ak" },
        { word: "영화", meaning: "movie", pronunciation: "yeong-hwa" },
      ],
      questions: [
        {
          question: "어떤 음악을 좋아합니까?",
          options: ["팝", "클래식", "재즈", "록"],
          correct: 1,
        },
      ],
    },
  ];
}

function getDefaultListeningContent() {
  return [
    {
      id: "default_listening_1",
      title: "기본 인사",
      audioUrl: "",
      transcript: "안녕하세요. 만나서 반갑습니다.",
      difficulty: "beginner",
      questions: [
        {
          question: "들린 인사말은 무엇입니까?",
          options: ["안녕하세요", "안녕히 가세요", "고맙습니다", "죄송합니다"],
          correct: 0,
        },
      ],
    },
    {
      id: "default_listening_2",
      title: "숫자 듣기",
      audioUrl: "",
      transcript: "하나, 둘, 셋, 넷, 다섯",
      difficulty: "beginner",
      questions: [
        {
          question: "몇 개의 숫자를 들었습니까?",
          options: ["3개", "4개", "5개", "6개"],
          correct: 2,
        },
      ],
    },
  ];
}

// ============ 누락된 공통 함수들 ============

// 에러 메시지 표시
function showError(message) {
  console.error("Error:", message);

  // 기존 에러 메시지 제거
  const existingError = document.getElementById("error-message");
  if (existingError) {
    existingError.remove();
  }

  // 새 에러 메시지 생성
  const errorDiv = document.createElement("div");
  errorDiv.id = "error-message";
  errorDiv.className =
    "fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50";
  errorDiv.innerHTML = `
    <div class="flex items-center">
      <i class="fas fa-exclamation-triangle mr-2"></i>
      <span>${message}</span>
      <button class="ml-4 text-white hover:text-gray-200" onclick="this.parentElement.parentElement.remove()">
        <i class="fas fa-times"></i>
      </button>
    </div>
  `;

  document.body.appendChild(errorDiv);

  // 5초 후 자동 제거
  setTimeout(() => {
    if (errorDiv && errorDiv.parentNode) {
      errorDiv.remove();
    }
  }, 5000);
}

// 성공 메시지 표시
function showSuccess(message) {
  console.log("Success:", message);

  const successDiv = document.createElement("div");
  successDiv.className =
    "fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50";
  successDiv.innerHTML = `
    <div class="flex items-center">
      <i class="fas fa-check-circle mr-2"></i>
      <span>${message}</span>
      <button class="ml-4 text-white hover:text-gray-200" onclick="this.parentElement.parentElement.remove()">
        <i class="fas fa-times"></i>
      </button>
    </div>
  `;

  document.body.appendChild(successDiv);

  setTimeout(() => {
    if (successDiv && successDiv.parentNode) {
      successDiv.remove();
    }
  }, 3000);
}

// 진도 업데이트
function updateProgress(type, current, total) {
  const progressElement = document.getElementById(`${type}-progress`);
  if (progressElement) {
    progressElement.textContent = `${current}/${total}`;
  }
}

// 타이핑 통계 업데이트
function updateTypingStats() {
  const correctElement = document.getElementById("typing-correct");
  const wrongElement = document.getElementById("typing-wrong");

  if (correctElement) {
    const correctSpan =
      correctElement.querySelector("span:last-child") || correctElement;
    correctSpan.textContent = ` ${learningStats.correctAnswers}`;
  }

  if (wrongElement) {
    const wrongSpan =
      wrongElement.querySelector("span:last-child") || wrongElement;
    wrongSpan.textContent = ` ${
      learningStats.totalAnswers - learningStats.correctAnswers
    }`;
  }
}

// 카드 뒤집기 상태 초기화
function resetFlipCard() {
  const flipCard = document.querySelector(".flip-card");
  if (flipCard) {
    flipCard.classList.remove("flipped");
  }
}

// 모드 표시 (하위 호환성)
function showMode(mode) {
  hideAllLearningContainers();
  const container = document.getElementById(`${mode}-container`);
  if (container) {
    container.classList.remove("hidden");
  }
}

// ============ 기존 이벤트 리스너들 (하위 호환성) ============

function setupLegacyEventListeners() {
  // 플래시카드 이벤트
  const flipCardBtn = document.getElementById("flip-card");
  const prevCardBtn = document.getElementById("prev-card");
  const nextCardBtn = document.getElementById("next-card");

  if (flipCardBtn) {
    flipCardBtn.addEventListener("click", () => {
      const flipCard = document.querySelector(".flip-card");
      if (flipCard) {
        flipCard.classList.toggle("flipped");
      }
    });
  }

  if (prevCardBtn) {
    prevCardBtn.addEventListener("click", () => {
      if (currentItemIndex > 0) {
        currentItemIndex--;
        displayFlashcard(currentLearningData.concepts[currentItemIndex]);
        updateProgress(
          "flashcard",
          currentItemIndex + 1,
          currentLearningData.concepts.length
        );
      }
    });
  }

  if (nextCardBtn) {
    nextCardBtn.addEventListener("click", () => {
      if (currentItemIndex < currentLearningData.concepts.length - 1) {
        currentItemIndex++;
        displayFlashcard(currentLearningData.concepts[currentItemIndex]);
        updateProgress(
          "flashcard",
          currentItemIndex + 1,
          currentLearningData.concepts.length
        );
        resetFlipCard();
      }
    });
  }

  // 플래시카드 클릭으로 뒤집기
  const flipCardInner = document.querySelector(".flip-card-inner");
  if (flipCardInner) {
    flipCardInner.addEventListener("click", () => {
      const flipCard = document.querySelector(".flip-card");
      if (flipCard) {
        flipCard.classList.toggle("flipped");
      }
    });
  }

  // 타이핑 이벤트
  const checkAnswerBtn = document.getElementById("check-answer");
  const nextTypingBtn = document.getElementById("next-typing");
  const typingAnswer = document.getElementById("typing-answer");

  if (checkAnswerBtn) {
    checkAnswerBtn.addEventListener("click", checkTypingAnswer);
  }

  if (nextTypingBtn) {
    nextTypingBtn.addEventListener("click", () => {
      if (currentItemIndex < currentLearningData.concepts.length - 1) {
        currentItemIndex++;
        displayTypingQuestion(currentLearningData.concepts[currentItemIndex]);
        updateProgress(
          "typing",
          currentItemIndex + 1,
          currentLearningData.concepts.length
        );
      } else {
        showSuccess("모든 타이핑 학습을 완료했습니다!");
      }
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

// 타이핑 정답 확인
function checkTypingAnswer() {
  const answerInput = document.getElementById("typing-answer");
  const resultDiv = document.getElementById("typing-result");
  const nextBtn = document.getElementById("next-typing");

  if (!answerInput || !resultDiv) return;

  const userAnswer = answerInput.value.trim();
  const correctAnswer = answerInput.dataset.correctAnswer;
  const isCorrect = userAnswer.toLowerCase() === correctAnswer.toLowerCase();

  // 결과 표시
  resultDiv.className = `mt-4 p-4 rounded ${
    isCorrect ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
  }`;
  resultDiv.textContent = isCorrect
    ? "정답입니다! 🎉"
    : `틀렸습니다. 정답: ${correctAnswer}`;
  resultDiv.classList.remove("hidden");

  // 통계 업데이트
  learningStats.totalAnswers++;
  if (isCorrect) {
    learningStats.correctAnswers++;
    learningStats.wordsLearned++;
  }
  updateLearningStats();
  updateTypingStats();

  // 다음 버튼 표시
  if (nextBtn) {
    nextBtn.classList.remove("hidden");
  }

  // 정답인 경우 입력 필드 비활성화
  if (isCorrect) {
    answerInput.disabled = true;
  }
}

// 샘플 개념 데이터 생성 함수
function generateSampleConcepts() {
  return [
    {
      id: "sample_1",
      concept_info: {
        domain: "daily",
        category: "fruit",
        difficulty: "beginner",
      },
      expressions: {
        korean: {
          word: "사과",
          pronunciation: "sa-gwa",
          definition: "빨간 과일",
          part_of_speech: "명사",
        },
        english: {
          word: "apple",
          pronunciation: "/ˈæpəl/",
          definition: "a round fruit",
          part_of_speech: "noun",
        },
        japanese: {
          word: "りんご",
          pronunciation: "ringo",
          definition: "赤い果物",
          part_of_speech: "名詞",
        },
        chinese: {
          word: "苹果",
          pronunciation: "píngguǒ",
          definition: "红色水果",
          part_of_speech: "名词",
        },
      },
    },
    {
      id: "sample_2",
      concept_info: {
        domain: "daily",
        category: "greeting",
        difficulty: "beginner",
      },
      expressions: {
        korean: {
          word: "안녕하세요",
          pronunciation: "an-nyeong-ha-se-yo",
          definition: "정중한 인사말",
          part_of_speech: "감탄사",
        },
        english: {
          word: "hello",
          pronunciation: "/həˈloʊ/",
          definition: "a greeting",
          part_of_speech: "exclamation",
        },
        japanese: {
          word: "こんにちは",
          pronunciation: "konnichiwa",
          definition: "昼間の挨拶",
          part_of_speech: "感動詞",
        },
        chinese: {
          word: "你好",
          pronunciation: "nǐ hǎo",
          definition: "问候语",
          part_of_speech: "感叹词",
        },
      },
    },
    {
      id: "sample_3",
      concept_info: {
        domain: "daily",
        category: "food",
        difficulty: "beginner",
      },
      expressions: {
        korean: {
          word: "물",
          pronunciation: "mul",
          definition: "마시는 액체",
          part_of_speech: "명사",
        },
        english: {
          word: "water",
          pronunciation: "/ˈwɔːtər/",
          definition: "clear liquid",
          part_of_speech: "noun",
        },
        japanese: {
          word: "水",
          pronunciation: "mizu",
          definition: "透明な液体",
          part_of_speech: "名詞",
        },
        chinese: {
          word: "水",
          pronunciation: "shuǐ",
          definition: "透明液体",
          part_of_speech: "名词",
        },
      },
    },
  ];
}

// 분리된 업로드 모달 로드
async function loadBulkImportModal() {
  try {
    const response = await fetch("../components/bulk-import-modal.html");
    const modalHTML = await response.text();

    const container = document.getElementById("bulk-import-modal-container");
    if (container) {
      container.innerHTML = modalHTML;
    }

    // 모달 JavaScript 초기화
    const { initialize } = await import(
      "../components/js/bulk-import-modal.js"
    );
    initialize();

    console.log("분리된 업로드 모달 로드 완료");
  } catch (error) {
    console.error("업로드 모달 로드 실패:", error);
  }
}

// 업로드 모달 열기 (특정 탭으로)
function openBulkImportModal(tabName = "concepts") {
  const modal = document.getElementById("bulk-import-modal");
  if (modal) {
    modal.classList.remove("hidden");

    // 해당 탭 활성화
    const tabButton = document.getElementById(`${tabName}-tab`);
    if (tabButton) {
      tabButton.click();
    }
  } else {
    console.error("업로드 모달을 찾을 수 없습니다.");
  }
}

// 전역 함수로 설정
window.openBulkImportModal = openBulkImportModal;

// Firebase 초기화 실행
initializeFirebase();
