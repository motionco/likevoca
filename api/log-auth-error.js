// 인증 오류 로깅 서버리스 함수
module.exports = (req, res) => {
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

  // 요청 본문 확인
  const { errorCode, errorMessage, provider, email } = req.body;

  // 오류 로깅
  console.error(
    `인증 오류 발생 [${provider}] - ${errorCode}: ${errorMessage} ${
      email ? `(${email})` : ""
    }`
  );

  // 성공 응답 반환
  return res.status(200).json({ success: true });
};
