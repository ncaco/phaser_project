class Item extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'item');
        
        // 씬에 추가
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        // 아이템 타입 랜덤 설정
        this.setupItemType();
        
        // 애니메이션 생성
        this.createAnimations();
        
        // 아이템 효과 설정
        this.setupEffect();
        
        // 아이템 자동 제거 타이머 (10초)
        this.destroyTimer = scene.time.delayedCall(10000, () => {
            this.fadeOut();
        });
    }

    setupItemType() {
        // 아이템 타입 랜덤 선택
        const types = ['health', 'exp', 'spirit', 'upgrade'];
        const weights = [40, 30, 20, 10]; // 가중치 (%)
        
        // 가중치에 따른 랜덤 선택
        let total = 0;
        const roll = Phaser.Math.Between(1, 100);
        
        for (let i = 0; i < types.length; i++) {
            total += weights[i];
            if (roll <= total) {
                this.type = types[i];
                break;
            }
        }
        
        // 아이템 타입에 따른 색상 설정
        switch (this.type) {
            case 'health':
                this.setTint(0xff0000); // 빨간색
                break;
            case 'exp':
                this.setTint(0x00ff00); // 초록색
                break;
            case 'spirit':
                this.setTint(0x0000ff); // 파란색
                break;
            case 'upgrade':
                this.setTint(0xffff00); // 노란색
                break;
        }
    }

    createAnimations() {
        // 아이템 애니메이션 설정
        this.scene.anims.create({
            key: 'item_idle',
            frames: this.scene.anims.generateFrameNumbers('item', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });
        
        // 기본 애니메이션 재생
        this.play('item_idle');
        
        // 부유 효과
        this.scene.tweens.add({
            targets: this,
            y: this.y - 10,
            duration: 1000,
            yoyo: true,
            repeat: -1
        });
    }

    setupEffect() {
        // 아이템 타입에 따른 효과 설정
        switch (this.type) {
            case 'health':
                this.effectValue = 20; // 체력 회복량
                break;
            case 'exp':
                this.effectValue = 30; // 경험치 획득량
                break;
            case 'spirit':
                this.effectValue = 1; // 새 정령 추가
                break;
            case 'upgrade':
                this.effectValue = 1; // 정령 업그레이드
                break;
        }
    }

    applyEffect(player) {
        // 아이템 타입에 따른 효과 적용
        switch (this.type) {
            case 'health':
                // 체력 회복
                player.heal(this.effectValue);
                break;
                
            case 'exp':
                // 경험치 획득
                this.scene.levelSystem.addExperience(this.effectValue);
                break;
                
            case 'spirit':
                // 새 정령 추가
                const spiritNames = ['불 정령', '물 정령', '바람 정령', '땅 정령', '번개 정령'];
                const randomName = spiritNames[Phaser.Math.Between(0, spiritNames.length - 1)];
                player.addSpirit(randomName);
                break;
                
            case 'upgrade':
                // 랜덤 정령 업그레이드
                if (player.spirits.length > 0) {
                    const randomIndex = Phaser.Math.Between(0, player.spirits.length - 1);
                    player.upgradeSpirit(randomIndex);
                }
                break;
        }
    }

    fadeOut() {
        // 아이템 페이드 아웃 효과
        this.scene.tweens.add({
            targets: this,
            alpha: 0,
            duration: 500,
            onComplete: () => {
                this.destroy();
            }
        });
    }
}

module.exports = { Item }; 