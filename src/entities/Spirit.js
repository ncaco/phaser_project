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
        this.attackSpeed = 1000; // 공격 속도 (밀리초)
        this.attackRange = 150; // 공격 범위
        this.targetEnemy = null;
        
        // 정령 타입 설정
        this.setupSpiritType();
        
        // 애니메이션 설정
        this.setupAnimations();
        
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
    }
    
    setupSpiritType() {
        // 정령 타입에 따른 속성 설정
        switch (this.name) {
            case '기본 정령':
                this.type = 'normal';
                this.damage = 10;
                this.attackSpeed = 1000;
                this.attackRange = 150;
                this.setTint(0xffffff);
                break;
                
            case '불 정령':
                this.type = 'fire';
                this.damage = 15;
                this.attackSpeed = 1200;
                this.attackRange = 120;
                this.setTint(0xff5500);
                break;
                
            case '물 정령':
                this.type = 'water';
                this.damage = 8;
                this.attackSpeed = 800;
                this.attackRange = 180;
                this.setTint(0x00aaff);
                break;
                
            case '바람 정령':
                this.type = 'wind';
                this.damage = 6;
                this.attackSpeed = 500;
                this.attackRange = 200;
                this.setTint(0x00ff00);
                break;
                
            case '땅 정령':
                this.type = 'earth';
                this.damage = 20;
                this.attackSpeed = 1500;
                this.attackRange = 100;
                this.setTint(0xaa5500);
                break;
                
            case '번개 정령':
                this.type = 'lightning';
                this.damage = 25;
                this.attackSpeed = 2000;
                this.attackRange = 250;
                this.setTint(0xffff00);
                break;
                
            case '얼음 정령':
                this.type = 'ice';
                this.damage = 12;
                this.attackSpeed = 1100;
                this.attackRange = 160;
                this.setTint(0x00ffff);
                break;
                
            case '빛 정령':
                this.type = 'light';
                this.damage = 18;
                this.attackSpeed = 1300;
                this.attackRange = 220;
                this.setTint(0xffffaa);
                break;
                
            default:
                this.type = 'normal';
                this.damage = 10;
                this.attackSpeed = 1000;
                this.attackRange = 150;
                this.setTint(0xffffff);
                break;
        }
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
        // 가장 가까운 적 찾기
        this.findNearestEnemy();
    }

    moveTo(x, y) {
        // 정령 이동
        this.scene.physics.moveTo(this, x, y, 300);
        
        // 일정 거리 이내에 도달하면 속도 감소
        if (Phaser.Math.Distance.Between(this.x, this.y, x, y) < 10) {
            this.setVelocity(0, 0);
        }
    }

    findNearestEnemy() {
        // 적 그룹이 없으면 리턴
        if (!this.scene.enemies) return;
        
        let nearestEnemy = null;
        let minDistance = this.attackRange;
        
        // 모든 적을 순회하며 가장 가까운 적 찾기
        this.scene.enemies.getChildren().forEach(enemy => {
            const distance = Phaser.Math.Distance.Between(this.x, this.y, enemy.x, enemy.y);
            
            if (distance < minDistance) {
                minDistance = distance;
                nearestEnemy = enemy;
            }
        });
        
        // 가장 가까운 적 설정
        this.targetEnemy = nearestEnemy;
    }

    attack() {
        // 타겟 적이 없으면 가장 가까운 적 찾기
        if (!this.targetEnemy) {
            this.findNearestEnemy();
        }
        
        // 타겟 적이 있으면 공격
        if (this.targetEnemy && this.targetEnemy.active) {
            // 적과의 거리 계산
            const distance = Phaser.Math.Distance.Between(
                this.x, this.y,
                this.targetEnemy.x, this.targetEnemy.y
            );
            
            // 공격 범위 내에 있으면 공격
            if (distance <= this.attackRange) {
                // 정령 타입에 따른 공격 방식
                switch (this.type) {
                    case 'normal':
                        this.normalAttack();
                        break;
                    case 'fire':
                        this.fireAttack();
                        break;
                    case 'water':
                        this.waterAttack();
                        break;
                    case 'wind':
                        this.windAttack();
                        break;
                    case 'earth':
                        this.earthAttack();
                        break;
                    case 'lightning':
                        this.lightningAttack();
                        break;
                    case 'ice':
                        this.iceAttack();
                        break;
                    case 'light':
                        this.lightAttack();
                        break;
                }
                
                // 효과음 재생
                try {
                    this.scene.sound.play('spirit_attack');
                } catch (error) {
                    console.error('효과음 재생 중 오류 발생:', error);
                }
            }
        } else {
            // 타겟 적이 없거나 비활성화되었으면 새로운 타겟 찾기
            this.targetEnemy = null;
        }
    }
    
    normalAttack() {
        // 기본 공격 (단일 타겟)
        this.targetEnemy.takeDamage(this.damage);
        
        // 공격 효과 생성
        this.createAttackEffect(this.targetEnemy.x, this.targetEnemy.y, 0xffffff);
    }
    
    fireAttack() {
        // 불 공격 (단일 타겟 + 화상 데미지)
        this.targetEnemy.takeDamage(this.damage);
        
        // 화상 효과 (시간당 추가 데미지)
        if (!this.targetEnemy.burning) {
            this.targetEnemy.burning = true;
            
            // 화상 타이머 (3초간 매 초마다 데미지)
            const burnTimer = this.scene.time.addEvent({
                delay: 1000,
                callback: () => {
                    if (this.targetEnemy && this.targetEnemy.active) {
                        this.targetEnemy.takeDamage(this.damage * 0.2);
                        
                        // 화상 효과 생성
                        this.createAttackEffect(this.targetEnemy.x, this.targetEnemy.y, 0xff5500, 0.5);
                    }
                },
                repeat: 2
            });
            
            // 화상 종료 후 상태 초기화
            this.scene.time.delayedCall(3000, () => {
                if (this.targetEnemy && this.targetEnemy.active) {
                    this.targetEnemy.burning = false;
                }
            });
        }
        
        // 공격 효과 생성
        this.createAttackEffect(this.targetEnemy.x, this.targetEnemy.y, 0xff5500);
    }
    
    waterAttack() {
        // 물 공격 (다중 타겟)
        const targets = [];
        
        // 주변 적 찾기 (최대 3명)
        this.scene.enemies.getChildren().forEach(enemy => {
            const distance = Phaser.Math.Distance.Between(this.targetEnemy.x, this.targetEnemy.y, enemy.x, enemy.y);
            
            if (distance < 100) {
                targets.push(enemy);
                
                if (targets.length >= 3) return;
            }
        });
        
        // 모든 타겟에게 데미지
        targets.forEach(target => {
            target.takeDamage(this.damage);
            
            // 공격 효과 생성
            this.createAttackEffect(target.x, target.y, 0x00aaff);
        });
    }
    
    windAttack() {
        // 바람 공격 (빠른 공격 속도 + 적 밀어내기)
        this.targetEnemy.takeDamage(this.damage);
        
        // 적 밀어내기
        const angle = Phaser.Math.Angle.Between(this.x, this.y, this.targetEnemy.x, this.targetEnemy.y);
        const pushX = Math.cos(angle) * 100;
        const pushY = Math.sin(angle) * 100;
        
        this.targetEnemy.x += pushX;
        this.targetEnemy.y += pushY;
        
        // 공격 효과 생성
        this.createAttackEffect(this.targetEnemy.x, this.targetEnemy.y, 0x00ff00);
    }
    
    earthAttack() {
        // 땅 공격 (높은 데미지 + 적 이동속도 감소)
        this.targetEnemy.takeDamage(this.damage);
        
        // 이동속도 감소 효과
        if (!this.targetEnemy.slowed) {
            this.targetEnemy.slowed = true;
            
            // 원래 속도 저장
            const originalSpeed = this.targetEnemy.speed;
            
            // 속도 감소
            this.targetEnemy.speed *= 0.5;
            
            // 3초 후 원래 속도로 복구
            this.scene.time.delayedCall(3000, () => {
                if (this.targetEnemy && this.targetEnemy.active) {
                    this.targetEnemy.speed = originalSpeed;
                    this.targetEnemy.slowed = false;
                }
            });
        }
        
        // 공격 효과 생성
        this.createAttackEffect(this.targetEnemy.x, this.targetEnemy.y, 0xaa5500);
    }
    
    lightningAttack() {
        // 번개 공격 (높은 데미지 + 확률적 스턴)
        this.targetEnemy.takeDamage(this.damage);
        
        // 25% 확률로 스턴
        if (Phaser.Math.Between(1, 100) <= 25 && !this.targetEnemy.stunned) {
            this.targetEnemy.stunned = true;
            
            // 원래 속도 저장
            const originalSpeed = this.targetEnemy.speed;
            
            // 이동 정지
            this.targetEnemy.speed = 0;
            
            // 스턴 효과
            this.targetEnemy.setTint(0xffff00);
            
            // 2초 후 원래 상태로 복구
            this.scene.time.delayedCall(2000, () => {
                if (this.targetEnemy && this.targetEnemy.active) {
                    this.targetEnemy.speed = originalSpeed;
                    this.targetEnemy.stunned = false;
                    this.targetEnemy.clearTint();
                }
            });
        }
        
        // 공격 효과 생성
        this.createAttackEffect(this.targetEnemy.x, this.targetEnemy.y, 0xffff00);
    }

    createAttackEffect(x, y, color, scale = 1) {
        // 공격 효과 생성
        const effect = this.scene.add.circle(x, y, 10 * scale, color, 0.7);
        
        // 효과 애니메이션
        this.scene.tweens.add({
            targets: effect,
            scale: 2,
            alpha: 0,
            duration: 300,
            onComplete: () => {
                effect.destroy();
            }
        });
    }
    
    useSpecialAbility() {
        // 특수 능력 사용
        switch (this.type) {
            case 'fire':
                this.fireSpecialAbility();
                break;
            case 'water':
                this.waterSpecialAbility();
                break;
            case 'wind':
                this.windSpecialAbility();
                break;
            case 'earth':
                this.earthSpecialAbility();
                break;
            case 'lightning':
                this.lightningSpecialAbility();
                break;
            case 'ice':
                this.iceSpecialAbility();
                break;
            case 'light':
                this.lightSpecialAbility();
                break;
        }
    }
    
    fireSpecialAbility() {
        // 불 정령 특수 능력: 화염 폭발 (주변 모든 적에게 데미지)
        const explosionRadius = 200;
        
        // 특수 능력 효과 생성
        const explosion = this.scene.add.circle(this.x, this.y, explosionRadius, 0xff5500, 0.3);
        
        // 효과 애니메이션
        this.scene.tweens.add({
            targets: explosion,
            alpha: 0,
            duration: 1000,
            onComplete: () => {
                explosion.destroy();
            }
        });
        
        // 범위 내 모든 적에게 데미지
        this.scene.enemies.getChildren().forEach(enemy => {
            const distance = Phaser.Math.Distance.Between(this.x, this.y, enemy.x, enemy.y);
            
            if (distance < explosionRadius) {
                enemy.takeDamage(this.damage * 2);
                
                // 화상 효과
                this.createAttackEffect(enemy.x, enemy.y, 0xff5500);
            }
        });
    }
    
    waterSpecialAbility() {
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
                healWave.destroy();
            }
        });
        
        // 플레이어 체력 회복
        this.scene.player.heal(healAmount);
    }
    
    windSpecialAbility() {
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
                windCircle.destroy();
            }
        });
        
        // 범위 내 모든 적 밀어내기
        this.scene.enemies.getChildren().forEach(enemy => {
            const distance = Phaser.Math.Distance.Between(this.x, this.y, enemy.x, enemy.y);
            
            if (distance < pushRadius) {
                const angle = Phaser.Math.Angle.Between(this.x, this.y, enemy.x, enemy.y);
                const pushX = Math.cos(angle) * 200;
                const pushY = Math.sin(angle) * 200;
                
                enemy.x += pushX;
                enemy.y += pushY;
                
                // 밀어내기 효과
                this.createAttackEffect(enemy.x, enemy.y, 0x00ff00);
            }
        });
    }
    
    earthSpecialAbility() {
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
            this.scene.player.invulnerable = false;
            shield.destroy();
        });
    }
    
    lightningSpecialAbility() {
        // 번개 정령 특수 능력: 번개 체인 (여러 적을 연속 공격)
        const maxTargets = 5;
        const targets = [];
        
        // 첫 번째 타겟 찾기
        if (this.targetEnemy) {
            targets.push(this.targetEnemy);
            
            // 연쇄 타겟 찾기
            let lastTarget = this.targetEnemy;
            
            for (let i = 1; i < maxTargets; i++) {
                let nextTarget = null;
                let minDistance = 200;
                
                this.scene.enemies.getChildren().forEach(enemy => {
                    if (!targets.includes(enemy)) {
                        const distance = Phaser.Math.Distance.Between(lastTarget.x, lastTarget.y, enemy.x, enemy.y);
                        
                        if (distance < minDistance) {
                            minDistance = distance;
                            nextTarget = enemy;
                        }
                    }
                });
                
                if (nextTarget) {
                    targets.push(nextTarget);
                    lastTarget = nextTarget;
                } else {
                    break;
                }
            }
            
            // 연쇄 공격
            for (let i = 0; i < targets.length; i++) {
                const target = targets[i];
                
                // 딜레이를 두고 순차적으로 공격
                this.scene.time.delayedCall(i * 200, () => {
                    if (target && target.active) {
                        target.takeDamage(this.damage * 1.5);
                        
                        // 번개 효과
                        this.createAttackEffect(target.x, target.y, 0xffff00, 1.5);
                        
                        // 이전 타겟과 연결하는 번개 선
                        if (i > 0 && targets[i-1] && targets[i-1].active) {
                            const prev = targets[i-1];
                            const lightning = this.scene.add.line(0, 0, prev.x, prev.y, target.x, target.y, 0xffff00);
                            lightning.setLineWidth(2);
                            lightning.setOrigin(0, 0);
                            
                            // 번개 선 페이드 아웃
                            this.scene.tweens.add({
                                targets: lightning,
                                alpha: 0,
                                duration: 300,
                                onComplete: () => {
                                    lightning.destroy();
                                }
                            });
                        }
                    }
                });
            }
        }
    }

    upgrade() {
        // 레벨 증가
        this.level++;
        
        // 데미지 증가
        this.damage += 5;
        
        // 공격 속도 증가
        this.attackSpeed = Math.max(200, this.attackSpeed - 100);
        
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

    // 얼음 정령 공격
    iceAttack() {
        if (!this.targetEnemy) return;
        
        // 얼음 공격 효과 생성
        const attackEffect = this.createAttackEffect(
            this.targetEnemy.x,
            this.targetEnemy.y,
            0x00ffff,
            1.2
        );
        
        // 얼음 공격 애니메이션
        this.scene.tweens.add({
            targets: attackEffect,
            scale: 0.5,
            alpha: 0,
            duration: 500,
            onComplete: () => {
                attackEffect.destroy();
            }
        });
        
        // 적에게 데미지 적용
        this.targetEnemy.takeDamage(this.damage);
        
        // 얼음 효과: 적 이동 속도 감소 (30% 확률)
        if (Phaser.Math.Between(1, 100) <= 30) {
            // 이미 감속 효과가 있는지 확인
            if (!this.targetEnemy.slowed) {
                // 원래 속도 저장
                this.targetEnemy.originalSpeed = this.targetEnemy.speed;
                
                // 속도 감소 (50%)
                this.targetEnemy.speed *= 0.5;
                this.targetEnemy.slowed = true;
                
                // 얼음 효과 표시
                this.targetEnemy.setTint(0x00ffff);
                
                // 3초 후 효과 해제
                this.scene.time.delayedCall(3000, () => {
                    if (this.targetEnemy && this.targetEnemy.active) {
                        this.targetEnemy.speed = this.targetEnemy.originalSpeed;
                        this.targetEnemy.slowed = false;
                        this.targetEnemy.clearTint();
                    }
                });
                
                // 얼음 효과 텍스트 표시
                const text = this.scene.add.text(
                    this.targetEnemy.x,
                    this.targetEnemy.y - 30,
                    '빙결!',
                    {
                        font: '16px Arial',
                        fill: '#00ffff'
                    }
                ).setOrigin(0.5);
                
                // 텍스트 애니메이션
                this.scene.tweens.add({
                    targets: text,
                    y: text.y - 20,
                    alpha: 0,
                    duration: 1000,
                    onComplete: () => {
                        text.destroy();
                    }
                });
            }
        }
    }
    
    // 빛 정령 공격
    lightAttack() {
        if (!this.targetEnemy) return;
        
        // 빛 공격 효과 생성
        const attackEffect = this.createAttackEffect(
            this.targetEnemy.x,
            this.targetEnemy.y,
            0xffffaa,
            1.5
        );
        
        // 빛 공격 애니메이션
        this.scene.tweens.add({
            targets: attackEffect,
            scale: 2,
            alpha: 0,
            duration: 500,
            onComplete: () => {
                attackEffect.destroy();
            }
        });
        
        // 적에게 데미지 적용
        this.targetEnemy.takeDamage(this.damage);
        
        // 빛 효과: 주변 적들에게 추가 데미지 (20% 확률)
        if (Phaser.Math.Between(1, 100) <= 20) {
            // 주변 적 찾기 (공격 범위의 1.5배 내)
            const nearbyEnemies = this.scene.enemies.getChildren().filter(enemy => {
                if (enemy === this.targetEnemy || !enemy.active) return false;
                
                const distance = Phaser.Math.Distance.Between(
                    this.targetEnemy.x, this.targetEnemy.y,
                    enemy.x, enemy.y
                );
                
                return distance <= this.attackRange * 1.5;
            });
            
            // 주변 적들에게 추가 데미지
            nearbyEnemies.forEach(enemy => {
                // 빛 확산 효과 생성
                const spreadEffect = this.createAttackEffect(
                    enemy.x,
                    enemy.y,
                    0xffffaa,
                    1
                );
                
                // 확산 효과 애니메이션
                this.scene.tweens.add({
                    targets: spreadEffect,
                    scale: 1.5,
                    alpha: 0,
                    duration: 300,
                    onComplete: () => {
                        spreadEffect.destroy();
                    }
                });
                
                // 추가 데미지 (기본 데미지의 50%)
                enemy.takeDamage(this.damage * 0.5);
            });
            
            // 빛 확산 효과 텍스트 표시
            if (nearbyEnemies.length > 0) {
                const text = this.scene.add.text(
                    this.targetEnemy.x,
                    this.targetEnemy.y - 30,
                    '빛 확산!',
                    {
                        font: '16px Arial',
                        fill: '#ffffaa'
                    }
                ).setOrigin(0.5);
                
                // 텍스트 애니메이션
                this.scene.tweens.add({
                    targets: text,
                    y: text.y - 20,
                    alpha: 0,
                    duration: 1000,
                    onComplete: () => {
                        text.destroy();
                    }
                });
            }
        }
    }
    
    // 얼음 정령 특수 능력: 광역 빙결
    iceSpecialAbility() {
        // 플레이어 주변 모든 적에게 빙결 효과 적용
        const enemies = this.scene.enemies.getChildren().filter(enemy => {
            if (!enemy.active) return false;
            
            const distance = Phaser.Math.Distance.Between(
                this.scene.player.x, this.scene.player.y,
                enemy.x, enemy.y
            );
            
            return distance <= this.attackRange * 2;
        });
        
        if (enemies.length === 0) return;
        
        // 빙결 효과 생성
        const freezeEffect = this.scene.add.circle(
            this.scene.player.x,
            this.scene.player.y,
            this.attackRange * 2,
            0x00ffff,
            0.3
        );
        
        // 효과 애니메이션
        this.scene.tweens.add({
            targets: freezeEffect,
            alpha: 0,
            duration: 1000,
            onComplete: () => {
                freezeEffect.destroy();
            }
        });
        
        // 모든 적에게 빙결 효과 적용
        enemies.forEach(enemy => {
            // 원래 속도 저장
            enemy.originalSpeed = enemy.speed;
            
            // 속도 감소 (70%)
            enemy.speed *= 0.3;
            enemy.slowed = true;
            
            // 얼음 효과 표시
            enemy.setTint(0x00ffff);
            
            // 추가 데미지
            enemy.takeDamage(this.damage * this.level * 0.5);
            
            // 5초 후 효과 해제
            this.scene.time.delayedCall(5000, () => {
                if (enemy && enemy.active) {
                    enemy.speed = enemy.originalSpeed;
                    enemy.slowed = false;
                    enemy.clearTint();
                }
            });
        });
        
        // 특수 능력 텍스트 표시
        const text = this.scene.add.text(
            this.scene.player.x,
            this.scene.player.y - 50,
            '광역 빙결!',
            {
                font: '20px Arial',
                fill: '#00ffff',
                stroke: '#000000',
                strokeThickness: 3
            }
        ).setOrigin(0.5);
        
        // 텍스트 애니메이션
        this.scene.tweens.add({
            targets: text,
            y: text.y - 30,
            alpha: 0,
            duration: 1500,
            onComplete: () => {
                text.destroy();
            }
        });
        
        // 효과음 재생
        try {
            this.scene.sound.play('ice_special');
        } catch (error) {
            console.error('효과음 재생 중 오류 발생:', error);
        }
    }
    
    // 빛 정령 특수 능력: 치유의 빛
    lightSpecialAbility() {
        // 플레이어 치유
        const healAmount = 10 + (this.level * 2);
        this.scene.player.heal(healAmount);
        
        // 치유 효과 생성
        const healEffect = this.scene.add.circle(
            this.scene.player.x,
            this.scene.player.y,
            50,
            0xffffaa,
            0.5
        );
        
        // 효과 애니메이션
        this.scene.tweens.add({
            targets: healEffect,
            scale: 3,
            alpha: 0,
            duration: 1000,
            onComplete: () => {
                healEffect.destroy();
            }
        });
        
        // 치유 파티클 효과
        for (let i = 0; i < 20; i++) {
            const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
            const distance = Phaser.Math.FloatBetween(20, 100);
            
            const x = this.scene.player.x + Math.cos(angle) * distance;
            const y = this.scene.player.y + Math.sin(angle) * distance;
            
            const particle = this.scene.add.circle(x, y, 5, 0xffffaa, 1);
            
            this.scene.tweens.add({
                targets: particle,
                x: this.scene.player.x,
                y: this.scene.player.y,
                alpha: 0,
                duration: Phaser.Math.FloatBetween(500, 1000),
                onComplete: () => {
                    particle.destroy();
                }
            });
        }
        
        // 특수 능력 텍스트 표시
        const text = this.scene.add.text(
            this.scene.player.x,
            this.scene.player.y - 50,
            `치유의 빛! +${healAmount}`,
            {
                font: '20px Arial',
                fill: '#ffffaa',
                stroke: '#000000',
                strokeThickness: 3
            }
        ).setOrigin(0.5);
        
        // 텍스트 애니메이션
        this.scene.tweens.add({
            targets: text,
            y: text.y - 30,
            alpha: 0,
            duration: 1500,
            onComplete: () => {
                text.destroy();
            }
        });
        
        // 효과음 재생
        try {
            this.scene.sound.play('heal_sound');
        } catch (error) {
            console.error('효과음 재생 중 오류 발생:', error);
        }
    }
}

module.exports = { Spirit }; 