import { auth, db, conceptUtils } from "../../js/firebase/firebase-init.js";
import { CollectionManager } from "../../js/firebase/firebase-collection-manager.js";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  Timestamp,
  startAfter,
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";

// 전역 변수
let currentUser = null;
let userProgressData = null;
let collectionManager = new CollectionManager();
let learningGoals = {
  daily: {
    newWords: 10,
    quizTime: 20,
  },
  weekly: {
    studyDays: 5,
    masteryGoal: 30,
  },
};
let charts = {};

// DOM 요소들
let elements = {};

// 페이지 초기화
document.addEventListener("DOMContentLoaded", async () => {
  try {
    console.log("📊 학습 진도 페이지 초기화 시작");

    // 네비게이션바 로드
    try {
      const navbarContainer = document.getElementById("navbar-container");
      if (navbarContainer) {
        const userLanguage = localStorage.getItem("userLanguage") || "ko";
        const response = await fetch(
          `../../locales/${userLanguage}/navbar.html`
        );
        if (response.ok) {
          const navbarHTML = await response.text();
          navbarContainer.innerHTML = navbarHTML;
          console.log("네비게이션바 로드 완료");
        } else {
          console.error("네비게이션바 로드 실패:", response.status);
        }
      } else {
        console.warn("네비게이션바 컨테이너를 찾을 수 없습니다.");
      }
    } catch (error) {
      console.error("네비게이션바 로드 오류:", error);
    }

    // DOM 요소 초기화
    initializeElements();

    // 이벤트 리스너 등록
    registerEventListeners();

    // 언어 시스템 초기화
    await initializeLanguageSystem();

    console.log("✅ 학습 진도 페이지 초기화 완료");
  } catch (error) {
    console.error("❌ 학습 진도 페이지 초기화 중 오류:", error);
    showError("페이지 초기화 중 오류가 발생했습니다.");
  }
});

// DOM 요소 초기화
function initializeElements() {
  elements = {
    // 통계 요약
    totalWordsCount: document.getElementById("total-words-count"),
    masteredWordsCount: document.getElementById("mastered-words-count"),
    studyStreakCount: document.getElementById("study-streak-count"),
    quizAccuracyRate: document.getElementById("quiz-accuracy-rate"),

    // 차트
    weeklyActivityChart: document.getElementById("weekly-activity-chart"),
    categoryProgressChart: document.getElementById("category-progress-chart"),

    // 언어별 마스터리
    koreanMasteryPercent: document.getElementById("korean-mastery-percent"),
    koreanMasteryBar: document.getElementById("korean-mastery-bar"),
    englishMasteryPercent: document.getElementById("english-mastery-percent"),
    englishMasteryBar: document.getElementById("english-mastery-bar"),
    japaneseMasteryPercent: document.getElementById("japanese-mastery-percent"),
    japaneseMasteryBar: document.getElementById("japanese-mastery-bar"),
    chineseMasteryPercent: document.getElementById("chinese-mastery-percent"),
    chineseMasteryBar: document.getElementById("chinese-mastery-bar"),

    // 최근 활동
    recentActivitiesList: document.getElementById("recent-activities-list"),

    // 🎮 성취도 요소들 추가
    totalQuizzesCount: document.getElementById("total-quizzes-count"),
    avgQuizAccuracy: document.getElementById("avg-quiz-accuracy"),
    totalGamesCount: document.getElementById("total-games-count"),
    avgGameScore: document.getElementById("avg-game-score"),
    totalLearningSessions: document.getElementById("total-learning-sessions"),
    avgSessionQuality: document.getElementById("avg-session-quality"),
    totalStudyTime: document.getElementById("total-study-time"),
    completionRate: document.getElementById("completion-rate"),

    // 학습 목표
    dailyWordsGoal: document.getElementById("daily-words-goal"),
    dailyQuizGoal: document.getElementById("daily-quiz-goal"),
    weeklyDaysGoal: document.getElementById("weekly-days-goal"),
    weeklyMasteryGoal: document.getElementById("weekly-mastery-goal"),
    saveGoalsBtn: document.getElementById("save-goals-btn"),

    // 목표 진행률
    dailyWordsProgress: document.getElementById("daily-words-progress"),
    dailyWordsBar: document.getElementById("daily-words-bar"),
    dailyQuizProgress: document.getElementById("daily-quiz-progress"),
    dailyQuizBar: document.getElementById("daily-quiz-bar"),
    weeklyDaysProgress: document.getElementById("weekly-days-progress"),
    weeklyDaysBar: document.getElementById("weekly-days-bar"),
    weeklyMasteryProgress: document.getElementById("weekly-mastery-progress"),
    weeklyMasteryBar: document.getElementById("weekly-mastery-bar"),
  };
}

// 이벤트 리스너 등록
function registerEventListeners() {
  // 네비게이션바 이벤트 설정 (햄버거 메뉴 등)
  if (typeof window.setupBasicNavbarEvents === "function") {
    window.setupBasicNavbarEvents();
    console.log("✅ 진도: 네비게이션바 이벤트 설정 완료");
  } else {
    console.warn("⚠️ setupBasicNavbarEvents 함수를 찾을 수 없습니다.");
  }

  // 목표 저장 버튼
  elements.saveGoalsBtn.addEventListener("click", saveUserGoals);

  // 📊 총 단어수 카드 클릭 이벤트 (전체 카드 영역)
  const totalWordsCard = document.getElementById("total-words-card");
  if (totalWordsCard) {
    totalWordsCard.addEventListener("click", showTotalWordsDetails);
    totalWordsCard.title = "클릭하여 단어 목록 상세 보기";
  }

  // 🏆 마스터한 단어 카드 클릭 이벤트 (전체 카드 영역)
  const masteredWordsCard = document.getElementById("mastered-words-card");
  if (masteredWordsCard) {
    masteredWordsCard.addEventListener("click", showMasteredWordsList);
    masteredWordsCard.title =
      "클릭하여 마스터한 단어 목록 및 마스터리 현황 보기";
  }

  // 🔥 연속 학습 카드 클릭 이벤트 (전체 카드 영역)
  const studyStreakCard = document.getElementById("study-streak-card");
  if (studyStreakCard) {
    studyStreakCard.addEventListener("click", showStudyStreakDetails);
    studyStreakCard.title = "클릭하여 연속 학습 현황 보기";
  }

  // 🎯 퀴즈 정확도 카드 클릭 이벤트 (전체 카드 영역)
  const quizAccuracyCard = document.getElementById("quiz-accuracy-card");
  if (quizAccuracyCard) {
    quizAccuracyCard.addEventListener("click", showQuizAccuracyDetails);
    quizAccuracyCard.title = "클릭하여 퀴즈 성과 상세 보기";
  }

  // 🎮 게임 통계 카드 클릭 이벤트
  const totalGamesCard = document.getElementById("total-games-card");
  if (totalGamesCard) {
    totalGamesCard.addEventListener("click", showGameStatsDetails);
    totalGamesCard.title = "클릭하여 게임 통계 상세 보기";
  }

  // 목표 입력 필드 변경 시 실시간 업데이트
  elements.dailyWordsGoal.addEventListener("input", updateDailyGoalsDisplay);
  elements.dailyQuizGoal.addEventListener("input", updateDailyGoalsDisplay);
  elements.weeklyDaysGoal.addEventListener("input", updateWeeklyGoalsDisplay);
  elements.weeklyMasteryGoal.addEventListener(
    "input",
    updateWeeklyGoalsDisplay
  );

  // 사용자 인증 상태 관찰
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      currentUser = user;
      await loadUserProgressData();
      await loadUserGoals();
      await displayAllData();

      // 🎮 게임 완료 상태 확인 및 자동 업데이트
      checkGameCompletionUpdate();

      // 📚 학습 완료 상태 확인 및 자동 업데이트
      checkLearningCompletionUpdate();

      // 📚 주기적으로 학습 완료 상태 확인 (30초마다)
      setInterval(() => {
        if (currentUser) {
          checkLearningCompletionUpdate();
        }
      }, 30000);

      // 📚 페이지 포커스 시 학습 완료 상태 확인
      window.addEventListener("focus", () => {
        if (currentUser) {
          console.log("📚 페이지 포커스 - 학습 완료 상태 확인");
          checkLearningCompletionUpdate();
        }
      });

      // 📚 페이지 가시성 변경 시 학습 완료 상태 확인
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible" && currentUser) {
          console.log("📚 페이지 가시성 변경 - 학습 완료 상태 확인");
          checkLearningCompletionUpdate();
        }
      });
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

// 언어 시스템 초기화
async function initializeLanguageSystem() {
  if (typeof applyLanguage === "function") {
    await applyLanguage();
  }
}

// 번역 함수
function getTranslatedText(key) {
  if (typeof window.translations === "object" && window.translations !== null) {
    const currentLang = localStorage.getItem("userLanguage") || "ko";
    return window.translations[currentLang]?.[key] || key;
  }
  return key;
}

// 사용자 진도 데이터 로드
async function loadUserProgressData() {
  try {
    console.log("📊 사용자 진도 데이터 로드 시작");

    if (!currentUser) {
      console.log("❌ 사용자가 로그인되지 않았습니다.");
      return;
    }

    // 기본 초기화
    userProgressData = {
      totalWords: 0,
      masteredWords: 0,
      studyStreak: 0,
      quizAccuracy: 0,
      languageMastery: {
        korean: 0,
        english: 0,
        japanese: 0,
        chinese: 0,
      },
      achievements: {
        totalQuizzes: 0,
        avgQuizAccuracy: 0,
        totalGames: 0,
        avgGameScore: 0,
        bestGameScore: 0,
        totalLearningSessions: 0,
        avgSessionQuality: 0,
        totalStudyTime: 0,
        completionRate: 0,
        averageAccuracy: 0, // 누락된 속성 추가
      },
      concepts: [], // 누락된 배열 추가
      recentActivities: [],
      categoryProgress: {}, // 카테고리별 진도 추가
      languageProgress: {
        // 동적으로 초기화됨 - 실제 학습한 언어만 추가
      },
      gameResults: [], // 게임 결과 배열 추가
    };

    // 상세 진도 데이터 로드
    await loadDetailedProgressData();

    // 🎮 게임 통계 로드
    await loadGameStats();

    // 📚 학습 완료 상태 확인 및 자동 업데이트
    checkLearningCompletionUpdate();

    // 🎮 게임 완료 상태 확인 및 자동 업데이트
    checkGameCompletionUpdate();
  } catch (error) {
    console.error("❌ 사용자 진도 데이터 로드 중 오류:", error);
  }
}

// 🎮 게임 통계 로드
async function loadGameStats() {
  try {
    console.log("🎮 게임 통계 로드 시작");

    if (!currentUser) return;

    // Firestore에서 게임 기록 로드 (records 컬렉션)
    const gameRecordsRef = collection(db, "game_records");
    const q = query(
      gameRecordsRef,
      where("user_email", "==", currentUser.email)
      // limit 제거하여 모든 게임 데이터 조회
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
          new Date(data.createdAt || Date.now()),
      });
    });

    console.log("📊 DB에서 조회된 게임 결과 수:", gameResults.length);

    // JavaScript에서 시간순 정렬 (최신순)
    gameResults.sort((a, b) => {
      if (!a.playedAt || !b.playedAt) return 0;
      return b.playedAt - a.playedAt;
    });

    // 게임 통계 계산
    const gameStats = calculateGameStats(gameResults);

    // 사용자 진도 데이터에 추가
    userProgressData.achievements.totalGames = gameStats.totalGames;
    userProgressData.achievements.avgGameScore = gameStats.avgScore;
    userProgressData.achievements.bestGameScore = gameStats.bestScore;
    userProgressData.gameResults = gameResults.slice(0, 20); // 최근 20개 저장 (표시용)

    console.log("✅ 게임 통계 로드 완료:", {
      ...gameStats,
      totalDataFromDB: gameResults.length,
      sampleGameData: gameResults.slice(0, 3),
    });
  } catch (error) {
    console.error("❌ 게임 통계 로드 중 오류:", error);
  }
}

// 🔄 게임 통계 실시간 새로고침 (게임 완료 후 호출)
async function refreshGameStats() {
  try {
    console.log("🔄 게임 통계 실시간 새로고침 시작");

    // 게임 통계 다시 로드
    await loadGameStats();

    // 성취도 표시 업데이트
    updateAchievements();

    // 차트도 새로고침 (게임 활동이 반영될 수 있음)
    createCharts();

    console.log("✅ 게임 통계 실시간 새로고침 완료");
  } catch (error) {
    console.error("❌ 게임 통계 새로고침 중 오류:", error);
  }
}

// 외부에서 호출 가능하도록 window 객체에 등록
window.refreshProgressGameStats = refreshGameStats;

// 📚 학습 통계 실시간 새로고침 (학습 완료 후 호출)
async function refreshLearningStats() {
  try {
    console.log("🔄 학습 통계 실시간 새로고침 시작");

    // 상세 진도 데이터 다시 로드
    await loadDetailedProgressData();

    // 📊 최근 활동 다시 로드 (새로운 학습 활동 반영)
    console.log("🔄 최근 활동 다시 로드 중...");
    userProgressData.recentActivities = await loadRecentActivities();
    console.log(
      "📊 최근 활동 로드 완료:",
      userProgressData.recentActivities.length,
      "개"
    );

    // 📊 활동 현황 요약 업데이트 (학습 효율, 연속 학습 포함)
    updateStatsSummary();

    // 성취도 표시 업데이트
    updateAchievements();

    // 언어별 마스터리 업데이트
    await updateLanguageMastery();

    // 최근 활동 표시 업데이트
    displayRecentActivities();

    // 차트도 새로고침 (학습 활동이 반영될 수 있음)
    createCharts();

    console.log(
      "✅ 학습 통계 실시간 새로고침 완료 (학습 효율, 연속 학습, 최근 활동 포함)"
    );
  } catch (error) {
    console.error("❌ 학습 통계 새로고침 중 오류:", error);
  }
}

// 외부에서 호출 가능하도록 window 객체에 등록
window.refreshProgressLearningStats = refreshLearningStats;

// 🎮 게임 완료 상태 확인 및 자동 업데이트
function checkGameCompletionUpdate() {
  try {
    const gameCompletionData = localStorage.getItem("gameCompletionUpdate");

    if (gameCompletionData) {
      const data = JSON.parse(gameCompletionData);

      // 현재 사용자의 게임 완료 데이터인지 확인
      if (data.userId === currentUser?.uid) {
        console.log("🎮 게임 완료 데이터 감지됨:", data);

        // 게임 통계 자동 업데이트 (팝업 없이)
        setTimeout(async () => {
          try {
            await refreshGameStats();
            console.log(
              "✅ 게임 완료 후 진도 페이지 자동 업데이트 완료 (팝업 제거됨)"
            );
          } catch (error) {
            console.error("❌ 게임 완료 후 자동 업데이트 중 오류:", error);
          }
        }, 1000); // 1초 후 업데이트 (페이지 로딩 완료 후)

        // localStorage에서 제거 (한 번만 처리)
        localStorage.removeItem("gameCompletionUpdate");
        console.log("🗑️ 게임 완료 데이터 localStorage에서 제거");
      }
    }
  } catch (error) {
    console.error("❌ 게임 완료 상태 확인 중 오류:", error);
  }
}

// 📚 학습 완료 상태 확인 및 자동 업데이트
async function checkLearningCompletionUpdate() {
  try {
    const learningCompletionData = localStorage.getItem(
      "learningCompletionUpdate"
    );

    if (learningCompletionData) {
      const data = JSON.parse(learningCompletionData);

      // 현재 사용자의 학습 완료 데이터인지 확인
      if (data.userId === currentUser?.uid) {
        console.log("📚 학습 완료 데이터 감지됨:", data);

        // 학습 통계 자동 업데이트 (팝업 없이)
        console.log("📚 학습 완료 감지됨, 통계 새로고침 시작");
        setTimeout(async () => {
          try {
            console.log("🔄 학습 통계 새로고침 실행 중...");

            // 강제로 모든 데이터 다시 로드
            await loadDetailedProgressData();

            // 최신 활동 데이터 강제 다시 로드 (더 많은 시도)
            console.log("🔄 최신 활동 데이터 강제 다시 로드 시작");

            // 여러 번 시도하여 최신 데이터 확보
            let retryCount = 0;
            let latestActivities = [];

            while (retryCount < 3) {
              latestActivities = await loadRecentActivities();

              // 방금 완료한 학습이 포함되어 있는지 확인
              const hasRecentLearning = latestActivities.some(
                (activity) =>
                  activity.type === "learning" &&
                  activity.timestamp &&
                  new Date() -
                    (activity.timestamp.toDate
                      ? activity.timestamp.toDate()
                      : new Date(activity.timestamp)) <
                    300000 // 5분 이내
              );

              if (hasRecentLearning || retryCount >= 2) {
                break;
              }

              console.log(`🔄 최신 활동 재시도 중... (${retryCount + 1}/3)`);
              retryCount++;
              await new Promise((resolve) => setTimeout(resolve, 1000)); // 1초 대기
            }

            userProgressData.recentActivities = latestActivities;
            console.log(
              "🔄 최신 활동 데이터 로드 완료:",
              userProgressData.recentActivities?.length || 0,
              "개"
            );

            // 개념 데이터도 다시 로드하여 언어별 마스터리 정확히 계산
            console.log("🔄 개념 데이터 재로드 시작");
            if (currentUser) {
              const conceptsQuery = query(
                collection(db, "concepts"),
                where("user_email", "==", currentUser.email),
                limit(50)
              );
              const conceptsSnapshot = await getDocs(conceptsQuery);

              if (!userProgressData.concepts) {
                userProgressData.concepts = [];
              }

              // 새로운 개념 데이터로 업데이트
              userProgressData.concepts = conceptsSnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
              }));

              console.log(
                "🔄 개념 데이터 재로드 완료:",
                userProgressData.concepts.length,
                "개"
              );
            }

            // 모든 UI 요소 업데이트 (최근 활동을 먼저 업데이트)
            displayRecentActivities();
            updateStatsSummary();
            updateAchievements();
            await updateLanguageMastery(); // 언어별 마스터리도 업데이트
            createCharts();

            console.log("✅ 학습 완료 후 진도 페이지 자동 업데이트 완료");

            // 추가로 목표 진행률도 업데이트
            await updateGoalsProgress();
          } catch (error) {
            console.error("❌ 학습 완료 후 자동 업데이트 중 오류:", error);
          }
        }, 3000); // 3초 후 업데이트 (Firebase 데이터 동기화 충분히 대기)

        // localStorage에서 제거 (한 번만 처리)
        localStorage.removeItem("learningCompletionUpdate");
        console.log("🗑️ 학습 완료 데이터 localStorage에서 제거");
      }
    }
  } catch (error) {
    console.error("❌ 학습 완료 상태 확인 중 오류:", error);
  }
}

// 게임 타입 이름 변환 (진도 페이지용, 다국어 지원)
function getGameTypeName(gameType) {
  const userLanguage = localStorage.getItem("userLanguage") || "ko";

  const names = {
    "word-matching": {
      ko: "단어 맞추기",
      en: "Word Matching",
      ja: "単語マッチング",
      zh: "单词配对",
    },
    "word-scramble": {
      ko: "단어 섞기",
      en: "Word Scramble",
      ja: "単語並び替え",
      zh: "单词重组",
    },
    "memory-game": {
      ko: "단어 기억 게임",
      en: "Memory Game",
      ja: "記憶ゲーム",
      zh: "记忆游戏",
    },
    memory: {
      ko: "메모리 게임",
      en: "Memory Game",
      ja: "メモリーゲーム",
      zh: "记忆游戏",
    },
    pronunciation: {
      ko: "발음 게임",
      en: "Pronunciation Game",
      ja: "発音ゲーム",
      zh: "发音游戏",
    },
    spelling: {
      ko: "철자 게임",
      en: "Spelling Game",
      ja: "スペリングゲーム",
      zh: "拼写游戏",
    },
    matching: {
      ko: "매칭 게임",
      en: "Matching Game",
      ja: "マッチングゲーム",
      zh: "配对游戏",
    },
  };

  return names[gameType]?.[userLanguage] || names[gameType]?.ko || gameType;
}

// 게임 통계 계산
function calculateGameStats(gameResults) {
  if (!gameResults || gameResults.length === 0) {
    return {
      totalGames: 0,
      avgScore: 0,
      bestScore: 0,
      successRate: 0,
      gamesThisWeek: 0,
      avgAccuracy: 0,
    };
  }

  const scores = gameResults.map((game) => game.score || 0);
  const successes = gameResults.filter((game) => game.success === true).length;
  const accuracies = gameResults
    .filter((game) => game.accuracy != null)
    .map((game) => game.accuracy);

  // 이번 주 게임 수 계산
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const gamesThisWeek = gameResults.filter(
    (game) => game.playedAt && game.playedAt > oneWeekAgo
  ).length;

  return {
    totalGames: gameResults.length,
    avgScore:
      scores.length > 0
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : 0,
    bestScore: scores.length > 0 ? Math.max(...scores) : 0,
    successRate: Math.round((successes / gameResults.length) * 100),
    gamesThisWeek: gamesThisWeek,
    avgAccuracy:
      accuracies.length > 0
        ? Math.round(accuracies.reduce((a, b) => a + b, 0) / accuracies.length)
        : 0,
  };
}

// 기존 상세 진도 데이터 로드 (호환성 위해 유지)
async function loadDetailedProgressData() {
  try {
    // 1. 전체 개념 수 조회
    const allConceptsQuery = query(collection(db, "concepts"));
    const allConceptsSnapshot = await getDocs(allConceptsQuery);
    const totalConcepts = allConceptsSnapshot.size;

    // 1.5. 실제 학습한 언어 정보 수집
    const languageLearningQuery = query(
      collection(db, "learning_records"),
      where("user_email", "==", currentUser.email),
      limit(100) // DB 사용량 절약을 위해 축소
    );
    const languageLearningSnapshot = await getDocs(languageLearningQuery);

    // 개념별로 실제 학습한 언어들을 추적
    const conceptLanguageMap = new Map(); // concept_id -> Set of languages

    languageLearningSnapshot.docs.forEach((doc) => {
      const data = doc.data();

      // conceptIds 배열 또는 단일 concept_id 처리
      let conceptIds = [];
      if (data.conceptIds && Array.isArray(data.conceptIds)) {
        conceptIds = data.conceptIds;
      } else if (data.concept_id) {
        conceptIds = [data.concept_id];
      } else if (data.conceptId) {
        conceptIds = [data.conceptId];
      }

      const targetLanguage =
        data.targetLanguage || data.target_language || data.language;
      const sourceLanguage = data.sourceLanguage || data.source_language;

      // 메타데이터에서 언어 정보 추출
      const metadata = data.metadata || {};
      const metaTargetLang =
        metadata.targetLanguage || metadata.target_language;
      const metaSourceLang =
        metadata.sourceLanguage || metadata.source_language;

      // 학습 기록 디버그 (개념 ID가 있는 경우만)
      if (conceptIds.length > 0) {
        console.log("📚 학습 기록 확인:", {
          id: doc.id,
          conceptIds: conceptIds.slice(0, 3),
          targetLanguage: targetLanguage || metaTargetLang,
          sourceLanguage: sourceLanguage || metaSourceLang,
          conceptCount: conceptIds.length,
          activity_type: data.activity_type || data.type,
        });
      }

      // 각 개념에 대해 학습한 언어 정보 저장
      conceptIds.forEach((conceptId) => {
        if (!conceptLanguageMap.has(conceptId)) {
          conceptLanguageMap.set(conceptId, new Set());
        }
        const languageSet = conceptLanguageMap.get(conceptId);

        // target 언어와 source 언어 모두 추가 (학습 맥락에 따라)
        const finalTargetLang = targetLanguage || metaTargetLang;
        const finalSourceLang = sourceLanguage || metaSourceLang;

        if (finalTargetLang) languageSet.add(finalTargetLang);
        if (finalSourceLang) languageSet.add(finalSourceLang);

        // 기본 언어 추가 (언어 정보가 없는 경우)
        if (!finalTargetLang && !finalSourceLang) {
          languageSet.add("korean"); // 기본값으로 한국어 추가
        }
      });
    });

    console.log("🌐 개념별 학습 언어 정보:", {
      totalConcepts: conceptLanguageMap.size,
      sampleData: Array.from(conceptLanguageMap.entries())
        .slice(0, 5)
        .map(([conceptId, languages]) => ({
          conceptId,
          languages: Array.from(languages),
        })),
    });

    // 2. user_records 컬렉션에서 사용자의 모든 진도 데이터 조회
    const progressQuery = query(
      collection(db, "user_records"),
      where("user_email", "==", currentUser.email)
    );

    const progressSnapshot = await getDocs(progressQuery);
    let masteredCount = 0;
    const masteredConceptIds = new Set(); // 고유한 마스터된 개념 ID 추적

    // 진도 데이터 처리
    for (const doc of progressSnapshot.docs) {
      const data = doc.data();
      userProgressData.concepts.push({
        id: doc.id,
        ...data,
      });

      // 마스터된 개념 카운트 기준:
      // 1. 학습 레벨 50% 이상 (충분히 학습한 상태)
      // 2. 또는 노출 횟수 3회 이상 (반복 학습한 상태)
      const masteryLevel = data.overall_mastery?.level || 0;
      const exposureCount = data.overall_mastery?.exposure_count || 0;
      const studyCount = data.overall_mastery?.study_count || 0;

      const isMastered =
        masteryLevel >= 50 || exposureCount >= 3 || studyCount >= 3;

      if (isMastered) {
        masteredConceptIds.add(data.concept_id || doc.id);
      }

      // 언어별, 카테고리별 분류를 위한 개념 정보 처리
      const conceptId = data.concept_id || doc.id;
      const studiedLanguages = conceptLanguageMap.get(conceptId) || new Set();
      await processConceptProgress(data, userProgressData, studiedLanguages);
    }

    // 고유한 마스터된 개념 수 계산 (전체 개념 수를 초과하지 않도록 제한)
    masteredCount = Math.min(masteredConceptIds.size, totalConcepts);

    console.log("📊 마스터리 통계:", {
      totalConcepts,
      masteredCount,
      masteredConceptIds: Array.from(masteredConceptIds),
      progressSnapshot: progressSnapshot.size,
      rawMasteredCount: masteredConceptIds.size, // 원래 계산된 값
      completionRate:
        totalConcepts > 0
          ? Math.min(100, Math.round((masteredCount / totalConcepts) * 100))
          : 0,
      explanation:
        "완료율 기준: 학습 레벨 50% 이상 또는 노출/학습 횟수 3회 이상인 개념의 비율 (최대 100%)",
      masteryDetails: {
        basedOnLevel50: "학습 진도 50% 이상",
        basedOnExposure: "노출 횟수 3회 이상",
        basedOnStudyCount: "학습 횟수 3회 이상",
      },
    });

    // 3. 퀴즈 데이터 로드 및 정확도 계산
    const quizQuery = query(
      collection(db, "quiz_records"),
      where("user_email", "==", currentUser.email),
      limit(50)
    );
    const quizSnapshot = await getDocs(quizQuery);

    let totalQuizzes = 0;
    let totalCorrect = 0;
    let totalQuestions = 0;

    quizSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      totalQuizzes++;
      totalCorrect += data.correct_answers || 0;
      totalQuestions += data.total_questions || 0;
    });

    const avgQuizAccuracy =
      totalQuestions > 0
        ? Math.round((totalCorrect / totalQuestions) * 100)
        : 0;

    // 4. 학습 활동 데이터 로드
    const learningQuery = query(
      collection(db, "learning_records"),
      where("user_email", "==", currentUser.email),
      limit(100)
    );
    const learningSnapshot = await getDocs(learningQuery);

    // 학습 시간 및 품질 계산
    let totalStudyTime = 0;
    let avgSessionQuality = 0;
    let qualityCount = 0;
    let totalCorrectAnswers = 0;
    let totalInteractions = 0;
    let validLearningSessionsCount = 0; // 유효한 학습 세션 카운트

    learningSnapshot.docs.forEach((doc) => {
      const data = doc.data();

      // 유효한 학습 세션인지 확인 - 더 포괄적인 기준 적용
      const recordConceptsStudied = data.concepts_studied || 0;
      const recordSessionDuration = data.session_duration || 0;
      const recordInteractions = data.total_interactions || 0;
      const recordCorrectAnswers = data.correct_answers || 0;
      const activityType = data.activity_type || data.type || "unknown";

      // 각 학습 활동별로 다른 유효성 기준 적용
      let isValidSession = false;

      if (activityType === "vocabulary") {
        // 단어 학습: 플래시카드(concepts_studied), 타이핑(total_interactions)
        // 타이핑의 경우 concepts_studied가 0이어도 total_interactions나 correct_answers가 있으면 유효
        isValidSession =
          recordConceptsStudied > 0 ||
          recordInteractions > 0 ||
          recordCorrectAnswers > 0;
      } else if (activityType === "grammar") {
        // 문법 학습: 패턴분석(concepts_studied), 실습문제(total_interactions)
        // 실습문제의 경우 concepts_studied가 적어도 total_interactions나 correct_answers가 있으면 유효
        isValidSession =
          recordConceptsStudied > 0 ||
          recordInteractions > 0 ||
          recordCorrectAnswers > 0;
      } else if (activityType === "reading") {
        // 독해 학습: 예문학습과 플래시모드 모두 total_interactions 중심
        // concepts_studied가 0이어도 total_interactions나 correct_answers가 있으면 유효
        isValidSession =
          recordConceptsStudied > 0 ||
          recordInteractions > 0 ||
          recordCorrectAnswers > 0;
      } else {
        // 기타 활동: 기본 기준 (더 관대한 기준 적용)
        isValidSession =
          recordConceptsStudied > 0 ||
          recordSessionDuration > 0 ||
          recordInteractions > 0 ||
          recordCorrectAnswers > 0;
      }

      // 디버깅: 학습 기록 상세 정보 출력 (처음 50개만)
      if (learningSnapshot.docs.indexOf(doc) < 50) {
        console.log("📚 학습 기록 데이터:", {
          id: doc.id,
          user_email: data.user_email,
          type: data.type,
          activity_type: activityType,
          concepts_studied: recordConceptsStudied,
          session_duration: recordSessionDuration,
          correct_answers: recordCorrectAnswers,
          total_interactions: recordInteractions,
          completed_at: data.completed_at,
          isValid: isValidSession,
        });

        if (isValidSession) {
          console.log(
            `✅ 유효한 학습 세션 카운트: ${doc.id} (개념: ${recordConceptsStudied}, 시간: ${recordSessionDuration}, 상호작용: ${recordInteractions})`
          );
        } else {
          console.log(`❌ 무효한 학습 세션: ${doc.id} (모든 값이 0)`);
        }
      }

      if (isValidSession) {
        validLearningSessionsCount++;
      }

      // 학습 시간 계산 (session_duration이 0인 경우 최소값 적용)
      let adjustedSessionDuration = recordSessionDuration;
      if (adjustedSessionDuration === 0 && recordConceptsStudied > 0) {
        // 개념을 학습했다면 최소 1분으로 계산
        adjustedSessionDuration = 1;
      }
      totalStudyTime += adjustedSessionDuration;

      // 학습 품질 계산 (다양한 요소 고려)
      const conceptsStudied = recordConceptsStudied;
      const correctAnswers = data.correct_answers || 0;
      const sessionInteractions = data.total_interactions || conceptsStudied;

      // 이미 계산된 session_quality가 있으면 사용, 없으면 계산
      let sessionQuality = data.session_quality || 0;

      // 학습 품질 계산 데이터 디버깅 (처음 50개만)
      if (learningSnapshot.docs.indexOf(doc) < 50) {
        console.log("🔍 학습 품질 계산 데이터:", {
          conceptsStudied,
          sessionDuration: adjustedSessionDuration,
          correctAnswers,
          sessionInteractions,
          existingQuality: data.session_quality,
        });
      }

      if (
        sessionQuality === 0 &&
        (conceptsStudied > 0 || adjustedSessionDuration > 0)
      ) {
        // 1. 개념 수 점수 (30%) - 학습 범위
        const conceptScore = Math.min(30, conceptsStudied * 3);

        // 2. 집중도 점수 (30%) - 시간당 학습량
        let focusScore = 0;
        if (adjustedSessionDuration > 0) {
          const conceptsPerMinute = conceptsStudied / adjustedSessionDuration;
          focusScore = Math.min(30, conceptsPerMinute * 30);
        } else if (conceptsStudied > 0) {
          focusScore = 15; // 기본 집중도 점수
        }

        // 3. 정확도 점수 (30%) - 학습 효율성
        let accuracyScore = 0;
        if (sessionInteractions > 0 && correctAnswers >= 0) {
          const accuracy = correctAnswers / sessionInteractions;
          accuracyScore = accuracy * 30;
        } else if (conceptsStudied > 0) {
          accuracyScore = 15; // 기본 정확도 점수
        }

        // 4. 상호작용 보너스 (10%) - 실제 참여도
        let interactionBonus = 0;
        if (sessionInteractions > conceptsStudied) {
          interactionBonus = Math.min(
            10,
            (sessionInteractions - conceptsStudied) * 0.5
          );
        }

        sessionQuality = Math.min(
          100,
          conceptScore + focusScore + accuracyScore + interactionBonus
        );

        // 세션 품질 계산 디버깅 (처음 10개만)
        if (learningSnapshot.docs.indexOf(doc) < 10 && sessionQuality > 0) {
          console.log(
            `📊 세션 품질 계산: 개념(${conceptScore}) + 집중도(${focusScore.toFixed(
              1
            )}) + 정확도(${accuracyScore.toFixed(
              1
            )}) + 상호작용(${interactionBonus.toFixed(
              1
            )}) = ${sessionQuality.toFixed(1)}점 (최대: 100점)`
          );
        }
      }

      // 모든 세션의 품질 점수를 누적 (평균 계산을 위해)
      if (sessionQuality > 0) {
        avgSessionQuality += sessionQuality;
        qualityCount++;
      }

      // 전체 정확도와 상호작용 수 누적
      totalCorrectAnswers += correctAnswers;
      totalInteractions += sessionInteractions;
    });

    // 퀴즈 시간도 추가
    quizSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      totalStudyTime += data.time_spent || 0;
    });

    // 누적 학습 효율 계산 (단순 평균이 아닌 종합 평가)
    if (qualityCount > 0) {
      // 기존 방식: 단순 평균
      const simpleAverage = avgSessionQuality / qualityCount;

      // 새로운 방식: 누적 학습 효율 (전체 학습 성과 종합 평가)
      // 1. 전체 학습 시간 대비 학습량
      const totalLearningEfficiency =
        totalStudyTime > 0
          ? ((learningSnapshot.size * 10) / totalStudyTime) * 100
          : 0; // 학습 세션당 10점 기준

      // 2. 정확도 기반 효율
      const accuracyEfficiency =
        totalInteractions > 0
          ? (totalCorrectAnswers / totalInteractions) * 100
          : 0;

      // 3. 마스터리 기반 효율 (100%를 초과하지 않도록 제한)
      const masteryEfficiency =
        totalConcepts > 0
          ? Math.min(100, (masteredCount / totalConcepts) * 100)
          : 0;

      // 종합 학습 효율 계산 (가중 평균) - 더 현실적인 가중치로 조정
      const weightedEfficiency =
        simpleAverage * 0.6 + // 기존 세션 품질 (60%)
        accuracyEfficiency * 0.25 + // 정확도 효율 (25%)
        masteryEfficiency * 0.15; // 마스터리 효율 (15%)

      avgSessionQuality = Math.round(Math.min(100, weightedEfficiency));

      console.log("📊 누적 학습 효율 계산:", {
        simpleAverage: Math.round(simpleAverage),
        totalLearningEfficiency: Math.round(totalLearningEfficiency),
        accuracyEfficiency: Math.round(accuracyEfficiency),
        masteryEfficiency: Math.round(masteryEfficiency),
        weightedEfficiency: Math.round(weightedEfficiency),
        finalEfficiency: avgSessionQuality,
        calculation: {
          sessionQuality: `${Math.round(simpleAverage)} × 0.6 = ${(
            simpleAverage * 0.6
          ).toFixed(1)}`,
          accuracy: `${Math.round(accuracyEfficiency)} × 0.25 = ${(
            accuracyEfficiency * 0.25
          ).toFixed(1)}`,
          mastery: `${Math.round(masteryEfficiency)} × 0.15 = ${(
            masteryEfficiency * 0.15
          ).toFixed(1)}`,
          total: `${(simpleAverage * 0.6).toFixed(1)} + ${(
            accuracyEfficiency * 0.25
          ).toFixed(1)} + ${(masteryEfficiency * 0.15).toFixed(
            1
          )} = ${weightedEfficiency.toFixed(1)}`,
        },
      });
    } else {
      avgSessionQuality = 0;
    }

    // 완료율 계산 (100%를 초과하지 않도록 제한)
    const completionRate =
      totalConcepts > 0
        ? Math.min(100, Math.round((masteredCount / totalConcepts) * 100))
        : 0;

    // 통계 계산 및 설정
    userProgressData.totalConcepts = totalConcepts;
    userProgressData.studiedConcepts = progressSnapshot.size;
    userProgressData.masteredConcepts = masteredCount;
    userProgressData.totalWords = totalConcepts; // 호환성을 위해
    userProgressData.masteredWords = masteredCount; // 호환성을 위해
    userProgressData.quizAccuracy = avgQuizAccuracy;

    // 게임 통계 로드 및 계산
    const gameQuery = query(
      collection(db, "game_records"),
      where("user_email", "==", currentUser.email),
      limit(100)
    );
    const gameSnapshot = await getDocs(gameQuery);

    const gameStats = calculateGameStats(
      gameSnapshot.docs.map((doc) => doc.data())
    );

    // 성취도 데이터 업데이트 (유효한 학습 세션 수 사용)
    userProgressData.achievements.totalQuizzes = totalQuizzes;
    userProgressData.achievements.avgQuizAccuracy = avgQuizAccuracy;
    userProgressData.achievements.totalGames = gameStats.totalGames;
    userProgressData.achievements.avgGameScore = gameStats.avgScore;
    userProgressData.achievements.totalLearningSessions =
      validLearningSessionsCount; // 유효한 세션만 카운트
    userProgressData.achievements.avgSessionQuality = avgSessionQuality;
    userProgressData.achievements.totalStudyTime = Math.round(totalStudyTime);
    userProgressData.achievements.completionRate = completionRate;
    userProgressData.achievements.averageAccuracy = avgQuizAccuracy;

    console.log("📊 학습 세션 통계:", {
      totalLearningSessions: validLearningSessionsCount, // 유효한 세션 수
      totalRawRecords: learningSnapshot.size, // 전체 기록 수
      avgSessionQuality,
      totalStudyTime: Math.round(totalStudyTime),
      learningRecordsCount: learningSnapshot.docs.length,
      sessionsByType: {
        vocabulary: learningSnapshot.docs.filter(
          (doc) =>
            doc.data().type === "vocabulary" ||
            doc.data().activity_type === "vocabulary"
        ).length,
        grammar: learningSnapshot.docs.filter(
          (doc) =>
            doc.data().type === "grammar" ||
            doc.data().activity_type === "grammar"
        ).length,
        reading: learningSnapshot.docs.filter(
          (doc) =>
            doc.data().type === "reading" ||
            doc.data().activity_type === "reading"
        ).length,
        undefined: learningSnapshot.docs.filter(
          (doc) => !doc.data().type && !doc.data().activity_type
        ).length,
      },
      sampleLearningRecords: learningSnapshot.docs.slice(0, 5).map((doc) => ({
        id: doc.id,
        type: doc.data().type,
        activity_type: doc.data().activity_type,
        concepts_studied: doc.data().concepts_studied,
        session_duration: doc.data().session_duration,
        correct_answers: doc.data().correct_answers,
        total_interactions: doc.data().total_interactions,
        user_email: doc.data().user_email,
        completed_at: doc.data().completed_at,
      })),
    });

    // 연속 학습 일수 계산
    userProgressData.studyStreak = await calculateStudyStreak();

    // 주간 활동 데이터 계산
    userProgressData.weeklyActivity = await calculateWeeklyActivity();

    // 최근 활동 로드
    userProgressData.recentActivities = await loadRecentActivities();

    console.log("✅ 상세 진도 데이터 로딩 완료:", {
      totalConcepts,
      studiedConcepts: progressSnapshot.size,
      masteredConcepts: masteredCount,
      quizAccuracy: avgQuizAccuracy,
      totalQuizzes,
      totalLearningSessions: learningSnapshot.size,
      avgSessionQuality,
      totalStudyTime: Math.round(totalStudyTime),
      completionRate,
      recentActivitiesCount: userProgressData.recentActivities.length,
      weeklyActivity: userProgressData.weeklyActivity,
    });
  } catch (error) {
    console.error("❌ 사용자 진도 데이터 로딩 중 오류:", error);
  }
}

// 개념별 진도 처리 - 실제 학습한 언어별로 계산
async function processConceptProgress(
  progressData,
  userProgress,
  studiedLanguages = new Set()
) {
  try {
    // 개념 정보 조회
    const conceptRef = doc(db, "concepts", progressData.concept_id);
    const conceptSnap = await getDoc(conceptRef);

    if (conceptSnap.exists()) {
      const conceptData = conceptSnap.data();
      const category = conceptData.concept_info?.category || "기타";

      // 카테고리별 진도 업데이트
      if (!userProgress.categoryProgress[category]) {
        userProgress.categoryProgress[category] = { total: 0, mastered: 0 };
      }
      userProgress.categoryProgress[category].total++;

      const isMastered = progressData.overall_mastery?.level >= 50; // 마스터리 기준을 50%로 조정
      if (isMastered) {
        userProgress.categoryProgress[category].mastered++;
      }

      // 개념 데이터에서 실제 사용 가능한 언어들 확인
      const availableLanguages = new Set();
      if (conceptData.expressions) {
        if (conceptData.expressions.korean?.word)
          availableLanguages.add("korean");
        if (conceptData.expressions.english?.word)
          availableLanguages.add("english");
        if (conceptData.expressions.japanese?.word)
          availableLanguages.add("japanese");
        if (conceptData.expressions.chinese?.word)
          availableLanguages.add("chinese");
      }

      // 실제 학습한 언어 또는 사용 가능한 언어별로 진도 업데이트
      const languagesToProcess =
        studiedLanguages.size > 0 ? studiedLanguages : availableLanguages;

      if (languagesToProcess.size > 0) {
        languagesToProcess.forEach((lang) => {
          // 언어 코드 정규화
          let normalizedLang = lang;
          if (lang === "korean" || lang === "ko") normalizedLang = "korean";
          else if (lang === "english" || lang === "en")
            normalizedLang = "english";
          else if (lang === "japanese" || lang === "ja")
            normalizedLang = "japanese";
          else if (lang === "chinese" || lang === "zh")
            normalizedLang = "chinese";

          // 학습한 언어가 처음 등장하면 초기화
          if (!userProgress.languageProgress[normalizedLang]) {
            userProgress.languageProgress[normalizedLang] = {
              total: 0,
              mastered: 0,
            };
          }

          userProgress.languageProgress[normalizedLang].total++;

          if (isMastered) {
            userProgress.languageProgress[normalizedLang].mastered++;
          }
        });
      }

      console.log(`🌐 언어별 진도 처리: ${progressData.concept_id}`, {
        studiedLanguages: Array.from(studiedLanguages),
        availableLanguages: Array.from(availableLanguages),
        languagesToProcess: Array.from(languagesToProcess),
        isMastered,
        currentLanguageProgress: userProgress.languageProgress,
      });
    }
  } catch (error) {
    console.error("개념별 진도 처리 중 오류:", error);
  }
}

// 연속 학습 일수 계산
async function calculateStudyStreak() {
  try {
    console.log("🔥 연속 학습 일수 계산 시작");
    const studyDates = new Set();

    // 1. 퀴즈 기록 조회
    const quizQuery = query(
      collection(db, "quiz_records"),
      where("user_email", "==", currentUser.email),
      limit(50)
    );
    const quizSnapshot = await getDocs(quizQuery);

    // 퀴즈 학습 날짜 추출
    quizSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      if (data.completed_at) {
        const date = data.completed_at.toDate
          ? data.completed_at.toDate()
          : new Date(data.completed_at);
        const dateStr = date.toDateString();
        studyDates.add(dateStr);
      }
    });

    // 2. 학습 세션 기록 조회
    const learningQuery = query(
      collection(db, "learning_records"),
      where("user_email", "==", currentUser.email),
      limit(50)
    );
    const learningSnapshot = await getDocs(learningQuery);

    // 학습 세션 날짜 추출
    learningSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      if (data.completed_at) {
        const date = data.completed_at.toDate
          ? data.completed_at.toDate()
          : new Date(data.completed_at);
        const dateStr = date.toDateString();
        studyDates.add(dateStr);
      }
    });

    // 3. 게임 기록 조회 (선택적)
    const gameQuery = query(
      collection(db, "game_records"),
      where("user_email", "==", currentUser.email),
      limit(30)
    );
    const gameSnapshot = await getDocs(gameQuery);

    // 게임 학습 날짜 추출
    gameSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      const timestamp = data.completed_at || data.timestamp || data.playedAt;
      if (timestamp) {
        const date = timestamp.toDate
          ? timestamp.toDate()
          : new Date(timestamp);
        const dateStr = date.toDateString();
        studyDates.add(dateStr);
      }
    });

    // 연속 일수 계산
    let streak = 0;
    const today = new Date();

    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateStr = checkDate.toDateString();

      if (studyDates.has(dateStr)) {
        streak++;
      } else {
        break;
      }
    }

    console.log("🔥 연속 학습 일수 계산 완료:", {
      streak,
      studyDatesCount: studyDates.size,
      quizRecords: quizSnapshot.size,
      learningRecords: learningSnapshot.size,
      gameRecords: gameSnapshot.size,
      studyDates: Array.from(studyDates).slice(0, 10), // 최근 10개 날짜만 로그
    });

    return streak;
  } catch (error) {
    console.error("연속 학습 일수 계산 중 오류:", error);
    return 0;
  }
}

// 주간 활동 데이터 계산
async function calculateWeeklyActivity() {
  try {
    console.log("📊 주간 활동 데이터 계산 시작");

    // 최근 7일 간의 날짜별 활동 수 초기화
    const weeklyData = Array(7).fill(0);
    const today = new Date();

    // 1. 퀴즈 활동 조회
    const quizQuery = query(
      collection(db, "quiz_records"),
      where("user_email", "==", currentUser.email),
      limit(100)
    );
    const quizSnapshot = await getDocs(quizQuery);

    // 2. 게임 활동 조회
    const gameQuery = query(
      collection(db, "game_records"),
      where("user_email", "==", currentUser.email),
      limit(100)
    );
    const gameSnapshot = await getDocs(gameQuery);

    // 3. 학습 활동 조회
    const learningQuery = query(
      collection(db, "learning_records"),
      where("user_email", "==", currentUser.email),
      limit(100)
    );
    const learningSnapshot = await getDocs(learningQuery);

    // 날짜별 활동 수 계산
    const countActivitiesByDate = (snapshot) => {
      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        let activityDate = null;

        // 다양한 타임스탬프 필드 처리
        if (data.completed_at) {
          activityDate = data.completed_at.toDate
            ? data.completed_at.toDate()
            : new Date(data.completed_at);
        } else if (data.timestamp) {
          activityDate = data.timestamp.toDate
            ? data.timestamp.toDate()
            : new Date(data.timestamp);
        } else if (data.playedAt) {
          activityDate = data.playedAt.toDate
            ? data.playedAt.toDate()
            : new Date(data.playedAt);
        }

        if (activityDate) {
          // 오늘부터 6일 전까지의 활동만 계산
          for (let i = 0; i < 7; i++) {
            const checkDate = new Date(today);
            checkDate.setDate(today.getDate() - i);

            // 날짜 비교 (같은 날짜인지 확인)
            if (
              activityDate.getFullYear() === checkDate.getFullYear() &&
              activityDate.getMonth() === checkDate.getMonth() &&
              activityDate.getDate() === checkDate.getDate()
            ) {
              weeklyData[6 - i]++; // 배열 순서: [6일전, 5일전, ..., 어제, 오늘]
              break;
            }
          }
        }
      });
    };

    // 각 활동 타입별 데이터 집계
    countActivitiesByDate(quizSnapshot);
    countActivitiesByDate(gameSnapshot);
    countActivitiesByDate(learningSnapshot);

    console.log("📊 주간 활동 데이터 계산 완료:", weeklyData);
    return weeklyData;
  } catch (error) {
    console.error("주간 활동 데이터 계산 중 오류:", error);
    return Array(7).fill(0);
  }
}

// 최근 활동 로드
async function loadRecentActivities() {
  try {
    const activities = [];

    // 1. 퀴즈 기록 조회 (인덱스 없이)
    const quizQuery = query(
      collection(db, "quiz_records"),
      where("user_email", "==", currentUser.email)
    );

    const quizSnapshot = await getDocs(quizQuery);

    quizSnapshot.docs.forEach((doc) => {
      const data = doc.data();

      // 퀴즈 타입별 제목 설정
      let quizTitle = "";
      const userLanguage = localStorage.getItem("userLanguage") || "ko";
      const quizType = data.quiz_type || "quiz";

      switch (quizType.toLowerCase()) {
        case "translation":
          quizTitle =
            userLanguage === "ko"
              ? "단어 번역"
              : userLanguage === "en"
              ? "Word Translation"
              : userLanguage === "ja"
              ? "単語翻訳"
              : userLanguage === "zh"
              ? "单词翻译"
              : "단어 번역";
          break;
        case "vocabulary":
          quizTitle =
            userLanguage === "ko"
              ? "단어 퀴즈"
              : userLanguage === "en"
              ? "Vocabulary Quiz"
              : userLanguage === "ja"
              ? "単語クイズ"
              : userLanguage === "zh"
              ? "词汇测验"
              : "단어 퀴즈";
          break;
        case "grammar":
          quizTitle =
            userLanguage === "ko"
              ? "문법 퀴즈"
              : userLanguage === "en"
              ? "Grammar Quiz"
              : userLanguage === "ja"
              ? "文法クイズ"
              : userLanguage === "zh"
              ? "语法测验"
              : "문법 퀴즈";
          break;
        case "reading":
          quizTitle =
            userLanguage === "ko"
              ? "독해 퀴즈"
              : userLanguage === "en"
              ? "Reading Quiz"
              : userLanguage === "ja"
              ? "読解クイズ"
              : userLanguage === "zh"
              ? "阅读测验"
              : "독해 퀴즈";
          break;
        default:
          quizTitle =
            userLanguage === "ko"
              ? "퀴즈"
              : userLanguage === "en"
              ? "Quiz"
              : userLanguage === "ja"
              ? "クイズ"
              : userLanguage === "zh"
              ? "测验"
              : "퀴즈";
      }

      const completedText =
        userLanguage === "ko"
          ? "완료"
          : userLanguage === "en"
          ? "Completed"
          : userLanguage === "ja"
          ? "完了"
          : userLanguage === "zh"
          ? "完成"
          : "완료";

      activities.push({
        type: "quiz",
        title: `${quizTitle} ${completedText}`,
        description: `${data.score}% (${data.correct_answers}/${data.total_questions})`,
        timestamp: data.completed_at,
        icon: "fas fa-question-circle",
        color:
          data.score >= 80
            ? "text-green-600"
            : data.score >= 60
            ? "text-yellow-600"
            : "text-red-600",
      });
    });

    // 2. 게임 기록 조회 (인덱스 없이)
    const gameQuery = query(
      collection(db, "game_records"),
      where("user_email", "==", currentUser.email)
    );

    const gameSnapshot = await getDocs(gameQuery);

    gameSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      const userLanguage = localStorage.getItem("userLanguage") || "ko";
      const gameTypeName = getGameTypeName(data.game_type || data.type);

      // 게임 완료 텍스트 번역
      const completedText =
        userLanguage === "ko"
          ? "완료"
          : userLanguage === "en"
          ? "Completed"
          : userLanguage === "ja"
          ? "完了"
          : userLanguage === "zh"
          ? "完成"
          : "완료";

      // 점수 및 정확도 텍스트 번역
      const scoreText =
        userLanguage === "ko"
          ? "점"
          : userLanguage === "en"
          ? " pts"
          : userLanguage === "ja"
          ? "点"
          : userLanguage === "zh"
          ? "分"
          : "점";

      const accuracyText =
        userLanguage === "ko"
          ? "정확도"
          : userLanguage === "en"
          ? "Accuracy"
          : userLanguage === "ja"
          ? "正確度"
          : userLanguage === "zh"
          ? "准确度"
          : "정확도";

      activities.push({
        type: "game",
        title: `${gameTypeName} ${completedText}`,
        description: `${data.score || 0}${scoreText} (${accuracyText}: ${
          data.accuracy || 0
        }%)`,
        timestamp: data.completed_at || data.timestamp || data.playedAt,
        icon: "fas fa-gamepad",
        color:
          (data.score || 0) >= 80
            ? "text-purple-600"
            : (data.score || 0) >= 60
            ? "text-blue-600"
            : "text-gray-600",
      });
    });

    // 3. 학습 기록 조회 (인덱스 없이)
    const learningQuery = query(
      collection(db, "learning_records"),
      where("user_email", "==", currentUser.email)
    );

    const learningSnapshot = await getDocs(learningQuery);

    learningSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      const sessionDuration = data.session_duration || 0;
      const conceptsStudied = data.concepts_studied || 0;
      const sessionQuality = data.session_quality || 0;
      const activityType = data.activity_type || data.type || "학습";

      // 유효한 학습 세션인지 확인 (개념 학습이 있거나 상호작용이 있는 경우)
      const totalInteractions = data.total_interactions || 0;
      const correctAnswers = data.correct_answers || 0;

      // 최근 활동 분석을 위한 디버깅 (처음 20개만)
      if (learningSnapshot.docs.indexOf(doc) < 20) {
        console.log("🔍 학습 기록 분석:", {
          docId: doc.id,
          activityType,
          conceptsStudied,
          sessionDuration,
          totalInteractions,
          correctAnswers,
          sessionQuality,
          learningMode: data.learning_mode || data.mode,
          isValidForRecentActivity:
            conceptsStudied > 0 || sessionDuration > 0 || totalInteractions > 0,
        });
      }

      if (conceptsStudied > 0 || sessionDuration > 0 || totalInteractions > 0) {
        // 학습 시간이 0이지만 개념을 학습했다면 최소 1분으로 표시
        const displayDuration =
          sessionDuration > 0 ? sessionDuration : conceptsStudied > 0 ? 1 : 0;

        const userLanguage = localStorage.getItem("userLanguage") || "ko";

        // 품질 점수 표시 개선 (다국어)
        let qualityText = "";
        if (sessionQuality > 0) {
          const qualityLabel =
            userLanguage === "ko"
              ? "품질"
              : userLanguage === "en"
              ? "Quality"
              : userLanguage === "ja"
              ? "品質"
              : userLanguage === "zh"
              ? "质量"
              : "품질";
          qualityText = `, ${qualityLabel}: ${Math.round(sessionQuality)}%`;
        } else if (totalInteractions > 0) {
          const accuracy =
            correctAnswers > 0
              ? Math.round((correctAnswers / totalInteractions) * 100)
              : 0;
          const accuracyLabel =
            userLanguage === "ko"
              ? "정확도"
              : userLanguage === "en"
              ? "Accuracy"
              : userLanguage === "ja"
              ? "正確度"
              : userLanguage === "zh"
              ? "准确度"
              : "정확도";
          qualityText = `, ${accuracyLabel}: ${accuracy}%`;
        } else if (conceptsStudied > 0) {
          const calculatingLabel =
            userLanguage === "ko"
              ? "품질: 계산중"
              : userLanguage === "en"
              ? "Quality: Calculating"
              : userLanguage === "ja"
              ? "品質: 計算中"
              : userLanguage === "zh"
              ? "质量: 计算中"
              : "품질: 계산중";
          qualityText = `, ${calculatingLabel}`;
        }

        // 학습 영역 및 세부 모드별 제목 설정 (다국어)
        let areaDisplayName = "";
        let modeDisplayName = "";

        // 학습 모드 정보 추출 (메타데이터에서 확인)
        const learningMode =
          data.learning_mode ||
          data.mode ||
          (data.metadata && data.metadata.learning_mode);

        switch (activityType) {
          case "vocabulary":
            areaDisplayName =
              userLanguage === "ko"
                ? "단어"
                : userLanguage === "en"
                ? "Vocabulary"
                : userLanguage === "ja"
                ? "単語"
                : userLanguage === "zh"
                ? "词汇"
                : "단어";
            switch (learningMode) {
              case "flashcard":
                modeDisplayName =
                  userLanguage === "ko"
                    ? "플래시카드"
                    : userLanguage === "en"
                    ? "Flashcard"
                    : userLanguage === "ja"
                    ? "フラッシュカード"
                    : userLanguage === "zh"
                    ? "闪卡"
                    : "플래시카드";
                break;
              case "typing":
                modeDisplayName =
                  userLanguage === "ko"
                    ? "타이핑"
                    : userLanguage === "en"
                    ? "Typing"
                    : userLanguage === "ja"
                    ? "タイピング"
                    : userLanguage === "zh"
                    ? "打字"
                    : "타이핑";
                break;
              case "pronunciation":
                modeDisplayName =
                  userLanguage === "ko"
                    ? "발음 연습"
                    : userLanguage === "en"
                    ? "Pronunciation Practice"
                    : userLanguage === "ja"
                    ? "発音練習"
                    : userLanguage === "zh"
                    ? "发音练习"
                    : "발음 연습";
                break;
              default:
                modeDisplayName =
                  userLanguage === "ko"
                    ? "학습"
                    : userLanguage === "en"
                    ? "Study"
                    : userLanguage === "ja"
                    ? "学習"
                    : userLanguage === "zh"
                    ? "学习"
                    : "학습";
            }
            break;
          case "grammar":
            areaDisplayName =
              userLanguage === "ko"
                ? "문법"
                : userLanguage === "en"
                ? "Grammar"
                : userLanguage === "ja"
                ? "文法"
                : userLanguage === "zh"
                ? "语法"
                : "문법";
            switch (learningMode) {
              case "pattern":
                modeDisplayName =
                  userLanguage === "ko"
                    ? "패턴 분석"
                    : userLanguage === "en"
                    ? "Pattern Analysis"
                    : userLanguage === "ja"
                    ? "パターン分析"
                    : userLanguage === "zh"
                    ? "模式分析"
                    : "패턴 분석";
                break;
              case "practice":
                modeDisplayName =
                  userLanguage === "ko"
                    ? "실습 연습"
                    : userLanguage === "en"
                    ? "Practice Exercise"
                    : userLanguage === "ja"
                    ? "実習練習"
                    : userLanguage === "zh"
                    ? "实习练习"
                    : "실습 연습";
                break;
              default:
                modeDisplayName =
                  userLanguage === "ko"
                    ? "학습"
                    : userLanguage === "en"
                    ? "Study"
                    : userLanguage === "ja"
                    ? "学習"
                    : userLanguage === "zh"
                    ? "学习"
                    : "학습";
            }
            break;
          case "reading":
            areaDisplayName =
              userLanguage === "ko"
                ? "독해"
                : userLanguage === "en"
                ? "Reading"
                : userLanguage === "ja"
                ? "読解"
                : userLanguage === "zh"
                ? "阅读"
                : "독해";
            switch (learningMode) {
              case "example":
                modeDisplayName =
                  userLanguage === "ko"
                    ? "예문 학습"
                    : userLanguage === "en"
                    ? "Example Study"
                    : userLanguage === "ja"
                    ? "例文学習"
                    : userLanguage === "zh"
                    ? "例句学习"
                    : "예문 학습";
                break;
              case "flash":
                modeDisplayName =
                  userLanguage === "ko"
                    ? "플래시 모드"
                    : userLanguage === "en"
                    ? "Flash Mode"
                    : userLanguage === "ja"
                    ? "フラッシュモード"
                    : userLanguage === "zh"
                    ? "闪读模式"
                    : "플래시 모드";
                break;
              default:
                modeDisplayName =
                  userLanguage === "ko"
                    ? "학습"
                    : userLanguage === "en"
                    ? "Study"
                    : userLanguage === "ja"
                    ? "学習"
                    : userLanguage === "zh"
                    ? "学习"
                    : "학습";
            }
            break;
          default:
            areaDisplayName =
              activityType ||
              (userLanguage === "ko"
                ? "학습"
                : userLanguage === "en"
                ? "Study"
                : userLanguage === "ja"
                ? "学習"
                : userLanguage === "zh"
                ? "学习"
                : "학습");
            modeDisplayName = "";
        }

        // 완료 텍스트 번역
        const completedText =
          userLanguage === "ko"
            ? "완료"
            : userLanguage === "en"
            ? "Completed"
            : userLanguage === "ja"
            ? "完了"
            : userLanguage === "zh"
            ? "完成"
            : "완료";

        // 학습 텍스트 번역
        const studyText =
          userLanguage === "ko"
            ? "학습"
            : userLanguage === "en"
            ? "Study"
            : userLanguage === "ja"
            ? "学習"
            : userLanguage === "zh"
            ? "学习"
            : "학습";

        // 분 단위 번역
        const minuteText =
          userLanguage === "ko"
            ? "분"
            : userLanguage === "en"
            ? " min"
            : userLanguage === "ja"
            ? "分"
            : userLanguage === "zh"
            ? "分钟"
            : "분";

        // 개념 단위 번역
        const conceptText =
          userLanguage === "ko"
            ? "개 개념"
            : userLanguage === "en"
            ? " concepts"
            : userLanguage === "ja"
            ? "個の概念"
            : userLanguage === "zh"
            ? "个概念"
            : "개 개념";

        // 최종 제목 구성
        const fullTitle = modeDisplayName
          ? `${areaDisplayName} ${modeDisplayName} ${completedText}`
          : `${areaDisplayName} ${studyText} ${completedText}`;

        activities.push({
          type: "learning",
          title: fullTitle,
          description: `${displayDuration}${minuteText} ${studyText} (${conceptsStudied}${conceptText}${qualityText})`,
          timestamp: data.completed_at || data.timestamp,
          icon: "fas fa-book-open",
          color:
            sessionQuality >= 70
              ? "text-green-600"
              : sessionQuality >= 50
              ? "text-yellow-600"
              : totalInteractions > 0
              ? "text-blue-600"
              : "text-gray-600",
        });
      }
    });

    // JavaScript에서 시간순 정렬 (최신순)
    activities.sort((a, b) => {
      if (!a.timestamp || !b.timestamp) return 0;

      // Firestore Timestamp 객체와 일반 Date 객체 모두 처리
      const aTime = a.timestamp.toDate
        ? a.timestamp.toDate()
        : new Date(a.timestamp);
      const bTime = b.timestamp.toDate
        ? b.timestamp.toDate()
        : new Date(b.timestamp);

      // 최신순 정렬 (큰 값이 먼저)
      return bTime - aTime;
    });

    // 상위 5개만 선택
    const topActivities = activities.slice(0, 5);

    console.log("📋 최근 활동 로드 완료:", {
      totalActivities: activities.length,
      topActivities: topActivities.length,
      quizActivities: activities.filter((a) => a.type === "quiz").length,
      gameActivities: activities.filter((a) => a.type === "game").length,
      learningActivities: activities.filter((a) => a.type === "learning")
        .length,
      sampleActivities: topActivities.slice(0, 3).map((a) => ({
        type: a.type,
        title: a.title,
        description: a.description,
        timestamp: a.timestamp
          ? a.timestamp.toDate
            ? a.timestamp.toDate().toISOString()
            : a.timestamp
          : null,
      })),
      validLearningRecords: learningSnapshot.docs.filter((doc) => {
        const data = doc.data();
        return (
          (data.concepts_studied || 0) > 0 || (data.session_duration || 0) > 0
        );
      }).length,
      totalLearningRecords: learningSnapshot.docs.length,
    });

    return topActivities;
  } catch (error) {
    console.error("최근 활동 로드 중 오류:", error);
    return [];
  }
}

// 사용자 목표 로드
async function loadUserGoals() {
  try {
    // 먼저 users 컬렉션에서 목표 확인
    const userRef = doc(db, "users", currentUser.email);
    const userSnap = await getDoc(userRef);

    let goalsData = null;

    if (userSnap.exists() && userSnap.data().goals) {
      goalsData = userSnap.data().goals;
    } else {
      // 기존 user_goals 컬렉션에서 시도
      try {
        const goalsRef = doc(db, "user_goals", currentUser.email);
        const goalsSnap = await getDoc(goalsRef);
        if (goalsSnap.exists()) {
          goalsData = goalsSnap.data();
        }
      } catch (error) {
        console.log("user_goals 컬렉션 접근 불가, 로컬 스토리지 확인");
      }
    }

    // 로컬 스토리지에서 백업 확인
    if (!goalsData) {
      const localGoals = localStorage.getItem("userGoals");
      if (localGoals) {
        goalsData = JSON.parse(localGoals);
      }
    }

    if (goalsData) {
      learningGoals = {
        daily: {
          newWords: goalsData.daily?.newWords || 10,
          quizTime: goalsData.daily?.quizTime || 20,
        },
        weekly: {
          studyDays: goalsData.weekly?.studyDays || 5,
          masteryGoal: goalsData.weekly?.masteryGoal || 30,
        },
      };

      // UI에 반영
      elements.dailyWordsGoal.value = learningGoals.daily.newWords;
      elements.dailyQuizGoal.value = learningGoals.daily.quizTime;
      elements.weeklyDaysGoal.value = learningGoals.weekly.studyDays;
      elements.weeklyMasteryGoal.value = learningGoals.weekly.masteryGoal;
    }

    console.log("✅ 사용자 목표 로드 완료:", learningGoals);
  } catch (error) {
    console.error("사용자 목표 로드 중 오류:", error);

    // 기본값 설정
    learningGoals = {
      daily: { newWords: 10, quizTime: 20 },
      weekly: { studyDays: 5, masteryGoal: 30 },
    };
  }
}

// 모든 데이터 표시
async function displayAllData() {
  try {
    console.log("🎨 데이터 표시 시작");

    if (!userProgressData) return;

    // 통계 요약 업데이트
    updateStatsSummary();

    // 언어별 마스터리 업데이트
    await updateLanguageMastery();

    // 🎮 성취도 업데이트
    updateAchievements();

    // 차트 생성
    createCharts();

    // 최근 활동 표시
    displayRecentActivities();

    // 목표 진행률 업데이트
    updateGoalsProgress();

    console.log("✅ 데이터 표시 완료");
  } catch (error) {
    console.error("❌ 데이터 표시 중 오류:", error);
  }
}

// 통계 요약 업데이트
function updateStatsSummary() {
  // 📊 개선된 총 단어수 표시 (학습한 수 / 전체 수)
  console.log("📊 통계 요약 업데이트:", {
    studiedConcepts: userProgressData.studiedConcepts,
    totalConcepts: userProgressData.totalConcepts,
    masteredConcepts: userProgressData.masteredConcepts,
  });

  // 🔧 잘못된 데이터 수정
  const studiedCount = Math.min(
    userProgressData.studiedConcepts || 0,
    userProgressData.totalConcepts || 0
  );

  if (userProgressData.studiedConcepts !== undefined) {
    elements.totalWordsCount.textContent = `${studiedCount}/${userProgressData.totalConcepts}`;
    elements.totalWordsCount.title = `학습한 개념: ${studiedCount}개 / 전체 개념: ${userProgressData.totalConcepts}개`;
  } else {
    elements.totalWordsCount.textContent = userProgressData.totalConcepts;
  }

  // 📈 개선된 마스터리 기준으로 표시
  elements.masteredWordsCount.textContent = userProgressData.masteredConcepts;
  elements.masteredWordsCount.title = `마스터리 60% 이상 달성한 개념 수 (기존 80% → 60%로 조정)`;

  const daysText = getTranslatedText("days_suffix") || "일";
  elements.studyStreakCount.textContent = `${userProgressData.studyStreak}${daysText}`;

  // 🎯 퀴즈 정확도 (이모지 제거)
  const accuracy =
    userProgressData.achievements?.averageAccuracy ||
    userProgressData.quizAccuracy ||
    0;
  elements.quizAccuracyRate.textContent = `${accuracy}%`;
}

// 언어별 마스터리 업데이트
// 🌐 언어별 마스터리 업데이트 - 실제 학습 기록 기반
async function updateLanguageMastery() {
  const languages = [
    {
      code: "korean",
      percent: elements.koreanMasteryPercent,
      bar: elements.koreanMasteryBar,
    },
    {
      code: "english",
      percent: elements.englishMasteryPercent,
      bar: elements.englishMasteryBar,
    },
    {
      code: "japanese",
      percent: elements.japaneseMasteryPercent,
      bar: elements.japaneseMasteryBar,
    },
    {
      code: "chinese",
      percent: elements.chineseMasteryPercent,
      bar: elements.chineseMasteryBar,
    },
  ];

  console.log("🌐 언어별 마스터리 업데이트 시작");

  // 실제 학습한 언어별 진도 계산
  const studiedLanguages = await getStudiedLanguagesFromLearningRecords();

  for (const lang of languages) {
    let percentage = 0;

    // 1. 실제 학습 기록이 있는 언어만 계산
    if (studiedLanguages[lang.code]) {
      percentage = studiedLanguages[lang.code].percentage;
      console.log(`🌐 ${lang.code} 언어 학습 기록 기반 계산:`, {
        totalConcepts: studiedLanguages[lang.code].total,
        masteredConcepts: studiedLanguages[lang.code].mastered,
        percentage: percentage,
        studiedConceptsCount: studiedLanguages[lang.code].studiedConceptsCount,
      });
    }
    // 2. 학습 기록이 없으면 기존 데이터 사용
    else if (userProgressData?.languageProgress?.[lang.code]) {
      const progress = userProgressData.languageProgress[lang.code];
      if (progress && progress.total > 0) {
        percentage = Math.round((progress.mastered / progress.total) * 100);
        console.log(`🌐 ${lang.code} 언어 기존 데이터 사용:`, {
          total: progress.total,
          mastered: progress.mastered,
          percentage: percentage,
        });
      }
    }
    // 3. 모든 데이터가 없으면 0% 유지 (학습하지 않은 언어)
    else {
      console.log(`🌐 ${lang.code} 언어 학습 기록 없음: 0%`);
    }

    // UI 업데이트
    if (lang.percent) {
      lang.percent.textContent = `${percentage}%`;
    }
    if (lang.bar) {
      lang.bar.style.width = `${percentage}%`;
    }
  }

  console.log("🌐 언어별 마스터리 업데이트 완료");
}

// 실제 학습 기록에서 언어별 진도 계산
async function getStudiedLanguagesFromLearningRecords() {
  try {
    const studiedLanguages = {};

    // 최근 학습 기록 조회 (인덱스 없이)
    const learningQuery = query(
      collection(db, "learning_records"),
      where("user_email", "==", currentUser.email)
    );
    const learningSnapshot = await getDocs(learningQuery);

    // 언어별 학습한 개념들 수집
    const languageConceptMap = {
      korean: new Set(),
      english: new Set(),
      japanese: new Set(),
      chinese: new Set(),
    };

    // 학습 기록을 시간순으로 정렬 (최신순)
    const sortedDocs = learningSnapshot.docs.sort((a, b) => {
      const aTime = a.data().timestamp?.toDate
        ? a.data().timestamp.toDate()
        : new Date(a.data().timestamp || 0);
      const bTime = b.data().timestamp?.toDate
        ? b.data().timestamp.toDate()
        : new Date(b.data().timestamp || 0);
      return bTime - aTime; // 최신순
    });

    // 학습 기록에서 실제 학습한 개념들과 사용된 언어 분석
    for (const docSnap of sortedDocs.slice(0, 200)) {
      // 최대 200개만 처리
      const data = docSnap.data();

      // 유효한 학습 세션만 포함 (개념을 실제로 학습한 경우)
      if (data.concepts_studied > 0) {
        console.log(`📚 학습 기록 분석:`, {
          docId: docSnap.id,
          conceptsStudied: data.concepts_studied,
          studyLanguage: data.study_language,
          studiedConcepts: data.studied_concepts?.length || 0,
          timestamp: data.timestamp?.toDate
            ? data.timestamp.toDate().toISOString()
            : data.timestamp,
        });

        // 학습한 개념이 기록되어 있으면 그것을 사용, 없으면 스킵
        const conceptsToProcess =
          data.studied_concepts?.length > 0 ? data.studied_concepts : [];

        // 각 학습한 개념에 대해 언어별로 분류
        for (const conceptId of conceptsToProcess) {
          // 개념 정보 조회하여 어떤 언어로 학습 가능한지 확인
          try {
            const conceptRef = doc(db, "concepts", conceptId);
            const conceptSnap = await getDoc(conceptRef);

            if (conceptSnap.exists()) {
              const conceptData = conceptSnap.data();

              // 실제 학습에 사용된 언어 확인
              if (data.study_language) {
                const normalizedLang = normalizeLang(data.study_language);
                if (
                  languageConceptMap[normalizedLang] &&
                  conceptData.expressions?.[normalizedLang]?.word
                ) {
                  languageConceptMap[normalizedLang].add(conceptId);
                }
              } else {
                // 학습 언어 정보가 없으면 모든 가능한 언어에 추가
                Object.keys(languageConceptMap).forEach((lang) => {
                  if (conceptData.expressions?.[lang]?.word) {
                    languageConceptMap[lang].add(conceptId);
                  }
                });
              }
            }
          } catch (error) {
            console.error(`개념 ${conceptId} 조회 오류:`, error);
          }
        }
      }
    }

    // 각 언어별로 마스터리 계산
    for (const [langCode, conceptIds] of Object.entries(languageConceptMap)) {
      if (conceptIds.size > 0) {
        console.log(
          `🔍 ${langCode} 언어 분석 중... 개념 수: ${conceptIds.size}`
        );

        const conceptProgress = await calculateLanguageMasteryForConcepts(
          Array.from(conceptIds),
          langCode
        );
        if (conceptProgress.total > 0) {
          studiedLanguages[langCode] = {
            total: conceptProgress.total,
            mastered: conceptProgress.mastered,
            percentage: Math.round(
              (conceptProgress.mastered / conceptProgress.total) * 100
            ),
            studiedConceptsCount: conceptIds.size,
          };
        }
      }
    }

    console.log("📊 학습 언어별 진도 분석 완료:", studiedLanguages);
    return studiedLanguages;
  } catch (error) {
    console.error("학습 기록 기반 언어 진도 계산 오류:", error);
    return {};
  }
}

// 특정 개념들의 언어별 마스터리 계산
async function calculateLanguageMasteryForConcepts(conceptIds, targetLang) {
  try {
    let total = 0;
    let mastered = 0;

    for (const conceptId of conceptIds) {
      // 개념 정보 조회
      const conceptRef = doc(db, "concepts", conceptId);
      const conceptSnap = await getDoc(conceptRef);

      if (conceptSnap.exists()) {
        const conceptData = conceptSnap.data();

        // 해당 언어의 단어가 있는지 확인
        if (conceptData.expressions?.[targetLang]?.word) {
          total++;

          // 사용자 진도 정보 조회
          const userProgressRef = doc(
            db,
            "user_records",
            currentUser.uid,
            "concept_progress",
            conceptId
          );
          const progressSnap = await getDoc(userProgressRef);

          if (progressSnap.exists()) {
            const progressData = progressSnap.data();
            // 마스터리 기준을 60%로 설정
            if ((progressData.overall_mastery?.level || 0) >= 60) {
              mastered++;
            }
          }
        }
      }
    }

    return { total, mastered };
  } catch (error) {
    console.error("개념별 마스터리 계산 오류:", error);
    return { total: 0, mastered: 0 };
  }
}

// 언어 코드 정규화
function normalizeLang(lang) {
  if (!lang) return null;

  const langStr = lang.toString().toLowerCase();
  if (langStr === "ko" || langStr === "korean" || langStr === "한국어")
    return "korean";
  if (langStr === "en" || langStr === "english" || langStr === "영어")
    return "english";
  if (langStr === "ja" || langStr === "japanese" || langStr === "일본어")
    return "japanese";
  if (langStr === "zh" || langStr === "chinese" || langStr === "중국어")
    return "chinese";
  return langStr;
}

// 🎮 성취도 업데이트
function updateAchievements() {
  try {
    console.log("🏆 성취도 업데이트");

    if (!userProgressData) return;

    // 퀴즈 성취도
    if (elements.totalQuizzesCount) {
      elements.totalQuizzesCount.textContent = `${
        userProgressData.achievements?.totalQuizzes || 0
      }회`;
    }
    if (elements.avgQuizAccuracy) {
      elements.avgQuizAccuracy.textContent = `${
        userProgressData.achievements?.avgQuizAccuracy || 0
      }%`;
    }

    // 🎮 게임 성취도
    if (elements.totalGamesCount) {
      elements.totalGamesCount.textContent = `${
        userProgressData.achievements?.totalGames || 0
      }회`;
    }
    if (elements.avgGameScore) {
      elements.avgGameScore.textContent = `${
        userProgressData.achievements?.avgGameScore || 0
      }점`;
    }

    // 학습 세션
    if (elements.totalLearningSessions) {
      elements.totalLearningSessions.textContent = `${
        userProgressData.achievements?.totalLearningSessions || 0
      }회`;
    }
    if (elements.avgSessionQuality) {
      const quality = userProgressData.achievements?.avgSessionQuality || 0;
      elements.avgSessionQuality.textContent =
        quality > 0 ? `${quality}%` : "-";

      console.log("📊 학습 효율 업데이트:", {
        avgSessionQuality: quality,
        totalLearningSessions:
          userProgressData.achievements?.totalLearningSessions || 0,
        totalStudyTime: userProgressData.achievements?.totalStudyTime || 0,
        rawData: userProgressData.achievements,
      });
    }

    // 종합 성취도
    if (elements.totalStudyTime) {
      elements.totalStudyTime.textContent = `${
        userProgressData.achievements?.totalStudyTime || 0
      }분`;
    }
    if (elements.completionRate) {
      elements.completionRate.textContent = `${
        userProgressData.achievements?.completionRate || 0
      }%`;
    }

    console.log("✅ 성취도 업데이트 완료:", {
      totalQuizzes: userProgressData.achievements?.totalQuizzes || 0,
      avgQuizAccuracy: userProgressData.achievements?.avgQuizAccuracy || 0,
      totalGames: userProgressData.achievements?.totalGames || 0,
      avgGameScore: userProgressData.achievements?.avgGameScore || 0,
      totalLearningSessions:
        userProgressData.achievements?.totalLearningSessions || 0,
      avgSessionQuality: userProgressData.achievements?.avgSessionQuality || 0,
      totalStudyTime: userProgressData.achievements?.totalStudyTime || 0,
      completionRate: userProgressData.achievements?.completionRate || 0,
    });
  } catch (error) {
    console.error("❌ 성취도 업데이트 중 오류:", error);
  }
}

// 차트 생성
function createCharts() {
  createWeeklyActivityChart();
  createCategoryProgressChart();
}

// 주간 학습 활동 차트 (실제 데이터 기반)
function createWeeklyActivityChart() {
  const ctx = elements.weeklyActivityChart.getContext("2d");

  // 최근 7일 데이터 준비
  const last7Days = [];
  const studyCounts = userProgressData.weeklyActivity || Array(7).fill(0);

  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    last7Days.push(date.toLocaleDateString("ko-KR", { weekday: "short" }));
  }

  if (charts.weeklyActivity) {
    charts.weeklyActivity.destroy();
  }

  charts.weeklyActivity = new Chart(ctx, {
    type: "line",
    data: {
      labels: last7Days,
      datasets: [
        {
          label: "학습 활동",
          data: studyCounts,
          borderColor: "#3B82F6",
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          tension: 0.4,
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: {
          top: 10,
          bottom: 10,
          left: 10,
          right: 10,
        },
      },
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1,
            maxTicksLimit: 6,
          },
          grid: {
            color: "rgba(0, 0, 0, 0.1)",
          },
        },
        x: {
          grid: {
            color: "rgba(0, 0, 0, 0.1)",
          },
        },
      },
    },
  });
}

// 카테고리별 진도 차트
function createCategoryProgressChart() {
  const ctx = elements.categoryProgressChart.getContext("2d");

  const categories = Object.keys(userProgressData.categoryProgress);
  const percentages = categories.map((category) => {
    const progress = userProgressData.categoryProgress[category];
    return progress.total > 0
      ? Math.round((progress.mastered / progress.total) * 100)
      : 0;
  });

  if (charts.categoryProgress) {
    charts.categoryProgress.destroy();
  }

  charts.categoryProgress = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: categories,
      datasets: [
        {
          data: percentages,
          backgroundColor: [
            "#3B82F6",
            "#10B981",
            "#F59E0B",
            "#EF4444",
            "#8B5CF6",
            "#06B6D4",
          ],
          borderWidth: 2,
          borderColor: "#ffffff",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: {
          top: 10,
          bottom: 10,
          left: 10,
          right: 10,
        },
      },
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            usePointStyle: true,
            padding: 15,
            maxHeight: 80,
          },
        },
      },
    },
  });
}

// 최근 활동 및 성취도 표시 (개선된 버전)
function displayRecentActivities() {
  let activitiesHTML = "";

  // 🏆 최근 성취도 표시
  if (
    userProgressData.recentAchievements &&
    userProgressData.recentAchievements.length > 0
  ) {
    activitiesHTML += `
      <div class="mb-4">
        <h4 class="text-sm font-semibold text-gray-700 mb-2 flex items-center">
          <i class="fas fa-trophy text-yellow-500 mr-2"></i>
          학습 활동
        </h4>
    `;

    userProgressData.recentAchievements.slice(0, 3).forEach((achievement) => {
      const timeAgo = getTimeAgo(achievement.date?.toDate());
      let icon = "fas fa-star text-yellow-500";
      let title = "새로운 성취";

      if (achievement.type === "mastery") {
        icon = "fas fa-crown text-purple-500";
        title = "개념 마스터 완료";
      } else if (achievement.type === "high_score") {
        icon = "fas fa-medal text-gold-500";
        title = `${achievement.score}% 고득점`;
      }

      activitiesHTML += `
        <div class="flex items-start space-x-3 p-2 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg mb-2">
          <div class="flex-shrink-0">
            <i class="${icon} text-lg"></i>
          </div>
          <div class="flex-1">
            <h5 class="font-medium text-gray-800 text-sm">${title}</h5>
            <p class="text-xs text-gray-500">${timeAgo}</p>
          </div>
      </div>
    `;
    });

    activitiesHTML += "</div>";
  }

  // 📈 최근 활동을 기존 학습 활동 섹션에 통합
  if (
    userProgressData.recentActivities &&
    userProgressData.recentActivities.length > 0
  ) {
    // 제목 없이 바로 활동 목록 추가

    userProgressData.recentActivities.forEach((activity) => {
      const timeAgo = getTimeAgo(activity.timestamp?.toDate());

      // 활동 타입별 라벨 추가 (다국어 지원)
      const userLanguage = localStorage.getItem("userLanguage") || "ko";
      let typeLabel = "";

      switch (activity.type) {
        case "quiz":
          switch (userLanguage) {
            case "ko":
              typeLabel = "[퀴즈] ";
              break;
            case "en":
              typeLabel = "[Quiz] ";
              break;
            case "ja":
              typeLabel = "[クイズ] ";
              break;
            case "zh":
              typeLabel = "[测验] ";
              break;
            default:
              typeLabel = "[퀴즈] ";
          }
          break;
        case "game":
          switch (userLanguage) {
            case "ko":
              typeLabel = "[게임] ";
              break;
            case "en":
              typeLabel = "[Game] ";
              break;
            case "ja":
              typeLabel = "[ゲーム] ";
              break;
            case "zh":
              typeLabel = "[游戏] ";
              break;
            default:
              typeLabel = "[게임] ";
          }
          break;
        case "learning":
          switch (userLanguage) {
            case "ko":
              typeLabel = "[학습] ";
              break;
            case "en":
              typeLabel = "[Study] ";
              break;
            case "ja":
              typeLabel = "[学習] ";
              break;
            case "zh":
              typeLabel = "[学习] ";
              break;
            default:
              typeLabel = "[학습] ";
          }
          break;
        default:
          typeLabel = "";
      }

      activitiesHTML += `
        <div class="flex items-start space-x-3 p-2 bg-gray-50 rounded-lg mb-2">
        <div class="flex-shrink-0">
          <i class="${activity.icon} ${activity.color} text-lg"></i>
        </div>
        <div class="flex-1">
            <h5 class="font-medium text-gray-800 text-sm">${typeLabel}${activity.title}</h5>
            <p class="text-xs text-gray-600">${activity.description}</p>
          <p class="text-xs text-gray-500 mt-1">${timeAgo}</p>
        </div>
      </div>
    `;
    });

    activitiesHTML += "</div>";
  }

  // 📊 학습 통계 요약
  if (userProgressData.totalConcepts > 0) {
    const masteryRate = Math.round(
      (userProgressData.masteredConcepts / userProgressData.totalConcepts) * 100
    );
    activitiesHTML += `
      <div class="mt-4 p-3 bg-blue-50 rounded-lg">
        <h4 class="text-sm font-semibold text-blue-800 mb-2">학습 현황</h4>
        <div class="grid grid-cols-2 gap-3 text-xs">
          <div class="text-center">
            <div class="font-bold text-blue-600">${userProgressData.totalConcepts}</div>
            <div class="text-blue-500">총 학습 개념</div>
          </div>
          <div class="text-center">
            <div class="font-bold text-green-600">${masteryRate}%</div>
            <div class="text-green-500">마스터리 율</div>
          </div>
        </div>
      </div>
    `;
  }

  if (activitiesHTML === "") {
    elements.recentActivitiesList.innerHTML = `
      <div class="text-center py-8 text-gray-500">
        <i class="fas fa-rocket text-3xl mb-2"></i>
        <p class="font-medium">학습을 시작해보세요!</p>
        <p class="text-sm">퀴즈를 풀고 성취를 쌓아보세요.</p>
      </div>
    `;
  } else {
    elements.recentActivitiesList.innerHTML = activitiesHTML;
  }
}

// 목표 진행률 업데이트
async function updateGoalsProgress() {
  // 오늘 데이터 계산
  const today = new Date();
  const todayStr = today.toDateString();

  // 오늘 새로 추가된 단어 수 (임시 계산)
  const todayNewWords = 2; // 실제로는 오늘 추가된 개념 수를 계산해야 함

  // 오늘 퀴즈 시간 (분) (임시 계산)
  const todayQuizTime = 15; // 실제로는 오늘 퀴즈에 소요된 시간을 계산해야 함

  // 일일 목표 진행률
  const dailyWordsProgress = Math.min(
    (todayNewWords / learningGoals.daily.newWords) * 100,
    100
  );
  const dailyQuizProgress = Math.min(
    (todayQuizTime / learningGoals.daily.quizTime) * 100,
    100
  );

  elements.dailyWordsProgress.textContent = `${todayNewWords}/${learningGoals.daily.newWords}개`;
  elements.dailyWordsBar.style.width = `${dailyWordsProgress}%`;

  elements.dailyQuizProgress.textContent = `${todayQuizTime}/${learningGoals.daily.quizTime}분`;
  elements.dailyQuizBar.style.width = `${dailyQuizProgress}%`;

  // 주간 목표 진행률 (임시 데이터)
  const weeklyStudyDays = userProgressData.studyStreak;
  const weeklyMastered = userProgressData.masteredConcepts; // 이번 주 마스터한 단어 수

  const weeklyDaysProgress = Math.min(
    (weeklyStudyDays / learningGoals.weekly.studyDays) * 100,
    100
  );
  const weeklyMasteryProgress = Math.min(
    (weeklyMastered / learningGoals.weekly.masteryGoal) * 100,
    100
  );

  elements.weeklyDaysProgress.textContent = `${weeklyStudyDays}/${learningGoals.weekly.studyDays}일`;
  elements.weeklyDaysBar.style.width = `${weeklyDaysProgress}%`;

  elements.weeklyMasteryProgress.textContent = `${weeklyMastered}/${learningGoals.weekly.masteryGoal}개`;
  elements.weeklyMasteryBar.style.width = `${weeklyMasteryProgress}%`;
}

// 목표 저장
async function saveUserGoals() {
  try {
    console.log("💾 사용자 목표 저장 중");

    const newGoals = {
      daily: {
        newWords: parseInt(elements.dailyWordsGoal.value),
        quizTime: parseInt(elements.dailyQuizGoal.value),
      },
      weekly: {
        studyDays: parseInt(elements.weeklyDaysGoal.value),
        masteryGoal: parseInt(elements.weeklyMasteryGoal.value),
      },
      updated_at: serverTimestamp(),
    };

    // user_goals 컬렉션 대신 users 컬렉션의 하위 문서로 저장
    const userRef = doc(db, "users", currentUser.email);
    await setDoc(userRef, { goals: newGoals }, { merge: true });

    learningGoals = newGoals;

    // 진행률 업데이트
    await updateGoalsProgress();

    // 성공 메시지
    showSuccess("목표가 저장되었습니다!");

    console.log("✅ 사용자 목표 저장 완료");
  } catch (error) {
    console.error("❌ 사용자 목표 저장 중 오류:", error);

    // 오류가 발생해도 로컬에서는 목표를 업데이트
    learningGoals = {
      daily: {
        newWords: parseInt(elements.dailyWordsGoal.value),
        quizTime: parseInt(elements.dailyQuizGoal.value),
      },
      weekly: {
        studyDays: parseInt(elements.weeklyDaysGoal.value),
        masteryGoal: parseInt(elements.weeklyMasteryGoal.value),
      },
    };

    // 로컬 스토리지에 백업 저장
    localStorage.setItem("userGoals", JSON.stringify(learningGoals));

    // 진행률 업데이트
    await updateGoalsProgress();

    showSuccess("목표가 로컬에 저장되었습니다!");
  }
}

// 일일 목표 표시 업데이트
function updateDailyGoalsDisplay() {
  const newWords = parseInt(elements.dailyWordsGoal.value) || 10;
  const quizTime = parseInt(elements.dailyQuizGoal.value) || 20;

  elements.dailyWordsProgress.textContent = `0/${newWords}개`;
  elements.dailyQuizProgress.textContent = `0/${quizTime}분`;
}

// 주간 목표 표시 업데이트
function updateWeeklyGoalsDisplay() {
  const studyDays = parseInt(elements.weeklyDaysGoal.value) || 5;
  const masteryGoal = parseInt(elements.weeklyMasteryGoal.value) || 30;

  elements.weeklyDaysProgress.textContent = `0/${studyDays}일`;
  elements.weeklyMasteryProgress.textContent = `0/${masteryGoal}개`;
}

// 유틸리티 함수들
function getTimeAgo(date) {
  const userLanguage = localStorage.getItem("userLanguage") || "ko";

  if (!date) {
    return userLanguage === "ko"
      ? "방금 전"
      : userLanguage === "en"
      ? "Just now"
      : userLanguage === "ja"
      ? "今"
      : userLanguage === "zh"
      ? "刚刚"
      : "방금 전";
  }

  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) {
    return userLanguage === "ko"
      ? "방금 전"
      : userLanguage === "en"
      ? "Just now"
      : userLanguage === "ja"
      ? "今"
      : userLanguage === "zh"
      ? "刚刚"
      : "방금 전";
  }

  if (diffMins < 60) {
    const minText =
      userLanguage === "ko"
        ? "분 전"
        : userLanguage === "en"
        ? " minutes ago"
        : userLanguage === "ja"
        ? "分前"
        : userLanguage === "zh"
        ? "分钟前"
        : "분 전";
    return `${diffMins}${minText}`;
  }

  if (diffHours < 24) {
    const hourText =
      userLanguage === "ko"
        ? "시간 전"
        : userLanguage === "en"
        ? " hours ago"
        : userLanguage === "ja"
        ? "時間前"
        : userLanguage === "zh"
        ? "小时前"
        : "시간 전";
    return `${diffHours}${hourText}`;
  }

  const dayText =
    userLanguage === "ko"
      ? "일 전"
      : userLanguage === "en"
      ? " days ago"
      : userLanguage === "ja"
      ? "日前"
      : userLanguage === "zh"
      ? "天前"
      : "일 전";
  return `${diffDays}${dayText}`;
}

function showError(message) {
  // 실제로는 더 나은 에러 표시 방법 사용
  console.error("❌", message);
  alert(message);
}

function showSuccess(message) {
  // 실제로는 더 나은 성공 메시지 표시 방법 사용
  console.log("✅", message);
  alert(message);
}

// 🏆 마스터한 단어 목록 표시
async function showMasteredWordsList() {
  try {
    console.log("🏆 마스터한 단어 목록 조회 중...");

    if (!currentUser) return;

    // 마스터한 개념들 조회
    const progressQuery = query(
      collection(db, "user_progress"),
      where("user_email", "==", currentUser.email)
    );

    const progressSnapshot = await getDocs(progressQuery);
    const masteredConcepts = [];

    // 마스터리 레벨 60% 이상인 개념들 필터링
    for (const docSnapshot of progressSnapshot.docs) {
      const progressData = docSnapshot.data();
      const masteryLevel = progressData.overall_mastery?.level || 0;

      if (masteryLevel >= 60) {
        // 개념 정보 조회
        const conceptRef = doc(db, "concepts", progressData.concept_id);
        const conceptDoc = await getDoc(conceptRef);
        if (conceptDoc.exists()) {
          const conceptData = conceptDoc.data();
          masteredConcepts.push({
            id: progressData.concept_id,
            masteryLevel,
            ...conceptData,
          });
        }
      }
    }

    // 마스터리 레벨 순으로 정렬
    masteredConcepts.sort((a, b) => b.masteryLevel - a.masteryLevel);

    // 모달 HTML 생성
    const modalHTML = `
      <div id="mastered-words-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg max-w-6xl w-full mx-4 max-h-[85vh] overflow-hidden">
          <div class="flex justify-between items-center p-6 border-b">
            <h2 class="text-2xl font-bold text-gray-800">
              🏆 마스터한 단어 목록 (${masteredConcepts.length}개)
            </h2>
            <button id="close-mastered-modal" class="text-gray-500 hover:text-gray-700 text-2xl">
              ✕
            </button>
          </div>
          <div class="p-6 overflow-y-auto max-h-[70vh]">
            <!-- 🎯 마스터리 현황 및 기준 -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div class="bg-green-50 rounded-lg p-4">
                <h3 class="font-semibold text-green-800 mb-3">🎯 마스터리 현황</h3>
                <div class="space-y-2">
                  <div class="flex justify-between">
                    <span class="text-gray-600">마스터한 개념:</span>
                    <span class="font-medium text-green-600">${
                      userProgressData.masteredConcepts
                    }개</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">연습 필요:</span>
                    <span class="font-medium text-yellow-600">${
                      userProgressData.practiceNeeded
                    }개</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">학습 중:</span>
                    <span class="font-medium text-blue-600">${
                      userProgressData.learning
                    }개</span>
                  </div>
                </div>
              </div>
              
              <div class="bg-gray-50 rounded-lg p-4">
                <h3 class="font-semibold text-gray-800 mb-3">📈 마스터리 기준</h3>
                <div class="grid grid-cols-1 gap-3 text-sm">
                  <div class="bg-green-100 rounded p-3">
                    <div class="font-medium text-green-800">마스터 (60% 이상)</div>
                    <div class="text-green-600">완전히 익힌 상태</div>
                  </div>
                  <div class="bg-yellow-100 rounded p-3">
                    <div class="font-medium text-yellow-800">연습 필요 (30-59%)</div>
                    <div class="text-yellow-600">복습이 필요한 상태</div>
                  </div>
                  <div class="bg-blue-100 rounded p-3">
                    <div class="font-medium text-blue-800">학습 중 (30% 미만)</div>
                    <div class="text-blue-600">아직 학습 중인 상태</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 마스터한 단어 목록 -->
            <div class="border-t pt-6">
              <h3 class="text-lg font-semibold text-gray-800 mb-4">🏆 마스터한 단어 목록</h3>
              ${
                masteredConcepts.length === 0
                  ? '<div class="text-center py-8 text-gray-500">아직 마스터한 단어가 없습니다. 계속 학습해보세요! 🚀</div>'
                  : `<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                     ${masteredConcepts
                       .map(
                         (concept) => `
                       <div class="bg-gradient-to-r from-yellow-50 to-yellow-100 border-l-4 border-yellow-400 p-4 rounded-lg">
                         <div class="flex items-center justify-between mb-2">
                           <span class="text-lg font-semibold text-gray-800">
                             ${
                               concept.expressions?.korean?.word ||
                               concept.expressions?.english?.word ||
                               "단어"
                             }
                           </span>
                           <span class="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                             ${Math.round(concept.masteryLevel)}%
                           </span>
                         </div>
                         <div class="text-sm text-gray-600 space-y-1">
                           ${
                             concept.expressions?.english?.word
                               ? `<div>🇺🇸 ${concept.expressions.english.word}</div>`
                               : ""
                           }
                           ${
                             concept.expressions?.japanese?.word
                               ? `<div>🇯🇵 ${concept.expressions.japanese.word}</div>`
                               : ""
                           }
                           ${
                             concept.expressions?.chinese?.word
                               ? `<div>🇨🇳 ${concept.expressions.chinese.word}</div>`
                               : ""
                           }
                           <div class="text-gray-500 text-xs mt-2">
                             ${concept.domain || "일반"} • ${
                           concept.concept_info?.difficulty || "초급"
                         }
                           </div>
                         </div>
                       </div>
                     `
                       )
                       .join("")}
                   </div>`
              }
            </div>
          </div>
        </div>
      </div>
    `;

    // 모달 표시
    document.body.insertAdjacentHTML("beforeend", modalHTML);

    // 닫기 이벤트
    document
      .getElementById("close-mastered-modal")
      .addEventListener("click", () => {
        document.getElementById("mastered-words-modal").remove();
      });

    // 배경 클릭으로 닫기
    document
      .getElementById("mastered-words-modal")
      .addEventListener("click", (e) => {
        if (e.target.id === "mastered-words-modal") {
          document.getElementById("mastered-words-modal").remove();
        }
      });

    console.log(
      `✅ 마스터한 단어 목록 표시 완료: ${masteredConcepts.length}개`
    );
  } catch (error) {
    console.error("❌ 마스터한 단어 목록 조회 중 오류:", error);
    showError("마스터한 단어 목록을 불러오는 중 오류가 발생했습니다.");
  }
}

// 📊 총 단어수 상세 정보 표시
async function showTotalWordsDetails() {
  try {
    console.log("📊 총 단어수 상세 정보 조회 중...");

    if (!currentUser) return;

    // 사용자가 학습한 개념들 조회
    const progressQuery = query(
      collection(db, "user_progress"),
      where("user_email", "==", currentUser.email)
    );

    const progressSnapshot = await getDocs(progressQuery);
    const studiedConcepts = [];

    // 학습한 개념들 수집
    for (const docSnapshot of progressSnapshot.docs) {
      const progressData = docSnapshot.data();

      // 개념 정보 조회
      const conceptRef = doc(db, "concepts", progressData.concept_id);
      const conceptDoc = await getDoc(conceptRef);
      if (conceptDoc.exists()) {
        const conceptData = conceptDoc.data();
        const masteryLevel = progressData.overall_mastery?.level || 0;
        studiedConcepts.push({
          id: progressData.concept_id,
          masteryLevel,
          ...conceptData,
        });
      }
    }

    // 마스터리 레벨 순으로 정렬
    studiedConcepts.sort((a, b) => b.masteryLevel - a.masteryLevel);

    const modalHTML = `
      <div id="total-words-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg max-w-5xl w-full mx-4 max-h-[85vh] overflow-hidden">
          <div class="flex justify-between items-center p-6 border-b">
            <h2 class="text-2xl font-bold text-gray-800">
              📊 총 단어수 및 학습 현황 (${studiedConcepts.length}개)
            </h2>
            <button id="close-total-words-modal" class="text-gray-500 hover:text-gray-700 text-2xl">
              ✕
            </button>
          </div>
          <div class="p-6 overflow-y-auto max-h-[70vh]">
            <!-- 전체 현황 요약 -->
            <div class="bg-blue-50 rounded-lg p-4 mb-6">
              <h3 class="font-semibold text-blue-800 mb-3">📚 전체 현황</h3>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="text-center">
                  <div class="text-2xl font-bold text-blue-600">${
                    userProgressData.totalConcepts
                  }</div>
                  <div class="text-sm text-gray-600">데이터베이스 총 개념</div>
                </div>
                <div class="text-center">
                  <div class="text-2xl font-bold text-green-600">${
                    userProgressData.studiedConcepts
                  }</div>
                  <div class="text-sm text-gray-600">학습 시작한 개념</div>
                </div>
                <div class="text-center">
                  <div class="text-2xl font-bold text-purple-600">${
                    userProgressData.totalConcepts > 0
                      ? Math.round(
                          (userProgressData.studiedConcepts /
                            userProgressData.totalConcepts) *
                            100
                        )
                      : 0
                  }%</div>
                  <div class="text-sm text-gray-600">학습 진행률</div>
                </div>
              </div>
            </div>

            <!-- 학습한 단어 목록 -->
            <div class="border-t pt-6">
              <h3 class="text-lg font-semibold text-gray-800 mb-4">📖 학습한 단어 목록</h3>
              ${
                studiedConcepts.length === 0
                  ? '<div class="text-center py-8 text-gray-500">아직 학습을 시작한 단어가 없습니다. 학습을 시작해보세요! 📚</div>'
                  : `<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                     ${studiedConcepts
                       .map((concept) => {
                         let bgColor = "from-red-50 to-red-100";
                         let borderColor = "border-red-400";
                         let badgeColor = "bg-red-500";

                         if (concept.masteryLevel >= 60) {
                           bgColor = "from-green-50 to-green-100";
                           borderColor = "border-green-400";
                           badgeColor = "bg-green-500";
                         } else if (concept.masteryLevel >= 30) {
                           bgColor = "from-yellow-50 to-yellow-100";
                           borderColor = "border-yellow-400";
                           badgeColor = "bg-yellow-500";
                         } else if (concept.masteryLevel >= 1) {
                           bgColor = "from-blue-50 to-blue-100";
                           borderColor = "border-blue-400";
                           badgeColor = "bg-blue-500";
                         }

                         return `
                           <div class="bg-gradient-to-r ${bgColor} border-l-4 ${borderColor} p-4 rounded-lg">
                             <div class="flex items-center justify-between mb-2">
                               <span class="text-lg font-semibold text-gray-800">
                                 ${
                                   concept.expressions?.korean?.word ||
                                   concept.expressions?.english?.word ||
                                   "단어"
                                 }
                               </span>
                               <span class="${badgeColor} text-white px-2 py-1 rounded-full text-xs font-bold">
                                 ${Math.round(concept.masteryLevel)}%
                               </span>
                             </div>
                             <div class="text-sm text-gray-600 space-y-1">
                               ${
                                 concept.expressions?.english?.word
                                   ? `<div>🇺🇸 ${concept.expressions.english.word}</div>`
                                   : ""
                               }
                               ${
                                 concept.expressions?.japanese?.word
                                   ? `<div>🇯🇵 ${concept.expressions.japanese.word}</div>`
                                   : ""
                               }
                               ${
                                 concept.expressions?.chinese?.word
                                   ? `<div>🇨🇳 ${concept.expressions.chinese.word}</div>`
                                   : ""
                               }
                               <div class="text-gray-500 text-xs mt-2">
                                 ${concept.domain || "일반"} • ${
                           concept.concept_info?.difficulty || "초급"
                         }
                               </div>
                             </div>
                           </div>
                         `;
                       })
                       .join("")}
                   </div>`
              }
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML("beforeend", modalHTML);

    // 닫기 이벤트
    document
      .getElementById("close-total-words-modal")
      .addEventListener("click", () => {
        document.getElementById("total-words-modal").remove();
      });

    document
      .getElementById("total-words-modal")
      .addEventListener("click", (e) => {
        if (e.target.id === "total-words-modal") {
          document.getElementById("total-words-modal").remove();
        }
      });

    console.log("✅ 총 단어수 상세 정보 표시 완료");
  } catch (error) {
    console.error("❌ 총 단어수 상세 정보 조회 중 오류:", error);
    showError("단어 현황을 불러오는 중 오류가 발생했습니다.");
  }
}

// 🔥 연속 학습 상세 정보 표시
async function showStudyStreakDetails() {
  try {
    console.log("🔥 연속 학습 상세 정보 조회 중...");

    const streakDays = userProgressData.studyStreak || 0;
    const today = new Date();
    const streak7Days = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const isStudyDay = i <= streakDays - 1;
      streak7Days.push({
        date: date.toLocaleDateString("ko-KR", {
          month: "short",
          day: "numeric",
        }),
        dayName: date.toLocaleDateString("ko-KR", { weekday: "short" }),
        isStudyDay: isStudyDay,
      });
    }

    const modalHTML = `
      <div id="study-streak-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
          <div class="flex justify-between items-center p-6 border-b">
            <h2 class="text-2xl font-bold text-gray-800">
              🔥 연속 학습 현황
            </h2>
            <button id="close-study-streak-modal" class="text-gray-500 hover:text-gray-700 text-2xl">
              ✕
            </button>
          </div>
          <div class="p-6">
            <div class="text-center mb-6">
              <div class="text-5xl font-bold text-orange-600 mb-2">${streakDays}일</div>
              <div class="text-gray-600">연속 학습 달성!</div>
            </div>
            
            <div class="bg-orange-50 rounded-lg p-4 mb-6">
              <h3 class="font-semibold text-orange-800 mb-3">📅 최근 7일 학습 현황</h3>
              <div class="grid grid-cols-7 gap-2">
                ${streak7Days
                  .map(
                    (day) => `
                  <div class="text-center">
                    <div class="text-xs text-gray-500 mb-1">${day.dayName}</div>
                    <div class="w-8 h-8 rounded-full flex items-center justify-center mx-auto ${
                      day.isStudyDay
                        ? "bg-orange-500 text-white"
                        : "bg-gray-200 text-gray-400"
                    }">
                      ${day.isStudyDay ? "🔥" : ""}
                    </div>
                    <div class="text-xs text-gray-500 mt-1">${day.date}</div>
                  </div>
                `
                  )
                  .join("")}
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="bg-yellow-50 rounded-lg p-4">
                <h3 class="font-semibold text-yellow-800 mb-2">🎯 목표</h3>
                <div class="text-sm text-gray-600">
                  연속 학습을 통해 꾸준한 학습 습관을 만들어보세요!
                </div>
              </div>
              
              <div class="bg-green-50 rounded-lg p-4">
                <h3 class="font-semibold text-green-800 mb-2">💡 팁</h3>
                <div class="text-sm text-gray-600">
                  매일 조금씩이라도 학습하면 연속 학습이 이어집니다.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML("beforeend", modalHTML);

    // 닫기 이벤트
    document
      .getElementById("close-study-streak-modal")
      .addEventListener("click", () => {
        document.getElementById("study-streak-modal").remove();
      });

    document
      .getElementById("study-streak-modal")
      .addEventListener("click", (e) => {
        if (e.target.id === "study-streak-modal") {
          document.getElementById("study-streak-modal").remove();
        }
      });

    console.log("✅ 연속 학습 상세 정보 표시 완료");
  } catch (error) {
    console.error("❌ 연속 학습 상세 정보 조회 중 오류:", error);
    showError("연속 학습 현황을 불러오는 중 오류가 발생했습니다.");
  }
}

// 🎯 퀴즈 정확도 상세 정보 표시
async function showQuizAccuracyDetails() {
  try {
    console.log("🎯 퀴즈 정확도 상세 정보 조회 중...");

    const accuracy = userProgressData.quizStats?.averageAccuracy || 0;
    const totalQuizzes = userProgressData.totalQuizzes || 0;

    const modalHTML = `
      <div id="quiz-accuracy-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
          <div class="flex justify-between items-center p-6 border-b">
            <h2 class="text-2xl font-bold text-gray-800">
              🎯 퀴즈 성과 상세
            </h2>
            <button id="close-quiz-accuracy-modal" class="text-gray-500 hover:text-gray-700 text-2xl">
              ✕
            </button>
          </div>
          <div class="p-6">
            <div class="text-center mb-6">
              <div class="text-5xl font-bold text-purple-600 mb-2">${accuracy}%</div>
              <div class="text-gray-600">평균 정확도</div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="bg-purple-50 rounded-lg p-4">
                <h3 class="font-semibold text-purple-800 mb-3">📊 퀴즈 통계</h3>
                <div class="space-y-2">
                  <div class="flex justify-between">
                    <span class="text-gray-600">총 퀴즈 횟수:</span>
                    <span class="font-medium">${totalQuizzes}회</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">평균 정확도:</span>
                    <span class="font-medium text-purple-600">${accuracy}%</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">성취 등급:</span>
                    <span class="font-medium">${
                      accuracy >= 90
                        ? "🏆 우수"
                        : accuracy >= 70
                        ? "🥈 양호"
                        : accuracy >= 50
                        ? "🥉 보통"
                        : "📚 연습 필요"
                    }</span>
                  </div>
                </div>
              </div>
              
              <div class="bg-blue-50 rounded-lg p-4">
                <h3 class="font-semibold text-blue-800 mb-3">🎯 성취도 기준</h3>
                <div class="space-y-2 text-sm">
                  <div class="flex items-center">
                    <span class="w-6">🏆</span>
                    <span class="text-gray-600">90% 이상: 우수</span>
                  </div>
                  <div class="flex items-center">
                    <span class="w-6">🥈</span>
                    <span class="text-gray-600">70-89%: 양호</span>
                  </div>
                  <div class="flex items-center">
                    <span class="w-6">🥉</span>
                    <span class="text-gray-600">50-69%: 보통</span>
                  </div>
                  <div class="flex items-center">
                    <span class="w-6">📚</span>
                    <span class="text-gray-600">50% 미만: 연습 필요</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="mt-6 bg-gray-50 rounded-lg p-4">
              <h3 class="font-semibold text-gray-800 mb-2">💡 학습 팁</h3>
              <div class="text-sm text-gray-600">
                ${
                  accuracy >= 80
                    ? "훌륭한 성과입니다! 더 어려운 단계에 도전해보세요."
                    : accuracy >= 60
                    ? "좋은 진전이 있습니다. 틀린 문제를 다시 복습해보세요."
                    : "기초를 탄탄히 다지는 것이 중요합니다. 천천히 반복 학습을 해보세요."
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML("beforeend", modalHTML);

    // 닫기 이벤트
    document
      .getElementById("close-quiz-accuracy-modal")
      .addEventListener("click", () => {
        document.getElementById("quiz-accuracy-modal").remove();
      });

    document
      .getElementById("quiz-accuracy-modal")
      .addEventListener("click", (e) => {
        if (e.target.id === "quiz-accuracy-modal") {
          document.getElementById("quiz-accuracy-modal").remove();
        }
      });

    console.log("✅ 퀴즈 정확도 상세 정보 표시 완료");
  } catch (error) {
    console.error("❌ 퀴즈 정확도 상세 정보 조회 중 오류:", error);
    showError("퀴즈 성과를 불러오는 중 오류가 발생했습니다.");
  }
}

// 🎮 게임 통계 상세 모달 표시
async function showGameStatsDetails() {
  try {
    console.log("🎮 게임 통계 상세 정보 표시");

    if (!userProgressData.gameResults) {
      await loadGameStats();
    }

    const gameResults = userProgressData.gameResults || [];
    const gameStats = calculateGameStats(gameResults);

    // 모달 HTML 생성
    const modalHTML = `
      <div id="game-stats-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <!-- 모달 헤더 -->
          <div class="flex justify-between items-center p-6 border-b border-gray-200">
            <div class="flex items-center">
              <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                <i class="fas fa-gamepad text-purple-600"></i>
              </div>
              <div>
                <h2 class="text-xl font-bold text-gray-900">게임 통계</h2>
                <p class="text-sm text-gray-500">언어 게임 성과 및 기록</p>
              </div>
            </div>
            <button id="close-game-stats-modal" class="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
          </div>

          <!-- 모달 콘텐츠 -->
          <div class="p-6">
            <!-- 전체 통계 -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div class="bg-purple-50 rounded-lg p-4 text-center">
                <div class="text-2xl font-bold text-purple-600">${
                  gameStats.totalGames
                }</div>
                <div class="text-sm text-gray-600">총 게임 수</div>
              </div>
              <div class="bg-green-50 rounded-lg p-4 text-center">
                <div class="text-2xl font-bold text-green-600">${
                  gameStats.bestScore
                }</div>
                <div class="text-sm text-gray-600">최고 점수</div>
              </div>
              <div class="bg-blue-50 rounded-lg p-4 text-center">
                <div class="text-2xl font-bold text-blue-600">${
                  gameStats.avgScore
                }</div>
                <div class="text-sm text-gray-600">평균 점수</div>
              </div>
              <div class="bg-orange-50 rounded-lg p-4 text-center">
                <div class="text-2xl font-bold text-orange-600">${
                  gameStats.successRate
                }%</div>
                <div class="text-sm text-gray-600">완료율</div>
              </div>
            </div>

            <!-- 게임 종류별 통계 -->
            <div class="mb-8">
              <h3 class="text-lg font-semibold mb-4 flex items-center">
                <i class="fas fa-chart-bar text-purple-600 mr-2"></i>
                게임별 성과
              </h3>
              <div class="bg-gray-50 rounded-lg p-4">
                ${generateGameTypeStats(gameResults)}
              </div>
            </div>

            <!-- 최근 게임 기록 -->
            <div class="mb-6">
              <h3 class="text-lg font-semibold mb-4 flex items-center">
                <i class="fas fa-clock text-purple-600 mr-2"></i>
                최근 게임 기록
              </h3>
              <div class="space-y-3 max-h-64 overflow-y-auto">
                ${generateRecentGamesList(gameResults)}
              </div>
            </div>

            <!-- 주간 활동 -->
            <div class="mb-6">
              <h3 class="text-lg font-semibold mb-4 flex items-center">
                <i class="fas fa-calendar-week text-purple-600 mr-2"></i>
                이번 주 게임 활동
              </h3>
              <div class="bg-blue-50 rounded-lg p-4">
                <div class="text-center">
                  <div class="text-2xl font-bold text-blue-600">${
                    gameStats.gamesThisWeek
                  }</div>
                  <div class="text-sm text-gray-600">이번 주 플레이한 게임</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 모달 푸터 -->
          <div class="flex justify-end gap-3 p-6 border-t border-gray-200">
            <button id="go-to-games" class="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
              <i class="fas fa-gamepad mr-2"></i>게임하러 가기
            </button>
            <button id="close-modal-footer" class="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors">
              닫기
            </button>
          </div>
        </div>
      </div>
    `;

    // 모달 추가
    document.body.insertAdjacentHTML("beforeend", modalHTML);

    // 이벤트 리스너 추가
    document
      .getElementById("close-game-stats-modal")
      .addEventListener("click", closeModal);
    document
      .getElementById("close-modal-footer")
      .addEventListener("click", closeModal);
    document.getElementById("go-to-games").addEventListener("click", () => {
      const userLanguage = localStorage.getItem("userLanguage") || "ko";
      window.location.href = `../../locales/${userLanguage}/games.html`;
    });

    // 모달 외부 클릭 시 닫기
    document
      .getElementById("game-stats-modal")
      .addEventListener("click", (e) => {
        if (e.target.id === "game-stats-modal") {
          closeModal();
        }
      });

    function closeModal() {
      const modal = document.getElementById("game-stats-modal");
      if (modal) {
        modal.remove();
      }
    }
  } catch (error) {
    console.error("❌ 게임 통계 표시 중 오류:", error);
    showError("게임 통계를 불러오는 중 오류가 발생했습니다.");
  }
}

// 게임 종류별 통계 생성
function generateGameTypeStats(gameResults) {
  const gameTypes = {};

  gameResults.forEach((game) => {
    const type = game.gameType || "unknown";
    if (!gameTypes[type]) {
      gameTypes[type] = {
        count: 0,
        totalScore: 0,
        maxScore: 0,
        successCount: 0,
      };
    }

    gameTypes[type].count++;
    gameTypes[type].totalScore += game.score || 0;
    gameTypes[type].maxScore = Math.max(
      gameTypes[type].maxScore,
      game.score || 0
    );
    if (game.success) {
      gameTypes[type].successCount++;
    }
  });

  const gameTypeNames = {
    "word-matching": "단어 맞추기",
    "word-scramble": "단어 섞기",
    "memory-game": "기억 게임",
  };

  if (Object.keys(gameTypes).length === 0) {
    return '<div class="text-center text-gray-500 py-4">아직 플레이한 게임이 없습니다.</div>';
  }

  return Object.entries(gameTypes)
    .map(([type, stats]) => {
      const avgScore =
        stats.count > 0 ? Math.round(stats.totalScore / stats.count) : 0;
      const successRate =
        stats.count > 0
          ? Math.round((stats.successCount / stats.count) * 100)
          : 0;
      const typeName = gameTypeNames[type] || type;

      return `
      <div class="bg-white rounded-lg p-4 mb-3">
        <div class="flex justify-between items-center mb-3">
          <h4 class="font-semibold text-gray-800">${typeName}</h4>
          <span class="text-sm text-gray-500">${stats.count}게임</span>
        </div>
        <div class="grid grid-cols-3 gap-4 text-center">
          <div>
            <div class="text-lg font-bold text-blue-600">${avgScore}</div>
            <div class="text-xs text-gray-500">평균 점수</div>
          </div>
          <div>
            <div class="text-lg font-bold text-green-600">${stats.maxScore}</div>
            <div class="text-xs text-gray-500">최고 점수</div>
          </div>
          <div>
            <div class="text-lg font-bold text-purple-600">${successRate}%</div>
            <div class="text-xs text-gray-500">완료율</div>
          </div>
        </div>
      </div>
    `;
    })
    .join("");
}

// 최근 게임 목록 생성
function generateRecentGamesList(gameResults) {
  if (!gameResults || gameResults.length === 0) {
    return '<div class="text-center text-gray-500 py-4">최근 게임 기록이 없습니다.</div>';
  }

  const gameTypeNames = {
    "word-matching": "단어 맞추기",
    "word-scramble": "단어 섞기",
    "memory-game": "기억 게임",
  };

  return gameResults
    .slice(0, 5)
    .map((game) => {
      const typeName = gameTypeNames[game.gameType] || game.gameType;
      const successIcon = game.success ? "✅" : "❌";
      const scoreColor = game.success ? "text-green-600" : "text-red-600";

      return `
      <div class="bg-white rounded-lg p-4 border border-gray-200">
        <div class="flex justify-between items-center">
          <div class="flex items-center">
            <span class="text-lg mr-3">${successIcon}</span>
            <div>
              <div class="font-medium text-gray-800">${typeName}</div>
              <div class="text-sm text-gray-500">${getTimeAgo(
                game.playedAt
              )}</div>
            </div>
          </div>
          <div class="text-right">
            <div class="font-bold ${scoreColor}">${game.score || 0}점</div>
            ${
              game.accuracy
                ? `<div class="text-sm text-gray-500">${game.accuracy}% 정확도</div>`
                : ""
            }
          </div>
        </div>
      </div>
    `;
    })
    .join("");
}
