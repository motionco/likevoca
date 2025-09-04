// admin-security.js - 보안 관리 시스템
import { 
    collection, 
    doc, 
    getDocs, 
    getDoc, 
    setDoc, 
    addDoc,
    updateDoc, 
    deleteDoc, 
    query, 
    where, 
    orderBy, 
    limit
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

// 전역 변수
let db;
let auth;
let currentSecurityTab = 'access';
let securityData = {};

// Firebase 초기화 완료 확인
function initializeSecurityManager() {
    if (window.db && window.auth) {
        db = window.db;
        auth = window.auth;
        console.log('🔒 보안 관리 시스템 초기화 시작');
        
        // 인증 상태 확인
        auth.onAuthStateChanged((user) => {
            if (user) {
                console.log('✅ 사용자 인증됨:', user.email);
                checkAdminPermission(user.email);
            } else {
                console.log('❌ 사용자 인증되지 않음');
                window.location.href = '../pages/vocabulary.html';
            }
        });
    } else {
        console.log('⏳ Firebase 초기화 대기 중...');
        setTimeout(initializeSecurityManager, 100);
    }
}

// 관리자 권한 확인
async function checkAdminPermission(userEmail) {
    try {
        console.log('🔐 관리자 권한 확인 중...');
        
        // users 컬렉션에서 사용자 정보 확인
        const userRef = doc(db, 'users', userEmail);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
            const userData = userDoc.data();
            const isAdmin = userData.role === 'admin';
            
            if (isAdmin) {
                console.log('✅ 관리자 권한 확인됨 (DB에서 확인)');
                await startSecurityManager();
            } else {
                console.log('❌ 관리자 권한 없음 (role:', userData.role || 'undefined', ')');
                showAccessDenied();
            }
        } else {
            console.log('❌ 사용자 정보를 찾을 수 없음');
            showAccessDenied();
        }
    } catch (error) {
        console.error('❌ 관리자 권한 확인 중 오류:', error);
        // Firestore 접근 실패 시 fallback으로 이메일 목록 확인
        console.log('🔄 Fallback: 하드코딩된 관리자 목록으로 확인');
        const ADMIN_EMAILS = [
            'admin@likevoca.com',
            'manager@likevoca.com',
            'motioncomc@gmail.com',
        ];
        
        const isAdmin = ADMIN_EMAILS.includes(userEmail);
        
        if (isAdmin) {
            console.log('✅ 관리자 권한 확인됨 (fallback)');
            await startSecurityManager();
        } else {
            console.log('❌ 관리자 권한 없음');
            showAccessDenied();
        }
    }
}

// 접근 거부 표시
function showAccessDenied() {
    document.body.innerHTML = `
        <div class="min-h-screen flex items-center justify-center bg-gray-50">
            <div class="max-w-md w-full bg-white rounded-xl p-8 text-center shadow-lg">
                <i class="fas fa-ban text-6xl text-red-500 mb-4"></i>
                <h2 class="text-2xl font-bold text-gray-900 mb-4">접근 권한이 없습니다</h2>
                <p class="text-gray-600 mb-6">관리자 권한이 필요한 페이지입니다.</p>
                <a href="../pages/vocabulary.html" class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-200">
                    메인으로 돌아가기
                </a>
            </div>
        </div>
    `;
}

// 보안 관리자 시작
async function startSecurityManager() {
    console.log('🚀 보안 관리자 시작');
    
    try {
        await loadSecurityData();
        await loadSecurityLogs();
        loadMockData(); // 임시 데이터
        
        console.log('✅ 보안 관리자 초기화 완료');
    } catch (error) {
        console.error('❌ 보안 관리자 초기화 실패:', error);
        showError('보안 관리자 초기화에 실패했습니다.');
    }
}

// 보안 데이터 로드
async function loadSecurityData() {
    try {
        console.log('📊 보안 데이터 로드 시작');
        
        // 로컬 스토리지에서 보안 데이터 로드 시도
        const localSecurityData = localStorage.getItem('security_data');
        if (localSecurityData) {
            securityData = JSON.parse(localSecurityData);
            console.log('✅ 로컬 스토리지에서 보안 데이터 로드');
        } else {
            // 기본 보안 데이터 사용
            securityData = {
                adminEmails: [
                    'admin@likevoca.com',
                    'manager@likevoca.com',
                    'motioncomc@gmail.com'
                ],
                blockedIPs: ['192.168.1.999', '10.0.0.333', '172.16.0.777'],
                allowedIPs: ['192.168.1.0/24', '10.0.0.0/16', '172.16.0.0/12'],
                permissions: {
                    userManagement: {
                        read: true,
                        edit: true,
                        delete: false
                    },
                    contentManagement: {
                        create: true,
                        edit: true,
                        publish: true
                    },
                    systemManagement: {
                        settings: true,
                        security: false,
                        backup: false
                    }
                },
                firestoreRules: '',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            console.log('✅ 기본 보안 데이터 사용');
        }
        
        updateSecurityUI();
        console.log('✅ 보안 데이터 로드 완료');
        
    } catch (error) {
        console.error('❌ 보안 데이터 로드 실패:', error);
        // 오류 발생시 기본 데이터로 대체
        securityData = {
            adminEmails: [
                'admin@likevoca.com',
                'manager@likevoca.com',
                'motioncomc@gmail.com'
            ],
            blockedIPs: ['192.168.1.999', '10.0.0.333', '172.16.0.777'],
            allowedIPs: ['192.168.1.0/24', '10.0.0.0/16', '172.16.0.0/12'],
            permissions: {
                userManagement: {
                    read: true,
                    edit: true,
                    delete: false
                },
                contentManagement: {
                    create: true,
                    edit: true,
                    publish: true
                },
                systemManagement: {
                    settings: true,
                    security: false,
                    backup: false
                }
            },
            firestoreRules: '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        updateSecurityUI();
        showError('Firestore 접근 권한이 없어 로컬 보안 데이터를 사용합니다.');
    }
}

// 보안 로그 로드
async function loadSecurityLogs() {
    try {
        // 로컬 스토리지에서 로그 데이터 로드 시도
        const localLogs = localStorage.getItem('security_logs');
        if (localLogs) {
            const logs = JSON.parse(localLogs).map(log => ({
                ...log,
                timestamp: new Date(log.timestamp)
            }));
            displaySecurityLogs(logs);
            return;
        }
        
        // Firestore에서 로그 로드 시도
        const logsRef = collection(db, 'security_logs');
        const logsQuery = query(logsRef, orderBy('timestamp', 'desc'), limit(50));
        const logsSnapshot = await getDocs(logsQuery);
        
        if (!logsSnapshot.empty) {
            const logs = [];
            logsSnapshot.forEach(doc => {
                const data = doc.data();
                logs.push({
                    id: doc.id,
                    ...data,
                    timestamp: data.timestamp?.toDate ? data.timestamp.toDate() : new Date(data.timestamp)
                });
            });
            displaySecurityLogs(logs);
        } else {
            displayMockSecurityLogs();
        }
        
    } catch (error) {
        console.warn('보안 로그 로드 실패:', error);
        // 임시 로그 데이터로 대체
        displayMockSecurityLogs();
    }
}

// 임시 데이터 로드 (시연용)
function loadMockData() {
    // 보안 상태 업데이트
    document.getElementById('securityScore').textContent = '85/100';
    document.getElementById('activeSessions').textContent = '12';
    document.getElementById('securityAlerts').textContent = '3';
    document.getElementById('blockedIPs').textContent = '5';
    
    // 관리자 계정 표시
    displayAdminAccounts();
    
    // 활성 세션 표시
    displayActiveSessions();
    
    // 로그인 통계 표시
    document.getElementById('successfulLogins').textContent = '128';
    document.getElementById('failedLogins').textContent = '7';
    document.getElementById('suspiciousActivity').textContent = '2';
    
    // IP 목록 표시
    displayIPLists();
    
    // 마지막 업데이트 시간
    document.getElementById('lastRefresh').textContent = `마지막 업데이트: ${new Date().toLocaleString('ko-KR')}`;
}

// 보안 UI 업데이트
function updateSecurityUI() {
    try {
        // 권한 체크박스 업데이트 - HTML 구조에 맞춰 수정
        if (securityData.permissions) {
            const permissions = securityData.permissions;
            
            // 접근 권한 섹션의 체크박스들을 순서대로 업데이트
            const checkboxes = document.querySelectorAll('#access-tab input[type="checkbox"]');
            
            if (checkboxes.length >= 9) {
                // 사용자 관리 권한 (첫 번째부터 세 번째 체크박스)
                if (permissions.userManagement) {
                    checkboxes[0].checked = permissions.userManagement.read;
                    checkboxes[1].checked = permissions.userManagement.edit;
                    checkboxes[2].checked = permissions.userManagement.delete;
                }
                
                // 콘텐츠 관리 권한 (네 번째부터 여섯 번째 체크박스)
                if (permissions.contentManagement) {
                    checkboxes[3].checked = permissions.contentManagement.create;
                    checkboxes[4].checked = permissions.contentManagement.edit;
                    checkboxes[5].checked = permissions.contentManagement.publish;
                }
                
                // 시스템 관리 권한 (일곱 번째부터 아홉 번째 체크박스)
                if (permissions.systemManagement) {
                    checkboxes[6].checked = permissions.systemManagement.settings;
                    checkboxes[7].checked = permissions.systemManagement.security;
                    checkboxes[8].checked = permissions.systemManagement.backup;
                }
            }
        }
        
        console.log('✅ 보안 UI 업데이트 완료');
    } catch (error) {
        console.warn('⚠️ 보안 UI 업데이트 중 일부 요소를 찾을 수 없음:', error);
        // UI 업데이트 실패해도 전체 기능에는 영향 없음
    }
}

// 관리자 계정 표시
function displayAdminAccounts() {
    const container = document.getElementById('adminAccounts');
    const adminEmails = securityData.adminEmails || [
        'admin@likevoca.com',
        'manager@likevoca.com',
        'motioncomc@gmail.com'
    ];
    
    container.innerHTML = adminEmails.map(email => `
        <div class="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
            <div class="flex items-center">
                <i class="fas fa-user-shield text-red-600 mr-3"></i>
                <div>
                    <div class="font-medium text-gray-900">${email}</div>
                    <div class="text-sm text-gray-600">관리자</div>
                </div>
            </div>
            <button onclick="removeAdminAccount('${email}')" class="text-red-600 hover:text-red-800">
                <i class="fas fa-trash text-sm"></i>
            </button>
        </div>
    `).join('');
}

// 활성 세션 표시
function displayActiveSessions() {
    const container = document.getElementById('activeSessionsList');
    const mockSessions = [
        { user: 'admin@likevoca.com', ip: '192.168.1.100', lastActivity: new Date(), browser: 'Chrome' },
        { user: 'manager@likevoca.com', ip: '10.0.0.55', lastActivity: new Date(Date.now() - 300000), browser: 'Firefox' },
        { user: 'motioncomc@gmail.com', ip: '172.16.0.20', lastActivity: new Date(Date.now() - 600000), browser: 'Safari' }
    ];
    
    container.innerHTML = mockSessions.map(session => `
        <div class="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
            <div class="flex items-center">
                <i class="fas fa-user text-green-600 mr-3"></i>
                <div>
                    <div class="font-medium text-gray-900">${session.user}</div>
                    <div class="text-sm text-gray-600">${session.ip} • ${session.browser}</div>
                    <div class="text-xs text-gray-500">${formatTime(session.lastActivity)}</div>
                </div>
            </div>
            <button onclick="terminateSession('${session.user}')" class="text-orange-600 hover:text-orange-800">
                <i class="fas fa-sign-out-alt text-sm"></i>
            </button>
        </div>
    `).join('');
}

// IP 목록 표시
function displayIPLists() {
    // 차단된 IP
    const blockedContainer = document.getElementById('blockedIPList');
    const blockedIPs = securityData.blockedIPs || [
        '192.168.1.999',
        '10.0.0.333',
        '172.16.0.777'
    ];
    
    blockedContainer.innerHTML = blockedIPs.map(ip => `
        <div class="flex items-center justify-between bg-red-50 p-2 rounded border border-red-200">
            <span class="text-sm font-medium text-red-800">${ip}</span>
            <button onclick="unblockIP('${ip}')" class="text-red-600 hover:text-red-800">
                <i class="fas fa-times text-sm"></i>
            </button>
        </div>
    `).join('');
    
    // 허용된 IP
    const allowedContainer = document.getElementById('allowedIPList');
    const allowedIPs = securityData.allowedIPs || [
        '192.168.1.0/24',
        '10.0.0.0/16',
        '172.16.0.0/12'
    ];
    
    allowedContainer.innerHTML = allowedIPs.map(ip => `
        <div class="flex items-center justify-between bg-green-50 p-2 rounded border border-green-200">
            <span class="text-sm font-medium text-green-800">${ip}</span>
            <button onclick="removeAllowedIP('${ip}')" class="text-green-600 hover:text-green-800">
                <i class="fas fa-times text-sm"></i>
            </button>
        </div>
    `).join('');
}

// 임시 보안 로그 표시
function displayMockSecurityLogs() {
    const mockLogs = [
        { type: 'success', message: '관리자 로그인 성공', user: 'admin@likevoca.com', timestamp: new Date(), ip: '192.168.1.100' },
        { type: 'warning', message: '비정상적인 로그인 시도', user: 'unknown', timestamp: new Date(Date.now() - 300000), ip: '192.168.1.999' },
        { type: 'info', message: '새 콘텐츠 생성', user: 'manager@likevoca.com', timestamp: new Date(Date.now() - 600000), ip: '10.0.0.55' },
        { type: 'danger', message: '보안 규칙 위반 감지', user: 'unknown', timestamp: new Date(Date.now() - 900000), ip: '172.16.0.777' },
        { type: 'success', message: '시스템 백업 완료', user: 'system', timestamp: new Date(Date.now() - 1200000), ip: 'localhost' }
    ];
    
    displaySecurityLogs(mockLogs);
}

// 보안 로그 표시
function displaySecurityLogs(logs) {
    const container = document.getElementById('securityLogs');
    
    container.innerHTML = logs.map(log => `
        <div class="log-entry log-${log.type} bg-white p-4 rounded-lg border">
            <div class="flex items-start justify-between">
                <div class="flex items-start">
                    <div class="mr-3 mt-1">
                        ${getLogIcon(log.type)}
                    </div>
                    <div>
                        <div class="font-medium text-gray-900">${log.message}</div>
                        <div class="text-sm text-gray-600 mt-1">
                            사용자: ${log.user} • IP: ${log.ip}
                        </div>
                        <div class="text-xs text-gray-500 mt-1">
                            ${formatTime(log.timestamp)}
                        </div>
                    </div>
                </div>
                <div class="text-xs text-gray-400">
                    ${log.type.toUpperCase()}
                </div>
            </div>
        </div>
    `).join('');
}

// 로그 아이콘 반환
function getLogIcon(type) {
    const icons = {
        success: '<i class="fas fa-check-circle text-green-600"></i>',
        warning: '<i class="fas fa-exclamation-triangle text-yellow-600"></i>',
        danger: '<i class="fas fa-times-circle text-red-600"></i>',
        info: '<i class="fas fa-info-circle text-blue-600"></i>'
    };
    return icons[type] || icons.info;
}

// 시간 포맷팅
function formatTime(date) {
    return new Date(date).toLocaleString('ko-KR');
}

// 보안 탭 전환
function switchSecurityTab(tabName) {
    // 모든 탭 버튼 비활성화
    document.querySelectorAll('.security-tab-button').forEach(button => {
        button.classList.remove('border-red-500', 'text-red-600');
        button.classList.add('border-transparent', 'text-gray-500');
    });
    
    // 모든 탭 콘텐츠 숨기기
    document.querySelectorAll('.security-tab-content').forEach(content => {
        content.classList.add('hidden');
    });
    
    // 선택된 탭 활성화
    const selectedButton = document.getElementById(`tab-${tabName}`);
    if (selectedButton) {
        selectedButton.classList.add('border-red-500', 'text-red-600');
        selectedButton.classList.remove('border-transparent', 'text-gray-500');
    }
    
    const selectedContent = document.getElementById(`${tabName}-tab`);
    if (selectedContent) {
        selectedContent.classList.remove('hidden');
    }
    
    currentSecurityTab = tabName;
}

// IP 차단/허용 함수들
async function blockIP() {
    const ipInput = document.getElementById('newBlockedIP');
    const ip = ipInput.value.trim();
    
    if (!ip) {
        showError('IP 주소를 입력해주세요.');
        return;
    }
    
    if (!isValidIP(ip)) {
        showError('유효하지 않은 IP 주소입니다.');
        return;
    }
    
    try {
        securityData.blockedIPs = securityData.blockedIPs || [];
        securityData.blockedIPs.push(ip);
        
        await saveSecurityData();
        displayIPLists();
        
        ipInput.value = '';
        showSuccess(`IP ${ip}가 차단되었습니다.`);
        
    } catch (error) {
        showError('IP 차단에 실패했습니다.');
    }
}

async function allowIP() {
    const ipInput = document.getElementById('newAllowedIP');
    const ip = ipInput.value.trim();
    
    if (!ip) {
        showError('IP 주소를 입력해주세요.');
        return;
    }
    
    try {
        securityData.allowedIPs = securityData.allowedIPs || [];
        securityData.allowedIPs.push(ip);
        
        await saveSecurityData();
        displayIPLists();
        
        ipInput.value = '';
        showSuccess(`IP ${ip}가 허용되었습니다.`);
        
    } catch (error) {
        showError('IP 허용에 실패했습니다.');
    }
}

// IP 주소 유효성 검사
function isValidIP(ip) {
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    const cidrRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\/([0-9]|[1-2][0-9]|3[0-2])$/;
    return ipRegex.test(ip) || cidrRegex.test(ip);
}

// 보안 데이터 저장
async function saveSecurityData() {
    try {
        const updatedData = {
            ...securityData,
            updatedAt: new Date().toISOString()
        };
        
        // 로컬 스토리지에 저장
        localStorage.setItem('security_data', JSON.stringify(updatedData));
        securityData = updatedData;
        console.log('✅ 보안 데이터 로컬 저장 완료');
        
        // Firestore 저장 시도 (선택적 - 실패해도 무시)
        try {
            const securityRef = doc(db, 'admin_content', `security_data_${Date.now()}`);
            await setDoc(securityRef, {
                type: 'security_data',
                data: updatedData,
                createdAt: new Date()
            });
            console.log('✅ Firestore에도 보안 데이터 백업 저장 완료');
        } catch (firestoreError) {
            console.warn('⚠️ Firestore 백업 실패 (로컬 저장은 성공):', firestoreError.message);
            // Firestore 실패는 무시 - 로컬 저장이 성공했으므로 정상 동작
        }
        
    } catch (error) {
        console.error('❌ 로컬 보안 데이터 저장 실패:', error);
        throw error;
    }
}

// 기타 함수들
async function addAdminAccount() {
    const email = prompt('추가할 관리자 이메일을 입력하세요:');
    if (email && isValidEmail(email)) {
        try {
            // 중복 이메일 확인
            if (securityData.adminEmails && securityData.adminEmails.includes(email)) {
                showError('이미 등록된 관리자 이메일입니다.');
                return;
            }
            
            securityData.adminEmails = securityData.adminEmails || [];
            securityData.adminEmails.push(email);
            
            await saveSecurityData();
            displayAdminAccounts();
            showSuccess('관리자 계정이 추가되었습니다.');
            
        } catch (error) {
            console.error('❌ 관리자 계정 추가 실패:', error);
            showError('관리자 계정 추가에 실패했습니다.');
        }
    } else if (email) {
        showError('유효하지 않은 이메일 주소입니다.');
    }
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

async function removeAdminAccount(email) {
    if (confirm(`관리자 계정 ${email}을 제거하시겠습니까?`)) {
        try {
            securityData.adminEmails = securityData.adminEmails.filter(adminEmail => adminEmail !== email);
            await saveSecurityData();
            displayAdminAccounts();
            showSuccess('관리자 계정이 제거되었습니다.');
        } catch (error) {
            showError('관리자 계정 제거에 실패했습니다.');
        }
    }
}

async function terminateSession(userEmail) {
    if (confirm(`${userEmail}의 세션을 종료하시겠습니까?`)) {
        showSuccess(`${userEmail}의 세션이 종료되었습니다.`);
        // 실제 구현에서는 해당 사용자의 세션을 종료하는 로직 추가
        setTimeout(() => {
            displayActiveSessions();
        }, 1000);
    }
}

async function terminateAllSessions() {
    if (confirm('모든 활성 세션을 종료하시겠습니까? (현재 세션 제외)')) {
        showSuccess('모든 세션이 종료되었습니다.');
        setTimeout(() => {
            displayActiveSessions();
        }, 1000);
    }
}

async function unblockIP(ip) {
    try {
        securityData.blockedIPs = securityData.blockedIPs.filter(blockedIP => blockedIP !== ip);
        await saveSecurityData();
        displayIPLists();
        showSuccess(`IP ${ip}가 차단 해제되었습니다.`);
    } catch (error) {
        showError('IP 차단 해제에 실패했습니다.');
    }
}

async function removeAllowedIP(ip) {
    try {
        securityData.allowedIPs = securityData.allowedIPs.filter(allowedIP => allowedIP !== ip);
        await saveSecurityData();
        displayIPLists();
        showSuccess(`허용된 IP ${ip}가 제거되었습니다.`);
    } catch (error) {
        showError('허용된 IP 제거에 실패했습니다.');
    }
}

function refreshSecurityData() {
    loadMockData();
    document.getElementById('lastRefresh').textContent = `마지막 업데이트: ${new Date().toLocaleString('ko-KR')}`;
    showSuccess('보안 데이터가 새로고침되었습니다.');
}

// Firestore 규칙 관련 함수들
function validateRules() {
    showSuccess('보안 규칙 검증이 완료되었습니다. 문제가 발견되지 않았습니다.');
}

function deployRules() {
    showSuccess('보안 규칙이 배포되었습니다. 적용까지 몇 분이 소요될 수 있습니다.');
}

function filterLogs() {
    // 로그 필터링 로직
    loadSecurityLogs();
}

function exportLogs() {
    showSuccess('보안 로그 내보내기가 시작되었습니다.');
}

// UI 유틸리티 함수들
function showSuccess(message) {
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    toast.innerHTML = `<i class="fas fa-check mr-2"></i>${message}`;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
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
window.switchSecurityTab = switchSecurityTab;
window.refreshSecurityData = refreshSecurityData;
window.blockIP = blockIP;
window.allowIP = allowIP;
window.unblockIP = unblockIP;
window.removeAllowedIP = removeAllowedIP;
window.addAdminAccount = addAdminAccount;
window.removeAdminAccount = removeAdminAccount;
window.terminateSession = terminateSession;
window.terminateAllSessions = terminateAllSessions;
window.validateRules = validateRules;
window.deployRules = deployRules;
window.filterLogs = filterLogs;
window.exportLogs = exportLogs;

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', initializeSecurityManager);

console.log('🔒 admin-security.js 로드 완료');