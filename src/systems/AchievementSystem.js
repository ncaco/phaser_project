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
                    value: 100
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
                requirement: 300, // 초 단위
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
        
        // 로컬 스토리지에서 업적 데이터 불러오기
        this.loadAchievements();
        
        // UI 관련 변수 초기화
        this.achievementContainer = null;
        this.scrollContainer = null;
        this.contentContainer = null;
        this.maskGraphics = null;
        this.upArrow = null;
        this.downArrow = null;
        this.uiVisible = false;
        
        // 성취 알림 관련 변수
        this.achievementNotifications = [];
        this.isShowingNotification = false;
        this.notificationQueue = [];
        this.notificationActive = false;
    }
    
    // 업적 데이터 저장
    saveAchievements() {
        try {
            const achievementsData = this.achievements.map(achievement => ({
                id: achievement.id,
                progress: achievement.progress,
                completed: achievement.completed
            }));
            
            localStorage.setItem('achievements', JSON.stringify(achievementsData));
            console.log('업적 데이터 저장 완료');
        } catch (error) {
            console.error('업적 데이터 저장 중 오류 발생:', error);
        }
    }
    
    // 업적 데이터 불러오기
    loadAchievements() {
        try {
            const savedData = localStorage.getItem('achievements');
            if (savedData) {
                const achievementsData = JSON.parse(savedData);
                
                // 저장된 데이터로 업적 업데이트
                achievementsData.forEach(savedAchievement => {
                    const achievement = this.achievements.find(a => a.id === savedAchievement.id);
                    if (achievement) {
                        achievement.progress = savedAchievement.progress;
                        achievement.completed = savedAchievement.completed;
                    }
                });
                
                console.log('업적 데이터 불러오기 완료');
            }
        } catch (error) {
            console.error('업적 데이터 불러오기 중 오류 발생:', error);
        }
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
        
        // 업적 데이터 저장
        this.saveAchievements();
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
        // 알림 컨테이너 생성
        const notification = this.scene.add.container(
            this.scene.cameras.main.width / 2,
            -100
        );
        notification.setDepth(2000);
        
        // 배경 패널
        const background = this.scene.add.rectangle(0, 0, 400, 100, 0x2c3e50, 0.9);
        background.setStrokeStyle(3, 0x3498db);
        
        // 상단 장식 바
        const topBar = this.scene.add.rectangle(0, -45, 400, 10, 0xf1c40f, 1);
        
        // 성취 아이콘 배경
        const iconBg = this.scene.add.circle(-170, 0, 30, 0x3498db, 0.8);
        
        // 성취 아이콘
        const iconText = this.scene.add.text(-170, 0, '✓', {
            font: '32px Arial',
            fontWeight: 'bold',
            fill: '#ffffff'
        }).setOrigin(0.5);
        
        // 빛나는 효과
        const glow = this.scene.add.circle(-170, 0, 35, 0xffffff, 0.3);
        this.scene.tweens.add({
            targets: glow,
            alpha: 0.6,
            scale: 1.2,
            duration: 1000,
            yoyo: true,
            repeat: -1
        });
        
        // 성취 제목
        const title = this.scene.add.text(-130, -25, '업적 달성!', {
            fontFamily: 'Noto Sans KR, Arial, sans-serif',
            fontSize: '20px',
            fontWeight: 'bold',
            fill: '#f1c40f'
        }).setOrigin(0, 0.5);
        
        // 성취 이름
        const name = this.scene.add.text(-130, 5, achievement.name, {
            fontFamily: 'Noto Sans KR, Arial, sans-serif',
            fontSize: '18px',
            fontWeight: 'bold',
            fill: '#ffffff'
        }).setOrigin(0, 0.5);
        
        // 성취 설명
        const desc = this.scene.add.text(-130, 30, achievement.description, {
            fontFamily: 'Noto Sans KR, Arial, sans-serif',
            fontSize: '14px',
            fill: '#cccccc'
        }).setOrigin(0, 0.5);
        
        // 보상 아이콘 배경
        const rewardIconBg = this.scene.add.circle(100, 0, 25, 0xf39c12, 0.8);
        
        // 보상 아이콘
        let rewardIcon = '★';
        if (achievement.reward.type === 'exp') {
            rewardIcon = 'XP';
        } else if (achievement.reward.type === 'spirit') {
            rewardIcon = '♦';
        }
        
        const rewardIconText = this.scene.add.text(100, 0, rewardIcon, {
            fontFamily: 'Arial',
            fontSize: '18px',
            fontWeight: 'bold',
            fill: '#ffffff'
        }).setOrigin(0.5);
        
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
        
        const reward = this.scene.add.text(130, 0, rewardText, {
            fontFamily: 'Noto Sans KR, Arial, sans-serif',
            fontSize: '16px',
            fontWeight: 'bold',
            fill: '#f39c12'
        }).setOrigin(0, 0.5);
        
        // 파티클 효과
        let particles;
        try {
            if (this.scene && this.scene.add && this.scene.add.particles && 
                this.scene.textures && this.scene.textures.exists && 
                this.scene.textures.exists('particle')) {
                
                particles = this.scene.add.particles(0, 0, 'particle', {
                    frame: 0,
                    color: [ 0xffff00, 0xff0000, 0x00ff00, 0x0000ff ],
                    colorEase: 'quad.out',
                    lifespan: 1000,
                    angle: { min: 0, max: 360 },
                    scale: { start: 0.6, end: 0 },
                    speed: 100,
                    advance: 2000,
                    blendMode: 'ADD',
                    frequency: 50,
                    emitZone: { type: 'edge', source: new Phaser.Geom.Circle(0, 0, 40), quantity: 20 }
                });
                
                if (particles && notification) {
                    notification.add(particles);
                }
            } else {
                // 파티클 시스템이 없는 경우 대체 효과
                this.createStarEffect(notification);
            }
        } catch (error) {
            console.error('파티클 효과 생성 중 오류 발생:', error);
            // 오류 발생 시 대체 효과
            try {
                this.createStarEffect(notification);
            } catch (e) {
                console.error('대체 효과 생성 중 오류 발생:', e);
            }
        }
        
        // 컨테이너에 추가
        notification.add([background, topBar, glow, iconBg, iconText, title, name, desc, rewardIconBg, rewardIconText, reward]);
        
        // 알림 애니메이션
        this.scene.tweens.add({
            targets: notification,
            y: 100,
            duration: 1000,
            ease: 'Bounce.Out',
            onComplete: () => {
                // 3초 후 사라짐
                this.scene.time.delayedCall(3000, () => {
                    this.scene.tweens.add({
                        targets: notification,
                        y: -150,
                        alpha: 0,
                        duration: 800,
                        ease: 'Back.In',
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
    
    // 별 효과 생성 (파티클 대체용)
    createStarEffect(container) {
        // 대체 효과 - 별 모양 이미지
        for (let i = 0; i < 10; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * 50 + 20;
            const x = Math.cos(angle) * distance;
            const y = Math.sin(angle) * distance;
            
            const star = this.scene.add.text(x, y, '✦', {
                font: '16px Arial',
                fill: '#ffff00'
            }).setOrigin(0.5);
            
            this.scene.tweens.add({
                targets: star,
                alpha: 0,
                scale: 0.5,
                duration: 1000,
                onComplete: () => star.destroy()
            });
            
            container.add(star);
        }
    }
    
    // 성취 UI 표시
    showAchievementUI() {
        // 이미 표시 중이면 반환
        if (this.uiVisible) return;
        
        // 이전 UI 요소가 있다면 완전히 정리
        if (this.achievementContainer) {
            this.destroyUI();
        }
        
        // 이전 마스크 그래픽 정리
        this.clearMaskGraphics();
        
        // UI 표시 상태로 설정
        this.uiVisible = true;
        
        // 성취 UI 컨테이너 생성
        this.achievementContainer = this.scene.add.container(
            this.scene.cameras.main.width / 2,
            this.scene.cameras.main.height / 2
        );
        this.achievementContainer.setDepth(1000); // 높은 z-index로 설정하여 다른 UI 위에 표시
        this.achievementContainer.alpha = 0;
        this.achievementContainer.scale = 0.9;
        
        // 나타나는 애니메이션
        this.scene.tweens.add({
            targets: this.achievementContainer,
            alpha: 1,
            scale: 1,
            duration: 300,
            ease: 'Back.Out'
        });
        
        // 배경 패널
        const background = this.scene.add.rectangle(
            0, 0,
            600, 400,
            0x1e2a3a, 0.95
        );
        background.setStrokeStyle(3, 0x3498db);
        
        // 제목 배경
        const titleBg = this.scene.add.rectangle(
            0, -180,
            600, 40,
            0x2c3e50, 1
        );
        
        // 제목
        const title = this.scene.add.text(
            0, -180,
            '업적 목록',
            {
                fontFamily: 'Noto Sans KR, Arial, sans-serif',
                fontSize: '24px',
                fontWeight: 'bold',
                fill: '#ffffff'
            }
        ).setOrigin(0.5);
        
        // 닫기 버튼 배경
        const closeButtonBg = this.scene.add.rectangle(
            280, -180,
            30, 30,
            0xe74c3c, 1
        );
        closeButtonBg.setInteractive({ useHandCursor: true });
        closeButtonBg.on('pointerdown', () => {
            this.hideAchievementUI();
        });
        
        // 닫기 버튼 호버 효과
        closeButtonBg.on('pointerover', () => {
            closeButtonBg.fillColor = 0xc0392b;
        });
        
        closeButtonBg.on('pointerout', () => {
            closeButtonBg.fillColor = 0xe74c3c;
        });
        
        const closeText = this.scene.add.text(
            280, -180,
            'X',
            {
                fontFamily: 'Noto Sans KR, Arial, sans-serif',
                fontSize: '20px',
                fontWeight: 'bold',
                fill: '#ffffff'
            }
        ).setOrigin(0.5);
        
        // 설명 텍스트
        const descriptionText = this.scene.add.text(
            0, -145,
            '게임 플레이 중 달성할 수 있는 업적 목록입니다. 업적을 달성하면 보상을 받을 수 있습니다.',
            {
                fontFamily: 'Noto Sans KR, Arial, sans-serif',
                fontSize: '14px',
                fill: '#cccccc',
                align: 'center',
                wordWrap: { width: 550 }
            }
        ).setOrigin(0.5);
        
        // 스크롤 영역 생성
        const scrollView = this.createScrollView();
        
        // 성취 목록 추가
        const achievementItems = [];
        let yPos = 0;
        
        // 완료된 업적과 미완료 업적 분리
        const completedAchievements = this.achievements.filter(a => a.completed);
        const incompleteAchievements = this.achievements.filter(a => !a.completed);
        
        // 미완료 업적 먼저 표시
        incompleteAchievements.forEach(achievement => {
            const item = this.createAchievementItem(achievement, yPos);
            achievementItems.push(...item);
            yPos += 60;
        });
        
        // 완료된 업적 표시
        if (completedAchievements.length > 0) {
            // 구분선 추가
            const separator = this.scene.add.rectangle(
                0, yPos + 10,
                550, 2,
                0x3498db, 0.7
            );
            achievementItems.push(separator);
            yPos += 30;
            
            // 완료된 업적 섹션 제목
            const completedTitle = this.scene.add.text(
                0, yPos,
                '완료된 업적',
                {
                    fontFamily: 'Noto Sans KR, Arial, sans-serif',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    fill: '#3498db'
                }
            ).setOrigin(0.5);
            achievementItems.push(completedTitle);
            yPos += 30;
            
            // 완료된 업적 목록
            completedAchievements.forEach(achievement => {
                const item = this.createAchievementItem(achievement, yPos);
                achievementItems.push(...item);
                yPos += 60;
            });
        }
        
        // 스크롤 영역에 아이템 추가
        scrollView.add(achievementItems);
        
        // UI에 모든 요소 추가
        this.achievementContainer.add([background, titleBg, title, closeButtonBg, closeText, descriptionText, scrollView]);
    }
    
    // 스크롤 영역 생성
    createScrollView() {
        // 스크롤 영역 컨테이너
        const scrollView = this.scene.add.container(0, -50);
        
        // 스크롤 컨테이너 참조 저장
        this.scrollContainer = scrollView;
        
        // 마스크 생성
        const maskGraphics = this.scene.add.graphics();
        maskGraphics.fillStyle(0xffffff);
        maskGraphics.fillRect(
            this.scene.cameras.main.width / 2 - 280,
            this.scene.cameras.main.height / 2 - 120,
            560,
            300
        );
        
        // 마스크 객체 저장 (나중에 정리하기 위해)
        this.maskGraphics = maskGraphics;
        
        // 마스크 적용
        const mask = new Phaser.Display.Masks.GeometryMask(this.scene, maskGraphics);
        scrollView.setMask(mask);
        
        // 스크롤 영역 상호작용 설정
        let isDragging = false;
        let startY = 0;
        let scrollViewY = 0;
        
        // 스크롤 영역 배경 (상호작용용)
        const scrollBg = this.scene.add.rectangle(
            0, 0,
            560, 300,
            0xffffff, 0.01
        );
        scrollBg.setInteractive();
        scrollView.add(scrollBg);
        
        // 콘텐츠 컨테이너 참조 저장
        this.contentContainer = scrollView;
        
        // 드래그 시작
        const startScroll = (pointer) => {
            isDragging = true;
            startY = pointer.y;
            scrollViewY = scrollView.y;
        };
        scrollBg.on('pointerdown', startScroll);
        this.startScroll = startScroll;
        
        // 드래그 중
        const handleScroll = (pointer) => {
            if (!isDragging) return;
            
            const deltaY = pointer.y - startY;
            scrollView.y = scrollViewY + deltaY;
            
            // 스크롤 제한
            const totalHeight = this.achievements.length * 60 + 100; // 대략적인 총 높이
            const visibleHeight = 300;
            
            if (scrollView.y > 0) {
                scrollView.y = 0;
            } else if (scrollView.y < -totalHeight + visibleHeight) {
                scrollView.y = Math.max(-totalHeight + visibleHeight, -totalHeight);
            }
        };
        this.scene.input.on('pointermove', handleScroll);
        this.handleScroll = handleScroll;
        
        // 드래그 종료
        const stopScroll = () => {
            isDragging = false;
        };
        this.scene.input.on('pointerup', stopScroll);
        this.stopScroll = stopScroll;
        
        // 스크롤 화살표 추가
        const upArrow = this.scene.add.text(
            0, -140,
            '▲',
            {
                fontFamily: 'Arial',
                fontSize: '24px',
                fill: '#ffffff'
            }
        ).setOrigin(0.5);
        upArrow.setInteractive({ useHandCursor: true });
        
        // 화살표 참조 저장
        this.upArrow = upArrow;
        
        const upArrowHandler = () => {
            scrollView.y += 50;
            if (scrollView.y > 0) {
                scrollView.y = 0;
            }
        };
        upArrow.on('pointerdown', upArrowHandler);
        
        const downArrow = this.scene.add.text(
            0, 140,
            '▼',
            {
                fontFamily: 'Arial',
                fontSize: '24px',
                fill: '#ffffff'
            }
        ).setOrigin(0.5);
        downArrow.setInteractive({ useHandCursor: true });
        
        // 화살표 참조 저장
        this.downArrow = downArrow;
        
        const downArrowHandler = () => {
            scrollView.y -= 50;
            const totalHeight = this.achievements.length * 60 + 100;
            const visibleHeight = 300;
            if (scrollView.y < -totalHeight + visibleHeight) {
                scrollView.y = Math.max(-totalHeight + visibleHeight, -totalHeight);
            }
        };
        downArrow.on('pointerdown', downArrowHandler);
        
        this.achievementContainer.add([upArrow, downArrow]);
        
        return scrollView;
    }
    
    // 업적 아이템 생성
    createAchievementItem(achievement, yPos) {
        const items = [];
        
        // 아이템 배경
        const itemBg = this.scene.add.rectangle(
            0, yPos,
            550, 50,
            achievement.completed ? 0x27ae60 : 0x34495e,
            achievement.completed ? 0.3 : 0.5
        );
        itemBg.setStrokeStyle(2, achievement.completed ? 0x2ecc71 : 0x2c3e50);
        items.push(itemBg);
        
        // 업적 아이콘 배경
        const iconBg = this.scene.add.circle(
            -250, yPos,
            20,
            achievement.completed ? 0x2ecc71 : 0x3498db,
            0.8
        );
        items.push(iconBg);
        
        // 업적 아이콘 (완료 여부에 따라 다른 아이콘)
        const iconText = this.scene.add.text(
            -250, yPos,
            achievement.completed ? '✓' : '!',
            {
                fontFamily: 'Arial',
                fontSize: '20px',
                fontWeight: 'bold',
                fill: '#ffffff'
            }
        ).setOrigin(0.5);
        items.push(iconText);
        
        // 업적 이름
        const nameText = this.scene.add.text(
            -215, yPos - 10,
            achievement.name,
            {
                fontFamily: 'Noto Sans KR, Arial, sans-serif',
                fontSize: '16px',
                fontWeight: 'bold',
                fill: achievement.completed ? '#2ecc71' : '#ffffff'
            }
        ).setOrigin(0, 0.5);
        items.push(nameText);
        
        // 업적 설명
        const descText = this.scene.add.text(
            -215, yPos + 10,
            achievement.description,
            {
                fontFamily: 'Noto Sans KR, Arial, sans-serif',
                fontSize: '12px',
                fill: '#cccccc'
            }
        ).setOrigin(0, 0.5);
        items.push(descText);
        
        // 진행 상황 텍스트
        const progressText = this.scene.add.text(
            200, yPos - 15,
            `${achievement.progress}/${achievement.requirement}`,
            {
                fontFamily: 'Noto Sans KR, Arial, sans-serif',
                fontSize: '14px',
                fill: achievement.completed ? '#2ecc71' : '#ffffff'
            }
        ).setOrigin(0.5);
        items.push(progressText);
        
        // 진행 바 배경
        const progressBarBg = this.scene.add.rectangle(
            200, yPos + 5,
            120, 8,
            0x2c3e50, 1
        );
        items.push(progressBarBg);
        
        // 진행 바
        const progressRatio = Math.min(achievement.progress / achievement.requirement, 1);
        const progressBar = this.scene.add.rectangle(
            200 - 60 + (progressRatio * 120) / 2, yPos + 5,
            progressRatio * 120, 8,
            achievement.completed ? 0x2ecc71 : 0x3498db, 1
        ).setOrigin(0.5);
        items.push(progressBar);
        
        // 보상 아이콘 배경
        const rewardIconBg = this.scene.add.circle(
            250, yPos,
            15,
            0xf39c12, 0.8
        );
        items.push(rewardIconBg);
        
        // 보상 아이콘
        let rewardIcon = '★';
        if (achievement.reward.type === 'exp') {
            rewardIcon = 'XP';
        } else if (achievement.reward.type === 'spirit') {
            rewardIcon = '♦';
        }
        
        const rewardIconText = this.scene.add.text(
            250, yPos,
            rewardIcon,
            {
                fontFamily: 'Arial',
                fontSize: '12px',
                fontWeight: 'bold',
                fill: '#ffffff'
            }
        ).setOrigin(0.5);
        items.push(rewardIconText);
        
        // 보상 정보
        let rewardText = '';
        if (achievement.reward.type === 'exp') {
            rewardText = `경험치 +${achievement.reward.value}`;
        } else if (achievement.reward.type === 'spirit') {
            rewardText = `${achievement.reward.value}`;
        }
        
        const rewardInfoText = this.scene.add.text(
            270, yPos,
            rewardText,
            {
                fontFamily: 'Noto Sans KR, Arial, sans-serif',
                fontSize: '12px',
                fill: '#f39c12'
            }
        ).setOrigin(0, 0.5);
        items.push(rewardInfoText);
        
        return items;
    }
    
    // 마스크 그래픽 정리 헬퍼 함수
    clearMaskGraphics() {
        try {
            if (this.maskGraphics) {
                if (this.maskGraphics.active) {
                    this.maskGraphics.clear();
                }
                
                if (!this.maskGraphics.destroyed) {
                    this.maskGraphics.destroy();
                }
                
                this.maskGraphics = null;
                console.log('마스크 그래픽 정리 완료');
            }
        } catch (error) {
            console.error('마스크 그래픽 정리 중 오류 발생:', error);
        }
    }
    
    // 업적 UI 숨기기
    hideAchievementUI() {
        if (!this.uiVisible) return;
        
        // UI 표시 상태 업데이트
        this.uiVisible = false;
        
        // UI 컨테이너가 있으면 애니메이션과 함께 숨김
        if (this.achievementContainer) {
            this.scene.tweens.add({
                targets: this.achievementContainer,
                alpha: 0,
                scale: 0.9,
                duration: 300,
                ease: 'Back.In',
                onComplete: () => {
                    this.achievementContainer.setVisible(false);
                    
                    // 이벤트 리스너 정리
                    this.cleanupEventListeners();
                    
                    // 마스크 그래픽 정리
                    this.clearMaskGraphics();
                }
            });
        } else {
            // 이벤트 리스너 정리
            this.cleanupEventListeners();
            
            // 마스크 그래픽 정리
            this.clearMaskGraphics();
        }
    }
    
    // 이벤트 리스너 정리
    cleanupEventListeners() {
        try {
            // 스크롤 이벤트 리스너 제거
            if (this.scene && this.scene.input) {
                if (this.handleScroll) {
                    this.scene.input.off('pointermove', this.handleScroll, this);
                }
                
                if (this.startScroll) {
                    this.scene.input.off('pointerdown', this.startScroll, this);
                }
                
                if (this.stopScroll) {
                    this.scene.input.off('pointerup', this.stopScroll, this);
                }
            }
            
            // 화살표 버튼 이벤트 리스너 제거
            if (this.upArrow && this.upArrow.active && !this.upArrow.destroyed) {
                this.upArrow.off('pointerdown');
                this.upArrow.off('pointerover');
                this.upArrow.off('pointerout');
            }
            
            if (this.downArrow && this.downArrow.active && !this.downArrow.destroyed) {
                this.downArrow.off('pointerdown');
                this.downArrow.off('pointerover');
                this.downArrow.off('pointerout');
            }
            
            console.log('이벤트 리스너 정리 완료');
        } catch (error) {
            console.error('이벤트 리스너 정리 중 오류 발생:', error);
        }
    }
    
    // UI 완전히 제거
    destroyUI() {
        console.log('업적 UI 완전히 제거 시작');
        
        // 이벤트 리스너 정리
        this.cleanupEventListeners();
        
        // 마스크 그래픽 정리
        this.clearMaskGraphics();
        
        // UI 컨테이너 제거
        if (this.achievementContainer) {
            try {
                if (this.achievementContainer.active && !this.achievementContainer.destroyed) {
                    this.achievementContainer.destroy();
                }
                this.achievementContainer = null;
                console.log('업적 UI 컨테이너 제거 완료');
            } catch (error) {
                console.error('업적 UI 컨테이너 제거 중 오류 발생:', error);
            }
        }
        
        // 스크롤 컨테이너 참조 제거
        this.scrollContainer = null;
        this.contentContainer = null;
        this.upArrow = null;
        this.downArrow = null;
        
        // UI 표시 상태 업데이트
        this.uiVisible = false;
        
        console.log('업적 UI 완전히 제거 완료');
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

// 모듈 내보내기
module.exports = { AchievementSystem }; 