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
  // currentConcept는 초기화하지 않음 (모달이 열려있는 동안 유지되어야 함)
  console.log("상태 초기화 완료 (currentConcept 유지)");
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
  console.log("개념 표현들:", concept.expressions);
  console.log("사용 가능한 언어들:", Object.keys(concept.expressions || {}));

  if (!concept) {
    console.error("개념 데이터가 없습니다.");
    return;
  }

  // currentConcept를 먼저 설정
  currentConcept = concept;
  console.log("currentConcept 설정됨:", currentConcept);

  const modal = document.getElementById("concept-view-modal");
  if (!modal) {
    console.error("모달 요소를 찾을 수 없습니다.");
    return;
  }

  // 기본 언어 결정 (첫 번째 사용 가능한 언어)
  const availableLanguages = Object.keys(concept.expressions || {});
  console.log("사용 가능한 언어 목록:", availableLanguages);

  if (availableLanguages.length === 0) {
    console.error("사용 가능한 언어 표현이 없습니다.");
    return;
  }

  // 기본 개념 정보 설정
  const primaryLang = availableLanguages[0];
  const primaryExpr = concept.expressions[primaryLang];

  document.getElementById("concept-emoji").textContent =
    concept.concept_info?.emoji || "📝";
  document.getElementById("concept-primary-word").textContent =
    primaryExpr?.word || "N/A";
  document.getElementById("concept-primary-pronunciation").textContent =
    primaryExpr?.pronunciation || "";
  document.getElementById("concept-category").textContent =
    concept.concept_info?.category || "기타";
  document.getElementById("concept-domain").textContent =
    concept.concept_info?.domain || "일반";

  // 업데이트 날짜 설정
  const updatedAt =
    concept.updatedAt || concept.createdAt || concept.created_at;
  if (updatedAt) {
    document.getElementById("concept-updated-at").textContent = new Date(
      updatedAt
    ).toLocaleDateString();
  }

  // 탭 생성
  const tabsContainer = document.getElementById("concept-view-tabs");
  const contentContainer = document.getElementById("concept-view-content");

  if (tabsContainer && contentContainer) {
    console.log("탭 컨테이너 찾음, 탭 생성 중...");

    // 탭 버튼들 생성
    const tabsHTML = availableLanguages
      .map((lang, index) => {
        console.log(`탭 생성: ${lang} (${getLanguageName(lang)})`);
        return `
      <button 
        class="py-2 px-4 ${
          index === 0
            ? "text-blue-600 border-b-2 border-blue-600 font-medium"
            : "text-gray-500 hover:text-gray-700"
        }"
        onclick="showLanguageTab('${lang}', this)"
      >
        ${getLanguageName(lang)}
      </button>
    `;
      })
      .join("");

    console.log("생성된 탭 HTML:", tabsHTML);
    tabsContainer.innerHTML = tabsHTML;

    // 첫 번째 언어 내용 표시
    console.log("첫 번째 언어 내용 표시:", availableLanguages[0]);
    showLanguageContent(availableLanguages[0], concept);
  } else {
    console.error("탭 컨테이너를 찾을 수 없습니다:", {
      tabsContainer,
      contentContainer,
    });
  }

  // 예문 표시
  const examplesContainer = document.getElementById("concept-view-examples");
  if (examplesContainer && concept.examples && concept.examples.length > 0) {
    examplesContainer.innerHTML = concept.examples
      .map(
        (example, index) => `
      <div class="mb-4 bg-gray-50 p-4 rounded-lg">
        <h4 class="font-medium mb-3">예문 ${index + 1}</h4>
        <div class="space-y-2">
          ${availableLanguages
            .map((lang) =>
              example[lang]
                ? `<div>
                    <p class="text-sm text-gray-500">${getLanguageName(
                      lang
                    )}</p>
                    <p class="font-medium">${example[lang]}</p>
                   </div>`
                : ""
            )
            .join("")}
        </div>
      </div>
    `
      )
      .join("");
  } else {
    if (examplesContainer) {
      examplesContainer.innerHTML =
        '<p class="text-gray-500 text-sm">예문이 없습니다.</p>';
    }
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
  console.log("언어별 내용 표시:", lang, "개념:", concept);

  const contentContainer = document.getElementById("concept-view-content");
  if (!contentContainer) {
    console.error("content container를 찾을 수 없습니다.");
    return;
  }

  const expression = concept.expressions[lang];
  if (!expression) {
    console.error(`${lang} 언어 표현이 없습니다:`, concept.expressions);
    return;
  }

  console.log(`${lang} 표현:`, expression);

  // 상단 기본 정보도 함께 업데이트
  updateBasicInfo(lang, concept);

  contentContainer.innerHTML = `
    <div class="space-y-4">
      <div>
        <h4 class="font-medium text-gray-700 mb-2">의미</h4>
        <div class="bg-gray-50 p-3 rounded">
          <p class="text-lg font-medium">${expression.word || "N/A"}</p>
          <p class="text-sm text-gray-500 mt-1">${
            expression.pronunciation || ""
          }</p>
          <p class="text-gray-700 mt-2">${expression.definition || "N/A"}</p>
        </div>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 class="font-medium text-gray-700 mb-2">품사</h4>
          <span class="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">${
            expression.part_of_speech || "N/A"
          }</span>
        </div>
        <div>
          <h4 class="font-medium text-gray-700 mb-2">수준</h4>
          <span class="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm">${
            expression.level || "N/A"
          }</span>
        </div>
      </div>
    </div>
  `;
}

// 기본 정보 업데이트 함수 추가
function updateBasicInfo(lang, concept) {
  const expression = concept.expressions[lang];
  if (!expression) return;

  // 상단 기본 정보 업데이트
  const emojiElement = document.getElementById("concept-emoji");
  const wordElement = document.getElementById("concept-primary-word");
  const pronunciationElement = document.getElementById(
    "concept-primary-pronunciation"
  );

  if (emojiElement) {
    emojiElement.textContent = concept.concept_info?.emoji || "📝";
  }

  if (wordElement) {
    wordElement.textContent = expression.word || "N/A";
  }

  if (pronunciationElement) {
    pronunciationElement.textContent = expression.pronunciation || "";
  }
}

// 전역 함수로 탭 전환 기능 추가
window.showLanguageTab = function (lang, button) {
  console.log("언어 탭 전환:", lang, "현재 개념:", currentConcept?.id);

  if (!currentConcept) {
    console.error("현재 개념이 없습니다.");
    return;
  }

  if (!currentConcept.expressions || !currentConcept.expressions[lang]) {
    console.error(`${lang} 언어 표현이 없습니다.`, currentConcept.expressions);
    return;
  }

  console.log(`${lang} 언어로 전환 중...`);

  // 모든 탭 버튼 스타일 리셋
  const allTabs = document.querySelectorAll("#concept-view-tabs button");
  allTabs.forEach((tab) => {
    tab.className = "py-2 px-4 text-gray-500 hover:text-gray-700";
  });

  // 선택된 탭 활성화
  button.className =
    "py-2 px-4 text-blue-600 border-b-2 border-blue-600 font-medium";

  // 내용 업데이트
  showLanguageContent(lang, currentConcept);

  console.log(`${lang} 언어로 전환 완료`);
};

function closeModal() {
  const modal = document.getElementById("concept-view-modal");
  if (modal) {
    modal.classList.add("hidden");
  }

  // 모달이 닫힐 때만 currentConcept 초기화
  currentConcept = null;
  console.log("모달 닫힘, currentConcept 초기화됨");
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
