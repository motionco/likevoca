// content-integration.js - 기존 페이지와 관리자 콘텐츠 시스템 연동
export class ContentIntegration {
    constructor() {
        this.contentCache = new Map();
        this.language = this.detectLanguage();
        this.contentData = [];
    }

    // 언어 감지 (URL 경로 기반)
    detectLanguage() {
        const path = window.location.pathname;
        const langMatch = path.match(/\/locales\/([a-z]{2})\//);
        return langMatch ? langMatch[1] : 'ko';
    }

    // 콘텐츠 데이터 로드
    async loadContentData() {
        try {
            // 로컬 스토리지에서 다국어 콘텐츠 데이터 로드
            const localContent = localStorage.getItem('multilingual_content');
            if (localContent) {
                this.contentData = JSON.parse(localContent);
                console.log(`✅ 다국어 콘텐츠 데이터 로드 완료 (${this.contentData.length}개)`);
                return this.contentData;
            }

            // 데이터가 없으면 빈 배열 반환
            console.log('⚠️ 콘텐츠 데이터가 없습니다. 관리자에서 콘텐츠를 먼저 생성해주세요.');
            return [];

        } catch (error) {
            console.error('❌ 콘텐츠 데이터 로드 실패:', error);
            return [];
        }
    }

    // 특정 타입의 콘텐츠 가져오기
    getContentByType(type) {
        return this.contentData
            .filter(content => content.type === type)
            .map(content => {
                const version = content.versions[this.language];
                if (version && version.published && version.content) {
                    return {
                        id: content.id,
                        title: version.title,
                        content: version.content,
                        type: content.type,
                        priority: content.priority,
                        createdAt: content.createdAt,
                        updatedAt: content.updatedAt,
                        lastModified: version.lastModified
                    };
                }
                return null;
            })
            .filter(content => content !== null)
            .sort((a, b) => {
                // 우선순위 정렬: urgent > high > normal
                const priorityOrder = { urgent: 3, high: 2, normal: 1 };
                const aPriority = priorityOrder[a.priority] || 1;
                const bPriority = priorityOrder[b.priority] || 1;
                
                if (aPriority !== bPriority) {
                    return bPriority - aPriority;
                }
                
                // 우선순위가 같으면 최신순
                return new Date(b.updatedAt) - new Date(a.updatedAt);
            });
    }

    // FAQ 페이지 콘텐츠 렌더링
    renderFAQContent(container) {
        const faqContent = this.getContentByType('faq');
        
        if (faqContent.length === 0) {
            this.renderEmptyState(container, 'FAQ');
            return;
        }

        // FAQ 항목들을 파싱하여 렌더링
        let faqHTML = '';
        
        faqContent.forEach(content => {
            const faqItems = this.parseFAQContent(content.content);
            faqItems.forEach((item, index) => {
                const itemId = `${content.id}_${index}`;
                faqHTML += this.createFAQItem(item, itemId);
            });
        });

        container.innerHTML = faqHTML;
    }

    // FAQ 콘텐츠 파싱 (HTML에서 질문-답변 추출)
    parseFAQContent(htmlContent) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlContent, 'text/html');
        const faqItems = [];

        // H3 태그를 질문으로, 다음 요소들을 답변으로 처리
        const questions = doc.querySelectorAll('h3');
        
        questions.forEach(questionEl => {
            const question = questionEl.textContent.trim();
            let answerHTML = '';
            let nextElement = questionEl.nextElementSibling;
            
            // 다음 h3가 나올 때까지의 모든 요소를 답변으로 수집
            while (nextElement && nextElement.tagName !== 'H3') {
                answerHTML += nextElement.outerHTML;
                nextElement = nextElement.nextElementSibling;
            }
            
            if (question && answerHTML) {
                faqItems.push({
                    question: question,
                    answer: answerHTML,
                    category: this.determineFAQCategory(question)
                });
            }
        });

        // 만약 H3 구조가 없다면 기본 FAQ로 처리
        if (faqItems.length === 0) {
            faqItems.push({
                question: 'LikeVoca 사용법',
                answer: htmlContent,
                category: 'general'
            });
        }

        return faqItems;
    }

    // FAQ 카테고리 결정
    determineFAQCategory(question) {
        const questionLower = question.toLowerCase();
        
        if (questionLower.includes('계정') || questionLower.includes('가입') || questionLower.includes('로그인')) {
            return 'account';
        }
        if (questionLower.includes('학습') || questionLower.includes('단어') || questionLower.includes('ai')) {
            return 'learning';
        }
        if (questionLower.includes('오류') || questionLower.includes('문제') || questionLower.includes('버그')) {
            return 'technical';
        }
        if (questionLower.includes('개인정보') || questionLower.includes('보안') || questionLower.includes('프라이버시')) {
            return 'privacy';
        }
        
        return 'general';
    }

    // FAQ 항목 HTML 생성
    createFAQItem(item, itemId) {
        return `
            <div class="faq-item bg-white rounded-lg shadow-md" data-category="${item.category}">
                <button class="w-full text-left p-6 focus:outline-none" onclick="toggleFAQ('${itemId}')">
                    <div class="flex justify-between items-center">
                        <h3 class="font-semibold text-lg text-gray-800">${item.question}</h3>
                        <i class="fas fa-chevron-down text-gray-500 transform transition-transform" id="arrow-${itemId}"></i>
                    </div>
                </button>
                <div class="hidden px-6 pb-6 text-gray-600" id="answer-${itemId}">
                    ${item.answer}
                </div>
            </div>
        `;
    }

    // 매뉴얼 페이지 콘텐츠 렌더링
    renderManualContent(container) {
        const manualContent = this.getContentByType('manual');
        
        if (manualContent.length === 0) {
            this.renderEmptyState(container, '매뉴얼');
            return;
        }

        let manualHTML = '<div class="space-y-8">';
        
        manualContent.forEach(content => {
            manualHTML += `
                <section class="bg-white rounded-lg shadow-sm p-6">
                    <h2 class="text-2xl font-bold text-gray-900 mb-4">${content.title}</h2>
                    <div class="prose prose-lg max-w-none">
                        ${content.content}
                    </div>
                    <div class="mt-6 text-sm text-gray-500">
                        <i class="fas fa-calendar mr-2"></i>
                        마지막 업데이트: ${this.formatDate(content.lastModified)}
                    </div>
                </section>
            `;
        });
        
        manualHTML += '</div>';
        container.innerHTML = manualHTML;
    }

    // 가이드 페이지 콘텐츠 렌더링
    renderGuideContent(container) {
        const guideContent = this.getContentByType('guide');
        
        if (guideContent.length === 0) {
            this.renderEmptyState(container, '가이드');
            return;
        }

        let guideHTML = '<div class="space-y-8">';
        
        guideContent.forEach(content => {
            guideHTML += `
                <section class="bg-white rounded-lg shadow-sm p-6">
                    <h2 class="text-2xl font-bold text-gray-900 mb-4">${content.title}</h2>
                    <div class="prose prose-lg max-w-none">
                        ${content.content}
                    </div>
                    <div class="mt-6 text-sm text-gray-500">
                        <i class="fas fa-calendar mr-2"></i>
                        작성일: ${this.formatDate(content.createdAt)}
                        ${content.lastModified !== content.createdAt ? ` • 수정일: ${this.formatDate(content.lastModified)}` : ''}
                    </div>
                </section>
            `;
        });
        
        guideHTML += '</div>';
        container.innerHTML = guideHTML;
    }

    // 빈 상태 렌더링
    renderEmptyState(container, contentType) {
        container.innerHTML = `
            <div class="text-center py-12">
                <i class="fas fa-file-alt text-6xl text-gray-300 mb-6"></i>
                <h3 class="text-xl font-semibold text-gray-700 mb-2">아직 ${contentType} 콘텐츠가 없습니다</h3>
                <p class="text-gray-500 mb-6">관리자가 콘텐츠를 준비 중입니다. 잠시 후 다시 확인해주세요.</p>
                <div class="flex justify-center space-x-4">
                    <a href="../faq.html" class="text-blue-600 hover:text-blue-800 underline">FAQ 보기</a>
                    <a href="../manual.html" class="text-blue-600 hover:text-blue-800 underline">매뉴얼 보기</a>
                    <a href="../guide.html" class="text-blue-600 hover:text-blue-800 underline">가이드 보기</a>
                </div>
            </div>
        `;
    }

    // 날짜 포맷팅
    formatDate(dateString) {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString(this.language === 'ko' ? 'ko-KR' : 'en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    // 페이지별 콘텐츠 초기화
    async initializePage(pageType) {
        try {
            console.log(`🔄 ${pageType} 페이지 콘텐츠 초기화 시작`);
            
            await this.loadContentData();
            
            const container = document.getElementById('dynamic-content-container');
            if (!container) {
                console.warn('⚠️ dynamic-content-container를 찾을 수 없습니다.');
                return;
            }

            switch (pageType) {
                case 'faq':
                    this.renderFAQContent(container);
                    break;
                case 'manual':
                    this.renderManualContent(container);
                    break;
                case 'guide':
                    this.renderGuideContent(container);
                    break;
                default:
                    console.warn(`⚠️ 알 수 없는 페이지 타입: ${pageType}`);
            }

            console.log(`✅ ${pageType} 페이지 콘텐츠 초기화 완료`);
            
        } catch (error) {
            console.error(`❌ ${pageType} 페이지 초기화 실패:`, error);
            
            // 오류 시 기본 메시지 표시
            const container = document.getElementById('dynamic-content-container');
            if (container) {
                container.innerHTML = `
                    <div class="text-center py-12">
                        <i class="fas fa-exclamation-triangle text-6xl text-red-300 mb-6"></i>
                        <h3 class="text-xl font-semibold text-gray-700 mb-2">콘텐츠 로드 중 오류가 발생했습니다</h3>
                        <p class="text-gray-500 mb-6">페이지를 새로고침하거나 관리자에게 문의해주세요.</p>
                        <button onclick="location.reload()" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200">
                            페이지 새로고침
                        </button>
                    </div>
                `;
            }
        }
    }

    // FAQ 토글 함수 (전역으로 노출)
    static toggleFAQ(id) {
        const answer = document.getElementById(`answer-${id}`);
        const arrow = document.getElementById(`arrow-${id}`);
        
        if (answer && arrow) {
            answer.classList.toggle('hidden');
            arrow.classList.toggle('rotate-180');
        }
    }

    // FAQ 필터 함수 (전역으로 노출)
    static filterFAQ(category) {
        const faqItems = document.querySelectorAll('.faq-item');
        const filterButtons = document.querySelectorAll('.faq-filter-btn');
        
        // 모든 필터 버튼 스타일 초기화
        filterButtons.forEach(btn => {
            btn.classList.remove('bg-[#4B63AC]', 'text-white');
            btn.classList.add('bg-gray-200', 'text-gray-700');
        });
        
        // 선택된 필터 버튼 스타일 적용
        event.target.classList.remove('bg-gray-200', 'text-gray-700');
        event.target.classList.add('bg-[#4B63AC]', 'text-white');
        
        // FAQ 항목 필터링
        faqItems.forEach(item => {
            if (category === 'all' || item.dataset.category === category) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    }
}

// 전역 함수 노출
window.toggleFAQ = ContentIntegration.toggleFAQ;
window.filterFAQ = ContentIntegration.filterFAQ;

console.log('🔗 content-integration.js 로드 완료');