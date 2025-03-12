# 정령 키우기 게임

AI로 개발한 뱀파이어 서바이벌 스타일의 정령 키우기 게임입니다. 플레이어가 정령을 수집하고 강화하며 끊임없이 몰려오는 적들을 물리치는 게임입니다.

## 게임 특징

- **정령 수집 및 육성**: 다양한 정령을 수집하고 강화하여 전투력을 높일 수 있습니다.
- **자동 전투**: 정령들이 자동으로 적을 공격합니다.
- **레벨 시스템**: 경험치를 모아 레벨업하고 다양한 능력을 강화할 수 있습니다.
- **아이템 시스템**: 적을 처치하면 드롭되는 아이템을 통해 다양한 효과를 얻을 수 있습니다.
- **난이도 증가**: 시간이 지날수록 더 강한 적이 등장합니다.

## 조작 방법

- **방향키**: 플레이어 이동
- **마우스**: UI 조작 및 레벨업 보상 선택

## 설치 및 실행 방법

1. 저장소를 클론합니다.
   ```
   git clone https://github.com/ncaco/phaser_project.git
   ```

2. 프로젝트 폴더로 이동합니다.
   ```
   cd phaser_project
   ```

3. 의존성을 설치합니다.
   ```
   npm install
   ```

4. 개발 서버를 실행합니다.
   ```
   npm start
   ```

5. 웹 브라우저에서 `http://localhost:8080`으로 접속하여 게임을 플레이합니다.

## 기술 스택

- **Phaser 3**: HTML5 게임 프레임워크
- **JavaScript (ES6+)**: 게임 로직 구현
- **HTML5 & CSS3**: 게임 UI 및 스타일링
- **Webpack**: 모듈 번들러

## 프로젝트 구조

```
phaser_project/
├── index.html              # 메인 HTML 파일
├── package.json            # 프로젝트 의존성 관리
├── webpack.config.js       # Webpack 설정 파일
├── assets/                 # 게임 리소스
│   ├── images/             # 이미지 파일
│   ├── spritesheets/       # 스프라이트시트 파일
│   └── audio/              # 오디오 파일
├── src/                    # 소스 코드
│   ├── entities/           # 게임 엔티티 클래스
│   │   ├── Player.js       # 플레이어 클래스
│   │   ├── Spirit.js       # 정령 클래스
│   │   ├── Enemy.js        # 적 클래스
│   │   └── Item.js         # 아이템 클래스
│   ├── scenes/             # 게임 씬 클래스
│   │   ├── BootScene.js    # 부팅 씬
│   │   ├── PreloadScene.js # 리소스 로드 씬
│   │   ├── MainMenuScene.js# 메인 메뉴 씬
│   │   ├── GameScene.js    # 게임 플레이 씬
│   │   └── UIScene.js      # UI 씬
│   ├── systems/            # 게임 시스템 클래스
│   │   ├── EnemySpawner.js # 적 스포너 시스템
│   │   └── LevelSystem.js  # 레벨 시스템
│   ├── Game.js             # 게임 설정 클래스
│   └── main.js             # 게임 진입점
└── README.md               # 프로젝트 설명
```

## 라이선스

MIT 라이선스
