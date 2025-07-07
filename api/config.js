// Firebase 구성???�공?�는 ?�버리스 ?�수
import dotenv from "dotenv";

// ?�경 변??로드
dotenv.config();

// Firebase ?�정 구성
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
  // CORS ?�더 ?�정
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  // OPTIONS ?�청 처리
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // GET ?�청???�니�?405 반환
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // ?�정???�효?��? ?�인
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    console.error("Firebase ?�정???�효?��? ?�습?�다:", firebaseConfig);
    return res.status(500).json({ error: "?�버 ?�정 ?�류" });
  }

  // Firebase ?�정 반환
  return res.status(200).json({
    firebase: firebaseConfig,
  });
};
