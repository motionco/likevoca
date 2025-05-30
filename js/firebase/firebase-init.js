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
};

// 다국어 개념 유틸리티 함수 (새로운 구조 지원)
export const conceptUtils = {
  // 새 개념 생성 (확장된 구조 지원)
  async createConcept(conceptData) {
    try {
      // concepts 컬렉션에 새 개념 추가
      const conceptRef = doc(collection(db, "concepts"));

      // 새로운 확장된 구조로 데이터 준비
      const enhancedConceptData = {
        _id: conceptRef.id,
        created_at: conceptData.created_at || new Date(), // 최상위 레벨로 이동
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
    } catch (error) {
      console.error("개념 생성 중 오류 발생:", error);
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

  // 개념 가져오기 (확장된 데이터 포함)
  async getConcept(conceptId, includeAdditionalExamples = false) {
    try {
      const conceptDoc = await getDoc(doc(db, "concepts", conceptId));
      if (!conceptDoc.exists()) {
        return null;
      }

      const conceptData = conceptDoc.data();

      // 추가 예문도 함께 가져오기 (요청 시)
      if (includeAdditionalExamples) {
        const additionalExamples = await this.getAdditionalExamples(conceptId);
        conceptData.additional_examples = additionalExamples;
      }

      return conceptData;
    } catch (error) {
      console.error("개념 가져오기 중 오류 발생:", error);
      throw error;
    }
  },

  // 추가 예문 가져오기
  async getAdditionalExamples(conceptId) {
    try {
      const examplesRef = collection(db, "additional_examples");
      const q = query(examplesRef, where("concept_id", "==", conceptId));
      const querySnapshot = await getDocs(q);

      const examples = [];
      querySnapshot.forEach((doc) => {
        examples.push({ id: doc.id, ...doc.data() });
      });

      return examples;
    } catch (error) {
      console.error("추가 예문 가져오기 중 오류 발생:", error);
      return [];
    }
  },

  // 퀴즈용 개념 가져오기
  async getConceptsForQuiz(
    fromLanguage,
    toLanguage,
    difficulty = null,
    limit = 10
  ) {
    try {
      const conceptsRef = collection(db, "concepts");
      let q;

      if (difficulty) {
        q = query(
          conceptsRef,
          where("concept_info.difficulty", "==", difficulty),
          where(`expressions.${fromLanguage}.word`, "!=", ""),
          where(`expressions.${toLanguage}.word`, "!=", "")
        );
      } else {
        q = query(
          conceptsRef,
          where(`expressions.${fromLanguage}.word`, "!=", ""),
          where(`expressions.${toLanguage}.word`, "!=", "")
        );
      }

      const querySnapshot = await getDocs(q);
      const concepts = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.expressions[fromLanguage] && data.expressions[toLanguage]) {
          concepts.push({
            id: doc.id,
            ...data,
            quiz_weight: data.quiz_data?.difficulty_multiplier || 1.0,
          });
        }
      });

      // 퀴즈 가중치를 고려한 랜덤 선택
      const shuffled = concepts.sort(() => 0.5 - Math.random());
      return shuffled.slice(0, limit);
    } catch (error) {
      console.error("퀴즈용 개념 가져오기 중 오류 발생:", error);
      return [];
    }
  },

  // 게임용 개념 가져오기
  async getConceptsForGame(gameType, languages, difficulty = null, limit = 16) {
    try {
      const conceptsRef = collection(db, "concepts");
      let q;

      if (difficulty) {
        q = query(
          conceptsRef,
          where("concept_info.difficulty", "==", difficulty),
          where("concept_info.game_types", "array-contains", gameType)
        );
      } else {
        q = query(
          conceptsRef,
          where("concept_info.game_types", "array-contains", gameType)
        );
      }

      const querySnapshot = await getDocs(q);
      const concepts = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();

        // 모든 요청된 언어가 있는지 확인
        const hasAllLanguages = languages.every(
          (lang) => data.expressions[lang] && data.expressions[lang].word
        );

        if (hasAllLanguages) {
          concepts.push({
            id: doc.id,
            ...data,
          });
        }
      });

      // 랜덤 섞기 후 제한된 수만큼 반환
      const shuffled = concepts.sort(() => 0.5 - Math.random());
      return shuffled.slice(0, limit);
    } catch (error) {
      console.error("게임용 개념 가져오기 중 오류 발생:", error);
      return [];
    }
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

      // 개념 문서 업데이트
      const updateData = {
        ...newData,
        concept_info: {
          ...oldData.concept_info,
          ...newData.concept_info,
          updated_at: new Date(),
        },
      };

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
          data.expressions?.[userLanguage] &&
          data.expressions?.[targetLanguage]
        ) {
          // 예문 처리 (새 구조와 기존 구조 모두 지원)
          let examples = [];

          // 새로운 구조의 featured_examples 처리
          if (data.featured_examples && Array.isArray(data.featured_examples)) {
            examples = data.featured_examples
              .map((ex) => ({
                from: ex.translations?.[userLanguage]?.text || "",
                to: ex.translations?.[targetLanguage]?.text || "",
              }))
              .filter((ex) => ex.from && ex.to);
          }
          // 기존 구조의 examples 처리
          else if (data.examples && Array.isArray(data.examples)) {
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

      // 랜덤하게 섞기
      return concepts.sort(() => Math.random() - 0.5).slice(0, limit);
    } catch (error) {
      console.error("학습용 개념 가져오기 중 오류 발생:", error);
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
      const userRef = doc(db, "users", userId);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        return {
          aiUsed: userData.aiUsed || 0,
          aiLimit: userData.aiLimit || 100,
          conceptCount: userData.conceptCount || 0,
        };
      } else {
        // 사용자 문서가 없으면 기본값으로 생성
        await setDoc(userRef, {
          aiUsed: 0,
          aiLimit: 100,
          conceptCount: 0,
          createdAt: new Date(),
        });
        return {
          aiUsed: 0,
          aiLimit: 100,
          conceptCount: 0,
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

  // AI 개념을 ai-recommend 컬렉션에 저장
  async createAIConcept(userEmail, conceptData) {
    try {
      // 사용자 이메일을 문서 ID로 사용
      const userAIRef = doc(db, "ai-recommend", userEmail);
      const userAIDoc = await getDoc(userAIRef);

      // AI 개념 데이터 준비
      const aiConceptData = {
        _id: `ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        created_at: new Date(),
        concept_info: {
          domain: conceptData.concept_info?.domain || "general",
          category: conceptData.concept_info?.category || "common",
          difficulty: conceptData.concept_info?.difficulty || "basic",
          tags: conceptData.concept_info?.tags || [],
          unicode_emoji: conceptData.concept_info?.unicode_emoji || "📚",
          color_theme: conceptData.concept_info?.color_theme || "#9C27B0",
          quiz_frequency: conceptData.concept_info?.quiz_frequency || "medium",
          game_types: conceptData.concept_info?.game_types || [
            "matching",
            "pronunciation",
            "spelling",
          ],
        },
        media: conceptData.media || {
          images: {
            primary: null,
            secondary: null,
            illustration: null,
            emoji_style: null,
            line_art: null,
          },
          videos: { intro: null, pronunciation: null },
          audio: {
            pronunciation_slow: null,
            pronunciation_normal: null,
            word_in_sentence: null,
          },
        },
        expressions: conceptData.expressions || {},
        featured_examples: conceptData.featured_examples || [],
        quiz_data: conceptData.quiz_data || {
          question_types: ["translation", "matching"],
          difficulty_multiplier: 1.0,
          common_mistakes: [],
          hint_text: {},
        },
        game_data: conceptData.game_data || {
          memory_card: {},
          word_puzzle: {},
          pronunciation_game: {},
        },
        related_concepts: conceptData.related_concepts || [],
        learning_metadata: conceptData.learning_metadata || {
          memorization_difficulty: 2,
          pronunciation_difficulty: 2,
          usage_frequency: "medium",
          cultural_importance: "medium",
        },
      };

      if (userAIDoc.exists()) {
        // 기존 문서가 있으면 concepts 배열에 추가
        const userData = userAIDoc.data();
        const existingConcepts = userData.concepts || [];

        await updateDoc(userAIRef, {
          concepts: [...existingConcepts, aiConceptData],
          totalConcepts: existingConcepts.length + 1,
          lastUpdated: new Date(),
        });
      } else {
        // 새 문서 생성
        await setDoc(userAIRef, {
          userEmail: userEmail,
          concepts: [aiConceptData],
          totalConcepts: 1,
          createdAt: new Date(),
          lastUpdated: new Date(),
        });
      }

      return aiConceptData._id;
    } catch (error) {
      console.error("AI 개념 생성 중 오류 발생:", error);
      throw error;
    }
  },

  // 사용자의 AI 개념 목록 가져오기
  async getUserAIConcepts(userEmail) {
    try {
      const userAIRef = doc(db, "ai-recommend", userEmail);
      const userAIDoc = await getDoc(userAIRef);

      if (userAIDoc.exists()) {
        const userData = userAIDoc.data();
        const concepts = userData.concepts || [];

        // 각 개념에 id 필드 추가 (기존 _id를 id로 매핑)
        return concepts.map((concept) => ({
          ...concept,
          id: concept._id || concept.id,
        }));
      } else {
        return [];
      }
    } catch (error) {
      console.error("사용자 AI 개념 가져오기 중 오류 발생:", error);
      return [];
    }
  },

  // AI 개념 삭제
  async deleteAIConcept(userEmail, conceptId) {
    try {
      const userAIRef = doc(db, "ai-recommend", userEmail);
      const userAIDoc = await getDoc(userAIRef);

      if (userAIDoc.exists()) {
        const userData = userAIDoc.data();
        const concepts = userData.concepts || [];

        // 해당 개념 제거
        const updatedConcepts = concepts.filter(
          (concept) => concept._id !== conceptId && concept.id !== conceptId
        );

        await updateDoc(userAIRef, {
          concepts: updatedConcepts,
          totalConcepts: updatedConcepts.length,
          lastUpdated: new Date(),
        });

        return true;
      }

      return false;
    } catch (error) {
      console.error("AI 개념 삭제 중 오류 발생:", error);
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

// 사용자 진도 관리 유틸리티
export const userProgressUtils = {
  // 사용자 진도 가져오기
  async getUserProgress(userId) {
    try {
      const progressDoc = await getDoc(doc(db, "user_progress", userId));
      if (progressDoc.exists()) {
        return progressDoc.data();
      }

      // 기본 진도 데이터 생성
      const defaultProgress = {
        profile: {
          name: "",
          email: userId,
          avatar_emoji: "👤",
          native_language: "korean",
          learning_languages: ["english"],
          current_levels: {
            english: "beginner",
          },
          study_preferences: {
            daily_goal: 20,
            preferred_media: "illustration",
            game_difficulty: "medium",
            quiz_types: ["translation", "pronunciation"],
            study_reminders: true,
          },
        },
        vocabulary_progress: {},
        recent_activity: [],
        created_at: new Date(),
        updated_at: new Date(),
      };

      await setDoc(doc(db, "user_progress", userId), defaultProgress);
      return defaultProgress;
    } catch (error) {
      console.error("사용자 진도 가져오기 중 오류 발생:", error);
      throw error;
    }
  },

  // 학습 활동 기록
  async recordActivity(userId, activityData) {
    try {
      const progressRef = doc(db, "user_progress", userId);
      const progressDoc = await getDoc(progressRef);

      if (progressDoc.exists()) {
        const progress = progressDoc.data();
        const activities = progress.recent_activity || [];

        // 새 활동 추가 (최신 20개만 유지)
        activities.unshift({
          ...activityData,
          date: new Date(),
        });

        if (activities.length > 20) {
          activities.splice(20);
        }

        await updateDoc(progressRef, {
          recent_activity: activities,
          updated_at: new Date(),
        });
      }
    } catch (error) {
      console.error("학습 활동 기록 중 오류 발생:", error);
    }
  },

  // 단어장 진도 업데이트
  async updateVocabularyProgress(userId, language, conceptId, status) {
    try {
      const progressRef = doc(db, "user_progress", userId);
      const progressDoc = await getDoc(progressRef);

      if (progressDoc.exists()) {
        const progress = progressDoc.data();
        const vocabProgress = progress.vocabulary_progress || {};
        const languageProgress = vocabProgress[language] || {
          known_concepts: [],
          mastered_concepts: [],
          weak_concepts: [],
          total_words_learned: 0,
          quiz_stats: {
            total_quizzes: 0,
            average_score: 0,
            best_score: 0,
            streak_days: 0,
          },
          game_stats: {
            memory_game_best: 0,
            pronunciation_accuracy: 0,
            spelling_accuracy: 0,
          },
        };

        // 기존 상태에서 제거
        languageProgress.known_concepts =
          languageProgress.known_concepts.filter((id) => id !== conceptId);
        languageProgress.mastered_concepts =
          languageProgress.mastered_concepts.filter((id) => id !== conceptId);
        languageProgress.weak_concepts = languageProgress.weak_concepts.filter(
          (id) => id !== conceptId
        );

        // 새 상태에 추가
        if (
          status === "known" &&
          !languageProgress.known_concepts.includes(conceptId)
        ) {
          languageProgress.known_concepts.push(conceptId);
        } else if (
          status === "mastered" &&
          !languageProgress.mastered_concepts.includes(conceptId)
        ) {
          languageProgress.mastered_concepts.push(conceptId);
        } else if (
          status === "weak" &&
          !languageProgress.weak_concepts.includes(conceptId)
        ) {
          languageProgress.weak_concepts.push(conceptId);
        }

        // 총 학습 단어 수 업데이트
        const totalLearned = new Set([
          ...languageProgress.known_concepts,
          ...languageProgress.mastered_concepts,
          ...languageProgress.weak_concepts,
        ]).size;
        languageProgress.total_words_learned = totalLearned;

        vocabProgress[language] = languageProgress;

        await updateDoc(progressRef, {
          vocabulary_progress: vocabProgress,
          updated_at: new Date(),
        });
      }
    } catch (error) {
      console.error("단어장 진도 업데이트 중 오류 발생:", error);
    }
  },

  // 퀴즈 결과 업데이트
  async updateQuizStats(userId, language, score, timeSpent) {
    try {
      const progressRef = doc(db, "user_progress", userId);
      const progressDoc = await getDoc(progressRef);

      if (progressDoc.exists()) {
        const progress = progressDoc.data();
        const vocabProgress = progress.vocabulary_progress || {};
        const languageProgress = vocabProgress[language] || {
          quiz_stats: {
            total_quizzes: 0,
            average_score: 0,
            best_score: 0,
            streak_days: 0,
          },
        };

        const quizStats = languageProgress.quiz_stats;
        const newTotal = quizStats.total_quizzes + 1;
        const newAverage =
          (quizStats.average_score * quizStats.total_quizzes + score) /
          newTotal;

        languageProgress.quiz_stats = {
          total_quizzes: newTotal,
          average_score: Math.round(newAverage),
          best_score: Math.max(quizStats.best_score, score),
          streak_days: quizStats.streak_days, // 스트릭은 별도 로직으로 관리
        };

        vocabProgress[language] = languageProgress;

        await updateDoc(progressRef, {
          vocabulary_progress: vocabProgress,
          updated_at: new Date(),
        });
      }
    } catch (error) {
      console.error("퀴즈 통계 업데이트 중 오류 발생:", error);
    }
  },

  // 게임 결과 업데이트
  async updateGameStats(userId, language, gameType, score) {
    try {
      const progressRef = doc(db, "user_progress", userId);
      const progressDoc = await getDoc(progressRef);

      if (progressDoc.exists()) {
        const progress = progressDoc.data();
        const vocabProgress = progress.vocabulary_progress || {};
        const languageProgress = vocabProgress[language] || {
          game_stats: {
            memory_game_best: 0,
            pronunciation_accuracy: 0,
            spelling_accuracy: 0,
          },
        };

        const gameStats = languageProgress.game_stats;

        if (gameType === "memory_game") {
          gameStats.memory_game_best = Math.max(
            gameStats.memory_game_best,
            score
          );
        } else if (gameType === "pronunciation") {
          // 발음 정확도는 평균으로 계산
          gameStats.pronunciation_accuracy = Math.round(
            (gameStats.pronunciation_accuracy + score) / 2
          );
        } else if (gameType === "spelling") {
          // 철자 정확도는 평균으로 계산
          gameStats.spelling_accuracy = Math.round(
            (gameStats.spelling_accuracy + score) / 2
          );
        }

        languageProgress.game_stats = gameStats;
        vocabProgress[language] = languageProgress;

        await updateDoc(progressRef, {
          vocabulary_progress: vocabProgress,
          updated_at: new Date(),
        });
      }
    } catch (error) {
      console.error("게임 통계 업데이트 중 오류 발생:", error);
    }
  },
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

export { app, auth, db };
