import { loadNavbar } from "../../components/js/navbar.js";
import {
  collection,
  query,
  getDocs,
  where,
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";
import {
  db,
  conceptUtils,
  mediaUtils,
  userProgressUtils,
} from "../../js/firebase/firebase-init.js";
import { getActiveLanguage } from "../../utils/language-utils.js";

// 게임에 필요한 전역 변수
let sourceLanguage = "korean";
let targetLanguage = "english";
let currentGame = null;
let gameWords = [];
let score = 0;
let timerInterval = null;
let memoryPairs = 0;
let canSelect = true;
let firstCard = null;
let secondCard = null;
let currentUser = null;
let gameResults = {
  totalGames: 0,
  totalScore: 0,
  gamesWon: 0,
  bestScore: 0,
  lastPlayed: null,
};

// 게임 상태 관리 변수 추가
let gameState = {
  isActive: false,
  score: 0,
  timeLeft: 0,
  startTime: null,
  endTime: null,
};

let currentGameType = null;
let gameDifficulty = "basic";

// 게임별 필요한 단어 수
const gameWordCount = {
  "word-matching": 8,
  "word-scramble": 10,
  "memory-game": 8,
};

// 기본 단어 세트 (Firebase 사용 불가능할 때 대체용)
const defaultWords = [
  {
    id: "word1",
    domain: "food",
    emoji: "🍎",
    languages: {
      korean: { word: "사과" },
      english: { word: "apple" },
      japanese: { word: "りんご" },
      chinese: { word: "苹果" },
    },
  },
  {
    id: "word2",
    domain: "food",
    emoji: "🍌",
    languages: {
      korean: { word: "바나나" },
      english: { word: "banana" },
      japanese: { word: "バナナ" },
      chinese: { word: "香蕉" },
    },
  },
  {
    id: "word3",
    domain: "animal",
    emoji: "🐱",
    languages: {
      korean: { word: "고양이" },
      english: { word: "cat" },
      japanese: { word: "猫" },
      chinese: { word: "猫" },
    },
  },
  {
    id: "word4",
    domain: "animal",
    emoji: "🐶",
    languages: {
      korean: { word: "개" },
      english: { word: "dog" },
      japanese: { word: "犬" },
      chinese: { word: "狗" },
    },
  },
  {
    id: "word5",
    domain: "nature",
    emoji: "💧",
    languages: {
      korean: { word: "물" },
      english: { word: "water" },
      japanese: { word: "水" },
      chinese: { word: "水" },
    },
  },
  {
    id: "word6",
    domain: "object",
    emoji: "📚",
    languages: {
      korean: { word: "책" },
      english: { word: "book" },
      japanese: { word: "本" },
      chinese: { word: "书" },
    },
  },
  {
    id: "word7",
    domain: "transport",
    emoji: "🚗",
    languages: {
      korean: { word: "차" },
      english: { word: "car" },
      japanese: { word: "車" },
      chinese: { word: "车" },
    },
  },
  {
    id: "word8",
    domain: "place",
    emoji: "🏠",
    languages: {
      korean: { word: "집" },
      english: { word: "house" },
      japanese: { word: "家" },
      chinese: { word: "家" },
    },
  },
  {
    id: "word9",
    domain: "nature",
    emoji: "☀️",
    languages: {
      korean: { word: "태양" },
      english: { word: "sun" },
      japanese: { word: "太陽" },
      chinese: { word: "太阳" },
    },
  },
  {
    id: "word10",
    domain: "nature",
    emoji: "🌙",
    languages: {
      korean: { word: "달" },
      english: { word: "moon" },
      japanese: { word: "月" },
      chinese: { word: "月亮" },
    },
  },
  {
    id: "word11",
    domain: "food",
    emoji: "🍞",
    languages: {
      korean: { word: "빵" },
      english: { word: "bread" },
      japanese: { word: "パン" },
      chinese: { word: "面包" },
    },
  },
  {
    id: "word12",
    domain: "body",
    emoji: "👁️",
    languages: {
      korean: { word: "눈" },
      english: { word: "eye" },
      japanese: { word: "目" },
      chinese: { word: "眼睛" },
    },
  },
  {
    id: "word13",
    domain: "nature",
    emoji: "🌳",
    languages: {
      korean: { word: "나무" },
      english: { word: "tree" },
      japanese: { word: "木" },
      chinese: { word: "树" },
    },
  },
  {
    id: "word14",
    domain: "color",
    emoji: "🔴",
    languages: {
      korean: { word: "빨강" },
      english: { word: "red" },
      japanese: { word: "赤" },
      chinese: { word: "红色" },
    },
  },
  {
    id: "word15",
    domain: "color",
    emoji: "🔵",
    languages: {
      korean: { word: "파랑" },
      english: { word: "blue" },
      japanese: { word: "青" },
      chinese: { word: "蓝色" },
    },
  },
  {
    id: "word16",
    domain: "food",
    emoji: "🍚",
    languages: {
      korean: { word: "밥" },
      english: { word: "rice" },
      japanese: { word: "ご飯" },
      chinese: { word: "米饭" },
    },
  },
];

// 언어 코드와 DB 언어 키 간 매핑
const languageMapping = {
  ko: "korean",
  en: "english",
  ja: "japanese",
  zh: "chinese",
};

// DB 언어 키와 UI 언어 코드 간 매핑 (역방향)
const reverseLanguageMapping = {
  korean: "ko",
  english: "en",
  japanese: "ja",
  chinese: "zh",
};

// 페이지 초기화
document.addEventListener("DOMContentLoaded", async () => {
  try {
    await loadNavbar();

    // 현재 사용자 정보 가져오기
    const { onAuthStateChanged } = await import(
      "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js"
    );
    const { auth } = await import("../../js/firebase/firebase-init.js");

    onAuthStateChanged(auth, (user) => {
      currentUser = user;
      console.log("현재 사용자:", currentUser?.email || "비로그인");
    });

    // 게임 컨테이너 확인 로그 추가
    console.log(
      "메모리 게임 컨테이너:",
      document.getElementById("memory-game")
    );
    console.log(
      "단어 맞추기 컨테이너:",
      document.getElementById("word-matching-game")
    );
    console.log(
      "단어 섞기 컨테이너:",
      document.getElementById("word-scramble-game")
    );

    // UI 언어 변경 이벤트 리스너 등록
    document.addEventListener("languageChanged", updateGameLabels);

    // 난이도 선택 이벤트 리스너
    const difficultySelect = document.getElementById("game-difficulty");
    if (difficultySelect) {
      difficultySelect.addEventListener("change", (e) => {
        gameDifficulty = e.target.value;
        console.log("게임 난이도 변경:", gameDifficulty);
        if (currentGame) loadGame(currentGame);
      });
    }

    // 언어 선택 이벤트 리스너
    document
      .getElementById("source-language")
      .addEventListener("change", (e) => {
        sourceLanguage = e.target.value;
        if (currentGame) loadGame(currentGame);
      });

    document
      .getElementById("target-language")
      .addEventListener("change", (e) => {
        targetLanguage = e.target.value;
        if (currentGame) loadGame(currentGame);
      });

    // 게임 카드 선택 이벤트 리스너
    document.querySelectorAll(".game-card").forEach((card) => {
      card.addEventListener("click", () => {
        const gameType = card.getAttribute("data-game");
        console.log(`게임 카드 클릭됨: ${gameType}`);

        // 이전 게임 타이머 정리
        if (timerInterval) {
          clearInterval(timerInterval);
          timerInterval = null;
        }

        // 활성 카드 스타일 변경
        document.querySelectorAll(".game-card").forEach((c) => {
          c.classList.remove("active");
        });
        card.classList.add("active");

        // 게임 로드에 정확한 게임 타입 문자열 전달 확인
        if (gameType === "memory-game") {
          // 메모리 게임 컨테이너 미리 확인
          const memoryGameContainer = document.getElementById("memory-game");
          console.log(
            "메모리 게임 컨테이너 확인 (클릭 시):",
            memoryGameContainer
          );
          if (!memoryGameContainer) {
            console.error("메모리 게임 컨테이너가 없습니다!");
            return;
          }
        }

        // 게임 로드
        loadGame(gameType);
      });
    });

    // 게임 재시작 버튼 이벤트 리스너
    document
      .getElementById("restart-matching")
      ?.addEventListener("click", () => restartGame("word-matching"));
    document
      .getElementById("restart-scramble")
      ?.addEventListener("click", () => restartGame("word-scramble"));
    document
      .getElementById("restart-memory")
      ?.addEventListener("click", () => restartGame("memory-game"));

    // 단어 섞기 게임 확인 버튼
    document
      .getElementById("check-scramble")
      ?.addEventListener("click", checkScrambleAnswer);

    // 자동으로 첫 번째 게임 카드 클릭 (기본 게임 표시)
    setTimeout(() => {
      const firstGameCard = document.querySelector(
        ".game-card[data-game='word-matching']"
      );
      if (firstGameCard) {
        firstGameCard.click();
      }
    }, 500);
  } catch (error) {
    console.error("페이지 초기화 중 오류 발생:", error);
  }
});

// 게임 레이블 업데이트 함수
async function updateGameLabels() {
  // 게임 UI의 레이블을 현재 언어로 업데이트
  const activeLanguage = await getActiveLanguage();
  // 필요한 경우 여기에 번역 로직 추가
}

// 게임 로드 함수
async function loadGame(gameType) {
  try {
    console.log("게임 로드 시작:", gameType);

    // 현재 게임 타입 설정
    currentGameType = gameType;

    // 게임 상태 초기화
    gameState = {
      isActive: true,
      score: 0,
      timeLeft: 60, // 기본 1분
      startTime: new Date(),
      endTime: null,
    };

    // 모든 게임 컨테이너 숨기기
    document.querySelectorAll(".game-container").forEach((container) => {
      container.style.display = "none";
    });

    // 선택한 게임 컨테이너 표시
    const gameContainer = document.getElementById(`${gameType}-game`);
    if (gameContainer) {
      gameContainer.style.display = "block";
    }

    // 게임용 단어 로드
    await loadGameWords();

    // 게임별 초기화
    switch (gameType) {
      case "word-matching":
        initWordMatchingGame();
        break;
      case "word-scramble":
        initWordScrambleGame();
        break;
      case "memory-game":
        initMemoryGame();
        break;
    }

    console.log(`${gameType} 게임 초기화 완료`);
  } catch (error) {
    console.error("게임 로드 중 오류:", error);
  }
}

// 게임 단어 로드 함수 (새로운 구조 활용)
async function loadGameWords() {
  try {
    const gameTypeMap = {
      "word-matching": "matching",
      "word-scramble": "spelling",
      "memory-game": "memory",
    };

    const gameType = gameTypeMap[currentGameType] || "matching";
    const languages = [sourceLanguage, targetLanguage];
    const limit = gameWordCount[currentGameType] || 8;

    try {
      const concepts = await conceptUtils.getConceptsForGame(
        "matching", // gameType은 항상 matching으로 통일
        gameDifficulty,
        [sourceLanguage, targetLanguage],
        limit
      );

      console.log(`Firebase에서 ${concepts.length}개 개념 로딩 완료`);

      // Firebase에서 가져온 개념이 1개 이상이면 사용 (최소 요구사항 완화)
      if (concepts.length >= 1) {
        const firebaseWords = concepts.slice(0, limit).map((concept) => ({
          id: concept.id,
          source: concept.expressions?.[sourceLanguage]?.word || "",
          target: concept.expressions?.[targetLanguage]?.word || "",
          domain: concept.conceptInfo?.domain || "general",
          category: concept.conceptInfo?.category || "",
          difficulty: concept.conceptInfo?.difficulty || "basic",
          isFromFirebase: true,
        }));

        // Firebase 개념 수가 부족하면 기본 단어로 보완
        if (firebaseWords.length < limit) {
          const additionalDefaultWords = getDefaultWordsForGame(
            limit - firebaseWords.length
          );
          gameWords = [...firebaseWords, ...additionalDefaultWords];
        } else {
          gameWords = firebaseWords;
        }

        console.log(
          `게임 단어 로딩 완료: ${gameWords.length}개 (Firebase: ${firebaseWords.length}개)`
        );
        return;
      }

      // 충분한 개념이 없으면 난이도 제한 없이 다시 시도
      const conceptsWithoutDifficulty = await conceptUtils.getConceptsForGame(
        "matching",
        null, // 난이도 제한 없음
        [sourceLanguage, targetLanguage],
        limit
      );

      if (conceptsWithoutDifficulty.length >= 1) {
        const firebaseWords = conceptsWithoutDifficulty
          .slice(0, limit)
          .map((concept) => ({
            id: concept.id,
            source: concept.expressions?.[sourceLanguage]?.word || "",
            target: concept.expressions?.[targetLanguage]?.word || "",
            domain: concept.conceptInfo?.domain || "general",
            category: concept.conceptInfo?.category || "",
            difficulty: concept.conceptInfo?.difficulty || "basic",
            isFromFirebase: true,
          }));

        // Firebase 개념 수가 부족하면 기본 단어로 보완
        if (firebaseWords.length < limit) {
          const additionalDefaultWords = getDefaultWordsForGame(
            limit - firebaseWords.length
          );
          gameWords = [...firebaseWords, ...additionalDefaultWords];
        } else {
          gameWords = firebaseWords;
        }

        console.log(
          `게임 단어 로딩 완료: ${gameWords.length}개 (Firebase: ${firebaseWords.length}개)`
        );
        return;
      }
    } catch (error) {
      console.error("Firebase 개념 로드 오류:", error);
    }

    // Firebase에서 개념을 전혀 가져오지 못한 경우만 기본 단어 세트 사용
    console.log("기본 단어 세트를 사용합니다.");
    return useDefaultWords();
  } catch (error) {
    console.error("단어 로드 중 오류 발생:", error);
    console.log("오류가 발생하여 기본 단어 세트를 사용합니다.");
    return useDefaultWords();
  }
}

// 기본 단어 세트 사용 함수
function useDefaultWords() {
  const defaultWordsMapped = defaultWords.map((word) => ({
    id: word.id,
    source: word.languages[sourceLanguage]?.word || "",
    target: word.languages[targetLanguage]?.word || "",
    domain: word.domain || "",
    category: "",
    emoji: word.emoji || "",
    difficulty: "basic",
    media: { images: {}, audio: {} },
    pronunciation: { source: "", target: "" },
    gameData: {},
    learningMeta: {},
    isFromFirebase: false,
  }));

  const shuffledWords = defaultWordsMapped
    .filter((word) => word.source && word.target) // 유효한 단어만 필터링
    .sort(() => 0.5 - Math.random());

  gameWords = shuffledWords.slice(0, gameWordCount[currentGameType] || 8);
  console.log("기본 단어 목록:", gameWords);
  return gameWords;
}

// 필요한 수만큼 기본 단어 가져오기 (Firebase 보완용)
function getDefaultWordsForGame(neededCount) {
  const defaultWordsMapped = defaultWords.map((word) => ({
    id: word.id,
    source: word.languages[sourceLanguage]?.word || "",
    target: word.languages[targetLanguage]?.word || "",
    domain: word.domain || "",
    category: "",
    emoji: word.emoji || "",
    difficulty: "basic",
    media: { images: {}, audio: {} },
    pronunciation: { source: "", target: "" },
    gameData: {},
    learningMeta: {},
    isFromFirebase: false,
  }));

  const validWords = defaultWordsMapped
    .filter((word) => word.source && word.target) // 유효한 단어만 필터링
    .sort(() => 0.5 - Math.random());

  return validWords.slice(0, neededCount);
}

// 게임 재시작 함수
function restartGame(gameType) {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }

  loadGame(gameType);
}

// 타이머 시작 함수
function startTimer(elementId, duration, onComplete) {
  let timeLeft = duration;

  // 타이머 요소 찾기
  let timerElement = document.getElementById(elementId);

  // ID로 못 찾은 경우 현재 활성화된 게임 컨테이너 내에서 찾기
  if (!timerElement) {
    const gameContainer = document.querySelector(
      '.game-container[style*="display: block"]'
    );
    if (gameContainer) {
      timerElement = gameContainer.querySelector(`#${elementId}`);
    }
  }

  if (!timerElement) {
    console.error(`타이머 요소를 찾을 수 없습니다: ${elementId}`);
    return;
  }

  if (timerInterval) {
    clearInterval(timerInterval);
  }

  timerElement.textContent = timeLeft;

  timerInterval = setInterval(() => {
    timeLeft--;
    timerElement.textContent = timeLeft;

    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      if (onComplete) onComplete();
    }
  }, 1000);
}

// 게임 완료 처리 함수 (개선된 버전)
async function completeGame(finalScore, timeSpent) {
  try {
    gameState.isGameActive = false;
    gameState.endTime = Date.now();

    const totalTime = Math.round(
      (gameState.endTime - gameState.startTime) / 1000
    );
    const accuracy = Math.round((finalScore / gameState.maxScore) * 100);

    // 사용자 게임 통계 업데이트 (분리된 컬렉션 연동)
    if (currentUser) {
      // 게임 통계 업데이트
      await userProgressUtils.updateGameStats(
        currentUser.email,
        targetLanguage,
        currentGameType,
        accuracy,
        totalTime
      );

      // 학습한 개념들의 진도 업데이트 (분리된 컬렉션 지원)
      let updatedConceptsCount = 0;
      if (gameWords && gameWords.length > 0) {
        for (const conceptData of gameWords) {
          try {
            // Firebase에서 가져온 개념만 진도 업데이트 (기본 단어 제외)
            if (!conceptData.isFromFirebase) {
              console.log(`기본 단어 ${conceptData.id} 진도 업데이트 건너뜀`);
              continue;
            }

            // 개념 ID 정확히 추출
            const conceptId =
              conceptData.id || conceptData._id || conceptData.concept_id;

            if (conceptId) {
              // 어휘 진도 업데이트 (게임 성과 반영)
              const masteryStatus =
                accuracy >= 80 ? "known" : accuracy >= 60 ? "learning" : "weak";

              await userProgressUtils.updateVocabularyProgress(
                currentUser.email,
                targetLanguage,
                conceptId,
                masteryStatus,
                {
                  game_accuracy: accuracy,
                  game_type: currentGameType,
                  last_game_score: finalScore,
                  time_spent: totalTime,
                  source: "game_completion",
                }
              );

              updatedConceptsCount++;
              console.log(`✓ 개념 ${conceptId}의 게임 진도 업데이트 완료`);
            }
          } catch (error) {
            console.warn("개념 진도 업데이트 중 오류:", error);
          }
        }
      }

      console.log("게임 완료 및 진도 업데이트 완료:", {
        gameType: currentGameType,
        accuracy: accuracy,
        totalTime: totalTime,
        conceptsUpdated: updatedConceptsCount,
        totalWords: gameWords?.length || 0,
      });

      // 게임 결과 표시
      showGameResults({
        gameType: currentGameType,
        difficulty: gameState.difficulty,
        finalScore: finalScore,
        totalTime: totalTime,
        accuracy: accuracy,
        concepts: updatedConceptsCount,
        totalWords: gameWords?.length || 0,
        completionReason:
          typeof finalScore === "string" && finalScore.includes("시간")
            ? "timeout"
            : "finished",
      });
    }
  } catch (error) {
    console.error("게임 완료 처리 중 오류:", error);

    // 오류가 발생해도 결과는 표시
    showGameResults({
      gameType: currentGameType,
      difficulty: gameState.difficulty,
      finalScore: finalScore,
      totalTime: timeSpent || 0,
      accuracy: Math.round((finalScore / gameState.maxScore) * 100),
      concepts: 0, // 오류 발생 시 0개로 표시
      totalWords: gameWords?.length || 0,
      error: "진도 업데이트 중 일부 오류가 발생했습니다.",
      completionReason:
        typeof finalScore === "string" && finalScore.includes("시간")
          ? "timeout"
          : "error",
    });
  }
}

// 게임 결과 표시 (개선된 버전)
function showGameResults(results) {
  // 게임 컨테이너 숨기기
  const gameContainers = document.querySelectorAll(".game-container");
  gameContainers.forEach((container) => {
    container.style.display = "none";
  });

  // 게임 결과 표시
  const resultsElement = document.getElementById("game-results");
  if (resultsElement) {
    resultsElement.style.display = "block";
  }

  // 기본 결과 정보
  const finalScoreElement = document.getElementById("final-score");
  const maxScoreElement = document.getElementById("max-score");
  const accuracyElement = document.getElementById("accuracy-percentage");
  const timeElement = document.getElementById("time-spent");

  if (finalScoreElement) finalScoreElement.textContent = results.finalScore;
  if (maxScoreElement) maxScoreElement.textContent = results.maxScore || "100";
  if (accuracyElement)
    accuracyElement.textContent = `${results.accuracy || 0}%`;
  if (timeElement) timeElement.textContent = `${results.totalTime}초`;

  // 성과 메시지
  let message = "";
  let messageClass = "";

  if (results.completionReason === "timeout") {
    message = "⏰ 시간이 종료되었습니다! 다시 도전해보세요!";
    messageClass = "text-orange-600";
  } else if ((results.accuracy || 0) >= 90) {
    message = "🎉 완벽해요! 훌륭한 실력입니다!";
    messageClass = "text-green-600";
  } else if ((results.accuracy || 0) >= 80) {
    message = "👏 잘했어요! 좋은 성과입니다!";
    messageClass = "text-blue-600";
  } else if ((results.accuracy || 0) >= 70) {
    message = "👍 괜찮아요! 조금 더 연습해보세요!";
    messageClass = "text-yellow-600";
  } else {
    message = "💪 더 열심히! 다시 도전해보세요!";
    messageClass = "text-red-600";
  }

  const achievementElement = document.getElementById("achievement-message");
  if (achievementElement) {
    achievementElement.textContent = message;
    achievementElement.className = `text-lg font-semibold ${messageClass}`;
  }

  // 상세 통계 표시
  const statsContainer = document.getElementById("detailed-stats");
  if (statsContainer) {
    // 완료 상태 메시지
    let completionStatusHtml = "";
    if (results.completionReason === "timeout") {
      completionStatusHtml = `
        <div class="bg-orange-50 p-3 rounded-lg border border-orange-200">
          <div class="text-sm text-gray-600">게임 상태</div>
          <div class="font-semibold text-orange-600">⏰ 시간 초과</div>
        </div>
      `;
    } else if (results.completionReason === "finished") {
      completionStatusHtml = `
        <div class="bg-green-50 p-3 rounded-lg border border-green-200">
          <div class="text-sm text-gray-600">게임 상태</div>
          <div class="font-semibold text-green-600">✅ 성공적으로 완료</div>
        </div>
      `;
    } else {
      completionStatusHtml = `
        <div class="bg-blue-50 p-3 rounded-lg">
          <div class="text-sm text-gray-600">게임 상태</div>
          <div class="font-semibold text-blue-600">게임 완료</div>
        </div>
      `;
    }

    statsContainer.innerHTML = `
      <div class="grid grid-cols-2 gap-4 mt-4">
        <div class="bg-blue-50 p-3 rounded-lg">
          <div class="text-sm text-gray-600">게임 타입</div>
          <div class="font-semibold">${getGameTypeName(results.gameType)}</div>
        </div>
        <div class="bg-green-50 p-3 rounded-lg">
          <div class="text-sm text-gray-600">난이도</div>
          <div class="font-semibold">${getDifficultyName(
            results.difficulty
          )}</div>
        </div>
        <div class="bg-purple-50 p-3 rounded-lg">
          <div class="text-sm text-gray-600">학습한 개념</div>
          <div class="font-semibold">${results.concepts}개</div>
        </div>
        <div class="bg-orange-50 p-3 rounded-lg">
          <div class="text-sm text-gray-600">총 단어 수</div>
          <div class="font-semibold">${
            results.totalWords || results.concepts
          }개</div>
        </div>
        <div class="bg-indigo-50 p-3 rounded-lg">
          <div class="text-sm text-gray-600">진도 업데이트</div>
          <div class="font-semibold text-green-600">${
            results.concepts > 0 ? "✓ 완료" : "- 없음"
          }</div>
        </div>
        <div class="bg-teal-50 p-3 rounded-lg">
          <div class="text-sm text-gray-600">데이터 소스</div>
          <div class="font-semibold">Firebase + 기본</div>
        </div>
      </div>

      <div class="mt-4">
        ${completionStatusHtml}
      </div>
      
      ${
        results.error
          ? `
        <div class="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div class="text-red-600 text-sm">${results.error}</div>
        </div>
      `
          : `
        <div class="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div class="text-green-600 text-sm">✓ 학습 진도가 성공적으로 업데이트되었습니다.</div>
        </div>
      `
      }
    `;
  }

  // 추천 사항
  const recommendationElement = document.getElementById("game-recommendations");
  if (recommendationElement) {
    let recommendations = [];

    if ((results.accuracy || 0) < 70) {
      recommendations.push("• 같은 난이도로 다시 도전해보세요");
      recommendations.push("• 단어장에서 취약한 개념들을 복습하세요");
    } else if ((results.accuracy || 0) >= 90) {
      recommendations.push("• 더 높은 난이도에 도전해보세요");
      recommendations.push("• 다른 게임 타입을 시도해보세요");
    } else {
      recommendations.push("• 꾸준히 연습하여 90% 이상을 목표로 하세요");
      recommendations.push("• 퀴즈 모드로 추가 학습을 해보세요");
    }

    recommendationElement.innerHTML = `
      <h4 class="font-semibold mb-2">추천 사항</h4>
      <div class="text-sm text-gray-600">
        ${recommendations.join("<br>")}
      </div>
    `;
  }
}

// 게임 타입 이름 변환
function getGameTypeName(gameType) {
  const names = {
    memory: "메모리 게임",
    pronunciation: "발음 게임",
    spelling: "철자 게임",
    matching: "매칭 게임",
  };
  return names[gameType] || gameType;
}

// 난이도 이름 변환
function getDifficultyName(difficulty) {
  const names = {
    beginner: "초급",
    intermediate: "중급",
    advanced: "고급",
  };
  return names[difficulty] || difficulty;
}

// ======== 단어 맞추기 게임 함수 ========

// 단어 맞추기 게임 초기화
function initWordMatchingGame() {
  const sourceWordsContainer = document.querySelector(".source-words");
  const targetWordsContainer = document.querySelector(".target-words");

  sourceWordsContainer.innerHTML = "";
  targetWordsContainer.innerHTML = "";

  document.getElementById("matching-score").textContent = "0";
  score = 0;

  // 단어 카드 생성
  const targetWordsCopy = [...gameWords].sort(() => 0.5 - Math.random());

  gameWords.forEach((word, index) => {
    // 원본 단어 카드
    const sourceCard = createWordCard(word.source, index, "source");
    sourceWordsContainer.appendChild(sourceCard);

    // 대상 단어 카드
    const targetIndex = targetWordsCopy.findIndex((w) => w.id === word.id);
    const targetCard = createWordCard(
      targetWordsCopy[targetIndex].target,
      targetIndex,
      "target"
    );
    targetWordsContainer.appendChild(targetCard);
  });

  // 드래그 앤 드롭 설정
  setupDragAndDrop();

  // 타이머 시작
  startTimer("matching-timer", 60, () => {
    completeGame(`시간이 종료되었습니다! 최종 점수: ${score}점`);
  });
}

// 단어 카드 생성 함수
function createWordCard(word, index, type) {
  const card = document.createElement("div");
  card.className =
    "bg-[#F3E5F5] p-4 rounded-lg shadow-md text-center cursor-move";
  card.setAttribute("draggable", "true");
  card.setAttribute("data-index", index);
  card.setAttribute("data-type", type);
  card.textContent = word;

  // 드래그 이벤트
  card.addEventListener("dragstart", (e) => {
    e.dataTransfer.setData(
      "text/plain",
      JSON.stringify({
        index: index,
        type: type,
      })
    );
    // 드래그 효과 설정
    e.dataTransfer.effectAllowed = "move";
    setTimeout(() => {
      card.classList.add("opacity-50");
    }, 0);
  });

  card.addEventListener("dragend", () => {
    card.classList.remove("opacity-50");
  });

  // 모바일 터치 이벤트 (터치할 때 효과 표시)
  card.addEventListener("touchstart", () => {
    card.classList.add("bg-[#E1BEE7]");
  });

  card.addEventListener("touchend", () => {
    card.classList.remove("bg-[#E1BEE7]");
  });

  // 클릭 이벤트 추가 (모바일에서 드래그 대체용)
  card.addEventListener("click", () => {
    // 이미 선택된 카드가 있는지 확인
    const selectedCard = document.querySelector(".selected-card");

    if (selectedCard) {
      // 이미 선택된 카드가 있다면, 현재 카드와 매칭 시도
      const selectedType = selectedCard.getAttribute("data-type");
      const selectedIndex = parseInt(selectedCard.getAttribute("data-index"));

      // 같은 유형의 카드면 무시
      if (type === selectedType) {
        selectedCard.classList.remove("selected-card", "bg-[#E1BEE7]");
        return;
      }

      // 매칭 확인 (소스 카드가 선택되었다면 현재는 타겟, 그 반대도 마찬가지)
      if (type === "source") {
        checkWordMatch(index, selectedIndex);
      } else {
        checkWordMatch(selectedIndex, index);
      }

      // 선택 상태 해제
      selectedCard.classList.remove("selected-card", "bg-[#E1BEE7]");
    } else {
      // 카드 선택 표시
      card.classList.add("selected-card", "bg-[#E1BEE7]");
    }
  });

  return card;
}

// 드래그 앤 드롭 설정
function setupDragAndDrop() {
  const cards = document.querySelectorAll(
    ".source-words > div, .target-words > div"
  );

  cards.forEach((card) => {
    // 드롭 영역에 들어왔을 때
    card.addEventListener("dragover", (e) => {
      e.preventDefault();
      e.stopPropagation();
      card.classList.add("bg-[#E1BEE7]");
    });

    // 드롭 영역에서 나갔을 때
    card.addEventListener("dragleave", () => {
      card.classList.remove("bg-[#E1BEE7]");
    });

    // 드래그 시작시 데이터 설정 강화
    card.addEventListener("dragstart", (e) => {
      const index = card.getAttribute("data-index");
      const type = card.getAttribute("data-type");
      e.dataTransfer.setData(
        "text/plain",
        JSON.stringify({
          index: index,
          type: type,
        })
      );
      e.dataTransfer.effectAllowed = "move";
    });

    // 드롭 이벤트
    card.addEventListener("drop", (e) => {
      e.preventDefault();
      e.stopPropagation();
      card.classList.remove("bg-[#E1BEE7]");

      try {
        const dragData = JSON.parse(e.dataTransfer.getData("text/plain"));
        const dropType = card.getAttribute("data-type");
        const dropIndex = parseInt(card.getAttribute("data-index"));

        // 같은 유형의 카드면 무시
        if (dragData.type === dropType) return;

        // 매칭 확인
        checkWordMatch(dragData.index, dropIndex);
      } catch (err) {
        console.error("드롭 처리 중 오류:", err);
      }
    });
  });
}

// 단어 매칭 확인
function checkWordMatch(sourceIndex, targetIndex) {
  const sourceWord = gameWords[sourceIndex];
  const targetWord = gameWords.find((_, i) => {
    const targetCard = document.querySelector(
      `.target-words > div[data-index="${targetIndex}"]`
    );
    return targetCard.textContent === sourceWord.target;
  });

  if (targetWord) {
    // 매칭 성공
    const sourceCard = document.querySelector(
      `.source-words > div[data-index="${sourceIndex}"]`
    );
    const targetCard = document.querySelector(
      `.target-words > div[data-index="${targetIndex}"]`
    );

    sourceCard.classList.remove("bg-[#F3E5F5]");
    targetCard.classList.remove("bg-[#F3E5F5]");
    sourceCard.classList.add("bg-[#C8E6C9]", "text-[#2E7D32]");
    targetCard.classList.add("bg-[#C8E6C9]", "text-[#2E7D32]");

    sourceCard.setAttribute("draggable", "false");
    targetCard.setAttribute("draggable", "false");

    score += 10;
    document.getElementById("matching-score").textContent = score;

    // 모든 단어 매칭 완료 확인
    const remainingCards = document.querySelectorAll(
      ".source-words > div[draggable='true']"
    );
    if (remainingCards.length === 0) {
      completeGame(`축하합니다! 모든 단어를 매칭했습니다! 점수: ${score}점`);
    }
  } else {
    // 매칭 실패
    score = Math.max(0, score - 2);
    document.getElementById("matching-score").textContent = score;

    // 잠시 색상 변경으로 피드백
    const sourceCard = document.querySelector(
      `.source-words > div[data-index="${sourceIndex}"]`
    );
    const targetCard = document.querySelector(
      `.target-words > div[data-index="${targetIndex}"]`
    );

    sourceCard.classList.add("bg-[#FFCDD2]");
    targetCard.classList.add("bg-[#FFCDD2]");

    setTimeout(() => {
      sourceCard.classList.remove("bg-[#FFCDD2]");
      targetCard.classList.remove("bg-[#FFCDD2]");
      sourceCard.classList.add("bg-[#F3E5F5]");
      targetCard.classList.add("bg-[#F3E5F5]");
    }, 800);
  }
}

// ======== 단어 섞기 게임 함수 ========

// 단어 섞기 게임 초기화
function initWordScrambleGame() {
  document.getElementById("scramble-score").textContent = "0";
  score = 0;

  showNextScrambleWord();

  // 타이머 시작
  startTimer("scramble-timer", 60, () => {
    completeGame(`시간이 종료되었습니다! 최종 점수: ${score}점`);
  });
}

// 특수 문자 처리 함수 (한중일 문자 고려)
function tokenizeForScramble(word) {
  // 한중일 문자 각각을 하나의 토큰으로 처리
  const tokens = [];
  const regex =
    /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uac00-\ud7af]/;

  for (let i = 0; i < word.length; i++) {
    if (regex.test(word[i])) {
      // 한중일 문자는 각각을 개별 토큰으로 처리
      tokens.push(word[i]);
    } else {
      // 다른 문자는 그대로 처리
      tokens.push(word[i]);
    }
  }

  return tokens;
}

// 다음 섞인 단어 표시
function showNextScrambleWord() {
  if (gameWords.length === 0) {
    completeGame(`축하합니다! 모든 단어를 완성했습니다! 점수: ${score}점`);
    return;
  }

  // 다음 단어 가져오기
  const randomIndex = Math.floor(Math.random() * gameWords.length);
  const currentWord = gameWords[randomIndex];
  gameWords.splice(randomIndex, 1);

  // 단어 힌트 표시 (원본 언어 단어)
  document.getElementById("scramble-hint").textContent = currentWord.source;

  // 단어를 토큰으로 분리하고 섞기
  const targetWordTokens = tokenizeForScramble(currentWord.target);
  const scrambledTokens = [...targetWordTokens].sort(() => 0.5 - Math.random());

  // 컨테이너 초기화
  const scrambleContainer = document.getElementById("scramble-container");
  const answerContainer = document.getElementById("scramble-answer");
  scrambleContainer.innerHTML = "";
  answerContainer.innerHTML = "";

  // 드래그 가능한 글자 요소 생성
  scrambledTokens.forEach((token, index) => {
    const tokenElement = document.createElement("div");
    tokenElement.className =
      "drag-item bg-[#F3E5F5] text-[#9C27B0] px-4 py-2 rounded-lg text-xl font-medium";
    tokenElement.setAttribute("draggable", "true");
    tokenElement.setAttribute("data-char", token);
    tokenElement.setAttribute("data-index", index);
    tokenElement.textContent = token;

    // 드래그 시작 이벤트
    tokenElement.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("text/plain", index.toString());
      setTimeout(() => {
        tokenElement.classList.add("opacity-50");
      }, 0);
    });

    // 드래그 종료 이벤트
    tokenElement.addEventListener("dragend", () => {
      tokenElement.classList.remove("opacity-50");
    });

    // 클릭 이벤트 추가 (모바일 지원)
    tokenElement.addEventListener("click", () => {
      // 토큰을 답변 컨테이너로 이동
      answerContainer.appendChild(tokenElement);
      tokenElement.classList.remove("bg-[#F3E5F5]");
      tokenElement.classList.add("bg-[#E1BEE7]");

      // 모든 글자가 드롭 영역으로 이동했는지 확인
      const remainingChars = document.querySelectorAll(
        "#scramble-container .drag-item"
      );
      if (remainingChars.length === 0) {
        // 자동으로 정답 확인
        checkScrambleAnswer();
      }
    });

    scrambleContainer.appendChild(tokenElement);
  });

  // 드롭 영역 설정
  setupScrambleDropZone(answerContainer, targetWordTokens.join(""));

  // 답변 컨테이너 클릭 시 이벤트 추가 (모바일에서 다시 이동)
  answerContainer.addEventListener("click", (e) => {
    if (e.target !== answerContainer) {
      // 클릭된 토큰이 답변 컨테이너 내의 토큰이면
      const tokenElement = e.target.closest(".drag-item");
      if (tokenElement) {
        // 다시 원래 컨테이너로 이동
        scrambleContainer.appendChild(tokenElement);
        tokenElement.classList.remove("bg-[#E1BEE7]");
        tokenElement.classList.add("bg-[#F3E5F5]");
      }
    }
  });
}

// 섞기 게임 드롭 영역 설정
function setupScrambleDropZone(dropZone, correctWord) {
  // 드래그 오버 이벤트
  dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropZone.classList.add("hover");
  });

  // 드래그 떠남 이벤트
  dropZone.addEventListener("dragleave", () => {
    dropZone.classList.remove("hover");
  });

  // 드롭 이벤트
  dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropZone.classList.remove("hover");

    // 드래그 된 요소 가져오기
    const charIndex = e.dataTransfer.getData("text/plain");
    const charElement = document.querySelector(
      `#scramble-container .drag-item[data-index="${charIndex}"]`
    );

    if (charElement) {
      // 글자 요소를 드롭 영역으로 이동
      dropZone.appendChild(charElement);
      charElement.classList.remove("bg-[#F3E5F5]");
      charElement.classList.add("bg-[#E1BEE7]");

      // 모든 글자가 드롭 영역으로 이동했는지 확인
      const remainingChars = document.querySelectorAll(
        "#scramble-container .drag-item"
      );
      if (remainingChars.length === 0) {
        // 자동으로 정답 확인
        checkScrambleAnswer();
      }
    }
  });

  // 정답 확인 버튼 이벤트
  document.getElementById("check-scramble").addEventListener("click", () => {
    checkScrambleAnswer();
  });

  // dropZone 속성에 정답 저장
  dropZone.setAttribute("data-correct-word", correctWord);
}

// 스크램블 게임 정답 확인
function checkScrambleAnswer() {
  const answerContainer = document.getElementById("scramble-answer");
  const correctWord = answerContainer.getAttribute("data-correct-word");

  // 제출한 답안 구성
  const charElements = answerContainer.querySelectorAll(".drag-item");
  const userAnswer = Array.from(charElements)
    .map((el) => el.getAttribute("data-char"))
    .join("");

  if (userAnswer === correctWord) {
    // 정답
    charElements.forEach((el) => {
      el.classList.remove("bg-[#E1BEE7]");
      el.classList.add("bg-[#C8E6C9]", "text-[#2E7D32]");
    });

    score += 10;
    document.getElementById("scramble-score").textContent = score;

    setTimeout(() => {
      showNextScrambleWord();
    }, 1000);
  } else {
    // 오답
    charElements.forEach((el) => {
      el.classList.remove("bg-[#E1BEE7]");
      el.classList.add("bg-[#FFCDD2]", "text-[#D32F2F]");
    });

    score = Math.max(0, score - 2);
    document.getElementById("scramble-score").textContent = score;

    setTimeout(() => {
      // 카드 다시 뒤집기
      [charElements[0], charElements[1]].forEach((card) => {
        card.classList.remove("bg-[#FFCDD2]", "text-[#D32F2F]");
        card.classList.add("bg-[#F3E5F5]", "text-[#9C27B0]");
      });
    }, 1000);
  }
}

// ======== 단어 기억 게임 함수 ========

// 단어 기억 게임 초기화 (개선된 버전)
function initMemoryGame() {
  console.log("메모리 게임 초기화 시작");

  // 메모리 게임 컨테이너를 더 확실하게 찾기
  let gameContainer = document.getElementById("memory-game");

  // ID로 찾지 못했다면 다른 방법으로 찾기
  if (!gameContainer) {
    gameContainer = document.querySelector('.game-container[id*="memory"]');
  }

  if (!gameContainer) {
    console.error("메모리 게임 컨테이너를 찾을 수 없습니다");
    return;
  }

  // 컨테이너 강제 표시
  gameContainer.style.display = "block";
  gameContainer.style.visibility = "visible";
  gameContainer.style.opacity = "1";

  const memoryBoard =
    gameContainer.querySelector("#memory-board") ||
    gameContainer.querySelector(".grid");

  if (!memoryBoard) {
    console.error("메모리 보드 요소를 찾을 수 없습니다");
    return;
  }

  // 메모리 보드도 강제 표시
  memoryBoard.style.display = "grid";
  memoryBoard.style.visibility = "visible";
  memoryBoard.style.opacity = "1";

  memoryBoard.innerHTML = "";
  memoryPairs = 0;

  // 메모리 게임 전용 변수 초기화
  canSelect = true;
  firstCard = null;
  secondCard = null;

  // 메모리 페어 카운터 업데이트
  const pairsCounter = gameContainer.querySelector("#memory-pairs");
  if (pairsCounter) {
    pairsCounter.textContent = "0";
  }

  // 카드 크기와 그리드 설정 조정 (반응형으로 개선)
  const cardCount = gameWords.length * 2;
  let gridCols =
    "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6";

  // 카드 수에 따른 최적 그리드 설정
  if (cardCount <= 8) {
    gridCols = "grid-cols-2 sm:grid-cols-3 md:grid-cols-4";
  } else if (cardCount <= 12) {
    gridCols = "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5";
  } else if (cardCount <= 16) {
    gridCols =
      "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6";
  } else {
    gridCols =
      "grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7";
  }

  memoryBoard.className = `grid ${gridCols} gap-2 sm:gap-3 md:gap-4 min-h-[300px]`;
  memoryBoard.style.display = "grid";

  // 강제 스타일 적용 (반응형 지원 - 최소 2열 유지)
  memoryBoard.style.cssText = `
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 0.75rem;
    min-height: 300px;
    width: 100%;
    padding: 1rem;
    background: transparent;
    justify-items: center;
  `;

  console.log(
    `메모리 게임 카드 생성: ${gameWords.length * 2}개 (${
      gameWords.length
    }개 단어 × 2)`
  );

  // 카드 쌍 생성 (각 단어당 2개 카드)
  const cardPairs = [];
  gameWords.forEach((word, index) => {
    // 각 단어에 대해 2개의 카드 생성 (같은 wordId로 매치되도록)
    cardPairs.push({
      id: `card_${index}_1`,
      word: word,
      wordId: word.id || `word_${index}`,
      displayType: "target", // 대상 언어 표시
    });
    cardPairs.push({
      id: `card_${index}_2`,
      word: word,
      wordId: word.id || `word_${index}`,
      displayType: "source", // 원본 언어 표시
    });
  });

  // 카드 셞플
  const shuffledCards = cardPairs.sort(() => Math.random() - 0.5);

  // 카드 HTML 생성
  shuffledCards.forEach((cardData) => {
    const card = document.createElement("div");
    card.className =
      "memory-card relative w-full h-32 cursor-pointer transform transition-transform duration-300 hover:scale-105 bg-white rounded-lg shadow-md";
    card.dataset.word = cardData.wordId;
    card.dataset.cardId = cardData.id;

    // 카드가 보이도록 강제 스타일 적용 - 세로 레이아웃
    card.style.cssText = `
      position: relative !important;
      width: 100% !important;
      max-width: 200px !important;
      min-width: 140px !important;
      height: 8rem !important;
      min-height: 8rem !important;
      max-height: 8rem !important;
      cursor: pointer !important;
      background: white !important;
      border-radius: 0.5rem !important;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1) !important;
      border: 2px solid #e2e8f0 !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      overflow: hidden !important;
      margin: 4px auto !important;
      z-index: 1 !important;
    `;

    // 디스플레이할 단어 결정
    const displayWord =
      cardData.displayType === "target"
        ? cardData.word.target || cardData.word.source || "단어 없음"
        : cardData.word.source || cardData.word.target || "단어 없음";

    // 언어 배지 색상 설정
    const badgeColor =
      cardData.displayType === "target"
        ? "bg-blue-100 text-blue-800"
        : "bg-green-100 text-green-800";

    const badgeText =
      cardData.displayType === "target"
        ? targetLanguage.toUpperCase()
        : sourceLanguage.toUpperCase();

    // 이모지 가져오기 (개념 데이터에서)
    const emoji =
      cardData.word.emoji ||
      cardData.word.unicode_emoji ||
      cardData.word.concept_info?.unicode_emoji ||
      cardData.word.conceptInfo?.unicode_emoji ||
      "📝";

    // 세로 레이아웃 카드 구조 - 이모지, 단어, 언어 배지 순
    card.innerHTML = `
      <div class="card-front" style="
        position: absolute !important; 
        width: 100% !important; 
        height: 100% !important; 
        background: linear-gradient(135deg, #3b82f6, #1e40af) !important; 
        border-radius: 0.5rem !important; 
        display: flex !important; 
        align-items: center !important; 
        justify-content: center !important;
        transition: all 0.3s ease !important;
        z-index: 2 !important;
        transform: rotateY(0deg) !important;
      ">
        <div style="color: white !important; font-size: 2rem !important; font-weight: bold !important; text-shadow: 2px 2px 4px rgba(0,0,0,0.5) !important;">?</div>
      </div>
      <div class="card-back" style="
        position: absolute !important; 
        width: 100% !important; 
        height: 100% !important; 
        background: linear-gradient(135deg, #10b981, #047857) !important; 
        border-radius: 0.5rem !important; 
        display: flex !important; 
        align-items: center !important; 
        justify-content: center !important; 
        color: white !important;
        opacity: 0 !important;
        transform: rotateY(-180deg) !important;
        transition: all 0.3s ease !important;
        z-index: 1 !important;
      ">
        <div style="text-align: center !important; padding: 12px !important; display: flex !important; flex-direction: column !important; align-items: center !important; justify-content: center !important; height: 100% !important; width: 100% !important;">
          <div style="font-size: 2.2rem !important; margin-bottom: 8px !important; flex-shrink: 0 !important;">${emoji}</div>
          <div style="font-size: 1rem !important; font-weight: bold !important; margin-bottom: 8px !important; word-break: break-word !important; text-shadow: 1px 1px 2px rgba(0,0,0,0.3) !important; line-height: 1.1 !important; text-align: center !important; flex: 1 !important; display: flex !important; align-items: center !important; justify-content: center !important;">${displayWord}</div>
          <span class="${badgeColor}" style="font-size: 0.65rem !important; padding: 2px 6px !important; border-radius: 9999px !important; display: inline-block !important; flex-shrink: 0 !important;">${badgeText}</span>
        </div>
      </div>
    `;

    // 카드 클릭 이벤트
    card.addEventListener("click", () => {
      if (
        !card.classList.contains("flipped") &&
        !card.classList.contains("matched") &&
        canSelect
      ) {
        flipCard(card, cardData.word);
      }
    });

    memoryBoard.appendChild(card);
  });

  // 메모리 보드가 실제로 보이는지 확인
  console.log("메모리 보드 상태:", {
    boardElement: memoryBoard,
    boardVisible: memoryBoard.offsetWidth > 0 && memoryBoard.offsetHeight > 0,
    childrenCount: memoryBoard.children.length,
    boardStyles: window.getComputedStyle(memoryBoard),
  });

  // 메모리 게임 CSS 스타일 업데이트
  updateMemoryGameStyles();

  // 타이머 시작 (난이도에 따라 시간 조정)
  const timeMap = {
    basic: 120,
    intermediate: 90,
    advanced: 60,
  };

  const gameTime = timeMap[gameDifficulty] || 120;
  const timerElement = gameContainer.querySelector("#memory-timer");
  if (timerElement) {
    startTimer("memory-timer", gameTime, () => {
      const completedPairs = memoryPairs;
      const totalPairs = gameWords.length;
      const finalScore = Math.round((completedPairs / totalPairs) * 100);

      completeGame(
        `시간이 종료되었습니다! 발견한 쌍: ${completedPairs}/${totalPairs}`,
        gameTime
      );
    });
  } else {
    console.warn("메모리 게임 타이머 요소를 찾을 수 없습니다");
  }

  console.log("메모리 게임 초기화 완료");
}

// 메모리 카드 뒤집기 함수 (개선된 버전)
function flipCard(card, word) {
  if (!card) {
    console.error("카드 요소가 존재하지 않습니다");
    return;
  }

  if (
    card.classList.contains("flipped") ||
    card.classList.contains("matched")
  ) {
    console.log("이미 뒤집어진 카드이거나 매치된 카드입니다");
    return; // 이미 뒤집어진 카드나 매치된 카드는 무시
  }

  console.log("카드 뒤집기 시작:", {
    word: word,
    cardId: card.dataset.cardId,
    wordId: card.dataset.word,
  });

  const frontFace = card.querySelector(".card-front");
  const backFace = card.querySelector(".card-back");

  if (!frontFace || !backFace) {
    console.error("카드 앞면 또는 뒷면 요소를 찾을 수 없습니다");
    return;
  }

  // 선택 금지 (애니메이션 중에는 다른 카드 클릭 방지)
  canSelect = false;

  // 카드 뒤집기 애니메이션 - 3D 회전 효과
  card.classList.add("flipped");

  // CSS 3D 변환으로 부드러운 뒤집기 효과
  frontFace.style.transform = "rotateY(-180deg)";
  frontFace.style.opacity = "0";
  frontFace.style.zIndex = "1";

  backFace.style.transform = "rotateY(0deg)";
  backFace.style.opacity = "1";
  backFace.style.zIndex = "2";

  console.log("카드 뒤집기 애니메이션 완료");

  // 선택 허용 복원 및 매치 확인
  setTimeout(() => {
    canSelect = true;
    checkMemoryMatch();
  }, 300); // 애니메이션 시간 단축
}

// 메모리 게임 매치 확인 함수 (완전히 새로 작성)
function checkMemoryMatch() {
  const flippedCards = document.querySelectorAll(
    ".memory-card.flipped:not(.matched)"
  );

  if (flippedCards.length === 2) {
    // 선택 금지 (매치 확인 중)
    canSelect = false;

    const [card1, card2] = flippedCards;
    const word1Data = card1.dataset.word;
    const word2Data = card2.dataset.word;

    if (word1Data === word2Data) {
      // 매치 성공
      setTimeout(() => {
        card1.classList.add("matched");
        card2.classList.add("matched");

        // 매치된 카드에 성공 효과 추가
        [card1, card2].forEach((card) => {
          card.style.background =
            "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)";
          card.style.transform = "scale(1.05)";
          card.style.boxShadow = "0 0 20px rgba(46, 125, 50, 0.7)";
        });

        memoryPairs++;

        // 페어 카운터 업데이트
        const pairsCounter = document.getElementById("memory-pairs");
        if (pairsCounter) {
          pairsCounter.textContent = memoryPairs;
        }

        console.log(
          `매치 성공! 현재 ${memoryPairs}/${gameWords.length} 쌍 완료`
        );

        // 모든 카드가 매치되었는지 확인
        const totalPairs = gameWords.length;
        if (memoryPairs >= totalPairs) {
          setTimeout(() => {
            const finalScore = 100; // 모든 쌍을 맞춘 경우 100점
            completeGame(finalScore, Date.now() - gameState.startTime);
          }, 500);
        }

        // 선택 허용 복원
        canSelect = true;
      }, 500);
    } else {
      // 매치 실패
      // 실패 피드백 표시
      [card1, card2].forEach((card) => {
        card.style.border = "3px solid #f87171";
      });

      setTimeout(() => {
        // 실패 피드백 제거
        [card1, card2].forEach((card) => {
          card.style.border = "";
        });

        // 카드 다시 뒤집기
        [card1, card2].forEach((card) => {
          card.classList.remove("flipped");

          const frontFace = card.querySelector(".card-front");
          const backFace = card.querySelector(".card-back");

          if (frontFace && backFace) {
            frontFace.style.transform = "rotateY(0deg)";
            frontFace.style.opacity = "1";
            frontFace.style.zIndex = "2";

            backFace.style.transform = "rotateY(-180deg)";
            backFace.style.opacity = "0";
            backFace.style.zIndex = "1";
          }
        });

        // 선택 허용 복원
        canSelect = true;
      }, 1000);
    }
  } else {
    // 2개가 아닌 경우 선택 허용
    canSelect = true;
  }
}

// 메모리 게임 CSS 스타일 업데이트
function updateMemoryGameStyles() {
  // 메모리 게임 CSS 스타일 업데이트 로직을 구현해야 합니다.
  // 현재는 기본 스타일만 적용됩니다.
}
