// admin-content.js - 다국어 콘텐츠 관리 시스템
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

// 콘텐츠 번역 전용 모듈 import
import { translateContentWithGemini } from './admin-content-translation.js';

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

// 로딩 상태 업데이트 함수
function updateLoadingStatus(message, progress = null) {
    const statusElement = document.getElementById('loading-status');
    const progressElement = document.getElementById('loading-progress');
    
    if (statusElement) {
        statusElement.textContent = message;
    }
    
    if (progress !== null && progressElement) {
        progressElement.style.width = `${progress}%`;
    }
}

// 로딩 화면 숨기기
function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.style.opacity = '0';
        loadingScreen.style.transition = 'opacity 0.5s ease-out';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    }
}

// Firebase 초기화 완료 확인
function initializeMultilingualContentManager() {
    if (window.db && window.auth) {
        db = window.db;
        auth = window.auth;
        updateLoadingStatus('사용자 인증 확인 중...', 30);
        
        // 인증 상태 확인
        auth.onAuthStateChanged((user) => {
            if (user) {
                updateLoadingStatus('관리자 권한 확인 중...', 60);
                checkAdminPermission(user.email);
            } else {
                updateLoadingStatus('로그인이 필요합니다. 로그인 페이지로 이동 중...', 100);
                setTimeout(() => {
                    window.location.href = '../pages/vocabulary.html';
                }, 2000);
            }
        });
    } else {
        updateLoadingStatus('Firebase 초기화 대기 중...', 10);
        setTimeout(initializeMultilingualContentManager, 100);
    }
}

// 관리자 권한 확인 (배포 환경 최적화)
async function checkAdminPermission(userEmail) {
    // 관리자 이메일 목록 (배포 환경에서 빠른 확인을 위해)
    const ADMIN_EMAILS = [
        'admin@likevoca.com',
        'manager@likevoca.com',
        'motioncomc@gmail.com',
    ];
    
    
    // 먼저 하드코딩된 목록으로 빠른 확인
    const isAdminByEmail = ADMIN_EMAILS.includes(userEmail);
    
    if (isAdminByEmail) {
        updateLoadingStatus('시스템 초기화 중...', 90);
        await startMultilingualContentManager();
        return;
    }
    
    // Firestore에서 추가 확인 (타임아웃 적용)
    try {
        
        const { doc, getDoc } = await import("https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js");
        const userRef = doc(window.db, 'users', userEmail);
        
        // 3초 타임아웃 적용
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Firestore 접근 타임아웃')), 3000)
        );
        
        const userDoc = await Promise.race([
            getDoc(userRef),
            timeoutPromise
        ]);
        
        if (userDoc.exists()) {
            const userData = userDoc.data();
            const isAdmin = userData.role === 'admin';
            
            if (isAdmin) {
                updateLoadingStatus('시스템 초기화 중...', 90);
                await startMultilingualContentManager();
                return;
            }
        }
        
        showAccessDenied();
        
    } catch (error) {
        console.error('❌ Firestore 권한 확인 실패:', error);
        showAccessDenied();
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
    
    try {
        updateLoadingStatus('에디터 초기화 중...', 95);
        await initializeQuillEditors();
        
        updateLoadingStatus('콘텐츠 데이터 로딩 중...', 98);
        await loadContentData();
        updateStatistics();
        
        updateLoadingStatus('초기화 완료!', 100);
        
        // 로딩 화면 숨기기
        setTimeout(hideLoadingScreen, 500);
        
    } catch (error) {
        console.error('❌ 다국어 콘텐츠 관리자 초기화 실패:', error);
        updateLoadingStatus('초기화 실패: ' + error.message, 100);
        setTimeout(() => {
            showError('다국어 콘텐츠 관리자 초기화에 실패했습니다.');
            hideLoadingScreen();
        }, 2000);
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
            
            // 이미지 업로드 핸들러 설정
            setupImageHandler(quillEditors[lang], lang);
        }
    });
    
}

// Firebase Storage 이미지 업로드 핸들러
function setupImageHandler(quill, language) {
    const toolbar = quill.getModule('toolbar');
    toolbar.addHandler('image', () => {
        selectLocalImage(quill, language);
    });
}

function selectLocalImage(quill, language) {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = () => {
        const file = input.files[0];
        if (file) {
            uploadImageToFirebaseStorage(file, quill, language);
        }
    };
}

async function uploadImageToFirebaseStorage(file, quill, language) {
    try {
        // 로딩 표시
        const range = quill.getSelection();
        quill.insertText(range.index, '이미지 업로드 중...', { color: '#999' });
        
        // Firebase Storage import
        const { ref, uploadBytes, getDownloadURL } = await import("https://www.gstatic.com/firebasejs/11.2.0/firebase-storage.js");
        
        // 파일명 생성 (타임스탬프 + 원본 파일명)
        const fileName = `content/${Date.now()}_${file.name}`;
        const storageRef = ref(window.storage, fileName);
        
        
        // 파일 업로드
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        
        
        // 로딩 텍스트 제거
        quill.deleteText(range.index, '이미지 업로드 중...'.length);
        
        // 이미지 삽입
        quill.insertEmbed(range.index, 'image', downloadURL);
        quill.setSelection(range.index + 1);
        
    } catch (error) {
        console.error('❌ 이미지 업로드 실패:', error);
        alert('이미지 업로드에 실패했습니다: ' + error.message);
        
        // 로딩 텍스트 제거
        const range = quill.getSelection();
        if (range) {
            quill.deleteText(range.index, '이미지 업로드 중...'.length);
        }
    }
}

// 콘텐츠 데이터 로드 (Firestore 전용)
async function loadContentData() {
    try {
        showLoading();
        
        // Firestore에서 콘텐츠 데이터 로드
        const { collection, query, orderBy, getDocs } = await import("https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js");
        const contentRef = collection(window.db, 'content');
        const contentQuery = query(contentRef, orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(contentQuery);
        
        contentData = snapshot.docs
            .map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data
                };
            })
            .filter(item => {
                // 사용자가 작성한 다국어 콘텐츠만 표시 (userId 필드가 있고, versions 필드가 있는 것)
                const hasVersions = item.versions && typeof item.versions === 'object';
                const hasUserId = item.userId; // 사용자가 작성한 콘텐츠
                const isValidContentType = ['faq', 'guide', 'notice', 'manual'].includes(item.type);
                
                if (!hasVersions || !hasUserId || !isValidContentType) {
                    return false;
                }
                return true;
            });
        
        displayContentList(contentData);
        
        // 콘텐츠가 없어도 빈 상태로 표시 (사용자가 직접 작성하도록)
        if (contentData.length === 0) {
        }
        
        hideLoading();
        
    } catch (error) {
        console.error('❌ 콘텐츠 데이터 로드 실패:', error);
        hideLoading();
        showError('콘텐츠 데이터를 불러오는데 실패했습니다.');
    }
}

// 커뮤니티용 샘플 데이터 생성
// 샘플 데이터 로직 제거됨 - 사용자가 직접 콘텐츠 작성

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
        // 안전한 versions 접근
        const versions = content.versions || {};
        const koVersion = versions.ko || {};
        const publishedCount = Object.values(versions).filter(v => v && v.published).length;
        const totalVersions = Object.keys(versions).length;
        const translationNeededCount = Object.values(versions).filter(v => v && (v.translationStatus === 'missing' || v.translationStatus === 'outdated')).length;
        
        return `
            <div class="content-card bg-white border border-gray-200 rounded-lg p-6">
                <div class="flex items-start justify-between">
                    <div class="flex-1">
                        <div class="flex items-center space-x-3 mb-2">
                            <span class="content-type-badge type-${content.type}">
                                ${CONTENT_TYPES[content.type]?.name || content.type}
                            </span>
                            <span class="status-badge ${getStatusClass(content.status || 'draft')}">
                                ${getStatusName(content.status || 'draft')}
                            </span>
                            <span class="status-badge ${content.priority === 'urgent' ? 'bg-red-100 text-red-800' : content.priority === 'high' ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-800'}">
                                ${content.priority === 'urgent' ? '긴급' : content.priority === 'high' ? '높음' : '일반'}
                            </span>
                            ${content.featured ? '<span class="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded"><i class="fas fa-star mr-1"></i>주요</span>' : ''}
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
                                ${Object.entries(versions).map(([lang, version]) => {
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
                        
                        ${content.tags ? `
                            <div class="mt-3">
                                <div class="flex flex-wrap gap-1">
                                    ${content.tags.split(',').slice(0, 5).map(tag => 
                                        `<span class="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">${tag.trim()}</span>`
                                    ).join('')}
                                    ${content.tags.split(',').length > 5 ? '<span class="px-2 py-1 bg-gray-200 text-gray-600 rounded text-xs">+더보기</span>' : ''}
                                </div>
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
        const versions = content.versions || {};
        return count + Object.values(versions).filter(v => v && v.published).length;
    }, 0);
    const translationNeeded = contentData.reduce((count, content) => {
        const versions = content.versions || {};
        return count + Object.values(versions).filter(v => v && (v.translationStatus === 'missing' || v.translationStatus === 'outdated')).length;
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
        
        // 번역 환경 정보 표시
        const environment = window.location.hostname === "localhost" || 
                          window.location.hostname === "127.0.0.1" ? "로컬" : "배포";
        
        showSuccess(`자동 번역을 시작합니다... (${environment} 환경, ${targetLanguages.length}개 언어)`);
        
        let successCount = 0;
        let failCount = 0;
        
        // Gemini API를 사용한 실제 번역
        for (let i = 0; i < targetLanguages.length; i++) {
            const targetLang = targetLanguages[i];
            const langName = SUPPORTED_LANGUAGES[targetLang].name;
            
            try {
                // 진행 상태 표시
                showSuccess(`${langName} 번역 중... (${i + 1}/${targetLanguages.length})`);
                
                const translatedTitle = await translateContentWithGemini(sourceTitle, sourceLanguage, targetLang);
                const translatedContent = await translateContentWithGemini(sourceContent, sourceLanguage, targetLang);
                
                document.getElementById(`title_${targetLang}`).value = translatedTitle;
                quillEditors[targetLang].root.innerHTML = translatedContent;
                
                successCount++;
                
            } catch (error) {
                failCount++;
                console.error(`❌ ${langName} 번역 실패:`, error);
                showError(`${langName} 번역 중 오류가 발생했습니다.`);
            }
        }
        
        // 최종 결과 표시
        if (successCount === targetLanguages.length) {
            showSuccess(`🎉 모든 언어 번역 완료! (${successCount}/${targetLanguages.length}) 번역 결과를 검토하고 필요시 수정해주세요.`);
        } else if (successCount > 0) {
            showSuccess(`⚠️ 일부 언어 번역 완료 (성공: ${successCount}, 실패: ${failCount}) 번역 결과를 검토해주세요.`);
        } else {
            showError(`❌ 모든 번역이 실패했습니다. 네트워크 연결이나 권한을 확인해주세요.`);
        }
        
    } catch (error) {
        console.error('자동 번역 실패:', error);
        showError('자동 번역에 실패했습니다.');
    }
}

// 번역 기능은 별도 모듈(admin-content-translation.js)로 분리됨
// translateContentWithGemini 함수를 사용하여 Gemini API로 실제 번역 수행

// 환경별 번역 테스트 함수 (개발/디버깅 용도)
async function testTranslationEnvironment() {
    const environment = {
        hostname: window.location.hostname,
        protocol: window.location.protocol,
        isLocal: window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1",
        hasGeminiAccess: typeof fetch !== 'undefined'
    };
    
    
    try {
        const testText = "안녕하세요";
        const result = await translateContentWithGemini(testText, 'ko', 'en');
        
        console.log('✅ 번역 테스트 성공:', {
            input: testText,
            output: result,
            environment: environment.isLocal ? 'LOCAL' : 'PRODUCTION'
        });
        
        return { success: true, result, environment };
        
    } catch (error) {
        console.error('❌ 번역 테스트 실패:', error);
        return { success: false, error: error.message, environment };
    }
}

// 전역 함수로 등록 (개발자 콘솔에서 테스트 가능)
window.testTranslationEnvironment = testTranslationEnvironment;

// 콘텐츠 저장
async function saveContent() {
    try {
        const contentType = document.getElementById('contentType').value;
        const priority = document.getElementById('priority').value;
        const contentStatus = document.getElementById('contentStatus')?.value || 'draft';
        const contentTags = document.getElementById('contentTags')?.value || '';
        const contentFeatured = document.getElementById('contentFeatured')?.checked || false;
        const currentTime = new Date().toISOString();
        
        const contentId = currentEditingId || `${contentType}_${Date.now()}`;
        const isEditing = currentEditingId !== null;
        
        // 언어별 데이터 수집
        const versions = {};
        Object.keys(SUPPORTED_LANGUAGES).forEach(lang => {
            const title = document.getElementById(`title_${lang}`).value.trim();
            const content = quillEditors[lang].root.innerHTML;
            const published = contentStatus === 'published'; // 상태 드롭다운에서 결정
            
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
            status: contentStatus,
            tags: contentTags,
            featured: contentFeatured,
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
        
        // Firestore에 저장
        if (!window.db) {
            throw new Error('Firebase가 초기화되지 않았습니다.');
        }
        
        // 현재 사용자 인증 정보 확인
        const currentUser = window.auth.currentUser;
        console.log('🔐 현재 사용자 정보:', {
            email: currentUser?.email,
            uid: currentUser?.uid,
            token: currentUser ? '인증됨' : '인증 안됨'
        });
        
        // 토큰 정보 확인
        if (currentUser) {
            try {
                const token = await currentUser.getIdToken();
                const tokenClaims = await currentUser.getIdTokenResult();
                console.log('🎫 토큰 정보:', {
                    email: tokenClaims.claims.email,
                    admin: tokenClaims.claims.admin,
                    customClaims: tokenClaims.claims
                });
            } catch (tokenError) {
                console.error('❌ 토큰 정보 가져오기 실패');
            }
        }
        
        const { doc, setDoc, serverTimestamp } = await import("https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js");
        const contentRef = doc(window.db, 'content', contentId);
        
        console.log('📝 저장할 콘텐츠:', {
            id: contentId,
            type: contentItem.type,
            versionsCount: Object.keys(contentItem.versions).length
        });
        
        // 사용자 정보를 문서에 추가 (권한 우회용)
        const contentWithUser = {
            ...contentItem,
            userId: currentUser.email,
            userUid: currentUser.uid,
            createdAt: contentItem.createdAt || serverTimestamp(),
            updatedAt: serverTimestamp()
        };
        
        console.log('💾 DB 저장 시도:', contentRef.path);
        
        try {
            await setDoc(contentRef, contentWithUser);
            console.log('✅ Firestore에 콘텐츠 저장 성공!');
        } catch (firestoreError) {
            console.error('❌ Firestore 저장 실패:', firestoreError);
            console.log('🔍 권한 문제 디버깅:', {
                userEmail: currentUser.email,
                isLocalHost: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1',
                collection: 'content',
                documentId: contentId
            });
            
            // DB 저장에 실패하면 에러를 throw (로컬 저장하지 않음)
            throw new Error(`DB 저장 실패: ${firestoreError.message}. 관리자 권한을 확인해주세요.`);
        }
        console.log('✅ Firestore에 콘텐츠 저장 완료');
        
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
    
    // 새로 추가된 필드들
    if (document.getElementById('contentStatus')) {
        document.getElementById('contentStatus').value = content.status || 'draft';
    }
    if (document.getElementById('contentTags')) {
        document.getElementById('contentTags').value = content.tags || '';
    }
    if (document.getElementById('contentFeatured')) {
        document.getElementById('contentFeatured').checked = content.featured || false;
    }
    
    // 언어별 데이터 설정
    Object.keys(SUPPORTED_LANGUAGES).forEach(lang => {
        const versions = content.versions || {};
        const version = versions[lang];
        if (version) {
            document.getElementById(`title_${lang}`).value = version.title || '';
            quillEditors[lang].root.innerHTML = version.content || '';
            document.getElementById(`status_${lang}`).textContent = version.published ? '게시됨' : '초안';
        } else {
            document.getElementById(`title_${lang}`).value = '';
            quillEditors[lang].root.innerHTML = '';
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
    
    // 복제된 콘텐츠의 새로운 필드 설정
    if (document.getElementById('contentStatus')) {
        document.getElementById('contentStatus').value = 'draft'; // 복제 시 초안으로 설정
    }
    if (document.getElementById('contentTags')) {
        document.getElementById('contentTags').value = content.tags || ''; // 태그 복사
    }
    if (document.getElementById('contentFeatured')) {
        document.getElementById('contentFeatured').checked = false; // 복제 시 주요 콘텐츠 설정 해제
    }
    
    // 언어별 데이터 설정 (복제)
    Object.keys(SUPPORTED_LANGUAGES).forEach(lang => {
        const version = content.versions[lang];
        if (version) {
            document.getElementById(`title_${lang}`).value = `[복사] ${version.title || ''}`;
            quillEditors[lang].root.innerHTML = version.content || '';
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
    
    const versions = content.versions || {};
    const koVersion = versions.ko || {};
    if (confirm(`"${koVersion.title || '제목 없음'}" 콘텐츠를 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`)) {
        try {
            // Firestore에서 삭제
            const { doc, deleteDoc } = await import("https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js");
            const contentRef = doc(window.db, 'content', contentId);
            await deleteDoc(contentRef);
            console.log('✅ Firestore에서 콘텐츠 삭제 완료');
            
            // 로컬 데이터에서 제거
            contentData = contentData.filter(c => c.id !== contentId);
            localStorage.setItem('content', JSON.stringify(contentData));
            
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
    
    // 새로 추가된 필드 초기화
    if (document.getElementById('contentStatus')) {
        document.getElementById('contentStatus').value = 'draft';
    }
    if (document.getElementById('contentTags')) {
        document.getElementById('contentTags').value = '';
    }
    if (document.getElementById('contentFeatured')) {
        document.getElementById('contentFeatured').checked = false;
    }
    
    // 작성 방식 초기화
    document.querySelector('input[name="creationMode"][value="individual"]').checked = true;
    toggleCreationMode();
    
    // 언어별 입력 필드 초기화
    Object.keys(SUPPORTED_LANGUAGES).forEach(lang => {
        document.getElementById(`title_${lang}`).value = '';
        quillEditors[lang].root.innerHTML = '';
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

function formatDate(dateValue) {
    if (!dateValue) return '-';
    
    let date;
    // Firestore Timestamp 객체인 경우
    if (dateValue.toDate && typeof dateValue.toDate === 'function') {
        date = dateValue.toDate();
    }
    // 이미 Date 객체인 경우 또는 문자열인 경우
    else {
        date = new Date(dateValue);
    }
    
    if (isNaN(date.getTime())) return '-';
    
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

// 상태 별 CSS 클래스 반환
function getStatusClass(status) {
    const classes = {
        'published': 'bg-green-100 text-green-800',
        'draft': 'bg-yellow-100 text-yellow-800',
        'scheduled': 'bg-blue-100 text-blue-800',
        'archived': 'bg-gray-100 text-gray-800'
    };
    return classes[status] || classes.draft;
}

// 상태명 반환
function getStatusName(status) {
    const names = {
        'published': '게시됨',
        'draft': '초안',
        'scheduled': '예약됨',
        'archived': '보관됨'
    };
    return names[status] || '초안';
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

console.log('🌐 admin-content.js 로드 완료');