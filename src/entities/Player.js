const Spirit = require('./Spirit').Spirit;

class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, element = 'fire') {
        super(scene, x, y, 'player');
        
        // 씬에 추가
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        // 속성 설정
        this.element = element;
        
        // 물리 속성 설정
        this.setCollideWorldBounds(true);
        this.body.setDamping(true);
        this.body.setDrag(0.92, 0.92); // 마찰력 조정 (0.85 -> 0.92)
        
        // 플레이어 속성
        this.speed = 150; // 속도 조정 (120 -> 150)
        this.maxSpeed = 150; // 최대 속도 제한 추가
        this.acceleration = 800; // 가속도 조정 (1000 -> 800)
        this.health = 100;
        this.maxHealth = 100;
        this.invulnerable = false;
        this.invulnerableTime = 500; // 무적 시간 (밀리초)
        this.isDead = false; // 사망 상태 추가
        
        // 대시 속성
        this.dashSpeed = 400; // 대시 속도 감소 (500 -> 400)
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
        
        // 속성에 따른 설정 적용
        this.applyElementSettings();
        
        // 초기 정령 생성
        this.addSpirit(`${this.getElementName()} 정령`);
        
        // 애니메이션 설정
        this.setupAnimations();
        
        // 키보드 입력 설정
        this.setupKeyboardInput();
        
        // 이동 속도 벡터
        this.movementVector = { x: 0, y: 0 };
        
        // 키 상태 저장
        this.keys = {
            up: false,
            down: false,
            left: false,
            right: false
        };
    }
    
    // 속성에 따른 설정 적용
    applyElementSettings() {
        switch (this.element) {
            case 'fire':
                this.setTint(0xff5500);
                this.attackDamage = 15;
                this.attackSpeed = 1000;
                this.attackRange = 120;
                break;
                
            case 'water':
                this.setTint(0x00aaff);
                this.attackDamage = 12;
                this.attackSpeed = 1000;
                this.attackRange = 180;
                break;
                
            case 'earth':
                this.setTint(0xaa5500);
                this.attackDamage = 20;
                this.attackSpeed = 1000;
                this.attackRange = 100;
                break;
                
            case 'air':
                this.setTint(0x00ff00);
                this.attackDamage = 10;
                this.attackSpeed = 1000;
                this.attackRange = 200;
                break;
                
            default:
                this.setTint(0xff5500); // 기본값은 불 속성
                this.attackDamage = 15;
                this.attackSpeed = 1000;
                this.attackRange = 120;
                break;
        }
        
        // 속성 효과 생성
        this.createElementEffect();
    }
    
    // 속성 효과 생성
    createElementEffect() {
        // 이전 효과 제거
        if (this.elementEffect) {
            this.elementEffect.destroy();
        }
        
        // 속성에 따른 효과 색상
        let color;
        switch (this.element) {
            case 'fire': color = 0xff5500; break;
            case 'water': color = 0x00aaff; break;
            case 'earth': color = 0xaa5500; break;
            case 'air': color = 0x00ff00; break;
            default: color = 0xff5500; break;
        }
        
        // 효과 생성
        this.elementEffect = this.scene.add.circle(this.x, this.y, this.width * 0.6, color, 0.3);
        this.elementEffect.setDepth(this.depth - 1);
        
        // 효과 애니메이션
        this.scene.tweens.add({
            targets: this.elementEffect,
            scale: { from: 0.8, to: 1.2 },
            alpha: { from: 0.3, to: 0.1 },
            duration: 1500,
            yoyo: true,
            repeat: -1
        });
    }
    
    // 속성 이름 반환
    getElementName() {
        switch (this.element) {
            case 'fire': return '불';
            case 'water': return '물';
            case 'earth': return '땅';
            case 'air': return '바람';
            default: return '불';
        }
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
        
        // 직접 키 이벤트 리스너 추가
        this.scene.input.keyboard.on('keydown-UP', () => { this.keys.up = true; });
        this.scene.input.keyboard.on('keydown-DOWN', () => { this.keys.down = true; });
        this.scene.input.keyboard.on('keydown-LEFT', () => { this.keys.left = true; });
        this.scene.input.keyboard.on('keydown-RIGHT', () => { this.keys.right = true; });
        
        this.scene.input.keyboard.on('keyup-UP', () => { this.keys.up = false; });
        this.scene.input.keyboard.on('keyup-DOWN', () => { this.keys.down = false; });
        this.scene.input.keyboard.on('keyup-LEFT', () => { this.keys.left = false; });
        this.scene.input.keyboard.on('keyup-RIGHT', () => { this.keys.right = false; });
        
        // WASD 키 설정
        this.scene.input.keyboard.on('keydown-W', () => { this.keys.up = true; });
        this.scene.input.keyboard.on('keydown-S', () => { this.keys.down = true; });
        this.scene.input.keyboard.on('keydown-A', () => { this.keys.left = true; });
        this.scene.input.keyboard.on('keydown-D', () => { this.keys.right = true; });
        
        this.scene.input.keyboard.on('keyup-W', () => { this.keys.up = false; });
        this.scene.input.keyboard.on('keyup-S', () => { this.keys.down = false; });
        this.scene.input.keyboard.on('keyup-A', () => { this.keys.left = false; });
        this.scene.input.keyboard.on('keyup-D', () => { this.keys.right = false; });
    }

    update(time, delta) {
        // 사망 상태면 업데이트 중지
        if (this.isDead) return;
        
        // 이동 처리
        this.handleMovement(delta);
        
        // 정령 업데이트
        this.updateSpirits();
        
        // 속성 효과 위치 업데이트
        if (this.elementEffect && this.elementEffect.active) {
            this.elementEffect.setPosition(this.x, this.y);
        }
    }

    handleMovement(delta) {
        // 사망 상태면 이동 불가
        if (this.isDead) {
            this.body.setVelocity(0, 0);
            return;
        }
        
        // 조이스틱 입력이 있는 경우 (모바일)
        if (this.scene.joystick && this.scene.joystick.isActive) {
            const joyX = this.scene.joystick.direction.x;
            const joyY = this.scene.joystick.direction.y;
            
            if (Math.abs(joyX) > 0.1 || Math.abs(joyY) > 0.1) {
                // 조이스틱 입력 강도에 따른 속도 조절
                const intensity = Math.min(1, Math.sqrt(joyX * joyX + joyY * joyY));
                const velocityX = joyX * this.speed * intensity;
                const velocityY = joyY * this.speed * intensity;
                
                // 속도 설정 (부드러운 전환)
                this.body.velocity.x = Phaser.Math.Linear(this.body.velocity.x, velocityX, 0.2);
                this.body.velocity.y = Phaser.Math.Linear(this.body.velocity.y, velocityY, 0.2);
                
                // 이동 방향에 따라 스프라이트 방향 설정
                if (joyX < 0) {
                    this.flipX = true;
                } else if (joyX > 0) {
                    this.flipX = false;
                }
                
                return;
            }
        }
        
        // 키보드 입력 처리
        let dirX = 0;
        let dirY = 0;
        
        // 키 상태 확인
        if (this.keys.left) dirX -= 1;
        if (this.keys.right) dirX += 1;
        if (this.keys.up) dirY -= 1;
        if (this.keys.down) dirY += 1;
        
        // 키보드 입력이 없으면 Phaser의 cursors 객체 확인 (대체 방법)
        if (dirX === 0 && dirY === 0) {
            const cursors = this.scene.cursors;
            if (cursors) {
                if (cursors.left.isDown) dirX -= 1;
                if (cursors.right.isDown) dirX += 1;
                if (cursors.up.isDown) dirY -= 1;
                if (cursors.down.isDown) dirY += 1;
            }
        }
        
        // 입력이 있는 경우 이동 처리
        if (dirX !== 0 || dirY !== 0) {
            // 대각선 이동 시 정규화
            if (dirX !== 0 && dirY !== 0) {
                const length = Math.sqrt(dirX * dirX + dirY * dirY);
                dirX /= length;
                dirY /= length;
            }
            
            // 목표 속도 계산
            const targetVelX = dirX * this.speed;
            const targetVelY = dirY * this.speed;
            
            // 현재 속도에서 목표 속도로 부드럽게 전환 (단순화된 방식)
            this.body.velocity.x = Phaser.Math.Linear(this.body.velocity.x, targetVelX, 0.3);
            this.body.velocity.y = Phaser.Math.Linear(this.body.velocity.y, targetVelY, 0.3);
            
            // 최대 속도 제한
            const currentSpeed = Math.sqrt(this.body.velocity.x * this.body.velocity.x + this.body.velocity.y * this.body.velocity.y);
            if (currentSpeed > this.maxSpeed) {
                const ratio = this.maxSpeed / currentSpeed;
                this.body.velocity.x *= ratio;
                this.body.velocity.y *= ratio;
            }
            
            // 이동 방향에 따라 스프라이트 방향 설정
            if (dirX < 0) {
                this.flipX = true;
            } else if (dirX > 0) {
                this.flipX = false;
            }
        } else {
            // 입력이 없는 경우 점진적으로 속도 감소
            this.body.velocity.x = Phaser.Math.Linear(this.body.velocity.x, 0, 0.2);
            this.body.velocity.y = Phaser.Math.Linear(this.body.velocity.y, 0, 0.2);
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
        // 무적 상태거나 이미 사망한 경우 데미지를 받지 않음
        if (this.invulnerable || this.isDead) return;
        
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
            this.die();
        }
    }

    die() {
        if (this.isDead) return; // 이미 사망 처리된 경우 중복 실행 방지
        
        this.isDead = true;
        this.body.setVelocity(0, 0);
        
        // 모든 정령 제거
        this.spirits.forEach(spirit => {
            if (spirit && spirit.active) {
                spirit.destroy();
            }
        });
        this.spirits = [];
        
        // 사망 애니메이션
        this.scene.tweens.add({
            targets: this,
            alpha: 0,
            scale: 0,
            angle: 720,
            duration: 1000,
            onComplete: () => {
                // 사망 이벤트 발생
                this.scene.events.emit('playerDeath');
            }
        });
        
        // 사망 효과음 재생
        try {
            this.scene.sound.play('player_death');
        } catch (error) {
            console.error('사망 효과음 재생 중 오류:', error);
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

    addSpirit(name) {
        const Spirit = require('./Spirit').Spirit;
        
        // 정령 생성 위치 (플레이어 주변)
        const angle = Math.random() * Math.PI * 2;
        const distance = 50;
        const x = this.x + Math.cos(angle) * distance;
        const y = this.y + Math.sin(angle) * distance;
        
        // 정령 생성
        const spirit = new Spirit(this.scene, x, y, name);
        
        // 정령 속성 설정
        spirit.element = this.element;
        
        // 정령 목록에 추가
        this.spirits.push(spirit);
        
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