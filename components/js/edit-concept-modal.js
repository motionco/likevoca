/**
 * 다국어 단어장 전용 개념 편집 모달 관리 스크립트
 *
 * 역할: 다국어 단어장 개념 편집 전용
 *
 * 구분:
 * - ai-edit-concept-modal.js: AI 개념 편집 전용
 * - edit-concept-modal.js: 다국어 단어장 편집 전용 (이 파일)
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
  applyModalTranslations,
} from "./concept-modal-utils.js";

// 전역 변수 (편집 모드 전용)
let editConceptId = null;
let supportedLangs = { ...supportedLanguages };

// 편집 모달 초기화
export async function initialize() {
  // 편집 상태 확인
  editConceptId = sessionStorage.getItem("editConceptId");

  if (!editConceptId) {
    console.error("❌ 편집할 개념 ID가 없습니다");
    alert("편집할 개념이 지정되지 않았습니다.");
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
        resetEditForm();
        closeEditModal();
        sessionStorage.removeItem("editConceptId");
        editConceptId = null;
      }
    });
  }

  // X 버튼 이벤트 설정 (중복 방지)
  setupEditModalCloseButton();

  // 환경 설정 언어 가져오기
  let userLanguage = "ko";
  try {
    userLanguage = await getActiveLanguage();
  } catch (error) {
    console.warn("언어 설정 로드 실패, 기본값 사용:", error);
  }

  // HTML 정적 레이블들을 환경 설정 언어로 업데이트
  await updateStaticLabels(userLanguage);

  // 언어 탭 이벤트 리스너 설정 (커스텀 함수 사용)
  setupEditLanguageTabs();

  // 편집 모달 도메인-카테고리 이벤트 리스너 설정
  setupEditDomainCategoryListeners();

  // 예문 추가 버튼 이벤트 설정 (중복 방지)
  setupEditModalAddExampleButton();

  // 개념 데이터 로드 및 폼 채우기
  await fetchConceptForEdit(editConceptId);
}

// 편집용 개념 데이터 가져오기
async function fetchConceptForEdit(conceptId) {
  try {
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
          break;
        }
      }
    }

    // 메모리에서 찾지 못했으면 Firebase 조회
    if (!conceptData) {
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

    fillFormWithConceptData(conceptData);
  } catch (error) {
    console.error("❌ 개념 정보를 가져오는 중 오류:", error);
    alert(error.message || "개념 정보를 불러올 수 없습니다.");
  }
}

// 폼에 개념 데이터 채우기
function fillFormWithConceptData(conceptData) {
  console.log("📝 폼 데이터 채우기 시작");

  // 개념 정보 채우기 (직접 설정하지 않고 setEditModalCategoryAndEmoji에서 처리)
  const emojiValue =
    conceptData.concept_info?.unicode_emoji ||
    conceptData.concept_info?.emoji ||
    conceptData.unicode_emoji ||
    "📝";

  // 전역 저장소에 이모지 값 저장
  window.editConceptEmojiValue = emojiValue;
  console.log(
    "💾 편집 모달 초기화 시 전역 저장소에 이모지 값 저장:",
    emojiValue
  );

  // 목적 필드 채우기
  const purposeField = document.getElementById("edit-concept-purpose");
  if (purposeField) {
    const purpose = conceptData.concept_info?.purpose || "description";
    purposeField.value = purpose;
    console.log("🎯 목적 필드 설정:", purpose);
  }

  // 상황 체크박스들 채우기
  const situations = conceptData.concept_info?.situation || ["casual"];
  const situationCheckboxes = document.querySelectorAll(
    'input[name="edit-concept-situation"]'
  );

  // 모든 체크박스 초기화
  situationCheckboxes.forEach((checkbox) => {
    checkbox.checked = false;
  });

  // 해당하는 상황들 체크
  situations.forEach((situation) => {
    const checkbox = document.querySelector(
      `input[name="edit-concept-situation"][value="${situation}"]`
    );
    if (checkbox) {
      checkbox.checked = true;
    }
  });
  console.log("🏢 상황 필드 설정:", situations);

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
      // 대표 예문이 없는 경우, 첫 번째 예문을 대표 예문으로 처리
      if (!hasExamples && conceptData.examples.length > 0) {
        const firstExample = conceptData.examples[0];
        addEditExampleFields(firstExample, true);
        hasExamples = true;

        // 나머지 예문들을 일반 예문으로 추가
        for (let i = 1; i < conceptData.examples.length; i++) {
          const example = conceptData.examples[i];
          addEditExampleFields(example, false);
        }
      } else {
        // 대표 예문이 이미 있는 경우, 모든 예문을 일반 예문으로 추가
        for (const example of conceptData.examples) {
          addEditExampleFields(example, false);
          hasExamples = true;
        }
      }
    }

    // 예문이 없으면 기본 대표 예문 필드 추가
    if (!hasExamples) {
      addEditExampleFields(null, true);
    }
  }

  // 카테고리와 이모지 설정 (개념 추가와 동일한 방식)
  setEditModalCategoryAndEmoji(conceptData);
}

// 편집 모달 카테고리와 이모지 설정 (개념 추가와 동일한 방식)
function setEditModalCategoryAndEmoji(conceptData) {
  // 전역 저장소에 DB 이모지 값 저장 (옵션 생성에서 사용)
  const dbEmoji =
    conceptData.concept_info?.unicode_emoji ||
    conceptData.concept_info?.emoji ||
    conceptData.unicode_emoji;

  if (dbEmoji) {
    window.editConceptEmojiValue = dbEmoji;
  }

  // 도메인과 카테고리 값 확인
  const domainValue =
    conceptData.concept_info?.domain || conceptData.domain || "other";
  const categoryValue =
    conceptData.concept_info?.category || conceptData.category || "other";

  console.log("🔍 편집 모달 설정 값:", {
    domainValue,
    categoryValue,
    dbEmoji,
    conceptData: conceptData.concept_info || conceptData,
  });

  // 도메인 설정
  const domainField = document.getElementById("edit-concept-domain");
  if (domainField) {
    domainField.value = domainValue;

    // 도메인 변경 이벤트 트리거 (카테고리 옵션 자동 생성)
    domainField.dispatchEvent(new Event("change"));

    // 카테고리 설정 (도메인 변경 후 충분한 지연)
    setTimeout(() => {
      const categoryField = document.getElementById("edit-concept-category");
      if (categoryField) {
        categoryField.value = categoryValue;
        console.log("📝 카테고리 필드 설정:", categoryValue);

        // 카테고리 변경 이벤트 트리거 (이모지 옵션 자동 생성)
        categoryField.dispatchEvent(new Event("change"));

        // 이모지 설정 (카테고리 변경 후 충분한 지연)
        setTimeout(() => {
          const emojiField = document.getElementById("edit-concept-emoji");
          if (emojiField && dbEmoji) {
            emojiField.value = dbEmoji;
            console.log("🎨 이모지 필드 설정:", dbEmoji);

            // 설정 확인 및 재시도
            if (emojiField.value !== dbEmoji) {
              console.warn("⚠️ 이모지 설정 실패, 재시도 중...");
              setTimeout(() => {
                emojiField.value = dbEmoji;
                console.log("🔄 이모지 재설정:", dbEmoji);
              }, 100);
            }
          }
        }, 200);
      }
    }, 200);
  }
}

// 개념 수정 저장
async function saveConcept() {
  try {
    if (!validateEditForm()) {
      return;
    }

    const conceptData = collectEditFormData();

    try {
      // 다국어 단어장 개념 수정
      await conceptUtils.updateConcept(editConceptId, conceptData);

      alert("개념이 성공적으로 수정되었습니다.");

      resetEditForm();
      closeEditModal();

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

// 편집 모달 X 버튼 이벤트 설정 (중복 방지)
function setupEditModalCloseButton() {
  const closeBtn = document.getElementById("close-edit-concept-modal");
  if (closeBtn) {
    // 기존 이벤트 리스너 제거 (클론으로 완전 제거)
    const newCloseBtn = closeBtn.cloneNode(true);
    closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);

    // 새로운 이벤트 리스너 등록
    newCloseBtn.addEventListener("click", handleEditModalClose);
  }
}

// 편집 모달 X 버튼 클릭 핸들러
function handleEditModalClose(e) {
  e.preventDefault();

  if (confirm("편집을 취소하시겠습니까? 변경사항이 저장되지 않습니다.")) {
    resetEditForm();
    closeEditModal();
    sessionStorage.removeItem("editConceptId");
    editConceptId = null;
  }
}

// 편집 모달 예문 추가 버튼 이벤트 설정 (중복 방지)
function setupEditModalAddExampleButton() {
  const addExampleBtn = document.getElementById("edit-add-example");
  if (addExampleBtn) {
    // 기존 이벤트 리스너 제거 (클론으로 완전 제거)
    const newAddExampleBtn = addExampleBtn.cloneNode(true);
    addExampleBtn.parentNode.replaceChild(newAddExampleBtn, addExampleBtn);

    // 새로운 이벤트 리스너 등록
    newAddExampleBtn.addEventListener("click", handleAddExampleClick);
  }
}

// 편집 모달 예문 추가 버튼 클릭 핸들러
function handleAddExampleClick(e) {
  e.preventDefault();

  addEditExampleFields(null, false);
}

// 편집 모달 도메인-카테고리 이벤트 리스너 설정 (중복 방지)
function setupEditDomainCategoryListeners() {
  const domainSelect = document.getElementById("edit-concept-domain");
  const categorySelect = document.getElementById("edit-concept-category");

  if (domainSelect) {
    // 클론 방식으로 기존 이벤트 리스너 완전 제거
    const newDomainSelect = domainSelect.cloneNode(true);
    domainSelect.parentNode.replaceChild(newDomainSelect, domainSelect);

    // 새로운 이벤트 리스너 등록
    newDomainSelect.addEventListener("change", handleEditDomainChange);
  }

  if (categorySelect) {
    // 클론 방식으로 기존 이벤트 리스너 완전 제거
    const newCategorySelect = categorySelect.cloneNode(true);
    categorySelect.parentNode.replaceChild(newCategorySelect, categorySelect);

    // 새로운 이벤트 리스너 등록
    newCategorySelect.addEventListener("change", handleEditCategoryChange);
  }
}

// 편집 모달 도메인 변경 핸들러
function handleEditDomainChange(event) {
  // 카테고리 옵션 업데이트
  if (typeof updateEditCategoryOptions === "function") {
    updateEditCategoryOptions();
  }

  // 카테고리 초기화 (첫 번째 옵션 선택)
  setTimeout(() => {
    const categorySelect = document.getElementById("edit-concept-category");
    if (categorySelect && categorySelect.options.length > 1) {
      categorySelect.selectedIndex = 1; // 첫 번째 실제 옵션 선택 (0은 플레이스홀더)

      // 카테고리 변경 이벤트 트리거
      categorySelect.dispatchEvent(new Event("change"));
    }
  }, 50);
}

// 편집 모달 카테고리 변경 핸들러
function handleEditCategoryChange(event) {
  // 이모지 옵션 업데이트
  if (typeof updateEditEmojiOptions === "function") {
    updateEditEmojiOptions();
  }
}

// 편집 모달용 언어탭 설정 (중복 방지 개선)
function setupEditLanguageTabs() {
  // 편집 모달 컨텍스트 내에서만 요소 찾기
  const editModal = document.getElementById("edit-concept-modal");
  if (!editModal) {
    return;
  }

  const tabButtons = editModal.querySelectorAll(
    "#edit-language-tabs .edit-language-tab"
  );

  // 모든 기존 이벤트 리스너 완전 제거 (클론 방식)
  const newTabButtons = [];
  tabButtons.forEach((button) => {
    const newButton = button.cloneNode(true);
    button.parentNode.replaceChild(newButton, button);
    newTabButtons.push(newButton);
  });

  // 새로운 버튼들에 이벤트 리스너 추가
  newTabButtons.forEach((button) => {
    button.addEventListener("click", handleTabClick);
  });

  // 첫 번째 탭 자동 활성화
  if (newTabButtons.length > 0) {
    const firstTab = newTabButtons[0];
    const firstLanguage = firstTab.dataset.language;
    switchEditLanguageTab(firstLanguage);
  }
}

// 탭 클릭 핸들러
function handleTabClick(e) {
  e.preventDefault();
  const language = e.currentTarget.dataset.language;
  switchEditLanguageTab(language);
}

// 편집 모달용 언어탭 전환
function switchEditLanguageTab(language) {
  // 편집 모달 컨텍스트 내에서만 요소 찾기
  const editModal = document.getElementById("edit-concept-modal");
  if (!editModal) {
    return;
  }

  // 모든 탭 버튼 비활성화 (편집 모달 내에서만)
  const allTabs = editModal.querySelectorAll(
    "#edit-language-tabs .edit-language-tab"
  );
  allTabs.forEach((tab) => {
    tab.classList.remove("border-blue-500", "text-blue-600");
    tab.classList.add("border-transparent", "text-gray-500");
  });

  // 모든 콘텐츠 숨기기 (편집 모달 내에서만)
  const allContents = editModal.querySelectorAll(
    "#edit-language-content .language-content"
  );
  allContents.forEach((section) => {
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
  }

  // 선택된 콘텐츠 표시 (편집 모달 내에서만)
  const selectedContent = editModal.querySelector(`#${language}-content`);
  if (selectedContent) {
    selectedContent.classList.remove("hidden");
    selectedContent.style.display = "block"; // 추가 보장
  }
}

// 편집 모달 열기 (전역 함수)
window.openEditConceptModal = async function (conceptId) {
  // 편집 상태 설정
  sessionStorage.setItem("editConceptId", conceptId);
  editConceptId = conceptId;

  // 모달 표시
  const modal = document.getElementById("edit-concept-modal");
  if (modal) {
    modal.classList.remove("hidden");
    initialize(); // 편집 모드로 초기화

    // 모달이 열린 후 번역 적용
    await applyModalTranslations();
  } else {
    console.error("❌ edit-concept-modal 요소를 찾을 수 없습니다");
  }
};
