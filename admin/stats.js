// Firebase 모듈 import (11.2.0 버전으로 통일)
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
let charts = {};

// Firebase 초기화 완료 확인 및 데이터 로드
function initializeStatsBoard() {
    // Firebase가 전역으로 초기화되었는지 확인
    if (window.db) {
        db = window.db;
        console.log('📊 통계 대시보드 Firebase 연결 완료');
        loadStatsData();
    } else {
        // Firebase 초기화를 기다림
        console.log('⏳ Firebase 초기화 대기 중...');
        setTimeout(initializeStatsBoard, 100);
    }
}

// 페이지 로드 후 초기화
window.addEventListener('DOMContentLoaded', initializeStatsBoard);

// 통계 데이터 로드 함수
async function loadStatsData() {
    try {
        showLoading(true);
        
        // 병렬로 모든 데이터 로드
        const [dailyStats, conceptStats] = await Promise.all([
            loadDailyStats(),
            loadConceptStats()
        ]);
        
        // UI 업데이트
        updateStatsCards(dailyStats);
        createCharts(dailyStats);
        
        showLoading(false);
        document.getElementById('chartsContainer').classList.remove('hidden');
        document.getElementById('statsCards').classList.remove('hidden');
        
    } catch (error) {
        console.error('통계 데이터 로드 실패:', error);
        showError();
    }
}

// 일별 통계 데이터 로드
async function loadDailyStats() {
    try {
        const statsRef = collection(db, 'stats');
        const querySnapshot = await getDocs(statsRef);
        
        const dailyStats = [];
        let totalVisitors = 0;
        let totalConceptViews = 0;
        
        querySnapshot.forEach(doc => {
            const data = doc.data();
            if (data.type === 'daily_stats') {
                dailyStats.push({
                    id: doc.id,
                    date: data.date,
                    ...data
                });
                
                totalVisitors += data.visitors || 0;
                totalConceptViews += data.concept_views || 0;
            }
        });
        
        // 날짜순 정렬
        dailyStats.sort((a, b) => a.date.localeCompare(b.date));
        
        return {
            dailyStats,
            totalVisitors,
            totalConceptViews
        };
        
    } catch (error) {
        console.error('일별 통계 로드 실패:', error);
        throw error;
    }
}

// 개념 통계 데이터 로드
async function loadConceptStats() {
    try {
        const conceptStatsRef = collection(db, 'concept_stats');
        const querySnapshot = await getDocs(conceptStatsRef);
        
        let totalLikes = 0;
        let totalViews = 0;
        
        querySnapshot.forEach(doc => {
            const data = doc.data();
            totalLikes += data.like_count || 0;
            totalViews += data.view_count || 0;
        });
        
        return {
            totalLikes,
            totalViews
        };
        
    } catch (error) {
        console.error('개념 통계 로드 실패:', error);
        return { totalLikes: 0, totalViews: 0 };
    }
}

// 통계 카드 업데이트
function updateStatsCards(data) {
    const today = new Date().toISOString().split('T')[0];
    const todayData = data.dailyStats.find(stat => stat.date === today);
    
    document.getElementById('totalVisitors').textContent = data.totalVisitors.toLocaleString();
    document.getElementById('todayVisitors').textContent = (todayData?.visitors || 0).toLocaleString();
    document.getElementById('totalConceptViews').textContent = data.totalConceptViews.toLocaleString();
    
    // 개념 통계는 별도 로드 필요
    loadConceptStats().then(conceptData => {
        document.getElementById('totalLikes').textContent = conceptData.totalLikes.toLocaleString();
    });
}

// 차트 생성
function createCharts(data) {
    const recent7Days = data.dailyStats.slice(-7);
    const today = new Date().toISOString().split('T')[0];
    const todayData = data.dailyStats.find(stat => stat.date === today) || {};
    
    // 1. 일별 방문자 추이
    createDailyVisitorsChart(recent7Days);
    
    // 2. 시스템 언어 사용자
    createUserLanguagesChart(todayData.user_languages || {});
    
    // 3. 디바이스 타입
    createDevicesChart(todayData.devices || {});
    
    // 4. 브라우저 분포
    createBrowsersChart(todayData.browsers || {});
    
    // 5. 유입 경로
    createReferrersChart(todayData.referrers || {});
    
    // 6. 언어 학습 패턴
    createLanguageLearningChart(todayData.language_learning || {});
    
    // 7. 페이지별 조회수
    createPageViewsChart(todayData.page_views || {});
}

// 일별 방문자 차트
function createDailyVisitorsChart(data) {
    const ctx = document.getElementById('dailyVisitorsChart').getContext('2d');
    
    if (charts.dailyVisitors) {
        charts.dailyVisitors.destroy();
    }
    
    charts.dailyVisitors = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.map(d => {
                const date = new Date(d.date);
                return `${date.getMonth() + 1}/${date.getDate()}`;
            }),
            datasets: [{
                label: '방문자 수',
                data: data.map(d => d.visitors || 0),
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

// 파이 차트 생성 헬퍼 함수
function createPieChart(canvasId, data, colors) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    
    if (charts[canvasId]) {
        charts[canvasId].destroy();
    }
    
    const labels = Object.keys(data);
    const values = Object.values(data);
    
    charts[canvasId] = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: colors,
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true
                    }
                }
            }
        }
    });
}

// 막대 차트 생성 헬퍼 함수
function createBarChart(canvasId, data, color) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    
    if (charts[canvasId]) {
        charts[canvasId].destroy();
    }
    
    const labels = Object.keys(data);
    const values = Object.values(data);
    
    charts[canvasId] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: '조회수',
                data: values,
                backgroundColor: color,
                borderColor: color,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

// 개별 차트 생성 함수들
function createUserLanguagesChart(data) {
    const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];
    createPieChart('userLanguagesChart', data, colors);
}

function createDevicesChart(data) {
    const colors = ['#8b5cf6', '#ec4899', '#06b6d4'];
    createPieChart('devicesChart', data, colors);
}

function createBrowsersChart(data) {
    const colors = ['#f97316', '#84cc16', '#06b6d4', '#f59e0b'];
    createPieChart('browsersChart', data, colors);
}

function createReferrersChart(data) {
    const colors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
    createPieChart('referrersChart', data, colors);
}

function createLanguageLearningChart(data) {
    const transformedData = {};
    Object.keys(data).forEach(key => {
        const [source, target] = key.split('_');
        const label = `${getLanguageName(source)} → ${getLanguageName(target)}`;
        transformedData[label] = data[key];
    });
    
    createBarChart('languageLearningChart', transformedData, 'rgba(20, 184, 166, 0.8)');
}

function createPageViewsChart(data) {
    const transformedData = {};
    Object.keys(data).forEach(key => {
        const pageName = getPageName(key);
        transformedData[pageName] = data[key];
    });
    
    createBarChart('pageViewsChart', transformedData, 'rgba(251, 191, 36, 0.8)');
}

// 유틸리티 함수들
function getLanguageName(code) {
    const languages = {
        'ko': '한국어',
        'en': '영어',
        'ja': '일본어',
        'zh': '중국어',
        'es': '스페인어',
        'fr': '프랑스어'
    };
    return languages[code] || code.toUpperCase();
}

function getPageName(path) {
    const pages = {
        '/vocabulary': '단어장',
        '/my-word-list': '내 단어장',
        '/login': '로그인',
        '/register': '회원가입',
        '/profile': '프로필'
    };
    return pages[path] || path;
}

// UI 헬퍼 함수들
function showLoading(show) {
    const loadingEl = document.getElementById('loading');
    const errorEl = document.getElementById('errorMessage');
    
    if (show) {
        loadingEl.classList.remove('hidden');
        errorEl.classList.add('hidden');
    } else {
        loadingEl.classList.add('hidden');
    }
}

function showError() {
    document.getElementById('loading').classList.add('hidden');
    document.getElementById('errorMessage').classList.remove('hidden');
}

// 데이터 새로고침
async function refreshData() {
    // 모든 기존 차트 파괴
    Object.values(charts).forEach(chart => {
        if (chart) chart.destroy();
    });
    charts = {};
    
    // 컨테이너 숨기기
    document.getElementById('chartsContainer').classList.add('hidden');
    document.getElementById('statsCards').classList.add('hidden');
    
    // 데이터 다시 로드
    await loadStatsData();
}

// 전역 함수로 노출
window.refreshData = refreshData;