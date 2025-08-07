import { GRAMMAR_TAGS, formatGrammarTags, getPOSList, getGrammarFeatures } from "./grammar-tags-system.js";

/**
 * 하이브리드 문법 시스템
 * 구조화된 문법 태그 + 자연어 문법 설명을 결합
 */
export class HybridGrammarSystem {
  constructor() {
    this.grammarTags = GRAMMAR_TAGS;
  }

  /**
   * 완전한 문법 정보 생성
   * @param {Object} expression - 언어별 표현 객체
   * @param {string} language - 언어 코드
   * @param {string} context - 문맥 (word, example, quiz, game)
   * @returns {Object} 완전한 문법 정보
   */
  async generateCompleteGrammarInfo(expression, language, context = "word") {
    const grammarInfo = {
      // 구조화된 태그 (퀴즈/게임/검색용)
      structured: await this.generateStructuredTags(expression, language),

      // 자연어 설명 (사용자 이해용)
      natural: await this.generateNaturalDescription(
        expression,
        language,
        context
      ),

      // 활용 정보 (퀴즈/게임에서 사용)
      usage: await this.generateUsageInfo(expression, language),

      // 학습 메타데이터
      learning: await this.generateLearningMetadata(expression, language),
    };

    return grammarInfo;
  }

  /**
   * 구조화된 문법 태그 생성
   */
  async generateStructuredTags(expression, language) {
    const tags = {
      pos: expression.part_of_speech,
      features: [],
      raw_tags: expression.grammar_tags || [],
    };

    // 기존 문법 태그 파싱
    if (expression.grammar_tags) {
      expression.grammar_tags.forEach((tag) => {
        if (tag.includes(":")) {
          const [category, value] = tag.split(":");
          tags.features.push({ category, value });
        }
      });
    }

    // 유효성 검사
    const validation = this.validateGrammarTags(
      language,
      tags.pos,
      tags.raw_tags.filter((tag) => tag.includes(":"))
    );

    tags.isValid = validation.valid;
    tags.validationError = validation.error;

    return tags;
  }

  /**
   * 자연어 문법 설명 생성
   */
  async generateNaturalDescription(expression, language, context) {
    const descriptions = {
      basic: await this.generateBasicDescription(expression, language),
      detailed: await this.generateDetailedDescription(expression, language),
      contextual: await this.generateContextualDescription(
        expression,
        language,
        context
      ),
    };

    return descriptions;
  }

  /**
   * 기본 문법 설명 생성
   */
  async generateBasicDescription(expression, language) {
    const pos = expression.part_of_speech;
    const grammarTags = expression.grammar_tags || [];

    // 언어별 기본 설명 템플릿
    const templates = {
      korean: {
        noun: "명사입니다.",
        verb: "동사입니다.",
        adjective: "형용사입니다.",
        adverb: "부사입니다.",
        interjection: "감탄사입니다.",
      },
      english: {
        noun: "It is a noun.",
        verb: "It is a verb.",
        adjective: "It is an adjective.",
        adverb: "It is an adverb.",
        interjection: "It is an interjection.",
      },
      japanese: {
        noun: "名詞です。",
        verb: "動詞です。",
        adjective: "形容詞です。",
        adverb: "副詞です。",
        interjection: "感動詞です。",
      },
      chinese: {
        noun: "这是名词。",
        verb: "这是动词。",
        adjective: "这是形容词。",
        adverb: "这是副词。",
        interjection: "这是叹词。",
      },
    };

    let description = templates[language]?.[pos] || `${pos}입니다.`;

    // 문법 특성 추가 설명
    const specialFeatures = this.extractSpecialFeatures(grammarTags, language);
    if (specialFeatures.length > 0) {
      description += ` ${specialFeatures.join(", ")}`;
    }

    return description;
  }

  /**
   * 상세 문법 설명 생성
   */
  async generateDetailedDescription(expression, language) {
    const grammarTags = expression.grammar_tags || [];
    const pos = expression.part_of_speech;

    let details = [];

    // 언어별 상세 설명 로직
    switch (language) {
      case "korean":
        details = await this.generateKoreanDetails(expression, grammarTags);
        break;
      case "english":
        details = await this.generateEnglishDetails(expression, grammarTags);
        break;
      case "japanese":
        details = await this.generateJapaneseDetails(expression, grammarTags);
        break;
      case "chinese":
        details = await this.generateChineseDetails(expression, grammarTags);
        break;
    }

    return details.join(" ");
  }

  /**
   * 한국어 상세 설명 생성
   */
  async generateKoreanDetails(expression, grammarTags) {
    const details = [];

    grammarTags.forEach((tag) => {
      if (tag.includes("honorific:존댓말")) {
        details.push("높임말로 사용됩니다.");
      } else if (tag.includes("verb_type:불규칙동사")) {
        details.push("불규칙활용 동사입니다.");
      } else if (tag.includes("speech_level:해요체")) {
        details.push("해요체로 활용됩니다.");
      }
    });

    // 품사별 추가 정보
    if (expression.part_of_speech === "verb") {
      details.push("동작이나 상태를 나타냅니다.");
    } else if (expression.part_of_speech === "noun") {
      details.push("사물이나 개념을 나타냅니다.");
    }

    return details;
  }

  /**
   * 영어 상세 설명 생성
   */
  async generateEnglishDetails(expression, grammarTags) {
    const details = [];

    grammarTags.forEach((tag) => {
      if (tag.includes("verb_type:transitive")) {
        details.push("It takes a direct object.");
      } else if (tag.includes("noun_type:countable")) {
        details.push("It is a countable noun.");
      } else if (tag.includes("number:plural")) {
        details.push("This is the plural form.");
      }
    });

    return details;
  }

  /**
   * 맥락별 문법 설명 생성
   */
  async generateContextualDescription(expression, language, context) {
    const contextDescriptions = {
      quiz: await this.generateQuizDescription(expression, language),
      game: await this.generateGameDescription(expression, language),
      example: await this.generateExampleDescription(expression, language),
      word: await this.generateWordDescription(expression, language),
    };

    return contextDescriptions[context] || contextDescriptions.word;
  }

  /**
   * 퀴즈용 문법 설명
   */
  async generateQuizDescription(expression, language) {
    const grammarTags = expression.grammar_tags || [];

    // 퀴즈에 유용한 힌트 형태로 설명
    const hints = [];

    if (language === "korean") {
      if (grammarTags.includes("honorific:존댓말")) {
        hints.push("정중한 표현입니다");
      }
      if (grammarTags.includes("verb_type:불규칙동사")) {
        hints.push("활용 시 주의가 필요합니다");
      }
    } else if (language === "english") {
      if (grammarTags.includes("verb_type:transitive")) {
        hints.push("목적어가 필요합니다");
      }
      if (grammarTags.includes("noun_type:uncountable")) {
        hints.push("셀 수 없는 명사입니다");
      }
    }

    return hints.join(", ");
  }

  /**
   * 사용 정보 생성 (퀴즈/게임용)
   */
  async generateUsageInfo(expression, language) {
    const usage = {
      quizSuitability: this.calculateQuizSuitability(expression),
      gameDifficulty: this.calculateGameDifficulty(expression),
      practicePoints: this.extractPracticePoints(expression, language),
      commonMistakes: this.identifyCommonMistakes(expression, language),
    };

    return usage;
  }

  /**
   * 퀴즈 적합도 계산
   */
  calculateQuizSuitability(expression) {
    const grammarTags = expression.grammar_tags || [];
    let score = 50; // 기본 점수

    // 복잡한 문법 특성은 고급 퀴즈에 적합
    if (grammarTags.some((tag) => tag.includes("honorific"))) score += 20;
    if (grammarTags.some((tag) => tag.includes("irregular"))) score += 30;
    if (grammarTags.some((tag) => tag.includes("passive"))) score += 25;

    // 기본 품사는 초급 퀴즈에 적합
    if (["noun", "verb", "adjective"].includes(expression.part_of_speech)) {
      score -= 10;
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * 학습 메타데이터 생성
   */
  async generateLearningMetadata(expression, language) {
    return {
      difficulty: this.calculateGrammarDifficulty(expression),
      learningOrder: this.suggestLearningOrder(expression, language),
      prerequisites: this.identifyPrerequisites(expression, language),
      practiceType: this.suggestPracticeType(expression),
    };
  }

  /**
   * 특별한 문법 특성 추출
   */
  extractSpecialFeatures(grammarTags, language) {
    const features = [];

    grammarTags.forEach((tag) => {
      if (tag.includes("honorific:존댓말")) {
        features.push("(높임말)");
      } else if (tag.includes("speech_level:해요체")) {
        features.push("(해요체)");
      } else if (tag.includes("verb_type:불규칙동사")) {
        features.push("(불규칙활용)");
      }
    });

    return features;
  }

  /**
   * 문법 태그 유효성 검사
   */
  validateGrammarTags(language, pos, tags) {
    const langTags = this.grammarTags[language];
    if (!langTags) {
      return { valid: false, error: `Unsupported language: ${language}` };
    }

    // POS 유효성 검사
    if (!langTags.pos[pos]) {
      return { valid: false, error: `Invalid POS for ${language}: ${pos}` };
    }

    // 태그 유효성 검사
    for (const tag of tags) {
      if (tag.includes(":")) {
        const [category, value] = tag.split(":");
        const categoryFeatures = langTags.grammar_features[category];
        if (!categoryFeatures || !categoryFeatures.includes(value)) {
          return { valid: false, error: `Invalid tag: ${tag}` };
        }
      }
    }

    return { valid: true };
  }

  /**
   * 문법 캐시 무효화
   */
  invalidateCache() {
    // 현재는 캐시가 없으므로 빈 메서드
    console.log("Grammar cache invalidated");
  }
}

// 싱글톤 인스턴스
export const hybridGrammarSystem = new HybridGrammarSystem();

// 편의 함수들
export async function getCompleteGrammarInfo(
  expression,
  language,
  context = "word"
) {
  return await hybridGrammarSystem.generateCompleteGrammarInfo(
    expression,
    language,
    context
  );
}

export async function getQuizGrammarHints(expression, language) {
  const grammarInfo = await hybridGrammarSystem.generateCompleteGrammarInfo(
    expression,
    language,
    "quiz"
  );
  return grammarInfo.natural.contextual;
}

export async function getGameDifficultyFromGrammar(expression, language) {
  const grammarInfo = await hybridGrammarSystem.generateCompleteGrammarInfo(
    expression,
    language,
    "game"
  );
  return grammarInfo.usage.gameDifficulty;
}
