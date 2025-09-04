// notices.js - 공지사항 페이지 관리
import { 
    collection, 
    doc, 
    getDocs, 
    query, 
    where, 
    orderBy, 
    limit,
    startAfter
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

// 전역 변수
let db;
let notices = [];
let filteredNotices = [];
let currentPage = 1;
const NOTICES_PER_PAGE = 10;
let currentCategory = 'all';

// 공지사항 타입 정의
const NOTICE_TYPES = {
    important: { name: '중요', class: 'notice-important', icon: 'fas fa-exclamation-triangle', color: 'text-red-600' },
    update: { name: '업데이트', class: 'notice-normal', icon: 'fas fa-sync-alt', color: 'text-blue-600' },
    event: { name: '이벤트', class: 'notice-event', icon: 'fas fa-gift', color: 'text-green-600' },
    maintenance: { name: '점검', class: 'notice-normal', icon: 'fas fa-tools', color: 'text-orange-600' },
    feature: { name: '새 기능', class: 'notice-normal', icon: 'fas fa-star', color: 'text-purple-600' },
    normal: { name: '일반', class: 'notice-normal', icon: 'fas fa-info-circle', color: 'text-gray-600' }
};

// Firebase 초기화 대기
function initializeNoticesPage() {
    if (window.db) {
        db = window.db;
        console.log('📢 공지사항 페이지 초기화 시작');
        loadNotices();
    } else {
        console.log('⏳ Firebase 초기화 대기 중...');
        setTimeout(initializeNoticesPage, 100);
    }
}

// 공지사항 데이터 로드
async function loadNotices() {
    try {
        console.log('📊 공지사항 데이터 로드 시작');
        showLoading();
        
        // 로컬 스토리지에서 공지사항 로드
        const localNotices = localStorage.getItem('multilingual_content');
        if (localNotices) {
            const contentData = JSON.parse(localNotices);
            notices = contentData
                .filter(content => content.type === 'notice')
                .map(content => transformContentToNotice(content))
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }
        
        // 샘플 데이터가 없으면 생성
        if (notices.length === 0) {
            notices = generateSampleNotices();
        }
        
        filteredNotices = [...notices];
        displayNotices();
        hideLoading();
        
        console.log('✅ 공지사항 데이터 로드 완료');
        
    } catch (error) {
        console.error('❌ 공지사항 데이터 로드 실패:', error);
        hideLoading();
        showError('공지사항을 불러오는데 실패했습니다.');
    }
}

// 콘텐츠 데이터를 공지사항 형태로 변환
function transformContentToNotice(content) {
    const koVersion = content.versions.ko || {};
    
    return {
        id: content.id,
        title: koVersion.title || '제목 없음',
        content: koVersion.content || '',
        type: determineNoticeType(koVersion.title, koVersion.content),
        category: 'normal',
        priority: content.priority || 'normal',
        published: koVersion.published || false,
        createdAt: content.createdAt,
        updatedAt: content.updatedAt || content.createdAt
    };
}

// 공지사항 타입 결정 (제목과 내용 기반)
function determineNoticeType(title, content) {
    const titleLower = (title || '').toLowerCase();
    const contentLower = (content || '').toLowerCase();
    
    if (titleLower.includes('중요') || titleLower.includes('긴급') || contentLower.includes('중요')) {
        return 'important';
    }
    if (titleLower.includes('업데이트') || titleLower.includes('버전')) {
        return 'update';
    }
    if (titleLower.includes('이벤트') || titleLower.includes('행사')) {
        return 'event';
    }
    if (titleLower.includes('점검') || titleLower.includes('maintenance')) {
        return 'maintenance';
    }
    if (titleLower.includes('새로운') || titleLower.includes('기능')) {
        return 'feature';
    }
    
    return 'normal';
}

// 샘플 공지사항 데이터 생성
function generateSampleNotices() {
    const now = new Date();
    
    return [
        {
            id: 'notice_001',
            title: '🎉 LikeVoca 2.1.0 업데이트 안내',
            content: `
                <h3>새로운 기능이 추가되었습니다!</h3>
                <ul>
                    <li><strong>AI 단어 추천 기능 개선</strong> - 더욱 정확한 단어 추천</li>
                    <li><strong>다국어 지원 확대</strong> - 스페인어, 중국어 지원 추가</li>
                    <li><strong>학습 통계 기능</strong> - 상세한 학습 진도 확인 가능</li>
                    <li><strong>UI/UX 개선</strong> - 더욱 직관적인 인터페이스</li>
                </ul>
                <p>업데이트는 자동으로 적용되며, 별도의 조치가 필요하지 않습니다.</p>
            `,
            type: 'update',
            category: 'update',
            priority: 'high',
            published: true,
            createdAt: new Date(now - 86400000).toISOString(), // 1일 전
            updatedAt: new Date(now - 86400000).toISOString()
        },
        {
            id: 'notice_002',
            title: '⚠️ 시스템 정기 점검 안내 (완료)',
            content: `
                <p><strong>점검 일시:</strong> 2024년 1월 15일 (월) 02:00 ~ 04:00 (KST)</p>
                <p><strong>점검 내용:</strong></p>
                <ul>
                    <li>서버 안정성 개선</li>
                    <li>데이터베이스 최적화</li>
                    <li>보안 업데이트 적용</li>
                </ul>
                <p><strong>점검 결과:</strong> 모든 점검이 성공적으로 완료되었습니다.</p>
                <p>점검 중 일시적으로 서비스 이용이 불가했던 점 양해 부탁드립니다.</p>
            `,
            type: 'maintenance',
            category: 'maintenance',
            priority: 'normal',
            published: true,
            createdAt: new Date(now - 172800000).toISOString(), // 2일 전
            updatedAt: new Date(now - 172800000).toISOString()
        },
        {
            id: 'notice_003',
            title: '🎁 신규 사용자 환영 이벤트',
            content: `
                <h3>LikeVoca에 오신 것을 환영합니다!</h3>
                <p>신규 가입 사용자를 위한 특별 혜택을 준비했습니다:</p>
                <ul>
                    <li><strong>AI 단어 추천 무제한</strong> - 첫 7일간 무제한 이용</li>
                    <li><strong>프리미엄 기능 체험</strong> - 30일간 모든 기능 무료 이용</li>
                    <li><strong>학습 가이드 제공</strong> - 효과적인 학습법 안내</li>
                </ul>
                <p><strong>이벤트 기간:</strong> 2024년 1월 1일 ~ 2월 29일</p>
                <p>지금 가입하고 다양한 혜택을 누려보세요!</p>
            `,
            type: 'event',
            category: 'event',
            priority: 'normal',
            published: true,
            createdAt: new Date(now - 259200000).toISOString(), // 3일 전
            updatedAt: new Date(now - 259200000).toISOString()
        },
        {
            id: 'notice_004',
            title: '📱 모바일 앱 출시 예정',
            content: `
                <h3>LikeVoca 모바일 앱이 곧 출시됩니다!</h3>
                <p>더욱 편리한 학습을 위한 모바일 앱을 준비 중입니다.</p>
                <h4>주요 기능:</h4>
                <ul>
                    <li>오프라인 학습 지원</li>
                    <li>푸시 알림을 통한 학습 리마인더</li>
                    <li>터치 최적화된 인터페이스</li>
                    <li>웹 버전과 실시간 동기화</li>
                </ul>
                <p><strong>출시 예정:</strong> 2024년 3월</p>
                <p>iOS App Store와 Google Play Store에서 만나보실 수 있습니다.</p>
            `,
            type: 'feature',
            category: 'feature',
            priority: 'high',
            published: true,
            createdAt: new Date(now - 432000000).toISOString(), // 5일 전
            updatedAt: new Date(now - 432000000).toISOString()
        },
        {
            id: 'notice_005',
            title: '🔒 개인정보처리방침 업데이트',
            content: `
                <p>개인정보 보호를 위해 개인정보처리방침이 업데이트되었습니다.</p>
                <h4>주요 변경 내용:</h4>
                <ul>
                    <li>데이터 수집 및 이용 목적 명시</li>
                    <li>제3자 제공 관련 내용 추가</li>
                    <li>개인정보 보유기간 명확화</li>
                    <li>사용자 권리 및 행사 방법 안내</li>
                </ul>
                <p><strong>시행일:</strong> 2024년 1월 20일</p>
                <p>자세한 내용은 <a href="/privacy" class="text-blue-600 underline">개인정보처리방침</a>에서 확인하실 수 있습니다.</p>
            `,
            type: 'important',
            category: 'important',
            priority: 'high',
            published: true,
            createdAt: new Date(now - 604800000).toISOString(), // 7일 전
            updatedAt: new Date(now - 604800000).toISOString()
        }
    ];
}

// 공지사항 표시
function displayNotices() {
    displayImportantNotices();
    displayAllNotices();
    updatePagination();
}

// 중요 공지사항 표시
function displayImportantNotices() {
    const importantNotices = notices.filter(notice => 
        notice.type === 'important' && notice.published
    ).slice(0, 3); // 최대 3개
    
    const container = document.getElementById('importantNotices');
    
    if (importantNotices.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8">
                <i class="fas fa-check-circle text-4xl text-green-500 mb-3"></i>
                <p class="text-gray-600">현재 중요한 공지사항이 없습니다.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = importantNotices.map(notice => createNoticeCard(notice, true)).join('');
}

// 전체 공지사항 표시 (페이지네이션 적용)
function displayAllNotices() {
    const startIndex = (currentPage - 1) * NOTICES_PER_PAGE;
    const endIndex = startIndex + NOTICES_PER_PAGE;
    const paginatedNotices = filteredNotices.slice(startIndex, endIndex);
    
    const container = document.getElementById('allNotices');
    
    if (filteredNotices.length === 0) {
        container.innerHTML = `
            <div class="text-center py-12">
                <i class="fas fa-search text-4xl text-gray-300 mb-4"></i>
                <h3 class="text-lg font-medium text-gray-700 mb-2">검색 결과가 없습니다</h3>
                <p class="text-gray-500">다른 카테고리를 선택해보세요.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = paginatedNotices.map(notice => createNoticeCard(notice, false)).join('');
}

// 공지사항 카드 생성
function createNoticeCard(notice, isImportant = false) {
    const noticeType = NOTICE_TYPES[notice.type] || NOTICE_TYPES.normal;
    const date = formatDate(notice.createdAt);
    const isRecent = isRecentNotice(notice.createdAt);
    
    return `
        <article class="notice-card ${noticeType.class} rounded-lg p-6 shadow-sm">
            <div class="flex items-start justify-between">
                <div class="flex-1">
                    <div class="flex items-center space-x-3 mb-3">
                        <i class="${noticeType.icon} ${noticeType.color}"></i>
                        <span class="px-2 py-1 text-xs font-medium rounded-full ${getTypeBackgroundClass(notice.type)}">
                            ${noticeType.name}
                        </span>
                        ${isRecent ? '<span class="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">NEW</span>' : ''}
                        ${isImportant ? '<span class="px-2 py-1 text-xs font-medium bg-red-500 text-white rounded-full">중요</span>' : ''}
                    </div>
                    
                    <h3 class="text-lg font-semibold text-gray-900 mb-3">
                        ${notice.title}
                    </h3>
                    
                    <div class="prose prose-sm max-w-none text-gray-700 mb-4">
                        ${notice.content}
                    </div>
                    
                    <div class="flex items-center text-sm text-gray-500">
                        <i class="fas fa-calendar mr-2"></i>
                        <span>${date}</span>
                        ${notice.updatedAt !== notice.createdAt ? `
                            <span class="mx-2">•</span>
                            <i class="fas fa-edit mr-1"></i>
                            <span>수정됨 ${formatDate(notice.updatedAt)}</span>
                        ` : ''}
                    </div>
                </div>
            </div>
        </article>
    `;
}

// 타입별 배경 클래스 반환
function getTypeBackgroundClass(type) {
    const classes = {
        important: 'bg-red-100 text-red-700',
        update: 'bg-blue-100 text-blue-700',
        event: 'bg-green-100 text-green-700',
        maintenance: 'bg-orange-100 text-orange-700',
        feature: 'bg-purple-100 text-purple-700',
        normal: 'bg-gray-100 text-gray-700'
    };
    return classes[type] || classes.normal;
}

// 최근 공지사항 여부 확인 (3일 이내)
function isRecentNotice(createdAt) {
    const noticeDate = new Date(createdAt);
    const threeDaysAgo = new Date(Date.now() - (3 * 24 * 60 * 60 * 1000));
    return noticeDate > threeDaysAgo;
}

// 공지사항 필터링
function filterNotices() {
    const category = document.getElementById('categoryFilter').value;
    currentCategory = category;
    currentPage = 1; // 필터링 시 첫 페이지로 이동
    
    if (category === 'all') {
        filteredNotices = notices.filter(notice => notice.published);
    } else {
        filteredNotices = notices.filter(notice => 
            notice.published && (notice.category === category || notice.type === category)
        );
    }
    
    displayAllNotices();
    updatePagination();
}

// 페이지네이션 업데이트
function updatePagination() {
    const totalPages = Math.ceil(filteredNotices.length / NOTICES_PER_PAGE);
    const container = document.getElementById('pagination');
    
    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }
    
    let paginationHTML = '<div class="flex items-center space-x-2">';
    
    // 이전 페이지 버튼
    if (currentPage > 1) {
        paginationHTML += `
            <button onclick="changePage(${currentPage - 1})" class="px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition duration-200">
                <i class="fas fa-chevron-left"></i>
            </button>
        `;
    }
    
    // 페이지 번호들
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, startPage + 4);
    
    for (let i = startPage; i <= endPage; i++) {
        const isActive = i === currentPage;
        paginationHTML += `
            <button onclick="changePage(${i})" class="px-4 py-2 ${isActive ? 'bg-blue-600 text-white' : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'} rounded-lg transition duration-200">
                ${i}
            </button>
        `;
    }
    
    // 다음 페이지 버튼
    if (currentPage < totalPages) {
        paginationHTML += `
            <button onclick="changePage(${currentPage + 1})" class="px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition duration-200">
                <i class="fas fa-chevron-right"></i>
            </button>
        `;
    }
    
    paginationHTML += '</div>';
    container.innerHTML = paginationHTML;
}

// 페이지 변경
function changePage(page) {
    currentPage = page;
    displayAllNotices();
    updatePagination();
    
    // 페이지 상단으로 스크롤
    document.querySelector('main').scrollIntoView({ behavior: 'smooth' });
}

// 유틸리티 함수들
function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function showLoading() {
    document.getElementById('loadingSpinner').classList.remove('hidden');
    document.getElementById('emptyState').classList.add('hidden');
}

function hideLoading() {
    document.getElementById('loadingSpinner').classList.add('hidden');
    
    if (notices.length === 0) {
        document.getElementById('emptyState').classList.remove('hidden');
    }
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

// 전역 함수 노출
window.filterNotices = filterNotices;
window.changePage = changePage;

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', initializeNoticesPage);

console.log('📢 notices.js 로드 완료');