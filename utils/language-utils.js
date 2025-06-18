// ì§€?í•˜???¸ì–´ ëª©ë¡
const SUPPORTED_LANGUAGES = {
  ko: {
    name: "?œêµ­??,
    code: "ko",
  },
  en: {
    name: "English",
    code: "en",
  },
  ja: {
    name: "?¥æœ¬èª?,
    code: "ja",
  },
  zh: {
    name: "ä¸?–‡",
    code: "zh",
  },
};

// ê³µí†µ?¼ë¡œ ?¬ìš©?˜ëŠ” ?ìŠ¤???•ì˜
const commonTexts = {
  ko: {
    language_learning: "?¤êµ­???™ìŠµ",
    language_learning_desc:
      "?Œë˜?œì¹´?? ?´ì¦ˆ, ?€?´í•‘ ???¤ì–‘??ë°©ì‹?¼ë¡œ ?¸ì–´ë¥??™ìŠµ?˜ì„¸??",
    language_games: "?¤êµ­??ê²Œì„",
    language_games_desc:
      "?¬ë??ˆëŠ” ê²Œì„???µí•´ ?¤ì–‘???¸ì–´ë¥?ì¦ê²ê²?ë°°ì›Œë³´ì„¸??",
  },
  en: {
    language_learning: "Language Learning",
    language_learning_desc:
      "Learn languages in various ways such as flashcards, quizzes, and typing.",
    language_games: "Language Games",
    language_games_desc: "Learn various languages enjoyably through fun games.",
  },
  ja: {
    language_learning: "å¤šè?èªå?ç¿?,
    language_learning_desc:
      "?•ãƒ©?ƒã‚·?¥ã‚«?¼ãƒ‰?ã‚¯?¤ã‚º?ã‚¿?¤ãƒ”?³ã‚°?ªã©?æ§˜?…ãª?¹æ³•?§è?èªã‚’å­¦ã³?¾ã—?‡ã†??,
    language_games: "å¤šè?èªã‚²?¼ãƒ ",
    language_games_desc: "æ¥½ã—?„ã‚²?¼ãƒ ?’é€šã—??§˜?…ãªè¨€èªã‚’æ¥½ã—?å??³ã¾?—ã‚‡?†ã€?,
  },
  zh: {
    language_learning: "å¤šè?è¨€å­¦ä¹ ",
    language_learning_desc: "?šè¿‡?ªå¡?æµ‹éªŒå’Œ?“å­—ç­‰å¤šç§æ–¹å¼å?ä¹ è?è¨€??,
    language_games: "å¤šè?è¨€æ¸¸æˆ",
    language_games_desc: "?šè¿‡?‰è¶£?„æ¸¸?æ„‰å¿«åœ°å­¦ä¹ ?„ç§è¯????,
  },
};

// SEOë¥??„í•œ ë©”í??°ì´???¤ì •
const seoMetadata = {
  // ?ˆí˜?´ì? ë©”í??°ì´??  home: {
    ko: {
      title: "LikeVoca - " + commonTexts.ko.language_learning,
      description: commonTexts.ko.language_learning_desc,
      keywords:
        "?¸ì–´ ?™ìŠµ, ?¤êµ­?? ?¨ì–´?? AI ?¨ì–´?? ?ì–´, ?¼ë³¸?? ì¤‘êµ­?? ?œêµ­??,
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
        "èªå?å­?¿’, å¤šè?èª? ?˜èªå¸? AI?˜èªå¸? ?±èª, ?¥æœ¬èª? ä¸?›½èª? ?“å›½èª?,
      canonical: "https://likevoca.com/ja",
    },
    zh: {
      title: "LikeVoca - " + commonTexts.zh.language_learning,
      description: commonTexts.zh.language_learning_desc,
      keywords: "è¯??å­¦ä¹ , å¤šè?è¨€, ?•è¯?? AI?•è¯?? ?±è?, ?¥è?, ä¸?–‡, ?©è?",
      canonical: "https://likevoca.com/zh",
    },
  },
  // ?¤êµ­???¨ì–´???˜ì´ì§€ ë©”í??°ì´??  dictionary: {
    ko: {
      title: "LikeVoca - ?¤êµ­???¨ì–´??,
      description: "?˜ë§Œ???¤êµ­???¨ì–´?¥ì„ ë§Œë“¤ê³??¨ê³¼?ìœ¼ë¡??™ìŠµ?˜ì„¸??",
      keywords:
        "?¤êµ­???¨ì–´?? ?ì–´ ?¨ì–´?? ?¼ë³¸???¨ì–´?? ì¤‘êµ­???¨ì–´?? ?¸ì–´ ?™ìŠµ",
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
      title: "LikeVoca - å¤šè?èªè¾??,
      description: "?ªåˆ†? ã‘??¤šè¨€èªè¾?¸ã‚’ä½œæˆ?—ã€åŠ¹?œçš„?«å?ç¿’ã—?¾ã—?‡ã†??,
      keywords: "å¤šè?èªè¾?? ?±èªè¾æ›¸, ?¥æœ¬èªè¾?? ä¸?›½èªè¾?? è¨€èªå?ç¿?,
      canonical: "https://likevoca.com/ja/pages/multilingual-dictionary.html",
    },
    zh: {
      title: "LikeVoca - å¤šè?è¨€è¯å…¸",
      description: "?›å»º?¨è‡ªå·±çš„å¤šè?è¨€è¯å…¸å¹¶æœ‰?ˆå?ä¹ ã€?,
      keywords: "å¤šè?è¨€è¯å…¸, ?±è?è¯å…¸, ?¥è?è¯å…¸, ä¸?–‡è¯å…¸, è¯??å­¦ä¹ ",
      canonical: "https://likevoca.com/zh/pages/multilingual-dictionary.html",
    },
  },
  // ?¤êµ­???™ìŠµ ?˜ì´ì§€ ë©”í??°ì´??  learning: {
    ko: {
      title: "LikeVoca - " + commonTexts.ko.language_learning,
      description: commonTexts.ko.language_learning_desc,
      keywords:
        "?¤êµ­???™ìŠµ, ?¸ì–´ ?™ìŠµ, ?Œë˜?œì¹´?? ?´ì¦ˆ, ?ì–´, ?¼ë³¸?? ì¤‘êµ­?? ?œêµ­??,
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
        "å¤šè?èªå?ç¿? è¨€èªå?ç¿? ?•ãƒ©?ƒã‚·?¥ã‚«?¼ãƒ‰, ??‚¤?? ?±èª, ?¥æœ¬èª? ä¸?›½èª? ?“å›½èª?,
      canonical: "https://likevoca.com/ja/pages/language-learning.html",
    },
    zh: {
      title: "LikeVoca - " + commonTexts.zh.language_learning,
      description: commonTexts.zh.language_learning_desc,
      keywords: "å¤šè?è¨€å­¦ä¹ , è¯??å­¦ä¹ , ?ªå¡, æµ‹éªŒ, ?±è?, ?¥è?, ä¸?–‡, ?©è?",
      canonical: "https://likevoca.com/zh/pages/language-learning.html",
    },
  },
  // ?¤êµ­??ê²Œì„ ?˜ì´ì§€ ë©”í??°ì´??  games: {
    ko: {
      title: "LikeVoca - ?¤êµ­??ê²Œì„",
      description: "?¬ë??ˆëŠ” ê²Œì„???µí•´ ?¤ì–‘???¸ì–´ë¥?ì¦ê²ê²?ë°°ì›Œë³´ì„¸??",
      keywords:
        "?¸ì–´ ê²Œì„, ?¤êµ­??ê²Œì„, ?¨ì–´ ê²Œì„, ?¸ì–´ ?™ìŠµ ê²Œì„, ?ì–´, ?¼ë³¸?? ì¤‘êµ­?? ?œêµ­??,
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
      title: "LikeVoca - å¤šè?èªã‚²?¼ãƒ ",
      description: "æ¥½ã—?„ã‚²?¼ãƒ ?’é€šã—??§˜?…ãªè¨€èªã‚’æ¥½ã—?å??³ã¾?—ã‚‡?†ã€?,
      keywords:
        "è¨€èªã‚²?¼ãƒ , å¤šè?èªã‚²?¼ãƒ , ?˜èª?²ãƒ¼?? è¨€èªå?ç¿’ã‚²?¼ãƒ , ?±èª, ?¥æœ¬èª? ä¸?›½èª? ?“å›½èª?,
      canonical: "https://likevoca.com/ja/pages/games.html",
    },
    zh: {
      title: "LikeVoca - å¤šè?è¨€æ¸¸æˆ",
      description: "?šè¿‡?‰è¶£?„æ¸¸?æ„‰å¿«åœ°å­¦ä¹ ?„ç§è¯????,
      keywords:
        "è¯??æ¸¸æˆ, å¤šè?è¨€æ¸¸æˆ, ?•è¯æ¸¸æˆ, è¯??å­¦ä¹ æ¸¸æˆ, ?±è?, ?¥è?, ä¸?–‡, ?©è?",
      canonical: "https://likevoca.com/zh/pages/games.html",
    },
  },
  // AI ?¨ì–´???˜ì´ì§€ ë©”í??°ì´??  "ai-vocabulary": {
    ko: {
      title: "LikeVoca - AI ?¨ì–´??,
      description:
        "AIê°€ ì¶”ì²œ?˜ëŠ” ?¤êµ­???¨ì–´?¥ì„ ë§Œë“¤ê³??¨ê³¼?ìœ¼ë¡??™ìŠµ?˜ì„¸??",
      keywords:
        "AI ?¨ì–´?? ?¤êµ­???¨ì–´?? ?ì–´ ?¨ì–´?? ?¼ë³¸???¨ì–´?? ì¤‘êµ­???¨ì–´?? AI ?¸ì–´ ?™ìŠµ",
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
      title: "LikeVoca - AI?˜èªå¸?,
      description: "AI?Œæ¨?¦ã™?‹å¤šè¨€èªå˜èªå¸³?’ä½œ?ã—?åŠ¹?œçš„?«å?ç¿’ã—?¾ã—?‡ã†??,
      keywords:
        "AI?˜èªå¸? å¤šè?èªå˜èªå¸³, ?±èª?˜èªå¸? ?¥æœ¬èªå˜èªå¸³, ä¸?›½èªå˜èªå¸³, AIè¨€èªå?ç¿?,
      canonical: "https://likevoca.com/ja/pages/ai-vocabulary.html",
    },
    zh: {
      title: "LikeVoca - AIè¯æ±‡??,
      description: "?›å»ºAI?¨è?„å¤šè¯??è¯æ±‡?¬å¹¶?‰æ•ˆå­¦ä¹ ??,
      keywords:
        "AIè¯æ±‡?? å¤šè?è¨€è¯æ±‡?? ?±è?è¯æ±‡?? ?¥è?è¯æ±‡?? ä¸?–‡è¯æ±‡?? AIè¯??å­¦ä¹ ",
      canonical: "https://likevoca.com/zh/pages/ai-vocabulary.html",
    },
  },
  // ?˜ë§Œ???¨ì–´???˜ì´ì§€ ë©”í??°ì´??  "my-vocabulary": {
    ko: {
      title: "LikeVoca - ?˜ë§Œ???¨ì–´??,
      description:
        "ë¶ë§ˆ?¬í•œ ?¨ì–´?¤ì„ ëª¨ì•„???˜ë§Œ???¨ì–´?¥ì„ ë§Œë“¤ê³??¨ê³¼?ìœ¼ë¡??™ìŠµ?˜ì„¸??",
      keywords:
        "?˜ë§Œ???¨ì–´?? ë¶ë§ˆ???¨ì–´?? ?¤êµ­???¨ì–´?? ê°œì¸ ?¨ì–´?? ?¸ì–´ ?™ìŠµ",
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
      title: "LikeVoca - ç§ã®?˜èªå¸?,
      description:
        "?–ãƒƒ??ƒ?¼ã‚¯?—ãŸ?˜èª?’é›†?ã¦?ªåˆ†? ã‘??˜èªå¸³?’ä½œ?ã—?åŠ¹?œçš„?«å?ç¿’ã—?¾ã—?‡ã†??,
      keywords:
        "ç§ã®?˜èªå¸? ?–ãƒƒ??ƒ?¼ã‚¯?˜èªå¸? å¤šè?èªå˜èªå¸³, ?‹äºº?˜èªå¸? è¨€èªå?ç¿?,
      canonical: "https://likevoca.com/ja/pages/my-word-list.html",
    },
    zh: {
      title: "LikeVoca - ?‘çš„è¯æ±‡??,
      description: "?¶é›†?¨æ”¶?çš„?•è¯ï¼Œåˆ›å»ºæ‚¨?ªå·±?„è¯æ±‡æœ¬å¹¶æœ‰?ˆå?ä¹ ã€?,
      keywords: "?‘çš„è¯æ±‡?? ?¶è—è¯æ±‡?? å¤šè?è¨€è¯æ±‡?? ä¸ªäººè¯æ±‡?? è¯??å­¦ä¹ ",
      canonical: "https://likevoca.com/zh/pages/my-word-list.html",
    },
  },
};

// ë²ˆì—­ ?ìŠ¤???€?¥ì†Œ
const translations = {
  ko: {
    home: "??,
    wordbook: "?¨ì–´??,
    vocabulary: "?¨ì–´??,
    multilingual_dictionary: "?¤êµ­???¨ì–´??,
    ai_wordbook: "AI ?¨ì–´??,
    ai_vocabulary: "AI ?¨ì–´??,
    language_learning: commonTexts.ko.language_learning,
    language_learning_desc: commonTexts.ko.language_learning_desc,
    language_games: commonTexts.ko.language_games,
    language_games_desc: commonTexts.ko.language_games_desc,
    inquiry: "ë¬¸ì˜?˜ê¸°",
    login: "ë¡œê·¸??,
    signup: "?Œì›ê°€??,
    logout: "ë¡œê·¸?„ì›ƒ",
    profile: "?„ë¡œ??,
    delete_account: "?Œì›?ˆí‡´",
    welcome: "?˜ì˜?©ë‹ˆ??,
    user_suffix: "??,
    get_started_free: "ë¬´ë£Œë¡??œì‘?˜ê¸°",
    learn_languages: "?¤ì–‘???¸ì–´ë¥??½ê³  ?¬ë??ˆê²Œ ë°°ì›Œë³´ì„¸??,
    effective_learning:
      "ì²´ê³„?ì¸ ì»¤ë¦¬?˜ëŸ¼ê³?ì§ê??ì¸ ?™ìŠµ ?œìŠ¤?œìœ¼ë¡??¹ì‹ ???¸ì–´ ?™ìŠµ???”ìš± ?¨ê³¼?ìœ¼ë¡?ë§Œë“¤?´ë“œë¦½ë‹ˆ??",
    wordbook_desc:
      "?™ìŠµ???¨ì–´ë¥??…ë ¥?˜ê³  ?˜ë§Œ???¤êµ­???¨ì–´?¥ì„ ë§Œë“¤?´ë³´?¸ìš”.",
    ai_wordbook_desc:
      "Google Gemini AIë¡?ë§ì¶¤ ?¨ì–´ë¥?ì¶”ì²œë°›ê³ , ?¸ì–´ ?¤ë ¥???¤ìš°?¸ìš”.",
    ai_vocabulary_desc:
      "AIê°€ ì¶”ì²œ?˜ëŠ” ?¤êµ­??ê°œë…???™ìŠµ?˜ê³  ?¸ì–´ ?¤ë ¥???¥ìƒ?œí‚¤?¸ìš”.",
    inquiry_desc: "ê¶ê¸ˆ???ì´ ?ˆê±°???„ì????„ìš”?˜ì‹œë©??¸ì œ? ì? ë¬¸ì˜?˜ì„¸??",
    start: "?œì‘?˜ê¸°",
    language_settings: "?¸ì–´ ?¤ì •",
    save: "?€??,
    cancel: "ì·¨ì†Œ",
    total_concepts: "?„ì²´ ê°œë… ??,
    concepts_unit: "ê°?,
    ai_usage: "AI ?¬ìš©??,
    ai_recommend_concept: "AI ê°œë… ì¶”ì²œë°›ê¸°",
    // ëª¨ë‹¬ ê´€??ë²ˆì—­
    add_concept: "ê°œë… ì¶”ê?",
    edit_concept: "ê°œë… ?˜ì •",
    domain: "?„ë©”??,
    select_domain: "?„ë©”??? íƒ",
    category: "ì¹´í…Œê³ ë¦¬",
    category_placeholder: "?? fruit, animal",
    emoji: "?´ëª¨ì§€",
    language_expressions: "?¸ì–´ë³??œí˜„",
    word: "?¨ì–´",
    pronunciation: "ë°œìŒ",
    definition: "?•ì˜",
    part_of_speech: "?ˆì‚¬",
    select_pos: "?ˆì‚¬ ? íƒ",
    // ?ˆì‚¬ ë²ˆì—­
    noun: "ëª…ì‚¬",
    verb: "?™ì‚¬",
    adjective: "?•ìš©??,
    adverb: "ë¶€??,
    pronoun: "?€ëª…ì‚¬",
    preposition: "?„ì¹˜??,
    conjunction: "?‘ì†??,
    interjection: "ê°íƒ„??,
    particle: "ì¡°ì‚¬",
    determiner: "?œì •??,
    classifier: "ë¶„ë¥˜??,
    other: "ê¸°í?",
    // ?¸ì–´?™ì  ?©ì–´ ë²ˆì—­
    synonyms: "? ì‚¬??(?¼í‘œë¡?êµ¬ë¶„)",
    antonyms: "ë°˜ì˜??(?¼í‘œë¡?êµ¬ë¶„)",
    collocations: "?°ì–´ (?¼í‘œë¡?êµ¬ë¶„)",
    compound_words: "ë³µí•©??(?¼í‘œë¡?êµ¬ë¶„)",
    examples: "?ˆë¬¸",
    add_example: "?ˆë¬¸ ì¶”ê?",
    representative_example: "?€???ˆë¬¸",
    korean_example: "?œêµ­???ˆë¬¸",
    english_example: "?ì–´ ?ˆë¬¸",
    japanese_example: "?¼ë³¸???ˆë¬¸",
    chinese_example: "ì¤‘êµ­???ˆë¬¸",
    tags: "?œê·¸ (?¼í‘œë¡?êµ¬ë¶„)",
    // ?„ë©”??ë²ˆì—­
    academic: "?™ìˆ ",
    technology: "ê¸°ìˆ ",
    health: "ê±´ê°•",
    sports: "?¤í¬ì¸?,
    entertainment: "?”í„°?Œì¸ë¨¼íŠ¸",
    // ?„ë©”???„í„° ë²ˆì—­
    domain_filter: "?„ë©”??,
    all_domains: "?„ì²´ ?„ë©”??,
    domain_daily: "?¼ìƒ",
    domain_business: "ë¹„ì¦ˆ?ˆìŠ¤",
    domain_academic: "?™ìˆ ",
    domain_travel: "?¬í–‰",
    domain_food: "?Œì‹",
    domain_nature: "?ì—°",
    domain_technology: "ê¸°ìˆ ",
    domain_health: "ê±´ê°•",
    domain_sports: "?¤í¬ì¸?,
    domain_entertainment: "?”í„°?Œì¸ë¨¼íŠ¸",
    domain_other: "ê¸°í?",
    // ë¡œê·¸???˜ì´ì§€ ë²ˆì—­
    login_with_google: "Googleë¡?ë¡œê·¸??,
    login_with_github: "Githubë¡?ë¡œê·¸??,
    or: "?ëŠ”",
    email: "?´ë©”??,
    email_placeholder: "?´ë©”?¼ì„ ?…ë ¥?˜ì„¸??,
    password: "ë¹„ë?ë²ˆí˜¸",
    password_placeholder: "ë¹„ë?ë²ˆí˜¸ë¥??…ë ¥?˜ì„¸??,
    auto_login: "?ë™ ë¡œê·¸??,
    forgot_password: "ë¹„ë?ë²ˆí˜¸ë¥??Šìœ¼?¨ë‚˜??",
    no_account: "ê³„ì •???†ìœ¼? ê???",
    // ?Œì›ê°€???˜ì´ì§€ ë²ˆì—­
    create_account: "ê³„ì • ë§Œë“¤ê¸?,
    name: "?´ë¦„",
    name_placeholder: "?´ë¦„???…ë ¥?˜ì„¸??,
    confirm_password: "ë¹„ë?ë²ˆí˜¸ ?•ì¸",
    confirm_password_placeholder: "ë¹„ë?ë²ˆí˜¸ë¥??¤ì‹œ ?…ë ¥?˜ì„¸??,
    agree_terms: "?´ìš©?½ê????™ì˜?©ë‹ˆ??,
    already_account: "?´ë? ê³„ì •???ˆìœ¼? ê???",
    // ë¬¸ì˜ ?˜ì´ì§€ ë²ˆì—­
    contact_us: "ë¬¸ì˜?˜ê¸°",
    subject: "?œëª©",
    subject_placeholder: "ë¬¸ì˜ ?œëª©???…ë ¥?˜ì„¸??,
    message: "ë©”ì‹œì§€",
    message_placeholder: "ë¬¸ì˜ ?´ìš©???…ë ¥?˜ì„¸??,
    send: "ë³´ë‚´ê¸?,
    // ?¤êµ­???¨ì–´???˜ì´ì§€ ë²ˆì—­
    search: "ê²€??,
    search_placeholder: "ê²€?‰ì–´ ?…ë ¥...",
    source_language: "?ë³¸ ?¸ì–´",
    target_language: "?€???¸ì–´",
    all_categories: "ëª¨ë“  ì¹´í…Œê³ ë¦¬",
    fruit: "ê³¼ì¼",
    food: "?Œì‹",
    animal: "?™ë¬¼",
    daily: "?¼ìƒ",
    travel: "?¬í–‰",
    business: "ë¹„ì¦ˆ?ˆìŠ¤",
    concept_count: "ê°œì˜ ê°œë…",
    sort: "?•ë ¬",
    latest: "ìµœì‹ ??,
    oldest: "?¤ë˜?œìˆœ",
    alphabetical: "ê°€?˜ë‹¤??,
    reverse_alphabetical: "????˜ë‹¤??,
    concept_usage: "ê°œë… ?¬ìš©??,
    add_new_concept: "??ê°œë… ì¶”ê?",
    bulk_add_concept: "?€??ê°œë… ì¶”ê?",
    load_more: "??ë³´ê¸°",
    korean: "?œêµ­??,
    english: "?ì–´",
    japanese: "?¼ë³¸??,
    chinese: "ì¤‘êµ­??,
    // ?¤êµ­???™ìŠµ ?˜ì´ì§€ ë²ˆì—­
    language_learning_title: "?¤êµ­???™ìŠµ",
    select_source_language: "?ë³¸ ?¸ì–´ ? íƒ",
    select_target_language: "?€???¸ì–´ ? íƒ",
    learning_mode: "?™ìŠµ ëª¨ë“œ",
    flashcards: "?Œë˜?œì¹´??,
    flashcards_desc: "?¨ì–´ ?ë©´/?·ë©´?¼ë¡œ ?™ìŠµ",
    quiz: "?´ì¦ˆ",
    quiz_desc: "ê°ê???ë¬¸ì œë¡??™ìŠµ",
    typing: "?€?´í•‘",
    typing_desc: "ì§ì ‘ ?…ë ¥?˜ì—¬ ?™ìŠµ",
    previous: "?´ì „",
    flip: "?¤ì§‘ê¸?,
    next: "?¤ìŒ",
    examples: "?ˆë¬¸:",
    card_progress: "ì§„í–‰ë¥?,
    quiz_question: "ë¬¸ì œ",
    next_question: "?¤ìŒ ë¬¸ì œ",
    quiz_progress: "ì§„í–‰ë¥?,
    typing_prompt: "?•ë‹µ???…ë ¥?˜ì„¸??",
    typing_placeholder: "?•ë‹µ ?…ë ¥...",
    check_answer: "?•ë‹µ ?•ì¸",
    next_word: "?¤ìŒ ?¨ì–´",
    typing_progress: "ì§„í–‰ë¥?,
    correct_count: "ë§ì¶˜ ê°œìˆ˜:",
    wrong_count: "?€ë¦?ê°œìˆ˜:",
    // ?¨ì–´???ì„¸ë³´ê¸° ëª¨ë‹¬ ë²ˆì—­
    concept_detail_view: "ê°œë… ?ì„¸ ë³´ê¸°",
    expressions_by_language: "?¸ì–´ë³??œí˜„",
    close: "?«ê¸°",
    delete: "?? œ",
    edit: "?¸ì§‘",
    confirm_delete_concept: "?•ë§ë¡???ê°œë…???? œ?˜ì‹œê² ìŠµ?ˆê¹Œ?",
    concept_deleted_success: "ê°œë…???±ê³µ?ìœ¼ë¡??? œ?˜ì—ˆ?µë‹ˆ??",
    concept_delete_error: "ê°œë… ?? œ ì¤??¤ë¥˜ê°€ ë°œìƒ?ˆìŠµ?ˆë‹¤",
    registration_time: "?±ë¡ ?œê°„",
    // ê°œë… ì¶”ê? ëª¨ë‹¬ ë²ˆì—­
    domain: "?„ë©”??,
    domain_placeholder: "?? daily, food, business",
    emoji: "?´ëª¨ì§€",
    emoji_placeholder: "?? ?, ?š†, ?‘‹",
    reset: "ì´ˆê¸°??,
    add: "ì¶”ê??˜ê¸°",
    add_example: "?ˆë¬¸ ì¶”ê?",
    add_new_language: "???¸ì–´ ì¶”ê?",
    language_name_ko: "?¸ì–´ ?´ë¦„ (?œêµ­??",
    language_name_ko_placeholder: "?? ?¤í˜?¸ì–´, ?„ë‘?¤ì–´",
    language_code: "?¸ì–´ ì½”ë“œ",
    language_code_placeholder: "?? spanish, french",
    example_word: "?ˆì‹œ ?¨ì–´",
    example_word_placeholder: "?? manzana, pomme",
    cancel: "ì·¨ì†Œ",
    // ê²Œì„ ë²ˆì—­
    games: "ê²Œì„",
    games_desc: "?¬ë??ˆëŠ” ê²Œì„???µí•´ ?¤ì–‘???¸ì–´ë¥?ì¦ê²ê²?ë°°ì›Œë³´ì„¸??",
    learning_title: "?™ìŠµ",
    source_language: "?ë³¸ ?¸ì–´",
    target_language: "?€???¸ì–´",
    learning_title_desc: "ì²´ê³„?ì¸ ?™ìŠµ???µí•´ ?¸ì–´ ?¤ë ¥???¥ìƒ?œí‚¤?¸ìš”.",
    // ë¬¸ë²• ë°??™ìŠµ ì§„ë„ ?˜ì´ì§€ ë²ˆì—­
    grammar_progress: "ë¬¸ë²• ë°??™ìŠµ ì§„ë„",
    grammar_progress_title: "ë¬¸ë²• ë°??™ìŠµ ì§„ë„",
    grammar_progress_subtitle: "?™ìŠµ ?±ê³¼?€ ë¬¸ë²• ?¨í„´ ë¶„ì„???•ì¸?˜ì„¸??,
    total_concepts: "ì´?ê°œë… ??,
    concepts_breakdown: "ì¹´í…Œê³ ë¦¬ë³?ë¶„í¬",
    progress: "ì§„ë„",
    progress_title: "ì§„ë„",
    learning_progress: "?™ìŠµ ì§„ë„",
    learning_progress_title: "?™ìŠµ ì§„ë„",
    learning_progress_subtitle: "ê°œì¸ ?™ìŠµ ?±ê³¼?€ ì§„ë„ë¥?ì¶”ì ?˜ê³  ë¶„ì„?˜ì„¸??,

    // ?™ìŠµ ?˜ì´ì§€ ë²ˆì—­
    learning_areas: "?™ìŠµ ?ì—­",
    learning_dashboard: "?™ìŠµ ?€?œë³´??,
    continue_learning: "?™ìŠµ ?´ì–´?˜ê¸°",
    vocabulary_learning: "?¨ì–´ ?™ìŠµ",
    vocabulary_learning_desc: "?´íœ˜???¥ìƒ???„í•œ ?Œë˜?œì¹´?œì? ?€?´í•‘ ?™ìŠµ",
    vocabulary_modes: "?Œë˜?œì¹´?????€?´í•‘ ??ë°œìŒ ?°ìŠµ",
    grammar_learning: "ë¬¸ë²• ?™ìŠµ",
    grammar_learning_desc: "ì²´ê³„?ì¸ ë¬¸ë²• ?¨í„´ ë¶„ì„ê³??¤ìŠµ ?™ìŠµ",
    grammar_modes: "ë¬¸ë²• ?¨í„´ ???ˆë¬¸ ë¶„ì„ ???¤ìŠµ ë¬¸ì œ",
    reading_learning: "?…í•´ ?™ìŠµ",
    reading_learning_desc: "?¤ì–‘???ˆë¬¸???µí•œ ?½ê¸° ?´í•´???¥ìƒ",
    reading_modes: "?ˆë¬¸ ?™ìŠµ ???Œë˜??ëª¨ë“œ",
    quiz_test: "?´ì¦ˆ ?ŒìŠ¤??,

    // ?µí•© ?™ìŠµ ëª¨ë“œ ë²ˆì—­
    flashcard_mode: "?Œë˜?œì¹´??,
    flashcard_quick_desc: "ì¹´ë“œ ?¤ì§‘ê¸??™ìŠµ",
    typing_mode: "?€?´í•‘",
    typing_quick_desc: "ì§ì ‘ ?…ë ¥ ?™ìŠµ",
    pronunciation_mode: "ë°œìŒ ?°ìŠµ",
    pronunciation_quick_desc: "?Œì„± ?¸ì‹ ?™ìŠµ",
    pattern_analysis_mode: "?¨í„´ ë¶„ì„",
    pattern_quick_desc: "ë¬¸ë²• êµ¬ì¡° ?™ìŠµ",
    practice_mode: "?¤ìŠµ ë¬¸ì œ",
    practice_quick_desc: "ë¬¸ë²• ?ìš© ?°ìŠµ",
    example_learning_mode: "?ˆë¬¸ ?™ìŠµ",
    example_quick_desc: "ë¬¸ë§¥ ?´í•´ ?™ìŠµ",
    flash_mode: "?Œë˜??ëª¨ë“œ",
    flash_quick_desc: "ë¹ ë¥¸ ?…í•´ ?°ìŠµ",

    // ?™ìŠµ ?¹ì§• ?¤ëª…
    vocabulary_flashcard_features: "?œê°???™ìŠµ ??ì¦‰ì‹œ ?¼ë“œë°?,
    vocabulary_typing_features: "?•í™•??ì² ì ??ê¸°ì–µ??ê°•í™”",
    vocabulary_pronunciation_features: "?•í™•??ë°œìŒ ???£ê¸° ?¥ìƒ",
    grammar_pattern_features: "ì²´ê³„??ë¶„ì„ ??êµ¬ì¡° ?´í•´",
    grammar_practice_features: "?¤ì „ ?°ìŠµ ???‘ìš© ?¥ë ¥",
    reading_example_features: "ë¬¸ë§¥ ?Œì•… ???´í•´???¥ìƒ",
    reading_flash_features: "?ë… ?°ìŠµ ??ì§‘ì¤‘???¥ìƒ",

    // ?™ìŠµ ?µê³„ ë°?ì¶”ì²œ
    estimated_time: "?ˆìƒ ?œê°„",
    recent_activity: "ìµœê·¼ ?œë™",
    no_recent_activity: "ìµœê·¼ ?™ìŠµ ê¸°ë¡???†ìŠµ?ˆë‹¤",
    recommended_mode: "ì¶”ì²œ ?™ìŠµ",
    vocabulary_flashcard_recommended: "?¨ì–´ ?Œë˜?œì¹´??ì¶”ì²œ",
    learning_streak: "?™ìŠµ ?°ì†??,
    days: "??,

    // ?™ìŠµ ëª¨ë“œ ë²ˆì—­
    learning_modes: "?™ìŠµ ëª¨ë“œ",
    back_to_areas: "?ì—­ ? íƒ?¼ë¡œ ?Œì•„ê°€ê¸?,
    pattern_analysis: "?¨í„´ ë¶„ì„",
    pattern_analysis_desc: "ë¬¸ë²• êµ¬ì¡°?€ ?¨í„´??ì²´ê³„?ìœ¼ë¡??™ìŠµ",
    example_practice: "?ˆë¬¸ ?¤ìŠµ",
    example_practice_desc: "?Œë˜?œì¹´??ë°©ì‹?¼ë¡œ ë¬¸ë²• ?¨í„´ ?°ìŠµ",
    general_example_learning: "?¼ë°˜ ?ˆë¬¸ ?™ìŠµ",
    general_example_learning_desc: "?¤ì–‘???ˆë¬¸???µí•œ ?…í•´ ?¥ë ¥ ?¥ìƒ",
    flash_mode: "?Œë˜??ëª¨ë“œ",
    flash_mode_desc: "ë¹ ë¥¸ ?ë„ë¡??ˆë¬¸???™ìŠµ?˜ëŠ” ì§‘ì¤‘ ëª¨ë“œ",

    // ?„í„° ë°??¤ì • ë²ˆì—­
    difficulty_level: "?œì´??,
    all_difficulties: "?„ì²´ ?œì´??,
    basic: "ê¸°ì´ˆ",
    intermediate: "ì¤‘ê¸‰",
    advanced: "ê³ ê¸‰",
    fluent: "? ì°½",
    technical: "?„ë¬¸?©ì–´",
    pattern_type: "?¨í„´ ? í˜•",
    all_patterns: "?„ì²´ ?¨í„´",
    grammar_pattern: "ë¬¸ë²• ?¨í„´",
    syntax_structure: "ë¬¸ì¥ êµ¬ì¡°",
    expression_pattern: "?œí˜„ ?¨í„´",
    conversation_pattern: "?Œí™” ?¨í„´",
    situation: "?í™©",
    all_situation: "?„ì²´ ?í™©",
    purpose: "ëª©ì ",
    all_purpose: "?„ì²´ ëª©ì ",

    // ?í™© ?œê·¸ ë²ˆì—­
    formal: "ê²©ì‹",
    casual: "ë¹„ê²©??,
    urgent: "ê¸´ê¸‰??,
    work: "ì§ì¥",
    school: "?™êµ",
    social: "?¬êµ",
    shopping: "?¼í•‘",
    home: "ê°€??,
    public: "ê³µê³µ?¥ì†Œ",
    online: "?¨ë¼??,
    medical: "?˜ë£Œ",

    // ëª©ì  ?œê·¸ ë²ˆì—­
    greeting: "?¸ì‚¬",
    thanking: "ê°ì‚¬",
    request: "?”ì²­",
    question: "ì§ˆë¬¸",
    opinion: "?˜ê²¬",
    agreement: "?™ì˜",
    refusal: "ê±°ì ˆ",
    apology: "?¬ê³¼",
    instruction: "ì§€??,
    description: "?¤ëª…",
    suggestion: "?œì•ˆ",
    emotion: "ê°ì •?œí˜„",

    learning_streak: "?™ìŠµ ?¤íŠ¸ë¦?,
    learning_goals: "?™ìŠµ ëª©í‘œ",
    quiz_performance: "?´ì¦ˆ ?±ê³¼",
    game_performance: "ê²Œì„ ?±ê³¼",
    language_progress: "?¸ì–´ë³??™ìŠµ ì§„ë„",
    category_distribution: "ì¹´í…Œê³ ë¦¬ë³?ë¶„í¬",
    grammar: "ë¬¸ë²• ?¨í„´ ë¶„ì„",
    recent_activity: "ìµœê·¼ ?™ìŠµ ?œë™",
    refresh: "?ˆë¡œê³ ì¹¨",
    export: "?´ë³´?´ê¸°",
    attempts: "?œë„",
    correct: "?•ë‹µ",
    games_played: "ê²Œì„",
    wins: "?¹ë¦¬",
    loading: "ë¡œë”© ì¤?..",
    select_category: "ì¹´í…Œê³ ë¦¬ ? íƒ",
    select_emoji: "?´ëª¨ì§€ ? íƒ",
    emoji: "?´ëª¨ì§€",

    // ?¼ìƒ ?„ë©”??ì¹´í…Œê³ ë¦¬
    household: "?í™œ?©í’ˆ",
    family: "ê°€ì¡?,
    routine: "?¼ìƒ?í™œ",
    clothing: "?˜ë¥˜",
    furniture: "ê°€êµ?,

    // ?Œì‹ ?„ë©”??ì¹´í…Œê³ ë¦¬
    fruit: "ê³¼ì¼",
    vegetable: "ì±„ì†Œ",
    meat: "?¡ë¥˜",
    drink: "?Œë£Œ",
    snack: "ê°„ì‹",

    // ?¬í–‰ ?„ë©”??ì¹´í…Œê³ ë¦¬
    transportation: "êµí†µ?˜ë‹¨",
    accommodation: "?™ë°•",
    tourist_attraction: "ê´€ê´‘ì?",
    luggage: "ì§?,
    direction: "ê¸¸ì°¾ê¸?,

    // ë¹„ì¦ˆ?ˆìŠ¤ ?„ë©”??ì¹´í…Œê³ ë¦¬
    meeting: "?Œì˜",
    finance: "ê¸ˆìœµ",
    marketing: "ë§ˆì???,
    office: "?¬ë¬´??,
    project: "?„ë¡œ?íŠ¸",

    // ?™ìˆ  ?„ë©”??ì¹´í…Œê³ ë¦¬
    science: "ê³¼í•™",
    literature: "ë¬¸í•™",
    history: "??‚¬",
    mathematics: "?˜í•™",
    research: "?°êµ¬",

    // ?ì—° ?„ë©”??ì¹´í…Œê³ ë¦¬
    animal: "?™ë¬¼",
    plant: "?ë¬¼",
    weather: "? ì”¨",
    geography: "ì§€ë¦?,
    environment: "?˜ê²½",

    // ê¸°ìˆ  ?„ë©”??ì¹´í…Œê³ ë¦¬
    computer: "ì»´í“¨??,
    software: "?Œí”„?¸ì›¨??,
    internet: "?¸í„°??,
    mobile: "ëª¨ë°”??,
    ai: "?¸ê³µì§€??,

    // ê±´ê°• ?„ë©”??ì¹´í…Œê³ ë¦¬
    exercise: "?´ë™",
    medicine: "?˜í•™",
    nutrition: "?ì–‘",
    mental_health: "?•ì‹ ê±´ê°•",
    hospital: "ë³‘ì›",

    // ?¤í¬ì¸??„ë©”??ì¹´í…Œê³ ë¦¬
    football: "ì¶•êµ¬",
    basketball: "?êµ¬",
    swimming: "?˜ì˜",
    running: "?¬ë¦¬ê¸?,
    equipment: "?´ë™ê¸°êµ¬",

    // ?”í„°?Œì¸ë¨¼íŠ¸ ?„ë©”??ì¹´í…Œê³ ë¦¬
    movie: "?í™”",
    music: "?Œì•…",
    game: "ê²Œì„",
    book: "?„ì„œ",
    art: "?ˆìˆ ",

    // My Vocabulary page translations
    my_vocabulary_title: "?˜ë§Œ???¨ì–´??,
    bookmarked_word_count: "ë¶ë§ˆ?¬í•œ ?¨ì–´ ??",
    word_count_unit: "ê°?,
    bookmark_usage: "ë¶ë§ˆ???¬ìš©??,
    unlimited: "ë¬´ì œ??,
    bookmark_words: "?¨ì–´ ë¶ë§ˆ?¬í•˜ê¸?,
    hangul: "?œê?",
    meaning: "??,
    pronunciation: "ë°œìŒ",
    description: "?¤ëª…",
    search_placeholder: "ê²€?‰ì–´ë¥??…ë ¥?˜ì„¸??,
    load_more: "??ë³´ê¸°",
    no_bookmarks_title: "ë¶ë§ˆ?¬í•œ ?¨ì–´ê°€ ?†ìŠµ?ˆë‹¤",
    no_bookmarks_desc: "?¤êµ­???¨ì–´?¥ì—??ê´€?¬ìˆ???¨ì–´?¤ì„ ë¶ë§ˆ?¬í•´ë³´ì„¸??",
    browse_words: "?¨ì–´ ?˜ëŸ¬ë³´ê¸°",
    bookmarked: "ë¶ë§ˆ?¬ë¨",
    no_date: "? ì§œ ?†ìŒ",
    login_required: "ë¡œê·¸?¸ì´ ?„ìš”?©ë‹ˆ??",
    error_loading_bookmarks: "ë¶ë§ˆ?¬ëœ ê°œë… ë¡œë“œ ?¤ë¥˜:",
    concept_detail_view: "ê°œë… ?ì„¸ ë³´ê¸°:",
    expressions: "?œí˜„",
    examples: "?ˆë¬¸",

    // ?™ìŠµ ëª¨ë“œ ì¹´ë“œ ë²ˆì—­
    flashcard_learning: "?ƒ ?Œë˜?œì¹´???™ìŠµ",
    typing_learning: "?¨ï¸ ?€?´í•‘ ?™ìŠµ",
    pronunciation_practice: "?¤ ë°œìŒ ?°ìŠµ",
    grammar_pattern_analysis: "?“ ë¬¸ë²• ?¨í„´ ë¶„ì„",
    grammar_practice: "?“š ë¬¸ë²• ?¤ìŠµ ?°ìŠµ",
    reading_learning: "?…í•´ ?™ìŠµ",

    // ?Œë˜?œì¹´??ëª¨ë“œ ë²ˆì—­
    click_to_check_meaning: "?´ë¦­?˜ì—¬ ?˜ë? ?•ì¸",
    click_to_see_word: "?¤ì‹œ ?´ë¦­?˜ì—¬ ?¨ì–´ ë³´ê¸°",
    back_to_dashboard: "?€?œë³´?œë¡œ",
    back: "?Œì•„ê°€ê¸?,

    // ?€?´í•‘ ëª¨ë“œ ë²ˆì—­
    typing_answer_placeholder: "?µì•ˆ???…ë ¥?˜ì„¸??,
    check: "?•ì¸",

    // ë°œìŒ ?°ìŠµ ëª¨ë“œ ë²ˆì—­
    pronunciation_coming_soon: "ë°œìŒ ?°ìŠµ ëª¨ë“œ??ì¤€ë¹?ì¤‘ì…?ˆë‹¤.",

    // ë¬¸ë²• ëª¨ë“œ ë²ˆì—­
    click_to_see_explanation: "?´ë¦­?˜ì—¬ ?¤ëª… ë³´ê¸°",

    // ?…í•´ ëª¨ë“œ ë²ˆì—­
    original_text: "?ë¬¸",
    translation: "ë²ˆì—­",
    context: "?í™©",

    // ê³µí†µ ë²„íŠ¼ ë²ˆì—­
    home: "?ˆìœ¼ë¡?,
    back_to_home: "?ˆìœ¼ë¡??Œì•„ê°€ê¸?,

    // ?°ì´???†ìŒ ë©”ì‹œì§€
    no_data: "?°ì´?°ê? ?†ìŠµ?ˆë‹¤",
    no_data_description:
      "?™ìŠµ???°ì´?°ê? ?†ìŠµ?ˆë‹¤. ë¨¼ì? ?°ì´?°ë? ?…ë¡œ?œí•´ì£¼ì„¸??",

    // ?…ë¡œ??ëª¨ë‹¬ ë²ˆì—­
    concept_upload: "ê°œë… ?…ë¡œ??,
    grammar_pattern_upload: "ë¬¸ë²• ?¨í„´ ?…ë¡œ??,
    example_upload: "?ˆë¬¸ ?…ë¡œ??,
    upload_csv_json_concept:
      "CSV ?ëŠ” JSON ?Œì¼???…ë¡œ?œí•˜??ê°œë…??ì¶”ê??˜ì„¸??",
    upload_csv_json_grammar:
      "CSV ?ëŠ” JSON ?Œì¼???…ë¡œ?œí•˜??ë¬¸ë²• ?¨í„´??ì¶”ê??˜ì„¸??",
    upload_csv_json_example:
      "CSV ?ëŠ” JSON ?Œì¼???…ë¡œ?œí•˜???ˆë¬¸??ì¶”ê??˜ì„¸??",
    upload: "?…ë¡œ??,
    download_template: "?œí”Œë¦??¤ìš´ë¡œë“œ",

    // ì¶”ì²œ ?™ìŠµ ê´€??ë²ˆì—­
    flashcard_recommended: "?Œë˜?œì¹´??,
    recommended: "ì¶”ì²œ",
    recommendation_reason: "ìµœê·¼ ?™ìŠµ ?¨í„´??ê¸°ë°˜?¼ë¡œ ì¶”ì²œ?©ë‹ˆ??,
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
    // ë¡œê·¸???˜ì´ì§€ ë²ˆì—­
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
    // ?Œì›ê°€???˜ì´ì§€ ë²ˆì—­
    create_account: "Create Account",
    name: "Name",
    name_placeholder: "Enter your name",
    confirm_password: "Confirm Password",
    confirm_password_placeholder: "Enter your password again",
    agree_terms: "I agree to the terms of service",
    already_account: "Already have an account?",
    // ë¬¸ì˜ ?˜ì´ì§€ ë²ˆì—­
    contact_us: "Contact Us",
    subject: "Subject",
    subject_placeholder: "Enter subject",
    message: "Message",
    message_placeholder: "Enter your message",
    send: "Send",
    // ?¤êµ­???¨ì–´???˜ì´ì§€ ë²ˆì—­
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
    // ?¤êµ­???™ìŠµ ?˜ì´ì§€ ë²ˆì—­
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
    // ?¨ì–´???ì„¸ë³´ê¸° ëª¨ë‹¬ ë²ˆì—­
    concept_detail_view: "Concept Detail View",
    expressions_by_language: "Expressions by Language",
    close: "Close",
    delete: "Delete",
    edit: "Edit",
    confirm_delete_concept: "Are you sure you want to delete this concept?",
    concept_deleted_success: "Concept has been successfully deleted.",
    concept_delete_error: "An error occurred while deleting the concept",
    registration_time: "Registration Time",
    // ê°œë… ì¶”ê? ëª¨ë‹¬ ë²ˆì—­
    domain: "Domain",
    domain_placeholder: "Ex: daily, food, business",
    emoji: "Emoji",
    emoji_placeholder: "Ex: ?, ?š†, ?‘‹",
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
    // ê²Œì„ ë²ˆì—­
    games: "Games",
    games_desc: "Learn various languages enjoyably through fun games.",
    learning_title: "Learning",
    source_language: "Source Language",
    target_language: "Target Language",
    learning_title_desc:
      "Improve your language skills through systematic learning.",
    // ë¬¸ë²• ë°??™ìŠµ ì§„ë„ ?˜ì´ì§€ ë²ˆì—­
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

    // ?™ìŠµ ?˜ì´ì§€ ë²ˆì—­
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

    // ?µí•© ?™ìŠµ ëª¨ë“œ ë²ˆì—­
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

    // ?™ìŠµ ?¹ì§• ?¤ëª…
    vocabulary_flashcard_features: "Visual Learning ??Instant Feedback",
    vocabulary_typing_features: "Accurate Spelling ??Memory Enhancement",
    vocabulary_pronunciation_features:
      "Accurate Pronunciation ??Listening Improvement",
    grammar_pattern_features: "Systematic Analysis ??Structure Understanding",
    grammar_practice_features: "Practical Exercise ??Application Skills",
    reading_example_features:
      "Context Comprehension ??Understanding Improvement",
    reading_flash_features: "Speed Reading ??Concentration Enhancement",

    // ?™ìŠµ ?µê³„ ë°?ì¶”ì²œ
    estimated_time: "Estimated Time",
    recent_activity: "Recent Activity",
    no_recent_activity: "No recent learning records",
    recommended_mode: "Recommended Learning",
    vocabulary_flashcard_recommended: "Vocabulary Flashcards Recommended",
    learning_streak: "Learning Streak",
    days: "days",

    // ?™ìŠµ ëª¨ë“œ ë²ˆì—­
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

    // ?„í„° ë°??¤ì • ë²ˆì—­
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

    // ?í™© ?œê·¸ ë²ˆì—­
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

    // ëª©ì  ?œê·¸ ë²ˆì—­
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

    // ?™ìŠµ ëª¨ë“œ ì¹´ë“œ ë²ˆì—­
    flashcard_learning: "?ƒ Flashcard Learning",
    typing_learning: "?¨ï¸ Typing Learning",
    pronunciation_practice: "?¤ Pronunciation Practice",
    grammar_pattern_analysis: "?“ Grammar Pattern Analysis",
    grammar_practice: "?“š Grammar Practice",
    reading_learning: "Reading Learning",

    // ?Œë˜?œì¹´??ëª¨ë“œ ë²ˆì—­
    click_to_check_meaning: "Click to check meaning",
    click_to_see_word: "Click again to see word",
    back_to_dashboard: "Back to Dashboard",
    back: "Back",

    // ?€?´í•‘ ëª¨ë“œ ë²ˆì—­
    typing_answer_placeholder: "Enter your answer",
    check: "Check",

    // ë°œìŒ ?°ìŠµ ëª¨ë“œ ë²ˆì—­
    pronunciation_coming_soon: "Pronunciation practice mode is coming soon.",

    // ë¬¸ë²• ëª¨ë“œ ë²ˆì—­
    click_to_see_explanation: "Click to see explanation",

    // ?…í•´ ëª¨ë“œ ë²ˆì—­
    original_text: "Original Text",
    translation: "Translation",
    context: "Context",

    // ê³µí†µ ë²„íŠ¼ ë²ˆì—­
    home: "Home",
    back_to_home: "Back to Home",

    // ?°ì´???†ìŒ ë©”ì‹œì§€
    no_data: "No Data Available",
    no_data_description: "There is no data to learn. Please upload data first.",

    // ?…ë¡œ??ëª¨ë‹¬ ë²ˆì—­
    concept_upload: "Concept Upload",
    grammar_pattern_upload: "Grammar Pattern Upload",
    example_upload: "Example Upload",
    upload_csv_json_concept: "Upload CSV or JSON files to add concepts.",
    upload_csv_json_grammar:
      "Upload CSV or JSON files to add grammar patterns.",
    upload_csv_json_example: "Upload CSV or JSON files to add examples.",
    upload: "Upload",
    download_template: "Download Template",

    // ì¶”ì²œ ?™ìŠµ ê´€??ë²ˆì—­
    flashcard_recommended: "Flashcard",
    recommended: "Recommended",
    recommendation_reason: "Recommended based on recent learning patterns",
  },
  ja: {
    home: "?›ãƒ¼??,
    wordbook: "?˜èªå¸?,
    vocabulary: "?˜èªå¸?,
    multilingual_dictionary: "å¤šè?èªè¾??,
    ai_wordbook: "AI?˜èªå¸?,
    ai_vocabulary: "AI?˜èªå¸?,
    language_learning: commonTexts.ja.language_learning,
    language_learning_desc: commonTexts.ja.language_learning_desc,
    language_games: commonTexts.ja.language_games,
    language_games_desc: commonTexts.ja.language_games_desc,
    inquiry: "?Šå•?„åˆ?ã›",
    login: "??‚°?¤ãƒ³",
    signup: "ä¼šå“¡?»éŒ²",
    logout: "??‚°?¢ã‚¦??,
    profile: "?—ãƒ­?•ã‚£?¼ãƒ«",
    delete_account: "?€ä¼?,
    welcome: "?ˆã†?“ã",
    user_suffix: "?•ã‚“",
    get_started_free: "?¡æ–™?§å§‹?ã‚‹",
    learn_languages: "æ§˜ã€…ãªè¨€èªã‚’ç°¡å˜?«æ??—ãå­¦ã³?¾ã—?‡ã†",
    effective_learning:
      "ä½“ç³»?„ãª?«ãƒª??ƒ¥?©ãƒ ?¨ç›´?Ÿçš„?ªå?ç¿’ã‚·?¹ãƒ†? ã§?ã‚?ªãŸ??ªå­??ç¿’ã‚’?ˆã‚Š?¹æœ?„ã«?—ã¾?™ã€?,
    wordbook_desc:
      "å­?¿’?™ã‚‹?˜èª?’å…¥?›ã—?¦ã€è‡ª?†ã ?‘ã®å¤šè?èªå˜èªå¸³?’ä½œ?Šã¾?—ã‚‡?†ã€?,
    ai_wordbook_desc:
      "Google Gemini AI?‹ã‚‰?«ã‚¹?¿ãƒ ?˜èª??Š?™ã™?ã‚’?—ã‘?–ã‚Š?èªå­?Š›?’å‘ä¸Šã•?›ã¾?—ã‚‡?†ã€?,
    ai_vocabulary_desc:
      "AI?Œæ¨?¦ã™?‹å¤šè¨€èªæ¦‚å¿µã‚’å­¦ã³?èªå­?Š›?’å‘ä¸Šã•?›ã¾?—ã‚‡?†ã€?,
    inquiry_desc:
      "è³ªå•?Œã‚?‹å ´?ˆã‚„?©ã‘?Œå¿…è¦ãª?´åˆ??€ãŠæ°—è»½?«ãŠ?ã„?ˆã‚?›ã? ã•?„ã€?,
    start: "å§‹ã‚??,
    language_settings: "è¨€èªè¨­å®?,
    save: "ä¿å­˜",
    cancel: "??ƒ£?³ã‚»??,
    total_concepts: "ç·æ¦‚å¿µæ•°",
    concepts_unit: "??,
    ai_usage: "AIä½¿ç”¨??,
    ai_recommend_concept: "AIæ¦‚å¿µ?¨è–¦",
    // Modal-related translations
    add_concept: "æ¦‚å¿µè¿½åŠ ",
    edit_concept: "æ¦‚å¿µç·¨é›†",
    domain: "?‰ãƒ¡?¤ãƒ³",
    select_domain: "?‰ãƒ¡?¤ãƒ³?’é¸??,
    category: "?«ãƒ†?´ãƒª??,
    category_placeholder: "ä¾? fruit, animal",
    emoji: "çµµæ–‡å­?,
    language_expressions: "è¨€èªåˆ¥è¡¨ç¾",
    word: "?˜èª",
    pronunciation: "?ºéŸ³",
    definition: "å®šç¾©",
    part_of_speech: "?è©",
    select_pos: "?è©?’é¸??,
    // Part of speech translations
    noun: "?è©",
    verb: "?•è©",
    adjective: "å½¢å?è©?,
    adverb: "??©",
    pronoun: "ä»£åè©?,
    preposition: "?ç½®è©?,
    conjunction: "?¥ç¶šè©?,
    interjection: "?Ÿå˜†è©?,
    particle: "?©è©",
    determiner: "?å®šè©?,
    classifier: "?†é¡è©?,
    other: "?ã®ä»?,
    // Linguistic terms translations
    synonyms: "é¡ç¾©èª?(?«ãƒ³?åŒº?‡ã‚Š)",
    antonyms: "?ç¾©èª?(?«ãƒ³?åŒº?‡ã‚Š)",
    collocations: "?£èª (?«ãƒ³?åŒº?‡ã‚Š)",
    compound_words: "è¤‡åˆèª?(?«ãƒ³?åŒº?‡ã‚Š)",
    examples: "ä¾‹æ–‡",
    add_example: "ä¾‹æ–‡è¿½åŠ ",
    representative_example: "ä»£è¡¨ä¾‹æ–‡",
    korean_example: "?“å›½èªä¾‹??,
    english_example: "?±èªä¾‹æ–‡",
    japanese_example: "?¥æœ¬èªä¾‹??,
    chinese_example: "ä¸?›½èªä¾‹??,
    tags: "?¿ã‚° (?«ãƒ³?åŒº?‡ã‚Š)",
    // Domain translations
    academic: "å­?¡“",
    nature: "?ªç„¶",
    technology: "?€è¡?,
    health: "?¥åº·",
    sports: "?¹ãƒ?¼ãƒ„",
    entertainment: "?¨ãƒ³?¿ãƒ¼?†ã‚¤?³ãƒ¡?³ãƒˆ",
    // Domain filter translations
    domain_filter: "?˜åŸŸ",
    all_domains: "?¨é ˜??,
    domain_daily: "?¥å¸¸",
    domain_business: "?“ã‚¸?ã‚¹",
    domain_academic: "å­?¡“",
    domain_travel: "?…è¡Œ",
    domain_food: "é£Ÿå“",
    domain_nature: "?ªç„¶",
    domain_technology: "?€è¡?,
    domain_health: "?¥åº·",
    domain_sports: "?¹ãƒ?¼ãƒ„",
    domain_entertainment: "?¨ãƒ³?¿ãƒ¼?†ã‚¤?³ãƒ¡?³ãƒˆ",
    domain_other: "?ã®ä»?,
    // ë¡œê·¸???˜ì´ì§€ ë²ˆì—­
    login_with_google: "Google?§ãƒ­?°ã‚¤??,
    login_with_github: "Github?§ãƒ­?°ã‚¤??,
    or: "?¾ãŸ??,
    email: "?¡ãƒ¼?«ã‚¢?‰ãƒ¬??,
    email_placeholder: "?¡ãƒ¼?«ã‚¢?‰ãƒ¬?¹ã‚’?¥åŠ›?—ã¦?ã ?•ã„",
    password: "?‘ã‚¹??ƒ¼??,
    password_placeholder: "?‘ã‚¹??ƒ¼?‰ã‚’?¥åŠ›?—ã¦?ã ?•ã„",
    auto_login: "?ªå‹•??‚°?¤ãƒ³",
    forgot_password: "?‘ã‚¹??ƒ¼?‰ã‚’?Šå¿˜?Œã§?™ã‹ï¼?,
    no_account: "?¢ã‚«?¦ãƒ³?ˆã‚’?ŠæŒ?¡ã§?ªã„?§ã™?‹ï¼Ÿ",
    // ?Œì›ê°€???˜ì´ì§€ ë²ˆì—­
    create_account: "?¢ã‚«?¦ãƒ³?ˆä½œ??,
    name: "?Šå??,
    name_placeholder: "?Šå?ã‚’?¥åŠ›?—ã¦?ã ?•ã„",
    confirm_password: "?‘ã‚¹??ƒ¼?‰ç¢ºèª?,
    confirm_password_placeholder: "?‘ã‚¹??ƒ¼?‰ã‚’?å…¥?›ã—?¦ã? ã•??,
    agree_terms: "?©ç”¨è¦ç´„?«åŒ?ã—?¾ã™",
    already_account: "?™ã§?«ã‚¢?«ã‚¦?³ãƒˆ?’ãŠ?ã¡?§ã™?‹ï¼Ÿ",
    // ë¬¸ì˜ ?˜ì´ì§€ ë²ˆì—­
    contact_us: "?Šå•?„åˆ?ã›",
    subject: "ä»¶å",
    subject_placeholder: "ä»¶å?’å…¥?›ã—?¦ã? ã•??,
    message: "?¡ãƒƒ?»ãƒ¼??,
    message_placeholder: "?¡ãƒƒ?»ãƒ¼?¸ã‚’?¥åŠ›?—ã¦?ã ?•ã„",
    send: "?ä¿¡",
    // ?¤êµ­???¨ì–´???˜ì´ì§€ ë²ˆì—­
    search: "æ¤œç´¢",
    search_placeholder: "æ¤œç´¢èªã‚’?¥åŠ›...",
    source_language: "?Ÿèª",
    target_language: "å¯¾è±¡è¨€èª?,
    category: "?«ãƒ†?´ãƒª??,
    all_categories: "?™ã¹?¦ã®?«ãƒ†?´ãƒª??,
    fruit: "?œç‰©",
    food: "é£Ÿã¹??,
    animal: "?•ç‰©",
    daily: "?¥å¸¸",
    travel: "?…è¡Œ",
    business: "?“ã‚¸?ã‚¹",
    concept_count: "??¦‚å¿?,
    sort: "ä¸¦ã¹?¿ãˆ",
    latest: "?€?°é †",
    oldest: "?¤ã„??,
    alphabetical: "?‚ã„?†ãˆ?Šé †",
    reverse_alphabetical: "?†ã‚?„ã†?ˆãŠ??,
    concept_usage: "æ¦‚å¿µä½¿ç”¨??,
    add_new_concept: "?°ã—?„æ¦‚å¿µã‚’è¿½åŠ ",
    bulk_add_concept: "ä¸€?¬æ¦‚å¿µè¿½??,
    load_more: "?‚ã£?¨è¦‹??,
    korean: "?“å›½èª?,
    english: "?±èª",
    japanese: "?¥æœ¬èª?,
    chinese: "ä¸?›½èª?,
    // ?¤êµ­???™ìŠµ ?˜ì´ì§€ ë²ˆì—­
    language_learning_title: "å¤šè?èªå?ç¿?,
    select_source_language: "?Ÿèª?’é¸??,
    select_target_language: "å¯¾è±¡è¨€èªã‚’?¸æŠ",
    learning_mode: "å­?¿’?¢ãƒ¼??,
    flashcards: "?•ãƒ©?ƒã‚·?¥ã‚«?¼ãƒ‰",
    flashcards_desc: "?«ãƒ¼?‰ã®è¡¨è£?§å?ç¿?,
    quiz: "??‚¤??,
    quiz_desc: "å¤šè‚¢?¸æŠ?é¡Œ?§å?ç¿?,
    typing: "?¿ã‚¤?”ãƒ³??,
    typing_desc: "?´æ¥?¥åŠ›?—ã¦å­?¿’",
    previous: "?ã¸",
    flip: "è£è¿”??,
    next: "æ¬¡ã¸",
    examples: "ä¾‹æ–‡:",
    card_progress: "?²æ—?¶æ³",
    quiz_question: "?é¡Œ",
    next_question: "æ¬¡ã®?é¡Œ",
    quiz_progress: "?²æ—?¶æ³",
    typing_prompt: "ç­”ãˆ?’å…¥?›ã—?¦ã? ã•??",
    typing_placeholder: "ç­”ãˆ?’å…¥??..",
    check_answer: "ç­”ãˆ?ˆã‚??,
    next_word: "æ¬¡ã®?˜èª",
    typing_progress: "?²æ—?¶æ³",
    correct_count: "æ­£è§£??",
    wrong_count: "ä¸æ?è§£æ•°:",
    // ?¨ì–´???ì„¸ë³´ê¸° ëª¨ë‹¬ ë²ˆì—­
    concept_detail_view: "æ¦‚å¿µè©³ç´°è¡¨ç¤º",
    expressions_by_language: "è¨€èªåˆ¥è¡¨ç¾",
    close: "?‰ã˜??,
    delete: "?Šé™¤",
    edit: "ç·¨é›†",
    confirm_delete_concept: "?¬å½“?«ã“??¦‚å¿µã‚’?Šé™¤?—ã¾?™ã‹ï¼?,
    concept_deleted_success: "æ¦‚å¿µ?Œæ?å¸¸ã«?Šé™¤?•ã‚Œ?¾ã—?Ÿã€?,
    concept_delete_error: "æ¦‚å¿µ??‰Š?¤ä¸­?«ã‚¨?©ãƒ¼?Œç™º?Ÿã—?¾ã—??,
    registration_time: "?»éŒ²?‚é–“",
    // ê°œë… ì¶”ê? ëª¨ë‹¬ ë²ˆì—­
    domain: "?‰ãƒ¡?¤ãƒ³",
    domain_placeholder: "ä¾‹ï¼šdaily, food, business",
    emoji: "çµµæ–‡å­?,
    emoji_placeholder: "ä¾‹ï¼š?, ?š†, ?‘‹",
    reset: "?ªã‚»?ƒãƒˆ",
    add: "è¿½åŠ ",
    add_example: "ä¾‹æ–‡?’è¿½??,
    add_new_language: "?°ã—?„è?èªã‚’è¿½åŠ ",
    language_name_ko: "è¨€èªåï¼ˆéŸ“?½èªï¼?,
    language_name_ko_placeholder: "ä¾‹ï¼š?¹ãƒš?¤ãƒ³èªã€ãƒ•?©ãƒ³?¹èª",
    language_code: "è¨€èªã‚³?¼ãƒ‰",
    language_code_placeholder: "ä¾‹ï¼šspanish, french",
    example_word: "ä¾‹ã®?˜èª",
    example_word_placeholder: "ä¾‹ï¼šmanzana, pomme",
    cancel: "??ƒ£?³ã‚»??,
    // ê²Œì„ ë²ˆì—­
    games: "?²ãƒ¼??,
    games_desc: "æ¥½ã—?„ã‚²?¼ãƒ ?’é€šã—??§˜?…ãªè¨€èªã‚’æ¥½ã—?å??³ã¾?—ã‚‡?†ã€?,
    learning_title: "å­?¿’",
    source_language: "?ƒè?èª?,
    target_language: "å¯¾è±¡è¨€èª?,
    learning_title_desc: "ä½“ç³»?„ãªå­?¿’?’é€šã—??ªå­?Š›?’å‘ä¸Šã•?›ã¾?—ã‚‡?†ã€?,
    // ë¬¸ë²• ë°??™ìŠµ ì§„ë„ ?˜ì´ì§€ ë²ˆì—­
    grammar_progress: "?‡æ³•?¨å?ç¿’é€²æ—",
    grammar_progress_title: "?‡æ³•?¨å?ç¿’é€²æ—",
    grammar_progress_subtitle: "å­?¿’?æœ?¨æ–‡æ³•ãƒ‘?¿ãƒ¼?³ã‚’ç¢ºèª?™ã‚‹",
    total_concepts: "ç·æ¦‚å¿µæ•°",
    concepts_breakdown: "?«ãƒ†?´ãƒª?¥åˆ†å¸?,
    progress: "?²åº¦",
    progress_title: "?²åº¦",
    learning_progress: "å­?¿’?²åº¦",
    learning_progress_title: "å­?¿’?²åº¦",
    learning_progress_subtitle: "?‹äººå­?¿’?æœ?¨é€²åº¦?’è¿½è·¡ã—?åˆ†?ã™??,

    // å­?¿’?šãƒ¼?¸ç¿»è¨?    learning_areas: "å­?¿’?˜åŸŸ",
    learning_dashboard: "å­?¿’?€?ƒã‚·?¥ãƒœ?¼ãƒ‰",
    continue_learning: "å­?¿’?’ç¶š?‘ã‚‹",
    vocabulary_learning: "?˜èªå­?¿’",
    vocabulary_learning_desc:
      "èªå½™?›å‘ä¸Šã®?Ÿã‚??ƒ•?©ãƒƒ?·ãƒ¥?«ãƒ¼?‰ã¨?¿ã‚¤?”ãƒ³?°å?ç¿?,
    vocabulary_modes: "?•ãƒ©?ƒã‚·?¥ã‚«?¼ãƒ‰ ???¿ã‚¤?”ãƒ³?????ºéŸ³ç·´ç¿’",
    grammar_learning: "?‡æ³•å­?¿’",
    grammar_learning_desc: "ä½“ç³»?„ãª?‡æ³•?‘ã‚¿?¼ãƒ³?†æ?¨å®Ÿç¿’å?ç¿?,
    grammar_modes: "?‡æ³•?‘ã‚¿?¼ãƒ³ ??ä¾‹æ–‡?†æ ??å®Ÿç¿’?é¡Œ",
    reading_learning: "èª?§£å­?¿’",
    reading_learning_desc: "æ§˜ã€…ãªä¾‹æ–‡?’é€šã—?Ÿèª­è§£åŠ›?‘ä¸Š",
    reading_modes: "ä¾‹æ–‡å­?¿’ ???•ãƒ©?ƒã‚·?¥ãƒ¢?¼ãƒ‰",
    quiz_test: "??‚¤?ºãƒ†?¹ãƒˆ",

    // çµ±åˆå­?¿’?¢ãƒ¼?‰ç¿»è¨?    flashcard_mode: "?•ãƒ©?ƒã‚·?¥ã‚«?¼ãƒ‰",
    flashcard_quick_desc: "?«ãƒ¼?‰åè»¢å?ç¿?,
    typing_mode: "?¿ã‚¤?”ãƒ³??,
    typing_quick_desc: "?´æ¥?¥åŠ›å­?¿’",
    pronunciation_mode: "?ºéŸ³ç·´ç¿’",
    pronunciation_quick_desc: "?³å£°èªè­˜å­?¿’",
    pattern_analysis_mode: "?‘ã‚¿?¼ãƒ³?†æ",
    pattern_quick_desc: "?‡æ³•æ§‹é€ å?ç¿?,
    practice_mode: "å®Ÿç¿’?é¡Œ",
    practice_quick_desc: "?‡æ³•å¿œç”¨ç·´ç¿’",
    example_learning_mode: "ä¾‹æ–‡å­?¿’",
    example_quick_desc: "?‡è„ˆ?†è§£å­?¿’",
    flash_mode: "?•ãƒ©?ƒã‚·?¥ãƒ¢?¼ãƒ‰",
    flash_quick_desc: "?Ÿèª­ç·´ç¿’",

    // å­?¿’?¹å¾´èª¬æ˜
    vocabulary_flashcard_features: "è¦–è¦š?„å?ç¿????³æ™‚?•ã‚£?¼ãƒ‰?ãƒƒ??,
    vocabulary_typing_features: "æ­£ç¢º?ªã‚¹?šãƒ« ??è¨˜æ†¶?›å¼·??,
    vocabulary_pronunciation_features: "æ­£ç¢º?ªç™º?????ªã‚¹?‹ãƒ³?°å‘ä¸?,
    grammar_pattern_features: "ä½“ç³»?„åˆ†????æ§‹é€ ç†è§?,
    grammar_practice_features: "å®Ÿè·µç·´ç¿’ ??å¿œç”¨?½åŠ›",
    reading_example_features: "?‡è„ˆ?Šæ¡ ???†è§£?›å‘ä¸?,
    reading_flash_features: "?Ÿèª­ç·´ç¿’ ???†ä¸­?›å‘ä¸?,

    // å­?¿’çµ±è¨ˆ?¨æ¨å¥?    estimated_time: "äºˆæƒ³?‚é–“",
    recent_activity: "?€è¿‘ã®æ´»å‹•",
    no_recent_activity: "?€è¿‘ã®å­?¿’è¨˜éŒ²?Œã‚?Šã¾?›ã‚“",
    recommended_mode: "?¨å¥¨å­?¿’",
    vocabulary_flashcard_recommended: "?˜èª?•ãƒ©?ƒã‚·?¥ã‚«?¼ãƒ‰?¨å¥¨",
    learning_streak: "å­?¿’?£ç¶š??,
    days: "??,

    // å­?¿’?¢ãƒ¼?‰ç¿»è¨?    learning_modes: "å­?¿’?¢ãƒ¼??,
    back_to_areas: "?˜åŸŸ?¸æŠ?«æˆ»??,
    pattern_analysis: "?‘ã‚¿?¼ãƒ³?†æ",
    pattern_analysis_desc: "?‡æ³•æ§‹é€ ã¨?‘ã‚¿?¼ãƒ³?’ä½“ç³»çš„?«å?ç¿?,
    example_practice: "ä¾‹æ–‡å®Ÿç¿’",
    example_practice_desc: "?•ãƒ©?ƒã‚·?¥ã‚«?¼ãƒ‰?¹å¼?§æ–‡æ³•ãƒ‘?¿ãƒ¼?³ç·´ç¿?,
    general_example_learning: "ä¸€?¬ä¾‹?‡å?ç¿?,
    general_example_learning_desc: "æ§˜ã€…ãªä¾‹æ–‡?’é€šã—?Ÿèª­è§£èƒ½?›å‘ä¸?,
    flash_mode: "?•ãƒ©?ƒã‚·?¥ãƒ¢?¼ãƒ‰",
    flash_mode_desc: "é«˜é€Ÿã§ä¾‹æ–‡?’å?ç¿’ã™?‹é›†ä¸?ƒ¢?¼ãƒ‰",

    // ?•ã‚£?«ã‚¿?¼ã¨è¨?®šç¿»è¨³
    difficulty_level: "?£æ˜“åº?,
    all_difficulties: "?¨é›£?“åº¦",
    basic: "?ºç¤",
    intermediate: "ä¸?´š",
    advanced: "ä¸Šç´š",
    fluent: "æµæš¢",
    technical: "å°‚é??¨èª",
    pattern_type: "?‘ã‚¿?¼ãƒ³?¿ã‚¤??,
    all_patterns: "?¨ãƒ‘?¿ãƒ¼??,
    grammar_pattern: "?‡æ³•?‘ã‚¿?¼ãƒ³",
    syntax_structure: "?‡ç« æ§‹é€?,
    expression_pattern: "è¡¨ç¾?‘ã‚¿?¼ãƒ³",
    conversation_pattern: "ä¼šè©±?‘ã‚¿?¼ãƒ³",
    situation: "?¶æ³",
    all_situation: "?¨çŠ¶æ³?,
    purpose: "??š„",
    all_purpose: "?¨ç›®??,

    // ?í™© ?œê·¸ ë²ˆì—­
    formal: "?•ã‚©?¼ãƒ??,
    casual: "?«ã‚¸?¥ã‚¢??,
    urgent: "ç·Šæ€?,
    work: "?·å ´",
    school: "å­? ¡",
    social: "ç¤¾äº¤",
    shopping: "?·ãƒ§?ƒãƒ”?³ã‚°",
    home: "å®¶åº­",
    public: "?¬å…±?´æ?",
    online: "?ªãƒ³?©ã‚¤??,
    medical: "?»ç™‚",

    // ëª©ì  ?œê·¸ ë²ˆì—­
    greeting: "?¨æ‹¶",
    thanking: "?Ÿè¬",
    request: "ä¾é ¼",
    question: "è³ªå•",
    opinion: "?è¦‹",
    agreement: "?Œæ„",
    refusal: "?’å¦",
    apology: "è¬ç½ª",
    instruction: "?‡ç¤º",
    description: "èª¬æ˜",
    suggestion: "?æ¡ˆ",
    emotion: "?Ÿæƒ…è¡¨ç¾",
    domain_filter: "?‰ãƒ¡?¤ãƒ³",
    all_domains: "?¨ãƒ‰?¡ã‚¤??,
    domain_daily: "?¥å¸¸",
    domain_business: "?“ã‚¸?ã‚¹",
    domain_academic: "å­?¡“",
    domain_travel: "?…è¡Œ",
    domain_food: "é£Ÿã¹??,
    domain_nature: "?ªç„¶",
    domain_technology: "?€è¡?,
    domain_health: "?¥åº·",
    domain_sports: "?¹ãƒ?¼ãƒ„",
    domain_entertainment: "?¨ãƒ³?¿ãƒ¼?†ã‚¤?³ãƒ¡?³ãƒˆ",
    domain_other: "?ã®ä»?,

    // ?Œë˜?œì¹´??ëª¨ë“œ ë²ˆì—­
    back_to_dashboard: "?€?ƒã‚·?¥ãƒœ?¼ãƒ‰?«æˆ»??,
    back: "?»ã‚‹",

    // ì¶”ì²œ ?™ìŠµ ê´€??ë²ˆì—­
    flashcard_recommended: "?•ãƒ©?ƒã‚·?¥ã‚«?¼ãƒ‰",
    recommended: "?¨å¥¨",
    recommendation_reason: "?€è¿‘ã®å­?¿’?‘ã‚¿?¼ãƒ³?«åŸº?¥ã„??¨å¥¨ã•?Œã¾??,
  },
  zh: {
    home: "é¦–é¡µ",
    wordbook: "è¯æ±‡??,
    vocabulary: "è¯æ±‡",
    multilingual_dictionary: "å¤šè?è¨€è¯å…¸",
    ai_wordbook: "AIè¯æ±‡??,
    ai_vocabulary: "AIè¯æ±‡",
    language_learning: commonTexts.zh.language_learning,
    language_learning_desc: commonTexts.zh.language_learning_desc,
    language_games: commonTexts.zh.language_games,
    language_games_desc: commonTexts.zh.language_games_desc,
    inquiry: "?¨è?",
    login: "?»å½•",
    signup: "æ³¨å†Œ",
    logout: "?»å‡º",
    profile: "ä¸ªäººèµ„æ–™",
    delete_account: "? é™¤è´?ˆ·",
    welcome: "æ¬?¿",
    user_suffix: "",
    get_started_free: "?è´¹å¼€å§?,
    learn_languages: "è½»æ¾?‰è¶£?°å?ä¹ å„ç§è?è¨€",
    effective_learning:
      "?šè¿‡ç³»ç»Ÿ?–è?ç¨‹å’Œ?´è§‚å­¦ä¹ ç³»ç»Ÿï¼Œè??¨çš„è¯??å­¦ä¹ ?´åŠ é«˜æ•ˆ??,
    wordbook_desc: "è¾“å…¥è¦å?ä¹ çš„?•è¯ï¼Œåˆ›å»ºæ‚¨?ªå·±?„å¤šè¯??è¯æ±‡?¬ã€?,
    ai_wordbook_desc:
      "?šè¿‡Google Gemini AI?·å¾—å®šåˆ¶?•è¯?¨èï¼Œæé«˜æ‚¨?„è?è¨€?€?½ã€?,
    ai_vocabulary_desc: "å­¦ä¹ AI?¨è?„å¤šè¯??æ¦‚å¿µï¼Œæé«˜æ‚¨?„è?è¨€?€?½ã€?,
    inquiry_desc: "å¦‚æœ?¨æœ‰ä»»ä½•??¢˜?–é?è¦å¸®?©ï¼Œè¯·éš?¶å’¨è¯¢ã€?,
    start: "å¼€å§?,
    language_settings: "è¯??è®¾ç½®",
    save: "ä¿å­˜",
    cancel: "?–æ¶ˆ",
    total_concepts: "?»æ¦‚å¿µæ•°",
    concepts_unit: "ä¸?,
    ai_usage: "AIä½¿ç”¨??,
    ai_recommend_concept: "AIæ¦‚å¿µ?¨è",
    // æ¨¡æ€æ¡†?¸å…³ç¿»è¯‘
    add_concept: "æ·»åŠ æ¦‚å¿µ",
    edit_concept: "ç¼–è¾‘æ¦‚å¿µ",
    domain: "é¢†åŸŸ",
    select_domain: "?‰æ‹©é¢†åŸŸ",
    category: "ç±»åˆ«",
    category_placeholder: "ä¾‹å¦‚ï¼šfruit, animal",
    emoji: "è¡¨æƒ…ç¬?·",
    language_expressions: "è¯??è¡¨è¾¾",
    word: "?•è¯",
    pronunciation: "?‘éŸ³",
    definition: "å®šä¹‰",
    part_of_speech: "è¯æ€?,
    select_pos: "?‰æ‹©è¯æ€?,
    // è¯æ€§ç¿»è¯?    noun: "?è¯",
    verb: "?¨è¯",
    adjective: "å½¢å?è¯?,
    adverb: "??¯",
    pronoun: "ä»£è¯",
    preposition: "ä»‹è¯",
    conjunction: "è¿è¯",
    interjection: "?Ÿå¹è¯?,
    particle: "?©è¯",
    determiner: "?å®šè¯?,
    classifier: "?è¯",
    other: "?¶ä»–",
    // è¯??å­?œ¯è¯?¿»è¯?    synonyms: "?Œä¹‰è¯ï¼ˆ?—å·?†éš”ï¼?,
    antonyms: "?ä¹‰è¯ï¼ˆ?—å·?†éš”ï¼?,
    collocations: "??…ï¼ˆé€—å·?†éš”ï¼?,
    compound_words: "å¤åˆè¯ï¼ˆ?—å·?†éš”ï¼?,
    examples: "ä¾‹å¥",
    add_example: "æ·»åŠ ä¾‹å¥",
    representative_example: "ä»£è¡¨ä¾‹å¥",
    korean_example: "?©è?ä¾‹å¥",
    english_example: "?±è?ä¾‹å¥",
    japanese_example: "?¥è?ä¾‹å¥",
    chinese_example: "ä¸?–‡ä¾‹å¥",
    tags: "?‡ç?ï¼ˆé€—å·?†éš”ï¼?,
    // é¢†åŸŸç¿»è¯‘
    academic: "å­?œ¯",
    technology: "?€??,
    health: "?¥åº·",
    sports: "ä½“è‚²",
    entertainment: "å¨±ä¹",
    // é¢†åŸŸè¿‡æ»¤?¨ç¿»è¯?    domain_filter: "é¢†åŸŸ",
    all_domains: "?¨éƒ¨é¢†åŸŸ",
    domain_daily: "?¥å¸¸",
    domain_business: "?†åŠ¡",
    domain_academic: "å­?œ¯",
    domain_travel: "?…è¡Œ",
    domain_food: "é£Ÿç‰©",
    domain_nature: "?ªç„¶",
    domain_technology: "?€??,
    domain_health: "?¥åº·",
    domain_sports: "ä½“è‚²",
    domain_entertainment: "å¨±ä¹",
    domain_other: "?¶ä»–",
    // ?»å½•é¡µé¢ç¿»è¯‘
    login_with_google: "ä½¿ç”¨Google?»å½•",
    login_with_github: "ä½¿ç”¨Github?»å½•",
    or: "?–è€?,
    email: "?µå­??»¶",
    email_placeholder: "è¯·è¾“?¥æ‚¨?„ç”µå­é‚®ä»?,
    password: "å¯†ç ",
    password_placeholder: "è¯·è¾“?¥æ‚¨?„å¯†??,
    auto_login: "?ªåŠ¨?»å½•",
    forgot_password: "å¿˜è?å¯†ç ï¼?,
    no_account: "æ²¡æœ‰è´?·ï¼?,
    // ?Œì›ê°€???˜ì´ì§€ ë²ˆì—­
    create_account: "?›å»ºè´?·",
    name: "å§“å",
    name_placeholder: "è¯·è¾“?¥æ‚¨?„å§“??,
    confirm_password: "ç¡??å¯†ç ",
    confirm_password_placeholder: "è¯·å†æ¬¡è¾“?¥å¯†??,
    agree_terms: "?‘åŒ?æœ?¡æ¡æ¬?,
    already_account: "å·²æœ‰è´?·ï¼?,
    // ë¬¸ì˜ ?˜ì´ì§€ ë²ˆì—­
    contact_us: "?”ç³»?‘ä»¬",
    subject: "ä¸»é¢˜",
    subject_placeholder: "è¯·è¾“?¥ä¸»é¢?,
    message: "ä¿¡æ¯",
    message_placeholder: "è¯·è¾“?¥æ‚¨?„ä¿¡??,
    send: "?‘é€?,
    // ?¤êµ­???¨ì–´???˜ì´ì§€ ë²ˆì—­
    search: "?œç´¢",
    search_placeholder: "è¾“å…¥?œç´¢è¯?..",
    source_language: "æºè?è¨€",
    target_language: "?? ‡è¯??",
    category: "ç±»åˆ«",
    all_categories: "?€?‰ç±»??,
    fruit: "æ°´æœ",
    food: "é£Ÿç‰©",
    animal: "?¨ç‰©",
    daily: "?¥å¸¸",
    travel: "?…è¡Œ",
    business: "?†åŠ¡",
    concept_count: "ä¸ªæ¦‚å¿?,
    sort: "?’åº",
    latest: "?€??,
    oldest: "?€??,
    alphabetical: "å­—æ¯é¡ºåº",
    reverse_alphabetical: "?å­—æ¯é¡ºåº?,
    concept_usage: "æ¦‚å¿µä½¿ç”¨??,
    add_new_concept: "æ·»åŠ ?°æ¦‚å¿?,
    bulk_add_concept: "?¹é‡æ·»åŠ æ¦‚å¿µ",
    load_more: "? è½½?´å¤š",
    korean: "?©è?",
    english: "?±è?",
    japanese: "?¥è?",
    chinese: "ä¸?–‡",
    // ?¤êµ­???™ìŠµ ?˜ì´ì§€ ë²ˆì—­
    language_learning_title: "å¤šè?è¨€å­¦ä¹ ",
    select_source_language: "?‰æ‹©æºè?è¨€",
    select_target_language: "?‰æ‹©?? ‡è¯??",
    learning_mode: "å­¦ä¹ æ¨¡å¼",
    flashcards: "?ªå¡",
    flashcards_desc: "?šè¿‡?•è¯æ­£å?¢å?ä¹?,
    quiz: "æµ‹éªŒ",
    quiz_desc: "?šè¿‡?‰æ‹©é¢˜å?ä¹?,
    typing: "?“å­—",
    typing_desc: "?šè¿‡?´æ¥è¾“å…¥å­¦ä¹ ",
    previous: "ä¸Šä?ä¸?,
    flip: "ç¿»è½¬",
    next: "ä¸‹ä?ä¸?,
    examples: "ä¾‹å¥:",
    card_progress: "è¿›åº¦",
    quiz_question: "??¢˜",
    next_question: "ä¸‹ä?é¢?,
    quiz_progress: "è¿›åº¦",
    typing_prompt: "è¯·è¾“?¥ç­”æ¡?",
    typing_placeholder: "è¾“å…¥ç­”æ¡ˆ...",
    check_answer: "æ£€?¥ç­”æ¡?,
    next_word: "ä¸‹ä?ä¸ªå•è¯?,
    typing_progress: "è¿›åº¦",
    correct_count: "æ­£ç¡®??",
    wrong_count: "?™è???",
    // ?¨ì–´???ì„¸ë³´ê¸° ëª¨ë‹¬ ë²ˆì—­
    concept_detail_view: "æ¦‚å¿µè¯?»†?¥çœ‹",
    expressions_by_language: "?‰è?è¨€è¡¨è¾¾",
    close: "?³é—­",
    delete: "? é™¤",
    edit: "ç¼–è¾‘",
    confirm_delete_concept: "?¨ç¡®å®šè¦? é™¤è¿™ä¸ªæ¦‚å¿µ?—ï¼Ÿ",
    concept_deleted_success: "æ¦‚å¿µå·²æˆ?Ÿåˆ ?¤ã€?,
    concept_delete_error: "? é™¤æ¦‚å¿µ?¶å‘?Ÿé”™è¯?,
    registration_time: "æ³¨å†Œ?¶é—´",
    // ê°œë… ì¶”ê? ëª¨ë‹¬ ë²ˆì—­
    domain: "é¢†åŸŸ",
    domain_placeholder: "ä¾‹å¦‚ï¼šdaily, food, business",
    emoji: "è¡¨æƒ…ç¬?·",
    emoji_placeholder: "ä¾‹å¦‚ï¼šğŸ? ?š†, ?‘‹",
    reset: "?ç½®",
    add: "æ·»åŠ ",
    add_example: "æ·»åŠ ä¾‹å¥",
    add_new_language: "æ·»åŠ ?°è?è¨€",
    language_name_ko: "è¯???ç§°ï¼ˆéŸ©è¯?¼‰",
    language_name_ko_placeholder: "ä¾‹å¦‚ï¼šè???‰™è¯?¼Œæ³•è?",
    language_code: "è¯??ä»£ç ",
    language_code_placeholder: "ä¾‹å¦‚ï¼šspanish, french",
    example_word: "ç¤ºä¾‹?•è¯",
    example_word_placeholder: "ä¾‹å¦‚ï¼šmanzana, pomme",
    cancel: "?–æ¶ˆ",
    // ê²Œì„ ë²ˆì—­
    games: "æ¸¸æˆ",
    games_desc: "?šè¿‡?‰è¶£?„æ¸¸?æ„‰å¿«åœ°å­¦ä¹ ?„ç§è¯????,
    learning_title: "å­¦ä¹ ",
    source_language: "æºè?è¨€",
    target_language: "?? ‡è¯??",
    learning_title_desc: "?šè¿‡ç³»ç»Ÿ?„å?ä¹ æé«˜æ‚¨?„è?è¨€?€?½ã€?,
    // ë¬¸ë²• ë°??™ìŠµ ì§„ë„ ?˜ì´ì§€ ë²ˆì—­
    grammar_progress: "è¯?³•?Œå?ä¹ è¿›åº?,
    grammar_progress_title: "è¯?³•?Œå?ä¹ è¿›åº?,
    grammar_progress_subtitle: "?¥çœ‹å­¦ä¹ ?æœ?Œè?æ³•æ¨¡å¼åˆ†??,
    total_concepts: "?»æ¦‚å¿µæ•°",
    concepts_breakdown: "ç±»åˆ«?†å¸ƒ",
    progress: "è¿›åº¦",
    progress_title: "è¿›åº¦",
    learning_progress: "å­¦ä¹ è¿›åº¦",
    learning_progress_title: "å­¦ä¹ è¿›åº¦",
    learning_progress_subtitle: "è·Ÿè¸ªä¸ªäººå­¦ä¹ ?æœ?Œè¿›åº?,

    // å­¦ä¹ é¡µé¢ç¿»è¯‘
    learning_areas: "å­¦ä¹ é¢†åŸŸ",
    learning_dashboard: "å­¦ä¹ ä»ªè¡¨??,
    continue_learning: "ç»§ç»­å­¦ä¹ ",
    vocabulary_learning: "è¯æ±‡å­¦ä¹ ",
    vocabulary_learning_desc: "?šè¿‡?ªå¡?Œæ‰“å­—ç»ƒä¹ æé«˜è¯æ±‡é‡",
    vocabulary_modes: "?ªå¡ ???“å­— ???‘éŸ³ç»ƒä¹ ",
    grammar_learning: "è¯?³•å­¦ä¹ ",
    grammar_learning_desc: "ç³»ç»Ÿ?„è?æ³•æ¨¡å¼åˆ†?å’Œå®è·µå­¦ä¹ ",
    grammar_modes: "è¯?³•æ¨¡å¼ ??ä¾‹å¥?†æ ??ç»ƒä¹ é¢?,
    reading_learning: "?…è?å­¦ä¹ ",
    reading_learning_desc: "?šè¿‡?„ç§ä¾‹å¥?é«˜?…è??†è§£?½åŠ›",
    reading_modes: "ä¾‹å¥å­¦ä¹  ???ªå¡æ¨¡å¼",
    quiz_test: "æµ‹éªŒæµ‹è¯•",

    // ç»Ÿåˆå­¦ä¹ æ¨¡å¼ç¿»è¯‘
    flashcard_mode: "?ªå¡",
    flashcard_quick_desc: "?¡ç‰‡ç¿»è½¬å­¦ä¹ ",
    typing_mode: "?“å­—",
    typing_quick_desc: "?´æ¥è¾“å…¥å­¦ä¹ ",
    pronunciation_mode: "?‘éŸ³ç»ƒä¹ ",
    pronunciation_quick_desc: "è¯?Ÿ³è¯†åˆ«å­¦ä¹ ",
    pattern_analysis_mode: "æ¨¡å¼?†æ",
    pattern_quick_desc: "è¯?³•ç»“æ„å­¦ä¹ ",
    practice_mode: "ç»ƒä¹ é¢?,
    practice_quick_desc: "è¯?³•åº”ç”¨ç»ƒä¹ ",
    example_learning_mode: "ä¾‹å¥å­¦ä¹ ",
    example_quick_desc: "è¯?¢ƒ?†è§£å­¦ä¹ ",
    flash_mode: "?ªå¡æ¨¡å¼",
    flash_quick_desc: "å¿«é€Ÿé˜…è¯»ç»ƒä¹?,

    // å­¦ä¹ ?¹å¾è¯´æ˜
    vocabulary_flashcard_features: "è§†è§‰å­¦ä¹  ???³æ—¶?é¦ˆ",
    vocabulary_typing_features: "?†ç¡®?¼å†™ ??è®°å¿†å¢å¼º",
    vocabulary_pronunciation_features: "?†ç¡®?‘éŸ³ ???¬åŠ›?å‡",
    grammar_pattern_features: "ç³»ç»Ÿ?†æ ??ç»“æ„?†è§£",
    grammar_practice_features: "å®æˆ˜ç»ƒä¹  ??åº”ç”¨?½åŠ›",
    reading_example_features: "è¯?¢ƒ?†è§£ ???†è§£?›æ??,
    reading_flash_features: "?Ÿè?ç»ƒä¹  ??ä¸“æ³¨?›æ??,

    // å­¦ä¹ ç»Ÿè??Œæ¨??    estimated_time: "é¢„è??¶é—´",
    recent_activity: "?€è¿‘æ´»??,
    no_recent_activity: "æ²¡æœ‰?€è¿‘çš„å­¦ä¹ è®°å½•",
    recommended_mode: "?¨èå­¦ä¹ ",
    vocabulary_flashcard_recommended: "?¨èè¯æ±‡?ªå¡",
    learning_streak: "å­¦ä¹ è¿ç»­å¤©æ•°",
    days: "å¤?,

    // å­¦ä¹ æ¨¡å¼ç¿»è¯‘
    learning_modes: "å­¦ä¹ æ¨¡å¼",
    back_to_areas: "è¿”å›é¢†åŸŸ?‰æ‹©",
    pattern_analysis: "æ¨¡å¼?†æ",
    pattern_analysis_desc: "ç³»ç»Ÿå­¦ä¹ è¯?³•ç»“æ„?Œæ¨¡å¼?,
    example_practice: "ä¾‹å¥ç»ƒä¹ ",
    example_practice_desc: "?šè¿‡?ªå¡?¹å¼ç»ƒä¹ è¯?³•æ¨¡å¼",
    general_example_learning: "ä¸€?¬ä¾‹?¥å?ä¹?,
    general_example_learning_desc: "?šè¿‡?„ç§ä¾‹å¥?é«˜?…è??½åŠ›",
    flash_mode: "?ªå¡æ¨¡å¼",
    flash_mode_desc: "å¿«é€Ÿå?ä¹ ä¾‹?¥çš„?†ä¸­æ¨¡å¼",

    // è¿‡æ»¤?¨å’Œè®¾ç½®ç¿»è¯‘
    difficulty_level: "?¾åº¦ç­‰çº§",
    all_difficulties: "?¨éƒ¨?¾åº¦",
    basic: "?ºç?",
    intermediate: "ä¸?º§",
    advanced: "é«˜çº§",
    fluent: "æµåˆ©",
    technical: "ä¸“ä¸š???",
    pattern_type: "æ¨¡å¼ç±»å‹",
    all_patterns: "?¨éƒ¨æ¨¡å¼",
    grammar_pattern: "è¯?³•æ¨¡å¼",
    syntax_structure: "?¥æ³•ç»“æ„",
    expression_pattern: "è¡¨è¾¾æ¨¡å¼",
    conversation_pattern: "å¯¹è¯æ¨¡å¼",
    situation: "?…å¢ƒ",
    all_situation: "?¨éƒ¨?…å¢ƒ",
    purpose: "??š„",
    all_purpose: "?¨éƒ¨??š„",

    // ?í™© ?œê·¸ ë²ˆì—­
    formal: "æ­£å¼",
    casual: "?æ?å¼?,
    polite: "ç¤¼è²Œ",
    urgent: "ç´§æ€?,
    work: "å·¥ä½œ",
    school: "å­? ¡",
    social: "ç¤¾äº¤",
    shopping: "è´?‰©",
    home: "å®¶åº­",
    public: "?¬å…±?ºæ?",
    online: "?¨çº¿",
    medical: "?»ç–—",

    // ëª©ì  ?œê·¸ ë²ˆì—­
    greeting: "??€?,
    thanking: "?Ÿè°¢",
    request: "è¯·æ±‚",
    question: "?é—®",
    opinion: "?è§",
    agreement: "?Œæ„",
    refusal: "?’ç»",
    apology: "?“æ­‰",
    instruction: "?‡ç¤º",
    description: "?è¿°",
    suggestion: "å»ºè?",
    emotion: "?…æ„Ÿè¡¨è¾¾",
    domain_filter: "é¢†åŸŸ",
    all_domains: "?¨éƒ¨é¢†åŸŸ",
    domain_daily: "?¥å¸¸",
    domain_business: "?†åŠ¡",
    domain_academic: "å­?œ¯",
    domain_travel: "?…è¡Œ",
    domain_food: "é£Ÿç‰©",
    domain_nature: "?ªç„¶",
    domain_technology: "?€??,
    domain_health: "?¥åº·",
    domain_sports: "ä½“è‚²",
    domain_entertainment: "å¨±ä¹",
    domain_other: "?¶ä»–",

    // å­¦ä¹ æ¨¡å¼?¡ç‰‡ç¿»è¯‘
    vocabulary_learning_modes: "è¯æ±‡å­¦ä¹ æ¨¡å¼",
    vocabulary_data_upload: "è¯æ±‡?°æ®ä¸Šä¼ ",
    flashcard_mode: "?ªå¡",
    flashcard_mode_desc: "?šè¿‡ç¿»è½¬?¡ç‰‡å­¦ä¹ ?•è¯?Œå«ä¹?,
    typing_mode: "?“å­—",
    typing_mode_desc: "?šè¿‡?¬å†™?Œå‡†ç¡?‰“å­—ç»ƒä¹ æ‹¼??,
    pronunciation_mode: "?‘éŸ³ç»ƒä¹ ",
    pronunciation_mode_desc: "?šè¿‡è¯?Ÿ³è¯†åˆ«è®?»ƒ?†ç¡®?‘éŸ³",

    // å­¦ä¹ æ¨¡å¼ç¿»è¯‘
    flashcard_learning: "?ƒ ?ªå¡å­¦ä¹ ",
    typing_learning: "?¨ï¸ ?“å­—å­¦ä¹ ",
    pronunciation_practice: "?¤ ?‘éŸ³ç»ƒä¹ ",
    grammar_pattern_analysis: "?“ è¯?³•æ¨¡å¼?†æ",
    grammar_practice: "?“š è¯?³•ç»ƒä¹ ",
    reading_learning: "?…è?å­¦ä¹ ",

    // ?ªå¡æ¨¡å¼ç¿»è¯‘
    click_to_check_meaning: "?¹å‡»?¥çœ‹?«ä¹‰",
    click_to_see_word: "?æ¬¡?¹å‡»?¥çœ‹?•è¯",
    back_to_dashboard: "è¿”å›ä»ªè¡¨??,
    back: "è¿”å›",

    // ?“å­—æ¨¡å¼ç¿»è¯‘
    typing_answer_placeholder: "è¯·è¾“?¥ç­”æ¡?,
    check: "æ£€??,

    // ?‘éŸ³ç»ƒä¹ æ¨¡å¼ç¿»è¯‘
    pronunciation_coming_soon: "?‘éŸ³ç»ƒä¹ æ¨¡å¼?³å°†?¨å‡º??,

    // è¯?³•æ¨¡å¼ç¿»è¯‘
    click_to_see_explanation: "?¹å‡»?¥çœ‹è§£é‡Š",

    // ?…è?æ¨¡å¼ç¿»è¯‘
    original_text: "?Ÿæ–‡",
    translation: "ç¿»è¯‘",
    context: "è¯?¢ƒ",

    // ?¬å…±?‰é’®ç¿»è¯‘
    home: "é¦–é¡µ",
    back_to_home: "è¿”å›é¦–é¡µ",

    // ? æ•°??¶ˆ??    no_data: "æ²¡æœ‰?°æ®",
    no_data_description: "æ²¡æœ‰å­¦ä¹ ?°æ®?‚è??ˆä¸Šä¼ æ•°??€?,

    // ä¸Šä¼ æ¨¡æ€æ¡†ç¿»è¯‘
    concept_upload: "æ¦‚å¿µä¸Šä¼ ",
    grammar_pattern_upload: "è¯?³•æ¨¡å¼ä¸Šä¼ ",
    example_upload: "ä¾‹å¥ä¸Šä¼ ",
    upload_csv_json_concept: "ä¸Šä¼ CSV?–JSON?‡ä»¶ä»¥æ·»? æ¦‚å¿µã€?,
    upload_csv_json_grammar: "ä¸Šä¼ CSV?–JSON?‡ä»¶ä»¥æ·»? è?æ³•æ¨¡å¼ã€?,
    upload_csv_json_example: "ä¸Šä¼ CSV?–JSON?‡ä»¶ä»¥æ·»? ä¾‹?¥ã€?,
    upload: "ä¸Šä¼ ",
    download_template: "ä¸‹è½½æ¨¡æ¿",

    // ì¶”ì²œ ?™ìŠµ ê´€??ë²ˆì—­
    flashcard_recommended: "?ªå¡",
    recommended: "?¨è",
    recommendation_reason: "?ºäº?€è¿‘å?ä¹ æ¨¡å¼æ¨??,
  },
};

// ?„ì—­ ë²ˆì—­ ê°ì²´ë¡??¤ì •
if (typeof window !== "undefined") {
  window.translations = translations;
}

// ?¸ì–´ ìºì‹±???„í•œ ë³€??let cachedLanguage = null;
let languageDetectionInProgress = false;

// ë¸Œë¼?°ì? ê¸°ë³¸ ?¸ì–´ ê°ì?
function detectBrowserLanguage() {
  const language = navigator.language || navigator.userLanguage;
  const shortLang = language.split("-")[0]; // ko-KR, en-US ?±ì—??ì£??¸ì–´ ì½”ë“œë§?ì¶”ì¶œ

  // ì§€?ë˜???¸ì–´?¸ì? ?•ì¸
  return SUPPORTED_LANGUAGES[shortLang] ? shortLang : "en"; // ì§€?ë˜ì§€ ?Šìœ¼ë©??ì–´ê°€ ê¸°ë³¸
}

// ?¬ìš©?ì˜ ?„ì¹˜ ?•ë³´ë¡??¸ì–´ ì¶”ì¸¡
async function detectLanguageFromLocation() {
  try {
    // IP ê¸°ë°˜ ?„ì¹˜ ?•ë³´ API ?¬ìš©
    const response = await fetch("https://ipapi.co/json/");
    const data = await response.json();

    // êµ?? ì½”ë“œ???°ë¥¸ ?¸ì–´ ë§¤í•‘ (ê°„ë‹¨???ˆì‹œ)
    const countryToLang = {
      KR: "ko",
      JP: "ja",
      CN: "zh",
      TW: "zh",
      HK: "zh",
    };

    return countryToLang[data.country] || detectBrowserLanguage();
  } catch (error) {
    console.error("?„ì¹˜ ê¸°ë°˜ ?¸ì–´ ê°ì? ?¤íŒ¨:", error);
    return detectBrowserLanguage();
  }
}

// ?„ì¬ ?¬ìš© ?¸ì–´ ê°€?¸ì˜¤ê¸?function getCurrentLanguage() {
  return localStorage.getItem("userLanguage") || "auto";
}

// ?„ì¬ ?œì„±?”ëœ ?¸ì–´ ì½”ë“œ ê°€?¸ì˜¤ê¸?(ìºì‹± ë°?ì¤‘ë³µ ?¸ì¶œ ë°©ì?)
async function getActiveLanguage() {
  // ?´ë? ê°ì? ì¤‘ì´ë©??€ê¸?  if (languageDetectionInProgress) {
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (!languageDetectionInProgress && cachedLanguage) {
          clearInterval(checkInterval);
          resolve(cachedLanguage);
        }
      }, 100);
    });
  }

  // ìºì‹œ???¸ì–´ê°€ ?ˆìœ¼ë©?ë°˜í™˜
  if (cachedLanguage) {
    console.log("ìºì‹œ???¸ì–´ ?¬ìš©:", cachedLanguage);
    return cachedLanguage;
  }

  languageDetectionInProgress = true;

  try {
    // 1. ë¨¼ì? localStorage?ì„œ ?¬ìš©?ê? ì§ì ‘ ?¤ì •???¸ì–´ ?•ì¸
    const savedLang = localStorage.getItem("userLanguage");

    if (savedLang && savedLang !== "auto" && SUPPORTED_LANGUAGES[savedLang]) {
      console.log("?€?¥ëœ ?¸ì–´ ?¬ìš©:", savedLang);
      cachedLanguage = savedLang;
      localStorage.setItem("preferredLanguage", savedLang); // ?„ë©”??ì¹´í…Œê³ ë¦¬-?´ëª¨ì§€???¸ì–´ ?¤ì •???™ê¸°??      return savedLang;
    }

    // 2. ?ë™ ?¤ì •?´ê±°???€?¥ëœ ?¸ì–´ê°€ ?†ëŠ” ê²½ìš°
    console.log("?ë™ ?¸ì–´ ê°ì? ?œë„...");

    // ë¨¼ì? ë¸Œë¼?°ì? ?¸ì–´ ?œë„
    const browserLang = detectBrowserLanguage();
    if (SUPPORTED_LANGUAGES[browserLang]) {
      console.log("ë¸Œë¼?°ì? ?¸ì–´ ?¬ìš©:", browserLang);
      cachedLanguage = browserLang;
      localStorage.setItem("preferredLanguage", browserLang); // ?„ë©”??ì¹´í…Œê³ ë¦¬-?´ëª¨ì§€???¸ì–´ ?¤ì •???™ê¸°??      return browserLang;
    }

    // ë¸Œë¼?°ì? ?¸ì–´ê°€ ì§€?ë˜ì§€ ?Šìœ¼ë©??„ì¹˜ ê¸°ë°˜ ê°ì?
    try {
      const locationLang = await detectLanguageFromLocation();
      console.log("?„ì¹˜ ê¸°ë°˜ ?¸ì–´ ?¬ìš©:", locationLang);
      cachedLanguage = locationLang;
      localStorage.setItem("preferredLanguage", locationLang); // ?„ë©”??ì¹´í…Œê³ ë¦¬-?´ëª¨ì§€???¸ì–´ ?¤ì •???™ê¸°??      return locationLang;
    } catch (error) {
      console.error("?„ì¹˜ ê¸°ë°˜ ?¸ì–´ ê°ì? ?¤íŒ¨, ê¸°ë³¸ ?¸ì–´ ?¬ìš©");
      cachedLanguage = "ko"; // ìµœì¢… ê¸°ë³¸ê°? ?œêµ­??      localStorage.setItem("preferredLanguage", "ko"); // ?„ë©”??ì¹´í…Œê³ ë¦¬-?´ëª¨ì§€???¸ì–´ ?¤ì •???™ê¸°??      return "ko";
    }
  } finally {
    languageDetectionInProgress = false;
  }
}

// ?¸ì–´ ?¤ì • ?€??ë°??ìš©
function setLanguage(langCode) {
  console.log("?¸ì–´ ?¤ì • ë³€ê²?", langCode);

  if (langCode === "auto") {
    localStorage.removeItem("userLanguage");
    localStorage.removeItem("preferredLanguage"); // ?„ë©”??ì¹´í…Œê³ ë¦¬-?´ëª¨ì§€???¸ì–´ ?¤ì •???œê±°
    cachedLanguage = null; // ìºì‹œ ì´ˆê¸°??  } else {
    localStorage.setItem("userLanguage", langCode);
    localStorage.setItem("preferredLanguage", langCode); // ?„ë©”??ì¹´í…Œê³ ë¦¬-?´ëª¨ì§€???¸ì–´ ?¤ì •???€??    cachedLanguage = langCode; // ìºì‹œ ?…ë°?´íŠ¸
  }

  // ?¸ì–´ ?ìš© ë°?ë©”í??°ì´???…ë°?´íŠ¸
  applyLanguage();

  // ?„ì¬ ?˜ì´ì§€ ? í˜• ê°ì??˜ì—¬ ?ì ˆ??ë©”í??°ì´???…ë°?´íŠ¸
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

// ?¸ì–´ ë³€ê²??ìš© (ë¬´í•œë£¨í”„ ë°©ì?)
async function applyLanguage() {
  try {
    const langCode = await getActiveLanguage();

    if (!translations[langCode]) {
      console.error(`ë²ˆì—­ ?°ì´?°ê? ?†ëŠ” ?¸ì–´?…ë‹ˆ?? ${langCode}`);
      return;
    }

    // ?¼ë°˜ ?ìŠ¤???”ì†Œ ë²ˆì—­ (option ?œê·¸ ?¬í•¨)
    document.querySelectorAll("[data-i18n]").forEach((element) => {
      const key = element.getAttribute("data-i18n");
      if (translations[langCode][key]) {
        element.textContent = translations[langCode][key];
      }
    });

    // placeholder ?ì„±???ˆëŠ” ?…ë ¥ ?„ë“œ???€??ë²ˆì—­ ?ìš©
    document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
      const key = element.getAttribute("data-i18n-placeholder");
      if (translations[langCode][key]) {
        element.placeholder = translations[langCode][key];
      }
    });

    // HTML lang ?ì„± ë³€ê²?    document.documentElement.lang = langCode;

    // ?„ë©”??ì¹´í…Œê³ ë¦¬-?´ëª¨ì§€ ?µì…˜ ?…ë°?´íŠ¸ (?ˆëŠ” ê²½ìš°ë§?
    if (typeof window.updateDomainCategoryEmojiLanguage === "function") {
      window.updateDomainCategoryEmojiLanguage();
    }

    // ?™ìŠµ ?˜ì´ì§€???„í„° ?µì…˜ ?…ë°?´íŠ¸ (?ˆëŠ” ê²½ìš°ë§?
    if (typeof window.updateFilterOptionsLanguage === "function") {
      window.updateFilterOptionsLanguage();
    }

    // ?´ë²¤??ë°œìƒ - ?¸ì–´ ë³€ê²½ì„ ?Œë¦¼
    document.dispatchEvent(
      new CustomEvent("languageChanged", { detail: { language: langCode } })
    );
  } catch (error) {
    console.error("?¸ì–´ ?ìš© ì¤??¤ë¥˜:", error);
  }
}

// ?¸ì–´ ?¤ì • ëª¨ë‹¬ ?œì‹œ
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
          <h3 class="text-xl font-bold" data-i18n="language_settings">?¸ì–´ ?¤ì •</h3>
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
              <label for="lang-auto">?ë™ ê°ì? (Auto Detect)</label>
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
          <button id="save-language" class="bg-[#4B63AC] text-white px-4 py-2 rounded hover:bg-[#3A4F8B]" data-i18n="save">?€??/button>
        </div>
      </div>
    </div>
  `;

  // ëª¨ë‹¬ ì¶”ê?
  const modalContainer = document.createElement("div");
  modalContainer.innerHTML = modalHTML;
  document.body.appendChild(modalContainer.firstElementChild);

  // ?´ë²¤???¸ë“¤??  document
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

    console.log("?¸ì–´ ?¤ì • ?€??", selectedLang);

    // ?¸ì–´ ?¤ì • ?€??ë°??ìš©
    setLanguage(selectedLang);

    // ëª¨ë‹¬ ?«ê¸°
    document.getElementById("language-settings-modal").classList.add("hidden");

    // ?±ê³µ ë©”ì‹œì§€ (? íƒ?¬í•­)
    console.log("?¸ì–´ ?¤ì •???€?¥ë˜?ˆìŠµ?ˆë‹¤:", selectedLang);
  });
}

// ë©”í??°ì´???…ë°?´íŠ¸ ?¨ìˆ˜ (ìºì‹œ???¸ì–´ ?¬ìš©)
async function updateMetadata(pageType = "home") {
  try {
    // ìºì‹œ???¸ì–´ë¥?ë¨¼ì? ?•ì¸, ?†ìœ¼ë©?ê°ì?
    let langCode = cachedLanguage;
    if (!langCode) {
      langCode = await getActiveLanguage();
    }

    if (!seoMetadata[pageType] || !seoMetadata[pageType][langCode]) {
      console.error(`ë©”í??°ì´?°ê? ?†ìŠµ?ˆë‹¤: ${pageType}, ${langCode}`);
      return;
    }

    const metadata = seoMetadata[pageType][langCode];

    // ?€?´í? ?…ë°?´íŠ¸
    document.title = metadata.title;

    // ë©”í? ?œê·¸ ?…ë°?´íŠ¸ ?ëŠ” ?ì„±
    updateOrCreateMetaTag("description", metadata.description);
    updateOrCreateMetaTag("keywords", metadata.keywords);

    // Open Graph ë©”í? ?œê·¸
    updateOrCreateMetaTag("og:title", metadata.title, "property");
    updateOrCreateMetaTag("og:description", metadata.description, "property");
    updateOrCreateMetaTag("og:locale", langCode, "property");

    // ?€ì²??¸ì–´ ë§í¬ ?…ë°?´íŠ¸
    updateAlternateLanguageLinks(pageType, langCode);

    // ?œì? ë§í¬(canonical) ?…ë°?´íŠ¸
    updateOrCreateLinkTag("canonical", metadata.canonical);

    // hreflang ?œê·¸ ?…ë°?´íŠ¸
    updateHreflangTags(pageType, langCode);
  } catch (error) {
    console.error("ë©”í??°ì´???…ë°?´íŠ¸ ì¤??¤ë¥˜ ë°œìƒ:", error);
  }
}

// ë©”í? ?œê·¸ ?…ë°?´íŠ¸ ?ëŠ” ?ì„± ?¬í¼ ?¨ìˆ˜
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

// ë§í¬ ?œê·¸ ?…ë°?´íŠ¸ ?ëŠ” ?ì„± ?¬í¼ ?¨ìˆ˜
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

// hreflang ?œê·¸ ?…ë°?´íŠ¸ ?¨ìˆ˜
function updateHreflangTags(pageType, currentLangCode) {
  // ê¸°ì¡´ hreflang ?œê·¸ ëª¨ë‘ ?œê±°
  document
    .querySelectorAll('link[rel="alternate"][hreflang]')
    .forEach((tag) => tag.remove());

  // ê°?ì§€???¸ì–´???€??hreflang ?œê·¸ ì¶”ê?
  Object.keys(SUPPORTED_LANGUAGES).forEach((langCode) => {
    const href = seoMetadata[pageType][langCode].canonical;

    const linkTag = document.createElement("link");
    linkTag.setAttribute("rel", "alternate");
    linkTag.setAttribute("hreflang", langCode);
    linkTag.setAttribute("href", href);
    document.head.appendChild(linkTag);
  });

  // x-default hreflang ?œê·¸ ì¶”ê? (ê¸°ë³¸?ìœ¼ë¡??ì–´ ë²„ì „?¼ë¡œ ?¤ì •)
  const defaultHref = seoMetadata[pageType]["en"].canonical;
  const defaultLinkTag = document.createElement("link");
  defaultLinkTag.setAttribute("rel", "alternate");
  defaultLinkTag.setAttribute("hreflang", "x-default");
  defaultLinkTag.setAttribute("href", defaultHref);
  document.head.appendChild(defaultLinkTag);
}

// ?€ì²??¸ì–´ ë§í¬ ?…ë°?´íŠ¸ ?¨ìˆ˜
function updateAlternateLanguageLinks(pageType, currentLangCode) {
  // ?¤ë¥¸ ?¸ì–´ ë²„ì „???€??ë§í¬ ?…ë°?´íŠ¸
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
