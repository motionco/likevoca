/**
 * 개념 편집 모달 관리 스크립트
 *
 * 역할: 기존 개념 편집 전용
 *
 * 구분:
 * - add-concept-modal.js: 개념 추가 전용
 * - edit-concept-modal.js: 개념 편집 전용 (이 파일)
 * - concept-modal.js: 개념 보기 전용 (읽기 전용)
 */

import {
  auth,
  db,
  conceptUtils,
  supportedLanguages,
} from "../../js/firebase/firebase-init.js";
import { getActiveLanguage } from "../../utils/language-utils.js";
import {
  validateEditForm,
  collectEditFormData,
  resetEditForm,
  closeEditModal,
  initLanguageTabEventListeners,
  switchLanguageTab,
  addEditExampleFields,
  updateStaticLabels,
  getDefaultPartOfSpeech,
  translatePartOfSpeech,
} from "./concept-modal-utils.js";

// 전역 변수 (편집 모드 전용)
let editConceptId = null;
let supportedLangs = { ...supportedLanguages };

// 편집 모달 초기화
export async function initialize() {
  console.log("🔄 개념 편집 모달 초기화");

  // 편집 상태 확인
  editConceptId = sessionStorage.getItem("editConceptId");

  if (!editConceptId) {
    console.error("❌ 편집할 개념 ID가 없습니다");
    alert("편집할 개념이 지정되지 않았습니다.");
    closeModal();
    return;
  }

  console.log("📝 편집 대상 개념 ID:", editConceptId);

  // 모달 제목과 버튼 설정
  const modalTitle = document.querySelector("#edit-concept-modal h2");
  if (modalTitle) modalTitle.textContent = "개념 수정";

  const saveBtn = document.getElementById("save-edit-concept");
  if (saveBtn) saveBtn.textContent = "수정하기";

  // 저장 버튼 이벤트 설정
  if (saveBtn) {
    saveBtn.addEventListener("click", (e) => {
      e.preventDefault();
      console.log("💾 수정 버튼 클릭됨, 기본 동작 방지됨");
      saveConcept();
    });
  }

  // 환경 설정 언어 가져오기
  let userLanguage = "ko";
  try {
    userLanguage = await getActiveLanguage();
    console.log("🌐 사용자 언어:", userLanguage);
  } catch (error) {
    console.warn("언어 설정 로드 실패, 기본값 사용:", error);
  }

  // HTML 정적 레이블들을 환경 설정 언어로 업데이트
  await updateStaticLabels(userLanguage);

  // 지원 언어 탭 초기화
  initLanguageTabEventListeners();

  // 개념 데이터 로드 및 폼 채우기
  await fetchConceptForEdit(editConceptId);
}

// 편집용 개념 데이터 가져오기
async function fetchConceptForEdit(conceptId) {
  try {
    console.log("📋 편집용 개념 데이터 가져오기:", conceptId);

    let conceptData = null;

    // 메모리에서 개념 찾기 (여러 소스 확인)
    const sources = [
      () => window.currentConcepts,
      () => window.allConcepts,
      () => (typeof allConcepts !== "undefined" ? allConcepts : null),
    ];

    for (const getSource of sources) {
      const sourceData = getSource();
      if (sourceData && sourceData.length > 0) {
        conceptData = sourceData.find(
          (concept) =>
            concept.concept_id === conceptId ||
            concept.id === conceptId ||
            concept._id === conceptId
        );
        if (conceptData) {
          console.log("💾 메모리에서 개념 발견");
          break;
        }
      }
    }

    // 메모리에서 찾지 못했으면 Firebase 조회
    if (!conceptData) {
      console.log("🔍 Firebase에서 개념 조회 시도...");
      try {
        // AI 개념인지 일반 개념인지 판단
        const isAIConcept =
          conceptId?.startsWith("ai_") ||
          window.location.pathname.includes("ai-vocabulary");

        if (isAIConcept) {
          console.log("🤖 AI 개념 조회 시도...");
          // AI 개념은 사용자별 ai-recommend 컬렉션에서 조회
          const allAIConcepts = await conceptUtils.getUserAIConcepts(
            auth.currentUser.email
          );
          conceptData = allAIConcepts.find(
            (concept) =>
              concept.concept_id === conceptId ||
              concept.id === conceptId ||
              concept._id === conceptId
          );

          if (conceptData) {
            console.log(
              "🔥 AI 개념 조회 성공:",
              conceptData.concept_id || conceptData.id
            );
          } else {
            throw new Error("AI 개념을 찾을 수 없습니다.");
          }
        } else {
          console.log("📝 일반 개념 조회 시도...");
          conceptData = await conceptUtils.getConcept(conceptId);
          console.log(
            "🔥 일반 개념 조회 성공:",
            conceptData.concept_id || conceptData.id
          );
        }
      } catch (firebaseError) {
        console.error("❌ Firebase 조회 실패:", firebaseError);
        throw new Error(
          "개념 정보를 찾을 수 없습니다. 페이지를 새로고침 후 다시 시도해주세요."
        );
      }
    }

    if (!conceptData) {
      throw new Error("개념 정보를 찾을 수 없습니다.");
    }

    console.log("✅ 개념 데이터 로드 성공");
    fillFormWithConceptData(conceptData);
  } catch (error) {
    console.error("❌ 개념 정보를 가져오는 중 오류:", error);
    alert(error.message || "개념 정보를 불러올 수 없습니다.");
  }
}

// 폼에 개념 데이터 채우기
function fillFormWithConceptData(conceptData) {
  console.log("📝 폼 데이터 채우기 시작");

  // 개념 정보 채우기
  const domainField = document.getElementById("edit-concept-domain");
  const categoryField = document.getElementById("edit-concept-category");
  const emojiField = document.getElementById("edit-concept-emoji");

  if (domainField) {
    domainField.value = conceptData.concept_info?.domain || "";
  }
  if (categoryField) {
    categoryField.value = conceptData.concept_info?.category || "";
  }
  if (emojiField) {
    emojiField.value =
      conceptData.concept_info?.emoji ||
      conceptData.concept_info?.unicode_emoji ||
      "";
  }

  // 언어별 표현 채우기
  if (conceptData.expressions) {
    for (const [lang, expression] of Object.entries(conceptData.expressions)) {
      const wordField = document.getElementById(`edit-${lang}-word`);
      const pronunciationField = document.getElementById(
        `edit-${lang}-pronunciation`
      );
      const definitionField = document.getElementById(
        `edit-${lang}-definition`
      );
      const posField = document.getElementById(`edit-${lang}-pos`);

      if (wordField) wordField.value = expression.word || "";
      if (pronunciationField)
        pronunciationField.value = expression.pronunciation || "";
      if (definitionField) definitionField.value = expression.definition || "";
      if (posField) {
        const originalPos = expression.part_of_speech || "명사";
        const currentLangOptions = Array.from(posField.options).map(
          (opt) => opt.value
        );

        let finalPos;
        if (currentLangOptions.includes(originalPos)) {
          finalPos = originalPos;
        } else {
          finalPos = translatePartOfSpeech(originalPos, lang);
        }

        if (currentLangOptions.includes(finalPos)) {
          posField.value = finalPos;
        } else {
          posField.value = getDefaultPartOfSpeech(lang);
        }
      }

      // 고급 필드들 처리
      const synonymsField = document.getElementById(`edit-${lang}-synonyms`);
      const antonymsField = document.getElementById(`edit-${lang}-antonyms`);
      const collocationsField = document.getElementById(
        `edit-${lang}-collocations`
      );
      const compoundWordsField = document.getElementById(
        `edit-${lang}-compound-words`
      );

      if (synonymsField && expression.synonyms) {
        synonymsField.value = Array.isArray(expression.synonyms)
          ? expression.synonyms.join(", ")
          : expression.synonyms;
      }
      if (antonymsField && expression.antonyms) {
        antonymsField.value = Array.isArray(expression.antonyms)
          ? expression.antonyms.join(", ")
          : expression.antonyms;
      }
      if (collocationsField && expression.collocations) {
        collocationsField.value = Array.isArray(expression.collocations)
          ? expression.collocations.join(", ")
          : expression.collocations;
      }
      if (compoundWordsField && expression.compound_words) {
        compoundWordsField.value = Array.isArray(expression.compound_words)
          ? expression.compound_words.join(", ")
          : expression.compound_words;
      }
    }
  }

  // 예제 채우기
  const examplesContainer = document.getElementById("edit-examples-container");
  if (examplesContainer) {
    examplesContainer.innerHTML = "";

    let hasExamples = false;

    // 대표 예문 처리
    if (conceptData.representative_example) {
      let repExample = null;

      if (conceptData.representative_example.translations) {
        repExample = conceptData.representative_example.translations;
      } else if (
        conceptData.representative_example.korean ||
        conceptData.representative_example.english
      ) {
        repExample = conceptData.representative_example;
      }

      if (
        repExample &&
        (repExample.korean ||
          repExample.english ||
          repExample.japanese ||
          repExample.chinese)
      ) {
        addEditExampleFields(repExample, true);
        hasExamples = true;
      }
    }

    // 추가 예제들 처리
    if (
      conceptData.examples &&
      Array.isArray(conceptData.examples) &&
      conceptData.examples.length > 0
    ) {
      for (const example of conceptData.examples) {
        addEditExampleFields(example, false);
        hasExamples = true;
      }
    }

    // 예문이 없으면 기본 대표 예문 필드 추가
    if (!hasExamples) {
      addEditExampleFields(null, true);
    }
  }

  console.log("✅ 폼 데이터 채우기 완료");
}

// 개념 수정 저장
async function saveConcept() {
  try {
    console.log("🔄 개념 수정 시작:", editConceptId);

    if (!validateEditForm()) {
      console.log("❌ 폼 검증 실패");
      return;
    }

    console.log("✅ 폼 검증 통과");
    const conceptData = collectEditFormData();
    console.log("📋 수집된 데이터:", conceptData);

    try {
      // AI 개념인지 일반 개념인지 판단
      const isAIConcept =
        editConceptId?.startsWith("ai_") ||
        window.location.pathname.includes("ai-vocabulary");

      if (isAIConcept) {
        console.log("🤖 AI 개념 수정 시도...");

        // 분리된 컬렉션 구조에 맞게 데이터 변환
        const transformedData = {
          // 메타데이터 업데이트
          metadata: {
            updated_at: new Date(),
            version: "2.0",
            source: "ai_generated",
            is_ai_generated: true,
            ai_model: "gemini",
            content_language: "multilingual",
          },

          // 개념 정보 업데이트
          concept_info: {
            domain:
              conceptData.concept_info?.domain ||
              conceptData.domain ||
              "general",
            category:
              conceptData.concept_info?.category ||
              conceptData.category ||
              "common",
            difficulty: conceptData.concept_info?.difficulty || "beginner",
            tags: conceptData.concept_info?.tags || [],
            unicode_emoji:
              conceptData.concept_info?.unicode_emoji ||
              conceptData.concept_info?.emoji ||
              "🤖",
            images: conceptData.concept_info?.images || [],
          },

          // 언어별 표현 (다국어 단어장과 동일한 구조)
          expressions: conceptData.expressions || {},

          // 대표 예문 (다국어 단어장과 동일한 구조)
          representative_example: conceptData.representative_example || null,

          // 추가 예문들
          examples: conceptData.examples || [],

          // 호환성을 위한 추가 필드들
          domain:
            conceptData.concept_info?.domain || conceptData.domain || "general",
          category:
            conceptData.concept_info?.category ||
            conceptData.category ||
            "common",
          featured_examples: conceptData.examples || [],
          updated_at: new Date(),
        };

        console.log("🔧 변환된 AI 개념 데이터:", transformedData);

        // AI 개념 수정
        const success = await conceptUtils.updateAIConcept(
          auth.currentUser.email,
          editConceptId,
          transformedData
        );

        if (!success) {
          throw new Error("AI 개념 수정에 실패했습니다.");
        }

        console.log("✅ AI 개념 수정 성공");
      } else {
        console.log("📝 일반 개념 수정 시도...");
        await conceptUtils.updateConcept(editConceptId, conceptData);
        console.log("✅ 일반 개념 수정 성공");
      }

      alert("개념이 성공적으로 수정되었습니다.");

      resetEditForm();
      closeEditModal();

      // 화면 업데이트 이벤트 발생
      console.log("🔔 개념 수정 완료 - 화면 업데이트 이벤트 발생");
      if (window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent("concept-saved"));
        console.log("✅ concept-saved 이벤트 발생 완료");
      }

      // 편집 상태 초기화
      sessionStorage.removeItem("editConceptId");
      editConceptId = null;
    } catch (updateError) {
      console.error("❌ 개념 수정 실패:", updateError);
      alert(`개념을 수정하는 중 오류가 발생했습니다:\n${updateError.message}`);
      return;
    }
  } catch (error) {
    console.error("개념 수정 중 전체 오류 발생:", error);
    alert(`개념을 수정하는 중 오류가 발생했습니다:\n${error.message}`);
  }
}

// 편집 모달 열기 (전역 함수)
window.openEditConceptModal = function (conceptId) {
  console.log("🔄 개념 편집 모달 열기:", conceptId);

  // 편집 상태 설정
  sessionStorage.setItem("editConceptId", conceptId);
  editConceptId = conceptId;

  // 모달 표시
  const modal = document.getElementById("edit-concept-modal");
  if (modal) {
    modal.classList.remove("hidden");
    initialize(); // 편집 모드로 초기화
  } else {
    console.error("❌ edit-concept-modal 요소를 찾을 수 없습니다");
  }
};
