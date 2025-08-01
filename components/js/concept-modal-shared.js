// 개념 모달 공통 번역 시스템
// AI 단어장과 일반 단어장 모달에서 공통으로 사용

/**
 * 도메인/카테고리 번역 함수
 * @param {string} domain - 도메인 키
 * @param {string} category - 카테고리 키
 * @param {string} lang - 언어 코드 (ko, en, ja, zh)
 * @returns {string} 번역된 도메인/카테고리 문자열
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
      culture: "문화",
      entertainment: "엔터테인먼트",
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
      philosophy: "철학",
      science: "과학",
      literature: "문학",
      history: "역사",
      art: "예술",
      music: "음악",
      sports: "스포츠",
      politics: "정치",
      economics: "경제",
      law: "법률",
      psychology: "심리학",
      // health 도메인
      exercise: "운동",
      nutrition: "영양",
      hospital: "병원",
      fitness: "피트니스",
      wellness: "웰니스",
      therapy: "치료",
      prevention: "예방",
      symptoms: "증상",
      treatment: "치료",
      pharmacy: "약국",
      rehabilitation: "재활",
      medical_equipment: "의료기기",
      // sports 도메인
      football: "축구",
      basketball: "농구",
      swimming: "수영",
      running: "달리기",
      equipment: "장비",
      olympics: "올림픽",
      tennis: "테니스",
      baseball: "야구",
      golf: "골프",
      martial_arts: "무술",
      team_sports: "팀 스포츠",
      individual_sports: "개인 스포츠",
      coaching: "코칭",
      competition: "경쟁",
      // entertainment 도메인
      movie: "영화",
      game: "게임",
      book: "책",
      theater: "극장",
      concert: "콘서트",
      festival: "축제",
      celebrity: "유명인",
      tv_show: "TV 쇼",
      comedy: "코미디",
      drama: "드라마",
      animation: "애니메이션",
      photography: "사진",
      // culture 도메인
      tradition: "전통",
      customs: "관습",
      language: "언어",
      religion: "종교",
      heritage: "유산",
      ceremony: "의식",
      ritual: "의례",
      folklore: "민속",
      mythology: "신화",
      arts_crafts: "예술공예",
      etiquette: "예절",
      national_identity: "국가정체성",
      // nature 도메인
      plant: "식물",
      weather: "날씨",
      geography: "지리",
      environment: "환경",
      ecosystem: "생태계",
      conservation: "보존",
      climate: "기후",
      natural_disaster: "자연재해",
      landscape: "풍경",
      marine_life: "해양생물",
      forest: "숲",
      mountain: "산",
      // technology 도메인
      computer: "컴퓨터",
      software: "소프트웨어",
      internet: "인터넷",
      mobile: "모바일",
      ai: "인공지능",
      programming: "프로그래밍",
      cybersecurity: "사이버보안",
      database: "데이터베이스",
      robotics: "로봇공학",
      blockchain: "블록체인",
      cloud: "클라우드",
      gaming: "게임",
      innovation: "혁신",
      // business 도메인
      meeting: "회의",
      finance: "금융",
      marketing: "마케팅",
      office: "사무실",
      project: "프로젝트",
      negotiation: "협상",
      presentation: "프레젠테이션",
      teamwork: "팀워크",
      leadership: "리더십",
      networking: "네트워킹",
      sales: "영업",
      contract: "계약",
      startup: "스타트업",
      // education 도메인
      teaching: "교육",
      learning: "학습",
      classroom: "교실",
      curriculum: "커리큘럼",
      assessment: "평가",
      pedagogy: "교육학",
      skill_development: "기술개발",
      online_learning: "온라인학습",
      training: "훈련",
      certification: "인증",
      student_life: "학생생활",
      graduation: "졸업",
      examination: "시험",
      university: "대학",
      library: "도서관",
      // other 도메인
      hobbies: "취미",
      finance_personal: "개인재정",
      legal: "법률",
      government: "정부",
      media: "미디어",
      community: "커뮤니티",
      volunteering: "자원봉사",
      charity: "자선",
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
      culture: "Culture",
      entertainment: "Entertainment",
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
      philosophy: "Philosophy",
      science: "Science",
      literature: "Literature",
      history: "History",
      art: "Art",
      music: "Music",
      sports: "Sports",
      politics: "Politics",
      economics: "Economics",
      law: "Law",
      psychology: "Psychology",
      // health 도메인
      exercise: "Exercise",
      nutrition: "Nutrition",
      hospital: "Hospital",
      fitness: "Fitness",
      wellness: "Wellness",
      therapy: "Therapy",
      prevention: "Prevention",
      symptoms: "Symptoms",
      treatment: "Treatment",
      pharmacy: "Pharmacy",
      rehabilitation: "Rehabilitation",
      medical_equipment: "Medical Equipment",
      // sports 도메인
      football: "Football",
      basketball: "Basketball",
      swimming: "Swimming",
      running: "Running",
      equipment: "Equipment",
      olympics: "Olympics",
      tennis: "Tennis",
      baseball: "Baseball",
      golf: "Golf",
      martial_arts: "Martial Arts",
      team_sports: "Team Sports",
      individual_sports: "Individual Sports",
      coaching: "Coaching",
      competition: "Competition",
      // entertainment 도메인
      movie: "Movie",
      game: "Game",
      book: "Book",
      theater: "Theater",
      concert: "Concert",
      festival: "Festival",
      celebrity: "Celebrity",
      tv_show: "TV Show",
      comedy: "Comedy",
      drama: "Drama",
      animation: "Animation",
      photography: "Photography",
      // culture 도메인
      tradition: "Tradition",
      customs: "Customs",
      language: "Language",
      religion: "Religion",
      heritage: "Heritage",
      ceremony: "Ceremony",
      ritual: "Ritual",
      folklore: "Folklore",
      mythology: "Mythology",
      arts_crafts: "Arts and Crafts",
      etiquette: "Etiquette",
      national_identity: "National Identity",
      // nature 도메인
      plant: "Plant",
      weather: "Weather",
      geography: "Geography",
      environment: "Environment",
      ecosystem: "Ecosystem",
      conservation: "Conservation",
      climate: "Climate",
      natural_disaster: "Natural Disaster",
      landscape: "Landscape",
      marine_life: "Marine Life",
      forest: "Forest",
      mountain: "Mountain",
      // technology 도메인
      computer: "Computer",
      software: "Software",
      internet: "Internet",
      mobile: "Mobile",
      ai: "AI",
      programming: "Programming",
      cybersecurity: "Cybersecurity",
      database: "Database",
      robotics: "Robotics",
      blockchain: "Blockchain",
      cloud: "Cloud",
      gaming: "Gaming",
      innovation: "Innovation",
      // business 도메인
      meeting: "Meeting",
      finance: "Finance",
      marketing: "Marketing",
      office: "Office",
      project: "Project",
      negotiation: "Negotiation",
      presentation: "Presentation",
      teamwork: "Teamwork",
      leadership: "Leadership",
      networking: "Networking",
      sales: "Sales",
      contract: "Contract",
      startup: "Startup",
      // education 도메인
      teaching: "Teaching",
      learning: "Learning",
      classroom: "Classroom",
      curriculum: "Curriculum",
      assessment: "Assessment",
      pedagogy: "Pedagogy",
      skill_development: "Skill Development",
      online_learning: "Online Learning",
      training: "Training",
      certification: "Certification",
      student_life: "Student Life",
      graduation: "Graduation",
      examination: "Examination",
      university: "University",
      library: "Library",
      // other 도메인
      hobbies: "Hobbies",
      finance_personal: "Personal Finance",
      legal: "Legal",
      government: "Government",
      media: "Media",
      community: "Community",
      volunteering: "Volunteering",
      charity: "Charity",
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
      culture: "文化",
      entertainment: "エンタテインメント",
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
      clothing: "服装",
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
      philosophy: "哲学",
      science: "科学",
      literature: "文学",
      history: "歴史",
      art: "芸術",
      music: "音楽",
      sports: "スポーツ",
      politics: "政治",
      economics: "経済",
      law: "法律",
      psychology: "心理学",
      // health 도메인
      exercise: "運動",
      nutrition: "栄養",
      hospital: "病院",
      fitness: "フィットネス",
      wellness: "ウエルネス",
      therapy: "治療",
      prevention: "予防",
      symptoms: "症状",
      treatment: "治療",
      pharmacy: "薬局",
      rehabilitation: "リハビリ",
      medical_equipment: "医療機器",
      // sports 도메인
      football: "サッカー",
      basketball: "バスケットボール",
      swimming: "水泳",
      running: "ランニング",
      equipment: "装備",
      olympics: "オリンピック",
      tennis: "テニス",
      baseball: "野球",
      golf: "ゴルフ",
      martial_arts: "武術",
      team_sports: "チームスポーツ",
      individual_sports: "個人スポーツ",
      coaching: "コーチング",
      competition: "競争",
      // entertainment 도메인
      movie: "映画",
      game: "ゲーム",
      book: "本",
      theater: "劇場",
      concert: "コンサート",
      festival: "祭り",
      celebrity: "有名人",
      tv_show: "TV番組",
      comedy: "コメディ",
      drama: "ドラマ",
      animation: "アニメ",
      photography: "写真",
      // culture 도메인
      tradition: "伝統",
      customs: "習慣",
      language: "言語",
      religion: "宗教",
      heritage: "遺産",
      ceremony: "儀式",
      ritual: "儀礼",
      folklore: "民俗",
      mythology: "神話",
      arts_crafts: "芸術工芸",
      etiquette: "礼仪",
      national_identity: "国家統一感",
      // nature 도메인
      plant: "植物",
      weather: "天気",
      geography: "地理",
      environment: "環境",
      ecosystem: "生態系",
      conservation: "保存",
      climate: "気候",
      natural_disaster: "自然災害",
      landscape: "風景",
      marine_life: "海洋生物",
      forest: "森",
      mountain: "山",
      // technology 도메인
      computer: "コンピュータ",
      software: "ソフトウェア",
      internet: "インターネット",
      mobile: "モバイル",
      ai: "AI",
      programming: "プログラミング",
      cybersecurity: "サイバーセキュリティ",
      database: "データベース",
      robotics: "ロボット工学",
      blockchain: "ブロックチェーン",
      cloud: "クラウド",
      gaming: "ゲーム",
      innovation: "イノベーション",
      // business 도메인
      meeting: "会議",
      finance: "金融",
      marketing: "マーケティング",
      office: "オフィス",
      project: "プロジェクト",
      negotiation: "交渉",
      presentation: "プレゼンテーション",
      teamwork: "チームワーク",
      leadership: "リーダーシップ",
      networking: "ネットワーク",
      sales: "セールス",
      contract: "契約",
      startup: "スタートアップ",
      // education 도메인
      teaching: "教育",
      learning: "学習",
      classroom: "教室",
      curriculum: "カリキュラム",
      assessment: "評価",
      pedagogy: "教育学",
      skill_development: "スキル開発",
      online_learning: "オンライン学習",
      training: "トレーニング",
      certification: "資格",
      student_life: "学生生活",
      graduation: "卒業",
      examination: "試験",
      university: "大学",
      library: "図書館",
      // other 도메인
      hobbies: "趣味",
      finance_personal: "個人金融",
      legal: "法律",
      government: "政府",
      media: "メディア",
      community: "コミュニティ",
      volunteering: "ボランティア",
      charity: "慈善",
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
      culture: "文化",
      entertainment: "娱乐",
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
      communication: "沟通",
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
      philosophy: "哲学",
      science: "科学",
      literature: "文学",
      history: "历史",
      art: "艺术",
      music: "音乐",
      sports: "体育",
      politics: "政治",
      economics: "经济",
      law: "法律",
      psychology: "心理学",
      // health 도메인
      exercise: "运动",
      nutrition: "营养",
      hospital: "医院",
      fitness: "健身",
      wellness: "身心健康",
      therapy: "治疗",
      prevention: "预防",
      symptoms: "症状",
      treatment: "治疗",
      pharmacy: "药店",
      rehabilitation: "康复",
      medical_equipment: "医疗设备",
      // sports 도메인
      football: "足球",
      basketball: "篮球",
      swimming: "游泳",
      running: "跑步",
      equipment: "装备",
      olympics: "奥运会",
      tennis: "网球",
      baseball: "棒球",
      golf: "高尔夫",
      martial_arts: "武术",
      team_sports: "团队运动",
      individual_sports: "个人运动",
      coaching: "教练",
      competition: "竞争",
      // entertainment 도메인
      movie: "电影",
      game: "游戏",
      book: "书",
      theater: "剧院",
      concert: "音乐会",
      festival: "节日",
      celebrity: "名人",
      tv_show: "电视节目",
      comedy: "喜剧",
      drama: "戏剧",
      animation: "动画",
      photography: "摄影",
      // culture 도메인
      tradition: "传统",
      customs: "习俗",
      language: "语言",
      religion: "宗教",
      heritage: "遗产",
      ceremony: "仪式",
      ritual: "礼仪",
      folklore: "民俗",
      mythology: "神话",
      arts_crafts: "艺术手工艺",
      etiquette: "礼仪",
      national_identity: "国家统一感",
      // nature 도메인
      plant: "植物",
      weather: "天气",
      geography: "地理",
      environment: "环境",
      ecosystem: "生态系统",
      conservation: "保护",
      climate: "气候",
      natural_disaster: "自然灾害",
      landscape: "风景",
      marine_life: "海洋生物",
      forest: "森林",
      mountain: "山",
      // technology 도메인
      computer: "计算机",
      software: "软件",
      internet: "互联网",
      mobile: "移动",
      ai: "人工智能",
      programming: "编程",
      cybersecurity: "网络安全",
      database: "数据库",
      robotics: "机器人学",
      blockchain: "区块链",
      cloud: "云",
      gaming: "游戏",
      innovation: "创新",
      // business 도메인
      meeting: "会议",
      finance: "金融",
      marketing: "市场营销",
      office: "办公室",
      project: "项目",
      negotiation: "谈判",
      presentation: "演示",
      teamwork: "团队合作",
      leadership: "领导力",
      networking: "网络",
      sales: "销售",
      contract: "合同",
      startup: "创业",
      // education 도메인
      teaching: "教学",
      learning: "学习",
      classroom: "教室",
      curriculum: "课程",
      assessment: "评估",
      pedagogy: "教育学",
      skill_development: "技能开发",
      online_learning: "在线学习",
      training: "培训",
      certification: "认证",
      student_life: "学生生活",
      graduation: "毕业",
      examination: "考试",
      university: "大学",
      library: "图书馆",
      // other 도메인
      hobbies: "爱好",
      finance_personal: "个人金融",
      legal: "法律",
      government: "政府",
      media: "媒体",
      community: "社区",
      volunteering: "志愿服务",
      charity: "慈善",
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
 * @param {string} pos - 품사 키
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
 * 난이도 번역 함수
 * @param {string} level - 난이도 키
 * @param {string} lang - 언어 코드
 * @returns {string} 번역된 난이도
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
