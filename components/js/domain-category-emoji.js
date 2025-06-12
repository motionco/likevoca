// 도메인별 카테고리 매핑
const domainCategoryMapping = {
  daily: ["household", "family", "routine", "clothing", "furniture", "other"],
  food: ["fruit", "vegetable", "meat", "drink", "snack", "other"],
  travel: [
    "transportation",
    "accommodation",
    "tourist_attraction",
    "luggage",
    "direction",
    "other",
  ],
  business: ["meeting", "finance", "marketing", "office", "project", "other"],
  academic: [
    "science",
    "literature",
    "history",
    "mathematics",
    "research",
    "other",
  ],
  nature: ["animal", "plant", "weather", "geography", "environment", "other"],
  technology: ["computer", "software", "internet", "mobile", "ai", "other"],
  health: [
    "exercise",
    "medicine",
    "nutrition",
    "mental_health",
    "hospital",
    "other",
  ],
  sports: [
    "football",
    "basketball",
    "swimming",
    "running",
    "equipment",
    "other",
  ],
  entertainment: ["movie", "music", "game", "book", "art", "other"],
  other: ["other"],
};

// 카테고리별 이모지 매핑
const categoryEmojiMapping = {
  household: ["🏠", "🛏️", "🪑", "🚿", "🧽", "🧹", "🗑️", "🔑"],
  family: ["👨‍👩‍👧‍👦", "👶", "👧", "👦", "👴", "👵", "💑", "👪"],
  routine: ["⏰", "🌅", "🌙", "😴", "🍽️", "🚿", "🧘", "📱"],
  clothing: ["👕", "👖", "👗", "👔", "👠", "👟", "🧥", "👒"],
  furniture: ["🪑", "🛏️", "🛋️", "📺", "💡", "🪞", "🚪", "🪟"],
  fruit: ["🍎", "🍌", "🍊", "🍇", "🍓", "🥝", "🍑", "🥭"],
  vegetable: ["🥕", "🥬", "🥒", "🍅", "🥔", "🧄", "🧅", "🌽"],
  meat: ["🥩", "🍗", "🥓", "🍖", "🐟", "🦐", "🦀", "🍳"],
  drink: ["☕", "🍵", "🥤", "🍺", "🍷", "🥛", "🧃", "🥃"],
  snack: ["🍪", "🍩", "🍰", "🧁", "🍫", "🍿", "🥜", "🍭"],
  transportation: ["✈️", "🚗", "🚌", "🚊", "🚇", "🚢", "🚲", "🛵"],
  accommodation: ["🏨", "🏠", "🏕️", "🛏️", "🗝️", "🧳", "🎒", "📋"],
  tourist_attraction: ["🏛️", "🗽", "🎡", "🎢", "🏰", "⛩️", "🗿", "📸"],
  luggage: ["🧳", "🎒", "👜", "💼", "📦", "🛍️", "👝", "🎁"],
  direction: ["🗺️", "🧭", "📍", "🚩", "⬅️", "➡️", "⬆️", "⬇️"],
  meeting: ["💼", "📊", "📈", "💻", "📝", "🤝", "👔", "⏰"],
  finance: ["💰", "💳", "📊", "💵", "💎", "🏦", "📈", "💹"],
  marketing: ["📢", "📱", "💡", "🎯", "📊", "🚀", "💼", "📈"],
  office: ["💻", "📱", "📝", "📋", "🖇️", "📎", "🗂️", "📞"],
  project: ["📋", "📊", "⏰", "🎯", "🚀", "💡", "📈", "✅"],
  science: ["🔬", "⚗️", "🧪", "🔭", "🧬", "⚛️", "🌡️", "⚖️"],
  literature: ["📚", "✍️", "📖", "📝", "📜", "🖋️", "📑", "📰"],
  history: ["📜", "🏛️", "⚔️", "👑", "🗿", "📚", "🏺", "⏳"],
  mathematics: ["🔢", "📐", "📏", "🧮", "➕", "➖", "✖️", "➗"],
  research: ["🔍", "📊", "📈", "💻", "📝", "🧪", "📋", "💡"],
  animal: ["🐶", "🐱", "🐻", "🦁", "🐘", "🦒", "🐧", "🦋"],
  plant: ["🌳", "🌸", "🌺", "🌻", "🌹", "🌿", "🍀", "🌵"],
  weather: ["☀️", "🌧️", "❄️", "⛈️", "🌈", "☁️", "🌪️", "🌊"],
  geography: ["🏔️", "🌋", "🏝️", "🏜️", "🌍", "🗺️", "🧭", "⛰️"],
  environment: ["🌍", "♻️", "🌱", "💚", "🌊", "🌬️", "🔋", "⚡"],
  computer: ["💻", "🖥️", "⌨️", "🖱️", "💾", "💿", "🔌", "🖨️"],
  software: ["💻", "📱", "🖥️", "⚙️", "🔧", "💿", "📀", "💾"],
  internet: ["🌐", "📡", "📶", "💻", "📱", "🔗", "📧", "💬"],
  mobile: ["📱", "📞", "📲", "💬", "📷", "🎵", "🔋", "📶"],
  ai: ["🤖", "🧠", "💻", "⚡", "🔮", "🎯", "🚀", "💡"],
  exercise: ["🏃", "💪", "🏋️", "🚴", "🏊", "🧘", "⚽", "🏀"],
  medicine: ["💊", "🩺", "💉", "🏥", "👨‍⚕️", "👩‍⚕️", "🚑", "🩹"],
  nutrition: ["🥗", "🍎", "🥛", "💊", "🥕", "🍌", "🥑", "🍇"],
  mental_health: ["🧘", "💆", "😌", "🌸", "💚", "🧠", "☮️", "🤗"],
  hospital: ["🏥", "🩺", "👨‍⚕️", "👩‍⚕️", "🚑", "💊", "🛏️", "📋"],
  football: ["⚽", "🥅", "👕", "👟", "🏆", "📊", "🎯", "⏱️"],
  basketball: ["🏀", "🏀", "👕", "👟", "🏆", "📊", "⏱️", "🎯"],
  swimming: ["🏊", "🏊‍♀️", "🏊‍♂️", "🏖️", "💧", "🏆", "⏱️", "🥽"],
  running: ["🏃", "🏃‍♀️", "🏃‍♂️", "👟", "⏱️", "🏆", "📊", "🎽"],
  equipment: ["🏋️", "⚽", "🏀", "🎾", "🏸", "🏓", "🥊", "⛳"],
  movie: ["🎬", "🎭", "🍿", "🎞️", "📺", "🎪", "🎨", "🎭"],
  music: ["🎵", "🎶", "🎤", "🎸", "🎹", "🥁", "🎺", "🎧"],
  game: ["🎮", "🕹️", "🎯", "🃏", "🎲", "🧩", "🎪", "🎨"],
  book: ["📚", "📖", "📝", "✍️", "📜", "🖋️", "📑", "📰"],
  art: ["🎨", "🖌️", "🖍️", "🎭", "🖼️", "🎪", "🌈", "✨"],
  other: ["❓", "🔧", "⚙️", "📝", "💼", "🎯", "⭐", "🌟"],
};

// 번역 함수 - language-utils.js에서 가져오기
function getTranslation(key, lang = null) {
  const currentLang = lang || localStorage.getItem("preferredLanguage") || "ko";

  // language-utils.js의 translations 객체 사용 (올바른 구조로 접근)
  if (
    typeof window.translations !== "undefined" &&
    window.translations[currentLang] &&
    window.translations[currentLang][key]
  ) {
    return window.translations[currentLang][key];
  }

  // fallback 번역
  const fallbackTranslations = {
    select_category: {
      ko: "카테고리 선택",
      en: "Select Category",
      ja: "カテゴリ選択",
      zh: "选择类别",
    },
    select_emoji: {
      ko: "이모지 선택",
      en: "Select Emoji",
      ja: "絵文字選択",
      zh: "选择表情",
    },
    select_domain: {
      ko: "도메인 선택",
      en: "Select Domain",
      ja: "ドメイン選択",
      zh: "选择领域",
    },
  };

  if (fallbackTranslations[key]) {
    return (
      fallbackTranslations[key][currentLang] ||
      fallbackTranslations[key]["ko"] ||
      key
    );
  }

  return key;
}

// 카테고리 키를 현재 언어로 번역
function translateCategoryKey(categoryKey, lang = null) {
  const currentLang = lang || localStorage.getItem("preferredLanguage") || "ko";

  // 카테고리 번역 매핑 (확실한 번역을 위해)
  const categoryTranslations = {
    // 일상 관련
    daily_conversation: {
      ko: "일상 대화",
      en: "Daily Conversation",
      ja: "日常会話",
      zh: "日常对话",
    },
    family: { ko: "가족", en: "Family", ja: "家族", zh: "家庭" },
    home: { ko: "집", en: "Home", ja: "家", zh: "家" },
    household: {
      ko: "생활용품",
      en: "Household",
      ja: "生活用品",
      zh: "生活用品",
    },
    routine: { ko: "일상", en: "Routine", ja: "日常", zh: "日常" },
    clothing: { ko: "의류", en: "Clothing", ja: "衣類", zh: "服装" },
    furniture: { ko: "가구", en: "Furniture", ja: "家具", zh: "家具" },
    shopping: { ko: "쇼핑", en: "Shopping", ja: "ショッピング", zh: "购物" },
    transportation: {
      ko: "교통",
      en: "Transportation",
      ja: "交通",
      zh: "交通",
    },

    // 음식 관련
    fruit: { ko: "과일", en: "Fruit", ja: "果物", zh: "水果" },
    vegetable: { ko: "야채", en: "Vegetable", ja: "野菜", zh: "蔬菜" },
    meat: { ko: "고기", en: "Meat", ja: "肉", zh: "肉类" },
    drink: { ko: "음료", en: "Drink", ja: "飲み物", zh: "饮料" },
    snack: { ko: "간식", en: "Snack", ja: "スナック", zh: "零食" },

    // 비즈니스 관련
    meetings: { ko: "회의", en: "Meetings", ja: "会議", zh: "会议" },
    meeting: { ko: "회의", en: "Meeting", ja: "会議", zh: "会议" },
    presentations: {
      ko: "발표",
      en: "Presentations",
      ja: "プレゼンテーション",
      zh: "演示",
    },
    negotiations: { ko: "협상", en: "Negotiations", ja: "交渉", zh: "谈判" },
    finance: { ko: "금융", en: "Finance", ja: "金融", zh: "金融" },
    marketing: {
      ko: "마케팅",
      en: "Marketing",
      ja: "マーケティング",
      zh: "营销",
    },
    office: { ko: "사무실", en: "Office", ja: "オフィス", zh: "办公室" },
    project: { ko: "프로젝트", en: "Project", ja: "プロジェクト", zh: "项目" },

    // 학술 관련
    research: { ko: "연구", en: "Research", ja: "研究", zh: "研究" },
    literature: { ko: "문학", en: "Literature", ja: "文学", zh: "文学" },
    science: { ko: "과학", en: "Science", ja: "科学", zh: "科学" },
    mathematics: { ko: "수학", en: "Mathematics", ja: "数学", zh: "数学" },
    history: { ko: "역사", en: "History", ja: "歴史", zh: "历史" },

    // 여행 관련
    sightseeing: { ko: "관광", en: "Sightseeing", ja: "観光", zh: "观光" },
    accommodation: { ko: "숙박", en: "Accommodation", ja: "宿泊", zh: "住宿" },
    tourist_attraction: {
      ko: "관광명소",
      en: "Tourist Attraction",
      ja: "観光地",
      zh: "旅游景点",
    },
    luggage: { ko: "짐", en: "Luggage", ja: "荷物", zh: "行李" },
    direction: { ko: "방향", en: "Direction", ja: "方向", zh: "方向" },
    restaurants: {
      ko: "레스토랑",
      en: "Restaurants",
      ja: "レストラン",
      zh: "餐厅",
    },
    directions: { ko: "길 안내", en: "Directions", ja: "道案内", zh: "方向" },
    culture: { ko: "문화", en: "Culture", ja: "文化", zh: "文化" },

    // 자연 관련
    weather: { ko: "날씨", en: "Weather", ja: "天気", zh: "天气" },
    plants: { ko: "식물", en: "Plants", ja: "植物", zh: "植物" },
    plant: { ko: "식물", en: "Plant", ja: "植物", zh: "植物" },
    animals: { ko: "동물", en: "Animals", ja: "動物", zh: "动物" },
    animal: { ko: "동물", en: "Animal", ja: "動物", zh: "动物" },
    environment: { ko: "환경", en: "Environment", ja: "環境", zh: "环境" },
    geography: { ko: "지리", en: "Geography", ja: "地理", zh: "地理" },

    // 기술 관련
    computers: {
      ko: "컴퓨터",
      en: "Computers",
      ja: "コンピューター",
      zh: "计算机",
    },
    computer: {
      ko: "컴퓨터",
      en: "Computer",
      ja: "コンピューター",
      zh: "计算机",
    },
    internet: {
      ko: "인터넷",
      en: "Internet",
      ja: "インターネット",
      zh: "互联网",
    },
    mobile: { ko: "모바일", en: "Mobile", ja: "モバイル", zh: "移动设备" },
    software: {
      ko: "소프트웨어",
      en: "Software",
      ja: "ソフトウェア",
      zh: "软件",
    },
    ai: {
      ko: "인공지능",
      en: "Artificial Intelligence",
      ja: "人工知能",
      zh: "人工智能",
    },

    // 건강 관련
    medicine: { ko: "의학", en: "Medicine", ja: "医学", zh: "医学" },
    exercise: { ko: "운동", en: "Exercise", ja: "運動", zh: "运动" },
    fitness: { ko: "피트니스", en: "Fitness", ja: "フィットネス", zh: "健身" },
    nutrition: { ko: "영양", en: "Nutrition", ja: "栄養", zh: "营养" },
    mental_health: {
      ko: "정신 건강",
      en: "Mental Health",
      ja: "メンタルヘルス",
      zh: "心理健康",
    },
    hospitals: { ko: "병원", en: "Hospitals", ja: "病院", zh: "医院" },
    hospital: { ko: "병원", en: "Hospital", ja: "病院", zh: "医院" },

    // 스포츠 관련
    soccer: { ko: "축구", en: "Soccer", ja: "サッカー", zh: "足球" },
    football: { ko: "축구", en: "Football", ja: "サッカー", zh: "足球" },
    basketball: {
      ko: "농구",
      en: "Basketball",
      ja: "バスケットボール",
      zh: "篮球",
    },
    tennis: { ko: "테니스", en: "Tennis", ja: "テニス", zh: "网球" },
    swimming: { ko: "수영", en: "Swimming", ja: "水泳", zh: "游泳" },
    running: { ko: "달리기", en: "Running", ja: "ランニング", zh: "跑步" },
    equipment: { ko: "장비", en: "Equipment", ja: "設備", zh: "设备" },
    olympics: {
      ko: "올림픽",
      en: "Olympics",
      ja: "オリンピック",
      zh: "奥运会",
    },

    // 엔터테인먼트 관련
    movies: { ko: "영화", en: "Movies", ja: "映画", zh: "电影" },
    movie: { ko: "영화", en: "Movie", ja: "映画", zh: "电影" },
    music: { ko: "음악", en: "Music", ja: "音楽", zh: "音乐" },
    games: { ko: "게임", en: "Games", ja: "ゲーム", zh: "游戏" },
    game: { ko: "게임", en: "Game", ja: "ゲーム", zh: "游戏" },
    books: { ko: "책", en: "Books", ja: "本", zh: "书籍" },
    book: { ko: "책", en: "Book", ja: "本", zh: "书籍" },
    art: { ko: "예술", en: "Art", ja: "芸術", zh: "艺术" },
    tv_shows: {
      ko: "TV 프로그램",
      en: "TV Shows",
      ja: "テレビ番組",
      zh: "电视节目",
    },

    // 기타
    emotions: { ko: "감정", en: "Emotions", ja: "感情", zh: "情感" },
    relationships: {
      ko: "인간관계",
      en: "Relationships",
      ja: "人間関係",
      zh: "人际关系",
    },
    hobbies: { ko: "취미", en: "Hobbies", ja: "趣味", zh: "爱好" },
    education: { ko: "교육", en: "Education", ja: "教育", zh: "教育" },
    other: { ko: "기타", en: "Other", ja: "その他", zh: "其他" },
  };

  // 직접 매핑에서 번역 찾기
  if (
    categoryTranslations[categoryKey] &&
    categoryTranslations[categoryKey][currentLang]
  ) {
    return categoryTranslations[categoryKey][currentLang];
  }

  // language-utils.js의 번역 시스템 사용 (fallback)
  if (
    typeof window.translations !== "undefined" &&
    window.translations[currentLang] &&
    window.translations[currentLang][categoryKey]
  ) {
    return window.translations[currentLang][categoryKey];
  }

  return categoryKey;
}

// 도메인 선택 변경 시 카테고리 업데이트
function updateCategoryOptions() {
  const domainSelect = document.getElementById("concept-domain");
  const categorySelect = document.getElementById("concept-category");
  const emojiSelect = document.getElementById("concept-emoji");

  if (!domainSelect || !categorySelect || !emojiSelect) return;

  const selectedDomain = domainSelect.value;
  // 여러 소스에서 현재 언어 가져오기
  const currentLang =
    localStorage.getItem("preferredLanguage") ||
    localStorage.getItem("userLanguage") ||
    "ko";

  // 현재 선택된 카테고리 값 저장
  const selectedCategory = categorySelect.value;

  // 카테고리 옵션 초기화 (현재 환경 언어로 플레이스홀더 설정)
  const categoryPlaceholder = getTranslation("select_category", currentLang);
  categorySelect.innerHTML = `<option value="" style="display: none;">${categoryPlaceholder}</option>`;

  // 이모지 옵션 초기화 (현재 환경 언어로 플레이스홀더 설정)
  const emojiPlaceholder = getTranslation("select_emoji", currentLang);
  emojiSelect.innerHTML = `<option value="" style="display: none;">${emojiPlaceholder}</option>`;

  if (selectedDomain && domainCategoryMapping[selectedDomain]) {
    const categories = domainCategoryMapping[selectedDomain];

    categories.forEach((category) => {
      const option = document.createElement("option");
      option.value = category;
      const translatedText = translateCategoryKey(category, currentLang);
      option.textContent = translatedText; // 현재 언어로 번역
      categorySelect.appendChild(option);
    });

    // 카테고리 선택값 복원
    if (selectedCategory && categories.includes(selectedCategory)) {
      categorySelect.value = selectedCategory;

      // 카테고리가 복원되었으면 이모지 옵션도 업데이트
      if (categorySelect.value === selectedCategory) {
        updateEmojiOptions();
      }
    }
  }
}

// 도메인 옵션들을 환경 언어로 번역하는 함수
function updateDomainOptions() {
  const domainSelects = [
    document.getElementById("concept-domain"),
    document.getElementById("edit-concept-domain"),
  ];

  // 여러 소스에서 현재 언어 가져오기
  let currentLang =
    localStorage.getItem("preferredLanguage") ||
    localStorage.getItem("userLanguage") ||
    "ko";

  // 도메인 번역 매핑 (확실한 번역을 위해)
  const domainTranslations = {
    daily: { ko: "일상", en: "Daily Life", ja: "日常生活", zh: "日常生活" },
    business: { ko: "비즈니스", en: "Business", ja: "ビジネス", zh: "商务" },
    academic: { ko: "학술", en: "Academic", ja: "学術", zh: "学术" },
    travel: { ko: "여행", en: "Travel", ja: "旅行", zh: "旅行" },
    food: { ko: "음식", en: "Food", ja: "食べ物", zh: "食物" },
    nature: { ko: "자연", en: "Nature", ja: "自然", zh: "自然" },
    technology: { ko: "기술", en: "Technology", ja: "技術", zh: "技术" },
    health: { ko: "건강", en: "Health", ja: "健康", zh: "健康" },
    sports: { ko: "스포츠", en: "Sports", ja: "スポーツ", zh: "体育" },
    entertainment: {
      ko: "엔터테인먼트",
      en: "Entertainment",
      ja: "エンターテインメント",
      zh: "娱乐",
    },
    other: { ko: "기타", en: "Other", ja: "その他", zh: "其他" },
  };

  domainSelects.forEach((domainSelect) => {
    if (!domainSelect) return;

    // 기존 선택된 값 저장
    const selectedValue = domainSelect.value;

    // 도메인 옵션들 번역
    const options = domainSelect.querySelectorAll("option");

    options.forEach((option) => {
      const domainKey = option.value;
      if (domainKey && domainKey !== "") {
        // 직접 매핑에서 번역 찾기
        if (
          domainTranslations[domainKey] &&
          domainTranslations[domainKey][currentLang]
        ) {
          option.textContent = domainTranslations[domainKey][currentLang];
          console.log(
            `✅ 도메인 번역: ${domainKey} -> ${domainTranslations[domainKey][currentLang]}`
          );
        } else {
          // window.translations에서 번역 찾기 (fallback)
          const translatedText = getTranslation(domainKey, currentLang);
          option.textContent = translatedText;
        }
      } else {
        // 플레이스홀더 옵션
        const placeholderText = getTranslation("select_domain", currentLang);
        option.textContent = placeholderText;
      }
    });

    // 선택된 값 복원
    domainSelect.value = selectedValue;

    // 도메인이 선택되어 있으면 카테고리도 업데이트
    if (selectedValue) {
      if (domainSelect.id === "concept-domain") {
        updateCategoryOptions();
      } else if (domainSelect.id === "edit-concept-domain") {
        updateEditCategoryOptions();
      }
    }
  });
}

// 편집 모달용 도메인 선택 변경 시 카테고리 업데이트
function updateEditCategoryOptions() {
  const domainSelect = document.getElementById("edit-concept-domain");
  const categorySelect = document.getElementById("edit-concept-category");
  const emojiSelect = document.getElementById("edit-concept-emoji");

  if (!domainSelect || !categorySelect || !emojiSelect) return;

  const selectedDomain = domainSelect.value;
  // 여러 소스에서 현재 언어 가져오기
  const currentLang =
    localStorage.getItem("preferredLanguage") ||
    localStorage.getItem("userLanguage") ||
    "ko";

  // 현재 선택된 카테고리 값 저장
  const selectedCategory = categorySelect.value;
  console.log("🔄 편집 모달 카테고리 업데이트:", {
    selectedDomain,
    selectedCategory,
  });

  // 카테고리 옵션 초기화 (현재 환경 언어로 플레이스홀더 설정)
  const categoryPlaceholder = getTranslation("select_category", currentLang);
  categorySelect.innerHTML = `<option value="" style="display: none;">${categoryPlaceholder}</option>`;

  // 이모지 옵션 초기화 (현재 환경 언어로 플레이스홀더 설정)
  const emojiPlaceholder = getTranslation("select_emoji", currentLang);
  emojiSelect.innerHTML = `<option value="" style="display: none;">${emojiPlaceholder}</option>`;

  if (selectedDomain && domainCategoryMapping[selectedDomain]) {
    const categories = domainCategoryMapping[selectedDomain];

    categories.forEach((category) => {
      const option = document.createElement("option");
      option.value = category;
      const translatedText = translateCategoryKey(category, currentLang);
      option.textContent = translatedText; // 현재 언어로 번역
      categorySelect.appendChild(option);
    });

    // 카테고리 선택값 복원
    if (selectedCategory && categories.includes(selectedCategory)) {
      categorySelect.value = selectedCategory;
      console.log("✅ 편집 모달 카테고리 값 복원:", selectedCategory);

      // 카테고리가 복원되었으면 이모지 옵션도 업데이트
      if (categorySelect.value === selectedCategory) {
        updateEditEmojiOptions();
      }
    } else if (selectedCategory) {
      console.log("❌ 편집 모달 카테고리 복원 실패:", {
        selectedCategory,
        availableCategories: categories,
      });
    }
  }
}

// 편집 모달용 카테고리 선택 변경 시 이모지 업데이트
function updateEditEmojiOptions() {
  console.log("🔄 편집 모달 이모지 옵션 업데이트 시작");

  const categorySelect = document.getElementById("edit-concept-category");
  const emojiSelect = document.getElementById("edit-concept-emoji");

  if (!categorySelect || !emojiSelect) {
    console.log("❌ 편집 모달 이모지 업데이트: 필드를 찾을 수 없음", {
      categorySelect: !!categorySelect,
      emojiSelect: !!emojiSelect,
    });
    return;
  }

  const selectedCategory = categorySelect.value;
  const currentLang =
    localStorage.getItem("preferredLanguage") ||
    localStorage.getItem("userLanguage") ||
    "ko";

  // DB에서 가져온 원본 이모지 값 (전역 저장소에서 확인)
  const originalDbEmoji = window.editConceptEmojiValue;

  console.log("🔍 편집 모달 이모지 업데이트:", {
    selectedCategory,
    currentLang,
    originalDbEmoji,
    categoryEmojiMapping: !!categoryEmojiMapping[selectedCategory],
    availableEmojis: categoryEmojiMapping[selectedCategory],
  });

  // 이모지 옵션 초기화 (현재 환경 언어로 플레이스홀더 설정)
  const emojiPlaceholder = getTranslation("select_emoji", currentLang);
  emojiSelect.innerHTML = `<option value="" style="display: none;">${emojiPlaceholder}</option>`;

  if (selectedCategory && categoryEmojiMapping[selectedCategory]) {
    let emojis = [...categoryEmojiMapping[selectedCategory]]; // 복사본 생성

    // DB 이모지가 하드코딩 옵션에 없으면 동적으로 추가
    if (originalDbEmoji && !emojis.includes(originalDbEmoji)) {
      emojis.unshift(originalDbEmoji); // 맨 앞에 추가
      console.log("🔄 DB 이모지를 옵션에 동적 추가:", {
        originalDbEmoji,
        wasInHardcoded: false,
        newEmojiList: emojis,
      });
    }

    console.log("✅ 편집 모달 이모지 옵션 생성:", emojis);

    emojis.forEach((emoji, index) => {
      const option = document.createElement("option");
      option.value = emoji;
      option.textContent = emoji;

      // DB 원본 이모지인 경우 표시
      if (
        emoji === originalDbEmoji &&
        !categoryEmojiMapping[selectedCategory].includes(emoji)
      ) {
        option.textContent = `${emoji} (현재)`;
        option.style.fontWeight = "bold";
        option.style.color = "#2563eb";
      }

      emojiSelect.appendChild(option);
    });

    console.log("✅ 편집 모달 이모지 옵션 생성 완료, 총", emojis.length, "개");

    // DB 원본 이모지로 선택 상태 설정
    if (originalDbEmoji) {
      emojiSelect.value = originalDbEmoji;
      console.log("✅ 편집 모달 DB 원본 이모지로 설정:", {
        originalDbEmoji,
        finalValue: emojiSelect.value,
        success: emojiSelect.value === originalDbEmoji,
      });
    } else {
      // DB 이모지가 없으면 첫 번째 하드코딩 이모지 선택
      if (emojis.length > 0) {
        emojiSelect.value = emojis[0];
        console.log("✅ 편집 모달 기본 이모지로 설정:", emojis[0]);
      }
    }
  } else {
    console.log("❌ 편집 모달 이모지 매핑 없음:", {
      selectedCategory,
      hasCategoryMapping: !!categoryEmojiMapping[selectedCategory],
    });
  }

  console.log("✅ 편집 모달 이모지 옵션 업데이트 완료");
}

// 전체 도메인-카테고리-이모지 언어 업데이트 함수
function updateDomainCategoryEmojiLanguage() {
  console.log("🔄 전체 도메인-카테고리-이모지 언어 업데이트 시작");

  // 도메인 옵션 업데이트
  updateDomainOptions();

  // 현재 선택된 도메인에 따라 카테고리도 업데이트
  const domainSelect = document.getElementById("concept-domain");
  const editDomainSelect = document.getElementById("edit-concept-domain");

  if (domainSelect && domainSelect.value) {
    updateCategoryOptions();
  }

  if (editDomainSelect && editDomainSelect.value) {
    updateEditCategoryOptions();
  }

  console.log("✅ 전체 도메인-카테고리-이모지 언어 업데이트 완료");
}

// 품사 선택 옵션들을 환경 언어로 번역하는 함수
function updatePartOfSpeechOptions() {
  const currentLang = localStorage.getItem("preferredLanguage") || "ko";

  // 모든 품사 선택 드롭다운 찾기
  const posSelects = [
    // 개념 추가 모달
    document.getElementById("korean-pos"),
    document.getElementById("english-pos"),
    document.getElementById("japanese-pos"),
    document.getElementById("chinese-pos"),
    // 편집 모달
    document.getElementById("edit-korean-pos"),
    document.getElementById("edit-english-pos"),
    document.getElementById("edit-japanese-pos"),
    document.getElementById("edit-chinese-pos"),
  ];

  posSelects.forEach((select) => {
    if (!select) return;

    // 기존 선택된 값 저장
    const selectedValue = select.value;

    // 플레이스홀더 옵션 번역
    const placeholderOption = select.querySelector('option[value=""]');
    if (placeholderOption) {
      placeholderOption.textContent = getTranslation("select_pos", currentLang);
    }

    // 선택된 값 복원
    select.value = selectedValue;
  });
}

// 언어 탭별 품사 플레이스홀더와 선택지를 해당 언어로 업데이트하는 함수
function updatePartOfSpeechByLanguageTab() {
  // 각 언어별 품사 매핑
  const posMapping = {
    korean: {
      placeholder: "품사 선택",
      options: {
        명사: "명사",
        동사: "동사",
        형용사: "형용사",
        부사: "부사",
        대명사: "대명사",
        전치사: "전치사",
        접속사: "접속사",
        감탄사: "감탄사",
        조사: "조사",
        기타: "기타",
      },
    },
    english: {
      placeholder: "Select part of speech",
      options: {
        noun: "noun",
        verb: "verb",
        adjective: "adjective",
        adverb: "adverb",
        pronoun: "pronoun",
        preposition: "preposition",
        conjunction: "conjunction",
        interjection: "interjection",
        determiner: "determiner",
        other: "other",
      },
    },
    japanese: {
      placeholder: "品詞を選択",
      options: {
        名詞: "名詞",
        動詞: "動詞",
        形容詞: "形容詞",
        副詞: "副詞",
        代名詞: "代名詞",
        前置詞: "前置詞",
        接続詞: "接続詞",
        感嘆詞: "感嘆詞",
        助詞: "助詞",
        その他: "その他",
      },
    },
    chinese: {
      placeholder: "选择词性",
      options: {
        名词: "名词",
        动词: "动词",
        形容词: "形容词",
        副词: "副词",
        代词: "代词",
        介词: "介词",
        连词: "连词",
        感叹词: "感叹词",
        量词: "量词",
        其他: "其他",
      },
    },
  };

  // 각 언어별 품사 선택 드롭다운 업데이트
  Object.keys(posMapping).forEach((lang) => {
    const mapping = posMapping[lang];

    // 개념 추가 모달
    const addSelect = document.getElementById(`${lang}-pos`);
    if (addSelect) {
      updatePosSelect(addSelect, mapping);
    }

    // 편집 모달
    const editSelect = document.getElementById(`edit-${lang}-pos`);
    if (editSelect) {
      updatePosSelect(editSelect, mapping);
    }
  });
}

// 개별 품사 선택 드롭다운 업데이트 헬퍼 함수
function updatePosSelect(select, mapping) {
  if (!select) return;

  // 기존 선택된 값 저장
  const selectedValue = select.value;

  // 플레이스홀더 옵션 업데이트
  const placeholderOption = select.querySelector('option[value=""]');
  if (placeholderOption) {
    placeholderOption.textContent = mapping.placeholder;
  }

  // 각 옵션의 텍스트 업데이트 (value는 유지, 표시 텍스트만 변경)
  const options = select.querySelectorAll('option:not([value=""])');
  options.forEach((option) => {
    const value = option.value;
    if (mapping.options[value]) {
      option.textContent = mapping.options[value];
    }
  });

  // 선택된 값 복원
  select.value = selectedValue;
}

// 카테고리 선택 변경 시 이모지 업데이트
function updateEmojiOptions() {
  const categorySelect = document.getElementById("concept-category");
  const emojiSelect = document.getElementById("concept-emoji");

  if (!categorySelect || !emojiSelect) return;

  const selectedCategory = categorySelect.value;
  const currentLang =
    localStorage.getItem("preferredLanguage") ||
    localStorage.getItem("userLanguage") ||
    "ko";

  // 현재 선택된 이모지 값 저장
  const selectedEmoji = emojiSelect.value;

  // 이모지 옵션 초기화 (현재 환경 언어로 플레이스홀더 설정)
  const emojiPlaceholder = getTranslation("select_emoji", currentLang);
  emojiSelect.innerHTML = `<option value="" style="display: none;">${emojiPlaceholder}</option>`;

  if (selectedCategory && categoryEmojiMapping[selectedCategory]) {
    const emojis = categoryEmojiMapping[selectedCategory];

    emojis.forEach((emoji) => {
      const option = document.createElement("option");
      option.value = emoji;
      option.textContent = emoji;
      emojiSelect.appendChild(option);
    });

    // 이모지 선택값 복원
    if (selectedEmoji && emojis.includes(selectedEmoji)) {
      emojiSelect.value = selectedEmoji;
    }
  }
}

// 전역 함수로 등록
window.updateCategoryOptions = updateCategoryOptions;
window.updateEmojiOptions = updateEmojiOptions;
window.updateEditCategoryOptions = updateEditCategoryOptions;
window.updateEditEmojiOptions = updateEditEmojiOptions;
window.updateDomainOptions = updateDomainOptions;
window.updatePartOfSpeechOptions = updatePartOfSpeechOptions;
window.updatePartOfSpeechByLanguageTab = updatePartOfSpeechByLanguageTab;
window.updateDomainCategoryEmojiLanguage = updateDomainCategoryEmojiLanguage;

// 페이지 로드 시 도메인 옵션 번역 초기화
document.addEventListener("DOMContentLoaded", () => {
  // 약간의 지연을 두어 다른 스크립트들이 로드될 시간을 확보
  setTimeout(() => {
    updateDomainOptions();
    updatePartOfSpeechOptions();
    updatePartOfSpeechByLanguageTab();
  }, 100);
});

// 언어 변경 이벤트 리스너
document.addEventListener("languageChanged", () => {
  updateDomainCategoryEmojiLanguage();
});
