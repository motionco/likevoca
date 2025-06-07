import {
  auth,
  db,
  conceptUtils,
  supportedLanguages,
} from "../../js/firebase/firebase-init.js";
import {
  GRAMMAR_TAGS,
  validateGrammarTags,
  getGrammarTagHeaders,
  grammarTagsFromCSV,
  grammarTagsToCSV,
} from "../../js/grammar-tags-system.js";
import { collectionManager } from "../../js/firebase/firebase-collection-manager.js";

// 전역 변수
let importedData = [];
let selectedFile = null;
let isImporting = false;

export function initialize() {
  console.log("대량 개념 추가 모달 초기화");

  // 모달 요소
  const modal = document.getElementById("bulk-import-modal");
  const closeBtn = document.getElementById("close-bulk-modal");
  const cancelBtn = document.getElementById("cancel-import");
  const startImportBtn = document.getElementById("start-import");
  const downloadTemplateBtn = document.getElementById("download-template");
  const importModeSelect = document.getElementById("import-mode");
  const csvSettings = document.getElementById("csv-settings");
  const jsonSettings = document.getElementById("json-settings");
  const browseFileBtn = document.getElementById("browse-file");
  const fileInput = document.getElementById("file-input");
  const fileNameDisplay = document.getElementById("file-name");

  // 이벤트 리스너 등록
  if (closeBtn) {
    closeBtn.addEventListener("click", closeModal);
  }

  if (cancelBtn) {
    cancelBtn.addEventListener("click", closeModal);
  }

  if (startImportBtn) {
    startImportBtn.addEventListener("click", startImport);
  }

  if (downloadTemplateBtn) {
    downloadTemplateBtn.addEventListener("click", downloadTemplate);
  }

  if (importModeSelect) {
    importModeSelect.addEventListener("change", function () {
      toggleImportSettings(this.value);
    });
  }

  if (browseFileBtn) {
    browseFileBtn.addEventListener("click", function () {
      fileInput.click();
    });
  }

  if (fileInput) {
    fileInput.addEventListener("change", function (event) {
      handleFileSelect(event);
    });

    // 파일 드래그 앤 드롭 처리
    const dropZone = document.querySelector(".border-dashed");
    if (dropZone) {
      dropZone.addEventListener("dragover", function (e) {
        e.preventDefault();
        e.stopPropagation();
        this.classList.add("border-blue-500");
      });

      dropZone.addEventListener("dragleave", function (e) {
        e.preventDefault();
        e.stopPropagation();
        this.classList.remove("border-blue-500");
      });

      dropZone.addEventListener("drop", function (e) {
        e.preventDefault();
        e.stopPropagation();
        this.classList.remove("border-blue-500");

        const dt = e.dataTransfer;
        const files = dt.files;

        if (files.length > 0) {
          fileInput.files = files;
          handleFileSelect({ target: fileInput });
        }
      });
    }
  }
}

// 파일 형식에 따른 설정 토글
function toggleImportSettings(mode) {
  const csvSettings = document.getElementById("csv-settings");
  const jsonSettings = document.getElementById("json-settings");

  if (mode === "csv") {
    csvSettings.classList.remove("hidden");
    jsonSettings.classList.add("hidden");
  } else {
    csvSettings.classList.add("hidden");
    jsonSettings.classList.remove("hidden");
  }
}

// 파일 선택 처리
function handleFileSelect(event) {
  const file = event.target.files[0];

  if (!file) return;

  const fileNameDisplay = document.getElementById("file-name");
  fileNameDisplay.textContent = file.name;

  selectedFile = file;

  // 파일 형식에 맞게 import 모드 설정
  const importModeSelect = document.getElementById("import-mode");

  if (file.name.toLowerCase().endsWith(".csv")) {
    importModeSelect.value = "csv";
    toggleImportSettings("csv");
  } else if (file.name.toLowerCase().endsWith(".json")) {
    importModeSelect.value = "json";
    toggleImportSettings("json");
  }
}

// 템플릿 파일 다운로드
function downloadTemplate() {
  const importMode = document.getElementById("import-mode").value;

  if (importMode === "csv") {
    downloadCSVTemplate();
  } else {
    downloadJSONTemplate();
  }
}

// CSV 템플릿 다운로드 - 방식 1 기반 핵심 속성 유지
function downloadCSVTemplate() {
  // CSV 헤더 생성 (핵심 속성은 concepts에 유지, 예문/문법만 분리)
  const headers = [
    "domain",
    "category",
    "emoji",
    // 한국어 필드 (핵심 속성 유지)
    "korean_word",
    "korean_pronunciation",
    "korean_definition",
    "korean_part_of_speech",
    "korean_level",
    "korean_romanization",
    "korean_synonyms",
    "korean_antonyms",
    "korean_word_family",
    "korean_compound_words",
    "korean_collocations",
    // 영어 필드 (핵심 속성 유지)
    "english_word",
    "english_pronunciation",
    "english_definition",
    "english_part_of_speech",
    "english_level",
    "english_phonetic",
    "english_synonyms",
    "english_antonyms",
    "english_word_family",
    "english_compound_words",
    "english_collocations",
    // 일본어 필드 (핵심 속성 유지)
    "japanese_word",
    "japanese_pronunciation",
    "japanese_definition",
    "japanese_part_of_speech",
    "japanese_level",
    "japanese_hiragana",
    "japanese_katakana",
    "japanese_kanji",
    "japanese_romanization",
    "japanese_synonyms",
    "japanese_antonyms",
    "japanese_word_family",
    "japanese_compound_words",
    "japanese_collocations",
    // 중국어 필드 (핵심 속성 유지)
    "chinese_word",
    "chinese_pronunciation",
    "chinese_definition",
    "chinese_part_of_speech",
    "chinese_level",
    "chinese_traditional",
    "chinese_simplified",
    "chinese_synonyms",
    "chinese_antonyms",
    "chinese_word_family",
    "chinese_compound_words",
    "chinese_collocations",
    // 대표 예문 (concepts에 포함)
    "representative_example_korean",
    "representative_example_english",
    "representative_example_japanese",
    "representative_example_chinese",
    "representative_example_context",
    "representative_example_difficulty",
    // 추가 예문 (examples 컬렉션으로 분리)
    "additional_examples_korean",
    "additional_examples_english",
    "additional_examples_japanese",
    "additional_examples_chinese",
    "additional_examples_context",
    "additional_examples_difficulty",
    // 문법 정보 (grammar_patterns 컬렉션으로 분리)
    "grammar_pattern_name",
    "grammar_pattern_korean",
    "grammar_pattern_english",
    "grammar_pattern_japanese",
    "grammar_pattern_chinese",
    "grammar_tags",
    "learning_focus",
  ];

  // 샘플 데이터 생성 (방식 1 기반)
  const sampleData = [
    [
      "daily",
      "fruit",
      "🍎",
      // 한국어 (핵심 속성)
      "사과",
      "sa-gwa",
      "빨간 과일",
      "명사",
      "초급",
      "sagwa",
      "능금",
      "오렌지",
      "과일|음식",
      "사과나무|사과즙",
      "빨간 사과|맛있는 사과",
      // 영어 (핵심 속성)
      "apple",
      "/ˈæpəl/",
      "a round fruit with red or green skin",
      "noun",
      "beginner",
      "/ˈæpəl/",
      "",
      "",
      "fruit|food",
      "apple tree|apple juice",
      "red apple|sweet apple",
      // 일본어 (핵심 속성)
      "りんご",
      "ringo",
      "赤い果物",
      "名詞",
      "初級",
      "りんご",
      "リンゴ",
      "林檎",
      "ringo",
      "果物",
      "オレンジ",
      "果物|食べ物",
      "りんごの木|りんごジュース",
      "赤いりんご|甘いりんご",
      // 중국어 (핵심 속성)
      "苹果",
      "píngguǒ",
      "红色或绿色的圆形水果",
      "名词",
      "初级",
      "蘋果",
      "苹果",
      "",
      "",
      "水果|食物",
      "苹果树|苹果汁",
      "红苹果|甜苹果",
      // 대표 예문 (concepts에 포함)
      "아침에 사과를 먹어요.",
      "I eat an apple in the morning.",
      "朝にりんごを食べます。",
      "我早上吃苹果。",
      "daily_routine",
      "beginner",
      // 추가 예문 (examples 컬렉션)
      "이 사과는 달콤해요.|사과 한 개 주세요.",
      "This apple is sweet.|Can I have one apple please?",
      "このりんごは甘いです。|りんごを一つください。",
      "这个苹果很甜。|请给我一个苹果。",
      "taste_description|shopping",
      "beginner|beginner",
      // 문법 정보 (grammar_patterns 컬렉션)
      "목적어 표시 패턴",
      "명사 + 을/를 + 동사",
      "Object + Verb pattern",
      "名詞 + を + 動詞",
      "名词 + 宾语标记",
      "present_tense|declarative|daily_activity|object_marking",
      "시간 표현|목적어 표시|현재 시제|일상 활동",
    ],
    [
      "daily",
      "greeting",
      "👋",
      // 한국어 (핵심 속성)
      "안녕하세요",
      "an-nyeong-ha-se-yo",
      "정중한 인사말",
      "감탄사",
      "초급",
      "annyeonghaseyo",
      "안녕|반갑습니다",
      "안녕히 가세요",
      "인사|예의",
      "인사말|첫인사",
      "정중한 안녕하세요|첫 안녕하세요",
      // 영어 (핵심 속성)
      "hello",
      "/həˈloʊ/",
      "a polite greeting expression used during the day",
      "exclamation",
      "beginner",
      "/həˈloʊ/",
      "hi|good morning|good afternoon",
      "goodbye|farewell",
      "greeting|salutation",
      "hello greeting|hello message",
      "say hello|warm hello",
      // 일본어 (핵심 속성)
      "こんにちは",
      "konnichiwa",
      "昼間の挨拶",
      "感動詞",
      "初級",
      "こんにちは",
      "",
      "今日は",
      "konnichiwa",
      "おはよう|こんばんは",
      "さようなら",
      "挨拶|礼儀",
      "挨拶言葉|初対面挨拶",
      "丁寧なこんにちは|初めてのこんにちは",
      // 중국어 (핵심 속성)
      "你好",
      "nǐ hǎo",
      "白天使用的礼貌问候语",
      "感叹词",
      "初级",
      "你好",
      "你好",
      "您好|大家好",
      "再见|告别",
      "问候|礼貌",
      "问候语|初次见面",
      "礼貌的你好|热情的你好",
      // 대표 예문 (concepts에 포함)
      "안녕하세요, 만나서 반갑습니다.",
      "Hello, nice to meet you.",
      "こんにちは、はじめまして。",
      "你好，很高兴见到你。",
      "first_meeting",
      "beginner",
      // 추가 예문 (examples 컬렉션)
      "안녕하세요, 오늘 날씨가 좋네요.|안녕하세요, 어떻게 지내세요?",
      "Hello, the weather is nice today.|Hello, how are you doing?",
      "こんにちは、今日はいい天気ですね。|こんにちは、元気ですか？",
      "你好，今天天气真好。|你好，你好吗？",
      "weather_talk|wellbeing_check",
      "beginner|beginner",
      // 문법 정보 (grammar_patterns 컬렉션)
      "정중한 인사 표현",
      "안녕하세요 + 연결어미",
      "Polite greeting formula",
      "こんにちは + 連結表現",
      "你好 + 连接表达",
      "greeting_formula|polite_level:formal|first_meeting|emotion_expression",
      "첫만남 인사|정중함 표현|감정 표현|사회적 예의",
    ],
  ];

  // CSV 문자열 생성
  const csvContent = [headers, ...sampleData]
    .map((row) =>
      row
        .map((cell) => {
          // 문자열 내 따옴표와 쉼표 처리
          const cellStr = String(cell || "");
          if (
            cellStr.includes(",") ||
            cellStr.includes('"') ||
            cellStr.includes("\n")
          ) {
            return `"${cellStr.replace(/"/g, '""')}"`;
          }
          return cellStr;
        })
        .join(",")
    )
    .join("\n");

  // 파일 다운로드
  const blob = new Blob(["\uFEFF" + csvContent], {
    type: "text/csv;charset=utf-8;",
  });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", "concept_template_improved.csv");
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// JSON 템플릿 다운로드 - 방식 1 기반 핵심 속성 유지
function downloadJSONTemplate() {
  // 방식 1 기반 JSON 템플릿 (핵심 속성 유지, 예문/문법 분리)
  const template = [
    {
      // 기본 정보
      domain: "daily",
      category: "fruit",
      emoji: "🍎",

      // 한국어 정보 (핵심 속성 유지)
      korean_word: "사과",
      korean_pronunciation: "sa-gwa", // 한국어 발음 표기
      korean_definition: "빨간색이나 녹색인 둥근 과일",
      korean_part_of_speech: "명사",
      korean_level: "초급",
      korean_romanization: "sagwa", // 로마자 표기 (한국어 특화)
      korean_synonyms: "", // 동의어 없음 (빈 문자열)
      korean_antonyms: "", // 반의어 없음 (빈 문자열)
      korean_word_family: "과일|음식",
      korean_compound_words: "사과나무|사과즙",
      korean_collocations: "빨간 사과|맛있는 사과", // frequency 제거

      // 영어 정보 (핵심 속성 유지)
      english_word: "apple",
      english_pronunciation: "/ˈæpəl/", // IPA 표기 (영어 특화)
      english_definition: "a round fruit with red or green skin",
      english_part_of_speech: "noun",
      english_level: "beginner",
      english_phonetic: "/ˈæpəl/", // IPA 음성 표기 (영어 특화)
      english_synonyms: "", // 동의어 없음
      english_antonyms: "", // 반의어 없음
      english_word_family: "fruit|food",
      english_compound_words: "apple tree|apple juice",
      english_collocations: "red apple|sweet apple",

      // 일본어 정보 (핵심 속성 유지)
      japanese_word: "りんご",
      japanese_pronunciation: "ringo", // 일본어 발음 표기
      japanese_definition: "赤色または緑色の丸い果物",
      japanese_part_of_speech: "名詞",
      japanese_level: "初級",
      japanese_hiragana: "りんご", // 히라가나 (일본어 특화)
      japanese_katakana: "リンゴ", // 가타카나 (일본어 특화)
      japanese_kanji: "林檎", // 한자 (일본어 특화)
      japanese_romanization: "ringo", // 로마자 표기 (일본어 특화)
      japanese_synonyms: "",
      japanese_antonyms: "",
      japanese_word_family: "果物|食べ物",
      japanese_compound_words: "りんごの木|りんごジュース",
      japanese_collocations: "赤いりんご|甘いりんご",

      // 중국어 정보 (핵심 속성 유지)
      chinese_word: "苹果",
      chinese_pronunciation: "píngguǒ", // 병음 표기 (중국어 특화)
      chinese_definition: "红色或绿色的圆形水果",
      chinese_part_of_speech: "名词",
      chinese_level: "初级",
      chinese_traditional: "蘋果", // 번체 (중국어 특화)
      chinese_simplified: "苹果", // 간체 (중국어 특화)
      chinese_synonyms: "",
      chinese_antonyms: "",
      chinese_word_family: "水果|食物",
      chinese_compound_words: "苹果树|苹果汁",
      chinese_collocations: "红苹果|甜苹果",

      // 대표 예문 (concepts에 포함)
      representative_example_korean: "아침에 사과를 먹어요.",
      representative_example_english: "I eat an apple in the morning.",
      representative_example_japanese: "朝にりんごを食べます。",
      representative_example_chinese: "我早上吃苹果。",
      representative_example_context: "daily_routine",
      representative_example_difficulty: "beginner",

      // 추가 예문 (examples 컬렉션으로 분리)
      additional_examples_korean: "이 사과는 달콤해요.|사과 한 개 주세요.",
      additional_examples_english:
        "This apple is sweet.|Can I have one apple please?",
      additional_examples_japanese:
        "このりんごは甘いです。|りんごを一つください。",
      additional_examples_chinese: "这个苹果很甜。|请给我一个苹果。",
      additional_examples_context: "taste_description|shopping",
      additional_examples_difficulty: "beginner|beginner",

      // 문법 정보 (grammar_patterns 컬렉션으로 분리)
      grammar_pattern_name: "목적어 표시 패턴",
      grammar_pattern_korean: "명사 + 을/를 + 동사",
      grammar_pattern_english: "Object + Verb pattern",
      grammar_pattern_japanese: "名詞 + を + 動詞",
      grammar_pattern_chinese: "名词 + 宾语标记",
      grammar_tags: "present_tense|declarative|daily_activity|object_marking",
      learning_focus: "시간 표현|목적어 표시|현재 시제|일상 활동",
    },
    {
      // 기본 정보
      domain: "daily",
      category: "greeting",
      emoji: "👋",

      // 한국어 정보 (핵심 속성 유지)
      korean_word: "안녕하세요",
      korean_pronunciation: "an-nyeong-ha-se-yo",
      korean_definition: "정중한 인사말로 낮에 사용하는 표현",
      korean_part_of_speech: "감탄사",
      korean_level: "초급",
      korean_romanization: "annyeonghaseyo",
      korean_synonyms: "안녕|반갑습니다", // 실제 동의어
      korean_antonyms: "안녕히 가세요", // 실제 반대 개념 (인사 vs 이별)
      korean_word_family: "인사|예의",
      korean_compound_words: "인사말|첫인사",
      korean_collocations: "정중한 안녕하세요|첫 안녕하세요",

      // 영어 정보 (핵심 속성 유지)
      english_word: "hello",
      english_pronunciation: "/həˈloʊ/",
      english_definition: "a polite greeting expression used during the day",
      english_part_of_speech: "exclamation",
      english_level: "beginner",
      english_phonetic: "/həˈloʊ/",
      english_synonyms: "hi|good morning|good afternoon", // 실제 동의어
      english_antonyms: "goodbye|farewell", // 실제 반대 개념
      english_word_family: "greeting|salutation",
      english_compound_words: "hello greeting|hello message",
      english_collocations: "say hello|warm hello",

      // 일본어 정보 (핵심 속성 유지)
      japanese_word: "こんにちは",
      japanese_pronunciation: "konnichiwa",
      japanese_definition: "昼間に使う丁寧な挨拶表現",
      japanese_part_of_speech: "感動詞",
      japanese_level: "初級",
      japanese_hiragana: "こんにちは",
      japanese_katakana: "", // 가타카나 표기 없음
      japanese_kanji: "今日は", // 한자 표기
      japanese_romanization: "konnichiwa",
      japanese_synonyms: "おはようございます|こんばんは", // 실제 동의어
      japanese_antonyms: "さようなら|また明日", // 실제 반대 개념
      japanese_word_family: "挨拶|礼儀",
      japanese_compound_words: "挨拶言葉|初対面挨拶",
      japanese_collocations: "丁寧なこんにちは|初めてのこんにちは",

      // 중국어 정보 (핵심 속성 유지)
      chinese_word: "你好",
      chinese_pronunciation: "nǐ hǎo",
      chinese_definition: "白天使用的礼貌问候语",
      chinese_part_of_speech: "感叹词",
      chinese_level: "初级",
      chinese_traditional: "你好",
      chinese_simplified: "你好",
      chinese_synonyms: "您好|大家好", // 실제 동의어
      chinese_antonyms: "再见|告别", // 실제 반대 개념
      chinese_word_family: "问候|礼貌",
      chinese_compound_words: "问候语|初次见面",
      chinese_collocations: "礼貌的你好|热情的你好",

      // 대표 예문 (concepts에 포함)
      representative_example_korean: "안녕하세요, 만나서 반갑습니다.",
      representative_example_english: "Hello, nice to meet you.",
      representative_example_japanese: "こんにちは、はじめまして。",
      representative_example_chinese: "你好，很高兴见到你。",
      representative_example_context: "first_meeting",
      representative_example_difficulty: "beginner",

      // 추가 예문 (examples 컬렉션으로 분리)
      additional_examples_korean:
        "안녕하세요, 오늘 날씨가 좋네요.|안녕하세요, 어떻게 지내세요?",
      additional_examples_english:
        "Hello, the weather is nice today.|Hello, how are you doing?",
      additional_examples_japanese:
        "こんにちは、今日はいい天気ですね。|こんにちは、元気ですか？",
      additional_examples_chinese: "你好，今天天气真好。|你好，你好吗？",
      additional_examples_context: "weather_talk|wellbeing_check",
      additional_examples_difficulty: "beginner|beginner",

      // 문법 정보 (grammar_patterns 컬렉션으로 분리)
      grammar_pattern_name: "정중한 인사 표현",
      grammar_pattern_korean: "안녕하세요 + 연결어미",
      grammar_pattern_english: "Polite greeting formula",
      grammar_pattern_japanese: "こんにちは + 連結表現",
      grammar_pattern_chinese: "你好 + 连接表达",
      grammar_tags:
        "greeting_formula|polite_level:formal|first_meeting|emotion_expression",
      learning_focus: "첫만남 인사|정중함 표현|감정 표현|사회적 예의",
    },
  ];

  // JSON 파일 다운로드
  const jsonString = JSON.stringify(template, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", "concept_template_improved.json");
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// 가져오기 시작 - 분리된 컬렉션 시스템 사용
async function startImport() {
  if (!selectedFile || isImporting) return;

  isImporting = true;
  importedData = [];

  // UI 업데이트
  const importStatus = document.getElementById("import-status");
  const importProgress = document.getElementById("import-progress");
  const importPercentage = document.getElementById("import-percentage");
  const importResult = document.getElementById("import-result");
  const startImportBtn = document.getElementById("start-import");

  importStatus.classList.remove("hidden");
  importProgress.style.width = "0%";
  importPercentage.textContent = "0%";
  importResult.textContent = "파일 처리 중...";
  startImportBtn.disabled = true;

  try {
    const importMode = document.getElementById("import-mode").value;
    const defaultDomain = document
      .getElementById("default-domain")
      .value.trim();
    const defaultCategory = document
      .getElementById("default-category")
      .value.trim();

    // 파일 형식에 따라 파싱 함수 호출
    if (importMode === "csv") {
      const delimiter = document.getElementById("csv-delimiter").value;
      const hasHeader =
        document.getElementById("csv-has-header").value === "true";

      await parseCSVFile(
        selectedFile,
        delimiter,
        hasHeader,
        defaultDomain,
        defaultCategory
      );
    } else {
      await parseJSONFile(selectedFile, defaultDomain, defaultCategory);
    }

    // === 분리된 컬렉션 시스템 사용 ===
    importResult.textContent = `${importedData.length}개의 개념을 분리된 컬렉션으로 저장 중...`;

    // JSON 데이터 형식 변환 (방식 1에서 integratedData 형식으로)
    const convertedData = importedData.map((item) => {
      if (item.concept) {
        // 방식 1 형태를 integratedData 형태로 변환
        return {
          concept_info: item.concept.concept_info,
          expressions: item.concept.expressions,
          representative_example: item.concept.representative_example,
          core_examples: item.examples || [],
          grammar_patterns: item.grammar_pattern ? [item.grammar_pattern] : [],
          metadata: item.concept.learning_metadata || {},
        };
      }
      return item; // 이미 올바른 형식인 경우
    });

    // 대량 처리 최적화
    const batchResults = await collectionManager.bulkCreateSeparatedConcepts(
      convertedData
    );

    const successCount = batchResults.results.length;
    const errorCount = batchResults.errors.length;

    // 진행률 및 결과 업데이트
    let processedCount = 0;
    const totalCount = successCount + errorCount;

    // 성공한 항목들에 대한 UI 업데이트
    for (const result of batchResults.results) {
      processedCount++;
      const progressPercent = Math.round((processedCount / totalCount) * 100);
      importProgress.style.width = `${progressPercent}%`;
      importPercentage.textContent = `${progressPercent}%`;

      importResult.innerHTML = `
        <div class="text-blue-700 font-medium">분리된 컬렉션으로 저장 중...</div>
        <div>처리됨: ${processedCount}/${totalCount} (성공: ${successCount}, 실패: ${errorCount})</div>
        <div class="text-xs text-gray-600 mt-1">
          개념: ${result.conceptId}<br/>
          예문: ${result.exampleIds.length}개, 
          문법패턴: ${result.grammarPatternIds.length}개, 
          퀴즈템플릿: ${result.quizTemplateIds.length}개
        </div>
      `;

      // UI 반응성을 위한 지연
      await new Promise((resolve) => setTimeout(resolve, 5));
    }

    // 사용자 개념 수 업데이트 (users 컬렉션)
    if (auth.currentUser && successCount > 0) {
      await conceptUtils.updateUsage(auth.currentUser.email, {
        conceptCount:
          (await conceptUtils.getUsage(auth.currentUser.email)).conceptCount +
          successCount,
      });
    }

    // 최종 결과 표시
    importResult.innerHTML = `
      <div class="text-green-700 font-medium">분리된 컬렉션 저장 완료</div>
      <div class="mb-2">
        전체: ${
          importedData.length
        }개, 성공: ${successCount}개, 실패: ${errorCount}개
      </div>
      <div class="grid grid-cols-2 gap-2 text-xs">
        <div class="bg-blue-50 p-2 rounded">
          <div class="font-medium">생성된 컬렉션</div>
          <div>• concepts: ${successCount}개</div>
          <div>• examples: ${batchResults.results.reduce(
            (sum, r) => sum + r.exampleIds.length,
            0
          )}개</div>
          <div>• grammar_patterns: ${batchResults.results.reduce(
            (sum, r) => sum + r.grammarPatternIds.length,
            0
          )}개</div>
          <div>• quiz_templates: ${batchResults.results.reduce(
            (sum, r) => sum + r.quizTemplateIds.length,
            0
          )}개</div>
        </div>
        <div class="bg-green-50 p-2 rounded">
          <div class="font-medium">최적화 혜택</div>
          <div>• 검색 속도 향상</div>
          <div>• 게임 성능 개선</div>
          <div>• 진도 추적 정확도</div>
          <div>• 문법 분석 고도화</div>
        </div>
      </div>
    `;

    // 오류가 있는 경우 세부 정보 표시
    if (errorCount > 0) {
      const errorDetails = document.createElement("div");
      errorDetails.className = "mt-3 text-xs text-red-600";
      errorDetails.innerHTML = `
        <details>
          <summary class="cursor-pointer font-medium">오류 상세 정보 (${errorCount}개)</summary>
          <div class="mt-2 max-h-32 overflow-y-auto">
            ${batchResults.errors
              .map(
                (error, index) => `
              <div class="mb-1 p-1 bg-red-50 rounded">
                ${index + 1}. ${error.error?.message || "알 수 없는 오류"}
              </div>
            `
              )
              .join("")}
          </div>
        </details>
      `;
      importResult.appendChild(errorDetails);
    }

    // 대량 개념 추가 완료 이벤트만 발생
    window.dispatchEvent(
      new CustomEvent("bulk-import-completed", {
        detail: {
          total: importedData.length,
          success: successCount,
          failed: errorCount,
          collectionStats: {
            concepts: successCount,
            examples: batchResults.results.reduce(
              (sum, r) => sum + r.exampleIds.length,
              0
            ),
            grammarPatterns: batchResults.results.reduce(
              (sum, r) => sum + r.grammarPatternIds.length,
              0
            ),
            quizTemplates: batchResults.results.reduce(
              (sum, r) => sum + r.quizTemplateIds.length,
              0
            ),
          },
          structure: "separated_collections",
        },
      })
    );
  } catch (error) {
    console.error("분리된 컬렉션 가져오기 오류:", error);
    importResult.innerHTML = `
      <div class="text-red-700 font-medium">오류 발생</div>
      <div>${error.message}</div>
      <div class="text-xs text-gray-600 mt-2">
        기존 통합 방식으로 대체 실행을 시도할 수 있습니다.
      </div>
    `;
  } finally {
    isImporting = false;
    startImportBtn.disabled = false;
  }
}

// CSV 파일 파싱
function parseCSVFile(
  file,
  delimiter,
  hasHeader,
  defaultDomain,
  defaultCategory
) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = function (event) {
      try {
        const csvText = event.target.result;
        const lines = csvText.split(/\r\n|\n|\r/).filter((line) => line.trim());

        // 헤더 처리
        let headerRow = null;
        let startIndex = 0;

        if (hasHeader) {
          headerRow = parseCSVLine(lines[0], delimiter);
          startIndex = 1;
        }

        for (let i = startIndex; i < lines.length; i++) {
          const line = lines[i];
          const values = parseCSVLine(line, delimiter);

          // 개념 데이터 생성
          const conceptData = createConceptFromCSV(
            values,
            headerRow,
            defaultDomain,
            defaultCategory
          );
          if (conceptData) {
            importedData.push(conceptData);
          }
        }

        resolve();
      } catch (error) {
        reject(new Error("CSV 파일 파싱 중 오류 발생: " + error.message));
      }
    };

    reader.onerror = function () {
      reject(new Error("파일 읽기 실패"));
    };

    reader.readAsText(file);
  });
}

// CSV 라인 파싱 (쉼표, 따옴표 처리)
function parseCSVLine(line, delimiter) {
  const result = [];
  let inQuotes = false;
  let currentValue = "";

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // 쌍따옴표 이스케이프 처리
        currentValue += '"';
        i++;
      } else {
        // 따옴표 토글
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      // 구분자 처리
      result.push(currentValue);
      currentValue = "";
    } else {
      currentValue += char;
    }
  }

  // 마지막 값 추가
  result.push(currentValue);

  return result;
}

// CSV 데이터에서 개념 객체 생성 - 방식 1 기반 분리된 컬렉션 구조
function createConceptFromCSV(
  values,
  headerRow,
  defaultDomain,
  defaultCategory
) {
  if (!values || values.length === 0) return null;

  // 헤더와 값 매핑
  const valueMap = {};
  headerRow.forEach((header, index) => {
    valueMap[header] = values[index] || "";
  });

  const domain = valueMap.domain || defaultDomain;
  const category = valueMap.category || defaultCategory;
  const emoji = valueMap.emoji || "";

  if (!domain || !category) {
    console.warn("도메인 또는 카테고리가 없는 개념:", valueMap);
    return null;
  }

  // 1. 언어별 표현 생성 (핵심 속성 유지)
  let expressions = {};
  const supportedLanguages = {
    korean: "한국어",
    english: "영어",
    japanese: "일본어",
    chinese: "중국어",
  };

  for (const langCode of Object.keys(supportedLanguages)) {
    const word = valueMap[`${langCode}_word`];

    if (word) {
      // 핵심 단어 정보 (concepts 컬렉션에 포함)
      const expression = {
        word: word,
        pronunciation: valueMap[`${langCode}_pronunciation`] || "",
        definition: valueMap[`${langCode}_definition`] || "",
        part_of_speech: valueMap[`${langCode}_part_of_speech`] || "noun",
        level: valueMap[`${langCode}_level`] || "beginner",
        synonyms: parseArrayField(valueMap[`${langCode}_synonyms`]),
        antonyms: parseArrayField(valueMap[`${langCode}_antonyms`]),
        word_family: parseArrayField(valueMap[`${langCode}_word_family`]),
        compound_words: parseArrayField(valueMap[`${langCode}_compound_words`]),
        collocations: parseCollocationsField(
          valueMap[`${langCode}_collocations`]
        ),
      };

      // 언어별 특수 필드 추가
      if (langCode === "korean") {
        expression.romanization = valueMap.korean_romanization || "";
      } else if (langCode === "english") {
        expression.phonetic = valueMap.english_phonetic || "";
      } else if (langCode === "japanese") {
        expression.hiragana = valueMap.japanese_hiragana || "";
        expression.katakana = valueMap.japanese_katakana || "";
        expression.kanji = valueMap.japanese_kanji || "";
        expression.romanization = valueMap.japanese_romanization || "";
      } else if (langCode === "chinese") {
        expression.pinyin = valueMap.chinese_pronunciation || "";
        expression.traditional = valueMap.chinese_traditional || word;
        expression.simplified = valueMap.chinese_simplified || word;
      }

      expressions[langCode] = expression;
    }
  }

  // 개념 ID 생성
  const conceptId = generateConceptId(domain, category, expressions);

  // 2. 대표 예문 생성 (concepts 컬렉션에 포함)
  let representativeExample = null;
  const repExampleKorean = valueMap.representative_example_korean;
  const repExampleEnglish = valueMap.representative_example_english;
  const repExampleJapanese = valueMap.representative_example_japanese;
  const repExampleChinese = valueMap.representative_example_chinese;

  if (
    repExampleKorean ||
    repExampleEnglish ||
    repExampleJapanese ||
    repExampleChinese
  ) {
    representativeExample = {
      example_id: `${conceptId}_rep_example`,
      context: valueMap.representative_example_context || "general",
      difficulty: valueMap.representative_example_difficulty || "beginner",
      translations: {},
    };

    // 각 언어별 번역 추가
    if (repExampleKorean) {
      representativeExample.translations.korean = {
        text: repExampleKorean,
        romanization: "",
      };
    }
    if (repExampleEnglish) {
      representativeExample.translations.english = {
        text: repExampleEnglish,
        phonetic: "",
      };
    }
    if (repExampleJapanese) {
      representativeExample.translations.japanese = {
        text: repExampleJapanese,
        romanization: "",
      };
    }
    if (repExampleChinese) {
      representativeExample.translations.chinese = {
        text: repExampleChinese,
        pinyin: "",
      };
    }
  }

  // 3. concept_info 생성 (불필요한 속성 제거)
  const conceptInfo = {
    domain: domain,
    category: category,
    difficulty: "beginner",
    unicode_emoji: emoji,
    color_theme: "#9C27B0",
    updated_at: new Date(),
  };

  // 4. 추가 예문 생성 (examples 컬렉션으로 분리)
  const additionalExamples = [];
  const addExamplesKorean = valueMap.additional_examples_korean;
  const addExamplesEnglish = valueMap.additional_examples_english;
  const addExamplesJapanese = valueMap.additional_examples_japanese;
  const addExamplesChinese = valueMap.additional_examples_chinese;

  if (
    addExamplesKorean ||
    addExamplesEnglish ||
    addExamplesJapanese ||
    addExamplesChinese
  ) {
    // 파이프로 구분된 여러 예문 처리
    const koreanExamples = addExamplesKorean
      ? addExamplesKorean.split("|")
      : [];
    const englishExamples = addExamplesEnglish
      ? addExamplesEnglish.split("|")
      : [];
    const japaneseExamples = addExamplesJapanese
      ? addExamplesJapanese.split("|")
      : [];
    const chineseExamples = addExamplesChinese
      ? addExamplesChinese.split("|")
      : [];
    const contexts = valueMap.additional_examples_context
      ? valueMap.additional_examples_context.split("|")
      : [];
    const difficulties = valueMap.additional_examples_difficulty
      ? valueMap.additional_examples_difficulty.split("|")
      : [];

    const maxExamples = Math.max(
      koreanExamples.length,
      englishExamples.length,
      japaneseExamples.length,
      chineseExamples.length
    );

    for (let i = 0; i < maxExamples; i++) {
      const example = {
        example_id: `${conceptId}_add_example_${i + 1}`,
        concept_id: conceptId,
        context: contexts[i] || "general",
        difficulty: difficulties[i] || "beginner",
        translations: {},
      };

      if (koreanExamples[i]) {
        example.translations.korean = {
          text: koreanExamples[i].trim(),
          romanization: "",
        };
      }
      if (englishExamples[i]) {
        example.translations.english = {
          text: englishExamples[i].trim(),
          phonetic: "",
        };
      }
      if (japaneseExamples[i]) {
        example.translations.japanese = {
          text: japaneseExamples[i].trim(),
          romanization: "",
        };
      }
      if (chineseExamples[i]) {
        example.translations.chinese = {
          text: chineseExamples[i].trim(),
          pinyin: "",
        };
      }

      additionalExamples.push(example);
    }
  }

  // 5. 문법 패턴 생성 (grammar_patterns 컬렉션으로 분리)
  let grammarPattern = null;
  const grammarPatternName = valueMap.grammar_pattern_name;
  const grammarTags = valueMap.grammar_tags;

  if (grammarPatternName || grammarTags) {
    grammarPattern = {
      pattern_id: `${conceptId}_grammar_pattern`,
      concept_id: conceptId,
      pattern_name: grammarPatternName || "기본 패턴",
      pattern_type: "basic",
      difficulty: "beginner",
      tags: grammarTags ? grammarTags.split("|") : [],
      learning_focus: valueMap.learning_focus
        ? valueMap.learning_focus.split("|")
        : [],
      explanations: {},
    };

    // 각 언어별 문법 설명 추가
    if (valueMap.grammar_pattern_korean) {
      grammarPattern.explanations.korean = {
        pattern: valueMap.grammar_pattern_korean,
        explanation: `${grammarPatternName} - 한국어 문법 패턴`,
      };
    }
    if (valueMap.grammar_pattern_english) {
      grammarPattern.explanations.english = {
        pattern: valueMap.grammar_pattern_english,
        explanation: `${grammarPatternName} - English grammar pattern`,
      };
    }
    if (valueMap.grammar_pattern_japanese) {
      grammarPattern.explanations.japanese = {
        pattern: valueMap.grammar_pattern_japanese,
        explanation: `${grammarPatternName} - 日本語文法パターン`,
      };
    }
    if (valueMap.grammar_pattern_chinese) {
      grammarPattern.explanations.chinese = {
        pattern: valueMap.grammar_pattern_chinese,
        explanation: `${grammarPatternName} - 中文语法模式`,
      };
    }
  }

  // 6. 최종 구조 반환 (방식 1)
  const result = {
    // concepts 컬렉션에 저장될 데이터
    concept: {
      concept_info: conceptInfo,
      expressions: expressions,
      representative_example: representativeExample,
      learning_metadata: {
        created_from: "csv_import",
        import_date: new Date(),
        version: "2.0",
        structure_type: "method1_separated",
      },
    },
  };

  // 분리된 컬렉션 데이터 추가
  if (additionalExamples.length > 0) {
    result.examples = additionalExamples;
  }
  if (grammarPattern) {
    result.grammar_pattern = grammarPattern;
  }

  return result;
}

// 개념 ID 생성 함수
function generateConceptId(domain, category, expressions) {
  // 주요 언어 단어 기반으로 ID 생성
  const primaryWord =
    expressions.korean?.word ||
    expressions.english?.word ||
    Object.values(expressions)[0]?.word ||
    "unknown";

  // 안전한 ID 생성 (특수문자 제거)
  const safeWord = primaryWord.replace(/[^a-zA-Z0-9가-힣]/g, "_");
  return `${domain}_${category}_${safeWord}_${Date.now().toString(36)}`;
}

// 문법 패턴 ID 생성 함수
function generateGrammarPatternId(domain, category, pattern, tags) {
  if (!pattern && (!tags || tags.length === 0)) {
    return `pattern_${domain}_${category}_basic`;
  }

  // 패턴명 기반 또는 태그 기반으로 ID 생성
  const basePattern = pattern || tags.join("_");
  const safePattern = basePattern.replace(/[^a-zA-Z0-9]/g, "_");
  return `pattern_${domain}_${category}_${safePattern}`;
}

// 퀴즈 템플릿 ID 생성 함수
function generateQuizTemplateIds(conceptId, domain, category) {
  return [
    `quiz_${conceptId}_translation`,
    `quiz_${conceptId}_pronunciation`,
    `quiz_${conceptId}_matching`,
    `quiz_${domain}_${category}_general`,
  ];
}

// 게임 타입 ID 생성 함수
function generateGameTypeIds(conceptId, domain, category) {
  return [
    `game_${conceptId}_memory_card`,
    `game_${conceptId}_pronunciation`,
    `game_${domain}_${category}_word_puzzle`,
    `game_general_vocabulary_building`,
  ];
}

// 언어별 문법적 특성 자동 생성 헬퍼 함수
function generateGrammaticalFeatures(grammarTags, pattern, expressions) {
  const features = {};

  // 각 언어별 기본 특성 생성
  for (const [lang, expr] of Object.entries(expressions)) {
    if (!expr) continue;

    features[lang] = {
      sentence_type: detectSentenceType(grammarTags, lang),
      key_grammar_points: extractKeyGrammarPoints(grammarTags, lang),
    };

    // 언어별 특수 속성 추가
    if (lang === "korean") {
      features[lang].speech_level = detectSpeechLevel(grammarTags);
      features[lang].honorific_level = detectHonorificLevel(grammarTags);
    } else if (lang === "english") {
      features[lang].tense = detectTense(grammarTags);
      features[lang].voice = "active"; // 기본값
    } else if (lang === "japanese") {
      features[lang].speech_level = detectJapaneseSpeechLevel(grammarTags);
    } else if (lang === "chinese") {
      features[lang].tense = detectChineseTense(grammarTags);
    }
  }

  return features;
}

// 문장 유형 감지
function detectSentenceType(grammarTags, lang) {
  const sentenceTypes = {
    korean: {
      greeting: "감탄문",
      question: "의문문",
      declarative: "서술문",
      imperative: "명령문",
    },
    english: {
      greeting: "exclamation",
      question: "interrogative",
      declarative: "declarative",
      imperative: "imperative",
    },
    japanese: {
      greeting: "挨拶",
      question: "疑問文",
      declarative: "平叙文",
      imperative: "命令文",
    },
    chinese: {
      greeting: "问候语",
      question: "疑问句",
      declarative: "陈述句",
      imperative: "祈使句",
    },
  };

  // 태그에서 문장 유형 추출
  for (const tag of grammarTags) {
    if (tag.includes("greeting"))
      return sentenceTypes[lang]?.greeting || "기본문";
    if (tag.includes("question"))
      return sentenceTypes[lang]?.question || "기본문";
    if (tag.includes("imperative"))
      return sentenceTypes[lang]?.imperative || "기본문";
  }

  return sentenceTypes[lang]?.declarative || "기본문";
}

// 핵심 문법 포인트 추출
function extractKeyGrammarPoints(grammarTags, lang) {
  const points = [];

  grammarTags.forEach((tag) => {
    if (tag.includes("tense")) points.push("시제");
    if (tag.includes("object_marking")) points.push("목적어 표시");
    if (tag.includes("time_adverb")) points.push("시간 부사");
    if (tag.includes("polite")) points.push("정중함");
    if (tag.includes("greeting")) points.push("인사법");
  });

  return points.length > 0 ? points : ["기본 문법"];
}

// 한국어 높임법 감지
function detectSpeechLevel(grammarTags) {
  for (const tag of grammarTags) {
    if (tag.includes("haeyo")) return "해요체";
    if (tag.includes("hamnida")) return "합니다체";
    if (tag.includes("polite_ending:haeyo")) return "해요체";
  }
  return "기본 정중어";
}

// 존대 수준 감지
function detectHonorificLevel(grammarTags) {
  for (const tag of grammarTags) {
    if (tag.includes("formal")) return "정중함";
    if (tag.includes("polite")) return "일반 정중";
    if (tag.includes("respectful")) return "존경어";
  }
  return "일반";
}

// 영어 시제 감지
function detectTense(grammarTags) {
  for (const tag of grammarTags) {
    if (tag.includes("present_tense")) return "simple_present";
    if (tag.includes("past_tense")) return "simple_past";
    if (tag.includes("future_tense")) return "future";
  }
  return "present";
}

// 일본어 경어 수준 감지
function detectJapaneseSpeechLevel(grammarTags) {
  for (const tag of grammarTags) {
    if (tag.includes("keigo")) return "敬語";
    if (tag.includes("polite")) return "丁寧語";
  }
  return "普通語";
}

// 중국어 시제 감지
function detectChineseTense(grammarTags) {
  for (const tag of grammarTags) {
    if (tag.includes("present")) return "一般现在时";
    if (tag.includes("past")) return "过去时";
    if (tag.includes("future")) return "将来时";
  }
  return "一般现在时";
}

// 어휘 난이도 계산
function calculateVocabularyDifficulty(expressions) {
  let totalDifficulty = 0;
  let count = 0;

  for (const [lang, expr] of Object.entries(expressions)) {
    if (expr && expr.word) {
      let difficulty = 10; // 기본값

      // 단어 길이 기반
      if (expr.word.length > 8) difficulty += 15;
      else if (expr.word.length > 5) difficulty += 10;

      // 레벨 기반
      if (expr.level === "advanced" || expr.level === "고급") difficulty += 20;
      else if (expr.level === "intermediate" || expr.level === "중급")
        difficulty += 10;

      totalDifficulty += difficulty;
      count++;
    }
  }

  return count > 0 ? Math.round(totalDifficulty / count) : 15;
}

// 문법 복잡도 계산
function calculateGrammarComplexity(grammarTags) {
  let complexity = 10; // 기본값

  // 태그 개수 기반
  complexity += grammarTags.length * 3;

  // 복잡한 문법 요소 확인
  grammarTags.forEach((tag) => {
    if (tag.includes("complex") || tag.includes("advanced")) complexity += 15;
    if (tag.includes("honorific") || tag.includes("formal")) complexity += 10;
    if (tag.includes("compound") || tag.includes("sequential")) complexity += 8;
  });

  return Math.min(complexity, 50);
}

// 발음 난이도 계산
function calculatePronunciationDifficulty(expressions) {
  let totalDifficulty = 0;
  let count = 0;

  for (const [lang, expr] of Object.entries(expressions)) {
    if (expr && expr.word) {
      let difficulty = 15; // 기본값

      // 언어별 특성 고려
      if (lang === "chinese") difficulty += 15; // 성조
      if (lang === "japanese" && expr.kanji) difficulty += 10; // 한자 읽기
      if (lang === "korean" && expr.word.length > 4) difficulty += 5; // 긴 단어

      totalDifficulty += difficulty;
      count++;
    }
  }

  return count > 0 ? Math.round(totalDifficulty / count) : 20;
}

// 배열 필드 파싱 헬퍼 함수
function parseArrayField(value) {
  if (!value || typeof value !== "string") return [];
  return value
    .split("|")
    .map((item) => item.trim())
    .filter((item) => item);
}

// 연어 필드 파싱 헬퍼 함수
function parseCollocationsField(value) {
  if (!value || typeof value !== "string") return [];
  return value
    .split("|")
    .map((item) => {
      // frequency 지원 제거, 단순한 문구만 처리
      const phrase = item.includes(":")
        ? item.split(":")[0].trim()
        : item.trim();
      return phrase; // frequency 속성 완전 제거
    })
    .filter((phrase) => phrase); // 빈 문구 제거
}

// JSON 파일 파싱
function parseJSONFile(file, defaultDomain, defaultCategory) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = function (event) {
      try {
        const jsonText = event.target.result;
        const jsonData = JSON.parse(jsonText);

        if (!Array.isArray(jsonData)) {
          throw new Error("JSON 데이터는 배열 형식이어야 합니다.");
        }

        // 각 개념 데이터 처리
        for (const item of jsonData) {
          const conceptData = createConceptFromJSON(
            item,
            defaultDomain,
            defaultCategory
          );
          if (conceptData) {
            importedData.push(conceptData);
          }
        }

        resolve();
      } catch (error) {
        reject(new Error("JSON 파일 파싱 중 오류 발생: " + error.message));
      }
    };

    reader.onerror = function () {
      reject(new Error("파일 읽기 실패"));
    };

    reader.readAsText(file);
  });
}

// JSON 데이터에서 개념 객체 생성 - 방식 1 기반 분리된 컬렉션 구조
function createConceptFromJSON(item, defaultDomain, defaultCategory) {
  if (!item) return null;

  const domain = item.domain || defaultDomain;
  const category = item.category || defaultCategory;
  const emoji = item.emoji || "";

  if (!domain || !category) {
    console.warn("도메인 또는 카테고리가 없는 개념:", item);
    return null;
  }

  // 1. 언어별 표현 생성 (핵심 속성 유지)
  let expressions = {};
  const supportedLanguages = {
    korean: "한국어",
    english: "영어",
    japanese: "일본어",
    chinese: "중국어",
  };

  for (const langCode of Object.keys(supportedLanguages)) {
    const word = item[`${langCode}_word`];

    if (word) {
      // 핵심 단어 정보 (concepts 컬렉션에 포함)
      const expression = {
        word: word,
        pronunciation: item[`${langCode}_pronunciation`] || "",
        definition: item[`${langCode}_definition`] || "",
        part_of_speech: item[`${langCode}_part_of_speech`] || "noun",
        level: item[`${langCode}_level`] || "beginner",
        synonyms: parseArrayField(item[`${langCode}_synonyms`]),
        antonyms: parseArrayField(item[`${langCode}_antonyms`]),
        word_family: parseArrayField(item[`${langCode}_word_family`]),
        compound_words: parseArrayField(item[`${langCode}_compound_words`]),
        collocations: parseCollocationsField(item[`${langCode}_collocations`]),
      };

      // 언어별 특수 필드 추가
      if (langCode === "korean") {
        expression.romanization = item.korean_romanization || "";
      } else if (langCode === "english") {
        expression.phonetic = item.english_phonetic || "";
      } else if (langCode === "japanese") {
        expression.hiragana = item.japanese_hiragana || "";
        expression.katakana = item.japanese_katakana || "";
        expression.kanji = item.japanese_kanji || "";
        expression.romanization = item.japanese_romanization || "";
      } else if (langCode === "chinese") {
        expression.pinyin = item.chinese_pronunciation || "";
        expression.traditional = item.chinese_traditional || word;
        expression.simplified = item.chinese_simplified || word;
      }

      expressions[langCode] = expression;
    }
  }

  if (Object.keys(expressions).length === 0) {
    console.warn("유효한 단어가 없는 JSON 항목:", item);
    return null;
  }

  // 개념 ID 생성
  const conceptId = generateConceptId(domain, category, expressions);

  // 2. 대표 예문 생성 (concepts 컬렉션에 포함)
  let representativeExample = null;
  const repExampleKorean = item.representative_example_korean;
  const repExampleEnglish = item.representative_example_english;
  const repExampleJapanese = item.representative_example_japanese;
  const repExampleChinese = item.representative_example_chinese;

  if (
    repExampleKorean ||
    repExampleEnglish ||
    repExampleJapanese ||
    repExampleChinese
  ) {
    representativeExample = {
      example_id: `${conceptId}_rep_example`,
      context: item.representative_example_context || "general",
      difficulty: item.representative_example_difficulty || "beginner",
      translations: {},
    };

    // 각 언어별 번역 추가
    if (repExampleKorean) {
      representativeExample.translations.korean = {
        text: repExampleKorean,
        romanization: "",
      };
    }
    if (repExampleEnglish) {
      representativeExample.translations.english = {
        text: repExampleEnglish,
        phonetic: "",
      };
    }
    if (repExampleJapanese) {
      representativeExample.translations.japanese = {
        text: repExampleJapanese,
        romanization: "",
      };
    }
    if (repExampleChinese) {
      representativeExample.translations.chinese = {
        text: repExampleChinese,
        pinyin: "",
      };
    }
  }

  // 3. concept_info 생성 (불필요한 속성 제거)
  const conceptInfo = {
    domain: domain,
    category: category,
    difficulty: "beginner",
    unicode_emoji: emoji,
    color_theme: "#9C27B0",
    updated_at: new Date(),
  };

  // 4. 추가 예문 생성 (examples 컬렉션으로 분리)
  const additionalExamples = [];
  const addExamplesKorean = item.additional_examples_korean;
  const addExamplesEnglish = item.additional_examples_english;
  const addExamplesJapanese = item.additional_examples_japanese;
  const addExamplesChinese = item.additional_examples_chinese;

  if (
    addExamplesKorean ||
    addExamplesEnglish ||
    addExamplesJapanese ||
    addExamplesChinese
  ) {
    // 파이프로 구분된 여러 예문 처리
    const koreanExamples = addExamplesKorean
      ? addExamplesKorean.split("|")
      : [];
    const englishExamples = addExamplesEnglish
      ? addExamplesEnglish.split("|")
      : [];
    const japaneseExamples = addExamplesJapanese
      ? addExamplesJapanese.split("|")
      : [];
    const chineseExamples = addExamplesChinese
      ? addExamplesChinese.split("|")
      : [];
    const contexts = item.additional_examples_context
      ? item.additional_examples_context.split("|")
      : [];
    const difficulties = item.additional_examples_difficulty
      ? item.additional_examples_difficulty.split("|")
      : [];

    const maxExamples = Math.max(
      koreanExamples.length,
      englishExamples.length,
      japaneseExamples.length,
      chineseExamples.length
    );

    for (let i = 0; i < maxExamples; i++) {
      const example = {
        example_id: `${conceptId}_add_example_${i + 1}`,
        concept_id: conceptId,
        context: contexts[i] || "general",
        difficulty: difficulties[i] || "beginner",
        translations: {},
      };

      if (koreanExamples[i]) {
        example.translations.korean = {
          text: koreanExamples[i].trim(),
          romanization: "",
        };
      }
      if (englishExamples[i]) {
        example.translations.english = {
          text: englishExamples[i].trim(),
          phonetic: "",
        };
      }
      if (japaneseExamples[i]) {
        example.translations.japanese = {
          text: japaneseExamples[i].trim(),
          romanization: "",
        };
      }
      if (chineseExamples[i]) {
        example.translations.chinese = {
          text: chineseExamples[i].trim(),
          pinyin: "",
        };
      }

      additionalExamples.push(example);
    }
  }

  // 5. 문법 패턴 생성 (grammar_patterns 컬렉션으로 분리)
  let grammarPattern = null;
  const grammarPatternName = item.grammar_pattern_name;
  const grammarTags = item.grammar_tags;

  if (grammarPatternName || grammarTags) {
    grammarPattern = {
      pattern_id: `${conceptId}_grammar_pattern`,
      concept_id: conceptId,
      pattern_name: grammarPatternName || "기본 패턴",
      pattern_type: "basic",
      difficulty: "beginner",
      tags: grammarTags ? grammarTags.split("|") : [],
      learning_focus: item.learning_focus ? item.learning_focus.split("|") : [],
      explanations: {},
    };

    // 각 언어별 문법 설명 추가
    if (item.grammar_pattern_korean) {
      grammarPattern.explanations.korean = {
        pattern: item.grammar_pattern_korean,
        explanation: `${grammarPatternName} - 한국어 문법 패턴`,
      };
    }
    if (item.grammar_pattern_english) {
      grammarPattern.explanations.english = {
        pattern: item.grammar_pattern_english,
        explanation: `${grammarPatternName} - English grammar pattern`,
      };
    }
    if (item.grammar_pattern_japanese) {
      grammarPattern.explanations.japanese = {
        pattern: item.grammar_pattern_japanese,
        explanation: `${grammarPatternName} - 日本語文法パターン`,
      };
    }
    if (item.grammar_pattern_chinese) {
      grammarPattern.explanations.chinese = {
        pattern: item.grammar_pattern_chinese,
        explanation: `${grammarPatternName} - 中文语法模式`,
      };
    }
  }

  // 6. 최종 구조 반환 (방식 1)
  const result = {
    // concepts 컬렉션에 저장될 데이터
    concept: {
      concept_info: conceptInfo,
      expressions: expressions,
      representative_example: representativeExample,
      learning_metadata: {
        created_from: "json_import",
        import_date: new Date(),
        version: "2.0",
        structure_type: "method1_separated",
      },
    },
  };

  // 분리된 컬렉션 데이터 추가
  if (additionalExamples.length > 0) {
    result.examples = additionalExamples;
  }
  if (grammarPattern) {
    result.grammar_pattern = grammarPattern;
  }

  return result;
}

// 모달 닫기
function closeModal() {
  const modal = document.getElementById("bulk-import-modal");

  if (modal) {
    modal.classList.add("hidden");
  }

  // 파일 입력 초기화
  const fileInput = document.getElementById("file-input");
  const fileNameDisplay = document.getElementById("file-name");

  if (fileInput) {
    fileInput.value = "";
  }

  if (fileNameDisplay) {
    fileNameDisplay.textContent = "파일을 선택하거나 여기에 끌어다 놓으세요.";
  }

  // 가져오기 상태 초기화
  const importStatus = document.getElementById("import-status");

  if (importStatus) {
    importStatus.classList.add("hidden");
  }

  // 변수 초기화
  selectedFile = null;
  importedData = [];
  isImporting = false;
}

// 전역 함수로 내보내기 (다른 모듈에서 호출용)
window.openBulkImportModal = function () {
  const modal = document.getElementById("bulk-import-modal");

  if (modal) {
    modal.classList.remove("hidden");
  }

  toggleImportSettings(document.getElementById("import-mode").value);
};

// CSV 파싱 시 문법 태그 처리
function parseCSVRow(row, headers) {
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
