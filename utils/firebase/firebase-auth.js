import { auth, db } from "../../js/firebase/firebase-init.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  GithubAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
  signOut,
  deleteUser,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
  EmailAuthProvider,
  fetchSignInMethodsForEmail,
  linkWithPopup,
  linkWithCredential,
  linkWithRedirect,
  unlink,
  signInWithCredential,
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
import {
  doc,
  setDoc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

// 다국어 지원 메시지
const getLocalizedMessage = () => {
  const lang = navigator.language.toLowerCase();
  
  const messages = {
    'ko': {
      accountLinkFailed: '⚠️ 계정 연결 불가',
      alreadyInUse: '선택하신 {provider} 계정({email})은 이미 다른 사용자 계정에서 사용 중입니다.',
      alreadyInUseNoEmail: '선택하신 {provider} 계정은 이미 다른 사용자 계정에서 사용 중입니다.',
      solutions: '📌 해결 방법:',
      useAnotherAccount: '• 다른 {provider} 계정을 사용해 주세요',
      loginDirectly: '• 또는 해당 {provider} 계정으로 직접 로그인해 주세요',
      securityNote: '💡 참고: 보안상 하나의 이메일은 하나의 계정에만 연결할 수 있습니다.',
      alreadyLinked: '{provider} 계정이 이미 연결되어 있습니다.',
      popupClosed: '팝업이 닫혔습니다. 다시 시도해주세요.',
      popupBlocked: '팝업이 차단되었습니다. 팝업 차단을 해제하고 다시 시도해주세요.',
      linkFailedGeneric: '{provider} 계정 연결에 실패했습니다: {message}'
    },
    'en': {
      accountLinkFailed: '⚠️ Account Link Failed',
      alreadyInUse: 'The selected {provider} account ({email}) is already in use by another user account.',
      alreadyInUseNoEmail: 'The selected {provider} account is already in use by another user account.',
      solutions: '📌 Solutions:',
      useAnotherAccount: '• Please use a different {provider} account',
      loginDirectly: '• Or log in directly with that {provider} account',
      securityNote: '💡 Note: For security reasons, one email can only be linked to one account.',
      alreadyLinked: '{provider} account is already linked.',
      popupClosed: 'Popup was closed. Please try again.',
      popupBlocked: 'Popup was blocked. Please disable popup blocker and try again.',
      linkFailedGeneric: '{provider} account linking failed: {message}'
    },
    'zh': {
      accountLinkFailed: '⚠️ 账户关联失败',
      alreadyInUse: '所选的 {provider} 账户 ({email}) 已被其他用户账户使用。',
      alreadyInUseNoEmail: '所选的 {provider} 账户已被其他用户账户使用。',
      solutions: '📌 解决方案：',
      useAnotherAccount: '• 请使用其他 {provider} 账户',
      loginDirectly: '• 或直接使用该 {provider} 账户登录',
      securityNote: '💡 注意：出于安全考虑，一个邮箱只能关联一个账户。',
      alreadyLinked: '{provider} 账户已经关联。',
      popupClosed: '弹窗已关闭。请重试。',
      popupBlocked: '弹窗被阻止。请禁用弹窗阻止器后重试。',
      linkFailedGeneric: '{provider} 账户关联失败：{message}'
    },
    'ja': {
      accountLinkFailed: '⚠️ アカウント連携失敗',
      alreadyInUse: '選択された {provider} アカウント ({email}) は既に他のユーザーアカウントで使用されています。',
      alreadyInUseNoEmail: '選択された {provider} アカウントは既に他のユーザーアカウントで使用されています。',
      solutions: '📌 解決方法：',
      useAnotherAccount: '• 別の {provider} アカウントをご使用ください',
      loginDirectly: '• またはその {provider} アカウントで直接ログインしてください',
      securityNote: '💡 注意：セキュリティ上、1つのメールアドレスは1つのアカウントにのみ連携できます。',
      alreadyLinked: '{provider} アカウントは既に連携されています。',
      popupClosed: 'ポップアップが閉じられました。再試行してください。',
      popupBlocked: 'ポップアップがブロックされました。ポップアップブロッカーを無効にして再試行してください。',
      linkFailedGeneric: '{provider} アカウント連携に失敗しました：{message}'
    },
    'es': {
      accountLinkFailed: '⚠️ Error al Vincular Cuenta',
      alreadyInUse: 'La cuenta de {provider} seleccionada ({email}) ya está siendo utilizada por otra cuenta de usuario.',
      alreadyInUseNoEmail: 'La cuenta de {provider} seleccionada ya está siendo utilizada por otra cuenta de usuario.',
      solutions: '📌 Soluciones:',
      useAnotherAccount: '• Por favor use una cuenta de {provider} diferente',
      loginDirectly: '• O inicie sesión directamente con esa cuenta de {provider}',
      securityNote: '💡 Nota: Por razones de seguridad, un email solo puede estar vinculado a una cuenta.',
      alreadyLinked: 'La cuenta de {provider} ya está vinculada.',
      popupClosed: 'La ventana emergente se cerró. Inténtelo de nuevo.',
      popupBlocked: 'La ventana emergente fue bloqueada. Desactive el bloqueador de ventanas emergentes e inténtelo de nuevo.',
      linkFailedGeneric: 'Error al vincular cuenta de {provider}: {message}'
    }
  };

  // 언어 코드에서 기본 언어 추출 (예: ko-KR -> ko)
  const baseLang = lang.split('-')[0];
  
  return messages[baseLang] || messages['en']; // 기본값은 영어
};

// 메시지 템플릿 처리 함수
const formatMessage = (template, params = {}) => {
  return template.replace(/\{(\w+)\}/g, (match, key) => params[key] || match);
};

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
    provider.addScope("email");
    provider.addScope("profile");

    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    await saveUserData(user);

    // GitHub 자격 증명이 대기 중인지 확인
    const pendingGithubCredentialJson = sessionStorage.getItem(
      "pendingGithubCredential"
    );
    if (pendingGithubCredentialJson) {
      try {
        const pendingCredential = JSON.parse(pendingGithubCredentialJson);
        const githubAuthCredential = GithubAuthProvider.credential(
          pendingCredential.oauthAccessToken
        );

        // GitHub 계정 연결
        await linkWithCredential(user, githubAuthCredential);
        alert("GitHub 계정이 성공적으로 연결되었습니다!");

        // 세션 스토리지 정리
        sessionStorage.removeItem("pendingGithubCredential");
        sessionStorage.removeItem("githubLoginEmail");
      } catch (linkError) {
        console.error("GitHub 계정 연결 오류:", linkError);

        if (
          linkError.code === "auth/credential-already-in-use" ||
          linkError.code === "auth/provider-already-linked"
        ) {
          alert("이 GitHub 계정은 이미 다른 계정에 연결되어 있습니다.");
        } else {
          alert(`GitHub 계정 연결에 실패했습니다: ${linkError.message}`);
        }

        // 세션 스토리지 정리
        sessionStorage.removeItem("pendingGithubCredential");
        sessionStorage.removeItem("githubLoginEmail");
      }
    }

    // Facebook 자격 증명이 대기 중인지 확인
    const pendingFacebookCredentialJson = sessionStorage.getItem(
      "pendingFacebookCredential"
    );
    if (pendingFacebookCredentialJson) {
      try {
        const pendingCredential = JSON.parse(pendingFacebookCredentialJson);
        const facebookAuthCredential = FacebookAuthProvider.credential(
          pendingCredential.accessToken
        );

        // Facebook 계정 연결
        await linkWithCredential(user, facebookAuthCredential);
        alert("Facebook 계정이 성공적으로 연결되었습니다!");

        // 세션 스토리지 정리
        sessionStorage.removeItem("pendingFacebookCredential");
        sessionStorage.removeItem("facebookLoginEmail");
      } catch (linkError) {
        console.error("Facebook 계정 연결 오류:", linkError);

        if (
          linkError.code === "auth/credential-already-in-use" ||
          linkError.code === "auth/provider-already-linked"
        ) {
          alert("이 Facebook 계정은 이미 다른 계정에 연결되어 있습니다.");
        } else {
          alert(`Facebook 계정 연결에 실패했습니다: ${linkError.message}`);
        }

        // 세션 스토리지 정리
        sessionStorage.removeItem("pendingFacebookCredential");
        sessionStorage.removeItem("facebookLoginEmail");
      }
    }

    return user;
  } catch (error) {
    console.error("Google 로그인 오류:", error);

    if (error.code === "auth/account-exists-with-different-credential") {
      // 같은 이메일을 사용하는 다른 인증 방법으로 이미 계정이 있는 경우
      try {
        // 해당 이메일로 기존에 가입한 방법 확인
        const email = error.customData.email;
        alert(
          `이 이메일(${email})은 이미 다른 로그인 방법으로 가입되어 있습니다. 이전에 사용하신 로그인 방법을 사용해 주세요.`
        );

        // 첫 번째 로그인 방법 제안
        const methods = await fetchSignInMethodsForEmail(auth, email);
        if (methods && methods.length > 0) {
          const firstMethod = methods[0];
          if (firstMethod === "github.com") {
            alert("GitHub 계정으로 로그인해 주세요.");
          } else if (firstMethod === "password") {
            alert("이메일/비밀번호로 로그인해 주세요.");
          }
        }
      } catch (innerError) {
        console.error("로그인 방법 확인 오류:", innerError);
      }

      throw new Error(
        "이미 다른 로그인 방법으로 가입된 이메일입니다. 다른 로그인 방법을 시도해 주세요."
      );
    } else if (error.code === "auth/popup-closed-by-user") {
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

    // Facebook 자격 증명이 대기 중인지 확인
    const pendingFacebookCredentialJson = sessionStorage.getItem(
      "pendingFacebookCredential"
    );
    if (pendingFacebookCredentialJson) {
      try {
        const pendingCredential = JSON.parse(pendingFacebookCredentialJson);
        const facebookAuthCredential = FacebookAuthProvider.credential(
          pendingCredential.accessToken
        );

        // Facebook 계정 연결
        await linkWithCredential(user, facebookAuthCredential);
        alert("Facebook 계정이 성공적으로 연결되었습니다!");

        // 세션 스토리지 정리
        sessionStorage.removeItem("pendingFacebookCredential");
        sessionStorage.removeItem("facebookLoginEmail");
      } catch (linkError) {
        console.error("Facebook 계정 연결 오류:", linkError);

        if (
          linkError.code === "auth/credential-already-in-use" ||
          linkError.code === "auth/provider-already-linked"
        ) {
          alert("이 Facebook 계정은 이미 다른 계정에 연결되어 있습니다.");
        } else {
          alert(`Facebook 계정 연결에 실패했습니다: ${linkError.message}`);
        }

        // 세션 스토리지 정리
        sessionStorage.removeItem("pendingFacebookCredential");
        sessionStorage.removeItem("facebookLoginEmail");
      }
    }

    return user;
  } catch (error) {
    console.error("Github 로그인 오류:", error);

    // GitHub API 속도 제한 오류 감지
    if (
      error.message &&
      error.message.includes("exceeded a secondary rate limit")
    ) {
      throw new Error(
        "GitHub 로그인 속도 제한에 도달했습니다. 잠시 후 다시 시도하거나 다른 로그인 방법을 사용하세요."
      );
    }

    if (error.code === "auth/account-exists-with-different-credential") {
      // 이메일 정보 추출
      const email = error.customData?.email;
      const pendingCredential = GithubAuthProvider.credentialFromError(error);

      if (email && pendingCredential) {
        try {
          // 사용자에게 메시지 표시 및 선택지 제공
          const manualLoginMessage =
            `이메일 ${email}은 이미 다른 방법으로 가입되어 있습니다.\n\n` +
            `선택 옵션:\n` +
            `1. Google로 로그인 후 GitHub 계정 연결\n` +
            `2. 기존 방법으로 로그인`;

          const loginChoice = confirm(manualLoginMessage);

          if (loginChoice) {
            // Google 로그인 페이지로 리다이렉트
            sessionStorage.setItem(
              "pendingGithubCredential",
              JSON.stringify(pendingCredential)
            );
            sessionStorage.setItem("githubLoginEmail", email);

            alert(
              "Google 로그인 페이지로 이동합니다. 로그인 후 GitHub 계정을 연결할 수 있습니다."
            );

            // Google 로그인 버튼 클릭 이벤트 트리거
            const googleLoginBtn = document.getElementById("google-login-btn");
            if (googleLoginBtn) {
              googleLoginBtn.click();
              return null; // 반환 값 없음 - 다른 흐름으로 처리함
            } else {
              throw new Error(
                "Google 로그인 버튼을 찾을 수 없습니다. 직접 Google 로그인을 시도해주세요."
              );
            }
          } else {
            throw new Error("기존 로그인 방법을 사용해주세요.");
          }
        } catch (innerError) {
          console.error("로그인 방법 확인 오류:", innerError);
          alert(`로그인 확인 중 오류가 발생했습니다: ${innerError.message}`);
          throw new Error(
            "인증 과정에서 오류가 발생했습니다. 다른 로그인 방법을 시도해주세요."
          );
        }
      }

      throw new Error(
        "이미 다른 로그인 방법으로 가입된 이메일입니다. 다른 로그인 방법을 시도해주세요."
      );
    } else if (error.code === "auth/popup-closed-by-user") {
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
      throw new Error(
        "로그인 요청이 취소되었습니다. 새로고침 후 다시 시도해주세요."
      );
    } else {
      throw new Error(
        `깃허브 로그인에 실패했습니다(${error.code}). 다시 시도해주세요`
      );
    }
  }
};

export const facebookLogin = async () => {
  checkFirebaseInitialized();

  try {
    const provider = new FacebookAuthProvider();
    provider.setCustomParameters({
      prompt: "select_account",
    });
    provider.addScope("email");
    provider.addScope("public_profile");

    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    await saveUserData(user);

    // GitHub 자격 증명이 대기 중인지 확인 (Google 로그인과 유사한 로직)
    const pendingCredentialJson = sessionStorage.getItem(
      "pendingGithubCredential"
    );
    if (pendingCredentialJson) {
      try {
        const pendingCredential = JSON.parse(pendingCredentialJson);
        const githubAuthCredential = GithubAuthProvider.credential(
          pendingCredential.oauthAccessToken
        );

        // GitHub 계정 연결
        await linkWithCredential(user, githubAuthCredential);
        alert("GitHub 계정이 성공적으로 연결되었습니다!");

        // 세션 스토리지 정리
        sessionStorage.removeItem("pendingGithubCredential");
        sessionStorage.removeItem("githubLoginEmail");
      } catch (linkError) {
        console.error("GitHub 계정 연결 오류:", linkError);

        if (
          linkError.code === "auth/credential-already-in-use" ||
          linkError.code === "auth/provider-already-linked"
        ) {
          alert("이 GitHub 계정은 이미 다른 계정에 연결되어 있습니다.");
        } else {
          alert(`GitHub 계정 연결에 실패했습니다: ${linkError.message}`);
        }

        // 세션 스토리지 정리
        sessionStorage.removeItem("pendingGithubCredential");
        sessionStorage.removeItem("githubLoginEmail");
      }
    }

    return user;
  } catch (error) {
    console.error("Facebook 로그인 오류:", error);

    if (error.code === "auth/account-exists-with-different-credential") {
      // 이메일 정보 추출
      const email = error.customData?.email;
      const pendingCredential = FacebookAuthProvider.credentialFromError(error);

      if (email && pendingCredential) {
        try {
          // 해당 이메일로 기존에 가입한 방법 확인
          const methods = await fetchSignInMethodsForEmail(auth, email);
          let existingMethodText = "다른 로그인 방법";
          
          if (methods && methods.length > 0) {
            const firstMethod = methods[0];
            if (firstMethod === "google.com") {
              existingMethodText = "Google 계정";
            } else if (firstMethod === "github.com") {
              existingMethodText = "GitHub 계정";
            } else if (firstMethod === "password") {
              existingMethodText = "이메일/비밀번호";
            }
          }

          // 사용자에게 메시지 표시 및 선택지 제공
          const manualLoginMessage =
            `이메일 ${email}은 이미 ${existingMethodText}으로 가입되어 있습니다.\n\n` +
            `선택 옵션:\n` +
            `1. ${existingMethodText}으로 로그인 후 Facebook 계정 연결\n` +
            `2. 기존 방법으로 로그인`;

          // Facebook 자격 증명을 세션에 저장 (직렬화 가능한 형태로)
          sessionStorage.setItem(
            "pendingFacebookCredential",
            JSON.stringify({
              accessToken: pendingCredential.accessToken,
              providerId: pendingCredential.providerId
            })
          );
          sessionStorage.setItem("facebookLoginEmail", email);

          // 사용자에게 안내 메시지 표시
          alert(
            `이메일 ${email}은 이미 ${existingMethodText}으로 가입되어 있습니다.\n\n` +
            `${existingMethodText} 버튼을 클릭하여 로그인하시면, Facebook 계정이 자동으로 연결됩니다.`
          );

          // Facebook 로그인 버튼 비활성화하고 메시지 표시
          const facebookBtn = document.getElementById("facebook-login-btn");
          if (facebookBtn) {
            facebookBtn.disabled = true;
            facebookBtn.innerHTML = `${existingMethodText}으로 로그인해주세요`;
            facebookBtn.style.backgroundColor = "#ccc";
            facebookBtn.style.cursor = "not-allowed";
          }

          // 해당 로그인 방법 버튼 강조
          if (methods && methods.length > 0) {
            const firstMethod = methods[0];
            let loginBtnId = null;
            
            if (firstMethod === "google.com") {
              loginBtnId = "google-login-btn";
            } else if (firstMethod === "github.com") {
              loginBtnId = "github-login-btn";
            }
            
            if (loginBtnId) {
              const loginBtn = document.getElementById(loginBtnId);
              if (loginBtn) {
                // 버튼 강조 효과
                loginBtn.style.animation = "pulse 2s infinite";
                loginBtn.style.boxShadow = "0 0 20px #007bff";
                
                // CSS 애니메이션 추가
                const style = document.createElement('style');
                style.textContent = `
                  @keyframes pulse {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                    100% { transform: scale(1); }
                  }
                `;
                document.head.appendChild(style);
              }
            }
          }

          throw new Error(`${existingMethodText}으로 로그인한 후 Facebook 계정을 연결할 수 있습니다.`);
        } catch (innerError) {
          console.error("로그인 방법 확인 오류:", innerError);
          throw new Error("기존 로그인 방법을 사용해주세요.");
        }
      }

      throw new Error(
        "이미 다른 로그인 방법으로 가입된 이메일입니다. 다른 로그인 방법을 시도해주세요."
      );
    } else if (error.code === "auth/popup-closed-by-user") {
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
        `페이스북 로그인에 실패했습니다(${error.code}). 다시 시도해주세요`
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

/**
 * 로그아웃 함수
 */
export const logout = async () => {
  checkFirebaseInitialized();
  return signOut(auth);
};

/**
 * 계정 삭제 함수
 */
export const deleteAccount = async () => {
  checkFirebaseInitialized();
  const user = auth.currentUser;
  if (!user) {
    throw new Error("로그인된 사용자가 없습니다");
  }
  return user.delete();
};

/**
 * Google 계정 연결 함수
 */
export const linkGoogleAccount = async () => {
  checkFirebaseInitialized();
  const provider = new GoogleAuthProvider();
  const user = auth.currentUser;

  if (!user) {
    throw new Error("로그인된 사용자가 없습니다");
  }

  try {
    // 모바일에서는 redirect, 데스크톱에서는 팝업 사용
    if (isMobileDevice()) {
      return linkWithRedirect(user, provider);
    } else {
      return linkWithPopup(user, provider);
    }
  } catch (error) {
    console.error("Google 계정 연결 실패:", error);
    
    const msg = getLocalizedMessage();
    
    if (error.code === "auth/credential-already-in-use") {
      // 해당 구글 계정이 이미 다른 Firebase 계정에 연결되어 있는 경우
      const email = error.customData?.email;
      if (email) {
        const message = 
          `${msg.accountLinkFailed}\n\n` +
          `${formatMessage(msg.alreadyInUse, {provider: 'Google', email})}\n\n` +
          `${msg.solutions}\n` +
          `${formatMessage(msg.useAnotherAccount, {provider: 'Google'})}\n` +
          `${formatMessage(msg.loginDirectly, {provider: 'Google'})}\n\n` +
          `${msg.securityNote}`;
        throw new Error(message);
      } else {
        const message = 
          `${msg.accountLinkFailed}\n\n` +
          `${formatMessage(msg.alreadyInUseNoEmail, {provider: 'Google'})}\n\n` +
          `${formatMessage(msg.useAnotherAccount, {provider: 'Google'})}\n\n` +
          `${msg.securityNote}`;
        throw new Error(message);
      }
    } else if (error.code === "auth/provider-already-linked") {
      throw new Error(formatMessage(msg.alreadyLinked, {provider: 'Google'}));
    } else if (error.code === "auth/popup-closed-by-user") {
      throw new Error(msg.popupClosed);
    } else if (error.code === "auth/popup-blocked") {
      throw new Error(msg.popupBlocked);
    } else {
      throw new Error(formatMessage(msg.linkFailedGeneric, {provider: 'Google', message: error.message}));
    }
  }
};

/**
 * GitHub 계정 연결 함수
 */
export const linkGithubAccount = async () => {
  checkFirebaseInitialized();
  const provider = new GithubAuthProvider();
  const user = auth.currentUser;

  if (!user) {
    throw new Error("로그인된 사용자가 없습니다");
  }

  try {
    // 모바일에서는 redirect, 데스크톱에서는 팝업 사용
    if (isMobileDevice()) {
      return linkWithRedirect(user, provider);
    } else {
      return linkWithPopup(user, provider);
    }
  } catch (error) {
    console.error("GitHub 계정 연결 실패:", error);
    
    const msg = getLocalizedMessage();
    
    if (error.code === "auth/credential-already-in-use") {
      // 해당 GitHub 계정이 이미 다른 Firebase 계정에 연결되어 있는 경우
      const email = error.customData?.email;
      if (email) {
        const message = 
          `${msg.accountLinkFailed}\n\n` +
          `${formatMessage(msg.alreadyInUse, {provider: 'GitHub', email})}\n\n` +
          `${msg.solutions}\n` +
          `${formatMessage(msg.useAnotherAccount, {provider: 'GitHub'})}\n` +
          `${formatMessage(msg.loginDirectly, {provider: 'GitHub'})}\n\n` +
          `${msg.securityNote}`;
        throw new Error(message);
      } else {
        const message = 
          `${msg.accountLinkFailed}\n\n` +
          `${formatMessage(msg.alreadyInUseNoEmail, {provider: 'GitHub'})}\n\n` +
          `${formatMessage(msg.useAnotherAccount, {provider: 'GitHub'})}\n\n` +
          `${msg.securityNote}`;
        throw new Error(message);
      }
    } else if (error.code === "auth/provider-already-linked") {
      throw new Error(formatMessage(msg.alreadyLinked, {provider: 'GitHub'}));
    } else if (error.code === "auth/popup-closed-by-user") {
      throw new Error(msg.popupClosed);
    } else if (error.code === "auth/popup-blocked") {
      throw new Error(msg.popupBlocked);
    } else {
      throw new Error(formatMessage(msg.linkFailedGeneric, {provider: 'GitHub', message: error.message}));
    }
  }
};

/**
 * Facebook 계정 연결 함수
 */
export const linkFacebookAccount = async () => {
  checkFirebaseInitialized();
  const provider = new FacebookAuthProvider();
  const user = auth.currentUser;

  if (!user) {
    throw new Error("로그인된 사용자가 없습니다");
  }

  try {
    // 모바일에서는 redirect, 데스크톱에서는 팝업 사용
    if (isMobileDevice()) {
      return linkWithRedirect(user, provider);
    } else {
      return linkWithPopup(user, provider);
    }
  } catch (error) {
    console.error("Facebook 계정 연결 실패:", error);
    
    const msg = getLocalizedMessage();
    
    if (error.code === "auth/credential-already-in-use") {
      // 해당 Facebook 계정이 이미 다른 Firebase 계정에 연결되어 있는 경우
      const email = error.customData?.email;
      if (email) {
        const message = 
          `${msg.accountLinkFailed}\n\n` +
          `${formatMessage(msg.alreadyInUse, {provider: 'Facebook', email})}\n\n` +
          `${msg.solutions}\n` +
          `${formatMessage(msg.useAnotherAccount, {provider: 'Facebook'})}\n` +
          `${formatMessage(msg.loginDirectly, {provider: 'Facebook'})}\n\n` +
          `${msg.securityNote}`;
        throw new Error(message);
      } else {
        const message = 
          `${msg.accountLinkFailed}\n\n` +
          `${formatMessage(msg.alreadyInUseNoEmail, {provider: 'Facebook'})}\n\n` +
          `${formatMessage(msg.useAnotherAccount, {provider: 'Facebook'})}\n\n` +
          `${msg.securityNote}`;
        throw new Error(message);
      }
    } else if (error.code === "auth/provider-already-linked") {
      throw new Error(formatMessage(msg.alreadyLinked, {provider: 'Facebook'}));
    } else if (error.code === "auth/popup-closed-by-user") {
      throw new Error(msg.popupClosed);
    } else if (error.code === "auth/popup-blocked") {
      throw new Error(msg.popupBlocked);
    } else {
      throw new Error(formatMessage(msg.linkFailedGeneric, {provider: 'Facebook', message: error.message}));
    }
  }
};

/**
 * 제공자 연결 해제 함수
 * @param {string} providerId - 연결 해제할 제공자 ID (예: 'google.com', 'github.com')
 */
export const unlinkProvider = async (providerId) => {
  checkFirebaseInitialized();
  const user = auth.currentUser;

  if (!user) {
    throw new Error("로그인된 사용자가 없습니다");
  }

  // 최소한 하나의 로그인 방법은 유지해야 함
  const providers = user.providerData;
  if (providers.length <= 1) {
    throw new Error("최소한 하나의 로그인 방법은 유지해야 합니다");
  }

  return unlink(user, providerId);
};

/**
 * 모바일 기기 여부 확인
 * @returns {boolean} 모바일 기기 여부
 */
function isMobileDevice() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}
