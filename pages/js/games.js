import {
  collection,
  query,
  getDocs,
  where,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  addDoc,
  serverTimestamp,
  limit,
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";
import { db, conceptUtils } from "../../js/firebase/firebase-init.js";
import { CollectionManager } from "../../js/firebase/firebase-collection-manager.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
import { auth } from "../../js/firebase/firebase-init.js";
import { getI18nText, getActiveLanguage } from "../../utils/language-utils.js";
import { selectEmojiForWord } from "../../utils/emoji-utils.js";

// 게임에 필요한 전역 변수
let sourceLanguage = "korean";
let targetLanguage = "english";
let currentGame = null;
let gameWords = [];
let score = 0;
let timerInterval = null;
let currentScrambleWordIndex = 0;
let selectedCards = [];
let matchedPairs = 0;
let attempts = 0;
let firstCard = null;
let secondCard = null;
let canSelect = true;

// 자동 정답 확인 타이머 관리
let autoCheckTimer = null;
let memoryPairs = 0;
let currentUser = null;
let collectionManager = new CollectionManager();

// ✅ 캐싱 시스템 추가
let cachedGameData = {
  data: null,
  timestamp: null,
  settings: null,
};
const CACHE_DURATION = 10 * 60 * 1000; // 10분

// ✅ Firebase 읽기 비용 모니터링
let firebaseReadCount = 0;

// Firebase 읽기 추적 함수
function trackFirebaseRead(queryName, docCount) {
  firebaseReadCount += docCount;
  console.log(
    `📊 Firebase 읽기: ${queryName} (+${docCount}), 총 ${firebaseReadCount}회`
  );

  // 임계값을 50으로 증가 (게임용 랜덤 조회는 여러 시도가 필요할 수 있음)
  if (firebaseReadCount > 50) {
    console.warn("⚠️ Firebase 읽기 횟수가 많습니다:", firebaseReadCount);
  }
}

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

// 언어 설정 저장 키
const LANGUAGE_SETTINGS_KEY = "likevoca_game_language_settings";

// 페이지 초기화
document.addEventListener("DOMContentLoaded", async () => {
  // 네비게이션바 이벤트 설정 (햄버거 메뉴 등)
  if (typeof window.setupBasicNavbarEvents === "function") {
    window.setupBasicNavbarEvents();
    console.log("✅ 게임: 네비게이션바 이벤트 설정 완료");
  } else {
    console.warn("⚠️ setupBasicNavbarEvents 함수를 찾을 수 없습니다.");
  }

  // 인증 상태 확인
  onAuthStateChanged(auth, (user) => {
    currentUser = user;
    if (user) {
      loadGameStats();
    }
  });

  // 저장된 언어 설정 불러오기
  loadLanguageSettings();

  // 언어 선택 이벤트 리스너
  setupLanguageSelectors();

  // 게임 카드 클릭 이벤트 리스너
  setupGameCards();

  // 언어 변경 이벤트 리스너 추가
  window.addEventListener("languageChanged", (event) => {
    console.log("🌐 언어 변경 이벤트 수신 - 게임 페이지 업데이트");

    // 변경된 언어 가져오기
    const newUILanguage =
      event.detail?.language || localStorage.getItem("userLanguage") || "ko";
    const currentUILanguage = newUILanguage === "auto" ? "ko" : newUILanguage;

    // 언어 필터 초기화 (환경 언어 변경 시 기존 설정 무시)
    import("../../utils/language-utils.js").then((module) => {
      const { updateLanguageFilterOnUIChange, loadLanguageFilterSettings } =
        module;

      // 환경 언어 변경에 따른 언어 필터 초기화
      updateLanguageFilterOnUIChange(currentUILanguage, "gameLanguageFilter");

      // 새로운 언어 설정 로드 및 전역 변수 업데이트
      const newSettings = loadLanguageFilterSettings("gameLanguageFilter");
      sourceLanguage = newSettings.sourceLanguage;
      targetLanguage = newSettings.targetLanguage;

      console.log("🔄 환경 언어 변경에 따른 게임 페이지 언어 필터 초기화:", {
        newUILanguage: currentUILanguage,
        sourceLanguage,
        targetLanguage,
      });
    });

    // 번역 다시 적용
    if (typeof window.applyLanguage === "function") {
      window.applyLanguage();
    }
  });
});

// 저장된 언어 설정 불러오기
function loadLanguageSettings() {
  try {
    // 언어 필터 설정 임포트 및 초기화
    import("../../utils/language-utils.js").then((module) => {
      const { loadLanguageFilterSettings } = module;

      // 언어 필터 설정 로드 (시스템 언어 기반 초기값 사용)
      const filterSettings = loadLanguageFilterSettings("gameLanguageFilter");

      sourceLanguage = filterSettings.sourceLanguage;
      targetLanguage = filterSettings.targetLanguage;

      console.log("🌐 게임 페이지 언어 설정 로드:", {
        sourceLanguage,
        targetLanguage,
      });

      // UI 업데이트
      const sourceElement = document.getElementById("source-language");
      const targetElement = document.getElementById("target-language");

      if (sourceElement) {
        sourceElement.value = sourceLanguage;
      }
      if (targetElement) {
        targetElement.value = targetLanguage;
      }
    });
  } catch (error) {
    console.error("언어 설정 불러오기 오류:", error);
  }
}

// 언어 설정 저장
function saveLanguageSettings() {
  try {
    // 언어 필터 설정 임포트 및 저장
    import("../../utils/language-utils.js").then((module) => {
      const { saveLanguageFilterSettings } = module;

      saveLanguageFilterSettings(
        sourceLanguage,
        targetLanguage,
        "gameLanguageFilter"
      );
      console.log("언어 설정 저장됨:", settings);
    });
  } catch (error) {
    console.error("언어 설정 저장 오류:", error);
  }
}

// 언어 선택기 설정
function setupLanguageSelectors() {
  const sourceSelect = document.getElementById("source-language");
  const targetSelect = document.getElementById("target-language");

  if (sourceSelect) {
    sourceSelect.addEventListener("change", (e) => {
      sourceLanguage = e.target.value;
      // 같은 언어 선택 방지
      if (sourceLanguage === targetLanguage) {
        const otherLanguages = [
          "korean",
          "english",
          "japanese",
          "chinese",
        ].filter((lang) => lang !== sourceLanguage);
        targetLanguage = otherLanguages[0];
        targetSelect.value = targetLanguage;
      }
      saveLanguageSettings();
      console.log("원본 언어 변경:", sourceLanguage);
    });
  }

  if (targetSelect) {
    targetSelect.addEventListener("change", (e) => {
      targetLanguage = e.target.value;
      // 같은 언어 선택 방지
      if (targetLanguage === sourceLanguage) {
        const otherLanguages = [
          "korean",
          "english",
          "japanese",
          "chinese",
        ].filter((lang) => lang !== targetLanguage);
        sourceLanguage = otherLanguages[0];
        sourceSelect.value = sourceLanguage;
      }
      saveLanguageSettings();
      console.log("대상 언어 변경:", targetLanguage);
    });
  }
}

// 게임 카드 설정
function setupGameCards() {
  const gameCards = document.querySelectorAll(".game-card");

  gameCards.forEach((card) => {
    card.addEventListener("click", () => {
      const gameType = card.getAttribute("data-game");
      navigateToGame(gameType);
    });
  });
}

// 게임 시작 (페이지 내에서)
async function navigateToGame(gameType) {
  try {
    console.log("게임 시작:", gameType);

    // 현재 게임 타입 설정
    currentGameType = gameType;

    // 게임 시작 시간 설정
    gameState.startTime = Date.now();
    gameState.isGameActive = true;

    // 게임용 단어 로드
    await loadGameWords();

    if (gameWords.length === 0) {
      alert(
        getI18nText("insufficient_words") || "게임에 필요한 단어가 부족합니다."
      );
      return;
    }

    // 화면 전환
    const gameSelectionArea = document.getElementById("game-selection-area");
    const gamePlayArea = document.getElementById("game-play-area");

    if (gameSelectionArea && gamePlayArea) {
      gameSelectionArea.classList.add("hidden");
      gamePlayArea.classList.remove("hidden");
    }

    // 게임 제목 설정
    const gameTitle = document.getElementById("current-game-title");
    if (gameTitle) {
      gameTitle.textContent = getGameTypeName(gameType);
    }

    // 게임 초기화
    await initializeGame(gameType);
  } catch (error) {
    console.error("게임 시작 오류:", error);
    alert(getI18nText("game_start_error") || "게임을 시작할 수 없습니다.");
  }
}

// 현재 언어 코드 가져오기
function getCurrentLanguage() {
  const path = window.location.pathname;
  if (path.includes("/ko/")) return "ko";
  if (path.includes("/ja/")) return "ja";
  if (path.includes("/zh/")) return "zh";
  return "en"; // 기본값
}

// 헬퍼 함수들
function getWordByLanguage(word, language) {
  // 새로운 구조 우선 확인
  if (word.expressions && word.expressions[language]) {
    return word.expressions[language].word;
  }

  // 기본 데이터 구조 지원
  if (word.languages && word.languages[language]) {
    return word.languages[language].word;
  }

  // 단순 구조 지원 (source/target 필드)
  if (language === sourceLanguage && word.source) {
    return word.source;
  }
  if (language === targetLanguage && word.target) {
    return word.target;
  }

  // 직접 언어 코드로 접근
  return word[language] || "";
}

function getSourceLanguageName() {
  const names = {
    korean: getI18nText("korean") || "한국어",
    english: getI18nText("english") || "영어",
    japanese: getI18nText("japanese") || "일본어",
    chinese: getI18nText("chinese") || "중국어",
  };
  return names[sourceLanguage] || sourceLanguage;
}

function getTargetLanguageName() {
  const names = {
    korean: getI18nText("korean") || "한국어",
    english: getI18nText("english") || "영어",
    japanese: getI18nText("japanese") || "일본어",
    chinese: getI18nText("chinese") || "중국어",
  };
  return names[targetLanguage] || targetLanguage;
}

// 게임 통계 로드
async function loadGameStats() {
  if (!currentUser) return;

  try {
    // game_records에서 실시간 통계 계산 (records 컬렉션) - 최근 5개만 조회
    const gameRecordsRef = collection(db, "game_records");
    const q = query(
      gameRecordsRef,
      where("user_email", "==", currentUser.email),
      limit(5) // 최근 5개만 조회 (최근 활동 표시용)
    );

    const querySnapshot = await getDocs(q);
    const gameResults = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      gameResults.push({
        id: doc.id,
        ...data,
        playedAt:
          data.timestamp?.toDate() ||
          data.completed_at?.toDate() ||
          data.playedAt?.toDate() ||
          new Date(),
      });
    });

    // 실시간 통계 계산
    let totalGames = gameResults.length;
    let totalScore = 0;
    let bestScore = 0;

    gameResults.forEach((game) => {
      const score = game.score || 0;
      totalScore += score;
      if (score > bestScore) {
        bestScore = score;
      }
    });

    const averageScore =
      totalGames > 0 ? Math.round(totalScore / totalGames) : 0;

    // 통계 UI 업데이트
    const totalGamesElement = document.getElementById("total-games-played");
    const bestScoreElement = document.getElementById("best-score");
    const averageScoreElement = document.getElementById("average-score");

    if (totalGamesElement) {
      totalGamesElement.textContent = totalGames;
    }
    if (bestScoreElement) {
      bestScoreElement.textContent = bestScore;
    }
    if (averageScoreElement) {
      averageScoreElement.textContent = averageScore;
    }

    console.log("🎯 게임 통계 UI 업데이트 완료:", {
      totalGames,
      bestScore,
      averageScore,
    });

    // 최근 게임 활동 표시
    await updateRecentGameActivity(gameResults);
  } catch (error) {
    console.error("게임 통계 로드 오류:", error);

    // 오류 시 기본값으로 UI 업데이트
    const totalGamesElement = document.getElementById("total-games-played");
    const bestScoreElement = document.getElementById("best-score");
    const averageScoreElement = document.getElementById("average-score");

    if (totalGamesElement) totalGamesElement.textContent = "0";
    if (bestScoreElement) bestScoreElement.textContent = "0";
    if (averageScoreElement) averageScoreElement.textContent = "0";
  }
}

// 최근 게임 활동 업데이트
async function updateRecentGameActivity(gameResults) {
  try {
    const recentActivityEl = document.getElementById("recent-game-activity");
    if (!recentActivityEl) {
      console.log("❌ recent-game-activity 요소를 찾을 수 없음");
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

    if (gameResults.length === 0) {
      recentActivityEl.innerHTML = `
        <p class="text-gray-500 text-center py-8">${
          getI18nText("no_recent_game_activity", activeLanguage) ||
          "아직 게임 활동이 없습니다."
        }</p>
      `;
      return;
    }

    // 최근 5개 게임 활동 표시
    const recentGames = gameResults.slice(0, 5);
    let activityHTML = "";

    recentGames.forEach((game) => {
      const gameType = game.gameType || game.game_type || "unknown";
      const score = game.score || 0;
      const timeSpent = game.timeSpent || game.time_spent || 0;
      const playedAt = game.playedAt || new Date();

      const gameTypeName = getGameTypeName(gameType);
      const formattedDate = playedAt.toLocaleDateString(locale, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      // 번역된 단위 텍스트 가져오기
      const secondsText = getI18nText("seconds", activeLanguage) || "초";
      const pointsText = getI18nText("points", activeLanguage) || "점";

      activityHTML += `
        <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
          <div>
            <span class="font-medium">${gameTypeName}</span>
            <span class="text-sm text-gray-600 ml-2">
              ${timeSpent}${secondsText}
            </span>
          </div>
          <div class="text-right">
            <div class="font-medium text-${
              score >= 80 ? "green" : score >= 60 ? "yellow" : "red"
            }-600">
              ${score}${pointsText}
            </div>
            <div class="text-xs text-gray-500">
              ${formattedDate}
            </div>
          </div>
        </div>
      `;
    });

    recentActivityEl.innerHTML = activityHTML;
    console.log("✅ 최근 게임 활동 업데이트 완료:", recentGames.length);
  } catch (error) {
    console.error("❌ 최근 게임 활동 업데이트 오류:", error);
  }
}

// 게임 결과 저장 (다른 게임 페이지에서 사용할 함수)
export async function saveGameResult(
  gameType,
  score,
  timeSpent,
  isCompleted = true,
  conceptIds = [] // 개념 ID 배열 추가
) {
  if (!currentUser) {
    console.warn("사용자가 로그인하지 않아 게임 결과를 저장할 수 없습니다.");
    return false;
  }

  try {
    // 유효한 Firebase 문서 ID만 필터링
    const validConceptIds = conceptIds.filter((id) => {
      const isValid =
        id &&
        typeof id === "string" &&
        id.length >= 15 &&
        /^[A-Za-z0-9]+$/.test(id);
      if (!isValid && id) {
        console.log(
          `⚠️ saveGameResult에서 임시 ID 필터링됨: ${id} (유효한 Firebase 문서 ID가 아님)`
        );
      }
      return isValid;
    });

    // game_records 컬렉션에 저장 (records 구조)
    const gameActivityData = {
      user_email: currentUser.email,
      game_type: gameType,
      gameType, // camelCase 호환성
      score,
      timeSpent,
      time_spent: timeSpent, // snake_case 호환성
      isCompleted,
      sourceLanguage,
      targetLanguage,
      language_pair: {
        source: sourceLanguage,
        target: targetLanguage,
      },
      conceptIds: validConceptIds, // 유효한 개념 ID만 저장
      conceptId: validConceptIds, // concept_id 호환성 (유효한 ID만)
      accuracy: score, // Firebase 통계용 (score와 동일값, UI에서는 score만 표시)
      success: score >= 70,
      timestamp: serverTimestamp(), // 진도 페이지용
      completed_at: serverTimestamp(), // 활동용
      playedAt: serverTimestamp(), // 추가 호환성
    };

    // CollectionManager를 통해 저장 (진도 업데이트 포함)
    await collectionManager.updateGameRecord(
      currentUser.email,
      gameActivityData
    );

    console.log("게임 활동 저장 완료:", {
      gameType,
      score,
      timeSpent,
      validConceptIds: validConceptIds.length,
    });
    return true;
  } catch (error) {
    console.error("게임 활동 저장 오류:", error);
    return false;
  }
}

// 게임 설정 내보내기 (다른 게임 페이지에서 사용)
export function getGameSettings() {
  return {
    sourceLanguage,
    targetLanguage,
    currentUser,
  };
}

// 언어 설정 불러오기 (다른 게임 페이지에서 사용)
export function loadGameLanguageSettings() {
  try {
    const savedSettings = localStorage.getItem(LANGUAGE_SETTINGS_KEY);
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      return {
        sourceLanguage: settings.sourceLanguage || "korean",
        targetLanguage: settings.targetLanguage || "english",
      };
    }
  } catch (error) {
    console.error("언어 설정 불러오기 오류:", error);
  }

  return {
    sourceLanguage: "korean",
    targetLanguage: "english",
  };
}

// 게임 레이블 업데이트 함수
async function updateGameLabels() {
  // 게임 UI의 레이블을 현재 언어로 업데이트
  console.log("게임 레이블 업데이트:", { sourceLanguage, targetLanguage });
  // 필요한 경우 여기에 번역 로직 추가
}

// 게임 초기화 함수
async function initializeGame(gameType) {
  try {
    console.log("게임 초기화 시작:", gameType);

    // 모든 게임 컨테이너 숨기기
    document.querySelectorAll(".game-container").forEach((container) => {
      container.style.display = "none";
    });

    // 선택된 게임 컨테이너 표시
    const gameContainer = document.getElementById(`${gameType}-container`);
    if (gameContainer) {
      gameContainer.style.display = "block";

      // 게임별 초기화
      switch (gameType) {
        case "word-matching":
          await initWordMatchingGame(gameContainer);
          break;
        case "word-scramble":
          await initWordScrambleGame(gameContainer);
          break;
        case "memory-game":
          await initMemoryGame(gameContainer);
          break;
        default:
          console.warn("알 수 없는 게임 타입:", gameType);
      }
    }
  } catch (error) {
    console.error("게임 초기화 오류:", error);
  }
}

// 게임 선택으로 돌아가기
function backToGameSelection() {
  const gameSelectionArea = document.getElementById("game-selection-area");
  const gamePlayArea = document.getElementById("game-play-area");

  if (gameSelectionArea && gamePlayArea) {
    gamePlayArea.classList.add("hidden");
    gameSelectionArea.classList.remove("hidden");
  }

  // 게임 상태 초기화
  currentGameType = null;
  gameWords = [];

  // 타이머 정리
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
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

    // 게임용 단어 로드
    await loadGameWords();

    if (gameWords.length === 0) {
      alert(
        getI18nText("insufficient_words") || "게임에 필요한 단어가 부족합니다."
      );
      return;
    }

    // 선택한 게임 컨테이너 표시 및 초기화
    const gameContainer = document.getElementById(`${gameType}-container`);
    if (!gameContainer) {
      console.error(`게임 컨테이너를 찾을 수 없습니다: ${gameType}-container`);
      return;
    }

    gameContainer.style.display = "block";

    switch (gameType) {
      case "word-matching":
        await initWordMatchingGame(gameContainer);
        break;
      case "word-scramble":
        await initWordScrambleGame(gameContainer);
        break;
      case "memory-game":
        await initMemoryGame(gameContainer);
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
    // 언어 설정 확인 및 기본값 설정
    if (!sourceLanguage || !targetLanguage) {
      console.warn("⚠️ 언어 설정이 없습니다. 기본값을 설정합니다.");
      sourceLanguage = "korean";
      targetLanguage = "english";
    }

    console.log("🎮 게임 단어 로딩 시작:", {
      currentGameType,
      sourceLanguage,
      targetLanguage,
      gameDifficulty,
    });

    const gameTypeMap = {
      "word-matching": "matching",
      "word-scramble": "spelling",
      "memory-game": "memory",
    };

    const gameType = gameTypeMap[currentGameType] || "matching";
    const languages = [sourceLanguage, targetLanguage];
    const limit = gameWordCount[currentGameType] || 8;
    // ✅ Firebase 조회 시 최적화: 50개에서 20개로 감소
    const fetchLimit = 20;

    console.log("🔍 개념 조회 파라미터:", {
      gameType: "matching", // 단어 섞기도 같은 조회 함수 사용
      gameDifficulty,
      languages: [sourceLanguage, targetLanguage],
      fetchLimit: fetchLimit, // ✅ Firebase 비용 최적화: 20개 조회 후 무작위 선택
      actualGameLimit: limit, // 실제 게임에서 사용할 단어 수
    });

    // ✅ 캐시된 데이터가 있고 유효하면 사용
    const now = Date.now();
    const currentSettings = JSON.stringify({
      sourceLanguage,
      targetLanguage,
      gameDifficulty,
      fetchLimit,
      currentGameType,
    });

    if (
      cachedGameData.data &&
      now - cachedGameData.timestamp < CACHE_DURATION &&
      cachedGameData.settings === currentSettings
    ) {
      console.log(
        `⚡ 게임 캐시된 데이터 사용: ${cachedGameData.data.length}개`
      );
      gameWords = cachedGameData.data.slice(0, limit);
      trackFirebaseRead("게임 캐시 사용", 0); // 캐시 사용 시 읽기 비용 0
      updateWordCount();
      return;
    }

    console.log("🔄 게임 새로운 데이터 로드 중...");

    console.log("🔍 conceptUtils 확인:", {
      conceptUtilsExists: !!conceptUtils,
      getConceptsForGameExists: !!(
        conceptUtils && conceptUtils.getConceptsForGame
      ),
    });

    try {
      if (!conceptUtils || !conceptUtils.getConceptsForGame) {
        throw new Error(
          "conceptUtils.getConceptsForGame이 정의되지 않았습니다."
        );
      }

      const concepts = await conceptUtils.getConceptsForGame(
        "matching", // gameType은 항상 matching으로 통일
        gameDifficulty,
        [sourceLanguage, targetLanguage],
        fetchLimit // ✅ Firebase에서는 20개 조회 (최적화)
      );

      console.log(`Firebase에서 ${concepts.length}개 개념 로딩 완료`, concepts);
      trackFirebaseRead("게임 개념 조회", concepts.length);

      // Firebase에서 가져온 개념이 1개 이상이면 사용 (최소 요구사항 완화)
      if (concepts.length >= 1) {
        // 유효한 Firebase 문서 ID를 가진 개념만 필터링
        const validConcepts = concepts.filter((concept) => {
          const isValid =
            concept.id &&
            typeof concept.id === "string" &&
            concept.id.length >= 15 &&
            /^[A-Za-z0-9]+$/.test(concept.id);
          if (!isValid && concept.id) {
            console.log(
              `⚠️ 게임 단어 변환 시 임시 ID 필터링됨: ${concept.id} (유효한 Firebase 문서 ID가 아님)`
            );
          }
          return isValid;
        });

        const firebaseWords = validConcepts.slice(0, limit).map((concept) => ({
          id: concept.id,
          source: concept.expressions?.[sourceLanguage]?.word || "",
          target: concept.expressions?.[targetLanguage]?.word || "",
          domain: concept.conceptInfo?.domain || "general",
          category: concept.conceptInfo?.category || "",
          difficulty: concept.conceptInfo?.difficulty || "basic",
          // 이모지 정보 포함 (concept_info로 통일)
          concept_info: concept.concept_info || concept.conceptInfo,
          isFromFirebase: true,
        }));

        console.log(
          `🔍 유효한 개념: ${validConcepts.length}개 (전체 ${concepts.length}개 중)`
        );

        // Firebase 개념 수가 부족하면 기본 단어로 보완 (단, 저장하지 않음)
        if (firebaseWords.length < limit) {
          const additionalDefaultWords = getDefaultWordsForGame(
            limit - firebaseWords.length
          );
          // 기본 단어들은 임시 ID를 가지므로 나중에 저장 시 필터링됨
          gameWords = [...firebaseWords, ...additionalDefaultWords];
          console.log(
            `⚠️ 개념이 부족하여 기본 단어 ${additionalDefaultWords.length}개로 보완 (기본 단어는 기록에 저장되지 않음)`
          );
        } else {
          gameWords = firebaseWords;
        }

        // 최종 무작위 섞기 (Fisher-Yates 알고리즘)
        for (let i = gameWords.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [gameWords[i], gameWords[j]] = [gameWords[j], gameWords[i]];
        }

        console.log(
          `🎯 게임 단어 로딩 완료: ${gameWords.length}개 (Firebase 유효: ${firebaseWords.length}개, 무작위 섞기 적용)`
        );
        return;
      }

      // 충분한 개념이 없으면 난이도 제한 없이 다시 시도
      const conceptsWithoutDifficulty = await conceptUtils.getConceptsForGame(
        "matching",
        null, // 난이도 제한 없음
        [sourceLanguage, targetLanguage],
        fetchLimit // Firebase에서는 50개 조회
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
            // 이모지 정보 포함 (concept_info로 통일)
            concept_info: concept.concept_info || concept.conceptInfo,
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

        // 최종 무작위 섞기 (Fisher-Yates 알고리즘)
        for (let i = gameWords.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [gameWords[i], gameWords[j]] = [gameWords[j], gameWords[i]];
        }

        console.log(
          `🎯 게임 단어 로딩 완료: ${gameWords.length}개 (Firebase: ${firebaseWords.length}개, 무작위 섞기 적용)`
        );
        return;
      }
    } catch (error) {
      console.error("Firebase 개념 로드 오류:", error);
    }

    // Firebase에서 개념을 전혀 가져오지 못한 경우만 기본 단어 세트 사용
    console.log("🔄 Firebase 개념 로딩 실패, 기본 단어 세트를 사용합니다.");
    useDefaultWords();
  } catch (error) {
    console.error("단어 로드 중 오류 발생:", error);
    console.log("🔄 오류가 발생하여 기본 단어 세트를 사용합니다.");
    useDefaultWords();
  }

  console.log("📝 최종 gameWords:", gameWords);

  // ✅ 최종 게임 데이터 캐시 저장 (기본 단어 사용 시에도)
  if (gameWords.length > 0) {
    const currentSettings = JSON.stringify({
      sourceLanguage,
      targetLanguage,
      gameDifficulty,
      fetchLimit: 20,
      currentGameType,
    });

    cachedGameData = {
      data: [...gameWords], // 깊은 복사
      timestamp: Date.now(),
      settings: currentSettings,
    };
    console.log(`💾 최종 게임 데이터 캐시 저장: ${gameWords.length}개`);
  }

  // 단어 수 업데이트
  updateWordCount();

  return gameWords;
}

// 기본 단어 세트 사용 함수
function useDefaultWords() {
  // 언어 설정 확인 및 기본값 설정
  if (!sourceLanguage || !targetLanguage) {
    console.warn(
      "⚠️ useDefaultWords에서 언어 설정이 없습니다. 기본값을 설정합니다."
    );
    sourceLanguage = "korean";
    targetLanguage = "english";
  }

  console.log("🔧 기본 단어 세트 사용 시작:", {
    sourceLanguage,
    targetLanguage,
    defaultWordsLength: defaultWords.length,
    requiredCount: gameWordCount[currentGameType] || 8,
  });

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

  console.log("🔧 매핑된 기본 단어들:", defaultWordsMapped.slice(0, 3));

  const validWords = defaultWordsMapped.filter(
    (word) => word.source && word.target
  ); // 유효한 단어만 필터링

  console.log("🔧 필터링 후 유효한 단어 수:", validWords.length);

  // Fisher-Yates 셔플 알고리즘으로 강력한 무작위화
  const shuffledWords = [...validWords];
  for (let i = shuffledWords.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledWords[i], shuffledWords[j]] = [shuffledWords[j], shuffledWords[i]];
  }

  gameWords = shuffledWords.slice(0, gameWordCount[currentGameType] || 8);
  console.log("🎯 최종 선택된 기본 단어 목록:", gameWords);
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

  const validWords = defaultWordsMapped.filter(
    (word) => word.source && word.target
  ); // 유효한 단어만 필터링

  // Fisher-Yates 셔플 알고리즘으로 강력한 무작위화
  const shuffledWords = [...validWords];
  for (let i = shuffledWords.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledWords[i], shuffledWords[j]] = [shuffledWords[j], shuffledWords[i]];
  }

  return shuffledWords.slice(0, neededCount);
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

    // 타이머 정리
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }

    // 시간 계산 - timeSpent가 있으면 사용, 없으면 게임 시작 시간부터 계산
    let totalTime;
    if (timeSpent && timeSpent > 0 && timeSpent < 1000) {
      // 정상적인 범위의 시간
      totalTime = Math.round(timeSpent);
    } else if (gameState.startTime) {
      totalTime = Math.round((gameState.endTime - gameState.startTime) / 1000);
    } else {
      totalTime = 60; // 기본값 (1분)
    }

    // 정확도 계산 - 기본 점수만 기준 (시간 보너스 제외)
    const maxScore = (gameWords?.length || 8) * 10; // 단어당 10점
    const baseScore = Math.min(finalScore, maxScore); // 시간 보너스 제외한 기본 점수
    const accuracy = Math.round((baseScore / maxScore) * 100) || 0;

    console.log("🎯 게임 완료 계산:", {
      finalScore,
      maxScore,
      accuracy,
      totalTime,
      timeSpent,
      gameStateStartTime: gameState.startTime,
      gameStateEndTime: gameState.endTime,
    });

    // 사용자 게임 통계 업데이트 (분리된 컬렉션 연동)
    if (currentUser) {
      // 게임 통계 업데이트 (CollectionManager 사용)
      try {
        // 현재 언어 설정 확인
        const currentSourceLanguage =
          document.getElementById("source-language")?.value ||
          sourceLanguage ||
          "korean";
        const currentTargetLanguage =
          document.getElementById("target-language")?.value ||
          targetLanguage ||
          "english";

        console.log("🎮 게임 완료 - 언어 설정 확인:", {
          sourceLanguage: currentSourceLanguage,
          targetLanguage: currentTargetLanguage,
          gameType: currentGameType,
        });

        const gameResults = {
          gameType: currentGameType,
          score: finalScore,
          accuracy: accuracy,
          timeSpent: totalTime,
          wordsPlayed: gameWords.length,
          // 언어 정보 추가
          sourceLanguage: currentSourceLanguage,
          targetLanguage: currentTargetLanguage,
        };

        await collectionManager.updateUserProgressFromGame(
          currentUser.email,
          gameResults
        );
        console.log("✓ 게임 통계 업데이트 완료");
      } catch (error) {
        console.warn("게임 통계 업데이트 중 오류:", error);
      }

      // 학습한 개념들의 진도 업데이트
      let updatedConceptsCount = 0;
      if (gameWords && gameWords.length > 0) {
        // 🎮 게임 활동 데이터 준비 (유효한 Firebase 문서 ID만 필터링)
        const conceptIds = gameWords
          .filter((word) => word.id && word.id !== "default") // 기본 단어 제외
          .map((word) => word.id)
          .filter((id) => {
            // 유효한 Firebase 문서 ID만 허용 (15자 이상의 영숫자)
            const isValid =
              id &&
              typeof id === "string" &&
              id.length >= 15 &&
              /^[A-Za-z0-9]+$/.test(id);
            if (!isValid && id) {
              console.log(
                `⚠️ 게임 데이터에서 임시 ID 필터링됨: ${id} (유효한 Firebase 문서 ID가 아님)`
              );
            }
            return isValid;
          });

        if (conceptIds.length > 0) {
          try {
            // 게임 활동 추적
            const gameActivityData = {
              type: currentGameType,
              score: finalScore,
              maxScore: (gameWords?.length || 8) * 10,
              timeSpent: totalTime,
              wordsPlayed: gameWords?.length || 0,
              correctAnswers: Math.round(finalScore / 10),
              totalAnswers: gameWords?.length || 0,
              difficulty: gameDifficulty || "basic",
              sourceLanguage: sourceLanguage,
              targetLanguage: targetLanguage, // 명시적으로 targetLanguage 전달
              conceptId: conceptIds, // concept_id로 통일 (유효한 ID만)
              conceptIds: conceptIds, // 개념 스냅샷 저장용 추가 (유효한 ID만)
              accuracy: accuracy, // 🎯 정확도 필드 추가
              accuracyRate: accuracy / 100, // 0-1 범위로 변환
              performanceRating:
                accuracy >= 90
                  ? "excellent"
                  : accuracy >= 80
                  ? "good"
                  : accuracy >= 70
                  ? "fair"
                  : "needs_improvement",
            };

            await collectionManager.updateGameRecord(
              currentUser.email,
              gameActivityData
            );
            updatedConceptsCount = conceptIds.length;
            console.log(
              `✓ 게임 활동 추적 및 진도 업데이트 완료: ${conceptIds.length}개 유효한 개념`
            );
          } catch (error) {
            console.warn("게임 활동 추적 중 오류:", error);
          }
        } else {
          console.log("⚠️ 유효한 개념 ID가 없어 게임 활동 추적을 건너뜀");
        }
      }

      console.log("게임 완료 및 진도 업데이트 완료:", {
        gameType: currentGameType,
        accuracy: accuracy,
        totalTime: totalTime,
        conceptsUpdated: updatedConceptsCount,
        totalWords: gameWords?.length || 0,
      });

      // 🔄 게임 통계 새로고침 (게임 페이지 통계 업데이트)
      try {
        await loadGameStats();
        console.log("🎯 게임 페이지 통계 새로고침 완료");
      } catch (error) {
        console.warn("게임 통계 새로고침 중 오류:", error);
      }

      // 🆕 진도 페이지 캐시 무효화를 위한 타임스탬프 설정
      try {
        const targetLanguage =
          localStorage.getItem("selectedTargetLanguage") || "english"; // 실제 선택된 대상 언어 사용
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
          `🔄 게임 완료 - 진도 페이지 캐시 무효화 완료: ${targetLanguage}, 타임스탬프: ${invalidationTime}`
        );
        console.log(
          `🗑️ 관련 캐시 삭제 완료 - 게임한 개념: ${updatedConceptsCount}개`
        );
      } catch (cacheError) {
        console.warn(
          "⚠️ 게임 완료 - 진도 페이지 캐시 무효화 실패:",
          cacheError
        );
      }

      // 🔄 진도 페이지에서 감지할 수 있도록 localStorage에 게임 완료 정보 저장
      try {
        const gameCompletionData = {
          gameType: currentGameType,
          score: finalScore,
          accuracy: accuracy,
          totalTime: totalTime,
          conceptsUpdated: updatedConceptsCount,
          completedAt: new Date().toISOString(),
          userEmail: currentUser.email,
        };
        localStorage.setItem(
          "gameCompletionUpdate",
          JSON.stringify(gameCompletionData)
        );
        console.log(
          "📦 localStorage에 게임 완료 데이터 저장:",
          gameCompletionData
        );
      } catch (error) {
        console.warn("게임 완료 데이터 저장 중 오류:", error);
      }

      // 게임 결과 표시
      if (currentGameType === "word-matching") {
        await showWordMatchingResults({
          finalScore: finalScore,
          totalTime: totalTime,
          accuracy: accuracy,
          concepts: updatedConceptsCount,
          totalWords: gameWords?.length || 0,
        });
      } else if (currentGameType === "word-scramble") {
        await showWordScrambleResults({
          finalScore: finalScore,
          totalTime: totalTime,
          accuracy: accuracy,
          concepts: updatedConceptsCount,
          totalWords: gameWords?.length || 0,
        });
      } else if (currentGameType === "memory-game") {
        await showMemoryGameResults({
          finalScore: finalScore,
          totalTime: totalTime,
          accuracy: accuracy,
          concepts: updatedConceptsCount,
          totalWords: gameWords?.length || 0,
        });
      } else {
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
    }
  } catch (error) {
    console.error("게임 완료 처리 중 오류:", error);

    // 오류가 발생해도 결과는 표시
    if (currentGameType === "word-matching") {
      await showWordMatchingResults({
        finalScore: finalScore,
        totalTime: timeSpent || 0,
        accuracy:
          Math.round((finalScore / (gameWords?.length * 10 || 80)) * 100) || 0,
        concepts: 0, // 오류 발생 시 0개로 표시
        totalWords: gameWords?.length || 0,
        error: "진도 업데이트 중 일부 오류가 발생했습니다.",
      });
    } else if (currentGameType === "word-scramble") {
      await showWordScrambleResults({
        finalScore: finalScore,
        totalTime: timeSpent || 0,
        accuracy:
          Math.round((finalScore / (gameWords?.length * 10 || 80)) * 100) || 0,
        concepts: 0, // 오류 발생 시 0개로 표시
        totalWords: gameWords?.length || 0,
        error: "진도 업데이트 중 일부 오류가 발생했습니다.",
      });
    } else if (currentGameType === "memory-game") {
      await showMemoryGameResults({
        finalScore: finalScore,
        totalTime: timeSpent || 0,
        accuracy:
          Math.round((finalScore / (gameWords?.length * 10 || 80)) * 100) || 0,
        concepts: 0, // 오류 발생 시 0개로 표시
        totalWords: gameWords?.length || 0,
        error: "진도 업데이트 중 일부 오류가 발생했습니다.",
      });
    } else {
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
}

// 단어 맞추기 게임 결과 표시 (인라인)
async function showWordMatchingResults(results) {
  const gameContainer = document.querySelector("#word-matching-container");
  if (!gameContainer) return;

  // 현재 언어 설정 가져오기
  const activeLanguage = await getActiveLanguage();

  // 헤더 부분 숨기기
  const headerArea = gameContainer.querySelector(
    ".flex.justify-between.items-center"
  );
  if (headerArea) {
    headerArea.classList.add("hidden");
  }

  // 게임 진행 화면 숨기기
  const gameArea = gameContainer.querySelector("#matching-game");
  if (gameArea) {
    gameArea.classList.add("hidden");
  }

  // 결과 화면 보이기
  const resultsArea = gameContainer.querySelector("#matching-results");
  if (resultsArea) {
    resultsArea.classList.remove("hidden");

    // 결과 데이터 업데이트
    const scoreElement = resultsArea.querySelector("#matching-final-score");
    const accuracyElement = resultsArea.querySelector("#matching-accuracy");
    const timeElement = resultsArea.querySelector("#matching-time");

    if (scoreElement) scoreElement.textContent = results.finalScore;
    if (accuracyElement) accuracyElement.textContent = `${results.accuracy}%`;
    if (timeElement) {
      const minutes = Math.floor(results.totalTime / 60);
      const seconds = results.totalTime % 60;
      timeElement.textContent = `${minutes
        .toString()
        .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    }

    // 성과 메시지 업데이트
    const titleElement = resultsArea.querySelector("h2");
    if (titleElement) {
      let message =
        getI18nText("game_completed", activeLanguage) || "게임 완료!";
      if (results.accuracy >= 90) {
        message = `🎉 ${getI18nText("perfect", activeLanguage) || "완벽해요!"}`;
      } else if (results.accuracy >= 80) {
        message = `👏 ${
          getI18nText("great_job", activeLanguage) || "잘했어요!"
        }`;
      } else if (results.accuracy >= 70) {
        message = `👍 ${getI18nText("good", activeLanguage) || "괜찮아요!"}`;
      } else {
        message = `💪 ${
          getI18nText("try_again", activeLanguage) || "다시 도전!"
        }`;
      }
      titleElement.textContent = message;
    }

    console.log("✅ 단어 맞추기 게임 결과 화면 표시 완료");
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
  } else {
    // 결과 영역이 없으면 alert로 표시
    let message = `게임 완료!\n\n`;
    message += `게임: ${getGameTypeName(results.gameType)}\n`;
    message += `점수: ${results.finalScore}점\n`;
    message += `정확도: ${results.accuracy || 0}%\n`;
    message += `소요 시간: ${results.totalTime}초\n`;
    if (results.concepts > 0) {
      message += `학습한 단어: ${results.concepts}개\n`;
    }

    alert(message);

    // 게임 선택 화면으로 돌아가기
    setTimeout(() => {
      backToGameSelection();
    }, 1000);

    return;
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
    "word-matching": getI18nText("word_matching_title") || "단어 맞추기",
    "word-scramble": getI18nText("word_scramble_title") || "단어 섞기",
    "memory-game": getI18nText("memory_game_title") || "단어 기억 게임",
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

// ======== 게임 초기화 함수들 ========

// 단어 맞추기 게임 초기화
async function initWordMatchingGame(container) {
  console.log("단어 맞추기 게임 초기화");

  // 게임 상태 초기화
  score = 0;

  // 현재 언어 설정 가져오기
  const activeLanguage = await getActiveLanguage();

  console.log("🎯 단어 맞추기 초기화:", {
    gameWordsLength: gameWords.length,
    sourceLanguage,
    targetLanguage,
    score,
    activeLanguage,
  });

  if (gameWords.length === 0) {
    console.error("❌ gameWords가 비어있습니다! 게임을 중단합니다.");
    alert(
      getI18nText("insufficient_words_error", activeLanguage) ||
        "게임에 필요한 단어를 불러올 수 없습니다. 다시 시도해주세요."
    );
    backToGameSelection();
    return;
  }

  // 번역된 텍스트 가져오기
  const scoreText = getI18nText("score", activeLanguage) || "점수";
  const timeText = getI18nText("time", activeLanguage) || "시간";
  const secondsText = getI18nText("seconds", activeLanguage) || "초";
  const endGameText = getI18nText("end_game", activeLanguage) || "게임 종료";
  const gameCompletedText =
    getI18nText("game_completed", activeLanguage) || "게임 완료!";
  const accuracyText = getI18nText("accuracy", activeLanguage) || "정확도";
  const timeTakenText =
    getI18nText("time_taken", activeLanguage) || "소요 시간";
  const retryText = getI18nText("retry", activeLanguage) || "다시 도전";
  const newGameText = getI18nText("new_game", activeLanguage) || "새 게임";

  // 게임 HTML 생성
  container.innerHTML = `
    <div class="bg-white rounded-xl p-6 shadow-lg">
      <div class="flex justify-between items-center mb-6">
        <div class="flex items-center space-x-4">
          <div class="text-lg font-semibold">${scoreText}: <span id="matching-score">0</span></div>
          <div class="text-lg font-semibold">${timeText}: <span id="matching-timer">60</span>${secondsText}</div>
        </div>
        <button id="matching-end" class="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600">
          ${endGameText}
        </button>
      </div>
      
      <!-- 게임 진행 화면 --> 
      <div id="matching-game" class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 class="text-lg font-bold mb-4 text-center">${getSourceLanguageName()}</h3>
          <div id="source-words" class="grid grid-cols-2 gap-3 min-h-[300px]"></div>
        </div>
        <div>
          <h3 class="text-lg font-bold mb-4 text-center">${getTargetLanguageName()}</h3>
          <div id="target-words" class="grid grid-cols-2 gap-3 min-h-[300px]"></div>
        </div>
      </div>
      
      <!-- 게임 결과 화면 -->
      <div id="matching-results" class="hidden">
        <div class="bg-white rounded-lg shadow-md p-8 text-center">
          <div class="mb-6">
            <i class="fas fa-trophy text-6xl text-yellow-500 mb-4"></i>
            <h2 class="text-2xl font-bold text-gray-800 mb-2">${gameCompletedText}</h2>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div class="bg-green-50 p-4 rounded-lg">
              <div class="text-3xl font-bold text-green-600" id="matching-final-score">0</div>
              <div class="text-sm text-gray-600">${scoreText}</div>
            </div>
            
            <div class="bg-blue-50 p-4 rounded-lg">
              <div class="text-3xl font-bold text-blue-600" id="matching-accuracy">0%</div>
              <div class="text-sm text-gray-600">${accuracyText}</div>
            </div>
            
            <div class="bg-purple-50 p-4 rounded-lg">
              <div class="text-3xl font-bold text-purple-600" id="matching-time">00:00</div>
              <div class="text-sm text-gray-600">${timeTakenText}</div>
            </div>
          </div>
          
          <div class="space-x-4">
            <button 
              id="retry-matching-btn"
              class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              ${retryText}
            </button>
            
            <button 
              id="new-matching-btn"
              class="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
            >
              ${newGameText}
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  const sourceContainer = container.querySelector("#source-words");
  const targetContainer = container.querySelector("#target-words");

  // 점수 초기화
  score = 0;

  console.log("단어 맞추기 게임: gameWords 배열", gameWords);
  console.log(
    "단어 맞추기 게임: 원본 언어",
    sourceLanguage,
    "목표 언어",
    targetLanguage
  );

  // 단어 카드 생성 (원본 언어)
  gameWords.forEach((word, index) => {
    const sourceText = getWordByLanguage(word, sourceLanguage);
    console.log(`원본 단어 ${index}:`, sourceText, "전체 데이터:", word);
    const sourceCard = createMatchingCard(sourceText, index, "source");
    sourceContainer.appendChild(sourceCard);
  });

  // 단어 카드 생성 (목표 언어) - 섞어서 표시
  const shuffledWords = [...gameWords].sort(() => 0.5 - Math.random());
  shuffledWords.forEach((word, index) => {
    const targetText = getWordByLanguage(word, targetLanguage);
    console.log(`목표 단어 ${index}:`, targetText, "전체 데이터:", word);
    const targetCard = createMatchingCard(
      targetText,
      gameWords.indexOf(word),
      "target",
      word.id
    );
    targetContainer.appendChild(targetCard);
  });

  // 게임 종료 버튼 이벤트
  const endBtn = container.querySelector("#matching-end");
  if (endBtn) {
    endBtn.addEventListener("click", () => {
      completeGame(score);
    });
  }

  // 다시 도전 버튼 이벤트
  const retryBtn = container.querySelector("#retry-matching-btn");
  if (retryBtn) {
    retryBtn.addEventListener("click", () => {
      // 결과 화면 숨기고 게임 화면 보이기
      container.querySelector("#matching-results").classList.add("hidden");
      container.querySelector("#matching-game").classList.remove("hidden");

      // 헤더 부분도 다시 보이기
      const headerArea = container.querySelector(
        ".flex.justify-between.items-center"
      );
      if (headerArea) {
        headerArea.classList.remove("hidden");
      }

      // 게임 재시작
      initWordMatchingGame(container);
    });
  }

  // 새 게임 버튼 이벤트
  const newGameBtn = container.querySelector("#new-matching-btn");
  if (newGameBtn) {
    newGameBtn.addEventListener("click", () => {
      backToGameSelection();
    });
  }

  // 타이머 시작
  startTimer("matching-timer", 60, () => {
    completeGame(score, 60);
  });
}

// 매칭 카드 생성
function createMatchingCard(text, index, type, wordId = null) {
  const card = document.createElement("div");
  card.className =
    "bg-purple-100 p-4 rounded-lg shadow-md text-center cursor-pointer hover:bg-purple-200 transition-colors";
  card.setAttribute("data-index", index);
  card.setAttribute("data-type", type);
  if (wordId) card.setAttribute("data-word-id", wordId);
  card.textContent = text;

  // 클릭 이벤트 추가
  card.addEventListener("click", () => {
    handleMatchingCardClick(card);
  });

  return card;
}

// 매칭 카드 클릭 처리
function handleMatchingCardClick(card) {
  const selectedCard = document.querySelector(".selected-matching-card");

  if (selectedCard) {
    if (selectedCard === card) {
      // 같은 카드 클릭 시 선택 해제
      selectedCard.classList.remove("selected-matching-card", "bg-yellow-200");
      selectedCard.classList.add("bg-purple-100");
      return;
    }

    // 두 카드가 매칭되는지 확인
    const selectedType = selectedCard.getAttribute("data-type");
    const currentType = card.getAttribute("data-type");

    if (selectedType !== currentType) {
      checkWordMatch(selectedCard, card);
    }

    // 선택 상태 해제
    selectedCard.classList.remove("selected-matching-card", "bg-yellow-200");
    selectedCard.classList.add("bg-purple-100");
  } else {
    // 카드 선택
    card.classList.add("selected-matching-card", "bg-yellow-200");
    card.classList.remove("bg-purple-100");
  }
}

// 단어 매칭 확인
function checkWordMatch(card1, card2) {
  // 카드 타입 확인하여 source와 target 구분
  const card1Type = card1.getAttribute("data-type");
  const card2Type = card2.getAttribute("data-type");

  let sourceCard, targetCard;

  if (card1Type === "source" && card2Type === "target") {
    sourceCard = card1;
    targetCard = card2;
  } else if (card1Type === "target" && card2Type === "source") {
    sourceCard = card2;
    targetCard = card1;
  } else {
    console.error("잘못된 카드 조합:", card1Type, card2Type);
    return;
  }

  const sourceIndex = parseInt(sourceCard.getAttribute("data-index"));
  const targetWordId = targetCard.getAttribute("data-word-id");

  const sourceWord = gameWords[sourceIndex];

  console.log("🔍 카드 매칭 확인:", {
    sourceIndex,
    targetWordId,
    sourceWord: sourceWord
      ? `${sourceWord.source} -> ${sourceWord.target}`
      : null,
    sourceWordId: sourceWord?.id,
  });

  if (sourceWord && sourceWord.id === targetWordId) {
    // 매칭 성공
    sourceCard.classList.add("bg-green-200", "text-green-800");
    targetCard.classList.add("bg-green-200", "text-green-800");
    sourceCard.style.pointerEvents = "none";
    targetCard.style.pointerEvents = "none";

    score += 10;
    const scoreElement = document.getElementById("matching-score");
    if (scoreElement) scoreElement.textContent = score;

    // 모든 카드가 매칭되었는지 확인
    const remainingCards = document.querySelectorAll(
      "#source-words > div:not(.bg-green-200)"
    );
    if (remainingCards.length === 0) {
      setTimeout(() => {
        // 시간 보너스 계산 (10초 이내 20점, 10초 초과시 초당 0.5점 차감)
        const gameEndTime = Date.now();
        const totalTimeInSeconds = Math.round(
          (gameEndTime - gameState.startTime) / 1000
        );
        let finalScore = score;

        let timeBonus = 0;
        if (totalTimeInSeconds <= 10) {
          timeBonus = 20; // 1~10초: 20점
        } else if (totalTimeInSeconds <= 30) {
          timeBonus = 20 - Math.round((totalTimeInSeconds - 10) * 0.5); // 10초 초과시 초당 0.5점 차감
        }

        finalScore += timeBonus;
        console.log(
          `🏆 시간 보너스: ${timeBonus}점 (${totalTimeInSeconds}초 완료)`
        );

        completeGame(finalScore, totalTimeInSeconds);
      }, 500);
    }
  } else {
    // 매칭 실패
    sourceCard.classList.add("bg-red-200");
    targetCard.classList.add("bg-red-200");

    setTimeout(() => {
      sourceCard.classList.remove("bg-red-200");
      targetCard.classList.remove("bg-red-200");
    }, 1000);

    score = Math.max(0, score - 2);
    const scoreElement = document.getElementById("matching-score");
    if (scoreElement) scoreElement.textContent = score;
  }
}

// 단어 섞기 게임 초기화
async function initWordScrambleGame(container) {
  console.log("단어 섞기 게임 초기화");

  // 게임 상태 초기화
  currentScrambleWordIndex = 0;
  score = 0;

  // 현재 언어 설정 가져오기
  const activeLanguage = await getActiveLanguage();

  console.log("🔤 단어 섞기 초기화:", {
    gameWordsLength: gameWords.length,
    currentScrambleWordIndex,
    score,
    activeLanguage,
  });

  // 번역된 텍스트 가져오기
  const scoreText = getI18nText("score", activeLanguage) || "점수";
  const timeText = getI18nText("time", activeLanguage) || "시간";
  const secondsText = getI18nText("seconds", activeLanguage) || "초";
  const endGameText = getI18nText("end_game", activeLanguage) || "게임 종료";
  const hintText = getI18nText("hint", activeLanguage) || "힌트";
  const arrangeLettersText =
    getI18nText("arrange_letters", activeLanguage) ||
    "아래 글자들을 올바른 순서로 배열하세요";
  const answerInputText =
    getI18nText("answer_input", activeLanguage) || "정답 입력";
  const checkText = getI18nText("check", activeLanguage) || "확인";
  const resetArrangementText =
    getI18nText("reset_arrangement", activeLanguage) || "다시 배열";
  const nextProblemText =
    getI18nText("next_problem", activeLanguage) || "다음 문제";
  const gameCompletedText =
    getI18nText("game_completed", activeLanguage) || "게임 완료!";
  const accuracyText = getI18nText("accuracy", activeLanguage) || "정확도";
  const timeTakenText =
    getI18nText("time_taken", activeLanguage) || "소요 시간";
  const retryText = getI18nText("retry", activeLanguage) || "다시 도전";
  const newGameText = getI18nText("new_game", activeLanguage) || "새 게임";

  // 게임 HTML 생성
  container.innerHTML = `
    <div class="bg-white rounded-xl p-6 shadow-lg">
      <div class="flex justify-between items-center mb-6">
        <div class="flex items-center space-x-4">
          <div class="text-lg font-semibold">${scoreText}: <span id="scramble-score">0</span></div>
          <div class="text-lg font-semibold">${timeText}: <span id="scramble-timer">60</span>${secondsText}</div>
        </div>
        <button id="scramble-end" class="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600">
          ${endGameText}
        </button>
      </div>
      
      <!-- 게임 진행 화면 -->
      <div id="scramble-game" class="text-center">
        <div class="mb-4">
          <h3 class="text-lg font-bold mb-2">${hintText}: <span id="scramble-hint" class="text-purple-600"></span></h3>
          <p class="text-gray-600 text-sm">${arrangeLettersText}</p>
        </div>
        
        <div class="mb-6">
          <div id="scramble-container" class="flex flex-wrap justify-center gap-2 mb-4 min-h-[60px] p-4 border-2 border-gray-300 rounded-lg"></div>
          <div class="text-sm text-gray-500 mb-2">${answerInputText}</div>
          <div id="scramble-answer" class="flex flex-wrap justify-center gap-1 min-h-[60px] p-4 border-2 border-purple-300 rounded-lg bg-purple-50" data-correct=""></div>
        </div>
        
        <div class="flex justify-center space-x-4">
          <button id="check-scramble" class="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600">
            ${checkText}
          </button>
          <button id="reset-scramble" class="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600">
            ${resetArrangementText}
          </button>
          <button id="skip-scramble" class="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600">
            ${nextProblemText}
          </button>
        </div>
      </div>
      
      <!-- 게임 결과 화면 -->
      <div id="scramble-results" class="hidden">
        <div class="bg-white rounded-lg shadow-md p-8 text-center">
          <div class="mb-6">
            <i class="fas fa-trophy text-6xl text-yellow-500 mb-4"></i>
            <h2 class="text-2xl font-bold text-gray-800 mb-2">${gameCompletedText}</h2>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div class="bg-green-50 p-4 rounded-lg">
              <div class="text-3xl font-bold text-green-600" id="scramble-final-score">0</div>
              <div class="text-sm text-gray-600">${scoreText}</div>
            </div>
            
            <div class="bg-blue-50 p-4 rounded-lg">
              <div class="text-3xl font-bold text-blue-600" id="scramble-accuracy">0%</div>
              <div class="text-sm text-gray-600">${accuracyText}</div>
            </div>
            
            <div class="bg-purple-50 p-4 rounded-lg">
              <div class="text-3xl font-bold text-purple-600" id="scramble-time">00:00</div>
              <div class="text-sm text-gray-600">${timeTakenText}</div>
            </div>
          </div>
          
          <div class="space-x-4">
            <button 
              id="retry-scramble-btn"
              class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              다시 도전
            </button>
            
            <button 
              id="new-scramble-btn"
              class="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
            >
              새 게임
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  score = 0;
  currentScrambleWordIndex = 0;

  // 버튼 이벤트 리스너들
  const checkBtn = container.querySelector("#check-scramble");
  if (checkBtn) {
    checkBtn.addEventListener("click", checkScrambleAnswer);
  }

  const resetBtn = container.querySelector("#reset-scramble");
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      // 기존 메시지들 제거
      const wrongMessage = document.getElementById("scramble-wrong-message");
      const correctMessage = document.getElementById(
        "scramble-correct-message"
      );
      if (wrongMessage) wrongMessage.remove();
      if (correctMessage) correctMessage.remove();

      // 답안 영역의 글자들을 원래 자리로 되돌리기
      resetScrambleLettersToOriginalPosition();
    });
  }

  // 다시 시작 버튼 이벤트
  const restartBtn = container.querySelector("#scramble-end");
  if (restartBtn) {
    restartBtn.addEventListener("click", () => {
      completeGame(score);
    });
  }

  // 다시 도전 버튼 이벤트
  const retryBtn = container.querySelector("#retry-scramble-btn");
  if (retryBtn) {
    retryBtn.addEventListener("click", () => {
      // 결과 화면 숨기고 게임 화면 보이기
      container.querySelector("#scramble-results").classList.add("hidden");
      container.querySelector("#scramble-game").classList.remove("hidden");

      // 헤더 부분도 다시 보이기
      const headerArea = container.querySelector(
        ".flex.justify-between.items-center"
      );
      if (headerArea) {
        headerArea.classList.remove("hidden");
      }

      // 게임 재시작
      initWordScrambleGame(container);
    });
  }

  // 새 게임 버튼 이벤트
  const newGameBtn = container.querySelector("#new-scramble-btn");
  if (newGameBtn) {
    newGameBtn.addEventListener("click", () => {
      backToGameSelection();
    });
  }

  // 타이머 시작
  startTimer("scramble-timer", 60, () => {
    completeGame(score, 60);
  });

  // 첫 번째 단어 표시
  showNextScrambleWord();

  // 다음 문제 스킵 버튼 이벤트 리스너 추가
  const skipBtn = container.querySelector("#skip-scramble");
  if (skipBtn) {
    skipBtn.addEventListener("click", () => {
      // 기존 메시지들 제거
      const wrongMessage = document.getElementById("scramble-wrong-message");
      const correctMessage = document.getElementById(
        "scramble-correct-message"
      );
      if (wrongMessage) wrongMessage.remove();
      if (correctMessage) correctMessage.remove();

      // 다음 문제로 넘어가기
      currentScrambleWordIndex++;
      showNextScrambleWord();

      console.log("🔤 단어 섞기 - 문제 스킵됨");
    });
  }
}

// 다음 단어 섞기 문제 표시
function showNextScrambleWord() {
  console.log("🔤 단어 섞기 - 다음 단어 표시:", {
    currentScrambleWordIndex,
    gameWordsLength: gameWords.length,
    gameWords: gameWords.slice(0, 2), // 처음 2개만 로그
  });

  // 기존 메시지들 제거 (새 문제 시작)
  const existingWrongMessage = document.getElementById(
    "scramble-wrong-message"
  );
  const existingCorrectMessage = document.getElementById(
    "scramble-correct-message"
  );
  if (existingWrongMessage) existingWrongMessage.remove();
  if (existingCorrectMessage) existingCorrectMessage.remove();

  // 자동 확인 타이머 해제 (새 문제 시작)
  clearAutoCheckTimer();

  if (gameWords.length === 0) {
    console.error("❌ gameWords가 비어있습니다! 게임을 중단합니다.");
    alert("게임에 필요한 단어를 불러올 수 없습니다. 다시 시도해주세요.");
    backToGameSelection();
    return;
  }

  if (currentScrambleWordIndex >= gameWords.length) {
    completeGame(score);
    return;
  }

  const currentWord = gameWords[currentScrambleWordIndex];
  const targetWord = getWordByLanguage(currentWord, targetLanguage);
  const sourceWord = getWordByLanguage(currentWord, sourceLanguage);

  console.log(
    "단어 섞기: 현재 단어",
    currentWord,
    "목표:",
    targetWord,
    "힌트:",
    sourceWord
  );

  // 힌트 표시 (원본 언어)
  const hintElement = document.getElementById("scramble-hint");
  if (hintElement) {
    hintElement.textContent = sourceWord;
  }

  // 정답 저장
  const answerContainer = document.getElementById("scramble-answer");
  if (answerContainer) {
    answerContainer.setAttribute("data-correct", targetWord);
  }

  // 글자들을 섞어서 표시
  const scrambleContainer = document.getElementById("scramble-container");
  if (scrambleContainer) {
    scrambleContainer.innerHTML = "";

    const letters = targetWord.split("").sort(() => 0.5 - Math.random());
    letters.forEach((letter, index) => {
      const letterBtn = document.createElement("button");
      letterBtn.className =
        "letter-btn bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition-colors";
      letterBtn.textContent = letter;
      letterBtn.addEventListener("click", () => {
        moveLetter(letterBtn, document.getElementById("scramble-answer"));
      });
      scrambleContainer.appendChild(letterBtn);
    });
  }

  // 답안 영역 초기화 (이전 문제 입력 제거)
  if (answerContainer) {
    answerContainer.innerHTML = "";
  }
}

// 글자 이동 함수
function moveLetter(letterBtn, targetContainer) {
  if (targetContainer && letterBtn) {
    // 기존 이벤트 리스너 제거
    const newLetterBtn = letterBtn.cloneNode(true);
    letterBtn.parentNode.replaceChild(newLetterBtn, letterBtn);

    // 새로운 이벤트 리스너 추가
    newLetterBtn.addEventListener("click", () => {
      const scrambleContainer = document.getElementById("scramble-container");
      const answerContainer = document.getElementById("scramble-answer");

      if (newLetterBtn.parentNode === scrambleContainer) {
        // 섞기 영역에서 답안 영역으로
        moveLetter(newLetterBtn, answerContainer);
      } else if (newLetterBtn.parentNode === answerContainer) {
        // 답안 영역에서 섞기 영역으로
        moveLetter(newLetterBtn, scrambleContainer);
      }
    });

    targetContainer.appendChild(newLetterBtn);

    // 답안 영역으로 이동했을 때 자동 확인 체크
    if (targetContainer.id === "scramble-answer") {
      checkAutoComplete();
    } else {
      // 답안 영역에서 나갔을 때 자동 확인 타이머 해제
      clearAutoCheckTimer();
    }
  }
}

// 모든 글자가 입력되었는지 확인하고 자동으로 정답 확인하는 함수
function checkAutoComplete() {
  const answerContainer = document.getElementById("scramble-answer");
  const correctAnswer = answerContainer.getAttribute("data-correct");

  if (answerContainer && correctAnswer) {
    const currentAnswer = Array.from(answerContainer.querySelectorAll("button"))
      .map((btn) => btn.textContent)
      .join("");

    // 모든 글자가 입력되었는지 확인
    if (currentAnswer.length === correctAnswer.length) {
      console.log("🔤 모든 글자 입력 완료 - 2초 후 자동 정답 확인");

      // 기존 타이머가 있으면 제거
      clearAutoCheckTimer();

      // 2초 후 자동으로 정답 확인
      autoCheckTimer = setTimeout(() => {
        checkScrambleAnswer();
      }, 2000);
    } else {
      // 글자가 부족하면 자동 확인 타이머 해제
      clearAutoCheckTimer();
    }
  }
}

// 자동 확인 타이머 해제 함수
function clearAutoCheckTimer() {
  if (autoCheckTimer) {
    clearTimeout(autoCheckTimer);
    autoCheckTimer = null;
    console.log("🔤 자동 정답 확인 타이머 해제");
  }
}

// 단어 섞기 답안 확인
function checkScrambleAnswer() {
  // 자동 확인 타이머 해제 (수동 확인 시)
  clearAutoCheckTimer();

  const answerContainer = document.getElementById("scramble-answer");
  if (!answerContainer) return;

  const correctAnswer = answerContainer.getAttribute("data-correct");
  const userAnswer = Array.from(answerContainer.querySelectorAll("button"))
    .map((btn) => btn.textContent)
    .join("");

  if (userAnswer === correctAnswer) {
    // 정답
    score += 10;
    const scoreElement = document.getElementById("scramble-score");
    if (scoreElement) scoreElement.textContent = score;

    // 기존 메시지 제거
    const wrongMessage = document.getElementById("scramble-wrong-message");
    if (wrongMessage) {
      wrongMessage.remove();
    }

    // 정답 메시지 표시
    showScrambleCorrectMessage();

    // 성공 효과
    answerContainer.classList.add("bg-green-100", "border-green-500");
    setTimeout(() => {
      answerContainer.classList.remove("bg-green-100", "border-green-500");
      currentScrambleWordIndex++;
      showNextScrambleWord();
    }, 1500);
  } else {
    // 오답
    score = Math.max(0, score - 2);
    const scoreElement = document.getElementById("scramble-score");
    if (scoreElement) scoreElement.textContent = score;

    // 실패 효과
    answerContainer.classList.add("bg-red-100", "border-red-500");

    // 오답 메시지 표시
    showScrambleSkipOption();

    setTimeout(() => {
      answerContainer.classList.remove("bg-red-100", "border-red-500");
    }, 1000);
  }
}

// 단어 섞기 오답 메시지 표시
function showScrambleSkipOption() {
  // 기존 메시지가 있으면 제거
  const existingMessage = document.getElementById("scramble-wrong-message");
  if (existingMessage) {
    existingMessage.remove();
  }
  const existingCorrectMessage = document.getElementById(
    "scramble-correct-message"
  );
  if (existingCorrectMessage) {
    existingCorrectMessage.remove();
  }

  // 오답 메시지 HTML 생성
  const wrongAnswerHTML = `
    <div id="scramble-wrong-message" class="mt-4 mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-center">
      <div class="flex items-center justify-center">
        <i class="fas fa-times-circle text-red-500 mr-2"></i>
        <span class="text-sm font-medium text-red-700">오답입니다</span>
      </div>
    </div>
  `;

  // 버튼들 위쪽에 추가 (더 깔끔한 UI)
  const buttonsContainer = document.querySelector(
    ".flex.justify-center.space-x-4"
  );
  if (buttonsContainer) {
    buttonsContainer.insertAdjacentHTML("beforebegin", wrongAnswerHTML);

    // 2초 후 자동으로 답안 영역의 글자들을 원래 자리로 되돌리기 (메시지도 함께 제거됨)
    setTimeout(() => {
      resetScrambleLettersToOriginalPosition();
    }, 2000);
  }
}

// 답안 영역의 글자들을 원래 섞기 영역으로 되돌리는 함수
function resetScrambleLettersToOriginalPosition() {
  const scrambleContainer = document.getElementById("scramble-container");
  const answerContainer = document.getElementById("scramble-answer");

  if (scrambleContainer && answerContainer) {
    // 답안 영역의 모든 글자를 원래 자리로 이동
    const answerLetters = Array.from(
      answerContainer.querySelectorAll("button")
    );
    answerLetters.forEach((letter) => {
      // moveLetter 함수를 사용해서 이벤트 리스너도 함께 재설정
      moveLetter(letter, scrambleContainer);
    });

    // 오답 메시지도 동시에 제거
    const wrongMessage = document.getElementById("scramble-wrong-message");
    if (wrongMessage) {
      wrongMessage.remove();
    }

    // 자동 확인 타이머도 해제 (답안이 리셋되므로)
    clearAutoCheckTimer();

    console.log(
      "🔤 단어 섞기 - 답안 글자들을 원래 자리로 되돌림 + 메시지 제거"
    );
  }
}

// 메모리 게임 초기화
async function initMemoryGame(container) {
  console.log("메모리 게임 초기화");

  // 게임 상태 초기화
  memoryPairs = 0;
  canSelect = true;
  firstCard = null;
  secondCard = null;

  // 현재 언어 설정 가져오기
  const activeLanguage = await getActiveLanguage();

  console.log("🧠 메모리 게임 초기화:", {
    gameWordsLength: gameWords.length,
    sourceLanguage,
    targetLanguage,
    memoryPairs,
    activeLanguage,
  });

  if (gameWords.length === 0) {
    console.error("❌ gameWords가 비어있습니다! 게임을 중단합니다.");
    alert(
      getI18nText("insufficient_words_error", activeLanguage) ||
        "게임에 필요한 단어를 불러올 수 없습니다. 다시 시도해주세요."
    );
    backToGameSelection();
    return;
  }

  // 번역된 텍스트 가져오기
  const pairsFoundText =
    getI18nText("pairs_found", activeLanguage) || "발견한 쌍";
  const timeText = getI18nText("time", activeLanguage) || "시간";
  const secondsText = getI18nText("seconds", activeLanguage) || "초";
  const endGameText = getI18nText("end_game", activeLanguage) || "게임 종료";
  const findMatchingPairsText =
    getI18nText("find_matching_pairs", activeLanguage) ||
    "같은 의미의 카드 쌍을 찾아 매칭하세요";
  const gameCompletedText =
    getI18nText("game_completed", activeLanguage) || "게임 완료!";
  const scoreText = getI18nText("score", activeLanguage) || "점수";
  const accuracyText = getI18nText("accuracy", activeLanguage) || "정확도";
  const timeTakenText =
    getI18nText("time_taken", activeLanguage) || "소요 시간";
  const retryText = getI18nText("retry", activeLanguage) || "다시 도전";
  const newGameText = getI18nText("new_game", activeLanguage) || "새 게임";

  // 게임 HTML 생성
  container.innerHTML = `
    <div class="bg-white rounded-xl p-6 shadow-lg">
      <div class="flex justify-between items-center mb-6">
        <div class="flex items-center space-x-4">
          <div class="text-lg font-semibold">${pairsFoundText}: <span id="memory-pairs">0</span>/<span id="total-pairs">${gameWords.length}</span></div>
          <div class="text-lg font-semibold">${timeText}: <span id="memory-timer">90</span>${secondsText}</div>
        </div>
        <button id="memory-end" class="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600">
          ${endGameText}
        </button>
      </div>
      
      <!-- 게임 진행 화면 -->
      <div id="memory-game">
        <div class="text-center mb-4">
          <p class="text-gray-600">${findMatchingPairsText}</p>
        </div>
        
        <div id="memory-board" class="grid grid-cols-4 gap-4 justify-center max-w-2xl mx-auto"></div>
      </div>
      
      <!-- 게임 결과 화면 -->
      <div id="memory-results" class="hidden">
        <div class="bg-white rounded-lg shadow-md p-8 text-center">
          <div class="mb-6">
            <i class="fas fa-trophy text-6xl text-yellow-500 mb-4"></i>
            <h2 class="text-2xl font-bold text-gray-800 mb-2">${gameCompletedText}</h2>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div class="bg-green-50 p-4 rounded-lg">
              <div class="text-3xl font-bold text-green-600" id="memory-final-score">0</div>
              <div class="text-sm text-gray-600">${scoreText}</div>
            </div>
            
            <div class="bg-blue-50 p-4 rounded-lg">
              <div class="text-3xl font-bold text-blue-600" id="memory-accuracy">0%</div>
              <div class="text-sm text-gray-600">${accuracyText}</div>
            </div>
            
            <div class="bg-purple-50 p-4 rounded-lg">
              <div class="text-3xl font-bold text-purple-600" id="memory-time">00:00</div>
              <div class="text-sm text-gray-600">${timeTakenText}</div>
            </div>
          </div>
          
          <div class="space-x-4">
            <button 
              id="retry-memory-btn"
              class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              다시 도전
            </button>
            
            <button 
              id="new-memory-btn"
              class="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
            >
              새 게임
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  const gameBoard = container.querySelector("#memory-board");

  // 다시 시작 버튼 이벤트
  const restartBtn = container.querySelector("#memory-end");
  if (restartBtn) {
    restartBtn.addEventListener("click", () => {
      completeGame(memoryPairs * 10);
    });
  }

  // 다시 도전 버튼 이벤트
  const retryBtn = container.querySelector("#retry-memory-btn");
  if (retryBtn) {
    retryBtn.addEventListener("click", () => {
      // 결과 화면 숨기고 게임 화면 보이기
      container.querySelector("#memory-results").classList.add("hidden");
      container.querySelector("#memory-game").classList.remove("hidden");

      // 헤더 부분도 다시 보이기
      const headerArea = container.querySelector(
        ".flex.justify-between.items-center"
      );
      if (headerArea) {
        headerArea.classList.remove("hidden");
      }

      // 게임 재시작
      initMemoryGame(container);
    });
  }

  // 새 게임 버튼 이벤트
  const newGameBtn = container.querySelector("#new-memory-btn");
  if (newGameBtn) {
    newGameBtn.addEventListener("click", () => {
      backToGameSelection();
    });
  }

  // 카드 쌍 생성
  const cardPairs = [];

  gameWords.forEach((word, index) => {
    const sourceText = getWordByLanguage(word, sourceLanguage);
    const targetText = getWordByLanguage(word, targetLanguage);

    // 이모지 검출 단순화 - concept_info.unicode_emoji를 1순위로, 그 외에는 기본 이모지
    const wordEmoji = word.concept_info?.unicode_emoji || "📝";

    cardPairs.push({
      id: `${word.id}_source`,
      text: sourceText,
      pairId: word.id,
      emoji: wordEmoji,
      language: sourceLanguage,
      wordData: word,
    });
    cardPairs.push({
      id: `${word.id}_target`,
      text: targetText,
      pairId: word.id,
      emoji: wordEmoji,
      language: targetLanguage,
      wordData: word,
    });
  });

  // 카드 섞기
  const shuffledCards = cardPairs.sort(() => 0.5 - Math.random());

  // 카드 생성
  shuffledCards.forEach((cardData) => {
    const card = createMemoryCard(cardData);
    gameBoard.appendChild(card);
  });

  // 타이머 시작
  startTimer("memory-timer", 90, () => {
    completeGame(memoryPairs * 10, 90);
  });
}

// 메모리 카드 생성
function createMemoryCard(cardData) {
  const card = document.createElement("div");
  card.className =
    "memory-card rounded-lg cursor-pointer transition-all transform hover:scale-105";
  card.dataset.pairId = cardData.pairId;
  card.dataset.cardId = cardData.id;

  // 카드 전체가 뒤집히도록 스타일 설정
  card.style.transformStyle = "preserve-3d";
  card.style.transition = "transform 0.6s";
  card.style.minHeight = "90px"; // 자연스러운 최소 높이만 설정

  // 이모지 검출 단순화 - 이미 initMemoryGame에서 설정된 이모지 사용
  const cardEmoji = cardData.emoji;

  card.innerHTML = `
    <div class="card-front" style="position: absolute; width: 100%; height: 100%; backface-visibility: hidden; transform: rotateY(180deg);">
      <div class="flex flex-col items-center justify-center bg-blue-50 text-gray-800 rounded-lg h-full p-2 min-h-[90px] border border-blue-200">
        <div class="text-lg sm:text-xl mb-1">${cardEmoji}</div>
        <span class="text-xs sm:text-sm font-semibold text-center leading-tight break-words max-w-full overflow-hidden">${cardData.text}</span>
      </div>
    </div>
    <div class="card-back" style="position: absolute; width: 100%; height: 100%; backface-visibility: hidden;">
      <div class="flex items-center justify-center bg-gray-300 text-gray-700 rounded-lg h-full p-2 min-h-[90px] hover:bg-gray-400">
        <span class="text-lg sm:text-2xl">❓</span>
        </div>
      </div>
    `;

  card.addEventListener("click", () => flipMemoryCard(card));

  return card;
}

// 메모리 카드 뒤집기
function flipMemoryCard(card) {
  if (
    !canSelect ||
    card.classList.contains("flipped") ||
    card.classList.contains("matched")
  ) {
    return;
  }

  // 카드 전체 뒤집기 애니메이션 효과
  card.style.transform = "rotateY(180deg)";
  card.classList.add("flipped");

  if (!firstCard) {
    firstCard = card;
  } else if (!secondCard) {
    secondCard = card;
    canSelect = false;
    setTimeout(() => checkMemoryMatch(), 1000);
  }
}

// 메모리 카드 매칭 확인
function checkMemoryMatch() {
  // null 체크 추가
  if (!firstCard || !secondCard) {
    console.error("❌ 카드가 null입니다:", { firstCard, secondCard });
    firstCard = null;
    secondCard = null;
    canSelect = true;
    return;
  }

  const firstPairId = firstCard.dataset.pairId;
  const secondPairId = secondCard.dataset.pairId;

  if (firstPairId === secondPairId) {
    // 매칭 성공

    // 매칭 성공한 카드들의 배경색 변경
    const firstCardBack = firstCard.querySelector(".card-back > div");
    const firstCardFront = firstCard.querySelector(".card-front > div");
    const secondCardBack = secondCard.querySelector(".card-back > div");
    const secondCardFront = secondCard.querySelector(".card-front > div");

    if (firstCardBack)
      firstCardBack.className = firstCardBack.className
        .replace("bg-gray-300", "bg-green-200")
        .replace("text-gray-700", "text-green-800");
    if (firstCardFront)
      firstCardFront.className = firstCardFront.className
        .replace("bg-blue-50", "bg-green-200")
        .replace("text-gray-800", "text-green-800")
        .replace("border-blue-200", "border-green-300");
    if (secondCardBack)
      secondCardBack.className = secondCardBack.className
        .replace("bg-gray-300", "bg-green-200")
        .replace("text-gray-700", "text-green-800");
    if (secondCardFront)
      secondCardFront.className = secondCardFront.className
        .replace("bg-blue-50", "bg-green-200")
        .replace("text-gray-800", "text-green-800")
        .replace("border-blue-200", "border-green-300");

    firstCard.classList.add("matched");
    secondCard.classList.add("matched");

    memoryPairs++;
    const pairsElement = document.getElementById("memory-pairs");
    if (pairsElement) pairsElement.textContent = memoryPairs;

    // 모든 쌍을 찾았는지 확인
    if (memoryPairs === gameWords.length) {
      setTimeout(() => {
        completeGame(memoryPairs * 10);
      }, 500);
    }

    // 상태 초기화 (매칭 성공 시 바로)
    firstCard = null;
    secondCard = null;
    canSelect = true;
  } else {
    // 매칭 실패 - 카드 다시 뒤집기

    setTimeout(() => {
      // null 체크 추가 (카드가 중간에 제거될 수 있음)
      if (firstCard && firstCard.parentNode) {
        firstCard.style.transform = "rotateY(0deg)";
        firstCard.classList.remove("flipped");
      }

      if (secondCard && secondCard.parentNode) {
        secondCard.style.transform = "rotateY(0deg)";
        secondCard.classList.remove("flipped");
      }

      console.log("🔄 카드 뒤집기 완료");

      // 상태 초기화 (매칭 실패 시 지연 후)
      firstCard = null;
      secondCard = null;
      canSelect = true;
    }, 500); // 0.5초 후 카드를 뒤집습니다
  }
}

// 단어 섞기 정답 메시지 표시
function showScrambleCorrectMessage() {
  // 기존 메시지가 있으면 제거
  const existingMessage = document.getElementById("scramble-correct-message");
  if (existingMessage) {
    existingMessage.remove();
  }

  // 정답 메시지 HTML 생성
  const correctAnswerHTML = `
    <div id="scramble-correct-message" class="mt-4 mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-center">
      <div class="flex items-center justify-center">
        <i class="fas fa-check-circle text-green-500 mr-2"></i>
        <span class="text-sm font-medium text-green-700">정답입니다</span>
      </div>
    </div>
  `;

  // 버튼들 위쪽에 추가 (더 깔끔한 UI)
  const buttonsContainer = document.querySelector(
    ".flex.justify-center.space-x-4"
  );
  if (buttonsContainer) {
    buttonsContainer.insertAdjacentHTML("beforebegin", correctAnswerHTML);

    // 1.5초 후 자동으로 정답 메시지 제거
    setTimeout(() => {
      const correctMessage = document.getElementById(
        "scramble-correct-message"
      );
      if (correctMessage) {
        correctMessage.remove();
      }
    }, 1500);
  }
}

// ======== 이벤트 리스너 초기화 ========

// 페이지 로드 완료 후 초기화
document.addEventListener("DOMContentLoaded", async () => {
  try {
    console.log("게임 페이지 초기화 시작");

    // 언어 설정 로드
    loadLanguageSettings();
    setupLanguageSelectors();

    // 게임 카드 설정
    setupGameCards();

    // "게임 선택으로 돌아가기" 버튼 이벤트
    const backButton = document.getElementById("back-to-games");
    if (backButton) {
      backButton.addEventListener("click", backToGameSelection);
    }

    // 사용자 인증 상태 체크
    onAuthStateChanged(auth, (user) => {
      currentUser = user;
      if (user) {
        loadGameStats();
      } else {
        console.log("사용자 로그아웃 상태");
      }
    });

    // Firebase 읽기 카운터 초기화
    firebaseReadCount = 0;
    console.log("🔄 Firebase 읽기 카운터 초기화");

    console.log("게임 페이지 초기화 완료");
  } catch (error) {
    console.error("게임 페이지 초기화 오류:", error);
  }
});

// 단어 섞기 게임 결과 표시 (인라인)
async function showWordScrambleResults(results) {
  const gameContainer = document.querySelector("#word-scramble-container");
  if (!gameContainer) return;

  // 현재 언어 설정 가져오기
  const activeLanguage = await getActiveLanguage();

  // 헤더 부분 숨기기
  const headerArea = gameContainer.querySelector(
    ".flex.justify-between.items-center"
  );
  if (headerArea) {
    headerArea.classList.add("hidden");
  }

  // 게임 진행 화면 숨기기
  const gameArea = gameContainer.querySelector("#scramble-game");
  if (gameArea) {
    gameArea.classList.add("hidden");
  }

  // 결과 화면 보이기
  const resultsArea = gameContainer.querySelector("#scramble-results");
  if (resultsArea) {
    resultsArea.classList.remove("hidden");

    // 결과 데이터 업데이트
    const scoreElement = resultsArea.querySelector("#scramble-final-score");
    const accuracyElement = resultsArea.querySelector("#scramble-accuracy");
    const timeElement = resultsArea.querySelector("#scramble-time");

    if (scoreElement) scoreElement.textContent = results.finalScore;
    if (accuracyElement) accuracyElement.textContent = `${results.accuracy}%`;
    if (timeElement) {
      const minutes = Math.floor(results.totalTime / 60);
      const seconds = results.totalTime % 60;
      timeElement.textContent = `${minutes
        .toString()
        .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    }

    // 성과 메시지 업데이트
    const titleElement = resultsArea.querySelector("h2");
    if (titleElement) {
      let message =
        getI18nText("game_completed", activeLanguage) || "게임 완료!";
      if (results.accuracy >= 90) {
        message = `🎉 ${getI18nText("perfect", activeLanguage) || "완벽해요!"}`;
      } else if (results.accuracy >= 80) {
        message = `👏 ${
          getI18nText("great_job", activeLanguage) || "잘했어요!"
        }`;
      } else if (results.accuracy >= 70) {
        message = `👍 ${getI18nText("good", activeLanguage) || "괜찮아요!"}`;
      } else {
        message = `💪 ${
          getI18nText("try_again", activeLanguage) || "다시 도전!"
        }`;
      }
      titleElement.textContent = message;
    }

    console.log("✅ 단어 섞기 게임 결과 화면 표시 완료");
  }
}

// 단어 기억 게임 결과 표시 (인라인)
async function showMemoryGameResults(results) {
  const gameContainer = document.querySelector("#memory-game-container");
  if (!gameContainer) return;

  // 현재 언어 설정 가져오기
  const activeLanguage = await getActiveLanguage();

  // 헤더 부분 숨기기
  const headerArea = gameContainer.querySelector(
    ".flex.justify-between.items-center"
  );
  if (headerArea) {
    headerArea.classList.add("hidden");
  }

  // 게임 진행 화면 숨기기
  const gameArea = gameContainer.querySelector("#memory-game");
  if (gameArea) {
    gameArea.classList.add("hidden");
  }

  // 결과 화면 보이기
  const resultsArea = gameContainer.querySelector("#memory-results");
  if (resultsArea) {
    resultsArea.classList.remove("hidden");

    // 결과 데이터 업데이트
    const scoreElement = resultsArea.querySelector("#memory-final-score");
    const accuracyElement = resultsArea.querySelector("#memory-accuracy");
    const timeElement = resultsArea.querySelector("#memory-time");

    if (scoreElement) scoreElement.textContent = results.finalScore;
    if (accuracyElement) accuracyElement.textContent = `${results.accuracy}%`;
    if (timeElement) {
      const minutes = Math.floor(results.totalTime / 60);
      const seconds = results.totalTime % 60;
      timeElement.textContent = `${minutes
        .toString()
        .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    }

    // 성과 메시지 업데이트
    const titleElement = resultsArea.querySelector("h2");
    if (titleElement) {
      let message =
        getI18nText("game_completed", activeLanguage) || "게임 완료!";
      if (results.accuracy >= 90) {
        message = `🎉 ${getI18nText("perfect", activeLanguage) || "완벽해요!"}`;
      } else if (results.accuracy >= 80) {
        message = `👏 ${
          getI18nText("great_job", activeLanguage) || "잘했어요!"
        }`;
      } else if (results.accuracy >= 70) {
        message = `👍 ${getI18nText("good", activeLanguage) || "괜찮아요!"}`;
      } else {
        message = `💪 ${
          getI18nText("try_again", activeLanguage) || "다시 도전!"
        }`;
      }
      titleElement.textContent = message;
    }

    console.log("✅ 단어 기억 게임 결과 화면 표시 완료");
  }
}
