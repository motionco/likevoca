// 문법 태그 시스템 - 한국어, 영어, 일본어, 중국어 지원

// 각 언어별 문법 태그 정의
export const GRAMMAR_TAGS = {
  // 한국어 문법 태그
  korean: {
    pos: {
      // 명사류
      noun: "명사",
      proper_noun: "고유명사",
      pronoun: "대명사",

      // 동사류
      verb: "동사",
      auxiliary_verb: "보조동사",

      // 형용사류
      adjective: "형용사",
      determiner: "관형사",

      // 부사류
      adverb: "부사",

      // 조사류
      particle_subject: "주격조사",
      particle_object: "목적격조사",
      particle_possessive: "소유격조사",
      particle_topic: "보조사",
      particle_location: "부사격조사",

      // 어미류
      ending_final: "종결어미",
      ending_connecting: "연결어미",
      ending_transforming: "전성어미",

      // 기타
      interjection: "감탄사",
      conjunction: "접속사",
      prefix: "접두사",
      suffix: "접미사",
    },

    grammar_features: {
      // 동사 활용
      verb_type: ["규칙동사", "불규칙동사", "하다동사", "되다동사", "이다동사"],
      verb_class: ["자동사", "타동사", "상동사", "하동사"],
      honorific: ["높임어", "존댓말", "겸양어", "겸양말"],

      // 형용사 분류
      adj_type: ["성질형용사", "지시형용사", "수량형용사"],

      // 시제와 어말
      tense: ["현재", "과거", "미래", "완료"],
      speech_level: ["하라체", "하게체", "하오체", "하요체", "하쇼체"],

      // 문장 유형
      sentence_type: ["평서문", "의문문", "명령문", "감탄문", "청유문"],

      // 조사 기능
      particle_function: [
        "주어표시",
        "목적어표시",
        "보어표시",
        "관계표시",
        "접속표시",
      ],
    },
  },

  // 영어 문법 태그
  english: {
    pos: {
      // 명사류
      noun: "noun",
      proper_noun: "proper noun",
      pronoun: "pronoun",

      // 동사류
      verb: "verb",
      auxiliary_verb: "auxiliary verb",
      modal_verb: "modal verb",

      // 형용사/부사류
      adjective: "adjective",
      adverb: "adverb",

      // 기타 품사
      preposition: "preposition",
      conjunction: "conjunction",
      interjection: "interjection",
      article: "article",
      determiner: "determiner",
    },

    grammar_features: {
      // 동사 분류
      verb_type: ["transitive", "intransitive", "linking_verb", "phrasal_verb"],
      verb_form: [
        "base_form",
        "past_tense",
        "past_participle",
        "present_participle",
        "gerund",
      ],

      // 명사 분류
      noun_type: [
        "countable",
        "uncountable",
        "collective",
        "abstract",
        "concrete",
      ],
      number: ["singular", "plural"],

      // 형용사/부사
      adj_type: ["descriptive", "limiting", "proper", "compound"],
      comparison: ["positive", "comparative", "superlative"],

      // 시제와 상
      tense: [
        "present",
        "past",
        "future",
        "present_perfect",
        "past_perfect",
        "future_perfect",
      ],
      aspect: ["simple", "progressive", "perfect", "perfect_progressive"],
      mood: ["indicative", "imperative", "subjunctive", "conditional"],
      voice: ["active", "passive"],

      // 문장 유형
      sentence_type: [
        "declarative",
        "interrogative",
        "imperative",
        "exclamatory",
      ],
    },
  },

  // 일본어 문법 태그
  japanese: {
    pos: {
      // 명사류
      noun: "名詞",
      proper_noun: "固有名詞",
      pronoun: "代名詞",

      // 동사류
      verb_u: "動詞(五段活用)",
      verb_ru: "動詞(一段活用)",
      verb_irregular: "動詞(不規則活用)",

      // 형용사류
      i_adjective: "イ形容詞",
      na_adjective: "ナ形容詞",

      // 부사류
      adverb: "副詞",

      // 조사류
      particle_wa: "助詞(は)",
      particle_ga: "助詞(が)",
      particle_wo: "助詞(を)",
      particle_ni: "助詞(に)",
      particle_de: "助詞(で)",
      particle_to: "助詞(と)",
      particle_ya: "助詞(や)",
      particle_ka: "助詞(か)",

      // 기타
      interjection: "感動詞",
      conjunction: "接続詞",
      auxiliary: "助動詞",
    },

    grammar_features: {
      // 동사 활용
      verb_group: ["五段動詞", "一段動詞", "サ変動詞", "カ変動詞"],
      verb_type: ["自動詞", "他動詞", "可能動詞", "使役動詞", "受身動詞"],

      // 형용사 활용
      adj_conjugation: [
        "基本形",
        "過去形",
        "否定形",
        "過去否定形",
        "連体形",
        "副詞形",
      ],

      // 시제와 상
      tense: ["現在", "過去", "未来"],
      form: ["丁寧語", "尊敬語", "謙譲語", "美化語"],
      aspect: ["完了", "継続", "結果", "経験"],

      // 문자 체계
      writing_system: ["ひらがな", "カタカナ", "漢字", "ローマ字"],

      // 문장 유형
      sentence_type: ["平叙文", "疑問文", "命令文", "感嘆文", "勧誘文"],

      // 조사 기능
      particle_function: [
        "主語標示",
        "目的語標示",
        "補語標示",
        "時間標示",
        "場所標示",
        "手段標示",
      ],
    },
  },

  // 중국어 문법 태그
  chinese: {
    pos: {
      // 명사류
      noun: "名词",
      proper_noun: "专有名词",
      pronoun: "代词",

      // 동사류
      verb: "动词",
      auxiliary_verb: "助动词",
      modal_verb: "情态动词",

      // 형용사류
      adjective: "形容词",
      adverb: "副词",

      // 부사류
      adverb: "副词",

      // 기타
      preposition: "介词",
      conjunction: "连词",
      interjection: "感叹词",
      classifier: "量词",
      particle: "助词",
    },

    grammar_features: {
      // 동사 분류
      verb_type: ["及物动词", "不及物动词", "系动词", "趋向动词"],

      // 형용사 분류
      adj_type: ["性质形容词", "状态形容词", "关系形容词"],

      // 시제와 상
      tense: ["现在", "过去", "将来"],
      aspect: ["完成", "进行", "持续", "经历"],

      // 문장 유형
      sentence_type: ["陈述句", "疑问句", "祈使句", "感叹句"],

      // 어순
      word_order: ["主谓宾", "主谓", "存现句", "把字句", "被字句"],
    },
  },
};

// 그래프 효과 검사 함수
export function validateGrammarTags(language, pos, features = []) {
  const langTags = GRAMMAR_TAGS[language];
  if (!langTags) {
    return { valid: false, error: `지원하지 않는 언어: ${language}` };
  }

  // 품사 검사
  if (pos && !langTags.pos[pos]) {
    return {
      valid: false,
      error: `${language}에서 지원하지 않는 품사: ${pos}`,
    };
  }

  // 문법 성질 검사
  for (const feature of features) {
    const [category, value] = feature.split(":");
    if (
      langTags.grammar_features[category] &&
      !langTags.grammar_features[category].includes(value)
    ) {
      return {
        valid: false,
        error: `${language}에서 ${category}에 대해 지원하지 않는 특성: ${value}`,
      };
    }
  }

  return { valid: true };
}

// 어미 목록 가져오기
export function getPOSList(language) {
  return GRAMMAR_TAGS[language]?.pos || {};
}

// 어미 문법 특성 목록 가져오기
export function getGrammarFeatures(language) {
  return GRAMMAR_TAGS[language]?.grammar_features || {};
}

// 그래프 태그 포맷화
export function formatGrammarTags(language, pos, features = []) {
  const langTags = GRAMMAR_TAGS[language];
  if (!langTags) return { pos: pos, features: features };

  const formattedPOS = langTags.pos[pos] || pos;
  const formattedFeatures = features.map((feature) => {
    const [category, value] = feature.split(":");
    const categoryFeatures = langTags.grammar_features[category];
    if (categoryFeatures && categoryFeatures.includes(value)) {
      return `${category}: ${value}`;
    }
    return feature;
  });

  return {
    pos: formattedPOS,
    features: formattedFeatures,
  };
}

// CSV 헤더 문법 태그
export function getGrammarTagHeaders() {
  return [
    "korean_grammar_tags",
    "english_grammar_tags",
    "japanese_grammar_tags",
    "chinese_grammar_tags",
  ];
}

// 문법 태그 CSV 형식으로 변환
export function grammarTagsToCSV(tags) {
  if (!tags || tags.length === 0) return "";
  return tags.join("|");
}

// CSV 형식에서 문법 태그 배열로 변환
export function grammarTagsFromCSV(csvString) {
  if (!csvString || csvString.trim() === "") return [];
  return csvString
    .split("|")
    .map((tag) => tag.trim())
    .filter((tag) => tag);
}
