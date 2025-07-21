// 📊 Target Language Centric Progress Loader
// 대상 언어 중심 구조에서 진도 데이터 로드

/**
 * 대상 언어 중심 진도 데이터 로드
 */
async function loadTargetLanguageCentricProgress(userEmail, selectedTargetLanguage = 'english') {
  try {
    console.log(`📊 대상 언어 중심 진도 로드: ${selectedTargetLanguage}`);

    const userRecordRef = firebaseInit.doc(firebaseInit.db, "user_records", userEmail);
    const userRecord = await firebaseInit.getDoc(userRecordRef);

    if (!userRecord.exists()) {
      console.log("📊 기존 구조에서 마이그레이션 필요");
      await migrateToTargetLanguageCentric(userEmail);
      return await loadTargetLanguageCentricProgress(userEmail, selectedTargetLanguage);
    }

    const recordData = userRecord.data();
    
    // 새로운 구조인지 확인
    if (!recordData.target_languages) {
      console.log("📊 구조 업그레이드 필요");
      await migrateToTargetLanguageCentric(userEmail);
      return await loadTargetLanguageCentricProgress(userEmail, selectedTargetLanguage);
    }

    // 선택된 대상 언어 데이터 추출
    const targetLanguageData = recordData.target_languages[selectedTargetLanguage] || {
      stats: { total: 0, mastered_vocabulary: 0, study_streak: 0, source_breakdown: {} },
      game_stats: { total_games: 0, avg_score: 0, best_score: 0 },
      quiz_stats: { total_quizzes: 0, avg_accuracy: 0, best_accuracy: 0 },
      learning_stats: { total_sessions: 0, avg_quality: 0 },
      recent_activities: []
    };

    // UI 표시용 데이터 구성
    const progressData = {
      selectedTargetLanguage,
      availableTargetLanguages: Object.keys(recordData.target_languages),
      
      // 기본 통계 (선택된 대상 언어 기준)
      totalWords: targetLanguageData.stats.total,
      masteredWords: targetLanguageData.stats.mastered_vocabulary,
      studyStreak: recordData.overall_stats.study_streak, // 전체 연속일
      targetLanguageStreak: targetLanguageData.stats.study_streak, // 해당 언어 연속일
      
      // 활동 통계 (선택된 대상 언어 기준)
      achievements: {
        totalGames: targetLanguageData.game_stats.total_games,
        avgGameScore: targetLanguageData.game_stats.avg_score,
        bestGameScore: targetLanguageData.game_stats.best_score,
        totalQuizzes: targetLanguageData.quiz_stats.total_quizzes,
        avgQuizAccuracy: targetLanguageData.quiz_stats.avg_accuracy,
        bestQuizScore: targetLanguageData.quiz_stats.best_score,
        totalLearningSessions: targetLanguageData.learning_stats.total_sessions,
        avgSessionQuality: targetLanguageData.learning_stats.avg_quality,
        totalStudyTime: (targetLanguageData.game_stats.total_time || 0) + 
                       (targetLanguageData.quiz_stats.total_time || 0) + 
                       (targetLanguageData.learning_stats.total_time || 0)
      },

      // 원본 언어별 세부 정보 (모달용)
      sourceBreakdown: targetLanguageData.stats.source_breakdown,
      
      // 최근 활동 (선택된 대상 언어 기준)
      recentActivities: targetLanguageData.recent_activities || [],
      
      // 전체 통계 (참고용)
      overallStats: recordData.overall_stats
    };

    return progressData;

  } catch (error) {
    console.error("❌ 대상 언어 중심 진도 로드 중 오류:", error);
    throw error;
  }
}

/**
 * 대상 언어 선택 변경 시 데이터 업데이트
 */
async function switchTargetLanguage(userEmail, newTargetLanguage) {
  try {
    console.log(`🔄 대상 언어 변경: ${newTargetLanguage}`);
    
    // 새로운 대상 언어 데이터 로드
    const progressData = await loadTargetLanguageCentricProgress(userEmail, newTargetLanguage);
    
    // UI 업데이트
    updateProgressUI(progressData);
    
    // 언어 필터 상태 저장
    currentLanguageFilter.target = newTargetLanguage;
    const { saveLanguageFilterSettings } = await import("../../utils/language-utils.js");
    saveLanguageFilterSettings(
      currentLanguageFilter.source,
      newTargetLanguage,
      "progressLanguageFilter"
    );

    return progressData;
    
  } catch (error) {
    console.error("❌ 대상 언어 변경 중 오류:", error);
  }
}

/**
 * 대상 언어 중심 UI 업데이트
 */
function updateProgressUI(progressData) {
  try {
    console.log("🔄 대상 언어 중심 UI 업데이트");

    // 기본 통계 업데이트
    updateTargetLanguageStats(progressData);
    
    // 활동 통계 업데이트
    updateTargetLanguageAchievements(progressData);
    
    // 최근 활동 업데이트
    updateTargetLanguageActivities(progressData);
    
    // 대상 언어 선택기 업데이트
    updateTargetLanguageSelector(progressData);
    
    console.log("✅ 대상 언어 중심 UI 업데이트 완료");
    
  } catch (error) {
    console.error("❌ 대상 언어 중심 UI 업데이트 중 오류:", error);
  }
}

/**
 * 대상 언어 기본 통계 업데이트
 */
function updateTargetLanguageStats(progressData) {
  // 총 단어 수
  const totalWordsElement = document.getElementById('total-words-count');
  if (totalWordsElement) {
    totalWordsElement.textContent = progressData.totalWords || 0;
  }

  // 마스터한 단어 수
  const masteredWordsElement = document.getElementById('mastered-words-count');
  if (masteredWordsElement) {
    masteredWordsElement.textContent = progressData.masteredWords || 0;
  }

  // 연속 학습일 (전체 vs 해당 언어)
  const studyStreakElement = document.getElementById('study-streak-count');
  if (studyStreakElement) {
    const overallStreak = progressData.studyStreak || 0;
    const targetStreak = progressData.targetLanguageStreak || 0;
    studyStreakElement.textContent = `${overallStreak}일`;
    studyStreakElement.title = `전체: ${overallStreak}일, ${progressData.selectedTargetLanguage}: ${targetStreak}일`;
  }

  // 퀴즈 정확도
  const quizAccuracyElement = document.getElementById('quiz-accuracy-rate');
  if (quizAccuracyElement) {
    const accuracy = Math.round(progressData.achievements.avgQuizAccuracy || 0);
    quizAccuracyElement.textContent = `${accuracy}%`;
  }
}

/**
 * 대상 언어 활동 통계 업데이트
 */
function updateTargetLanguageAchievements(progressData) {
  // 게임 통계
  const totalGamesElement = document.getElementById('total-games-count');
  const avgGameScoreElement = document.getElementById('avg-game-score');
  
  if (totalGamesElement) {
    totalGamesElement.textContent = `${progressData.achievements.totalGames || 0}회`;
  }
  
  if (avgGameScoreElement) {
    const avgScore = Math.round(progressData.achievements.avgGameScore || 0);
    avgGameScoreElement.textContent = `${avgScore}점`;
  }

  // 퀴즈 통계
  const totalQuizzesElement = document.getElementById('total-quizzes-count');
  const avgQuizAccuracyElement = document.getElementById('avg-quiz-accuracy');
  
  if (totalQuizzesElement) {
    totalQuizzesElement.textContent = `${progressData.achievements.totalQuizzes || 0}회`;
  }
  
  if (avgQuizAccuracyElement) {
    const accuracy = Math.round(progressData.achievements.avgQuizAccuracy || 0);
    avgQuizAccuracyElement.textContent = `${accuracy}%`;
  }

  // 학습 통계
  const totalSessionsElement = document.getElementById('total-learning-sessions');
  const avgSessionQualityElement = document.getElementById('avg-session-quality');
  
  if (totalSessionsElement) {
    totalSessionsElement.textContent = `${progressData.achievements.totalLearningSessions || 0}회`;
  }
  
  if (avgSessionQualityElement) {
    const quality = Math.round(progressData.achievements.avgSessionQuality || 0);
    avgSessionQualityElement.textContent = quality > 0 ? `${quality}%` : '-';
  }

  // 총 학습 시간
  const totalStudyTimeElement = document.getElementById('total-study-time');
  if (totalStudyTimeElement) {
    const totalMinutes = Math.round(progressData.achievements.totalStudyTime || 0);
    totalStudyTimeElement.textContent = `${totalMinutes}분`;
  }

  // 완료율
  const completionRateElement = document.getElementById('completion-rate');
  if (completionRateElement) {
    const rate = progressData.totalWords > 0 ? 
      Math.round((progressData.masteredWords / progressData.totalWords) * 100) : 0;
    completionRateElement.textContent = `${rate}%`;
  }
}

/**
 * 대상 언어 최근 활동 업데이트
 */
function updateTargetLanguageActivities(progressData) {
  const container = document.getElementById('recent-activities-list');
  if (!container) return;

  if (!progressData.recentActivities || progressData.recentActivities.length === 0) {
    container.innerHTML = `
      <div class="text-center py-8 text-gray-500">
        <i class="fas fa-language text-3xl mb-2"></i>
        <p>${progressData.selectedTargetLanguage.charAt(0).toUpperCase() + progressData.selectedTargetLanguage.slice(1)} 학습 활동이 없습니다.</p>
        <p class="text-sm mt-2">이 언어로 학습을 시작해보세요!</p>
      </div>
    `;
    return;
  }

  let html = '';
  progressData.recentActivities.slice(0, 10).forEach((activity) => {
    const timeAgo = getTimeAgo(new Date(activity.timestamp || activity.completed_at || activity.createdAt));
    const languageLabel = `학습 언어: ${progressData.selectedTargetLanguage}`;

    if (activity.type === 'learning') {
      html += `
        <div class="bg-white rounded-lg shadow-sm p-4 border border-gray-200 hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <i class="fas fa-book text-blue-600"></i>
              </div>
              <div>
                <div class="font-medium text-gray-900">학습 세션</div>
                <div class="text-sm text-gray-500">${languageLabel}</div>
              </div>
            </div>
            <div class="text-right">
              <div class="text-sm font-medium text-gray-900">${timeAgo}</div>
            </div>
          </div>
        </div>
      `;
    }
    // 게임, 퀴즈 활동도 비슷하게 추가
  });

  container.innerHTML = html;
}

/**
 * 대상 언어 선택기 업데이트
 */
function updateTargetLanguageSelector(progressData) {
  // 대상 언어 선택 드롭다운이 있다면 업데이트
  const targetLanguageSelector = document.getElementById('target-language-selector');
  if (targetLanguageSelector) {
    let options = '';
    progressData.availableTargetLanguages.forEach(lang => {
      const selected = lang === progressData.selectedTargetLanguage ? 'selected' : '';
      const displayName = {
        'english': '영어',
        'japanese': '일본어',
        'chinese': '중국어',
        'spanish': '스페인어',
        'french': '프랑스어'
      }[lang] || lang;
      
      options += `<option value="${lang}" ${selected}>${displayName}</option>`;
    });
    targetLanguageSelector.innerHTML = options;
  }
}

/**
 * 원본 언어별 세부 정보 모달 표시
 */
function showSourceLanguageBreakdown(progressData) {
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
  
  let breakdownHtml = '';
  Object.keys(progressData.sourceBreakdown).forEach(sourceLang => {
    const data = progressData.sourceBreakdown[sourceLang];
    const displayName = {
      'korean': '한국어',
      'japanese': '일본어',
      'english': '영어',
      'chinese': '중국어'
    }[sourceLang] || sourceLang;
    
    breakdownHtml += `
      <div class="bg-gray-50 rounded-lg p-4 mb-4">
        <h4 class="font-medium text-lg mb-2">${displayName} → ${progressData.selectedTargetLanguage}</h4>
        <div class="grid grid-cols-2 gap-4">
          <div class="text-center">
            <div class="text-2xl font-bold text-blue-600">${data.total}</div>
            <div class="text-sm text-gray-600">총 단어</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-green-600">${data.mastered}</div>
            <div class="text-sm text-gray-600">마스터</div>
          </div>
        </div>
      </div>
    `;
  });
  
  modal.innerHTML = `
    <div class="bg-white rounded-lg max-w-lg w-full mx-4 p-6">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-xl font-bold">원본 언어별 세부 정보</h3>
        <button onclick="this.closest('.fixed').remove()" class="text-gray-500 hover:text-gray-700">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div>
        ${breakdownHtml}
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
}

// Export functions
export {
  loadTargetLanguageCentricProgress,
  switchTargetLanguage,
  updateProgressUI,
  showSourceLanguageBreakdown
};
