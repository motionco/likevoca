// 카카오 SDK 설정
// 이 파일은 .gitignore에 추가하여 Git에서 제외해야 합니다

const KakaoConfig = {
    // 개발 환경 감지
    isDevelopment: () => {
        return window.location.hostname === 'localhost' || 
               window.location.hostname === '127.0.0.1' ||
               window.location.port !== '';
    },

    // 프로덕션 환경 감지
    isProduction: () => {
        return window.location.hostname === 'likevoca.com' || 
               window.location.hostname.includes('vercel.app');
    },

    // 카카오 앱 키 반환
    getAppKey: () => {
        if (KakaoConfig.isProduction()) {
            // 프로덕션: 실제 카카오 JavaScript 키
            return 'your_production_kakao_javascript_key_here';
        } else if (KakaoConfig.isDevelopment()) {
            // 개발: 테스트 키 또는 null (비활성화)
            return null; // 'your_development_kakao_key_here';
        }
        return null;
    },

    // 카카오 SDK 초기화 가능 여부
    isAvailable: () => {
        return KakaoConfig.getAppKey() !== null;
    }
};

// 전역으로 노출
window.KakaoConfig = KakaoConfig;