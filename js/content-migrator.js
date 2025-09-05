// content-migrator.js - 기존 정적 콘텐츠를 관리자 시스템으로 이전하는 도구

export class ContentMigrator {
    constructor() {
        this.migratedContent = [];
    }

    // 기존 FAQ 콘텐츠를 추출하여 관리자 형식으로 변환
    extractFAQContent() {
        const faqContent = [
            {
                id: 'faq_account_001',
                type: 'faq',
                priority: 'high',
                category: 'account',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                versions: {
                    ko: {
                        title: '계정은 어떻게 만드나요?',
                        content: `<p>LikeVoca에 가입하는 방법은 두 가지입니다:</p>
                        <ul>
                            <li><strong>이메일 가입:</strong> 이메일 주소와 비밀번호를 입력하여 직접 계정을 생성할 수 있습니다.</li>
                            <li><strong>소셜 로그인:</strong> Google, Facebook, Apple 계정으로 간편하게 가입할 수 있습니다.</li>
                        </ul>
                        <p>가입 후 이메일 인증을 완료하면 모든 기능을 이용하실 수 있습니다.</p>`,
                        published: true,
                        translationStatus: 'updated'
                    },
                    en: {
                        title: 'How do I create an account?',
                        content: `<p>There are two ways to sign up for LikeVoca:</p>
                        <ul>
                            <li><strong>Email signup:</strong> You can create an account directly by entering your email address and password.</li>
                            <li><strong>Social login:</strong> You can easily sign up with your Google, Facebook, or Apple account.</li>
                        </ul>
                        <p>After signing up, you can use all features once you complete email verification.</p>`,
                        published: true,
                        translationStatus: 'updated'
                    }
                }
            },
            {
                id: 'faq_account_002',
                type: 'faq',
                priority: 'medium',
                category: 'account',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                versions: {
                    ko: {
                        title: 'OAuth 가입과 이메일 가입의 차이점은 무엇인가요?',
                        content: `<div class="overflow-x-auto">
                            <table class="w-full border-collapse border border-gray-300">
                                <thead>
                                    <tr class="bg-gray-50">
                                        <th class="border border-gray-300 px-4 py-2 text-left">구분</th>
                                        <th class="border border-gray-300 px-4 py-2 text-left">OAuth 가입</th>
                                        <th class="border border-gray-300 px-4 py-2 text-left">이메일 가입</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td class="border border-gray-300 px-4 py-2 font-semibold">편의성</td>
                                        <td class="border border-gray-300 px-4 py-2">기존 계정으로 즉시 로그인</td>
                                        <td class="border border-gray-300 px-4 py-2">별도 비밀번호 설정 필요</td>
                                    </tr>
                                    <tr>
                                        <td class="border border-gray-300 px-4 py-2 font-semibold">보안</td>
                                        <td class="border border-gray-300 px-4 py-2">각 플랫폼의 보안 정책 적용</td>
                                        <td class="border border-gray-300 px-4 py-2">개인이 직접 보안 관리</td>
                                    </tr>
                                    <tr>
                                        <td class="border border-gray-300 px-4 py-2 font-semibold">프라이버시</td>
                                        <td class="border border-gray-300 px-4 py-2">최소한의 정보만 공유</td>
                                        <td class="border border-gray-300 px-4 py-2">완전한 개인정보 통제</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>`,
                        published: true,
                        translationStatus: 'updated'
                    }
                }
            },
            {
                id: 'faq_account_003',
                type: 'faq',
                priority: 'high',
                category: 'account',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                versions: {
                    ko: {
                        title: '비밀번호를 잊어버렸을 때는 어떻게 하나요?',
                        content: `<p>비밀번호 재설정 방법:</p>
                        <ol>
                            <li>로그인 페이지에서 "비밀번호를 잊으셨나요?" 링크를 클릭합니다.</li>
                            <li>가입한 이메일 주소를 입력합니다.</li>
                            <li>이메일로 전송된 재설정 링크를 클릭합니다.</li>
                            <li>새로운 비밀번호를 설정합니다.</li>
                        </ol>
                        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p><i class="fas fa-info-circle text-blue-500 mr-2"></i>
                            재설정 링크는 24시간 동안만 유효하며, 이메일이 오지 않으면 스팸함을 확인해주세요.</p>
                        </div>`,
                        published: true,
                        translationStatus: 'updated'
                    }
                }
            },
            {
                id: 'faq_learning_001',
                type: 'faq',
                priority: 'high',
                category: 'learning',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                versions: {
                    ko: {
                        title: 'AI 단어 기능은 어떻게 작동하나요?',
                        content: `<p>AI 단어 기능은 다음과 같이 작동합니다:</p>
                        <div class="grid md:grid-cols-2 gap-6">
                            <div class="bg-blue-50 rounded-lg p-4">
                                <h4 class="font-semibold text-gray-800 mb-3">
                                    <i class="fas fa-brain text-blue-600 mr-2"></i>개인화 분석
                                </h4>
                                <ul class="space-y-1">
                                    <li>• 현재 어휘 수준 분석</li>
                                    <li>• 학습 목표 파악</li>
                                    <li>• 관심 분야 고려</li>
                                    <li>• 학습 패턴 분석</li>
                                </ul>
                            </div>
                            <div class="bg-green-50 rounded-lg p-4">
                                <h4 class="font-semibold text-gray-800 mb-3">
                                    <i class="fas fa-magic text-green-600 mr-2"></i>스마트 추천
                                </h4>
                                <ul class="space-y-1">
                                    <li>• 최적 난이도 단어 선별</li>
                                    <li>• 실용적 활용도 우선</li>
                                    <li>• 점진적 난이도 상승</li>
                                    <li>• 사용자 기반 단어 추천</li>
                                </ul>
                            </div>
                        </div>`,
                        published: true,
                        translationStatus: 'updated'
                    }
                }
            },
            {
                id: 'faq_learning_002',
                type: 'faq',
                priority: 'medium',
                category: 'learning',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                versions: {
                    ko: {
                        title: '나만의 단어장은 어떻게 만드나요?',
                        content: `<p>개인 단어장 생성 방법:</p>
                        <ol>
                            <li>메인 대시보드에서 "나만의 단어장" 버튼을 클릭합니다.</li>
                            <li>단어장 이름과 설명을 입력합니다.</li>
                            <li>학습하고 싶은 단어를 직접 추가하거나 AI 추천을 받습니다.</li>
                            <li>각 단어의 의미, 예문, 발음을 확인하고 수정할 수 있습니다.</li>
                            <li>카테고리별로 정리하여 체계적으로 관리할 수 있습니다.</li>
                        </ol>
                        <div class="bg-green-50 border border-green-200 rounded-lg p-4">
                            <p><i class="fas fa-lightbulb text-green-500 mr-2"></i>
                            개인 단어장을 생성하여 체계적으로 단어를 관리할 수 있습니다.</p>
                        </div>`,
                        published: true,
                        translationStatus: 'updated'
                    }
                }
            },
            {
                id: 'faq_technical_001',
                type: 'faq',
                priority: 'medium',
                category: 'technical',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                versions: {
                    ko: {
                        title: '어떤 브라우저에서 사용할 수 있나요?',
                        content: `<p>LikeVoca는 다음 브라우저에서 최적으로 작동합니다:</p>
                        <div class="grid md:grid-cols-2 gap-6">
                            <div>
                                <h4 class="font-semibold text-gray-800 mb-3">
                                    <i class="fas fa-check-circle text-green-500 mr-2"></i>권장 브라우저
                                </h4>
                                <ul class="space-y-2">
                                    <li>• Chrome 90 이상</li>
                                    <li>• Firefox 88 이상</li>
                                    <li>• Safari 14 이상</li>
                                    <li>• Edge 90 이상</li>
                                </ul>
                            </div>
                            <div>
                                <h4 class="font-semibold text-gray-800 mb-3">
                                    <i class="fas fa-mobile-alt text-blue-600 mr-2"></i>모바일 지원
                                </h4>
                                <ul class="space-y-2">
                                    <li>• iOS Safari</li>
                                    <li>• Android Chrome</li>
                                    <li>• Samsung Internet</li>
                                    <li>• 반응형 웹 디자인</li>
                                </ul>
                            </div>
                        </div>
                        <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                            <p><i class="fas fa-exclamation-triangle text-yellow-500 mr-2"></i>
                            Internet Explorer는 지원하지 않습니다. 최신 브라우저 사용을 권장합니다.</p>
                        </div>`,
                        published: true,
                        translationStatus: 'updated'
                    }
                }
            }
        ];

        return faqContent;
    }

    // 기존 Manual 콘텐츠를 추출하여 관리자 형식으로 변환
    extractManualContent() {
        const manualContent = [
            {
                id: 'manual_getting_started_001',
                type: 'manual',
                priority: 'high',
                category: 'getting-started',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                versions: {
                    ko: {
                        title: '시작하기',
                        content: `<div class="prose max-w-none">
                            <p>LikeVoca는 AI 기반의 개인 맞춤형 언어학습 플랫폼입니다. Firebase 저장소를 통한 실시간 데이터 동기화와 반응형 웹디자인으로 언제 어디서나 효율적인 학습이 가능합니다.</p>
                            
                            <h3>주요 기능</h3>
                            <ul>
                                <li><strong>AI 단어 추천:</strong> 개인의 학습 수준과 목표에 맞는 최적화된 단어 제공</li>
                                <li><strong>개인 단어장:</strong> 나만의 학습 콘텐츠 관리</li>
                                <li><strong>퀴즈 모드:</strong> 게임화된 학습으로 재미있게 공부</li>
                                <li><strong>진도 추적:</strong> 상세한 학습 통계와 성취도 분석</li>
                            </ul>
                        </div>`,
                        published: true,
                        translationStatus: 'updated'
                    }
                }
            },
            {
                id: 'manual_account_management_001',
                type: 'manual',
                priority: 'high',
                category: 'account',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                versions: {
                    ko: {
                        title: '계정 관리',
                        content: `<div class="prose max-w-none">
                            <h3>회원가입 및 로그인</h3>
                            <p>LikeVoca는 여러 방법으로 가입하고 로그인할 수 있습니다:</p>
                            
                            <h4>이메일 가입</h4>
                            <ol>
                                <li>메인 페이지에서 "회원가입" 버튼 클릭</li>
                                <li>이메일 주소와 비밀번호 입력</li>
                                <li>이메일 인증 완료</li>
                                <li>프로필 정보 설정</li>
                            </ol>
                            
                            <h4>소셜 로그인</h4>
                            <ul>
                                <li><strong>Google 계정:</strong> Google OAuth를 통한 간편 로그인</li>
                                <li><strong>Facebook 계정:</strong> Facebook 계정으로 빠른 가입</li>
                                <li><strong>Apple 계정:</strong> Apple ID로 안전한 로그인</li>
                            </ul>
                            
                            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <p><i class="fas fa-info-circle text-blue-500 mr-2"></i>
                                소셜 로그인 시에도 개인정보는 최소한만 수집되며, 언제든지 계정을 연동 해제할 수 있습니다.</p>
                            </div>
                        </div>`,
                        published: true,
                        translationStatus: 'updated'
                    }
                }
            },
            {
                id: 'manual_learning_features_001',
                type: 'manual',
                priority: 'high',
                category: 'learning',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                versions: {
                    ko: {
                        title: '학습 기능 활용',
                        content: `<div class="prose max-w-none">
                            <h3>AI 단어 학습</h3>
                            <p>개인의 학습 패턴을 분석하여 최적화된 단어를 추천합니다.</p>
                            
                            <h4>학습 과정</h4>
                            <ol>
                                <li><strong>레벨 테스트:</strong> 현재 어휘 수준을 파악합니다</li>
                                <li><strong>목표 설정:</strong> 학습 목표와 관심 분야를 선택합니다</li>
                                <li><strong>단어 추천:</strong> AI가 맞춤형 단어를 제공합니다</li>
                                <li><strong>학습 진행:</strong> 다양한 방식으로 단어를 익힙니다</li>
                                <li><strong>복습 시스템:</strong> 잊기 전에 자동으로 복습을 제안합니다</li>
                            </ol>
                            
                            <h3>개인 단어장</h3>
                            <p>나만의 단어장을 만들어 체계적으로 관리할 수 있습니다.</p>
                            
                            <h4>단어장 관리 기능</h4>
                            <ul>
                                <li><strong>카테고리 분류:</strong> 주제별, 난이도별 정리</li>
                                <li><strong>태그 시스템:</strong> 자유로운 태그 추가로 검색 향상</li>
                                <li><strong>우선순위 설정:</strong> 중요한 단어 우선 학습</li>
                                <li><strong>메모 기능:</strong> 개인적인 학습 노트 추가</li>
                            </ul>
                        </div>`,
                        published: true,
                        translationStatus: 'updated'
                    }
                }
            }
        ];

        return manualContent;
    }

    // 기존 Guide 콘텐츠를 추출하여 관리자 형식으로 변환
    extractGuideContent() {
        const guideContent = [
            {
                id: 'guide_learning_strategies_001',
                type: 'guide',
                priority: 'high',
                category: 'learning-strategies',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                versions: {
                    ko: {
                        title: '효과적인 언어학습 전략',
                        content: `<div class="prose max-w-none">
                            <p>언어학습은 올바른 전략과 꾸준한 노력이 필요합니다. LikeVoca의 AI 기반 학습 시스템과 함께 다음 전략들을 활용해보세요.</p>
                            
                            <h3>1. 스페이스 리피티션 (Spaced Repetition)</h3>
                            <p>망각곡선을 고려한 과학적 복습 방법입니다:</p>
                            <ul>
                                <li><strong>1일 후:</strong> 첫 번째 복습</li>
                                <li><strong>3일 후:</strong> 두 번째 복습</li>
                                <li><strong>1주일 후:</strong> 세 번째 복습</li>
                                <li><strong>2주일 후:</strong> 네 번째 복습</li>
                                <li><strong>1개월 후:</strong> 장기 기억으로 전환</li>
                            </ul>
                            
                            <h3>2. 액티브 리콜 (Active Recall)</h3>
                            <p>수동적인 읽기보다는 능동적인 기억하기가 더 효과적입니다:</p>
                            <ul>
                                <li>단어를 보고 의미 떠올리기</li>
                                <li>의미를 보고 단어 생각하기</li>
                                <li>예문 만들어보기</li>
                                <li>동의어, 반의어 연상하기</li>
                            </ul>
                        </div>`,
                        published: true,
                        translationStatus: 'updated'
                    }
                }
            },
            {
                id: 'guide_study_planning_001',
                type: 'guide',
                priority: 'high',
                category: 'study-planning',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                versions: {
                    ko: {
                        title: '학습 계획 수립 가이드',
                        content: `<div class="prose max-w-none">
                            <h3>SMART 목표 설정</h3>
                            <p>효과적인 학습을 위해 구체적이고 측정 가능한 목표를 세워보세요:</p>
                            
                            <div class="grid md:grid-cols-2 gap-6">
                                <div class="bg-blue-50 rounded-lg p-4">
                                    <h4 class="font-semibold text-gray-800 mb-3">단기 목표 (1-3개월)</h4>
                                    <ul class="space-y-2">
                                        <li>• 매일 20개 신규 단어 학습</li>
                                        <li>• 주간 복습 테스트 90% 이상</li>
                                        <li>• 월간 어휘력 테스트 점수 향상</li>
                                    </ul>
                                </div>
                                <div class="bg-green-50 rounded-lg p-4">
                                    <h4 class="font-semibold text-gray-800 mb-3">장기 목표 (6개월-1년)</h4>
                                    <ul class="space-y-2">
                                        <li>• TOEIC, TEPS 등 공인시험 목표 점수 달성</li>
                                        <li>• 특정 분야 전문 어휘 마스터</li>
                                        <li>• 일상 회화 수준 어휘력 확보</li>
                                    </ul>
                                </div>
                            </div>
                            
                            <h3>일일 학습 루틴</h3>
                            <p>꾸준한 학습을 위한 권장 루틴입니다:</p>
                            
                            <div class="bg-gray-50 rounded-lg p-4">
                                <h4 class="font-semibold mb-3">📅 일일 학습 스케줄</h4>
                                <ol class="space-y-2">
                                    <li><strong>아침 (10분):</strong> 전날 학습한 단어 복습</li>
                                    <li><strong>점심 (15분):</strong> 새로운 단어 20개 학습</li>
                                    <li><strong>저녁 (10분):</strong> 오늘 학습한 내용 정리</li>
                                    <li><strong>취침 전 (5분):</strong> 주요 단어 재확인</li>
                                </ol>
                            </div>
                        </div>`,
                        published: true,
                        translationStatus: 'updated'
                    }
                }
            },
            {
                id: 'guide_advanced_features_001',
                type: 'guide',
                priority: 'medium',
                category: 'advanced-features',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                versions: {
                    ko: {
                        title: '고급 기능 활용법',
                        content: `<div class="prose max-w-none">
                            <h3>AI 분석 결과 활용하기</h3>
                            <p>LikeVoca의 AI 분석 기능을 최대한 활용하여 학습 효율을 높이세요:</p>
                            
                            <h4>학습 패턴 분석</h4>
                            <ul>
                                <li><strong>취약 영역 식별:</strong> 자주 틀리는 단어 유형 파악</li>
                                <li><strong>학습 시간 최적화:</strong> 집중력이 높은 시간대 찾기</li>
                                <li><strong>복습 주기 조정:</strong> 개인별 최적 복습 간격 설정</li>
                            </ul>
                            
                            <h3>커스터마이징 옵션</h3>
                            <div class="grid md:grid-cols-2 gap-6">
                                <div>
                                    <h4 class="font-semibold text-gray-800 mb-3">학습 설정</h4>
                                    <ul class="space-y-2">
                                        <li>• 일일 목표 단어 수 조정</li>
                                        <li>• 난이도 수준 설정</li>
                                        <li>• 관심 분야 우선순위</li>
                                        <li>• 알림 시간 설정</li>
                                    </ul>
                                </div>
                                <div>
                                    <h4 class="font-semibold text-gray-800 mb-3">인터페이스 설정</h4>
                                    <ul class="space-y-2">
                                        <li>• 다크 모드 전환</li>
                                        <li>• 폰트 크기 조정</li>
                                        <li>• 언어 설정 변경</li>
                                        <li>• 접근성 옵션 활성화</li>
                                    </ul>
                                </div>
                            </div>
                        </div>`,
                        published: true,
                        translationStatus: 'updated'
                    }
                }
            }
        ];

        return guideContent;
    }

    // 모든 기존 콘텐츠를 localStorage에 저장
    async migrateAllContent() {
        try {
            const existingContent = JSON.parse(localStorage.getItem('multilingual_content') || '[]');
            
            // 기존 콘텐츠 추출
            const faqContent = this.extractFAQContent();
            const manualContent = this.extractManualContent();  
            const guideContent = this.extractGuideContent();
            
            // 모든 콘텐츠 합치기
            const allContent = [...faqContent, ...manualContent, ...guideContent];
            
            // 중복 제거 (ID 기준)
            const existingIds = new Set(existingContent.map(item => item.id));
            const newContent = allContent.filter(item => !existingIds.has(item.id));
            
            // 기존 콘텐츠와 새 콘텐츠 병합
            const mergedContent = [...existingContent, ...newContent];
            
            // localStorage에 저장
            localStorage.setItem('multilingual_content', JSON.stringify(mergedContent));
            
            console.log(`✅ 총 ${newContent.length}개의 기존 콘텐츠를 관리자 시스템으로 이전했습니다.`);
            console.log(`📊 전체 콘텐츠 수: ${mergedContent.length}개`);
            
            return {
                migrated: newContent.length,
                total: mergedContent.length,
                content: mergedContent
            };
            
        } catch (error) {
            console.error('❌ 콘텐츠 이전 실패:', error);
            throw error;
        }
    }

    // 특정 타입의 콘텐츠만 이전
    async migrateContentByType(contentType) {
        try {
            let contentToMigrate = [];
            
            switch (contentType) {
                case 'faq':
                    contentToMigrate = this.extractFAQContent();
                    break;
                case 'manual':
                    contentToMigrate = this.extractManualContent();
                    break;
                case 'guide':
                    contentToMigrate = this.extractGuideContent();
                    break;
                default:
                    throw new Error(`지원하지 않는 콘텐츠 타입: ${contentType}`);
            }
            
            const existingContent = JSON.parse(localStorage.getItem('multilingual_content') || '[]');
            const existingIds = new Set(existingContent.map(item => item.id));
            const newContent = contentToMigrate.filter(item => !existingIds.has(item.id));
            
            if (newContent.length > 0) {
                const mergedContent = [...existingContent, ...newContent];
                localStorage.setItem('multilingual_content', JSON.stringify(mergedContent));
                console.log(`✅ ${contentType} 콘텐츠 ${newContent.length}개를 이전했습니다.`);
            } else {
                console.log(`ℹ️ ${contentType} 콘텐츠는 이미 이전되었습니다.`);
            }
            
            return newContent.length;
            
        } catch (error) {
            console.error(`❌ ${contentType} 콘텐츠 이전 실패:`, error);
            throw error;
        }
    }
}

// 즉시 실행하여 기존 콘텐츠를 관리자 시스템으로 이전
export async function initializeContentMigration() {
    const migrator = new ContentMigrator();
    
    try {
        const result = await migrator.migrateAllContent();
        
        // 이전 완료 메시지 표시
        if (result.migrated > 0) {
            console.log(`🚀 콘텐츠 이전 완료!`);
            console.log(`   - FAQ: ${migrator.extractFAQContent().length}개`);
            console.log(`   - Manual: ${migrator.extractManualContent().length}개`);
            console.log(`   - Guide: ${migrator.extractGuideContent().length}개`);
            console.log(`   - 총 ${result.total}개 콘텐츠가 관리자 시스템에서 관리됩니다.`);
        }
        
        return result;
        
    } catch (error) {
        console.error('❌ 콘텐츠 이전 초기화 실패:', error);
        return null;
    }
}

console.log('📦 content-migrator.js 로드 완료');