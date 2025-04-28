import { auth, db } from "./firebase-init.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
  signOut,
  deleteUser,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
  EmailAuthProvider,
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
import {
  doc,
  setDoc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

// Firebase가 초기화되었는지 확인하는 함수
function checkFirebaseInitialized() {
  if (!auth || !db) {
    throw new Error(
      "Firebase가 초기화되지 않았습니다. 페이지를 새로고침하고 다시 시도해주세요."
    );
  }
}

// 회원가입 함수
export const signup = async (email, password, displayName) => {
  checkFirebaseInitialized();

  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );

  await updateProfile(userCredential.user, {
    displayName: displayName,
  });

  await sendEmailVerification(userCredential.user);

  return userCredential.user;
};

// 로그인 함수
export const login = async (email, password) => {
  checkFirebaseInitialized();

  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    if (!userCredential.user.emailVerified) {
      throw new Error("이메일 인증이 필요합니다. 이메일을 확인해주세요.");
    }

    console.log("로그인 성공: ", userCredential.user);
    return userCredential.user;
  } catch (error) {
    if (error.code === "auth/invalid-credential") {
      throw new Error("이메일 또는 비밀번호가 올바르지 않습니다.");
    } else if (error.code === "auth/too-many-requests") {
      throw new Error(
        "너무 많은 로그인 시도가 있었습니다. 잠시 후 다시 시도해주세요."
      );
    } else {
      throw error;
    }
  }
};

export const resetPassword = async (email) => {
  checkFirebaseInitialized();
  await sendPasswordResetEmail(auth, email);
};

export const googleLogin = async () => {
  checkFirebaseInitialized();

  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: "select_account",
    });

    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    await saveUserData(user);

    console.log("google 로그인 성공: ", user);
    return user;
  } catch (error) {
    console.error("Google 로그인 오류:", error);

    if (error.code === "auth/popup-closed-by-user") {
      throw new Error("로그인 창이 닫혔습니다. 다시 시도해주세요.");
    } else if (error.code === "auth/network-request-failed") {
      throw new Error(
        "네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요."
      );
    } else if (error.code === "auth/popup-blocked") {
      throw new Error(
        "팝업이 차단되었습니다. 팝업 차단을 해제하고 다시 시도해주세요."
      );
    } else if (error.code === "auth/cancelled-popup-request") {
      throw new Error("로그인 요청이 취소되었습니다. 다시 시도해주세요.");
    } else {
      throw new Error(
        `구글 로그인에 실패했습니다(${error.code}). 다시 시도해주세요`
      );
    }
  }
};

export const githubLogin = async () => {
  checkFirebaseInitialized();

  try {
    const provider = new GithubAuthProvider();
    provider.setCustomParameters({
      prompt: "select_account",
    });

    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    await saveUserData(user);

    console.log("Github 로그인 성공: ", user);
    return user;
  } catch (error) {
    console.error("Github 로그인 오류:", error);

    if (error.code === "auth/popup-closed-by-user") {
      throw new Error("로그인 창이 닫혔습니다. 다시 시도해주세요.");
    } else if (error.code === "auth/network-request-failed") {
      throw new Error(
        "네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요."
      );
    } else if (error.code === "auth/popup-blocked") {
      throw new Error(
        "팝업이 차단되었습니다. 팝업 차단을 해제하고 다시 시도해주세요."
      );
    } else if (error.code === "auth/cancelled-popup-request") {
      throw new Error("로그인 요청이 취소되었습니다. 다시 시도해주세요.");
    } else {
      throw new Error(
        `깃허브 로그인에 실패했습니다(${error.code}). 다시 시도해주세요`
      );
    }
  }
};

const saveUserData = async (user) => {
  checkFirebaseInitialized();

  try {
    const userRef = doc(db, "users", user.email);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      await setDoc(userRef, {
        wordCount: 0,
        aiUsage: 0,
        maxWordCount: 50,
        maxAiUsage: 10,
      });

      console.log("사용자 데이터 생성 성공");
    } else {
      console.log("이미 firestore에 사용자 데이터가 존재합니다.");
    }
  } catch (error) {
    console.error("사용자 데이터 저장 중 오류:", error);
    // 로그인은 성공하도록 오류를 무시
  }
};

export const logout = async () => {
  checkFirebaseInitialized();

  try {
    await signOut(auth);
    console.log("로그아웃 성공");
    alert("성공적으로 로그아웃이 되었습니다.");
    window.location.href = "login.html";
  } catch (error) {
    console.error("로그아웃 실패: ", error);
    alert("로그아웃 중 오류가 발생했습니다: " + error.message);
  }
};

export const deleteAccount = async () => {
  checkFirebaseInitialized();

  try {
    const user = auth.currentUser;

    if (!user) {
      alert("로그인이 필요합니다.");
      return;
    }

    if (
      user.providerData.some((provider) => provider.providerId === "google.com")
    ) {
      const provider = new GoogleAuthProvider();
      await reauthenticateWithPopup(user, provider);
      alert("Google 사용자 재인증 성공");
    } else if (
      user.providerData.some((provider) => provider.providerId === "github.com")
    ) {
      const provider = new GithubAuthProvider();
      await reauthenticateWithPopup(user, provider);
      alert("Github 사용자 재인증 성공");
    } else {
      const email = user.email;
      const password = prompt("비밀번호를 입력하세요: ");
      if (!password) {
        alert("비밀번호를 입력해야합니다.");
        return;
      }
      const credential = EmailAuthProvider.credential(email, password);
      await reauthenticateWithCredential(user, credential);
      alert("이메일 사용자 재인증 성공");
    }

    await deleteUser(user);
    alert("계정이 성공적으로 삭제되었습니다.");
    window.location.href = "signup.html";
  } catch (error) {
    console.error("계정 삭제 오류:", error);

    if (error.code === "auth/requires-recent-login") {
      alert("최근 인증 정보가 필요합니다. 다시 로그인 후 시도해주세요.");
    } else if (error.code === "auth/popup-blocked") {
      alert("팝업이 차단되었습니다. 팝업 차단을 해제하고 다시 시도해주세요.");
    } else {
      alert(
        "계정을 삭제할 수 없습니다: " + (error.message || "알 수 없는 오류")
      );
    }
  }
};
