class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, type = 'normal') {
        super(scene, x, y, 'enemy');
        
        // 씬에 추가
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        // 적 타입 설정
        this.type = type;
        
        // 적 속성 설정
        this.setupEnemyType();
        
        // 플레이어 참조
        this.player = scene.player;
    }

    setupEnemyType() {
        // 적 타입에 따른 속성 설정
        switch (this.type) {
            case 'normal':
                this.health = 30;
                this.maxHealth = 30;
                this.speed = 50;
                this.damage = 10;
                this.expValue = 10;
                this.dropRate = 10; // 아이템 드롭 확률 (%)
                this.setTint(0xffffff);
                break;
                
            case 'fast':
                this.health = 20;
                this.maxHealth = 20;
                this.speed = 100;
                this.damage = 5;
                this.expValue = 15;
                this.dropRate = 15;
                this.setTint(0x00ff00);
                break;
                
            case 'tank':
                this.health = 100;
                this.maxHealth = 100;
                this.speed = 30;
                this.damage = 20;
                this.expValue = 30;
                this.dropRate = 25;
                this.setTint(0xff0000);
                this.setScale(1.5);
                break;
                
            case 'boss':
                this.health = 500;
                this.maxHealth = 500;
                this.speed = 40;
                this.damage = 30;
                this.expValue = 100;
                this.dropRate = 100;
                this.setTint(0xff00ff);
                this.setScale(2);
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

    update() {
        // 플레이어를 향해 이동
        this.moveTowardsPlayer();
    }

    moveTowardsPlayer() {
        // 플레이어가 없으면 리턴
        if (!this.player) return;
        
        // 플레이어 방향으로 이동
        this.scene.physics.moveToObject(this, this.player, this.speed);
        
        // 이동 방향에 따라 스프라이트 뒤집기
        if (this.body.velocity.x < 0) {
            this.flipX = true;
        } else {
            this.flipX = false;
        }
    }

    takeDamage(amount) {
        // 데미지 적용
        this.health -= amount;
        
        // 피격 효과
        this.scene.tweens.add({
            targets: this,
            alpha: 0.5,
            duration: 100,
            yoyo: true,
            repeat: 0
        });
        
        // 체력 바 업데이트
        this.updateHealthBar();
        
        // 사망 체크
        if (this.health <= 0) {
            this.die();
        }
    }

    updateHealthBar() {
        // 체력 바가 없으면 생성
        if (!this.healthBar) {
            this.healthBarBackground = this.scene.add.rectangle(this.x, this.y - 20, 30, 5, 0x000000);
            this.healthBar = this.scene.add.rectangle(this.x, this.y - 20, 30, 5, 0xff0000);
        }
        
        // 체력 바 위치 업데이트
        this.healthBarBackground.x = this.x;
        this.healthBarBackground.y = this.y - 20;
        
        this.healthBar.x = this.x;
        this.healthBar.y = this.y - 20;
        
        // 체력 바 너비 업데이트
        const width = (this.health / this.maxHealth) * 30;
        this.healthBar.width = width;
    }

    die() {
        // 사망 효과
        this.scene.tweens.add({
            targets: this,
            alpha: 0,
            scale: 0,
            duration: 300,
            onComplete: () => {
                // 체력 바 제거
                if (this.healthBar) {
                    this.healthBar.destroy();
                    this.healthBarBackground.destroy();
                }
                
                // 적 제거
                this.destroy();
            }
        });
    }
}

module.exports = { Enemy }; 