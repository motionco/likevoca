// admin-multilingual-content.js - 다국어 콘텐츠 관리 시스템
import { 
    collection, 
    doc, 
    getDocs, 
    getDoc, 
    setDoc, 
    addDoc,
    updateDoc, 
    deleteDoc, 
    query, 
    where, 
    orderBy, 
    limit,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

// 전역 변수
let db;
let auth;
let contentData = [];
let quillEditors = {};
let currentEditingId = null;

// 지원하는 언어 목록
const SUPPORTED_LANGUAGES = {
    ko: { name: '한국어', emoji: '🇰🇷', code: 'ko' },
    en: { name: 'English', emoji: '🇺🇸', code: 'en' },
    ja: { name: '日本語', emoji: '🇯🇵', code: 'ja' },
    zh: { name: '中文', emoji: '🇨🇳', code: 'zh' },
    es: { name: 'Español', emoji: '🇪🇸', code: 'es' }
};

// 콘텐츠 타입 정의
const CONTENT_TYPES = {
    faq: { name: 'FAQ', description: '자주 묻는 질문' },
    manual: { name: '매뉴얼', description: '사용자 매뉴얼' },
    guide: { name: '가이드', description: '학습 가이드' },
    notice: { name: '공지사항', description: '공지사항' }
};

// Firebase 초기화 완료 확인
function initializeMultilingualContentManager() {
    if (window.db && window.auth) {
        db = window.db;
        auth = window.auth;
        console.log('🌐 다국어 콘텐츠 관리 시스템 초기화 시작');
        
        // 인증 상태 확인
        auth.onAuthStateChanged((user) => {
            if (user) {
                console.log('✅ 사용자 인증됨:', user.email);
                checkAdminPermission(user.email);
            } else {
                console.log('❌ 사용자 인증되지 않음');
                window.location.href = '../pages/vocabulary.html';
            }
        });
    } else {
        console.log('⏳ Firebase 초기화 대기 중...');
        setTimeout(initializeMultilingualContentManager, 100);
    }
}

// 관리자 권한 확인
async function checkAdminPermission(userEmail) {
    try {
        console.log('🔐 관리자 권한 확인 중...');
        
        // users 컬렉션에서 사용자 정보 확인
        const userRef = doc(db, 'users', userEmail);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
            const userData = userDoc.data();
            const isAdmin = userData.role === 'admin';
            
            if (isAdmin) {
                console.log('✅ 관리자 권한 확인됨 (DB에서 확인)');
                await startMultilingualContentManager();
            } else {
                console.log('❌ 관리자 권한 없음 (role:', userData.role || 'undefined', ')');
                showAccessDenied();
            }
        } else {
            console.log('❌ 사용자 정보를 찾을 수 없음');
            showAccessDenied();
        }
    } catch (error) {
        console.error('❌ 관리자 권한 확인 중 오류:', error);
        // Firestore 접근 실패 시 fallback으로 이메일 목록 확인
        console.log('🔄 Fallback: 하드코딩된 관리자 목록으로 확인');
        const ADMIN_EMAILS = [
            'admin@likevoca.com',
            'manager@likevoca.com',
            'motioncomc@gmail.com',
        ];
        
        const isAdmin = ADMIN_EMAILS.includes(userEmail);
        
        if (isAdmin) {
            console.log('✅ 관리자 권한 확인됨 (fallback)');
            await startMultilingualContentManager();
        } else {
            console.log('❌ 관리자 권한 없음');
            showAccessDenied();
        }
    }
}

// 접근 거부 표시
function showAccessDenied() {
    document.body.innerHTML = `
        <div class="min-h-screen flex items-center justify-center bg-gray-50">
            <div class="max-w-md w-full bg-white rounded-xl p-8 text-center shadow-lg">
                <i class="fas fa-ban text-6xl text-red-500 mb-4"></i>
                <h2 class="text-2xl font-bold text-gray-900 mb-4">접근 권한이 없습니다</h2>
                <p class="text-gray-600 mb-6">관리자 권한이 필요한 페이지입니다.</p>
                <a href="../pages/vocabulary.html" class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-200">
                    메인으로 돌아가기
                </a>
            </div>
        </div>
    `;
}

// 다국어 콘텐츠 관리자 시작
async function startMultilingualContentManager() {
    console.log('🚀 다국어 콘텐츠 관리자 시작');
    
    try {
        await initializeQuillEditors();
        await loadContentData();
        updateStatistics();
        
        console.log('✅ 다국어 콘텐츠 관리자 초기화 완료');
    } catch (error) {
        console.error('❌ 다국어 콘텐츠 관리자 초기화 실패:', error);
        showError('다국어 콘텐츠 관리자 초기화에 실패했습니다.');
    }
}

// Quill 에디터 초기화
function initializeQuillEditors() {
    const languages = Object.keys(SUPPORTED_LANGUAGES);
    
    languages.forEach(lang => {
        const editorContainer = document.getElementById(`editor_${lang}`);
        if (editorContainer) {
            quillEditors[lang] = new Quill(`#editor_${lang}`, {
                theme: 'snow',
                placeholder: `콘텐츠를 ${SUPPORTED_LANGUAGES[lang].name}로 입력하세요...`,
                modules: {
                    toolbar: [
                        [{ 'header': [1, 2, 3, false] }],
                        ['bold', 'italic', 'underline', 'strike'],
                        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                        [{ 'color': [] }, { 'background': [] }],
                        ['link', 'image'],
                        ['clean']
                    ]
                }
            });
        }
    });
    
    console.log('✅ Quill 에디터 초기화 완료');
}

// 콘텐츠 데이터 로드
async function loadContentData() {
    try {
        console.log('📊 콘텐츠 데이터 로드 시작');
        showLoading();
        
        // 로컬 스토리지에서 콘텐츠 데이터 로드 시도
        const localContent = localStorage.getItem('multilingual_content');
        if (localContent) {
            contentData = JSON.parse(localContent);
            displayContentList(contentData);
            console.log(`✅ 로컬 스토리지에서 콘텐츠 데이터 로드 (${contentData.length}개)`);
        } else {
            // 기존 콘텐츠 자동 이전
            console.log('📦 로컬 스토리지에 콘텐츠가 없습니다. 기존 콘텐츠를 자동으로 가져옵니다...');
            
            try {
                // 기존 콘텐츠 이전 시도
                const migrationModule = await import('../js/content-migrator.js');
                const migrationResult = await migrationModule.initializeContentMigration();
                
                if (migrationResult && migrationResult.content && migrationResult.content.length > 0) {
                    contentData = migrationResult.content;
                    displayContentList(contentData);
                    console.log(`✅ 기존 콘텐츠 ${migrationResult.migrated}개를 성공적으로 가져왔습니다!`);
                    showSuccess(`기존 FAQ, Manual, Guide 콘텐츠 ${migrationResult.migrated}개를 성공적으로 가져왔습니다. 이제 관리자에서 편집할 수 있습니다.`);
                } else {
                    // 기존 콘텐츠도 없으면 샘플 데이터 생성
                    contentData = generateSampleData();
                    displayContentList(contentData);
                    console.log('✅ 샘플 콘텐츠 데이터 생성');
                }
            } catch (migrationError) {
                console.warn('⚠️ 기존 콘텐츠 이전 실패:', migrationError);
                // 이전 실패 시 샘플 데이터 사용
                contentData = generateSampleData();
                displayContentList(contentData);
                console.log('✅ 샘플 콘텐츠 데이터 생성 (이전 실패로 인한 폴백)');
            }
        }
        
        hideLoading();
        console.log('✅ 콘텐츠 데이터 로드 완료');
        
    } catch (error) {
        console.error('❌ 콘텐츠 데이터 로드 실패:', error);
        hideLoading();
        showError('콘텐츠 데이터를 불러오는데 실패했습니다.');
    }
}

// 커뮤니티용 샘플 데이터 생성
function generateSampleData() {
    const currentTime = new Date().toISOString();
    
    return [
        {
            id: 'community_welcome_001',
            type: 'notices',
            priority: 'high',
            createdAt: currentTime,
            updatedAt: currentTime,
            versions: {
                ko: {
                    title: 'LikeVoca 커뮤니티에 오신 것을 환영합니다!',
                    content: '<div class="prose max-w-none"><h2>🎉 LikeVoca 커뮤니티 오픈!</h2><p>언어학습에 도움이 되는 다양한 가이드와 팁을 공유하는 새로운 커뮤니티 공간이 오픈되었습니다.</p><ul><li>학습 가이드 및 전략</li><li>새로운 기능 안내</li><li>공지사항 및 업데이트</li></ul><p>여러분의 언어학습 여정에 도움이 되는 유용한 정보들을 찾아보세요!</p></div>',
                    published: true,
                    lastModified: currentTime,
                    translationStatus: 'updated'
                },
                en: {
                    title: 'Welcome to LikeVoca Community!',
                    content: '<div class="prose max-w-none"><h2>🎉 LikeVoca Community Open!</h2><p>We\'re excited to announce the opening of our new community space where you can find helpful guides and tips for language learning.</p><ul><li>Learning guides and strategies</li><li>New feature announcements</li><li>Updates and notices</li></ul><p>Find useful information to help with your language learning journey!</p></div>',
                    published: true,
                    lastModified: currentTime,
                    translationStatus: 'updated'
                },
                ja: {
                    title: 'よくある質問',
                    content: '<h2>LikeVoca よくある質問</h2><p>LikeVoca の使用に関してよくある質問をまとめました。</p>',
                    published: false,
                    lastModified: null,
                    translationStatus: 'missing'
                },
                zh: {
                    title: '常见问题',
                    content: '<h2>LikeVoca 常见问题</h2><p>关于使用 LikeVoca 的常见问题。</p>',
                    published: false,
                    lastModified: null,
                    translationStatus: 'missing'
                },
                es: {
                    title: 'Preguntas Frecuentes',
                    content: '<h2>Preguntas Frecuentes de LikeVoca</h2><p>Preguntas comunes sobre el uso de LikeVoca.</p>',
                    published: false,
                    lastModified: null,
                    translationStatus: 'missing'
                }
            }
        },
        {
            id: 'guide_effective_learning',
            type: 'guide',
            priority: 'high',
            createdAt: currentTime,
            updatedAt: currentTime,
            versions: {
                ko: {
                    title: '효과적인 단어 학습 전략',
                    content: '<div class="prose max-w-none"><h2>📚 단어 학습의 과학적 접근법</h2><p>언어학습에서 가장 중요한 것 중 하나는 어휘 학습입니다. 여기 몰라둔던 효과적인 단어 학습 전략을 소개합니다.</p><h3>🔄 간격 반복 학습법</h3><ul><li>1일 후: 첫 번째 복습</li><li>3일 후: 두 번째 복습</li><li>1주일 후: 세 번째 복습</li><li>2주일 후: 네 번째 복습</li></ul><h3>🎯 능동적 회상법</h3><p>단순히 읽기보다는 직접 생각해내는 것이 효과적입니다.</p></div>',
                    published: true,
                    lastModified: currentTime,
                    translationStatus: 'updated'
                },
                en: {
                    title: 'User Manual',
                    content: '<h2>LikeVoca User Manual</h2><p>Detailed explanation of all LikeVoca features.</p>',
                    published: true,
                    lastModified: new Date(Date.now() - 86400000).toISOString(), // 1일 전
                    translationStatus: 'outdated'
                },
                ja: {
                    title: 'ユーザーマニュアル',
                    content: null,
                    published: false,
                    lastModified: null,
                    translationStatus: 'missing'
                },
                zh: {
                    title: '用户手册',
                    content: null,
                    published: false,
                    lastModified: null,
                    translationStatus: 'missing'
                },
                es: {
                    title: 'Manual del Usuario',
                    content: null,
                    published: false,
                    lastModified: null,
                    translationStatus: 'missing'
                }
            }
        },
        {
            id: 'faq_getting_started',
            type: 'faq',
            priority: 'normal',
            createdAt: currentTime,
            updatedAt: currentTime,
            versions: {
                ko: {
                    title: 'LikeVoca를 처음 시작하는 방법은?',
                    content: '<div class="prose max-w-none"><p>LikeVoca를 처음 사용하시는 분들을 위한 간단한 가이드입니다:</p><ol><li><strong>계정 생성</strong>: 이메일로 가입하거나 Google/Facebook 소셜 로그인을 이용하세요.</li><li><strong>레벨 테스트</strong>: 간단한 어휘 테스트로 내 수준을 확인해보세요.</li><li><strong>AI 단어 추천</strong>: 내 수준에 맞는 다양한 단어들을 만나보세요.</li><li><strong>게임으로 학습</strong>: 재미있는 게임으로 단어를 익혀보세요!</li></ol></div>',
                    published: true,
                    lastModified: currentTime,
                    translationStatus: 'updated'
                },
                en: {
                    title: 'How do I get started with LikeVoca?',
                    content: '<div class="prose max-w-none"><p>Here\'s a simple guide for first-time LikeVoca users:</p><ol><li><strong>Create Account</strong>: Sign up with email or use Google/Facebook social login.</li><li><strong>Level Test</strong>: Take a simple vocabulary test to check your level.</li><li><strong>AI Word Recommendations</strong>: Discover various words matched to your level.</li><li><strong>Learn with Games</strong>: Master vocabulary through fun games!</li></ol></div>',
                    published: true,
                    lastModified: currentTime,
                    translationStatus: 'updated'
                },
                ja: {
                    title: null,
                    content: null,
                    published: false,
                    lastModified: null,
                    translationStatus: 'missing'
                },
                zh: {
                    title: null,
                    content: null,
                    published: false,
                    lastModified: null,
                    translationStatus: 'missing'
                },
                es: {
                    title: null,
                    content: null,
                    published: false,
                    lastModified: null,
                    translationStatus: 'missing'
                }
            }
        }
    ];
}

// 콘텐츠 목록 표시
function displayContentList(data) {
    const container = document.getElementById('contentList');
    
    if (data.length === 0) {
        container.innerHTML = `
            <div class="text-center py-12">
                <i class="fas fa-file-alt text-6xl text-gray-300 mb-4"></i>
                <h3 class="text-lg font-medium text-gray-900 mb-2">콘텐츠가 없습니다</h3>
                <p class="text-gray-600 mb-4">새로운 콘텐츠를 작성해보세요.</p>
                <button onclick="showCreateModal()" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200">
                    <i class="fas fa-plus mr-2"></i>새 콘텐츠 작성
                </button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = data.map(content => {
        const koVersion = content.versions.ko || {};
        const publishedCount = Object.values(content.versions).filter(v => v.published).length;
        const totalVersions = Object.keys(content.versions).length;
        const translationNeededCount = Object.values(content.versions).filter(v => v.translationStatus === 'missing' || v.translationStatus === 'outdated').length;
        
        return `
            <div class="content-card bg-white border border-gray-200 rounded-lg p-6">
                <div class="flex items-start justify-between">
                    <div class="flex-1">
                        <div class="flex items-center space-x-3 mb-2">
                            <span class="content-type-badge type-${content.type}">
                                ${CONTENT_TYPES[content.type]?.name || content.type}
                            </span>
                            <span class="status-badge ${content.priority === 'urgent' ? 'bg-red-100 text-red-800' : content.priority === 'high' ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-800'}">
                                ${content.priority === 'urgent' ? '긴급' : content.priority === 'high' ? '높음' : '일반'}
                            </span>
                        </div>
                        
                        <h3 class="text-lg font-semibold text-gray-900 mb-2">
                            ${koVersion.title || '제목 없음'}
                        </h3>
                        
                        <div class="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                            <span><i class="fas fa-calendar mr-1"></i>생성: ${formatDate(content.createdAt)}</span>
                            <span><i class="fas fa-edit mr-1"></i>수정: ${formatDate(content.updatedAt)}</span>
                        </div>
                        
                        <!-- 언어별 상태 -->
                        <div class="space-y-2">
                            <div class="flex items-center justify-between">
                                <span class="text-sm font-medium text-gray-700">언어별 상태:</span>
                                <span class="text-sm text-gray-600">${publishedCount}/${totalVersions} 게시중</span>
                            </div>
                            <div class="flex flex-wrap gap-2">
                                ${Object.entries(content.versions).map(([lang, version]) => {
                                    const langInfo = SUPPORTED_LANGUAGES[lang];
                                    let statusClass = 'translation-missing';
                                    let statusText = '번역 필요';
                                    
                                    if (version.content && version.published) {
                                        statusClass = 'translation-updated';
                                        statusText = '게시중';
                                    } else if (version.content && !version.published) {
                                        statusClass = 'translation-outdated';
                                        statusText = '초안';
                                    }
                                    
                                    return `
                                        <div class="flex items-center space-x-1">
                                            <span class="language-badge lang-${lang}">${langInfo.emoji} ${langInfo.code.toUpperCase()}</span>
                                            <span class="translation-badge ${statusClass}">${statusText}</span>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        </div>
                        
                        ${translationNeededCount > 0 ? `
                            <div class="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
                                <i class="fas fa-exclamation-triangle text-yellow-600 mr-1"></i>
                                <span class="text-yellow-800">${translationNeededCount}개 언어의 번역이 필요합니다.</span>
                            </div>
                        ` : ''}
                    </div>
                    
                    <div class="flex space-x-2 ml-4">
                        <button onclick="editContent('${content.id}')" class="text-blue-600 hover:text-blue-800">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="duplicateContent('${content.id}')" class="text-green-600 hover:text-green-800">
                            <i class="fas fa-copy"></i>
                        </button>
                        <button onclick="deleteContent('${content.id}')" class="text-red-600 hover:text-red-800">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// 통계 업데이트
function updateStatistics() {
    const total = contentData.length;
    const published = contentData.reduce((count, content) => {
        return count + Object.values(content.versions).filter(v => v.published).length;
    }, 0);
    const translationNeeded = contentData.reduce((count, content) => {
        return count + Object.values(content.versions).filter(v => v.translationStatus === 'missing' || v.translationStatus === 'outdated').length;
    }, 0);
    
    document.getElementById('totalContent').textContent = total;
    document.getElementById('publishedContent').textContent = published;
    document.getElementById('translationNeeded').textContent = translationNeeded;
}

// 작성 방식 토글
function toggleCreationMode() {
    const mode = document.querySelector('input[name="creationMode"]:checked').value;
    const autoTranslateSettings = document.getElementById('autoTranslateSettings');
    const autoTranslateSection = document.getElementById('autoTranslateSection');
    
    if (mode === 'auto_translate') {
        autoTranslateSettings.classList.remove('hidden');
        autoTranslateSection.classList.remove('hidden');
    } else {
        autoTranslateSettings.classList.add('hidden');
        autoTranslateSection.classList.add('hidden');
    }
}

// 언어 탭 전환
function switchLanguageTab(language) {
    // 모든 탭 비활성화
    document.querySelectorAll('.language-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // 모든 콘텐츠 숨김
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // 선택된 탭 활성화
    document.querySelector(`[data-lang="${language}"]`).classList.add('active');
    document.querySelector(`.tab-content[data-lang="${language}"]`).classList.add('active');
}

// 자동 번역 실행
async function performAutoTranslation() {
    try {
        const sourceLanguage = document.getElementById('sourceLanguage').value;
        const targetLanguages = Array.from(document.querySelectorAll('input[name="targetLanguages"]:checked')).map(input => input.value);
        
        const sourceTitle = document.getElementById(`title_${sourceLanguage}`).value;
        const sourceContent = quillEditors[sourceLanguage].root.innerHTML;
        
        if (!sourceTitle || !sourceContent) {
            showError('원본 언어의 제목과 내용을 먼저 입력해주세요.');
            return;
        }
        
        showSuccess('자동 번역을 시작합니다...');
        
        // 실제 환경에서는 Google Translate API 또는 다른 번역 서비스 사용
        // 여기서는 시뮬레이션
        for (const targetLang of targetLanguages) {
            const translatedTitle = await simulateTranslation(sourceTitle, sourceLanguage, targetLang);
            const translatedContent = await simulateTranslation(sourceContent, sourceLanguage, targetLang);
            
            document.getElementById(`title_${targetLang}`).value = translatedTitle;
            quillEditors[targetLang].root.innerHTML = translatedContent;
        }
        
        showSuccess('자동 번역이 완료되었습니다. 번역 결과를 검토하고 필요시 수정해주세요.');
        
    } catch (error) {
        console.error('자동 번역 실패:', error);
        showError('자동 번역에 실패했습니다.');
    }
}

// 번역 시뮬레이션 (실제로는 Google Translate API 등 사용)
async function simulateTranslation(text, fromLang, toLang) {
    // 간단한 시뮬레이션 - 실제로는 번역 API 호출
    const translations = {
        ko: {
            en: { '자주 묻는 질문': 'Frequently Asked Questions', '사용자 매뉴얼': 'User Manual' },
            ja: { '자주 묻는 질문': 'よくある質問', '사용자 매뉴얼': 'ユーザーマニュアル' },
            zh: { '자주 묻는 질문': '常见问题', '사용자 매뉴얼': '用户手册' },
            es: { '자주 묻는 질문': 'Preguntas Frecuentes', '사용자 매뉴얼': 'Manual del Usuario' }
        }
    };
    
    await new Promise(resolve => setTimeout(resolve, 1000)); // 번역 지연 시뮬레이션
    
    const translationMap = translations[fromLang]?.[toLang];
    if (translationMap && translationMap[text]) {
        return translationMap[text];
    }
    
    return `[${toLang.toUpperCase()}] ${text}`;
}

// 콘텐츠 저장
async function saveContent() {
    try {
        const contentType = document.getElementById('contentType').value;
        const priority = document.getElementById('priority').value;
        const currentTime = new Date().toISOString();
        
        const contentId = currentEditingId || `${contentType}_${Date.now()}`;
        const isEditing = currentEditingId !== null;
        
        // 언어별 데이터 수집
        const versions = {};
        Object.keys(SUPPORTED_LANGUAGES).forEach(lang => {
            const title = document.getElementById(`title_${lang}`).value.trim();
            const content = quillEditors[lang].root.innerHTML;
            const published = document.getElementById(`published_${lang}`).checked;
            
            if (title || content !== '<p><br></p>') {
                versions[lang] = {
                    title: title || '',
                    content: content,
                    published: published,
                    lastModified: currentTime,
                    translationStatus: 'updated'
                };
            }
        });
        
        if (Object.keys(versions).length === 0) {
            showError('최소 하나의 언어로 콘텐츠를 작성해주세요.');
            return;
        }
        
        const contentItem = {
            id: contentId,
            type: contentType,
            priority: priority,
            createdAt: isEditing ? (contentData.find(c => c.id === contentId)?.createdAt || currentTime) : currentTime,
            updatedAt: currentTime,
            versions: versions
        };
        
        // 로컬 스토리지에 저장
        if (isEditing) {
            const index = contentData.findIndex(c => c.id === contentId);
            if (index >= 0) {
                contentData[index] = contentItem;
            }
        } else {
            contentData.unshift(contentItem);
        }
        
        localStorage.setItem('multilingual_content', JSON.stringify(contentData));
        
        // Firestore 백업 시도
        try {
            const contentRef = doc(db, 'admin_content', contentId);
            await setDoc(contentRef, {
                type: 'multilingual_content',
                data: contentItem,
                createdAt: new Date()
            });
            console.log('✅ Firestore에 콘텐츠 백업 저장 완료');
        } catch (firestoreError) {
            console.warn('⚠️ Firestore 백업 실패 (로컬 저장은 성공):', firestoreError.message);
        }
        
        displayContentList(contentData);
        updateStatistics();
        closeModal();
        showSuccess(isEditing ? '콘텐츠가 수정되었습니다.' : '새 콘텐츠가 생성되었습니다.');
        
    } catch (error) {
        console.error('콘텐츠 저장 실패:', error);
        showError('콘텐츠 저장에 실패했습니다.');
    }
}

// 콘텐츠 편집
function editContent(contentId) {
    const content = contentData.find(c => c.id === contentId);
    if (!content) {
        showError('콘텐츠를 찾을 수 없습니다.');
        return;
    }
    
    currentEditingId = contentId;
    
    // 모달 제목 변경
    document.getElementById('modalTitle').textContent = '콘텐츠 편집';
    
    // 기본 정보 설정
    document.getElementById('contentType').value = content.type;
    document.getElementById('priority').value = content.priority;
    
    // 언어별 데이터 설정
    Object.keys(SUPPORTED_LANGUAGES).forEach(lang => {
        const version = content.versions[lang];
        if (version) {
            document.getElementById(`title_${lang}`).value = version.title || '';
            quillEditors[lang].root.innerHTML = version.content || '';
            document.getElementById(`published_${lang}`).checked = version.published || false;
            document.getElementById(`status_${lang}`).textContent = version.published ? '게시됨' : '초안';
        } else {
            document.getElementById(`title_${lang}`).value = '';
            quillEditors[lang].root.innerHTML = '';
            document.getElementById(`published_${lang}`).checked = false;
            document.getElementById(`status_${lang}`).textContent = '초안';
        }
    });
    
    showModal();
}

// 콘텐츠 복제
function duplicateContent(contentId) {
    const content = contentData.find(c => c.id === contentId);
    if (!content) {
        showError('콘텐츠를 찾을 수 없습니다.');
        return;
    }
    
    currentEditingId = null;
    
    // 모달 제목 변경
    document.getElementById('modalTitle').textContent = '콘텐츠 복제';
    
    // 기본 정보 설정
    document.getElementById('contentType').value = content.type;
    document.getElementById('priority').value = content.priority;
    
    // 언어별 데이터 설정 (복제)
    Object.keys(SUPPORTED_LANGUAGES).forEach(lang => {
        const version = content.versions[lang];
        if (version) {
            document.getElementById(`title_${lang}`).value = `[복사] ${version.title || ''}`;
            quillEditors[lang].root.innerHTML = version.content || '';
            document.getElementById(`published_${lang}`).checked = false; // 복제 시 게시 해제
            document.getElementById(`status_${lang}`).textContent = '초안';
        }
    });
    
    showModal();
}

// 콘텐츠 삭제
async function deleteContent(contentId) {
    const content = contentData.find(c => c.id === contentId);
    if (!content) {
        showError('콘텐츠를 찾을 수 없습니다.');
        return;
    }
    
    const koVersion = content.versions.ko || {};
    if (confirm(`"${koVersion.title || '제목 없음'}" 콘텐츠를 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`)) {
        try {
            // 로컬 데이터에서 제거
            contentData = contentData.filter(c => c.id !== contentId);
            localStorage.setItem('multilingual_content', JSON.stringify(contentData));
            
            displayContentList(contentData);
            updateStatistics();
            showSuccess('콘텐츠가 삭제되었습니다.');
            
        } catch (error) {
            console.error('콘텐츠 삭제 실패:', error);
            showError('콘텐츠 삭제에 실패했습니다.');
        }
    }
}

// 필터링
function filterContent() {
    const typeFilter = document.getElementById('contentTypeFilter').value;
    const langFilter = document.getElementById('languageFilter').value;
    const statusFilter = document.getElementById('statusFilter').value;
    const translationFilter = document.getElementById('translationFilter').value;
    
    let filteredData = [...contentData];
    
    // 타입 필터
    if (typeFilter !== 'all') {
        filteredData = filteredData.filter(content => content.type === typeFilter);
    }
    
    // 언어 필터
    if (langFilter !== 'all') {
        filteredData = filteredData.filter(content => {
            const version = content.versions[langFilter];
            return version && version.content;
        });
    }
    
    // 상태 필터
    if (statusFilter !== 'all') {
        filteredData = filteredData.filter(content => {
            const hasStatus = Object.values(content.versions).some(version => {
                if (statusFilter === 'published') return version.published;
                if (statusFilter === 'draft') return !version.published && version.content;
                if (statusFilter === 'archived') return false; // 추후 구현
                return true;
            });
            return hasStatus;
        });
    }
    
    // 번역 상태 필터
    if (translationFilter !== 'all') {
        filteredData = filteredData.filter(content => {
            const hasTranslationStatus = Object.values(content.versions).some(version => {
                return version.translationStatus === translationFilter;
            });
            return hasTranslationStatus;
        });
    }
    
    displayContentList(filteredData);
}

// 모달 관리
function showCreateModal() {
    currentEditingId = null;
    document.getElementById('modalTitle').textContent = '새 콘텐츠 작성';
    
    // 폼 초기화
    document.getElementById('contentType').value = 'faq';
    document.getElementById('priority').value = 'normal';
    
    // 작성 방식 초기화
    document.querySelector('input[name="creationMode"][value="individual"]').checked = true;
    toggleCreationMode();
    
    // 언어별 입력 필드 초기화
    Object.keys(SUPPORTED_LANGUAGES).forEach(lang => {
        document.getElementById(`title_${lang}`).value = '';
        quillEditors[lang].root.innerHTML = '';
        document.getElementById(`published_${lang}`).checked = false;
        document.getElementById(`status_${lang}`).textContent = '초안';
    });
    
    showModal();
}

function showModal() {
    document.getElementById('contentModal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    document.getElementById('contentModal').classList.add('hidden');
    document.body.style.overflow = 'auto';
    currentEditingId = null;
}

// 콘텐츠 새로고침
async function refreshContent() {
    await loadContentData();
    updateStatistics();
    showSuccess('콘텐츠 목록이 새로고침되었습니다.');
}

// 유틸리티 함수들
function showLoading() {
    document.getElementById('loadingSpinner').classList.remove('hidden');
}

function hideLoading() {
    document.getElementById('loadingSpinner').classList.add('hidden');
}

function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function showSuccess(message) {
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    toast.innerHTML = `<i class="fas fa-check mr-2"></i>${message}`;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

function showError(message) {
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    toast.innerHTML = `<i class="fas fa-exclamation-triangle mr-2"></i>${message}`;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 5000);
}

// 전역 함수 노출
window.showCreateModal = showCreateModal;
window.closeModal = closeModal;
window.refreshContent = refreshContent;
window.filterContent = filterContent;
window.editContent = editContent;
window.duplicateContent = duplicateContent;
window.deleteContent = deleteContent;
window.switchLanguageTab = switchLanguageTab;
window.toggleCreationMode = toggleCreationMode;
window.performAutoTranslation = performAutoTranslation;
window.saveContent = saveContent;

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', initializeMultilingualContentManager);

console.log('🌐 admin-multilingual-content.js 로드 완료');