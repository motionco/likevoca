import { auth, db } from "../../js/firebase/firebase-init.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
import {
  doc,
  collection,
  setDoc,
  getDocs,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

// 네비게이션바 로드 함수가 준비될 때까지 기다리는 함수
function waitForNavbarFunction() {
  return new Promise((resolve) => {
    const checkFunction = () => {
      if (typeof window.loadNavbar === "function") {
        resolve();
      } else {
        setTimeout(checkFunction, 100);
      }
    };
    checkFunction();
  });
}

// 프로필 드롭다운 이벤트를 수동으로 설정하는 함수
function setupProfileDropdownEvents() {
  console.log("🔧 프로필 드롭다운 이벤트 수동 설정 시작");

  const avatarContainer = document.getElementById("avatar-container");
  const profileDropdown = document.getElementById("profile-dropdown");

  console.log("🔍 요소 확인:", {
    avatarContainer: !!avatarContainer,
    profileDropdown: !!profileDropdown,
  });

  if (avatarContainer && profileDropdown) {
    // 기존 이벤트 리스너 제거 (중복 방지)
    avatarContainer.replaceWith(avatarContainer.cloneNode(true));
    const newAvatarContainer = document.getElementById("avatar-container");

    newAvatarContainer.addEventListener("click", (e) => {
      console.log("🖱️ 프로필 아바타 클릭됨");
      e.stopPropagation();
      profileDropdown.classList.toggle("hidden");
      console.log(
        "📋 드롭다운 상태:",
        profileDropdown.classList.contains("hidden") ? "숨김" : "표시"
      );
    });

    // 드롭다운 외부 클릭 시 닫기
    document.addEventListener("click", (event) => {
      const userProfile = document.getElementById("user-profile");
      if (userProfile && !userProfile.contains(event.target)) {
        profileDropdown.classList.add("hidden");
      }
    });

    console.log("✅ 프로필 드롭다운 이벤트 설정 완료");
  } else {
    console.error("❌ 프로필 드롭다운 요소를 찾을 수 없습니다");
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  try {
    console.log("📄 문의하기 페이지 초기화 시작");

    // 네비게이션바 로드 함수가 준비될 때까지 기다림
    await waitForNavbarFunction();

    // 네비게이션바 로드
    if (typeof window.loadNavbar === "function") {
      await window.loadNavbar();
      console.log("✅ 네비게이션바 로드 완료");

      // 네비게이션바 로드 후 잠시 대기 (DOM 업데이트 시간)
      setTimeout(() => {
        setupProfileDropdownEvents();
      }, 500);
    }
  } catch (error) {
    console.error("❌ 네비게이션바 로드 중 오류:", error);
  }

  onAuthStateChanged(auth, async (user) => {
    console.log(
      "🔐 인증 상태 변경:",
      user ? `로그인됨 (${user.email})` : "로그아웃됨"
    );

    if (user) {
      document.getElementById("name").value = user.email;

      // 네비게이션바 인증 상태 업데이트
      if (typeof window.updateNavbarForAuthState === "function") {
        window.updateNavbarForAuthState(user);

        // 인증 상태 업데이트 후 프로필 드롭다운 이벤트 재설정
        setTimeout(() => {
          setupProfileDropdownEvents();
        }, 300);
      }
    } else {
      alert("로그인 후 이용해주세요.");
      if (typeof window.redirectToLogin === "function") {
        window.redirectToLogin();
      }

      // 네비게이션바 인증 상태 업데이트
      if (typeof window.updateNavbarForAuthState === "function") {
        window.updateNavbarForAuthState(null);
      }
    }
  });

  const inquiryForm = document.getElementById("inquiry-form");
  inquiryForm.addEventListener("submit", async (event) => {
    event.preventDefault(); // 폼 기본 제출 동작 방지

    const user = auth.currentUser;
    if (!user) {
      console.log("❌ 사용자가 로그인되지 않았습니다.");
      alert("로그인이 필요합니다.");
      if (typeof window.redirectToLogin === "function") {
        window.redirectToLogin();
      }
      return;
    }

    const title = document.getElementById("title").value.trim();
    const message = document.getElementById("message").value.trim();

    if (!title || !message) {
      alert("모든 필드를 입력해주세요.");
      return;
    }

    try {
      console.log("📝 문의 등록 시작:", { title, message, email: user.email });

      const inquirySnapshot = await getDocs(collection(db, "inquiries"));
      const newInquiryId = inquirySnapshot.size + 1;

      const inquiryData = {
        id: user.uid,
        email: user.email,
        title: title,
        message: message,
        timestamp: serverTimestamp(),
        status: "접수 완료",
      };

      await setDoc(doc(db, "inquiries", newInquiryId.toString()), inquiryData);

      console.log("✅ 문의 등록 성공:", inquiryData);
      alert(`문의가 성공적으로 등록되었습니다. (문의번호: ${newInquiryId})`);

      // 폼 리셋
      inquiryForm.reset();

      // URL에서 파라미터 제거
      const url = new URL(window.location);
      url.search = "";
      window.history.replaceState({}, document.title, url.toString());
    } catch (error) {
      console.error("❌ 문의 등록 중 에러가 발생:", error);
      alert("문의 등록에 실패했습니다. 다시 시도해주세요.");
    }
  });
});
