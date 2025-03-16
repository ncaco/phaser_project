// 씬 모듈 가져오기
try {
    const { BootScene } = require('./scenes/BootScene');
    const { PreloadScene } = require('./scenes/PreloadScene');
    const { MainMenuScene } = require('./scenes/MainMenuScene');
    const { GameScene } = require('./scenes/GameScene');
    const { UIScene } = require('./scenes/UIScene');

    // 게임 컨테이너 확인
    const gameContainer = document.getElementById('game-container');
    if (!gameContainer) {
        console.error('게임 컨테이너를 찾을 수 없습니다.');
        if (typeof window.debugLog === 'function') {
            window.debugLog('오류: 게임 컨테이너를 찾을 수 없습니다.');
        }
        
        // 오류 메시지 표시
        const errorElement = document.getElementById('error-message');
        if (errorElement) {
            errorElement.textContent = '게임 컨테이너를 찾을 수 없습니다.';
            errorElement.style.display = 'block';
        }
        throw new Error('게임 컨테이너를 찾을 수 없습니다.');
    }

    // Phaser 라이브러리 확인
    if (typeof Phaser === 'undefined') {
        console.error('Phaser 라이브러리가 로드되지 않았습니다.');
        if (typeof window.debugLog === 'function') {
            window.debugLog('오류: Phaser 라이브러리가 로드되지 않았습니다.');
        }
        
        // 오류 메시지 표시
        const errorElement = document.getElementById('error-message');
        if (errorElement) {
            errorElement.textContent = 'Phaser 라이브러리가 로드되지 않았습니다.';
            errorElement.style.display = 'block';
        }
        throw new Error('Phaser 라이브러리가 로드되지 않았습니다.');
    }

    // 디바이스 타입 감지
    const isMobile = () => {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
               (window.innerWidth <= 800 && window.innerHeight <= 600);
    };
    
    // 전역 설정
    window.gameSettings = {
        isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
        defaultWidth: 800,
        defaultHeight: 600,
        minWidth: 400,
        minHeight: 300,
        maxWidth: 1600,
        maxHeight: 1200,
        aspectRatio: 16/9,
        get uiScale() {
            // 화면 크기에 따른 UI 스케일 계산
            const scaleX = window.innerWidth / this.defaultWidth;
            const scaleY = window.innerHeight / this.defaultHeight;
            let scale = Math.min(scaleX, scaleY);
            
            // 모바일 환경에서는 UI 요소를 더 크게 표시
            if (this.isMobile) {
                scale = Math.max(scale, 0.8); // 최소 스케일 보장
                return scale * 1.2; // 모바일에서는 20% 더 크게 (30%에서 20%로 조정)
            }
            
            return scale;
        },
        get fontSizeBase() {
            // 기본 폰트 크기 계산
            return this.isMobile ? 16 : 14; // 모바일에서는 기본 폰트 크기를 더 크게 (조정됨)
        },
        debug: false
    };
    
    console.log(`디바이스 타입: ${window.gameSettings.isMobile ? '모바일' : '데스크톱'}`);
    if (typeof window.debugLog === 'function') {
        window.debugLog(`디바이스 타입: ${window.gameSettings.isMobile ? '모바일' : '데스크톱'}`);
    }

    // 화면 크기 계산 함수
    const calculateGameSize = () => {
        // 기본 게임 비율
        const gameRatio = window.gameSettings.aspectRatio;
        
        // 윈도우 크기
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        
        // 게임 컨테이너 크기 (패딩 등 고려)
        const containerWidth = gameContainer.clientWidth;
        const containerHeight = gameContainer.clientHeight || windowHeight;
        
        // 사용 가능한 최대 크기
        const maxWidth = Math.min(windowWidth, containerWidth, window.gameSettings.maxWidth);
        const maxHeight = Math.min(windowHeight, containerHeight, window.gameSettings.maxHeight);
        
        // 화면 비율
        const screenRatio = maxWidth / maxHeight;
        
        let width, height;
        
        if (screenRatio > gameRatio) {
            // 화면이 게임보다 더 넓은 경우 (높이에 맞춤)
            height = maxHeight;
            width = height * gameRatio;
        } else {
            // 화면이 게임보다 더 좁은 경우 (너비에 맞춤)
            width = maxWidth;
            height = width / gameRatio;
        }
        
        // 최소 크기 제한
        width = Math.max(width, window.gameSettings.minWidth);
        height = Math.max(height, window.gameSettings.minHeight);
        
        // 정수로 반올림
        return {
            width: Math.floor(width),
            height: Math.floor(height)
        };
    };
    
    // 초기 게임 크기 계산
    const gameSize = calculateGameSize();
    console.log(`계산된 게임 크기: ${gameSize.width}x${gameSize.height}, UI 스케일: ${window.gameSettings.uiScale}`);
    
    // 게임 설정
    const config = {
        type: Phaser.AUTO,
        width: gameSize.width,
        height: gameSize.height,
        parent: 'game-container',
        backgroundColor: '#2c3e50',
        physics: {
            default: 'arcade',
            arcade: {
                gravity: { y: 0 },
                debug: window.gameSettings.debug
            }
        },
        scale: {
            mode: Phaser.Scale.RESIZE,
            autoCenter: Phaser.Scale.CENTER_BOTH,
            width: gameSize.width,
            height: gameSize.height
        },
        scene: [BootScene, PreloadScene, MainMenuScene, GameScene, UIScene],
        input: {
            activePointers: 3, // 멀티 터치 지원
            touch: {
                capture: true,
                target: gameContainer
            }
        },
        render: {
            pixelArt: false,
            antialias: true
        },
        dom: {
            createContainer: true
        }
    };

    // 게임 인스턴스 생성
    console.log('게임 초기화 중...');
    if (typeof window.debugLog === 'function') {
        window.debugLog('게임 초기화 중...');
    }
    
    const game = new Phaser.Game(config);
    
    // 화면 크기 변경 이벤트 처리
    window.addEventListener('resize', () => {
        if (game.isBooted) {
            const newSize = calculateGameSize();
            game.scale.resize(newSize.width, newSize.height);
            console.log(`게임 크기 조정: ${newSize.width}x${newSize.height}, UI 스케일: ${window.gameSettings.uiScale}`);
            if (typeof window.debugLog === 'function') {
                window.debugLog(`게임 크기 조정: ${newSize.width}x${newSize.height}, UI 스케일: ${window.gameSettings.uiScale}`);
            }
            
            // 화면 크기 변경 이벤트 발생
            if (game.events) {
                game.events.emit('resize', newSize.width, newSize.height, window.gameSettings.uiScale);
            }
        }
    }, false);
    
    // 모바일 방향 변경 이벤트 처리
    window.addEventListener('orientationchange', () => {
        // 방향 변경 후 약간의 지연 시간을 두고 크기 조정 (iOS 버그 방지)
        setTimeout(() => {
            if (game.isBooted) {
                const newSize = calculateGameSize();
                game.scale.resize(newSize.width, newSize.height);
                console.log(`방향 변경 감지, 게임 크기 조정: ${newSize.width}x${newSize.height}`);
                if (typeof window.debugLog === 'function') {
                    window.debugLog(`방향 변경 감지, 게임 크기 조정: ${newSize.width}x${newSize.height}`);
                }
                
                // 화면 크기 변경 이벤트 발생
                if (game.events) {
                    game.events.emit('resize', newSize.width, newSize.height, window.gameSettings.uiScale);
                }
            }
        }, 200);
    }, false);
    
    // 전체 화면 전환 함수
    window.toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            gameContainer.requestFullscreen().catch(err => {
                console.error(`전체 화면 전환 오류: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    };
    
    // 전체 화면 변경 이벤트 처리
    document.addEventListener('fullscreenchange', () => {
        if (game.isBooted) {
            const newSize = calculateGameSize();
            game.scale.resize(newSize.width, newSize.height);
            console.log(`전체 화면 상태 변경, 게임 크기 조정: ${newSize.width}x${newSize.height}`);
            
            // 화면 크기 변경 이벤트 발생
            if (game.events) {
                game.events.emit('resize', newSize.width, newSize.height, window.gameSettings.uiScale);
                
                // 현재 활성화된 씬에 resize 이벤트 직접 전달
                const activeScene = game.scene.getScenes(true)[0];
                if (activeScene && typeof activeScene.handleResize === 'function') {
                    activeScene.handleResize({
                        width: newSize.width,
                        height: newSize.height
                    });
                }
            }
        }
    });
    
    console.log('게임 초기화 완료');
    if (typeof window.debugLog === 'function') {
        window.debugLog('게임 초기화 완료');
    }
    
    // 전역 게임 인스턴스 저장
    window.game = game;
    
    // 전역 유틸리티 함수
    window.getScaledValue = function(value) {
        return value * window.gameSettings.uiScale;
    };
    
    window.getScaledFontSize = function(size) {
        return Math.round(size * window.gameSettings.uiScale);
    };
    
    window.getResponsivePosition = function(alignment, offset = 0) {
        const width = game.scale.width;
        const height = game.scale.height;
        
        switch (alignment) {
            case 'left':
                return window.getScaledValue(20 + offset);
            case 'right':
                return width - window.getScaledValue(20 + offset);
            case 'top':
                return window.getScaledValue(20 + offset);
            case 'bottom':
                return height - window.getScaledValue(20 + offset);
            case 'center-x':
                return width / 2 + window.getScaledValue(offset);
            case 'center-y':
                return height / 2 + window.getScaledValue(offset);
            default:
                return 0;
        }
    };
    
    // 디버그 로그 함수
    window.logDebug = function(message) {
        if (window.gameSettings.debug) {
            console.log(`[DEBUG] ${message}`);
        }
        
        // 디버그 패널에 로그 추가
        const debugPanel = document.getElementById('debug-log');
        if (debugPanel) {
            const timestamp = new Date().toLocaleTimeString();
            const logEntry = document.createElement('div');
            logEntry.textContent = `[${timestamp}] ${message}`;
            debugPanel.appendChild(logEntry);
            
            // 로그 항목이 너무 많으면 오래된 항목 제거
            const maxLogEntries = 50;
            while (debugPanel.childElementCount > maxLogEntries) {
                debugPanel.removeChild(debugPanel.firstChild);
            }
            
            // 자동 스크롤
            debugPanel.scrollTop = debugPanel.scrollHeight;
        }
    };
    
} catch (error) {
    console.error('게임 초기화 중 오류 발생:', error);
    if (typeof window.debugLog === 'function') {
        window.debugLog('게임 초기화 오류: ' + error.message);
    }
    
    // 오류 메시지 표시
    const errorElement = document.getElementById('error-message');
    if (errorElement) {
        errorElement.textContent = '게임 초기화 중 오류 발생: ' + error.message;
        errorElement.style.display = 'block';
    }
} 