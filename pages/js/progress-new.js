// 🔍 Target Language Centric Progress System
// 대상 언어 중심 진도 페이지 시스템

// 전역 변수들
let currentUser = null;
let isDataLoaded = false;
let selectedTargetLanguage = 'english'; // 기본 대상 언어

// 📊 진도 데이터 구조
let userProgressData = {
  selectedTargetLanguage: 'english',
  availableTargetLanguages: [],
  totalWords: 0,
  masteredWords: 0,
  studyStreak: 0,
  targetLanguageStreak: 0,
  achievements: {
    totalGames: 0,
    avgGameScore: 0,
    bestGameScore: 0,
    totalQuizzes: 0,
    avgQuizAccuracy: 0,
    bestQuizScore: 0,
    totalLearningSessions: 0,
    avgSessionQuality: 0,
    totalStudyTime: 0
  },
  sourceBreakdown: {},
  recentActivities: [],
  weeklyActivity: [],
  overallStats: {}
};

// 페이지 로드 시 초기화
document.addEventListener("DOMContentLoaded", async function () {
  try {
    console.log("🚀 대상 언어 중심 진도 페이지 초기화 시작");

    // Firebase 초기화 확인
    if (typeof firebaseInit === 'undefined' || !firebaseInit.db) {
      console.error("❌ Firebase가 초기화되지 않았습니다");
      return;
    }

    console.log("✅ Firebase 초기화 확인 완료");

    // 저장된 대상 언어 설정 로드
    selectedTargetLanguage = localStorage.getItem('selectedTargetLanguage') || 'english';

    // 인증 상태 확인
    firebaseInit.auth.onAuthStateChanged(async (user) => {
      if (user) {
        currentUser = user;
        console.log("✅ 사용자 인증 상태:", user.email);
        
        try {
          await loadTargetLanguageCentricProgress();
          await checkCompletionUpdates();
          await setupEventListeners();
        } catch (error) {
          console.error("❌ 진도 데이터 로드 실패:", error);
        }
      } else {
        console.log("❌ 사용자가 로그인하지 않았습니다");
        window.location.href = '/login.html';
      }
    });
  } catch (error) {
    console.error("❌ 페이지 초기화 오류:", error);
  }
});

// 📊 대상 언어 중심 진도 데이터 로드
async function loadTargetLanguageCentricProgress() {
  try {
    console.log(`📊 대상 언어 진도 로드: ${selectedTargetLanguage}`);

    // 1. 사용자의 모든 활동 수집
    const allActivities = await collectAllUserActivities();
    
    // 2. 대상 언어별로 분류
    const targetLanguageData = groupActivitiesByTargetLanguage(allActivities);
    
    // 3. 사용자 기록 생성/업데이트
    await createOrUpdateUserRecord(targetLanguageData);
    
    // 4. 선택된 대상 언어 데이터 로드
    const progressData = await loadSelectedTargetLanguageData();
    
    // 5. UI 업데이트
    updateProgressUI(progressData);
    
    isDataLoaded = true;
    console.log("✅ 대상 언어 중심 진도 로드 완료");

  } catch (error) {
    console.error("❌ 대상 언어 진도 로드 중 오류:", error);
  }
}

// 📊 사용자 활동 수집
async function collectAllUserActivities() {
  const activities = {
    learning: [],
    games: [],
    quizzes: []
  };

  if (!currentUser) return activities;

  try {
    // 학습 기록
    const learningQuery = firebaseInit.query(
      firebaseInit.collection(firebaseInit.db, "learning_records"),
      firebaseInit.where("user_email", "==", currentUser.email),
      firebaseInit.limit(100)
    );
    const learningSnapshot = await firebaseInit.getDocs(learningQuery);
    learningSnapshot.forEach(doc => {
      const data = doc.data();
      activities.learning.push({
        id: doc.id,
        type: 'learning',
        ...data,
        languagePair: data.language_pair || { source: 'korean', target: 'english' }
      });
    });

    // 게임 기록
    const gameQuery = firebaseInit.query(
      firebaseInit.collection(firebaseInit.db, "game_records"),
      firebaseInit.where("user_email", "==", currentUser.email),
      firebaseInit.limit(100)
    );
    const gameSnapshot = await firebaseInit.getDocs(gameQuery);
    gameSnapshot.forEach(doc => {
      const data = doc.data();
      activities.games.push({
        id: doc.id,
        type: 'game',
        ...data,
        languagePair: data.language_pair || { source: 'korean', target: 'english' }
      });
    });

    // 퀴즈 기록
    const quizQuery = firebaseInit.query(
      firebaseInit.collection(firebaseInit.db, "quiz_records"),
      firebaseInit.where("user_email", "==", currentUser.email),
      firebaseInit.limit(100)
    );
    const quizSnapshot = await firebaseInit.getDocs(quizQuery);
    quizSnapshot.forEach(doc => {
      const data = doc.data();
      activities.quizzes.push({
        id: doc.id,
        type: 'quiz',
        ...data,
        languagePair: data.language_pair || 
                     { source: data.source_language || 'korean', target: data.target_language || 'english' }
      });
    });

    console.log("📊 활동 수집 완료:", {
      learning: activities.learning.length,
      games: activities.games.length,
      quizzes: activities.quizzes.length
    });

  } catch (error) {
    console.error("❌ 활동 수집 중 오류:", error);
  }

  return activities;
}

// 📊 대상 언어별 활동 분류
function groupActivitiesByTargetLanguage(activities) {
  const targetLanguages = {};

  // 모든 활동을 대상 언어별로 분류
  ['learning', 'games', 'quizzes'].forEach(activityType => {
    activities[activityType].forEach(activity => {
      const targetLang = activity.languagePair.target;
      const sourceLang = activity.languagePair.source;

      // 대상 언어별 구조 초기화
      if (!targetLanguages[targetLang]) {
        targetLanguages[targetLang] = {
          activities: { learning: [], games: [], quizzes: [] },
          concepts: new Set(),
          sourceBreakdown: {}
        };
      }

      // 원본 언어별 분류 초기화
      if (!targetLanguages[targetLang].sourceBreakdown[sourceLang]) {
        targetLanguages[targetLang].sourceBreakdown[sourceLang] = {
          concepts: new Set(),
          activities: []
        };
      }

      // 활동 추가
      targetLanguages[targetLang].activities[activityType].push(activity);
      targetLanguages[targetLang].sourceBreakdown[sourceLang].activities.push(activity);

      // 개념 수집
      const conceptIds = activity.concept_id || activity.concept_ids || [];
      if (Array.isArray(conceptIds)) {
        conceptIds.forEach(id => {
          targetLanguages[targetLang].concepts.add(id);
          targetLanguages[targetLang].sourceBreakdown[sourceLang].concepts.add(id);
        });
      }
    });
  });

  console.log("🎯 대상 언어별 분류 완료:", Object.keys(targetLanguages));
  return targetLanguages;
}

// 📊 사용자 기록 생성/업데이트
async function createOrUpdateUserRecord(targetLanguageData) {
  try {
    if (!currentUser) return;

    const userRecordRef = firebaseInit.doc(firebaseInit.db, "user_records", currentUser.email);
    
    const newStructure = {
      user_email: currentUser.email,
      last_updated: new Date(),
      target_languages: {},
      overall_stats: {
        study_streak: calculateOverallStreak(targetLanguageData),
        total_study_time: 0,
        last_activity: new Date(),
        total_concepts_across_languages: 0
      }
    };

    // 각 대상 언어별 통계 계산
    Object.keys(targetLanguageData).forEach(targetLang => {
      const langData = targetLanguageData[targetLang];
      
      newStructure.target_languages[targetLang] = {
        stats: {
          total: langData.concepts.size,
          mastered_vocabulary: calculateMasteredConcepts(langData.activities),
          study_streak: calculateLanguageSpecificStreak(langData.activities),
          source_breakdown: {}
        },
        game_stats: calculateGameStats(langData.activities.games),
        quiz_stats: calculateQuizStats(langData.activities.quizzes),
        learning_stats: calculateLearningStats(langData.activities.learning),
        recent_activities: getMostRecentActivities(langData.activities, 20)
      };

      // 원본 언어별 세부 통계
      Object.keys(langData.sourceBreakdown).forEach(sourceLang => {
        const sourceData = langData.sourceBreakdown[sourceLang];
        newStructure.target_languages[targetLang].stats.source_breakdown[sourceLang] = {
          total: sourceData.concepts.size,
          mastered: calculateMasteredConceptsForSource(sourceData.activities)
        };
      });

      newStructure.overall_stats.total_concepts_across_languages += langData.concepts.size;
    });

    // DB 업데이트 (기존 데이터 완전 교체)
    await firebaseInit.setDoc(userRecordRef, newStructure);
    console.log("✅ 새로운 구조로 사용자 기록 생성 완료");

  } catch (error) {
    console.error("❌ 사용자 기록 생성 중 오류:", error);
  }
}

// 📊 선택된 대상 언어 데이터 로드
async function loadSelectedTargetLanguageData() {
  try {
    const userRecordRef = firebaseInit.doc(firebaseInit.db, "user_records", currentUser.email);
    const userRecord = await firebaseInit.getDoc(userRecordRef);

    if (!userRecord.exists()) {
      console.log("⚠️ 사용자 기록이 없습니다");
      return getEmptyProgressData();
    }

    const recordData = userRecord.data();
    
    if (!recordData.target_languages || !recordData.target_languages[selectedTargetLanguage]) {
      console.log(`⚠️ ${selectedTargetLanguage} 데이터가 없습니다`);
      return getEmptyProgressData();
    }

    const targetData = recordData.target_languages[selectedTargetLanguage];
    
    userProgressData = {
      selectedTargetLanguage,
      availableTargetLanguages: Object.keys(recordData.target_languages),
      totalWords: targetData.stats.total,
      masteredWords: targetData.stats.mastered_vocabulary,
      studyStreak: recordData.overall_stats.study_streak,
      targetLanguageStreak: targetData.stats.study_streak,
      achievements: {
        totalGames: targetData.game_stats.total_games,
        avgGameScore: targetData.game_stats.avg_score,
        bestGameScore: targetData.game_stats.best_score,
        totalQuizzes: targetData.quiz_stats.total_quizzes,
        avgQuizAccuracy: targetData.quiz_stats.avg_accuracy,
        bestQuizScore: targetData.quiz_stats.best_score,
        totalLearningSessions: targetData.learning_stats.total_sessions,
        avgSessionQuality: targetData.learning_stats.avg_quality,
        totalStudyTime: (targetData.game_stats.total_time || 0) + 
                       (targetData.quiz_stats.total_time || 0) + 
                       (targetData.learning_stats.total_time || 0)
      },
      sourceBreakdown: targetData.stats.source_breakdown,
      recentActivities: targetData.recent_activities || [],
      weeklyActivity: generateWeeklyActivityData(targetData.recent_activities || []),
      overallStats: recordData.overall_stats
    };

    return userProgressData;

  } catch (error) {
    console.error("❌ 선택된 대상 언어 데이터 로드 중 오류:", error);
    return getEmptyProgressData();
  }
}

// 📊 빈 진도 데이터 반환
function getEmptyProgressData() {
  return {
    selectedTargetLanguage,
    availableTargetLanguages: [selectedTargetLanguage],
    totalWords: 0,
    masteredWords: 0,
    studyStreak: 0,
    targetLanguageStreak: 0,
    achievements: {
      totalGames: 0,
      avgGameScore: 0,
      bestGameScore: 0,
      totalQuizzes: 0,
      avgQuizAccuracy: 0,
      bestQuizScore: 0,
      totalLearningSessions: 0,
      avgSessionQuality: 0,
      totalStudyTime: 0
    },
    sourceBreakdown: {},
    recentActivities: [],
    weeklyActivity: [],
    overallStats: {}
  };
}

// 📊 게임 통계 계산
function calculateGameStats(gameActivities) {
  if (!gameActivities || gameActivities.length === 0) {
    return { total_games: 0, avg_score: 0, best_score: 0, total_time: 0 };
  }

  const scores = gameActivities.map(game => game.score || 0);
  const times = gameActivities.map(game => game.time_spent || game.timeSpent || 0);

  return {
    total_games: gameActivities.length,
    avg_score: Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length),
    best_score: Math.max(...scores),
    total_time: times.reduce((sum, time) => sum + time, 0)
  };
}

// 📊 퀴즈 통계 계산
function calculateQuizStats(quizActivities) {
  if (!quizActivities || quizActivities.length === 0) {
    return { total_quizzes: 0, avg_accuracy: 0, best_score: 0, total_time: 0 };
  }

  const accuracies = quizActivities.map(quiz => {
    const correctAnswers = quiz.correct_answers || quiz.correctCount || 0;
    const totalQuestions = quiz.total_questions || quiz.totalCount || 5;
    return totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
  });

  const scores = quizActivities.map(quiz => quiz.score || 0);
  const times = quizActivities.map(quiz => quiz.time_spent || quiz.timeSpent || 0);

  return {
    total_quizzes: quizActivities.length,
    avg_accuracy: Math.round(accuracies.reduce((sum, acc) => sum + acc, 0) / accuracies.length),
    best_score: Math.max(...scores),
    total_time: times.reduce((sum, time) => sum + time, 0)
  };
}

// 📊 학습 통계 계산
function calculateLearningStats(learningActivities) {
  if (!learningActivities || learningActivities.length === 0) {
    return { total_sessions: 0, avg_quality: 0, total_time: 0 };
  }

  const qualities = learningActivities
    .map(session => session.session_quality || 0)
    .filter(quality => quality > 0);

  const times = learningActivities.map(session => session.session_duration || 0);

  return {
    total_sessions: learningActivities.length,
    avg_quality: qualities.length > 0 ? Math.round(qualities.reduce((sum, q) => sum + q, 0) / qualities.length) : 0,
    total_time: times.reduce((sum, time) => sum + time, 0)
  };
}

// 📊 마스터한 개념 수 계산
function calculateMasteredConcepts(activities) {
  const conceptScores = new Map();

  Object.values(activities).flat().forEach(activity => {
    const conceptIds = activity.concept_id || activity.concept_ids || [];
    let score = 0;

    if (activity.type === 'quiz') {
      const correctAnswers = activity.correct_answers || activity.correctCount || 0;
      const totalQuestions = activity.total_questions || activity.totalCount || 5;
      score = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
    } else if (activity.type === 'game') {
      score = activity.score || 0;
    } else if (activity.type === 'learning') {
      score = activity.session_quality || 70; // 기본값
    }

    if (Array.isArray(conceptIds)) {
      conceptIds.forEach(conceptId => {
        if (!conceptScores.has(conceptId)) {
          conceptScores.set(conceptId, []);
        }
        conceptScores.get(conceptId).push(score);
      });
    }
  });

  let masteredCount = 0;
  conceptScores.forEach((scores, conceptId) => {
    const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    if (avgScore >= 80 && scores.length >= 2) {
      masteredCount++;
    }
  });

  return masteredCount;
}

// 📊 특정 소스 언어의 마스터한 개념 수 계산
function calculateMasteredConceptsForSource(activities) {
  return calculateMasteredConcepts({ activities });
}

// 📊 전체 연속 학습일수 계산
function calculateOverallStreak(targetLanguageData) {
  const allActivities = [];
  
  Object.values(targetLanguageData).forEach(langData => {
    Object.values(langData.activities).flat().forEach(activity => {
      allActivities.push(activity);
    });
  });

  return calculateStreakFromActivities(allActivities);
}

// 📊 특정 언어의 연속 학습일수 계산
function calculateLanguageSpecificStreak(activities) {
  const allActivities = Object.values(activities).flat();
  return calculateStreakFromActivities(allActivities);
}

// 📊 활동으로부터 연속 학습일수 계산
function calculateStreakFromActivities(activities) {
  if (activities.length === 0) return 0;

  // 날짜별로 정리
  const studyDates = new Set();
  activities.forEach(activity => {
    const date = activity.timestamp?.toDate?.() || 
                 (activity.timestamp instanceof Date ? activity.timestamp : new Date(activity.timestamp));
    studyDates.add(date.toDateString());
  });

  // 연속 일수 계산
  const sortedDates = Array.from(studyDates).sort((a, b) => new Date(b) - new Date(a));
  let streak = 0;
  let currentDate = new Date();

  for (const dateStr of sortedDates) {
    const studyDate = new Date(dateStr);
    const daysDiff = Math.floor((currentDate - studyDate) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === streak) {
      streak++;
      currentDate = studyDate;
    } else {
      break;
    }
  }

  return streak;
}

// 📊 최근 활동 추출
function getMostRecentActivities(activities, limit = 20) {
  const allActivities = Object.values(activities).flat();
  
  return allActivities
    .sort((a, b) => {
      const dateA = a.timestamp?.toDate?.() || new Date(a.timestamp);
      const dateB = b.timestamp?.toDate?.() || new Date(b.timestamp);
      return dateB - dateA;
    })
    .slice(0, limit);
}

// 📊 주간 활동 데이터 생성
function generateWeeklyActivityData(activities) {
  const weeklyData = [];
  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    const dayActivities = activities.filter(activity => {
      const activityDate = activity.timestamp?.toDate?.() || new Date(activity.timestamp);
      return activityDate.toDateString() === date.toDateString();
    });

    weeklyData.push({
      date: date.toISOString().split('T')[0],
      day: date.toLocaleDateString('ko-KR', { weekday: 'short' }),
      learningCount: dayActivities.filter(a => a.type === 'learning').length,
      gameCount: dayActivities.filter(a => a.type === 'game').length,
      quizCount: dayActivities.filter(a => a.type === 'quiz').length,
      totalActivities: dayActivities.length
    });
  }

  return weeklyData;
}

// 🎯 대상 언어 변경
async function switchTargetLanguage(newTargetLanguage) {
  try {
    if (selectedTargetLanguage === newTargetLanguage) return;

    console.log(`🔄 대상 언어 변경: ${selectedTargetLanguage} → ${newTargetLanguage}`);
    
    selectedTargetLanguage = newTargetLanguage;
    localStorage.setItem('selectedTargetLanguage', newTargetLanguage);

    // UI 로딩 상태 표시
    showLoadingState();

    // 새 언어 데이터 로드
    const progressData = await loadSelectedTargetLanguageData();
    
    // UI 업데이트
    updateProgressUI(progressData);

    console.log(`✅ ${newTargetLanguage} 진도 표시 완료`);

  } catch (error) {
    console.error("❌ 대상 언어 변경 중 오류:", error);
  }
}

// 📊 진도 UI 업데이트
function updateProgressUI(progressData) {
  try {
    console.log("📊 진도 UI 업데이트 시작");

    // 대상 언어 선택기 업데이트
    updateTargetLanguageSelector();

    // 통계 카드 업데이트
    updateStatsCards();

    // 성취도 섹션 업데이트
    updateAchievements();

    // 소스 언어 분석 업데이트
    updateSourceLanguageBreakdown();

    // 최근 활동 업데이트
    updateRecentActivities();

    // 차트 업데이트
    updateCharts();

    hideLoadingState();
    console.log("✅ 진도 UI 업데이트 완료");

  } catch (error) {
    console.error("❌ 진도 UI 업데이트 중 오류:", error);
    hideLoadingState();
  }
}

// 🎯 대상 언어 선택기 업데이트
function updateTargetLanguageSelector() {
  const selector = document.getElementById('target-language-selector');
  if (!selector) return;

  // 사용 가능한 대상 언어들로 옵션 생성
  selector.innerHTML = userProgressData.availableTargetLanguages
    .map(lang => `
      <option value="${lang}" ${lang === selectedTargetLanguage ? 'selected' : ''}>
        ${getLanguageDisplayName(lang)}
      </option>
    `).join('');
}

// 📊 통계 카드 업데이트
function updateStatsCards() {
  // 총 단어 수
  const totalWordsEl = document.getElementById('total-words-count');
  if (totalWordsEl) totalWordsEl.textContent = userProgressData.totalWords;

  // 마스터한 단어 수
  const masteredWordsEl = document.getElementById('mastered-words-count');
  if (masteredWordsEl) masteredWordsEl.textContent = userProgressData.masteredWords;

  // 전체 연속 학습일수
  const studyStreakEl = document.getElementById('study-streak-count');
  if (studyStreakEl) studyStreakEl.textContent = `${userProgressData.studyStreak}일`;

  // 대상 언어별 연속 학습일수
  const targetStreakEl = document.getElementById('target-language-streak');
  if (targetStreakEl) targetStreakEl.textContent = `${userProgressData.targetLanguageStreak}일`;

  // 완료율
  const completionRate = userProgressData.totalWords > 0 
    ? Math.round((userProgressData.masteredWords / userProgressData.totalWords) * 100) 
    : 0;
  const completionRateEl = document.getElementById('completion-rate');
  if (completionRateEl) completionRateEl.textContent = `${completionRate}%`;

  // 퀴즈 정확도
  const quizAccuracyEl = document.getElementById('quiz-accuracy-rate');
  if (quizAccuracyEl) quizAccuracyEl.textContent = `${userProgressData.achievements.avgQuizAccuracy}%`;
}

// 🏆 성취도 업데이트
function updateAchievements() {
  const achievements = userProgressData.achievements;

  // 게임 성취도
  const totalGamesEl = document.getElementById('total-games-count');
  if (totalGamesEl) totalGamesEl.textContent = achievements.totalGames;

  const avgGameScoreEl = document.getElementById('avg-game-score');
  if (avgGameScoreEl) avgGameScoreEl.textContent = achievements.avgGameScore;

  // 퀴즈 성취도
  const totalQuizzesEl = document.getElementById('total-quizzes-count');
  if (totalQuizzesEl) totalQuizzesEl.textContent = achievements.totalQuizzes;

  const avgQuizAccuracyEl = document.getElementById('avg-quiz-accuracy');
  if (avgQuizAccuracyEl) avgQuizAccuracyEl.textContent = `${achievements.avgQuizAccuracy}%`;

  // 학습 성취도
  const totalSessionsEl = document.getElementById('total-learning-sessions');
  if (totalSessionsEl) totalSessionsEl.textContent = achievements.totalLearningSessions;

  const avgSessionQualityEl = document.getElementById('avg-session-quality');
  if (avgSessionQualityEl) avgSessionQualityEl.textContent = achievements.avgSessionQuality;

  // 총 학습 시간
  const totalStudyTimeEl = document.getElementById('total-study-time');
  if (totalStudyTimeEl) {
    const hours = Math.floor(achievements.totalStudyTime / 3600);
    const minutes = Math.floor((achievements.totalStudyTime % 3600) / 60);
    totalStudyTimeEl.textContent = `${hours}시간 ${minutes}분`;
  }
}

// 📈 소스 언어 분석 업데이트
function updateSourceLanguageBreakdown() {
  const container = document.getElementById('source-breakdown-container');
  if (!container) return;

  const sourceBreakdown = userProgressData.sourceBreakdown;
  
  if (Object.keys(sourceBreakdown).length === 0) {
    container.innerHTML = '<p class="text-gray-500 text-center py-4">소스 언어 데이터가 없습니다.</p>';
    return;
  }

  const html = Object.entries(sourceBreakdown).map(([sourceLang, data]) => `
    <div class="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
      <div class="flex justify-between items-center mb-2">
        <h4 class="font-semibold text-gray-900">${getLanguageDisplayName(sourceLang)}</h4>
        <button class="text-blue-600 text-sm hover:underline" onclick="showSourceDetails('${sourceLang}')">
          자세히 보기
        </button>
      </div>
      <div class="flex justify-between text-sm text-gray-600">
        <span>총 단어: ${data.total}</span>
        <span>마스터: ${data.mastered}</span>
      </div>
      <div class="w-full bg-gray-200 rounded-full h-2 mt-2">
        <div class="bg-blue-600 h-2 rounded-full" style="width: ${data.total > 0 ? (data.mastered / data.total) * 100 : 0}%"></div>
      </div>
    </div>
  `).join('');

  container.innerHTML = html;
}

// 📈 최근 활동 업데이트
function updateRecentActivities() {
  const container = document.getElementById('recent-activities-list');
  if (!container) return;

  const activities = userProgressData.recentActivities.slice(0, 10);
  
  if (activities.length === 0) {
    container.innerHTML = '<p class="text-gray-500 text-center py-8">최근 활동이 없습니다.</p>';
    return;
  }

  const html = activities.map(activity => {
    const date = activity.timestamp?.toDate?.() || new Date(activity.timestamp);
    const timeAgo = getTimeAgo(date);
    
    let icon, bgColor, title, details;
    
    if (activity.type === 'learning') {
      icon = 'fas fa-book';
      bgColor = 'bg-blue-100 text-blue-600';
      title = '학습 세션';
      details = `${activity.concept_id?.length || 0}개 개념`;
    } else if (activity.type === 'quiz') {
      icon = 'fas fa-question-circle';
      bgColor = 'bg-purple-100 text-purple-600';
      title = '퀴즈 도전';
      const accuracy = Math.round((activity.correct_answers / activity.total_questions) * 100 || 0);
      details = `정확도 ${accuracy}%`;
    } else if (activity.type === 'game') {
      icon = 'fas fa-gamepad';
      bgColor = 'bg-green-100 text-green-600';
      title = '게임 플레이';
      details = `점수 ${activity.score || 0}`;
    }

    return `
      <div class="bg-white rounded-lg shadow-sm p-4 border border-gray-200 hover:shadow-md transition-shadow">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 ${bgColor} rounded-full flex items-center justify-center">
              <i class="${icon}"></i>
            </div>
            <div>
              <div class="font-medium text-gray-900">${title}</div>
              <div class="text-sm text-gray-500">${details}</div>
            </div>
          </div>
          <div class="text-right">
            <div class="text-sm font-medium text-gray-900">${timeAgo}</div>
          </div>
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = html;
}

// ⏰ 시간 차이 계산
function getTimeAgo(date) {
  const now = new Date();
  const diff = now - date;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}일 전`;
  if (hours > 0) return `${hours}시간 전`;
  if (minutes > 0) return `${minutes}분 전`;
  return '방금 전';
}

// 🌐 언어 표시 이름 반환
function getLanguageDisplayName(langCode) {
  const names = {
    english: '영어',
    japanese: '일본어',
    chinese: '중국어',
    spanish: '스페인어',
    french: '프랑스어',
    german: '독일어',
    korean: '한국어'
  };
  return names[langCode] || langCode;
}

// 📊 차트 업데이트
function updateCharts() {
  updateWeeklyActivityChart();
  updateProgressChart();
}

// 📊 주간 활동 차트 업데이트
function updateWeeklyActivityChart() {
  const canvas = document.getElementById('weekly-activity-chart');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const data = userProgressData.weeklyActivity;

  // Chart.js를 사용한 차트 구현 (간단한 예시)
  // 실제 구현시에는 Chart.js 라이브러리 필요
}

// 📊 진도 차트 업데이트
function updateProgressChart() {
  const canvas = document.getElementById('progress-chart');
  if (!canvas) return;

  // 진도 차트 구현
}

// 🔄 로딩 상태 표시/숨김
function showLoadingState() {
  const loadingEl = document.getElementById('loading-state');
  if (loadingEl) loadingEl.classList.remove('hidden');
}

function hideLoadingState() {
  const loadingEl = document.getElementById('loading-state');
  if (loadingEl) loadingEl.classList.add('hidden');
}

// 📋 소스 언어 세부 정보 모달 표시
function showSourceDetails(sourceLang) {
  // 모달에서 특정 소스 언어의 세부 정보 표시
  console.log(`${sourceLang} 세부 정보 표시`);
}

// 🎮 이벤트 리스너 설정
async function setupEventListeners() {
  // 대상 언어 변경
  const targetSelector = document.getElementById('target-language-selector');
  if (targetSelector) {
    targetSelector.addEventListener('change', (e) => {
      switchTargetLanguage(e.target.value);
    });
  }

  // 새로고침 버튼
  const refreshBtn = document.getElementById('refresh-progress');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      loadTargetLanguageCentricProgress();
    });
  }
}

// 📊 완료 업데이트 확인 (호환성 유지)
async function checkCompletionUpdates() {
  checkLearningCompletionUpdate();
  checkGameCompletionUpdate();
  checkQuizCompletionUpdate();
}

// 📊 학습 완료 업데이트 확인
async function checkLearningCompletionUpdate() {
  try {
    const learningCompletionData = localStorage.getItem("learningCompletionUpdate");
    
    if (learningCompletionData) {
      const data = JSON.parse(learningCompletionData);
      
      if (data.userId === currentUser?.uid) {
        console.log("🔄 학습 완료 후 진도 새로고침");
        localStorage.removeItem("learningCompletionUpdate");
        
        setTimeout(() => {
          loadTargetLanguageCentricProgress();
        }, 1000);
      }
    }
  } catch (error) {
    console.error("❌ 학습 완료 상태 확인 중 오류:", error);
  }
}

// 🎮 게임 완료 업데이트 확인
function checkGameCompletionUpdate() {
  try {
    const gameCompletionData = localStorage.getItem("gameCompletionUpdate");

    if (gameCompletionData) {
      const data = JSON.parse(gameCompletionData);

      if (data.userId === currentUser?.uid) {
        console.log("🔄 게임 완료 후 진도 새로고침");
        localStorage.removeItem("gameCompletionUpdate");
        
        setTimeout(() => {
          loadTargetLanguageCentricProgress();
        }, 1000);
      }
    }
  } catch (error) {
    console.error("❌ 게임 완료 상태 확인 중 오류:", error);
  }
}

// 📊 퀴즈 완료 업데이트 확인
function checkQuizCompletionUpdate() {
  try {
    const quizCompletionData = localStorage.getItem("quizCompletionUpdate");
    
    if (quizCompletionData) {
      const data = JSON.parse(quizCompletionData);
      
      if (data.userId === currentUser?.uid) {
        console.log("🔄 퀴즈 완료 후 진도 새로고침");
        localStorage.removeItem("quizCompletionUpdate");
        
        setTimeout(() => {
          loadTargetLanguageCentricProgress();
        }, 1000);
      }
    }
  } catch (error) {
    console.error("❌ 퀴즈 완료 상태 확인 중 오류:", error);
  }
}
