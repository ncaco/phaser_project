class LevelSystem {
    constructor(scene) {
        this.scene = scene;
        
        // 레벨 시스템 속성
        this.level = 1;
        this.experience = 0;
        this.maxExperience = 100;
        
        // 레벨업 보상 옵션
        this.rewardOptions = [
            { name: '체력 회복', description: '체력을 50% 회복합니다.' },
            { name: '최대 체력 증가', description: '최대 체력을 20 증가시킵니다.' },
            { name: '이동 속도 증가', description: '이동 속도를 10% 증가시킵니다.' },
            { name: '새 정령 획득', description: '새로운 정령을 획득합니다.' },
            { name: '정령 강화', description: '모든 정령의 공격력을 10% 증가시킵니다.' }
        ];
    }

    addExperience(amount) {
        // 경험치 추가
        this.experience += amount;
        
        // 경험치 업데이트 이벤트 발생
        this.scene.events.emit('expUpdate', this.experience, this.maxExperience);
        
        // 레벨업 체크
        this.checkLevelUp();
    }

    checkLevelUp() {
        // 경험치가 최대 경험치를 넘으면 레벨업
        if (this.experience >= this.maxExperience) {
            this.levelUp();
        }
    }

    levelUp() {
        // 레벨 증가
        this.level++;
        
        // 경험치 초과분 계산
        const overflowExp = this.experience - this.maxExperience;
        
        // 최대 경험치 증가
        this.maxExperience = Math.floor(this.maxExperience * 1.2);
        
        // 경험치 초기화 (초과분 적용)
        this.experience = overflowExp;
        
        // 레벨업 이벤트 발생
        this.scene.events.emit('levelUp', this.level);
        this.scene.events.emit('expUpdate', this.experience, this.maxExperience);
        
        // 레벨업 보상 제공
        this.showLevelUpRewards();
    }

    showLevelUpRewards() {
        // 게임 일시 정지
        this.scene.scene.pause();
        
        // 레벨업 UI 생성
        this.createLevelUpUI();
    }

    createLevelUpUI() {
        // 배경 생성
        const background = this.scene.add.rectangle(
            this.scene.cameras.main.width / 2,
            this.scene.cameras.main.height / 2,
            600, 400,
            0x000000, 0.8
        );
        
        // 제목 텍스트
        const titleText = this.scene.add.text(
            this.scene.cameras.main.width / 2,
            this.scene.cameras.main.height / 2 - 150,
            `레벨 업! (${this.level})`,
            { font: '32px Arial', fill: '#ffffff' }
        ).setOrigin(0.5);
        
        // 보상 선택 텍스트
        const subtitleText = this.scene.add.text(
            this.scene.cameras.main.width / 2,
            this.scene.cameras.main.height / 2 - 100,
            '보상을 선택하세요:',
            { font: '24px Arial', fill: '#ffffff' }
        ).setOrigin(0.5);
        
        // 랜덤 보상 옵션 3개 선택
        const rewards = this.getRandomRewards(3);
        
        // 보상 버튼 생성
        const rewardButtons = [];
        
        for (let i = 0; i < rewards.length; i++) {
            const reward = rewards[i];
            
            // 버튼 배경
            const button = this.scene.add.rectangle(
                this.scene.cameras.main.width / 2,
                this.scene.cameras.main.height / 2 - 30 + (i * 80),
                500, 60,
                0x333333
            ).setInteractive();
            
            // 버튼 텍스트
            const buttonText = this.scene.add.text(
                this.scene.cameras.main.width / 2,
                this.scene.cameras.main.height / 2 - 30 + (i * 80),
                `${reward.name}: ${reward.description}`,
                { font: '18px Arial', fill: '#ffffff' }
            ).setOrigin(0.5);
            
            // 버튼 호버 효과
            button.on('pointerover', () => {
                button.fillColor = 0x666666;
            });
            
            button.on('pointerout', () => {
                button.fillColor = 0x333333;
            });
            
            // 버튼 클릭 이벤트
            button.on('pointerdown', () => {
                this.applyReward(reward);
                
                // UI 제거
                background.destroy();
                titleText.destroy();
                subtitleText.destroy();
                
                rewardButtons.forEach(rb => {
                    rb.button.destroy();
                    rb.text.destroy();
                });
                
                // 게임 재개
                this.scene.scene.resume();
            });
            
            rewardButtons.push({ button, text: buttonText });
        }
    }

    getRandomRewards(count) {
        // 랜덤 보상 옵션 선택
        const shuffled = [...this.rewardOptions].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }

    applyReward(reward) {
        // 보상 적용
        switch (reward.name) {
            case '체력 회복':
                // 체력 50% 회복
                const healAmount = this.scene.player.maxHealth * 0.5;
                this.scene.player.heal(healAmount);
                break;
                
            case '최대 체력 증가':
                // 최대 체력 20 증가
                this.scene.player.maxHealth += 20;
                this.scene.player.health += 20;
                this.scene.events.emit('healthUpdate', this.scene.player.health, this.scene.player.maxHealth);
                break;
                
            case '이동 속도 증가':
                // 이동 속도 10% 증가
                this.scene.player.speed *= 1.1;
                break;
                
            case '새 정령 획득':
                // 새 정령 추가
                const spiritNames = ['불 정령', '물 정령', '바람 정령', '땅 정령', '번개 정령'];
                const randomName = spiritNames[Phaser.Math.Between(0, spiritNames.length - 1)];
                this.scene.player.addSpirit(randomName);
                break;
                
            case '정령 강화':
                // 모든 정령 강화
                this.scene.player.spirits.forEach(spirit => {
                    spirit.damage *= 1.1;
                });
                break;
        }
    }
}

module.exports = { LevelSystem }; 