import { login, googleLogin, githubLogin } from "../firebase/firebase-auth.js";

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

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const errorMessage = document.getElementById("error-message");
const submitButton = document.getElementById("login-button");

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

submitButton.addEventListener("click", async () => {
  hideError();

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!email || !password) {
    showError("이메일과 비밀번호를 모두 입력해주세요.");
    return;
  }

  try {
    const user = await login(email, password);
    console.log("로그인된 사용자: ", user);
    alert(`로그인 성공! 환영합니다. ${user.displayName || "사용자"}님!`);
    goToLanguageSpecificPage("index.html");
  } catch (error) {
    console.error("로그인 실패: ", error.message);
    logAuthError("email", error.code, error.message, email);

    if (error.message.includes("이메일 인증")) {
      showError("이메일 인증이 필요합니다. 이메일을 확인해주세요.");
    } else {
      showError(error.message);
    }
  }
});
