const Enemy = require('../entities/Enemy').Enemy;

class EnemySpawner {
    constructor(scene) {
        this.scene = scene;
        
        // 적 생성 타이머
        this.spawnTimer = null;
        
        // 적 생성 간격 (밀리초)
        this.spawnRate = 2000;
        this.spawnInterval = this.spawnRate;
        
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
        this.bossWaveInterval = 3;
        
        // 난이도 설정
        this.difficulty = 1;
        this.difficultyMultiplier = 1;
        
        // 적 체력 및 공격력 배율
        this.enemyHealthMultiplier = 1.0;
        this.enemyDamageMultiplier = 1.0;
        
        // 최대 적 수
        this.maxEnemies = 15;
        
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
        
        // 난이도에 따른 적 타입 가중치 조정
        this.adjustEnemyWeightsByDifficulty();
        
        // 웨이브 시작 메시지
        this.showWaveMessage(`웨이브 ${this.currentWave} 시작!`);
    }
    
    // 난이도에 따른 적 타입 가중치 조정
    adjustEnemyWeightsByDifficulty() {
        const difficulty = this.scene.difficulty || 'normal';
        
        switch (difficulty) {
            case 'easy':
                this.enemyWeights = {
                    normal: 80,
                    fast: 10,
                    tank: 8,
                    ranged: 2,
                    explosive: 0
                };
                break;
                
            case 'normal':
                this.enemyWeights = {
                    normal: 70,
                    fast: 15,
                    tank: 10,
                    ranged: 5,
                    explosive: 0
                };
                break;
                
            case 'hard':
                this.enemyWeights = {
                    normal: 60,
                    fast: 20,
                    tank: 12,
                    ranged: 8,
                    explosive: 0
                };
                break;
        }
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
        
        // 최대 적 수 제한
        if (this.scene.enemies.getChildren().length >= this.maxEnemies) {
            return;
        }
        
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
        const baseMultiplier = this.difficultyMultiplier;
        
        // 체력 증가
        enemy.health *= baseMultiplier * this.enemyHealthMultiplier;
        enemy.maxHealth *= baseMultiplier * this.enemyHealthMultiplier;
        
        // 공격력 증가
        enemy.damage *= baseMultiplier * this.enemyDamageMultiplier;
        
        // 경험치 및 드롭률 증가
        enemy.expValue = Math.floor(enemy.expValue * baseMultiplier);
        
        // 난이도에 따른 드롭률 조정
        const difficulty = this.scene.difficulty || 'normal';
        switch (difficulty) {
            case 'easy':
                enemy.dropRate = Math.min(1.0, enemy.dropRate * 1.2); // 쉬움: 드롭률 20% 증가
                break;
            case 'normal':
                enemy.dropRate = Math.min(1.0, enemy.dropRate * baseMultiplier); // 보통: 기본 드롭률
                break;
            case 'hard':
                enemy.dropRate = Math.min(1.0, enemy.dropRate * 0.8); // 어려움: 드롭률 20% 감소
                break;
        }
        
        // 체력바 업데이트
        enemy.updateHealthBar();
    }
    
    completeWave() {
        try {
            // 이미 완료된 웨이브면 리턴
            if (this.waveCompleted) return;
            
            // 씬이 활성화되어 있는지 확인
            if (!this.scene || !this.scene.active) {
                return;
            }
            
            // 웨이브 완료 설정
            this.waveCompleted = true;
            
            // 웨이브 완료 메시지
            this.showWaveMessage(`웨이브 ${this.currentWave} 완료!`);
            
            // 웨이브 쿨다운 설정
            this.waveCooldown = true;
            
            // 다음 웨이브 준비
            if (this.scene && this.scene.time) {
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
                        if (this.scene && this.scene.time) {
                            this.scene.time.delayedCall(1000, () => {
                                this.showWaveMessage('보스 웨이브!', 0xff00ff);
                            });
                        }
                    }
                });
            }
        } catch (error) {
            console.error('웨이브 완료 처리 중 오류:', error);
        }
    }
    
    adjustDifficultyByWave() {
        // 웨이브에 따른 난이도 조정
        
        // 적 생성 간격 감소 (최소 500ms)
        this.spawnInterval = Math.max(500, this.spawnRate - (this.currentWave * 100));
        
        // 타이머 업데이트
        if (this.spawnTimer) {
            this.spawnTimer.reset({
                delay: this.spawnInterval,
                callback: this.spawnEnemy,
                callbackScope: this,
                loop: true
            });
        }
        
        // 난이도 증가
        this.difficultyMultiplier = 1 + (this.currentWave * 0.1);
        
        // 적 타입 가중치 조정
        if (this.currentWave >= 3) {
            this.enemyWeights.explosive = Math.min(20, this.enemyWeights.explosive + 2);
        }
        
        // 웨이브 정보 업데이트
        if (this.scene.updateWaveInfo) {
            this.scene.updateWaveInfo();
        }
    }
    
    increaseDifficulty() {
        // 시간에 따른 난이도 증가
        this.difficulty += 0.1;
        
        // 적 생성 간격 감소 (최소 500ms)
        this.spawnInterval = Math.max(500, this.spawnInterval - 50);
        
        // 타이머 업데이트
        if (this.spawnTimer) {
            this.spawnTimer.reset({
                delay: this.spawnInterval,
                callback: this.spawnEnemy,
                callbackScope: this,
                loop: true
            });
        }
        
        // 난이도 증가 메시지 (10% 확률)
        if (Phaser.Math.Between(1, 10) === 1) {
            this.showWaveMessage('난이도 증가!', 0xff0000);
        }
    }
    
    createSpawnEffect(x, y) {
        // 적 생성 효과
        const circle = this.scene.add.circle(x, y, 30, 0xff0000, 0.7);
        
        // 효과 애니메이션
        this.scene.tweens.add({
            targets: circle,
            alpha: 0,
            scale: 2,
            duration: 500,
            onComplete: () => {
                circle.destroy();
            }
        });
    }
    
    showWaveMessage(message, color = 0xffffff) {
        try {
            // 씬이 활성화되어 있는지 확인
            if (!this.scene || !this.scene.active) {
                return;
            }
            
            // 카메라가 유효한지 확인
            if (!this.scene.cameras || !this.scene.cameras.main) {
                return;
            }
            
            // 웨이브 메시지 표시
            const text = this.scene.add.text(
                this.scene.cameras.main.width / 2,
                this.scene.cameras.main.height / 3,
                message,
                {
                    font: '32px Arial',
                    fill: '#ffffff',
                    stroke: '#000000',
                    strokeThickness: 4
                }
            ).setOrigin(0.5);
            
            // 텍스트 색상 설정
            text.setTint(color);
            
            // 텍스트 애니메이션
            this.scene.tweens.add({
                targets: text,
                y: text.y - 50,
                alpha: 0,
                duration: 2000,
                ease: 'Power2',
                onComplete: () => {
                    text.destroy();
                }
            });
            
            // 효과음 재생
            if (message.includes('시작')) {
                try {
                    if (this.scene.sound && this.scene.sound.play) {
                        this.scene.sound.play('wave_start');
                    }
                } catch (error) {
                    console.error('웨이브 시작 효과음 재생 중 오류:', error);
                }
            } else if (message.includes('완료')) {
                try {
                    if (this.scene.sound && this.scene.sound.play) {
                        this.scene.sound.play('wave_complete');
                    }
                } catch (error) {
                    console.error('웨이브 완료 효과음 재생 중 오류:', error);
                }
            } else if (message.includes('보스')) {
                try {
                    if (this.scene.sound && this.scene.sound.play) {
                        this.scene.sound.play('boss_warning');
                    }
                } catch (error) {
                    console.error('보스 경고 효과음 재생 중 오류:', error);
                }
            }
        } catch (error) {
            console.error('웨이브 메시지 표시 중 오류:', error);
        }
    }
    
    getCurrentWaveInfo() {
        // 현재 웨이브 정보 반환
        return {
            currentWave: this.currentWave,
            enemiesSpawned: this.enemiesSpawned,
            enemiesKilled: this.enemiesKilled,
            totalEnemies: this.enemiesPerWave * this.currentWave,
            waveCompleted: this.waveCompleted,
            waveCooldown: this.waveCooldown,
            nextBossWave: this.bossWaveInterval - (this.currentWave % this.bossWaveInterval)
        };
    }
    
    // 적 생성 중지
    stopSpawning() {
        // 적 생성 타이머 중지
        if (this.spawnTimer) {
            this.spawnTimer.remove();
            this.spawnTimer = null;
        }
        
        // 난이도 증가 타이머 중지
        if (this.difficultyTimer) {
            this.difficultyTimer.remove();
            this.difficultyTimer = null;
        }
        
        console.log('적 생성 중지됨');
    }
}

// 모듈 내보내기
module.exports = { EnemySpawner }; 