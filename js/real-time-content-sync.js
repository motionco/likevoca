// real-time-content-sync.js - 실시간 콘텐츠 동기화 시스템
export class RealTimeContentSync {
    constructor() {
        this.syncInterval = null;
        this.lastSyncTime = null;
        this.contentHash = new Map();
        this.callbacks = new Map();
        this.syncIntervalMs = 30000; // 30초마다 동기화
        this.isEnabled = false;
    }

    // 실시간 동기화 시작
    startSync() {
        if (this.syncInterval) {
            return; // 이미 실행 중
        }

        console.log('🔄 실시간 콘텐츠 동기화 시작');
        this.isEnabled = true;
        this.lastSyncTime = Date.now();
        
        // 초기 동기화
        this.performSync();
        
        // 주기적 동기화
        this.syncInterval = setInterval(() => {
            this.performSync();
        }, this.syncIntervalMs);

        // 페이지 가시성 변경 이벤트 리스너
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && this.isEnabled) {
                // 페이지가 다시 포커스될 때 즉시 동기화
                this.performSync();
            }
        });

        // 윈도우 포커스 이벤트
        window.addEventListener('focus', () => {
            if (this.isEnabled) {
                this.performSync();
            }
        });
    }

    // 실시간 동기화 중지
    stopSync() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
            this.isEnabled = false;
            console.log('⏹️ 실시간 콘텐츠 동기화 중지');
        }
    }

    // 콘텐츠 변경 감지 콜백 등록
    onContentChange(contentType, callback) {
        if (!this.callbacks.has(contentType)) {
            this.callbacks.set(contentType, []);
        }
        this.callbacks.get(contentType).push(callback);
    }

    // 동기화 실행
    async performSync() {
        try {
            console.log('🔍 콘텐츠 변경 확인 중...');
            
            const localContent = localStorage.getItem('multilingual_content');
            if (!localContent) {
                return;
            }

            const currentContent = JSON.parse(localContent);
            const hasChanges = this.detectChanges(currentContent);

            if (hasChanges) {
                console.log('✨ 콘텐츠 변경 감지됨 - 페이지 업데이트 시작');
                await this.notifyContentChanges(currentContent);
                this.updateContentHash(currentContent);
                this.showUpdateNotification();
            }

        } catch (error) {
            console.error('❌ 콘텐츠 동기화 실패:', error);
        }
    }

    // 콘텐츠 변경 감지
    detectChanges(currentContent) {
        const currentHash = this.generateContentHash(currentContent);
        const lastHash = this.contentHash.get('multilingual_content');
        
        if (!lastHash) {
            // 첫 실행 - 해시만 저장하고 변경없음으로 처리
            this.contentHash.set('multilingual_content', currentHash);
            return false;
        }

        return currentHash !== lastHash;
    }

    // 콘텐츠 해시 생성
    generateContentHash(content) {
        const sortedContent = content.sort((a, b) => a.id.localeCompare(b.id));
        const hashString = JSON.stringify(sortedContent.map(item => ({
            id: item.id,
            type: item.type,
            updatedAt: item.updatedAt,
            versionsCount: Object.keys(item.versions || {}).length
        })));
        
        // 간단한 해시 함수
        let hash = 0;
        for (let i = 0; i < hashString.length; i++) {
            const char = hashString.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // 32비트 정수로 변환
        }
        
        return hash.toString();
    }

    // 콘텐츠 해시 업데이트
    updateContentHash(content) {
        const hash = this.generateContentHash(content);
        this.contentHash.set('multilingual_content', hash);
        this.lastSyncTime = Date.now();
    }

    // 콘텐츠 변경 알림
    async notifyContentChanges(currentContent) {
        // 타입별로 콘텐츠 분류
        const contentByType = this.groupContentByType(currentContent);
        
        // 각 타입별로 등록된 콜백 실행
        for (const [contentType, contents] of contentByType.entries()) {
            const callbacks = this.callbacks.get(contentType) || [];
            
            for (const callback of callbacks) {
                try {
                    await callback(contents, contentType);
                } catch (error) {
                    console.error(`❌ ${contentType} 콘텐츠 콜백 실행 실패:`, error);
                }
            }
        }

        // 전체 콘텐츠 변경 콜백 실행
        const globalCallbacks = this.callbacks.get('*') || [];
        for (const callback of globalCallbacks) {
            try {
                await callback(currentContent, '*');
            } catch (error) {
                console.error('❌ 전체 콘텐츠 콜백 실행 실패:', error);
            }
        }
    }

    // 타입별 콘텐츠 그룹화
    groupContentByType(content) {
        const grouped = new Map();
        
        content.forEach(item => {
            if (!grouped.has(item.type)) {
                grouped.set(item.type, []);
            }
            grouped.get(item.type).push(item);
        });
        
        return grouped;
    }

    // 업데이트 알림 표시
    showUpdateNotification() {
        // 기존 알림 제거
        const existingNotification = document.getElementById('content-update-notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        // 새 알림 생성
        const notification = document.createElement('div');
        notification.id = 'content-update-notification';
        notification.className = 'fixed top-4 right-4 bg-blue-600 text-white px-6 py-4 rounded-lg shadow-lg z-50 transform transition-all duration-300 opacity-0 translate-x-full';
        notification.innerHTML = `
            <div class="flex items-center space-x-3">
                <i class="fas fa-sync-alt text-lg"></i>
                <div>
                    <div class="font-semibold">콘텐츠가 업데이트되었습니다!</div>
                    <div class="text-sm opacity-90">새로운 내용을 확인해보세요</div>
                </div>
                <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-white hover:text-gray-200">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        document.body.appendChild(notification);

        // 애니메이션으로 표시
        setTimeout(() => {
            notification.classList.remove('opacity-0', 'translate-x-full');
        }, 100);

        // 5초 후 자동 제거
        setTimeout(() => {
            if (notification.parentElement) {
                notification.classList.add('opacity-0', 'translate-x-full');
                setTimeout(() => {
                    notification.remove();
                }, 300);
            }
        }, 5000);
    }

    // 특정 페이지의 콘텐츠 새로고침
    async refreshPageContent(pageType) {
        try {
            const { ContentIntegration } = await import('./content-integration.js');
            const contentIntegration = new ContentIntegration();
            
            const container = document.getElementById('dynamic-content-container');
            if (container) {
                // 새로고침 표시
                const originalContent = container.innerHTML;
                container.innerHTML = `
                    <div class="text-center py-8">
                        <i class="fas fa-spinner fa-spin text-2xl text-blue-600 mb-3"></i>
                        <p class="text-gray-600">콘텐츠를 업데이트하는 중...</p>
                    </div>
                `;
                
                // 콘텐츠 로드
                await contentIntegration.initializePage(pageType);
                
                console.log(`✅ ${pageType} 페이지 콘텐츠 새로고침 완료`);
            }
            
        } catch (error) {
            console.error(`❌ ${pageType} 페이지 새로고침 실패:`, error);
        }
    }

    // 수동 새로고침 트리거
    async triggerManualRefresh() {
        console.log('🔄 수동 콘텐츠 새로고침 실행');
        await this.performSync();
    }

    // 디버그 정보
    getDebugInfo() {
        return {
            isEnabled: this.isEnabled,
            lastSyncTime: this.lastSyncTime ? new Date(this.lastSyncTime).toLocaleString() : null,
            syncInterval: this.syncIntervalMs,
            registeredCallbacks: Array.from(this.callbacks.keys()),
            contentHashes: Array.from(this.contentHash.entries())
        };
    }
}

// 페이지별 자동 동기화 설정
export function initializePageSync(pageType) {
    const syncManager = new RealTimeContentSync();
    
    // 페이지 타입별 콜백 등록
    syncManager.onContentChange(pageType, async (contents, type) => {
        console.log(`📄 ${type} 페이지 콘텐츠 업데이트 감지`);
        await syncManager.refreshPageContent(type);
    });
    
    // 전체 콘텐츠 변경 감지
    syncManager.onContentChange('*', async (contents, type) => {
        console.log('🌐 전체 콘텐츠 변경 감지');
        // 현재 페이지와 관련된 콘텐츠만 업데이트
        const relevantContent = contents.filter(item => item.type === pageType);
        if (relevantContent.length > 0) {
            await syncManager.refreshPageContent(pageType);
        }
    });
    
    // 동기화 시작
    syncManager.startSync();
    
    // 페이지 언로드 시 정리
    window.addEventListener('beforeunload', () => {
        syncManager.stopSync();
    });
    
    // 전역 접근을 위해 윈도우에 할당
    window.contentSyncManager = syncManager;
    
    return syncManager;
}

// 수동 새로고침 버튼 추가
export function addManualRefreshButton() {
    const button = document.createElement('button');
    button.id = 'manual-refresh-btn';
    button.className = 'fixed bottom-4 right-4 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition duration-200 z-40';
    button.innerHTML = '<i class="fas fa-sync-alt"></i>';
    button.title = '콘텐츠 새로고침';
    button.onclick = () => {
        if (window.contentSyncManager) {
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            window.contentSyncManager.triggerManualRefresh().then(() => {
                button.innerHTML = '<i class="fas fa-sync-alt"></i>';
            });
        }
    };
    
    document.body.appendChild(button);
}

console.log('🔄 real-time-content-sync.js 로드 완료');