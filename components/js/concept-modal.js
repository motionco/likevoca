import {
  auth,
  db,
  supportedLanguages,
} from "../../js/firebase/firebase-init.js";
import {
  deleteDoc,
  doc,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

// 전역 변수
let currentConcept = null;

// 발음 효과 스타일 추가
function addSpeakingStyles() {
  if (!document.getElementById("speaking-effect-style")) {
    const styleElement = document.createElement("style");
    styleElement.id = "speaking-effect-style";
    styleElement.textContent = `
      @keyframes speakingPulse {
        0% { color: #1a56db; transform: scale(1); }
        50% { color: #3182ce; transform: scale(1.05); }
        100% { color: #1a56db; transform: scale(1); }
      }
      .speaking-effect {
        animation: speakingPulse 1s infinite ease-in-out;
        color: #1a56db;
        font-weight: bold;
      }
    `;
    document.head.appendChild(styleElement);
  }
}

// 모든 상태 초기화 함수
function resetAllState() {
  currentConcept = null;
  console.log("모든 상태 초기화 완료");
}

// 모달 이벤트 리스너 설정
function setupModalEventListeners() {
  addSpeakingStyles();

  const modal = document.getElementById("concept-view-modal");
  const closeBtn = document.getElementById("close-concept-view-modal");
  const editBtn = document.getElementById("edit-concept-button");
  const deleteBtn = document.getElementById("delete-concept-button");

  if (closeBtn) {
    closeBtn.addEventListener("click", closeModal);
  }

  if (editBtn) {
    editBtn.addEventListener("click", editConcept);
  }

  if (deleteBtn) {
    deleteBtn.addEventListener("click", deleteConcept);
  }

  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal && !modal.classList.contains("hidden")) {
      closeModal();
    }
  });
}

// 개념 모달 표시
export function showConceptModal(concept) {
  console.log("개념 모달 열기:", concept);

  if (!concept) {
    console.error("개념 데이터가 없습니다.");
    return;
  }

  currentConcept = concept;
  resetAllState();

  const modal = document.getElementById("concept-view-modal");
  if (!modal) {
    console.error("모달 요소를 찾을 수 없습니다.");
    return;
  }

  // 기본 언어 결정 (첫 번째 사용 가능한 언어)
  const availableLanguages = Object.keys(concept.expressions || {});
  if (availableLanguages.length === 0) {
    console.error("사용 가능한 언어 표현이 없습니다.");
    return;
  }

  // 탭 생성
  const tabsContainer = document.getElementById("concept-view-tabs");
  const contentContainer = document.getElementById("concept-view-content");

  if (tabsContainer && contentContainer) {
    // 탭 버튼들 생성
    tabsContainer.innerHTML = availableLanguages
      .map(
        (lang, index) => `
      <button 
        class="px-4 py-2 ${
          index === 0 ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"
        } ${index === 0 ? "" : "hover:bg-gray-300"}"
        onclick="showLanguageTab('${lang}', this)"
      >
        ${getLanguageName(lang)}
      </button>
    `
      )
      .join("");

    // 첫 번째 언어 내용 표시
    showLanguageContent(availableLanguages[0], concept);
  }

  // 예문 표시
  const examplesContainer = document.getElementById("concept-view-examples");
  if (examplesContainer && concept.examples && concept.examples.length > 0) {
    examplesContainer.innerHTML = concept.examples
      .map(
        (example, index) => `
      <div class="mb-4 p-4 bg-gray-50 rounded">
        <h4 class="font-medium mb-2">예문 ${index + 1}</h4>
        ${availableLanguages
          .map((lang) =>
            example[lang]
              ? `<p><strong>${getLanguageName(lang)}:</strong> ${
                  example[lang]
                }</p>`
              : ""
          )
          .join("")}
      </div>
    `
      )
      .join("");
  }

  // 모달 표시
  modal.classList.remove("hidden");
  setupModalEventListeners();
}

// 언어 이름 가져오기
function getLanguageName(langCode) {
  const languageNames = {
    korean: "한국어",
    english: "English",
    japanese: "日本語",
    chinese: "中文",
  };
  return languageNames[langCode] || langCode;
}

// 언어별 내용 표시
function showLanguageContent(lang, concept) {
  const contentContainer = document.getElementById("concept-view-content");
  if (!contentContainer) return;

  const expression = concept.expressions[lang];
  if (!expression) return;

  contentContainer.innerHTML = `
    <div class="p-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 class="font-medium text-gray-700 mb-2">단어</h4>
          <p class="text-xl font-bold">${expression.word || "N/A"}</p>
        </div>
        <div>
          <h4 class="font-medium text-gray-700 mb-2">발음</h4>
          <p class="text-lg">${expression.pronunciation || "N/A"}</p>
        </div>
        <div>
          <h4 class="font-medium text-gray-700 mb-2">정의</h4>
          <p class="text-lg">${expression.definition || "N/A"}</p>
        </div>
        <div>
          <h4 class="font-medium text-gray-700 mb-2">품사</h4>
          <p class="text-lg">${expression.part_of_speech || "N/A"}</p>
        </div>
      </div>
      <div class="mt-4">
        <h4 class="font-medium text-gray-700 mb-2">개념 정보</h4>
        <div class="flex items-center space-x-4">
          <span class="text-2xl">${concept.concept_info?.emoji || "📝"}</span>
          <span class="bg-gray-100 px-2 py-1 rounded text-sm">${
            concept.concept_info?.category || "기타"
          }</span>
          <span class="text-sm text-gray-500">${
            concept.concept_info?.domain || ""
          }</span>
        </div>
      </div>
    </div>
  `;
}

// 전역 함수로 탭 전환 기능 추가
window.showLanguageTab = function (lang, button) {
  // 모든 탭 버튼 스타일 리셋
  const allTabs = document.querySelectorAll("#concept-view-tabs button");
  allTabs.forEach((tab) => {
    tab.className = "px-4 py-2 bg-gray-200 text-gray-700 hover:bg-gray-300";
  });

  // 선택된 탭 활성화
  button.className = "px-4 py-2 bg-blue-500 text-white";

  // 내용 업데이트
  showLanguageContent(lang, currentConcept);
};

function closeModal() {
  const modal = document.getElementById("concept-view-modal");
  if (modal) {
    modal.classList.add("hidden");
  }
  resetAllState();
}

async function deleteConcept() {
  if (!currentConcept || !auth.currentUser) {
    console.error("삭제할 개념이나 사용자 정보가 없습니다.");
    return;
  }

  const primaryLang = Object.keys(currentConcept.expressions)[0];
  const word = currentConcept.expressions[primaryLang]?.word || "이 개념";

  if (!confirm(`"${word}"을(를) 정말 삭제하시겠습니까?`)) {
    return;
  }

  try {
    const conceptRef = doc(db, "concepts", currentConcept.id);
    await deleteDoc(conceptRef);

    alert("개념이 성공적으로 삭제되었습니다.");
    closeModal();

    // 페이지 새로고침
    window.location.reload();
  } catch (error) {
    console.error("개념 삭제 중 오류:", error);
    alert("개념 삭제 중 오류가 발생했습니다.");
  }
}

function editConcept() {
  if (!currentConcept) {
    console.error("편집할 개념이 없습니다.");
    return;
  }

  // 개념 편집 모달 열기 (구현 필요)
  console.log("개념 편집 기능은 아직 구현되지 않았습니다.");
  alert("개념 편집 기능은 곧 추가될 예정입니다.");
}

// 초기화
document.addEventListener("DOMContentLoaded", () => {
  setupModalEventListeners();
});
