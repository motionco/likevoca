import {
  auth,
  db,
  supportedLanguages,
  conceptUtils,
} from "../../js/firebase/firebase-init.js";
import { getActiveLanguage } from "../../utils/language-utils.js";
import {
  deleteDoc,
  doc,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

// 전역 변수
let currentConcept = null;
let userLanguage = "ko"; // 기본값

// 다국어 번역 텍스트
const pageTranslations = {
  ko: {
    concept_detail_view: "개념 상세 보기",
    meaning: "의미",
    part_of_speech: "품사",
    level: "수준",
    examples: "예문",
    last_updated: "마지막 업데이트",
    edit: "편집",
    delete: "삭제",
    close: "닫기",
    no_examples: "예문이 없습니다.",
    category: "카테고리",
    domain: "도메인",
  },
  en: {
    concept_detail_view: "Concept Detail View",
    meaning: "Meaning",
    part_of_speech: "Part of Speech",
    level: "Level",
    examples: "Examples",
    last_updated: "Last Updated",
    edit: "Edit",
    delete: "Delete",
    close: "Close",
    no_examples: "No examples available.",
    category: "Category",
    domain: "Domain",
  },
  ja: {
    concept_detail_view: "概念詳細表示",
    meaning: "意味",
    part_of_speech: "品詞",
    level: "レベル",
    examples: "例文",
    last_updated: "最終更新",
    edit: "編集",
    delete: "削除",
    close: "閉じる",
    no_examples: "例文がありません。",
    category: "カテゴリ",
    domain: "ドメイン",
  },
  zh: {
    concept_detail_view: "概念详细视图",
    meaning: "意思",
    part_of_speech: "词性",
    level: "级别",
    examples: "例句",
    last_updated: "最后更新",
    edit: "编辑",
    delete: "删除",
    close: "关闭",
    no_examples: "没有例句。",
    category: "类别",
    domain: "领域",
  },
};

// 다국어 번역 텍스트 가져오기 함수
function getTranslatedText(key) {
  return pageTranslations[userLanguage][key] || pageTranslations.en[key];
}

// 사용자 언어 초기화
async function initializeUserLanguage() {
  try {
    // getActiveLanguage가 정의되어 있는지 확인
    if (typeof getActiveLanguage === "function") {
      userLanguage = await getActiveLanguage();
    } else {
      console.warn(
        "getActiveLanguage 함수를 찾을 수 없습니다. 기본값을 사용합니다."
      );
      userLanguage = "ko";
    }
  } catch (error) {
    console.error("언어 설정 로드 실패:", error);
    userLanguage = "ko"; // 기본값
  }
}

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
export async function showConceptModal(
  concept,
  sourceLanguage = null,
  targetLanguage = null
) {
  // 사용자 언어 설정 업데이트 (실패해도 계속 진행)
  try {
    await initializeUserLanguage();
  } catch (error) {
    console.error("모달 언어 초기화 실패, 기본값 사용:", error);
    userLanguage = "ko";
  }

  console.log("개념 모달 열기:", concept);
  console.log("개념 표현들:", concept.expressions);
  console.log("사용 가능한 언어들:", Object.keys(concept.expressions || {}));
  console.log("전달받은 언어 설정:", { sourceLanguage, targetLanguage });

  // 언어 설정을 전역 변수로 저장
  window.currentSourceLanguage = sourceLanguage;
  window.currentTargetLanguage = targetLanguage;

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

  // 언어 탭 순서 재정렬: 원본언어, 대상언어, 나머지 언어 순
  const availableLanguages = Object.keys(concept.expressions || {});
  console.log("사용 가능한 언어 목록:", availableLanguages);

  if (availableLanguages.length === 0) {
    console.error("사용 가능한 언어 표현이 없습니다.");
    return;
  }

  // 언어 탭 순서 재정렬
  const orderedLanguages = [];

  // 1. 원본언어 먼저 추가 (있는 경우)
  if (sourceLanguage && availableLanguages.includes(sourceLanguage)) {
    orderedLanguages.push(sourceLanguage);
  }

  // 2. 대상언어 추가 (있고, 원본언어와 다른 경우)
  if (
    targetLanguage &&
    availableLanguages.includes(targetLanguage) &&
    targetLanguage !== sourceLanguage
  ) {
    orderedLanguages.push(targetLanguage);
  }

  // 3. 나머지 언어들 추가
  availableLanguages.forEach((lang) => {
    if (!orderedLanguages.includes(lang)) {
      orderedLanguages.push(lang);
    }
  });

  console.log("재정렬된 언어 순서:", orderedLanguages);

  // 기본 개념 정보 설정 - 대상언어 우선, 없으면 첫 번째 언어 사용
  const primaryLang =
    targetLanguage && availableLanguages.includes(targetLanguage)
      ? targetLanguage
      : orderedLanguages[0];
  const primaryExpr = concept.expressions[primaryLang];

  console.log("기본 언어 설정:", primaryLang, "표현:", primaryExpr);

  document.getElementById("concept-view-emoji").textContent =
    concept.concept_info?.emoji || "📝";
  document.getElementById("concept-primary-word").textContent =
    primaryExpr?.word || "N/A";
  document.getElementById("concept-primary-pronunciation").textContent =
    primaryExpr?.pronunciation || "";
  document.getElementById("concept-category").textContent =
    concept.concept_info?.category || getTranslatedText("category");
  document.getElementById("concept-domain").textContent =
    concept.concept_info?.domain || getTranslatedText("domain");

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

    // 탭 버튼들 생성 (재정렬된 순서 사용)
    const tabsHTML = orderedLanguages
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

    // 첫 번째 언어 내용 표시 (재정렬된 순서의 첫 번째)
    console.log("첫 번째 언어 내용 표시:", orderedLanguages[0]);
    showLanguageContent(orderedLanguages[0], concept);
  } else {
    console.error("탭 컨테이너를 찾을 수 없습니다:", {
      tabsContainer,
      contentContainer,
    });
  }

  // 예문 표시 (개선된 버전)
  displayExamples(concept, orderedLanguages[0], sourceLanguage, targetLanguage);

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
        <h4 class="font-medium text-gray-700 mb-2">${getTranslatedText(
          "meaning"
        )}</h4>
        <div class="bg-gray-50 p-3 rounded">
          <div class="flex items-center gap-2 mb-1">
            <p class="text-lg font-medium">${expression.word || "N/A"}</p>
            <span class="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">${
              expression.part_of_speech || "N/A"
            }</span>
          </div>
          <p class="text-sm text-gray-500 mt-1">${
            expression.pronunciation || ""
          }</p>
          <p class="text-gray-700 mt-2">${expression.definition || "N/A"}</p>
        </div>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-1 gap-4">
        <div>
          <h4 class="font-medium text-gray-700 mb-2">${getTranslatedText(
            "level"
          )}</h4>
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
  // 대상언어 정보로 고정 (전달받은 언어가 아닌 targetLanguage 사용)
  const targetLanguage = window.currentTargetLanguage;
  const fixedLang =
    targetLanguage && concept.expressions[targetLanguage]
      ? targetLanguage
      : lang; // 대상언어가 없으면 현재 언어 사용

  const expression = concept.expressions[fixedLang];
  if (!expression) return;

  // 상단 기본 정보 업데이트 (항상 대상언어로)
  const emojiElement = document.getElementById("concept-view-emoji");
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

  // 예문 업데이트 (현재 언어 설정을 유지)
  const sourceLanguage = window.currentSourceLanguage || null;
  const targetLanguage = window.currentTargetLanguage || null;
  displayExamples(currentConcept, lang, sourceLanguage, targetLanguage);

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
    console.log("삭제할 개념:", currentConcept);

    // AI 개념인지 일반 개념인지 판단
    const isAIConcept =
      currentConcept.isAIGenerated ||
      currentConcept._id?.startsWith("ai_") ||
      window.location.pathname.includes("ai-vocabulary");

    if (isAIConcept) {
      console.log("AI 개념 삭제 시도...");
      // AI 개념 삭제
      const success = await conceptUtils.deleteAIConcept(
        auth.currentUser.email,
        currentConcept._id || currentConcept.id
      );

      if (success) {
        console.log("AI 개념 삭제 성공");
        alert("개념이 성공적으로 삭제되었습니다.");
      } else {
        throw new Error("AI 개념 삭제에 실패했습니다.");
      }
    } else {
      console.log("일반 개념 삭제 시도...");
      // 일반 개념 삭제
      await conceptUtils.deleteConcept(currentConcept.id || currentConcept._id);
      console.log("일반 개념 삭제 성공");
      alert("개념이 성공적으로 삭제되었습니다.");
    }

    closeModal();

    // 페이지 새로고침
    window.location.reload();
  } catch (error) {
    console.error("개념 삭제 중 오류:", error);
    alert("개념 삭제 중 오류가 발생했습니다: " + error.message);
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

// 언어 변경 이벤트 리스너 추가
document.addEventListener("languageChanged", async (event) => {
  try {
    await initializeUserLanguage();
  } catch (error) {
    console.error("모달 언어 변경 실패:", error);
    userLanguage = "ko";
  }

  // 현재 모달이 열려있다면 새로운 언어로 업데이트
  if (
    currentConcept &&
    !document.getElementById("concept-view-modal").classList.contains("hidden")
  ) {
    const currentTab = document.querySelector(
      "#concept-view-tabs button.text-blue-600"
    );
    if (currentTab) {
      const lang = currentTab.getAttribute("onclick").match(/'([^']+)'/)[1];
      showLanguageContent(lang, currentConcept);
    }
  }
});

// 초기화
document.addEventListener("DOMContentLoaded", () => {
  setupModalEventListeners();
});

// 개선된 예문 표시 함수
function displayExamples(
  concept,
  currentLang,
  sourceLanguage = null,
  targetLanguage = null
) {
  const examplesContainer = document.getElementById("concept-view-examples");

  if (!examplesContainer) return;

  examplesContainer.innerHTML = "";

  let hasExamples = false;

  // 새로운 구조 (featured_examples) 확인 - AI 개념용
  if (concept.featured_examples && concept.featured_examples.length > 0) {
    console.log("AI 개념의 featured_examples 발견:", concept.featured_examples);

    concept.featured_examples.forEach((example, index) => {
      if (example.translations) {
        const exampleDiv = document.createElement("div");
        exampleDiv.className = "border p-4 rounded mb-4 bg-gray-50";

        let exampleContent = "";
        const languagesToShow = [];

        // 1. 대상언어 먼저 추가 (있는 경우)
        if (targetLanguage && example.translations[targetLanguage]) {
          languagesToShow.push({
            code: targetLanguage,
            name: getLanguageName(targetLanguage),
            text: example.translations[targetLanguage].text,
            grammarNotes: example.translations[targetLanguage].grammar_notes,
            label: "(대상)",
          });
        }

        // 2. 원본언어 추가 (있고, 대상언어와 다른 경우)
        if (
          sourceLanguage &&
          example.translations[sourceLanguage] &&
          sourceLanguage !== targetLanguage
        ) {
          languagesToShow.push({
            code: sourceLanguage,
            name: getLanguageName(sourceLanguage),
            text: example.translations[sourceLanguage].text,
            grammarNotes: example.translations[sourceLanguage].grammar_notes,
            label: "(원본)",
          });
        }

        // 3. 현재 탭 언어 추가 (위에 추가되지 않은 경우만)
        if (
          example.translations[currentLang] &&
          !languagesToShow.find((lang) => lang.code === currentLang)
        ) {
          languagesToShow.push({
            code: currentLang,
            name: getLanguageName(currentLang),
            text: example.translations[currentLang].text,
            grammarNotes: example.translations[currentLang].grammar_notes,
            label: "",
          });
        }

        // 추가 언어들도 표시 (모든 언어 포함)
        Object.keys(example.translations).forEach((langCode) => {
          if (!languagesToShow.find((lang) => lang.code === langCode)) {
            languagesToShow.push({
              code: langCode,
              name: getLanguageName(langCode),
              text: example.translations[langCode].text,
              grammarNotes: example.translations[langCode].grammar_notes,
              label: "",
            });
          }
        });

        // 언어들을 순서대로 표시
        languagesToShow.forEach((lang, index) => {
          const isFirst = index === 0;
          exampleContent += `
            <div class="${
              isFirst ? "mb-3" : "mb-2 pl-4 border-l-2 border-gray-300"
            }">
              <span class="text-sm ${
                isFirst ? "font-medium text-blue-600" : "text-gray-600"
              }">${lang.name}${lang.label}:</span>
              <p class="ml-2 ${
                isFirst ? "font-medium text-gray-800" : "text-gray-700"
              }">${lang.text}</p>
              ${
                lang.grammarNotes
                  ? `<p class="ml-2 text-xs text-gray-500 italic">${lang.grammarNotes}</p>`
                  : ""
              }
            </div>
          `;
        });

        // 예문 컨텍스트와 이모지 표시
        if (example.context || example.unicode_emoji) {
          exampleContent =
            `
            <div class="mb-2 text-sm text-gray-600">
              ${
                example.unicode_emoji
                  ? `<span class="mr-2">${example.unicode_emoji}</span>`
                  : ""
              }
              ${
                example.context
                  ? `<span class="italic">컨텍스트: ${example.context}</span>`
                  : ""
              }
            </div>
          ` + exampleContent;
        }

        exampleDiv.innerHTML = exampleContent;
        examplesContainer.appendChild(exampleDiv);
        hasExamples = true;
      }
    });
  }

  // 기존 구조 (examples) 확인 - 일반 개념용
  else if (concept.examples && concept.examples.length > 0) {
    console.log("일반 개념의 examples 발견:", concept.examples);

    const filteredExamples = concept.examples.filter(
      (example) => example[currentLang]
    );

    if (filteredExamples.length > 0) {
      filteredExamples.forEach((example, index) => {
        const exampleDiv = document.createElement("div");
        exampleDiv.className = "border p-4 rounded mb-4 bg-gray-50";

        let exampleContent = "";

        // 대상언어 → 원본언어 순서로 표시 (현재 탭 언어와 관계없이)
        const languagesToShow = [];

        // 1. 대상언어 먼저 추가 (있는 경우)
        if (targetLanguage && example[targetLanguage]) {
          languagesToShow.push({
            code: targetLanguage,
            name: getLanguageName(targetLanguage),
            text: example[targetLanguage],
            label: "(대상)",
          });
        }

        // 2. 원본언어 추가 (있고, 대상언어와 다른 경우)
        if (
          sourceLanguage &&
          example[sourceLanguage] &&
          sourceLanguage !== targetLanguage
        ) {
          languagesToShow.push({
            code: sourceLanguage,
            name: getLanguageName(sourceLanguage),
            text: example[sourceLanguage],
            label: "(원본)",
          });
        }

        // 3. 현재 탭 언어 추가 (위에 추가되지 않은 경우만)
        if (
          example[currentLang] &&
          !languagesToShow.find((lang) => lang.code === currentLang)
        ) {
          languagesToShow.push({
            code: currentLang,
            name: getLanguageName(currentLang),
            text: example[currentLang],
            label: "",
          });
        }

        // 언어들을 순서대로 표시
        languagesToShow.forEach((lang, index) => {
          const isFirst = index === 0;
          exampleContent += `
            <div class="${
              isFirst ? "mb-3" : "mb-2 pl-4 border-l-2 border-gray-300"
            }">
              <span class="text-sm ${
                isFirst ? "font-medium text-blue-600" : "text-gray-600"
              }">${lang.name}${lang.label}:</span>
              <p class="ml-2 ${
                isFirst ? "font-medium text-gray-800" : "text-gray-700"
              }">${lang.text}</p>
            </div>
          `;
        });

        exampleDiv.innerHTML = exampleContent;
        examplesContainer.appendChild(exampleDiv);
        hasExamples = true;
      });
    }
  }

  // 예문이 없는 경우
  if (!hasExamples) {
    examplesContainer.innerHTML = `<p class="text-gray-500 text-sm">${getTranslatedText(
      "no_examples"
    )}</p>`;
  }
}
