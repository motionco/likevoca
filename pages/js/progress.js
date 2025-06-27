import { auth, db, conceptUtils } from "../../js/firebase/firebase-init.js";
import { collectionManager } from "../../js/firebase/firebase-collection-manager.js";
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

    // 네비게이션 바 로드
    await loadNavbar();

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

// 네비게이션 바 로드
async function loadNavbar() {
  try {
    const response = await fetch("../components/navbar.html");
    const navbarHTML = await response.text();
    document.getElementById("navbar-container").innerHTML = navbarHTML;

    // 네비게이션 스크립트 로드
    const navScript = document.createElement("script");
    navScript.src = "../components/js/navbar.js";
    navScript.type = "module";
    document.head.appendChild(navScript);
  } catch (error) {
    console.error("네비게이션 바 로드 실패:", error);
  }
}

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

// 사용자 진도 데이터 로드
async function loadUserProgressData() {
  try {
    console.log("📈 사용자 진도 데이터 로딩 시작");

    if (!currentUser) return;

    // user_progress 컬렉션에서 사용자의 모든 진도 데이터 조회
    const progressQuery = query(
      collection(db, "user_progress"),
      where("user_email", "==", currentUser.email)
    );

    const progressSnapshot = await getDocs(progressQuery);
    const progressData = {
      concepts: [],
      totalConcepts: 0,
      masteredConcepts: 0,
      languageProgress: {
        korean: { total: 0, mastered: 0 },
        english: { total: 0, mastered: 0 },
        japanese: { total: 0, mastered: 0 },
        chinese: { total: 0, mastered: 0 },
      },
      categoryProgress: {},
      quizStats: {
        totalAttempts: 0,
        correctAnswers: 0,
        averageAccuracy: 0,
      },
      studyStreak: 0,
      recentActivities: [],
    };

    // 진도 데이터 처리
    for (const doc of progressSnapshot.docs) {
      const data = doc.data();
      progressData.concepts.push({
        id: doc.id,
        ...data,
      });

      progressData.totalConcepts++;

      // 마스터리 레벨 체크 (70% 이상이면 마스터)
      if (data.overall_mastery?.level >= 70) {
        progressData.masteredConcepts++;
      }

      // 퀴즈 통계 누적
      if (data.quiz_performance) {
        progressData.quizStats.totalAttempts +=
          data.quiz_performance.total_attempts || 0;
        progressData.quizStats.correctAnswers +=
          data.quiz_performance.correct_answers || 0;
      }

      // 개념 정보를 가져와서 언어별, 카테고리별 분류
      await processConceptProgress(data, progressData);
    }

    // 평균 정확도 계산
    if (progressData.quizStats.totalAttempts > 0) {
      progressData.quizStats.averageAccuracy = Math.round(
        (progressData.quizStats.correctAnswers /
          progressData.quizStats.totalAttempts) *
          100
      );
    }

    // 연속 학습 일수 계산
    progressData.studyStreak = await calculateStudyStreak();

    // 최근 활동 로드
    progressData.recentActivities = await loadRecentActivities();

    userProgressData = progressData;
    console.log("✅ 사용자 진도 데이터 로딩 완료:", progressData);
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
    // 퀴즈 결과를 최근 날짜순으로 조회
    const quizQuery = query(
      collection(db, "quiz_results"),
      where("user_email", "==", currentUser.email),
      orderBy("completed_at", "desc"),
      limit(30) // 최근 30일
    );

    const quizSnapshot = await getDocs(quizQuery);
    const studyDates = new Set();

    // 학습 날짜 추출
    quizSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      if (data.completed_at) {
        const date = data.completed_at.toDate();
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

    // 최근 퀴즈 결과 조회
    const quizQuery = query(
      collection(db, "quiz_results"),
      where("user_email", "==", currentUser.email),
      orderBy("completed_at", "desc"),
      limit(10)
    );

    const quizSnapshot = await getDocs(quizQuery);

    quizSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      activities.push({
        type: "quiz",
        title: `${data.quiz_type} 퀴즈 완료`,
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

    // 시간순 정렬
    activities.sort((a, b) => {
      if (!a.timestamp || !b.timestamp) return 0;
      return b.timestamp.toDate() - a.timestamp.toDate();
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
  elements.totalWordsCount.textContent = userProgressData.totalConcepts;
  elements.masteredWordsCount.textContent = userProgressData.masteredConcepts;
  elements.studyStreakCount.textContent = `${userProgressData.studyStreak}일`;
  elements.quizAccuracyRate.textContent = `${userProgressData.quizStats.averageAccuracy}%`;
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

// 차트 생성
function createCharts() {
  createWeeklyActivityChart();
  createCategoryProgressChart();
}

// 주간 학습 활동 차트
function createWeeklyActivityChart() {
  const ctx = elements.weeklyActivityChart.getContext("2d");

  // 최근 7일 데이터 준비
  const last7Days = [];
  const studyCounts = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    last7Days.push(date.toLocaleDateString("ko-KR", { weekday: "short" }));

    // 해당 날짜의 학습 활동 수 계산 (임시 데이터)
    const count = Math.floor(Math.random() * 10) + 1;
    studyCounts.push(count);
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

// 최근 활동 표시
function displayRecentActivities() {
  if (userProgressData.recentActivities.length === 0) {
    elements.recentActivitiesList.innerHTML = `
      <div class="text-center py-8 text-gray-500">
        <i class="fas fa-clock text-3xl mb-2"></i>
        <p>최근 학습 활동이 없습니다.</p>
      </div>
    `;
    return;
  }

  let activitiesHTML = "";
  userProgressData.recentActivities.forEach((activity) => {
    const timeAgo = getTimeAgo(activity.timestamp?.toDate());
    activitiesHTML += `
      <div class="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
        <div class="flex-shrink-0">
          <i class="${activity.icon} ${activity.color} text-lg"></i>
        </div>
        <div class="flex-1">
          <h4 class="font-medium text-gray-800">${activity.title}</h4>
          <p class="text-sm text-gray-600">${activity.description}</p>
          <p class="text-xs text-gray-500 mt-1">${timeAgo}</p>
        </div>
      </div>
    `;
  });

  elements.recentActivitiesList.innerHTML = activitiesHTML;
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
