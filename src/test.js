console.log('테스트 JavaScript 파일이 로드되었습니다!');

// DOM이 로드된 후 실행
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM이 로드되었습니다!');
    
    // 게임 컨테이너 요소 확인
    const gameContainer = document.getElementById('game-container');
    if (gameContainer) {
        console.log('게임 컨테이너를 찾았습니다:', gameContainer);
        
        // 테스트 메시지 추가
        const testMessage = document.createElement('div');
        testMessage.textContent = '게임 컨테이너가 정상적으로 로드되었습니다!';
        testMessage.style.color = 'green';
        testMessage.style.fontWeight = 'bold';
        testMessage.style.marginTop = '20px';
        gameContainer.appendChild(testMessage);
    } else {
        console.error('게임 컨테이너를 찾을 수 없습니다!');
    }
}); 