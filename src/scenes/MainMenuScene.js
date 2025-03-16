class MainMenuScene extends Phaser.Scene {
    constructor() {
        super('MainMenuScene');
        this.logDebug('MainMenuScene 생성됨');
        this.selectedDifficulty = 'normal'; // 기본 난이도 설정
        this.selectedElement = 'fire'; // 기본 속성 설정
        this.uiElements = {}; // UI 요소 저장 객체
        
        // 업적 시스템 참조 저장
        this.achievementSystem = null;
    }

    // 디버그 로그 헬퍼 함수
    logDebug(message) {
        console.log(message);
        if (typeof window.debugLog === 'function') {
            window.debugLog(message);
        }
    }

    create() {
        try {
            this.logDebug('MainMenuScene create 시작');
            
            // 배경색 설정
            this.cameras.main.setBackgroundColor('#1e2a3a');
            
            // 업적 시스템 초기화
            try {
                const AchievementSystem = require('../systems/AchievementSystem').AchievementSystem;
                this.achievementSystem = new AchievementSystem(this);
                this.logDebug('업적 시스템 초기화 완료');
            } catch (error) {
                console.error('업적 시스템 초기화 중 오류 발생:', error);
                this.logDebug('업적 시스템 초기화 오류: ' + error.message);
            }
            
            // UI 요소 생성
            this.createUI();
            
            // 화면 크기 변경 이벤트 리스너 등록
            this.scale.on('resize', this.handleResize, this);
            
            // 전체 화면 전환 버튼 추가
            this.createFullscreenButton();
            
            // 업적 버튼 추가
            this.createAchievementButton();
            
            // BGM 재생
            try {
                if (!this.sound.get('bgm')) {
                    this.logDebug('BGM 재생 시작');
                    this.sound.add('bgm', { loop: true, volume: 0.5 }).play();
                }
            } catch (error) {
                console.error('BGM 재생 중 오류 발생:', error);
                this.logDebug('BGM 재생 오류: ' + error.message);
            }
            
            this.logDebug('MainMenuScene create 완료');
        } catch (error) {
            console.error('MainMenuScene create 중 오류 발생:', error);
            this.logDebug('MainMenuScene create 오류: ' + error.message);
        }
    }
    
    createUI() {
        // 배경 추가
        this.uiElements.background = this.add.image(
            this.cameras.main.width / 2, 
            this.cameras.main.height / 2, 
            'background'
        );
        this.uiElements.background.setDisplaySize(
            this.cameras.main.width,
            this.cameras.main.height
        );
        
        // 타이틀 컨테이너 추가
        const titleY = this.cameras.main.height * 0.10;
        this.uiElements.titleContainer = this.add.container(
            this.cameras.main.width / 2,
            titleY
        );
        
        // 타이틀 배경
        const titleBg = this.add.graphics();
        titleBg.fillStyle(0x3498db, 0.8);
        titleBg.fillRoundedRect(-250, -40, 500, 80, 20);
        titleBg.lineStyle(4, 0x2980b9, 1);
        titleBg.strokeRoundedRect(-250, -40, 500, 80, 20);
        this.uiElements.titleContainer.add(titleBg);
        
        // 타이틀 텍스트
        const titleText = this.add.text(
            0, 
            0, 
            '정령 키우기 게임', 
            {
                fontFamily: 'Noto Sans KR, Arial, sans-serif',
                fontSize: `${window.getScaledFontSize(36)}px`,
                fontWeight: 'bold',
                fill: '#ffffff',
                stroke: '#2c3e50',
                strokeThickness: 4
            }
        ).setOrigin(0.5);
        this.uiElements.titleContainer.add(titleText);
        
        // 게임 설명 텍스트
        const descriptionText = [
            '- 레벨업 시 능력을 강화할 수 있습니다',
            '- 다양한 속성의 정령을 선택할 수 있습니다',
            '- 각 속성마다 고유한 능력이 있습니다'
        ];
        
        // 설명 컨테이너 추가
        const descY = this.cameras.main.height * 0.26;
        this.uiElements.descContainer = this.add.container(
            this.cameras.main.width / 2,
            descY
        );
        
        // 설명 배경
        const descBg = this.add.graphics();
        descBg.fillStyle(0x34495e, 0.7);
        descBg.fillRoundedRect(-300, -70, 600, 140, 15);
        descBg.lineStyle(2, 0x2c3e50, 1);
        descBg.strokeRoundedRect(-300, -70, 600, 140, 15);
        this.uiElements.descContainer.add(descBg);
        
        // 스크롤 화살표 배경 추가
        const arrowBg = this.add.graphics();
        arrowBg.fillStyle(0x2c3e50, 0.9);
        arrowBg.fillRoundedRect(250, -70, 50, 140, 10);
        this.uiElements.descContainer.add(arrowBg);
        
        // 설명 텍스트 마스크 생성 (스크롤 영역 제한)
        const maskGraphics = this.add.graphics();
        maskGraphics.fillRect(
            this.cameras.main.width / 2 - 290,
            descY - 60,
            530, // 화살표 영역을 제외한 너비
            120
        );
        const mask = new Phaser.Display.Masks.GeometryMask(this, maskGraphics);
        
        // 설명 텍스트 추가
        this.uiElements.description = this.add.text(
            -20, // 화살표 영역을 고려하여 왼쪽으로 이동
            -50,
            descriptionText,
            {
                fontFamily: 'Noto Sans KR, Arial, sans-serif',
                fontSize: `${window.getScaledFontSize(16)}px`,
                fill: '#ffffff',
                align: 'center',
                lineSpacing: 15
            }
        ).setOrigin(0.5, 0);
        
        // 마스크 적용
        this.uiElements.description.setMask(mask);
        this.uiElements.descContainer.add(this.uiElements.description);
        
        // 스크롤 화살표 추가
        this.uiElements.scrollUpArrow = this.add.text(
            275,
            -40,
            '▲',
            {
                fontFamily: 'Arial',
                fontSize: `${window.getScaledFontSize(24)}px`,
                fill: '#ffffff'
            }
        ).setOrigin(0.5);
        this.uiElements.scrollUpArrow.setInteractive({ useHandCursor: true });
        this.uiElements.descContainer.add(this.uiElements.scrollUpArrow);
        
        this.uiElements.scrollDownArrow = this.add.text(
            275,
            40,
            '▼',
            {
                fontFamily: 'Arial',
                fontSize: `${window.getScaledFontSize(24)}px`,
                fill: '#ffffff'
            }
        ).setOrigin(0.5);
        this.uiElements.scrollDownArrow.setInteractive({ useHandCursor: true });
        this.uiElements.descContainer.add(this.uiElements.scrollDownArrow);
        
        // 스크롤 이벤트 처리
        this.uiElements.scrollUpArrow.on('pointerdown', () => {
            if (this.uiElements.description.y < -50) {
                this.uiElements.description.y += 20;
            }
        });
        
        this.uiElements.scrollDownArrow.on('pointerdown', () => {
            const textHeight = this.uiElements.description.height;
            const visibleHeight = 120;
            if (this.uiElements.description.y > -textHeight + visibleHeight) {
                this.uiElements.description.y -= 20;
            }
        });
        
        // 스크롤 화살표 호버 효과
        this.uiElements.scrollUpArrow.on('pointerover', () => {
            this.uiElements.scrollUpArrow.setScale(1.2);
            this.uiElements.scrollUpArrow.setTint(0xffff00);
        });
        
        this.uiElements.scrollUpArrow.on('pointerout', () => {
            this.uiElements.scrollUpArrow.setScale(1);
            this.uiElements.scrollUpArrow.clearTint();
        });
        
        this.uiElements.scrollDownArrow.on('pointerover', () => {
            this.uiElements.scrollDownArrow.setScale(1.2);
            this.uiElements.scrollDownArrow.setTint(0xffff00);
        });
        
        this.uiElements.scrollDownArrow.on('pointerout', () => {
            this.uiElements.scrollDownArrow.setScale(1);
            this.uiElements.scrollDownArrow.clearTint();
        });
        
        // 난이도 선택 섹션 추가
        this.createDifficultySection();
        
        // 속성 선택 섹션 추가
        this.createElementSection();
        
        // 시작 버튼 추가
        this.createStartButton();
    }
    
    createDifficultySection() {
        // 난이도 선택 컨테이너
        const diffY = this.cameras.main.height * 0.45;
        this.uiElements.difficultyContainer = this.add.container(
            this.cameras.main.width / 2,
            diffY
        );
        
        // 난이도 선택 배경
        const diffBg = this.add.graphics();
        diffBg.fillStyle(0x2980b9, 0.7);
        diffBg.fillRoundedRect(-300, -50, 600, 100, 15);
        diffBg.lineStyle(2, 0x2c3e50, 1);
        diffBg.strokeRoundedRect(-300, -50, 600, 100, 15);
        this.uiElements.difficultyContainer.add(diffBg);
        
        // 난이도 선택 제목
        const diffTitle = this.add.text(
            0,
            -30,
            '난이도 선택',
            {
                fontFamily: 'Noto Sans KR, Arial, sans-serif',
                fontSize: `${window.getScaledFontSize(20)}px`,
                fontWeight: 'bold',
                fill: '#ffffff'
            }
        ).setOrigin(0.5);
        this.uiElements.difficultyContainer.add(diffTitle);
        
        // 난이도 버튼 추가
        const buttonWidth = 150;
        const spacing = 30;
        const totalWidth = (buttonWidth * 3) + (spacing * 2);
        const startX = -(totalWidth / 2) + (buttonWidth / 2);
        
        this.createDifficultyButton('쉬움', startX, 20, 'easy');
        this.createDifficultyButton('보통', startX + buttonWidth + spacing, 20, 'normal');
        this.createDifficultyButton('어려움', startX + (buttonWidth + spacing) * 2, 20, 'hard');
    }
    
    // 난이도 버튼 생성 함수
    createDifficultyButton(text, x, y, difficulty) {
        // 버튼 컨테이너 생성
        const buttonContainer = this.add.container(x, y);
        
        // 버튼 배경 생성
        const buttonBg = this.add.graphics();
        buttonBg.fillStyle(0x3498db, 0.7);
        buttonBg.fillRoundedRect(-70, -28, 140, 56, 10);
        buttonBg.lineStyle(2, 0x2980b9, 1);
        buttonBg.strokeRoundedRect(-70, -28, 140, 56, 10);
        buttonContainer.add(buttonBg);
        
        // 버튼 텍스트 생성
        const buttonText = this.add.text(0, 0, text, {
            fontFamily: 'Noto Sans KR, Arial, sans-serif',
            fontSize: `${window.getScaledFontSize(20)}px`,
            fontWeight: 'bold',
            fill: '#ffffff'
        }).setOrigin(0.5);
        buttonContainer.add(buttonText);
        
        // 선택 표시기 생성
        const selectedIndicator = this.add.graphics();
        selectedIndicator.fillStyle(0xf1c40f, 1);
        selectedIndicator.fillCircle(0, 33, 6);
        selectedIndicator.visible = difficulty === this.selectedDifficulty;
        buttonContainer.add(selectedIndicator);
        
        // 버튼 상호작용 설정
        buttonContainer.setInteractive(new Phaser.Geom.Rectangle(-70, -28, 140, 56), Phaser.Geom.Rectangle.Contains);
        
        // 버튼 클릭 이벤트
        buttonContainer.on('pointerdown', () => {
            this.logDebug(`난이도 선택: ${difficulty}`);
            this.selectedDifficulty = difficulty;
            
            // 모든 난이도 버튼 선택 표시기 숨기기
            this.hideAllDifficultySelections();
            
            // 현재 버튼 선택 표시기 표시
            selectedIndicator.visible = true;
        });
        
        // 버튼 호버 효과
        buttonContainer.on('pointerover', () => {
            buttonBg.clear();
            buttonBg.fillStyle(0x2980b9, 0.9);
            buttonBg.fillRoundedRect(-70, -28, 140, 56, 10);
            buttonBg.lineStyle(2, 0x2980b9, 1);
            buttonBg.strokeRoundedRect(-70, -28, 140, 56, 10);
            buttonText.setScale(1.05);
        });
        
        buttonContainer.on('pointerout', () => {
            buttonBg.clear();
            buttonBg.fillStyle(0x3498db, 0.7);
            buttonBg.fillRoundedRect(-70, -28, 140, 56, 10);
            buttonBg.lineStyle(2, 0x2980b9, 1);
            buttonBg.strokeRoundedRect(-70, -28, 140, 56, 10);
            buttonText.setScale(1);
        });
        
        // 버튼 객체에 선택 표시기 참조 추가
        buttonContainer.selectedIndicator = selectedIndicator;
        
        // 버튼 컨테이너를 UI 요소에 저장
        if (difficulty === 'easy') {
            this.uiElements.easyButton = buttonContainer;
        } else if (difficulty === 'normal') {
            this.uiElements.normalButton = buttonContainer;
        } else if (difficulty === 'hard') {
            this.uiElements.hardButton = buttonContainer;
        }
        
        this.uiElements.difficultyContainer.add(buttonContainer);
        
        return buttonContainer;
    }
    
    hideAllDifficultySelections() {
        if (this.uiElements.easyButton) this.uiElements.easyButton.selectedIndicator.visible = false;
        if (this.uiElements.normalButton) this.uiElements.normalButton.selectedIndicator.visible = false;
        if (this.uiElements.hardButton) this.uiElements.hardButton.selectedIndicator.visible = false;
    }
    
    // 전체 화면 전환 버튼 생성
    createFullscreenButton() {
        const buttonSize = window.getScaledValue(50);
        const padding = window.getScaledValue(15);
        
        this.uiElements.fullscreenButton = this.add.rectangle(
            padding + buttonSize / 2,
            padding + buttonSize / 2,
            buttonSize,
            buttonSize,
            0x000000,
            0.5
        );
        
        this.uiElements.fullscreenIcon = this.add.text(
            padding + buttonSize / 2,
            padding + buttonSize / 2,
            '⛶',
            {
                font: `${window.getScaledFontSize(28)}px Arial`,
                fill: '#ffffff'
            }
        ).setOrigin(0.5);
        
        this.uiElements.fullscreenButton.setInteractive();
        this.uiElements.fullscreenButton.on('pointerdown', () => {
            if (window.toggleFullscreen) {
                window.toggleFullscreen();
            }
        });
        
        // 호버 효과
        this.uiElements.fullscreenButton.on('pointerover', () => {
            this.uiElements.fullscreenButton.setFillStyle(0x333333, 0.7);
        });
        
        this.uiElements.fullscreenButton.on('pointerout', () => {
            this.uiElements.fullscreenButton.setFillStyle(0x000000, 0.5);
        });
    }
    
    // 화면 크기 변경 처리
    handleResize(gameSize) {
        if (!this.uiElements || !this.uiElements.background) return;
        
        const width = gameSize.width || this.cameras.main.width;
        const height = gameSize.height || this.cameras.main.height;
        
        // 배경 크기 조정
        this.uiElements.background.setPosition(width / 2, height / 2);
        this.uiElements.background.setDisplaySize(width, height);
        
        // 타이틀 위치 조정
        const titleY = height * 0.10;
        this.uiElements.titleContainer.setPosition(width / 2, titleY);
        
        // 설명 텍스트 위치 조정
        const descY = height * 0.26;
        this.uiElements.descContainer.setPosition(width / 2, descY);
        
        // 설명 텍스트 마스크 재생성
        if (this.uiElements.description && this.uiElements.description.mask) {
            const maskGraphics = this.uiElements.description.mask.bitmapMask;
            if (maskGraphics) {
                maskGraphics.clear();
                maskGraphics.fillRect(
                    width / 2 - 290,
                    descY - 60,
                    530, // 화살표 영역을 제외한 너비
                    120
                );
            }
        }
        
        // 스크롤 화살표 위치 조정
        if (this.uiElements.scrollUpArrow) {
            this.uiElements.scrollUpArrow.setPosition(275, -40);
        }
        
        if (this.uiElements.scrollDownArrow) {
            this.uiElements.scrollDownArrow.setPosition(275, 40);
        }
        
        // 난이도 선택 위치 조정
        const diffY = height * 0.45;
        this.uiElements.difficultyContainer.setPosition(width / 2, diffY);
        
        // 속성 선택 위치 조정
        const elemY = height * 0.62;
        this.uiElements.elementContainer.setPosition(width / 2, elemY);
        
        // 시작 버튼 위치 조정
        const startY = height * 0.82;
        this.uiElements.startContainer.setPosition(width / 2, startY);
        
        // 전체 화면 버튼 위치 조정
        const buttonSize = window.getScaledValue(50);
        const padding = window.getScaledValue(15);
        this.uiElements.fullscreenButton.setPosition(
            padding + buttonSize / 2,
            padding + buttonSize / 2
        );
        this.uiElements.fullscreenButton.width = buttonSize;
        this.uiElements.fullscreenButton.height = buttonSize;
        
        this.uiElements.fullscreenIcon.setPosition(
            padding + buttonSize / 2,
            padding + buttonSize / 2
        );
        this.uiElements.fullscreenIcon.setFontSize(window.getScaledFontSize(28));
        
        // 업적 버튼 위치 조정
        if (this.uiElements.achievementButton && this.uiElements.achievementIcon) {
            const fullscreenButtonX = padding + buttonSize / 2;
            const fullscreenButtonY = padding + buttonSize / 2;
            
            this.uiElements.achievementButton.setPosition(
                fullscreenButtonX,
                fullscreenButtonY + buttonSize + padding
            );
            this.uiElements.achievementButton.width = buttonSize;
            this.uiElements.achievementButton.height = buttonSize;
            
            this.uiElements.achievementIcon.setPosition(
                fullscreenButtonX,
                fullscreenButtonY + buttonSize + padding
            );
            this.uiElements.achievementIcon.setFontSize(window.getScaledFontSize(28));
        }
        
        // 버전 정보 위치 조정
        if (this.uiElements.versionText) {
            this.uiElements.versionText.setPosition(
                width - window.getScaledValue(15),
                height - window.getScaledValue(15)
            );
            this.uiElements.versionText.setFontSize(window.getScaledFontSize(16));
        }
    }

    createElementSection() {
        // 속성 선택 컨테이너
        const elemY = this.cameras.main.height * 0.62;
        this.uiElements.elementContainer = this.add.container(
            this.cameras.main.width / 2,
            elemY
        );
        
        // 속성 선택 배경
        const elemBg = this.add.graphics();
        elemBg.fillStyle(0x27ae60, 0.7);
        elemBg.fillRoundedRect(-320, -50, 640, 100, 15);
        elemBg.lineStyle(2, 0x2c3e50, 1);
        elemBg.strokeRoundedRect(-320, -50, 640, 100, 15);
        this.uiElements.elementContainer.add(elemBg);
        
        // 속성 선택 제목
        const elemTitle = this.add.text(
            0,
            -30,
            '속성 선택',
            {
                fontFamily: 'Noto Sans KR, Arial, sans-serif',
                fontSize: `${window.getScaledFontSize(20)}px`,
                fontWeight: 'bold',
                fill: '#ffffff'
            }
        ).setOrigin(0.5);
        this.uiElements.elementContainer.add(elemTitle);
        
        // 속성 버튼 추가
        const buttonWidth = 120;
        const spacing = 20;
        const totalWidth = (buttonWidth * 4) + (spacing * 3);
        const startX = -(totalWidth / 2) + (buttonWidth / 2);
        
        this.createElementButton('불', startX, 20, 'fire');
        this.createElementButton('물', startX + buttonWidth + spacing, 20, 'water');
        this.createElementButton('대지', startX + (buttonWidth + spacing) * 2, 20, 'earth');
        this.createElementButton('바람', startX + (buttonWidth + spacing) * 3, 20, 'wind');
    }
    
    // 속성 버튼 생성 함수
    createElementButton(text, x, y, element) {
        // 버튼 컨테이너 생성
        const buttonContainer = this.add.container(x, y);
        
        // 버튼 배경 생성
        const buttonBg = this.add.graphics();
        buttonBg.fillStyle(0x27ae60, 0.7);
        buttonBg.fillRoundedRect(-60, -28, 120, 56, 10);
        buttonBg.lineStyle(2, 0x2c3e50, 1);
        buttonBg.strokeRoundedRect(-60, -28, 120, 56, 10);
        buttonContainer.add(buttonBg);
        
        // 버튼 텍스트 생성
        const buttonText = this.add.text(0, 0, text, {
            fontFamily: 'Noto Sans KR, Arial, sans-serif',
            fontSize: `${window.getScaledFontSize(20)}px`,
            fontWeight: 'bold',
            fill: '#ffffff'
        }).setOrigin(0.5);
        buttonContainer.add(buttonText);
        
        // 선택 표시기 생성
        const selectedIndicator = this.add.graphics();
        selectedIndicator.fillStyle(0xf1c40f, 1);
        selectedIndicator.fillCircle(0, 33, 6);
        selectedIndicator.visible = element === this.selectedElement;
        buttonContainer.add(selectedIndicator);
        
        // 버튼 상호작용 설정
        buttonContainer.setInteractive(new Phaser.Geom.Rectangle(-60, -28, 120, 56), Phaser.Geom.Rectangle.Contains);
        
        // 버튼 클릭 이벤트
        buttonContainer.on('pointerdown', () => {
            this.logDebug(`속성 선택: ${element}`);
            this.selectedElement = element;
            
            // 모든 속성 버튼 선택 표시기 숨기기
            this.hideAllElementSelections();
            
            // 현재 버튼 선택 표시기 표시
            selectedIndicator.visible = true;
        });
        
        // 버튼 호버 효과
        buttonContainer.on('pointerover', () => {
            buttonBg.clear();
            buttonBg.fillStyle(0x2ecc71, 0.9);
            buttonBg.fillRoundedRect(-60, -28, 120, 56, 10);
            buttonBg.lineStyle(2, 0x2c3e50, 1);
            buttonBg.strokeRoundedRect(-60, -28, 120, 56, 10);
            buttonText.setScale(1.05);
        });
        
        buttonContainer.on('pointerout', () => {
            buttonBg.clear();
            buttonBg.fillStyle(0x27ae60, 0.7);
            buttonBg.fillRoundedRect(-60, -28, 120, 56, 10);
            buttonBg.lineStyle(2, 0x2c3e50, 1);
            buttonBg.strokeRoundedRect(-60, -28, 120, 56, 10);
            buttonText.setScale(1);
        });
        
        // 버튼 객체에 선택 표시기 참조 추가
        buttonContainer.selectedIndicator = selectedIndicator;
        
        // 버튼 컨테이너를 UI 요소에 저장
        if (element === 'fire') {
            this.uiElements.fireButton = buttonContainer;
        } else if (element === 'water') {
            this.uiElements.waterButton = buttonContainer;
        } else if (element === 'earth') {
            this.uiElements.earthButton = buttonContainer;
        } else if (element === 'wind') {
            this.uiElements.windButton = buttonContainer;
        }
        
        this.uiElements.elementContainer.add(buttonContainer);
        
        return buttonContainer;
    }
    
    hideAllElementSelections() {
        if (this.uiElements.fireButton) this.uiElements.fireButton.selectedIndicator.visible = false;
        if (this.uiElements.waterButton) this.uiElements.waterButton.selectedIndicator.visible = false;
        if (this.uiElements.earthButton) this.uiElements.earthButton.selectedIndicator.visible = false;
        if (this.uiElements.windButton) this.uiElements.windButton.selectedIndicator.visible = false;
    }

    createStartButton() {
        // 시작 버튼 컨테이너
        const startY = this.cameras.main.height * 0.82;
        this.uiElements.startContainer = this.add.container(
            this.cameras.main.width / 2,
            startY
        );
        
        // 시작 버튼 배경
        const startBg = this.add.graphics();
        startBg.fillStyle(0xe74c3c, 0.8);
        startBg.fillRoundedRect(-170, -40, 340, 80, 15);
        startBg.lineStyle(3, 0xc0392b, 1);
        startBg.strokeRoundedRect(-170, -40, 340, 80, 15);
        this.uiElements.startContainer.add(startBg);
        
        // 시작 버튼 텍스트
        const startText = this.add.text(
            0,
            0,
            '게임 시작',
            {
                fontFamily: 'Noto Sans KR, Arial, sans-serif',
                fontSize: `${window.getScaledFontSize(28)}px`,
                fontWeight: 'bold',
                fill: '#ffffff',
                stroke: '#c0392b',
                strokeThickness: 2
            }
        ).setOrigin(0.5);
        this.uiElements.startContainer.add(startText);
        
        // 시작 버튼 상호작용 설정
        this.uiElements.startContainer.setInteractive(new Phaser.Geom.Rectangle(-170, -40, 340, 80), Phaser.Geom.Rectangle.Contains);
        
        // 시작 버튼 클릭 이벤트
        this.uiElements.startContainer.on('pointerdown', () => {
            this.logDebug('게임 시작 버튼 클릭됨');
            this.logDebug(`선택된 난이도: ${this.selectedDifficulty}, 선택된 속성: ${this.selectedElement}`);
            
            // 게임 씬으로 전환
            this.scene.start('GameScene', {
                difficulty: this.selectedDifficulty,
                element: this.selectedElement
            });
        });
        
        // 시작 버튼 호버 효과
        this.uiElements.startContainer.on('pointerover', () => {
            startBg.clear();
            startBg.fillStyle(0xc0392b, 0.9);
            startBg.fillRoundedRect(-170, -40, 340, 80, 15);
            startBg.lineStyle(3, 0xc0392b, 1);
            startBg.strokeRoundedRect(-170, -40, 340, 80, 15);
            startText.setScale(1.05);
        });
        
        this.uiElements.startContainer.on('pointerout', () => {
            startBg.clear();
            startBg.fillStyle(0xe74c3c, 0.8);
            startBg.fillRoundedRect(-170, -40, 340, 80, 15);
            startBg.lineStyle(3, 0xc0392b, 1);
            startBg.strokeRoundedRect(-170, -40, 340, 80, 15);
            startText.setScale(1);
        });
        
        // 애니메이션 효과
        this.tweens.add({
            targets: this.uiElements.startContainer,
            scaleX: 1.05,
            scaleY: 1.05,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    createAchievementButton() {
        // 업적 버튼 컨테이너
        const buttonSize = window.getScaledValue(50);
        const padding = window.getScaledValue(15);
        
        // 전체 화면 버튼 위치 가져오기
        const fullscreenButtonX = padding + buttonSize / 2;
        const fullscreenButtonY = padding + buttonSize / 2;
        
        // 업적 버튼은 전체 화면 버튼 아래에 위치
        this.uiElements.achievementButton = this.add.rectangle(
            fullscreenButtonX,
            fullscreenButtonY + buttonSize + padding,
            buttonSize,
            buttonSize,
            0x000000,
            0.5
        );
        
        this.uiElements.achievementIcon = this.add.text(
            fullscreenButtonX,
            fullscreenButtonY + buttonSize + padding,
            '🏆',
            {
                font: `${window.getScaledFontSize(28)}px Arial`,
                fill: '#ffffff'
            }
        ).setOrigin(0.5);
        
        this.uiElements.achievementButton.setInteractive();
        this.uiElements.achievementButton.on('pointerdown', () => {
            this.logDebug('업적 버튼 클릭됨');
            if (this.achievementSystem) {
                this.achievementSystem.showAchievementUI();
            }
        });
        
        // 호버 효과
        this.uiElements.achievementButton.on('pointerover', () => {
            this.uiElements.achievementButton.setFillStyle(0x333333, 0.7);
        });
        
        this.uiElements.achievementButton.on('pointerout', () => {
            this.uiElements.achievementButton.setFillStyle(0x000000, 0.5);
        });
    }

    // 씬 종료 시 정리
    shutdown() {
        console.log('MainMenuScene 정리 시작');
        
        // 이벤트 리스너 제거
        this.scale.off('resize', this.handleResize, this);
        
        // 업적 시스템이 있는 경우 UI 정리
        if (this.achievementSystem) {
            try {
                console.log('MainMenuScene에서 업적 시스템 UI 정리 시작');
                this.achievementSystem.destroyUI();
                console.log('MainMenuScene에서 업적 시스템 UI 정리 완료');
            } catch (error) {
                console.error('MainMenuScene에서 업적 시스템 UI 정리 중 오류 발생:', error);
            }
        } else if (this.scene.get('GameScene') && this.scene.get('GameScene').achievementSystem) {
            try {
                console.log('GameScene의 업적 시스템 UI 정리 시작');
                this.scene.get('GameScene').achievementSystem.destroyUI();
                console.log('GameScene의 업적 시스템 UI 정리 완료');
            } catch (error) {
                console.error('GameScene의 업적 시스템 UI 정리 중 오류 발생:', error);
            }
        }
        
        console.log('MainMenuScene 정리 완료');
    }
}

module.exports = { MainMenuScene }; 