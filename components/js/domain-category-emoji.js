// 도메인-카테고리-이모지 매핑 (간소화된 버전)

// 기본 도메인 카테고리 매핑
export const domainCategoryMapping = {
  daily: ["household", "family", "routine", "clothing", "other"],
  food: ["fruit", "vegetable", "meat", "drink", "other"],
  travel: ["transportation", "accommodation", "tourist_attraction", "other"],
  business: ["meeting", "finance", "marketing", "office", "other"],
  education: ["teaching", "learning", "classroom", "other"],
  nature: ["animal", "plant", "weather", "other"],
  technology: ["computer", "software", "internet", "other"],
  health: ["medical", "fitness", "mental_health", "other"],
  sports: ["team_sports", "individual_sports", "equipment", "other"],
  entertainment: ["movie", "music", "game", "other"],
  culture: ["art", "literature", "history", "other"],
  other: ["general", "common", "other"],
};

// 기본 카테고리 이모지 매핑
export const categoryEmojiMapping = {
  household: ["🏠", "🏡", "🏘️", "🏚️"],
  family: ["👨‍👩‍👧‍👦", "👪", "👨‍👩‍👧", "👨‍👩‍👦‍👦"],
  routine: ["⏰", "🌅", "🌄", "🌇"],
  clothing: ["👕", "👖", "👗", "👔"],
  fruit: ["🍎", "🍊", "🍋", "🍌"],
  vegetable: ["🥕", "🥬", "🥒", "🍅"],
  meat: ["🥩", "🍖", "🥓", "🍗"],
  drink: ["☕", "🍵", "🥤", "🍺"],
  transportation: ["🚗", "🚕", "🚙", "🚌"],
  accommodation: ["🏨", "🏩", "🏠", "🏡"],
  tourist_attraction: ["🗽", "🗼", "🏛️", "🏟️"],
  meeting: ["👥", "👤", "🤝", "💼"],
  finance: ["💰", "💳", "💸", "💵"],
  marketing: ["📢", "📣", "📺", "📻"],
  office: ["🏢", "💼", "📋", "📊"],
  teaching: ["👨‍🏫", "👩‍🏫", "📚", "✏️"],
  learning: ["📖", "📝", "🎓", "📚"],
  classroom: ["🏫", "📚", "✏️", "📝"],
  animal: ["🐶", "🐱", "🐭", "🐹"],
  plant: ["🌱", "🌿", "🌳", "🌲"],
  weather: ["☀️", "🌧️", "⛈️", "❄️"],
  computer: ["💻", "🖥️", "⌨️", "🖱️"],
  software: ["💾", "💿", "📀", "🖥️"],
  internet: ["🌐", "📡", "📶", "💻"],
  medical: ["⚕️", "🏥", "💊", "🩺"],
  fitness: ["💪", "🏃‍♂️", "🏋️‍♀️", "🤸‍♂️"],
  mental_health: ["🧠", "💭", "😌", "🧘‍♀️"],
  team_sports: ["⚽", "🏀", "🏈", "🏐"],
  individual_sports: ["🏃‍♂️", "🏊‍♀️", "🚴‍♂️", "🏌️‍♀️"],
  equipment: ["🏀", "⚽", "🏈", "🎾"],
  movie: ["🎬", "🎥", "🍿", "🎞️"],
  music: ["🎵", "🎶", "🎤", "🎸"],
  game: ["🎮", "🕹️", "🎯", "🎲"],
  art: ["🎨", "🖌️", "🖍️", "🎭"],
  literature: ["📚", "📖", "📝", "✍️"],
  history: ["📜", "🏛️", "🗿", "⚱️"],
  general: ["📝", "📋", "📊", "📈"],
  common: ["⭐", "💫", "✨", "🌟"],
  other: ["❓", "❔", "💭", "🤔"],
};

// 기본 번역 함수들
export function translateCategoryKey(categoryKey, language = "ko") {
  const translations = {
    ko: {
      household: "가정용품",
      family: "가족",
      routine: "일상",
      clothing: "의류",
      fruit: "과일",
      vegetable: "채소",
      meat: "육류",
      drink: "음료",
      transportation: "교통",
      accommodation: "숙박",
      tourist_attraction: "관광지",
      meeting: "회의",
      finance: "금융",
      marketing: "마케팅",
      office: "사무실",
      teaching: "교육",
      learning: "학습",
      classroom: "교실",
      animal: "동물",
      plant: "식물",
      weather: "날씨",
      computer: "컴퓨터",
      software: "소프트웨어",
      internet: "인터넷",
      medical: "의료",
      fitness: "운동",
      mental_health: "정신건강",
      team_sports: "팀 스포츠",
      individual_sports: "개인 스포츠",
      equipment: "장비",
      movie: "영화",
      music: "음악",
      game: "게임",
      art: "예술",
      literature: "문학",
      history: "역사",
      general: "일반",
      common: "공통",
      other: "기타",
    },
    en: {
      household: "Household",
      family: "Family",
      routine: "Routine",
      clothing: "Clothing",
      fruit: "Fruit",
      vegetable: "Vegetable",
      meat: "Meat",
      drink: "Drink",
      transportation: "Transportation",
      accommodation: "Accommodation",
      tourist_attraction: "Tourist Attraction",
      meeting: "Meeting",
      finance: "Finance",
      marketing: "Marketing",
      office: "Office",
      teaching: "Teaching",
      learning: "Learning",
      classroom: "Classroom",
      animal: "Animal",
      plant: "Plant",
      weather: "Weather",
      computer: "Computer",
      software: "Software",
      internet: "Internet",
      medical: "Medical",
      fitness: "Fitness",
      mental_health: "Mental Health",
      team_sports: "Team Sports",
      individual_sports: "Individual Sports",
      equipment: "Equipment",
      movie: "Movie",
      music: "Music",
      game: "Game",
      art: "Art",
      literature: "Literature",
      history: "History",
      general: "General",
      common: "Common",
      other: "Other",
    },
  };

  return translations[language]?.[categoryKey] || categoryKey;
}

export function translateDomainKey(domainKey, language = "ko") {
  const translations = {
    ko: {
      daily: "일상",
      food: "음식",
      travel: "여행",
      business: "비즈니스",
      education: "교육",
      nature: "자연",
      technology: "기술",
      health: "건강",
      sports: "스포츠",
      entertainment: "엔터테인먼트",
      culture: "문화",
      other: "기타",
    },
    en: {
      daily: "Daily",
      food: "Food",
      travel: "Travel",
      business: "Business",
      education: "Education",
      nature: "Nature",
      technology: "Technology",
      health: "Health",
      sports: "Sports",
      entertainment: "Entertainment",
      culture: "Culture",
      other: "Other",
    },
  };

  return translations[language]?.[domainKey] || domainKey;
}

// 기본 업데이트 함수들 (빈 구현)
export function updateDomainOptions() {
  console.log("updateDomainOptions called");
}

export function updateCategoryOptions() {
  console.log("updateCategoryOptions called");
}

export function updateEmojiOptions() {
  console.log("updateEmojiOptions called");
}

export function updateEditCategoryOptions() {
  console.log("updateEditCategoryOptions called");
}

export function updateEditEmojiOptions() {
  console.log("updateEditEmojiOptions called");
}

export function updatePartOfSpeechOptions() {
  console.log("updatePartOfSpeechOptions called");
}

export function updatePartOfSpeechByLanguageTab() {
  console.log("updatePartOfSpeechByLanguageTab called");
}

export function updateDomainCategoryEmojiLanguage() {
  console.log("updateDomainCategoryEmojiLanguage called");
}

// 전역으로 노출
window.updateCategoryOptions = updateCategoryOptions;
window.updateEmojiOptions = updateEmojiOptions;
window.updateEditCategoryOptions = updateEditCategoryOptions;
window.updateEditEmojiOptions = updateEditEmojiOptions;
window.updateDomainOptions = updateDomainOptions;
window.updatePartOfSpeechOptions = updatePartOfSpeechOptions;
window.updatePartOfSpeechByLanguageTab = updatePartOfSpeechByLanguageTab;
window.updateDomainCategoryEmojiLanguage = updateDomainCategoryEmojiLanguage;

console.log("📦 domain-category-emoji.js (simplified) 로드 완료");
