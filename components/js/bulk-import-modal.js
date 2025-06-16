import {
  auth,
  db,
  conceptUtils,
  supportedLanguages,
  serverTimestamp,
} from "../../js/firebase/firebase-init.js";
import {
  GRAMMAR_TAGS,
  validateGrammarTags,
  getGrammarTagHeaders,
  grammarTagsFromCSV,
  grammarTagsToCSV,
} from "../../js/grammar-tags-system.js";
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
          const btn = document.getElementById(`${t}-tab`);
          const content = document.getElementById(`${t}-content`);
          if (btn && content) {
            btn.classList.remove("text-blue-600", "border-blue-600");
            btn.classList.add("text-gray-600");
            content.classList.add("hidden");
          }
        });

        // 선택된 탭 활성화
        tabButton.classList.remove("text-gray-600");
        tabButton.classList.add("text-blue-600", "border-blue-600");
        if (tabContent) {
          tabContent.classList.remove("hidden");
        }

        currentTab = tabName;
        console.log(`탭 변경: ${tabName}`);
      });
    }
  });
}

function setupEventListeners() {
  // 모달 닫기
  const closeBtn = document.getElementById("close-bulk-modal");
  const cancelBtn = document.getElementById("cancel-import");

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
  const uploadBtn = document.getElementById(`start-${tabName}-import`);
  const downloadBtn = document.getElementById(`download-${tabName}-template`);

  if (browseBtn && fileInput) {
    browseBtn.addEventListener("click", () => fileInput.click());

    fileInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        selectedFiles[tabName] = file;
        fileName.textContent = `선택된 파일: ${file.name}`;
        uploadBtn.disabled = false;
        uploadBtn.classList.remove("bg-gray-400");
        uploadBtn.classList.add("bg-blue-500", "hover:bg-blue-600");
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
  const modal = document.getElementById("bulk-import-modal");
  if (modal) {
    modal.classList.add("hidden");

    // 초기화
    selectedFiles = { concepts: null, examples: null, grammar: null };
    ["concepts", "examples", "grammar"].forEach((tab) => {
      const fileName = document.getElementById(`${tab}-file-name`);
      const uploadBtn = document.getElementById(`start-${tab}-import`);
      const progressDiv = document.getElementById(`${tab}-import-status`);

      if (fileName)
        fileName.textContent = `${
          tab === "concepts"
            ? "개념"
            : tab === "examples"
            ? "예문"
            : "문법 패턴"
        } 파일을 선택하세요.`;
      if (uploadBtn) {
        uploadBtn.disabled = true;
        uploadBtn.classList.add("bg-gray-400");
        uploadBtn.classList.remove(
          "bg-blue-500",
          "hover:bg-blue-600",
          "bg-green-500",
          "hover:bg-green-600",
          "bg-purple-500",
          "hover:bg-purple-600"
        );
      }
      if (progressDiv) progressDiv.classList.add("hidden");
    });
  }
}

async function uploadFile(tabName) {
  const file = selectedFiles[tabName];
  if (!file) return;

  const formatSelect = document.getElementById(`${tabName}-import-mode`);
  const format = formatSelect.value;
  const progressDiv = document.getElementById(`${tabName}-import-status`);
  const progressBar = document.getElementById(`${tabName}-import-progress`);
  const statusDiv = document.getElementById(`${tabName}-import-result`);

  try {
    progressDiv.classList.remove("hidden");
    statusDiv.textContent = "파일을 읽는 중...";
    progressBar.style.width = "20%";

    const fileContent = await readFileContent(file);
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
          created_from: "separated_import",
          import_date: new Date(),
          version: "3.0",
          structure_type: "separated_collections",
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

  // 개념 추가 완료 이벤트 발생
  if (success > 0) {
    window.dispatchEvent(new CustomEvent("concepts-bulk-saved"));
    console.log("📦 대량 개념 추가 완료 이벤트 발생");
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
        context: exampleData.context || "general",
        difficulty: exampleData.difficulty || "beginner",
        tags: exampleData.tags || [],
        translations: exampleData.translations || {},
        metadata: {
          created_from: "separated_import",
          import_date: new Date(),
          version: "3.0",
        },
        created_at: serverTimestamp(),
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
        difficulty: patternData.difficulty || "beginner",
        tags: patternData.tags || [],
        learning_focus: patternData.learning_focus || [],
        structural_pattern: patternData.structural_pattern || "",
        explanations: patternData.explanations || {},
        usage_examples: patternData.usage_examples || [],
        teaching_notes: patternData.teaching_notes || {},
        created_at: serverTimestamp(),
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
  const formatSelect = document.getElementById(`${tabName}-import-mode`);
  const format = formatSelect.value;

  switch (tabName) {
    case "concepts":
      if (format === "json") {
        downloadConceptsJSONTemplate();
      } else {
        downloadConceptsCSVTemplate();
      }
      break;
    case "examples":
      if (format === "json") {
        downloadExamplesJSONTemplate();
      } else {
        downloadExamplesCSVTemplate();
      }
      break;
    case "grammar":
      if (format === "json") {
        downloadGrammarJSONTemplate();
      } else {
        downloadGrammarCSVTemplate();
      }
      break;
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
          collocations: ["red apple", "fresh apple"],
        },
        chinese: {
          word: "苹果",
          pronunciation: "píng guǒ",
          definition: "圆形的红色或绿色水果",
          part_of_speech: "名词",
          level: "beginner",
          synonyms: ["苹子"],
          antonyms: [],
          word_family: ["水果", "食物"],
          compound_words: ["苹果树", "苹果汁"],
          collocations: ["红苹果", "新鲜苹果"],
        },
        japanese: {
          word: "りんご",
          pronunciation: "ringo",
          definition: "赤いまたは緑色の丸い果物",
          part_of_speech: "名詞",
          level: "beginner",
          synonyms: ["アップル"],
          antonyms: [],
          word_family: ["果物", "食べ物"],
          compound_words: ["りんごの木", "りんごジュース"],
          collocations: ["赤いりんご", "新鮮なりんご"],
        },
      },
      representative_example: {
        translations: {
          korean: "나는 빨간 사과를 좋아한다.",
          english: "I like red apples.",
          chinese: "我喜欢红苹果。",
          japanese: "私は赤いりんごが好きです。",
        },
        context: "daily_conversation",
        difficulty: "beginner",
      },
    },
  ];

  downloadJSON(template, "concepts_template.json");
}

function downloadConceptsCSVTemplate() {
  const csvContent = `domain,category,difficulty,unicode_emoji,color_theme,tags,korean_word,korean_pronunciation,korean_definition,korean_part_of_speech,korean_level,korean_synonyms,korean_word_family,korean_compound_words,korean_collocations,english_word,english_pronunciation,english_definition,english_part_of_speech,english_level,english_synonyms,english_word_family,english_compound_words,english_collocations,chinese_word,chinese_pronunciation,chinese_definition,chinese_part_of_speech,chinese_level,chinese_synonyms,chinese_word_family,chinese_compound_words,chinese_collocations,japanese_word,japanese_pronunciation,japanese_definition,japanese_part_of_speech,japanese_level,japanese_synonyms,japanese_word_family,japanese_compound_words,japanese_collocations,example_korean,example_english,example_chinese,example_japanese,example_context,example_difficulty
daily,fruit,beginner,🍎,#FF6B6B,"food,healthy,common",사과,sa-gwa,둥글고 빨간 과일,명사,beginner,능금,"과일,음식","사과나무,사과즙","빨간 사과,맛있는 사과",apple,/ˈæpəl/,a round fruit with red or green skin,noun,beginner,,"fruit,food","apple tree,apple juice","red apple,fresh apple",苹果,píng guǒ,圆形的红色或绿色水果,名词,beginner,苹子,"水果,食物","苹果树,苹果汁","红苹果,新鲜苹果",りんご,ringo,赤いまたは緑色の丸い果物,名詞,beginner,アップル,"果物,食べ物","りんごの木,りんごジュース","赤いりんご,新鮮なりんご",나는 빨간 사과를 좋아한다.,I like red apples.,我喜欢红苹果。,私は赤いりんごが好きです。,daily_conversation,beginner`;

  downloadCSV(csvContent, "concepts_template.csv");
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
  const csvContent = `example_id,domain,category,context,difficulty,tags,korean,english,japanese,chinese
example_001,daily,routine,daily_conversation,beginner,"greeting,polite,formal",안녕하세요! 처음 뵙겠습니다.,Hello! Nice to meet you for the first time.,こんにちは！初めてお会いします。,你好！初次见面。
example_002,food,fruit,restaurant,beginner,"food,ordering,restaurant",사과 주스 하나 주세요.,Please give me one apple juice.,りんごジュースを一つください。,请给我一杯苹果汁。`;

  downloadCSV(csvContent, "examples_template.csv");
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
    {
      pattern_id: "pattern_003",
      pattern_name: "과거 경험",
      pattern_type: "tense",
      domain: "academic",
      category: "literature",
      difficulty: "intermediate",
      tags: ["past", "experience", "verb"],
      learning_focus: ["conjugation", "time_expression"],
      structural_pattern: "___었/았어요",
      explanations: {
        korean: "과거에 일어난 일을 표현할 때 사용합니다.",
        english: "Used to express past events or experiences.",
        japanese: "過去に起こったことを表現する時に使います。",
        chinese: "用于表达过去发生的事情。",
      },
      usage_examples: [
        {
          korean: "어제 영화를 봤어요.",
          english: "I watched a movie yesterday.",
          japanese: "昨日映画を見ました。",
          chinese: "我昨天看了电影。",
        },
      ],
    },
  ];

  downloadJSON(template, "grammar_template.json");
}

function downloadGrammarCSVTemplate() {
  const csvContent = `pattern_id,pattern_name,pattern_type,domain,category,difficulty,tags,learning_focus,structural_pattern,korean_explanation,english_explanation,japanese_explanation,chinese_explanation,korean_example,english_example,japanese_example,chinese_example
pattern_001,기본 인사,greeting,daily,routine,beginner,"greeting,basic,daily","pronunciation,usage",안녕하세요,가장 기본적인 인사 표현입니다.,Basic greeting expression.,基本的な挨拶表現です。,最基本的问候表达。,안녕하세요! 만나서 반갑습니다.,Hello! Nice to meet you.,こんにちは！お会いできて嬉しいです。,你好！很高兴见到你。
pattern_002,음식 주문,request,food,drink,beginner,"food,request,restaurant","grammar,vocabulary",___을/를 주세요,음식이나 물건을 정중하게 요청할 때 사용합니다.,Used to politely request food or items.,食べ物や物を丁寧に頼む時に使います。,用于礼貌地请求食物或物品。,김치찌개를 주세요.,Please give me kimchi stew.,キムチチゲをください。,请给我泡菜汤。
pattern_003,과거 경험,tense,academic,literature,intermediate,"past,experience,verb","conjugation,time_expression",___었/았어요,과거에 일어난 일을 표현할 때 사용합니다.,Used to express past events or experiences.,過去に起こったことを表現する時に使います。,用于表达过去发生的事情。,어제 영화를 봤어요.,I watched a movie yesterday.,昨日映画を見ました。,我昨天看了电影。`;

  downloadCSV(csvContent, "grammar_template.csv");
}

function downloadJSON(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function downloadCSV(content, filename) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// CSV 파싱 함수
function parseCSV(content, tabName) {
  const lines = content.trim().split("\n");
  if (lines.length < 2) {
    throw new Error("CSV 파일에 데이터가 없습니다.");
  }

  const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""));
  const data = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length === headers.length) {
      const row = {};
      headers.forEach((header, index) => {
        row[header] = values[index];
      });

      // 컬렉션 타입에 따라 적절한 형식으로 변환
      let parsedData;
      switch (tabName) {
        case "concepts":
          parsedData = parseConceptFromCSV(row);
          break;
        case "examples":
          parsedData = parseExampleFromCSV(row);
          break;
        case "grammar":
          parsedData = parseGrammarPatternFromCSV(row);
          break;
        default:
          parsedData = row;
      }

      if (parsedData) {
        data.push(parsedData);
      }
    }
  }

  return data;
}

// CSV 라인 파싱 (쉼표로 분리하되 따옴표 내부는 무시)
function parseCSVLine(line) {
  const values = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      values.push(current.trim().replace(/^"|"$/g, ""));
      current = "";
    } else {
      current += char;
    }
  }

  values.push(current.trim().replace(/^"|"$/g, ""));
  return values;
}

// 개념 CSV 파싱
function parseConceptFromCSV(row) {
  try {
    return {
      concept_info: {
        domain: row.domain || "general",
        category: row.category || "uncategorized",
        difficulty: row.difficulty || "beginner",
        unicode_emoji: row.unicode_emoji || "",
        color_theme: row.color_theme || "#9C27B0",
        tags: row.tags ? row.tags.split(",").map((t) => t.trim()) : [],
        updated_at: new Date(),
      },
      expressions: {
        korean: {
          word: row.korean_word || "",
          pronunciation: row.korean_pronunciation || "",
          definition: row.korean_definition || "",
          part_of_speech: row.korean_part_of_speech || "명사",
          level: row.korean_level || "beginner",
          synonyms: row.korean_synonyms
            ? row.korean_synonyms.split(",").map((s) => s.trim())
            : [],
          antonyms: [],
          word_family: row.korean_word_family
            ? row.korean_word_family.split(",").map((w) => w.trim())
            : [],
          compound_words: row.korean_compound_words
            ? row.korean_compound_words.split(",").map((c) => c.trim())
            : [],
          collocations: row.korean_collocations
            ? row.korean_collocations.split(",").map((c) => c.trim())
            : [],
        },
        english: {
          word: row.english_word || "",
          pronunciation: row.english_pronunciation || "",
          definition: row.english_definition || "",
          part_of_speech: row.english_part_of_speech || "noun",
          level: row.english_level || "beginner",
          synonyms: row.english_synonyms
            ? row.english_synonyms.split(",").map((s) => s.trim())
            : [],
          antonyms: [],
          word_family: row.english_word_family
            ? row.english_word_family.split(",").map((w) => w.trim())
            : [],
          compound_words: row.english_compound_words
            ? row.english_compound_words.split(",").map((c) => c.trim())
            : [],
          collocations: row.english_collocations
            ? row.english_collocations.split(",").map((c) => c.trim())
            : [],
        },
        chinese: {
          word: row.chinese_word || "",
          pronunciation: row.chinese_pronunciation || "",
          definition: row.chinese_definition || "",
          part_of_speech: row.chinese_part_of_speech || "名词",
          level: row.chinese_level || "beginner",
          synonyms: row.chinese_synonyms
            ? row.chinese_synonyms.split(",").map((s) => s.trim())
            : [],
          antonyms: [],
          word_family: row.chinese_word_family
            ? row.chinese_word_family.split(",").map((w) => w.trim())
            : [],
          compound_words: row.chinese_compound_words
            ? row.chinese_compound_words.split(",").map((c) => c.trim())
            : [],
          collocations: row.chinese_collocations
            ? row.chinese_collocations.split(",").map((c) => c.trim())
            : [],
        },
        japanese: {
          word: row.japanese_word || "",
          pronunciation: row.japanese_pronunciation || "",
          definition: row.japanese_definition || "",
          part_of_speech: row.japanese_part_of_speech || "名詞",
          level: row.japanese_level || "beginner",
          synonyms: row.japanese_synonyms
            ? row.japanese_synonyms.split(",").map((s) => s.trim())
            : [],
          antonyms: [],
          word_family: row.japanese_word_family
            ? row.japanese_word_family.split(",").map((w) => w.trim())
            : [],
          compound_words: row.japanese_compound_words
            ? row.japanese_compound_words.split(",").map((c) => c.trim())
            : [],
          collocations: row.japanese_collocations
            ? row.japanese_collocations.split(",").map((c) => c.trim())
            : [],
        },
      },
      representative_example:
        row.example_korean && row.example_english
          ? {
              translations: {
                korean: row.example_korean,
                english: row.example_english,
                chinese: row.example_chinese || "",
                japanese: row.example_japanese || "",
              },
              context: row.example_context || "daily_conversation",
              difficulty: row.example_difficulty || "beginner",
            }
          : null,
    };
  } catch (error) {
    console.error("개념 CSV 파싱 오류:", error);
    return null;
  }
}

// 예문 CSV 파싱
function parseExampleFromCSV(row) {
  try {
    return {
      example_id: row.example_id || null,
      domain: row.domain || "general",
      category: row.category || "common",
      context: row.context || "general",
      difficulty: row.difficulty || "beginner",
      tags: row.tags ? row.tags.split(",").map((t) => t.trim()) : [],
      translations: {
        korean: row.korean || "",
        english: row.english || "",
        japanese: row.japanese || "",
        chinese: row.chinese || "",
      },
    };
  } catch (error) {
    console.error("예문 CSV 파싱 오류:", error);
    return null;
  }
}

// 문법 패턴 CSV 파싱
function parseGrammarPatternFromCSV(row) {
  try {
    // 단일 예문을 객체로 변환
    const usageExample = {
      korean: row.korean_example || "",
      english: row.english_example || "",
      japanese: row.japanese_example || "",
      chinese: row.chinese_example || "",
    };

    return {
      pattern_id: row.pattern_id || "",
      pattern_name: row.pattern_name || "",
      pattern_type: row.pattern_type || "",
      domain: row.domain || "general",
      category: row.category || "common",
      difficulty: row.difficulty || "",
      tags: row.tags ? row.tags.split(",").map((t) => t.trim()) : [],
      learning_focus: row.learning_focus
        ? row.learning_focus.split(",").map((t) => t.trim())
        : [],
      structural_pattern: row.structural_pattern || "",
      explanations: {
        korean: row.korean_explanation || "",
        english: row.english_explanation || "",
        japanese: row.japanese_explanation || "",
        chinese: row.chinese_explanation || "",
      },
      usage_examples: [usageExample],
      created_at: serverTimestamp(),
    };
  } catch (error) {
    console.error("문법 패턴 CSV 파싱 오류:", error);
    return null;
  }
}

// 파일 내용 읽기 함수
async function readFileContent(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (e) => reject(e);
    reader.readAsText(file);
  });
}

// 가져오기 설정 토글 함수
function toggleImportSettings(importMode) {
  console.log("가져오기 모드 변경:", importMode);
  // 필요에 따라 UI 조정 로직 추가
}

// 전역 함수로 내보내기 (다른 모듈에서 호출용)
window.openBulkImportModal = function () {
  const modal = document.getElementById("bulk-import-modal");

  if (modal) {
    modal.classList.remove("hidden");
  }

  const importMode = document.getElementById("import-mode");
  if (importMode) {
    toggleImportSettings(importMode.value);
  }
};

// CSV 파싱 시 문법 태그 처리
function parseCSVRowForTags(row, headers) {
  const concept = {};

  // ... existing parsing logic ...

  // 문법 태그 처리
  const grammarTagsHeaders = getGrammarTagHeaders();
  grammarTagsHeaders.forEach((header) => {
    const index = headers.indexOf(header);
    if (index !== -1 && row[index]) {
      const language = header.replace("_grammar_tags", "");
      const tags = grammarTagsFromCSV(row[index]);

      // 문법 태그 유효성 검사
      if (tags.length > 0) {
        const pos = tags.find((tag) => !tag.includes(":"));
        const features = tags.filter((tag) => tag.includes(":"));

        const validation = validateGrammarTags(language, pos, features);
        if (!validation.valid) {
          console.warn(
            `문법 태그 유효성 검사 실패 (${language}): ${validation.error}`
          );
        }

        // 개념에 문법 태그 추가
        if (!concept.expressions) concept.expressions = {};
        if (!concept.expressions[language]) concept.expressions[language] = {};
        concept.expressions[language].grammar_tags = tags;
      }
    }
  });

  return concept;
}
