import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";
import {
  doc,
  collection,
  setDoc,
  getDoc,
  updateDoc,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

// 기본 Firebase 설정 (서버 요청 실패 시 폴백)
const defaultConfig = {
  apiKey: "AIzaSyCPQVYE7h7odTDCkoH6mrsEtT1giWk8yDM",
  authDomain: "uploadfile-e6f81.firebaseapp.com",
  databaseURL:
    "https://uploadfile-e6f81-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "uploadfile-e6f81",
  storageBucket: "uploadfile-e6f81.appspot.com",
  messagingSenderId: "663760434128",
  appId: "1:663760434128:web:1ccbc92ab3e34670783fd5",
};

// 전역으로 선언하여 초기화
let app = initializeApp(defaultConfig);
let auth = getAuth(app);
let db = getFirestore(app);

// Firebase 초기화 함수
async function initializeFirebase() {
  try {
    // 로컬 환경인지 확인 (localhost 또는 127.0.0.1)
    const isLocalEnvironment =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";

    let firebaseConfig = null;

    if (isLocalEnvironment) {
      console.log(
        "로컬 환경에서 실행 중입니다. 기본 Firebase 설정을 사용합니다."
      );
      // 로컬 개발 환경에서 사용할 기본 설정
      firebaseConfig = {
        apiKey: "AIzaSyCPQVYE7h7odTDCkoH6mrsEtT1giWk8yDM",
        authDomain: "uploadfile-e6f81.firebaseapp.com",
        projectId: "uploadfile-e6f81",
        storageBucket: "uploadfile-e6f81.appspot.com",
        messagingSenderId: "663760434128",
        appId: "1:663760434128:web:1ccbc92ab3e34670783fd5",
        databaseURL:
          "https://uploadfile-e6f81-default-rtdb.asia-southeast1.firebasedatabase.app",
      };
    } else {
      // 배포 환경에서는 API에서 설정 가져오기
      const response = await fetch("/api/config");
      if (!response.ok) {
        throw new Error("서버 응답 실패");
      }
      const data = await response.json();
      firebaseConfig = data.firebase;

      // 기존 앱 초기화 취소 후 새로운 설정으로 초기화
      app = initializeApp(firebaseConfig);
      auth = getAuth(app);
      db = getFirestore(app);
    }

    console.log("Firebase가 성공적으로 초기화되었습니다.");
  } catch (error) {
    console.error(
      "서버에서 Firebase 설정을 가져오지 못했습니다. 기본 설정을 사용합니다.",
      error
    );
    // 오류가 발생해도 이미 defaultConfig로 초기화가 되어 있으므로 추가 작업 필요없음
  }
}

// 페이지 로드 시 Firebase 초기화
initializeFirebase();

// 다국어 지원 언어 목록
export const supportedLanguages = {
  korean: { nameKo: "한국어", code: "ko", example: "사과" },
  english: { nameKo: "영어", code: "en", example: "apple" },
  japanese: { nameKo: "일본어", code: "ja", example: "りんご" },
  chinese: { nameKo: "중국어", code: "zh", example: "苹果" },
  vietnamese: { nameKo: "베트남어", code: "vi", example: "táo" },
};

// 다국어 개념 유틸리티 함수
export const conceptUtils = {
  // 새 개념 생성
  async createConcept(conceptData) {
    try {
      // concepts 컬렉션에 새 개념 추가
      const conceptRef = doc(collection(db, "concepts"));
      await setDoc(conceptRef, {
        _id: conceptRef.id,
        concept_info: conceptData.concept_info,
        expressions: conceptData.expressions,
        examples: conceptData.examples || [],
        created_at: new Date(),
        updated_at: new Date(),
      });

      // 각 언어별 인덱스 생성/업데이트
      for (const [lang, expression] of Object.entries(
        conceptData.expressions
      )) {
        await this.updateLanguageIndex(
          lang,
          expression.word,
          conceptRef.id,
          conceptData.concept_info.category
        );
      }

      return conceptRef.id;
    } catch (error) {
      console.error("개념 생성 중 오류 발생:", error);
      throw error;
    }
  },

  // 개념 가져오기
  async getConcept(conceptId) {
    try {
      const conceptDoc = await getDoc(doc(db, "concepts", conceptId));
      if (conceptDoc.exists()) {
        return conceptDoc.data();
      }
      return null;
    } catch (error) {
      console.error("개념 가져오기 중 오류 발생:", error);
      throw error;
    }
  },

  // 개념 수정
  async updateConcept(conceptId, newData) {
    try {
      const conceptRef = doc(db, "concepts", conceptId);
      const conceptDoc = await getDoc(conceptRef);

      if (!conceptDoc.exists()) {
        throw new Error("개념을 찾을 수 없습니다");
      }

      const oldData = conceptDoc.data();

      // 인덱스 업데이트 필요한 언어 확인 (단어가 변경된 경우)
      for (const [lang, expression] of Object.entries(newData.expressions)) {
        const oldExpression = oldData.expressions[lang];

        // 새 언어가 추가되었거나 기존 단어가 변경된 경우
        if (!oldExpression || oldExpression.word !== expression.word) {
          // 새 단어로 인덱스 생성/업데이트
          await this.updateLanguageIndex(
            lang,
            expression.word,
            conceptId,
            newData.concept_info.category
          );

          // 기존 단어가 있었다면 인덱스에서 제거
          if (oldExpression) {
            await this.removeFromLanguageIndex(
              lang,
              oldExpression.word,
              conceptId
            );
          }
        }
      }

      // 개념 문서 업데이트
      await updateDoc(conceptRef, {
        concept_info: newData.concept_info,
        expressions: newData.expressions,
        examples: newData.examples || [],
        updated_at: new Date(),
      });

      return conceptId;
    } catch (error) {
      console.error("개념 수정 중 오류 발생:", error);
      throw error;
    }
  },

  // 언어 인덱스 업데이트
  async updateLanguageIndex(language, word, conceptId, meaning) {
    try {
      // 해당 단어로 인덱스 검색
      const indexCollection = `${language}_index`;
      const q = query(
        collection(db, indexCollection),
        where("word", "==", word)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // 기존 인덱스에 개념 추가
        const indexDoc = querySnapshot.docs[0];
        const indexData = indexDoc.data();
        const existingConcepts = indexData.concepts || [];

        // 이미 있는 개념인지 확인
        const conceptExists = existingConcepts.some(
          (c) => c.concept_id === conceptId
        );

        if (!conceptExists) {
          await updateDoc(indexDoc.ref, {
            concepts: [...existingConcepts, { concept_id: conceptId, meaning }],
          });
        }
      } else {
        // 새 인덱스 생성
        await addDoc(collection(db, indexCollection), {
          word: word,
          concepts: [{ concept_id: conceptId, meaning }],
        });
      }
    } catch (error) {
      console.error(`${language} 인덱스 업데이트 중 오류 발생:`, error);
      throw error;
    }
  },

  // 인덱스에서 개념 제거
  async removeFromLanguageIndex(language, word, conceptId) {
    try {
      const indexCollection = `${language}_index`;
      const q = query(
        collection(db, indexCollection),
        where("word", "==", word)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const indexDoc = querySnapshot.docs[0];
        const indexData = indexDoc.data();
        const remainingConcepts = indexData.concepts.filter(
          (c) => c.concept_id !== conceptId
        );

        if (remainingConcepts.length > 0) {
          // 다른 개념들이 있으면 개념만 제거
          await updateDoc(indexDoc.ref, {
            concepts: remainingConcepts,
          });
        } else {
          // 마지막 개념이면 인덱스 자체를 삭제
          await deleteDoc(indexDoc.ref);
        }
      }
    } catch (error) {
      console.error(`${language} 인덱스에서 개념 제거 중 오류 발생:`, error);
      throw error;
    }
  },

  // 개념 삭제
  async deleteConcept(conceptId) {
    try {
      // 먼저 개념 정보를 가져옵니다
      const conceptRef = doc(db, "concepts", conceptId);
      const conceptDoc = await getDoc(conceptRef);

      if (!conceptDoc.exists()) {
        throw new Error("삭제할 개념을 찾을 수 없습니다");
      }

      const conceptData = conceptDoc.data();

      // 각 언어 인덱스에서 개념을 제거합니다
      for (const [lang, expression] of Object.entries(
        conceptData.expressions
      )) {
        await this.removeFromLanguageIndex(lang, expression.word, conceptId);
      }

      // 개념 문서 자체를 삭제합니다
      await deleteDoc(conceptRef);

      // 사용자의 개념 수 업데이트
      if (auth.currentUser) {
        const userRef = doc(db, "users", auth.currentUser.email);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          const currentCount = userData.conceptCount || 0;

          if (currentCount > 0) {
            await updateDoc(userRef, {
              conceptCount: currentCount - 1,
            });
          }
        }
      }

      return true;
    } catch (error) {
      console.error("개념 삭제 중 오류 발생:", error);
      throw error;
    }
  },

  // 단어로 개념 검색
  async searchConcepts(word, fromLanguage, toLanguage) {
    try {
      // 소스 언어 인덱스에서 개념 ID 찾기
      const q = query(
        collection(db, `${fromLanguage}_index`),
        where("word", "==", word)
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) return [];

      // 찾은 모든 개념(다의어 포함) 가져오기
      const conceptIds = querySnapshot.docs[0]
        .data()
        .concepts.map((c) => c.concept_id);
      const results = [];

      // 각 개념에 대한 대상 언어 표현 찾기
      for (const conceptId of conceptIds) {
        const conceptDoc = await getDoc(doc(db, "concepts", conceptId));
        if (!conceptDoc.exists()) continue;

        const conceptData = conceptDoc.data();

        // 대상 언어 표현이 있으면 결과에 추가
        if (conceptData.expressions[toLanguage]) {
          results.push({
            conceptId: conceptId,
            conceptInfo: conceptData.concept_info,
            fromWord: word,
            toWord: conceptData.expressions[toLanguage].word,
            fromExpression: conceptData.expressions[fromLanguage],
            toExpression: conceptData.expressions[toLanguage],
            examples: conceptData.examples
              .map((ex) => ({
                from: ex[fromLanguage],
                to: ex[toLanguage],
              }))
              .filter((ex) => ex.from && ex.to), // 두 언어 모두 있는 예제만
          });
        }
      }

      return results;
    } catch (error) {
      console.error("개념 검색 중 오류 발생:", error);
      throw error;
    }
  },

  // 학습용 개념 목록 가져오기
  async getConceptsForLearning(userLanguage, targetLanguage, limit = 20) {
    try {
      // concepts 컬렉션에서 두 언어를 모두 포함한 개념 검색
      const conceptsRef = collection(db, "concepts");
      const conceptsSnapshot = await getDocs(conceptsRef);

      const concepts = [];
      conceptsSnapshot.forEach((doc) => {
        const data = doc.data();
        // 두 언어 모두 있는 개념만 필터링
        if (
          data.expressions[userLanguage] &&
          data.expressions[targetLanguage]
        ) {
          concepts.push({
            id: doc.id,
            conceptInfo: data.concept_info,
            fromExpression: data.expressions[userLanguage],
            toExpression: data.expressions[targetLanguage],
            examples: data.examples
              .map((ex) => ({
                from: ex[userLanguage],
                to: ex[targetLanguage],
              }))
              .filter((ex) => ex.from && ex.to),
          });
        }
      });

      // 랜덤하게 섞기
      return concepts.sort(() => Math.random() - 0.5).slice(0, limit);
    } catch (error) {
      console.error("학습용 개념 가져오기 중 오류 발생:", error);
      throw error;
    }
  },
};

export { app, auth, db };
