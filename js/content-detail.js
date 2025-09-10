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

// 콘텐츠 상세 정보 로드 (재시도 로직 포함)
async function loadContentDetail(contentId, language, retryCount = 0) {
    const maxRetries = 3;
    const retryDelay = 1000; // 1초
    
    try {
        showLoading();
        
        console.log(`📥 콘텐츠 로드 시도 ${retryCount + 1}/${maxRetries + 1}: ${contentId}`);
        
        // Firestore 연결 상태 확인
        if (!db) {
            throw new Error('Firestore가 초기화되지 않았습니다.');
        }
        
        // Firestore에서 콘텐츠 조회 (타임아웃 포함)
        const contentRef = doc(db, 'content', contentId);
        
        // 타임아웃 설정 (10초)
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('요청 시간 초과')), 10000);
        });
        
        const contentSnap = await Promise.race([
            getDoc(contentRef),
            timeoutPromise
        ]);
        
        if (!contentSnap.exists()) {
            console.warn(`❌ 콘텐츠를 찾을 수 없음: ${contentId}`);
            showError();
            return;
        }
        
        const contentData = contentSnap.data();
        currentContent = contentData;
        
        console.log('✅ 콘텐츠 데이터 로드 성공:', contentData);
        
        // 언어별 버전 확인
        const version = contentData.versions?.[language];
        if (!version) {
            console.warn(`❌ ${language} 언어 버전을 찾을 수 없음`);
            showError();
            return;
        }
        
        console.log('📝 버전 데이터 확인:', {
            title: version.title,
            hasImage: !!version.image,
            imageUrl: version.image,
            hasImageUrl: !!version.image_url,
            imageUrlField: version.image_url,
            hasSummary: !!version.summary,
            summary: version.summary?.substring(0, 100),
            allImageFields: {
                image: version.image,
                image_url: version.image_url,
                imageUrl: version.imageUrl,
                images: version.images
            }
        });
        
        // 전체 버전 데이터와 콘텐츠 데이터에서 이미지 관련 필드 모두 확인
        console.log('🔍 전체 데이터 이미지 필드 확인:', {
            versionKeys: Object.keys(version),
            contentDataKeys: Object.keys(contentData),
            versionData: version,
            contentData: contentData
        });
        
        // 페이지 렌더링
        renderContentDetail(version, contentData, language);
        
        // 관련 콘텐츠 로드 (비동기로 처리)
        loadRelatedContent(contentData.category, contentId, language).catch(err => {
            console.warn('관련 콘텐츠 로드 실패:', err);
        });
        
        hideLoading();
        
    } catch (error) {
        console.error(`콘텐츠 로드 실패 (시도 ${retryCount + 1}/${maxRetries + 1}):`, error);
        
        // 재시도 로직
        if (retryCount < maxRetries && (
            error.message.includes('offline') ||
            error.message.includes('network') ||
            error.message.includes('timeout') ||
            error.message.includes('시간 초과')
        )) {
            console.log(`🔄 ${retryDelay}ms 후 재시도...`);
            setTimeout(() => {
                loadContentDetail(contentId, language, retryCount + 1);
            }, retryDelay);
        } else {
            console.error('❌ 모든 재시도 실패, 에러 페이지 표시');
            showError();
        }
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
    
    // 공유 버튼 활성화 (콘텐츠가 완전히 로드된 후)
    setTimeout(() => {
        enableSharingButtons();
        
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
        
        // 다양한 이미지 필드명 확인 및 HTML에서 이미지 추출
        let contentImage = version.image || version.image_url || version.imageUrl || 
                          (version.images && version.images[0]) ||
                          (contentData.image || contentData.image_url || contentData.imageUrl);
        
        // HTML 콘텐츠에서 Firebase Storage 이미지 추출 시도
        if (!contentImage && version.content) {
            const imgRegex = /<img[^>]+src="([^"]*firebasestorage[^"]*)"[^>]*>/i;
            const match = version.content.match(imgRegex);
            if (match) {
                contentImage = match[1];
                console.log('📷 HTML에서 Firebase 이미지 추출:', contentImage);
            }
        }
        
        const finalImage = contentImage || 'https://likevoca.com/assets/hero.jpeg';
        
        window.shareMetadata = {
            title: version.title,
            description: cleanDescription || 'LikeVoca 콘텐츠를 확인하세요.',
            image: finalImage,
            url: window.location.href
        };
        
        console.log('✅ 콘텐츠 렌더링 완료, 공유 기능 활성화');
        console.log('🖼️ 콘텐츠 이미지 정보:', { 
            hasContentImage: !!contentImage, 
            contentImageUrl: contentImage,
            finalImageUrl: finalImage 
        });
        console.log('📤 공유 메타데이터 설정:', window.shareMetadata);
    }, 100);
}

// 메타 태그 동적 업데이트
function updateMetaTags(version, contentData, language) {
    const title = `${version.title} - LikeVoca`;
    
    // HTML 태그 제거 함수
    function stripHtml(html) {
        if (!html) return '';
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        let text = tmp.textContent || tmp.innerText || '';
        return text.replace(/\s+/g, ' ').trim();
    }
    
    // 설명 생성 - HTML 태그 제거하여 깔끔한 텍스트만 추출
    let description = '';
    if (version.summary && version.summary.trim()) {
        description = stripHtml(version.summary);
    } else if (version.content) {
        description = stripHtml(version.content.substring(0, 160)) + '...';
    } else {
        description = 'LikeVoca 커뮤니티의 유용한 학습 콘텐츠를 확인하세요.';
    }
    
    const url = `https://likevoca.com/${language}/content-detail.html?id=${currentContentId}`;
    // 다양한 이미지 필드명 확인 및 HTML에서 이미지 추출 (메타태그용)
    let imageUrl = version.image || version.image_url || version.imageUrl || 
                  (version.images && version.images[0]) ||
                  (contentData.image || contentData.image_url || contentData.imageUrl);
    
    // HTML 콘텐츠에서 Firebase Storage 이미지 추출 시도
    if (!imageUrl && version.content) {
        const imgRegex = /<img[^>]+src="([^"]*firebasestorage[^"]*)"[^>]*>/i;
        const match = version.content.match(imgRegex);
        if (match) {
            imageUrl = match[1];
            console.log('📷 메타태그용 HTML에서 Firebase 이미지 추출:', imageUrl);
        }
    }
    
    if (!imageUrl) {
        imageUrl = 'https://likevoca.com/assets/hero.jpeg';
    }
    
    console.log('🏷️ 메타태그 업데이트:', {
        title: title.substring(0, 50),
        description: description.substring(0, 100),
        hasHtmlTags: description.includes('<')
    });
    
    // Title (다양한 플랫폼별 최적화)
    document.title = title;
    updateMetaTag('og:title', title);
    updateMetaTag('twitter:title', title);
    updateMetaTag('og:site_name', 'LikeVoca');
    
    // Description (더 견고한 설명 설정)
    updateMetaTag('description', description);
    updateMetaTag('og:description', description);
    updateMetaTag('twitter:description', description);
    
    // URL (정규화된 URL 사용)
    updateMetaTag('og:url', url);
    const canonicalLink = document.querySelector('link[rel="canonical"]');
    if (canonicalLink) {
        canonicalLink.href = url;
    }
    
    // Open Graph 타입 및 추가 메타태그
    updateMetaTag('og:type', 'article');
    updateMetaTag('og:locale', language === 'ko' ? 'ko_KR' : `${language}_${language.toUpperCase()}`);
    
    // Twitter Card 타입 설정
    updateMetaTag('twitter:card', 'summary_large_image');
    
    // Image (더 견고한 이미지 처리)
    const finalImageUrl = imageUrl || 'https://likevoca.com/assets/hero.jpeg';
    updateMetaTag('og:image', finalImageUrl);
    updateMetaTag('og:image:width', '1200');
    updateMetaTag('og:image:height', '630');  
    updateMetaTag('og:image:alt', title);
    updateMetaTag('twitter:image', finalImageUrl);
    updateMetaTag('twitter:image:alt', title);
    
    // Facebook/LinkedIn을 위한 추가 메타태그
    updateMetaTag('article:author', 'LikeVoca');
    updateMetaTag('article:publisher', 'https://likevoca.com');
    updateMetaTag('article:published_time', contentData.created_at ? new Date(contentData.created_at.toDate()).toISOString() : new Date().toISOString());
    
    // 소셜 미디어 캐시 새로고침을 위한 추가 설정
    updateMetaTag('fb:app_id', '1234567890'); // 실제 Facebook App ID로 교체 필요
    updateMetaTag('og:updated_time', new Date().toISOString());
    
    // LinkedIn 특화 메타태그
    updateMetaTag('og:see_also', url);
    
    console.log('🌐 소셜 미디어 최적화 메타태그 설정 완료');
    
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

// 메타 태그 헬퍼 함수 (동적 생성 포함)
function updateMetaTag(property, content) {
    let selector;
    let attributeName;
    
    // 메타태그 종류별 selector 및 attribute 결정
    if (property === 'description' || property === 'keywords') {
        selector = `meta[name="${property}"]`;
        attributeName = 'name';
    } else {
        selector = `meta[property="${property}"]`;
        attributeName = 'property';
    }
    
    let element = document.querySelector(selector);
    
    // 메타태그가 없으면 동적으로 생성
    if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attributeName, property);
        document.head.appendChild(element);
        console.log(`📋 메타태그 생성: ${property}`);
    }
    
    // 내용 업데이트
    element.content = content;
    console.log(`🏷️ 메타태그 업데이트: ${property} = ${content.substring(0, 50)}`);
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

// 소셜 공유 함수들 - footer.js의 함수를 활용
function shareContent(platform) {
    // footer.js의 shareCurrentPage 함수를 사용
    if (typeof window.shareCurrentPage === 'function') {
        window.shareCurrentPage(platform);
    } else {
        // 백업 방식 - HTML 태그 제거 포함
        if (!currentContent) return;
        
        function stripHtml(html) {
            const tmp = document.createElement('div');
            tmp.innerHTML = html;
            return tmp.textContent || tmp.innerText || '';
        }
        
        const title = document.getElementById('contentTitle')?.textContent || 'LikeVoca';
        const url = window.location.href;
        const summaryText = document.getElementById('contentSummary')?.textContent;
        const text = summaryText ? stripHtml(summaryText) : '';
        
        const shortTitle = title.length > 60 ? title.substring(0, 57) + '...' : title;
        const shortText = text.length > 160 ? text.substring(0, 157) + '...' : text;
        
        switch (platform) {
            case 'facebook':
                const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
                window.open(facebookUrl, '_blank', 'width=600,height=400');
                break;
                
            case 'twitter':
                const twitterTextContent = shortText ? `${shortTitle}\n\n${shortText}` : shortTitle;
                const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(twitterTextContent)}&url=${encodeURIComponent(url)}`;
                window.open(twitterUrl, '_blank', 'width=600,height=400');
                break;
                
            case 'linkedin':
                const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&title=${encodeURIComponent(shortTitle)}&summary=${encodeURIComponent(shortText)}`;
                window.open(linkedinUrl, '_blank', 'width=600,height=400');
                break;
                
            case 'threads':
                const threadsTextContent = shortText ? `${shortTitle}\n\n${shortText}` : shortTitle;
                const threadsUrl = `https://www.threads.net/intent/post?text=${encodeURIComponent(threadsTextContent + '\n\n' + url)}`;
                window.open(threadsUrl, '_blank', 'width=600,height=400');
                break;
                
            case 'kakao':
                shareToKakao(shortTitle, shortText, url);
                break;
        }
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

        // KakaoConfig가 없다면 생성
        if (typeof window.KakaoConfig === 'undefined') {
            window.KakaoConfig = {
                isProduction: () => {
                    return window.location.hostname === 'likevoca.com' || 
                    window.location.hostname === 'www.likevoca.com' ||
                           window.location.hostname.includes('vercel.app');
                },
                async getAppKey() {
                    if (!this.isProduction()) {
                        console.log('🔧 개발 환경: 카카오톡 공유 기능이 비활성화되었습니다.');
                        return null;
                    }
                    
                    // 프로덕션 환경에서는 카카오 JavaScript 키를 직접 반환
                    // API 호출이 불안정할 때를 위한 백업 방식
                    return 'cae5858f71d624bf839cc0bba539a619';
                }
            };
        }

        // KakaoConfig 사용하여 앱 키 가져오기
        const kakaoAppKey = await window.KakaoConfig.getAppKey();
        
        if (!kakaoAppKey) {
            console.log('🔧 카카오톡 공유 기능이 현재 환경에서 비활성화되었습니다.');
            return;
        }

        Kakao.init(kakaoAppKey);
        console.log('✅ 카카오 SDK 초기화 완료');
    } catch (error) {
        console.warn('⚠️ 카카오 SDK 초기화 실패:', error);
    }
}

async function shareToKakao(title, description, url) {
    try {
        // 카카오 SDK 및 초기화 상태 확인
        if (typeof Kakao === 'undefined') {
            console.warn('카카오 SDK가 로드되지 않았습니다.');
            copyURL();
            alert('링크가 복사되었습니다. 카카오톡에서 공유해보세요!');
            return;
        }

        // 카카오 SDK가 초기화되지 않았다면 초기화 시도
        if (!Kakao.isInitialized()) {
            if (typeof window.KakaoConfig !== 'undefined') {
                const kakaoAppKey = await window.KakaoConfig.getAppKey();
                if (kakaoAppKey) {
                    Kakao.init(kakaoAppKey);
                    console.log('✅ 카카오 SDK 늦은 초기화 완료');
                } else {
                    console.warn('카카오 앱 키를 가져올 수 없습니다.');
                    copyURL();
                    alert('링크가 복사되었습니다. 카카오톡에서 공유해보세요!');
                    return;
                }
            } else {
                console.warn('KakaoConfig가 로드되지 않았습니다.');
                copyURL();
                alert('링크가 복사되었습니다. 카카오톡에서 공유해보세요!');
                return;
            }
        }

        console.log('카카오톡 공유 시도:', { title, description, url });

        // 이미지 URL 가져오기 (OG 이미지 또는 기본 이미지)
        const imageUrl = document.querySelector('meta[property="og:image"]')?.content || 
                        window.location.origin + '/images/logo.png';

        try {
            await Kakao.Share.sendDefault({
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
                ]
            });
            console.log('✅ 카카오톡 공유 성공');
        } catch (shareError) {
            console.error('❌ 카카오톡 공유 실패:', shareError);
            copyURL();
            alert('링크가 복사되었습니다. 카카오톡에서 공유해보세요!');
        }
    } catch (error) {
        console.error('카카오톡 공유 중 오류:', error);
        copyURL();
        alert('링크가 복사되었습니다. 카카오톡에서 공유해보세요!');
    }
}

function copyURL() {
    // footer.js의 copyCurrentURL 함수를 사용
    if (typeof window.copyCurrentURL === 'function') {
        window.copyCurrentURL();
    } else {
        // 백업 방식
        navigator.clipboard.writeText(window.location.href).then(() => {
            alert('링크가 복사되었습니다!');
        }).catch(() => {
            const textArea = document.createElement('textarea');
            textArea.value = window.location.href;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            alert('링크가 복사되었습니다!');
        });
    }
}

// Footer 공유 기능과 동일한 방식으로 통합
// footer.js에서 이미 정의된 함수들을 사용하도록 함

// copyCurrentURL은 footer.js에서 제공하므로 제거

// 전역 함수 노출 (footer.js와 충돌하지 않도록 조건부 노출)
if (!window.shareContent) window.shareContent = shareContent;
if (!window.copyURL) window.copyURL = copyURL;
// shareCurrentPage와 copyCurrentURL은 footer.js에서 제공하므로 제거

// 공유 버튼 활성화
function enableSharingButtons() {
    // 공유 버튼들이 활성화되었음을 표시
    const shareButtons = document.querySelectorAll('.share-buttons button');
    shareButtons.forEach(button => {
        button.disabled = false;
        button.style.opacity = '1';
    });
    
    // 전역 플래그 설정
    window.contentLoaded = true;
    
    console.log('📢 공유 버튼 활성화 완료');
}

// 페이지 로드 시 초기화
window.addEventListener('DOMContentLoaded', initializeContentDetail);