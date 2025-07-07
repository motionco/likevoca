// ?�증 ?�류 로깅 ?�버리스 ?�수
export default (req, res) => {
  // CORS ?�더 ?�정
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  // OPTIONS ?�청 처리
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // POST ?�청???�니�?405 반환
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // ?�청 본문 ?�인
  const { errorCode, errorMessage, provider, email } = req.body;

  // ?�류 로깅
  console.error(
    `?�증 ?�류 발생 [${provider}] - ${errorCode}: ${errorMessage} ${
      email ? `(${email})` : ""
    }`
  );

  // ?�공 ?�답 반환
  return res.status(200).json({ success: true });
};
