// 개념 모달 공통 번역 시스템
// AI 어휘학과 일반 어휘학 모달에서 공통적으로 사용

/**
 * 도메인 카테고리 번역 함수
 * @param {string} domain - 도메인명
 * @param {string} category - 카테고리 명
 * @param {string} lang - 언어 코드 (ko, en, ja, zh)
 * @returns {string} 번역된 도메인 카테고리 문자열
 */
export function getTranslatedDomainCategory(domain, category, lang = "ko") {
  const translations = {
    ko: {
      general: "일반",
      food: "음식",
      daily: "일상",
      travel: "여행",
      business: "비즈니스",
      education: "교육",
      technology: "기술",
      health: "건강",
      fruit: "과일",
      vegetable: "채소",
      meat: "육류",
      drink: "음료",
      snack: "간식",
      grain: "곡물",
      seafood: "해산물",
      dairy: "유제품",
      cooking: "요리",
      dining: "식사",
      restaurant: "레스토랑",
      kitchen_utensils: "주방용품",
      spices: "향신료",
      dessert: "디저트",
      animal: "동물",
      household: "가정용품",
      family: "가족",
      routine: "일상",
      clothing: "의류",
      shopping: "쇼핑",
      communication: "의사소통",
      personal_care: "개인관리",
      leisure: "여가",
      relationships: "인간관계",
      time: "시간",
      weather_talk: "날씨",
      furniture: "가구",
      transportation: "교통",
      accommodation: "숙박",
      tourist_attraction: "관광지",
      luggage: "짐",
      direction: "방향",
      currency: "화폐",
      emergency: "응급상황",
      documents: "서류",
      sightseeing: "관광",
      local_food: "현지음식",
      souvenir: "기념품",
      booking: "예약",
      greeting: "인사",
      emotion: "감정",
      nature: "자연",
      social_media: "소셜미디어",
      medicine: "의학",
      mental_health: "정신건강",
      educational_technology: "교육기술",
      other: "기타",
    },
    en: {
      general: "General",
      food: "Food",
      daily: "Daily Life",
      travel: "Travel",
      business: "Business",
      education: "Education",
      technology: "Technology",
      health: "Health",
      fruit: "Fruit",
      vegetable: "Vegetable",
      meat: "Meat",
      drink: "Drink",
      snack: "Snack",
      grain: "Grain",
      seafood: "Seafood",
      dairy: "Dairy",
      cooking: "Cooking",
      dining: "Dining",
      restaurant: "Restaurant",
      kitchen_utensils: "Kitchen Utensils",
      spices: "Spices",
      dessert: "Dessert",
      animal: "Animal",
      household: "Household",
      family: "Family",
      routine: "Routine",
      clothing: "Clothing",
      shopping: "Shopping",
      communication: "Communication",
      personal_care: "Personal Care",
      leisure: "Leisure",
      relationships: "Relationships",
      time: "Time",
      weather_talk: "Weather Talk",
      furniture: "Furniture",
      transportation: "Transportation",
      accommodation: "Accommodation",
      tourist_attraction: "Tourist Attraction",
      luggage: "Luggage",
      direction: "Direction",
      currency: "Currency",
      emergency: "Emergency",
      documents: "Documents",
      sightseeing: "Sightseeing",
      local_food: "Local Food",
      souvenir: "Souvenir",
      booking: "Booking",
      greeting: "Greeting",
      emotion: "Emotion",
      nature: "Nature",
      social_media: "Social Media",
      medicine: "Medicine",
      mental_health: "Mental Health",
      educational_technology: "Educational Technology",
      other: "Other",
    },
    ja: {
      general: "一般",
      food: "食べ物",
      daily: "日常",
      travel: "旅行",
      business: "ビジネス",
      education: "教育",
      technology: "技術",
      health: "健康",
      fruit: "果物",
      vegetable: "野菜",
      meat: "肉類",
      drink: "飲み物",
      snack: "スナック",
      grain: "穀物",
      seafood: "海産物",
      dairy: "乳製品",
      cooking: "料理",
      dining: "食事",
      restaurant: "レストラン",
      kitchen_utensils: "台所用品",
      spices: "スパイス",
      dessert: "デザート",
      animal: "動物",
      household: "家庭用品",
      family: "家族",
      routine: "日常",
      clothing: "衣装",
      shopping: "買い物",
      communication: "コミュニケーション",
      personal_care: "個人ケア",
      leisure: "レジャー",
      relationships: "人間関係",
      time: "時間",
      weather_talk: "天気",
      furniture: "家具",
      transportation: "交通",
      accommodation: "宿泊",
      tourist_attraction: "観光地",
      luggage: "荷物",
      direction: "方向",
      currency: "通貨",
      emergency: "緊急事態",
      documents: "書類",
      sightseeing: "観光",
      local_food: "地元料理",
      souvenir: "お土産",
      booking: "予約",
      greeting: "挨拶",
      emotion: "感情",
      nature: "自然",
      social_media: "ソーシャルメディア",
      medicine: "医学",
      mental_health: "メンタルヘルス",
      educational_technology: "教育技術",
      other: "その他",
    },
    zh: {
      general: "一般",
      food: "食物",
      daily: "日常",
      travel: "旅行",
      business: "商务",
      education: "教育",
      technology: "技术",
      health: "健康",
      fruit: "水果",
      vegetable: "蔬菜",
      meat: "肉类",
      drink: "饮料",
      snack: "零食",
      grain: "谷物",
      seafood: "海产品",
      dairy: "乳制品",
      cooking: "烹饪",
      dining: "用餐",
      restaurant: "餐厅",
      kitchen_utensils: "厨房用具",
      spices: "香料",
      dessert: "甜点",
      animal: "动物",
      household: "家用品",
      family: "家庭",
      routine: "日常",
      clothing: "服装",
      shopping: "购物",
      communication: "交流",
      personal_care: "个人护理",
      leisure: "休闲",
      relationships: "人际关系",
      time: "时间",
      weather_talk: "天气",
      furniture: "家具",
      transportation: "交通",
      accommodation: "住宿",
      tourist_attraction: "旅游景点",
      luggage: "行李",
      direction: "方向",
      currency: "货币",
      emergency: "紧急情况",
      documents: "文件",
      sightseeing: "观光",
      local_food: "当地食物",
      souvenir: "纪念品",
      booking: "预订",
      greeting: "问候",
      emotion: "情感",
      nature: "自然",
      social_media: "社交媒体",
      medicine: "医学",
      mental_health: "心理健康",
      educational_technology: "教育技术",
      other: "其他",
    },
  };

  const langTranslations = translations[lang] || translations.ko;

  // 도메인과 카테고리 번역
  const translatedDomain = langTranslations[domain] || domain;
  const translatedCategory = langTranslations[category] || category;

  // 도메인과 카테고리가 같으면 하나만 표시
  if (translatedDomain === translatedCategory) {
    return translatedDomain;
  }

  // 도메인과 카테고리가 다르면 도메인>카테고리 형태로 표시
  return `${translatedDomain}>${translatedCategory}`;
}

/**
 * 품사 번역 함수
 * @param {string} pos - 품사 명
 * @param {string} lang - 언어 코드
 * @returns {string} 번역된 품사
 */
export function getTranslatedPartOfSpeech(pos, lang = "ko") {
  const translations = {
    ko: {
      noun: "명사",
      verb: "동사",
      adjective: "형용사",
      adverb: "부사",
      pronoun: "대명사",
      preposition: "전치사",
      conjunction: "접속사",
      interjection: "감탄사",
      determiner: "한정사",
      particle: "조사",
      classifier: "분류사",
      other: "기타",
    },
    en: {
      noun: "Noun",
      verb: "Verb",
      adjective: "Adjective",
      adverb: "Adverb",
      pronoun: "Pronoun",
      preposition: "Preposition",
      conjunction: "Conjunction",
      interjection: "Interjection",
      determiner: "Determiner",
      particle: "Particle",
      classifier: "Classifier",
      other: "Other",
    },
    ja: {
      noun: "名詞",
      verb: "動詞",
      adjective: "形容詞",
      adverb: "副詞",
      pronoun: "代名詞",
      preposition: "前置詞",
      conjunction: "接続詞",
      interjection: "感嘆詞",
      determiner: "限定詞",
      particle: "助詞",
      classifier: "分類詞",
      other: "その他",
    },
    zh: {
      noun: "名词",
      verb: "动词",
      adjective: "形容词",
      adverb: "副词",
      pronoun: "代词",
      preposition: "介词",
      conjunction: "连词",
      interjection: "感叹词",
      determiner: "限定词",
      particle: "助词",
      classifier: "量词",
      other: "其他",
    },
  };

  const langTranslations = translations[lang] || translations.ko;
  return langTranslations[pos] || pos;
}

/**
 * 레벨 번역 함수
 * @param {string} level - 레벨명
 * @param {string} lang - 언어 코드
 * @returns {string} 번역된 레벨
 */
export function getTranslatedLevel(level, lang = "ko") {
  const translations = {
    ko: {
      beginner: "초급",
      elementary: "초급",
      intermediate: "중급",
      advanced: "고급",
      expert: "전문가",
    },
    en: {
      beginner: "Beginner",
      elementary: "Elementary",
      intermediate: "Intermediate",
      advanced: "Advanced",
      expert: "Expert",
    },
    ja: {
      beginner: "初級",
      elementary: "初級",
      intermediate: "中級",
      advanced: "上級",
      expert: "専門家",
    },
    zh: {
      beginner: "初级",
      elementary: "初级",
      intermediate: "中级",
      advanced: "高级",
      expert: "专家",
    },
  };

  const langTranslations = translations[lang] || translations.ko;
  return langTranslations[level] || level;
}

/**
 * 언어 이름 번역 함수
 * @param {string} langCode - 언어 코드
 * @param {string} displayLang - 표시할 언어
 * @returns {string} 번역된 언어 이름
 */
export function getTranslatedLanguageName(langCode, displayLang = "ko") {
  const languageNames = {
    ko: {
      ko: "한국어",
      en: "영어",
      ja: "일본어",
      zh: "중국어",
    },
    en: {
      ko: "Korean",
      en: "English",
      ja: "Japanese",
      zh: "Chinese",
    },
    ja: {
      ko: "韓国語",
      en: "英語",
      ja: "日本語",
      zh: "中国語",
    },
    zh: {
      ko: "韩语",
      en: "英语",
      ja: "日语",
      zh: "中文",
    },
  };

  return languageNames[displayLang]?.[langCode] || langCode;
}
