// concept-view-modal.js - 일반 단어장 보기 모달 (AI 단어장과 동일한 구조)
import {
  auth,
  db,
  conceptUtils,
  supportedLanguages,
} from "../../js/firebase/firebase-init.js";
import { getActiveLanguage } from "../../utils/language-utils.js";
import { getTranslatedDomainCategory } from "./concept-modal-shared.js";

let currentConcept = null;
let userLanguage = "ko";

// 다국어 번역 텍스트
const pageTranslations = {
  ko: {
    meaning: "의미",
    examples: "예문",
    grammar: "문법",
    no_examples: "예문이 없습니다",
    registration_time: "등록 시간",
    confirm_delete_concept: "정말 삭제하시겠습니까?",
    concept_deleted_success: "개념이 성공적으로 삭제되었습니다.",
    concept_delete_error: "개념 삭제 중 오류가 발생했습니다",
  },
  en: {
    meaning: "Meaning",
    examples: "Examples",
    grammar: "Grammar",
    no_examples: "No examples available",
    registration_time: "Registration time",
    confirm_delete_concept: "Are you sure you want to delete this?",
    concept_deleted_success: "Concept deleted successfully.",
    concept_delete_error: "Error occurred while deleting concept",
  },
  ja: {
    meaning: "意味",
    examples: "例文",
    grammar: "文法",
    no_examples: "例文がありません",
    registration_time: "登録時間",
    confirm_delete_concept: "本当に削除しますか？",
    concept_deleted_success: "概念が正常に削除されました。",
    concept_delete_error: "概念の削除中にエラーが発生しました",
  },
  zh: {
    meaning: "意思",
    examples: "例句",
    grammar: "语法",
    no_examples: "没有例句",
    registration_time: "注册时间",
    confirm_delete_concept: "确定要删除吗？",
    concept_deleted_success: "概念删除成功。",
    concept_delete_error: "删除概念时发生错误",
  },
};

// 다국어 번역 텍스트 가져오기
function getTranslatedText(key) {
  const currentLang = userLanguage || "ko";
  // 페이지별 번역 우선
  if (pageTranslations[currentLang] && pageTranslations[currentLang][key]) {
    return pageTranslations[currentLang][key];
  }
  // 공통 번역 사용
  return (
    window.translations?.[currentLang]?.[key] ||
    pageTranslations.en?.[key] ||
    key
  );
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
    userLanguage = "ko";
  }
}

// 개념 보기 모달 표시 함수
export async function showConceptViewModal(
  conceptData,
  sourceLanguage = null,
  targetLanguage = null
) {
  console.log("🔍 개념 보기 모달 표시:", conceptData);

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

  if (!conceptData) {
    console.error("개념 데이터가 없습니다.");
    return;
  }

  // currentConcept를 먼저 설정
  currentConcept = conceptData;

  const modal = document.getElementById("concept-view-modal");
  if (!modal) {
    console.error("모달 요소를 찾을 수 없습니다.");
    return;
  }

  console.log("📝 모달 내용 채우기 시작");
  console.log("📊 개념 데이터:", conceptData);

  // 사용 가능한 언어 확인
  const availableLanguages = Object.keys(conceptData.expressions || {});
  console.log("📋 사용 가능한 언어:", availableLanguages);

  if (availableLanguages.length === 0) {
    console.error("사용 가능한 언어 표현이 없습니다.");
    return;
  }

  // 언어 탭 순서 재정렬: 원본언어 → 대상언어 → 나머지 순서
  const orderedLanguages = [];

  // 1. 원본언어 먼저 추가
  if (sourceLanguage && availableLanguages.includes(sourceLanguage)) {
    orderedLanguages.push(sourceLanguage);
  }

  // 2. 대상언어 추가 (원본언어와 다른 경우)
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

  // 기본 개념 정보 설정 - 대상언어 우선, 없으면 첫 번째 언어 사용
  const primaryLang =
    targetLanguage && availableLanguages.includes(targetLanguage)
      ? targetLanguage
      : orderedLanguages[0];
  const primaryExpr = conceptData.expressions[primaryLang];

  // 이모지 설정 (AI 단어장과 동일한 로직)
  const emoji =
    conceptData.concept_info?.emoji ||
    conceptData.unicode_emoji ||
    conceptData.concept_info?.unicode_emoji ||
    "📝";

  console.log("🎨 이모지 설정:", emoji);

  const emojiElement = document.getElementById("concept-view-emoji");
  if (emojiElement) {
    emojiElement.textContent = emoji;
  } else {
    console.warn("concept-view-emoji 요소를 찾을 수 없습니다.");
  }

  // 제목 설정
  const titleElement = document.getElementById("concept-view-title");
  if (titleElement) {
    titleElement.textContent = primaryExpr?.word || "N/A";
    console.log("📝 제목 설정:", primaryExpr?.word || "N/A");
  } else {
    console.warn("concept-view-title 요소를 찾을 수 없습니다.");
  }

  // 발음 설정
  const pronunciationElement = document.getElementById(
    "concept-view-pronunciation"
  );
  if (pronunciationElement) {
    pronunciationElement.textContent = primaryExpr?.pronunciation || "";
    console.log("🔊 발음 설정:", primaryExpr?.pronunciation || "");
  } else {
    console.warn("concept-view-pronunciation 요소를 찾을 수 없습니다.");
  }

  // 도메인/카테고리 설정 (AI 단어장과 동일한 로직)
  const categoryDomainElement = document.getElementById(
    "concept-view-domain-category"
  );
  if (categoryDomainElement) {
    const categoryKey =
      conceptData.concept_info?.category || conceptData.category || "general";
    const domainKey =
      conceptData.concept_info?.domain || conceptData.domain || "general";

    console.log("🏷️ 도메인/카테고리 정보:", {
      domainKey,
      categoryKey,
      conceptData,
    });

    // 공통 번역 시스템 사용
    const currentLang =
      localStorage.getItem("preferredLanguage") || userLanguage || "ko";
    const translatedDomainCategory = getTranslatedDomainCategory(
      domainKey,
      categoryKey,
      currentLang
    );

    console.log("🌐 번역된 도메인/카테고리:", translatedDomainCategory);

    categoryDomainElement.textContent = translatedDomainCategory;
  } else {
    console.warn("❌ concept-view-domain-category 요소를 찾을 수 없습니다");
  }

  // 업데이트 날짜 설정
  const updatedAt =
    conceptData.updated_at ||
    conceptData.created_at ||
    conceptData.updatedAt ||
    conceptData.createdAt;
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

      if (!isNaN(date.getTime())) {
        formattedDate = date.toLocaleDateString("ko-KR", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        });
      }
    } catch (error) {
      console.error("날짜 포맷팅 오류:", error);
      formattedDate = "";
    }

    const updatedAtElement = document.getElementById("concept-updated-at");
    if (updatedAtElement) {
      updatedAtElement.textContent = formattedDate || "날짜 정보 없음";
    }
  }

  // 탭 생성 (AI 단어장과 동일한 로직)
  const tabsContainer = document.getElementById("language-tabs");
  const contentContainer = document.getElementById("language-content");

  if (tabsContainer && contentContainer) {
    // 탭 버튼들 생성
    const tabsHTML = orderedLanguages
      .map((lang, index) => {
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

    tabsContainer.innerHTML = `<div class="flex space-x-8">${tabsHTML}</div>`;

    // 첫 번째 언어 탭 내용 표시
    showLanguageContent(orderedLanguages[0], conceptData);
  }

  // 예문 표시 (AI 단어장과 동일한 로직)
  displayExamples(
    conceptData,
    orderedLanguages[0],
    sourceLanguage,
    targetLanguage
  );

  // 모달 버튼 설정
  setupModalButtons(conceptData);

  // 모달 표시
  modal.classList.remove("hidden");

  // 번역 적용 - 기존 번역 시스템 사용
  try {
    // 전역 번역 함수가 있다면 사용
    if (typeof window.applyTranslations === "function") {
      await window.applyTranslations();
    }
  } catch (error) {
    console.error("번역 적용 실패:", error);
  }
}

// 언어 이름 가져오기 함수 (AI 단어장과 동일)
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
    ja: {
      korean: "韓国語",
      english: "英語",
      japanese: "日本語",
      chinese: "中国語",
    },
    zh: {
      korean: "韩语",
      english: "英语",
      japanese: "日语",
      chinese: "中文",
    },
  };

  const currentLang = userLanguage || "ko";
  return languageNames[currentLang]?.[langCode] || langCode;
}

// 언어 탭 내용 표시 함수 (AI 단어장과 동일한 구조)
function showLanguageContent(lang, concept) {
  console.log("🔄", lang, "언어 내용 표시:", concept.expressions[lang]);

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

  // 상단 기본 정보를 현재 언어 탭에 맞게 업데이트
  updateModalHeader(lang, concept);

  // 의미값은 대상 언어로 고정
  const targetLanguage = window.currentTargetLanguage;
  const targetExpression =
    targetLanguage && concept.expressions[targetLanguage]
      ? concept.expressions[targetLanguage]
      : expression;

  // 기본 정보 섹션 (품사를 박스로 표시, 의미는 대상 언어로 고정)
  let basicInfoHtml = `
    <div class="bg-gray-50 rounded-lg p-4 mb-4">
      <div class="grid grid-cols-1 gap-4">
        <div>
          <p class="text-lg font-semibold text-gray-800">
            ${expression.word || "N/A"}
            ${
              expression.part_of_speech || expression.pos
                ? `<span class="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs ml-2">${
                    expression.part_of_speech || expression.pos
                  }</span>`
                : ""
            }
          </p>
        </div>
        <div>
          <label class="text-sm font-medium text-gray-600">${getTranslatedText(
            "meaning"
          )}</label>
          <p class="text-gray-800">${
            targetExpression.definition || targetExpression.meaning || ""
          }</p>
        </div>
      </div>
    </div>
  `;

  // 문법 태그 포맷팅
  let grammarTagsHtml = "";
  if (expression.grammar_tags && expression.grammar_tags.length > 0) {
    const pos = expression.grammar_tags.find((tag) => !tag.includes(":"));
    const features = expression.grammar_tags.filter((tag) => tag.includes(":"));
    const formatted = formatGrammarTags(lang, pos, features);

    grammarTagsHtml = `
      <div class="mb-4">
        <label class="text-sm font-medium text-gray-600 block mb-2">${getTranslatedText(
          "grammar"
        )}</label>
        <div class="flex flex-wrap gap-2">${formatted}</div>
      </div>
    `;
  }

  // 관련 단어들 표시 (번역된 레이블 사용)
  let relatedWordsHtml = "";
  if (
    expression.related_words ||
    expression.synonyms ||
    expression.antonyms ||
    expression.collocations ||
    expression.compound_words ||
    expression.word_family
  ) {
    let relatedSections = [];

    // 기존 related_words 구조 처리
    if (expression.related_words) {
      const relatedWords = expression.related_words;
      Object.entries(relatedWords).forEach(([type, words]) => {
        if (words && words.length > 0) {
          const typeTranslation = getTranslatedText(type) || type;
          relatedSections.push(`
            <div class="mb-3">
              <label class="text-sm font-medium text-gray-600 block mb-1">${typeTranslation}</label>
              <div class="flex flex-wrap gap-1">
                ${words
                  .map(
                    (word) =>
                      `<span class="text-sm bg-gray-100 text-gray-700 px-2 py-1 rounded">${word}</span>`
                  )
                  .join("")}
              </div>
            </div>
          `);
        }
      });
    }

    // 개별 필드들 처리 (환경 언어로 번역된 레이블 사용, 다양한 색상 적용)
    const currentLang = userLanguage || "ko";
    const relatedFields = [
      {
        key: "synonyms",
        label: getTranslatedText("synonyms") || "유의어",
        color: "green",
      },
      {
        key: "antonyms",
        label: getTranslatedText("antonyms") || "반의어",
        color: "red",
      },
      {
        key: "collocations",
        label: getTranslatedText("collocations") || "연어",
        color: "blue",
      },
      {
        key: "compound_words",
        label: getTranslatedText("compound_words") || "복합어",
        color: "purple",
      },
      {
        key: "word_family",
        label: getTranslatedText("word_family") || "어족",
        color: "yellow",
      },
    ];

    relatedFields.forEach((field) => {
      const words = expression[field.key];
      if (words && words.length > 0) {
        relatedSections.push(`
          <div class="mb-3">
            <label class="text-sm font-medium text-${
              field.color
            }-700 block mb-1">${field.label}</label>
            <div class="flex flex-wrap gap-1">
              ${words
                .map(
                  (word) =>
                    `<span class="text-sm bg-${field.color}-100 text-${field.color}-800 px-2 py-1 rounded">${word}</span>`
                )
                .join("")}
            </div>
          </div>
        `);
      }
    });

    if (relatedSections.length > 0) {
      relatedWordsHtml = `
        <div class="bg-blue-50 rounded-lg p-4">
          <h4 class="text-lg font-semibold text-gray-800 mb-3">${
            getTranslatedText("related_words") || "관련 단어"
          }</h4>
          ${relatedSections.join("")}
        </div>
      `;
    }
  }

  // 언어별 내용 업데이트
  contentContainer.innerHTML = `
    <div class="space-y-4">
      ${basicInfoHtml}
      ${grammarTagsHtml}
      ${relatedWordsHtml}
    </div>
  `;
}

// 문법 태그 포맷팅 함수 (품사를 박스로 표시)
function formatGrammarTags(lang, pos, features) {
  let formatted = "";

  if (pos) {
    formatted += `<span class="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs mr-2">${pos}</span>`;
  }

  if (features && features.length > 0) {
    features.forEach((feature) => {
      formatted += `<span class="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs mr-2">${feature}</span>`;
    });
  }

  return formatted;
}

// 모달 헤더 업데이트 함수 (언어 탭 변경시 상단 정보 업데이트)
function updateModalHeader(lang, concept) {
  // 일반 단어장에서는 헤더(제목, 발음)를 대상언어로 고정
  // 따라서 이 함수에서는 헤더를 변경하지 않음

  console.log(`모달 헤더는 대상언어로 고정됨 - 현재 탭: ${lang}`);

  // 도메인/카테고리 표시 (공통 번역 시스템 사용)
  const domainElement = document.getElementById("concept-view-domain-category");
  if (domainElement && concept.concept_info) {
    const currentLang = userLanguage || "ko";
    const domainCategory = getTranslatedDomainCategory(
      concept.concept_info.domain,
      concept.concept_info.category,
      currentLang
    );
    domainElement.textContent = domainCategory;
  }
}

// 언어 탭 전환 함수 (전역으로 노출)
function showLanguageTab(lang, button) {
  // 모든 탭 버튼 비활성화
  const tabButtons = document.querySelectorAll("#language-tabs button");
  tabButtons.forEach((btn) => {
    btn.classList.remove(
      "text-blue-600",
      "border-b-2",
      "border-blue-600",
      "font-medium"
    );
    btn.classList.add("text-gray-500", "hover:text-gray-700");
  });

  // 클릭된 버튼 활성화
  if (button) {
    button.classList.remove("text-gray-500", "hover:text-gray-700");
    button.classList.add(
      "text-blue-600",
      "border-b-2",
      "border-blue-600",
      "font-medium"
    );
  }

  // 언어 내용 표시
  if (currentConcept) {
    showLanguageContent(lang, currentConcept);
    // 예문도 해당 언어로 업데이트
    displayExamples(
      currentConcept,
      lang,
      window.currentSourceLanguage,
      window.currentTargetLanguage
    );
  }
}

// 예문 표시 함수 (AI 단어장과 동일한 로직)
function displayExamples(
  concept,
  currentLang,
  sourceLanguage = null,
  targetLanguage = null
) {
  const examplesContainer = document.getElementById("examples-container");

  if (!examplesContainer) {
    console.warn("examples-container를 찾을 수 없습니다.");
    return;
  }

  examplesContainer.innerHTML = "";

  let hasExamples = false;

  // 1. 대표 예문 확인
  if (concept.representative_example) {
    console.log("대표 예문 발견:", concept.representative_example);

    const exampleDiv = document.createElement("div");
    exampleDiv.className = "border p-4 rounded mb-4 bg-blue-50";

    let exampleContent = "";
    const languagesToShow = [];

    // 다국어 단어장 구조 (translations 객체)
    if (concept.representative_example.translations) {
      const translations = concept.representative_example.translations;

      // 현재 선택된 언어탭의 언어 먼저 추가
      if (translations[currentLang]) {
        languagesToShow.push({
          code: currentLang,
          name: getLanguageName(currentLang),
          text: translations[currentLang],
          isFirst: true,
        });
      }

      // 원본언어 추가 (현재 언어와 다른 경우에만)
      const sourceLanguageCode = window.currentSourceLanguage;
      if (
        translations[sourceLanguageCode] &&
        sourceLanguageCode !== currentLang
      ) {
        languagesToShow.push({
          code: sourceLanguageCode,
          name: getLanguageName(sourceLanguageCode),
          text: translations[sourceLanguageCode],
          isFirst: false,
        });
      }
    }
    // 기존 구조 (언어 직접 접근)
    else {
      // 현재 선택된 언어탭의 언어 먼저 추가
      if (concept.representative_example[currentLang]) {
        languagesToShow.push({
          code: currentLang,
          name: getLanguageName(currentLang),
          text: concept.representative_example[currentLang],
          isFirst: true,
        });
      }

      // 원본언어 추가 (현재 언어와 다른 경우에만)
      const sourceLanguageCode = window.currentSourceLanguage;
      if (
        concept.representative_example[sourceLanguageCode] &&
        sourceLanguageCode !== currentLang
      ) {
        languagesToShow.push({
          code: sourceLanguageCode,
          name: getLanguageName(sourceLanguageCode),
          text: concept.representative_example[sourceLanguageCode],
          isFirst: false,
        });
      }
    }

    languagesToShow.forEach((lang, index) => {
      if (lang.isFirst) {
        // 첫 번째(현재 선택된 언어) - 강조 표시
        exampleContent += `
          <p class="text-sm text-gray-700 font-medium mb-2">${lang.text}</p>
        `;
      } else {
        // 두 번째(원본 언어) - 이탤릭 표시
        exampleContent += `
          <p class="text-sm text-gray-500 italic">${lang.text}</p>
        `;
      }
    });

    exampleDiv.innerHTML = exampleContent;
    examplesContainer.appendChild(exampleDiv);
    hasExamples = true;
  }

  // 예문이 없는 경우
  if (!hasExamples) {
    examplesContainer.innerHTML = `<p class="text-gray-500 text-sm">${getTranslatedText(
      "no_examples"
    )}</p>`;
  }
}

// 모달 버튼 설정 함수
function setupModalButtons(conceptData) {
  console.log("🔧 모달 버튼 설정 시작");

  // 편집 버튼
  const editButton = document.getElementById("edit-concept-button");
  if (editButton) {
    editButton.onclick = () => {
      console.log("✏️ 개념 편집 버튼 클릭");
      const conceptId = conceptData.id || conceptData._id;
      console.log("📝 전달할 개념 ID:", conceptId);

      if (conceptId) {
        closeModal();
        if (typeof window.openEditConceptModal === "function") {
          window.openEditConceptModal(conceptId);
        } else {
          console.error("편집 모달 함수를 찾을 수 없습니다.");
        }
      } else {
        console.error("개념 ID를 찾을 수 없습니다.");
      }
    };
    console.log("✅ 편집 버튼 이벤트 설정 완료");
  }

  // 삭제 버튼
  const deleteButton = document.getElementById("delete-concept-button");
  if (deleteButton) {
    deleteButton.onclick = async () => {
      console.log("🗑️ 개념 삭제 버튼 클릭");

      const primaryLang = Object.keys(conceptData.expressions)[0];
      const word = conceptData.expressions[primaryLang]?.word || "이 개념";

      if (
        !confirm(
          getTranslatedText("confirm_delete_concept") ||
            `"${word}"을(를) 정말 삭제하시겠습니까?`
        )
      ) {
        return;
      }

      try {
        await conceptUtils.deleteConcept(conceptData.id || conceptData._id);
        alert(
          getTranslatedText("concept_deleted_success") ||
            "개념이 성공적으로 삭제되었습니다."
        );
        closeModal();
        window.location.reload();
      } catch (error) {
        console.error("개념 삭제 중 오류:", error);
        alert(
          (getTranslatedText("concept_delete_error") ||
            "개념 삭제 중 오류가 발생했습니다") +
            ": " +
            error.message
        );
      }
    };
    console.log("✅ 삭제 버튼 이벤트 설정 완료");
  }

  // 닫기 버튼
  const closeButton = document.getElementById("close-concept-view-modal");
  if (closeButton) {
    closeButton.onclick = closeModal;
    console.log("✅ 닫기 버튼 이벤트 설정 완료");
  }
}

// 모달 닫기 함수
function closeModal() {
  const modal = document.getElementById("concept-view-modal");
  if (modal) {
    modal.classList.add("hidden");
  }

  // 모달이 닫힐 때만 currentConcept 초기화
  currentConcept = null;
  console.log("모달 닫힘, currentConcept 초기화됨");
}

// 전역 함수로 노출
window.showConceptViewModal = showConceptViewModal;
window.showLanguageTab = showLanguageTab;

// 언어 변경 이벤트 리스너
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
      "#language-tabs button.text-blue-600"
    );
    if (currentTab) {
      const lang = currentTab.getAttribute("onclick").match(/'([^']+)'/)[1];
      showLanguageContent(lang, currentConcept);
    }
  }
});

// 초기화
document.addEventListener("DOMContentLoaded", () => {
  console.log("개념 보기 모달 스크립트 로드됨");
});
