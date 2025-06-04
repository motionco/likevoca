import { db } from "./firebase/firebase-init.js";
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  query,
  where,
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

// 캐시를 위한 전역 변수
let grammarDataCache = null;
let lastCacheUpdate = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5분

/**
 * 동적 문법 태그 시스템
 * DB에서 문법 정보를 동적으로 로드하고 관리
 */
export class DynamicGrammarSystem {
  constructor() {
    this.cache = new Map();
  }

  /**
   * 데이터베이스에서 문법 태그 정보 로드
   */
  async loadGrammarData() {
    const now = Date.now();

    // 캐시가 유효한 경우 캐시된 데이터 반환
    if (grammarDataCache && now - lastCacheUpdate < CACHE_DURATION) {
      return grammarDataCache;
    }

    try {
      console.log("DB에서 문법 데이터 로드 중...");

      // 1. 기존 concepts에서 사용된 문법 태그 수집
      const conceptsSnapshot = await getDocs(collection(db, "concepts"));
      const grammarData = this.extractGrammarFromConcepts(conceptsSnapshot);

      // 2. 별도의 grammar_metadata 컬렉션이 있다면 로드
      try {
        const grammarMetaSnapshot = await getDocs(
          collection(db, "grammar_metadata")
        );
        if (!grammarMetaSnapshot.empty) {
          this.mergeGrammarMetadata(grammarData, grammarMetaSnapshot);
        }
      } catch (error) {
        console.log("grammar_metadata 컬렉션이 없습니다. 기본 데이터 사용");
      }

      // 3. 캐시 업데이트
      grammarDataCache = grammarData;
      lastCacheUpdate = now;

      console.log("문법 데이터 로드 완료:", grammarData);
      return grammarData;
    } catch (error) {
      console.error("문법 데이터 로드 실패:", error);
      return this.getFallbackGrammarData();
    }
  }

  /**
   * 개념 데이터에서 문법 태그 추출
   */
  extractGrammarFromConcepts(conceptsSnapshot) {
    const grammarData = {
      korean: { pos: new Set(), features: new Map() },
      english: { pos: new Set(), features: new Map() },
      japanese: { pos: new Set(), features: new Map() },
      chinese: { pos: new Set(), features: new Map() },
    };

    conceptsSnapshot.docs.forEach((doc) => {
      const concept = doc.data();

      if (concept.expressions) {
        Object.keys(concept.expressions).forEach((lang) => {
          const expr = concept.expressions[lang];

          // 품사 수집
          if (expr.part_of_speech) {
            grammarData[lang]?.pos.add(expr.part_of_speech);
          }

          // 문법 태그에서 특성 수집
          if (expr.grammar_tags && Array.isArray(expr.grammar_tags)) {
            expr.grammar_tags.forEach((tag) => {
              if (tag.includes(":")) {
                const [category, value] = tag.split(":");
                if (!grammarData[lang]?.features.has(category)) {
                  grammarData[lang].features.set(category, new Set());
                }
                grammarData[lang].features.get(category).add(value);
              } else {
                // 품사 태그
                grammarData[lang]?.pos.add(tag);
              }
            });
          }
        });
      }
    });

    // Set을 Array로 변환
    Object.keys(grammarData).forEach((lang) => {
      grammarData[lang].pos = Array.from(grammarData[lang].pos);

      const featuresObj = {};
      grammarData[lang].features.forEach((values, category) => {
        featuresObj[category] = Array.from(values);
      });
      grammarData[lang].features = featuresObj;
    });

    return grammarData;
  }

  /**
   * grammar_metadata 컬렉션의 데이터와 병합
   */
  mergeGrammarMetadata(grammarData, grammarMetaSnapshot) {
    grammarMetaSnapshot.docs.forEach((doc) => {
      const metadata = doc.data();
      const lang = doc.id;

      if (grammarData[lang]) {
        // 메타데이터의 번역 정보 추가
        if (metadata.pos_translations) {
          grammarData[lang].pos_translations = metadata.pos_translations;
        }

        if (metadata.feature_translations) {
          grammarData[lang].feature_translations =
            metadata.feature_translations;
        }

        // 메타데이터에서 추가 품사/특성 병합
        if (metadata.additional_pos) {
          grammarData[lang].pos = [
            ...new Set([...grammarData[lang].pos, ...metadata.additional_pos]),
          ];
        }

        if (metadata.additional_features) {
          Object.keys(metadata.additional_features).forEach((category) => {
            if (!grammarData[lang].features[category]) {
              grammarData[lang].features[category] = [];
            }
            grammarData[lang].features[category] = [
              ...new Set([
                ...grammarData[lang].features[category],
                ...metadata.additional_features[category],
              ]),
            ];
          });
        }
      }
    });
  }

  /**
   * 폴백 데이터 (최소한의 하드코딩)
   */
  getFallbackGrammarData() {
    return {
      korean: {
        pos: ["명사", "동사", "형용사", "부사", "감탄사"],
        features: {
          verb_type: ["규칙동사", "불규칙동사"],
          honorific: ["평어", "존댓말"],
        },
      },
      english: {
        pos: ["noun", "verb", "adjective", "adverb", "interjection"],
        features: {
          verb_type: ["transitive", "intransitive"],
          number: ["singular", "plural"],
        },
      },
      japanese: {
        pos: ["名詞", "動詞", "形容詞", "副詞", "感動詞"],
        features: {
          verb_group: ["五段動詞", "一段動詞"],
          form: ["丁寧語", "普通語"],
        },
      },
      chinese: {
        pos: ["名词", "动词", "形容词", "副词", "叹词"],
        features: {
          tone: ["一声", "二声", "三声", "四声"],
          verb_type: ["及物动词", "不及物动词"],
        },
      },
    };
  }

  /**
   * 문법 태그 유효성 검사
   */
  async validateGrammarTags(language, pos, features = []) {
    const grammarData = await this.loadGrammarData();
    const langData = grammarData[language];

    if (!langData) {
      return { valid: false, error: `지원하지 않는 언어: ${language}` };
    }

    // 품사 검사
    if (pos && !langData.pos.includes(pos)) {
      return {
        valid: false,
        error: `${language}에서 지원하지 않는 품사: ${pos}`,
        suggestion: `사용 가능한 품사: ${langData.pos.join(", ")}`,
      };
    }

    // 문법 특성 검사
    for (const feature of features) {
      const [category, value] = feature.split(":");
      if (
        langData.features[category] &&
        !langData.features[category].includes(value)
      ) {
        return {
          valid: false,
          error: `${language}의 ${category}에서 지원하지 않는 값: ${value}`,
          suggestion: `사용 가능한 값: ${langData.features[category].join(
            ", "
          )}`,
        };
      }
    }

    return { valid: true };
  }

  /**
   * 언어별 품사 목록 가져오기
   */
  async getPOSList(language) {
    const grammarData = await this.loadGrammarData();
    return grammarData[language]?.pos || [];
  }

  /**
   * 언어별 문법 특성 목록 가져오기
   */
  async getGrammarFeatures(language) {
    const grammarData = await this.loadGrammarData();
    return grammarData[language]?.features || {};
  }

  /**
   * 태그를 사용자 친화적 형태로 변환
   */
  async formatGrammarTags(language, pos, features = []) {
    const grammarData = await this.loadGrammarData();
    const langData = grammarData[language];

    if (!langData) return { pos: pos, features: features };

    // 번역 정보가 있으면 사용, 없으면 원본 사용
    const formattedPOS = langData.pos_translations?.[pos] || pos;

    const formattedFeatures = features.map((feature) => {
      const [category, value] = feature.split(":");
      const categoryTranslation =
        langData.feature_translations?.[category] || category;
      const valueTranslation = langData.feature_translations?.[value] || value;
      return `${categoryTranslation}: ${valueTranslation}`;
    });

    return {
      pos: formattedPOS,
      features: formattedFeatures,
    };
  }

  /**
   * 캐시 무효화
   */
  invalidateCache() {
    grammarDataCache = null;
    lastCacheUpdate = 0;
    console.log("문법 태그 캐시가 무효화되었습니다.");
  }

  /**
   * 새로운 문법 태그를 DB에 추가
   */
  async addGrammarTag(language, type, category, value) {
    try {
      const docRef = doc(db, "grammar_metadata", language);
      const docSnap = await getDoc(docRef);

      let data = docSnap.exists()
        ? docSnap.data()
        : {
            additional_pos: [],
            additional_features: {},
          };

      if (type === "pos") {
        if (!data.additional_pos.includes(value)) {
          data.additional_pos.push(value);
        }
      } else if (type === "feature") {
        if (!data.additional_features[category]) {
          data.additional_features[category] = [];
        }
        if (!data.additional_features[category].includes(value)) {
          data.additional_features[category].push(value);
        }
      }

      await setDoc(docRef, data, { merge: true });
      this.invalidateCache(); // 캐시 무효화

      console.log(
        `새로운 문법 태그 추가됨: ${language} - ${type} - ${
          category || "pos"
        } - ${value}`
      );
      return true;
    } catch (error) {
      console.error("문법 태그 추가 실패:", error);
      return false;
    }
  }
}

// 싱글톤 인스턴스
export const dynamicGrammarSystem = new DynamicGrammarSystem();

// 기존 함수들을 래핑하여 호환성 유지
export async function validateGrammarTags(language, pos, features = []) {
  return await dynamicGrammarSystem.validateGrammarTags(
    language,
    pos,
    features
  );
}

export async function getPOSList(language) {
  return await dynamicGrammarSystem.getPOSList(language);
}

export async function getGrammarFeatures(language) {
  return await dynamicGrammarSystem.getGrammarFeatures(language);
}

export async function formatGrammarTags(language, pos, features = []) {
  return await dynamicGrammarSystem.formatGrammarTags(language, pos, features);
}

// CSV 관련 헬퍼 함수들은 그대로 유지
export function getGrammarTagHeaders() {
  return [
    "korean_grammar_tags",
    "english_grammar_tags",
    "japanese_grammar_tags",
    "chinese_grammar_tags",
  ];
}

export function grammarTagsToCSV(tags) {
  if (!tags || tags.length === 0) return "";
  return tags.join("|");
}

export function grammarTagsFromCSV(csvString) {
  if (!csvString || csvString.trim() === "") return [];
  return csvString
    .split("|")
    .map((tag) => tag.trim())
    .filter((tag) => tag);
}
