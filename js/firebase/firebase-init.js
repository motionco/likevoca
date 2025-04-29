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

// 전역으로 선언하여 초기화
let app = initializeApp(defaultConfig);
let auth = getAuth(app);
let db = getFirestore(app);

// Firebase 초기화 함수
async function initializeFirebase() {
  try {
    // 로컬 환경인지 확인 (localhost 또는 127.0.0.1)
    const isLocalEnvironment =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";

    let firebaseConfig = null;

    if (isLocalEnvironment) {
      console.log(
        "로컬 환경에서 실행 중입니다. 기본 Firebase 설정을 사용합니다."
      );
      // 로컬 개발 환경에서 사용할 기본 설정
      firebaseConfig = {
        apiKey: "AIzaSyCPQVYE7h7odTDCkoH6mrsEtT1giWk8yDM",
        authDomain: "uploadfile-e6f81.firebaseapp.com",
        projectId: "uploadfile-e6f81",
        storageBucket: "uploadfile-e6f81.appspot.com",
        messagingSenderId: "663760434128",
        appId: "1:663760434128:web:1ccbc92ab3e34670783fd5",
        databaseURL:
          "https://uploadfile-e6f81-default-rtdb.asia-southeast1.firebasedatabase.app",
      };
    } else {
      // 배포 환경에서는 API에서 설정 가져오기
      const response = await fetch("/api/config");
      if (!response.ok) {
        throw new Error("서버 응답 실패");
      }
      const data = await response.json();
      firebaseConfig = data.firebase;

      // 기존 앱 초기화 취소 후 새로운 설정으로 초기화
      app = initializeApp(firebaseConfig);
      auth = getAuth(app);
      db = getFirestore(app);
    }

    console.log("Firebase가 성공적으로 초기화되었습니다.");
  } catch (error) {
    console.error(
      "서버에서 Firebase 설정을 가져오지 못했습니다. 기본 설정을 사용합니다.",
      error
    );
    // 오류가 발생해도 이미 defaultConfig로 초기화가 되어 있으므로 추가 작업 필요없음
  }
}

// 페이지 로드 시 Firebase 초기화
initializeFirebase();

export { app, auth, db };
