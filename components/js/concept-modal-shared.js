// 개념 모달 공통 번역 시스템
// AI 단어장과 일반 단어장 모달에서 공통으로 사용

/**
 * 도메인/카테고리 번역 함수 (locales 시스템 사용)
 * @param {string} domain - 도메인 키
 * @param {string} category - 카테고리 키
 * @param {string} lang - 언어 코드 (ko, en, ja, zh, es)
 * @returns {string} 번역된 도메인/카테고리 문자열
 */
export function getTranslatedDomainCategory(domain, category, lang = "ko") {
  // 1. window.getI18nText 함수 사용 (locales 시스템)
  if (typeof window.getI18nText === "function") {
    const domainText = window.getI18nText(`domain_${domain}`) || domain;
    const categoryText = window.getI18nText(`category_${category}`) || category;
    return `${domainText} > ${categoryText}`;
  }

  // 2. window.translations 직접 사용 (fallback)
  if (window.translations && window.translations[lang]) {
    const translations = window.translations[lang];
    const domainText = translations[`domain_${domain}`] || domain;
    const categoryText = translations[`category_${category}`] || category;
    return `${domainText} > ${categoryText}`;
  }

  // 3. 기본 fallback
  return `${domain} > ${category}`;
}

/**
 * 품사 번역 함수
 * @param {string} pos - 품사 키
 * @param {string} lang - 언어 코드
 * @returns {string} 번역된 품사
 */
export function getTranslatedPartOfSpeech(pos, lang = "ko") {
  const translations = {
    ko: {
      noun: "명사",
      verb: "동사",
      adjective: "형용사",
      adverb: "부사",
      pronoun: "대명사",
      preposition: "전치사",
      conjunction: "접속사",
      interjection: "감탄사",
      determiner: "한정사",
      particle: "조사",
      classifier: "분류사",
      other: "기타",
    },
    en: {
      noun: "Noun",
      verb: "Verb",
      adjective: "Adjective",
      adverb: "Adverb",
      pronoun: "Pronoun",
      preposition: "Preposition",
      conjunction: "Conjunction",
      interjection: "Interjection",
      determiner: "Determiner",
      particle: "Particle",
      classifier: "Classifier",
      other: "Other",
    },
    ja: {
      noun: "名詞",
      verb: "動詞",
      adjective: "形容詞",
      adverb: "副詞",
      pronoun: "代名詞",
      preposition: "前置詞",
      conjunction: "接続詞",
      interjection: "間投詞",
      determiner: "限定詞",
      particle: "助詞",
      classifier: "分類詞",
      other: "その他",
    },
    zh: {
      noun: "名词",
      verb: "动词",
      adjective: "形容词",
      adverb: "副词",
      pronoun: "代词",
      preposition: "介词",
      conjunction: "连词",
      interjection: "感叹词",
      determiner: "限定词",
      particle: "助词",
      classifier: "量词",
      other: "其他",
    },
    es: {
      noun: "Sustantivo",
      verb: "Verbo",
      adjective: "Adjetivo",
      adverb: "Adverbio",
      pronoun: "Pronombre",
      preposition: "Preposición",
      conjunction: "Conjunción",
      interjection: "Interjección",
      determiner: "Determinante",
      particle: "Partícula",
      classifier: "Clasificador",
      other: "Otro",
    },
  };

  return translations[lang]?.[pos] || pos;
}

/**
 * 난이도 번역 함수
 * @param {string} level - 난이도 키
 * @param {string} lang - 언어 코드
 * @returns {string} 번역된 난이도
 */
export function getTranslatedLevel(level, lang = "ko") {
  const translations = {
    ko: {
      basic: "기초",
      intermediate: "중급",
      advanced: "고급",
      fluent: "유창함",
      technical: "전문 용어",
    },
    en: {
      basic: "Basic",
      intermediate: "Intermediate", 
      advanced: "Advanced",
      fluent: "Fluent",
      technical: "Technical",
    },
    ja: {
      basic: "基礎",
      intermediate: "中級",
      advanced: "上級",
      fluent: "流暢",
      technical: "専門用語",
    },
    zh: {
      basic: "基础",
      intermediate: "中级",
      advanced: "高级", 
      fluent: "流利",
      technical: "专业术语",
    },
    es: {
      basic: "Básico",
      intermediate: "Intermedio",
      advanced: "Avanzado",
      fluent: "Fluido",
      technical: "Técnico",
    },
  };

  return translations[lang]?.[level] || level;
}

/**
 * 언어 이름 번역 함수
 * @param {string} langCode - 언어 코드 (korean, english, japanese, chinese, spanish)
 * @param {string} displayLang - 표시할 언어 코드 (ko, en, ja, zh, es)
 * @returns {string} 번역된 언어 이름
 */
export function getTranslatedLanguageName(langCode, displayLang = "ko") {
  const translations = {
    ko: {
      korean: "한국어",
      english: "영어", 
      japanese: "일본어",
      chinese: "중국어",
      spanish: "스페인어",
    },
    en: {
      korean: "Korean",
      english: "English",
      japanese: "Japanese", 
      chinese: "Chinese",
      spanish: "Spanish",
    },
    ja: {
      korean: "韓国語",
      english: "英語",
      japanese: "日本語",
      chinese: "中国語",
      spanish: "スペイン語",
    },
    zh: {
      korean: "韩语",
      english: "英语",
      japanese: "日语",
      chinese: "中文",
      spanish: "西班牙语",
    },
    es: {
      korean: "Coreano",
      english: "Inglés",
      japanese: "Japonés",
      chinese: "Chino", 
      spanish: "Español",
    },
  };

  return translations[displayLang]?.[langCode] || langCode;
}
