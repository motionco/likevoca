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
}

// Footer 로드 함수 (전역으로 노출)
window.loadFooter = async function() {
  if (window.footerManager) return;
  
  window.footerManager = new FooterManager();
  
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