class Spirit extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, name) {
        super(scene, x, y, 'spirit');
        
        // 씬에 추가
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        // 정령 속성
        this.name = name;
        this.level = 1;
        this.damage = 10;
        this.attackSpeed = 1000; // 공격 속도 (밀리초) - 항상 1초로 고정
        this.attackRange = 150; // 공격 범위
        this.targetEnemy = null;
        
        // 속성 설정 (기본값은 불)
        this.element = 'fire';
        
        // 정령 타입 설정
        this.setupSpiritType();
        
        // 애니메이션 설정
        this.setupAnimations();
        
        // 공격 로딩 프로그레스 바 생성
        this.createAttackProgressBar();
        
        // 공격 타이머 설정
        this.attackTimer = scene.time.addEvent({
            delay: this.attackSpeed,
            callback: this.attack,
            callbackScope: this,
            loop: true
        });
        
        // 특수 능력 타이머 설정 (10초마다 발동)
        this.specialAbilityTimer = scene.time.addEvent({
            delay: 10000,
            callback: this.useSpecialAbility,
            callbackScope: this,
            loop: true
        });
        
        // 공격 쿨다운 진행 상태
        this.attackCooldown = 0;
    }
    
    // 공격 로딩 프로그레스 바 생성
    createAttackProgressBar() {
        // 씬이 유효한지 확인
        if (!this.scene) {
            return;
        }
        
        try {
            // 프로그레스 바 배경
            this.progressBarBg = this.scene.add.rectangle(
                this.x,
                this.y - 30,
                30,
                5,
                0x000000,
                0.7
            );
            this.progressBarBg.setDepth(this.depth + 10);
            
            // 프로그레스 바 전경
            this.progressBar = this.scene.add.rectangle(
                this.x - 15,
                this.y - 30,
                0,
                3,
                0xffffff,
                1
            );
            this.progressBar.setOrigin(0, 0.5);
            this.progressBar.setDepth(this.depth + 11);
            
            // 속성에 따른 프로그레스 바 색상 설정
            this.updateProgressBarColor();
        } catch (error) {
            console.error('프로그레스 바 생성 중 오류:', error);
        }
    }
    
    // 프로그레스 바 색상 업데이트
    updateProgressBarColor() {
        if (!this.progressBar) return;
        
        // 속성에 따른 색상 설정
        switch (this.element) {
            case 'fire':
                this.progressBar.fillColor = 0xff5500;
                break;
            case 'water':
                this.progressBar.fillColor = 0x00aaff;
                break;
            case 'earth':
                this.progressBar.fillColor = 0xaa5500;
                break;
            case 'air':
                this.progressBar.fillColor = 0x00ff00;
                break;
            default:
                this.progressBar.fillColor = 0xffffff;
                break;
        }
    }
    
    // 프로그레스 바 업데이트
    updateProgressBar() {
        // 프로그레스 바가 없으면 리턴
        if (!this.progressBarBg || !this.progressBar) return;
        
        // 프로그레스 바 위치 업데이트
        this.progressBarBg.setPosition(this.x, this.y - 30);
        this.progressBar.setPosition(this.x - 15, this.y - 30);
        
        // 프로그레스 바 너비 업데이트
        const progress = this.attackCooldown / this.attackSpeed;
        this.progressBar.width = 30 * progress;
    }
    
    setupSpiritType() {
        // 정령 이름에서 속성 추출
        if (this.name.includes('불')) {
            this.element = 'fire';
            this.setTint(0xff5500);
            this.damage = 15;
            this.attackSpeed = 1000; // 항상 1초로 고정
            this.attackRange = 120;
        } else if (this.name.includes('물')) {
            this.element = 'water';
            this.setTint(0x00aaff);
            this.damage = 12;
            this.attackSpeed = 1000; // 항상 1초로 고정
            this.attackRange = 180;
        } else if (this.name.includes('땅')) {
            this.element = 'earth';
            this.setTint(0xaa5500);
            this.damage = 20;
            this.attackSpeed = 1000; // 항상 1초로 고정
            this.attackRange = 100;
        } else if (this.name.includes('바람')) {
            this.element = 'air';
            this.setTint(0x00ff00);
            this.damage = 10;
            this.attackSpeed = 1000; // 항상 1초로 고정
            this.attackRange = 200;
        } else {
            // 기본 정령 (불 속성)
            this.element = 'fire';
            this.setTint(0xff5500);
            this.damage = 15;
            this.attackSpeed = 1000; // 항상 1초로 고정
            this.attackRange = 120;
        }
        
        // 공격 타이머 업데이트
        if (this.attackTimer) {
            this.attackTimer.delay = this.attackSpeed;
        }
        
        // 프로그레스 바 색상 업데이트
        this.updateProgressBarColor();
    }

    setupAnimations() {
        // 정령 애니메이션 설정
        if (this.scene.anims.exists('spirit_idle')) return;
        
        this.scene.anims.create({
            key: 'spirit_idle',
            frames: this.scene.anims.generateFrameNumbers('spirit', { start: 0, end: 3 }),
            frameRate: 8,
            repeat: -1
        });
        
        // 기본 애니메이션 재생
        this.play('spirit_idle');
        
        // 부유 효과
        this.scene.tweens.add({
            targets: this,
            y: this.y - 5,
            duration: 1000,
            yoyo: true,
            repeat: -1
        });
    }

    update() {
        // 타겟 적 찾기
        if (!this.targetEnemy || !this.targetEnemy.active) {
            this.findTarget();
        }
        
        // 공격 쿨다운 업데이트
        if (this.attackTimer) {
            this.attackCooldown = this.attackTimer.getElapsed();
            this.updateProgressBar();
        }
    }

    moveTo(x, y) {
        // 정령 이동
        this.scene.physics.moveTo(this, x, y, 300);
        
        // 일정 거리 이내에 도달하면 속도 감소
        if (Phaser.Math.Distance.Between(this.x, this.y, x, y) < 10) {
            this.setVelocity(0, 0);
        }
    }

    findTarget() {
        // 가장 가까운 적 찾기
        let closestEnemy = null;
        let closestDistance = Infinity;
        
        if (this.scene.enemies) {
            this.scene.enemies.getChildren().forEach(enemy => {
                if (enemy.active) {
                    const distance = Phaser.Math.Distance.Between(this.x, this.y, enemy.x, enemy.y);
                    
                    if (distance < this.attackRange && distance < closestDistance) {
                        closestEnemy = enemy;
                        closestDistance = distance;
                    }
                }
            });
        }
        
        this.targetEnemy = closestEnemy;
    }

    attack() {
        // 씬이 유효한지 확인
        if (!this.scene || !this.active) {
            return;
        }
        
        // 타겟이 없으면 찾기
        if (!this.targetEnemy || !this.targetEnemy.active) {
            this.findTarget();
        }
        
        // 타겟이 있으면 공격
        if (this.targetEnemy && this.targetEnemy.active) {
            // 타겟과의 거리 확인
            const distance = Phaser.Math.Distance.Between(this.x, this.y, this.targetEnemy.x, this.targetEnemy.y);
            
            // 공격 범위 내에 있으면 공격
            if (distance <= this.attackRange) {
                // 유도 볼 발사
                this.shootGuidedBall();
                
                // 효과음 재생
                try {
                    if (this.scene.sound && this.scene.sound.play) {
                        this.scene.sound.play('spirit_attack');
                    }
                } catch (error) {
                    console.error('효과음 재생 중 오류 발생:', error);
                }
            }
        }
    }
    
    shootGuidedBall() {
        // 씬이 유효한지 확인
        if (!this.scene || !this.active) {
            return;
        }
        
        // 타겟이 없으면 공격하지 않음
        if (!this.targetEnemy || !this.targetEnemy.active) {
            return;
        }
        
        // 속성에 따른 볼 색상 설정
        let color;
        switch (this.element) {
            case 'fire': color = 0xff5500; break;
            case 'water': color = 0x00aaff; break;
            case 'earth': color = 0xaa5500; break;
            case 'air': color = 0x00ff00; break;
            default: color = 0xff5500; break;
        }
        
        try {
            // 볼 생성 (원으로 변경)
            const ball = this.scene.add.circle(this.x, this.y, 10, color, 0.8);
            if (!ball) {
                console.error('볼 생성 실패');
                return;
            }
            
            ball.setDepth(this.depth + 1);
            
            // 볼에 물리 속성 추가
            this.scene.physics.add.existing(ball);
            
            // 볼이 제대로 생성되었는지 확인
            if (!ball.body) {
                console.error('볼 물리 속성 생성 실패');
                if (ball.active) ball.destroy();
                return;
            }
            
            ball.body.setCollideWorldBounds(false);
            
            // 볼 속성 설정
            ball.damage = this.damage;
            ball.element = this.element;
            ball.target = this.targetEnemy;
            ball.lifespan = 3000; // 3초 후 자동 소멸
            ball.speed = 300; // 볼 속도
            
            // 볼 발광 효과 (원으로 변경)
            const glow = this.scene.add.circle(ball.x, ball.y, 15, color, 0.4);
            if (!glow) {
                console.error('발광 효과 생성 실패');
                if (ball.active) ball.destroy();
                return;
            }
            
            glow.setDepth(ball.depth - 1);
            
            // 볼 애니메이션
            try {
                this.scene.tweens.add({
                    targets: glow,
                    scale: { from: 0.7, to: 1.0 },
                    alpha: { from: 0.4, to: 0.2 },
                    duration: 500,
                    yoyo: true,
                    repeat: -1
                });
            } catch (error) {
                console.error('볼 애니메이션 생성 중 오류:', error);
            }
            
            // 볼 업데이트 함수 (간소화)
            const updateBall = (time, delta) => {
                // 볼이 파괴되었거나 물리 속성이 없으면 리턴
                if (!ball || !ball.active || !ball.body) {
                    return;
                }
                
                // 타겟이 없거나 비활성화되었으면 직선으로 계속 이동
                if (!ball.target || !ball.target.active) {
                    return;
                }
                
                try {
                    // 타겟 방향으로 이동
                    const targetX = ball.target.x;
                    const targetY = ball.target.y;
                    
                    // 타겟까지의 각도 계산
                    const angle = Phaser.Math.Angle.Between(ball.x, ball.y, targetX, targetY);
                    
                    // 속도 계산
                    const velocityX = Math.cos(angle) * ball.speed;
                    const velocityY = Math.sin(angle) * ball.speed;
                    
                    // 속도 설정
                    ball.body.setVelocity(velocityX, velocityY);
                    
                    // 발광 효과 위치 업데이트
                    if (glow && glow.active) {
                        glow.setPosition(ball.x, ball.y);
                    }
                } catch (error) {
                    console.error('볼 업데이트 중 오류:', error);
                    // 오류 발생 시 이벤트 리스너 제거
                    if (ball.scene) {
                        ball.scene.events.off('update', updateBall);
                    }
                }
            };
            
            // 볼과 적 충돌 설정
            try {
                if (this.scene.enemies) {
                    const overlapCollider = this.scene.physics.add.overlap(ball, this.scene.enemies, (ball, enemy) => {
                        try {
                            // 데미지 적용
                            if (enemy && enemy.active) {
                                enemy.takeDamage(ball.damage);
                                
                                // 속성별 추가 효과
                                this.applyElementEffect(enemy, ball.element);
                            }
                            
                            // 충돌 효과
                            this.createImpactEffect(ball.x, ball.y, color);
                            
                            // 볼 제거
                            if (ball && ball.active) {
                                // 이벤트 리스너 제거
                                if (ball.scene) {
                                    ball.scene.events.off('update', updateBall);
                                }
                                
                                // 충돌체 제거
                                if (overlapCollider) {
                                    overlapCollider.destroy();
                                }
                                
                                ball.destroy();
                            }
                            
                            if (glow && glow.active) {
                                glow.destroy();
                            }
                        } catch (error) {
                            console.error('볼 충돌 처리 중 오류:', error);
                        }
                    });
                }
            } catch (error) {
                console.error('볼 충돌 설정 중 오류:', error);
            }
            
            // 볼 자동 소멸 타이머
            this.scene.time.delayedCall(ball.lifespan, () => {
                try {
                    // 이벤트 리스너 제거
                    if (ball && ball.scene) {
                        ball.scene.events.off('update', updateBall);
                    }
                    
                    // 볼 제거
                    if (ball && ball.active) {
                        ball.destroy();
                    }
                    
                    // 발광 효과 제거
                    if (glow && glow.active) {
                        glow.destroy();
                    }
                } catch (error) {
                    console.error('볼 소멸 처리 중 오류:', error);
                }
            });
            
            // 볼 업데이트 등록
            this.scene.events.on('update', updateBall);
            
            // 초기 속도 설정 (타겟 방향)
            try {
                const angle = Phaser.Math.Angle.Between(ball.x, ball.y, this.targetEnemy.x, this.targetEnemy.y);
                const velocityX = Math.cos(angle) * ball.speed;
                const velocityY = Math.sin(angle) * ball.speed;
                ball.body.setVelocity(velocityX, velocityY);
            } catch (error) {
                console.error('볼 초기 속도 설정 중 오류:', error);
            }
        } catch (error) {
            console.error('유도 볼 생성 중 오류 발생:', error);
        }
    }
    
    applyElementEffect(enemy, element) {
        // 속성별 추가 효과
        switch (element) {
            case 'fire':
                // 화상 효과 (시간당 추가 데미지)
                if (!enemy.burning) {
                    enemy.burning = true;
                    
                    // 화상 타이머 (3초간 매 초마다 데미지)
                    const burnTimer = this.scene.time.addEvent({
                        delay: 1000,
                        callback: () => {
                            if (enemy && enemy.active) {
                                enemy.takeDamage(this.damage * 0.2);
                                this.createElementEffect(enemy.x, enemy.y, 0xff5500, 0.5);
                            }
                        },
                        repeat: 2
                    });
                    
                    // 화상 종료 후 상태 초기화
                    this.scene.time.delayedCall(3000, () => {
                        if (enemy && enemy.active) {
                            enemy.burning = false;
                        }
                    });
                }
                break;
                
            case 'water':
                // 둔화 효과 (이동 속도 감소)
                if (!enemy.slowed) {
                    enemy.slowed = true;
                    
                    // 원래 속도 저장
                    const originalSpeed = enemy.speed;
                    
                    // 속도 감소
                    enemy.speed *= 0.6;
                    
                    // 둔화 효과 표시
                    this.createElementEffect(enemy.x, enemy.y, 0x00aaff, 0.5);
                    
                    // 둔화 종료 후 상태 초기화
                    this.scene.time.delayedCall(2000, () => {
                        if (enemy && enemy.active) {
                            enemy.speed = originalSpeed;
                            enemy.slowed = false;
                        }
                    });
                }
                break;
                
            case 'earth':
                // 넉백 효과 (밀어내기)
                const angle = Phaser.Math.Angle.Between(this.x, this.y, enemy.x, enemy.y);
                const knockbackForce = 200;
                
                enemy.body.setVelocity(
                    Math.cos(angle) * knockbackForce,
                    Math.sin(angle) * knockbackForce
                );
                
                // 넉백 효과 표시
                this.createElementEffect(enemy.x, enemy.y, 0xaa5500, 0.5);
                break;
                
            case 'air':
                // 다중 타격 효과 (주변 적에게 추가 데미지)
                this.scene.enemies.getChildren().forEach(nearbyEnemy => {
                    if (nearbyEnemy !== enemy && nearbyEnemy.active) {
                        const distance = Phaser.Math.Distance.Between(enemy.x, enemy.y, nearbyEnemy.x, nearbyEnemy.y);
                        
                        if (distance < 100) {
                            nearbyEnemy.takeDamage(this.damage * 0.5);
                            this.createElementEffect(nearbyEnemy.x, nearbyEnemy.y, 0x00ff00, 0.5);
                        }
                    }
                });
                break;
        }
    }
    
    createImpactEffect(x, y, color) {
        // 씬이 유효한지 확인
        if (!this.scene || !this.active) {
            return;
        }
        
        try {
            // 충돌 효과 생성
            const impact = this.scene.add.circle(x, y, 20, color, 0.7);
            impact.setDepth(this.depth + 1);
            
            // 충돌 효과 애니메이션
            this.scene.tweens.add({
                targets: impact,
                scale: { from: 0.5, to: 1.5 },
                alpha: { from: 0.7, to: 0 },
                duration: 300,
                onComplete: () => {
                    if (impact && impact.active) {
                        impact.destroy();
                    }
                }
            });
        } catch (error) {
            console.error('충돌 효과 생성 중 오류:', error);
        }
    }
    
    createElementEffect(x, y, color, alpha = 0.7) {
        // 씬이 유효한지 확인
        if (!this.scene || !this.active) {
            return;
        }
        
        try {
            // 속성 효과 생성
            const effect = this.scene.add.circle(x, y, 15, color, alpha);
            effect.setDepth(this.depth + 1);
            
            // 효과 애니메이션
            this.scene.tweens.add({
                targets: effect,
                scale: { from: 0.5, to: 1.2 },
                alpha: { from: alpha, to: 0 },
                duration: 500,
                onComplete: () => {
                    if (effect && effect.active) {
                        effect.destroy();
                    }
                }
            });
        } catch (error) {
            console.error('속성 효과 생성 중 오류:', error);
        }
    }
    
    useSpecialAbility() {
        // 씬이 유효한지 확인
        if (!this.scene || !this.active) {
            return;
        }
        
        // 특수 능력 사용
        switch (this.element) {
            case 'fire':
                this.fireSpecialAbility();
                break;
            case 'water':
                this.waterSpecialAbility();
                break;
            case 'earth':
                this.earthSpecialAbility();
                break;
            case 'air':
                this.windSpecialAbility();
                break;
        }
    }
    
    fireSpecialAbility() {
        // 씬이 유효한지 확인
        if (!this.scene || !this.active) {
            return;
        }
        
        // 불 정령 특수 능력: 화염 폭발 (주변 모든 적에게 데미지)
        const explosionRadius = 200;
        
        try {
            // 특수 능력 효과 생성
            const explosion = this.scene.add.circle(this.x, this.y, explosionRadius, 0xff5500, 0.3);
            
            // 효과 애니메이션
            this.scene.tweens.add({
                targets: explosion,
                alpha: 0,
                duration: 1000,
                onComplete: () => {
                    if (explosion && explosion.active) {
                        explosion.destroy();
                    }
                }
            });
            
            // 범위 내 모든 적에게 데미지
            if (this.scene.enemies) {
                this.scene.enemies.getChildren().forEach(enemy => {
                    if (enemy && enemy.active) {
                        const distance = Phaser.Math.Distance.Between(this.x, this.y, enemy.x, enemy.y);
                        
                        if (distance < explosionRadius) {
                            enemy.takeDamage(this.damage * 2);
                            
                            // 화상 효과
                            this.createElementEffect(enemy.x, enemy.y, 0xff5500);
                        }
                    }
                });
            }
        } catch (error) {
            console.error('화염 폭발 특수 능력 사용 중 오류:', error);
        }
    }
    
    waterSpecialAbility() {
        // 씬이 유효한지 확인
        if (!this.scene || !this.active || !this.scene.player) {
            return;
        }
        
        try {
            // 물 정령 특수 능력: 치유의 물결 (플레이어 체력 회복)
            const healAmount = this.level * 5;
            
            // 특수 능력 효과 생성
            const healWave = this.scene.add.circle(this.scene.player.x, this.scene.player.y, 100, 0x00aaff, 0.3);
            
            // 효과 애니메이션
            this.scene.tweens.add({
                targets: healWave,
                scale: 2,
                alpha: 0,
                duration: 1000,
                onComplete: () => {
                    if (healWave && healWave.active) {
                        healWave.destroy();
                    }
                }
            });
            
            // 플레이어 체력 회복
            this.scene.player.heal(healAmount);
        } catch (error) {
            console.error('치유의 물결 특수 능력 사용 중 오류:', error);
        }
    }
    
    earthSpecialAbility() {
        // 씬이 유효한지 확인
        if (!this.scene || !this.active || !this.scene.player) {
            return;
        }
        
        try {
            // 땅 정령 특수 능력: 대지의 보호막 (플레이어 일시적 무적)
            const shieldDuration = 5000; // 5초
            
            // 특수 능력 효과 생성
            const shield = this.scene.add.circle(this.scene.player.x, this.scene.player.y, 50, 0xaa5500, 0.3);
            
            // 효과 애니메이션
            this.scene.tweens.add({
                targets: shield,
                alpha: 0.5,
                duration: 500,
                yoyo: true,
                repeat: 9
            });
            
            // 플레이어 무적 상태 설정
            this.scene.player.invulnerable = true;
            
            // 무적 상태 종료 타이머
            this.scene.time.delayedCall(shieldDuration, () => {
                if (this.scene && this.scene.player && this.scene.player.active) {
                    this.scene.player.invulnerable = false;
                }
                if (shield && shield.active) {
                    shield.destroy();
                }
            });
        } catch (error) {
            console.error('대지의 보호막 특수 능력 사용 중 오류:', error);
        }
    }
    
    windSpecialAbility() {
        // 씬이 유효한지 확인
        if (!this.scene || !this.active) {
            return;
        }
        
        try {
            // 바람 정령 특수 능력: 회오리 바람 (모든 적을 밀어냄)
            const pushRadius = 300;
            
            // 특수 능력 효과 생성
            const windCircle = this.scene.add.circle(this.x, this.y, pushRadius, 0x00ff00, 0.3);
            
            // 효과 애니메이션
            this.scene.tweens.add({
                targets: windCircle,
                scale: 2,
                alpha: 0,
                duration: 1000,
                onComplete: () => {
                    if (windCircle && windCircle.active) {
                        windCircle.destroy();
                    }
                }
            });
            
            // 범위 내 모든 적 밀어내기
            if (this.scene.enemies) {
                this.scene.enemies.getChildren().forEach(enemy => {
                    if (enemy && enemy.active) {
                        const distance = Phaser.Math.Distance.Between(this.x, this.y, enemy.x, enemy.y);
                        
                        if (distance < pushRadius) {
                            const angle = Phaser.Math.Angle.Between(this.x, this.y, enemy.x, enemy.y);
                            const pushX = Math.cos(angle) * 200;
                            const pushY = Math.sin(angle) * 200;
                            
                            enemy.x += pushX;
                            enemy.y += pushY;
                            
                            // 밀어내기 효과
                            this.createElementEffect(enemy.x, enemy.y, 0x00ff00);
                        }
                    }
                });
            }
        } catch (error) {
            console.error('회오리 바람 특수 능력 사용 중 오류:', error);
        }
    }

    upgrade() {
        // 레벨 증가
        this.level++;
        
        // 데미지 증가
        this.damage += 5;
        
        // 공격 속도는 1초로 유지
        this.attackSpeed = 1000;
        
        // 공격 타이머 업데이트
        this.attackTimer.reset({
            delay: this.attackSpeed,
            callback: this.attack,
            callbackScope: this,
            loop: true
        });
        
        // 공격 범위 증가
        this.attackRange += 20;
        
        // 크기 증가
        this.setScale(this.scale + 0.1);
        
        // 업그레이드 효과 생성
        this.createUpgradeEffect();
    }

    createUpgradeEffect() {
        // 업그레이드 효과 생성
        const effect = this.scene.add.sprite(this.x, this.y, 'upgrade_effect');
        
        // 효과 애니메이션 (회전 및 페이드 아웃)
        this.scene.tweens.add({
            targets: effect,
            angle: 360,
            scale: 2,
            alpha: 0,
            duration: 500,
            onComplete: () => {
                effect.destroy();
            }
        });
    }
    
    // 정령 파괴 시 타이머 정리
    destroy(fromScene) {
        // 프로그레스 바 제거
        if (this.progressBarBg && this.progressBarBg.active) {
            this.progressBarBg.destroy();
        }
        
        if (this.progressBar && this.progressBar.active) {
            this.progressBar.destroy();
        }
        
        // 타이머 제거
        if (this.attackTimer) {
            this.attackTimer.remove();
            this.attackTimer = null;
        }
        
        if (this.specialAbilityTimer) {
            this.specialAbilityTimer.remove();
            this.specialAbilityTimer = null;
        }
        
        // 부모 클래스의 destroy 호출
        super.destroy(fromScene);
    }
}

module.exports = { Spirit }; 