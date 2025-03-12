// 씬 모듈 가져오기
try {
    const { BootScene } = require('./scenes/BootScene');
    const { PreloadScene } = require('./scenes/PreloadScene');
    const { MainMenuScene } = require('./scenes/MainMenuScene');
    const { GameScene } = require('./scenes/GameScene');

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

    // 화면 크기 계산 함수
    const calculateGameSize = () => {
        // 기본 게임 비율 (4:3)
        const gameRatio = 4 / 3;
        
        // 윈도우 크기
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        
        // 게임 컨테이너 크기 (패딩 등 고려)
        const containerWidth = gameContainer.clientWidth;
        const containerHeight = gameContainer.clientHeight || windowHeight;
        
        // 사용 가능한 최대 크기
        const maxWidth = Math.min(windowWidth, containerWidth);
        const maxHeight = Math.min(windowHeight, containerHeight);
        
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
        width = Math.max(width, 320);
        height = Math.max(height, 240);
        
        // 정수로 반올림
        return {
            width: Math.floor(width),
            height: Math.floor(height)
        };
    };
    
    // 초기 게임 크기 계산
    const gameSize = calculateGameSize();
    console.log(`계산된 게임 크기: ${gameSize.width}x${gameSize.height}`);
    
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
                debug: false
            }
        },
        scale: {
            mode: Phaser.Scale.RESIZE,
            autoCenter: Phaser.Scale.CENTER_BOTH,
            width: gameSize.width,
            height: gameSize.height
        },
        scene: [BootScene, PreloadScene, MainMenuScene, GameScene]
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
            console.log(`게임 크기 조정: ${newSize.width}x${newSize.height}`);
            if (typeof window.debugLog === 'function') {
                window.debugLog(`게임 크기 조정: ${newSize.width}x${newSize.height}`);
            }
        }
    }, false);
    
    console.log('게임 초기화 완료');
    if (typeof window.debugLog === 'function') {
        window.debugLog('게임 초기화 완료');
    }
    
    // 전역 게임 인스턴스 저장
    window.game = game;
    
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