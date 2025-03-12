const Enemy = require('../entities/Enemy').Enemy;

class EnemySpawner {
    constructor(scene) {
        this.scene = scene;
        
        // 적 생성 타이머
        this.spawnTimer = null;
        
        // 적 생성 간격 (밀리초)
        this.spawnInterval = 2000;
        
        // 적 생성 범위 (플레이어 주변)
        this.spawnRadius = 500;
        
        // 최소 생성 거리 (플레이어로부터)
        this.minSpawnDistance = 300;
        
        // 웨이브 시스템
        this.currentWave = 1;
        this.enemiesPerWave = 10;
        this.enemiesSpawned = 0;
        this.enemiesKilled = 0;
        this.waveCompleted = false;
        this.waveCooldown = false;
        
        // 보스 웨이브 간격
        this.bossWaveInterval = 5;
        
        // 난이도 설정
        this.difficulty = 1;
        this.difficultyMultiplier = 1;
        
        // 적 타입별 가중치
        this.enemyWeights = {
            normal: 70,
            fast: 15,
            tank: 10,
            ranged: 5,
            explosive: 0
        };
        
        // 시간에 따른 난이도 증가 타이머
        this.difficultyTimer = scene.time.addEvent({
            delay: 60000, // 1분마다
            callback: this.increaseDifficulty,
            callbackScope: this,
            loop: true
        });
    }
    
    start() {
        // 적 생성 타이머 시작
        this.spawnTimer = this.scene.time.addEvent({
            delay: this.spawnInterval,
            callback: this.spawnEnemy,
            callbackScope: this,
            loop: true
        });
        
        // 웨이브 시스템 초기화
        this.currentWave = 1;
        this.enemiesSpawned = 0;
        this.enemiesKilled = 0;
        this.waveCompleted = false;
        
        // 웨이브 시작 메시지
        this.showWaveMessage(`웨이브 ${this.currentWave} 시작!`);
    }
    
    stop() {
        // 적 생성 타이머 정지
        if (this.spawnTimer) {
            this.spawnTimer.remove();
            this.spawnTimer = null;
        }
        
        // 난이도 타이머 정지
        if (this.difficultyTimer) {
            this.difficultyTimer.remove();
            this.difficultyTimer = null;
        }
    }
    
    spawnEnemy() {
        // 플레이어가 없으면 리턴
        if (!this.scene.player) return;
        
        // 웨이브가 완료되었으면 리턴
        if (this.waveCompleted) return;
        
        // 웨이브당 적 수 제한
        if (this.enemiesSpawned >= this.enemiesPerWave * this.currentWave) {
            // 모든 적이 처치되었는지 확인
            if (this.enemiesKilled >= this.enemiesSpawned) {
                this.completeWave();
            }
            return;
        }
        
        // 플레이어 위치
        const playerX = this.scene.player.x;
        const playerY = this.scene.player.y;
        
        // 생성 위치 계산 (플레이어 주변)
        let spawnX, spawnY, distance;
        
        do {
            // 랜덤 각도
            const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
            
            // 랜덤 거리 (최소 거리 ~ 최대 거리)
            const radius = Phaser.Math.FloatBetween(this.minSpawnDistance, this.spawnRadius);
            
            // 위치 계산
            spawnX = playerX + Math.cos(angle) * radius;
            spawnY = playerY + Math.sin(angle) * radius;
            
            // 플레이어와의 거리 계산
            distance = Phaser.Math.Distance.Between(playerX, playerY, spawnX, spawnY);
            
        } while (distance < this.minSpawnDistance);
        
        // 적 타입 결정
        let enemyType;
        
        // 보스 웨이브인 경우
        if (this.currentWave % this.bossWaveInterval === 0 && this.enemiesSpawned === 0) {
            enemyType = 'boss';
        } else {
            enemyType = this.getRandomEnemyType();
        }
        
        // 적 생성
        const enemy = new Enemy(this.scene, spawnX, spawnY, enemyType);
        
        // 난이도에 따른 적 강화
        this.applyDifficultyToEnemy(enemy);
        
        // 적 그룹에 추가
        this.scene.enemies.add(enemy);
        
        // 적 생성 카운트 증가
        this.enemiesSpawned++;
        
        // 적 사망 이벤트 리스너
        enemy.on('destroy', () => {
            this.enemiesKilled++;
            
            // 웨이브 완료 체크
            if (this.enemiesSpawned >= this.enemiesPerWave * this.currentWave && 
                this.enemiesKilled >= this.enemiesSpawned) {
                this.completeWave();
            }
        });
        
        // 생성 효과
        this.createSpawnEffect(spawnX, spawnY);
    }
    
    getRandomEnemyType() {
        // 적 타입 가중치에 따른 랜덤 선택
        const types = Object.keys(this.enemyWeights);
        const weights = Object.values(this.enemyWeights);
        
        // 가중치 합계
        const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
        
        // 랜덤 값
        const roll = Phaser.Math.Between(1, totalWeight);
        
        // 가중치에 따른 선택
        let cumulativeWeight = 0;
        
        for (let i = 0; i < types.length; i++) {
            cumulativeWeight += weights[i];
            
            if (roll <= cumulativeWeight) {
                return types[i];
            }
        }
        
        return 'normal'; // 기본값
    }
    
    applyDifficultyToEnemy(enemy) {
        // 난이도에 따른 적 강화
        const multiplier = this.difficultyMultiplier;
        
        // 체력 증가
        enemy.health *= multiplier;
        enemy.maxHealth *= multiplier;
        
        // 공격력 증가
        enemy.damage *= multiplier;
        
        // 경험치 및 드롭률 증가
        enemy.expValue = Math.floor(enemy.expValue * multiplier);
        enemy.dropRate = Math.min(1.0, enemy.dropRate * multiplier);
        
        // 체력바 업데이트
        enemy.updateHealthBar();
    }
    
    completeWave() {
        // 이미 완료된 웨이브면 리턴
        if (this.waveCompleted) return;
        
        // 웨이브 완료 설정
        this.waveCompleted = true;
        
        // 웨이브 완료 메시지
        this.showWaveMessage(`웨이브 ${this.currentWave} 완료!`);
        
        // 웨이브 쿨다운 설정
        this.waveCooldown = true;
        
        // 다음 웨이브 준비
        this.scene.time.delayedCall(5000, () => {
            this.currentWave++;
            this.enemiesSpawned = 0;
            this.enemiesKilled = 0;
            this.waveCompleted = false;
            this.waveCooldown = false;
            
            // 웨이브에 따른 난이도 조정
            this.adjustDifficultyByWave();
            
            // 다음 웨이브 시작 메시지
            this.showWaveMessage(`웨이브 ${this.currentWave} 시작!`);
            
            // 보스 웨이브 알림
            if (this.currentWave % this.bossWaveInterval === 0) {
                this.scene.time.delayedCall(1000, () => {
                    this.showWaveMessage('보스 웨이브!', 0xff00ff);
                });
            }
        });
    }
    
    adjustDifficultyByWave() {
        // 웨이브에 따른 난이도 조정
        
        // 적 생성 간격 감소 (최소 500ms)
        this.spawnInterval = Math.max(500, 2000 - (this.currentWave * 100));
        
        // 타이머 업데이트
        if (this.spawnTimer) {
            this.spawnTimer.reset({
                delay: this.spawnInterval,
                callback: this.spawnEnemy,
                callbackScope: this,
                loop: true
            });
        }
        
        // 적 타입 가중치 조정
        if (this.currentWave >= 3) {
            this.enemyWeights.fast = 20;
            this.enemyWeights.tank = 15;
            this.enemyWeights.ranged = 10;
        }
        
        if (this.currentWave >= 5) {
            this.enemyWeights.explosive = 5;
            this.enemyWeights.normal = 50;
        }
        
        if (this.currentWave >= 10) {
            this.enemyWeights.fast = 25;
            this.enemyWeights.tank = 20;
            this.enemyWeights.ranged = 15;
            this.enemyWeights.explosive = 10;
            this.enemyWeights.normal = 30;
        }
    }
    
    increaseDifficulty() {
        // 시간에 따른 난이도 증가
        if (!this || !this.scene) return; // this 체크 추가
        
        this.difficulty += 0.5;
        this.difficultyMultiplier = 1 + ((this.difficulty - 1) * 0.2);
        
        // 난이도 증가 메시지
        this.showWaveMessage(`난이도 증가: ${this.difficulty.toFixed(1)}`, 0xff8800);
    }
    
    createSpawnEffect(x, y) {
        // 적 생성 효과
        if (!this || !this.scene) return; // this 체크 추가
        
        const effect = this.scene.add.circle(x, y, 30, 0xff0000, 0.5);
        
        // 효과 애니메이션
        this.scene.tweens.add({
            targets: effect,
            scale: 0,
            alpha: 0,
            duration: 500,
            onComplete: () => {
                effect.destroy();
            }
        });
    }
    
    showWaveMessage(message, color = 0xffffff) {
        // 웨이브 메시지 표시
        if (!this || !this.scene || !this.scene.cameras || !this.scene.cameras.main) return; // 필요한 객체 체크 추가
        
        try {
            const text = this.scene.add.text(
                this.scene.cameras.main.centerX,
                100,
                message,
                {
                    fontFamily: 'Arial',
                    fontSize: '32px',
                    color: `#${color.toString(16).padStart(6, '0')}`,
                    stroke: '#000000',
                    strokeThickness: 4,
                    align: 'center'
                }
            );
            text.setOrigin(0.5);
            text.setDepth(1000);
            text.setScrollFactor(0); // 카메라 스크롤에 영향 받지 않도록 설정
            
            // 메시지 애니메이션
            this.scene.tweens.add({
                targets: text,
                y: text.y - 50,
                alpha: 0,
                duration: 2000,
                ease: 'Power2',
                onComplete: () => {
                    if (text && text.destroy) {
                        text.destroy();
                    }
                }
            });
        } catch (error) {
            console.error('웨이브 메시지 표시 중 오류:', error);
        }
    }
    
    getCurrentWaveInfo() {
        // 현재 웨이브 정보 반환
        return {
            wave: this.currentWave,
            enemiesSpawned: this.enemiesSpawned,
            enemiesKilled: this.enemiesKilled,
            enemiesPerWave: this.enemiesPerWave * this.currentWave,
            difficulty: this.difficulty
        };
    }
}

module.exports = { EnemySpawner }; 