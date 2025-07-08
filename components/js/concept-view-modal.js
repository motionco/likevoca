/**
 * 개념 보기 모달 관리 스크립트
 * 개념 카드 클릭 시 상세 정보를 표시하는 모달을 관리합니다.
 */

import {
  getTranslatedDomainCategory,
  getTranslatedPartOfSpeech,
  getTranslatedLevel,
  getTranslatedLanguageName,
} from "./concept-modal-shared.js";

// 전역 변수
let currentConcept = null;
let currentUser = null;
let userLanguage = "ko";

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
    word: "단어",
    pronunciation: "발음",
    definition: "정의",
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
    word: "Word",
    pronunciation: "Pronunciation",
    definition: "Definition",
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
    word: "単語",
    pronunciation: "発音",
    definition: "定義",
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
    word: "单词",
    pronunciation: "发音",
    definition: "定义",
  },
};

/**
 * 모달 초기화
 */
export function initializeConceptViewModal() {
  console.log("📋 개념 보기 모달 초기화");

  // 사용자 언어 설정
  userLanguage = localStorage.getItem("preferredLanguage") || "ko";

  // 전역 함수로 노출
  window.showConceptViewModal = showConceptViewModal;
  window.closeConceptViewModal = closeConceptViewModal;

  // 모달 배경 클릭 시 닫기 이벤트 설정
  const modal = document.getElementById("concept-view-modal");
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        closeConceptViewModal();
      }
    });
  }

  console.log("✅ 개념 보기 모달 초기화 완료");
}

/**
 * 개념 보기 모달 표시
 */
export function showConceptViewModal(
  conceptData,
  sourceLanguage,
  targetLanguage
) {
  console.log("📋 개념 보기 모달 표시:", {
    conceptData,
    sourceLanguage,
    targetLanguage,
  });

  if (!conceptData) {
    console.error("개념 데이터가 없습니다.");
    return;
  }

  currentConcept = conceptData;

  const modal = document.getElementById("concept-view-modal");
  if (!modal) {
    console.error("모달 요소를 찾을 수 없습니다.");
    return;
  }

  // 사용 가능한 언어 확인
  const availableLanguages = Object.keys(conceptData.expressions || {});
  console.log("사용 가능한 언어:", availableLanguages);

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

  console.log("언어 순서:", orderedLanguages);

  // 기본 개념 정보 설정 - 첫 번째 언어 사용
  const primaryLang = orderedLanguages[0];
  const primaryExpr = conceptData.expressions[primaryLang];

  // 이모지 설정
  const emoji =
    conceptData.metadata?.unicode_emoji ||
    conceptData.metadata?.emoji ||
    conceptData.unicode_emoji ||
    conceptData.emoji ||
    "📝";
  const emojiElement = document.getElementById("concept-view-emoji");
  if (emojiElement) {
    emojiElement.textContent = emoji;
  }

  // 제목 설정
  const titleElement = document.getElementById("concept-view-title");
  if (titleElement) {
    titleElement.textContent =
      primaryExpr?.text ||
      primaryExpr?.word ||
      primaryExpr?.expression ||
      "N/A";
  }

  // 발음 설정
  const pronunciationElement = document.getElementById(
    "concept-view-pronunciation"
  );
  if (pronunciationElement) {
    pronunciationElement.textContent =
      primaryExpr?.pronunciation || primaryExpr?.romanization || "";
  }

  // 카테고리와 도메인 표시
  const categoryDomainElement = document.getElementById(
    "concept-category-domain"
  );
  if (categoryDomainElement) {
    const domain =
      conceptData.metadata?.domain || conceptData.domain || "other";
    const category =
      conceptData.metadata?.category || conceptData.category || "general";

    const currentLang =
      localStorage.getItem("preferredLanguage") || userLanguage || "ko";
    const translatedDomainCategory = getTranslatedDomainCategory(
      domain,
      category,
      currentLang
    );

    categoryDomainElement.textContent = translatedDomainCategory;
  }

  // 날짜 설정
  const timestampElement = document.getElementById("concept-timestamp");
  if (timestampElement) {
    const createdDate =
      conceptData.metadata?.created_at ||
      conceptData.created_at ||
      conceptData.timestamp;
    if (createdDate) {
      timestampElement.textContent = formatDate(createdDate);
    }
  }

  // 언어 탭 생성
  createLanguageTabs(orderedLanguages, conceptData);

  // 예문 로드
  loadExamples(conceptData, sourceLanguage, targetLanguage);

  // 모달 버튼 설정
  setupModalButtons(conceptData);

  // 모달 표시
  modal.classList.remove("hidden");
  modal.classList.add("flex");
  document.body.classList.add("overflow-hidden");

  console.log("✅ 개념 보기 모달 표시 완료");
}

/**
 * 언어 탭 생성
 */
function createLanguageTabs(languages, conceptData) {
  const tabsContainer = document.getElementById("language-tabs");
  const contentContainer = document.getElementById("language-content");

  if (!tabsContainer || !contentContainer) {
    console.error("탭 또는 콘텐츠 컨테이너를 찾을 수 없습니다.");
    return;
  }

  // 기존 내용 초기화
  tabsContainer.innerHTML = "";
  contentContainer.innerHTML = "";

  const currentLang =
    localStorage.getItem("preferredLanguage") || userLanguage || "ko";

  languages.forEach((langCode, index) => {
    const expression = conceptData.expressions[langCode];
    if (!expression) return;

    const isActive = index === 0;
    const languageName = getTranslatedLanguageName(langCode, currentLang);

    // 탭 생성
    const tab = document.createElement("button");
    tab.className = `px-4 py-2 font-medium border-b-2 transition-colors ${
      isActive
        ? "text-blue-600 border-blue-600"
        : "text-gray-500 border-transparent hover:text-gray-700"
    }`;
    tab.textContent = languageName;
    tab.onclick = () => showLanguageContent(langCode, conceptData);
    tabsContainer.appendChild(tab);

    // 콘텐츠 생성
    const content = document.createElement("div");
    content.id = `language-content-${langCode}`;
    content.className = `language-content ${isActive ? "" : "hidden"}`;

    content.innerHTML = createLanguageContentHTML(
      langCode,
      expression,
      currentLang
    );
    contentContainer.appendChild(content);
  });

  // 전역 함수로 노출
  window.showLanguageContent = showLanguageContent;
}

/**
 * 언어별 콘텐츠 HTML 생성
 */
function createLanguageContentHTML(langCode, expression, currentLang) {
  const getUILabels = (userLang) => {
    const labels = {
      ko: {
        word: "단어:",
        meaning: "의미:",
        partOfSpeech: "품사:",
        level: "수준:",
      },
      en: {
        word: "Word:",
        meaning: "Meaning:",
        partOfSpeech: "Part of Speech:",
        level: "Level:",
      },
      ja: {
        word: "単語:",
        meaning: "意味:",
        partOfSpeech: "品詞:",
        level: "レベル:",
      },
      zh: {
        word: "单词:",
        meaning: "意思:",
        partOfSpeech: "词性:",
        level: "级别:",
      },
    };
    return labels[userLang] || labels.ko;
  };

  const labels = getUILabels(currentLang);

  return `
    <div class="bg-gray-50 p-4 rounded-lg">
      <div class="space-y-4">
        <!-- 단어 -->
        <div>
          <span class="text-sm font-medium text-gray-600">${labels.word}</span>
          <div class="text-xl font-bold text-gray-800 mt-1">
            ${
              expression.text ||
              expression.word ||
              expression.expression ||
              "N/A"
            }
          </div>
        </div>

        <!-- 의미/정의 -->
        <div>
          <span class="text-sm font-medium text-gray-600">${
            labels.meaning
          }</span>
          <div class="text-gray-700 mt-1">
            ${expression.meaning || expression.definition || ""}
          </div>
        </div>

        <!-- 품사 -->
        ${
          expression.part_of_speech
            ? `
        <div>
          <span class="text-sm font-medium text-gray-600">${
            labels.partOfSpeech
          }</span>
          <div class="text-gray-700 mt-1">
            ${getTranslatedPartOfSpeech(expression.part_of_speech, currentLang)}
          </div>
        </div>
        `
            : ""
        }

        <!-- 수준 -->
        ${
          expression.level
            ? `
        <div>
          <span class="text-sm font-medium text-gray-600">${labels.level}</span>
          <div class="text-gray-700 mt-1">
            ${getTranslatedLevel(expression.level, currentLang)}
          </div>
        </div>
        `
            : ""
        }
      </div>
    </div>
  `;
}

/**
 * 언어 콘텐츠 표시
 */
function showLanguageContent(langCode, conceptData) {
  // 모든 탭 비활성화
  const tabs = document.querySelectorAll("#language-tabs button");
  tabs.forEach((tab) => {
    tab.className =
      "px-4 py-2 font-medium border-b-2 transition-colors text-gray-500 border-transparent hover:text-gray-700";
  });

  // 모든 콘텐츠 숨기기
  const contents = document.querySelectorAll(".language-content");
  contents.forEach((content) => {
    content.classList.add("hidden");
  });

  // 선택된 탭 활성화
  const currentLang =
    localStorage.getItem("preferredLanguage") || userLanguage || "ko";
  const languageName = getTranslatedLanguageName(langCode, currentLang);
  const selectedTab = Array.from(tabs).find(
    (tab) => tab.textContent === languageName
  );
  if (selectedTab) {
    selectedTab.className =
      "px-4 py-2 font-medium border-b-2 transition-colors text-blue-600 border-blue-600";
  }

  // 선택된 콘텐츠 표시
  const selectedContent = document.getElementById(
    `language-content-${langCode}`
  );
  if (selectedContent) {
    selectedContent.classList.remove("hidden");
  }
}

/**
 * 예문 로드
 */
function loadExamples(conceptData, sourceLanguage, targetLanguage) {
  const examplesContainer = document.getElementById("examples-container");
  if (!examplesContainer) {
    console.error("예문 컨테이너를 찾을 수 없습니다.");
    return;
  }

  let examplesHTML = "";
  const currentLang =
    localStorage.getItem("preferredLanguage") || userLanguage || "ko";

  // 대표 예문 확인
  if (conceptData.representative_example) {
    const repExample = conceptData.representative_example;
    let exampleData = null;

    // 직접 언어별 스키마 사용
    if (repExample[sourceLanguage] && repExample[targetLanguage]) {
      exampleData = {
        source: repExample[sourceLanguage],
        target: repExample[targetLanguage],
      };
    }
    // 기존 구조: translations 객체
    else if (repExample.translations) {
      exampleData = {
        source:
          repExample.translations[sourceLanguage]?.text ||
          repExample.translations[sourceLanguage] ||
          "",
        target:
          repExample.translations[targetLanguage]?.text ||
          repExample.translations[targetLanguage] ||
          "",
      };
    }

    if (exampleData && exampleData.source && exampleData.target) {
      examplesHTML = `
        <div class="bg-white p-4 rounded-lg border border-gray-200">
          <div class="space-y-3">
            <div>
              <div class="text-sm font-medium text-gray-600 mb-1">
                ${getTranslatedLanguageName(sourceLanguage, currentLang)}
              </div>
              <div class="text-gray-800">${exampleData.source}</div>
            </div>
            <div>
              <div class="text-sm font-medium text-gray-600 mb-1">
                ${getTranslatedLanguageName(targetLanguage, currentLang)}
              </div>
              <div class="text-gray-800">${exampleData.target}</div>
            </div>
          </div>
        </div>
      `;
    }
  }

  if (!examplesHTML) {
    examplesHTML = `
      <div class="text-center py-8">
        <i class="fas fa-file-alt text-gray-300 text-3xl mb-2"></i>
        <p class="text-gray-500">${getTranslatedText("no_examples")}</p>
      </div>
    `;
  }

  examplesContainer.innerHTML = examplesHTML;
}

/**
 * 모달 버튼 설정
 */
function setupModalButtons(conceptData) {
  // 편집 버튼
  const editButton = document.getElementById("edit-concept-button");
  if (editButton) {
    editButton.onclick = () => {
      if (window.openEditConceptModal) {
        window.openEditConceptModal(conceptData);
      }
      closeConceptViewModal();
    };
  }

  // 삭제 버튼
  const deleteButton = document.getElementById("delete-concept-button");
  if (deleteButton) {
    deleteButton.onclick = async () => {
      const confirmed = confirm("정말로 이 개념을 삭제하시겠습니까?");
      if (confirmed) {
        try {
          if (window.deleteConcept) {
            await window.deleteConcept(conceptData.id || conceptData._id);
          }
          closeConceptViewModal();
        } catch (error) {
          console.error("개념 삭제 오류:", error);
          alert("개념 삭제 중 오류가 발생했습니다.");
        }
      }
    };
  }

  // 닫기 버튼
  const closeButton = document.getElementById("close-concept-view-modal");
  if (closeButton) {
    closeButton.onclick = closeConceptViewModal;
  }
}

/**
 * 개념 보기 모달 닫기
 */
export function closeConceptViewModal() {
  const modal = document.getElementById("concept-view-modal");
  if (modal) {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
    document.body.classList.remove("overflow-hidden");
  }
}

/**
 * 다국어 번역 텍스트 가져오기
 */
function getTranslatedText(key) {
  const currentLang =
    localStorage.getItem("preferredLanguage") || userLanguage || "ko";

  // 전역 번역 시스템 사용
  if (
    window.translations &&
    window.translations[currentLang] &&
    window.translations[currentLang][key]
  ) {
    return window.translations[currentLang][key];
  }

  // 로컬 번역 시스템 fallback
  return (
    pageTranslations[currentLang]?.[key] || pageTranslations.en?.[key] || key
  );
}

/**
 * 날짜 포맷팅
 */
function formatDate(timestamp) {
  try {
    let date;
    if (
      timestamp &&
      timestamp.toDate &&
      typeof timestamp.toDate === "function"
    ) {
      date = timestamp.toDate();
    } else if (timestamp && timestamp.seconds) {
      date = new Date(timestamp.seconds * 1000);
    } else {
      date = new Date(timestamp);
    }

    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    }
  } catch (error) {
    console.error("날짜 포맷팅 오류:", error);
  }
  return "";
}

/**
 * 사용자 설정
 */
export function setCurrentUser(user) {
  currentUser = user;
}

export function setUserLanguage(lang) {
  userLanguage = lang;
}
