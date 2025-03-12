class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
        this.logDebug('BootScene 생성됨');
    }

    // 디버그 로그 헬퍼 함수
    logDebug(message) {
        console.log(message);
        if (typeof window.debugLog === 'function') {
            window.debugLog(message);
        }
    }

    preload() {
        try {
            this.logDebug('BootScene preload 시작');
            
            // 화면 크기 확인 및 로그 출력
            this.logDebug('화면 크기: ' + this.cameras.main.width + 'x' + this.cameras.main.height);
            
            // 배경색 설정
            this.cameras.main.setBackgroundColor('#2c3e50');
            
            // 로딩 텍스트 추가
            this.add.text(
                this.cameras.main.width / 2,
                this.cameras.main.height / 2 - 50,
                '게임 로딩 중...',
                {
                    font: '32px Arial',
                    fill: '#ffffff'
                }
            ).setOrigin(0.5);
            
            // 이미지 로드 대신 직접 그래픽 생성
            this.createPlaceholderGraphics();
            
            this.logDebug('BootScene preload 완료');
        } catch (error) {
            console.error('BootScene preload 중 오류 발생:', error);
            this.logDebug('BootScene preload 오류: ' + error.message);
        }
    }

    createPlaceholderGraphics() {
        try {
            this.logDebug('플레이스홀더 그래픽 생성 시작');
            
            // 로딩 배경 그래픽 생성
            const loadingBg = this.add.graphics();
            loadingBg.fillStyle(0x222222, 1);
            loadingBg.fillRect(0, 0, 320, 50);
            this.textures.addCanvas('loading-background', loadingBg.canvas);
            
            // 로딩 바 그래픽 생성
            const loadingBar = this.add.graphics();
            loadingBar.fillStyle(0x00ff00, 1);
            loadingBar.fillRect(0, 0, 300, 30);
            this.textures.addCanvas('loading-bar', loadingBar.canvas);
            
            // 로딩 애니메이션 추가
            const loadingDots = this.add.text(
                this.cameras.main.width / 2,
                this.cameras.main.height / 2 + 50,
                '...',
                {
                    font: '32px Arial',
                    fill: '#ffffff'
                }
            ).setOrigin(0.5);
            
            // 로딩 애니메이션 효과
            this.tweens.add({
                targets: loadingDots,
                alpha: 0.2,
                duration: 500,
                yoyo: true,
                repeat: -1
            });
            
            this.logDebug('플레이스홀더 그래픽 생성 완료');
        } catch (error) {
            console.error('플레이스홀더 그래픽 생성 중 오류 발생:', error);
            this.logDebug('그래픽 생성 오류: ' + error.message);
        }
    }

    create() {
        try {
            this.logDebug('BootScene create 시작');
            
            // 게임 설정
            this.scale.pageAlignHorizontally = true;
            this.scale.pageAlignVertically = true;
            
            // 다음 씬으로 전환
            this.logDebug('PreloadScene으로 전환 중...');
            this.scene.start('PreloadScene');
            
            this.logDebug('BootScene create 완료');
        } catch (error) {
            console.error('BootScene create 중 오류 발생:', error);
            this.logDebug('BootScene create 오류: ' + error.message);
        }
    }
}

module.exports = { BootScene }; 