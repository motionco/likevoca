// 템플릿 데이터 배열들
export const EXAMPLES_TEMPLATE = [
  {
    concept_id: "daily_greeting_polite",
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
      spanish: "¡Hola! Encantado de conocerte por primera vez."
    },
    word: {
      korean: "안녕하세요",
      english: "hello",
      japanese: "こんにちは",
      chinese: "你好",
      spanish: "hola"
    }
  },
  {
    concept_id: "food_ordering_cafe",
    domain: "food",
    category: "ordering",
    difficulty: "basic",
    situation: ["shopping", "public", "polite"],
    purpose: "request",
    translations: {
      korean: "커피 한 잔 주세요.",
      english: "Please give me a cup of coffee.",
      japanese: "コーヒーを一杯ください。",
      chinese: "请给我一杯咖啡。",
      spanish: "Por favor, dame una taza de café."
    },
    word: {
      korean: "커피",
      english: "coffee",
      japanese: "コーヒー",
      chinese: "咖啡",
      spanish: "café"
    }
  }
];

export const CONCEPTS_TEMPLATE = [
  {
    concept_id: "daily_greeting_polite",
    domain: "daily",
    category: "routine",
    difficulty: "basic",
    situation: ["polite", "social"],
    purpose: "greeting",
    titles: {
      korean: "정중한 첫 인사",
      english: "Polite First Greeting",
      japanese: "丁寧な初対面の挨拶",
      chinese: "礼貌的初次问候",
      spanish: "Saludo educado de primera vez"
    },
    structures: {
      korean: "안녕하세요! 처음 뵙겠습니다.",
      english: "Hello! Nice to meet you for the first time.",
      japanese: "こんにちは！初めてお会いします。",
      chinese: "你好！初次见面。",
      spanish: "¡Hola! Encantado de conocerte por primera vez."
    },
    descriptions: {
      korean: "처음 만나는 사람에게 정중하게 인사할 때 사용하는 표현입니다.",
      english: "An expression used to greet someone politely when meeting them for the first time.",
      japanese: "初めて会う人に丁寧に挨拶するときに使う表現です。",
      chinese: "第一次见面时礼貌问候的表达方式。",
      spanish: "Una expresión utilizada para saludar educadamente a alguien cuando lo conoces por primera vez."
    },
    word: {
      korean: "안녕하세요",
      english: "hello",
      japanese: "こんにちは",
      chinese: "你好",
      spanish: "hola"
    }
  },
  {
    concept_id: "food_ordering_cafe",
    domain: "food",
    category: "ordering",
    difficulty: "basic",
    situation: ["shopping", "public", "polite"],
    purpose: "request",
    titles: {
      korean: "카페에서 주문하기",
      english: "Ordering at a Cafe",
      japanese: "カフェでの注文",
      chinese: "在咖啡厅点餐",
      spanish: "Pedido en una cafetería"
    },
    structures: {
      korean: "___을/를 주세요",
      english: "Please give me ___",
      japanese: "___をください",
      chinese: "请给我___",
      spanish: "Por favor, dame ___"
    },
    descriptions: {
      korean: "카페나 음식점에서 음료나 음식을 주문할 때 사용하는 정중한 표현입니다.",
      english: "A polite expression used to order drinks or food at cafes or restaurants.",
      japanese: "カフェやレストランで飲み物や食べ物を注文するときに使う丁寧な表現です。",
      chinese: "在咖啡厅或餐厅点饮料或食物时使用的礼貌表达。",
      spanish: "Una expresión educada utilizada para pedir bebidas o comida en cafeterías o restaurantes."
    },
    word: {
      korean: "커피",
      english: "coffee",
      japanese: "コーヒー",
      chinese: "咖啡",
      spanish: "café"
    }
  }
];

export const GRAMMAR_TEMPLATE = [
  {
    concept_id: "daily_greeting_polite",
    domain: "daily",
    category: "greeting",
    difficulty: "basic",
    situation: ["polite", "social"],
    purpose: "greeting",
    titles: {
      korean: "기본 인사법",
      english: "Basic Greeting Pattern",
      japanese: "基本挨拶パターン",
      chinese: "基本问候模式",
      spanish: "Patrón de Saludo Básico"
    },
    structures: {
      korean: "안녕하세요",
      english: "Hello",
      japanese: "こんにちは",
      chinese: "您好",
      spanish: "Hola"
    },
    descriptions: {
      korean: "한국어의 가장 기본적인 인사 표현으로, 시간이나 상황에 관계없이 사용할 수 있는 만능 인사말입니다.",
      english: "The most fundamental greeting expression in Korean that can be used regardless of time or situation.",
      japanese: "時間や状況に関係なく使える韓国語の最も基本的な挨拶表現です。",
      chinese: "无论时间或情况如何都可以使用的韩语最基本的问候表达。",
      spanish: "La expresión de saludo más fundamental en coreano que se puede usar independientemente del tiempo o la situación."
    },
    examples: {
      korean: "안녕하세요, 처음 뵙겠습니다.",
      english: "Hello, nice to meet you.",
      japanese: "こんにちは、初めてお会いします。",
      chinese: "您好，初次见面。",
      spanish: "¡Hola, encantado de conocerte!"
    },
    word: {
      korean: "안녕하세요",
      english: "hello",
      japanese: "こんにちは",
      chinese: "您好",
      spanish: "hola"
    }
  },
  {
    concept_id: "food_ordering_cafe",
    domain: "food",
    category: "ordering",
    difficulty: "basic",
    situation: ["shopping", "public", "polite"],
    purpose: "request",
    titles: {
      korean: "음식 주문 패턴",
      english: "Food Ordering Pattern",
      japanese: "食べ物注文パターン",
      chinese: "点餐模式",
      spanish: "Patrón de Pedido de Comida"
    },
    structures: {
      korean: "___을/를 주세요",
      english: "Please give me ___",
      japanese: "___をください",
      chinese: "请给我___",
      spanish: "Por favor dame ___"
    },
    descriptions: {
      korean: "음식점이나 카페에서 무언가를 정중하게 주문할 때 사용하는 문법 패턴으로, '을/를'은 목적격 조사입니다.",
      english: "A grammar pattern used to politely order something at restaurants or cafes, where the object is followed by 'please give me'.",
      japanese: "レストランやカフェで何かを丁寧に注文する時に使う文法パターンで、'を'は目的格助詞です。",
      chinese: "在餐厅或咖啡厅礼貌地点餐时使用的语法模式，其中宾语后跟'请给我'。",
      spanish: "Un patrón gramatical usado para pedir algo educadamente en restaurantes o cafés, donde el objeto es seguido por 'por favor dame'."
    },
    examples: {
      korean: "김치찌개를 주세요.",
      english: "Please give me kimchi stew.",
      japanese: "キムチチゲをください。",
      chinese: "请给我泡菜汤。",
      spanish: "Por favor, dame kimchi jjigae."
    },
    word: {
      korean: "커피",
      english: "coffee",
      japanese: "コーヒー",
      chinese: "咖啡",
      spanish: "café"
    }
  }
];

// CSV 형식 템플릿들 (통합_데이터_가이드.md 기준)
export const EXAMPLES_TEMPLATE_CSV = `concept_id,domain,category,difficulty,situation,purpose,korean,english,japanese,chinese,spanish,korean_word,english_word,japanese_word,chinese_word,spanish_word
daily_greeting_polite,daily,routine,basic,"polite,social",greeting,"안녕하세요! 처음 뵙겠습니다.",Hello! Nice to meet you for the first time.,こんにちは！初めてお会いします。,你好！初次见面。,"¡Hola! Encantado de conocerte por primera vez.",안녕하세요,hello,こんにちは,你好,hola
food_ordering_cafe,food,ordering,basic,"shopping,public,polite",request,커피 한 잔 주세요.,Please give me a cup of coffee.,コーヒーを一杯ください。,请给我一杯咖啡。,"Por favor, dame una taza de café.",커피,coffee,コーヒー,咖啡,café`;

export const CONCEPTS_TEMPLATE_CSV = `concept_id,domain,category,difficulty,emoji,color,situation,purpose,korean_word,korean_pronunciation,korean_definition,korean_pos,korean_synonyms,korean_antonyms,korean_word_family,korean_compound_words,korean_collocations,english_word,english_pronunciation,english_definition,english_pos,english_synonyms,english_antonyms,english_word_family,english_compound_words,english_collocations,chinese_word,chinese_pronunciation,chinese_definition,chinese_pos,chinese_synonyms,chinese_antonyms,chinese_word_family,chinese_compound_words,chinese_collocations,japanese_word,japanese_pronunciation,japanese_definition,japanese_pos,japanese_synonyms,japanese_antonyms,japanese_word_family,japanese_compound_words,japanese_collocations,spanish_word,spanish_pronunciation,spanish_definition,spanish_pos,spanish_synonyms,spanish_antonyms,spanish_word_family,spanish_compound_words,spanish_collocations,korean_example,english_example,chinese_example,japanese_example,spanish_example
daily_greeting_polite,daily,routine,basic,👋,#4CAF50,"polite,social",greeting,안녕하세요,an-nyeong-ha-se-yo,상대방에게 예의를 표하는 기본적인 인사말,감탄사,"인사말,예의말","안녕히 가세요,작별 인사","인사,예의","안녕히 계세요,안녕히 가세요","정중한 안녕하세요,예의바른 인사",hello,həˈloʊ,a greeting used when meeting someone,interjection,"hi,greetings","goodbye,farewell","greeting,salutation","hello there,say hello","polite hello,friendly greeting",你好,nǐ hǎo,见面时使用的问候语,感叹词,"问候,打招呼","再见,告别","问候语,礼貌","你好吗,问好","礼貌的你好,友好问候",こんにちは,kon-ni-chi-wa,人に会った時の挨拶,感動詞,"挨拶,こんにちは","さようなら,別れ","挨拶語,礼儀","こんにちはございます,ご挨拶","丁寧なこんにちは,親しみやすい挨拶",hola,ˈo.la,saludo utilizado al encontrarse con alguien,interjección,"saludo,saludos","adiós,despedida","saludo,salutación","hola ahí,decir hola","hola educado,saludo amistoso","안녕하세요, 처음 뵙겠습니다.","Hello, nice to meet you for the first time.","你好，初次见面。","こんにちは、初めてお会いします。","¡Hola, encantado de conocerte por primera vez!"
food_ordering_cafe,food,ordering,basic,☕,#FF9800,"shopping,public,polite",request,커피,keo-pi,볶은 원두로 만든 음료,명사,"음료,원두","차,물","음료,기호품","아메리카노,카페라테","진한 커피,뜨거운 커피",coffee,ˈkɔːfi,a hot drink made from roasted coffee beans,noun,"beverage,brew","tea,water","drink,beverage","americano,latte","strong coffee,hot coffee",咖啡,kā fēi,用烘焙过的咖啡豆制成的热饮,名词,"饮料,冲泡物","茶,水","饮品,饮料","美式咖啡,拿铁","浓咖啡,热咖啡",コーヒー,ko-hi-,焙煎したコーヒー豆から作る温かい飲み物,名詞,"飲み物,醸造物","茶,水","飲料,ビバレッジ","アメリカーノ,ラテ","濃いコーヒー,熱いコーヒー",café,ka.ˈfe,bebida caliente hecha de granos de café tostados,sustantivo,"bebida,brebaje","té,agua","bebida,refresco","americano,latte","café fuerte,café caliente",커피 한 잔 주세요.,Please give me a cup of coffee.,请给我一杯咖啡。,コーヒーを一杯ください。,"Por favor, dame una taza de café."`;

export const GRAMMAR_TEMPLATE_CSV = `concept_id,domain,category,difficulty,situation,purpose,korean_title,korean_structure,korean_description,korean_example,english_title,english_structure,english_description,english_example,japanese_title,japanese_structure,japanese_description,japanese_example,chinese_title,chinese_structure,chinese_description,chinese_example,spanish_title,spanish_structure,spanish_description,spanish_example,korean_word,english_word,japanese_word,chinese_word,spanish_word
daily_greeting_polite,daily,greeting,basic,"polite,social",greeting,기본 인사법,안녕하세요,"한국어의 가장 기본적인 인사 표현으로, 시간이나 상황에 관계없이 사용할 수 있는 만능 인사말입니다.","안녕하세요, 처음 뵙겠습니다.",Basic Greeting Pattern,Hello,"The most fundamental greeting expression in Korean that can be used regardless of time or situation.","Hello, nice to meet you.",基本挨拶パターン,こんにちは,"時間や状況に関係なく使える韓国語の最も基本的な挨拶表現です。","こんにちは、初めてお会いします。",基本问候模式,您好,"无论时间或情况如何都可以使用的韩语最基本的问候表达。","您好，初次见面。",Patrón de Saludo Básico,Hola,"La expresión de saludo más fundamental en coreano que se puede usar independientemente del tiempo o la situación.","¡Hola, encantado de conocerte!",안녕하세요,hello,こんにちは,您好,hola
food_ordering_cafe,food,ordering,basic,"shopping,public,polite",request,음식 주문 패턴,___을/를 주세요,"음식점이나 카페에서 무언가를 정중하게 주문할 때 사용하는 문법 패턴으로, '을/를'은 목적격 조사입니다.",김치찌개를 주세요.,Food Ordering Pattern,Please give me ___,"A grammar pattern used to politely order something at restaurants or cafes, where the object is followed by 'please give me'.",Please give me kimchi stew.,食べ物注文パターン,___をください,"レストランやカフェで何かを丁寧に注文する時に使う文法パターンで、'を'は目的格助詞です。",キムチチゲをください。,点餐模式,请给我___,"在餐厅或咖啡厅礼貌地点餐时使用的语法模式，其中宾语后跟'请给我'。",请给我泡菜汤。,Patrón de Pedido de Comida,Por favor dame ___,"Un patrón gramatical usado para pedir algo educadamente en restaurantes o cafés, donde el objeto es seguido por 'por favor dame'.",Por favor dame kimchi jjigae.,커피,coffee,コーヒー,咖啡,café`;

// CSV 템플릿 생성 함수들
export function examplesTemplateToCSV() {
  return EXAMPLES_TEMPLATE_CSV;
}

export function conceptsTemplateToCSV() {
  return CONCEPTS_TEMPLATE_CSV;
}

export function grammarTemplateToCSV() {
  return GRAMMAR_TEMPLATE_CSV;
}
