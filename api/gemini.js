// Gemini API ?ΈμΆ ?λ²λ¦¬μ€ ?¨μ
import fetch from "node-fetch";

export default async (req, res) => {
  // CORS ?€λ ?€μ 
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  // OPTIONS ?μ²­ μ²λ¦¬
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // POST ?μ²­???λλ©?405 λ°ν
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const geminiApiKey = process.env.GEMINI_API_KEY;

    // API ?€κ? ?€μ ?μ΄ ?λμ§ ?μΈ
    if (!geminiApiKey) {
      return res
        .status(500)
        .json({ error: "Gemini API ?€κ? ?€μ ?μ? ?μ?΅λ?? });
    }

    // Gemini API ?ΈμΆ
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

    // ?λ΅ ?€λ₯ ?μΈ
    if (!response.ok) {
      const errorData = await response.text();
      console.error("Gemini API ?€λ₯ ?λ΅:", errorData);
      return res.status(response.status).json({
        error: "Gemini API ?€λ₯",
        details: errorData,
      });
    }

    // ?λ΅ ?°μ΄??λ°ν
    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    // ?€λ₯ μ²λ¦¬
    console.error("Gemini API ?€λ₯:", error);
    return res.status(500).json({ error: "?λ² ?€λ₯κ° λ°μ?μ΅?λ€." });
  }
};
