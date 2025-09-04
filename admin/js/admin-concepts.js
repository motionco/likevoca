// Firebase 모듈 import (기존 프로젝트와 일관성 유지)
import { 
    collection, 
    query, 
    getDocs, 
    doc, 
    getDoc, 
    setDoc,
    updateDoc,
    deleteDoc,
    orderBy, 
    limit,
    where,
    startAfter
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

// 전역 변수
let db;
let currentUser = null;
let allConcepts = [];
let filteredConcepts = [];
let selectedConcepts = [];
let currentPage = 1;
const conceptsPerPage = 20;

// 관리자 이메일 목록 (메인과 동일하게 유지)
const ADMIN_EMAILS = [
    'admin@likevoca.com',
    'manager@likevoca.com',
    'motioncomc@gmail.com'
];

// Firebase 초기화 완료 확인
function initializeConceptsManagement() {
    if (window.db && window.auth) {
        db = window.db;
        console.log('📚 개념 관리 초기화 시작');
        
        // 사용자 인증 상태 확인
        window.auth.onAuthStateChanged(async (user) => {
            if (user) {
                currentUser = user;
                const isAdmin = ADMIN_EMAILS.includes(user.email);
                if (isAdmin) {
                    await loadConceptsData();
                } else {
                    window.location.href = '../admin.html';
                }
            } else {
                window.location.href = '../admin.html';
            }
        });
    } else {
        console.log('⏳ Firebase 초기화 대기 중...');
        setTimeout(initializeConceptsManagement, 100);
    }
}

// 개념 데이터 로드 (비용 최적화)
async function loadConceptsData() {
    try {
        console.log('📊 개념 데이터 로드 시작');
        showLoading();
        
        // concepts 컬렉션에서 모든 개념 조회
        const conceptsRef = collection(db, 'concepts');
        const conceptsSnapshot = await getDocs(conceptsRef);
        
        allConcepts = [];
        let approvedCount = 0;
        let pendingCount = 0;
        
        // concept_stats에서 인기도 정보 병렬 로드
        const conceptStatsRef = collection(db, 'concept_stats');
        const conceptStatsSnapshot = await getDocs(conceptStatsRef);
        const statsMap = {};
        
        conceptStatsSnapshot.forEach(doc => {
            const data = doc.data();
            statsMap[data.concept_id || doc.id] = {
                like_count: data.like_count || 0,
                view_count: data.view_count || 0
            };
        });
        
        conceptsSnapshot.forEach(docSnap => {
            const conceptData = docSnap.data();
            const conceptId = docSnap.id;
            
            // 개념 데이터 정리 (개인정보보호: 작성자 정보는 이메일만)
            const concept = {
                id: conceptId,
                _id: conceptData._id || conceptId,
                
                // 기본 정보
                concept_info: conceptData.concept_info || {
                    domain: conceptData.domain || 'general',
                    category: conceptData.category || 'common',
                    difficulty: conceptData.difficulty || 'beginner',
                    unicode_emoji: conceptData.emoji || conceptData.concept_info?.unicode_emoji || '📚',
                    color_theme: conceptData.concept_info?.color_theme || '#9C27B0'
                },
                
                // 언어별 표현
                expressions: conceptData.expressions || {},
                
                // 예문
                examples: conceptData.featured_examples || conceptData.examples || [],
                representative_example: conceptData.representative_example,
                
                // 메타데이터
                created_at: conceptData.created_at?.toDate ? conceptData.created_at.toDate() : new Date(conceptData.created_at || Date.now()),
                updated_at: conceptData.updated_at?.toDate ? conceptData.updated_at.toDate() : new Date(conceptData.updated_at || Date.now()),
                userId: conceptData.userId || 'unknown',
                
                // 승인 상태 (기본값: 승인됨)
                isApproved: conceptData.isApproved !== false,
                approvedBy: conceptData.approvedBy,
                approvedAt: conceptData.approvedAt?.toDate ? conceptData.approvedAt.toDate() : null,
                
                // 통계 정보
                stats: statsMap[conceptId] || { like_count: 0, view_count: 0 },
                
                // AI 생성 여부
                isAIGenerated: conceptData.isAIGenerated || false
            };
            
            allConcepts.push(concept);
            
            // 통계 계산
            if (concept.isApproved) approvedCount++;
            else pendingCount++;
        });
        
        // 통계 업데이트
        updateConceptStats(allConcepts.length, approvedCount, pendingCount);
        
        // 필터 적용 및 표시
        applyFilters();
        
        console.log('✅ 개념 데이터 로드 완료:', allConcepts.length);
        
    } catch (error) {
        console.error('개념 데이터 로드 실패:', error);
        showError();
    }
}

// 통계 업데이트
function updateConceptStats(total, approved, pending) {
    // 인기 개념 (좋아요 + 조회수 상위 10%)
    const sortedByPopularity = [...allConcepts].sort((a, b) => {
        const aScore = (a.stats.like_count * 2) + a.stats.view_count;
        const bScore = (b.stats.like_count * 2) + b.stats.view_count;
        return bScore - aScore;
    });
    const popularCount = Math.ceil(total * 0.1);
    
    document.getElementById('totalConcepts').textContent = total.toLocaleString();
    document.getElementById('approvedConcepts').textContent = approved.toLocaleString();
    document.getElementById('pendingConcepts').textContent = pending.toLocaleString();
    document.getElementById('popularConcepts').textContent = popularCount.toLocaleString();
    document.getElementById('conceptCount').textContent = `총 ${total.toLocaleString()}개`;
}

// 검색 및 필터 적용
function applyFilters() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const languageFilter = document.getElementById('languageFilter').value;
    const categoryFilter = document.getElementById('categoryFilter').value;
    const difficultyFilter = document.getElementById('difficultyFilter').value;
    const sortBy = document.getElementById('sortBy').value;
    
    // 필터 적용
    filteredConcepts = allConcepts.filter(concept => {
        // 검색어 필터
        let matchesSearch = true;
        if (searchTerm) {
            const searchableText = [
                ...Object.values(concept.expressions).map(expr => expr.word || ''),
                ...Object.values(concept.expressions).map(expr => expr.meaning || ''),
                concept.concept_info.category || '',
                concept.concept_info.domain || ''
            ].join(' ').toLowerCase();
            
            matchesSearch = searchableText.includes(searchTerm);
        }
        
        // 언어 필터
        let matchesLanguage = languageFilter === 'all';
        if (!matchesLanguage) {
            matchesLanguage = concept.expressions[languageFilter] && 
                             concept.expressions[languageFilter].word;
        }
        
        // 카테고리 필터
        let matchesCategory = categoryFilter === 'all' || 
                             (concept.concept_info.category === categoryFilter);
        
        // 난이도 필터
        let matchesDifficulty = difficultyFilter === 'all' || 
                               (concept.concept_info.difficulty === difficultyFilter);
        
        return matchesSearch && matchesLanguage && matchesCategory && matchesDifficulty;
    });
    
    // 정렬 적용
    filteredConcepts.sort((a, b) => {
        switch (sortBy) {
            case 'newest':
                return b.created_at - a.created_at;
            case 'oldest':
                return a.created_at - b.created_at;
            case 'popularity':
                const aScore = (a.stats.like_count * 2) + a.stats.view_count;
                const bScore = (b.stats.like_count * 2) + b.stats.view_count;
                return bScore - aScore;
            case 'alphabetical':
                const aWord = Object.values(a.expressions)[0]?.word || '';
                const bWord = Object.values(b.expressions)[0]?.word || '';
                return aWord.localeCompare(bWord);
            default:
                return b.created_at - a.created_at;
        }
    });
    
    // 페이지 리셋 및 표시
    currentPage = 1;
    selectedConcepts = [];
    updateBulkActions();
    displayConcepts();
}

// 개념 목록 표시
function displayConcepts() {
    const startIndex = (currentPage - 1) * conceptsPerPage;
    const endIndex = startIndex + conceptsPerPage;
    const conceptsToShow = filteredConcepts.slice(startIndex, endIndex);
    
    const conceptsList = document.getElementById('conceptsList');
    
    if (conceptsToShow.length === 0) {
        conceptsList.innerHTML = `
            <div class="text-center py-12">
                <i class="fas fa-book text-4xl text-gray-300 mb-4"></i>
                <p class="text-gray-500">검색 조건에 맞는 개념이 없습니다.</p>
            </div>
        `;
    } else {
        conceptsList.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                ${conceptsToShow.map(concept => renderConceptCard(concept)).join('')}
            </div>
        `;
    }
    
    // 페이지네이션 업데이트
    updatePagination();
    
    // 로딩 숨기기
    hideLoading();
}

// 개념 카드 렌더링
function renderConceptCard(concept) {
    const primaryLang = Object.keys(concept.expressions)[0];
    const primaryExpression = concept.expressions[primaryLang];
    const word = primaryExpression?.word || '제목 없음';
    const meaning = primaryExpression?.meaning || '의미 없음';
    
    const difficultyClass = {
        'beginner': 'badge-beginner',
        'intermediate': 'badge-intermediate', 
        'advanced': 'badge-advanced'
    }[concept.concept_info.difficulty] || 'badge-beginner';
    
    const isSelected = selectedConcepts.includes(concept.id);
    
    return `
        <div class="concept-card border ${isSelected ? 'border-green-400 bg-green-50' : 'border-gray-200'} rounded-lg p-4 cursor-pointer hover:border-green-300" 
             onclick="showConceptDetail('${concept.id}')">
            <div class="flex items-start justify-between mb-3">
                <div class="flex items-center space-x-2">
                    <input type="checkbox" 
                           ${isSelected ? 'checked' : ''} 
                           onchange="toggleConceptSelection('${concept.id}')" 
                           onclick="event.stopPropagation()"
                           class="concept-checkbox">
                    <span class="text-2xl">${concept.concept_info.unicode_emoji}</span>
                </div>
                <div class="flex items-center space-x-2">
                    <span class="badge ${concept.isApproved ? 'badge-approved' : 'badge-pending'}">
                        ${concept.isApproved ? '승인됨' : '대기중'}
                    </span>
                    <span class="badge ${difficultyClass}">
                        ${getDifficultyText(concept.concept_info.difficulty)}
                    </span>
                </div>
            </div>
            
            <div class="mb-3">
                <h3 class="font-semibold text-gray-900 mb-1">${word}</h3>
                <p class="text-gray-600 text-sm">${meaning}</p>
                <p class="text-gray-500 text-xs mt-1">
                    ${concept.concept_info.category} • ${concept.concept_info.domain}
                </p>
            </div>
            
            <div class="flex items-center justify-between text-xs text-gray-500">
                <div class="flex items-center space-x-3">
                    <span><i class="fas fa-heart text-red-500 mr-1"></i>${concept.stats.like_count}</span>
                    <span><i class="fas fa-eye text-blue-500 mr-1"></i>${concept.stats.view_count}</span>
                    <span><i class="fas fa-comment text-green-500 mr-1"></i>${concept.examples.length}</span>
                </div>
                <span>${formatDate(concept.created_at)}</span>
            </div>
        </div>
    `;
}

// 개념 상세 정보 표시
async function showConceptDetail(conceptId) {
    try {
        const concept = allConcepts.find(c => c.id === conceptId);
        if (!concept) return;
        
        document.getElementById('modalTitle').textContent = '개념 상세 정보';
        
        const languages = Object.keys(concept.expressions);
        const languageRows = languages.map(lang => {
            const expr = concept.expressions[lang];
            return `
                <tr class="border-t border-gray-200">
                    <td class="py-3 px-4 font-medium text-gray-900">${getLanguageName(lang)}</td>
                    <td class="py-3 px-4 text-gray-700">${expr.word || '-'}</td>
                    <td class="py-3 px-4 text-gray-600">${expr.meaning || '-'}</td>
                    <td class="py-3 px-4 text-gray-500 text-sm">${expr.pronunciation || expr.romanization || '-'}</td>
                </tr>
            `;
        }).join('');
        
        const exampleRows = concept.examples.map((example, index) => `
            <tr class="border-t border-gray-200">
                <td class="py-3 px-4 text-center">${index + 1}</td>
                <td class="py-3 px-4 text-gray-700">${example.from || example.text || '-'}</td>
                <td class="py-3 px-4 text-gray-600">${example.to || example.translation || '-'}</td>
            </tr>
        `).join('');
        
        document.getElementById('conceptModalContent').innerHTML = `
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <!-- 기본 정보 -->
                <div class="space-y-6">
                    <div class="bg-gray-50 rounded-lg p-4">
                        <h4 class="font-semibold text-gray-900 mb-3 flex items-center">
                            <span class="text-2xl mr-2">${concept.concept_info.unicode_emoji}</span>
                            기본 정보
                        </h4>
                        <div class="space-y-2 text-sm">
                            <div class="flex justify-between">
                                <span class="text-gray-600">ID:</span>
                                <span class="font-mono text-xs">${concept.id}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-600">카테고리:</span>
                                <span class="font-medium">${concept.concept_info.category}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-600">도메인:</span>
                                <span class="font-medium">${concept.concept_info.domain}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-600">난이도:</span>
                                <span class="badge ${getDifficultyClass(concept.concept_info.difficulty)}">
                                    ${getDifficultyText(concept.concept_info.difficulty)}
                                </span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-600">승인 상태:</span>
                                <span class="badge ${concept.isApproved ? 'badge-approved' : 'badge-pending'}">
                                    ${concept.isApproved ? '승인됨' : '대기중'}
                                </span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-600">생성일:</span>
                                <span class="font-medium">${formatDateTime(concept.created_at)}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-600">수정일:</span>
                                <span class="font-medium">${formatDateTime(concept.updated_at)}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-600">작성자:</span>
                                <span class="font-medium">${concept.userId}</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- 통계 정보 -->
                    <div class="bg-gray-50 rounded-lg p-4">
                        <h4 class="font-semibold text-gray-900 mb-3">통계</h4>
                        <div class="grid grid-cols-2 gap-4 text-center">
                            <div class="bg-white rounded-lg p-3">
                                <div class="text-2xl font-bold text-red-600">${concept.stats.like_count}</div>
                                <div class="text-xs text-gray-600">좋아요</div>
                            </div>
                            <div class="bg-white rounded-lg p-3">
                                <div class="text-2xl font-bold text-blue-600">${concept.stats.view_count}</div>
                                <div class="text-xs text-gray-600">조회수</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- 언어별 표현 및 예문 -->
                <div class="space-y-6">
                    <!-- 언어별 표현 -->
                    <div>
                        <h4 class="font-semibold text-gray-900 mb-3">언어별 표현</h4>
                        <div class="bg-gray-50 rounded-lg overflow-hidden">
                            <table class="w-full">
                                <thead class="bg-gray-100">
                                    <tr>
                                        <th class="py-2 px-4 text-left text-xs font-medium text-gray-600">언어</th>
                                        <th class="py-2 px-4 text-left text-xs font-medium text-gray-600">단어</th>
                                        <th class="py-2 px-4 text-left text-xs font-medium text-gray-600">의미</th>
                                        <th class="py-2 px-4 text-left text-xs font-medium text-gray-600">발음</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${languageRows}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    
                    <!-- 예문 -->
                    <div>
                        <h4 class="font-semibold text-gray-900 mb-3">예문 (${concept.examples.length}개)</h4>
                        ${concept.examples.length > 0 ? `
                            <div class="bg-gray-50 rounded-lg overflow-hidden concept-preview">
                                <table class="w-full">
                                    <thead class="bg-gray-100">
                                        <tr>
                                            <th class="py-2 px-4 text-center text-xs font-medium text-gray-600">#</th>
                                            <th class="py-2 px-4 text-left text-xs font-medium text-gray-600">원문</th>
                                            <th class="py-2 px-4 text-left text-xs font-medium text-gray-600">번역</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${exampleRows}
                                    </tbody>
                                </table>
                            </div>
                        ` : `
                            <div class="text-center py-8 text-gray-500">
                                <i class="fas fa-comment-slash text-2xl mb-2"></i>
                                <p>등록된 예문이 없습니다.</p>
                            </div>
                        `}
                    </div>
                </div>
            </div>
            
            <!-- 관리 도구 -->
            <div class="mt-8 pt-6 border-t border-gray-200">
                <h4 class="font-semibold text-gray-900 mb-4">관리 도구</h4>
                <div class="flex flex-wrap gap-3">
                    <button onclick="editConcept('${concept.id}')" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200">
                        <i class="fas fa-edit mr-2"></i>편집
                    </button>
                    <button onclick="toggleApproval('${concept.id}')" class="px-4 py-2 ${concept.isApproved ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700'} text-white rounded-lg transition duration-200">
                        <i class="fas ${concept.isApproved ? 'fa-pause' : 'fa-check'} mr-2"></i>
                        ${concept.isApproved ? '승인 취소' : '승인'}
                    </button>
                    <button onclick="duplicateConcept('${concept.id}')" class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition duration-200">
                        <i class="fas fa-copy mr-2"></i>복제
                    </button>
                    <button onclick="exportConcept('${concept.id}')" class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition duration-200">
                        <i class="fas fa-download mr-2"></i>내보내기
                    </button>
                    <button onclick="deleteConcept('${concept.id}')" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200">
                        <i class="fas fa-trash mr-2"></i>삭제
                    </button>
                </div>
            </div>
        `;
        
        document.getElementById('conceptModal').classList.remove('hidden');
        
    } catch (error) {
        console.error('개념 상세 정보 로드 실패:', error);
    }
}

// 유틸리티 함수들
function getDifficultyText(difficulty) {
    const map = {
        'beginner': '초급',
        'intermediate': '중급', 
        'advanced': '고급'
    };
    return map[difficulty] || '초급';
}

function getDifficultyClass(difficulty) {
    return {
        'beginner': 'badge-beginner',
        'intermediate': 'badge-intermediate',
        'advanced': 'badge-advanced'
    }[difficulty] || 'badge-beginner';
}

function getLanguageName(code) {
    const map = {
        'ko': '한국어',
        'en': '영어', 
        'ja': '일본어',
        'zh': '중국어',
        'es': '스페인어',
        'fr': '프랑스어'
    };
    return map[code] || code.toUpperCase();
}

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

// 선택 관리
function toggleConceptSelection(conceptId) {
    const index = selectedConcepts.indexOf(conceptId);
    if (index > -1) {
        selectedConcepts.splice(index, 1);
    } else {
        selectedConcepts.push(conceptId);
    }
    updateBulkActions();
    displayConcepts(); // UI 업데이트를 위해 다시 렌더링
}

function toggleSelectAll() {
    const selectAll = document.getElementById('selectAll').checked;
    const currentPageConcepts = filteredConcepts.slice(
        (currentPage - 1) * conceptsPerPage,
        currentPage * conceptsPerPage
    );
    
    if (selectAll) {
        // 현재 페이지의 모든 개념 선택
        currentPageConcepts.forEach(concept => {
            if (!selectedConcepts.includes(concept.id)) {
                selectedConcepts.push(concept.id);
            }
        });
    } else {
        // 현재 페이지의 모든 개념 선택 해제
        currentPageConcepts.forEach(concept => {
            const index = selectedConcepts.indexOf(concept.id);
            if (index > -1) {
                selectedConcepts.splice(index, 1);
            }
        });
    }
    
    updateBulkActions();
    displayConcepts();
}

function updateBulkActions() {
    const bulkActionsEl = document.getElementById('bulkActions');
    const selectedCountEl = document.getElementById('selectedCount');
    
    if (selectedConcepts.length > 0) {
        bulkActionsEl.classList.remove('hidden');
        selectedCountEl.textContent = selectedConcepts.length;
    } else {
        bulkActionsEl.classList.add('hidden');
    }
}

function clearSelection() {
    selectedConcepts = [];
    document.getElementById('selectAll').checked = false;
    updateBulkActions();
    displayConcepts();
}

// 페이지네이션 업데이트
function updatePagination() {
    const totalConcepts = filteredConcepts.length;
    const totalPages = Math.ceil(totalConcepts / conceptsPerPage);
    const startIndex = (currentPage - 1) * conceptsPerPage + 1;
    const endIndex = Math.min(currentPage * conceptsPerPage, totalConcepts);
    
    document.getElementById('paginationInfo').textContent = 
        `${startIndex}-${endIndex} / 총 ${totalConcepts.toLocaleString()}개`;
    
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

// UI 상태 관리
function showLoading() {
    document.getElementById('loadingConcepts').classList.remove('hidden');
    document.getElementById('conceptsList').classList.add('hidden');
    document.getElementById('conceptsError').classList.add('hidden');
}

function hideLoading() {
    document.getElementById('loadingConcepts').classList.add('hidden');
    document.getElementById('conceptsList').classList.remove('hidden');
    document.getElementById('conceptsError').classList.add('hidden');
}

function showError() {
    document.getElementById('loadingConcepts').classList.add('hidden');
    document.getElementById('conceptsList').classList.add('hidden');
    document.getElementById('conceptsError').classList.remove('hidden');
}

// 이벤트 핸들러들
function handleSearch() {
    clearTimeout(window.searchTimeout);
    window.searchTimeout = setTimeout(applyFilters, 300);
}

function changePage(direction) {
    const totalPages = Math.ceil(filteredConcepts.length / conceptsPerPage);
    const newPage = currentPage + direction;
    
    if (newPage >= 1 && newPage <= totalPages) {
        currentPage = newPage;
        displayConcepts();
    }
}

function closeConceptModal() {
    document.getElementById('conceptModal').classList.add('hidden');
}

function closeCreateModal() {
    document.getElementById('createConceptModal').classList.add('hidden');
}

function refreshConcepts() {
    selectedConcepts = [];
    updateBulkActions();
    loadConceptsData();
}

// 개념 관리 기능들 (기본 구현)
function editConcept(conceptId) {
    const concept = allConcepts.find(c => c.id === conceptId);
    if (!concept) return;
    
    // 모달 제목 변경
    document.getElementById('modalTitle').textContent = '개념 편집';
    
    // 편집 폼 생성
    const editForm = `
        <form id="editConceptForm" class="space-y-6">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- 기본 정보 -->
                <div class="space-y-4">
                    <h4 class="text-lg font-semibold text-gray-900 border-b pb-2">기본 정보</h4>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">언어</label>
                        <select id="editLanguage" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
                            <option value="ko" ${concept.concept_info?.language === 'ko' ? 'selected' : ''}>한국어</option>
                            <option value="en" ${concept.concept_info?.language === 'en' ? 'selected' : ''}>영어</option>
                            <option value="ja" ${concept.concept_info?.language === 'ja' ? 'selected' : ''}>일본어</option>
                            <option value="zh" ${concept.concept_info?.language === 'zh' ? 'selected' : ''}>중국어</option>
                        </select>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">카테고리</label>
                        <select id="editCategory" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
                            <option value="daily" ${concept.concept_info?.category === 'daily' ? 'selected' : ''}>일상</option>
                            <option value="business" ${concept.concept_info?.category === 'business' ? 'selected' : ''}>비즈니스</option>
                            <option value="academic" ${concept.concept_info?.category === 'academic' ? 'selected' : ''}>학술</option>
                            <option value="casual" ${concept.concept_info?.category === 'casual' ? 'selected' : ''}>캐주얼</option>
                        </select>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">난이도</label>
                        <select id="editDifficulty" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
                            <option value="beginner" ${concept.concept_info?.difficulty === 'beginner' ? 'selected' : ''}>초급</option>
                            <option value="intermediate" ${concept.concept_info?.difficulty === 'intermediate' ? 'selected' : ''}>중급</option>
                            <option value="advanced" ${concept.concept_info?.difficulty === 'advanced' ? 'selected' : ''}>고급</option>
                        </select>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">개념 설명</label>
                        <textarea id="editDescription" rows="3" placeholder="개념에 대한 설명을 입력하세요" 
                                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">${concept.concept_info?.description || ''}</textarea>
                    </div>
                    
                    <div class="flex items-center">
                        <input type="checkbox" id="editApproved" class="mr-2" ${concept.isApproved ? 'checked' : ''}>
                        <label for="editApproved" class="text-sm text-gray-700">승인됨</label>
                    </div>
                </div>
                
                <!-- 표현 및 예제 -->
                <div class="space-y-4">
                    <h4 class="text-lg font-semibold text-gray-900 border-b pb-2">표현 및 예제</h4>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">표현 목록</label>
                        <div id="editExpressions" class="space-y-2">
                            ${concept.expressions?.map((expr, index) => `
                                <div class="flex items-center space-x-2">
                                    <input type="text" value="${expr.text || ''}" 
                                           class="flex-1 px-3 py-2 border border-gray-300 rounded-lg expression-text">
                                    <input type="text" value="${expr.translation || ''}" placeholder="번역" 
                                           class="flex-1 px-3 py-2 border border-gray-300 rounded-lg expression-translation">
                                    <button type="button" onclick="removeExpression(${index})" class="px-2 py-1 bg-red-500 text-white rounded">
                                        <i class="fas fa-times"></i>
                                    </button>
                                </div>
                            `).join('') || ''}
                        </div>
                        <button type="button" onclick="addExpression()" class="mt-2 px-3 py-1 bg-green-500 text-white rounded-lg text-sm">
                            <i class="fas fa-plus mr-1"></i>표현 추가
                        </button>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">예제 문장</label>
                        <div id="editExamples" class="space-y-2">
                            ${concept.examples?.map((example, index) => `
                                <div class="border border-gray-200 rounded-lg p-3 space-y-2">
                                    <div class="flex items-center justify-between">
                                        <span class="text-sm font-medium text-gray-600">예제 ${index + 1}</span>
                                        <button type="button" onclick="removeExample(${index})" class="text-red-500 hover:text-red-700">
                                            <i class="fas fa-times"></i>
                                        </button>
                                    </div>
                                    <input type="text" value="${example.sentence || ''}" placeholder="예제 문장" 
                                           class="w-full px-3 py-2 border border-gray-300 rounded example-sentence">
                                    <input type="text" value="${example.translation || ''}" placeholder="번역" 
                                           class="w-full px-3 py-2 border border-gray-300 rounded example-translation">
                                    <textarea placeholder="설명 (선택사항)" rows="2" 
                                            class="w-full px-3 py-2 border border-gray-300 rounded example-explanation">${example.explanation || ''}</textarea>
                                </div>
                            `).join('') || ''}
                        </div>
                        <button type="button" onclick="addExample()" class="mt-2 px-3 py-1 bg-blue-500 text-white rounded-lg text-sm">
                            <i class="fas fa-plus mr-1"></i>예제 추가
                        </button>
                    </div>
                </div>
            </div>
            
            <div class="flex justify-end space-x-3 pt-4 border-t">
                <button type="button" onclick="closeConceptModal()" 
                        class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                    취소
                </button>
                <button type="submit" 
                        class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                    <i class="fas fa-save mr-2"></i>저장
                </button>
            </div>
        </form>
    `;
    
    document.getElementById('conceptModalContent').innerHTML = editForm;
    document.getElementById('conceptModal').classList.remove('hidden');
    
    // 폼 제출 이벤트 처리
    document.getElementById('editConceptForm').onsubmit = async (e) => {
        e.preventDefault();
        await saveConceptEdit(conceptId);
    };
}

async function toggleApproval(conceptId) {
    try {
        const concept = allConcepts.find(c => c.id === conceptId);
        const newStatus = !concept.isApproved;
        
        if (!confirm(`이 개념을 ${newStatus ? '승인' : '승인 취소'}하시겠습니까?`)) {
            return;
        }
        
        // Firestore 업데이트
        const conceptRef = doc(db, 'concepts', conceptId);
        await updateDoc(conceptRef, {
            isApproved: newStatus,
            approvedBy: newStatus ? currentUser.email : null,
            approvedAt: newStatus ? new Date() : null,
            updated_at: new Date()
        });
        
        // 로컬 데이터 업데이트
        concept.isApproved = newStatus;
        concept.approvedBy = newStatus ? currentUser.email : null;
        concept.approvedAt = newStatus ? new Date() : null;
        
        // UI 새로고침
        displayConcepts();
        closeConceptModal();
        
        alert(`개념이 ${newStatus ? '승인' : '승인 취소'}되었습니다.`);
        
    } catch (error) {
        console.error('승인 상태 변경 실패:', error);
        alert('승인 상태 변경에 실패했습니다.');
    }
}

function duplicateConcept(conceptId) {
    alert(`개념 복제 기능 (${conceptId})은 구현 예정입니다.`);
}

function exportConcept(conceptId) {
    try {
        const concept = allConcepts.find(c => c.id === conceptId);
        if (!concept) return;
        
        // JSON 형태로 내보내기
        const exportData = {
            id: concept.id,
            concept_info: concept.concept_info,
            expressions: concept.expressions,
            examples: concept.examples,
            representative_example: concept.representative_example,
            created_at: concept.created_at.toISOString(),
            stats: concept.stats
        };
        
        const jsonContent = JSON.stringify(exportData, null, 2);
        const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `concept_${concept.id}_${new Date().toISOString().split('T')[0]}.json`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
    } catch (error) {
        console.error('개념 내보내기 실패:', error);
        alert('개념 내보내기에 실패했습니다.');
    }
}

async function deleteConcept(conceptId) {
    try {
        if (!confirm('정말로 이 개념을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
            return;
        }
        
        // Firestore에서 삭제
        const conceptRef = doc(db, 'concepts', conceptId);
        await deleteDoc(conceptRef);
        
        // 로컬 데이터에서 제거
        const index = allConcepts.findIndex(c => c.id === conceptId);
        if (index > -1) {
            allConcepts.splice(index, 1);
        }
        
        // UI 새로고침
        applyFilters();
        closeConceptModal();
        
        alert('개념이 삭제되었습니다.');
        
    } catch (error) {
        console.error('개념 삭제 실패:', error);
        alert('개념 삭제에 실패했습니다.');
    }
}

// 대량 작업 기능들
async function bulkApprove() {
    if (selectedConcepts.length === 0) return;
    
    if (!confirm(`선택된 ${selectedConcepts.length}개 개념을 일괄 승인하시겠습니까?`)) {
        return;
    }
    
    try {
        // 병렬로 처리
        await Promise.all(selectedConcepts.map(async (conceptId) => {
            const conceptRef = doc(db, 'concepts', conceptId);
            await updateDoc(conceptRef, {
                isApproved: true,
                approvedBy: currentUser.email,
                approvedAt: new Date(),
                updated_at: new Date()
            });
            
            // 로컬 데이터 업데이트
            const concept = allConcepts.find(c => c.id === conceptId);
            if (concept) {
                concept.isApproved = true;
                concept.approvedBy = currentUser.email;
                concept.approvedAt = new Date();
            }
        }));
        
        clearSelection();
        displayConcepts();
        alert(`${selectedConcepts.length}개 개념이 승인되었습니다.`);
        
    } catch (error) {
        console.error('일괄 승인 실패:', error);
        alert('일괄 승인에 실패했습니다.');
    }
}

async function bulkReject() {
    if (selectedConcepts.length === 0) return;
    
    if (!confirm(`선택된 ${selectedConcepts.length}개 개념을 일괄 거부하시겠습니까?`)) {
        return;
    }
    
    try {
        await Promise.all(selectedConcepts.map(async (conceptId) => {
            const conceptRef = doc(db, 'concepts', conceptId);
            await updateDoc(conceptRef, {
                isApproved: false,
                approvedBy: null,
                approvedAt: null,
                updated_at: new Date()
            });
            
            const concept = allConcepts.find(c => c.id === conceptId);
            if (concept) {
                concept.isApproved = false;
                concept.approvedBy = null;
                concept.approvedAt = null;
            }
        }));
        
        clearSelection();
        displayConcepts();
        alert(`${selectedConcepts.length}개 개념이 거부되었습니다.`);
        
    } catch (error) {
        console.error('일괄 거부 실패:', error);
        alert('일괄 거부에 실패했습니다.');
    }
}

async function bulkDelete() {
    if (selectedConcepts.length === 0) return;
    
    if (!confirm(`선택된 ${selectedConcepts.length}개 개념을 일괄 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) {
        return;
    }
    
    try {
        await Promise.all(selectedConcepts.map(async (conceptId) => {
            const conceptRef = doc(db, 'concepts', conceptId);
            await deleteDoc(conceptRef);
            
            const index = allConcepts.findIndex(c => c.id === conceptId);
            if (index > -1) {
                allConcepts.splice(index, 1);
            }
        }));
        
        clearSelection();
        applyFilters();
        alert(`${selectedConcepts.length}개 개념이 삭제되었습니다.`);
        
    } catch (error) {
        console.error('일괄 삭제 실패:', error);
        alert('일괄 삭제에 실패했습니다.');
    }
}

// 편집 폼 동적 기능들
function addExpression() {
    const container = document.getElementById('editExpressions');
    const index = container.children.length;
    
    const expressionDiv = document.createElement('div');
    expressionDiv.className = 'flex items-center space-x-2';
    expressionDiv.innerHTML = `
        <input type="text" placeholder="표현" 
               class="flex-1 px-3 py-2 border border-gray-300 rounded-lg expression-text">
        <input type="text" placeholder="번역" 
               class="flex-1 px-3 py-2 border border-gray-300 rounded-lg expression-translation">
        <button type="button" onclick="removeExpression(${index})" class="px-2 py-1 bg-red-500 text-white rounded">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    container.appendChild(expressionDiv);
}

function removeExpression(index) {
    const container = document.getElementById('editExpressions');
    const items = container.children;
    if (items[index]) {
        items[index].remove();
    }
}

function addExample() {
    const container = document.getElementById('editExamples');
    const index = container.children.length + 1;
    
    const exampleDiv = document.createElement('div');
    exampleDiv.className = 'border border-gray-200 rounded-lg p-3 space-y-2';
    exampleDiv.innerHTML = `
        <div class="flex items-center justify-between">
            <span class="text-sm font-medium text-gray-600">예제 ${index}</span>
            <button type="button" onclick="removeExample(${index - 1})" class="text-red-500 hover:text-red-700">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <input type="text" placeholder="예제 문장" 
               class="w-full px-3 py-2 border border-gray-300 rounded example-sentence">
        <input type="text" placeholder="번역" 
               class="w-full px-3 py-2 border border-gray-300 rounded example-translation">
        <textarea placeholder="설명 (선택사항)" rows="2" 
                class="w-full px-3 py-2 border border-gray-300 rounded example-explanation"></textarea>
    `;
    
    container.appendChild(exampleDiv);
}

function removeExample(index) {
    const container = document.getElementById('editExamples');
    const items = container.children;
    if (items[index]) {
        items[index].remove();
        // 인덱스 재조정
        Array.from(items).forEach((item, i) => {
            const span = item.querySelector('.text-sm');
            if (span) span.textContent = `예제 ${i + 1}`;
        });
    }
}

// 개념 편집 저장
async function saveConceptEdit(conceptId) {
    try {
        // 폼 데이터 수집
        const language = document.getElementById('editLanguage').value;
        const category = document.getElementById('editCategory').value;
        const difficulty = document.getElementById('editDifficulty').value;
        const description = document.getElementById('editDescription').value;
        const approved = document.getElementById('editApproved').checked;
        
        // 표현 목록 수집
        const expressionInputs = document.querySelectorAll('#editExpressions > div');
        const expressions = Array.from(expressionInputs).map(div => ({
            text: div.querySelector('.expression-text').value.trim(),
            translation: div.querySelector('.expression-translation').value.trim()
        })).filter(expr => expr.text);
        
        // 예제 목록 수집
        const exampleDivs = document.querySelectorAll('#editExamples > div');
        const examples = Array.from(exampleDivs).map(div => ({
            sentence: div.querySelector('.example-sentence').value.trim(),
            translation: div.querySelector('.example-translation').value.trim(),
            explanation: div.querySelector('.example-explanation').value.trim()
        })).filter(example => example.sentence);
        
        // 업데이트할 데이터 구성
        const updateData = {
            concept_info: {
                language,
                category,
                difficulty,
                description
            },
            expressions,
            examples,
            isApproved: approved,
            updated_at: new Date()
        };
        
        // 승인 상태가 변경된 경우 관련 필드 업데이트
        const originalConcept = allConcepts.find(c => c.id === conceptId);
        if (approved !== originalConcept.isApproved) {
            if (approved) {
                updateData.approvedBy = currentUser.email;
                updateData.approvedAt = new Date();
            } else {
                updateData.approvedBy = null;
                updateData.approvedAt = null;
            }
        }
        
        // Firestore 업데이트
        const conceptRef = doc(db, 'concepts', conceptId);
        await updateDoc(conceptRef, updateData);
        
        // 로컬 데이터 업데이트
        Object.assign(originalConcept, updateData);
        
        // UI 새로고침
        displayConcepts();
        closeConceptModal();
        
        alert('개념이 성공적으로 업데이트되었습니다.');
        
    } catch (error) {
        console.error('개념 편집 저장 실패:', error);
        alert('개념 저장에 실패했습니다.');
    }
}

function showCreateConcept() {
    // 생성 모달 제목 설정
    const createModal = document.getElementById('createConceptModal');
    
    // 생성 폼 생성
    const createForm = `
        <form id="createConceptForm" class="space-y-6">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- 기본 정보 -->
                <div class="space-y-4">
                    <h4 class="text-lg font-semibold text-gray-900 border-b pb-2">기본 정보</h4>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">언어 <span class="text-red-500">*</span></label>
                        <select id="createLanguage" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
                            <option value="">언어 선택</option>
                            <option value="ko">한국어</option>
                            <option value="en">영어</option>
                            <option value="ja">일본어</option>
                            <option value="zh">중국어</option>
                        </select>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">카테고리 <span class="text-red-500">*</span></label>
                        <select id="createCategory" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
                            <option value="">카테고리 선택</option>
                            <option value="daily">일상</option>
                            <option value="business">비즈니스</option>
                            <option value="academic">학술</option>
                            <option value="casual">캐주얼</option>
                        </select>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">난이도 <span class="text-red-500">*</span></label>
                        <select id="createDifficulty" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
                            <option value="">난이도 선택</option>
                            <option value="beginner">초급</option>
                            <option value="intermediate">중급</option>
                            <option value="advanced">고급</option>
                        </select>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">개념 설명</label>
                        <textarea id="createDescription" rows="3" placeholder="개념에 대한 설명을 입력하세요" 
                                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"></textarea>
                    </div>
                    
                    <div class="flex items-center">
                        <input type="checkbox" id="createApproved" class="mr-2">
                        <label for="createApproved" class="text-sm text-gray-700">생성 즉시 승인</label>
                    </div>
                </div>
                
                <!-- 표현 및 예제 -->
                <div class="space-y-4">
                    <h4 class="text-lg font-semibold text-gray-900 border-b pb-2">표현 및 예제</h4>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">표현 목록 <span class="text-red-500">*</span></label>
                        <div id="createExpressions" class="space-y-2">
                            <div class="flex items-center space-x-2">
                                <input type="text" placeholder="표현" required
                                       class="flex-1 px-3 py-2 border border-gray-300 rounded-lg expression-text">
                                <input type="text" placeholder="번역" 
                                       class="flex-1 px-3 py-2 border border-gray-300 rounded-lg expression-translation">
                                <button type="button" onclick="removeCreateExpression(0)" class="px-2 py-1 bg-red-500 text-white rounded">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                        </div>
                        <button type="button" onclick="addCreateExpression()" class="mt-2 px-3 py-1 bg-green-500 text-white rounded-lg text-sm">
                            <i class="fas fa-plus mr-1"></i>표현 추가
                        </button>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">예제 문장</label>
                        <div id="createExamples" class="space-y-2">
                            <div class="border border-gray-200 rounded-lg p-3 space-y-2">
                                <div class="flex items-center justify-between">
                                    <span class="text-sm font-medium text-gray-600">예제 1</span>
                                    <button type="button" onclick="removeCreateExample(0)" class="text-red-500 hover:text-red-700">
                                        <i class="fas fa-times"></i>
                                    </button>
                                </div>
                                <input type="text" placeholder="예제 문장" 
                                       class="w-full px-3 py-2 border border-gray-300 rounded example-sentence">
                                <input type="text" placeholder="번역" 
                                       class="w-full px-3 py-2 border border-gray-300 rounded example-translation">
                                <textarea placeholder="설명 (선택사항)" rows="2" 
                                        class="w-full px-3 py-2 border border-gray-300 rounded example-explanation"></textarea>
                            </div>
                        </div>
                        <button type="button" onclick="addCreateExample()" class="mt-2 px-3 py-1 bg-blue-500 text-white rounded-lg text-sm">
                            <i class="fas fa-plus mr-1"></i>예제 추가
                        </button>
                    </div>
                </div>
            </div>
            
            <div class="flex justify-end space-x-3 pt-4 border-t">
                <button type="button" onclick="closeCreateModal()" 
                        class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                    취소
                </button>
                <button type="submit" 
                        class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                    <i class="fas fa-plus mr-2"></i>생성
                </button>
            </div>
        </form>
    `;
    
    document.getElementById('createConceptContent').innerHTML = createForm;
    createModal.classList.remove('hidden');
    
    // 폼 제출 이벤트 처리
    document.getElementById('createConceptForm').onsubmit = async (e) => {
        e.preventDefault();
        await saveNewConcept();
    };
}

// 생성 폼 동적 기능들
function addCreateExpression() {
    const container = document.getElementById('createExpressions');
    const index = container.children.length;
    
    const expressionDiv = document.createElement('div');
    expressionDiv.className = 'flex items-center space-x-2';
    expressionDiv.innerHTML = `
        <input type="text" placeholder="표현" 
               class="flex-1 px-3 py-2 border border-gray-300 rounded-lg expression-text">
        <input type="text" placeholder="번역" 
               class="flex-1 px-3 py-2 border border-gray-300 rounded-lg expression-translation">
        <button type="button" onclick="removeCreateExpression(${index})" class="px-2 py-1 bg-red-500 text-white rounded">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    container.appendChild(expressionDiv);
}

function removeCreateExpression(index) {
    const container = document.getElementById('createExpressions');
    const items = container.children;
    if (items[index] && items.length > 1) { // 최소 1개는 남겨둠
        items[index].remove();
    }
}

function addCreateExample() {
    const container = document.getElementById('createExamples');
    const index = container.children.length + 1;
    
    const exampleDiv = document.createElement('div');
    exampleDiv.className = 'border border-gray-200 rounded-lg p-3 space-y-2';
    exampleDiv.innerHTML = `
        <div class="flex items-center justify-between">
            <span class="text-sm font-medium text-gray-600">예제 ${index}</span>
            <button type="button" onclick="removeCreateExample(${index - 1})" class="text-red-500 hover:text-red-700">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <input type="text" placeholder="예제 문장" 
               class="w-full px-3 py-2 border border-gray-300 rounded example-sentence">
        <input type="text" placeholder="번역" 
               class="w-full px-3 py-2 border border-gray-300 rounded example-translation">
        <textarea placeholder="설명 (선택사항)" rows="2" 
                class="w-full px-3 py-2 border border-gray-300 rounded example-explanation"></textarea>
    `;
    
    container.appendChild(exampleDiv);
}

function removeCreateExample(index) {
    const container = document.getElementById('createExamples');
    const items = container.children;
    if (items[index]) {
        items[index].remove();
        // 인덱스 재조정
        Array.from(items).forEach((item, i) => {
            const span = item.querySelector('.text-sm');
            if (span) span.textContent = `예제 ${i + 1}`;
        });
    }
}

// 새 개념 저장
async function saveNewConcept() {
    try {
        // 폼 데이터 수집
        const language = document.getElementById('createLanguage').value;
        const category = document.getElementById('createCategory').value;
        const difficulty = document.getElementById('createDifficulty').value;
        const description = document.getElementById('createDescription').value;
        const approved = document.getElementById('createApproved').checked;
        
        // 필수 필드 검증
        if (!language || !category || !difficulty) {
            alert('언어, 카테고리, 난이도는 필수 입력 항목입니다.');
            return;
        }
        
        // 표현 목록 수집
        const expressionInputs = document.querySelectorAll('#createExpressions > div');
        const expressions = Array.from(expressionInputs).map(div => ({
            text: div.querySelector('.expression-text').value.trim(),
            translation: div.querySelector('.expression-translation').value.trim()
        })).filter(expr => expr.text);
        
        if (expressions.length === 0) {
            alert('최소 하나 이상의 표현을 입력해주세요.');
            return;
        }
        
        // 예제 목록 수집
        const exampleDivs = document.querySelectorAll('#createExamples > div');
        const examples = Array.from(exampleDivs).map(div => ({
            sentence: div.querySelector('.example-sentence').value.trim(),
            translation: div.querySelector('.example-translation').value.trim(),
            explanation: div.querySelector('.example-explanation').value.trim()
        })).filter(example => example.sentence);
        
        // 새 개념 데이터 구성
        const newConceptData = {
            concept_info: {
                language,
                category,
                difficulty,
                description
            },
            expressions,
            examples,
            isApproved: approved,
            created_at: new Date(),
            updated_at: new Date(),
            createdBy: currentUser.email
        };
        
        // 승인 정보 추가
        if (approved) {
            newConceptData.approvedBy = currentUser.email;
            newConceptData.approvedAt = new Date();
        }
        
        // Firestore에 새 개념 추가
        const conceptsRef = collection(db, 'concepts');
        const docRef = await addDoc(conceptsRef, newConceptData);
        
        // 로컬 데이터에 추가
        const newConcept = {
            id: docRef.id,
            ...newConceptData,
            stats: {
                view_count: 0,
                like_count: 0,
                learn_count: 0
            }
        };
        
        allConcepts.unshift(newConcept); // 맨 앞에 추가
        
        // UI 새로고침
        applyFilters();
        closeCreateModal();
        
        alert('새 개념이 성공적으로 생성되었습니다.');
        
    } catch (error) {
        console.error('새 개념 생성 실패:', error);
        alert('개념 생성에 실패했습니다.');
    }
}

// 전역 함수 노출
window.handleSearch = handleSearch;
window.applyFilters = applyFilters;
window.changePage = changePage;
window.showConceptDetail = showConceptDetail;
window.closeConceptModal = closeConceptModal;
window.closeCreateModal = closeCreateModal;
window.refreshConcepts = refreshConcepts;
window.toggleConceptSelection = toggleConceptSelection;
window.toggleSelectAll = toggleSelectAll;
window.clearSelection = clearSelection;
window.editConcept = editConcept;
window.toggleApproval = toggleApproval;
window.duplicateConcept = duplicateConcept;
window.exportConcept = exportConcept;
window.deleteConcept = deleteConcept;
window.bulkApprove = bulkApprove;
window.bulkReject = bulkReject;
window.bulkDelete = bulkDelete;
window.showCreateConcept = showCreateConcept;

// 페이지 로드 시 초기화
window.addEventListener('DOMContentLoaded', initializeConceptsManagement);