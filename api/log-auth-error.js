// ?¸ì¦ ?¤ë¥˜ ë¡œê¹… ?œë²„ë¦¬ìŠ¤ ?¨ìˆ˜
export default (req, res) => {
  // CORS ?¤ë” ?¤ì •
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  // OPTIONS ?”ì²­ ì²˜ë¦¬
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // POST ?”ì²­???„ë‹ˆë©?405 ë°˜í™˜
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // ?”ì²­ ë³¸ë¬¸ ?•ì¸
  const { errorCode, errorMessage, provider, email } = req.body;

  // ?¤ë¥˜ ë¡œê¹…
  console.error(
    `?¸ì¦ ?¤ë¥˜ ë°œìƒ [${provider}] - ${errorCode}: ${errorMessage} ${
      email ? `(${email})` : ""
    }`
  );

  // ?±ê³µ ?‘ë‹µ ë°˜í™˜
  return res.status(200).json({ success: true });
};
