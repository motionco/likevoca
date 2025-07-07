// Gemini API ?¸ì¶œ ?œë²„ë¦¬ìŠ¤ ?¨ìˆ˜
import fetch from "node-fetch";

export default async (req, res) => {
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

  try {
    const geminiApiKey = process.env.GEMINI_API_KEY;

    // API ?¤ê? ?¤ì •?˜ì–´ ?ˆëŠ”ì§€ ?•ì¸
    if (!geminiApiKey) {
      return res
        .status(500)
        .json({ error: "Gemini API ?¤ê? ?¤ì •?˜ì? ?Šì•˜?µë‹ˆ?? });
    }

    // Gemini API ?¸ì¶œ
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

    // ?‘ë‹µ ?¤ë¥˜ ?•ì¸
    if (!response.ok) {
      const errorData = await response.text();
      console.error("Gemini API ?¤ë¥˜ ?‘ë‹µ:", errorData);
      return res.status(response.status).json({
        error: "Gemini API ?¤ë¥˜",
        details: errorData,
      });
    }

    // ?‘ë‹µ ?°ì´??ë°˜í™˜
    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    // ?¤ë¥˜ ì²˜ë¦¬
    console.error("Gemini API ?¤ë¥˜:", error);
    return res.status(500).json({ error: "?œë²„ ?¤ë¥˜ê°€ ë°œìƒ?ˆìŠµ?ˆë‹¤." });
  }
};
