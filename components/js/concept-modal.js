import {
  auth,
  db,
  supportedLanguages,
  conceptUtils,
} from "../../js/firebase/firebase-init.js";
import { getActiveLanguage } from "../../utils/language-utils.js";
import {
  formatGrammarTags,
  getPOSList,
  getGrammarFeatures,
} from "../../js/grammar-tags-system.js";
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
    grammar: "문법",
    grammar_info: "문법 정보",
    // 카테고리 번역
    fruit: "과일",
    food: "음식",
    animal: "동물",
    daily: "일상",
    travel: "여행",
    business: "비즈니스",
    transportation: "교통",
    greeting: "인사",
    emotion: "감정",
    education: "교육",
    nature: "자연",
    // 도메인 번역
    general: "일반",
    // 수준 번역
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
    grammar_info: "Grammar Info",
    // 카테고리 번역
    fruit: "Fruit",
    food: "Food",
    animal: "Animal",
    daily: "Daily Life",
    travel: "Travel",
    business: "Business",
    transportation: "Transportation",
    greeting: "Greeting",
    emotion: "Emotion",
    education: "Education",
    nature: "Nature",
    // 도메인 번역
    general: "General",
    // 수준 번역
    beginner: "Beginner",
    intermediate: "Intermediate",
    advanced: "Advanced",
    basic: "Basic",
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
    grammar: "文法",
    grammar_info: "文法情報",
    // 카테고리 번역
    fruit: "果物",
    food: "食べ物",
    animal: "動物",
    daily: "日常",
    travel: "旅行",
    business: "ビジネス",
    transportation: "交通",
    greeting: "挨拶",
    emotion: "感情",
    education: "教育",
    nature: "自然",
    // 도메인 번역
    general: "一般",
    // 수준 번역
    beginner: "初級",
    intermediate: "中級",
    advanced: "上級",
    basic: "基礎",
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
    grammar: "语法",
    grammar_info: "语法信息",
    // 카테고리 번역
    fruit: "水果",
    food: "食物",
    animal: "动物",
    daily: "日常",
    travel: "旅行",
    business: "商务",
    transportation: "交通",
    greeting: "问候",
    emotion: "情绪",
    education: "教育",
    nature: "自然",
    // 도메인 번역
    general: "一般",
    // 수준 번역
    beginner: "初级",
    intermediate: "中级",
    advanced: "高级",
    basic: "基础",
  },
};

// 다국어 번역 텍스트 가져오기 함수
function getTranslatedText(key) {
  return pageTranslations[userLanguage][key] || pageTranslations.en[key] || key;
}

// 웹사이트 언어를 DB 언어 코드로 변환하는 함수
function getUserLanguageCode() {
  const languageCodeMap = {
    ko: "korean",
    en: "english",
    ja: "japanese",
    zh: "chinese",
  };
  return languageCodeMap[userLanguage] || "korean";
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

  // 이모지 설정 개선 (안전한 접근)
  const emoji =
    concept.concept_info?.emoji ||
    concept.unicode_emoji ||
    concept.concept_info?.unicode_emoji ||
    "📝";

  const emojiElement = document.getElementById("concept-emoji");
  if (emojiElement) {
    emojiElement.textContent = emoji;
  } else {
    console.warn("concept-emoji 요소를 찾을 수 없습니다.");
  }
  console.log("이모지 설정:", emoji, "원본 데이터:", concept.concept_info);

  const primaryWordElement = document.getElementById("concept-view-title");
  if (primaryWordElement) {
    primaryWordElement.textContent = primaryExpr?.word || "N/A";
  } else {
    console.warn("concept-view-title 요소를 찾을 수 없습니다.");
  }

  const primaryPronElement = document.getElementById(
    "concept-view-pronunciation"
  );
  if (primaryPronElement) {
    primaryPronElement.textContent = primaryExpr?.pronunciation || "";
  } else {
    console.warn("concept-view-pronunciation 요소를 찾을 수 없습니다.");
  }

  // 카테고리와 도메인을 사용자 언어에 맞게 번역
  const categoryKey =
    concept.concept_info?.category || concept.category || "general";
  const domainKey = concept.concept_info?.domain || concept.domain || "general";

  const translatedCategory = getTranslatedText(categoryKey);
  const translatedDomain = getTranslatedText(domainKey);

  // 카테고리/도메인 정보를 제목 아래에 표시
  const titleElement = document.getElementById("concept-view-title");
  if (titleElement) {
    // 기존 카테고리 태그가 있다면 제거
    const existingCategory =
      titleElement.parentElement.querySelector(".category-tag");
    if (existingCategory) {
      existingCategory.remove();
    }

    // 새 카테고리 태그 추가
    const categoryTag = document.createElement("div");
    categoryTag.className =
      "category-tag text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full inline-block mt-1";
    categoryTag.textContent = `${translatedDomain}/${translatedCategory}`;
    titleElement.parentElement.appendChild(categoryTag);
    console.log(
      "카테고리/도메인 태그 추가됨:",
      `${translatedDomain}/${translatedCategory}`
    );
  } else {
    console.warn(
      "concept-view-title 요소를 찾을 수 없어서 카테고리를 표시할 수 없습니다."
    );
  }

  // 업데이트 날짜 설정
  const updatedAt =
    concept.updatedAt || concept.createdAt || concept.created_at;
  if (updatedAt) {
    // 날짜 포맷팅 개선 (ai-vocabulary.js와 동일한 로직 사용)
    let formattedDate = "";
    try {
      let date;
      if (updatedAt.toDate && typeof updatedAt.toDate === "function") {
        // Firestore Timestamp 객체인 경우
        date = updatedAt.toDate();
      } else if (updatedAt.seconds) {
        // Firestore Timestamp 형태의 객체인 경우
        date = new Date(updatedAt.seconds * 1000);
      } else {
        // 일반 Date 객체나 문자열인 경우
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

  // 탭 생성
  const tabsContainer = document.getElementById("language-tabs");
  const contentContainer = document.getElementById("language-content");

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

// 언어 이름 가져오기 (환경설정 언어에 맞게)
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

  return (
    languageNames[userLanguage]?.[langCode] ||
    languageNames.en[langCode] ||
    langCode
  );
}

// 언어별 내용 표시
function showLanguageContent(lang, concept) {
  console.log("언어별 내용 표시:", lang, "개념:", concept);

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

  console.log(`${lang} 표현:`, expression);

  // 상단 기본 정보도 함께 업데이트
  updateBasicInfo(lang, concept);

  // 문법 태그 포맷팅
  let grammarTagsHtml = "";
  if (expression.grammar_tags && expression.grammar_tags.length > 0) {
    const pos = expression.grammar_tags.find((tag) => !tag.includes(":"));
    const features = expression.grammar_tags.filter((tag) => tag.includes(":"));
    const formatted = formatGrammarTags(lang, pos, features);

    grammarTagsHtml = `
      <div class="mt-3 p-2 bg-blue-50 rounded">
        <div class="text-xs font-medium text-blue-700 mb-1">${getTranslatedText(
          "grammar_info"
        )}</div>
        <div class="flex flex-wrap gap-1">
          <span class="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded font-medium">
            ${formatted.pos}
          </span>
          ${formatted.features
            .map(
              (feature) => `
            <span class="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
              ${feature}
            </span>
          `
            )
            .join("")}
        </div>
      </div>
    `;
  }

  contentContainer.innerHTML = `
    <div class="space-y-4">
      <div>
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
          ${grammarTagsHtml}
        </div>
      </div>
    </div>
  `;
}

// 수준을 해당 언어에 맞게 번역하는 함수
function getLocalizedLevel(level, targetLang) {
  const levelTranslations = {
    korean: {
      beginner: "초급",
      intermediate: "중급",
      advanced: "고급",
      basic: "기초",
    },
    english: {
      beginner: "Beginner",
      intermediate: "Intermediate",
      advanced: "Advanced",
      basic: "Basic",
    },
    japanese: {
      beginner: "初級",
      intermediate: "中級",
      advanced: "上級",
      basic: "基礎",
    },
    chinese: {
      beginner: "初级",
      intermediate: "中级",
      advanced: "高级",
      basic: "基础",
    },
  };

  return levelTranslations[targetLang]?.[level] || level || "N/A";
}

// 기본 정보 업데이트 함수 수정
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
  const categoryDomainElement = document.getElementById(
    "concept-category-domain"
  );

  if (emojiElement) {
    // 이모지 수정: concept_info 또는 unicode_emoji에서 가져오기
    const emoji =
      concept.concept_info?.emoji ||
      concept.unicode_emoji ||
      concept.concept_info?.unicode_emoji ||
      "📝";
    emojiElement.textContent = emoji;
    console.log("이모지 설정:", emoji, "원본 데이터:", concept.concept_info);
  }

  if (wordElement) {
    wordElement.textContent = expression.word || "N/A";
  }

  if (pronunciationElement) {
    pronunciationElement.textContent = expression.pronunciation || "";
  }

  // 카테고리와 도메인을 하나로 합쳐서 표시
  if (categoryDomainElement) {
    const categoryKey =
      concept.concept_info?.category || concept.category || "general";
    const domainKey =
      concept.concept_info?.domain || concept.domain || "general";

    const translatedCategory = getTranslatedText(categoryKey);
    const translatedDomain = getTranslatedText(domainKey);

    // 도메인/카테고리 형태로 결합 (순서 변경)
    categoryDomainElement.textContent = `${translatedDomain}/${translatedCategory}`;
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

  const conceptId =
    currentConcept.concept_id || currentConcept.id || currentConcept._id;

  if (!conceptId) {
    console.error("개념 ID를 찾을 수 없습니다.");
    alert("편집할 개념의 ID를 찾을 수 없습니다.");
    return;
  }

  console.log("📝 개념 편집 모달 열기:", conceptId);

  // 현재 보기 모달 닫기
  closeModal();

  // 편집 모달 열기 (edit-concept-modal.js의 전역 함수 호출)
  if (window.openEditConceptModal) {
    window.openEditConceptModal(conceptId);
  } else {
    console.error(
      "❌ openEditConceptModal 함수를 찾을 수 없습니다. edit-concept-modal.js가 로드되었는지 확인하세요."
    );
    alert(
      "편집 기능을 불러올 수 없습니다. 페이지를 새로고침 후 다시 시도해주세요."
    );
  }
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
  const examplesContainer = document.getElementById("examples-container");

  if (!examplesContainer) {
    console.warn("examples-container를 찾을 수 없습니다.");
    return;
  }

  examplesContainer.innerHTML = "";

  let hasExamples = false;

  // 1. 대표 예문 확인 (분리된 컬렉션 구조)
  if (concept.representative_example) {
    console.log(
      "분리된 컬렉션 구조의 representative_example 발견:",
      concept.representative_example
    );

    const exampleDiv = document.createElement("div");
    exampleDiv.className = "border p-4 rounded mb-4 bg-blue-50";
    exampleDiv.innerHTML = `<div class="mb-2 text-sm font-medium text-blue-800">📌 대표 예문</div>`;

    let exampleContent = "";
    const languagesToShow = [];

    // 대상언어 먼저 추가
    if (targetLanguage && concept.representative_example[targetLanguage]) {
      languagesToShow.push({
        code: targetLanguage,
        name: getLanguageName(targetLanguage),
        text: concept.representative_example[targetLanguage],
        label: "(대상)",
      });
    }

    // 원본언어 추가 (다른 경우만)
    if (
      sourceLanguage &&
      concept.representative_example[sourceLanguage] &&
      sourceLanguage !== targetLanguage
    ) {
      languagesToShow.push({
        code: sourceLanguage,
        name: getLanguageName(sourceLanguage),
        text: concept.representative_example[sourceLanguage],
        label: "(원본)",
      });
    }

    // 현재 탭 언어 추가 (다른 경우만)
    if (
      concept.representative_example[currentLang] &&
      currentLang !== targetLanguage &&
      currentLang !== sourceLanguage
    ) {
      languagesToShow.push({
        code: currentLang,
        name: getLanguageName(currentLang),
        text: concept.representative_example[currentLang],
        label: "(현재)",
      });
    }

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

    exampleDiv.innerHTML += exampleContent;
    examplesContainer.appendChild(exampleDiv);
    hasExamples = true;
  }

  // 2. 추가 예문들 확인 (분리된 컬렉션 구조)
  if (concept.examples && concept.examples.length > 0) {
    console.log("분리된 컬렉션 구조의 examples 발견:", concept.examples);

    concept.examples.forEach((example, index) => {
      const exampleDiv = document.createElement("div");
      exampleDiv.className = "border p-4 rounded mb-4 bg-gray-50";
      exampleDiv.innerHTML = `<div class="mb-2 text-sm font-medium text-gray-700">💡 추가 예문 ${
        index + 1
      }</div>`;

      let exampleContent = "";
      const languagesToShow = [];

      // 대상언어 먼저 추가
      if (targetLanguage && example[targetLanguage]) {
        languagesToShow.push({
          code: targetLanguage,
          name: getLanguageName(targetLanguage),
          text: example[targetLanguage],
          label: "(대상)",
        });
      }

      // 원본언어 추가 (다른 경우만)
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

      // 현재 탭 언어 추가 (다른 경우만)
      if (
        example[currentLang] &&
        currentLang !== targetLanguage &&
        currentLang !== sourceLanguage
      ) {
        languagesToShow.push({
          code: currentLang,
          name: getLanguageName(currentLang),
          text: example[currentLang],
          label: "(현재)",
        });
      }

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

      exampleDiv.innerHTML += exampleContent;
      examplesContainer.appendChild(exampleDiv);
      hasExamples = true;
    });
  }

  // 3. 호환성을 위한 기존 구조 (featured_examples) 확인
  else if (concept.featured_examples && concept.featured_examples.length > 0) {
    console.log("AI 개념의 featured_examples 발견:", concept.featured_examples);

    concept.featured_examples.forEach((example, index) => {
      if (example.translations) {
        const exampleDiv = document.createElement("div");
        exampleDiv.className = "border p-4 rounded mb-4 bg-gray-50";

        let exampleContent = "";
        const languagesToShow = [];

        // 예문 순서: 대상언어 → 원본언어 → 현재언어
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

        // 2. 원본언어 추가 (대상언어와 다르고 있는 경우)
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

        // 3. 현재 탭 언어 추가 (대상언어 및 원본언어와 다르고 있는 경우)
        if (
          example.translations[currentLang] &&
          currentLang !== targetLanguage &&
          currentLang !== sourceLanguage
        ) {
          languagesToShow.push({
            code: currentLang,
            name: getLanguageName(currentLang),
            text: example.translations[currentLang].text,
            grammarNotes: example.translations[currentLang].grammar_notes,
            label: "(현재)",
          });
        }

        // 언어들을 순서대로 표시 (문법 노트는 제외)
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

        // 대상 언어로 문법 설명 하나만 추가 (가장 아래)
        let grammarNote = null;

        // 웹사이트 환경 언어에 맞는 문법 설명 우선 찾기
        const websiteLanguageCode = getUserLanguageCode(); // 현재 웹사이트 언어 코드 가져오기
        if (
          websiteLanguageCode &&
          example.translations[websiteLanguageCode]?.grammar_notes
        ) {
          grammarNote = example.translations[websiteLanguageCode].grammar_notes;
        }
        // 웹사이트 언어가 없으면 대상 언어의 문법 설명 사용
        else if (
          targetLanguage &&
          example.translations[targetLanguage]?.grammar_notes
        ) {
          grammarNote = example.translations[targetLanguage].grammar_notes;
        }
        // 그것도 없으면 첫 번째 언어의 문법 설명 사용
        else if (
          languagesToShow.length > 0 &&
          languagesToShow[0].grammarNotes
        ) {
          grammarNote = languagesToShow[0].grammarNotes;
        }

        // 문법 설명이 있으면 추가
        if (grammarNote) {
          exampleContent += `
            <div class="mt-2 pt-2 border-t border-gray-200">
              <span class="text-xs text-gray-600 font-medium">${getTranslatedText(
                "grammar"
              )}:</span>
              <p class="text-xs text-gray-500 italic ml-2">${grammarNote}</p>
            </div>
          `;
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
      (example) =>
        example[currentLang] ||
        example[sourceLanguage] ||
        example[targetLanguage]
    );

    if (filteredExamples.length > 0) {
      filteredExamples.forEach((example, index) => {
        const exampleDiv = document.createElement("div");
        exampleDiv.className = "border p-4 rounded mb-4 bg-gray-50";

        let exampleContent = "";

        // 예문 순서: 대상언어 → 원본언어 → 현재언어
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

        // 2. 원본언어 추가 (대상언어와 다르고 있는 경우)
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

        // 3. 현재 탭 언어 추가 (대상언어 및 원본언어와 다르고 있는 경우)
        if (
          example[currentLang] &&
          currentLang !== targetLanguage &&
          currentLang !== sourceLanguage
        ) {
          languagesToShow.push({
            code: currentLang,
            name: getLanguageName(currentLang),
            text: example[currentLang],
            label: "(현재)",
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
