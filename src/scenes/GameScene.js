const Player = require('../entities/Player').Player;
const Spirit = require('../entities/Spirit').Spirit;
const Enemy = require('../entities/Enemy').Enemy;
const Item = require('../entities/Item').Item;
const EnemySpawner = require('../systems/EnemySpawner').EnemySpawner;
const LevelSystem = require('../systems/LevelSystem').LevelSystem;

class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        this.logDebug('GameScene 생성됨');
        this.player = null;
        this.spirit = null;
        this.enemies = null;
        this.items = null;
        this.levelSystem = null;
        this.enemySpawner = null;
        this.score = 0;
        this.gameOver = false;
    }

    // 디버그 로그 헬퍼 함수
    logDebug(message) {
        console.log(message);
        if (typeof window.debugLog === 'function') {
            window.debugLog(message);
        }
    }

    init() {
        // 게임 상태 초기화
        this.gameTime = 0;
        this.gameOver = false;
    }

    create() {
        try {
            this.logDebug('GameScene create 시작');
            
            // 배경색 설정
            this.cameras.main.setBackgroundColor('#1a2b3c');
            
            // 배경 추가
            this.createBackground();
            
            // 플레이어 생성
            this.createPlayer();
            
            // 시스템 초기화
            this.initSystems();
            
            // 충돌 설정
            this.setupCollisions();
            
            // 키보드 입력 설정
            this.cursors = this.input.keyboard.createCursorKeys();
            
            // UI 씬 시작
            this.scene.launch('UIScene');
            
            // 게임 타이머 설정
            this.setupGameTimer();
            
            this.logDebug('GameScene create 완료');
        } catch (error) {
            console.error('GameScene create 중 오류 발생:', error);
            this.logDebug('GameScene create 오류: ' + error.message);
        }
    }

    createBackground() {
        // 배경 이미지 추가
        this.add.image(0, 0, 'background')
            .setOrigin(0, 0)
            .setDisplaySize(this.cameras.main.width, this.cameras.main.height);
    }

    createPlayer() {
        // 플레이어 생성
        this.player = new Player(this, this.cameras.main.width / 2, this.cameras.main.height / 2);
        
        // 카메라가 플레이어를 따라가도록 설정
        this.cameras.main.startFollow(this.player);
    }

    initSystems() {
        // 레벨 시스템 초기화
        this.levelSystem = new LevelSystem(this);
        
        // 적 스포너 초기화
        this.enemySpawner = new EnemySpawner(this);
        
        // 그룹 생성
        this.enemies = this.physics.add.group({
            classType: Enemy,
            runChildUpdate: true
        });
        
        this.spirits = this.physics.add.group({
            classType: Spirit,
            runChildUpdate: true
        });
        
        this.items = this.physics.add.group({
            classType: Item,
            runChildUpdate: true
        });
    }

    setupCollisions() {
        // 플레이어와 적 충돌
        this.physics.add.overlap(this.player, this.enemies, this.handlePlayerEnemyCollision, null, this);
        
        // 정령과 적 충돌
        this.physics.add.overlap(this.spirits, this.enemies, this.handleSpiritEnemyCollision, null, this);
        
        // 플레이어와 아이템 충돌
        this.physics.add.overlap(this.player, this.items, this.handlePlayerItemCollision, null, this);
    }

    setupGameTimer() {
        // 1초마다 게임 시간 업데이트
        this.time.addEvent({
            delay: 1000,
            callback: this.updateGameTime,
            callbackScope: this,
            loop: true
        });
    }

    updateGameTime() {
        if (this.gameOver) return;
        
        this.gameTime++;
        this.events.emit('timeUpdate', this.gameTime);
        
        // 30초마다 적 스폰 난이도 증가
        if (this.gameTime % 30 === 0) {
            this.enemySpawner.increaseDifficulty();
        }
    }

    handlePlayerEnemyCollision(player, enemy) {
        player.takeDamage(enemy.damage);
        
        // 체력 업데이트 이벤트 발생
        this.events.emit('healthUpdate', player.health, player.maxHealth);
        
        // 플레이어 사망 체크
        if (player.health <= 0 && !this.gameOver) {
            this.gameOver = true;
            this.handleGameOver();
        }
    }

    handleSpiritEnemyCollision(spirit, enemy) {
        try {
            this.logDebug('정령-적 충돌 처리 시작');
            
            // 적에게 데미지 주기
            enemy.takeDamage(spirit.damage);
            
            // 효과음 재생
            try {
                this.attackSound.play();
            } catch (error) {
                console.error('공격 효과음 재생 중 오류 발생:', error);
                this.logDebug('공격 효과음 재생 오류: ' + error.message);
            }
            
            // 적 사망 체크
            if (enemy.health <= 0) {
                // 경험치 획득
                this.levelSystem.addExperience(enemy.expValue);
                
                // 아이템 드롭 확률
                if (Phaser.Math.Between(1, 100) <= enemy.dropRate) {
                    this.spawnItem(enemy.x, enemy.y);
                }
                
                // 적 제거
                enemy.destroy();
            }
            
            this.logDebug('정령-적 충돌 처리 완료');
        } catch (error) {
            console.error('정령-적 충돌 처리 중 오류 발생:', error);
            this.logDebug('정령-적 충돌 처리 오류: ' + error.message);
        }
    }

    handlePlayerItemCollision(player, item) {
        try {
            this.logDebug('플레이어-아이템 충돌 처리 시작');
            
            // 아이템 효과 적용
            item.applyEffect(player);
            
            // 아이템 획득 사운드
            this.sound.play('pickup');
            
            // 아이템 제거
            item.destroy();
            
            // 점수 증가
            this.score += 5;
            this.scoreText.setText('점수: ' + this.score);
            
            // 경험치 증가
            if (this.levelSystem) {
                this.levelSystem.addExperience(2);
                this.levelText.setText('레벨: ' + this.levelSystem.level);
            }
            
            this.logDebug('플레이어-아이템 충돌 처리 완료');
        } catch (error) {
            console.error('플레이어-아이템 충돌 처리 중 오류 발생:', error);
            this.logDebug('플레이어-아이템 충돌 처리 오류: ' + error.message);
        }
    }

    spawnItem(x, y) {
        // 아이템 생성
        const item = new Item(this, x, y);
        this.items.add(item);
    }

    handleGameOver() {
        try {
            this.logDebug('게임 오버 처리 시작');
            
            this.gameOver = true;
            
            // 게임 오버 텍스트 표시
            const gameOverText = this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2, '게임 오버', {
                font: '48px Arial',
                fill: '#ff0000'
            }).setOrigin(0.5);
            
            // 메인 메뉴로 돌아가는 버튼
            const menuButton = this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2 + 100, 'button');
            
            // 버튼 텍스트
            this.add.text(menuButton.x, menuButton.y, '메인 메뉴', {
                font: '24px Arial',
                fill: '#ffffff'
            }).setOrigin(0.5);
            
            // 버튼 상호작용 설정
            menuButton.setInteractive();
            
            // 버튼 클릭 이벤트
            menuButton.on('pointerdown', () => {
                this.scene.stop('UIScene');
                this.scene.start('MainMenuScene');
            });
            
            // 효과음 재생
            try {
                this.gameOverSound.play();
            } catch (error) {
                console.error('게임 오버 효과음 재생 중 오류 발생:', error);
                this.logDebug('게임 오버 효과음 재생 오류: ' + error.message);
            }
            
            this.logDebug('게임 오버 처리 완료');
        } catch (error) {
            console.error('게임 오버 처리 중 오류 발생:', error);
            this.logDebug('게임 오버 처리 오류: ' + error.message);
        }
    }

    update(time, delta) {
        if (this.gameOver) return;
        
        // 플레이어 업데이트
        this.player.update(this.cursors);
        
        // 적 스폰
        this.enemySpawner.update(delta);
    }
}

module.exports = { GameScene }; 