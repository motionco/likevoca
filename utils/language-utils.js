// 지원하는 언어 목록
const SUPPORTED_LANGUAGES = {
  ko: {
    name: "한국어",
    code: "ko",
  },
  en: {
    name: "English",
    code: "en",
  },
  ja: {
    name: "日本語",
    code: "ja",
  },
  zh: {
    name: "中文",
    code: "zh",
  },
};

// 공통으로 사용되는 텍스트 정의
const commonTexts = {
  ko: {
    language_learning: "다국어 학습",
    language_learning_desc:
      "플래시카드, 퀴즈, 타이핑 등 다양한 방식으로 언어를 학습하세요.",
    language_games: "다국어 게임",
    language_games_desc:
      "재미있는 게임을 통해 다양한 언어를 즐겁게 배워보세요.",
  },
  en: {
    language_learning: "Language Learning",
    language_learning_desc:
      "Learn languages in various ways such as flashcards, quizzes, and typing.",
    language_games: "Language Games",
    language_games_desc: "Learn various languages enjoyably through fun games.",
  },
  ja: {
    language_learning: "多言語学習",
    language_learning_desc:
      "フラッシュカード、クイズ、タイピングなど、様々な方法で言語を学びましょう。",
    language_games: "多言語ゲーム",
    language_games_desc: "楽しいゲームを通して様々な言語を楽しく学びましょう。",
  },
  zh: {
    language_learning: "多语言学习",
    language_learning_desc: "通过闪卡、测验和打字等多种方式学习语言。",
    language_games: "多语言游戏",
    language_games_desc: "通过有趣的游戏愉快地学习各种语言。",
  },
};

// SEO를 위한 메타데이터 설정
const seoMetadata = {
  // 홈페이지 메타데이터
  home: {
    ko: {
      title: "LikeVoca - " + commonTexts.ko.language_learning,
      description: commonTexts.ko.language_learning_desc,
      keywords:
        "언어 학습, 다국어, 단어장, AI 단어장, 영어, 일본어, 중국어, 한국어",
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
        "語学学習, 多言語, 単語帳, AI単語帳, 英語, 日本語, 中国語, 韓国語",
      canonical: "https://likevoca.com/ja",
    },
    zh: {
      title: "LikeVoca - " + commonTexts.zh.language_learning,
      description: commonTexts.zh.language_learning_desc,
      keywords: "语言学习, 多语言, 单词本, AI单词本, 英语, 日语, 中文, 韩语",
      canonical: "https://likevoca.com/zh",
    },
  },
  // 다국어 단어장 페이지 메타데이터
  dictionary: {
    ko: {
      title: "LikeVoca - 다국어 단어장",
      description: "나만의 다국어 단어장을 만들고 효과적으로 학습하세요.",
      keywords:
        "다국어 단어장, 영어 단어장, 일본어 단어장, 중국어 단어장, 언어 학습",
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
      title: "LikeVoca - 多言語辞書",
      description: "自分だけの多言語辞書を作成し、効果的に学習しましょう。",
      keywords: "多言語辞書, 英語辞書, 日本語辞書, 中国語辞書, 言語学習",
      canonical: "https://likevoca.com/ja/pages/multilingual-dictionary.html",
    },
    zh: {
      title: "LikeVoca - 多语言词典",
      description: "创建您自己的多语言词典并有效学习。",
      keywords: "多语言词典, 英语词典, 日语词典, 中文词典, 语言学习",
      canonical: "https://likevoca.com/zh/pages/multilingual-dictionary.html",
    },
  },
  // 다국어 학습 페이지 메타데이터
  learning: {
    ko: {
      title: "LikeVoca - " + commonTexts.ko.language_learning,
      description: commonTexts.ko.language_learning_desc,
      keywords:
        "다국어 학습, 언어 학습, 플래시카드, 퀴즈, 영어, 일본어, 중국어, 한국어",
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
        "多言語学習, 言語学習, フラッシュカード, クイズ, 英語, 日本語, 中国語, 韓国語",
      canonical: "https://likevoca.com/ja/pages/language-learning.html",
    },
    zh: {
      title: "LikeVoca - " + commonTexts.zh.language_learning,
      description: commonTexts.zh.language_learning_desc,
      keywords: "多语言学习, 语言学习, 闪卡, 测验, 英语, 日语, 中文, 韩语",
      canonical: "https://likevoca.com/zh/pages/language-learning.html",
    },
  },
  // 다국어 게임 페이지 메타데이터
  games: {
    ko: {
      title: "LikeVoca - 다국어 게임",
      description: "재미있는 게임을 통해 다양한 언어를 즐겁게 배워보세요.",
      keywords:
        "언어 게임, 다국어 게임, 단어 게임, 언어 학습 게임, 영어, 일본어, 중국어, 한국어",
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
      title: "LikeVoca - 多言語ゲーム",
      description: "楽しいゲームを通して様々な言語を楽しく学びましょう。",
      keywords:
        "言語ゲーム, 多言語ゲーム, 単語ゲーム, 言語学習ゲーム, 英語, 日本語, 中国語, 韓国語",
      canonical: "https://likevoca.com/ja/pages/games.html",
    },
    zh: {
      title: "LikeVoca - 多语言游戏",
      description: "通过有趣的游戏愉快地学习各种语言。",
      keywords:
        "语言游戏, 多语言游戏, 单词游戏, 语言学习游戏, 英语, 日语, 中文, 韩语",
      canonical: "https://likevoca.com/zh/pages/games.html",
    },
  },
  // AI 단어장 페이지 메타데이터
  "ai-vocabulary": {
    ko: {
      title: "LikeVoca - AI 단어장",
      description:
        "AI가 추천하는 다국어 단어장을 만들고 효과적으로 학습하세요.",
      keywords:
        "AI 단어장, 다국어 단어장, 영어 단어장, 일본어 단어장, 중국어 단어장, AI 언어 학습",
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
      title: "LikeVoca - AI単語帳",
      description: "AIが推薦する多言語単語帳を作成し、効果的に学習しましょう。",
      keywords:
        "AI単語帳, 多言語単語帳, 英語単語帳, 日本語単語帳, 中国語単語帳, AI言語学習",
      canonical: "https://likevoca.com/ja/pages/ai-vocabulary.html",
    },
    zh: {
      title: "LikeVoca - AI词汇本",
      description: "创建AI推荐的多语言词汇本并有效学习。",
      keywords:
        "AI词汇本, 多语言词汇本, 英语词汇本, 日语词汇本, 中文词汇本, AI语言学习",
      canonical: "https://likevoca.com/zh/pages/ai-vocabulary.html",
    },
  },
  // 나만의 단어장 페이지 메타데이터
  "my-vocabulary": {
    ko: {
      title: "LikeVoca - 나만의 단어장",
      description:
        "북마크한 단어들을 모아서 나만의 단어장을 만들고 효과적으로 학습하세요.",
      keywords:
        "나만의 단어장, 북마크 단어장, 다국어 단어장, 개인 단어장, 언어 학습",
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
      title: "LikeVoca - 私の単語帳",
      description:
        "ブックマークした単語を集めて自分だけの単語帳を作成し、効果的に学習しましょう。",
      keywords:
        "私の単語帳, ブックマーク単語帳, 多言語単語帳, 個人単語帳, 言語学習",
      canonical: "https://likevoca.com/ja/pages/my-word-list.html",
    },
    zh: {
      title: "LikeVoca - 我的词汇本",
      description: "收集您收藏的单词，创建您自己的词汇本并有效学习。",
      keywords: "我的词汇本, 收藏词汇本, 多语言词汇本, 个人词汇本, 语言学习",
      canonical: "https://likevoca.com/zh/pages/my-word-list.html",
    },
  },
};

// 번역 텍스트 저장소
const translations = {
  ko: {
    home: "홈",
    wordbook: "단어장",
    vocabulary: "단어장",
    multilingual_dictionary: "다국어 단어장",
    ai_wordbook: "AI 단어장",
    ai_vocabulary: "AI 단어장",
    language_learning: commonTexts.ko.language_learning,
    language_learning_desc: commonTexts.ko.language_learning_desc,
    language_games: commonTexts.ko.language_games,
    language_games_desc: commonTexts.ko.language_games_desc,
    inquiry: "문의하기",
    login: "로그인",
    signup: "회원가입",
    logout: "로그아웃",
    profile: "프로필",
    delete_account: "회원탈퇴",
    welcome: "환영합니다",
    user_suffix: "님",
    get_started_free: "무료로 시작하기",
    learn_languages: "다양한 언어를 쉽고 재미있게 배워보세요",
    effective_learning:
      "체계적인 커리큘럼과 직관적인 학습 시스템으로 당신의 언어 학습을 더욱 효과적으로 만들어드립니다.",
    wordbook_desc:
      "학습할 단어를 입력하고 나만의 다국어 단어장을 만들어보세요.",
    ai_wordbook_desc:
      "Google Gemini AI로 맞춤 단어를 추천받고, 언어 실력을 키우세요.",
    ai_vocabulary_desc:
      "AI가 추천하는 다국어 개념을 학습하고 언어 실력을 향상시키세요.",
    inquiry_desc: "궁금한 점이 있거나 도움이 필요하시면 언제든지 문의하세요.",
    start: "시작하기",
    language_settings: "언어 설정",
    save: "저장",
    cancel: "취소",
    total_concepts: "전체 개념 수",
    concepts_unit: "개",
    ai_usage: "AI 사용량",
    ai_recommend_concept: "AI 개념 추천받기",
    // 모달 관련 번역
    add_concept: "개념 추가",
    edit_concept: "개념 수정",
    domain: "도메인",
    select_domain: "도메인 선택",
    category: "카테고리",
    category_placeholder: "예: fruit, animal",
    emoji: "이모지",
    language_expressions: "언어별 표현",
    word: "단어",
    pronunciation: "발음",
    definition: "정의",
    part_of_speech: "품사",
    select_pos: "품사 선택",
    // 품사 번역
    noun: "명사",
    verb: "동사",
    adjective: "형용사",
    adverb: "부사",
    pronoun: "대명사",
    preposition: "전치사",
    conjunction: "접속사",
    interjection: "감탄사",
    particle: "조사",
    determiner: "한정사",
    classifier: "분류사",
    other: "기타",
    // 언어학적 용어 번역
    synonyms: "유사어 (쉼표로 구분)",
    antonyms: "반의어 (쉼표로 구분)",
    collocations: "연어 (쉼표로 구분)",
    compound_words: "복합어 (쉼표로 구분)",
    examples: "예문",
    add_example: "예문 추가",
    representative_example: "대표 예문",
    korean_example: "한국어 예문",
    english_example: "영어 예문",
    japanese_example: "일본어 예문",
    chinese_example: "중국어 예문",
    tags: "태그 (쉼표로 구분)",
    // 도메인 번역
    academic: "학술",
    technology: "기술",
    health: "건강",
    sports: "스포츠",
    entertainment: "엔터테인먼트",
    // 도메인 필터 번역
    domain_filter: "도메인",
    all_domains: "전체 도메인",
    domain_daily: "일상",
    domain_business: "비즈니스",
    domain_academic: "학술",
    domain_travel: "여행",
    domain_food: "음식",
    domain_nature: "자연",
    domain_technology: "기술",
    domain_health: "건강",
    domain_sports: "스포츠",
    domain_entertainment: "엔터테인먼트",
    domain_other: "기타",
    // 로그인 페이지 번역
    login_with_google: "Google로 로그인",
    login_with_github: "Github로 로그인",
    or: "또는",
    email: "이메일",
    email_placeholder: "이메일을 입력하세요",
    password: "비밀번호",
    password_placeholder: "비밀번호를 입력하세요",
    auto_login: "자동 로그인",
    forgot_password: "비밀번호를 잊으셨나요?",
    no_account: "계정이 없으신가요?",
    // 회원가입 페이지 번역
    create_account: "계정 만들기",
    name: "이름",
    name_placeholder: "이름을 입력하세요",
    confirm_password: "비밀번호 확인",
    confirm_password_placeholder: "비밀번호를 다시 입력하세요",
    agree_terms: "이용약관에 동의합니다",
    already_account: "이미 계정이 있으신가요?",
    // 문의 페이지 번역
    contact_us: "문의하기",
    subject: "제목",
    subject_placeholder: "문의 제목을 입력하세요",
    message: "메시지",
    message_placeholder: "문의 내용을 입력하세요",
    send: "보내기",
    // 다국어 단어장 페이지 번역
    search: "검색",
    search_placeholder: "검색어 입력...",
    source_language: "원본 언어",
    target_language: "대상 언어",
    all_categories: "모든 카테고리",
    fruit: "과일",
    food: "음식",
    animal: "동물",
    daily: "일상",
    travel: "여행",
    business: "비즈니스",
    concept_count: "개의 개념",
    sort: "정렬",
    latest: "최신순",
    oldest: "오래된순",
    alphabetical: "가나다순",
    reverse_alphabetical: "역가나다순",
    concept_usage: "개념 사용량",
    add_new_concept: "새 개념 추가",
    bulk_add_concept: "대량 개념 추가",
    load_more: "더 보기",
    korean: "한국어",
    english: "영어",
    japanese: "일본어",
    chinese: "중국어",
    // 다국어 학습 페이지 번역
    language_learning_title: "다국어 학습",
    select_source_language: "원본 언어 선택",
    select_target_language: "대상 언어 선택",
    learning_mode: "학습 모드",
    flashcards: "플래시카드",
    flashcards_desc: "단어 앞면/뒷면으로 학습",
    quiz: "퀴즈",
    quiz_desc: "객관식 문제로 학습",
    typing: "타이핑",
    typing_desc: "직접 입력하여 학습",
    previous: "이전",
    flip: "뒤집기",
    next: "다음",
    examples: "예문:",
    card_progress: "진행률",
    quiz_question: "문제",
    next_question: "다음 문제",
    quiz_progress: "진행률",
    typing_prompt: "정답을 입력하세요:",
    typing_placeholder: "정답 입력...",
    check_answer: "정답 확인",
    next_word: "다음 단어",
    typing_progress: "진행률",
    correct_count: "맞춘 개수:",
    wrong_count: "틀린 개수:",
    // 단어장 상세보기 모달 번역
    concept_detail_view: "개념 상세 보기",
    expressions_by_language: "언어별 표현",
    close: "닫기",
    delete: "삭제",
    edit: "편집",
    confirm_delete_concept: "정말로 이 개념을 삭제하시겠습니까?",
    concept_deleted_success: "개념이 성공적으로 삭제되었습니다.",
    concept_delete_error: "개념 삭제 중 오류가 발생했습니다",
    registration_time: "등록 시간",
    // 개념 추가 모달 번역
    domain: "도메인",
    domain_placeholder: "예: daily, food, business",
    emoji: "이모지",
    emoji_placeholder: "예: 🍎, 🚆, 👋",
    reset: "초기화",
    add: "추가하기",
    add_example: "예문 추가",
    add_new_language: "새 언어 추가",
    language_name_ko: "언어 이름 (한국어)",
    language_name_ko_placeholder: "예: 스페인어, 프랑스어",
    language_code: "언어 코드",
    language_code_placeholder: "예: spanish, french",
    example_word: "예시 단어",
    example_word_placeholder: "예: manzana, pomme",
    cancel: "취소",
    // 게임 번역
    games: "게임",
    games_desc: "재미있는 게임을 통해 다양한 언어를 즐겁게 배워보세요.",
    learning_title: "학습",
    source_language: "원본 언어",
    target_language: "대상 언어",
    learning_title_desc: "체계적인 학습을 통해 언어 실력을 향상시키세요.",
    // 문법 및 학습 진도 페이지 번역
    grammar_progress: "문법 및 학습 진도",
    grammar_progress_title: "문법 및 학습 진도",
    grammar_progress_subtitle: "학습 성과와 문법 패턴 분석을 확인하세요",
    total_concepts: "총 개념 수",
    concepts_breakdown: "카테고리별 분포",
    progress: "진도",
    progress_title: "진도",
    learning_progress: "학습 진도",
    learning_progress_title: "학습 진도",
    learning_progress_subtitle: "개인 학습 성과와 진도를 추적하고 분석하세요",

    // 학습 페이지 번역
    learning_areas: "학습 영역",
    vocabulary_learning: "단어 학습",
    vocabulary_learning_desc: "어휘력 향상을 위한 플래시카드와 타이핑 학습",
    vocabulary_modes: "플래시카드 • 타이핑 • 발음 연습",
    grammar_learning: "문법 학습",
    grammar_learning_desc: "체계적인 문법 패턴 분석과 실습 학습",
    grammar_modes: "문법 패턴 • 예문 분석 • 실습 문제",
    reading_learning: "독해 학습",
    reading_learning_desc: "다양한 예문을 통한 읽기 이해력 향상",
    reading_modes: "예문 학습 • 플래시 모드",
    quiz_test: "퀴즈 테스트",

    // 학습 모드 번역
    learning_modes: "학습 모드",
    back_to_areas: "영역 선택으로 돌아가기",
    pattern_analysis: "패턴 분석",
    pattern_analysis_desc: "문법 구조와 패턴을 체계적으로 학습",
    example_practice: "예문 실습",
    example_practice_desc: "플래시카드 방식으로 문법 패턴 연습",
    general_example_learning: "일반 예문 학습",
    general_example_learning_desc: "다양한 예문을 통한 독해 능력 향상",
    flash_mode: "플래시 모드",
    flash_mode_desc: "빠른 속도로 예문을 학습하는 집중 모드",

    // 필터 및 설정 번역
    difficulty_level: "난이도",
    all_difficulties: "전체 난이도",
    beginner: "초급",
    intermediate: "중급",
    advanced: "고급",
    pattern_type: "패턴 유형",
    all_patterns: "전체 패턴",
    grammar_pattern: "문법 패턴",
    syntax_structure: "문장 구조",
    expression_pattern: "표현 패턴",
    conversation_pattern: "회화 패턴",

    learning_streak: "학습 스트릭",
    learning_goals: "학습 목표",
    quiz_performance: "퀴즈 성과",
    game_performance: "게임 성과",
    language_progress: "언어별 학습 진도",
    category_distribution: "카테고리별 분포",
    grammar: "문법 패턴 분석",
    recent_activity: "최근 학습 활동",
    refresh: "새로고침",
    export: "내보내기",
    attempts: "시도",
    correct: "정답",
    games_played: "게임",
    wins: "승리",
    loading: "로딩 중...",
    select_category: "카테고리 선택",
    select_emoji: "이모지 선택",
    emoji: "이모지",

    // 일상 도메인 카테고리
    household: "생활용품",
    family: "가족",
    routine: "일상생활",
    clothing: "의류",
    furniture: "가구",

    // 음식 도메인 카테고리
    fruit: "과일",
    vegetable: "채소",
    meat: "육류",
    drink: "음료",
    snack: "간식",

    // 여행 도메인 카테고리
    transportation: "교통수단",
    accommodation: "숙박",
    tourist_attraction: "관광지",
    luggage: "짐",
    direction: "길찾기",

    // 비즈니스 도메인 카테고리
    meeting: "회의",
    finance: "금융",
    marketing: "마케팅",
    office: "사무실",
    project: "프로젝트",

    // 학술 도메인 카테고리
    science: "과학",
    literature: "문학",
    history: "역사",
    mathematics: "수학",
    research: "연구",

    // 자연 도메인 카테고리
    animal: "동물",
    plant: "식물",
    weather: "날씨",
    geography: "지리",
    environment: "환경",

    // 기술 도메인 카테고리
    computer: "컴퓨터",
    software: "소프트웨어",
    internet: "인터넷",
    mobile: "모바일",
    ai: "인공지능",

    // 건강 도메인 카테고리
    exercise: "운동",
    medicine: "의학",
    nutrition: "영양",
    mental_health: "정신건강",
    hospital: "병원",

    // 스포츠 도메인 카테고리
    football: "축구",
    basketball: "농구",
    swimming: "수영",
    running: "달리기",
    equipment: "운동기구",

    // 엔터테인먼트 도메인 카테고리
    movie: "영화",
    music: "음악",
    game: "게임",
    book: "도서",
    art: "예술",

    // My Vocabulary page translations
    my_vocabulary_title: "나만의 단어장",
    bookmarked_word_count: "북마크한 단어 수:",
    word_count_unit: "개",
    bookmark_usage: "북마크 사용량",
    unlimited: "무제한",
    bookmark_words: "단어 북마크하기",
    hangul: "한글",
    meaning: "뜻",
    pronunciation: "발음",
    description: "설명",
    search_placeholder: "검색어를 입력하세요",
    load_more: "더 보기",
    no_bookmarks_title: "북마크한 단어가 없습니다",
    no_bookmarks_desc: "다국어 단어장에서 관심있는 단어들을 북마크해보세요!",
    browse_words: "단어 둘러보기",
    bookmarked: "북마크됨",
    no_date: "날짜 없음",
    login_required: "로그인이 필요합니다.",
    error_loading_bookmarks: "북마크된 개념 로드 오류:",
    concept_detail_view: "개념 상세 보기:",
    expressions: "표현",
    examples: "예문",

    // 학습 모드 카드 번역
    flashcard_learning: "🃏 플래시카드 학습",
    typing_learning: "⌨️ 타이핑 학습",
    pronunciation_practice: "🎤 발음 연습",
    grammar_pattern_analysis: "📝 문법 패턴 분석",
    grammar_practice: "📚 문법 실습 연습",
    reading_learning: "📖 독해 학습",

    // 플래시카드 모드 번역
    click_to_check_meaning: "클릭하여 의미 확인",
    click_to_see_word: "다시 클릭하여 단어 보기",

    // 타이핑 모드 번역
    typing_answer_placeholder: "답안을 입력하세요",
    check: "확인",

    // 발음 연습 모드 번역
    pronunciation_coming_soon: "발음 연습 모드는 준비 중입니다.",

    // 문법 모드 번역
    click_to_see_explanation: "클릭하여 설명 보기",

    // 독해 모드 번역
    original_text: "원문",
    translation: "번역",
    context: "상황",

    // 공통 버튼 번역
    home: "홈으로",
    back_to_home: "홈으로 돌아가기",

    // 데이터 없음 메시지
    no_data: "데이터가 없습니다",
    no_data_description:
      "학습할 데이터가 없습니다. 먼저 데이터를 업로드해주세요.",

    // 업로드 모달 번역
    concept_upload: "개념 업로드",
    grammar_pattern_upload: "문법 패턴 업로드",
    example_upload: "예문 업로드",
    upload_csv_json_concept:
      "CSV 또는 JSON 파일을 업로드하여 개념을 추가하세요.",
    upload_csv_json_grammar:
      "CSV 또는 JSON 파일을 업로드하여 문법 패턴을 추가하세요.",
    upload_csv_json_example:
      "CSV 또는 JSON 파일을 업로드하여 예문을 추가하세요.",
    upload: "업로드",
    download_template: "템플릿 다운로드",
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
    // 로그인 페이지 번역
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
    // 회원가입 페이지 번역
    create_account: "Create Account",
    name: "Name",
    name_placeholder: "Enter your name",
    confirm_password: "Confirm Password",
    confirm_password_placeholder: "Enter your password again",
    agree_terms: "I agree to the terms of service",
    already_account: "Already have an account?",
    // 문의 페이지 번역
    contact_us: "Contact Us",
    subject: "Subject",
    subject_placeholder: "Enter subject",
    message: "Message",
    message_placeholder: "Enter your message",
    send: "Send",
    // 다국어 단어장 페이지 번역
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
    // 다국어 학습 페이지 번역
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
    // 단어장 상세보기 모달 번역
    concept_detail_view: "Concept Detail View",
    expressions_by_language: "Expressions by Language",
    close: "Close",
    delete: "Delete",
    edit: "Edit",
    confirm_delete_concept: "Are you sure you want to delete this concept?",
    concept_deleted_success: "Concept has been successfully deleted.",
    concept_delete_error: "An error occurred while deleting the concept",
    registration_time: "Registration Time",
    // 개념 추가 모달 번역
    domain: "Domain",
    domain_placeholder: "Ex: daily, food, business",
    emoji: "Emoji",
    emoji_placeholder: "Ex: 🍎, 🚆, 👋",
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
    // 문법 및 학습 진도 페이지 번역
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

    // 학습 페이지 번역
    learning_areas: "Learning Areas",
    vocabulary_learning: "Vocabulary Learning",
    vocabulary_learning_desc:
      "Flashcards and typing practice to improve vocabulary",
    vocabulary_modes: "Flashcards • Typing • Pronunciation",
    grammar_learning: "Grammar Learning",
    grammar_learning_desc: "Systematic grammar pattern analysis and practice",
    grammar_modes: "Grammar Patterns • Example Analysis • Practice Problems",
    reading_learning: "Reading Learning",
    reading_learning_desc:
      "Improve reading comprehension through various examples",
    reading_modes: "Example Learning • Flash Mode",
    quiz_test: "Quiz Test",

    // 학습 모드 번역
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

    // 필터 및 설정 번역
    difficulty_level: "Difficulty Level",
    all_difficulties: "All Difficulties",
    beginner: "Beginner",
    intermediate: "Intermediate",
    advanced: "Advanced",
    pattern_type: "Pattern Type",
    all_patterns: "All Patterns",
    grammar_pattern: "Grammar Pattern",
    syntax_structure: "Syntax Structure",
    expression_pattern: "Expression Pattern",
    conversation_pattern: "Conversation Pattern",
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

    // 학습 모드 카드 번역
    flashcard_learning: "🃏 Flashcard Learning",
    typing_learning: "⌨️ Typing Learning",
    pronunciation_practice: "🎤 Pronunciation Practice",
    grammar_pattern_analysis: "📝 Grammar Pattern Analysis",
    grammar_practice: "📚 Grammar Practice",
    reading_learning: "📖 Reading Learning",

    // 플래시카드 모드 번역
    click_to_check_meaning: "Click to check meaning",
    click_to_see_word: "Click again to see word",

    // 타이핑 모드 번역
    typing_answer_placeholder: "Enter your answer",
    check: "Check",

    // 발음 연습 모드 번역
    pronunciation_coming_soon: "Pronunciation practice mode is coming soon.",

    // 문법 모드 번역
    click_to_see_explanation: "Click to see explanation",

    // 독해 모드 번역
    original_text: "Original Text",
    translation: "Translation",
    context: "Context",

    // 공통 버튼 번역
    home: "Home",
    back_to_home: "Back to Home",

    // 데이터 없음 메시지
    no_data: "No Data Available",
    no_data_description: "There is no data to learn. Please upload data first.",

    // 업로드 모달 번역
    concept_upload: "Concept Upload",
    grammar_pattern_upload: "Grammar Pattern Upload",
    example_upload: "Example Upload",
    upload_csv_json_concept: "Upload CSV or JSON files to add concepts.",
    upload_csv_json_grammar:
      "Upload CSV or JSON files to add grammar patterns.",
    upload_csv_json_example: "Upload CSV or JSON files to add examples.",
    upload: "Upload",
    download_template: "Download Template",
  },
  ja: {
    home: "ホーム",
    wordbook: "単語帳",
    vocabulary: "単語帳",
    multilingual_dictionary: "多言語辞書",
    ai_wordbook: "AI単語帳",
    ai_vocabulary: "AI単語帳",
    language_learning: commonTexts.ja.language_learning,
    language_learning_desc: commonTexts.ja.language_learning_desc,
    language_games: commonTexts.ja.language_games,
    language_games_desc: commonTexts.ja.language_games_desc,
    inquiry: "お問い合わせ",
    login: "ログイン",
    signup: "会員登録",
    logout: "ログアウト",
    profile: "プロフィール",
    delete_account: "退会",
    welcome: "ようこそ",
    user_suffix: "さん",
    get_started_free: "無料で始める",
    learn_languages: "様々な言語を簡単に楽しく学びましょう",
    effective_learning:
      "体系的なカリキュラムと直感的な学習システムで、あなたの語学学習をより効果的にします。",
    wordbook_desc:
      "学習する単語を入力して、自分だけの多言語単語帳を作りましょう。",
    ai_wordbook_desc:
      "Google Gemini AIからカスタム単語のおすすめを受け取り、語学力を向上させましょう。",
    ai_vocabulary_desc:
      "AIが推薦する多言語概念を学び、語学力を向上させましょう。",
    inquiry_desc:
      "質問がある場合や助けが必要な場合は、お気軽にお問い合わせください。",
    start: "始める",
    language_settings: "言語設定",
    save: "保存",
    cancel: "キャンセル",
    total_concepts: "総概念数",
    concepts_unit: "個",
    ai_usage: "AI使用量",
    ai_recommend_concept: "AI概念推薦",
    // Modal-related translations
    add_concept: "概念追加",
    edit_concept: "概念編集",
    domain: "ドメイン",
    select_domain: "ドメインを選択",
    category: "カテゴリー",
    category_placeholder: "例: fruit, animal",
    emoji: "絵文字",
    language_expressions: "言語別表現",
    word: "単語",
    pronunciation: "発音",
    definition: "定義",
    part_of_speech: "品詞",
    select_pos: "品詞を選択",
    // Part of speech translations
    noun: "名詞",
    verb: "動詞",
    adjective: "形容詞",
    adverb: "副詞",
    pronoun: "代名詞",
    preposition: "前置詞",
    conjunction: "接続詞",
    interjection: "感嘆詞",
    particle: "助詞",
    determiner: "限定詞",
    classifier: "分類詞",
    other: "その他",
    // Linguistic terms translations
    synonyms: "類義語 (カンマ区切り)",
    antonyms: "反義語 (カンマ区切り)",
    collocations: "連語 (カンマ区切り)",
    compound_words: "複合語 (カンマ区切り)",
    examples: "例文",
    add_example: "例文追加",
    representative_example: "代表例文",
    korean_example: "韓国語例文",
    english_example: "英語例文",
    japanese_example: "日本語例文",
    chinese_example: "中国語例文",
    tags: "タグ (カンマ区切り)",
    // Domain translations
    academic: "学術",
    nature: "自然",
    technology: "技術",
    health: "健康",
    sports: "スポーツ",
    entertainment: "エンターテインメント",
    // Domain filter translations
    domain_filter: "領域",
    all_domains: "全領域",
    domain_daily: "日常",
    domain_business: "ビジネス",
    domain_academic: "学術",
    domain_travel: "旅行",
    domain_food: "食品",
    domain_nature: "自然",
    domain_technology: "技術",
    domain_health: "健康",
    domain_sports: "スポーツ",
    domain_entertainment: "エンターテインメント",
    domain_other: "その他",
    // 로그인 페이지 번역
    login_with_google: "Googleでログイン",
    login_with_github: "Githubでログイン",
    or: "または",
    email: "メールアドレス",
    email_placeholder: "メールアドレスを入力してください",
    password: "パスワード",
    password_placeholder: "パスワードを入力してください",
    auto_login: "自動ログイン",
    forgot_password: "パスワードをお忘れですか？",
    no_account: "アカウントをお持ちでないですか？",
    // 회원가입 페이지 번역
    create_account: "アカウント作成",
    name: "お名前",
    name_placeholder: "お名前を入力してください",
    confirm_password: "パスワード確認",
    confirm_password_placeholder: "パスワードを再入力してください",
    agree_terms: "利用規約に同意します",
    already_account: "すでにアカウントをお持ちですか？",
    // 문의 페이지 번역
    contact_us: "お問い合わせ",
    subject: "件名",
    subject_placeholder: "件名を入力してください",
    message: "メッセージ",
    message_placeholder: "メッセージを入力してください",
    send: "送信",
    // 다국어 단어장 페이지 번역
    search: "検索",
    search_placeholder: "検索語を入力...",
    source_language: "原語",
    target_language: "対象言語",
    category: "カテゴリー",
    all_categories: "すべてのカテゴリー",
    fruit: "果物",
    food: "食べ物",
    animal: "動物",
    daily: "日常",
    travel: "旅行",
    business: "ビジネス",
    concept_count: "の概念",
    sort: "並べ替え",
    latest: "最新順",
    oldest: "古い順",
    alphabetical: "あいうえお順",
    reverse_alphabetical: "逆あいうえお順",
    concept_usage: "概念使用量",
    add_new_concept: "新しい概念を追加",
    bulk_add_concept: "一括概念追加",
    load_more: "もっと見る",
    korean: "韓国語",
    english: "英語",
    japanese: "日本語",
    chinese: "中国語",
    // 다국어 학습 페이지 번역
    language_learning_title: "多言語学習",
    select_source_language: "原語を選択",
    select_target_language: "対象言語を選択",
    learning_mode: "学習モード",
    flashcards: "フラッシュカード",
    flashcards_desc: "カードの表裏で学習",
    quiz: "クイズ",
    quiz_desc: "多肢選択問題で学習",
    typing: "タイピング",
    typing_desc: "直接入力して学習",
    previous: "前へ",
    flip: "裏返す",
    next: "次へ",
    examples: "例文:",
    card_progress: "進捗状況",
    quiz_question: "問題",
    next_question: "次の問題",
    quiz_progress: "進捗状況",
    typing_prompt: "答えを入力してください:",
    typing_placeholder: "答えを入力...",
    check_answer: "答え合わせ",
    next_word: "次の単語",
    typing_progress: "進捗状況",
    correct_count: "正解数:",
    wrong_count: "不正解数:",
    // 단어장 상세보기 모달 번역
    concept_detail_view: "概念詳細表示",
    expressions_by_language: "言語別表現",
    close: "閉じる",
    delete: "削除",
    edit: "編集",
    confirm_delete_concept: "本当にこの概念を削除しますか？",
    concept_deleted_success: "概念が正常に削除されました。",
    concept_delete_error: "概念の削除中にエラーが発生しました",
    registration_time: "登録時間",
    // 개념 추가 모달 번역
    domain: "ドメイン",
    domain_placeholder: "例：daily, food, business",
    emoji: "絵文字",
    emoji_placeholder: "例：🍎, 🚆, 👋",
    reset: "リセット",
    add: "追加",
    add_example: "例文を追加",
    add_new_language: "新しい言語を追加",
    language_name_ko: "言語名（韓国語）",
    language_name_ko_placeholder: "例：スペイン語、フランス語",
    language_code: "言語コード",
    language_code_placeholder: "例：spanish, french",
    example_word: "例の単語",
    example_word_placeholder: "例：manzana, pomme",
    cancel: "キャンセル",
    // 게임 번역
    games: "ゲーム",
    games_desc: "楽しいゲームを通して様々な言語を楽しく学びましょう。",
    learning_title: "学習",
    source_language: "元言語",
    target_language: "対象言語",
    learning_title_desc: "体系的な学習を通して語学力を向上させましょう。",
    // 문법 및 학습 진도 페이지 번역
    grammar_progress: "文法と学習進捗",
    grammar_progress_title: "文法と学習進捗",
    grammar_progress_subtitle: "学習成果と文法パターンを確認する",
    total_concepts: "総概念数",
    concepts_breakdown: "カテゴリ別分布",
    progress: "進度",
    progress_title: "進度",
    learning_progress: "学習進度",
    learning_progress_title: "学習進度",
    learning_progress_subtitle: "個人学習成果と進度を追跡し、分析する",

    // 学習ページ翻訳
    learning_areas: "学習領域",
    vocabulary_learning: "単語学習",
    vocabulary_learning_desc:
      "語彙力向上のためのフラッシュカードとタイピング学習",
    vocabulary_modes: "フラッシュカード • タイピング • 発音練習",
    grammar_learning: "文法学習",
    grammar_learning_desc: "体系的な文法パターン分析と実習学習",
    grammar_modes: "文法パターン • 例文分析 • 実習問題",
    reading_learning: "読解学習",
    reading_learning_desc: "様々な例文を通した読解力向上",
    reading_modes: "例文学習 • フラッシュモード",
    quiz_test: "クイズテスト",

    // 学習モード翻訳
    learning_modes: "学習モード",
    back_to_areas: "領域選択に戻る",
    pattern_analysis: "パターン分析",
    pattern_analysis_desc: "文法構造とパターンを体系的に学習",
    example_practice: "例文実習",
    example_practice_desc: "フラッシュカード方式で文法パターン練習",
    general_example_learning: "一般例文学習",
    general_example_learning_desc: "様々な例文を通した読解能力向上",
    flash_mode: "フラッシュモード",
    flash_mode_desc: "高速で例文を学習する集中モード",

    // フィルターと設定翻訳
    difficulty_level: "難易度",
    all_difficulties: "全難易度",
    beginner: "初級",
    intermediate: "中級",
    advanced: "上級",
    pattern_type: "パターンタイプ",
    all_patterns: "全パターン",
    grammar_pattern: "文法パターン",
    syntax_structure: "文章構造",
    expression_pattern: "表現パターン",
    conversation_pattern: "会話パターン",
    domain_filter: "ドメイン",
    all_domains: "全ドメイン",
    domain_daily: "日常",
    domain_business: "ビジネス",
    domain_academic: "学術",
    domain_travel: "旅行",
    domain_food: "食べ物",
    domain_nature: "自然",
    domain_technology: "技術",
    domain_health: "健康",
    domain_sports: "スポーツ",
    domain_entertainment: "エンターテインメント",
    domain_other: "その他",
  },
  zh: {
    home: "首页",
    wordbook: "词汇本",
    vocabulary: "词汇",
    multilingual_dictionary: "多语言词典",
    ai_wordbook: "AI词汇本",
    ai_vocabulary: "AI词汇",
    language_learning: commonTexts.zh.language_learning,
    language_learning_desc: commonTexts.zh.language_learning_desc,
    language_games: commonTexts.zh.language_games,
    language_games_desc: commonTexts.zh.language_games_desc,
    inquiry: "咨询",
    login: "登录",
    signup: "注册",
    logout: "登出",
    profile: "个人资料",
    delete_account: "删除账户",
    welcome: "欢迎",
    user_suffix: "",
    get_started_free: "免费开始",
    learn_languages: "轻松有趣地学习各种语言",
    effective_learning:
      "通过系统化课程和直观学习系统，让您的语言学习更加高效。",
    wordbook_desc: "输入要学习的单词，创建您自己的多语言词汇本。",
    ai_wordbook_desc:
      "通过Google Gemini AI获得定制单词推荐，提高您的语言技能。",
    ai_vocabulary_desc: "学习AI推荐的多语言概念，提高您的语言技能。",
    inquiry_desc: "如果您有任何问题或需要帮助，请随时咨询。",
    start: "开始",
    language_settings: "语言设置",
    save: "保存",
    cancel: "取消",
    total_concepts: "总概念数",
    concepts_unit: "个",
    ai_usage: "AI使用量",
    ai_recommend_concept: "AI概念推荐",
    // 模态框相关翻译
    add_concept: "添加概念",
    edit_concept: "编辑概念",
    domain: "领域",
    select_domain: "选择领域",
    category: "类别",
    category_placeholder: "例如：fruit, animal",
    emoji: "表情符号",
    language_expressions: "语言表达",
    word: "单词",
    pronunciation: "发音",
    definition: "定义",
    part_of_speech: "词性",
    select_pos: "选择词性",
    // 词性翻译
    noun: "名词",
    verb: "动词",
    adjective: "形容词",
    adverb: "副词",
    pronoun: "代词",
    preposition: "介词",
    conjunction: "连词",
    interjection: "感叹词",
    particle: "助词",
    determiner: "限定词",
    classifier: "量词",
    other: "其他",
    // 语言学术语翻译
    synonyms: "同义词（逗号分隔）",
    antonyms: "反义词（逗号分隔）",
    collocations: "搭配（逗号分隔）",
    compound_words: "复合词（逗号分隔）",
    examples: "例句",
    add_example: "添加例句",
    representative_example: "代表例句",
    korean_example: "韩语例句",
    english_example: "英语例句",
    japanese_example: "日语例句",
    chinese_example: "中文例句",
    tags: "标签（逗号分隔）",
    // 领域翻译
    academic: "学术",
    technology: "技术",
    health: "健康",
    sports: "体育",
    entertainment: "娱乐",
    // 领域过滤器翻译
    domain_filter: "领域",
    all_domains: "全部领域",
    domain_daily: "日常",
    domain_business: "商务",
    domain_academic: "学术",
    domain_travel: "旅行",
    domain_food: "食物",
    domain_nature: "自然",
    domain_technology: "技术",
    domain_health: "健康",
    domain_sports: "体育",
    domain_entertainment: "娱乐",
    domain_other: "其他",
    // 登录页面翻译
    login_with_google: "使用Google登录",
    login_with_github: "使用Github登录",
    or: "或者",
    email: "电子邮件",
    email_placeholder: "请输入您的电子邮件",
    password: "密码",
    password_placeholder: "请输入您的密码",
    auto_login: "自动登录",
    forgot_password: "忘记密码？",
    no_account: "没有账号？",
    // 회원가입 페이지 번역
    create_account: "创建账号",
    name: "姓名",
    name_placeholder: "请输入您的姓名",
    confirm_password: "确认密码",
    confirm_password_placeholder: "请再次输入密码",
    agree_terms: "我同意服务条款",
    already_account: "已有账号？",
    // 문의 페이지 번역
    contact_us: "联系我们",
    subject: "主题",
    subject_placeholder: "请输入主题",
    message: "信息",
    message_placeholder: "请输入您的信息",
    send: "发送",
    // 다국어 단어장 페이지 번역
    search: "搜索",
    search_placeholder: "输入搜索词...",
    source_language: "源语言",
    target_language: "目标语言",
    category: "类别",
    all_categories: "所有类别",
    fruit: "水果",
    food: "食物",
    animal: "动物",
    daily: "日常",
    travel: "旅行",
    business: "商务",
    concept_count: "个概念",
    sort: "排序",
    latest: "最新",
    oldest: "最早",
    alphabetical: "字母顺序",
    reverse_alphabetical: "反字母顺序",
    concept_usage: "概念使用量",
    add_new_concept: "添加新概念",
    bulk_add_concept: "批量添加概念",
    load_more: "加载更多",
    korean: "韩语",
    english: "英语",
    japanese: "日语",
    chinese: "中文",
    // 다국어 학습 페이지 번역
    language_learning_title: "多语言学习",
    select_source_language: "选择源语言",
    select_target_language: "选择目标语言",
    learning_mode: "学习模式",
    flashcards: "闪卡",
    flashcards_desc: "通过单词正反面学习",
    quiz: "测验",
    quiz_desc: "通过选择题学习",
    typing: "打字",
    typing_desc: "通过直接输入学习",
    previous: "上一个",
    flip: "翻转",
    next: "下一个",
    examples: "例句:",
    card_progress: "进度",
    quiz_question: "问题",
    next_question: "下一题",
    quiz_progress: "进度",
    typing_prompt: "请输入答案:",
    typing_placeholder: "输入答案...",
    check_answer: "检查答案",
    next_word: "下一个单词",
    typing_progress: "进度",
    correct_count: "正确数:",
    wrong_count: "错误数:",
    // 단어장 상세보기 모달 번역
    concept_detail_view: "概念详细查看",
    expressions_by_language: "按语言表达",
    close: "关闭",
    delete: "删除",
    edit: "编辑",
    confirm_delete_concept: "您确定要删除这个概念吗？",
    concept_deleted_success: "概念已成功删除。",
    concept_delete_error: "删除概念时发生错误",
    registration_time: "注册时间",
    // 개념 추가 모달 번역
    domain: "领域",
    domain_placeholder: "例如：daily, food, business",
    emoji: "表情符号",
    emoji_placeholder: "例如：🍎, 🚆, 👋",
    reset: "重置",
    add: "添加",
    add_example: "添加例句",
    add_new_language: "添加新语言",
    language_name_ko: "语言名称（韩语）",
    language_name_ko_placeholder: "例如：西班牙语，法语",
    language_code: "语言代码",
    language_code_placeholder: "例如：spanish, french",
    example_word: "示例单词",
    example_word_placeholder: "例如：manzana, pomme",
    cancel: "取消",
    // 게임 번역
    games: "游戏",
    games_desc: "通过有趣的游戏愉快地学习各种语言。",
    learning_title: "学习",
    source_language: "源语言",
    target_language: "目标语言",
    learning_title_desc: "通过系统的学习提高您的语言技能。",
    // 문법 및 학습 진도 페이지 번역
    grammar_progress: "语法和学习进度",
    grammar_progress_title: "语法和学习进度",
    grammar_progress_subtitle: "查看学习成果和语法模式分析",
    total_concepts: "总概念数",
    concepts_breakdown: "类别分布",
    progress: "进度",
    progress_title: "进度",
    learning_progress: "学习进度",
    learning_progress_title: "学习进度",
    learning_progress_subtitle: "跟踪个人学习成果和进度",

    // 学习页面翻译
    learning_areas: "学习领域",
    vocabulary_learning: "词汇学习",
    vocabulary_learning_desc: "通过闪卡和打字练习提高词汇量",
    vocabulary_modes: "闪卡 • 打字 • 发音练习",
    grammar_learning: "语法学习",
    grammar_learning_desc: "系统的语法模式分析和实践学习",
    grammar_modes: "语法模式 • 例句分析 • 练习题",
    reading_learning: "阅读学习",
    reading_learning_desc: "通过各种例句提高阅读理解能力",
    reading_modes: "例句学习 • 闪卡模式",
    quiz_test: "测验测试",

    // 学习模式翻译
    learning_modes: "学习模式",
    back_to_areas: "返回领域选择",
    pattern_analysis: "模式分析",
    pattern_analysis_desc: "系统学习语法结构和模式",
    example_practice: "例句练习",
    example_practice_desc: "通过闪卡方式练习语法模式",
    general_example_learning: "一般例句学习",
    general_example_learning_desc: "通过各种例句提高阅读能力",
    flash_mode: "闪卡模式",
    flash_mode_desc: "快速学习例句的集中模式",

    // 过滤器和设置翻译
    difficulty_level: "难度等级",
    all_difficulties: "全部难度",
    beginner: "初级",
    intermediate: "中级",
    advanced: "高级",
    pattern_type: "模式类型",
    all_patterns: "全部模式",
    grammar_pattern: "语法模式",
    syntax_structure: "句法结构",
    expression_pattern: "表达模式",
    conversation_pattern: "对话模式",
    domain_filter: "领域",
    all_domains: "全部领域",
    domain_daily: "日常",
    domain_business: "商务",
    domain_academic: "学术",
    domain_travel: "旅行",
    domain_food: "食物",
    domain_nature: "自然",
    domain_technology: "技术",
    domain_health: "健康",
    domain_sports: "体育",
    domain_entertainment: "娱乐",
    domain_other: "其他",

    // 学习模式卡片翻译
    vocabulary_learning_modes: "词汇学习模式",
    vocabulary_data_upload: "词汇数据上传",
    flashcard_mode: "闪卡",
    flashcard_mode_desc: "通过翻转卡片学习单词和含义",
    typing_mode: "打字",
    typing_mode_desc: "通过听写和准确打字练习拼写",
    pronunciation_mode: "发音练习",
    pronunciation_mode_desc: "通过语音识别训练准确发音",

    // 学习模式翻译
    flashcard_learning: "🃏 闪卡学习",
    typing_learning: "⌨️ 打字学习",
    pronunciation_practice: "🎤 发音练习",
    grammar_pattern_analysis: "📝 语法模式分析",
    grammar_practice: "📚 语法练习",
    reading_learning: "📖 阅读学习",

    // 闪卡模式翻译
    click_to_check_meaning: "点击查看含义",
    click_to_see_word: "再次点击查看单词",

    // 打字模式翻译
    typing_answer_placeholder: "请输入答案",
    check: "检查",

    // 发音练习模式翻译
    pronunciation_coming_soon: "发音练习模式即将推出。",

    // 语法模式翻译
    click_to_see_explanation: "点击查看解释",

    // 阅读模式翻译
    original_text: "原文",
    translation: "翻译",
    context: "语境",

    // 公共按钮翻译
    home: "首页",
    back_to_home: "返回首页",

    // 无数据消息
    no_data: "没有数据",
    no_data_description: "没有学习数据。请先上传数据。",

    // 上传模态框翻译
    concept_upload: "概念上传",
    grammar_pattern_upload: "语法模式上传",
    example_upload: "例句上传",
    upload_csv_json_concept: "上传CSV或JSON文件以添加概念。",
    upload_csv_json_grammar: "上传CSV或JSON文件以添加语法模式。",
    upload_csv_json_example: "上传CSV或JSON文件以添加例句。",
    upload: "上传",
    download_template: "下载模板",
  },
};

// 전역 번역 객체로 설정
if (typeof window !== "undefined") {
  window.translations = translations;
}

// 언어 캐싱을 위한 변수
let cachedLanguage = null;
let languageDetectionInProgress = false;

// 브라우저 기본 언어 감지
function detectBrowserLanguage() {
  const language = navigator.language || navigator.userLanguage;
  const shortLang = language.split("-")[0]; // ko-KR, en-US 등에서 주 언어 코드만 추출

  // 지원되는 언어인지 확인
  return SUPPORTED_LANGUAGES[shortLang] ? shortLang : "en"; // 지원되지 않으면 영어가 기본
}

// 사용자의 위치 정보로 언어 추측
async function detectLanguageFromLocation() {
  try {
    // IP 기반 위치 정보 API 사용
    const response = await fetch("https://ipapi.co/json/");
    const data = await response.json();

    // 국가 코드에 따른 언어 매핑 (간단한 예시)
    const countryToLang = {
      KR: "ko",
      JP: "ja",
      CN: "zh",
      TW: "zh",
      HK: "zh",
    };

    return countryToLang[data.country] || detectBrowserLanguage();
  } catch (error) {
    console.error("위치 기반 언어 감지 실패:", error);
    return detectBrowserLanguage();
  }
}

// 현재 사용 언어 가져오기
function getCurrentLanguage() {
  return localStorage.getItem("userLanguage") || "auto";
}

// 현재 활성화된 언어 코드 가져오기 (캐싱 및 중복 호출 방지)
async function getActiveLanguage() {
  // 이미 감지 중이면 대기
  if (languageDetectionInProgress) {
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (!languageDetectionInProgress && cachedLanguage) {
          clearInterval(checkInterval);
          resolve(cachedLanguage);
        }
      }, 100);
    });
  }

  // 캐시된 언어가 있으면 반환
  if (cachedLanguage) {
    console.log("캐시된 언어 사용:", cachedLanguage);
    return cachedLanguage;
  }

  languageDetectionInProgress = true;

  try {
    // 1. 먼저 localStorage에서 사용자가 직접 설정한 언어 확인
    const savedLang = localStorage.getItem("userLanguage");

    if (savedLang && savedLang !== "auto" && SUPPORTED_LANGUAGES[savedLang]) {
      console.log("저장된 언어 사용:", savedLang);
      cachedLanguage = savedLang;
      localStorage.setItem("preferredLanguage", savedLang); // 도메인-카테고리-이모지용 언어 설정도 동기화
      return savedLang;
    }

    // 2. 자동 설정이거나 저장된 언어가 없는 경우
    console.log("자동 언어 감지 시도...");

    // 먼저 브라우저 언어 시도
    const browserLang = detectBrowserLanguage();
    if (SUPPORTED_LANGUAGES[browserLang]) {
      console.log("브라우저 언어 사용:", browserLang);
      cachedLanguage = browserLang;
      localStorage.setItem("preferredLanguage", browserLang); // 도메인-카테고리-이모지용 언어 설정도 동기화
      return browserLang;
    }

    // 브라우저 언어가 지원되지 않으면 위치 기반 감지
    try {
      const locationLang = await detectLanguageFromLocation();
      console.log("위치 기반 언어 사용:", locationLang);
      cachedLanguage = locationLang;
      localStorage.setItem("preferredLanguage", locationLang); // 도메인-카테고리-이모지용 언어 설정도 동기화
      return locationLang;
    } catch (error) {
      console.error("위치 기반 언어 감지 실패, 기본 언어 사용");
      cachedLanguage = "ko"; // 최종 기본값: 한국어
      localStorage.setItem("preferredLanguage", "ko"); // 도메인-카테고리-이모지용 언어 설정도 동기화
      return "ko";
    }
  } finally {
    languageDetectionInProgress = false;
  }
}

// 언어 설정 저장 및 적용
function setLanguage(langCode) {
  console.log("언어 설정 변경:", langCode);

  if (langCode === "auto") {
    localStorage.removeItem("userLanguage");
    localStorage.removeItem("preferredLanguage"); // 도메인-카테고리-이모지용 언어 설정도 제거
    cachedLanguage = null; // 캐시 초기화
  } else {
    localStorage.setItem("userLanguage", langCode);
    localStorage.setItem("preferredLanguage", langCode); // 도메인-카테고리-이모지용 언어 설정도 저장
    cachedLanguage = langCode; // 캐시 업데이트
  }

  // 언어 적용 및 메타데이터 업데이트
  applyLanguage();

  // 현재 페이지 유형 감지하여 적절한 메타데이터 업데이트
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

// 언어 변경 적용 (무한루프 방지)
async function applyLanguage() {
  try {
    const langCode = await getActiveLanguage();

    if (!translations[langCode]) {
      console.error(`번역 데이터가 없는 언어입니다: ${langCode}`);
      return;
    }

    // 일반 텍스트 요소 번역 (option 태그 포함)
    document.querySelectorAll("[data-i18n]").forEach((element) => {
      const key = element.getAttribute("data-i18n");
      if (translations[langCode][key]) {
        element.textContent = translations[langCode][key];
      }
    });

    // placeholder 속성이 있는 입력 필드에 대해 번역 적용
    document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
      const key = element.getAttribute("data-i18n-placeholder");
      if (translations[langCode][key]) {
        element.placeholder = translations[langCode][key];
      }
    });

    // HTML lang 속성 변경
    document.documentElement.lang = langCode;

    // 도메인-카테고리-이모지 옵션 업데이트 (있는 경우만)
    if (typeof window.updateDomainCategoryEmojiLanguage === "function") {
      window.updateDomainCategoryEmojiLanguage();
    }

    // 이벤트 발생 - 언어 변경을 알림
    document.dispatchEvent(
      new CustomEvent("languageChanged", { detail: { language: langCode } })
    );
  } catch (error) {
    console.error("언어 적용 중 오류:", error);
  }
}

// 언어 설정 모달 표시
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
          <h3 class="text-xl font-bold" data-i18n="language_settings">언어 설정</h3>
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
              <label for="lang-auto">자동 감지 (Auto Detect)</label>
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
          <button id="save-language" class="bg-[#4B63AC] text-white px-4 py-2 rounded hover:bg-[#3A4F8B]" data-i18n="save">저장</button>
        </div>
      </div>
    </div>
  `;

  // 모달 추가
  const modalContainer = document.createElement("div");
  modalContainer.innerHTML = modalHTML;
  document.body.appendChild(modalContainer.firstElementChild);

  // 이벤트 핸들러
  document
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

    console.log("언어 설정 저장:", selectedLang);

    // 언어 설정 저장 및 적용
    setLanguage(selectedLang);

    // 모달 닫기
    document.getElementById("language-settings-modal").classList.add("hidden");

    // 성공 메시지 (선택사항)
    console.log("언어 설정이 저장되었습니다:", selectedLang);
  });
}

// 메타데이터 업데이트 함수 (캐시된 언어 사용)
async function updateMetadata(pageType = "home") {
  try {
    // 캐시된 언어를 먼저 확인, 없으면 감지
    let langCode = cachedLanguage;
    if (!langCode) {
      langCode = await getActiveLanguage();
    }

    if (!seoMetadata[pageType] || !seoMetadata[pageType][langCode]) {
      console.error(`메타데이터가 없습니다: ${pageType}, ${langCode}`);
      return;
    }

    const metadata = seoMetadata[pageType][langCode];

    // 타이틀 업데이트
    document.title = metadata.title;

    // 메타 태그 업데이트 또는 생성
    updateOrCreateMetaTag("description", metadata.description);
    updateOrCreateMetaTag("keywords", metadata.keywords);

    // Open Graph 메타 태그
    updateOrCreateMetaTag("og:title", metadata.title, "property");
    updateOrCreateMetaTag("og:description", metadata.description, "property");
    updateOrCreateMetaTag("og:locale", langCode, "property");

    // 대체 언어 링크 업데이트
    updateAlternateLanguageLinks(pageType, langCode);

    // 표준 링크(canonical) 업데이트
    updateOrCreateLinkTag("canonical", metadata.canonical);

    // hreflang 태그 업데이트
    updateHreflangTags(pageType, langCode);
  } catch (error) {
    console.error("메타데이터 업데이트 중 오류 발생:", error);
  }
}

// 메타 태그 업데이트 또는 생성 헬퍼 함수
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

// 링크 태그 업데이트 또는 생성 헬퍼 함수
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

// hreflang 태그 업데이트 함수
function updateHreflangTags(pageType, currentLangCode) {
  // 기존 hreflang 태그 모두 제거
  document
    .querySelectorAll('link[rel="alternate"][hreflang]')
    .forEach((tag) => tag.remove());

  // 각 지원 언어에 대해 hreflang 태그 추가
  Object.keys(SUPPORTED_LANGUAGES).forEach((langCode) => {
    const href = seoMetadata[pageType][langCode].canonical;

    const linkTag = document.createElement("link");
    linkTag.setAttribute("rel", "alternate");
    linkTag.setAttribute("hreflang", langCode);
    linkTag.setAttribute("href", href);
    document.head.appendChild(linkTag);
  });

  // x-default hreflang 태그 추가 (기본적으로 영어 버전으로 설정)
  const defaultHref = seoMetadata[pageType]["en"].canonical;
  const defaultLinkTag = document.createElement("link");
  defaultLinkTag.setAttribute("rel", "alternate");
  defaultLinkTag.setAttribute("hreflang", "x-default");
  defaultLinkTag.setAttribute("href", defaultHref);
  document.head.appendChild(defaultLinkTag);
}

// 대체 언어 링크 업데이트 함수
function updateAlternateLanguageLinks(pageType, currentLangCode) {
  // 다른 언어 버전에 대한 링크 업데이트
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
