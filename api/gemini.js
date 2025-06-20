// Gemini API 호출 서버리스 함수
const fetch = require("node-fetch");

module.exports = async (req, res) => {
  try {
    console.log("🔍 Gemini API 요청 시작");
    console.log("📊 요청 메소드:", req.method);
    console.log("📊 요청 URL:", req.url);

    // CORS 헤더 설정
    res.setHeader("Access-Control-Allow-Credentials", true);
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
    );

    // OPTIONS 요청 처리
    if (req.method === "OPTIONS") {
      console.log("✅ OPTIONS 요청 처리");
      return res.status(200).end();
    }

    // POST 요청이 아니면 405 반환
    if (req.method !== "POST") {
      console.log("❌ 잘못된 메소드:", req.method);
      return res.status(405).json({ error: "Method Not Allowed" });
    }

    console.log("📝 요청 바디 존재:", !!req.body);
    console.log("📝 요청 바디 타입:", typeof req.body);

    // 요청 바디가 너무 크지 않을 때만 로그 출력
    const bodyString = JSON.stringify(req.body);
    if (bodyString.length < 1000) {
      console.log("📝 요청 바디:", bodyString);
    } else {
      console.log("📝 요청 바디 크기:", bodyString.length, "bytes");
    }

    const geminiApiKey = process.env.GEMINI_API_KEY;
    console.log("🔑 API 키 존재 여부:", !!geminiApiKey);
    console.log("🔑 API 키 길이:", geminiApiKey ? geminiApiKey.length : 0);

    // API 키가 설정되어 있는지 확인
    if (!geminiApiKey) {
      console.error("❌ GEMINI_API_KEY 환경 변수가 설정되지 않았습니다");
      console.log(
        "🔍 사용 가능한 환경 변수:",
        Object.keys(process.env).filter(
          (key) => key.includes("API") || key.includes("GEMINI")
        )
      );

      // 개발/테스트 목적으로 임시 응답 제공
      console.log("🧪 테스트용 임시 응답 생성 중...");
      const testResponse = {
        candidates: [
          {
            content: {
              parts: [
                {
                  text: `{
  "concept_info": {
    "domain": "daily",
    "category": "household",
    "difficulty": "beginner",
    "tags": ["일상", "가정용품", "기본"],
    "unicode_emoji": "🏠",
    "color_theme": "#FF6B6B"
  },
  "expressions": {
    "korean": {
      "word": "집",
      "pronunciation": "jip",
      "definition": "사람이 살고 있는 건물",
      "part_of_speech": "명사",
      "level": "beginner",
      "synonyms": ["가정", "주택"],
      "antonyms": ["밖"],
      "word_family": ["가족", "가정"],
      "compound_words": ["집안", "집밖"],
      "collocations": ["우리 집", "새 집"]
    },
    "english": {
      "word": "house",
      "pronunciation": "/haʊs/",
      "definition": "a building for human habitation",
      "part_of_speech": "noun",
      "level": "beginner",
      "synonyms": ["home", "residence"],
      "antonyms": ["outside"],
      "word_family": ["household", "housing"],
      "compound_words": ["housework", "housekeeper"],
      "collocations": ["my house", "new house"]
    },
    "japanese": {
      "word": "家",
      "pronunciation": "ie",
      "definition": "人が住んでいる建物",
      "part_of_speech": "名詞",
      "level": "beginner",
      "synonyms": ["住宅", "家庭"],
      "antonyms": ["外"],
      "word_family": ["家族", "家庭"],
      "compound_words": ["家事", "家族"],
      "collocations": ["私の家", "新しい家"]
    },
    "chinese": {
      "word": "房子",
      "pronunciation": "fáng zi",
      "definition": "人居住的建筑物",
      "part_of_speech": "名词",
      "level": "beginner",
      "synonyms": ["住宅", "家"],
      "antonyms": ["外面"],
      "word_family": ["家庭", "住房"],
      "compound_words": ["房间", "房屋"],
      "collocations": ["我的房子", "新房子"]
    }
  },
  "representative_example": {
    "translations": {
      "korean": "우리 집은 매우 편안합니다.",
      "english": "Our house is very comfortable.",
      "japanese": "私たちの家はとても快適です。",
      "chinese": "我们的房子很舒适。"
    },
    "context": "daily_conversation",
    "difficulty": "beginner"
  }
}`,
                },
              ],
            },
          },
        ],
      };

      console.log("✅ 테스트 응답 반환 완료");
      return res.status(200).json(testResponse);
    }

    // Gemini API 호출
    console.log("🚀 Gemini API 호출 중...");
    const apiUrl =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
    console.log("📡 API URL:", apiUrl);

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": geminiApiKey,
      },
      body: JSON.stringify(req.body),
    });

    console.log("📡 Gemini API 응답 상태:", response.status);
    console.log("📡 Gemini API 응답 상태 텍스트:", response.statusText);

    // 응답 오류 확인
    if (!response.ok) {
      const errorData = await response.text();
      console.error("❌ Gemini API 오류 응답:", errorData);
      console.error("🔍 응답 헤더:", Object.fromEntries(response.headers));
      return res.status(response.status).json({
        error: "Gemini API 오류",
        details: errorData,
        status: response.status,
        statusText: response.statusText,
      });
    }

    // 응답 데이터 반환
    const data = await response.json();
    console.log("✅ Gemini API 성공적으로 완료");
    console.log("📊 응답 데이터 크기:", JSON.stringify(data).length);
    return res.status(200).json(data);
  } catch (error) {
    // 오류 처리
    console.error("💥 Gemini API 최상위 오류:", error);
    console.error("📍 오류 스택:", error.stack);
    console.error("📍 오류 이름:", error.name);
    console.error("📍 오류 메시지:", error.message);

    try {
      return res.status(500).json({
        error: "서버 오류가 발생했습니다.",
        details: error.message,
        type: error.constructor.name,
        timestamp: new Date().toISOString(),
      });
    } catch (jsonError) {
      console.error("💥 JSON 응답 오류:", jsonError);
      return res.status(500).end("Internal Server Error");
    }
  }
};
