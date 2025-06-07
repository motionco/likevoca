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

// 문법 패턴 로드 (간소화)
async function loadGrammarPatterns() {
  try {
    showLoading();
    allGrammarPatterns = [];

    console.log("문법 패턴 로딩 시작...");

    // 1. grammar_patterns 컬렉션에서 먼저 로드 시도 (하이브리드 구조)
    try {
      console.log("grammar_patterns 컬렉션에서 로딩 시도...");
      const patternsRef = collection(db, "grammar_patterns");
      const patternsQuery = query(patternsRef, limit(100));

      const patternsSnapshot = await getDocs(patternsQuery);
      console.log(
        `grammar_patterns 컬렉션에서 ${patternsSnapshot.size}개 문서 발견`
      );

      if (patternsSnapshot.size > 0) {
        patternsSnapshot.forEach((doc) => {
          const data = doc.data();
          console.log("grammar_patterns 문서 구조:", Object.keys(data));

          // 하이브리드 구조의 문법 패턴 데이터 처리
          const grammarPattern = {
            id: doc.id,
            source: "grammar_patterns",
            pattern_name: data.pattern_name || data.name || "문법 패턴",
            structural_pattern:
              data.structural_pattern || data.structure || "기본 구조",
            grammar_tags: data.grammar_tags || data.tags || [],
            complexity_level:
              data.complexity_level || data.complexity || "basic",
            learning_focus: data.learning_focus || data.focus_areas || [],
            difficulty: data.difficulty || "beginner",
            frequency: data.frequency || "medium",
            domain: data.domain || "general",
            category: data.category || "grammar",
            featured_examples: data.featured_examples || [],
            teaching_notes: data.teaching_notes || {},
            created_at: data.created_at,
            updated_at: data.updated_at,
            ...data, // 나머지 모든 필드 포함
          };

          allGrammarPatterns.push(grammarPattern);
        });

        console.log(
          `하이브리드 구조에서 ${allGrammarPatterns.length}개 문법 패턴 로드 완료`
        );
      }
    } catch (patternsError) {
      console.warn("grammar_patterns 컬렉션 조회 실패:", patternsError);
    }

    // 2. grammar_patterns에서 데이터가 부족하면 examples 컬렉션에서 보완
    if (allGrammarPatterns.length < 5) {
      try {
        console.log("examples 컬렉션에서 보완 로딩 시도...");
        const examplesRef = collection(db, "examples");
        const examplesQuery = query(examplesRef, limit(50));

        const examplesSnapshot = await getDocs(examplesQuery);
        console.log(`examples 컬렉션에서 ${examplesSnapshot.size}개 문서 발견`);

        examplesSnapshot.forEach((doc) => {
          const data = doc.data();

          // examples 컬렉션에서 문법 패턴 생성 (실제 DB 구조 반영)
          const grammarPattern = {
            id: `example_${doc.id}`,
            concept_id: data.concept_id || doc.id,
            source: "examples",
            // learning_metadata나 context에서 패턴명 추출 시도
            pattern_name:
              data.learning_metadata?.pattern_name ||
              data.context?.pattern_type ||
              generateMeaningfulPatternName(data),
            structural_pattern:
              data.learning_metadata?.structural_pattern ||
              data.context?.structure ||
              extractStructureFromTranslations(data.translations) ||
              "기본 구조",
            grammar_tags:
              data.learning_metadata?.grammar_tags ||
              data.context?.tags ||
              extractTagsFromPatternId(data.grammar_pattern_id) ||
              [],
            complexity_level: data.learning_metadata?.complexity || "basic",
            learning_focus:
              data.learning_metadata?.focus_areas ||
              extractFocusFromContext(data.context) ||
              [],
            difficulty: data.difficulty || "beginner",
            frequency: data.learning_metadata?.frequency || "medium",
            domain: data.learning_metadata?.domain || "general",
            category: "grammar",
            example_translations: data.translations || {},
            teaching_notes: data.learning_metadata?.notes || {},
            concept_data: {
              id: data.concept_id,
              translations: data.translations,
            },
            related_concepts: data.related_concepts || [],
            usage_examples: [data], // 현재 예문을 usage_examples에 포함
            created_at: data.created_at,
            updated_at: data.updated_at,
          };

          allGrammarPatterns.push(grammarPattern);
        });

        console.log(
          `examples에서 보완하여 총 ${allGrammarPatterns.length}개 문법 패턴 로드`
        );
      } catch (examplesError) {
        console.error("examples 컬렉션 조회도 실패:", examplesError);
      }
    }

    // 3. 데이터가 여전히 부족하면 샘플 데이터 추가
    if (allGrammarPatterns.length === 0) {
      console.log("실제 데이터가 없어 샘플 데이터 추가...");
      addSampleGrammarPatterns();
    }

    console.log(`📚 총 ${allGrammarPatterns.length}개 문법 패턴 로드 완료`);

    // 필터링 및 표시
    filterAndDisplayPatterns();
  } catch (error) {
    console.error("❌ 문법 패턴 로드 중 오류:", error);
    showError("문법 패턴을 불러오는데 실패했습니다: " + error.message);

    // 오류 발생 시에도 샘플 데이터라도 표시
    addSampleGrammarPatterns();
    filterAndDisplayPatterns();
  } finally {
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
      grammar_tags: ["present_tense", "basic_sentence"],
      complexity_level: "basic",
      learning_focus: ["현재시제", "기본문장구조"],
      difficulty: "beginner",
      frequency: "high",
      domain: "daily",
      category: "grammar",
      example_translations: {
        korean: { text: "나는 사과를 먹어요." },
        english: { text: "I eat an apple." },
      },
      teaching_notes: {
        primary_focus: "현재 시제의 기본 구조",
        practice_suggestions: ["단순 문장 연습"],
      },
    },
    {
      id: "sample_past_tense",
      source: "sample",
      pattern_name: "과거 시제",
      structural_pattern: "주어 + 과거동사 + 목적어",
      grammar_tags: ["past_tense"],
      complexity_level: "basic",
      learning_focus: ["과거시제"],
      difficulty: "beginner",
      frequency: "high",
      domain: "daily",
      category: "grammar",
      example_translations: {
        korean: { text: "어제 영화를 봤어요." },
        english: { text: "I watched a movie yesterday." },
      },
      teaching_notes: {
        primary_focus: "과거 시제 표현",
        practice_suggestions: ["일기 쓰기"],
      },
    },
    {
      id: "sample_question_form",
      source: "sample",
      pattern_name: "의문문 만들기",
      structural_pattern: "의문사 + 주어 + 동사?",
      grammar_tags: ["interrogative"],
      complexity_level: "intermediate",
      learning_focus: ["의문문"],
      difficulty: "intermediate",
      frequency: "high",
      domain: "conversation",
      category: "expression",
      example_translations: {
        korean: { text: "뭐 하고 있어요?" },
        english: { text: "What are you doing?" },
      },
      teaching_notes: {
        primary_focus: "의문문 구조",
        practice_suggestions: ["질문-답변 연습"],
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

  console.log("필터링 시작:", {
    totalPatterns: allGrammarPatterns.length,
    targetLanguage,
    difficulty,
    patternType,
    domain,
  });

  // 필터링
  filteredPatterns = allGrammarPatterns.filter((pattern) => {
    console.log("패턴 필터링 확인:", {
      id: pattern.id,
      difficulty: pattern.difficulty,
      domain: pattern.domain,
      hasExampleTranslations: !!pattern.example_translations,
      hasFeaturedExamples: !!pattern.featured_examples?.length,
      hasUsageExamples: !!pattern.usage_examples?.length,
    });

    // 난이도 필터
    if (difficulty !== "all" && pattern.difficulty !== difficulty) {
      console.log("난이도 필터링됨:", pattern.id, pattern.difficulty);
      return false;
    }

    // 패턴 유형 필터
    if (patternType !== "all") {
      const hasPatternType = pattern.grammar_tags?.some(
        (tag) => tag.includes(patternType) || pattern.category === patternType
      );
      if (!hasPatternType) {
        console.log("패턴 유형 필터링됨:", pattern.id);
        return false;
      }
    }

    // 도메인 필터
    if (domain !== "all" && pattern.domain !== domain) {
      console.log("도메인 필터링됨:", pattern.id, pattern.domain);
      return false;
    }

    // 하이브리드 구조 지원: 다양한 방식으로 예문 확인
    const hasExample =
      pattern.example_translations?.[targetLanguage] ||
      pattern.featured_examples?.length > 0 ||
      pattern.usage_examples?.length > 0 ||
      pattern.pattern_name; // 최소한 패턴 이름이라도 있으면 표시

    if (!hasExample) {
      console.log("예문 없어서 필터링됨:", pattern.id);
      return false;
    }

    console.log("✅ 필터링 통과:", pattern.id);
    return true;
  });

  console.log(`필터링 결과: ${filteredPatterns.length}개 패턴`);

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
  const example =
    pattern.example_translations?.[targetLanguage] ||
    pattern.example_translations?.korean ||
    {};
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

// 전역 함수: 패턴 ID로 모달 열기
window.openPatternModal = function (patternId) {
  console.log("모달 열기 시도:", patternId);
  const pattern = allGrammarPatterns.find((p) => p.id === patternId);
  if (pattern) {
    showPatternDetail(pattern);
  } else {
    console.error("패턴을 찾을 수 없습니다:", patternId);
  }
};

// 전역 함수: showPatternDetail을 전역에서 접근 가능하게 만들기
window.showPatternDetail = showPatternDetail;

// 패턴 모달 표시 (복원된 이전 UI)
function showPatternDetail(pattern) {
  console.log("선택된 패턴:", pattern);

  // 모달 요소 가져오기 (HTML ID와 맞춤)
  const modal = document.getElementById("pattern-detail-modal");
  const modalTitle = document.getElementById("pattern-modal-title");
  const modalBody = document.getElementById("pattern-modal-content");

  if (!modal || !modalTitle || !modalBody) {
    console.error("모달 요소를 찾을 수 없습니다.");
    return;
  }

  // 모달 제목 설정
  modalTitle.textContent = pattern.pattern_name || "문법 패턴";

  // 모달 내용 생성 (학습 정보 중심)
  const content = `
    <div class="grammar-pattern-detail space-y-4">
      <!-- 문법 구조 -->
      <div class="pattern-structure-section bg-blue-50 p-4 rounded-lg">
        <h3 class="font-bold text-lg mb-2">문법 구조</h3>
        <p class="text-gray-800 font-medium">${
          pattern.structural_pattern || "기본 문장 구조"
        }</p>
      </div>

      <!-- 예문 -->
      ${generateExamplesFromPattern(pattern)}

      <!-- 문법 태그 및 학습 포인트 -->
      <div class="learning-info-section bg-green-50 p-4 rounded-lg">
        <h3 class="font-bold text-lg mb-3">학습 정보</h3>
        
        ${
          pattern.grammar_tags && pattern.grammar_tags.length > 0
            ? `
          <div class="mb-3">
            <span class="font-medium text-gray-700">문법 태그:</span>
            <div class="flex flex-wrap gap-2 mt-2">
              ${pattern.grammar_tags
                .map(
                  (tag) =>
                    `<span class="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">${tag}</span>`
                )
                .join("")}
            </div>
          </div>
        `
            : ""
        }

        ${
          pattern.learning_focus && pattern.learning_focus.length > 0
            ? `
          <div class="mb-3">
            <span class="font-medium text-gray-700">학습 포인트:</span>
            <ul class="mt-2 space-y-1">
              ${pattern.learning_focus
                .map((focus) => `<li class="text-gray-800">• ${focus}</li>`)
                .join("")}
            </ul>
          </div>
        `
            : ""
        }

        <div class="grid grid-cols-2 gap-4 text-sm mt-3">
          <div>
            <span class="font-medium text-gray-700">난이도:</span>
            <span class="ml-2 px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">${getDifficultyText(
              pattern.difficulty
            )}</span>
          </div>
          <div>
            <span class="font-medium text-gray-700">복잡도:</span>
            <span class="ml-2">${getComplexityText(
              pattern.complexity_level
            )}</span>
          </div>
        </div>
      </div>

      <!-- 학습 노트 -->
      ${
        pattern.teaching_notes
          ? generateTeachingNotes(pattern.teaching_notes)
          : ""
      }
    </div>
  `;

  modalBody.innerHTML = content;
  modal.classList.remove("hidden");
}

// DB 예문을 활용한 예문 생성
function generateExamplesFromPattern(pattern) {
  let examplesHtml = "";

  // example_translations에서 예문 추출
  if (pattern.example_translations) {
    const korean = pattern.example_translations.korean?.text;
    const english = pattern.example_translations.english?.text;

    if (korean || english) {
      examplesHtml = `
        <div class="examples-section bg-gray-50 p-4 rounded-lg">
          <h3 class="font-bold text-lg mb-3">예문</h3>
          <div class="space-y-2">
            ${
              korean ? `<p class="text-gray-800 font-medium">${korean}</p>` : ""
            }
            ${english ? `<p class="text-gray-600">${english}</p>` : ""}
          </div>
        </div>
      `;
    }
  }

  // 대체 예문 (이전 버전 호환)
  if (!examplesHtml && pattern.example_korean && pattern.example_english) {
    examplesHtml = `
      <div class="examples-section bg-gray-50 p-4 rounded-lg">
        <h3 class="font-bold text-lg mb-3">예문</h3>
        <div class="space-y-2">
          <p class="text-gray-800 font-medium">${pattern.example_korean}</p>
          <p class="text-gray-600">${pattern.example_english}</p>
        </div>
      </div>
    `;
  }

  return examplesHtml || "";
}

// 예문 내용 생성 (간소화)
function generateExamplesContent(pattern) {
  return generateExamplesFromPattern(pattern);
}

// 단어 표현 생성
function generateWordExpressions(expressions) {
  if (!expressions || Object.keys(expressions).length === 0) {
    return '<p class="text-gray-600">관련 단어 정보가 없습니다.</p>';
  }

  let content = "";

  // 한국어와 영어만 표시
  const koreanExpr = expressions.korean;
  const englishExpr = expressions.english;

  if (koreanExpr?.word) {
    content += `
      <div class="word-expression mb-2 flex items-center">
        <span class="font-medium text-gray-700 w-16">한국어:</span>
        <span class="ml-2">${koreanExpr.word}</span>
        ${
          koreanExpr.pronunciation
            ? `<span class="text-gray-500 ml-2">[${koreanExpr.pronunciation}]</span>`
            : ""
        }
      </div>
    `;
  }

  if (englishExpr?.word) {
    content += `
      <div class="word-expression mb-2 flex items-center">
        <span class="font-medium text-gray-700 w-16">영어:</span>
        <span class="ml-2">${englishExpr.word}</span>
        ${
          englishExpr.definition
            ? `<span class="text-gray-600 ml-2">- ${englishExpr.definition}</span>`
            : ""
        }
      </div>
    `;
  }

  return content || '<p class="text-gray-600">관련 단어 정보가 없습니다.</p>';
}

// 학습 노트 생성
function generateTeachingNotes(notes) {
  let content = "";

  if (notes.primary_focus || notes.usage_context) {
    content += `
      <div class="note-item p-3 bg-yellow-50 rounded-lg">
        <div class="text-sm font-medium text-gray-700">핵심 포인트</div>
        <div class="text-gray-800">${
          notes.primary_focus || notes.usage_context || "기본 문법 학습"
        }</div>
      </div>
    `;
  }

  if (notes.common_mistakes && Array.isArray(notes.common_mistakes)) {
    content += `
      <div class="note-item p-3 bg-yellow-50 rounded-lg">
        <div class="text-sm font-medium text-gray-700">주의사항</div>
        <div class="text-gray-800">${notes.common_mistakes.join(", ")}</div>
      </div>
    `;
  }

  if (notes.practice_suggestions && Array.isArray(notes.practice_suggestions)) {
    content += `
      <div class="note-item p-3 bg-yellow-50 rounded-lg">
        <div class="text-sm font-medium text-gray-700">연습 방법</div>
        <div class="text-gray-800">${notes.practice_suggestions.join(
          ", "
        )}</div>
      </div>
    `;
  }

  if (notes.practice_tips && Array.isArray(notes.practice_tips)) {
    content += `
      <div class="note-item p-3 bg-yellow-50 rounded-lg">
        <div class="text-sm font-medium text-gray-700">학습 팁</div>
        <div class="text-gray-800">${notes.practice_tips.join(", ")}</div>
      </div>
    `;
  }

  if (notes.difficulty_explanation) {
    content += `
      <div class="note-item p-3 bg-yellow-50 rounded-lg">
        <div class="text-sm font-medium text-gray-700">난이도 설명</div>
        <div class="text-gray-800">${notes.difficulty_explanation}</div>
      </div>
    `;
  }

  return content || '<p class="text-gray-600">학습 가이드가 없습니다.</p>';
}

// 언어 이름 변환
function getLanguageName(langCode) {
  const langNames = {
    korean: "한국어",
    english: "영어",
    japanese: "일본어",
    chinese: "중국어",
  };
  return langNames[langCode] || langCode;
}

// 난이도 텍스트 변환
function getDifficultyText(difficulty) {
  const difficultyMap = {
    beginner: "초급",
    intermediate: "중급",
    advanced: "고급",
    basic: "기초",
  };
  return difficultyMap[difficulty] || difficulty;
}

// 복잡도 텍스트 변환
function getComplexityText(complexity) {
  const complexityMap = {
    basic: "기초",
    intermediate: "중간",
    advanced: "고급",
    expert: "전문가",
  };
  return complexityMap[complexity] || complexity;
}

// 도메인 텍스트 변환
function getDomainText(domain) {
  const domainMap = {
    daily: "일상",
    business: "비즈니스",
    academic: "학술",
    travel: "여행",
    food: "음식",
    general: "일반",
  };
  return domainMap[domain] || domain;
}

// 카테고리 텍스트 변환
function getCategoryText(category) {
  const categoryMap = {
    greeting: "인사",
    fruit: "과일",
    food: "음식",
    grammar: "문법",
    verb: "동사",
    noun: "명사",
    general: "일반",
  };
  return categoryMap[category] || category;
}

// 패턴 모달 닫기
function closePatternModal() {
  const modal = document.getElementById("pattern-detail-modal");
  if (modal) {
    modal.classList.add("hidden");
  }
}

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

// DB 데이터에서 문법 정보 추출을 위한 헬퍼 함수들
function extractStructureFromTranslations(translations) {
  if (!translations) return null;

  // 한국어와 영어 예문에서 구조 패턴 추론
  const korean = translations.korean?.text || "";
  const english = translations.english?.text || "";
  const combined = (korean + " " + english).toLowerCase();

  if (korean && english) {
    // 인사말 패턴
    if (
      combined.includes("hello") ||
      combined.includes("hi") ||
      combined.includes("안녕") ||
      combined.includes("meet") ||
      korean.includes("만나") ||
      english.includes("nice to meet")
    ) {
      return "인사 + 응답 표현";
    }

    // 의문문 패턴
    if (
      korean.includes("?") ||
      english.includes("?") ||
      korean.includes("뭐") ||
      korean.includes("어디") ||
      korean.includes("언제") ||
      english.includes("what") ||
      english.includes("where") ||
      english.includes("when")
    ) {
      return "의문사 + 주어 + 동사";
    }

    // 과거시제 패턴
    if (
      korean.includes("었") ||
      korean.includes("았") ||
      english.includes("ed") ||
      english.includes("was") ||
      english.includes("were")
    ) {
      return "주어 + 과거동사 + 목적어";
    }

    // 현재진행형
    if (english.includes("ing") || korean.includes("고 있")) {
      return "주어 + be동사 + 현재분사";
    }

    // 기본 현재시제
    if (korean.includes("요") && !korean.includes("?")) {
      return "주어 + 동사 + 목적어";
    }
  }

  return "기본 대화 표현";
}

function extractTagsFromPatternId(patternId) {
  if (!patternId) return [];

  const tags = [];
  const idLower = patternId.toLowerCase();

  // 더 구체적인 패턴 매칭
  if (
    idLower.includes("greeting") ||
    idLower.includes("hello") ||
    idLower.includes("meet")
  ) {
    tags.push("greeting", "introduction");
  }
  if (idLower.includes("question") || idLower.includes("interrogative")) {
    tags.push("interrogative", "question");
  }
  if (idLower.includes("past")) {
    tags.push("past_tense");
  }
  if (idLower.includes("present")) {
    tags.push("present_tense");
  }
  if (idLower.includes("daily")) {
    tags.push("daily_conversation");
  }
  if (idLower.includes("basic")) {
    tags.push("basic_sentence");
  }

  return tags;
}

function extractFocusFromContext(context) {
  if (!context) return [];

  const focus = [];
  const contextStr = JSON.stringify(context).toLowerCase();

  if (
    contextStr.includes("greeting") ||
    contextStr.includes("hello") ||
    contextStr.includes("meet")
  ) {
    focus.push("인사표현");
  }
  if (contextStr.includes("tense")) {
    focus.push("시제");
  }
  if (contextStr.includes("question") || contextStr.includes("interrogative")) {
    focus.push("의문문");
  }
  if (contextStr.includes("daily") || contextStr.includes("conversation")) {
    focus.push("일상대화");
  }
  if (contextStr.includes("basic") || contextStr.includes("fundamental")) {
    focus.push("기본문법");
  }

  return focus;
}

// 패턴명을 더 의미있게 생성하는 함수
function generateMeaningfulPatternName(data) {
  const patternId = data.grammar_pattern_id || "";
  const korean = data.translations?.korean?.text || "";
  const english = data.translations?.english?.text || "";

  // 패턴 ID에서 의미 추출
  if (patternId.includes("greeting")) {
    return "인사말 표현";
  }
  if (patternId.includes("question")) {
    return "질문하기";
  }
  if (patternId.includes("introduction")) {
    return "자기소개";
  }
  if (patternId.includes("daily")) {
    return "일상 대화";
  }

  // 예문 내용에서 추론
  const combined = (korean + " " + english).toLowerCase();
  if (
    combined.includes("hello") ||
    combined.includes("meet") ||
    korean.includes("안녕") ||
    korean.includes("만나")
  ) {
    return "인사 및 만남 표현";
  }
  if (korean.includes("?") || english.includes("?")) {
    return "의문문 만들기";
  }

  // 기본값
  return `대화 패턴 (${patternId.split("_").pop() || "basic"})`;
}

// 전역 함수 설정
window.showPatternDetail = showPatternDetail;
