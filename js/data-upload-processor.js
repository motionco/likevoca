/**
 * 통합 데이터 파일을 각 컬렉션으로 분리 저장하는 프로세서
 */

class DataUploadProcessor {
  constructor(db) {
    this.db = db;
    this.batchSize = 50; // Firestore batch 제한 고려
  }

  /**
   * 통합 JSON 파일을 처리하여 각 컬렉션에 저장
   * @param {Object} comprehensiveData - 통합 데이터 객체
   * @returns {Object} 처리 결과
   */
  async processComprehensiveData(comprehensiveData) {
    const results = {
      concepts: { success: 0, error: 0 },
      examples: { success: 0, error: 0 },
      grammar: { success: 0, error: 0 },
      references: { created: 0, error: 0 },
    };

    try {
      console.log("통합 데이터 처리 시작...");

      // 1단계: Grammar Patterns 먼저 저장 (참조 무결성)
      if (comprehensiveData.grammar) {
        console.log("문법 패턴 저장 중...");
        results.grammar = await this.processGrammarData(
          comprehensiveData.grammar
        );
      }

      // 2단계: Concepts 저장
      if (comprehensiveData.concepts) {
        console.log("컨셉 데이터 저장 중...");
        results.concepts = await this.saveConcepts(comprehensiveData.concepts);
      }

      // 3단계: Examples 저장 (concepts와 grammar 참조)
      if (comprehensiveData.examples) {
        console.log("예문 데이터 저장 중...");
        results.examples = await this.processExampleData(
          comprehensiveData.examples
        );
      }

      // 4단계: 참조 관계 설정
      console.log("참조 관계 설정 중...");
      results.references = await this.establishReferences(comprehensiveData);

      console.log("데이터 처리 완료:", results);
      return results;
    } catch (error) {
      console.error("데이터 처리 중 오류:", error);
      throw error;
    }
  }

  /**
   * 문법 패턴 저장
   */
  async processGrammarData(data) {
    console.log("📝 문법 패턴 데이터 처리 시작:", data.length);

    const results = {
      success: 0,
      failed: 0,
      errors: [],
    };

    for (const item of data) {
      try {
        const grammarData = {
          pattern_id:
            item.pattern_id ||
            `pattern_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          pattern_name: item.pattern_name || "기본 패턴",
          pattern_type: item.pattern_type || "basic",
          domain: item.domain || "general",
          category: item.category || "common",
          difficulty: item.difficulty || "beginner",
          tags: Array.isArray(item.tags) ? item.tags : [],
          learning_focus: Array.isArray(item.learning_focus)
            ? item.learning_focus
            : [],
          structural_pattern: item.structural_pattern || "",
          explanations: item.explanations || {},
          usage_examples: Array.isArray(item.usage_examples)
            ? item.usage_examples
            : [],
        };

        await this.collectionManager.createGrammarPattern(grammarData);
        results.success++;
        console.log(`✅ 문법 패턴 처리 완료: ${grammarData.pattern_id}`);
      } catch (error) {
        console.error("문법 패턴 처리 실패:", error);
        results.failed++;
        results.errors.push({
          item: item.pattern_id || "unknown",
          error: error.message,
        });
      }
    }

    console.log("📝 문법 패턴 처리 완료:", results);
    return results;
  }

  /**
   * 컨셉 데이터 저장
   */
  async saveConcepts(concepts) {
    let success = 0,
      error = 0;

    for (const batch of this.createBatches(concepts)) {
      try {
        const firestoreBatch = writeBatch(this.db);

        batch.forEach((concept) => {
          const docRef = doc(collection(this.db, "concepts"), concept.id);

          // 참조 정보 분리
          const { related_examples, related_grammar, ...conceptData } = concept;

          firestoreBatch.set(docRef, {
            ...conceptData,
            // 참조는 별도 처리를 위해 메타데이터에 저장
            metadata: {
              ...conceptData.metadata,
              related_examples: related_examples || [],
              related_grammar: related_grammar || [],
            },
            created_at: serverTimestamp(),
            updated_at: serverTimestamp(),
          });
        });

        await firestoreBatch.commit();
        success += batch.length;
      } catch (err) {
        console.error("컨셉 저장 오류:", err);
        error += batch.length;
      }
    }

    return { success, error };
  }

  /**
   * 예문 데이터 저장
   */
  async saveExamples(examples) {
    let success = 0,
      error = 0;

    for (const batch of this.createBatches(examples)) {
      try {
        const firestoreBatch = writeBatch(this.db);

        batch.forEach((example) => {
          const docRef = doc(collection(this.db, "examples"), example.id);
          firestoreBatch.set(docRef, {
            ...example,
            created_at: serverTimestamp(),
            updated_at: serverTimestamp(),
          });
        });

        await firestoreBatch.commit();
        success += batch.length;
      } catch (err) {
        console.error("예문 저장 오류:", err);
        error += batch.length;
      }
    }

    return { success, error };
  }

  /**
   * 참조 관계 설정 (역방향 참조 생성)
   */
  async establishReferences(data) {
    let created = 0,
      error = 0;

    try {
      // concepts의 related_examples를 기반으로 examples에 concept_id 확인
      if (data.concepts && data.examples) {
        for (const concept of data.concepts) {
          if (concept.related_examples) {
            for (const exampleId of concept.related_examples) {
              const example = data.examples.find((ex) => ex.id === exampleId);
              if (example && !example.concept_id) {
                // examples 문서 업데이트
                const exampleRef = doc(this.db, "examples", exampleId);
                await updateDoc(exampleRef, {
                  concept_id: concept.id,
                  updated_at: serverTimestamp(),
                });
                created++;
              }
            }
          }
        }
      }
    } catch (err) {
      console.error("참조 관계 설정 오류:", err);
      error++;
    }

    return { created, error };
  }

  /**
   * 배치 생성 (Firestore 제한 고려)
   */
  createBatches(items) {
    const batches = [];
    for (let i = 0; i < items.length; i += this.batchSize) {
      batches.push(items.slice(i, i + this.batchSize));
    }
    return batches;
  }

  /**
   * 업로드 진행률 모니터링
   */
  onProgress(callback) {
    this.progressCallback = callback;
  }

  /**
   * 데이터 유효성 검증
   */
  validateData(data) {
    const errors = [];

    // 필수 필드 검증
    if (!data.concepts && !data.examples && !data.grammar) {
      errors.push("최소 하나의 데이터 섹션이 필요합니다.");
    }

    // ID 중복 검증
    if (data.concepts) {
      const conceptIds = data.concepts.map((c) => c.id);
      const duplicates = conceptIds.filter(
        (id, index) => conceptIds.indexOf(id) !== index
      );
      if (duplicates.length > 0) {
        errors.push(`중복된 concept ID: ${duplicates.join(", ")}`);
      }
    }

    // 참조 무결성 검증
    if (data.examples && data.concepts) {
      const conceptIds = new Set(data.concepts.map((c) => c.id));
      for (const example of data.examples) {
        if (example.concept_id && !conceptIds.has(example.concept_id)) {
          errors.push(`존재하지 않는 concept_id 참조: ${example.concept_id}`);
        }
      }
    }

    return errors;
  }

  async processExampleData(data) {
    console.log("📖 예문 데이터 처리 시작:", data.length);

    const results = {
      success: 0,
      failed: 0,
      errors: [],
    };

    for (const item of data) {
      try {
        const exampleData = {
          example_id:
            item.example_id ||
            `example_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          domain: item.domain || "general",
          category: item.category || "common",
          difficulty: item.difficulty || "beginner",
          situation: Array.isArray(item.situation)
            ? item.situation
            : typeof item.situation === "string"
            ? item.situation.split(",").map((s) => s.trim())
            : [],
          purpose: item.purpose || null,
          tags: Array.isArray(item.tags) ? item.tags : [],
          translations: item.translations || {},
        };

        await this.collectionManager.createExample(exampleData);
        results.success++;
        console.log(`✅ 예문 처리 완료: ${exampleData.example_id}`);
      } catch (error) {
        console.error("예문 처리 실패:", error);
        results.failed++;
        results.errors.push({
          item: item.example_id || "unknown",
          error: error.message,
        });
      }
    }

    console.log("📖 예문 처리 완료:", results);
    return results;
  }
}

// 사용 예시
async function uploadComprehensiveData(file, db) {
  try {
    const processor = new DataUploadProcessor(db);

    // 파일 읽기
    const jsonData = JSON.parse(await file.text());

    // 데이터 검증
    const validationErrors = processor.validateData(jsonData);
    if (validationErrors.length > 0) {
      throw new Error(`데이터 검증 실패: ${validationErrors.join(", ")}`);
    }

    // 진행률 모니터링
    processor.onProgress((progress) => {
      console.log(`진행률: ${progress}%`);
    });

    // 데이터 처리
    const results = await processor.processComprehensiveData(jsonData);

    return {
      success: true,
      message: "데이터가 성공적으로 업로드되었습니다.",
      results,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
      results: null,
    };
  }
}

// 방식 1: 핵심 속성 유지, 예문/문법 분리 처리
export async function processBulkUpload(conceptsData) {
  const results = {
    concepts: [],
    examples: [],
    grammarPatterns: [],
    errors: [],
  };

  console.log("방식 1 기반 대량 업로드 처리 시작:", conceptsData.length);

  for (const conceptData of conceptsData) {
    try {
      // 1. concepts 컬렉션 처리 (핵심 속성 + 대표 예문)
      if (conceptData.concept) {
        const conceptDoc = await db
          .collection("concepts")
          .add(conceptData.concept);
        results.concepts.push({
          id: conceptDoc.id,
          data: conceptData.concept,
        });
        console.log("concepts 저장됨:", conceptDoc.id);

        // concept_id 참조를 위해 저장
        const conceptId = conceptDoc.id;

        // 2. examples 컬렉션 처리 (추가 예문들)
        if (conceptData.examples && conceptData.examples.length > 0) {
          for (const example of conceptData.examples) {
            // concept_id 업데이트
            example.concept_id = conceptId;

            const exampleDoc = await db.collection("examples").add(example);
            results.examples.push({
              id: exampleDoc.id,
              concept_id: conceptId,
              data: example,
            });
            console.log("examples 저장됨:", exampleDoc.id);
          }
        }

        // 3. grammar 컬렉션 처리
        if (conceptData.grammar_pattern) {
          // concept_id 업데이트
          conceptData.grammar_pattern.concept_id = conceptId;

          const grammarDoc = await db
            .collection("grammar")
            .add(conceptData.grammar_pattern);
          results.grammarPatterns.push({
            id: grammarDoc.id,
            concept_id: conceptId,
            data: conceptData.grammar_pattern,
          });
          console.log("grammar 저장됨:", grammarDoc.id);
        }
      }
      // 기존 방식 호환성 (featured_examples가 있는 경우)
      else if (conceptData.concept_info && conceptData.expressions) {
        const compatibilityData = {
          concept_info: conceptData.concept_info,
          expressions: conceptData.expressions,
          representative_example: conceptData.featured_examples?.[0] || null,
          learning_metadata: conceptData.learning_metadata || {
            created_from: "legacy_import",
            version: "1.0",
            structure_type: "compatibility",
          },
        };

        const conceptDoc = await db
          .collection("concepts")
          .add(compatibilityData);
        results.concepts.push({
          id: conceptDoc.id,
          data: compatibilityData,
        });
        console.log("호환성 concepts 저장됨:", conceptDoc.id);
      }
    } catch (error) {
      console.error("개념 처리 중 오류:", error);
      results.errors.push({
        conceptData,
        error: error.message,
      });
    }
  }

  console.log("방식 1 처리 완료:", {
    concepts: results.concepts.length,
    examples: results.examples.length,
    grammarPatterns: results.grammarPatterns.length,
    errors: results.errors.length,
  });

  return results;
}

// concepts 컬렉션 구조 (방식 1)
export function validateConceptStructure(conceptData) {
  const required = {
    concept_info: ["domain", "category"],
    expressions: true,
    representative_example: false, // 선택사항
    learning_metadata: ["structure_type"],
  };

  // 기본 구조 검증
  if (!conceptData.concept_info || !conceptData.expressions) {
    return { valid: false, error: "필수 필드 누락: concept_info, expressions" };
  }

  // concept_info 검증
  for (const field of required.concept_info) {
    if (!conceptData.concept_info[field]) {
      return { valid: false, error: `concept_info.${field} 누락` };
    }
  }

  // expressions 검증 (최소 하나의 언어)
  if (Object.keys(conceptData.expressions).length === 0) {
    return { valid: false, error: "expressions에 최소 하나의 언어 필요" };
  }

  // 각 언어별 expression 검증
  for (const [lang, expression] of Object.entries(conceptData.expressions)) {
    if (!expression.word || !expression.definition) {
      return {
        valid: false,
        error: `${lang} expression에 word, definition 필요`,
      };
    }

    // 핵심 속성 검증 (유의어, 반의어, 연어 등)
    const expectedArrays = [
      "synonyms",
      "antonyms",
      "word_family",
      "compound_words",
    ];
    for (const field of expectedArrays) {
      if (expression[field] && !Array.isArray(expression[field])) {
        return { valid: false, error: `${lang}.${field}는 배열이어야 함` };
      }
    }

    // collocations 구조 검증
    if (expression.collocations && !Array.isArray(expression.collocations)) {
      return { valid: false, error: `${lang}.collocations는 배열이어야 함` };
    }
  }

  return { valid: true };
}

// examples 컬렉션 구조 검증
export function validateExampleStructure(exampleData) {
  const required = ["example_id", "concept_id", "translations"];

  for (const field of required) {
    if (!exampleData[field]) {
      return { valid: false, error: `필수 필드 누락: ${field}` };
    }
  }

  // translations 검증
  if (
    typeof exampleData.translations !== "object" ||
    Object.keys(exampleData.translations).length === 0
  ) {
    return { valid: false, error: "translations에 최소 하나의 언어 필요" };
  }

  for (const [lang, translation] of Object.entries(exampleData.translations)) {
    if (!translation.text) {
      return { valid: false, error: `${lang} translation에 text 필요` };
    }
  }

  return { valid: true };
}

// grammar 컬렉션 구조 검증
export function validateGrammarPatternStructure(grammarData) {
  const required = ["pattern_id", "concept_id", "pattern_name"];

  for (const field of required) {
    if (!grammarData[field]) {
      return { valid: false, error: `필수 필드 누락: ${field}` };
    }
  }

  // explanations 검증
  if (grammarData.explanations) {
    for (const [lang, explanation] of Object.entries(
      grammarData.explanations
    )) {
      if (!explanation.pattern) {
        return { valid: false, error: `${lang} explanation에 pattern 필요` };
      }
    }
  }

  return { valid: true };
}

export { DataUploadProcessor, uploadComprehensiveData };
