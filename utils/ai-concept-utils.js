import {
  conceptUtils,
  supportedLanguages,
  serverTimestamp,
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
      "당신은 다국어 학습을 도와주는 AI 어시스턴트입니다. 사용자가 요청한 주제나 카테고리에 맞는 유용한 개념을 추천해주세요. 매번 다른 흥미로운 단어를 생성하는 것이 매우 중요합니다.",
    user: (domain, category, languages, excludeWords = []) => `
도메인: ${domain || "daily"}
카테고리: ${category || "other"}
언어: ${languages.join(", ")}
랜덤 시드: ${Date.now() % 10000}-${Math.floor(
      Math.random() * 10000
    )} (다양성을 위한 랜덤 값)

🚫 제외할 단어들 (이미 생성된 단어들이므로 절대 사용하지 마세요):
${
  excludeWords.length > 0
    ? excludeWords.map((word) => `- ${word}`).join("\n")
    : "없음"
}

🎯 중요한 지시사항:
1. 위 제외 목록에 있는 단어들은 절대 사용하지 마세요
2. 매번 완전히 다른 흥미로운 개념을 생성해주세요
3. 같은 도메인/카테고리라도 다양한 관점에서 접근해주세요
4. 창의적이고 독특한 단어를 선택해주세요
5. 📚 단어 형태 제한사항:
   - ✅ 허용: 사전에 독립적인 표제어로 등재된 단어만 생성
   - ✅ 허용: 복합어 (bookstore, classroom, well-being, mother-in-law, sweet potato, high school)
   - ❌ 금지: 일반적인 구문/어구 (hotel booking, flight reservation, room service, fixed price system 등)
   - ❌ 금지: 동사+명사 조합 구문 (make reservation, book hotel, check in 등)
   - ❌ 금지: 형용사+명사+명사 조합 (fixed price system, online booking service 등)
   - 기준: 영어 사전에서 하나의 단어나 복합어로 검색 가능한 것만 선택
6. 📝 정의 및 형식 지침:
   - 정의는 간결하고 명확하게 (한 문장 이내)
   - 발음 표기는 pronunciation 속성에만 기록 (word나 예문에 발음 기호 포함 금지)
   - 예문은 해당 언어만 사용 (영어 혼용 금지)
   - 각 언어별로 자연스럽고 독립적인 예문 작성
7. 🎲 품사 다양성 지침:
   - 명사만 생성하지 말고 다양한 품사 활용 (동사, 형용사, 부사 등)
   - 품사 비율 목표: 명사 60%, 동사 20%, 형용사 15%, 부사 5%
   - 각 도메인에 적합한 품사 선택 (예: 일상생활 → 동사 많이, 감정 → 형용사 많이)

위 도메인과 카테고리를 참고하여 학습하기 좋은 개념 하나를 추천해주세요.
💡 핵심: 절대 반복되지 않는 새로운 단어를 생성해주세요!

선택된 도메인과 카테고리에 정확히 맞는 개념이 있다면 그대로 사용하고, 
더 적절한 도메인/카테고리가 있다면 아래 매핑을 참고하여 변경해도 됩니다.

다음 도메인-카테고리 매핑을 참고하여 적절한 도메인과 카테고리를 선택해주세요:

**도메인 (12개)**:
- daily: 일상생활 (household, family, routine, clothing, furniture, shopping, communication, personal_care, leisure, relationships, emotions, time, weather_talk)
- food: 음식/요리 (fruit, vegetable, meat, drink, snack, grain, seafood, dairy, cooking, dining, restaurant, kitchen_utensils, spices, dessert)
- travel: 여행 (transportation, accommodation, tourist_attraction, luggage, direction, booking, currency, emergency, documents, sightseeing, local_food, souvenir)
- business: 비즈니스/업무 (meeting, finance, marketing, office, project, negotiation, presentation, teamwork, leadership, networking, sales, contract, startup)
- education: 교육 (teaching, learning, classroom, curriculum, assessment, pedagogy, skill_development, online_learning, training, certification, educational_technology, student_life, graduation, examination, university, library)
- nature: 자연/환경 (animal, plant, weather, geography, environment, ecosystem, conservation, climate, natural_disaster, landscape, marine_life, forest, mountain)
- technology: 기술/IT (computer, software, internet, mobile, ai, programming, cybersecurity, database, robotics, blockchain, cloud, social_media, gaming, innovation)
- health: 건강/의료 (exercise, medicine, nutrition, mental_health, hospital, fitness, wellness, therapy, prevention, symptoms, treatment, pharmacy, rehabilitation, medical_equipment)
- sports: 스포츠/운동 (football, basketball, swimming, running, equipment, olympics, tennis, baseball, golf, martial_arts, team_sports, individual_sports, coaching, competition)
- entertainment: 엔터테인먼트 (movie, music, game, book, art, theater, concert, festival, celebrity, tv_show, comedy, drama, animation, photography)
- culture: 문화/전통 (tradition, customs, language, religion, heritage, ceremony, ritual, folklore, mythology, arts_crafts, etiquette, national_identity)
- other: 기타 (hobbies, finance_personal, legal, government, politics, media, community, volunteering, charity, social_issues, philosophy_life, spirituality, creativity, innovation, science, literature, history, mathematics, research, philosophy, psychology, sociology, linguistics, thesis)

�� 다양성 예시 (각 카테고리마다 10-20개 옵션 중 선택):
- 일상 > 쇼핑: 할인, 영수증, 계산대, 카트, 바구니, 가격표, 쿠폰, 포장지, 쇼핑백, 매장
- 음식 > 과일: 사과, 바나나, 오렌지, 포도, 딸기, 키위, 망고, 복숭아, 파인애플, 체리
- 여행 > 교통: 버스, 지하철, 택시, 기차, 비행기, 자전거, 오토바이, 배, 트램, 케이블카
- 비즈니스 > 회의: 회의실, 발표, 토론, 의제, 결정, 합의, 보고서, 프레젠테이션, 협상, 계약

다음 JSON 형식으로 응답해주세요:

{
  "concept_info": {
    "domain": "적절한_도메인",
    "category": "적절한_카테고리",
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
      "definition": "간결하고 명확한 정의 (한 문장 이내)",
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
    ${languages
      .map((lang) => `"${lang}": "${lang} 순수 예문 (발음 기호 없이)"`)
      .join(",")}
  }
}

실제 사용 가능한 정확한 단어와 번역을 제공해주세요. 모든 배열은 적절한 값으로 채워주세요. 예문은 주요 단어를 자연스럽게 사용하고 해당 언어만 사용해야 합니다. 중요: word 속성과 예문에는 발음 기호를 포함하지 마세요.`,
  },
  english: {
    system:
      "You are an AI assistant that helps with multilingual learning. Please recommend useful concepts that match the user's requested topic or category. It's crucial to generate different interesting words every time.",
    user: (domain, category, languages, excludeWords = []) => `
Domain: ${domain || "daily"}
Category: ${category || "other"}
Languages: ${languages.join(", ")}
Random seed: ${Date.now() % 10000}-${Math.floor(
      Math.random() * 10000
    )} (random value for diversity)

🚫 Words to EXCLUDE (already generated words - DO NOT use these):
${
  excludeWords.length > 0
    ? excludeWords.map((word) => `- ${word}`).join("\n")
    : "None"
}

🎯 CRITICAL INSTRUCTIONS:
1. DO NOT use any words from the exclude list above
2. Generate completely different and interesting concepts each time
3. Even within the same domain/category, approach from various perspectives
4. Choose creative and unique words
5. 📚 Word Form Restrictions:
   - ✅ ALLOWED: Only words that are listed as independent dictionary entries
   - ✅ ALLOWED: Compound words (bookstore, classroom, well-being, mother-in-law, sweet potato, high school)
   - ❌ PROHIBITED: General phrases/expressions (hotel booking, flight reservation, room service, fixed price system, etc.)
   - ❌ PROHIBITED: Verb+noun combination phrases (make reservation, book hotel, check in, etc.)
   - ❌ PROHIBITED: Adjective+noun+noun combinations (fixed price system, online booking service, etc.)
   - CRITERION: Only select words that can be found as a single word or compound word in English dictionaries
6. 📝 Definition and Format Guidelines:
   - Keep definitions concise and clear (within one sentence)
   - Pronunciation should only go in pronunciation field (no pronunciation in word or examples)
   - Example sentences must use only the target language (no English mixing)
   - Create natural and independent example sentences for each language
7. 🎲 Part of Speech Diversity Guidelines:
   - Don't just generate nouns, use a variety of parts of speech (verbs, adjectives, adverbs)
   - Target ratios: 60% nouns, 20% verbs, 15% adjectives, 5% adverbs
   - Choose appropriate parts of speech for each domain (e.g., daily life → more verbs, emotions → more adjectives)

Please recommend one good concept to learn based on the above domain and category as reference.
💡 KEY: Generate absolutely non-repetitive new words!

If there's a concept that exactly matches the selected domain and category, use it as is.
If there's a more appropriate domain/category, feel free to change it based on the mapping below.

Please refer to the following domain-category mapping to select appropriate domain and category:

**Domains (12)**:
- daily: Daily life (household, family, routine, clothing, furniture, shopping, communication, personal_care, leisure, relationships, emotions, time, weather_talk)
- food: Food/Cooking (fruit, vegetable, meat, drink, snack, grain, seafood, dairy, cooking, dining, restaurant, kitchen_utensils, spices, dessert)
- travel: Travel (transportation, accommodation, tourist_attraction, luggage, direction, booking, currency, emergency, documents, sightseeing, local_food, souvenir)
- business: Business/Work (meeting, finance, marketing, office, project, negotiation, presentation, teamwork, leadership, networking, sales, contract, startup)
- education: Education (teaching, learning, classroom, curriculum, assessment, pedagogy, skill_development, online_learning, training, certification, educational_technology, student_life, graduation, examination, university, library)
- nature: Nature/Environment (animal, plant, weather, geography, environment, ecosystem, conservation, climate, natural_disaster, landscape, marine_life, forest, mountain)
- technology: Technology/IT (computer, software, internet, mobile, ai, programming, cybersecurity, database, robotics, blockchain, cloud, social_media, gaming, innovation)
- health: Health/Medical (exercise, medicine, nutrition, mental_health, hospital, fitness, wellness, therapy, prevention, symptoms, treatment, pharmacy, rehabilitation, medical_equipment)
- sports: Sports/Exercise (football, basketball, swimming, running, equipment, olympics, tennis, baseball, golf, martial_arts, team_sports, individual_sports, coaching, competition)
- entertainment: Entertainment (movie, music, game, book, art, theater, concert, festival, celebrity, tv_show, comedy, drama, animation, photography)
- culture: Culture/Tradition (tradition, customs, language, religion, heritage, ceremony, ritual, folklore, mythology, arts_crafts, etiquette, national_identity)
- other: Other (hobbies, finance_personal, legal, government, politics, media, community, volunteering, charity, social_issues, philosophy_life, spirituality, creativity, innovation, science, literature, history, mathematics, research, philosophy, psychology, sociology, linguistics, thesis)

🎲 Diversity Examples (choose from 10-20 options per category):
- daily > shopping: discount, receipt, checkout, cart, basket, price tag, coupon, wrapper, shopping bag, store
- food > fruit: apple, banana, orange, grape, strawberry, kiwi, mango, peach, pineapple, cherry
- travel > transportation: bus, subway, taxi, train, airplane, bicycle, motorcycle, boat, tram, cable car
- business > meeting: conference room, presentation, discussion, agenda, decision, agreement, report, negotiation, contract

Respond in the following JSON format:

{
  "concept_info": {
    "domain": "appropriate_domain",
    "category": "appropriate_category",
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
      "pronunciation": "pronunciation notation (IPA or local notation)",
      "definition": "concise and clear definition (within one sentence)",
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
    ${languages
      .map((lang) => `"${lang}": "${lang} 순수 예문 (발음 기호 없이)"`)
      .join(",")}
  }
}

Please provide accurate words and translations that are actually usable. Fill all arrays with appropriate values. Make sure example sentences use the main word naturally and only use the target language. Important: Do not include pronunciation in word field or example sentences.`,
  },
};

// 공통 번역 유틸리티 import
// translation-utils.js 제거됨 - language-utils.js의 번역 시스템 사용

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
        synonyms: [],
        antonyms: [],
        word_family: ["水果", "食物"],
        compound_words: ["苹果树", "苹果汁"],
        collocations: ["红苹果", "新鲜苹果"],
      },
      japanese: {
        word: "りんご",
        pronunciation: "ringo",
        definition: "赤いまたは緑の丸い果物",
        part_of_speech: "名詞",
        level: "beginner",
        synonyms: [],
        antonyms: [],
        word_family: ["果物", "食べ物"],
        compound_words: ["りんごの木", "りんごジュース"],
        collocations: ["赤いりんご", "新鮮なりんご"],
      },
      spanish: {
        word: "manzana",
        pronunciation: "manˈθana",
        definition: "fruta redonda con piel roja o verde",
        part_of_speech: "sustantivo",
        level: "beginner",
        synonyms: ["fruta"],
        antonyms: [],
        word_family: ["fruta", "comida"],
        compound_words: ["manzano", "jugo de manzana"],
        collocations: ["manzana roja", "manzana fresca"],
      },
    },

    representative_example: {
      korean: "나는 매일 아침 사과를 먹는다.",
      english: "I eat an apple every morning.",
      chinese: "我每天早上吃苹果。",
      japanese: "私は毎朝りんごを食べます。",
      spanish: "Como una manzana cada mañana.",
    },

    examples: [
      {
        korean: "이 사과는 정말 달콤하다.",
        english: "This apple is really sweet.",
        chinese: "这个苹果真的很甜。",
        japanese: "このりんごは本当に甘いです。",
      },
    ],
  },
  {
    concept_info: {
      domain: "travel",
      category: "booking",
      difficulty: "intermediate",
      tags: ["travel", "transportation", "aviation"],
      unicode_emoji: "✈️",
      color_theme: "#4CAF50",
    },

    expressions: {
      korean: {
        word: "항공편",
        pronunciation: "hang-gong-pyeon",
        definition: "정기적으로 운항하는 비행기 노선",
        part_of_speech: "명사",
        level: "intermediate",
        synonyms: ["비행기", "항공기"],
        antonyms: [],
        word_family: ["항공", "여행", "교통"],
        compound_words: ["국제항공편", "국내항공편"],
        collocations: ["직항 항공편", "연결 항공편"],
      },
      english: {
        word: "flight",
        pronunciation: "/flaɪt/",
        definition: "a journey made by an aircraft",
        part_of_speech: "noun",
        level: "intermediate",
        synonyms: ["airplane journey", "air travel"],
        antonyms: [],
        word_family: ["aviation", "travel", "transportation"],
        compound_words: ["flight path", "flight time"],
        collocations: ["direct flight", "connecting flight"],
      },
      chinese: {
        word: "航班",
        pronunciation: "háng bān",
        definition: "定期运行的飞机航线",
        part_of_speech: "名词",
        level: "intermediate",
        synonyms: ["飞机", "航空"],
        antonyms: [],
        word_family: ["航空", "旅行", "交通"],
        compound_words: ["国际航班", "国内航班"],
        collocations: ["直飞航班", "转机航班"],
      },
      japanese: {
        word: "フライト",
        pronunciation: "furaito",
        definition: "定期運航する航空機の路線",
        part_of_speech: "名詞",
        level: "intermediate",
        synonyms: ["航空便", "便"],
        antonyms: [],
        word_family: ["航空", "旅行", "交通"],
        compound_words: ["国際便", "国内便"],
        collocations: ["直行便", "乗り継ぎ便"],
      },
      spanish: {
        word: "vuelo",
        pronunciation: "ˈbwelo",
        definition: "viaje realizado por una aeronave",
        part_of_speech: "sustantivo",
        level: "intermediate",
        synonyms: ["viaje aéreo", "trayecto"],
        antonyms: [],
        word_family: ["aviación", "viaje", "transporte"],
        compound_words: ["ruta de vuelo", "tiempo de vuelo"],
        collocations: ["vuelo directo", "vuelo de conexión"],
      },
    },

    representative_example: {
      korean: "내일 오전 항공편을 예약했습니다.",
      english: "I booked a morning flight for tomorrow.",
      chinese: "我预订了明天上午的航班。",
      japanese: "明日の朝のフライトを予約しました。",
      spanish: "Reservé un vuelo de mañana para mañana.",
    },

    examples: [
      {
        korean: "이 항공편은 직항입니다.",
        english: "This flight is direct.",
        chinese: "这个航班是直飞的。",
        japanese: "このフライトは直行便です。",
      },
    ],
  },
  {
    concept_info: {
      domain: "food",
      category: "fruit",
      difficulty: "beginner",
      tags: ["tropical", "healthy", "vitamin"],
      unicode_emoji: "🥭",
      color_theme: "#FF9800",
    },

    expressions: {
      korean: {
        word: "망고",
        pronunciation: "mang-go",
        definition: "열대 지방의 달콤한 과일",
        part_of_speech: "명사",
        level: "beginner",
        synonyms: [],
        antonyms: [],
        word_family: ["과일", "열대과일"],
        compound_words: ["망고주스", "망고푸딩"],
        collocations: ["달콤한 망고", "익은 망고"],
      },
      english: {
        word: "mango",
        pronunciation: "/ˈmæŋɡoʊ/",
        definition: "a sweet tropical fruit",
        part_of_speech: "noun",
        level: "beginner",
        synonyms: [],
        antonyms: [],
        word_family: ["fruit", "tropical fruit"],
        compound_words: ["mango juice", "mango pudding"],
        collocations: ["sweet mango", "ripe mango"],
      },
      chinese: {
        word: "芒果",
        pronunciation: "máng guǒ",
        definition: "甜美的热带水果",
        part_of_speech: "名词",
        level: "beginner",
        synonyms: [],
        antonyms: [],
        word_family: ["水果", "热带水果"],
        compound_words: ["芒果汁", "芒果布丁"],
        collocations: ["甜芒果", "熟芒果"],
      },
      japanese: {
        word: "マンゴー",
        pronunciation: "mangō",
        definition: "甘い熱帯の果物",
        part_of_speech: "名詞",
        level: "beginner",
        synonyms: [],
        antonyms: [],
        word_family: ["果物", "熱帯果物"],
        compound_words: ["マンゴージュース", "マンゴープリン"],
        collocations: ["甘いマンゴー", "熟したマンゴー"],
      },
    },

    representative_example: {
      korean: "이 망고는 정말 달콤하고 맛있어요.",
      english: "This mango is really sweet and delicious.",
      chinese: "这个芒果真的很甜很好吃。",
      japanese: "このマンゴーは本当に甘くて美味しいです。",
    },

    examples: [
      {
        korean: "망고 주스를 마시고 싶어요.",
        english: "I want to drink mango juice.",
        chinese: "我想喝芒果汁。",
        japanese: "マンゴージュースを飲みたいです。",
      },
    ],
  },
  {
    concept_info: {
      domain: "travel",
      category: "booking",
      difficulty: "intermediate",
      tags: ["restaurant", "dining", "food"],
      unicode_emoji: "🍽️",
      color_theme: "#E91E63",
    },

    expressions: {
      korean: {
        word: "레스토랑",
        pronunciation: "re-seu-to-rang",
        definition: "음식을 파는 식당",
        part_of_speech: "명사",
        level: "intermediate",
        synonyms: ["식당", "음식점"],
        antonyms: [],
        word_family: ["식사", "음식", "요리"],
        compound_words: ["패밀리레스토랑", "고급레스토랑"],
        collocations: ["이탈리안 레스토랑", "해산물 레스토랑"],
      },
      english: {
        word: "restaurant",
        pronunciation: "/ˈrɛstərənt/",
        definition: "a place where people pay to eat meals",
        part_of_speech: "noun",
        level: "intermediate",
        synonyms: ["eatery", "dining establishment"],
        antonyms: [],
        word_family: ["dining", "food", "cuisine"],
        compound_words: ["restaurant chain", "restaurant owner"],
        collocations: ["Italian restaurant", "seafood restaurant"],
      },
      chinese: {
        word: "餐厅",
        pronunciation: "cān tīng",
        definition: "提供餐食的场所",
        part_of_speech: "名词",
        level: "intermediate",
        synonyms: ["饭店", "餐馆"],
        antonyms: [],
        word_family: ["用餐", "食物", "烹饪"],
        compound_words: ["连锁餐厅", "高档餐厅"],
        collocations: ["意大利餐厅", "海鲜餐厅"],
      },
      japanese: {
        word: "レストラン",
        pronunciation: "resutoran",
        definition: "料理を提供する店",
        part_of_speech: "名詞",
        level: "intermediate",
        synonyms: ["飲食店", "食堂"],
        antonyms: [],
        word_family: ["食事", "料理", "グルメ"],
        compound_words: ["ファミリーレストラン", "高級レストラン"],
        collocations: ["イタリアンレストラン", "シーフードレストラン"],
      },
    },

    representative_example: {
      korean: "새로 오픈한 레스토랑에 가보고 싶어요.",
      english: "I want to try the newly opened restaurant.",
      chinese: "我想去新开的餐厅试试。",
      japanese: "新しくオープンしたレストランに行ってみたいです。",
    },

    examples: [
      {
        korean: "이 레스토랑의 파스타가 유명해요.",
        english: "This restaurant is famous for its pasta.",
        chinese: "这家餐厅的意大利面很有名。",
        japanese: "このレストランのパスタは有名です。",
      },
    ],
  },
  {
    concept_info: {
      domain: "daily",
      category: "furniture",
      difficulty: "beginner",
      tags: ["home", "living room", "comfort"],
      unicode_emoji: "🛋️",
      color_theme: "#795548",
    },

    expressions: {
      korean: {
        word: "소파",
        pronunciation: "so-pa",
        definition: "거실에 놓는 편안한 의자",
        part_of_speech: "명사",
        level: "beginner",
        synonyms: ["쇼파"],
        antonyms: [],
        word_family: ["가구", "의자"],
        compound_words: ["소파베드", "가죽소파"],
        collocations: ["편안한 소파", "큰 소파"],
      },
      english: {
        word: "sofa",
        pronunciation: "/ˈsoʊfə/",
        definition: "a comfortable seat for more than one person",
        part_of_speech: "noun",
        level: "beginner",
        synonyms: ["couch"],
        antonyms: [],
        word_family: ["furniture", "seat"],
        compound_words: ["sofa bed", "leather sofa"],
        collocations: ["comfortable sofa", "large sofa"],
      },
      chinese: {
        word: "沙发",
        pronunciation: "shā fā",
        definition: "供多人坐的舒适座椅",
        part_of_speech: "名词",
        level: "beginner",
        synonyms: ["长沙发"],
        antonyms: [],
        word_family: ["家具", "座椅"],
        compound_words: ["沙发床", "皮沙发"],
        collocations: ["舒适的沙发", "大沙发"],
      },
      japanese: {
        word: "ソファー",
        pronunciation: "sofā",
        definition: "複数人が座れる快適な椅子",
        part_of_speech: "名詞",
        level: "beginner",
        synonyms: ["ソファ"],
        antonyms: [],
        word_family: ["家具", "椅子"],
        compound_words: ["ソファーベッド", "レザーソファー"],
        collocations: ["快適なソファー", "大きなソファー"],
      },
    },

    representative_example: {
      korean: "새 소파를 거실에 놓았어요.",
      english: "I put a new sofa in the living room.",
      chinese: "我在客厅放了一个新沙发。",
      japanese: "新しいソファーをリビングに置きました。",
    },

    examples: [
      {
        korean: "이 소파는 정말 편안해요.",
        english: "This sofa is really comfortable.",
        chinese: "这个沙发真的很舒服。",
        japanese: "このソファーは本当に快適です。",
      },
    ],
  },
  {
    concept_info: {
      domain: "travel",
      category: "booking",
      difficulty: "intermediate",
      tags: ["tour", "sightseeing", "guide"],
      unicode_emoji: "🗺️",
      color_theme: "#2196F3",
    },

    expressions: {
      korean: {
        word: "투어예약",
        pronunciation: "tu-eo-ye-yak",
        definition: "관광 투어를 미리 예약하는 것",
        part_of_speech: "명사",
        level: "intermediate",
        synonyms: ["관광 예약", "여행 예약"],
        antonyms: ["예약 취소"],
        word_family: ["예약", "투어", "관광"],
        compound_words: ["투어예약시스템", "온라인투어예약"],
        collocations: ["투어예약 확인", "당일 투어예약"],
      },
      english: {
        word: "tour booking",
        pronunciation: "/tʊr ˈbʊkɪŋ/",
        definition: "reserving a guided tour in advance",
        part_of_speech: "noun",
        level: "intermediate",
        synonyms: ["tour reservation", "sightseeing booking"],
        antonyms: ["cancellation"],
        word_family: ["booking", "tour", "travel"],
        compound_words: ["tour booking system", "online tour booking"],
        collocations: ["tour booking confirmation", "day tour booking"],
      },
      chinese: {
        word: "旅游预订",
        pronunciation: "lǚ yóu yù dìng",
        definition: "提前预订导游旅游",
        part_of_speech: "名词",
        level: "intermediate",
        synonyms: ["观光预订", "旅行预订"],
        antonyms: ["取消预订"],
        word_family: ["预订", "旅游", "观光"],
        compound_words: ["旅游预订系统", "在线旅游预订"],
        collocations: ["旅游预订确认", "当日旅游预订"],
      },
      japanese: {
        word: "ツアー予約",
        pronunciation: "tsuā yoyaku",
        definition: "ガイド付きツアーを事前に予約すること",
        part_of_speech: "名詞",
        level: "intermediate",
        synonyms: ["観光予約", "旅行予約"],
        antonyms: ["予約キャンセル"],
        word_family: ["予約", "ツアー", "観光"],
        compound_words: ["ツアー予約システム", "オンラインツアー予約"],
        collocations: ["ツアー予約確認", "日帰りツアー予約"],
      },
    },

    representative_example: {
      korean: "내일 시티투어예약을 했습니다.",
      english: "I made a city tour booking for tomorrow.",
      chinese: "我预订了明天的城市旅游。",
      japanese: "明日のシティツアー予約をしました。",
    },

    examples: [
      {
        korean: "투어예약을 온라인으로 할 수 있나요?",
        english: "Can I make a tour booking online?",
        chinese: "我可以在线预订旅游吗？",
        japanese: "オンラインでツアー予約できますか？",
      },
    ],
  },
];

export async function handleAIConceptRecommendation(currentUser, db) {
  try {
    // 사용량 확인 (기존 users 컬렉션 사용)
    console.log("사용량 확인 중...");
    const usage = await conceptUtils.getUsage(currentUser.email);
    console.log("사용량 확인 완료:", usage);

    const aiUsed = usage.aiUsed || 0;
    const aiLimit = usage.aiLimit || 10; // getUsage에서 이미 maxAiUsage 값을 반환

    if (aiUsed >= aiLimit) {
      alert(
        "AI 사용 한도에 도달했습니다. 한도를 늘리거나 다음 달을 기다려주세요."
      );
      return;
    }

    // 사용자 입력을 위한 모달 생성
    const selectionResult = await showAIConceptSelectionModal();
    if (!selectionResult) {
      console.log("사용자가 선택을 취소했습니다.");
      return;
    }

    const { domain, category, languages: selectedLanguages } = selectionResult;
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

      // 로컬 환경에서도 제외 목록 조회
      const excludeWords = await getRecentlyGeneratedWords(
        currentUser.email,
        domain,
        category,
        10 // 최근 10개 단어 제외
      );

      // 로컬 환경에서는 테스트 데이터 사용
      await new Promise((resolve) => setTimeout(resolve, 2000)); // 2초 대기

      // 제외 목록을 고려한 테스트 데이터 선택
      let availableTestConcepts = TEST_CONCEPTS.filter((testConcept) => {
        if (excludeWords.length === 0) return true;

        // 테스트 개념의 모든 단어를 확인
        const testWords = Object.values(testConcept.expressions).map((expr) =>
          expr.word?.toLowerCase()
        );
        const hasExcludedWord = excludeWords.some((excludeWord) =>
          testWords.includes(excludeWord.toLowerCase())
        );

        return !hasExcludedWord;
      });

      // 사용 가능한 테스트 개념이 없으면 모든 개념 사용
      if (availableTestConcepts.length === 0) {
        console.log(
          "⚠️ 모든 테스트 개념이 제외 목록에 있습니다. 전체 목록 사용"
        );
        availableTestConcepts = TEST_CONCEPTS;
      }

      console.log(
        `🎲 사용 가능한 테스트 개념: ${availableTestConcepts.length}개`
      );
      conceptData =
        availableTestConcepts[
          Math.floor(Math.random() * availableTestConcepts.length)
        ];

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

      // 이전 생성 기록을 조회하여 제외 목록 생성
      const excludeWords = await getRecentlyGeneratedWords(
        currentUser.email,
        domain,
        category,
        15 // 최근 15개 단어 제외
      );

      conceptData = await generateConceptWithGemini(
        domain,
        category,
        selectedLanguages,
        excludeWords
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

    // AI가 생성한 도메인과 카테고리 사용 (더 정확한 매칭을 위해)
    console.log("🎯 AI가 생성한 도메인/카테고리 사용:", {
      aiDomain: conceptData.concept_info?.domain || conceptData.domain,
      aiCategory: conceptData.concept_info?.category || conceptData.category,
    });

    const transformedConceptData = {
      // 개념 기본 정보 (다국어 단어장과 완전히 동일)
      concept_info: {
        domain:
          conceptData.concept_info?.domain || conceptData.domain || "general", // AI가 생성한 도메인 사용
        category:
          conceptData.concept_info?.category || conceptData.category || "other", // AI가 생성한 카테고리 사용
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

      // 대표 예문 (다국어 단어장과 완전히 동일한 구조로 변환)
      representative_example: conceptData.representative_example || null,

      // 추가 예문들 (다국어 단어장과 완전히 동일한 구조)
      examples: conceptData.examples || [],

      // 생성 시간
      createdAt: serverTimestamp(),
    };

    console.log("🔧 변환된 개념 데이터:", transformedConceptData);
    console.log("🔧 최종 도메인/카테고리:", {
      domain: transformedConceptData.concept_info.domain,
      category: transformedConceptData.concept_info.category,
    });
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
    await conceptUtils.updateUsage(currentUser.email, { aiUsed: aiUsed + 1 });
    console.log("AI 사용량 업데이트 완료");

    alert("AI 개념이 성공적으로 추가되었습니다!");

    // 페이지 새로고침
    window.location.reload();
  } catch (error) {
    console.error("AI 개념 추천 중 오류:", error);
    console.error("오류 스택:", error.stack);

    // 권한 오류인 경우 특별한 처리
    if (
      error.code === "permission-denied" ||
      error.message.includes("Missing or insufficient permissions")
    ) {
      alert("권한이 없습니다. 로그인 상태를 확인하거나 관리자에게 문의하세요.");
    } else {
      alert("개념 생성 중 오류가 발생했습니다. 다시 시도해주세요.");
    }

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

// 이전 생성 기록을 조회하여 제외 목록 생성
async function getRecentlyGeneratedWords(
  userEmail,
  domain,
  category,
  limit = 10
) {
  try {
    console.log(
      `🔍 최근 생성된 단어 조회 중... (도메인: ${domain}, 카테고리: ${category})`
    );

    // ai-recommend 컬렉션에서 최근 생성된 개념들 조회
    const recentConcepts = await conceptUtils.getRecentAIConcepts(
      userEmail,
      domain,
      category,
      limit
    );

    const excludeWords = [];

    // 각 개념에서 주요 단어들 추출
    recentConcepts.forEach((concept) => {
      if (concept.expressions) {
        Object.values(concept.expressions).forEach((expression) => {
          if (expression.word) {
            excludeWords.push(expression.word);
          }
        });
      }
    });

    console.log(
      `🚫 제외할 단어 목록 (${excludeWords.length}개):`,
      excludeWords
    );
    return excludeWords;
  } catch (error) {
    console.error("최근 생성된 단어 조회 중 오류:", error);
    return []; // 오류 시 빈 배열 반환
  }
}

async function generateConceptWithGemini(
  domain,
  category,
  languages,
  excludeWords = []
) {
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
                prompt.user(domain, category, languages, excludeWords),
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.9, // 더 높은 창의성을 위해 증가
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      },
    };

    console.log("API 요청 데이터:", JSON.stringify(requestBody, null, 2));
    console.log("제외 단어 목록:", excludeWords);

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

    // 생성된 단어가 제외 목록에 있는지 확인
    const generatedWords = Object.values(conceptData.expressions).map((expr) =>
      expr.word?.toLowerCase()
    );
    const hasExcludedWord = excludeWords.some((excludeWord) =>
      generatedWords.includes(excludeWord.toLowerCase())
    );

    if (hasExcludedWord) {
      console.warn("⚠️ 제외 목록에 있는 단어가 생성되었습니다. 재시도합니다.");
      // 재시도 (최대 1회)
      return generateConceptWithGemini(
        domain,
        category,
        languages,
        excludeWords
      );
    }

    return conceptData;
  } catch (error) {
    console.error("Gemini API 호출 중 오류:", error);
    throw error;
  }
}

// AI 개념 선택 모달 함수
async function showAIConceptSelectionModal() {
  return new Promise((resolve) => {
    // 현재 언어 설정 가져오기
    const currentLang =
      localStorage.getItem("preferredLanguage") ||
      localStorage.getItem("userLanguage") ||
      "ko";

    // 도메인-카테고리 매핑 import (전역에서 사용 가능하다고 가정)
    const { domainCategoryMapping } = window;

    // 다국어 텍스트 매핑
    const modalTexts = {
      ko: {
        title: "AI 개념 추천 설정",
        step1: "1. 도메인 선택",
        step2: "2. 카테고리 선택",
        step3: "3. 학습 언어 선택 (최소 2개)",
        selectDomain: "도메인을 선택해주세요",
        selectCategory: "카테고리를 선택해주세요",
        selectDomainFirst: "먼저 도메인을 선택해주세요",
        cancel: "취소",
        generate: "AI 개념 생성하기",
        minLanguages: "최소 2개 언어를 선택해주세요",
        languages: {
          korean: "한국어",
          english: "영어",
          chinese: "중국어",
          japanese: "일본어",
          spanish: "스페인어",
        },
      },
      en: {
        title: "AI Concept Recommendation Settings",
        step1: "1. Select Domain",
        step2: "2. Select Category",
        step3: "3. Select Learning Languages (minimum 2)",
        selectDomain: "Please select a domain",
        selectCategory: "Please select a category",
        selectDomainFirst: "Please select a domain first",
        cancel: "Cancel",
        generate: "Generate AI Concept",
        minLanguages: "Please select at least 2 languages",
        languages: {
          korean: "Korean",
          english: "English",
          chinese: "Chinese",
          japanese: "Japanese",
          spanish: "Spanish",
        },
      },
      ja: {
        title: "AI概念推薦設定",
        step1: "1. ドメイン選択",
        step2: "2. カテゴリー選択",
        step3: "3. 学習言語選択（最低2つ）",
        selectDomain: "ドメインを選択してください",
        selectCategory: "カテゴリーを選択してください",
        selectDomainFirst: "まずドメインを選択してください",
        cancel: "キャンセル",
        generate: "AI概念生成",
        minLanguages: "最低2つの言語を選択してください",
        languages: {
          korean: "韓国語",
          english: "英語",
          chinese: "中国語",
          japanese: "日本語",
          spanish: "スペイン語",
        },
      },
      zh: {
        title: "AI概念推荐设置",
        step1: "1. 选择领域",
        step2: "2. 选择分类",
        step3: "3. 选择学习语言（至少2种）",
        selectDomain: "请选择领域",
        selectCategory: "请选择分类",
        selectDomainFirst: "请先选择领域",
        cancel: "取消",
        generate: "生成AI概念",
        minLanguages: "请至少选择2种语言",
        languages: {
          korean: "韩语",
          english: "英语",
          chinese: "中文",
          japanese: "日语",
          spanish: "西班牙语",
        },
      },
      es: {
        title: "Configuración de Recomendación de Conceptos AI",
        step1: "1. Seleccionar Dominio",
        step2: "2. Seleccionar Categoría",
        step3: "3. Seleccionar Idiomas de Aprendizaje (mínimo 2)",
        selectDomain: "Por favor seleccione un dominio",
        selectCategory: "Por favor seleccione una categoría",
        selectDomainFirst: "Por favor seleccione un dominio primero",
        cancel: "Cancelar",
        generate: "Generar Concepto AI",
        minLanguages: "Por favor seleccione al menos 2 idiomas",
        languages: {
          korean: "Coreano",
          english: "Inglés",
          chinese: "Chino",
          japanese: "Japonés",
          spanish: "Español",
        },
      },
    };

    const texts = modalTexts[currentLang] || modalTexts.ko;

    // 도메인 번역 매핑
    const domainTranslations = {
      daily: {
        ko: "일상생활",
        en: "Daily Life",
        ja: "日常生活",
        zh: "日常生活",
        es: "Vida Diaria",
      },
      food: {
        ko: "음식",
        en: "Food",
        ja: "食べ物",
        zh: "食物",
        es: "Comida",
      },
      travel: { ko: "여행", en: "Travel", ja: "旅行", zh: "旅行", es: "Viaje" },
      business: {
        ko: "비즈니스",
        en: "Business",
        ja: "ビジネス",
        zh: "商务",
        es: "Negocios",
      },
      education: {
        ko: "교육",
        en: "Education",
        ja: "教育",
        zh: "教育",
        es: "Educación",
      },
      nature: {
        ko: "자연",
        en: "Nature",
        ja: "自然",
        zh: "自然",
        es: "Naturaleza",
      },
      technology: {
        ko: "기술",
        en: "Technology",
        ja: "技術",
        zh: "技术",
        es: "Tecnología",
      },
      health: {
        ko: "건강",
        en: "Health",
        ja: "健康",
        zh: "健康",
        es: "Salud",
      },
      sports: {
        ko: "스포츠",
        en: "Sports",
        ja: "スポーツ",
        zh: "体育",
        es: "Deportes",
      },
      entertainment: {
        ko: "엔터테인먼트",
        en: "Entertainment",
        ja: "エンターテインメント",
        zh: "娱乐",
        es: "Entretenimiento",
      },
      culture: {
        ko: "문화",
        en: "Culture",
        ja: "文化",
        zh: "文化",
        es: "Cultura",
      },
      other: { ko: "기타", en: "Other", ja: "その他", zh: "其他", es: "Otros" },
    };

    // 모달 HTML 생성
    const modalHTML = `
      <div id="ai-concept-selection-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div class="p-6">
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-2xl font-bold text-gray-800">${texts.title}</h2>
              <button id="close-ai-modal" class="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
            </div>
            
            <!-- 도메인 선택 -->
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-2">${
                texts.step1
              }</label>
              <select id="ai-domain-select" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="">${texts.selectDomain}</option>
                <option value="daily">${getDomainTranslation(
                  "daily",
                  currentLang
                )}</option>
                <option value="food">${getDomainTranslation(
                  "food",
                  currentLang
                )}</option>
                <option value="travel">${getDomainTranslation(
                  "travel",
                  currentLang
                )}</option>
                <option value="business">${getDomainTranslation(
                  "business",
                  currentLang
                )}</option>
                <option value="education">${getDomainTranslation(
                  "education",
                  currentLang
                )}</option>
                <option value="nature">${getDomainTranslation(
                  "nature",
                  currentLang
                )}</option>
                <option value="technology">${getDomainTranslation(
                  "technology",
                  currentLang
                )}</option>
                <option value="health">${getDomainTranslation(
                  "health",
                  currentLang
                )}</option>
                <option value="sports">${getDomainTranslation(
                  "sports",
                  currentLang
                )}</option>
                <option value="entertainment">${getDomainTranslation(
                  "entertainment",
                  currentLang
                )}</option>
                <option value="culture">${getDomainTranslation(
                  "culture",
                  currentLang
                )}</option>
                <option value="other">${getDomainTranslation(
                  "other",
                  currentLang
                )}</option>
              </select>
            </div>
            
            <!-- 카테고리 선택 -->
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-2">${
                texts.step2
              }</label>
              <select id="ai-category-select" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" disabled>
                <option value="">${texts.selectDomainFirst}</option>
              </select>
            </div>
            
            <!-- 언어 선택 -->
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-2">${
                texts.step3
              }</label>
              <div class="grid grid-cols-2 gap-3">
                <label class="flex items-center space-x-2 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input type="checkbox" id="lang-korean" value="korean" class="form-checkbox">
                  <span>${texts.languages.korean}</span>
                </label>
                <label class="flex items-center space-x-2 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input type="checkbox" id="lang-english" value="english" class="form-checkbox">
                  <span>${texts.languages.english}</span>
                </label>
                <label class="flex items-center space-x-2 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input type="checkbox" id="lang-chinese" value="chinese" class="form-checkbox">
                  <span>${texts.languages.chinese}</span>
                </label>
                <label class="flex items-center space-x-2 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input type="checkbox" id="lang-japanese" value="japanese" class="form-checkbox">
                  <span>${texts.languages.japanese}</span>
                </label>
                <label class="flex items-center space-x-2 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input type="checkbox" id="lang-spanish" value="spanish" class="form-checkbox">
                  <span>${texts.languages.spanish}</span>
                </label>
              </div>
            </div>
            
            <!-- 버튼 -->
            <div class="flex justify-end space-x-3">
              <button id="cancel-ai-selection" class="px-6 py-2 text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300 transition duration-200">
                ${texts.cancel}
              </button>
              <button id="confirm-ai-selection" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200" disabled>
                ${texts.generate}
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    // 모달을 DOM에 추가
    document.body.insertAdjacentHTML("beforeend", modalHTML);

    const modal = document.getElementById("ai-concept-selection-modal");
    const domainSelect = document.getElementById("ai-domain-select");
    const categorySelect = document.getElementById("ai-category-select");
    const confirmButton = document.getElementById("confirm-ai-selection");
    const cancelButton = document.getElementById("cancel-ai-selection");
    const closeButton = document.getElementById("close-ai-modal");

    // 카테고리 매핑 (도메인-카테고리 매핑이 없을 경우 기본값)
    const defaultCategoryMapping = {
      daily: [
        "household",
        "family",
        "routine",
        "clothing",
        "furniture",
        "shopping",
        "communication",
        "personal_care",
        "leisure",
        "relationships",
        "emotions",
        "time",
        "weather_talk",
        "other",
      ],
      food: [
        "fruit",
        "vegetable",
        "meat",
        "drink",
        "snack",
        "grain",
        "seafood",
        "dairy",
        "cooking",
        "dining",
        "restaurant",
        "kitchen_utensils",
        "spices",
        "dessert",
        "other",
      ],
      travel: [
        "transportation",
        "accommodation",
        "tourist_attraction",
        "luggage",
        "direction",
        "booking",
        "currency",
        "emergency",
        "documents",
        "sightseeing",
        "local_food",
        "souvenir",
        "other",
      ],
      business: [
        "meeting",
        "finance",
        "marketing",
        "office",
        "project",
        "negotiation",
        "presentation",
        "teamwork",
        "leadership",
        "networking",
        "sales",
        "contract",
        "startup",
        "other",
      ],
      education: [
        "teaching",
        "learning",
        "classroom",
        "curriculum",
        "assessment",
        "pedagogy",
        "skill_development",
        "online_learning",
        "training",
        "certification",
        "educational_technology",
        "student_life",
        "graduation",
        "examination",
        "university",
        "library",
        "other",
      ],
      nature: [
        "animal",
        "plant",
        "weather",
        "geography",
        "environment",
        "ecosystem",
        "conservation",
        "climate",
        "natural_disaster",
        "landscape",
        "marine_life",
        "forest",
        "mountain",
        "other",
      ],
      technology: [
        "computer",
        "software",
        "internet",
        "mobile",
        "ai",
        "programming",
        "cybersecurity",
        "database",
        "robotics",
        "blockchain",
        "cloud",
        "social_media",
        "gaming",
        "innovation",
        "other",
      ],
      health: [
        "exercise",
        "medicine",
        "nutrition",
        "mental_health",
        "hospital",
        "fitness",
        "wellness",
        "therapy",
        "prevention",
        "symptoms",
        "treatment",
        "pharmacy",
        "rehabilitation",
        "medical_equipment",
        "other",
      ],
      sports: [
        "football",
        "basketball",
        "swimming",
        "running",
        "equipment",
        "olympics",
        "tennis",
        "baseball",
        "golf",
        "martial_arts",
        "team_sports",
        "individual_sports",
        "coaching",
        "competition",
        "other",
      ],
      entertainment: [
        "movie",
        "music",
        "game",
        "book",
        "art",
        "theater",
        "concert",
        "festival",
        "celebrity",
        "tv_show",
        "comedy",
        "drama",
        "animation",
        "photography",
        "other",
      ],
      culture: [
        "tradition",
        "customs",
        "language",
        "religion",
        "heritage",
        "ceremony",
        "ritual",
        "folklore",
        "mythology",
        "arts_crafts",
        "etiquette",
        "national_identity",
        "other",
      ],
      other: [
        "hobbies",
        "finance_personal",
        "legal",
        "government",
        "politics",
        "media",
        "community",
        "volunteering",
        "charity",
        "social_issues",
        "philosophy_life",
        "spirituality",
        "creativity",
        "innovation",
        "science",
        "literature",
        "history",
        "mathematics",
        "research",
        "philosophy",
        "psychology",
        "sociology",
        "linguistics",
        "thesis",
        "other",
      ],
    };

    const categoryMapping = domainCategoryMapping || defaultCategoryMapping;

    // 카테고리 번역 매핑 (다국어)
    const categoryTranslations = {
      // Daily
      household: {
        ko: "가정용품",
        en: "Household",
        ja: "家庭用品",
        zh: "家庭用品",
      },
      family: { ko: "가족", en: "Family", ja: "家族", zh: "家庭" },
      routine: {
        ko: "일상 루틴",
        en: "Routine",
        ja: "日常ルーチン",
        zh: "日常例行",
      },
      clothing: { ko: "의류", en: "Clothing", ja: "衣類", zh: "服装" },
      furniture: { ko: "가구", en: "Furniture", ja: "家具", zh: "家具" },
      shopping: { ko: "쇼핑", en: "Shopping", ja: "ショッピング", zh: "购物" },
      communication: {
        ko: "의사소통",
        en: "Communication",
        ja: "コミュニケーション",
        zh: "交流",
      },
      personal_care: {
        ko: "개인관리",
        en: "Personal Care",
        ja: "個人ケア",
        zh: "个人护理",
      },
      leisure: { ko: "여가", en: "Leisure", ja: "レジャー", zh: "休闲" },
      relationships: {
        ko: "인간관계",
        en: "Relationships",
        ja: "人間関係",
        zh: "人际关系",
      },
      emotions: { ko: "감정", en: "Emotions", ja: "感情", zh: "情感" },
      time: { ko: "시간", en: "Time", ja: "時間", zh: "时间" },
      weather_talk: {
        ko: "날씨 대화",
        en: "Weather Talk",
        ja: "天気の話",
        zh: "天气谈话",
      },

      // Food
      fruit: { ko: "과일", en: "Fruit", ja: "果物", zh: "水果" },
      vegetable: { ko: "채소", en: "Vegetable", ja: "野菜", zh: "蔬菜" },
      meat: { ko: "고기", en: "Meat", ja: "肉", zh: "肉类" },
      drink: { ko: "음료", en: "Drink", ja: "飲み物", zh: "饮料" },
      snack: { ko: "간식", en: "Snack", ja: "スナック", zh: "零食" },
      grain: { ko: "곡물", en: "Grain", ja: "穀物", zh: "谷物" },
      seafood: { ko: "해산물", en: "Seafood", ja: "海産物", zh: "海鲜" },
      dairy: { ko: "유제품", en: "Dairy", ja: "乳製品", zh: "乳制品" },
      cooking: { ko: "요리", en: "Cooking", ja: "料理", zh: "烹饪" },
      dining: { ko: "식사", en: "Dining", ja: "食事", zh: "用餐" },
      restaurant: {
        ko: "음식점",
        en: "Restaurant",
        ja: "レストラン",
        zh: "餐厅",
      },
      kitchen_utensils: {
        ko: "주방용품",
        en: "Kitchen Utensils",
        ja: "キッチン用具",
        zh: "厨房用具",
      },
      spices: { ko: "향신료", en: "Spices", ja: "スパイス", zh: "香料" },
      dessert: { ko: "디저트", en: "Dessert", ja: "デザート", zh: "甜点" },

      // Travel
      transportation: {
        ko: "교통",
        en: "Transportation",
        ja: "交通",
        zh: "交通",
      },
      accommodation: {
        ko: "숙박",
        en: "Accommodation",
        ja: "宿泊",
        zh: "住宿",
      },
      tourist_attraction: {
        ko: "관광지",
        en: "Tourist Attraction",
        ja: "観光地",
        zh: "旅游景点",
      },
      luggage: { ko: "짐", en: "Luggage", ja: "荷物", zh: "行李" },
      direction: { ko: "길찾기", en: "Direction", ja: "道案内", zh: "方向" },
      booking: { ko: "예약", en: "Booking", ja: "予約", zh: "预订" },
      currency: { ko: "화폐", en: "Currency", ja: "通貨", zh: "货币" },
      emergency: {
        ko: "응급상황",
        en: "Emergency",
        ja: "緊急事態",
        zh: "紧急情况",
      },
      documents: { ko: "서류", en: "Documents", ja: "書類", zh: "文件" },
      sightseeing: { ko: "관광", en: "Sightseeing", ja: "観光", zh: "观光" },
      local_food: {
        ko: "현지음식",
        en: "Local Food",
        ja: "現地料理",
        zh: "当地美食",
      },
      souvenir: { ko: "기념품", en: "Souvenir", ja: "お土産", zh: "纪念品" },

      // Business
      meeting: { ko: "회의", en: "Meeting", ja: "会議", zh: "会议" },
      finance: { ko: "금융", en: "Finance", ja: "金融", zh: "金融" },
      marketing: {
        ko: "마케팅",
        en: "Marketing",
        ja: "マーケティング",
        zh: "营销",
      },
      office: { ko: "사무실", en: "Office", ja: "オフィス", zh: "办公室" },
      project: {
        ko: "프로젝트",
        en: "Project",
        ja: "プロジェクト",
        zh: "项目",
      },
      negotiation: { ko: "협상", en: "Negotiation", ja: "交渉", zh: "谈判" },
      presentation: {
        ko: "발표",
        en: "Presentation",
        ja: "プレゼンテーション",
        zh: "演示",
      },
      teamwork: {
        ko: "팀워크",
        en: "Teamwork",
        ja: "チームワーク",
        zh: "团队合作",
      },
      leadership: {
        ko: "리더십",
        en: "Leadership",
        ja: "リーダーシップ",
        zh: "领导力",
      },
      networking: {
        ko: "네트워킹",
        en: "Networking",
        ja: "ネットワーキング",
        zh: "人际网络",
      },
      sales: { ko: "영업", en: "Sales", ja: "営業", zh: "销售" },
      contract: { ko: "계약", en: "Contract", ja: "契約", zh: "合同" },
      startup: {
        ko: "스타트업",
        en: "Startup",
        ja: "スタートアップ",
        zh: "初创企业",
      },

      // Education
      teaching: { ko: "교수법", en: "Teaching", ja: "教授法", zh: "教学" },
      learning: { ko: "학습", en: "Learning", ja: "学習", zh: "学习" },
      classroom: { ko: "교실", en: "Classroom", ja: "教室", zh: "教室" },
      curriculum: {
        ko: "교육과정",
        en: "Curriculum",
        ja: "カリキュラム",
        zh: "课程",
      },
      assessment: { ko: "평가", en: "Assessment", ja: "評価", zh: "评估" },
      pedagogy: { ko: "교육학", en: "Pedagogy", ja: "教育学", zh: "教育学" },
      skill_development: {
        ko: "기술개발",
        en: "Skill Development",
        ja: "スキル開発",
        zh: "技能发展",
      },
      online_learning: {
        ko: "온라인학습",
        en: "Online Learning",
        ja: "オンライン学習",
        zh: "在线学习",
      },
      training: { ko: "훈련", en: "Training", ja: "トレーニング", zh: "培训" },
      certification: {
        ko: "자격증",
        en: "Certification",
        ja: "資格",
        zh: "认证",
      },
      educational_technology: {
        ko: "교육기술",
        en: "Educational Technology",
        ja: "教育技術",
        zh: "教育技术",
      },
      student_life: {
        ko: "학생생활",
        en: "Student Life",
        ja: "学生生活",
        zh: "学生生活",
      },
      graduation: { ko: "졸업", en: "Graduation", ja: "卒業", zh: "毕业" },
      examination: { ko: "시험", en: "Examination", ja: "試験", zh: "考试" },
      university: { ko: "대학교", en: "University", ja: "大学", zh: "大学" },
      library: { ko: "도서관", en: "Library", ja: "図書館", zh: "图书馆" },

      // Nature
      animal: { ko: "동물", en: "Animal", ja: "動物", zh: "动物" },
      plant: { ko: "식물", en: "Plant", ja: "植物", zh: "植物" },
      weather: { ko: "날씨", en: "Weather", ja: "天気", zh: "天气" },
      geography: { ko: "지리", en: "Geography", ja: "地理", zh: "地理" },
      environment: { ko: "환경", en: "Environment", ja: "環境", zh: "环境" },
      ecosystem: {
        ko: "생태계",
        en: "Ecosystem",
        ja: "生態系",
        zh: "生态系统",
      },
      conservation: { ko: "보존", en: "Conservation", ja: "保全", zh: "保护" },
      climate: { ko: "기후", en: "Climate", ja: "気候", zh: "气候" },
      natural_disaster: {
        ko: "자연재해",
        en: "Natural Disaster",
        ja: "自然災害",
        zh: "自然灾害",
      },
      landscape: { ko: "풍경", en: "Landscape", ja: "風景", zh: "风景" },
      marine_life: {
        ko: "해양생물",
        en: "Marine Life",
        ja: "海洋生物",
        zh: "海洋生物",
      },
      forest: { ko: "숲", en: "Forest", ja: "森", zh: "森林" },
      mountain: { ko: "산", en: "Mountain", ja: "山", zh: "山" },

      // Technology
      computer: {
        ko: "컴퓨터",
        en: "Computer",
        ja: "コンピューター",
        zh: "计算机",
      },
      software: {
        ko: "소프트웨어",
        en: "Software",
        ja: "ソフトウェア",
        zh: "软件",
      },
      internet: {
        ko: "인터넷",
        en: "Internet",
        ja: "インターネット",
        zh: "互联网",
      },
      mobile: { ko: "모바일", en: "Mobile", ja: "モバイル", zh: "移动设备" },
      ai: { ko: "인공지능", en: "AI", ja: "AI", zh: "人工智能" },
      programming: {
        ko: "프로그래밍",
        en: "Programming",
        ja: "プログラミング",
        zh: "编程",
      },
      cybersecurity: {
        ko: "사이버보안",
        en: "Cybersecurity",
        ja: "サイバーセキュリティ",
        zh: "网络安全",
      },
      database: {
        ko: "데이터베이스",
        en: "Database",
        ja: "データベース",
        zh: "数据库",
      },
      robotics: {
        ko: "로봇공학",
        en: "Robotics",
        ja: "ロボット工学",
        zh: "机器人学",
      },
      blockchain: {
        ko: "블록체인",
        en: "Blockchain",
        ja: "ブロックチェーン",
        zh: "区块链",
      },
      cloud: { ko: "클라우드", en: "Cloud", ja: "クラウド", zh: "云计算" },
      social_media: {
        ko: "소셜미디어",
        en: "Social Media",
        ja: "ソーシャルメディア",
        zh: "社交媒体",
      },
      gaming: { ko: "게임", en: "Gaming", ja: "ゲーム", zh: "游戏" },
      innovation: {
        ko: "혁신",
        en: "Innovation",
        ja: "イノベーション",
        zh: "创新",
      },

      // Health
      exercise: { ko: "운동", en: "Exercise", ja: "運動", zh: "运动" },
      medicine: { ko: "의학", en: "Medicine", ja: "医学", zh: "医学" },
      nutrition: { ko: "영양", en: "Nutrition", ja: "栄養", zh: "营养" },
      mental_health: {
        ko: "정신건강",
        en: "Mental Health",
        ja: "メンタルヘルス",
        zh: "心理健康",
      },
      hospital: { ko: "병원", en: "Hospital", ja: "病院", zh: "医院" },
      fitness: {
        ko: "피트니스",
        en: "Fitness",
        ja: "フィットネス",
        zh: "健身",
      },
      wellness: { ko: "웰빙", en: "Wellness", ja: "ウェルネス", zh: "健康" },
      therapy: { ko: "치료", en: "Therapy", ja: "治療", zh: "治疗" },
      prevention: { ko: "예방", en: "Prevention", ja: "予防", zh: "预防" },
      symptoms: { ko: "증상", en: "Symptoms", ja: "症状", zh: "症状" },
      treatment: {
        ko: "치료법",
        en: "Treatment",
        ja: "治療法",
        zh: "治疗方法",
      },
      pharmacy: { ko: "약국", en: "Pharmacy", ja: "薬局", zh: "药房" },
      rehabilitation: {
        ko: "재활",
        en: "Rehabilitation",
        ja: "リハビリテーション",
        zh: "康复",
      },
      medical_equipment: {
        ko: "의료기기",
        en: "Medical Equipment",
        ja: "医療機器",
        zh: "医疗设备",
      },

      // Sports
      football: { ko: "축구", en: "Football", ja: "サッカー", zh: "足球" },
      basketball: {
        ko: "농구",
        en: "Basketball",
        ja: "バスケットボール",
        zh: "篮球",
      },
      swimming: { ko: "수영", en: "Swimming", ja: "水泳", zh: "游泳" },
      running: { ko: "달리기", en: "Running", ja: "ランニング", zh: "跑步" },
      equipment: { ko: "장비", en: "Equipment", ja: "機器", zh: "设备" },
      olympics: {
        ko: "올림픽",
        en: "Olympics",
        ja: "オリンピック",
        zh: "奥运会",
      },
      tennis: { ko: "테니스", en: "Tennis", ja: "テニス", zh: "网球" },
      baseball: { ko: "야구", en: "Baseball", ja: "野球", zh: "棒球" },
      golf: { ko: "골프", en: "Golf", ja: "ゴルフ", zh: "高尔夫" },
      martial_arts: { ko: "무술", en: "Martial Arts", ja: "武術", zh: "武术" },
      team_sports: {
        ko: "팀스포츠",
        en: "Team Sports",
        ja: "チームスポーツ",
        zh: "团队运动",
      },
      individual_sports: {
        ko: "개인스포츠",
        en: "Individual Sports",
        ja: "個人スポーツ",
        zh: "个人运动",
      },
      coaching: { ko: "코칭", en: "Coaching", ja: "コーチング", zh: "教练" },
      competition: { ko: "경쟁", en: "Competition", ja: "競争", zh: "竞争" },

      // Entertainment
      movie: { ko: "영화", en: "Movie", ja: "映画", zh: "电影" },
      music: { ko: "음악", en: "Music", ja: "音楽", zh: "音乐" },
      game: { ko: "게임", en: "Game", ja: "ゲーム", zh: "游戏" },
      book: { ko: "책", en: "Book", ja: "本", zh: "书籍" },
      art: { ko: "예술", en: "Art", ja: "芸術", zh: "艺术" },
      theater: { ko: "연극", en: "Theater", ja: "演劇", zh: "戏剧" },
      concert: { ko: "콘서트", en: "Concert", ja: "コンサート", zh: "音乐会" },
      festival: { ko: "축제", en: "Festival", ja: "祭り", zh: "节庆" },
      celebrity: { ko: "연예인", en: "Celebrity", ja: "有名人", zh: "名人" },
      tv_show: { ko: "TV쇼", en: "TV Show", ja: "テレビ番組", zh: "电视节目" },
      comedy: { ko: "코미디", en: "Comedy", ja: "コメディ", zh: "喜剧" },
      drama: { ko: "드라마", en: "Drama", ja: "ドラマ", zh: "戏剧" },
      animation: {
        ko: "애니메이션",
        en: "Animation",
        ja: "アニメーション",
        zh: "动画",
      },
      photography: { ko: "사진", en: "Photography", ja: "写真", zh: "摄影" },

      // Culture
      tradition: { ko: "전통", en: "Tradition", ja: "伝統", zh: "传统" },
      customs: { ko: "관습", en: "Customs", ja: "習慣", zh: "习俗" },
      language: { ko: "언어", en: "Language", ja: "言語", zh: "语言" },
      religion: { ko: "종교", en: "Religion", ja: "宗教", zh: "宗教" },
      heritage: { ko: "유산", en: "Heritage", ja: "遺産", zh: "遗产" },
      ceremony: { ko: "의식", en: "Ceremony", ja: "儀式", zh: "仪式" },
      ritual: { ko: "의례", en: "Ritual", ja: "儀礼", zh: "仪式" },
      folklore: { ko: "민속", en: "Folklore", ja: "民俗", zh: "民俗" },
      mythology: { ko: "신화", en: "Mythology", ja: "神話", zh: "神话" },
      arts_crafts: { ko: "공예", en: "Arts & Crafts", ja: "工芸", zh: "工艺" },
      etiquette: { ko: "예절", en: "Etiquette", ja: "エチケット", zh: "礼仪" },
      national_identity: {
        ko: "국가정체성",
        en: "National Identity",
        ja: "国民性",
        zh: "国家认同",
      },

      // Other
      hobbies: { ko: "취미", en: "Hobbies", ja: "趣味", zh: "爱好" },
      finance_personal: {
        ko: "개인금융",
        en: "Personal Finance",
        ja: "個人金融",
        zh: "个人理财",
      },
      legal: { ko: "법률", en: "Legal", ja: "法律", zh: "法律" },
      government: { ko: "정부", en: "Government", ja: "政府", zh: "政府" },
      politics: { ko: "정치", en: "Politics", ja: "政治", zh: "政治" },
      media: { ko: "미디어", en: "Media", ja: "メディア", zh: "媒体" },
      community: {
        ko: "커뮤니티",
        en: "Community",
        ja: "コミュニティ",
        zh: "社区",
      },
      volunteering: {
        ko: "자원봉사",
        en: "Volunteering",
        ja: "ボランティア",
        zh: "志愿服务",
      },
      charity: { ko: "자선", en: "Charity", ja: "慈善", zh: "慈善" },
      social_issues: {
        ko: "사회문제",
        en: "Social Issues",
        ja: "社会問題",
        zh: "社会问题",
      },
      philosophy_life: {
        ko: "인생철학",
        en: "Life Philosophy",
        ja: "人生哲学",
        zh: "人生哲学",
      },
      spirituality: {
        ko: "영성",
        en: "Spirituality",
        ja: "スピリチュアリティ",
        zh: "精神性",
      },
      creativity: {
        ko: "창의성",
        en: "Creativity",
        ja: "創造性",
        zh: "创造力",
      },
      science: { ko: "과학", en: "Science", ja: "科学", zh: "科学" },
      literature: { ko: "문학", en: "Literature", ja: "文学", zh: "文学" },
      history: { ko: "역사", en: "History", ja: "歴史", zh: "历史" },
      mathematics: { ko: "수학", en: "Mathematics", ja: "数学", zh: "数学" },
      research: { ko: "연구", en: "Research", ja: "研究", zh: "研究" },
      philosophy: { ko: "철학", en: "Philosophy", ja: "哲学", zh: "哲学" },
      psychology: {
        ko: "심리학",
        en: "Psychology",
        ja: "心理学",
        zh: "心理学",
      },
      sociology: { ko: "사회학", en: "Sociology", ja: "社会学", zh: "社会学" },
      linguistics: {
        ko: "언어학",
        en: "Linguistics",
        ja: "言語学",
        zh: "语言学",
      },
      thesis: { ko: "논문", en: "Thesis", ja: "論文", zh: "论文" },

      other: { ko: "기타", en: "Other", ja: "その他", zh: "其他" },
    };

    // 도메인 변경 시 카테고리 업데이트
    domainSelect.addEventListener("change", function () {
      const selectedDomain = this.value;
      categorySelect.innerHTML = `<option value="">${texts.selectCategory}</option>`;

      if (selectedDomain && categoryMapping[selectedDomain]) {
        categorySelect.disabled = false;
        categoryMapping[selectedDomain].forEach((category) => {
          const option = document.createElement("option");
          option.value = category;
          // 상위 스코프의 categoryTranslations 객체 사용
          option.textContent =
            categoryTranslations[category] &&
            categoryTranslations[category][currentLang]
              ? categoryTranslations[category][currentLang]
              : category;
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
        document.querySelectorAll('input[type="checkbox"]:checked')
      ).map((cb) => cb.value);

      const isValid = domain && category && selectedLanguages.length >= 2;
      confirmButton.disabled = !isValid;

      if (selectedLanguages.length < 2) {
        confirmButton.textContent = texts.minLanguages;
      } else {
        confirmButton.textContent = texts.generate;
      }
    }

    // 이벤트 리스너
    categorySelect.addEventListener("change", checkFormValidity);
    document.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
      cb.addEventListener("change", checkFormValidity);
    });

    // 모달 닫기
    function closeModal() {
      modal.remove();
      resolve(null);
    }

    closeButton.addEventListener("click", closeModal);
    cancelButton.addEventListener("click", closeModal);

    // 확인 버튼
    confirmButton.addEventListener("click", function () {
      const domain = domainSelect.value;
      const category = categorySelect.value;
      const languages = Array.from(
        document.querySelectorAll('input[type="checkbox"]:checked')
      ).map((cb) => cb.value);

      modal.remove();
      resolve({ domain, category, languages });
    });

    // 모달 외부 클릭 시 닫기
    modal.addEventListener("click", function (e) {
      if (e.target === modal) {
        closeModal();
      }
    });
  });
}

// 도메인 번역 헬퍼 함수
function getDomainTranslation(domain, lang) {
  const domainKey = `domain_${domain}`;
  if (window.getI18nText) {
    return window.getI18nText(domainKey, lang) || domain;
  }
  return domain;
}

// 카테고리 번역 헬퍼 함수 (상위 스코프의 categoryTranslations 사용)
function getCategoryTranslation(category, lang) {
  // 상위 스코프의 categoryTranslations 객체 참조
  if (categoryTranslations[category] && categoryTranslations[category][lang]) {
    return categoryTranslations[category][lang];
  }
  return category; // 번역이 없으면 원본 반환
}
