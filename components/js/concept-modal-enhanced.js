import { hybridGrammarSystem } from "../../js/hybrid-grammar-system.js";
import { getCurrentUILanguage, getI18nText } from "../../js/i18n.js";

/**
 * 향상된 개념 모달 시스템
 * 하이브리드 문법 시스템을 활용하여 다국어 문법 설명 지원
 */

export class EnhancedConceptModal {
  constructor() {
    this.modal = null;
    this.currentConcept = null;
    this.currentLanguage = "korean";
    this.uiLanguage = getCurrentUILanguage();
    this.init();
  }

  init() {
    this.createModal();
    this.bindEvents();
  }

  /**
   * 모달 HTML 구조 생성
   */
  createModal() {
    const modalHtml = `
      <div id="enhanced-concept-modal" class="modal fade" tabindex="-1">
        <div class="modal-dialog modal-xl">
          <div class="modal-content">
            <div class="modal-header">
              <div class="d-flex justify-content-between align-items-center w-100">
                <h5 class="modal-title" data-i18n="concept_details">개념 상세</h5>
                <div class="language-tabs">
                  <button class="btn btn-sm btn-outline-primary me-1" data-lang="korean">한국어</button>
                  <button class="btn btn-sm btn-outline-primary me-1" data-lang="english">English</button>
                  <button class="btn btn-sm btn-outline-primary me-1" data-lang="japanese">日本語</button>
                  <button class="btn btn-sm btn-outline-primary" data-lang="chinese">中文</button>
                </div>
              </div>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <!-- 기본 정보 섹션 -->
              <div id="basic-info-section" class="mb-4">
                <div class="row">
                  <div class="col-md-8">
                    <h3 id="word-display" class="text-primary mb-2"></h3>
                    <div id="pronunciation-display" class="text-muted mb-2"></div>
                    <div id="definition-display" class="mb-3"></div>
                  </div>
                  <div class="col-md-4 text-end">
                    <span id="emoji-display" class="fs-1"></span>
                    <div id="pos-badge" class="badge bg-secondary mt-2"></div>
                  </div>
                </div>
              </div>

              <!-- 하이브리드 문법 설명 섹션 -->
              <div id="grammar-section" class="mb-4">
                <h5 data-i18n="grammar_information">문법 정보</h5>
                
                <!-- 자연어 문법 설명 -->
                <div id="natural-grammar" class="card mb-3">
                  <div class="card-body">
                    <h6 class="card-title" data-i18n="grammar_explanation">문법 설명</h6>
                    <div id="basic-grammar-desc" class="mb-2"></div>
                    <div id="detailed-grammar-desc" class="text-muted small"></div>
                  </div>
                </div>

                <!-- 구조화된 문법 태그 -->
                <div id="structured-grammar" class="card mb-3">
                  <div class="card-body">
                    <h6 class="card-title" data-i18n="grammar_tags">문법 태그</h6>
                    <div id="grammar-tags-display" class="d-flex flex-wrap gap-2"></div>
                  </div>
                </div>

                <!-- 학습 메타데이터 -->
                <div id="learning-metadata" class="card">
                  <div class="card-body">
                    <h6 class="card-title" data-i18n="learning_info">학습 정보</h6>
                    <div class="row">
                      <div class="col-md-6">
                        <small class="text-muted" data-i18n="difficulty">난이도</small>
                        <div id="difficulty-score" class="progress mb-2">
                          <div class="progress-bar" role="progressbar"></div>
                        </div>
                      </div>
                      <div class="col-md-6">
                        <small class="text-muted" data-i18n="quiz_suitability">퀴즈 적합도</small>
                        <div id="quiz-score" class="progress mb-2">
                          <div class="progress-bar bg-success" role="progressbar"></div>
                        </div>
                      </div>
                    </div>
                    <div id="practice-points" class="mt-2">
                      <small class="text-muted" data-i18n="practice_points">연습 포인트:</small>
                      <div id="practice-list" class="mt-1"></div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 관련 정보 섹션 -->
              <div id="related-info-section">
                <div class="row">
                  <div class="col-md-6">
                    <div class="card">
                      <div class="card-body">
                        <h6 class="card-title" data-i18n="synonyms">동의어</h6>
                        <div id="synonyms-list"></div>
                      </div>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="card">
                      <div class="card-body">
                        <h6 class="card-title" data-i18n="collocations">연어</h6>
                        <div id="collocations-list"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-primary" id="start-quiz-btn" data-i18n="start_quiz">
                퀴즈 시작
              </button>
              <button type="button" class="btn btn-success" id="start-game-btn" data-i18n="start_game">
                게임 시작  
              </button>
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" data-i18n="close">
                닫기
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    // DOM에 모달 추가
    document.body.insertAdjacentHTML("beforeend", modalHtml);
    this.modal = new bootstrap.Modal(
      document.getElementById("enhanced-concept-modal")
    );
  }

  /**
   * 이벤트 바인딩
   */
  bindEvents() {
    // 언어 탭 클릭
    document.querySelectorAll(".language-tabs button").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        this.switchLanguage(e.target.dataset.lang);
      });
    });

    // UI 언어 변경 시 업데이트
    document.addEventListener("uiLanguageChanged", (e) => {
      this.uiLanguage = e.detail.language;
      this.updateUILabels();
      if (this.currentConcept) {
        this.updateGrammarDisplay();
      }
    });

    // 퀴즈/게임 시작 버튼
    document.getElementById("start-quiz-btn").addEventListener("click", () => {
      this.startQuiz();
    });

    document.getElementById("start-game-btn").addEventListener("click", () => {
      this.startGame();
    });
  }

  /**
   * 개념 정보 표시
   */
  async show(concept, language = "korean") {
    this.currentConcept = concept;
    this.currentLanguage = language;

    await this.updateDisplay();
    this.modal.show();
  }

  /**
   * 언어 전환
   */
  async switchLanguage(language) {
    this.currentLanguage = language;

    // 활성 탭 업데이트
    document.querySelectorAll(".language-tabs button").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.lang === language);
    });

    await this.updateDisplay();
  }

  /**
   * 전체 표시 업데이트
   */
  async updateDisplay() {
    if (!this.currentConcept) return;

    await this.updateBasicInfo();
    await this.updateGrammarDisplay();
    await this.updateRelatedInfo();
    this.updateUILabels();
  }

  /**
   * 기본 정보 업데이트
   */
  async updateBasicInfo() {
    const expression = this.currentConcept.expressions[this.currentLanguage];
    if (!expression) return;

    document.getElementById("word-display").textContent = expression.word;
    document.getElementById("pronunciation-display").textContent =
      expression.pronunciation || "";
    document.getElementById("definition-display").textContent =
      expression.definition || "";

    // 이모지 표시
    const emoji =
      expression.unicode_emoji ||
      this.currentConcept.concept_info?.unicode_emoji ||
      "";
    document.getElementById("emoji-display").textContent = emoji;

    // 품사 배지
    const posText = await this.translatePOS(expression.part_of_speech);
    const posBadge = document.getElementById("pos-badge");
    posBadge.textContent = posText;
    posBadge.className = `badge ${this.getPOSColor(expression.part_of_speech)}`;
  }

  /**
   * 하이브리드 문법 표시 업데이트 - 다층 문법 시스템
   */
  async updateGrammarDisplay() {
    const expression = this.currentConcept.expressions[this.currentLanguage];
    if (!expression) return;

    try {
      // 1. 예문 중심 문법 시스템 (최우선)
      const exampleGrammar = this.findExampleGrammarSystem();
      if (exampleGrammar) {
        await this.displayExampleGrammarSystem(exampleGrammar);
        return;
      }

      // 2. 개념 차원 통합 문법 정보 (중간 우선순위)
      const conceptGrammar = this.findConceptGrammarSystem();
      if (conceptGrammar) {
        await this.displayConceptGrammarSystem(conceptGrammar);
        return;
      }

      // 3. 단어 기반 확장 문법 정보 (기본)
      const enhancedWordGrammar = this.generateEnhancedWordGrammar(expression);
      this.displayEnhancedWordGrammar(enhancedWordGrammar);
    } catch (error) {
      console.warn("문법 표시 중 오류:", error);
      this.displayMinimalGrammar(expression);
    }
  }

  /**
   * 예문에서 문법 시스템 찾기 - 참조 기반 구조 대응
   */
  findExampleGrammarSystem() {
    // 새로운 구조: core_examples
    const examples =
      this.currentConcept.core_examples ||
      this.currentConcept.featured_examples || // 호환성
      [];

    if (!examples || examples.length === 0) return null;

    // 첫 번째 예문에서 문법 패턴 참조 찾기
    for (const example of examples) {
      // 새로운 참조 기반 구조
      if (example.grammar_pattern_id) {
        return {
          example: example,
          grammar_pattern_id: example.grammar_pattern_id,
          type: "reference_based", // 향후 grammar 컬렉션에서 조회
        };
      }

      // 기존 구조 (호환성)
      if (example.grammar_system) {
        return {
          example: example,
          grammar_system: example.grammar_system,
          type: "embedded",
        };
      }
    }

    return null;
  }

  /**
   * 개념 차원 문법 시스템 찾기 - 참조 기반 구조 대응
   */
  findConceptGrammarSystem() {
    const conceptInfo = this.currentConcept.concept_info;
    const references = this.currentConcept.references;

    // 새로운 참조 기반: grammar_patterns 참조
    if (
      references?.grammar_patterns &&
      references.grammar_patterns.length > 0
    ) {
      return {
        type: "pattern_references",
        pattern_ids: references.grammar_patterns,
        // 향후: 실제 grammar 컬렉션에서 조회
        // patterns: await grammarService.getPatterns(references.grammar_patterns)
      };
    }

    // 기존 구조 (호환성)
    if (conceptInfo?.unified_grammar) {
      return {
        type: "concept_level",
        grammar_system: conceptInfo.unified_grammar,
      };
    }

    // 레거시 구조
    if (this.currentConcept.grammar_patterns) {
      return {
        type: "pattern_based",
        patterns: this.currentConcept.grammar_patterns,
      };
    }

    return null;
  }

  /**
   * 예문 중심 문법 시스템 표시 - 참조 기반 구조 대응
   */
  async displayExampleGrammarSystem(exampleGrammar) {
    const { example } = exampleGrammar;

    if (exampleGrammar.type === "reference_based") {
      // 새로운 참조 기반 구조
      await this.displayReferencedGrammarPattern(
        example,
        exampleGrammar.grammar_pattern_id
      );
    } else if (exampleGrammar.type === "embedded") {
      // 기존 임베디드 구조 (호환성)
      await this.displayEmbeddedGrammarSystem(
        example,
        exampleGrammar.grammar_system
      );
    }
  }

  /**
   * 참조된 문법 패턴 표시 (향후 확장)
   */
  async displayReferencedGrammarPattern(example, grammarPatternId) {
    const basicDesc = document.getElementById("basic-grammar-desc");
    const detailedDesc = document.getElementById("detailed-grammar-desc");

    // 예문 텍스트 표시
    const exampleText =
      example.translations?.[this.currentLanguage]?.text || "";

    // 현재는 패턴 ID 기반으로 기본 정보 생성
    // 향후: grammarService.getPattern(grammarPatternId)로 조회
    const patternInfo = this.inferPatternInfoFromId(grammarPatternId);

    // 기본 설명
    let basicText = `${patternInfo.name} 패턴`;
    if (exampleText) {
      basicText += ` - 예문: "${exampleText}"`;
    }

    // 상세 설명
    let detailedText = `문법 패턴 ID: ${grammarPatternId}`;
    if (example.context !== "general") {
      detailedText += ` | 맥락: ${example.context}`;
    }
    if (example.priority) {
      detailedText += ` | 우선순위: ${example.priority}`;
    }

    // UI 언어에 맞게 번역
    const translatedBasic = await this.translateGrammarDescription(
      basicText,
      this.currentLanguage,
      this.uiLanguage
    );
    const translatedDetailed = await this.translateGrammarDescription(
      detailedText,
      this.currentLanguage,
      this.uiLanguage
    );

    basicDesc.textContent = translatedBasic;
    detailedDesc.textContent = translatedDetailed;

    // 참조 기반 태그 표시
    this.displayReferencedGrammarTags(grammarPatternId, example);
  }

  /**
   * 임베디드 문법 시스템 표시 (기존 호환성)
   */
  async displayEmbeddedGrammarSystem(example, grammarSystem) {
    // 기존 로직 유지
    const exampleText =
      example.translations?.[this.currentLanguage]?.text || "";

    await this.displayExampleNaturalDescriptions(grammarSystem, exampleText);
    this.displayExampleGrammarTags(grammarSystem.grammar_tags);
    this.displayExampleLearningMetadata(grammarSystem);
  }

  /**
   * 패턴 ID에서 정보 추론 (향후 실제 조회로 대체)
   */
  inferPatternInfoFromId(patternId) {
    // 패턴 ID 구조: pattern_{domain}_{category}_{pattern_name}
    const parts = patternId.split("_");

    if (parts.length >= 4) {
      const domain = parts[1];
      const category = parts[2];
      const patternName = parts.slice(3).join(" ");

      return {
        name: patternName || "기본 패턴",
        domain: domain,
        category: category,
        inferred: true,
      };
    }

    return {
      name: "알 수 없는 패턴",
      domain: "unknown",
      category: "unknown",
      inferred: true,
    };
  }

  /**
   * 참조 기반 문법 태그 표시
   */
  displayReferencedGrammarTags(grammarPatternId, example) {
    const tagsContainer = document.getElementById("grammar-tags-display");
    tagsContainer.innerHTML = "";

    // 패턴 정보 배지
    const patternInfo = this.inferPatternInfoFromId(grammarPatternId);
    const patternBadge = document.createElement("span");
    patternBadge.className = "badge bg-primary me-1 mb-1";
    patternBadge.textContent = patternInfo.name;
    patternBadge.title = `문법 패턴: ${grammarPatternId}`;
    tagsContainer.appendChild(patternBadge);

    // 도메인/카테고리 배지
    const domainBadge = document.createElement("span");
    domainBadge.className = "badge bg-info me-1 mb-1";
    domainBadge.textContent = `${patternInfo.domain}.${patternInfo.category}`;
    tagsContainer.appendChild(domainBadge);

    // 예문 메타데이터 배지
    if (example.metadata?.has_detailed_grammar) {
      const detailBadge = document.createElement("span");
      detailBadge.className = "badge bg-success me-1 mb-1";
      detailBadge.textContent = "상세 문법";
      tagsContainer.appendChild(detailBadge);
    }

    if (example.priority === 1) {
      const priorityBadge = document.createElement("span");
      priorityBadge.className = "badge bg-warning me-1 mb-1";
      priorityBadge.textContent = "핵심 예문";
      tagsContainer.appendChild(priorityBadge);
    }

    // 참조 기반 시스템 표시
    const systemBadge = document.createElement("span");
    systemBadge.className = "badge bg-secondary ms-2";
    systemBadge.textContent = "참조 기반";
    systemBadge.title = "향후 grammar 컬렉션에서 조회";
    tagsContainer.appendChild(systemBadge);
  }

  /**
   * 개념 차원 문법 시스템 표시 - 참조 기반 구조 대응
   */
  async displayConceptGrammarSystem(conceptGrammar) {
    const basicDesc = document.getElementById("basic-grammar-desc");
    const detailedDesc = document.getElementById("detailed-grammar-desc");

    if (conceptGrammar.type === "pattern_references") {
      // 새로운 참조 기반 구조
      const patternIds = conceptGrammar.pattern_ids;

      // 기본 설명
      const patternNames = patternIds
        .map((id) => this.inferPatternInfoFromId(id).name)
        .join(", ");

      basicDesc.textContent = `문법 패턴: ${patternNames}`;

      // 상세 설명
      detailedDesc.textContent = `참조된 패턴 ${patternIds.length}개 (향후 grammar 컬렉션에서 조회)`;

      // 참조 패턴 태그 표시
      this.displayPatternReferenceTags(patternIds);
    } else if (conceptGrammar.type === "concept_level") {
      // 기존 구조 (호환성)
      const unified = conceptGrammar.grammar_system;

      let basicText = "";
      if (unified.word_level) {
        basicText = `${unified.word_level.primary_pos} (${unified.word_level.semantic_field})`;
      }

      let detailedText = "";
      if (unified.usage_patterns && unified.usage_patterns.length > 0) {
        const patterns = unified.usage_patterns
          .map((p) => p.pattern_id)
          .join(", ");
        detailedText = `사용 패턴: ${patterns}`;
      }

      basicDesc.textContent = basicText;
      detailedDesc.textContent = detailedText;

      this.displayConceptGrammarTags(unified);
    } else if (conceptGrammar.type === "pattern_based") {
      // 레거시 구조
      this.displayPatternBasedGrammar(conceptGrammar.patterns);
    }
  }

  /**
   * 패턴 참조 태그 표시
   */
  displayPatternReferenceTags(patternIds) {
    const tagsContainer = document.getElementById("grammar-tags-display");
    tagsContainer.innerHTML = "";

    patternIds.forEach((patternId) => {
      const patternInfo = this.inferPatternInfoFromId(patternId);

      const badge = document.createElement("span");
      badge.className = "badge bg-primary me-1 mb-1";
      badge.textContent = `${patternInfo.domain}.${patternInfo.category}`;
      badge.title = `패턴: ${patternInfo.name} (ID: ${patternId})`;
      tagsContainer.appendChild(badge);
    });

    // 참조 시스템 표시
    const refBadge = document.createElement("span");
    refBadge.className = "badge bg-info ms-2";
    refBadge.textContent = "패턴 참조";
    refBadge.title = "향후 분리된 grammar 컬렉션 참조";
    tagsContainer.appendChild(refBadge);
  }

  /**
   * 향상된 단어 문법 정보 생성 - 참조 정보 포함
   */
  generateEnhancedWordGrammar(expression) {
    const pos = expression.part_of_speech || "unknown";
    const level = expression.level || "beginner";
    const domain = this.currentConcept.concept_info?.domain || "";
    const category = this.currentConcept.concept_info?.category || "";
    const conceptId = this.currentConcept.concept_info?.concept_id || "";

    // 의미 영역 분석
    const semanticField = this.analyzeSemanticField(
      domain,
      category,
      expression
    );

    // 문법적 특성 추론
    const grammaticalFeatures = this.inferGrammaticalFeatures(expression, pos);

    // 사용 맥락 추론
    const usageContexts = this.inferUsageContexts(domain, category, expression);

    // 참조 정보 포함
    const references = this.currentConcept.references || {};

    return {
      basic_description: `${pos} (${level} 수준) - ${semanticField}`,
      detailed_description: `${domain} 영역의 ${category} 관련 ${pos}, ${grammaticalFeatures.join(
        ", "
      )}`,
      tags: [
        pos,
        `level:${level}`,
        `domain:${domain}`,
        `category:${category}`,
        ...grammaticalFeatures,
        ...usageContexts,
      ],
      difficulty: this.estimateBasicDifficulty(expression),
      focus_points: [
        `${pos} 학습`,
        "기본 어휘",
        "발음 연습",
        ...this.generateContextualFocusPoints(domain, category),
      ],
      inferred_patterns: this.generateInferredPatterns(
        expression,
        domain,
        category
      ),

      // 참조 정보 추가
      references: {
        concept_id: conceptId,
        available_examples: references.core_examples?.length || 0,
        grammar_patterns: references.grammar_patterns?.length || 0,
        quiz_templates: references.quiz_templates?.length || 0,
        game_types: references.game_types?.length || 0,
      },
    };
  }

  /**
   * 의미 영역 분석
   */
  analyzeSemanticField(domain, category, expression) {
    const semanticMap = {
      "food.fruit": "과일류",
      "food.vegetable": "채소류",
      "daily.greeting": "인사말",
      "daily.time": "시간 표현",
      "travel.transportation": "교통수단",
      "education.subject": "학과목",
    };

    const key = `${domain}.${category}`;
    return semanticMap[key] || `${domain} 분야`;
  }

  /**
   * 문법적 특성 추론
   */
  inferGrammaticalFeatures(expression, pos) {
    const features = [];

    if (pos === "noun" || pos === "명사") {
      features.push("countable"); // 기본적으로 가산명사로 가정

      // 단어 특성으로 문법 특성 추론
      if (expression.word && expression.word.length > 6) {
        features.push("complex_form");
      }
    } else if (pos === "verb" || pos === "동사") {
      features.push("action_verb");
    } else if (pos === "interjection" || pos === "감탄사") {
      features.push("social_expression");
    }

    return features;
  }

  /**
   * 사용 맥락 추론
   */
  inferUsageContexts(domain, category, expression) {
    const contexts = [];

    if (domain === "daily") {
      contexts.push("everyday_usage");
    } else if (domain === "food") {
      contexts.push("dining_context", "shopping_context");
    } else if (domain === "travel") {
      contexts.push("travel_context");
    }

    return contexts;
  }

  /**
   * 맥락적 학습 포인트 생성
   */
  generateContextualFocusPoints(domain, category) {
    const contextualPoints = {
      food: ["요리 관련 표현", "식사 매너"],
      daily: ["일상 회화", "예의 표현"],
      travel: ["여행 필수 표현", "교통 이용법"],
      education: ["학습 관련 어휘", "학교생활"],
    };

    return contextualPoints[domain] || ["맥락별 활용"];
  }

  /**
   * 추론된 패턴 생성
   */
  generateInferredPatterns(expression, domain, category) {
    const patterns = [];

    // 도메인별 기본 패턴
    if (domain === "food") {
      patterns.push({
        pattern: "[음식]을/를 먹다",
        example: `${expression.word}을/를 먹다`,
        context: "consumption",
      });
    } else if (domain === "daily" && category === "greeting") {
      patterns.push({
        pattern: "[인사] + [후속 표현]",
        example: `${expression.word}, 만나서 반갑습니다`,
        context: "social_interaction",
      });
    }

    return patterns;
  }

  /**
   * 향상된 단어 문법 표시
   */
  displayEnhancedWordGrammar(enhancedGrammar) {
    // 자연어 설명
    const basicDesc = document.getElementById("basic-grammar-desc");
    const detailedDesc = document.getElementById("detailed-grammar-desc");

    basicDesc.textContent = enhancedGrammar.basic_description;
    detailedDesc.textContent = enhancedGrammar.detailed_description;

    // 향상된 태그
    const tagsContainer = document.getElementById("grammar-tags-display");
    tagsContainer.innerHTML = "";

    enhancedGrammar.tags.forEach((tag) => {
      const badge = document.createElement("span");
      badge.className = "badge bg-secondary me-1 mb-1";
      badge.textContent = this.translateGrammarTag(tag);
      tagsContainer.appendChild(badge);
    });

    // 레벨 표시
    const levelBadge = document.createElement("span");
    levelBadge.className = "badge bg-light text-dark ms-2";
    levelBadge.textContent = "단어 기반";
    tagsContainer.appendChild(levelBadge);

    // 기본 메타데이터
    this.displaySimpleMetadata(enhancedGrammar.difficulty);

    // 향상된 학습 포인트
    const practiceList = document.getElementById("practice-list");
    practiceList.innerHTML = "";

    enhancedGrammar.focus_points.forEach((point) => {
      const span = document.createElement("span");
      span.className = "badge bg-light text-dark me-1";
      span.textContent = point;
      practiceList.appendChild(span);
    });

    // 추론된 패턴 표시 (있는 경우)
    if (enhancedGrammar.inferred_patterns?.length > 0) {
      const patternTitle = document.createElement("div");
      patternTitle.className = "mt-2 mb-1 small text-muted";
      patternTitle.textContent = "추론된 사용 패턴:";
      practiceList.appendChild(patternTitle);

      enhancedGrammar.inferred_patterns.forEach((pattern) => {
        const span = document.createElement("span");
        span.className = "badge bg-outline-primary me-1";
        span.textContent = pattern.example;
        span.title = pattern.context;
        practiceList.appendChild(span);
      });
    }
  }

  /**
   * 관련 정보 업데이트
   */
  async updateRelatedInfo() {
    const expression = this.currentConcept.expressions[this.currentLanguage];
    if (!expression) return;

    // 동의어
    const synonymsList = document.getElementById("synonyms-list");
    synonymsList.innerHTML = "";
    (expression.synonyms || []).forEach((synonym) => {
      const span = document.createElement("span");
      span.className = "badge bg-light text-dark me-1";
      span.textContent = synonym;
      synonymsList.appendChild(span);
    });

    // 연어
    const collocationsList = document.getElementById("collocations-list");
    collocationsList.innerHTML = "";
    (expression.collocations || []).forEach((collocation) => {
      const div = document.createElement("div");
      div.className = "mb-1";
      div.innerHTML = `
        <span class="text-primary">${collocation.phrase}</span>
        <small class="text-muted ms-2">(${collocation.frequency})</small>
      `;
      collocationsList.appendChild(div);
    });
  }

  /**
   * 문법 설명 번역 (대상 언어 → UI 언어) - 확장된 번역 시스템
   */
  async translateGrammarDescription(description, fromLang, toLang) {
    if (fromLang === toLang) return description;

    // 확장된 번역 매핑 - 더 포괄적인 번역 지원
    const translations = {
      korean_to_english: {
        // 기본 문법 설명
        "정중한 인사말입니다.": "It is a polite greeting.",
        "명사입니다.": "It is a noun.",
        "동사입니다.": "It is a verb.",
        "형용사입니다.": "It is an adjective.",
        "감탄사입니다.": "It is an interjection.",
        "부사입니다.": "It is an adverb.",

        // 음식/과일 관련
        "둥근 모양의 단 과일": "Round-shaped sweet fruit",
        "음식 분야의 과일 명사입니다.":
          "It is a fruit noun in the food category.",
        "과일 카테고리": "Fruit category",
        "건강한 간식": "Healthy snack",

        // 인사/일상 관련
        "일반적인 인사말입니다.": "It is a common greeting.",
        "기본적인 인사말": "Basic greeting",
        "만날 때 사용": "Used when meeting",
        "정중한 표현": "Polite expression",
        "첫 만남 상황": "First meeting situation",

        // 문법적 특성
        가산명사: "Countable noun",
        불가산명사: "Uncountable noun",
        현재시제: "Present tense",
        과거시제: "Past tense",
        높임말: "Honorific language",
        존댓말: "Respectful language",
        해요체: "Haeyo polite form",
        합니다체: "Hamnida formal form",

        // 품사별 설명
        "과일 명사": "Fruit noun",
        "음식 명사": "Food noun",
        "인사 감탄사": "Greeting interjection",
        "일상 표현": "Daily expression",

        // 문맥적 설명
        "일상에서 자주 먹는 건강한 과일":
          "Healthy fruit commonly eaten in daily life",
        "상대방에게 예의를 갖춘 인사를 할 때 사용하는 존댓말 표현입니다.":
          "Respectful expression used when greeting someone politely.",
        "해요체로 되어 있어 일상적이면서도 정중합니다.":
          "Uses haeyo form which is both casual and polite.",

        // 학습 관련
        "초급 수준": "Beginner level",
        "중급 수준": "Intermediate level",
        "고급 수준": "Advanced level",
        "기본 단어": "Basic word",
        "필수 표현": "Essential expression",
      },

      english_to_korean: {
        // 기본 문법 설명
        "It is a common greeting.": "일반적인 인사말입니다.",
        "It is a noun.": "명사입니다.",
        "It is a verb.": "동사입니다.",
        "It is an adjective.": "형용사입니다.",
        "It is an interjection.": "감탄사입니다.",
        "It is an adverb.": "부사입니다.",

        // 음식/과일 관련
        "Round-shaped sweet fruit": "둥근 모양의 단 과일",
        "It is a countable noun for fruit.": "과일에 대한 가산명사입니다.",
        "Common healthy snack fruit": "흔한 건강 간식 과일",
        "Fruit category": "과일 카테고리",
        "Basic fruit noun": "기본 과일 명사",

        // 인사/일상 관련
        "Basic greeting": "기본 인사말",
        "Most common English greeting": "가장 흔한 영어 인사말",
        "Universal greeting": "범용 인사말",
        "Standard greeting": "표준 인사말",
        "Polite expression": "정중한 표현",

        // 문법적 특성
        "Countable noun": "가산명사",
        "Uncountable noun": "불가산명사",
        "Present tense": "현재시제",
        "Past tense": "과거시제",
        "Simple present": "단순 현재",

        // 품사별 설명
        "Fruit noun": "과일 명사",
        "Food noun": "음식 명사",
        "Greeting interjection": "인사 감탄사",
        "Daily expression": "일상 표현",

        // 문맥적 설명
        "A common fruit that is round and sweet": "둥글고 단 흔한 과일",
        "A versatile greeting used in both formal and informal situations":
          "공식적, 비공식적 상황 모두에서 사용되는 다재다능한 인사말",
        "suitable for any situation": "어떤 상황에든 적합한",

        // 학습 관련
        "Beginner level": "초급 수준",
        "Intermediate level": "중급 수준",
        "Advanced level": "고급 수준",
        "Basic word": "기본 단어",
        "Essential expression": "필수 표현",
      },

      japanese_to_korean: {
        // 기본 문법 설명
        "一般的な挨拶です。": "일반적인 인사말입니다.",
        "名詞です。": "명사입니다.",
        "動詞です。": "동사입니다.",
        "形容詞です。": "형용사입니다.",
        "感動詞です。": "감탄사입니다.",
        "副詞です。": "부사입니다.",

        // 음식/과일 관련
        "果物の名詞です。": "과일 명사입니다.",
        丸くて甘い果物: "둥글고 단 과일",
        基本的な果物の名詞: "기본적인 과일 명사",
        果物カテゴリ: "과일 카테고리",

        // 인사/일상 관련
        昼間の挨拶: "낮 인사",
        基本的な挨拶: "기본적인 인사",
        日本語の基本的な挨拶: "일본어의 기본적인 인사",
        丁寧な挨拶: "정중한 인사",

        // 문법적 특성
        丁寧語: "정중어",
        尊敬語: "존경어",
        謙譲語: "겸양어",
        ひらがな: "히라가나",
        カタカナ: "가타카나",
        漢字: "한자",

        // 문맥적 설명
        昼間に使用される最も一般的な挨拶表현:
          "낮에 사용되는 가장 일반적인 인사 표현",
        丁寧で親しみやすい印象: "정중하고 친근한 인상",
        日常でよく食べる健康な果物: "일상에서 자주 먹는 건강한 과일",

        // 학습 관련
        初級: "초급",
        中級: "중급",
        上級: "고급",
        基本: "기본",
        重要: "중요",
      },

      chinese_to_korean: {
        // 기본 문법 설명
        "这是常用的问候语。": "자주 사용되는 인사말입니다.",
        "这是名词。": "명사입니다.",
        "这是动词。": "동사입니다.",
        "这是形容词。": "형용사입니다.",
        "这是叹词。": "감탄사입니다.",
        "这是副词。": "부사입니다.",

        // 음식/과일 관련
        "这是水果类名词。": "과일류 명사입니다.",
        圆形的甜美水果: "둥근 달콤한 과일",
        基本水果名词: "기본 과일 명사",
        水果类别: "과일 범주",

        // 인사/일상 관련
        见面时的礼貌问候语: "만날 때의 정중한 인사말",
        中文最基本的问候语: "중국어의 가장 기본적인 인사말",
        基础问候: "기초 인사",
        标准问候语: "표준 인사말",

        // 문법적 특성
        声调: "성조",
        拼音: "병음",
        简体: "간체",
        繁体: "번체",
        量词: "양사",

        // 문맥적 설명
        最基本和常用的中文问候语: "가장 기본적이고 흔한 중국어 인사말",
        适用于各种场合: "다양한 상황에 적용 가능",
        表达友好和礼貌: "친근함과 예의를 표현",
        常吃的水果之一: "자주 먹는 과일 중 하나",

        // 학습 관련
        初级: "초급",
        中级: "중급",
        高级: "고급",
        基本: "기본",
        重要: "중요",
      },

      korean_to_japanese: {
        // 기본 문법 설명
        "정중한 인사말입니다.": "丁寧な挨拶です。",
        "명사입니다.": "名詞です。",
        "동사입니다.": "動詞です。",
        "형용사입니다.": "形容詞です。",
        "감탄사입니다.": "感動詞です。",

        // 음식/과일 관련
        "음식 분야의 과일 명사입니다.": "食べ物分野の果物名詞です。",
        "둥근 모양의 단 과일": "丸い形の甘い果物",
        "과일 카테고리": "果物カテゴリー",

        // 인사/일상 관련
        "기본적인 인사말": "基本的な挨拶",
        "일반적인 인사말": "一般的な挨拶",
        "정중한 표현": "丁寧な表現",
      },

      korean_to_chinese: {
        // 기본 문법 설명
        "정중한 인사말입니다.": "这是礼貌的问候语。",
        "명사입니다.": "这是名词。",
        "동사입니다.": "这是动词。",
        "형용사입니다.": "这是形容词。",
        "감탄사입니다.": "这是叹词。",

        // 음식/과일 관련
        "음식 분야의 과일 명사입니다.": "这是食物领域的水果名词。",
        "둥근 모양의 단 과일": "圆形的甜水果",
        "과일 카테고리": "水果类别",

        // 인사/일상 관련
        "기본적인 인사말": "基本问候语",
        "일반적인 인사말": "一般问候语",
        "정중한 표현": "礼貌表达",
      },
    };

    const key = `${fromLang}_to_${toLang}`;

    // 정확한 매칭 우선
    if (translations[key]?.[description]) {
      return translations[key][description];
    }

    // 부분 매칭 시도 (키워드 기반)
    const keywords = {
      [toLang]: {
        // 한국어 키워드
        korean: {
          명사: ["noun", "名詞", "名词"],
          동사: ["verb", "動詞", "动词"],
          형용사: ["adjective", "形容詞", "形容词"],
          감탄사: ["interjection", "感動詞", "叹词"],
          부사: ["adverb", "副詞", "副词"],
          과일: ["fruit", "果物", "水果"],
          인사: ["greeting", "挨拶", "问候"],
          정중한: ["polite", "丁寧", "礼貌"],
          기본: ["basic", "基本", "基本"],
          초급: ["beginner", "初級", "初级"],
        },
        // 영어 키워드
        english: {
          noun: ["명사", "名詞", "名词"],
          verb: ["동사", "動詞", "动词"],
          adjective: ["형용사", "形容詞", "形容词"],
          interjection: ["감탄사", "感動詞", "叹词"],
          fruit: ["과일", "果物", "水果"],
          greeting: ["인사", "挨拶", "问候"],
          polite: ["정중한", "丁寧", "礼貌"],
          basic: ["기본", "基本", "基本"],
          beginner: ["초급", "初級", "初级"],
        },
        // 일본어 키워드
        japanese: {
          名詞: ["명사", "noun", "名词"],
          動詞: ["동사", "verb", "动词"],
          形容詞: ["형용사", "adjective", "形容词"],
          感動詞: ["감탄사", "interjection", "叹词"],
          果物: ["과일", "fruit", "水果"],
          挨拶: ["인사", "greeting", "问候"],
          丁寧: ["정중한", "polite", "礼貌"],
          基本: ["기본", "basic", "基本"],
          初級: ["초급", "beginner", "初级"],
        },
        // 중국어 키워드
        chinese: {
          名词: ["명사", "noun", "名詞"],
          动词: ["동사", "verb", "動詞"],
          形容词: ["형용사", "adjective", "形容詞"],
          叹词: ["감탄사", "interjection", "感動詞"],
          水果: ["과일", "fruit", "果物"],
          问候: ["인사", "greeting", "挨拶"],
          礼貌: ["정중한", "polite", "丁寧"],
          基本: ["기본", "basic", "基本"],
          初级: ["초급", "beginner", "初級"],
        },
      },
    };

    // 키워드 기반 부분 번역 시도
    if (keywords[toLang] && keywords[toLang][fromLang]) {
      const keywordMap = keywords[toLang][fromLang];
      for (const [targetWord, sourceWords] of Object.entries(keywordMap)) {
        if (sourceWords.some((source) => description.includes(source))) {
          return description.replace(
            new RegExp(sourceWords.join("|"), "g"),
            targetWord
          );
        }
      }
    }

    // 매칭되지 않으면 원본 반환
    return description;
  }

  /**
   * 문법 태그 번역 - 통합 태그 시스템 지원
   */
  translateGrammarTag(tag) {
    const translations = {
      korean: {
        // 기본 품사
        interjection: "감탄사",
        noun: "명사",
        verb: "동사",
        adjective: "형용사",
        adverb: "부사",
        preposition: "전치사",
        conjunction: "접속사",
        article: "관사",

        // 통합 문법 태그 - 정중함/격식
        "formality:casual": "반말/캐주얼",
        "formality:neutral": "중립적",
        "formality:polite": "정중함",
        "formality:formal": "격식",
        "formality:very_formal": "매우 격식",

        // 사용 맥락
        "usage_context:greeting": "인사 상황",
        "usage_context:farewell": "작별 상황",
        "usage_context:request": "요청 상황",
        "usage_context:question": "질문 상황",
        "usage_context:emotion": "감정 표현",

        // 언어 사용역
        "register:universal": "범용",
        "register:academic": "학술적",
        "register:conversational": "대화체",
        "register:business": "업무용",
        "register:literary": "문학적",

        // 감정 유형
        "emotion_type:positive": "긍정적",
        "emotion_type:negative": "부정적",
        "emotion_type:neutral": "중립적",
        "emotion_type:excitement": "흥미진진",
        "emotion_type:sadness": "슬픔",

        // 행동 유형
        "action_type:movement": "동작/이동",
        "action_type:communication": "의사소통",
        "action_type:thinking": "사고",
        "action_type:creation": "창조",

        // 추상성
        "abstract:yes": "추상적",
        "abstract:no": "구체적",

        // 복잡도
        "complexity:simple": "단순",
        "complexity:moderate": "보통",
        "complexity:complex": "복잡",
        "complexity:very_complex": "매우 복잡",

        // 빈도
        "frequency:very_high": "매우 높음",
        "frequency:high": "높음",
        "frequency:medium": "보통",
        "frequency:low": "낮음",
        "frequency:rare": "드뭄",

        // 한국어 특수 태그
        "honorific_level:plain": "평어",
        "honorific_level:polite": "정중어",
        "honorific_level:respectful": "존경어",
        "honorific_level:humble": "겸양어",
        "speech_level:haeyo": "해요체",
        "speech_level:hamnida": "합니다체",
        "speech_level:hae": "해체",
        "speech_level:haeche": "하게체",

        // 영어 특수 태그
        "countability:countable": "가산명사",
        "countability:uncountable": "불가산명사",
        "countability:both": "가산/불가산",
        "verb_pattern:transitive": "타동사",
        "verb_pattern:intransitive": "자동사",
        "verb_pattern:linking": "연결동사",

        // 일본어 특수 태그
        "writing_system:hiragana": "히라가나",
        "writing_system:katakana": "가타카나",
        "writing_system:kanji": "한자",
        "writing_system:mixed": "혼합",
        "keigo_type:sonkeigo": "존경어",
        "keigo_type:kenjougo": "겸양어",
        "keigo_type:teineigo": "정중어",
        "loan_status:native": "고유어",
        "loan_status:loanword": "외래어",

        // 중국어 특수 태그
        "tone_pattern:tone1": "1성",
        "tone_pattern:tone2": "2성",
        "tone_pattern:tone3": "3성",
        "tone_pattern:tone4": "4성",
        "tone_pattern:neutral": "경성",
        "character_type:simplified": "간체자",
        "character_type:traditional": "번체자",
        "stroke_complexity:simple": "단순한 획",
        "stroke_complexity:moderate": "보통 획",
        "stroke_complexity:complex": "복잡한 획",
      },

      english: {
        // 기본 품사
        interjection: "Interjection",
        noun: "Noun",
        verb: "Verb",
        adjective: "Adjective",
        adverb: "Adverb",
        preposition: "Preposition",
        conjunction: "Conjunction",
        article: "Article",

        // 통합 문법 태그 - 정중함/격식
        "formality:casual": "Casual",
        "formality:neutral": "Neutral",
        "formality:polite": "Polite",
        "formality:formal": "Formal",
        "formality:very_formal": "Very Formal",

        // 사용 맥락
        "usage_context:greeting": "Greeting Context",
        "usage_context:farewell": "Farewell Context",
        "usage_context:request": "Request Context",
        "usage_context:question": "Question Context",
        "usage_context:emotion": "Emotional Expression",

        // 언어 사용역
        "register:universal": "Universal",
        "register:academic": "Academic",
        "register:conversational": "Conversational",
        "register:business": "Business",
        "register:literary": "Literary",

        // 감정 유형
        "emotion_type:positive": "Positive",
        "emotion_type:negative": "Negative",
        "emotion_type:neutral": "Neutral",
        "emotion_type:excitement": "Excitement",
        "emotion_type:sadness": "Sadness",

        // 행동 유형
        "action_type:movement": "Movement",
        "action_type:communication": "Communication",
        "action_type:thinking": "Thinking",
        "action_type:creation": "Creation",

        // 추상성
        "abstract:yes": "Abstract",
        "abstract:no": "Concrete",

        // 복잡도
        "complexity:simple": "Simple",
        "complexity:moderate": "Moderate",
        "complexity:complex": "Complex",
        "complexity:very_complex": "Very Complex",

        // 빈도
        "frequency:very_high": "Very High",
        "frequency:high": "High",
        "frequency:medium": "Medium",
        "frequency:low": "Low",
        "frequency:rare": "Rare",

        // 한국어 특수 태그 (영어로 설명)
        "honorific_level:plain": "Plain Speech",
        "honorific_level:polite": "Polite Speech",
        "honorific_level:respectful": "Respectful Speech",
        "honorific_level:humble": "Humble Speech",
        "speech_level:haeyo": "Haeyo Style",
        "speech_level:hamnida": "Hamnida Style",

        // 영어 특수 태그
        "countability:countable": "Countable",
        "countability:uncountable": "Uncountable",
        "countability:both": "Both",
        "verb_pattern:transitive": "Transitive",
        "verb_pattern:intransitive": "Intransitive",
        "verb_pattern:linking": "Linking Verb",

        // 일본어 특수 태그 (영어로 설명)
        "writing_system:hiragana": "Hiragana",
        "writing_system:katakana": "Katakana",
        "writing_system:kanji": "Kanji",
        "writing_system:mixed": "Mixed",
        "keigo_type:sonkeigo": "Respectful (Sonkeigo)",
        "keigo_type:kenjougo": "Humble (Kenjougo)",
        "keigo_type:teineigo": "Polite (Teineigo)",

        // 중국어 특수 태그 (영어로 설명)
        "tone_pattern:tone1": "1st Tone",
        "tone_pattern:tone2": "2nd Tone",
        "tone_pattern:tone3": "3rd Tone",
        "tone_pattern:tone4": "4th Tone",
        "tone_pattern:neutral": "Neutral Tone",
        "character_type:simplified": "Simplified",
        "character_type:traditional": "Traditional",
      },

      japanese: {
        // 기본 품사
        interjection: "感動詞",
        noun: "名詞",
        verb: "動詞",
        adjective: "形容詞",

        // 통합 문법 태그
        "formality:polite": "丁寧",
        "formality:formal": "正式",
        "usage_context:greeting": "挨拶の文脈",
        "register:universal": "汎用",
        "register:academic": "学術的",

        // 일본어 특수 태그
        "writing_system:hiragana": "ひらがな",
        "writing_system:katakana": "カタカナ",
        "writing_system:kanji": "漢字",
        "keigo_type:sonkeigo": "尊敬語",
        "keigo_type:kenjougo": "謙譲語",
        "keigo_type:teineigo": "丁寧語",
      },

      chinese: {
        // 기본 품사
        interjection: "叹词",
        noun: "名词",
        verb: "动词",
        adjective: "形容词",

        // 통합 문법 태그
        "formality:polite": "礼貌",
        "formality:formal": "正式",
        "usage_context:greeting": "问候语境",
        "register:universal": "通用",
        "register:academic": "学术",

        // 중국어 특수 태그
        "tone_pattern:tone1": "一声",
        "tone_pattern:tone2": "二声",
        "tone_pattern:tone3": "三声",
        "tone_pattern:tone4": "四声",
        "character_type:simplified": "简体",
        "character_type:traditional": "繁体",
      },
    };

    return translations[this.uiLanguage]?.[tag] || tag;
  }

  /**
   * 품사 번역
   */
  async translatePOS(pos) {
    const translations = {
      korean: {
        noun: "명사",
        verb: "동사",
        adjective: "형용사",
        interjection: "감탄사",
      },
      english: {
        noun: "Noun",
        verb: "Verb",
        adjective: "Adjective",
        interjection: "Interjection",
      },
    };

    return translations[this.uiLanguage]?.[pos] || pos;
  }

  /**
   * 품사별 색상
   */
  getPOSColor(pos) {
    const colors = {
      noun: "bg-primary",
      verb: "bg-success",
      adjective: "bg-warning",
      adverb: "bg-info",
      interjection: "bg-secondary",
    };
    return colors[pos] || "bg-light";
  }

  /**
   * 연습 포인트 번역
   */
  translatePracticePoint(point) {
    const translations = {
      korean: {
        발음: "발음",
        "상황별 사용법": "상황별 사용법",
        "높임 표현": "높임 표현",
      },
      english: {
        발음: "Pronunciation",
        "상황별 사용법": "Usage Context",
        "높임 표현": "Honorific Expression",
      },
    };

    return translations[this.uiLanguage]?.[point] || point;
  }

  /**
   * UI 라벨 업데이트
   */
  updateUILabels() {
    document.querySelectorAll("[data-i18n]").forEach((element) => {
      const key = element.dataset.i18n;
      element.textContent = getI18nText(key, this.uiLanguage);
    });
  }

  /**
   * 퀴즈 시작
   */
  startQuiz() {
    // 퀴즈 시스템과 연동
    console.log(
      "Starting quiz for:",
      this.currentConcept,
      this.currentLanguage
    );
    this.modal.hide();
  }

  /**
   * 게임 시작
   */
  startGame() {
    // 게임 시스템과 연동
    console.log(
      "Starting game for:",
      this.currentConcept,
      this.currentLanguage
    );
    this.modal.hide();
  }
}

// 싱글톤 인스턴스
export const enhancedConceptModal = new EnhancedConceptModal();
