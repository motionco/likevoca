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
} from "./firebase/firebase-auth.js";

document.addEventListener("DOMContentLoaded", async () => {
  // Navbar 로드
  try {
    const navbarPlaceholder = document.getElementById("navbar-placeholder");
    if (navbarPlaceholder) {
      try {
        const userLanguage = localStorage.getItem("userLanguage") || "ko";
        const response = await fetch(`locales/${userLanguage}/navbar.html`);
        if (response.ok) {
          const html = await response.text();
          navbarPlaceholder.innerHTML = html;

          // navbar.js 직접 임포트 (모듈 스크립트 추가 대신)
          await initializeNavbar();

          console.log("Navbar 로드 성공");
        } else {
          console.error("Navbar HTML을 가져올 수 없습니다:", response.status);
          navbarPlaceholder.innerHTML =
            '<div class="p-4 bg-blue-500 text-white">LikeVoca</div>';
        }
      } catch (error) {
        console.error("Navbar 로드 오류:", error);
        navbarPlaceholder.innerHTML =
          '<div class="p-4 bg-blue-500 text-white">LikeVoca</div>';
      }
    }
  } catch (error) {
    console.error("Navbar 로드 오류:", error);
  }

  // 요소 가져오기
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

  // 기본 상태 설정 - 디버깅을 위해 초기에 내용 표시
  if (authRequired) authRequired.classList.remove("hidden"); // 인증 필요 메시지 표시
  if (profileContent) profileContent.classList.add("hidden"); // 프로필 콘텐츠 숨김

  console.log("DOM 요소 확인:", {
    authRequired: !!authRequired,
    profileContent: !!profileContent,
    displayNameInput: !!displayNameInput,
    emailInput: !!emailInput,
    profileForm: !!profileForm,
  });

  // 인증 상태 변경 감지
  onAuthStateChanged(auth, (user) => {
    console.log("Auth 상태 변경:", user ? "로그인됨" : "로그인되지 않음");

    if (user) {
      // 로그인한 경우
      if (authRequired) authRequired.classList.add("hidden");
      if (profileContent) profileContent.classList.remove("hidden");
      updateUIForLoggedInUser(user);

      // 네비게이션 바에도 로그인 상태 반영
      updateNavbar(user);
    } else {
      // 로그인하지 않은 경우
      if (authRequired) authRequired.classList.remove("hidden");
      if (profileContent) profileContent.classList.add("hidden");

      // 네비게이션 바에도 로그아웃 상태 반영
      updateNavbar(null);
    }
  });

  // 프로필 업데이트
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

  // 로그인한 사용자의 UI 업데이트
  function updateUIForLoggedInUser(user) {
    console.log("사용자 UI 업데이트:", user.displayName);

    if (displayNameInput) {
      displayNameInput.value = user.displayName || "";
    }

    if (emailInput) {
      emailInput.value = user.email || "";
    }

    updateProviderStatus();
  }

  // Google 연결
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

  // Google 연결 해제
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

  // GitHub 연결
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

  // GitHub 연결 해제
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

  // 로그아웃
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

  // 계정 삭제
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
});

// 네비게이션바 초기화 함수
async function initializeNavbar() {
  // 햄버거 메뉴 동작 설정
  const menuToggle = document.getElementById("menu-toggle");
  const mobileMenu = document.getElementById("mobile-menu");

  if (menuToggle && mobileMenu) {
    console.log("햄버거 메뉴 이벤트 리스너 추가");
    menuToggle.addEventListener("click", () => {
      mobileMenu.classList.toggle("hidden");
      console.log(
        "햄버거 메뉴 토글:",
        mobileMenu.classList.contains("hidden") ? "숨김" : "표시"
      );
    });
  } else {
    console.warn("메뉴 토글 요소를 찾을 수 없습니다:", {
      menuToggle,
      mobileMenu,
    });
  }

  // 프로필 드롭다운 동작 설정
  const avatar = document.getElementById("avatar");
  const profileDropdown = document.getElementById("profile-dropdown");

  if (avatar && profileDropdown) {
    // 프로필 아이콘 클릭 시 드롭다운 토글
    avatar.addEventListener("click", (e) => {
      e.stopPropagation(); // 클릭 이벤트 전파 중지
      profileDropdown.classList.toggle("hidden");
    });

    // 문서 어디든 클릭 시 드롭다운 닫기
    document.addEventListener("click", () => {
      if (!profileDropdown.classList.contains("hidden")) {
        profileDropdown.classList.add("hidden");
      }
    });

    // 드롭다운 내부 클릭 시 이벤트 전파 중지
    profileDropdown.addEventListener("click", (e) => {
      e.stopPropagation();
    });
  }

  // 모바일 메뉴의 링크 경로 수정
  const mobileLoginButtons = document.getElementById("mobile-login-buttons");
  if (mobileLoginButtons) {
    const links = mobileLoginButtons.querySelectorAll("a");
    links.forEach((link) => {
      // 상대 경로를 언어별 리다이렉트 함수로 변경
      if (link.getAttribute("href") === "login.html") {
        link.setAttribute("href", "#");
        link.setAttribute("onclick", "window.redirectToLogin()");
      } else if (link.getAttribute("href") === "signup.html") {
        link.setAttribute("href", "#");
        link.setAttribute("onclick", "window.redirectToSignup()");
      }
    });
  }

  // 데스크톱 메뉴의 링크 경로 수정
  const loginButton = document.getElementById("login-button");
  const signupButton = document.getElementById("signup-button");

  if (loginButton && loginButton.getAttribute("href") === "login.html") {
    loginButton.setAttribute("href", "#");
    loginButton.setAttribute("onclick", "window.redirectToLogin()");
  }

  if (signupButton && signupButton.getAttribute("href") === "signup.html") {
    signupButton.setAttribute("href", "#");
    signupButton.setAttribute("onclick", "window.redirectToSignup()");
  }

  // 로그아웃 버튼 동작 설정
  const logoutButton = document.getElementById("logout-button");
  const mobileLogoutButton = document.getElementById("mobile-logout-button");

  if (logoutButton) {
    logoutButton.addEventListener("click", async () => {
      try {
        await logout();
        window.location.reload();
      } catch (error) {
        console.error("로그아웃 오류:", error);
        alert("로그아웃에 실패했습니다.");
      }
    });
  }

  if (mobileLogoutButton) {
    mobileLogoutButton.addEventListener("click", async () => {
      try {
        await logout();
        window.location.reload();
      } catch (error) {
        console.error("로그아웃 오류:", error);
        alert("로그아웃에 실패했습니다.");
      }
    });
  }

  // 회원 탈퇴 버튼 동작 설정
  const deleteAccountButton = document.getElementById("delete-account-button");
  const mobileDeleteAccountButton = document.getElementById(
    "mobile-delete-account-button"
  );

  if (deleteAccountButton) {
    deleteAccountButton.addEventListener("click", async () => {
      if (
        confirm("정말로 회원탈퇴를 하시겠습니까? 이 작업은 되돌릴 수 없습니다.")
      ) {
        try {
          await deleteAccount();
          alert("회원탈퇴가 완료되었습니다.");
          window.location.reload();
        } catch (error) {
          alert(error.message || "회원탈퇴 중 오류가 발생했습니다.");
        }
      }
    });
  }

  if (mobileDeleteAccountButton) {
    mobileDeleteAccountButton.addEventListener("click", async () => {
      if (
        confirm("정말로 회원탈퇴를 하시겠습니까? 이 작업은 되돌릴 수 없습니다.")
      ) {
        try {
          await deleteAccount();
          alert("회원탈퇴가 완료되었습니다.");
          window.location.reload();
        } catch (error) {
          alert(error.message || "회원탈퇴 중 오류가 발생했습니다.");
        }
      }
    });
  }

  // 초기 인증 상태 확인
  if (auth.currentUser) {
    updateNavbar(auth.currentUser);
  } else {
    updateNavbar(null);
  }
}

// 네비게이션바 상태 업데이트 함수
function updateNavbar(user) {
  try {
    const mobileLoginButtons = document.getElementById("mobile-login-buttons");
    const userProfile = document.getElementById("user-profile");
    const mobileUserProfile = document.getElementById("mobile-user-profile");
    const avatar = document.getElementById("avatar");
    const loginButton = document.getElementById("login-button");
    const signupButton = document.getElementById("signup-button");

    if (!mobileLoginButtons || !userProfile || !mobileUserProfile || !avatar) {
      console.warn("네비게이션바 요소를 찾을 수 없습니다");
      return;
    }

    if (user) {
      // 로그인 상태
      if (loginButton) loginButton.classList.add("hidden");
      if (signupButton) signupButton.classList.add("hidden");
      mobileLoginButtons.classList.add("hidden");
      userProfile.classList.remove("hidden");
      mobileUserProfile.classList.remove("hidden");

      const userName = user.displayName || "사용자";
      const userNameEl = document.getElementById("user-name");

      if (userNameEl) userNameEl.textContent = `환영합니다, ${userName}님`;

      // 모바일 환영 메시지 제거 (불필요함)
      const mobileUserNameEl = document.getElementById("mobile-user-name");
      if (mobileUserNameEl && mobileUserNameEl.parentElement) {
        // 환영 메시지 텍스트를 비우고 숨김
        mobileUserNameEl.textContent = "";
        mobileUserNameEl.parentElement.classList.add("hidden");
      }

      const avatarURL =
        user.photoURL || "https://www.w3schools.com/howto/img_avatar.png";
      avatar.innerHTML = `<img src="${avatarURL}" class="w-10 h-10 rounded-full" alt="프로필 사진">`;
      // 부모 요소가 있는 경우에만 hidden 클래스 제거
      if (avatar.parentElement) {
        avatar.parentElement.classList.remove("hidden");
      }
    } else {
      // 로그아웃 상태
      if (loginButton) loginButton.classList.remove("hidden");
      if (signupButton) signupButton.classList.remove("hidden");
      mobileLoginButtons.classList.remove("hidden");
      userProfile.classList.add("hidden");
      mobileUserProfile.classList.add("hidden");
    }
  } catch (error) {
    console.error("네비게이션바 업데이트 오류:", error);
  }
}
