const Player = require('../entities/Player').Player;
const Spirit = require('../entities/Spirit').Spirit;
const Enemy = require('../entities/Enemy').Enemy;
const Item = require('../entities/Item').Item;
const EnemySpawner = require('../systems/EnemySpawner').EnemySpawner;
const LevelSystem = require('../systems/LevelSystem').LevelSystem;

class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    create() {
        try {
            this.logDebug('GameScene 생성 시작');
            
            // 게임 상태
            this.gameOver = false;
            this.gamePaused = false;
            
            // 배경 생성
            this.createBackground();
            
            // 플레이어 생성
            this.createPlayer();
            
            // 적 그룹 생성
            this.enemies = this.physics.add.group();
            
            // 아이템 그룹 생성
            this.items = this.physics.add.group();
            
            // 시스템 초기화
            this.initSystems();
            
            // 충돌 설정
            this.setupCollisions();
            
            // 카메라 설정
            this.setupCamera();
            
            // UI 생성
            this.createUI();
            
            // 키보드 입력 설정
            this.setupInput();
            
            // 게임 시작
            this.startGame();
            
            this.logDebug('GameScene 생성 완료');
        } catch (error) {
            this.logDebug(`GameScene 생성 중 오류: ${error.message}`);
            console.error('GameScene 생성 중 오류:', error);
        }
    }
    
    logDebug(message) {
        console.log(`[GameScene] ${message}`);
        if (window.debugLog) {
            window.debugLog(`[GameScene] ${message}`);
        }
    }
    
    createBackground() {
        // 배경 생성
        this.background = this.add.tileSprite(0, 0, this.cameras.main.width, this.cameras.main.height, 'background');
        this.background.setOrigin(0, 0);
        this.background.setScrollFactor(0);
        
        // 바닥 타일 생성
        this.groundTiles = [];
        
        const tileSize = 128;
        const tilesX = Math.ceil(this.cameras.main.width / tileSize) + 2;
        const tilesY = Math.ceil(this.cameras.main.height / tileSize) + 2;
        
        for (let y = -1; y < tilesY; y++) {
            for (let x = -1; x < tilesX; x++) {
                const tile = this.add.image(x * tileSize, y * tileSize, 'ground_tile');
                tile.setOrigin(0, 0);
                tile.setDepth(-1);
                this.groundTiles.push(tile);
            }
        }
    }
    
    createPlayer() {
        // 플레이어 생성
        const Player = require('../entities/Player').Player;
        this.player = new Player(
            this,
            this.cameras.main.centerX,
            this.cameras.main.centerY
        );
        
        // 플레이어 초기 정령 추가
        this.player.addSpirit('기본 정령');
    }
    
    initSystems() {
        // 레벨 시스템 초기화
        const LevelSystem = require('../systems/LevelSystem').LevelSystem;
        this.levelSystem = new LevelSystem(this);
        
        // 적 스포너 초기화
        const EnemySpawner = require('../systems/EnemySpawner').EnemySpawner;
        this.enemySpawner = new EnemySpawner(this);
    }
    
    setupCollisions() {
        // 플레이어와 적 충돌
        this.physics.add.overlap(
            this.player,
            this.enemies,
            this.handlePlayerEnemyCollision,
            null,
            this
        );
        
        // 플레이어와 아이템 충돌
        this.physics.add.overlap(
            this.player,
            this.items,
            this.handlePlayerItemCollision,
            null,
            this
        );
    }
    
    setupCamera() {
        // 카메라 설정
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
        this.cameras.main.setZoom(1);
    }
    
    createUI() {
        // 게임 UI 생성
        this.createGameUI();
        
        // 일시정지 메뉴 생성
        this.createPauseMenu();
        
        // 게임 오버 화면 생성
        this.createGameOverScreen();
    }
    
    createGameUI() {
        // UI 컨테이너
        this.gameUI = this.add.container(0, 0);
        this.gameUI.setScrollFactor(0);
        this.gameUI.setDepth(100);
        
        // 체력 바 배경
        this.healthBarBg = this.add.rectangle(120, 30, 200, 20, 0x000000);
        this.healthBarBg.setScrollFactor(0);
        this.healthBarBg.setDepth(100);
        
        // 체력 바
        this.healthBar = this.add.rectangle(20, 30, 0, 16, 0xff0000);
        this.healthBar.setOrigin(0, 0.5);
        this.healthBar.setScrollFactor(0);
        this.healthBar.setDepth(100);
        
        // 체력 텍스트
        this.healthText = this.add.text(120, 30, '', {
            fontFamily: 'Arial',
            fontSize: '14px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3
        });
        this.healthText.setOrigin(0.5);
        this.healthText.setScrollFactor(0);
        this.healthText.setDepth(100);
        
        // 웨이브 정보 텍스트
        this.waveText = this.add.text(
            this.cameras.main.width - 20,
            20,
            '',
            {
                fontFamily: 'Arial',
                fontSize: '16px',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 3,
                align: 'right'
            }
        );
        this.waveText.setOrigin(1, 0);
        this.waveText.setScrollFactor(0);
        this.waveText.setDepth(100);
        
        // 일시정지 버튼
        this.pauseButton = this.add.rectangle(
            this.cameras.main.width - 30,
            70,
            40,
            40,
            0x333333,
            0.8
        );
        this.pauseButton.setScrollFactor(0);
        this.pauseButton.setDepth(100);
        this.pauseButton.setInteractive();
        
        // 일시정지 아이콘
        this.pauseIcon = this.add.rectangle(
            this.cameras.main.width - 30,
            70,
            15,
            20,
            0xffffff
        );
        this.pauseIcon.setScrollFactor(0);
        this.pauseIcon.setDepth(101);
        
        // 일시정지 버튼 이벤트
        this.pauseButton.on('pointerdown', () => {
            this.togglePause();
        });
        
        // 일시정지 버튼 호버 효과
        this.pauseButton.on('pointerover', () => {
            this.pauseButton.fillColor = 0x555555;
        });
        
        this.pauseButton.on('pointerout', () => {
            this.pauseButton.fillColor = 0x333333;
        });
        
        // 게임 UI 컨테이너에 추가
        this.gameUI.add([
            this.healthBarBg,
            this.healthBar,
            this.healthText,
            this.waveText,
            this.pauseButton,
            this.pauseIcon
        ]);
        
        // UI 업데이트
        this.updateHealthBar();
        this.updateWaveInfo();
    }
    
    createPauseMenu() {
        // 일시정지 메뉴 컨테이너
        this.pauseMenu = this.add.container(0, 0);
        this.pauseMenu.setScrollFactor(0);
        this.pauseMenu.setDepth(200);
        this.pauseMenu.setVisible(false);
        
        // 배경 패널
        this.pauseMenuBg = this.add.rectangle(
            this.cameras.main.centerX,
            this.cameras.main.centerY,
            400,
            300,
            0x000000,
            0.8
        );
        
        // 제목 텍스트
        this.pauseMenuTitle = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY - 100,
            '일시정지',
            {
                fontFamily: 'Arial',
                fontSize: '32px',
                color: '#ffffff'
            }
        );
        this.pauseMenuTitle.setOrigin(0.5);
        
        // 계속하기 버튼
        this.resumeButton = this.add.rectangle(
            this.cameras.main.centerX,
            this.cameras.main.centerY - 20,
            300,
            60,
            0x4CAF50, // 녹색 계열
            0.9
        );
        this.resumeButton.setInteractive();
        this.resumeButton.setStrokeStyle(2, 0xFFFFFF);
        
        // 계속하기 텍스트
        this.resumeText = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY - 20,
            '계속하기',
            {
                fontFamily: 'Arial',
                fontSize: '28px',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 2
            }
        );
        this.resumeText.setOrigin(0.5);
        
        // 메인 메뉴 버튼
        this.mainMenuButton = this.add.rectangle(
            this.cameras.main.centerX,
            this.cameras.main.centerY + 50,
            300,
            60,
            0x2196F3, // 파란색 계열
            0.9
        );
        this.mainMenuButton.setInteractive();
        this.mainMenuButton.setStrokeStyle(2, 0xFFFFFF);
        
        // 메인 메뉴 텍스트
        this.mainMenuText = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY + 50,
            '메인 메뉴로',
            {
                fontFamily: 'Arial',
                fontSize: '28px',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 2
            }
        );
        this.mainMenuText.setOrigin(0.5);
        
        // 버튼 이벤트
        this.resumeButton.on('pointerdown', () => {
            this.togglePause();
        });
        
        this.mainMenuButton.on('pointerdown', () => {
            console.log('메인 메뉴로 버튼 클릭됨 (일시정지 메뉴)');
            this.scene.start('MainMenuScene');
        });
        
        // 버튼 호버 효과
        this.resumeButton.on('pointerover', () => {
            this.resumeButton.fillColor = 0x66BB6A; // 더 밝은 녹색
            this.resumeButton.setScale(1.05);
            this.resumeText.setScale(1.05);
        });
        
        this.resumeButton.on('pointerout', () => {
            this.resumeButton.fillColor = 0x4CAF50; // 원래 녹색
            this.resumeButton.setScale(1.0);
            this.resumeText.setScale(1.0);
        });
        
        this.mainMenuButton.on('pointerover', () => {
            this.mainMenuButton.fillColor = 0x42A5F5; // 더 밝은 파란색
            this.mainMenuButton.setScale(1.05);
            this.mainMenuText.setScale(1.05);
        });
        
        this.mainMenuButton.on('pointerout', () => {
            this.mainMenuButton.fillColor = 0x2196F3; // 원래 파란색
            this.mainMenuButton.setScale(1.0);
            this.mainMenuText.setScale(1.0);
        });
        
        // 일시정지 메뉴 컨테이너에 추가
        this.pauseMenu.add([
            this.pauseMenuBg,
            this.pauseMenuTitle,
            this.resumeButton,
            this.resumeText,
            this.mainMenuButton,
            this.mainMenuText
        ]);
    }
    
    createGameOverScreen() {
        // 게임 오버 화면 컨테이너
        this.gameOverScreen = this.add.container(0, 0);
        this.gameOverScreen.setScrollFactor(0);
        this.gameOverScreen.setDepth(200);
        this.gameOverScreen.setVisible(false);
        
        // 배경 패널
        this.gameOverBg = this.add.rectangle(
            this.cameras.main.centerX,
            this.cameras.main.centerY,
            500,
            400,
            0x000000,
            0.8
        );
        
        // 게임 오버 텍스트
        this.gameOverTitle = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY - 120,
            '게임 오버',
            {
                fontFamily: 'Arial',
                fontSize: '48px',
                color: '#ff0000',
                stroke: '#000000',
                strokeThickness: 4
            }
        );
        this.gameOverTitle.setOrigin(0.5);
        
        // 결과 텍스트
        this.gameOverStats = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY - 30,
            '',
            {
                fontFamily: 'Arial',
                fontSize: '24px',
                color: '#ffffff',
                align: 'center'
            }
        );
        this.gameOverStats.setOrigin(0.5);
        
        // 다시 시작 버튼
        this.restartButton = this.add.rectangle(
            this.cameras.main.centerX,
            this.cameras.main.centerY + 80,
            300,
            60,
            0x4CAF50, // 녹색 계열
            0.9
        );
        this.restartButton.setInteractive();
        this.restartButton.setStrokeStyle(2, 0xFFFFFF);
        
        // 다시 시작 텍스트
        this.restartText = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY + 80,
            '다시 시작',
            {
                fontFamily: 'Arial',
                fontSize: '28px',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 2
            }
        );
        this.restartText.setOrigin(0.5);
        
        // 메인 메뉴 버튼
        this.gameOverMenuButton = this.add.rectangle(
            this.cameras.main.centerX,
            this.cameras.main.centerY + 150,
            300,
            60,
            0x2196F3, // 파란색 계열
            0.9
        );
        this.gameOverMenuButton.setInteractive();
        this.gameOverMenuButton.setStrokeStyle(2, 0xFFFFFF);
        
        // 메인 메뉴 텍스트
        this.gameOverMenuText = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY + 150,
            '메인 메뉴로',
            {
                fontFamily: 'Arial',
                fontSize: '28px',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 2
            }
        );
        this.gameOverMenuText.setOrigin(0.5);
        
        // 버튼 이벤트
        this.restartButton.on('pointerdown', () => {
            console.log('다시 시작 버튼 클릭됨');
            this.scene.restart();
        });
        
        this.gameOverMenuButton.on('pointerdown', () => {
            console.log('메인 메뉴로 버튼 클릭됨');
            this.scene.start('MainMenuScene');
        });
        
        // 버튼 호버 효과
        this.restartButton.on('pointerover', () => {
            this.restartButton.fillColor = 0x66BB6A; // 더 밝은 녹색
            this.restartButton.setScale(1.05);
            this.restartText.setScale(1.05);
        });
        
        this.restartButton.on('pointerout', () => {
            this.restartButton.fillColor = 0x4CAF50; // 원래 녹색
            this.restartButton.setScale(1.0);
            this.restartText.setScale(1.0);
        });
        
        this.gameOverMenuButton.on('pointerover', () => {
            this.gameOverMenuButton.fillColor = 0x42A5F5; // 더 밝은 파란색
            this.gameOverMenuButton.setScale(1.05);
            this.gameOverMenuText.setScale(1.05);
        });
        
        this.gameOverMenuButton.on('pointerout', () => {
            this.gameOverMenuButton.fillColor = 0x2196F3; // 원래 파란색
            this.gameOverMenuButton.setScale(1.0);
            this.gameOverMenuText.setScale(1.0);
        });
        
        // 게임 오버 화면 컨테이너에 추가
        this.gameOverScreen.add([
            this.gameOverBg,
            this.gameOverTitle,
            this.gameOverStats,
            this.restartButton,
            this.restartText,
            this.gameOverMenuButton,
            this.gameOverMenuText
        ]);
    }
    
    setupInput() {
        // 커서 키 설정
        this.cursors = this.input.keyboard.createCursorKeys();
        
        // ESC 키로 일시정지 토글
        this.input.keyboard.on('keydown-ESC', () => {
            this.togglePause();
        });
    }
    
    startGame() {
        // 적 스포너 시작
        this.enemySpawner.start();
        
        // 게임 타이머 시작 (생존 시간 측정)
        this.gameStartTime = Date.now();
        this.survivalTime = 0;
        
        // 타이머 이벤트 (1초마다 생존 시간 업데이트)
        this.survivalTimer = this.time.addEvent({
            delay: 1000,
            callback: this.updateSurvivalTime,
            callbackScope: this,
            loop: true
        });
    }
    
    update(time, delta) {
        if (this.gameOver || this.gamePaused) return;
        
        // 플레이어 업데이트
        if (this.player) {
            this.player.update(this.cursors);
        }
        
        // 적 업데이트
        this.enemies.getChildren().forEach(enemy => {
            enemy.update();
        });
        
        // 아이템 업데이트
        this.items.getChildren().forEach(item => {
            item.update();
        });
        
        // UI 업데이트
        this.updateUI();
        
        // 배경 타일 업데이트
        this.updateBackgroundTiles();
    }
    
    updateUI() {
        // 체력 바 업데이트
        this.updateHealthBar();
        
        // 웨이브 정보 업데이트
        this.updateWaveInfo();
    }
    
    updateHealthBar() {
        if (!this.player) return;
        
        // 체력 비율 계산
        const healthRatio = this.player.health / this.player.maxHealth;
        
        // 체력 바 너비 업데이트
        this.healthBar.width = 200 * healthRatio;
        
        // 체력 텍스트 업데이트
        this.healthText.setText(`${Math.ceil(this.player.health)} / ${this.player.maxHealth}`);
        
        // 체력에 따른 색상 변경
        if (healthRatio > 0.6) {
            this.healthBar.fillColor = 0x00ff00; // 녹색
        } else if (healthRatio > 0.3) {
            this.healthBar.fillColor = 0xffff00; // 노란색
        } else {
            this.healthBar.fillColor = 0xff0000; // 빨간색
        }
    }
    
    updateWaveInfo() {
        if (!this.enemySpawner) return;
        
        // 웨이브 정보 가져오기
        const waveInfo = this.enemySpawner.getCurrentWaveInfo();
        
        // 웨이브 텍스트 업데이트
        this.waveText.setText(
            `웨이브: ${waveInfo.wave}\n` +
            `적: ${waveInfo.enemiesKilled} / ${waveInfo.enemiesPerWave}\n` +
            `난이도: ${waveInfo.difficulty.toFixed(1)}\n` +
            `생존 시간: ${this.formatTime(this.survivalTime)}`
        );
    }
    
    updateSurvivalTime() {
        // 생존 시간 업데이트
        this.survivalTime = Math.floor((Date.now() - this.gameStartTime) / 1000);
    }
    
    formatTime(seconds) {
        // 시간 형식 변환 (MM:SS)
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    
    updateBackgroundTiles() {
        // 플레이어가 없으면 리턴
        if (!this.player) return;
        
        // 타일 크기
        const tileSize = 128;
        
        // 플레이어 위치
        const playerX = this.player.x;
        const playerY = this.player.y;
        
        // 카메라 경계
        const cameraBounds = {
            left: playerX - this.cameras.main.width / 2 - tileSize,
            right: playerX + this.cameras.main.width / 2 + tileSize,
            top: playerY - this.cameras.main.height / 2 - tileSize,
            bottom: playerY + this.cameras.main.height / 2 + tileSize
        };
        
        // 타일 재배치
        this.groundTiles.forEach(tile => {
            // 타일이 화면 밖으로 나갔는지 확인
            if (tile.x < cameraBounds.left || 
                tile.x > cameraBounds.right || 
                tile.y < cameraBounds.top || 
                tile.y > cameraBounds.bottom) {
                
                // 새 위치 계산
                let newX = tile.x;
                let newY = tile.y;
                
                if (tile.x < cameraBounds.left) {
                    newX += tileSize * Math.ceil((cameraBounds.right - tile.x) / tileSize);
                } else if (tile.x > cameraBounds.right) {
                    newX -= tileSize * Math.ceil((tile.x - cameraBounds.left) / tileSize);
                }
                
                if (tile.y < cameraBounds.top) {
                    newY += tileSize * Math.ceil((cameraBounds.bottom - tile.y) / tileSize);
                } else if (tile.y > cameraBounds.bottom) {
                    newY -= tileSize * Math.ceil((tile.y - cameraBounds.top) / tileSize);
                }
                
                // 타일 위치 업데이트
                tile.x = newX;
                tile.y = newY;
            }
        });
    }
    
    handlePlayerEnemyCollision(player, enemy) {
        // 플레이어가 무적 상태면 리턴
        if (player.invulnerable) return;
        
        // 플레이어 데미지 처리
        player.takeDamage(enemy.damage);
        
        // 체력 바 업데이트
        this.updateHealthBar();
        
        // 게임 오버 체크
        if (player.health <= 0) {
            this.gameOver = true;
            this.showGameOver();
        }
    }
    
    handlePlayerItemCollision(player, item) {
        // 아이템 효과 적용
        item.applyEffect(player);
    }
    
    togglePause() {
        // 게임 오버 상태면 리턴
        if (this.gameOver) return;
        
        // 일시정지 토글
        this.gamePaused = !this.gamePaused;
        
        if (this.gamePaused) {
            // 게임 일시정지
            this.physics.pause();
            this.pauseMenu.setVisible(true);
            
            // 타이머 일시정지
            if (this.survivalTimer) {
                this.survivalTimer.paused = true;
            }
        } else {
            // 게임 재개
            this.physics.resume();
            this.pauseMenu.setVisible(false);
            
            // 타이머 재개
            if (this.survivalTimer) {
                this.survivalTimer.paused = false;
            }
        }
    }
    
    showGameOver() {
        // 게임 일시정지
        this.physics.pause();
        
        // 타이머 정지
        if (this.survivalTimer) {
            this.survivalTimer.remove();
        }
        
        // 적 스포너 정지
        if (this.enemySpawner) {
            this.enemySpawner.stop();
        }
        
        // 게임 결과 통계
        const waveInfo = this.enemySpawner.getCurrentWaveInfo();
        const levelInfo = this.levelSystem.getCurrentLevelInfo();
        
        // 결과 텍스트 업데이트
        this.gameOverStats.setText(
            `생존 시간: ${this.formatTime(this.survivalTime)}\n` +
            `최대 웨이브: ${waveInfo.wave}\n` +
            `처치한 적: ${waveInfo.enemiesKilled}\n` +
            `플레이어 레벨: ${levelInfo.level}`
        );
        
        // 게임 오버 화면 표시
        this.gameOverScreen.setVisible(true);
        
        // 게임 오버 효과음
        try {
            this.sound.play('game_over');
        } catch (error) {
            console.error('게임 오버 효과음 재생 중 오류:', error);
        }
    }
    
    restartGame() {
        try {
            this.logDebug('게임 재시작 시도');
            
            // 게임 오버 화면 숨기기
            if (this.gameOverScreen) {
                this.gameOverScreen.setVisible(false);
            }
            
            // 일시정지 메뉴 숨기기
            if (this.pauseMenu) {
                this.pauseMenu.setVisible(false);
            }
            
            // 게임 상태 초기화
            this.gameOver = false;
            this.gamePaused = false;
            
            // 물리 엔진 재개
            if (this.physics) {
                this.physics.resume();
            }
            
            // 타이머 정지
            if (this.survivalTimer) {
                this.survivalTimer.remove();
            }
            
            // 적 스포너 정지
            if (this.enemySpawner) {
                this.enemySpawner.stop();
            }
            
            // 씬 재시작
            this.logDebug('GameScene 재시작');
            this.scene.restart();
        } catch (error) {
            console.error('게임 재시작 중 오류:', error);
            this.logDebug('게임 재시작 오류: ' + error.message);
            
            // 오류가 발생해도 씬 재시작 시도
            this.scene.restart();
        }
    }
    
    returnToMainMenu() {
        try {
            this.logDebug('메인 메뉴로 돌아가기 시도');
            
            // 게임 오버 화면 숨기기
            if (this.gameOverScreen) {
                this.gameOverScreen.setVisible(false);
            }
            
            // 일시정지 메뉴 숨기기
            if (this.pauseMenu) {
                this.pauseMenu.setVisible(false);
            }
            
            // 게임 상태 초기화
            this.gameOver = false;
            this.gamePaused = false;
            
            // 물리 엔진 재개
            if (this.physics) {
                this.physics.resume();
            }
            
            // 타이머 정지
            if (this.survivalTimer) {
                this.survivalTimer.remove();
            }
            
            // 적 스포너 정지
            if (this.enemySpawner) {
                this.enemySpawner.stop();
            }
            
            // 메인 메뉴로 이동
            this.logDebug('MainMenuScene으로 전환');
            this.scene.start('MainMenuScene');
        } catch (error) {
            console.error('메인 메뉴로 돌아가기 중 오류:', error);
            this.logDebug('메인 메뉴로 돌아가기 오류: ' + error.message);
            
            // 오류가 발생해도 메인 메뉴로 이동 시도
            this.scene.start('MainMenuScene');
        }
    }
}

module.exports = { GameScene };