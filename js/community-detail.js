// 커뮤니티 콘텐츠 상세 페이지 관리 (새로운 URL 구조: /community/{content-id})
import { 
    doc, 
    getDoc, 
    collection, 
    query, 
    where, 
    limit, 
    getDocs,
    orderBy
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

// 전역 변수
let db;
let currentContentId = null;
let currentLanguage = 'ko';
let currentContent = null;

// URL에서 콘텐츠 ID와 언어 추출 (깔끔한 URL 구조)
function parseURL() {
    const pathParts = window.location.pathname.split('/').filter(part => part);
    
    let language = 'ko';
    let contentId = null;
    
    // URL 구조 분석: /{language}/community/{content-id} 또는 /community/{content-id}
    if (pathParts.length >= 3 && pathParts[1] === 'community') {
        // /{language}/community/{content-id} 형태
        if (['ko', 'en', 'ja', 'zh', 'es'].includes(pathParts[0])) {
            language = pathParts[0];
            contentId = pathParts[2];
        }
    } else if (pathParts.length >= 2 && pathParts[0] === 'community') {
        // /community/{content-id} 형태 (기본 한국어)
        contentId = pathParts[1];
        language = 'ko';
    } else {
        // 백업: URL 파라미터에서 추출
        const urlParams = new URLSearchParams(window.location.search);
        contentId = urlParams.get('id');
        
        // 언어는 경로에서 추출하거나 기본값
        if (pathParts.includes('locales')) {
            const localeIndex = pathParts.indexOf('locales');
            if (localeIndex + 1 < pathParts.length) {
                language = pathParts[localeIndex + 1];
            }
        } else if (['ko', 'en', 'ja', 'zh', 'es'].includes(pathParts[0])) {
            language = pathParts[0];
        }
    }
    
    return { contentId, language };
}

// 페이지 초기화
async function initializeCommunityDetail() {
    if (!window.db) {
        setTimeout(initializeCommunityDetail, 100);
        return;
    }
    
    db = window.db;
    
    // URL 파싱
    const { contentId, language } = parseURL();
    
    if (!contentId) {
        showError();
        return;
    }
    
    currentContentId = contentId;
    currentLanguage = language;
    
    // 헤더/푸터 로드
    await loadComponents();
    
    // 콘텐츠 로드
    await loadContentDetail(contentId, language);
}

// 헤더/푸터 컴포넌트 로드 (개선된 버전)
async function loadComponents() {
    
    // 우선 백업 네비게이션을 먼저 표시
    addFallbackNavigation();
    
    try {
        // 네비게이션 스크립트들을 먼저 로드
        await Promise.all([
            loadScript('/components/js/navbar.js'),
            loadScript('/components/js/footer.js')
        ]);
        
        // 헤더 로드 시도
        try {
            const headerResponse = await fetch(`/components/header-${currentLanguage}.html`);
            if (headerResponse.ok) {
                const headerHTML = await headerResponse.text();
                document.getElementById('header-placeholder').innerHTML = headerHTML;
                
                // 헤더 로드 후 네비게이션 스크립트 실행
                setTimeout(async () => {
                    if (typeof window.loadNavbar === 'function') {
                        await window.loadNavbar();
                    }
                }, 100);
            } else {
                console.log('⚠️ 헤더 로드 실패, 백업 네비게이션 사용');
            }
        } catch (headerError) {
            console.log('⚠️ 헤더 로드 에러:', headerError);
        }
        
        // 푸터 로드 시도
        try {
            const footerResponse = await fetch(`/components/footer-${currentLanguage}.html`);
            if (footerResponse.ok) {
                const footerHTML = await footerResponse.text();
                document.getElementById('footer-placeholder').innerHTML = footerHTML;
                
                // 푸터 로드 후 푸터 스크립트 실행
                setTimeout(async () => {
                    if (typeof window.loadFooter === 'function') {
                        await window.loadFooter();
                    }
                }, 100);
            }
        } catch (footerError) {
            console.log('⚠️ 푸터 로드 에러:', footerError);
        }
        
    } catch (error) {
        console.error('❌ 컴포넌트 로드 실패:', error);
    }
}

// 스크립트 로드 헬퍼 함수
function loadScript(src) {
    return new Promise((resolve, reject) => {
        // 이미 로드된 스크립트인지 확인
        if (document.querySelector(`script[src="${src}"]`)) {
            resolve();
            return;
        }
        
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
        document.head.appendChild(script);
    });
}

// 백업 네비게이션 추가 (언어별 다국어 지원)
function addFallbackNavigation() {
    const headerPlaceholder = document.getElementById('header-placeholder');
    
    // 언어별 네비게이션 텍스트
    const navTexts = {
        ko: { home: '홈', community: '커뮤니티', vocabulary: '단어장', login: '로그인' },
        en: { home: 'Home', community: 'Community', vocabulary: 'Vocabulary', login: 'Login' },
        ja: { home: 'ホーム', community: 'コミュニティ', vocabulary: '単語帳', login: 'ログイン' },
        zh: { home: '首页', community: '社区', vocabulary: '单词本', login: '登录' },
        es: { home: 'Inicio', community: 'Comunidad', vocabulary: 'Vocabulario', login: 'Iniciar sesión' }
    };
    
    const texts = navTexts[currentLanguage] || navTexts.ko;
    
    if (headerPlaceholder) {
        headerPlaceholder.innerHTML = `
            <nav class="bg-white shadow-sm border-b sticky top-0 z-50">
                <div class="container mx-auto px-4">
                    <div class="flex items-center justify-between h-16">
                        <div class="flex items-center space-x-8">
                            <a href="/locales/${currentLanguage}/index.html" class="text-2xl font-bold text-blue-600 hover:text-blue-800 transition duration-200">
                                <i class="fas fa-book-open mr-2"></i>
                                LikeVoca
                            </a>
                            <div class="hidden md:flex space-x-6">
                                <a href="/locales/${currentLanguage}/index.html" class="flex items-center text-gray-700 hover:text-blue-600 transition duration-200 px-3 py-2 rounded-md">
                                    <i class="fas fa-home mr-1 text-sm"></i>
                                    ${texts.home}
                                </a>
                                <a href="/locales/${currentLanguage}/community.html" class="flex items-center text-blue-600 font-medium bg-blue-50 px-3 py-2 rounded-md">
                                    <i class="fas fa-users mr-1 text-sm"></i>
                                    ${texts.community}
                                </a>
                                <a href="/pages/vocabulary.html" class="flex items-center text-gray-700 hover:text-blue-600 transition duration-200 px-3 py-2 rounded-md">
                                    <i class="fas fa-list mr-1 text-sm"></i>
                                    ${texts.vocabulary}
                                </a>
                            </div>
                        </div>
                        <div class="hidden md:flex items-center space-x-4">
                            <a href="/locales/${currentLanguage}/login.html" class="text-gray-700 hover:text-blue-600 transition duration-200 px-3 py-2 rounded-md">
                                <i class="fas fa-sign-in-alt mr-1 text-sm"></i>
                                ${texts.login}
                            </a>
                        </div>
                        <!-- 모바일 메뉴 버튼 -->
                        <div class="md:hidden">
                            <button onclick="toggleMobileMenu()" class="text-gray-700 hover:text-blue-600 p-2">
                                <i class="fas fa-bars"></i>
                            </button>
                        </div>
                    </div>
                    <!-- 모바일 메뉴 -->
                    <div id="mobile-menu" class="hidden md:hidden border-t border-gray-200 py-2">
                        <a href="/locales/${currentLanguage}/index.html" class="flex items-center text-gray-700 hover:text-blue-600 px-3 py-2">
                            <i class="fas fa-home mr-2"></i>${texts.home}
                        </a>
                        <a href="/locales/${currentLanguage}/community.html" class="flex items-center text-blue-600 font-medium px-3 py-2">
                            <i class="fas fa-users mr-2"></i>${texts.community}
                        </a>
                        <a href="/pages/vocabulary.html" class="flex items-center text-gray-700 hover:text-blue-600 px-3 py-2">
                            <i class="fas fa-list mr-2"></i>${texts.vocabulary}
                        </a>
                        <a href="/locales/${currentLanguage}/login.html" class="flex items-center text-gray-700 hover:text-blue-600 px-3 py-2">
                            <i class="fas fa-sign-in-alt mr-2"></i>${texts.login}
                        </a>
                    </div>
                </div>
            </nav>
        `;
        
        // 모바일 메뉴 토글 함수 추가
        window.toggleMobileMenu = function() {
            const mobileMenu = document.getElementById('mobile-menu');
            if (mobileMenu) {
                mobileMenu.classList.toggle('hidden');
            }
        };
        
    }
}

// 콘텐츠 상세 정보 로드
async function loadContentDetail(contentId, language) {
    try {
        showLoading();
        
        // Firestore에서 콘텐츠 조회
        const contentRef = doc(db, 'content', contentId);
        const contentSnap = await getDoc(contentRef);
        
        if (!contentSnap.exists()) {
            showError();
            return;
        }
        
        const contentData = contentSnap.data();
        currentContent = contentData;
        
        // 언어별 버전 확인
        const version = contentData.versions?.[language];
        if (!version) {
            showError();
            return;
        }
        
        // 페이지 렌더링
        renderContentDetail(version, contentData, language);
        
        // 관련 콘텐츠 로드
        await loadRelatedContent(contentData.category, contentId, language);
        
        hideLoading();
        
    } catch (error) {
        console.error('콘텐츠 로드 실패:', error);
        showError();
    }
}

// 콘텐츠 상세 렌더링
function renderContentDetail(version, contentData, language) {
    // 메타 태그 업데이트
    updateMetaTags(version, contentData, language);
    
    // 구조화 데이터 업데이트
    updateStructuredData(version, contentData, language);
    
    // 콘텐츠 표시
    document.getElementById('contentCategory').textContent = getCategoryName(contentData.category, language);
    document.getElementById('contentDate').textContent = formatDate(contentData.created_at, language);
    document.getElementById('contentTitle').textContent = version.title;
    document.getElementById('contentSummary').textContent = version.summary || '';
    document.getElementById('breadcrumbTitle').textContent = version.title;
    
    // 본문 렌더링 (Markdown 지원)
    const contentBody = document.getElementById('contentBody');
    contentBody.innerHTML = renderMarkdown(version.content);
    
    // 태그 렌더링
    renderTags(version.tags || [], language);
    
    // 콘텐츠 표시
    document.getElementById('contentDetail').classList.remove('hidden');
    
    // HTML 태그 제거 함수 (공유용)
    function stripHtmlForShare(html) {
        if (!html) return '';
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        let text = tmp.textContent || tmp.innerText || '';
        return text.replace(/\s+/g, ' ').trim();
    }
    
    // 공유용 메타데이터를 전역 변수로 설정 (소셜 미디어 공유용)
    let cleanDescription = '';
    if (version.summary) {
        cleanDescription = stripHtmlForShare(version.summary);
    } else if (version.content) {
        cleanDescription = stripHtmlForShare(version.content.substring(0, 160)) + '...';
    }
    
    window.shareMetadata = {
        title: version.title,
        description: cleanDescription || 'LikeVoca 커뮤니티 콘텐츠를 확인하세요.',
        image: version.image || 'https://likevoca.com/assets/hero.jpeg',
        url: window.location.href
    };
    
    // 공유 기능 활성화
    window.contentLoaded = true;
    
}

// 메타 태그 동적 업데이트
function updateMetaTags(version, contentData, language) {
    const title = `${version.title} - LikeVoca`;
    const description = version.summary || version.content.substring(0, 160) + '...';
    const url = `https://likevoca.com/locales/${language}/community/?id=${currentContentId}`;
    const imageUrl = version.image || 'https://likevoca.com/assets/hero.jpeg';
    
    // Title
    document.title = title;
    updateMetaTag('og:title', title);
    updateMetaTag('twitter:title', title);
    
    // Description
    updateMetaTag('description', description);
    updateMetaTag('og:description', description);
    updateMetaTag('twitter:description', description);
    
    // URL
    updateMetaTag('og:url', url);
    document.querySelector('link[rel="canonical"]').href = url;
    
    // Image
    if (imageUrl) {
        updateMetaTag('og:image', imageUrl);
        updateMetaTag('twitter:image', imageUrl);
    }
    
    // Hreflang 업데이트
    const languages = ['ko', 'en', 'ja', 'zh', 'es'];
    languages.forEach(lang => {
        const hreflangUrl = `https://likevoca.com/locales/${lang}/community/?id=${currentContentId}`;
        const hreflangElement = document.querySelector(`link[hreflang="${lang}"]`);
        if (hreflangElement) {
            hreflangElement.href = hreflangUrl;
        }
    });
    
    // Keywords
    if (version.tags && version.tags.length > 0) {
        const keywords = version.tags.join(', ');
        updateMetaTag('keywords', keywords);
    }
}

// 메타 태그 헬퍼 함수
function updateMetaTag(property, content) {
    let selector;
    if (property === 'description' || property === 'keywords') {
        selector = `meta[name="${property}"]`;
    } else {
        selector = `meta[property="${property}"]`;
    }
    
    const element = document.querySelector(selector);
    if (element) {
        element.content = content;
    }
}

// 구조화 데이터 업데이트
function updateStructuredData(version, contentData, language) {
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": version.title,
        "description": version.summary || version.content.substring(0, 160),
        "author": {
            "@type": "Organization",
            "name": "LikeVoca"
        },
        "publisher": {
            "@type": "Organization",
            "name": "LikeVoca",
            "url": "https://likevoca.com",
            "logo": {
                "@type": "ImageObject",
                "url": "https://likevoca.com/assets/logo.png"
            }
        },
        "url": `https://likevoca.com/locales/${language}/community/?id=${currentContentId}`,
        "datePublished": contentData.created_at,
        "dateModified": contentData.updated_at || contentData.created_at,
        "inLanguage": language,
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": `https://likevoca.com/locales/${language}/community/?id=${currentContentId}`
        }
    };
    
    // 이미지 추가
    if (version.image) {
        structuredData.image = {
            "@type": "ImageObject",
            "url": version.image
        };
    }
    
    // 태그를 키워드로 추가
    if (version.tags && version.tags.length > 0) {
        structuredData.keywords = version.tags.join(', ');
    }
    
    // JSON-LD 업데이트
    const structuredDataElement = document.getElementById('structuredData');
    structuredDataElement.textContent = JSON.stringify(structuredData, null, 2);
}

// Markdown 렌더링 (간단한 구현)
function renderMarkdown(text) {
    return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>')
        .replace(/^(.*)/, '<p>$1')
        .replace(/(.*$)/, '$1</p>')
        .replace(/<p><h/g, '<h')
        .replace(/<\/h([1-6])><\/p>/g, '</h$1>');
}

// 태그 렌더링
function renderTags(tags, language) {
    const tagsContainer = document.getElementById('contentTags');
    if (!tags || tags.length === 0) {
        tagsContainer.classList.add('hidden');
        return;
    }
    
    tagsContainer.innerHTML = tags.map(tag => 
        `<span class="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">#${tag}</span>`
    ).join('');
}

// 관련 콘텐츠 로드
async function loadRelatedContent(category, excludeId, language) {
    try {
        const contentRef = collection(db, 'content');
        const relatedQuery = query(
            contentRef,
            where('category', '==', category),
            where('status', '==', 'published'),
            orderBy('created_at', 'desc'),
            limit(4)
        );
        
        const querySnapshot = await getDocs(relatedQuery);
        const relatedContents = [];
        
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            if (doc.id !== excludeId && data.versions?.[language]) {
                relatedContents.push({
                    id: doc.id,
                    ...data
                });
            }
        });
        
        renderRelatedContent(relatedContents.slice(0, 3), language);
        
    } catch (error) {
        console.error('관련 콘텐츠 로드 실패:', error);
    }
}

// 관련 콘텐츠 렌더링
function renderRelatedContent(contents, language) {
    const container = document.getElementById('relatedContentList');
    
    if (!contents || contents.length === 0) {
        document.getElementById('relatedContent').classList.add('hidden');
        return;
    }
    
    container.innerHTML = contents.map(content => {
        const version = content.versions[language];
        return `
            <div class="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition duration-200">
                <div class="flex items-center mb-3">
                    <span class="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                        ${getCategoryName(content.category, language)}
                    </span>
                    <span class="text-gray-500 text-xs ml-2">${formatDate(content.created_at, language)}</span>
                </div>
                <h4 class="font-semibold text-gray-900 mb-2 hover:text-blue-600">
                    <a href="/locales/${language}/community/?id=${content.id}">${version.title}</a>
                </h4>
                <p class="text-gray-600 text-sm line-clamp-2">${version.summary || version.content.substring(0, 100)}...</p>
            </div>
        `;
    }).join('');
}

// 유틸리티 함수들
function getCategoryName(category, language) {
    const categories = {
        ko: {
            'notice': '공지사항',
            'guide': '학습가이드', 
            'faq': '자주 묻는 질문',
            'manual': '사용자 매뉴얼',
            'update': '업데이트',
            'tip': '학습팁'
        },
        en: {
            'notice': 'Notice',
            'guide': 'Learning Guide',
            'faq': 'FAQ',
            'manual': 'User Manual', 
            'update': 'Update',
            'tip': 'Learning Tips'
        },
        ja: {
            'notice': 'お知らせ',
            'guide': '学習ガイド',
            'faq': 'よくある質問',
            'manual': 'ユーザーマニュアル',
            'update': '更新情報',
            'tip': '学習のコツ'
        },
        zh: {
            'notice': '公告',
            'guide': '学习指南',
            'faq': '常见问题',
            'manual': '用户手册',
            'update': '更新',
            'tip': '学习技巧'
        },
        es: {
            'notice': 'Aviso',
            'guide': 'Guía de aprendizaje',
            'faq': 'Preguntas frecuentes',
            'manual': 'Manual del usuario',
            'update': 'Actualización',
            'tip': 'Consejos de aprendizaje'
        }
    };
    
    return categories[language]?.[category] || category;
}

function formatDate(dateStr, language) {
    const date = new Date(dateStr);
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    
    const locales = {
        'ko': 'ko-KR',
        'en': 'en-US', 
        'ja': 'ja-JP',
        'zh': 'zh-CN',
        'es': 'es-ES'
    };
    
    return date.toLocaleDateString(locales[language] || 'ko-KR', options);
}

// UI 상태 관리
function showLoading() {
    document.getElementById('loadingScreen').classList.remove('hidden');
    document.getElementById('contentDetail').classList.add('hidden');
    document.getElementById('errorScreen').classList.add('hidden');
}

function hideLoading() {
    document.getElementById('loadingScreen').classList.add('hidden');
}

function showError() {
    document.getElementById('loadingScreen').classList.add('hidden');
    document.getElementById('contentDetail').classList.add('hidden');
    document.getElementById('errorScreen').classList.remove('hidden');
}

// 소셜 공유 함수들
function shareContent(platform) {
    if (!currentContent) return;
    
    const title = document.getElementById('contentTitle').textContent;
    const url = window.location.href;
    const text = document.getElementById('contentSummary').textContent;
    
    switch (platform) {
        case 'facebook':
            const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
            window.open(facebookUrl, '_blank', 'width=600,height=400');
            break;
            
        case 'twitter':
            const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
            window.open(twitterUrl, '_blank', 'width=600,height=400');
            break;
            
        case 'kakao':
            // 카카오톡 공유 (웹에서는 클립보드 복사로 대체)
            copyURL();
            alert('링크가 복사되었습니다. 카카오톡에서 공유해보세요!');
            break;
    }
}

function copyURL() {
    navigator.clipboard.writeText(window.location.href).then(() => {
        alert('링크가 복사되었습니다!');
    }).catch(() => {
        // 백업 방법
        const textArea = document.createElement('textarea');
        textArea.value = window.location.href;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('링크가 복사되었습니다!');
    });
}

// 전역 함수 노출
window.shareContent = shareContent;
window.copyURL = copyURL;

// 페이지 로드 시 초기화
window.addEventListener('DOMContentLoaded', initializeCommunityDetail);