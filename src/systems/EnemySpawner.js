const Enemy = require('../entities/Enemy').Enemy;

class EnemySpawner {
    constructor(scene) {
        this.scene = scene;
        
        // 스포너 속성
        this.spawnRate = 2000; // 스폰 간격 (밀리초)
        this.spawnTimer = 0;
        this.difficulty = 1;
        this.maxEnemies = 50; // 최대 적 수
        
        // 적 타입 및 확률
        this.enemyTypes = ['normal', 'fast', 'tank', 'boss'];
        this.enemyWeights = [70, 20, 10, 0]; // 초기 가중치 (%)
    }

    update(delta) {
        // 스폰 타이머 업데이트
        this.spawnTimer += delta;
        
        // 스폰 간격마다 적 생성
        if (this.spawnTimer >= this.spawnRate) {
            this.spawnEnemy();
            this.spawnTimer = 0;
        }
    }

    spawnEnemy() {
        // 최대 적 수 체크
        if (this.scene.enemies.getChildren().length >= this.maxEnemies) {
            return;
        }
        
        // 플레이어 위치
        const playerX = this.scene.player.x;
        const playerY = this.scene.player.y;
        
        // 화면 밖에서 스폰 위치 계산
        const spawnDistance = 500; // 플레이어로부터의 거리
        const angle = Phaser.Math.Between(0, 360) * (Math.PI / 180);
        
        const x = playerX + Math.cos(angle) * spawnDistance;
        const y = playerY + Math.sin(angle) * spawnDistance;
        
        // 적 타입 선택
        const enemyType = this.selectEnemyType();
        
        // 적 생성
        const enemy = new Enemy(this.scene, x, y, enemyType);
        
        // 적 그룹에 추가
        this.scene.enemies.add(enemy);
    }

    selectEnemyType() {
        // 가중치에 따른 적 타입 선택
        let total = 0;
        const roll = Phaser.Math.Between(1, 100);
        
        for (let i = 0; i < this.enemyTypes.length; i++) {
            total += this.enemyWeights[i];
            if (roll <= total) {
                return this.enemyTypes[i];
            }
        }
        
        // 기본값
        return 'normal';
    }

    increaseDifficulty() {
        // 난이도 증가
        this.difficulty++;
        
        // 스폰 간격 감소 (최소 500ms)
        this.spawnRate = Math.max(500, this.spawnRate - 100);
        
        // 최대 적 수 증가 (최대 100)
        this.maxEnemies = Math.min(100, this.maxEnemies + 5);
        
        // 적 타입 가중치 조정
        this.adjustEnemyWeights();
        
        console.log(`난이도 증가: ${this.difficulty}`);
    }

    adjustEnemyWeights() {
        // 난이도에 따른 적 타입 가중치 조정
        switch (this.difficulty) {
            case 2:
                this.enemyWeights = [60, 30, 10, 0];
                break;
            case 3:
                this.enemyWeights = [50, 30, 20, 0];
                break;
            case 4:
                this.enemyWeights = [40, 30, 25, 5];
                break;
            case 5:
                this.enemyWeights = [30, 30, 30, 10];
                break;
            case 6:
                this.enemyWeights = [20, 30, 35, 15];
                break;
            case 7:
                this.enemyWeights = [10, 30, 40, 20];
                break;
            default:
                if (this.difficulty > 7) {
                    this.enemyWeights = [10, 20, 40, 30];
                }
                break;
        }
    }
}

module.exports = { EnemySpawner }; 