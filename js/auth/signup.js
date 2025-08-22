import { db, auth } from "../../js/firebase/firebase-init.js";
import { signup, googleLogin, githubLogin, facebookLogin } from "../../utils/firebase/firebase-auth.js";
import {
  doc,
  setDoc,
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";

// 다국어 지원
const translations = {
  'ko': {
    allFieldsRequired: '모든 필드를 채워주세요.',
    passwordMismatch: '비밀번호가 일치하지 않습니다.',
    invalidEmail: '유효한 이메일 주소를 입력해주세요.',
    signupFailed: '회원가입 실패',
    googleSignupSuccess: '환영합니다, {name}님! Google 계정으로 회원가입이 완료되었습니다.',
    githubSignupSuccess: '환영합니다, {name}님! GitHub 계정으로 회원가입이 완료되었습니다.',
    facebookSignupSuccess: '환영합니다, {name}님! Facebook 계정으로 회원가입이 완료되었습니다.',
    databaseError: '사용자 문서 생성 실패'
  },
  'en': {
    allFieldsRequired: 'Please fill in all fields.',
    passwordMismatch: 'Passwords do not match.',
    invalidEmail: 'Please enter a valid email address.',
    signupFailed: 'Sign up failed',
    googleSignupSuccess: 'Welcome, {name}! Your Google account registration is complete.',
    githubSignupSuccess: 'Welcome, {name}! Your GitHub account registration is complete.',
    facebookSignupSuccess: 'Welcome, {name}! Your Facebook account registration is complete.',
    databaseError: 'Failed to create user document'
  },
  'zh': {
    allFieldsRequired: '请填写所有字段。',
    passwordMismatch: '密码不匹配。',
    invalidEmail: '请输入有效的邮箱地址。',
    signupFailed: '注册失败',
    googleSignupSuccess: '欢迎，{name}！您的Google账户注册已完成。',
    githubSignupSuccess: '欢迎，{name}！您的GitHub账户注册已完成。',
    facebookSignupSuccess: '欢迎，{name}！您的Facebook账户注册已完成。',
    databaseError: '创建用户文档失败'
  },
  'ja': {
    allFieldsRequired: 'すべてのフィールドを入力してください。',
    passwordMismatch: 'パスワードが一致しません。',
    invalidEmail: '有効なメールアドレスを入力してください。',
    signupFailed: 'サインアップに失敗しました',
    googleSignupSuccess: 'ようこそ、{name}さん！Googleアカウントでの登録が完了しました。',
    githubSignupSuccess: 'ようこそ、{name}さん！GitHubアカウントでの登録が完了しました。',
    facebookSignupSuccess: 'ようこそ、{name}さん！Facebookアカウントでの登録が完了しました。',
    databaseError: 'ユーザードキュメント作成に失敗しました'
  },
  'es': {
    allFieldsRequired: 'Por favor complete todos los campos.',
    passwordMismatch: 'Las contraseñas no coinciden.',
    invalidEmail: 'Por favor ingrese una dirección de email válida.',
    signupFailed: 'Registro fallido',
    googleSignupSuccess: '¡Bienvenido, {name}! Su registro con cuenta Google está completo.',
    githubSignupSuccess: '¡Bienvenido, {name}! Su registro con cuenta GitHub está completo.',
    facebookSignupSuccess: '¡Bienvenido, {name}! Su registro con cuenta Facebook está completo.',
    databaseError: 'Error al crear documento de usuario'
  }
};

// 현재 언어의 번역 가져오기
function getTranslations() {
  const userLanguage = localStorage.getItem("userLanguage") || "ko";
  return translations[userLanguage] || translations['ko'];
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
      const t = getTranslations();
      const userName = user.displayName || "사용자";
      alert(formatMessage(t.googleSignupSuccess, { name: userName }));
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
      const t = getTranslations();
      const userName = user.displayName || "사용자";
      alert(formatMessage(t.githubSignupSuccess, { name: userName }));
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
      const t = getTranslations();
      const userName = user.displayName || "사용자";
      alert(formatMessage(t.facebookSignupSuccess, { name: userName }));
      goToLanguageSpecificPage("index.html");
    }
  } catch (error) {
    console.error("Facebook 회원가입 오류:", error);
    showError(error.message);
  }
});

submitButton.addEventListener("click", async () => {
  hideError();

  const t = getTranslations();
  const name = nameInput.value.trim();
  const email = emailInput.value.trim();
  const password = passwordInput.value;
  const confirmPassword = confirmPasswordInput.value;

  if (!name || !email || !password || !confirmPassword) {
    showError(t.allFieldsRequired);
    return;
  }

  if (!isValidEmail(email)) {
    showError(t.invalidEmail);
    return;
  }

  if (password !== confirmPassword) {
    showError(t.passwordMismatch);
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
        console.error(t.databaseError + ":", dbError);
      }
      
      // 로그인 페이지로 리다이렉션
      if (typeof window.redirectToLogin === "function") {
        window.redirectToLogin();
      } else {
        goToLanguageSpecificPage("login.html");
      }
    } else {
      // 실제 회원가입 실패
      console.error(t.signupFailed + ": ", error.message);
      showError(`${t.signupFailed}: ${error.message}`);
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
