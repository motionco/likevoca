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

let currentUser = null;
let userLanguage = "ko";

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

  console.log("✅ 개념 보기 모달 초기화 완료");
}

/**
 * 개념 보기 모달 표시
 * @param {Object} conceptData - 개념 데이터
 * @param {string} sourceLanguage - 기본 언어
 * @param {string} targetLanguage - 대상 언어
 */
export function showConceptViewModal(
  conceptData,
  sourceLanguage,
  targetLanguage
) {
  console.log("📋 개념 보기 모달 표시:", conceptData);

  // 모달 채우기
  fillConceptViewModal(conceptData, sourceLanguage, targetLanguage);

  // 모달 표시
  const modal = document.getElementById("concept-view-modal");
  if (modal) {
    modal.classList.remove("hidden");
    modal.classList.add("flex");
    document.body.classList.add("overflow-hidden");
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
 * 모달 내용 채우기
 */
function fillConceptViewModal(conceptData, sourceLanguage, targetLanguage) {
  console.log("📝 모달 내용 채우기 시작");

  // 개념 정보 우선순위: 분리된 컬렉션 메타데이터 > 기본 데이터
  const conceptInfo = conceptData.metadata || conceptData;

  // 도메인 카테고리 표시 (공통 번역 시스템 사용)
  const domainCategoryElement = document.getElementById(
    "concept-view-domain-category"
  );
  if (domainCategoryElement) {
    const domain = conceptInfo.domain || conceptData.domain || "기타";
    const category = conceptInfo.category || conceptData.category || "일반";
    const currentLang =
      localStorage.getItem("preferredLanguage") || userLanguage || "ko";

    domainCategoryElement.textContent = getTranslatedDomainCategory(
      domain,
      category,
      currentLang
    );
  }

  // 이모지와 색상
  const emoji =
    conceptInfo.unicode_emoji ||
    conceptInfo.emoji ||
    conceptData.emoji ||
    conceptData.unicode_emoji ||
    "🔤";
  const colorTheme = conceptInfo.color_theme || "#4B63AC";

  const emojiElement = document.getElementById("concept-view-emoji");
  if (emojiElement) {
    emojiElement.textContent = emoji;
  }

  const headerElement = document.querySelector(".concept-view-header");
  if (headerElement) {
    headerElement.style.borderLeftColor = colorTheme;
  }

  // 날짜 정보
  const createdDate =
    conceptData.metadata?.created_at ||
    conceptData.created_at ||
    conceptData.timestamp;
  const dateElement = document.getElementById("concept-updated-at");
  if (dateElement && createdDate) {
    dateElement.textContent = formatDate(createdDate);
  }

  // 언어별 표현 채우기
  fillLanguageExpressions(conceptData, sourceLanguage, targetLanguage);

  // 모달 버튼 설정
  setupModalButtons(conceptData);

  // 모달 탭 한국어 번역 적용
  setTimeout(() => {
    applyModalTranslations();
  }, 100);
}

/**
 * 언어별 표현 채우기
 */
function fillLanguageExpressions(conceptData, sourceLanguage, targetLanguage) {
  console.log("📝 언어별 표현 채우기", { sourceLanguage, targetLanguage });

  // 기본 언어 표현
  if (
    sourceLanguage &&
    conceptData.expressions &&
    conceptData.expressions[sourceLanguage]
  ) {
    updateLanguageContent(sourceLanguage, conceptData, sourceLanguage);
  }

  // 대상 언어 표현
  if (
    targetLanguage &&
    conceptData.expressions &&
    conceptData.expressions[targetLanguage]
  ) {
    updateLanguageContent(targetLanguage, conceptData, targetLanguage);
  }

  // 예문 로드
  loadAndDisplayExamples(
    conceptData.id || conceptData._id,
    sourceLanguage,
    targetLanguage
  );
}

/**
 * 언어 내용 업데이트
 */
function updateLanguageContent(langCode, conceptData, sourceLanguage) {
  const expression = conceptData.expressions[langCode];
  if (!expression) return;

  // UI 라벨 번역
  const currentLang =
    localStorage.getItem("preferredLanguage") || userLanguage || "ko";
  const getUILabels = (userLang) => {
    const labels = {
      ko: {
        meaning: "뜻:",
        example: "예문:",
        partOfSpeech: "품사:",
        level: "레벨:",
      },
      en: {
        meaning: "Meaning:",
        example: "Example:",
        partOfSpeech: "Part of Speech:",
        level: "Level:",
      },
      ja: {
        meaning: "意味:",
        example: "例文:",
        partOfSpeech: "品詞:",
        level: "レベル:",
      },
      zh: {
        meaning: "意思:",
        example: "例句:",
        partOfSpeech: "词性:",
        level: "级度:",
      },
    };
    return labels[userLang] || labels.ko;
  };

  const labels = getUILabels(currentLang);

  // 언어별 컨테이너 찾기
  const container = document.getElementById(`${langCode}-content`);
  if (!container) return;

  // 언어 이름 표시
  const langNameElement = container.querySelector(".language-name");
  if (langNameElement) {
    langNameElement.textContent = getTranslatedLanguageName(
      langCode,
      currentLang
    );
  }

  // 표현 텍스트 표시
  const expressionElement = container.querySelector(".expression-text");
  if (expressionElement) {
    expressionElement.textContent =
      expression.text || expression.expression || "";
  }

  // 의미 텍스트 표시
  const meaningElement = container.querySelector(".meaning-text");
  if (meaningElement) {
    meaningElement.textContent = expression.meaning || "";
  }

  // 품사 텍스트 표시
  const posElement = container.querySelector(".pos-text");
  if (posElement && expression.part_of_speech) {
    posElement.textContent = getTranslatedPartOfSpeech(
      expression.part_of_speech,
      currentLang
    );
  }

  // 레벨 텍스트 표시
  const levelElement = container.querySelector(".level-text");
  if (levelElement && expression.level) {
    levelElement.textContent = getTranslatedLevel(
      expression.level,
      currentLang
    );
  }
}

/**
 * 예문 로드 표시
 */
async function loadAndDisplayExamples(
  conceptId,
  sourceLanguage,
  targetLanguage
) {
  try {
    const viewModal = document.getElementById("concept-view-modal");
    const examplesContainer = viewModal
      ? viewModal.querySelector("#examples-container")
      : null;

    if (!examplesContainer) {
      console.error("개념 보기 모달에서 examples-container를 찾을 수 없습니다");
      return;
    }

    let examplesHTML = "";
    const allExamples = [];

    // 현재 개념에서 representative_example 사용
    const currentConcept = window.allConcepts?.find(
      (c) => c.id === conceptId || c._id === conceptId
    );

    if (currentConcept?.representative_example) {
      const repExample = currentConcept.representative_example;
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
        allExamples.push({
          sourceText: exampleData.source,
          targetText: exampleData.target,
          priority: 100,
          context: "예문,",
          isRepresentative: true,
        });
      }
    }

    // 예문 표시
    if (allExamples.length > 0) {
      allExamples.slice(0, 3).forEach((example) => {
        examplesHTML += `
          <div class="bg-gray-50 p-3 rounded-lg mb-3">
            <div class="text-sm text-gray-600 mb-1">${getTranslatedLanguageName(
              sourceLanguage,
              userLanguage
            )}</div>
            <div class="font-medium mb-2 truncate">${example.sourceText}</div>
            <div class="text-sm text-gray-600 mb-1">${getTranslatedLanguageName(
              targetLanguage,
              userLanguage
            )}</div>
            <div class="text-gray-700 truncate">${example.targetText}</div>
          </div>
        `;
      });
    } else {
      examplesHTML = `<p class="text-gray-500 text-sm">예문을 찾을 수 없습니다.</p>`;
    }

    examplesContainer.innerHTML = examplesHTML;
  } catch (error) {
    console.error("예문 로드 오류:", error);
  }
}

/**
 * 모달 버튼 설정
 */
function setupModalButtons(conceptData) {
  // 수정 버튼
  const editButton = document.getElementById("edit-concept-btn");
  if (editButton) {
    editButton.onclick = () => {
      console.log("🔄 개념 수정 버튼 클릭");
      // 수정 모달 표기 (기존 기능 사용)
      if (window.openEditConceptModal) {
        window.openEditConceptModal(conceptData);
      }
      closeConceptViewModal();
    };
  }

  // 삭제 버튼
  const deleteButton = document.getElementById("delete-concept-btn");
  if (deleteButton) {
    deleteButton.onclick = async () => {
      console.log("🗑️ 개념 삭제 버튼 클릭");

      const confirmed = confirm("정말로 이 개념을 삭제하시겠습니까?");
      if (confirmed) {
        try {
          // 삭제 로직 (기존 기능 사용)
          if (window.deleteConcept) {
            await window.deleteConcept(conceptData.id || conceptData._id);
          }
          closeConceptViewModal();
        } catch (error) {
          console.error("개념 삭제 오류:", error);
          alert("개념 삭제 오류가 발생했습니다.");
        }
      }
    };
  }

  // 닫기 버튼
  const closeButton = document.getElementById("close-concept-view-btn");
  if (closeButton) {
    closeButton.onclick = closeConceptViewModal;
  }
}

/**
 * 모달 탭 한국어 번역 적용
 */
function applyModalTranslations() {
  const modal = document.getElementById("concept-view-modal");
  if (!modal) return;

  modal.querySelectorAll("[data-i18n]").forEach((element) => {
    const key = element.getAttribute("data-i18n");
    const translatedText = getTranslatedText(key);
    if (translatedText) {
      element.textContent = translatedText;
    }
  });
}

/**
 * 번역 스크립트가 오류를 발생시키는지 확인
 */
function getTranslatedText(key) {
  try {
    if (typeof window.getI18nText === "function") {
      const result = window.getI18nText(key);
      if (result !== key) {
        return result;
      }
    }

    const currentLang = userLanguage || "ko";
    if (
      window.translations &&
      window.translations[currentLang] &&
      window.translations[currentLang][key]
    ) {
      return window.translations[currentLang][key];
    }

    return key;
  } catch (error) {
    console.error(`번역 스크립트가 오류를 발생시키는지 확인 (${key}):`, error);
    return key;
  }
}

/**
 * 날짜 포맷팅
 */
function formatDate(timestamp) {
  if (!timestamp) return "";

  let date;
  if (timestamp.toDate) {
    date = timestamp.toDate();
  } else if (timestamp instanceof Date) {
    date = timestamp;
  } else {
    date = new Date(timestamp);
  }

  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

/**
 * 현재 사용자 설정
 */
export function setCurrentUser(user) {
  currentUser = user;
}

/**
 * 사용자 언어 설정
 */
export function setUserLanguage(lang) {
  userLanguage = lang;
}
