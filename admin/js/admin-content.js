// admin-content.js - 콘텐츠 관리 시스템
import { 
    collection, 
    doc, 
    getDocs, 
    getDoc, 
    setDoc, 
    updateDoc, 
    deleteDoc, 
    query, 
    where, 
    orderBy, 
    limit,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

// 전역 변수
let allContent = [];
let filteredContent = [];
let selectedContent = new Set();
let currentPage = 1;
let contentPerPage = 10;
let isEditMode = false;
let currentEditingId = null;
let quillEditor = null;
let db;
let auth;

// Firebase 초기화 완료 확인
function initializeContentManager() {
    if (window.db && window.auth) {
        db = window.db;
        auth = window.auth;
        console.log('📰 콘텐츠 관리 시스템 초기화 시작');
        
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
        setTimeout(initializeContentManager, 100);
    }
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', initializeContentManager);

// 관리자 권한 확인
async function checkAdminPermission(userEmail) {
    try {
        console.log('🔐 관리자 권한 확인 중...');
        
        const userRef = doc(db, 'users', userEmail);
        const userDoc = await getDoc(userRef);
        
        // 간단한 관리자 이메일 체크 (admin-main.js와 동일한 방식)
        const ADMIN_EMAILS = [
            'admin@likevoca.com',
            'manager@likevoca.com',
            'motioncomc@gmail.com',
        ];
        
        const isAdmin = ADMIN_EMAILS.includes(userEmail);
        
        if (isAdmin) {
            console.log('✅ 관리자 권한 확인됨');
            await startContentManager();
        } else {
            console.log('❌ 관리자 권한 없음');
            showAccessDenied();
        }
    } catch (error) {
        console.error('❌ 관리자 권한 확인 중 오류:', error);
        showAccessDenied();
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

// 콘텐츠 관리자 시작
async function startContentManager() {
    console.log('🚀 콘텐츠 관리자 시작');
    
    try {
        // Quill 에디터 초기화
        initializeEditor();
        
        // 이벤트 리스너 설정
        setupEventListeners();
        
        // 콘텐츠 데이터 로드
        await loadContentData();
        
        console.log('✅ 콘텐츠 관리자 초기화 완료');
    } catch (error) {
        console.error('❌ 콘텐츠 관리자 초기화 실패:', error);
        showError('콘텐츠 관리자 초기화에 실패했습니다.');
    }
}

// Quill 에디터 초기화
function initializeEditor() {
    console.log('📝 Quill 에디터 초기화');
    
    const editorElement = document.getElementById('contentEditor');
    if (editorElement) {
        quillEditor = new Quill('#contentEditor', {
            theme: 'snow',
            modules: {
                toolbar: [
                    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                    ['bold', 'italic', 'underline', 'strike'],
                    ['blockquote', 'code-block'],
                    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                    [{ 'script': 'sub'}, { 'script': 'super' }],
                    [{ 'indent': '-1'}, { 'indent': '+1' }],
                    [{ 'color': [] }, { 'background': [] }],
                    [{ 'align': [] }],
                    ['link', 'image', 'video'],
                    ['clean']
                ]
            },
            placeholder: '콘텐츠 내용을 입력하세요...'
        });
        console.log('✅ Quill 에디터 초기화 완료');
    }
}

// 이벤트 리스너 설정
function setupEventListeners() {
    console.log('🔧 이벤트 리스너 설정');
    
    // 검색 입력
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(handleSearch, 300));
    }
    
    // 폼 제출
    const contentForm = document.getElementById('contentForm');
    if (contentForm) {
        contentForm.addEventListener('submit', handleFormSubmit);
    }
    
    // 상태 변경 시 예약 날짜 필드 표시/숨김
    const statusSelect = document.getElementById('contentStatus');
    if (statusSelect) {
        statusSelect.addEventListener('change', togglePublishDateField);
    }
    
    console.log('✅ 이벤트 리스너 설정 완료');
}

// 콘텐츠 데이터 로드
async function loadContentData() {
    try {
        console.log('📊 콘텐츠 데이터 로드 시작');
        showLoading();
        
        // content 컬렉션에서 모든 콘텐츠 조회
        const contentRef = collection(db, 'content');
        const contentSnapshot = await getDocs(contentRef);
        
        allContent = [];
        let publishedCount = 0;
        let draftCount = 0;
        let scheduledCount = 0;
        let archivedCount = 0;
        
        contentSnapshot.forEach((doc) => {
            const data = doc.data();
            const content = {
                id: doc.id,
                ...data,
                created_at: data.created_at?.toDate ? data.created_at.toDate() : new Date(data.created_at),
                updated_at: data.updated_at?.toDate ? data.updated_at.toDate() : new Date(data.updated_at),
                publish_date: data.publish_date?.toDate ? data.publish_date.toDate() : (data.publish_date ? new Date(data.publish_date) : null)
            };
            
            allContent.push(content);
            
            // 상태별 카운트
            switch (content.status) {
                case 'published': publishedCount++; break;
                case 'draft': draftCount++; break;
                case 'scheduled': scheduledCount++; break;
                case 'archived': archivedCount++; break;
            }
        });
        
        console.log(`✅ 총 ${allContent.length}개의 콘텐츠 로드 완료`);
        
        // 통계 업데이트
        updateStatistics(allContent.length, publishedCount, draftCount, scheduledCount, archivedCount);
        
        // 필터 적용 및 렌더링
        applyFilters();
        
        hideLoading();
        
    } catch (error) {
        console.error('❌ 콘텐츠 데이터 로드 실패:', error);
        hideLoading();
        showError('콘텐츠 데이터를 불러오는데 실패했습니다.');
    }
}

// 통계 업데이트
function updateStatistics(total, published, draft, scheduled, archived) {
    console.log('📈 통계 업데이트:', { total, published, draft, scheduled, archived });
    
    document.getElementById('totalContent').textContent = total;
    document.getElementById('publishedContent').textContent = published;
    document.getElementById('draftContent').textContent = draft;
    document.getElementById('scheduledContent').textContent = scheduled;
    document.getElementById('archivedContent').textContent = archived;
    document.getElementById('contentCount').textContent = `총 ${total}개`;
}

// 필터 적용
function applyFilters() {
    console.log('🔍 필터 적용');
    
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
    const typeFilter = document.getElementById('typeFilter').value;
    const statusFilter = document.getElementById('statusFilter').value;
    const sortBy = document.getElementById('sortBy').value;
    
    // 필터링
    filteredContent = allContent.filter(content => {
        let matches = true;
        
        // 검색어 필터
        if (searchTerm) {
            matches = matches && (
                content.title?.toLowerCase().includes(searchTerm) ||
                content.summary?.toLowerCase().includes(searchTerm) ||
                content.content?.toLowerCase().includes(searchTerm)
            );
        }
        
        // 타입 필터
        if (typeFilter && typeFilter !== 'all') {
            matches = matches && content.type === typeFilter;
        }
        
        // 상태 필터
        if (statusFilter && statusFilter !== 'all') {
            matches = matches && content.status === statusFilter;
        }
        
        return matches;
    });
    
    // 정렬
    filteredContent.sort((a, b) => {
        switch (sortBy) {
            case 'newest':
                return new Date(b.created_at) - new Date(a.created_at);
            case 'oldest':
                return new Date(a.created_at) - new Date(b.created_at);
            case 'title':
                return (a.title || '').localeCompare(b.title || '');
            case 'type':
                return (a.type || '').localeCompare(b.type || '');
            case 'status':
                return (a.status || '').localeCompare(b.status || '');
            default:
                return new Date(b.created_at) - new Date(a.created_at);
        }
    });
    
    console.log(`📋 필터링 결과: ${filteredContent.length}개 콘텐츠`);
    
    // 페이지 재설정 및 렌더링
    currentPage = 1;
    renderContent();
}

// 콘텐츠 렌더링
function renderContent() {
    const contentList = document.getElementById('contentList');
    const contentGrid = document.getElementById('contentGrid');
    const emptyState = document.getElementById('emptyState');
    
    if (filteredContent.length === 0) {
        contentGrid.classList.add('hidden');
        emptyState.classList.remove('hidden');
        return;
    }
    
    emptyState.classList.add('hidden');
    contentGrid.classList.remove('hidden');
    
    // 페이지네이션 계산
    const startIndex = (currentPage - 1) * contentPerPage;
    const endIndex = startIndex + contentPerPage;
    const pageContent = filteredContent.slice(startIndex, endIndex);
    
    // 콘텐츠 카드 생성
    contentList.innerHTML = pageContent.map(content => createContentCard(content)).join('');
    
    // 페이지네이션 렌더링
    renderPagination();
    
    // 선택 상태 업데이트
    updateSelectionUI();
}

// 콘텐츠 카드 생성
function createContentCard(content) {
    const isSelected = selectedContent.has(content.id);
    const typeClass = `type-${content.type}`;
    const statusClass = `status-${content.status}`;
    
    const typeName = {
        notice: '공지사항',
        help: '도움말',
        banner: '배너',
        announcement: '알림',
        tutorial: '튜토리얼'
    }[content.type] || content.type;
    
    const statusName = {
        published: '게시됨',
        draft: '초안',
        scheduled: '예약됨',
        archived: '보관됨'
    }[content.status] || content.status;
    
    const publishDate = content.publish_date ? formatDate(content.publish_date) : '';
    
    return `
        <div class="content-card bg-white border rounded-xl p-6 hover:shadow-lg transition-all duration-200 ${isSelected ? 'selected-content' : ''}">
            <div class="flex items-start justify-between mb-4">
                <div class="flex items-center space-x-3">
                    <input 
                        type="checkbox" 
                        class="content-checkbox rounded border-gray-300 text-green-600 focus:ring-green-500" 
                        ${isSelected ? 'checked' : ''}
                        onchange="toggleContentSelection('${content.id}')"
                    >
                    <div class="flex space-x-2">
                        <span class="content-type-badge ${typeClass}">${typeName}</span>
                        <span class="status-badge ${statusClass}">${statusName}</span>
                        ${content.featured ? '<span class="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded"><i class="fas fa-star mr-1"></i>주요</span>' : ''}
                    </div>
                </div>
                <div class="flex items-center space-x-2">
                    <button onclick="viewContent('${content.id}')" class="text-blue-600 hover:text-blue-800" title="상세보기">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button onclick="editContent('${content.id}')" class="text-green-600 hover:text-green-800" title="편집">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="duplicateContent('${content.id}')" class="text-purple-600 hover:text-purple-800" title="복제">
                        <i class="fas fa-copy"></i>
                    </button>
                    <div class="relative">
                        <button onclick="toggleStatusMenu('${content.id}')" class="text-gray-600 hover:text-gray-800" title="상태 변경">
                            <i class="fas fa-ellipsis-v"></i>
                        </button>
                        <div id="statusMenu-${content.id}" class="hidden absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-10">
                            <button onclick="changeStatus('${content.id}', 'published')" class="w-full text-left px-4 py-2 hover:bg-gray-50 rounded-t-lg">
                                <i class="fas fa-eye text-green-600 mr-2"></i>게시
                            </button>
                            <button onclick="changeStatus('${content.id}', 'draft')" class="w-full text-left px-4 py-2 hover:bg-gray-50">
                                <i class="fas fa-edit text-yellow-600 mr-2"></i>초안으로
                            </button>
                            <button onclick="changeStatus('${content.id}', 'archived')" class="w-full text-left px-4 py-2 hover:bg-gray-50">
                                <i class="fas fa-archive text-gray-600 mr-2"></i>보관
                            </button>
                            <hr class="my-1">
                            <button onclick="deleteContent('${content.id}')" class="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 rounded-b-lg">
                                <i class="fas fa-trash mr-2"></i>삭제
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <h3 class="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">${content.title || '제목 없음'}</h3>
            
            ${content.summary ? `<p class="text-gray-600 text-sm mb-3 line-clamp-2">${content.summary}</p>` : ''}
            
            <div class="flex items-center justify-between text-xs text-gray-500">
                <div class="flex items-center space-x-4">
                    <span><i class="fas fa-calendar-alt mr-1"></i>${formatDate(content.created_at)}</span>
                    ${content.status === 'scheduled' && publishDate ? 
                        `<span><i class="fas fa-clock mr-1"></i>예약: ${publishDate}</span>` : ''}
                    ${content.priority && content.priority !== 'normal' ? 
                        `<span class="px-2 py-1 rounded ${getPriorityClass(content.priority)}">${getPriorityName(content.priority)}</span>` : ''}
                </div>
                <div class="flex items-center space-x-2">
                    ${content.tags ? content.tags.split(',').slice(0, 3).map(tag => 
                        `<span class="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">${tag.trim()}</span>`
                    ).join('') : ''}
                </div>
            </div>
        </div>
    `;
}

// 페이지네이션 렌더링
function renderPagination() {
    const totalPages = Math.ceil(filteredContent.length / contentPerPage);
    const pagination = document.getElementById('pagination');
    
    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }
    
    let paginationHTML = '';
    
    // 이전 버튼
    if (currentPage > 1) {
        paginationHTML += `
            <button onclick="changePage(${currentPage - 1})" class="px-4 py-2 border border-gray-300 rounded-l-lg hover:bg-gray-50">
                <i class="fas fa-chevron-left"></i>
            </button>
        `;
    }
    
    // 페이지 번호
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);
    
    if (startPage > 1) {
        paginationHTML += `<button onclick="changePage(1)" class="px-4 py-2 border-t border-b border-gray-300 hover:bg-gray-50">1</button>`;
        if (startPage > 2) {
            paginationHTML += `<span class="px-4 py-2 border-t border-b border-gray-300">...</span>`;
        }
    }
    
    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `
            <button onclick="changePage(${i})" class="px-4 py-2 border-t border-b border-gray-300 hover:bg-gray-50 ${i === currentPage ? 'bg-green-50 text-green-600 border-green-300' : ''}">
                ${i}
            </button>
        `;
    }
    
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            paginationHTML += `<span class="px-4 py-2 border-t border-b border-gray-300">...</span>`;
        }
        paginationHTML += `<button onclick="changePage(${totalPages})" class="px-4 py-2 border-t border-b border-gray-300 hover:bg-gray-50">${totalPages}</button>`;
    }
    
    // 다음 버튼
    if (currentPage < totalPages) {
        paginationHTML += `
            <button onclick="changePage(${currentPage + 1})" class="px-4 py-2 border border-gray-300 rounded-r-lg hover:bg-gray-50">
                <i class="fas fa-chevron-right"></i>
            </button>
        `;
    }
    
    pagination.innerHTML = `<div class="flex items-center">${paginationHTML}</div>`;
}

// 유틸리티 함수들
function formatDate(date) {
    if (!date) return '';
    if (typeof date === 'string') date = new Date(date);
    return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function getPriorityClass(priority) {
    const classes = {
        low: 'bg-green-100 text-green-800',
        normal: 'bg-blue-100 text-blue-800',
        high: 'bg-orange-100 text-orange-800',
        urgent: 'bg-red-100 text-red-800'
    };
    return classes[priority] || classes.normal;
}

function getPriorityName(priority) {
    const names = {
        low: '낮음',
        normal: '보통',
        high: '높음',
        urgent: '긴급'
    };
    return names[priority] || priority;
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 전역 함수들 (HTML에서 호출)
window.handleSearch = function() {
    applyFilters();
};

window.refreshContent = async function() {
    await loadContentData();
};

window.createNewContent = function() {
    openContentModal();
};

window.toggleSelectAll = function() {
    const selectAll = document.getElementById('selectAll');
    const pageContent = filteredContent.slice((currentPage - 1) * contentPerPage, currentPage * contentPerPage);
    
    if (selectAll.checked) {
        pageContent.forEach(content => selectedContent.add(content.id));
    } else {
        pageContent.forEach(content => selectedContent.delete(content.id));
    }
    
    renderContent();
};

window.toggleContentSelection = function(contentId) {
    if (selectedContent.has(contentId)) {
        selectedContent.delete(contentId);
    } else {
        selectedContent.add(contentId);
    }
    updateSelectionUI();
};

window.clearSelection = function() {
    selectedContent.clear();
    renderContent();
};

window.changePage = function(page) {
    currentPage = page;
    renderContent();
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.viewContent = function(contentId) {
    const content = allContent.find(c => c.id === contentId);
    if (content) {
        openContentViewModal(content);
    }
};

window.editContent = function(contentId) {
    const content = allContent.find(c => c.id === contentId);
    if (content) {
        openContentModal(content);
    }
};

window.editContentFromView = function() {
    if (currentEditingId) {
        closeContentViewModal();
        editContent(currentEditingId);
    }
};

window.duplicateContent = async function(contentId) {
    const content = allContent.find(c => c.id === contentId);
    if (content) {
        try {
            const duplicatedContent = {
                ...content,
                title: `${content.title} (복사본)`,
                status: 'draft',
                created_at: new Date(),
                updated_at: new Date(),
                publish_date: null
            };
            
            delete duplicatedContent.id;
            
            const newRef = doc(collection(db, 'content'));
            await setDoc(newRef, duplicatedContent);
            
            showSuccess('콘텐츠가 복제되었습니다.');
            await loadContentData();
        } catch (error) {
            console.error('콘텐츠 복제 실패:', error);
            showError('콘텐츠 복제에 실패했습니다.');
        }
    }
};

window.toggleStatusMenu = function(contentId) {
    // 모든 메뉴 숨기기
    document.querySelectorAll('[id^="statusMenu-"]').forEach(menu => {
        menu.classList.add('hidden');
    });
    
    // 해당 메뉴 토글
    const menu = document.getElementById(`statusMenu-${contentId}`);
    if (menu) {
        menu.classList.toggle('hidden');
    }
    
    // 외부 클릭 시 메뉴 닫기
    setTimeout(() => {
        document.addEventListener('click', function closeMenu(e) {
            if (!e.target.closest('[id^="statusMenu-"]') && !e.target.closest('button[onclick^="toggleStatusMenu"]')) {
                document.querySelectorAll('[id^="statusMenu-"]').forEach(menu => {
                    menu.classList.add('hidden');
                });
                document.removeEventListener('click', closeMenu);
            }
        });
    }, 100);
};

window.changeStatus = async function(contentId, newStatus) {
    try {
        const contentRef = doc(db, 'content', contentId);
        await updateDoc(contentRef, {
            status: newStatus,
            updated_at: serverTimestamp()
        });
        
        showSuccess('상태가 변경되었습니다.');
        await loadContentData();
    } catch (error) {
        console.error('상태 변경 실패:', error);
        showError('상태 변경에 실패했습니다.');
    }
};

window.deleteContent = async function(contentId) {
    if (!confirm('이 콘텐츠를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
        return;
    }
    
    try {
        await deleteDoc(doc(db, 'content', contentId));
        showSuccess('콘텐츠가 삭제되었습니다.');
        await loadContentData();
    } catch (error) {
        console.error('콘텐츠 삭제 실패:', error);
        showError('콘텐츠 삭제에 실패했습니다.');
    }
};

// 대량 작업 함수들
window.bulkPublish = async function() {
    if (selectedContent.size === 0) return;
    
    if (!confirm(`선택된 ${selectedContent.size}개의 콘텐츠를 게시하시겠습니까?`)) {
        return;
    }
    
    try {
        const promises = Array.from(selectedContent).map(contentId => 
            updateDoc(doc(db, 'content', contentId), {
                status: 'published',
                updated_at: serverTimestamp()
            })
        );
        
        await Promise.all(promises);
        selectedContent.clear();
        showSuccess('선택된 콘텐츠가 게시되었습니다.');
        await loadContentData();
    } catch (error) {
        console.error('대량 게시 실패:', error);
        showError('일부 콘텐츠 게시에 실패했습니다.');
    }
};

window.bulkUnpublish = async function() {
    if (selectedContent.size === 0) return;
    
    if (!confirm(`선택된 ${selectedContent.size}개의 콘텐츠를 비게시하시겠습니까?`)) {
        return;
    }
    
    try {
        const promises = Array.from(selectedContent).map(contentId => 
            updateDoc(doc(db, 'content', contentId), {
                status: 'draft',
                updated_at: serverTimestamp()
            })
        );
        
        await Promise.all(promises);
        selectedContent.clear();
        showSuccess('선택된 콘텐츠가 비게시되었습니다.');
        await loadContentData();
    } catch (error) {
        console.error('대량 비게시 실패:', error);
        showError('일부 콘텐츠 비게시에 실패했습니다.');
    }
};

window.bulkArchive = async function() {
    if (selectedContent.size === 0) return;
    
    if (!confirm(`선택된 ${selectedContent.size}개의 콘텐츠를 보관하시겠습니까?`)) {
        return;
    }
    
    try {
        const promises = Array.from(selectedContent).map(contentId => 
            updateDoc(doc(db, 'content', contentId), {
                status: 'archived',
                updated_at: serverTimestamp()
            })
        );
        
        await Promise.all(promises);
        selectedContent.clear();
        showSuccess('선택된 콘텐츠가 보관되었습니다.');
        await loadContentData();
    } catch (error) {
        console.error('대량 보관 실패:', error);
        showError('일부 콘텐츠 보관에 실패했습니다.');
    }
};

window.bulkDelete = async function() {
    if (selectedContent.size === 0) return;
    
    if (!confirm(`선택된 ${selectedContent.size}개의 콘텐츠를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) {
        return;
    }
    
    try {
        const promises = Array.from(selectedContent).map(contentId => 
            deleteDoc(doc(db, 'content', contentId))
        );
        
        await Promise.all(promises);
        selectedContent.clear();
        showSuccess('선택된 콘텐츠가 삭제되었습니다.');
        await loadContentData();
    } catch (error) {
        console.error('대량 삭제 실패:', error);
        showError('일부 콘텐츠 삭제에 실패했습니다.');
    }
};

// 모달 관리
function openContentModal(content = null) {
    const modal = document.getElementById('contentModal');
    const title = document.getElementById('modalTitle');
    
    isEditMode = !!content;
    currentEditingId = content?.id || null;
    
    title.textContent = isEditMode ? '콘텐츠 편집' : '새 콘텐츠';
    
    if (isEditMode) {
        // 편집 모드: 기존 데이터 로드
        document.getElementById('contentId').value = content.id;
        document.getElementById('contentType').value = content.type || '';
        document.getElementById('contentStatus').value = content.status || 'draft';
        document.getElementById('contentTitle').value = content.title || '';
        document.getElementById('contentSummary').value = content.summary || '';
        document.getElementById('contentPriority').value = content.priority || 'normal';
        document.getElementById('contentTags').value = content.tags || '';
        document.getElementById('contentFeatured').checked = content.featured || false;
        
        if (content.publish_date) {
            const publishDate = new Date(content.publish_date);
            publishDate.setMinutes(publishDate.getMinutes() - publishDate.getTimezoneOffset());
            document.getElementById('publishDate').value = publishDate.toISOString().slice(0, 16);
        }
        
        if (quillEditor && content.content) {
            quillEditor.root.innerHTML = content.content;
        }
    } else {
        // 새 콘텐츠 모드: 폼 초기화
        document.getElementById('contentForm').reset();
        if (quillEditor) {
            quillEditor.setContents([]);
        }
    }
    
    togglePublishDateField();
    modal.classList.remove('hidden');
}

window.closeContentModal = function() {
    document.getElementById('contentModal').classList.add('hidden');
    isEditMode = false;
    currentEditingId = null;
};

function openContentViewModal(content) {
    const modal = document.getElementById('contentViewModal');
    const title = document.getElementById('viewModalTitle');
    const details = document.getElementById('contentViewDetails');
    
    currentEditingId = content.id;
    title.textContent = content.title || '콘텐츠 상세';
    
    const typeName = {
        notice: '공지사항',
        help: '도움말',
        banner: '배너',
        announcement: '알림',
        tutorial: '튜토리얼'
    }[content.type] || content.type;
    
    const statusName = {
        published: '게시됨',
        draft: '초안',
        scheduled: '예약됨',
        archived: '보관됨'
    }[content.status] || content.status;
    
    details.innerHTML = `
        <div class="space-y-6">
            <div class="flex flex-wrap gap-2 mb-4">
                <span class="content-type-badge type-${content.type}">${typeName}</span>
                <span class="status-badge status-${content.status}">${statusName}</span>
                ${content.featured ? '<span class="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full"><i class="fas fa-star mr-1"></i>주요 콘텐츠</span>' : ''}
                ${content.priority && content.priority !== 'normal' ? 
                    `<span class="px-3 py-1 rounded-full text-sm font-medium ${getPriorityClass(content.priority)}">${getPriorityName(content.priority)}</span>` : ''}
            </div>
            
            ${content.summary ? `
                <div class="bg-gray-50 rounded-lg p-4">
                    <h4 class="font-medium text-gray-900 mb-2">요약</h4>
                    <p class="text-gray-700">${content.summary}</p>
                </div>
            ` : ''}
            
            <div>
                <h4 class="font-medium text-gray-900 mb-3">내용</h4>
                <div class="prose max-w-none">
                    ${content.content || '내용이 없습니다.'}
                </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                <div>
                    <h4 class="font-medium text-gray-700 mb-2">생성 정보</h4>
                    <p class="text-sm text-gray-600">생성일: ${formatDate(content.created_at)}</p>
                    <p class="text-sm text-gray-600">수정일: ${formatDate(content.updated_at)}</p>
                    ${content.status === 'scheduled' && content.publish_date ? 
                        `<p class="text-sm text-gray-600">예약일: ${formatDate(content.publish_date)}</p>` : ''}
                </div>
                
                ${content.tags ? `
                    <div>
                        <h4 class="font-medium text-gray-700 mb-2">태그</h4>
                        <div class="flex flex-wrap gap-1">
                            ${content.tags.split(',').map(tag => 
                                `<span class="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">${tag.trim()}</span>`
                            ).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
    
    modal.classList.remove('hidden');
}

window.closeContentViewModal = function() {
    document.getElementById('contentViewModal').classList.add('hidden');
    currentEditingId = null;
};

// 폼 처리
function togglePublishDateField() {
    const status = document.getElementById('contentStatus').value;
    const publishDateSection = document.getElementById('publishDateSection');
    
    if (status === 'scheduled') {
        publishDateSection.classList.remove('hidden');
    } else {
        publishDateSection.classList.add('hidden');
    }
}

function handleFormSubmit(e) {
    e.preventDefault();
    saveContent();
}

async function saveContent() {
    try {
        const formData = {
            type: document.getElementById('contentType').value,
            status: document.getElementById('contentStatus').value,
            title: document.getElementById('contentTitle').value,
            summary: document.getElementById('contentSummary').value,
            content: quillEditor ? quillEditor.root.innerHTML : '',
            priority: document.getElementById('contentPriority').value,
            tags: document.getElementById('contentTags').value,
            featured: document.getElementById('contentFeatured').checked
        };
        
        // 유효성 검사
        if (!formData.type || !formData.title || !formData.content) {
            showError('필수 필드를 모두 입력해주세요.');
            return;
        }
        
        // 예약 게시 날짜
        if (formData.status === 'scheduled') {
            const publishDate = document.getElementById('publishDate').value;
            if (publishDate) {
                formData.publish_date = new Date(publishDate);
            }
        }
        
        if (isEditMode && currentEditingId) {
            // 수정
            const contentRef = doc(db, 'content', currentEditingId);
            await updateDoc(contentRef, {
                ...formData,
                updated_at: serverTimestamp()
            });
            showSuccess('콘텐츠가 수정되었습니다.');
        } else {
            // 새 콘텐츠 생성
            const contentRef = doc(collection(db, 'content'));
            await setDoc(contentRef, {
                ...formData,
                created_at: serverTimestamp(),
                updated_at: serverTimestamp(),
                author: auth.currentUser?.email || 'anonymous'
            });
            showSuccess('콘텐츠가 생성되었습니다.');
        }
        
        closeContentModal();
        await loadContentData();
        
    } catch (error) {
        console.error('콘텐츠 저장 실패:', error);
        showError('콘텐츠 저장에 실패했습니다.');
    }
}

// UI 상태 관리
function updateSelectionUI() {
    const selectedCount = selectedContent.size;
    const bulkActions = document.getElementById('bulkActions');
    const selectedCountElement = document.getElementById('selectedCount');
    const selectAllCheckbox = document.getElementById('selectAll');
    
    if (selectedCount > 0) {
        bulkActions.classList.remove('hidden');
        selectedCountElement.textContent = `${selectedCount}개 선택됨`;
    } else {
        bulkActions.classList.add('hidden');
    }
    
    // 전체 선택 체크박스 상태 업데이트
    const pageContent = filteredContent.slice((currentPage - 1) * contentPerPage, currentPage * contentPerPage);
    const selectedOnPage = pageContent.filter(content => selectedContent.has(content.id)).length;
    
    if (selectedOnPage === 0) {
        selectAllCheckbox.indeterminate = false;
        selectAllCheckbox.checked = false;
    } else if (selectedOnPage === pageContent.length) {
        selectAllCheckbox.indeterminate = false;
        selectAllCheckbox.checked = true;
    } else {
        selectAllCheckbox.indeterminate = true;
    }
}

function showLoading() {
    document.getElementById('loadingContent').classList.remove('hidden');
    document.getElementById('contentGrid').classList.add('hidden');
    document.getElementById('emptyState').classList.add('hidden');
}

function hideLoading() {
    document.getElementById('loadingContent').classList.add('hidden');
}

function showSuccess(message) {
    // 간단한 토스트 알림 (실제 구현에서는 더 정교한 알림 시스템 사용)
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

console.log('📰 admin-content.js 로드 완료');