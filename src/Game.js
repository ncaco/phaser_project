// 씬 모듈 가져오기
let BootScene, PreloadScene, MainMenuScene, GameScene, UIScene;

try {
    BootScene = require('./scenes/BootScene').BootScene;
    PreloadScene = require('./scenes/PreloadScene').PreloadScene;
    MainMenuScene = require('./scenes/MainMenuScene').MainMenuScene;
    GameScene = require('./scenes/GameScene').GameScene;
    UIScene = require('./scenes/UIScene').UIScene;
} catch (error) {
    console.error('씬 모듈 로드 중 오류 발생:', error);
    throw new Error('게임 씬을 로드할 수 없습니다: ' + error.message);
}

class Game {
    constructor() {
        try {
            console.log('게임 설정 초기화 중...');
            
            // 게임 설정
            const config = {
                type: Phaser.AUTO,
                width: 800,
                height: 600,
                parent: 'game-container',
                pixelArt: true,
                backgroundColor: '#2c3e50',
                scale: {
                    mode: Phaser.Scale.FIT,
                    autoCenter: Phaser.Scale.CENTER_BOTH
                },
                physics: {
                    default: 'arcade',
                    arcade: {
                        gravity: { y: 0 },
                        debug: false
                    }
                },
                scene: [
                    BootScene,
                    PreloadScene,
                    MainMenuScene,
                    GameScene,
                    UIScene
                ]
            };

            // 씬 클래스 확인
            if (!BootScene || !PreloadScene || !MainMenuScene || !GameScene || !UIScene) {
                throw new Error('필요한 씬 클래스가 로드되지 않았습니다.');
            }

            console.log('Phaser 게임 인스턴스 생성 중...');
            // Phaser 게임 인스턴스 생성
            this.game = new Phaser.Game(config);
            
            // 디버깅 정보 출력
            console.log('게임 인스턴스 생성됨');
        } catch (error) {
            console.error('게임 인스턴스 생성 중 오류 발생:', error);
            throw error;
        }
    }
}

module.exports = { Game }; 