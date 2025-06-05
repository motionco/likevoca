import { loadNavbar } from "../../components/js/navbar.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
import {
  auth,
  db,
  conceptUtils,
  userProgressUtils,
  supportedLanguages,
} from "../../js/firebase/firebase-init.js";
import { collectionManager } from "../../js/firebase/firebase-collection-manager.js";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  orderBy,
  limit,
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";
import { getActiveLanguage } from "../../utils/language-utils.js";

// 전역 변수
let currentUser = null;
let userLanguage = "ko";
let userProgress = null;
let grammarPatterns = [];
let selectedLanguage = "english";

// 다국어 번역
const translations = {
  ko: {
    grammar_progress: "문법 및 학습 진도",
    language_selection: "언어 선택",
    overall_progress: "전체 진도",
    grammar_patterns: "문법 패턴",
    vocabulary_progress: "어휘 진도",
    learning_statistics: "학습 통계",
    recent_activities: "최근 활동",
    concepts_learned: "학습한 개념",
    quiz_accuracy: "퀴즈 정확도",
    study_time: "학습 시간",
    streak_days: "연속 학습일",
    weak_areas: "취약 영역",
    strong_areas: "강점 영역",
    recommended_study: "추천 학습",
    pattern_name: "패턴명",
    difficulty: "난이도",
    examples_count: "예문 수",
    mastery_level: "숙련도",
    last_studied: "마지막 학습",
    study_now: "지금 학습",
    beginner: "초급",
    intermediate: "중급",
    advanced: "고급",
    not_studied: "미학습",
    learning: "학습중",
    mastered: "숙련",
    total_concepts: "총 개념 수",
    known_concepts: "알고 있는 개념",
    learning_concepts: "학습중인 개념",
    weak_concepts: "취약한 개념",
    minutes: "분",
    hours: "시간",
    days: "일",
    no_data: "데이터 없음",
    loading: "로딩 중...",
    error_loading: "데이터 로딩 중 오류가 발생했습니다",
  },
  en: {
    grammar_progress: "Grammar & Learning Progress",
    language_selection: "Language Selection",
    overall_progress: "Overall Progress",
    grammar_patterns: "Grammar Patterns",
    vocabulary_progress: "Vocabulary Progress",
    learning_statistics: "Learning Statistics",
    recent_activities: "Recent Activities",
    concepts_learned: "Concepts Learned",
    quiz_accuracy: "Quiz Accuracy",
    study_time: "Study Time",
    streak_days: "Streak Days",
    weak_areas: "Weak Areas",
    strong_areas: "Strong Areas",
    recommended_study: "Recommended Study",
    pattern_name: "Pattern Name",
    difficulty: "Difficulty",
    examples_count: "Examples Count",
    mastery_level: "Mastery Level",
    last_studied: "Last Studied",
    study_now: "Study Now",
    beginner: "Beginner",
    intermediate: "Intermediate",
    advanced: "Advanced",
    not_studied: "Not Studied",
    learning: "Learning",
    mastered: "Mastered",
    total_concepts: "Total Concepts",
    known_concepts: "Known Concepts",
    learning_concepts: "Learning Concepts",
    weak_concepts: "Weak Concepts",
    minutes: "minutes",
    hours: "hours",
    days: "days",
    no_data: "No Data",
    loading: "Loading...",
    error_loading: "Error occurred while loading data",
  },
};

// 페이지 초기화
document.addEventListener("DOMContentLoaded", async function () {
  await loadNavbar();
  userLanguage = getActiveLanguage();

  // 인증 상태 확인
  onAuthStateChanged(auth, (user) => {
    if (user) {
      currentUser = user;
      initializeProgressPage();
    } else {
      window.location.href = "/pages/auth.html";
    }
  });
});

// 진도 페이지 초기화
async function initializeProgressPage() {
  try {
    showLoadingState();

    // 사용자 진도 데이터 로드
    userProgress = await userProgressUtils.getUserProgress(currentUser.email);

    // UI 설정
    setupEventListeners();
    setupLanguageSelector();
    updateLanguage();

    // 초기 데이터 로드
    await loadProgressData();
  } catch (error) {
    console.error("진도 페이지 초기화 중 오류:", error);
    showError(translations[userLanguage].error_loading);
  } finally {
    hideLoadingState();
  }
}

// 이벤트 리스너 설정
function setupEventListeners() {
  // 언어 선택 변경
  document
    .getElementById("language-selector")
    .addEventListener("change", async (e) => {
      selectedLanguage = e.target.value;
      await loadProgressData();
    });

  // 새로고침 버튼
  document
    .getElementById("refresh-btn")
    ?.addEventListener("click", async () => {
      await loadProgressData();
    });
}

// 언어 선택기 설정
function setupLanguageSelector() {
  const selector = document.getElementById("language-selector");
  selector.innerHTML = "";

  const languages = [
    { code: "english", name: "영어" },
    { code: "japanese", name: "일본어" },
    { code: "chinese", name: "중국어" },
    { code: "korean", name: "한국어" },
  ];

  languages.forEach((lang) => {
    const option = document.createElement("option");
    option.value = lang.code;
    option.textContent = lang.name;
    if (lang.code === selectedLanguage) {
      option.selected = true;
    }
    selector.appendChild(option);
  });
}

// 진도 데이터 로드
async function loadProgressData() {
  try {
    showLoadingState();

    // 병렬로 데이터 로드
    const [
      overallProgress,
      grammarData,
      vocabularyProgress,
      learningStats,
      recentActivities,
    ] = await Promise.all([
      loadOverallProgress(),
      loadGrammarPatterns(),
      loadVocabularyProgress(),
      loadLearningStatistics(),
      loadRecentActivities(),
    ]);

    // UI 업데이트
    displayOverallProgress(overallProgress);
    displayGrammarPatterns(grammarData);
    displayVocabularyProgress(vocabularyProgress);
    displayLearningStatistics(learningStats);
    displayRecentActivities(recentActivities);
  } catch (error) {
    console.error("진도 데이터 로드 중 오류:", error);
    showError(translations[userLanguage].error_loading);
  } finally {
    hideLoadingState();
  }
}

// 전체 진도 로드
async function loadOverallProgress() {
  try {
    const languageProgress =
      userProgress?.vocabulary_progress?.[selectedLanguage];

    if (!languageProgress) {
      return {
        totalConcepts: 0,
        knownConcepts: 0,
        learningConcepts: 0,
        weakConcepts: 0,
        overallAccuracy: 0,
        studyStreak: 0,
        totalStudyTime: 0,
      };
    }

    // 분리된 컬렉션에서 총 개념 수 조회
    const totalConcepts = await collectionManager.getConceptsCount(
      selectedLanguage
    );

    return {
      totalConcepts: totalConcepts || 0,
      knownConcepts: Object.keys(languageProgress.known_words || {}).length,
      learningConcepts: Object.keys(languageProgress.learning_words || {})
        .length,
      weakConcepts: Object.keys(languageProgress.weak_words || {}).length,
      overallAccuracy: languageProgress.quiz_stats?.average_score || 0,
      studyStreak: userProgress.learning_streak?.current_streak || 0,
      totalStudyTime: languageProgress.total_study_time || 0,
    };
  } catch (error) {
    console.error("전체 진도 로드 중 오류:", error);
    return {};
  }
}

// 문법 패턴 로드
async function loadGrammarPatterns() {
  try {
    // 분리된 컬렉션에서 문법 패턴 조회
    const patterns = await collectionManager.getGrammarPatterns(
      selectedLanguage
    );

    // 사용자 진도와 결합
    const languageProgress =
      userProgress?.vocabulary_progress?.[selectedLanguage];
    const grammarProgress = languageProgress?.grammar_progress || {};

    return patterns.map((pattern) => ({
      ...pattern,
      masteryLevel: grammarProgress[pattern.id]?.mastery_level || "not_studied",
      lastStudied: grammarProgress[pattern.id]?.last_studied || null,
      practiceCount: grammarProgress[pattern.id]?.practice_count || 0,
      accuracy: grammarProgress[pattern.id]?.accuracy || 0,
    }));
  } catch (error) {
    console.error("문법 패턴 로드 중 오류:", error);
    return [];
  }
}

// 어휘 진도 로드
async function loadVocabularyProgress() {
  try {
    const languageProgress =
      userProgress?.vocabulary_progress?.[selectedLanguage];

    if (!languageProgress) {
      return {
        categories: [],
        domains: [],
        difficulties: [],
      };
    }

    // 카테고리별 진도
    const categories = await analyzeProgressByCategory(languageProgress);

    // 도메인별 진도
    const domains = await analyzeProgressByDomain(languageProgress);

    // 난이도별 진도
    const difficulties = await analyzeProgressByDifficulty(languageProgress);

    return { categories, domains, difficulties };
  } catch (error) {
    console.error("어휘 진도 로드 중 오류:", error);
    return { categories: [], domains: [], difficulties: [] };
  }
}

// 학습 통계 로드
async function loadLearningStatistics() {
  try {
    const languageProgress =
      userProgress?.vocabulary_progress?.[selectedLanguage];
    const quizStats = languageProgress?.quiz_stats || {};
    const gameStats = languageProgress?.game_stats || {};

    return {
      totalQuizzes: quizStats.total_quizzes || 0,
      averageQuizScore: quizStats.average_score || 0,
      bestQuizScore: quizStats.best_score || 0,
      totalGames: gameStats.total_games || 0,
      averageGameScore: gameStats.average_score || 0,
      favoriteGameType: gameStats.favorite_type || "none",
      weeklyProgress: await getWeeklyProgress(),
      monthlyProgress: await getMonthlyProgress(),
    };
  } catch (error) {
    console.error("학습 통계 로드 중 오류:", error);
    return {};
  }
}

// 최근 활동 로드
async function loadRecentActivities() {
  try {
    const activities = userProgress?.recent_activities || [];

    // 최근 10개 활동만 반환
    return activities
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 10);
  } catch (error) {
    console.error("최근 활동 로드 중 오류:", error);
    return [];
  }
}

// 전체 진도 표시
function displayOverallProgress(progress) {
  const container = document.getElementById("overall-progress");

  const progressPercentage =
    progress.totalConcepts > 0
      ? Math.round((progress.knownConcepts / progress.totalConcepts) * 100)
      : 0;

  container.innerHTML = `
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div class="bg-blue-50 p-4 rounded-lg text-center">
        <div class="text-2xl font-bold text-blue-600">${
          progress.totalConcepts
        }</div>
        <div class="text-sm text-gray-600">${
          translations[userLanguage].total_concepts
        }</div>
      </div>
      <div class="bg-green-50 p-4 rounded-lg text-center">
        <div class="text-2xl font-bold text-green-600">${
          progress.knownConcepts
        }</div>
        <div class="text-sm text-gray-600">${
          translations[userLanguage].known_concepts
        }</div>
      </div>
      <div class="bg-yellow-50 p-4 rounded-lg text-center">
        <div class="text-2xl font-bold text-yellow-600">${
          progress.learningConcepts
        }</div>
        <div class="text-sm text-gray-600">${
          translations[userLanguage].learning_concepts
        }</div>
      </div>
      <div class="bg-red-50 p-4 rounded-lg text-center">
        <div class="text-2xl font-bold text-red-600">${
          progress.weakConcepts
        }</div>
        <div class="text-sm text-gray-600">${
          translations[userLanguage].weak_concepts
        }</div>
      </div>
    </div>
    
    <div class="bg-white p-6 rounded-lg shadow">
      <h3 class="text-lg font-semibold mb-4">학습 진도</h3>
      <div class="w-full bg-gray-200 rounded-full h-4 mb-4">
        <div class="bg-blue-600 h-4 rounded-full transition-all duration-300" 
             style="width: ${progressPercentage}%"></div>
      </div>
      <div class="text-center text-gray-600">
        ${progressPercentage}% 완료 (${progress.knownConcepts}/${
    progress.totalConcepts
  })
      </div>
      
      <div class="grid grid-cols-3 gap-4 mt-6">
        <div class="text-center">
          <div class="text-xl font-bold text-purple-600">${
            progress.overallAccuracy
          }%</div>
          <div class="text-sm text-gray-600">${
            translations[userLanguage].quiz_accuracy
          }</div>
        </div>
        <div class="text-center">
          <div class="text-xl font-bold text-orange-600">${
            progress.studyStreak
          }</div>
          <div class="text-sm text-gray-600">${
            translations[userLanguage].streak_days
          }</div>
        </div>
        <div class="text-center">
          <div class="text-xl font-bold text-indigo-600">${formatStudyTime(
            progress.totalStudyTime
          )}</div>
          <div class="text-sm text-gray-600">${
            translations[userLanguage].study_time
          }</div>
        </div>
      </div>
    </div>
  `;
}

// 문법 패턴 표시
function displayGrammarPatterns(patterns) {
  const container = document.getElementById("grammar-patterns");

  if (patterns.length === 0) {
    container.innerHTML = `
      <div class="text-center text-gray-500 py-8">
        ${translations[userLanguage].no_data}
      </div>
    `;
    return;
  }

  const patternsHTML = patterns
    .map(
      (pattern) => `
    <div class="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
      <div class="flex justify-between items-start mb-2">
        <h4 class="font-semibold text-gray-800">${pattern.pattern_name}</h4>
        <span class="px-2 py-1 text-xs rounded-full ${getDifficultyColor(
          pattern.difficulty
        )}">
          ${
            translations[userLanguage][pattern.difficulty] || pattern.difficulty
          }
        </span>
      </div>
      
      <div class="text-sm text-gray-600 mb-3">
        ${pattern.description || ""}
      </div>
      
      <div class="flex justify-between items-center text-sm">
        <div class="flex space-x-4">
          <span>${translations[userLanguage].examples_count}: ${
        pattern.examples_count || 0
      }</span>
          <span class="px-2 py-1 rounded-full ${getMasteryColor(
            pattern.masteryLevel
          )}">
            ${
              translations[userLanguage][pattern.masteryLevel] ||
              pattern.masteryLevel
            }
          </span>
        </div>
        
        <button onclick="studyGrammarPattern('${pattern.id}')" 
                class="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
          ${translations[userLanguage].study_now}
        </button>
      </div>
      
      ${
        pattern.lastStudied
          ? `
        <div class="text-xs text-gray-500 mt-2">
          ${translations[userLanguage].last_studied}: ${formatDate(
              pattern.lastStudied
            )}
        </div>
      `
          : ""
      }
    </div>
  `
    )
    .join("");

  container.innerHTML = patternsHTML;
}

// 어휘 진도 표시
function displayVocabularyProgress(progress) {
  const container = document.getElementById("vocabulary-progress");

  container.innerHTML = `
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-white p-4 rounded-lg shadow">
        <h4 class="font-semibold mb-3">카테고리별 진도</h4>
        ${renderProgressChart(progress.categories, "category")}
      </div>
      
      <div class="bg-white p-4 rounded-lg shadow">
        <h4 class="font-semibold mb-3">도메인별 진도</h4>
        ${renderProgressChart(progress.domains, "domain")}
      </div>
      
      <div class="bg-white p-4 rounded-lg shadow">
        <h4 class="font-semibold mb-3">난이도별 진도</h4>
        ${renderProgressChart(progress.difficulties, "difficulty")}
      </div>
    </div>
  `;
}

// 학습 통계 표시
function displayLearningStatistics(stats) {
  const container = document.getElementById("learning-statistics");

  container.innerHTML = `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="bg-white p-6 rounded-lg shadow">
        <h4 class="font-semibold mb-4">퀴즈 통계</h4>
        <div class="space-y-3">
          <div class="flex justify-between">
            <span>총 퀴즈 수:</span>
            <span class="font-semibold">${stats.totalQuizzes || 0}</span>
          </div>
          <div class="flex justify-between">
            <span>평균 점수:</span>
            <span class="font-semibold">${stats.averageQuizScore || 0}%</span>
          </div>
          <div class="flex justify-between">
            <span>최고 점수:</span>
            <span class="font-semibold">${stats.bestQuizScore || 0}%</span>
          </div>
        </div>
      </div>
      
      <div class="bg-white p-6 rounded-lg shadow">
        <h4 class="font-semibold mb-4">게임 통계</h4>
        <div class="space-y-3">
          <div class="flex justify-between">
            <span>총 게임 수:</span>
            <span class="font-semibold">${stats.totalGames || 0}</span>
          </div>
          <div class="flex justify-between">
            <span>평균 점수:</span>
            <span class="font-semibold">${stats.averageGameScore || 0}%</span>
          </div>
          <div class="flex justify-between">
            <span>선호 게임:</span>
            <span class="font-semibold">${
              stats.favoriteGameType || "none"
            }</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

// 최근 활동 표시
function displayRecentActivities(activities) {
  const container = document.getElementById("recent-activities");

  if (activities.length === 0) {
    container.innerHTML = `
      <div class="text-center text-gray-500 py-8">
        ${translations[userLanguage].no_data}
      </div>
    `;
    return;
  }

  const activitiesHTML = activities
    .map(
      (activity) => `
    <div class="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
      <div class="flex-shrink-0">
        ${getActivityIcon(activity.type)}
      </div>
      <div class="flex-1">
        <div class="text-sm font-medium">${getActivityDescription(
          activity
        )}</div>
        <div class="text-xs text-gray-500">${formatDate(
          activity.timestamp
        )}</div>
      </div>
      ${
        activity.score
          ? `
        <div class="text-sm font-semibold text-blue-600">${activity.score}%</div>
      `
          : ""
      }
    </div>
  `
    )
    .join("");

  container.innerHTML = activitiesHTML;
}

// 유틸리티 함수들
function getDifficultyColor(difficulty) {
  const colors = {
    beginner: "bg-green-100 text-green-800",
    intermediate: "bg-yellow-100 text-yellow-800",
    advanced: "bg-red-100 text-red-800",
  };
  return colors[difficulty] || "bg-gray-100 text-gray-800";
}

function getMasteryColor(mastery) {
  const colors = {
    not_studied: "bg-gray-100 text-gray-800",
    learning: "bg-yellow-100 text-yellow-800",
    mastered: "bg-green-100 text-green-800",
  };
  return colors[mastery] || "bg-gray-100 text-gray-800";
}

function formatStudyTime(minutes) {
  if (minutes < 60) {
    return `${minutes}${translations[userLanguage].minutes}`;
  } else if (minutes < 1440) {
    return `${Math.round(minutes / 60)}${translations[userLanguage].hours}`;
  } else {
    return `${Math.round(minutes / 1440)}${translations[userLanguage].days}`;
  }
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString(userLanguage === "ko" ? "ko-KR" : "en-US");
}

function getActivityIcon(type) {
  const icons = {
    quiz_completed: "🧠",
    game_completed: "🎮",
    concept_learned: "📚",
    grammar_studied: "📝",
    vocabulary_added: "➕",
  };
  return icons[type] || "📖";
}

function getActivityDescription(activity) {
  const descriptions = {
    quiz_completed: `퀴즈 완료 (${activity.quiz_type || "mixed"})`,
    game_completed: `게임 완료 (${activity.game_type || "memory"})`,
    concept_learned: `새 개념 학습`,
    grammar_studied: `문법 패턴 학습`,
    vocabulary_added: `어휘 추가`,
  };
  return descriptions[activity.type] || activity.type;
}

function renderProgressChart(data, type) {
  if (!data || data.length === 0) {
    return `<div class="text-gray-500 text-sm">${translations[userLanguage].no_data}</div>`;
  }

  return data
    .map((item) => {
      const percentage =
        item.total > 0 ? Math.round((item.known / item.total) * 100) : 0;
      return `
      <div class="mb-3">
        <div class="flex justify-between text-sm mb-1">
          <span>${item.name}</span>
          <span>${item.known}/${item.total}</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div class="bg-blue-600 h-2 rounded-full" style="width: ${percentage}%"></div>
        </div>
      </div>
    `;
    })
    .join("");
}

// 카테고리별 진도 분석
async function analyzeProgressByCategory(languageProgress) {
  // 분리된 컬렉션에서 카테고리별 개념 수 조회
  const categories = await collectionManager.getConceptsByCategory(
    selectedLanguage
  );
  const knownWords = languageProgress.known_words || {};

  return categories.map((category) => ({
    name: category.name,
    total: category.count,
    known: Object.keys(knownWords).filter(
      (conceptId) => knownWords[conceptId].category === category.name
    ).length,
  }));
}

// 도메인별 진도 분석
async function analyzeProgressByDomain(languageProgress) {
  const domains = await collectionManager.getConceptsByDomain(selectedLanguage);
  const knownWords = languageProgress.known_words || {};

  return domains.map((domain) => ({
    name: domain.name,
    total: domain.count,
    known: Object.keys(knownWords).filter(
      (conceptId) => knownWords[conceptId].domain === domain.name
    ).length,
  }));
}

// 난이도별 진도 분석
async function analyzeProgressByDifficulty(languageProgress) {
  const difficulties = await collectionManager.getConceptsByDifficulty(
    selectedLanguage
  );
  const knownWords = languageProgress.known_words || {};

  return difficulties.map((difficulty) => ({
    name: difficulty.name,
    total: difficulty.count,
    known: Object.keys(knownWords).filter(
      (conceptId) => knownWords[conceptId].difficulty === difficulty.name
    ).length,
  }));
}

// 주간 진도 조회
async function getWeeklyProgress() {
  // 최근 7일간의 학습 활동 분석
  const activities = userProgress?.recent_activities || [];
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const weeklyActivities = activities.filter(
    (activity) => new Date(activity.timestamp) >= weekAgo
  );

  return weeklyActivities.length;
}

// 월간 진도 조회
async function getMonthlyProgress() {
  const activities = userProgress?.recent_activities || [];
  const monthAgo = new Date();
  monthAgo.setMonth(monthAgo.getMonth() - 1);

  const monthlyActivities = activities.filter(
    (activity) => new Date(activity.timestamp) >= monthAgo
  );

  return monthlyActivities.length;
}

// 문법 패턴 학습 시작
async function studyGrammarPattern(patternId) {
  try {
    // 문법 패턴 상세 정보 조회
    const pattern = await collectionManager.getGrammarPattern(patternId);

    if (pattern) {
      // 문법 학습 페이지로 이동 (구현 필요)
      window.location.href = `/pages/grammar-study.html?pattern=${patternId}`;
    }
  } catch (error) {
    console.error("문법 패턴 학습 시작 중 오류:", error);
    alert("문법 패턴을 로드할 수 없습니다.");
  }
}

// 화면 상태 관리
function showLoadingState() {
  document.getElementById("loading-state").style.display = "block";
  document.getElementById("main-content").style.display = "none";
}

function hideLoadingState() {
  document.getElementById("loading-state").style.display = "none";
  document.getElementById("main-content").style.display = "block";
}

function showError(message) {
  alert(message);
}

function updateLanguage() {
  const elements = document.querySelectorAll("[data-translate]");
  elements.forEach((element) => {
    const key = element.getAttribute("data-translate");
    if (translations[userLanguage] && translations[userLanguage][key]) {
      element.textContent = translations[userLanguage][key];
    }
  });
}

// 전역 함수로 내보내기
window.studyGrammarPattern = studyGrammarPattern;
