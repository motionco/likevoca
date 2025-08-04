# 새로운 언어 추가 가이드

이 문서는 LikeVoca 애플리케이션에 새로운 언어를 추가하는 과정을 단계별로 설명합니다.

## 개요

새로운 언어를 추가할 때는 다음 사항들을 고려해야 합니다:

- **언어 코드**: ISO 639-1 표준에 따른 2자리 언어 코드 (예: `es` for Spanish)
- **언어 이름**: 각 언어별로 표시될 언어명
- **번역 키**: 모든 UI 텍스트의 번역
- **데이터 구조**: CSV/JSON 템플릿에 새로운 언어 필드 추가
- **필터 옵션**: 모든 언어 버전의 필터 드롭다운에 새 언어 추가

## 필수 파일 수정

### 1. utils/language-utils.js

```javascript
// 1. loadTranslations 함수에 새 언어 추가
const esTranslations = await fetch(`locales/es/translations.json`).then((r) =>
  r.json()
);
translations.es = esTranslations;

// 2. uiLanguageToFilterLanguage 매핑에 추가
const uiLanguageToFilterLanguage = {
  ko: "korean",
  en: "english",
  ja: "japanese",
  zh: "chinese",
  es: "spanish", // 새 언어 추가
};

// 3. getSystemLanguage 함수의 languageMapping에 추가
const languageMapping = {
  // 기존 언어들...
  es: "spanish",
  "es-es": "spanish",
  "es-mx": "spanish",
  "es-ar": "spanish",
};
```

### 2. js/firebase/firebase-init.js

```javascript
// supportedLanguages 객체에 새 언어 추가
const supportedLanguages = {
  // 기존 언어들...
  spanish: {
    nameKo: "스페인어",
    code: "es",
    example: "manzana",
  },
};
```

### 3. components/js/concept-modal-utils.js

```javascript
// 1. supportedLangs 객체에 추가
const supportedLangs = {
  // 기존 언어들...
  spanish: "Español",
};

// 2. translatePartOfSpeech 함수에 품사 매핑 추가
const posMapping = {
  // 기존 매핑들...
  // 새 언어 → 다른 언어
  sustantivo: {
    korean: "명사",
    english: "noun",
    japanese: "名詞",
    chinese: "名词",
  },
  verbo: { korean: "동사", english: "verb", japanese: "動詞", chinese: "动词" },
  // ... 기타 품사들

  // 다른 언어 → 새 언어
  noun: {
    korean: "명사",
    japanese: "名詞",
    chinese: "名词",
    spanish: "sustantivo",
  },
  verb: { korean: "동사", japanese: "動詞", chinese: "动词", spanish: "verbo" },
  // ... 기타 품사들
};
```

### 4. components/js/domain-category-emoji.js

```javascript
// es 번역 객체 추가
const translations = {
  // 기존 언어들...
  es: {
    // 도메인 번역
    daily: "Vida Diaria",
    business: "Negocios",
    // ... 기타 도메인들

    // 카테고리 번역
    personal_care: "Cuidado Personal",
    weather_talk: "Conversación sobre el Clima",
    // ... 기타 카테고리들
  },
};
```

## HTML 페이지 생성

### 1. locales/[언어코드]/ 디렉토리 생성

새로운 언어의 모든 HTML 페이지를 생성해야 합니다:

- `index.html`
- `learning.html`
- `vocabulary.html`
- `my-word-list.html`
- `games.html`
- `quiz.html`
- `progress.html`
- `ai-vocabulary.html`
- `login.html`
- `signup.html`
- `forgotpassword.html`
- `inquiry.html`
- `profile.html`

### 2. 언어 필터 드롭다운 업데이트

모든 HTML 파일의 언어 필터 드롭다운에 새 언어 옵션을 추가해야 합니다:

```html
<!-- 기존 언어들 -->
<option value="korean" data-i18n="korean">한국어</option>
<option value="english" data-i18n="english">English</option>
<option value="japanese" data-i18n="japanese">日本語</option>
<option value="chinese" data-i18n="chinese">中文</option>

<!-- 새 언어 추가 -->
<option value="spanish" data-i18n="spanish">Español</option>
```

### 3. 모든 언어 버전 업데이트

기존 언어 버전(ko, en, ja, zh)의 모든 HTML 파일에도 새 언어 옵션을 추가해야 합니다:

```html
<!-- 한국어 버전 -->
<option value="spanish" data-i18n="spanish">스페인어</option>

<!-- 영어 버전 -->
<option value="spanish" data-i18n="spanish">Spanish</option>

<!-- 일본어 버전 -->
<option value="spanish" data-i18n="spanish">スペイン語</option>

<!-- 중국어 버전 -->
<option value="spanish" data-i18n="spanish">西班牙语</option>
```

## 번역 파일 생성

### 1. locales/[언어코드]/translations.json 생성

새로운 언어의 번역 파일을 생성하고 모든 번역 키를 추가해야 합니다:

```json
{
  "edit": "Editar",
  "delete": "Eliminar",
  "add_concept": "Agregar Concepto",
  "edit_concept": "Editar Concepto",
  "domain": "Dominio",
  "category": "Categoría",
  "word": "Palabra",
  "pronunciation": "Pronunciación",
  "definition": "Definición",
  "part_of_speech": "Parte de la Oración",
  "noun": "Sustantivo",
  "verb": "Verbo",
  "adjective": "Adjetivo",
  "adverb": "Adverbio",
  "synonyms": "Sinónimos",
  "antonyms": "Antónimos",
  "collocations": "Colocaciones",
  "compound_words": "Palabras Compuestas",
  "word_family": "Familia de Palabras",
  "examples": "Ejemplos",
  "representative_example": "Ejemplo Representativo",
  "korean": "Coreano",
  "english": "Inglés",
  "japanese": "Japonés",
  "chinese": "Chino",
  "spanish": "Español",
  "search": "Buscar",
  "language_filter": "Filtro de Idioma",
  "source_language": "Idioma Origen",
  "target_language": "Idioma Objetivo",
  "sort": "Ordenar",
  "latest": "Más Reciente",
  "oldest": "Más Antiguo",
  "alphabetical": "Alfabético",
  "reverse_alphabetical": "Alfabético Inverso",
  "confirm_delete_concept": "¿Está seguro de que desea eliminar este concepto?",
  "concept_deleted_success": "Concepto eliminado exitosamente.",
  "concept_delete_error": "Error al eliminar el concepto",
  "no_examples": "No hay ejemplos disponibles"
}
```

### 2. 기존 번역 파일 업데이트

모든 기존 언어의 `translations.json` 파일에 새 언어 관련 키를 추가해야 합니다:

```json
{
  // 기존 번역들...
  "spanish": "스페인어", // 한국어 버전
  "spanish": "Spanish", // 영어 버전
  "spanish": "スペイン語", // 일본어 버전
  "spanish": "西班牙语" // 중국어 버전
}
```

## JavaScript 파일 수정

### 1. pages/js/learning.js

```javascript
// 1. getLanguageName 함수에 새 언어 추가
const languageNames = {
  ko: {
    // 기존 언어들...
    spanish: "스페인어",
  },
  en: {
    // 기존 언어들...
    spanish: "Spanish",
  },
  // ... 기타 언어들
};

// 2. otherLanguages 배열에 추가
const otherLanguages = ["korean", "english", "japanese", "chinese", "spanish"];

// 3. languageMap에 오디오 코드 추가
const languageMap = {
  // 기존 언어들...
  spanish: "es-ES",
};
```

### 2. pages/js/games.js

```javascript
// setupLanguageSelectors 함수의 otherLanguages 배열에 추가
const otherLanguages = ["korean", "english", "japanese", "chinese", "spanish"];
```

### 3. components/js/ai-edit-concept-modal.js

```javascript
// 1. languages 배열에 추가
const languages = ["korean", "english", "japanese", "chinese", "spanish"];

// 2. collectFormData 함수에 새 언어 필드 추가
function collectFormData() {
  const formData = {
    // 기존 언어들...
    spanishExample: document.getElementById("spanish-example")?.value || "",
  };

  const representativeExample = {
    // 기존 언어들...
    spanish: formData.spanishExample,
  };
}
```

### 4. components/js/concept-view-modal.js

```javascript
// getLanguageName 함수에 새 언어 추가
const languageNames = {
  ko: {
    // 기존 언어들...
    spanish: "스페인어",
  },
  en: {
    // 기존 언어들...
    spanish: "Spanish",
  },
  // ... 기타 언어들
};
```

### 5. components/js/ai-concept-modal.js

```javascript
// getLanguageName, getLanguageCode, getUserLanguageCode 함수에 추가
function getLanguageName(langCode) {
  const languageNames = {
    // 기존 언어들...
    es: "Español",
  };
}

function getLanguageCode(langCode) {
  const languageCodeMap = {
    // 기존 언어들...
    es: "spanish",
  };
}
```

### 6. components/js/separated-import-modal.js

```javascript
// convertCSVToConcept 함수에 새 언어 필드 추가
function convertCSVToConcept(row) {
  return {
    expressions: {
      // 기존 언어들...
      spanish: {
        word: row.spanish_word || "",
        pronunciation: row.spanish_pronunciation || "",
        definition: row.spanish_definition || "",
        part_of_speech: row.spanish_part_of_speech || "",
        synonyms: row.spanish_synonyms ? row.spanish_synonyms.split(",") : [],
        antonyms: row.spanish_antonyms ? row.spanish_antonyms.split(",") : [],
        collocations: row.spanish_collocations
          ? row.spanish_collocations.split(",")
          : [],
        compound_words: row.spanish_compound_words
          ? row.spanish_compound_words.split(",")
          : [],
        word_family: row.spanish_word_family
          ? row.spanish_word_family.split(",")
          : [],
      },
    },
    representative_example: {
      // 기존 언어들...
      spanish: row.representative_spanish || "",
    },
  };
}
```

### 7. components/js/csv-parser-utils.js

```javascript
// parseConceptFromCSV 함수에 새 언어 필드 추가
function parseConceptFromCSV(row) {
  return {
    expressions: {
      // 기존 언어들...
      spanish: {
        word: row.spanish_word || "",
        pronunciation: row.spanish_pronunciation || "",
        definition: row.spanish_definition || "",
        part_of_speech: row.spanish_part_of_speech || "",
        synonyms: row.spanish_synonyms ? row.spanish_synonyms.split(",") : [],
        antonyms: row.spanish_antonyms ? row.spanish_antonyms.split(",") : [],
        collocations: row.spanish_collocations
          ? row.spanish_collocations.split(",")
          : [],
        compound_words: row.spanish_compound_words
          ? row.spanish_compound_words.split(",")
          : [],
        word_family: row.spanish_word_family
          ? row.spanish_word_family.split(",")
          : [],
      },
    },
    representative_example: {
      // 기존 언어들...
      spanish: row.representative_spanish || "",
    },
  };
}
```

## 📋 4단계: 템플릿 파일 업데이트

### 4.1 CSV 템플릿 업데이트

새로운 언어를 위한 CSV 템플릿 파일들을 업데이트합니다:

#### Concepts 템플릿 (`samples/concepts_template.csv`)

- 헤더에 새로운 언어 필드 추가
- 샘플 데이터에 새로운 언어 정보 추가

#### Examples 템플릿 (`samples/examples_template_add.csv`)

- 헤더에 새로운 언어 필드 추가
- 샘플 데이터에 새로운 언어 정보 추가

#### Grammar 템플릿 (`samples/grammar_template_add.csv`)

- 헤더에 새로운 언어 필드 추가
- 샘플 데이터에 새로운 언어 정보 추가

#### ⚠️ CSV 파싱 주의사항

새로운 언어를 추가할 때는 다음 사항을 반드시 확인해야 합니다:

1. **쉼표 포함 필드**: 새로운 언어의 예문이나 설명에 쉼표가 포함된 경우 반드시 **쌍따옴표("")로 감싸야 합니다**
   - 예: `"안녕하세요, 처음 뵙겠습니다."`, `"Hello, nice to meet you."`
2. **따옴표 누락 시**: CSV 파싱 시 컬럼 수가 맞지 않아 업로드가 실패할 수 있습니다
3. **특히 주의할 언어**: 스페인어, 프랑스어 등 쉼표가 자주 사용되는 언어는 특별히 주의가 필요합니다
4. **문법 설명 필드**: `{lang}_description` 필드에 쉼표가 포함된 경우 반드시 따옴표로 감싸야 합니다

### 2. samples/concepts_template.json

새로운 언어 객체를 추가해야 합니다:

```json
[
  {
    "concept_info": {
      "domain": "daily",
      "category": "food",
      "emoji": "🍎"
    },
    "expressions": {
      "korean": {
        "word": "사과",
        "pronunciation": "사과",
        "definition": "과일의 한 종류",
        "part_of_speech": "명사",
        "synonyms": ["과일"],
        "antonyms": ["채소"],
        "collocations": ["맛있는 사과"],
        "compound_words": ["사과나무"],
        "word_family": ["사과류"]
      },
      "english": {
        "word": "apple",
        "pronunciation": "ˈæpəl",
        "definition": "a round fruit with red or green skin",
        "part_of_speech": "noun",
        "synonyms": ["fruit"],
        "antonyms": ["vegetable"],
        "collocations": ["delicious apple"],
        "compound_words": ["apple tree"],
        "word_family": ["apple family"]
      },
      "japanese": {
        "word": "りんご",
        "pronunciation": "りんご",
        "definition": "丸い果물で赤や緑の皮がある",
        "part_of_speech": "名詞",
        "synonyms": ["果物"],
        "antonyms": ["野菜"],
        "collocations": ["おいしいりんご"],
        "compound_words": ["りんごの木"],
        "word_family": ["りんご科"]
      },
      "chinese": {
        "word": "苹果",
        "pronunciation": "píngguǒ",
        "definition": "圆形水果，有红色或绿色外皮",
        "part_of_speech": "名词",
        "synonyms": ["水果"],
        "antonyms": ["蔬菜"],
        "collocations": ["美味的苹果"],
        "compound_words": ["苹果树"],
        "word_family": ["苹果科"]
      },
      "spanish": {
        "word": "manzana",
        "pronunciation": "manˈθana",
        "definition": "fruta redonda con piel roja o verde",
        "part_of_speech": "sustantivo",
        "synonyms": ["fruta"],
        "antonyms": ["verdura"],
        "collocations": ["manzana deliciosa"],
        "compound_words": ["manzano"],
        "word_family": ["familia de la manzana"]
      }
    },
    "representative_example": {
      "korean": "나는 사과를 먹는다",
      "english": "I eat an apple",
      "japanese": "私はりんごを食べる",
      "chinese": "我吃苹果",
      "spanish": "Como una manzana"
    }
  }
]
```

### 3. samples/templates.js

새로운 언어 데이터를 추가해야 합니다:

```javascript
// CONCEPTS_TEMPLATE_CSV에 새 언어 컬럼 추가
const CONCEPTS_TEMPLATE_CSV = `korean_word,korean_pronunciation,korean_definition,korean_part_of_speech,korean_synonyms,korean_antonyms,korean_collocations,korean_compound_words,korean_word_family,representative_korean,english_word,english_pronunciation,english_definition,english_part_of_speech,english_synonyms,english_antonyms,english_collocations,english_compound_words,english_word_family,representative_english,japanese_word,japanese_pronunciation,japanese_definition,japanese_part_of_speech,japanese_synonyms,japanese_antonyms,japanese_collocations,japanese_compound_words,japanese_word_family,representative_japanese,chinese_word,chinese_pronunciation,chinese_definition,chinese_part_of_speech,chinese_synonyms,chinese_antonyms,chinese_collocations,chinese_compound_words,chinese_word_family,representative_chinese,spanish_word,spanish_pronunciation,spanish_definition,spanish_part_of_speech,spanish_synonyms,spanish_antonyms,spanish_collocations,spanish_compound_words,spanish_word_family,representative_spanish
사과,사과,과일의 한 종류,명사,과일,채소,맛있는 사과,사과나무,사과류,나는 사과를 먹는다,apple,ˈæpəl,a round fruit with red or green skin,noun,fruit,vegetable,delicious apple,apple tree,apple family,I eat an apple,りんご,りんご,丸い果물で赤や緑の皮がある,名詞,果物,野菜,おいしいりんご,りんごの木,りんご科,私はりんごを食べる,苹果,píngguǒ,圆形水果，有红色或绿色外皮,名词,水果,蔬菜,美味的苹果,苹果树,苹果科,我吃苹果,manzana,manˈθana,fruta redonda con piel roja o verde,sustantivo,fruta,verdura,manzana deliciosa,manzano,familia de la manzana,Como una manzana`;

// CONCEPTS_TEMPLATE 배열에 새 언어 객체 추가
const CONCEPTS_TEMPLATE = [
  {
    concept_info: {
      domain: "daily",
      category: "food",
      emoji: "🍎",
    },
    expressions: {
      // 기존 언어들...
      spanish: {
        word: "manzana",
        pronunciation: "manˈθana",
        definition: "fruta redonda con piel roja o verde",
        part_of_speech: "sustantivo",
        synonyms: ["fruta"],
        antonyms: ["verdura"],
        collocations: ["manzana deliciosa"],
        compound_words: ["manzano"],
        word_family: ["familia de la manzana"],
      },
    },
    representative_example: {
      // 기존 언어들...
      spanish: "Como una manzana",
    },
  },
];
```

## 모달 HTML 업데이트

### 1. components/add-concept-modal.html

새로운 언어 탭과 콘텐츠 섹션을 추가해야 합니다:

```html
<!-- 언어 탭에 새 언어 추가 -->
<button class="tab-button active" data-tab="korean">한국어</button>
<button class="tab-button" data-tab="english">English</button>
<button class="tab-button" data-tab="japanese">日本語</button>
<button class="tab-button" data-tab="chinese">中文</button>
<button class="tab-button" data-tab="spanish">Español</button>

<!-- 언어별 콘텐츠 섹션에 새 언어 추가 -->
<div id="spanish-content" class="tab-content">
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">단어</label>
      <input
        type="text"
        id="spanish-word"
        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="단어를 입력하세요"
      />
    </div>
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">발음</label>
      <input
        type="text"
        id="spanish-pronunciation"
        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="발음을 입력하세요"
      />
    </div>
    <div class="md:col-span-2">
      <label class="block text-sm font-medium text-gray-700 mb-1">정의</label>
      <textarea
        id="spanish-definition"
        rows="3"
        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="정의를 입력하세요"
      ></textarea>
    </div>
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">품사</label>
      <select
        id="spanish-part-of-speech"
        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">품사를 선택하세요</option>
        <option value="sustantivo">Sustantivo</option>
        <option value="verbo">Verbo</option>
        <option value="adjetivo">Adjetivo</option>
        <option value="adverbio">Adverbio</option>
      </select>
    </div>
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">유의어</label>
      <input
        type="text"
        id="spanish-synonyms"
        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="쉼표로 구분하여 입력"
      />
    </div>
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">반의어</label>
      <input
        type="text"
        id="spanish-antonyms"
        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="쉼표로 구분하여 입력"
      />
    </div>
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">연어</label>
      <input
        type="text"
        id="spanish-collocations"
        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="쉼표로 구분하여 입력"
      />
    </div>
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">복합어</label>
      <input
        type="text"
        id="spanish-compound-words"
        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="쉼표로 구분하여 입력"
      />
    </div>
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">어족</label>
      <input
        type="text"
        id="spanish-word-family"
        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="쉼표로 구분하여 입력"
      />
    </div>
  </div>

  <!-- 대표 예문 -->
  <div class="mt-4">
    <label class="block text-sm font-medium text-gray-700 mb-1"
      >대표 예문</label
    >
    <textarea
      id="spanish-example"
      rows="2"
      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      placeholder="대표 예문을 입력하세요"
    ></textarea>
  </div>
</div>
```

### 2. components/edit-concept-modal.html

편집 모달에도 동일한 언어 탭과 콘텐츠 섹션을 추가해야 합니다.

## 테스트 및 검증

새로운 언어를 추가한 후 다음 사항들을 확인해야 합니다:

### 1. 기본 기능 테스트

- [ ] 새 언어로 페이지 접속 가능
- [ ] 언어 필터에서 새 언어 선택 가능
- [ ] 새 언어로 개념 추가 가능
- [ ] 새 언어로 개념 편집 가능
- [ ] 새 언어로 개념 보기 가능

### 2. 번역 테스트

- [ ] 모든 UI 텍스트가 새 언어로 번역됨
- [ ] 모달의 모든 텍스트가 새 언어로 번역됨
- [ ] 필터 옵션들이 새 언어로 번역됨
- [ ] 오류 메시지가 새 언어로 표시됨

### 3. 데이터 처리 테스트

- [ ] CSV 파일에서 새 언어 데이터 읽기 가능
- [ ] JSON 파일에서 새 언어 데이터 읽기 가능
- [ ] 새 언어 데이터가 데이터베이스에 저장됨
- [ ] 새 언어 데이터가 올바르게 표시됨

## 문제 해결

### 일반적인 문제들

1. **번역이 적용되지 않는 경우**

   - `translations.json` 파일에 해당 키가 있는지 확인
   - `data-i18n` 속성이 올바르게 설정되었는지 확인
   - 번역 적용 함수가 호출되는지 확인

2. **언어 필터에서 새 언어가 보이지 않는 경우**

   - 모든 HTML 파일의 언어 필터 드롭다운에 새 언어 옵션이 추가되었는지 확인
   - JavaScript 파일의 언어 배열에 새 언어가 추가되었는지 확인

3. **데이터 저장이 안 되는 경우**
   - CSV/JSON 템플릿에 새 언어 컬럼이 추가되었는지 확인
   - 파싱 함수에 새 언어 처리 로직이 추가되었는지 확인

### 디버깅 팁

1. **콘솔 로그 확인**

   - 브라우저 개발자 도구의 콘솔에서 오류 메시지 확인
   - JavaScript 함수 호출 여부 확인

2. **네트워크 탭 확인**

   - 번역 파일 로딩 여부 확인
   - API 호출 성공 여부 확인

3. **로컬 스토리지 확인**
   - 언어 설정이 올바르게 저장되는지 확인
   - 사용자 설정이 올바르게 로드되는지 확인

## 결론

새로운 언어를 추가하는 것은 복잡한 과정이지만, 이 가이드를 따라 단계별로 진행하면 체계적으로 완료할 수 있습니다. 각 단계를 완료한 후에는 반드시 테스트를 진행하여 모든 기능이 정상적으로 작동하는지 확인해야 합니다.

특히 주의해야 할 점은:

- 모든 파일에서 일관성 있게 새 언어를 추가해야 함
- 번역 키가 누락되지 않도록 주의해야 함
- 기존 기능이 깨지지 않도록 주의해야 함
- 사용자 경험을 고려하여 자연스러운 번역을 제공해야 함
