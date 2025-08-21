import { db, auth } from "../../js/firebase/firebase-init.js";
import { signup, googleLogin, githubLogin, facebookLogin } from "../../utils/firebase/firebase-auth.js";
import {
  doc,
  setDoc,
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";

// 언어별 페이지로 이동하는 함수
function goToLanguageSpecificPage(filename) {
  const userLanguage = localStorage.getItem("userLanguage") || "ko";
  const isDev =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.port === "5595";

  if (isDev) {
    window.location.href = `/locales/${userLanguage}/${filename}`;
  } else {
    window.location.href = `/${userLanguage}/${filename}`;
  }
}

const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirm-password");
const errorMessage = document.getElementById("error-message");
const submitButton = document.getElementById("signup-button");

const showError = (message) => {
  errorMessage.textContent = message;
  errorMessage.classList.remove("hidden");
};

const hideError = () => {
  errorMessage.textContent = "";
  errorMessage.classList.add("hidden");
};

// 소셜 로그인 버튼 이벤트 리스너들
document.getElementById("google-signup-btn")?.addEventListener("click", async () => {
  try {
    hideError();
    const user = await googleLogin();
    if (user) {
      const userName = user.displayName || "사용자";
      alert(`환영합니다, ${userName}님! Google 계정으로 회원가입이 완료되었습니다.`);
      goToLanguageSpecificPage("index.html");
    }
  } catch (error) {
    console.error("Google 회원가입 오류:", error);
    showError(error.message);
  }
});

document.getElementById("github-signup-btn")?.addEventListener("click", async () => {
  try {
    hideError();
    const user = await githubLogin();
    if (user) {
      const userName = user.displayName || "사용자";
      alert(`환영합니다, ${userName}님! GitHub 계정으로 회원가입이 완료되었습니다.`);
      goToLanguageSpecificPage("index.html");
    }
  } catch (error) {
    console.error("GitHub 회원가입 오류:", error);
    showError(error.message);
  }
});

document.getElementById("facebook-signup-btn")?.addEventListener("click", async () => {
  try {
    hideError();
    const user = await facebookLogin();
    if (user) {
      const userName = user.displayName || "사용자";
      alert(`환영합니다, ${userName}님! Facebook 계정으로 회원가입이 완료되었습니다.`);
      goToLanguageSpecificPage("index.html");
    }
  } catch (error) {
    console.error("Facebook 회원가입 오류:", error);
    showError(error.message);
  }
});

submitButton.addEventListener("click", async () => {
  hideError();

  const name = nameInput.value.trim();
  const email = emailInput.value.trim();
  const password = passwordInput.value;
  const confirmPassword = confirmPasswordInput.value;

  if (!name || !email || !password || !confirmPassword) {
    showError("모든 필드를 채워주세요.");
    return;
  }

  if (password !== confirmPassword) {
    showError("비밀번호가 일치하지 않습니다.");
    return;
  }

  try {
    isSignupInProgress = true;
    await signup(email, password, name);
    // signup 함수는 성공시 이메일 인증 에러를 던짐
  } catch (error) {
    if (error.isEmailVerification) {
      // 이메일 인증 안내 - 성공적인 회원가입
      alert(error.message);
      
      // 유저 문서 생성
      try {
        await setDoc(doc(db, "users", email), {
          wordCount: 0,
          aiUsage: 0,
          maxWordCount: 50,
          maxAiUsage: 10,
        });
      } catch (dbError) {
        console.error("사용자 문서 생성 실패:", dbError);
      }
      
      // 로그인 페이지로 리디렉션
      if (typeof window.redirectToLogin === "function") {
        window.redirectToLogin();
      } else {
        goToLanguageSpecificPage("login.html");
      }
    } else {
      // 실제 회원가입 실패
      console.error("회원가입 실패: ", error.message);
      showError(`회원가입 실패: ${error.message}`);
    }
  } finally {
    isSignupInProgress = false;
  }
});

// 회원가입 진행 중인지 추적하는 플래그
let isSignupInProgress = false;

// 로그인 상태 체크 - 이미 로그인되어 있으면 홈으로 리디렉션
onAuthStateChanged(auth, (user) => {
  if (user && !isSignupInProgress) {
    console.log("이미 로그인되어 있습니다. 홈으로 리디렉션합니다.");
    goToLanguageSpecificPage("index.html");
  }
});
