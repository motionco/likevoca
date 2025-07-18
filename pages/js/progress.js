// 🔍 Progress Data Management System
// 진도 페이지에서 사용자의 학습 데이터를 로드하고 표시하는 시스템

// 전역 변수들
let currentUser = null;
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
    
    // 3. 최근 활동 로드
    await loadRecentActivities();
    
    // 4. 주간 활동 데이터 생성
    generateWeeklyActivity();
    
    // 5. UI 업데이트
    updateAllUI();
    
    // 6. 목표 데이터 로드
    await loadUserGoals();
    
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

      // 📊 실제 데이터에서 개념 수 재계산 (stats가 0일 경우 대안)
      if (userProgressData.conceptCounts.total === 0) {
        // recent_studied와 mastered_concepts에서 실제 개념 수 계산
        const allConcepts = new Set();
        
        // 최근 학습한 개념들 추가
        if (recordData.recent_studied) {
          Object.keys(recordData.recent_studied).forEach(conceptId => {
            allConcepts.add(conceptId);
          });
        }
        
        // 마스터한 개념들 추가
        if (recordData.mastered_concepts) {
          Object.keys(recordData.mastered_concepts).forEach(conceptId => {
            allConcepts.add(conceptId);
          });
        }
        
        // 타입별 개념 수 계산
        let vocabularyCount = 0, grammarCount = 0, examplesCount = 0;
        
        allConcepts.forEach(conceptId => {
          const recentConcept = recordData.recent_studied?.[conceptId];
          const masteredConcept = recordData.mastered_concepts?.[conceptId];
          const concept = recentConcept || masteredConcept;
          
          if (concept) {
            const type = concept.type || concept.concept_snapshot?.type || 'vocabulary';
            if (type === 'vocabulary') vocabularyCount++;
            else if (type === 'grammar') grammarCount++;
            else if (type === 'examples') examplesCount++;
          }
        });
        
        userProgressData.conceptCounts = {
          vocabulary: vocabularyCount,
          grammar: grammarCount,
          examples: examplesCount,
          total: allConcepts.size
        };
        
        userProgressData.totalWords = allConcepts.size;
        conceptCounts = { ...userProgressData.conceptCounts };
        
        console.log("📊 실제 데이터에서 개념 수 재계산 완료:", userProgressData.conceptCounts);
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

    // Firestore에서 게임 기록 로드
    const gameRecordsRef = firebaseInit.collection(firebaseInit.db, "game_records");
    const q = firebaseInit.query(
      gameRecordsRef,
      firebaseInit.where("user_email", "==", currentUser.email),
      firebaseInit.limit(50)
    );

    const querySnapshot = await firebaseInit.getDocs(q);
    const gameResults = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      gameResults.push({
        id: doc.id,
        ...data,
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

// 📈 최근 활동 로드
async function loadRecentActivities() {
  try {
    console.log("📈 최근 활동 로드 시작");
    
    if (!currentUser) return [];

    const activities = [];

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
        const conceptIds = data.concept_ids || [];
        const conceptsStudied = data.concepts_studied || conceptIds.length || 1;
        
        console.log("📚 학습 기록 상세:", {
          id: doc.id,
          session_type: sessionType,
          concepts_studied: conceptsStudied,
          concept_ids: conceptIds,
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
          sessionData: {
            conceptsStudied: conceptsStudied,
            conceptIds: conceptIds,
            learningMode: data.learning_mode,
            sessionQuality: data.session_quality,
            sessionDuration: data.session_duration
          },
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
        console.log("🎮 게임 기록 상세:", {
          id: doc.id,
          score: data.score,
          game_type: data.game_type || data.gameType,
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
          details: data
        });
      });
    } catch (gameError) {
      console.warn("🎮 게임 기록 로드 중 오류:", gameError.message);
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
    
    console.log("✅ 최근 활동 로드 완료:", userProgressData.recentActivities.length);
    console.log("📋 최종 저장된 활동들:", userProgressData.recentActivities.map(a => ({
      type: a.type,
      conceptId: a.conceptId,
      details_snapshot: a.details?.concept_snapshot
    })));
    
    return userProgressData.recentActivities;
  } catch (error) {
    console.error("❌ 최근 활동 로드 중 오류:", error);
    return [];
  }
}

// 📊 주간 활동 데이터 생성
function generateWeeklyActivity() {
  try {
    const weeklyData = [];
    const today = new Date();
    
    // 지난 7일간의 데이터 생성
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      const dayActivities = userProgressData.recentActivities.filter(activity => {
        const activityDate = activity.timestamp?.toDate() || new Date(0);
        return activityDate.toDateString() === date.toDateString();
      });
      
      weeklyData.push({
        date: date.toISOString().split('T')[0],
        day: date.toLocaleDateString('ko-KR', { weekday: 'short' }),
        learningCount: dayActivities.filter(a => a.type === 'learning').length,
        gameCount: dayActivities.filter(a => a.type === 'game').length,
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
      recent_studied: {},
      
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
        avg_accuracy: 0,
        total_time: 0
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
      masteredWordsElement.textContent = userProgressData.masteredWords || 0;
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
        
        // 활동 타입 표시
        const typeText = {
          'vocabulary': '단어',
          'grammar': '문법', 
          'reading': '읽기',
          'example': '예문'
        };
        const activityTypeText = typeText[activity.conceptType] || activity.conceptType || 'vocabulary';
        
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
    console.log("📈 총 단어 목록 모달 표시");
    
    const modal = document.getElementById('totalWordsModal');
    const modalBody = document.getElementById('totalWordsModalBody');
    
    if (!modal || !modalBody) {
      console.error("❌ 모달 요소를 찾을 수 없습니다");
      return;
    }

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
          <h4 class="font-semibold text-gray-900 mb-3">최근 학습한 개념</h4>
          <div class="space-y-2 max-h-60 overflow-y-auto">
      `;
      
      userProgressData.recentStudied.slice(0, 10).forEach(concept => {
        const snapshot = concept.concept_snapshot || {};
        
        // 다양한 필드에서 표시 텍스트 추출
        let displayText = snapshot.korean || snapshot.word || snapshot.english || 
                         snapshot.grammar_rule || snapshot.example_korean || snapshot.example_english ||
                         concept.concept_id;
        
        // 개념 타입에 따른 아이콘과 색상
        const typeConfig = {
          'vocabulary': { color: 'blue', icon: '📚', label: '단어' },
          'grammar': { color: 'green', icon: '📝', label: '문법' },
          'examples': { color: 'orange', icon: '💬', label: '예문' }
        };
        
        const config = typeConfig[concept.type] || typeConfig['vocabulary'];
        
        modalContent += `
          <div class="flex items-center justify-between p-2 bg-gray-50 rounded">
            <div class="flex items-center">
              <span class="mr-2">${config.icon}</span>
              <span class="font-medium">${displayText}</span>
            </div>
            <span class="px-2 py-1 text-xs bg-${config.color}-100 text-${config.color}-800 rounded">
              ${config.label}
            </span>
          </div>
        `;
      });
      
      modalContent += `
          </div>
        </div>
      `;
    }

    modalBody.innerHTML = modalContent;
    modal.style.display = 'flex';
    
    console.log("✅ 총 단어 목록 모달 표시 완료");
  } catch (error) {
    console.error("❌ 총 단어 목록 모달 표시 중 오류:", error);
  }
}

// 모달 닫기
function closeTotalWordsModal() {
  const modal = document.getElementById('totalWordsModal');
  if (modal) {
    modal.style.display = 'none';
  }
}

// 전역 함수로 등록
window.showTotalWordsList = showTotalWordsList;
window.closeTotalWordsModal = closeTotalWordsModal;
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
    
    if (userProgressData.masteredConcepts.length === 0) {
      alert("아직 마스터한 단어가 없습니다.");
      return;
    }

    let content = "🏆 마스터한 단어 목록:\n\n";
    userProgressData.masteredConcepts.slice(0, 20).forEach((concept, index) => {
      const snapshot = concept.concept_snapshot || {};
      const displayText = snapshot.korean || snapshot.word || concept.concept_id;
      content += `${index + 1}. ${displayText} (${concept.type})\n`;
    });

    if (userProgressData.masteredConcepts.length > 20) {
      content += `\n... 외 ${userProgressData.masteredConcepts.length - 20}개 더`;
    }

    alert(content);
  } catch (error) {
    console.error("❌ 마스터한 단어 목록 표시 중 오류:", error);
  }
}

// 📊 연속 학습 상세 정보 표시
function showStudyStreakDetails() {
  try {
    const streak = userProgressData.studyStreak || 0;
    let message = `🔥 연속 학습: ${streak}일\n\n`;
    
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
    console.error("❌ 연속 학습 상세 정보 표시 중 오류:", error);
  }
}

// 📊 퀴즈 정확도 상세 정보 표시
function showQuizAccuracyDetails() {
  try {
    const accuracy = userProgressData.quizAccuracy || 0;
    const totalQuizzes = userProgressData.achievements.totalQuizzes || 0;
    
    let message = `🎯 퀴즈 정확도: ${Math.round(accuracy)}%\n`;
    message += `총 퀴즈 횟수: ${totalQuizzes}회\n\n`;
    
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
    console.error("❌ 퀴즈 정확도 상세 정보 표시 중 오류:", error);
  }
}

// 🎮 게임 성취도 상세 정보 표시
function showGameAchievements() {
  try {
    const totalGames = userProgressData.achievements.totalGames || 0;
    const avgScore = userProgressData.achievements.avgGameScore || 0;
    const bestScore = userProgressData.achievements.bestGameScore || 0;
    
    let message = `🎮 게임 성취도\n\n`;
    message += `총 게임 횟수: ${totalGames}회\n`;
    message += `평균 점수: ${Math.round(avgScore)}점\n`;
    message += `최고 점수: ${bestScore}점\n\n`;
    
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
    console.error("❌ 게임 성취도 상세 정보 표시 중 오류:", error);
  }
}

// 📝 목표 저장
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

    // 일일 퀴즈 시간 진행률 (게임 시간으로 대체)
    const dailyQuizProgress = document.getElementById('daily-quiz-progress');
    const dailyQuizBar = document.getElementById('daily-quiz-bar');
    const dailyQuizGoal = parseInt(document.getElementById('daily-quiz-goal')?.value || 20);
    
    const todayQuizTime = todayActivities.filter(a => a.type === 'game').length * 5; // 게임당 5분 가정
    const quizProgress = Math.min(100, (todayQuizTime / dailyQuizGoal) * 100);
    
    if (dailyQuizProgress) {
      dailyQuizProgress.textContent = `${todayQuizTime}/${dailyQuizGoal}분`;
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
      const masteredDate = concept.mastered_date?.toDate();
      return masteredDate && masteredDate >= oneWeekAgo;
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

// 전역 함수로 등록
window.showTotalWordsList = showTotalWordsList;
window.closeTotalWordsModal = closeTotalWordsModal;
window.updateAchievements = updateAchievements;
window.showMasteredWordsList = showMasteredWordsList;
window.showStudyStreakDetails = showStudyStreakDetails;
window.showQuizAccuracyDetails = showQuizAccuracyDetails;
window.showGameAchievements = showGameAchievements;
window.saveGoals = saveGoals;
