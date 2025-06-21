// 환경변수 테스트를 위한 서버리스 함수
export default async (req, res) => {
  // CORS 헤더 설정
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  // OPTIONS 요청 처리
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // GET 요청이 아니면 405 반환
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    // 환경변수 체크
    const geminiApiKey = process.env.GEMINI_API_KEY;
    const firebaseApiKey = process.env.FIREBASE_API_KEY;

    return res.status(200).json({
      gemini_api_key_exists: !!geminiApiKey,
      gemini_api_key_length: geminiApiKey ? geminiApiKey.length : 0,
      gemini_api_key_prefix: geminiApiKey
        ? geminiApiKey.substring(0, 10) + "..."
        : "없음",
      firebase_api_key_exists: !!firebaseApiKey,
      firebase_api_key_length: firebaseApiKey ? firebaseApiKey.length : 0,
      firebase_api_key_prefix: firebaseApiKey
        ? firebaseApiKey.substring(0, 10) + "..."
        : "없음",
      env_keys: Object.keys(process.env).filter(
        (key) =>
          key.includes("API") ||
          key.includes("FIREBASE") ||
          key.includes("GEMINI")
      ),
    });
  } catch (error) {
    console.error("환경변수 테스트 오류:", error);
    return res.status(500).json({ error: "서버 오류가 발생했습니다." });
  }
};
