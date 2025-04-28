import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

// 기본 Firebase 설정 (서버 요청 실패 시 폴백)
const defaultConfig = {
  apiKey: "AIzaSyCPQVYE7h7odTDCkoH6mrsEtT1giWk8yDM",
  authDomain: "uploadfile-e6f81.firebaseapp.com",
  databaseURL:
    "https://uploadfile-e6f81-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "uploadfile-e6f81",
  storageBucket: "uploadfile-e6f81.appspot.com",
  messagingSenderId: "663760434128",
  appId: "1:663760434128:web:1ccbc92ab3e34670783fd5",
};

// 전역으로 선언하여 초기화 전에도 정의되도록 함
const app = initializeApp(defaultConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function initializeFirebase() {
  try {
    // 서버에서 설정 가져오기 시도
    const response = await fetch("/api/config");

    // 응답이 성공적이지 않으면 기본 설정 유지
    if (!response.ok) {
      console.warn(
        "서버에서 Firebase 설정을 가져오지 못했습니다. 기본 설정을 사용합니다."
      );
      return;
    }

    const config = await response.json();

    // 유효한 설정이 없으면 기본 설정 유지
    if (!config || !config.firebase || !config.firebase.projectId) {
      console.warn("유효한 Firebase 설정이 없습니다. 기본 설정을 사용합니다.");
      return;
    }

    // 이미 초기화된 앱이 있는 경우 새로 초기화하지 않고 유지
    console.log("Firebase가 성공적으로 초기화되었습니다.");

    // Firebase 초기화 완료 이벤트 발생
    const event = new CustomEvent("firebase-initialized");
    window.dispatchEvent(event);
  } catch (error) {
    console.error("Firebase 초기화 오류:", error);
    console.warn("기본 Firebase 설정을 사용합니다.");
  }
}

// 페이지 로드 시 Firebase 초기화
initializeFirebase();

export { app, auth, db };
