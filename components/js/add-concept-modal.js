/**
 * 개념 추가 모달 관련 스크립트
 *
 * 용도: 개념 추가 용
 *
 * 구분:
 * - add-concept-modal.js: 개념 추가 용 (일반)
 * - edit-concept-modal.js: 개념 수정 용
 * - ai-concept-modal.js: AI 관련 개념 보기 용 (기타 용)
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

// 전역 변수 (추가 모드용)
let supportedLangs = { ...supportedLanguages };
let userLanguage = "ko"; // userLanguage 변수 정의

// 중복함수 수  concept-modal-utils.js동인
export async function initialize() {
  console.log("개념 추가 모달 초기화");

  // 사용자 언어 설정
  userLanguage =
    localStorage.getItem("preferredLanguage") || getActiveLanguage() || "ko";
  console.log("사용자 현재 설정 언어:", userLanguage);

  // 모달 요소
  const modal = document.getElementById("concept-modal");
  const closeBtn = document.getElementById("close-concept-modal");
  const saveBtn = document.getElementById("save-concept");
  const cancelBtn = document.getElementById("cancel-concept");
  const resetBtn = document.getElementById("reset-concept-form");
  const addExampleBtn = document.getElementById("add-example");

  // 벤트리스트
  if (closeBtn) {
    closeBtn.addEventListener("click", closeModal);
  }

  if (saveBtn) {
    saveBtn.addEventListener("click", (event) => {
      event.preventDefault(); // 기본 출력 방법
      console.log("저장 버튼 클릭 기본 작법");
      saveConcept();
    });
  }

  // 전체submit 벤트도 방법
  const conceptForm = document.getElementById("concept-form");
  if (conceptForm) {
    conceptForm.addEventListener("submit", (event) => {
      event.preventDefault(); // 제출 방법
      console.log("제출 도체 기본 작법");
      saveConcept();
    });
  }

  if (cancelBtn) {
    cancelBtn.addEventListener("click", closeModal);
  }

  if (resetBtn) {
    resetBtn.addEventListener("click", resetForm);
  }

  if (addExampleBtn) {
    addExampleBtn.addEventListener("click", () => {
      console.log("예문 추가 버튼 클릭");
      addExampleFields(null, false); // false = 반 예문 (일반 가)
    });
  }

  // 옵션서 정 모드 인 모달제제릴 만 행
  // 초기에행? ?음

  // 재용의 경 정 어 가오
  console.log("재용경 정 어:", userLanguage);

  // HTML 적 이블들경 정 어데트
  await updateStaticLabels(userLanguage);

  // 지어 초기  initLanguageTabEventListeners();
}

// 집 관수  edit-concept-modal.js동인
// 중복수  concept-modal-utils.js동인
async function saveConcept() {
  try {
    console.log("개념 추가 작");

    const conceptData = collectFormData();
    console.log("집이", conceptData);

    const validation = validateForm(conceptData);
    if (!validation.isValid) {
      console.log("검증 실패:", validation.message);
      alert(validation.message);
      return;
    }

    console.log("검증 통과");

    try {
      await conceptUtils.createConcept(conceptData);
      console.log("개념 추가 공");
      alert("개념추가공으로추었니?");

      resetForm();
      closeModal();

      // 면 데트한 벤발생
      console.log("개념 추가 끝 - 면 데트 벤발생");
      if (window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent("concept-saved"));
        console.log("concept-saved 벤발생 끝");
      }

      // 추인한 짧 지청
      setTimeout(() => {
        console.log("추 면 데트 청");
        if (window.dispatchEvent) {
          window.dispatchEvent(new CustomEvent("concept-saved"));
        }
      }, 500);
    } catch (createError) {
      console.error("개념 추가 패:", createError);
      alert(`개념추는 류가 발생습다: ${createError.message}`);
      return;
    }
  } catch (error) {
    console.error("개념 추 체 류 발생:", error);
    console.error("류 택:", error.stack);
    alert(
      `개념추는 류가 발생습다:\n${error.message}\n\n콘솔인여 세 로그인주요.`
    );
  }
}

// validateForm 수concept-modal-utils.js동인
// collectFormData 수concept-modal-utils.js동인
// resetForm 수concept-modal-utils.js동인
// closeModal 수concept-modal-utils.js동인
// 개념 추가 모달 기 (역수)
window.openConceptModal = async function () {
  console.log("개념 추가 모달 기");

  resetForm();

  const modal = document.getElementById("concept-modal");
  if (modal) {
    modal.classList.remove("hidden");

    // 모달린 번역 용
    await applyModalTranslations();
  } else {
    console.error("concept-modal 소찾을 습다");
  }
};

// 요틸리티 수을 직접 구현
function validateForm(formData) {
  if (!formData.expressions || Object.keys(formData.expressions).length === 0) {
    return { isValid: false, message: "최소 나어현어가 요니?" };
  }

  for (const [lang, expression] of Object.entries(formData.expressions)) {
    if (!expression.word || !expression.word.trim()) {
      return { isValid: false, message: `${lang} 어어가 요니?` };
    }
    if (!expression.meaning || !expression.meaning.trim()) {
      return { isValid: false, message: `${lang} 어가 요니?` };
    }
  }

  return { isValid: true };
}

function collectFormData() {
  // 기존 collectFormData 수 구현
  const formData = {
    expressions: {},
    concept_info: {
      domain: document.getElementById("domain")?.value || "general",
      category: document.getElementById("category")?.value || "common",
      difficulty: document.getElementById("difficulty")?.value || "beginner",
      unicode_emoji: document.getElementById("emoji")?.value || "?",
      color_theme: document.getElementById("color")?.value || "#3B82F6",
      tags: [],
    },
    examples: [],
    representative_example: null,
  };

  // 어현 집
  const languages = ["korean", "english", "japanese", "chinese"];
  languages.forEach((lang) => {
    const word = document.getElementById(`${lang}-word`)?.value?.trim();
    const meaning = document.getElementById(`${lang}-meaning`)?.value?.trim();
    const pronunciation = document
      .getElementById(`${lang}-pronunciation`)
      ?.value?.trim();
    const pos = document.getElementById(`${lang}-pos`)?.value;

    if (word && meaning) {
      formData.expressions[lang] = {
        word,
        meaning,
        pronunciation: pronunciation || "",
        part_of_speech: pos || "noun",
      };
    }
  });

  return formData;
}

function resetForm() {
  // 초기  const form = document.getElementById("add-concept-form");
  if (form) {
    form.reset();
  }
}

function closeModal() {
  const modal = document.getElementById("add-concept-modal");
  if (modal) {
    modal.classList.add("hidden");
    resetForm();
  }
}

// 정적 라벨 업데이트 함수 (임시 구현)
async function updateStaticLabels(language) {
  console.log("정적 라벨 업데이트:", language);
  // 필요시 구현
}

// 언어 탭 이벤트 리스너 초기화 (임시 구현)
function initLanguageTabEventListeners() {
  console.log("언어 탭 이벤트 리스너 초기화");
  // 필요시 구현
}

// 예문 필드 추가 함수 (임시 구현)
function addExampleFields(example, isRepresentative) {
  console.log("예문 필드 추가:", { example, isRepresentative });
  // 필요시 구현
}

// 모달 번역 적용 함수 (임시 구현)
async function applyModalTranslations() {
  console.log("모달 번역 적용");
  // 필요시 구현
}
