// Global variables
let currentUser = null;
let allLearningRecords = [];
let allGameRecords = [];
let allQuizRecords = [];
let userProgressData = {};
let currentLanguage = "ko";
let selectedTargetLanguage = "english";

// 캐시된 통계 데이터
let cachedStats = null;
let lastStatsUpdate = null;
// 캐시된 개념 데이터
let cachedConceptData = null;
let lastConceptUpdate = null;

// Initialize page
// ============ PROGRESS PAGE TRANSLATIONS ============
const progressTranslations = {
  ko: {
    // 필터 및 UI
    targetLanguage: "대상 언어",
    english: "영어",
    korean: "한국어",
    japanese: "일본어",
    chinese: "중국어",

    // 활동 현황
    totalWords: "총 단어수",
    masteredWords: "마스터한 단어",
    studyStreak: "연속 학습",
    quizAccuracy: "퀴즈 정확도",

    // 시간 표시
    justNow: "방금 전",
    minutesAgo: "분 전",
    hoursAgo: "시간 전",
    daysAgo: "일 전",
    day: "일",

    // 모달
    quizAccuracyDetails: "퀴즈 정확도 상세 정보",
    totalQuizzes: "총 퀴즈 수",
    totalQuestions: "총 문제 수",
    correctAnswers: "정답 수",
    accuracy: "정확도",
    averageScore: "평균 점수",
    bestScore: "최고 점수",

    // 차트
    learning: "학습",
    games: "게임",
    quizzes: "퀴즈",
    categoryInfoNone: "카테고리 정보 없음",

    // 활동 타입
    vocabularyFlashcard: "단어 플래시카드",
    vocabularyTyping: "단어 타이핑",
    wordTranslation: "단어 번역",
    wordScramble: "단어 섞기",
    wordMatching: "단어 맞추기",
    memoryCard: "기억 카드",
    memoryGame: "메모리 게임",
    speedQuiz: "스피드 퀴즈",
    crossword: "단어 퍼즐",
    hangman: "행맨 게임",
    learningActivity: "학습 활동",
    learningGame: "학습 게임",

    // 학습 효율/점수
    learningEfficiency: "학습 효율",
    score: "점수",

    // 기타
    noLearningRecords: "아직 학습 기록이 없습니다.",
    times: "회",
    points: "점",
    percent: "%",
    concepts: "개",
    minutes: "분",
    hours: "시간",

    // 학습 영역
    vocabulary: "단어",
    reading: "독해",
    listening: "듣기",
    speaking: "말하기",
    writing: "쓰기",
    grammar: "문법",
    conversation: "회화",

    // 카드 타입
    flashcard: "플래시카드",
    typing: "타이핑",
    quiz: "퀴즈",
    game: "게임",

    // 퀴즈 타입
    translation: "단어 번역",
    multiple_choice: "객관식",
    true_false: "O/X 퀴즈",

    // 학습 타입
    exampleLearning: "예문 학습",
    sentenceLearning: "문장 학습",
    pronunciationLearning: "발음 학습",
    definitionLearning: "정의 학습",
    learning: "학습",

    // 퀴즈 상세 타입
    multipleChoiceQuiz: "객관식 퀴즈",
    fillBlank: "빈칸 채우기",
    listeningQuiz: "듣기 퀴즈",
    pronunciationQuiz: "발음 퀴즈",
    sentenceConstruction: "문장 구성",

    // 섹션 제목
    activitySummary: "활동 현황 요약",
    learningGoals: "학습 목표",
    recentActivity: "최근 활동",
    weeklyActivity: "주간 학습 활동",
    categoryProgress: "카테고리별 진도",

    // 모달 상세 정보
    totalQuizzes: "총 퀴즈 수",
    totalQuestions: "총 문제 수",
    correctAnswers: "정답 수",
    averageScore: "평균 점수",
    bestScore: "최고 점수",
    gameAchievements: "게임 성취도",

    // ... 기존 progressTranslations 객체 내에 아래 키들을 각 언어별로 추가 ...
    masteryProgress: "마스터 진행률",
    inProgress: "학습중",
    mastered: "마스터",
    completed: "완료",
    criteria: "기준",
    masteryProgressAll: "전체 마스터 진행률",
    list: "목록",
    congratsMastered: "훌륭합니다! {n}개 개념을 마스터했어요!",
    encourageFirstMaster:
      "아직 마스터한 개념이 없습니다.\n정확도 80% 이상으로 학습해보세요!",
    quiz: "퀴즈",
    incorrectAnswers: "오답",
    accuracyRate: "정확률",
    streakDetails: "연속 학습 상세 정보",
    recentStudyHistory: "최근 학습 기록",
    studyCompleted: "학습 완료!",
    totalLearningSessions: "총 학습 세션",
    learningEfficiency: "학습 효율",
    score: "점수",
    learningActivitySummary: "학습 활동 요약",
    totalStudyTime: "총 학습 시간",
    averageAccuracy: "평균 정확도",
    streakEncourage: "연속 학습을 유지하려면 매일 꾸준히 학습하세요!",
    streakTitle: "연속 학습",
    today: "오늘",
  },
  en: {
    // 필터 및 UI
    targetLanguage: "Target Language",
    english: "English",
    korean: "Korean",
    japanese: "Japanese",
    chinese: "Chinese",

    // 활동 현황
    totalWords: "Total Words",
    masteredWords: "Mastered Words",
    studyStreak: "Study Streak",
    quizAccuracy: "Quiz Accuracy",

    // 시간 표시
    justNow: "just now",
    minutesAgo: "minutes ago",
    hoursAgo: "hours ago",
    daysAgo: "days ago",
    day: "day",

    // 모달
    quizAccuracyDetails: "Quiz Accuracy Details",
    totalQuizzes: "Total Quizzes",
    totalQuestions: "Total Questions",
    correctAnswers: "Correct Answers",
    accuracy: "Accuracy",
    averageScore: "Average Score",
    bestScore: "Best Score",

    // 차트
    learning: "Learning",
    games: "Games",
    quizzes: "Quizzes",
    categoryInfoNone: "No category information",

    // 활동 타입
    vocabularyFlashcard: "Vocabulary Flashcard",
    vocabularyTyping: "Vocabulary Typing",
    wordTranslation: "Word Translation",
    wordScramble: "Word Scramble",
    wordMatching: "Word Matching",
    memoryCard: "Memory Card",
    memoryGame: "Memory Game",
    speedQuiz: "Speed Quiz",
    crossword: "Crossword",
    hangman: "Hangman",
    learningActivity: "Learning Activity",
    learningGame: "Learning Game",

    // 학습 효율/점수
    learningEfficiency: "Learning Efficiency",
    score: "Score",

    // 기타
    noLearningRecords: "No learning records yet.",
    times: "times",
    points: "pts",
    percent: "%",
    concepts: "",
    minutes: "min",
    hours: "hrs",

    // 학습 영역
    vocabulary: "Vocabulary",
    reading: "Reading",
    listening: "Listening",
    speaking: "Speaking",
    writing: "Writing",
    grammar: "Grammar",
    conversation: "Conversation",

    // 카드 타입
    flashcard: "Flashcard",
    typing: "Typing",
    quiz: "Quiz",
    game: "Game",

    // 퀴즈 타입
    translation: "Word Translation",
    multiple_choice: "Multiple Choice",
    true_false: "True/False",

    // 학습 타입
    exampleLearning: "Example Learning",
    sentenceLearning: "Sentence Learning",
    pronunciationLearning: "Pronunciation Learning",
    definitionLearning: "Definition Learning",
    learning: "Learning",

    // 퀴즈 상세 타입
    multipleChoiceQuiz: "Multiple Choice Quiz",
    fillBlank: "Fill in the Blank",
    listeningQuiz: "Listening Quiz",
    pronunciationQuiz: "Pronunciation Quiz",
    sentenceConstruction: "Sentence Construction",

    // 섹션 제목
    activitySummary: "Activity Summary",
    learningGoals: "Learning Goals",
    recentActivity: "Recent Activity",
    weeklyActivity: "Weekly Learning Activity",
    categoryProgress: "Domain Progress",

    // 모달 상세 정보
    totalQuizzes: "Total Quizzes",
    totalQuestions: "Total Questions",
    correctAnswers: "Correct Answers",
    averageScore: "Average Score",
    bestScore: "Best Score",
    gameAchievements: "Game Achievements",

    // ... 기존 progressTranslations 객체 내에 아래 키들을 각 언어별로 추가 ...
    masteryProgress: "Mastery Progress",
    inProgress: "In Progress",
    mastered: "Mastered",
    completed: "Completed",
    criteria: "Criteria",
    masteryProgressAll: "Total Mastery Progress",
    list: "List",
    congratsMastered: "Great job! You mastered {n} concepts!",
    encourageFirstMaster:
      "No mastered concepts yet.\nTry to reach 80% accuracy!",
    quiz: "Quiz",
    incorrectAnswers: "Incorrect",
    accuracyRate: "Accuracy Rate",
    streakDetails: "Study Streak Details",
    recentStudyHistory: "Recent Study History",
    studyCompleted: "Study Completed!",
    totalLearningSessions: "Total Learning Sessions",
    learningEfficiency: "Learning Efficiency",
    score: "Score",
    learningActivitySummary: "Learning Activity Summary",
    totalStudyTime: "Total Study Time",
    averageAccuracy: "Average Accuracy",
    streakEncourage: "Keep your streak by studying every day!",
    streakTitle: "Study Streak",
    today: "Today",
  },
  ja: {
    // 필터 및 UI
    targetLanguage: "ターゲット言語",
    english: "英語",
    korean: "韓国語",
    japanese: "日本語",
    chinese: "中国語",

    // 활동 현황
    totalWords: "総単語数",
    masteredWords: "マスターした単語",
    studyStreak: "連続学習",
    quizAccuracy: "クイズ正確度",

    // 시간 표시
    justNow: "たった今",
    minutesAgo: "分前",
    hoursAgo: "時間前",
    daysAgo: "日前",
    day: "日",

    // 모달
    quizAccuracyDetails: "クイズ正確度詳細",
    totalQuizzes: "総クイズ数",
    totalQuestions: "総問題数",
    correctAnswers: "正答数",
    accuracy: "正確度",
    averageScore: "平均スコア",
    bestScore: "最高スコア",

    // 차트
    learning: "学習",
    games: "ゲーム",
    quizzes: "クイズ",
    categoryInfoNone: "カテゴリ情報なし",

    // 활동 타입
    vocabularyFlashcard: "単語フラッシュカード",
    vocabularyTyping: "単語タイピング",
    wordTranslation: "単語翻訳",
    wordScramble: "単語並び替え",
    wordMatching: "単語マッチング",
    memoryCard: "メモリーカード",
    memoryGame: "メモリーゲーム",
    speedQuiz: "スピードクイズ",
    crossword: "クロスワード",
    hangman: "ハングマン",
    learningActivity: "学習活動",
    learningGame: "学習ゲーム",

    // 학습 효율/점수
    learningEfficiency: "学習効率",
    score: "スコア",

    // 기타
    noLearningRecords: "まだ学習記録がありません。",
    times: "回",
    points: "点",
    percent: "%",
    concepts: "個",
    minutes: "分",
    hours: "時間",

    // 퀴즈 정확도 카드
    quizAccuracy: "クイズ正確度",

    // 학습 영역
    vocabulary: "単語",
    reading: "読解",
    listening: "リスニング",
    speaking: "スピーキング",
    writing: "ライティング",
    grammar: "文法",
    conversation: "会話",

    // 카드 타입
    flashcard: "フラッシュカード",
    typing: "タイピング",
    quiz: "クイズ",
    game: "ゲーム",

    // 퀴즈 타입
    translation: "単語翻訳",
    multiple_choice: "選択問題",
    true_false: "○×クイズ",

    // 학습 타입
    exampleLearning: "例文学習",
    sentenceLearning: "文章学習",
    pronunciationLearning: "発音学習",
    definitionLearning: "定義学習",
    learning: "学習",

    // 퀴즈 상세 타입
    multipleChoiceQuiz: "選択問題クイズ",
    fillBlank: "空欄補充",
    listeningQuiz: "リスニングクイズ",
    pronunciationQuiz: "発音クイズ",
    sentenceConstruction: "文章構成",

    // 섹션 제목
    activitySummary: "活動現況要約",
    learningGoals: "学習目標",
    recentActivity: "最近の活動",
    weeklyActivity: "週間学習活動",
    categoryProgress: "カテゴリ別進度",

    // 모달 상세 정보
    totalQuizzes: "総クイズ数",
    totalQuestions: "総問題数",
    correctAnswers: "正答数",
    averageScore: "平均スコア",
    bestScore: "最高スコア",
    gameAchievements: "ゲーム成果",

    // ... 기존 progressTranslations 객체 내에 아래 키들을 각 언어별로 추가 ...
    masteryProgress: "マスター進捗率",
    inProgress: "学習中",
    mastered: "マスター",
    completed: "完了",
    criteria: "基準",
    masteryProgressAll: "全体マスター進捗率",
    list: "リスト",
    congratsMastered: "素晴らしい！{n}個の概念をマスターしました！",
    encourageFirstMaster:
      "まだマスターした概念がありません。\n正確度80%以上を目指しましょう！",
    quiz: "クイズ",
    incorrectAnswers: "不正解",
    accuracyRate: "正答率",
    streakDetails: "連続学習詳細情報",
    recentStudyHistory: "最近の学習記録",
    studyCompleted: "学習完了！",
    totalLearningSessions: "総学習セッション数",
    learningEfficiency: "学習効率",
    score: "スコア",
    learningActivitySummary: "学習活動サマリー",
    totalStudyTime: "総学習時間",
    averageAccuracy: "平均正確度",
    streakEncourage: "連続学習を維持するには毎日学習しましょう！",
    streakTitle: "連続学習",
    today: "今日",
  },
  zh: {
    // 필터 및 UI
    targetLanguage: "目标语言",
    english: "英语",
    korean: "韩语",
    japanese: "日语",
    chinese: "中文",

    // 활동 현황
    totalWords: "总单词数",
    masteredWords: "已掌握单词",
    studyStreak: "连续学习",
    quizAccuracy: "测验准确率",

    // 시간 표시
    justNow: "刚刚",
    minutesAgo: "分钟前",
    hoursAgo: "小时前",
    daysAgo: "天前",
    day: "天",

    // 모달
    quizAccuracyDetails: "测验准确率详情",
    totalQuizzes: "总测验数",
    totalQuestions: "总题目数",
    correctAnswers: "正确答案数",
    accuracy: "准确率",
    averageScore: "平均分数",
    bestScore: "最高分数",

    // 차트
    learning: "学习",
    games: "游戏",
    quizzes: "测验",
    categoryInfoNone: "无分类信息",

    // 활동 타입
    vocabularyFlashcard: "单词闪卡",
    vocabularyTyping: "单词打字",
    wordTranslation: "单词翻译",
    wordScramble: "单词排序",
    wordMatching: "单词匹配",
    memoryCard: "记忆卡",
    memoryGame: "记忆游戏",
    speedQuiz: "快速测验",
    crossword: "填字游戏",
    hangman: "猜字游戏",
    learningActivity: "学习活动",
    learningGame: "学习游戏",

    // 학습 효율/점수
    learningEfficiency: "学习效率",
    score: "分数",

    // 기타
    noLearningRecords: "暂无学习记录。",
    times: "次",
    points: "分",
    percent: "%",
    concepts: "个",
    minutes: "分钟",
    hours: "小时",

    // 퀴즈 정확도 카드
    quizAccuracy: "测验准确率",

    // 학습 영역
    vocabulary: "词汇",
    reading: "阅读",
    listening: "听力",
    speaking: "口语",
    writing: "写作",
    grammar: "语法",
    conversation: "对话",

    // 카드 타입
    flashcard: "闪卡",
    typing: "打字",
    quiz: "测验",
    game: "游戏",

    // 퀴즈 타입
    translation: "单词翻译",
    multiple_choice: "选择题",
    true_false: "判断题",

    // 학습 타입
    exampleLearning: "例句学习",
    sentenceLearning: "句子学习",
    pronunciationLearning: "发音学习",
    definitionLearning: "定义学习",
    learning: "学习",

    // 퀴즈 상세 타입
    multipleChoiceQuiz: "选择题测验",
    fillBlank: "填空题",
    listeningQuiz: "听力测验",
    pronunciationQuiz: "发音测验",
    sentenceConstruction: "句子构成",

    // 섹션 제목
    activitySummary: "活动现状总结",
    learningGoals: "学习目标",
    recentActivity: "最近活动",
    weeklyActivity: "周间学习活动",
    categoryProgress: "分类别进度",

    // 모달 상세 정보
    totalQuizzes: "总测验数",
    totalQuestions: "总题目数",
    correctAnswers: "正确答案数",
    averageScore: "平均分数",
    bestScore: "最高分数",
    gameAchievements: "游戏成果",

    // ... 기존 progressTranslations 객체 내에 아래 키들을 각 언어별로 추가 ...
    masteryProgress: "掌握进度",
    inProgress: "学习中",
    mastered: "掌握",
    completed: "完成",
    criteria: "标准",
    masteryProgressAll: "整体掌握进度",
    list: "列表",
    congratsMastered: "太棒了！你已掌握{n}个概念！",
    encourageFirstMaster: "还没有掌握的概念。\n请努力达到80%的准确率！",
    quiz: "测验",
    incorrectAnswers: "错误",
    accuracyRate: "准确率",
    streakDetails: "连续学习详细信息",
    recentStudyHistory: "最近学习记录",
    studyCompleted: "学习完成！",
    totalLearningSessions: "总学习会话",
    learningEfficiency: "学习效率",
    score: "分数",
    learningActivitySummary: "学习活动摘要",
    totalStudyTime: "总学习时间",
    averageAccuracy: "平均准确率",
    streakEncourage: "要保持连续学习，请每天坚持学习！",
    streakTitle: "连续学习",
    today: "今天",
  },
};

// 현재 언어 가져오기 함수
function getCurrentProgressLanguage() {
  // URL에서 언어 추출
  const pathLanguage = window.location.pathname.match(/\/locales\/(\w+)\//);
  if (pathLanguage) {
    return pathLanguage[1];
  }

  // 시스템 언어 기본값
  const systemLang = navigator.language || navigator.userLanguage;
  if (systemLang.startsWith("ko")) return "ko";
  if (systemLang.startsWith("ja")) return "ja";
  if (systemLang.startsWith("zh")) return "zh";
  return "en"; // 기본값
}

// 번역 텍스트 가져오기 함수
function getProgressText(key) {
  const currentLang = getCurrentProgressLanguage();
  return (
    progressTranslations[currentLang]?.[key] ||
    progressTranslations["en"][key] ||
    key
  );
}

// 페이지 UI 요소들을 현재 언어로 번역
function updatePageLanguage() {
  try {
    // 언어 필터 옵션 텍스트 업데이트
    const languageFilter = document.getElementById("target-language-filter");
    if (languageFilter) {
      const options = languageFilter.querySelectorAll("option");
      options.forEach((option) => {
        const value = option.value;
        switch (value) {
          case "english":
            option.textContent = getProgressText("english");
            break;
          case "korean":
            option.textContent = getProgressText("korean");
            break;
          case "japanese":
            option.textContent = getProgressText("japanese");
            break;
          case "chinese":
            option.textContent = getProgressText("chinese");
            break;
        }
      });
    }

    // 언어 필터 레이블 업데이트
    const languageLabel = document.querySelector(
      'label[for="target-language-filter"]'
    );
    if (languageLabel) {
      languageLabel.textContent = getProgressText("targetLanguage");
    }

    // 카드 제목들 업데이트
    updateCardTitles();

    // 섹션 제목들 업데이트
    updateSectionTitles();
  } catch (error) {
    console.error("Error updating page language:", error);
  }
}

// 카드 제목 업데이트
function updateCardTitles() {
  // ID나 클래스로 직접 찾는 방법이 더 안전함
  // 총 단어수 카드
  const totalWordsCard = document
    .querySelector("#total-words-count")
    ?.closest(".card-container, .bg-gray-800, .p-4");
  if (totalWordsCard) {
    const titleEl = totalWordsCard.querySelector("h3");
    if (titleEl) titleEl.textContent = getProgressText("totalWords");
  }

  // 마스터한 단어 카드
  const masteredWordsCard = document
    .querySelector("#mastered-words-count")
    ?.closest(".card-container, .bg-gray-800, .p-4");
  if (masteredWordsCard) {
    const titleEl = masteredWordsCard.querySelector("h3");
    if (titleEl) titleEl.textContent = getProgressText("masteredWords");
  }

  // 연속 학습 카드
  const studyStreakCard = document
    .querySelector("#study-streak-count")
    ?.closest(".card-container, .bg-gray-800, .p-4");
  if (studyStreakCard) {
    const titleEl = studyStreakCard.querySelector("h3");
    if (titleEl) titleEl.textContent = getProgressText("studyStreak");
  }

  // 퀴즈 정확도 카드
  const quizAccuracyCard = document
    .querySelector("#quiz-accuracy-rate")
    ?.closest(".card-container, .bg-gray-800, .p-4");
  if (quizAccuracyCard) {
    const titleEl = quizAccuracyCard.querySelector("h3");
    if (titleEl) titleEl.textContent = getProgressText("quizAccuracy");
  }

  // Game Achievements 카드 제목도 번역
  const gameAchievementsCard = document
    .querySelector("#total-games-count")
    ?.closest(".card-container, .bg-gray-800, .p-4");
  if (gameAchievementsCard) {
    const titleEl = gameAchievementsCard.querySelector("h3");
    if (titleEl) titleEl.textContent = getProgressText("gameAchievements");
  }
}

// 섹션 제목 업데이트
function updateSectionTitles() {
  // 활동 현황 요약 섹션
  const activitySummaryTitle = document.querySelector("h2");
  if (
    activitySummaryTitle &&
    activitySummaryTitle.textContent.includes("활동 현황 요약")
  ) {
    activitySummaryTitle.textContent = getProgressText("activitySummary");
  }

  // 학습 목표 섹션
  const allH2Elements = document.querySelectorAll("h2, h3, span");
  allH2Elements.forEach((el) => {
    if (
      el.textContent.includes("카테고리별 진도") ||
      el.textContent.includes("Category Progress") ||
      el.textContent.includes("カテゴリ別進度") ||
      el.textContent.includes("分类别进度")
    ) {
      el.textContent = getProgressText("categoryProgress");
    }
    // 기존 조건 유지
    if (el.textContent.includes("학습 목표")) {
      el.textContent = getProgressText("learningGoals");
    } else if (el.textContent.includes("최근 활동")) {
      el.textContent = getProgressText("recentActivity");
    } else if (el.textContent.includes("주간 학습 활동")) {
      el.textContent = getProgressText("weeklyActivity");
    }
  });
}

// ============ END TRANSLATIONS ============

document.addEventListener("DOMContentLoaded", async function () {
  // 페이지 로드 시 UI 번역 적용
  updatePageLanguage();

  // 초기 데이터 로드
  console.log("Progress page initializing...");

  // Wait for Firebase to be ready
  await waitForFirebase();

  // Wait for Firebase auth to be ready
  if (typeof auth === "undefined") {
    console.error("Firebase auth not available");
    return;
  }

  auth.onAuthStateChanged(async (user) => {
    if (user) {
      currentUser = user;
      console.log("User authenticated:", currentUser.email);
      await loadProgressData();
      loadLanguageSettings();
      updateUI(true); // 초기 로드 시 강제 새로고침
    } else {
      console.log("User not authenticated, redirecting to login");
      window.location.href = "/login.html";
    }
  });

  setupEventListeners();
});

// Wait for Firebase to be fully initialized
async function waitForFirebase() {
  let attempts = 0;
  while (attempts < 50) {
    // Wait up to 5 seconds
    if (
      window.firebaseInit &&
      window.firebaseInit.db &&
      window.firebaseInit.collection &&
      window.firebaseInit.query &&
      window.firebaseInit.where &&
      window.firebaseInit.getDocs &&
      window.firebaseInit.doc &&
      window.firebaseInit.getDoc &&
      window.firebaseInit.setDoc &&
      window.firebaseInit.updateDoc &&
      window.firebaseInit.addDoc
    ) {
      console.log("✅ Firebase functions are ready");
      return true;
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
    attempts++;
  }
  console.error("❌ Firebase functions not available after waiting");
  console.log(
    "Available window properties:",
    Object.keys(window).filter(
      (k) => k.includes("firebase") || k.includes("db") || k.includes("auth")
    )
  );
  console.log("window.firebaseInit:", window.firebaseInit);
  return false;
}

// Load language settings from storage
function loadLanguageSettings() {
  const savedLanguage = sessionStorage.getItem("selectedTargetLanguage");
  if (savedLanguage) {
    selectedTargetLanguage = savedLanguage;
  } else {
    // 기본값은 영어로 설정
    selectedTargetLanguage = "english";
  }

  // UI 선택기도 업데이트 (올바른 ID 사용)
  const selector = document.getElementById("target-language-filter");
  if (selector) {
    selector.value = selectedTargetLanguage;
    console.log("Language selector set to:", selectedTargetLanguage);
  }

  console.log("Language settings loaded:", selectedTargetLanguage);
}

// Save language settings to storage
function saveLanguageSettings() {
  sessionStorage.setItem("selectedTargetLanguage", selectedTargetLanguage);
  console.log("Language settings saved:", selectedTargetLanguage);
}

// Setup event listeners
function setupEventListeners() {
  // 대상 언어 선택기 이벤트 리스너 (올바른 ID 사용)
  const targetLanguageSelector = document.getElementById(
    "target-language-filter"
  );
  if (targetLanguageSelector) {
    targetLanguageSelector.addEventListener("change", async function () {
      selectedTargetLanguage = this.value;
      saveLanguageSettings();
      console.log("Target language changed to:", selectedTargetLanguage);
      // 언어 변경 시 캐시 무효화
      cachedStats = null;
      lastStatsUpdate = null;
      cachedConceptData = null;
      lastConceptUpdate = null;
      updateUI();
    });
  }

  // Apply 버튼도 같은 기능
  const applyButton = document.getElementById("apply-language-filter");
  if (applyButton) {
    applyButton.addEventListener("click", function () {
      const selector = document.getElementById("target-language-filter");
      if (selector) {
        selectedTargetLanguage = selector.value;
        console.log("Language applied:", selectedTargetLanguage);
        saveLanguageSettings();
        // 언어 변경 시 캐시 무효화
        cachedStats = null;
        lastStatsUpdate = null;
        updateUI();
      }
    });
  }

  // 카드 클릭 이벤트 리스너들
  const totalWordsCard = document.getElementById("total-words-card");
  if (totalWordsCard) {
    totalWordsCard.addEventListener("click", showTotalWordsDetails);
  }

  const masteredWordsCard = document.getElementById("mastered-words-card");
  if (masteredWordsCard) {
    masteredWordsCard.addEventListener("click", showMasteredWordsDetails);
  }

  const studyStreakCard = document.getElementById("study-streak-card");
  if (studyStreakCard) {
    studyStreakCard.addEventListener("click", showStudyStreakDetails);
  }

  const totalGamesCard = document.getElementById("total-games-card");
  if (totalGamesCard) {
    totalGamesCard.addEventListener("click", showGameAchievementsDetails);
  }

  // 퀴즈 정확도 카드 클릭 이벤트 추가
  const quizAccuracyCard = document.getElementById("quiz-accuracy-card");
  if (quizAccuracyCard) {
    quizAccuracyCard.addEventListener("click", showQuizAccuracyDetails);
  }

  // 모달 배경 클릭 시 닫기
  const totalWordsModal = document.getElementById("totalWordsModal");
  if (totalWordsModal) {
    totalWordsModal.addEventListener("click", function (e) {
      if (e.target === totalWordsModal) {
        closeTotalWordsModal();
      }
    });
  }

  // ESC 키로 모달 닫기
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      closeTotalWordsModal();
    }
  });

  // 윈도우 리사이즈 이벤트 추가 (차트 반응형 처리)
  window.addEventListener("resize", function () {
    // 주간 활동 차트 반응형 업데이트
    if (window.weeklyActivityChart) {
      window.weeklyActivityChart.options.plugins.legend.labels.boxWidth =
        window.innerWidth < 768 ? 8 : 12;
      window.weeklyActivityChart.options.plugins.legend.labels.padding =
        window.innerWidth < 768 ? 8 : 15;
      window.weeklyActivityChart.options.plugins.legend.labels.font.size =
        window.innerWidth < 768 ? 10 : 12;
      window.weeklyActivityChart.update();
    }

    // 카테고리 진도 차트 반응형 업데이트
    if (window.categoryProgressChart) {
      window.categoryProgressChart.options.plugins.legend.position =
        window.innerWidth < 768 ? "bottom" : "right";
      window.categoryProgressChart.update();
    }
  });
}

// Load all progress data from Firebase collections
async function loadProgressData() {
  if (!currentUser) {
    console.log("No current user, cannot load progress data");
    return;
  }

  console.log("Loading progress data for user:", currentUser.email);

  try {
    // Check if Firebase functions are available
    if (
      !window.firebaseInit ||
      !window.firebaseInit.query ||
      !window.firebaseInit.collection ||
      !window.firebaseInit.getDocs ||
      !window.firebaseInit.where
    ) {
      console.error("Firebase functions not available");
      await waitForFirebase(); // Try to wait for Firebase again
      if (
        !window.firebaseInit ||
        !window.firebaseInit.query ||
        !window.firebaseInit.collection ||
        !window.firebaseInit.getDocs ||
        !window.firebaseInit.where
      ) {
        console.error("Firebase functions still not available after waiting");
        return;
      }
    }

    const {
      query,
      where,
      collection,
      getDocs,
      doc,
      getDoc,
      setDoc,
      updateDoc,
      addDoc,
      db,
    } = window.firebaseInit;

    // Load learning records (user_email only)
    const learningQuery = query(
      collection(db, "learning_records"),
      where("user_email", "==", currentUser.email)
    );
    const learningSnapshot = await getDocs(learningQuery);
    allLearningRecords = learningSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Load game records (user_email only)
    const gameQuery = query(
      collection(db, "game_records"),
      where("user_email", "==", currentUser.email)
    );
    const gameSnapshot = await getDocs(gameQuery);
    allGameRecords = gameSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Load quiz records (user_email only)
    const quizQuery = query(
      collection(db, "quiz_records"),
      where("user_email", "==", currentUser.email)
    );
    const quizSnapshot = await getDocs(quizQuery);
    allQuizRecords = quizSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log("Progress data loaded:", {
      learning: allLearningRecords.length,
      games: allGameRecords.length,
      quizzes: allQuizRecords.length,
    });

    // Debug: Show first record structure (only once)
    if (allLearningRecords.length > 0) {
      console.log("📚 Learning record structure:", {
        id: allLearningRecords[0].id,
        concept_count: allLearningRecords[0].concept_id?.length || 0,
        session_quality: allLearningRecords[0].session_quality,
        accuracy: allLearningRecords[0].accuracy,
        language_pair: allLearningRecords[0].language_pair,
      });
    }

    if (allGameRecords.length > 0) {
      console.log("🎮 Game record structure:", {
        id: allGameRecords[0].id,
        score: allGameRecords[0].score,
        targetLanguage: allGameRecords[0].targetLanguage,
        correct_answers: allGameRecords[0].correct_answers,
      });
    }

    if (allQuizRecords.length > 0) {
      console.log("🎯 Quiz record structure:", {
        id: allQuizRecords[0].id,
        accuracy: allQuizRecords[0].accuracy,
        score: allQuizRecords[0].score,
        correct_answers: allQuizRecords[0].correct_answers,
        total_questions: allQuizRecords[0].total_questions,
      });
    }

    // Initialize new target language structure in user_records
    await initializeTargetLanguageStructure();
  } catch (error) {
    console.error("Error loading progress data:", error);
  }
}

// Initialize target language structure in user_records (replace old migration)
async function initializeTargetLanguageStructure() {
  if (!currentUser) return;

  try {
    const { doc, getDoc, setDoc, db } = window.firebaseInit;
    const userRecordRef = doc(db, "user_records", currentUser.email);

    // 기존 데이터 확인
    const existingDoc = await getDoc(userRecordRef);
    let existingData = {};
    if (existingDoc.exists()) {
      existingData = existingDoc.data();
    }

    // 실제 활동이 있는 언어만 찾기
    const activeLanguages = new Set();

    // 학습 기록에서 언어 추출
    allLearningRecords.forEach((record) => {
      if (record.targetLanguage) activeLanguages.add(record.targetLanguage);
      if (record.language_pair?.target)
        activeLanguages.add(record.language_pair.target);
      if (record.metadata?.targetLanguage)
        activeLanguages.add(record.metadata.targetLanguage);
    });

    // 게임 기록에서 언어 추출
    allGameRecords.forEach((record) => {
      if (record.targetLanguage) activeLanguages.add(record.targetLanguage);
      if (record.language_pair?.target)
        activeLanguages.add(record.language_pair.target);
      if (record.metadata?.targetLanguage)
        activeLanguages.add(record.metadata.targetLanguage);
    });

    // 퀴즈 기록에서 언어 추출
    allQuizRecords.forEach((record) => {
      if (record.targetLanguage) activeLanguages.add(record.targetLanguage);
      if (record.language_pair?.target)
        activeLanguages.add(record.language_pair.target);
      if (record.metadata?.targetLanguage)
        activeLanguages.add(record.metadata.targetLanguage);
    });

    console.log("🎯 활성 대상 언어들:", Array.from(activeLanguages));

    const updateData = {
      version: "3.0", // 새로운 구조 버전
      created_at: existingData.created_at || new Date(),
      last_updated: new Date(),
      target_languages: existingData.target_languages || {},
      // 기존 concept_snapshots 보존
      concept_snapshots: existingData.concept_snapshots || {},
    };

    // 실제 활동이 있는 언어만 생성/업데이트
    for (const lang of activeLanguages) {
      const langStats = calculateCompleteStatsForTargetLanguage(lang);
      updateData.target_languages[lang] = {
        ...langStats,
        last_updated: new Date(),
      };
      console.log(`✅ ${lang} 언어 통계 생성됨:`, langStats);
    }

    // 기존 concept_snapshots 보존하면서 업데이트
    await setDoc(userRecordRef, updateData);
    console.log(
      "✅ Active target language structure saved to user_records (concept_snapshots 보존)"
    );
    console.log("📊 Saved structure:", updateData);

    // Load the created structure
    const updatedSnap = await getDoc(userRecordRef);
    if (updatedSnap.exists()) {
      userProgressData = updatedSnap.data();
      console.log("✅ User progress data loaded:", userProgressData);
    }
  } catch (error) {
    console.error("Error initializing target language structure:", error);
  }
}

// Calculate complete statistics structure for target language
function calculateCompleteStatsForTargetLanguage(targetLanguage) {
  const learningRecords = allLearningRecords.filter(
    (record) =>
      record.targetLanguage === targetLanguage ||
      (record.languagePair &&
        record.languagePair.includes &&
        record.languagePair.includes(targetLanguage)) ||
      (record.language_pair &&
        record.language_pair.target === targetLanguage) ||
      (record.language_pair &&
        record.language_pair.includes &&
        record.language_pair.includes(targetLanguage)) ||
      // metadata에서도 확인
      (record.metadata && record.metadata.targetLanguage === targetLanguage) ||
      // activity_type이 vocabulary이고 english 언어인 경우를 기본으로 포함
      (record.activity_type === "vocabulary" && targetLanguage === "english")
  );

  const gameRecords = allGameRecords.filter(
    (record) =>
      record.targetLanguage === targetLanguage ||
      (record.languagePair &&
        record.languagePair.includes &&
        record.languagePair.includes(targetLanguage)) ||
      (record.language_pair &&
        record.language_pair.target === targetLanguage) ||
      (record.language_pair &&
        record.language_pair.includes &&
        record.language_pair.includes(targetLanguage)) ||
      (record.metadata && record.metadata.targetLanguage === targetLanguage) ||
      // game_type이 word-matching이고 english인 경우 포함
      (record.game_type === "word-matching" && targetLanguage === "english")
  );

  const quizRecords = allQuizRecords.filter(
    (record) =>
      record.targetLanguage === targetLanguage ||
      (record.languagePair &&
        record.languagePair.includes &&
        record.languagePair.includes(targetLanguage)) ||
      (record.language_pair &&
        record.language_pair.target === targetLanguage) ||
      (record.metadata && record.metadata.targetLanguage === targetLanguage) ||
      // quiz_type이 translation이고 english인 경우 포함
      (record.quiz_type === "translation" && targetLanguage === "english")
  );

  // 마스터한 개념 추출
  const conceptsMap = new Map();
  learningRecords.forEach((record) => {
    // concept_id가 배열인 경우 각각 처리
    let conceptIds = [];

    if (Array.isArray(record.concept_id)) {
      conceptIds = record.concept_id;
    } else if (record.concept_id) {
      conceptIds = [record.concept_id];
    } else if (record.conceptId) {
      conceptIds = Array.isArray(record.conceptId)
        ? record.conceptId
        : [record.conceptId];
    }

    // 각 개념에 대해 처리
    conceptIds.forEach((conceptId) => {
      if (conceptId) {
        const existing = conceptsMap.get(conceptId);

        // 더 포괄적인 정확도 필드 확인
        const currentAccuracy =
          record.accuracy ||
          record.success_rate ||
          record.performance ||
          record.score ||
          record.session_quality ||
          record.completion_rate ||
          record.average_performance ||
          record.learning_efficiency ||
          record.comprehension_rate ||
          // concepts_studied 기반 계산
          (record.concepts_studied
            ? Math.min(85, record.concepts_studied * 20)
            : 0);

        const existingAccuracy = existing
          ? existing.accuracy ||
            existing.success_rate ||
            existing.performance ||
            existing.score ||
            existing.session_quality ||
            existing.completion_rate ||
            existing.average_performance ||
            existing.learning_efficiency ||
            existing.comprehension_rate ||
            (existing.concepts_studied
              ? Math.min(85, existing.concepts_studied * 20)
              : 0)
          : 0;

        if (!existing || currentAccuracy > existingAccuracy) {
          conceptsMap.set(conceptId, record);
        }
      }
    });
  });

  const masteredConcepts = Array.from(conceptsMap.values())
    .filter((r) => {
      // 더 포괄적인 정확도 계산으로 마스터 여부 판단
      const accuracy =
        r.accuracy ||
        r.success_rate ||
        r.performance ||
        r.score ||
        r.session_quality ||
        r.completion_rate ||
        r.average_performance ||
        r.learning_efficiency ||
        r.comprehension_rate ||
        // concepts_studied 기반 계산
        (r.concepts_studied ? Math.min(85, r.concepts_studied * 20) : 0);
      // 70% 이상이면 마스터로 판정
      return accuracy >= 70;
    })
    .map((r) => {
      // 대표 conceptId 선택 (배열인 경우 첫 번째 요소)
      let conceptId;
      if (Array.isArray(r.concept_id)) {
        conceptId = r.concept_id[0];
      } else if (r.concept_id) {
        conceptId = r.concept_id;
      } else if (Array.isArray(r.conceptId)) {
        conceptId = r.conceptId[0];
      } else {
        conceptId = r.conceptId;
      }

      return {
        conceptId: conceptId,
        accuracy:
          r.accuracy ||
          r.success_rate ||
          r.performance ||
          r.score ||
          r.session_quality ||
          r.completion_rate ||
          r.average_performance ||
          r.learning_efficiency ||
          r.comprehension_rate ||
          (r.concepts_studied ? Math.min(85, r.concepts_studied * 20) : 0),
        masteredDate: r.timestamp,
      };
    });

  // Learning stats
  const learning_stats = {
    total_sessions: learningRecords.length,
    total_time: learningRecords.reduce(
      (sum, r) => sum + (r.studyTime || r.session_duration || 0),
      0
    ),
    concepts_learned: conceptsMap.size,
    avg_accuracy:
      learningRecords.length > 0
        ? learningRecords.reduce((sum, r) => {
            return (
              sum +
              (r.accuracy ||
                r.success_rate ||
                r.performance ||
                r.score ||
                r.session_quality ||
                r.completion_rate ||
                r.average_performance ||
                r.learning_efficiency ||
                r.comprehension_rate ||
                (r.concepts_studied
                  ? Math.min(85, r.concepts_studied * 20)
                  : 0))
            );
          }, 0) / learningRecords.length
        : 0,
    avg_quality:
      learningRecords.length > 0
        ? learningRecords.reduce(
            (sum, r) =>
              sum +
              (r.session_quality ||
                r.quality ||
                (r.concepts_studied
                  ? Math.min(90, r.concepts_studied * 22)
                  : 0)),
            0
          ) / learningRecords.length
        : 0,
    last_session_date:
      learningRecords.length > 0
        ? learningRecords.sort(
            (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
          )[0].timestamp
        : null,
  };

  // Game stats
  const game_stats = {
    total_games: gameRecords.length,
    total_time: gameRecords.reduce(
      (sum, r) =>
        sum + (r.timeTaken || r.timeSpent || r.time_spent || r.duration || 0),
      0
    ),
    avg_score:
      gameRecords.length > 0
        ? gameRecords.reduce(
            (sum, r) => sum + (r.score || r.correct_answers || r.points || 0),
            0
          ) / gameRecords.length
        : 0,
    best_score:
      gameRecords.length > 0
        ? Math.max(
            ...gameRecords.map(
              (r) => r.score || r.correct_answers || r.points || 0
            )
          )
        : 0,
    last_game_date:
      gameRecords.length > 0
        ? gameRecords.sort(
            (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
          )[0].timestamp
        : null,
  };

  // Quiz stats
  const quiz_stats = {
    total_quizzes: quizRecords.length,
    total_questions: quizRecords.reduce(
      (sum, r) => sum + (r.totalQuestions || r.total_questions || 0),
      0
    ),
    correct_answers: quizRecords.reduce(
      (sum, r) => sum + (r.correctAnswers || r.correct_answers || 0),
      0
    ),
    avg_accuracy: 0,
    best_accuracy: 0,
    total_time: quizRecords.reduce(
      (sum, r) => sum + (r.timeTaken || r.time_taken || r.duration || 0),
      0
    ),
    avg_time_per_quiz:
      quizRecords.length > 0
        ? quizRecords.reduce(
            (sum, r) => sum + (r.timeTaken || r.time_taken || r.duration || 0),
            0
          ) / quizRecords.length
        : 0,
    best_score:
      quizRecords.length > 0
        ? Math.max(...quizRecords.map((r) => r.score || r.accuracy || 0))
        : 0,
    recent_scores: quizRecords
      .slice(0, 10)
      .map((r) => r.score || r.accuracy || 0),
  };

  // Calculate quiz accuracy
  if (quiz_stats.total_questions > 0) {
    quiz_stats.avg_accuracy =
      (quiz_stats.correct_answers / quiz_stats.total_questions) * 100;
  }

  // Calculate best accuracy from individual quiz records
  const quizAccuracies = quizRecords
    .filter((r) => (r.totalQuestions || r.total_questions) > 0)
    .map((r) => {
      const totalQ = r.totalQuestions || r.total_questions || 0;
      const correctA = r.correctAnswers || r.correct_answers || 0;
      return totalQ > 0 ? (correctA / totalQ) * 100 : r.accuracy || 0;
    });
  if (quizAccuracies.length > 0) {
    quiz_stats.best_accuracy = Math.max(...quizAccuracies);
  }

  // Overall stats
  const stats = {
    learning_accuracy: learning_stats.avg_accuracy,
    total_learning_time: learning_stats.total_time,
    last_activity: null,
  };

  // Find last activity
  const allActivities = [...learningRecords, ...gameRecords, ...quizRecords];
  if (allActivities.length > 0) {
    const sortedActivities = allActivities.sort(
      (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
    );
    stats.last_activity = sortedActivities[0].timestamp;
  }

  return {
    learning_stats,
    game_stats,
    quiz_stats,
    stats,
    mastered_concepts: masteredConcepts,
  };
}

// Calculate statistics for target language from activity records
function calculateStatsForTargetLanguage(targetLanguage) {
  const learningRecords = allLearningRecords.filter(
    (record) =>
      record.targetLanguage === targetLanguage ||
      (record.languagePair && record.languagePair.includes(targetLanguage)) ||
      (record.language_pair &&
        record.language_pair.target === targetLanguage) ||
      (record.language_pair &&
        record.language_pair.includes &&
        record.language_pair.includes(targetLanguage))
  );

  const gameRecords = allGameRecords.filter(
    (record) =>
      record.targetLanguage === targetLanguage ||
      (record.languagePair && record.languagePair.includes(targetLanguage)) ||
      (record.language_pair &&
        record.language_pair.target === targetLanguage) ||
      (record.language_pair &&
        record.language_pair.includes &&
        record.language_pair.includes(targetLanguage))
  );

  const quizRecords = allQuizRecords.filter(
    (record) =>
      record.targetLanguage === targetLanguage ||
      (record.languagePair && record.languagePair.includes(targetLanguage)) ||
      (record.language_pair && record.language_pair.target === targetLanguage)
  );

  // Debug quiz filtering
  console.log(`📊 Quiz filtering for ${targetLanguage}:`, {
    totalQuizRecords: allQuizRecords.length,
    filteredQuizRecords: quizRecords.length,
    sampleQuizRecord: allQuizRecords[0] || null,
  });

  return {
    learning: {
      total_concepts: learningRecords.length,
      mastered_concepts: learningRecords.filter((r) => (r.accuracy || 0) >= 80)
        .length,
      average_accuracy:
        learningRecords.length > 0
          ? learningRecords.reduce((sum, r) => sum + (r.accuracy || 0), 0) /
            learningRecords.length
          : 0,
      total_study_time: learningRecords.reduce(
        (sum, r) => sum + (r.studyTime || 0),
        0
      ),
    },
    games: {
      total_games: gameRecords.length,
      average_score:
        gameRecords.length > 0
          ? gameRecords.reduce((sum, r) => sum + (r.score || 0), 0) /
            gameRecords.length
          : 0,
      best_score:
        gameRecords.length > 0
          ? Math.max(...gameRecords.map((r) => r.score || 0))
          : 0,
      total_time_played: gameRecords.reduce(
        (sum, r) => sum + (r.timeTaken || 0),
        0
      ),
    },
    quizzes: {
      total_quizzes: quizRecords.length,
      average_score:
        quizRecords.length > 0
          ? quizRecords.reduce((sum, r) => sum + (r.score || 0), 0) /
            quizRecords.length
          : 0,
      best_score:
        quizRecords.length > 0
          ? Math.max(...quizRecords.map((r) => r.score || 0))
          : 0,
      total_correct: quizRecords.reduce(
        (sum, r) => sum + (r.correctAnswers || 0),
        0
      ),
      total_questions: quizRecords.reduce(
        (sum, r) => sum + (r.totalQuestions || 0),
        0
      ),
    },
  };
}

// Calculate statistics for target language (main function for UI)
function calculateTargetLanguageStats(targetLanguage, forceRefresh = false) {
  // 캐시된 데이터가 있고 강제 새로고침이 아니면 캐시 사용
  if (
    cachedStats &&
    !forceRefresh &&
    lastStatsUpdate &&
    Date.now() - lastStatsUpdate < 30000
  ) {
    // 30초 내 캐시 사용
    console.log("📋 캐시된 통계 데이터 사용");
    return cachedStats;
  }

  console.log("🔄 새로운 통계 데이터 계산 시작...");

  // 먼저 user_records에서 저장된 통계를 확인
  let savedStats = null;
  if (
    userProgressData &&
    userProgressData.target_languages &&
    userProgressData.target_languages[targetLanguage]
  ) {
    savedStats = userProgressData.target_languages[targetLanguage];
    console.log(`📊 Found saved stats for ${targetLanguage}:`, savedStats);
  }

  const stats = {
    totalConcepts: 0,
    masteredConcepts: 0,
    averageAccuracy: 0,
    totalStudyTime: 0,
    studyStreak: 0,
    lastStudyDate: null,
    gameStats: {
      totalGames: 0,
      averageScore: 0,
      bestScore: 0,
      totalTimePlayed: 0,
    },
    quizStats: {
      totalQuizzes: 0,
      averageScore: 0,
      bestScore: 0,
      correctAnswers: 0,
      totalQuestions: 0,
    },
    activityHistory: [],
  };

  // user_records의 저장된 통계가 있으면 우선 사용
  if (savedStats) {
    if (savedStats.learning_stats) {
      stats.totalConcepts = savedStats.learning_stats.concepts_learned || 0;
      stats.averageAccuracy = savedStats.learning_stats.avg_accuracy || 0;
      stats.totalStudyTime = savedStats.learning_stats.total_time || 0;
      stats.lastStudyDate = savedStats.learning_stats.last_session_date
        ? savedStats.learning_stats.last_session_date.toDate
          ? savedStats.learning_stats.last_session_date.toDate()
          : new Date(savedStats.learning_stats.last_session_date)
        : null;
    }

    if (savedStats.game_stats) {
      stats.gameStats.totalGames = savedStats.game_stats.total_games || 0;
      stats.gameStats.averageScore = savedStats.game_stats.avg_score || 0;
      stats.gameStats.bestScore = savedStats.game_stats.best_score || 0;
      stats.gameStats.totalTimePlayed = savedStats.game_stats.total_time || 0;
    }

    if (savedStats.quiz_stats) {
      stats.quizStats.totalQuizzes = savedStats.quiz_stats.total_quizzes || 0;
      stats.quizStats.averageScore = savedStats.quiz_stats.avg_accuracy || 0;
      stats.quizStats.bestScore = savedStats.quiz_stats.best_score || 0;
      stats.quizStats.correctAnswers =
        savedStats.quiz_stats.correct_answers || 0;
      stats.quizStats.totalQuestions =
        savedStats.quiz_stats.total_questions || 0;
    }

    if (savedStats.mastered_concepts) {
      stats.masteredConcepts = savedStats.mastered_concepts.length || 0;
    }
  }

  // Filter records for the target language
  const learningRecords = allLearningRecords.filter((record) => {
    // 다양한 언어 필드 확인 - 콘솔에서 targetLanguage가 undefined였으므로 다른 필드들도 확인
    const hasTargetLanguage = record.targetLanguage === targetLanguage;
    const hasLanguagePairIncludes =
      record.languagePair &&
      record.languagePair.includes &&
      record.languagePair.includes(targetLanguage);
    const hasLanguage_pairTarget =
      record.language_pair && record.language_pair.target === targetLanguage;
    const hasLanguage_pairIncludes =
      record.language_pair &&
      record.language_pair.includes &&
      record.language_pair.includes(targetLanguage);
    const hasMetadataTargetLanguage =
      record.metadata && record.metadata.targetLanguage === targetLanguage;
    const hasTarget_language = record.target_language === targetLanguage;

    // activity_type이 vocabulary이고 english 언어인 경우를 기본으로 포함
    const isVocabularyActivity =
      record.activity_type === "vocabulary" && targetLanguage === "english";

    // 더 포용적인 필터링 - 학습 활동이면서 영어 학습인 경우 포함
    return (
      hasTargetLanguage ||
      hasLanguagePairIncludes ||
      hasLanguage_pairTarget ||
      hasLanguage_pairIncludes ||
      hasMetadataTargetLanguage ||
      hasTarget_language ||
      isVocabularyActivity
    );
  });

  // Debug learning filtering
  console.log(`📚 Learning filtering for ${targetLanguage}:`, {
    totalLearningRecords: allLearningRecords.length,
    filteredLearningRecords: learningRecords.length,
    sampleLearningRecord: allLearningRecords[0] || null,
    recordTargetLanguage: allLearningRecords[0]?.targetLanguage,
    recordLanguagePair: allLearningRecords[0]?.languagePair,
    recordLanguage_pair: allLearningRecords[0]?.language_pair,
    recordLanguage_pair_target: allLearningRecords[0]?.language_pair?.target,
    recordMetadata: allLearningRecords[0]?.metadata,
    allRecordKeys: allLearningRecords[0]
      ? Object.keys(allLearningRecords[0])
      : [],
  });

  console.log("📚 Full learning record:", allLearningRecords[0]);

  const gameRecords = allGameRecords.filter((record) => {
    return (
      record.targetLanguage === targetLanguage ||
      (record.languagePair && record.languagePair.includes(targetLanguage)) ||
      (record.language_pair &&
        record.language_pair.target === targetLanguage) ||
      (record.language_pair &&
        record.language_pair.includes &&
        record.language_pair.includes(targetLanguage)) ||
      (record.metadata && record.metadata.targetLanguage === targetLanguage)
    );
  });

  // Debug game filtering
  console.log(`🎮 Game filtering for ${targetLanguage}:`, {
    totalGameRecords: allGameRecords.length,
    filteredGameRecords: gameRecords.length,
    sampleGameRecord: allGameRecords[0] || null,
    gameRecordTargetLanguage: allGameRecords[0]?.targetLanguage,
    gameRecordLanguagePair: allGameRecords[0]?.languagePair,
    gameRecordLanguage_pair: allGameRecords[0]?.language_pair,
    gameRecordLanguage_pair_target: allGameRecords[0]?.language_pair?.target,
    gameRecordMetadata: allGameRecords[0]?.metadata,
    allGameRecordKeys: allGameRecords[0] ? Object.keys(allGameRecords[0]) : [],
  });

  const quizRecords = allQuizRecords.filter((record) => {
    // 퀴즈 기록의 언어 필터링 - metadata에서 확인하거나 기본적으로 english 포함
    const hasTargetLanguage = record.targetLanguage === targetLanguage;
    const hasLanguagePairIncludes =
      record.languagePair && record.languagePair.includes(targetLanguage);
    const hasLanguage_pairTarget =
      record.language_pair && record.language_pair.target === targetLanguage;
    const hasMetadataTargetLanguage =
      record.metadata && record.metadata.targetLanguage === targetLanguage;
    const hasTarget_language = record.target_language === targetLanguage;

    // 퀴즈 타입이 translation이고 english 언어인 경우를 기본으로 포함
    const isTranslationQuiz =
      record.quiz_type === "translation" && targetLanguage === "english";

    return (
      hasTargetLanguage ||
      hasLanguagePairIncludes ||
      hasLanguage_pairTarget ||
      hasMetadataTargetLanguage ||
      hasTarget_language ||
      isTranslationQuiz
    );
  });

  // Debug quiz filtering
  console.log(`❓ Quiz filtering for ${targetLanguage}:`, {
    totalQuizRecords: allQuizRecords.length,
    filteredQuizRecords: quizRecords.length,
    sampleQuizRecord: allQuizRecords[0] || null,
    quizRecordTargetLanguage: allQuizRecords[0]?.targetLanguage,
    quizRecordLanguagePair: allQuizRecords[0]?.languagePair,
    quizRecordLanguage_pair: allQuizRecords[0]?.language_pair,
    quizRecordLanguage_pair_target: allQuizRecords[0]?.language_pair?.target,
    quizRecordMetadata: allQuizRecords[0]?.metadata,
    allQuizRecordKeys: allQuizRecords[0] ? Object.keys(allQuizRecords[0]) : [],
  });

  console.log(`Stats for ${targetLanguage}:`, {
    learningRecords: learningRecords.length,
    gameRecords: gameRecords.length,
    quizRecords: quizRecords.length,
  });

  // 🔄 통합된 개념 수집 - 모든 활동 유형에서 개념 추출
  const allConceptsMap = new Map();
  let allActivities = [];

  console.log("� 통합 개념 수집 시작 - 학습/퀴즈/게임 모두 포함");

  // 학습 기록에서 개념 추출
  learningRecords.forEach((record) => {
    let conceptIds = [];

    if (Array.isArray(record.concept_id)) {
      conceptIds = record.concept_id;
    } else if (record.concept_id) {
      conceptIds = [record.concept_id];
    } else if (record.conceptId) {
      conceptIds = Array.isArray(record.conceptId)
        ? record.conceptId
        : [record.conceptId];
    }

    conceptIds.forEach((conceptId) => {
      if (conceptId) {
        const accuracy =
          record.accuracy ||
          record.success_rate ||
          record.session_quality ||
          40;
        allConceptsMap.set(conceptId, {
          ...record,
          conceptId,
          activity_type: "learning",
          calculated_accuracy: accuracy,
        });
      }
    });

    allActivities.push({ ...record, activity_type: "learning" });
  });

  // 퀴즈 기록에서 개념 추출
  quizRecords.forEach((record) => {
    let conceptIds = [];

    if (Array.isArray(record.concept_id)) {
      conceptIds = record.concept_id;
    } else if (record.concept_id) {
      conceptIds = [record.concept_id];
    } else if (Array.isArray(record.concept_ids)) {
      // concept_ids 필드 추가
      conceptIds = record.concept_ids;
    } else if (record.concept_ids) {
      conceptIds = [record.concept_ids];
    } else if (record.conceptId) {
      conceptIds = Array.isArray(record.conceptId)
        ? record.conceptId
        : [record.conceptId];
    } else if (record.quizData && record.quizData.concepts) {
      conceptIds = Array.isArray(record.quizData.concepts)
        ? record.quizData.concepts
        : [record.quizData.concepts];
    }

    conceptIds.forEach((conceptId) => {
      if (conceptId) {
        const accuracy =
          record.correctAnswers && record.totalQuestions
            ? Math.round((record.correctAnswers / record.totalQuestions) * 100)
            : record.accuracy || 60;
        allConceptsMap.set(conceptId, {
          ...record,
          conceptId,
          activity_type: "quiz",
          calculated_accuracy: accuracy,
        });
      }
    });

    allActivities.push({ ...record, activity_type: "quiz" });
  });

  // 게임 기록에서 개념 추출
  gameRecords.forEach((record) => {
    let conceptIds = [];

    if (Array.isArray(record.concept_id)) {
      conceptIds = record.concept_id;
    } else if (record.concept_id) {
      conceptIds = [record.concept_id];
    } else if (record.conceptId) {
      conceptIds = Array.isArray(record.conceptId)
        ? record.conceptId
        : [record.conceptId];
    } else if (record.gameData && record.gameData.concepts) {
      conceptIds = Array.isArray(record.gameData.concepts)
        ? record.gameData.concepts
        : [record.gameData.concepts];
    }

    conceptIds.forEach((conceptId) => {
      if (conceptId) {
        const accuracy = record.score
          ? Math.min(95, Math.max(50, record.score / 3))
          : 70;
        allConceptsMap.set(conceptId, {
          ...record,
          conceptId,
          activity_type: "game",
          calculated_accuracy: accuracy,
        });
      }
    });

    allActivities.push({ ...record, activity_type: "game" });
  });

  console.log("� 통합 개념 맵:", allConceptsMap);
  console.log("� 총 고유 개념 수:", allConceptsMap.size);
  console.log("🔄 전체 활동 수:", allActivities.length);

  // 통계 계산
  stats.totalConcepts = allConceptsMap.size;

  // 새로운 마스터리 시스템으로 마스터된 개념 계산
  stats.masteredConcepts = Array.from(allConceptsMap.keys()).filter(
    (conceptId) => {
      const concept = { id: conceptId };
      const masteryData = calculateConceptMastery(concept, {
        learningRecords: allLearningRecords,
        quizRecords: allQuizRecords,
        gameRecords: allGameRecords,
      });
      return masteryData.masteryPercentage >= 80;
    }
  ).length;

  // 학습 전용 통계 (기존 학습 기록만 사용)
  if (learningRecords.length > 0) {
    let totalAccuracy = 0;
    let totalTime = 0;

    console.log("📚 Processing learning records:", learningRecords);

    learningRecords.forEach((record) => {
      const accuracy =
        record.accuracy || record.success_rate || record.session_quality || 40;
      totalAccuracy += accuracy;

      // session_duration 사용 (user_records의 total_sessions와 중복 방지)
      const sessionTime = record.session_duration || record.studyTime || 1;
      totalTime += sessionTime;
    });

    stats.averageAccuracy = Math.round(totalAccuracy / learningRecords.length);
    stats.totalStudyTime = totalTime;

    // Calculate study streak
    const sortedDates = [
      ...new Set(
        allActivities.map((r) => {
          const date = r.timestamp?.toDate
            ? r.timestamp.toDate()
            : new Date(r.timestamp);
          return date.toDateString();
        })
      ),
    ].sort((a, b) => new Date(b) - new Date(a));

    stats.studyStreak = calculateStreak(sortedDates);
    stats.lastStudyDate = sortedDates[0] ? new Date(sortedDates[0]) : null;
  }

  // Calculate game stats
  if (gameRecords.length > 0) {
    console.log("🎮 Processing game records:", gameRecords);

    const scores = gameRecords.map((r) => {
      // 다양한 점수 필드 확인
      const score = r.score || r.correct_answers || r.points || 0;
      console.log("🎮 Game score extraction:", {
        original_score: r.score,
        correct_answers: r.correct_answers,
        points: r.points,
        final_score: score,
      });
      return score;
    });

    const times = gameRecords.map((r) => {
      const time =
        r.timeTaken || r.timeSpent || r.time_spent || r.duration || 0;
      console.log("🎮 Game time extraction:", {
        timeTaken: r.timeTaken,
        timeSpent: r.timeSpent,
        time_spent: r.time_spent,
        duration: r.duration,
        final_time: time,
      });
      return time;
    });

    stats.gameStats.totalGames = gameRecords.length;
    stats.gameStats.averageScore =
      scores.reduce((a, b) => a + b, 0) / scores.length;
    stats.gameStats.bestScore = Math.max(...scores);
    stats.gameStats.totalTimePlayed = times.reduce((a, b) => a + b, 0);

    console.log("🎮 Game stats calculated:", {
      totalGames: stats.gameStats.totalGames,
      averageScore: stats.gameStats.averageScore,
      bestScore: stats.gameStats.bestScore,
      totalTimePlayed: stats.gameStats.totalTimePlayed,
    });
  }

  // Calculate quiz stats
  if (quizRecords.length > 0) {
    console.log("🎯 Processing quiz records:", quizRecords);

    const scores = quizRecords.map((r) => r.score || r.accuracy || 0);
    let totalCorrect = 0;
    let totalQuestions = 0;

    quizRecords.forEach((record) => {
      console.log("🎯 Quiz record fields:", {
        correctAnswers: record.correctAnswers,
        totalQuestions: record.totalQuestions,
        correct_answers: record.correct_answers,
        total_questions: record.total_questions,
        accuracy: record.accuracy,
        score: record.score,
      });

      if (record.correctAnswers) totalCorrect += record.correctAnswers;
      if (record.totalQuestions) totalQuestions += record.totalQuestions;
      // 대안 필드명도 확인
      if (record.correct_answers) totalCorrect += record.correct_answers;
      if (record.total_questions) totalQuestions += record.total_questions;
    });

    stats.quizStats.totalQuizzes = quizRecords.length;
    stats.quizStats.averageScore =
      scores.reduce((a, b) => a + b, 0) / scores.length;
    stats.quizStats.bestScore = Math.max(...scores);
    stats.quizStats.correctAnswers = totalCorrect;
    stats.quizStats.totalQuestions = totalQuestions;

    console.log("🎯 Quiz stats calculated:", {
      totalQuizzes: stats.quizStats.totalQuizzes,
      averageScore: stats.quizStats.averageScore,
      bestScore: stats.quizStats.bestScore,
      correctAnswers: stats.quizStats.correctAnswers,
      totalQuestions: stats.quizStats.totalQuestions,
      calculatedAccuracy:
        totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0,
    });
  }

  // Create activity history
  const activityHistory = [
    ...learningRecords.map((r) => ({ ...r, type: "learning" })),
    ...gameRecords.map((r) => ({ ...r, type: "game" })),
    ...quizRecords.map((r) => ({ ...r, type: "quiz" })),
  ].sort((a, b) => {
    const dateA = a.timestamp?.toDate
      ? a.timestamp.toDate()
      : new Date(a.timestamp);
    const dateB = b.timestamp?.toDate
      ? b.timestamp.toDate()
      : new Date(b.timestamp);
    return dateB - dateA;
  });

  stats.activityHistory = activityHistory.slice(0, 5); // Last 5 activities

  // 통계 데이터 캐시에 저장
  cachedStats = stats;
  lastStatsUpdate = Date.now();

  console.log("📋 통계 데이터 캐시에 저장 완료");

  return stats;
}

// Calculate study streak
function calculateStreak(sortedDates) {
  if (sortedDates.length === 0) return 0;

  let streak = 1;
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();

  // Check if the most recent date is today or yesterday
  if (sortedDates[0] !== today && sortedDates[0] !== yesterday) {
    return 0;
  }

  // Count consecutive days
  for (let i = 1; i < sortedDates.length; i++) {
    const currentDate = new Date(sortedDates[i]);
    const previousDate = new Date(sortedDates[i - 1]);
    const daysDiff = (previousDate - currentDate) / (1000 * 60 * 60 * 24);

    if (daysDiff === 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

// Update UI with current data
function updateUI(forceRefresh = false) {
  console.log("Updating UI for target language:", selectedTargetLanguage);
  const stats = calculateTargetLanguageStats(
    selectedTargetLanguage,
    forceRefresh
  );

  // 페이지 언어 업데이트 먼저 실행
  updatePageLanguage();

  // Update summary cards
  updateSummaryCards(stats);

  // Update activity list
  updateActivityList(stats.activityHistory);

  // Update charts
  updateCharts(stats);

  // Update language selector
  updateLanguageSelector();

  // Update learning goals progress
  updateLearningGoalsProgress(stats);
}

// Update summary cards
function updateSummaryCards(stats) {
  // Total concepts (활동 현황 요약)
  const totalConceptsEl = document.getElementById("total-words-count");
  if (totalConceptsEl) {
    totalConceptsEl.textContent = stats.totalConcepts;
  }

  // Mastered concepts
  const masteredConceptsEl = document.getElementById("mastered-words-count");
  if (masteredConceptsEl) {
    masteredConceptsEl.textContent = stats.masteredConcepts;
  }

  // Study streak
  const studyStreakEl = document.getElementById("study-streak-count");
  if (studyStreakEl) {
    studyStreakEl.textContent = `${stats.studyStreak}${getProgressText("day")}`;
  }

  // Quiz accuracy (활동 현황 요약)
  const quizAccuracyEl = document.getElementById("quiz-accuracy-rate");
  if (quizAccuracyEl) {
    const accuracy =
      stats.quizStats.totalQuestions > 0
        ? (stats.quizStats.correctAnswers / stats.quizStats.totalQuestions) *
          100
        : 0;
    quizAccuracyEl.textContent = `${Math.round(accuracy)}%`;
  }

  // 성취도 섹션
  // Total quizzes (퀴즈 성취도)
  const totalQuizzesEl = document.getElementById("total-quizzes-count");
  if (totalQuizzesEl) {
    totalQuizzesEl.textContent = `${
      stats.quizStats.totalQuizzes
    }${getProgressText("times")}`;
  }

  // Average quiz accuracy (퀴즈 성취도)
  const avgQuizAccuracyEl = document.getElementById("avg-quiz-accuracy");
  if (avgQuizAccuracyEl) {
    const accuracy =
      stats.quizStats.totalQuestions > 0
        ? (stats.quizStats.correctAnswers / stats.quizStats.totalQuestions) *
          100
        : 0;
    avgQuizAccuracyEl.textContent = `${Math.round(accuracy)}%`;
  }

  // Total games (게임 성취도)
  const totalGamesEl = document.getElementById("total-games-count");
  if (totalGamesEl) {
    totalGamesEl.textContent = `${stats.gameStats.totalGames}${getProgressText(
      "times"
    )}`;
  }

  // Average game score (게임 성취도)
  const avgGameScoreEl = document.getElementById("avg-game-score");
  if (avgGameScoreEl) {
    avgGameScoreEl.textContent = `${Math.round(
      stats.gameStats.averageScore
    )}${getProgressText("points")}`;
  }

  // Learning sessions (학습 성취도) - 실제 학습 기록 수 사용
  const totalLearningSessionsEl = document.getElementById(
    "total-learning-sessions"
  );
  if (totalLearningSessionsEl) {
    // 실제 학습 세션 수 = calculateTargetLanguageStats에서 필터링된 기록 수 사용
    const learningRecords = allLearningRecords.filter((record) => {
      // calculateTargetLanguageStats와 동일한 필터링 로직 사용
      const hasTargetLanguage =
        record.targetLanguage === selectedTargetLanguage;
      const hasLanguagePairIncludes =
        record.languagePair &&
        record.languagePair.includes &&
        record.languagePair.includes(selectedTargetLanguage);
      const hasLanguage_pairTarget =
        record.language_pair &&
        record.language_pair.target === selectedTargetLanguage;
      const hasLanguage_pairIncludes =
        record.language_pair &&
        record.language_pair.includes &&
        record.language_pair.includes(selectedTargetLanguage);
      const hasMetadataTargetLanguage =
        record.metadata &&
        record.metadata.targetLanguage === selectedTargetLanguage;
      const hasTarget_language =
        record.target_language === selectedTargetLanguage;
      const isVocabularyActivity =
        record.activity_type === "vocabulary" &&
        selectedTargetLanguage === "english";

      return (
        hasTargetLanguage ||
        hasLanguagePairIncludes ||
        hasLanguage_pairTarget ||
        hasLanguage_pairIncludes ||
        hasMetadataTargetLanguage ||
        hasTarget_language ||
        isVocabularyActivity
      );
    });

    totalLearningSessionsEl.textContent = `${
      learningRecords.length
    }${getProgressText("times")}`;
    console.log(
      `🎓 수정된 학습 세션 수: ${learningRecords.length}회 (전체 학습 기록: ${allLearningRecords.length}개, 개념 수: ${stats.totalConcepts}개)`
    );
  }

  // Average session quality (학습 성취도)
  const avgSessionQualityEl = document.getElementById("avg-session-quality");
  if (avgSessionQualityEl) {
    if (stats.averageAccuracy > 0) {
      avgSessionQualityEl.textContent = `${Math.round(stats.averageAccuracy)}%`;
    } else {
      avgSessionQualityEl.textContent = "-";
    }
  }

  // Total study time (종합 성취도)
  const totalStudyTimeEl = document.getElementById("total-study-time");
  if (totalStudyTimeEl) {
    const hours = Math.floor(stats.totalStudyTime / 60);
    const minutes = stats.totalStudyTime % 60;
    if (hours > 0) {
      totalStudyTimeEl.textContent = `${hours}${getProgressText(
        "hours"
      )} ${minutes}${getProgressText("minutes")}`;
    } else {
      totalStudyTimeEl.textContent = `${minutes}${getProgressText("minutes")}`;
    }
  }

  // Completion rate (종합 성취도)
  const completionRateEl = document.getElementById("completion-rate");
  if (completionRateEl) {
    const rate =
      stats.totalConcepts > 0
        ? Math.round((stats.masteredConcepts / stats.totalConcepts) * 100)
        : 0;
    completionRateEl.textContent = `${rate}%`;
  }

  console.log("Summary cards updated with stats:", stats);
}

// Update activity list - 최근 활동 표시
// 시간 경과 표시 함수
function getTimeAgo(date) {
  const now = new Date();
  const diff = now - date;
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 1) return getProgressText("justNow");
  if (minutes < 60) return `${minutes}${getProgressText("minutesAgo")}`;
  if (hours < 24) return `${hours}${getProgressText("hoursAgo")}`;
  if (days < 7) return `${days}${getProgressText("daysAgo")}`;

  const currentLang = getCurrentProgressLanguage();
  if (currentLang === "ko") {
    return date.toLocaleDateString("ko-KR");
  } else if (currentLang === "ja") {
    return date.toLocaleDateString("ja-JP");
  } else if (currentLang === "zh") {
    return date.toLocaleDateString("zh-CN");
  } else {
    return date.toLocaleDateString("en-US");
  }
}

// 활동 타입에 따른 상세 활동명 생성 함수
function getDetailedActivityName(activity) {
  const type = activity.type;

  if (type === "learning") {
    // 학습: 학습영역명 + 학습카드명
    const learningArea =
      activity.learning_area ||
      activity.area ||
      activity.activity_type ||
      "vocabulary";
    const cardType =
      activity.card_type ||
      activity.learning_type ||
      activity.mode ||
      activity.learning_mode ||
      "flashcard";

    // 영역명 매핑
    const areaMapping = {
      vocabulary: () => getProgressText("vocabulary"),
      reading: () => getProgressText("reading"),
      listening: () => getProgressText("listening"),
      speaking: () => getProgressText("speaking"),
      writing: () => getProgressText("writing"),
      grammar: () => getProgressText("grammar"),
      conversation: () => getProgressText("conversation"),
    };

    // 카드타입 매핑
    const cardMapping = {
      flashcard: () => getProgressText("flashcard"),
      typing: () => getProgressText("typing"),
      example: () => getProgressText("exampleLearning"),
      sentence: () => getProgressText("sentenceLearning"),
      pronunciation: () => getProgressText("pronunciationLearning"),
      definition: () => getProgressText("definitionLearning"),
      vocabulary: () => getProgressText("flashcard"),
      grammar: () => getProgressText("learning"),
      conversation: () => getProgressText("learning"),
    };

    const mappedArea = areaMapping[learningArea]
      ? areaMapping[learningArea]()
      : getProgressText("vocabulary");
    const mappedCard = cardMapping[cardType]
      ? cardMapping[cardType]()
      : getProgressText("flashcard");

    return `${mappedArea} ${mappedCard}`;
  } else if (type === "quiz") {
    // 퀴즈: 퀴즈타입명
    const quizType =
      activity.quiz_type ||
      activity.quizType ||
      activity.type_detail ||
      "translation";

    const quizMapping = {
      translation: () => getProgressText("translation"),
      multiple_choice: () => getProgressText("multipleChoiceQuiz"),
      "multiple-choice": () => getProgressText("multipleChoiceQuiz"),
      fill_blank: () => getProgressText("fillBlank"),
      "fill-blank": () => getProgressText("fillBlank"),
      listening: () => getProgressText("listeningQuiz"),
      pronunciation: () => getProgressText("pronunciationQuiz"),
      sentence: () => getProgressText("sentenceConstruction"),
    };

    return quizMapping[quizType]
      ? quizMapping[quizType]()
      : getProgressText("translation");
  } else if (type === "game") {
    // 게임: 게임카드명
    const gameType =
      activity.game_type ||
      activity.gameType ||
      activity.type_detail ||
      "word-matching";

    console.log("🎮 게임 활동 디버깅:", {
      activity_id: activity.id,
      game_type: activity.game_type,
      gameType: activity.gameType,
      type_detail: activity.type_detail,
      detected_gameType: gameType,
      full_activity: activity,
    });

    const gameMapping = {
      "word-matching": () => getProgressText("wordMatching"),
      "word-shuffle": () => getProgressText("wordScramble"),
      word_shuffle: () => getProgressText("wordScramble"), // 언더스코어 버전도 추가
      "word-scramble": () => getProgressText("wordScramble"), // 추가
      word_scramble: () => getProgressText("wordScramble"), // 언더스코어 버전도 추가
      scramble: () => getProgressText("wordScramble"),
      shuffle: () => getProgressText("wordScramble"),
      "memory-card": () => getProgressText("memoryCard"),
      "memory-game": () => getProgressText("memoryGame"),
      "speed-quiz": () => getProgressText("speedQuiz"),
      crossword: () => getProgressText("crossword"),
      hangman: () => getProgressText("hangman"),
    };

    return gameMapping[gameType]
      ? gameMapping[gameType]()
      : getProgressText("learningGame");
  }

  return getProgressText("learningActivity");
}

function updateActivityList(activities) {
  // 기존 활동 리스트 업데이트
  const activityListEl = document.getElementById("recent-activities-list");
  if (activityListEl) {
    if (activities.length === 0) {
      activityListEl.innerHTML = `<p class="text-gray-500 text-center py-4">${getProgressText(
        "noLearningRecords"
      )}</p>`;
    } else {
      const activityHTML = activities
        .map((activity) => {
          const date = activity.timestamp?.toDate
            ? activity.timestamp.toDate()
            : new Date(activity.timestamp);
          const formattedDate = date.toLocaleDateString("ko-KR");
          const formattedTime = date.toLocaleTimeString("ko-KR", {
            hour: "2-digit",
            minute: "2-digit",
          });

          // 상세 활동명 생성
          const activityName = getDetailedActivityName(activity);

          let activityInfo = "";
          let badgeColor = "bg-blue-100 text-blue-800";

          switch (activity.type) {
            case "learning":
              const sessionQuality =
                activity.session_quality || activity.accuracy || 0;
              activityInfo = `${activityName} - <span class="hidden md:inline">${getProgressText(
                "learningEfficiency"
              )}: </span>${Math.round(sessionQuality)}%`;
              badgeColor = "bg-green-100 text-green-800";
              break;
            case "game":
              activityInfo = `${activityName} - <span class="hidden md:inline">${getProgressText(
                "score"
              )}: </span>${activity.score || 0}${getProgressText("points")}`;
              badgeColor = "bg-purple-100 text-purple-800";
              break;
            case "quiz":
              activityInfo = `${activityName} - <span class="hidden md:inline">${getProgressText(
                "score"
              )}: </span>${activity.score || 0}${getProgressText("points")}`;
              badgeColor = "bg-orange-100 text-orange-800";
              break;
          }

          return `
                    <div class="border-l-4 border-blue-400 pl-4 py-2">
                        <div class="flex justify-between items-center">
                            <div>
                                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeColor}">
                                    ${activity.type}
                                </span>
                                <p class="text-sm text-gray-900 mt-1">${activityInfo}</p>
                            </div>
                            <div class="text-right text-xs text-gray-500">
                                <p>${formattedDate}</p>
                                <p>${formattedTime}</p>
                            </div>
                        </div>
                    </div>
                `;
        })
        .join("");

      activityListEl.innerHTML = activityHTML;
    }
  }
}

// Update language selector
function updateLanguageSelector() {
  const selector = document.getElementById("target-language-filter");
  if (!selector) {
    console.log("Target language selector not found");
    return;
  }

  // 현재 선택된 값으로 업데이트
  selector.value = selectedTargetLanguage;
  console.log("Language selector updated to:", selectedTargetLanguage);
}

// 학습 목표 진행률 업데이트
function updateLearningGoalsProgress(stats) {
  // 일일 신규 단어 목표
  const dailyWordsGoal = parseInt(
    document.getElementById("daily-words-goal")?.value || 10
  );
  const dailyWordsProgress = stats.totalConcepts; // Math.min 제거하여 실제 값 표시
  const dailyWordsPercentage = Math.min(
    100,
    (dailyWordsProgress / dailyWordsGoal) * 100
  );

  const dailyWordsProgressEl = document.getElementById("daily-words-progress");
  const dailyWordsBarEl = document.getElementById("daily-words-bar");

  if (dailyWordsProgressEl) {
    dailyWordsProgressEl.textContent = `${dailyWordsProgress}/${dailyWordsGoal}${getProgressText(
      "concepts"
    )}`;
  }

  if (dailyWordsBarEl) {
    // Tailwind 기본 클래스 사용 + style로 width 설정
    dailyWordsBarEl.className =
      "bg-blue-600 h-1 rounded-full transition-all duration-300";
    dailyWordsBarEl.style.width = `${dailyWordsPercentage}%`;
  }

  // 일일 퀴즈 시간 목표
  const dailyQuizGoal = parseInt(
    document.getElementById("daily-quiz-goal")?.value || 20
  );
  const dailyQuizProgress = stats.totalStudyTime; // Math.min 제거하여 실제 값 표시
  const dailyQuizPercentage = Math.min(
    100,
    (dailyQuizProgress / dailyQuizGoal) * 100
  );

  const dailyQuizProgressEl = document.getElementById("daily-quiz-progress");
  const dailyQuizBarEl = document.getElementById("daily-quiz-bar");

  if (dailyQuizProgressEl) {
    dailyQuizProgressEl.textContent = `${dailyQuizProgress}/${dailyQuizGoal}${getProgressText(
      "minutes"
    )}`;
  }

  if (dailyQuizBarEl) {
    // Tailwind 기본 클래스 사용 + style로 width 설정
    dailyQuizBarEl.className =
      "bg-green-600 h-1 rounded-full transition-all duration-300";
    dailyQuizBarEl.style.width = `${dailyQuizPercentage}%`;
  }

  // 주간 학습 일수 목표 (연속 학습일 기준)
  const weeklyDaysGoal = parseInt(
    document.getElementById("weekly-days-goal")?.value || 5
  );
  const weeklyDaysProgress = stats.studyStreak; // Math.min 제거하여 실제 값 표시
  const weeklyDaysPercentage = Math.min(
    100,
    (weeklyDaysProgress / weeklyDaysGoal) * 100
  );

  const weeklyDaysProgressEl = document.getElementById("weekly-days-progress");
  const weeklyDaysBarEl = document.getElementById("weekly-days-bar");

  if (weeklyDaysProgressEl) {
    weeklyDaysProgressEl.textContent = `${weeklyDaysProgress}/${weeklyDaysGoal}${getProgressText(
      "day"
    )}`;
  }

  if (weeklyDaysBarEl) {
    // Tailwind 기본 클래스 사용 + style로 width 설정
    weeklyDaysBarEl.className =
      "bg-purple-600 h-1 rounded-full transition-all duration-300";
    weeklyDaysBarEl.style.width = `${weeklyDaysPercentage}%`;
  }

  // 주간 단어 마스터 목표
  const weeklyMasteryGoal = parseInt(
    document.getElementById("weekly-mastery-goal")?.value || 30
  );
  const weeklyMasteryProgress = stats.masteredConcepts; // Math.min 제거하여 실제 값 표시
  const weeklyMasteryPercentage = Math.min(
    100,
    (weeklyMasteryProgress / weeklyMasteryGoal) * 100
  );

  const weeklyMasteryProgressEl = document.getElementById(
    "weekly-mastery-progress"
  );
  const weeklyMasteryBarEl = document.getElementById("weekly-mastery-bar");

  if (weeklyMasteryProgressEl) {
    weeklyMasteryProgressEl.textContent = `${weeklyMasteryProgress}/${weeklyMasteryGoal}${getProgressText(
      "concepts"
    )}`;
  }

  if (weeklyMasteryBarEl) {
    // Tailwind 기본 클래스 사용 + style로 width 설정
    weeklyMasteryBarEl.className =
      "bg-orange-600 h-1 rounded-full transition-all duration-300";
    weeklyMasteryBarEl.style.width = `${weeklyMasteryPercentage}%`;
  }

  console.log(
    `🎯 학습 목표 업데이트 완료 - 대상 언어: ${selectedTargetLanguage}`
  );
}

// Update charts (placeholder for future chart implementation)
function updateCharts(stats) {
  console.log("Chart data:", {
    accuracy: stats.averageAccuracy,
    concepts: stats.totalConcepts,
    games: stats.gameStats.totalGames,
    quizzes: stats.quizStats.totalQuizzes,
  });

  // 주간 학습 활동 차트 업데이트
  updateWeeklyActivityChart(stats);

  // 카테고리별 진도 차트 업데이트
  updateCategoryProgressChart();
}

// 주간 학습 활동 차트 업데이트
function updateWeeklyActivityChart(stats) {
  const canvas = document.getElementById("weekly-activity-chart");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");

  // 기존 차트가 있다면 제거
  if (window.weeklyActivityChart) {
    window.weeklyActivityChart.destroy();
  }

  // 최근 7일간의 활동 데이터 생성
  const last7Days = [];
  const learningData = [];
  const gameData = [];
  const quizData = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];

    last7Days.push(dateStr);

    // 해당 날짜의 학습 활동 수
    const dayLearningCount = allLearningRecords.filter((record) => {
      if (!record.timestamp) return false;
      const recordDate = record.timestamp.toDate
        ? record.timestamp.toDate()
        : new Date(record.timestamp);
      const isDateMatch = recordDate.toISOString().split("T")[0] === dateStr;

      // 언어 필터링 - calculateTargetLanguageStats와 동일한 로직
      const hasTargetLanguage =
        record.targetLanguage === selectedTargetLanguage;
      const hasLanguagePairIncludes =
        record.languagePair &&
        record.languagePair.includes &&
        record.languagePair.includes(selectedTargetLanguage);
      const hasLanguage_pairTarget =
        record.language_pair &&
        record.language_pair.target === selectedTargetLanguage;
      const hasLanguage_pairIncludes =
        record.language_pair &&
        record.language_pair.includes &&
        record.language_pair.includes(selectedTargetLanguage);
      const hasMetadataTargetLanguage =
        record.metadata &&
        record.metadata.targetLanguage === selectedTargetLanguage;
      const hasTarget_language =
        record.target_language === selectedTargetLanguage;
      const isVocabularyActivity =
        record.activity_type === "vocabulary" &&
        selectedTargetLanguage === "english";

      const isTargetLanguage =
        hasTargetLanguage ||
        hasLanguagePairIncludes ||
        hasLanguage_pairTarget ||
        hasLanguage_pairIncludes ||
        hasMetadataTargetLanguage ||
        hasTarget_language ||
        isVocabularyActivity;

      return isDateMatch && isTargetLanguage;
    }).length;

    // 해당 날짜의 게임 활동 수
    const dayGameCount = allGameRecords.filter((record) => {
      if (!record.timestamp) return false;
      const recordDate = record.timestamp.toDate
        ? record.timestamp.toDate()
        : new Date(record.timestamp);
      const isDateMatch = recordDate.toISOString().split("T")[0] === dateStr;

      // 언어 필터링
      const isTargetLanguage =
        record.targetLanguage === selectedTargetLanguage ||
        (record.languagePair &&
          record.languagePair.includes(selectedTargetLanguage)) ||
        (record.language_pair &&
          record.language_pair.target === selectedTargetLanguage) ||
        (record.language_pair &&
          record.language_pair.includes &&
          record.language_pair.includes(selectedTargetLanguage)) ||
        (record.metadata &&
          record.metadata.targetLanguage === selectedTargetLanguage);

      return isDateMatch && isTargetLanguage;
    }).length;

    // 해당 날짜의 퀴즈 활동 수
    const dayQuizCount = allQuizRecords.filter((record) => {
      if (!record.timestamp) return false;
      const recordDate = record.timestamp.toDate
        ? record.timestamp.toDate()
        : new Date(record.timestamp);
      const isDateMatch = recordDate.toISOString().split("T")[0] === dateStr;

      // 언어 필터링 - calculateTargetLanguageStats와 동일한 로직
      const hasTargetLanguage =
        record.targetLanguage === selectedTargetLanguage;
      const hasLanguagePairIncludes =
        record.languagePair &&
        record.languagePair.includes(selectedTargetLanguage);
      const hasLanguage_pairTarget =
        record.language_pair &&
        record.language_pair.target === selectedTargetLanguage;
      const hasMetadataTargetLanguage =
        record.metadata &&
        record.metadata.targetLanguage === selectedTargetLanguage;
      const hasTarget_language =
        record.target_language === selectedTargetLanguage;
      const isTranslationQuiz =
        record.quiz_type === "translation" &&
        selectedTargetLanguage === "english";

      const isTargetLanguage =
        hasTargetLanguage ||
        hasLanguagePairIncludes ||
        hasLanguage_pairTarget ||
        hasMetadataTargetLanguage ||
        hasTarget_language ||
        isTranslationQuiz;

      return isDateMatch && isTargetLanguage;
    }).length;

    learningData.push(dayLearningCount);
    gameData.push(dayGameCount);
    quizData.push(dayQuizCount);
  }

  // 요일 레이블 생성
  const dayLabels = last7Days.map((dateStr) => {
    const date = new Date(dateStr);
    const days = ["일", "월", "화", "수", "목", "금", "토"];
    return `${date.getMonth() + 1}/${date.getDate()}(${days[date.getDay()]})`;
  });

  window.weeklyActivityChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: dayLabels,
      datasets: [
        {
          label: getProgressText("learning"),
          data: learningData,
          backgroundColor: "rgba(34, 197, 94, 0.7)",
          borderColor: "rgba(34, 197, 94, 1)",
          borderWidth: 1,
        },
        {
          label: getProgressText("games"),
          data: gameData,
          backgroundColor: "rgba(59, 130, 246, 0.7)",
          borderColor: "rgba(59, 130, 246, 1)",
          borderWidth: 1,
        },
        {
          label: getProgressText("quizzes"),
          data: quizData,
          backgroundColor: "rgba(147, 51, 234, 0.7)",
          borderColor: "rgba(147, 51, 234, 1)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "top",
          labels: {
            boxWidth: window.innerWidth < 768 ? 8 : 12, // 모바일에서 박스 크기 줄이기
            padding: window.innerWidth < 768 ? 8 : 15, // 모바일에서 패딩 줄이기
            font: {
              size: window.innerWidth < 768 ? 10 : 12, // 모바일에서 폰트 크기 줄이기
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1,
          },
        },
      },
    },
  });
}

// 도메인별 색상 매핑 함수
function getDomainColorTheme(domain) {
  const colorMapping = {
    daily: "#22c55e", // green
    business: "#3b82f6", // blue
    technology: "#9333ea", // purple
    education: "#f59e0b", // amber
    health: "#ef4444", // red
    travel: "#06b6d4", // cyan
    food: "#fbbf24", // yellow
    entertainment: "#6366f1", // indigo
    culture: "#ec4899", // pink
    general: "#9ca3af", // gray
  };
  return colorMapping[domain] || "#9ca3af";
}

// 도메인별 진도 차트 업데이트 (concept_snapshots에서 도메인 정보 집계)
function updateCategoryProgressChart() {
  const canvas = document.getElementById("category-progress-chart");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");

  // 기존 차트가 있다면 제거
  if (window.categoryProgressChart) {
    window.categoryProgressChart.destroy();
  }

  // 도메인별 개념 수 집계
  const domainData = {};

  // 현재 선택된 대상 언어에 해당하는 활동 기록들 필터링
  const learningRecords = allLearningRecords.filter(
    (record) =>
      record.targetLanguage === selectedTargetLanguage ||
      (record.languagePair &&
        record.languagePair.includes &&
        record.languagePair.includes(selectedTargetLanguage)) ||
      (record.language_pair &&
        record.language_pair.target === selectedTargetLanguage) ||
      (record.language_pair &&
        record.language_pair.includes &&
        record.language_pair.includes(selectedTargetLanguage)) ||
      (record.metadata &&
        record.metadata.targetLanguage === selectedTargetLanguage) ||
      record.target_language === selectedTargetLanguage ||
      (record.activity_type === "vocabulary" &&
        selectedTargetLanguage === "english")
  );

  const gameRecords = allGameRecords.filter(
    (record) =>
      record.targetLanguage === selectedTargetLanguage ||
      (record.languagePair &&
        record.languagePair.includes(selectedTargetLanguage)) ||
      (record.language_pair &&
        record.language_pair.target === selectedTargetLanguage) ||
      (record.language_pair &&
        record.language_pair.includes &&
        record.language_pair.includes(selectedTargetLanguage)) ||
      (record.metadata &&
        record.metadata.targetLanguage === selectedTargetLanguage) ||
      (record.game_type === "word-matching" &&
        selectedTargetLanguage === "english")
  );

  const quizRecords = allQuizRecords.filter(
    (record) =>
      record.targetLanguage === selectedTargetLanguage ||
      (record.languagePair &&
        record.languagePair.includes(selectedTargetLanguage)) ||
      (record.language_pair &&
        record.language_pair.target === selectedTargetLanguage) ||
      (record.metadata &&
        record.metadata.targetLanguage === selectedTargetLanguage) ||
      record.target_language === selectedTargetLanguage ||
      (record.quiz_type === "translation" &&
        selectedTargetLanguage === "english")
  );

  // userProgressData에서 concept_snapshots 가져오기
  if (userProgressData && userProgressData.concept_snapshots) {
    const conceptSnapshots = userProgressData.concept_snapshots;

    // 현재 대상 언어와 관련된 개념들만 필터링
    const targetLanguageConcepts = new Set();

    // 학습, 퀴즈, 게임 기록에서 해당 언어의 개념들 수집
    const allRecords = [...learningRecords, ...gameRecords, ...quizRecords];

    allRecords.forEach((record) => {
      if (record.concept_id) {
        if (Array.isArray(record.concept_id)) {
          record.concept_id.forEach((id) => targetLanguageConcepts.add(id));
        } else {
          targetLanguageConcepts.add(record.concept_id);
        }
      }
    });

    console.log(
      "🔍 대상 언어 개념들:",
      Array.from(targetLanguageConcepts),
      "대상 언어:",
      selectedTargetLanguage
    );
    console.log(
      "📊 필터된 학습 기록:",
      learningRecords.length,
      "게임 기록:",
      gameRecords.length,
      "퀴즈 기록:",
      quizRecords.length
    );

    // concept_snapshots에서 해당 언어의 개념들만 도메인별로 집계
    targetLanguageConcepts.forEach((conceptId) => {
      const conceptInfo = conceptSnapshots[conceptId];
      if (conceptInfo) {
        // concept_info.domain에서 도메인 정보 확인
        const domain =
          conceptInfo.concept_info?.domain || conceptInfo.domain || "daily";
        const category =
          conceptInfo.concept_info?.category || conceptInfo.category || "";

        if (!domainData[domain]) {
          domainData[domain] = {
            count: 0,
            categories: new Map(),
          };
        }
        domainData[domain].count += 1;

        // 카테고리별 개수 집계
        if (category) {
          const currentCount = domainData[domain].categories.get(category) || 0;
          domainData[domain].categories.set(category, currentCount + 1);
        }

        console.log(`🔍 개념 ${conceptId} 도메인:`, domain, conceptInfo);
      }
    });

    console.log("📊 도메인별 집계 결과:", domainData);
  }

  // 데이터가 없는 경우 기본 도메인 추가
  if (Object.keys(domainData).length === 0) {
    domainData["일상"] = { count: 0, categories: new Map() };
    domainData["비즈니스"] = { count: 0, categories: new Map() };
    domainData["기술"] = { count: 0, categories: new Map() };
    domainData["학문"] = { count: 0, categories: new Map() };
    domainData["일반"] = { count: 0, categories: new Map() };
  }

  const domains = Object.keys(domainData);
  const values = Object.values(domainData).map((d) => d.count);

  // 도메인별 색상 정의 (일관성 있는 색상 사용)
  const colors = domains.map((domain) => {
    const color = getDomainColorTheme(domain);
    return color + "80"; // 80% 투명도
  });

  const borderColors = domains.map((domain) => getDomainColorTheme(domain));

  window.categoryProgressChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: domains,
      datasets: [
        {
          data: values,
          backgroundColor: colors,
          borderColor: borderColors,
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: window.innerWidth < 768 ? "bottom" : "right",
          labels: {
            usePointStyle: true,
            padding: 15,
          },
        },
        tooltip: {
          enabled: false,
          external: function (context) {
            // chart, tooltip을 context에서 반드시 받아옴
            const chart = context.chart;
            const tooltip = context.tooltip;
            // 차트 컨테이너에 position: relative, overflow: visible 강제 적용
            const chartContainer = chart.canvas.parentNode;
            if (chartContainer) {
              chartContainer.style.position = "relative";
              chartContainer.style.overflow = "visible";
            }
            let tooltipEl =
              chart.canvas.parentNode.querySelector("#chartjs-tooltip");
            if (!tooltipEl) {
              tooltipEl = document.createElement("div");
              tooltipEl.id = "chartjs-tooltip";
              // 모바일 여부 확인
              const isMobile = window.innerWidth <= 768;

              tooltipEl.style.background = "rgba(0, 0, 0, 0.92)";
              tooltipEl.style.borderRadius = "6px";
              tooltipEl.style.color = "white";
              tooltipEl.style.opacity = "1";
              tooltipEl.style.pointerEvents = "none";
              tooltipEl.style.position = "absolute";
              tooltipEl.style.transform = isMobile
                ? "translate(0, 0)"
                : "translate(-50%, 0)";
              tooltipEl.style.transition = "all .1s ease";
              tooltipEl.style.padding = isMobile ? "10px 14px" : "12px 16px";
              tooltipEl.style.fontSize = isMobile ? "13px" : "14px";
              tooltipEl.style.fontFamily = "Arial, sans-serif";
              tooltipEl.style.zIndex = "9999";
              tooltipEl.style.boxShadow = "0 4px 16px rgba(0,0,0,0.25)";
              tooltipEl.style.display = "block";
              chart.canvas.parentNode.appendChild(tooltipEl);
            }
            if (tooltip.opacity === 0) {
              tooltipEl.style.opacity = "0";
              tooltipEl.style.display = "none";
              return;
            }
            if (tooltip.body) {
              const dataIndex = tooltip.dataPoints[0].dataIndex;
              const label = tooltip.dataPoints[0].label || "";
              const value = tooltip.dataPoints[0].parsed || 0;
              const total = tooltip.dataPoints[0].dataset.data.reduce(
                (a, b) => a + b,
                0
              );
              const percentage =
                total > 0 ? Math.round((value / total) * 100) : 0;
              const domainColor = getDomainColorTheme(label);
              let innerHtml = "";
              // 모바일 여부 확인
              const isMobile = window.innerWidth <= 768;

              // 첫 줄: 색상 박스 + 도메인명 + 값 + 비율
              const titleFontSize = isMobile ? "14px" : "15px";
              const detailFontSize = isMobile ? "12px" : "13px";

              innerHtml += `<div style="margin-bottom: ${
                isMobile ? "4px" : "8px"
              };display:flex;align-items:center;">
                <span style="display:inline-block;width:${
                  isMobile ? "10px" : "14px"
                };height:${
                isMobile ? "10px" : "14px"
              };background-color:${domainColor};margin-right:${
                isMobile ? "6px" : "8px"
              };border-radius:3px;vertical-align:middle;box-shadow:0 0 0 1.5px #fff;"></span>
                <strong style="font-size:${titleFontSize};">${label}: ${value}${getProgressText(
                "concepts"
              )} (${percentage}%)</strong>
            </div>`;

              // 모든 화면 크기에서 상세한 카테고리 목록 표시
              const domainInfo = domainData[label];
              if (
                domainInfo &&
                domainInfo.categories &&
                domainInfo.categories.size > 0
              ) {
                innerHtml += `<div style="margin-top: ${
                  isMobile ? "2px" : "4px"
                }; font-size: ${detailFontSize}; color: #eee;">`;
                Array.from(domainInfo.categories.entries())
                  .sort((a, b) => b[1] - a[1])
                  .forEach(([category, count]) => {
                    innerHtml += `<div style="margin-left:${
                      isMobile ? "8px" : "12px"
                    };">• ${category}: ${count}${getProgressText(
                      "concepts"
                    )}</div>`;
                  });
                innerHtml += "</div>";
              } else {
                innerHtml += `<div style="margin-top: ${
                  isMobile ? "2px" : "4px"
                }; font-size: ${detailFontSize}; color: #ccc;">${getProgressText(
                  "categoryInfoNone"
                )}</div>`;
              }
              tooltipEl.innerHTML = innerHtml;
              tooltipEl.style.display = "block";
              tooltipEl.style.opacity = "1";
            }
            // 카드 컨테이너를 기준으로 툴팁 위치 계산
            const containerRect =
              chart.canvas.parentNode.getBoundingClientRect();

            // 모바일 여부 확인 (768px 이하)
            const isMobile = window.innerWidth <= 768;

            // 툴팁 크기 설정 (모바일에서도 적당한 크기 유지)
            const tooltipWidth = isMobile ? 180 : 200;
            const tooltipHeight = isMobile ? 140 : 150;

            // 툴팁이 카드 경계를 벗어나지 않도록 조정
            let left = tooltip.caretX;
            let top = tooltip.caretY;

            // 반응형 툴팁 위치 계산
            if (isMobile) {
              // 모바일: 사분면 기반 위치 계산
              const chartCenterX = containerRect.width / 2;
              const chartCenterY = containerRect.height / 2;

              // tooltip.caretX/Y는 차트 내부의 절대 좌표
              const mouseX = tooltip.caretX;
              const mouseY = tooltip.caretY;

              // 마우스 위치가 차트의 어느 사분면에 있는지 확인
              const isRightSide = mouseX > chartCenterX;
              const isBottomSide = mouseY > chartCenterY;

              // 툴팁 위치를 마우스 위치에 따라 동적으로 조정
              if (isRightSide) {
                // 오른쪽에 있을 때: 툴팁을 마우스 왼쪽에 배치 (더 자연스러운 간격)
                left = mouseX - tooltipWidth - 10;
              } else {
                // 왼쪽에 있을 때: 툴팁을 마우스 오른쪽에 배치
                left = mouseX + 10;
              }

              if (isBottomSide) {
                // 아래쪽에 있을 때: 툴팁을 마우스 위에 배치
                top = mouseY - tooltipHeight - 10;
              } else {
                // 위쪽에 있을 때: 툴팁을 마우스 아래에 배치
                top = mouseY + 10;
              }

              // 경계 체크 및 조정 (더 자연스러운 여백)
              // 툴팁이 오른쪽 경계를 벗어나는 경우
              if (left + tooltipWidth > containerRect.width - 10) {
                left = containerRect.width - tooltipWidth - 10;
              }

              // 툴팁이 왼쪽 경계를 벗어나는 경우
              if (left < 10) {
                left = 10;
              }

              // 툴팁이 아래쪽 경계를 벗어나는 경우
              if (top + tooltipHeight > containerRect.height - 10) {
                top = containerRect.height - tooltipHeight - 10;
              }

              // 툴팁이 위쪽 경계를 벗어나는 경우
              if (top < 10) {
                top = 10;
              }
            } else {
              // 데스크탑: 기존 중앙 정렬 방식
              left = tooltip.caretX;
              top = tooltip.caretY;

              // 경계 체크 및 조정
              // 툴팁이 오른쪽 경계를 벗어나는 경우
              if (left + tooltipWidth > containerRect.width) {
                left = containerRect.width - tooltipWidth - 10;
              }

              // 툴팁이 왼쪽 경계를 벗어나는 경우
              if (left < 10) {
                left = 10;
              }

              // 툴팁이 아래쪽 경계를 벗어나는 경우
              if (top + tooltipHeight > containerRect.height) {
                top = containerRect.height - tooltipHeight - 10;
              }

              // 툴팁이 위쪽 경계를 벗어나는 경우
              if (top < 10) {
                top = 10;
              }
            }

            tooltipEl.style.left = left + "px";
            tooltipEl.style.top = top + "px";
          },
        },
      },
    },
  });
  // chartContainer 관련 코드는 함수 바깥에서 완전히 삭제
}

// Missing function for quiz accuracy details
function showQuizAccuracyDetails() {
  const stats = calculateTargetLanguageStats(selectedTargetLanguage, false); // 캐시 사용
  const accuracy =
    stats.quizStats.totalQuestions > 0
      ? (stats.quizStats.correctAnswers / stats.quizStats.totalQuestions) * 100
      : 0;

  // 모달 내용 생성
  const modalBody = document.getElementById("totalWordsModalBody");
  if (modalBody) {
    modalBody.innerHTML = `
            <div class="space-y-4">
                <h3 class="text-lg font-semibold text-gray-800">${getProgressText(
                  "quizAccuracyDetails"
                )}</h3>
                <div class="grid grid-cols-2 gap-4">
                    <div class="bg-purple-50 p-4 rounded-lg">
                        <p class="text-sm text-gray-600">${getProgressText(
                          "totalQuizzes"
                        )}</p>
                        <p class="text-xl font-bold text-purple-600">${
                          stats.quizStats.totalQuizzes
                        }${getProgressText("times")}</p>
                    </div>
                    <div class="bg-blue-50 p-4 rounded-lg">
                        <p class="text-sm text-gray-600">${getProgressText(
                          "totalQuestions"
                        )}</p>
                        <p class="text-xl font-bold text-blue-600">${
                          stats.quizStats.totalQuestions
                        }</p>
                    </div>
                    <div class="bg-green-50 p-4 rounded-lg">
                        <p class="text-sm text-gray-600">${getProgressText(
                          "correctAnswers"
                        )}</p>
                        <p class="text-xl font-bold text-green-600">${
                          stats.quizStats.correctAnswers
                        }${getProgressText("concepts")}</p>
                    </div>
                    <div class="bg-orange-50 p-4 rounded-lg">
                        <p class="text-sm text-gray-600">${getProgressText(
                          "accuracy"
                        )}</p>
                        <p class="text-xl font-bold text-orange-600">${Math.round(
                          accuracy
                        )}${getProgressText("percent")}</p>
                    </div>
                </div>
                <div class="bg-gray-50 p-4 rounded-lg">
                    <p class="text-sm text-gray-600 mb-2">${getProgressText(
                      "averageScore"
                    )}</p>
                    <p class="text-lg font-semibold">${Math.round(
                      stats.quizStats.averageScore
                    )}${getProgressText("points")}</p>
                    <p class="text-sm text-gray-500">${getProgressText(
                      "bestScore"
                    )}: ${stats.quizStats.bestScore}${getProgressText(
      "points"
    )}</p>
                </div>
            </div>
        `;

    // 모달 제목 변경
    const modalTitle = document.querySelector("#totalWordsModal h2");
    if (modalTitle) {
      modalTitle.textContent = `🎯 ${getProgressText("quizAccuracy")}`;
    }

    // 모달 열기
    openModal("totalWordsModal");
  }
}

// 총 단어수 카드 클릭 시 모달 열기
async function showTotalWordsDetails() {
  const stats = calculateTargetLanguageStats(selectedTargetLanguage, false); // 캐시 사용

  // 캐시된 개념 데이터 확인 및 사용
  let detailedConceptsList;
  if (
    cachedConceptData &&
    lastConceptUpdate &&
    Date.now() - lastConceptUpdate < 30000
  ) {
    // 30초 내 캐시 사용
    console.log("📋 캐시된 개념 데이터 사용");
    detailedConceptsList = cachedConceptData;
  } else {
    console.log("🔄 새로운 개념 데이터 계산 시작...");
    detailedConceptsList = await generateDetailedConceptsList();
    // 캐시에 저장
    cachedConceptData = detailedConceptsList;
    lastConceptUpdate = Date.now();
    console.log("📋 개념 데이터 캐시에 저장 완료");
  }

  const modalBody = document.getElementById("totalWordsModalBody");

  if (modalBody) {
    //  개념 목록 HTML 생성 - 캐시된 데이터 사용
    const conceptsList = detailedConceptsList
      .map((concept) => {
        const progressBarWidth = Math.min(
          100,
          Math.max(0, concept.averageAccuracy)
        );
        const progressBarColor =
          concept.averageAccuracy >= 80
            ? "bg-green-500"
            : concept.averageAccuracy >= 60
            ? "bg-yellow-500"
            : "bg-red-500";

        return `
                <div class="border rounded-lg p-4 ${
                  concept.isMastered
                    ? "bg-green-50 border-green-200"
                    : "bg-white border-gray-200"
                } shadow-sm">
                    <div class="flex items-center justify-between mb-3">
                        <div class="flex items-center space-x-2">
                            <span class="text-lg">${
                              concept.isMastered ? "🏆" : "📝"
                            }</span>
                            <div>
                                <p class="font-medium text-gray-900">${
                                  concept.snapshot.displayName
                                }</p>
                                <div class="flex items-center space-x-2 mt-1">
                                    <span class="text-xs px-2 py-1 rounded-full ${
                                      concept.snapshot.domainColor
                                    }">${concept.snapshot.domain}</span>
                                    <span class="text-xs px-2 py-1 rounded-full ${
                                      concept.snapshot.categoryColor
                                    }">${concept.snapshot.category}</span>
                                </div>
                            </div>
                        </div>
                        <div class="text-right">
                            <span class="px-2 py-1 text-xs font-medium rounded-full ${
                              concept.isMastered
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }">
                                ${
                                  concept.isMastered
                                    ? `🏆 ${getProgressText("mastered")}`
                                    : `📚 ${getProgressText("inProgress")}`
                                }
                            </span>
                        </div>
                    </div>
                    
                    <!-- 마스터 진행률 바 -->
                    <div class="mb-3">
                        <div class="flex justify-between items-center mb-1">
                            <span class="text-xs text-gray-600">🎯 ${getProgressText(
                              "masteryProgress"
                            )}</span>
                            <span class="text-xs font-medium text-gray-900">${
                              concept.averageAccuracy
                            }%</span>
                        </div>
                        <div class="w-full bg-gray-200 rounded-full h-2">
                            <div class="${progressBarColor} h-2 rounded-full transition-all duration-300" style="width: ${progressBarWidth}%"></div>
                        </div>
                    </div>
                    
                    <!-- 활동 통계 - 한 줄 배치, 이모지 먼저 표시 -->
                    <div class="flex items-center justify-center text-sm text-gray-600 space-x-2">
                        <span class="flex items-center">
                            <span class="text-orange-500 mr-1">📊</span>
                            <span class="font-bold text-orange-600">${
                              concept.totalActivities
                            }</span>
                        </span>
                        <span class="text-gray-400">|</span>
                        <span class="flex items-center">
                            <span class="text-green-500 mr-1">📚</span>
                            <span class="font-bold text-green-600">${
                              concept.learningCount
                            }</span>
                        </span>
                        <span class="text-gray-400">|</span>
                        <span class="flex items-center">
                            <span class="text-purple-500 mr-1">🎮</span>
                            <span class="font-bold text-purple-600">${
                              concept.gameCount
                            }</span>
                        </span>
                        <span class="text-gray-400">|</span>
                        <span class="flex items-center">
                            <span class="text-blue-500 mr-1">🎯</span>
                            <span class="font-bold text-blue-600">${
                              concept.quizCount
                            }</span>
                            ${
                              concept.quizCount > 0
                                ? `
                            <button 
                                class="ml-2 text-xs text-gray-400 hover:text-blue-600 transition-colors"
                                onclick="toggleQuizDetails('${concept.conceptId}')"
                                title="퀴즈 통계 보기/숨기기"
                            >
                                ➕
                            </button>
                            `
                                : ""
                            }
                        </span>
                    </div>
                    
                    <!-- 퀴즈 상세 통계 - 토글 가능, 중앙정렬 -->
                    ${
                      concept.quizCount > 0
                        ? `
                    <div id="quiz-details-${
                      concept.conceptId
                    }" class="mt-3 p-3 bg-gray-50 rounded-lg text-center" style="display: none;">
                        <div class="text-center text-sm font-medium text-gray-700 mb-0">
                            🎯 ${getProgressText(
                              "quiz"
                            )} | <span class="text-green-600">${getProgressText(
                            "correctAnswers"
                          )} ✓${
                            concept.correctCount
                          }</span> <span class="text-red-600">${getProgressText(
                            "incorrectAnswers"
                          )} ✗${
                            concept.incorrectCount
                          }</span> ${getProgressText("accuracyRate")} ${
                            concept.accuracyRate
                          }%
                        </div>
                    </div>
                    `
                        : ""
                    }
                </div>
            `;
      })
      .join("");

    // 📊 모달 HTML 생성 (스크롤 제거, 이모지 사용, 학습/게임/퀴즈 기록 섹션 제거)
    modalBody.innerHTML = `
            <div class="space-y-6">
                <!-- 전체 개념 목록 -->
                <div>
                    <div class="flex items-center justify-between mb-4">
                        <div class="flex items-center space-x-3">
                            <h3 class="text-lg font-semibold text-gray-800">📚 ${getProgressText(
                              "totalWords"
                            )} ${stats.totalConcepts}${getProgressText(
      "concepts"
    )}</h3>
                        </div>
                        <!-- 이모지 설명 -->
                        <div class="text-xs text-gray-500 text-right">
                            <div>� 전체 | �📚 학습 | 🎮 게임 | 🎯 퀴즈</div>
                        </div>
                    </div>
                    <div class="space-y-3">
                        ${
                          conceptsList.length > 0
                            ? conceptsList
                            : '<div class="text-center py-8"><p class="text-gray-500">📭 학습한 개념이 없습니다.</p><p class="text-sm text-gray-400 mt-1">학습을 시작하여 개념을 추가해보세요!</p></div>'
                        }
                    </div>
                </div>

                <!-- 진행률 요약 -->
                <div class="bg-gradient-to-r from-blue-50 to-green-50 p-6 rounded-lg border">
                    <div class="flex justify-between items-center mb-3">
                        <span class="font-semibold text-gray-800">� 전체 마스터 진행률</span>
                        <span class="text-sm text-gray-600">${
                          stats.masteredConcepts
                        }/${stats.totalConcepts}</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-4">
                        <div class="bg-gradient-to-r from-blue-500 to-green-500 h-4 rounded-full transition-all duration-500" style="width: ${
                          stats.totalConcepts > 0
                            ? (stats.masteredConcepts / stats.totalConcepts) *
                              100
                            : 0
                        }%"></div>
                    </div>
                    <div class="flex justify-between items-center mt-2">
                        <p class="text-sm text-gray-600">${
                          stats.totalConcepts > 0
                            ? Math.round(
                                (stats.masteredConcepts / stats.totalConcepts) *
                                  100
                              )
                            : 0
                        }% 완료</p>
                        <p class="text-xs text-blue-600">💡 마스터 기준: 80% 이상</p>
                    </div>
                </div>
            </div>
        `;

    // 모달 제목 변경
    const modalTitle = document.querySelector("#totalWordsModal h2");
    if (modalTitle) {
      modalTitle.textContent = `📚 ${getProgressText("totalWords")}`;
    }

    // 모달 열기
    openModal("totalWordsModal");
  }
}

// 마스터한 단어 카드 클릭 시 모달 열기
function showMasteredWordsDetails() {
  const stats = calculateTargetLanguageStats(selectedTargetLanguage, false); // 캐시 사용

  // 캐시된 개념 데이터 사용
  let detailedConceptsList;
  if (
    cachedConceptData &&
    lastConceptUpdate &&
    Date.now() - lastConceptUpdate < 30000
  ) {
    // 30초 내 캐시 사용
    console.log("�� 마스터한 단어 모달에서 캐시된 개념 데이터 사용");
    detailedConceptsList = cachedConceptData;
  } else {
    console.log("⚠️ 마스터한 단어 모달에서 캐시 없음 - 모달 재계산 필요");
    // 캐시가 없다면 빈 배열로 처리하고 사용자에게 안내
    detailedConceptsList = [];
  }

  const modalBody = document.getElementById("totalWordsModalBody");

  if (modalBody) {
    // 캐시된 데이터에서 마스터한 개념들만 필터링
    const masteredConcepts = detailedConceptsList.filter(
      (concept) => concept.isMastered
    );

    console.log(
      `🎯 마스터한 단어 모달 - 대상 언어: ${selectedTargetLanguage}, 마스터한 개념 수: ${masteredConcepts.length}`
    );

    const masteredList = masteredConcepts
      .map((concept) => {
        const targetWord =
          concept.snapshot?.displayName ||
          concept.conceptId ||
          "알 수 없는 개념";
        const domain = concept.snapshot?.domain || "일반";

        // 도메인별 이모지 가져오기 (domain-category-emoji.js에서)
        const domainEmoji = window.getDomainEmoji
          ? window.getDomainEmoji(domain)
          : "";

        return `
                <div class="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div class="flex items-center space-x-3">
                        <span class="text-lg">✅</span>
                        <div>
                            <p class="font-medium text-gray-900">${domainEmoji} ${targetWord}</p>
                            <p class="text-sm text-gray-500">${getProgressText(
                              "domain"
                            )}: ${domain} | ${getProgressText(
          "masteryProgress"
        )}: ${concept.averageAccuracy}% | ${getProgressText("accuracyRate")}: ${
          concept.accuracyRate || 0
        }%</p>
                        </div>
                    </div>
                    <div class="flex items-center space-x-2">
                        <div class="text-xs text-gray-500 flex items-center space-x-1">
                            <span class="text-green-500">✓${
                              concept.correctCount || 0
                            }</span>
                            <span class="text-red-500">✗${
                              concept.incorrectCount || 0
                            }</span>
                        </div>
                        <span class="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                            ${getProgressText("mastered")}
                        </span>
                    </div>
                </div>
            `;
      })
      .join("");

    modalBody.innerHTML = `
            <div class="space-y-6">
                <!-- 요약 정보 -->
                <div class="bg-green-50 p-4 rounded-lg">
                    <div class="flex items-center justify-between">
                        <div>
                            <h3 class="text-lg font-semibold text-green-800">🎉 ${getProgressText(
                              "completed"
                            )}!</h3>
                            <p class="text-sm text-green-600">${getProgressText(
                              "criteria"
                            )}: 80% ${getProgressText("accuracyRate")} 이상</p>
                        </div>
                        <div class="text-right">
                            <div class="text-2xl font-bold text-green-600">${
                              stats.masteredConcepts
                            }</div>
                            <div class="text-sm text-green-600">/ ${
                              stats.totalConcepts
                            }${getProgressText("concepts")}</div>
                        </div>
                    </div>
                </div>

                <!-- 마스터한 개념 목록 -->
                <div>
                    <h4 class="font-medium text-gray-800 mb-3">${getProgressText(
                      "masteredWords"
                    )} ${getProgressText("list")}</h4>
                    <div class="space-y-2">
                        ${
                          masteredList.length > 0
                            ? masteredList
                            : `<p class="text-gray-500 text-center py-4">${getProgressText(
                                "encourageFirstMaster"
                              )}</p>`
                        }
                    </div>
                </div>

                <!-- 진행률 및 격려 메시지 -->
                <div class="bg-gray-50 p-4 rounded-lg">
                    <div class="flex justify-between items-center mb-2">
                        <span class="font-medium">${getProgressText(
                          "masteryProgressAll"
                        )}</span>
                        <span class="text-sm text-gray-600">${
                          stats.totalConcepts > 0
                            ? Math.round(
                                (stats.masteredConcepts / stats.totalConcepts) *
                                  100
                              )
                            : 0
                        }%</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-3">
                        <div class="bg-green-500 h-3 rounded-full transition-all duration-300" style="width: ${
                          stats.totalConcepts > 0
                            ? (stats.masteredConcepts / stats.totalConcepts) *
                              100
                            : 0
                        }%"></div>
                    </div>
                    <div class="mt-3 text-center">
                        ${
                          stats.masteredConcepts > 0
                            ? `<p class="text-sm text-green-600">🌟 ${getProgressText(
                                "congratsMastered"
                              ).replace("{n}", stats.masteredConcepts)}</p>`
                            : `<p class="text-sm text-gray-600">💪 ${getProgressText(
                                "encourageFirstMaster"
                              )}</p>`
                        }
                    </div>
                </div>
            </div>
        `;

    const modalTitle = document.querySelector("#totalWordsModal h2");
    if (modalTitle) {
      modalTitle.textContent = `✅ ${getProgressText("masteredWords")}`;
    }

    openModal("totalWordsModal");
  }
}

// 연속 학습 카드 클릭 시 모달 열기
function showStudyStreakDetails() {
  const stats = calculateTargetLanguageStats(selectedTargetLanguage, false); // 캐시 사용
  const modalBody = document.getElementById("totalWordsModalBody");

  if (modalBody) {
    const lastStudyText = stats.lastStudyDate
      ? stats.lastStudyDate.toLocaleDateString("ko-KR")
      : "학습 기록 없음";

    // 선택된 대상 언어의 활동 기록들만 필터링
    const learningRecords = allLearningRecords.filter(
      (record) =>
        record.targetLanguage === selectedTargetLanguage ||
        (record.languagePair &&
          record.languagePair.includes &&
          record.languagePair.includes(selectedTargetLanguage)) ||
        (record.language_pair &&
          record.language_pair.target === selectedTargetLanguage) ||
        (record.language_pair &&
          record.language_pair.includes &&
          record.language_pair.includes(selectedTargetLanguage)) ||
        (record.metadata &&
          record.metadata.targetLanguage === selectedTargetLanguage) ||
        record.target_language === selectedTargetLanguage ||
        (record.activity_type === "vocabulary" &&
          selectedTargetLanguage === "english")
    );

    const gameRecords = allGameRecords.filter(
      (record) =>
        record.targetLanguage === selectedTargetLanguage ||
        (record.languagePair &&
          record.languagePair.includes &&
          record.languagePair.includes(selectedTargetLanguage)) ||
        (record.language_pair &&
          record.language_pair.target === selectedTargetLanguage) ||
        (record.language_pair &&
          record.language_pair.includes &&
          record.language_pair.includes(selectedTargetLanguage)) ||
        (record.metadata &&
          record.metadata.targetLanguage === selectedTargetLanguage) ||
        (record.game_type === "word-matching" &&
          selectedTargetLanguage === "english")
    );

    const quizRecords = allQuizRecords.filter(
      (record) =>
        record.targetLanguage === selectedTargetLanguage ||
        (record.languagePair &&
          record.languagePair.includes &&
          record.languagePair.includes(selectedTargetLanguage)) ||
        (record.language_pair &&
          record.language_pair.target === selectedTargetLanguage) ||
        (record.metadata &&
          record.metadata.targetLanguage === selectedTargetLanguage) ||
        record.target_language === selectedTargetLanguage ||
        (record.quiz_type === "translation" &&
          selectedTargetLanguage === "english")
    );

    // 날짜별 학습 기록 생성 (선택된 언어만)
    const studyDatesSet = new Set();
    const allRecords = [...learningRecords, ...gameRecords, ...quizRecords];

    console.log(
      `🔥 연속 학습 모달 - 대상 언어: ${selectedTargetLanguage}, 필터된 기록 수: ${allRecords.length}`
    );

    // 필터된 기록에서 날짜 추출 (다양한 날짜 필드 확인)
    allRecords.forEach((record) => {
      let dateField =
        record.completed_at || record.timestamp || record.created_at;
      if (dateField) {
        let date;
        if (dateField.toDate) {
          date = dateField.toDate();
        } else if (dateField instanceof Date) {
          date = dateField;
        } else {
          date = new Date(dateField);
        }
        const dateStr = date.toDateString();
        studyDatesSet.add(dateStr);
        console.log(`📅 학습 기록 날짜 추가: ${dateStr} (${record.id})`);
      }
    });

    // 최근 학습 기록 날짜별 도장 UI 생성 (이전 7일 + 오늘 + 이후 2일 = 총 10일)
    const today = new Date();
    const calendarDays = [];

    for (let i = 7; i >= -2; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toDateString();
      const hasStudy = studyDatesSet.has(dateStr);
      const isToday = i === 0;
      const isFuture = i < 0;

      calendarDays.push(`
                <div class="flex flex-col items-center p-2 rounded-lg ${
                  hasStudy
                    ? "bg-green-100"
                    : isFuture
                    ? "bg-gray-50"
                    : "bg-gray-100"
                } ${isToday ? "border-2 border-blue-500" : "border"}">
                    <div class="text-xs ${
                      isToday ? "text-blue-600 font-bold" : "text-gray-600"
                    } mb-1">${date.getDate()}${
        isToday ? `(${getProgressText("today")})` : ""
      }</div>
                    <div class="text-lg">${
                      hasStudy ? "🏆" : isFuture ? "📅" : "○"
                    }</div>
                </div>
            `);
    }

    modalBody.innerHTML = `
  <div class="space-y-4">
    <h3 class="text-lg font-semibold text-gray-800">📅 ${getProgressText(
      "streakDetails"
    )}</h3>
    <div class="bg-white border border-gray-200 p-4 rounded-lg">
      <h4 class="font-medium text-gray-800 mb-3">📅 ${getProgressText(
        "recentStudyHistory"
      )} (10${getProgressText("day")})</h4>
      <div class="grid grid-cols-5 md:grid-cols-10 gap-2 text-center">
        ${calendarDays.join("")}
      </div>
      <div class="flex items-center justify-center mt-3 space-x-4">
        <div class="flex items-center space-x-1">
          <span class="text-sm">🏆</span>
          <span class="text-xs text-gray-600">${getProgressText(
            "studyCompleted"
          )}</span>
        </div>
        <div class="flex items-center space-x-1">
          <span class="text-sm">○</span>
          <span class="text-xs text-gray-600">${getProgressText(
            "noLearningRecords"
          )}</span>
        </div>
      </div>
    </div>
    <div class="bg-gray-50 p-4 rounded-lg">
      <p class="text-sm text-gray-600 mb-2">${getProgressText(
        "learningActivitySummary"
      )}</p>
      <div class="space-y-2">
        <div class="flex justify-between">
          <span class="text-sm">${getProgressText(
            "totalLearningSessions"
          )}:</span>
          <span class="font-medium">${learningRecords.length}${getProgressText(
      "times"
    )}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-sm">${getProgressText("totalStudyTime")}:</span>
          <span class="font-medium">${Math.floor(
            stats.totalStudyTime / 60
          )}${getProgressText("hours")} ${
      stats.totalStudyTime % 60
    }${getProgressText("minutes")}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-sm">${getProgressText("averageAccuracy")}:</span>
          <span class="font-medium">${Math.round(stats.averageAccuracy)}%</span>
        </div>
      </div>
    </div>
    <div class="bg-orange-50 p-4 rounded-lg">
      <p class="text-sm text-gray-600">🔥 ${getProgressText(
        "streakEncourage"
      )}</p>
    </div>
  </div>
`;

    const modalTitle = document.querySelector("#totalWordsModal h2");
    if (modalTitle) {
      modalTitle.textContent = `🔥 ${getProgressText("streakTitle")}`;
    }

    openModal("totalWordsModal");
  }
}

// 게임 성취도 카드 클릭 시 모달 열기
function showGameAchievementsDetails() {
  const stats = calculateTargetLanguageStats(selectedTargetLanguage);
  const modalBody = document.getElementById("totalWordsModalBody");

  if (modalBody) {
    const gameRecords = allGameRecords.filter(
      (record) =>
        record.targetLanguage === selectedTargetLanguage ||
        (record.languagePair &&
          record.languagePair.includes(selectedTargetLanguage))
    );

    // 게임 기록을 최신순으로 정렬
    const sortedGames = gameRecords.sort((a, b) => {
      const dateA = a.timestamp?.toDate
        ? a.timestamp.toDate()
        : new Date(a.timestamp);
      const dateB = b.timestamp?.toDate
        ? b.timestamp.toDate()
        : new Date(b.timestamp);
      return dateB - dateA;
    });

    const gamesList = sortedGames
      .map((game) => {
        const date = game.timestamp?.toDate
          ? game.timestamp.toDate()
          : new Date(game.timestamp);
        const formattedDate = date.toLocaleDateString("ko-KR");
        const formattedTime = date.toLocaleTimeString("ko-KR", {
          hour: "2-digit",
          minute: "2-digit",
        });
        const gameType = game.gameType || "default";
        const score = game.score || 0;
        const timeTaken = game.timeTaken || 0;

        return `
                <div class="flex items-center justify-between p-3 bg-purple-50 border border-purple-200 rounded-lg">
                    <div class="flex items-center space-x-3">
                        <span class="text-lg">🎮</span>
                        <div>
                            <p class="font-medium text-gray-900">${
                              gameType === "word_match" ? "단어 매칭" : "게임"
                            }</p>
                            <p class="text-sm text-gray-500">${formattedDate} ${formattedTime}</p>
                        </div>
                    </div>
                    <div class="text-right">
                        <div class="text-lg font-bold text-purple-600">${score}점</div>
                        <div class="text-xs text-gray-500">${timeTaken}초</div>
                    </div>
                </div>
            `;
      })
      .join("");

    modalBody.innerHTML = `
            <div class="space-y-6">
                <!-- 게임 통계 요약 -->
                <div class="grid grid-cols-3 gap-4">
                    <div class="bg-purple-50 p-4 rounded-lg text-center">
                        <div class="text-2xl mb-1">🎮</div>
                        <div class="text-lg font-bold text-purple-600">${
                          stats.gameStats.totalGames
                        }</div>
                        <div class="text-sm text-gray-600">총 게임 수</div>
                    </div>
                    <div class="bg-blue-50 p-4 rounded-lg text-center">
                        <div class="text-2xl mb-1">⭐</div>
                        <div class="text-lg font-bold text-blue-600">${Math.round(
                          stats.gameStats.averageScore
                        )}</div>
                        <div class="text-sm text-gray-600">평균 점수</div>
                    </div>
                    <div class="bg-green-50 p-4 rounded-lg text-center">
                        <div class="text-2xl mb-1">🏆</div>
                        <div class="text-lg font-bold text-green-600">${
                          stats.gameStats.bestScore
                        }</div>
                        <div class="text-sm text-gray-600">최고 점수</div>
                    </div>
                </div>

                <!-- 게임 기록 목록 -->
                <div>
                    <h4 class="font-medium text-gray-800 mb-3">최근 게임 기록</h4>
                    <div class="space-y-2 max-h-64 overflow-y-auto">
                        ${
                          gamesList.length > 0
                            ? gamesList
                            : '<p class="text-gray-500 text-center py-4">게임 기록이 없습니다.</p>'
                        }
                    </div>
                </div>

                <!-- 게임 성과 분석 -->
                <div class="bg-gray-50 p-4 rounded-lg">
                    <h4 class="font-medium text-gray-800 mb-3">성과 분석</h4>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <p class="text-sm text-gray-600">총 플레이 시간</p>
                            <p class="font-bold text-purple-600">${Math.floor(
                              stats.gameStats.totalTimePlayed / 60
                            )}분 ${stats.gameStats.totalTimePlayed % 60}초</p>
                        </div>
                        <div>
                            <p class="text-sm text-gray-600">게임당 평균 시간</p>
                            <p class="font-bold text-blue-600">${
                              stats.gameStats.totalGames > 0
                                ? Math.round(
                                    stats.gameStats.totalTimePlayed /
                                      stats.gameStats.totalGames
                                  )
                                : 0
                            }초</p>
                        </div>
                        <div>
                            <p class="text-sm text-gray-600">점수 향상도</p>
                            <p class="font-bold text-green-600">${
                              stats.gameStats.bestScore >
                              stats.gameStats.averageScore
                                ? "+" +
                                  Math.round(
                                    stats.gameStats.bestScore -
                                      stats.gameStats.averageScore
                                  )
                                : "0"
                            }점</p>
                        </div>
                        <div>
                            <p class="text-sm text-gray-600">실력 평가</p>
                            <p class="font-bold text-orange-600">
                                ${
                                  stats.gameStats.averageScore >= 300
                                    ? "고수"
                                    : stats.gameStats.averageScore >= 200
                                    ? "중급자"
                                    : stats.gameStats.averageScore >= 100
                                    ? "초보자"
                                    : "입문자"
                                }
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        `;

    const modalTitle = document.querySelector("#totalWordsModal h2");
    if (modalTitle) {
      modalTitle.textContent = "🎮 게임 성취도";
    }

    openModal("totalWordsModal");
  }
}

// 퀴즈 통계 토글 함수
function toggleQuizDetails(conceptId) {
  const detailsElement = document.getElementById(`quiz-details-${conceptId}`);
  if (detailsElement) {
    const isVisible = detailsElement.style.display !== "none";
    detailsElement.style.display = isVisible ? "none" : "block";
  }
}

// 모달 열기 함수
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = "flex";
    document.body.style.overflow = "hidden"; // 배경 스크롤 방지
  }
}

// 모달 닫기 함수
function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = "none";
    document.body.style.overflow = "auto"; // 배경 스크롤 복원
  }
}

// 총 단어 모달 닫기 (기존 함수명 유지)
function closeTotalWordsModal() {
  closeModal("totalWordsModal");
}

// Refresh progress data (for manual refresh)
async function refreshProgressData() {
  console.log("Refreshing progress data...");
  await loadProgressData();
  updateUI();
}

// Save learning activity with concept snapshot in user_records
async function saveLearningActivity(
  conceptId,
  targetLanguage,
  accuracy,
  studyTime,
  conceptData = {}
) {
  if (!currentUser) return;

  try {
    const { collection, addDoc, db } = window.firebaseInit;

    const learningRecord = {
      user_email: currentUser.email,
      conceptId: conceptId,
      concept_id: [conceptId], // 배열 형태로 통일
      targetLanguage: targetLanguage,
      accuracy: accuracy,
      studyTime: studyTime,
      conceptData: conceptData, // 개념 스냅샷을 활동 기록에 포함
      timestamp: new Date(),
      type: "learning",
    };

    // Save to learning_records collection
    const docRef = await addDoc(
      collection(db, "learning_records"),
      learningRecord
    );
    console.log("✅ Learning activity saved:", docRef.id);

    // 개념 스냅샷을 user_records에도 저장
    if (conceptData.word || conceptData.term) {
      await saveConceptSnapshotToUserRecords(
        conceptId,
        conceptData,
        targetLanguage
      );
    }

    // Update local data and UI
    allLearningRecords.push({ id: docRef.id, ...learningRecord });
    await updateTargetLanguageStats(targetLanguage);
    updateUI();

    return docRef.id;
  } catch (error) {
    console.error("Error saving learning activity:", error);
  }
}

// user_records에 개념 스냅샷 저장 (비용 효율적)
async function saveConceptSnapshotToUserRecords(
  conceptId,
  conceptData,
  targetLanguage
) {
  if (!conceptId || !conceptData || !currentUser) {
    console.log("⚠️ 개념 스냅샷 저장 스킵: 필수 데이터 없음");
    return;
  }

  try {
    const { doc, getDoc, updateDoc, setDoc, db } = window.firebaseInit;
    const userRecordRef = doc(db, "user_records", currentUser.email);

    // 개념 스냅샷 객체
    const conceptSnapshot = {
      word: conceptData.word || conceptData.term || conceptId,
      definition: conceptData.definition || "",
      example: conceptData.example || "",
      source_language: conceptData.source_language || "korean",
      target_language:
        targetLanguage ||
        conceptData.target_language ||
        selectedTargetLanguage ||
        "english",
      domain: conceptData.domain || "일반",
      category: conceptData.category || "기타",
      last_updated: new Date(),
    };

    // user_records 문서 확인
    const userDoc = await getDoc(userRecordRef);

    if (userDoc.exists()) {
      // 기존 문서가 있으면 concept_snapshots 필드에 추가/업데이트
      await updateDoc(userRecordRef, {
        [`concept_snapshots.${conceptId}`]: conceptSnapshot,
        last_updated: new Date(),
      });
      console.log(
        `✅ 개념 스냅샷 user_records 업데이트: ${conceptId} -> ${conceptSnapshot.word}`
      );
    } else {
      // 새 문서 생성
      const initialData = {
        concept_snapshots: {
          [conceptId]: conceptSnapshot,
        },
        created_at: new Date(),
        last_updated: new Date(),
        version: "3.0",
      };
      await setDoc(userRecordRef, initialData, { merge: true });
      console.log(
        `✅ 개념 스냅샷 user_records 생성: ${conceptId} -> ${conceptSnapshot.word}`
      );
    }

    return conceptSnapshot;
  } catch (error) {
    console.error("❌ user_records 개념 스냅샷 저장 오류:", conceptId, error);
    return null;
  }
}

// Save game activity with concept snapshot in records
async function saveGameActivity(
  targetLanguage,
  score,
  timeTaken,
  gameType = "default",
  gameData = {}
) {
  if (!currentUser) return;

  try {
    const { collection, addDoc, db } = window.firebaseInit;

    const gameRecord = {
      user_email: currentUser.email,
      targetLanguage: targetLanguage,
      score: score,
      timeTaken: timeTaken,
      gameType: gameType,
      gameData: gameData, // 개념 정보 포함
      concept_id: gameData.concepts
        ? gameData.concepts.map((c) => c.id).filter((id) => id)
        : [],
      timestamp: new Date(),
      type: "game",
    };

    // Save to game_records collection
    const docRef = await addDoc(collection(db, "game_records"), gameRecord);
    console.log("✅ Game activity saved:", docRef.id);

    // 게임 데이터의 개념들을 user_records에 저장
    if (gameData.concepts && Array.isArray(gameData.concepts)) {
      for (const concept of gameData.concepts) {
        if (concept.id && concept.word) {
          await saveConceptSnapshotToUserRecords(
            concept.id,
            concept,
            targetLanguage
          );
        }
      }
    }

    // Update local data and UI
    allGameRecords.push({ id: docRef.id, ...gameRecord });
    await updateTargetLanguageStats(targetLanguage);
    updateUI();

    return docRef.id;
  } catch (error) {
    console.error("Error saving game activity:", error);
  }
}

// Save quiz activity with concept snapshot in records
async function saveQuizActivity(
  targetLanguage,
  score,
  correctAnswers,
  totalQuestions,
  quizData = {}
) {
  if (!currentUser) return;

  try {
    const { collection, addDoc, db } = window.firebaseInit;

    const quizRecord = {
      user_email: currentUser.email,
      targetLanguage: targetLanguage,
      score: score,
      correctAnswers: correctAnswers,
      totalQuestions: totalQuestions,
      quizData: quizData, // 개념 정보 포함
      concept_id: quizData.concepts
        ? quizData.concepts.map((c) => c.id).filter((id) => id)
        : [],
      timestamp: new Date(),
      type: "quiz",
    };

    // Save to quiz_records collection
    const docRef = await addDoc(collection(db, "quiz_records"), quizRecord);
    console.log("✅ Quiz activity saved:", docRef.id);

    // 퀴즈 데이터의 개념들을 user_records에 저장
    if (quizData.concepts && Array.isArray(quizData.concepts)) {
      for (const concept of quizData.concepts) {
        if (concept.id && concept.word) {
          await saveConceptSnapshotToUserRecords(
            concept.id,
            concept,
            targetLanguage
          );
        }
      }
    }

    // Update local data and UI
    allQuizRecords.push({ id: docRef.id, ...quizRecord });
    await updateTargetLanguageStats(targetLanguage);
    updateUI();

    return docRef.id;
  } catch (error) {
    console.error("Error saving quiz activity:", error);
  }
}

// Update target language stats in user_records
async function updateTargetLanguageStats(targetLanguage) {
  if (!currentUser) return;

  try {
    const { doc, updateDoc, getDoc, setDoc, db } = window.firebaseInit;
    const userRecordRef = doc(db, "user_records", currentUser.email);

    // 새로운 통계 계산 (완전한 구조)
    const newStats = calculateCompleteStatsForTargetLanguage(targetLanguage);
    console.log(`🔄 Updating complete stats for ${targetLanguage}:`, newStats);

    // 먼저 문서가 존재하는지 확인
    const docSnap = await getDoc(userRecordRef);

    if (!docSnap.exists()) {
      // 문서가 없으면 새로 생성
      const initialStructure = {
        target_languages: {
          [targetLanguage]: {
            ...newStats,
            last_updated: new Date(),
          },
        },
        concept_snapshots: {}, // 빈 스냅샷 객체로 초기화
        created_at: new Date(),
        version: "3.0",
      };
      await setDoc(userRecordRef, initialStructure);
      console.log(
        `✅ Created new user_records with ${targetLanguage} stats (concept_snapshots 포함)`
      );
    } else {
      // 문서가 있으면 해당 언어만 업데이트 (concept_snapshots 보존)
      await updateDoc(userRecordRef, {
        [`target_languages.${targetLanguage}`]: {
          ...newStats,
          last_updated: new Date(),
        },
        last_updated: new Date(),
        version: "3.0",
      });
      console.log(
        `✅ Updated ${targetLanguage} complete stats in user_records`
      );
    }

    // 업데이트된 데이터 다시 로드
    const updatedSnap = await getDoc(userRecordRef);
    if (updatedSnap.exists()) {
      userProgressData = updatedSnap.data();
      console.log("✅ User progress data reloaded after update");
    }
  } catch (error) {
    console.error(`Error updating ${targetLanguage} stats:`, error);
  }
}

// Utility function to format time
function formatTime(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) {
    return `${hours}시간 ${mins}분`;
  }
  return `${mins}분`;
}

// Export functions for testing
window.progressModule = {
  calculateTargetLanguageStats,
  loadProgressData,
  updateUI,
  calculateStreak,
  refreshProgressData,
  showQuizAccuracyDetails,
  saveLearningActivity,
  saveGameActivity,
  saveQuizActivity,
};

// Make functions globally available
window.showQuizAccuracyDetails = showQuizAccuracyDetails;
window.refreshProgressData = refreshProgressData;
window.saveLearningActivity = saveLearningActivity;
window.saveGameActivity = saveGameActivity;
window.saveQuizActivity = saveQuizActivity;
window.updateUI = updateUI;
window.calculateTargetLanguageStats = calculateTargetLanguageStats;

// 모달 관련 함수들도 전역으로 노출
window.showTotalWordsDetails = showTotalWordsDetails;
window.showMasteredWordsDetails = showMasteredWordsDetails;
window.showStudyStreakDetails = showStudyStreakDetails;
window.showQuizAccuracyDetails = showQuizAccuracyDetails;
window.showGameAchievementsDetails = showGameAchievementsDetails;
window.openModal = openModal;
window.closeModal = closeModal;
window.closeTotalWordsModal = closeTotalWordsModal;

// 학습 목표 저장 기능
document.addEventListener("DOMContentLoaded", function () {
  const saveGoalsBtn = document.getElementById("save-goals-btn");
  if (saveGoalsBtn) {
    saveGoalsBtn.addEventListener("click", function () {
      const dailyWordsGoal =
        document.getElementById("daily-words-goal")?.value || 10;
      const dailyQuizGoal =
        document.getElementById("daily-quiz-goal")?.value || 20;
      const weeklyDaysGoal =
        document.getElementById("weekly-days-goal")?.value || 5;
      const weeklyMasteryGoal =
        document.getElementById("weekly-mastery-goal")?.value || 30;

      const goals = {
        dailyWords: parseInt(dailyWordsGoal),
        dailyQuiz: parseInt(dailyQuizGoal),
        weeklyDays: parseInt(weeklyDaysGoal),
        weeklyMastery: parseInt(weeklyMasteryGoal),
        savedAt: new Date().toISOString(),
      };

      localStorage.setItem(
        `learningGoals_${selectedTargetLanguage}`,
        JSON.stringify(goals)
      );

      // 진행률 즉시 업데이트
      const currentStats = calculateTargetLanguageStats(selectedTargetLanguage);
      updateLearningGoalsProgress(currentStats);

      // 저장 완료 알림
      saveGoalsBtn.textContent = "✅ 저장 완료";
      saveGoalsBtn.classList.add("bg-green-600");
      saveGoalsBtn.classList.remove("bg-blue-600");

      setTimeout(() => {
        saveGoalsBtn.textContent = "목표 저장";
        saveGoalsBtn.classList.remove("bg-green-600");
        saveGoalsBtn.classList.add("bg-blue-600");
      }, 2000);

      console.log(`🎯 학습 목표 저장 완료 - ${selectedTargetLanguage}:`, goals);
    });
  }

  // 페이지 로드 시 저장된 목표 불러오기
  function loadSavedGoals() {
    const savedGoals = localStorage.getItem(
      `learningGoals_${selectedTargetLanguage}`
    );
    if (savedGoals) {
      const goals = JSON.parse(savedGoals);

      const dailyWordsGoalEl = document.getElementById("daily-words-goal");
      const dailyQuizGoalEl = document.getElementById("daily-quiz-goal");
      const weeklyDaysGoalEl = document.getElementById("weekly-days-goal");
      const weeklyMasteryGoalEl = document.getElementById(
        "weekly-mastery-goal"
      );

      if (dailyWordsGoalEl) dailyWordsGoalEl.value = goals.dailyWords || 10;
      if (dailyQuizGoalEl) dailyQuizGoalEl.value = goals.dailyQuiz || 20;
      if (weeklyDaysGoalEl) weeklyDaysGoalEl.value = goals.weeklyDays || 5;
      if (weeklyMasteryGoalEl)
        weeklyMasteryGoalEl.value = goals.weeklyMastery || 30;

      console.log(
        `🎯 저장된 학습 목표 로드 완료 - ${selectedTargetLanguage}:`,
        goals
      );
    }
  }

  // 언어 변경 시에도 목표 로드
  const targetLanguageSelector = document.getElementById(
    "target-language-filter"
  );
  if (targetLanguageSelector) {
    targetLanguageSelector.addEventListener("change", function () {
      setTimeout(loadSavedGoals, 100);
    });
  }

  // 초기 로드
  loadSavedGoals();
});

// Test function to add sample data with proper snapshots
window.addTestData = async function () {
  console.log("🔄 구조화된 스냅샷 테스트 데이터 추가 중...");

  try {
    // 영어 학습 활동 (구조화된 개념 데이터)
    console.log("� 영어 학습 활동 추가...");
    await saveLearningActivity("concept_hello_001", "english", 85, 10, {
      word: "hello",
      definition: "인사말, 안녕",
      example: "Hello, how are you?",
      domain: "일상",
      category: "명사",
      source_language: "english",
      target_language: "korean",
    });

    await saveLearningActivity("concept_phone_001", "english", 92, 8, {
      word: "phone",
      definition: "전화기",
      example: "I need to answer the phone.",
      domain: "기술",
      category: "명사",
      source_language: "english",
      target_language: "korean",
    });

    await saveLearningActivity("concept_shopping_001", "english", 78, 12, {
      word: "shopping",
      definition: "쇼핑, 물건 사기",
      example: "I love shopping at the mall.",
      domain: "일상",
      category: "명사",
      source_language: "english",
      target_language: "korean",
    });

    // 영어 게임 활동
    console.log("🎮 영어 게임 활동 추가...");
    await saveGameActivity("english", 250, 180, "word_match", {
      level: 1,
      concepts: [
        { id: "concept_phone_001", word: "phone" },
        { id: "concept_shopping_001", word: "shopping" },
      ],
    });

    await saveGameActivity("english", 320, 165, "word_match", {
      level: 2,
      concepts: [
        { id: "concept_hello_001", word: "hello" },
        {
          id: "concept_study_001",
          word: "study",
          domain: "학문",
          category: "동사",
        },
      ],
    });

    // 영어 퀴즈 활동
    console.log("❓ 영어 퀴즈 활동 추가...");
    await saveQuizActivity("english", 80, 4, 5, {
      category: "vocabulary",
      concepts: [
        { id: "concept_phone_001", word: "phone" },
        { id: "concept_hello_001", word: "hello" },
      ],
    });

    await saveQuizActivity("english", 90, 9, 10, {
      category: "vocabulary",
      concepts: [
        { id: "concept_shopping_001", word: "shopping" },
        { id: "concept_study_001", word: "study" },
      ],
    });

    console.log("✅ 구조화된 테스트 데이터 추가 완료!");
    console.log("🔄 UI 새로고침...");
    updateUI();

    // 개념 스냅샷 확인
    setTimeout(() => {
      checkConceptSnapshots();
    }, 2000);
  } catch (error) {
    console.error("테스트 데이터 추가 오류:", error);
  }
};

// user_records의 개념 스냅샷 확인 함수
window.checkConceptSnapshots = async function () {
  if (!currentUser) {
    console.log("❌ 사용자가 인증되지 않음");
    return;
  }

  try {
    const { doc, getDoc, db } = window.firebaseInit;
    const userRecordRef = doc(db, "user_records", currentUser.email);
    const userDoc = await getDoc(userRecordRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      const conceptSnapshots = userData.concept_snapshots || {};

      console.log("🔍 user_records의 개념 스냅샷 확인:");
      console.log(`📊 총 개념 수: ${Object.keys(conceptSnapshots).length}개`);

      Object.entries(conceptSnapshots).forEach(([conceptId, data]) => {
        console.log(`📝 ${conceptId}:`, {
          word: data.word,
          domain: data.domain,
          category: data.category,
          source_language: data.source_language,
          target_language: data.target_language,
        });
      });
    } else {
      console.log("❌ user_records 문서가 존재하지 않음");
    }

    // 활동 기록의 개념 ID 매핑 확인
    console.log("🔄 활동 기록의 개념 매핑 확인:");
    allLearningRecords.forEach((record, index) => {
      console.log(`📚 학습 기록 ${index + 1}:`, {
        concept_id: record.concept_id,
        conceptId: record.conceptId,
        conceptData: record.conceptData?.word,
      });
    });
  } catch (error) {
    console.error("user_records 개념 스냅샷 확인 오류:", error);
  }
};

// 개별 단어의 마스터 진행률 계산 함수
const calculateConceptMastery = (concept, allRecords) => {
  const { learningRecords, quizRecords, gameRecords } = allRecords;

  // 기본 마스터 진행률 (50%)
  let masteryPercentage = 50;

  // 등장 횟수 계산 및 보너스 적용
  let appearanceCount = 0;

  // 학습 기록에서 등장 횟수 계산 (concept_id가 배열인 경우도 처리)
  const conceptLearningRecords = learningRecords.filter((record) => {
    if (Array.isArray(record.concept_id)) {
      return record.concept_id.includes(concept.id);
    } else if (Array.isArray(record.conceptId)) {
      return record.conceptId.includes(concept.id);
    }
    return record.concept_id === concept.id || record.conceptId === concept.id;
  });

  // 퀴즈 기록에서 등장 횟수 계산 (concept_id가 배열인 경우도 처리)
  const conceptQuizRecords = quizRecords.filter((record) => {
    if (Array.isArray(record.concept_id)) {
      return record.concept_id.includes(concept.id);
    } else if (Array.isArray(record.conceptId)) {
      return record.conceptId.includes(concept.id);
    } else if (Array.isArray(record.concept_ids)) {
      return record.concept_ids.includes(concept.id);
    }
    return (
      record.concept_id === concept.id ||
      record.conceptId === concept.id ||
      record.concept_ids === concept.id
    );
  });

  // 게임 기록에서 등장 횟수 계산 (concept_id가 배열인 경우도 처리)
  const conceptGameRecords = gameRecords.filter((record) => {
    if (Array.isArray(record.concept_id)) {
      return record.concept_id.includes(concept.id);
    } else if (Array.isArray(record.conceptId)) {
      return record.conceptId.includes(concept.id);
    }
    return record.concept_id === concept.id || record.conceptId === concept.id;
  });

  // 각 활동 유형별로 최대 1회씩만 카운트
  if (conceptLearningRecords.length > 0) appearanceCount++;
  if (conceptQuizRecords.length > 0) appearanceCount++;
  if (conceptGameRecords.length > 0) appearanceCount++;

  // 등장 횟수별 보너스 적용 (+3% per appearance)
  masteryPercentage += appearanceCount * 3;

  // 퀴즈 정답/오답에 따른 조정 (타이핑 학습은 제외)
  let correctCount = 0;
  let incorrectCount = 0;
  let totalQuizzes = 0;

  console.log(`🎯 ${concept.id} 퀴즈 기록 분석:`, conceptQuizRecords);

  conceptQuizRecords.forEach((record) => {
    // 타이핑 학습은 정답/오답 계산에서 제외 (등장 횟수 보너스는 이미 적용됨)
    if (record.activity_type === "typing" || record.quiz_type === "typing") {
      return; // 타이핑 학습은 건너뜀
    }

    console.log(`🎯 퀴즈 기록 분석:`, {
      conceptId: concept.id,
      recordId: record.id,
      isCorrect: record.isCorrect,
      correct_answers: record.correct_answers,
      total_questions: record.total_questions,
      accuracy: record.accuracy,
    });

    // isCorrect 필드가 있는 경우
    if (typeof record.isCorrect === "boolean") {
      totalQuizzes++;
      if (record.isCorrect) {
        correctCount++;
        masteryPercentage += 10; // 정답 시 +10%
      } else {
        incorrectCount++;
        masteryPercentage -= 5; // 오답 시 -5%
      }
    } else if (
      record.correct_answers !== undefined &&
      record.total_questions !== undefined
    ) {
      // correct_answers/total_questions 기반 계산
      const quizCorrect = record.correct_answers || 0;
      const quizTotal = record.total_questions || 0;
      const quizIncorrect = quizTotal - quizCorrect;

      totalQuizzes += quizTotal;
      correctCount += quizCorrect;
      incorrectCount += quizIncorrect;

      // 정답/오답에 따른 마스터리 조정
      masteryPercentage += quizCorrect * 10; // 정답 당 +10%
      masteryPercentage -= quizIncorrect * 5; // 오답 당 -5%
    }
  });

  // 마스터 진행률 범위 제한 (0% ~ 100%)
  masteryPercentage = Math.max(0, Math.min(100, masteryPercentage));

  // 정확도 계산
  const accuracyRate =
    totalQuizzes > 0 ? (correctCount / totalQuizzes) * 100 : 0;

  const result = {
    masteryPercentage: Math.round(masteryPercentage),
    appearanceCount,
    correctCount,
    incorrectCount,
    totalQuizzes,
    accuracyRate: Math.round(accuracyRate * 10) / 10, // 소수점 첫째자리까지
    learningCount: conceptLearningRecords.length,
    gameCount: conceptGameRecords.length,
    quizCount: conceptQuizRecords.length,
  };

  console.log(`🎯 ${concept.id} 마스터리 계산 결과:`, result);

  return result;
};

// Debug function to check user_records structure
window.checkUserRecords = async function () {
  if (!currentUser) {
    console.log("No user authenticated");
    return;
  }

  try {
    const { doc, getDoc, db } = window.firebaseInit;
    const userRecordRef = doc(db, "user_records", currentUser.email);
    const userRecordSnap = await getDoc(userRecordRef);

    if (userRecordSnap.exists()) {
      const userData = userRecordSnap.data();
      console.log("🔍 Current user_records structure:", userData);

      if (userData.target_languages) {
        console.log("📊 Target languages found:");
        Object.keys(userData.target_languages).forEach((lang) => {
          console.log(`  ${lang}:`, userData.target_languages[lang]);
        });
      } else {
        console.log("❌ No target_languages structure found");
      }
    } else {
      console.log("❌ User record does not exist");
    }
  } catch (error) {
    console.error("Error checking user records:", error);
  }
};

// Debug function to check all activity records
window.checkActivityRecords = async function () {
  if (!currentUser) {
    console.log("No user authenticated");
    return;
  }

  console.log("🔍 Current activity records:");
  console.log("Learning records:", allLearningRecords.length);
  console.log("Game records:", allGameRecords.length);
  console.log("Quiz records:", allQuizRecords.length);

  // Group by target language
  const groupedData = {
    english: {
      learning: allLearningRecords.filter(
        (r) => r.targetLanguage === "english"
      ),
      games: allGameRecords.filter((r) => r.targetLanguage === "english"),
      quizzes: allQuizRecords.filter((r) => r.targetLanguage === "english"),
    },
    japanese: {
      learning: allLearningRecords.filter(
        (r) => r.targetLanguage === "japanese"
      ),
      games: allGameRecords.filter((r) => r.targetLanguage === "japanese"),
      quizzes: allQuizRecords.filter((r) => r.targetLanguage === "japanese"),
    },
  };

  Object.keys(groupedData).forEach((lang) => {
    console.log(`📊 ${lang}:`, {
      learning: groupedData[lang].learning.length,
      games: groupedData[lang].games.length,
      quizzes: groupedData[lang].quizzes.length,
    });
  });
};

// 활동 기록에서 개념 스냅샷 생성
function createConceptSnapshotFromActivity(conceptId, conceptData) {
  return {
    conceptId,
    displayName:
      conceptData.word || conceptData.term || conceptId.substring(0, 12),
    sourceLanguage: conceptData.source_language || "korean",
    targetLanguage: conceptData.target_language || selectedTargetLanguage,
    sourceFlag: getLanguageFlag(conceptData.source_language || "korean"),
    targetFlag: getLanguageFlag(
      conceptData.target_language || selectedTargetLanguage
    ),
    domain: conceptData.domain || "일반",
    category: conceptData.category || "기타",
    domainColor: getDomainColor(conceptData.domain || "일반"),
    categoryColor: getCategoryColor(conceptData.category || "기타"),
    definition: conceptData.definition || "",
    example: conceptData.example || "",
  };
}

// 🔧 개념 컬렉션에서 정보 가져와서 스냅샷 생성
async function fetchAndCreateConceptSnapshot(conceptId) {
  try {
    const { doc, getDoc, db } = window.firebaseInit;
    const conceptRef = doc(db, "concepts", conceptId);
    const conceptDoc = await getDoc(conceptRef);

    if (conceptDoc.exists()) {
      const conceptData = conceptDoc.data();
      const conceptInfo = conceptData.concept_info || {};
      const expressions = conceptData.expressions || {};

      // 대상 언어별 단어 정보 추출
      const sourceLanguage = "korean"; // 기본값
      const targetLanguage = selectedTargetLanguage || "english";

      // expressions에서 해당 언어의 단어 추출
      const sourceWord =
        expressions[sourceLanguage]?.word || conceptId.substring(0, 12);
      const targetWord =
        expressions[targetLanguage]?.word || conceptId.substring(0, 12);

      const snapshot = {
        conceptId,
        displayName: `${sourceWord} → ${targetWord}`,
        sourceLanguage,
        targetLanguage,
        sourceFlag: getLanguageFlag(sourceLanguage),
        targetFlag: getLanguageFlag(targetLanguage),
        domain: conceptInfo.domain || "일반",
        category: conceptInfo.category || "기타",
        domainColor: getDomainColor(conceptInfo.domain || "일반"),
        categoryColor: getCategoryColor(conceptInfo.category || "기타"),
        definition: conceptInfo.definition || "",
        example: conceptInfo.example || "",
        sourceWord,
        targetWord,
      };

      // user_records에 스냅샷 저장
      await saveConceptSnapshotToUserRecords(
        conceptId,
        {
          word: targetWord,
          source_word: sourceWord,
          source_language: sourceLanguage,
          target_language: targetLanguage,
          domain: conceptInfo.domain || "일반",
          category: conceptInfo.category || "기타",
          definition: conceptInfo.definition || "",
          example: conceptInfo.example || "",
        },
        targetLanguage
      );

      console.log(
        `✅ 개념 스냅샷 생성 완료: ${conceptId} -> ${snapshot.displayName}`
      );
      return snapshot;
    } else {
      console.log(`⚠️ concepts 컬렉션에 없음: ${conceptId}`);
      return createDefaultSnapshot(conceptId);
    }
  } catch (error) {
    console.error(`개념 스냅샷 생성 오류: ${conceptId}`, error);
    return createDefaultSnapshot(conceptId);
  }
}

// 🔧 user_records에서 개념 스냅샷 조회 (비용 효율적)
async function fetchConceptSnapshotFromUserRecords(conceptId) {
  try {
    const { doc, getDoc, db } = window.firebaseInit;
    const userRecordRef = doc(db, "user_records", currentUser.email);
    const userDoc = await getDoc(userRecordRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      const conceptSnapshots = userData.concept_snapshots;

      if (conceptSnapshots && conceptSnapshots[conceptId]) {
        const conceptData = conceptSnapshots[conceptId];

        // 구조화된 스냅샷 생성
        const snapshot = {
          conceptId,
          displayName: `${conceptData.source_word || "알 수 없음"} → ${
            conceptData.word ||
            conceptData.target_word ||
            conceptId.substring(0, 12)
          }`,
          sourceLanguage: conceptData.source_language || "korean",
          targetLanguage: conceptData.target_language || selectedTargetLanguage,
          sourceFlag: getLanguageFlag(conceptData.source_language || "korean"),
          targetFlag: getLanguageFlag(
            conceptData.target_language || selectedTargetLanguage
          ),
          domain: conceptData.domain || "일반",
          category: conceptData.category || "기타",
          domainColor: getDomainColor(conceptData.domain || "일반"),
          categoryColor: getCategoryColor(conceptData.category || "기타"),
          definition: conceptData.definition || "",
          example: conceptData.example || "",
        };

        console.log(
          `✅ user_records에서 개념 스냅샷 조회: ${conceptId} -> ${snapshot.displayName}`
        );
        return snapshot;
      }
    }

    // user_records에 없으면 concepts에서 가져와서 생성
    console.log(`🔍 user_records에 없음, concepts에서 가져오기: ${conceptId}`);
    return await fetchAndCreateConceptSnapshot(conceptId);
  } catch (error) {
    console.error("user_records 개념 스냅샷 조회 오류:", error);
    return createDefaultSnapshot(conceptId);
  }
}

// 기본 스냅샷 생성
function createDefaultSnapshot(conceptId) {
  return {
    conceptId,
    displayName:
      conceptId.length > 12 ? conceptId.substring(0, 12) + "..." : conceptId,
    sourceLanguage: "korean",
    targetLanguage: selectedTargetLanguage,
    sourceFlag: getLanguageFlag("korean"),
    targetFlag: getLanguageFlag(selectedTargetLanguage),
    domain: "일반",
    category: "기타",
    domainColor: getDomainColor("일반"),
    categoryColor: getCategoryColor("기타"),
    definition: "개념 정보 없음",
    example: "",
  };
}

// 🔧 유틸리티 함수들: 개념 추출 및 스냅샷 생성

// 다양한 소스에서 개념 ID 추출
function extractConceptIds(record) {
  let conceptIds = [];

  if (Array.isArray(record.concept_id)) {
    conceptIds = record.concept_id;
  } else if (record.concept_id) {
    conceptIds = [record.concept_id];
  } else if (Array.isArray(record.concept_ids)) {
    // concept_ids 필드 추가
    conceptIds = record.concept_ids;
  } else if (record.concept_ids) {
    conceptIds = [record.concept_ids];
  } else if (record.conceptId) {
    conceptIds = Array.isArray(record.conceptId)
      ? record.conceptId
      : [record.conceptId];
  } else if (record.quizData && record.quizData.concepts) {
    conceptIds = Array.isArray(record.quizData.concepts)
      ? record.quizData.concepts
      : [record.quizData.concepts];
  } else if (record.gameData && record.gameData.concepts) {
    conceptIds = Array.isArray(record.gameData.concepts)
      ? record.gameData.concepts
      : [record.gameData.concepts];
  }

  return conceptIds.filter((id) => id); // falsy values 제거
}

// 개념 맵 업데이트
function updateConceptMap(conceptsMap, conceptId, record, activityType) {
  const accuracy = calculateActivityAccuracy(record);

  if (!conceptsMap.has(conceptId)) {
    conceptsMap.set(conceptId, {
      ...record,
      conceptId,
      activity_type: activityType,
      calculated_accuracy: accuracy,
    });
  }
}

// 활동별 정확도 계산
function calculateActivityAccuracy(record) {
  switch (record.activity_type || inferActivityType(record)) {
    case "learning":
      return (
        record.accuracy || record.success_rate || record.session_quality || 40
      );
    case "game":
      return record.score ? Math.min(95, Math.max(50, record.score / 3)) : 70;
    case "quiz":
      return record.correctAnswers && record.totalQuestions
        ? Math.round((record.correctAnswers / record.totalQuestions) * 100)
        : record.accuracy || 60;
    default:
      return 50;
  }
}

// 활동 유형 추론
function inferActivityType(record) {
  if (record.session_quality || record.studyTime) return "learning";
  if (record.score && record.timeTaken) return "game";
  if (record.totalQuestions || record.correctAnswers) return "quiz";
  return "unknown";
}

// 개념 스냅샷 생성 (DB 저장용 경량화 데이터)
function createConceptSnapshot(conceptData, conceptId) {
  // 언어 쌍 추출
  const sourceLanguage =
    conceptData.sourceLanguage ||
    (conceptData.languagePair && conceptData.languagePair.source) ||
    (conceptData.language_pair && conceptData.language_pair.source) ||
    "korean";

  const targetLanguage =
    conceptData.targetLanguage ||
    (conceptData.languagePair && conceptData.languagePair.target) ||
    (conceptData.language_pair && conceptData.language_pair.target) ||
    selectedTargetLanguage;

  // 깃발 이모지
  const sourceFlag = getLanguageFlag(sourceLanguage);
  const targetFlag = getLanguageFlag(targetLanguage);

  // 개념명 추출
  const displayName = extractConceptName(conceptData, conceptId);

  // 도메인과 카테고리 추출
  const domain = conceptData.domain || conceptData.category || "일반";
  const category = conceptData.subcategory || conceptData.type || "기타";

  return {
    conceptId,
    displayName,
    sourceLanguage,
    targetLanguage,
    sourceFlag,
    targetFlag,
    domain,
    category,
    domainColor: getDomainColor(domain),
    categoryColor: getCategoryColor(category),
  };
}

// 언어별 깃발 이모지
function getLanguageFlag(language) {
  const flags = {
    korean: "🇰🇷",
    english: "🇺🇸",
    japanese: "🇯🇵",
    chinese: "🇨🇳",
  };
  return flags[language] || "🌍";
}

// 개념명 추출
function extractConceptName(conceptData, conceptId) {
  // 다양한 필드에서 개념명 추출 시도
  const name =
    conceptData.conceptData?.word ||
    conceptData.word ||
    conceptData.concept ||
    conceptData.term ||
    conceptData.source_word ||
    conceptData.target_word ||
    conceptId.replace(/[A-Za-z0-9]{20,}/, "") || // ID에서 단어 추출 시도
    conceptId.substring(0, 12);

  return name.length > 20 ? name.substring(0, 20) + "..." : name;
}

// 도메인별 색상
function getDomainColor(domain) {
  const colors = {
    비즈니스: "bg-blue-100 text-blue-700",
    기술: "bg-purple-100 text-purple-700",
    일상: "bg-green-100 text-green-700",
    학문: "bg-orange-100 text-orange-700",
    의학: "bg-red-100 text-red-700",
    여행: "bg-cyan-100 text-cyan-700",
    음식: "bg-yellow-100 text-yellow-700",
    스포츠: "bg-indigo-100 text-indigo-700",
    문화: "bg-pink-100 text-pink-700",
    일반: "bg-gray-100 text-gray-700",
  };
  return colors[domain] || "bg-gray-100 text-gray-700";
}

// 카테고리별 색상
function getCategoryColor(category) {
  const colors = {
    명사: "bg-indigo-100 text-indigo-700",
    동사: "bg-pink-100 text-pink-700",
    형용사: "bg-yellow-100 text-yellow-700",
    부사: "bg-teal-100 text-teal-700",
    구문: "bg-violet-100 text-violet-700",
    숙어: "bg-emerald-100 text-emerald-700",
    기타: "bg-gray-100 text-gray-600",
  };
  return colors[category] || "bg-gray-100 text-gray-600";
}

// 🔄 활동 저장 시 자동 스냅샷 생성 함수들

// 학습 활동 저장 시 스냅샷 생성
async function saveLearningActivityWithSnapshot(activityData) {
  try {
    // 1. 학습 활동 저장
    const savedActivity = await saveLearningActivity(activityData);

    // 2. 개념 ID 추출 및 스냅샷 생성
    const conceptIds = extractConceptIds(activityData);
    for (const conceptId of conceptIds) {
      await createAndSaveConceptSnapshot(conceptId, activityData);
    }

    console.log(`📚 학습 활동과 스냅샷 저장 완료: ${conceptIds.length}개 개념`);
    return savedActivity;
  } catch (error) {
    console.error("학습 활동 및 스냅샷 저장 오류:", error);
    throw error;
  }
}

// 게임 활동 저장 시 스냅샷 생성
async function saveGameActivityWithSnapshot(activityData) {
  try {
    // 1. 게임 활동 저장
    const savedActivity = await saveGameActivity(activityData);

    // 2. 개념 ID 추출 및 스냅샷 생성
    const conceptIds = extractConceptIds(activityData);
    for (const conceptId of conceptIds) {
      await createAndSaveConceptSnapshot(conceptId, activityData);
    }

    console.log(`🎮 게임 활동과 스냅샷 저장 완료: ${conceptIds.length}개 개념`);
    return savedActivity;
  } catch (error) {
    console.error("게임 활동 및 스냅샷 저장 오류:", error);
    throw error;
  }
}

// 퀴즈 활동 저장 시 스냅샷 생성
async function saveQuizActivityWithSnapshot(activityData) {
  try {
    // 1. 퀴즈 활동 저장
    const savedActivity = await saveQuizActivity(activityData);

    // 2. 개념 ID 추출 및 스냅샷 생성
    const conceptIds = extractConceptIds(activityData);
    for (const conceptId of conceptIds) {
      await createAndSaveConceptSnapshot(conceptId, activityData);
    }

    console.log(`🎯 퀴즈 활동과 스냅샷 저장 완료: ${conceptIds.length}개 개념`);
    return savedActivity;
  } catch (error) {
    console.error("퀴즈 활동 및 스냅샷 저장 오류:", error);
    throw error;
  }
}

// 개념 스냅샷 생성 및 저장
async function createAndSaveConceptSnapshot(conceptId, activityData) {
  try {
    // 1. 이미 스냅샷이 있는지 확인
    const existingSnapshot = await checkExistingSnapshot(conceptId);
    if (existingSnapshot) {
      console.log(`✅ 이미 스냅샷 존재: ${conceptId}`);
      return existingSnapshot;
    }

    // 2. concepts 컬렉션에서 정보 가져오기
    const conceptSnapshot = await fetchAndCreateConceptSnapshot(conceptId);

    console.log(
      `🔄 새 스냅샷 생성: ${conceptId} -> ${conceptSnapshot.displayName}`
    );
    return conceptSnapshot;
  } catch (error) {
    console.error(`스냅샷 생성 오류: ${conceptId}`, error);
    return createDefaultSnapshot(conceptId);
  }
}

// 기존 스냅샷 확인
async function checkExistingSnapshot(conceptId) {
  try {
    const { doc, getDoc, db } = window.firebaseInit;
    const userRecordRef = doc(db, "user_records", currentUser.email);
    const userDoc = await getDoc(userRecordRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      const conceptSnapshots = userData.concept_snapshots;

      if (conceptSnapshots && conceptSnapshots[conceptId]) {
        return true; // 스냅샷 존재
      }
    }

    return false; // 스냅샷 없음
  } catch (error) {
    console.error("스냅샷 확인 오류:", error);
    return false;
  }
}

// 🔧 테스트 및 데모 함수들

// 기존 concept_id로 스냅샷 테스트 생성
window.testCreateSnapshots = async function () {
  if (!currentUser) {
    console.log("❌ 사용자가 인증되지 않았습니다.");
    return;
  }

  try {
    console.log("🧪 기존 활동의 개념들로 스냅샷 테스트 생성 시작...");

    // 기존 활동에서 개념 ID 수집
    const allConceptIds = new Set();

    [...allLearningRecords, ...allGameRecords, ...allQuizRecords].forEach(
      (record) => {
        const conceptIds = extractConceptIds(record);
        conceptIds.forEach((id) => allConceptIds.add(id));
      }
    );

    console.log(`🔍 발견된 개념 ID들: ${allConceptIds.size}개`);

    for (const conceptId of Array.from(allConceptIds).slice(0, 3)) {
      // 처음 3개만 테스트
      console.log(`📋 스냅샷 생성 테스트: ${conceptId}`);
      await fetchAndCreateConceptSnapshot(conceptId);
    }

    console.log("✅ 스냅샷 테스트 생성 완료!");
  } catch (error) {
    console.error("스냅샷 테스트 오류:", error);
  }
};

// 전체 데이터 새로고침 후 UI 업데이트
window.refreshAndUpdateUI = async function () {
  try {
    console.log("🔄 전체 데이터 새로고침...");
    await loadProgressData();
    updateUI();
    console.log("✅데이터 새로고침 완료");
  } catch (error) {
    console.error("데이터 새로고침 오류:", error);
  }
};

// 퀴즈 세부정보 토글 함수 (전역 함수로 모달에서 접근 가능)
window.toggleQuizDetails = function (conceptId) {
  const detailsElement = document.getElementById(`quiz-details-${conceptId}`);
  const buttonElement = document.querySelector(
    `[onclick="toggleQuizDetails('${conceptId}')"]`
  );

  if (detailsElement) {
    const currentDisplay = window.getComputedStyle(detailsElement).display;
    if (currentDisplay === "none") {
      detailsElement.style.display = "block";
      if (buttonElement) buttonElement.textContent = "➖"; // 열림 상태
    } else {
      detailsElement.style.display = "none";
      if (buttonElement) buttonElement.textContent = "➕"; // 닫힘 상태
    }
  }
};

// 📊 상세 개념 목록 생성 함수 (캐시 최적화)
async function generateDetailedConceptsList() {
  // 🔄 선택된 대상 언어의 모든 활동 기록 필터링
  const learningRecords = allLearningRecords.filter((record) => {
    const hasTargetLanguage = record.targetLanguage === selectedTargetLanguage;
    const hasLanguagePairIncludes =
      record.languagePair &&
      record.languagePair.includes &&
      record.languagePair.includes(selectedTargetLanguage);
    const hasLanguage_pairTarget =
      record.language_pair &&
      record.language_pair.target === selectedTargetLanguage;
    const hasLanguage_pairIncludes =
      record.language_pair &&
      record.language_pair.includes &&
      record.language_pair.includes(selectedTargetLanguage);
    const hasMetadataTargetLanguage =
      record.metadata &&
      record.metadata.targetLanguage === selectedTargetLanguage;
    const hasTarget_language =
      record.target_language === selectedTargetLanguage;
    const isVocabularyActivity =
      record.activity_type === "vocabulary" &&
      selectedTargetLanguage === "english";

    return (
      hasTargetLanguage ||
      hasLanguagePairIncludes ||
      hasLanguage_pairTarget ||
      hasLanguage_pairIncludes ||
      hasMetadataTargetLanguage ||
      hasTarget_language ||
      isVocabularyActivity
    );
  });

  const gameRecords = allGameRecords.filter((record) => {
    return (
      record.targetLanguage === selectedTargetLanguage ||
      (record.languagePair &&
        record.languagePair.includes(selectedTargetLanguage)) ||
      (record.language_pair &&
        record.language_pair.target === selectedTargetLanguage) ||
      (record.language_pair &&
        record.language_pair.includes &&
        record.language_pair.includes(selectedTargetLanguage)) ||
      (record.metadata &&
        record.metadata.targetLanguage === selectedTargetLanguage)
    );
  });

  const quizRecords = allQuizRecords.filter((record) => {
    const hasTargetLanguage = record.targetLanguage === selectedTargetLanguage;
    const hasLanguagePairIncludes =
      record.languagePair &&
      record.languagePair.includes(selectedTargetLanguage);
    const hasLanguage_pairTarget =
      record.language_pair &&
      record.language_pair.target === selectedTargetLanguage;
    const hasMetadataTargetLanguage =
      record.metadata &&
      record.metadata.targetLanguage === selectedTargetLanguage;
    const hasTarget_language =
      record.target_language === selectedTargetLanguage;
    const isTranslationQuiz =
      record.quiz_type === "translation" &&
      selectedTargetLanguage === "english";

    return (
      hasTargetLanguage ||
      hasLanguagePairIncludes ||
      hasLanguage_pairTarget ||
      hasMetadataTargetLanguage ||
      hasTarget_language ||
      isTranslationQuiz
    );
  });

  // 🎯 스냅샷 데이터 기반 개념 맵 생성
  const conceptsMap = new Map();
  let allActivities = [];

  // 📚 학습 기록에서 개념 추출
  learningRecords.forEach((record) => {
    const conceptIds = extractConceptIds(record);
    conceptIds.forEach((conceptId) => {
      if (conceptId) {
        updateConceptMap(conceptsMap, conceptId, record, "learning");
      }
    });
    allActivities.push({ ...record, activity_type: "learning" });
  });

  // 🎮 게임 기록에서 개념 추출
  gameRecords.forEach((record) => {
    const conceptIds = extractConceptIds(record);
    conceptIds.forEach((conceptId) => {
      if (conceptId) {
        updateConceptMap(conceptsMap, conceptId, record, "game");
      }
    });
    allActivities.push({ ...record, activity_type: "game" });
  });

  // ❓ 퀴즈 기록에서 개념 추출
  quizRecords.forEach((record) => {
    const conceptIds = extractConceptIds(record);
    conceptIds.forEach((conceptId) => {
      if (conceptId) {
        updateConceptMap(conceptsMap, conceptId, record, "quiz");
      }
    });
    allActivities.push({ ...record, activity_type: "quiz" });
  });

  // 🏆 개념 스냅샷 생성 및 활동 데이터 수집
  console.log("🔍 개념 스냅샷 생성 시작...");

  const detailedConceptsList = [];

  for (const [conceptId, conceptData] of conceptsMap) {
    // 🔄 1. 먼저 활동 기록에서 개념 정보 확인
    let conceptSnapshot = null;

    // 활동 기록의 conceptData에서 개념 정보 추출
    const activityWithConceptData = allActivities.find((activity) => {
      const activityConceptIds = extractConceptIds(activity);
      return (
        activityConceptIds.includes(conceptId) &&
        (activity.conceptData || activity.concept_data)
      );
    });

    if (activityWithConceptData && activityWithConceptData.conceptData) {
      // 활동 기록에서 개념 정보가 있으면 사용
      conceptSnapshot = createConceptSnapshotFromActivity(
        conceptId,
        activityWithConceptData.conceptData
      );
      console.log(`📋 활동 기록에서 개념 정보 사용: ${conceptId}`);
    } else {
      // 2. user_records에서 개념 스냅샷 조회 (비용 효율적)
      try {
        conceptSnapshot = await fetchConceptSnapshotFromUserRecords(conceptId);
        console.log(`🔍 user_records에서 개념 정보 조회: ${conceptId}`);
      } catch (error) {
        console.error(`개념 조회 실패: ${conceptId}`, error);
        conceptSnapshot = createDefaultSnapshot(conceptId);
      }
    }

    // 해당 개념의 새로운 마스터 진행률 계산 시스템
    const masteryData = calculateConceptMastery(
      { id: conceptId },
      {
        learningRecords: allLearningRecords,
        quizRecords: allQuizRecords,
        gameRecords: allGameRecords,
      }
    );

    // 해당 개념의 모든 활동 수집 (기존 방식 - 표시용)
    let learningCount = 0;
    let gameCount = 0;
    let quizCount = 0;
    let totalAccuracy = 0;
    let activityCount = 0;

    // 각 활동 타입별로 카운트 및 정확도 수집 (기존 표시용)
    allActivities.forEach((activity) => {
      const activityConceptIds = extractConceptIds(activity);
      if (activityConceptIds.includes(conceptId)) {
        const accuracy = calculateActivityAccuracy(activity);
        totalAccuracy += accuracy;
        activityCount++;

        switch (activity.activity_type) {
          case "learning":
            learningCount++;
            break;
          case "game":
            gameCount++;
            break;
          case "quiz":
            quizCount++;
            break;
        }
      }
    });

    const averageAccuracy = masteryData.masteryPercentage; // 새로운 마스터 진행률 사용
    const isMastered = averageAccuracy >= 80;

    detailedConceptsList.push({
      conceptId,
      snapshot: conceptSnapshot,
      averageAccuracy,
      isMastered,
      learningCount,
      gameCount,
      quizCount,
      totalActivities: learningCount + gameCount + quizCount,
      // 새로운 마스터 데이터 추가
      correctCount: masteryData.correctCount,
      incorrectCount: masteryData.incorrectCount,
      accuracyRate: masteryData.accuracyRate,
    });
  }

  console.log("📊 생성된 개념 스냅샷:", detailedConceptsList.length, "개");
  return detailedConceptsList;
}
