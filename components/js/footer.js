// Footer 컴포넌트 관리
class FooterManager {
  constructor() {
    this.footerContainer = null;
    this.languageSelect = null;
    this.init();
  }

  async init() {
    await this.loadFooter();
    this.setupEventListeners();
    this.setCurrentLanguage();
  }

  async loadFooter() {
    try {
      const footerContainer = document.getElementById('footer-container');
      if (!footerContainer) {
        console.warn('Footer container not found');
        return;
      }

      // 먼저 카카오 SDK와 Config 로드
      await this.loadKakaoScripts();

      // 현재 언어 감지
      const currentLang = this.getCurrentLanguage();
      const footerFile = `footer-${currentLang}.html`;
      
      const response = await fetch(`../../components/${footerFile}`);
      if (!response.ok) {
        // 언어별 footer가 없으면 영어 기본값 사용
        console.warn(`${footerFile} not found, falling back to footer-en.html`);
        const fallbackResponse = await fetch('../../components/footer-en.html');
        if (!fallbackResponse.ok) {
          throw new Error(`HTTP error! status: ${fallbackResponse.status}`);
        }
        const footerHTML = await fallbackResponse.text();
        footerContainer.innerHTML = footerHTML;
      } else {
        const footerHTML = await response.text();
        footerContainer.innerHTML = footerHTML;
      }
      
      this.footerContainer = footerContainer;
      
      // Language select 요소 참조 저장
      this.languageSelect = document.getElementById('footer-language-select');
      
    } catch (error) {
      console.error('Footer 로드 실패:', error);
    }
  }

  async loadKakaoScripts() {
    try {
      // 카카오 SDK 로드
      if (typeof Kakao === 'undefined') {
        await this.loadScript('https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js');
        console.log('✅ 카카오 SDK 스크립트 로드 완료');
      }

      // KakaoConfig 직접 생성 (외부 파일 로드 문제 해결)
      if (typeof window.KakaoConfig === 'undefined') {
        this.createKakaoConfig();
      }
    } catch (error) {
      console.warn('⚠️ 카카오 스크립트 로드 실패:', error);
    }
  }

  createKakaoConfig() {
    // KakaoConfig를 직접 생성하여 로드 문제 해결
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
    console.log('✅ KakaoConfig 생성 완료');
  }

  getConfigPath() {
    // 절대 경로 사용으로 경로 문제 해결
    return '/config/kakao-config.js';
  }

  loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Script load failed: ${src}`));
      
      // 카카오 SDK의 경우 integrity 추가
      if (src.includes('kakao_js_sdk')) {
        script.integrity = 'sha384-TiCUE00h649CAMonG018J2ujOgDKW/kVWlChEuu4jK2vxfAAD0eZxzCKakxg55G4';
        script.crossOrigin = 'anonymous';
      }
      
      document.head.appendChild(script);
    });
  }

  getCurrentLanguage() {
    // 현재 URL에서 언어 감지
    const currentPath = window.location.pathname;
    let currentLang = 'en'; // 기본값
    
    if (currentPath.includes('/en/')) {
      currentLang = 'en';
    } else if (currentPath.includes('/ja/')) {
      currentLang = 'ja';
    } else if (currentPath.includes('/zh/')) {
      currentLang = 'zh';
    } else if (currentPath.includes('/es/')) {
      currentLang = 'es';
    } else if (currentPath.includes('/ko/')) {
      currentLang = 'ko';
    }
    
    // localStorage에서 언어 확인
    const storedLang = localStorage.getItem('userLanguage');
    if (storedLang && ['ko', 'en', 'ja', 'zh', 'es'].includes(storedLang)) {
      currentLang = storedLang;
    }
    
    return currentLang;
  }

  setupEventListeners() {
    if (this.languageSelect) {
      this.languageSelect.addEventListener('change', (e) => {
        this.changeLanguage(e.target.value);
      });
    }
  }

  setCurrentLanguage() {
    if (!this.languageSelect) return;
    
    const currentLang = this.getCurrentLanguage();
    this.languageSelect.value = currentLang;
  }

  changeLanguage(newLang) {
    // 언어 변경 시 localStorage에 저장
    localStorage.setItem('userLanguage', newLang);
    
    // 현재 페이지의 언어별 버전으로 이동
    const currentPath = window.location.pathname;
    const currentPage = this.getCurrentPageName(currentPath);
    
    // 개발 환경과 프로덕션 환경 구분
    const isDev = window.location.hostname === 'localhost' || 
                  window.location.hostname === '127.0.0.1' || 
                  window.location.port === '5595';
    
    let newUrl;
    if (isDev) {
      newUrl = `/locales/${newLang}/${currentPage}`;
    } else {
      newUrl = `/${newLang}/${currentPage}`;
    }
    
    window.location.href = newUrl;
  }

  getCurrentPageName(path) {
    // URL에서 현재 페이지 이름 추출
    const segments = path.split('/');
    const lastSegment = segments[segments.length - 1];
    
    // 기본 페이지들 매핑
    if (lastSegment === '' || lastSegment === 'index.html') {
      return 'index.html';
    }
    
    // .html 확장자가 없는 경우 추가
    if (!lastSegment.includes('.html')) {
      return `${lastSegment}.html`;
    }
    
    return lastSegment;
  }

  // 다국어 번역 적용
  async applyTranslations() {
    if (!this.footerContainer) return;
    
    const currentLang = localStorage.getItem('userLanguage') || 'en';
    
    try {
      const response = await fetch(`../../locales/${currentLang}/translations.json`);
      if (!response.ok) return;
      
      const translations = await response.json();
      const footerTranslations = translations.footer || {};
      
      // Footer 내의 번역 가능한 요소들에 번역 적용
      const translatableElements = this.footerContainer.querySelectorAll('[data-translate]');
      translatableElements.forEach(element => {
        const key = element.getAttribute('data-translate');
        if (footerTranslations[key]) {
          element.textContent = footerTranslations[key];
        }
      });
      
    } catch (error) {
      console.error('Footer 번역 적용 실패:', error);
    }
  }

  // 소셜 공유 기능 초기화
  initializeSocialSharing() {
    this.initializeKakaoSDK();
    console.log('✅ 소셜 공유 기능이 초기화되었습니다.');
  }

  async initializeKakaoSDK() {
    try {
      // 카카오 SDK 로드 확인
      if (typeof Kakao === 'undefined') {
        console.warn('⚠️ 카카오 SDK가 로드되지 않았습니다.');
        return;
      }

      if (Kakao.isInitialized()) {
        return; // 이미 초기화됨
      }

      // KakaoConfig를 통해 키 가져오기
      if (typeof window.KakaoConfig !== 'undefined') {
        const kakaoAppKey = await window.KakaoConfig.getAppKey();
        
        if (!kakaoAppKey) {
          console.log('🔧 카카오톡 공유 기능이 현재 환경에서 비활성화되었습니다.');
          return;
        }

        Kakao.init(kakaoAppKey);
        console.log('✅ Footer 카카오 SDK 초기화 완료');
      } else {
        console.warn('⚠️ KakaoConfig가 로드되지 않았습니다.');
      }
    } catch (error) {
      console.warn('⚠️ Footer 카카오 SDK 초기화 실패:', error);
    }
  }
}

// 전역 소셜 공유 함수들
window.shareCurrentPage = function(platform) {
  // 현재 페이지 URL 가져오기 및 언어 감지
  let currentUrl = window.location.href;
  
  // 현재 언어 감지 (URL 경로에서)
  const pathMatch = window.location.pathname.match(/\/([a-z]{2})\//);
  const currentLanguage = pathMatch ? pathMatch[1] : 'ko';
  console.log('🌐 현재 감지된 언어:', currentLanguage);
  
  // HTML 태그 제거 함수 (강화된 버전)
  function stripHtml(html) {
    if (!html || typeof html !== 'string') return '';
    
    try {
      // 임시 DOM 요소 생성하여 HTML 파싱
      const tmp = document.createElement('div');
      tmp.innerHTML = html;
      
      // 텍스트 추출
      let text = tmp.textContent || tmp.innerText || '';
      
      // 추가 정리: 연속된 공백 및 개행 제거
      text = text.replace(/\s+/g, ' ').trim();
      
      // 최대 길이 제한 (공유 시 너무 긴 텍스트 방지)
      if (text.length > 300) {
        text = text.substring(0, 297) + '...';
      }
      
      return text;
    } catch (error) {
      console.warn('HTML 태그 제거 중 오류:', error);
      // 폴백: 정규식으로 HTML 태그 제거
      return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    }
  }

  // 현재 페이지의 메타데이터 추출
  let pageTitle, pageDescription, pageImage;
  
  // 페이지 타입 감지
  const isDetailPage = window.location.pathname.includes('content-detail.html') || 
                       (window.location.pathname.includes('community') && window.location.search.includes('id='));
  const isCommunityPage = window.location.pathname.includes('community');
  const isHomePage = window.location.pathname === '/' || window.location.pathname.includes('index.html');
  
  console.log('📄 페이지 타입:', { isDetailPage, isCommunityPage, isHomePage });
  
  // 기본적으로 현재 페이지의 메타태그에서 정보 추출
  const currentTitle = document.title;
  const currentDescription = document.querySelector('meta[name="description"]')?.content || '';
  let currentImage = document.querySelector('meta[property="og:image"]')?.content || 'https://likevoca.vercel.app/assets/hero.webp';
  
  // Firebase 이미지 우선 검색 (모든 페이지에서)
  const firebaseImageSources = [
    () => window.shareMetadata?.image,
    () => window.imageUrl,
    () => window.coverImage,
    () => window.thumbnailUrl,
    () => window.featuredImage,
    () => document.querySelector('meta[property="og:image"]')?.content
  ];
  
  for (const source of firebaseImageSources) {
    const image = source();
    if (image && typeof image === 'string' && image.trim() && 
        !image.includes('/assets/') && !image.includes('hero.')) {
      currentImage = image;
      console.log('🔥 Firebase 이미지 발견:', currentImage);
      break;
    }
  }
  
  console.log('📋 페이지 기본 메타데이터:', { 
    title: currentTitle, 
    description: currentDescription.substring(0, 100),
    image: currentImage 
  });
  
  if (isDetailPage) {
    console.log('🔍 콘텐츠/커뮤니티 상세 페이지 공유 시도');
    
    // URL을 올바른 언어별 형태로 정규화
    const urlParams = new URLSearchParams(window.location.search);
    const contentId = urlParams.get('id');
    if (contentId) {
      // 언어별 올바른 URL 생성 (전체 콘텐츠 ID 유지, 추적 파라미터 제거)
      currentUrl = `https://www.likevoca.com/${currentLanguage}/content-detail.html?id=${contentId}`;
      console.log('📝 언어별 URL 생성 (깨끗한 URL):', currentUrl);
    }
    
    // 전역 공유 메타데이터가 있으면 우선 사용 (가장 신뢰할 수 있는 데이터)
    if (window.shareMetadata) {
      console.log('✅ 전역 공유 메타데이터 사용');
      pageTitle = window.shareMetadata.title + ' - LikeVoca';
      pageDescription = stripHtml(window.shareMetadata.description);
      pageImage = window.shareMetadata.image || currentImage; // Firebase 이미지 이미 currentImage에 반영됨
      console.log('🎯 메타데이터 기반 공유:', { 
        title: pageTitle.substring(0, 50), 
        description: pageDescription.substring(0, 100),
        image: pageImage 
      });
    } else if (!window.contentLoaded) {
      // 콘텐츠가 아직 로드되지 않았다면 잠시 대기 (최대 5초)
      const waitCount = window.shareWaitCount || 0;
      if (waitCount < 10) {
        console.log(`⏳ 콘텐츠 로딩 대기 중... (${waitCount + 1}/10)`);
        window.shareWaitCount = waitCount + 1;
        setTimeout(() => shareCurrentPage(platform), 500);
        return;
      } else {
        console.warn('⚠️ 콘텐츠 로딩 타임아웃, 기본 공유 진행');
        window.shareWaitCount = 0; // 리셋
      }
    } else {
      // 상세 페이지 - 폴백: DOM에서 직접 가져오기
      const contentTitle = document.getElementById('contentTitle')?.textContent;
      const contentSummary = document.getElementById('contentSummary')?.textContent;
      const contentBody = document.getElementById('contentBody');
      
      console.log('📝 DOM에서 콘텐츠 추출');
      
      pageTitle = contentTitle || currentTitle || 'LikeVoca';
      pageImage = currentImage; // 기본 OG 이미지 사용
      
      // 메타 태그에서 업데이트된 설명 우선 확인
      const metaDescription = document.querySelector('meta[name="description"]')?.content;
      
      let rawDescription = '';
      if (contentSummary && contentSummary.trim() && !contentSummary.includes('콘텐츠 로딩 중')) {
        rawDescription = contentSummary;
        console.log('✅ Summary 사용:', rawDescription.substring(0, 100));
      } else if (metaDescription && !metaDescription.includes('콘텐츠 로딩 중') && !metaDescription.includes('LikeVoca 커뮤니티 콘텐츠')) {
        rawDescription = metaDescription;
        console.log('✅ Meta Description 사용:', rawDescription.substring(0, 100));
      } else if (contentBody && contentBody.textContent && contentBody.textContent.trim()) {
        rawDescription = contentBody.textContent.substring(0, 300);
        console.log('✅ Body Text 사용:', rawDescription.substring(0, 100));
      } else {
        rawDescription = 'AI 기반 맞춤형 언어학습 플랫폼';
        console.log('⚠️ 기본 설명 사용');
      }
      
      pageDescription = stripHtml(rawDescription);
      console.log('🎯 최종 Description:', pageDescription.substring(0, 100));
    }
  } else {
    // 일반 페이지 (홈페이지, 커뮤니티 목록 등)
    console.log('🏠 일반 페이지 공유 시도');
    
    // 현재 페이지의 메타태그 정보 사용
    pageTitle = currentTitle;
    pageDescription = stripHtml(currentDescription) || 'LikeVoca - AI 기반 맞춤형 언어학습 플랫폼';
    pageImage = currentImage;
    
    console.log('📄 일반 페이지 메타데이터:', { 
      title: pageTitle, 
      description: pageDescription.substring(0, 100),
      image: pageImage 
    });
  }
  
  // 최종 메타데이터가 설정되지 않은 경우 폴백
  if (!pageTitle || pageTitle === 'LikeVoca') {
    pageTitle = document.title || 'LikeVoca';
    pageDescription = document.querySelector('meta[name="description"]')?.content || 'AI 기반 맞춤형 언어학습 플랫폼';
  }
  
  // 길이 제한 (소셜 미디어 플랫폼별 권장 길이)
  const shortTitle = pageTitle.length > 60 ? pageTitle.substring(0, 57) + '...' : pageTitle;
  const shortDescription = pageDescription.length > 160 ? pageDescription.substring(0, 157) + '...' : pageDescription;

  switch (platform) {
    case 'kakao':
      shareToKakao(shortTitle, shortDescription, currentUrl);
      break;
    case 'facebook':
      // Facebook 공유 전 메타태그 실시간 업데이트
      updateSocialMetaTags(shortTitle, shortDescription, currentUrl, pageImage);
      validateSocialMetaTags('Facebook');
      
      console.log('📘 Facebook 공유:', { title: shortTitle, description: shortDescription, image: pageImage });
      
      const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}&quote=${encodeURIComponent(shortDescription)}`;
      window.open(facebookUrl, '_blank', 'width=600,height=500,scrollbars=yes,resizable=yes');
      break;
    case 'twitter':
      // X(Twitter)는 제목과 설명 모두 포함
      const twitterText = shortDescription ? `${shortTitle}\n\n${shortDescription}` : shortTitle;
      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(twitterText)}&url=${encodeURIComponent(currentUrl)}`;
      
      console.log('🐦 X(Twitter) 공유:', { text: twitterText, url: currentUrl });
      
      window.open(twitterUrl, '_blank', 'width=600,height=400');
      break;
    case 'linkedin':
      // LinkedIn 공유 전 메타태그 실시간 업데이트
      updateSocialMetaTags(shortTitle, shortDescription, currentUrl, pageImage);
      validateSocialMetaTags('LinkedIn');
      
      console.log('💼 LinkedIn 공유:', { title: shortTitle, description: shortDescription, url: currentUrl, image: pageImage });
      
      // LinkedIn은 주로 OG 태그를 읽지만, URL 파라미터도 지원
      const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}&title=${encodeURIComponent(shortTitle)}&summary=${encodeURIComponent(shortDescription)}`;
      window.open(linkedinUrl, '_blank', 'width=600,height=500,scrollbars=yes,resizable=yes');
      break;
    case 'threads':
      // Threads는 제목과 설명 포함
      const threadsText = shortDescription ? `${shortTitle}\n\n${shortDescription}` : shortTitle;
      const threadsUrl = `https://www.threads.net/intent/post?text=${encodeURIComponent(threadsText + '\n\n' + currentUrl)}`;
      window.open(threadsUrl, '_blank', 'width=600,height=400');
      break;
    case 'reddit':
      // Reddit 공유
      const redditUrl = `https://www.reddit.com/submit?url=${encodeURIComponent(currentUrl)}&title=${encodeURIComponent(shortTitle)}`;
      
      console.log('🟠 Reddit 공유:', { title: shortTitle, url: currentUrl });
      
      window.open(redditUrl, '_blank', 'width=600,height=500,scrollbars=yes,resizable=yes');
      break;
    case 'telegram':
      // Telegram 공유
      const telegramText = shortDescription ? `${shortTitle}\n\n${shortDescription}\n\n${currentUrl}` : `${shortTitle}\n\n${currentUrl}`;
      const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(telegramText)}`;
      
      console.log('✈️ Telegram 공유:', { text: telegramText, url: currentUrl });
      
      window.open(telegramUrl, '_blank', 'width=600,height=400');
      break;
    case 'line':
      // LINE 공유
      const lineText = shortDescription ? `${shortTitle}\n${shortDescription}` : shortTitle;
      const lineUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(lineText)}`;
      
      console.log('💚 LINE 공유:', { text: lineText, url: currentUrl });
      
      window.open(lineUrl, '_blank', 'width=600,height=500,scrollbars=yes,resizable=yes');
      break;
    case 'weibo':
      // 웨이보 공유
      const weiboText = shortDescription ? `${shortTitle} - ${shortDescription}` : shortTitle;
      const weiboUrl = `https://service.weibo.com/share/share.php?url=${encodeURIComponent(currentUrl)}&title=${encodeURIComponent(weiboText)}`;
      
      console.log('🔴 웨이보 공유:', { title: weiboText, url: currentUrl });
      
      window.open(weiboUrl, '_blank', 'width=600,height=500,scrollbars=yes,resizable=yes');
      break;
    case 'qq':
      // QQ 공유
      const qqText = shortDescription ? `${shortTitle} - ${shortDescription}` : shortTitle;
      const qqUrl = `https://connect.qq.com/widget/shareqq/index.html?url=${encodeURIComponent(currentUrl)}&title=${encodeURIComponent(qqText)}`;
      
      console.log('🔵 QQ 공유:', { title: qqText, url: currentUrl });
      
      window.open(qqUrl, '_blank', 'width=600,height=500,scrollbars=yes,resizable=yes');
      break;
    case 'whatsapp':
      // WhatsApp 공유
      const whatsappText = shortDescription ? `${shortTitle}\n\n${shortDescription}\n\n${currentUrl}` : `${shortTitle}\n\n${currentUrl}`;
      const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(whatsappText)}`;
      
      console.log('💬 WhatsApp 공유:', { text: whatsappText });
      
      window.open(whatsappUrl, '_blank', 'width=600,height=500,scrollbars=yes,resizable=yes');
      break;
    default:
      console.warn('지원하지 않는 플랫폼:', platform);
  }
};

window.shareToKakao = async function(title, description, url) {
  try {
    console.log('🔥 카카오톡 공유 함수 호출됨:', { 
      title: title.substring(0, 50), 
      description: description.substring(0, 100),
      url 
    });
    
    // 카카오 SDK 및 초기화 상태 확인
    if (typeof Kakao === 'undefined') {
      console.warn('카카오 SDK가 로드되지 않았습니다.');
      copyCurrentURL();
      showShareMessage('링크가 복사되었습니다. 카카오톡에서 공유해보세요!');
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
          copyCurrentURL();
          showShareMessage('링크가 복사되었습니다. 카카오톡에서 공유해보세요!');
          return;
        }
      } else {
        console.warn('KakaoConfig가 로드되지 않았습니다.');
        copyCurrentURL();
        showShareMessage('링크가 복사되었습니다. 카카오톡에서 공유해보세요!');
        return;
      }
    }

    console.log('카카오톡 공유 시도:', { title, description, url });

    // 이미지 URL 선택 (우선순위: 전역 메타데이터 > OG 태그 > 기본 이미지)
    let imageUrl;
    if (window.shareMetadata?.image) {
      imageUrl = window.shareMetadata.image;
      console.log('✅ 메타데이터에서 이미지 사용');
    } else {
      const ogImage = document.querySelector('meta[property="og:image"]')?.content;
      imageUrl = ogImage || 'https://likevoca.com/assets/hero.jpeg';
      console.log('📷 기본 이미지 사용');
    }
    
    // 이미지 URL 유효성 검증
    if (!imageUrl || !imageUrl.startsWith('http')) {
      imageUrl = 'https://likevoca.com/assets/hero.jpeg';
      console.warn('⚠️ 유효하지 않은 이미지 URL, 기본 이미지로 대체');
    }

    // HTML 태그가 있는지 다시 한번 확인
    if (title.includes('<') || description.includes('<')) {
      console.warn('⚠️ HTML 태그가 여전히 포함됨:', { title, description });
    }

    try {
      const shareData = {
        objectType: 'feed',
        content: {
          title: title,
          description: description,
          imageUrl: imageUrl,
          link: {
            mobileWebUrl: url,
            webUrl: url
          }
        },
        buttons: [
          {
            title: '웹으로 이동',
            link: {
              mobileWebUrl: url,
              webUrl: url
            }
          }
        ]
      };
      
      console.log('📤 카카오 공유 데이터:', shareData);
      
      await Kakao.Share.sendDefault(shareData);
      console.log('✅ 카카오톡 공유 성공');
    } catch (shareError) {
      console.error('❌ 카카오톡 공유 실패:', shareError);
      copyCurrentURL();
      showShareMessage('링크가 복사되었습니다. 카카오톡에서 공유해보세요!');
    }
  } catch (error) {
    console.error('카카오톡 공유 중 오류:', error);
    copyCurrentURL();
    showShareMessage('링크가 복사되었습니다. 카카오톡에서 공유해보세요!');
  }
};

window.copyCurrentURL = function() {
  const currentUrl = window.location.href;
  
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(currentUrl).then(() => {
      console.log('링크가 클립보드에 복사되었습니다.');
    }).catch(err => {
      console.error('클립보드 복사 실패:', err);
      fallbackCopyURL(currentUrl);
    });
  } else {
    fallbackCopyURL(currentUrl);
  }
};

window.showShareMessage = function(message) {
  // 간단한 토스트 메시지 표시
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #333;
    color: white;
    padding: 12px 20px;
    border-radius: 6px;
    font-size: 14px;
    z-index: 9999;
    opacity: 0;
    transition: opacity 0.3s ease;
    max-width: 300px;
  `;
  toast.textContent = message;
  document.body.appendChild(toast);
  
  // 애니메이션
  setTimeout(() => toast.style.opacity = '1', 10);
  
  // 3초 후 제거
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => document.body.removeChild(toast), 300);
  }, 3000);
};

function fallbackCopyURL(url) {
  const textArea = document.createElement('textarea');
  textArea.value = url;
  textArea.style.position = 'fixed';
  textArea.style.left = '-999999px';
  textArea.style.top = '-999999px';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  
  try {
    document.execCommand('copy');
    console.log('링크가 클립보드에 복사되었습니다.');
  } catch (err) {
    console.error('클립보드 복사 실패:', err);
  }
  
  document.body.removeChild(textArea);
}

// 소셜 미디어 메타태그 실시간 업데이트 함수
function updateSocialMetaTags(title, description, url, image) {
  console.log('🔄 소셜 미디어 메타태그 실시간 업데이트');
  
  // 메타태그를 업데이트하거나 생성하는 헬퍼 함수
  const updateOrCreateMeta = (property, content) => {
    let meta = document.querySelector(`meta[property="${property}"]`) || 
              document.querySelector(`meta[name="${property}"]`);
    
    if (!meta) {
      meta = document.createElement('meta');
      if (property.startsWith('og:') || property.startsWith('twitter:')) {
        meta.setAttribute('property', property);
      } else {
        meta.setAttribute('name', property);
      }
      document.head.appendChild(meta);
    }
    
    meta.setAttribute('content', content);
  };
  
  // 기본 메타태그 업데이트
  updateOrCreateMeta('description', description);
  
  // Open Graph 메타태그 업데이트
  updateOrCreateMeta('og:title', title);
  updateOrCreateMeta('og:description', description);
  updateOrCreateMeta('og:url', url);
  updateOrCreateMeta('og:image', image);
  
  // Twitter Card 메타태그 업데이트
  updateOrCreateMeta('twitter:title', title);
  updateOrCreateMeta('twitter:description', description);
  updateOrCreateMeta('twitter:image', image);
  
  console.log('✅ 메타태그 업데이트 완료:', { title: title.substring(0, 30), description: description.substring(0, 50), url, image });
}

// 소셜 미디어 메타태그 검증 함수
function validateSocialMetaTags(platform) {
  console.log(`🔍 ${platform} 메타태그 검증`);
  
  const metaTags = {
    'og:title': document.querySelector('meta[property="og:title"]')?.content,
    'og:description': document.querySelector('meta[property="og:description"]')?.content,
    'og:url': document.querySelector('meta[property="og:url"]')?.content,
    'og:image': document.querySelector('meta[property="og:image"]')?.content,
    'og:site_name': document.querySelector('meta[property="og:site_name"]')?.content,
    'og:type': document.querySelector('meta[property="og:type"]')?.content,
  };
  
  // Facebook 특화 검증
  if (platform === 'Facebook') {
    metaTags['fb:app_id'] = document.querySelector('meta[property="fb:app_id"]')?.content;
    metaTags['article:author'] = document.querySelector('meta[property="article:author"]')?.content;
  }
  
  // LinkedIn 특화 검증
  if (platform === 'LinkedIn') {
    metaTags['og:image:width'] = document.querySelector('meta[property="og:image:width"]')?.content;
    metaTags['og:image:height'] = document.querySelector('meta[property="og:image:height"]')?.content;
  }
  
  console.table(metaTags);
  
  // 누락된 중요 태그 확인
  const missingTags = [];
  const criticalTags = ['og:title', 'og:description', 'og:url', 'og:image'];
  
  criticalTags.forEach(tag => {
    if (!metaTags[tag] || metaTags[tag].includes('로딩 중')) {
      missingTags.push(tag);
    }
  });
  
  if (missingTags.length > 0) {
    console.warn(`⚠️ ${platform} 공유에 필요한 메타태그 누락:`, missingTags);
  } else {
    console.log(`✅ ${platform} 메타태그 검증 통과`);
  }
  
  return missingTags.length === 0;
}

// Footer 로드 함수 (전역으로 노출)
window.loadFooter = async function() {
  if (window.footerManager) return;
  
  window.footerManager = new FooterManager();
  
  // Footer 로드 완료 후 소셜 공유 기능 초기화
  setTimeout(() => {
    if (window.footerManager) {
      window.footerManager.initializeSocialSharing();
    }
  }, 1000); // 카카오 SDK 로딩을 위해 시간 증가
  
  // 번역 적용 (language-utils.js와 연동)
  if (typeof window.applyLanguage === 'function') {
    setTimeout(() => {
      window.footerManager.applyTranslations();
    }, 100);
  }
};

// DOM이 로드되면 자동으로 Footer 로드
document.addEventListener('DOMContentLoaded', () => {
  // footer-container가 있는 페이지에서만 로드
  if (document.getElementById('footer-container')) {
    window.loadFooter();
  }
});

// 페이지 언어 변경 시 Footer 번역도 업데이트
document.addEventListener('languageChanged', (e) => {
  if (window.footerManager) {
    window.footerManager.applyTranslations();
    window.footerManager.setCurrentLanguage();
  }
});