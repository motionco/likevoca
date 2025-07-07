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
  console.log("?�로???�이지 초기???�작");

  // DOM ?�소 가?�오�?
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

  console.log("DOM ?�소 ?�인:", {
    authRequired: !!authRequired,
    profileContent: !!profileContent,
    displayNameInput: !!displayNameInput,
    emailInput: !!emailInput,
    profileForm: !!profileForm,
  });

  // ?�증 ?�태 변�?감�?
  onAuthStateChanged(auth, (user) => {
    console.log(
      "Auth ?�태 변�?",
      user ? `로그?�됨 (${user.email})` : "로그?�웃??
    );

    if (user) {
      // ?�용?��? 로그?�된 경우
      if (authRequired) {
        authRequired.classList.add("hidden");
        console.log("로그???�요 메시지 ?��?");
      }
      if (profileContent) {
        profileContent.classList.remove("hidden");
        console.log("?�로??콘텐�??�시");
      }
      updateUIForLoggedInUser(user);

      // ?�비게이?�바 ?�데?�트
      if (typeof window.updateNavbarForAuthState === "function") {
        window.updateNavbarForAuthState(user);
      }
    } else {
      // ?�용?��? 로그?�웃??경우
      if (authRequired) {
        authRequired.classList.remove("hidden");
        console.log("로그???�요 메시지 ?�시");
      }
      if (profileContent) {
        profileContent.classList.add("hidden");
        console.log("?�로??콘텐�??��?");
      }

      // ?�비게이?�바 ?�데?�트
      if (typeof window.updateNavbarForAuthState === "function") {
        window.updateNavbarForAuthState(null);
      }
    }
  });

  // ?�로???�데?�트 ??
  if (profileForm) {
    profileForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const user = auth.currentUser;
      if (!user) return;

      const newDisplayName = displayNameInput.value.trim();
      if (!newDisplayName) {
        alert("?�름???�력?�주?�요.");
        return;
      }

      try {
        await updateProfile(user, {
          displayName: newDisplayName,
        });
        alert("?�로?�이 ?�데?�트?�었?�니??");
      } catch (error) {
        console.error("?�로???�데?�트 ?�류:", error);
        alert(`?�로???�데?�트 ?�패: ${error.message}`);
      }
    });
  }

  // Google 계정 ?�결
  if (googleConnect) {
    googleConnect.addEventListener("click", async () => {
      try {
        await linkGoogleAccount();
        updateProviderStatus();
      } catch (error) {
        console.error("Google 계정 ?�결 ?�류:", error);
        alert(`Google 계정 ?�결 ?�패: ${error.message}`);
      }
    });
  }

  // Google 계정 ?�결 ?�제
  if (googleDisconnect) {
    googleDisconnect.addEventListener("click", async () => {
      if (!confirm("Google 계정 ?�결???�제?�시겠습?�까?")) {
        return;
      }

      try {
        await unlinkProvider("google.com");
        updateProviderStatus();
      } catch (error) {
        console.error("Google 계정 ?�결 ?�제 ?�류:", error);
        alert(`Google 계정 ?�결 ?�제 ?�패: ${error.message}`);
      }
    });
  }

  // GitHub 계정 ?�결
  if (githubConnect) {
    githubConnect.addEventListener("click", async () => {
      try {
        await linkGithubAccount();
        updateProviderStatus();
      } catch (error) {
        console.error("GitHub 계정 ?�결 ?�류:", error);
        alert(`GitHub 계정 ?�결 ?�패: ${error.message}`);
      }
    });
  }

  // GitHub 계정 ?�결 ?�제
  if (githubDisconnect) {
    githubDisconnect.addEventListener("click", async () => {
      if (!confirm("GitHub 계정 ?�결???�제?�시겠습?�까?")) {
        return;
      }

      try {
        await unlinkProvider("github.com");
        updateProviderStatus();
      } catch (error) {
        console.error("GitHub 계정 ?�결 ?�제 ?�류:", error);
        alert(`GitHub 계정 ?�결 ?�제 ?�패: ${error.message}`);
      }
    });
  }

  // 로그?�웃 버튼
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
        console.error("로그?�웃 ?�류:", error);
        alert(`로그?�웃 ?�패: ${error.message}`);
      }
    });
  }

  // 계정 ??�� 버튼
  if (deleteAccountBtn) {
    deleteAccountBtn.addEventListener("click", async () => {
      if (
        !confirm("?�말 계정????��?�시겠습?�까? ???�업?� ?�돌�????�습?�다.")
      ) {
        return;
      }

      try {
        await deleteAccount();
        alert("계정????��?�었?�니??");
        if (typeof window.redirectToLogin === "function") {
          window.redirectToLogin();
        } else {
          window.location.href = "login.html";
        }
      } catch (error) {
        console.error("계정 ??�� ?�류:", error);
        alert(`계정 ??�� ?�패: ${error.message}`);
      }
    });
  }

  // 로그?�한 ?�용?�의 UI ?�데?�트
  function updateUIForLoggedInUser(user) {
    console.log("?�용??UI ?�데?�트:", user.displayName, user.email);

    if (displayNameInput) {
      displayNameInput.value = user.displayName || "";
      console.log("?�름 ?�드 ?�데?�트:", user.displayName);
    }

    if (emailInput) {
      emailInput.value = user.email || "";
      console.log("?�메???�드 ?�데?�트:", user.email);
    }

    updateProviderStatus();
  }

  // ?�공???�결 ?�태 ?�데?�트
  function updateProviderStatus() {
    const user = auth.currentUser;
    if (!user) return;

    const providers = user.providerData.map((provider) => provider.providerId);
    console.log("?�용???�공??", providers);

    // Google ?�태 ?�데?�트
    if (googleStatus && googleConnect && googleDisconnect) {
      if (providers.includes("google.com")) {
        googleStatus.textContent = "?�결??;
        googleStatus.classList.add("connected");
        googleConnect.classList.add("hidden");
        googleDisconnect.classList.remove("hidden");
      } else {
        googleStatus.textContent = "?�결?��? ?�음";
        googleStatus.classList.remove("connected");
        googleConnect.classList.remove("hidden");
        googleDisconnect.classList.add("hidden");
      }
    }

    // GitHub ?�태 ?�데?�트
    if (githubStatus && githubConnect && githubDisconnect) {
      if (providers.includes("github.com")) {
        githubStatus.textContent = "?�결??;
        githubStatus.classList.add("connected");
        githubConnect.classList.add("hidden");
        githubDisconnect.classList.remove("hidden");
      } else {
        githubStatus.textContent = "?�결?��? ?�음";
        githubStatus.classList.remove("connected");
        githubConnect.classList.remove("hidden");
        githubDisconnect.classList.add("hidden");
      }
    }
  }

  console.log("?�로???�이지 초기???�료");
});
