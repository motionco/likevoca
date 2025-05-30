import {
  auth,
  db,
  conceptUtils,
  supportedLanguages,
} from "../../js/firebase/firebase-init.js";

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

// CSV 템플릿 다운로드
function downloadCSVTemplate() {
  // 새로운 확장된 CSV 헤더
  const headers = [
    "domain",
    "category",
    "difficulty",
    "tags",
    "unicode_emoji",
    "color_theme",
    "quiz_frequency",
    "game_types",
    "korean_word",
    "korean_pronunciation",
    "korean_romanization",
    "korean_definition",
    "korean_part_of_speech",
    "korean_level",
    "korean_synonyms",
    "korean_antonyms",
    "korean_word_family",
    "korean_compound_words",
    "korean_collocations",
    "korean_audio",
    "english_word",
    "english_pronunciation",
    "english_phonetic",
    "english_definition",
    "english_part_of_speech",
    "english_level",
    "english_synonyms",
    "english_antonyms",
    "english_word_family",
    "english_compound_words",
    "english_collocations",
    "english_audio",
    "japanese_word",
    "japanese_hiragana",
    "japanese_katakana",
    "japanese_kanji",
    "japanese_pronunciation",
    "japanese_romanization",
    "japanese_definition",
    "japanese_part_of_speech",
    "japanese_level",
    "japanese_synonyms",
    "japanese_antonyms",
    "japanese_word_family",
    "japanese_compound_words",
    "japanese_collocations",
    "japanese_audio",
    "chinese_word",
    "chinese_pronunciation",
    "chinese_definition",
    "chinese_part_of_speech",
    "chinese_level",
    "chinese_synonyms",
    "chinese_antonyms",
    "chinese_word_family",
    "chinese_compound_words",
    "chinese_collocations",
    "chinese_audio",
    "primary_image",
    "secondary_image",
    "illustration_image",
    "intro_video",
    "pronunciation_video",
    "example_1_korean",
    "example_1_english",
    "example_1_japanese",
    "example_1_chinese",
    "example_1_context",
    "example_1_priority",
    "example_1_emoji",
    "example_2_korean",
    "example_2_english",
    "example_2_japanese",
    "example_2_chinese",
    "example_2_context",
    "example_2_priority",
    "example_2_emoji",
    "quiz_question_types",
    "quiz_difficulty_multiplier",
    "quiz_hint_korean",
    "quiz_hint_english",
    "quiz_hint_japanese",
    "quiz_hint_chinese",
    "memorization_difficulty",
    "pronunciation_difficulty",
    "usage_frequency",
    "cultural_importance",
  ];

  // 새로운 확장된 샘플 데이터
  const sampleRows = [
    [
      "food",
      "fruit",
      "basic",
      "everyday,healthy,common",
      "🍎",
      "#FF6B6B",
      "high",
      "matching,pronunciation,spelling",
      "사과",
      "sa-gwa",
      "sagwa",
      "둥글고 단맛이 나는 열매",
      "명사",
      "초급",
      "",
      "",
      "과일|과실|열매",
      "사과나무|사과즙|사과파이|사과가게|사과상자",
      "사과를 먹다:high|빨간 사과:high|사과 한 개:medium",
      "",
      "apple",
      "ˈæpl",
      "/ˈæpəl/",
      "a round fruit with firm, white flesh and a green, red, or yellow skin",
      "noun",
      "beginner",
      "",
      "",
      "fruit|produce|orchard fruit",
      "apple tree|apple juice|apple pie|appleshop|applesauce",
      "eat an apple:high|red apple:high|green apple:medium",
      "",
      "りんご",
      "りんご",
      "リンゴ",
      "",
      "ringo",
      "ringo",
      "赤や緑の皮をもつ、甘くて丸い果物",
      "名詞",
      "初級",
      "アップル",
      "",
      "果物|果実|青果",
      "りんごの木|りんごジュース|りんご屋|りんご箱",
      "りんごを食べる:high|赤いりんご:high",
      "",
      "苹果",
      "píng guǒ",
      "红色或绿色皮的甜美水果",
      "名词",
      "初级",
      "",
      "",
      "水果|果实|鲜果",
      "苹果树|苹果汁|苹果派|苹果店",
      "吃苹果:high|红苹果:high",
      "",
      "https://source.unsplash.com/400x300/?apple",
      "https://source.unsplash.com/400x300/?apple_green",
      "https://api.iconify.design/noto:red-apple.svg",
      "",
      "",
      "아침에 사과를 먹어요.",
      "I eat an apple in the morning.",
      "朝にりんごを食べます。",
      "我早上吃苹果。",
      "daily_routine",
      "high",
      "🌅",
      "사과 두 개 주세요.",
      "Please give me two apples.",
      "りんごを二つください。",
      "请给我两个苹果。",
      "shopping",
      "high",
      "🛒",
      "translation,pronunciation,matching,fill_blank,multiple_choice",
      "1.0",
      "빨간색 또는 초록색 과일",
      "Red or green fruit that grows on trees",
      "木になる赤や緑の果物",
      "长在树上的红色或绿色水果",
      "2",
      "1",
      "very_high",
      "medium",
    ],
    [
      "daily",
      "greeting",
      "basic",
      "polite,common,essential",
      "👋",
      "#4CAF50",
      "very_high",
      "matching,pronunciation",
      "안녕하세요",
      "an-nyeong-ha-se-yo",
      "annyeonghaseyo",
      "정중한 인사말",
      "감탄사",
      "초급",
      "안녕|반갑습니다",
      "안녕히 가세요",
      "인사|인사말|예의",
      "안녕인사|안녕소식|안녕메시지",
      "안녕하세요, 만나서 반갑습니다:high",
      "",
      "hello",
      "həˈloʊ",
      "/həˈloʊ/",
      "used as a greeting or to begin a phone conversation",
      "exclamation",
      "beginner",
      "hi|hey|greetings",
      "goodbye|bye",
      "greeting|salutation|welcome",
      "hello-world|hello-sign|hello-message",
      "say hello:high|hello there:medium",
      "",
      "こんにちは",
      "こんにちは",
      "",
      "今日は",
      "konnichiwa",
      "konnichiwa",
      "昼間の挨拶",
      "感動詞",
      "初級",
      "おはよう|こんばんは",
      "さようなら",
      "挨拶|礼儀|言葉",
      "こんにちは挨拶|こんにちはメッセージ",
      "こんにちは、元気ですか:high",
      "",
      "你好",
      "nǐ hǎo",
      "见面时的礼貌问候语",
      "感叹词",
      "初级",
      "您好|你们好",
      "再见|拜拜",
      "问候|礼貌|招呼",
      "你好问候|你好信息",
      "你好，很高兴见到你:high",
      "",
      "https://source.unsplash.com/400x300/?greeting",
      "",
      "https://api.iconify.design/noto:waving-hand.svg",
      "",
      "",
      "안녕하세요. 만나서 반갑습니다.",
      "Hello, nice to meet you.",
      "こんにちは。はじめまして。",
      "你好，很高兴见到你。",
      "meeting",
      "very_high",
      "🤝",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "translation,pronunciation,matching",
      "0.8",
      "만날 때 하는 인사",
      "A greeting when you meet someone",
      "人に会った時の挨拶",
      "遇到某人时的问候语",
      "1",
      "2",
      "very_high",
      "very_high",
    ],
  ];

  // CSV 문자열 생성
  let csvContent = headers.join(",") + "\n";

  sampleRows.forEach((row) => {
    csvContent +=
      row
        .map((cell) => {
          // 쉼표나 쌍따옴표가 있으면 쌍따옴표로 감싸고 내부 쌍따옴표는 두 번 표시
          if (cell && (cell.includes(",") || cell.includes('"'))) {
            return `"${cell.replace(/"/g, '""')}"`;
          }
          return cell || "";
        })
        .join(",") + "\n";
  });

  // Blob 생성 및 다운로드
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", "concept_template.csv");
  link.style.display = "none";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// JSON 템플릿 다운로드
function downloadJSONTemplate() {
  // 새로운 확장된 JSON 템플릿 데이터
  const jsonTemplate = [
    {
      concept_info: {
        domain: "food",
        category: "fruit",
        difficulty: "basic",
        tags: ["everyday", "healthy", "common"],
        unicode_emoji: "🍎",
        color_theme: "#FF6B6B",
        quiz_frequency: "high",
        game_types: ["matching", "pronunciation", "spelling"],
      },
      media: {
        images: {
          primary: "https://source.unsplash.com/400x300/?apple",
          secondary: "https://source.unsplash.com/400x300/?apple_green",
          illustration:
            "https://api.iconify.design/noto:red-apple.svg?width=400",
          emoji_style:
            "https://api.iconify.design/twemoji:red-apple.svg?width=200",
          line_art: null,
        },
        videos: {
          intro: null,
          pronunciation: null,
        },
        audio: {
          pronunciation_slow: null,
          pronunciation_normal: null,
          word_in_sentence: null,
        },
      },
      expressions: {
        korean: {
          word: "사과",
          pronunciation: "sa-gwa",
          romanization: "sagwa",
          definition: "둥글고 단맛이 나는 열매",
          part_of_speech: "명사",
          level: "초급",
          unicode_emoji: "🍎",
          synonyms: [],
          antonyms: [],
          word_family: ["과일", "과실", "열매"],
          compound_words: [
            "사과나무",
            "사과즙",
            "사과파이",
            "사과가게",
            "사과상자",
          ],
          conjugations: null,
          collocations: [
            { phrase: "사과를 먹다", frequency: "high" },
            { phrase: "빨간 사과", frequency: "high" },
            { phrase: "사과 한 개", frequency: "medium" },
          ],
        },
        english: {
          word: "apple",
          pronunciation: "ˈæpl",
          phonetic: "/ˈæpəl/",
          definition:
            "a round fruit with firm, white flesh and a green, red, or yellow skin",
          part_of_speech: "noun",
          level: "beginner",
          unicode_emoji: "🍎",
          synonyms: [],
          antonyms: [],
          word_family: ["fruit", "produce", "orchard fruit"],
          compound_words: [
            "apple tree",
            "apple juice",
            "apple pie",
            "apple store",
            "apple sauce",
          ],
          conjugations: { plural: "apples" },
          collocations: [
            { phrase: "eat an apple", frequency: "high" },
            { phrase: "red apple", frequency: "high" },
            { phrase: "green apple", frequency: "medium" },
          ],
        },
        japanese: {
          word: "りんご",
          hiragana: "りんご",
          katakana: "リンゴ",
          kanji: null,
          pronunciation: "ringo",
          romanization: "ringo",
          definition: "赤や緑の皮をもつ、甘くて丸い果物",
          part_of_speech: "名詞",
          level: "初級",
          unicode_emoji: "🍎",
          synonyms: ["アップル"],
          antonyms: [],
          word_family: ["果物", "果実", "青果"],
          compound_words: [
            "りんごの木",
            "りんごジュース",
            "りんご屋",
            "りんご箱",
          ],
          conjugations: null,
          collocations: [
            { phrase: "りんごを食べる", frequency: "high" },
            { phrase: "赤いりんご", frequency: "high" },
          ],
        },
        chinese: {
          word: "苹果",
          pronunciation: "píng guǒ",
          definition: "红色或绿色皮的甜美水果",
          part_of_speech: "名词",
          level: "初级",
          unicode_emoji: "🍎",
          synonyms: [],
          antonyms: [],
          word_family: ["水果", "果实", "鲜果"],
          compound_words: ["苹果树", "苹果汁", "苹果派", "苹果店"],
          conjugations: null,
          collocations: [
            { phrase: "吃苹果", frequency: "high" },
            { phrase: "红苹果", frequency: "high" },
          ],
        },
      },
      featured_examples: [
        {
          example_id: "example_apple_1",
          level: "beginner",
          context: "daily_routine",
          priority: "high",
          unicode_emoji: "🌅",
          quiz_weight: 10,
          translations: {
            korean: {
              text: "아침에 사과를 먹어요.",
              grammar_notes: "현재 시제, 목적어 활용",
            },
            english: {
              text: "I eat an apple in the morning.",
              grammar_notes: "Simple present tense, article usage",
            },
            japanese: {
              text: "朝にりんごを食べます。",
              grammar_notes: "現在形、助詞の使い方",
            },
            chinese: {
              text: "我早上吃苹果。",
              grammar_notes: "现在时态，时间表达",
            },
          },
        },
      ],
      quiz_data: {
        question_types: [
          "translation",
          "pronunciation",
          "matching",
          "fill_blank",
          "multiple_choice",
        ],
        difficulty_multiplier: 1.0,
        common_mistakes: [
          { mistake: "aple", correction: "apple", type: "spelling" },
          { mistake: "apel", correction: "apple", type: "spelling" },
        ],
        hint_text: {
          korean: "빨간색 또는 초록색 과일",
          english: "Red or green fruit that grows on trees",
          japanese: "木になる赤や緑の果物",
          chinese: "长在树上的红色或绿色水果",
        },
      },
      game_data: {
        memory_card: {
          front_image: "https://api.iconify.design/noto:red-apple.svg",
          back_text: "apple / 사과 / りんご / 苹果",
        },
        word_puzzle: {
          scrambled: ["a", "p", "p", "l", "e"],
          hints: ["Red or green fruit", "Grows on trees", "🍎"],
        },
        pronunciation_game: {
          target_phoneme: "/ˈæpəl/",
          similar_sounds: ["/ˈæpəl/", "/ˈæpəl/"],
          practice_words: ["apple", "ample", "chapel"],
        },
      },
      related_concepts: [],
      learning_metadata: {
        memorization_difficulty: 2,
        pronunciation_difficulty: 1,
        usage_frequency: "very_high",
        cultural_importance: "medium",
      },
    },
    {
      concept_info: {
        domain: "daily",
        category: "greeting",
        difficulty: "basic",
        tags: ["polite", "common", "essential"],
        unicode_emoji: "👋",
        color_theme: "#4CAF50",
        quiz_frequency: "very_high",
        game_types: ["matching", "pronunciation"],
      },
      media: {
        images: {
          primary: "https://source.unsplash.com/400x300/?greeting",
          secondary: null,
          illustration:
            "https://api.iconify.design/noto:waving-hand.svg?width=400",
          emoji_style:
            "https://api.iconify.design/twemoji:waving-hand.svg?width=200",
          line_art: null,
        },
        videos: {
          intro: null,
          pronunciation: null,
        },
        audio: {
          pronunciation_slow: null,
          pronunciation_normal: null,
          word_in_sentence: null,
        },
      },
      expressions: {
        korean: {
          word: "안녕하세요",
          pronunciation: "an-nyeong-ha-se-yo",
          romanization: "annyeonghaseyo",
          definition: "정중한 인사말",
          part_of_speech: "감탄사",
          level: "초급",
          unicode_emoji: "👋",
          synonyms: ["안녕", "반갑습니다"],
          antonyms: ["안녕히 가세요"],
          word_family: ["인사", "인사말", "예의"],
          compound_words: ["안녕인사", "안녕소식", "안녕메시지"],
          conjugations: null,
          collocations: [
            { phrase: "안녕하세요, 만나서 반갑습니다", frequency: "high" },
          ],
        },
        english: {
          word: "hello",
          pronunciation: "həˈloʊ",
          phonetic: "/həˈloʊ/",
          definition: "used as a greeting or to begin a phone conversation",
          part_of_speech: "exclamation",
          level: "beginner",
          unicode_emoji: "👋",
          synonyms: ["hi", "hey", "greetings"],
          antonyms: ["goodbye", "bye"],
          word_family: ["greeting", "salutation", "welcome"],
          compound_words: ["hello-world", "hello-sign", "hello-message"],
          conjugations: null,
          collocations: [
            { phrase: "say hello", frequency: "high" },
            { phrase: "hello there", frequency: "medium" },
          ],
        },
        japanese: {
          word: "こんにちは",
          hiragana: "こんにちは",
          katakana: null,
          kanji: "今日は",
          pronunciation: "konnichiwa",
          romanization: "konnichiwa",
          definition: "昼間の挨拶",
          part_of_speech: "感動詞",
          level: "初級",
          unicode_emoji: "👋",
          synonyms: ["おはよう", "こんばんは"],
          antonyms: ["さようなら"],
          word_family: ["挨拶", "礼儀", "言葉"],
          compound_words: ["こんにちは挨拶", "こんにちはメッセージ"],
          conjugations: null,
          collocations: [
            { phrase: "こんにちは、元気ですか", frequency: "high" },
          ],
        },
        chinese: {
          word: "你好",
          pronunciation: "nǐ hǎo",
          definition: "见面时的礼貌问候语",
          part_of_speech: "感叹词",
          level: "初级",
          unicode_emoji: "👋",
          synonyms: ["您好", "你们好"],
          antonyms: ["再见", "拜拜"],
          word_family: ["问候", "礼貌", "招呼"],
          compound_words: ["你好问候", "你好信息"],
          conjugations: null,
          collocations: [{ phrase: "你好，很高兴见到你", frequency: "high" }],
        },
      },
      featured_examples: [
        {
          example_id: "example_hello_1",
          level: "beginner",
          context: "meeting",
          priority: "very_high",
          unicode_emoji: "🤝",
          quiz_weight: 15,
          translations: {
            korean: {
              text: "안녕하세요. 만나서 반갑습니다.",
              grammar_notes: "정중한 인사, 존댓말",
            },
            english: {
              text: "Hello, nice to meet you.",
              grammar_notes: "Formal greeting, politeness",
            },
            japanese: {
              text: "こんにちは。はじめまして。",
              grammar_notes: "丁寧な挨拶、初対面",
            },
            chinese: {
              text: "你好，很高兴见到你。",
              grammar_notes: "礼貌问候，初次见面",
            },
          },
        },
      ],
      quiz_data: {
        question_types: ["translation", "pronunciation", "matching"],
        difficulty_multiplier: 0.8,
        common_mistakes: [
          { mistake: "helo", correction: "hello", type: "spelling" },
          { mistake: "hallo", correction: "hello", type: "spelling" },
        ],
        hint_text: {
          korean: "만날 때 하는 인사",
          english: "A greeting when you meet someone",
          japanese: "人に会った時の挨拶",
          chinese: "遇到某人时的问候语",
        },
      },
      game_data: {
        memory_card: {
          front_image: "https://api.iconify.design/noto:waving-hand.svg",
          back_text: "hello / 안녕하세요 / こんにちは / 你好",
        },
        word_puzzle: {
          scrambled: ["h", "e", "l", "l", "o"],
          hints: ["Greeting word", "First thing you say", "👋"],
        },
        pronunciation_game: {
          target_phoneme: "/həˈloʊ/",
          similar_sounds: ["/həˈloʊ/", "/hæˈloʊ/"],
          practice_words: ["hello", "below", "yellow"],
        },
      },
      related_concepts: [],
      learning_metadata: {
        memorization_difficulty: 1,
        pronunciation_difficulty: 2,
        usage_frequency: "very_high",
        cultural_importance: "very_high",
      },
    },
  ];

  // JSON 문자열로 변환 (들여쓰기 포함)
  const jsonContent = JSON.stringify(jsonTemplate, null, 2);

  // Blob 생성 및 다운로드
  const blob = new Blob([jsonContent], {
    type: "application/json;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", "concept_template.json");
  link.style.display = "none";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// 가져오기 시작
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

    // 데이터 가져오기 시작
    importResult.textContent = `${importedData.length}개의 개념을 가져오는 중...`;

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < importedData.length; i++) {
      try {
        await conceptUtils.createConcept(importedData[i]);
        successCount++;
      } catch (error) {
        console.error("개념 가져오기 오류:", error);
        errorCount++;
      }

      // 진행률 업데이트
      const progressPercent = Math.round(((i + 1) / importedData.length) * 100);
      importProgress.style.width = `${progressPercent}%`;
      importPercentage.textContent = `${progressPercent}%`;

      // 결과 업데이트
      importResult.textContent = `처리 중: ${i + 1}/${
        importedData.length
      } (성공: ${successCount}, 실패: ${errorCount})`;

      // 렌더링을 위한 지연
      await new Promise((resolve) => setTimeout(resolve, 10));
    }

    // 최종 결과 표시
    importResult.innerHTML = `
      <div class="text-green-700 font-medium">가져오기 완료</div>
      <div>전체: ${importedData.length}개, 성공: ${successCount}개, 실패: ${errorCount}개</div>
    `;

    // 이벤트 발생 (목록 새로고침)
    window.dispatchEvent(new CustomEvent("concept-saved"));

    // 대량 개념 추가 완료 이벤트 발생
    window.dispatchEvent(
      new CustomEvent("bulk-import-completed", {
        detail: {
          total: importedData.length,
          success: successCount,
          failed: errorCount,
        },
      })
    );
  } catch (error) {
    console.error("가져오기 오류:", error);
    importResult.innerHTML = `
      <div class="text-red-700 font-medium">오류 발생</div>
      <div>${error.message}</div>
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

// CSV 데이터에서 개념 객체 생성
function createConceptFromCSV(
  values,
  headerRow,
  defaultDomain,
  defaultCategory
) {
  // 헤더가 있는 경우와 없는 경우 처리
  let domain, category, emoji;
  let expressions = {};
  let examples = [];

  if (headerRow) {
    // 헤더가 있는 경우 - 헤더 이름으로 매핑
    const valueMap = {};

    headerRow.forEach((header, index) => {
      if (index < values.length) {
        valueMap[header.trim()] = values[index];
      }
    });

    domain = valueMap.domain || defaultDomain;
    category = valueMap.category || defaultCategory;
    emoji = valueMap.emoji || "";

    // 언어별 표현 생성
    for (const langCode of Object.keys(supportedLanguages)) {
      const word = valueMap[`${langCode}_word`];

      if (word) {
        expressions[langCode] = {
          word: word,
          pronunciation: valueMap[`${langCode}_pronunciation`] || "",
          definition: valueMap[`${langCode}_definition`] || "",
          part_of_speech: valueMap[`${langCode}_part_of_speech`] || "noun",
          level: valueMap[`${langCode}_level`] || "beginner",
          synonyms: parseArrayField(valueMap[`${langCode}_synonyms`]),
          antonyms: parseArrayField(valueMap[`${langCode}_antonyms`]),
          word_family: parseArrayField(valueMap[`${langCode}_word_family`]),
          compound_words: parseArrayField(
            valueMap[`${langCode}_compound_words`]
          ),
          collocations: parseCollocationsField(
            valueMap[`${langCode}_collocations`]
          ),
        };
      }
    }

    // 예제 생성
    const exampleKorean = valueMap.example_korean;
    const exampleEnglish = valueMap.example_english;
    const exampleJapanese = valueMap.example_japanese;
    const exampleChinese = valueMap.example_chinese;

    if (exampleKorean || exampleEnglish || exampleJapanese || exampleChinese) {
      const example = {};

      if (exampleKorean) example.korean = exampleKorean;
      if (exampleEnglish) example.english = exampleEnglish;
      if (exampleJapanese) example.japanese = exampleJapanese;
      if (exampleChinese) example.chinese = exampleChinese;

      examples.push(example);
    }
  } else {
    // 헤더가 없는 경우 - 인덱스 기반 매핑
    domain = values[0] || defaultDomain;
    category = values[1] || defaultCategory;
    emoji = values[2] || "";

    // 한국어
    if (values[3]) {
      expressions.korean = {
        word: values[3],
        pronunciation: values[4] || "",
        definition: values[5] || "",
        part_of_speech: values[6] || "noun",
        level: values[7] || "beginner",
      };
    }

    // 영어
    if (values[8]) {
      expressions.english = {
        word: values[8],
        pronunciation: values[9] || "",
        definition: values[10] || "",
        part_of_speech: values[11] || "noun",
        level: values[12] || "beginner",
      };
    }

    // 일본어
    if (values[13]) {
      expressions.japanese = {
        word: values[13],
        pronunciation: values[14] || "",
        definition: values[15] || "",
        part_of_speech: values[16] || "noun",
        level: values[17] || "beginner",
      };
    }

    // 중국어
    if (values[18]) {
      expressions.chinese = {
        word: values[18],
        pronunciation: values[19] || "",
        definition: values[20] || "",
        part_of_speech: values[21] || "noun",
        level: values[22] || "beginner",
      };
    }

    // 예제
    const exampleKorean = values[23];
    const exampleEnglish = values[24];
    const exampleJapanese = values[25];
    const exampleChinese = values[26];

    if (exampleKorean || exampleEnglish || exampleJapanese || exampleChinese) {
      const example = {};

      if (exampleKorean) example.korean = exampleKorean;
      if (exampleEnglish) example.english = exampleEnglish;
      if (exampleJapanese) example.japanese = exampleJapanese;
      if (exampleChinese) example.chinese = exampleChinese;

      examples.push(example);
    }
  }

  // 유효성 검사
  if (!domain || !category || Object.keys(expressions).length === 0) {
    console.warn("유효하지 않은 개념 데이터:", values);
    return null;
  }

  // 개념 객체 반환 (created_at을 concept_info 바깥으로)
  return {
    concept_info: {
      domain: domain,
      category: category,
      emoji: emoji,
      images: [],
    },
    expressions: expressions,
    examples: examples,
    created_at: new Date(), // concept_info 바깥으로 이동
  };
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
      const parts = item.split(":");
      if (parts.length === 2) {
        return {
          phrase: parts[0].trim(),
          frequency: parts[1].trim(),
        };
      }
      return { phrase: item.trim(), frequency: "medium" };
    })
    .filter((item) => item.phrase);
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

// JSON 데이터에서 개념 객체 생성 (확장된 구조 지원)
function createConceptFromJSON(item, defaultDomain, defaultCategory) {
  if (!item) return null;

  // 기본 정보 검증 및 설정
  const domain = item.concept_info?.domain || item.domain || defaultDomain;
  const category =
    item.concept_info?.category || item.category || defaultCategory;

  if (!domain || !category) {
    console.warn("도메인 또는 카테고리가 없는 개념:", item);
    return null;
  }

  // 표현 정보 검증
  if (!item.expressions || Object.keys(item.expressions).length === 0) {
    console.warn("유효한 표현이 없는 개념:", item);
    return null;
  }

  // 유효한 표현 필터링 및 확장 정보 포함
  const expressions = {};

  for (const [lang, expr] of Object.entries(item.expressions)) {
    if (expr && expr.word) {
      expressions[lang] = {
        word: expr.word,
        pronunciation: expr.pronunciation || "",
        romanization: expr.romanization || "",
        phonetic: expr.phonetic || "",
        definition: expr.definition || "",
        part_of_speech: expr.part_of_speech || "noun",
        level: expr.level || "beginner",
        unicode_emoji: expr.unicode_emoji || "",
        synonyms: expr.synonyms || [],
        antonyms: expr.antonyms || [],
        word_family: expr.word_family || [],
        compound_words: expr.compound_words || [],
        conjugations: expr.conjugations || null,
        collocations: expr.collocations || [],
        // 일본어 특수 필드
        hiragana: expr.hiragana || "",
        katakana: expr.katakana || "",
        kanji: expr.kanji || "",
        // 오디오 정보
        audio: expr.audio || "",
      };
    }
  }

  if (Object.keys(expressions).length === 0) {
    console.warn("유효한 단어가 없는 개념:", item);
    return null;
  }

  // 개념 정보 구성 (확장된 구조, created_at 제거)
  const conceptInfo = {
    domain: domain,
    category: category,
    difficulty: item.concept_info?.difficulty || "basic",
    tags: item.concept_info?.tags || [],
    unicode_emoji:
      item.concept_info?.unicode_emoji || item.concept_info?.emoji || "",
    color_theme: item.concept_info?.color_theme || "#9C27B0",
    updated_at: new Date(),
    total_examples_count: 0, // 나중에 계산
    quiz_frequency: item.concept_info?.quiz_frequency || "medium",
    game_types: item.concept_info?.game_types || ["matching", "pronunciation"],
  };

  // 미디어 정보 처리
  const media = {
    images: {
      primary: item.media?.images?.primary || "",
      secondary: item.media?.images?.secondary || "",
      illustration: item.media?.images?.illustration || "",
      emoji_style: item.media?.images?.emoji_style || "",
      line_art: item.media?.images?.line_art || "",
    },
    videos: {
      intro: item.media?.videos?.intro || "",
      pronunciation: item.media?.videos?.pronunciation || "",
    },
    audio: {
      pronunciation_slow: item.media?.audio?.pronunciation_slow || "",
      pronunciation_normal: item.media?.audio?.pronunciation_normal || "",
      word_in_sentence: item.media?.audio?.word_in_sentence || "",
    },
  };

  // 예제 처리 (기존 형식과 새 형식 모두 지원)
  let examples = [];

  // 기존 형식 (item.examples)
  if (Array.isArray(item.examples)) {
    for (const ex of item.examples) {
      if (ex && Object.keys(ex).length > 0) {
        examples.push(ex);
      }
    }
  }

  // 새로운 형식 (item.featured_examples)
  const featuredExamples = [];
  if (Array.isArray(item.featured_examples)) {
    for (const ex of item.featured_examples) {
      if (ex && ex.translations) {
        featuredExamples.push({
          example_id:
            ex.example_id ||
            `example_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          level: ex.level || "beginner",
          context: ex.context || "general",
          priority: ex.priority || "medium",
          unicode_emoji: ex.unicode_emoji || "",
          quiz_weight: ex.quiz_weight || 5,
          translations: ex.translations || {},
        });
      }
    }
  }

  // 예제 수 업데이트
  conceptInfo.total_examples_count = examples.length + featuredExamples.length;

  // 퀴즈 데이터 처리
  const quizData = {
    question_types: item.quiz_data?.question_types || [
      "translation",
      "multiple_choice",
    ],
    difficulty_multiplier: item.quiz_data?.difficulty_multiplier || 1.0,
    common_mistakes: item.quiz_data?.common_mistakes || [],
    hint_text: item.quiz_data?.hint_text || {},
  };

  // 게임 데이터 처리
  const gameData = {
    memory_card: {
      front_image: item.game_data?.memory_card?.front_image || "",
      back_text: item.game_data?.memory_card?.back_text || "",
    },
    word_puzzle: {
      scrambled: item.game_data?.word_puzzle?.scrambled || [],
      hints: item.game_data?.word_puzzle?.hints || [],
    },
    pronunciation_game: {
      target_phoneme: item.game_data?.pronunciation_game?.target_phoneme || "",
      similar_sounds: item.game_data?.pronunciation_game?.similar_sounds || [],
      practice_words: item.game_data?.pronunciation_game?.practice_words || [],
    },
  };

  // 학습 메타데이터 처리
  const learningMetadata = {
    memorization_difficulty:
      item.learning_metadata?.memorization_difficulty || 3,
    pronunciation_difficulty:
      item.learning_metadata?.pronunciation_difficulty || 3,
    usage_frequency: item.learning_metadata?.usage_frequency || "medium",
    cultural_importance:
      item.learning_metadata?.cultural_importance || "medium",
  };

  // 관련 개념 처리
  const relatedConcepts = item.related_concepts || [];

  // 완전한 개념 객체 반환 (created_at을 concept_info 바깥으로)
  const conceptObject = {
    concept_info: conceptInfo,
    media: media,
    expressions: expressions,
    featured_examples: featuredExamples,
    quiz_data: quizData,
    game_data: gameData,
    related_concepts: relatedConcepts,
    learning_metadata: learningMetadata,
    created_at: new Date(), // concept_info 바깥으로 이동
  };

  // 기존 형식의 예제가 있으면 추가
  if (examples.length > 0) {
    conceptObject.examples = examples;
  }

  console.log("생성된 개념 객체:", conceptObject);
  return conceptObject;
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
