import { auth } from "./firebase/firebase-init.js";
import {
  onAuthStateChanged,
  updateProfile,
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
import {
  logout,
  deleteAccount,
  linkGoogleAccount,
  linkGithubAccount,
  unlinkProvider,
} from "../utils/firebase/firebase-auth.js";

document.addEventListener("DOMContentLoaded", async () => {
  console.log("프로필 페이지 초기화 시작");

  // DOM 요소 가져오기
  const displayNameInput = document.getElementById("displayName");
  const emailInput = document.getElementById("email");
  const profileForm = document.getElementById("profile-form");
  const authRequired = document.getElementById("auth-required");
  const profileContent = document.getElementById("profile-content");

  const googleStatus = document.getElementById("google-status");
  const googleConnect = document.getElementById("google-connect");
  const googleDisconnect = document.getElementById("google-disconnect");

  const githubStatus = document.getElementById("github-status");
  const githubConnect = document.getElementById("github-connect");
  const githubDisconnect = document.getElementById("github-disconnect");

  const logoutBtn = document.getElementById("logout-btn");
  const deleteAccountBtn = document.getElementById("delete-account");

  console.log("DOM 요소 확인:", {
    authRequired: !!authRequired,
    profileContent: !!profileContent,
    displayNameInput: !!displayNameInput,
    emailInput: !!emailInput,
    profileForm: !!profileForm,
  });

  // 초기 로딩 상태 설정 (로그인 상태 확인 중)
  if (profileContent) {
    profileContent.classList.add("hidden");
  }
  if (authRequired) {
    authRequired.classList.add("hidden");
  }

  // 로딩 표시
  const loadingDiv = document.createElement("div");
  loadingDiv.id = "loading-indicator";
  loadingDiv.className = "text-center py-8";
  loadingDiv.innerHTML = `
    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
    <p class="mt-4 text-gray-600">로그인 상태를 확인 중입니다...</p>
  `;
  document.body.appendChild(loadingDiv);

  // 인증 상태 변경 감지
  onAuthStateChanged(auth, (user) => {
    console.log(
      "Auth 상태 변경:",
      user ? `로그인됨 (${user.email})` : "로그아웃됨"
    );

    // 로딩 표시 제거
    const loadingIndicator = document.getElementById("loading-indicator");
    if (loadingIndicator) {
      loadingIndicator.remove();
    }

    if (user) {
      // 사용자가 로그인된 경우
      if (authRequired) {
        authRequired.classList.add("hidden");
        console.log("로그인 필요 메시지 숨김");
      }
      if (profileContent) {
        profileContent.classList.remove("hidden");
        console.log("프로필 콘텐츠 표시");
      }
      updateUIForLoggedInUser(user);

      // 네비게이션바 업데이트
      if (typeof window.updateNavbarForAuthState === "function") {
        window.updateNavbarForAuthState(user);
      }
    } else {
      // 사용자가 로그아웃된 경우
      if (authRequired) {
        authRequired.classList.remove("hidden");
        console.log("로그인 필요 메시지 표시");
      }
      if (profileContent) {
        profileContent.classList.add("hidden");
        console.log("프로필 콘텐츠 숨김");
      }

      // 네비게이션바 업데이트
      if (typeof window.updateNavbarForAuthState === "function") {
        window.updateNavbarForAuthState(null);
      }
    }
  });

  // 프로필 업데이트 폼
  if (profileForm) {
    profileForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const user = auth.currentUser;
      if (!user) return;

      const newDisplayName = displayNameInput.value.trim();
      if (!newDisplayName) {
        alert("이름을 입력해주세요.");
        return;
      }

      try {
        await updateProfile(user, {
          displayName: newDisplayName,
        });
        alert("프로필이 업데이트되었습니다.");
      } catch (error) {
        console.error("프로필 업데이트 오류:", error);
        alert(`프로필 업데이트 실패: ${error.message}`);
      }
    });
  }

  // Google 계정 연결
  if (googleConnect) {
    googleConnect.addEventListener("click", async () => {
      try {
        await linkGoogleAccount();
        updateProviderStatus();
      } catch (error) {
        console.error("Google 계정 연결 오류:", error);
        alert(`Google 계정 연결 실패: ${error.message}`);
      }
    });
  }

  // Google 계정 연결 해제
  if (googleDisconnect) {
    googleDisconnect.addEventListener("click", async () => {
      if (!confirm("Google 계정 연결을 해제하시겠습니까?")) {
        return;
      }

      try {
        await unlinkProvider("google.com");
        updateProviderStatus();
      } catch (error) {
        console.error("Google 계정 연결 해제 오류:", error);
        alert(`Google 계정 연결 해제 실패: ${error.message}`);
      }
    });
  }

  // GitHub 계정 연결
  if (githubConnect) {
    githubConnect.addEventListener("click", async () => {
      try {
        await linkGithubAccount();
        updateProviderStatus();
      } catch (error) {
        console.error("GitHub 계정 연결 오류:", error);
        alert(`GitHub 계정 연결 실패: ${error.message}`);
      }
    });
  }

  // GitHub 계정 연결 해제
  if (githubDisconnect) {
    githubDisconnect.addEventListener("click", async () => {
      if (!confirm("GitHub 계정 연결을 해제하시겠습니까?")) {
        return;
      }

      try {
        await unlinkProvider("github.com");
        updateProviderStatus();
      } catch (error) {
        console.error("GitHub 계정 연결 해제 오류:", error);
        alert(`GitHub 계정 연결 해제 실패: ${error.message}`);
      }
    });
  }

  // 로그아웃 버튼
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      try {
        await logout();
        if (typeof window.redirectToLogin === "function") {
          window.redirectToLogin();
        } else {
          window.location.href = "login.html";
        }
      } catch (error) {
        console.error("로그아웃 오류:", error);
        alert(`로그아웃 실패: ${error.message}`);
      }
    });
  }

  // 계정 삭제 버튼
  if (deleteAccountBtn) {
    deleteAccountBtn.addEventListener("click", async () => {
      if (
        !confirm("정말 계정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")
      ) {
        return;
      }

      try {
        await deleteAccount();
        alert("계정이 삭제되었습니다.");
        if (typeof window.redirectToLogin === "function") {
          window.redirectToLogin();
        } else {
          window.location.href = "login.html";
        }
      } catch (error) {
        console.error("계정 삭제 오류:", error);
        alert(`계정 삭제 실패: ${error.message}`);
      }
    });
  }

  // 로그인한 사용자의 UI 업데이트
  function updateUIForLoggedInUser(user) {
    console.log("사용자 UI 업데이트:", user.displayName, user.email);

    if (displayNameInput) {
      displayNameInput.value = user.displayName || "";
      console.log("이름 필드 업데이트:", user.displayName);
    }

    if (emailInput) {
      emailInput.value = user.email || "";
      console.log("이메일 필드 업데이트:", user.email);
    }

    updateProviderStatus();
  }

  // 제공자 연결 상태 업데이트
  function updateProviderStatus() {
    const user = auth.currentUser;
    if (!user) return;

    const providers = user.providerData.map((provider) => provider.providerId);
    console.log("사용자 제공자:", providers);

    // Google 상태 업데이트
    if (googleStatus && googleConnect && googleDisconnect) {
      if (providers.includes("google.com")) {
        googleStatus.textContent = "연결됨";
        googleStatus.classList.add("connected");
        googleConnect.classList.add("hidden");
        googleDisconnect.classList.remove("hidden");
      } else {
        googleStatus.textContent = "연결되지 않음";
        googleStatus.classList.remove("connected");
        googleConnect.classList.remove("hidden");
        googleDisconnect.classList.add("hidden");
      }
    }

    // GitHub 상태 업데이트
    if (githubStatus && githubConnect && githubDisconnect) {
      if (providers.includes("github.com")) {
        githubStatus.textContent = "연결됨";
        githubStatus.classList.add("connected");
        githubConnect.classList.add("hidden");
        githubDisconnect.classList.remove("hidden");
      } else {
        githubStatus.textContent = "연결되지 않음";
        githubStatus.classList.remove("connected");
        githubConnect.classList.remove("hidden");
        githubDisconnect.classList.add("hidden");
      }
    }
  }

  console.log("프로필 페이지 초기화 완료");
});
