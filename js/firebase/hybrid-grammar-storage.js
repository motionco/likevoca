import { db } from "./firebase-init.js";
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  writeBatch,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

import { hybridGrammarSystem } from "../hybrid-grammar-system.js";

/**
 * 하이브리드 문법 시스템 Firebase 저장 관리자
 */
export class HybridGrammarStorage {
  constructor() {
    this.batchSize = 500; // Firestore 배치 작업 제한
  }

  /**
   * 개념을 하이브리드 문법 시스템과 함께 저장
   */
  async saveConcept(conceptData) {
    try {
      const batch = writeBatch(db);

      // 1. 기본 개념 정보 저장
      const conceptId = conceptData.id || this.generateConceptId(conceptData);
      const conceptRef = doc(db, "concepts", conceptId);

      // 2. 각 언어별 표현에 하이브리드 문법 정보 추가
      const enhancedConcept = await this.enhanceConceptWithGrammar(conceptData);

      batch.set(conceptRef, {
        ...enhancedConcept,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      });

      // 3. 문법 메타데이터 저장
      await this.saveGrammarMetadata(enhancedConcept);

      // 4. 검색 인덱스 업데이트
      await this.updateSearchIndexes(enhancedConcept);

      await batch.commit();

      console.log(`개념 저장 완료: ${conceptId}`);
      return { success: true, conceptId };
    } catch (error) {
      console.error("개념 저장 실패:", error);
      throw error;
    }
  }

  /**
   * 개념에 하이브리드 문법 정보 추가
   */
  async enhanceConceptWithGrammar(conceptData) {
    const enhanced = { ...conceptData };

    // 각 언어별 표현에 하이브리드 문법 정보 추가
    for (const [language, expression] of Object.entries(
      conceptData.expressions || {}
    )) {
      if (!expression) continue;

      try {
        // 하이브리드 문법 정보 생성
        const grammarInfo =
          await hybridGrammarSystem.generateCompleteGrammarInfo(
            expression,
            language,
            "storage"
          );

        // 기존 expression에 grammar_system 추가
        enhanced.expressions[language] = {
          ...expression,
          grammar_system: {
            structured_tags: grammarInfo.structured.raw_tags,
            natural_descriptions: grammarInfo.natural,
            learning_metadata: grammarInfo.learning,
            usage_info: grammarInfo.usage,
            validation: {
              is_valid: grammarInfo.structured.isValid,
              error: grammarInfo.structured.validationError,
            },
            generated_at: new Date().toISOString(),
          },
        };
      } catch (error) {
        console.warn(`문법 정보 생성 실패 (${language}):`, error);
        // 문법 정보 생성 실패 시에도 기본 데이터는 저장
        enhanced.expressions[language] = {
          ...expression,
          grammar_system: {
            error: error.message,
            generated_at: new Date().toISOString(),
          },
        };
      }
    }

    return enhanced;
  }

  /**
   * 문법 메타데이터 저장
   */
  async saveGrammarMetadata(conceptData) {
    const metadataCollection = collection(db, "grammar_metadata");

    for (const [language, expression] of Object.entries(
      conceptData.expressions || {}
    )) {
      if (!expression?.grammar_system) continue;

      const metadataId = `${language}_grammar_meta`;
      const metadataRef = doc(metadataCollection, metadataId);

      try {
        const existingDoc = await getDoc(metadataRef);
        const existingData = existingDoc.exists() ? existingDoc.data() : {};

        // 사용된 문법 태그 수집
        const usedTags = new Set([
          ...(existingData.used_tags || []),
          ...(expression.grammar_system.structured_tags || []),
        ]);

        // 품사 정보 수집
        const usedPOS = new Set(
          [...(existingData.used_pos || []), expression.part_of_speech].filter(
            Boolean
          )
        );

        // 업데이트된 메타데이터
        const updatedMetadata = {
          language,
          used_tags: Array.from(usedTags),
          used_pos: Array.from(usedPOS),
          last_updated: serverTimestamp(),
          tag_count: usedTags.size,
          pos_count: usedPOS.size,
        };

        await setDoc(metadataRef, updatedMetadata, { merge: true });
      } catch (error) {
        console.warn(`문법 메타데이터 저장 실패 (${language}):`, error);
      }
    }
  }

  /**
   * 검색 인덱스 업데이트 (문법 기반)
   */
  async updateSearchIndexes(conceptData) {
    for (const [language, expression] of Object.entries(
      conceptData.expressions || {}
    )) {
      if (!expression?.grammar_system) continue;

      const indexCollectionName = `${language}_grammar_index`;
      const indexCollection = collection(db, indexCollectionName);

      try {
        // 품사별 인덱스
        const posIndexRef = doc(
          indexCollection,
          `pos_${expression.part_of_speech}`
        );
        await this.updateIndexDoc(posIndexRef, conceptData.id);

        // 문법 태그별 인덱스
        for (const tag of expression.grammar_system.structured_tags || []) {
          const tagIndexRef = doc(
            indexCollection,
            `tag_${tag.replace(/[^a-zA-Z0-9]/g, "_")}`
          );
          await this.updateIndexDoc(tagIndexRef, conceptData.id);
        }

        // 난이도별 인덱스
        const difficulty =
          expression.grammar_system.learning_metadata?.difficulty_score;
        if (difficulty !== undefined) {
          const difficultyLevel = this.getDifficultyLevel(difficulty);
          const difficultyIndexRef = doc(
            indexCollection,
            `difficulty_${difficultyLevel}`
          );
          await this.updateIndexDoc(difficultyIndexRef, conceptData.id);
        }
      } catch (error) {
        console.warn(`검색 인덱스 업데이트 실패 (${language}):`, error);
      }
    }
  }

  /**
   * 인덱스 문서 업데이트 도우미
   */
  async updateIndexDoc(indexRef, conceptId) {
    try {
      const indexDoc = await getDoc(indexRef);
      const existingIds = indexDoc.exists()
        ? indexDoc.data().concept_ids || []
        : [];

      if (!existingIds.includes(conceptId)) {
        const updatedIds = [...existingIds, conceptId];
        await setDoc(
          indexRef,
          {
            concept_ids: updatedIds,
            count: updatedIds.length,
            last_updated: serverTimestamp(),
          },
          { merge: true }
        );
      }
    } catch (error) {
      console.warn("인덱스 문서 업데이트 실패:", error);
    }
  }

  /**
   * 문법 기반 개념 검색
   */
  async searchByGrammar(language, filters = {}) {
    try {
      const results = [];
      const indexCollectionName = `${language}_grammar_index`;

      // 품사 필터
      if (filters.pos) {
        const posResults = await this.getConceptsByIndex(
          indexCollectionName,
          `pos_${filters.pos}`
        );
        results.push(...posResults);
      }

      // 문법 태그 필터
      if (filters.tags && filters.tags.length > 0) {
        for (const tag of filters.tags) {
          const tagResults = await this.getConceptsByIndex(
            indexCollectionName,
            `tag_${tag.replace(/[^a-zA-Z0-9]/g, "_")}`
          );
          results.push(...tagResults);
        }
      }

      // 난이도 필터
      if (filters.difficulty) {
        const difficultyResults = await this.getConceptsByIndex(
          indexCollectionName,
          `difficulty_${filters.difficulty}`
        );
        results.push(...difficultyResults);
      }

      // 중복 제거 및 실제 개념 데이터 로드
      const uniqueIds = [...new Set(results)];
      return await this.loadConceptsByIds(uniqueIds);
    } catch (error) {
      console.error("문법 기반 검색 실패:", error);
      return [];
    }
  }

  /**
   * 인덱스로부터 개념 ID 목록 가져오기
   */
  async getConceptsByIndex(collectionName, indexId) {
    try {
      const indexRef = doc(db, collectionName, indexId);
      const indexDoc = await getDoc(indexRef);

      return indexDoc.exists() ? indexDoc.data().concept_ids || [] : [];
    } catch (error) {
      console.warn(`인덱스 로드 실패 (${indexId}):`, error);
      return [];
    }
  }

  /**
   * ID 목록으로 개념 데이터 로드
   */
  async loadConceptsByIds(conceptIds) {
    if (conceptIds.length === 0) return [];

    try {
      const concepts = [];
      const conceptsCollection = collection(db, "concepts");

      // 배치 단위로 처리
      for (let i = 0; i < conceptIds.length; i += this.batchSize) {
        const batchIds = conceptIds.slice(i, i + this.batchSize);

        for (const id of batchIds) {
          const conceptRef = doc(conceptsCollection, id);
          const conceptDoc = await getDoc(conceptRef);

          if (conceptDoc.exists()) {
            concepts.push({
              id: conceptDoc.id,
              ...conceptDoc.data(),
            });
          }
        }
      }

      return concepts;
    } catch (error) {
      console.error("개념 데이터 로드 실패:", error);
      return [];
    }
  }

  /**
   * 기존 개념에 하이브리드 문법 시스템 추가 (마이그레이션)
   */
  async migrateExistingConcepts() {
    try {
      console.log("기존 개념 마이그레이션 시작...");

      const conceptsCollection = collection(db, "concepts");
      const snapshot = await getDocs(conceptsCollection);

      let processedCount = 0;
      const totalCount = snapshot.size;

      for (const docSnapshot of snapshot.docs) {
        try {
          const conceptData = { id: docSnapshot.id, ...docSnapshot.data() };

          // 이미 하이브리드 문법 시스템이 있는지 확인
          const hasGrammarSystem = Object.values(
            conceptData.expressions || {}
          ).some((expr) => expr?.grammar_system);

          if (!hasGrammarSystem) {
            // 문법 시스템 추가
            const enhanced = await this.enhanceConceptWithGrammar(conceptData);

            // 업데이트
            await updateDoc(docSnapshot.ref, {
              expressions: enhanced.expressions,
              updated_at: serverTimestamp(),
            });

            // 메타데이터 및 인덱스 업데이트
            await this.saveGrammarMetadata(enhanced);
            await this.updateSearchIndexes(enhanced);
          }

          processedCount++;

          if (processedCount % 10 === 0) {
            console.log(`마이그레이션 진행: ${processedCount}/${totalCount}`);
          }
        } catch (error) {
          console.warn(`개념 마이그레이션 실패 (${docSnapshot.id}):`, error);
        }
      }

      console.log(`마이그레이션 완료: ${processedCount}/${totalCount}`);
      return { success: true, processed: processedCount, total: totalCount };
    } catch (error) {
      console.error("마이그레이션 실패:", error);
      throw error;
    }
  }

  /**
   * 개념 ID 생성
   */
  generateConceptId(conceptData) {
    const domain = conceptData.concept_info?.domain || "general";
    const category = conceptData.concept_info?.category || "misc";
    const word =
      Object.values(conceptData.expressions || {})[0]?.word || "unknown";
    const timestamp = Date.now();

    return `${domain}_${category}_${word}_${timestamp}`.replace(
      /[^a-zA-Z0-9_]/g,
      "_"
    );
  }

  /**
   * 난이도 점수를 레벨로 변환
   */
  getDifficultyLevel(score) {
    if (score < 30) return "beginner";
    if (score < 60) return "intermediate";
    if (score < 80) return "advanced";
    return "expert";
  }

  /**
   * 문법 시스템 통계 조회
   */
  async getGrammarStatistics() {
    try {
      const stats = {};
      const metadataCollection = collection(db, "grammar_metadata");
      const snapshot = await getDocs(metadataCollection);

      snapshot.forEach((doc) => {
        const data = doc.data();
        stats[data.language] = {
          total_tags: data.tag_count || 0,
          total_pos: data.pos_count || 0,
          used_tags: data.used_tags || [],
          used_pos: data.used_pos || [],
          last_updated: data.last_updated,
        };
      });

      return stats;
    } catch (error) {
      console.error("문법 통계 조회 실패:", error);
      return {};
    }
  }
}

// 싱글톤 인스턴스
export const hybridGrammarStorage = new HybridGrammarStorage();

// 편의 함수들
export async function saveConcept(conceptData) {
  return await hybridGrammarStorage.saveConcept(conceptData);
}

export async function searchByGrammar(language, filters) {
  return await hybridGrammarStorage.searchByGrammar(language, filters);
}

export async function migrateExistingConcepts() {
  return await hybridGrammarStorage.migrateExistingConcepts();
}
