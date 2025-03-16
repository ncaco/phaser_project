// 씬 모듈 가져오기
try {
    const BootScene = require('./scenes/BootScene').BootScene;
    const PreloadScene = require('./scenes/PreloadScene').PreloadScene;
    const MainMenuScene = require('./scenes/MainMenuScene').MainMenuScene;
    const GameScene = require('./scenes/GameScene').GameScene;
    const UIScene = require('./scenes/UIScene').UIScene;

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
        isMobile: isMobile(),
        defaultWidth: 800,
        defaultHeight: 600,
        minWidth: 320,
        minHeight: 240,
        maxWidth: 1920,
        maxHeight: 1080,
        aspectRatio: 4/3,
        uiScale: 1.2,
        fontSizeBase: 16,
        debug: false
    };
    
    console.log(`디바이스 타입: ${window.gameSettings.isMobile ? '모바일' : '데스크톱'}`);
    if (typeof window.debugLog === 'function') {
        window.debugLog(`디바이스 타입: ${window.gameSettings.isMobile ? '모바일' : '데스크톱'}`);
    }

    // 화면 크기 계산 함수
    const calculateGameSize = () => {
        // 윈도우 크기
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        
        // 게임 컨테이너 크기
        const containerWidth = gameContainer.clientWidth;
        const containerHeight = gameContainer.clientHeight;
        
        // 최소 너비 설정
        const minWidth = window.gameSettings.minWidth;
        
        // 사용 가능한 최대 크기
        const width = Math.max(minWidth, containerWidth);
        const height = containerHeight;
        
        // UI 스케일 계산 (기본 해상도 대비)
        window.gameSettings.uiScale = Math.min(
            width / window.gameSettings.defaultWidth,
            height / window.gameSettings.defaultHeight
        );
        
        // 모바일 환경에서는 UI 요소를 더 크게 표시
        if (window.gameSettings.isMobile) {
            window.gameSettings.uiScale *= 1.2;
            window.gameSettings.fontSizeBase = 20;
        } else {
            window.gameSettings.fontSizeBase = 16;
        }
        
        console.log(`계산된 게임 크기: ${width}x${height}, UI 스케일: ${window.gameSettings.uiScale}`);
        if (typeof window.debugLog === 'function') {
            window.debugLog(`계산된 게임 크기: ${width}x${height}, UI 스케일: ${window.gameSettings.uiScale}`);
        }
        
        return {
            width: width,
            height: height
        };
    };
    
    // 초기 게임 크기 계산
    const gameSize = calculateGameSize();
    console.log(`계산된 게임 크기: ${gameSize.width}x${gameSize.height}, UI 스케일: ${window.gameSettings.uiScale}`);
    
    // Phaser 게임 설정
    const config = {
        type: Phaser.AUTO,
        parent: 'game-container',
        width: gameSize.width,
        height: gameSize.height,
        scale: {
            mode: Phaser.Scale.RESIZE,
            autoCenter: Phaser.Scale.CENTER_BOTH,
            width: gameSize.width,
            height: gameSize.height
        },
        physics: {
            default: 'arcade',
            arcade: {
                gravity: { y: 0 },
                debug: window.gameSettings.debug
            }
        },
        scene: [BootScene, PreloadScene, MainMenuScene, GameScene, UIScene],
        render: {
            pixelArt: false,
            antialias: true
        },
        input: {
            activePointers: 3,
            touch: {
                capture: true,
                target: gameContainer
            }
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
    
    // 창 크기 변경 이벤트 핸들러
    window.addEventListener('resize', () => {
        if (game) {
            const newSize = calculateGameSize();
            game.scale.resize(newSize.width, newSize.height);
            console.log(`화면 크기 변경: ${newSize.width}x${newSize.height}`);
            if (typeof window.debugLog === 'function') {
                window.debugLog(`화면 크기 변경: ${newSize.width}x${newSize.height}`);
            }
            
            // 현재 활성화된 씬에 resize 이벤트 전달
            const activeScene = game.scene.scenes.find(scene => scene.scene.settings.active);
            if (activeScene && typeof activeScene.handleResize === 'function') {
                activeScene.handleResize({
                    width: newSize.width,
                    height: newSize.height
                });
            }
        }
    });
    
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
    window.getScaledValue = (value) => {
        return value * window.gameSettings.uiScale;
    };
    
    window.getScaledFontSize = (size = window.gameSettings.fontSizeBase) => {
        return Math.floor(size * window.gameSettings.uiScale);
    };
    
    window.getResponsivePosition = (x, y, width, height, align = 'center', valign = 'middle') => {
        const gameWidth = game.scale.width;
        const gameHeight = game.scale.height;
        
        let posX, posY;
        
        // 수평 정렬
        switch (align) {
            case 'left':
                posX = x;
                break;
            case 'right':
                posX = gameWidth - x;
                break;
            case 'center':
            default:
                posX = gameWidth / 2;
                break;
        }
        
        // 수직 정렬
        switch (valign) {
            case 'top':
                posY = y;
                break;
            case 'bottom':
                posY = gameHeight - y;
                break;
            case 'middle':
            default:
                posY = gameHeight / 2;
                break;
        }
        
        return { x: posX, y: posY };
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