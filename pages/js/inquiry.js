import { auth, db } from "../../js/firebase/firebase-init.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
import {
  doc,
  collection,
  setDoc,
  getDocs,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", async () => {
  try {
    // 네비게이션바 로드
    if (typeof window.loadNavbar === 'function') {
      await window.loadNavbar();
    }
    
    // Footer 로드
    if (typeof window.loadFooter === 'function') {
      await window.loadFooter();
    }
    
    // navbar.js가 일반 스크립트로 로드되므로 자동으로 초기화됨
    // 별도의 네비게이션바 로딩 로직 불필요
  } catch (error) {
    console.error("❌ 페이지 초기화 중 오류:", error);
  }

  onAuthStateChanged(auth, async (user) => {
    const nameField = document.getElementById("name");
    
    if (user) {
      nameField.value = user.email;
      // 로그인한 사용자는 이메일 필드를 읽기 전용으로 설정
      nameField.readOnly = true;
      nameField.className = "w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600";
    } else {
      // 로그인하지 않은 사용자도 문의하기 페이지 접근 가능
      // 이메일 필드를 편집 가능하게 설정
      nameField.readOnly = false;
      nameField.className = "w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500";
      nameField.placeholder = getEmailPlaceholder();
    }
  });

  // 언어별 이메일 플레이스홀더 함수
  function getEmailPlaceholder() {
    const lang = localStorage.getItem("userLanguage") || "ko";
    const placeholders = {
      ko: "이메일 주소를 입력해주세요",
      en: "Please enter your email address", 
      zh: "请输入您的邮箱地址",
      ja: "メールアドレスを入力してください",
      es: "Por favor ingrese su dirección de correo electrónico"
    };
    return placeholders[lang] || placeholders.ko;
  }

  const inquiryForm = document.getElementById("inquiry-form");
  inquiryForm.addEventListener("submit", async (event) => {
    event.preventDefault(); // 폼 기본 제출 동작 방지

    const user = auth.currentUser;
    const email = document.getElementById("name").value.trim();
    const title = document.getElementById("title").value.trim();
    const message = document.getElementById("message").value.trim();

    if (!email || !title || !message) {
      alert("모든 필드를 입력해주세요.");
      return;
    }

    // 이메일 형식 검증 (로그인하지 않은 사용자용)
    if (!user) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        alert("올바른 이메일 형식을 입력해주세요.");
        return;
      }
    }

    try {
      const inquirySnapshot = await getDocs(collection(db, "inquiries"));
      const newInquiryId = inquirySnapshot.size + 1;

      const inquiryData = {
        id: user ? user.uid : `guest_${Date.now()}`, // 비로그인 사용자용 ID
        email: user ? user.email : email,
        title: title,
        message: message,
        timestamp: serverTimestamp(),
        status: "접수 완료",
        isGuest: !user // 게스트 사용자 표시
      };

      await setDoc(doc(db, "inquiries", newInquiryId.toString()), inquiryData);

      alert(`문의가 성공적으로 등록되었습니다. (문의번호: ${newInquiryId})`);

      // 폼 리셋
      inquiryForm.reset();
      
      // 로그인하지 않은 사용자의 경우 이메일 필드 플레이스홀더 재설정
      if (!user) {
        const nameField = document.getElementById("name");
        nameField.placeholder = getEmailPlaceholder();
      }

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
