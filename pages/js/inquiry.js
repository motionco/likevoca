import { auth, db } from "../../js/firebase/firebase-init.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
import {
  doc,
  collection,
  setDoc,
  getDocs,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  // 네비게이션바 로드 (window.loadNavbar 사용)
  if (typeof window.loadNavbar === "function") {
    window.loadNavbar();
  }

  onAuthStateChanged(auth, async (user) => {
    if (user) {
      document.getElementById("name").value = user.email;
    } else {
      alert("로그인 후 이용해주세요.");
      if (typeof window.redirectToLogin === "function") {
        window.redirectToLogin();
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
