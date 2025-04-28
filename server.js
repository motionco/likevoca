const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const fetch = require("node-fetch");

// 환경 변수 로드
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Firebase 설정을 더 확실하게 구성
const firebaseConfig = {
  apiKey:
    process.env.FIREBASE_API_KEY || "AIzaSyCPQVYE7h7odTDCkoH6mrsEtT1giWk8yDM",
  authDomain:
    process.env.FIREBASE_AUTH_DOMAIN || "uploadfile-e6f81.firebaseapp.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "uploadfile-e6f81",
  storageBucket:
    process.env.FIREBASE_STORAGE_BUCKET || "uploadfile-e6f81.appspot.com",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "663760434128",
  appId:
    process.env.FIREBASE_APP_ID || "1:663760434128:web:1ccbc92ab3e34670783fd5",
  databaseURL:
    process.env.FIREBASE_DATABASE_URL ||
    "https://uploadfile-e6f81-default-rtdb.asia-southeast1.firebasedatabase.app",
};

// 정적 파일 제공
app.use(express.static("./"));
app.use(express.json());

// Firebase API 키를 클라이언트에 안전하게 제공하는 엔드포인트
app.get("/api/config", (req, res) => {
  // 설정이 유효한지 확인
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    console.error("Firebase 설정이 유효하지 않습니다:", firebaseConfig);
    return res.status(500).json({ error: "서버 설정 오류" });
  }

  res.json({
    firebase: firebaseConfig,
  });
});

// Gemini API를 프록시하는 엔드포인트
app.post("/api/gemini", async (req, res) => {
  try {
    const geminiApiKey =
      process.env.GEMINI_API_KEY || "AIzaSyANCKVbESSNURgbIrFW-TkWTiY6d1oukuc";

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

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Gemini API 오류 응답:", errorData);
      return res.status(response.status).json({
        error: "Gemini API 오류",
        details: errorData,
      });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Gemini API 오류:", error);
    res.status(500).json({ error: "서버 오류가 발생했습니다." });
  }
});

// HTML 페이지 서빙을 위한 더 정교한 처리
app.get("*", (req, res) => {
  // 특정 파일 요청인지 확인
  const filePath = path.join(__dirname, req.path);
  const isHtmlRequest = req.path.endsWith(".html") || req.path === "/";

  // HTML 요청이면 index.html로 폴백
  if (isHtmlRequest) {
    return res.sendFile(
      path.join(__dirname, req.path === "/" ? "index.html" : req.path)
    );
  }

  // 다른 정적 파일 요청은 express.static 미들웨어에서 처리
  res.status(404).send("Not found");
});

app.listen(PORT, () => {
  console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
  console.log(
    "Firebase 설정:",
    firebaseConfig.projectId ? "유효함" : "유효하지 않음"
  );
});
