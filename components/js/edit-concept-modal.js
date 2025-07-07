/**
 * ?국???어???용 개념 ?집 모달 관크립트
 *
 * ??: ?국???어??개념 ?집 ?용
 *
 * 구분:
 * - ai-edit-concept-modal.js: AI 개념 ?집 ?용
 * - edit-concept-modal.js: ?국???어???집 ?용 (???일)
 * - ai-concept-modal.js: AI ?어??개념 보기 ?용 (?기 ?용)
 */

import {
  auth,
  db,
  conceptUtils,
  supportedLanguages,
} from "../../utils/firebase/firebase-init.js";
import { getActiveLanguage } from "../../utils/language-utils.js";
import {
  domainCategoryMapping,
  categoryEmojiMapping,
} from "./domain-category-emoji.js";
import { collectionManager } from "../../utils/firebase/firebase-collection-manager.js";

// 전역 변수
let editConceptId = null;
let supportedLangs = { ...supportedLanguages };

// 편집 모달 초기화
export async function initializeEditModal() {
  console.log("편집 모달 초기화 시작");

  // 편집 상태 확인
  editConceptId = sessionStorage.getItem("editConceptId");

  if (!editConceptId) {
    console.error("❌ 편집할 개념이 지정되지 않았습니다");
    alert("편집할 개념이 지정되지 않았습니다");
    closeModal();
    return;
  }

  // 모달 제목과 버튼 설정
  const modalTitle = document.querySelector("#edit-concept-modal h2");
  if (modalTitle) modalTitle.textContent = "개념 수정";

  const saveBtn = document.getElementById("save-edit-concept");
  if (saveBtn) saveBtn.textContent = "수정하기";

  // 저장 버튼 이벤트 설정
  if (saveBtn) {
    saveBtn.addEventListener("click", (e) => {
      e.preventDefault();
      saveConcept();
    });
  }

  // 취소 버튼 이벤트 설정
  const cancelBtn = document.getElementById("cancel-edit-concept");
  if (cancelBtn) {
    cancelBtn.addEventListener("click", (e) => {
      e.preventDefault();
      if (confirm("편집을 취소하시겠습니까? 변경사항이 저장되지 않습니다.")) {
        resetForm();
        closeModal();
        sessionStorage.removeItem("editConceptId");
        editConceptId = null;
      }
    });
  }

  // X 버튼 이벤트 설정
  setupEditModalCloseButton();

  // 사용자 언어 설정 가져오기
  let userLanguage = "ko";
  try {
    userLanguage = await getActiveLanguage();
  } catch (error) {
    console.warn("언어 설정 로드 실패, 기본값 사용:", error);
  }

  // HTML 정적 라벨들을 사용자 언어로 업데이트
  await updateStaticLabels(userLanguage);

  // 언어 탭 이벤트 리스너 설정
  setupEditLanguageTabs();

  // 편집 모달 도메인 카테고리 이벤트 리스너 설정
  setupEditDomainCategoryListeners();

  // 예문 추가 버튼 이벤트 설정
  setupEditModalAddExampleButton();

  // 개념 데이터 로드 및 채우기
  await fetchConceptForEdit(editConceptId);
}

// 편집할 개념 데이터 가져오기
async function fetchConceptForEdit(conceptId) {
  try {
    let conceptData = null;

    // 메모리에서 개념 찾기
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
          break;
        }
      }
    }

    // 메모리에서 찾지 못했으면 Firebase 조회
    if (!conceptData) {
      try {
        conceptData = await window.conceptUtils.getConcept(conceptId);
        console.log(
          "Firebase 개념 조회 성공:",
          conceptData.concept_id || conceptData.id
        );
      } catch (firebaseError) {
        console.error("Firebase 조회 실패:", firebaseError);
        throw new Error(
          "개념 정보를 찾을 수 없습니다. 페이지를 새로고침 후 다시 시도해주세요."
        );
      }
    }

    if (!conceptData) {
      throw new Error("개념 정보를 찾을 수 없습니다.");
    }

    fillFormWithConceptData(conceptData);
  } catch (error) {
    console.error("개념 정보 가져오기 오류:", error);
    alert(error.message || "개념 정보를 불러올 수 없습니다.");
  }
}

// 폼에 개념 데이터 채우기
function fillFormWithConceptData(conceptData) {
  console.log("폼 데이터 채우기 시작");

  // 기본 정보 설정
  const domainField = document.getElementById("edit-concept-domain");
  if (domainField) {
    domainField.value = conceptData.concept_info?.domain || "other";
  }

  const categoryField = document.getElementById("edit-concept-category");
  if (categoryField) {
    categoryField.value = conceptData.concept_info?.category || "other";
  }

  const purposeField = document.getElementById("edit-concept-purpose");
  if (purposeField) {
    purposeField.value = conceptData.concept_info?.purpose || "description";
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
      if (posField) posField.value = expression.part_of_speech || "명사";
    }
  }

  console.log("폼 데이터 채우기 완료");
}

// 개념 수정 저장
async function saveConcept() {
  try {
    const formData = collectFormData();

    if (!validateForm(formData)) {
      return;
    }

    // 개념 업데이트
    await window.conceptUtils.updateConcept(editConceptId, formData);

    alert("개념이 성공적으로 수정되었습니다!");

    resetForm();
    closeModal();

    // 화면 업데이트 이벤트 발생
    if (window.dispatchEvent) {
      window.dispatchEvent(new CustomEvent("concept-saved"));
    }

    // 편집 상태 초기화
    sessionStorage.removeItem("editConceptId");
    editConceptId = null;

    // 페이지 새로고침으로 즉각 반영
    setTimeout(() => {
      window.location.reload();
    }, 100);
  } catch (error) {
    console.error("개념 수정 오류:", error);
    alert(`개념을 수정하는 중 오류가 발생했습니다:\n${error.message}`);
  }
}

// 편집 모달 X 버튼 이벤트 설정
function setupEditModalCloseButton() {
  const closeBtn = document.getElementById("close-edit-concept-modal");
  if (closeBtn) {
    closeBtn.addEventListener("click", handleEditModalClose);
  }
}

// 편집 모달 X 버튼 클릭 핸들러
function handleEditModalClose(e) {
  e.preventDefault();

  if (confirm("편집을 취소하시겠습니까? 변경사항이 저장되지 않습니다.")) {
    resetForm();
    closeModal();
    sessionStorage.removeItem("editConceptId");
    editConceptId = null;
  }
}

// 폼 데이터 수집
function collectFormData() {
  const formData = {
    concept_info: {
      domain: document.getElementById("edit-concept-domain")?.value || "other",
      category:
        document.getElementById("edit-concept-category")?.value || "other",
      purpose:
        document.getElementById("edit-concept-purpose")?.value || "description",
      unicode_emoji: document.getElementById("edit-emoji")?.value || "📝",
      color_theme: document.getElementById("edit-color")?.value || "#3B82F6",
      situation: ["casual"],
      difficulty: "beginner",
    },
    expressions: {},
  };

  // 언어별 표현 수집
  const languages = ["korean", "english", "japanese", "chinese"];
  languages.forEach((lang) => {
    const wordField = document.getElementById(`edit-${lang}-word`);
    const pronunciationField = document.getElementById(
      `edit-${lang}-pronunciation`
    );
    const definitionField = document.getElementById(`edit-${lang}-definition`);
    const posField = document.getElementById(`edit-${lang}-pos`);

    if (wordField && wordField.value.trim()) {
      formData.expressions[lang] = {
        word: wordField.value.trim(),
        pronunciation: pronunciationField?.value.trim() || "",
        definition: definitionField?.value.trim() || "",
        part_of_speech: posField?.value || "명사",
      };
    }
  });

  return formData;
}

// 폼 유효성 검사
function validateForm(formData) {
  if (!formData.expressions || Object.keys(formData.expressions).length === 0) {
    alert("최소 하나의 언어 표현이 필요합니다.");
    return false;
  }

  for (const [lang, expression] of Object.entries(formData.expressions)) {
    if (!expression.word || !expression.word.trim()) {
      alert(`${lang} 언어의 단어가 필요합니다.`);
      return false;
    }
    if (!expression.definition || !expression.definition.trim()) {
      alert(`${lang} 언어의 정의가 필요합니다.`);
      return false;
    }
  }

  return true;
}

// 폼 초기화
function resetForm() {
  const form = document.getElementById("edit-concept-form");
  if (form) {
    form.reset();
  }
}

// 모달 닫기
function closeModal() {
  const modal = document.getElementById("edit-concept-modal");
  if (modal) {
    modal.classList.add("hidden");
  }
}

// 전역 함수로 노출
window.openEditConceptModal = async function (conceptId) {
  // 편집 상태 설정
  sessionStorage.setItem("editConceptId", conceptId);
  editConceptId = conceptId;

  // 모달 표시
  const modal = document.getElementById("edit-concept-modal");
  if (modal) {
    modal.classList.remove("hidden");
    initializeEditModal();
  } else {
    console.error("edit-concept-modal 요소를 찾을 수 없습니다");
  }
};

console.log("📦 edit-concept-modal.js 로드 완료");
