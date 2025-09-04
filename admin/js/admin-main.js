// Firebase 모듈 import (기존 프로젝트와 일관성 유지)
import { 
    collection, 
    query, 
    getDocs, 
    doc, 
    getDoc, 
    orderBy, 
    limit,
    where
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

// 전역 변수
let db;
let currentUser = null;

// 관리자 이메일 목록 (Firestore 비용 절약을 위한 하드코딩)
const ADMIN_EMAILS = [
    'admin@likevoca.com',
    'manager@likevoca.com',
    'motioncomc@gmail.com',
    // 필요시 추가
];

// Firebase 초기화 완료 확인
function initializeAdminDashboard() {
    if (window.db && window.auth) {
        db = window.db;
        console.log('🔐 관리자 대시보드 초기화 시작');
        
        // 사용자 인증 상태 확인
        window.auth.onAuthStateChanged(async (user) => {
            if (user) {
                currentUser = user;
                await checkAdminPermission(user.email);
            } else {
                redirectToLogin();
            }
        });
    } else {
        console.log('⏳ Firebase 초기화 대기 중...');
        setTimeout(initializeAdminDashboard, 100);
    }
}

// 관리자 권한 확인 (개인정보보호 준수)
async function checkAdminPermission(userEmail) {
    try {
        // 하드코딩된 관리자 목록 확인 (Firestore 읽기 비용 절약)
        const isAdmin = ADMIN_EMAILS.includes(userEmail);
        
        if (isAdmin) {
            console.log('✅ 관리자 권한 확인됨');
            await loadDashboardData();
            showDashboard();
        } else {
            console.log('❌ 관리자 권한 없음');
            showAccessDenied();
        }
    } catch (error) {
        console.error('관리자 권한 확인 실패:', error);
        showAccessDenied();
    }
}

// 대시보드 데이터 로드 (비용 최적화)
async function loadDashboardData() {
    try {
        console.log('📊 대시보드 데이터 로드 시작');
        
        // 사용자 정보 표시
        updateUserInfo();
        
        // 통계 데이터를 병렬로 로드 (최소한의 쿼리만)
        await Promise.all([
            loadQuickStats(),
            loadRecentActivity()
        ]);
        
        console.log('✅ 대시보드 데이터 로드 완료');
    } catch (error) {
        console.error('대시보드 데이터 로드 실패:', error);
    }
}

// 빠른 통계 로드 (효율적인 쿼리)
async function loadQuickStats() {
    try {
        // 1. 사용자 수 - users 컬렉션 크기만 조회
        const usersRef = collection(db, 'users');
        const usersSnapshot = await getDocs(usersRef);
        const totalUsers = usersSnapshot.size;
        
        // 2. 개념 수 - concepts 컬렉션 크기만 조회  
        const conceptsRef = collection(db, 'concepts');
        const conceptsSnapshot = await getDocs(conceptsRef);
        const totalConcepts = conceptsSnapshot.size;
        
        // 3. 오늘 방문자 - stats 컬렉션에서 오늘 데이터만
        const today = new Date().toISOString().split('T')[0];
        let todayVisitors = 0;
        try {
            const todayStatsRef = doc(db, 'stats', `daily_${today}`);
            const todayStatsDoc = await getDoc(todayStatsRef);
            if (todayStatsDoc.exists()) {
                todayVisitors = todayStatsDoc.data().visitors || 0;
            }
        } catch (error) {
            console.log('오늘 통계 없음:', error);
        }
        
        // 4. 총 좋아요 - concept_stats 컬렉션에서 집계
        let totalLikes = 0;
        try {
            const conceptStatsRef = collection(db, 'concept_stats');
            const conceptStatsSnapshot = await getDocs(conceptStatsRef);
            conceptStatsSnapshot.forEach(doc => {
                const data = doc.data();
                totalLikes += data.like_count || 0;
            });
        } catch (error) {
            console.log('좋아요 통계 없음:', error);
        }
        
        // UI 업데이트
        document.getElementById('totalUsers').textContent = totalUsers.toLocaleString();
        document.getElementById('totalConcepts').textContent = totalConcepts.toLocaleString();
        document.getElementById('todayVisitors').textContent = todayVisitors.toLocaleString();
        document.getElementById('totalLikes').textContent = totalLikes.toLocaleString();
        
    } catch (error) {
        console.error('통계 로드 실패:', error);
        // 실패시 기본값 표시
        document.getElementById('totalUsers').textContent = '-';
        document.getElementById('totalConcepts').textContent = '-';
        document.getElementById('todayVisitors').textContent = '-';
        document.getElementById('totalLikes').textContent = '-';
    }
}

// 최근 활동 로드 (개인정보 제외한 집계 데이터만)
async function loadRecentActivity() {
    try {
        const activities = [];
        
        // 최근 stats 데이터에서 익명 활동만 표시
        const statsRef = collection(db, 'stats');
        const recentStatsQuery = query(statsRef, orderBy('date', 'desc'), limit(3));
        const statsSnapshot = await getDocs(recentStatsQuery);
        
        statsSnapshot.forEach(doc => {
            const data = doc.data();
            if (data.type === 'daily_stats' && data.date) {
                activities.push({
                    type: 'daily_stats',
                    date: data.date,
                    visitors: data.visitors || 0,
                    concept_views: data.concept_views || 0,
                    timestamp: data.date
                });
            }
        });
        
        // UI 업데이트
        const activityContainer = document.getElementById('recentActivity');
        if (activities.length > 0) {
            activityContainer.innerHTML = activities.map(activity => {
                const date = new Date(activity.date);
                const dateStr = date.toLocaleDateString('ko-KR');
                
                return `
                    <div class="flex items-center p-3 bg-gray-50 rounded-lg">
                        <div class="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                            <i class="fas fa-chart-line text-blue-600 text-sm"></i>
                        </div>
                        <div class="flex-1">
                            <div class="text-sm font-medium text-gray-900">
                                ${dateStr} 일일 통계
                            </div>
                            <div class="text-xs text-gray-500">
                                방문자 ${activity.visitors}명, 개념 조회 ${activity.concept_views}회
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        } else {
            activityContainer.innerHTML = `
                <div class="text-center py-8 text-gray-500">
                    <i class="fas fa-info-circle text-2xl mb-2"></i>
                    <p>최근 활동이 없습니다</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('최근 활동 로드 실패:', error);
        document.getElementById('recentActivity').innerHTML = `
            <div class="text-center py-8 text-red-500">
                <i class="fas fa-exclamation-triangle text-2xl mb-2"></i>
                <p>활동 로드에 실패했습니다</p>
            </div>
        `;
    }
}

// 사용자 정보 업데이트 (동의한 정보만 표시)
function updateUserInfo() {
    if (currentUser) {
        const userEmail = currentUser.email;
        const displayName = currentUser.displayName || userEmail.split('@')[0];
        
        document.getElementById('userInfo').innerHTML = `
            <div class="flex items-center">
                <div class="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-2">
                    <i class="fas fa-user text-indigo-600 text-sm"></i>
                </div>
                <div class="text-sm">
                    <div class="font-medium text-gray-900">${displayName}</div>
                    <div class="text-gray-500">${userEmail}</div>
                </div>
            </div>
        `;
    }
}

// UI 표시 함수들
function showDashboard() {
    document.getElementById('loadingScreen').classList.add('hidden');
    document.getElementById('accessDenied').classList.add('hidden');
    document.getElementById('mainDashboard').classList.remove('hidden');
}

function showAccessDenied() {
    document.getElementById('loadingScreen').classList.add('hidden');
    document.getElementById('mainDashboard').classList.add('hidden');
    document.getElementById('accessDenied').classList.remove('hidden');
}

// 네비게이션 함수들
function navigateTo(path) {
    window.location.href = path;
}

function goToMain() {
    window.location.href = '/pages/vocabulary.html';
}

function redirectToLogin() {
    const currentLanguage = localStorage.getItem('userLanguage') || 'ko';
    window.location.href = `/locales/${currentLanguage}/login.html`;
}

// 로그아웃 처리
async function handleLogout() {
    try {
        await window.auth.signOut();
        redirectToLogin();
    } catch (error) {
        console.error('로그아웃 실패:', error);
    }
}

// 최근 활동 새로고침
async function refreshActivity() {
    const button = event.target;
    button.classList.add('animate-spin');
    
    try {
        await loadRecentActivity();
    } finally {
        setTimeout(() => {
            button.classList.remove('animate-spin');
        }, 1000);
    }
}

// 빠른 작업 실행
function quickAction(action) {
    switch (action) {
        case 'backup':
            alert('데이터 백업 기능은 시스템 설정에서 이용할 수 있습니다.');
            break;
        case 'cleanup':
            alert('데이터베이스 정리 기능은 시스템 설정에서 이용할 수 있습니다.');
            break;
        case 'broadcast':
            alert('공지사항 발송 기능은 콘텐츠 관리에서 이용할 수 있습니다.');
            break;
        case 'export':
            alert('데이터 내보내기 기능은 각 관리 페이지에서 이용할 수 있습니다.');
            break;
        default:
            console.log('알 수 없는 액션:', action);
    }
}

// 전역 함수 노출
window.navigateTo = navigateTo;
window.goToMain = goToMain;
window.handleLogout = handleLogout;
window.refreshActivity = refreshActivity;
window.quickAction = quickAction;

// 페이지 로드 시 초기화
window.addEventListener('DOMContentLoaded', initializeAdminDashboard);