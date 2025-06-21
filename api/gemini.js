// Gemini API 호출 서버리스 함수
const fetch = require("node-fetch");

module.exports = async (req, res) => {
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
    return res.status(200).end();
  }

  // POST 요청이 아니면 405 반환
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    console.log("🔍 Gemini API 요청 시작");
    console.log("📝 요청 바디:", JSON.stringify(req.body, null, 2));

    const geminiApiKey = process.env.GEMINI_API_KEY;
    console.log("🔑 API 키 존재 여부:", !!geminiApiKey);

    // API 키가 설정되어 있는지 확인
    if (!geminiApiKey) {
      console.error("❌ GEMINI_API_KEY 환경 변수가 설정되지 않았습니다");
      console.log(
        "🔍 사용 가능한 환경 변수:",
        Object.keys(process.env).filter((key) => key.includes("API"))
      );
      return res.status(500).json({
        error: "Gemini API 키가 설정되지 않았습니다",
        details: "GEMINI_API_KEY 환경 변수를 Vercel 대시보드에서 설정해주세요",
      });
    }

    // Gemini API 호출
    console.log("🚀 Gemini API 호출 중...");
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": geminiApiKey,
        },
        body: JSON.stringify(req.body),
      }
    );

    console.log("📡 Gemini API 응답 상태:", response.status);

    // 응답 오류 확인
    if (!response.ok) {
      const errorData = await response.text();
      console.error("❌ Gemini API 오류 응답:", errorData);
      console.error("🔍 응답 헤더:", Object.fromEntries(response.headers));
      return res.status(response.status).json({
        error: "Gemini API 오류",
        details: errorData,
        status: response.status,
      });
    }

    // 응답 데이터 반환
    const data = await response.json();
    console.log("✅ Gemini API 성공적으로 완료");
    console.log("📊 응답 데이터 크기:", JSON.stringify(data).length);
    return res.status(200).json(data);
  } catch (error) {
    // 오류 처리
    console.error("💥 Gemini API 오류:", error);
    console.error("📍 오류 스택:", error.stack);
    return res.status(500).json({
      error: "서버 오류가 발생했습니다.",
      details: error.message,
      type: error.constructor.name,
    });
  }
};
