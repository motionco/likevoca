import {
  conceptUtils,
  supportedLanguages,
} from "../js/firebase/firebase-init.js";

// 로컬 환경 감지
const isLocalEnvironment =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";

// Gemini API 설정 (실제 환경에서만 사용)
const GEMINI_API_KEY = "YOUR_GEMINI_API_KEY"; // 실제 배포시 환경변수로 설정
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;

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
    "domain": "일상생활",
    "category": "${category || "daily"}",
    "emoji": "적절한 이모지"
  },
  "expressions": {
    ${languages
      .map(
        (lang) => `
    "${lang}": {
      "word": "${lang} 단어",
      "pronunciation": "발음 (해당되는 경우)",
      "definition": "정의/뜻",
      "part_of_speech": "품사",
      "level": "beginner|intermediate|advanced"
    }`
      )
      .join(",")}
  },
  "examples": [
    {
      ${languages.map((lang) => `"${lang}": "${lang} 예문"`).join(",")}
    }
  ]
}

실제 사용 가능한 정확한 단어와 번역을 제공해주세요.`,
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
    "domain": "daily life",
    "category": "${category || "daily"}",
    "emoji": "appropriate emoji"
  },
  "expressions": {
    ${languages
      .map(
        (lang) => `
    "${lang}": {
      "word": "${lang} word",
      "pronunciation": "pronunciation (if applicable)",
      "definition": "definition/meaning",
      "part_of_speech": "part of speech",
      "level": "beginner|intermediate|advanced"
    }`
      )
      .join(",")}
  },
  "examples": [
    {
      ${languages
        .map((lang) => `"${lang}": "${lang} example sentence"`)
        .join(",")}
    }
  ]
}

Please provide accurate words and translations that are actually usable.`,
  },
};

// 테스트 데이터 (로컬 환경용)
const TEST_CONCEPTS = [
  {
    concept_info: {
      domain: "음식",
      category: "food",
      emoji: "🍎",
    },
    expressions: {
      korean: {
        word: "사과",
        pronunciation: "sa-gwa",
        definition: "빨갛거나 초록색의 둥근 과일",
        part_of_speech: "명사",
        level: "beginner",
      },
      english: {
        word: "apple",
        pronunciation: "ˈæpəl",
        definition: "a round fruit with red or green skin",
        part_of_speech: "noun",
        level: "beginner",
      },
      japanese: {
        word: "りんご",
        pronunciation: "ringo",
        definition: "赤いまたは緑色の丸い果物",
        part_of_speech: "名詞",
        level: "beginner",
      },
      chinese: {
        word: "苹果",
        pronunciation: "píngguǒ",
        definition: "红色或绿色的圆形水果",
        part_of_speech: "名词",
        level: "beginner",
      },
    },
    examples: [
      {
        korean: "나는 매일 사과를 먹습니다.",
        english: "I eat an apple every day.",
        japanese: "私は毎日りんごを食べます。",
        chinese: "我每天吃苹果。",
      },
    ],
  },
  {
    concept_info: {
      domain: "동물",
      category: "animal",
      emoji: "🐱",
    },
    expressions: {
      korean: {
        word: "고양이",
        pronunciation: "go-yang-i",
        definition: "작고 털이 있는 애완동물",
        part_of_speech: "명사",
        level: "beginner",
      },
      english: {
        word: "cat",
        pronunciation: "kæt",
        definition: "a small furry pet animal",
        part_of_speech: "noun",
        level: "beginner",
      },
      japanese: {
        word: "猫",
        pronunciation: "neko",
        definition: "小さくて毛のあるペット",
        part_of_speech: "名詞",
        level: "beginner",
      },
      chinese: {
        word: "猫",
        pronunciation: "māo",
        definition: "小而有毛的宠物",
        part_of_speech: "名词",
        level: "beginner",
      },
    },
    examples: [
      {
        korean: "우리 집에는 귀여운 고양이가 있습니다.",
        english: "We have a cute cat at home.",
        japanese: "私たちの家にはかわいい猫がいます。",
        chinese: "我们家有一只可爱的猫。",
      },
    ],
  },
];

export async function handleAIConceptRecommendation(currentUser, db) {
  try {
    console.log("AI 개념 추천 시작", { currentUser: currentUser?.uid, db });

    // 사용량 확인
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

      // 예제도 필터링
      if (conceptData.examples && conceptData.examples.length > 0) {
        const filteredExample = {};
        selectedLanguages.forEach((lang) => {
          if (conceptData.examples[0][lang]) {
            filteredExample[lang] = conceptData.examples[0][lang];
          }
        });
        conceptData.examples = [filteredExample];
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

    // Firebase에 저장
    console.log("Firebase에 개념 저장 중...");
    const conceptToSave = {
      ...conceptData,
      userId: currentUser.uid,
      createdAt: new Date().toISOString(),
      isAIGenerated: true,
    };

    console.log("저장할 개념 데이터:", conceptToSave);
    const conceptId = await conceptUtils.addConcept(conceptToSave);
    console.log("개념 저장 완료, ID:", conceptId);

    // AI 사용량 업데이트
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

    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: prompt.system,
            },
          ],
        },
        {
          parts: [
            {
              text: prompt.user(topic, category, languages),
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

    const response = await fetch(GEMINI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`Gemini API 오류: ${response.status}`);
    }

    const data = await response.json();
    const generatedText = data.candidates[0].content.parts[0].text;

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
