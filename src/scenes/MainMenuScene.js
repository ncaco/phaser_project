class MainMenuScene extends Phaser.Scene {
    constructor() {
        super('MainMenuScene');
        this.logDebug('MainMenuScene 생성됨');
        this.selectedDifficulty = 'normal'; // 기본 난이도 설정
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
            
            // 배경 추가
            this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, 'background');
            
            // 타이틀 추가
            const title = this.add.image(this.cameras.main.width / 2, 120, 'title');
            title.setScale(1.2);
            
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
            const description = this.add.text(
                this.cameras.main.width / 2,
                220,
                descriptionText,
                {
                    font: '18px Arial',
                    fill: '#ffffff',
                    align: 'center'
                }
            ).setOrigin(0.5);
            
            // 난이도 선택 텍스트 추가
            this.add.text(
                this.cameras.main.width / 2,
                320,
                '난이도 선택',
                {
                    font: '24px Arial',
                    fill: '#ffffff',
                    align: 'center'
                }
            ).setOrigin(0.5);
            
            // 난이도 버튼 생성
            this.createDifficultyButton('쉬움', this.cameras.main.width / 2 - 150, 380, 'easy');
            this.createDifficultyButton('보통', this.cameras.main.width / 2, 380, 'normal');
            this.createDifficultyButton('어려움', this.cameras.main.width / 2 + 150, 380, 'hard');
            
            // 시작 버튼 추가
            const startButton = this.add.image(this.cameras.main.width / 2, 460, 'button');
            startButton.setScale(1.2);
            
            // 시작 버튼 텍스트
            this.add.text(startButton.x, startButton.y, '게임 시작', {
                font: '24px Arial',
                fill: '#ffffff'
            }).setOrigin(0.5);
            
            // 버튼 상호작용 설정
            startButton.setInteractive();
            
            // 버튼 클릭 이벤트
            startButton.on('pointerdown', () => {
                this.logDebug(`게임 시작 버튼 클릭됨, 난이도: ${this.selectedDifficulty}, GameScene으로 전환 중...`);
                this.scene.start('GameScene', { difficulty: this.selectedDifficulty });
            });
            
            // 버튼 호버 효과
            startButton.on('pointerover', () => {
                startButton.setScale(1.3);
            });
            
            startButton.on('pointerout', () => {
                startButton.setScale(1.2);
            });
            
            // 버전 정보
            this.add.text(
                this.cameras.main.width - 10,
                this.cameras.main.height - 10,
                'v1.0.0',
                {
                    font: '14px Arial',
                    fill: '#ffffff'
                }
            ).setOrigin(1);
            
            // 애니메이션 효과
            this.tweens.add({
                targets: title,
                y: 130,
                duration: 2000,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
            
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
    
    // 난이도 버튼 생성 함수
    createDifficultyButton(text, x, y, difficulty) {
        // 버튼 배경 생성
        const button = this.add.image(x, y, 'button');
        button.setScale(0.8);
        
        // 버튼 텍스트 생성
        const buttonText = this.add.text(x, y, text, {
            font: '20px Arial',
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
            this.children.list.forEach(child => {
                if (child.type === 'Image' && child !== button && child.texture.key === 'button') {
                    child.clearTint();
                }
            });
            
            // 선택된 버튼 색상 변경
            button.setTint(0x00ff00);
        });
        
        // 버튼 호버 효과
        button.on('pointerover', () => {
            button.setScale(0.9);
        });
        
        button.on('pointerout', () => {
            button.setScale(0.8);
        });
        
        return button;
    }
}

module.exports = { MainMenuScene }; 