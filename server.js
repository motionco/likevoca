const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const fetch = require("node-fetch");

// 환경 변수 로드
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// 정적 파일 제공
app.use(express.static("./"));
app.use(express.json());

// Firebase API 키를 클라이언트에 안전하게 제공하는 엔드포인트
app.get("/api/config", (req, res) => {
  // 인증 로직이 필요하다면 여기에 추가
  res.json({
    firebase: {
      apiKey: process.env.FIREBASE_API_KEY,
      authDomain: process.env.FIREBASE_AUTH_DOMAIN,
      projectId: process.env.FIREBASE_PROJECT_ID,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.FIREBASE_APP_ID,
      databaseURL: process.env.FIREBASE_DATABASE_URL,
    },
  });
});

// Gemini API를 프록시하는 엔드포인트
app.post("/api/gemini", async (req, res) => {
  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GEMINI_API_KEY,
        },
        body: JSON.stringify(req.body),
      }
    );

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Gemini API 오류:", error);
    res.status(500).json({ error: "서버 오류가 발생했습니다." });
  }
});

// HTML 페이지 서빙
app.get("*", (req, res) => {
  // 요청된 경로가 존재하면 해당 파일 제공, 아니면 index.html로 폴백
  const requestedPage = path.join(__dirname, req.path);
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => {
  console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});
