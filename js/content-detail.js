// 콘텐츠 상세 페이지 관리
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

import { applyLanguage, updateMetadata } from '../utils/language-utils.js';

// 전역 변수
let db;
let currentContentId = null;
let currentLanguage = 'ko';
let currentContent = null;

// URL에서 콘텐츠 ID와 언어 추출
function parseURL() {
    const pathParts = window.location.pathname.split('/').filter(part => part);
    const urlParams = new URLSearchParams(window.location.search);
    
    console.log('🔍 URL 파싱:', { 
        pathname: window.location.pathname, 
        pathParts, 
        search: window.location.search 
    });
    
    let language = 'ko';
    let contentId = null;
    
    // 방법 1: URL 파라미터에서 ID 추출 (?id=xxx)
    contentId = urlParams.get('id');
    
    // 방법 2: 경로에서 언어 추출
    if (pathParts.includes('locales')) {
        const localeIndex = pathParts.indexOf('locales');
        if (localeIndex + 1 < pathParts.length) {
            language = pathParts[localeIndex + 1];
        }
    } else if (['ko', 'en', 'ja', 'zh', 'es'].includes(pathParts[0])) {
        language = pathParts[0];
    }
    
    // 방법 3: 경로 기반 ID 추출 (/community/content-id 형태)
    if (!contentId) {
        const communityIndex = pathParts.indexOf('community');
        if (communityIndex !== -1 && communityIndex + 1 < pathParts.length) {
            contentId = pathParts[communityIndex + 1];
        }
    }
    
    console.log('✅ URL 파싱 결과:', { contentId, language });
    return { contentId, language };
}

// 페이지 초기화
async function initializeContentDetail() {
    if (!window.db) {
        setTimeout(initializeContentDetail, 100);
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
    
    // 카카오 SDK 초기화
    initializeKakaoSDK();
    
    // 콘텐츠 로드
    await loadContentDetail(contentId, language);
}

// 헤더/푸터 컴포넌트 로드 (기존 커뮤니티 페이지와 동일한 방식)
async function loadComponents() {
    try {
        // 네비게이션바 로드 (기존 방식)
        if (typeof window.loadNavbar === 'function') {
            await window.loadNavbar();
        }
        
        // 푸터 로드 (기존 방식)
        if (typeof window.loadFooter === 'function') {
            await window.loadFooter();
        }
    } catch (error) {
        console.log('컴포넌트 로드 실패, 백업 네비게이션 사용');
        // 백업으로 기본 네비게이션 추가
        addBackupNavigation();
    }
}

// 스크립트 로드 헬퍼
function loadScript(src) {
    return new Promise((resolve) => {
        if (document.querySelector(`script[src="${src}"]`)) {
            resolve();
            return;
        }
        
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = resolve; // 실패해도 계속 진행
        document.head.appendChild(script);
    });
}

// 백업 네비게이션 추가
function addBackupNavigation() {
    const headerPlaceholder = document.getElementById('header-placeholder');
    
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
                        <div class="md:hidden">
                            <button onclick="toggleMobileMenu()" class="text-gray-700 hover:text-blue-600 p-2">
                                <i class="fas fa-bars"></i>
                            </button>
                        </div>
                    </div>
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
    
    document.getElementById('contentDate').textContent = formatDate(contentData.createdAt, language);
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
}

// 메타 태그 동적 업데이트
function updateMetaTags(version, contentData, language) {
    const title = `${version.title} - LikeVoca`;
    const description = version.summary || version.content.substring(0, 160) + '...';
    const url = `https://likevoca.com/${language}/content-detail.html?id=${currentContentId}`;
    const imageUrl = version.image || 'https://likevoca.com/assets/og-image.jpg';
    
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
        const hreflangUrl = `https://likevoca.com/${lang}/content-detail.html?id=${currentContentId}`;
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
        "url": `https://likevoca.com/${language}/content-detail.html?id=${currentContentId}`,
        "datePublished": contentData.created_at,
        "dateModified": contentData.updated_at || contentData.created_at,
        "inLanguage": language,
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": `https://likevoca.com/${language}/content-detail.html?id=${currentContentId}`
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
        // category가 없으면 관련 콘텐츠 섹션 숨기기
        if (!category) {
            document.getElementById('relatedContent').classList.add('hidden');
            return;
        }

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
                    <span class="text-gray-500 text-xs ml-2">${formatDate(content.createdAt, language)}</span>
                </div>
                <h4 class="font-semibold text-gray-900 mb-2 hover:text-blue-600">
                    <a href="/locales/${language}/content-detail.html?id=${content.id}">${version.title}</a>
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
        }
        // 다른 언어들도 추가 가능
    };
    
    return categories[language]?.[category] || category;
}

function formatDate(dateValue, language) {
    let date;
    
    // Firebase Timestamp 객체인지 확인
    if (dateValue && typeof dateValue.toDate === 'function') {
        date = dateValue.toDate();
    } else if (dateValue && typeof dateValue.seconds === 'number') {
        // Timestamp의 seconds 속성을 직접 사용
        date = new Date(dateValue.seconds * 1000);
    } else if (dateValue) {
        // 일반 문자열이나 Date 객체
        date = new Date(dateValue);
    } else {
        return 'Unknown Date';
    }
    
    // Invalid Date 체크
    if (isNaN(date.getTime())) {
        return 'Unknown Date';
    }
    
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
            shareToKakao(title, text, url);
            break;
    }
}

// 카카오톡 SDK 초기화 및 공유 함수
async function initializeKakaoSDK() {
    try {
        if (typeof Kakao === 'undefined') {
            console.warn('⚠️ 카카오 SDK가 로드되지 않았습니다.');
            return;
        }

        if (Kakao.isInitialized()) {
            return; // 이미 초기화됨
        }

        // 환경변수에서 카카오 앱 키 가져오기
        let kakaoAppKey = null;

        try {
            const response = await fetch('/api/env-config');
            const config = await response.json();
            kakaoAppKey = config.kakaoAppKey;
        } catch (error) {
            console.warn('⚠️ 환경설정을 가져올 수 없습니다. 로컬 환경변수를 시도합니다.');
        }

        // 로컬 개발 환경에서는 .env 파일이나 하드코딩된 키 사용
        if (!kakaoAppKey) {
            // 개발 환경에서는 여기에 테스트 키를 넣을 수 있습니다
            // kakaoAppKey = 'your_development_kakao_key';
            console.warn('⚠️ 카카오 앱 키가 설정되지 않았습니다. 카카오톡 공유 기능을 사용할 수 없습니다.');
            return;
        }

        Kakao.init(kakaoAppKey);
        console.log('✅ 카카오 SDK 초기화 완료');
    } catch (error) {
        console.warn('⚠️ 카카오 SDK 초기화 실패:', error);
    }
}

function shareToKakao(title, description, url) {
    try {
        if (typeof Kakao === 'undefined') {
            // SDK가 로드되지 않은 경우 fallback
            copyURL();
            alert('링크가 복사되었습니다. 카카오톡에서 공유해보세요!');
            return;
        }

        // 카카오 앱 키가 설정되지 않은 경우 fallback
        if (!Kakao.isInitialized()) {
            copyURL();
            alert('카카오톡 공유 설정이 필요합니다. 링크가 복사되었습니다.');
            return;
        }

        // 이미지 URL 가져오기 (OG 이미지 또는 기본 이미지)
        const imageUrl = document.querySelector('meta[property="og:image"]')?.content || 
                        'https://likevoca.com/assets/og-image.jpg';

        Kakao.Share.sendDefault({
            objectType: 'feed',
            content: {
                title: title,
                description: description,
                imageUrl: imageUrl,
                link: {
                    mobileWebUrl: url,
                    webUrl: url,
                },
            },
            buttons: [
                {
                    title: '자세히 보기',
                    link: {
                        mobileWebUrl: url,
                        webUrl: url,
                    },
                },
            ],
        });
    } catch (error) {
        console.error('❌ 카카오톡 공유 실패:', error);
        // 실패 시 fallback
        copyURL();
        alert('카카오톡 공유에 실패했습니다. 링크가 복사되었습니다.');
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

// Footer 공유 버튼용 전역 함수
function shareCurrentPage(platform) {
    const title = document.title || 'LikeVoca';
    const url = window.location.href;
    const description = document.querySelector('meta[name="description"]')?.content || 
                      'LikeVoca - AI 기반 맞춤형 언어학습 플랫폼';
    
    switch (platform) {
        case 'facebook':
            const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
            window.open(facebookUrl, '_blank', 'width=600,height=400');
            break;
            
        case 'twitter':
            const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
            window.open(twitterUrl, '_blank', 'width=600,height=400');
            break;
            
        case 'linkedin':
            const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
            window.open(linkedinUrl, '_blank', 'width=600,height=400');
            break;
            
        case 'reddit':
            const redditUrl = `https://www.reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`;
            window.open(redditUrl, '_blank', 'width=800,height=600');
            break;
            
        case 'line':
            const lineUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url)}`;
            window.open(lineUrl, '_blank', 'width=600,height=400');
            break;
            
        case 'weibo':
            const weiboUrl = `https://service.weibo.com/share/share.php?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`;
            window.open(weiboUrl, '_blank', 'width=600,height=400');
            break;
            
        case 'qq':
            const qqUrl = `https://connect.qq.com/widget/shareqq/index.html?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}&desc=${encodeURIComponent(description)}`;
            window.open(qqUrl, '_blank', 'width=600,height=400');
            break;
            
        case 'whatsapp':
            const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`;
            window.open(whatsappUrl, '_blank');
            break;
            
        case 'telegram':
            const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
            window.open(telegramUrl, '_blank');
            break;
            
        case 'kakao':
            shareToKakao(title, description, url);
            break;
            
        default:
            copyCurrentURL();
            break;
    }
}

function copyCurrentURL() {
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
window.shareCurrentPage = shareCurrentPage;
window.copyCurrentURL = copyCurrentURL;

// 페이지 로드 시 초기화
window.addEventListener('DOMContentLoaded', initializeContentDetail);