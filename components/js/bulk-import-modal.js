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

// CSV 템플릿 다운로드 - 예문 중심 문법 시스템 적용
function downloadCSVTemplate() {
  // 예문 중심 문법 시스템을 포함한 간소화된 CSV 헤더
  const headers = [
    "domain",
    "category",
    "difficulty",
    "tags",
    "unicode_emoji",
    "color_theme",
    "quiz_frequency",
    "game_types",
    // 한국어 (grammar_system 제거)
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
    // 영어
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
    // 일본어
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
    // 중국어
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
    // 미디어
    "primary_image",
    "secondary_image",
    "illustration_image",
    // 예문 중심 문법 시스템 (강화됨)
    "example_1_korean",
    "example_1_english",
    "example_1_japanese",
    "example_1_chinese",
    "example_1_context",
    "example_1_grammar_pattern",
    "example_1_grammar_tags",
    "example_1_grammar_focus",
    "example_1_difficulty",
    "example_1_priority",
  ];

  // 예문 중심 문법 시스템을 사용한 샘플 데이터
  const sampleRows = [
    [
      // 사과 개념
      "food",
      "fruit",
      "beginner",
      "everyday|healthy|common",
      "🍎",
      "#FF6B6B",
      "high",
      "matching|pronunciation|spelling",
      // 한국어 (단순화)
      "사과",
      "sa-gwa",
      "sagwa",
      "둥글고 단맛이 나는 열매",
      "명사",
      "초급",
      "",
      "",
      "과일|과실|열매",
      "사과나무|사과즙|사과파이",
      "사과를 먹다:high|빨간 사과:high",
      // 영어
      "apple",
      "ˈæpl",
      "/ˈæpəl/",
      "a round fruit with firm white flesh and a green red or yellow skin",
      "noun",
      "beginner",
      "",
      "",
      "fruit|produce|orchard fruit",
      "apple tree|apple juice|apple pie",
      "eat an apple:high|red apple:high",
      // 일본어
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
      "りんごの木|りんごジュース",
      "りんごを食べる:high|赤いりんご:high",
      // 중국어
      "苹果",
      "píng guǒ",
      "红色或绿色皮的甜美水果",
      "名词",
      "初级",
      "",
      "",
      "水果|果实|鲜果",
      "苹果树|苹果汁|苹果派",
      "吃苹果:high|红苹果:high",
      // 미디어
      "https://source.unsplash.com/400x300/?apple",
      "https://source.unsplash.com/400x300/?apple_green",
      "https://api.iconify.design/noto:red-apple.svg?width=400",
      // 예문 + 상세 문법 정보
      "아침에 사과를 먹어요.",
      "I eat an apple in the morning.",
      "朝にりんごを食べます。",
      "我早上吃苹果。",
      "daily_routine",
      "S + 시간부사 + O + V",
      "present_tense|time_adverb:morning|object_marking|polite_ending:haeyo|daily_routine|food_consumption",
      "시간표현|목적어|현재시제|정중함",
      "beginner",
      "1",
    ],
    [
      // 인사 개념
      "daily",
      "greeting",
      "beginner",
      "polite|common|essential",
      "👋",
      "#4CAF50",
      "very_high",
      "matching|pronunciation",
      // 한국어 (단순화)
      "안녕하세요",
      "an-nyeong-ha-se-yo",
      "annyeonghaseyo",
      "정중한 인사말",
      "감탄사",
      "초급",
      "안녕|반갑습니다",
      "안녕히 가세요",
      "인사|인사말|예의",
      "안녕인사|안녕메시지",
      "안녕하세요, 만나서 반갑습니다:high",
      // 영어
      "hello",
      "həˈloʊ",
      "/həˈloʊ/",
      "used as a greeting or to begin a phone conversation",
      "exclamation",
      "beginner",
      "hi|hey|greetings",
      "goodbye|bye",
      "greeting|salutation|welcome",
      "hello-world|hello-sign",
      "say hello:high|hello there:medium",
      // 일본어
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
      "こんにちは挨拶",
      "こんにちは、元気ですか:high",
      // 중국어
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
      // 미디어
      "https://source.unsplash.com/400x300/?greeting",
      "",
      "https://api.iconify.design/noto:waving-hand.svg?width=400",
      // 예문 + 상세 문법 정보
      "안녕하세요. 만나서 반갑습니다.",
      "Hello, nice to meet you.",
      "こんにちは。はじめまして。",
      "你好，很高兴见到你。",
      "first_meeting",
      "인사 + 감정표현",
      "greeting_formula|polite_level:formal|first_meeting|emotion_expression:positive|social_protocol|sequential_greetings",
      "첫만남|정중함|감정표현|사회적예의",
      "beginner",
      "1",
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
  link.setAttribute("download", "concept_template_example_grammar.csv");
  link.style.display = "none";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

// JSON 템플릿 다운로드 - 예문 중심 문법 시스템 적용
function downloadJSONTemplate() {
  // 예문 중심 문법 시스템을 사용한 확장된 JSON 템플릿 데이터
  const jsonTemplate = [
    {
      concept_info: {
        domain: "food",
        category: "fruit",
        difficulty: "beginner",
        tags: ["everyday", "healthy", "common"],
        unicode_emoji: "🍎",
        color_theme: "#FF6B6B",
        quiz_frequency: "high",
        game_types: ["matching", "pronunciation", "spelling"],
        learning_priority: 1,
      },
      expressions: {
        korean: {
          word: "사과",
          pronunciation: "sa-gwa",
          romanization: "sagwa",
          definition: "둥글고 단맛이 나는 열매",
          part_of_speech: "명사",
          level: "초급",
          synonyms: [],
          antonyms: [],
          word_family: ["과일", "과실", "열매"],
          compound_words: ["사과나무", "사과즙", "사과파이"],
          collocations: [
            { phrase: "사과를 먹다", frequency: "high" },
            { phrase: "빨간 사과", frequency: "high" },
          ],
        },

        english: {
          word: "apple",
          pronunciation: "ˈæpl",
          phonetic: "/ˈæpəl/",
          definition:
            "a round fruit with firm white flesh and a green red or yellow skin",
          part_of_speech: "noun",
          level: "beginner",
          synonyms: [],
          antonyms: [],
          word_family: ["fruit", "produce", "orchard fruit"],
          compound_words: ["apple tree", "apple juice", "apple pie"],
          collocations: [
            { phrase: "eat an apple", frequency: "high" },
            { phrase: "red apple", frequency: "high" },
          ],
        },

        japanese: {
          word: "りんご",
          hiragana: "りんご",
          katakana: "リンゴ",
          kanji: "",
          pronunciation: "ringo",
          romanization: "ringo",
          definition: "赤や緑の皮をもつ、甘くて丸い果物",
          part_of_speech: "名詞",
          level: "初級",
          synonyms: ["アップル"],
          antonyms: [],
          word_family: ["果物", "果実", "青果"],
          compound_words: ["りんごの木", "りんごジュース"],
          collocations: [
            { phrase: "りんごを食べる", frequency: "high" },
            { phrase: "赤いりんご", frequency: "high" },
          ],
        },

        chinese: {
          word: "苹果",
          pronunciation: "píng guǒ",
          pinyin: "píng guǒ",
          definition: "红色或绿色皮的甜美水果",
          part_of_speech: "名词",
          level: "初级",
          traditional: "蘋果",
          simplified: "苹果",
          synonyms: [],
          antonyms: [],
          word_family: ["水果", "果实", "鲜果"],
          compound_words: ["苹果树", "苹果汁", "苹果派"],
          collocations: [
            { phrase: "吃苹果", frequency: "high" },
            { phrase: "红苹果", frequency: "high" },
          ],
        },
      },

      featured_examples: [
        {
          id: "apple_example_1",
          context: "daily_routine",
          difficulty: "beginner",

          // 강화된 문법 시스템 (예문 중심)
          grammar_system: {
            pattern_name: "시간부사 + 목적어 + 동사",
            structural_pattern: "S + 시간부사 + O + V",
            grammar_tags: [
              "present_tense",
              "time_adverb:morning",
              "object_marking:을/를",
              "polite_ending:haeyo",
              "daily_routine",
              "food_consumption",
              "declarative_mood",
            ],
            complexity_level: "basic_sentence",
            learning_focus: [
              "시간표현",
              "목적어 조사",
              "현재시제",
              "정중함 표현",
              "일상 루틴",
            ],
            grammatical_features: {
              korean: {
                sentence_type: "서술문",
                speech_level: "해요체",
                tense: "현재",
                mood: "평서법",
                honorific_level: "일반 정중",
                key_grammar_points: [
                  "시간부사 위치",
                  "목적어 조사 '을'",
                  "해요체 어미",
                  "어순 구조",
                ],
              },
              english: {
                sentence_type: "declarative",
                tense: "simple_present",
                voice: "active",
                mood: "indicative",
                key_grammar_points: [
                  "time_adverbial_placement",
                  "article_usage",
                  "subject_verb_agreement",
                  "sentence_structure",
                ],
              },
              japanese: {
                sentence_type: "平叙文",
                speech_level: "丁寧語",
                tense: "現在",
                key_grammar_points: [
                  "時間詞の位置",
                  "助詞「に」「を」",
                  "ます形活用",
                  "語順構造",
                ],
              },
              chinese: {
                sentence_type: "陈述句",
                tense: "一般现在时",
                key_grammar_points: [
                  "时间状语位置",
                  "宾语结构",
                  "动词时态",
                  "语序特点",
                ],
              },
            },
            difficulty_factors: {
              vocabulary: 15,
              grammar_complexity: 20,
              cultural_context: 10,
              pronunciation: 15,
            },
            teaching_notes: {
              primary_focus: "시간표현과 목적어 활용",
              common_mistakes: [
                "목적어 조사 생략",
                "시간부사 위치 오류",
                "해요체 활용 실수",
              ],
              practice_suggestions: [
                "다른 시간부사로 치환 연습",
                "다른 음식 단어로 대체 연습",
                "질문-답변 패턴 연습",
              ],
            },
          },

          translations: {
            korean: {
              text: "아침에 사과를 먹어요.",
              romanization: "achime sagwareul meogeoyo",
            },
            english: {
              text: "I eat an apple in the morning.",
              phonetic: "/aɪ iːt æn ˈæpəl ɪn ðə ˈmɔrnɪŋ/",
            },
            japanese: {
              text: "朝にりんごを食べます。",
              romanization: "asa ni ringo wo tabemasu",
            },
            chinese: {
              text: "我早上吃苹果。",
              pinyin: "wǒ zǎoshang chī píngguǒ",
            },
          },
        },
      ],

      quiz_data: {
        difficulty_levels: {
          beginner: {
            translation: {
              korean_to_english: {
                question: "다음 한국어를 영어로 번역하세요: '사과'",
                correct_answer: "apple",
                grammar_hint: "과일 명사입니다",
                alternatives: ["fruit", "red apple"],
              },
            },
            pronunciation: {
              korean: {
                question: "'사과'의 정확한 발음은?",
                correct_answer: "sa-gwa",
                grammar_hint: "각 음절을 명확히 발음하세요",
              },
            },
          },
        },
      },

      game_data: {
        memory_game: {
          difficulty_score: 15,
          pair_type: "word_translation",
          hint_system: {
            grammar_hint: "과일 명사",
            context_hint: "건강한 간식",
            difficulty_hint: "초급 수준",
          },
        },
        pronunciation_game: {
          target_sounds: ["사", "과"],
          common_mistakes: ["싸과", "사까"],
          practice_focus: ["자음", "모음"],
        },
      },

      learning_progress: {
        vocabulary_mastery: {
          recognition: 0,
          production: 0,
          fluency: 0,
        },
        grammar_understanding: {
          pattern_recognition: 0,
          production_accuracy: 0,
          contextual_usage: 0,
        },
      },
    },

    {
      concept_info: {
        domain: "daily",
        category: "greeting",
        difficulty: "beginner",
        tags: ["polite", "common", "essential"],
        unicode_emoji: "👋",
        color_theme: "#4CAF50",
        quiz_frequency: "very_high",
        game_types: ["matching", "pronunciation"],
        learning_priority: 1,
      },
      expressions: {
        korean: {
          word: "안녕하세요",
          pronunciation: "an-nyeong-ha-se-yo",
          romanization: "annyeonghaseyo",
          definition: "정중한 인사말",
          part_of_speech: "감탄사",
          level: "초급",
          synonyms: ["안녕", "반갑습니다"],
          antonyms: ["안녕히 가세요"],
          word_family: ["인사", "인사말", "예의"],
          compound_words: ["안녕인사", "안녕메시지"],
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
          synonyms: ["hi", "hey", "greetings"],
          antonyms: ["goodbye", "bye"],
          word_family: ["greeting", "salutation", "welcome"],
          compound_words: ["hello-world", "hello-sign"],
          collocations: [
            { phrase: "say hello", frequency: "high" },
            { phrase: "hello there", frequency: "medium" },
          ],
        },

        japanese: {
          word: "こんにちは",
          hiragana: "こんにちは",
          katakana: "",
          kanji: "今日は",
          pronunciation: "konnichiwa",
          romanization: "konnichiwa",
          definition: "昼間の挨拶",
          part_of_speech: "感動詞",
          level: "初級",
          synonyms: ["おはよう", "こんばんは"],
          antonyms: ["さようなら"],
          word_family: ["挨拶", "礼儀", "言葉"],
          compound_words: ["こんにちは挨拶"],
          collocations: [
            { phrase: "こんにちは、元気ですか", frequency: "high" },
          ],
        },

        chinese: {
          word: "你好",
          pronunciation: "nǐ hǎo",
          pinyin: "nǐ hǎo",
          definition: "见面时的礼貌问候语",
          part_of_speech: "感叹词",
          level: "初级",
          traditional: "你好",
          simplified: "你好",
          synonyms: ["您好", "你们好"],
          antonyms: ["再见", "拜拜"],
          word_family: ["问候", "礼貌", "招呼"],
          compound_words: ["你好问候", "你好信息"],
          collocations: [{ phrase: "你好，很高兴见到你", frequency: "high" }],
        },
      },

      featured_examples: [
        {
          id: "greeting_example_1",
          context: "first_meeting",
          difficulty: "beginner",

          // 강화된 문법 시스템 (예문 중심)
          grammar_system: {
            pattern_name: "연속 인사 표현",
            structural_pattern: "인사 + 감정표현",
            grammar_tags: [
              "greeting_formula",
              "polite_level:formal",
              "first_meeting",
              "emotion_expression:positive",
              "social_protocol",
              "sequential_greetings",
              "conjunction:period",
            ],
            complexity_level: "basic_compound",
            learning_focus: [
              "첫만남 인사",
              "정중함 표현",
              "감정 표현",
              "사회적 예의",
              "문장 연결",
            ],
            grammatical_features: {
              korean: {
                sentence_type: "감탄문 + 서술문",
                speech_level: "해요체 + 합니다체",
                formality: "정중함",
                social_context: "첫 만남",
                key_grammar_points: [
                  "인사 감탄사",
                  "연결어미 없는 문장 연결",
                  "높임 표현",
                  "감정 표현 동사",
                ],
              },
              english: {
                sentence_type: "exclamation + declarative",
                formality: "neutral_polite",
                social_context: "introduction",
                key_grammar_points: [
                  "greeting_interjection",
                  "comma_conjunction",
                  "adjective_phrase",
                  "infinitive_purpose",
                ],
              },
              japanese: {
                sentence_type: "挨拶 + 定型表現",
                speech_level: "丁寧語",
                formality: "正式",
                social_context: "初対面",
                key_grammar_points: [
                  "挨拶の感動詞",
                  "初対面の決まり文句",
                  "丁寧語の活用",
                  "文の区切り",
                ],
              },
              chinese: {
                sentence_type: "问候语 + 感情表达",
                formality: "礼貌",
                social_context: "初次见面",
                key_grammar_points: [
                  "问候语使用",
                  "逗号连接",
                  "感情形容词",
                  "见面表达",
                ],
              },
            },
            difficulty_factors: {
              vocabulary: 20,
              grammar_complexity: 25,
              cultural_context: 30,
              pronunciation: 20,
            },
            teaching_notes: {
              primary_focus: "첫 만남 상황의 정중한 인사 패턴",
              common_mistakes: [
                "높임 표현 혼동",
                "문장 연결 오류",
                "상황별 인사 구분 실패",
              ],
              practice_suggestions: [
                "다양한 만남 상황 시뮬레이션",
                "높임 표현 단계별 연습",
                "감정 표현 어휘 확장 연습",
              ],
            },
          },

          translations: {
            korean: {
              text: "안녕하세요. 만나서 반갑습니다.",
              romanization: "annyeonghaseyo. mannaseo bangapseumnida",
            },
            english: {
              text: "Hello, nice to meet you.",
              phonetic: "/həˈloʊ, naɪs tə mit ju/",
            },
            japanese: {
              text: "こんにちは。はじめまして。",
              romanization: "konnichiwa. hajimemashite",
            },
            chinese: {
              text: "你好，很高兴见到你。",
              pinyin: "nǐ hǎo, hěn gāoxìng jiàndào nǐ",
            },
          },
        },
      ],

      quiz_data: {
        difficulty_levels: {
          beginner: {
            translation: {
              korean_to_english: {
                question: "다음 한국어를 영어로 번역하세요: '안녕하세요'",
                correct_answer: "hello",
                grammar_hint: "정중한 인사말입니다",
                alternatives: ["hi", "hey", "greetings"],
              },
            },
            pronunciation: {
              korean: {
                question: "'안녕하세요'의 정확한 발음은?",
                correct_answer: "an-nyeong-ha-se-yo",
                grammar_hint: "각 음절을 명확히 발음하세요",
              },
            },
          },
        },
      },

      game_data: {
        memory_game: {
          difficulty_score: 15,
          pair_type: "word_translation",
          hint_system: {
            grammar_hint: "기본 인사말",
            context_hint: "만날 때 사용",
            difficulty_hint: "초급 수준",
          },
        },
        pronunciation_game: {
          target_sounds: ["안녕", "하세요"],
          common_mistakes: ["하새요", "안녕해세요"],
          practice_focus: ["연음", "경음"],
        },
      },

      learning_progress: {
        vocabulary_mastery: {
          recognition: 0,
          production: 0,
          fluency: 0,
        },
        grammar_understanding: {
          pattern_recognition: 0,
          production_accuracy: 0,
          contextual_usage: 0,
        },
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
  link.setAttribute("download", "concept_template_example_grammar.json");
  link.style.display = "none";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
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

// CSV 데이터에서 개념 객체 생성 - 예문 중심 문법 시스템 적용
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
    emoji = valueMap.emoji || valueMap.unicode_emoji || "";

    // 언어별 표현 생성 (grammar_system 제거)
    for (const langCode of Object.keys(supportedLanguages)) {
      const word = valueMap[`${langCode}_word`];

      if (word) {
        // 기본 표현 정보만 포함 (grammar_system 제거)
        const expression = {
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

    // 예문 중심 문법 시스템 생성
    const exampleKorean = valueMap.example_1_korean;
    const exampleEnglish = valueMap.example_1_english;
    const exampleJapanese = valueMap.example_1_japanese;
    const exampleChinese = valueMap.example_1_chinese;
    const exampleContext = valueMap.example_1_context || "general";
    const exampleGrammarPattern = valueMap.example_1_grammar_pattern || "";
    const exampleGrammarTags = parseArrayField(valueMap.example_1_grammar_tags);
    const exampleGrammarFocus = parseArrayField(
      valueMap.example_1_grammar_focus
    );
    const exampleDifficulty = valueMap.example_1_difficulty || "beginner";
    const examplePriority = valueMap.example_1_priority || "1";

    if (exampleKorean || exampleEnglish || exampleJapanese || exampleChinese) {
      const example = {
        id: `${domain}_${category}_example_1`,
        context: exampleContext,
        difficulty: exampleDifficulty,

        // 강화된 예문 중심 문법 시스템
        grammar_system: {
          pattern_name: exampleGrammarPattern || "기본 문장 패턴",
          structural_pattern: exampleGrammarPattern || "기본 구조",
          grammar_tags: exampleGrammarTags,
          complexity_level:
            exampleDifficulty === "advanced"
              ? "complex"
              : exampleDifficulty === "intermediate"
              ? "moderate"
              : "basic",
          learning_focus:
            exampleGrammarFocus.length > 0
              ? exampleGrammarFocus
              : [domain, category],

          // 언어별 문법적 특성 자동 생성
          grammatical_features: generateGrammaticalFeatures(
            exampleGrammarTags,
            exampleGrammarPattern,
            expressions
          ),

          // 난이도 요소 자동 계산
          difficulty_factors: {
            vocabulary: calculateVocabularyDifficulty(expressions),
            grammar_complexity: calculateGrammarComplexity(exampleGrammarTags),
            cultural_context:
              domain === "daily" || domain === "culture" ? 20 : 10,
            pronunciation: calculatePronunciationDifficulty(expressions),
          },

          // 교육적 메모
          teaching_notes: {
            primary_focus:
              exampleGrammarFocus.join(", ") ||
              `${domain} 영역의 ${category} 학습`,
            common_mistakes: [],
            practice_suggestions: [
              `${domain} 관련 어휘 확장`,
              "다양한 상황 적용 연습",
              "발음 및 억양 연습",
            ],
          },
        },

        translations: {},
      };

      // 번역 추가
      if (exampleKorean) {
        example.translations.korean = {
          text: exampleKorean,
          romanization: "",
        };
      }
      if (exampleEnglish) {
        example.translations.english = {
          text: exampleEnglish,
          phonetic: "",
        };
      }
      if (exampleJapanese) {
        example.translations.japanese = {
          text: exampleJapanese,
          romanization: "",
        };
      }
      if (exampleChinese) {
        example.translations.chinese = {
          text: exampleChinese,
          pinyin: "",
        };
      }

      examples.push(example);
    }
  } else {
    // 헤더가 없는 경우 - 기존 레거시 처리 방식
    domain = values[0] || defaultDomain;
    category = values[1] || defaultCategory;
    emoji = values[2] || "";

    let wordIndex = 3;
    for (const langCode of Object.keys(supportedLanguages)) {
      const word = values[wordIndex];
      if (word) {
        expressions[langCode] = {
          word: word,
          pronunciation: values[wordIndex + 1] || "",
          definition: values[wordIndex + 2] || "",
          part_of_speech: "noun",
          level: "beginner",
          synonyms: [],
          antonyms: [],
          word_family: [],
          compound_words: [],
          collocations: [],
        };
      }
      wordIndex += 3;
    }
  }

  if (Object.keys(expressions).length === 0) {
    console.warn("유효한 단어가 없는 행:", values);
    return null;
  }

  // concept_info 생성
  const conceptInfo = {
    domain: domain,
    category: category,
    difficulty: "beginner",
    tags: [],
    unicode_emoji: emoji,
    color_theme: "#9C27B0",
    updated_at: new Date(),
    total_examples_count: examples.length,
    quiz_frequency: "medium",
    game_types: ["matching", "pronunciation"],
    learning_priority: 1,
  };

  const concept = {
    concept_info: conceptInfo,
    expressions: expressions,
    featured_examples: examples,
    quiz_data: generateBasicQuizData(expressions),
    game_data: generateBasicGameData(expressions),
    learning_progress: {
      vocabulary_mastery: {
        recognition: 0,
        production: 0,
        fluency: 0,
      },
      grammar_understanding: {
        pattern_recognition: 0,
        production_accuracy: 0,
        contextual_usage: 0,
      },
    },
    created_at: new Date(),
  };

  console.log("CSV에서 생성된 개념 객체 (예문 중심):", concept);
  return concept;
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

// JSON 데이터에서 개념 객체 생성 - 예문 중심 문법 시스템 완전 지원
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

  // 유효한 표현 필터링 (grammar_system 제거)
  const expressions = {};

  for (const [lang, expr] of Object.entries(item.expressions)) {
    if (expr && expr.word) {
      const expression = {
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
        // 중국어 특수 필드
        pinyin: expr.pinyin || "",
        traditional: expr.traditional || "",
        simplified: expr.simplified || "",
        // 오디오 정보
        audio: expr.audio || "",
      };

      // grammar_system은 더 이상 개별 단어에 포함하지 않음
      expressions[lang] = expression;
    }
  }

  if (Object.keys(expressions).length === 0) {
    console.warn("유효한 단어가 없는 개념:", item);
    return null;
  }

  // 개념 정보 구성 (확장된 구조)
  const conceptInfo = {
    domain: domain,
    category: category,
    difficulty: item.concept_info?.difficulty || "beginner",
    tags: item.concept_info?.tags || [],
    unicode_emoji:
      item.concept_info?.unicode_emoji || item.concept_info?.emoji || "",
    color_theme: item.concept_info?.color_theme || "#9C27B0",
    updated_at: new Date(),
    total_examples_count: 0, // 나중에 계산
    quiz_frequency: item.concept_info?.quiz_frequency || "medium",
    game_types: item.concept_info?.game_types || ["matching", "pronunciation"],
    learning_priority: item.concept_info?.learning_priority || 1,
  };

  // 미디어 정보 처리 (선택적)
  const media = item.media
    ? {
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
      }
    : undefined;

  // featured_examples 처리 - 예문 중심 문법 구조 지원
  const featuredExamples = [];
  if (Array.isArray(item.featured_examples)) {
    for (const ex of item.featured_examples) {
      if (ex && ex.translations && Object.keys(ex.translations).length > 0) {
        const processedExample = {
          id:
            ex.id ||
            `${domain}_${category}_example_${featuredExamples.length + 1}`,
          context: ex.context || "general",
          difficulty: ex.difficulty || "beginner",
          translations: ex.translations,
        };

        // 예문 중심 문법 시스템 처리 (새로운 구조)
        if (ex.grammar_system) {
          processedExample.grammar_system = {
            pattern_name: ex.grammar_system.pattern_name || "기본 패턴",
            structural_pattern:
              ex.grammar_system.structural_pattern || "기본 구조",
            grammar_tags: ex.grammar_system.grammar_tags || [],
            complexity_level: ex.grammar_system.complexity_level || "basic",
            learning_focus: ex.grammar_system.learning_focus || [
              domain,
              category,
            ],
            grammatical_features: ex.grammar_system.grammatical_features || {},
            difficulty_factors: ex.grammar_system.difficulty_factors || {
              vocabulary: 15,
              grammar_complexity: 20,
              cultural_context: 10,
              pronunciation: 15,
            },
            teaching_notes: ex.grammar_system.teaching_notes || {
              primary_focus: `${domain} 영역의 ${category} 학습`,
              common_mistakes: [],
              practice_suggestions: [],
            },
          };
        } else if (ex.unified_grammar) {
          // 기존 unified_grammar 형식을 새 형식으로 변환
          processedExample.grammar_system = {
            pattern_name: ex.unified_grammar.structural_pattern || "기본 패턴",
            structural_pattern:
              ex.unified_grammar.structural_pattern || "기본 구조",
            grammar_tags: ex.unified_grammar.grammar_tags || [],
            complexity_level: ex.unified_grammar.complexity_level || "basic",
            learning_focus: ex.unified_grammar.learning_focus || [
              domain,
              category,
            ],
            grammatical_features: generateBasicGrammaticalFeatures(
              ex.unified_grammar.grammar_tags,
              expressions
            ),
            difficulty_factors: {
              vocabulary: 15,
              grammar_complexity: calculateGrammarComplexity(
                ex.unified_grammar.grammar_tags || []
              ),
              cultural_context: 10,
              pronunciation: 15,
            },
            teaching_notes: {
              primary_focus:
                ex.unified_grammar.learning_focus?.join(", ") ||
                `${domain} 영역의 ${category} 학습`,
              common_mistakes: [],
              practice_suggestions: [],
            },
          };
        } else {
          // 자동 생성
          processedExample.grammar_system = {
            pattern_name: "기본 문장 패턴",
            structural_pattern: "기본 구조",
            grammar_tags: [`domain:${domain}`, `category:${category}`],
            complexity_level: "basic",
            learning_focus: [domain, category, "basic_usage"],
            grammatical_features: {},
            difficulty_factors: {
              vocabulary: 15,
              grammar_complexity: 10,
              cultural_context: 10,
              pronunciation: 15,
            },
            teaching_notes: {
              primary_focus: `${domain} 영역의 ${category} 학습`,
              common_mistakes: [],
              practice_suggestions: [],
            },
          };
        }

        featuredExamples.push(processedExample);
      }
    }
  }

  // 기존 형식의 예제 처리 (호환성)
  if (Array.isArray(item.examples)) {
    for (const ex of item.examples) {
      if (ex && Object.keys(ex).length > 0) {
        const convertedExample = {
          id: `legacy_example_${featuredExamples.length + 1}`,
          context: ex.context || "general",
          difficulty: "beginner",
          translations: {},
          grammar_system: {
            pattern_name: "기본 문장 패턴",
            structural_pattern: "기본 구조",
            grammar_tags: [`domain:${domain}`, `category:${category}`],
            complexity_level: "basic",
            learning_focus: [domain, category],
            grammatical_features: {},
            difficulty_factors: {
              vocabulary: 15,
              grammar_complexity: 10,
              cultural_context: 10,
              pronunciation: 15,
            },
            teaching_notes: {
              primary_focus: "기존 형식에서 변환된 예제",
              common_mistakes: [],
              practice_suggestions: [],
            },
          },
        };

        // 기존 형식을 새 형식으로 변환
        ["korean", "english", "japanese", "chinese"].forEach((lang) => {
          if (ex[lang]) {
            convertedExample.translations[lang] = {
              text: ex[lang],
              romanization: "",
              phonetic: "",
              pinyin: "",
            };
          }
        });

        featuredExamples.push(convertedExample);
      }
    }
  }

  // 총 예제 수 업데이트
  conceptInfo.total_examples_count = featuredExamples.length;

  // 퀴즈 데이터 처리
  const quizData = item.quiz_data || generateBasicQuizData(expressions);

  // 게임 데이터 처리
  const gameData = item.game_data || generateBasicGameData(expressions);

  // 학습 메타데이터 처리
  const learningMetadata = item.learning_metadata || {
    memorization_difficulty: 3,
    pronunciation_difficulty: 3,
    usage_frequency: "medium",
    cultural_importance: "medium",
  };

  // 학습 진도 처리
  const learningProgress = item.learning_progress || {
    vocabulary_mastery: {
      recognition: 0,
      production: 0,
      fluency: 0,
    },
    grammar_understanding: {
      pattern_recognition: 0,
      production_accuracy: 0,
      contextual_usage: 0,
    },
  };

  // 관련 개념 처리
  const relatedConcepts = item.related_concepts || [];

  // 완전한 개념 객체 반환
  const conceptObject = {
    concept_info: conceptInfo,
    expressions: expressions,
    featured_examples: featuredExamples,
    quiz_data: quizData,
    game_data: gameData,
    related_concepts: relatedConcepts,
    learning_metadata: learningMetadata,
    learning_progress: learningProgress,
    created_at: new Date(),
  };

  // 미디어가 있으면 추가
  if (media) {
    conceptObject.media = media;
  }

  console.log("JSON에서 생성된 개념 객체 (예문 중심):", conceptObject);
  return conceptObject;
}

// 기본 문법적 특성 생성 헬퍼 함수
function generateBasicGrammaticalFeatures(grammarTags, expressions) {
  const features = {};

  for (const [lang, expr] of Object.entries(expressions)) {
    if (!expr) continue;

    features[lang] = {
      sentence_type: detectSentenceType(grammarTags || [], lang),
      key_grammar_points: extractKeyGrammarPoints(grammarTags || [], lang),
    };
  }

  return features;
}

// 기본 퀴즈 데이터 생성
function generateBasicQuizData(expressions) {
  return {
    difficulty_levels: {
      beginner: {
        translation: {},
        pronunciation: {},
      },
    },
  };
}

// 기본 게임 데이터 생성
function generateBasicGameData(expressions) {
  return {
    memory_game: {
      difficulty_score: 20,
      pair_type: "word_translation",
      hint_system: {
        grammar_hint: "기본 단어",
        context_hint: "일반 사용",
        difficulty_hint: "초급 수준",
      },
    },
  };
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
