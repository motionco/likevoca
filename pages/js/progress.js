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
  getCountFromServer,
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

    // 학습 완료 후 자동 업데이트 확인 (페이지 로드 시)
    await checkLearningCompletionUpdate();

    // 게임 완료 후 자동 업데이트 확인 (페이지 로드 시)
    checkGameCompletionUpdate();

    console.log("✅ 학습 진도 페이지 초기화 완료 (자동 업데이트 확인 포함)");
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

  // 🔥 연속 학습 카드 클릭 이벤트
  const studyStreakCard = document.getElementById("study-streak-card");
  if (studyStreakCard) {
    studyStreakCard.addEventListener("click", showStudyStreakDetails);
    studyStreakCard.title = "클릭하여 연속 학습 현황 보기";
  }

  // 🎯 퀴즈 정확도 카드 클릭 이벤트
  const quizAccuracyCard = document.getElementById("quiz-accuracy-card");
  if (quizAccuracyCard) {
    quizAccuracyCard.addEventListener("click", showQuizAccuracyDetails);
    quizAccuracyCard.title = "클릭하여 퀴즈 정확도 상세 보기";
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

      // 📚 주기적으로 학습 완료 상태 확인 (5분마다 - 읽기 사용량 최적화)
      setInterval(() => {
        if (currentUser) {
          checkLearningCompletionUpdate();
        }
      }, 5 * 60 * 1000); // 5분으로 늘림

      // 📚 페이지 포커스 시 학습 완료 상태 확인 (throttling 적용)
      let lastFocusCheck = 0;
      window.addEventListener("focus", () => {
        if (currentUser && Date.now() - lastFocusCheck > 30000) { // 30초 throttling
          console.log("📚 페이지 포커스 - 학습 완료 상태 확인");
          checkLearningCompletionUpdate();
          lastFocusCheck = Date.now();
        }
      });

      // 📚 페이지 가시성 변경 시 학습 완료 상태 확인 (throttling 적용)
      let lastVisibilityCheck = 0;
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible" && currentUser && Date.now() - lastVisibilityCheck > 30000) { // 30초 throttling
          console.log("📚 페이지 가시성 변경 - 학습 완료 상태 확인");
          checkLearningCompletionUpdate();
          lastVisibilityCheck = Date.now();
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

    // Firestore에서 게임 기록 로드 (records 컬렉션) - 읽기 용량 최적화
    const gameRecordsRef = collection(db, "game_records");
    const q = query(
      gameRecordsRef,
      where("user_email", "==", currentUser.email),
      limit(100) // 50개에서 100개로 늘림 (더 정확한 통계)
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

    // 1. 전체 진도 데이터 완전히 새로 로드
    console.log("🔄 전체 진도 데이터 완전 재로드...");
    userProgressData = {
      achievements: {},
      weeklyActivity: [],
      categoryProgress: {},
      languageMastery: {},
      recentActivities: [],
      goals: {},
      concepts: [],
    };

    await loadDetailedProgressData();
    console.log("🔄 전체 진도 데이터 재로드 완료");

    // 2. 최신 활동 여러 번 시도하여 로드
    console.log("🔄 최신 활동 강화된 로드 시작...");
    let retryCount = 0;
    let latestActivities = [];

    while (retryCount < 5) {
      // 5번까지 시도
      console.log(`🔄 최신 활동 로드 시도 ${retryCount + 1}/5`);
      latestActivities = await loadRecentActivities();

      // 방금 완료한 학습이 포함되어 있는지 확인 (10분 이내)
      const hasRecentLearning = latestActivities.some(
        (activity) =>
          activity.type === "learning" &&
          activity.timestamp &&
          new Date() -
            (activity.timestamp.toDate
              ? activity.timestamp.toDate()
              : new Date(activity.timestamp)) <
            600000 // 10분 이내
      );

      console.log(
        `🔍 최신 학습 활동 감지: ${hasRecentLearning}, 총 활동: ${latestActivities.length}`
      );

      if (hasRecentLearning || retryCount >= 4) {
        console.log(`✅ 최신 활동 로드 완료 (시도 ${retryCount + 1}번)`);
        break;
      }

      retryCount++;
      await new Promise((resolve) => setTimeout(resolve, 2000)); // 2초 대기
    }

    userProgressData.recentActivities = latestActivities;
    console.log(
      "📊 최신 활동 로드 최종 완료:",
      userProgressData.recentActivities.length,
      "개"
    );

    // 3. 모든 UI 요소 순차적 업데이트
    console.log("🔄 UI 순차적 업데이트 시작");

    updateStatsSummary(); // 통계 요약 먼저
    updateAchievements(); // 성취도 업데이트
    displayRecentActivities(); // 최근 활동 표시
    createCharts(); // 차트 마지막에 업데이트

    console.log("✅ 학습 통계 실시간 새로고침 완료 (전체 데이터 재로드 포함)");
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

// 학습 데이터 캐시 (읽기 용량 최적화)
let learningDataCache = {
  data: null,
  lastUpdate: null,
  cacheDuration: 10 * 60 * 1000, // 10분 캐시 (기존 30초에서 늘림)
  isValid() {
    return (
      this.data &&
      this.lastUpdate &&
      Date.now() - this.lastUpdate < this.cacheDuration
    );
  },
  set(data) {
    this.data = data;
    this.lastUpdate = Date.now();
  },
  clear() {
    this.data = null;
    this.lastUpdate = null;
  },
  getTimestamp() {
    return this.lastUpdate;
  },
};

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

            // 1. 스마트 캐시 무효화 (전체 초기화 대신 선택적 무효화)
            if (learningDataCache.isValid()) {
              console.log("� 기존 캐시가 유효함 - 부분 업데이트만 수행");
              // 캐시는 유지하되 타임스탬프만 조정하여 다음 조회 시 갱신되도록 함
              learningDataCache.lastUpdate = Date.now() - (learningDataCache.cacheDuration - 60000); // 1분 후 만료
            } else {
              console.log("🗑️ 캐시 무효화 - 새로운 데이터 필요");
              learningDataCache.clear();
            }

            // 2. 최신 학습 기록 로드 (즉시 실행, 지연 제거)
            console.log("🔄 최신 학습 기록 로드 시작");

            // 3. 전체 진도 데이터 로드 (캐시 활용)
            try {
              userProgressData = {
                achievements: {},
                weeklyActivity: [],
                categoryProgress: {},
                languageMastery: {},
                recentActivities: [],
                goals: {},
                concepts: [],
              };

              await loadDetailedProgressData(true); // 강제 재로드
              console.log("🔄 전체 진도 데이터 완전 재로드 완료");
            } catch (reloadError) {
              console.error("❌ 진도 데이터 재로드 실패:", reloadError);
              // 오류 발생 시 기본값으로 설정
              userProgressData.achievements = {
                avgSessionQuality: 0,
                totalLearningSessions: 0,
                totalStudyTime: 0,
              };
            }

            // 3. 최신 활동 데이터 새로 로드 (여러 번 시도)
            let retryCount = 0;
            let latestActivities = [];

            while (retryCount < 5) {
              // 5번 시도로 증가
              console.log(`🔄 최신 활동 로드 시도 ${retryCount + 1}/5`);
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
                    600000 // 10분 이내로 확장
              );

              console.log(
                `🔍 최신 학습 활동 감지: ${hasRecentLearning}, 총 활동: ${latestActivities.length}`
              );

              if (hasRecentLearning || retryCount >= 4) {
                break;
              }

              retryCount++;
              await new Promise((resolve) => setTimeout(resolve, 2000)); // 2초 대기로 증가
            }

            userProgressData.recentActivities = latestActivities;
            console.log(
              "🔄 최신 활동 데이터 로드 완료:",
              userProgressData.recentActivities?.length || 0,
              "개"
            );

            // 4. UI 전체 업데이트
            console.log("🔄 UI 전체 업데이트 시작");
            displayRecentActivities();
            updateStatsSummary();
            updateAchievements();
            createCharts();
            await updateGoalsProgress();

            console.log("✅ 학습 완료 후 진도 페이지 자동 업데이트 완료");
          } catch (error) {
            console.error("❌ 학습 완료 후 자동 업데이트 중 오류:", error);
          }
        }, 1000); // 1초 후 시작 (빠른 시작)

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

// 기존 상세 진도 데이터 로드 (호환성 위해 유지) - 인덱스 오류 임시 방지
async function loadDetailedProgressData(forceReload = false) {
  try {
    // 🔍 캐시 확인 - 유효한 캐시가 있고 강제 재로드가 아닌 경우에만 사용
    if (!forceReload && learningDataCache.isValid()) {
      console.log("💾 유효한 캐시 데이터 사용 중, 새로운 로드 생략");
      const cachedData = learningDataCache.data;

      // 캐시된 데이터로 userProgressData 업데이트
      if (cachedData && userProgressData.achievements) {
        userProgressData.achievements.totalLearningSessions =
          cachedData.validLearningSessionsCount || 0;
        userProgressData.achievements.avgSessionQuality =
          cachedData.avgSessionQuality || 0; // 세션이 없으면 0%
        userProgressData.achievements.totalStudyTime = Math.round(
          cachedData.totalStudyTime || 0
        );

        console.log("💾 캐시에서 복원된 학습 통계:", {
          totalSessions: cachedData.validLearningSessionsCount,
          avgQuality: cachedData.avgSessionQuality,
          totalTime: Math.round(cachedData.totalStudyTime),
          cacheAge: Date.now() - learningDataCache.getTimestamp(),
        });

        // 🔄 캐시 데이터로 UI 업데이트 강제 실행
        console.log("🔄 캐시 데이터 기반 UI 업데이트 실행");
        updateAchievements();
      }

      return; // 캐시 사용으로 조기 반환
    }

    if (forceReload) {
      console.log("🔄 강제 재로드 모드: 캐시 무시하고 새로운 데이터 로드");
    } else {
      console.log("🔄 캐시 무효 또는 없음, 새로운 데이터 로드 시작");
    }

    // 1. 각 컬렉션별 개념 수 계산 (count() 함수 사용으로 읽기 사용량 최소화)
    let conceptCounts = {
      vocabulary: 0,
      examples: 0,
      grammar: 0,
      total: 0
    };
    
    try {
      console.log("🔍 사용자가 학습한 개념 수 계산 시작...");
      
      // 실제 학습한 개념 수는 progress 기록에서 계산
      // 전체 DB 개념 수가 아닌 사용자가 실제 학습한 개념들만 카운트
      conceptCounts = {
        vocabulary: 0,
        examples: 0, 
        grammar: 0,
        total: 0
      };
      
      // 실제 학습한 개념 수는 사용자 진도 기록에서 동적으로 계산
      console.log("📊 사용자가 실제 학습한 개념 수는 진도 기록에서 계산됩니다");
    } catch (conceptsError) {
      console.error("❌ 개념 수 계산 실패:", conceptsError);
      // 기본값 설정
      conceptCounts = {
        vocabulary: 0,
        examples: 0,
        grammar: 0,
        total: 0
      };
    }
    
    let totalConcepts = conceptCounts.total;

    // 1.5. 실제 학습한 언어 정보 수집 (임시 비활성화)
    let languageLearningSnapshot = { docs: [] };
    console.log("⚠️ 언어 학습 기록 쿼리 임시 비활성화 (인덱스 오류 방지)");
    /* 
    try {
      console.log("🔍 언어 학습 기록 쿼리 시작...");
      const languageLearningQuery = query(
        collection(db, "learning_records"),
        where("user_email", "==", currentUser.email),
        limit(100)
      );
      languageLearningSnapshot = await getDocs(languageLearningQuery);
      console.log("✅ 언어 학습 기록 쿼리 성공");
    } catch (languageError) {
      console.error("❌ 언어 학습 기록 쿼리 실패:", languageError);
      languageLearningSnapshot = { docs: [] };
    }
    */

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
    let progressSnapshot;
    try {
      console.log("🔍 진도 기록 쿼리 시작...");
      const progressQuery = query(
        collection(db, "user_records"),
        where("user_email", "==", currentUser.email)
      );
      progressSnapshot = await getDocs(progressQuery);
      console.log("✅ 진도 기록 쿼리 성공");
    } catch (progressError) {
      console.error("❌ 진도 기록 쿼리 실패:", progressError);
      throw progressError;
    }
    let masteredCount = 0;
    const masteredConceptIds = new Set(); // 고유한 마스터된 개념 ID 추적
    
    // 각 컬렉션별 개념 수 및 마스터 수 추적
    const actualConceptCounts = {
      vocabulary: 0,
      examples: 0,
      grammar: 0,
      total: 0
    };
    
    const masteredCountsByType = {
      vocabulary: 0,
      examples: 0,
      grammar: 0,
      total: 0
    };

    // 중복 제거를 위한 개념 ID 추적
    const studiedConceptIds = new Set();

    // 진도 데이터 처리
    for (const doc of progressSnapshot.docs) {
      const data = doc.data();
      userProgressData.concepts.push({
        id: doc.id,
        ...data,
      });

      // 개념 ID 추출 (중복 제거용)
      const conceptId = data.concept_id || doc.id;
      
      // 이미 처리된 개념은 스킵 (중복 제거)
      if (studiedConceptIds.has(conceptId)) {
        continue;
      }
      studiedConceptIds.add(conceptId);

      // 개념 유형 판별 (collection_type 또는 concept_type으로 구분)
      const conceptType = data.collection_type || data.concept_type || 'vocabulary';
      
      // 각 컬렉션별 개념 수 증가
      if (conceptType === 'vocabulary' || conceptType === 'concepts') {
        actualConceptCounts.vocabulary++;
      } else if (conceptType === 'examples') {
        actualConceptCounts.examples++;
      } else if (conceptType === 'grammar') {
        actualConceptCounts.grammar++;
      }
      actualConceptCounts.total++;

      // 마스터된 개념 카운트 기준:
      // 1. 학습 레벨 50% 이상 (충분히 학습한 상태)
      // 2. 또는 노출 횟수 3회 이상 (학습 세션에서 단어가 나타난 횟수)
      // 3. 또는 학습 횟수 3회 이상 (사용자가 실제로 학습한 횟수)
      // 4. 또는 인식률 50% 이상 (퀴즈나 게임에서 올바르게 인식한 비율)

      // vocabulary_mastery에서 데이터 가져오기 (실제 저장 위치)
      const masteryLevel = data.overall_mastery?.level || 0;
      const exposureCount = data.vocabulary_mastery?.exposure_count || 0; // 학습 세션에서 노출된 횟수
      const studyCount = data.vocabulary_mastery?.study_count || 0; // 실제 학습한 횟수
      const recognition = data.vocabulary_mastery?.recognition || 0; // 퀴즈/게임에서 인식 성공률

      const isMastered =
        masteryLevel >= 50 ||
        exposureCount >= 3 ||
        studyCount >= 3 ||
        recognition >= 50; // 단어 인식률도 마스터 기준에 추가

      if (isMastered) {
        masteredConceptIds.add(conceptId);
        
        // 각 컬렉션별 마스터 수 증가
        if (conceptType === 'vocabulary' || conceptType === 'concepts') {
          masteredCountsByType.vocabulary++;
        } else if (conceptType === 'examples') {
          masteredCountsByType.examples++;
        } else if (conceptType === 'grammar') {
          masteredCountsByType.grammar++;
        }
        masteredCountsByType.total++;
      }

      // 언어별, 카테고리별 분류를 위한 개념 정보 처리
      const studiedLanguages = conceptLanguageMap.get(conceptId) || new Set();
      await processConceptProgress(data, userProgressData, studiedLanguages);
    }

    // 실제 개념 수 업데이트 (사용자가 학습한 개념들만)
    conceptCounts = actualConceptCounts;
    totalConcepts = conceptCounts.total;
    masteredCount = masteredCountsByType.total;
    
    console.log("📊 실제 학습한 개념 수 업데이트:", conceptCounts);
    console.log("� 마스터한 개념 수 업데이트:", masteredCountsByType);

    // 사용자 진도 데이터에 상세 정보 저장
    userProgressData.conceptCounts = conceptCounts;
    userProgressData.masteredCountsByType = masteredCountsByType;
    userProgressData.totalConcepts = totalConcepts;
    userProgressData.studiedConcepts = progressSnapshot.size;
    userProgressData.masteredConcepts = masteredCount;
    userProgressData.totalWords = conceptCounts.vocabulary; // 순수 단어 수
    userProgressData.masteredWords = masteredCountsByType.vocabulary; // 마스터한 단어 수

    console.log("📊 마스터리 통계:", {
      conceptCounts,
      masteredCountsByType,
      totalConcepts,
      masteredCount,
      masteredConceptIds: Array.from(masteredConceptIds),
      progressSnapshot: progressSnapshot.size,
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

    // 3-5. 모든 활동 기록을 한 번에 로드 (읽기 사용량 최적화)
    let [quizSnapshot, learningSnapshot, gameSnapshot] = [null, null, null];
    let totalQuizzes = 0;
    let totalCorrect = 0;
    let totalQuestions = 0;
    let totalLearningSessionsCount = 0;

    try {
      console.log("🔍 모든 활동 기록 병렬 로드 시작...");
      
      // 모든 활동 기록을 병렬로 로드 (읽기 사용량 최적화)
      [quizSnapshot, learningSnapshot, gameSnapshot] = await Promise.all([
        getDocs(query(
          collection(db, "quiz_records"),
          where("user_email", "==", currentUser.email),
          limit(50)
        )),
        getDocs(query(
          collection(db, "learning_records"),
          where("user_email", "==", currentUser.email),
          limit(100)
        )),
        getDocs(query(
          collection(db, "game_records"),
          where("user_email", "==", currentUser.email),
          limit(100)
        ))
      ]);
      
      console.log("✅ 모든 활동 기록 로드 완료");
    } catch (error) {
      console.error("❌ 활동 기록 로드 실패:", error);
      throw error;
    }

    // 퀴즈 데이터 처리
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

    // 학습 데이터 처리
    console.log("� 학습 기록 처리 시작...");
    totalLearningSessionsCount = learningSnapshot.docs.length;

    // 클라이언트 측에서 시간순 정렬 (최신순)
    if (learningSnapshot.docs.length > 0) {
      learningSnapshot.docs.sort((a, b) => {
        const timestampA =
          a.data().timestamp?.toDate?.() || new Date(a.data().timestamp || 0);
        const timestampB =
          b.data().timestamp?.toDate?.() || new Date(b.data().timestamp || 0);
        return timestampB.getTime() - timestampA.getTime(); // 최신순 정렬
      });
    }

    console.log("✅ 학습 기록 처리 완료");

    console.log(
      `📊 학습 기록 로드: ${learningSnapshot.docs.length}개 세션 (분석용), 추정 총 ${totalLearningSessionsCount}개 세션`
    );

    // 캐시 업데이트를 위한 결과 저장 준비
    const learningResults = {
      totalStudyTime: 0,
      avgSessionQuality: 0,
      qualityCount: 0,
      totalCorrectAnswers: 0,
      totalInteractions: 0,
      validLearningSessionsCount: 0,
    };

    // 학습 결과 저장 준비 (기본값으로 설정)
    learningResults.totalStudyTime = 0;
    learningResults.avgSessionQuality = 0; // 기본값 (세션이 없으면 0%)
    learningResults.qualityCount = 0;
    learningResults.totalCorrectAnswers = 0;
    learningResults.totalInteractions = 0;
    learningResults.validLearningSessionsCount = 0;

    // 학습 시간 및 학습 효율 계산 (활성화)
    console.log("📊 학습 효율 계산 시작:", {
      learningRecordsCount: learningSnapshot.docs.length,
    });

    // 학습 데이터 처리 루프 (활성화)
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
        // 패턴분석은 concepts_studied 중심, 실습문제는 total_interactions 중심
        // 문법 활동 타입별 세부 검증
        const learningMode = data.learning_mode || data.mode || "";

        if (learningMode === "pattern" || learningMode === "패턴분석") {
          // 패턴분석의 경우 concepts_studied가 주요 지표
          isValidSession = recordConceptsStudied > 0;
          console.log(`🔍 문법 패턴분석 세션 검증: ${doc.id}`, {
            mode: learningMode,
            conceptsStudied: recordConceptsStudied,
            isValid: isValidSession,
          });
        } else {
          // 실습문제나 기타 문법 활동
          isValidSession =
            recordConceptsStudied > 0 ||
            recordInteractions > 0 ||
            recordCorrectAnswers > 0;
        }
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
            `✅ 유효한 학습 세션 카운트: ${
              doc.id
            } (활동: ${activityType}, 모드: ${
              data.learning_mode || data.mode || "N/A"
            }, 개념: ${recordConceptsStudied}, 시간: ${recordSessionDuration}, 상호작용: ${recordInteractions})`
          );
        } else {
          console.log(
            `❌ 무효한 학습 세션: ${doc.id} (활동: ${activityType}, 모든 값이 0)`
          );
        }
      }

      if (isValidSession) {
        learningResults.validLearningSessionsCount++;
      }

      // 학습 시간 계산 (session_duration이 0인 경우 최소값 적용)
      let adjustedSessionDuration = recordSessionDuration;
      if (adjustedSessionDuration === 0 && recordConceptsStudied > 0) {
        // 개념을 학습했다면 최소 1분으로 계산
        adjustedSessionDuration = 1;
      }
      learningResults.totalStudyTime += adjustedSessionDuration;

      // 학습 효율 계산 (다양한 요소 고려)
      const conceptsStudied = recordConceptsStudied;
      const correctAnswers = data.correct_answers || 0;
      const sessionInteractions = data.total_interactions || conceptsStudied;

      // learning_records 필드 분석 로그 제거 (디버깅 완료)

      // 저장된 session_quality 사용 (학습 페이지에서 계산되어 저장된 값)
      let sessionQuality = data.session_quality || 0;

      // 학습 효율 디버깅 (최신 5개 세션)
      if (learningSnapshot.docs.indexOf(doc) < 5) {
        console.log("🔍 학습 세션 효율 분석:", {
          docId: doc.id,
          type: activityType,
          learning_mode: data.learning_mode,
          storedSessionQuality: data.session_quality,
          currentSessionQuality: sessionQuality,
          conceptsStudied,
          sessionDuration: adjustedSessionDuration,
          correctAnswers,
          totalInteractions: recordInteractions,
          hasSessionQuality:
            data.session_quality !== undefined && data.session_quality !== null,
          willCalculate:
            sessionQuality === 0 &&
            (conceptsStudied > 0 || adjustedSessionDuration > 0),
        });
      }

      // session_quality가 없는 경우에만 계산 (하위 호환성)
      if (
        sessionQuality === 0 &&
        (conceptsStudied > 0 || adjustedSessionDuration > 0)
      ) {
        // 학습 페이지와 동일한 계산 방식
        const baseScore = Math.min(60, conceptsStudied * 6);

        const conceptsPerMinute =
          conceptsStudied / Math.max(adjustedSessionDuration, 1);
        let timeScore = 0;
        if (conceptsPerMinute >= 1 && conceptsPerMinute <= 10) {
          timeScore = 20;
        } else if (conceptsPerMinute > 10) {
          timeScore = Math.max(5, 20 - (conceptsPerMinute - 10) * 1);
        } else {
          timeScore = Math.max(5, conceptsPerMinute * 20);
        }

        const participationScore = Math.min(
          20,
          (correctAnswers / Math.max(conceptsStudied, 1)) * 20
        );

        sessionQuality = Math.min(
          100,
          baseScore + timeScore + participationScore
        );

        if (learningSnapshot.docs.indexOf(doc) < 10) {
          console.log(
            `📊 학습 효율 계산: 기본(${baseScore}) + 시간(${timeScore.toFixed(
              1
            )}) + 참여도(${participationScore.toFixed(
              1
            )}) = ${sessionQuality.toFixed(1)}%`
          );
        }
      }

      // 모든 세션의 학습 효율 점수를 누적 (평균 계산을 위해)
      // 저장된 session_quality 우선 사용, 없으면 계산된 값 사용
      const finalSessionQuality = data.session_quality || sessionQuality;

      if (finalSessionQuality > 0) {
        learningResults.avgSessionQuality += finalSessionQuality;
        learningResults.qualityCount++;

        // 최신 5개 세션의 품질 점수 로깅
        if (learningSnapshot.docs.indexOf(doc) < 5) {
          console.log(
            `✅ 세션 품질 점수 누적: ${doc.id} = ${finalSessionQuality.toFixed(
              1
            )}% (저장됨: ${
              data.session_quality || "없음"
            }, 계산됨: ${sessionQuality.toFixed(1)}%)`
          );
        }
      }
    });

    // 평균 학습 효율 계산
    if (learningResults.qualityCount > 1) {
      learningResults.avgSessionQuality = Math.round(
        learningResults.avgSessionQuality / learningResults.qualityCount
      );
    } else if (learningResults.qualityCount === 0) {
      learningResults.avgSessionQuality = 0; // 세션이 없으면 0%
      learningResults.qualityCount = 0;
    }

    console.log("📊 학습 효율 계산 완료:", {
      totalSessions: learningSnapshot.docs.length,
      validSessions: learningResults.validLearningSessionsCount,
      averageQuality: learningResults.avgSessionQuality,
      totalStudyTime: Math.round(learningResults.totalStudyTime),
      qualityCount: learningResults.qualityCount,
      totalQualityScore:
        learningResults.avgSessionQuality * learningResults.qualityCount,
    });

    // 캐시에 결과 저장
    learningDataCache.set(learningResults);
    console.log("💾 새로운 학습 데이터 캐시 저장:", {
      validSessions: learningResults.validLearningSessionsCount,
      avgQuality: learningResults.avgSessionQuality,
      totalTime: Math.round(learningResults.totalStudyTime),
      cacheTimestamp: learningDataCache.getTimestamp(),
      cacheDuration: learningDataCache.cacheDuration / 1000 + "초",
    });

    // 완료율 계산
    const completionRate =
      totalConcepts > 0
        ? Math.min(100, Math.round((masteredCount / totalConcepts) * 100))
        : 0;

    // 통계 계산 및 설정 (수정된 부분)
    userProgressData.totalConcepts = totalConcepts;
    userProgressData.studiedConcepts = progressSnapshot.size;
    userProgressData.masteredConcepts = masteredCount;
    userProgressData.totalWords = conceptCounts.vocabulary; // 순수 단어 수
    userProgressData.masteredWords = masteredCountsByType.vocabulary; // 마스터한 단어 수
    userProgressData.quizAccuracy = avgQuizAccuracy;

    // 게임 통계 로드 및 계산 (이미 로드된 데이터 사용)
    const gameStats = calculateGameStats(
      gameSnapshot.docs.map((doc) => doc.data())
    );

    // 성취도 데이터 업데이트 (learningResults 사용)
    userProgressData.achievements.totalQuizzes = totalQuizzes;
    userProgressData.achievements.avgQuizAccuracy = avgQuizAccuracy;
    userProgressData.achievements.totalGames = gameStats.totalGames;
    userProgressData.achievements.avgGameScore = gameStats.avgScore;
    userProgressData.achievements.totalLearningSessions =
      totalLearningSessionsCount; // 정확한 총 세션 수 사용
    userProgressData.achievements.avgSessionQuality =
      learningResults.avgSessionQuality;
    userProgressData.achievements.totalStudyTime = Math.round(
      learningResults.totalStudyTime
    );
    userProgressData.achievements.completionRate = completionRate;
    userProgressData.achievements.averageAccuracy = avgQuizAccuracy;

    console.log("📊 학습 세션 통계 (최적화):", {
      estimatedTotalSessions: totalLearningSessionsCount, // 추정 총 세션 수
      analyzedSessions: learningSnapshot.docs.length, // 분석된 세션 수
      avgSessionQuality: learningResults.avgSessionQuality,
      totalStudyTime: Math.round(learningResults.totalStudyTime),
      validAnalyzedSessions: learningResults.validLearningSessionsCount,
      cacheUsed: learningDataCache.isValid(),
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
      estimatedTotalSessions: totalLearningSessionsCount, // 추정 총 세션 수
      analyzedLearningSessions: learningSnapshot.docs.length, // 분석된 세션 수
      avgSessionQuality: learningResults.avgSessionQuality,
      totalStudyTime: Math.round(learningResults.totalStudyTime),
      completionRate,
      recentActivitiesCount: userProgressData.recentActivities.length,
      weeklyActivity: userProgressData.weeklyActivity,
    });

    // 읽기 용량 최적화 상태 리포트
    console.log("📊 읽기 용량 최적화 상태:", {
      learningRecords: "최신 50개 세션",
      quizRecords: "최신 50개 세션",
      gameRecords: "최신 50개 세션",
      cacheEnabled: "30초 캐시 활성화",
      indexOptimized: "복합 인덱스 요구사항 제거",
    });
  } catch (error) {
    console.error("❌ 사용자 진도 데이터 로딩 중 오류:", error);
    console.error("🔍 오류 상세:", {
      message: error.message,
      code: error.code,
      isIndexError: error.message?.includes("index"),
    });
  }
}

// 개념별 진도 처리 - 실제 학습한 언어별로 계산
async function processConceptProgress(
  progressData,
  userProgress,
  studiedLanguages = new Set()
) {
  try {
    // 매개변수 안전성 확인
    if (!progressData || !progressData.concept_id) {
      console.warn("⚠️ 유효하지 않은 진도 데이터:", progressData);
      return;
    }

    if (!userProgress) {
      console.warn("⚠️ userProgress가 null입니다");
      return;
    }

    // studiedLanguages 안전성 확인
    if (!studiedLanguages || typeof studiedLanguages.forEach !== "function") {
      studiedLanguages = new Set();
    }

    // 개념 정보 조회
    const conceptRef = doc(db, "concepts", progressData.concept_id);
    const conceptSnap = await getDoc(conceptRef);

    if (!conceptSnap.exists()) {
      // 개념 데이터를 찾을 수 없음 (로그 제거)
      return;
    }

    const conceptData = conceptSnap.data();
    if (!conceptData) {
      console.warn("⚠️ 개념 데이터가 비어있음:", progressData.concept_id);
      return;
    }

    const category = conceptData.concept_info?.category || "기타";

    // 카테고리별 진도 업데이트
    if (!userProgress.categoryProgress) {
      userProgress.categoryProgress = {};
    }
    if (!userProgress.categoryProgress[category]) {
      userProgress.categoryProgress[category] = { total: 0, mastered: 0 };
    }
    userProgress.categoryProgress[category].total++;

    const isMastered = progressData.overall_mastery?.level >= 50; // 마스터리 기준을 50%로 조정
    if (isMastered) {
      userProgress.categoryProgress[category].mastered++;
    }

    // 개념 데이터에서 실제 사용 가능한 언어들 확인 (안전한 접근)
    const availableLanguages = new Set();
    if (
      conceptData &&
      conceptData.expressions &&
      typeof conceptData.expressions === "object"
    ) {
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
      studiedLanguages && studiedLanguages.size > 0
        ? studiedLanguages
        : availableLanguages;

    if (languagesToProcess && languagesToProcess.size > 0) {
      languagesToProcess.forEach((lang) => {
        // 안전한 언어 코드 확인
        if (!lang || typeof lang !== "string") {
          console.warn("⚠️ 유효하지 않은 언어 코드:", lang);
          return;
        }

        // 언어 코드 정규화
        let normalizedLang = lang;
        if (lang === "korean" || lang === "ko") normalizedLang = "korean";
        else if (lang === "english" || lang === "en")
          normalizedLang = "english";
        else if (lang === "japanese" || lang === "ja")
          normalizedLang = "japanese";
        else if (lang === "chinese" || lang === "zh")
          normalizedLang = "chinese";

        // userProgress.languageProgress 안전한 초기화
        if (!userProgress.languageProgress) {
          userProgress.languageProgress = {};
        }

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

    // 개념별 진도 처리 로그 제거 (디버깅 완료)
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
      learningRecords: learningSnapshot.docs.length,
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
      limit(50) // 읽기 용량 최적화
    );
    const quizSnapshot = await getDocs(quizQuery);

    // 2. 게임 활동 조회
    const gameQuery = query(
      collection(db, "game_records"),
      where("user_email", "==", currentUser.email),
      limit(50) // 읽기 용량 최적화
    );
    const gameSnapshot = await getDocs(gameQuery);

    // 3. 학습 활동 조회
    const learningQuery = query(
      collection(db, "learning_records"),
      where("user_email", "==", currentUser.email),
      limit(50) // 읽기 용량 최적화
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

    // 2. 게임 기록 조회 (읽기 용량 최적화)
    const gameQuery = query(
      collection(db, "game_records"),
      where("user_email", "==", currentUser.email),
      limit(50) // 읽기 용량 절약
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

      if (conceptsStudied > 0 || sessionDuration > 0 || totalInteractions > 0) {
        // 학습 시간이 0이지만 개념을 학습했다면 최소 1분으로 표시
        const displayDuration =
          sessionDuration > 0 ? sessionDuration : conceptsStudied > 0 ? 1 : 0;

        const userLanguage = localStorage.getItem("userLanguage") || "ko";

        // 학습 효율 점수 표시 개선 (다국어)
        let efficiencyText = "";
        if (sessionQuality > 0) {
          const efficiencyLabel =
            userLanguage === "ko"
              ? "학습 효율"
              : userLanguage === "en"
              ? "Learning Efficiency"
              : userLanguage === "ja"
              ? "学習効率"
              : userLanguage === "zh"
              ? "学习效率"
              : "학습 효율";
          efficiencyText = `, ${efficiencyLabel}: ${Math.round(
            sessionQuality
          )}%`;
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
          efficiencyText = `, ${accuracyLabel}: ${accuracy}%`;
        } else if (conceptsStudied > 0) {
          const calculatingLabel =
            userLanguage === "ko"
              ? "학습 효율: 계산중"
              : userLanguage === "en"
              ? "Learning Efficiency: Calculating"
              : userLanguage === "ja"
              ? "学習効率: 計算中"
              : userLanguage === "zh"
              ? "学习效率: 计算中"
              : "학습 효율: 계산중";
          efficiencyText = `, ${calculatingLabel}`;
        }

        // 학습 영역 및 세부 모드별 제목 설정 (다국어)
        let areaDisplayName = "";
        let modeDisplayName = "";

        // 학습 모드 정보 추출 (메타데이터에서 확인)
        const learningMode =
          data.learning_mode ||
          data.mode ||
          (data.metadata && data.metadata.learning_mode);

        // 학습한 언어 정보 추출 (다양한 필드에서 시도)
        const studyLanguage =
          data.study_language ||
          data.targetLanguage ||
          data.target_language ||
          data.language ||
          data.to_language ||
          data.learning_language ||
          (data.metadata &&
            (data.metadata.targetLanguage ||
              data.metadata.target_language ||
              data.metadata.study_language));

        // 언어 표시명 변환
        let languageDisplayName = "";
        if (studyLanguage) {
          const normalizedLang = normalizeLang(studyLanguage);
          switch (normalizedLang) {
            case "korean":
              languageDisplayName =
                userLanguage === "ko"
                  ? "한국어"
                  : userLanguage === "en"
                  ? "Korean"
                  : userLanguage === "ja"
                  ? "韓国語"
                  : userLanguage === "zh"
                  ? "韩语"
                  : "한국어";
              break;
            case "english":
              languageDisplayName =
                userLanguage === "ko"
                  ? "영어"
                  : userLanguage === "en"
                  ? "English"
                  : userLanguage === "ja"
                  ? "英語"
                  : userLanguage === "zh"
                  ? "英语"
                  : "영어";
              break;
            case "japanese":
              languageDisplayName =
                userLanguage === "ko"
                  ? "일본어"
                  : userLanguage === "en"
                  ? "Japanese"
                  : userLanguage === "ja"
                  ? "日本語"
                  : userLanguage === "zh"
                  ? "日语"
                  : "일본어";
              break;
            case "chinese":
              languageDisplayName =
                userLanguage === "ko"
                  ? "중국어"
                  : userLanguage === "en"
                  ? "Chinese"
                  : userLanguage === "ja"
                  ? "中国語"
                  : userLanguage === "zh"
                  ? "中文"
                  : "중국어";
              break;
            default:
              languageDisplayName = studyLanguage;
          }
        }

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
              case "listening":
                modeDisplayName =
                  userLanguage === "ko"
                    ? "듣기 연습"
                    : userLanguage === "en"
                    ? "Listening Practice"
                    : userLanguage === "ja"
                    ? "聴解練習"
                    : userLanguage === "zh"
                    ? "听力练习"
                    : "듣기 연습";
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
          description: `${displayDuration}${minuteText} ${studyText} (${conceptsStudied}${conceptText}${efficiencyText})`,
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
  // 📊 개선된 통계 요약 업데이트 (단어/예문/문법 구분)
  console.log("📊 통계 요약 업데이트:", {
    conceptCounts: userProgressData.conceptCounts,
    masteredCountsByType: userProgressData.masteredCountsByType,
    studiedConcepts: userProgressData.studiedConcepts,
    totalConcepts: userProgressData.totalConcepts,
    masteredConcepts: userProgressData.masteredConcepts,
  });

  // 🔧 단어 수 정확히 표시 (순수 단어 수)
  const vocabularyCount = userProgressData.conceptCounts?.vocabulary || 0;
  const totalConceptsCount = userProgressData.totalConcepts || 0;
  
  if (vocabularyCount > 0) {
    elements.totalWordsCount.textContent = `${vocabularyCount}/${totalConceptsCount}`;
    elements.totalWordsCount.title = `단어: ${vocabularyCount}개 / 전체 개념: ${totalConceptsCount}개 (예문: ${userProgressData.conceptCounts?.examples || 0}개, 문법: ${userProgressData.conceptCounts?.grammar || 0}개)`;
  } else {
    elements.totalWordsCount.textContent = `0/${totalConceptsCount}`;
  }

  // 📈 마스터한 단어 수 정확히 표시
  const masteredWords = userProgressData.masteredCountsByType?.vocabulary || 0;
  elements.masteredWordsCount.textContent = masteredWords;
  elements.masteredWordsCount.title = `마스터한 단어: ${masteredWords}개 / 전체 마스터: ${userProgressData.masteredConcepts}개 (예문: ${userProgressData.masteredCountsByType?.examples || 0}개, 문법: ${userProgressData.masteredCountsByType?.grammar || 0}개)`;

  const daysText = getTranslatedText("days_suffix") || "일";
  elements.studyStreakCount.textContent = `${userProgressData.studyStreak}${daysText}`;

  // 🎯 퀴즈 정확도 (이모지 제거)
  const accuracy =
    userProgressData.achievements?.averageAccuracy ||
    userProgressData.quizAccuracy ||
    0;
  elements.quizAccuracyRate.textContent = `${accuracy}%`;
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
      const efficiency = userProgressData.achievements?.avgSessionQuality || 0;
      elements.avgSessionQuality.textContent =
        efficiency > 0 ? `${efficiency}%` : "-";

      console.log("📊 학습 효율 업데이트:", {
        avgLearningEfficiency: efficiency,
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

// 개념 카드 생성 함수 (실제 개념 정보 가져오기)
async function generateConceptCard(concept) {
  const masteryLevel = concept.overall_mastery?.level || 0;
  
  let bgColor = "from-red-50 to-red-100";
  let borderColor = "border-red-400";
  let badgeColor = "bg-red-500";

  if (masteryLevel >= 60) {
    bgColor = "from-green-50 to-green-100";
    borderColor = "border-green-400";
    badgeColor = "bg-green-500";
  } else if (masteryLevel >= 30) {
    bgColor = "from-yellow-50 to-yellow-100";
    borderColor = "border-yellow-400";
    badgeColor = "bg-yellow-500";
  } else if (masteryLevel >= 1) {
    bgColor = "from-blue-50 to-blue-100";
    borderColor = "border-blue-400";
    badgeColor = "bg-blue-500";
  }

  // concept_id를 사용해서 실제 개념 정보 가져오기
  let conceptInfo = {
    korean: "단어",
    english: "",
    japanese: "",
    chinese: "",
    domain: "일반",
    difficulty: "초급"
  };

  if (concept.concept_id) {
    try {
      // 개념 유형에 따라 적절한 컬렉션에서 정보 가져오기
      const conceptType = concept.collection_type || concept.concept_type || 'vocabulary';
      let collectionName = 'concepts'; // 기본값
      
      if (conceptType === 'examples') {
        collectionName = 'examples';
      } else if (conceptType === 'grammar') {
        collectionName = 'grammar';
      }

      const conceptDoc = await getDoc(doc(db, collectionName, concept.concept_id));
      if (conceptDoc.exists()) {
        const data = conceptDoc.data();
        
        // 다양한 데이터 구조 지원
        if (data.expressions) {
          conceptInfo.korean = data.expressions.korean?.word || data.expressions.korean || conceptInfo.korean;
          conceptInfo.english = data.expressions.english?.word || data.expressions.english || "";
          conceptInfo.japanese = data.expressions.japanese?.word || data.expressions.japanese || "";
          conceptInfo.chinese = data.expressions.chinese?.word || data.expressions.chinese || "";
        } else {
          // 구버전 데이터 구조 지원
          conceptInfo.korean = data.korean || data.word || conceptInfo.korean;
          conceptInfo.english = data.english || "";
          conceptInfo.japanese = data.japanese || "";
          conceptInfo.chinese = data.chinese || "";
        }
        
        conceptInfo.domain = data.domain || conceptInfo.domain;
        conceptInfo.difficulty = data.concept_info?.difficulty || data.difficulty || conceptInfo.difficulty;
      }
    } catch (error) {
      console.warn(`개념 정보 가져오기 실패: ${concept.concept_id}`, error);
    }
  }

  return `
    <div class="bg-gradient-to-r ${bgColor} border-l-4 ${borderColor} p-4 rounded-lg">
      <div class="flex items-center justify-between mb-2">
        <span class="text-lg font-semibold text-gray-800">
          ${conceptInfo.korean}
        </span>
        <span class="${badgeColor} text-white px-2 py-1 rounded-full text-xs font-bold">
          ${Math.round(masteryLevel)}%
        </span>
      </div>
      <div class="text-sm text-gray-600 space-y-1">
        ${conceptInfo.english ? `<div>🇺🇸 ${conceptInfo.english}</div>` : ""}
        ${conceptInfo.japanese ? `<div>🇯🇵 ${conceptInfo.japanese}</div>` : ""}
        ${conceptInfo.chinese ? `<div>🇨🇳 ${conceptInfo.chinese}</div>` : ""}
        <div class="text-gray-500 text-xs mt-2">
          ${conceptInfo.domain} • ${conceptInfo.difficulty}
        </div>
      </div>
    </div>
  `;
}

// 🏆 마스터한 단어 목록 표시
async function showMasteredWordsList() {
  try {
    console.log("🏆 마스터한 단어 목록 조회 중...");

    if (!currentUser) return;

    // 마스터한 개념들은 userProgressData에서 가져오기
    const masteredConcepts = [];
    
    if (userProgressData && userProgressData.concepts) {
      userProgressData.concepts.forEach(concept => {
        const masteryLevel = concept.overall_mastery?.level || 0;
        const exposureCount = concept.vocabulary_mastery?.exposure_count || 0;
        const studyCount = concept.vocabulary_mastery?.study_count || 0;
        const recognition = concept.vocabulary_mastery?.recognition || 0;
        
        // 마스터 기준 체크
        const isMastered = masteryLevel >= 50 || exposureCount >= 3 || studyCount >= 3 || recognition >= 50;
        
        if (isMastered) {
          masteredConcepts.push({
            id: concept.concept_id || concept.id,
            masteryLevel,
            status: 'mastered',
            ...concept
          });
        }
      });
    }

    // 마스터리 레벨 순으로 정렬
    masteredConcepts.sort((a, b) => b.masteryLevel - a.masteryLevel);

    // 모달 HTML 생성
    const modalHTML = `
      <div id="mastered-words-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg max-w-6xl w-full mx-4 max-h-[85vh] overflow-hidden">
          <div class="flex justify-between items-center p-6 border-b">
            <h2 class="text-2xl font-bold text-gray-800">
              🏆 마스터한 단어 목록 (${userProgressData.masteredCountsByType?.vocabulary || 0}개)
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
                    <span class="text-gray-600">마스터한 단어:</span>
                    <span class="font-medium text-green-600">${
                      userProgressData.masteredCountsByType?.vocabulary || 0
                    }개</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">마스터한 예문:</span>
                    <span class="font-medium text-green-600">${
                      userProgressData.masteredCountsByType?.examples || 0
                    }개</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">마스터한 문법:</span>
                    <span class="font-medium text-green-600">${
                      userProgressData.masteredCountsByType?.grammar || 0
                    }개</span>
                  </div>
                  <div class="flex justify-between border-t pt-2">
                    <span class="text-gray-600 font-medium">총 마스터:</span>
                    <span class="font-medium text-green-600">${
                      userProgressData.masteredConcepts || 0
                    }개</span>
                  </div>
                </div>
              </div>
              
              <div class="bg-gray-50 rounded-lg p-4">
                <h3 class="font-semibold text-gray-800 mb-3">📈 마스터리 기준</h3>
                <div class="grid grid-cols-1 gap-3 text-sm">
                  <div class="bg-green-100 rounded p-3">
                    <div class="font-medium text-green-800">마스터 조건 (다음 중 하나)</div>
                    <ul class="text-green-600 mt-2 space-y-1">
                      <li>• 학습 레벨 50% 이상</li>
                      <li>• 노출 횟수 3회 이상 (학습 세션에서 등장)</li>
                      <li>• 학습 횟수 3회 이상 (실제 학습 활동)</li>
                      <li>• 인식률 50% 이상 (퀴즈/게임 정답률)</li>
                    </ul>
                  </div>
                  <div class="bg-blue-100 rounded p-3">
                    <div class="font-medium text-blue-800">📊 집계 방식 상세</div>
                    <ul class="text-blue-600 mt-2 space-y-1">
                      <li>• <strong>학습 레벨</strong>: 학습 활동 완료 시 5%씩 증가</li>
                      <li>• <strong>노출 횟수</strong>: 플래시카드/리스닝에서 정답/오답 상관없이 단어 노출 시 +1</li>
                      <li>• <strong>학습 횟수</strong>: 타이핑/퀴즈에서 <u>정답일 때만</u> +1 (오답은 카운트 안 함)</li>
                      <li>• <strong>인식률</strong>: (정답 횟수 / 총 시도 횟수) × 100% (퀴즈/게임 기준)</li>
                    </ul>
                  </div>
                  <div class="bg-orange-100 rounded p-3">
                    <div class="font-medium text-orange-800">🎯 학습 단계별 의미</div>
                    <div class="text-orange-600 mt-2 space-y-1">
                      <div class="text-sm">
                        <strong>1단계 (노출)</strong>: 단어 보기/듣기 → 시각적/청각적 익숙함
                      </div>
                      <div class="text-sm">
                        <strong>2단계 (학습)</strong>: 타이핑/퀴즈 정답 → 능동적 사용 능력
                      </div>
                      <div class="text-sm">
                        <strong>3단계 (마스터)</strong>: 두 단계 모두 높아야 진정한 마스터
                      </div>
                    </div>
                  </div>
                  <div class="bg-yellow-100 rounded p-3">
                    <div class="font-medium text-yellow-800">마스터리 레벨별 색상</div>
                    <div class="text-yellow-600 mt-2 space-y-1">
                      <div class="flex items-center gap-2">
                        <div class="w-4 h-4 bg-green-500 rounded"></div>
                        <span>60% 이상 (완전 마스터)</span>
                      </div>
                      <div class="flex items-center gap-2">
                        <div class="w-4 h-4 bg-yellow-500 rounded"></div>
                        <span>30-59% (연습 필요)</span>
                      </div>
                      <div class="flex items-center gap-2">
                        <div class="w-4 h-4 bg-blue-500 rounded"></div>
                        <span>1-29% (학습 초기)</span>
                      </div>
                      <div class="flex items-center gap-2">
                        <div class="w-4 h-4 bg-red-500 rounded"></div>
                        <span>0% (미학습)</span>
                      </div>
                    </div>
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
                  : `<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" id="mastered-concepts-container">
                     <div class="col-span-full text-center py-4">
                       <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mx-auto"></div>
                       <div class="text-sm text-gray-500 mt-2">마스터한 단어 정보를 불러오는 중...</div>
                     </div>
                   </div>`
              }
            </div>
          </div>
        </div>
      </div>
    `;

    // 모달 표시
    document.body.insertAdjacentHTML("beforeend", modalHTML);

    // 마스터한 개념들의 실제 정보를 비동기적으로 로드
    if (masteredConcepts.length > 0) {
      const container = document.getElementById("mastered-concepts-container");
      
      try {
        // 각 개념의 실제 정보를 가져와서 카드 생성
        const conceptCards = [];
        for (const concept of masteredConcepts) {
          const card = await generateConceptCard(concept);
          conceptCards.push(card);
        }
        
        // 모든 카드 표시
        container.innerHTML = conceptCards.join("");
      } catch (error) {
        console.error("❌ 마스터한 개념 카드 생성 중 오류:", error);
        container.innerHTML = '<div class="col-span-full text-center py-8 text-red-500">마스터한 단어 정보를 불러오는 중 오류가 발생했습니다.</div>';
      }
    }

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

    // 실제 학습한 개념들은 userProgressData에 이미 저장되어 있음
    const studiedConcepts = userProgressData.concepts || [];

    // 개념 유형별로 분류
    const conceptsByType = {
      vocabulary: studiedConcepts.filter(c => 
        (c.collection_type || c.concept_type || 'vocabulary') === 'vocabulary' ||
        (c.collection_type || c.concept_type || 'vocabulary') === 'concepts'
      ),
      examples: studiedConcepts.filter(c => 
        (c.collection_type || c.concept_type) === 'examples'
      ),
      grammar: studiedConcepts.filter(c => 
        (c.collection_type || c.concept_type) === 'grammar'
      )
    };

    // 각 타입별 마스터리 레벨 순으로 정렬
    Object.keys(conceptsByType).forEach(type => {
      conceptsByType[type].sort((a, b) => {
        const aLevel = a.overall_mastery?.level || 0;
        const bLevel = b.overall_mastery?.level || 0;
        return bLevel - aLevel;
      });
    });

    const modalHTML = `
      <div id="total-words-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg max-w-5xl w-full mx-4 max-h-[85vh] overflow-hidden">
          <div class="flex justify-between items-center p-6 border-b">
            <h2 class="text-2xl font-bold text-gray-800">
              📊 학습 현황 (단어: ${userProgressData.conceptCounts?.vocabulary || 0}개, 예문: ${userProgressData.conceptCounts?.examples || 0}개, 문법: ${userProgressData.conceptCounts?.grammar || 0}개)
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
                  <div class="text-2xl font-bold text-blue-600">${
                    userProgressData.conceptCounts?.vocabulary || 0
                  }</div>
                  <div class="text-sm text-gray-600">단어</div>
                </div>
                <div class="text-center">
                  <div class="text-2xl font-bold text-green-600">${
                    userProgressData.conceptCounts?.examples || 0
                  }</div>
                  <div class="text-sm text-gray-600">예문</div>
                </div>
                <div class="text-center">
                  <div class="text-2xl font-bold text-purple-600">${
                    userProgressData.conceptCounts?.grammar || 0
                  }</div>
                  <div class="text-sm text-gray-600">문법</div>
                </div>
              </div>
            </div>

            <!-- 학습 진행률 -->
            <div class="bg-purple-50 rounded-lg p-4 mb-6">
              <h3 class="font-semibold text-purple-800 mb-3">📈 학습 진행률</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  : `<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" id="studied-concepts-container">
                     <div class="col-span-full text-center py-4">
                       <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                       <div class="text-sm text-gray-500 mt-2">학습한 단어 정보를 불러오는 중...</div>
                     </div>
                   </div>`
              }
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML("beforeend", modalHTML);

    // 학습한 개념들의 실제 정보를 비동기적으로 로드
    if (studiedConcepts.length > 0) {
      const container = document.getElementById("studied-concepts-container");
      
      try {
        // 각 타입별로 개념 카드들을 생성
        const conceptCards = [];
        for (const concept of studiedConcepts) {
          const card = await generateConceptCard(concept);
          conceptCards.push(card);
        }
        
        // 모든 카드 표시
        container.innerHTML = conceptCards.join("");
      } catch (error) {
        console.error("❌ 개념 카드 생성 중 오류:", error);
        container.innerHTML = '<div class="col-span-full text-center py-8 text-red-500">개념 정보를 불러오는 중 오류가 발생했습니다.</div>';
      }
    }

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

// 🎯 퀴즈 정확도 상세 정보 표시
async function showQuizAccuracyDetails() {
  try {
    console.log("🎯 퀴즈 정확도 상세 정보 조회 중...");

    if (!currentUser) return;

    const quizAccuracy = userProgressData.quizAccuracy || 0;
    const totalQuizzes = userProgressData.totalQuizzes || 0;
    const avgGameScore = userProgressData.avgGameScore || 0;
    const totalGames = userProgressData.totalGames || 0;

    const modalHTML = `
      <div id="quiz-accuracy-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg max-w-3xl w-full mx-4 max-h-[80vh] overflow-hidden">
          <div class="flex justify-between items-center p-6 border-b">
            <h2 class="text-2xl font-bold text-gray-800">
              🎯 퀴즈 & 게임 성과
            </h2>
            <button id="close-quiz-accuracy-modal" class="text-gray-500 hover:text-gray-700 text-2xl">
              ✕
            </button>
          </div>
          <div class="p-6 overflow-y-auto max-h-[70vh]">
            
            <!-- 📊 현재 성과 요약 -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div class="bg-purple-50 rounded-lg p-4">
                <h3 class="font-semibold text-purple-800 mb-3">📝 퀴즈 성과</h3>
                <div class="space-y-2">
                  <div class="flex justify-between">
                    <span class="text-gray-600">총 퀴즈 수:</span>
                    <span class="font-medium text-purple-600">${totalQuizzes}개</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">평균 정확도:</span>
                    <span class="font-medium text-purple-600">${quizAccuracy}%</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">성과 등급:</span>
                    <span class="font-medium ${quizAccuracy >= 80 ? 'text-green-600' : quizAccuracy >= 60 ? 'text-yellow-600' : 'text-red-600'}">
                      ${quizAccuracy >= 80 ? '🏆 우수' : quizAccuracy >= 60 ? '🥈 양호' : '🥉 노력 필요'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div class="bg-blue-50 rounded-lg p-4">
                <h3 class="font-semibold text-blue-800 mb-3">🎮 게임 성과</h3>
                <div class="space-y-2">
                  <div class="flex justify-between">
                    <span class="text-gray-600">총 게임 수:</span>
                    <span class="font-medium text-blue-600">${totalGames}개</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">평균 점수:</span>
                    <span class="font-medium text-blue-600">${avgGameScore}점</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">성과 등급:</span>
                    <span class="font-medium ${avgGameScore >= 80 ? 'text-green-600' : avgGameScore >= 60 ? 'text-yellow-600' : 'text-red-600'}">
                      ${avgGameScore >= 80 ? '🏆 우수' : avgGameScore >= 60 ? '🥈 양호' : '🥉 노력 필요'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 📈 성과 향상 팁 -->
            <div class="bg-gray-50 rounded-lg p-4">
              <h3 class="font-semibold text-gray-800 mb-3">💡 성과 향상 팁</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="bg-purple-100 rounded p-3">
                  <div class="font-medium text-purple-800 mb-2">📝 퀴즈 향상</div>
                  <ul class="text-sm text-purple-600 space-y-1">
                    <li>• 단어 복습을 통해 어휘력 향상</li>
                    <li>• 문법 패턴 학습으로 구조 이해</li>
                    <li>• 예문을 통한 실용적 학습</li>
                  </ul>
                </div>
                <div class="bg-blue-100 rounded p-3">
                  <div class="font-medium text-blue-800 mb-2">🎮 게임 향상</div>
                  <ul class="text-sm text-blue-600 space-y-1">
                    <li>• 반복 학습으로 반응 속도 향상</li>
                    <li>• 다양한 게임 모드 도전</li>
                    <li>• 틀린 문제 복습하기</li>
                  </ul>
                </div>
              </div>
            </div>

            <!-- 🎯 개인 목표 설정 -->
            <div class="bg-green-50 rounded-lg p-4 mt-4">
              <h3 class="font-semibold text-green-800 mb-3">🎯 추천 목표</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="text-sm">
                  <div class="font-medium text-green-700">단기 목표 (이번 주)</div>
                  <ul class="text-green-600 mt-1 space-y-1">
                    <li>• 퀴즈 정확도 ${Math.min(quizAccuracy + 10, 100)}% 달성</li>
                    <li>• 게임 평균 점수 ${Math.min(avgGameScore + 5, 100)}점 달성</li>
                    <li>• 매일 최소 1회 퀴즈 도전</li>
                  </ul>
                </div>
                <div class="text-sm">
                  <div class="font-medium text-green-700">장기 목표 (이번 달)</div>
                  <ul class="text-green-600 mt-1 space-y-1">
                    <li>• 퀴즈 정확도 85% 이상 유지</li>
                    <li>• 게임 고득점 신기록 달성</li>
                    <li>• 모든 학습 영역 균형 있게 도전</li>
                  </ul>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML("beforeend", modalHTML);

    // 닫기 이벤트
    document.getElementById("close-quiz-accuracy-modal").addEventListener("click", () => {
      document.getElementById("quiz-accuracy-modal").remove();
    });

    document.getElementById("quiz-accuracy-modal").addEventListener("click", (e) => {
      if (e.target.id === "quiz-accuracy-modal") {
        document.getElementById("quiz-accuracy-modal").remove();
      }
    });

    console.log("✅ 퀴즈 정확도 상세 정보 표시 완료");
  } catch (error) {
    console.error("❌ 퀴즈 정확도 상세 정보 조회 중 오류:", error);
    showError("퀴즈 정확도 정보를 불러오는 중 오류가 발생했습니다.");
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

//  게임 통계 상세 모달 표시
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
