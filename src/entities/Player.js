const Spirit = require('./Spirit').Spirit;

class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'player');
        
        // 씬에 추가
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        // 물리 속성 설정
        this.setCollideWorldBounds(true);
        
        // 플레이어 속성
        this.speed = 200;
        this.health = 100;
        this.maxHealth = 100;
        this.invulnerable = false;
        this.invulnerableTime = 500; // 무적 시간 (밀리초)
        
        // 대시 속성
        this.dashSpeed = 400;
        this.dashDuration = 200; // 대시 지속 시간 (밀리초)
        this.dashCooldown = 2000; // 대시 쿨다운 (밀리초)
        this.canDash = true;
        this.isDashing = false;
        
        // 경험치 시스템
        this.experience = 0;
        this.level = 1;
        this.experienceToNextLevel = 100;
        
        // 정령 목록
        this.spirits = [];
        
        // 초기 정령 생성
        this.addSpirit('기본 정령');
        
        // 애니메이션 설정
        this.setupAnimations();
        
        // 키보드 입력 설정
        this.setupKeyboardInput();
    }
    
    setupAnimations() {
        // 플레이어 애니메이션 설정
        if (this.scene.anims.exists('player_idle')) return;
        
        this.scene.anims.create({
            key: 'player_idle',
            frames: this.scene.anims.generateFrameNumbers('player', { start: 0, end: 3 }),
            frameRate: 8,
            repeat: -1
        });
        
        // 기본 애니메이션 재생
        this.play('player_idle');
    }
    
    setupKeyboardInput() {
        // 스페이스바 입력 설정 (대시)
        this.scene.input.keyboard.on('keydown-SPACE', () => {
            this.dash();
        });
    }

    update(cursors) {
        // 대시 중이면 이동 로직 스킵
        if (this.isDashing) return;
        
        // 이동 로직
        this.handleMovement(cursors);
        
        // 정령 업데이트
        this.updateSpirits();
    }

    handleMovement(cursors) {
        // cursors가 undefined인 경우 처리
        if (!cursors) {
            this.setVelocity(0, 0);
            return;
        }
        
        // 수평 이동
        if (cursors.left.isDown) {
            this.setVelocityX(-this.speed);
            this.flipX = true;
        } else if (cursors.right.isDown) {
            this.setVelocityX(this.speed);
            this.flipX = false;
        } else {
            this.setVelocityX(0);
        }
        
        // 수직 이동
        if (cursors.up.isDown) {
            this.setVelocityY(-this.speed);
        } else if (cursors.down.isDown) {
            this.setVelocityY(this.speed);
        } else {
            this.setVelocityY(0);
        }
        
        // 이동 시 시각 효과
        if (this.body.velocity.x !== 0 || this.body.velocity.y !== 0) {
            if (!this.moveEffect) {
                this.moveEffect = this.scene.tweens.add({
                    targets: this,
                    scaleX: 1.1,
                    scaleY: 0.9,
                    duration: 300,
                    yoyo: true,
                    repeat: -1
                });
            }
        } else {
            if (this.moveEffect) {
                this.moveEffect.stop();
                this.moveEffect = null;
                this.setScale(1);
            }
        }
    }
    
    dash() {
        // 대시 쿨다운 체크
        if (!this.canDash || this.isDashing) return;
        
        // 대시 방향 설정 (현재 이동 방향 또는 바라보는 방향)
        let dashVelocityX = this.body.velocity.x;
        let dashVelocityY = this.body.velocity.y;
        
        // 이동 중이 아니면 바라보는 방향으로 대시
        if (dashVelocityX === 0 && dashVelocityY === 0) {
            dashVelocityX = this.flipX ? -1 : 1;
        }
        
        // 대시 속도 정규화
        const length = Math.sqrt(dashVelocityX * dashVelocityX + dashVelocityY * dashVelocityY);
        if (length > 0) {
            dashVelocityX = (dashVelocityX / length) * this.dashSpeed;
            dashVelocityY = (dashVelocityY / length) * this.dashSpeed;
        }
        
        // 대시 상태 설정
        this.isDashing = true;
        this.canDash = false;
        
        // 대시 중 무적 상태
        this.invulnerable = true;
        
        // 대시 속도 설정
        this.setVelocity(dashVelocityX, dashVelocityY);
        
        // 대시 효과
        this.scene.tweens.add({
            targets: this,
            alpha: 0.7,
            duration: this.dashDuration / 2,
            yoyo: true
        });
        
        // 대시 잔상 효과
        this.createDashTrail();
        
        // 대시 종료 타이머
        this.scene.time.delayedCall(this.dashDuration, () => {
            this.isDashing = false;
            this.invulnerable = false;
            this.alpha = 1;
        });
        
        // 대시 쿨다운 타이머
        this.scene.time.delayedCall(this.dashCooldown, () => {
            this.canDash = true;
            
            // 대시 가능 효과
            this.scene.tweens.add({
                targets: this,
                scaleX: 1.2,
                scaleY: 1.2,
                duration: 200,
                yoyo: true
            });
        });
    }
    
    createDashTrail() {
        // 대시 잔상 효과 생성
        for (let i = 0; i < 5; i++) {
            this.scene.time.delayedCall(i * 50, () => {
                const trail = this.scene.add.sprite(this.x, this.y, 'player');
                trail.setAlpha(0.3);
                trail.setScale(this.scaleX, this.scaleY);
                trail.setFlipX(this.flipX);
                
                // 잔상 페이드 아웃
                this.scene.tweens.add({
                    targets: trail,
                    alpha: 0,
                    duration: 200,
                    onComplete: () => {
                        trail.destroy();
                    }
                });
            });
        }
    }

    updateSpirits() {
        // 정령들이 플레이어를 따라다니도록 설정
        for (let i = 0; i < this.spirits.length; i++) {
            const spirit = this.spirits[i];
            
            // 정령의 위치 업데이트
            const angle = (i * (360 / this.spirits.length) + this.scene.time.now * 0.1) * (Math.PI / 180);
            const distance = 50 + (this.level * 2); // 플레이어로부터의 거리 (레벨에 따라 증가)
            
            const targetX = this.x + Math.cos(angle) * distance;
            const targetY = this.y + Math.sin(angle) * distance;
            
            // 정령 이동
            spirit.moveTo(targetX, targetY);
        }
    }

    takeDamage(amount) {
        // 무적 상태면 데미지를 받지 않음
        if (this.invulnerable) return;
        
        // 데미지 적용
        this.health = Math.max(0, this.health - amount);
        
        // 피격 효과
        this.scene.cameras.main.shake(100, 0.01);
        
        // 무적 상태 설정
        this.setInvulnerable();
        
        // 체력 업데이트 이벤트 발생
        this.scene.events.emit('healthUpdate', this.health, this.maxHealth);
        
        // 사망 체크
        if (this.health <= 0) {
            this.scene.events.emit('playerDeath');
        }
    }

    setInvulnerable() {
        this.invulnerable = true;
        
        // 깜빡임 효과
        this.scene.tweens.add({
            targets: this,
            alpha: 0.5,
            duration: 100,
            yoyo: true,
            repeat: 4
        });
        
        // 무적 시간 후 원래 상태로 복귀
        this.scene.time.delayedCall(this.invulnerableTime, () => {
            this.invulnerable = false;
            this.alpha = 1;
        });
    }

    heal(amount) {
        // 체력 회복
        this.health = Math.min(this.maxHealth, this.health + amount);
        
        // 체력 업데이트 이벤트 발생
        this.scene.events.emit('healthUpdate', this.health, this.maxHealth);
        
        // 회복 효과
        const healEffect = this.scene.add.sprite(this.x, this.y, 'item');
        healEffect.setTint(0x00ff00);
        healEffect.setScale(2);
        
        this.scene.tweens.add({
            targets: healEffect,
            scale: 0,
            alpha: 0,
            duration: 500,
            onComplete: () => {
                healEffect.destroy();
            }
        });
    }
    
    addExperience(amount) {
        // 경험치 증가
        this.experience += amount;
        
        // 경험치 업데이트 이벤트 발생
        this.scene.events.emit('experienceUpdate', this.experience, this.experienceToNextLevel);
        
        // 레벨업 체크
        this.checkLevelUp();
    }
    
    checkLevelUp() {
        // 레벨업 조건 확인
        if (this.experience >= this.experienceToNextLevel) {
            // 레벨 증가
            this.level++;
            
            // 남은 경험치 계산
            this.experience -= this.experienceToNextLevel;
            
            // 다음 레벨 필요 경험치 증가
            this.experienceToNextLevel = Math.floor(this.experienceToNextLevel * 1.5);
            
            // 레벨업 효과
            this.levelUp();
            
            // 레벨업 이벤트 발생
            this.scene.events.emit('levelUp', this.level);
            
            // 추가 레벨업 체크 (경험치가 충분한 경우 연속 레벨업)
            this.checkLevelUp();
        }
    }
    
    levelUp() {
        this.level++;
        this.experience -= this.experienceToNextLevel;
        this.experienceToNextLevel = Math.floor(this.experienceToNextLevel * 1.5);
        
        // 레벨업 보상
        this.maxHealth += 10;
        this.health = this.maxHealth;
        this.damage += 2;
        this.healAmount += 5;
        
        // 레벨업 효과
        this.createLevelUpEffect();
        
        // 레벨업 효과음 재생
        try {
            this.scene.sound.play('level_up');
        } catch (error) {
            console.error('레벨업 효과음 재생 중 오류 발생:', error);
        }
        
        // 레벨업 이벤트 발생
        if (this.scene.onLevelUp) {
            this.scene.onLevelUp(this.level);
        }
        
        // 경험치가 다음 레벨에 필요한 양보다 많으면 다시 레벨업
        this.checkLevelUp();
    }

    addSpirit(spiritName) {
        // 새 정령 생성
        const spirit = new Spirit(this.scene, this.x, this.y, spiritName);
        
        // 정령 목록에 추가
        this.spirits.push(spirit);
        
        // 정령 그룹에 추가
        if (this.scene.spirits) {
            this.scene.spirits.add(spirit);
        }
        
        // 정령 추가 효과
        const addEffect = this.scene.add.sprite(this.x, this.y, 'spirit');
        addEffect.setScale(2);
        
        this.scene.tweens.add({
            targets: addEffect,
            scale: 0,
            alpha: 0,
            duration: 500,
            onComplete: () => {
                addEffect.destroy();
            }
        });
        
        // 정령 업데이트 이벤트 발생
        this.scene.events.emit('spiritUpdate', this.spirits.length);
        
        return spirit;
    }

    upgradeSpirit(index) {
        // 인덱스가 유효한지 확인
        if (index < 0 || index >= this.spirits.length) return;
        
        // 정령 업그레이드
        this.spirits[index].upgrade();
        
        // 업그레이드 효과음 재생
        try {
            this.scene.sound.play('spirit_upgrade');
        } catch (error) {
            console.error('업그레이드 효과음 재생 중 오류 발생:', error);
        }
        
        // 정령 업그레이드 이벤트 발생
        if (this.scene.onSpiritUpgraded) {
            this.scene.onSpiritUpgraded();
        }
    }

    // 레벨업 효과 생성
    createLevelUpEffect() {
        // 레벨업 텍스트 효과
        const levelUpText = this.scene.add.text(
            this.x,
            this.y - 50,
            'LEVEL UP!',
            {
                font: '24px Arial',
                fill: '#ffff00',
                stroke: '#000000',
                strokeThickness: 4
            }
        ).setOrigin(0.5);
        
        // 텍스트 애니메이션
        this.scene.tweens.add({
            targets: levelUpText,
            y: levelUpText.y - 30,
            alpha: 0,
            duration: 1500,
            onComplete: () => {
                levelUpText.destroy();
            }
        });
        
        // 레벨업 원형 효과
        const circle = this.scene.add.circle(this.x, this.y, 50, 0xffff00, 0.5);
        
        // 원형 효과 애니메이션
        this.scene.tweens.add({
            targets: circle,
            scale: 2,
            alpha: 0,
            duration: 1000,
            onComplete: () => {
                circle.destroy();
            }
        });
        
        // 파티클 효과
        for (let i = 0; i < 20; i++) {
            const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
            const distance = Phaser.Math.FloatBetween(20, 100);
            
            const x = this.x + Math.cos(angle) * distance;
            const y = this.y + Math.sin(angle) * distance;
            
            const particle = this.scene.add.circle(x, y, 5, 0xffff00, 1);
            
            this.scene.tweens.add({
                targets: particle,
                x: this.x,
                y: this.y,
                alpha: 0,
                duration: Phaser.Math.FloatBetween(500, 1000),
                onComplete: () => {
                    particle.destroy();
                }
            });
        }
        
        // 일시적인 무적 효과
        this.invulnerable = true;
        this.alpha = 0.7;
        
        // 1초 후 무적 해제
        this.scene.time.delayedCall(1000, () => {
            this.invulnerable = false;
            this.alpha = 1;
        });
    }
}

module.exports = { Player }; 