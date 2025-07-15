// 임시 수정용 간단한 코드
function fixProgressData() {
  // 완료율 계산 (100%를 초과하지 않도록 제한)
  const completionRate =
    totalConcepts > 0
      ? Math.min(100, Math.round((masteredCount / totalConcepts) * 100))
      : 0;

  // 통계 계산 및 설정
  userProgressData.totalConcepts = totalConcepts;
  userProgressData.studiedConcepts = progressSnapshot.size;
  userProgressData.masteredConcepts = masteredCount;
  userProgressData.totalWords = totalConcepts;
  userProgressData.masteredWords = masteredCount;
  userProgressData.quizAccuracy = avgQuizAccuracy;

  // 기본값으로 학습 효율 설정
  learningResults.avgSessionQuality = 75;
  learningResults.qualityCount = 1;
  learningResults.totalStudyTime = 0;
  learningResults.validLearningSessionsCount = 0;

  console.log("📊 학습 효율 계산 (기본값):", {
    avgSessionQuality: learningResults.avgSessionQuality,
    cacheStatus: "기본값 사용",
  });
}
