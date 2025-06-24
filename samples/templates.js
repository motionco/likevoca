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
      purpose: "description",
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
];

export const EXAMPLES_TEMPLATE_CSV = `domain,category,difficulty,situation,purpose,korean,english,japanese,chinese
daily,routine,basic,"polite,social",greeting,안녕하세요! 처음 뵙겠습니다.,Hello! Nice to meet you for the first time.,こんにちは！初めてお会いします。,你好！初次见面。
food,fruit,basic,"shopping,public,polite",request,사과 주스 하나 주세요.,Please give me one apple juice.,りんごジュースを一つください。,请给我一杯苹果汁。`;

// CSV 형태로 변환하는 유틸리티 함수들
export function examplesTemplateToCSV() {
  return EXAMPLES_TEMPLATE_CSV;
}

export const CONCEPTS_TEMPLATE_CSV = `domain,category,difficulty,unicode_emoji,color_theme,situation,purpose,korean_word,korean_pronunciation,korean_definition,korean_part_of_speech,korean_synonyms,korean_antonyms,korean_word_family,korean_compound_words,korean_collocations,english_word,english_pronunciation,english_definition,english_part_of_speech,english_synonyms,english_antonyms,english_word_family,english_compound_words,english_collocations,chinese_word,chinese_pronunciation,chinese_definition,chinese_part_of_speech,chinese_synonyms,chinese_antonyms,chinese_word_family,chinese_compound_words,chinese_collocations,japanese_word,japanese_pronunciation,japanese_definition,japanese_part_of_speech,japanese_synonyms,japanese_antonyms,japanese_word_family,japanese_compound_words,japanese_collocations,representative_korean,representative_english,representative_chinese,representative_japanese
daily,shopping,basic,🛒,#FF6B6B,"casual,shopping",description,쇼핑,sho-ping,물건을 사는 행위,명사,"구매,구입",,"구매,시장","쇼핑몰,쇼핑백","온라인 쇼핑,주말 쇼핑",shopping,/ˈʃɒpɪŋ/,the activity of buying things from shops,noun,"purchasing,buying",,"purchase,market","shopping mall,shopping bag","online shopping,weekend shopping",购物,gòu wù,购买商品的活动,名词,"买东西,采购",,"购买,市场","购物中心,购物袋","网上购物,周末购物",ショッピング,shoppingu,物を買う活動,名詞,"買い物,購入",,"購入,市場","ショッピングモール,ショッピングバッグ","オンラインショッピング,週末のショッピング",나는 주말에 쇼핑을 갑니다.,I go shopping on weekends.,我周末去购物。,週末にショッピングに行きます。
culture,tradition,intermediate,🏛️,#9C27B0,"formal,educational",description,전통,jeon-tong,옛날부터 전해 내려오는 관습이나 문화,명사,"관습,풍습","현대,신식","문화,역사","전통문화,전통음식","한국 전통,전통 보존",tradition,/trəˈdɪʃən/,customs and beliefs passed down through generations,noun,"custom,heritage","modernity,innovation","culture,history","traditional culture,traditional food","Korean tradition,preserve tradition",传统,chuán tǒng,世代相传的习俗和文化,名词,"习俗,风俗","现代,创新","文化,历史","传统文化,传统食物","韩国传统,保护传统",伝統,dentō,代々受け継がれてきた習慣や文化,名詞,"慣習,風習","現代,革新","文化,歴史","伝統文化,伝統料理","韓国の伝統,伝統を保存",한국의 전통 문화를 보존해야 합니다.,We should preserve Korean traditional culture.,我们应该保护韩国传统文化。,韓国の伝統文化を保存すべきです。`;

export function conceptsTemplateToCSV() {
  return CONCEPTS_TEMPLATE_CSV;
}

export const GRAMMAR_TEMPLATE_CSV = `domain,category,difficulty,situation,purpose,korean_title,korean_structure,korean_description,english_title,english_structure,english_description,japanese_title,japanese_structure,japanese_description,chinese_title,chinese_structure,chinese_description,korean_example,english_example,japanese_example,chinese_example
daily,greeting,basic,"polite,social",greeting,기본 인사,안녕하세요,"가장 기본적인 한국어 인사말로, 누구에게나 사용할 수 있는 정중한 표현입니다.",Basic Greeting,Hello,The most basic Korean greeting that can be used with anyone politely.,基本的な挨拶,こんにちは,誰にでも丁寧に使える最も基本的な韓国語の挨拶です。,基本问候,您好,最基本的韩语问候语，可以礼貌地对任何人使用。,"안녕하세요, 처음 뵙겠습니다.","Hello, nice to meet you.",こんにちは、初めまして。,您好，初次见面。
food,ordering,basic,"shopping,public,polite",request,음식 주문,___을/를 주세요,음식점이나 상점에서 무언가를 주문하거나 요청할 때 사용하는 정중한 표현입니다.,Food Ordering,Please give me ___,A polite expression used to order or request something at restaurants or shops.,食べ物の注文,___をください,レストランや店で何かを注文したり要求したりするときに使う丁寧な表現です。,点餐,请给我___,在餐厅或商店订购或要求某物时使用的礼貌表达。,김치찌개를 주세요.,Please give me kimchi stew.,キムチチゲをください。,请给我泡菜汤。`;

export function grammarTemplateToCSV() {
  return GRAMMAR_TEMPLATE_CSV;
}
