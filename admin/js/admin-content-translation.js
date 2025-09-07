// Gemini API를 사용한 콘텐츠 번역 전용 모듈
// AI 단어장과 구분되는 별도 번역 기능

// 환경 감지 (더 정교한 감지)
const isLocalEnvironment = 
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.hostname.includes('localhost') ||
    window.location.protocol === 'file:';

const isProductionEnvironment = 
    !isLocalEnvironment && 
    (window.location.hostname.includes('vercel.app') || 
     window.location.hostname.includes('likevoca.com') ||
     window.location.protocol === 'https:');

// Gemini API를 사용한 실제 번역 기능
export async function translateContentWithGemini(text, fromLang, toLang) {
    // 같은 언어인 경우 원본 그대로 반환
    if (fromLang === toLang) {
        return text;
    }
    
    console.log('🌍 콘텐츠 번역 시작:', { 
        fromLang, 
        toLang, 
        textLength: text.length,
        environment: isLocalEnvironment ? 'LOCAL' : 'PRODUCTION',
        hostname: window.location.hostname
    });
    
    // 로컬 환경에서는 fallback 번역 사용
    if (isLocalEnvironment) {
        console.log('🏠 로컬 환경 감지 - fallback 번역 사용');
        await new Promise(resolve => setTimeout(resolve, 800)); // 번역 지연 시뮬레이션
        return fallbackTranslation(text, fromLang, toLang);
    }
    
    // 배포 환경에서 Gemini API 사용
    if (isProductionEnvironment) {
        console.log('🚀 배포 환경 감지 - Gemini API 사용 시도');
    }
    
    try {
        // 배포 환경에서만 Gemini API 호출
        const translationPrompt = createContentTranslationPrompt(text, fromLang, toLang);
        
        // Gemini API 호출
        const requestBody = {
            contents: [
                {
                    role: "user",
                    parts: [
                        {
                            text: translationPrompt
                        }
                    ]
                }
            ],
            generationConfig: {
                temperature: 0.3, // 번역은 창의성보다 정확성이 중요
                topK: 20,
                topP: 0.8,
                maxOutputTokens: 2048
            }
        };
        
        const response = await fetch("/api/gemini", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
            throw new Error(`Gemini API 오류: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
            throw new Error("유효하지 않은 API 응답 구조");
        }
        
        const translatedText = data.candidates[0].content.parts[0].text.trim();
        console.log('✅ Gemini API 번역 성공:', { 
            originalLength: text.length,
            translatedLength: translatedText.length,
            fromLang, 
            toLang 
        });
        
        // HTML 태그가 포함된 경우 원본 HTML 구조 유지하면서 텍스트만 번역
        if (text.includes('<') && text.includes('>')) {
            return preserveHtmlStructure(text, translatedText);
        }
        
        return translatedText;
        
    } catch (error) {
        console.error('Gemini API 번역 중 오류:', error);
        
        // API 오류 시 fallback으로 기존 맵핑 사용
        return fallbackTranslation(text, fromLang, toLang);
    }
}

// 콘텐츠 번역 전용 프롬프트 생성
function createContentTranslationPrompt(text, fromLang, toLang) {
    const languageNames = {
        ko: '한국어',
        en: '영어', 
        ja: '일본어',
        zh: '중국어',
        es: '스페인어'
    };
    
    const sourceLanguage = languageNames[fromLang] || fromLang;
    const targetLanguage = languageNames[toLang] || toLang;
    
    return `
당신은 LikeVoca 콘텐츠 관리 시스템을 위한 전문 번역가입니다. 
다음 ${sourceLanguage} 텍스트를 ${targetLanguage}로 정확하고 자연스럽게 번역해주세요.

🎯 번역 요구사항:
1. 원본 텍스트의 의미와 뉘앙스를 정확히 전달
2. 목적 언어로 자연스럽고 읽기 쉽게 번역
3. 콘텐츠 관리 시스템의 공식적이고 전문적인 톤 유지
4. HTML 태그가 있다면 태그는 그대로 유지하고 텍스트만 번역
5. 전문 용어는 해당 언어의 표준 용어 사용
6. 사용자 가이드, FAQ, 매뉴얼 등의 맥락에 맞는 번역

📝 번역할 텍스트:
${text}

⚠️ 주의사항:
- 번역 결과만 출력하세요 (설명이나 부가 설명 없이)
- HTML 태그가 있다면 태그 구조를 정확히 유지하세요
- 줄바꿈과 서식을 원본과 동일하게 유지하세요
- 번역할 수 없는 고유명사나 브랜드명(LikeVoca 등)은 원문 유지
- 기술 용어는 해당 언어권에서 통용되는 표준 용어 사용
- 사용자 인터페이스 요소와 일치하는 용어 선택

콘텐츠 유형별 번역 가이드:
- FAQ: 자주 묻는 질문 형식에 맞는 자연스러운 번역
- 가이드: 단계별 설명이 명확하게 전달되도록 번역
- 매뉴얼: 기술 문서의 정확성과 명확성 중시
- 공지사항: 공식적이고 정중한 톤 유지

번역 결과:`;
}

// HTML 구조를 유지하면서 텍스트만 번역하는 헬퍼 함수
function preserveHtmlStructure(originalHtml, translatedText) {
    try {
        // HTML이 단순한 경우 (태그가 적은 경우)
        const htmlTags = originalHtml.match(/<[^>]+>/g) || [];
        
        if (htmlTags.length <= 5) {
            // 단순한 HTML 구조인 경우 텍스트 부분만 교체
            const parser = new DOMParser();
            const doc = parser.parseFromString(originalHtml, 'text/html');
            const originalText = doc.body.textContent || doc.body.innerText || '';
            
            // 원본 HTML에서 텍스트 부분만 번역된 텍스트로 교체
            return originalHtml.replace(originalText, translatedText);
        }
        
        // 복잡한 HTML인 경우는 번역된 텍스트를 그대로 반환
        return translatedText;
        
    } catch (error) {
        console.error('HTML 구조 유지 중 오류:', error);
        return translatedText;
    }
}

// 로컬/API 실패 시 fallback 번역 (포괄적 번역 맵핑)
function fallbackTranslation(text, fromLang, toLang) {
    console.log('Fallback 번역 사용:', { fromLang, toLang, text: text.substring(0, 50) + '...' });
    
    // HTML 태그 제거 후 텍스트만 추출
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = text;
    const plainText = tempDiv.textContent || tempDiv.innerText || text;
    
    // 확장된 번역 맵핑 (더 많은 표현과 문장 포함)
    const translations = {
        ko: {
            en: {
                // 기본 인사 및 상용구
                '안녕하세요': 'Hello',
                '감사합니다': 'Thank you',
                '죄송합니다': 'Sorry',
                '환영합니다': 'Welcome',
                
                // 콘텐츠 유형
                '자주 묻는 질문': 'Frequently Asked Questions',
                '사용자 매뉴얼': 'User Manual',
                '학습 가이드': 'Learning Guide',
                '공지사항': 'Notice',
                '커뮤니티': 'Community',
                '도움말': 'Help',
                '소개': 'Introduction',
                
                // 일반적인 동사와 문장
                '설명합니다': 'explains',
                '안내합니다': 'guides',
                '제공합니다': 'provides',
                '지원합니다': 'supports',
                '도움을 드립니다': 'helps you',
                '문의하세요': 'contact us',
                '확인하세요': 'check',
                '시작하세요': 'get started',
                
                // 시스템 관련
                '새로운 기능': 'new features',
                '업데이트': 'update',
                '버전': 'version',
                '시스템': 'system',
                '설정': 'settings',
                '계정': 'account',
                '프로필': 'profile',
                '로그인': 'login',
                '회원가입': 'sign up',
                
                // 문장 패턴
                '이 기능은': 'This feature',
                '사용자는': 'Users can',
                '시스템이': 'The system',
                '다음과 같습니다': 'as follows',
                '단계별로': 'step by step',
                '자세한 내용은': 'for more details',
            },
            ja: {
                // 기본 인사 및 상용구
                '안녕하세요': 'こんにちは',
                '감사합니다': 'ありがとうございます',
                '죄송합니다': 'すみません',
                '환영합니다': 'いらっしゃいませ',
                
                // 콘텐츠 유형
                '자주 묻는 질문': 'よくある質問',
                '사용자 매뉴얼': 'ユーザーマニュアル',
                '학습 가이드': '学習ガイド',
                '공지사항': 'お知らせ',
                '커뮤니티': 'コミュニティ',
                '도움말': 'ヘルプ',
                '소개': '紹介',
                
                // 일반적인 동사와 문장
                '설명합니다': '説明します',
                '안내합니다': 'ご案内します',
                '제공합니다': '提供します',
                '지원합니다': 'サポートします',
                '도움을 드립니다': 'お手伝いします',
                '문의하세요': 'お問い合わせください',
                '확인하세요': 'ご確認ください',
                '시작하세요': '開始してください',
                
                // 시스템 관련
                '새로운 기능': '新機能',
                '업데이트': 'アップデート',
                '버전': 'バージョン',
                '시스템': 'システム',
                '설정': '設定',
                '계정': 'アカウント',
                '프로필': 'プロフィール',
                '로그인': 'ログイン',
                '회원가입': '会員登録',
                
                // 문장 패턴
                '이 기능은': 'この機能は',
                '사용자는': 'ユーザーは',
                '시스템이': 'システムが',
                '다음과 같습니다': '以下の通りです',
                '단계별로': 'ステップバイステップで',
                '자세한 내용은': '詳細については',
            },
            zh: {
                // 기본 인사 및 상용구
                '안녕하세요': '你好',
                '감사합니다': '谢谢',
                '죄송합니다': '对不起',
                '환영합니다': '欢迎',
                
                // 콘텐츠 유형
                '자주 묻는 질문': '常见问题',
                '사용자 매뉴얼': '用户手册',
                '학습 가이드': '学习指南',
                '공지사항': '公告',
                '커뮤니티': '社区',
                '도움말': '帮助',
                '소개': '介绍',
                
                // 일반적인 동사와 문장
                '설명합니다': '说明',
                '안내합니다': '指导',
                '제공합니다': '提供',
                '지원합니다': '支持',
                '도움을 드립니다': '为您提供帮助',
                '문의하세요': '请联系',
                '확인하세요': '请确认',
                '시작하세요': '开始',
                
                // 시스템 관련
                '새로운 기능': '新功能',
                '업데이트': '更新',
                '버전': '版本',
                '시스템': '系统',
                '설정': '设置',
                '계정': '账户',
                '프로필': '个人资料',
                '로그인': '登录',
                '회원가입': '注册',
                
                // 문장 패턴
                '이 기능은': '此功能',
                '사용자는': '用户可以',
                '시스템이': '系统',
                '다음과 같습니다': '如下所示',
                '단계별로': '逐步',
                '자세한 내용은': '详细信息',
            },
            es: {
                // 기본 인사 및 상용구
                '안녕하세요': 'Hola',
                '감사합니다': 'Gracias',
                '죄송합니다': 'Lo siento',
                '환영합니다': 'Bienvenido',
                
                // 콘텐츠 유형
                '자주 묻는 질문': 'Preguntas Frecuentes',
                '사용자 매뉴얼': 'Manual del Usuario',
                '학습 가이드': 'Guía de Aprendizaje',
                '공지사항': 'Anuncio',
                '커뮤니티': 'Comunidad',
                '도움말': 'Ayuda',
                '소개': 'Introducción',
                
                // 일반적인 동사와 문장
                '설명합니다': 'explica',
                '안내합니다': 'guía',
                '제공합니다': 'proporciona',
                '지원합니다': 'apoya',
                '도움을 드립니다': 'le ayudamos',
                '문의하세요': 'contáctenos',
                '확인하세요': 'verifique',
                '시작하세요': 'comience',
                
                // 시스템 관련
                '새로운 기능': 'nuevas funciones',
                '업데이트': 'actualización',
                '버전': 'versión',
                '시스템': 'sistema',
                '설정': 'configuración',
                '계정': 'cuenta',
                '프로필': 'perfil',
                '로그인': 'iniciar sesión',
                '회원가입': 'registrarse',
                
                // 문장 패턴
                '이 기능은': 'Esta función',
                '사용자는': 'Los usuarios pueden',
                '시스템이': 'El sistema',
                '다음과 같습니다': 'como sigue',
                '단계별로': 'paso a paso',
                '자세한 내용은': 'para más detalles',
            }
        }
    };
    
    const translationMap = translations[fromLang]?.[toLang];
    if (translationMap) {
        // 정확히 일치하는 번역 찾기
        if (translationMap[plainText]) {
            return translationMap[plainText];
        }
        
        // 부분 일치하는 번역 찾기 (더 정교한 매칭)
        let result = plainText;
        let hasTranslation = false;
        
        // 키워드를 길이 순으로 정렬하여 더 긴 표현부터 매칭
        const sortedKeys = Object.keys(translationMap).sort((a, b) => b.length - a.length);
        
        for (const key of sortedKeys) {
            if (result.includes(key)) {
                result = result.replace(new RegExp(key, 'g'), translationMap[key]);
                hasTranslation = true;
            }
        }
        
        if (hasTranslation) {
            return result;
        }
    }
    
    // 번역을 찾지 못한 경우 기본 처리
    const languageNames = {
        en: 'English',
        ja: '日本語', 
        zh: '中文',
        es: 'Español'
    };
    
    console.log(`번역 맵핑에서 '${plainText}' 찾을 수 없음`);
    
    // 로컬 환경임을 표시하며 원본 텍스트와 함께 반환
    return `[로컬 환경 - ${languageNames[toLang] || toLang}] ${plainText}`;
}