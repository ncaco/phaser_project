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

    // 게임 설정
    const config = {
        type: Phaser.AUTO,
        width: 800,
        height: 600,
        parent: 'game-container',
        backgroundColor: '#2c3e50',
        physics: {
            default: 'arcade',
            arcade: {
                gravity: { y: 0 },
                debug: false
            }
        },
        scene: [BootScene, PreloadScene, MainMenuScene, GameScene]
    };

    // 게임 인스턴스 생성
    console.log('게임 초기화 중...');
    if (typeof window.debugLog === 'function') {
        window.debugLog('게임 초기화 중...');
    }
    
    const game = new Phaser.Game(config);
    
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