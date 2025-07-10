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
  addDoc,
  FieldPath,
  documentId,
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

/**
 * 분리된 컬렉션 관리 시스템
 * - concepts: 핵심 개념 정보
 * - examples: 예문 정보
 * - grammar: 문법 패턴 정보
 * - quiz_templates: 퀴즈 템플릿 정보
 * - user_records: 사용자 학습 진도
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
        const exampleRef = doc(collection(db, "examples"));
        const exampleId = exampleRef.id;

        const exampleDoc = {
          // example_id 속성 제거 - Firestore 자동 부여 ID만 사용
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

      // 6. 사용자 진도 초기화 (user_records 컬렉션)
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
    // 대표 예문 선택 (카드 표시용)
    const representativeExample = this.selectRepresentativeExample(
      integratedData.core_examples,
      integratedData.additional_examples
    );

    return {
      // concept_id 중복 제거 - Firestore document ID 사용
      concept_info: {
        // concept_id 제거: document ID와 중복
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

      // 생성 시간만 포함 (created_at 속성으로 통일)
      created_at: serverTimestamp(),
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
      const progressRef = doc(db, "user_records", progressId);

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
  async getConceptsForGame(
    gameType,
    difficulty,
    languagePair,
    limitCount = 10
  ) {
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

      // 🎲 진정한 랜덤 조회를 위한 새로운 방식
      // 여러 개의 작은 랜덤 쿼리로 분산하여 더 나은 랜덤성과 비용 효율성 확보
      const concepts = await this.getRandomConceptsOptimized(
        mappedUserLang,
        mappedTargetLang,
        difficulty,
        limitCount
      );

      console.log(`🔍 수집된 모든 유효한 개념 수: ${concepts.length}`);
      console.log(
        `✅ 최종 선택된 게임용 개념 수: ${concepts.length} (최적화된 랜덤 조회)`
      );

      // 선택된 개념들의 세부 정보 출력
      if (concepts.length > 0) {
        console.log(
          "🎯 무작위 선택된 개념들:",
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

  // 🎲 최적화된 랜덤 개념 조회 메서드 (randomField 활용)
  async getRandomConceptsOptimized(
    mappedUserLang,
    mappedTargetLang,
    difficulty,
    limitCount
  ) {
    console.log("🎲 randomField를 활용한 게임용 랜덤 조회 시작...");

    try {
      console.log("🚀 randomField를 활용한 효율적인 조회...");
      const concepts = [];
      const maxAttempts = 3;
      let attempt = 0;

      while (concepts.length < limitCount && attempt < maxAttempts) {
        attempt++;
        const randomValue = Math.random();

        console.log(
          `🎲 시도 ${attempt}: randomField >= ${randomValue.toFixed(6)}`
        );

        // randomField 기반 쿼리 구성
        let conceptsQuery = query(
          collection(db, "concepts"),
          where("randomField", ">=", randomValue),
          limit(limitCount * 2)
        );

        // 난이도 조건 추가
        if (difficulty && difficulty !== "all" && difficulty !== "basic") {
          conceptsQuery = query(
            collection(db, "concepts"),
            where("randomField", ">=", randomValue),
            where("concept_info.difficulty", "==", difficulty),
            limit(limitCount * 2)
          );
        }

        const snapshot = await getDocs(conceptsQuery);
        console.log(`📊 첫 번째 쿼리로 ${snapshot.size}개 문서 조회`);

        // 부족하면 반대 방향으로 조회
        if (snapshot.size < limitCount && randomValue > 0.1) {
          const reverseQuery = query(
            collection(db, "concepts"),
            where("randomField", "<", randomValue),
            orderBy("randomField", "desc"),
            limit(limitCount * 2)
          );

          const reverseSnapshot = await getDocs(reverseQuery);
          console.log(
            `📊 역방향 쿼리로 추가 ${reverseSnapshot.size}개 문서 조회`
          );

          reverseSnapshot.forEach((doc) => snapshot.docs.push(doc));
        }

        // 유효한 개념 필터링 및 추가
        snapshot.forEach((doc) => {
          const data = doc.data();
          if (
            data.expressions?.[mappedUserLang] &&
            data.expressions?.[mappedTargetLang] &&
            !concepts.find((c) => c.id === doc.id)
          ) {
            concepts.push({
              id: doc.id,
              conceptInfo: data.concept_info || {
                domain: data.domain || "general",
                category: data.category || "common",
                difficulty: data.concept_info?.difficulty || "basic",
                unicode_emoji: data.emoji || "📚",
              },
              expressions: {
                [mappedUserLang]: data.expressions[mappedUserLang],
                [mappedTargetLang]: data.expressions[mappedTargetLang],
              },
              media: data.media,
              gameMetadata: {
                difficulty: data.concept_info?.difficulty || "basic",
                domain: data.concept_info?.domain || "general",
                category: data.concept_info?.category || "common",
              },
            });
          }
        });

        console.log(`🎯 시도 ${attempt} 결과: 총 ${concepts.length}개 수집`);
        if (concepts.length >= limitCount) break;
      }

      // Fisher-Yates 알고리즘으로 무작위 섞기
      for (let i = concepts.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [concepts[i], concepts[j]] = [concepts[j], concepts[i]];
      }

      return concepts.slice(0, limitCount);
    } catch (error) {
      console.error("❌ randomField 기반 조회 실패:", error);
      console.log("🔄 기존 방식으로 폴백...");
      return await this.getFallbackConcepts(
        mappedUserLang,
        mappedTargetLang,
        difficulty,
        limitCount
      );
    }
  }

  // 🎲 랜덤 배치 조회
  async getRandomConceptsBatch(
    mappedUserLang,
    mappedTargetLang,
    difficulty,
    needed
  ) {
    // 여러 랜덤 접근 방식을 조합
    const strategies = [
      () =>
        this.getConceptsWithRandomStart(
          mappedUserLang,
          mappedTargetLang,
          difficulty,
          needed
        ),
      () =>
        this.getConceptsWithRandomOrder(
          mappedUserLang,
          mappedTargetLang,
          difficulty,
          needed
        ),
    ];

    // 랜덤하게 전략 선택
    const strategy = strategies[Math.floor(Math.random() * strategies.length)];
    return await strategy();
  }

  // 🎲 랜덤 시작점을 사용한 조회
  async getConceptsWithRandomStart(
    mappedUserLang,
    mappedTargetLang,
    difficulty,
    needed
  ) {
    // 랜덤 문서 ID 기반 시작점 설정
    const randomId = this.generateRandomDocumentId();

    let conceptsQuery = query(
      collection(db, "concepts"),
      where(documentId(), ">=", randomId),
      limit(needed * 2) // 여유있게 조회
    );

    // 난이도 조건 추가
    if (difficulty && difficulty !== "all" && difficulty !== "basic") {
      conceptsQuery = query(
        collection(db, "concepts"),
        where("concept_info.difficulty", "==", difficulty),
        where(documentId(), ">=", randomId),
        limit(needed * 2)
      );
    }

    return await this.executeConceptQuery(
      conceptsQuery,
      mappedUserLang,
      mappedTargetLang,
      needed
    );
  }

  // 🎲 랜덤 정렬 기반 조회
  async getConceptsWithRandomOrder(
    mappedUserLang,
    mappedTargetLang,
    difficulty,
    needed
  ) {
    // 다른 시작점에서 조회
    let conceptsQuery = query(
      collection(db, "concepts"),
      limit(needed * 3) // 더 여유있게 조회해서 선택권 확보
    );

    if (difficulty && difficulty !== "all" && difficulty !== "basic") {
      conceptsQuery = query(
        collection(db, "concepts"),
        where("concept_info.difficulty", "==", difficulty),
        limit(needed * 3)
      );
    }

    const concepts = await this.executeConceptQuery(
      conceptsQuery,
      mappedUserLang,
      mappedTargetLang,
      needed * 3
    );

    // Fisher-Yates 셔플로 랜덤 선택
    const shuffled = [...concepts];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled.slice(0, needed);
  }

  // 🎲 랜덤 문서 ID 생성
  generateRandomDocumentId() {
    // Firestore 문서 ID 패턴을 따른 랜덤 문자열 생성
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < 20; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // 🔄 쿼리 실행 및 개념 변환
  async executeConceptQuery(
    conceptsQuery,
    mappedUserLang,
    mappedTargetLang,
    maxResults
  ) {
    const conceptsSnapshot = await getDocs(conceptsQuery);
    const concepts = [];

    for (const doc of conceptsSnapshot.docs) {
      if (concepts.length >= maxResults) break;

      const conceptData = doc.data();

      // 언어 필터링: 요청된 언어 쌍이 모두 있는지 확인
      if (
        conceptData.expressions?.[mappedUserLang]?.word &&
        conceptData.expressions?.[mappedTargetLang]?.word
      ) {
        concepts.push({
          id: doc.id,
          concept_info: conceptData.concept_info, // 통일된 필드명
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
      }
    }

    return concepts;
  }

  // 🔄 폴백 개념 조회 (기존 방식)
  async getFallbackConcepts(
    mappedUserLang,
    mappedTargetLang,
    difficulty,
    needed,
    excludeIds = []
  ) {
    let conceptsQuery = query(collection(db, "concepts"), limit(50));

    if (difficulty && difficulty !== "all" && difficulty !== "basic") {
      conceptsQuery = query(
        collection(db, "concepts"),
        where("concept_info.difficulty", "==", difficulty),
        limit(50)
      );
    }

    const conceptsSnapshot = await getDocs(conceptsQuery);
    const concepts = [];

    for (const doc of conceptsSnapshot.docs) {
      if (excludeIds.includes(doc.id)) continue; // 이미 선택된 것 제외

      const conceptData = doc.data();

      if (
        conceptData.expressions?.[mappedUserLang]?.word &&
        conceptData.expressions?.[mappedTargetLang]?.word
      ) {
        concepts.push({
          id: doc.id,
          concept_info: conceptData.concept_info, // 통일된 필드명
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

        if (concepts.length >= needed) break;
      }
    }

    // 셔플 후 필요한 만큼만 반환
    const shuffled = [...concepts];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled.slice(0, needed);
  }

  // === 헬퍼 메서드들 ===

  selectRepresentativeExample(coreExamples, additionalExamples) {
    // 대표 예문 선택 (우선순위: core_examples[0] > additional_examples[0])
    if (coreExamples && coreExamples.length > 0) {
      return coreExamples[0];
    } else if (additionalExamples && additionalExamples.length > 0) {
      return additionalExamples[0];
    }
    return null;
  }

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
   * 상황과 목적 기반 개념 검색
   */
  async getConceptsBySituationAndPurpose(
    situations,
    purposes,
    limitCount = 20
  ) {
    try {
      const conceptsRef = collection(db, "concepts");
      const q = query(conceptsRef, limit(limitCount));
      const snapshot = await getDocs(q);

      const concepts = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        const conceptSituations = data.concept_info?.situation || [];
        const conceptPurpose = data.concept_info?.purpose || "";

        // 상황 또는 목적 매칭 확인
        const hasSituationMatch =
          situations.length === 0 ||
          situations.some((situation) => conceptSituations.includes(situation));
        const hasPurposeMatch =
          purposes.length === 0 || purposes.includes(conceptPurpose);

        if (hasSituationMatch && hasPurposeMatch) {
          concepts.push({ id: doc.id, ...data });
        }
      });

      return concepts;
    } catch (error) {
      console.error("상황/목적 기반 개념 검색 오류:", error);
      return [];
    }
  }

  /**
   * 컬렉션별 데이터 조회 함수들
   */
  async getConceptsOnly(limitCount = 50) {
    try {
      console.log("🔍 concepts 컬렉션 조회 시작 (randomField 활용)");

      let concepts = [];

      console.log("🎲 randomField를 활용한 효율적인 조회...");

      // randomField 기반 랜덤 조회
      const randomValue = Math.random();
      console.log(`🎲 randomField >= ${randomValue.toFixed(6)}로 조회`);

      let conceptsQuery = query(
        collection(db, "concepts"),
        where("randomField", ">=", randomValue),
        limit(limitCount)
      );

      let snapshot = await getDocs(conceptsQuery);
      console.log(`📊 첫 번째 쿼리로 ${snapshot.size}개 문서 조회`);

      // 부족하면 반대 방향으로 추가 조회
      if (snapshot.size < limitCount && randomValue > 0.1) {
        const reverseQuery = query(
          collection(db, "concepts"),
          where("randomField", "<", randomValue),
          orderBy("randomField", "desc"),
          limit(limitCount - snapshot.size)
        );

        const reverseSnapshot = await getDocs(reverseQuery);
        console.log(
          `📊 역방향 쿼리로 추가 ${reverseSnapshot.size}개 문서 조회`
        );

        // 두 결과를 합치기
        const allDocs = [...snapshot.docs, ...reverseSnapshot.docs];
        concepts = allDocs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
      } else {
        concepts = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
      }

      // Fisher-Yates 알고리즘으로 무작위 섞기
      for (let i = concepts.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [concepts[i], concepts[j]] = [concepts[j], concepts[i]];
      }

      console.log(`📊 조회된 개념 수: ${concepts.length}`);

      // 첫 번째 개념의 구조 로깅
      if (concepts.length > 0) {
        const sample = concepts[0];
        console.log("📋 샘플 개념 구조:", {
          id: sample.id,
          has_expressions: !!sample.expressions,
          expressions_keys: sample.expressions
            ? Object.keys(sample.expressions)
            : [],
          has_concept_info: !!sample.concept_info,
          concept_info: sample.concept_info,
          sample_korean: sample.expressions?.korean,
          sample_english: sample.expressions?.english,
          all_fields: Object.keys(sample),
        });
      }

      return concepts;
    } catch (error) {
      console.error("❌ 개념 조회 오류:", error);
      return [];
    }
  }

  async getExamplesOnly(limitCount = 50) {
    try {
      console.log("🔍 examples 컬렉션 조회 시작 (randomField 활용)");

      let examples = [];

      console.log("🎲 randomField를 활용한 효율적인 조회...");

      // randomField 기반 랜덤 조회
      const randomValue = Math.random();
      console.log(`🎲 randomField >= ${randomValue.toFixed(6)}로 조회`);

      let examplesQuery = query(
        collection(db, "examples"),
        where("randomField", ">=", randomValue),
        limit(limitCount)
      );

      let snapshot = await getDocs(examplesQuery);
      console.log(`📊 첫 번째 쿼리로 ${snapshot.size}개 문서 조회`);

      // 부족하면 반대 방향으로 추가 조회
      if (snapshot.size < limitCount && randomValue > 0.1) {
        const reverseQuery = query(
          collection(db, "examples"),
          where("randomField", "<", randomValue),
          orderBy("randomField", "desc"),
          limit(limitCount - snapshot.size)
        );

        const reverseSnapshot = await getDocs(reverseQuery);
        console.log(
          `📊 역방향 쿼리로 추가 ${reverseSnapshot.size}개 문서 조회`
        );

        // 두 결과를 합치기
        const allDocs = [...snapshot.docs, ...reverseSnapshot.docs];
        examples = allDocs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
      } else {
        examples = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
      }

      // Fisher-Yates 알고리즘으로 무작위 섞기
      for (let i = examples.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [examples[i], examples[j]] = [examples[j], examples[i]];
      }

      console.log(`📊 조회된 예문 수: ${examples.length}`);
      return examples;
    } catch (error) {
      console.error("예문 조회 오류:", error);
      return [];
    }
  }

  async getGrammarPatternsOnly(limitCount = 50) {
    try {
      console.log("🔍 grammar 컬렉션 조회 시작 (randomField 활용)");

      let patterns = [];

      console.log("🎲 randomField를 활용한 효율적인 조회...");

      // randomField 기반 랜덤 조회
      const randomValue = Math.random();
      console.log(`🎲 randomField >= ${randomValue.toFixed(6)}로 조회`);

      let patternsQuery = query(
        collection(db, "grammar"),
        where("randomField", ">=", randomValue),
        limit(limitCount)
      );

      let snapshot = await getDocs(patternsQuery);
      console.log(`📊 첫 번째 쿼리로 ${snapshot.size}개 문서 조회`);

      // 부족하면 반대 방향으로 추가 조회
      if (snapshot.size < limitCount && randomValue > 0.1) {
        const reverseQuery = query(
          collection(db, "grammar"),
          where("randomField", "<", randomValue),
          orderBy("randomField", "desc"),
          limit(limitCount - snapshot.size)
        );

        const reverseSnapshot = await getDocs(reverseQuery);
        console.log(
          `📊 역방향 쿼리로 추가 ${reverseSnapshot.size}개 문서 조회`
        );

        // 두 결과를 합치기
        const allDocs = [...snapshot.docs, ...reverseSnapshot.docs];
        patterns = allDocs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
      } else {
        patterns = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
      }

      // Fisher-Yates 알고리즘으로 무작위 섞기
      for (let i = patterns.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [patterns[i], patterns[j]] = [patterns[j], patterns[i]];
      }

      console.log(`📊 조회된 문법 패턴 수: ${patterns.length}`);
      return patterns;
    } catch (error) {
      console.error("문법 패턴 조회 오류:", error);
      return [];
    }
  }

  /**
   * 개별 개념 생성 (분리된 업로드용)
   */
  async createConcept(conceptData) {
    try {
      console.log("🎲 createConcept 함수 호출됨 - randomField 자동 추가 버전");

      const conceptRef = doc(collection(db, "concepts"));
      const conceptId = conceptRef.id;

      // 🎲 randomField 자동 추가 (0~1 사이의 실수)
      const randomField = Math.random();
      console.log("🎲 randomField 값:", randomField);

      const conceptDoc = {
        ...conceptData,
        randomField: randomField, // 🎲 효율적인 랜덤 쿼리를 위한 필드
        created_at: serverTimestamp(),
      };

      // 예문이 있는 경우에만 추가
      if (conceptData.examples && conceptData.examples.length > 0) {
        conceptDoc.examples = conceptData.examples;
      }

      console.log("💾 Firebase에 저장될 데이터:", conceptDoc);
      console.log("🎲 randomField 포함 여부:", !!conceptDoc.randomField);

      await setDoc(conceptRef, conceptDoc);
      console.log(`✓ 개념 생성 완료: ${conceptId}`);
      return conceptId;
    } catch (error) {
      console.error("개념 생성 오류:", error);

      // 권한 오류 처리
      if (
        error.code === "permission-denied" ||
        error.message.includes("Missing or insufficient permissions")
      ) {
        const permissionError = new Error(
          "개념 생성 권한이 없습니다. 관리자 권한이 필요합니다."
        );
        permissionError.code = "permission-denied";
        throw permissionError;
      }

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
        ...patternData,
        randomField: patternData.randomField || Math.random(), // 🎲 효율적인 랜덤 쿼리를 위한 필드
        created_at: serverTimestamp(),
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
   * 개별 예문 생성 (분리된 업로드용)
   */
  async createExample(exampleData) {
    try {
      const exampleRef = doc(collection(db, "examples"));
      const exampleId = exampleRef.id;

      const exampleDoc = {
        ...exampleData,
        randomField: exampleData.randomField || Math.random(), // 🎲 효율적인 랜덤 쿼리를 위한 필드
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
   * 퀴즈 결과를 바탕으로 사용자 진도 업데이트
   */
  async updateUserProgressFromQuiz(userEmail, quizResults) {
    try {
      console.log("📊 퀴즈 결과 기반 사용자 진도 업데이트 시작");

      const batch = writeBatch(db);
      const updatedConcepts = new Set();

      // 📊 각 퀴즈 답변에 대해 진도 업데이트 (중복 개념도 개별 처리)
      for (const answer of quizResults.answers) {
        const conceptId = answer.conceptId;
        if (!conceptId) continue;

        // 🎯 중복 개념도 처리하되, 같은 개념에 대해서는 한 번만 진도 업데이트
        const progressKey = `${conceptId}_${answer.questionIndex || 0}`;
        if (updatedConcepts.has(conceptId)) {
          // 이미 처리된 개념이지만, 추가 노출 횟수는 증가
          continue;
        }

        updatedConcepts.add(conceptId);
        const progressId = `${userEmail}_${conceptId}`;
        const progressRef = doc(db, "user_records", progressId);

        // 기존 진도 확인
        const progressDoc = await getDoc(progressRef);
        let currentProgress = {};

        if (progressDoc.exists()) {
          currentProgress = progressDoc.data();
        } else {
          // 진도가 없으면 초기화
          await this.initializeUserProgress(conceptId, userEmail);
          const newProgressDoc = await getDoc(progressRef);
          currentProgress = newProgressDoc.data();
        }

        // 새로운 성과 계산
        const conceptAnswers = quizResults.answers.filter(
          (a) => a.conceptId === conceptId
        );
        const correctAnswers = conceptAnswers.filter((a) => a.isCorrect).length;
        const totalAnswers = conceptAnswers.length;
        const accuracy = totalAnswers > 0 ? correctAnswers / totalAnswers : 0;

        // 진도 업데이트 데이터 준비
        const updatedData = {
          // 퀴즈 성과 업데이트
          "quiz_performance.total_attempts":
            (currentProgress.quiz_performance?.total_attempts || 0) +
            totalAnswers,
          "quiz_performance.correct_answers":
            (currentProgress.quiz_performance?.correct_answers || 0) +
            correctAnswers,
          "quiz_performance.average_time": Math.round(
            ((currentProgress.quiz_performance?.average_time || 0) +
              quizResults.totalTime) /
              2
          ),

          // 어휘 마스터리 업데이트 (정확도 기반)
          "vocabulary_mastery.recognition": Math.min(
            100,
            (currentProgress.vocabulary_mastery?.recognition || 0) +
              accuracy * 20
          ),
          "vocabulary_mastery.last_studied": serverTimestamp(),
          "vocabulary_mastery.study_count":
            (currentProgress.vocabulary_mastery?.study_count || 0) + 1,

          // 전체 마스터리 레벨 계산
          "overall_mastery.last_interaction": serverTimestamp(),
          "overall_mastery.level": this.calculateOverallMastery(
            currentProgress,
            accuracy
          ),
          "overall_mastery.status": this.calculateMasteryStatus(
            currentProgress,
            accuracy
          ),
        };

        // 연속 정답 기록 업데이트
        if (correctAnswers === totalAnswers && totalAnswers > 0) {
          const currentStreak =
            currentProgress.quiz_performance?.best_streak || 0;
          updatedData["quiz_performance.best_streak"] = Math.max(
            currentStreak,
            totalAnswers
          );
        }

        batch.update(progressRef, updatedData);
      }

      await batch.commit();
      console.log("✅ 사용자 진도 업데이트 완료");
    } catch (error) {
      console.error("❌ 사용자 진도 업데이트 중 오류:", error);
    }
  }

  /**
   * 전체 마스터리 레벨 계산 (0-100)
   */
  calculateOverallMastery(currentProgress, recentAccuracy) {
    const vocabMastery = currentProgress.vocabulary_mastery?.recognition || 0;
    const quizAccuracy = currentProgress.quiz_performance?.correct_answers || 0;
    const totalAttempts = currentProgress.quiz_performance?.total_attempts || 1;

    // 기존 정확도 + 최근 정확도 가중 평균
    const overallAccuracy =
      (quizAccuracy / totalAttempts) * 0.7 + recentAccuracy * 0.3;

    return Math.min(
      100,
      Math.round(vocabMastery * 0.6 + overallAccuracy * 100 * 0.4)
    );
  }

  /**
   * 마스터리 상태 계산
   */
  calculateMasteryStatus(currentProgress, recentAccuracy) {
    const overallLevel = this.calculateOverallMastery(
      currentProgress,
      recentAccuracy
    );

    if (overallLevel >= 80) return "mastered";
    if (overallLevel >= 60) return "practiced";
    if (overallLevel >= 20) return "learning";
    return "not_started";
  }

  /**
   * 사용자의 전체 학습 통계 조회
   */
  async getUserLearningStats(userEmail) {
    try {
      // 🔍 전체 개념 수 조회 (DB에 있는 모든 개념)
      const allConceptsQuery = query(collection(db, "concepts"));
      const allConceptsSnapshot = await getDocs(allConceptsQuery);
      const totalConceptsInDB = allConceptsSnapshot.size;

      // 사용자 진도 데이터 조회
      const progressQuery = query(
        collection(db, "user_records"),
        where("user_email", "==", userEmail),
        limit(50) // 최근 학습한 개념들
      );

      const progressSnapshot = await getDocs(progressQuery);
      const progressData = progressSnapshot.docs.map((doc) => doc.data());

      // 🔍 디버깅: 중복 개념 ID 체크
      const conceptIds = new Set();
      const validProgressData = [];
      const duplicateData = [];

      progressData.forEach((progress) => {
        if (progress.concept_id) {
          if (!conceptIds.has(progress.concept_id)) {
            conceptIds.add(progress.concept_id);
            validProgressData.push(progress);
          } else {
            duplicateData.push(progress);
          }
        }
      });

      console.log(`📊 진도 통계 디버깅:
        - 전체 개념 수: ${totalConceptsInDB}
        - 원본 진도 레코드: ${progressData.length}
        - 유효한 진도 레코드: ${validProgressData.length}
        - 중복 제거된 개념 수: ${conceptIds.size}
        - 중복된 레코드 수: ${duplicateData.length}
      `);

      // 중복 데이터가 있다면 로그 출력
      if (duplicateData.length > 0) {
        console.warn(
          "⚠️ 중복된 진도 데이터 발견:",
          duplicateData.map((d) => d.concept_id)
        );
      }

      // 중복 제거된 데이터 사용 (실제 개념 존재 여부는 나중에 확인)
      const finalProgressData = validProgressData;

      // 퀴즈 기록 데이터 조회
      const quizQuery = query(
        collection(db, "quiz_records"),
        where("user_email", "==", userEmail),
        limit(50)
      );

      const quizSnapshot = await getDocs(quizQuery);
      const quizData = quizSnapshot.docs.map((doc) => doc.data());

      // 🎮 게임 기록 데이터 조회
      const gameQuery = query(
        collection(db, "game_records"),
        where("user_email", "==", userEmail),
        limit(30)
      );

      const gameSnapshot = await getDocs(gameQuery);
      const gameData = gameSnapshot.docs.map((doc) => doc.data());

      // 📚 학습 기록 데이터 조회
      const learningQuery = query(
        collection(db, "learning_records"),
        where("user_email", "==", userEmail),
        limit(30)
      );

      const learningSnapshot = await getDocs(learningQuery);
      const learningData = learningSnapshot.docs.map((doc) => doc.data());

      // 📊 개선된 마스터리 기준 (기존 80% → 60%)
      const masteredCount = finalProgressData.filter(
        (p) => (p.overall_mastery?.level || 0) >= 60
      ).length;

      const practiceNeededCount = finalProgressData.filter((p) => {
        const level = p.overall_mastery?.level || 0;
        return level >= 30 && level < 60;
      }).length;

      const learningCount = finalProgressData.filter((p) => {
        const level = p.overall_mastery?.level || 0;
        return level > 0 && level < 30;
      }).length;

      // 통계 계산
      const stats = {
        // 🎯 전체 DB 개념 수 vs 사용자가 학습한 개념 수 (중복 제거)
        totalConcepts: totalConceptsInDB,
        studiedConcepts: finalProgressData.length,
        masteredConcepts: masteredCount,
        practiceNeeded: practiceNeededCount,
        learning: learningCount,

        totalQuizzes: quizData.length,
        averageScore:
          quizData.length > 0
            ? Math.round(
                quizData.reduce((sum, q) => sum + q.score, 0) / quizData.length
              )
            : 0,

        weeklyActivity: this.calculateWeeklyActivityEnhanced(
          quizData,
          gameData,
          learningData
        ),
        categoryProgress: await this.calculateCategoryProgressEnhanced(
          finalProgressData
        ),

        // 🎯 게임 및 학습 통계 추가
        totalGames: gameData.length,
        totalLearningActivities: learningData.length,
        averageGameScore:
          gameData.length > 0
            ? Math.round(
                gameData.reduce((sum, g) => sum + (g.score || 0), 0) /
                  gameData.length
              )
            : 0,
        bestGameScore:
          gameData.length > 0
            ? Math.max(...gameData.map((g) => g.score || 0))
            : 0,
        gamesWon: gameData.filter((g) => (g.score || 0) >= 80).length,
        gamesByType: this.calculateGamesByType(gameData),

        recentAchievements: this.getRecentAchievementsEnhanced(
          finalProgressData,
          quizData,
          gameData,
          learningData
        ),
      };

      console.log("📊 개선된 학습 통계:", stats);
      return stats;
    } catch (error) {
      console.error("❌ 사용자 학습 통계 조회 중 오류:", error);
      return {
        totalConcepts: 0,
        studiedConcepts: 0,
        masteredConcepts: 0,
        practiceNeeded: 0,
        learning: 0,
        totalQuizzes: 0,
        averageScore: 0,
        totalGames: 0,
        totalLearningActivities: 0,
        averageGameScore: 0,
        weeklyActivity: [],
        categoryProgress: {},
        recentAchievements: [],
      };
    }
  }

  // 헬퍼 함수들
  calculateWeeklyActivity(quizData) {
    const weeklyData = Array(7).fill(0);
    const now = new Date();

    quizData.forEach((quiz) => {
      const quizDate =
        quiz.completed_at?.toDate?.() || new Date(quiz.completed_at);
      const daysDiff = Math.floor((now - quizDate) / (1000 * 60 * 60 * 24));

      if (daysDiff < 7) {
        weeklyData[6 - daysDiff]++;
      }
    });

    return weeklyData;
  }

  /**
   * 📊 개선된 주간 활동 계산 (퀴즈 + 게임 + 학습)
   */
  calculateWeeklyActivityEnhanced(quizData, gameData, learningData) {
    const weeklyData = Array(7).fill(0);
    const now = new Date();

    // 퀴즈 활동
    quizData.forEach((quiz) => {
      const quizDate =
        quiz.completed_at?.toDate?.() || new Date(quiz.completed_at);
      const daysDiff = Math.floor((now - quizDate) / (1000 * 60 * 60 * 24));
      if (daysDiff < 7) {
        weeklyData[6 - daysDiff]++;
      }
    });

    // 게임 활동
    gameData.forEach((game) => {
      const gameDate =
        game.completed_at?.toDate?.() || new Date(game.completed_at);
      const daysDiff = Math.floor((now - gameDate) / (1000 * 60 * 60 * 24));
      if (daysDiff < 7) {
        weeklyData[6 - daysDiff]++;
      }
    });

    // 학습 활동
    learningData.forEach((learn) => {
      const learnDate =
        learn.completed_at?.toDate?.() || new Date(learn.completed_at);
      const daysDiff = Math.floor((now - learnDate) / (1000 * 60 * 60 * 24));
      if (daysDiff < 7) {
        weeklyData[6 - daysDiff]++;
      }
    });

    return weeklyData;
  }

  calculateCategoryProgress(progressData) {
    const categories = {};

    progressData.forEach((progress) => {
      // 간단한 카테고리 분류 (실제로는 concept 데이터에서 가져와야 함)
      const category = "vocabulary"; // 임시

      if (!categories[category]) {
        categories[category] = { total: 0, mastered: 0 };
      }

      categories[category].total++;
      if (progress.overall_mastery?.status === "mastered") {
        categories[category].mastered++;
      }
    });

    return categories;
  }

  /**
   * 📊 개선된 카테고리별 진도 계산 (실제 개념 데이터 기반)
   */
  async calculateCategoryProgressEnhanced(progressData) {
    try {
      const categories = {};

      // 각 진도 데이터에 대해 실제 개념 정보 조회
      for (const progress of progressData) {
        const conceptId = progress.concept_id;

        // 개념 정보 조회
        const conceptDoc = await getDoc(doc(db, "concepts", conceptId));
        if (!conceptDoc.exists()) continue;

        const conceptData = conceptDoc.data();

        // 카테고리 결정 (도메인 기반)
        const domain = conceptData.domain || "general";
        const category = this.getCategoryFromDomain(domain);

        if (!categories[category]) {
          categories[category] = {
            total: 0,
            mastered: 0,
            learning: 0,
            practiced: 0,
          };
        }

        categories[category].total++;

        const masteryLevel = progress.overall_mastery?.level || 0;
        if (masteryLevel >= 60) {
          categories[category].mastered++;
        } else if (masteryLevel >= 30) {
          categories[category].practiced++;
        } else if (masteryLevel > 0) {
          categories[category].learning++;
        }
      }

      console.log("📊 개선된 카테고리 진도:", categories);
      return categories;
    } catch (error) {
      console.error("❌ 카테고리 진도 계산 중 오류:", error);
      // 기본 분류로 fallback
      return this.calculateCategoryProgress(progressData);
    }
  }

  /**
   * 도메인을 학습 영역으로 변환
   */
  getCategoryFromDomain(domain) {
    const categoryMap = {
      // 어휘 관련 도메인들
      food: "어휘",
      animal: "어휘",
      nature: "어휘",
      object: "어휘",
      transport: "어휘",
      place: "어휘",
      body: "어휘",
      emotion: "어휘",
      color: "어휘",
      number: "어휘",
      time: "어휘",
      weather: "어휘",
      family: "어휘",
      job: "어휘",
      hobby: "어휘",
      sport: "어휘",
      technology: "어휘",
      education: "어휘",
      health: "어휘",
      business: "어휘",
      travel: "어휘",
      culture: "어휘",
      routine: "어휘",
      tradition: "어휘",
      social: "어휘",

      // 문법 관련
      grammar: "문법",

      // 회화 관련
      conversation: "회화",
      speaking: "회화",

      // 독해 관련
      reading: "독해",

      // 듣기 관련
      listening: "듣기",

      // 쓰기 관련
      writing: "쓰기",
    };

    return categoryMap[domain] || "어휘"; // 기본값은 어휘
  }

  /**
   * 📚 학습 활동 추적 (학습 페이지용)
   */
  async updateLearningActivity(userEmail, activityData) {
    try {
      console.log("📚 학습 활동 추적 시작:", activityData);

      const learningActivityRef = doc(collection(db, "learning_records"));

      const activityDoc = {
        user_email: userEmail,
        type: activityData.type, // "vocabulary", "grammar", "reading" - 진도 페이지 호환성
        activity_type: activityData.type, // "vocabulary", "grammar", "reading"
        concept_ids: activityData.conceptIds || [],

        // 🔄 품질 계산에 필요한 필드들 (progress.js와 동기화)
        session_duration: activityData.duration || 0, // 분 단위
        concepts_studied: activityData.wordsStudied || 0,
        correct_answers: activityData.correctAnswers || 0,
        total_interactions: activityData.totalInteractions || 0,

        completed_at: serverTimestamp(),
        score: activityData.score || null,
        difficulty: activityData.difficulty || "beginner",
        language_pair: {
          source: activityData.sourceLanguage || "korean",
          target: activityData.targetLanguage || "english",
        },

        // 추가 메타데이터
        metadata: {
          // 🔄 호환성을 위한 기존 필드들 유지
          duration_minutes: activityData.duration || 0,
          words_studied: activityData.wordsStudied || 0,
          concepts_mastered: activityData.conceptsMastered || 0,
          session_quality: activityData.sessionQuality || "good",

          // 🎯 정확도 계산
          accuracy_rate:
            activityData.totalInteractions > 0
              ? activityData.correctAnswers / activityData.totalInteractions
              : 0,
        },
      };

      await setDoc(learningActivityRef, activityDoc);

      // 각 개념별 진도 업데이트
      if (activityData.conceptIds && activityData.conceptIds.length > 0) {
        await this.updateUserProgressFromLearning(userEmail, activityData);
      }

      console.log("✅ 학습 활동 추적 완료");
    } catch (error) {
      console.error("❌ 학습 활동 추적 중 오류:", error);
    }
  }

  /**
   * 📚 학습 활동 기반 진도 업데이트
   */
  async updateUserProgressFromLearning(userEmail, learningData) {
    try {
      const batch = writeBatch(db);
      const updatedConcepts = new Set();

      for (const conceptId of learningData.conceptIds || []) {
        if (updatedConcepts.has(conceptId)) continue;
        updatedConcepts.add(conceptId);

        const progressId = `${userEmail}_${conceptId}`;
        const progressRef = doc(db, "user_records", progressId);

        // 기존 진도 확인
        const progressDoc = await getDoc(progressRef);
        let currentProgress = {};

        if (progressDoc.exists()) {
          currentProgress = progressDoc.data();
        } else {
          await this.initializeUserProgress(conceptId, userEmail);
          const newProgressDoc = await getDoc(progressRef);
          currentProgress = newProgressDoc.data();
        }

        // 학습 활동 기반 진도 업데이트
        const updatedData = {
          "vocabulary_mastery.exposure_count":
            (currentProgress.vocabulary_mastery?.exposure_count || 0) + 1,
          "vocabulary_mastery.last_studied": serverTimestamp(),
          "vocabulary_mastery.study_count":
            (currentProgress.vocabulary_mastery?.study_count || 0) + 1,
          "vocabulary_mastery.learning_time":
            (currentProgress.vocabulary_mastery?.learning_time || 0) +
            (learningData.duration || 5), // 기본 5분

          "overall_mastery.last_interaction": serverTimestamp(),
          "overall_mastery.level": Math.min(
            100,
            (currentProgress.overall_mastery?.level || 0) + 5
          ), // 학습시 5점 증가
        };

        // 마스터리 상태 재계산
        const newLevel = updatedData["overall_mastery.level"];
        updatedData["overall_mastery.status"] =
          newLevel >= 60
            ? "mastered"
            : newLevel >= 30
            ? "practiced"
            : newLevel > 0
            ? "learning"
            : "not_started";

        batch.update(progressRef, updatedData);
      }

      await batch.commit();
      console.log("✅ 학습 기반 진도 업데이트 완료");
    } catch (error) {
      console.error("❌ 학습 기반 진도 업데이트 중 오류:", error);
    }
  }

  /**
   * 🎯 통합 사용자 활동 추적 (게임, 퀴즈, 학습)
   */
  async updateUserActivity(userEmail, activityData) {
    try {
      console.log("🎯 사용자 활동 추적 시작:", activityData);

      const userActivityRef = doc(collection(db, "user_activities"));

      const activityDoc = {
        user_email: userEmail,
        userId: activityData.userId, // 진도 페이지 호환성
        activity_type: activityData.activity_type, // "game", "quiz", "learning"

        // 게임 관련 데이터
        ...(activityData.activity_type === "game" && {
          game_type: activityData.game_type || activityData.type,
          gameType:
            activityData.gameType ||
            activityData.game_type ||
            activityData.type,
          words_played: activityData.wordsPlayed || 0,
          correct_answers: activityData.correctAnswers || 0,
          total_answers: activityData.totalAnswers || 0,
        }),

        // 퀴즈 관련 데이터
        ...(activityData.activity_type === "quiz" && {
          quiz_type: activityData.quiz_type || activityData.type,
          quizType:
            activityData.quizType ||
            activityData.quiz_type ||
            activityData.type,
          correct_answers: activityData.correctAnswers || 0,
          total_questions: activityData.totalQuestions || 0,
          question_results: activityData.questionResults || [],
        }),

        // 학습 관련 데이터
        ...(activityData.activity_type === "learning" && {
          learning_type: activityData.learning_type || activityData.type,
          learningType:
            activityData.learningType ||
            activityData.learning_type ||
            activityData.type,
          session_duration: activityData.sessionDuration || 0,
          concepts_studied: activityData.conceptsStudied || 0,
          learning_method: activityData.learningMethod || "standard",
        }),

        // 공통 데이터
        score: activityData.score || 0,
        max_score: activityData.maxScore || 0,
        time_spent: activityData.timeSpent || activityData.time_spent || 0,
        timeSpent: activityData.timeSpent || activityData.time_spent || 0,
        difficulty: activityData.difficulty || "basic",
        sourceLanguage: activityData.sourceLanguage,
        targetLanguage: activityData.targetLanguage,
        language_pair: activityData.language_pair || {
          source: activityData.sourceLanguage || "korean",
          target: activityData.targetLanguage || "english",
        },
        accuracy: activityData.accuracy || 0,
        success: activityData.success || false,
        isCompleted: activityData.isCompleted || true,
        timestamp: activityData.timestamp || serverTimestamp(),
        completed_at: activityData.completed_at || serverTimestamp(),
        playedAt: activityData.playedAt || serverTimestamp(),
        metadata: {
          duration:
            activityData.gameDuration || activityData.sessionDuration || 0,
          accuracy_rate: activityData.accuracyRate || 0,
          performance_rating: activityData.performanceRating || "good",
        },
      };

      await setDoc(userActivityRef, activityDoc);

      // 활동에서 사용된 개념들에 대한 진도 업데이트
      if (activityData.conceptIds && activityData.conceptIds.length > 0) {
        switch (activityData.activity_type) {
          case "game":
            await this.updateUserProgressFromGame(userEmail, activityData);
            break;
          case "quiz":
            await this.updateUserProgressFromQuiz(userEmail, activityData);
            break;
          case "learning":
            await this.updateUserProgressFromLearning(userEmail, activityData);
            break;
        }
      }

      console.log("✅ 사용자 활동 추적 완료");
    } catch (error) {
      console.error("❌ 사용자 활동 추적 중 오류:", error);
    }
  }

  /**
   * 🎮 게임 기록 추적 및 진도 업데이트
   */
  async updateGameRecord(userEmail, gameData) {
    try {
      console.log("🎮 게임 기록 추적 시작:", gameData);

      const gameRecordRef = doc(collection(db, "game_records"));

      const activityDoc = {
        user_email: userEmail,
        userId: gameData.userId, // 진도 페이지 호환성
        game_type: gameData.game_type || gameData.type, // "word-matching", "word-scramble", "memory-game"
        gameType: gameData.gameType || gameData.game_type || gameData.type, // camelCase 호환성
        score: gameData.score || 0,
        max_score: gameData.maxScore || 0,
        time_spent: gameData.timeSpent || gameData.time_spent || 0,
        timeSpent: gameData.timeSpent || gameData.time_spent || 0, // camelCase 호환성
        words_played: gameData.wordsPlayed || 0,
        correct_answers: gameData.correctAnswers || 0,
        total_answers: gameData.totalAnswers || 0,
        difficulty: gameData.difficulty || "basic",
        sourceLanguage: gameData.sourceLanguage,
        targetLanguage: gameData.targetLanguage,
        language_pair: gameData.language_pair || {
          source: gameData.sourceLanguage || "korean",
          target: gameData.targetLanguage || "english",
        },
        accuracy: gameData.accuracy || 0,
        success: gameData.success || false,
        isCompleted: gameData.isCompleted || true,
        timestamp: gameData.timestamp || serverTimestamp(), // 진도 페이지용
        completed_at: gameData.completed_at || serverTimestamp(), // game_activities용
        playedAt: gameData.playedAt || serverTimestamp(), // 추가 호환성
        metadata: {
          game_duration: gameData.gameDuration || 0,
          accuracy_rate: gameData.accuracyRate || 0,
          performance_rating: gameData.performanceRating || "good",
        },
      };

      await setDoc(gameRecordRef, activityDoc);

      // 게임에서 사용된 개념들에 대한 진도 업데이트
      if (gameData.conceptIds && gameData.conceptIds.length > 0) {
        await this.updateUserProgressFromGame(userEmail, gameData);
      }

      console.log("✅ 게임 기록 추적 완료");
    } catch (error) {
      console.error("❌ 게임 기록 추적 중 오류:", error);
    }
  }

  /**
   * 🎮 게임 기반 진도 업데이트
   */
  async updateUserProgressFromGame(userEmail, gameData) {
    try {
      const batch = writeBatch(db);
      const updatedConcepts = new Set();

      for (const conceptId of gameData.conceptIds || []) {
        if (updatedConcepts.has(conceptId)) continue;
        updatedConcepts.add(conceptId);

        const progressId = `${userEmail}_${conceptId}`;
        const progressRef = doc(db, "user_records", progressId);

        // 기존 진도 확인
        const progressDoc = await getDoc(progressRef);
        let currentProgress = {};

        if (progressDoc.exists()) {
          currentProgress = progressDoc.data();
        } else {
          await this.initializeUserProgress(conceptId, userEmail);
          const newProgressDoc = await getDoc(progressRef);
          currentProgress = newProgressDoc.data();
        }

        // 게임 성과 기반 진도 업데이트
        const accuracyRate = gameData.accuracyRate || 0;
        const pointsToAdd = Math.round(accuracyRate * 10); // 정확도에 따라 0-10점 추가

        const updatedData = {
          "vocabulary_mastery.game_exposure":
            (currentProgress.vocabulary_mastery?.game_exposure || 0) + 1,
          "vocabulary_mastery.last_studied": serverTimestamp(),
          "vocabulary_mastery.game_score": Math.max(
            currentProgress.vocabulary_mastery?.game_score || 0,
            gameData.score || 0
          ),

          "overall_mastery.last_interaction": serverTimestamp(),
          "overall_mastery.level": Math.min(
            100,
            (currentProgress.overall_mastery?.level || 0) + pointsToAdd
          ),
        };

        // 마스터리 상태 재계산
        const newLevel = updatedData["overall_mastery.level"];
        updatedData["overall_mastery.status"] =
          newLevel >= 60
            ? "mastered"
            : newLevel >= 30
            ? "practiced"
            : newLevel > 0
            ? "learning"
            : "not_started";

        batch.update(progressRef, updatedData);
      }

      await batch.commit();
      console.log("✅ 게임 기반 진도 업데이트 완료");
    } catch (error) {
      console.error("❌ 게임 기반 진도 업데이트 중 오류:", error);
    }
  }

  getRecentAchievements(progressData, quizData) {
    const achievements = [];

    // 최근 마스터된 개념들
    const recentMastered = progressData
      .filter((p) => p.overall_mastery?.status === "mastered")
      .sort(
        (a, b) =>
          (b.overall_mastery?.last_interaction?.toDate() || 0) -
          (a.overall_mastery?.last_interaction?.toDate() || 0)
      )
      .slice(0, 3);

    recentMastered.forEach((progress) => {
      achievements.push({
        type: "mastery",
        conceptId: progress.concept_id,
        date: progress.overall_mastery?.last_interaction,
        description: "concept_mastered",
      });
    });

    // 높은 점수 퀴즈들
    const highScoreQuizzes = quizData
      .filter((q) => q.score >= 90)
      .sort(
        (a, b) =>
          (b.completed_at?.toDate() || 0) - (a.completed_at?.toDate() || 0)
      )
      .slice(0, 2);

    highScoreQuizzes.forEach((quiz) => {
      achievements.push({
        type: "high_score",
        score: quiz.score,
        date: quiz.completed_at,
        description: "high_quiz_score",
      });
    });

    return achievements.slice(0, 5); // 최대 5개
  }

  /**
   * 🏆 개선된 최근 성취도 (퀴즈 + 게임 + 학습)
   */
  getRecentAchievementsEnhanced(
    progressData,
    quizData,
    gameData,
    learningData
  ) {
    const achievements = [];

    // 최근 마스터된 개념들
    const recentMastered = progressData
      .filter((p) => (p.overall_mastery?.level || 0) >= 60)
      .sort(
        (a, b) =>
          (b.overall_mastery?.last_interaction?.toDate() || 0) -
          (a.overall_mastery?.last_interaction?.toDate() || 0)
      )
      .slice(0, 2);

    recentMastered.forEach((progress) => {
      achievements.push({
        type: "mastery",
        conceptId: progress.concept_id,
        date: progress.overall_mastery?.last_interaction,
        description: "concept_mastered",
        icon: "fas fa-trophy",
        color: "text-yellow-500",
      });
    });

    // 높은 점수 퀴즈들
    const highScoreQuizzes = quizData
      .filter((q) => q.score >= 85)
      .sort(
        (a, b) =>
          (b.completed_at?.toDate() || 0) - (a.completed_at?.toDate() || 0)
      )
      .slice(0, 2);

    highScoreQuizzes.forEach((quiz) => {
      achievements.push({
        type: "high_quiz_score",
        score: quiz.score,
        date: quiz.completed_at,
        description: "high_quiz_score",
        icon: "fas fa-brain",
        color: "text-blue-500",
      });
    });

    // 🎮 게임 성취도
    const highScoreGames = gameData
      .filter((g) => (g.score || 0) > 80)
      .sort(
        (a, b) =>
          (b.completed_at?.toDate() || 0) - (a.completed_at?.toDate() || 0)
      )
      .slice(0, 2);

    highScoreGames.forEach((game) => {
      achievements.push({
        type: "high_game_score",
        gameType: game.game_type,
        score: game.score,
        date: game.completed_at,
        description: "high_game_score",
        icon: "fas fa-gamepad",
        color: "text-purple-500",
      });
    });

    // 📚 학습 성취도
    const recentLearning = learningData
      .filter((l) => (l.metadata?.words_studied || 0) >= 5)
      .sort(
        (a, b) =>
          (b.completed_at?.toDate() || 0) - (a.completed_at?.toDate() || 0)
      )
      .slice(0, 1);

    recentLearning.forEach((learning) => {
      achievements.push({
        type: "learning_session",
        wordsStudied: learning.metadata?.words_studied,
        activityType: learning.activity_type,
        date: learning.completed_at,
        description: "productive_learning",
        icon: "fas fa-book-open",
        color: "text-green-500",
      });
    });

    return achievements.slice(0, 5); // 최대 5개
  }

  /**
   * 사용자 숙련도 기반 개념 선별
   */
  async getConceptsByUserProgress(userEmail, targetLanguage, limit = 20) {
    try {
      console.log("🎯 개인 숙련도 기반 개념 선별 시작");

      // 1. 사용자의 진도 데이터 조회
      const progressQuery = query(
        collection(db, "user_records"),
        where("user_email", "==", userEmail),
        limit(50) // 최근 학습한 개념들
      );

      const progressSnapshot = await getDocs(progressQuery);
      const userProgress = new Map();

      progressSnapshot.forEach((doc) => {
        const data = doc.data();
        userProgress.set(data.concept_id, data);
      });

      // 2. 전체 개념 조회
      const allConcepts = await this.getConceptsForLearning(
        "korean",
        targetLanguage,
        limit * 2
      );

      // 3. 숙련도 기반 우선순위 계산
      const conceptsWithPriority = allConcepts.map((concept) => {
        const progress = userProgress.get(concept.id);
        let priority = 50; // 기본 우선순위

        if (progress) {
          const masteryLevel = progress.overall_mastery?.level || 0;

          // 마스터리 레벨에 따른 우선순위 조정
          if (masteryLevel < 30) {
            priority = 90; // 약한 개념 우선
          } else if (masteryLevel < 60) {
            priority = 70; // 연습 필요
          } else if (masteryLevel < 80) {
            priority = 40; // 복습 필요
          } else {
            priority = 20; // 마스터된 개념은 낮은 우선순위
          }

          // 최근 학습 여부 고려
          const lastStudied = progress.vocabulary_mastery?.last_studied;
          if (lastStudied) {
            const daysSinceStudy =
              (Date.now() - lastStudied.toDate().getTime()) /
              (1000 * 60 * 60 * 24);
            if (daysSinceStudy > 7) {
              priority += 20; // 오래전 학습한 개념 우선
            }
          }
        }

        return { ...concept, priority };
      });

      // 4. 우선순위 기반 정렬 및 반환
      const sortedConcepts = conceptsWithPriority
        .sort((a, b) => b.priority - a.priority)
        .slice(0, limit);

      console.log(`✅ 개인화된 개념 선별 완료: ${sortedConcepts.length}개`);
      return sortedConcepts;
    } catch (error) {
      console.error("❌ 개인 숙련도 기반 개념 선별 중 오류:", error);
      // 오류 시 기본 개념 반환
      return await this.getConceptsForLearning("korean", targetLanguage, limit);
    }
  }

  /**
   * 🎮 게임 타입별 통계 계산
   */
  calculateGamesByType(gameData) {
    const gamesByType = {};

    gameData.forEach((game) => {
      const gameType = game.game_type || "unknown";

      if (!gamesByType[gameType]) {
        gamesByType[gameType] = {
          count: 0,
          totalScore: 0,
          bestScore: 0,
          averageScore: 0,
          gamesWon: 0,
        };
      }

      gamesByType[gameType].count += 1;
      gamesByType[gameType].totalScore += game.score || 0;

      if ((game.score || 0) > gamesByType[gameType].bestScore) {
        gamesByType[gameType].bestScore = game.score || 0;
      }

      if ((game.score || 0) >= 80) {
        gamesByType[gameType].gamesWon += 1;
      }
    });

    // 평균 점수 계산
    Object.keys(gamesByType).forEach((gameType) => {
      const stats = gamesByType[gameType];
      stats.averageScore =
        stats.count > 0 ? Math.round(stats.totalScore / stats.count) : 0;
    });

    return gamesByType;
  }
}

// 싱글톤 인스턴스
export const collectionManager = new CollectionManager();
