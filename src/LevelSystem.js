class LevelSystem {
    constructor(scene) {
        this.scene = scene;
        this.level = 1;
        this.experience = 0;
        this.experienceToNextLevel = 100;
        this.logDebug('LevelSystem 생성됨, 초기 레벨: ' + this.level);
    }

    // 디버그 로그 헬퍼 함수
    logDebug(message) {
        console.log(message);
        if (this.scene && typeof this.scene.logDebug === 'function') {
            this.scene.logDebug(message);
        } else if (typeof window.debugLog === 'function') {
            window.debugLog(message);
        }
    }

    addExperience(amount) {
        try {
            this.logDebug('경험치 추가: ' + amount);
            
            // 경험치 증가
            this.experience += amount;
            
            // 레벨업 체크
            this.checkLevelUp();
        } catch (error) {
            console.error('경험치 추가 중 오류 발생:', error);
            this.logDebug('경험치 추가 오류: ' + error.message);
        }
    }

    checkLevelUp() {
        try {
            // 레벨업 조건 확인
            if (this.experience >= this.experienceToNextLevel) {
                this.levelUp();
            }
        } catch (error) {
            console.error('레벨업 체크 중 오류 발생:', error);
            this.logDebug('레벨업 체크 오류: ' + error.message);
        }
    }

    levelUp() {
        try {
            this.logDebug('레벨업! ' + this.level + ' -> ' + (this.level + 1));
            
            // 레벨 증가
            this.level++;
            
            // 남은 경험치 계산
            this.experience -= this.experienceToNextLevel;
            
            // 다음 레벨 필요 경험치 증가
            this.experienceToNextLevel = Math.floor(this.experienceToNextLevel * 1.5);
            
            // 레벨업 효과 적용
            this.applyLevelUpEffects();
            
            // 레벨업 메시지 표시
            this.showLevelUpMessage();
            
            // 추가 레벨업 체크 (경험치가 충분한 경우 연속 레벨업)
            this.checkLevelUp();
        } catch (error) {
            console.error('레벨업 처리 중 오류 발생:', error);
            this.logDebug('레벨업 처리 오류: ' + error.message);
        }
    }

    applyLevelUpEffects() {
        try {
            this.logDebug('레벨업 효과 적용 중');
            
            // 정령 강화
            if (this.scene.spirit) {
                // 정령 공격력 증가
                if (this.scene.spirit.damage) {
                    this.scene.spirit.damage += 1;
                } else {
                    this.scene.spirit.damage = 2;
                }
                
                // 정령 크기 약간 증가
                const newScale = Math.min(1.5, this.scene.spirit.scale + 0.05);
                this.scene.spirit.setScale(newScale);
                
                this.logDebug('정령 강화: 공격력 증가, 크기 증가');
            }
        } catch (error) {
            console.error('레벨업 효과 적용 중 오류 발생:', error);
            this.logDebug('레벨업 효과 적용 오류: ' + error.message);
        }
    }

    showLevelUpMessage() {
        try {
            this.logDebug('레벨업 메시지 표시');
            
            // 레벨업 텍스트 생성
            const levelUpText = this.scene.add.text(
                this.scene.cameras.main.width / 2,
                this.scene.cameras.main.height / 2 - 50,
                'LEVEL UP!',
                {
                    font: '32px Arial',
                    fill: '#ffff00',
                    stroke: '#000000',
                    strokeThickness: 4
                }
            ).setOrigin(0.5);
            
            // 레벨 표시
            const levelText = this.scene.add.text(
                this.scene.cameras.main.width / 2,
                this.scene.cameras.main.height / 2,
                'Level ' + this.level,
                {
                    font: '24px Arial',
                    fill: '#ffffff',
                    stroke: '#000000',
                    strokeThickness: 3
                }
            ).setOrigin(0.5);
            
            // 애니메이션 효과
            this.scene.tweens.add({
                targets: [levelUpText, levelText],
                alpha: { from: 1, to: 0 },
                y: '-=50',
                ease: 'Power2',
                duration: 2000,
                onComplete: () => {
                    levelUpText.destroy();
                    levelText.destroy();
                }
            });
            
            // 효과음 재생
            try {
                if (this.scene.sound && this.scene.sound.add) {
                    const levelUpSound = this.scene.sound.add('levelup');
                    levelUpSound.play();
                }
            } catch (error) {
                console.error('레벨업 효과음 재생 중 오류 발생:', error);
                this.logDebug('레벨업 효과음 재생 오류: ' + error.message);
            }
        } catch (error) {
            console.error('레벨업 메시지 표시 중 오류 발생:', error);
            this.logDebug('레벨업 메시지 표시 오류: ' + error.message);
        }
    }
}

module.exports = { LevelSystem }; 