import {
  login,
  googleLogin,
  githubLogin,
  facebookLogin,
} from "../../utils/firebase/firebase-auth.js";

import { auth } from "../../js/firebase/firebase-init.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";

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

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const errorMessage = document.getElementById("error-message");
const submitButton = document.getElementById("login-button");

// 브라우저 기본 이메일 검증 비활성화
if (emailInput) {
  emailInput.setAttribute('type', 'text');
  emailInput.setAttribute('inputmode', 'email');
  const form = emailInput.closest('form');
  if (form) {
    form.setAttribute('novalidate', '');
  }
}

// 현재 언어의 번역 가져오기
async function getTranslations() {
  const userLanguage = localStorage.getItem("userLanguage") || "ko";
  
  const currentPath = window.location.pathname;
  let basePath;
  
  if (currentPath.includes("/locales/")) {
    basePath = "../../";
  } else {
    basePath = "./";
  }
  
  try {
    const response = await fetch(`${window.location.origin}/locales/${userLanguage}/translations.json`);
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.error("번역 파일 로드 실패:", error);
  }
  
  // 기본값 반환
  return {
    fields_required: "이메일과 비밀번호를 모두 입력해주세요.",
    invalid_email: "유효한 이메일 주소를 입력해주세요.",
    login_success: "로그인 성공! 환영합니다, {name}님!",
    invalid_credential: "이메일 또는 비밀번호가 올바르지 않습니다.",
    invalid_email_format: "유효하지 않은 이메일 형식입니다.",
    too_many_requests: "너무 많은 로그인 시도가 있었습니다. 잠시 후 다시 시도해주세요.",
    login_error: "로그인 중 오류가 발생했습니다. 다시 시도해주세요.",
    email_verification_required: "이메일 인증이 필요합니다. 이메일을 확인해주세요."
  };
}

const showError = (message) => {
  errorMessage.textContent = message;
  errorMessage.classList.remove("hidden");
};

const hideError = () => {
  errorMessage.textContent = "";
  errorMessage.classList.add("hidden");
};

// Google 로그인
document.getElementById("google-login-btn").addEventListener("click", async () => {
  try {
    hideError();
    const user = await googleLogin();
    if (user) {
      const userName = user.displayName || "사용자";
      alert(`환영합니다, ${userName}님!`);
      goToLanguageSpecificPage("index.html");
    }
  } catch (error) {
    console.error("Google 로그인 오류:", error);
    showError(error.message);
  }
});

// GitHub 로그인
document.getElementById("github-login-btn").addEventListener("click", async () => {
  try {
    hideError();
    const user = await githubLogin();
    if (user) {
      const userName = user.displayName || "사용자";
      alert(`환영합니다, ${userName}님!`);
      goToLanguageSpecificPage("index.html");
    } else if (user === null) {
      console.log("Google 로그인으로 리다이렉션됨");
      return;
    }
  } catch (error) {
    console.error("GitHub 로그인 오류:", error);
    showError(error.message);
  }
});

// Facebook 로그인
document.getElementById("facebook-login-btn").addEventListener("click", async () => {
  try {
    hideError();
    const user = await facebookLogin();
    if (user) {
      const userName = user.displayName || "사용자";
      alert(`환영합니다, ${userName}님!`);
      goToLanguageSpecificPage("index.html");
    }
  } catch (error) {
    console.error("Facebook 로그인 오류:", error);
    showError(error.message);
  }
});

// 이메일/비밀번호 로그인
let isLoggingIn = false;

async function handleLogin() {
  if (isLoggingIn) return;
  
  isLoggingIn = true;
  hideError();

  const t = await getTranslations();
  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!email || !password) {
    showError(t.fields_required);
    isLoggingIn = false;
    return;
  }

  if (!isValidEmail(email)) {
    showError(t.invalid_email);
    isLoggingIn = false;
    return;
  }

  try {
    const user = await login(email, password);
    const userName = user.displayName || "사용자";
    alert(formatMessage(t.login_success, { name: userName }));
    isLoggingIn = false;
    goToLanguageSpecificPage("index.html");
  } catch (error) {
    const errorCode = error.code || "unknown";
    console.error("로그인 실패:", errorCode, error.message);

    let errorMessage = t.login_error;
    
    if (errorCode === "auth/invalid-credential") {
      errorMessage = t.invalid_credential;
    } else if (errorCode === "auth/invalid-email") {
      errorMessage = t.invalid_email_format;
    } else if (errorCode === "auth/too-many-requests") {
      errorMessage = t.too_many_requests;
    } else if (error.message && error.message.includes("이메일 인증")) {
      errorMessage = t.email_verification_required;
    }

    showError(errorMessage);
    isLoggingIn = false;
  }
}

// 이벤트 리스너
submitButton.addEventListener("click", (e) => {
  e.preventDefault();
  handleLogin();
});

const loginForm = document.getElementById("login-form");
if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    handleLogin();
  });
}

// 로그인 상태 체크
onAuthStateChanged(auth, (user) => {
  if (user && user.emailVerified) {
    console.log("이미 로그인되어 있고 이메일 인증이 완료되었습니다.");
    goToLanguageSpecificPage("index.html");
  } else if (user && !user.emailVerified) {
    console.log("로그인되었지만 이메일 인증이 필요합니다.");
    auth.signOut();
  }
});