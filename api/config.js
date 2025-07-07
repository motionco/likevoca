// Firebase êµ¬ì„±???œê³µ?˜ëŠ” ?œë²„ë¦¬ìŠ¤ ?¨ìˆ˜
import dotenv from "dotenv";

// ?˜ê²½ ë³€??ë¡œë“œ
dotenv.config();

// Firebase ?¤ì • êµ¬ì„±
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

  // ?¤ì •??? íš¨?œì? ?•ì¸
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    console.error("Firebase ?¤ì •??? íš¨?˜ì? ?ŠìŠµ?ˆë‹¤:", firebaseConfig);
    return res.status(500).json({ error: "?œë²„ ?¤ì • ?¤ë¥˜" });
  }

  // Firebase ?¤ì • ë°˜í™˜
  return res.status(200).json({
    firebase: firebaseConfig,
  });
};
