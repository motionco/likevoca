import {
  getCompleteGrammarInfo,
  getQuizGrammarHints,
} from "../js/hybrid-grammar-system.js";

/**
 * 퀴즈에서 문법 정보 활용 예시
 */

// 1. 품사별 맞춤 퀴즈 생성
export async function generateGrammarBasedQuiz(concept, language) {
  const expression = concept.expressions[language];
  const grammarInfo = await getCompleteGrammarInfo(
    expression,
    language,
    "quiz"
  );

  let quiz = {};

  // 품사에 따른 문제 유형 결정
  switch (grammarInfo.structured.pos) {
    case "verb":
    case "동사":
      quiz = await generateVerbQuiz(expression, grammarInfo, language);
      break;

    case "noun":
    case "명사":
      quiz = await generateNounQuiz(expression, grammarInfo, language);
      break;

    case "adjective":
    case "형용사":
      quiz = await generateAdjectiveQuiz(expression, grammarInfo, language);
      break;

    default:
      quiz = await generateGeneralQuiz(expression, grammarInfo, language);
  }

  // 문법 힌트 추가
  quiz.grammarHint = grammarInfo.natural.contextual;
  quiz.difficulty = grammarInfo.usage.quizSuitability;

  return quiz;
}

// 2. 동사 특화 퀴즈
async function generateVerbQuiz(expression, grammarInfo, language) {
  const quiz = {
    type: "verb_conjugation",
    question: "",
    options: [],
    correctAnswer: "",
    explanation: "",
  };

  // 한국어 동사 특별 처리
  if (language === "korean") {
    const hasHonorific = grammarInfo.structured.features.some(
      (f) => f.category === "honorific" && f.value === "존댓말"
    );

    const isIrregular = grammarInfo.structured.features.some(
      (f) => f.category === "verb_type" && f.value === "불규칙동사"
    );

    if (hasHonorific) {
      quiz.question = `"${expression.word}"의 높임말 형태는?`;
      quiz.explanation = "높임말 동사는 특별한 활용을 합니다.";
    } else if (isIrregular) {
      quiz.question = `"${expression.word}"의 과거형은? (불규칙 활용 주의)`;
      quiz.explanation = "불규칙 동사는 기본 활용 규칙과 다릅니다.";
    }
  }

  return quiz;
}

// 3. 명사 특화 퀴즈
async function generateNounQuiz(expression, grammarInfo, language) {
  const quiz = {
    type: "noun_classification",
    question: "",
    options: [],
    correctAnswer: "",
    explanation: "",
  };

  // 영어 명사 특별 처리
  if (language === "english") {
    const isCountable = grammarInfo.structured.features.some(
      (f) => f.category === "noun_type" && f.value === "countable"
    );

    if (isCountable) {
      quiz.question = `Which article can be used with "${expression.word}"?`;
      quiz.options = ["a/an", "the", "both", "none"];
      quiz.correctAnswer = "both";
      quiz.explanation =
        "Countable nouns can use both indefinite and definite articles.";
    } else {
      quiz.question = `"${expression.word}" is an uncountable noun. Which is correct?`;
      quiz.options = [
        `a ${expression.word}`,
        `${expression.word}`,
        `${expression.word}s`,
        `many ${expression.word}`,
      ];
      quiz.correctAnswer = expression.word;
    }
  }

  return quiz;
}

/**
 * 게임에서 문법 정보 활용 예시
 */

// 4. 문법 기반 게임 난이도 조절
export async function adjustGameDifficulty(concepts, language) {
  const adjustedConcepts = [];

  for (const concept of concepts) {
    const expression = concept.expressions[language];
    if (!expression) continue;

    const grammarInfo = await getCompleteGrammarInfo(
      expression,
      language,
      "game"
    );

    // 문법 복잡도에 따른 난이도 점수 계산
    let difficultyScore = 0;

    // 품사별 기본 난이도
    const posScores = {
      noun: 10,
      명사: 10,
      verb: 30,
      동사: 30,
      adjective: 20,
      형용사: 20,
      adverb: 25,
      부사: 25,
    };
    difficultyScore += posScores[grammarInfo.structured.pos] || 15;

    // 문법 특성별 추가 난이도
    grammarInfo.structured.features.forEach((feature) => {
      if (
        feature.value.includes("불규칙") ||
        feature.value.includes("irregular")
      ) {
        difficultyScore += 20;
      }
      if (
        feature.value.includes("존댓말") ||
        feature.value.includes("honorific")
      ) {
        difficultyScore += 15;
      }
      if (feature.category === "tone") {
        // 중국어 성조
        difficultyScore += 10;
      }
    });

    adjustedConcepts.push({
      ...concept,
      gameDifficulty: Math.min(100, difficultyScore),
      grammarComplexity: grammarInfo.usage.gameDifficulty,
    });
  }

  // 난이도 순으로 정렬
  return adjustedConcepts.sort((a, b) => a.gameDifficulty - b.gameDifficulty);
}

// 5. 문법 특성별 게임 그룹핑
export async function groupByGrammarFeatures(concepts, language) {
  const groups = {
    beginner: [], // 기본 품사
    intermediate: [], // 일반적인 문법 특성
    advanced: [], // 복잡한 문법 특성
    honorific: [], // 높임말 (한국어)
    irregular: [], // 불규칙 활용
    tonal: [], // 성조 (중국어)
  };

  for (const concept of concepts) {
    const expression = concept.expressions[language];
    if (!expression) continue;

    const grammarInfo = await getCompleteGrammarInfo(
      expression,
      language,
      "game"
    );

    // 문법 특성에 따른 그룹 분류
    const features = grammarInfo.structured.features;
    let isGrouped = false;

    // 특별한 문법 특성 먼저 확인
    if (
      features.some(
        (f) => f.value.includes("존댓말") || f.value.includes("honorific")
      )
    ) {
      groups.honorific.push(concept);
      isGrouped = true;
    }

    if (
      features.some(
        (f) => f.value.includes("불규칙") || f.value.includes("irregular")
      )
    ) {
      groups.irregular.push(concept);
      isGrouped = true;
    }

    if (features.some((f) => f.category === "tone")) {
      groups.tonal.push(concept);
      isGrouped = true;
    }

    // 기본 난이도별 분류 (중복 허용)
    const difficulty = grammarInfo.usage.gameDifficulty;
    if (difficulty < 30) {
      groups.beginner.push(concept);
    } else if (difficulty < 60) {
      groups.intermediate.push(concept);
    } else {
      groups.advanced.push(concept);
    }
  }

  return groups;
}

// 6. 문법 힌트 생성
export async function generateGrammarHints(
  expression,
  language,
  hintLevel = 1
) {
  const grammarInfo = await getCompleteGrammarInfo(
    expression,
    language,
    "quiz"
  );
  const hints = [];

  // 힌트 레벨에 따른 정보 제공
  switch (hintLevel) {
    case 1: // 기본 힌트
      hints.push(`품사: ${grammarInfo.structured.pos}`);
      break;

    case 2: // 중간 힌트
      hints.push(`품사: ${grammarInfo.structured.pos}`);
      hints.push(grammarInfo.natural.basic);
      break;

    case 3: // 상세 힌트
      hints.push(`품사: ${grammarInfo.structured.pos}`);
      hints.push(grammarInfo.natural.basic);
      hints.push(grammarInfo.natural.detailed);
      if (grammarInfo.natural.contextual) {
        hints.push(`💡 ${grammarInfo.natural.contextual}`);
      }
      break;
  }

  return hints.filter((hint) => hint && hint.trim());
}

// 7. 문법 기반 유사 단어 찾기 (게임용)
export async function findSimilarGrammarWords(
  targetExpression,
  language,
  concepts
) {
  const targetGrammarInfo = await getCompleteGrammarInfo(
    targetExpression,
    language
  );
  const similarWords = [];

  for (const concept of concepts) {
    const expression = concept.expressions[language];
    if (!expression || expression.word === targetExpression.word) continue;

    const grammarInfo = await getCompleteGrammarInfo(expression, language);

    let similarity = 0;

    // 품사 일치
    if (grammarInfo.structured.pos === targetGrammarInfo.structured.pos) {
      similarity += 40;
    }

    // 문법 특성 일치도 계산
    const targetFeatures = targetGrammarInfo.structured.features.map(
      (f) => `${f.category}:${f.value}`
    );
    const currentFeatures = grammarInfo.structured.features.map(
      (f) => `${f.category}:${f.value}`
    );

    const commonFeatures = targetFeatures.filter((f) =>
      currentFeatures.includes(f)
    );
    similarity += commonFeatures.length * 15;

    if (similarity > 30) {
      // 유사도 임계값
      similarWords.push({
        concept,
        similarity,
        commonFeatures,
      });
    }
  }

  return similarWords.sort((a, b) => b.similarity - a.similarity);
}
