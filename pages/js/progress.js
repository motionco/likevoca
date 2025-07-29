// Progress page JavaScript
console.log("Progress page initializing...");

// 전역 변수
let currentUser = null;
let selectedTargetLanguage =
  localStorage.getItem("selectedTargetLanguage") || "english"; // localStorage에서 읽어오기
let allGameRecords = [];
let allQuizRecords = [];
let allLearningRecords = [];

// Firebase 초기화 대기
async function waitForFirebase() {
  return new Promise((resolve) => {
    const checkFirebase = () => {
      if (window.firebaseInit) {
        console.log("✅ Firebase functions are ready");
        resolve();
      } else {
        setTimeout(checkFirebase, 100);
      }
    };
    checkFirebase();
  });
}

// 사용자 인증 확인
async function checkUserAuth() {
  try {
    const { auth, onAuthStateChanged } = window.firebaseInit;

    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          currentUser = user;
          console.log("User authenticated:", user.email);
          resolve(user);
        } else {
          console.log("No user authenticated");
          resolve(null);
        }
        unsubscribe();
      });
    });
  } catch (error) {
    console.error("인증 확인 실패:", error);
    return null;
  }
}

// 활동 기록 로드 (대상 언어별 필터링 추가)
async function loadActivityRecords() {
  const { collection, query, where, getDocs, db } = window.firebaseInit;

  try {
    // 게임 기록 로드 (대상 언어별 필터링)
    const gameQuery = query(
      collection(db, "game_records"),
      where("user_email", "==", currentUser.email)
    );
    const gameSnapshot = await getDocs(gameQuery);
    const allGameData = gameSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // 대상 언어별 필터링
    allGameRecords = allGameData.filter((record) => {
      const recordTargetLanguage =
        record.targetLanguage || record.language_pair?.target || "english";
      return recordTargetLanguage === selectedTargetLanguage;
    });

    // 퀴즈 기록 로드 (대상 언어별 필터링)
    const quizQuery = query(
      collection(db, "quiz_records"),
      where("user_email", "==", currentUser.email)
    );
    const quizSnapshot = await getDocs(quizQuery);
    const allQuizData = quizSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // 대상 언어별 필터링
    allQuizRecords = allQuizData.filter((record) => {
      const recordTargetLanguage =
        record.targetLanguage || record.language_pair?.target || "english";
      return recordTargetLanguage === selectedTargetLanguage;
    });

    // 학습 기록 로드 (대상 언어별 필터링)
    const learningQuery = query(
      collection(db, "learning_records"),
      where("user_email", "==", currentUser.email)
    );
    const learningSnapshot = await getDocs(learningQuery);
    const allLearningData = learningSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // 대상 언어별 필터링
    allLearningRecords = allLearningData.filter((record) => {
      const recordTargetLanguage =
        record.targetLanguage || record.language_pair?.target || "english";
      return recordTargetLanguage === selectedTargetLanguage;
    });

    console.log(
      `📊 활동 기록 로드 완료 (${selectedTargetLanguage}): 게임 ${allGameRecords.length}개, 퀴즈 ${allQuizRecords.length}개, 학습 ${allLearningRecords.length}개`
    );

    // 디버깅: 각 기록의 샘플 출력
    if (allGameRecords.length > 0) {
      console.log("🎮 게임 기록 샘플:", allGameRecords[0]);
    }
    if (allQuizRecords.length > 0) {
      console.log("🎯 퀴즈 기록 샘플:", allQuizRecords[0]);
      console.log("🎯 퀴즈 기록 전체 구조:", {
        type: allQuizRecords[0].type,
        activity_type: allQuizRecords[0].activity_type,
        concept_ids: allQuizRecords[0].concept_ids,
        answers: allQuizRecords[0].answers,
      });
    }
    if (allLearningRecords.length > 0) {
      console.log("📚 학습 기록 샘플:", allLearningRecords[0]);
      console.log("📚 학습 기록 전체 구조:", {
        type: allLearningRecords[0].type,
        activity_type: allLearningRecords[0].activity_type,
        concept_id: allLearningRecords[0].concept_id,
        concept_ids: allLearningRecords[0].concept_ids,
      });
    }
  } catch (error) {
    console.error("❌ 활동 기록 로드 실패:", error);
  }
}

// concept_snapshots 기반 총 단어수 목록 생성
async function generateDetailedConceptsListFromSnapshots() {
  try {
    console.log("📋 concept_snapshots 기반 총 단어수 목록 생성 시작");

    // 1. user_records에서 concept_snapshots 조회
    const { doc, getDoc, db } = window.firebaseInit;
    const userRecordRef = doc(db, "user_records", currentUser.email);
    const userDoc = await getDoc(userRecordRef);

    if (!userDoc.exists()) {
      console.log("❌ user_records 문서가 존재하지 않음");
      return [];
    }

    const userData = userDoc.data();
    const conceptSnapshots = userData.concept_snapshots || {};

    // 계층적 구조에서 전체 개념 수 계산
    const totalConcepts = Object.values(conceptSnapshots).reduce(
      (total, languageSnapshots) => {
        return total + Object.keys(languageSnapshots || {}).length;
      },
      0
    );

    console.log(
      `📊 concept_snapshots 계층적 구조에서 ${totalConcepts}개 개념 발견`
    );

    // 2. 계층적 구조에서 대상 언어 데이터 추출
    const languageSnapshots = conceptSnapshots[selectedTargetLanguage] || {};
    const targetLanguageConcepts = Object.entries(languageSnapshots).map(
      ([englishWord, snapshot]) => ({
        conceptId: `${selectedTargetLanguage}.${englishWord}`, // 새로운 식별자
        englishWord: englishWord, // 영어 단어 키
        snapshot: snapshot,
      })
    );

    console.log(
      `🎯 대상 언어(${selectedTargetLanguage}) 계층적 구조에서 추출: ${targetLanguageConcepts.length}개`
    );

    // 3. 각 개념의 마스터 진행률 계산
    const detailedConceptsList = [];

    for (const { conceptId, englishWord, snapshot } of targetLanguageConcepts) {
      // 원본 conceptId들과 단어 정보 추출
      let originalConceptIds = snapshot.original_concept_ids || [];
      let currentTargetWord = snapshot.word || englishWord;
      let currentTargetLanguage =
        snapshot.target_language || selectedTargetLanguage;

      // 원본 conceptId가 없는 경우 기본값 설정
      if (!originalConceptIds || originalConceptIds.length === 0) {
        originalConceptIds = [conceptId];
      }

      // 활동 기록에서 해당 개념과 관련된 기록 찾기
      const conceptRecords = [];

      // 게임 기록에서 찾기
      if (allGameRecords) {
        const gameRecords = allGameRecords.filter((record) => {
          const recordConceptIds = extractConceptIds(record);
          return originalConceptIds.some((id) => recordConceptIds.includes(id));
        });
        conceptRecords.push(...gameRecords);
      }

      // 퀴즈 기록에서 찾기
      if (allQuizRecords) {
        const quizRecords = allQuizRecords.filter((record) => {
          const recordConceptIds = extractConceptIds(record);
          return originalConceptIds.some((id) => recordConceptIds.includes(id));
        });
        conceptRecords.push(...quizRecords);
      }

      // 학습 기록에서 찾기
      if (allLearningRecords) {
        const learningRecords = allLearningRecords.filter((record) => {
          const recordConceptIds = extractConceptIds(record);
          return originalConceptIds.some((id) => recordConceptIds.includes(id));
        });
        conceptRecords.push(...learningRecords);
      }

      // 디버깅: 개념별 활동 기록 출력
      console.log(`🔍 개념 ${conceptId} 활동 기록:`, {
        originalConceptIds,
        conceptRecordsCount: conceptRecords.length,
        learningCount: conceptRecords.filter(
          (r) => r.type === "learning" || r.activity_type === "learning"
        ).length,
        gameCount: conceptRecords.filter(
          (r) => r.type === "game" || r.activity_type === "game"
        ).length,
        quizCount: conceptRecords.filter(
          (r) => r.type === "quiz" || r.activity_type === "quiz"
        ).length,
      });

      // 마스터리 계산
      const masteryResult = calculateConceptMastery(
        { id: conceptId, snapshot },
        conceptRecords
      );

      console.log(`📊 개념 ${conceptId} 마스터리 결과:`, masteryResult);

      // 상세 개념 정보 생성
      const detailedConcept = {
        conceptId: conceptId,
        snapshot: snapshot,
        averageAccuracy: masteryResult.masteryPercentage,
        isMastered: masteryResult.masteryPercentage >= 80,
        // masteryResult에서 직접 활동 횟수 가져오기
        learningCount: masteryResult.learningCount || 0,
        gameCount: masteryResult.gameCount || 0,
        quizCount: masteryResult.quizCount || 0,
        totalActivities: masteryResult.totalActivities || 0,
        // 퀴즈 관련 정보
        quizCorrect: masteryResult.correctCount || 0,
        quizTotal:
          (masteryResult.correctCount || 0) +
          (masteryResult.incorrectCount || 0),
        quizAccuracy: masteryResult.accuracyRate || 0,

        // 디버깅용 로그
        ...(masteryResult.quizCount > 0 &&
          console.log(`🔍 퀴즈 데이터: ${conceptId}`, {
            quizCount: masteryResult.quizCount,
            quizCorrect: masteryResult.correctCount || 0,
            quizIncorrect: masteryResult.incorrectCount || 0,
            quizTotal:
              (masteryResult.correctCount || 0) +
              (masteryResult.incorrectCount || 0),
            quizAccuracy: masteryResult.accuracyRate || 0,
          })),
        lastActivity:
          conceptRecords.length > 0
            ? Math.max(
                ...conceptRecords.map(
                  (r) =>
                    r.timestamp?.toDate?.() || r.created_at?.toDate?.() || 0
                )
              )
            : null,
        masteryDetails: masteryResult,
      };

      detailedConceptsList.push(detailedConcept);
    }

    console.log(
      "✅ concept_snapshots 기반 총 단어수 목록 생성 완료:",
      detailedConceptsList.length
    );
    return detailedConceptsList;
  } catch (error) {
    console.error("❌ concept_snapshots 기반 총 단어수 목록 생성 실패:", error);
    return [];
  }
}

// 개념 ID 추출 함수
function extractConceptIds(record) {
  const conceptIds = [];

  // concept_ids 배열 처리
  if (record.concept_ids) {
    if (Array.isArray(record.concept_ids)) {
      conceptIds.push(...record.concept_ids);
    } else {
      conceptIds.push(record.concept_ids);
    }
  }

  // concept_id 처리 (배열 또는 단일 값)
  if (record.concept_id) {
    if (Array.isArray(record.concept_id)) {
      conceptIds.push(...record.concept_id);
    } else {
      conceptIds.push(record.concept_id);
    }
  }

  // 중첩된 데이터에서 concept_ids 추출
  if (record.learningData?.concept_ids) {
    if (Array.isArray(record.learningData.concept_ids)) {
      conceptIds.push(...record.learningData.concept_ids);
    } else {
      conceptIds.push(record.learningData.concept_ids);
    }
  }

  if (record.gameData?.concept_ids) {
    if (Array.isArray(record.gameData.concept_ids)) {
      conceptIds.push(...record.gameData.concept_ids);
    } else {
      conceptIds.push(record.gameData.concept_ids);
    }
  }

  if (record.quizData?.concept_ids) {
    if (Array.isArray(record.quizData.concept_ids)) {
      conceptIds.push(...record.quizData.concept_ids);
    } else {
      conceptIds.push(record.quizData.concept_ids);
    }
  }

  // 디버깅: 추출된 concept_ids 출력
  if (conceptIds.length > 0) {
    console.log(`🔍 extractConceptIds 결과:`, {
      recordType: record.type || record.activity_type,
      extractedIds: conceptIds,
      originalRecord: {
        concept_id: record.concept_id,
        concept_ids: record.concept_ids,
      },
    });
  }

  return [...new Set(conceptIds)]; // 중복 제거
}

// 개념 마스터리 계산 함수
function calculateConceptMastery(concept, records) {
  // 대상 언어별로 필터링된 기록만 카운트
  const filteredRecords = records.filter((record) => {
    const recordTargetLanguage =
      record.targetLanguage || record.language_pair?.target || "english";
    const currentTargetLanguage = selectedTargetLanguage || "english";
    return recordTargetLanguage === currentTargetLanguage;
  });

  let totalActivities = filteredRecords.length;
  let correctCount = 0;
  let incorrectCount = 0;

  // 각 활동별 횟수 계산
  let learningCount = 0;
  let gameCount = 0;
  let quizCount = 0;

  filteredRecords.forEach((record) => {
    // 이미 필터링된 기록이므로 언어 체크 불필요
    const recordTargetLanguage =
      record.targetLanguage || record.language_pair?.target || "english";

    // 활동 타입별 카운트 - 다양한 필드에서 타입 확인
    let recordType = record.type || record.activity_type;

    console.log(
      `🔍 기록 처리 시작: ${record.id}, 타입: ${recordType}, 개념: ${concept.id}, 언어: ${recordTargetLanguage}`
    );

    // 학습 기록의 특별한 경우 처리
    if (
      recordType === "vocabulary" ||
      recordType === "grammar" ||
      recordType === "reading"
    ) {
      recordType = "learning";
    }

    // 컬렉션 이름으로 타입 추론
    if (!recordType) {
      if (record.id && typeof record.id === "string") {
        // Firebase 문서 ID 패턴으로 추론하기 어려우므로 다른 필드 확인
      }

      // 고유 필드를 사용한 명확한 활동 분류
      if (record.learning_mode !== undefined) {
        recordType = "learning";
      } else if (record.gameType !== undefined) {
        recordType = "game";
      } else if (record.quiz_type !== undefined || record.answers) {
        recordType = "quiz";
      }
      // 폴백 로직 (고유 필드가 없는 경우)
      else if (record.concept_id || record.session_duration !== undefined) {
        recordType = "learning";
      } else if (
        (record.score !== undefined && record.accuracy !== undefined) ||
        record.max_score !== undefined
      ) {
        recordType = "game";
      } else if (record.concept_ids && !record.learning_mode) {
        recordType = "quiz";
      }
    }

    console.log(`🔍 활동 기록 타입 분석:`, {
      recordId: record.id,
      originalType: record.type,
      activityType: record.activity_type,
      inferredType: recordType,
      hasAnswers: !!record.answers,
      hasConceptIds: !!record.concept_ids,
      hasConceptId: !!record.concept_id,
      hasLearningMode: !!record.learning_mode,
      hasScore: record.score !== undefined,
      hasAccuracy: record.accuracy !== undefined,
      hasMaxScore: record.max_score !== undefined,
      hasTimeSpent: record.time_spent !== undefined,
      gameFields: {
        score: record.score,
        accuracy: record.accuracy,
        max_score: record.max_score,
        time_spent: record.time_spent,
      },
      wasConverted:
        (record.type === "vocabulary" ||
          record.type === "grammar" ||
          record.type === "reading") &&
        recordType === "learning",
    });

    if (recordType === "learning") {
      learningCount++;
      console.log(
        `📚 학습 활동 카운트 증가: ${learningCount} (기록 ID: ${record.id})`
      );
    } else if (recordType === "game") {
      gameCount++;
      console.log(
        `🎮 게임 활동 카운트 증가: ${gameCount} (기록 ID: ${record.id}, 점수: ${record.score}, 정확도: ${record.accuracy}%)`
      );
    } else if (recordType === "quiz") {
      quizCount++;
      console.log(
        `🎯 퀴즈 활동 카운트 증가: ${quizCount} (기록 ID: ${record.id})`
      );
    } else {
      console.log(
        `❓ 알 수 없는 활동 타입: ${recordType} (기록 ID: ${record.id})`
      );
    }

    // 퀴즈 정답/오답 처리 - 개념별로 정확한 답안만 처리
    if (recordType === "quiz" && record.answers) {
      // 현재 개념의 원본 ID들 가져오기
      const originalConceptIds = concept.snapshot?.original_concept_ids || [
        concept.id,
      ];

      // 퀴즈 기록에서 현재 개념과 관련된 답안만 필터링
      const relevantAnswers = record.answers.filter((answer) =>
        originalConceptIds.includes(answer.concept_id)
      );

      console.log(`🔍 퀴즈 답안 필터링: 개념 ${concept.id}`, {
        원본IDs: originalConceptIds,
        전체답안수: record.answers.length,
        관련답안수: relevantAnswers.length,
        관련답안IDs: relevantAnswers.map((a) => a.concept_id),
        퀴즈기록ID: record.id,
      });

      // 관련 답안만 처리
      relevantAnswers.forEach((answer) => {
        if (answer.isCorrect === true) {
          correctCount++;
          console.log(
            `✅ 퀴즈 정답 처리: ${answer.concept_id} (개념: ${concept.id})`
          );
        } else if (answer.isCorrect === false) {
          incorrectCount++;
          console.log(
            `❌ 퀴즈 오답 처리: ${answer.concept_id} (개념: ${concept.id})`
          );
        }
      });
    }

    // 레거시 필드 처리 제거 - 퀴즈가 아닌 활동에서는 처리하지 않음
    // (퀴즈 정답/오답은 위의 answers 배열에서만 처리)

    console.log(
      `✅ 기록 처리 완료: ${record.id}, 현재 정답: ${correctCount}, 현재 오답: ${incorrectCount}`
    );
  });

  // 마스터 진행률 계산 (50% 기본 + 활동별 3% + 퀴즈 정답 10% - 퀴즈 오답 5%)
  let masteryPercentage = 50; // 기본 50%
  masteryPercentage += totalActivities * 3; // 각 활동당 3%
  masteryPercentage += correctCount * 10; // 퀴즈 정답당 10%
  masteryPercentage -= incorrectCount * 5; // 퀴즈 오답당 -5%
  masteryPercentage = Math.max(0, Math.min(masteryPercentage, 100)); // 0-100% 범위 제한

  console.log(`🧮 마스터리 계산 공식:`, {
    conceptId: concept.id,
    대상언어: selectedTargetLanguage,
    전체기록수: records.length,
    필터링된기록수: filteredRecords.length,
    기본점수: 50,
    활동가점: `${totalActivities} × 3 = ${totalActivities * 3}`,
    퀴즈정답가점: `${correctCount} × 10 = ${correctCount * 10}`,
    퀴즈오답감점: `${incorrectCount} × 5 = ${incorrectCount * 5}`,
    최종점수: masteryPercentage,
    활동별카운트: { learningCount, gameCount, quizCount },
    정답오답합계: correctCount + incorrectCount,
  });

  const totalAnswers = correctCount + incorrectCount;
  const accuracyRate =
    totalAnswers > 0 ? (correctCount / totalAnswers) * 100 : 0;

  // 퀴즈 정답/오답 합계 검증
  if (quizCount > 0 && totalAnswers !== quizCount) {
    console.warn(
      `⚠️ 퀴즈 답안 수 불일치: 개념 ${concept.id}, 퀴즈 횟수: ${quizCount}, 답안 합계: ${totalAnswers} (정답: ${correctCount}, 오답: ${incorrectCount})`
    );
  }

  console.log(`📊 마스터리 계산 상세:`, {
    conceptId: concept.id,
    totalActivities,
    learningCount,
    gameCount,
    quizCount,
    correctCount,
    incorrectCount,
    masteryPercentage,
    accuracyRate,
  });

  return {
    masteryPercentage,
    accuracyRate,
    correctCount,
    incorrectCount,
    totalActivities,
    learningCount,
    gameCount,
    quizCount,
  };
}

// 페이지 초기화
async function initializeProgressPage() {
  try {
    await waitForFirebase();
    const user = await checkUserAuth();

    if (!user) {
      console.log("사용자가 인증되지 않았습니다.");
      return;
    }

    // 초기 캐시 무효화 확인 (로그 없이 조용히 처리)

    await loadActivityRecords();

    // 언어 선택자 설정
    const languageSelector = document.getElementById("target-language-filter");
    if (languageSelector) {
      languageSelector.value = selectedTargetLanguage;
      languageSelector.addEventListener("change", async (e) => {
        selectedTargetLanguage = e.target.value;
        localStorage.setItem("selectedTargetLanguage", selectedTargetLanguage);
        console.log("🌐 Target language changed to:", selectedTargetLanguage);

        // 언어 변경 시 활동 기록 다시 로드
        await loadActivityRecords();

        // 언어별 학습 목표 다시 로드
        await loadUserGoals();

        updateUI();
      });
    }

    updateUI();

    // 학습 목표 저장 버튼 이벤트 리스너 추가
    setupGoalsSaveButton();

    // 저장된 학습 목표 로드
    await loadUserGoals();
  } catch (error) {
    console.error("Progress page initialization failed:", error);
  }
}

// UI 업데이트
async function updateUI() {
  try {
    // 캐시 무효화 확인
    const cacheKey = `cache_invalidated_${selectedTargetLanguage}`;
    const lastInvalidationTime = localStorage.getItem(cacheKey);
    const currentTime = Date.now();

    if (lastInvalidationTime) {
      // 캐시 무효화 시간이 최근 5초 이내인 경우에만 실제 새로운 활동으로 판단
      const timeDiff = currentTime - parseInt(lastInvalidationTime);
      const isRecentActivity = timeDiff < 5000; // 5초 이내

      if (isRecentActivity) {
        console.log(
          `🔄 [새로운 활동] 캐시 무효화 감지: ${selectedTargetLanguage} (${new Date(
            parseInt(lastInvalidationTime)
          ).toLocaleString()}, ${Math.round(timeDiff / 1000)}초 전)`
        );

        // 캐시가 무효화된 경우 활동 기록 다시 로드
        await loadActivityRecords();
        console.log(`✅ 새로운 활동으로 인한 데이터 재로드 완료`);
      } else {
        console.log(
          `⏰ 오래된 캐시 무효화 플래그 발견 (${Math.round(
            timeDiff / 1000
          )}초 전) - 무시됨`
        );
      }

      // 무효화 타임스탬프 제거 (한 번만 적용)
      localStorage.removeItem(cacheKey);
      if (isRecentActivity) {
        console.log(`🗑️ 캐시 무효화 플래그 제거: ${selectedTargetLanguage}`);
      }
    }

    const conceptsList = await generateDetailedConceptsListFromSnapshots();

    // 총 단어수 카드 업데이트
    const totalWordsCard = document.getElementById("total-words-card");
    const totalWordsCount = document.getElementById("total-words-count");
    if (totalWordsCard && totalWordsCount) {
      const totalWords = conceptsList.length;
      totalWordsCount.textContent = totalWords;

      // 기존 이벤트 리스너 제거 후 새로 추가
      const newTotalWordsCard = totalWordsCard.cloneNode(true);
      totalWordsCard.parentNode.replaceChild(newTotalWordsCard, totalWordsCard);

      newTotalWordsCard.addEventListener("click", async () => {
        console.log("📋 총 단어수 카드 클릭됨");
        await showTotalWordsModal(conceptsList);
      });
    }

    // 마스터한 단어수 카드 업데이트
    const masteredWordsCard = document.getElementById("mastered-words-card");
    const masteredWordsCount = document.getElementById("mastered-words-count");
    if (masteredWordsCard && masteredWordsCount) {
      const masteredWords = conceptsList.filter(
        (concept) => concept.isMastered
      ).length;
      masteredWordsCount.textContent = masteredWords;

      // 기존 이벤트 리스너 제거 후 새로 추가
      const newMasteredWordsCard = masteredWordsCard.cloneNode(true);
      masteredWordsCard.parentNode.replaceChild(
        newMasteredWordsCard,
        masteredWordsCard
      );

      newMasteredWordsCard.addEventListener("click", async () => {
        console.log("🎓 마스터한 단어수 카드 클릭됨");
        await showMasteredWordsModal(conceptsList);
      });
    }

    // 활동현황 요약 업데이트
    updateActivitySummary(conceptsList);

    // 성취도 업데이트
    updateAchievements(conceptsList);

    // 최근 활동 업데이트
    updateRecentActivities();

    // 학습 활동 분석 차트 업데이트
    updateLearningAnalysis();

    // 학습 목표 진행률 업데이트
    updateGoalsProgress(conceptsList);

    console.log(
      `📊 UI 업데이트 완료: 총 ${conceptsList.length}개 단어, 마스터 ${
        conceptsList.filter((c) => c.isMastered).length
      }개`
    );
  } catch (error) {
    console.error("UI 업데이트 실패:", error);
  }
}

// 활동현황 요약 업데이트
function updateActivitySummary(conceptsList) {
  try {
    // 연속학습 계산 (최근 활동 기반)
    const studyStreak = calculateStudyStreak();
    const studyStreakElement = document.getElementById("study-streak-count");
    if (studyStreakElement) {
      studyStreakElement.textContent = `${studyStreak}일`;
    }

    // 연속학습 카드에 클릭 이벤트 추가
    const studyStreakCard = document.getElementById("study-streak-card");
    if (studyStreakCard) {
      // 기존 이벤트 리스너 제거 후 새로 추가
      const newStudyStreakCard = studyStreakCard.cloneNode(true);
      studyStreakCard.parentNode.replaceChild(
        newStudyStreakCard,
        studyStreakCard
      );

      newStudyStreakCard.addEventListener("click", () => {
        showStudyStreakModal(studyStreak);
      });
    }

    // 퀴즈 정확도 계산
    const quizAccuracy = calculateOverallQuizAccuracy(conceptsList);
    const quizAccuracyElement = document.getElementById("quiz-accuracy-rate");
    if (quizAccuracyElement) {
      quizAccuracyElement.textContent = `${Math.round(quizAccuracy)}%`;
    }

    // 퀴즈 정확도 카드에 클릭 이벤트 추가
    const quizAccuracyCard = document.getElementById("quiz-accuracy-card");
    if (quizAccuracyCard) {
      // 기존 이벤트 리스너 제거 후 새로 추가
      const newQuizAccuracyCard = quizAccuracyCard.cloneNode(true);
      quizAccuracyCard.parentNode.replaceChild(
        newQuizAccuracyCard,
        quizAccuracyCard
      );

      newQuizAccuracyCard.addEventListener("click", () => {
        showQuizAccuracyDetails();
      });
    }

    console.log(
      `📊 활동현황 요약 업데이트: 연속학습 ${studyStreak}일, 퀴즈 정확도 ${Math.round(
        quizAccuracy
      )}%`
    );
  } catch (error) {
    console.error("활동현황 요약 업데이트 실패:", error);
  }
}

// 성취도 업데이트
function updateAchievements(conceptsList) {
  try {
    // 퀴즈 성취도
    const totalQuizzes = allQuizRecords.length;
    const avgQuizAccuracy = calculateOverallQuizAccuracy(conceptsList);

    const totalQuizzesElement = document.getElementById("total-quizzes-count");
    const avgQuizAccuracyElement = document.getElementById("avg-quiz-accuracy");

    if (totalQuizzesElement)
      totalQuizzesElement.textContent = `${totalQuizzes}회`;
    if (avgQuizAccuracyElement)
      avgQuizAccuracyElement.textContent = `${Math.round(avgQuizAccuracy)}%`;

    // 게임 성취도
    const totalGames = allGameRecords.length;
    const avgGameScore =
      allGameRecords.length > 0
        ? Math.round(
            allGameRecords.reduce((sum, game) => sum + (game.score || 0), 0) /
              allGameRecords.length
          )
        : 0;

    const totalGamesElement = document.getElementById("total-games-count");
    const avgGameScoreElement = document.getElementById("avg-game-score");

    if (totalGamesElement) totalGamesElement.textContent = `${totalGames}회`;
    if (avgGameScoreElement)
      avgGameScoreElement.textContent = `${avgGameScore}점`;

    // 학습 세션 성취도
    const totalSessions = allLearningRecords.length;
    const totalSessionsElement = document.getElementById(
      "total-learning-sessions"
    );
    if (totalSessionsElement)
      totalSessionsElement.textContent = `${totalSessions}회`;

    // 종합 성취도
    const totalStudyTime = calculateTotalStudyTime();
    const completionRate = calculateCompletionRate(conceptsList);

    const totalStudyTimeElement = document.getElementById("total-study-time");
    const completionRateElement = document.getElementById("completion-rate");

    if (totalStudyTimeElement)
      totalStudyTimeElement.textContent = `${Math.round(totalStudyTime)}분`;
    if (completionRateElement)
      completionRateElement.textContent = `${Math.round(completionRate)}%`;

    console.log(
      `📊 성취도 업데이트: 퀴즈 ${totalQuizzes}회, 게임 ${totalGames}회, 학습 ${totalSessions}회`
    );
  } catch (error) {
    console.error("성취도 업데이트 실패:", error);
  }
}

// 최근 활동 업데이트
function updateRecentActivities() {
  try {
    const recentActivitiesList = document.getElementById(
      "recent-activities-list"
    );
    if (!recentActivitiesList) return;

    // 모든 활동을 시간순으로 정렬
    const allActivities = [];

    // 학습 활동
    allLearningRecords.forEach((record) => {
      allActivities.push({
        type: "learning",
        timestamp: record.timestamp || record.created_at || record.completed_at,
        data: record,
      });
    });

    // 퀴즈 활동
    allQuizRecords.forEach((record) => {
      allActivities.push({
        type: "quiz",
        timestamp: record.timestamp || record.created_at,
        data: record,
      });
    });

    // 게임 활동
    allGameRecords.forEach((record) => {
      allActivities.push({
        type: "game",
        timestamp: record.timestamp || record.created_at || record.completed_at,
        data: record,
      });
    });

    // 시간순 정렬 (최신순)
    allActivities.sort((a, b) => {
      const timeA =
        a.timestamp?.toDate?.() || new Date(a.timestamp) || new Date(0);
      const timeB =
        b.timestamp?.toDate?.() || new Date(b.timestamp) || new Date(0);
      return timeB - timeA;
    });

    // 최근 5개 활동만 표시
    const recentActivities = allActivities.slice(0, 5);

    if (recentActivities.length === 0) {
      recentActivitiesList.innerHTML = `
        <div class="text-center py-8 text-gray-500">
          <i class="fas fa-clock text-3xl mb-2"></i>
          <p data-i18n="no_recent_activities">최근 활동이 없습니다.</p>
        </div>
      `;
      return;
    }

    let activitiesHTML = "";
    recentActivities.forEach((activity) => {
      const timestamp =
        activity.timestamp?.toDate?.() || new Date(activity.timestamp);
      const timeStr = timestamp.toLocaleString("ko-KR");

      let activityHTML = "";
      const data = activity.data;

      switch (activity.type) {
        case "learning":
          activityHTML = `
            <div class="flex items-center p-4 bg-white rounded-lg border border-blue-100">
              <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                <span class="text-blue-600">📚</span>
              </div>
              <div class="flex-1">
                <p class="font-medium text-gray-800">학습 활동</p>
                <p class="text-sm text-gray-600">${
                  data.learning_mode || "vocabulary"
                } 모드</p>
                <p class="text-xs text-gray-500">${timeStr}</p>
              </div>
            </div>
          `;
          break;
        case "quiz":
          const accuracy = data.accuracy || 0;
          activityHTML = `
            <div class="flex items-center p-4 bg-white rounded-lg border border-purple-100">
              <div class="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                <span class="text-purple-600">🎯</span>
              </div>
              <div class="flex-1">
                <p class="font-medium text-gray-800">퀴즈 활동</p>
                <p class="text-sm text-gray-600">정확도: ${Math.round(
                  accuracy
                )}%</p>
                <p class="text-xs text-gray-500">${timeStr}</p>
              </div>
            </div>
          `;
          break;
        case "game":
          const score = data.score || 0;
          activityHTML = `
            <div class="flex items-center p-4 bg-white rounded-lg border border-green-100">
              <div class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-4">
                <span class="text-green-600">🎮</span>
              </div>
              <div class="flex-1">
                <p class="font-medium text-gray-800">게임 활동</p>
                <p class="text-sm text-gray-600">점수: ${score}점</p>
                <p class="text-xs text-gray-500">${timeStr}</p>
              </div>
            </div>
          `;
          break;
      }

      activitiesHTML += activityHTML;
    });

    recentActivitiesList.innerHTML = activitiesHTML;
    console.log(`📊 최근 활동 업데이트: ${recentActivities.length}개 활동`);
  } catch (error) {
    console.error("최근 활동 업데이트 실패:", error);
  }
}

// 연속학습 계산 (대상 언어별 필터링 적용)
function calculateStudyStreak() {
  try {
    // 모든 활동 유형 포함 (학습, 퀴즈, 게임)
    const allActivities = [
      ...allLearningRecords,
      ...allQuizRecords,
      ...allGameRecords,
    ];

    if (!allActivities || allActivities.length === 0) return 0;

    // 활동 기록을 날짜별로 그룹화 (대상 언어별 필터링 이미 적용됨)
    const activityDates = new Set();

    allActivities.forEach((record) => {
      const timestamp =
        record.timestamp?.toDate?.() ||
        new Date(record.timestamp) ||
        record.completed_at?.toDate?.() ||
        new Date(record.completed_at);
      const dateStr = timestamp.toISOString().split("T")[0]; // YYYY-MM-DD 형식
      activityDates.add(dateStr);
    });

    // 날짜를 정렬하여 연속된 날짜 계산
    const sortedDates = Array.from(activityDates).sort().reverse();
    let streak = 0;
    let currentDate = new Date();

    for (let i = 0; i < sortedDates.length; i++) {
      const checkDate = new Date(sortedDates[i]);
      const expectedDate = new Date(currentDate);
      expectedDate.setDate(expectedDate.getDate() - i);

      if (
        checkDate.toISOString().split("T")[0] ===
        expectedDate.toISOString().split("T")[0]
      ) {
        streak++;
      } else {
        break;
      }
    }

    console.log(
      `🔥 연속학습 계산 (${selectedTargetLanguage}): ${streak}일, 활동 날짜: ${sortedDates.length}일`
    );
    return streak;
  } catch (error) {
    console.error("연속학습 계산 실패:", error);
    return 0;
  }
}

// 전체 퀴즈 정확도 계산
function calculateOverallQuizAccuracy(conceptsList) {
  try {
    if (!conceptsList || conceptsList.length === 0) return 0;

    const conceptsWithQuiz = conceptsList.filter(
      (concept) => concept.quizTotal > 0
    );
    if (conceptsWithQuiz.length === 0) return 0;

    const totalCorrect = conceptsWithQuiz.reduce(
      (sum, concept) => sum + concept.quizCorrect,
      0
    );
    const totalQuestions = conceptsWithQuiz.reduce(
      (sum, concept) => sum + concept.quizTotal,
      0
    );

    return totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0;
  } catch (error) {
    console.error("퀴즈 정확도 계산 실패:", error);
    return 0;
  }
}

// 총 학습 시간 계산
function calculateTotalStudyTime() {
  try {
    let totalTime = 0;

    // 학습 시간
    allLearningRecords.forEach((record) => {
      totalTime += record.session_duration || 0;
    });

    // 퀴즈 시간
    allQuizRecords.forEach((record) => {
      totalTime += (record.time_spent || 0) / 60; // 초를 분으로 변환
    });

    // 게임 시간
    allGameRecords.forEach((record) => {
      totalTime += (record.timeSpent || 0) / 60; // 초를 분으로 변환
    });

    return totalTime;
  } catch (error) {
    console.error("총 학습 시간 계산 실패:", error);
    return 0;
  }
}

// 완료율 계산
function calculateCompletionRate(conceptsList) {
  try {
    if (!conceptsList || conceptsList.length === 0) return 0;

    const masteredCount = conceptsList.filter(
      (concept) => concept.isMastered
    ).length;
    return (masteredCount / conceptsList.length) * 100;
  } catch (error) {
    console.error("완료율 계산 실패:", error);
    return 0;
  }
}

// 퀴즈 정확도 상세 보기 함수
async function showQuizAccuracyDetails() {
  try {
    console.log("🎯 퀴즈 정확도 상세 보기 클릭됨");

    // 현재 conceptsList 가져오기
    const conceptsList = await generateDetailedConceptsListFromSnapshots();

    const totalQuizzes = allQuizRecords.length;
    const avgAccuracy = Math.round(calculateOverallQuizAccuracy(conceptsList));

    // 퀴즈별 상세 정보 계산
    const quizDetails = calculateQuizDetails(conceptsList);

    let modalContent = `
      <div class="space-y-4">
        <div class="text-center mb-6">
          <div class="text-6xl mb-2">🎯</div>
          <h3 class="text-2xl font-bold text-purple-600 mb-2">퀴즈 정확도 ${avgAccuracy}%</h3>
          <p class="text-gray-600">총 ${totalQuizzes}회의 퀴즈를 완료했어요!</p>
        </div>
        
        <div class="bg-purple-50 rounded-lg p-4 mb-4">
          <h4 class="font-semibold text-purple-800 mb-3">📊 상세 통계</h4>
          <div class="grid grid-cols-2 gap-4">
            <div class="text-center">
              <div class="text-2xl font-bold text-green-600">${
                quizDetails.totalCorrect
              }</div>
              <div class="text-sm text-gray-600">정답 수</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-red-600">${
                quizDetails.totalIncorrect
              }</div>
              <div class="text-sm text-gray-600">오답 수</div>
            </div>
          </div>
        </div>
        
        <div class="bg-blue-50 rounded-lg p-4">
          <h4 class="font-semibold text-blue-800 mb-2">💡 학습 팁</h4>
          <p class="text-sm text-blue-700">
            ${
              avgAccuracy >= 80
                ? "훌륭한 실력이에요! 계속 도전해보세요."
                : avgAccuracy >= 60
                ? "좋은 성과입니다. 틀린 문제를 다시 복습해보세요."
                : "기초를 더 탄탄히 다져보세요. 학습 후 퀴즈에 도전하면 도움이 됩니다."
            }
          </p>
        </div>
      </div>
    `;

    showModal("퀴즈 정확도 상세", modalContent);
    console.log("✅ 퀴즈 정확도 모달 표시 완료");
  } catch (error) {
    console.error("퀴즈 정확도 상세 보기 실패:", error);
  }
}

// 퀴즈 상세 정보 계산
function calculateQuizDetails(conceptsList) {
  let totalCorrect = 0;
  let totalIncorrect = 0;

  conceptsList.forEach((concept) => {
    totalCorrect += concept.quizCorrect || 0;
    totalIncorrect += (concept.quizTotal || 0) - (concept.quizCorrect || 0);
  });

  return {
    totalCorrect,
    totalIncorrect,
    totalQuestions: totalCorrect + totalIncorrect,
  };
}

// 연속학습 모달 표시 (달력 형식으로 개선)
function showStudyStreakModal(studyStreak) {
  try {
    console.log("🔥 연속학습 모달 표시 시작 (달력 형식)");

    // 학습 날짜별 상세 정보 계산 (대상 언어별 필터링 적용)
    const learningDatesInfo = calculateLearningDatesInfoForTargetLanguage();

    let modalContent = `
      <div class="space-y-4">
        <div class="text-center mb-6">
          <div class="text-6xl mb-2">🔥</div>
          <h3 class="text-2xl font-bold text-orange-600 mb-2">연속 활동 ${studyStreak}일</h3>
          <p class="text-gray-600">꾸준한 ${getLanguageName(
            selectedTargetLanguage
          )} 활동으로 실력을 쌓아가고 있어요!</p>
        </div>
        
        <div class="bg-orange-50 rounded-lg p-4 mb-4">
          <h4 class="font-semibold text-orange-800 mb-3">📅 연속 활동 달력 (최근 8일)</h4>
          ${generateStudyCalendar(learningDatesInfo)}
        </div>
        
        <div class="bg-blue-50 rounded-lg p-4">
          <h4 class="font-semibold text-blue-800 mb-2">💡 학습 팁</h4>
          <p class="text-sm text-blue-700">
            ${
              studyStreak >= 7
                ? "정말 대단해요! 이 페이스를 유지해보세요."
                : studyStreak >= 3
                ? "좋은 습관이 만들어지고 있어요!"
                : "매일 조금씩이라도 학습하면 큰 변화를 만들 수 있어요."
            }
          </p>
        </div>
      </div>
    `;

    // 모달 표시
    showModal("연속 활동 상세", modalContent);
    console.log("✅ 연속학습 모달 표시 완료");
  } catch (error) {
    console.error("연속학습 모달 표시 실패:", error);
  }
}

// 학습 날짜별 정보 계산 (대상 언어별 필터링 적용)
function calculateLearningDatesInfoForTargetLanguage() {
  const datesInfo = [];
  const today = new Date();

  for (let i = 0; i < 8; i++) {
    // 최근 8일
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toLocaleDateString("ko-KR");
    const dateKey = date.toISOString().split("T")[0];

    // 해당 날짜에 대상 언어로 학습 기록이 있는지 확인
    const hasLearning = allLearningRecords.some((record) => {
      const recordDate =
        record.timestamp?.toDate?.() ||
        new Date(record.timestamp) ||
        record.completed_at?.toDate?.() ||
        new Date(record.completed_at);
      const recordTargetLanguage =
        record.targetLanguage || record.language_pair?.target || "english";
      return (
        recordDate.toISOString().split("T")[0] === dateKey &&
        recordTargetLanguage === selectedTargetLanguage
      );
    });

    // 퀴즈나 게임 활동도 포함
    const hasQuizActivity = allQuizRecords.some((record) => {
      const recordDate =
        record.timestamp?.toDate?.() || new Date(record.timestamp);
      const recordTargetLanguage =
        record.targetLanguage || record.language_pair?.target || "english";
      return (
        recordDate.toISOString().split("T")[0] === dateKey &&
        recordTargetLanguage === selectedTargetLanguage
      );
    });

    const hasGameActivity = allGameRecords.some((record) => {
      const recordDate =
        record.timestamp?.toDate?.() ||
        new Date(record.timestamp) ||
        record.completed_at?.toDate?.() ||
        new Date(record.completed_at);
      const recordTargetLanguage =
        record.targetLanguage || record.language_pair?.target || "english";
      return (
        recordDate.toISOString().split("T")[0] === dateKey &&
        recordTargetLanguage === selectedTargetLanguage
      );
    });

    const hasAnyActivity = hasLearning || hasQuizActivity || hasGameActivity;

    datesInfo.push({
      date: date,
      dateStr: dateStr,
      dateKey: dateKey,
      hasLearning: hasLearning,
      hasQuizActivity: hasQuizActivity,
      hasGameActivity: hasGameActivity,
      hasAnyActivity: hasAnyActivity,
    });
  }

  return datesInfo.reverse(); // 오래된 날짜부터 정렬
}

// 언어 이름 반환 함수
function getLanguageName(languageCode) {
  const languageNames = {
    english: "영어",
    korean: "한국어",
    japanese: "일본어",
    chinese: "중국어",
  };
  return languageNames[languageCode] || languageCode;
}

// 연속 활동 달력 생성 함수 (8일, 요일 제거, 모바일 반응형)
function generateStudyCalendar(learningDatesInfo) {
  // 모바일과 데스크톱 구분을 위한 반응형 그리드
  let calendarHTML = '<div class="grid grid-cols-8 gap-2 text-xs">';

  // 날짜 셀들 (최신 8일, 요일 헤더 없음)
  learningDatesInfo.forEach((dateInfo, index) => {
    const today = new Date();
    const isToday = dateInfo.dateKey === today.toISOString().split("T")[0];
    const dayNumber = dateInfo.date.getDate();

    let cellClass =
      "aspect-square flex flex-col items-center justify-center rounded-full text-xs font-medium min-h-12 ";

    if (isToday) {
      if (dateInfo.hasAnyActivity) {
        cellClass += "border-4 border-orange-500 bg-green-50 text-green-700 ";
      } else {
        cellClass += "border-4 border-orange-500 bg-orange-50 text-orange-700 ";
      }
    } else if (dateInfo.hasAnyActivity) {
      cellClass += "border-2 border-green-500 bg-green-50 text-green-700 ";
    } else {
      cellClass += "border-2 border-gray-300 bg-gray-50 text-gray-500 ";
    }

    calendarHTML += `
      <div class="${cellClass} relative" title="${dateInfo.dateStr} ${
      dateInfo.hasAnyActivity ? "- 활동 완료" : "- 활동 없음"
    }">
        <div class="font-bold text-sm">${
          dateInfo.date.getMonth() + 1
        }.${dayNumber}</div>
      </div>
    `;
  });

  calendarHTML += "</div>";

  // 모바일 전용 CSS 추가
  calendarHTML += `
    <style>
      @media (max-width: 768px) {
        .grid-cols-8 {
          grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
        }
        .grid-cols-8 > div:nth-child(5) {
          grid-column-start: 1;
        }
      }
    </style>
  `;

  // 범례 추가 (용어 수정)
  calendarHTML += `
    <div class="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs">
      <div class="flex items-center gap-1">
        <div class="w-3 h-3 bg-green-100 rounded"></div>
        <span class="text-gray-600">활동한 날</span>
      </div>
      <div class="flex items-center gap-1">
        <div class="w-3 h-3 bg-gray-100 rounded"></div>
        <span class="text-gray-600">활동하지 않은 날</span>
      </div>
      <div class="flex items-center gap-1">
        <div class="w-3 h-3 border-2 border-orange-500 rounded"></div>
        <span class="text-gray-600">오늘</span>
      </div>
      <div class="flex items-center gap-2">
        <span class="text-gray-600">📚 학습 🎯 퀴즈 🎮 게임</span>
      </div>
    </div>
    <div class="mt-2 text-xs text-gray-500 text-center">
      <p class="mb-1">💡 학습, 퀴즈, 게임 중 하나라도 활동하면 연속 활동으로 계산됩니다.</p>
      <p class="text-green-600">🟢 초록 테두리는 해당 날짜에 활동을 완료했음을 의미합니다.</p>
    </div>
  `;

  return calendarHTML;
}

// 기존 함수 유지 (호환성을 위해)
function calculateLearningDatesInfo() {
  return calculateLearningDatesInfoForTargetLanguage().slice(0, 8);
}

// 학습 활동 분석 업데이트
function updateLearningAnalysis() {
  try {
    // 주간 학습 활동 차트 업데이트
    updateWeeklyActivityChart();

    // 도메인별 진도 차트 업데이트
    updateCategoryProgressChart();

    console.log("📊 학습 활동 분석 업데이트 완료");
  } catch (error) {
    console.error("학습 활동 분석 업데이트 실패:", error);
  }
}

// 주간 학습 활동 차트 (Chart.js로 최적화)
function updateWeeklyActivityChart() {
  try {
    const canvas = document.getElementById("weekly-activity-chart");
    if (!canvas) return;

    // 기존 차트 인스턴스 제거
    if (window.weeklyActivityChartInstance) {
      window.weeklyActivityChartInstance.destroy();
    }

    // 최근 7일간의 활동 데이터 계산 (대상 언어별 필터링)
    const weekData = calculateWeeklyActivityDataForTargetLanguage();

    // Chart.js로 스택 바 차트 생성
    createWeeklyActivityChartJS(canvas, weekData);
  } catch (error) {
    console.error("주간 활동 차트 업데이트 실패:", error);
  }
}

// 주간 활동 데이터 계산 (대상 언어별 필터링 적용)
function calculateWeeklyActivityDataForTargetLanguage() {
  const weekData = [];
  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateKey = date.toISOString().split("T")[0];
    const dayName = ["일", "월", "화", "수", "목", "금", "토"][date.getDay()];

    // 해당 날짜의 활동 수 계산 (이미 대상 언어별로 필터링된 배열 사용)
    let learningCount = 0;
    let quizCount = 0;
    let gameCount = 0;

    // 학습 활동 (이미 대상 언어별로 필터링됨)
    learningCount = allLearningRecords.filter((record) => {
      const recordDate =
        record.timestamp?.toDate?.() ||
        new Date(record.timestamp) ||
        record.completed_at?.toDate?.() ||
        new Date(record.completed_at);
      return recordDate.toISOString().split("T")[0] === dateKey;
    }).length;

    // 퀴즈 활동 (이미 대상 언어별로 필터링됨)
    quizCount = allQuizRecords.filter((record) => {
      const recordDate =
        record.timestamp?.toDate?.() || new Date(record.timestamp);
      return recordDate.toISOString().split("T")[0] === dateKey;
    }).length;

    // 게임 활동 (이미 대상 언어별로 필터링됨)
    gameCount = allGameRecords.filter((record) => {
      const recordDate =
        record.timestamp?.toDate?.() ||
        new Date(record.timestamp) ||
        record.completed_at?.toDate?.() ||
        new Date(record.completed_at);
      return recordDate.toISOString().split("T")[0] === dateKey;
    }).length;

    weekData.push({
      day: dayName,
      date: dateKey,
      learning: learningCount,
      quiz: quizCount,
      game: gameCount,
      total: learningCount + quizCount + gameCount,
    });
  }

  console.log(`📊 주간 활동 데이터 (${selectedTargetLanguage}):`, weekData);
  return weekData;
}

// Chart.js를 사용한 주간 활동 차트 생성
function createWeeklyActivityChartJS(canvas, weekData) {
  const ctx = canvas.getContext("2d");

  // 데이터 준비
  const labels = weekData.map((data) => data.day);
  const learningData = weekData.map((data) => data.learning);
  const quizData = weekData.map((data) => data.quiz);
  const gameData = weekData.map((data) => data.game);

  const chartConfig = {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "📚 학습",
          data: learningData,
          backgroundColor: "#3b82f6",
          borderColor: "#2563eb",
          borderWidth: 1,
        },
        {
          label: "🎯 퀴즈",
          data: quizData,
          backgroundColor: "#8b5cf6",
          borderColor: "#7c3aed",
          borderWidth: 1,
        },
        {
          label: "🎮 게임",
          data: gameData,
          backgroundColor: "#10b981",
          borderColor: "#059669",
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          stacked: true,
          grid: {
            display: false,
          },
          ticks: {
            font: {
              size: 12,
            },
          },
        },
        y: {
          stacked: true,
          beginAtZero: true,
          ticks: {
            stepSize: 1,
            font: {
              size: 10,
            },
          },
          grid: {
            color: "#e5e7eb",
          },
        },
      },
      plugins: {
        legend: {
          display: true,
          position: "top",
          labels: {
            font: {
              size: 11,
            },
            usePointStyle: true,
            padding: 15,
          },
        },
        tooltip: {
          mode: "index",
          intersect: false,
          callbacks: {
            title: (tooltipItems) => {
              const index = tooltipItems[0].dataIndex;
              return `${weekData[index].day} (${weekData[index].date
                .split("-")
                .slice(1)
                .join("/")})`;
            },
            footer: (tooltipItems) => {
              const index = tooltipItems[0].dataIndex;
              const total = weekData[index].total;
              return `총 활동: ${total}회`;
            },
          },
        },
      },
      animation: {
        duration: 800,
        easing: "easeInOutQuart",
      },
    },
  };

  // 차트 인스턴스 생성 및 저장
  window.weeklyActivityChartInstance = new Chart(ctx, chartConfig);

  console.log(
    `📊 Chart.js 주간 활동 차트 생성 완료 (${selectedTargetLanguage})`
  );
}

// 기존 함수 유지 (호환성을 위해)
function calculateWeeklyActivityData() {
  return calculateWeeklyActivityDataForTargetLanguage();
}

// 주간 스택 바 차트 그리기 (활동별 구분)
function drawWeeklyStackedBarChart(ctx, canvas, weekData) {
  const padding = 40;
  const chartWidth = canvas.width - padding * 2;
  const chartHeight = canvas.height - padding * 2;
  const barWidth = (chartWidth / weekData.length) * 0.8;
  const barSpacing = (chartWidth / weekData.length) * 0.2;

  const maxValue = Math.max(...weekData.map((d) => d.total), 1);

  // 활동별 색상
  const colors = {
    learning: "#3b82f6", // 파란색 (학습)
    quiz: "#8b5cf6", // 보라색 (퀴즈)
    game: "#10b981", // 초록색 (게임)
  };

  // 배경
  ctx.fillStyle = "#f8f9fa";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 축 그리기
  ctx.strokeStyle = "#dee2e6";
  ctx.lineWidth = 1;
  ctx.beginPath();
  // Y축
  ctx.moveTo(padding, padding);
  ctx.lineTo(padding, canvas.height - padding);
  // X축
  ctx.moveTo(padding, canvas.height - padding);
  ctx.lineTo(canvas.width - padding, canvas.height - padding);
  ctx.stroke();

  // Y축 눈금 그리기
  for (
    let i = 0;
    i <= Math.min(maxValue, 10);
    i += Math.max(1, Math.floor(maxValue / 5))
  ) {
    const y = canvas.height - padding - (i / maxValue) * chartHeight;
    ctx.strokeStyle = "#e9ecef";
    ctx.beginPath();
    ctx.moveTo(padding, y);
    ctx.lineTo(canvas.width - padding, y);
    ctx.stroke();

    // 눈금 라벨
    ctx.fillStyle = "#6c757d";
    ctx.font = "10px sans-serif";
    ctx.textAlign = "right";
    ctx.fillText(i.toString(), padding - 5, y + 3);
  }

  // 스택 바 그리기
  weekData.forEach((data, index) => {
    const x = padding + index * (barWidth + barSpacing) + barSpacing / 2;
    let currentY = canvas.height - padding;

    // 학습 활동 (맨 아래)
    if (data.learning > 0) {
      const segmentHeight = (data.learning / maxValue) * chartHeight;
      currentY -= segmentHeight;
      ctx.fillStyle = colors.learning;
      ctx.fillRect(x, currentY, barWidth, segmentHeight);
    }

    // 퀴즈 활동 (중간)
    if (data.quiz > 0) {
      const segmentHeight = (data.quiz / maxValue) * chartHeight;
      currentY -= segmentHeight;
      ctx.fillStyle = colors.quiz;
      ctx.fillRect(x, currentY, barWidth, segmentHeight);
    }

    // 게임 활동 (맨 위)
    if (data.game > 0) {
      const segmentHeight = (data.game / maxValue) * chartHeight;
      currentY -= segmentHeight;
      ctx.fillStyle = colors.game;
      ctx.fillRect(x, currentY, barWidth, segmentHeight);
    }

    // 날짜 라벨
    ctx.fillStyle = "#6c757d";
    ctx.font = "12px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(data.day, x + barWidth / 2, canvas.height - padding + 20);

    // 총 값 표시 (막대 위쪽)
    if (data.total > 0) {
      ctx.fillStyle = "#495057";
      ctx.font = "bold 12px sans-serif";
      ctx.fillText(data.total.toString(), x + barWidth / 2, currentY - 5);
    }
  });

  // 범례 그리기
  drawChartLegend(ctx, canvas, colors, padding);
}

// 차트 범례 그리기
function drawChartLegend(ctx, canvas, colors, padding) {
  const legendItems = [
    { label: "📚 학습", color: colors.learning },
    { label: "🎯 퀴즈", color: colors.quiz },
    { label: "🎮 게임", color: colors.game },
  ];

  const legendX = padding;
  const legendY = padding - 25;
  let currentX = legendX;

  ctx.font = "11px sans-serif";
  ctx.textAlign = "left";

  legendItems.forEach((item, index) => {
    // 색상 박스
    ctx.fillStyle = item.color;
    ctx.fillRect(currentX, legendY, 12, 12);

    // 라벨
    ctx.fillStyle = "#495057";
    ctx.fillText(item.label, currentX + 16, legendY + 9);

    // 다음 아이템 위치
    const textWidth = ctx.measureText(item.label).width;
    currentX += 16 + textWidth + 15;
  });
}

// 기존 함수 유지 (호환성을 위해)
function drawWeeklyBarChart(ctx, canvas, weekData) {
  drawWeeklyStackedBarChart(ctx, canvas, weekData);
}

// 도메인별 진도 차트 (Chart.js로 최적화)
async function updateCategoryProgressChart() {
  try {
    const canvas = document.getElementById("category-progress-chart");
    if (!canvas) return;

    // 기존 차트 인스턴스 제거
    if (window.domainProgressChartInstance) {
      window.domainProgressChartInstance.destroy();
    }

    // concept_snapshots에서 도메인별 데이터 계산
    const domainData = await calculateDomainProgressData();

    // Chart.js로 도넛 차트 생성
    createDomainProgressChartJS(canvas, domainData);
  } catch (error) {
    console.error("도메인별 진도 차트 업데이트 실패:", error);
  }
}

// concept_snapshots에서 도메인별 진도 데이터 계산
async function calculateDomainProgressData() {
  try {
    // user_records에서 concept_snapshots 조회
    const { doc, getDoc, db } = window.firebaseInit;
    const userRecordRef = doc(db, "user_records", currentUser.email);
    const userDoc = await getDoc(userRecordRef);

    if (!userDoc.exists()) {
      console.log("❌ user_records 문서가 존재하지 않음");
      return [];
    }

    const userData = userDoc.data();
    const conceptSnapshots = userData.concept_snapshots || {};

    // 대상 언어별 스냅샷 추출
    const languageSnapshots = conceptSnapshots[selectedTargetLanguage] || {};

    // 도메인별 그룹화
    const domainGroups = {};

    Object.entries(languageSnapshots).forEach(([englishWord, snapshot]) => {
      const domain = snapshot.domain || "일반";
      const category = snapshot.category || "기타";

      if (!domainGroups[domain]) {
        domainGroups[domain] = {
          name: domain,
          count: 0,
          categories: {},
          color: getDomainColor(domain),
        };
      }

      domainGroups[domain].count++;

      if (!domainGroups[domain].categories[category]) {
        domainGroups[domain].categories[category] = 0;
      }
      domainGroups[domain].categories[category]++;
    });

    // 배열로 변환하고 정렬
    const domainData = Object.values(domainGroups)
      .filter((domain) => domain.count > 0)
      .sort((a, b) => b.count - a.count);

    console.log(
      `📊 도메인별 진도 데이터 (${selectedTargetLanguage}):`,
      domainData
    );
    return domainData;
  } catch (error) {
    console.error("❌ 도메인별 진도 데이터 계산 실패:", error);
    return [];
  }
}

// 도메인별 색상 배정
function getDomainColor(domain) {
  // 기존에 정의된 도메인별 색상 (영어 → 한국어 매핑)
  const domainColors = {
    일반: "#747D8C", // other
    daily: "#4B63AC", // daily
    비즈니스: "#45B7D1", // business
    business: "#45B7D1", // business
    여행: "#4ECDC4", // travel
    travel: "#4ECDC4", // travel
    음식: "#FF6B6B", // food
    food: "#FF6B6B", // food
    건강: "#FF9FF3", // health
    health: "#FF9FF3", // health
    교육: "#96CEB4", // education
    education: "#96CEB4", // education
    스포츠: "#54A0FF", // sports
    sports: "#54A0FF", // sports
    문화: "#00D2D3", // culture
    culture: "#00D2D3", // culture
    기술: "#9C27B0", // technology
    technology: "#9C27B0", // technology
    엔터테인먼트: "#5F27CD", // entertainment
    entertainment: "#5F27CD", // entertainment
    자연: "#FECA57", // nature
    nature: "#FECA57", // nature
    독해: "#FECA57", // 독해용 (자연과 같은 색상)
  };

  return domainColors[domain] || generateColorFromString(domain);
}

// 문자열에서 색상 생성
function generateColorFromString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const color = `hsl(${hash % 360}, 65%, 50%)`;
  return color;
}

// 화면 크기에 따른 범례 위치 결정
function getLegendPosition() {
  return window.innerWidth >= 1024 ? "right" : "bottom"; // lg breakpoint (1024px)
}

// Chart.js를 사용한 도메인별 진도 차트 생성
function createDomainProgressChartJS(canvas, domainData) {
  if (!domainData || domainData.length === 0) {
    // 데이터가 없을 때 메시지 표시
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#6b7280";
    ctx.font = "14px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(
      `${getLanguageName(selectedTargetLanguage)} 학습 데이터가 없습니다`,
      canvas.width / 2,
      canvas.height / 2
    );
    return;
  }

  const ctx = canvas.getContext("2d");

  // 전체 통계 계산
  const totalCount = domainData.reduce((sum, domain) => sum + domain.count, 0);
  const domainCount = domainData.length;

  // 전체 카테고리 수 계산 (중복 제거)
  const allCategories = new Set();
  domainData.forEach((domain) => {
    Object.keys(domain.categories).forEach((category) => {
      allCategories.add(category);
    });
  });
  const categoryCount = allCategories.size;

  // 데이터 준비
  const labels = domainData.map((domain) => domain.name);
  const data = domainData.map((domain) => domain.count);
  const colors = domainData.map((domain) => domain.color);

  const chartConfig = {
    type: "doughnut",
    data: {
      labels: labels,
      datasets: [
        {
          data: data,
          backgroundColor: colors,
          borderColor: "#ffffff",
          borderWidth: 2,
          hoverBorderWidth: 3,
          cutout: "60%",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: getLegendPosition(),
          labels: {
            font: {
              size: 11,
            },
            usePointStyle: true,
            padding: 12,
            generateLabels: function (chart) {
              const data = chart.data;
              return data.labels.map((label, i) => ({
                text: `${label}`,
                fillStyle: data.datasets[0].backgroundColor[i],
                strokeStyle: data.datasets[0].backgroundColor[i],
                pointStyle: "circle",
                index: i,
              }));
            },
          },
        },
        tooltip: {
          displayColors: true,
          callbacks: {
            title: function () {
              return ""; // 제목 제거
            },
            label: function (context) {
              const domain = domainData[context.dataIndex];
              const percentage = ((domain.count / totalCount) * 100).toFixed(1);
              return `${domain.name}: ${domain.count}개 (${percentage}%)`;
            },
            afterLabel: function (context) {
              const domain = domainData[context.dataIndex];
              const categoryList = Object.entries(domain.categories)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 3)
                .map(([cat, count]) => `${cat}: ${count}개`);
              return categoryList.join("\n");
            },
          },
        },
      },
      animation: {
        duration: 1000,
        easing: "easeInOutQuart",
      },
    },
    plugins: [
      {
        id: "centerText",
        beforeDraw: function (chart) {
          const ctx = chart.ctx;
          const centerX =
            chart.chartArea.left +
            (chart.chartArea.right - chart.chartArea.left) / 2;
          const centerY =
            chart.chartArea.top +
            (chart.chartArea.bottom - chart.chartArea.top) / 2;

          ctx.save();
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";

          // 전체 통계 텍스트
          ctx.fillStyle = "#1f2937";
          ctx.font = "bold 14px sans-serif";
          ctx.fillText(`${domainCount}개 도메인`, centerX, centerY - 10);

          ctx.font = "12px sans-serif";
          ctx.fillStyle = "#6b7280";
          ctx.fillText(`${totalCount}개 개념`, centerX, centerY + 8);

          ctx.restore();
        },
      },
    ],
  };

  // 차트 인스턴스 생성 및 저장
  window.domainProgressChartInstance = new Chart(ctx, chartConfig);

  console.log(
    `📊 Chart.js 도메인 진도 차트 생성 완료 (${selectedTargetLanguage}):`,
    domainData.length,
    "개 도메인"
  );
}

// 도메인별 도넛 차트 그리기 (툴팁 포함)
function drawDomainDonutChart(ctx, canvas, data) {
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = Math.min(centerX, centerY) - 50;
  const innerRadius = radius * 0.6;

  const total = data.reduce((sum, item) => sum + item.count, 0);
  if (total === 0) {
    // 데이터가 없을 때
    ctx.fillStyle = "#e9ecef";
    ctx.font = "16px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(
      `${getLanguageName(selectedTargetLanguage)} 학습 데이터가 없습니다`,
      centerX,
      centerY
    );
    return;
  }

  let currentAngle = -Math.PI / 2; // 12시 방향부터 시작
  const sliceInfo = []; // 툴팁용 슬라이스 정보 저장

  data.forEach((item, index) => {
    if (item.count > 0) {
      const sliceAngle = (item.count / total) * 2 * Math.PI;

      // 슬라이스 정보 저장 (툴팁용)
      sliceInfo.push({
        ...item,
        startAngle: currentAngle,
        endAngle: currentAngle + sliceAngle,
        centerAngle: currentAngle + sliceAngle / 2,
      });

      // 슬라이스 그리기
      ctx.beginPath();
      ctx.arc(
        centerX,
        centerY,
        radius,
        currentAngle,
        currentAngle + sliceAngle
      );
      ctx.arc(
        centerX,
        centerY,
        innerRadius,
        currentAngle + sliceAngle,
        currentAngle,
        true
      );
      ctx.closePath();
      ctx.fillStyle = item.color;
      ctx.fill();

      // 테두리 그리기
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.stroke();

      // 라벨 위치 계산
      const labelAngle = currentAngle + sliceAngle / 2;
      const labelRadius = radius + 25;
      const labelX = centerX + Math.cos(labelAngle) * labelRadius;
      const labelY = centerY + Math.sin(labelAngle) * labelRadius;

      // 라벨 그리기 (도메인 이름과 개수)
      ctx.fillStyle = "#495057";
      ctx.font = "11px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(`${item.name}`, labelX, labelY);
      ctx.fillText(`${item.count}개`, labelX, labelY + 12);

      // 퍼센트 표시
      const percentage = ((item.count / total) * 100).toFixed(1);
      ctx.font = "9px sans-serif";
      ctx.fillStyle = "#6b7280";
      ctx.fillText(`${percentage}%`, labelX, labelY + 22);

      currentAngle += sliceAngle;
    }
  });

  // 중앙 텍스트
  ctx.fillStyle = "#495057";
  ctx.font = "bold 14px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(
    `${getLanguageName(selectedTargetLanguage)}`,
    centerX,
    centerY - 8
  );
  ctx.font = "12px sans-serif";
  ctx.fillText("학습 도메인", centerX, centerY + 5);
  ctx.font = "bold 16px sans-serif";
  ctx.fillText(`총 ${total}개`, centerX, centerY + 22);

  // 캔버스에 마우스 이벤트 추가 (툴팁용)
  setupDomainChartTooltip(
    canvas,
    sliceInfo,
    centerX,
    centerY,
    radius,
    innerRadius
  );
}

// 도메인 차트 툴팁 설정
function setupDomainChartTooltip(
  canvas,
  sliceInfo,
  centerX,
  centerY,
  radius,
  innerRadius
) {
  // 기존 이벤트 리스너 제거
  const newCanvas = canvas.cloneNode(true);
  canvas.parentNode.replaceChild(newCanvas, canvas);

  let tooltip = null;

  newCanvas.addEventListener("mousemove", (e) => {
    const rect = newCanvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // 마우스 위치에서 차트 중심까지의 거리와 각도 계산
    const dx = mouseX - centerX;
    const dy = mouseY - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);

    // 도넛 영역 내부인지 확인
    if (distance >= innerRadius && distance <= radius) {
      // 각도를 0-2π 범위로 정규화
      let normalizedAngle = angle;
      if (normalizedAngle < -Math.PI / 2) {
        normalizedAngle += 2 * Math.PI;
      }

      // 해당 슬라이스 찾기
      const hoveredSlice = sliceInfo.find((slice) => {
        return (
          normalizedAngle >= slice.startAngle &&
          normalizedAngle <= slice.endAngle
        );
      });

      if (hoveredSlice) {
        showDomainTooltip(e, hoveredSlice);
        newCanvas.style.cursor = "pointer";
        return;
      }
    }

    // 툴팁 숨기기
    hideDomainTooltip();
    newCanvas.style.cursor = "default";
  });

  newCanvas.addEventListener("mouseleave", () => {
    hideDomainTooltip();
    newCanvas.style.cursor = "default";
  });
}

// 도메인 툴팁 표시
function showDomainTooltip(e, sliceData) {
  hideDomainTooltip();

  const tooltip = document.createElement("div");
  tooltip.id = "domain-chart-tooltip";
  tooltip.className =
    "fixed z-50 bg-gray-800 text-white text-xs rounded py-2 px-3 pointer-events-none";
  tooltip.style.maxWidth = "200px";

  // 카테고리별 상세 정보 생성
  let categoryDetails = "";
  const sortedCategories = Object.entries(sliceData.categories)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5); // 상위 5개만 표시

  sortedCategories.forEach(([category, count]) => {
    categoryDetails += `<div class="flex justify-between"><span>${category}:</span><span>${count}개</span></div>`;
  });

  if (Object.keys(sliceData.categories).length > 5) {
    const remaining = Object.keys(sliceData.categories).length - 5;
    categoryDetails += `<div class="text-gray-400 mt-1">+${remaining}개 카테고리 더</div>`;
  }

  tooltip.innerHTML = `
    ${categoryDetails}
  `;

  document.body.appendChild(tooltip);

  // 툴팁 위치 설정
  const tooltipRect = tooltip.getBoundingClientRect();
  let left = e.clientX + 10;
  let top = e.clientY - 10;

  // 화면 경계 체크
  if (left + tooltipRect.width > window.innerWidth) {
    left = e.clientX - tooltipRect.width - 10;
  }
  if (top < 0) {
    top = e.clientY + 10;
  }

  tooltip.style.left = left + "px";
  tooltip.style.top = top + "px";
}

// 도메인 툴팁 숨기기
function hideDomainTooltip() {
  const existingTooltip = document.getElementById("domain-chart-tooltip");
  if (existingTooltip) {
    existingTooltip.remove();
  }
}

// 기존 함수 유지 (호환성을 위해)
function drawDonutChart(ctx, canvas, data) {
  drawDomainDonutChart(ctx, canvas, data);
}

// 범용 모달 표시 함수
function showModal(title, content) {
  // 기존 모달 제거
  const existingModal = document.getElementById("custom-modal");
  if (existingModal) {
    existingModal.remove();
  }

  const modalHTML = `
    <div id="custom-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between p-4 border-b">
          <h2 class="text-xl font-bold text-gray-800">${title}</h2>
          <button onclick="closeModal()" class="text-gray-500 hover:text-gray-700">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        <div class="p-6">
          ${content}
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML("beforeend", modalHTML);

  // ESC 키로 모달 닫기
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      closeModal();
    }
  });
}

// 모달 닫기 함수
function closeModal() {
  const modal = document.getElementById("custom-modal");
  if (modal) {
    modal.remove();
  }
}

// 전역 함수로 노출
window.showQuizAccuracyDetails = showQuizAccuracyDetails;
window.closeModal = closeModal;

// 총 단어수 모달 표시
async function showTotalWordsModal(conceptsList) {
  try {
    console.log("📋 총 단어수 모달 표시 시작");

    // 모달 내용 생성
    let modalContent = `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    `;

    conceptsList.forEach((concept, index) => {
      const snapshot = concept.snapshot;
      // 올바른 단어 추출: snapshot의 실제 단어 값 사용
      const sourceWord =
        snapshot.source_word || concept.englishWord || concept.conceptId;
      const targetWord =
        snapshot.word || concept.englishWord || concept.conceptId;

      console.log(`🔍 단어 추출: ${concept.conceptId}`, {
        sourceWord,
        targetWord,
        snapshot_source_word: snapshot.source_word,
        snapshot_word: snapshot.word,
        conceptId: concept.conceptId,
      });
      const accuracy = concept.averageAccuracy.toFixed(1);
      const isMastered = concept.isMastered;

      // 카테고리 태그 생성
      let categoryTags = "";
      if (snapshot.categories && Array.isArray(snapshot.categories)) {
        categoryTags = snapshot.categories
          .map(
            (cat) =>
              `<span class="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded mr-1">${cat}</span>`
          )
          .join("");
      }

      // 진행률 바 색상 결정
      const progressColor = isMastered
        ? "bg-green-500"
        : accuracy >= 70
        ? "bg-yellow-500"
        : "bg-red-500";
      const statusIcon = isMastered ? "🎓" : "📚";
      const statusText = isMastered ? "학습중" : "학습중";

      modalContent += `
        <div class="bg-gray-900 border border-gray-700 rounded-lg p-4 shadow-sm text-white">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center">
              <span class="text-2xl mr-2">${statusIcon}</span>
              <div>
                <div class="font-bold text-lg">${sourceWord} → ${targetWord}</div>
                <div class="text-xs text-gray-400 mt-1">${categoryTags}</div>
              </div>
            </div>
            <span class="px-2 py-1 text-xs rounded ${
              isMastered
                ? "bg-green-600 text-white"
                : "bg-yellow-600 text-white"
            }">${statusText}</span>
          </div>
          
          <!-- 마스터 진행률 -->
          <div class="mb-3">
            <div class="flex items-center justify-between text-sm mb-1">
              <span class="text-pink-400">🎯 마스터 진행률</span>
              <span class="font-bold">${accuracy}%</span>
            </div>
            <div class="w-full bg-gray-700 rounded-full h-2">
              <div class="${progressColor} h-2 rounded-full transition-all duration-300" style="width: ${accuracy}%"></div>
            </div>
          </div>
          
          <!-- 활동 통계 -->
          <div class="flex items-center justify-center space-x-4 text-sm">
            <div class="flex items-center">
              <span class="text-blue-400">📚</span>
              <span class="ml-1 text-white">${concept.learningCount || 0}</span>
            </div>
            <span class="text-gray-500">|</span>
            <div class="flex items-center">
              <span class="text-green-400">🎮</span>
              <span class="ml-1 text-white">${concept.gameCount || 0}</span>
            </div>
            <span class="text-gray-500">|</span>
            <div class="flex items-center">
              <span class="text-purple-400">🎯</span>
              <span class="ml-1 text-white">${concept.quizCount || 0}</span>
              ${
                concept.quizCount > 0
                  ? `<button class="ml-1 text-xs text-gray-400 hover:text-white" onclick="toggleQuizDetails(${index})" id="quiz-toggle-${index}">+</button>`
                  : ""
              }
            </div>

          </div>
          
          <!-- 퀴즈 상세 정보 (아래쪽으로 이동, 한 줄로 표시) -->
          ${
            concept.quizCount > 0
              ? `
          <div id="quiz-details-${index}" class="hidden mt-2 pt-2 border-t border-gray-600">
            <div class="flex items-center justify-center space-x-4 text-xs text-gray-300">
              <span>✅ 정답: ${concept.quizCorrect || 0}회</span>
              <span>❌ 오답: ${
                (concept.quizTotal || 0) - (concept.quizCorrect || 0)
              }회</span>
              <span>📊 정확도: ${
                concept.quizAccuracy ? concept.quizAccuracy.toFixed(1) : 0
              }%</span>
            </div>
          </div>
          `
              : ""
          }
        </div>
      `;
    });

    modalContent += `
      </div>
    `;

    // 모달 표시
    const modal = document.getElementById("totalWordsModal");
    const modalBody = document.getElementById("totalWordsModalBody");
    const modalTitle = modal.querySelector("h2");

    if (modal && modalBody && modalTitle) {
      modalTitle.textContent = `📚 총 단어 목록 (${conceptsList.length}개)`;
      modalBody.innerHTML = modalContent;
      modal.classList.remove("hidden");
    }

    console.log("✅ 총 단어수 모달 표시 완료");
  } catch (error) {
    console.error("❌ 총 단어수 모달 표시 실패:", error);
  }
}

// 마스터한 단어 모달 표시
async function showMasteredWordsModal(conceptsList) {
  try {
    console.log("🎓 마스터한 단어 모달 표시 시작");

    const masteredConcepts = conceptsList.filter(
      (concept) => concept.isMastered
    );

    // 모달 내용 생성
    let modalContent = `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    `;

    if (masteredConcepts.length === 0) {
      modalContent += `
        <div class="col-span-full text-center py-8">
          <div class="text-gray-500 text-lg">
            <i class="fas fa-trophy text-4xl mb-4 text-gray-300"></i>
            <p>아직 마스터한 단어가 없습니다.</p>
            <p class="text-sm mt-2">더 많이 학습해서 단어를 마스터해보세요!</p>
          </div>
        </div>
      `;
    } else {
      masteredConcepts.forEach((concept, index) => {
        const snapshot = concept.snapshot;
        // 올바른 단어 추출: snapshot의 실제 단어 값 사용
        const sourceWord = snapshot.source_word || concept.conceptId;
        const targetWord = snapshot.word || concept.conceptId;
        const accuracy = (concept.averageAccuracy || 0).toFixed(1);

        // 카테고리 태그 생성
        let categoryTags = "";
        if (snapshot.categories && Array.isArray(snapshot.categories)) {
          categoryTags = snapshot.categories
            .map(
              (cat) =>
                `<span class="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded mr-1">${cat}</span>`
            )
            .join("");
        }

        modalContent += `
          <div class="bg-gray-900 border border-gray-700 rounded-lg p-4 shadow-sm text-white">
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center">
                <span class="text-2xl mr-2">🎓</span>
                <div>
                  <div class="font-bold text-lg">${sourceWord} → ${targetWord}</div>
                  <div class="text-xs text-gray-400 mt-1">${categoryTags}</div>
                </div>
              </div>
              <span class="px-2 py-1 text-xs rounded bg-green-600 text-white">마스터</span>
            </div>
            
            <!-- 마스터 진행률 -->
            <div class="mb-3">
              <div class="flex items-center justify-between text-sm mb-1">
                <span class="text-pink-400">🎯 마스터 진행률</span>
                <span class="font-bold">${accuracy}%</span>
              </div>
              <div class="w-full bg-gray-700 rounded-full h-2">
                <div class="bg-green-500 h-2 rounded-full transition-all duration-300" style="width: ${accuracy}%"></div>
              </div>
            </div>
            
            <!-- 활동 통계 -->
            <div class="flex items-center justify-center space-x-4 text-sm">
              <div class="flex items-center">
                <span class="text-blue-400">📚</span>
                <span class="ml-1 text-white">${
                  concept.learningCount || 0
                }</span>
              </div>
              <span class="text-gray-500">|</span>
              <div class="flex items-center">
                <span class="text-green-400">🎮</span>
                <span class="ml-1 text-white">${concept.gameCount || 0}</span>
              </div>
              <span class="text-gray-500">|</span>
              <div class="flex items-center">
                <span class="text-purple-400">🎯</span>
                <span class="ml-1 text-white">${concept.quizCount || 0}</span>
                ${
                  concept.quizCount > 0
                    ? `<button class="ml-1 text-xs text-gray-400 hover:text-white" onclick="toggleQuizDetails(${index})" id="quiz-toggle-${index}">+</button>`
                    : ""
                }
              </div>

          </div>
          
          <!-- 퀴즈 상세 정보 (아래쪽으로 이동, 한 줄로 표시) -->
          ${
            concept.quizCount > 0
              ? `
          <div id="quiz-details-${index}" class="hidden mt-2 pt-2 border-t border-gray-600">
            <div class="flex items-center justify-center space-x-4 text-xs text-gray-300">
              <span>✅ 정답: ${concept.quizCorrect || 0}회</span>
              <span>❌ 오답: ${
                (concept.quizTotal || 0) - (concept.quizCorrect || 0)
              }회</span>
              <span>📊 정확도: ${
                concept.quizAccuracy ? concept.quizAccuracy.toFixed(1) : 0
              }%</span>
            </div>
          </div>
          `
              : ""
          }
        </div>
      `;
      });
    }

    modalContent += `
      </div>
    `;

    // 모달 표시 (같은 모달 재사용)
    const modal = document.getElementById("totalWordsModal");
    const modalBody = document.getElementById("totalWordsModalBody");
    const modalTitle = modal.querySelector("h2");

    if (modal && modalBody && modalTitle) {
      modalTitle.textContent = `🎓 마스터한 단어 목록 (${masteredConcepts.length}개)`;
      modalBody.innerHTML = modalContent;
      modal.classList.remove("hidden");
    }

    console.log("✅ 마스터한 단어 모달 표시 완료");
  } catch (error) {
    console.error("❌ 마스터한 단어 모달 표시 실패:", error);
  }
}

// 모달 닫기 함수
function closeTotalWordsModal() {
  const modal = document.getElementById("totalWordsModal");
  if (modal) {
    modal.classList.add("hidden");
  }
}

// 퀴즈 상세 정보 토글
function toggleQuizDetails(index) {
  const detailsElement = document.getElementById(`quiz-details-${index}`);
  const toggleButton = document.getElementById(`quiz-toggle-${index}`);

  if (detailsElement && toggleButton) {
    if (detailsElement.classList.contains("hidden")) {
      detailsElement.classList.remove("hidden");
      toggleButton.textContent = "-";
    } else {
      detailsElement.classList.add("hidden");
      toggleButton.textContent = "+";
    }
  }
}

// 전역으로 함수들 노출
window.closeTotalWordsModal = closeTotalWordsModal;
window.toggleQuizDetails = toggleQuizDetails;

// 학습 목표 저장 버튼 설정
function setupGoalsSaveButton() {
  const saveButton = document.getElementById("save-goals-btn");
  if (!saveButton) return;

  saveButton.addEventListener("click", async () => {
    try {
      // 목표 값들 가져오기
      const dailyWordsGoal =
        parseInt(document.getElementById("daily-words-goal")?.value) || 10;
      const dailyQuizGoal =
        parseInt(document.getElementById("daily-quiz-goal")?.value) || 20;
      const weeklyDaysGoal =
        parseInt(document.getElementById("weekly-days-goal")?.value) || 5;
      const weeklyMasteryGoal =
        parseInt(document.getElementById("weekly-mastery-goal")?.value) || 30;

      const languageGoals = {
        daily: {
          words: dailyWordsGoal,
          quizMinutes: dailyQuizGoal,
        },
        weekly: {
          studyDays: weeklyDaysGoal,
          masteryWords: weeklyMasteryGoal,
        },
        lastUpdated: new Date(),
      };

      // Firebase에 저장 (user_records 컬렉션의 goals 필드로 저장)
      const { doc, updateDoc, setDoc, getDoc, db } = window.firebaseInit;
      const userRecordRef = doc(db, "user_records", currentUser.email);

      // 기존 문서가 있는지 확인
      const userDoc = await getDoc(userRecordRef);

      if (userDoc.exists()) {
        // 기존 문서 업데이트 (언어별로 구분)
        await updateDoc(userRecordRef, {
          [`goals.${selectedTargetLanguage}`]: languageGoals,
          last_updated: new Date(),
        });
      } else {
        // 새 문서 생성 (언어별로 구분)
        await setDoc(userRecordRef, {
          goals: {
            [selectedTargetLanguage]: languageGoals,
          },
          last_updated: new Date(),
        });
      }

      console.log(
        `✅ 학습 목표 저장 완료 (${selectedTargetLanguage}):`,
        languageGoals
      );

      // 사용자에게 저장 완료 피드백
      saveButton.textContent = "저장 완료!";
      saveButton.style.backgroundColor = "#10b981";

      // 목표 저장 후 즉시 진행률 업데이트
      try {
        const conceptsList = await generateDetailedConceptsListFromSnapshots();
        updateGoalsProgress(conceptsList);
        console.log("📊 목표 저장 후 진행률 즉시 업데이트 완료");
      } catch (progressError) {
        console.error("❌ 진행률 업데이트 실패:", progressError);
      }

      setTimeout(() => {
        saveButton.textContent = "목표 저장";
        saveButton.style.backgroundColor = "";
      }, 2000);
    } catch (error) {
      console.error("❌ 학습 목표 저장 실패:", error);

      // 에러 피드백
      saveButton.textContent = "저장 실패";
      saveButton.style.backgroundColor = "#ef4444";

      setTimeout(() => {
        saveButton.textContent = "목표 저장";
        saveButton.style.backgroundColor = "";
      }, 2000);
    }
  });
}

// 학습 목표 로드 (페이지 로드 시)
async function loadUserGoals() {
  try {
    const { doc, getDoc, db } = window.firebaseInit;
    const userRecordRef = doc(db, "user_records", currentUser.email);
    const userDoc = await getDoc(userRecordRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      const allGoals = userData.goals;
      const currentLanguageGoals = allGoals?.[selectedTargetLanguage];

      if (currentLanguageGoals) {
        // 현재 선택된 언어의 목표 값들을 입력 필드에 설정
        const dailyWordsInput = document.getElementById("daily-words-goal");
        const dailyQuizInput = document.getElementById("daily-quiz-goal");
        const weeklyDaysInput = document.getElementById("weekly-days-goal");
        const weeklyMasteryInput = document.getElementById(
          "weekly-mastery-goal"
        );

        if (dailyWordsInput && currentLanguageGoals.daily?.words) {
          dailyWordsInput.value = currentLanguageGoals.daily.words;
        }
        if (dailyQuizInput && currentLanguageGoals.daily?.quizMinutes) {
          dailyQuizInput.value = currentLanguageGoals.daily.quizMinutes;
        }
        if (weeklyDaysInput && currentLanguageGoals.weekly?.studyDays) {
          weeklyDaysInput.value = currentLanguageGoals.weekly.studyDays;
        }
        if (weeklyMasteryInput && currentLanguageGoals.weekly?.masteryWords) {
          weeklyMasteryInput.value = currentLanguageGoals.weekly.masteryWords;
        }

        console.log(
          `✅ 학습 목표 로드 완료 (${selectedTargetLanguage}):`,
          currentLanguageGoals
        );
      } else {
        console.log(`저장된 ${selectedTargetLanguage} 학습 목표가 없습니다.`);

        // 기본값으로 초기화
        document.getElementById("daily-words-goal").value = 10;
        document.getElementById("daily-quiz-goal").value = 20;
        document.getElementById("weekly-days-goal").value = 5;
        document.getElementById("weekly-mastery-goal").value = 30;
      }
    }
  } catch (error) {
    console.error("❌ 학습 목표 로드 실패:", error);
  }
}

// 학습 목표 진행률 업데이트 함수
function updateGoalsProgress(conceptsList) {
  try {
    // 오늘 날짜 정보
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];

    // 이번 주 시작일 (월요일) 계산
    const weekStart = new Date(today);
    const dayOfWeek = today.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // 일요일(0)이면 -6, 나머지는 1-dayOfWeek
    weekStart.setDate(today.getDate() + mondayOffset);
    const weekStartStr = weekStart.toISOString().split("T")[0];

    // 1. 오늘 학습한 신규 단어 수 계산
    const todayNewWords = calculateTodayNewWords(todayStr);

    // 2. 오늘 퀴즈 시간 계산 (분)
    const todayQuizMinutes = calculateTodayQuizTime(todayStr);

    // 3. 이번 주 학습 일수 계산
    const weeklyStudyDays = calculateWeeklyStudyDays(weekStartStr);

    // 4. 이번 주 마스터한 단어 수 계산
    const weeklyMasteredWords = calculateWeeklyMasteredWords(
      conceptsList,
      weekStartStr
    );

    // UI 업데이트
    updateGoalsProgressUI(
      todayNewWords,
      todayQuizMinutes,
      weeklyStudyDays,
      weeklyMasteredWords
    );

    console.log("📊 학습 목표 진행률 업데이트:", {
      todayNewWords,
      todayQuizMinutes,
      weeklyStudyDays,
      weeklyMasteredWords,
    });
  } catch (error) {
    console.error("❌ 학습 목표 진행률 업데이트 실패:", error);
  }
}

// 오늘 학습한 신규 단어 수 계산
function calculateTodayNewWords(todayStr) {
  const todayLearningRecords = allLearningRecords.filter((record) => {
    const recordDate =
      record.timestamp?.toDate?.() ||
      new Date(record.timestamp) ||
      record.completed_at?.toDate?.() ||
      new Date(record.completed_at);
    return recordDate.toISOString().split("T")[0] === todayStr;
  });

  // 고유한 concept_id 개수 계산 (중복 제거)
  const uniqueConceptIds = new Set();
  todayLearningRecords.forEach((record) => {
    const conceptIds = extractConceptIds(record);
    conceptIds.forEach((id) => uniqueConceptIds.add(id));
  });

  return uniqueConceptIds.size;
}

// 오늘 퀴즈 시간 계산 (분)
function calculateTodayQuizTime(todayStr) {
  const todayQuizRecords = allQuizRecords.filter((record) => {
    const recordDate =
      record.timestamp?.toDate?.() || new Date(record.timestamp);
    return recordDate.toISOString().split("T")[0] === todayStr;
  });

  // 퀴즈 소요 시간 합산 (초 → 분)
  const totalSeconds = todayQuizRecords.reduce((sum, record) => {
    return sum + (record.time_spent || 0);
  }, 0);

  return Math.floor(totalSeconds / 60); // 분 단위로 변환
}

// 이번 주 학습 일수 계산
function calculateWeeklyStudyDays(weekStartStr) {
  const weekStart = new Date(weekStartStr);
  const studyDays = new Set();

  // 모든 활동 기록 확인
  const allActivities = [
    ...allLearningRecords,
    ...allQuizRecords,
    ...allGameRecords,
  ];

  allActivities.forEach((record) => {
    const recordDate =
      record.timestamp?.toDate?.() ||
      new Date(record.timestamp) ||
      record.completed_at?.toDate?.() ||
      new Date(record.completed_at);

    // 이번 주 내의 날짜인지 확인
    if (recordDate >= weekStart && recordDate <= new Date()) {
      const dateStr = recordDate.toISOString().split("T")[0];
      studyDays.add(dateStr);
    }
  });

  return studyDays.size;
}

// 이번 주 마스터한 단어 수 계산
function calculateWeeklyMasteredWords(conceptsList, weekStartStr) {
  const weekStart = new Date(weekStartStr);
  let masteredThisWeek = 0;

  conceptsList.forEach((concept) => {
    if (concept.isMastered && concept.lastActivity) {
      const lastActivityDate = new Date(concept.lastActivity);
      // 이번 주에 마스터한 단어인지 확인
      if (lastActivityDate >= weekStart && lastActivityDate <= new Date()) {
        masteredThisWeek++;
      }
    }
  });

  return masteredThisWeek;
}

// 학습 목표 진행률 UI 업데이트
function updateGoalsProgressUI(
  todayNewWords,
  todayQuizMinutes,
  weeklyStudyDays,
  weeklyMasteredWords
) {
  // 목표 값 가져오기
  const dailyWordsGoal =
    parseInt(document.getElementById("daily-words-goal")?.value) || 10;
  const dailyQuizGoal =
    parseInt(document.getElementById("daily-quiz-goal")?.value) || 20;
  const weeklyDaysGoal =
    parseInt(document.getElementById("weekly-days-goal")?.value) || 5;
  const weeklyMasteryGoal =
    parseInt(document.getElementById("weekly-mastery-goal")?.value) || 30;

  // 1. 오늘 신규 단어 진행률
  const dailyWordsProgress = document.getElementById("daily-words-progress");
  const dailyWordsBar = document.getElementById("daily-words-bar");
  if (dailyWordsProgress && dailyWordsBar) {
    dailyWordsProgress.textContent = `${todayNewWords}/${dailyWordsGoal}개`;
    const wordsPercentage = Math.min(
      (todayNewWords / dailyWordsGoal) * 100,
      100
    );
    dailyWordsBar.style.width = `${wordsPercentage}%`;
  }

  // 2. 오늘 퀴즈 시간 진행률
  const dailyQuizProgress = document.getElementById("daily-quiz-progress");
  const dailyQuizBar = document.getElementById("daily-quiz-bar");
  if (dailyQuizProgress && dailyQuizBar) {
    dailyQuizProgress.textContent = `${todayQuizMinutes}/${dailyQuizGoal}분`;
    const quizPercentage = Math.min(
      (todayQuizMinutes / dailyQuizGoal) * 100,
      100
    );
    dailyQuizBar.style.width = `${quizPercentage}%`;
  }

  // 3. 이번 주 학습 일수 진행률
  const weeklyDaysProgress = document.getElementById("weekly-days-progress");
  const weeklyDaysBar = document.getElementById("weekly-days-bar");
  if (weeklyDaysProgress && weeklyDaysBar) {
    weeklyDaysProgress.textContent = `${weeklyStudyDays}/${weeklyDaysGoal}일`;
    const daysPercentage = Math.min(
      (weeklyStudyDays / weeklyDaysGoal) * 100,
      100
    );
    weeklyDaysBar.style.width = `${daysPercentage}%`;
  }

  // 4. 이번 주 마스터 단어 진행률
  const weeklyMasteryProgress = document.getElementById(
    "weekly-mastery-progress"
  );
  const weeklyMasteryBar = document.getElementById("weekly-mastery-bar");
  if (weeklyMasteryProgress && weeklyMasteryBar) {
    weeklyMasteryProgress.textContent = `${weeklyMasteredWords}/${weeklyMasteryGoal}개`;
    const masteryPercentage = Math.min(
      (weeklyMasteredWords / weeklyMasteryGoal) * 100,
      100
    );
    weeklyMasteryBar.style.width = `${masteryPercentage}%`;
  }
}

// 페이지 로드 시 초기화
document.addEventListener("DOMContentLoaded", initializeProgressPage);

// 화면 크기 변경 시 차트 범례 위치 업데이트
let resizeTimeout;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    // 도메인 차트 범례 위치 업데이트
    if (window.domainProgressChartInstance) {
      const newPosition = getLegendPosition();
      const currentPosition =
        window.domainProgressChartInstance.options.plugins.legend.position;

      if (newPosition !== currentPosition) {
        window.domainProgressChartInstance.options.plugins.legend.position =
          newPosition;
        window.domainProgressChartInstance.update("none"); // 애니메이션 없이 즉시 업데이트
      }
    }
  }, 300); // 300ms 디바운스
});

// 페이지 언로드 시 차트 인스턴스 정리
window.addEventListener("beforeunload", () => {
  if (window.weeklyActivityChartInstance) {
    window.weeklyActivityChartInstance.destroy();
  }
  if (window.domainProgressChartInstance) {
    window.domainProgressChartInstance.destroy();
  }
});
