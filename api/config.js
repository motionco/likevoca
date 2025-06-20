// Firebase 구성을 제공하는 서버리스 함수
const dotenv = require("dotenv");

// 환경 변수 로드
dotenv.config();

// 환경 변수 디버깅
console.log("🔍 Config API 호출 - 환경 변수 확인:");
console.log("📋 FIREBASE_API_KEY 존재:", !!process.env.FIREBASE_API_KEY);
console.log("📋 NODE_ENV:", process.env.NODE_ENV);
console.log("📋 VERCEL_ENV:", process.env.VERCEL_ENV);
console.log(
  "📋 모든 환경 변수 키:",
  Object.keys(process.env).filter((key) => key.includes("FIREBASE"))
);

// Firebase 설정 구성 (fallback 포함)
const firebaseConfig = {
  apiKey:
    process.env.FIREBASE_API_KEY || "AIzaSyCPQVYE7h7odTDCkoH6mrsEtT1giWk8yDM", // 로컬 환경과 동일한 fallback API key
  authDomain: "uploadfile-e6f81.firebaseapp.com",
  projectId: "uploadfile-e6f81",
  storageBucket: "uploadfile-e6f81.appspot.com",
  messagingSenderId: "663760434128",
  appId: "1:663760434128:web:1ccbc92ab3e34670783fd5",
  databaseURL:
    "https://uploadfile-e6f81-default-rtdb.asia-southeast1.firebasedatabase.app",
};

module.exports = (req, res) => {
  try {
    console.log("🚀 Config API 요청 수신");
    console.log("📊 요청 메소드:", req.method);
    console.log("📊 요청 URL:", req.url);

    // CORS 헤더 설정
    res.setHeader("Access-Control-Allow-Credentials", true);
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
    );

    // OPTIONS 요청 처리
    if (req.method === "OPTIONS") {
      console.log("✅ OPTIONS 요청 처리");
      return res.status(200).end();
    }

    // GET 요청이 아니면 405 반환
    if (req.method !== "GET") {
      console.log("❌ 잘못된 메소드:", req.method);
      return res.status(405).json({ error: "Method Not Allowed" });
    }

    console.log("📊 Firebase 설정 확인:");
    console.log("  - API Key 존재:", !!firebaseConfig.apiKey);
    console.log(
      "  - API Key 길이:",
      firebaseConfig.apiKey ? firebaseConfig.apiKey.length : 0
    );
    console.log("  - Project ID:", firebaseConfig.projectId);
    console.log("  - Auth Domain:", firebaseConfig.authDomain);

    // 설정이 유효한지 확인
    if (!firebaseConfig.projectId) {
      console.error("❌ Firebase 프로젝트 ID가 없습니다");
      return res.status(500).json({
        error: "서버 설정 오류",
        details: "Firebase 프로젝트 ID가 설정되지 않았습니다",
      });
    }

    // API 키가 없어도 기본 설정으로 계속 진행 (Vercel 환경에서는 클라이언트에서 직접 설정)
    if (!process.env.FIREBASE_API_KEY) {
      console.warn(
        "⚠️ FIREBASE_API_KEY 환경 변수가 설정되지 않았습니다. 클라이언트 fallback 사용"
      );
    }

    console.log("✅ Firebase 설정 반환 성공");

    // Firebase 설정 반환
    const response = {
      firebase: firebaseConfig,
      debug: {
        hasApiKey: !!process.env.FIREBASE_API_KEY,
        environment: process.env.NODE_ENV || "development",
        vercelEnv: process.env.VERCEL_ENV || "none",
        timestamp: new Date().toISOString(),
      },
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error("💥 Config API 최상위 오류:", error);
    console.error("📍 오류 스택:", error.stack);

    try {
      return res.status(500).json({
        error: "서버 내부 오류",
        details: error.message,
        timestamp: new Date().toISOString(),
      });
    } catch (jsonError) {
      console.error("💥 JSON 응답 오류:", jsonError);
      return res.status(500).end("Internal Server Error");
    }
  }
};
