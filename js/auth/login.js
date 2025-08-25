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

// 현재 언어의 번역 가져오기
async function getTranslations() {
  const userLanguage = localStorage.getItem("userLanguage") || "ko";
  
  // 현재 경로 확인 및 올바른 경로 생성
  const currentPath = window.location.pathname;
  let basePath;
  
  if (currentPath.includes("/locales/")) {
    // locales 폴더 내부에 있는 경우 (/locales/ja/login.html)
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
    fields_required: "이메일과 비밀번호를 모두 입력해주세요.",
    invalid_email: "유효한 이메일 주소를 입력해주세요.",
    login_success: "로그인 성공! 환영합니다, {name}님!",
    invalid_credential: "이메일 또는 비밀번호가 올바르지 않습니다.",
    user_not_found: " 이메일입니다.",
    wrong_password: "비밀번호가 올바르지 않습니다.",
    invalid_email_format: "유효하지 않은 이메일 형식입니다.",
    too_many_requests: "너무 많은 로그인 시도가 있었습니다. 잠시 후 다시 시도해주세요.",
    login_error: "로그인 중 오류가 발생했습니다. 다시 시도해주세요."
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

// 로그인 오류 로깅 함수
const logAuthError = async (provider, errorCode, errorMessage, email) => {
  try {
    await fetch("/api/log-auth-error", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        provider,
        errorCode,
        errorMessage,
        email,
      }),
    });
  } catch (error) {
    console.error("오류 로깅 실패:", error);
  }
};

document
  .getElementById("google-login-btn")
  .addEventListener("click", async () => {
    try {
      hideError(); // 이전 오류 메시지 숨기기
      const user = await googleLogin();
      if (user) {
        // GitHub에서 리다이렉션된 경우 세션 스토리지를 확인
        const githubEmail = sessionStorage.getItem("githubLoginEmail");
        if (githubEmail) {
          // 이미 GitHub 연결 시도가 있었음
          // googleLogin() 내부에서 처리되므로 추가 조치 필요 없음
          sessionStorage.removeItem("githubLoginEmail");
        }

        const userName = user.displayName || "사용자";
        alert(`환영합니다, ${userName}님!`);
        goToLanguageSpecificPage("index.html");
      }
    } catch (error) {
      console.error("Google 로그인 오류:", error);
      logAuthError(
        "google",
        error.code || "custom-error",
        error.message,
        error.customData?.email
      );
      showError(error.message);
    }
  });

document
  .getElementById("github-login-btn")
  .addEventListener("click", async () => {
    try {
      hideError(); // 이전 오류 메시지 숨기기

      // GitHub 속도 제한 확인
      const lastGitHubAttempt = localStorage.getItem("lastGitHubLoginAttempt");
      const currentTime = Date.now();

      if (
        lastGitHubAttempt &&
        currentTime - parseInt(lastGitHubAttempt) < 60000
      ) {
        // 마지막 시도 후 1분 이내에 다시 시도한 경우
        showError(`
          <div>
            <p class="font-bold text-red-600">GitHub 로그인 속도 제한 가능성이 있습니다.</p>
            <p>GitHub는 너무 많은 로그인 시도를 감지하면 일시적으로 로그인을 제한합니다.</p>
            <p>잠시 후 다시 시도하거나 다른 로그인 방법을 사용해 주세요.</p>
            <p class="mt-2"><a href="#" id="try-google-login" class="text-blue-500 underline">Google로 로그인하기</a></p>
          </div>
        `);

        // Google 로그인 링크에 이벤트 리스너 추가
        document
          .getElementById("try-google-login")
          ?.addEventListener("click", async (e) => {
            e.preventDefault();
            try {
              const user = await googleLogin();
              if (user) {
                alert(`Google 계정으로 로그인되었습니다.`);
                goToLanguageSpecificPage("index.html");
              }
            } catch (googleError) {
              alert(`Google 로그인 실패: ${googleError.message}`);
            }
          });

        return;
      }

      // 로그인 시도 시간 기록
      localStorage.setItem("lastGitHubLoginAttempt", currentTime.toString());

      const user = await githubLogin();
      if (user) {
        const userName = user.displayName || "사용자";
        alert(`환영합니다, ${userName}님!`);
        goToLanguageSpecificPage("index.html");
      } else if (user === null) {
        // Google 로그인으로 리다이렉션된 경우 (githubLogin에서 null 반환)
        console.log("Google 로그인으로 리다이렉션됨");
        // 아무 작업 없음 - Google 로그인 처리에서 계속 진행
        return;
      }
    } catch (error) {
      console.error("GitHub 로그인 오류 세부 정보:", error);

      // 서버에 오류 로깅
      logAuthError(
        "github",
        error.code || "custom-error",
        error.message,
        error.customData?.email
      );

      // GitHub 속도 제한 오류 처리
      if (
        error.message &&
        (error.message.includes("exceeded a secondary rate limit") ||
          error.message.includes("GitHub API rate limit"))
      ) {
        showError(`
          <div>
            <p class="font-bold text-red-600">GitHub 로그인 속도 제한에 도달했습니다.</p>
            <p>GitHub가 너무 많은 로그인 시도를 감지하여 일시적으로 차단했습니다.</p>
            <p>다음 방법을 시도해보세요:</p>
            <ol class="ml-5 list-decimal">
              <li>몇 분간 기다린 후 다시 시도 (최대 1시간까지 필요할 수 있습니다)</li>
              <li><a href="#" id="try-google-login" class="text-blue-500 underline">Google로 로그인</a></li>
            </ol>
          </div>
        `);

        // Google 로그인 링크에 이벤트 리스너 추가
        document
          .getElementById("try-google-login")
          ?.addEventListener("click", async (e) => {
            e.preventDefault();
            try {
              const user = await googleLogin();
              if (user) {
                alert(`Google 계정으로 로그인되었습니다.`);
                goToLanguageSpecificPage("index.html");
              }
            } catch (googleError) {
              alert(`Google 로그인 실패: ${googleError.message}`);
            }
          });

        return;
      }
      // 특별한 오류 메시지 처리
      else if (
        error.message.includes("다른 로그인 방법을 사용") ||
        error.message.includes("인증 과정에서 오류가 발생") ||
        error.message.includes("Google 로그인 중 오류") ||
        error.message.includes("기존 로그인 방법을 사용")
      ) {
        // 이미 alert로 처리됨
        return;
      } else if (error.message.includes("팝업이 차단되었습니다")) {
        // 팝업 차단 오류 - 사용자에게 대체 방법 제안
        const popupErrorMsg = `
          <div>
            <p>팝업이 차단되었습니다. 다음 방법을 시도해보세요:</p>
            <ol class="ml-5 list-decimal">
              <li>브라우저 주소창 오른쪽에 있는 팝업 차단 아이콘을 클릭하고 허용</li>
              <li>또는 <a href="#" id="try-google-login" class="text-blue-500 underline">Google로 직접 로그인</a>한 후, 프로필 페이지에서 GitHub 연결</li>
            </ol>
          </div>
        `;
        showError(popupErrorMsg);

        // Google 로그인 링크에 이벤트 리스너 추가
        document
          .getElementById("try-google-login")
          ?.addEventListener("click", async (e) => {
            e.preventDefault();
            try {
              const user = await googleLogin();
              if (user) {
                alert(
                  `Google 계정으로 로그인되었습니다. 프로필 페이지에서 GitHub 계정을 연결할 수 있습니다.`
                );
                goToLanguageSpecificPage("index.html");
              }
            } catch (googleError) {
              alert(`Google 로그인 실패: ${googleError.message}`);
            }
          });

        return;
      } else if (
        error.code === "auth/cancelled-popup-request" ||
        error.message.includes("로그인 요청이 취소되었습니다")
      ) {
        showError(`
          <div>
            <p>로그인 요청이 취소되었습니다. 다음 중 한 가지 방법으로 해결해 보세요:</p>
            <ol class="ml-5 list-decimal">
              <li>잠시 후 다시 시도해 주세요</li>
              <li>브라우저를 새로고침한 후 다시 시도</li>
              <li>다른 브라우저를 사용해 보세요</li>
              <li>또는 <a href="#" id="try-google-login" class="text-blue-500 underline">Google로 로그인</a></li>
            </ol>
          </div>
        `);

        // Google 로그인 링크에 이벤트 리스너 추가
        document
          .getElementById("try-google-login")
          ?.addEventListener("click", async (e) => {
            e.preventDefault();
            try {
              const user = await googleLogin();
              if (user) {
                alert(`Google 계정으로 로그인되었습니다.`);
                goToLanguageSpecificPage("index.html");
              }
            } catch (googleError) {
              alert(`Google 로그인 실패: ${googleError.message}`);
            }
          });

        return;
      } else if (
        error.code === "auth/account-exists-with-different-credential"
      ) {
        // 처리되지 않은 계정 존재 오류인 경우
        const email = error.customData?.email;
        if (email) {
          showError(
            `이메일 "${email}"은(는) 이미 다른 로그인 방법에 연결되어 있습니다. 해당 이메일과 연결된 계정으로 로그인하세요.`
          );
        } else {
          showError("이미 등록된 이메일입니다. 다른 로그인 방법을 시도하세요.");
        }
        return;
      }

      // 일반 오류 메시지
      showError(error.message);
    }
  });

document
  .getElementById("facebook-login-btn")
  .addEventListener("click", async () => {
    try {
      hideError(); // 이전 오류 메시지 숨기기
      const user = await facebookLogin();
      if (user) {
        const userName = user.displayName || "사용자";
        alert(`환영합니다, ${userName}님!`);
        goToLanguageSpecificPage("index.html");
      }
    } catch (error) {
      console.error("Facebook 로그인 오류:", error);
      logAuthError(
        "facebook",
        error.code || "custom-error",
        error.message,
        error.customData?.email
      );
      showError(error.message);
    }
  });

// 로그인 처리 함수
async function handleLogin() {
  hideError();

  const t = await getTranslations();
  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!email || !password) {
    showError(t.fields_required || "이메일과 비밀번호를 모두 입력해주세요.");
    return;
  }

  if (!isValidEmail(email)) {
    showError(t.invalid_email || "유효한 이메일 주소를 입력해주세요.");
    return;
  }

  try {
    const user = await login(email, password);

    const userName = user.displayName || "사용자";
    alert(formatMessage(t.login_success || "로그인 성공! 환영합니다. {name}님!", { name: userName }));
    goToLanguageSpecificPage("index.html");
  } catch (error) {
    const errorCode = error.code || "unknown";
    console.error("로그인 실패:", errorCode);
    logAuthError("email", errorCode, error.message, email);

    // Firebase 에러 코드에 따른 사용자 친화적 메시지
    let errorMessage = t.login_error || "로그인 중 오류가 발생했습니다. 다시 시도해주세요.";
    
    if (errorCode === "auth/user-not-found") {
      errorMessage = t.user_not_found || "등록되지 않은 이메일입니다.";
    } else if (errorCode === "auth/wrong-password") {
      errorMessage = t.wrong_password || "비밀번호가 올바르지 않습니다.";
    } else if (errorCode === "auth/invalid-credential") {
      errorMessage = t.invalid_credential || "이메일 또는 비밀번호가 올바르지 않습니다.";
    } else if (errorCode === "auth/invalid-email") {
      errorMessage = t.invalid_email_format || "유효하지 않은 이메일 형식입니다.";
    } else if (errorCode === "auth/too-many-requests") {
      errorMessage = t.too_many_requests || "너무 많은 로그인 시도가 있었습니다. 잠시 후 다시 시도해주세요.";
    } else if (error.message && error.message.includes("이메일 인증")) {
      errorMessage = t.email_verification_required || "이메일 인증이 필요합니다. 이메일을 확인해주세요.";
    }

    showError(errorMessage);
  }
}

// 로그인 버튼 클릭 이벤트
submitButton.addEventListener("click", handleLogin);

// 로그인 폼 제출 이벤트 (Enter 키 지원)
const loginForm = document.getElementById("login-form");
if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    handleLogin();
  });
}

// Enter 키 이벤트 리스너 추가
[emailInput, passwordInput].forEach((input) => {
  if (input) {
    input.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleLogin();
      }
    });
  }
});


// 로그인 상태 체크 - 이메일 인증이 완료된 사용자만 홈으로 리디렉션
onAuthStateChanged(auth, (user) => {
  if (user && user.emailVerified) {
    console.log("이미 로그인되어 있고 이메일 인증이 완료되었습니다. 홈으로 리디렉션합니다.");
    goToLanguageSpecificPage("index.html");
  } else if (user && !user.emailVerified) {
    console.log("로그인되었지만 이메일 인증이 필요합니다.");
    // 이메일 인증이 안된 경우 로그아웃
    auth.signOut();
  }
});
