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
    grammar: "문법",
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

// 문법 용어 번역 테이블
const grammarTranslations = {
  ko: {
    // 영어 문법 용어
    "simple present tense": "현재 시제",
    "present tense": "현재 시제",
    "simple past tense": "과거 시제",
    "past tense": "과거 시제",
    "simple future tense": "미래 시제",
    "future tense": "미래 시제",
    "present continuous": "현재 진행형",
    "past continuous": "과거 진행형",
    "future continuous": "미래 진행형",
    "present perfect": "현재 완료형",
    "past perfect": "과거 완료형",
    "future perfect": "미래 완료형",
    "present perfect continuous": "현재 완료 진행형",
    "past perfect continuous": "과거 완료 진행형",
    "future perfect continuous": "미래 완료 진행형",
    "modal verb": "조동사",
    "auxiliary verb": "조동사",
    "passive voice": "수동태",
    "active voice": "능동태",
    conditional: "조건문",
    subjunctive: "가정법",
    imperative: "명령문",
    gerund: "동명사",
    infinitive: "부정사",
    participle: "분사",
    "present participle": "현재분사",
    "past participle": "과거분사",
    comparative: "비교급",
    superlative: "최상급",
    "countable noun": "가산명사",
    "uncountable noun": "불가산명사",
    plural: "복수형",
    singular: "단수형",
    article: "관사",
    "definite article": "정관사",
    "indefinite article": "부정관사",
    preposition: "전치사",
    conjunction: "접속사",
    adverb: "부사",
    adjective: "형용사",
    pronoun: "대명사",
    "relative clause": "관계절",
    "subordinate clause": "종속절",
    "main clause": "주절",

    // 일본어 문법 용어
    hiragana: "히라가나",
    katakana: "가타카나",
    kanji: "한자",
    keigo: "경어",
    sonkeigo: "존경어",
    kenjougo: "겸양어",
    teineigo: "정중어",
    "masu form": "마스형",
    "te form": "테형",
    "potential form": "가능형",
    "causative form": "사역형",
    "passive form": "수동형",
    "volitional form": "의지형",
    "conditional form": "조건형",
    "imperative form": "명령형",
    "negative form": "부정형",
    "past tense": "과거형",
    "present tense": "현재형",
    particle: "조사",
    "wa particle": "는/은 조사",
    "ga particle": "가/이 조사",
    "wo particle": "를/을 조사",
    "ni particle": "에 조사",
    "de particle": "에서 조사",
    "to particle": "와/과 조사",

    // 중국어 문법 용어
    pinyin: "병음",
    tone: "성조",
    "first tone": "1성",
    "second tone": "2성",
    "third tone": "3성",
    "fourth tone": "4성",
    "neutral tone": "경성",
    "measure word": "양사",
    classifier: "양사",
    "sentence final particle": "문말사",
    "aspect marker": "상 표지",
    "perfective aspect": "완료상",
    "progressive aspect": "진행상",
    "experiential aspect": "경험상",
  },
  en: {
    // 기본적으로 영어는 그대로 유지
    "simple present tense": "simple present tense",
    "present tense": "present tense",
    "simple past tense": "simple past tense",
    "past tense": "past tense",
    // ... 나머지도 그대로
  },
  ja: {
    // 영어 문법 용어를 일본어로
    "simple present tense": "現在時制",
    "present tense": "現在時制",
    "simple past tense": "過去時制",
    "past tense": "過去時制",
    "simple future tense": "未来時制",
    "future tense": "未来時制",
    "present continuous": "現在進行形",
    "past continuous": "過去進行形",
    "future continuous": "未来進行形",
    "present perfect": "現在完了形",
    "past perfect": "過去完了形",
    "future perfect": "未来完了形",
    "modal verb": "助動詞",
    "auxiliary verb": "助動詞",
    "passive voice": "受動態",
    "active voice": "能動態",
    conditional: "条件文",
    subjunctive: "仮定法",
    imperative: "命令文",
    gerund: "動名詞",
    infinitive: "不定詞",
    participle: "分詞",
    "present participle": "現在分詞",
    "past participle": "過去分詞",
    comparative: "比較級",
    superlative: "最上級",
    "countable noun": "可算名詞",
    "uncountable noun": "不可算名詞",
    plural: "複数形",
    singular: "単数形",
    article: "冠詞",
    "definite article": "定冠詞",
    "indefinite article": "不定冠詞",
    preposition: "前置詞",
    conjunction: "接続詞",
    adverb: "副詞",
    adjective: "形容詞",
    pronoun: "代名詞",

    // 일본어 문법 용어는 그대로
    hiragana: "ひらがな",
    katakana: "カタカナ",
    kanji: "漢字",
    keigo: "敬語",
    "masu form": "ます形",
    "te form": "て形",
    particle: "助詞",
  },
  zh: {
    // 영어 문법 용어를 중국어로
    "simple present tense": "一般现在时",
    "present tense": "现在时",
    "simple past tense": "一般过去时",
    "past tense": "过去时",
    "simple future tense": "一般将来时",
    "future tense": "将来时",
    "present continuous": "现在进行时",
    "past continuous": "过去进行时",
    "future continuous": "将来进行时",
    "present perfect": "现在完成时",
    "past perfect": "过去完成时",
    "future perfect": "将来完成时",
    "modal verb": "情态动词",
    "auxiliary verb": "助动词",
    "passive voice": "被动语态",
    "active voice": "主动语态",
    conditional: "条件句",
    subjunctive: "虚拟语气",
    imperative: "祈使句",
    gerund: "动名词",
    infinitive: "不定式",
    participle: "分词",
    "present participle": "现在分词",
    "past participle": "过去分词",
    comparative: "比较级",
    superlative: "最高级",
    "countable noun": "可数名词",
    "uncountable noun": "不可数名词",
    plural: "复数",
    singular: "单数",
    article: "冠词",
    "definite article": "定冠词",
    "indefinite article": "不定冠词",
    preposition: "介词",
    conjunction: "连词",
    adverb: "副词",
    adjective: "形容词",
    pronoun: "代词",

    // 중국어 문법 용어는 그대로
    pinyin: "拼音",
    tone: "声调",
    "measure word": "量词",
    classifier: "量词",
  },
};

// 다국어 번역 텍스트 가져오기 함수
function getTranslatedText(key) {
  return pageTranslations[userLanguage][key] || pageTranslations.en[key] || key;
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

  // 이모지 설정 개선
  const emoji =
    concept.concept_info?.emoji ||
    concept.unicode_emoji ||
    concept.concept_info?.unicode_emoji ||
    "📝";
  document.getElementById("concept-view-emoji").textContent = emoji;
  console.log("이모지 설정:", emoji, "원본 데이터:", concept.concept_info);

  document.getElementById("concept-primary-word").textContent =
    primaryExpr?.word || "N/A";
  document.getElementById("concept-primary-pronunciation").textContent =
    primaryExpr?.pronunciation || "";

  // 카테고리와 도메인을 사용자 언어에 맞게 번역
  const categoryKey =
    concept.concept_info?.category || concept.category || "general";
  const domainKey = concept.concept_info?.domain || concept.domain || "general";

  const translatedCategory = getTranslatedText(categoryKey);
  const translatedDomain = getTranslatedText(domainKey);

  document.getElementById(
    "concept-category-domain"
  ).textContent = `${translatedDomain}/${translatedCategory}`;

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

        // 대상 언어에 맞는 문법 설명 찾기
        if (
          targetLanguage &&
          example.translations[targetLanguage]?.grammar_notes
        ) {
          grammarNote = example.translations[targetLanguage].grammar_notes;
        }
        // 대상 언어가 없거나 문법 설명이 없으면 첫 번째 언어의 문법 설명 사용
        else if (
          languagesToShow.length > 0 &&
          languagesToShow[0].grammarNotes
        ) {
          grammarNote = languagesToShow[0].grammarNotes;
        }

        // 문법 설명이 있으면 추가
        if (grammarNote) {
          // 문법 설명을 환경 언어로 번역
          const translatedGrammarNote = translateGrammarNote(grammarNote);

          exampleContent += `
            <div class="mt-2 pt-2 border-t border-gray-200">
              <p class="text-xs text-gray-500 italic">${translatedGrammarNote}</p>
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

// 문법 설명을 환경 언어로 번역하는 함수
function translateGrammarNote(grammarNote) {
  if (!grammarNote || !userLanguage) return grammarNote;

  const translations = grammarTranslations[userLanguage];
  if (!translations) return grammarNote;

  // 소문자로 변환해서 매칭 시도
  const lowerNote = grammarNote.toLowerCase();

  // 정확히 일치하는 번역이 있는지 확인
  if (translations[lowerNote]) {
    return translations[lowerNote];
  }

  // 부분 일치 시도 (더 긴 용어부터 확인)
  const sortedKeys = Object.keys(translations).sort(
    (a, b) => b.length - a.length
  );

  for (const key of sortedKeys) {
    if (lowerNote.includes(key)) {
      return grammarNote.replace(new RegExp(key, "gi"), translations[key]);
    }
  }

  // 번역이 없으면 원본 반환
  return grammarNote;
}
