// 카카오톡 공유를 위한 서버리스 함수
export default async (req, res) => {
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
    const kakaoJsKey = cae5858f71d624bf839cc0bba539a619;

    // API 키가 설정되어 있는지 확인
    if (!kakaoJsKey) {
      console.error("카카오 JavaScript 키가 설정되지 않았습니다.");
      return res
        .status(500)
        .json({ error: "카카오 JavaScript 키가 설정되지 않았습니다." });
    }

    console.log("카카오톡 공유 키 요청");

    // 요청한 도메인 검증 (보안을 위해)
    const allowedDomains = [
      'localhost',
      '127.0.0.1',
      'likevoca.com',
      'vercel.app'
    ];

    const origin = req.headers.origin || req.headers.referer;
    const isAllowedDomain = allowedDomains.some(domain => 
      origin && origin.includes(domain)
    );

    if (!isAllowedDomain) {
      console.error("허용되지 않은 도메인에서의 요청:", origin);
      return res.status(403).json({ error: "허용되지 않은 도메인입니다." });
    }

    // 카카오 JavaScript 키 반환 (서버에서만 접근 가능)
    return res.status(200).json({
      success: true,
      kakaoJsKey: kakaoJsKey
    });

  } catch (error) {
    // 오류 처리
    console.error("카카오톡 공유 API 서버 오류:", error);
    return res.status(500).json({ 
      error: "서버 오류가 발생했습니다.",
      details: error.message
    });
  }
};