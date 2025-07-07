// Gemini API ?�출 ?�버리스 ?�수
import fetch from "node-fetch";

export default async (req, res) => {
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

  try {
    const geminiApiKey = process.env.GEMINI_API_KEY;

    // API ?��? ?�정?�어 ?�는지 ?�인
    if (!geminiApiKey) {
      return res
        .status(500)
        .json({ error: "Gemini API ?��? ?�정?��? ?�았?�니?? });
    }

    // Gemini API ?�출
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

    // ?�답 ?�류 ?�인
    if (!response.ok) {
      const errorData = await response.text();
      console.error("Gemini API ?�류 ?�답:", errorData);
      return res.status(response.status).json({
        error: "Gemini API ?�류",
        details: errorData,
      });
    }

    // ?�답 ?�이??반환
    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    // ?�류 처리
    console.error("Gemini API ?�류:", error);
    return res.status(500).json({ error: "?�버 ?�류가 발생?�습?�다." });
  }
};
