class LevelSystem {
    constructor(scene) {
        this.scene = scene;
        
        // 레벨 시스템 속성
        this.level = 1;
        this.experience = 0;
        this.experienceToNextLevel = 100;
        this.experienceMultiplier = 1.5; // 레벨업 시 필요 경험치 증가 비율
        
        // 레벨업 보상 옵션
        this.rewardOptions = [
            { type: 'health', name: '체력 증가', value: 20, description: '최대 체력이 20 증가합니다.' },
            { type: 'speed', name: '이동속도 증가', value: 10, description: '이동속도가 10% 증가합니다.' },
            { type: 'damage', name: '공격력 증가', value: 5, description: '모든 정령의 공격력이 5 증가합니다.' },
            { type: 'attackSpeed', name: '공격속도 증가', value: 10, description: '모든 정령의 공격속도가 10% 증가합니다.' },
            { type: 'spirit', name: '새로운 정령', value: 1, description: '새로운 정령을 얻습니다.' },
            { type: 'upgrade', name: '정령 강화', value: 1, description: '모든 정령의 레벨이 1 증가합니다.' }
        ];
        
        // UI 요소
        this.experienceBar = null;
        this.levelText = null;
        this.rewardPanel = null;
        this.rewardButtons = [];
        
        // UI 생성
        this.createUI();
    }
    
    createUI() {
        // 경험치 바 배경
        this.experienceBarBg = this.scene.add.rectangle(
            this.scene.cameras.main.centerX,
            30,
            400,
            20,
            0x000000
        );
        this.experienceBarBg.setScrollFactor(0);
        this.experienceBarBg.setDepth(100);
        
        // 경험치 바
        this.experienceBar = this.scene.add.rectangle(
            this.scene.cameras.main.centerX - 200,
            30,
            0,
            16,
            0x00ffff
        );
        this.experienceBar.setOrigin(0, 0.5);
        this.experienceBar.setScrollFactor(0);
        this.experienceBar.setDepth(100);
        
        // 레벨 텍스트
        this.levelText = this.scene.add.text(
            this.scene.cameras.main.centerX,
            30,
            `레벨 ${this.level}`,
            {
                fontFamily: 'Arial',
                fontSize: '16px',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 3
            }
        );
        this.levelText.setOrigin(0.5);
        this.levelText.setScrollFactor(0);
        this.levelText.setDepth(100);
    }
    
    addExperience(amount) {
        // 경험치 추가
        this.experience += amount;
        
        // 경험치 바 업데이트
        this.updateExperienceBar();
        
        // 레벨업 체크
        this.checkLevelUp();
        
        // 경험치 획득 텍스트 표시
        this.showExperienceText(amount);
    }
    
    updateExperienceBar() {
        // 경험치 바 너비 계산
        const width = (this.experience / this.experienceToNextLevel) * 400;
        
        // 경험치 바 업데이트
        this.experienceBar.width = Math.min(400, width);
    }
    
    checkLevelUp() {
        // 레벨업 조건 체크
        if (this.experience >= this.experienceToNextLevel) {
            // 초과 경험치 계산
            const excessExperience = this.experience - this.experienceToNextLevel;
            
            // 레벨 증가
            this.level++;
            
            // 다음 레벨 경험치 계산
            this.experience = excessExperience;
            this.experienceToNextLevel = Math.floor(this.experienceToNextLevel * this.experienceMultiplier);
            
            // 레벨업 효과
            this.levelUpEffect();
            
            // 레벨 텍스트 업데이트
            this.levelText.setText(`레벨 ${this.level}`);
            
            // 경험치 바 업데이트
            this.updateExperienceBar();
            
            // 레벨업 보상 선택 UI 표시
            this.showRewardSelection();
        }
    }
    
    levelUpEffect() {
        // 레벨업 효과음
        try {
            this.scene.sound.play('level_up');
        } catch (error) {
            console.error('레벨업 효과음 재생 중 오류:', error);
        }
        
        // 레벨업 시각 효과
        const effect = this.scene.add.circle(
            this.scene.player.x,
            this.scene.player.y,
            50,
            0x00ffff,
            0.7
        );
        
        // 효과 애니메이션
        this.scene.tweens.add({
            targets: effect,
            scale: 3,
            alpha: 0,
            duration: 1000,
            onComplete: () => {
                effect.destroy();
            }
        });
        
        // 레벨업 텍스트
        const levelUpText = this.scene.add.text(
            this.scene.player.x,
            this.scene.player.y - 50,
            '레벨 업!',
            {
                fontFamily: 'Arial',
                fontSize: '24px',
                color: '#00ffff',
                stroke: '#000000',
                strokeThickness: 4
            }
        );
        levelUpText.setOrigin(0.5);
        
        // 텍스트 애니메이션
        this.scene.tweens.add({
            targets: levelUpText,
            y: levelUpText.y - 100,
            alpha: 0,
            duration: 1500,
            onComplete: () => {
                levelUpText.destroy();
            }
        });
    }
    
    showExperienceText(amount) {
        // 경험치 획득 텍스트
        const expText = this.scene.add.text(
            this.scene.player.x,
            this.scene.player.y - 30,
            `+${amount} EXP`,
            {
                fontFamily: 'Arial',
                fontSize: '16px',
                color: '#00ffff',
                stroke: '#000000',
                strokeThickness: 3
            }
        );
        expText.setOrigin(0.5);
        
        // 텍스트 애니메이션
        this.scene.tweens.add({
            targets: expText,
            y: expText.y - 50,
            alpha: 0,
            duration: 1000,
            onComplete: () => {
                expText.destroy();
            }
        });
    }
    
    showRewardSelection() {
        // 게임 일시 정지
        this.scene.physics.pause();
        
        // 배경 패널
        this.rewardPanel = this.scene.add.rectangle(
            this.scene.cameras.main.centerX,
            this.scene.cameras.main.centerY,
            500,
            400,
            0x000000,
            0.8
        );
        this.rewardPanel.setScrollFactor(0);
        this.rewardPanel.setDepth(1000);
        
        // 제목 텍스트
        const titleText = this.scene.add.text(
            this.scene.cameras.main.centerX,
            this.scene.cameras.main.centerY - 150,
            '레벨 업! 보상을 선택하세요',
            {
                fontFamily: 'Arial',
                fontSize: '24px',
                color: '#ffffff',
                align: 'center'
            }
        );
        titleText.setOrigin(0.5);
        titleText.setScrollFactor(0);
        titleText.setDepth(1001);
        
        // 랜덤 보상 옵션 3개 선택
        const selectedOptions = this.getRandomRewardOptions(3);
        
        // 보상 버튼 생성
        for (let i = 0; i < selectedOptions.length; i++) {
            const option = selectedOptions[i];
            
            // 버튼 배경
            const button = this.scene.add.rectangle(
                this.scene.cameras.main.centerX,
                this.scene.cameras.main.centerY - 50 + (i * 100),
                400,
                80,
                0x333333
            );
            button.setScrollFactor(0);
            button.setDepth(1001);
            button.setInteractive();
            
            // 버튼 텍스트
            const buttonText = this.scene.add.text(
                this.scene.cameras.main.centerX,
                this.scene.cameras.main.centerY - 50 + (i * 100),
                `${option.name}\n${option.description}`,
                {
                    fontFamily: 'Arial',
                    fontSize: '16px',
                    color: '#ffffff',
                    align: 'center'
                }
            );
            buttonText.setOrigin(0.5);
            buttonText.setScrollFactor(0);
            buttonText.setDepth(1002);
            
            // 버튼 클릭 이벤트
            button.on('pointerdown', () => {
                this.applyReward(option);
                this.closeRewardSelection();
            });
            
            // 버튼 호버 효과
            button.on('pointerover', () => {
                button.fillColor = 0x555555;
            });
            
            button.on('pointerout', () => {
                button.fillColor = 0x333333;
            });
            
            // 버튼 저장
            this.rewardButtons.push({ button, text: buttonText });
        }
    }
    
    getRandomRewardOptions(count) {
        // 보상 옵션 복사
        const options = [...this.rewardOptions];
        
        // 정령이 없으면 정령 강화 옵션 제거
        if (this.scene.player.spirits.length === 0) {
            const upgradeIndex = options.findIndex(option => option.type === 'upgrade');
            if (upgradeIndex !== -1) {
                options.splice(upgradeIndex, 1);
            }
        }
        
        // 랜덤 옵션 선택
        const selectedOptions = [];
        
        for (let i = 0; i < count; i++) {
            if (options.length === 0) break;
            
            const randomIndex = Math.floor(Math.random() * options.length);
            selectedOptions.push(options[randomIndex]);
            options.splice(randomIndex, 1);
        }
        
        return selectedOptions;
    }
    
    applyReward(reward) {
        // 보상 적용
        switch (reward.type) {
            case 'health':
                // 체력 증가
                this.scene.player.maxHealth += reward.value;
                this.scene.player.health += reward.value;
                this.showRewardEffect('체력 증가!', 0xff0000);
                break;
                
            case 'speed':
                // 이동속도 증가
                this.scene.player.speed += this.scene.player.speed * (reward.value / 100);
                this.showRewardEffect('이동속도 증가!', 0x00ff00);
                break;
                
            case 'damage':
                // 공격력 증가
                this.scene.player.spirits.forEach(spirit => {
                    spirit.damage += reward.value;
                });
                this.showRewardEffect('공격력 증가!', 0xff8800);
                break;
                
            case 'attackSpeed':
                // 공격속도 증가
                this.scene.player.spirits.forEach(spirit => {
                    // 공격 속도는 밀리초 단위이므로 감소시켜야 함
                    const speedIncrease = spirit.attackSpeed * (reward.value / 100);
                    spirit.attackSpeed = Math.max(200, spirit.attackSpeed - speedIncrease);
                    
                    // 공격 타이머 업데이트
                    spirit.attackTimer.reset({
                        delay: spirit.attackSpeed,
                        callback: spirit.attack,
                        callbackScope: spirit,
                        loop: true
                    });
                });
                this.showRewardEffect('공격속도 증가!', 0x88ff00);
                break;
                
            case 'spirit':
                // 새로운 정령
                const spiritTypes = ['기본 정령', '불 정령', '물 정령', '바람 정령', '땅 정령', '번개 정령'];
                const randomType = spiritTypes[Math.floor(Math.random() * spiritTypes.length)];
                this.scene.player.addSpirit(randomType);
                this.showRewardEffect(`${randomType} 획득!`, 0xffff00);
                break;
                
            case 'upgrade':
                // 모든 정령 강화
                this.scene.player.spirits.forEach(spirit => {
                    spirit.upgrade();
                });
                this.showRewardEffect('모든 정령 강화!', 0xff00ff);
                break;
        }
    }
    
    showRewardEffect(text, color) {
        // 보상 효과 텍스트
        const rewardText = this.scene.add.text(
            this.scene.player.x,
            this.scene.player.y - 50,
            text,
            {
                fontFamily: 'Arial',
                fontSize: '24px',
                color: `#${color.toString(16).padStart(6, '0')}`,
                stroke: '#000000',
                strokeThickness: 4
            }
        );
        rewardText.setOrigin(0.5);
        
        // 텍스트 애니메이션
        this.scene.tweens.add({
            targets: rewardText,
            y: rewardText.y - 100,
            alpha: 0,
            duration: 2000,
            onComplete: () => {
                rewardText.destroy();
            }
        });
    }
    
    closeRewardSelection() {
        // 보상 선택 UI 제거
        if (this.rewardPanel) {
            this.rewardPanel.destroy();
            this.rewardPanel = null;
        }
        
        // 버튼 제거
        this.rewardButtons.forEach(button => {
            button.button.destroy();
            button.text.destroy();
        });
        this.rewardButtons = [];
        
        // 게임 재개
        this.scene.physics.resume();
    }
    
    getCurrentLevelInfo() {
        // 현재 레벨 정보 반환
        return {
            level: this.level,
            experience: this.experience,
            experienceToNextLevel: this.experienceToNextLevel,
            percentage: (this.experience / this.experienceToNextLevel) * 100
        };
    }
}

// 모듈 내보내기
module.exports = { LevelSystem }; 