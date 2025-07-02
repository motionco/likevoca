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
      const userLanguage = localStorage.getItem("userLanguage") || "ko";
      const response = await fetch(`../../locales/${userLanguage}/navbar.html`);
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
    } else {
      console.log("❌ 사용자가 로그인되지 않았습니다.");
      alert("로그인이 필요합니다.");
      window.redirectToLogin();
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
        korean: { total: 0, mastered: 0 },
        english: { total: 0, mastered: 0 },
        japanese: { total: 0, mastered: 0 },
        chinese: { total: 0, mastered: 0 },
      },
      gameResults: [], // 게임 결과 배열 추가
    };

    // 상세 진도 데이터 로드
    await loadDetailedProgressData();

    // 🎮 게임 통계 로드
    await loadGameStats();

    console.log("✅ 사용자 진도 데이터 로드 완료:", userProgressData);
  } catch (error) {
    console.error("❌ 사용자 진도 데이터 로드 중 오류:", error);
  }
}

// 🎮 게임 통계 로드
async function loadGameStats() {
  try {
    console.log("🎮 게임 통계 로드 시작");

    if (!currentUser) return;

    // Firestore에서 게임 결과 로드 (orderBy 제거하여 인덱스 오류 방지)
    const gameResultsRef = collection(db, "game_results");
    const q = query(
      gameResultsRef,
      where("userId", "==", currentUser.uid),
      limit(50) // 충분한 데이터 확보
    );

    const querySnapshot = await getDocs(q);
    const gameResults = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      gameResults.push({
        id: doc.id,
        ...data,
        playedAt:
          data.timestamp?.toDate() || new Date(data.createdAt || Date.now()),
      });
    });

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
    userProgressData.gameResults = gameResults.slice(0, 10); // 최근 10개만 저장

    console.log("✅ 게임 통계 로드 완료:", gameStats);
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
    // user_progress 컬렉션에서 사용자의 모든 진도 데이터 조회
    const progressQuery = query(
      collection(db, "user_progress"),
      where("user_email", "==", currentUser.email)
    );

    const progressSnapshot = await getDocs(progressQuery);

    // 진도 데이터 처리
    for (const doc of progressSnapshot.docs) {
      const data = doc.data();
      userProgressData.concepts.push({
        id: doc.id,
        ...data,
      });

      // 언어별, 카테고리별 분류를 위한 개념 정보 처리
      await processConceptProgress(data, userProgressData);
    }

    // 연속 학습 일수 계산
    userProgressData.studyStreak = await calculateStudyStreak();

    // 최근 활동 로드
    userProgressData.recentActivities = await loadRecentActivities();

    console.log("✅ 상세 진도 데이터 로딩 완료");
  } catch (error) {
    console.error("❌ 사용자 진도 데이터 로딩 중 오류:", error);
  }
}

// 개념별 진도 처리
async function processConceptProgress(progressData, userProgress) {
  try {
    // 개념 정보 조회
    const conceptRef = doc(db, "concepts", progressData.concept_id);
    const conceptSnap = await getDoc(conceptRef);

    if (conceptSnap.exists()) {
      const conceptData = conceptSnap.data();
      const category = conceptData.concept_info?.category || "기타";
      const expressions = conceptData.expressions || {};

      // 카테고리별 진도 업데이트
      if (!userProgress.categoryProgress[category]) {
        userProgress.categoryProgress[category] = { total: 0, mastered: 0 };
      }
      userProgress.categoryProgress[category].total++;

      if (progressData.overall_mastery?.level >= 70) {
        userProgress.categoryProgress[category].mastered++;
      }

      // 언어별 진도 업데이트
      Object.keys(expressions).forEach((lang) => {
        if (userProgress.languageProgress[lang]) {
          userProgress.languageProgress[lang].total++;

          if (progressData.overall_mastery?.level >= 70) {
            userProgress.languageProgress[lang].mastered++;
          }
        }
      });
    }
  } catch (error) {
    console.error("개념별 진도 처리 중 오류:", error);
  }
}

// 연속 학습 일수 계산
async function calculateStudyStreak() {
  try {
    // 퀴즈 결과 조회 (orderBy 제거)
    const quizQuery = query(
      collection(db, "quiz_results"),
      where("user_email", "==", currentUser.email),
      limit(50) // 충분한 데이터 확보
    );

    const quizSnapshot = await getDocs(quizQuery);
    const studyDates = new Set();

    // 학습 날짜 추출
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

    return streak;
  } catch (error) {
    console.error("연속 학습 일수 계산 중 오류:", error);
    return 0;
  }
}

// 최근 활동 로드
async function loadRecentActivities() {
  try {
    const activities = [];

    // 퀴즈 결과 조회 (orderBy 제거)
    const quizQuery = query(
      collection(db, "quiz_results"),
      where("user_email", "==", currentUser.email),
      limit(20) // 충분한 데이터 확보
    );

    const quizSnapshot = await getDocs(quizQuery);

    quizSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      activities.push({
        type: "quiz",
        title:
          getTranslatedText("quiz_completed_activity") ||
          `${data.quiz_type} Quiz Completed`,
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

    // JavaScript에서 시간순 정렬
    activities.sort((a, b) => {
      if (!a.timestamp || !b.timestamp) return 0;
      const aTime = a.timestamp.toDate
        ? a.timestamp.toDate()
        : new Date(a.timestamp);
      const bTime = b.timestamp.toDate
        ? b.timestamp.toDate()
        : new Date(b.timestamp);
      return bTime - aTime;
    });

    return activities.slice(0, 5); // 최근 5개만
  } catch (error) {
    console.error("최근 활동 로드 중 오류:", error);
    return [];
  }
}

// 사용자 목표 로드
async function loadUserGoals() {
  try {
    const goalsRef = doc(db, "user_goals", currentUser.email);
    const goalsSnap = await getDoc(goalsRef);

    if (goalsSnap.exists()) {
      const goalsData = goalsSnap.data();
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
    updateLanguageMastery();

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

  // 🎯 퀴즈 정확도에 이모지 추가
  const accuracy =
    userProgressData.achievements?.averageAccuracy ||
    userProgressData.quizAccuracy ||
    0;
  const accuracyEmoji =
    accuracy >= 90
      ? "🏆"
      : accuracy >= 70
      ? "🥈"
      : accuracy >= 50
      ? "🥉"
      : "📚";
  elements.quizAccuracyRate.textContent = `${accuracyEmoji} ${accuracy}%`;
}

// 언어별 마스터리 업데이트
function updateLanguageMastery() {
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

  languages.forEach((lang) => {
    const progress = userProgressData.languageProgress[lang.code];
    const percentage =
      progress.total > 0
        ? Math.round((progress.mastered / progress.total) * 100)
        : 0;

    lang.percent.textContent = `${percentage}%`;
    lang.bar.style.width = `${percentage}%`;
  });
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

    console.log("✅ 성취도 업데이트 완료");
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
          최근 성취
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

  // 📈 최근 활동 표시
  if (
    userProgressData.recentActivities &&
    userProgressData.recentActivities.length > 0
  ) {
    activitiesHTML += `
      <div>
        <h4 class="text-sm font-semibold text-gray-700 mb-2 flex items-center">
          <i class="fas fa-clock text-blue-500 mr-2"></i>
          최근 활동
        </h4>
    `;

    userProgressData.recentActivities.forEach((activity) => {
      const timeAgo = getTimeAgo(activity.timestamp?.toDate());
      activitiesHTML += `
        <div class="flex items-start space-x-3 p-2 bg-gray-50 rounded-lg mb-2">
        <div class="flex-shrink-0">
          <i class="${activity.icon} ${activity.color} text-lg"></i>
        </div>
        <div class="flex-1">
            <h5 class="font-medium text-gray-800 text-sm">${activity.title}</h5>
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

  elements.dailyWordsProgress.textContent = `${todayNewWords}/${learningGoals.daily.newWords}`;
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

    const goalsRef = doc(db, "user_goals", currentUser.email);
    await setDoc(goalsRef, newGoals, { merge: true });

    learningGoals = newGoals;

    // 진행률 업데이트
    await updateGoalsProgress();

    // 성공 메시지
    showSuccess("목표가 저장되었습니다!");

    console.log("✅ 사용자 목표 저장 완료");
  } catch (error) {
    console.error("❌ 사용자 목표 저장 중 오류:", error);
    showError("목표 저장 중 오류가 발생했습니다.");
  }
}

// 일일 목표 표시 업데이트
function updateDailyGoalsDisplay() {
  const newWords = parseInt(elements.dailyWordsGoal.value) || 10;
  const quizTime = parseInt(elements.dailyQuizGoal.value) || 20;

  elements.dailyWordsProgress.textContent = `0/${newWords}`;
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
  if (!date) return "방금 전";

  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "방금 전";
  if (diffMins < 60) return `${diffMins}분 전`;
  if (diffHours < 24) return `${diffHours}시간 전`;
  return `${diffDays}일 전`;
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
