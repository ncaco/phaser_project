class MainMenuScene extends Phaser.Scene {
    constructor() {
        super('MainMenuScene');
        this.logDebug('MainMenuScene 생성됨');
        this.selectedDifficulty = 'normal'; // 기본 난이도 설정
        this.uiElements = {}; // UI 요소 저장 객체
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
            this.cameras.main.setBackgroundColor('#2c3e50');
            
            // UI 요소 생성
            this.createUI();
            
            // 화면 크기 변경 이벤트 리스너 등록
            this.scale.on('resize', this.handleResize, this);
            
            // 전체 화면 전환 버튼 추가
            this.createFullscreenButton();
            
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
        
        // 타이틀 추가
        const titleY = this.cameras.main.height * 0.15;
        this.uiElements.title = this.add.image(
            this.cameras.main.width / 2, 
            titleY, 
            'title'
        );
        this.uiElements.title.setScale(window.getScaledValue(1.2));
        
        // 게임 설명 텍스트
        const descriptionText = [
            '정령 키우기 게임에 오신 것을 환영합니다!',
            '',
            '- 방향키로 플레이어를 이동합니다',
            '- 정령이 자동으로 적을 공격합니다',
            '- 적을 처치하여 경험치와 아이템을 얻으세요',
            '- 레벨업 시 능력을 강화할 수 있습니다'
        ];
        
        // 설명 텍스트 추가
        const descY = this.cameras.main.height * 0.3;
        this.uiElements.description = this.add.text(
            this.cameras.main.width / 2,
            descY,
            descriptionText,
            {
                font: `${window.getScaledFontSize(18)}px Arial`,
                fill: '#ffffff',
                align: 'center'
            }
        ).setOrigin(0.5);
        
        // 난이도 선택 텍스트 추가
        const difficultyTitleY = this.cameras.main.height * 0.5;
        this.uiElements.difficultyTitle = this.add.text(
            this.cameras.main.width / 2,
            difficultyTitleY,
            '난이도 선택',
            {
                font: `${window.getScaledFontSize(24)}px Arial`,
                fill: '#ffffff',
                align: 'center'
            }
        ).setOrigin(0.5);
        
        // 난이도 버튼 생성
        const buttonY = this.cameras.main.height * 0.6;
        const buttonSpacing = window.getScaledValue(150);
        
        this.uiElements.easyButton = this.createDifficultyButton(
            '쉬움', 
            this.cameras.main.width / 2 - buttonSpacing, 
            buttonY, 
            'easy'
        );
        
        this.uiElements.normalButton = this.createDifficultyButton(
            '보통', 
            this.cameras.main.width / 2, 
            buttonY, 
            'normal'
        );
        
        this.uiElements.hardButton = this.createDifficultyButton(
            '어려움', 
            this.cameras.main.width / 2 + buttonSpacing, 
            buttonY, 
            'hard'
        );
        
        // 시작 버튼 추가
        const startButtonY = this.cameras.main.height * 0.75;
        this.uiElements.startButton = this.add.image(
            this.cameras.main.width / 2, 
            startButtonY, 
            'button'
        );
        this.uiElements.startButton.setScale(window.getScaledValue(1.2));
        
        // 시작 버튼 텍스트
        this.uiElements.startButtonText = this.add.text(
            this.uiElements.startButton.x, 
            this.uiElements.startButton.y, 
            '게임 시작', 
            {
                font: `${window.getScaledFontSize(24)}px Arial`,
                fill: '#ffffff'
            }
        ).setOrigin(0.5);
        
        // 버튼 상호작용 설정
        this.uiElements.startButton.setInteractive();
        
        // 버튼 클릭 이벤트
        this.uiElements.startButton.on('pointerdown', () => {
            this.logDebug(`게임 시작 버튼 클릭됨, 난이도: ${this.selectedDifficulty}, GameScene으로 전환 중...`);
            this.scene.start('GameScene', { difficulty: this.selectedDifficulty });
        });
        
        // 버튼 호버 효과
        this.uiElements.startButton.on('pointerover', () => {
            this.uiElements.startButton.setScale(window.getScaledValue(1.3));
        });
        
        this.uiElements.startButton.on('pointerout', () => {
            this.uiElements.startButton.setScale(window.getScaledValue(1.2));
        });
        
        // 버전 정보
        this.uiElements.versionText = this.add.text(
            this.cameras.main.width - window.getScaledValue(10),
            this.cameras.main.height - window.getScaledValue(10),
            'v1.0.0',
            {
                font: `${window.getScaledFontSize(14)}px Arial`,
                fill: '#ffffff'
            }
        ).setOrigin(1);
        
        // 애니메이션 효과
        this.tweens.add({
            targets: this.uiElements.title,
            y: titleY + window.getScaledValue(10),
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        // 모바일 컨트롤 안내 (모바일 환경에서만 표시)
        if (window.gameSettings.isMobile) {
            this.uiElements.mobileControlsText = this.add.text(
                this.cameras.main.width / 2,
                this.cameras.main.height * 0.9,
                '모바일 환경에서는 화면을 터치하여 이동할 수 있습니다',
                {
                    font: `${window.getScaledFontSize(16)}px Arial`,
                    fill: '#ffffff',
                    align: 'center'
                }
            ).setOrigin(0.5);
        }
    }
    
    // 난이도 버튼 생성 함수
    createDifficultyButton(text, x, y, difficulty) {
        // 버튼 배경 생성
        const button = this.add.image(x, y, 'button');
        button.setScale(window.getScaledValue(0.8));
        
        // 버튼 텍스트 생성
        const buttonText = this.add.text(x, y, text, {
            font: `${window.getScaledFontSize(20)}px Arial`,
            fill: '#ffffff'
        }).setOrigin(0.5);
        
        // 버튼 상호작용 설정
        button.setInteractive();
        
        // 현재 선택된 난이도인지 표시
        if (difficulty === this.selectedDifficulty) {
            button.setTint(0x00ff00); // 선택된 버튼은 녹색으로 표시
        }
        
        // 버튼 클릭 이벤트
        button.on('pointerdown', () => {
            this.logDebug(`난이도 선택: ${difficulty}`);
            this.selectedDifficulty = difficulty;
            
            // 모든 난이도 버튼 색상 초기화
            [this.uiElements.easyButton, this.uiElements.normalButton, this.uiElements.hardButton].forEach(btn => {
                if (btn && btn !== button) {
                    btn.clearTint();
                }
            });
            
            // 선택된 버튼 색상 변경
            button.setTint(0x00ff00);
        });
        
        // 버튼 호버 효과
        button.on('pointerover', () => {
            button.setScale(window.getScaledValue(0.9));
        });
        
        button.on('pointerout', () => {
            button.setScale(window.getScaledValue(0.8));
        });
        
        return button;
    }
    
    // 전체 화면 전환 버튼 생성
    createFullscreenButton() {
        const buttonSize = window.getScaledValue(40);
        const padding = window.getScaledValue(10);
        
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
                font: `${window.getScaledFontSize(24)}px Arial`,
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
        const titleY = height * 0.15;
        this.uiElements.title.setPosition(width / 2, titleY);
        this.uiElements.title.setScale(window.getScaledValue(1.2));
        
        // 설명 텍스트 위치 조정
        this.uiElements.description.setPosition(width / 2, height * 0.3);
        this.uiElements.description.setFontSize(window.getScaledFontSize(18));
        
        // 난이도 선택 텍스트 위치 조정
        this.uiElements.difficultyTitle.setPosition(width / 2, height * 0.5);
        this.uiElements.difficultyTitle.setFontSize(window.getScaledFontSize(24));
        
        // 난이도 버튼 위치 조정
        const buttonY = height * 0.6;
        const buttonSpacing = window.getScaledValue(150);
        
        this.uiElements.easyButton.setPosition(width / 2 - buttonSpacing, buttonY);
        this.uiElements.easyButton.setScale(window.getScaledValue(0.8));
        
        this.uiElements.normalButton.setPosition(width / 2, buttonY);
        this.uiElements.normalButton.setScale(window.getScaledValue(0.8));
        
        this.uiElements.hardButton.setPosition(width / 2 + buttonSpacing, buttonY);
        this.uiElements.hardButton.setScale(window.getScaledValue(0.8));
        
        // 버튼 텍스트 위치 조정
        const buttonTexts = this.children.list.filter(child => 
            child.type === 'Text' && 
            (child.text === '쉬움' || child.text === '보통' || child.text === '어려움')
        );
        
        if (buttonTexts.length >= 3) {
            buttonTexts[0].setPosition(width / 2 - buttonSpacing, buttonY);
            buttonTexts[0].setFontSize(window.getScaledFontSize(20));
            
            buttonTexts[1].setPosition(width / 2, buttonY);
            buttonTexts[1].setFontSize(window.getScaledFontSize(20));
            
            buttonTexts[2].setPosition(width / 2 + buttonSpacing, buttonY);
            buttonTexts[2].setFontSize(window.getScaledFontSize(20));
        }
        
        // 시작 버튼 위치 조정
        const startButtonY = height * 0.75;
        this.uiElements.startButton.setPosition(width / 2, startButtonY);
        this.uiElements.startButton.setScale(window.getScaledValue(1.2));
        
        // 시작 버튼 텍스트 위치 조정
        this.uiElements.startButtonText.setPosition(width / 2, startButtonY);
        this.uiElements.startButtonText.setFontSize(window.getScaledFontSize(24));
        
        // 버전 정보 위치 조정
        this.uiElements.versionText.setPosition(
            width - window.getScaledValue(10),
            height - window.getScaledValue(10)
        );
        this.uiElements.versionText.setFontSize(window.getScaledFontSize(14));
        
        // 전체 화면 버튼 위치 조정
        const buttonSize = window.getScaledValue(40);
        const padding = window.getScaledValue(10);
        
        this.uiElements.fullscreenButton.setPosition(
            padding + buttonSize / 2,
            padding + buttonSize / 2
        );
        this.uiElements.fullscreenButton.setSize(buttonSize, buttonSize);
        
        this.uiElements.fullscreenIcon.setPosition(
            padding + buttonSize / 2,
            padding + buttonSize / 2
        );
        this.uiElements.fullscreenIcon.setFontSize(window.getScaledFontSize(24));
        
        // 모바일 컨트롤 안내 위치 조정 (모바일 환경에서만)
        if (window.gameSettings.isMobile && this.uiElements.mobileControlsText) {
            this.uiElements.mobileControlsText.setPosition(width / 2, height * 0.9);
            this.uiElements.mobileControlsText.setFontSize(window.getScaledFontSize(16));
        }
        
        // 타이틀 애니메이션 업데이트
        this.tweens.killTweensOf(this.uiElements.title);
        this.tweens.add({
            targets: this.uiElements.title,
            y: titleY + window.getScaledValue(10),
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }
}

module.exports = { MainMenuScene }; 