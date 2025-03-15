const Player = require('../entities/Player').Player;
const Spirit = require('../entities/Spirit').Spirit;
const Enemy = require('../entities/Enemy').Enemy;
const Item = require('../entities/Item').Item;
const EnemySpawner = require('../systems/EnemySpawner').EnemySpawner;
const LevelSystem = require('../systems/LevelSystem').LevelSystem;
const AchievementSystem = require('../systems/AchievementSystem').AchievementSystem;

class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.difficulty = 'normal'; // 기본 난이도
        this.uiElements = {}; // UI 요소 저장 객체
    }

    init(data) {
        // MainMenuScene에서 전달받은 난이도 설정
        if (data && data.difficulty) {
            this.difficulty = data.difficulty;
            this.logDebug(`게임 난이도 설정: ${this.difficulty}`);
        }
        
        // MainMenuScene에서 전달받은 속성 설정
        if (data && data.element) {
            this.playerElement = data.element;
            this.logDebug(`플레이어 속성 설정: ${this.playerElement}`);
        } else {
            this.playerElement = 'fire'; // 기본 속성
        }
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
            
            // 난이도 표시
            this.showDifficultyIndicator();
            
            // 화면 크기 변경 이벤트 리스너 등록
            this.scale.on('resize', this.handleResize, this);
            
            // 플레이어 사망 이벤트 리스너 등록
            this.events.on('playerDeath', this.showGameOver, this);
            
            this.logDebug('GameScene 생성 완료');
        } catch (error) {
            console.error('GameScene 생성 중 오류 발생:', error);
            this.logDebug('GameScene 생성 오류: ' + error.message);
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
        
        const tileSize = window.getScaledValue(128);
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
            this.cameras.main.centerY,
            this.playerElement // 선택한 속성 전달
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
        
        // 성취 시스템 초기화
        const AchievementSystem = require('../systems/AchievementSystem').AchievementSystem;
        this.achievementSystem = new AchievementSystem(this);
        
        // 난이도에 따른 게임 설정 조정
        this.applyDifficultySettings();
        
        // 생존 시간 타이머 (성취 시스템용)
        this.survivalTime = 0;
        this.survivalTimer = this.time.addEvent({
            delay: 1000, // 1초마다
            callback: this.updateSurvivalTime,
            callbackScope: this,
            loop: true
        });
    }
    
    // 난이도 설정 적용
    applyDifficultySettings() {
        switch (this.difficulty) {
            case 'easy':
                // 쉬운 난이도 설정
                this.enemySpawner.spawnRate = 3000; // 적 스폰 간격 증가 (느리게)
                this.enemySpawner.maxEnemies = 10; // 최대 적 수 감소
                this.enemySpawner.bossWaveInterval = 5; // 보스 웨이브 간격 증가
                this.player.maxHealth = 150; // 플레이어 최대 체력 증가
                this.player.health = 150; // 현재 체력도 증가
                this.player.healAmount = 30; // 회복량 증가
                break;
                
            case 'normal':
                // 보통 난이도 설정 (기본값 유지)
                this.enemySpawner.spawnRate = 2000;
                this.enemySpawner.maxEnemies = 15;
                this.enemySpawner.bossWaveInterval = 3;
                this.player.maxHealth = 100;
                this.player.health = 100;
                this.player.healAmount = 20;
                break;
                
            case 'hard':
                // 어려운 난이도 설정
                this.enemySpawner.spawnRate = 1500; // 적 스폰 간격 감소 (빠르게)
                this.enemySpawner.maxEnemies = 20; // 최대 적 수 증가
                this.enemySpawner.bossWaveInterval = 2; // 보스 웨이브 간격 감소
                this.enemySpawner.enemyHealthMultiplier = 1.5; // 적 체력 증가
                this.enemySpawner.enemyDamageMultiplier = 1.5; // 적 공격력 증가
                this.player.maxHealth = 80; // 플레이어 최대 체력 감소
                this.player.health = 80; // 현재 체력도 감소
                this.player.healAmount = 15; // 회복량 감소
                break;
        }
        
        this.logDebug(`난이도 설정 적용됨: ${this.difficulty}`);
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
        this.cameras.main.startFollow(this.player, true, 0.05, 0.05);
        this.cameras.main.setZoom(1);
        this.cameras.main.setLerp(0.05, 0.05); // 부드러운 카메라 이동
        this.cameras.main.setDeadzone(50, 50); // 데드존 추가
    }
    
    createUI() {
        // 게임 UI 생성
        this.createGameUI();
        
        // 일시정지 메뉴 생성
        this.createPauseMenu();
        
        // 게임 오버 화면 생성
        this.createGameOverScreen();
        
        // 성취 버튼 추가
        this.createAchievementButton();
    }
    
    createGameUI() {
        // UI 컨테이너
        this.uiElements.gameUI = this.add.container(0, 0);
        this.uiElements.gameUI.setScrollFactor(0);
        this.uiElements.gameUI.setDepth(100);
        
        const padding = window.getScaledValue(20);
        const barWidth = window.getScaledValue(200);
        const barHeight = window.getScaledValue(20);
        const barInnerHeight = window.getScaledValue(16);
        
        // 체력 바 배경
        this.uiElements.healthBarBg = this.add.rectangle(
            padding + barWidth / 2, 
            padding + barHeight / 2, 
            barWidth, 
            barHeight, 
            0x000000
        );
        this.uiElements.healthBarBg.setScrollFactor(0);
        this.uiElements.healthBarBg.setDepth(100);
        
        // 체력 바
        this.uiElements.healthBar = this.add.rectangle(
            padding, 
            padding + barHeight / 2, 
            0, 
            barInnerHeight, 
            0xff0000
        );
        this.uiElements.healthBar.setOrigin(0, 0.5);
        this.uiElements.healthBar.setScrollFactor(0);
        this.uiElements.healthBar.setDepth(100);
        
        // 체력 텍스트
        this.uiElements.healthText = this.add.text(
            padding + barWidth / 2, 
            padding + barHeight / 2, 
            '', 
            {
                fontFamily: 'Arial',
                fontSize: `${window.getScaledFontSize(14)}px`,
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 3
            }
        );
        this.uiElements.healthText.setOrigin(0.5);
        this.uiElements.healthText.setScrollFactor(0);
        this.uiElements.healthText.setDepth(100);
        
        // 웨이브 정보 텍스트
        this.uiElements.waveText = this.add.text(
            this.cameras.main.width - padding,
            padding,
            '',
            {
                fontFamily: 'Arial',
                fontSize: `${window.getScaledFontSize(16)}px`,
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 3,
                align: 'right'
            }
        );
        this.uiElements.waveText.setOrigin(1, 0);
        this.uiElements.waveText.setScrollFactor(0);
        this.uiElements.waveText.setDepth(100);
        
        // 일시정지 버튼
        const pauseButtonSize = window.getScaledValue(40);
        this.uiElements.pauseButton = this.add.rectangle(
            this.cameras.main.width - padding - pauseButtonSize / 2,
            padding * 2 + pauseButtonSize / 2,
            pauseButtonSize,
            pauseButtonSize,
            0x333333,
            0.8
        );
        this.uiElements.pauseButton.setScrollFactor(0);
        this.uiElements.pauseButton.setDepth(100);
        this.uiElements.pauseButton.setInteractive();
        
        // 일시정지 아이콘
        const pauseIconSize = window.getScaledValue(15);
        this.uiElements.pauseIcon = this.add.rectangle(
            this.cameras.main.width - padding - pauseButtonSize / 2,
            padding * 2 + pauseButtonSize / 2,
            pauseIconSize,
            pauseIconSize * 1.3,
            0xffffff
        );
        this.uiElements.pauseIcon.setScrollFactor(0);
        this.uiElements.pauseIcon.setDepth(101);
        
        // 일시정지 버튼 이벤트
        this.uiElements.pauseButton.on('pointerdown', () => {
            this.togglePause();
        });
        
        // 일시정지 버튼 호버 효과
        this.uiElements.pauseButton.on('pointerover', () => {
            this.uiElements.pauseButton.fillColor = 0x555555;
        });
        
        this.uiElements.pauseButton.on('pointerout', () => {
            this.uiElements.pauseButton.fillColor = 0x333333;
        });
        
        // 게임 UI 컨테이너에 추가
        this.uiElements.gameUI.add([
            this.uiElements.healthBarBg,
            this.uiElements.healthBar,
            this.uiElements.healthText,
            this.uiElements.waveText,
            this.uiElements.pauseButton,
            this.uiElements.pauseIcon
        ]);
        
        // 모바일 환경에서 가상 조이스틱 추가
        if (window.gameSettings.isMobile) {
            this.createVirtualJoystick();
        }
        
        // UI 업데이트
        this.updateHealthBar();
        this.updateWaveInfo();
    }
    
    createVirtualJoystick() {
        // 가상 조이스틱 생성
        const joystickRadius = window.getScaledValue(80);
        const joystickX = joystickRadius + window.getScaledValue(30);
        const joystickY = this.cameras.main.height - joystickRadius - window.getScaledValue(30);
        
        // 조이스틱 배경
        this.uiElements.joystickBg = this.add.circle(
            joystickX,
            joystickY,
            joystickRadius,
            0x000000,
            0.5
        );
        this.uiElements.joystickBg.setScrollFactor(0);
        this.uiElements.joystickBg.setDepth(90);
        
        // 조이스틱 핸들
        this.uiElements.joystickHandle = this.add.circle(
            joystickX,
            joystickY,
            joystickRadius / 2,
            0xffffff,
            0.7
        );
        this.uiElements.joystickHandle.setScrollFactor(0);
        this.uiElements.joystickHandle.setDepth(91);
        
        // 조이스틱 상태
        this.joystick = {
            pointer: null,
            position: { x: joystickX, y: joystickY },
            center: { x: joystickX, y: joystickY },
            radius: joystickRadius,
            isActive: false,
            direction: { x: 0, y: 0 }
        };
        
        // 플레이어에게 조이스틱 참조 전달
        if (this.player) {
            this.player.scene.joystick = this.joystick;
        }
        
        // 조이스틱 이벤트 설정
        this.input.on('pointerdown', (pointer) => {
            // 조이스틱 영역 내에서 터치했는지 확인
            const distance = Phaser.Math.Distance.Between(
                pointer.x,
                pointer.y,
                this.joystick.center.x,
                this.joystick.center.y
            );
            
            if (distance <= this.joystick.radius) {
                this.joystick.pointer = pointer;
                this.joystick.isActive = true;
            }
        });
        
        this.input.on('pointermove', (pointer) => {
            if (this.joystick.isActive && this.joystick.pointer && this.joystick.pointer.id === pointer.id) {
                // 조이스틱 위치 계산
                const dx = pointer.x - this.joystick.center.x;
                const dy = pointer.y - this.joystick.center.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                // 방향 벡터 계산
                if (distance > 0) {
                    this.joystick.direction.x = dx / distance;
                    this.joystick.direction.y = dy / distance;
                } else {
                    this.joystick.direction.x = 0;
                    this.joystick.direction.y = 0;
                }
                
                // 조이스틱 핸들 위치 제한
                if (distance > this.joystick.radius) {
                    const angle = Math.atan2(dy, dx);
                    this.joystick.position.x = this.joystick.center.x + Math.cos(angle) * this.joystick.radius;
                    this.joystick.position.y = this.joystick.center.y + Math.sin(angle) * this.joystick.radius;
                } else {
                    this.joystick.position.x = pointer.x;
                    this.joystick.position.y = pointer.y;
                }
                
                // 조이스틱 핸들 업데이트
                this.uiElements.joystickHandle.setPosition(this.joystick.position.x, this.joystick.position.y);
            }
        });
        
        this.input.on('pointerup', (pointer) => {
            if (this.joystick.isActive && this.joystick.pointer && this.joystick.pointer.id === pointer.id) {
                // 조이스틱 초기화
                this.joystick.isActive = false;
                this.joystick.direction.x = 0;
                this.joystick.direction.y = 0;
                this.joystick.position.x = this.joystick.center.x;
                this.joystick.position.y = this.joystick.center.y;
                
                // 조이스틱 핸들 위치 초기화
                this.uiElements.joystickHandle.setPosition(this.joystick.center.x, this.joystick.center.y);
            }
        });
    }
    
    createPauseMenu() {
        // 일시정지 메뉴 컨테이너
        this.uiElements.pauseMenu = this.add.container(0, 0);
        this.uiElements.pauseMenu.setScrollFactor(0);
        this.uiElements.pauseMenu.setDepth(200);
        this.uiElements.pauseMenu.setVisible(false);
        
        const panelWidth = window.getScaledValue(400);
        const panelHeight = window.getScaledValue(300);
        const buttonWidth = window.getScaledValue(300);
        const buttonHeight = window.getScaledValue(60);
        const buttonSpacing = window.getScaledValue(70);
        
        // 배경 패널
        this.uiElements.pauseMenuBg = this.add.rectangle(
            this.cameras.main.centerX,
            this.cameras.main.centerY,
            panelWidth,
            panelHeight,
            0x000000,
            0.8
        );
        
        // 제목 텍스트
        this.uiElements.pauseMenuTitle = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY - window.getScaledValue(100),
            '일시정지',
            {
                fontFamily: 'Arial',
                fontSize: `${window.getScaledFontSize(32)}px`,
                color: '#ffffff'
            }
        );
        this.uiElements.pauseMenuTitle.setOrigin(0.5);
        
        // 계속하기 버튼
        this.uiElements.resumeButton = this.add.rectangle(
            this.cameras.main.centerX,
            this.cameras.main.centerY - window.getScaledValue(20),
            buttonWidth,
            buttonHeight,
            0x4CAF50, // 녹색 계열
            0.9
        );
        this.uiElements.resumeButton.setInteractive({ useHandCursor: true });
        this.uiElements.resumeButton.setStrokeStyle(2, 0xFFFFFF);
        
        // 계속하기 텍스트
        this.uiElements.resumeText = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY - window.getScaledValue(20),
            '계속하기',
            {
                fontFamily: 'Arial',
                fontSize: `${window.getScaledFontSize(28)}px`,
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 2
            }
        );
        this.uiElements.resumeText.setOrigin(0.5);
        
        // 메인 메뉴 버튼
        this.uiElements.mainMenuButton = this.add.rectangle(
            this.cameras.main.centerX,
            this.cameras.main.centerY + window.getScaledValue(50),
            buttonWidth,
            buttonHeight,
            0x2196F3, // 파란색 계열
            0.9
        );
        this.uiElements.mainMenuButton.setInteractive({ useHandCursor: true });
        this.uiElements.mainMenuButton.setStrokeStyle(2, 0xFFFFFF);
        
        // 메인 메뉴 텍스트
        this.uiElements.mainMenuText = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY + window.getScaledValue(50),
            '메인 메뉴로',
            {
                fontFamily: 'Arial',
                fontSize: `${window.getScaledFontSize(28)}px`,
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 2
            }
        );
        this.uiElements.mainMenuText.setOrigin(0.5);
        
        // 버튼 이벤트
        this.uiElements.resumeButton.on('pointerdown', () => {
            this.togglePause();
        });
        
        this.uiElements.mainMenuButton.on('pointerdown', () => {
            console.log('메인 메뉴로 버튼 클릭됨 (일시정지 메뉴)');
            this.returnToMainMenu();
        });
        
        // 버튼 호버 효과
        this.uiElements.resumeButton.on('pointerover', () => {
            this.uiElements.resumeButton.fillColor = 0x66BB6A; // 더 밝은 녹색
            this.uiElements.resumeButton.setScale(1.05);
            this.uiElements.resumeText.setScale(1.05);
        });
        
        this.uiElements.resumeButton.on('pointerout', () => {
            this.uiElements.resumeButton.fillColor = 0x4CAF50; // 원래 녹색
            this.uiElements.resumeButton.setScale(1.0);
            this.uiElements.resumeText.setScale(1.0);
        });
        
        this.uiElements.mainMenuButton.on('pointerover', () => {
            this.uiElements.mainMenuButton.fillColor = 0x42A5F5; // 더 밝은 파란색
            this.uiElements.mainMenuButton.setScale(1.05);
            this.uiElements.mainMenuText.setScale(1.05);
        });
        
        this.uiElements.mainMenuButton.on('pointerout', () => {
            this.uiElements.mainMenuButton.fillColor = 0x2196F3; // 원래 파란색
            this.uiElements.mainMenuButton.setScale(1.0);
            this.uiElements.mainMenuText.setScale(1.0);
        });
        
        // 일시정지 메뉴 컨테이너에 추가
        this.uiElements.pauseMenu.add([
            this.uiElements.pauseMenuBg,
            this.uiElements.pauseMenuTitle,
            this.uiElements.resumeButton,
            this.uiElements.resumeText,
            this.uiElements.mainMenuButton,
            this.uiElements.mainMenuText
        ]);
    }
    
    createGameOverScreen() {
        // 게임 오버 화면 컨테이너
        this.uiElements.gameOverScreen = this.add.container(0, 0);
        this.uiElements.gameOverScreen.setScrollFactor(0);
        this.uiElements.gameOverScreen.setDepth(200);
        this.uiElements.gameOverScreen.setVisible(false);
        
        // 배경 패널
        this.uiElements.gameOverBg = this.add.rectangle(
            this.cameras.main.centerX,
            this.cameras.main.centerY,
            500,
            400,
            0x000000,
            0.8
        );
        
        // 게임 오버 텍스트
        this.uiElements.gameOverTitle = this.add.text(
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
        this.uiElements.gameOverTitle.setOrigin(0.5);
        
        // 결과 텍스트
        this.uiElements.gameOverStats = this.add.text(
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
        this.uiElements.gameOverStats.setOrigin(0.5);
        
        // 다시 시작 버튼
        this.uiElements.restartButton = this.add.rectangle(
            this.cameras.main.centerX,
            this.cameras.main.centerY + 80,
            300,
            60,
            0x4CAF50, // 녹색 계열
            0.9
        );
        this.uiElements.restartButton.setInteractive({ useHandCursor: true });
        this.uiElements.restartButton.setStrokeStyle(2, 0xFFFFFF);
        
        // 다시 시작 텍스트
        this.uiElements.restartText = this.add.text(
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
        this.uiElements.restartText.setOrigin(0.5);
        
        // 메인 메뉴 버튼
        this.uiElements.gameOverMenuButton = this.add.rectangle(
            this.cameras.main.centerX,
            this.cameras.main.centerY + 150,
            300,
            60,
            0x2196F3, // 파란색 계열
            0.9
        );
        this.uiElements.gameOverMenuButton.setInteractive({ useHandCursor: true });
        this.uiElements.gameOverMenuButton.setStrokeStyle(2, 0xFFFFFF);
        
        // 메인 메뉴 텍스트
        this.uiElements.gameOverMenuText = this.add.text(
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
        this.uiElements.gameOverMenuText.setOrigin(0.5);
        
        // 버튼 이벤트
        this.uiElements.restartButton.on('pointerdown', () => {
            console.log('다시 시작 버튼 클릭됨');
            this.restartGame();
        });
        
        this.uiElements.gameOverMenuButton.on('pointerdown', () => {
            console.log('메인 메뉴로 버튼 클릭됨');
            this.returnToMainMenu();
        });
        
        // 버튼 호버 효과
        this.uiElements.restartButton.on('pointerover', () => {
            this.uiElements.restartButton.fillColor = 0x66BB6A; // 더 밝은 녹색
            this.uiElements.restartButton.setScale(1.05);
            this.uiElements.restartText.setScale(1.05);
        });
        
        this.uiElements.restartButton.on('pointerout', () => {
            this.uiElements.restartButton.fillColor = 0x4CAF50; // 원래 녹색
            this.uiElements.restartButton.setScale(1.0);
            this.uiElements.restartText.setScale(1.0);
        });
        
        this.uiElements.gameOverMenuButton.on('pointerover', () => {
            this.uiElements.gameOverMenuButton.fillColor = 0x42A5F5; // 더 밝은 파란색
            this.uiElements.gameOverMenuButton.setScale(1.05);
            this.uiElements.gameOverMenuText.setScale(1.05);
        });
        
        this.uiElements.gameOverMenuButton.on('pointerout', () => {
            this.uiElements.gameOverMenuButton.fillColor = 0x2196F3; // 원래 파란색
            this.uiElements.gameOverMenuButton.setScale(1.0);
            this.uiElements.gameOverMenuText.setScale(1.0);
        });
        
        // 게임 오버 화면 컨테이너에 추가
        this.uiElements.gameOverScreen.add([
            this.uiElements.gameOverBg,
            this.uiElements.gameOverTitle,
            this.uiElements.gameOverStats,
            this.uiElements.restartButton,
            this.uiElements.restartText,
            this.uiElements.gameOverMenuButton,
            this.uiElements.gameOverMenuText
        ]);
        
        // 모든 요소의 초기 알파값 설정 (애니메이션을 위해)
        this.uiElements.gameOverScreen.each(child => {
            child.setAlpha(1); // 초기 알파값을 1로 설정
        });
    }
    
    setupInput() {
        // 커서 키 설정
        this.cursors = this.input.keyboard.createCursorKeys();
        
        // 플레이어 객체에 커서 참조 전달
        if (this.player) {
            this.player.scene.cursors = this.cursors;
        }
        
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
        // 게임 오버 또는 일시정지 상태에서는 업데이트 중지
        if (this.gameOver || this.gamePaused) return;
        
        // 플레이어 업데이트
        if (this.player) {
            this.player.update(time, delta);
        }
        
        // 적 업데이트
        this.enemies.getChildren().forEach(enemy => {
            enemy.update(time, delta);
        });
        
        // 배경 스크롤 효과 - 부드럽게 조정
        if (this.player && this.background) {
            // 플레이어 속도에 따른 배경 스크롤 속도 감소
            const scrollFactor = 0.005; // 스크롤 속도 감소 (0.01 -> 0.005)
            this.background.tilePositionX += this.player.body.velocity.x * scrollFactor;
            this.background.tilePositionY += this.player.body.velocity.y * scrollFactor;
        }
        
        // 바닥 타일 업데이트
        this.updateBackgroundTiles();
        
        // UI 업데이트
        this.updateHealthBar();
        this.updateWaveInfo();
    }
    
    updateUI() {
        // 체력 바 업데이트
        this.updateHealthBar();
        
        // 웨이브 정보 업데이트
        this.updateWaveInfo();
    }
    
    updateHealthBar() {
        if (!this.player || !this.uiElements.healthBar) return;
        
        const barWidth = window.getScaledValue(200);
        const healthPercent = this.player.health / this.player.maxHealth;
        const healthBarWidth = barWidth * healthPercent;
        
        this.uiElements.healthBar.width = healthBarWidth;
        this.uiElements.healthText.setText(`${this.player.health}/${this.player.maxHealth}`);
    }
    
    updateWaveInfo() {
        if (!this.enemySpawner || !this.uiElements.waveText) return;
        
        const waveInfo = `웨이브: ${this.enemySpawner.currentWave}\n적 처치: ${this.enemySpawner.enemiesKilled}`;
        this.uiElements.waveText.setText(waveInfo);
    }
    
    updateSurvivalTime() {
        // 생존 시간 증가
        this.survivalTime++;
        
        // 성취 시스템 업데이트
        this.achievementSystem.updateAchievements('survivalTime', { time: this.survivalTime });
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
        
        // 타일 재배치 - 부드럽게 처리
        this.groundTiles.forEach(tile => {
            // 타일이 화면 밖으로 나갔는지 확인
            if (tile.x < cameraBounds.left || 
                tile.x > cameraBounds.right || 
                tile.y < cameraBounds.top || 
                tile.y > cameraBounds.bottom) {
                
                // 새 위치 계산 - 타일 크기의 배수로 이동하여 정확히 배치
                let newX = tile.x;
                let newY = tile.y;
                
                if (tile.x < cameraBounds.left) {
                    const tilesX = Math.ceil((cameraBounds.right - cameraBounds.left) / tileSize);
                    newX += tileSize * tilesX;
                } else if (tile.x > cameraBounds.right) {
                    const tilesX = Math.ceil((cameraBounds.right - cameraBounds.left) / tileSize);
                    newX -= tileSize * tilesX;
                }
                
                if (tile.y < cameraBounds.top) {
                    const tilesY = Math.ceil((cameraBounds.bottom - cameraBounds.top) / tileSize);
                    newY += tileSize * tilesY;
                } else if (tile.y > cameraBounds.bottom) {
                    const tilesY = Math.ceil((cameraBounds.bottom - cameraBounds.top) / tileSize);
                    newY -= tileSize * tilesY;
                }
                
                // 타일 위치 업데이트
                tile.x = newX;
                tile.y = newY;
            }
        });
    }
    
    handlePlayerEnemyCollision(player, enemy) {
        // 플레이어가 무적 상태면 충돌 무시
        if (player.invulnerable) return;
        
        // 플레이어 데미지 적용
        player.takeDamage(enemy.damage);
        
        // 플레이어 넉백
        const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, player.x, player.y);
        player.setVelocity(
            Math.cos(angle) * 200,
            Math.sin(angle) * 200
        );
        
        // 0.5초 후 속도 초기화
        this.time.delayedCall(500, () => {
            if (player.active) {
                player.setVelocity(0, 0);
            }
        });
    }
    
    handlePlayerItemCollision(player, item) {
        // 아이템 효과 적용
        item.applyEffect(player);
        
        // 아이템 제거
        item.destroy();
        
        // 성취 시스템 업데이트
        this.achievementSystem.updateAchievements('itemCollected');
        
        // 정령 아이템인 경우 정령 수집 성취 업데이트
        if (item.type === 'spirit') {
            this.achievementSystem.updateAchievements('spiritCollected');
        }
    }
    
    togglePause() {
        // 게임 오버 상태면 리턴
        if (this.gameOver) return;
        
        // 일시정지 토글
        this.gamePaused = !this.gamePaused;
        
        if (this.gamePaused) {
            // 게임 일시정지
            this.physics.pause();
            this.uiElements.pauseMenu.setVisible(true);
            
            // 타이머 일시정지
            if (this.survivalTimer) {
                this.survivalTimer.paused = true;
            }
        } else {
            // 게임 재개
            this.physics.resume();
            this.uiElements.pauseMenu.setVisible(false);
            
            // 타이머 재개
            if (this.survivalTimer) {
                this.survivalTimer.paused = false;
            }
        }
    }
    
    showGameOver() {
        try {
            this.logDebug('게임 오버 화면 표시');
            
            // 게임 오버 상태 설정
            this.gameOver = true;
            
            // 물리 엔진 일시 정지
            this.physics.pause();
            
            // 적 스포너 정지
            if (this.enemySpawner) {
                this.enemySpawner.stop();
            }
            
            // 타이머 정지
            if (this.survivalTimer) {
                this.survivalTimer.remove();
            }
            
            // 생존 시간 계산
            const survivalTimeInSeconds = this.survivalTime || 0;
            const minutes = Math.floor(survivalTimeInSeconds / 60);
            const seconds = survivalTimeInSeconds % 60;
            const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            
            // 게임 오버 통계 업데이트
            if (this.uiElements && this.uiElements.gameOverStats) {
                let statsText = `생존 시간: ${formattedTime}\n`;
                
                // 플레이어 정보가 있는 경우에만 추가
                if (this.player) {
                    const waveInfo = this.enemySpawner ? this.enemySpawner.currentWave : 1;
                    const killCount = this.enemySpawner ? this.enemySpawner.enemiesKilled : 0;
                    
                    statsText += `최대 웨이브: ${waveInfo}\n`;
                    statsText += `처치한 적: ${killCount}\n`;
                    statsText += `플레이어 레벨: ${this.player.level || 1}`;
                } else {
                    statsText += `최대 웨이브: 1\n`;
                    statsText += `처치한 적: 0\n`;
                    statsText += `플레이어 레벨: 1`;
                }
                
                this.uiElements.gameOverStats.setText(statsText);
            }
            
            // 게임 오버 화면 표시 (플레이어 사망 애니메이션 후)
            this.time.delayedCall(1000, () => {
                if (this.uiElements && this.uiElements.gameOverScreen) {
                    // 게임 오버 화면 표시 전에 모든 요소 초기화
                    this.uiElements.gameOverScreen.each(child => {
                        child.setAlpha(0);
                        child.setScale(0.8);
                    });
                    
                    this.uiElements.gameOverScreen.setVisible(true);
                    
                    // 게임 오버 화면 등장 애니메이션
                    this.tweens.add({
                        targets: this.uiElements.gameOverScreen.getAll(),
                        alpha: 1,
                        scale: 1,
                        duration: 500,
                        ease: 'Back.easeOut',
                        onComplete: () => {
                            // 버튼 상호작용 활성화
                            if (this.uiElements.restartButton) {
                                this.uiElements.restartButton.setInteractive({ useHandCursor: true });
                            }
                            if (this.uiElements.gameOverMenuButton) {
                                this.uiElements.gameOverMenuButton.setInteractive({ useHandCursor: true });
                            }
                        }
                    });
                }
            });
            
            // 게임 오버 효과음
            try {
                this.sound.play('game_over');
            } catch (error) {
                console.error('게임 오버 효과음 재생 중 오류:', error);
            }
        } catch (error) {
            console.error('게임 오버 화면 표시 중 오류:', error);
        }
    }
    
    restartGame() {
        try {
            this.logDebug('게임 재시작 시도');
            
            // 게임 오버 화면 숨기기
            if (this.uiElements && this.uiElements.gameOverScreen) {
                this.uiElements.gameOverScreen.setVisible(false);
            }
            
            // 일시정지 메뉴 숨기기
            if (this.uiElements && this.uiElements.pauseMenu) {
                this.uiElements.pauseMenu.setVisible(false);
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
            this.scene.restart({ difficulty: this.difficulty });
        } catch (error) {
            console.error('게임 재시작 중 오류:', error);
            this.logDebug('게임 재시작 오류: ' + error.message);
            
            // 오류가 발생해도 씬 재시작 시도
            this.scene.restart({ difficulty: this.difficulty });
        }
    }
    
    returnToMainMenu() {
        try {
            this.logDebug('메인 메뉴로 돌아가기 시도');
            
            // 게임 오버 화면 숨기기
            if (this.uiElements && this.uiElements.gameOverScreen) {
                this.uiElements.gameOverScreen.setVisible(false);
            }
            
            // 일시정지 메뉴 숨기기
            if (this.uiElements && this.uiElements.pauseMenu) {
                this.uiElements.pauseMenu.setVisible(false);
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
            try {
                this.scene.start('MainMenuScene');
            } catch (e) {
                console.error('메인 메뉴 전환 2차 오류:', e);
                // 최후의 수단으로 씬 재시작
                window.location.reload();
            }
        }
    }

    // 난이도 표시기 생성
    showDifficultyIndicator() {
        const difficultyText = {
            'easy': '쉬움',
            'normal': '보통',
            'hard': '어려움'
        };
        
        const difficultyColors = {
            'easy': '#00ff00',
            'normal': '#ffff00',
            'hard': '#ff0000'
        };
        
        // 난이도 표시 텍스트
        const text = this.add.text(
            this.cameras.main.width - 10,
            10,
            `난이도: ${difficultyText[this.difficulty]}`,
            {
                font: '16px Arial',
                fill: difficultyColors[this.difficulty]
            }
        ).setOrigin(1, 0);
        
        // 3초 후 페이드 아웃
        this.time.delayedCall(3000, () => {
            this.tweens.add({
                targets: text,
                alpha: 0,
                duration: 1000,
                ease: 'Power2'
            });
        });
    }

    // 성취 버튼 생성
    createAchievementButton() {
        // 성취 버튼 배경
        const achievementButton = this.add.circle(
            this.cameras.main.width - 30,
            70,
            20,
            0xffff00,
            1
        );
        achievementButton.setScrollFactor(0);
        this.uiElements.achievementButton = achievementButton;
        achievementButton.setDepth(100);
        achievementButton.setInteractive();
        
        // 성취 버튼 아이콘
        const achievementIcon = this.add.text(
            this.cameras.main.width - 30,
            70,
            '★',
            {
                font: '24px Arial',
                fill: '#000000'
            }
        ).setOrigin(0.5);
        achievementIcon.setScrollFactor(0);
        achievementIcon.setDepth(100);
        
        // 버튼 클릭 이벤트
        achievementButton.on('pointerdown', () => {
            this.showAchievementUI();
        });
        
        // 버튼 호버 효과
        achievementButton.on('pointerover', () => {
            achievementButton.setScale(1.2);
            achievementIcon.setScale(1.2);
        });
        
        achievementButton.on('pointerout', () => {
            achievementButton.setScale(1);
            achievementIcon.setScale(1);
        });
    }
    
    // 성취 UI 표시
    showAchievementUI() {
        // 게임 일시정지
        if (!this.gamePaused) {
            this.togglePause();
        }
        
        // 성취 UI 표시
        this.achievementSystem.showAchievementUI();
    }

    // 적 처치 이벤트 처리
    onEnemyKilled(enemy) {
        // 성취 시스템 업데이트
        this.achievementSystem.updateAchievements('enemyKilled', { enemyType: enemy.type });
    }
    
    // 레벨업 이벤트 처리
    onLevelUp(level) {
        // 성취 시스템 업데이트
        this.achievementSystem.updateAchievements('levelUp', { level: level });
    }
    
    // 정령 업그레이드 이벤트 처리
    onSpiritUpgraded() {
        // 성취 시스템 업데이트
        this.achievementSystem.updateAchievements('spiritUpgraded');
    }

    // 화면 크기 변경 처리
    handleResize(gameSize) {
        if (!this.uiElements) return;
        
        const width = gameSize.width || this.cameras.main.width;
        const height = gameSize.height || this.cameras.main.height;
        
        // 배경 크기 조정
        if (this.background) {
            this.background.setSize(width, height);
        }
        
        // 게임 UI 위치 조정
        if (this.uiElements.gameUI) {
            const padding = window.getScaledValue(20);
            const barWidth = window.getScaledValue(200);
            const barHeight = window.getScaledValue(20);
            const pauseButtonSize = window.getScaledValue(40);
            const pauseIconSize = window.getScaledValue(15);
            
            // 체력 바 위치 조정
            if (this.uiElements.healthBarBg) {
                this.uiElements.healthBarBg.setPosition(padding + barWidth / 2, padding + barHeight / 2);
                this.uiElements.healthBarBg.setSize(barWidth, barHeight);
            }
            
            if (this.uiElements.healthBar) {
                this.uiElements.healthBar.setPosition(padding, padding + barHeight / 2);
                this.updateHealthBar(); // 체력 바 너비 업데이트
            }
            
            if (this.uiElements.healthText) {
                this.uiElements.healthText.setPosition(padding + barWidth / 2, padding + barHeight / 2);
                this.uiElements.healthText.setFontSize(window.getScaledFontSize(14));
            }
            
            // 웨이브 정보 위치 조정
            if (this.uiElements.waveText) {
                this.uiElements.waveText.setPosition(width - padding, padding);
                this.uiElements.waveText.setFontSize(window.getScaledFontSize(16));
            }
            
            // 일시정지 버튼 위치 조정
            if (this.uiElements.pauseButton) {
                this.uiElements.pauseButton.setPosition(
                    width - padding - pauseButtonSize / 2,
                    padding * 2 + pauseButtonSize / 2
                );
                this.uiElements.pauseButton.setSize(pauseButtonSize, pauseButtonSize);
            }
            
            if (this.uiElements.pauseIcon) {
                this.uiElements.pauseIcon.setPosition(
                    width - padding - pauseButtonSize / 2,
                    padding * 2 + pauseButtonSize / 2
                );
                this.uiElements.pauseIcon.setSize(pauseIconSize, pauseIconSize * 1.3);
            }
            
            // 모바일 조이스틱 위치 조정
            if (window.gameSettings.isMobile && this.uiElements.joystickBg) {
                const joystickRadius = window.getScaledValue(80);
                const joystickX = joystickRadius + window.getScaledValue(30);
                const joystickY = height - joystickRadius - window.getScaledValue(30);
                
                this.uiElements.joystickBg.setPosition(joystickX, joystickY);
                this.uiElements.joystickBg.setRadius(joystickRadius);
                
                this.uiElements.joystickHandle.setPosition(joystickX, joystickY);
                this.uiElements.joystickHandle.setRadius(joystickRadius / 2);
                
                // 조이스틱 상태 업데이트
                this.joystick.center.x = joystickX;
                this.joystick.center.y = joystickY;
                this.joystick.position.x = joystickX;
                this.joystick.position.y = joystickY;
                this.joystick.radius = joystickRadius;
            }
        }
        
        // 일시정지 메뉴 위치 조정
        if (this.uiElements.pauseMenu) {
            const panelWidth = window.getScaledValue(400);
            const panelHeight = window.getScaledValue(300);
            const buttonWidth = window.getScaledValue(300);
            const buttonHeight = window.getScaledValue(60);
            
            if (this.uiElements.pauseMenuBg) {
                this.uiElements.pauseMenuBg.setPosition(width / 2, height / 2);
                this.uiElements.pauseMenuBg.setSize(panelWidth, panelHeight);
            }
            
            if (this.uiElements.pauseMenuTitle) {
                this.uiElements.pauseMenuTitle.setPosition(width / 2, height / 2 - window.getScaledValue(100));
                this.uiElements.pauseMenuTitle.setFontSize(window.getScaledFontSize(32));
            }
            
            if (this.uiElements.resumeButton) {
                this.uiElements.resumeButton.setPosition(width / 2, height / 2 - window.getScaledValue(20));
                this.uiElements.resumeButton.setSize(buttonWidth, buttonHeight);
            }
            
            if (this.uiElements.resumeText) {
                this.uiElements.resumeText.setPosition(width / 2, height / 2 - window.getScaledValue(20));
                this.uiElements.resumeText.setFontSize(window.getScaledFontSize(28));
            }
            
            if (this.uiElements.mainMenuButton) {
                this.uiElements.mainMenuButton.setPosition(width / 2, height / 2 + window.getScaledValue(50));
                this.uiElements.mainMenuButton.setSize(buttonWidth, buttonHeight);
            }
            
            if (this.uiElements.mainMenuText) {
                this.uiElements.mainMenuText.setPosition(width / 2, height / 2 + window.getScaledValue(50));
                this.uiElements.mainMenuText.setFontSize(window.getScaledFontSize(28));
            }
        }
        
        // 게임 오버 화면 위치 조정
        if (this.uiElements.gameOverScreen) {
            // 게임 오버 화면 요소들의 위치 조정 코드 추가
        }
    }
}

module.exports = { GameScene };