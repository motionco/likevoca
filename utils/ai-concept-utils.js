import {
  conceptUtils,
  supportedLanguages,
} from "../js/firebase/firebase-init.js";

// 로컬 환경 감지
const isLocalEnvironment =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";

// Gemini API 설정 제거 - 이제 서버 엔드포인트를 사용
// const GEMINI_API_KEY = "YOUR_GEMINI_API_KEY"; // 실제 배포시 환경변수로 설정
// const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;

// 다국어 프롬프트 템플릿
const PROMPTS = {
  korean: {
    system:
      "당신은 다국어 학습을 도와주는 AI 어시스턴트입니다. 사용자가 요청한 주제나 카테고리에 맞는 유용한 개념을 추천해주세요.",
    user: (topic, category, languages) => `
주제: ${topic || "일상생활"}
카테고리: ${category || "daily"}
언어: ${languages.join(", ")}

위 조건에 맞는 학습하기 좋은 개념 하나를 추천해주세요. 
다음 JSON 형식으로 응답해주세요:

{
  "concept_info": {
    "domain": "${topic || "daily"}",
    "category": "${category || "daily"}",
    "difficulty": "basic",
    "tags": ["태그1", "태그2", "태그3"],
    "unicode_emoji": "적절한 이모지 1개",
    "color_theme": "#FF6B6B",
    "quiz_frequency": "high",
    "game_types": ["matching", "pronunciation", "spelling"]
  },
  "media": {
    "images": {
      "primary": null,
      "secondary": null,
      "illustration": null,
      "emoji_style": null,
      "line_art": null
    },
    "videos": {
      "intro": null,
      "pronunciation": null
    },
    "audio": {
      "pronunciation_slow": null,
      "pronunciation_normal": null,
      "word_in_sentence": null
    }
  },
  "expressions": {
    ${languages
      .map(
        (lang) => `
    "${lang}": {
      "word": "${lang} 단어",
      "pronunciation": "발음 표기",
      "romanization": "로마자 표기 (해당되는 경우)",
      "definition": "정의/뜻",
      "part_of_speech": "품사",
      "level": "beginner",
      "synonyms": ["동의어1", "동의어2"],
      "antonyms": ["반의어1", "반의어2"],
      "word_family": ["관련어1", "관련어2", "관련어3"],
      "compound_words": ["복합어1", "복합어2", "복합어3"],
      "collocations": [
        {"phrase": "자주 쓰이는 연어 표현", "frequency": "high"}
      ]
    }`
      )
      .join(",")}
  },
  "featured_examples": [
    {
      "example_id": "example_1",
      "level": "beginner",
      "context": "daily_routine",
      "priority": "high",
      "unicode_emoji": "🌅",
      "quiz_weight": 10,
      "translations": {
        ${languages
          .map(
            (lang) => `
        "${lang}": {
          "text": "${lang} 예문",
          "grammar_notes": "문법 설명"
        }`
          )
          .join(",")}
      }
    }
  ],
  "quiz_data": {
    "question_types": ["translation", "pronunciation", "matching"],
    "difficulty_multiplier": 1.0,
    "common_mistakes": [],
    "hint_text": {
      ${languages.map((lang) => `"${lang}": "${lang} 힌트 텍스트"`).join(",")}
    }
  },
  "game_data": {
    "memory_card": {
      "front_image": "",
      "back_text": ""
    },
    "word_puzzle": {
      "scrambled": [],
      "hints": []
    },
    "pronunciation_game": {
      "target_phoneme": "",
      "similar_sounds": [],
      "practice_words": []
    }
  },
  "related_concepts": [],
  "learning_metadata": {
    "memorization_difficulty": 2,
    "pronunciation_difficulty": 1,
    "usage_frequency": "high",
    "cultural_importance": "medium"
  }
}

실제 사용 가능한 정확한 단어와 번역을 제공해주세요. 모든 배열과 객체는 적절한 값으로 채워주세요.`,
  },
  english: {
    system:
      "You are an AI assistant that helps with multilingual learning. Please recommend useful concepts that match the user's requested topic or category.",
    user: (topic, category, languages) => `
Topic: ${topic || "daily life"}
Category: ${category || "daily"}
Languages: ${languages.join(", ")}

Please recommend one good concept to learn based on the above conditions.
Respond in the following JSON format:

{
  "concept_info": {
    "domain": "${topic || "daily"}",
    "category": "${category || "daily"}",
    "difficulty": "basic",
    "tags": ["tag1", "tag2", "tag3"],
    "unicode_emoji": "appropriate emoji",
    "color_theme": "#FF6B6B",
    "quiz_frequency": "high",
    "game_types": ["matching", "pronunciation", "spelling"]
  },
  "media": {
    "images": {
      "primary": null,
      "secondary": null,
      "illustration": null,
      "emoji_style": null,
      "line_art": null
    },
    "videos": {
      "intro": null,
      "pronunciation": null
    },
    "audio": {
      "pronunciation_slow": null,
      "pronunciation_normal": null,
      "word_in_sentence": null
    }
  },
  "expressions": {
    ${languages
      .map(
        (lang) => `
    "${lang}": {
      "word": "${lang} word",
      "pronunciation": "pronunciation notation",
      "romanization": "romanization (if applicable)",
      "definition": "definition/meaning",
      "part_of_speech": "part of speech",
      "level": "beginner",
      "synonyms": ["synonym1", "synonym2"],
      "antonyms": ["antonym1", "antonym2"],
      "word_family": ["related1", "related2", "related3"],
      "compound_words": ["compound1", "compound2", "compound3"],
      "collocations": [
        {"phrase": "common collocation", "frequency": "high"}
      ]
    }`
      )
      .join(",")}
  },
  "featured_examples": [
    {
      "example_id": "example_1",
      "level": "beginner",
      "context": "daily_routine",
      "priority": "high",
      "unicode_emoji": "🌅",
      "quiz_weight": 10,
      "translations": {
        ${languages
          .map(
            (lang) => `
        "${lang}": {
          "text": "${lang} example sentence",
          "grammar_notes": "grammar explanation"
        }`
          )
          .join(",")}
      }
    }
  ],
  "quiz_data": {
    "question_types": ["translation", "pronunciation", "matching"],
    "difficulty_multiplier": 1.0,
    "common_mistakes": [],
    "hint_text": {
      ${languages.map((lang) => `"${lang}": "${lang} hint text"`).join(",")}
    }
  },
  "game_data": {
    "memory_card": {
      "front_image": "",
      "back_text": ""
    },
    "word_puzzle": {
      "scrambled": [],
      "hints": []
    },
    "pronunciation_game": {
      "target_phoneme": "",
      "similar_sounds": [],
      "practice_words": []
    }
  },
  "related_concepts": [],
  "learning_metadata": {
    "memorization_difficulty": 2,
    "pronunciation_difficulty": 1,
    "usage_frequency": "high",
    "cultural_importance": "medium"
  }
}

Please provide accurate words and translations that are actually usable. Fill all arrays and objects with appropriate values.`,
  },
};

// 테스트 데이터 (로컬 환경용) - 분리된 컬렉션 구조
const TEST_CONCEPTS = [
  {
    // 개념 기본 정보 (분리된 컬렉션 구조)
    concept_info: {
      domain: "food",
      category: "fruit",
      difficulty: "beginner",
      tags: ["everyday", "healthy", "common"],
      unicode_emoji: "🍎",
      images: [],
    },
    media: {
      images: {
        primary: "https://source.unsplash.com/400x300/?apple",
        secondary: "https://source.unsplash.com/400x300/?apple_green",
        illustration: "https://api.iconify.design/noto:red-apple.svg",
        emoji_style: "https://api.iconify.design/twemoji:red-apple.svg",
        line_art: null,
      },
      videos: {
        intro: null,
        pronunciation: null,
      },
      audio: {
        pronunciation_slow: null,
        pronunciation_normal: null,
        word_in_sentence: null,
      },
    },
    expressions: {
      korean: {
        word: "사과",
        pronunciation: "sa-gwa",
        romanization: "sagwa",
        definition: "빨갛거나 초록색의 둥근 과일",
        part_of_speech: "명사",
        level: "beginner",
        synonyms: [],
        antonyms: [],
        word_family: ["과일", "과실", "열매"],
        compound_words: ["사과나무", "사과즙", "사과파이"],
        collocations: [
          { phrase: "사과를 먹다", frequency: "high" },
          { phrase: "빨간 사과", frequency: "high" },
        ],
      },
      english: {
        word: "apple",
        pronunciation: "ˈæpəl",
        romanization: null,
        definition: "a round fruit with red or green skin",
        part_of_speech: "noun",
        level: "beginner",
        synonyms: [],
        antonyms: [],
        word_family: ["fruit", "produce", "orchard fruit"],
        compound_words: ["apple tree", "apple juice", "apple pie"],
        collocations: [
          { phrase: "eat an apple", frequency: "high" },
          { phrase: "red apple", frequency: "high" },
        ],
      },
      japanese: {
        word: "りんご",
        pronunciation: "ringo",
        romanization: "ringo",
        definition: "赤いまたは緑色の丸い果物",
        part_of_speech: "名詞",
        level: "beginner",
        synonyms: ["アップル"],
        antonyms: [],
        word_family: ["果物", "果実", "青果"],
        compound_words: ["りんごの木", "りんごジュース"],
        collocations: [{ phrase: "りんごを食べる", frequency: "high" }],
      },
      chinese: {
        word: "苹果",
        pronunciation: "píngguǒ",
        romanization: null,
        definition: "红色或绿色的圆形水果",
        part_of_speech: "名词",
        level: "beginner",
        synonyms: [],
        antonyms: [],
        word_family: ["水果", "果实", "鲜果"],
        compound_words: ["苹果树", "苹果汁", "苹果派"],
        collocations: [{ phrase: "吃苹果", frequency: "high" }],
      },
    },
    // 대표 예문 (분리된 컬렉션 구조)
    representative_example: {
      korean: "나는 매일 사과를 먹습니다.",
      english: "I eat an apple every day.",
      japanese: "私は毎日りんごを食べます。",
      chinese: "我每天吃苹果。",
    },

    // 추가 예문들 (분리된 컬렉션 구조)
    examples: [
      {
        korean: "이 사과는 정말 달아요.",
        english: "This apple is really sweet.",
        japanese: "このりんごはとても甘いです。",
        chinese: "这个苹果真甜。",
      },
    ],
    // 최소 호환성 필드들
    domain: "food",
    category: "fruit",
  },
  {
    // 개념 기본 정보 (분리된 컬렉션 구조)
    concept_info: {
      domain: "animal",
      category: "pet",
      difficulty: "beginner",
      tags: ["pet", "common", "domestic"],
      unicode_emoji: "🐱",
      images: [],
    },
    media: {
      images: {
        primary: "https://source.unsplash.com/400x300/?cat",
        secondary: "https://source.unsplash.com/400x300/?kitten",
        illustration: "https://api.iconify.design/noto:cat-face.svg",
        emoji_style: "https://api.iconify.design/twemoji:cat-face.svg",
        line_art: null,
      },
      videos: {
        intro: null,
        pronunciation: null,
      },
      audio: {
        pronunciation_slow: null,
        pronunciation_normal: null,
        word_in_sentence: null,
      },
    },
    expressions: {
      korean: {
        word: "고양이",
        pronunciation: "go-yang-i",
        romanization: "goyangi",
        definition: "작고 털이 있는 애완동물",
        part_of_speech: "명사",
        level: "beginner",
        synonyms: ["야옹이"],
        antonyms: ["개"],
        word_family: ["동물", "애완동물", "포유류"],
        compound_words: ["길고양이", "고양이털", "고양이밥"],
        collocations: [
          { phrase: "고양이를 키우다", frequency: "high" },
          { phrase: "귀여운 고양이", frequency: "high" },
        ],
      },
      english: {
        word: "cat",
        pronunciation: "kæt",
        romanization: null,
        definition: "a small furry pet animal",
        part_of_speech: "noun",
        level: "beginner",
        synonyms: ["feline", "kitty"],
        antonyms: ["dog"],
        word_family: ["animal", "pet", "mammal"],
        compound_words: ["housecat", "wildcat", "catfish"],
        collocations: [
          { phrase: "pet a cat", frequency: "high" },
          { phrase: "cute cat", frequency: "high" },
        ],
      },
      japanese: {
        word: "猫",
        pronunciation: "neko",
        romanization: "neko",
        definition: "小さくて毛のあるペット",
        part_of_speech: "名詞",
        level: "beginner",
        synonyms: ["ネコ", "にゃんこ"],
        antonyms: ["犬"],
        word_family: ["動物", "ペット", "哺乳類"],
        compound_words: ["野良猫", "子猫", "猫カフェ"],
        collocations: [{ phrase: "猫を飼う", frequency: "high" }],
      },
      chinese: {
        word: "猫",
        pronunciation: "māo",
        romanization: null,
        definition: "小而有毛的宠物",
        part_of_speech: "名词",
        level: "beginner",
        synonyms: ["猫咪"],
        antonyms: ["狗"],
        word_family: ["动物", "宠物", "哺乳动物"],
        compound_words: ["野猫", "小猫", "猫咖啡"],
        collocations: [{ phrase: "养猫", frequency: "high" }],
      },
    },
    // 대표 예문 (분리된 컬렉션 구조)
    representative_example: {
      korean: "우리 집에는 귀여운 고양이가 있습니다.",
      english: "We have a cute cat at home.",
      japanese: "私たちの家にはかわいい猫がいます。",
      chinese: "我们家有一只可爱的猫。",
    },

    // 추가 예문들 (분리된 컬렉션 구조)
    examples: [
      {
        korean: "고양이가 야옹하고 웁니다.",
        english: "The cat meows.",
        japanese: "猫がニャーと鳴きます。",
        chinese: "猫在喵喵叫。",
      },
    ],
    // 최소 호환성 필드들
    domain: "animal",
    category: "pet",
  },
];

export async function handleAIConceptRecommendation(currentUser, db) {
  try {
    console.log("AI 개념 추천 시작", { currentUser: currentUser?.uid, db });

    // 사용량 확인 (기존 users 컬렉션 사용)
    console.log("사용량 확인 중...");
    const usage = await conceptUtils.getUsage(currentUser.uid);
    console.log("사용량 확인 완료:", usage);

    const aiUsed = usage.aiUsed || 0;
    const aiLimit = usage.aiLimit || 100;

    if (aiUsed >= aiLimit) {
      alert(
        "AI 사용 한도에 도달했습니다. 한도를 늘리거나 다음 달을 기다려주세요."
      );
      return;
    }

    // 사용자 입력 받기
    const topic = prompt(
      "어떤 주제의 개념을 추천받고 싶으신가요? (예: 음식, 동물, 여행 등)"
    );
    if (!topic) {
      console.log("사용자가 주제 입력을 취소했습니다.");
      return;
    }
    console.log("선택된 주제:", topic);

    const category =
      prompt(
        "카테고리를 입력해주세요 (fruit, food, animal, daily, travel, business 중 하나)"
      ) || "daily";
    console.log("선택된 카테고리:", category);

    // 학습하고 싶은 언어 선택
    console.log("지원되는 언어:", supportedLanguages);
    const availableLanguages = Object.keys(supportedLanguages);
    const selectedLanguages = [];

    for (const lang of availableLanguages) {
      const include = confirm(
        `${supportedLanguages[lang].nameKo} 포함하시겠습니까?`
      );
      if (include) {
        selectedLanguages.push(lang);
      }
    }
    console.log("선택된 언어들:", selectedLanguages);

    if (selectedLanguages.length < 2) {
      alert("최소 2개 언어를 선택해주세요.");
      return;
    }

    // 로딩 표시
    console.log("로딩 표시 생성 중...");
    const loadingDiv = document.createElement("div");
    loadingDiv.className =
      "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50";
    loadingDiv.innerHTML = `
      <div class="bg-white p-6 rounded-lg shadow-lg">
        <div class="flex items-center space-x-3">
          <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          <span>AI가 개념을 생성하고 있습니다...</span>
        </div>
      </div>
    `;
    document.body.appendChild(loadingDiv);

    let conceptData;

    if (isLocalEnvironment) {
      console.log("로컬 환경에서 테스트 데이터 사용");
      // 로컬 환경에서는 테스트 데이터 사용
      await new Promise((resolve) => setTimeout(resolve, 2000)); // 2초 대기
      conceptData =
        TEST_CONCEPTS[Math.floor(Math.random() * TEST_CONCEPTS.length)];

      // 선택된 언어만 포함하도록 필터링
      const filteredExpressions = {};
      selectedLanguages.forEach((lang) => {
        if (conceptData.expressions[lang]) {
          filteredExpressions[lang] = conceptData.expressions[lang];
        }
      });
      conceptData.expressions = filteredExpressions;

      // 예제도 필터링 (분리된 컬렉션 구조)
      if (conceptData.representative_example) {
        const filteredRepExample = {};
        selectedLanguages.forEach((lang) => {
          if (conceptData.representative_example[lang]) {
            filteredRepExample[lang] = conceptData.representative_example[lang];
          }
        });
        conceptData.representative_example = filteredRepExample;
      }

      // 추가 예문들도 필터링
      if (conceptData.examples && conceptData.examples.length > 0) {
        const filteredExamples = conceptData.examples.map((example) => {
          const filteredExample = {};
          selectedLanguages.forEach((lang) => {
            if (example[lang]) {
              filteredExample[lang] = example[lang];
            }
          });
          return filteredExample;
        });
        conceptData.examples = filteredExamples;
      }
      console.log("테스트 개념 데이터 생성 완료:", conceptData);
    } else {
      console.log("실제 환경에서 Gemini API 호출");
      // 실제 환경에서는 Gemini API 호출
      conceptData = await generateConceptWithGemini(
        topic,
        category,
        selectedLanguages
      );
    }

    // 로딩 제거
    console.log("로딩 제거 중...");
    document.body.removeChild(loadingDiv);

    if (!conceptData) {
      alert("개념 생성에 실패했습니다. 다시 시도해주세요.");
      return;
    }

    // 분리된 컬렉션 구조에 맞게 데이터 변환 (다국어 단어장과 동일한 구조)
    console.log("🔧 분리된 컬렉션 구조로 데이터 변환 중...");
    const transformedConceptData = {
      // 개념 기본 정보 (다국어 단어장과 동일)
      concept_info: {
        domain:
          conceptData.concept_info?.domain || conceptData.domain || "general",
        category:
          conceptData.concept_info?.category ||
          conceptData.category ||
          category ||
          "common",
        difficulty: conceptData.concept_info?.difficulty || "beginner",
        unicode_emoji:
          conceptData.concept_info?.unicode_emoji ||
          conceptData.concept_info?.emoji ||
          "🤖",
        color_theme: conceptData.concept_info?.color_theme || "#9C27B0",
        tags: conceptData.concept_info?.tags || [],
        updated_at: new Date(),
      },

      // 언어별 표현 (다국어 단어장과 동일한 구조)
      expressions: conceptData.expressions || {},

      // 대표 예문 (다국어 단어장과 동일한 구조)
      representative_example:
        conceptData.representative_example ||
        (conceptData.featured_examples &&
        conceptData.featured_examples.length > 0
          ? conceptData.featured_examples[0]
          : null),

      // 학습 메타데이터 (AI 생성 특화)
      learning_metadata: {
        created_from: "ai_generated",
        import_date: new Date(),
        version: "3.0",
        structure_type: "separated_collections",
        ai_model: isLocalEnvironment ? "test-data" : "gemini-pro",
        generation_prompt: `주제: ${topic}, 카테고리: ${category}, 언어: ${selectedLanguages.join(
          ", "
        )}`,
        confidence_score: 0.9,
      },
    };

    console.log("🔧 변환된 개념 데이터:", transformedConceptData);

    // ai-recommend 컬렉션에 저장 (분리된 컬렉션 구조)
    console.log("💾 ai-recommend 컬렉션에 개념 저장 중...");
    const conceptId = await conceptUtils.createAIConcept(
      currentUser.email,
      transformedConceptData
    );
    console.log("✅ AI 개념 저장 완료, ID:", conceptId);

    // AI 사용량 업데이트 (기존 users 컬렉션 사용)
    console.log("AI 사용량 업데이트 중...");
    await conceptUtils.updateUsage(currentUser.uid, { aiUsed: aiUsed + 1 });
    console.log("AI 사용량 업데이트 완료");

    alert("AI 개념이 성공적으로 추가되었습니다!");

    // 페이지 새로고침
    window.location.reload();
  } catch (error) {
    console.error("AI 개념 추천 중 오류:", error);
    console.error("오류 스택:", error.stack);
    alert("개념 생성 중 오류가 발생했습니다. 다시 시도해주세요.");

    // 로딩 제거 (오류 시)
    const loadingDiv = document.querySelector(".fixed.inset-0.bg-black");
    if (loadingDiv) {
      try {
        document.body.removeChild(loadingDiv);
      } catch (removeError) {
        console.error("로딩 제거 중 오류:", removeError);
      }
    }
  }
}

async function generateConceptWithGemini(topic, category, languages) {
  try {
    // 사용자 언어 감지
    const userLang = navigator.language.toLowerCase().startsWith("ko")
      ? "korean"
      : "english";
    const prompt = PROMPTS[userLang];

    // Gemini API에 맞는 올바른 형식으로 요청 구성
    const requestBody = {
      contents: [
        {
          role: "user",
          parts: [
            {
              text:
                prompt.system +
                "\n\n" +
                prompt.user(topic, category, languages),
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      },
    };

    console.log("API 요청 데이터:", JSON.stringify(requestBody, null, 2));

    // 배포 환경에서는 서버 API 엔드포인트 사용
    const response = await fetch("/api/gemini", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API 오류 응답:`, response.status, errorText);
      throw new Error(`Gemini API 오류: ${response.status}`);
    }

    const data = await response.json();
    console.log("API 응답 데이터:", data);

    // 응답 구조 확인
    if (
      !data.candidates ||
      !data.candidates[0] ||
      !data.candidates[0].content
    ) {
      console.error("유효하지 않은 API 응답 구조:", data);
      throw new Error("유효하지 않은 API 응답 구조");
    }

    const generatedText = data.candidates[0].content.parts[0].text;
    console.log("생성된 텍스트:", generatedText);

    // JSON 파싱
    const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("유효한 JSON 응답을 찾을 수 없습니다.");
    }

    const conceptData = JSON.parse(jsonMatch[0]);

    // 데이터 검증
    if (!conceptData.concept_info || !conceptData.expressions) {
      throw new Error("응답 데이터 형식이 올바르지 않습니다.");
    }

    return conceptData;
  } catch (error) {
    console.error("Gemini API 호출 중 오류:", error);
    throw error;
  }
}
