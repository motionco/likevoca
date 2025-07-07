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
  console.log("?„ë¡œ???˜ì´ì§€ ì´ˆê¸°???œì‘");

  // DOM ?”ì†Œ ê°€?¸ì˜¤ê¸?
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

  console.log("DOM ?”ì†Œ ?•ì¸:", {
    authRequired: !!authRequired,
    profileContent: !!profileContent,
    displayNameInput: !!displayNameInput,
    emailInput: !!emailInput,
    profileForm: !!profileForm,
  });

  // ?¸ì¦ ?íƒœ ë³€ê²?ê°ì?
  onAuthStateChanged(auth, (user) => {
    console.log(
      "Auth ?íƒœ ë³€ê²?",
      user ? `ë¡œê·¸?¸ë¨ (${user.email})` : "ë¡œê·¸?„ì›ƒ??
    );

    if (user) {
      // ?¬ìš©?ê? ë¡œê·¸?¸ëœ ê²½ìš°
      if (authRequired) {
        authRequired.classList.add("hidden");
        console.log("ë¡œê·¸???„ìš” ë©”ì‹œì§€ ?¨ê?");
      }
      if (profileContent) {
        profileContent.classList.remove("hidden");
        console.log("?„ë¡œ??ì½˜í…ì¸??œì‹œ");
      }
      updateUIForLoggedInUser(user);

      // ?¤ë¹„ê²Œì´?˜ë°” ?…ë°?´íŠ¸
      if (typeof window.updateNavbarForAuthState === "function") {
        window.updateNavbarForAuthState(user);
      }
    } else {
      // ?¬ìš©?ê? ë¡œê·¸?„ì›ƒ??ê²½ìš°
      if (authRequired) {
        authRequired.classList.remove("hidden");
        console.log("ë¡œê·¸???„ìš” ë©”ì‹œì§€ ?œì‹œ");
      }
      if (profileContent) {
        profileContent.classList.add("hidden");
        console.log("?„ë¡œ??ì½˜í…ì¸??¨ê?");
      }

      // ?¤ë¹„ê²Œì´?˜ë°” ?…ë°?´íŠ¸
      if (typeof window.updateNavbarForAuthState === "function") {
        window.updateNavbarForAuthState(null);
      }
    }
  });

  // ?„ë¡œ???…ë°?´íŠ¸ ??
  if (profileForm) {
    profileForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const user = auth.currentUser;
      if (!user) return;

      const newDisplayName = displayNameInput.value.trim();
      if (!newDisplayName) {
        alert("?´ë¦„???…ë ¥?´ì£¼?¸ìš”.");
        return;
      }

      try {
        await updateProfile(user, {
          displayName: newDisplayName,
        });
        alert("?„ë¡œ?„ì´ ?…ë°?´íŠ¸?˜ì—ˆ?µë‹ˆ??");
      } catch (error) {
        console.error("?„ë¡œ???…ë°?´íŠ¸ ?¤ë¥˜:", error);
        alert(`?„ë¡œ???…ë°?´íŠ¸ ?¤íŒ¨: ${error.message}`);
      }
    });
  }

  // Google ê³„ì • ?°ê²°
  if (googleConnect) {
    googleConnect.addEventListener("click", async () => {
      try {
        await linkGoogleAccount();
        updateProviderStatus();
      } catch (error) {
        console.error("Google ê³„ì • ?°ê²° ?¤ë¥˜:", error);
        alert(`Google ê³„ì • ?°ê²° ?¤íŒ¨: ${error.message}`);
      }
    });
  }

  // Google ê³„ì • ?°ê²° ?´ì œ
  if (googleDisconnect) {
    googleDisconnect.addEventListener("click", async () => {
      if (!confirm("Google ê³„ì • ?°ê²°???´ì œ?˜ì‹œê² ìŠµ?ˆê¹Œ?")) {
        return;
      }

      try {
        await unlinkProvider("google.com");
        updateProviderStatus();
      } catch (error) {
        console.error("Google ê³„ì • ?°ê²° ?´ì œ ?¤ë¥˜:", error);
        alert(`Google ê³„ì • ?°ê²° ?´ì œ ?¤íŒ¨: ${error.message}`);
      }
    });
  }

  // GitHub ê³„ì • ?°ê²°
  if (githubConnect) {
    githubConnect.addEventListener("click", async () => {
      try {
        await linkGithubAccount();
        updateProviderStatus();
      } catch (error) {
        console.error("GitHub ê³„ì • ?°ê²° ?¤ë¥˜:", error);
        alert(`GitHub ê³„ì • ?°ê²° ?¤íŒ¨: ${error.message}`);
      }
    });
  }

  // GitHub ê³„ì • ?°ê²° ?´ì œ
  if (githubDisconnect) {
    githubDisconnect.addEventListener("click", async () => {
      if (!confirm("GitHub ê³„ì • ?°ê²°???´ì œ?˜ì‹œê² ìŠµ?ˆê¹Œ?")) {
        return;
      }

      try {
        await unlinkProvider("github.com");
        updateProviderStatus();
      } catch (error) {
        console.error("GitHub ê³„ì • ?°ê²° ?´ì œ ?¤ë¥˜:", error);
        alert(`GitHub ê³„ì • ?°ê²° ?´ì œ ?¤íŒ¨: ${error.message}`);
      }
    });
  }

  // ë¡œê·¸?„ì›ƒ ë²„íŠ¼
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
        console.error("ë¡œê·¸?„ì›ƒ ?¤ë¥˜:", error);
        alert(`ë¡œê·¸?„ì›ƒ ?¤íŒ¨: ${error.message}`);
      }
    });
  }

  // ê³„ì • ?? œ ë²„íŠ¼
  if (deleteAccountBtn) {
    deleteAccountBtn.addEventListener("click", async () => {
      if (
        !confirm("?•ë§ ê³„ì •???? œ?˜ì‹œê² ìŠµ?ˆê¹Œ? ???‘ì—…?€ ?˜ëŒë¦????†ìŠµ?ˆë‹¤.")
      ) {
        return;
      }

      try {
        await deleteAccount();
        alert("ê³„ì •???? œ?˜ì—ˆ?µë‹ˆ??");
        if (typeof window.redirectToLogin === "function") {
          window.redirectToLogin();
        } else {
          window.location.href = "login.html";
        }
      } catch (error) {
        console.error("ê³„ì • ?? œ ?¤ë¥˜:", error);
        alert(`ê³„ì • ?? œ ?¤íŒ¨: ${error.message}`);
      }
    });
  }

  // ë¡œê·¸?¸í•œ ?¬ìš©?ì˜ UI ?…ë°?´íŠ¸
  function updateUIForLoggedInUser(user) {
    console.log("?¬ìš©??UI ?…ë°?´íŠ¸:", user.displayName, user.email);

    if (displayNameInput) {
      displayNameInput.value = user.displayName || "";
      console.log("?´ë¦„ ?„ë“œ ?…ë°?´íŠ¸:", user.displayName);
    }

    if (emailInput) {
      emailInput.value = user.email || "";
      console.log("?´ë©”???„ë“œ ?…ë°?´íŠ¸:", user.email);
    }

    updateProviderStatus();
  }

  // ?œê³µ???°ê²° ?íƒœ ?…ë°?´íŠ¸
  function updateProviderStatus() {
    const user = auth.currentUser;
    if (!user) return;

    const providers = user.providerData.map((provider) => provider.providerId);
    console.log("?¬ìš©???œê³µ??", providers);

    // Google ?íƒœ ?…ë°?´íŠ¸
    if (googleStatus && googleConnect && googleDisconnect) {
      if (providers.includes("google.com")) {
        googleStatus.textContent = "?°ê²°??;
        googleStatus.classList.add("connected");
        googleConnect.classList.add("hidden");
        googleDisconnect.classList.remove("hidden");
      } else {
        googleStatus.textContent = "?°ê²°?˜ì? ?ŠìŒ";
        googleStatus.classList.remove("connected");
        googleConnect.classList.remove("hidden");
        googleDisconnect.classList.add("hidden");
      }
    }

    // GitHub ?íƒœ ?…ë°?´íŠ¸
    if (githubStatus && githubConnect && githubDisconnect) {
      if (providers.includes("github.com")) {
        githubStatus.textContent = "?°ê²°??;
        githubStatus.classList.add("connected");
        githubConnect.classList.add("hidden");
        githubDisconnect.classList.remove("hidden");
      } else {
        githubStatus.textContent = "?°ê²°?˜ì? ?ŠìŒ";
        githubStatus.classList.remove("connected");
        githubConnect.classList.remove("hidden");
        githubDisconnect.classList.add("hidden");
      }
    }
  }

  console.log("?„ë¡œ???˜ì´ì§€ ì´ˆê¸°???„ë£Œ");
});
