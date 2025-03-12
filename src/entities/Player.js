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
        
        // 정령 목록
        this.spirits = [];
        
        // 초기 정령 생성
        this.addSpirit('기본 정령');
    }

    update(cursors) {
        // 이동 로직
        this.handleMovement(cursors);
        
        // 정령 업데이트
        this.updateSpirits();
    }

    handleMovement(cursors) {
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

    updateSpirits() {
        // 정령들이 플레이어를 따라다니도록 설정
        for (let i = 0; i < this.spirits.length; i++) {
            const spirit = this.spirits[i];
            
            // 정령의 위치 업데이트
            const angle = (i * (360 / this.spirits.length)) * (Math.PI / 180);
            const distance = 50; // 플레이어로부터의 거리
            
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
    }

    addSpirit(spiritName) {
        // 새 정령 생성
        const spirit = new Spirit(this.scene, this.x, this.y, spiritName);
        
        // 정령 목록에 추가
        this.spirits.push(spirit);
        
        // 정령 그룹에 추가
        this.scene.spirits.add(spirit);
        
        // 정령 업데이트 이벤트 발생
        this.scene.events.emit('spiritUpdate', spiritName);
        
        return spirit;
    }

    upgradeSpirit(index) {
        // 정령 업그레이드
        if (index >= 0 && index < this.spirits.length) {
            this.spirits[index].upgrade();
        }
    }
}

module.exports = { Player }; 