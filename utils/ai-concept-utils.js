import {
  conceptUtils,
  supportedLanguages,
  serverTimestamp,
} from "../js/firebase/firebase-init.js";

// 도메인-카테고리 매핑 import
import { domainCategoryMapping } from "../components/js/domain-category-emoji.js";

// 로컬 환경 감지
const isLocalEnvironment =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";

// Gemini API 설정 제거 - 이제 서버 엔드포인트를 사용
// const GEMINI_API_KEY = "YOUR_GEMINI_API_KEY"; // 실제 배포시 환경변수로 설정
// const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;

// 다국어 프롬프트 템플릿 (통일된 구조에 맞게 수정)
const PROMPTS = {
  korean: {
    system:
      "당신은 다국어 학습을 도와주는 AI 어시스턴트입니다. 사용자가 요청한 주제나 카테고리에 맞는 유용한 개념을 추천해주세요.",
    user: (domain, category, languages) => `
주제: ${domain}
카테고리: ${category}
언어: ${languages.join(", ")}

위 조건에 맞는 학습하기 좋은 개념 하나를 추천해주세요. 
다음 도메인-카테고리 매핑을 참고하여 적절한 도메인과 카테고리를 선택해주세요:

**도메인 (13개)**:
- daily: 일상생활 (household, family, routine, clothing, furniture, shopping, communication, personal_care, leisure, relationships, emotions, time, weather_talk)
- food: 음식/요리 (fruit, vegetable, meat, drink, snack, grain, seafood, dairy, cooking, dining, restaurant, kitchen_utensils, spices, dessert)
- travel: 여행 (transportation, accommodation, tourist_attraction, luggage, direction, booking, currency, emergency, documents, sightseeing, local_food, souvenir)
- business: 비즈니스/업무 (meeting, finance, marketing, office, project, negotiation, presentation, teamwork, leadership, networking, sales, contract, startup)
- academic: 학술/교육 (science, literature, history, mathematics, research, philosophy, psychology, sociology, linguistics, university, examination, thesis, library)
- nature: 자연/환경 (animal, plant, weather, geography, environment, ecosystem, conservation, climate, natural_disaster, landscape, marine_life, forest, mountain)
- technology: 기술/IT (computer, software, internet, mobile, ai, programming, cybersecurity, database, robotics, blockchain, cloud, social_media, gaming, innovation)
- health: 건강/의료 (exercise, medicine, nutrition, mental_health, hospital, fitness, wellness, therapy, prevention, symptoms, treatment, pharmacy, rehabilitation, medical_equipment)
- sports: 스포츠/운동 (football, basketball, swimming, running, equipment, olympics, tennis, baseball, golf, martial_arts, team_sports, individual_sports, coaching, competition)
- entertainment: 엔터테인먼트 (movie, music, game, book, art, theater, concert, festival, celebrity, tv_show, comedy, drama, animation, photography)
- culture: 문화/전통 (tradition, customs, language, religion, heritage, ceremony, ritual, folklore, mythology, arts_crafts, etiquette, national_identity)
- education: 교육/학습 (teaching, learning, classroom, curriculum, assessment, pedagogy, skill_development, online_learning, training, certification, educational_technology, student_life, graduation)
- other: 기타 (hobbies, finance_personal, legal, government, politics, media, community, volunteering, charity, social_issues, philosophy_life, spirituality, creativity, innovation)

다음 JSON 형식으로 응답해주세요:

{
  "concept_info": {
    "domain": "${domain}",
    "category": "${category}",
    "difficulty": "beginner",
    "tags": ["태그1", "태그2", "태그3"],
    "unicode_emoji": "적절한 이모지 1개",
    "color_theme": "#FF6B6B"
  },
  "expressions": {
    ${languages
      .map(
        (lang) => `
    "${lang}": {
      "word": "${lang} 단어",
      "pronunciation": "발음 표기 (IPA 또는 현지 표기법)",
      "definition": "명확한 정의/뜻",
      "part_of_speech": "품사",
      "level": "beginner|intermediate|advanced",
      "synonyms": ["동의어1", "동의어2"],
      "antonyms": ["반의어1", "반의어2"],
      "word_family": ["관련어1", "관련어2"],
      "compound_words": ["복합어1", "복합어2"],
      "collocations": ["연어1", "연어2"]
    }`
      )
      .join(",")}
  },
  "representative_example": {
    "translations": {
      ${languages.map((lang) => `"${lang}": "${lang} 예문"`).join(",")}
    },
    "context": "daily_conversation|formal|informal|academic",
    "difficulty": "beginner|intermediate|advanced"
  }
}

실제 사용 가능한 정확한 단어와 번역을 제공해주세요. 모든 배열은 적절한 값으로 채워주세요. 예문은 주요 단어를 자연스럽게 사용해야 합니다.`,
  },
  english: {
    system:
      "You are an AI assistant that helps with multilingual learning. Please recommend useful concepts that match the user's requested topic or category.",
    user: (domain, category, languages) => `
Domain: ${domain}
Category: ${category}
Languages: ${languages.join(", ")}

Please recommend one good concept to learn based on the above conditions.
Please refer to the following domain-category mapping to select appropriate domain and category:

**Domains (13)**:
- daily: Daily life (household, family, routine, clothing, furniture, shopping, communication, personal_care, leisure, relationships, emotions, time, weather_talk)
- food: Food/Cooking (fruit, vegetable, meat, drink, snack, grain, seafood, dairy, cooking, dining, restaurant, kitchen_utensils, spices, dessert)
- travel: Travel (transportation, accommodation, tourist_attraction, luggage, direction, booking, currency, emergency, documents, sightseeing, local_food, souvenir)
- business: Business/Work (meeting, finance, marketing, office, project, negotiation, presentation, teamwork, leadership, networking, sales, contract, startup)
- academic: Academic/Education (science, literature, history, mathematics, research, philosophy, psychology, sociology, linguistics, university, examination, thesis, library)
- nature: Nature/Environment (animal, plant, weather, geography, environment, ecosystem, conservation, climate, natural_disaster, landscape, marine_life, forest, mountain)
- technology: Technology/IT (computer, software, internet, mobile, ai, programming, cybersecurity, database, robotics, blockchain, cloud, social_media, gaming, innovation)
- health: Health/Medical (exercise, medicine, nutrition, mental_health, hospital, fitness, wellness, therapy, prevention, symptoms, treatment, pharmacy, rehabilitation, medical_equipment)
- sports: Sports/Exercise (football, basketball, swimming, running, equipment, olympics, tennis, baseball, golf, martial_arts, team_sports, individual_sports, coaching, competition)
- entertainment: Entertainment (movie, music, game, book, art, theater, concert, festival, celebrity, tv_show, comedy, drama, animation, photography)
- culture: Culture/Tradition (tradition, customs, language, religion, heritage, ceremony, ritual, folklore, mythology, arts_crafts, etiquette, national_identity)
- education: Education/Learning (teaching, learning, classroom, curriculum, assessment, pedagogy, skill_development, online_learning, training, certification, educational_technology, student_life, graduation)
- other: Other (hobbies, finance_personal, legal, government, politics, media, community, volunteering, charity, social_issues, philosophy_life, spirituality, creativity, innovation)

Respond in the following JSON format:

{
  "concept_info": {
    "domain": "${domain}",
    "category": "${category}",
    "difficulty": "beginner",
    "tags": ["tag1", "tag2", "tag3"],
    "unicode_emoji": "appropriate emoji",
    "color_theme": "#FF6B6B"
  },
  "expressions": {
    ${languages
      .map(
        (lang) => `
    "${lang}": {
      "word": "${lang} word",
      "pronunciation": "pronunciation notation with IPA or local notation",
      "definition": "clear definition/meaning",
      "part_of_speech": "part of speech",
      "level": "beginner|intermediate|advanced",
      "synonyms": ["synonym1", "synonym2"],
      "antonyms": ["antonym1", "antonym2"],
      "word_family": ["related1", "related2"],
      "compound_words": ["compound1", "compound2"],
      "collocations": ["collocation1", "collocation2"]
    }`
      )
      .join(",")}
  },
  "representative_example": {
    "translations": {
      ${languages
        .map((lang) => `"${lang}": "${lang} example sentence"`)
        .join(",")}
    },
    "context": "daily_conversation|formal|informal|academic",
    "difficulty": "beginner|intermediate|advanced"
  }
}

Please provide accurate words and translations that are actually usable. Fill all arrays with appropriate values. Make sure the example sentence uses the main word naturally.`,
  },
};

// 도메인 한국어 번역
const domainTranslations = {
  daily: "일상생활",
  food: "음식/요리",
  travel: "여행",
  business: "비즈니스/업무",
  academic: "학술/교육",
  nature: "자연/환경",
  technology: "기술/IT",
  health: "건강/의료",
  sports: "스포츠/운동",
  entertainment: "엔터테인먼트",
  culture: "문화/전통",
  education: "교육/학습",
  other: "기타",
};

// 카테고리 한국어 번역
const categoryTranslations = {
  // daily
  household: "가정용품",
  family: "가족",
  routine: "일상",
  clothing: "의류",
  furniture: "가구",
  shopping: "쇼핑",
  transportation: "교통",
  communication: "소통",
  personal_care: "개인관리",
  leisure: "여가",
  relationships: "인간관계",
  emotions: "감정",
  time: "시간",
  weather_talk: "날씨대화",

  // food
  fruit: "과일",
  vegetable: "채소",
  meat: "고기",
  drink: "음료",
  snack: "간식",
  grain: "곡물",
  seafood: "해산물",
  dairy: "유제품",
  cooking: "요리",
  dining: "식사",
  restaurant: "레스토랑",
  kitchen_utensils: "주방용품",
  spices: "향신료",
  dessert: "디저트",

  // travel
  accommodation: "숙박",
  tourist_attraction: "관광지",
  luggage: "짐",
  direction: "방향",
  booking: "예약",
  currency: "화폐",
  emergency: "응급상황",
  documents: "서류",
  sightseeing: "관광",
  local_food: "현지음식",
  souvenir: "기념품",

  // business
  meeting: "회의",
  finance: "금융",
  marketing: "마케팅",
  office: "사무실",
  project: "프로젝트",
  negotiation: "협상",
  presentation: "발표",
  teamwork: "팀워크",
  leadership: "리더십",
  networking: "네트워킹",
  sales: "영업",
  contract: "계약",
  startup: "스타트업",

  // academic
  science: "과학",
  literature: "문학",
  history: "역사",
  mathematics: "수학",
  research: "연구",
  philosophy: "철학",
  psychology: "심리학",
  sociology: "사회학",
  linguistics: "언어학",
  university: "대학",
  examination: "시험",
  thesis: "논문",
  library: "도서관",

  // nature
  animal: "동물",
  plant: "식물",
  weather: "날씨",
  geography: "지리",
  environment: "환경",
  ecosystem: "생태계",
  conservation: "보존",
  climate: "기후",
  natural_disaster: "자연재해",
  landscape: "풍경",
  marine_life: "해양생물",
  forest: "숲",
  mountain: "산",

  // technology
  computer: "컴퓨터",
  software: "소프트웨어",
  internet: "인터넷",
  mobile: "모바일",
  ai: "인공지능",
  programming: "프로그래밍",
  cybersecurity: "사이버보안",
  database: "데이터베이스",
  robotics: "로봇공학",
  blockchain: "블록체인",
  cloud: "클라우드",
  social_media: "소셜미디어",
  gaming: "게임",
  innovation: "혁신",

  // health
  exercise: "운동",
  medicine: "의학",
  nutrition: "영양",
  mental_health: "정신건강",
  hospital: "병원",
  fitness: "피트니스",
  wellness: "웰니스",
  therapy: "치료",
  prevention: "예방",
  symptoms: "증상",
  treatment: "치료법",
  pharmacy: "약국",
  rehabilitation: "재활",
  medical_equipment: "의료기기",

  // sports
  football: "축구",
  basketball: "농구",
  swimming: "수영",
  running: "달리기",
  equipment: "장비",
  olympics: "올림픽",
  tennis: "테니스",
  baseball: "야구",
  golf: "골프",
  martial_arts: "무술",
  team_sports: "팀스포츠",
  individual_sports: "개인스포츠",
  coaching: "코칭",
  competition: "경쟁",

  // entertainment
  movie: "영화",
  music: "음악",
  game: "게임",
  book: "책",
  art: "예술",
  theater: "연극",
  concert: "콘서트",
  festival: "축제",
  celebrity: "연예인",
  tv_show: "TV쇼",
  comedy: "코미디",
  drama: "드라마",
  animation: "애니메이션",
  photography: "사진",

  // culture
  tradition: "전통",
  customs: "관습",
  language: "언어",
  religion: "종교",
  heritage: "유산",
  ceremony: "의식",
  ritual: "의례",
  folklore: "민속",
  mythology: "신화",
  arts_crafts: "공예",
  etiquette: "예절",
  national_identity: "국가정체성",

  // education
  teaching: "교육",
  learning: "학습",
  classroom: "교실",
  curriculum: "교육과정",
  assessment: "평가",
  pedagogy: "교육학",
  skill_development: "기술개발",
  online_learning: "온라인학습",
  training: "훈련",
  certification: "자격증",
  educational_technology: "교육기술",
  student_life: "학생생활",
  graduation: "졸업",

  // other
  hobbies: "취미",
  finance_personal: "개인금융",
  legal: "법률",
  government: "정부",
  politics: "정치",
  media: "미디어",
  community: "커뮤니티",
  volunteering: "자원봉사",
  charity: "자선",
  social_issues: "사회문제",
  philosophy_life: "인생철학",
  spirituality: "영성",
  creativity: "창의성",
  innovation: "혁신",

  other: "기타",
};

// 테스트 데이터 (로컬 환경용) - 다국어 단어장과 완전히 동일한 구조
const TEST_CONCEPTS = [
  {
    // 개념 기본 정보 (다국어 단어장과 동일)
    concept_info: {
      domain: "food",
      category: "fruit",
      difficulty: "beginner",
      tags: ["everyday", "healthy", "common"],
      unicode_emoji: "🍎",
      color_theme: "#FF6B6B",
    },

    expressions: {
      korean: {
        word: "사과",
        pronunciation: "sa-gwa",
        definition: "둥글고 빨간 과일",
        part_of_speech: "명사",
        level: "beginner",
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
        level: "beginner",
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
        level: "beginner",
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
        level: "beginner",
        synonyms: ["アップル"],
        antonyms: [],
        word_family: ["果物", "食べ物"],
        compound_words: ["りんごの木", "りんごジュース"],
        collocations: ["赤いりんご", "新鮮なりんご"],
      },
    },
    // 대표 예문 (다국어 단어장과 동일한 구조)
    representative_example: {
      korean: "사과 주스 하나 주세요.",
      english: "Please give me one apple juice.",
      chinese: "请给我一杯苹果汁。",
      japanese: "りんごジュースを一つください。",
    },
    // 최소 호환성 필드들
    domain: "food",
    category: "fruit",
  },
  {
    // 개념 기본 정보 (다국어 단어장과 동일)
    concept_info: {
      domain: "animal",
      category: "pet",
      difficulty: "beginner",
      tags: ["pet", "common", "domestic"],
      unicode_emoji: "🐱",
      color_theme: "#9C27B0",
    },

    expressions: {
      korean: {
        word: "고양이",
        pronunciation: "go-yang-i",
        definition: "작고 털이 있는 애완동물",
        part_of_speech: "명사",
        level: "beginner",
        synonyms: ["야옹이"],
        antonyms: ["개"],
        word_family: ["동물", "애완동물"],
        compound_words: ["길고양이", "고양이털"],
        collocations: ["귀여운 고양이", "고양이를 키우다"],
      },
      english: {
        word: "cat",
        pronunciation: "/kæt/",
        definition: "a small furry pet animal",
        part_of_speech: "noun",
        level: "beginner",
        synonyms: ["feline", "kitty"],
        antonyms: ["dog"],
        word_family: ["animal", "pet"],
        compound_words: ["housecat", "wildcat"],
        collocations: ["cute cat", "pet a cat"],
      },
      chinese: {
        word: "猫",
        pronunciation: "māo",
        definition: "小而有毛的宠物",
        part_of_speech: "名词",
        level: "beginner",
        synonyms: ["猫咪"],
        antonyms: ["狗"],
        word_family: ["动物", "宠物"],
        compound_words: ["野猫", "小猫"],
        collocations: ["可爱的猫", "养猫"],
      },
      japanese: {
        word: "猫",
        pronunciation: "neko",
        definition: "小さくて毛のあるペット",
        part_of_speech: "名詞",
        level: "beginner",
        synonyms: ["ネコ", "にゃんこ"],
        antonyms: ["犬"],
        word_family: ["動物", "ペット"],
        compound_words: ["野良猫", "子猫"],
        collocations: ["かわいい猫", "猫を飼う"],
      },
    },
    // 대표 예문 (다국어 단어장과 동일한 구조)
    representative_example: {
      korean: "그 고양이는 매우 귀엽습니다.",
      english: "That cat is very cute.",
      chinese: "那只猫很可爱。",
      japanese: "その猫はとても可愛いです。",
    },
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

    // 개선된 모달을 사용하여 사용자 입력 받기
    let userSelection;
    try {
      userSelection = await createAIConceptModal();
    } catch (error) {
      console.log("사용자가 모달을 취소했습니다:", error.message);
      return;
    }

    const { domain, category, selectedLanguages } = userSelection;
    console.log("선택된 도메인:", domain);
    console.log("선택된 카테고리:", category);
    console.log("선택된 언어들:", selectedLanguages);

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

      // 예제도 필터링 (다국어 단어장 구조)
      if (conceptData.representative_example) {
        const filteredTranslations = {};
        selectedLanguages.forEach((lang) => {
          if (conceptData.representative_example[lang]) {
            filteredTranslations[lang] =
              conceptData.representative_example[lang];
          }
        });
        conceptData.representative_example = filteredTranslations;
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
        console.log(`📝 필터링된 예문 수: ${filteredExamples.length}개`);
      }
      console.log("테스트 개념 데이터 생성 완료:", conceptData);
    } else {
      console.log("실제 환경에서 Gemini API 호출");
      // 실제 환경에서는 Gemini API 호출
      conceptData = await generateConceptWithGemini(
        domain,
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

    // 분리된 컬렉션 구조에 맞게 데이터 변환 (다국어 단어장과 완전히 동일한 구조)
    console.log("🔧 분리된 컬렉션 구조로 데이터 변환 중...");
    const transformedConceptData = {
      // 개념 기본 정보 (다국어 단어장과 완전히 동일)
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
      },

      // 언어별 표현 (다국어 단어장과 완전히 동일한 구조)
      expressions: conceptData.expressions || {},

      // 대표 예문 (다국어 단어장과 완전히 동일한 구조)
      representative_example:
        conceptData.representative_example ||
        (conceptData.featured_examples &&
        conceptData.featured_examples.length > 0
          ? conceptData.featured_examples[0]
          : null),

      // 추가 예문들 (다국어 단어장과 완전히 동일한 구조)
      examples: conceptData.examples || [],

      // 생성 시간
      createdAt: serverTimestamp(),
    };

    console.log("🔧 변환된 개념 데이터:", transformedConceptData);
    console.log("🔧 예문 개수:", transformedConceptData.examples.length);

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

    // 성공 메시지 (환경 변수 설정 안내 포함)
    let successMessage = "AI 개념이 성공적으로 추가되었습니다!";

    // 배포 환경에서 테스트 응답을 받은 경우 안내 메시지 추가
    if (
      !isLocalEnvironment &&
      conceptData &&
      conceptData.expressions &&
      conceptData.expressions.korean &&
      conceptData.expressions.korean.word === "집"
    ) {
      successMessage +=
        "\n\n💡 현재 테스트 모드로 실행 중입니다.\n실제 AI 기능을 사용하려면 Vercel 대시보드에서 GEMINI_API_KEY 환경 변수를 설정해주세요.";
    }

    alert(successMessage);

    // 페이지 새로고침
    window.location.reload();
  } catch (error) {
    console.error("AI 개념 추천 중 오류:", error);
    console.error("오류 스택:", error.stack);

    // 구체적인 오류 메시지 제공
    let userMessage = "개념 생성 중 오류가 발생했습니다. 다시 시도해주세요.";
    if (error.message.includes("서버에서 오류가 발생했습니다")) {
      userMessage =
        "현재 AI 서비스에 일시적인 문제가 있습니다. 잠시 후 다시 시도해주세요.";
    } else if (error.message.includes("API 인증에 실패했습니다")) {
      userMessage =
        "AI 서비스 설정에 문제가 있습니다. 관리자에게 문의해주세요.";
    } else if (error.message.includes("사용량 한도를 초과했습니다")) {
      userMessage = "AI 사용량 한도를 초과했습니다. 잠시 후 다시 시도해주세요.";
    }

    alert(userMessage);

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

async function generateConceptWithGemini(domain, category, languages) {
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
                prompt.user(domain, category, languages),
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

      // 구체적인 오류 메시지 제공
      let errorMessage = `Gemini API 오류: ${response.status}`;
      if (response.status === 500) {
        errorMessage =
          "서버에서 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
      } else if (response.status === 401) {
        errorMessage = "API 인증에 실패했습니다. 관리자에게 문의해주세요.";
      } else if (response.status === 429) {
        errorMessage =
          "API 사용량 한도를 초과했습니다. 잠시 후 다시 시도해주세요.";
      }

      throw new Error(errorMessage);
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

// 개선된 UI 모달 생성 함수
function createAIConceptModal() {
  return new Promise((resolve, reject) => {
    // 모달 HTML 생성
    const modalHTML = `
      <div id="ai-concept-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div class="p-6">
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-xl font-bold">AI 개념 추천</h2>
              <button id="close-ai-modal" class="text-gray-500 hover:text-gray-700">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            
            <!-- 도메인 선택 -->
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">주제 선택</label>
              <select id="domain-select" class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="">주제를 선택하세요</option>
                ${Object.keys(domainCategoryMapping)
                  .map(
                    (domain) =>
                      `<option value="${domain}">${
                        domainTranslations[domain] || domain
                      }</option>`
                  )
                  .join("")}
              </select>
            </div>
            
            <!-- 카테고리 선택 -->
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">카테고리 선택</label>
              <select id="category-select" class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" disabled>
                <option value="">먼저 주제를 선택하세요</option>
              </select>
            </div>
            
            <!-- 언어 선택 -->
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-2">포함할 언어 (최소 2개 선택)</label>
              <div class="space-y-2">
                ${Object.keys(supportedLanguages)
                  .map(
                    (lang) => `
                  <label class="flex items-center">
                    <input type="checkbox" value="${lang}" class="language-checkbox mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                    <span>${supportedLanguages[lang].nameKo}</span>
                  </label>
                `
                  )
                  .join("")}
              </div>
            </div>
            
            <!-- 버튼 -->
            <div class="flex justify-end space-x-3">
              <button id="cancel-ai-concept" class="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50">
                취소
              </button>
              <button id="generate-ai-concept" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed" disabled>
                AI 개념 생성
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    // 모달을 DOM에 추가
    document.body.insertAdjacentHTML("beforeend", modalHTML);

    const modal = document.getElementById("ai-concept-modal");
    const domainSelect = document.getElementById("domain-select");
    const categorySelect = document.getElementById("category-select");
    const generateBtn = document.getElementById("generate-ai-concept");
    const closeBtn = document.getElementById("close-ai-modal");
    const cancelBtn = document.getElementById("cancel-ai-concept");

    // 도메인 변경 시 카테고리 업데이트
    domainSelect.addEventListener("change", function () {
      const selectedDomain = this.value;
      categorySelect.innerHTML =
        '<option value="">카테고리를 선택하세요</option>';

      if (selectedDomain && domainCategoryMapping[selectedDomain]) {
        categorySelect.disabled = false;
        domainCategoryMapping[selectedDomain].forEach((category) => {
          const option = document.createElement("option");
          option.value = category;
          option.textContent = categoryTranslations[category] || category;
          categorySelect.appendChild(option);
        });
      } else {
        categorySelect.disabled = true;
      }

      checkFormValidity();
    });

    // 폼 유효성 검사
    function checkFormValidity() {
      const domain = domainSelect.value;
      const category = categorySelect.value;
      const selectedLanguages = Array.from(
        document.querySelectorAll(".language-checkbox:checked")
      );

      const isValid = domain && category && selectedLanguages.length >= 2;
      generateBtn.disabled = !isValid;
    }

    // 이벤트 리스너 추가
    categorySelect.addEventListener("change", checkFormValidity);
    document.querySelectorAll(".language-checkbox").forEach((checkbox) => {
      checkbox.addEventListener("change", checkFormValidity);
    });

    // 생성 버튼 클릭
    generateBtn.addEventListener("click", function () {
      const domain = domainSelect.value;
      const category = categorySelect.value;
      const selectedLanguages = Array.from(
        document.querySelectorAll(".language-checkbox:checked")
      ).map((checkbox) => checkbox.value);

      modal.remove();
      resolve({ domain, category, selectedLanguages });
    });

    // 모달 닫기
    function closeModal() {
      modal.remove();
      reject(new Error("사용자가 취소했습니다."));
    }

    closeBtn.addEventListener("click", closeModal);
    cancelBtn.addEventListener("click", closeModal);

    // 배경 클릭 시 닫기
    modal.addEventListener("click", function (e) {
      if (e.target === modal) {
        closeModal();
      }
    });
  });
}
