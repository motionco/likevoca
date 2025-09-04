// Firebase 모듈 import (기존 프로젝트와 일관성 유지)
import { 
    collection, 
    query, 
    getDocs, 
    doc, 
    getDoc, 
    updateDoc,
    orderBy, 
    limit,
    where,
    startAfter
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

// 전역 변수
let db;
let currentUser = null;
let allUsers = [];
let filteredUsers = [];
let currentPage = 1;
const usersPerPage = 20;

// 관리자 이메일 목록 (메인과 동일하게 유지)
const ADMIN_EMAILS = [
    'admin@likevoca.com',
    'manager@likevoca.com',
    'motioncomc@gmail.com'
];

// Firebase 초기화 완료 확인
function initializeUsersManagement() {
    if (window.db && window.auth) {
        db = window.db;
        console.log('👥 사용자 관리 초기화 시작');
        
        // 사용자 인증 상태 확인
        window.auth.onAuthStateChanged(async (user) => {
            if (user) {
                currentUser = user;
                const isAdmin = ADMIN_EMAILS.includes(user.email);
                if (isAdmin) {
                    await loadUsersData();
                } else {
                    window.location.href = '../admin.html';
                }
            } else {
                window.location.href = '../admin.html';
            }
        });
    } else {
        console.log('⏳ Firebase 초기화 대기 중...');
        setTimeout(initializeUsersManagement, 100);
    }
}

// 사용자 데이터 로드 (비용 최적화)
async function loadUsersData() {
    try {
        console.log('📊 사용자 데이터 로드 시작');
        showLoading();
        
        // users 컬렉션에서 모든 사용자 정보 조회 (동의한 정보만)
        const usersRef = collection(db, 'users');
        const usersSnapshot = await getDocs(usersRef);
        
        allUsers = [];
        let activeCount = 0;
        let weeklyNewCount = 0;
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        
        usersSnapshot.forEach(docSnap => {
            const userData = docSnap.data();
            const userEmail = docSnap.id;
            
            // 개인정보보호: 동의한 정보만 수집
            const user = {
                email: userEmail,
                displayName: userData.displayName || userEmail.split('@')[0],
                createdAt: userData.createdAt?.toDate() || new Date(),
                lastLoginAt: userData.lastLoginAt?.toDate() || userData.createdAt?.toDate() || new Date(),
                conceptCount: userData.conceptCount || 0,
                aiUsed: userData.aiUsed || 0,
                maxAiUsage: userData.maxAiUsage || 10,
                isActive: true, // 기본값: 활성
                isAdmin: ADMIN_EMAILS.includes(userEmail),
                // 학습 통계 (익명)
                learningStats: {
                    totalQuizzes: userData.vocabulary_progress ? 
                        Object.values(userData.vocabulary_progress).reduce((sum, lang) => 
                            sum + (lang.quiz_stats?.total_quizzes || 0), 0) : 0,
                    currentStreak: userData.learning_streak?.current_streak || 0,
                    longestStreak: userData.learning_streak?.longest_streak || 0
                }
            };
            
            allUsers.push(user);
            
            // 통계 계산
            if (user.isActive) activeCount++;
            if (user.createdAt > oneWeekAgo) weeklyNewCount++;
        });
        
        // 통계 업데이트
        updateUserStats(allUsers.length, activeCount, weeklyNewCount);
        
        // 필터 적용 및 표시
        applyFilters();
        
        console.log('✅ 사용자 데이터 로드 완료:', allUsers.length);
        
    } catch (error) {
        console.error('사용자 데이터 로드 실패:', error);
        showError();
    }
}

// 통계 업데이트
function updateUserStats(total, active, weeklyNew) {
    const adminCount = ADMIN_EMAILS.length;
    
    document.getElementById('totalUsersCount').textContent = total.toLocaleString();
    document.getElementById('activeUsersCount').textContent = active.toLocaleString();
    document.getElementById('weeklyNewUsers').textContent = weeklyNew.toLocaleString();
    document.getElementById('adminUsersCount').textContent = adminCount.toLocaleString();
    document.getElementById('userCount').textContent = `총 ${total.toLocaleString()}명`;
}

// 검색 및 필터 적용
function applyFilters() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const statusFilter = document.getElementById('statusFilter').value;
    const sortBy = document.getElementById('sortBy').value;
    
    // 검색 필터 적용
    filteredUsers = allUsers.filter(user => {
        const matchesSearch = user.email.toLowerCase().includes(searchTerm) ||
                             user.displayName.toLowerCase().includes(searchTerm);
        
        let matchesStatus = true;
        if (statusFilter === 'active') matchesStatus = user.isActive;
        else if (statusFilter === 'inactive') matchesStatus = !user.isActive;
        else if (statusFilter === 'admin') matchesStatus = user.isAdmin;
        
        return matchesSearch && matchesStatus;
    });
    
    // 정렬 적용
    filteredUsers.sort((a, b) => {
        switch (sortBy) {
            case 'newest':
                return b.createdAt - a.createdAt;
            case 'oldest':
                return a.createdAt - b.createdAt;
            case 'email':
                return a.email.localeCompare(b.email);
            case 'activity':
                return b.lastLoginAt - a.lastLoginAt;
            default:
                return b.createdAt - a.createdAt;
        }
    });
    
    // 페이지 리셋 및 표시
    currentPage = 1;
    displayUsers();
}

// 사용자 목록 표시
function displayUsers() {
    const startIndex = (currentPage - 1) * usersPerPage;
    const endIndex = startIndex + usersPerPage;
    const usersToShow = filteredUsers.slice(startIndex, endIndex);
    
    const usersList = document.getElementById('usersList');
    
    if (usersToShow.length === 0) {
        usersList.innerHTML = `
            <div class="text-center py-12">
                <i class="fas fa-users text-4xl text-gray-300 mb-4"></i>
                <p class="text-gray-500">검색 조건에 맞는 사용자가 없습니다.</p>
            </div>
        `;
    } else {
        usersList.innerHTML = usersToShow.map(user => `
            <div class="user-card border border-gray-200 rounded-lg p-4 hover:border-blue-300 cursor-pointer" onclick="showUserDetail('${user.email}')">
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-4">
                        <div class="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                            ${user.displayName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <div class="flex items-center space-x-2">
                                <h3 class="font-semibold text-gray-900">${user.displayName}</h3>
                                ${user.isAdmin ? '<span class="badge badge-admin">관리자</span>' : ''}
                            </div>
                            <p class="text-gray-600 text-sm">${user.email}</p>
                            <p class="text-gray-500 text-xs">가입: ${formatDate(user.createdAt)} • 최근 활동: ${formatDate(user.lastLoginAt)}</p>
                        </div>
                    </div>
                    <div class="text-right">
                        <span class="${user.isActive ? 'badge badge-active' : 'badge badge-inactive'}">
                            ${user.isActive ? '활성' : '비활성'}
                        </span>
                        <div class="text-sm text-gray-500 mt-2">
                            <div>개념: ${user.conceptCount}개</div>
                            <div>퀴즈: ${user.learningStats.totalQuizzes}회</div>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    // 페이지네이션 업데이트
    updatePagination();
    
    // 로딩 숨기기
    hideLoading();
}

// 페이지네이션 업데이트
function updatePagination() {
    const totalUsers = filteredUsers.length;
    const totalPages = Math.ceil(totalUsers / usersPerPage);
    const startIndex = (currentPage - 1) * usersPerPage + 1;
    const endIndex = Math.min(currentPage * usersPerPage, totalUsers);
    
    document.getElementById('paginationInfo').textContent = 
        `${startIndex}-${endIndex} / 총 ${totalUsers.toLocaleString()}명`;
    
    const prevButton = document.getElementById('prevPage');
    const nextButton = document.getElementById('nextPage');
    
    prevButton.disabled = currentPage === 1;
    nextButton.disabled = currentPage >= totalPages;
    
    if (totalPages > 1) {
        document.getElementById('pagination').classList.remove('hidden');
    } else {
        document.getElementById('pagination').classList.add('hidden');
    }
}

// 사용자 상세 정보 표시
async function showUserDetail(userEmail) {
    try {
        const user = allUsers.find(u => u.email === userEmail);
        if (!user) return;
        
        // 사용자의 상세 통계 조회 (개인정보보호 준수)
        const userRef = doc(db, 'users', userEmail);
        const userDoc = await getDoc(userRef);
        const userData = userDoc.exists() ? userDoc.data() : {};
        
        const detailContent = document.getElementById('userDetailContent');
        detailContent.innerHTML = `
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- 기본 정보 -->
                <div class="space-y-6">
                    <div class="bg-gray-50 rounded-lg p-4">
                        <h4 class="font-semibold text-gray-900 mb-3">기본 정보</h4>
                        <div class="space-y-2 text-sm">
                            <div class="flex justify-between">
                                <span class="text-gray-600">이메일:</span>
                                <span class="font-medium">${user.email}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-600">표시 이름:</span>
                                <span class="font-medium">${user.displayName}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-600">가입일:</span>
                                <span class="font-medium">${formatDateTime(user.createdAt)}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-600">최근 활동:</span>
                                <span class="font-medium">${formatDateTime(user.lastLoginAt)}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-600">계정 상태:</span>
                                <span class="${user.isActive ? 'text-green-600' : 'text-red-600'} font-medium">
                                    ${user.isActive ? '활성' : '비활성'}
                                </span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-600">권한:</span>
                                <span class="font-medium ${user.isAdmin ? 'text-purple-600' : 'text-gray-600'}">
                                    ${user.isAdmin ? '관리자' : '일반 사용자'}
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- 사용량 정보 -->
                    <div class="bg-gray-50 rounded-lg p-4">
                        <h4 class="font-semibold text-gray-900 mb-3">사용량</h4>
                        <div class="space-y-3">
                            <div>
                                <div class="flex justify-between text-sm mb-1">
                                    <span class="text-gray-600">개념 수</span>
                                    <span class="font-medium">${user.conceptCount}개</span>
                                </div>
                            </div>
                            <div>
                                <div class="flex justify-between text-sm mb-1">
                                    <span class="text-gray-600">AI 사용량</span>
                                    <span class="font-medium">${user.aiUsed}/${user.maxAiUsage}</span>
                                </div>
                                <div class="w-full bg-gray-200 rounded-full h-2">
                                    <div class="bg-blue-600 h-2 rounded-full" style="width: ${Math.min((user.aiUsed / user.maxAiUsage) * 100, 100)}%"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- 학습 통계 -->
                <div class="space-y-6">
                    <div class="bg-gray-50 rounded-lg p-4">
                        <h4 class="font-semibold text-gray-900 mb-3">학습 통계</h4>
                        <div class="grid grid-cols-2 gap-4 text-center">
                            <div class="bg-white rounded-lg p-3">
                                <div class="text-2xl font-bold text-blue-600">${user.learningStats.totalQuizzes}</div>
                                <div class="text-xs text-gray-600">총 퀴즈 수</div>
                            </div>
                            <div class="bg-white rounded-lg p-3">
                                <div class="text-2xl font-bold text-green-600">${user.learningStats.currentStreak}</div>
                                <div class="text-xs text-gray-600">현재 연속학습</div>
                            </div>
                            <div class="bg-white rounded-lg p-3">
                                <div class="text-2xl font-bold text-purple-600">${user.learningStats.longestStreak}</div>
                                <div class="text-xs text-gray-600">최장 연속학습</div>
                            </div>
                            <div class="bg-white rounded-lg p-3">
                                <div class="text-2xl font-bold text-orange-600">${Math.floor((Date.now() - user.createdAt) / (1000 * 60 * 60 * 24))}</div>
                                <div class="text-xs text-gray-600">가입 후 일수</div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- 관리 도구 -->
                    <div class="bg-gray-50 rounded-lg p-4">
                        <h4 class="font-semibold text-gray-900 mb-3">관리 도구</h4>
                        <div class="space-y-2">
                            <button onclick="toggleUserStatus('${user.email}')" 
                                    class="w-full px-4 py-2 ${user.isActive ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'} text-white rounded-lg transition duration-200">
                                <i class="fas ${user.isActive ? 'fa-user-slash' : 'fa-user-check'} mr-2"></i>
                                ${user.isActive ? '계정 비활성화' : '계정 활성화'}
                            </button>
                            <button onclick="resetAiUsage('${user.email}')" 
                                    class="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200">
                                <i class="fas fa-sync-alt mr-2"></i>AI 사용량 초기화
                            </button>
                            <button onclick="exportUserData('${user.email}')" 
                                    class="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition duration-200">
                                <i class="fas fa-download mr-2"></i>데이터 내보내기
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('userDetailModal').classList.remove('hidden');
        
    } catch (error) {
        console.error('사용자 상세 정보 로드 실패:', error);
    }
}

// 유틸리티 함수들
function formatDate(date) {
    return new Intl.DateTimeFormat('ko-KR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    }).format(date);
}

function formatDateTime(date) {
    return new Intl.DateTimeFormat('ko-KR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
}

// UI 상태 관리
function showLoading() {
    document.getElementById('loadingUsers').classList.remove('hidden');
    document.getElementById('usersList').classList.add('hidden');
    document.getElementById('usersError').classList.add('hidden');
}

function hideLoading() {
    document.getElementById('loadingUsers').classList.add('hidden');
    document.getElementById('usersList').classList.remove('hidden');
    document.getElementById('usersError').classList.add('hidden');
}

function showError() {
    document.getElementById('loadingUsers').classList.add('hidden');
    document.getElementById('usersList').classList.add('hidden');
    document.getElementById('usersError').classList.remove('hidden');
}

// 이벤트 핸들러들
function handleSearch() {
    clearTimeout(window.searchTimeout);
    window.searchTimeout = setTimeout(applyFilters, 300);
}

function changePage(direction) {
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
    const newPage = currentPage + direction;
    
    if (newPage >= 1 && newPage <= totalPages) {
        currentPage = newPage;
        displayUsers();
    }
}

function closeUserDetail() {
    document.getElementById('userDetailModal').classList.add('hidden');
}

function refreshUsers() {
    loadUsersData();
}

// 사용자 관리 기능들 (비용 최적화 방식으로 구현)
async function toggleUserStatus(userEmail) {
    try {
        if (!confirm(`${userEmail} 계정의 상태를 변경하시겠습니까?`)) {
            return;
        }
        
        const user = allUsers.find(u => u.email === userEmail);
        const newStatus = !user.isActive;
        
        // Firestore 업데이트 (최소한의 필드만)
        const userRef = doc(db, 'users', userEmail);
        await updateDoc(userRef, {
            isActive: newStatus,
            statusUpdatedAt: new Date(),
            statusUpdatedBy: currentUser.email
        });
        
        // 로컬 데이터 업데이트
        user.isActive = newStatus;
        
        // UI 새로고침
        displayUsers();
        closeUserDetail();
        
        alert(`계정 상태가 ${newStatus ? '활성' : '비활성'}으로 변경되었습니다.`);
        
    } catch (error) {
        console.error('계정 상태 변경 실패:', error);
        alert('계정 상태 변경에 실패했습니다.');
    }
}

async function resetAiUsage(userEmail) {
    try {
        if (!confirm(`${userEmail}의 AI 사용량을 초기화하시겠습니까?`)) {
            return;
        }
        
        // Firestore 업데이트 (최소한의 필드만)
        const userRef = doc(db, 'users', userEmail);
        await updateDoc(userRef, {
            aiUsed: 0,
            aiResetAt: new Date(),
            aiResetBy: currentUser.email
        });
        
        // 로컬 데이터 업데이트
        const user = allUsers.find(u => u.email === userEmail);
        if (user) {
            user.aiUsed = 0;
        }
        
        // UI 새로고침
        closeUserDetail();
        setTimeout(() => showUserDetail(userEmail), 100);
        
        alert('AI 사용량이 초기화되었습니다.');
        
    } catch (error) {
        console.error('AI 사용량 초기화 실패:', error);
        alert('AI 사용량 초기화에 실패했습니다.');
    }
}

function exportUserData(userEmail) {
    try {
        const user = allUsers.find(u => u.email === userEmail);
        if (!user) return;
        
        // 개인정보보호 준수: 동의한 정보만 내보내기
        const exportData = {
            이메일: user.email,
            표시이름: user.displayName,
            가입일: formatDateTime(user.createdAt),
            최근활동: formatDateTime(user.lastLoginAt),
            개념수: user.conceptCount,
            AI사용량: `${user.aiUsed}/${user.maxAiUsage}`,
            퀴즈수: user.learningStats.totalQuizzes,
            현재연속학습: user.learningStats.currentStreak,
            최장연속학습: user.learningStats.longestStreak,
            계정상태: user.isActive ? '활성' : '비활성',
            권한: user.isAdmin ? '관리자' : '일반사용자'
        };
        
        // CSV 형태로 내보내기
        const csvContent = Object.entries(exportData)
            .map(([key, value]) => `${key},${value}`)
            .join('\\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `user_${user.email}_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
    } catch (error) {
        console.error('데이터 내보내기 실패:', error);
        alert('데이터 내보내기에 실패했습니다.');
    }
}

// 전역 함수 노출
window.handleSearch = handleSearch;
window.applyFilters = applyFilters;
window.changePage = changePage;
window.showUserDetail = showUserDetail;
window.closeUserDetail = closeUserDetail;
window.refreshUsers = refreshUsers;
window.toggleUserStatus = toggleUserStatus;
window.resetAiUsage = resetAiUsage;
window.exportUserData = exportUserData;

// 페이지 로드 시 초기화
window.addEventListener('DOMContentLoaded', initializeUsersManagement);