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

// 활동 기록 로드
async function loadActivityRecords() {
  const { collection, query, where, getDocs, db } = window.firebaseInit;

  try {
    // 게임 기록 로드
    const gameQuery = query(
      collection(db, "game_records"),
      where("user_email", "==", currentUser.email)
    );
    const gameSnapshot = await getDocs(gameQuery);
    allGameRecords = gameSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // 퀴즈 기록 로드
    const quizQuery = query(
      collection(db, "quiz_records"),
      where("user_email", "==", currentUser.email)
    );
    const quizSnapshot = await getDocs(quizQuery);
    allQuizRecords = quizSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // 학습 기록 로드
    const learningQuery = query(
      collection(db, "learning_records"),
      where("user_email", "==", currentUser.email)
    );
    const learningSnapshot = await getDocs(learningQuery);
    allLearningRecords = learningSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log(
      `📊 활동 기록 로드 완료: 게임 ${allGameRecords.length}개, 퀴즈 ${allQuizRecords.length}개, 학습 ${allLearningRecords.length}개`
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
      languageSelector.addEventListener("change", (e) => {
        selectedTargetLanguage = e.target.value;
        localStorage.setItem("selectedTargetLanguage", selectedTargetLanguage);
        console.log("🌐 Target language changed to:", selectedTargetLanguage);
        updateUI();
      });
    }

    updateUI();
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

// 연속학습 계산
function calculateStudyStreak() {
  try {
    if (!allLearningRecords || allLearningRecords.length === 0) return 0;

    // 학습 기록을 날짜별로 그룹화
    const learningDates = new Set();
    allLearningRecords.forEach((record) => {
      const timestamp =
        record.timestamp?.toDate?.() ||
        new Date(record.timestamp) ||
        record.completed_at?.toDate?.() ||
        new Date(record.completed_at);
      const dateStr = timestamp.toISOString().split("T")[0]; // YYYY-MM-DD 형식
      learningDates.add(dateStr);
    });

    // 날짜를 정렬하여 연속된 날짜 계산
    const sortedDates = Array.from(learningDates).sort().reverse();
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

// 연속학습 모달 표시
function showStudyStreakModal(studyStreak) {
  try {
    console.log("🔥 연속학습 모달 표시 시작");

    // 학습 날짜별 상세 정보 계산
    const learningDatesInfo = calculateLearningDatesInfo();

    let modalContent = `
      <div class="space-y-4">
        <div class="text-center mb-6">
          <div class="text-6xl mb-2">🔥</div>
          <h3 class="text-2xl font-bold text-orange-600 mb-2">연속학습 ${studyStreak}일</h3>
          <p class="text-gray-600">꾸준한 학습으로 실력을 쌓아가고 있어요!</p>
        </div>
        
        <div class="bg-orange-50 rounded-lg p-4 mb-4">
          <h4 class="font-semibold text-orange-800 mb-3">📅 최근 학습 기록</h4>
          <div class="space-y-2">
    `;

    // 최근 7일간의 학습 기록 표시
    learningDatesInfo.slice(0, 7).forEach((dateInfo, index) => {
      const isToday = index === 0;
      const statusIcon = dateInfo.hasLearning ? "✅" : "⭕";
      const statusText = dateInfo.hasLearning ? "학습 완료" : "학습 없음";
      const bgColor = dateInfo.hasLearning ? "bg-green-100" : "bg-gray-100";

      modalContent += `
        <div class="flex items-center justify-between p-2 ${bgColor} rounded">
          <span class="font-medium">${dateInfo.dateStr} ${
        isToday ? "(오늘)" : ""
      }</span>
          <span class="text-sm">${statusIcon} ${statusText}</span>
        </div>
      `;
    });

    modalContent += `
          </div>
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
    showModal("연속학습 상세", modalContent);
    console.log("✅ 연속학습 모달 표시 완료");
  } catch (error) {
    console.error("연속학습 모달 표시 실패:", error);
  }
}

// 학습 날짜별 정보 계산
function calculateLearningDatesInfo() {
  const datesInfo = [];
  const today = new Date();

  for (let i = 0; i < 14; i++) {
    // 최근 14일
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toLocaleDateString("ko-KR");
    const dateKey = date.toISOString().split("T")[0];

    // 해당 날짜에 학습 기록이 있는지 확인
    const hasLearning = allLearningRecords.some((record) => {
      const recordDate =
        record.timestamp?.toDate?.() ||
        new Date(record.timestamp) ||
        record.completed_at?.toDate?.() ||
        new Date(record.completed_at);
      return recordDate.toISOString().split("T")[0] === dateKey;
    });

    datesInfo.push({
      date: date,
      dateStr: dateStr,
      dateKey: dateKey,
      hasLearning: hasLearning,
    });
  }

  return datesInfo;
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

// 주간 학습 활동 차트
function updateWeeklyActivityChart() {
  try {
    const canvas = document.getElementById("weekly-activity-chart");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    // 캔버스 클리어
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 최근 7일간의 활동 데이터 계산
    const weekData = calculateWeeklyActivityData();

    // 간단한 바 차트 그리기
    drawWeeklyBarChart(ctx, canvas, weekData);
  } catch (error) {
    console.error("주간 활동 차트 업데이트 실패:", error);
  }
}

// 주간 활동 데이터 계산
function calculateWeeklyActivityData() {
  const weekData = [];
  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateKey = date.toISOString().split("T")[0];
    const dayName = ["일", "월", "화", "수", "목", "금", "토"][date.getDay()];

    // 해당 날짜의 활동 수 계산
    let learningCount = 0;
    let quizCount = 0;
    let gameCount = 0;

    // 학습 활동
    learningCount = allLearningRecords.filter((record) => {
      const recordDate =
        record.timestamp?.toDate?.() ||
        new Date(record.timestamp) ||
        record.completed_at?.toDate?.() ||
        new Date(record.completed_at);
      return recordDate.toISOString().split("T")[0] === dateKey;
    }).length;

    // 퀴즈 활동
    quizCount = allQuizRecords.filter((record) => {
      const recordDate =
        record.timestamp?.toDate?.() || new Date(record.timestamp);
      return recordDate.toISOString().split("T")[0] === dateKey;
    }).length;

    // 게임 활동
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

  return weekData;
}

// 주간 바 차트 그리기
function drawWeeklyBarChart(ctx, canvas, weekData) {
  const padding = 40;
  const chartWidth = canvas.width - padding * 2;
  const chartHeight = canvas.height - padding * 2;
  const barWidth = (chartWidth / weekData.length) * 0.8;
  const barSpacing = (chartWidth / weekData.length) * 0.2;

  const maxValue = Math.max(...weekData.map((d) => d.total), 1);

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

  // 바 그리기
  weekData.forEach((data, index) => {
    const x = padding + index * (barWidth + barSpacing) + barSpacing / 2;
    const barHeight = (data.total / maxValue) * chartHeight;
    const y = canvas.height - padding - barHeight;

    // 바 색상 (활동량에 따라)
    let color = "#e9ecef";
    if (data.total > 0) {
      color =
        data.total >= 3 ? "#28a745" : data.total >= 2 ? "#ffc107" : "#17a2b8";
    }

    ctx.fillStyle = color;
    ctx.fillRect(x, y, barWidth, barHeight);

    // 날짜 라벨
    ctx.fillStyle = "#6c757d";
    ctx.font = "12px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(data.day, x + barWidth / 2, canvas.height - padding + 20);

    // 값 표시
    if (data.total > 0) {
      ctx.fillStyle = "#495057";
      ctx.font = "bold 14px sans-serif";
      ctx.fillText(data.total.toString(), x + barWidth / 2, y - 5);
    }
  });
}

// 도메인별 진도 차트
function updateCategoryProgressChart() {
  try {
    const canvas = document.getElementById("category-progress-chart");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    // 캔버스 클리어
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 도메인별 데이터 계산 (간단한 예시)
    const categoryData = [
      {
        name: "단어학습",
        count: allLearningRecords.filter(
          (r) => r.learning_mode === "vocabulary" || r.type === "vocabulary"
        ).length,
        color: "#007bff",
      },
      {
        name: "문법학습",
        count: allLearningRecords.filter(
          (r) => r.learning_mode === "grammar" || r.type === "grammar"
        ).length,
        color: "#28a745",
      },
      { name: "퀴즈", count: allQuizRecords.length, color: "#ffc107" },
      { name: "게임", count: allGameRecords.length, color: "#dc3545" },
    ];

    // 도넛 차트 그리기
    drawDonutChart(ctx, canvas, categoryData);
  } catch (error) {
    console.error("도메인별 진도 차트 업데이트 실패:", error);
  }
}

// 도넛 차트 그리기
function drawDonutChart(ctx, canvas, data) {
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = Math.min(centerX, centerY) - 40;
  const innerRadius = radius * 0.5;

  const total = data.reduce((sum, item) => sum + item.count, 0);
  if (total === 0) {
    // 데이터가 없을 때
    ctx.fillStyle = "#e9ecef";
    ctx.font = "16px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("데이터가 없습니다", centerX, centerY);
    return;
  }

  let currentAngle = -Math.PI / 2; // 12시 방향부터 시작

  data.forEach((item, index) => {
    if (item.count > 0) {
      const sliceAngle = (item.count / total) * 2 * Math.PI;

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

      // 라벨 위치 계산
      const labelAngle = currentAngle + sliceAngle / 2;
      const labelRadius = radius + 20;
      const labelX = centerX + Math.cos(labelAngle) * labelRadius;
      const labelY = centerY + Math.sin(labelAngle) * labelRadius;

      // 라벨 그리기
      ctx.fillStyle = "#495057";
      ctx.font = "12px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(`${item.name}`, labelX, labelY);
      ctx.fillText(`${item.count}개`, labelX, labelY + 15);

      currentAngle += sliceAngle;
    }
  });

  // 중앙 텍스트
  ctx.fillStyle = "#495057";
  ctx.font = "bold 16px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("총 활동", centerX, centerY - 5);
  ctx.fillText(`${total}개`, centerX, centerY + 15);
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
              <span class="text-gray-500">|</span>
              <span>❌ 오답: ${
                (concept.quizTotal || 0) - (concept.quizCorrect || 0)
              }회</span>
              <span class="text-gray-500">|</span>
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
              <span class="text-gray-500">|</span>
              <span>❌ 오답: ${
                (concept.quizTotal || 0) - (concept.quizCorrect || 0)
              }회</span>
              <span class="text-gray-500">|</span>
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

// 페이지 로드 시 초기화
document.addEventListener("DOMContentLoaded", initializeProgressPage);
