import { db } from "../../utils/firebase/firebase-init.js";
import { signup } from "../../utils/firebase/firebase-auth.js";
import {
  doc,
  setDoc,
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

// 언어별 페이지로 이동하는 함수
function goToLanguageSpecificPage(filename) {
  const userLanguage = localStorage.getItem("userLanguage") || "ko";
  const isDev =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.port === "5500";

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
    const user = await signup(email, password, name);
    alert("인증 이메일을 발송했습니다. 이메일을 확인해주세요!");

    await setDoc(doc(db, "users", email), {
      wordCount: 0,
      aiUsage: 0,
      maxWordCount: 50,
      maxAiUsage: 10,
    });
    if (typeof window.redirectToLogin === "function") {
      window.redirectToLogin();
    } else {
      goToLanguageSpecificPage("login.html");
    }
    console.log("가입된 사용자: ", user);
  } catch (error) {
    console.error("회원가입 실패: ", error.message);
    showError(`회원가입 실패: ${error.message}`);
  }
});
