// 🔍 Progress Data Management System
// 진도 페이지에서 사용자의 학습 데이터를 로드하고 표시하는 시스템

// 전역 변수들
let currentUser = null;
let isDataLoaded = false; // 데이터 로딩 완료 상태
let userProgressData = {
  achievements: {
    totalGames: 0,
    avgGameScore: 0,
    bestGameScore: 0,
    totalQuizzes: 0,
    avgQuizAccuracy: 0,
    bestQuizScore: 0,
    totalLearningSessions: 0,
    avgSessionQuality: 0,
    totalStudyTime: 0,
    totalQuizTime: 0
  },
  weeklyActivity: [],
  categoryProgress: {},
  languageMastery: {},
  recentActivities: [],
  goals: {},
  concepts: [],
  conceptCounts: { vocabulary: 0, grammar: 0, examples: 0, total: 0 },
  masteredConcepts: [],
  recentStudied: [],
  totalWords: 0,
  masteredWords: 0,
  studyStreak: 0,
  quizAccuracy: 0,
  gameResults: []
};

let conceptCounts = { vocabulary: 0, grammar: 0, examples: 0, total: 0 };

// 페이지가 로드되면 자동으로 실행
document.addEventListener("DOMContentLoaded", async function () {
  try {
    // Firebase 초기화 확인
    if (typeof firebaseInit === 'undefined' || !firebaseInit.db) {
      console.error("❌ Firebase가 초기화되지 않았습니다");
      return;
    }

    console.log("✅ Firebase 초기화 확인 완료");

    // 인증 상태 확인
    firebaseInit.auth.onAuthStateChanged(async (user) => {
      if (user) {
        currentUser = user;
        console.log("✅ 사용자 인증 상태:", user.email);
        
        try {
          await loadDetailedProgressData();
          await checkLearningCompletionUpdate();
          await checkGameCompletionUpdate();
          await checkQuizCompletionUpdate();
          setupEventListeners();
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

// 📊 상세 진도 데이터 로드 (모든 데이터 통합)
async function loadDetailedProgressData() {
  try {
    console.log("📊 상세 진도 데이터 로드 시작");

    // 1. user_records에서 기본 진도 데이터 로드
    await loadProgressFromUserRecords();
    
    // 2. 게임 통계 로드
    await loadGameStats();
    
    // 3. 퀴즈 통계 로드
    await loadQuizStats();
    
    // 4. 최근 활동 로드
    await loadRecentActivities();
    
    // 5. 주간 활동 데이터 생성
    generateWeeklyActivity();
    
    // 5. UI 업데이트
    updateAllUI();
    
    // 6. 목표 데이터 로드
    await loadUserGoals();
    
    // 7. 데이터 로딩 완료 상태 업데이트
    isDataLoaded = true;
    console.log("📊 모든 데이터 로딩 완료 - isDataLoaded:", isDataLoaded);
    
    console.log("✅ 상세 진도 데이터 로드 완료");
  } catch (error) {
    console.error("❌ 상세 진도 데이터 로드 중 오류:", error);
  }
}

// 📊 user_records 컬렉션에서 통합 데이터 로드
async function loadProgressFromUserRecords() {
  try {
    if (!currentUser) {
      console.log("❌ 사용자가 로그인하지 않았습니다");
      return;
    }

    console.log("📊 user_records에서 통합 데이터 로드 시작:", currentUser.email);

    const userRecordRef = firebaseInit.doc(firebaseInit.db, "user_records", currentUser.email);
    const userRecord = await firebaseInit.getDoc(userRecordRef);

    if (userRecord.exists()) {
      const recordData = userRecord.data();
      console.log("✅ user_records 문서 발견:", Object.keys(recordData));

      // 📊 데이터 마이그레이션: recent_studied가 객체인 경우 배열로 변환
      let migrationNeeded = false;
      if (recordData.recent_studied && !Array.isArray(recordData.recent_studied)) {
        console.log("🔄 recent_studied 데이터 마이그레이션: 객체 → 배열");
        // 기존 객체 데이터를 배열로 변환하거나 빈 배열로 초기화
        recordData.recent_studied = [];
        migrationNeeded = true;
      }

      // 마이그레이션이 필요한 경우 DB 업데이트
      if (migrationNeeded) {
        try {
          await firebaseInit.updateDoc(userRecordRef, {
            recent_studied: []
          });
          console.log("✅ recent_studied 마이그레이션 완료");
        } catch (error) {
          console.error("❌ 마이그레이션 실패:", error);
        }
      }

      // 📊 통계 요약 적용
      if (recordData.stats) {
        userProgressData.conceptCounts = {
          vocabulary: recordData.stats.vocabulary || 0,
          grammar: recordData.stats.grammar || 0,
          examples: recordData.stats.examples || 0,
          total: recordData.stats.total || 0
        };
        
        userProgressData.studyStreak = recordData.stats.study_streak || 0;
        userProgressData.totalWords = recordData.stats.total || 0; // total을 totalWords로 사용
        userProgressData.masteredWords = recordData.stats.mastered_vocabulary || 0;
        userProgressData.quizAccuracy = recordData.stats.quiz_accuracy || 0;
        
        conceptCounts = { ...userProgressData.conceptCounts };
        
        console.log("📊 통계 요약 적용 완료:", userProgressData.conceptCounts);
      }

      // 📊 실제 활동 기록에서 단어 집계 및 개념 수 재계산
      if (userProgressData.conceptCounts.total === 0) {
        // recent_studied와 mastered_concepts에서 기본 개념 수 계산
        const baseConcepts = new Set();
        
        // 최근 학습한 개념들 추가
        if (recordData.recent_studied) {
          Object.keys(recordData.recent_studied).forEach(conceptId => {
            baseConcepts.add(conceptId);
          });
        }
        
        // 마스터한 개념들 추가
        if (recordData.mastered_concepts) {
          Object.keys(recordData.mastered_concepts).forEach(conceptId => {
            baseConcepts.add(conceptId);
          });
        }

        // 📊 활동 기록에서 사용된 모든 단어들 집계
        const allUsedConcepts = new Set([...baseConcepts]);
        const conceptsWithProgress = new Set(); // 점수/횟수 기록이 있는 개념들
        
        // 학습 활동에서 개념 추가
        if (recordData.learning_stats?.total_sessions > 0) {
          // 학습 세션이 있으면 해당 개념들 추가
          if (recordData.learning_stats.concepts_studied) {
            recordData.learning_stats.concepts_studied.forEach(conceptId => {
              allUsedConcepts.add(conceptId);
              conceptsWithProgress.add(conceptId);
            });
          }
        }
        
        // 퀴즈 활동에서 개념 추가
        if (recordData.quiz_stats?.total_quizzes > 0) {
          // 퀴즈가 있으면 해당 개념들 추가
          if (recordData.quiz_stats.concepts_tested) {
            recordData.quiz_stats.concepts_tested.forEach(conceptId => {
              allUsedConcepts.add(conceptId);
              conceptsWithProgress.add(conceptId);
            });
          }
        }
        
        // 게임 활동에서 개념 추가
        if (recordData.game_stats?.total_games > 0) {
          // 게임이 있으면 해당 개념들 추가  
          if (recordData.game_stats.concepts_played) {
            recordData.game_stats.concepts_played.forEach(conceptId => {
              allUsedConcepts.add(conceptId);
              conceptsWithProgress.add(conceptId);
            });
          }
        }

        // 타입별 개념 수 계산
        let vocabularyCount = 0, grammarCount = 0, examplesCount = 0;
        
        allUsedConcepts.forEach(conceptId => {
          const recentConcept = recordData.recent_studied?.[conceptId];
          const masteredConcept = recordData.mastered_concepts?.[conceptId];
          const concept = recentConcept || masteredConcept;
          
          if (concept) {
            const type = concept.type || concept.concept_snapshot?.type || 'vocabulary';
            if (type === 'vocabulary') vocabularyCount++;
            else if (type === 'grammar') grammarCount++;
            else if (type === 'examples') examplesCount++;
          } else {
            // 개념 정보가 없으면 기본적으로 vocabulary로 분류
            vocabularyCount++;
          }
        });
        
        userProgressData.conceptCounts = {
          vocabulary: vocabularyCount,
          grammar: grammarCount,
          examples: examplesCount,
          total: allUsedConcepts.size
        };
        
        userProgressData.totalWords = allUsedConcepts.size;
        conceptCounts = { ...userProgressData.conceptCounts };
        
        // 📈 마스터 진행 중인 단어 수 계산
        const masteredConceptsCount = recordData.mastered_concepts ? Object.keys(recordData.mastered_concepts).length : 0;
        userProgressData.progressWords = conceptsWithProgress.size - masteredConceptsCount;
        
        console.log("📊 활동 기록에서 단어 집계 완료:", {
          totalWords: userProgressData.totalWords,
          masteredWords: masteredConceptsCount,
          progressWords: userProgressData.progressWords,
          conceptCounts: userProgressData.conceptCounts
        });
      }

      // 🏆 마스터한 개념들 적용 (스냅샷 구조)
      if (recordData.mastered_concepts && Object.keys(recordData.mastered_concepts).length > 0) {
        userProgressData.masteredConcepts = Object.entries(recordData.mastered_concepts).map(([conceptId, concept]) => {
          // 스냅샷 구조에서 데이터 추출
          const conceptData = concept.concept_snapshot || concept;
          return {
            concept_id: conceptId,
            type: concept.type || conceptData.type || 'vocabulary',
            mastery_level: concept.mastery_level || 0,
            mastered_date: concept.mastered_date,
            concept_snapshot: conceptData
          };
        });
        
        // 실제 마스터한 개념 수 업데이트
        userProgressData.masteredWords = userProgressData.masteredConcepts.length;
        
        console.log("🏆 마스터한 개념 적용 완료:", userProgressData.masteredConcepts.length);
      } else {
        userProgressData.masteredConcepts = [];
        userProgressData.masteredWords = 0;
      }

      // 📈 최근 학습 개념들 적용 (스냅샷 구조)
      if (recordData.recent_studied) {
        userProgressData.recentStudied = Object.entries(recordData.recent_studied).map(([conceptId, concept]) => {
          // 스냅샷 구조에서 데이터 추출
          const conceptData = concept.concept_snapshot || concept;
          return {
            concept_id: conceptId,
            type: concept.type || conceptData.type || 'vocabulary',
            current_level: concept.current_level || 0,
            last_studied: concept.last_studied,
            concept_snapshot: conceptData
          };
        });
        
        console.log("📈 최근 학습 개념 적용 완료:", userProgressData.recentStudied.length);
      } else {
        userProgressData.recentStudied = [];
      }

      // 🎯 퀴즈 통계 적용
      if (recordData.quiz_stats) {
        userProgressData.achievements.totalQuizzes = recordData.quiz_stats.total_quizzes || 0;
        userProgressData.achievements.avgQuizAccuracy = recordData.quiz_stats.avg_accuracy || 0;
        userProgressData.quizAccuracy = recordData.quiz_stats.avg_accuracy || 0;
        userProgressData.achievements.bestQuizScore = recordData.quiz_stats.best_score || 0;
        userProgressData.achievements.totalQuizTime = recordData.quiz_stats.total_time || 0;
        
        console.log("🎯 퀴즈 통계 적용 완료");
      }

      // 🎮 게임 통계 적용
      if (recordData.game_stats) {
        userProgressData.achievements.totalGames = recordData.game_stats.total_games || 0;
        userProgressData.achievements.avgGameScore = recordData.game_stats.avg_score || 0;
        userProgressData.achievements.bestGameScore = recordData.game_stats.best_score || 0;
        userProgressData.achievements.totalStudyTime = recordData.game_stats.total_time || 0;
        
        console.log("🎮 게임 통계 적용 완료");
      }

      // 📚 학습 통계 적용
      if (recordData.learning_stats) {
        userProgressData.achievements.totalLearningSessions = recordData.learning_stats.total_sessions || 0;
        userProgressData.achievements.avgSessionQuality = recordData.learning_stats.avg_quality || 0;
        userProgressData.achievements.totalStudyTime = recordData.learning_stats.total_time || 0;
        
        console.log("📚 학습 통계 적용 완료");
      }

      console.log("✅ user_records 데이터 로드 완료:", {
        concepts: userProgressData.conceptCounts,
        mastered: userProgressData.masteredConcepts.length,
        recent: userProgressData.recentStudied.length
      });

    } else {
      console.log("⚠️ user_records 문서가 없습니다. 초기 문서를 생성합니다.");
      await createInitialUserRecord();
    }
    
  } catch (error) {
    console.error("❌ user_records 데이터 로드 중 오류:", error);
  }
}

// 🎮 게임 통계 로드
async function loadGameStats() {
  try {
    console.log("🎮 게임 통계 로드 시작");

    if (!currentUser) return;

    // 📊 실제 game_records에서 직접 통계 계산
    const gameRecordsRef = firebaseInit.collection(firebaseInit.db, "game_records");
    const gameQuery = firebaseInit.query(
      gameRecordsRef,
      firebaseInit.where("user_email", "==", currentUser.email)
    );

    const gameSnapshot = await firebaseInit.getDocs(gameQuery);
    const gameResults = [];

    gameSnapshot.forEach((doc) => {
      const data = doc.data();
      gameResults.push({
        id: doc.id,
        score: data.score || 0,
        timeSpent: data.time_spent || data.timeSpent || 0,
        playedAt: data.timestamp?.toDate() || data.completed_at?.toDate() || new Date(data.createdAt || Date.now())
      });
    });

    // 시간순 정렬 (최신순)
    gameResults.sort((a, b) => b.playedAt - a.playedAt);

    // 게임 통계 계산
    const gameStats = calculateGameStats(gameResults);

    // 사용자 진도 데이터에 추가
    userProgressData.achievements.totalGames = gameStats.totalGames;
    userProgressData.achievements.avgGameScore = gameStats.avgScore;
    userProgressData.achievements.bestGameScore = gameStats.bestScore;
    userProgressData.gameResults = gameResults.slice(0, 20);

    console.log("✅ 게임 통계 로드 완료:", gameStats);
  } catch (error) {
    console.error("❌ 게임 통계 로드 중 오류:", error);
  }
}

// 🎮 게임 통계 계산
function calculateGameStats(gameResults) {
  if (gameResults.length === 0) {
    return {
      totalGames: 0,
      avgScore: 0,
      bestScore: 0,
      totalTime: 0
    };
  }

  const totalGames = gameResults.length;
  const scores = gameResults.map(game => game.score || 0);
  const avgScore = scores.reduce((sum, score) => sum + score, 0) / totalGames;
  const bestScore = Math.max(...scores);
  const totalTime = gameResults.reduce((sum, game) => sum + (game.duration || 0), 0);

  return {
    totalGames,
    avgScore: Math.round(avgScore),
    bestScore,
    totalTime
  };
}

// 🎯 퀴즈 통계 로드
async function loadQuizStats() {
  try {
    console.log("🎯 퀴즈 통계 로드 시작");

    if (!currentUser) return;

    // 📊 실제 quiz_records에서 직접 통계 계산
    const quizRecordsRef = firebaseInit.collection(firebaseInit.db, "quiz_records");
    const quizQuery = firebaseInit.query(
      quizRecordsRef,
      firebaseInit.where("user_email", "==", currentUser.email)
    );

    const quizSnapshot = await firebaseInit.getDocs(quizQuery);
    
    let quizStats = {
      totalQuizzes: 0,
      avgAccuracy: 0,
      bestScore: 0,
      totalTime: 0,
      bestAccuracy: 0
    };

    if (quizSnapshot.size > 0) {
      const quizResults = [];
      
      quizSnapshot.forEach((doc) => {
        const data = doc.data();
        
        // 퀴즈 통계 계산 (다양한 필드명 지원)
        const correctAnswers = data.correct_answers || data.correctCount || 0;
        const totalQuestions = data.total_questions || data.totalCount || data.total_answers || 5;
        const calculatedAccuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
        const accuracy = data.accuracy || calculatedAccuracy;
        const score = data.score || 0;
        const timeSpent = data.time_spent || data.timeSpent || 0;
        
        quizResults.push({
          accuracy: accuracy,
          score: score,
          timeSpent: timeSpent
        });
      });
      
      // 통계 계산
      quizStats.totalQuizzes = quizResults.length;
      
      if (quizResults.length > 0) {
        const accuracies = quizResults.map(quiz => quiz.accuracy);
        const scores = quizResults.map(quiz => quiz.score);
        const times = quizResults.map(quiz => quiz.timeSpent);
        
        quizStats.avgAccuracy = accuracies.reduce((sum, acc) => sum + acc, 0) / accuracies.length;
        quizStats.bestScore = Math.max(...scores);
        quizStats.bestAccuracy = Math.max(...accuracies);
        quizStats.totalTime = times.reduce((sum, time) => sum + time, 0);
      }
    }

    // 사용자 진도 데이터에 업데이트
    userProgressData.achievements.totalQuizzes = quizStats.totalQuizzes;
    userProgressData.achievements.avgQuizAccuracy = quizStats.avgAccuracy;
    userProgressData.achievements.bestQuizScore = quizStats.bestScore;
    userProgressData.achievements.totalQuizTime = quizStats.totalTime;
    userProgressData.quizAccuracy = quizStats.avgAccuracy;

    console.log("✅ 퀴즈 통계 로드 완료:", quizStats);
  } catch (error) {
    console.error("❌ 퀴즈 통계 로드 중 오류:", error);
    
    // 오류 시 빈 데이터로 초기화
    userProgressData.achievements.totalQuizzes = 0;
    userProgressData.achievements.avgQuizAccuracy = 0;
    userProgressData.achievements.bestQuizScore = 0;
    userProgressData.achievements.totalQuizTime = 0;
    userProgressData.quizAccuracy = 0;
  }
}

// 🎯 퀴즈 통계 계산
function calculateQuizStats(quizResults) {
  if (quizResults.length === 0) {
    return {
      totalQuizzes: 0,
      avgAccuracy: 0,
      bestScore: 0,
      totalTime: 0
    };
  }

  const totalQuizzes = quizResults.length;
  const accuracies = quizResults.map(quiz => quiz.accuracy || 0);
  const scores = quizResults.map(quiz => quiz.score || 0);
  const avgAccuracy = accuracies.reduce((sum, accuracy) => sum + accuracy, 0) / totalQuizzes;
  const bestScore = Math.max(...scores);
  const totalTime = quizResults.reduce((sum, quiz) => sum + (quiz.timeSpent || 0), 0);

  return {
    totalQuizzes,
    avgAccuracy: Math.round(avgAccuracy),
    bestScore,
    totalTime
  };
}

// 📈 최근 활동 로드
async function loadRecentActivities() {
  try {
    console.log("📈 최근 활동 로드 시작");
    
    if (!currentUser) return [];

    const activities = [];
    const allConceptIds = new Set(); // 모든 활동에서 사용된 concept_ids 수집

    // 학습 기록 로드 (인덱스 오류 방지를 위해 단순 쿼리 사용)
    try {
      const learningRecordsRef = firebaseInit.collection(firebaseInit.db, "learning_records");
      const learningQuery = firebaseInit.query(
        learningRecordsRef,
        firebaseInit.where("user_email", "==", currentUser.email),
        firebaseInit.limit(20)
      );

      const learningSnapshot = await firebaseInit.getDocs(learningQuery);
      console.log(`📚 학습 기록 ${learningSnapshot.size}개 발견`);
      
      learningSnapshot.forEach((doc) => {
        const data = doc.data();
        console.log("📚 학습 기록 원본 데이터:", data);
        
        // 학습 기록이 세션 기반이므로 데이터를 다르게 처리
        const sessionType = data.type || data.activity_type || 'vocabulary';
        const conceptIds = data.concept_id || data.concept_ids || [];
        const conceptsStudied = data.concepts_studied || conceptIds.length || 1;
        
        // concept_id 수집
        conceptIds.forEach(id => allConceptIds.add(id));
        
        console.log("📚 학습 기록 상세:", {
          id: doc.id,
          session_type: sessionType,
          concepts_studied: conceptsStudied,
          concept_id: conceptIds,
          timestamp: data.timestamp || data.completed_at || data.createdAt,
          learning_mode: data.learning_mode
        });
        
        // 필드명 유연하게 처리 (세션 기반 데이터)
        const timestamp = data.timestamp || data.completed_at || data.createdAt;
        
        // 세션 기반 학습 활동으로 추가
        activities.push({
          id: doc.id,
          type: "learning",
          timestamp: timestamp,
          conceptId: `${conceptsStudied}개 개념 학습`, // 학습한 개념 수 표시
          conceptType: sessionType,
          concept_id: conceptIds, // 개념 마스터 분석용
          sessionData: {
            conceptsStudied: conceptsStudied,
            conceptIds: conceptIds,
            learningMode: data.learning_mode,
            sessionQuality: data.session_quality,
            sessionDuration: data.session_duration
          },
          sessionQuality: data.session_quality, // 점수 계산용
          result: data.result,
          details: data
        });
      });
    } catch (learningError) {
      console.warn("📚 학습 기록 로드 중 오류:", learningError.message);
    }

    // 게임 기록 로드
    try {
      const gameRecordsRef = firebaseInit.collection(firebaseInit.db, "game_records");
      const gameQuery = firebaseInit.query(
        gameRecordsRef,
        firebaseInit.where("user_email", "==", currentUser.email),
        firebaseInit.limit(20)
      );

      const gameSnapshot = await firebaseInit.getDocs(gameQuery);
      console.log(`🎮 게임 기록 ${gameSnapshot.size}개 발견`);
      
      gameSnapshot.forEach((doc) => {
        const data = doc.data();
        console.log("🎮 게임 기록 원본 데이터:", data);
        
        // 게임에서 사용된 concept_id 수집
        const conceptIds = data.concept_id || data.concept_ids || data.conceptIds || [];
        conceptIds.forEach(id => allConceptIds.add(id));
        
        console.log("🎮 게임 기록 상세:", {
          id: doc.id,
          score: data.score,
          game_type: data.game_type || data.gameType,
          concept_id: conceptIds,
          timestamp: data.timestamp || data.createdAt || data.completed_at
        });
        
        // 필드명 유연하게 처리
        const gameType = data.game_type || data.gameType;
        const timestamp = data.timestamp || data.createdAt || data.completed_at;
        
        activities.push({
          id: doc.id,
          type: "game",
          timestamp: timestamp,
          score: data.score,
          gameType: gameType,
          concept_id: conceptIds, // concept_id로 통일
          details: data
        });
      });
    } catch (gameError) {
      console.warn("🎮 게임 기록 로드 중 오류:", gameError.message);
    }

    // 퀴즈 기록 로드
    try {
      const quizRecordsRef = firebaseInit.collection(firebaseInit.db, "quiz_records");
      const quizQuery = firebaseInit.query(
        quizRecordsRef,
        firebaseInit.where("user_email", "==", currentUser.email),
        firebaseInit.limit(20)
      );

      const quizSnapshot = await firebaseInit.getDocs(quizQuery);
      console.log(`🎯 퀴즈 기록 ${quizSnapshot.size}개 발견`);
      
      quizSnapshot.forEach((doc) => {
        const data = doc.data();
        console.log("🎯 퀴즈 기록 원본 데이터:", data);
        
        // 퀴즈에서 사용된 concept_ids 수집 (answers 배열에서 추출)
        const conceptIds = new Set();
        if (data.answers && Array.isArray(data.answers)) {
          data.answers.forEach(answer => {
            // concept_id와 conceptId 모두 지원
            const conceptId = answer.concept_id || answer.conceptId;
            if (conceptId) {
              conceptIds.add(conceptId);
            }
          });
        }
        // Set을 배열로 변환
        const conceptIdsArray = Array.from(conceptIds);
        conceptIdsArray.forEach(id => allConceptIds.add(id));
        
        // 퀴즈 통계 계산 (다양한 필드명 지원)
        const correctAnswers = data.correct_answers || data.correctCount || 0;
        const totalQuestions = data.total_questions || data.totalCount || data.total_answers || 5; // 기본값 5
        const calculatedAccuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
        const accuracy = data.accuracy || calculatedAccuracy;
        
        console.log("🎯 퀴즈 기록 상세:", {
          id: doc.id,
          score: data.score,
          accuracy: Math.round(accuracy),
          correctCount: correctAnswers,
          totalCount: totalQuestions,
          concept_ids: conceptIdsArray,
          timestamp: data.timestamp || data.completed_at || data.createdAt
        });
        
        // 필드명 유연하게 처리
        const timestamp = data.timestamp || data.completed_at || data.createdAt;
        
        activities.push({
          id: doc.id,
          type: "quiz",
          timestamp: timestamp,
          score: data.score,
          accuracy: accuracy,
          correctCount: correctAnswers,
          totalCount: totalQuestions,
          concept_id: conceptIdsArray, // 개념 마스터 분석용
          details: data
        });
      });
    } catch (quizError) {
      console.warn("🎯 퀴즈 기록 로드 중 오류:", quizError.message);
    }

    // 시간순 정렬 (클라이언트 사이드에서)
    activities.sort((a, b) => {
      const timeA = a.timestamp?.toDate?.() || (a.timestamp instanceof Date ? a.timestamp : new Date(a.timestamp || 0));
      const timeB = b.timestamp?.toDate?.() || (b.timestamp instanceof Date ? b.timestamp : new Date(b.timestamp || 0));
      return timeB - timeA;
    });

    console.log("📊 정렬 후 활동 목록:", activities.map(a => ({
      type: a.type,
      timestamp: a.timestamp?.toDate?.() || a.timestamp,
      conceptId: a.conceptId,
      score: a.score,
      hasValidTimestamp: !!(a.timestamp)
    })));

    userProgressData.recentActivities = activities.slice(0, 20);
    
    // 📊 실제 활동에서 사용된 모든 단어 수 업데이트
    if (allConceptIds.size > 0) {
      console.log("📊 활동 기록에서 수집된 총 단어 수:", allConceptIds.size);
      console.log("📊 수집된 concept_ids:", Array.from(allConceptIds));
      
      // userProgressData의 총 단어 수 업데이트 (기존 값과 비교해서 더 큰 값 사용)
      const activityBasedWordCount = allConceptIds.size;
      if (activityBasedWordCount > (userProgressData.totalWords || 0)) {
        userProgressData.totalWords = activityBasedWordCount;
        userProgressData.conceptCounts.total = activityBasedWordCount;
        
        // 활동 기록에서 개념 타입 분류
        await updateConceptCountsByActivityTypes(allConceptIds, userProgressData.recentActivities);
        
        console.log("📊 활동 기록 기반으로 총 단어 수 업데이트:", {
          totalWords: userProgressData.totalWords,
          conceptCounts: userProgressData.conceptCounts
        });
      }
    }
    
    console.log("✅ 최근 활동 로드 완료:", userProgressData.recentActivities.length);
    console.log("📋 최종 저장된 활동들:", userProgressData.recentActivities.map(a => ({
      type: a.type,
      conceptId: a.conceptId,
      details_snapshot: a.details?.concept_snapshot
    })));
    
    // 📊 활동 기록 기반 마스터/진행 상태 분석
    await analyzeConceptMasteryFromActivities();
    
    return userProgressData.recentActivities;
  } catch (error) {
    console.error("❌ 최근 활동 로드 중 오류:", error);
    return [];
  }
}

// 📊 활동 타입별 개념 수 업데이트
async function updateConceptCountsByActivityTypes(allConceptIds, recentActivities) {
  try {
    let vocabularyCount = 0, grammarCount = 0, examplesCount = 0;
    const conceptTypeMap = new Map();

    // 활동에서 개념 타입 수집
    recentActivities.forEach(activity => {
      if (activity.conceptType && activity.concept_id) {
        activity.concept_id.forEach(conceptId => {
          let activityType = activity.conceptType;
          // 활동 타입을 개념 타입으로 매핑
          switch(activityType) {
            case 'vocabulary':
              conceptTypeMap.set(conceptId, 'vocabulary');
              break;
            case 'grammar':
              conceptTypeMap.set(conceptId, 'grammar');
              break;
            case 'reading':
            case 'example':
              conceptTypeMap.set(conceptId, 'examples');
              break;
            default:
              if (!conceptTypeMap.has(conceptId)) {
                conceptTypeMap.set(conceptId, 'vocabulary'); // 기본값
              }
          }
        });
      }
    });

    // Firebase에서 실제 개념 데이터 조회하여 타입 확인
    for (const conceptId of allConceptIds) {
      if (conceptTypeMap.has(conceptId)) {
        const type = conceptTypeMap.get(conceptId);
        if (type === 'vocabulary') vocabularyCount++;
        else if (type === 'grammar') grammarCount++;
        else if (type === 'examples') examplesCount++;
      } else {
        // 개념 스냅샷에서 타입 확인
        const snapshot = await fetchConceptSnapshot(conceptId);
        const type = snapshot.type || 'vocabulary';
        if (type === 'vocabulary') vocabularyCount++;
        else if (type === 'grammar') grammarCount++;
        else if (type === 'examples') examplesCount++;
      }
    }

    // conceptCounts 업데이트
    userProgressData.conceptCounts = {
      vocabulary: vocabularyCount,
      grammar: grammarCount,
      examples: examplesCount,
      total: allConceptIds.size
    };

    console.log("📊 개념 타입별 분류 완료:", userProgressData.conceptCounts);
  } catch (error) {
    console.error("❌ 개념 타입별 분류 중 오류:", error);
    // 오류 시 기본 분류
    userProgressData.conceptCounts = {
      vocabulary: allConceptIds.size,
      grammar: 0,
      examples: 0,
      total: allConceptIds.size
    };
  }
}

// 📊 개념 스냅샷 가져오기
async function fetchConceptSnapshot(conceptId) {
  try {
    // concept_id에서 실제 개념 데이터 조회
    const conceptRef = firebaseInit.doc(firebaseInit.db, "concepts", conceptId);
    const conceptDoc = await firebaseInit.getDoc(conceptRef);
    
    if (conceptDoc.exists()) {
      const conceptData = conceptDoc.data();
      
      // 개념 타입 결정
      let conceptType = 'vocabulary';
      if (conceptData.conceptInfo?.domain) {
        conceptType = conceptData.conceptInfo.domain;
      } else if (conceptData.grammar_rule) {
        conceptType = 'grammar';
      } else if (conceptData.example_korean || conceptData.example_english) {
        conceptType = 'examples';
      }
      
      // 표시할 텍스트 결정 (우선순위에 따라)
      let displayText = conceptId; // 기본값
      
      if (conceptData.expressions?.korean?.word) {
        displayText = conceptData.expressions.korean.word;
      } else if (conceptData.korean) {
        displayText = conceptData.korean;
      } else if (conceptData.title) {
        displayText = conceptData.title;
      } else if (conceptData.grammar_rule) {
        displayText = conceptData.grammar_rule;
      } else if (conceptData.example_korean) {
        displayText = conceptData.example_korean.substring(0, 50) + (conceptData.example_korean.length > 50 ? '...' : '');
      } else if (conceptData.passage?.korean) {
        displayText = conceptData.passage.korean.substring(0, 50) + (conceptData.passage.korean.length > 50 ? '...' : '');
      }
      
      return {
        korean: displayText,
        english: conceptData.expressions?.english?.word || conceptData.english || '',
        meaning: conceptData.expressions?.english?.meaning || conceptData.meaning || '',
        grammar_rule: conceptData.grammar_rule || '',
        example_korean: conceptData.example_korean || '',
        example_english: conceptData.example_english || '',
        title: conceptData.title || '',
        type: conceptType
      };
    } else {
      // 개념을 찾을 수 없을 때 concept_id 그대로 반환
      return {
        korean: conceptId,
        english: '',
        meaning: '',
        type: 'vocabulary'
      };
    }
  } catch (error) {
    console.warn(`❌ 개념 스냅샷 로드 실패 (${conceptId}):`, error);
    return {
      korean: conceptId,
      english: '',
      meaning: '',
      type: 'vocabulary'
    };
  }
}

// 📊 활동 기록 기반 개념 마스터 상태 분석
async function analyzeConceptMasteryFromActivities() {
  try {
    const conceptActivityMap = new Map();
    
    // 모든 활동에서 개념별 활동 횟수 및 성과 분석
    userProgressData.recentActivities.forEach(activity => {
      if (activity.type === 'learning' && activity.concept_id) {
        activity.concept_id.forEach(conceptId => {
          if (!conceptActivityMap.has(conceptId)) {
            conceptActivityMap.set(conceptId, {
              learningCount: 0,
              quizCount: 0,
              gameCount: 0,
              totalActivities: 0,
              avgScore: 0,
              scores: [],
              type: 'vocabulary' // 기본값
            });
          }
          
          const conceptData = conceptActivityMap.get(conceptId);
          conceptData.learningCount++;
          conceptData.totalActivities++;
          
          // 세션 품질이 있으면 점수로 사용
          if (activity.sessionQuality && activity.sessionQuality > 0) {
            conceptData.scores.push(activity.sessionQuality);
          }
        });
      } else if (activity.type === 'quiz' && activity.concept_id) {
        activity.concept_id.forEach(conceptId => {
          if (!conceptActivityMap.has(conceptId)) {
            conceptActivityMap.set(conceptId, {
              learningCount: 0,
              quizCount: 0,
              gameCount: 0,
              totalActivities: 0,
              avgScore: 0,
              scores: [],
              type: 'vocabulary'
            });
          }
          
          const conceptData = conceptActivityMap.get(conceptId);
          conceptData.quizCount++;
          conceptData.totalActivities++;
          
          if (activity.accuracy && activity.accuracy > 0) {
            conceptData.scores.push(activity.accuracy);
          }
        });
      } else if (activity.type === 'game' && activity.concept_id) {
        activity.concept_id.forEach(conceptId => {
          if (!conceptActivityMap.has(conceptId)) {
            conceptActivityMap.set(conceptId, {
              learningCount: 0,
              quizCount: 0,
              gameCount: 0,
              totalActivities: 0,
              avgScore: 0,
              scores: [],
              type: 'vocabulary'
            });
          }
          
          const conceptData = conceptActivityMap.get(conceptId);
          conceptData.gameCount++;
          conceptData.totalActivities++;
          
          // 게임 점수 직접 사용 (이미 0-100 범위)
          if (activity.score && activity.score > 0) {
            conceptData.scores.push(activity.score);
          }
        });
      }
    });
    
    // 개념별 평균 점수 계산
    conceptActivityMap.forEach((data, conceptId) => {
      if (data.scores.length > 0) {
        data.avgScore = data.scores.reduce((sum, score) => sum + score, 0) / data.scores.length;
      }
    });
    
    // 마스터 기준: 최소 2번 이상 활동, 평균 점수 70 이상
    const masteredConcepts = [];
    const progressConcepts = [];
    
    // 개념 스냅샷을 가져와서 실제 단어 표시
    for (const [conceptId, data] of conceptActivityMap) {
      if (data.totalActivities >= 2 && data.avgScore >= 70) {
        const conceptSnapshot = await fetchConceptSnapshot(conceptId);
        masteredConcepts.push({
          concept_id: conceptId,
          type: data.type,
          mastery_level: Math.round(data.avgScore),
          mastered_date: new Date(),
          concept_snapshot: conceptSnapshot,
          activityData: data
        });
      } else if (data.totalActivities >= 1) {
        const conceptSnapshot = await fetchConceptSnapshot(conceptId);
        progressConcepts.push({
          concept_id: conceptId,
          type: data.type,
          current_level: Math.round(data.avgScore || 0),
          last_studied: new Date(),
          concept_snapshot: conceptSnapshot,
          activityData: data
        });
      }
    }
    
    // userProgressData 업데이트 (기존 데이터와 병합)
    if (masteredConcepts.length > 0) {
      userProgressData.masteredConcepts = masteredConcepts;
      userProgressData.masteredWords = masteredConcepts.length;
    }
    
    if (progressConcepts.length > 0) {
      userProgressData.recentStudied = [...(userProgressData.recentStudied || []), ...progressConcepts];
      userProgressData.progressWords = progressConcepts.length;
    }
    
    console.log("📊 활동 기반 마스터 상태 분석 완료:", {
      totalConcepts: conceptActivityMap.size,
      masteredCount: masteredConcepts.length,
      progressCount: progressConcepts.length,
      conceptDetails: Array.from(conceptActivityMap.entries()).slice(0, 5)
    });
    
  } catch (error) {
    console.error("❌ 개념 마스터 상태 분석 중 오류:", error);
  }
}

// 📊 주간 활동 데이터 생성
function generateWeeklyActivity() {
  try {
    const weeklyData = [];
    const today = new Date();
    
    // recentActivities가 배열인지 확인
    const recentActivities = Array.isArray(userProgressData.recentActivities) 
      ? userProgressData.recentActivities 
      : [];
    
    // 지난 7일간의 데이터 생성
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      const dayActivities = recentActivities.filter(activity => {
        const activityDate = activity.timestamp?.toDate() || new Date(0);
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
    
    userProgressData.weeklyActivity = weeklyData;
    console.log("✅ 주간 활동 데이터 생성 완료:", weeklyData);
  } catch (error) {
    console.error("❌ 주간 활동 데이터 생성 중 오류:", error);
  }
}

// 📝 초기 사용자 진도 문서 생성
async function createInitialUserRecord() {
  try {
    const initialRecord = {
      user_email: currentUser.email,
      last_updated: firebaseInit.serverTimestamp(),
      
      stats: {
        vocabulary: 0,
        grammar: 0,
        examples: 0,
        total: 0,
        mastered_vocabulary: 0,
        study_streak: 0,
        quiz_accuracy: 0
      },
      
      mastered_concepts: {},
      recent_studied: [],
      
      game_stats: {
        total_games: 0,
        avg_score: 0,
        best_score: 0,
        total_time: 0
      },
      
      learning_stats: {
        total_sessions: 0,
        avg_quality: 0,
        total_time: 0
      },
      
      quiz_stats: {
        total_quizzes: 0,
        total_questions: 0,
        correct_answers: 0,
        avg_accuracy: 0,
        best_accuracy: 0,
        total_time: 0,
        avg_time_per_quiz: 0,
        best_score: 0,
        recent_scores: [],
        last_quiz_date: null
      }
    };
    
    await firebaseInit.setDoc(firebaseInit.doc(firebaseInit.db, "user_records", currentUser.email), initialRecord);
    console.log("✅ 초기 user_records 문서 생성 완료");
    
  } catch (error) {
    console.error("❌ 초기 user_records 문서 생성 중 오류:", error);
  }
}

// 🔄 모든 UI 업데이트
function updateAllUI() {
  try {
    console.log("🔄 모든 UI 업데이트 시작");
    
    updateStatsSummary();
    updateAchievements();
    displayRecentActivities();
    createCharts();
    updateGoalProgress();
    
    console.log("✅ 모든 UI 업데이트 완료");
  } catch (error) {
    console.error("❌ UI 업데이트 중 오류:", error);
  }
}

// 학습 완료 상태 확인 및 자동 업데이트
async function checkLearningCompletionUpdate() {
  try {
    const learningCompletionData = localStorage.getItem("learningCompletionUpdate");
    
    if (learningCompletionData) {
      const data = JSON.parse(learningCompletionData);
      
      if (data.userId === currentUser?.uid) {
        console.log("📚 학습 완료 데이터 감지됨:", data);
        
        setTimeout(async () => {
          try {
            console.log("🔄 학습 완료 후 진도 페이지 자동 업데이트 시작");
            await loadDetailedProgressData();
            console.log("✅ 학습 완료 후 진도 페이지 자동 업데이트 완료");
          } catch (error) {
            console.error("❌ 학습 완료 후 자동 업데이트 중 오류:", error);
          }
        }, 2000); // 2초로 늘림
        
        localStorage.removeItem("learningCompletionUpdate");
      }
    }
  } catch (error) {
    console.error("❌ 학습 완료 상태 확인 중 오류:", error);
  }
}

// 🎮 게임 완료 상태 확인 및 자동 업데이트
function checkGameCompletionUpdate() {
  try {
    const gameCompletionData = localStorage.getItem("gameCompletionUpdate");

    if (gameCompletionData) {
      const data = JSON.parse(gameCompletionData);

      if (data.userId === currentUser?.uid) {
        console.log("🎮 게임 완료 데이터 감지됨:", data);

        setTimeout(async () => {
          try {
            await loadGameStats();
            updateAchievements();
            console.log("✅ 게임 완료 후 진도 페이지 자동 업데이트 완료");
          } catch (error) {
            console.error("❌ 게임 완료 후 자동 업데이트 중 오류:", error);
          }
        }, 1000);

        localStorage.removeItem("gameCompletionUpdate");
      }
    }
  } catch (error) {
    console.error("❌ 게임 완료 상태 확인 중 오류:", error);
  }
}

// 📊 통계 요약 업데이트
function updateStatsSummary() {
  try {
    // 단어 수 표시 (HTML ID와 매칭)
    const totalWordsElement = document.getElementById('total-words-count');
    const masteredWordsElement = document.getElementById('mastered-words-count');
    const studyStreakElement = document.getElementById('study-streak-count');
    const quizAccuracyElement = document.getElementById('quiz-accuracy-rate');

    if (totalWordsElement) {
      totalWordsElement.textContent = userProgressData.totalWords || 0;
    }
    
    if (masteredWordsElement) {
      const masteredCount = userProgressData.masteredWords || 0;
      const progressCount = userProgressData.progressWords || 0;
      const totalWords = userProgressData.totalWords || 0;
      
      // 마스터한 단어 수와 진행 중인 단어 정보 표시
      if (progressCount > 0) {
        masteredWordsElement.textContent = `${masteredCount} (+${progressCount} 진행중)`;
        masteredWordsElement.title = `마스터한 단어: ${masteredCount}개, 마스터를 위해 진행 중인 단어: ${progressCount}개 (총 ${totalWords}개 중)`;
      } else {
        masteredWordsElement.textContent = masteredCount;
        masteredWordsElement.title = `마스터한 단어: ${masteredCount}개`;
      }
    }
    
    if (studyStreakElement) {
      studyStreakElement.textContent = `${userProgressData.studyStreak || 0}일`;
    }
    
    if (quizAccuracyElement) {
      const accuracy = Math.round(userProgressData.quizAccuracy || 0);
      quizAccuracyElement.textContent = `${accuracy}%`;
    }

    console.log("✅ 통계 요약 UI 업데이트 완료");
  } catch (error) {
    console.error("❌ 통계 요약 업데이트 중 오류:", error);
  }
}

// 🏆 성취도 업데이트
function updateAchievements() {
  try {
    // 게임 통계 (HTML ID와 매칭)
    const totalGamesElement = document.getElementById('total-games-count');
    const avgGameScoreElement = document.getElementById('avg-game-score');
    
    if (totalGamesElement) {
      totalGamesElement.textContent = `${userProgressData.achievements.totalGames || 0}회`;
    }
    
    if (avgGameScoreElement) {
      const avgScore = Math.round(userProgressData.achievements.avgGameScore || 0);
      avgGameScoreElement.textContent = `${avgScore}점`;
    }

    // 퀴즈 통계 (HTML ID와 매칭)
    const totalQuizzesElement = document.getElementById('total-quizzes-count');
    const avgQuizAccuracyElement = document.getElementById('avg-quiz-accuracy');
    
    if (totalQuizzesElement) {
      totalQuizzesElement.textContent = `${userProgressData.achievements.totalQuizzes || 0}회`;
    }
    
    if (avgQuizAccuracyElement) {
      const accuracy = Math.round(userProgressData.achievements.avgQuizAccuracy || 0);
      avgQuizAccuracyElement.textContent = `${accuracy}%`;
    }

    // 학습 통계 (HTML ID와 매칭)
    const totalSessionsElement = document.getElementById('total-learning-sessions');
    const avgSessionQualityElement = document.getElementById('avg-session-quality');
    
    if (totalSessionsElement) {
      totalSessionsElement.textContent = `${userProgressData.achievements.totalLearningSessions || 0}회`;
    }
    
    if (avgSessionQualityElement) {
      const quality = Math.round(userProgressData.achievements.avgSessionQuality || 0);
      avgSessionQualityElement.textContent = quality > 0 ? `${quality}%` : '-';
    }

    // 종합 성취도 (HTML ID와 매칭)
    const totalStudyTimeElement = document.getElementById('total-study-time');
    const completionRateElement = document.getElementById('completion-rate');
    
    if (totalStudyTimeElement) {
      const totalMinutes = Math.round(userProgressData.achievements.totalStudyTime || 0);
      totalStudyTimeElement.textContent = `${totalMinutes}분`;
    }
    
    if (completionRateElement) {
      const rate = calculateCompletionRate();
      completionRateElement.textContent = `${rate}%`;
    }

    console.log("✅ 성취도 UI 업데이트 완료");
  } catch (error) {
    console.error("❌ 성취도 업데이트 중 오류:", error);
  }
}

// 📊 완료율 계산
function calculateCompletionRate() {
  try {
    const totalWords = userProgressData.totalWords || 0;
    const masteredWords = userProgressData.masteredWords || 0;
    
    if (totalWords === 0) return 0;
    return Math.round((masteredWords / totalWords) * 100);
  } catch (error) {
    console.error("❌ 완료율 계산 중 오류:", error);
    return 0;
  }
}

// 📈 최근 활동 표시 (HTML ID와 매칭)
function displayRecentActivities() {
  try {
    console.log("📈 최근 활동 표시 시작");
    console.log("🔍 최근 활동 데이터:", userProgressData.recentActivities);
    
    const container = document.getElementById('recent-activities-list');
    if (!container) {
      console.error("❌ recent-activities-list 컨테이너를 찾을 수 없습니다");
      return;
    }

    console.log("✅ recent-activities-list 컨테이너 발견");

    if (userProgressData.recentActivities.length === 0) {
      console.log("⚠️ 최근 활동 데이터가 없습니다");
      container.innerHTML = `
        <div class="text-center py-8 text-gray-500">
          <i class="fas fa-clock text-3xl mb-2"></i>
          <p data-i18n="no_recent_activities">최근 학습 활동이 없습니다.</p>
        </div>
      `;
      return;
    }

    console.log(`📊 ${userProgressData.recentActivities.length}개의 최근 활동 처리 중`);

    let html = '';
    userProgressData.recentActivities.slice(0, 10).forEach((activity, index) => {
      console.log(`🔍 활동 ${index + 1}:`, activity);
      
      // 타임스탬프 처리 개선
      let date = new Date();
      if (activity.timestamp) {
        if (typeof activity.timestamp.toDate === 'function') {
          date = activity.timestamp.toDate();
        } else if (activity.timestamp instanceof Date) {
          date = activity.timestamp;
        } else if (typeof activity.timestamp === 'string' || typeof activity.timestamp === 'number') {
          date = new Date(activity.timestamp);
        }
      }
      
      const timeAgo = getTimeAgo(date);
      
      if (activity.type === 'learning') {
        console.log("📚 학습 활동 처리 중:", activity);
        
        // 세션 기반 학습 데이터 처리
        const sessionData = activity.sessionData || {};
        const conceptsCount = sessionData.conceptsStudied || 1;
        const learningMode = sessionData.learningMode || 'study';
        const sessionQuality = sessionData.sessionQuality || 0;
        
        // 표시할 텍스트 생성
        let displayText = `${conceptsCount}개 개념 학습`;
        if (learningMode) {
          const modeText = {
            'flashcard': '플래시카드',
            'reading': '읽기',
            'vocabulary': '단어',
            'grammar': '문법',
            'example': '예문'
          };
          displayText = `${modeText[learningMode] || learningMode} (${conceptsCount}개)`;
        }
        
        // 활동 타입 표시 - conceptType 기반으로 올바르게 매핑
        const typeText = {
          'vocabulary': '단어',
          'grammar': '문법', 
          'reading': '예문', // reading은 예문으로 처리
          'example': '예문'
        };
        const activityTypeText = typeText[activity.conceptType] || '단어';
        
        console.log("📝 표시될 텍스트:", displayText);
        console.log("📝 개념 타입:", activityTypeText);
        console.log("📝 세션 품질:", sessionQuality);
        
        html += `
          <div class="bg-white rounded-lg shadow-sm p-4 border border-gray-200 hover:shadow-md transition-shadow">
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <span class="text-blue-600 text-lg">📚</span>
                </div>
                <div>
                  <p class="font-medium text-gray-900">${displayText}</p>
                  <p class="text-sm text-gray-500">${activityTypeText} 학습${sessionQuality > 0 ? ` (품질: ${sessionQuality}%)` : ''}</p>
                </div>
              </div>
              <div class="text-right">
                <span class="text-sm text-gray-400">${timeAgo}</span>
                <p class="text-xs text-blue-600 mt-1">완료됨</p>
              </div>
            </div>
          </div>
        `;
      } else if (activity.type === 'game') {
        console.log("🎮 게임 활동 처리 중:", activity);
        html += `
          <div class="bg-white rounded-lg shadow-sm p-4 border border-gray-200 hover:shadow-md transition-shadow">
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <div class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                  <span class="text-green-600 text-lg">🎮</span>
                </div>
                <div>
                  <p class="font-medium text-gray-900">게임 완료</p>
                  <p class="text-sm text-gray-500">${activity.gameType || '단어 게임'}</p>
                </div>
              </div>
              <div class="text-right">
                <span class="text-sm text-gray-400">${timeAgo}</span>
                <p class="text-xs text-green-600 mt-1">${activity.score || 0}점</p>
              </div>
            </div>
          </div>
        `;
      } else if (activity.type === 'quiz') {
        console.log("🎯 퀴즈 활동 처리 중:", activity);
        const accuracy = Math.round(activity.accuracy || 0);
        const scoreText = activity.correctCount && activity.totalCount ? 
          `${activity.correctCount}/${activity.totalCount}` : 
          `${activity.score || 0}점`;
        
        html += `
          <div class="bg-white rounded-lg shadow-sm p-4 border border-gray-200 hover:shadow-md transition-shadow">
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <div class="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                  <span class="text-purple-600 text-lg">🎯</span>
                </div>
                <div>
                  <p class="font-medium text-gray-900">퀴즈 완료</p>
                  <p class="text-sm text-gray-500">정확도: ${accuracy}%</p>
                </div>
              </div>
              <div class="text-right">
                <span class="text-sm text-gray-400">${timeAgo}</span>
                <p class="text-xs text-purple-600 mt-1">${scoreText}</p>
              </div>
            </div>
          </div>
        `;
      } else {
        console.log("❓ 알 수 없는 활동 타입:", activity.type);
      }
    });

    console.log("📝 생성된 HTML 길이:", html.length);
    console.log("📝 생성된 HTML 미리보기:", html.substring(0, 200) + "...");

    if (html.trim() === '') {
      console.log("⚠️ 생성된 HTML이 비어있습니다");
      container.innerHTML = `
        <div class="text-center py-8 text-gray-500">
          <i class="fas fa-exclamation-triangle text-3xl mb-2"></i>
          <p>활동 데이터를 표시할 수 없습니다.</p>
        </div>
      `;
    } else {
      container.innerHTML = html;
      console.log("✅ HTML 컨테이너에 내용 설정 완료");
    }

    console.log("✅ 최근 활동 표시 완료");
  } catch (error) {
    console.error("❌ 최근 활동 표시 중 오류:", error);
  }
}

// ⏰ 시간 차이 계산
function getTimeAgo(date) {
  const now = new Date();
  const diffInMinutes = Math.floor((now - date) / (1000 * 60));
  
  if (diffInMinutes < 1) return '방금 전';
  if (diffInMinutes < 60) return `${diffInMinutes}분 전`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}시간 전`;
  return `${Math.floor(diffInMinutes / 1440)}일 전`;
}

// 📊 차트 생성
function createCharts() {
  try {
    createWeeklyActivityChart();
    createProgressChart();
    console.log("✅ 차트 생성 완료");
  } catch (error) {
    console.error("❌ 차트 생성 중 오류:", error);
  }
}

// 📊 주간 활동 차트 (HTML ID와 매칭)
function createWeeklyActivityChart() {
  try {
    const canvas = document.getElementById('weekly-activity-chart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    // 기존 차트 제거
    if (window.weeklyChart) {
      window.weeklyChart.destroy();
    }

    const labels = userProgressData.weeklyActivity.map(day => day.day);
    const learningData = userProgressData.weeklyActivity.map(day => day.learningCount);
    const gameData = userProgressData.weeklyActivity.map(day => day.gameCount);
    const quizData = userProgressData.weeklyActivity.map(day => day.quizCount || 0);

    window.weeklyChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: '학습',
            data: learningData,
            backgroundColor: 'rgba(59, 130, 246, 0.8)',
            borderColor: 'rgb(59, 130, 246)',
            borderWidth: 1
          },
          {
            label: '게임',
            data: gameData,
            backgroundColor: 'rgba(16, 185, 129, 0.8)',
            borderColor: 'rgb(16, 185, 129)',
            borderWidth: 1
          },
          {
            label: '퀴즈',
            data: quizData,
            backgroundColor: 'rgba(147, 51, 234, 0.8)',
            borderColor: 'rgb(147, 51, 234)',
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1
            }
          }
        },
        plugins: {
          legend: {
            position: 'top'
          },
          title: {
            display: true,
            text: '주간 학습 활동'
          }
        }
      }
    });
  } catch (error) {
    console.error("❌ 주간 활동 차트 생성 중 오류:", error);
  }
}

// 📊 카테고리별 진도 차트 (HTML ID와 매칭)
function createProgressChart() {
  try {
    const canvas = document.getElementById('category-progress-chart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    // 기존 차트 제거
    if (window.progressChart) {
      window.progressChart.destroy();
    }

    window.progressChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['단어', '문법', '예문'],
        datasets: [{
          data: [
            userProgressData.conceptCounts.vocabulary,
            userProgressData.conceptCounts.grammar,
            userProgressData.conceptCounts.examples
          ],
          backgroundColor: [
            'rgba(59, 130, 246, 0.8)',
            'rgba(16, 185, 129, 0.8)',
            'rgba(245, 158, 11, 0.8)'
          ],
          borderColor: [
            'rgb(59, 130, 246)',
            'rgb(16, 185, 129)',
            'rgb(245, 158, 11)'
          ],
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom'
          },
          title: {
            display: true,
            text: '카테고리별 진도'
          }
        }
      }
    });
  } catch (error) {
    console.error("❌ 진도 차트 생성 중 오류:", error);
  }
}

// 📈 총 단어 목록 표시 모달
function showTotalWordsList() {
  try {
    console.log("📈 총 단어 목록 모달 표시 시작");
    
    const modal = document.getElementById('totalWordsModal');
    const modalBody = document.getElementById('totalWordsModalBody');
    
    console.log("🔍 모달 요소 확인:", { modal: !!modal, modalBody: !!modalBody });
    
    if (!modal || !modalBody) {
      console.error("❌ 모달 요소를 찾을 수 없습니다", { modal: !!modal, modalBody: !!modalBody });
      return;
    }

    console.log("📊 데이터 로딩 상태 확인:", { isDataLoaded, userProgressData: !!userProgressData });

    // 데이터 로딩 중인지 확인
    if (!isDataLoaded) {
      console.log("⏳ 데이터 로딩 중 - 로딩 메시지 표시");
      modalBody.innerHTML = `
        <div class="text-center py-8">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p class="text-gray-600">데이터를 불러오는 중입니다...</p>
          <p class="text-sm text-gray-500 mt-2">잠시만 기다려주세요</p>
        </div>
      `;
      modal.style.display = 'flex';
      console.log("🔄 모달 표시됨 - 로딩 상태");
      
      // 데이터 로딩 완료를 기다렸다가 모달 내용 업데이트
      const checkDataLoaded = setInterval(() => {
        if (isDataLoaded) {
          clearInterval(checkDataLoaded);
          console.log("📊 데이터 로딩 완료 - 모달 내용 업데이트");
          updateTotalWordsModalContent(modalBody);
        }
      }, 100);
      
      return;
    }

    // 데이터가 이미 로딩된 경우 바로 내용 표시
    console.log("📊 데이터 준비됨 - 모달 내용 업데이트 및 표시");
    updateTotalWordsModalContent(modalBody);
    modal.style.display = 'flex';
    console.log("🔄 모달 표시됨 - 데이터 준비 완료");
    
  } catch (error) {
    console.error("❌ 총 단어 목록 모달 표시 중 오류:", error);
  }
}

// 📈 총 단어 목록 모달 내용 업데이트
function updateTotalWordsModalContent(modalBody) {
  try {

    // 모달 내용 생성
    let modalContent = `
      <div class="space-y-4">
        <div class="text-center">
          <h3 class="text-lg font-semibold text-gray-900">학습 진행 상황</h3>
          <p class="text-sm text-gray-600">전체: ${userProgressData.conceptCounts.total}개</p>
        </div>
        
        <div class="grid grid-cols-3 gap-4 text-center">
          <div class="bg-blue-50 p-3 rounded-lg">
            <div class="text-2xl font-bold text-blue-600">${userProgressData.conceptCounts.vocabulary}</div>
            <div class="text-sm text-gray-600">단어</div>
          </div>
          <div class="bg-green-50 p-3 rounded-lg">
            <div class="text-2xl font-bold text-green-600">${userProgressData.conceptCounts.grammar}</div>
            <div class="text-sm text-gray-600">문법</div>
          </div>
          <div class="bg-orange-50 p-3 rounded-lg">
            <div class="text-2xl font-bold text-orange-600">${userProgressData.conceptCounts.examples}</div>
            <div class="text-sm text-gray-600">예문</div>
          </div>
        </div>
      </div>
    `;

    // 최근 학습한 개념들 표시
    if (userProgressData.recentStudied.length > 0) {
      modalContent += `
        <div class="mt-6">
          <h4 class="font-semibold text-gray-900 mb-3">최근 활동한 개념 (${userProgressData.recentStudied.length}개)</h4>
          <p class="text-xs text-gray-500 mb-3">마스터 기준 미달로 계속 학습이 필요한 개념들</p>
          <div class="space-y-2 max-h-60 overflow-y-auto">
      `;
      
      userProgressData.recentStudied.slice(0, 15).forEach(concept => {
        const snapshot = concept.concept_snapshot || {};
        const activityData = concept.activityData || {};
        
        // 다양한 필드에서 표시 텍스트 추출 (우선순위에 따라)
        let displayText = snapshot.korean || snapshot.word || snapshot.title || snapshot.english || 
                         snapshot.grammar_rule || snapshot.example_korean || snapshot.example_english ||
                         concept.concept_id;
        let subText = snapshot.english || snapshot.meaning || '';
        
        // 제목이 있는 경우 적절히 자르기
        if (snapshot.title && displayText === snapshot.title && displayText.length > 40) {
          displayText = displayText.substring(0, 40) + '...';
        }
        
        // 개념 타입에 따른 아이콘과 색상
        const typeConfig = {
          'vocabulary': { color: 'blue', icon: '📚', label: '단어' },
          'grammar': { color: 'green', icon: '📝', label: '문법' },
          'examples': { color: 'orange', icon: '💬', label: '예문' }
        };
        
        const config = typeConfig[concept.type] || typeConfig['vocabulary'];
        const currentLevel = concept.current_level || activityData.avgScore || 0;
        const totalActivities = activityData.totalActivities || 0;
        const learningCount = activityData.learningCount || 0;
        const quizCount = activityData.quizCount || 0;
        const gameCount = activityData.gameCount || 0;
        
        // 진행률 계산 (70점이 마스터 기준)
        const progressPercent = Math.min(100, Math.round((currentLevel / 70) * 100));
        
        modalContent += `
          <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div class="flex items-center flex-1">
              <span class="mr-3 text-lg">${config.icon}</span>
              <div class="flex-1">
                <div class="flex items-center justify-between">
                  <div>
                    <span class="font-medium text-gray-900">${displayText}</span>
                    ${subText ? `<div class="text-sm text-gray-600">${subText}</div>` : ''}
                  </div>
                  <div class="text-right ml-4">
                    <div class="text-sm font-medium ${currentLevel >= 70 ? 'text-green-600' : 'text-orange-600'}">
                      ${Math.round(currentLevel)}점
                    </div>
                    <div class="text-xs text-gray-500">${totalActivities}회 활동</div>
                  </div>
                </div>
                
                ${totalActivities > 0 ? `
                  <div class="mt-2">
                    <div class="flex justify-between text-xs text-gray-500 mb-1">
                      <span>마스터 진행률</span>
                      <span>${progressPercent}%</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-2">
                      <div class="bg-${currentLevel >= 70 ? 'green' : 'blue'}-500 h-2 rounded-full transition-all" 
                           style="width: ${progressPercent}%"></div>
                    </div>
                    <div class="mt-1 text-xs text-gray-500">
                      📚 ${learningCount} | 🎯 ${quizCount} | 🎮 ${gameCount}
                    </div>
                  </div>
                ` : ''}
              </div>
            </div>
            
            <div class="ml-3">
              <span class="px-2 py-1 text-xs bg-${config.color}-100 text-${config.color}-800 rounded">
                ${config.label}
              </span>
            </div>
          </div>
        `;
      });
      
      if (userProgressData.recentStudied.length > 15) {
        modalContent += `
          <div class="text-center py-2 text-gray-500 text-sm">
            ... 외 ${userProgressData.recentStudied.length - 15}개 더
          </div>
        `;
      }
      
      modalContent += `
          </div>
        </div>
      `;
    }

    modalBody.innerHTML = modalContent;
    
    console.log("✅ 총 단어 목록 모달 내용 업데이트 완료");
  } catch (error) {
    console.error("총 단어 목록 모달 내용 업데이트 중 오류:", error);
  }
}

// 모달 닫기
function closeTotalWordsModal() {
  const modal = document.getElementById('totalWordsModal');
  if (modal) {
    modal.style.display = 'none';
  }
}

// 마스터한 단어 모달 닫기
function closeMasteredWordsModal() {
  const modal = document.getElementById('masteredWordsModal');
  if (modal) {
    modal.style.display = 'none';
  }
}

// 전역 함수로 등록
window.showTotalWordsList = showTotalWordsList;
window.closeTotalWordsModal = closeTotalWordsModal;
window.showMasteredWordsList = showMasteredWordsList;
window.closeMasteredWordsModal = closeMasteredWordsModal;
window.updateAchievements = updateAchievements;

// 📊 이벤트 리스너 설정
function setupEventListeners() {
  try {
    // 총 단어 카드 클릭 이벤트
    const totalWordsCard = document.getElementById('total-words-card');
    if (totalWordsCard) {
      totalWordsCard.addEventListener('click', showTotalWordsList);
    }

    // 마스터한 단어 카드 클릭 이벤트
    const masteredWordsCard = document.getElementById('mastered-words-card');
    if (masteredWordsCard) {
      masteredWordsCard.addEventListener('click', showMasteredWordsList);
    }

    // 연속 학습 카드 클릭 이벤트
    const studyStreakCard = document.getElementById('study-streak-card');
    if (studyStreakCard) {
      studyStreakCard.addEventListener('click', showStudyStreakDetails);
    }

    // 퀴즈 정확도 카드 클릭 이벤트
    const quizAccuracyCard = document.getElementById('quiz-accuracy-card');
    if (quizAccuracyCard) {
      quizAccuracyCard.addEventListener('click', showQuizAccuracyDetails);
    }

    // 게임 성취도 카드 클릭 이벤트
    const totalGamesCard = document.getElementById('total-games-card');
    if (totalGamesCard) {
      totalGamesCard.addEventListener('click', showGameAchievements);
    }

    // 목표 저장 버튼
    const saveGoalsBtn = document.getElementById('save-goals-btn');
    if (saveGoalsBtn) {
      saveGoalsBtn.addEventListener('click', saveGoals);
    }

    console.log("✅ 이벤트 리스너 설정 완료");
  } catch (error) {
    console.error("❌ 이벤트 리스너 설정 중 오류:", error);
  }
}

// 📊 마스터한 단어 목록 표시
function showMasteredWordsList() {
  try {
    console.log("📊 마스터한 단어 목록 표시");
    
    // 모달 생성 또는 가져오기
    let modal = document.getElementById('masteredWordsModal');
    if (!modal) {
      // 모달이 없으면 동적으로 생성
      modal = document.createElement('div');
      modal.id = 'masteredWordsModal';
      modal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 hidden';
      modal.style.display = 'none';
      
      modal.innerHTML = `
        <div class="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div class="flex justify-between items-center p-6 border-b">
            <h2 class="text-xl font-semibold text-gray-900">마스터한 단어 목록</h2>
            <button onclick="closeMasteredWordsModal()" class="text-gray-400 hover:text-gray-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          <div id="masteredWordsModalBody" class="p-6">
            <!-- 내용이 동적으로 채워집니다 -->
          </div>
        </div>
      `;
      
      document.body.appendChild(modal);
    }
    
    const modalBody = document.getElementById('masteredWordsModalBody');
    
    // 데이터 로딩 중인지 확인
    if (!isDataLoaded) {
      console.log("⏳ 데이터 로딩 중 - 마스터한 단어 로딩 메시지 표시");
      modalBody.innerHTML = `
        <div class="text-center py-8">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p class="text-gray-600">마스터한 단어 데이터를 불러오는 중입니다...</p>
          <p class="text-sm text-gray-500 mt-2">잠시만 기다려주세요</p>
        </div>
      `;
      modal.classList.remove('hidden');
      modal.style.display = 'flex';
      
      // 데이터 로딩 완료를 기다렸다가 모달 내용 업데이트
      const checkDataLoaded = setInterval(() => {
        if (isDataLoaded) {
          clearInterval(checkDataLoaded);
          console.log("📊 마스터한 단어 데이터 로딩 완료 - 모달 내용 업데이트");
          updateMasteredWordsModalContent(modalBody);
        }
      }, 100);
      
      return;
    }

    // 데이터가 이미 로딩된 경우 바로 내용 표시
    updateMasteredWordsModalContent(modalBody);
    modal.classList.remove('hidden');
    modal.style.display = 'flex';
    
  } catch (error) {
    console.error("❌ 마스터한 단어 목록 모달 표시 중 오류:", error);
  }
}

// 📊 마스터한 단어 목록 모달 내용 업데이트
function updateMasteredWordsModalContent(modalBody) {
  try {
    if (userProgressData.masteredConcepts.length === 0) {
      modalBody.innerHTML = `
        <div class="text-center py-8 text-gray-500">
          <i class="fas fa-trophy text-3xl mb-2"></i>
          <p>아직 마스터한 단어가 없습니다.</p>
          <p class="text-sm mt-2">단어를 2번 이상 학습하고 평균 점수 70점 이상이면 마스터됩니다.</p>
        </div>
      `;
    } else {
      let modalContent = `
        <div class="space-y-4">
          <div class="text-center mb-6">
            <h3 class="text-lg font-semibold text-gray-900">🏆 마스터한 단어</h3>
            <p class="text-sm text-gray-600">총 ${userProgressData.masteredConcepts.length}개</p>
            <div class="mt-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <p class="text-xs text-gray-700">
                <strong>마스터 조건:</strong> 2회 이상 활동 + 평균 70점 이상<br/>
                <strong>점수 계산:</strong> 학습(세션품질), 퀴즈(정확도), 게임(점수*)의 평균<br/>
                <span class="text-gray-500">*게임에서 점수와 정확도는 동일한 값 (0-100점)</span>
              </p>
            </div>
          </div>
          
          <div class="grid gap-4">
      `;
      
      // 마스터한 개념들을 타입별로 그룹화
      const groupedConcepts = {
        vocabulary: [],
        grammar: [],
        examples: []
      };
      
      userProgressData.masteredConcepts.forEach(concept => {
        const type = concept.type || 'vocabulary';
        if (groupedConcepts[type]) {
          groupedConcepts[type].push(concept);
        }
      });
      
      // 타입별로 표시
      Object.entries(groupedConcepts).forEach(([type, concepts]) => {
        if (concepts.length > 0) {
          const typeConfig = {
            vocabulary: { color: 'blue', icon: '📚', label: '단어' },
            grammar: { color: 'green', icon: '📝', label: '문법' },
            examples: { color: 'orange', icon: '💬', label: '예문' }
          };
          
          const config = typeConfig[type];
          
          modalContent += `
            <div class="mb-6">
              <h4 class="flex items-center text-lg font-semibold text-gray-800 mb-3">
                <span class="mr-2">${config.icon}</span>
                ${config.label} (${concepts.length}개)
              </h4>
              <div class="space-y-3">
          `;
          
          concepts.forEach(concept => {
            const snapshot = concept.concept_snapshot || {};
            const activityData = concept.activityData || {};
            
            // 표시 텍스트 결정
            let displayText = snapshot.korean || snapshot.word || snapshot.title || snapshot.english || 
                             snapshot.grammar_rule || snapshot.example_korean || concept.concept_id;
            let subText = snapshot.english || snapshot.meaning || '';
            
            // 길면 자르기
            if (displayText && displayText.length > 50) {
              displayText = displayText.substring(0, 50) + '...';
            }
            
            const masteryLevel = concept.mastery_level || 70;
            const totalActivities = activityData.totalActivities || 0;
            const masteredDate = concept.mastered_date ? new Date(concept.mastered_date).toLocaleDateString('ko-KR') : '';
            
            modalContent += `
              <div class="flex items-center justify-between p-4 bg-${config.color}-50 rounded-lg border border-${config.color}-200">
                <div class="flex items-center flex-1">
                  <span class="mr-3 text-xl">${config.icon}</span>
                  <div class="flex-1">
                    <div class="font-medium text-gray-900">${displayText}</div>
                    ${subText ? `<div class="text-sm text-gray-600">${subText}</div>` : ''}
                    ${masteredDate ? `<div class="text-xs text-gray-500 mt-1">마스터: ${masteredDate}</div>` : ''}
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-lg font-bold text-${config.color}-600">${Math.round(masteryLevel)}점</div>
                  <div class="text-xs text-gray-500">${totalActivities}회 활동</div>
                  <div class="text-xs text-green-600 font-medium">✓ 마스터</div>
                </div>
              </div>
            `;
          });
          
          modalContent += `
              </div>
            </div>
          `;
        }
      });
      
      modalContent += `
          </div>
        </div>
      `;
      
      modalBody.innerHTML = modalContent;
    }
    
    console.log("✅ 마스터한 단어 목록 모달 내용 업데이트 완료");
    
  } catch (error) {
    console.error("마스터한 단어 목록 모달 내용 업데이트 중 오류:", error);
  }
}

// 연속 학습 상세 정보 표시
function showStudyStreakDetails() {
  try {
    const streak = userProgressData.studyStreak || 0;
    let message = '연속 학습: ' + streak + '일\n\n';
    
    if (streak === 0) {
      message += "아직 연속 학습 기록이 없습니다.\n오늘부터 시작해보세요!";
    } else if (streak < 7) {
      message += "좋은 시작입니다!\n일주일 연속 학습을 목표로 해보세요.";
    } else if (streak < 30) {
      message += "훌륭합니다!\n한 달 연속 학습까지 조금 더 화이팅!";
    } else {
      message += "대단합니다!\n꾸준한 학습의 힘을 보여주고 있어요.";
    }

    alert(message);
  } catch (error) {
    console.error("연속 학습 상세 정보 표시 중 오류:", error);
  }
}

// 퀴즈 정확도 상세 정보 표시
function showQuizAccuracyDetails() {
  try {
    const accuracy = userProgressData.quizAccuracy || 0;
    const totalQuizzes = userProgressData.achievements.totalQuizzes || 0;
    
    let message = '퀴즈 정확도: ' + Math.round(accuracy) + '%\n';
    message += '총 퀴즈 횟수: ' + totalQuizzes + '회\n\n';
    
    if (accuracy >= 90) {
      message += "완벽합니다! 최고 수준의 정확도를 유지하고 있어요.";
    } else if (accuracy >= 80) {
      message += "훌륭합니다! 높은 정확도를 보여주고 있어요.";
    } else if (accuracy >= 70) {
      message += "좋습니다! 조금 더 집중하면 더 높은 점수를 받을 수 있어요.";
    } else if (accuracy >= 60) {
      message += "괜찮습니다! 복습을 통해 정확도를 높여보세요.";
    } else {
      message += "더 많은 학습이 필요합니다. 천천히 꾸준히 해보세요!";
    }

    alert(message);
  } catch (error) {
    console.error("퀴즈 정확도 상세 정보 표시 중 오류:", error);
  }
}

// 게임 성취도 상세 정보 표시
function showGameAchievements() {
  try {
    const totalGames = userProgressData.achievements.totalGames || 0;
    const avgScore = userProgressData.achievements.avgGameScore || 0;
    const bestScore = userProgressData.achievements.bestGameScore || 0;
    
    let message = '게임 성취도\n\n';
    message += '총 게임 횟수: ' + totalGames + '회\n';
    message += '평균 점수: ' + Math.round(avgScore) + '점\n';
    message += '최고 점수: ' + bestScore + '점\n\n';
    
    if (totalGames === 0) {
      message += "아직 게임을 플레이하지 않았습니다.\n게임을 통해 재미있게 학습해보세요!";
    } else if (avgScore >= 90) {
      message += "뛰어난 게임 실력을 보여주고 있어요!";
    } else if (avgScore >= 80) {
      message += "훌륭한 게임 실력입니다!";
    } else if (avgScore >= 70) {
      message += "좋은 성과입니다. 더 높은 점수에 도전해보세요!";
    } else {
      message += "게임을 더 많이 플레이하면서 실력을 늘려보세요!";
    }

    alert(message);
  } catch (error) {
    console.error("게임 성취도 상세 정보 표시 중 오류:", error);
  }
}

// 목표 저장
async function saveGoals() {
  try {
    const dailyWordsGoal = document.getElementById('daily-words-goal')?.value || 10;
    const dailyQuizGoal = document.getElementById('daily-quiz-goal')?.value || 20;
    const weeklyDaysGoal = document.getElementById('weekly-days-goal')?.value || 5;
    const weeklyMasteryGoal = document.getElementById('weekly-mastery-goal')?.value || 30;

    const goals = {
      daily: {
        words: parseInt(dailyWordsGoal),
        quizMinutes: parseInt(dailyQuizGoal)
      },
      weekly: {
        studyDays: parseInt(weeklyDaysGoal),
        masteryWords: parseInt(weeklyMasteryGoal)
      },
      lastUpdated: firebaseInit.serverTimestamp()
    };

    // Firestore에 저장
    if (currentUser) {
      const userGoalsRef = firebaseInit.doc(firebaseInit.db, "user_goals", currentUser.email);
      await firebaseInit.setDoc(userGoalsRef, goals, { merge: true });
      
      // 로컬 데이터 업데이트
      userProgressData.goals = goals;
      
      alert("목표가 성공적으로 저장되었습니다!");
      console.log("✅ 목표 저장 완료:", goals);
    }
  } catch (error) {
    console.error("❌ 목표 저장 중 오류:", error);
    alert("목표 저장에 실패했습니다.");
  }
}

// 📊 목표 진행률 업데이트
function updateGoalProgress() {
  try {
    // 일일 목표 진행률 업데이트
    updateDailyGoalProgress();
    updateWeeklyGoalProgress();
    
    console.log("✅ 목표 진행률 업데이트 완료");
  } catch (error) {
    console.error("❌ 목표 진행률 업데이트 중 오류:", error);
  }
}

// 📊 일일 목표 진행률 업데이트
function updateDailyGoalProgress() {
  try {
    const today = new Date().toDateString();
    const todayActivities = userProgressData.recentActivities.filter(activity => {
      const activityDate = activity.timestamp?.toDate();
      return activityDate && activityDate.toDateString() === today;
    });

    // 일일 단어 학습 진행률
    const dailyWordsProgress = document.getElementById('daily-words-progress');
    const dailyWordsBar = document.getElementById('daily-words-bar');
    const dailyWordsGoal = parseInt(document.getElementById('daily-words-goal')?.value || 10);
    
    const todayWords = todayActivities.filter(a => a.type === 'learning').length;
    const wordsProgress = Math.min(100, (todayWords / dailyWordsGoal) * 100);
    
    if (dailyWordsProgress) {
      dailyWordsProgress.textContent = `${todayWords}/${dailyWordsGoal}`;
    }
    if (dailyWordsBar) {
      dailyWordsBar.style.width = `${wordsProgress}%`;
    }

    // 일일 퀴즈 시간 진행률 (게임 + 퀴즈 시간으로 계산)
    const dailyQuizProgress = document.getElementById('daily-quiz-progress');
    const dailyQuizBar = document.getElementById('daily-quiz-bar');
    const dailyQuizGoal = parseInt(document.getElementById('daily-quiz-goal')?.value || 20);
    
    const todayGameTime = todayActivities.filter(a => a.type === 'game').length * 5; // 게임당 5분 가정
    const todayQuizTime = todayActivities.filter(a => a.type === 'quiz').length * 3; // 퀴즈당 3분 가정
    const totalQuizTime = todayGameTime + todayQuizTime;
    const quizProgress = Math.min(100, (totalQuizTime / dailyQuizGoal) * 100);
    
    if (dailyQuizProgress) {
      dailyQuizProgress.textContent = `${totalQuizTime}/${dailyQuizGoal}분`;
    }
    if (dailyQuizBar) {
      dailyQuizBar.style.width = `${quizProgress}%`;
    }
  } catch (error) {
    console.error("❌ 일일 목표 진행률 업데이트 중 오류:", error);
  }
}

// 📊 주간 목표 진행률 업데이트
function updateWeeklyGoalProgress() {
  try {
    const weeklyDaysProgress = document.getElementById('weekly-days-progress');
    const weeklyDaysBar = document.getElementById('weekly-days-bar');
    const weeklyDaysGoal = parseInt(document.getElementById('weekly-days-goal')?.value || 5);
    
    // 이번 주 학습 일수 계산
    const thisWeekDays = userProgressData.weeklyActivity.filter(day => day.totalActivities > 0).length;
    const daysProgress = Math.min(100, (thisWeekDays / weeklyDaysGoal) * 100);
    
    if (weeklyDaysProgress) {
      weeklyDaysProgress.textContent = `${thisWeekDays}/${weeklyDaysGoal}일`;
    }
    if (weeklyDaysBar) {
      weeklyDaysBar.style.width = `${daysProgress}%`;
    }

    // 주간 마스터 목표 진행률
    const weeklyMasteryProgress = document.getElementById('weekly-mastery-progress');
    const weeklyMasteryBar = document.getElementById('weekly-mastery-bar');
    const weeklyMasteryGoal = parseInt(document.getElementById('weekly-mastery-goal')?.value || 30);
    
    // 이번 주 마스터한 단어 수 (최근 7일 기준)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const thisWeekMastery = userProgressData.masteredConcepts.filter(concept => {
      try {
        if (!concept.mastered_date) return false;
        
        let masteredDate;
        if (typeof concept.mastered_date.toDate === 'function') {
          masteredDate = concept.mastered_date.toDate();
        } else if (concept.mastered_date instanceof Date) {
          masteredDate = concept.mastered_date;
        } else {
          masteredDate = new Date(concept.mastered_date);
        }
        
        return masteredDate && masteredDate >= oneWeekAgo;
      } catch (error) {
        console.warn("날짜 변환 오류:", concept.mastered_date, error);
        return false;
      }
    }).length;
    
    const masteryProgress = Math.min(100, (thisWeekMastery / weeklyMasteryGoal) * 100);
    
    if (weeklyMasteryProgress) {
      weeklyMasteryProgress.textContent = `${thisWeekMastery}/${weeklyMasteryGoal}개`;
    }
    if (weeklyMasteryBar) {
      weeklyMasteryBar.style.width = `${masteryProgress}%`;
    }
  } catch (error) {
    console.error("❌ 주간 목표 진행률 업데이트 중 오류:", error);
  }
}

// 📝 사용자 목표 로드
async function loadUserGoals() {
  try {
    if (!currentUser) return;

    const userGoalsRef = firebaseInit.doc(firebaseInit.db, "user_goals", currentUser.email);
    const goalsDoc = await firebaseInit.getDoc(userGoalsRef);

    if (goalsDoc.exists()) {
      const goalsData = goalsDoc.data();
      userProgressData.goals = goalsData;

      // 목표 입력 필드에 값 설정
      const dailyWordsGoal = document.getElementById('daily-words-goal');
      const dailyQuizGoal = document.getElementById('daily-quiz-goal');
      const weeklyDaysGoal = document.getElementById('weekly-days-goal');
      const weeklyMasteryGoal = document.getElementById('weekly-mastery-goal');

      if (dailyWordsGoal && goalsData.daily?.words) {
        dailyWordsGoal.value = goalsData.daily.words;
      }
      if (dailyQuizGoal && goalsData.daily?.quizMinutes) {
        dailyQuizGoal.value = goalsData.daily.quizMinutes;
      }
      if (weeklyDaysGoal && goalsData.weekly?.studyDays) {
        weeklyDaysGoal.value = goalsData.weekly.studyDays;
      }
      if (weeklyMasteryGoal && goalsData.weekly?.masteryWords) {
        weeklyMasteryGoal.value = goalsData.weekly.masteryWords;
      }

      console.log("✅ 사용자 목표 로드 완료:", goalsData);
    } else {
      console.log("⚠️ 사용자 목표 데이터가 없습니다. 기본값 사용");
    }
  } catch (error) {
    console.error("❌ 사용자 목표 로드 중 오류:", error);
  }
}

// 🎯 퀴즈 완료 상태 확인 및 자동 업데이트
async function checkQuizCompletionUpdate() {
  try {
    const quizCompletionData = localStorage.getItem("quizCompletionUpdate");

    if (quizCompletionData) {
      const data = JSON.parse(quizCompletionData);

      if (data.userId === currentUser?.uid) {
        console.log("🎯 퀴즈 완료 데이터 감지됨:", data);

        setTimeout(async () => {
          try {
            console.log("🔄 퀴즈 완료 후 진도 페이지 자동 업데이트 시작");
            await loadQuizStats();
            await loadRecentActivities();
            generateWeeklyActivity();
            updateAchievements();
            displayRecentActivities();
            createCharts();
            updateGoalProgress();
            console.log("✅ 퀴즈 완료 후 진도 페이지 자동 업데이트 완료");
          } catch (error) {
            console.error("❌ 퀴즈 완료 후 자동 업데이트 중 오류:", error);
          }
        }, 1000);

        localStorage.removeItem("quizCompletionUpdate");
      }
    }
  } catch (error) {
    console.error("퀴즈 완료 상태 확인 중 오류:", error);
  }
}
