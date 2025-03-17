const Enemy = require('../entities/Enemy').Enemy;

class EnemySpawner {
    constructor(scene) {
        console.log('EnemySpawner 생성자 호출됨');
        
        // 씬 참조
        this.scene = scene;
        
        console.log('EnemySpawner 생성자 - 씬 참조 설정됨:', {
            씬존재: this.scene ? true : false,
            씬활성화: this.scene ? this.scene.active : false,
            플레이어존재: this.scene && this.scene.player ? true : false
        });
        
        // 적 생성 속성
        this.spawnRate = 2000; // 기본 생성 간격 (밀리초)
        this.minSpawnDistance = 200; // 최소 생성 거리
        this.spawnRadius = 500; // 생성 반경
        this.maxEnemies = 15; // 최대 적 수
        
        // 웨이브 시스템
        this.currentWave = 1;
        this.enemiesPerWave = 10;
        this.enemiesSpawned = 0;
        this.enemiesKilled = 0;
        this.waveCompleted = false;
        this.waveCooldown = false;
        
        // 보스 웨이브 간격
        this.bossWaveInterval = 3;
        
        // 난이도 증가 속성
        this.difficultyIncreaseRate = 0.1; // 10% 증가
        this.difficultyIncreaseInterval = 30000; // 30초마다
        this.enemyHealthMultiplier = 1.0;
        this.enemyDamageMultiplier = 1.0;
        this.enemySpeedMultiplier = 1.0;
        
        // 타이머
        this.spawnTimer = null;
        this.difficultyTimer = null;
        
        // 적 타입별 가중치
        this.enemyWeights = {
            normal: 70,
            fast: 15,
            tank: 10,
            ranged: 5,
            explosive: 0
        };
        
        console.log('EnemySpawner 생성자 완료');
    }
    
    start() {
        console.log('EnemySpawner.start() 호출됨');
        
        // 씬 상태 확인 - 씬 활성화 체크 제거
        if (!this.scene) {
            console.error('EnemySpawner.start() 실패: 씬 객체가 없음');
            return;
        }
        
        // 씬 활성화 체크 제거 - 활성화 여부와 상관없이 진행
        console.log('EnemySpawner.start() - 씬 존재 확인됨');
        
        if (!this.scene.player) {
            console.error('EnemySpawner.start() 실패: 플레이어 객체가 없음');
            return;
        }
        
        console.log('EnemySpawner.start() - 플레이어 존재 확인됨');
        
        try {
            // 적 생성 타이머 시작
            if (this.spawnTimer) {
                this.spawnTimer.remove();
            }
            
            this.spawnTimer = this.scene.time.addEvent({
                delay: this.spawnRate,
                callback: this.spawnEnemy,
                callbackScope: this,
                loop: true
            });
            
            console.log('EnemySpawner - 적 생성 타이머 시작됨:', {
                생성간격: this.spawnRate,
                최대적수: this.maxEnemies,
                현재웨이브: this.currentWave
            });
            
            // 난이도 증가 타이머 시작
            if (this.difficultyTimer) {
                this.difficultyTimer.remove();
            }
            
            this.difficultyTimer = this.scene.time.addEvent({
                delay: this.difficultyIncreaseInterval,
                callback: this.increaseDifficulty,
                callbackScope: this,
                loop: true
            });
            
            console.log('EnemySpawner - 난이도 증가 타이머 시작됨:', {
                증가간격: this.difficultyIncreaseInterval,
                증가율: this.difficultyIncreaseRate
            });
            
            // 첫 번째 적 즉시 생성
            this.scene.time.delayedCall(500, this.spawnEnemy, [], this);
            
            console.log('EnemySpawner.start() 완료');
        } catch (error) {
            console.error('EnemySpawner.start() 중 오류 발생:', error);
            console.error('오류 세부 정보:', error.stack);
        }
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
    
    // 적 생성 중지 메서드 추가 (GameScene의 shutdown에서 호출)
    stopSpawning() {
        this.stop(); // 기존 stop 메서드 호출
    }
    
    spawnEnemy() {
        // 플레이어가 없으면 리턴
        if (!this.scene) {
            console.error('적 생성 실패: 씬 객체가 없음');
            return;
        }
        
        // 씬 활성화 체크 제거 - 활성화 여부와 상관없이 진행
        
        if (!this.scene.player) {
            console.error('적 생성 실패: 플레이어 객체가 없음');
            console.log('현재 씬 상태:', {
                씬이름: this.scene.scene ? this.scene.scene.key : '알 수 없음',
                씬시스템초기화: this.scene.sys ? '완료' : '실패',
                플레이어참조: this.scene.player ? '있음' : '없음'
            });
            return;
        }
        
        // 게임 오버 상태면 리턴
        if (this.scene.gameOver) {
            console.log('적 생성 실패: 게임 오버 상태');
            return;
        }
        
        // 최대 적 수 제한
        if (this.scene.enemies && this.scene.enemies.getChildren && 
            this.scene.enemies.getChildren().length >= this.maxEnemies) {
            console.log(`적 생성 실패: 최대 적 수(${this.maxEnemies}) 도달`);
            return;
        }
        
        // 웨이브당 적 수 제한 - 웨이브 시스템 사용 시
        if (this.enemiesSpawned >= this.enemiesPerWave * this.currentWave) {
            // 모든 적이 처치되었는지 확인
            if (this.enemiesKilled >= this.enemiesSpawned) {
                this.completeWave();
            }
            console.log(`적 생성 실패: 웨이브당 적 수 제한 도달 (${this.enemiesSpawned}/${this.enemiesPerWave * this.currentWave})`);
            return;
        }
        
        console.log('적 생성 시도 중...');
        
        // 플레이어 위치
        const playerX = this.scene.player.x;
        const playerY = this.scene.player.y;
        
        // 생성 위치 계산 (플레이어 주변)
        let spawnX, spawnY, distance;
        let attempts = 0;
        const maxAttempts = 10; // 최대 시도 횟수
        
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
            
            attempts++;
            
            // 최대 시도 횟수를 초과하면 강제로 종료
            if (attempts >= maxAttempts) {
                console.log(`적 생성 위치 찾기 실패: 최대 시도 횟수(${maxAttempts}) 초과`);
                break;
            }
        } while (distance < this.minSpawnDistance);
        
        // 화면 경계 확인 및 조정
        const padding = 50; // 화면 경계로부터의 여유 공간
        
        if (this.scene.cameras && this.scene.cameras.main) {
            const camera = this.scene.cameras.main;
            const bounds = {
                left: camera.scrollX - padding,
                right: camera.scrollX + camera.width + padding,
                top: camera.scrollY - padding,
                bottom: camera.scrollY + camera.height + padding
            };
            
            // 화면 밖으로 나가지 않도록 조정
            spawnX = Phaser.Math.Clamp(spawnX, bounds.left, bounds.right);
            spawnY = Phaser.Math.Clamp(spawnY, bounds.top, bounds.bottom);
        }
        
        // 적 타입 결정
        let enemyType;
        
        // 보스 웨이브인 경우
        if (this.currentWave % this.bossWaveInterval === 0 && this.enemiesSpawned === 0) {
            enemyType = 'boss';
        } else {
            enemyType = this.getRandomEnemyType();
        }
        
        console.log(`적 생성 시도: 타입=${enemyType}, 위치=(${Math.round(spawnX)}, ${Math.round(spawnY)})`);
        
        try {
            // 적 생성 시작
            console.log('적 생성 시작');
            
            // Enemy 클래스 가져오기
            const Enemy = require('../entities/Enemy').Enemy;
            
            // 적 생성
            const enemy = new Enemy(this.scene, spawnX, spawnY, enemyType);
            console.log(`적 생성 성공: 타입=${enemyType}`);
            
            // 난이도에 따른 적 강화
            this.applyDifficultyToEnemy(enemy);
            
            // 적 그룹에 추가
            try {
                if (this.scene.enemies && typeof this.scene.enemies.add === 'function') {
                    this.scene.enemies.add(enemy);
                    console.log('적이 그룹에 추가됨');
                } else {
                    console.error('적 그룹이 존재하지 않거나 add 메서드가 없음');
                    console.log('적 그룹 상태:', {
                        존재여부: this.scene.enemies ? true : false,
                        add메서드: this.scene.enemies ? (typeof this.scene.enemies.add === 'function' ? '있음' : '없음') : '해당없음'
                    });
                    
                    // 적 그룹이 없으면 생성
                    if (!this.scene.enemies && this.scene.physics) {
                        console.log('적 그룹 새로 생성 시도');
                        this.scene.enemies = this.scene.physics.add.group();
                        this.scene.enemies.add(enemy);
                        console.log('적 그룹 생성 및 적 추가 완료');
                    }
                }
            } catch (groupError) {
                console.error('적 그룹에 추가 중 오류:', groupError);
            }
            
            // 적 생성 카운트 증가
            this.enemiesSpawned++;
            
            // 적 사망 이벤트 리스너
            try {
                enemy.on('destroy', () => {
                    this.enemiesKilled++;
                    console.log(`적 처치: ${this.enemiesKilled}/${this.enemiesSpawned}`);
                    
                    // 웨이브 완료 체크
                    if (this.enemiesSpawned >= this.enemiesPerWave * this.currentWave && 
                        this.enemiesKilled >= this.enemiesSpawned) {
                        this.completeWave();
                    }
                    
                    // 추가 적 생성 (25% 확률)
                    if (Phaser.Math.Between(1, 4) === 1) {
                        // 0.5초 후 추가 적 생성
                        if (this.scene && this.scene.time) {
                            this.scene.time.delayedCall(500, () => {
                                if (!this.scene.gameOver && this.scene.active) {
                                    this.spawnEnemy();
                                }
                            });
                        }
                    }
                });
            } catch (eventError) {
                console.error('적 이벤트 리스너 설정 중 오류:', eventError);
            }
            
            // 생성 효과
            this.createSpawnEffect(spawnX, spawnY);
        } catch (error) {
            console.error('적 생성 중 오류 발생:', error);
            console.error('오류 세부 정보:', error.stack);
            
            // 오류 발생 시 추가 정보 로깅
            console.log('오류 발생 시 상태:', {
                씬존재: this.scene ? true : false,
                플레이어존재: this.scene && this.scene.player ? true : false,
                적그룹존재: this.scene && this.scene.enemies ? true : false,
                위치: `(${Math.round(spawnX)}, ${Math.round(spawnY)})`,
                적타입: enemyType
            });
        }
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
        const baseMultiplier = this.difficultyIncreaseRate;
        
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
        this.spawnRate = Math.max(500, this.spawnRate - (this.currentWave * 100));
        
        // 타이머 업데이트
        if (this.spawnTimer) {
            this.spawnTimer.reset({
                delay: this.spawnRate,
                callback: this.spawnEnemy,
                callbackScope: this,
                loop: true
            });
        }
        
        // 난이도 증가
        this.difficultyIncreaseRate = 1 + (this.currentWave * 0.1);
        
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
        this.difficultyIncreaseRate += 0.1;
        
        // 적 생성 간격 감소 (최소 500ms)
        this.spawnRate = Math.max(500, this.spawnRate - 50);
        
        // 최대 적 수 증가 (최대 30마리)
        this.maxEnemies = Math.min(30, this.maxEnemies + 1);
        
        // 적 체력 및 공격력 배율 증가
        this.enemyHealthMultiplier += 0.05;
        this.enemyDamageMultiplier += 0.05;
        
        // 타이머 업데이트
        if (this.spawnTimer) {
            this.spawnTimer.reset({
                delay: this.spawnRate,
                callback: this.spawnEnemy,
                callbackScope: this,
                loop: true
            });
        }
        
        // 추가 적 즉시 생성 (10% 확률)
        if (Phaser.Math.Between(1, 10) === 1) {
            // 1~3마리 추가 생성
            const extraEnemies = Phaser.Math.Between(1, 3);
            for (let i = 0; i < extraEnemies; i++) {
                this.scene.time.delayedCall(i * 200, () => {
                    if (this.scene && this.scene.active && !this.scene.gameOver) {
                        this.spawnEnemy();
                    }
                });
            }
        }
        
        // 난이도 증가 메시지 (10% 확률)
        if (Phaser.Math.Between(1, 10) === 1) {
            this.showWaveMessage('난이도 증가!', 0xff0000);
        }
        
        console.log(`난이도 증가: ${this.difficultyIncreaseRate.toFixed(1)}, 생성 간격: ${this.spawnRate}ms, 최대 적 수: ${this.maxEnemies}`);
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
}

// 모듈 내보내기
module.exports = { EnemySpawner }; 