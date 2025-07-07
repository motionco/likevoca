// ?˜ê²½ë³€???ŒìŠ¤?¸ë? ?„í•œ ?œë²„ë¦¬ìŠ¤ ?¨ìˆ˜
export default async (req, res) => {
  // CORS ?¤ë” ?¤ì •
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  // OPTIONS ?”ì²­ ì²˜ë¦¬
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // GET ?”ì²­???„ë‹ˆë©?405 ë°˜í™˜
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    // ?˜ê²½ë³€??ì²´í¬
    const geminiApiKey = process.env.GEMINI_API_KEY;
    const firebaseApiKey = process.env.FIREBASE_API_KEY;

    return res.status(200).json({
      gemini_api_key_exists: !!geminiApiKey,
      gemini_api_key_length: geminiApiKey ? geminiApiKey.length : 0,
      gemini_api_key_prefix: geminiApiKey
        ? geminiApiKey.substring(0, 10) + "..."
        : "?†ìŒ",
      firebase_api_key_exists: !!firebaseApiKey,
      firebase_api_key_length: firebaseApiKey ? firebaseApiKey.length : 0,
      firebase_api_key_prefix: firebaseApiKey
        ? firebaseApiKey.substring(0, 10) + "..."
        : "?†ìŒ",
      env_keys: Object.keys(process.env).filter(
        (key) =>
          key.includes("API") ||
          key.includes("FIREBASE") ||
          key.includes("GEMINI")
      ),
    });
  } catch (error) {
    console.error("?˜ê²½ë³€???ŒìŠ¤???¤ë¥˜:", error);
    return res.status(500).json({ error: "?œë²„ ?¤ë¥˜ê°€ ë°œìƒ?ˆìŠµ?ˆë‹¤." });
  }
};
