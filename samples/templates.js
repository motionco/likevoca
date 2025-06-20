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
      category: "shopping",
      difficulty: "basic",
      unicode_emoji: "🛒",
      color_theme: "#FF6B6B",
      situation: ["casual", "shopping"],
      purpose: "description",
    },
    expressions: {
      korean: {
        word: "쇼핑",
        pronunciation: "sho-ping",
        definition: "물건을 사는 행위",
        part_of_speech: "명사",
        synonyms: ["구매", "구입"],
        antonyms: [],
        word_family: ["구매", "시장"],
        compound_words: ["쇼핑몰", "쇼핑백"],
        collocations: ["온라인 쇼핑", "주말 쇼핑"],
      },
      english: {
        word: "shopping",
        pronunciation: "/ˈʃɒpɪŋ/",
        definition: "the activity of buying things from shops",
        part_of_speech: "noun",
        synonyms: ["purchasing", "buying"],
        antonyms: [],
        word_family: ["purchase", "market"],
        compound_words: ["shopping mall", "shopping bag"],
        collocations: ["online shopping", "weekend shopping"],
      },
      chinese: {
        word: "购物",
        pronunciation: "gòu wù",
        definition: "购买商品的活动",
        part_of_speech: "名词",
        synonyms: ["买东西", "采购"],
        antonyms: [],
        word_family: ["购买", "市场"],
        compound_words: ["购物中心", "购物袋"],
        collocations: ["网上购物", "周末购物"],
      },
      japanese: {
        word: "ショッピング",
        pronunciation: "shoppingu",
        definition: "物を買う活動",
        part_of_speech: "名詞",
        synonyms: ["買い物", "購入"],
        antonyms: [],
        word_family: ["購入", "市場"],
        compound_words: ["ショッピングモール", "ショッピングバッグ"],
        collocations: ["オンラインショッピング", "週末のショッピング"],
      },
    },
    representative_example: {
      korean: "나는 주말에 쇼핑을 갑니다.",
      english: "I go shopping on weekends.",
      chinese: "我周末去购物。",
      japanese: "週末にショッピングに行きます。",
    },
  },
  {
    concept_info: {
      domain: "culture",
      category: "tradition",
      difficulty: "intermediate",
      unicode_emoji: "🏛️",
      color_theme: "#9C27B0",
      situation: ["formal", "educational"],
      purpose: "cultural_knowledge",
    },
    expressions: {
      korean: {
        word: "전통",
        pronunciation: "jeon-tong",
        definition: "옛날부터 전해 내려오는 관습이나 문화",
        part_of_speech: "명사",
        synonyms: ["관습", "풍습"],
        antonyms: ["현대", "신식"],
        word_family: ["문화", "역사"],
        compound_words: ["전통문화", "전통음식"],
        collocations: ["한국 전통", "전통 보존"],
      },
      english: {
        word: "tradition",
        pronunciation: "/trəˈdɪʃən/",
        definition: "customs and beliefs passed down through generations",
        part_of_speech: "noun",
        synonyms: ["custom", "heritage"],
        antonyms: ["modernity", "innovation"],
        word_family: ["culture", "history"],
        compound_words: ["traditional culture", "traditional food"],
        collocations: ["Korean tradition", "preserve tradition"],
      },
      chinese: {
        word: "传统",
        pronunciation: "chuán tǒng",
        definition: "世代相传的习俗和文化",
        part_of_speech: "名词",
        synonyms: ["习俗", "风俗"],
        antonyms: ["现代", "创新"],
        word_family: ["文化", "历史"],
        compound_words: ["传统文化", "传统食物"],
        collocations: ["韩国传统", "保护传统"],
      },
      japanese: {
        word: "伝統",
        pronunciation: "dentō",
        definition: "代々受け継がれてきた習慣や文化",
        part_of_speech: "名詞",
        synonyms: ["慣習", "風習"],
        antonyms: ["現代", "革新"],
        word_family: ["文化", "歴史"],
        compound_words: ["伝統文化", "伝統料理"],
        collocations: ["韓国の伝統", "伝統を保存"],
      },
    },
    representative_example: {
      korean: "한국의 전통 문화를 보존해야 합니다.",
      english: "We should preserve Korean traditional culture.",
      chinese: "我们应该保护韩国传统文化。",
      japanese: "韓国の伝統文化を保存すべきです。",
    },
  },
  {
    concept_info: {
      domain: "education",
      category: "online_learning",
      difficulty: "intermediate",
      unicode_emoji: "💻",
      color_theme: "#2196F3",
      situation: ["academic", "modern"],
      purpose: "learning_method",
    },
    expressions: {
      korean: {
        word: "온라인 학습",
        pronunciation: "on-la-in hak-seup",
        definition: "인터넷을 통해 이루어지는 학습",
        part_of_speech: "명사",
        synonyms: ["인터넷 학습", "사이버 교육"],
        antonyms: ["오프라인 학습", "대면 교육"],
        word_family: ["교육", "학습"],
        compound_words: ["온라인강의", "원격학습"],
        collocations: ["온라인 수업", "디지털 학습"],
      },
      english: {
        word: "online learning",
        pronunciation: "/ˈɒnlaɪn ˈlɜːrnɪŋ/",
        definition: "education that takes place over the Internet",
        part_of_speech: "noun",
        synonyms: ["e-learning", "distance learning"],
        antonyms: ["offline learning", "face-to-face education"],
        word_family: ["education", "learning"],
        compound_words: ["online course", "remote learning"],
        collocations: ["online class", "digital learning"],
      },
      chinese: {
        word: "在线学习",
        pronunciation: "zài xiàn xué xí",
        definition: "通过互联网进行的学习",
        part_of_speech: "名词",
        synonyms: ["网络学习", "远程教育"],
        antonyms: ["线下学习", "面对面教育"],
        word_family: ["教育", "学习"],
        compound_words: ["在线课程", "远程学习"],
        collocations: ["在线课堂", "数字化学习"],
      },
      japanese: {
        word: "オンライン学習",
        pronunciation: "onrain gakushū",
        definition: "インターネットを通じて行われる学習",
        part_of_speech: "名詞",
        synonyms: ["eラーニング", "遠隔学習"],
        antonyms: ["オフライン学習", "対面教育"],
        word_family: ["教育", "学習"],
        compound_words: ["オンライン講座", "リモート学習"],
        collocations: ["オンライン授業", "デジタル学習"],
      },
    },
    representative_example: {
      korean: "온라인 학습은 매우 편리합니다.",
      english: "Online learning is very convenient.",
      chinese: "在线学习非常方便。",
      japanese: "オンライン学習はとても便利です。",
    },
  },
  {
    concept_info: {
      domain: "technology",
      category: "programming",
      difficulty: "advanced",
      unicode_emoji: "💻",
      color_theme: "#4CAF50",
      situation: ["professional", "technical"],
      purpose: "skill_description",
    },
    expressions: {
      korean: {
        word: "프로그래밍",
        pronunciation: "peu-ro-geu-rae-ming",
        definition: "컴퓨터 프로그램을 만드는 과정",
        part_of_speech: "명사",
        synonyms: ["코딩", "프로그램 개발"],
        antonyms: [],
        word_family: ["기술", "컴퓨터"],
        compound_words: ["프로그래밍언어", "프로그래머"],
        collocations: ["프로그래밍 기술", "소프트웨어 개발"],
      },
      english: {
        word: "programming",
        pronunciation: "/ˈprəʊɡræmɪŋ/",
        definition: "the process of writing computer programs",
        part_of_speech: "noun",
        synonyms: ["coding", "software development"],
        antonyms: [],
        word_family: ["technology", "computer"],
        compound_words: ["programming language", "programmer"],
        collocations: ["programming skills", "software development"],
      },
      chinese: {
        word: "编程",
        pronunciation: "biān chéng",
        definition: "编写计算机程序的过程",
        part_of_speech: "名词",
        synonyms: ["编码", "程序开发"],
        antonyms: [],
        word_family: ["技术", "计算机"],
        compound_words: ["编程语言", "程序员"],
        collocations: ["编程技能", "软件开发"],
      },
      japanese: {
        word: "プログラミング",
        pronunciation: "puroguramingu",
        definition: "コンピュータープログラムを作成する過程",
        part_of_speech: "名詞",
        synonyms: ["コーディング", "プログラム開発"],
        antonyms: [],
        word_family: ["技術", "コンピューター"],
        compound_words: ["プログラミング言語", "プログラマー"],
        collocations: ["プログラミングスキル", "ソフトウェア開発"],
      },
    },
    representative_example: {
      korean: "프로그래밍을 배우고 있습니다.",
      english: "I am learning programming.",
      chinese: "我正在学习编程。",
      japanese: "プログラミングを学んでいます。",
    },
  },
  {
    concept_info: {
      domain: "other",
      category: "creativity",
      difficulty: "advanced",
      unicode_emoji: "🎨",
      color_theme: "#FF9800",
      situation: ["creative", "artistic"],
      purpose: "self_expression",
    },
    expressions: {
      korean: {
        word: "창의성",
        pronunciation: "chang-ui-seong",
        definition: "새롭고 독창적인 것을 만들어 내는 능력",
        part_of_speech: "명사",
        synonyms: ["독창성", "창조력"],
        antonyms: ["모방", "평범함"],
        word_family: ["예술", "혁신"],
        compound_words: ["창의적사고", "창의교육"],
        collocations: ["창의적 아이디어", "창의성 개발"],
      },
      english: {
        word: "creativity",
        pronunciation: "/ˌkriːeɪˈtɪvəti/",
        definition: "the ability to create original and imaginative ideas",
        part_of_speech: "noun",
        synonyms: ["originality", "innovation"],
        antonyms: ["imitation", "conformity"],
        word_family: ["art", "innovation"],
        compound_words: ["creative thinking", "creative education"],
        collocations: ["creative ideas", "develop creativity"],
      },
      chinese: {
        word: "创造力",
        pronunciation: "chuàng zào lì",
        definition: "创造新颖独特事物的能力",
        part_of_speech: "名词",
        synonyms: ["创新性", "独创性"],
        antonyms: ["模仿", "平庸"],
        word_family: ["艺术", "创新"],
        compound_words: ["创造性思维", "创意教育"],
        collocations: ["创意想法", "培养创造力"],
      },
      japanese: {
        word: "創造性",
        pronunciation: "sōzōsei",
        definition: "新しく独創的なものを生み出す能力",
        part_of_speech: "名詞",
        synonyms: ["独創性", "創造力"],
        antonyms: ["模倣", "平凡"],
        word_family: ["芸術", "革新"],
        compound_words: ["創造的思考", "創造教育"],
        collocations: ["創造的アイデア", "創造性を育てる"],
      },
    },
    representative_example: {
      korean: "창의성은 모든 분야에서 중요합니다.",
      english: "Creativity is important in all fields.",
      chinese: "创造力在所有领域都很重要。",
      japanese: "創造性はすべての分野で重要です。",
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
    difficulty: "basic",
    situation: ["polite", "social"],
    purpose: "request",
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
