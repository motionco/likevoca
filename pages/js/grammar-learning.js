import { loadNavbar } from "../../components/js/navbar.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
import {
  auth,
  db,
  supportedLanguages,
} from "../../js/firebase/firebase-init.js";
import {
  collection,
  query,
  getDocs,
  orderBy,
  where,
  limit,
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";
import { getActiveLanguage } from "../../utils/language-utils.js";

let currentUser = null;
let allGrammarPatterns = [];
let filteredPatterns = [];
let userLanguage = "ko";

// 페이지별 번역 키
const grammarTranslations = {
  ko: {
    loading: "로딩 중...",
    no_patterns: "문법 패턴이 없습니다",
    filter_reset: "필터 초기화",
    pattern_details: "패턴 상세",
    examples: "예문",
    usage_notes: "사용법",
    difficulty: "난이도",
    frequency: "빈도",
    all: "전체",
    beginner: "초급",
    intermediate: "중급",
    advanced: "고급",
    tense: "시제",
    grammar: "문법",
    expression: "표현",
    conversation: "회화",
    daily: "일상",
    business: "비즈니스",
    academic: "학술",
    travel: "여행",
  },
  en: {
    loading: "Loading...",
    no_patterns: "No grammar patterns found",
    filter_reset: "Reset Filters",
    pattern_details: "Pattern Details",
    examples: "Examples",
    usage_notes: "Usage Notes",
    difficulty: "Difficulty",
    frequency: "Frequency",
    all: "All",
    beginner: "Beginner",
    intermediate: "Intermediate",
    advanced: "Advanced",
    tense: "Tense",
    grammar: "Grammar",
    expression: "Expression",
    conversation: "Conversation",
    daily: "Daily",
    business: "Business",
    academic: "Academic",
    travel: "Travel",
  },
};

// 번역 텍스트 가져오기
function getTranslatedText(key) {
  return (
    grammarTranslations[userLanguage]?.[key] ||
    grammarTranslations.en[key] ||
    key
  );
}

document.addEventListener("DOMContentLoaded", async () => {
  try {
    // 현재 활성화된 언어 코드 가져오기
    userLanguage = await getActiveLanguage();

    // 네비게이션바 로드
    await loadNavbar();

    // 이벤트 리스너 등록
    setupEventListeners();

    // 사용자 인증 상태 관찰
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        currentUser = user;
        await loadGrammarPatterns();
      } else {
        alert("로그인이 필요합니다.");
        window.location.href = "../login.html";
      }
    });
  } catch (error) {
    console.error("문법 학습 페이지 초기화 중 오류 발생:", error);
    showError("페이지를 불러오는 중 문제가 발생했습니다.");
  }
});

// 이벤트 리스너 설정
function setupEventListeners() {
  const elements = {
    targetLanguage: document.getElementById("target-language"),
    refreshBtn: document.getElementById("refresh-patterns"),
    difficultyFilter: document.getElementById("difficulty-filter"),
    patternTypeFilter: document.getElementById("pattern-type-filter"),
    domainFilter: document.getElementById("domain-filter"),
    sortPatterns: document.getElementById("sort-patterns"),
  };

  // 언어 변경
  if (elements.targetLanguage) {
    elements.targetLanguage.addEventListener("change", () => {
      filterAndDisplayPatterns();
    });
  }

  // 새로고침
  if (elements.refreshBtn) {
    elements.refreshBtn.addEventListener("click", () => {
      loadGrammarPatterns();
    });
  }

  // 필터링
  [
    "difficultyFilter",
    "patternTypeFilter",
    "domainFilter",
    "sortPatterns",
  ].forEach((filterId) => {
    const element = elements[filterId];
    if (element) {
      element.addEventListener("change", () => {
        filterAndDisplayPatterns();
      });
    }
  });
}

// 문법 패턴 로드
async function loadGrammarPatterns() {
  try {
    showLoading();
    allGrammarPatterns = [];

    console.log("문법 패턴 로딩 시작...");

    // 1. grammar_patterns 컬렉션에서 패턴 가져오기 (분리된 컬렉션)
    try {
      const grammarPatternsRef = collection(db, "grammar_patterns");
      const grammarQuery = query(
        grammarPatternsRef,
        orderBy("frequency", "desc"),
        limit(100)
      );

      const grammarSnapshot = await getDocs(grammarQuery);

      grammarSnapshot.forEach((doc) => {
        const data = doc.data();
        data.id = doc.id;
        data.source = "grammar_patterns";
        allGrammarPatterns.push(data);
      });

      console.log(
        `grammar_patterns 컬렉션: ${grammarSnapshot.size}개 패턴 로딩`
      );
    } catch (error) {
      console.warn("grammar_patterns 컬렉션 조회 실패:", error);
    }

    // 2. concepts 컬렉션에서 문법 정보가 있는 개념들 가져오기
    try {
      const conceptsRef = collection(db, "concepts");
      const conceptsQuery = query(conceptsRef, limit(50));

      const conceptsSnapshot = await getDocs(conceptsQuery);

      conceptsSnapshot.forEach((doc) => {
        const data = doc.data();

        // featured_examples에서 문법 정보 추출
        if (data.featured_examples && Array.isArray(data.featured_examples)) {
          data.featured_examples.forEach((example, index) => {
            if (example.grammar_system) {
              const grammarPattern = {
                id: `${doc.id}_example_${index}`,
                concept_id: doc.id,
                source: "concepts",
                pattern_name:
                  example.grammar_system.pattern_name || "기본 패턴",
                structural_pattern:
                  example.grammar_system.structural_pattern || "",
                grammar_tags: example.grammar_system.grammar_tags || [],
                complexity_level:
                  example.grammar_system.complexity_level || "basic",
                learning_focus: example.grammar_system.learning_focus || [],
                difficulty: example.difficulty || "beginner",
                frequency: "medium",
                domain: data.concept_info?.domain || "general",
                category: data.concept_info?.category || "general",
                example_translations: example.translations || {},
                teaching_notes: example.grammar_system.teaching_notes || {},
              };

              allGrammarPatterns.push(grammarPattern);
            }
          });
        }
      });

      console.log(
        `concepts 컬렉션에서 추출된 문법 패턴: ${
          allGrammarPatterns.filter((p) => p.source === "concepts").length
        }개`
      );
    } catch (error) {
      console.warn("concepts 컬렉션 조회 실패:", error);
    }

    // 3. 기본 샘플 패턴 추가 (데이터가 없는 경우)
    if (allGrammarPatterns.length === 0) {
      addSampleGrammarPatterns();
    }

    console.log(`총 ${allGrammarPatterns.length}개 문법 패턴 로딩 완료`);

    filterAndDisplayPatterns();
    hideLoading();
  } catch (error) {
    console.error("문법 패턴 로딩 중 오류:", error);
    showError("문법 패턴을 불러오는 중 오류가 발생했습니다.");
    hideLoading();
  }
}

// 기본 샘플 문법 패턴 추가
function addSampleGrammarPatterns() {
  const samplePatterns = [
    {
      id: "sample_present_tense",
      source: "sample",
      pattern_name: "현재 시제 기본형",
      structural_pattern: "주어 + 동사 + 목적어",
      grammar_tags: ["present_tense", "basic_sentence", "declarative"],
      complexity_level: "basic",
      learning_focus: ["현재시제", "기본문장구조"],
      difficulty: "beginner",
      frequency: "high",
      domain: "daily",
      category: "grammar",
      example_translations: {
        korean: { text: "나는 사과를 먹어요." },
        english: { text: "I eat an apple." },
        japanese: { text: "私はりんごを食べます。" },
        chinese: { text: "我吃苹果。" },
      },
      teaching_notes: {
        primary_focus: "현재 시제의 기본 구조",
        common_mistakes: ["시제 혼동", "어순 오류"],
        practice_suggestions: ["단순 문장 연습", "시제 변환 연습"],
      },
    },
    {
      id: "sample_past_tense",
      source: "sample",
      pattern_name: "과거 시제",
      structural_pattern: "주어 + 과거동사 + 목적어",
      grammar_tags: ["past_tense", "narrative", "completed_action"],
      complexity_level: "basic",
      learning_focus: ["과거시제", "완료표현"],
      difficulty: "beginner",
      frequency: "high",
      domain: "daily",
      category: "grammar",
      example_translations: {
        korean: { text: "어제 영화를 봤어요." },
        english: { text: "I watched a movie yesterday." },
        japanese: { text: "昨日映画を見ました。" },
        chinese: { text: "昨天我看了电影。" },
      },
      teaching_notes: {
        primary_focus: "과거 시제 표현",
        common_mistakes: ["시제 표시 오류", "불규칙 동사"],
        practice_suggestions: ["일기 쓰기", "과거 경험 말하기"],
      },
    },
    {
      id: "sample_question_form",
      source: "sample",
      pattern_name: "의문문 만들기",
      structural_pattern: "의문사 + 주어 + 동사?",
      grammar_tags: ["interrogative", "question_formation", "wh_question"],
      complexity_level: "intermediate",
      learning_focus: ["의문문", "의문사활용"],
      difficulty: "intermediate",
      frequency: "high",
      domain: "conversation",
      category: "expression",
      example_translations: {
        korean: { text: "뭐 하고 있어요?" },
        english: { text: "What are you doing?" },
        japanese: { text: "何をしていますか？" },
        chinese: { text: "你在做什么？" },
      },
      teaching_notes: {
        primary_focus: "의문문 구조와 의문사 사용",
        common_mistakes: ["어순 혼동", "의문사 선택 오류"],
        practice_suggestions: ["질문-답변 연습", "일상 대화 시뮬레이션"],
      },
    },
  ];

  allGrammarPatterns.push(...samplePatterns);
  console.log(`${samplePatterns.length}개 샘플 문법 패턴 추가됨`);
}

// 필터링 및 표시
function filterAndDisplayPatterns() {
  const targetLanguage = document.getElementById("target-language").value;
  const difficulty = document.getElementById("difficulty-filter").value;
  const patternType = document.getElementById("pattern-type-filter").value;
  const domain = document.getElementById("domain-filter").value;
  const sortOption = document.getElementById("sort-patterns").value;

  // 필터링
  filteredPatterns = allGrammarPatterns.filter((pattern) => {
    // 난이도 필터
    if (difficulty !== "all" && pattern.difficulty !== difficulty) {
      return false;
    }

    // 패턴 유형 필터
    if (patternType !== "all") {
      const hasPatternType = pattern.grammar_tags?.some(
        (tag) => tag.includes(patternType) || pattern.category === patternType
      );
      if (!hasPatternType) return false;
    }

    // 도메인 필터
    if (domain !== "all" && pattern.domain !== domain) {
      return false;
    }

    // 대상 언어에 예문이 있는지 확인
    if (!pattern.example_translations?.[targetLanguage]) {
      return false;
    }

    return true;
  });

  // 정렬
  sortPatterns(sortOption);

  // 표시
  displayGrammarPatterns();
}

// 정렬
function sortPatterns(sortOption) {
  switch (sortOption) {
    case "frequency":
      filteredPatterns.sort((a, b) => {
        const freqOrder = { high: 3, medium: 2, low: 1 };
        return (freqOrder[b.frequency] || 0) - (freqOrder[a.frequency] || 0);
      });
      break;
    case "difficulty":
      filteredPatterns.sort((a, b) => {
        const diffOrder = { beginner: 1, intermediate: 2, advanced: 3 };
        return (diffOrder[a.difficulty] || 0) - (diffOrder[b.difficulty] || 0);
      });
      break;
    case "alphabetical":
      filteredPatterns.sort((a, b) =>
        (a.pattern_name || "").localeCompare(b.pattern_name || "")
      );
      break;
    case "recent":
      // 최근 추가된 순 (ID 기준)
      filteredPatterns.sort((a, b) => (b.id || "").localeCompare(a.id || ""));
      break;
  }
}

// 문법 패턴 표시
function displayGrammarPatterns() {
  const container = document.getElementById("grammar-patterns-container");
  const emptyState = document.getElementById("empty-state");

  if (!container) return;

  if (filteredPatterns.length === 0) {
    container.innerHTML = "";
    if (emptyState) {
      emptyState.classList.remove("hidden");
    }
    return;
  }

  if (emptyState) {
    emptyState.classList.add("hidden");
  }

  const targetLanguage = document.getElementById("target-language").value;

  container.innerHTML = filteredPatterns
    .map((pattern) => createPatternCard(pattern, targetLanguage))
    .join("");
}

// 패턴 카드 생성
function createPatternCard(pattern, targetLanguage) {
  const example = pattern.example_translations?.[targetLanguage] || {};
  const difficultyColors = {
    beginner: "bg-green-100 text-green-800",
    intermediate: "bg-yellow-100 text-yellow-800",
    advanced: "bg-red-100 text-red-800",
  };

  const frequencyColors = {
    high: "bg-blue-100 text-blue-800",
    medium: "bg-gray-100 text-gray-800",
    low: "bg-gray-100 text-gray-600",
  };

  return `
    <div class="grammar-card bg-white rounded-lg shadow-md p-6 cursor-pointer" 
         onclick="openPatternModal('${pattern.id}')">
      <div class="flex items-start justify-between mb-4">
        <div class="flex-1">
          <h3 class="text-lg font-semibold text-gray-800 mb-2">
            ${pattern.pattern_name || "패턴"}
          </h3>
          <p class="text-sm text-gray-600 mb-3">
            ${pattern.structural_pattern || "구조 정보 없음"}
          </p>
        </div>
        <div class="flex flex-col gap-1">
          <span class="text-xs px-2 py-1 rounded-full ${
            difficultyColors[pattern.difficulty] || difficultyColors.beginner
          }">
            ${getTranslatedText(pattern.difficulty)}
          </span>
          <span class="text-xs px-2 py-1 rounded-full ${
            frequencyColors[pattern.frequency] || frequencyColors.medium
          }">
            ${pattern.frequency || "medium"}
          </span>
        </div>
      </div>

      ${
        example.text
          ? `
        <div class="bg-gray-50 p-3 rounded-lg mb-3">
          <p class="text-gray-800 font-medium">${example.text}</p>
        </div>
      `
          : ""
      }

      <div class="flex items-center justify-between text-xs text-gray-500">
        <span class="flex items-center">
          <i class="fas fa-tag mr-1"></i>
          ${getTranslatedText(
            pattern.domain || "general"
          )} / ${getTranslatedText(pattern.category || "general")}
        </span>
        <span class="flex items-center">
          <i class="fas fa-lightbulb mr-1"></i>
          ${(pattern.learning_focus || []).length}개 학습 포인트
        </span>
      </div>
    </div>
  `;
}

// 패턴 모달 열기
window.openPatternModal = function (patternId) {
  const pattern = allGrammarPatterns.find((p) => p.id === patternId);
  if (!pattern) return;

  const modal = document.getElementById("pattern-detail-modal");
  const title = document.getElementById("pattern-modal-title");
  const content = document.getElementById("pattern-modal-content");

  if (!modal || !title || !content) return;

  title.textContent = pattern.pattern_name || "패턴 상세";

  const targetLanguage = document.getElementById("target-language").value;
  const example = pattern.example_translations?.[targetLanguage] || {};

  content.innerHTML = `
    <div class="space-y-6">
      <!-- 기본 정보 -->
      <div class="bg-gray-50 p-4 rounded-lg">
        <h3 class="font-semibold mb-2">패턴 구조</h3>
        <p class="text-gray-700">${
          pattern.structural_pattern || "구조 정보 없음"
        }</p>
      </div>

      <!-- 예문 -->
      ${
        example.text
          ? `
        <div>
          <h3 class="font-semibold mb-2">${getTranslatedText("examples")}</h3>
          <div class="bg-blue-50 p-4 rounded-lg">
            <p class="text-gray-800 font-medium">${example.text}</p>
          </div>
        </div>
      `
          : ""
      }

      <!-- 학습 포인트 -->
      ${
        pattern.learning_focus && pattern.learning_focus.length > 0
          ? `
        <div>
          <h3 class="font-semibold mb-2">학습 포인트</h3>
          <div class="flex flex-wrap gap-2">
            ${pattern.learning_focus
              .map(
                (focus) =>
                  `<span class="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">${focus}</span>`
              )
              .join("")}
          </div>
        </div>
      `
          : ""
      }

      <!-- 문법 태그 -->
      ${
        pattern.grammar_tags && pattern.grammar_tags.length > 0
          ? `
        <div>
          <h3 class="font-semibold mb-2">문법 태그</h3>
          <div class="flex flex-wrap gap-2">
            ${pattern.grammar_tags
              .map(
                (tag) =>
                  `<span class="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">${tag}</span>`
              )
              .join("")}
          </div>
        </div>
      `
          : ""
      }

      <!-- 사용법 -->
      ${
        pattern.teaching_notes?.practice_suggestions
          ? `
        <div>
          <h3 class="font-semibold mb-2">${getTranslatedText(
            "usage_notes"
          )}</h3>
          <ul class="space-y-1">
            ${pattern.teaching_notes.practice_suggestions
              .map(
                (suggestion) => `<li class="text-gray-700">• ${suggestion}</li>`
              )
              .join("")}
          </ul>
        </div>
      `
          : ""
      }
    </div>
  `;

  modal.classList.remove("hidden");
};

// 패턴 모달 닫기
window.closePatternModal = function () {
  const modal = document.getElementById("pattern-detail-modal");
  if (modal) {
    modal.classList.add("hidden");
  }
};

// 필터 초기화
window.resetFilters = function () {
  document.getElementById("difficulty-filter").value = "all";
  document.getElementById("pattern-type-filter").value = "all";
  document.getElementById("domain-filter").value = "all";
  document.getElementById("sort-patterns").value = "frequency";
  filterAndDisplayPatterns();
};

// 로딩 표시
function showLoading() {
  const spinner = document.getElementById("loading-spinner");
  const container = document.getElementById("grammar-patterns-container");

  if (spinner) spinner.classList.remove("hidden");
  if (container) container.innerHTML = "";
}

// 로딩 숨김
function hideLoading() {
  const spinner = document.getElementById("loading-spinner");
  if (spinner) spinner.classList.add("hidden");
}

// 오류 표시
function showError(message) {
  const container = document.getElementById("grammar-patterns-container");
  if (container) {
    container.innerHTML = `
      <div class="col-span-full text-center py-8 text-red-500">
        <i class="fas fa-exclamation-triangle text-2xl mb-2"></i>
        <p>${message}</p>
      </div>
    `;
  }
}
