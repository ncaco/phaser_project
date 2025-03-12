class EnemySpawner {
    constructor(scene) {
        this.scene = scene;
        this.lastSpawnTime = 0;
        this.spawnInterval = 2000; // 2초마다 적 생성
        this.maxEnemies = 10; // 최대 적 수
        this.logDebug('EnemySpawner 생성됨');
    }

    // 디버그 로그 헬퍼 함수
    logDebug(message) {
        console.log(message);
        if (this.scene && typeof this.scene.logDebug === 'function') {
            this.scene.logDebug(message);
        } else if (typeof window.debugLog === 'function') {
            window.debugLog(message);
        }
    }

    update() {
        try {
            const currentTime = this.scene.time.now;
            
            // 적 생성 간격 확인
            if (currentTime - this.lastSpawnTime > this.spawnInterval) {
                // 현재 적 수 확인
                const currentEnemies = this.scene.enemies.getChildren().length;
                
                // 최대 적 수보다 적으면 새로운 적 생성
                if (currentEnemies < this.maxEnemies) {
                    this.spawnEnemy();
                    this.lastSpawnTime = currentTime;
                }
            }
        } catch (error) {
            console.error('EnemySpawner update 중 오류 발생:', error);
            this.logDebug('EnemySpawner update 오류: ' + error.message);
        }
    }

    spawnEnemy() {
        try {
            this.logDebug('적 생성 시작');
            
            // 화면 가장자리에 적 생성
            const side = Math.floor(Math.random() * 4); // 0: 위, 1: 오른쪽, 2: 아래, 3: 왼쪽
            let x, y;
            
            switch (side) {
                case 0: // 위
                    x = Math.random() * this.scene.cameras.main.width;
                    y = 0;
                    break;
                case 1: // 오른쪽
                    x = this.scene.cameras.main.width;
                    y = Math.random() * this.scene.cameras.main.height;
                    break;
                case 2: // 아래
                    x = Math.random() * this.scene.cameras.main.width;
                    y = this.scene.cameras.main.height;
                    break;
                case 3: // 왼쪽
                    x = 0;
                    y = Math.random() * this.scene.cameras.main.height;
                    break;
            }
            
            // 적 생성
            const enemy = this.scene.enemies.create(x, y, 'enemy');
            enemy.setScale(0.7);
            enemy.health = 3; // 적 체력 설정
            
            // 적이 플레이어를 향해 이동하도록 설정
            this.moveEnemyTowardsPlayer(enemy);
            
            this.logDebug('적 생성 완료: x=' + x + ', y=' + y);
        } catch (error) {
            console.error('적 생성 중 오류 발생:', error);
            this.logDebug('적 생성 오류: ' + error.message);
        }
    }

    moveEnemyTowardsPlayer(enemy) {
        try {
            // 플레이어 방향으로 이동
            const dx = this.scene.player.x - enemy.x;
            const dy = this.scene.player.y - enemy.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // 속도 계산 (정규화)
            const speed = 80;
            const vx = (dx / distance) * speed;
            const vy = (dy / distance) * speed;
            
            // 적 속도 설정
            enemy.setVelocity(vx, vy);
        } catch (error) {
            console.error('적 이동 설정 중 오류 발생:', error);
            this.logDebug('적 이동 설정 오류: ' + error.message);
        }
    }
}

module.exports = { EnemySpawner }; 