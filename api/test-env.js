// ?κ²½λ³???μ€?Έλ? ?ν ?λ²λ¦¬μ€ ?¨μ
export default async (req, res) => {
  // CORS ?€λ ?€μ 
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  // OPTIONS ?μ²­ μ²λ¦¬
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // GET ?μ²­???λλ©?405 λ°ν
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    // ?κ²½λ³??μ²΄ν¬
    const geminiApiKey = process.env.GEMINI_API_KEY;
    const firebaseApiKey = process.env.FIREBASE_API_KEY;

    return res.status(200).json({
      gemini_api_key_exists: !!geminiApiKey,
      gemini_api_key_length: geminiApiKey ? geminiApiKey.length : 0,
      gemini_api_key_prefix: geminiApiKey
        ? geminiApiKey.substring(0, 10) + "..."
        : "?μ",
      firebase_api_key_exists: !!firebaseApiKey,
      firebase_api_key_length: firebaseApiKey ? firebaseApiKey.length : 0,
      firebase_api_key_prefix: firebaseApiKey
        ? firebaseApiKey.substring(0, 10) + "..."
        : "?μ",
      env_keys: Object.keys(process.env).filter(
        (key) =>
          key.includes("API") ||
          key.includes("FIREBASE") ||
          key.includes("GEMINI")
      ),
    });
  } catch (error) {
    console.error("?κ²½λ³???μ€???€λ₯:", error);
    return res.status(500).json({ error: "?λ² ?€λ₯κ° λ°μ?μ΅?λ€." });
  }
};
