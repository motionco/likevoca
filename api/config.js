// Firebase 구성을 제공하는 서버리스 함수
import dotenv from "dotenv";

// 환경 변수 로드
dotenv.config();

// Firebase 설정 구성
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: "uploadfile-e6f81.firebaseapp.com",
  projectId: "uploadfile-e6f81",
  storageBucket: "uploadfile-e6f81.appspot.com",
  messagingSenderId: "663760434128",
  appId: "1:663760434128:web:1ccbc92ab3e34670783fd5",
  databaseURL:
    "https://uploadfile-e6f81-default-rtdb.asia-southeast1.firebasedatabase.app",
};

export default (req, res) => {
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
    return res.status(200).end();
  }

  // GET 요청이 아니면 405 반환
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // 설정이 유효한지 확인
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    console.error("Firebase 설정이 유효하지 않습니다:", firebaseConfig);
    return res.status(500).json({ error: "서버 설정 오류" });
  }

  // Firebase 설정 반환
  return res.status(200).json({
    firebase: firebaseConfig,
  });
};
