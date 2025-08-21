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
  // 브라우저 언어 또는 사용자 설정 언어 감지
  let lang = navigator.language.toLowerCase();
  
  // 사용자가 설정한 언어가 있다면 우선 사용
  const userLanguage = localStorage.getItem("userLanguage");
  if (userLanguage) {
    lang = userLanguage.toLowerCase();
  }
  
  const messages = {
    'ko': {
      credentialInUse: '이 {provider} 계정은 이미 다른 계정에서 사용 중입니다. 다른 {provider} 계정을 사용해주세요.',
      credentialInUseWithEmail: '이 {provider} 계정 ({email})은 이미 다른 계정에서 사용 중입니다. 다른 {provider} 계정을 사용해주세요.',
      alreadyLinked: '{provider} 계정이 이미 연결되어 있습니다.',
      popupClosed: '팝업이 닫혔습니다. 다시 시도해주세요.',
      popupBlocked: '팝업이 차단되었습니다. 팝업 차단을 해제하고 다시 시도해주세요.',
      linkFailed: '{provider} 계정 연결 중 오류가 발생했습니다.',
      emailMismatch: '연결하려는 {provider} 계정의 이메일 ({providerEmail})이 현재 계정의 이메일 ({currentEmail})과 다릅니다. 같은 이메일의 {provider} 계정을 사용해주세요.',
      emailAlreadyInUse: '이 이메일 ({email})은 이미 다른 로그인 방법으로 가입되어 있습니다. 다른 로그인 방법으로 로그인해주세요.',
      userNotFound: '이 이메일 ({email})로 가입된 회원정보가 없습니다.',
      existingProvider: '이 이메일 ({email})은 이미 {provider}으로 가입되어 있습니다. {provider}으로 로그인해주세요.',
      invalidCredential: '이메일 또는 비밀번호가 올바르지 않습니다.',
      otherLoginMethod: '다른 로그인 방법'
    },
    'en': {
      credentialInUse: 'This {provider} account is already in use by another account. Please use a different {provider} account.',
      credentialInUseWithEmail: 'This {provider} account ({email}) is already in use by another account. Please use a different {provider} account.',
      alreadyLinked: '{provider} account is already linked.',
      popupClosed: 'Popup was closed. Please try again.',
      popupBlocked: 'Popup was blocked. Please disable popup blocker and try again.',
      linkFailed: 'An error occurred while linking {provider} account.',
      emailMismatch: 'The email of the {provider} account you are trying to link ({providerEmail}) differs from your current account email ({currentEmail}). Please use a {provider} account with the same email.',
      emailAlreadyInUse: 'This email ({email}) is already registered with a different login method. Please sign in with the existing login method.',
      userNotFound: 'No account found with this email ({email}).',
      existingProvider: 'This email ({email}) is already registered with {provider}. Please sign in with {provider}.',
      invalidCredential: 'Invalid email or password.',
      otherLoginMethod: 'another login method'
    },
    'zh': {
      credentialInUse: '此 {provider} 账户已被其他账户使用。请使用其他 {provider} 账户。',
      credentialInUseWithEmail: '此 {provider} 账户 ({email}) 已被其他账户使用。请使用其他 {provider} 账户。',
      alreadyLinked: '{provider} 账户已关联。',
      popupClosed: '弹窗已关闭。请重试。',
      popupBlocked: '弹窗被阻止。请禁用弹窗阻止器后重试。',
      linkFailed: '关联 {provider} 账户时发生错误。',
      emailMismatch: '您要关联的 {provider} 账户邮箱 ({providerEmail}) 与当前账户邮箱 ({currentEmail}) 不同。请使用相同邮箱的 {provider} 账户。',
      emailAlreadyInUse: '此邮箱 ({email}) 已使用其他登录方式注册。请使用现有的登录方式登录。',
      userNotFound: '未找到此邮箱 ({email}) 的注册信息。',
      existingProvider: '此邮箱 ({email}) 已使用 {provider} 注册。请使用 {provider} 登录。',
      invalidCredential: '邮箱或密码无效。',
      otherLoginMethod: '其他登录方式'
    },
    'ja': {
      credentialInUse: 'この {provider} アカウントは既に他のアカウントで使用されています。別の {provider} アカウントをご使用ください。',
      credentialInUseWithEmail: 'この {provider} アカウント ({email}) は既に他のアカウントで使用されています。別の {provider} アカウントをご使用ください。',
      alreadyLinked: '{provider} アカウントは既に連携されています。',
      popupClosed: 'ポップアップが閉じられました。再試行してください。',
      popupBlocked: 'ポップアップがブロックされました。ポップアップブロッカーを無効にして再試行してください。',
      linkFailed: '{provider} アカウント連携中にエラーが発生しました。',
      emailMismatch: '連携しようとしている {provider} アカウントのメールアドレス ({providerEmail}) が現在のアカウントのメールアドレス ({currentEmail}) と異なります。同じメールアドレスの {provider} アカウントをご使用ください。',
      emailAlreadyInUse: 'このメールアドレス ({email}) は既に他のログイン方法で登録されています。既存のログイン方法でログインしてください。',
      userNotFound: 'このメールアドレス ({email}) で登録された情報が見つかりません。',
      existingProvider: 'このメールアドレス ({email}) は既に {provider} で登録されています。{provider} でログインしてください。',
      invalidCredential: 'メールアドレスまたはパスワードが正しくありません。',
      otherLoginMethod: '他のログイン方法'
    },
    'es': {
      credentialInUse: 'Esta cuenta de {provider} ya está siendo utilizada por otra cuenta. Por favor use una cuenta de {provider} diferente.',
      credentialInUseWithEmail: 'Esta cuenta de {provider} ({email}) ya está siendo utilizada por otra cuenta. Por favor use una cuenta de {provider} diferente.',
      alreadyLinked: 'La cuenta de {provider} ya está vinculada.',
      popupClosed: 'La ventana emergente se cerró. Inténtelo de nuevo.',
      popupBlocked: 'La ventana emergente fue bloqueada. Desactive el bloqueador de ventanas emergentes e inténtelo de nuevo.',
      linkFailed: 'Se produjo un error al vincular la cuenta de {provider}.',
      emailMismatch: 'El email de la cuenta de {provider} que intenta vincular ({providerEmail}) es diferente al email de su cuenta actual ({currentEmail}). Por favor use una cuenta de {provider} con el mismo email.',
      emailAlreadyInUse: 'Este email ({email}) ya está registrado con un método de inicio de sesión diferente. Por favor inicie sesión con el método existente.',
      userNotFound: 'No se encontró ninguna cuenta con este email ({email}).',
      existingProvider: 'Este email ({email}) ya está registrado con {provider}. Por favor inicie sesión con {provider}.',
      invalidCredential: 'Email o contraseña inválidos.',
      otherLoginMethod: 'otro método de inicio de sesión'
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
  const msg = getLocalizedMessage();

  try {
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
  } catch (error) {
    if (error.code === "auth/email-already-in-use") {
      throw new Error(formatMessage(msg.emailAlreadyInUse, { email }));
    } else {
      throw error;
    }
  }
};

// 로그인 함수
export const login = async (email, password) => {
  checkFirebaseInitialized();
  const msg = getLocalizedMessage();

  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    if (!userCredential.user.emailVerified) {
      // 다국어 지원을 위해 메시지 추가 필요할 수 있음
      throw new Error("이메일 인증이 필요합니다. 이메일을 확인해주세요.");
    }

    return userCredential.user;
  } catch (error) {
    if (error.code === "auth/invalid-credential" || error.code === "auth/user-not-found") {
      console.log("로그인 실패 에러 코드:", error.code); // 디버깅용
      
      // 먼저 fetchSignInMethodsForEmail으로 가입 정보 확인
      try {
        const methods = await fetchSignInMethodsForEmail(auth, email);
        console.log("Sign-in methods for", email, ":", methods); // 디버깅용
        
        if (methods && methods.length > 0) {
          // 가입된 계정이 있음
          const firstMethod = methods[0];
          
          if (firstMethod === "password") {
            // 이메일/비밀번호 계정이지만 비밀번호가 틀림
            throw new Error(formatMessage(msg.invalidCredential, {}));
          } else {
            // 다른 제공자로 가입된 경우
            let providerText = msg.otherLoginMethod;
            
            if (firstMethod === "google.com") {
              providerText = "Google";
            } else if (firstMethod === "facebook.com") {
              providerText = "Facebook";
            } else if (firstMethod === "github.com") {
              providerText = "GitHub";
            }

            throw new Error(formatMessage(msg.existingProvider, {
              email,
              provider: providerText
            }));
          }
        } else {
          // fetchSignInMethodsForEmail에서 빈 배열 반환
          // Firebase의 보안 설정으로 인해 다른 제공자 정보가 숨겨질 수 있음
          console.log("No methods found from fetchSignInMethodsForEmail"); // 디버깅용
          
          // 회원가입 시도를 통해 확인 (실제 계정 생성하지 않고 에러만 확인)
          try {
            // 매우 약한 비밀번호로 회원가입 시도 (실패할 것을 예상)
            await createUserWithEmailAndPassword(auth, email, "123");
          } catch (signupError) {
            console.log("Signup test result:", signupError.code); // 디버깅용
            
            if (signupError.code === "auth/email-already-in-use") {
              // 이메일이 이미 사용 중 = 다른 제공자로 가입되어 있음
              // fetchSignInMethodsForEmail을 다시 시도
              try {
                const retryMethods = await fetchSignInMethodsForEmail(auth, email);
                console.log("Retry methods after signup test:", retryMethods);
                
                if (retryMethods && retryMethods.length > 0) {
                  const method = retryMethods[0];
                  if (method === "password") {
                    // 이메일/비밀번호 계정
                    throw new Error(formatMessage(msg.invalidCredential, {}));
                  } else {
                    // 다른 제공자
                    let providerText = method === "google.com" ? "Google" : 
                                     method === "facebook.com" ? "Facebook" :
                                     method === "github.com" ? "GitHub" : msg.otherLoginMethod;
                    throw new Error(formatMessage(msg.existingProvider, { email, provider: providerText }));
                  }
                } else {
                  // 여전히 빈 배열이면 일반적인 메시지
                  throw new Error(formatMessage(msg.existingProvider, { email, provider: msg.otherLoginMethod }));
                }
              } catch (retryError) {
                if (retryError.message && (retryError.message.includes('이미') || retryError.message.includes('올바르지'))) {
                  throw retryError;
                }
                // fetchSignInMethodsForEmail 재시도 실패시 일반적인 메시지
                throw new Error(formatMessage(msg.existingProvider, { email, provider: msg.otherLoginMethod }));
              }
            } else if (signupError.code === "auth/weak-password") {
              // 비밀번호가 약함 = 가입 가능 = 가입되지 않은 이메일
              throw new Error(formatMessage(msg.userNotFound, { email }));
            } else {
              // 다른 에러 - 가입되지 않은 것으로 간주
              throw new Error(formatMessage(msg.userNotFound, { email }));
            }
          }
        }
      } catch (methodsError) {
        console.error("fetchSignInMethodsForEmail 에러:", methodsError);
        
        // 이미 처리된 메시지인지 확인
        if (methodsError.message && (
            methodsError.message.includes('가입된') || methodsError.message.includes('이미') || 
            methodsError.message.includes('registered') || methodsError.message.includes('found') ||
            methodsError.message.includes('No account') || methodsError.message.includes('未找到') ||
            methodsError.message.includes('올바르지') || methodsError.message.includes('Invalid')
        )) {
          throw methodsError; // 이미 처리된 메시지는 그대로 전달
        }
        
        // fetchSignInMethodsForEmail 자체가 실패한 경우
        // 원본 에러 코드에 따라 처리
        if (error.code === "auth/user-not-found") {
          throw new Error(formatMessage(msg.userNotFound, { email }));
        } else {
          throw new Error(formatMessage(msg.invalidCredential, {}));
        }
      }
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
  const msg = getLocalizedMessage();

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

    return user;
  } catch (error) {
    if (error.code === "auth/account-exists-with-different-credential") {
      // 같은 이메일을 사용하는 다른 인증 방법으로 이미 계정이 있는 경우
      const email = error.customData?.email;
      
      if (email) {
        try {
          // 해당 이메일로 기존에 가입한 방법 확인
          const methods = await fetchSignInMethodsForEmail(auth, email);
          let existingMethodText = "다른 로그인 방법";
          
          if (methods && methods.length > 0) {
            const firstMethod = methods[0];
            if (firstMethod === "facebook.com") {
              existingMethodText = "Facebook 계정";
            } else if (firstMethod === "github.com") {
              existingMethodText = "GitHub 계정";
            } else if (firstMethod === "password") {
              existingMethodText = "이메일/비밀번호";
            }
          }

          throw new Error(
            `이 이메일 (${email})은 이미 ${existingMethodText}으로 가입되어 있습니다. ${existingMethodText}으로 로그인해주세요.`
          );
        } catch (innerError) {
          if (innerError.message.includes("이미")) {
            throw innerError; // 이미 처리한 메시지는 그대로 전달
          }
          throw new Error("기존 로그인 방법을 사용해주세요.");
        }
      } else {
        throw new Error("기존 로그인 방법을 사용해주세요.");
      }
    } else if (error.code === "auth/popup-closed-by-user") {
      throw new Error(msg.popupClosed);
    } else if (error.code === "auth/popup-blocked") {
      throw new Error(msg.popupBlocked);
    } else if (error.code === "auth/cancelled-popup-request") {
      throw new Error("로그인 요청이 취소되었습니다. 다시 시도해주세요.");
    } else if (error.code === "auth/network-request-failed") {
      throw new Error("네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.");
    } else {
      throw new Error(`구글 로그인에 실패했습니다. 다시 시도해주세요.`);
    }
  }
};

export const githubLogin = async () => {
  checkFirebaseInitialized();
  const msg = getLocalizedMessage();

  try {
    const provider = new GithubAuthProvider();
    provider.setCustomParameters({
      prompt: "select_account",
    });

    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    await saveUserData(user);

    // 계정 연결 로직은 프로필 페이지에서만 처리
    // 로그인 시에는 자동 연동하지 않음

    return user;
  } catch (error) {
    // GitHub API 속도 제한 오류 감지
    if (error.message && error.message.includes("exceeded a secondary rate limit")) {
      throw new Error("GitHub 로그인 속도 제한에 도달했습니다. 잠시 후 다시 시도하거나 다른 로그인 방법을 사용하세요.");
    }

    if (error.code === "auth/account-exists-with-different-credential") {
      // 같은 이메일을 사용하는 다른 인증 방법으로 이미 계정이 있는 경우
      const email = error.customData?.email;
      
      if (email) {
        try {
          // 해당 이메일로 기존에 가입한 방법 확인
          const methods = await fetchSignInMethodsForEmail(auth, email);
          let existingMethodText = "다른 로그인 방법";
          
          if (methods && methods.length > 0) {
            const firstMethod = methods[0];
            if (firstMethod === "google.com") {
              existingMethodText = "Google 계정";
            } else if (firstMethod === "facebook.com") {
              existingMethodText = "Facebook 계정";
            } else if (firstMethod === "password") {
              existingMethodText = "이메일/비밀번호";
            }
          }

          throw new Error(
            `이 이메일 (${email})은 이미 ${existingMethodText}으로 가입되어 있습니다. ${existingMethodText}으로 로그인해주세요.`
          );
        } catch (innerError) {
          if (innerError.message.includes("이미")) {
            throw innerError; // 이미 처리한 메시지는 그대로 전달
          }
          throw new Error("기존 로그인 방법을 사용해주세요.");
        }
      } else {
        throw new Error("기존 로그인 방법을 사용해주세요.");
      }
    } else if (error.code === "auth/popup-closed-by-user") {
      throw new Error(msg.popupClosed);
    } else if (error.code === "auth/popup-blocked") {
      throw new Error(msg.popupBlocked);
    } else if (error.code === "auth/cancelled-popup-request") {
      throw new Error("로그인 요청이 취소되었습니다. 다시 시도해주세요.");
    } else if (error.code === "auth/network-request-failed") {
      throw new Error("네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.");
    } else {
      throw new Error(`깃허브 로그인에 실패했습니다. 다시 시도해주세요.`);
    }
  }
};

export const facebookLogin = async () => {
  checkFirebaseInitialized();
  const msg = getLocalizedMessage();

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

    // 계정 연결 로직은 프로필 페이지에서만 처리
    // 로그인 시에는 자동 연동하지 않음

    return user;
  } catch (error) {
    if (error.code === "auth/account-exists-with-different-credential") {
      // 같은 이메일을 사용하는 다른 인증 방법으로 이미 계정이 있는 경우
      const email = error.customData?.email;
      
      if (email) {
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

          throw new Error(
            `이 이메일 (${email})은 이미 ${existingMethodText}으로 가입되어 있습니다. ${existingMethodText}으로 로그인해주세요.`
          );
        } catch (innerError) {
          if (innerError.message.includes("이미")) {
            throw innerError; // 이미 처리한 메시지는 그대로 전달
          }
          throw new Error("기존 로그인 방법을 사용해주세요.");
        }
      } else {
        throw new Error("기존 로그인 방법을 사용해주세요.");
      }
    } else if (error.code === "auth/popup-closed-by-user") {
      throw new Error(msg.popupClosed);
    } else if (error.code === "auth/popup-blocked") {
      throw new Error(msg.popupBlocked);
    } else if (error.code === "auth/cancelled-popup-request") {
      throw new Error("로그인 요청이 취소되었습니다. 다시 시도해주세요.");
    } else if (error.code === "auth/network-request-failed") {
      throw new Error("네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.");
    } else {
      throw new Error(`페이스북 로그인에 실패했습니다. 다시 시도해주세요.`);
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
    const msg = getLocalizedMessage();
    throw new Error("로그인된 사용자가 없습니다");
  }

  const msg = getLocalizedMessage();

  try {
    // 모바일에서는 redirect, 데스크톱에서는 팝업 사용
    let result;
    if (isMobileDevice()) {
      result = await linkWithRedirect(user, provider);
    } else {
      result = await linkWithPopup(user, provider);
    }

    // 연결된 계정의 이메일과 현재 사용자 이메일 비교
    if (result && result.user) {
      const linkedProviderData = result.user.providerData.find(p => p.providerId === 'google.com');
      if (linkedProviderData && linkedProviderData.email !== user.email) {
        // 이메일이 다르면 연결 해제하고 에러 표시
        await unlink(user, 'google.com');
        throw new Error(formatMessage(msg.emailMismatch, {
          provider: 'Google',
          providerEmail: linkedProviderData.email,
          currentEmail: user.email
        }));
      }
    }
  } catch (error) {
    // 사용자가 직접 발생시킨 이메일 불일치 에러는 그대로 전달
    if (error.message && error.message.includes('다릅니다')) {
      throw error;
    }

    // Firebase 오류 코드에 따른 사용자 친화적인 메시지 처리
    if (error.code === "auth/credential-already-in-use") {
      // 해당 구글 계정이 이미 다른 Firebase 계정에 연결되어 있는 경우
      const email = error.customData?.email;
      if (email) {
        throw new Error(formatMessage(msg.credentialInUseWithEmail, {provider: 'Google', email}));
      } else {
        throw new Error(formatMessage(msg.credentialInUse, {provider: 'Google'}));
      }
    } else if (error.code === "auth/provider-already-linked") {
      throw new Error(formatMessage(msg.alreadyLinked, {provider: 'Google'}));
    } else if (error.code === "auth/popup-closed-by-user") {
      throw new Error(msg.popupClosed);
    } else if (error.code === "auth/popup-blocked") {
      throw new Error(msg.popupBlocked);
    } else {
      // 다른 모든 Firebase 오류는 사용자 친화적인 메시지로 변환
      throw new Error(formatMessage(msg.linkFailed, {provider: 'Google'}));
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
    const msg = getLocalizedMessage();
    throw new Error("로그인된 사용자가 없습니다");
  }

  const msg = getLocalizedMessage();

  try {
    // 모바일에서는 redirect, 데스크톱에서는 팝업 사용
    let result;
    if (isMobileDevice()) {
      result = await linkWithRedirect(user, provider);
    } else {
      result = await linkWithPopup(user, provider);
    }

    // 연결된 계정의 이메일과 현재 사용자 이메일 비교
    if (result && result.user) {
      const linkedProviderData = result.user.providerData.find(p => p.providerId === 'github.com');
      if (linkedProviderData && linkedProviderData.email !== user.email) {
        // 이메일이 다르면 연결 해제하고 에러 표시
        await unlink(user, 'github.com');
        throw new Error(formatMessage(msg.emailMismatch, {
          provider: 'GitHub',
          providerEmail: linkedProviderData.email,
          currentEmail: user.email
        }));
      }
    }
  } catch (error) {
    // 사용자가 직접 발생시킨 이메일 불일치 에러는 그대로 전달
    if (error.message && error.message.includes('다릅니다')) {
      throw error;
    }

    // Firebase 오류 코드에 따른 사용자 친화적인 메시지 처리
    if (error.code === "auth/credential-already-in-use") {
      // 해당 GitHub 계정이 이미 다른 Firebase 계정에 연결되어 있는 경우
      const email = error.customData?.email;
      if (email) {
        throw new Error(formatMessage(msg.credentialInUseWithEmail, {provider: 'GitHub', email}));
      } else {
        throw new Error(formatMessage(msg.credentialInUse, {provider: 'GitHub'}));
      }
    } else if (error.code === "auth/provider-already-linked") {
      throw new Error(formatMessage(msg.alreadyLinked, {provider: 'GitHub'}));
    } else if (error.code === "auth/popup-closed-by-user") {
      throw new Error(msg.popupClosed);
    } else if (error.code === "auth/popup-blocked") {
      throw new Error(msg.popupBlocked);
    } else {
      // 다른 모든 Firebase 오류는 사용자 친화적인 메시지로 변환
      throw new Error(formatMessage(msg.linkFailed, {provider: 'GitHub'}));
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
    const msg = getLocalizedMessage();
    throw new Error("로그인된 사용자가 없습니다");
  }

  const msg = getLocalizedMessage();

  try {
    // 모바일에서는 redirect, 데스크톱에서는 팝업 사용
    let result;
    if (isMobileDevice()) {
      result = await linkWithRedirect(user, provider);
    } else {
      result = await linkWithPopup(user, provider);
    }

    // 연결된 계정의 이메일과 현재 사용자 이메일 비교
    if (result && result.user) {
      const linkedProviderData = result.user.providerData.find(p => p.providerId === 'facebook.com');
      if (linkedProviderData && linkedProviderData.email !== user.email) {
        // 이메일이 다르면 연결 해제하고 에러 표시
        await unlink(user, 'facebook.com');
        throw new Error(formatMessage(msg.emailMismatch, {
          provider: 'Facebook',
          providerEmail: linkedProviderData.email,
          currentEmail: user.email
        }));
      }
    }
  } catch (error) {
    // 사용자가 직접 발생시킨 이메일 불일치 에러는 그대로 전달
    if (error.message && error.message.includes('다릅니다')) {
      throw error;
    }

    // Firebase 오류 코드에 따른 사용자 친화적인 메시지 처리
    if (error.code === "auth/credential-already-in-use") {
      // 해당 Facebook 계정이 이미 다른 Firebase 계정에 연결되어 있는 경우
      const email = error.customData?.email;
      if (email) {
        throw new Error(formatMessage(msg.credentialInUseWithEmail, {provider: 'Facebook', email}));
      } else {
        throw new Error(formatMessage(msg.credentialInUse, {provider: 'Facebook'}));
      }
    } else if (error.code === "auth/provider-already-linked") {
      throw new Error(formatMessage(msg.alreadyLinked, {provider: 'Facebook'}));
    } else if (error.code === "auth/popup-closed-by-user") {
      throw new Error(msg.popupClosed);
    } else if (error.code === "auth/popup-blocked") {
      throw new Error(msg.popupBlocked);
    } else {
      // 다른 모든 Firebase 오류는 사용자 친화적인 메시지로 변환
      throw new Error(formatMessage(msg.linkFailed, {provider: 'Facebook'}));
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
