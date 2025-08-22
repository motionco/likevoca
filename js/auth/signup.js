import { db, auth } from "../../js/firebase/firebase-init.js";
import { signup, googleLogin, githubLogin, facebookLogin } from "../../utils/firebase/firebase-auth.js";
import {
  doc,
  setDoc,
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";

// 현재 언어의 번역 가져오기
async function getTranslations() {
  const userLanguage = localStorage.getItem("userLanguage") || "ko";
  
  // 현재 경로 확인 및 올바른 경로 생성
  const currentPath = window.location.pathname;
  let basePath;
  
  if (currentPath.includes("/locales/")) {
    // locales 폴더 내부에 있는 경우 (/locales/ja/signup.html)
    basePath = "../../";
  } else {
    // 루트나 다른 폴더에 있는 경우
    basePath = "./";
  }
  
  try {
    const response = await fetch(`${basePath}locales/${userLanguage}/translations.json`);
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.error("번역 파일 로드 실패:", error);
  }
  
  // 기본값으로 한국어 번역 반환
  try {
    const response = await fetch(`${basePath}locales/ko/translations.json`);
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.error("기본 번역 파일 로드 실패:", error);
  }
  
  // 모든 시도가 실패하면 기본 메시지 반환
  return {
    fields_required: "모든 필드를 채워주세요.",
    passwords_do_not_match: "비밀번호가 일치하지 않습니다.",
    invalid_email: "유효한 이메일 주소를 입력해주세요.",
    signup_failed: "회원가입 실패",
    google_signup_success: "환영합니다, {name}님! Google 계정으로 회원가입이 완료되었습니다.",
    github_signup_success: "환영합니다, {name}님! GitHub 계정으로 회원가입이 완료되었습니다.",
    facebook_signup_success: "환영합니다, {name}님! Facebook 계정으로 회원가입이 완료되었습니다.",
    database_error: "사용자 문서 생성 실패"
  };
}

// 메시지 템플릿 처리 함수
function formatMessage(template, params = {}) {
  return template.replace(/\{(\w+)\}/g, (match, key) => params[key] || match);
}

// 이메일 유효성 검사 함수
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

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

// 브라우저 기본 이메일 검증 비활성화
if (emailInput) {
  // input type을 text로 변경하여 브라우저 검증 완전 비활성화
  emailInput.setAttribute('type', 'text');
  emailInput.setAttribute('inputmode', 'email');
  // 폼 요소가 있다면 novalidate 속성 추가
  const form = emailInput.closest('form');
  if (form) {
    form.setAttribute('novalidate', '');
    // 폼 제출 이벤트를 완전히 막기
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      return false;
    });
  }
}

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
      const t = await getTranslations();
      const userName = user.displayName || "사용자";
      alert(formatMessage(t.google_signup_success, { name: userName }));
      goToLanguageSpecificPage("index.html");
    }
  } catch (error) {
    const errorCode = error.code || "unknown";
    console.error("Google 회원가입 오류:", errorCode, error.message);
    showError(error.message);
  }
});

document.getElementById("github-signup-btn")?.addEventListener("click", async () => {
  try {
    hideError();
    const user = await githubLogin();
    if (user) {
      const t = await getTranslations();
      const userName = user.displayName || "사용자";
      alert(formatMessage(t.github_signup_success, { name: userName }));
      goToLanguageSpecificPage("index.html");
    }
  } catch (error) {
    const errorCode = error.code || "unknown";
    console.error("GitHub 회원가입 오류:", errorCode, error.message);
    showError(error.message);
  }
});

document.getElementById("facebook-signup-btn")?.addEventListener("click", async () => {
  try {
    hideError();
    const user = await facebookLogin();
    if (user) {
      const t = await getTranslations();
      const userName = user.displayName || "사용자";
      alert(formatMessage(t.facebook_signup_success, { name: userName }));
      goToLanguageSpecificPage("index.html");
    }
  } catch (error) {
    const errorCode = error.code || "unknown";
    console.error("Facebook 회원가입 오류:", errorCode, error.message);
    showError(error.message);
  }
});

submitButton.addEventListener("click", async () => {
  hideError();

  const t = await getTranslations();
  const name = nameInput.value.trim();
  const email = emailInput.value.trim();
  const password = passwordInput.value;
  const confirmPassword = confirmPasswordInput.value;

  if (!name || !email || !password || !confirmPassword) {
    showError(t.fields_required);
    return;
  }

  if (!isValidEmail(email)) {
    showError(t.invalid_email);
    return;
  }

  if (password !== confirmPassword) {
    showError(t.passwords_do_not_match);
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
        console.error(t.database_error + ":", dbError);
      }
      
      // 로그인 페이지로 리다이렉션
      if (typeof window.redirectToLogin === "function") {
        window.redirectToLogin();
      } else {
        goToLanguageSpecificPage("login.html");
      }
    } else {
      // 실제 회원가입 실패
      const errorCode = error.code || "unknown";
      console.error(t.signup_failed + ": ", errorCode, error.message);
      showError(`${t.signup_failed}: ${error.message}`);
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
