import { resetPassword } from "../../utils/firebase/firebase-auth.js";

// 다국어 지원
const translations = {
  'ko': {
    emailRequired: '이메일을 입력하세요.',
    resetEmailSent: '비밀번호 재설정 링크가 이메일로 전송되었습니다.',
    userNotFound: '등록되지 않은 이메일입니다.',
    invalidEmail: '유효하지 않은 이메일 주소입니다.',
    tooManyRequests: '너무 많은 요청이 있었습니다. 잠시 후 다시 시도해주세요.',
    defaultError: '오류가 발생했습니다. 다시 시도해주세요.'
  },
  'en': {
    emailRequired: 'Please enter your email.',
    resetEmailSent: 'Password reset link has been sent to your email.',
    userNotFound: 'This email is not registered.',
    invalidEmail: 'Invalid email address.',
    tooManyRequests: 'Too many requests. Please try again later.',
    defaultError: 'An error occurred. Please try again.'
  },
  'zh': {
    emailRequired: '请输入邮箱。',
    resetEmailSent: '密码重置链接已发送到您的邮箱。',
    userNotFound: '此邮箱未注册。',
    invalidEmail: '无效的邮箱地址。',
    tooManyRequests: '请求过多。请稍后再试。',
    defaultError: '发生错误。请重试。'
  },
  'ja': {
    emailRequired: 'メールアドレスを入力してください。',
    resetEmailSent: 'パスワードリセットリンクがメールに送信されました。',
    userNotFound: 'このメールアドレスは登録されていません。',
    invalidEmail: '無効なメールアドレスです。',
    tooManyRequests: 'リクエストが多すぎます。しばらく待ってから再試行してください。',
    defaultError: 'エラーが発生しました。再試行してください。'
  },
  'es': {
    emailRequired: 'Por favor ingrese su email.',
    resetEmailSent: 'El enlace para restablecer contraseña ha sido enviado a su email.',
    userNotFound: 'Este email no está registrado.',
    invalidEmail: 'Dirección de email inválida.',
    tooManyRequests: 'Demasiadas solicitudes. Por favor intente más tarde.',
    defaultError: 'Ocurrió un error. Por favor intente nuevamente.'
  }
};

// 현재 언어의 번역 가져오기
function getTranslations() {
  const userLanguage = localStorage.getItem("userLanguage") || "ko";
  return translations[userLanguage] || translations['ko'];
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
const resetButton = document.getElementById("reset-password-button");

resetButton.addEventListener("click", async () => {
  const email = emailInput.value.trim();
  const t = getTranslations();

  if (!email) {
    alert(t.emailRequired);
    return;
  }

  try {
    await resetPassword(email);
    alert(t.resetEmailSent);
    emailInput.value = "";
    if (typeof window.redirectToLogin === "function") {
      window.redirectToLogin();
    } else {
      goToLanguageSpecificPage("login.html");
    }
  } catch (error) {
    switch (error.code) {
      case "auth/user-not-found":
        alert(t.userNotFound);
        break;
      case "auth/invalid-email":
        alert(t.invalidEmail);
        break;
      case "auth/too-many-requests":
        alert(t.tooManyRequests);
        break;
      default:
        alert(t.defaultError);
        console.error(error);
    }
  }
});
