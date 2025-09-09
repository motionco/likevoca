// 카카오 SDK 설정
// 이 파일은 .gitignore에 추가하여 Git에서 제외해야 합니다

const KakaoConfig = {
    kakaoJsKey: null,
    isInitialized: false,

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

    // 서버에서 카카오 키 가져오기
    async fetchKakaoKey() {
        try {
            // 프로덕션 환경에서만 키를 가져옴
            if (!this.isProduction()) {
                console.log('🔧 개발 환경: 카카오톡 공유 기능이 비활성화되었습니다.');
                return null;
            }

            if (this.kakaoJsKey) {
                return this.kakaoJsKey; // 이미 가져온 키가 있으면 재사용
            }

            const response = await fetch('/api/kakao-share', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ action: 'getKey' })
            });

            if (!response.ok) {
                console.warn('카카오 키를 가져오는데 실패했습니다:', response.status);
                return null;
            }

            const data = await response.json();
            if (data.success && data.kakaoJsKey) {
                this.kakaoJsKey = data.kakaoJsKey;
                console.log('✅ 카카오 JavaScript 키를 성공적으로 가져왔습니다.');
                return this.kakaoJsKey;
            }

            return null;
        } catch (error) {
            console.warn('카카오 키 요청 중 오류:', error);
            return null;
        }
    },

    // 카카오 앱 키 반환
    async getAppKey() {
        if (!this.kakaoJsKey) {
            await this.fetchKakaoKey();
        }
        return this.kakaoJsKey;
    },

    // 카카오 SDK 초기화 가능 여부
    async isAvailable() {
        const key = await this.getAppKey();
        return key !== null;
    }
};

// 전역으로 노출
window.KakaoConfig = KakaoConfig;