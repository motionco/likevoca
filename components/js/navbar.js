import { auth } from "../../js/firebase/firebase-init.js";
import {
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
import { deleteAccount } from "../../js/firebase/firebase-auth.js";

export async function loadNavbar() {
  try {
    const response = await fetch("../components/navbar.html");
    const html = await response.text();
    document.getElementById("navbar-container").innerHTML = html;

    initializeNavbar();

    // Firebase 초기화 완료 이벤트를 기다림
    window.addEventListener("firebase-initialized", () => {
      console.log("Firebase 초기화 완료, Auth 리스너 설정");
      initializeAuthStateListener();
    });

    // 이미 초기화되어 있을 수도 있으므로 바로 시도
    if (auth) {
      initializeAuthStateListener();
    }
  } catch (error) {
    console.error("Navbar 로드 실패: ", error);
  }
}

function initializeNavbar() {
  const menuToggle = document.getElementById("menu-toggle");
  const mobileMenu = document.getElementById("mobile-menu");
  const avatar = document.getElementById("avatar");
  const profileDropdown = document.getElementById("profile-dropdown");

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener("click", () => {
      mobileMenu.classList.toggle("hidden");
    });
  }

  if (avatar && profileDropdown) {
    avatar.addEventListener("click", (e) => {
      e.stopPropagation();
      profileDropdown.classList.toggle("hidden");
    });

    document.addEventListener("click", () => {
      if (!profileDropdown.classList.contains("hidden")) {
        profileDropdown.classList.add("hidden");
      }
    });

    profileDropdown.addEventListener("click", (e) => {
      e.stopPropagation();
    });
  }

  const logoutButton = document.getElementById("logout-button");
  const mobileLogoutButton = document.getElementById("mobile-logout-button");

  if (logoutButton) {
    logoutButton.addEventListener("click", handleLogout);
  }

  if (mobileLogoutButton) {
    mobileLogoutButton.addEventListener("click", handleLogout);
  }

  const deleteAccountButton = document.getElementById("delete-account-button");
  const mobileDeleteAccountButton = document.getElementById(
    "mobile-delete-account-button"
  );

  if (deleteAccountButton) {
    deleteAccountButton.addEventListener("click", handleDeleteAccount);
  }

  if (mobileDeleteAccountButton) {
    mobileDeleteAccountButton.addEventListener("click", handleDeleteAccount);
  }
}

function handleLogout() {
  if (!auth) {
    console.error("Firebase 인증이 초기화되지 않았습니다.");
    alert("로그아웃에 실패했습니다. 페이지를 새로고침한 후 다시 시도해주세요.");
    return;
  }

  signOut(auth)
    .then(() => {
      alert("로그아웃이 완료되었습니다.");
      window.location.reload();
    })
    .catch((error) => {
      alert("로그아웃에 실패했습니다.");
      console.error("로그아웃 오류: ", error);
    });
}

async function handleDeleteAccount() {
  if (!auth) {
    console.error("Firebase 인증이 초기화되지 않았습니다.");
    alert("회원탈퇴에 실패했습니다. 페이지를 새로고침한 후 다시 시도해주세요.");
    return;
  }

  const confirmed = confirm(
    "정말로 회원탈퇴를 하시겠습니까? 이 작업은 되돌릴 수 없습니다."
  );
  if (confirmed) {
    try {
      await deleteAccount();
      alert("회원탈퇴가 완료되었습니다.");
    } catch (error) {
      alert(error.message || "회원탈퇴 중 오류가 발생했습니다.");
    }
  }
}

function initializeAuthStateListener() {
  if (!auth) {
    console.warn(
      "Firebase 인증이 초기화되지 않아 인증 상태 리스너를 설정할 수 없습니다."
    );
    return;
  }

  try {
    onAuthStateChanged(auth, (user) => {
      const mobileLoginButtons = document.getElementById(
        "mobile-login-buttons"
      );
      const userProfile = document.getElementById("user-profile");
      const mobileUserProfile = document.getElementById("mobile-user-profile");
      const avatar = document.getElementById("avatar");

      if (!mobileLoginButtons || !userProfile || !mobileUserProfile || !avatar)
        return;

      if (user) {
        document
          .querySelectorAll("#login-button, #signup-button")
          .forEach((el) => el.classList.add("hidden"));
        mobileLoginButtons.classList.add("hidden");
        userProfile.classList.remove("hidden");
        mobileUserProfile.classList.remove("hidden");

        const userName = user.displayName || "사용자";
        document.getElementById(
          "user-name"
        ).textContent = `환영합니다, ${userName}님`;
        document.getElementById(
          "mobile-user-name"
        ).textContent = `환영합니다, ${userName}님`;

        const avatarURL =
          user.photoURL || "https://www.w3schools.com/howto/img_avatar.png";
        avatar.innerHTML = `<img src="${avatarURL}" class="w-10 h-10 rounded-full" alt="프로필 사진">`;
      } else {
        document
          .querySelectorAll("#login-button, #signup-button")
          .forEach((el) => el.classList.remove("hidden"));
        mobileLoginButtons.classList.remove("hidden");
        userProfile.classList.add("hidden");
        mobileUserProfile.classList.add("hidden");
      }
    });
  } catch (error) {
    console.error("인증 상태 리스너 설정 중 오류:", error);
  }
}
