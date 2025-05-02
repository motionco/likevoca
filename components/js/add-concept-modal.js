import {
  auth,
  db,
  conceptUtils,
  supportedLanguages,
} from "../../js/firebase/firebase-init.js";

// 전역 변수
let isEditMode = false;
let editConceptId = null;
let supportedLangs = { ...supportedLanguages };

export function initialize() {
  console.log("개념 추가 모달 초기화");

  // 모달 요소
  const modal = document.getElementById("concept-modal");
  const closeBtn = document.getElementById("close-concept-modal");
  const saveBtn = document.getElementById("save-concept");
  const resetBtn = document.getElementById("reset-concept-form");
  const addExampleBtn = document.getElementById("add-example");

  // 이벤트 리스너 등록
  if (closeBtn) {
    closeBtn.addEventListener("click", closeModal);
  }

  if (saveBtn) {
    saveBtn.addEventListener("click", saveConcept);
  }

  if (resetBtn) {
    resetBtn.addEventListener("click", resetForm);
  }

  if (addExampleBtn) {
    addExampleBtn.addEventListener("click", addExampleFields);
  }

  // 세션에서 수정 모드 확인
  const editMode = sessionStorage.getItem("conceptEditMode") === "true";
  const conceptId = sessionStorage.getItem("editConceptId");

  if (editMode && conceptId) {
    isEditMode = true;
    editConceptId = conceptId;
    fetchConceptForEdit(conceptId);
  }

  // 지원 언어 탭 초기화
  initLanguageTabs();
}

async function fetchConceptForEdit(conceptId) {
  try {
    const conceptData = await conceptUtils.getConcept(conceptId);
    if (conceptData) {
      fillFormWithConceptData(conceptData);
    } else {
      alert("개념 정보를 찾을 수 없습니다.");
      resetForm();
    }
  } catch (error) {
    console.error("개념 정보를 가져오는 중 오류 발생:", error);
    alert("개념 정보를 불러올 수 없습니다.");
  }
}

function fillFormWithConceptData(conceptData) {
  // 개념 정보 채우기
  document.getElementById("concept-domain").value =
    conceptData.concept_info.domain || "";
  document.getElementById("concept-category").value =
    conceptData.concept_info.category || "";
  document.getElementById("concept-emoji").value =
    conceptData.concept_info.emoji || "";

  // 표현 정보 채우기
  for (const [lang, expression] of Object.entries(conceptData.expressions)) {
    if (document.getElementById(`${lang}-word`)) {
      document.getElementById(`${lang}-word`).value = expression.word || "";
      document.getElementById(`${lang}-pronunciation`).value =
        expression.pronunciation || "";
      document.getElementById(`${lang}-definition`).value =
        expression.definition || "";
      document.getElementById(`${lang}-part-of-speech`).value =
        expression.part_of_speech || "";
      document.getElementById(`${lang}-level`).value = expression.level || "";
    }
  }

  // 예제 채우기
  if (conceptData.examples && conceptData.examples.length > 0) {
    const examplesContainer = document.getElementById("examples-container");
    examplesContainer.innerHTML = ""; // 기존 예제 필드 초기화

    for (const example of conceptData.examples) {
      addExampleFields(example);
    }
  }

  // 모달 제목 변경
  const modalTitle = document.querySelector("#concept-modal h2");
  if (modalTitle) modalTitle.textContent = "개념 수정";

  // 저장 버튼 텍스트 변경
  const saveBtn = document.getElementById("save-concept");
  if (saveBtn) saveBtn.textContent = "수정하기";
}

function initLanguageTabs() {
  const tabContainer = document.getElementById("language-tabs");
  const panelContainer = document.getElementById("language-panels");

  if (!tabContainer || !panelContainer) return;

  // 탭 및 패널 초기화
  tabContainer.innerHTML = "";
  panelContainer.innerHTML = "";

  // 각 언어에 대한 탭과 패널 생성
  Object.entries(supportedLangs).forEach(([langCode, langInfo], index) => {
    // 탭 생성
    const tab = document.createElement("button");
    tab.id = `${langCode}-tab`;
    tab.className = `px-4 py-2 ${
      index === 0 ? "bg-blue-500 text-white" : "bg-gray-200"
    }`;
    tab.textContent = langInfo.nameKo;
    tab.onclick = () => switchLanguageTab(langCode);

    tabContainer.appendChild(tab);

    // 패널 생성
    const panel = document.createElement("div");
    panel.id = `${langCode}-panel`;
    panel.className = `${index === 0 ? "" : "hidden"} p-4 border rounded-b`;

    panel.innerHTML = `
      <div class="mb-4">
        <label class="block text-sm font-medium mb-1">단어 (${langInfo.nameKo})</label>
        <input type="text" id="${langCode}-word" class="w-full p-2 border rounded" placeholder="예: ${langInfo.example}">
      </div>
      <div class="mb-4">
        <label class="block text-sm font-medium mb-1">발음</label>
        <input type="text" id="${langCode}-pronunciation" class="w-full p-2 border rounded">
      </div>
      <div class="mb-4">
        <label class="block text-sm font-medium mb-1">의미/정의</label>
        <textarea id="${langCode}-definition" class="w-full p-2 border rounded" rows="2"></textarea>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div class="mb-4">
          <label class="block text-sm font-medium mb-1">품사</label>
          <select id="${langCode}-part-of-speech" class="w-full p-2 border rounded">
            <option value="noun">명사</option>
            <option value="verb">동사</option>
            <option value="adjective">형용사</option>
            <option value="adverb">부사</option>
            <option value="pronoun">대명사</option>
            <option value="preposition">전치사</option>
            <option value="conjunction">접속사</option>
            <option value="interjection">감탄사</option>
          </select>
        </div>
        <div class="mb-4">
          <label class="block text-sm font-medium mb-1">난이도</label>
          <select id="${langCode}-level" class="w-full p-2 border rounded">
            <option value="beginner">초급</option>
            <option value="intermediate">중급</option>
            <option value="advanced">고급</option>
          </select>
        </div>
      </div>
    `;

    panelContainer.appendChild(panel);
  });
}

function switchLanguageTab(langCode) {
  // 모든 탭과 패널 비활성화
  document.querySelectorAll("[id$='-tab']").forEach((tab) => {
    tab.classList.remove("bg-blue-500", "text-white");
    tab.classList.add("bg-gray-200");
  });

  document.querySelectorAll("[id$='-panel']").forEach((panel) => {
    panel.classList.add("hidden");
  });

  // 선택된 탭과 패널 활성화
  const selectedTab = document.getElementById(`${langCode}-tab`);
  const selectedPanel = document.getElementById(`${langCode}-panel`);

  if (selectedTab) {
    selectedTab.classList.remove("bg-gray-200");
    selectedTab.classList.add("bg-blue-500", "text-white");
  }

  if (selectedPanel) {
    selectedPanel.classList.remove("hidden");
  }
}

function addExampleFields(existingExample = null) {
  const container = document.getElementById("examples-container");
  if (!container) return;

  const exampleDiv = document.createElement("div");
  exampleDiv.className = "example-item border p-4 rounded mb-4";

  let exampleHtml = `<div class="mb-2 flex justify-between items-center">
    <span class="font-medium">예문</span>
    <button type="button" class="text-red-500 hover:text-red-700" onclick="this.parentNode.parentNode.remove()">
      <i class="fas fa-trash"></i> 삭제
    </button>
  </div>`;

  // 각 언어별 예문 필드 추가
  Object.entries(supportedLangs).forEach(([langCode, langInfo]) => {
    const exampleText = existingExample ? existingExample[langCode] || "" : "";

    exampleHtml += `
      <div class="mb-3">
        <label class="block text-sm font-medium mb-1">${langInfo.nameKo}</label>
        <input type="text" class="${langCode}-example" value="${exampleText}" 
               placeholder="${langInfo.nameKo} 예문" class="w-full p-2 border rounded">
      </div>
    `;
  });

  exampleDiv.innerHTML = exampleHtml;
  container.appendChild(exampleDiv);
}

async function saveConcept() {
  try {
    if (!validateForm()) {
      return;
    }

    const conceptData = collectFormData();

    if (isEditMode) {
      await conceptUtils.updateConcept(editConceptId, conceptData);
      alert("개념이 성공적으로 수정되었습니다.");
    } else {
      await conceptUtils.createConcept(conceptData);
      alert("새 개념이 성공적으로 추가되었습니다.");
    }

    resetForm();
    closeModal();

    // 페이지 새로고침 또는 목록 업데이트를 위한 이벤트 발생
    window.dispatchEvent(new CustomEvent("concept-saved"));
  } catch (error) {
    console.error("개념 저장 중 오류 발생:", error);
    alert(`개념을 저장하는 중 오류가 발생했습니다: ${error.message}`);
  }
}

function validateForm() {
  // 필수 필드 검증
  const domain = document.getElementById("concept-domain").value.trim();
  const category = document.getElementById("concept-category").value.trim();

  if (!domain || !category) {
    alert("도메인과 카테고리는 필수 입력항목입니다.");
    return false;
  }

  // 적어도 하나의 언어는 필수
  let hasValidLanguage = false;

  for (const langCode of Object.keys(supportedLangs)) {
    const wordField = document.getElementById(`${langCode}-word`);
    if (wordField && wordField.value.trim()) {
      hasValidLanguage = true;
      break;
    }
  }

  if (!hasValidLanguage) {
    alert("적어도 하나의 언어에 단어를 입력해야 합니다.");
    return false;
  }

  return true;
}

function collectFormData() {
  // 개념 정보
  const conceptInfo = {
    domain: document.getElementById("concept-domain").value.trim(),
    category: document.getElementById("concept-category").value.trim(),
    emoji: document.getElementById("concept-emoji").value.trim(),
    images: [], // 이미지는 나중에 구현
  };

  // 언어별 표현 수집
  const expressions = {};
  for (const langCode of Object.keys(supportedLangs)) {
    const wordField = document.getElementById(`${langCode}-word`);
    if (wordField && wordField.value.trim()) {
      expressions[langCode] = {
        word: document.getElementById(`${langCode}-word`).value.trim(),
        pronunciation: document
          .getElementById(`${langCode}-pronunciation`)
          .value.trim(),
        definition: document
          .getElementById(`${langCode}-definition`)
          .value.trim(),
        part_of_speech: document.getElementById(`${langCode}-part-of-speech`)
          .value,
        level: document.getElementById(`${langCode}-level`).value,
      };
    }
  }

  // 예제 수집
  const examples = [];
  document.querySelectorAll(".example-item").forEach((item) => {
    const example = {};
    let hasContent = false;

    // 각 언어별 예제 수집
    for (const langCode of Object.keys(supportedLangs)) {
      const exampleField = item.querySelector(`.${langCode}-example`);
      if (exampleField && exampleField.value.trim()) {
        example[langCode] = exampleField.value.trim();
        hasContent = true;
      }
    }

    // 내용이 있는 예제만 추가
    if (hasContent) {
      examples.push(example);
    }
  });

  return {
    concept_info: conceptInfo,
    expressions: expressions,
    examples: examples,
  };
}

function resetForm() {
  // 폼 리셋
  document.getElementById("concept-domain").value = "";
  document.getElementById("concept-category").value = "";
  document.getElementById("concept-emoji").value = "";

  // 언어별 필드 초기화
  for (const langCode of Object.keys(supportedLangs)) {
    if (document.getElementById(`${langCode}-word`)) {
      document.getElementById(`${langCode}-word`).value = "";
      document.getElementById(`${langCode}-pronunciation`).value = "";
      document.getElementById(`${langCode}-definition`).value = "";
      document.getElementById(`${langCode}-part-of-speech`).value = "noun";
      document.getElementById(`${langCode}-level`).value = "beginner";
    }
  }

  // 예제 초기화
  const examplesContainer = document.getElementById("examples-container");
  if (examplesContainer) {
    examplesContainer.innerHTML = "";
  }

  // 편집 모드 초기화
  isEditMode = false;
  editConceptId = null;

  // 세션 스토리지 초기화
  sessionStorage.removeItem("conceptEditMode");
  sessionStorage.removeItem("editConceptId");

  // 모달 제목 초기화
  const modalTitle = document.querySelector("#concept-modal h2");
  if (modalTitle) modalTitle.textContent = "새 개념 추가";

  // 저장 버튼 텍스트 초기화
  const saveBtn = document.getElementById("save-concept");
  if (saveBtn) saveBtn.textContent = "추가하기";
}

function closeModal() {
  const modal = document.getElementById("concept-modal");
  if (modal) {
    modal.classList.add("hidden");
  }
  resetForm();
}

// 전역 함수로 내보내기 (다른 모듈에서 호출용)
window.openConceptModal = function (conceptId = null) {
  if (conceptId) {
    isEditMode = true;
    editConceptId = conceptId;
    sessionStorage.setItem("conceptEditMode", "true");
    sessionStorage.setItem("editConceptId", conceptId);
    fetchConceptForEdit(conceptId);
  } else {
    isEditMode = false;
    editConceptId = null;
    sessionStorage.removeItem("conceptEditMode");
    sessionStorage.removeItem("editConceptId");
    resetForm();
  }

  const modal = document.getElementById("concept-modal");
  if (modal) {
    modal.classList.remove("hidden");
  }
};
