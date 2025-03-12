class UIScene extends Phaser.Scene {
    constructor() {
        super('UIScene');
    }

    init(data) {
        // 게임 씬에서 데이터 받기
        this.gameScene = this.scene.get('GameScene');
    }

    create() {
        // UI 요소 생성
        this.createUI();
        
        // 게임 씬 이벤트 리스너 설정
        this.setupEventListeners();
    }

    createUI() {
        // 레벨 표시
        this.levelText = this.add.text(20, 20, '레벨: 1', {
            font: '18px Arial',
            fill: '#ffffff'
        });
        
        // 경험치 바
        this.expBarBackground = this.add.rectangle(400, 30, 300, 20, 0x333333);
        this.expBar = this.add.rectangle(400, 30, 0, 16, 0x00ff00);
        this.expBar.setOrigin(0.5, 0.5);
        
        // 체력 표시
        this.healthText = this.add.text(20, 50, '체력: 100/100', {
            font: '18px Arial',
            fill: '#ffffff'
        });
        
        // 체력 바
        this.healthBarBackground = this.add.rectangle(400, 60, 300, 20, 0x333333);
        this.healthBar = this.add.rectangle(400, 60, 300, 16, 0xff0000);
        this.healthBar.setOrigin(0.5, 0.5);
        
        // 시간 표시
        this.timeText = this.add.text(650, 20, '시간: 0:00', {
            font: '18px Arial',
            fill: '#ffffff'
        });
        
        // 정령 정보
        this.spiritText = this.add.text(20, 80, '정령: 없음', {
            font: '18px Arial',
            fill: '#ffffff'
        });
    }

    setupEventListeners() {
        // 레벨업 이벤트
        this.gameScene.events.on('levelUp', (level) => {
            this.levelText.setText(`레벨: ${level}`);
            this.sound.play('levelup');
        });
        
        // 경험치 업데이트 이벤트
        this.gameScene.events.on('expUpdate', (exp, maxExp) => {
            const width = (exp / maxExp) * 300;
            this.expBar.width = width;
        });
        
        // 체력 업데이트 이벤트
        this.gameScene.events.on('healthUpdate', (health, maxHealth) => {
            this.healthText.setText(`체력: ${health}/${maxHealth}`);
            const width = (health / maxHealth) * 300;
            this.healthBar.width = width;
        });
        
        // 시간 업데이트 이벤트
        this.gameScene.events.on('timeUpdate', (time) => {
            const minutes = Math.floor(time / 60);
            const seconds = time % 60;
            this.timeText.setText(`시간: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
        });
        
        // 정령 업데이트 이벤트
        this.gameScene.events.on('spiritUpdate', (spiritName) => {
            this.spiritText.setText(`정령: ${spiritName}`);
        });
    }

    update() {
        // 필요한 경우 UI 업데이트
    }
}

module.exports = { UIScene }; 