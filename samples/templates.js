// 템플릿 데이터 모듈
export const EXAMPLES_TEMPLATE = [
  {
    domain: "daily",
    category: "routine",
    difficulty: "basic",
    situation: ["polite", "social"],
    purpose: "greeting",
    translations: {
      korean: "안녕하세요! 처음 뵙겠습니다.",
      english: "Hello! Nice to meet you for the first time.",
      japanese: "こんにちは！初めてお会いします。",
      chinese: "你好！初次见面。",
    },
  },
  {
    domain: "food",
    category: "fruit",
    difficulty: "basic",
    situation: ["shopping", "public", "polite"],
    purpose: "request",
    translations: {
      korean: "사과 주스 하나 주세요.",
      english: "Please give me one apple juice.",
      japanese: "りんごジュースを一つください。",
      chinese: "请给我一杯苹果汁。",
    },
  },
  {
    domain: "school",
    category: "education",
    difficulty: "intermediate",
    situation: ["school"],
    purpose: "question",
    translations: {
      korean: "이 문제를 어떻게 풀어야 하나요?",
      english: "How should I solve this problem?",
      japanese: "この問題をどう解けばいいですか？",
      chinese: "这个问题应该怎么解决？",
    },
  },
];

export const CONCEPTS_TEMPLATE = [
  {
    concept_info: {
      domain: "daily",
      category: "fruit",
      difficulty: "beginner",
      unicode_emoji: "🍎",
      color_theme: "#FF6B6B",
      situation: ["casual", "shopping"],
      purpose: "description",
    },
    expressions: {
      korean: {
        word: "사과",
        pronunciation: "sa-gwa",
        definition: "둥글고 빨간 과일",
        part_of_speech: "명사",
        synonyms: ["능금"],
        antonyms: [],
        word_family: ["과일", "음식"],
        compound_words: ["사과나무", "사과즙"],
        collocations: ["빨간 사과", "맛있는 사과"],
      },
      english: {
        word: "apple",
        pronunciation: "/ˈæpəl/",
        definition: "a round fruit with red or green skin",
        part_of_speech: "noun",
        synonyms: [],
        antonyms: [],
        word_family: ["fruit", "food"],
        compound_words: ["apple tree", "apple juice"],
        collocations: ["red apple", "fresh apple"],
      },
      chinese: {
        word: "苹果",
        pronunciation: "píng guǒ",
        definition: "圆形的红色或绿色水果",
        part_of_speech: "名词",
        synonyms: ["苹子"],
        antonyms: [],
        word_family: ["水果", "食物"],
        compound_words: ["苹果树", "苹果汁"],
        collocations: ["红苹果", "新鲜苹果"],
      },
      japanese: {
        word: "りんご",
        pronunciation: "ringo",
        definition: "赤いまたは緑色の丸い果物",
        part_of_speech: "名詞",
        synonyms: ["アップル"],
        antonyms: [],
        word_family: ["果物", "食べ物"],
        compound_words: ["りんごの木", "りんごジュース"],
        collocations: ["赤いりんご", "新鮮なりんご"],
      },
    },
    representative_example: {
      korean: "나는 빨간 사과를 좋아한다.",
      english: "I like red apples.",
      chinese: "我喜欢红苹果。",
      japanese: "私は赤いりんごが好きです。",
    },
  },
  {
    concept_info: {
      domain: "daily",
      category: "beverage",
      difficulty: "beginner",
      unicode_emoji: "☕",
      color_theme: "#8B4513",
      situation: ["casual", "social"],
      purpose: "description",
    },
    expressions: {
      korean: {
        word: "커피",
        pronunciation: "keo-pi",
        definition: "볶은 커피콩으로 만든 음료",
        part_of_speech: "명사",
        synonyms: [],
        antonyms: [],
        word_family: ["음료", "카페"],
        compound_words: ["커피숍", "커피잔"],
        collocations: ["뜨거운 커피", "아메리카노"],
      },
      english: {
        word: "coffee",
        pronunciation: "/ˈkɔːfi/",
        definition: "a drink made from roasted coffee beans",
        part_of_speech: "noun",
        synonyms: [],
        antonyms: [],
        word_family: ["beverage", "drink"],
        compound_words: ["coffee shop", "coffee cup"],
        collocations: ["hot coffee", "black coffee"],
      },
      chinese: {
        word: "咖啡",
        pronunciation: "kā fēi",
        definition: "用烘焙过的咖啡豆制成的饮料",
        part_of_speech: "名词",
        synonyms: [],
        antonyms: [],
        word_family: ["饮料", "咖啡厅"],
        compound_words: ["咖啡店", "咖啡杯"],
        collocations: ["热咖啡", "黑咖啡"],
      },
      japanese: {
        word: "コーヒー",
        pronunciation: "kōhī",
        definition: "焙煎したコーヒー豆から作られる飲み物",
        part_of_speech: "名詞",
        synonyms: [],
        antonyms: [],
        word_family: ["飲み物", "カフェ"],
        compound_words: ["コーヒーショップ", "コーヒーカップ"],
        collocations: ["熱いコーヒー", "ブラックコーヒー"],
      },
    },
    representative_example: {
      korean: "아침에 커피를 마셔요.",
      english: "I drink coffee in the morning.",
      chinese: "我早上喝咖啡。",
      japanese: "朝にコーヒーを飲みます。",
    },
  },
];

export const GRAMMAR_TEMPLATE = [
  {
    domain: "daily",
    category: "greeting",
    pattern: {
      korean: {
        title: "기본 인사",
        structure: "안녕하세요",
        description:
          "가장 기본적인 한국어 인사말로, 누구에게나 사용할 수 있는 정중한 표현입니다.",
      },
      english: {
        title: "Basic Greeting",
        structure: "Hello",
        description:
          "The most basic Korean greeting that can be used with anyone politely.",
      },
      japanese: {
        title: "基本的な挨拶",
        structure: "こんにちは",
        description: "誰にでも丁寧に使える最も基本的な韓国語の挨拶です。",
      },
      chinese: {
        title: "基本问候",
        structure: "您好",
        description: "最基本的韩语问候语，可以礼貌地对任何人使用。",
      },
    },
    example: {
      korean: "안녕하세요, 처음 뵙겠습니다.",
      english: "Hello, nice to meet you.",
      japanese: "こんにちは、初めまして。",
      chinese: "您好，初次见面。",
    },
    difficulty: "basic",
    situation: ["polite", "social"],
    purpose: "greeting",
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    domain: "food",
    category: "ordering",
    pattern: {
      korean: {
        title: "음식 주문",
        structure: "___을/를 주세요",
        description:
          "음식점이나 상점에서 무언가를 주문하거나 요청할 때 사용하는 정중한 표현입니다.",
      },
      english: {
        title: "Food Ordering",
        structure: "Please give me ___",
        description:
          "A polite expression used to order or request something at restaurants or shops.",
      },
      japanese: {
        title: "食べ物の注文",
        structure: "___をください",
        description:
          "レストランや店で何かを注文したり要求したりするときに使う丁寧な表現です。",
      },
      chinese: {
        title: "点餐",
        structure: "请给我___",
        description: "在餐厅或商店订购或要求某物时使用的礼貌表达。",
      },
    },
    example: {
      korean: "김치찌개를 주세요.",
      english: "Please give me kimchi stew.",
      japanese: "キムチチゲをください。",
      chinese: "请给我泡菜汤。",
    },
    difficulty: "basic",
    situation: ["shopping", "public", "polite"],
    purpose: "request",
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    domain: "daily",
    category: "tense",
    pattern: {
      korean: {
        title: "과거형 표현",
        structure: "___었/았어요",
        description:
          "과거에 일어난 일을 표현할 때 사용하는 기본적인 과거형 어미입니다.",
      },
      english: {
        title: "Past Tense Expression",
        structure: "___ + past tense",
        description:
          "Basic past tense ending used to express things that happened in the past.",
      },
      japanese: {
        title: "過去形表現",
        structure: "___ました",
        description:
          "過去に起こったことを表現するときに使う基本的な過去形語尾です。",
      },
      chinese: {
        title: "过去时表达",
        structure: "___了",
        description: "用于表达过去发生的事情的基本过去时词尾。",
      },
    },
    example: {
      korean: "어제 친구를 만났어요.",
      english: "I met a friend yesterday.",
      japanese: "昨日友達に会いました。",
      chinese: "昨天见了朋友。",
    },
    difficulty: "intermediate",
    situation: ["casual"],
    purpose: "description",
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    domain: "business",
    category: "request",
    pattern: {
      korean: {
        title: "정중한 요청",
        structure: "동사 어간 + 아/어 주세요",
        description: "다른 사람에게 정중하게 부탁할 때 사용하는 표현입니다.",
      },
      english: {
        title: "Polite Request",
        structure: "Please + verb",
        description: "Expression used to make polite requests to others.",
      },
      japanese: {
        title: "丁寧な依頼",
        structure: "動詞 + てください",
        description: "他の人に丁寧にお願いするときに使う表現です。",
      },
      chinese: {
        title: "礼貌请求",
        structure: "请 + 动词",
        description: "用于向他人礼貌地提出请求的表达方式。",
      },
    },
    example: {
      korean: "회의 자료를 준비해 주세요.",
      english: "Please prepare the meeting materials.",
      japanese: "会議資料を準備してください。",
      chinese: "请准备会议资料。",
    },
    difficulty: "intermediate",
    situation: ["work", "polite"],
    purpose: "request",
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    domain: "education",
    category: "question",
    pattern: {
      korean: {
        title: "질문 표현",
        structure: "의문사 + 주어 + 동사 + 까요?",
        description: "정보를 묻거나 확인할 때 사용하는 질문 표현입니다.",
      },
      english: {
        title: "Question Expression",
        structure: "Question word + subject + verb + ?",
        description:
          "Question expression used to ask for information or confirmation.",
      },
      japanese: {
        title: "質問表現",
        structure: "疑問詞 + 主語 + 動詞 + か？",
        description: "情報を尋ねたり確認したりするときに使う質問表現です。",
      },
      chinese: {
        title: "疑问表达",
        structure: "疑问词 + 主语 + 动词 + ？",
        description: "用于询问信息或确认的疑问表达方式。",
      },
    },
    example: {
      korean: "이 문제를 어떻게 풀까요?",
      english: "How should we solve this problem?",
      japanese: "この問題をどう解きましょうか？",
      chinese: "这个问题应该怎么解决？",
    },
    difficulty: "intermediate",
    situation: ["school"],
    purpose: "question",
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    domain: "daily",
    category: "request",
    pattern: {
      korean: {
        title: "정중한 요청",
        structure: "동사 어간 + 아/어 주세요",
        description: "다른 사람에게 정중하게 부탁할 때 사용하는 표현입니다.",
      },
      english: {
        title: "Polite Request",
        structure: "Please + verb",
        description: "Expression used to make polite requests to others.",
      },
      japanese: {
        title: "丁寧な依頼",
        structure: "動詞 + てください",
        description: "他の人に丁寧にお願いするときに使う表現です。",
      },
      chinese: {
        title: "礼貌请求",
        structure: "请 + 动词",
        description: "用于向他人礼貌地提出请求的表达方式。",
      },
    },
    example: {
      korean: "도와주세요.",
      english: "Please help me.",
      japanese: "手伝ってください。",
      chinese: "请帮助我。",
    },
    difficulty: "beginner",
    situation: ["polite", "social"],
    purpose: "request",
    created_at: "2024-01-01T00:00:00Z",
  },
];

// CSV 형태로 변환하는 유틸리티 함수들
export function examplesTemplateToCSV() {
  const headers = [
    "domain",
    "category",
    "difficulty",
    "situation",
    "purpose",
    "korean_text",
    "english_text",
    "japanese_text",
    "chinese_text",
  ];
  const rows = EXAMPLES_TEMPLATE.map((item) => [
    item.domain,
    item.category,
    item.difficulty,
    Array.isArray(item.situation) ? item.situation.join(",") : item.situation,
    item.purpose,
    item.translations.korean,
    item.translations.english,
    item.translations.japanese,
    item.translations.chinese,
  ]);

  return [headers, ...rows]
    .map((row) =>
      row
        .map((cell) =>
          typeof cell === "string" && cell.includes(",") ? `"${cell}"` : cell
        )
        .join(",")
    )
    .join("\n");
}

export function conceptsTemplateToCSV() {
  const headers = [
    "domain",
    "category",
    "difficulty",
    "unicode_emoji",
    "color_theme",
    "situation",
    "purpose",
    "korean_word",
    "korean_pronunciation",
    "korean_definition",
    "korean_part_of_speech",
    "korean_synonyms",
    "korean_word_family",
    "korean_compound_words",
    "korean_collocations",
    "english_word",
    "english_pronunciation",
    "english_definition",
    "english_part_of_speech",
    "english_synonyms",
    "english_word_family",
    "english_compound_words",
    "english_collocations",
    "chinese_word",
    "chinese_pronunciation",
    "chinese_definition",
    "chinese_part_of_speech",
    "chinese_synonyms",
    "chinese_word_family",
    "chinese_compound_words",
    "chinese_collocations",
    "japanese_word",
    "japanese_pronunciation",
    "japanese_definition",
    "japanese_part_of_speech",
    "japanese_synonyms",
    "japanese_word_family",
    "japanese_compound_words",
    "japanese_collocations",
    "example_korean",
    "example_english",
    "example_chinese",
    "example_japanese",
    "created_at",
  ];

  const rows = CONCEPTS_TEMPLATE.map((concept) => [
    concept.concept_info.domain,
    concept.concept_info.category,
    concept.concept_info.difficulty,
    concept.concept_info.unicode_emoji,
    concept.concept_info.color_theme,
    Array.isArray(concept.concept_info.situation)
      ? concept.concept_info.situation.join(",")
      : concept.concept_info.situation,
    concept.concept_info.purpose,
    concept.expressions.korean.word,
    concept.expressions.korean.pronunciation,
    concept.expressions.korean.definition,
    concept.expressions.korean.part_of_speech,
    concept.expressions.korean.synonyms.join(","),
    concept.expressions.korean.word_family.join(","),
    concept.expressions.korean.compound_words.join(","),
    concept.expressions.korean.collocations.join(","),
    concept.expressions.english.word,
    concept.expressions.english.pronunciation,
    concept.expressions.english.definition,
    concept.expressions.english.part_of_speech,
    concept.expressions.english.synonyms.join(","),
    concept.expressions.english.word_family.join(","),
    concept.expressions.english.compound_words.join(","),
    concept.expressions.english.collocations.join(","),
    concept.expressions.chinese.word,
    concept.expressions.chinese.pronunciation,
    concept.expressions.chinese.definition,
    concept.expressions.chinese.part_of_speech,
    concept.expressions.chinese.synonyms.join(","),
    concept.expressions.chinese.word_family.join(","),
    concept.expressions.chinese.compound_words.join(","),
    concept.expressions.chinese.collocations.join(","),
    concept.expressions.japanese.word,
    concept.expressions.japanese.pronunciation,
    concept.expressions.japanese.definition,
    concept.expressions.japanese.part_of_speech,
    concept.expressions.japanese.synonyms.join(","),
    concept.expressions.japanese.word_family.join(","),
    concept.expressions.japanese.compound_words.join(","),
    concept.expressions.japanese.collocations.join(","),
    concept.representative_example.korean,
    concept.representative_example.english,
    concept.representative_example.chinese,
    concept.representative_example.japanese,
    concept.created_at,
  ]);

  return [headers, ...rows]
    .map((row) =>
      row
        .map((cell) =>
          typeof cell === "string" && (cell.includes(",") || cell.includes('"'))
            ? `"${cell.replace(/"/g, '""')}"`
            : cell
        )
        .join(",")
    )
    .join("\n");
}

export function grammarTemplateToCSV() {
  const headers = [
    "domain",
    "category",
    "korean_title",
    "korean_structure",
    "korean_description",
    "english_title",
    "english_structure",
    "english_description",
    "japanese_title",
    "japanese_structure",
    "japanese_description",
    "chinese_title",
    "chinese_structure",
    "chinese_description",
    "korean_example",
    "english_example",
    "japanese_example",
    "chinese_example",
    "difficulty",
    "situation",
    "purpose",
  ];

  const rows = GRAMMAR_TEMPLATE.map((grammar) => [
    grammar.domain,
    grammar.category,
    grammar.pattern.korean.title,
    grammar.pattern.korean.structure,
    grammar.pattern.korean.description,
    grammar.pattern.english.title,
    grammar.pattern.english.structure,
    grammar.pattern.english.description,
    grammar.pattern.japanese.title,
    grammar.pattern.japanese.structure,
    grammar.pattern.japanese.description,
    grammar.pattern.chinese.title,
    grammar.pattern.chinese.structure,
    grammar.pattern.chinese.description,
    grammar.example.korean,
    grammar.example.english,
    grammar.example.japanese,
    grammar.example.chinese,
    grammar.difficulty,
    Array.isArray(grammar.situation)
      ? grammar.situation.join(",")
      : grammar.situation,
    grammar.purpose,
  ]);

  return [headers, ...rows];
}
