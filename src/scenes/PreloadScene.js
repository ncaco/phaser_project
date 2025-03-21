class PreloadScene extends Phaser.Scene {
    constructor() {
        super('PreloadScene');
        this.logDebug('PreloadScene 생성됨');
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
            this.logDebug('PreloadScene preload 시작');
            
            // 로딩 화면 생성
            this.createLoadingBar();
            
            // 화면 크기 로깅
            this.logDebug('화면 크기: ' + this.cameras.main.width + 'x' + this.cameras.main.height);
            
            // 게임 에셋 로드
            this.loadGameAssets();
            
            this.logDebug('PreloadScene preload 완료');
        } catch (error) {
            console.error('PreloadScene preload 중 오류 발생:', error);
            this.logDebug('PreloadScene preload 오류: ' + error.message);
        }
    }

    createLoadingBar() {
        try {
            this.logDebug('로딩 바 생성 시작');
            
            // 배경색 설정
            this.cameras.main.setBackgroundColor('#1e2a3a');
            
            // HTML 로딩 화면 요소 가져오기
            const loadingScreen = document.getElementById('loading-screen');
            const loadingBar = document.getElementById('loading-bar');
            
            if (loadingScreen && loadingBar) {
                // HTML 로딩 화면 사용
                this.useHtmlLoadingScreen = true;
                
                // 로딩 진행 상황 이벤트
                this.load.on('progress', (value) => {
                    try {
                        // 로딩 바 업데이트
                        const percent = Math.floor(value * 100);
                        loadingBar.style.width = percent + '%';
                        
                        // 로그
                        if (percent % 20 === 0) {
                            this.logDebug('로딩 진행: ' + percent + '%');
                        }
                    } catch (error) {
                        console.error('로딩 바 업데이트 중 오류 발생:', error);
                        this.logDebug('로딩 바 업데이트 오류: ' + error.message);
                    }
                });
                
                // 로딩 완료 이벤트
                this.load.on('complete', () => {
                    try {
                        this.logDebug('에셋 로딩 완료');
                        // 로딩 화면은 create 메서드에서 제거
                    } catch (error) {
                        console.error('로딩 완료 처리 중 오류 발생:', error);
                        this.logDebug('로딩 완료 처리 오류: ' + error.message);
                    }
                });
            } else {
                // HTML 로딩 화면이 없는 경우 기존 방식으로 로딩 바 생성
                this.useHtmlLoadingScreen = false;
                
                // 로딩 텍스트
                const loadingText = this.add.text(
                    this.cameras.main.width / 2,
                    this.cameras.main.height / 2 - 50,
                    '로딩 중...',
                    {
                        font: '24px Arial',
                        fill: '#ffffff'
                    }
                ).setOrigin(0.5);
                
                // 로딩 바 배경
                const progressBarBg = this.add.graphics();
                progressBarBg.fillStyle(0x222222, 0.8);
                progressBarBg.fillRect(
                    this.cameras.main.width / 2 - 160,
                    this.cameras.main.height / 2,
                    320,
                    30
                );
                
                // 로딩 바
                const progressBar = this.add.graphics();
                
                // 로딩 진행 상황 이벤트
                this.load.on('progress', (value) => {
                    try {
                        // 로딩 바 업데이트
                        progressBar.clear();
                        progressBar.fillStyle(0x4CAF50, 1);
                        progressBar.fillRect(
                            this.cameras.main.width / 2 - 150,
                            this.cameras.main.height / 2 + 5,
                            300 * value,
                            20
                        );
                        
                        // 퍼센트 표시
                        const percent = Math.floor(value * 100);
                        loadingText.setText('로딩 중... ' + percent + '%');
                        
                        // 로그
                        if (percent % 20 === 0) {
                            this.logDebug('로딩 진행: ' + percent + '%');
                        }
                    } catch (error) {
                        console.error('로딩 바 업데이트 중 오류 발생:', error);
                        this.logDebug('로딩 바 업데이트 오류: ' + error.message);
                    }
                });
                
                // 로딩 완료 이벤트
                this.load.on('complete', () => {
                    try {
                        this.logDebug('에셋 로딩 완료');
                        progressBar.destroy();
                        progressBarBg.destroy();
                        loadingText.destroy();
                    } catch (error) {
                        console.error('로딩 완료 처리 중 오류 발생:', error);
                        this.logDebug('로딩 완료 처리 오류: ' + error.message);
                    }
                });
            }
            
            this.logDebug('로딩 바 생성 완료');
        } catch (error) {
            console.error('로딩 바 생성 중 오류 발생:', error);
            this.logDebug('로딩 바 생성 오류: ' + error.message);
        }
    }

    loadGameAssets() {
        try {
            this.logDebug('게임 에셋 로드 시작');
            
            // 이미지 로드
            this.loadImages();
            
            // 스프라이트시트 로드
            this.loadSpritesheets();
            
            // 오디오 로드
            this.loadAudio();
            
            this.logDebug('게임 에셋 로드 요청 완료');
        } catch (error) {
            console.error('게임 에셋 로드 중 오류 발생:', error);
            this.logDebug('게임 에셋 로드 오류: ' + error.message);
        }
    }

    loadImages() {
        try {
            this.logDebug('이미지 로드 시작');
            
            // 배경 이미지
            this.load.image('background', 'assets/images/background.svg');
            
            // UI 이미지
            this.load.image('title', 'assets/images/title.svg');
            this.load.image('button', 'assets/images/button.svg');
            this.load.image('item', 'assets/images/item.svg');
            
            // 바닥 타일 이미지 (추가)
            this.load.image('ground_tile', 'assets/images/ground_tile.svg');
            
            // 업그레이드 효과 이미지 (추가)
            this.load.image('upgrade_effect', 'assets/images/upgrade_effect.svg');
            
            this.logDebug('이미지 로드 요청 완료');
        } catch (error) {
            console.error('이미지 로드 중 오류 발생:', error);
            this.logDebug('이미지 로드 오류: ' + error.message);
            
            // 이미지가 없는 경우 대체 이미지 생성
            this.createPlaceholderGraphics();
        }
    }

    loadSpritesheets() {
        try {
            this.logDebug('스프라이트시트 로드 시작');
            
            // 플레이어 스프라이트시트
            this.load.spritesheet('player', 'assets/spritesheets/player.svg', {
                frameWidth: 32,
                frameHeight: 32
            });
            
            // 정령 스프라이트시트
            this.load.spritesheet('spirit', 'assets/spritesheets/spirit.svg', {
                frameWidth: 32,
                frameHeight: 32
            });
            
            // 적 스프라이트시트
            this.load.spritesheet('enemy', 'assets/spritesheets/enemy.svg', {
                frameWidth: 32,
                frameHeight: 32
            });
            
            this.logDebug('스프라이트시트 로드 요청 완료');
        } catch (error) {
            console.error('스프라이트시트 로드 중 오류 발생:', error);
            this.logDebug('스프라이트시트 로드 오류: ' + error.message);
            
            // 스프라이트시트가 없는 경우 대체 이미지 생성
            this.createPlaceholderGraphics();
        }
    }

    loadAudio() {
        try {
            this.logDebug('오디오 로드 시작');
            
            // BGM
            this.load.audio('bgm', 'assets/audio/bgm.mp3');
            
            // 효과음
            this.load.audio('attack', 'assets/audio/attack.mp3');
            this.load.audio('item', 'assets/audio/item.mp3');
            this.load.audio('levelup', 'assets/audio/levelup.mp3');
            this.load.audio('gameover', 'assets/audio/gameover.mp3');
            
            this.logDebug('오디오 로드 요청 완료');
        } catch (error) {
            console.error('오디오 로드 중 오류 발생:', error);
            this.logDebug('오디오 로드 오류: ' + error.message);
            
            // 오디오가 없는 경우 대체 오디오 생성
            this.createDummyAudio();
        }
    }

    createPlaceholderGraphics() {
        try {
            this.logDebug('대체 그래픽 생성 시작');
            
            // 배경 대체 이미지
            const bgTexture = this.generateTexture('background', 800, 600, '#1a2b3c');
            
            // 플레이어 대체 이미지
            const playerTexture = this.generateTexture('player', 32, 32, '#3498db');
            
            // 정령 대체 이미지
            const spiritTexture = this.generateTexture('spirit', 32, 32, '#2ecc71');
            
            // 적 대체 이미지
            const enemyTexture = this.generateTexture('enemy', 32, 32, '#e74c3c');
            
            // 아이템 대체 이미지
            const itemTexture = this.generateTexture('item', 16, 16, '#f1c40f');
            
            // 타이틀 대체 이미지
            const titleTexture = this.generateTexture('title', 400, 100, '#3498db');
            
            // 버튼 대체 이미지
            const buttonTexture = this.generateTexture('button', 200, 50, '#2980b9');
            
            this.logDebug('대체 그래픽 생성 완료');
        } catch (error) {
            console.error('대체 그래픽 생성 중 오류 발생:', error);
            this.logDebug('대체 그래픽 생성 오류: ' + error.message);
        }
    }

    generateTexture(key, width, height, color) {
        try {
            // 텍스처 생성
            const rt = this.add.renderTexture(0, 0, width, height);
            
            // 그래픽 생성
            const graphics = this.add.graphics();
            graphics.fillStyle(color);
            graphics.fillRect(0, 0, width, height);
            
            // 텍스처에 그래픽 그리기
            rt.draw(graphics);
            
            // 텍스처 생성
            rt.saveTexture(key);
            
            // 정리
            graphics.destroy();
            rt.destroy();
            
            return key;
        } catch (error) {
            console.error('텍스처 생성 중 오류 발생:', error);
            this.logDebug('텍스처 생성 오류: ' + error.message);
            return null;
        }
    }

    createDummyAudio() {
        try {
            this.logDebug('대체 오디오 생성 시작');
            
            // 더미 오디오 객체 생성
            const dummySound = {
                play: function() { return this; },
                stop: function() { return this; },
                pause: function() { return this; },
                resume: function() { return this; },
                setVolume: function() { return this; },
                setLoop: function() { return this; }
            };
            
            // 더미 오디오 캐시에 추가
            this.sound.add('bgm', dummySound);
            this.sound.add('attack', dummySound);
            this.sound.add('item', dummySound);
            this.sound.add('levelup', dummySound);
            this.sound.add('gameover', dummySound);
            this.sound.add('game_over', dummySound); // 추가: GameScene에서 사용하는 이름
            
            this.logDebug('대체 오디오 생성 완료');
        } catch (error) {
            console.error('대체 오디오 생성 중 오류 발생:', error);
            this.logDebug('대체 오디오 생성 오류: ' + error.message);
            
            // 오디오 관련 오류를 무시하도록 설정
            this.sound.on('loaderror', (soundKey, err) => {
                console.warn(`오디오 로드 오류 무시: ${soundKey}`, err);
            });
        }
    }

    create() {
        try {
            this.logDebug('PreloadScene create 시작');
            
            // HTML 로딩 화면 숨기기
            if (this.useHtmlLoadingScreen) {
                const loadingScreen = document.getElementById('loading-screen');
                if (loadingScreen) {
                    // 부드러운 페이드 아웃 효과
                    loadingScreen.style.transition = 'opacity 0.5s ease-in-out';
                    loadingScreen.style.opacity = '0';
                    
                    // 트랜지션 완료 후 요소 숨기기
                    setTimeout(() => {
                        loadingScreen.style.display = 'none';
                    }, 500);
                }
            }
            
            // 애니메이션 생성
            this.createAnimations();
            
            // 시작 프롬프트 생성
            this.createStartPrompt();
            
            this.logDebug('PreloadScene create 완료, MainMenuScene으로 전환');
            
            // 메인 메뉴 씬으로 전환
            this.scene.start('MainMenuScene');
        } catch (error) {
            console.error('PreloadScene create 중 오류 발생:', error);
            this.logDebug('PreloadScene create 오류: ' + error.message);
        }
    }

    createAnimations() {
        try {
            this.logDebug('애니메이션 생성 시작');
            
            // 플레이어 애니메이션
            this.anims.create({
                key: 'player_idle',
                frames: this.anims.generateFrameNumbers('player', { start: 0, end: 3 }),
                frameRate: 8,
                repeat: -1
            });
            
            // 정령 애니메이션
            this.anims.create({
                key: 'spirit_idle',
                frames: this.anims.generateFrameNumbers('spirit', { start: 0, end: 3 }),
                frameRate: 8,
                repeat: -1
            });
            
            // 적 애니메이션
            this.anims.create({
                key: 'enemy_idle',
                frames: this.anims.generateFrameNumbers('enemy', { start: 0, end: 3 }),
                frameRate: 8,
                repeat: -1
            });
            
            this.logDebug('애니메이션 생성 완료');
        } catch (error) {
            console.error('애니메이션 생성 중 오류 발생:', error);
            this.logDebug('애니메이션 생성 오류: ' + error.message);
        }
    }

    createStartPrompt() {
        try {
            this.logDebug('시작 프롬프트 생성 시작');
            
            // 시작 프롬프트 텍스트
            const startPrompt = this.add.text(
                this.cameras.main.width / 2,
                this.cameras.main.height / 2 + 50,
                '클릭하여 시작',
                {
                    font: '24px Arial',
                    fill: '#ffffff'
                }
            ).setOrigin(0.5);
            
            // 깜빡임 효과
            this.tweens.add({
                targets: startPrompt,
                alpha: { from: 1, to: 0 },
                duration: 500,
                yoyo: true,
                repeat: -1
            });
            
            // 클릭 이벤트
            this.input.on('pointerdown', () => {
                this.logDebug('화면 클릭됨, MainMenuScene으로 전환');
                this.scene.start('MainMenuScene');
            });
            
            this.logDebug('시작 프롬프트 생성 완료');
        } catch (error) {
            console.error('시작 프롬프트 생성 중 오류 발생:', error);
            this.logDebug('시작 프롬프트 생성 오류: ' + error.message);
        }
    }
}

module.exports = { PreloadScene }; 