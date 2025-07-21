// 📊 Progress Data Migration System
// 기존 언어쌍 중심 구조를 대상언어 중심 구조로 마이그레이션

/**
 * 대상 언어 중심으로 DB 구조 마이그레이션
 */
async function migrateToTargetLanguageCentric(userEmail) {
  try {
    console.log("🔄 대상 언어 중심 구조로 마이그레이션 시작:", userEmail);

    // 1. 기존 활동 기록들 수집
    const allActivities = await collectAllUserActivities(userEmail);
    
    // 2. 대상 언어별로 그룹화
    const targetLanguageData = groupByTargetLanguage(allActivities);
    
    // 3. 새로운 구조로 변환
    const newUserRecord = createTargetLanguageStructure(userEmail, targetLanguageData);
    
    // 4. DB 업데이트
    await updateUserRecordStructure(userEmail, newUserRecord);
    
    console.log("✅ 마이그레이션 완료:", newUserRecord);
    return newUserRecord;
    
  } catch (error) {
    console.error("❌ 마이그레이션 중 오류:", error);
    throw error;
  }
}

/**
 * 사용자의 모든 활동 기록 수집
 */
async function collectAllUserActivities(userEmail) {
  const activities = {
    learning: [],
    games: [],
    quizzes: []
  };

  // 학습 기록
  const learningQuery = firebaseInit.query(
    firebaseInit.collection(firebaseInit.db, "learning_records"),
    firebaseInit.where("user_email", "==", userEmail)
  );
  const learningSnapshot = await firebaseInit.getDocs(learningQuery);
  learningSnapshot.forEach(doc => {
    activities.learning.push({ id: doc.id, ...doc.data() });
  });

  // 게임 기록
  const gameQuery = firebaseInit.query(
    firebaseInit.collection(firebaseInit.db, "game_records"),
    firebaseInit.where("user_email", "==", userEmail)
  );
  const gameSnapshot = await firebaseInit.getDocs(gameQuery);
  gameSnapshot.forEach(doc => {
    activities.games.push({ id: doc.id, ...doc.data() });
  });

  // 퀴즈 기록
  const quizQuery = firebaseInit.query(
    firebaseInit.collection(firebaseInit.db, "quiz_records"),
    firebaseInit.where("user_email", "==", userEmail)
  );
  const quizSnapshot = await firebaseInit.getDocs(quizQuery);
  quizSnapshot.forEach(doc => {
    activities.quizzes.push({ id: doc.id, ...doc.data() });
  });

  return activities;
}

/**
 * 대상 언어별로 활동 그룹화
 */
function groupByTargetLanguage(activities) {
  const targetLanguages = {};

  // 모든 활동을 대상 언어별로 분류
  ['learning', 'games', 'quizzes'].forEach(activityType => {
    activities[activityType].forEach(activity => {
      // 언어 쌍 정보 추출
      const languagePair = activity.language_pair || 
                          { source: activity.source_language || 'korean', 
                            target: activity.target_language || 'english' };
      
      const targetLang = languagePair.target;
      const sourceLang = languagePair.source;

      // 대상 언어별 구조 초기화
      if (!targetLanguages[targetLang]) {
        targetLanguages[targetLang] = {
          stats: { total: 0, mastered: 0, source_breakdown: {} },
          activities: { learning: [], games: [], quizzes: [] },
          concepts: new Set()
        };
      }

      // 원본 언어별 세부 분류
      if (!targetLanguages[targetLang].stats.source_breakdown[sourceLang]) {
        targetLanguages[targetLang].stats.source_breakdown[sourceLang] = {
          total: 0, mastered: 0
        };
      }

      // 활동 추가
      targetLanguages[targetLang].activities[activityType].push(activity);

      // 개념 ID 수집
      const conceptIds = activity.concept_id || activity.concept_ids || [];
      conceptIds.forEach(id => targetLanguages[targetLang].concepts.add(id));
    });
  });

  return targetLanguages;
}

/**
 * 새로운 대상 언어 중심 구조 생성
 */
function createTargetLanguageStructure(userEmail, targetLanguageData) {
  const newStructure = {
    user_email: userEmail,
    last_updated: new Date(),
    target_languages: {},
    overall_stats: {
      study_streak: 0,
      total_study_time: 0,
      last_activity: null,
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
      recent_activities: getMostRecentActivities(langData.activities, 10)
    };

    // 원본 언어별 세부 통계
    Object.keys(langData.stats.source_breakdown).forEach(sourceLang => {
      const sourceActivities = filterActivitiesBySource(langData.activities, sourceLang);
      const sourceConcepts = new Set();
      
      sourceActivities.forEach(activity => {
        const conceptIds = activity.concept_id || activity.concept_ids || [];
        conceptIds.forEach(id => sourceConcepts.add(id));
      });

      newStructure.target_languages[targetLang].stats.source_breakdown[sourceLang] = {
        total: sourceConcepts.size,
        mastered: calculateMasteredConceptsForSource(sourceActivities)
      };
    });

    // 전체 통계에 반영
    newStructure.overall_stats.total_concepts_across_languages += langData.concepts.size;
  });

  return newStructure;
}

/**
 * 새로운 구조로 DB 업데이트
 */
async function updateUserRecordStructure(userEmail, newStructure) {
  const userRecordRef = firebaseInit.doc(firebaseInit.db, "user_records", userEmail);
  
  // 기존 데이터 백업 (선택사항)
  const backupRef = firebaseInit.doc(firebaseInit.db, "user_records_backup", userEmail);
  const existingDoc = await firebaseInit.getDoc(userRecordRef);
  if (existingDoc.exists()) {
    await firebaseInit.setDoc(backupRef, {
      ...existingDoc.data(),
      backed_up_at: new Date()
    });
  }

  // 새로운 구조로 업데이트
  await firebaseInit.setDoc(userRecordRef, newStructure);
}

// 헬퍼 함수들
function calculateMasteredConcepts(activities) {
  // 마스터 판정 로직 (기존과 동일)
  const conceptScores = {};
  
  ['learning', 'games', 'quizzes'].forEach(type => {
    activities[type].forEach(activity => {
      const conceptIds = activity.concept_id || activity.concept_ids || [];
      conceptIds.forEach(conceptId => {
        if (!conceptScores[conceptId]) conceptScores[conceptId] = [];
        
        let score = 0;
        if (type === 'games') score = activity.score || 0;
        else if (type === 'quizzes') score = activity.accuracy || 0;
        else if (type === 'learning') score = activity.session_quality || 0;
        
        if (score > 0) conceptScores[conceptId].push(score);
      });
    });
  });

  let masteredCount = 0;
  Object.keys(conceptScores).forEach(conceptId => {
    const scores = conceptScores[conceptId];
    if (scores.length >= 2) {
      const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
      if (avgScore >= 70) masteredCount++;
    }
  });

  return masteredCount;
}

function calculateLanguageSpecificStreak(activities) {
  // 해당 언어에서의 연속 학습일 계산
  const allActivities = [...activities.learning, ...activities.games, ...activities.quizzes];
  const dates = allActivities
    .map(a => a.timestamp?.toDate() || a.completed_at?.toDate() || new Date(a.createdAt))
    .sort((a, b) => b - a);

  if (dates.length === 0) return 0;

  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  for (let i = 0; i < dates.length; i++) {
    const activityDate = new Date(dates[i]);
    activityDate.setHours(0, 0, 0, 0);

    const dayDiff = Math.floor((currentDate - activityDate) / (1000 * 60 * 60 * 24));
    
    if (dayDiff === streak) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else if (dayDiff > streak) {
      break;
    }
  }

  return streak;
}

function calculateGameStats(games) {
  if (games.length === 0) return { total_games: 0, avg_score: 0, best_score: 0 };

  const scores = games.map(g => g.score || 0);
  return {
    total_games: games.length,
    avg_score: Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length),
    best_score: Math.max(...scores),
    total_time: games.reduce((sum, g) => sum + (g.time_spent || 0), 0)
  };
}

function calculateQuizStats(quizzes) {
  if (quizzes.length === 0) return { total_quizzes: 0, avg_accuracy: 0, best_accuracy: 0 };

  const accuracies = quizzes.map(q => q.accuracy || 0);
  return {
    total_quizzes: quizzes.length,
    avg_accuracy: Math.round(accuracies.reduce((sum, acc) => sum + acc, 0) / accuracies.length),
    best_accuracy: Math.max(...accuracies),
    total_time: quizzes.reduce((sum, q) => sum + (q.time_spent || 0), 0)
  };
}

function calculateLearningStats(learning) {
  if (learning.length === 0) return { total_sessions: 0, avg_quality: 0 };

  const qualities = learning.map(l => l.session_quality || 0).filter(q => q > 0);
  return {
    total_sessions: learning.length,
    avg_quality: qualities.length > 0 ? 
      Math.round(qualities.reduce((sum, q) => sum + q, 0) / qualities.length) : 0,
    total_time: learning.reduce((sum, l) => sum + (l.session_duration || 0), 0)
  };
}

function getMostRecentActivities(activities, limit = 10) {
  const allActivities = [...activities.learning, ...activities.games, ...activities.quizzes]
    .sort((a, b) => (b.timestamp?.toDate() || b.completed_at?.toDate() || new Date(b.createdAt)) - 
                   (a.timestamp?.toDate() || a.completed_at?.toDate() || new Date(a.createdAt)));
  
  return allActivities.slice(0, limit);
}

function filterActivitiesBySource(activities, sourceLang) {
  const filtered = [];
  ['learning', 'games', 'quizzes'].forEach(type => {
    activities[type].forEach(activity => {
      const languagePair = activity.language_pair || 
                          { source: activity.source_language || 'korean' };
      if (languagePair.source === sourceLang) {
        filtered.push(activity);
      }
    });
  });
  return filtered;
}

function calculateMasteredConceptsForSource(activities) {
  return calculateMasteredConcepts({ 
    learning: activities.filter(a => a.type === 'learning'),
    games: activities.filter(a => a.type === 'game'),
    quizzes: activities.filter(a => a.type === 'quiz')
  });
}

// Export functions
export {
  migrateToTargetLanguageCentric,
  collectAllUserActivities,
  groupByTargetLanguage,
  createTargetLanguageStructure
};
