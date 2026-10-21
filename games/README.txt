게임 파일 넣는 곳
==================

1. 이 폴더 아래에 게임별 폴더를 만드세요. 예: games/my-game/
2. 다운로드할 파일을 넣으세요. 예: games/my-game/MyGame.zip
3. content/games.json에서 파일 경로를 등록하세요.
   "file": "/games/my-game/MyGame.zip"

주의: file 경로는 /games/로 시작해야 합니다. 큰 파일은 GitHub Releases를 고려하세요.
