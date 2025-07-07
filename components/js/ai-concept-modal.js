// AI 개념 모달 관련 함수들
import {
  getTranslatedDomainCategory,
  getTranslatedPartOfSpeech,
  getTranslatedLevel,
} from "./concept-modal-shared.js";

// 전역 변수
let currentConcept = null;
let userLanguage = "ko"; // 기본값

// 다국어 번역 시스템
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
    grammar: "문법",
    synonyms: "유의어",
    antonyms: "반의어",
    beginner: "초급",
    intermediate: "중급",
    advanced: "고급",
    basic: "기초",
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
    grammar: "Grammar",
    synonyms: "Synonyms",
    antonyms: "Antonyms",
    beginner: "Beginner",
    intermediate: "Intermediate",
    advanced: "Advanced",
    basic: "Basic",
  },
};

// 다국어 번역 시스템 가져오기 함수
function getTranslatedText(key) {
  const currentLang =
    localStorage.getItem("preferredLanguage") || userLanguage || "ko";

  // 전역 번역 시스템 사용 (language-utils.js에서 로드)
  if (
    window.translations &&
    window.translations[currentLang] &&
    window.translations[currentLang][key]
  ) {
    return window.translations[currentLang][key];
  }

  // 로컬 번역 시스템 fallback
  return pageTranslations[currentLang][key] || pageTranslations.en[key] || key;
}

// 사용자 언어 초기화
async function initializeUserLanguage() {
  try {
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

// 개념 모달 표시
export async function showConceptModal(
  concept,
  sourceLanguage = null,
  targetLanguage = null
) {
  // 사용자 언어 설정 업데이트
  try {
    await initializeUserLanguage();
  } catch (error) {
    console.error("모달 언어 초기화 실패, 기본값 사용:", error);
    userLanguage = "ko";
  }

  // 언어 설정을 전역 변수로 저장
  window.currentSourceLanguage = sourceLanguage;
  window.currentTargetLanguage = targetLanguage;

  if (!concept) {
    console.error("개념 데이터가 없습니다.");
    return;
  }

  // currentConcept 설정
  currentConcept = concept;

  const modal = document.getElementById("concept-view-modal");
  if (!modal) {
    console.error("모달 요소를 찾을 수 없습니다.");
    return;
  }

  // 사용 가능한 언어 확인
  const availableLanguages = Object.keys(concept.expressions || {});

  if (availableLanguages.length === 0) {
    console.error("사용 가능한 언어 표현이 없습니다.");
    return;
  }

  // 언어 순서 설정
  const orderedLanguages = [];

  // 1. 목표 언어 먼저 추가
  if (targetLanguage && availableLanguages.includes(targetLanguage)) {
    orderedLanguages.push(targetLanguage);
  }

  // 2. 소스 언어 추가 (목표 언어와 다른 경우)
  if (
    sourceLanguage &&
    availableLanguages.includes(sourceLanguage) &&
    sourceLanguage !== targetLanguage
  ) {
    orderedLanguages.push(sourceLanguage);
  }

  // 3. 나머지 언어들 추가
  availableLanguages.forEach((lang) => {
    if (!orderedLanguages.includes(lang)) {
      orderedLanguages.push(lang);
    }
  });

  // 기본 개념 정보 설정 - 첫 번째 언어 사용
  const primaryLang = orderedLanguages[0];
  const primaryExpr = concept.expressions[primaryLang];

  // 이모지 설정
  const emoji = concept.concept_info?.emoji || concept.unicode_emoji || "📝";
  const emojiElement = document.getElementById("concept-view-emoji");
  if (emojiElement) {
    emojiElement.textContent = emoji;
  }

  // 제목 설정
  const primaryWordElement = document.getElementById("concept-view-title");
  if (primaryWordElement) {
    primaryWordElement.textContent = primaryExpr?.word || "N/A";
  }

  // 발음 설정
  const primaryPronElement = document.getElementById(
    "concept-view-pronunciation"
  );
  if (primaryPronElement) {
    primaryPronElement.textContent = primaryExpr?.pronunciation || "";
  }

  // 카테고리와 도메인 표시
  const categoryDomainElement = document.getElementById(
    "concept-category-domain"
  );
  if (categoryDomainElement) {
    const categoryKey =
      concept.concept_info?.category || concept.category || "general";
    const domainKey =
      concept.concept_info?.domain || concept.domain || "general";

    const currentLang =
      localStorage.getItem("preferredLanguage") || userLanguage || "ko";
    const translatedDomainCategory = getTranslatedDomainCategory(
      domainKey,
      categoryKey,
      currentLang
    );

    categoryDomainElement.textContent = translatedDomainCategory;
  }

  // 업데이트 날짜 설정
  const updatedAt =
    concept.updatedAt || concept.createdAt || concept.created_at;
  if (updatedAt) {
    let formattedDate = "";
    try {
      let date;
      if (updatedAt.toDate && typeof updatedAt.toDate === "function") {
        date = updatedAt.toDate();
      } else if (updatedAt.seconds) {
        date = new Date(updatedAt.seconds * 1000);
      } else {
        date = new Date(updatedAt);
      }

      if (date && !isNaN(date.getTime())) {
        formattedDate = date.toLocaleDateString("ko-KR", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        });
      }
    } catch (error) {
      console.error("날짜 포맷 오류:", error);
      formattedDate = "";
    }

    const updatedAtElement = document.getElementById("concept-updated-at");
    if (updatedAtElement) {
      updatedAtElement.textContent = formattedDate || "날짜 정보 없음";
    }
  }

  // 탭 시스템 생성
  const tabsContainer = document.getElementById("language-tabs");
  const contentContainer = document.getElementById("language-content");

  if (tabsContainer && contentContainer) {
    // 탭 버튼들 생성
    const tabsHTML = orderedLanguages
      .map((lang, index) => {
        const isActive = index === 0;
        const languageName = getLanguageName(lang);
        return `
          <button 
            onclick="window.showLanguageTab('${lang}', this)"
            class="${
              isActive
                ? "py-2 px-4 text-blue-600 border-b-2 border-blue-600 font-medium"
                : "py-2 px-4 text-gray-500 hover:text-gray-700"
            }"
          >
            ${languageName}
          </button>
        `;
      })
      .join("");

    tabsContainer.innerHTML = tabsHTML;

    // 첫 번째 언어 내용 표시
    showLanguageContent(orderedLanguages[0], concept);
  }

  // 모달 표시
  modal.classList.remove("hidden");
  setupModalEventListeners();

  console.log("✅ AI 개념 모달 표시 완료");
}

// 언어 이름 가져오기
function getLanguageName(langCode) {
  const languageNames = {
    ko: {
      korean: "한국어",
      english: "영어",
      japanese: "일본어",
      chinese: "중국어",
    },
    en: {
      korean: "Korean",
      english: "English",
      japanese: "Japanese",
      chinese: "Chinese",
    },
  };

  const currentLang = userLanguage || "ko";
  return languageNames[currentLang]?.[langCode] || langCode;
}

// 언어별 내용 표시
function showLanguageContent(lang, concept) {
  const contentContainer = document.getElementById("language-content");
  if (!contentContainer) {
    console.error("language-content container를 찾을 수 없습니다.");
    return;
  }

  const expression = concept.expressions[lang];
  if (!expression) {
    console.error(`${lang} 언어 표현이 없습니다:`, concept.expressions);
    return;
  }

  // 기본 정보 업데이트
  const wordElement = document.getElementById("concept-view-title");
  const pronunciationElement = document.getElementById(
    "concept-view-pronunciation"
  );

  if (wordElement) {
    wordElement.textContent = expression.word || "N/A";
  }

  if (pronunciationElement) {
    pronunciationElement.textContent = expression.pronunciation || "";
  }

  // 상세 내용 생성
  const contentHTML = `
    <div class="space-y-4">
      <div class="flex items-center gap-2 mb-1">
        <p class="text-lg font-medium">${expression.word || "N/A"}</p>
        ${
          expression.pronunciation
            ? `<span class="text-gray-500">[${expression.pronunciation}]</span>`
            : ""
        }
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 class="font-medium text-gray-700 mb-2">${getTranslatedText(
            "meaning"
          )}</h4>
          <p class="text-gray-600">${expression.meaning || "N/A"}</p>
        </div>
        
        <div>
          <h4 class="font-medium text-gray-700 mb-2">${getTranslatedText(
            "part_of_speech"
          )}</h4>
          <p class="text-gray-600">${expression.part_of_speech || "N/A"}</p>
        </div>
      </div>

      ${
        expression.synonyms && expression.synonyms.length > 0
          ? `
        <div>
          <h4 class="font-medium text-gray-700 mb-2">${getTranslatedText(
            "synonyms"
          )}</h4>
          <div class="flex flex-wrap gap-1">
            ${expression.synonyms
              .map(
                (syn) =>
                  `<span class="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">${syn}</span>`
              )
              .join("")}
          </div>
        </div>
      `
          : ""
      }

      ${
        expression.antonyms && expression.antonyms.length > 0
          ? `
        <div>
          <h4 class="font-medium text-gray-700 mb-2">${getTranslatedText(
            "antonyms"
          )}</h4>
          <div class="flex flex-wrap gap-1">
            ${expression.antonyms
              .map(
                (ant) =>
                  `<span class="bg-red-100 text-red-800 px-2 py-1 rounded text-sm">${ant}</span>`
              )
              .join("")}
          </div>
        </div>
      `
          : ""
      }
    </div>
  `;

  contentContainer.innerHTML = contentHTML;
}

// 모달 이벤트 리스너 설정
function setupModalEventListeners() {
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

  // 모달 외부 클릭시 닫기
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });
  }
}

// 전역 함수로 언어 탭 전환 기능 노출
window.showLanguageTab = function (lang, button) {
  console.log("언어 탭 전환:", lang);

  if (!currentConcept) {
    console.error("현재 개념이 없습니다.");
    return;
  }

  // 모든 탭 버튼 비활성화
  const allTabs = document.querySelectorAll("#language-tabs button");
  allTabs.forEach((tab) => {
    tab.className = "py-2 px-4 text-gray-500 hover:text-gray-700";
  });

  // 선택된 탭 활성화
  button.className =
    "py-2 px-4 text-blue-600 border-b-2 border-blue-600 font-medium";

  // 내용 업데이트
  showLanguageContent(lang, currentConcept);
};

// 모달 닫기
function closeModal() {
  const modal = document.getElementById("concept-view-modal");
  if (modal) {
    modal.classList.add("hidden");
  }

  // currentConcept 초기화
  currentConcept = null;
  console.log("모달 닫힘, currentConcept 초기화됨");
}

// 개념 편집
function editConcept() {
  if (!currentConcept) {
    console.error("편집할 개념이 없습니다.");
    return;
  }

  const conceptId = currentConcept.id || currentConcept._id;
  if (!conceptId) {
    console.error("개념 ID를 찾을 수 없습니다.");
    alert("편집할 개념의 ID를 찾을 수 없습니다.");
    return;
  }

  console.log("AI 개념 편집 모달 열기:", conceptId);

  // 현재 보기 모달 닫기
  closeModal();

  // 편집 모달 열기
  if (
    window.openAIEditConceptModal &&
    typeof window.openAIEditConceptModal === "function"
  ) {
    window.openAIEditConceptModal(conceptId);
  } else {
    console.error("AI 편집 모달 함수를 찾을 수 없습니다.");
    alert(
      "편집 기능을 불러올 수 없습니다. 페이지를 새로고침 후 다시 시도해주세요."
    );
  }
}

// 개념 삭제
async function deleteConcept() {
  if (!currentConcept) {
    console.error("삭제할 개념이 없습니다.");
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
      currentConcept.isAIGenerated || currentConcept.ai_generated;

    if (isAIConcept) {
      console.log("AI 개념 삭제 시도...");
      // AI 개념 삭제 로직 (추후 구현)
      alert("AI 개념 삭제 기능은 아직 구현되지 않았습니다.");
    } else {
      console.log("일반 개념 삭제 시도...");
      // 일반 개념 삭제 로직 (추후 구현)
      alert("일반 개념 삭제 기능은 아직 구현되지 않았습니다.");
    }

    closeModal();
  } catch (error) {
    console.error("개념 삭제 중 오류:", error);
    alert("개념 삭제 중 오류가 발생했습니다: " + error.message);
  }
}

// 초기화
document.addEventListener("DOMContentLoaded", () => {
  setupModalEventListeners();
});

console.log("📦 ai-concept-modal.js 로드 완료");
