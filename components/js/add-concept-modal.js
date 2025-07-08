/**
 * 개념 추가 모달 관리 스크립트
 *
 * 역할: 새 개념 추가 전용
 *
 * 구분:
 * - add-concept-modal.js: 개념 추가 전용 (이 파일)
 * - edit-concept-modal.js: 개념 편집 전용
 * - ai-concept-modal.js: AI 단어장 개념 보기 전용 (읽기 전용)
 */

import {
  auth,
  db,
  conceptUtils,
  supportedLanguages,
} from "../../js/firebase/firebase-init.js";
import { getActiveLanguage } from "../../utils/language-utils.js";
import {
  domainCategoryMapping,
  categoryEmojiMapping,
} from "./domain-category-emoji.js";
import {
  validateForm,
  collectFormData,
  resetForm,
  closeModal,
  initLanguageTabEventListeners,
  switchLanguageTab,
  addExampleFields,
  updateStaticLabels,
  applyModalTranslations,
} from "./concept-modal-utils.js";

// 전역 변수 (추가 모드 전용)
let supportedLangs = { ...supportedLanguages };

// 중복된 유틸리티 함수들은 concept-modal-utils.js로 이동됨

export async function initialize() {
  console.log("개념 추가 모달 초기화");

  // 모달 요소
  const modal = document.getElementById("concept-modal");
  const closeBtn = document.getElementById("close-concept-modal");
  const saveBtn = document.getElementById("save-concept");
  const cancelBtn = document.getElementById("cancel-concept");
  const resetBtn = document.getElementById("reset-concept-form");
  const addExampleBtn = document.getElementById("add-example");

  // 이벤트 리스너 등록
  if (closeBtn) {
    closeBtn.addEventListener("click", closeModal);
  }

  if (saveBtn) {
    saveBtn.addEventListener("click", (event) => {
      event.preventDefault(); // 폼 기본 제출 동작 방지
      console.log("💾 저장 버튼 클릭됨, 기본 동작 방지됨");
      saveConcept();
    });
  }

  // 폼 자체의 submit 이벤트도 방지
  const conceptForm = document.getElementById("concept-form");
  if (conceptForm) {
    conceptForm.addEventListener("submit", (event) => {
      event.preventDefault(); // 폼 제출 방지
      console.log("📝 폼 제출 시도됨, 기본 동작 방지됨");
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
      console.log("➕ 예문 추가 버튼 클릭");
      addExampleFields(null, false); // false = 일반 예문 (삭제 가능)
    });
  }

  // 세션에서 수정 모드 확인은 모달이 실제로 열릴 때만 수행
  // 초기화 시에는 수행하지 않음

  // 현재 사용자의 환경 설정 언어 가져오기
  const userLanguage = await getActiveLanguage();
  console.log("🌍 사용자 환경 설정 언어:", userLanguage);

  // HTML 정적 레이블들을 환경 설정 언어로 업데이트
  await updateStaticLabels(userLanguage);

  // 지원 언어 탭 초기화
  initLanguageTabEventListeners();
}

// 편집 관련 함수들은 edit-concept-modal.js로 이동됨

// 중복된 함수들은 concept-modal-utils.js로 이동됨

async function saveConcept() {
  try {
    console.log("➕ 새 개념 추가 시작");

    if (!validateForm()) {
      console.log("❌ 폼 검증 실패");
      return;
    }

    console.log("✅ 폼 검증 통과");
    const conceptData = collectFormData();
    console.log("📋 수집된 데이터:", conceptData);

    try {
      await conceptUtils.createConcept(conceptData);
      console.log("✅ 개념 추가 성공");
      alert("새 개념이 성공적으로 추가되었습니다.");

      resetForm();
      closeModal();

      // 화면 업데이트를 위한 이벤트 발생
      console.log("🔔 새 개념 추가 완료 - 화면 업데이트 이벤트 발생");
      if (window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent("concept-saved"));
        console.log("✅ concept-saved 이벤트 발생 완료");
      }

      // 추가 확인을 위한 짧은 지연 후 재확인
      setTimeout(() => {
        console.log("🔄 추가 화면 업데이트 요청");
        if (window.dispatchEvent) {
          window.dispatchEvent(new CustomEvent("concept-saved"));
        }
      }, 500);
    } catch (createError) {
      console.error("❌ 개념 추가 실패:", createError);
      alert(`개념을 추가하는 중 오류가 발생했습니다: ${createError.message}`);
      return;
    }
  } catch (error) {
    console.error("개념 추가 중 전체 오류 발생:", error);
    console.error("오류 스택:", error.stack);
    alert(
      `개념을 추가하는 중 오류가 발생했습니다:\n${error.message}\n\n콘솔을 확인하여 상세 로그를 확인해주세요.`
    );
  }
}

// validateForm 함수는 concept-modal-utils.js로 이동됨

// collectFormData 함수는 concept-modal-utils.js로 이동됨

// resetForm 함수는 concept-modal-utils.js로 이동됨

// closeModal 함수는 concept-modal-utils.js로 이동됨

// 개념 추가 모달 열기 (전역 함수)
window.openConceptModal = async function () {
  console.log("➕ 새 개념 추가 모달 열기");

  resetForm();

  const modal = document.getElementById("concept-modal");
  if (modal) {
    modal.classList.remove("hidden");

    // 모달이 열린 후 번역 적용
    await applyModalTranslations();
  } else {
    console.error("❌ concept-modal 요소를 찾을 수 없습니다");
  }
};
