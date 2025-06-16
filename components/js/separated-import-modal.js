import {
  auth,
  db,
  conceptUtils,
  supportedLanguages,
  serverTimestamp,
} from "../../js/firebase/firebase-init.js";
import { collectionManager } from "../../js/firebase/firebase-collection-manager.js";
import { readFile } from "./csv-parser-utils.js";

// 전역 변수
let currentTab = "concepts";
let selectedFiles = {
  concepts: null,
  examples: null,
  grammar: null,
};

export function initialize() {
  console.log("분리된 대량 가져오기 모달 초기화");

  setupTabNavigation();
  setupEventListeners();
}

function setupTabNavigation() {
  const tabs = ["concepts", "examples", "grammar"];

  tabs.forEach((tabName) => {
    const tabButton = document.getElementById(`${tabName}-tab`);
    const tabContent = document.getElementById(`${tabName}-content`);

    if (tabButton) {
      tabButton.addEventListener("click", () => {
        // 모든 탭 비활성화
        tabs.forEach((t) => {
          document
            .getElementById(`${t}-tab`)
            ?.classList.remove("active", "text-blue-600", "border-blue-600");
          document.getElementById(`${t}-tab`)?.classList.add("text-gray-600");
          document.getElementById(`${t}-content`)?.classList.add("hidden");
        });

        // 선택된 탭 활성화
        tabButton.classList.remove("text-gray-600");
        tabButton.classList.add("active", "text-blue-600", "border-blue-600");
        tabContent?.classList.remove("hidden");

        currentTab = tabName;
      });
    }
  });
}

function setupEventListeners() {
  // 모달 닫기
  const closeBtn = document.getElementById("close-separated-modal");
  const cancelBtn = document.getElementById("cancel-separated-import");

  if (closeBtn) closeBtn.addEventListener("click", closeModal);
  if (cancelBtn) cancelBtn.addEventListener("click", closeModal);

  // 각 탭별 이벤트 리스너 설정
  setupTabEventListeners("concepts");
  setupTabEventListeners("examples");
  setupTabEventListeners("grammar");
}

function setupTabEventListeners(tabName) {
  // 파일 선택 버튼
  const browseBtn = document.getElementById(`browse-${tabName}-file`);
  const fileInput = document.getElementById(`${tabName}-file-input`);
  const fileName = document.getElementById(`${tabName}-file-name`);
  const uploadBtn = document.getElementById(`upload-${tabName}`);
  const downloadBtn = document.getElementById(`download-${tabName}-template`);

  if (browseBtn && fileInput) {
    browseBtn.addEventListener("click", () => fileInput.click());

    fileInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        selectedFiles[tabName] = file;
        fileName.textContent = `선택된 파일: ${file.name}`;
        uploadBtn.disabled = false;
      }
    });
  }

  if (uploadBtn) {
    uploadBtn.addEventListener("click", () => uploadFile(tabName));
  }

  if (downloadBtn) {
    downloadBtn.addEventListener("click", () => downloadTemplate(tabName));
  }
}

function closeModal() {
  const modal = document.getElementById("separated-import-modal");
  if (modal) {
    modal.classList.add("hidden");

    // 초기화
    selectedFiles = { concepts: null, examples: null, grammar: null };
    ["concepts", "examples", "grammar"].forEach((tab) => {
      const fileName = document.getElementById(`${tab}-file-name`);
      const uploadBtn = document.getElementById(`upload-${tab}`);
      const progressDiv = document.getElementById(`${tab}-progress`);

      if (fileName) fileName.textContent = "";
      if (uploadBtn) uploadBtn.disabled = true;
      if (progressDiv) progressDiv.classList.add("hidden");
    });
  }
}

async function uploadFile(tabName) {
  const file = selectedFiles[tabName];
  if (!file) return;

  const formatSelect = document.getElementById(`${tabName}-format`);
  const format = formatSelect.value;
  const progressDiv = document.getElementById(`${tabName}-progress`);
  const progressBar = document.getElementById(`${tabName}-progress-bar`);
  const statusDiv = document.getElementById(`${tabName}-status`);

  try {
    progressDiv.classList.remove("hidden");
    statusDiv.textContent = "파일을 읽는 중...";
    progressBar.style.width = "20%";

    const fileContent = await readFile(file);
    let data;

    if (format === "json") {
      data = JSON.parse(fileContent);
    } else {
      data = parseCSV(fileContent, tabName);
    }

    statusDiv.textContent = "데이터를 처리하는 중...";
    progressBar.style.width = "50%";

    // 컬렉션별 업로드 처리
    let result;
    switch (tabName) {
      case "concepts":
        result = await uploadConcepts(data);
        break;
      case "examples":
        result = await uploadExamples(data);
        break;
      case "grammar":
        result = await uploadGrammarPatterns(data);
        break;
    }

    progressBar.style.width = "100%";
    statusDiv.textContent = `업로드 완료: ${result.success}개 성공, ${result.errors}개 실패`;

    setTimeout(() => {
      progressDiv.classList.add("hidden");
    }, 3000);
  } catch (error) {
    console.error(`${tabName} 업로드 오류:`, error);
    statusDiv.textContent = `오류 발생: ${error.message}`;
    progressBar.style.width = "0%";
  }
}

async function uploadConcepts(data) {
  const concepts = Array.isArray(data) ? data : [data];
  let success = 0;
  let errors = 0;

  for (const conceptData of concepts) {
    try {
      const conceptDoc = {
        concept_info: conceptData.concept_info || {
          domain: conceptData.domain || "general",
          category: conceptData.category || "uncategorized",
          difficulty: conceptData.difficulty || "beginner",
          unicode_emoji: conceptData.emoji || "📝",
          color_theme: conceptData.color_theme || "#9C27B0",
          tags: conceptData.tags || [],
          updated_at: new Date(),
        },
        expressions: conceptData.expressions || {},
        representative_example: conceptData.representative_example || null,
        learning_metadata: {
          pattern_name: null,
          structural_pattern: null,
          learning_weight: 5,
          quiz_eligible: true,
          game_eligible: true,
        },
        created_at: serverTimestamp(),
      };

      await collectionManager.createConcept(conceptDoc);
      success++;
    } catch (error) {
      console.error("개념 업로드 오류:", error);
      errors++;
    }
  }

  return { success, errors };
}

async function uploadExamples(data) {
  const examples = Array.isArray(data) ? data : [data];
  let success = 0;
  let errors = 0;

  for (const exampleData of examples) {
    try {
      const exampleDoc = {
        example_id:
          exampleData.example_id ||
          `example_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        domain: exampleData.domain || "general",
        category: exampleData.category || "common",
        context: exampleData.context || "general",
        difficulty: exampleData.difficulty || "beginner",
        tags: exampleData.tags || [],
        translations: exampleData.translations || {},
        learning_metadata: {
          pattern_name: exampleData.learning_metadata?.pattern_name || null,
          structural_pattern:
            exampleData.learning_metadata?.structural_pattern || null,
          learning_weight: exampleData.learning_metadata?.learning_weight || 5,
          quiz_eligible: exampleData.learning_metadata?.quiz_eligible !== false,
          game_eligible: exampleData.learning_metadata?.game_eligible !== false,
        },
      };

      await collectionManager.createExample(exampleDoc);
      success++;
    } catch (error) {
      console.error("예문 업로드 오류:", error);
      errors++;
    }
  }

  return { success, errors };
}

async function uploadGrammarPatterns(data) {
  const patterns = Array.isArray(data) ? data : [data];
  let success = 0;
  let errors = 0;

  for (const patternData of patterns) {
    try {
      const patternDoc = {
        pattern_id:
          patternData.pattern_id ||
          `pattern_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        pattern_name: patternData.pattern_name || "기본 패턴",
        pattern_type: patternData.pattern_type || "basic",
        domain: patternData.domain || "general",
        category: patternData.category || "common",
        difficulty: patternData.difficulty || "beginner",
        tags: patternData.tags || [],
        learning_focus: patternData.learning_focus || [],
        structural_pattern: patternData.structural_pattern || "",
        explanations: patternData.explanations || {},
        usage_examples: patternData.usage_examples || [],
      };

      await collectionManager.createGrammarPattern(patternDoc);
      success++;
    } catch (error) {
      console.error("문법 패턴 업로드 오류:", error);
      errors++;
    }
  }

  return { success, errors };
}

function downloadTemplate(tabName) {
  switch (tabName) {
    case "concepts":
      downloadConceptsTemplate();
      break;
    case "examples":
      downloadExamplesTemplate();
      break;
    case "grammar":
      downloadGrammarTemplate();
      break;
  }
}

function downloadConceptsTemplate() {
  const formatSelect = document.getElementById("concepts-format");
  const format = formatSelect.value;

  if (format === "json") {
    downloadConceptsJSONTemplate();
  } else {
    downloadConceptsCSVTemplate();
  }
}

function downloadConceptsJSONTemplate() {
  const template = [
    {
      concept_info: {
        domain: "daily",
        category: "fruit",
        difficulty: "beginner",
        unicode_emoji: "🍎",
        color_theme: "#FF6B6B",
        tags: ["food", "healthy", "common"],
      },
      expressions: {
        korean: {
          word: "사과",
          pronunciation: "sa-gwa",
          definition: "둥글고 빨간 과일",
          part_of_speech: "명사",
          level: "beginner",
          synonyms: ["능금"],
          antonyms: [],
          word_family: ["과일", "음식"],
          compound_words: ["사과나무", "사과즙"],
          collocations: ["빨간 사과", "맛있는 사과"],
        },
        english: {
          word: "apple",
          pronunciation: "/ˈæpəl/",
          definition: "a round fruit with red or green skin",
          part_of_speech: "noun",
          level: "beginner",
          synonyms: [],
          antonyms: [],
          word_family: ["fruit", "food"],
          compound_words: ["apple tree", "apple juice"],
          collocations: ["red apple", "sweet apple"],
        },
      },
      representative_example: {
        example_id: "apple_rep_example",
        context: "daily_meal",
        difficulty: "beginner",
        translations: {
          korean: {
            text: "아침에 사과를 먹어요.",
            romanization: "achime sagwareul meogeoyo",
          },
          english: {
            text: "I eat an apple in the morning.",
            phonetic: "/aɪ iːt æn ˈæpəl ɪn ðə ˈmɔrnɪŋ/",
          },
        },
      },
    },
  ];

  downloadJSON(template, "concepts_template.json");
}

function downloadConceptsCSVTemplate() {
  const headers = [
    "domain",
    "category",
    "emoji",
    "difficulty",
    "tags",
    "korean_word",
    "korean_pronunciation",
    "korean_definition",
    "korean_part_of_speech",
    "english_word",
    "english_pronunciation",
    "english_definition",
    "english_part_of_speech",
    "representative_example_korean",
    "representative_example_english",
  ];

  const sampleData = [
    [
      "daily",
      "fruit",
      "🍎",
      "beginner",
      "food|healthy|common",
      "사과",
      "sa-gwa",
      "둥글고 빨간 과일",
      "명사",
      "apple",
      "/ˈæpəl/",
      "a round fruit with red or green skin",
      "noun",
      "아침에 사과를 먹어요.",
      "I eat an apple in the morning.",
    ],
  ];

  downloadCSV([headers, ...sampleData], "concepts_template.csv");
}

function downloadExamplesTemplate() {
  const formatSelect = document.getElementById("examples-format");
  const format = formatSelect.value;

  if (format === "json") {
    downloadExamplesJSONTemplate();
  } else {
    downloadExamplesCSVTemplate();
  }
}

function downloadExamplesJSONTemplate() {
  const template = [
    {
      example_id: "example_001",
      domain: "daily",
      category: "routine",
      context: "daily_conversation",
      difficulty: "beginner",
      tags: ["greeting", "polite", "formal"],
      translations: {
        korean: {
          text: "안녕하세요! 처음 뵙겠습니다.",
          romanization: "annyeonghaseyo! cheoeum boepgetseumnida",
        },
        english: {
          text: "Hello! Nice to meet you for the first time.",
          phonetic: "/həˈloʊ naɪs tu mit ju fɔr ðə fɜrst taɪm/",
        },
        japanese: {
          text: "こんにちは！初めてお会いします。",
          romanization: "konnichiwa! hajimete oai shimasu",
        },
        chinese: {
          text: "你好！初次见面。",
          pinyin: "nǐ hǎo! chū cì jiàn miàn",
        },
      },
    },
    {
      example_id: "example_002",
      domain: "food",
      category: "fruit",
      context: "restaurant",
      difficulty: "beginner",
      tags: ["food", "ordering", "restaurant"],
      translations: {
        korean: {
          text: "사과 주스 하나 주세요.",
          romanization: "sagwa juseu hana juseyo",
        },
        english: {
          text: "Please give me one apple juice.",
          phonetic: "/pliːz ɡɪv mi wʌn ˈæpəl ʤus/",
        },
        japanese: {
          text: "りんごジュースを一つください。",
          romanization: "ringo juusu wo hitotsu kudasai",
        },
        chinese: {
          text: "请给我一杯苹果汁。",
          pinyin: "qǐng gěi wǒ yī bēi píng guǒ zhī",
        },
      },
    },
  ];

  downloadJSON(template, "examples_template.json");
}

function downloadExamplesCSVTemplate() {
  const headers = [
    "example_id",
    "domain",
    "category",
    "context",
    "difficulty",
    "tags",
    "korean_text",
    "korean_romanization",
    "english_text",
    "english_phonetic",
    "japanese_text",
    "japanese_romanization",
    "chinese_text",
    "chinese_pinyin",
  ];

  const sampleData = [
    [
      "example_001",
      "daily",
      "routine",
      "daily_conversation",
      "beginner",
      "greeting|polite|formal",
      "안녕하세요! 처음 뵙겠습니다.",
      "annyeonghaseyo! cheoeum boepgetseumnida",
      "Hello! Nice to meet you for the first time.",
      "/həˈloʊ naɪs tu mit ju fɔr ðə fɜrst taɪm/",
      "こんにちは！初めてお会いします。",
      "konnichiwa! hajimete oai shimasu",
      "你好！初次见面。",
      "nǐ hǎo! chū cì jiàn miàn",
    ],
  ];

  downloadCSV([headers, ...sampleData], "examples_template.csv");
}

function downloadGrammarTemplate() {
  const formatSelect = document.getElementById("grammar-format");
  const format = formatSelect.value;

  if (format === "json") {
    downloadGrammarJSONTemplate();
  } else {
    downloadGrammarCSVTemplate();
  }
}

function downloadGrammarJSONTemplate() {
  const template = [
    {
      pattern_id: "pattern_001",
      pattern_name: "기본 인사",
      pattern_type: "greeting",
      domain: "daily",
      category: "routine",
      difficulty: "beginner",
      tags: ["greeting", "basic", "daily"],
      learning_focus: ["pronunciation", "usage"],
      structural_pattern: "안녕하세요",
      explanations: {
        korean: "가장 기본적인 인사 표현입니다.",
        english: "Basic greeting expression.",
        japanese: "基本的な挨拶表現です。",
        chinese: "最基本的问候表达。",
      },
      usage_examples: [
        {
          korean: "안녕하세요! 만나서 반갑습니다.",
          english: "Hello! Nice to meet you.",
          japanese: "こんにちは！お会いできて嬉しいです。",
          chinese: "你好！很高兴见到你。",
        },
      ],
    },
    {
      pattern_id: "pattern_002",
      pattern_name: "음식 주문",
      pattern_type: "request",
      domain: "food",
      category: "drink",
      difficulty: "beginner",
      tags: ["food", "request", "restaurant"],
      learning_focus: ["grammar", "vocabulary"],
      structural_pattern: "___을/를 주세요",
      explanations: {
        korean: "음식이나 물건을 정중하게 요청할 때 사용합니다.",
        english: "Used to politely request food or items.",
        japanese: "食べ物や物を丁寧に頼む時に使います。",
        chinese: "用于礼貌地请求食物或物品。",
      },
      usage_examples: [
        {
          korean: "김치찌개를 주세요.",
          english: "Please give me kimchi stew.",
          japanese: "キムチチゲをください。",
          chinese: "请给我泡菜汤。",
        },
      ],
    },
  ];

  downloadJSON(template, "grammar_template.json");
}

function downloadGrammarCSVTemplate() {
  const headers = [
    "pattern_id",
    "pattern_name",
    "pattern_type",
    "domain",
    "category",
    "difficulty",
    "tags",
    "learning_focus",
    "structural_pattern",
    "korean_explanation",
    "english_explanation",
    "japanese_explanation",
    "chinese_explanation",
  ];

  const sampleData = [
    [
      "pattern_001",
      "기본 인사",
      "greeting",
      "daily",
      "routine",
      "beginner",
      "greeting|basic|daily",
      "pronunciation|usage",
      "안녕하세요",
      "가장 기본적인 인사 표현입니다.",
      "Basic greeting expression.",
      "基本的な挨拶表現です。",
      "最基本的问候表达。",
    ],
  ];

  downloadCSV([headers, ...sampleData], "grammar_template.csv");
}

// 유틸리티 함수들 (readFile은 csv-parser-utils.js에서 import)
function parseCSV(content, tabName) {
  const lines = content.split("\n");
  const headers = lines[0].split(",").map((h) => h.trim());
  const data = [];

  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim()) {
      const values = lines[i].split(",").map((v) => v.trim());
      const item = {};

      headers.forEach((header, index) => {
        item[header] = values[index] || "";
      });

      // 탭별 특수 처리
      if (tabName === "concepts") {
        data.push(convertCSVToConcept(item));
      } else if (tabName === "examples") {
        data.push(convertCSVToExample(item));
      } else if (tabName === "grammar") {
        data.push(convertCSVToGrammar(item));
      }
    }
  }

  return data;
}

function convertCSVToConcept(item) {
  return {
    concept_info: {
      domain: item.domain || "general",
      category: item.category || "uncategorized",
      difficulty: item.difficulty || "beginner",
      unicode_emoji: item.emoji || "📝",
      tags: item.tags ? item.tags.split("|") : [],
    },
    expressions: {
      korean: {
        word: item.korean_word || "",
        pronunciation: item.korean_pronunciation || "",
        definition: item.korean_definition || "",
        part_of_speech: item.korean_part_of_speech || "noun",
      },
      english: {
        word: item.english_word || "",
        pronunciation: item.english_pronunciation || "",
        definition: item.english_definition || "",
        part_of_speech: item.english_part_of_speech || "noun",
      },
    },
    representative_example:
      item.representative_example_korean || item.representative_example_english
        ? {
            example_id: `${item.korean_word || "concept"}_rep_example`,
            context: "general",
            difficulty: item.difficulty || "beginner",
            translations: {
              korean: { text: item.representative_example_korean || "" },
              english: { text: item.representative_example_english || "" },
            },
          }
        : null,
  };
}

function convertCSVToExample(item) {
  return {
    example_id: item.example_id || `example_${Date.now()}`,
    domain: item.domain || "general",
    category: item.category || "common",
    context: item.context || "general",
    difficulty: item.difficulty || "beginner",
    tags: item.tags ? item.tags.split("|") : [],
    translations: {
      korean: {
        text: item.korean_text || "",
        romanization: item.korean_romanization || "",
      },
      english: {
        text: item.english_text || "",
        phonetic: item.english_phonetic || "",
      },
      japanese: {
        text: item.japanese_text || "",
        romanization: item.japanese_romanization || "",
      },
    },
  };
}

function convertCSVToGrammar(item) {
  return {
    pattern_id: item.pattern_id || `pattern_${Date.now()}`,
    pattern_name: item.pattern_name || "기본 패턴",
    pattern_type: item.pattern_type || "basic",
    domain: item.domain || "general",
    category: item.category || "common",
    difficulty: item.difficulty || "beginner",
    tags: item.tags ? item.tags.split("|") : [],
    learning_focus: item.learning_focus ? item.learning_focus.split("|") : [],
    structural_pattern: item.structural_pattern || "",
    explanations: {
      korean: item.korean_explanation || "",
      english: item.english_explanation || "",
      japanese: item.japanese_explanation || "",
      chinese: item.chinese_explanation || "",
    },
    usage_examples: item.usage_examples ? JSON.parse(item.usage_examples) : [],
  };
}

function downloadJSON(data, filename) {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function downloadCSV(data, filename) {
  const csvContent = data.map((row) => row.join(",")).join("\n");
  const blob = new Blob([csvContent], { type: "text/csv" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// 전역 함수로 내보내기
window.openSeparatedImportModal = function () {
  const modal = document.getElementById("separated-import-modal");
  if (modal) {
    modal.classList.remove("hidden");

    // 첫 번째 탭 활성화
    document.getElementById("concepts-tab")?.click();
  }
};
