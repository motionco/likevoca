import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
import {
  getFirestore,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";
import {
  getStorage
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-storage.js";
import {
  doc,
  collection,
  setDoc,
  getDoc,
  updateDoc,
  query,
  where,
  orderBy,
  getDocs,
  addDoc,
  deleteDoc,
  limit,
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";
import { collectionManager } from "./firebase-collection-manager.js";

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
let storage = getStorage(app);

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
      storage = getStorage(app);
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

// 전역 접근을 위해 window 객체에 추가
window.auth = auth;
window.db = db;
window.storage = storage;
window.onAuthStateChanged = onAuthStateChanged;

// 다국어 지원 언어 목록
export const supportedLanguages = {
  korean: { nameKo: "한국어", code: "ko", example: "사과" },
  english: { nameKo: "영어", code: "en", example: "apple" },
  japanese: { nameKo: "일본어", code: "ja", example: "りんご" },
  chinese: { nameKo: "중국어", code: "zh", example: "苹果" },
  spanish: { nameKo: "스페인어", code: "es", example: "manzana" },
};

// 다국어 개념 유틸리티 함수 (분리된 컬렉션 통합)
export const conceptUtils = {
  // 새 개념 생성 (기존 호환성 유지하면서 분리된 컬렉션 우선 사용)
  async createConcept(conceptData) {
    try {
      // 항상 분리된 컬렉션 시스템 사용
      console.log("🆕 분리된 컬렉션 시스템으로 개념 생성");

      // 분리된 컬렉션 형식으로 데이터 변환
      const separatedConceptData = {
        concept_info: {
          domain:
            conceptData.concept_info?.domain || conceptData.domain || "general",
          category:
            conceptData.concept_info?.category ||
            conceptData.category ||
            "common",
          difficulty: conceptData.concept_info?.difficulty || "basic",
          unicode_emoji:
            conceptData.concept_info?.unicode_emoji ||
            conceptData.concept_info?.emoji ||
            "📚",
          color_theme: conceptData.concept_info?.color_theme || "#FF6B6B",
          situation: conceptData.concept_info?.situation || ["casual"],
          purpose: conceptData.concept_info?.purpose || "description",
          // updated_at은 새 개념 생성 시 불필요하므로 제거
        },
        expressions: conceptData.expressions || {},
        representative_example: conceptData.representative_example || null,
        learning_metadata: {
          created_from: "individual_add",
          import_date: new Date(),
          version: "3.0",
          structure_type: "separated_collections",
        },
      };

      // 추가 예문이 있는 경우에만 examples 필드 추가
      if (conceptData.examples && conceptData.examples.length > 0) {
        separatedConceptData.examples = conceptData.examples;
      }

      const result = await collectionManager.createConcept(
        separatedConceptData
      );

      // 사용자 개념 수 업데이트
      if (auth.currentUser) {
        await this.updateUsage(auth.currentUser.email, {
          conceptCount:
            (await this.getUsage(auth.currentUser.email)).conceptCount + 1,
        });
      }

      console.log("✅ 분리된 컬렉션으로 개념 생성 완료:", result);
      return result;
    } catch (error) {
      console.error("❌ 개념 생성 중 오류:", error);
      throw error;
    }
  },

  // 기존 통합 방식 개념 생성 (호환성 유지)
  async createLegacyConcept(conceptData) {
    const conceptRef = doc(collection(db, "concepts"));

    const enhancedConceptData = {
      _id: conceptRef.id,
      userId: auth.currentUser?.email || "anonymous",
      created_at: conceptData.created_at || new Date(),
      concept_info: {
        domain:
          conceptData.concept_info?.domain || conceptData.domain || "general",
        category:
          conceptData.concept_info?.category ||
          conceptData.category ||
          "common",
        difficulty: conceptData.concept_info?.difficulty || "basic",
        tags: conceptData.concept_info?.tags || [],
        unicode_emoji:
          conceptData.concept_info?.unicode_emoji ||
          conceptData.concept_info?.emoji ||
          "📚",
        color_theme: conceptData.concept_info?.color_theme || "#9C27B0",
        updated_at: new Date(),
        total_examples_count: conceptData.featured_examples?.length || 0,
        quiz_frequency: conceptData.concept_info?.quiz_frequency || "medium",
        game_types: conceptData.concept_info?.game_types || [
          "matching",
          "pronunciation",
          "spelling",
        ],
      },
      media: {
        images: conceptData.media?.images || {
          primary: null,
          secondary: null,
          illustration: null,
          emoji_style: null,
          line_art: null,
        },
        videos: conceptData.media?.videos || {
          intro: null,
          pronunciation: null,
        },
        audio: conceptData.media?.audio || {
          pronunciation_slow: null,
          pronunciation_normal: null,
          word_in_sentence: null,
        },
      },
      expressions: conceptData.expressions || {},
      representative_example: conceptData.representative_example || null,
      featured_examples: conceptData.featured_examples || [],
      quiz_data: {
        question_types: conceptData.quiz_data?.question_types || [
          "translation",
          "matching",
        ],
        difficulty_multiplier:
          conceptData.quiz_data?.difficulty_multiplier || 1.0,
        common_mistakes: conceptData.quiz_data?.common_mistakes || [],
        hint_text: conceptData.quiz_data?.hint_text || {},
      },
      game_data: {
        memory_card: conceptData.game_data?.memory_card || {},
        word_puzzle: conceptData.game_data?.word_puzzle || {},
        pronunciation_game: conceptData.game_data?.pronunciation_game || {},
      },
      related_concepts: conceptData.related_concepts || [],
      learning_metadata: {
        memorization_difficulty:
          conceptData.learning_metadata?.memorization_difficulty || 2,
        pronunciation_difficulty:
          conceptData.learning_metadata?.pronunciation_difficulty || 2,
        usage_frequency:
          conceptData.learning_metadata?.usage_frequency || "medium",
        cultural_importance:
          conceptData.learning_metadata?.cultural_importance || "medium",
      },
    };

    await setDoc(conceptRef, enhancedConceptData);

    // 각 언어별 인덱스 생성/업데이트
    for (const [lang, expression] of Object.entries(
      conceptData.expressions || {}
    )) {
      if (expression?.word) {
        await this.updateLanguageIndex(
          lang,
          expression.word,
          conceptRef.id,
          enhancedConceptData.concept_info.category,
          enhancedConceptData.concept_info.difficulty
        );
      }
    }

    return conceptRef.id;
  },

  // 통합 개념 조회 (분리된 컬렉션과 기존 시스템 모두 지원)
  async getConcept(conceptId) {
    try {
      // 먼저 분리된 컬렉션에서 시도
      try {
        const separatedConcept = await collectionManager.getIntegratedConcept(
          conceptId
        );
        if (separatedConcept) {
          console.log("분리된 컬렉션에서 개념 조회:", conceptId);
          return separatedConcept;
        }
      } catch (error) {
        console.log(
          "분리된 컬렉션에서 개념을 찾을 수 없음, 기존 시스템 시도:",
          conceptId
        );
      }

      // 기존 통합 시스템에서 조회
      const conceptRef = doc(db, "concepts", conceptId);
      const conceptDoc = await getDoc(conceptRef);

      if (conceptDoc.exists()) {
        console.log("기존 통합 시스템에서 개념 조회:", conceptId);
        return conceptDoc.data();
      }

      throw new Error(`개념 ${conceptId}를 찾을 수 없습니다`);
    } catch (error) {
      console.error("개념 조회 중 오류:", error);
      throw error;
    }
  },

  // 학습용 개념 목록 가져오기 (분리된 컬렉션 우선 사용)
  async getConceptsForLearning(userLanguage, targetLanguage, limit = 20) {
    try {
      // 분리된 컬렉션 시스템 우선 사용
      const separatedConcepts = await collectionManager.getConceptsForLearning(
        userLanguage,
        targetLanguage,
        limit
      );

      if (separatedConcepts.length > 0) {
        console.log(
          `분리된 컬렉션에서 학습용 개념 ${separatedConcepts.length}개 조회`
        );
        return separatedConcepts;
      }

      // 기존 시스템으로 폴백
      console.log("기존 시스템으로 학습용 개념 조회");
      return await this.getLegacyConceptsForLearning(
        userLanguage,
        targetLanguage,
        limit
      );
    } catch (error) {
      console.error("학습용 개념 조회 중 오류:", error);
      // 오류 시 기존 시스템으로 폴백
      return await this.getLegacyConceptsForLearning(
        userLanguage,
        targetLanguage,
        limit
      );
    }
  },

  // 게임용 개념 목록 가져오기 (분리된 컬렉션 우선 사용)
  async getConceptsForGame(gameType, difficulty, languagePair, limit = 10) {
    try {
      // 분리된 컬렉션 시스템 우선 사용
      const separatedConcepts = await collectionManager.getConceptsForGame(
        gameType,
        difficulty,
        languagePair,
        limit
      );

      if (separatedConcepts.length > 0) {
        console.log(
          `분리된 컬렉션에서 게임용 개념 ${separatedConcepts.length}개 조회`
        );
        return separatedConcepts;
      }

      // 기존 시스템으로 폴백
      console.log("기존 시스템으로 게임용 개념 조회");
      return await this.getLegacyConceptsForGame(
        gameType,
        difficulty,
        languagePair,
        limit
      );
    } catch (error) {
      console.error("게임용 개념 조회 중 오류:", error);
      // 오류 시 기존 시스템으로 폴백
      return await this.getLegacyConceptsForGame(
        gameType,
        difficulty,
        languagePair,
        limit
      );
    }
  },

  // 기존 시스템용 학습 개념 조회 (호환성)
  async getLegacyConceptsForLearning(userLanguage, targetLanguage, limit = 20) {
    try {
      const conceptsRef = collection(db, "concepts");
      const conceptsSnapshot = await getDocs(conceptsRef);

      const concepts = [];
      conceptsSnapshot.forEach((doc) => {
        const data = doc.data();
        if (
          data.expressions?.[userLanguage] &&
          data.expressions?.[targetLanguage]
        ) {
          let examples = [];

          if (data.featured_examples && Array.isArray(data.featured_examples)) {
            examples = data.featured_examples
              .map((ex) => ({
                from: ex.translations?.[userLanguage]?.text || "",
                to: ex.translations?.[targetLanguage]?.text || "",
              }))
              .filter((ex) => ex.from && ex.to);
          } else if (data.examples && Array.isArray(data.examples)) {
            examples = data.examples
              .map((ex) => ({
                from: ex[userLanguage] || "",
                to: ex[targetLanguage] || "",
              }))
              .filter((ex) => ex.from && ex.to);
          }

          concepts.push({
            id: doc.id,
            conceptInfo: data.concept_info || {
              domain: data.domain || "general",
              category: data.category || "common",
              emoji: data.emoji || "📚",
            },
            fromExpression: data.expressions[userLanguage],
            toExpression: data.expressions[targetLanguage],
            examples: examples,
          });
        }
      });

      return concepts.sort(() => Math.random() - 0.5).slice(0, limit);
    } catch (error) {
      console.error("기존 시스템 학습용 개념 조회 중 오류:", error);
      throw error;
    }
  },

  // 기존 시스템용 게임 개념 조회 (호환성)
  async getLegacyConceptsForGame(
    gameType,
    difficulty,
    languagePair,
    limit = 10
  ) {
    try {
      const [userLang, targetLang] = languagePair;
      const conceptsRef = collection(db, "concepts");
      const conceptsSnapshot = await getDocs(conceptsRef);

      const concepts = [];
      conceptsSnapshot.forEach((doc) => {
        const data = doc.data();

        // 난이도 필터링
        const conceptDifficulty =
          data.concept_info?.difficulty || data.difficulty || "basic";
        if (conceptDifficulty !== difficulty) return;

        if (
          data.expressions?.[userLang] &&
          data.expressions?.[targetLang] &&
          concepts.length < limit
        ) {
          concepts.push({
            id: doc.id,
            concept_info: data.concept_info || {
              domain: data.domain || "general",
              category: data.category || "common",
              difficulty: conceptDifficulty,
              unicode_emoji: data.emoji || "📚",
            },
            expressions: {
              [userLang]: data.expressions[userLang],
              [targetLang]: data.expressions[targetLang],
            },
            media: data.media,
            gameMetadata: {
              difficulty: conceptDifficulty,
              domain: data.concept_info?.domain || data.domain || "general",
              category:
                data.concept_info?.category || data.category || "common",
            },
          });
        }
      });

      return concepts.sort(() => Math.random() - 0.5);
    } catch (error) {
      console.error("기존 시스템 게임용 개념 조회 중 오류:", error);
      throw error;
    }
  },

  // 대량 개념 생성 (JSON 파일 업로드용)
  async createConceptsFromArray(conceptsArray) {
    const results = [];
    const errors = [];

    for (let i = 0; i < conceptsArray.length; i++) {
      try {
        const conceptId = await this.createConcept(conceptsArray[i]);
        results.push({ index: i, conceptId, status: "success" });
      } catch (error) {
        errors.push({ index: i, error: error.message });
      }
    }

    return { results, errors };
  },

  // 개념 수정 (확장된 구조 지원)
  async updateConcept(conceptId, newData) {
    try {
      const conceptRef = doc(db, "concepts", conceptId);
      const conceptDoc = await getDoc(conceptRef);

      if (!conceptDoc.exists()) {
        throw new Error("개념을 찾을 수 없습니다");
      }

      const oldData = conceptDoc.data();

      // 언어별 인덱스 업데이트
      for (const [lang, expression] of Object.entries(
        newData.expressions || {}
      )) {
        const oldExpression = oldData.expressions?.[lang];

        if (!oldExpression || oldExpression.word !== expression.word) {
          if (expression.word) {
            await this.updateLanguageIndex(
              lang,
              expression.word,
              conceptId,
              newData.concept_info?.category || oldData.concept_info?.category,
              newData.concept_info?.difficulty ||
                oldData.concept_info?.difficulty
            );
          }

          if (oldExpression?.word) {
            await this.removeFromLanguageIndex(
              lang,
              oldExpression.word,
              conceptId
            );
          }
        }
      }

      // 개념 문서 업데이트 - concept_info 내부의 updated_at 제거하고 최상위 레벨에 추가
      const updateData = {
        ...newData,
        concept_info: {
          ...oldData.concept_info,
          ...newData.concept_info,
          // unicode_emoji 우선 사용, emoji는 제거
          unicode_emoji:
            newData.concept_info?.unicode_emoji ||
            oldData.concept_info?.unicode_emoji ||
            oldData.concept_info?.emoji,
          // concept_info 내부의 updated_at 제거 (최상위 레벨에서만 관리)
        },
        // 최상위 레벨에서 서버 타임스탬프 사용
        updated_at: serverTimestamp(),
      };

      // 기존 emoji 속성 제거 (unicode_emoji로 통일)
      if (updateData.concept_info.emoji) {
        delete updateData.concept_info.emoji;
      }

      // concept_info에서 updated_at 제거 (중복 방지)
      if (updateData.concept_info.updated_at) {
        delete updateData.concept_info.updated_at;
      }

      await updateDoc(conceptRef, updateData);
      return conceptId;
    } catch (error) {
      console.error("개념 수정 중 오류 발생:", error);
      throw error;
    }
  },

  // 언어 인덱스 업데이트 (확장된 메타데이터 포함)
  async updateLanguageIndex(
    language,
    word,
    conceptId,
    category,
    difficulty = "basic"
  ) {
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
        const existingConcepts = indexData.concepts || [];

        const conceptExists = existingConcepts.some(
          (c) => c.concept_id === conceptId
        );

        if (!conceptExists) {
          await updateDoc(indexDoc.ref, {
            concepts: [
              ...existingConcepts,
              {
                concept_id: conceptId,
                category,
                difficulty,
                updated_at: new Date(),
              },
            ],
            total_concepts: existingConcepts.length + 1,
          });
        }
      } else {
        await addDoc(collection(db, indexCollection), {
          word: word,
          concepts: [
            {
              concept_id: conceptId,
              category,
              difficulty,
              updated_at: new Date(),
            },
          ],
          total_concepts: 1,
          created_at: new Date(),
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

  // 개념 삭제 (관련 컬렉션 데이터도 함께 삭제)
  async deleteConcept(conceptId) {
    try {
      console.log("개념 삭제 시작:", conceptId);

      // 먼저 개념 정보를 가져옵니다
      const conceptRef = doc(db, "concepts", conceptId);
      const conceptDoc = await getDoc(conceptRef);

      if (!conceptDoc.exists()) {
        throw new Error("삭제할 개념을 찾을 수 없습니다");
      }

      const conceptData = conceptDoc.data();
      console.log("삭제할 개념 데이터:", conceptData);

      // 1. 관련 예문 삭제 (examples 컬렉션)
      try {
        const examplesQuery = query(
          collection(db, "examples"),
          where("concept_id", "==", conceptId)
        );
        const exampleSnapshot = await getDocs(examplesQuery);

        const exampleDeletePromises = exampleSnapshot.docs.map((doc) =>
          deleteDoc(doc.ref)
        );
        await Promise.all(exampleDeletePromises);
        console.log(`${exampleSnapshot.size}개의 관련 예문 삭제 완료`);
      } catch (error) {
        console.warn("예문 삭제 중 오류:", error);
      }

      // 2. 관련 문법 패턴 삭제 (grammar 컬렉션)
      // 문법 패턴은 독립적으로 관리되므로 개념 삭제 시 별도 처리 불필요

      // 3. 관련 퀴즈 템플릿 삭제 (quiz_templates 컬렉션)
      try {
        const quizQuery = query(
          collection(db, "quiz_templates"),
          where("source_concept_id", "==", conceptId)
        );
        const quizSnapshot = await getDocs(quizQuery);

        const quizDeletePromises = quizSnapshot.docs.map((doc) =>
          deleteDoc(doc.ref)
        );
        await Promise.all(quizDeletePromises);
        console.log(`${quizSnapshot.size}개의 관련 퀴즈 템플릿 삭제 완료`);
      } catch (error) {
        console.warn("퀴즈 템플릿 삭제 중 오류:", error);
      }

      // 4. 관련 게임 데이터 삭제 (game_data 컬렉션)
      try {
        const gameQuery = query(
          collection(db, "game_data"),
          where("concept_id", "==", conceptId)
        );
        const gameSnapshot = await getDocs(gameQuery);

        const gameDeletePromises = gameSnapshot.docs.map((doc) =>
          deleteDoc(doc.ref)
        );
        await Promise.all(gameDeletePromises);
        console.log(`${gameSnapshot.size}개의 관련 게임 데이터 삭제 완료`);
      } catch (error) {
        console.warn("게임 데이터 삭제 중 오류:", error);
      }

      // 5. 각 언어 인덱스에서 개념을 제거합니다
      for (const [lang, expression] of Object.entries(
        conceptData.expressions || {}
      )) {
        if (expression?.word) {
          await this.removeFromLanguageIndex(lang, expression.word, conceptId);
        }
      }

      // 6. 문법 인덱스에서도 제거 (추가적인 정리)
      for (const lang of Object.keys(conceptData.expressions || {})) {
        try {
          const grammarIndexQuery = query(
            collection(db, `${lang}_grammar_index`),
            where("concept_ids", "array-contains", conceptId)
          );
          const grammarIndexSnapshot = await getDocs(grammarIndexQuery);

          for (const indexDoc of grammarIndexSnapshot.docs) {
            const indexData = indexDoc.data();
            const updatedConceptIds = indexData.concept_ids.filter(
              (id) => id !== conceptId
            );

            if (updatedConceptIds.length === 0) {
              await deleteDoc(indexDoc.ref);
            } else {
              await updateDoc(indexDoc.ref, {
                concept_ids: updatedConceptIds,
              });
            }
          }
        } catch (error) {
          console.warn(`${lang} 문법 인덱스 정리 중 오류:`, error);
        }
      }

      // 7. 개념 문서 자체를 삭제합니다
      await deleteDoc(conceptRef);
      console.log("개념 문서 삭제 완료");

      // 8. 사용자의 개념 수 업데이트
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

      console.log("개념 및 관련 데이터 삭제 완료:", conceptId);
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

  // 사용자의 모든 개념 가져오기
  async getUserConcepts(userId) {
    try {
      const conceptsRef = collection(db, "concepts");
      const q = query(conceptsRef, where("userId", "==", userId));
      const querySnapshot = await getDocs(q);

      const concepts = [];
      querySnapshot.forEach((doc) => {
        concepts.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      return concepts;
    } catch (error) {
      console.error("사용자 개념 가져오기 중 오류 발생:", error);
      throw error;
    }
  },

  // 사용자 사용량 정보 가져오기
  async getUsage(userId) {
    try {
      // console.log("🔍 사용량 정보 조회 시작:", userId); // 개인정보 노출 방지로 주석 처리
      const userRef = doc(db, "users", userId);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();

        const result = {
          aiUsed: userData.aiUsed || 0,
          aiLimit: userData.maxAiUsage || userData.aiLimit || 10, // maxAiUsage 우선 사용
          conceptCount: userData.conceptCount || 0,
          wordCount: userData.wordCount || userData.conceptCount || 0, // wordCount 필드 추가
          maxWordCount: userData.maxWordCount || 50, // 단어장 최대 개수
        };

        return result;
      } else {
        // 사용자 문서가 없으면 기본값으로 생성
        const defaultData = {
          aiUsed: 0,
          maxAiUsage: 10, // 기본 AI 사용량
          aiLimit: 10, // 호환성을 위해 유지
          conceptCount: 0,
          wordCount: 0, // wordCount 필드 추가
          maxWordCount: 50, // 기본 단어장 최대 개수
          createdAt: new Date(),
        };

        await setDoc(userRef, defaultData);

        return {
          aiUsed: 0,
          aiLimit: 10,
          conceptCount: 0,
          wordCount: 0,
          maxWordCount: 50,
        };
      }
    } catch (error) {
      console.error("사용량 정보 가져오기 중 오류 발생:", error);
      throw error;
    }
  },

  // 사용자 사용량 정보 업데이트
  async updateUsage(userId, updates) {
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        ...updates,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error("사용량 정보 업데이트 중 오류 발생:", error);
      throw error;
    }
  },

  // AI 개념을 ai-recommend 컬렉션에 저장 (분리된 컬렉션 구조)
  async createAIConcept(userEmail, conceptData) {
    try {
      console.log("🤖 AI 개념 생성 시작 (분리된 컬렉션 구조)");
      console.log("📋 입력 데이터:", conceptData);

      // 고유 ID 생성
      const conceptId = `ai_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      // 분리된 컬렉션 구조로 데이터 준비 (다국어 단어장과 완전히 동일한 구조)
      const aiConceptData = {
        // 개념 고유 ID
        concept_id: conceptId,

        // 개념 기본 정보 (다국어 단어장과 동일)
        concept_info: {
          domain:
            conceptData.concept_info?.domain || conceptData.domain || "general",
          category:
            conceptData.concept_info?.category ||
            conceptData.category ||
            "common",
          difficulty: conceptData.concept_info?.difficulty || "beginner",
          unicode_emoji:
            conceptData.concept_info?.unicode_emoji ||
            conceptData.concept_info?.emoji ||
            "🤖",
          color_theme: conceptData.concept_info?.color_theme || "#9C27B0",
          tags: conceptData.concept_info?.tags || [],
        },

        // 언어별 표현 (다국어 단어장과 완전히 동일한 구조)
        expressions: conceptData.expressions || {},

        // 대표 예문 (다국어 단어장과 완전히 동일한 구조)
        representative_example: conceptData.representative_example || null,

        // 추가 예문들 (다국어 단어장과 완전히 동일한 구조)
        examples: conceptData.examples || [],

        // 🎲 효율적인 랜덤 쿼리를 위한 필드 (다국어 단어장과 동일)
        randomField: Math.random(),

        // 시간 정보 (단일화)
        created_at: new Date(),
      };

      console.log("🔧 변환된 AI 개념 데이터:", aiConceptData);

      // 사용자별 ai-recommend 컬렉션에 저장
      const userAIRef = doc(db, "ai-recommend", userEmail);
      const userAIDoc = await getDoc(userAIRef);

      if (userAIDoc.exists()) {
        // 기존 문서가 있으면 concepts 배열에 추가
        const userData = userAIDoc.data();
        const existingConcepts = userData.concepts || [];

        await updateDoc(userAIRef, {
          concepts: [...existingConcepts, aiConceptData],
          totalConcepts: existingConcepts.length + 1,
          lastUpdated: new Date(),
        });
        console.log("✅ 기존 사용자 문서에 AI 개념 추가됨");
      } else {
        // 새 문서 생성
        await setDoc(userAIRef, {
          userEmail: userEmail,
          concepts: [aiConceptData],
          totalConcepts: 1,
          createdAt: new Date(),
          lastUpdated: new Date(),
        });
        console.log("✅ 새 사용자 문서 생성 및 AI 개념 추가됨");
      }

      console.log("🎉 AI 개념 생성 완료:", conceptId);
      return conceptId;
    } catch (error) {
      console.error("❌ AI 개념 생성 중 오류 발생:", error);
      throw error;
    }
  },

  // 사용자의 AI 개념 목록 가져오기 (분리된 컬렉션 구조)
  async getUserAIConcepts(userEmail) {
    try {
      const userAIRef = doc(db, "ai-recommend", userEmail);
      const userAIDoc = await getDoc(userAIRef);

      if (userAIDoc.exists()) {
        const userData = userAIDoc.data();
        const concepts = userData.concepts || [];

        // 원본 데이터 구조 디버깅
        if (concepts.length > 0) {
          console.log("🔍 원본 AI 개념 데이터 구조 분석:");
          const sampleConcept = concepts[0];
          console.log("  - concept_id:", sampleConcept.concept_id);
          console.log("  - concept_info:", sampleConcept.concept_info);
          console.log(
            "  - expressions keys:",
            Object.keys(sampleConcept.expressions || {})
          );
          console.log(
            "  - representative_example:",
            sampleConcept.representative_example
          );
          console.log(
            "  - examples:",
            sampleConcept.examples,
            "Type:",
            typeof sampleConcept.examples,
            "Length:",
            sampleConcept.examples?.length
          );
          console.log("  - 전체 키들:", Object.keys(sampleConcept));
        }

        // 분리된 컬렉션 구조에 맞게 데이터 매핑
        const mappedConcepts = concepts.map((concept) => {
          // 기본 ID 설정
          const conceptId =
            concept.concept_id ||
            concept._id ||
            concept.id ||
            `ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

          return {
            // 기본 식별자들
            concept_id: conceptId,
            id: conceptId,
            _id: conceptId,

            // 개념 정보 (다국어 단어장과 완전히 동일)
            concept_info: concept.concept_info || {
              domain: concept.domain || "general",
              category: concept.category || "common",
              difficulty: concept.difficulty || "beginner",
              unicode_emoji: concept.unicode_emoji || concept.emoji || "🤖",
              color_theme: concept.concept_info?.color_theme || "#9C27B0",
              tags: concept.tags || [],
            },

            // 언어별 표현 (다국어 단어장과 완전히 동일)
            expressions: concept.expressions || {},

            // 대표 예문 (다국어 단어장과 완전히 동일)
            representative_example: concept.representative_example || null,

            // 추가 예문들 (다국어 단어장과 완전히 동일)
            examples: concept.examples || [],

            // 시간 정보 (단일화)
            created_at: concept.created_at || concept.createdAt || new Date(),
            createdAt: concept.created_at || concept.createdAt || new Date(), // 호환성
          };
        });

        console.log("✅ AI 개념 매핑 완료:", mappedConcepts.length);
        console.log("📊 첫 번째 개념 샘플:", mappedConcepts[0]);

        return mappedConcepts;
      } else {
        console.log("📭 사용자 AI 개념 문서가 존재하지 않음");
        return [];
      }
    } catch (error) {
      console.error("❌ 사용자 AI 개념 가져오기 중 오류 발생:", error);
      return [];
    }
  },

  // AI 개념 삭제 (분리된 컬렉션 구조)
  async deleteAIConcept(userEmail, conceptId) {
    try {
      const userAIRef = doc(db, "ai-recommend", userEmail);
      const userAIDoc = await getDoc(userAIRef);

      if (userAIDoc.exists()) {
        const userData = userAIDoc.data();
        const concepts = userData.concepts || [];

        console.log(`📚 삭제 전 총 개념 수: ${concepts.length}`);

        // 해당 개념 제거 (분리된 컬렉션 구조의 ID들로 검색)
        const updatedConcepts = concepts.filter(
          (concept) =>
            concept.concept_id !== conceptId &&
            concept._id !== conceptId &&
            concept.id !== conceptId
        );

        console.log(`📚 삭제 후 총 개념 수: ${updatedConcepts.length}`);

        if (updatedConcepts.length < concepts.length) {
          await updateDoc(userAIRef, {
            concepts: updatedConcepts,
            totalConcepts: updatedConcepts.length,
            lastUpdated: new Date(),
          });
          console.log("✅ AI 개념 삭제 완료");
          return true;
        } else {
          console.log("⚠️ 삭제할 개념을 찾을 수 없음");
          return false;
        }
      } else {
        console.log("📭 사용자 AI 개념 문서가 존재하지 않음");
        return false;
      }
    } catch (error) {
      console.error("❌ AI 개념 삭제 중 오류 발생:", error);
      throw error;
    }
  },

  // 최근 생성된 AI 개념들 조회 (다양성 확보를 위한 제외 목록 생성용)
  async getRecentAIConcepts(
    userEmail,
    domain = null,
    category = null,
    limit = 10
  ) {
    try {
      console.log("🔍 최근 AI 개념 조회 시작:", {
        userEmail,
        domain,
        category,
        limit,
      });

      const userAIRef = doc(db, "ai-recommend", userEmail);
      const userAIDoc = await getDoc(userAIRef);

      if (userAIDoc.exists()) {
        const userData = userAIDoc.data();
        let concepts = userData.concepts || [];

        console.log(`📚 총 AI 개념 수: ${concepts.length}`);

        // 도메인/카테고리 필터링
        if (domain || category) {
          concepts = concepts.filter((concept) => {
            const conceptDomain =
              concept.concept_info?.domain || concept.domain;
            const conceptCategory =
              concept.concept_info?.category || concept.category;

            let matches = true;
            if (domain && conceptDomain !== domain) matches = false;
            if (category && conceptCategory !== category) matches = false;

            return matches;
          });
          console.log(
            `📚 필터링 후 개념 수: ${concepts.length} (도메인: ${domain}, 카테고리: ${category})`
          );
        }

        // 생성 시간 기준 정렬 (최신순)
        concepts.sort((a, b) => {
          const timeA = new Date(a.created_at || a.createdAt || 0);
          const timeB = new Date(b.created_at || b.createdAt || 0);
          return timeB - timeA;
        });

        // 제한 수만큼 반환
        const recentConcepts = concepts.slice(0, limit);

        console.log(`✅ 최근 AI 개념 ${recentConcepts.length}개 반환`);
        return recentConcepts;
      } else {
        console.log("📭 사용자 AI 개념 문서가 존재하지 않음");
        return [];
      }
    } catch (error) {
      console.error("❌ 최근 AI 개념 조회 중 오류 발생:", error);
      return [];
    }
  },

  // AI 개념 수정 (분리된 컬렉션 구조)
  async updateAIConcept(userEmail, conceptId, updatedData) {
    try {
      const userAIRef = doc(db, "ai-recommend", userEmail);
      const userAIDoc = await getDoc(userAIRef);

      if (userAIDoc.exists()) {
        const userData = userAIDoc.data();
        const concepts = userData.concepts || [];

        // 해당 개념 찾기
        const conceptIndex = concepts.findIndex(
          (concept) =>
            concept.concept_id === conceptId ||
            concept._id === conceptId ||
            concept.id === conceptId
        );

        if (conceptIndex !== -1) {
          // 기존 개념 업데이트
          const updatedConcept = {
            ...concepts[conceptIndex],
            ...updatedData,
            metadata: {
              ...concepts[conceptIndex].metadata,
              ...updatedData.metadata,
              updated_at: new Date(),
            },
            updated_at: new Date(),
          };

          concepts[conceptIndex] = updatedConcept;

          await updateDoc(userAIRef, {
            concepts: concepts,
            lastUpdated: new Date(),
          });

          console.log("✅ AI 개념 수정 완료");
          return true;
        } else {
          console.log("❌ 수정할 AI 개념을 찾을 수 없음");
          return false;
        }
      } else {
        console.log("📭 사용자 AI 개념 문서가 존재하지 않음");
        return false;
      }
    } catch (error) {
      console.error("❌ AI 개념 수정 중 오류 발생:", error);
      throw error;
    }
  },
};

// 퀴즈 템플릿 유틸리티
export const quizTemplateUtils = {
  // 퀴즈 템플릿 가져오기
  async getQuizTemplate(templateId) {
    try {
      const templateDoc = await getDoc(doc(db, "quiz_templates", templateId));
      if (templateDoc.exists()) {
        return templateDoc.data();
      }
      return null;
    } catch (error) {
      console.error("퀴즈 템플릿 가져오기 중 오류 발생:", error);
      throw error;
    }
  },

  // 모든 퀴즈 템플릿 가져오기
  async getAllQuizTemplates() {
    try {
      const templatesRef = collection(db, "quiz_templates");
      const querySnapshot = await getDocs(templatesRef);

      const templates = [];
      querySnapshot.forEach((doc) => {
        templates.push({ id: doc.id, ...doc.data() });
      });

      return templates;
    } catch (error) {
      console.error("퀴즈 템플릿 목록 가져오기 중 오류 발생:", error);
      return [];
    }
  },

  // 퀴즈 템플릿 생성/업데이트
  async saveQuizTemplate(templateId, templateData) {
    try {
      const templateRef = templateId
        ? doc(db, "quiz_templates", templateId)
        : doc(collection(db, "quiz_templates"));

      await setDoc(templateRef, {
        ...templateData,
        updated_at: new Date(),
        created_at: templateData.created_at || new Date(),
      });

      return templateRef.id;
    } catch (error) {
      console.error("퀴즈 템플릿 저장 중 오류 발생:", error);
      throw error;
    }
  },
};

// 사용자 진도 관리 유틸리티 (개선된 버전)
export const userProgressUtils = {
  // 사용자 진도 정보 가져오기 (통합 관리)
  async getUserProgress(userEmail) {
    try {
      const userRef = doc(db, "users", userEmail);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();

        // 기존 구조와 새로운 구조 모두 지원
        return {
          // 기본 사용자 정보
          email: userData.email,
          displayName: userData.displayName,
          createdAt: userData.createdAt,
          lastLoginAt: userData.lastLoginAt,

          // 개념 사용량 (기존 필드 유지)
          conceptCount: userData.conceptCount || 0,

          // 언어별 학습 진도 (새로운 구조)
          vocabulary_progress: userData.vocabulary_progress || {},

          // 전체 학습 통계
          learning_streak: userData.learning_streak || {
            current_streak: 0,
            longest_streak: 0,
            last_study_date: null,
          },

          // 최근 활동 기록
          recent_activities: userData.recent_activities || [],

          // 학습 설정
          learning_preferences: userData.learning_preferences || {
            daily_goal: 10, // 일일 목표 개념 수
            preferred_difficulty: "intermediate",
            study_reminder: true,
            audio_enabled: true,
          },

          // 성취도 및 배지
          achievements: userData.achievements || [],
          badges: userData.badges || [],

          // 분리된 컬렉션 연동 메타데이터
          collection_metadata: userData.collection_metadata || {
            last_sync: null,
            separated_collections_enabled: true,
            migration_status: "pending",
          },
        };
      } else {
        // 새 사용자 초기 데이터 생성
        const initialData = this.createInitialUserProgress(userEmail);
        await setDoc(userRef, initialData);
        return initialData;
      }
    } catch (error) {
      console.error("사용자 진도 조회 중 오류:", error);
      throw error;
    }
  },

  // 새 사용자 초기 진도 데이터 생성
  createInitialUserProgress(userEmail) {
    return {
      email: userEmail,
      displayName: "",
      createdAt: new Date(),
      lastLoginAt: new Date(),
      conceptCount: 0,
      vocabulary_progress: {},
      learning_streak: {
        current_streak: 0,
        longest_streak: 0,
        last_study_date: null,
      },
      recent_activities: [],
      learning_preferences: {
        daily_goal: 10,
        preferred_difficulty: "intermediate",
        study_reminder: true,
        audio_enabled: true,
      },
      achievements: [],
      badges: [],
      collection_metadata: {
        last_sync: new Date(),
        separated_collections_enabled: true,
        migration_status: "completed",
      },
    };
  },

  // 언어별 어휘 진도 업데이트
  async updateVocabularyProgress(
    userEmail,
    language,
    conceptId,
    status,
    metadata = {}
  ) {
    try {
      const userRef = doc(db, "users", userEmail);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        await this.getUserProgress(userEmail); // 초기 데이터 생성
      }

      const userData = userDoc.data();
      const vocabularyProgress = userData.vocabulary_progress || {};
      const languageProgress = vocabularyProgress[language] || {
        known_words: {},
        learning_words: {},
        weak_words: {},
        total_study_time: 0,
        quiz_stats: {
          total_quizzes: 0,
          average_score: 0,
          best_score: 0,
          last_quiz_date: null,
        },
        game_stats: {
          total_games: 0,
          average_score: 0,
          favorite_type: null,
          last_game_date: null,
        },
        grammar_progress: {},
        last_updated: new Date(),
      };

      // 개념 상태 업데이트
      const conceptData = {
        concept_id: conceptId,
        status: status,
        first_learned:
          languageProgress.known_words[conceptId]?.first_learned || new Date(),
        last_reviewed: new Date(),
        review_count:
          (languageProgress.known_words[conceptId]?.review_count || 0) + 1,
        accuracy_history:
          languageProgress.known_words[conceptId]?.accuracy_history || [],
        ...metadata,
      };

      // 이전 상태에서 제거
      delete languageProgress.known_words[conceptId];
      delete languageProgress.learning_words[conceptId];
      delete languageProgress.weak_words[conceptId];

      // 새 상태에 추가
      switch (status) {
        case "known":
          languageProgress.known_words[conceptId] = conceptData;
          break;
        case "learning":
          languageProgress.learning_words[conceptId] = conceptData;
          break;
        case "weak":
          languageProgress.weak_words[conceptId] = conceptData;
          break;
      }

      languageProgress.last_updated = new Date();
      vocabularyProgress[language] = languageProgress;

      await updateDoc(userRef, {
        vocabulary_progress: vocabularyProgress,
        [`collection_metadata.last_sync`]: new Date(),
      });

      // 학습 활동 기록
      await this.recordActivity(userEmail, {
        type: "vocabulary_updated",
        language: language,
        concept_id: conceptId,
        status: status,
        metadata: metadata,
      });
    } catch (error) {
      console.error("어휘 진도 업데이트 중 오류:", error);
      throw error;
    }
  },

  // 퀴즈 통계 업데이트
  async updateQuizStats(
    userEmail,
    language,
    accuracy,
    timeSpent,
    quizType = "mixed"
  ) {
    try {
      const userRef = doc(db, "users", userEmail);
      const userDoc = await getDoc(userRef);
      const userData = userDoc.data();

      const vocabularyProgress = userData.vocabulary_progress || {};
      const languageProgress = vocabularyProgress[language] || {};
      const quizStats = languageProgress.quiz_stats || {
        total_quizzes: 0,
        average_score: 0,
        best_score: 0,
        last_quiz_date: null,
      };

      // 통계 업데이트
      const newTotalQuizzes = quizStats.total_quizzes + 1;
      const newAverageScore = Math.round(
        (quizStats.average_score * quizStats.total_quizzes + accuracy) /
          newTotalQuizzes
      );
      const newBestScore = Math.max(quizStats.best_score, accuracy);

      const updatedQuizStats = {
        total_quizzes: newTotalQuizzes,
        average_score: newAverageScore,
        best_score: newBestScore,
        last_quiz_date: new Date(),
        total_time_spent: (quizStats.total_time_spent || 0) + timeSpent,
      };

      // 언어별 진도에 반영
      if (!vocabularyProgress[language]) {
        vocabularyProgress[language] = {};
      }
      vocabularyProgress[language].quiz_stats = updatedQuizStats;
      vocabularyProgress[language].total_study_time =
        (vocabularyProgress[language].total_study_time || 0) +
        Math.round(timeSpent / 60);

      await updateDoc(userRef, {
        vocabulary_progress: vocabularyProgress,
      });

      // 학습 스트릭 업데이트
      await this.updateLearningStreak(userEmail);

      // 성취도 확인
      await this.checkAchievements(userEmail, {
        type: "quiz_completed",
        language: language,
        accuracy: accuracy,
        quiz_type: quizType,
      });
    } catch (error) {
      console.error("퀴즈 통계 업데이트 중 오류:", error);
      throw error;
    }
  },

  // 게임 통계 업데이트
  async updateGameStats(userEmail, language, gameType, score, timeSpent) {
    try {
      const userRef = doc(db, "users", userEmail);
      const userDoc = await getDoc(userRef);
      const userData = userDoc.data();

      const vocabularyProgress = userData.vocabulary_progress || {};
      const languageProgress = vocabularyProgress[language] || {};
      const gameStats = languageProgress.game_stats || {
        total_games: 0,
        average_score: 0,
        favorite_type: null,
        last_game_date: null,
        game_type_stats: {},
      };

      // 전체 게임 통계 업데이트
      const newTotalGames = gameStats.total_games + 1;
      const newAverageScore = Math.round(
        (gameStats.average_score * gameStats.total_games + score) /
          newTotalGames
      );

      // 게임 타입별 통계 업데이트
      const gameTypeStats = gameStats.game_type_stats || {};
      if (!gameTypeStats[gameType]) {
        gameTypeStats[gameType] = {
          total_games: 0,
          average_score: 0,
          best_score: 0,
          total_time: 0,
        };
      }

      const typeStats = gameTypeStats[gameType];
      typeStats.total_games += 1;
      typeStats.average_score = Math.round(
        (typeStats.average_score * (typeStats.total_games - 1) + score) /
          typeStats.total_games
      );
      typeStats.best_score = Math.max(typeStats.best_score, score);
      typeStats.total_time += timeSpent;

      // 선호 게임 타입 결정
      const favoriteType =
        Object.entries(gameTypeStats).sort(
          ([, a], [, b]) => b.total_games - a.total_games
        )[0]?.[0] || gameType;

      const updatedGameStats = {
        total_games: newTotalGames,
        average_score: newAverageScore,
        favorite_type: favoriteType,
        last_game_date: new Date(),
        game_type_stats: gameTypeStats,
      };

      // 언어별 진도에 반영
      if (!vocabularyProgress[language]) {
        vocabularyProgress[language] = {};
      }
      vocabularyProgress[language].game_stats = updatedGameStats;
      vocabularyProgress[language].total_study_time =
        (vocabularyProgress[language].total_study_time || 0) +
        Math.round(timeSpent / 60);

      await updateDoc(userRef, {
        vocabulary_progress: vocabularyProgress,
      });

      // 학습 스트릭 업데이트
      await this.updateLearningStreak(userEmail);
    } catch (error) {
      console.error("게임 통계 업데이트 중 오류:", error);
      throw error;
    }
  },

  // 학습 활동 기록
  async recordActivity(userEmail, activityData) {
    try {
      const userRef = doc(db, "users", userEmail);
      const userDoc = await getDoc(userRef);
      const userData = userDoc.data();

      const recentActivities = userData.recent_activities || [];

      const newActivity = {
        id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
        ...activityData,
      };

      // 최근 활동 목록에 추가 (최대 100개 유지)
      recentActivities.unshift(newActivity);
      const trimmedActivities = recentActivities.slice(0, 100);

      await updateDoc(userRef, {
        recent_activities: trimmedActivities,
        lastLoginAt: new Date(),
      });
    } catch (error) {
      console.error("학습 활동 기록 중 오류:", error);
      throw error;
    }
  },

  // 학습 스트릭 업데이트
  async updateLearningStreak(userEmail) {
    try {
      const userRef = doc(db, "users", userEmail);
      const userDoc = await getDoc(userRef);
      const userData = userDoc.data();

      const learningStreak = userData.learning_streak || {
        current_streak: 0,
        longest_streak: 0,
        last_study_date: null,
      };

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const lastStudyDate = learningStreak.last_study_date
        ? new Date(learningStreak.last_study_date.toDate())
        : null;

      if (lastStudyDate) {
        lastStudyDate.setHours(0, 0, 0, 0);

        const daysDiff = Math.floor(
          (today - lastStudyDate) / (1000 * 60 * 60 * 24)
        );

        if (daysDiff === 0) {
          // 오늘 이미 학습함 - 스트릭 유지
          return;
        } else if (daysDiff === 1) {
          // 연속 학습 - 스트릭 증가
          learningStreak.current_streak += 1;
        } else {
          // 연속 학습 중단 - 스트릭 리셋
          learningStreak.current_streak = 1;
        }
      } else {
        // 첫 학습 - 스트릭 시작
        learningStreak.current_streak = 1;
      }

      // 최장 스트릭 업데이트
      learningStreak.longest_streak = Math.max(
        learningStreak.longest_streak,
        learningStreak.current_streak
      );

      learningStreak.last_study_date = new Date();

      await updateDoc(userRef, {
        learning_streak: learningStreak,
      });
    } catch (error) {
      console.error("학습 스트릭 업데이트 중 오류:", error);
      throw error;
    }
  },

  // 성취도 확인 및 업데이트
  async checkAchievements(userEmail, activityData) {
    try {
      const userProgress = await this.getUserProgress(userEmail);
      const achievements = userProgress.achievements || [];
      const newAchievements = [];

      // 퀴즈 관련 성취도
      if (activityData.type === "quiz_completed") {
        const quizStats =
          userProgress.vocabulary_progress?.[activityData.language]?.quiz_stats;

        if (quizStats) {
          // 첫 퀴즈 완료
          if (
            quizStats.total_quizzes === 1 &&
            !achievements.includes("first_quiz")
          ) {
            newAchievements.push("first_quiz");
          }

          // 퀴즈 10회 완료
          if (
            quizStats.total_quizzes >= 10 &&
            !achievements.includes("quiz_veteran")
          ) {
            newAchievements.push("quiz_veteran");
          }

          // 완벽한 점수
          if (
            activityData.accuracy === 100 &&
            !achievements.includes("perfect_score")
          ) {
            newAchievements.push("perfect_score");
          }
        }
      }

      // 학습 스트릭 관련 성취도
      const currentStreak = userProgress.learning_streak?.current_streak || 0;
      if (currentStreak >= 7 && !achievements.includes("week_streak")) {
        newAchievements.push("week_streak");
      }
      if (currentStreak >= 30 && !achievements.includes("month_streak")) {
        newAchievements.push("month_streak");
      }

      // 새 성취도가 있으면 업데이트
      if (newAchievements.length > 0) {
        const userRef = doc(db, "users", userEmail);
        await updateDoc(userRef, {
          achievements: [...achievements, ...newAchievements],
        });

        // 성취도 알림 기록
        await this.recordActivity(userEmail, {
          type: "achievement_unlocked",
          achievements: newAchievements,
        });
      }
    } catch (error) {
      console.error("성취도 확인 중 오류:", error);
    }
  },

  // 분리된 컬렉션과 사용자 진도 동기화
  async syncWithSeparatedCollections(userEmail) {
    try {
      const userProgress = await this.getUserProgress(userEmail);

      // 각 언어별로 분리된 컬렉션 데이터와 동기화
      for (const language of Object.keys(
        userProgress.vocabulary_progress || {}
      )) {
        await this.syncLanguageProgress(userEmail, language);
      }

      // 동기화 완료 표시
      const userRef = doc(db, "users", userEmail);
      await updateDoc(userRef, {
        [`collection_metadata.last_sync`]: new Date(),
        [`collection_metadata.migration_status`]: "completed",
      });
    } catch (error) {
      console.error("분리된 컬렉션 동기화 중 오류:", error);
      throw error;
    }
  },

  // 언어별 진도 동기화
  async syncLanguageProgress(userEmail, language) {
    try {
      // 분리된 컬렉션에서 사용자가 학습한 개념들 조회
      const userConcepts = await collectionManager.getUserConceptsProgress(
        userEmail,
        language
      );

      // 사용자 진도 데이터와 비교하여 업데이트
      for (const conceptProgress of userConcepts) {
        await this.updateVocabularyProgress(
          userEmail,
          language,
          conceptProgress.concept_id,
          conceptProgress.status,
          {
            accuracy: conceptProgress.accuracy,
            last_studied: conceptProgress.last_studied,
            study_count: conceptProgress.study_count,
          }
        );
      }
    } catch (error) {
      console.error(`${language} 언어 진도 동기화 중 오류:`, error);
      throw error;
    }
  },

  // ... existing methods remain the same ...
};

// 추가 예문 관리 유틸리티
export const additionalExamplesUtils = {
  // 추가 예문 생성
  async createAdditionalExample(conceptId, exampleData) {
    try {
      const exampleRef = doc(collection(db, "additional_examples"));

      const enhancedExample = {
        concept_id: conceptId,
        level: exampleData.level || "beginner",
        context: exampleData.context || "general",
        priority: exampleData.priority || "medium",
        unicode_emoji: exampleData.unicode_emoji || "💬",
        quiz_weight: exampleData.quiz_weight || 1,
        translations: exampleData.translations || {},
        difficulty_notes: exampleData.difficulty_notes || "",
        created_at: new Date(),
      };

      await setDoc(exampleRef, enhancedExample);
      return exampleRef.id;
    } catch (error) {
      console.error("추가 예문 생성 중 오류 발생:", error);
      throw error;
    }
  },

  // 컨텍스트별 예문 가져오기
  async getExamplesByContext(conceptId, context) {
    try {
      const examplesRef = collection(db, "additional_examples");
      const q = query(
        examplesRef,
        where("concept_id", "==", conceptId),
        where("context", "==", context)
      );

      const querySnapshot = await getDocs(q);
      const examples = [];

      querySnapshot.forEach((doc) => {
        examples.push({ id: doc.id, ...doc.data() });
      });

      return examples;
    } catch (error) {
      console.error("컨텍스트별 예문 가져오기 중 오류 발생:", error);
      return [];
    }
  },

  // 난이도별 예문 가져오기
  async getExamplesByLevel(conceptId, level) {
    try {
      const examplesRef = collection(db, "additional_examples");
      const q = query(
        examplesRef,
        where("concept_id", "==", conceptId),
        where("level", "==", level)
      );

      const querySnapshot = await getDocs(q);
      const examples = [];

      querySnapshot.forEach((doc) => {
        examples.push({ id: doc.id, ...doc.data() });
      });

      return examples;
    } catch (error) {
      console.error("난이도별 예문 가져오기 중 오류 발생:", error);
      return [];
    }
  },
};

// 미디어 로딩 유틸리티
export const mediaUtils = {
  // 이미지 URL 생성 (Unsplash API 활용)
  generateImageUrls(concept, size = "400x300") {
    const baseUrl = "https://source.unsplash.com";
    const domain = concept.concept_info?.domain || "general";
    const category = concept.concept_info?.category || "common";

    return {
      primary: `${baseUrl}/${size}/?${domain},${category}`,
      secondary: `${baseUrl}/${size}/?${category}`,
      illustration: `https://api.iconify.design/noto:${category}.svg?width=400`,
      emoji_style: `https://api.iconify.design/twemoji:${category}.svg?width=200`,
      line_art: `https://api.iconify.design/carbon:${category}.svg?width=300`,
    };
  },

  // 오디오 URL 생성 (Text-to-Speech API)
  generateAudioUrls(text, language) {
    const voiceRssKey = "demo"; // 실제 키로 교체 필요
    const languageMap = {
      korean: "ko-kr",
      english: "en-us",
      japanese: "ja-jp",
      chinese: "zh-cn",
    };

    const langCode = languageMap[language] || "en-us";
    const baseUrl = "https://api.voicerss.org";

    return {
      normal: `${baseUrl}/?key=${voiceRssKey}&hl=${langCode}&src=${encodeURIComponent(
        text
      )}`,
      slow: `${baseUrl}/?key=${voiceRssKey}&hl=${langCode}&r=-2&src=${encodeURIComponent(
        text
      )}`,
    };
  },

  // 이미지 지연 로딩
  async lazyLoadImage(url, placeholder = null) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(url);
      img.onerror = () => resolve(placeholder);
      img.src = url;
    });
  },

  // 오디오 프리로딩
  async preloadAudio(url) {
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      audio.oncanplaythrough = () => resolve(audio);
      audio.onerror = () => reject(new Error("오디오 로딩 실패"));
      audio.src = url;
    });
  },
};

// 검색 및 필터링 유틸리티
export const searchUtils = {
  // 고급 개념 검색
  async searchConceptsAdvanced(searchOptions) {
    try {
      const {
        query = "",
        languages = [],
        domains = [],
        categories = [],
        difficulty = null,
        limit = 20,
      } = searchOptions;

      const conceptsRef = collection(db, "concepts");
      let q = conceptsRef;

      // 도메인 필터
      if (domains.length > 0) {
        q = query(q, where("concept_info.domain", "in", domains));
      }

      // 카테고리 필터
      if (categories.length > 0) {
        q = query(q, where("concept_info.category", "in", categories));
      }

      // 난이도 필터
      if (difficulty) {
        q = query(q, where("concept_info.difficulty", "==", difficulty));
      }

      const querySnapshot = await getDocs(q);
      const concepts = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();

        // 언어 필터 적용
        if (languages.length > 0) {
          const hasLanguages = languages.some(
            (lang) => data.expressions[lang] && data.expressions[lang].word
          );
          if (!hasLanguages) return;
        }

        // 텍스트 검색 (단어 매칭)
        if (query) {
          const matchFound = Object.values(data.expressions).some(
            (expr) =>
              expr.word && expr.word.toLowerCase().includes(query.toLowerCase())
          );
          if (!matchFound) return;
        }

        concepts.push({ id: doc.id, ...data });
      });

      return concepts.slice(0, limit);
    } catch (error) {
      console.error("고급 개념 검색 중 오류 발생:", error);
      return [];
    }
  },

  // 자동완성 검색
  async getAutocompleteSuggestions(query, language, limit = 10) {
    try {
      const indexCollection = `${language}_index`;
      const indexRef = collection(db, indexCollection);

      // Firestore의 배열 쿼리를 사용한 prefix 검색
      const querySnapshot = await getDocs(indexRef);
      const suggestions = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (
          data.word &&
          data.word.toLowerCase().startsWith(query.toLowerCase())
        ) {
          suggestions.push({
            word: data.word,
            total_concepts: data.total_concepts || 1,
          });
        }
      });

      // 빈도순으로 정렬
      suggestions.sort((a, b) => b.total_concepts - a.total_concepts);
      return suggestions.slice(0, limit);
    } catch (error) {
      console.error("자동완성 검색 중 오류 발생:", error);
      return [];
    }
  },

  // 도메인/카테고리 목록 가져오기
  async getDomainCategories() {
    try {
      const conceptsRef = collection(db, "concepts");
      const querySnapshot = await getDocs(conceptsRef);

      const domains = new Set();
      const categories = new Set();

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.concept_info?.domain) domains.add(data.concept_info.domain);
        if (data.concept_info?.category)
          categories.add(data.concept_info.category);
      });

      return {
        domains: Array.from(domains).sort(),
        categories: Array.from(categories).sort(),
      };
    } catch (error) {
      console.error("도메인/카테고리 목록 가져오기 중 오류 발생:", error);
      return { domains: [], categories: [] };
    }
  },
};

// 데이터 마이그레이션 유틸리티
export const migrationUtils = {
  // 기존 단순 구조를 새 구조로 마이그레이션
  async migrateOldConcepts() {
    try {
      const conceptsRef = collection(db, "concepts");
      const querySnapshot = await getDocs(conceptsRef);

      const migratedCount = { success: 0, failed: 0 };

      for (const doc of querySnapshot.docs) {
        try {
          const oldData = doc.data();

          // 이미 새 구조인지 확인
          if (
            oldData.concept_info &&
            typeof oldData.concept_info === "object" &&
            oldData.concept_info.domain
          ) {
            continue; // 이미 마이그레이션됨
          }

          // 새 구조로 변환
          const newData = {
            _id: doc.id,
            concept_info: {
              domain: oldData.domain || "general",
              category: oldData.category || "common",
              difficulty: "basic",
              tags: [],
              unicode_emoji: oldData.emoji || "📚",
              color_theme: "#9C27B0",
              created_at: oldData.created_at || new Date(),
              updated_at: new Date(),
              total_examples_count: oldData.examples?.length || 0,
              quiz_frequency: "medium",
              game_types: ["matching", "pronunciation", "spelling"],
            },
            media: {
              images: {
                primary: null,
                secondary: null,
                illustration: null,
                emoji_style: null,
                line_art: null,
              },
              videos: {
                intro: null,
                pronunciation: null,
              },
              audio: {
                pronunciation_slow: null,
                pronunciation_normal: null,
                word_in_sentence: null,
              },
            },
            expressions: oldData.expressions || {},
            featured_examples: oldData.examples?.slice(0, 3) || [],
            quiz_data: {
              question_types: ["translation", "matching"],
              difficulty_multiplier: 1.0,
              common_mistakes: [],
              hint_text: {},
            },
            game_data: {
              memory_card: {},
              word_puzzle: {},
              pronunciation_game: {},
            },
            related_concepts: [],
            learning_metadata: {
              memorization_difficulty: 2,
              pronunciation_difficulty: 2,
              usage_frequency: "medium",
              cultural_importance: "medium",
            },
          };

          await updateDoc(doc.ref, newData);
          migratedCount.success++;
        } catch (error) {
          console.error(`개념 ${doc.id} 마이그레이션 실패:`, error);
          migratedCount.failed++;
        }
      }

      return migratedCount;
    } catch (error) {
      console.error("개념 마이그레이션 중 오류 발생:", error);
      throw error;
    }
  },
};

// 예문 유틸리티 함수
export const exampleUtils = {
  async createExample(exampleData) {
    try {
      const exampleRef = doc(collection(db, "examples"));
      await setDoc(exampleRef, {
        ...exampleData,
        userId: auth.currentUser?.email || "anonymous",
        created_at: new Date(),
        _id: exampleRef.id,
      });
      return exampleRef.id;
    } catch (error) {
      console.error("예문 생성 중 오류:", error);
      throw error;
    }
  },

  async getExample(exampleId) {
    try {
      const exampleDoc = await getDoc(doc(db, "examples", exampleId));
      if (exampleDoc.exists()) {
        return { id: exampleDoc.id, ...exampleDoc.data() };
      }
      return null;
    } catch (error) {
      console.error("예문 조회 중 오류:", error);
      throw error;
    }
  },

  async updateExample(exampleId, newData) {
    try {
      await updateDoc(doc(db, "examples", exampleId), {
        ...newData,
        updated_at: new Date(),
      });
    } catch (error) {
      console.error("예문 업데이트 중 오류:", error);
      throw error;
    }
  },

  async deleteExample(exampleId) {
    try {
      await deleteDoc(doc(db, "examples", exampleId));
    } catch (error) {
      console.error("예문 삭제 중 오류:", error);
      throw error;
    }
  },
};

// 문법 패턴 유틸리티 함수
export const grammarPatternUtils = {
  async createGrammarPattern(patternData) {
    try {
      const patternRef = doc(collection(db, "grammar"));
      await setDoc(patternRef, {
        ...patternData,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      });
      return patternRef.id;
    } catch (error) {
      console.error("문법 패턴 생성 중 오류:", error);
      throw error;
    }
  },

  async getGrammarPattern(patternId) {
    try {
      const patternDoc = await getDoc(doc(db, "grammar", patternId));
      if (patternDoc.exists()) {
        return { id: patternDoc.id, ...patternDoc.data() };
      }
      return null;
    } catch (error) {
      console.error("문법 패턴 조회 중 오류:", error);
      throw error;
    }
  },

  async updateGrammarPattern(patternId, newData) {
    try {
      await updateDoc(doc(db, "grammar", patternId), {
        ...newData,
        updated_at: new Date(),
      });
    } catch (error) {
      console.error("문법 패턴 업데이트 중 오류:", error);
      throw error;
    }
  },

  async deleteGrammarPattern(patternId) {
    try {
      await deleteDoc(doc(db, "grammar", patternId));
    } catch (error) {
      console.error("문법 패턴 삭제 중 오류:", error);
      throw error;
    }
  },
};

export {
  app,
  auth,
  db,
  // Firestore 함수들도 export
  collection,
  getDocs,
  query,
  limit,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  where,
  orderBy,
  onAuthStateChanged,
  serverTimestamp,
};

// 전역 객체로 Firebase 인스턴스와 함수들 노출 (모든 유틸리티 함수 선언 후)
window.firebaseInit = {
  app,
  auth,
  db,
  collection,
  getDocs,
  query,
  limit,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  where,
  orderBy,
  onAuthStateChanged,
  conceptUtils,
  exampleUtils,
  grammarPatternUtils,
};

// 모듈 방식 전역 객체도 설정 (navbar.js 호환성을 위해)
window.auth = auth;
window.onAuthStateChanged = onAuthStateChanged;
window.db = db;

