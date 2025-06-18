// 템플릿 데이터 모듈
export const EXAMPLES_TEMPLATE = [
  {
    domain: "daily",
    category: "routine",
    difficulty: "basic",
    situation: ["formal", "social"],
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
    situation: ["shopping"],
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
      tags: ["food", "healthy", "common"],
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
      tags: ["drink", "daily", "cafe"],
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
    pattern_name: "기본 인사",
    structural_pattern: "안녕하세요",
    explanation:
      "가장 기본적인 한국어 인사말로, 누구에게나 사용할 수 있는 정중한 표현입니다.",
    example: {
      korean: "안녕하세요, 처음 뵙겠습니다.",
      english: "Hello, nice to meet you.",
      japanese: "こんにちは、初めまして。",
      chinese: "您好，初次见面。",
    },
    difficulty: "basic",
    tags: ["formal", "greeting"],
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    pattern_name: "음식 주문",
    structural_pattern: "___을/를 주세요",
    explanation:
      "음식점이나 상점에서 무언가를 주문하거나 요청할 때 사용하는 정중한 표현입니다.",
    example: {
      korean: "김치찌개를 주세요.",
      english: "Please give me kimchi stew.",
      japanese: "キムチチゲをください。",
      chinese: "请给我泡菜汤。",
    },
    difficulty: "basic",
    tags: ["casual", "request"],
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
    "tags",
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
    concept.concept_info.tags.join(","),
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
    "pattern_name",
    "structural_pattern",
    "explanation",
    "korean_example",
    "english_example",
    "japanese_example",
    "chinese_example",
    "difficulty",
    "tags",
    "created_at",
  ];

  const rows = GRAMMAR_TEMPLATE.map((grammar) => [
    grammar.pattern_name,
    grammar.structural_pattern,
    grammar.explanation,
    grammar.example.korean,
    grammar.example.english,
    grammar.example.japanese,
    grammar.example.chinese,
    grammar.difficulty,
    grammar.tags.join(","),
    grammar.created_at,
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
