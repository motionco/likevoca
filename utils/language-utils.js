// 지?�하???�어 목록
const SUPPORTED_LANGUAGES = {
  ko: {
    name: "?�국??,
    code: "ko",
  },
  en: {
    name: "English",
    code: "en",
  },
  ja: {
    name: "?�本�?,
    code: "ja",
  },
  zh: {
    name: "�?��",
    code: "zh",
  },
};

// 공통?�로 ?�용?�는 ?�스???�의
const commonTexts = {
  ko: {
    language_learning: "?�국???�습",
    language_learning_desc:
      "?�래?�카?? ?�즈, ?�?�핑 ???�양??방식?�로 ?�어�??�습?�세??",
    language_games: "?�국??게임",
    language_games_desc:
      "?��??�는 게임???�해 ?�양???�어�?즐겁�?배워보세??",
  },
  en: {
    language_learning: "Language Learning",
    language_learning_desc:
      "Learn languages in various ways such as flashcards, quizzes, and typing.",
    language_games: "Language Games",
    language_games_desc: "Learn various languages enjoyably through fun games.",
  },
  ja: {
    language_learning: "多�?語�?�?,
    language_learning_desc:
      "?�ラ?�シ?�カ?�ド?�ク?�ズ?�タ?�ピ?�グ?�ど?�様?�な?�法?��?語を学び?�し?�う??,
    language_games: "多�?語ゲ?�ム",
    language_games_desc: "楽し?�ゲ?�ム?�通し??��?�な言語を楽し?��??�ま?�ょ?��?,
  },
  zh: {
    language_learning: "多�?言学习",
    language_learning_desc: "?�过?�卡?�测验和?�字等多种方式�?习�?言??,
    language_games: "多�?言游戏",
    language_games_desc: "?�过?�趣?�游?�愉快地学习?�种�????,
  },
};

// SEO�??�한 메�??�이???�정
const seoMetadata = {
  // ?�페?��? 메�??�이??  home: {
    ko: {
      title: "LikeVoca - " + commonTexts.ko.language_learning,
      description: commonTexts.ko.language_learning_desc,
      keywords:
        "?�어 ?�습, ?�국?? ?�어?? AI ?�어?? ?�어, ?�본?? 중국?? ?�국??,
      canonical: "https://likevoca.com/ko",
    },
    en: {
      title: "LikeVoca - " + commonTexts.en.language_learning,
      description: commonTexts.en.language_learning_desc,
      keywords:
        "language learning, multilingual, wordbook, AI wordbook, English, Japanese, Chinese, Korean",
      canonical: "https://likevoca.com/en",
    },
    ja: {
      title: "LikeVoca - " + commonTexts.ja.language_learning,
      description: commonTexts.ja.language_learning_desc,
      keywords:
        "語�?�?��, 多�?�? ?�語�? AI?�語�? ?�語, ?�本�? �?���? ?�国�?,
      canonical: "https://likevoca.com/ja",
    },
    zh: {
      title: "LikeVoca - " + commonTexts.zh.language_learning,
      description: commonTexts.zh.language_learning_desc,
      keywords: "�??学习, 多�?言, ?�词?? AI?�词?? ?��?, ?��?, �?��, ?��?",
      canonical: "https://likevoca.com/zh",
    },
  },
  // ?�국???�어???�이지 메�??�이??  dictionary: {
    ko: {
      title: "LikeVoca - ?�국???�어??,
      description: "?�만???�국???�어?�을 만들�??�과?�으�??�습?�세??",
      keywords:
        "?�국???�어?? ?�어 ?�어?? ?�본???�어?? 중국???�어?? ?�어 ?�습",
      canonical: "https://likevoca.com/ko/pages/multilingual-dictionary.html",
    },
    en: {
      title: "LikeVoca - Multilingual Dictionary",
      description:
        "Create your own multilingual dictionary and learn effectively.",
      keywords:
        "multilingual dictionary, English dictionary, Japanese dictionary, Chinese dictionary, language learning",
      canonical: "https://likevoca.com/en/pages/multilingual-dictionary.html",
    },
    ja: {
      title: "LikeVoca - 多�?語辞??,
      description: "?�分?�け??��言語辞?�を作成?�、効?�的?��?習し?�し?�う??,
      keywords: "多�?語辞?? ?�語辞書, ?�本語辞?? �?��語辞?? 言語�?�?,
      canonical: "https://likevoca.com/ja/pages/multilingual-dictionary.html",
    },
    zh: {
      title: "LikeVoca - 多�?言词典",
      description: "?�建?�自己的多�?言词典并有?��?习�?,
      keywords: "多�?言词典, ?��?词典, ?��?词典, �?��词典, �??学习",
      canonical: "https://likevoca.com/zh/pages/multilingual-dictionary.html",
    },
  },
  // ?�국???�습 ?�이지 메�??�이??  learning: {
    ko: {
      title: "LikeVoca - " + commonTexts.ko.language_learning,
      description: commonTexts.ko.language_learning_desc,
      keywords:
        "?�국???�습, ?�어 ?�습, ?�래?�카?? ?�즈, ?�어, ?�본?? 중국?? ?�국??,
      canonical: "https://likevoca.com/ko/pages/language-learning.html",
    },
    en: {
      title: "LikeVoca - " + commonTexts.en.language_learning,
      description: commonTexts.en.language_learning_desc,
      keywords:
        "language learning, multilingual learning, flashcards, quiz, English, Japanese, Chinese, Korean",
      canonical: "https://likevoca.com/en/pages/language-learning.html",
    },
    ja: {
      title: "LikeVoca - " + commonTexts.ja.language_learning,
      description: commonTexts.ja.language_learning_desc,
      keywords:
        "多�?語�?�? 言語�?�? ?�ラ?�シ?�カ?�ド, ??��?? ?�語, ?�本�? �?���? ?�国�?,
      canonical: "https://likevoca.com/ja/pages/language-learning.html",
    },
    zh: {
      title: "LikeVoca - " + commonTexts.zh.language_learning,
      description: commonTexts.zh.language_learning_desc,
      keywords: "多�?言学习, �??学习, ?�卡, 测验, ?��?, ?��?, �?��, ?��?",
      canonical: "https://likevoca.com/zh/pages/language-learning.html",
    },
  },
  // ?�국??게임 ?�이지 메�??�이??  games: {
    ko: {
      title: "LikeVoca - ?�국??게임",
      description: "?��??�는 게임???�해 ?�양???�어�?즐겁�?배워보세??",
      keywords:
        "?�어 게임, ?�국??게임, ?�어 게임, ?�어 ?�습 게임, ?�어, ?�본?? 중국?? ?�국??,
      canonical: "https://likevoca.com/ko/pages/games.html",
    },
    en: {
      title: "LikeVoca - Language Games",
      description: "Learn various languages enjoyably through fun games.",
      keywords:
        "language games, multilingual games, word games, language learning games, English, Japanese, Chinese, Korean",
      canonical: "https://likevoca.com/en/pages/games.html",
    },
    ja: {
      title: "LikeVoca - 多�?語ゲ?�ム",
      description: "楽し?�ゲ?�ム?�通し??��?�な言語を楽し?��??�ま?�ょ?��?,
      keywords:
        "言語ゲ?�ム, 多�?語ゲ?�ム, ?�語?�ー?? 言語�?習ゲ?�ム, ?�語, ?�本�? �?���? ?�国�?,
      canonical: "https://likevoca.com/ja/pages/games.html",
    },
    zh: {
      title: "LikeVoca - 多�?言游戏",
      description: "?�过?�趣?�游?�愉快地学习?�种�????,
      keywords:
        "�??游戏, 多�?言游戏, ?�词游戏, �??学习游戏, ?��?, ?��?, �?��, ?��?",
      canonical: "https://likevoca.com/zh/pages/games.html",
    },
  },
  // AI ?�어???�이지 메�??�이??  "ai-vocabulary": {
    ko: {
      title: "LikeVoca - AI ?�어??,
      description:
        "AI가 추천?�는 ?�국???�어?�을 만들�??�과?�으�??�습?�세??",
      keywords:
        "AI ?�어?? ?�국???�어?? ?�어 ?�어?? ?�본???�어?? 중국???�어?? AI ?�어 ?�습",
      canonical: "https://likevoca.com/ko/pages/ai-vocabulary.html",
    },
    en: {
      title: "LikeVoca - AI Vocabulary",
      description:
        "Create AI-recommended multilingual vocabulary and learn effectively.",
      keywords:
        "AI vocabulary, multilingual vocabulary, English vocabulary, Japanese vocabulary, Chinese vocabulary, AI language learning",
      canonical: "https://likevoca.com/en/pages/ai-vocabulary.html",
    },
    ja: {
      title: "LikeVoca - AI?�語�?,
      description: "AI?�推?�す?�多言語単語帳?�作?�し?�効?�的?��?習し?�し?�う??,
      keywords:
        "AI?�語�? 多�?語単語帳, ?�語?�語�? ?�本語単語帳, �?��語単語帳, AI言語�?�?,
      canonical: "https://likevoca.com/ja/pages/ai-vocabulary.html",
    },
    zh: {
      title: "LikeVoca - AI词汇??,
      description: "?�建AI?�荐?�多�??词汇?�并?�效学习??,
      keywords:
        "AI词汇?? 多�?言词汇?? ?��?词汇?? ?��?词汇?? �?��词汇?? AI�??学习",
      canonical: "https://likevoca.com/zh/pages/ai-vocabulary.html",
    },
  },
  // ?�만???�어???�이지 메�??�이??  "my-vocabulary": {
    ko: {
      title: "LikeVoca - ?�만???�어??,
      description:
        "북마?�한 ?�어?�을 모아???�만???�어?�을 만들�??�과?�으�??�습?�세??",
      keywords:
        "?�만???�어?? 북마???�어?? ?�국???�어?? 개인 ?�어?? ?�어 ?�습",
      canonical: "https://likevoca.com/ko/pages/my-word-list.html",
    },
    en: {
      title: "LikeVoca - My Vocabulary",
      description:
        "Collect your bookmarked words to create your own vocabulary and learn effectively.",
      keywords:
        "my vocabulary, bookmarked vocabulary, multilingual vocabulary, personal vocabulary, language learning",
      canonical: "https://likevoca.com/en/pages/my-word-list.html",
    },
    ja: {
      title: "LikeVoca - 私の?�語�?,
      description:
        "?�ッ??��?�ク?�た?�語?�集?�て?�分?�け??��語帳?�作?�し?�効?�的?��?習し?�し?�う??,
      keywords:
        "私の?�語�? ?�ッ??��?�ク?�語�? 多�?語単語帳, ?�人?�語�? 言語�?�?,
      canonical: "https://likevoca.com/ja/pages/my-word-list.html",
    },
    zh: {
      title: "LikeVoca - ?�的词汇??,
      description: "?�集?�收?�的?�词，创建您?�己?�词汇本并有?��?习�?,
      keywords: "?�的词汇?? ?�藏词汇?? 多�?言词汇?? 个人词汇?? �??学习",
      canonical: "https://likevoca.com/zh/pages/my-word-list.html",
    },
  },
};

// 번역 ?�스???�?�소
const translations = {
  ko: {
    home: "??,
    wordbook: "?�어??,
    vocabulary: "?�어??,
    multilingual_dictionary: "?�국???�어??,
    ai_wordbook: "AI ?�어??,
    ai_vocabulary: "AI ?�어??,
    language_learning: commonTexts.ko.language_learning,
    language_learning_desc: commonTexts.ko.language_learning_desc,
    language_games: commonTexts.ko.language_games,
    language_games_desc: commonTexts.ko.language_games_desc,
    inquiry: "문의?�기",
    login: "로그??,
    signup: "?�원가??,
    logout: "로그?�웃",
    profile: "?�로??,
    delete_account: "?�원?�퇴",
    welcome: "?�영?�니??,
    user_suffix: "??,
    get_started_free: "무료�??�작?�기",
    learn_languages: "?�양???�어�??�고 ?��??�게 배워보세??,
    effective_learning:
      "체계?�인 커리?�럼�?직�??�인 ?�습 ?�스?�으�??�신???�어 ?�습???�욱 ?�과?�으�?만들?�드립니??",
    wordbook_desc:
      "?�습???�어�??�력?�고 ?�만???�국???�어?�을 만들?�보?�요.",
    ai_wordbook_desc:
      "Google Gemini AI�?맞춤 ?�어�?추천받고, ?�어 ?�력???�우?�요.",
    ai_vocabulary_desc:
      "AI가 추천?�는 ?�국??개념???�습?�고 ?�어 ?�력???�상?�키?�요.",
    inquiry_desc: "궁금???�이 ?�거???��????�요?�시�??�제?��? 문의?�세??",
    start: "?�작?�기",
    language_settings: "?�어 ?�정",
    save: "?�??,
    cancel: "취소",
    total_concepts: "?�체 개념 ??,
    concepts_unit: "�?,
    ai_usage: "AI ?�용??,
    ai_recommend_concept: "AI 개념 추천받기",
    // 모달 관??번역
    add_concept: "개념 추�?",
    edit_concept: "개념 ?�정",
    domain: "?�메??,
    select_domain: "?�메???�택",
    category: "카테고리",
    category_placeholder: "?? fruit, animal",
    emoji: "?�모지",
    language_expressions: "?�어�??�현",
    word: "?�어",
    pronunciation: "발음",
    definition: "?�의",
    part_of_speech: "?�사",
    select_pos: "?�사 ?�택",
    // ?�사 번역
    noun: "명사",
    verb: "?�사",
    adjective: "?�용??,
    adverb: "부??,
    pronoun: "?�명사",
    preposition: "?�치??,
    conjunction: "?�속??,
    interjection: "감탄??,
    particle: "조사",
    determiner: "?�정??,
    classifier: "분류??,
    other: "기�?",
    // ?�어?�적 ?�어 번역
    synonyms: "?�사??(?�표�?구분)",
    antonyms: "반의??(?�표�?구분)",
    collocations: "?�어 (?�표�?구분)",
    compound_words: "복합??(?�표�?구분)",
    examples: "?�문",
    add_example: "?�문 추�?",
    representative_example: "?�???�문",
    korean_example: "?�국???�문",
    english_example: "?�어 ?�문",
    japanese_example: "?�본???�문",
    chinese_example: "중국???�문",
    tags: "?�그 (?�표�?구분)",
    // ?�메??번역
    academic: "?�술",
    technology: "기술",
    health: "건강",
    sports: "?�포�?,
    entertainment: "?�터?�인먼트",
    // ?�메???�터 번역
    domain_filter: "?�메??,
    all_domains: "?�체 ?�메??,
    domain_daily: "?�상",
    domain_business: "비즈?�스",
    domain_academic: "?�술",
    domain_travel: "?�행",
    domain_food: "?�식",
    domain_nature: "?�연",
    domain_technology: "기술",
    domain_health: "건강",
    domain_sports: "?�포�?,
    domain_entertainment: "?�터?�인먼트",
    domain_other: "기�?",
    // 로그???�이지 번역
    login_with_google: "Google�?로그??,
    login_with_github: "Github�?로그??,
    or: "?�는",
    email: "?�메??,
    email_placeholder: "?�메?�을 ?�력?�세??,
    password: "비�?번호",
    password_placeholder: "비�?번호�??�력?�세??,
    auto_login: "?�동 로그??,
    forgot_password: "비�?번호�??�으?�나??",
    no_account: "계정???�으?��???",
    // ?�원가???�이지 번역
    create_account: "계정 만들�?,
    name: "?�름",
    name_placeholder: "?�름???�력?�세??,
    confirm_password: "비�?번호 ?�인",
    confirm_password_placeholder: "비�?번호�??�시 ?�력?�세??,
    agree_terms: "?�용?��????�의?�니??,
    already_account: "?��? 계정???�으?��???",
    // 문의 ?�이지 번역
    contact_us: "문의?�기",
    subject: "?�목",
    subject_placeholder: "문의 ?�목???�력?�세??,
    message: "메시지",
    message_placeholder: "문의 ?�용???�력?�세??,
    send: "보내�?,
    // ?�국???�어???�이지 번역
    search: "검??,
    search_placeholder: "검?�어 ?�력...",
    source_language: "?�본 ?�어",
    target_language: "?�???�어",
    all_categories: "모든 카테고리",
    fruit: "과일",
    food: "?�식",
    animal: "?�물",
    daily: "?�상",
    travel: "?�행",
    business: "비즈?�스",
    concept_count: "개의 개념",
    sort: "?�렬",
    latest: "최신??,
    oldest: "?�래?�순",
    alphabetical: "가?�다??,
    reverse_alphabetical: "????�다??,
    concept_usage: "개념 ?�용??,
    add_new_concept: "??개념 추�?",
    bulk_add_concept: "?�??개념 추�?",
    load_more: "??보기",
    korean: "?�국??,
    english: "?�어",
    japanese: "?�본??,
    chinese: "중국??,
    // ?�국???�습 ?�이지 번역
    language_learning_title: "?�국???�습",
    select_source_language: "?�본 ?�어 ?�택",
    select_target_language: "?�???�어 ?�택",
    learning_mode: "?�습 모드",
    flashcards: "?�래?�카??,
    flashcards_desc: "?�어 ?�면/?�면?�로 ?�습",
    quiz: "?�즈",
    quiz_desc: "객�???문제�??�습",
    typing: "?�?�핑",
    typing_desc: "직접 ?�력?�여 ?�습",
    previous: "?�전",
    flip: "?�집�?,
    next: "?�음",
    examples: "?�문:",
    card_progress: "진행�?,
    quiz_question: "문제",
    next_question: "?�음 문제",
    quiz_progress: "진행�?,
    typing_prompt: "?�답???�력?�세??",
    typing_placeholder: "?�답 ?�력...",
    check_answer: "?�답 ?�인",
    next_word: "?�음 ?�어",
    typing_progress: "진행�?,
    correct_count: "맞춘 개수:",
    wrong_count: "?��?개수:",
    // ?�어???�세보기 모달 번역
    concept_detail_view: "개념 ?�세 보기",
    expressions_by_language: "?�어�??�현",
    close: "?�기",
    delete: "??��",
    edit: "?�집",
    confirm_delete_concept: "?�말�???개념????��?�시겠습?�까?",
    concept_deleted_success: "개념???�공?�으�???��?�었?�니??",
    concept_delete_error: "개념 ??�� �??�류가 발생?�습?�다",
    registration_time: "?�록 ?�간",
    // 개념 추�? 모달 번역
    domain: "?�메??,
    domain_placeholder: "?? daily, food, business",
    emoji: "?�모지",
    emoji_placeholder: "?? ?��, ?��, ?��",
    reset: "초기??,
    add: "추�??�기",
    add_example: "?�문 추�?",
    add_new_language: "???�어 추�?",
    language_name_ko: "?�어 ?�름 (?�국??",
    language_name_ko_placeholder: "?? ?�페?�어, ?�랑?�어",
    language_code: "?�어 코드",
    language_code_placeholder: "?? spanish, french",
    example_word: "?�시 ?�어",
    example_word_placeholder: "?? manzana, pomme",
    cancel: "취소",
    // 게임 번역
    games: "게임",
    games_desc: "?��??�는 게임???�해 ?�양???�어�?즐겁�?배워보세??",
    learning_title: "?�습",
    source_language: "?�본 ?�어",
    target_language: "?�???�어",
    learning_title_desc: "체계?�인 ?�습???�해 ?�어 ?�력???�상?�키?�요.",
    // 문법 �??�습 진도 ?�이지 번역
    grammar_progress: "문법 �??�습 진도",
    grammar_progress_title: "문법 �??�습 진도",
    grammar_progress_subtitle: "?�습 ?�과?� 문법 ?�턴 분석???�인?�세??,
    total_concepts: "�?개념 ??,
    concepts_breakdown: "카테고리�?분포",
    progress: "진도",
    progress_title: "진도",
    learning_progress: "?�습 진도",
    learning_progress_title: "?�습 진도",
    learning_progress_subtitle: "개인 ?�습 ?�과?� 진도�?추적?�고 분석?�세??,

    // ?�습 ?�이지 번역
    learning_areas: "?�습 ?�역",
    learning_dashboard: "?�습 ?�?�보??,
    continue_learning: "?�습 ?�어?�기",
    vocabulary_learning: "?�어 ?�습",
    vocabulary_learning_desc: "?�휘???�상???�한 ?�래?�카?��? ?�?�핑 ?�습",
    vocabulary_modes: "?�래?�카?????�?�핑 ??발음 ?�습",
    grammar_learning: "문법 ?�습",
    grammar_learning_desc: "체계?�인 문법 ?�턴 분석�??�습 ?�습",
    grammar_modes: "문법 ?�턴 ???�문 분석 ???�습 문제",
    reading_learning: "?�해 ?�습",
    reading_learning_desc: "?�양???�문???�한 ?�기 ?�해???�상",
    reading_modes: "?�문 ?�습 ???�래??모드",
    quiz_test: "?�즈 ?�스??,

    // ?�합 ?�습 모드 번역
    flashcard_mode: "?�래?�카??,
    flashcard_quick_desc: "카드 ?�집�??�습",
    typing_mode: "?�?�핑",
    typing_quick_desc: "직접 ?�력 ?�습",
    pronunciation_mode: "발음 ?�습",
    pronunciation_quick_desc: "?�성 ?�식 ?�습",
    pattern_analysis_mode: "?�턴 분석",
    pattern_quick_desc: "문법 구조 ?�습",
    practice_mode: "?�습 문제",
    practice_quick_desc: "문법 ?�용 ?�습",
    example_learning_mode: "?�문 ?�습",
    example_quick_desc: "문맥 ?�해 ?�습",
    flash_mode: "?�래??모드",
    flash_quick_desc: "빠른 ?�해 ?�습",

    // ?�습 ?�징 ?�명
    vocabulary_flashcard_features: "?�각???�습 ??즉시 ?�드�?,
    vocabulary_typing_features: "?�확??철자 ??기억??강화",
    vocabulary_pronunciation_features: "?�확??발음 ???�기 ?�상",
    grammar_pattern_features: "체계??분석 ??구조 ?�해",
    grammar_practice_features: "?�전 ?�습 ???�용 ?�력",
    reading_example_features: "문맥 ?�악 ???�해???�상",
    reading_flash_features: "?�독 ?�습 ??집중???�상",

    // ?�습 ?�계 �?추천
    estimated_time: "?�상 ?�간",
    recent_activity: "최근 ?�동",
    no_recent_activity: "최근 ?�습 기록???�습?�다",
    recommended_mode: "추천 ?�습",
    vocabulary_flashcard_recommended: "?�어 ?�래?�카??추천",
    learning_streak: "?�습 ?�속??,
    days: "??,

    // ?�습 모드 번역
    learning_modes: "?�습 모드",
    back_to_areas: "?�역 ?�택?�로 ?�아가�?,
    pattern_analysis: "?�턴 분석",
    pattern_analysis_desc: "문법 구조?� ?�턴??체계?�으�??�습",
    example_practice: "?�문 ?�습",
    example_practice_desc: "?�래?�카??방식?�로 문법 ?�턴 ?�습",
    general_example_learning: "?�반 ?�문 ?�습",
    general_example_learning_desc: "?�양???�문???�한 ?�해 ?�력 ?�상",
    flash_mode: "?�래??모드",
    flash_mode_desc: "빠른 ?�도�??�문???�습?�는 집중 모드",

    // ?�터 �??�정 번역
    difficulty_level: "?�이??,
    all_difficulties: "?�체 ?�이??,
    basic: "기초",
    intermediate: "중급",
    advanced: "고급",
    fluent: "?�창",
    technical: "?�문?�어",
    pattern_type: "?�턴 ?�형",
    all_patterns: "?�체 ?�턴",
    grammar_pattern: "문법 ?�턴",
    syntax_structure: "문장 구조",
    expression_pattern: "?�현 ?�턴",
    conversation_pattern: "?�화 ?�턴",
    situation: "?�황",
    all_situation: "?�체 ?�황",
    purpose: "목적",
    all_purpose: "?�체 목적",

    // ?�황 ?�그 번역
    formal: "격식",
    casual: "비격??,
    urgent: "긴급??,
    work: "직장",
    school: "?�교",
    social: "?�교",
    shopping: "?�핑",
    home: "가??,
    public: "공공?�소",
    online: "?�라??,
    medical: "?�료",

    // 목적 ?�그 번역
    greeting: "?�사",
    thanking: "감사",
    request: "?�청",
    question: "질문",
    opinion: "?�견",
    agreement: "?�의",
    refusal: "거절",
    apology: "?�과",
    instruction: "지??,
    description: "?�명",
    suggestion: "?�안",
    emotion: "감정?�현",

    learning_streak: "?�습 ?�트�?,
    learning_goals: "?�습 목표",
    quiz_performance: "?�즈 ?�과",
    game_performance: "게임 ?�과",
    language_progress: "?�어�??�습 진도",
    category_distribution: "카테고리�?분포",
    grammar: "문법 ?�턴 분석",
    recent_activity: "최근 ?�습 ?�동",
    refresh: "?�로고침",
    export: "?�보?�기",
    attempts: "?�도",
    correct: "?�답",
    games_played: "게임",
    wins: "?�리",
    loading: "로딩 �?..",
    select_category: "카테고리 ?�택",
    select_emoji: "?�모지 ?�택",
    emoji: "?�모지",

    // ?�상 ?�메??카테고리
    household: "?�활?�품",
    family: "가�?,
    routine: "?�상?�활",
    clothing: "?�류",
    furniture: "가�?,

    // ?�식 ?�메??카테고리
    fruit: "과일",
    vegetable: "채소",
    meat: "?�류",
    drink: "?�료",
    snack: "간식",

    // ?�행 ?�메??카테고리
    transportation: "교통?�단",
    accommodation: "?�박",
    tourist_attraction: "관광�?",
    luggage: "�?,
    direction: "길찾�?,

    // 비즈?�스 ?�메??카테고리
    meeting: "?�의",
    finance: "금융",
    marketing: "마�???,
    office: "?�무??,
    project: "?�로?�트",

    // ?�술 ?�메??카테고리
    science: "과학",
    literature: "문학",
    history: "??��",
    mathematics: "?�학",
    research: "?�구",

    // ?�연 ?�메??카테고리
    animal: "?�물",
    plant: "?�물",
    weather: "?�씨",
    geography: "지�?,
    environment: "?�경",

    // 기술 ?�메??카테고리
    computer: "컴퓨??,
    software: "?�프?�웨??,
    internet: "?�터??,
    mobile: "모바??,
    ai: "?�공지??,

    // 건강 ?�메??카테고리
    exercise: "?�동",
    medicine: "?�학",
    nutrition: "?�양",
    mental_health: "?�신건강",
    hospital: "병원",

    // ?�포�??�메??카테고리
    football: "축구",
    basketball: "?�구",
    swimming: "?�영",
    running: "?�리�?,
    equipment: "?�동기구",

    // ?�터?�인먼트 ?�메??카테고리
    movie: "?�화",
    music: "?�악",
    game: "게임",
    book: "?�서",
    art: "?�술",

    // My Vocabulary page translations
    my_vocabulary_title: "?�만???�어??,
    bookmarked_word_count: "북마?�한 ?�어 ??",
    word_count_unit: "�?,
    bookmark_usage: "북마???�용??,
    unlimited: "무제??,
    bookmark_words: "?�어 북마?�하�?,
    hangul: "?��?",
    meaning: "??,
    pronunciation: "발음",
    description: "?�명",
    search_placeholder: "검?�어�??�력?�세??,
    load_more: "??보기",
    no_bookmarks_title: "북마?�한 ?�어가 ?�습?�다",
    no_bookmarks_desc: "?�국???�어?�에??관?�있???�어?�을 북마?�해보세??",
    browse_words: "?�어 ?�러보기",
    bookmarked: "북마?�됨",
    no_date: "?�짜 ?�음",
    login_required: "로그?�이 ?�요?�니??",
    error_loading_bookmarks: "북마?�된 개념 로드 ?�류:",
    concept_detail_view: "개념 ?�세 보기:",
    expressions: "?�현",
    examples: "?�문",

    // ?�습 모드 카드 번역
    flashcard_learning: "?�� ?�래?�카???�습",
    typing_learning: "?�️ ?�?�핑 ?�습",
    pronunciation_practice: "?�� 발음 ?�습",
    grammar_pattern_analysis: "?�� 문법 ?�턴 분석",
    grammar_practice: "?�� 문법 ?�습 ?�습",
    reading_learning: "?�해 ?�습",

    // ?�래?�카??모드 번역
    click_to_check_meaning: "?�릭?�여 ?��? ?�인",
    click_to_see_word: "?�시 ?�릭?�여 ?�어 보기",
    back_to_dashboard: "?�?�보?�로",
    back: "?�아가�?,

    // ?�?�핑 모드 번역
    typing_answer_placeholder: "?�안???�력?�세??,
    check: "?�인",

    // 발음 ?�습 모드 번역
    pronunciation_coming_soon: "발음 ?�습 모드??준�?중입?�다.",

    // 문법 모드 번역
    click_to_see_explanation: "?�릭?�여 ?�명 보기",

    // ?�해 모드 번역
    original_text: "?�문",
    translation: "번역",
    context: "?�황",

    // 공통 버튼 번역
    home: "?�으�?,
    back_to_home: "?�으�??�아가�?,

    // ?�이???�음 메시지
    no_data: "?�이?��? ?�습?�다",
    no_data_description:
      "?�습???�이?��? ?�습?�다. 먼�? ?�이?��? ?�로?�해주세??",

    // ?�로??모달 번역
    concept_upload: "개념 ?�로??,
    grammar_pattern_upload: "문법 ?�턴 ?�로??,
    example_upload: "?�문 ?�로??,
    upload_csv_json_concept:
      "CSV ?�는 JSON ?�일???�로?�하??개념??추�??�세??",
    upload_csv_json_grammar:
      "CSV ?�는 JSON ?�일???�로?�하??문법 ?�턴??추�??�세??",
    upload_csv_json_example:
      "CSV ?�는 JSON ?�일???�로?�하???�문??추�??�세??",
    upload: "?�로??,
    download_template: "?�플�??�운로드",

    // 추천 ?�습 관??번역
    flashcard_recommended: "?�래?�카??,
    recommended: "추천",
    recommendation_reason: "최근 ?�습 ?�턴??기반?�로 추천?�니??,
  },
  en: {
    home: "Home",
    wordbook: "Wordbook",
    vocabulary: "Vocabulary",
    multilingual_dictionary: "Multilingual Dictionary",
    ai_wordbook: "AI Wordbook",
    ai_vocabulary: "AI Vocabulary",
    language_learning: commonTexts.en.language_learning,
    language_learning_desc: commonTexts.en.language_learning_desc,
    language_games: commonTexts.en.language_games,
    language_games_desc: commonTexts.en.language_games_desc,
    inquiry: "Inquiry",
    login: "Login",
    signup: "Sign Up",
    logout: "Logout",
    profile: "Profile",
    delete_account: "Delete Account",
    welcome: "Welcome",
    user_suffix: "",
    get_started_free: "Get Started Free",
    learn_languages: "Learn various languages easily and fun",
    effective_learning:
      "Make your language learning more effective with systematic curriculum and intuitive learning system.",
    wordbook_desc:
      "Enter words to learn and create your own multilingual wordbook.",
    ai_wordbook_desc:
      "Get custom word recommendations from Google Gemini AI and improve your language skills.",
    ai_vocabulary_desc:
      "Learn AI-recommended multilingual concepts and improve your language skills.",
    inquiry_desc:
      "If you have any questions or need help, please feel free to inquire.",
    start: "Start",
    language_settings: "Language Settings",
    save: "Save",
    cancel: "Cancel",
    total_concepts: "Total Concepts",
    concepts_unit: "concepts",
    ai_usage: "AI Usage",
    ai_recommend_concept: "AI Concept Recommendation",
    // Modal-related translations
    add_concept: "Add Concept",
    edit_concept: "Edit Concept",
    select_domain: "Select Domain",
    category_placeholder: "e.g.: fruit, animal",
    language_expressions: "Language Expressions",
    word: "Word",
    pronunciation: "Pronunciation",
    definition: "Definition",
    part_of_speech: "Part of Speech",
    select_pos: "Select Part of Speech",
    // Part of speech translations
    noun: "noun",
    verb: "verb",
    adjective: "adjective",
    adverb: "adverb",
    pronoun: "pronoun",
    preposition: "preposition",
    conjunction: "conjunction",
    interjection: "interjection",
    particle: "particle",
    determiner: "determiner",
    classifier: "classifier",
    other: "other",
    // Linguistic terms translations
    synonyms: "Synonyms (comma separated)",
    antonyms: "Antonyms (comma separated)",
    collocations: "Collocations (comma separated)",
    compound_words: "Compound Words (comma separated)",
    representative_example: "Representative Example",
    korean_example: "Korean Example",
    english_example: "English Example",
    japanese_example: "Japanese Example",
    chinese_example: "Chinese Example",
    tags: "Tags (comma separated)",
    // Domain translations
    academic: "Academic",
    nature: "Nature",
    technology: "Technology",
    health: "Health",
    sports: "Sports",
    entertainment: "Entertainment",
    // Domain filter translations
    domain_filter: "Area",
    all_domains: "All Areas",
    domain_daily: "Daily Life",
    domain_business: "Business",
    domain_academic: "Academic",
    domain_travel: "Travel",
    domain_food: "Food",
    domain_nature: "Nature",
    domain_technology: "Technology",
    domain_health: "Health",
    domain_sports: "Sports",
    domain_entertainment: "Entertainment",
    domain_other: "Other",
    // 로그???�이지 번역
    login_with_google: "Login with Google",
    login_with_github: "Login with Github",
    or: "or",
    email: "Email",
    email_placeholder: "Enter your email",
    password: "Password",
    password_placeholder: "Enter your password",
    auto_login: "Auto Login",
    forgot_password: "Forgot password?",
    no_account: "Don't have an account?",
    // ?�원가???�이지 번역
    create_account: "Create Account",
    name: "Name",
    name_placeholder: "Enter your name",
    confirm_password: "Confirm Password",
    confirm_password_placeholder: "Enter your password again",
    agree_terms: "I agree to the terms of service",
    already_account: "Already have an account?",
    // 문의 ?�이지 번역
    contact_us: "Contact Us",
    subject: "Subject",
    subject_placeholder: "Enter subject",
    message: "Message",
    message_placeholder: "Enter your message",
    send: "Send",
    // ?�국???�어???�이지 번역
    search: "Search",
    search_placeholder: "Enter search term...",
    source_language: "Source Language",
    target_language: "Target Language",
    category: "Category",
    all_categories: "All Categories",
    fruit: "Fruit",
    food: "Food",
    animal: "Animal",
    daily: "Daily Life",
    travel: "Travel",
    business: "Business",
    concept_count: "concepts",
    sort: "Sort",
    latest: "Latest",
    oldest: "Oldest",
    alphabetical: "A-Z",
    reverse_alphabetical: "Z-A",
    concept_usage: "Concept Usage",
    add_new_concept: "Add New Concept",
    bulk_add_concept: "Bulk Add Concepts",
    load_more: "Load More",
    korean: "Korean",
    english: "English",
    japanese: "Japanese",
    chinese: "Chinese",
    // ?�국???�습 ?�이지 번역
    language_learning_title: "Multilingual Learning",
    select_source_language: "Select Source Language",
    select_target_language: "Select Target Language",
    learning_mode: "Learning Mode",
    flashcards: "Flashcards",
    flashcards_desc: "Learn with front/back word cards",
    quiz: "Quiz",
    quiz_desc: "Test your knowledge with interactive quizzes",
    typing: "Typing",
    typing_desc: "Learn by typing answers",
    previous: "Previous",
    flip: "Flip",
    next: "Next",
    examples: "Examples:",
    card_progress: "Progress",
    quiz_question: "Question",
    next_question: "Next Question",
    quiz_progress: "Progress",
    typing_prompt: "Enter your answer:",
    typing_placeholder: "Type your answer...",
    check_answer: "Check Answer",
    next_word: "Next Word",
    typing_progress: "Progress",
    correct_count: "Correct:",
    wrong_count: "Wrong:",
    // ?�어???�세보기 모달 번역
    concept_detail_view: "Concept Detail View",
    expressions_by_language: "Expressions by Language",
    close: "Close",
    delete: "Delete",
    edit: "Edit",
    confirm_delete_concept: "Are you sure you want to delete this concept?",
    concept_deleted_success: "Concept has been successfully deleted.",
    concept_delete_error: "An error occurred while deleting the concept",
    registration_time: "Registration Time",
    // 개념 추�? 모달 번역
    domain: "Domain",
    domain_placeholder: "Ex: daily, food, business",
    emoji: "Emoji",
    emoji_placeholder: "Ex: ?��, ?��, ?��",
    reset: "Reset",
    add: "Add",
    add_example: "Add Example",
    add_new_language: "Add New Language",
    language_name_ko: "Language Name (Korean)",
    language_name_ko_placeholder: "Ex: Spanish, French",
    language_code: "Language Code",
    language_code_placeholder: "Ex: spanish, french",
    example_word: "Example Word",
    example_word_placeholder: "Ex: manzana, pomme",
    cancel: "Cancel",
    // 게임 번역
    games: "Games",
    games_desc: "Learn various languages enjoyably through fun games.",
    learning_title: "Learning",
    source_language: "Source Language",
    target_language: "Target Language",
    learning_title_desc:
      "Improve your language skills through systematic learning.",
    // 문법 �??�습 진도 ?�이지 번역
    grammar_progress: "Grammar & Learning Progress",
    grammar_progress_title: "Grammar & Learning Progress",
    grammar_progress_subtitle:
      "Track your learning achievements and grammar patterns",
    total_concepts: "Total Concepts",
    concepts_breakdown: "Category Breakdown",
    progress: "Progress",
    progress_title: "Progress",
    learning_progress: "Learning Progress",
    learning_progress_title: "Learning Progress",
    learning_progress_subtitle:
      "Track and analyze your personal learning achievements and progress",

    // ?�습 ?�이지 번역
    learning_areas: "Learning Areas",
    learning_dashboard: "Learning Dashboard",
    continue_learning: "Continue Learning",
    vocabulary_learning: "Vocabulary Learning",
    vocabulary_learning_desc:
      "Flashcards and typing practice to improve vocabulary",
    vocabulary_modes: "Flashcards ??Typing ??Pronunciation",
    grammar_learning: "Grammar Learning",
    grammar_learning_desc: "Systematic grammar pattern analysis and practice",
    grammar_modes: "Grammar Patterns ??Example Analysis ??Practice Problems",
    reading_learning: "Reading Learning",
    reading_learning_desc:
      "Improve reading comprehension through various examples",
    reading_modes: "Example Learning ??Flash Mode",
    quiz_test: "Quiz Test",

    // ?�합 ?�습 모드 번역
    flashcard_mode: "Flashcards",
    flashcard_quick_desc: "Card flipping learning",
    typing_mode: "Typing",
    typing_quick_desc: "Direct input learning",
    pronunciation_mode: "Pronunciation",
    pronunciation_quick_desc: "Voice recognition learning",
    pattern_analysis_mode: "Pattern Analysis",
    pattern_quick_desc: "Grammar structure learning",
    practice_mode: "Practice",
    practice_quick_desc: "Grammar application practice",
    example_learning_mode: "Example Learning",
    example_quick_desc: "Context understanding learning",
    flash_mode: "Flash Mode",
    flash_quick_desc: "Speed reading practice",

    // ?�습 ?�징 ?�명
    vocabulary_flashcard_features: "Visual Learning ??Instant Feedback",
    vocabulary_typing_features: "Accurate Spelling ??Memory Enhancement",
    vocabulary_pronunciation_features:
      "Accurate Pronunciation ??Listening Improvement",
    grammar_pattern_features: "Systematic Analysis ??Structure Understanding",
    grammar_practice_features: "Practical Exercise ??Application Skills",
    reading_example_features:
      "Context Comprehension ??Understanding Improvement",
    reading_flash_features: "Speed Reading ??Concentration Enhancement",

    // ?�습 ?�계 �?추천
    estimated_time: "Estimated Time",
    recent_activity: "Recent Activity",
    no_recent_activity: "No recent learning records",
    recommended_mode: "Recommended Learning",
    vocabulary_flashcard_recommended: "Vocabulary Flashcards Recommended",
    learning_streak: "Learning Streak",
    days: "days",

    // ?�습 모드 번역
    learning_modes: "Learning Modes",
    back_to_areas: "Back to Area Selection",
    pattern_analysis: "Pattern Analysis",
    pattern_analysis_desc:
      "Systematically learn grammar structures and patterns",
    example_practice: "Example Practice",
    example_practice_desc: "Practice grammar patterns with flashcard method",
    general_example_learning: "General Example Learning",
    general_example_learning_desc:
      "Improve reading skills through various examples",
    flash_mode: "Flash Mode",
    flash_mode_desc: "Intensive mode for rapid example learning",

    // ?�터 �??�정 번역
    difficulty_level: "Difficulty Level",
    all_difficulties: "All Difficulties",
    basic: "Basic",
    intermediate: "Intermediate",
    advanced: "Advanced",
    fluent: "Fluent",
    technical: "Technical",
    pattern_type: "Pattern Type",
    all_patterns: "All Patterns",
    grammar_pattern: "Grammar Pattern",
    syntax_structure: "Syntax Structure",
    expression_pattern: "Expression Pattern",
    conversation_pattern: "Conversation Pattern",
    situation: "Situation",
    all_situation: "All Situations",
    purpose: "Purpose",
    all_purpose: "All Purposes",

    // ?�황 ?�그 번역
    formal: "Formal",
    casual: "Casual",
    urgent: "Urgent",
    work: "Work",
    school: "School",
    social: "Social",
    shopping: "Shopping",
    home: "Home",
    public: "Public",
    online: "Online",
    medical: "Medical",

    // 목적 ?�그 번역
    greeting: "Greeting",
    thanking: "Thanking",
    request: "Request",
    question: "Question",
    opinion: "Opinion",
    agreement: "Agreement",
    refusal: "Refusal",
    apology: "Apology",
    instruction: "Instruction",
    description: "Description",
    suggestion: "Suggestion",
    emotion: "Emotion",
    domain_filter: "Domain",
    all_domains: "All Domains",
    domain_daily: "Daily",
    domain_business: "Business",
    domain_academic: "Academic",
    domain_travel: "Travel",
    domain_food: "Food",
    domain_nature: "Nature",
    domain_technology: "Technology",
    domain_health: "Health",
    domain_sports: "Sports",
    domain_entertainment: "Entertainment",
    domain_other: "Other",

    learning_streak: "Learning Streak",
    learning_goals: "Learning Goals",
    quiz_performance: "Quiz Performance",
    game_performance: "Game Performance",
    language_progress: "Language Progress",
    category_distribution: "Category Distribution",
    grammar: "Grammar Patterns",
    recent_activity: "Recent Activity",
    refresh: "Refresh",
    export: "Export",
    attempts: "Attempts",
    correct: "Correct",
    games_played: "Games",
    wins: "Wins",
    loading: "Loading...",
    select_category: "Select Category",
    select_emoji: "Select Emoji",
    emoji: "Emoji",

    // Daily domain categories
    household: "Household Items",
    family: "Family",
    routine: "Daily Routine",
    clothing: "Clothing",
    furniture: "Furniture",

    // Food domain categories
    fruit: "Fruit",
    vegetable: "Vegetable",
    meat: "Meat",
    drink: "Drink",
    snack: "Snack",

    // Travel domain categories
    transportation: "Transportation",
    accommodation: "Accommodation",
    tourist_attraction: "Tourist Attraction",
    luggage: "Luggage",
    direction: "Direction",

    // Business domain categories
    meeting: "Meeting",
    finance: "Finance",
    marketing: "Marketing",
    office: "Office",
    project: "Project",

    // Academic domain categories
    science: "Science",
    literature: "Literature",
    history: "History",
    mathematics: "Mathematics",
    research: "Research",

    // Nature domain categories
    animal: "Animal",
    plant: "Plant",
    weather: "Weather",
    geography: "Geography",
    environment: "Environment",

    // Technology domain categories
    computer: "Computer",
    software: "Software",
    internet: "Internet",
    mobile: "Mobile",
    ai: "AI",

    // Health domain categories
    exercise: "Exercise",
    medicine: "Medicine",
    nutrition: "Nutrition",
    mental_health: "Mental Health",
    hospital: "Hospital",

    // Sports domain categories
    football: "Football",
    basketball: "Basketball",
    swimming: "Swimming",
    running: "Running",
    equipment: "Equipment",

    // Entertainment domain categories
    movie: "Movie",
    music: "Music",
    game: "Game",
    book: "Book",
    art: "Art",

    // My Vocabulary page translations
    my_vocabulary_title: "My Vocabulary",
    bookmarked_word_count: "Bookmarked words:",
    word_count_unit: "",
    bookmark_usage: "Bookmark Usage",
    unlimited: "Unlimited",
    bookmark_words: "Bookmark Words",
    hangul: "Korean",
    meaning: "Meaning",
    pronunciation: "Pronunciation",
    description: "Description",
    search_placeholder: "Enter search term",
    load_more: "Load More",
    no_bookmarks_title: "No bookmarked words",
    no_bookmarks_desc:
      "Bookmark interesting words from the multilingual dictionary!",
    browse_words: "Browse Words",
    bookmarked: "Bookmarked",
    no_date: "No date",
    login_required: "Login required.",
    error_loading_bookmarks: "Error loading bookmarked concepts:",
    concept_detail_view: "Concept detail view:",
    expressions: "Expressions",
    examples: "Examples",

    // ?�습 모드 카드 번역
    flashcard_learning: "?�� Flashcard Learning",
    typing_learning: "?�️ Typing Learning",
    pronunciation_practice: "?�� Pronunciation Practice",
    grammar_pattern_analysis: "?�� Grammar Pattern Analysis",
    grammar_practice: "?�� Grammar Practice",
    reading_learning: "Reading Learning",

    // ?�래?�카??모드 번역
    click_to_check_meaning: "Click to check meaning",
    click_to_see_word: "Click again to see word",
    back_to_dashboard: "Back to Dashboard",
    back: "Back",

    // ?�?�핑 모드 번역
    typing_answer_placeholder: "Enter your answer",
    check: "Check",

    // 발음 ?�습 모드 번역
    pronunciation_coming_soon: "Pronunciation practice mode is coming soon.",

    // 문법 모드 번역
    click_to_see_explanation: "Click to see explanation",

    // ?�해 모드 번역
    original_text: "Original Text",
    translation: "Translation",
    context: "Context",

    // 공통 버튼 번역
    home: "Home",
    back_to_home: "Back to Home",

    // ?�이???�음 메시지
    no_data: "No Data Available",
    no_data_description: "There is no data to learn. Please upload data first.",

    // ?�로??모달 번역
    concept_upload: "Concept Upload",
    grammar_pattern_upload: "Grammar Pattern Upload",
    example_upload: "Example Upload",
    upload_csv_json_concept: "Upload CSV or JSON files to add concepts.",
    upload_csv_json_grammar:
      "Upload CSV or JSON files to add grammar patterns.",
    upload_csv_json_example: "Upload CSV or JSON files to add examples.",
    upload: "Upload",
    download_template: "Download Template",

    // 추천 ?�습 관??번역
    flashcard_recommended: "Flashcard",
    recommended: "Recommended",
    recommendation_reason: "Recommended based on recent learning patterns",
  },
  ja: {
    home: "?�ー??,
    wordbook: "?�語�?,
    vocabulary: "?�語�?,
    multilingual_dictionary: "多�?語辞??,
    ai_wordbook: "AI?�語�?,
    ai_vocabulary: "AI?�語�?,
    language_learning: commonTexts.ja.language_learning,
    language_learning_desc: commonTexts.ja.language_learning_desc,
    language_games: commonTexts.ja.language_games,
    language_games_desc: commonTexts.ja.language_games_desc,
    inquiry: "?�問?�合?�せ",
    login: "??��?�ン",
    signup: "会員?�録",
    logout: "??��?�ウ??,
    profile: "?�ロ?�ィ?�ル",
    delete_account: "?��?,
    welcome: "?�う?�そ",
    user_suffix: "?�ん",
    get_started_free: "?�料?�始?�る",
    learn_languages: "様々な言語を簡単?��??�く学び?�し?�う",
    effective_learning:
      "体系?�な?�リ??��?�ム?�直?�的?��?習シ?�テ?�で?�あ?�た??���??習を?�り?�果?�に?�ま?��?,
    wordbook_desc:
      "�?��?�る?�語?�入?�し?�、自?�だ?�の多�?語単語帳?�作?�ま?�ょ?��?,
    ai_wordbook_desc:
      "Google Gemini AI?�ら?�ス?�ム?�語??��?�す?�を?�け?�り?�語�?��?�向上さ?�ま?�ょ?��?,
    ai_vocabulary_desc:
      "AI?�推?�す?�多言語概念を学び?�語�?��?�向上さ?�ま?�ょ?��?,
    inquiry_desc:
      "質問?�あ?�場?�や?�け?�必要な?�合??��お気軽?�お?�い?�わ?�く?�さ?��?,
    start: "始め??,
    language_settings: "言語設�?,
    save: "保存",
    cancel: "??��?�セ??,
    total_concepts: "総概念数",
    concepts_unit: "??,
    ai_usage: "AI使用??,
    ai_recommend_concept: "AI概念?�薦",
    // Modal-related translations
    add_concept: "概念追加",
    edit_concept: "概念編集",
    domain: "?�メ?�ン",
    select_domain: "?�メ?�ン?�選??,
    category: "?�テ?�リ??,
    category_placeholder: "�? fruit, animal",
    emoji: "絵文�?,
    language_expressions: "言語別表現",
    word: "?�語",
    pronunciation: "?�音",
    definition: "定義",
    part_of_speech: "?�詞",
    select_pos: "?�詞?�選??,
    // Part of speech translations
    noun: "?�詞",
    verb: "?�詞",
    adjective: "形�?�?,
    adverb: "??��",
    pronoun: "代名�?,
    preposition: "?�置�?,
    conjunction: "?�続�?,
    interjection: "?�嘆�?,
    particle: "?�詞",
    determiner: "?�定�?,
    classifier: "?�類�?,
    other: "?�の�?,
    // Linguistic terms translations
    synonyms: "類義�?(?�ン?�区?�り)",
    antonyms: "?�義�?(?�ン?�区?�り)",
    collocations: "?�語 (?�ン?�区?�り)",
    compound_words: "複合�?(?�ン?�区?�り)",
    examples: "例文",
    add_example: "例文追加",
    representative_example: "代表例文",
    korean_example: "?�国語例??,
    english_example: "?�語例文",
    japanese_example: "?�本語例??,
    chinese_example: "�?��語例??,
    tags: "?�グ (?�ン?�区?�り)",
    // Domain translations
    academic: "�?��",
    nature: "?�然",
    technology: "?��?,
    health: "?�康",
    sports: "?�ポ?�ツ",
    entertainment: "?�ン?�ー?�イ?�メ?�ト",
    // Domain filter translations
    domain_filter: "?�域",
    all_domains: "?�領??,
    domain_daily: "?�常",
    domain_business: "?�ジ?�ス",
    domain_academic: "�?��",
    domain_travel: "?�行",
    domain_food: "食品",
    domain_nature: "?�然",
    domain_technology: "?��?,
    domain_health: "?�康",
    domain_sports: "?�ポ?�ツ",
    domain_entertainment: "?�ン?�ー?�イ?�メ?�ト",
    domain_other: "?�の�?,
    // 로그???�이지 번역
    login_with_google: "Google?�ロ?�イ??,
    login_with_github: "Github?�ロ?�イ??,
    or: "?�た??,
    email: "?�ー?�ア?�レ??,
    email_placeholder: "?�ー?�ア?�レ?�を?�力?�て?�だ?�い",
    password: "?�ス??��??,
    password_placeholder: "?�ス??��?�を?�力?�て?�だ?�い",
    auto_login: "?�動??��?�ン",
    forgot_password: "?�ス??��?�を?�忘?�で?�か�?,
    no_account: "?�カ?�ン?�を?�持?�で?�い?�す?�？",
    // ?�원가???�이지 번역
    create_account: "?�カ?�ン?�作??,
    name: "?�名??,
    name_placeholder: "?�名?�を?�力?�て?�だ?�い",
    confirm_password: "?�ス??��?�確�?,
    confirm_password_placeholder: "?�ス??��?�を?�入?�し?�く?�さ??,
    agree_terms: "?�用規約?�同?�し?�す",
    already_account: "?�で?�ア?�ウ?�ト?�お?�ち?�す?�？",
    // 문의 ?�이지 번역
    contact_us: "?�問?�合?�せ",
    subject: "件名",
    subject_placeholder: "件名?�入?�し?�く?�さ??,
    message: "?�ッ?�ー??,
    message_placeholder: "?�ッ?�ー?�を?�力?�て?�だ?�い",
    send: "?�信",
    // ?�국???�어???�이지 번역
    search: "検索",
    search_placeholder: "検索語を?�力...",
    source_language: "?�語",
    target_language: "対象言�?,
    category: "?�テ?�リ??,
    all_categories: "?�べ?�の?�テ?�リ??,
    fruit: "?�物",
    food: "食べ??,
    animal: "?�物",
    daily: "?�常",
    travel: "?�行",
    business: "?�ジ?�ス",
    concept_count: "??���?,
    sort: "並べ?�え",
    latest: "?�?�順",
    oldest: "?�い??,
    alphabetical: "?�い?�え?�順",
    reverse_alphabetical: "?�あ?�う?�お??,
    concept_usage: "概念使用??,
    add_new_concept: "?�し?�概念を追加",
    bulk_add_concept: "一?�概念追??,
    load_more: "?�っ?�見??,
    korean: "?�国�?,
    english: "?�語",
    japanese: "?�本�?,
    chinese: "�?���?,
    // ?�국???�습 ?�이지 번역
    language_learning_title: "多�?語�?�?,
    select_source_language: "?�語?�選??,
    select_target_language: "対象言語を?�択",
    learning_mode: "�?��?�ー??,
    flashcards: "?�ラ?�シ?�カ?�ド",
    flashcards_desc: "?�ー?�の表裏?��?�?,
    quiz: "??��??,
    quiz_desc: "多肢?�択?�題?��?�?,
    typing: "?�イ?�ン??,
    typing_desc: "?�接?�力?�て�?��",
    previous: "?�へ",
    flip: "裏返??,
    next: "次へ",
    examples: "例文:",
    card_progress: "?�捗?�況",
    quiz_question: "?�題",
    next_question: "次の?�題",
    quiz_progress: "?�捗?�況",
    typing_prompt: "答え?�入?�し?�く?�さ??",
    typing_placeholder: "答え?�入??..",
    check_answer: "答え?�わ??,
    next_word: "次の?�語",
    typing_progress: "?�捗?�況",
    correct_count: "正解??",
    wrong_count: "不�?解数:",
    // ?�어???�세보기 모달 번역
    concept_detail_view: "概念詳細表示",
    expressions_by_language: "言語別表現",
    close: "?�じ??,
    delete: "?�除",
    edit: "編集",
    confirm_delete_concept: "?�当?�こ??��念を?�除?�ま?�か�?,
    concept_deleted_success: "概念?��?常に?�除?�れ?�し?��?,
    concept_delete_error: "概念??��?�中?�エ?�ー?�発?�し?�し??,
    registration_time: "?�録?�間",
    // 개념 추�? 모달 번역
    domain: "?�メ?�ン",
    domain_placeholder: "例：daily, food, business",
    emoji: "絵文�?,
    emoji_placeholder: "例：?��, ?��, ?��",
    reset: "?�セ?�ト",
    add: "追加",
    add_example: "例文?�追??,
    add_new_language: "?�し?��?語を追加",
    language_name_ko: "言語名（韓?�語�?,
    language_name_ko_placeholder: "例：?�ペ?�ン語、フ?�ン?�語",
    language_code: "言語コ?�ド",
    language_code_placeholder: "例：spanish, french",
    example_word: "例の?�語",
    example_word_placeholder: "例：manzana, pomme",
    cancel: "??��?�セ??,
    // 게임 번역
    games: "?�ー??,
    games_desc: "楽し?�ゲ?�ム?�通し??��?�な言語を楽し?��??�ま?�ょ?��?,
    learning_title: "�?��",
    source_language: "?��?�?,
    target_language: "対象言�?,
    learning_title_desc: "体系?�な�?��?�通し??���?��?�向上さ?�ま?�ょ?��?,
    // 문법 �??�습 진도 ?�이지 번역
    grammar_progress: "?�法?��?習進捗",
    grammar_progress_title: "?�法?��?習進捗",
    grammar_progress_subtitle: "�?��?�果?�文法パ?�ー?�を確認?�る",
    total_concepts: "総概念数",
    concepts_breakdown: "?�テ?�リ?�分�?,
    progress: "?�度",
    progress_title: "?�度",
    learning_progress: "�?��?�度",
    learning_progress_title: "�?��?�度",
    learning_progress_subtitle: "?�人�?��?�果?�進度?�追跡し?�分?�す??,

    // �?��?�ー?�翻�?    learning_areas: "�?��?�域",
    learning_dashboard: "�?��?�?�シ?�ボ?�ド",
    continue_learning: "�?��?�続?�る",
    vocabulary_learning: "?�語�?��",
    vocabulary_learning_desc:
      "語彙?�向上の?�め??��?�ッ?�ュ?�ー?�と?�イ?�ン?��?�?,
    vocabulary_modes: "?�ラ?�シ?�カ?�ド ???�イ?�ン?????�音練習",
    grammar_learning: "?�法�?��",
    grammar_learning_desc: "体系?�な?�法?�タ?�ン?�析?�実習�?�?,
    grammar_modes: "?�法?�タ?�ン ??例文?�析 ??実習?�題",
    reading_learning: "�?���?��",
    reading_learning_desc: "様々な例文?�通し?�読解力?�上",
    reading_modes: "例文�?�� ???�ラ?�シ?�モ?�ド",
    quiz_test: "??��?�テ?�ト",

    // 統合�?��?�ー?�翻�?    flashcard_mode: "?�ラ?�シ?�カ?�ド",
    flashcard_quick_desc: "?�ー?�反転�?�?,
    typing_mode: "?�イ?�ン??,
    typing_quick_desc: "?�接?�力�?��",
    pronunciation_mode: "?�音練習",
    pronunciation_quick_desc: "?�声認識�?��",
    pattern_analysis_mode: "?�タ?�ン?�析",
    pattern_quick_desc: "?�法構造�?�?,
    practice_mode: "実習?�題",
    practice_quick_desc: "?�法応用練習",
    example_learning_mode: "例文�?��",
    example_quick_desc: "?�脈?�解�?��",
    flash_mode: "?�ラ?�シ?�モ?�ド",
    flash_quick_desc: "?�読練習",

    // �?��?�徴説明
    vocabulary_flashcard_features: "視覚?��?�????�時?�ィ?�ド?�ッ??,
    vocabulary_typing_features: "正確?�ス?�ル ??記憶?�強??,
    vocabulary_pronunciation_features: "正確?�発?????�ス?�ン?�向�?,
    grammar_pattern_features: "体系?�分????構造理�?,
    grammar_practice_features: "実践練習 ??応用?�力",
    reading_example_features: "?�脈?�握 ???�解?�向�?,
    reading_flash_features: "?�読練習 ???�中?�向�?,

    // �?��統計?�推�?    estimated_time: "予想?�間",
    recent_activity: "?�近の活動",
    no_recent_activity: "?�近の�?��記録?�あ?�ま?�ん",
    recommended_mode: "?�奨�?��",
    vocabulary_flashcard_recommended: "?�語?�ラ?�シ?�カ?�ド?�奨",
    learning_streak: "�?��?�続??,
    days: "??,

    // �?��?�ー?�翻�?    learning_modes: "�?��?�ー??,
    back_to_areas: "?�域?�択?�戻??,
    pattern_analysis: "?�タ?�ン?�析",
    pattern_analysis_desc: "?�法構造と?�タ?�ン?�体系的?��?�?,
    example_practice: "例文実習",
    example_practice_desc: "?�ラ?�シ?�カ?�ド?�式?�文法パ?�ー?�練�?,
    general_example_learning: "一?�例?��?�?,
    general_example_learning_desc: "様々な例文?�通し?�読解能?�向�?,
    flash_mode: "?�ラ?�シ?�モ?�ド",
    flash_mode_desc: "高速で例文?��?習す?�集�?��?�ド",

    // ?�ィ?�タ?�と�?��翻訳
    difficulty_level: "?�易�?,
    all_difficulties: "?�難?�度",
    basic: "?�礎",
    intermediate: "�?��",
    advanced: "上級",
    fluent: "流暢",
    technical: "専�??�語",
    pattern_type: "?�タ?�ン?�イ??,
    all_patterns: "?�パ?�ー??,
    grammar_pattern: "?�法?�タ?�ン",
    syntax_structure: "?�章構�?,
    expression_pattern: "表現?�タ?�ン",
    conversation_pattern: "会話?�タ?�ン",
    situation: "?�況",
    all_situation: "?�状�?,
    purpose: "??��",
    all_purpose: "?�目??,

    // ?�황 ?�그 번역
    formal: "?�ォ?�マ??,
    casual: "?�ジ?�ア??,
    urgent: "緊�?,
    work: "?�場",
    school: "�?��",
    social: "社交",
    shopping: "?�ョ?�ピ?�グ",
    home: "家庭",
    public: "?�共?��?",
    online: "?�ン?�イ??,
    medical: "?�療",

    // 목적 ?�그 번역
    greeting: "?�拶",
    thanking: "?�謝",
    request: "依頼",
    question: "質問",
    opinion: "?�見",
    agreement: "?�意",
    refusal: "?�否",
    apology: "謝罪",
    instruction: "?�示",
    description: "説明",
    suggestion: "?�案",
    emotion: "?�情表現",
    domain_filter: "?�メ?�ン",
    all_domains: "?�ド?�イ??,
    domain_daily: "?�常",
    domain_business: "?�ジ?�ス",
    domain_academic: "�?��",
    domain_travel: "?�行",
    domain_food: "食べ??,
    domain_nature: "?�然",
    domain_technology: "?��?,
    domain_health: "?�康",
    domain_sports: "?�ポ?�ツ",
    domain_entertainment: "?�ン?�ー?�イ?�メ?�ト",
    domain_other: "?�の�?,

    // ?�래?�카??모드 번역
    back_to_dashboard: "?�?�シ?�ボ?�ド?�戻??,
    back: "?�る",

    // 추천 ?�습 관??번역
    flashcard_recommended: "?�ラ?�シ?�カ?�ド",
    recommended: "?�奨",
    recommendation_reason: "?�近の�?��?�タ?�ン?�基?�い??��奨さ?�ま??,
  },
  zh: {
    home: "首页",
    wordbook: "词汇??,
    vocabulary: "词汇",
    multilingual_dictionary: "多�?言词典",
    ai_wordbook: "AI词汇??,
    ai_vocabulary: "AI词汇",
    language_learning: commonTexts.zh.language_learning,
    language_learning_desc: commonTexts.zh.language_learning_desc,
    language_games: commonTexts.zh.language_games,
    language_games_desc: commonTexts.zh.language_games_desc,
    inquiry: "?��?",
    login: "?�录",
    signup: "注册",
    logout: "?�出",
    profile: "个人资料",
    delete_account: "?�除�?��",
    welcome: "�?��",
    user_suffix: "",
    get_started_free: "?�费开�?,
    learn_languages: "轻松?�趣?��?习各种�?言",
    effective_learning:
      "?�过系统?��?程和?�观学习系统，�??�的�??学习?�加高效??,
    wordbook_desc: "输入要�?习的?�词，创建您?�己?�多�??词汇?��?,
    ai_wordbook_desc:
      "?�过Google Gemini AI?�得定制?�词?�荐，提高您?��?言?�?��?,
    ai_vocabulary_desc: "学习AI?�荐?�多�??概念，提高您?��?言?�?��?,
    inquiry_desc: "如果?�有任何??��?��?要帮?�，请随?�咨询�?,
    start: "开�?,
    language_settings: "�??设置",
    save: "保存",
    cancel: "?�消",
    total_concepts: "?�概念数",
    concepts_unit: "�?,
    ai_usage: "AI使用??,
    ai_recommend_concept: "AI概念?�荐",
    // 模态框?�关翻译
    add_concept: "添加概念",
    edit_concept: "编辑概念",
    domain: "领域",
    select_domain: "?�择领域",
    category: "类别",
    category_placeholder: "例如：fruit, animal",
    emoji: "表情�?��",
    language_expressions: "�??表达",
    word: "?�词",
    pronunciation: "?�音",
    definition: "定义",
    part_of_speech: "词�?,
    select_pos: "?�择词�?,
    // 词性翻�?    noun: "?�词",
    verb: "?�词",
    adjective: "形�?�?,
    adverb: "??��",
    pronoun: "代词",
    preposition: "介词",
    conjunction: "连词",
    interjection: "?�叹�?,
    particle: "?�词",
    determiner: "?�定�?,
    classifier: "?�词",
    other: "?�他",
    // �??�?���?���?    synonyms: "?�义词（?�号?�隔�?,
    antonyms: "?�义词（?�号?�隔�?,
    collocations: "??��（逗号?�隔�?,
    compound_words: "复合词（?�号?�隔�?,
    examples: "例句",
    add_example: "添加例句",
    representative_example: "代表例句",
    korean_example: "?��?例句",
    english_example: "?��?例句",
    japanese_example: "?��?例句",
    chinese_example: "�?��例句",
    tags: "?��?（逗号?�隔�?,
    // 领域翻译
    academic: "�?��",
    technology: "?�??,
    health: "?�康",
    sports: "体育",
    entertainment: "娱乐",
    // 领域过滤?�翻�?    domain_filter: "领域",
    all_domains: "?�部领域",
    domain_daily: "?�常",
    domain_business: "?�务",
    domain_academic: "�?��",
    domain_travel: "?�行",
    domain_food: "食物",
    domain_nature: "?�然",
    domain_technology: "?�??,
    domain_health: "?�康",
    domain_sports: "体育",
    domain_entertainment: "娱乐",
    domain_other: "?�他",
    // ?�录页面翻译
    login_with_google: "使用Google?�录",
    login_with_github: "使用Github?�录",
    or: "?��?,
    email: "?�子??��",
    email_placeholder: "请输?�您?�电子邮�?,
    password: "密码",
    password_placeholder: "请输?�您?�密??,
    auto_login: "?�动?�录",
    forgot_password: "忘�?密码�?,
    no_account: "没有�?���?,
    // ?�원가???�이지 번역
    create_account: "?�建�?��",
    name: "姓名",
    name_placeholder: "请输?�您?�姓??,
    confirm_password: "�??密码",
    confirm_password_placeholder: "请再次输?�密??,
    agree_terms: "?�同?�服?�条�?,
    already_account: "已有�?���?,
    // 문의 ?�이지 번역
    contact_us: "?�系?�们",
    subject: "主题",
    subject_placeholder: "请输?�主�?,
    message: "信息",
    message_placeholder: "请输?�您?�信??,
    send: "?��?,
    // ?�국???�어???�이지 번역
    search: "?�索",
    search_placeholder: "输入?�索�?..",
    source_language: "源�?言",
    target_language: "??���??",
    category: "类别",
    all_categories: "?�?�类??,
    fruit: "水果",
    food: "食物",
    animal: "?�物",
    daily: "?�常",
    travel: "?�行",
    business: "?�务",
    concept_count: "个概�?,
    sort: "?�序",
    latest: "?�??,
    oldest: "?�??,
    alphabetical: "字母顺序",
    reverse_alphabetical: "?�字母顺�?,
    concept_usage: "概念使用??,
    add_new_concept: "添加?�概�?,
    bulk_add_concept: "?�量添加概念",
    load_more: "?�载?�多",
    korean: "?��?",
    english: "?��?",
    japanese: "?��?",
    chinese: "�?��",
    // ?�국???�습 ?�이지 번역
    language_learning_title: "多�?言学习",
    select_source_language: "?�择源�?言",
    select_target_language: "?�择??���??",
    learning_mode: "学习模式",
    flashcards: "?�卡",
    flashcards_desc: "?�过?�词正反?��?�?,
    quiz: "测验",
    quiz_desc: "?�过?�择题�?�?,
    typing: "?�字",
    typing_desc: "?�过?�接输入学习",
    previous: "上�?�?,
    flip: "翻转",
    next: "下�?�?,
    examples: "例句:",
    card_progress: "进度",
    quiz_question: "??��",
    next_question: "下�?�?,
    quiz_progress: "进度",
    typing_prompt: "请输?�答�?",
    typing_placeholder: "输入答案...",
    check_answer: "检?�答�?,
    next_word: "下�?个单�?,
    typing_progress: "进度",
    correct_count: "正确??",
    wrong_count: "?��???",
    // ?�어???�세보기 모달 번역
    concept_detail_view: "概念�?��?�看",
    expressions_by_language: "?��?言表达",
    close: "?�闭",
    delete: "?�除",
    edit: "编辑",
    confirm_delete_concept: "?�确定要?�除这个概念?�？",
    concept_deleted_success: "概念已成?�删?��?,
    concept_delete_error: "?�除概念?�发?�错�?,
    registration_time: "注册?�间",
    // 개념 추�? 모달 번역
    domain: "领域",
    domain_placeholder: "例如：daily, food, business",
    emoji: "表情�?��",
    emoji_placeholder: "例如：�? ?��, ?��",
    reset: "?�置",
    add: "添加",
    add_example: "添加例句",
    add_new_language: "添加?��?言",
    language_name_ko: "�???�称（韩�?��",
    language_name_ko_placeholder: "例如：�???���?��法�?",
    language_code: "�??代码",
    language_code_placeholder: "例如：spanish, french",
    example_word: "示例?�词",
    example_word_placeholder: "例如：manzana, pomme",
    cancel: "?�消",
    // 게임 번역
    games: "游戏",
    games_desc: "?�过?�趣?�游?�愉快地学习?�种�????,
    learning_title: "学习",
    source_language: "源�?言",
    target_language: "??���??",
    learning_title_desc: "?�过系统?��?习提高您?��?言?�?��?,
    // 문법 �??�습 진도 ?�이지 번역
    grammar_progress: "�?��?��?习进�?,
    grammar_progress_title: "�?��?��?习进�?,
    grammar_progress_subtitle: "?�看学习?�果?��?法模式分??,
    total_concepts: "?�概念数",
    concepts_breakdown: "类别?�布",
    progress: "进度",
    progress_title: "进度",
    learning_progress: "学习进度",
    learning_progress_title: "学习进度",
    learning_progress_subtitle: "跟踪个人学习?�果?�进�?,

    // 学习页面翻译
    learning_areas: "学习领域",
    learning_dashboard: "学习仪表??,
    continue_learning: "继续学习",
    vocabulary_learning: "词汇学习",
    vocabulary_learning_desc: "?�过?�卡?�打字练习提高词汇量",
    vocabulary_modes: "?�卡 ???�字 ???�音练习",
    grammar_learning: "�?��学习",
    grammar_learning_desc: "系统?��?法模式分?�和实践学习",
    grammar_modes: "�?��模式 ??例句?�析 ??练习�?,
    reading_learning: "?��?学习",
    reading_learning_desc: "?�过?�种例句?�高?��??�解?�力",
    reading_modes: "例句学习 ???�卡模式",
    quiz_test: "测验测试",

    // 统合学习模式翻译
    flashcard_mode: "?�卡",
    flashcard_quick_desc: "?�片翻转学习",
    typing_mode: "?�字",
    typing_quick_desc: "?�接输入学习",
    pronunciation_mode: "?�音练习",
    pronunciation_quick_desc: "�?��识别学习",
    pattern_analysis_mode: "模式?�析",
    pattern_quick_desc: "�?��结构学习",
    practice_mode: "练习�?,
    practice_quick_desc: "�?��应用练习",
    example_learning_mode: "例句学习",
    example_quick_desc: "�?��?�解学习",
    flash_mode: "?�卡模式",
    flash_quick_desc: "快速阅读练�?,

    // 学习?�征说明
    vocabulary_flashcard_features: "视觉学习 ???�时?�馈",
    vocabulary_typing_features: "?�确?�写 ??记忆增强",
    vocabulary_pronunciation_features: "?�确?�音 ???�力?�升",
    grammar_pattern_features: "系统?�析 ??结构?�解",
    grammar_practice_features: "实战练习 ??应用?�力",
    reading_example_features: "�?��?�解 ???�解?�提??,
    reading_flash_features: "?��?练习 ??专注?�提??,

    // 学习统�??�推??    estimated_time: "预�??�间",
    recent_activity: "?�近活??,
    no_recent_activity: "没有?�近的学习记录",
    recommended_mode: "?�荐学习",
    vocabulary_flashcard_recommended: "?�荐词汇?�卡",
    learning_streak: "学习连续天数",
    days: "�?,

    // 学习模式翻译
    learning_modes: "学习模式",
    back_to_areas: "返回领域?�择",
    pattern_analysis: "模式?�析",
    pattern_analysis_desc: "系统学习�?��结构?�模�?,
    example_practice: "例句练习",
    example_practice_desc: "?�过?�卡?�式练习�?��模式",
    general_example_learning: "一?�例?��?�?,
    general_example_learning_desc: "?�过?�种例句?�高?��??�力",
    flash_mode: "?�卡模式",
    flash_mode_desc: "快速�?习例?�的?�中模式",

    // 过滤?�和设置翻译
    difficulty_level: "?�度等级",
    all_difficulties: "?�部?�度",
    basic: "?��?",
    intermediate: "�?��",
    advanced: "高级",
    fluent: "流利",
    technical: "专业???",
    pattern_type: "模式类型",
    all_patterns: "?�部模式",
    grammar_pattern: "�?��模式",
    syntax_structure: "?�法结构",
    expression_pattern: "表达模式",
    conversation_pattern: "对话模式",
    situation: "?�境",
    all_situation: "?�部?�境",
    purpose: "??��",
    all_purpose: "?�部??��",

    // ?�황 ?�그 번역
    formal: "正式",
    casual: "?��?�?,
    polite: "礼貌",
    urgent: "紧�?,
    work: "工作",
    school: "�?��",
    social: "社交",
    shopping: "�?��",
    home: "家庭",
    public: "?�共?��?",
    online: "?�线",
    medical: "?�疗",

    // 목적 ?�그 번역
    greeting: "??�?,
    thanking: "?�谢",
    request: "请求",
    question: "?�问",
    opinion: "?�见",
    agreement: "?�意",
    refusal: "?�绝",
    apology: "?�歉",
    instruction: "?�示",
    description: "?�述",
    suggestion: "建�?",
    emotion: "?�感表达",
    domain_filter: "领域",
    all_domains: "?�部领域",
    domain_daily: "?�常",
    domain_business: "?�务",
    domain_academic: "�?��",
    domain_travel: "?�行",
    domain_food: "食物",
    domain_nature: "?�然",
    domain_technology: "?�??,
    domain_health: "?�康",
    domain_sports: "体育",
    domain_entertainment: "娱乐",
    domain_other: "?�他",

    // 学习模式?�片翻译
    vocabulary_learning_modes: "词汇学习模式",
    vocabulary_data_upload: "词汇?�据上传",
    flashcard_mode: "?�卡",
    flashcard_mode_desc: "?�过翻转?�片学习?�词?�含�?,
    typing_mode: "?�字",
    typing_mode_desc: "?�过?�写?�准�?��字练习拼??,
    pronunciation_mode: "?�音练习",
    pronunciation_mode_desc: "?�过�?��识别�?��?�确?�音",

    // 学习模式翻译
    flashcard_learning: "?�� ?�卡学习",
    typing_learning: "?�️ ?�字学习",
    pronunciation_practice: "?�� ?�音练习",
    grammar_pattern_analysis: "?�� �?��模式?�析",
    grammar_practice: "?�� �?��练习",
    reading_learning: "?��?学习",

    // ?�卡模式翻译
    click_to_check_meaning: "?�击?�看?�义",
    click_to_see_word: "?�次?�击?�看?�词",
    back_to_dashboard: "返回仪表??,
    back: "返回",

    // ?�字模式翻译
    typing_answer_placeholder: "请输?�答�?,
    check: "检??,

    // ?�音练习模式翻译
    pronunciation_coming_soon: "?�音练习模式?�将?�出??,

    // �?��模式翻译
    click_to_see_explanation: "?�击?�看解释",

    // ?��?模式翻译
    original_text: "?�文",
    translation: "翻译",
    context: "�?��",

    // ?�共?�钮翻译
    home: "首页",
    back_to_home: "返回首页",

    // ?�数??��??    no_data: "没有?�据",
    no_data_description: "没有学习?�据?��??�上传数??�?,

    // 上传模态框翻译
    concept_upload: "概念上传",
    grammar_pattern_upload: "�?��模式上传",
    example_upload: "例句上传",
    upload_csv_json_concept: "上传CSV?�JSON?�件以添?�概念�?,
    upload_csv_json_grammar: "上传CSV?�JSON?�件以添?��?法模式�?,
    upload_csv_json_example: "上传CSV?�JSON?�件以添?�例?��?,
    upload: "上传",
    download_template: "下载模板",

    // 추천 ?�습 관??번역
    flashcard_recommended: "?�卡",
    recommended: "?�荐",
    recommendation_reason: "?�于?�近�?习模式推??,
  },
};

// ?�역 번역 객체�??�정
if (typeof window !== "undefined") {
  window.translations = translations;
}

// ?�어 캐싱???�한 변??let cachedLanguage = null;
let languageDetectionInProgress = false;

// 브라?��? 기본 ?�어 감�?
function detectBrowserLanguage() {
  const language = navigator.language || navigator.userLanguage;
  const shortLang = language.split("-")[0]; // ko-KR, en-US ?�에??�??�어 코드�?추출

  // 지?�되???�어?��? ?�인
  return SUPPORTED_LANGUAGES[shortLang] ? shortLang : "en"; // 지?�되지 ?�으�??�어가 기본
}

// ?�용?�의 ?�치 ?�보�??�어 추측
async function detectLanguageFromLocation() {
  try {
    // IP 기반 ?�치 ?�보 API ?�용
    const response = await fetch("https://ipapi.co/json/");
    const data = await response.json();

    // �?? 코드???�른 ?�어 매핑 (간단???�시)
    const countryToLang = {
      KR: "ko",
      JP: "ja",
      CN: "zh",
      TW: "zh",
      HK: "zh",
    };

    return countryToLang[data.country] || detectBrowserLanguage();
  } catch (error) {
    console.error("?�치 기반 ?�어 감�? ?�패:", error);
    return detectBrowserLanguage();
  }
}

// ?�재 ?�용 ?�어 가?�오�?function getCurrentLanguage() {
  return localStorage.getItem("userLanguage") || "auto";
}

// ?�재 ?�성?�된 ?�어 코드 가?�오�?(캐싱 �?중복 ?�출 방�?)
async function getActiveLanguage() {
  // ?��? 감�? 중이�??��?  if (languageDetectionInProgress) {
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (!languageDetectionInProgress && cachedLanguage) {
          clearInterval(checkInterval);
          resolve(cachedLanguage);
        }
      }, 100);
    });
  }

  // 캐시???�어가 ?�으�?반환
  if (cachedLanguage) {
    console.log("캐시???�어 ?�용:", cachedLanguage);
    return cachedLanguage;
  }

  languageDetectionInProgress = true;

  try {
    // 1. 먼�? localStorage?�서 ?�용?��? 직접 ?�정???�어 ?�인
    const savedLang = localStorage.getItem("userLanguage");

    if (savedLang && savedLang !== "auto" && SUPPORTED_LANGUAGES[savedLang]) {
      console.log("?�?�된 ?�어 ?�용:", savedLang);
      cachedLanguage = savedLang;
      localStorage.setItem("preferredLanguage", savedLang); // ?�메??카테고리-?�모지???�어 ?�정???�기??      return savedLang;
    }

    // 2. ?�동 ?�정?�거???�?�된 ?�어가 ?�는 경우
    console.log("?�동 ?�어 감�? ?�도...");

    // 먼�? 브라?��? ?�어 ?�도
    const browserLang = detectBrowserLanguage();
    if (SUPPORTED_LANGUAGES[browserLang]) {
      console.log("브라?��? ?�어 ?�용:", browserLang);
      cachedLanguage = browserLang;
      localStorage.setItem("preferredLanguage", browserLang); // ?�메??카테고리-?�모지???�어 ?�정???�기??      return browserLang;
    }

    // 브라?��? ?�어가 지?�되지 ?�으�??�치 기반 감�?
    try {
      const locationLang = await detectLanguageFromLocation();
      console.log("?�치 기반 ?�어 ?�용:", locationLang);
      cachedLanguage = locationLang;
      localStorage.setItem("preferredLanguage", locationLang); // ?�메??카테고리-?�모지???�어 ?�정???�기??      return locationLang;
    } catch (error) {
      console.error("?�치 기반 ?�어 감�? ?�패, 기본 ?�어 ?�용");
      cachedLanguage = "ko"; // 최종 기본�? ?�국??      localStorage.setItem("preferredLanguage", "ko"); // ?�메??카테고리-?�모지???�어 ?�정???�기??      return "ko";
    }
  } finally {
    languageDetectionInProgress = false;
  }
}

// ?�어 ?�정 ?�??�??�용
function setLanguage(langCode) {
  console.log("?�어 ?�정 변�?", langCode);

  if (langCode === "auto") {
    localStorage.removeItem("userLanguage");
    localStorage.removeItem("preferredLanguage"); // ?�메??카테고리-?�모지???�어 ?�정???�거
    cachedLanguage = null; // 캐시 초기??  } else {
    localStorage.setItem("userLanguage", langCode);
    localStorage.setItem("preferredLanguage", langCode); // ?�메??카테고리-?�모지???�어 ?�정???�??    cachedLanguage = langCode; // 캐시 ?�데?�트
  }

  // ?�어 ?�용 �?메�??�이???�데?�트
  applyLanguage();

  // ?�재 ?�이지 ?�형 감�??�여 ?�절??메�??�이???�데?�트
  const currentPath = window.location.pathname.toLowerCase();
  let pageType = "home";

  if (
    currentPath.includes("multilingual-dictionary") ||
    currentPath.includes("dictionary")
  ) {
    pageType = "dictionary";
  } else if (
    currentPath.includes("language-learning") ||
    currentPath.includes("learning")
  ) {
    pageType = "learning";
  } else if (
    currentPath.includes("language-games") ||
    currentPath.includes("games")
  ) {
    pageType = "games";
  } else if (
    currentPath.includes("ai-vocabulary") ||
    currentPath.includes("ai")
  ) {
    pageType = "ai-vocabulary";
  }

  updateMetadata(pageType);
}

// ?�어 변�??�용 (무한루프 방�?)
async function applyLanguage() {
  try {
    const langCode = await getActiveLanguage();

    if (!translations[langCode]) {
      console.error(`번역 ?�이?��? ?�는 ?�어?�니?? ${langCode}`);
      return;
    }

    // ?�반 ?�스???�소 번역 (option ?�그 ?�함)
    document.querySelectorAll("[data-i18n]").forEach((element) => {
      const key = element.getAttribute("data-i18n");
      if (translations[langCode][key]) {
        element.textContent = translations[langCode][key];
      }
    });

    // placeholder ?�성???�는 ?�력 ?�드???�??번역 ?�용
    document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
      const key = element.getAttribute("data-i18n-placeholder");
      if (translations[langCode][key]) {
        element.placeholder = translations[langCode][key];
      }
    });

    // HTML lang ?�성 변�?    document.documentElement.lang = langCode;

    // ?�메??카테고리-?�모지 ?�션 ?�데?�트 (?�는 경우�?
    if (typeof window.updateDomainCategoryEmojiLanguage === "function") {
      window.updateDomainCategoryEmojiLanguage();
    }

    // ?�습 ?�이지???�터 ?�션 ?�데?�트 (?�는 경우�?
    if (typeof window.updateFilterOptionsLanguage === "function") {
      window.updateFilterOptionsLanguage();
    }

    // ?�벤??발생 - ?�어 변경을 ?�림
    document.dispatchEvent(
      new CustomEvent("languageChanged", { detail: { language: langCode } })
    );
  } catch (error) {
    console.error("?�어 ?�용 �??�류:", error);
  }
}

// ?�어 ?�정 모달 ?�시
function showLanguageSettingsModal() {
  if (document.getElementById("language-settings-modal")) {
    document
      .getElementById("language-settings-modal")
      .classList.remove("hidden");
    return;
  }

  const currentLang = getCurrentLanguage();

  const modalHTML = `
    <div id="language-settings-modal" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-md w-full">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-bold" data-i18n="language_settings">?�어 ?�정</h3>
          <button id="close-language-modal" class="text-gray-500 hover:text-gray-700">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="mb-4">
          <div class="space-y-2">
            <div class="flex items-center">
              <input type="radio" id="lang-auto" name="language" value="auto" class="mr-2" ${
                currentLang === "auto" ? "checked" : ""
              }>
              <label for="lang-auto">?�동 감�? (Auto Detect)</label>
            </div>
            ${Object.values(SUPPORTED_LANGUAGES)
              .map(
                (lang) =>
                  `<div class="flex items-center">
                <input type="radio" id="lang-${
                  lang.code
                }" name="language" value="${lang.code}" class="mr-2" ${
                    currentLang === lang.code ? "checked" : ""
                  }>
                <label for="lang-${lang.code}">${lang.name}</label>
              </div>`
              )
              .join("")}
          </div>
        </div>
        <div class="flex justify-end">
          <button id="save-language" class="bg-[#4B63AC] text-white px-4 py-2 rounded hover:bg-[#3A4F8B]" data-i18n="save">?�??/button>
        </div>
      </div>
    </div>
  `;

  // 모달 추�?
  const modalContainer = document.createElement("div");
  modalContainer.innerHTML = modalHTML;
  document.body.appendChild(modalContainer.firstElementChild);

  // ?�벤???�들??  document
    .getElementById("close-language-modal")
    .addEventListener("click", () => {
      document
        .getElementById("language-settings-modal")
        .classList.add("hidden");
    });

  document.getElementById("save-language").addEventListener("click", () => {
    const selectedLang = document.querySelector(
      'input[name="language"]:checked'
    ).value;

    console.log("?�어 ?�정 ?�??", selectedLang);

    // ?�어 ?�정 ?�??�??�용
    setLanguage(selectedLang);

    // 모달 ?�기
    document.getElementById("language-settings-modal").classList.add("hidden");

    // ?�공 메시지 (?�택?�항)
    console.log("?�어 ?�정???�?�되?�습?�다:", selectedLang);
  });
}

// 메�??�이???�데?�트 ?�수 (캐시???�어 ?�용)
async function updateMetadata(pageType = "home") {
  try {
    // 캐시???�어�?먼�? ?�인, ?�으�?감�?
    let langCode = cachedLanguage;
    if (!langCode) {
      langCode = await getActiveLanguage();
    }

    if (!seoMetadata[pageType] || !seoMetadata[pageType][langCode]) {
      console.error(`메�??�이?��? ?�습?�다: ${pageType}, ${langCode}`);
      return;
    }

    const metadata = seoMetadata[pageType][langCode];

    // ?�?��? ?�데?�트
    document.title = metadata.title;

    // 메�? ?�그 ?�데?�트 ?�는 ?�성
    updateOrCreateMetaTag("description", metadata.description);
    updateOrCreateMetaTag("keywords", metadata.keywords);

    // Open Graph 메�? ?�그
    updateOrCreateMetaTag("og:title", metadata.title, "property");
    updateOrCreateMetaTag("og:description", metadata.description, "property");
    updateOrCreateMetaTag("og:locale", langCode, "property");

    // ?��??�어 링크 ?�데?�트
    updateAlternateLanguageLinks(pageType, langCode);

    // ?��? 링크(canonical) ?�데?�트
    updateOrCreateLinkTag("canonical", metadata.canonical);

    // hreflang ?�그 ?�데?�트
    updateHreflangTags(pageType, langCode);
  } catch (error) {
    console.error("메�??�이???�데?�트 �??�류 발생:", error);
  }
}

// 메�? ?�그 ?�데?�트 ?�는 ?�성 ?�퍼 ?�수
function updateOrCreateMetaTag(name, content, attribute = "name") {
  let metaTag = document.querySelector(`meta[${attribute}="${name}"]`);

  if (metaTag) {
    metaTag.setAttribute("content", content);
  } else {
    metaTag = document.createElement("meta");
    metaTag.setAttribute(attribute, name);
    metaTag.setAttribute("content", content);
    document.head.appendChild(metaTag);
  }
}

// 링크 ?�그 ?�데?�트 ?�는 ?�성 ?�퍼 ?�수
function updateOrCreateLinkTag(rel, href) {
  let linkTag = document.querySelector(`link[rel="${rel}"]`);

  if (linkTag) {
    linkTag.setAttribute("href", href);
  } else {
    linkTag = document.createElement("link");
    linkTag.setAttribute("rel", rel);
    linkTag.setAttribute("href", href);
    document.head.appendChild(linkTag);
  }
}

// hreflang ?�그 ?�데?�트 ?�수
function updateHreflangTags(pageType, currentLangCode) {
  // 기존 hreflang ?�그 모두 ?�거
  document
    .querySelectorAll('link[rel="alternate"][hreflang]')
    .forEach((tag) => tag.remove());

  // �?지???�어???�??hreflang ?�그 추�?
  Object.keys(SUPPORTED_LANGUAGES).forEach((langCode) => {
    const href = seoMetadata[pageType][langCode].canonical;

    const linkTag = document.createElement("link");
    linkTag.setAttribute("rel", "alternate");
    linkTag.setAttribute("hreflang", langCode);
    linkTag.setAttribute("href", href);
    document.head.appendChild(linkTag);
  });

  // x-default hreflang ?�그 추�? (기본?�으�??�어 버전?�로 ?�정)
  const defaultHref = seoMetadata[pageType]["en"].canonical;
  const defaultLinkTag = document.createElement("link");
  defaultLinkTag.setAttribute("rel", "alternate");
  defaultLinkTag.setAttribute("hreflang", "x-default");
  defaultLinkTag.setAttribute("href", defaultHref);
  document.head.appendChild(defaultLinkTag);
}

// ?��??�어 링크 ?�데?�트 ?�수
function updateAlternateLanguageLinks(pageType, currentLangCode) {
  // ?�른 ?�어 버전???�??링크 ?�데?�트
  Object.entries(SUPPORTED_LANGUAGES).forEach(([langCode, langInfo]) => {
    if (langCode !== currentLangCode) {
      const href = seoMetadata[pageType][langCode].canonical;
      updateOrCreateLinkTag(`alternate-${langCode}`, href);
    }
  });
}

export {
  SUPPORTED_LANGUAGES,
  detectBrowserLanguage,
  detectLanguageFromLocation,
  getCurrentLanguage,
  setLanguage,
  getActiveLanguage,
  applyLanguage,
  showLanguageSettingsModal,
  updateMetadata,
};
