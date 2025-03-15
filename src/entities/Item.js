class Item extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, type = '') {
        super(scene, x, y, 'item');
        
        // 씬에 추가
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        // 아이템 속성
        this.type = type || this.getRandomType();
        this.value = 0;
        this.rarity = this.getRandomRarity();
        
        // 아이템 타입 및 희귀도에 따른 속성 설정
        this.setupItemType();
        
        // 애니메이션 생성
        this.createAnimations();
        
        // 자동 제거 타이머 (15초)
        this.removeTimer = scene.time.delayedCall(15000, () => {
            this.fadeOut();
        });
        
        // 깜빡임 효과 (10초 후부터 제거 전까지)
        scene.time.delayedCall(10000, () => {
            this.blinkEffect = scene.tweens.add({
                targets: this,
                alpha: 0.3,
                duration: 200,
                yoyo: true,
                repeat: -1
            });
        });
        
        // 아이템 설명 텍스트
        this.descriptionText = null;
    }
    
    getRandomType() {
        // 아이템 타입 랜덤 선택
        const types = ['health', 'exp', 'spirit', 'upgrade', 'speed', 'shield', 'damage', 'attackSpeed'];
        const weights = [0.25, 0.25, 0.15, 0.1, 0.1, 0.05, 0.05, 0.05]; // 가중치
        
        // 가중치에 따른 랜덤 선택
        let random = Math.random();
        let cumulativeWeight = 0;
        
        for (let i = 0; i < types.length; i++) {
            cumulativeWeight += weights[i];
            if (random <= cumulativeWeight) {
                return types[i];
            }
        }
        
        return 'health'; // 기본값
    }
    
    getRandomRarity() {
        // 아이템 희귀도 랜덤 선택
        const rarities = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
        const weights = [0.6, 0.25, 0.1, 0.04, 0.01]; // 가중치
        
        // 가중치에 따른 랜덤 선택
        let random = Math.random();
        let cumulativeWeight = 0;
        
        for (let i = 0; i < rarities.length; i++) {
            cumulativeWeight += weights[i];
            if (random <= cumulativeWeight) {
                return rarities[i];
            }
        }
        
        return 'common'; // 기본값
    }
    
    setupItemType() {
        // 희귀도에 따른 기본 값 설정
        const rarityMultiplier = {
            'common': 1,
            'uncommon': 1.5,
            'rare': 2,
            'epic': 3,
            'legendary': 5
        };
        
        const multiplier = rarityMultiplier[this.rarity] || 1;
        
        // 아이템 타입에 따른 속성 설정
        switch (this.type) {
            case 'health':
                this.value = 20 * multiplier;
                this.setTint(0xff0000);
                break;
                
            case 'exp':
                this.value = 15 * multiplier;
                this.setTint(0x00ffff);
                break;
                
            case 'spirit':
                this.value = 1; // 항상 1개의 정령 추가
                this.setTint(0xffff00);
                break;
                
            case 'upgrade':
                this.value = 1; // 항상 1레벨 업그레이드
                this.setTint(0xff00ff);
                break;
                
            case 'speed':
                this.value = 10 * multiplier;
                this.setTint(0x00ff00);
                break;
                
            case 'shield':
                this.value = 5 * multiplier; // 초 단위
                this.setTint(0x0000ff);
                break;
                
            case 'damage':
                this.value = 5 * multiplier;
                this.setTint(0xff8800);
                break;
                
            case 'attackSpeed':
                this.value = 10 * multiplier; // 퍼센트
                this.setTint(0x88ff00);
                break;
                
            default:
                this.value = 10 * multiplier;
                this.setTint(0xffffff);
                break;
        }
        
        // 희귀도에 따른 크기 및 효과
        switch (this.rarity) {
            case 'common':
                this.setScale(0.8);
                break;
                
            case 'uncommon':
                this.setScale(0.9);
                // 약간의 빛남 효과 (대체 구현)
                this.createGlowEffect(0.5);
                break;
                
            case 'rare':
                this.setScale(1.0);
                // 빛남 효과 (대체 구현)
                this.createGlowEffect(1.0);
                break;
                
            case 'epic':
                this.setScale(1.1);
                // 강한 빛남 효과 (대체 구현)
                this.createGlowEffect(1.5);
                break;
                
            case 'legendary':
                this.setScale(1.2);
                // 매우 강한 빛남 효과 + 회전 (대체 구현)
                this.createGlowEffect(2.0);
                
                // 회전 효과
                this.scene.tweens.add({
                    targets: this,
                    angle: 360,
                    duration: 3000,
                    repeat: -1
                });
                break;
        }
    }
    
    // 빛남 효과를 대체하는 메서드
    createGlowEffect(intensity) {
        try {
            // 이전에 생성된 빛남 효과가 있으면 제거
            if (this.glowCircle && this.glowCircle.active) {
                this.glowCircle.destroy();
            }
            
            // 빛남 효과를 위한 배경 원 생성
            const glowColor = this.tintTopLeft || 0xffffff; // 아이템의 현재 색상 사용 (기본값 추가)
            const glowSize = this.width * (1 + intensity * 0.3); // 강도에 따라 크기 조정
            
            // 빛남 효과용 원 생성
            this.glowCircle = this.scene.add.circle(
                this.x,
                this.y,
                glowSize / 2,
                glowColor,
                0.3 * intensity // 강도에 따른 투명도
            );
            
            if (this.glowCircle) {
                this.glowCircle.setDepth(this.depth - 1); // 아이템 뒤에 표시
                
                // 원 크기 변화 애니메이션
                this.scene.tweens.add({
                    targets: this.glowCircle,
                    scaleX: 1.2,
                    scaleY: 1.2,
                    duration: 1000,
                    yoyo: true,
                    repeat: -1
                });
                
                // 아이템 위치 업데이트 시 원도 함께 이동하도록 설정
                this.on('destroy', () => {
                    if (this.glowCircle && this.glowCircle.active) {
                        this.glowCircle.destroy();
                    }
                });
            }
        } catch (error) {
            console.error('빛남 효과 생성 중 오류 발생:', error);
        }
    }
    
    createAnimations() {
        // 아이템 애니메이션 설정
        if (this.scene.anims.exists('item_idle')) return;
        
        this.scene.anims.create({
            key: 'item_idle',
            frames: this.scene.anims.generateFrameNumbers('item', { start: 0, end: 3 }),
            frameRate: 8,
            repeat: -1
        });
        
        // 기본 애니메이션 재생
        this.play('item_idle');
        
        // 부유 효과
        this.scene.tweens.add({
            targets: this,
            y: this.y - 10,
            duration: 1500,
            yoyo: true,
            repeat: -1
        });
    }
    
    update() {
        // 플레이어와의 거리 확인
        if (this.scene.player) {
            const distance = Phaser.Math.Distance.Between(
                this.x, this.y,
                this.scene.player.x, this.scene.player.y
            );
            
            // 일정 거리 이내에 들어오면 설명 표시
            if (distance < 100) {
                this.showDescription();
            } else {
                this.hideDescription();
            }
            
            // 자석 효과: 플레이어가 가까이 오면 끌려감
            if (distance < 150) {
                const angle = Phaser.Math.Angle.Between(
                    this.x, this.y,
                    this.scene.player.x, this.scene.player.y
                );
                
                const speed = 100 + (150 - distance);
                this.setVelocity(
                    Math.cos(angle) * speed,
                    Math.sin(angle) * speed
                );
            }
        }
        
        // 아이템 위치가 변경되면 빛남 효과도 함께 이동
        if (this.glowCircle && this.glowCircle.active) {
            try {
                this.glowCircle.setPosition(this.x, this.y);
            } catch (error) {
                console.error('빛남 효과 위치 업데이트 중 오류 발생:', error);
                // 오류 발생 시 glowCircle 참조 제거
                this.glowCircle = null;
            }
        }
    }
    
    showDescription() {
        // 이미 설명이 표시되어 있으면 리턴
        if (this.descriptionText) return;
        
        // 아이템 설명 생성
        let description = '';
        const rarityColors = {
            'common': '#ffffff',
            'uncommon': '#00ff00',
            'rare': '#0088ff',
            'epic': '#ff00ff',
            'legendary': '#ffaa00'
        };
        
        const rarityText = this.rarity.charAt(0).toUpperCase() + this.rarity.slice(1);
        const rarityColor = rarityColors[this.rarity] || '#ffffff';
        
        // 아이템 타입에 따른 설명
        switch (this.type) {
            case 'health':
                description = `[${rarityText}] 체력 회복: +${this.value}`;
                break;
                
            case 'exp':
                description = `[${rarityText}] 경험치: +${this.value}`;
                break;
                
            case 'spirit':
                description = `[${rarityText}] 새로운 정령`;
                break;
                
            case 'upgrade':
                description = `[${rarityText}] 정령 강화`;
                break;
                
            case 'speed':
                description = `[${rarityText}] 이동속도: +${this.value}%`;
                break;
                
            case 'shield':
                description = `[${rarityText}] 보호막: ${this.value}초`;
                break;
                
            case 'damage':
                description = `[${rarityText}] 공격력: +${this.value}`;
                break;
                
            case 'attackSpeed':
                description = `[${rarityText}] 공격속도: +${this.value}%`;
                break;
        }
        
        // 텍스트 스타일
        const style = {
            fontFamily: 'Arial',
            fontSize: '12px',
            color: rarityColor,
            stroke: '#000000',
            strokeThickness: 3,
            align: 'center'
        };
        
        // 설명 텍스트 생성
        this.descriptionText = this.scene.add.text(this.x, this.y - 30, description, style);
        this.descriptionText.setOrigin(0.5);
        
        // 텍스트 부유 효과
        this.scene.tweens.add({
            targets: this.descriptionText,
            y: this.descriptionText.y - 5,
            duration: 1500,
            yoyo: true,
            repeat: -1
        });
    }
    
    hideDescription() {
        // 설명 텍스트가 있으면 제거
        if (this.descriptionText) {
            this.descriptionText.destroy();
            this.descriptionText = null;
        }
    }
    
    applyEffect(player) {
        // 아이템 효과 적용
        switch (this.type) {
            case 'health':
                player.heal(this.value);
                this.createEffectText(`+${this.value} 체력`, 0xff0000);
                break;
                
            case 'exp':
                player.addExperience(this.value);
                this.createEffectText(`+${this.value} 경험치`, 0x00ffff);
                break;
                
            case 'spirit':
                // 랜덤 정령 타입 선택
                const spiritTypes = ['기본 정령', '불 정령', '물 정령', '바람 정령', '땅 정령', '번개 정령', '얼음 정령', '빛 정령'];
                const weights = [0.25, 0.15, 0.15, 0.12, 0.1, 0.08, 0.08, 0.07]; // 가중치
                
                // 가중치에 따른 랜덤 선택
                let random = Math.random();
                let cumulativeWeight = 0;
                let selectedType = spiritTypes[0];
                
                for (let i = 0; i < spiritTypes.length; i++) {
                    cumulativeWeight += weights[i];
                    if (random <= cumulativeWeight) {
                        selectedType = spiritTypes[i];
                        break;
                    }
                }
                
                // 희귀도가 높을수록 더 좋은 정령 확률 증가
                if (this.rarity === 'rare' && Math.random() < 0.5) {
                    // 희귀: 바람 정령 이상의 정령 확률 증가
                    const rareIndex = Math.floor(Math.random() * 5) + 3; // 3~7 (바람~빛)
                    selectedType = spiritTypes[Math.min(rareIndex, spiritTypes.length - 1)];
                } else if (this.rarity === 'epic' && Math.random() < 0.7) {
                    // 에픽: 땅 정령 이상의 정령 확률 증가
                    const epicIndex = Math.floor(Math.random() * 4) + 4; // 4~7 (땅~빛)
                    selectedType = spiritTypes[Math.min(epicIndex, spiritTypes.length - 1)];
                } else if (this.rarity === 'legendary') {
                    // 전설: 번개, 얼음, 빛 정령 중 하나
                    const legendaryIndex = Math.floor(Math.random() * 3) + 5; // 5~7 (번개~빛)
                    selectedType = spiritTypes[legendaryIndex];
                }
                
                // 난이도에 따른 정령 타입 조정
                if (this.scene.difficulty === 'easy' && Math.random() < 0.3) {
                    // 쉬움: 더 좋은 정령이 나올 확률 증가
                    const betterIndex = Math.min(spiritTypes.indexOf(selectedType) + 1, spiritTypes.length - 1);
                    selectedType = spiritTypes[betterIndex];
                } else if (this.scene.difficulty === 'hard' && Math.random() < 0.3) {
                    // 어려움: 더 낮은 등급의 정령이 나올 확률 증가
                    const worseIndex = Math.max(spiritTypes.indexOf(selectedType) - 1, 0);
                    selectedType = spiritTypes[worseIndex];
                }
                
                player.addSpirit(selectedType);
                
                // 정령 타입에 따른 색상 설정
                let textColor = 0xffff00; // 기본 노란색
                switch (selectedType) {
                    case '불 정령':
                        textColor = 0xff5500;
                        break;
                    case '물 정령':
                        textColor = 0x00aaff;
                        break;
                    case '바람 정령':
                        textColor = 0x00ff00;
                        break;
                    case '땅 정령':
                        textColor = 0xaa5500;
                        break;
                    case '번개 정령':
                        textColor = 0xffff00;
                        break;
                    case '얼음 정령':
                        textColor = 0x00ffff;
                        break;
                    case '빛 정령':
                        textColor = 0xffffaa;
                        break;
                }
                
                this.createEffectText(`새로운 ${selectedType}!`, textColor);
                break;
                
            case 'upgrade':
                // 랜덤 정령 업그레이드
                if (player.spirits.length > 0) {
                    const spiritIndex = Math.floor(Math.random() * player.spirits.length);
                    player.upgradeSpirit(spiritIndex);
                    
                    const spiritName = player.spirits[spiritIndex].name;
                    this.createEffectText(`${spiritName} 강화!`, 0xff00ff);
                }
                break;
                
            case 'speed':
                // 이동속도 증가 (일시적)
                const originalSpeed = player.speed;
                player.speed += player.speed * (this.value / 100);
                
                // 효과 지속 시간 (희귀도에 따라 증가)
                const duration = 5000 + (this.getRarityValue() * 5000);
                
                this.createEffectText(`이동속도 +${this.value}%`, 0x00ff00);
                
                // 지속 시간 후 원래 속도로 복구
                this.scene.time.delayedCall(duration, () => {
                    player.speed = originalSpeed;
                });
                break;
                
            case 'shield':
                // 보호막 생성 (일시적 무적)
                player.invulnerable = true;
                
                // 보호막 시각 효과
                const shield = this.scene.add.circle(player.x, player.y, 50, 0x0000ff, 0.3);
                shield.setDepth(player.depth - 1);
                
                // 보호막이 플레이어를 따라다니도록
                const shieldFollowEvent = this.scene.time.addEvent({
                    delay: 10,
                    callback: () => {
                        shield.x = player.x;
                        shield.y = player.y;
                    },
                    loop: true
                });
                
                // 효과 지속 시간
                const shieldDuration = this.value * 1000;
                
                this.createEffectText(`보호막 ${this.value}초`, 0x0000ff);
                
                // 지속 시간 후 보호막 제거
                this.scene.time.delayedCall(shieldDuration, () => {
                    player.invulnerable = false;
                    shield.destroy();
                    shieldFollowEvent.remove();
                });
                break;
                
            case 'damage':
                // 모든 정령 공격력 증가
                player.spirits.forEach(spirit => {
                    spirit.damage += this.value;
                });
                
                this.createEffectText(`공격력 +${this.value}`, 0xff8800);
                break;
                
            case 'attackSpeed':
                // 모든 정령 공격 속도 증가
                player.spirits.forEach(spirit => {
                    // 공격 속도는 밀리초 단위이므로 감소시켜야 함
                    const speedIncrease = spirit.attackSpeed * (this.value / 100);
                    spirit.attackSpeed = Math.max(200, spirit.attackSpeed - speedIncrease);
                    
                    // 공격 타이머 업데이트
                    spirit.attackTimer.reset({
                        delay: spirit.attackSpeed,
                        callback: spirit.attack,
                        callbackScope: spirit,
                        loop: true
                    });
                });
                
                this.createEffectText(`공격속도 +${this.value}%`, 0x88ff00);
                break;
        }
        
        // 효과음 재생
        try {
            this.scene.sound.play('item_pickup');
        } catch (error) {
            console.error('아이템 획득 효과음 재생 중 오류:', error);
        }
        
        // 획득 효과
        this.createPickupEffect();
        
        // 아이템 제거
        this.destroy();
    }
    
    createEffectText(text, color) {
        // 효과 텍스트 생성
        const effectText = this.scene.add.text(this.x, this.y - 20, text, {
            fontFamily: 'Arial',
            fontSize: '16px',
            color: `#${color.toString(16).padStart(6, '0')}`,
            stroke: '#000000',
            strokeThickness: 3
        });
        effectText.setOrigin(0.5);
        
        // 텍스트 애니메이션
        this.scene.tweens.add({
            targets: effectText,
            y: effectText.y - 50,
            alpha: 0,
            duration: 1000,
            onComplete: () => {
                effectText.destroy();
            }
        });
    }
    
    createPickupEffect() {
        // 획득 효과 생성
        const effect = this.scene.add.circle(this.x, this.y, 30, 0xffffff, 0.7);
        
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
    
    getRarityValue() {
        // 희귀도에 따른 값 반환
        const rarityValues = {
            'common': 0,
            'uncommon': 1,
            'rare': 2,
            'epic': 3,
            'legendary': 4
        };
        
        return rarityValues[this.rarity] || 0;
    }
    
    fadeOut() {
        // 깜빡임 효과 제거
        if (this.blinkEffect) {
            this.blinkEffect.stop();
        }
        
        // 설명 텍스트 제거
        this.hideDescription();
        
        // 페이드 아웃 효과
        this.scene.tweens.add({
            targets: this,
            alpha: 0,
            scale: 0,
            duration: 300,
            onComplete: () => {
                this.destroy();
            }
        });
    }
    
    destroy() {
        // 타이머 제거
        if (this.removeTimer) {
            this.removeTimer.remove();
        }
        
        // 설명 텍스트 제거
        this.hideDescription();
        
        // 스프라이트 제거
        super.destroy();
    }
}

module.exports = { Item }; 