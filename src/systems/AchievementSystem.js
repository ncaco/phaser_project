class AchievementSystem {
    constructor(scene) {
        this.scene = scene;
        
        // 성취 목록
        this.achievements = [
            {
                id: 'kill_10_enemies',
                name: '초보 사냥꾼',
                description: '적 10마리 처치하기',
                requirement: 10,
                progress: 0,
                completed: false,
                reward: {
                    type: 'exp',
                    value: 50
                }
            },
            {
                id: 'kill_50_enemies',
                name: '숙련된 사냥꾼',
                description: '적 50마리 처치하기',
                requirement: 50,
                progress: 0,
                completed: false,
                reward: {
                    type: 'exp',
                    value: 150
                }
            },
            {
                id: 'kill_100_enemies',
                name: '전설의 사냥꾼',
                description: '적 100마리 처치하기',
                requirement: 100,
                progress: 0,
                completed: false,
                reward: {
                    type: 'spirit',
                    value: '번개 정령'
                }
            },
            {
                id: 'collect_10_items',
                name: '수집가',
                description: '아이템 10개 획득하기',
                requirement: 10,
                progress: 0,
                completed: false,
                reward: {
                    type: 'exp',
                    value: 50
                }
            },
            {
                id: 'collect_30_items',
                name: '보물 사냥꾼',
                description: '아이템 30개 획득하기',
                requirement: 30,
                progress: 0,
                completed: false,
                reward: {
                    type: 'spirit',
                    value: '얼음 정령'
                }
            },
            {
                id: 'reach_level_5',
                name: '초보 수련생',
                description: '레벨 5 달성하기',
                requirement: 5,
                progress: 1,
                completed: false,
                reward: {
                    type: 'exp',
                    value: 100
                }
            },
            {
                id: 'reach_level_10',
                name: '숙련된 수련생',
                description: '레벨 10 달성하기',
                requirement: 10,
                progress: 1,
                completed: false,
                reward: {
                    type: 'spirit',
                    value: '빛 정령'
                }
            },
            {
                id: 'survive_5_minutes',
                name: '생존자',
                description: '5분 동안 생존하기',
                requirement: 5 * 60, // 초 단위
                progress: 0,
                completed: false,
                reward: {
                    type: 'exp',
                    value: 200
                }
            },
            {
                id: 'survive_10_minutes',
                name: '끈질긴 생존자',
                description: '10분 동안 생존하기',
                requirement: 10 * 60, // 초 단위
                progress: 0,
                completed: false,
                reward: {
                    type: 'spirit',
                    value: '땅 정령'
                }
            },
            {
                id: 'collect_5_spirits',
                name: '정령 수집가',
                description: '정령 5개 수집하기',
                requirement: 5,
                progress: 0,
                completed: false,
                reward: {
                    type: 'exp',
                    value: 150
                }
            },
            {
                id: 'upgrade_spirit_5_times',
                name: '정령 강화사',
                description: '정령 5번 강화하기',
                requirement: 5,
                progress: 0,
                completed: false,
                reward: {
                    type: 'spirit',
                    value: '바람 정령'
                }
            },
            {
                id: 'kill_boss',
                name: '보스 사냥꾼',
                description: '보스 처치하기',
                requirement: 1,
                progress: 0,
                completed: false,
                reward: {
                    type: 'exp',
                    value: 300
                }
            }
        ];
        
        // 성취 UI
        this.achievementUI = null;
        this.achievementNotifications = [];
        
        // 성취 알림 표시 중인지 여부
        this.isShowingNotification = false;
        
        // 성취 알림 대기열
        this.notificationQueue = [];
    }
    
    // 성취 진행도 업데이트
    updateProgress(achievementId, amount = 1) {
        const achievement = this.achievements.find(a => a.id === achievementId);
        
        if (!achievement || achievement.completed) return;
        
        achievement.progress += amount;
        
        // 성취 완료 체크
        if (achievement.progress >= achievement.requirement && !achievement.completed) {
            achievement.completed = true;
            this.completeAchievement(achievement);
        }
    }
    
    // 성취 완료 처리
    completeAchievement(achievement) {
        console.log(`성취 완료: ${achievement.name}`);
        
        // 성취 알림 대기열에 추가
        this.notificationQueue.push(achievement);
        
        // 알림 표시 시작
        if (!this.isShowingNotification) {
            this.showNextNotification();
        }
        
        // 보상 지급
        this.giveReward(achievement.reward);
    }
    
    // 보상 지급
    giveReward(reward) {
        if (!reward || !this.scene.player) return;
        
        switch (reward.type) {
            case 'exp':
                this.scene.player.addExperience(reward.value);
                break;
                
            case 'spirit':
                this.scene.player.addSpirit(reward.value);
                break;
                
            case 'health':
                this.scene.player.heal(reward.value);
                break;
                
            case 'maxHealth':
                this.scene.player.maxHealth += reward.value;
                this.scene.player.health += reward.value;
                break;
                
            case 'damage':
                this.scene.player.damage += reward.value;
                break;
        }
    }
    
    // 다음 알림 표시
    showNextNotification() {
        if (this.notificationQueue.length === 0) {
            this.isShowingNotification = false;
            return;
        }
        
        this.isShowingNotification = true;
        const achievement = this.notificationQueue.shift();
        
        // 알림 UI 생성
        this.createNotification(achievement);
    }
    
    // 알림 UI 생성
    createNotification(achievement) {
        // 배경 생성
        const notification = this.scene.add.container(
            this.scene.cameras.main.width / 2,
            -100
        );
        
        // 배경 패널
        const background = this.scene.add.rectangle(0, 0, 400, 80, 0x000000, 0.8);
        background.setStrokeStyle(2, 0xffffff);
        
        // 성취 아이콘
        const icon = this.scene.add.circle(-170, 0, 25, 0xffff00);
        
        // 성취 제목
        const title = this.scene.add.text(-130, -20, '성취 달성!', {
            font: '18px Arial',
            fill: '#ffffff'
        });
        
        // 성취 이름
        const name = this.scene.add.text(-130, 5, achievement.name, {
            font: '16px Arial',
            fill: '#ffff00'
        });
        
        // 보상 정보
        let rewardText = '';
        switch (achievement.reward.type) {
            case 'exp':
                rewardText = `경험치 +${achievement.reward.value}`;
                break;
            case 'spirit':
                rewardText = `${achievement.reward.value} 획득!`;
                break;
            case 'health':
                rewardText = `체력 +${achievement.reward.value}`;
                break;
            case 'maxHealth':
                rewardText = `최대 체력 +${achievement.reward.value}`;
                break;
            case 'damage':
                rewardText = `공격력 +${achievement.reward.value}`;
                break;
        }
        
        const reward = this.scene.add.text(100, 0, rewardText, {
            font: '16px Arial',
            fill: '#00ffff'
        });
        
        // 컨테이너에 추가
        notification.add([background, icon, title, name, reward]);
        
        // 알림 애니메이션
        this.scene.tweens.add({
            targets: notification,
            y: 100,
            duration: 1000,
            ease: 'Bounce',
            onComplete: () => {
                // 3초 후 사라짐
                this.scene.time.delayedCall(3000, () => {
                    this.scene.tweens.add({
                        targets: notification,
                        y: -100,
                        alpha: 0,
                        duration: 500,
                        onComplete: () => {
                            notification.destroy();
                            this.showNextNotification();
                        }
                    });
                });
            }
        });
        
        // 효과음 재생
        try {
            this.scene.sound.play('achievement');
        } catch (error) {
            console.error('효과음 재생 중 오류 발생:', error);
        }
    }
    
    // 성취 UI 표시
    showAchievementUI() {
        if (this.achievementUI) {
            this.achievementUI.setVisible(true);
            return;
        }
        
        // 성취 UI 컨테이너 생성
        this.achievementUI = this.scene.add.container(
            this.scene.cameras.main.width / 2,
            this.scene.cameras.main.height / 2
        );
        
        // 배경 패널
        const background = this.scene.add.rectangle(
            0, 0,
            600, 400,
            0x000000, 0.9
        );
        background.setStrokeStyle(2, 0xffffff);
        
        // 제목
        const title = this.scene.add.text(
            0, -180,
            '성취 목록',
            {
                font: '24px Arial',
                fill: '#ffffff'
            }
        ).setOrigin(0.5);
        
        // 닫기 버튼
        const closeButton = this.scene.add.rectangle(
            280, -180,
            30, 30,
            0xff0000, 1
        );
        closeButton.setInteractive();
        closeButton.on('pointerdown', () => {
            this.hideAchievementUI();
        });
        
        const closeText = this.scene.add.text(
            280, -180,
            'X',
            {
                font: '20px Arial',
                fill: '#ffffff'
            }
        ).setOrigin(0.5);
        
        // 성취 목록 추가
        const achievementItems = [];
        let yPos = -140;
        
        this.achievements.forEach(achievement => {
            // 성취 항목 배경
            const itemBg = this.scene.add.rectangle(
                0, yPos,
                550, 40,
                achievement.completed ? 0x004400 : 0x222222,
                1
            );
            
            // 성취 이름
            const nameText = this.scene.add.text(
                -250, yPos,
                achievement.name,
                {
                    font: '16px Arial',
                    fill: achievement.completed ? '#00ff00' : '#ffffff'
                }
            ).setOrigin(0, 0.5);
            
            // 성취 설명
            const descText = this.scene.add.text(
                -100, yPos,
                achievement.description,
                {
                    font: '14px Arial',
                    fill: '#aaaaaa'
                }
            ).setOrigin(0, 0.5);
            
            // 진행도
            const progressText = this.scene.add.text(
                200, yPos,
                `${achievement.progress}/${achievement.requirement}`,
                {
                    font: '14px Arial',
                    fill: '#ffff00'
                }
            ).setOrigin(0.5);
            
            // 보상 정보
            let rewardText = '';
            switch (achievement.reward.type) {
                case 'exp':
                    rewardText = `경험치 +${achievement.reward.value}`;
                    break;
                case 'spirit':
                    rewardText = `${achievement.reward.value}`;
                    break;
                case 'health':
                    rewardText = `체력 +${achievement.reward.value}`;
                    break;
                case 'maxHealth':
                    rewardText = `최대 체력 +${achievement.reward.value}`;
                    break;
                case 'damage':
                    rewardText = `공격력 +${achievement.reward.value}`;
                    break;
            }
            
            const rewardInfo = this.scene.add.text(
                250, yPos,
                rewardText,
                {
                    font: '14px Arial',
                    fill: '#00ffff'
                }
            ).setOrigin(0, 0.5);
            
            achievementItems.push(itemBg, nameText, descText, progressText, rewardInfo);
            yPos += 45;
        });
        
        // UI에 모든 요소 추가
        this.achievementUI.add([background, title, closeButton, closeText, ...achievementItems]);
        
        // UI를 최상위 레이어에 표시
        this.achievementUI.setDepth(1000);
    }
    
    // 성취 UI 숨기기
    hideAchievementUI() {
        if (this.achievementUI) {
            this.achievementUI.setVisible(false);
        }
    }
    
    // 성취 진행도 업데이트 (게임 이벤트에 따라 호출)
    updateAchievements(eventType, data = {}) {
        switch (eventType) {
            case 'enemyKilled':
                this.updateProgress('kill_10_enemies');
                this.updateProgress('kill_50_enemies');
                this.updateProgress('kill_100_enemies');
                
                // 보스 처치 체크
                if (data.enemyType === 'boss') {
                    this.updateProgress('kill_boss');
                }
                break;
                
            case 'itemCollected':
                this.updateProgress('collect_10_items');
                this.updateProgress('collect_30_items');
                break;
                
            case 'levelUp':
                const currentLevel = data.level || 1;
                
                // 레벨 달성 성취 업데이트
                this.achievements.find(a => a.id === 'reach_level_5').progress = currentLevel;
                this.achievements.find(a => a.id === 'reach_level_10').progress = currentLevel;
                
                // 성취 완료 체크
                if (currentLevel >= 5) {
                    this.updateProgress('reach_level_5', 0); // 0을 전달하여 진행도는 변경하지 않고 완료 체크만 수행
                }
                
                if (currentLevel >= 10) {
                    this.updateProgress('reach_level_10', 0);
                }
                break;
                
            case 'survivalTime':
                const survivalTime = data.time || 0; // 초 단위
                
                // 생존 시간 성취 업데이트
                this.achievements.find(a => a.id === 'survive_5_minutes').progress = survivalTime;
                this.achievements.find(a => a.id === 'survive_10_minutes').progress = survivalTime;
                
                // 성취 완료 체크
                if (survivalTime >= 5 * 60) {
                    this.updateProgress('survive_5_minutes', 0);
                }
                
                if (survivalTime >= 10 * 60) {
                    this.updateProgress('survive_10_minutes', 0);
                }
                break;
                
            case 'spiritCollected':
                this.updateProgress('collect_5_spirits');
                break;
                
            case 'spiritUpgraded':
                this.updateProgress('upgrade_spirit_5_times');
                break;
        }
    }
}

module.exports = { AchievementSystem }; 