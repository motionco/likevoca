import { auth, db, supportedLanguages } from "./firebase-init.js";

import {
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  writeBatch,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

/**
 * 분리된 컬렉션 관리 시스템
 * - concepts: 핵심 개념 정보
 * - examples: 예문 정보
 * - grammar: 문법 패턴 정보
 * - quiz_templates: 퀴즈 템플릿 정보
 * - user_progress: 사용자 학습 진도
 * - language_indexes: 언어별 인덱스 (기존 유지)
 */

export class CollectionManager {
  constructor() {
    this.batchSize = 2; // BloomFilter 에러 완화를 위해 3에서 2로 더 축소
  }

  /**
   * 통합 개념 데이터를 분리된 컬렉션으로 저장
   * 대량 업로드 시 효율성과 속도를 위해 배치 처리 사용
   */
  async createSeparatedConcept(integratedConceptData) {
    // Firestore 자동 ID 사용 (더 안전하고 효율적)
    const conceptRef = doc(collection(db, "concepts"));
    const conceptId = conceptRef.id;

    try {
      console.log(`분리된 컬렉션 개념 생성 시작: ${conceptId}`);

      // BloomFilter 에러 방지를 위한 초기 지연
      await new Promise((resolve) => setTimeout(resolve, 100));

      console.log(`📊 입력 데이터 구조:`, {
        has_additional_examples: !!integratedConceptData.additional_examples,
        additional_examples_count:
          integratedConceptData.additional_examples?.length || 0,
        has_featured_examples: !!integratedConceptData.featured_examples,
        featured_examples_count:
          integratedConceptData.featured_examples?.length || 0,
        has_core_examples: !!integratedConceptData.core_examples,
        core_examples_count: integratedConceptData.core_examples?.length || 0,
        has_grammar: !!integratedConceptData.grammar,
        grammar_count: integratedConceptData.grammar?.length || 0,
        has_grammar_system_in_examples: this.hasGrammarSystemInExamples(
          integratedConceptData
        ),
      });

      // 1. 핵심 개념 정보 저장 (concepts 컬렉션) - 개별 처리
      const conceptDoc = await this.prepareCoreConceptDoc(
        conceptId,
        integratedConceptData
      );

      await setDoc(conceptRef, conceptDoc);
      console.log(`✓ concepts 컬렉션에 저장 완료: ${conceptId}`);

      // 2. 예문 정보 분리 저장 (examples 컬렉션) - **모든 예문 저장**
      const exampleIds = [];

      // === 수정: 모든 예문을 examples 컬렉션에 저장 ===
      let allExamples = [];

      // featured_examples 우선 사용
      if (
        integratedConceptData.featured_examples &&
        integratedConceptData.featured_examples.length > 0
      ) {
        allExamples = integratedConceptData.featured_examples;
        console.log(`📝 featured_examples 사용: ${allExamples.length}개`);
      }
      // additional_examples 사용
      else if (
        integratedConceptData.additional_examples &&
        integratedConceptData.additional_examples.length > 0
      ) {
        allExamples = integratedConceptData.additional_examples;
        console.log(`📝 additional_examples 사용: ${allExamples.length}개`);
      }
      // core_examples 사용 (모든 예문, 첫 번째 포함)
      else if (
        integratedConceptData.core_examples &&
        integratedConceptData.core_examples.length > 0
      ) {
        allExamples = integratedConceptData.core_examples;
        console.log(
          `📝 core_examples 사용: ${allExamples.length}개 (모든 예문 포함)`
        );
      }

      if (allExamples.length === 0) {
        console.log(
          `⚠️ 예문이 없습니다. examples 컬렉션에 저장할 데이터가 없습니다.`
        );
      }

      // 모든 예문을 examples 컬렉션에 저장
      for (const [index, example] of allExamples.entries()) {
        const exampleId =
          example.example_id ||
          example.id ||
          `${conceptId}_example_${index + 1}`;
        const exampleRef = doc(db, "examples", exampleId);

        const exampleDoc = {
          example_id: exampleId,
          concept_id: conceptId,
          order_index: index, // 0부터 시작
          context: example.context || "general",
          difficulty: example.difficulty || "beginner",
          priority: example.priority || 10 - index, // 첫 번째가 높은 우선순위
          translations: example.translations || {},
          grammar_pattern_id: example.grammar_pattern_id || null,
          is_representative: index === 0, // 첫 번째 예문이 대표 예문
          learning_metadata: {
            quiz_eligible: example.metadata?.quiz_eligible !== false,
            game_eligible: example.metadata?.game_eligible !== false,
            learning_weight: example.metadata?.learning_weight || 10,
          },
          metadata: {
            created_at: serverTimestamp(),
            source: "separated_collection_import",
            from_field: integratedConceptData.featured_examples
              ? "featured_examples"
              : integratedConceptData.additional_examples
              ? "additional_examples"
              : "core_examples",
          },
        };

        await setDoc(exampleRef, exampleDoc);
        exampleIds.push(exampleId);
        console.log(
          `✓ examples 컬렉션에 예문 저장 완료: ${exampleId} (순서: ${
            index + 1
          })`
        );

        // BloomFilter 에러 방지를 위한 짧은 지연
        if (index < allExamples.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 50));
        }
      }

      // 3. 문법 패턴 정보 저장 (grammar 컬렉션) - 개별 처리
      const grammarPatternIds = [];
      const processedPatterns = new Set();

      console.log(`🔍 문법 패턴 처리 시작...`);

      // 직접 제공된 grammar 배열 처리 (우선)
      if (
        integratedConceptData.grammar &&
        Array.isArray(integratedConceptData.grammar)
      ) {
        console.log(
          `📝 직접 제공된 문법 패턴: ${integratedConceptData.grammar.length}개`
        );

        for (const grammarPatternData of integratedConceptData.grammar) {
          // === 수정: 개념별 고유 패턴 ID 생성 ===
          const originalPatternId = grammarPatternData.pattern_id;
          const uniquePatternId = `${conceptId}_${originalPatternId}`;
          console.log(
            `🔄 문법 패턴 처리 중: ${uniquePatternId} (원본: ${originalPatternId})`
          );

          if (!processedPatterns.has(uniquePatternId)) {
            const patternRef = doc(db, "grammar", uniquePatternId);

            try {
              await setDoc(patternRef, {
                ...grammarPatternData,
                pattern_id: uniquePatternId, // 고유 ID로 업데이트
                created_at: serverTimestamp(),
                updated_at: serverTimestamp(),
              });
              grammarPatternIds.push(uniquePatternId);
              console.log(`✓ grammar 컬렉션에 저장 완료: ${uniquePatternId}`);

              // BloomFilter 에러 방지를 위한 짧은 지연
              await new Promise((resolve) => setTimeout(resolve, 50));
            } catch (error) {
              console.warn(`문법 패턴 ${uniquePatternId} 처리 중 오류:`, error);
            }

            processedPatterns.add(uniquePatternId);
          }
        }
      } else {
        console.log(`⚠️ 직접 제공된 grammar 없음`);
      }

      // 예문에서 문법 패턴 추출
      console.log(`🔍 예문에서 문법 패턴 추출 시작...`);

      for (const example of allExamples) {
        // grammar_pattern_id가 있는 경우
        if (example.grammar_pattern_id) {
          // === 수정: 개념별 고유 패턴 ID 생성 ===
          const originalPatternId = example.grammar_pattern_id;
          const uniquePatternId = `${conceptId}_${originalPatternId}`;

          if (!processedPatterns.has(uniquePatternId)) {
            console.log(
              `🔄 예문에서 문법 패턴 추출: ${uniquePatternId} (원본: ${originalPatternId})`
            );

            const patternRef = doc(db, "grammar", uniquePatternId);

            try {
              const patternDoc = this.generateGrammarPatternDoc(
                uniquePatternId,
                conceptId,
                example,
                integratedConceptData
              );
              await setDoc(patternRef, patternDoc);
              grammarPatternIds.push(uniquePatternId);
              console.log(
                `✓ grammar 컬렉션에 저장 완료: ${uniquePatternId} (예문에서 추출)`
              );

              // BloomFilter 에러 방지를 위한 짧은 지연
              await new Promise((resolve) => setTimeout(resolve, 50));
            } catch (error) {
              console.warn(`문법 패턴 ${uniquePatternId} 처리 중 오류:`, error);
            }

            processedPatterns.add(uniquePatternId);
          }
        }

        // grammar_system이 있는 경우 (새 템플릿 형식)
        if (example.grammar_system && example.grammar_system.pattern_name) {
          // === 수정: 개념별 고유 패턴 ID 생성 ===
          const basePatternId = `pattern_${example.grammar_system.pattern_name
            .replace(/\s+/g, "_")
            .toLowerCase()}`;
          const uniquePatternId = `${conceptId}_${basePatternId}`;

          if (!processedPatterns.has(uniquePatternId)) {
            console.log(
              `🔄 grammar_system에서 문법 패턴 생성: ${uniquePatternId}`
            );

            const patternRef = doc(db, "grammar", uniquePatternId);

            try {
              const patternDoc = this.generateGrammarPatternFromSystem(
                uniquePatternId,
                conceptId,
                example.grammar_system,
                integratedConceptData
              );
              await setDoc(patternRef, patternDoc);
              grammarPatternIds.push(uniquePatternId);
              console.log(
                `✓ grammar 컬렉션에 저장 완료: ${uniquePatternId} (grammar_system에서 생성)`
              );
            } catch (error) {
              console.warn(`문법 패턴 ${uniquePatternId} 처리 중 오류:`, error);
            }

            processedPatterns.add(uniquePatternId);
          }
        }
      }

      // 4. 퀴즈 템플릿 생성 (quiz_templates 컬렉션) - 개별 처리
      const quizTemplateIds = [];
      const domain = integratedConceptData.concept_info?.domain || "general";
      const category = integratedConceptData.concept_info?.category || "common";
      const quizTypes = [
        "translation",
        "pronunciation",
        "matching",
        "fill_in_blank",
      ];

      for (const quizType of quizTypes) {
        const templateId = `${conceptId}_${quizType}`;
        const templateRef = doc(db, "quiz_templates", templateId);

        const templateDoc = {
          template_id: templateId,
          concept_id: conceptId,
          quiz_type: quizType,
          domain: domain,
          category: category,
          settings: this.generateQuizSettings(quizType, integratedConceptData),
          question_templates: this.generateQuestionTemplates(quizType),
          usage_stats: {
            total_attempts: 0,
            correct_answers: 0,
            average_time: 0,
          },
          metadata: {
            created_at: serverTimestamp(),
            active: true,
          },
        };

        await setDoc(templateRef, templateDoc);
        quizTemplateIds.push(templateId);
        console.log(`✓ quiz_templates 컬렉션에 저장 완료: ${templateId}`);

        // BloomFilter 에러 방지를 위한 짧은 지연
        if (quizType !== "fill_in_blank") {
          // 마지막 템플릿이 아닌 경우에만
          await new Promise((resolve) => setTimeout(resolve, 50));
        }
      }

      // 5. 언어별 인덱스 업데이트 (기존 시스템 활용)
      await this.updateLanguageIndexes(conceptId, integratedConceptData);
      console.log(`✓ 언어별 인덱스 업데이트 완료: ${conceptId}`);

      // 6. 사용자 진도 초기화 (user_progress 컬렉션)
      if (auth.currentUser) {
        await this.initializeUserProgress(conceptId, auth.currentUser.email);
        console.log(`✓ 사용자 진도 초기화 완료: ${conceptId}`);
      }

      const result = {
        conceptId,
        exampleIds: exampleIds,
        grammarPatternIds: grammarPatternIds,
        quizTemplateIds: quizTemplateIds,
      };

      console.log(`✅ 분리된 컬렉션 개념 생성 완료:`, {
        conceptId,
        collections: {
          concepts: "1개 저장됨",
          examples: `${exampleIds.length}개 저장됨`,
          grammar: `${grammarPatternIds.length}개 저장됨`,
          quiz_templates: `${quizTemplateIds.length}개 저장됨`,
        },
      });
      return result;
    } catch (error) {
      console.error(`분리된 컬렉션 생성 중 오류 (${conceptId}):`, error);
      throw error;
    }
  }

  /**
   * 대량 개념 일괄 처리 - 배치 최적화
   */
  async bulkCreateSeparatedConcepts(integratedConceptsArray) {
    const results = [];
    const errors = [];

    // 배치 크기로 나누어 처리
    for (let i = 0; i < integratedConceptsArray.length; i += this.batchSize) {
      const batch = integratedConceptsArray.slice(i, i + this.batchSize);

      try {
        const batchResults = await Promise.allSettled(
          batch.map((conceptData) => this.createSeparatedConcept(conceptData))
        );

        batchResults.forEach((result, index) => {
          if (result.status === "fulfilled") {
            results.push(result.value);
          } else {
            errors.push({
              index: i + index,
              error: result.reason,
              conceptData: batch[index],
            });
          }
        });

        // 배치 간 지연으로 Firestore 부하 방지
        if (i + this.batchSize < integratedConceptsArray.length) {
          await new Promise((resolve) => setTimeout(resolve, 600));
        }
      } catch (error) {
        console.error(
          `배치 ${Math.floor(i / this.batchSize) + 1} 처리 중 오류:`,
          error
        );
        errors.push({ batchIndex: Math.floor(i / this.batchSize), error });
      }
    }

    return { results, errors };
  }

  /**
   * 핵심 개념 문서 준비 (대표 예문 포함)
   */
  async prepareCoreConceptDoc(conceptId, integratedData) {
    // 대표 예문 선택 (우선순위: representative_example > featured_examples[0] > core_examples[0] > additional_examples[0])
    let representativeExample = null;

    if (integratedData.representative_example) {
      representativeExample = integratedData.representative_example;
    } else if (
      integratedData.featured_examples &&
      integratedData.featured_examples.length > 0
    ) {
      representativeExample = integratedData.featured_examples[0];
    } else if (
      integratedData.core_examples &&
      integratedData.core_examples.length > 0
    ) {
      representativeExample = integratedData.core_examples[0];
    } else if (
      integratedData.additional_examples &&
      integratedData.additional_examples.length > 0
    ) {
      representativeExample = integratedData.additional_examples[0];
    }

    return {
      // concept_id 중복 제거 - Firestore document ID 사용
      concept_info: {
        // concept_id: conceptId, // 제거: document ID와 중복
        ...integratedData.concept_info,
        updated_at: serverTimestamp(),
      },
      expressions: integratedData.expressions,

      // 대표 예문 포함 (카드 표시용)
      representative_example: representativeExample,

      // 참조 정보만 포함 (실제 데이터는 분리된 컬렉션에)
      references: {
        example_count:
          integratedData.core_examples?.length ||
          integratedData.additional_examples?.length ||
          0,
        grammar_pattern_count: this.extractGrammarPatternCount(integratedData),
        quiz_template_count: this.calculateQuizTemplateCount(integratedData),
        has_media: !!integratedData.media?.images?.primary,
      },

      // 검색 및 필터링을 위한 간소화된 메타데이터
      search_metadata: {
        all_words: this.extractAllWords(integratedData.expressions),
        domains: [integratedData.concept_info?.domain || "general"],
        categories: [integratedData.concept_info?.category || "common"],
        difficulty: integratedData.concept_info?.difficulty || "beginner",
        languages: Object.keys(integratedData.expressions),
      },

      // 미디어 정보 제거 (템플릿에서 지원하지 않음)

      metadata: {
        created_at: serverTimestamp(),
        created_from: integratedData.metadata?.created_from || "manual",
        version: "3.0_with_representative_example",
        collection_structure: "separated_with_representative",
      },
    };
  }

  /**
   * 예문 문서들 준비
   */
  async prepareExampleDocs(conceptId, coreExamples, batch) {
    const exampleRefs = [];

    for (const [index, example] of coreExamples.entries()) {
      const exampleId =
        example.example_id || `${conceptId}_example_${index + 1}`;
      const exampleRef = doc(db, "examples", exampleId);

      const exampleDoc = {
        example_id: exampleId,
        concept_id: conceptId,
        order_index: index,
        context: example.context || "general",
        difficulty: example.difficulty || "beginner",
        priority: example.priority || 1,

        // 번역 정보
        translations: example.translations,

        // 문법 패턴 참조
        grammar_pattern_id: example.grammar_pattern_id || null,

        // 학습 메타데이터
        learning_metadata: {
          quiz_eligible: example.metadata?.quiz_eligible !== false,
          game_eligible: example.metadata?.game_eligible !== false,
          learning_weight: example.metadata?.learning_weight || 10,
        },

        metadata: {
          created_at: serverTimestamp(),
          source: "bulk_import",
        },
      };

      batch.set(exampleRef, exampleDoc);
      exampleRefs.push(exampleRef);
    }

    return exampleRefs;
  }

  /**
   * 문법 패턴 문서들 준비
   */
  async prepareGrammarPatternDocs(conceptId, integratedData, batch) {
    const grammarPatternRefs = [];
    const processedPatterns = new Set();

    // 예문에서 문법 패턴 추출
    const coreExamples = integratedData.core_examples || [];

    for (const example of coreExamples) {
      if (
        example.grammar_pattern_id &&
        !processedPatterns.has(example.grammar_pattern_id)
      ) {
        const patternId = example.grammar_pattern_id;
        const patternRef = doc(db, "grammar", patternId);

        // 기존 패턴이 있는지 확인
        try {
          const existingPattern = await getDoc(patternRef);
          if (!existingPattern.exists()) {
            const patternDoc = this.generateGrammarPatternDoc(
              patternId,
              conceptId,
              example,
              integratedData
            );
            batch.set(patternRef, patternDoc);
            grammarPatternRefs.push(patternRef);
          } else {
            // 기존 패턴에 개념 참조 추가
            const updateData = {
              updated_at: serverTimestamp(),
            };
            batch.update(patternRef, updateData);
          }
        } catch (error) {
          console.warn(`문법 패턴 ${patternId} 확인 중 오류:`, error);
        }

        processedPatterns.add(patternId);
      }
    }

    return grammarPatternRefs;
  }

  /**
   * 퀴즈 템플릿 문서들 준비
   */
  async prepareQuizTemplateDocs(conceptId, integratedData, batch) {
    const quizTemplateRefs = [];
    const domain = integratedData.concept_info.domain;
    const category = integratedData.concept_info.category;

    // 기본 퀴즈 타입들
    const quizTypes = [
      "translation",
      "pronunciation",
      "matching",
      "fill_in_blank",
    ];

    for (const quizType of quizTypes) {
      const templateId = `${conceptId}_${quizType}`;
      const templateRef = doc(db, "quiz_templates", templateId);

      const templateDoc = {
        template_id: templateId,
        concept_id: conceptId,
        quiz_type: quizType,
        domain: domain,
        category: category,

        // 퀴즈 설정
        settings: this.generateQuizSettings(quizType, integratedData),

        // 질문 템플릿 (반복 최소화를 위한 템플릿)
        question_templates: this.generateQuestionTemplates(quizType),

        // 사용 통계
        usage_stats: {
          total_attempts: 0,
          correct_answers: 0,
          average_time: 0,
        },

        metadata: {
          created_at: serverTimestamp(),
          active: true,
        },
      };

      batch.set(templateRef, templateDoc);
      quizTemplateRefs.push(templateRef);
    }

    return quizTemplateRefs;
  }

  /**
   * 언어별 인덱스 업데이트 (기존 시스템 활용)
   */
  async updateLanguageIndexes(conceptId, integratedData) {
    const expressions = integratedData.expressions;
    const domain = integratedData.concept_info.domain;
    const category = integratedData.concept_info.category;
    const difficulty = integratedData.concept_info.difficulty;

    for (const [lang, expression] of Object.entries(expressions)) {
      if (expression?.word) {
        await this.updateLanguageIndex(
          lang,
          expression.word,
          conceptId,
          category,
          difficulty
        );
      }
    }
  }

  /**
   * 개별 언어 인덱스 업데이트
   */
  async updateLanguageIndex(language, word, conceptId, category, difficulty) {
    try {
      const indexCollection = `${language}_index`;
      const q = query(
        collection(db, indexCollection),
        where("word", "==", word)
      );
      const querySnapshot = await getDocs(q);

      // 현재 시간을 미리 생성 (arrayUnion 내부에서 serverTimestamp 사용 불가)
      const now = new Date();

      if (!querySnapshot.empty) {
        const indexDoc = querySnapshot.docs[0];
        const indexData = indexDoc.data();
        const existingConcepts = indexData.concepts || [];

        const conceptExists = existingConcepts.some(
          (c) => c.concept_id === conceptId
        );

        if (!conceptExists) {
          await updateDoc(indexDoc.ref, {
            concepts: arrayUnion({
              concept_id: conceptId,
              category,
              difficulty,
              updated_at: now,
            }),
            total_concepts: existingConcepts.length + 1,
            last_updated: serverTimestamp(),
          });
        }
      } else {
        await setDoc(doc(collection(db, indexCollection)), {
          word: word,
          concepts: [
            {
              concept_id: conceptId,
              category,
              difficulty,
              updated_at: now,
            },
          ],
          total_concepts: 1,
          created_at: serverTimestamp(),
        });
      }
    } catch (error) {
      console.error(`${language} 인덱스 업데이트 중 오류:`, error);
      throw error;
    }
  }

  /**
   * 사용자 진도 초기화
   */
  async initializeUserProgress(conceptId, userEmail) {
    try {
      const progressId = `${userEmail}_${conceptId}`;
      const progressRef = doc(db, "user_progress", progressId);

      const progressDoc = {
        progress_id: progressId,
        user_email: userEmail,
        concept_id: conceptId,

        // 어휘 마스터리
        vocabulary_mastery: {
          recognition: 0,
          production: 0,
          fluency: 0,
          last_studied: null,
          study_count: 0,
        },

        // 예문 마스터리
        example_mastery: {
          comprehension: 0,
          production: 0,
          context_usage: 0,
          examples_mastered: [],
        },

        // 퀴즈 성과
        quiz_performance: {
          total_attempts: 0,
          correct_answers: 0,
          average_time: 0,
          best_streak: 0,
          quiz_types_mastered: [],
        },

        // 게임 성과
        game_performance: {
          total_games_played: 0,
          games_won: 0,
          best_score: 0,
          favorite_game_type: null,
        },

        // 전체 마스터리 레벨
        overall_mastery: {
          level: 0, // 0-100
          status: "not_started", // not_started, learning, practiced, mastered
          first_encounter: serverTimestamp(),
          last_interaction: null,
        },

        metadata: {
          created_at: serverTimestamp(),
          version: "2.0",
        },
      };

      await setDoc(progressRef, progressDoc);
    } catch (error) {
      console.error("사용자 진도 초기화 중 오류:", error);
      // 진도 초기화 실패는 전체 작업을 중단시키지 않음
    }
  }

  /**
   * 분리된 컬렉션에서 통합 개념 데이터 조회
   */
  async getIntegratedConcept(conceptId) {
    try {
      // 1. 핵심 개념 정보
      const conceptRef = doc(db, "concepts", conceptId);
      const conceptDoc = await getDoc(conceptRef);

      if (!conceptDoc.exists()) {
        throw new Error(`개념 ${conceptId}를 찾을 수 없습니다`);
      }

      const conceptData = conceptDoc.data();

      // 2. 관련 예문들
      const examplesQuery = query(
        collection(db, "examples"),
        where("concept_id", "==", conceptId),
        orderBy("order_index")
      );
      const examplesSnapshot = await getDocs(examplesQuery);
      const examples = examplesSnapshot.docs.map((doc) => doc.data());

      // 3. 관련 문법 패턴들 (단순하게 모든 패턴 조회)
      const grammarPatternsQuery = query(collection(db, "grammar"), limit(20));
      const grammarPatternsSnapshot = await getDocs(grammarPatternsQuery);
      const grammarPatterns = grammarPatternsSnapshot.docs.map((doc) =>
        doc.data()
      );

      // 4. 퀴즈 템플릿들
      const quizTemplatesQuery = query(
        collection(db, "quiz_templates"),
        where("concept_id", "==", conceptId)
      );
      const quizTemplatesSnapshot = await getDocs(quizTemplatesQuery);
      const quizTemplates = quizTemplatesSnapshot.docs.map((doc) => doc.data());

      // 통합 데이터 구성
      return {
        ...conceptData,
        core_examples: examples,
        grammar: grammarPatterns,
        quiz_templates: quizTemplates,
      };
    } catch (error) {
      console.error("통합 개념 데이터 조회 중 오류:", error);
      throw error;
    }
  }

  /**
   * 학습용 개념 조회 - 최적화된 쿼리
   */
  async getConceptsForLearning(userLanguage, targetLanguage, limit = 20) {
    try {
      const conceptsQuery = query(
        collection(db, "concepts"),
        where("search_metadata.languages", "array-contains-any", [
          userLanguage,
          targetLanguage,
        ])
      );

      const conceptsSnapshot = await getDocs(conceptsQuery);
      const concepts = [];

      for (const doc of conceptsSnapshot.docs) {
        const conceptData = doc.data();

        // 두 언어 모두 있는지 확인
        if (
          conceptData.expressions?.[userLanguage] &&
          conceptData.expressions?.[targetLanguage]
        ) {
          // 대표 예문 1개만 가져오기 (성능 최적화)
          const representativeExample = await this.getRepresentativeExample(
            doc.id,
            userLanguage,
            targetLanguage
          );

          concepts.push({
            id: doc.id,
            conceptInfo: conceptData.concept_info,
            fromExpression: conceptData.expressions[userLanguage],
            toExpression: conceptData.expressions[targetLanguage],
            representativeExample,
            media: conceptData.media,
            created_at:
              conceptData.metadata?.created_at || conceptData.created_at,
          });

          // limit 적용
          if (concepts.length >= limit) {
            break;
          }
        }
      }

      // JavaScript로 정렬 (최신순)
      concepts.sort((a, b) => {
        const getTime = (concept) => {
          if (concept.created_at?.toDate) {
            return concept.created_at.toDate().getTime();
          }
          if (concept.created_at) {
            return new Date(concept.created_at).getTime();
          }
          return 0;
        };
        return getTime(b) - getTime(a);
      });

      return concepts.slice(0, limit);
    } catch (error) {
      console.error("학습용 개념 조회 중 오류:", error);
      throw error;
    }
  }

  /**
   * 게임용 개념 조회 - 최적화된 쿼리
   */
  async getConceptsForGame(gameType, difficulty, languagePair, limit = 10) {
    try {
      const [userLang, targetLang] = languagePair;

      // 언어 코드 매핑 (게임에서 사용하는 코드 -> DB 저장 코드)
      const languageMapping = {
        korean: "korean",
        english: "english",
        japanese: "japanese",
        chinese: "chinese",
      };

      const mappedUserLang = languageMapping[userLang] || userLang;
      const mappedTargetLang = languageMapping[targetLang] || targetLang;

      console.log(
        `게임용 개념 조회: ${userLang}(${mappedUserLang}) -> ${targetLang}(${mappedTargetLang}), 난이도: ${difficulty}`
      );

      let conceptsQuery = query(
        collection(db, "concepts"),
        where("search_metadata.languages", "array-contains-any", [
          mappedUserLang,
          mappedTargetLang,
        ])
      );

      // 난이도 조건 추가
      if (difficulty && difficulty !== "all" && difficulty !== "basic") {
        conceptsQuery = query(
          collection(db, "concepts"),
          where("search_metadata.languages", "array-contains-any", [
            mappedUserLang,
            mappedTargetLang,
          ]),
          where("concept_info.difficulty", "==", difficulty)
        );
      }

      const conceptsSnapshot = await getDocs(conceptsQuery);
      const concepts = [];

      console.log(
        `DB에서 조회된 전체 개념 수: ${conceptsSnapshot.docs.length}`
      );

      for (const doc of conceptsSnapshot.docs) {
        const conceptData = doc.data();

        // 개념 데이터 구조 디버깅
        console.log(`개념 ${doc.id} 검사:`, {
          expressions: Object.keys(conceptData.expressions || {}),
          hasUserLang: !!conceptData.expressions?.[mappedUserLang]?.word,
          hasTargetLang: !!conceptData.expressions?.[mappedTargetLang]?.word,
          userLangWord:
            conceptData.expressions?.[mappedUserLang]?.word || "없음",
          targetLangWord:
            conceptData.expressions?.[mappedTargetLang]?.word || "없음",
          conceptInfo: conceptData.concept_info || "없음",
        });

        if (
          conceptData.expressions?.[mappedUserLang]?.word &&
          conceptData.expressions?.[mappedTargetLang]?.word
        ) {
          concepts.push({
            id: doc.id,
            conceptInfo: conceptData.concept_info,
            expressions: {
              [mappedUserLang]: conceptData.expressions[mappedUserLang],
              [mappedTargetLang]: conceptData.expressions[mappedTargetLang],
            },
            media: conceptData.media,
            gameMetadata: {
              difficulty: conceptData.concept_info?.difficulty || "basic",
              domain: conceptData.concept_info?.domain || "general",
              category: conceptData.concept_info?.category || "common",
            },
          });

          console.log(`개념 ${doc.id} 추가됨`);

          // limit 적용
          if (concepts.length >= limit) {
            break;
          }
        } else {
          console.log(`개념 ${doc.id} 제외됨 - 필요한 언어 누락`);
        }
      }

      console.log(`최종 게임용 개념 수: ${concepts.length}`);

      // 선택된 개념들의 세부 정보 출력
      if (concepts.length > 0) {
        console.log(
          "선택된 개념들:",
          concepts.map((c) => ({
            id: c.id,
            userWord: c.expressions[mappedUserLang]?.word,
            targetWord: c.expressions[mappedTargetLang]?.word,
            domain: c.conceptInfo?.domain,
            difficulty: c.conceptInfo?.difficulty,
          }))
        );
      }

      return concepts;
    } catch (error) {
      console.error("게임용 개념 조회 중 오류:", error);
      throw error;
    }
  }

  // === 헬퍼 메서드들 ===

  generateConceptId(conceptData) {
    const primaryWord =
      conceptData.expressions?.korean?.word ||
      conceptData.expressions?.english?.word ||
      Object.values(conceptData.expressions)?.[0]?.word ||
      "unknown";

    const safeWord = primaryWord.replace(/[^a-zA-Z0-9가-힣]/g, "_");
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);

    return `concept_${safeWord}_${timestamp}_${random}`;
  }

  extractAllWords(expressions) {
    if (!expressions || typeof expressions !== "object") {
      console.warn("expressions가 유효하지 않습니다:", expressions);
      return [];
    }

    return Object.values(expressions)
      .map((expr) => expr?.word)
      .filter(Boolean);
  }

  extractGrammarPatternCount(integratedData) {
    const examples = integratedData.core_examples || [];
    const patterns = new Set(
      examples.map((ex) => ex.grammar_pattern_id).filter(Boolean)
    );
    return patterns.size;
  }

  calculateQuizTemplateCount(integratedData) {
    // 기본 4개 퀴즈 타입
    return 4;
  }

  generateGrammarPatternDoc(patternId, conceptId, example, integratedData) {
    return {
      pattern_id: patternId,
      pattern_name: this.inferPatternName(patternId),
      domain: integratedData.concept_info.domain,
      category: integratedData.concept_info.category,

      // 패턴 정보
      pattern_info: {
        structural_pattern: this.inferStructuralPattern(patternId),
        complexity_level: example.difficulty || "beginner",
        usage_frequency: "medium",
      },

      // 예문 참조
      example_references: [example.example_id || `${conceptId}_example_1`],

      // 학습 메타데이터
      learning_metadata: {
        difficulty_score: this.calculatePatternDifficulty(example),
        practice_priority: example.priority || 1,
        quiz_eligible: true,
      },

      created_at: serverTimestamp(),
    };
  }

  generateGrammarPatternFromSystem(
    patternId,
    conceptId,
    grammarSystem,
    integratedData
  ) {
    return {
      pattern_id: patternId,
      pattern_name: grammarSystem.pattern_name,
      domain: integratedData.concept_info?.domain || "general",
      category: integratedData.concept_info?.category || "common",

      // 패턴 정보 (grammar_system에서 상세 정보 추출)
      pattern_info: {
        structural_pattern:
          grammarSystem.structural_pattern || "기본 문장 구조",
        complexity_level: grammarSystem.complexity_level || "basic_sentence",
        usage_frequency: "medium",
        grammar_tags: grammarSystem.grammar_tags || [],
        learning_focus: grammarSystem.learning_focus || [],
      },

      // 언어별 문법 특징
      grammatical_features: grammarSystem.grammatical_features || {},

      // 난이도 요소
      difficulty_factors: grammarSystem.difficulty_factors || {
        vocabulary: 15,
        grammar_complexity: 20,
        cultural_context: 10,
        pronunciation: 15,
      },

      related_languages: ["korean", "english", "japanese", "chinese"],

      // 학습 메타데이터
      learning_metadata: {
        difficulty_score: this.calculateDifficultyFromFactors(
          grammarSystem.difficulty_factors
        ),
        practice_priority: 1,
        quiz_eligible: true,
      },

      created_at: serverTimestamp(),
    };
  }

  generateQuizSettings(quizType, integratedData) {
    const baseSettings = {
      time_limit: 30,
      max_attempts: 3,
      hint_enabled: true,
      audio_enabled: true,
    };

    const typeSpecificSettings = {
      translation: {
        ...baseSettings,
        show_romanization: true,
        allow_partial_match: false,
      },
      pronunciation: {
        ...baseSettings,
        time_limit: 60,
        audio_required: true,
        show_phonetic: true,
      },
      matching: {
        ...baseSettings,
        time_limit: 45,
        card_count: 8,
        show_hints_after: 10,
      },
      fill_in_blank: {
        ...baseSettings,
        show_word_bank: true,
        case_sensitive: false,
      },
    };

    return typeSpecificSettings[quizType] || baseSettings;
  }

  generateQuestionTemplates(quizType) {
    // 반복되는 질문을 최소화하기 위한 템플릿 시스템
    const templates = {
      translation: {
        korean_to_target:
          "다음 한국어를 {target_language}로 번역하세요: '{source_word}'",
        target_to_korean:
          "다음 {source_language}를 한국어로 번역하세요: '{source_word}'",
        with_context:
          "'{context}' 상황에서 '{source_word}'를 {target_language}로 번역하세요",
      },
      pronunciation: {
        how_to_pronounce: "'{word}'의 올바른 발음은?",
        listen_and_type: "듣고 따라 말해보세요",
        romanization_match: "'{word}'의 로마자 표기는?",
      },
      matching: {
        word_pairs: "다음 단어들을 올바르게 연결하세요",
        meaning_match: "단어와 의미를 연결하세요",
        example_match: "단어와 예문을 연결하세요",
      },
      fill_in_blank: {
        complete_sentence: "다음 문장을 완성하세요: '{sentence_with_blank}'",
        choose_correct: "빈칸에 들어갈 올바른 단어를 선택하세요",
        context_fill: "문맥에 맞는 단어를 넣으세요",
      },
    };

    return templates[quizType] || {};
  }

  async getRepresentativeExample(conceptId, userLanguage, targetLanguage) {
    try {
      const exampleQuery = query(
        collection(db, "examples"),
        where("concept_id", "==", conceptId),
        where("learning_metadata.quiz_eligible", "==", true),
        limit(5)
      );

      const exampleSnapshot = await getDocs(exampleQuery);

      if (!exampleSnapshot.empty) {
        // JavaScript로 priority 정렬
        const examples = exampleSnapshot.docs
          .map((doc) => doc.data())
          .sort((a, b) => (b.priority || 0) - (a.priority || 0));

        const exampleData = examples[0];
        return {
          from: exampleData.translations?.[userLanguage]?.text || "",
          to: exampleData.translations?.[targetLanguage]?.text || "",
        };
      }

      return null;
    } catch (error) {
      console.warn("대표 예문 조회 중 오류:", error);
      return null;
    }
  }

  inferPatternName(patternId) {
    const parts = patternId.split("_");
    if (parts.length >= 4) {
      return parts.slice(3).join(" ");
    }
    return "기본 패턴";
  }

  inferStructuralPattern(patternId) {
    if (patternId.includes("greeting")) return "인사 + 후속 표현";
    if (patternId.includes("food")) return "[대상] + 을/를 + 동사";
    if (patternId.includes("time")) return "시간부사 + 주어 + 동사";
    return "기본 문장 구조";
  }

  calculatePatternDifficulty(example) {
    let score = 15; // 기본 점수

    if (example.difficulty === "advanced") score += 25;
    else if (example.difficulty === "intermediate") score += 15;

    if (example.context !== "general") score += 10;

    return Math.min(score, 50);
  }

  calculateDifficultyFromFactors(factors) {
    // null, undefined 체크 추가
    if (!factors || typeof factors !== "object") {
      console.warn("difficulty_factors가 유효하지 않음:", factors);
      return 15; // 기본 난이도 점수
    }

    const factorKeys = Object.keys(factors);
    if (factorKeys.length === 0) {
      console.warn("difficulty_factors가 비어있음:", factors);
      return 15; // 기본 난이도 점수
    }

    let difficultyScore = 0;
    for (const factor in factors) {
      const value = factors[factor];
      if (typeof value === "number" && !isNaN(value)) {
        difficultyScore += value;
      }
    }
    return difficultyScore / factorKeys.length;
  }

  /**
   * 다국어 학습용 문법 패턴 가져오기 (인덱스 없이 작동)
   */
  async getGrammarPatternsForLearning(
    targetLanguage,
    difficulty = null,
    limitCount = 20
  ) {
    try {
      // 복합 인덱스 없이 단순 쿼리 사용
      const grammarQuery = query(collection(db, "grammar"), limit(limitCount));

      const snapshot = await getDocs(grammarQuery);
      const patterns = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // JavaScript로 필터링 (임시)
      let filteredPatterns = patterns;

      if (difficulty && difficulty !== "all") {
        filteredPatterns = patterns.filter(
          (pattern) =>
            pattern.difficulty === difficulty ||
            pattern.complexity_level === difficulty ||
            pattern.pattern_info?.complexity_level === difficulty
        );
      }

      console.log(
        `문법 패턴 ${filteredPatterns.length}개 로드됨 (전체: ${patterns.length}개)`
      );
      return filteredPatterns;
    } catch (error) {
      console.error("문법 패턴 로드 오류:", error);
      // Fallback으로 기본 문법 패턴 반환
      return this.getDefaultGrammarPatterns();
    }
  }

  /**
   * 독해 학습용 지문 가져오기 (인덱스 없이 작동)
   */
  async getReadingPassagesForLearning(
    targetLanguage,
    difficulty = null,
    limitCount = 10
  ) {
    try {
      // 복합 인덱스 없이 단순 쿼리 사용
      const readingQuery = query(
        collection(db, "examples"),
        limit(limitCount * 3) // 필터링을 위해 더 많이 가져오기
      );

      const snapshot = await getDocs(readingQuery);
      const examples = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // JavaScript로 독해용 예문 필터링
      let readingPassages = examples.filter((example) => {
        const text =
          example.translations?.[targetLanguage]?.text ||
          example.translations?.korean?.text ||
          "";
        return text.length > 30; // 최소 길이 조건
      });

      if (difficulty && difficulty !== "all") {
        readingPassages = readingPassages.filter(
          (passage) => passage.difficulty === difficulty
        );
      }

      // 독해 지문 형식으로 변환
      const passages = readingPassages.slice(0, limitCount).map((example) => ({
        id: example.id,
        category: example.context || "일반",
        text: example.translations?.[targetLanguage]?.text || "",
        sourceText: example.translations?.korean?.text || "",
        difficulty: example.difficulty || "beginner",
        vocabulary: this.extractVocabularyFromText(
          example.translations?.[targetLanguage]?.text || ""
        ),
        questions: this.generateReadingQuestions(
          example.translations?.[targetLanguage]?.text || ""
        ),
      }));

      console.log(`독해 지문 ${passages.length}개 로드됨`);
      return passages;
    } catch (error) {
      console.error("독해 지문 로드 오류:", error);
      // Fallback으로 기본 독해 지문 반환
      return this.getDefaultReadingPassages();
    }
  }

  /**
   * 듣기 학습용 콘텐츠 가져오기 (인덱스 없이 작동)
   */
  async getListeningContentForLearning(
    targetLanguage,
    difficulty = null,
    limitCount = 10
  ) {
    try {
      // 복합 인덱스 없이 단순 쿼리 사용
      const listeningQuery = query(
        collection(db, "examples"),
        limit(limitCount * 2)
      );

      const snapshot = await getDocs(listeningQuery);
      const examples = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // JavaScript로 듣기 콘텐츠 필터링 (오디오 없이도 가능)
      let listeningContent = examples.filter((example) => {
        const text =
          example.translations?.[targetLanguage]?.text ||
          example.translations?.korean?.text ||
          "";
        return text.length > 10 && text.length < 200; // 적절한 길이
      });

      if (difficulty && difficulty !== "all") {
        listeningContent = listeningContent.filter(
          (content) => content.difficulty === difficulty
        );
      }

      // 듣기 콘텐츠 형식으로 변환
      const contents = listeningContent.slice(0, limitCount).map((example) => ({
        id: example.id,
        category: example.context || "일반 대화",
        audioUrl: example.audio_url || null, // 오디오가 없어도 괜찮음
        transcript: example.translations?.[targetLanguage]?.text || "",
        sourceTranscript: example.translations?.korean?.text || "",
        difficulty: example.difficulty || "beginner",
        question: `다음 내용에 대한 질문입니다.`,
        options: this.generateListeningOptions(
          example.translations?.[targetLanguage]?.text || ""
        ),
      }));

      console.log(`듣기 콘텐츠 ${contents.length}개 로드됨`);
      return contents;
    } catch (error) {
      console.error("듣기 콘텐츠 로드 오류:", error);
      // Fallback으로 기본 듣기 콘텐츠 반환
      return this.getDefaultListeningContent();
    }
  }

  // 기본 데이터 제공 함수들
  getDefaultGrammarPatterns() {
    return [
      {
        id: "default_korean_basic",
        pattern_name: "기본 문장 구조",
        pattern_info: {
          structural_pattern: "주어 + 목적어 + 동사",
          complexity_level: "beginner",
        },
        grammatical_features: {
          korean: {
            sentence_type: "서술문",
            speech_level: "해요체",
            key_grammar_points: ["어순", "조사", "어미"],
          },
        },
        teaching_notes: {
          primary_focus: "기본 문장 구조 익히기",
          practice_suggestions: ["단어 순서 연습", "조사 활용 연습"],
        },
      },
    ];
  }

  getDefaultReadingPassages() {
    return [
      {
        id: "default_reading_1",
        category: "일상",
        text: "기본 독해 지문입니다.",
        sourceText: "기본 독해 지문입니다.",
        difficulty: "beginner",
        vocabulary: [{ word: "기본", meaning: "basic" }],
        questions: [
          {
            type: "multiple_choice",
            question: "이 지문의 주제는?",
            options: ["일상", "학습", "문법", "독해"],
            correct: 0,
          },
        ],
      },
    ];
  }

  getDefaultListeningContent() {
    return [
      {
        id: "default_listening_1",
        category: "인사",
        audioUrl: null,
        transcript: "안녕하세요. 만나서 반갑습니다.",
        sourceTranscript: "안녕하세요. 만나서 반갑습니다.",
        difficulty: "beginner",
        question: "들은 내용에 대한 질문입니다.",
        options: ["인사", "작별", "감사", "사과"],
      },
    ];
  }

  hasGrammarSystemInExamples(integratedData) {
    if (
      integratedData.core_examples &&
      integratedData.core_examples.length > 0 &&
      integratedData.core_examples[0].grammar_system
    ) {
      return true;
    }
    if (
      integratedData.featured_examples &&
      integratedData.featured_examples.length > 0 &&
      integratedData.featured_examples[0].grammar_system
    ) {
      return true;
    }
    return false;
  }

  /**
   * 텍스트에서 주요 어휘 추출
   */
  extractVocabularyFromText(text) {
    // 간단한 어휘 추출 로직 (향후 확장 가능)
    const words = text.split(/\s+/).filter((word) => word.length > 2);
    const vocabulary = [];

    for (let i = 0; i < Math.min(words.length, 5); i++) {
      vocabulary.push({
        word: words[i],
        meaning: `${words[i]}의 의미`, // 실제로는 사전 API 또는 개념 데이터베이스에서 가져와야 함
      });
    }

    return vocabulary;
  }

  /**
   * 독해 문제 생성
   */
  generateReadingQuestions(text) {
    // 기본 독해 문제 생성 로직
    return [
      {
        type: "multiple_choice",
        question: "이 지문의 주요 내용은?",
        options: ["옵션 A", "옵션 B", "옵션 C", "옵션 D"],
        correct: 0,
      },
    ];
  }

  /**
   * 듣기 문제 선택지 생성
   */
  generateListeningOptions(transcript) {
    // 기본 듣기 문제 선택지 생성
    return [
      transcript, // 정답
      "오답 1",
      "오답 2",
      "오답 3",
    ].sort(() => Math.random() - 0.5);
  }

  /**
   * 개별 개념 생성 (분리된 업로드용)
   */
  async createConcept(conceptData) {
    try {
      const conceptRef = doc(collection(db, "concepts"));
      const conceptId = conceptRef.id;

      const conceptDoc = {
        concept_id: conceptId,
        concept_info: conceptData.concept_info || {
          domain: conceptData.domain || "general",
          category: conceptData.category || "uncategorized",
          difficulty: conceptData.difficulty || "beginner",
          tags: conceptData.tags || [],
        },
        expressions: conceptData.expressions || {},
        representative_example: conceptData.representative_example || null,
        metadata: {
          created_at: serverTimestamp(),
          created_from: "separated_import",
          version: "3.0",
        },
      };

      await setDoc(conceptRef, conceptDoc);
      console.log(`✓ 개념 생성 완료: ${conceptId}`);
      return conceptId;
    } catch (error) {
      console.error("개념 생성 오류:", error);
      throw error;
    }
  }

  /**
   * 개별 예문 생성 (분리된 업로드용)
   */
  async createExample(exampleData) {
    try {
      const exampleRef = doc(collection(db, "examples"));
      const exampleId = exampleRef.id;

      const exampleDoc = {
        example_id: exampleData.example_id || exampleId,
        concept_id: exampleData.concept_id || null,
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
        created_at: serverTimestamp(),
      };

      await setDoc(exampleRef, exampleDoc);
      console.log(`✓ 예문 생성 완료: ${exampleId}`);
      return exampleId;
    } catch (error) {
      console.error("예문 생성 오류:", error);
      throw error;
    }
  }

  /**
   * 개별 문법 패턴 생성 (분리된 업로드용)
   */
  async createGrammarPattern(patternData) {
    try {
      const patternRef = doc(collection(db, "grammar"));
      const patternId = patternRef.id;

      const patternDoc = {
        pattern_id: patternData.pattern_id || patternId,
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
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      };

      await setDoc(patternRef, patternDoc);
      console.log(`✓ 문법 패턴 생성 완료: ${patternId}`);
      return patternId;
    } catch (error) {
      console.error("문법 패턴 생성 오류:", error);
      throw error;
    }
  }

  /**
   * 태그 기반 개념 검색
   */
  async getConceptsByTags(tags, limit = 20) {
    try {
      const conceptsRef = collection(db, "concepts");
      const q = query(conceptsRef, limit(limit));
      const snapshot = await getDocs(q);

      const concepts = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        const conceptTags = data.concept_info?.tags || [];

        // 태그 매칭 확인
        const hasMatchingTag = tags.some((tag) => conceptTags.includes(tag));
        if (hasMatchingTag) {
          concepts.push({ id: doc.id, ...data });
        }
      });

      return concepts;
    } catch (error) {
      console.error("태그 기반 개념 검색 오류:", error);
      return [];
    }
  }

  /**
   * 태그 기반 예문 검색
   */
  async getExamplesByTags(tags, limit = 20) {
    try {
      const examplesRef = collection(db, "examples");
      const q = query(examplesRef, limit(limit));
      const snapshot = await getDocs(q);

      const examples = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        const exampleTags = data.tags || [];

        // 태그 매칭 확인
        const hasMatchingTag = tags.some((tag) => exampleTags.includes(tag));
        if (hasMatchingTag) {
          examples.push({ id: doc.id, ...data });
        }
      });

      return examples;
    } catch (error) {
      console.error("태그 기반 예문 검색 오류:", error);
      return [];
    }
  }

  /**
   * 태그 기반 문법 패턴 검색
   */
  async getGrammarPatternsByTags(tags, limit = 20) {
    try {
      const patternsRef = collection(db, "grammar");
      const q = query(patternsRef, limit(limit));
      const snapshot = await getDocs(q);

      const patterns = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        const patternTags = data.tags || [];

        // 태그 매칭 확인
        const hasMatchingTag = tags.some((tag) => patternTags.includes(tag));
        if (hasMatchingTag) {
          patterns.push({ id: doc.id, ...data });
        }
      });

      return patterns;
    } catch (error) {
      console.error("태그 기반 문법 패턴 검색 오류:", error);
      return [];
    }
  }

  /**
   * 컬렉션별 데이터 조회 함수들
   */
  async getConceptsOnly(limit = 50) {
    try {
      const conceptsRef = collection(db, "concepts");
      const q = query(conceptsRef, limit(limit));
      const snapshot = await getDocs(q);

      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("개념 조회 오류:", error);
      return [];
    }
  }

  async getExamplesOnly(limit = 50) {
    try {
      const examplesRef = collection(db, "examples");
      const q = query(examplesRef, limit(limit));
      const snapshot = await getDocs(q);

      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("예문 조회 오류:", error);
      return [];
    }
  }

  async getGrammarPatternsOnly(limit = 50) {
    try {
      const patternsRef = collection(db, "grammar");
      const q = query(patternsRef, limit(limit));
      const snapshot = await getDocs(q);

      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("문법 패턴 조회 오류:", error);
      return [];
    }
  }
}

// 싱글톤 인스턴스
export const collectionManager = new CollectionManager();
