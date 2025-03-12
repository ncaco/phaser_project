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
        // 타겟 적이 없으면 리턴
        if (!this.targetEnemy) return;
        
        // 공격 효과음 재생
        try {
            this.scene.sound.play('attack');
        } catch (error) {
            console.error('공격 효과음 재생 중 오류:', error);
        }
        
        // 정령 타입에 따른 공격 방식
        switch (this.type) {
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
                
            default:
                this.normalAttack();
                break;
        }
        
        // 공격 시각 효과
        this.scene.tweens.add({
            targets: this,
            scaleX: 1.2,
            scaleY: 1.2,
            duration: 100,
            yoyo: true
        });
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
        // 정령 타입에 따른 특수 능력
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
}

module.exports = { Spirit }; 