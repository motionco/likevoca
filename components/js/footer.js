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
  const currentUrl = window.location.href;
  
  // HTML 태그 제거 함수
  function stripHtml(html) {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  }

  // content-detail 페이지인 경우 실제 콘텐츠 정보 사용
  let pageTitle, pageDescription;
  
  if (window.location.pathname.includes('content-detail.html')) {
    const contentTitle = document.getElementById('contentTitle')?.textContent;
    const contentSummary = document.getElementById('contentSummary')?.textContent;
    
    pageTitle = contentTitle || document.title || 'LikeVoca';
    pageDescription = contentSummary ? stripHtml(contentSummary) : document.querySelector('meta[name="description"]')?.content || 'AI 기반 맞춤형 언어학습 플랫폼';
  } else {
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
      // Facebook은 자동으로 OG 태그를 읽어오므로 URL만 필요
      const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`;
      window.open(facebookUrl, '_blank', 'width=600,height=400');
      break;
    case 'twitter':
      // X(Twitter)는 제목과 설명 모두 포함
      const twitterText = shortDescription ? `${shortTitle}\n\n${shortDescription}` : shortTitle;
      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(twitterText)}&url=${encodeURIComponent(currentUrl)}`;
      window.open(twitterUrl, '_blank', 'width=600,height=400');
      break;
    case 'linkedin':
      // LinkedIn은 제목, 요약, URL 모두 전달
      const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}&title=${encodeURIComponent(shortTitle)}&summary=${encodeURIComponent(shortDescription)}`;
      window.open(linkedinUrl, '_blank', 'width=600,height=400');
      break;
    case 'threads':
      // Threads는 제목과 설명 포함
      const threadsText = shortDescription ? `${shortTitle}\n\n${shortDescription}` : shortTitle;
      const threadsUrl = `https://www.threads.net/intent/post?text=${encodeURIComponent(threadsText + '\n\n' + currentUrl)}`;
      window.open(threadsUrl, '_blank', 'width=600,height=400');
      break;
    default:
      console.warn('지원하지 않는 플랫폼:', platform);
  }
};

window.shareToKakao = async function(title, description, url) {
  try {
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

    // 더 나은 이미지 URL 가져오기
    const ogImage = document.querySelector('meta[property="og:image"]')?.content;
    const imageUrl = ogImage || window.location.origin + '/images/logo.png';

    try {
      await Kakao.Share.sendDefault({
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
      });
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