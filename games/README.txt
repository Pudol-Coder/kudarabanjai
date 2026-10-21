게임 파일 넣는 곳
==================

1. 이 폴더 아래에 게임별 폴더를 만드세요.
   예: games/my-game/

2. 다운로드할 파일을 넣으세요.
   예: games/my-game/MyGame.zip

3. content/games.json을 수정해 등록하세요.
   "title": "내 게임",
   "version": "v1.0",
   "description": "게임 소개",
   "file": "/games/my-game/MyGame.zip",
   "label": "MY FIRST GAME",
   "symbol": "✳"

주의:
- file 경로는 반드시 /games/ 로 시작해야 합니다.
- 경로에 .. 을 넣지 마세요.
- HTML 게임은 ZIP으로 제공하거나, index.html 파일 경로를 등록할 수 있습니다.
- 큰 파일은 GitHub 저장소의 파일 크기 제한에 걸릴 수 있습니다. 큰 게임은 GitHub Releases에 올리고 다운로드 URL을 별도로 지원하도록 코드를 확장하는 편이 좋습니다.
