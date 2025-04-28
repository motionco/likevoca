import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

// 서버에서 설정 가져오기
let firebaseConfig = null;
let app, auth, db;

async function initializeFirebase() {
  try {
    const response = await fetch("/api/config");
    const config = await response.json();
    firebaseConfig = config.firebase;

    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);

    // Firebase 초기화 완료 이벤트 발생
    const event = new CustomEvent("firebase-initialized");
    window.dispatchEvent(event);
  } catch (error) {
    console.error("Firebase 초기화 오류:", error);
  }
}

// 페이지 로드 시 Firebase 초기화
initializeFirebase();

export { app, auth, db };
