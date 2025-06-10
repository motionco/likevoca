/**
 * 다국어 단어장 전용 개념 편집 모달 관리 스크립트
 *
 * 역할: 다국어 단어장 개념 편집 전용
 *
 * 구분:
 * - ai-edit-concept-modal.js: AI 개념 편집 전용
 * - edit-concept-modal.js: 다국어 단어장 편집 전용 (이 파일)
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

  // 취소 버튼 이벤트 설정
  const cancelBtn = document.getElementById("cancel-edit-concept");
  if (cancelBtn) {
    cancelBtn.addEventListener("click", (e) => {
      e.preventDefault();
      console.log("❌ 취소 버튼 클릭됨");

      if (confirm("편집을 취소하시겠습니까? 변경사항이 저장되지 않습니다.")) {
        resetEditForm();
        closeEditModal();
        sessionStorage.removeItem("editConceptId");
        editConceptId = null;
        console.log("✅ 편집 취소 완료");
      }
    });
  }

  // X 버튼 이벤트 설정
  const closeBtn = document.getElementById("close-edit-concept-modal");
  if (closeBtn) {
    closeBtn.addEventListener("click", (e) => {
      e.preventDefault();
      console.log("❌ X 버튼 클릭됨");

      if (confirm("편집을 취소하시겠습니까? 변경사항이 저장되지 않습니다.")) {
        resetEditForm();
        closeEditModal();
        sessionStorage.removeItem("editConceptId");
        editConceptId = null;
        console.log("✅ 편집 취소 완료");
      }
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

  // 언어 탭 이벤트 리스너 설정 (커스텀 함수 사용)
  setupEditLanguageTabs();

  // 예문 추가 버튼 이벤트 설정
  const addExampleBtn = document.getElementById("edit-add-example");
  if (addExampleBtn) {
    addExampleBtn.addEventListener("click", (e) => {
      e.preventDefault();
      console.log("➕ 예문 추가 버튼 클릭됨");
      addEditExampleFields(null, false);
    });
  }

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
        conceptData = await conceptUtils.getConcept(conceptId);
        console.log(
          "🔥 일반 개념 조회 성공:",
          conceptData.concept_id || conceptData.id
        );
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
    domainField.value =
      conceptData.concept_info?.domain ||
      conceptData.domain ||
      conceptData.concept_info?.category ||
      "general";
  }
  if (categoryField) {
    categoryField.value =
      conceptData.concept_info?.category || conceptData.category || "common";
  }
  if (emojiField) {
    emojiField.value =
      conceptData.concept_info?.emoji ||
      conceptData.concept_info?.unicode_emoji ||
      conceptData.unicode_emoji ||
      "📝";
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
    console.log("🔍 다국어 편집 모달 예문 채우기 시작:", {
      representative_example: conceptData.representative_example,
      examples: conceptData.examples,
      examples_length: conceptData.examples?.length,
    });

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
        console.log("✅ 다국어 대표 예문 추가:", repExample);
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
      console.log("🔍 다국어 추가 예문 처리:", conceptData.examples);
      for (const example of conceptData.examples) {
        console.log("✅ 다국어 추가 예문 추가:", example);
        addEditExampleFields(example, false);
        hasExamples = true;
      }
    } else {
      console.log(
        "⚠️ 다국어 추가 예문이 없거나 배열이 아닙니다:",
        conceptData.examples
      );
    }

    // 예문이 없으면 기본 대표 예문 필드 추가
    if (!hasExamples) {
      console.log("⚠️ 다국어 예문이 없어서 기본 예문 필드 추가");
      addEditExampleFields(null, true);
    }

    console.log(
      "🔍 다국어 예문 채우기 완료. 컨테이너 내용:",
      examplesContainer.children.length,
      "개 예문"
    );
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
      // 다국어 단어장 개념 수정
      console.log("📝 다국어 단어장 개념 수정 시도...");
      await conceptUtils.updateConcept(editConceptId, conceptData);
      console.log("✅ 다국어 단어장 개념 수정 성공");

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

      // 페이지 새로고침으로 즉각 반영
      console.log("🔄 페이지 새로고침으로 변경사항 즉각 반영");
      setTimeout(() => {
        window.location.reload();
      }, 100);
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

// 편집 모달용 언어탭 설정
function setupEditLanguageTabs() {
  console.log("🔄 편집 모달 언어탭 설정");

  // 편집 모달 컨텍스트 내에서만 요소 찾기
  const editModal = document.getElementById("edit-concept-modal");
  if (!editModal) {
    console.error("❌ 편집 모달을 찾을 수 없음");
    return;
  }

  const tabButtons = editModal.querySelectorAll(
    "#edit-language-tabs .edit-language-tab"
  );

  // 모든 기존 이벤트 리스너 완전 제거
  tabButtons.forEach((button) => {
    // 새로운 클론 생성으로 모든 이벤트 리스너 제거
    const newButton = button.cloneNode(true);
    button.parentNode.replaceChild(newButton, button);
  });

  // 새로운 버튼들에 이벤트 리스너 추가
  const newTabButtons = editModal.querySelectorAll(
    "#edit-language-tabs .edit-language-tab"
  );
  newTabButtons.forEach((button) => {
    button.addEventListener("click", handleTabClick);
  });

  // 첫 번째 탭 자동 활성화
  if (newTabButtons.length > 0) {
    const firstTab = newTabButtons[0];
    const firstLanguage = firstTab.dataset.language;
    switchEditLanguageTab(firstLanguage);
  }

  console.log("✅ 편집 모달 언어탭 설정 완료");
}

// 탭 클릭 핸들러
function handleTabClick(e) {
  e.preventDefault();
  const language = e.currentTarget.dataset.language;
  console.log("🖱️ 편집 모달 언어 탭 클릭:", language);
  switchEditLanguageTab(language);
}

// 편집 모달용 언어탭 전환
function switchEditLanguageTab(language) {
  console.log("🔄 편집 모달 언어 탭 전환:", language);

  // 편집 모달 컨텍스트 내에서만 요소 찾기
  const editModal = document.getElementById("edit-concept-modal");
  if (!editModal) {
    console.error("❌ 편집 모달을 찾을 수 없음");
    return;
  }

  // 모든 탭 버튼 비활성화 (편집 모달 내에서만)
  const allTabs = editModal.querySelectorAll(
    "#edit-language-tabs .edit-language-tab"
  );
  console.log("🔍 전체 탭 버튼 수:", allTabs.length);
  allTabs.forEach((tab, index) => {
    console.log(
      `🔍 탭 ${index}: ${tab.dataset.language}, 클래스:`,
      tab.className
    );
    tab.classList.remove("border-blue-500", "text-blue-600");
    tab.classList.add("border-transparent", "text-gray-500");
  });

  // 모든 콘텐츠 숨기기 (편집 모달 내에서만)
  const allContents = editModal.querySelectorAll(
    "#edit-language-content .language-content"
  );
  console.log("🔍 전체 콘텐츠 섹션 수:", allContents.length);
  allContents.forEach((section, index) => {
    console.log(
      `🔍 콘텐츠 ${index}: ID=${section.id}, 클래스:`,
      section.className
    );
    section.classList.add("hidden");
    section.style.display = "none"; // 추가 보장
  });

  // 선택된 탭 활성화 (편집 모달 내에서만)
  const selectedTab = editModal.querySelector(
    `#edit-language-tabs .edit-language-tab[data-language="${language}"]`
  );
  if (selectedTab) {
    selectedTab.classList.remove("border-transparent", "text-gray-500");
    selectedTab.classList.add("border-blue-500", "text-blue-600");
    console.log(
      "✅ 편집 모달 탭 활성화됨:",
      language,
      "클래스:",
      selectedTab.className
    );
  } else {
    console.error("❌ 편집 모달 탭을 찾을 수 없음:", language);
  }

  // 선택된 콘텐츠 표시 (편집 모달 내에서만)
  const selectedContent = editModal.querySelector(`#${language}-content`);
  if (selectedContent) {
    selectedContent.classList.remove("hidden");
    selectedContent.style.display = "block"; // 추가 보장
    console.log("✅ 편집 모달 콘텐츠 표시됨:", language);
    console.log("🔍 콘텐츠 최종 클래스:", selectedContent.className);
    console.log("🔍 콘텐츠 스타일:", {
      display: selectedContent.style.display,
      visibility: selectedContent.style.visibility,
      height: selectedContent.offsetHeight,
      width: selectedContent.offsetWidth,
    });
  } else {
    console.error("❌ 편집 모달 콘텐츠를 찾을 수 없음:", `${language}-content`);
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
