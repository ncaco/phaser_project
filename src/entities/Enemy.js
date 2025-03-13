class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, type = 'normal') {
        super(scene, x, y, 'enemy');
        
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
    }
    
    setupEnemyType() {
        // 적 타입에 따른 속성 설정
        switch (this.type) {
            case 'normal':
                this.health = 100;
                this.maxHealth = 100;
                this.speed = 100;
                this.damage = 10;
                this.expValue = 10;
                this.dropRate = 0.3;
                this.setTint(0xff0000);
                break;
                
            case 'fast':
                this.health = 60;
                this.maxHealth = 60;
                this.speed = 180;
                this.damage = 5;
                this.expValue = 15;
                this.dropRate = 0.4;
                this.setTint(0x00ff00);
                this.setScale(0.8);
                break;
                
            case 'tank':
                this.health = 300;
                this.maxHealth = 300;
                this.speed = 60;
                this.damage = 20;
                this.expValue = 30;
                this.dropRate = 0.5;
                this.setTint(0x0000ff);
                this.setScale(1.3);
                break;
                
            case 'ranged':
                this.health = 80;
                this.maxHealth = 80;
                this.speed = 80;
                this.damage = 15;
                this.expValue = 20;
                this.dropRate = 0.4;
                this.attackRange = 200;
                this.setTint(0xffff00);
                break;
                
            case 'explosive':
                this.health = 50;
                this.maxHealth = 50;
                this.speed = 120;
                this.damage = 30;
                this.expValue = 25;
                this.dropRate = 0.5;
                this.explosionRadius = 100;
                this.setTint(0xff8800);
                break;
                
            case 'boss':
                this.health = 1000;
                this.maxHealth = 1000;
                this.speed = 50;
                this.damage = 30;
                this.expValue = 100;
                this.dropRate = 1.0; // 100% 드롭
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
                this.speed = 100;
                this.damage = 10;
                this.expValue = 10;
                this.dropRate = 0.3;
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
    
    update() {
        // 스턴 상태면 움직이지 않음
        if (this.stunned) return;
        
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
        
        // 속도 계산
        const velocityX = Math.cos(angle) * this.speed;
        const velocityY = Math.sin(angle) * this.speed;
        
        // 속도 설정
        this.setVelocity(velocityX, velocityY);
        
        // 스프라이트 방향 설정
        if (velocityX < 0) {
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
        const velocityX = Math.cos(moveAngle) * this.speed;
        const velocityY = Math.sin(moveAngle) * this.speed;
        
        this.setVelocity(velocityX, velocityY);
        
        // 스프라이트 방향 설정
        if (velocityX < 0) {
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
        const velocityX = Math.cos(angle) * -this.speed;
        const velocityY = Math.sin(angle) * -this.speed;
        
        this.setVelocity(velocityX, velocityY);
        
        // 스프라이트 방향 설정
        if (velocityX < 0) {
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
        let velocityX = Math.cos(angle) * this.speed;
        let velocityY = Math.sin(angle) * this.speed;
        
        // 지그재그 오프셋 추가
        velocityX += Math.cos(perpAngle) * zigzagOffset;
        velocityY += Math.sin(perpAngle) * zigzagOffset;
        
        this.setVelocity(velocityX, velocityY);
        
        // 스프라이트 방향 설정
        if (velocityX < 0) {
            this.setFlipX(true);
        } else {
            this.setFlipX(false);
        }
    }
    
    handleRangedAttack() {
        // 플레이어가 없으면 리턴
        if (!this.scene.player) return;
        
        const player = this.scene.player;
        const distance = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
        
        // 공격 범위 내에 있고 쿨다운이 아니면 공격
        if (distance <= this.attackRange && !this.specialAbilityCooldown) {
            this.specialAbilityCooldown = true;
            
            // 원거리 공격 발사
            const projectile = this.scene.physics.add.sprite(this.x, this.y, 'projectile');
            projectile.setTint(0xffff00);
            
            // 발사체 물리 설정
            this.scene.physics.world.enable(projectile);
            
            // 플레이어 방향으로 발사
            const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
            const speed = 200;
            projectile.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
            
            // 발사체 회전
            projectile.rotation = angle;
            
            // 플레이어와 발사체 충돌 설정
            this.scene.physics.add.overlap(player, projectile, (player, proj) => {
                player.takeDamage(this.damage);
                proj.destroy();
            });
            
            // 5초 후 발사체 제거
            this.scene.time.delayedCall(5000, () => {
                if (projectile.active) {
                    projectile.destroy();
                }
            });
            
            // 쿨다운 설정 (2초)
            this.scene.time.delayedCall(2000, () => {
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
}

module.exports = { Enemy }; 