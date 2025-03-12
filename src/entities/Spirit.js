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
        
        // 애니메이션 대신 간단한 효과 설정
        this.setupVisualEffects();
        
        // 공격 타이머 설정
        this.attackTimer = scene.time.addEvent({
            delay: this.attackSpeed,
            callback: this.attack,
            callbackScope: this,
            loop: true
        });
    }

    setupVisualEffects() {
        // 부유 효과
        this.scene.tweens.add({
            targets: this,
            y: this.y - 5,
            duration: 1000,
            yoyo: true,
            repeat: -1
        });
        
        // 회전 효과
        this.scene.tweens.add({
            targets: this,
            angle: 360,
            duration: 3000,
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
        
        // 공격 효과음 재생 (더미 오디오이므로 실제로는 재생되지 않음)
        this.scene.sound.play('attack');
        
        // 적에게 데미지 주기
        this.targetEnemy.takeDamage(this.damage);
        
        // 공격 효과 생성
        this.createAttackEffect();
        
        // 공격 시각 효과
        this.scene.tweens.add({
            targets: this,
            scaleX: 1.2,
            scaleY: 1.2,
            duration: 100,
            yoyo: true
        });
    }

    createAttackEffect() {
        // 공격 효과 생성
        const effect = this.scene.add.sprite(this.targetEnemy.x, this.targetEnemy.y, 'attack_effect');
        
        // 효과 애니메이션 (크기 변화)
        this.scene.tweens.add({
            targets: effect,
            scale: 0,
            alpha: 0,
            duration: 300,
            onComplete: () => {
                effect.destroy();
            }
        });
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