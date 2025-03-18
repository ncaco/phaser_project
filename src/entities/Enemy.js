class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, type = 'normal') {
        super(scene, x, y, 'enemy');
        
        console.log(`Enemy 생성 시작: 타입=${type}, 위치=(${x}, ${y})`);
        
        // 씬에 추가
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        // 적 속성
        this.type = type;
        this.health = 100;
        this.maxHealth = 100;
        this.speed = 100;
        this.damage = 10;
        this.expValue = 10;
        this.dropRate = 0.3; // 아이템 드롭 확률 (30%)
        
        // 적 타입에 따른 속성 설정
        this.setupEnemyType();
        
        // 체력바 생성
        this.healthBar = scene.add.rectangle(x, y - 20, 30, 5, 0x00ff00);
        
        // 상태 효과
        this.burning = false;
        this.slowed = false;
        this.stunned = false;
        
        // 행동 패턴 타이머
        this.behaviorTimer = scene.time.addEvent({
            delay: Phaser.Math.Between(3000, 5000),
            callback: this.changeBehavior,
            callbackScope: this,
            loop: true
        });
        
        // 현재 행동 패턴
        this.currentBehavior = 'chase';
        
        // 특수 능력 쿨다운
        this.specialAbilityCooldown = false;
        
        // 물리 속성 설정
        this.setCollideWorldBounds(false);
        this.body.setDamping(true);
        this.body.setDrag(0.9, 0.9);
        
        // 애니메이션 설정
        this.setupAnimations();
        
        // 타겟 설정 (플레이어)
        this.target = scene.player;
        
        // 이동 관련 속성
        this.moveTimer = null;
        this.lastMoveTime = 0;
        this.moveInterval = 100; // 이동 업데이트 간격 (밀리초)
        
        // 공격 관련 속성
        this.attackTimer = null;
        this.attackInterval = 1000; // 공격 간격 (밀리초)
        // 공격 범위를 화면 대각선 길이로 설정 (화면 끝까지 공격 가능)
        this.attackRange = 2000; // 매우 큰 값으로 설정하여 화면 전체 커버
        
        // 공격 타이머 시작
        this.startAttackTimer();
        
        console.log(`Enemy 생성 완료: 타입=${type}, 체력=${this.health}/${this.maxHealth}`);
    }
    
    setupEnemyType() {
        // 적 타입에 따른 속성 설정
        switch (this.type) {
            case 'normal':
                this.health = 100;
                this.maxHealth = 100;
                this.speed = 60; // 속도 감소 (100 -> 60)
                this.damage = 10;
                this.expValue = 10;
                this.dropRate = 0.3;
                this.attackRange = 1500; // 공격 범위 증가
                this.setTint(0xff0000);
                break;
                
            case 'fast':
                this.health = 60;
                this.maxHealth = 60;
                this.speed = 100; // 속도 감소 (180 -> 100)
                this.damage = 5;
                this.expValue = 15;
                this.dropRate = 0.4;
                this.attackRange = 1500; // 공격 범위 증가
                this.setTint(0x00ff00);
                this.setScale(0.8);
                break;
                
            case 'tank':
                this.health = 300;
                this.maxHealth = 300;
                this.speed = 40; // 속도 감소 (60 -> 40)
                this.damage = 20;
                this.expValue = 30;
                this.dropRate = 0.5;
                this.attackRange = 1800; // 공격 범위 증가
                this.setTint(0x0000ff);
                this.setScale(1.3);
                break;
                
            case 'ranged':
                this.health = 80;
                this.maxHealth = 80;
                this.speed = 50; // 속도 감소 (80 -> 50)
                this.damage = 15;
                this.expValue = 20;
                this.dropRate = 0.4;
                this.attackRange = 2000; // 원거리 타입의 공격 범위 대폭 증가
                this.attackInterval = 1500; // 공격 간격 증가
                this.setTint(0xffff00);
                break;
                
            case 'explosive':
                this.health = 50;
                this.maxHealth = 50;
                this.speed = 70; // 속도 감소 (120 -> 70)
                this.damage = 30;
                this.expValue = 25;
                this.dropRate = 0.5;
                this.attackRange = 1600; // 공격 범위 증가
                this.explosionRadius = 200; // 폭발 반경 증가
                this.setTint(0xff8800);
                break;
                
            case 'boss':
                this.health = 1000;
                this.maxHealth = 1000;
                this.speed = 30; // 속도 감소 (50 -> 30)
                this.damage = 30;
                this.expValue = 100;
                this.dropRate = 1.0; // 100% 드롭
                this.attackRange = 2500; // 전체 화면 공격 가능
                this.attackInterval = 2000; // 공격 간격 증가
                this.setTint(0xff00ff);
                this.setScale(2);
                
                // 보스 특수 능력 타이머
                this.bossAbilityTimer = this.scene.time.addEvent({
                    delay: 10000, // 10초마다 특수 능력 사용
                    callback: this.useBossAbility,
                    callbackScope: this,
                    loop: true
                });
                break;
                
            default:
                this.health = 100;
                this.maxHealth = 100;
                this.speed = 60; // 속도 감소 (100 -> 60)
                this.damage = 10;
                this.expValue = 10;
                this.dropRate = 0.3;
                this.attackRange = 1500; // 공격 범위 증가
                this.setTint(0xff0000);
                break;
        }
        
        // 움직임 효과 추가
        this.scene.tweens.add({
            targets: this,
            angle: { from: -5, to: 5 },
            duration: 500,
            yoyo: true,
            repeat: -1
        });
    }
    
    update(time, delta) {
        // 스턴 상태면 움직이지 않음
        if (this.stunned) return;
        
        // 플레이어가 없거나 사망한 경우 움직이지 않음
        if (!this.scene.player || this.scene.player.isDead) {
            this.setVelocity(0, 0);
            return;
        }
        
        // 화면 밖에 있는 경우 업데이트 건너뛰기 (최적화)
        const distanceToPlayer = Phaser.Math.Distance.Between(
            this.x, this.y,
            this.scene.player.x, this.scene.player.y
        );
        
        // 플레이어와 너무 멀리 떨어져 있으면 업데이트 빈도 줄이기
        if (distanceToPlayer > 800) {
            // 10프레임마다 한 번씩만 업데이트
            if (time % 10 !== 0) return;
        }
        
        // 행동 패턴에 따른 업데이트
        switch (this.currentBehavior) {
            case 'chase':
                this.moveTowardsPlayer();
                break;
                
            case 'circle':
                this.circleAroundPlayer();
                break;
                
            case 'retreat':
                this.retreatFromPlayer();
                break;
                
            case 'zigzag':
                this.zigzagTowardsPlayer();
                break;
        }
        
        // 체력바 위치 업데이트
        this.updateHealthBar();
        
        // 원거리 적 공격 처리
        if (this.type === 'ranged') {
            this.handleRangedAttack();
        }
    }
    
    moveTowardsPlayer() {
        // 플레이어가 없으면 리턴
        if (!this.scene.player) return;
        
        // 플레이어 방향으로 이동
        const player = this.scene.player;
        const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
        
        // 속도 계산 - 부드러운 이동을 위해 보간 적용
        const targetVelocityX = Math.cos(angle) * this.speed;
        const targetVelocityY = Math.sin(angle) * this.speed;
        
        // 현재 속도에서 목표 속도로 부드럽게 전환 (Linear 보간 사용)
        this.body.velocity.x = Phaser.Math.Linear(this.body.velocity.x, targetVelocityX, 0.1);
        this.body.velocity.y = Phaser.Math.Linear(this.body.velocity.y, targetVelocityY, 0.1);
        
        // 스프라이트 방향 설정
        if (this.body.velocity.x < 0) {
            this.setFlipX(true);
        } else {
            this.setFlipX(false);
        }
    }
    
    circleAroundPlayer() {
        // 플레이어가 없으면 리턴
        if (!this.scene.player) return;
        
        const player = this.scene.player;
        const distance = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
        
        // 플레이어와의 거리가 너무 멀면 접근
        if (distance > 150) {
            this.moveTowardsPlayer();
            return;
        }
        
        // 플레이어 주변을 원형으로 이동
        const angle = Phaser.Math.Angle.Between(player.x, player.y, this.x, this.y);
        const newAngle = angle + 0.02;
        
        const targetX = player.x + Math.cos(newAngle) * 150;
        const targetY = player.y + Math.sin(newAngle) * 150;
        
        // 목표 지점으로 이동
        const moveAngle = Phaser.Math.Angle.Between(this.x, this.y, targetX, targetY);
        const targetVelocityX = Math.cos(moveAngle) * this.speed;
        const targetVelocityY = Math.sin(moveAngle) * this.speed;
        
        // 부드러운 이동을 위한 보간
        this.body.velocity.x = Phaser.Math.Linear(this.body.velocity.x, targetVelocityX, 0.1);
        this.body.velocity.y = Phaser.Math.Linear(this.body.velocity.y, targetVelocityY, 0.1);
        
        // 스프라이트 방향 설정
        if (this.body.velocity.x < 0) {
            this.setFlipX(true);
        } else {
            this.setFlipX(false);
        }
    }
    
    retreatFromPlayer() {
        // 플레이어가 없으면 리턴
        if (!this.scene.player) return;
        
        const player = this.scene.player;
        const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
        
        // 플레이어 반대 방향으로 이동
        const targetVelocityX = Math.cos(angle) * -this.speed;
        const targetVelocityY = Math.sin(angle) * -this.speed;
        
        // 부드러운 이동을 위한 보간
        this.body.velocity.x = Phaser.Math.Linear(this.body.velocity.x, targetVelocityX, 0.1);
        this.body.velocity.y = Phaser.Math.Linear(this.body.velocity.y, targetVelocityY, 0.1);
        
        // 스프라이트 방향 설정
        if (this.body.velocity.x < 0) {
            this.setFlipX(true);
        } else {
            this.setFlipX(false);
        }
        
        // 일정 거리 이상 멀어지면 다시 추격
        const distance = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
        if (distance > 300) {
            this.currentBehavior = 'chase';
        }
    }
    
    zigzagTowardsPlayer() {
        // 플레이어가 없으면 리턴
        if (!this.scene.player) return;
        
        const player = this.scene.player;
        const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
        
        // 지그재그 패턴 (시간에 따라 좌우로 흔들림)
        const zigzagOffset = Math.sin(this.scene.time.now / 200) * 100;
        const perpAngle = angle + Math.PI / 2;
        
        // 기본 속도 계산
        let targetVelocityX = Math.cos(angle) * this.speed;
        let targetVelocityY = Math.sin(angle) * this.speed;
        
        // 지그재그 오프셋 추가
        targetVelocityX += Math.cos(perpAngle) * zigzagOffset;
        targetVelocityY += Math.sin(perpAngle) * zigzagOffset;
        
        // 부드러운 이동을 위한 보간
        this.body.velocity.x = Phaser.Math.Linear(this.body.velocity.x, targetVelocityX, 0.1);
        this.body.velocity.y = Phaser.Math.Linear(this.body.velocity.y, targetVelocityY, 0.1);
        
        // 스프라이트 방향 설정
        if (this.body.velocity.x < 0) {
            this.setFlipX(true);
        } else {
            this.setFlipX(false);
        }
    }
    
    handleRangedAttack() {
        // 플레이어가 없으면 리턴
        if (!this.scene.player) return;
        
        const player = this.scene.player;
        
        // 화면에 플레이어가 있고 쿨다운이 아니면 공격
        if (this.isPlayerOnScreen() && !this.specialAbilityCooldown) {
            this.specialAbilityCooldown = true;
            
            // 공격 준비 효과
            const chargeEffect = this.scene.add.circle(this.x, this.y, 15, 0xffff00, 0.7);
            
            // 충전 애니메이션
            this.scene.tweens.add({
                targets: chargeEffect,
                scale: 2,
                alpha: 0.9,
                duration: 500,
                onComplete: () => {
                    chargeEffect.destroy();
                    
                    // 원거리 공격 발사
                    const projectile = this.scene.physics.add.sprite(this.x, this.y, 'projectile');
                    projectile.setTint(this.getAttackColor());
                    projectile.setScale(1.5);
                    projectile.setAlpha(0.8);
                    
                    // 발사체 물리 설정
                    this.scene.physics.world.enable(projectile);
                    
                    // 플레이어 방향으로 발사
                    const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
                    const speed = 300; // 발사체 속도 증가
                    projectile.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
                    
                    // 발사체 회전 효과
                    projectile.rotation = angle;
                    
                    // 꼬리 효과
                    const addTrail = () => {
                        if (!projectile.active) return;
                        
                        const trail = this.scene.add.circle(
                            projectile.x, 
                            projectile.y, 
                            10, 
                            this.getAttackColor(), 
                            0.5
                        );
                        
                        // 꼬리 효과 애니메이션
                        this.scene.tweens.add({
                            targets: trail,
                            scale: 0,
                            alpha: 0,
                            duration: 300,
                            onComplete: () => {
                                trail.destroy();
                            }
                        });
                    };
                    
                    // 꼬리 효과 업데이트 타이머
                    const trailTimer = this.scene.time.addEvent({
                        delay: 50,
                        callback: addTrail,
                        loop: true
                    });
                    
                    // 발사체 업데이트 - 플레이어 추적
                    const updateProjectile = () => {
                        if (!projectile.active || !this.scene.player) {
                            trailTimer.remove();
                            return;
                        }
                        
                        // 플레이어 방향으로 약간 방향 조정 (유도 미사일)
                        const currentAngle = Math.atan2(projectile.body.velocity.y, projectile.body.velocity.x);
                        const targetAngle = Phaser.Math.Angle.Between(
                            projectile.x, projectile.y,
                            this.scene.player.x, this.scene.player.y
                        );
                        
                        // 각도 차이 계산
                        let angleDiff = Phaser.Math.Angle.Wrap(targetAngle - currentAngle);
                        
                        // 천천히 방향 조정 (완전히 유도하지는 않음)
                        const turnSpeed = 0.02;
                        const newAngle = currentAngle + (angleDiff * turnSpeed);
                        
                        // 속도 유지하면서 방향만 변경
                        const currentSpeed = Math.sqrt(
                            projectile.body.velocity.x * projectile.body.velocity.x + 
                            projectile.body.velocity.y * projectile.body.velocity.y
                        );
                        
                        projectile.setVelocity(
                            Math.cos(newAngle) * currentSpeed,
                            Math.sin(newAngle) * currentSpeed
                        );
                        
                        // 발사체 회전 업데이트
                        projectile.rotation = newAngle;
                    };
                    
                    // 발사체 업데이트 타이머
                    const updateTimer = this.scene.time.addEvent({
                        delay: 100,
                        callback: updateProjectile,
                        loop: true
                    });
                    
                    // 플레이어와 발사체 충돌 설정
                    this.scene.physics.add.overlap(player, projectile, (player, proj) => {
                        // 명중 효과
                        const hitEffect = this.scene.add.circle(
                            player.x, player.y, 40, this.getAttackColor(), 0.8
                        );
                        
                        // 효과 애니메이션
                        this.scene.tweens.add({
                            targets: hitEffect,
                            scale: 0,
                            alpha: 0,
                            duration: 500,
                            onComplete: () => {
                                hitEffect.destroy();
                            }
                        });
                        
                        // 데미지 적용
                        player.takeDamage(this.damage);
                        
                        // 발사체 제거
                        trailTimer.remove();
                        updateTimer.remove();
                        proj.destroy();
                    });
                    
                    // 7초 후 발사체 제거 (시간 증가)
                    this.scene.time.delayedCall(7000, () => {
                        if (projectile.active) {
                            trailTimer.remove();
                            updateTimer.remove();
                            projectile.destroy();
                        }
                    });
                }
            });
            
            // 쿨다운 설정 (1.5초로 감소)
            this.scene.time.delayedCall(1500, () => {
                this.specialAbilityCooldown = false;
            });
        }
    }
    
    changeBehavior() {
        // 보스는 행동 패턴 변경 없음
        if (this.type === 'boss') return;
        
        // 랜덤 행동 패턴 선택
        const behaviors = ['chase', 'circle', 'retreat', 'zigzag'];
        const weights = {
            'normal': [0.7, 0.1, 0.1, 0.1],
            'fast': [0.5, 0.1, 0.1, 0.3],
            'tank': [0.6, 0.2, 0.1, 0.1],
            'ranged': [0.3, 0.4, 0.2, 0.1],
            'explosive': [0.8, 0.0, 0.0, 0.2]
        };
        
        // 적 타입에 따른 가중치 설정
        const typeWeights = weights[this.type] || weights['normal'];
        
        // 가중치에 따른 랜덤 선택
        let random = Math.random();
        let cumulativeWeight = 0;
        
        for (let i = 0; i < behaviors.length; i++) {
            cumulativeWeight += typeWeights[i];
            if (random <= cumulativeWeight) {
                this.currentBehavior = behaviors[i];
                break;
            }
        }
    }
    
    useBossAbility() {
        // 보스 특수 능력 사용
        const abilityType = Phaser.Math.Between(1, 3);
        
        switch (abilityType) {
            case 1:
                this.bossAbilitySummonMinions();
                break;
                
            case 2:
                this.bossAbilityGroundSlam();
                break;
                
            case 3:
                this.bossAbilityRapidAttack();
                break;
        }
    }
    
    bossAbilitySummonMinions() {
        // 미니언 소환 능력
        const count = Phaser.Math.Between(2, 4);
        
        // 소환 효과
        const summonEffect = this.scene.add.circle(this.x, this.y, 100, 0xff00ff, 0.3);
        
        // 효과 애니메이션
        this.scene.tweens.add({
            targets: summonEffect,
            scale: 2,
            alpha: 0,
            duration: 1000,
            onComplete: () => {
                summonEffect.destroy();
            }
        });
        
        // 미니언 소환
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            const x = this.x + Math.cos(angle) * 50;
            const y = this.y + Math.sin(angle) * 50;
            
            // 랜덤 타입 선택
            const types = ['normal', 'fast'];
            const type = types[Phaser.Math.Between(0, 1)];
            
            // 미니언 생성
            const minion = new Enemy(this.scene, x, y, type);
            minion.setScale(0.7); // 작은 크기
            
            // 미니언 추가
            this.scene.enemies.add(minion);
            
            // 소환 효과
            const minionEffect = this.scene.add.circle(x, y, 20, 0xff00ff, 0.7);
            
            this.scene.tweens.add({
                targets: minionEffect,
                scale: 0,
                alpha: 0,
                duration: 500,
                onComplete: () => {
                    minionEffect.destroy();
                }
            });
        }
    }
    
    bossAbilityGroundSlam() {
        // 땅 내려찍기 능력
        
        // 경고 효과
        const warningRadius = 200;
        const warning = this.scene.add.circle(this.x, this.y, warningRadius, 0xff0000, 0.3);
        
        // 경고 애니메이션
        this.scene.tweens.add({
            targets: warning,
            alpha: 0.6,
            duration: 1000,
            yoyo: true,
            repeat: 1,
            onComplete: () => {
                warning.destroy();
                
                // 공격 효과
                const slam = this.scene.add.circle(this.x, this.y, warningRadius, 0xff0000, 0.7);
                
                // 범위 내 플레이어 데미지
                const player = this.scene.player;
                const distance = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
                
                if (distance < warningRadius) {
                    player.takeDamage(this.damage * 2);
                    
                    // 넉백 효과
                    const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
                    const knockbackX = Math.cos(angle) * 300;
                    const knockbackY = Math.sin(angle) * 300;
                    
                    player.x += knockbackX;
                    player.y += knockbackY;
                }
                
                // 효과 애니메이션
                this.scene.tweens.add({
                    targets: slam,
                    scale: 0,
                    alpha: 0,
                    duration: 500,
                    onComplete: () => {
                        slam.destroy();
                    }
                });
            }
        });
    }
    
    bossAbilityRapidAttack() {
        // 연속 공격 능력
        const attackCount = 5;
        const attackDelay = 300;
        
        // 공격 준비 효과
        this.setTint(0xffff00);
        
        // 연속 공격
        for (let i = 0; i < attackCount; i++) {
            this.scene.time.delayedCall(i * attackDelay, () => {
                // 플레이어 방향으로 빠르게 돌진
                if (this.scene.player) {
                    const player = this.scene.player;
                    const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
                    
                    // 돌진 효과
                    const dashLine = this.scene.add.line(
                        0, 0,
                        this.x, this.y,
                        this.x + Math.cos(angle) * 100,
                        this.y + Math.sin(angle) * 100,
                        0xffff00
                    );
                    dashLine.setLineWidth(3);
                    dashLine.setOrigin(0, 0);
                    
                    // 효과 애니메이션
                    this.scene.tweens.add({
                        targets: dashLine,
                        alpha: 0,
                        duration: 200,
                        onComplete: () => {
                            dashLine.destroy();
                        }
                    });
                    
                    // 위치 이동
                    this.x += Math.cos(angle) * 100;
                    this.y += Math.sin(angle) * 100;
                    
                    // 플레이어와 충돌 체크
                    const distance = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
                    
                    if (distance < 50) {
                        player.takeDamage(this.damage);
                    }
                }
            });
        }
        
        // 공격 종료 후 색상 복구
        this.scene.time.delayedCall(attackCount * attackDelay, () => {
            this.clearTint();
            this.setTint(0xff00ff); // 보스 색상 복구
        });
    }
    
    takeDamage(amount) {
        // 체력 감소
        this.health -= amount;
        
        // 피격 효과
        this.scene.tweens.add({
            targets: this,
            alpha: 0.5,
            duration: 100,
            yoyo: true
        });
        
        // 체력바 업데이트
        this.updateHealthBar();
        
        // 체력이 0 이하면 사망
        if (this.health <= 0) {
            this.die();
        }
        
        // 폭발형 적이 사망하면 폭발
        if (this.type === 'explosive' && this.health <= 0) {
            this.explode();
        }
    }
    
    updateHealthBar() {
        // 체력바 위치 업데이트
        this.healthBar.x = this.x;
        this.healthBar.y = this.y - 20;
        
        // 체력바 너비 업데이트
        const healthPercent = this.health / this.maxHealth;
        this.healthBar.width = 30 * healthPercent;
        
        // 체력에 따른 색상 변경
        if (healthPercent > 0.6) {
            this.healthBar.fillColor = 0x00ff00; // 녹색
        } else if (healthPercent > 0.3) {
            this.healthBar.fillColor = 0xffff00; // 노란색
        } else {
            this.healthBar.fillColor = 0xff0000; // 빨간색
        }
    }
    
    explode() {
        // 폭발 효과
        const explosion = this.scene.add.circle(this.x, this.y, this.explosionRadius, 0xff8800, 0.7);
        
        // 효과 애니메이션
        this.scene.tweens.add({
            targets: explosion,
            scale: 2,
            alpha: 0,
            duration: 500,
            onComplete: () => {
                explosion.destroy();
            }
        });
        
        // 폭발 효과음
        try {
            this.scene.sound.play('explosion');
        } catch (error) {
            console.error('폭발 효과음 재생 중 오류:', error);
        }
        
        // 범위 내 플레이어 데미지
        const player = this.scene.player;
        const distance = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
        
        if (distance < this.explosionRadius) {
            player.takeDamage(this.damage * 2);
        }
    }
    
    die() {
        // 사망 효과음 재생
        try {
            this.scene.sound.play('enemy_death');
        } catch (error) {
            console.error('사망 효과음 재생 중 오류 발생:', error);
        }
        
        // 사망 효과 생성
        this.createDeathEffect();
        
        // 아이템 드롭
        this.dropItem();
        
        // 경험치 드롭
        this.dropExperience();
        
        // 적 처치 이벤트 발생
        if (this.scene.onEnemyKilled) {
            this.scene.onEnemyKilled(this);
        }
        
        // 객체 제거
        this.destroy();
    }
    
    // 사망 효과 생성
    createDeathEffect() {
        // 사망 효과 애니메이션
        this.scene.tweens.add({
            targets: this,
            alpha: 0,
            scale: 0,
            duration: 300
        });
        
        // 파티클 효과
        const particleColor = this.getParticleColor();
        const circle = this.scene.add.circle(this.x, this.y, 20, particleColor, 0.7);
        
        // 효과 애니메이션
        this.scene.tweens.add({
            targets: circle,
            scale: 2,
            alpha: 0,
            duration: 500,
            onComplete: () => {
                circle.destroy();
            }
        });
        
        // 체력바 제거
        if (this.healthBar) {
            this.healthBar.destroy();
        }
        
        // 타이머 제거
        if (this.behaviorTimer) {
            this.behaviorTimer.remove();
        }
        
        if (this.bossAbilityTimer) {
            this.bossAbilityTimer.remove();
        }
    }
    
    // 파티클 색상 가져오기
    getParticleColor() {
        switch (this.type) {
            case 'normal':
                return 0xffffff;
            case 'fast':
                return 0x00ff00;
            case 'tank':
                return 0x0000ff;
            case 'ranged':
                return 0xffff00;
            case 'explosive':
                return 0xff8800;
            case 'boss':
                return 0xff0000;
            default:
                return 0xffffff;
        }
    }
    
    // 아이템 드롭
    dropItem() {
        // 아이템 드롭 확률에 따라 아이템 생성
        if (Math.random() < this.dropRate) {
            const Item = require('./Item').Item;
            new Item(this.scene, this.x, this.y);
        }
        
        // 보스는 항상 아이템 드롭
        if (this.type === 'boss') {
            const Item = require('./Item').Item;
            
            // 보스는 희귀 아이템 드롭
            const rarity = Math.random() < 0.5 ? 'epic' : 'legendary';
            new Item(this.scene, this.x, this.y, 'spirit', rarity);
        }
    }
    
    // 경험치 드롭
    dropExperience() {
        // 플레이어에게 경험치 추가
        if (this.scene.player) {
            this.scene.player.addExperience(this.expValue);
            
            // 경험치 텍스트 효과
            const expText = this.scene.add.text(
                this.x,
                this.y - 30,
                `+${this.expValue} EXP`,
                {
                    font: '16px Arial',
                    fill: '#00ffff'
                }
            ).setOrigin(0.5);
            
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
    }
    
    // 애니메이션 설정 메서드 추가
    setupAnimations() {
        try {
            // 기본 애니메이션 설정
            if (this.scene && this.scene.anims) {
                // 이미 애니메이션이 정의되어 있는지 확인
                if (!this.scene.anims.exists('enemy_idle')) {
                    // 적 기본 애니메이션 (idle)
                    this.scene.anims.create({
                        key: 'enemy_idle',
                        frames: this.scene.anims.generateFrameNumbers('enemy', { start: 0, end: 0 }),
                        frameRate: 5,
                        repeat: -1
                    });
                }
                
                // 애니메이션 재생
                this.play('enemy_idle');
            }
        } catch (error) {
            console.error('적 애니메이션 설정 중 오류:', error);
            // 오류가 발생해도 게임 진행에 영향을 주지 않도록 함
        }
    }
    
    // 공격 타이머 시작 메서드 추가
    startAttackTimer() {
        try {
            if (this.scene && this.scene.time) {
                this.attackTimer = this.scene.time.addEvent({
                    delay: this.attackInterval,
                    callback: this.attack,
                    callbackScope: this,
                    loop: true
                });
            }
        } catch (error) {
            console.error('공격 타이머 설정 중 오류:', error);
        }
    }
    
    // 공격 메서드 추가
    attack() {
        try {
            // 플레이어가 없으면 리턴
            if (!this.scene || !this.scene.player) return;
            
            // 플레이어가 있으면 항상 공격 (화면 끝까지 공격 가능)
            // 화면 안에 있는지 확인 (선택적)
            const isPlayerVisible = this.isPlayerOnScreen();
            
            if (isPlayerVisible) {
                // 플레이어에게 데미지
                this.scene.player.takeDamage(this.damage);
                
                // 적 위치에서 플레이어 방향으로 공격 효과 생성
                const player = this.scene.player;
                const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
                
                // 더 강력하고 눈에 띄는 공격 효과
                // 레이저/빔 형태의 공격 효과
                const attackLine = this.scene.add.line(
                    0, 0,
                    this.x, this.y,
                    player.x, player.y,
                    this.getAttackColor()
                );
                attackLine.setLineWidth(5);
                attackLine.setOrigin(0, 0);
                attackLine.setAlpha(0.7);
                
                // 타겟 지점에 적중 효과
                const targetEffect = this.scene.add.circle(
                    player.x,
                    player.y,
                    30,
                    this.getAttackColor(),
                    0.7
                );
                
                // 효과 애니메이션
                this.scene.tweens.add({
                    targets: attackLine,
                    alpha: 0,
                    duration: 300,
                    onComplete: () => {
                        attackLine.destroy();
                    }
                });
                
                this.scene.tweens.add({
                    targets: targetEffect,
                    scale: 0,
                    alpha: 0,
                    duration: 300,
                    onComplete: () => {
                        targetEffect.destroy();
                    }
                });
            }
        } catch (error) {
            console.error('적 공격 중 오류:', error);
        }
    }
    
    // 플레이어가 화면 안에 있는지 확인하는 메서드
    isPlayerOnScreen() {
        try {
            const player = this.scene.player;
            if (!player) return false;
            
            // 카메라가 없으면 항상 true 반환
            if (!this.scene.cameras || !this.scene.cameras.main) return true;
            
            const camera = this.scene.cameras.main;
            
            // 화면 경계 설정 (여유 공간 포함)
            const padding = 100;
            const bounds = {
                left: camera.scrollX - padding,
                right: camera.scrollX + camera.width + padding,
                top: camera.scrollY - padding,
                bottom: camera.scrollY + camera.height + padding
            };
            
            // 플레이어가 화면 경계 안에 있는지 확인
            return (
                player.x >= bounds.left &&
                player.x <= bounds.right &&
                player.y >= bounds.top &&
                player.y <= bounds.bottom
            );
        } catch (error) {
            console.error('화면 확인 중 오류:', error);
            return true; // 오류 발생 시 기본적으로 true 반환
        }
    }
    
    // 적 타입에 따른 공격 색상 반환
    getAttackColor() {
        switch (this.type) {
            case 'normal':
                return 0xff0000; // 빨간색
            case 'fast':
                return 0x00ff00; // 녹색
            case 'tank':
                return 0x0000ff; // 파란색
            case 'ranged':
                return 0xffff00; // 노란색
            case 'explosive':
                return 0xff8800; // 주황색
            case 'boss':
                return 0xff00ff; // 보라색
            default:
                return 0xff0000; // 기본 빨간색
        }
    }
}

// 모듈 내보내기
module.exports = { Enemy }; 