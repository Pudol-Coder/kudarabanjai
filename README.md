# kudarabanjai.kro.kr

화이트 스타일의 개인 게임 개발자 웹사이트입니다. HTML/CSS/JavaScript 중심이며 Vercel Functions와 Vercel Blob을 사용합니다.

## 기능

- 반응형 메인 페이지
- 개발일지: `content/devlogs.json` 수정
- 게임 다운로드 카드: `content/games.json` 수정
- 네이버 블로그 이동
- 의견 게시판
- 4초 간격으로 갱신되는 채팅
- 메시지 저장: Vercel Blob

## GitHub → Vercel 배포

1. 이 프로젝트를 GitHub 저장소에 업로드합니다.
2. Vercel에서 **Add New → Project**를 선택하고 해당 저장소를 가져옵니다.
3. Framework Preset은 **Other**를 선택합니다. Build Command는 비워 두어도 됩니다.
4. Vercel 프로젝트의 **Storage**에서 Blob Store를 생성하고 프로젝트에 연결합니다.
5. 프로젝트 Settings → Environment Variables에서 `BLOB_READ_WRITE_TOKEN`이 등록되어 있는지 확인합니다. Blob을 프로젝트에 연결하면 보통 자동으로 설정됩니다.
6. Deploy를 실행합니다.
7. Settings → Domains에서 `kudarabanjai.kro.kr`를 추가하고, Vercel이 표시하는 DNS 레코드를 도메인 업체의 DNS 설정에 입력합니다.

## 게임 파일 추가

예를 들어 `games/my-game/MyGame.zip`을 추가한 뒤 `content/games.json`에 다음 항목을 넣습니다.

```json
[
  {
    "title": "내 게임",
    "version": "v1.0",
    "description": "직접 만든 게임입니다.",
    "file": "/games/my-game/MyGame.zip",
    "label": "MY GAME",
    "symbol": "✳"
  }
]
```

JSON 문법을 지켜야 합니다. 항목을 여러 개 등록하려면 객체 사이에 쉼표를 넣으세요. 변경 사항을 GitHub에 push하면 Vercel이 자동으로 다시 배포합니다.

## 개발일지 추가

`content/devlogs.json`에 객체를 추가합니다.

```json
[
  {
    "tag": "UPDATE",
    "date": "2026.10.21",
    "title": "첫 번째 업데이트",
    "description": "새로운 기능을 추가했습니다.",
    "url": "https://example.com"
  }
]
```

`url`은 선택 항목입니다.

## 의견/채팅 저장 방식과 한계

- 각 메시지를 Vercel Blob에 별도 JSON 파일로 저장합니다.
- 채팅은 WebSocket이 아닌 **4초 간격 폴링**으로 새 메시지를 확인합니다. 소규모 방문자용으로 단순화한 방식입니다.
- 이 구현의 요청 제한은 서버 인스턴스별 메모리 기반의 최선 노력(best-effort) 제한입니다. 인스턴스가 재시작되거나 여러 인스턴스로 분산되면 제한이 완전하게 적용되지 않을 수 있습니다.
- Blob은 데이터베이스가 아닙니다. 메시지 양이 많아지면 목록 조회 비용과 응답 시간이 증가할 수 있습니다. 규모가 커지면 지속성 있는 데이터베이스/공유 rate limiter를 고려하세요.
- 이 예제에는 운영자용 메시지 삭제 UI가 없습니다. 공개 게시판을 실제 공개하기 전에 신고/삭제, 스팸 방지, 운영 정책을 추가하는 것을 권장합니다.
- Blob 파일은 `public` 접근으로 저장됩니다. 민감한 개인정보를 입력하지 말라는 안내를 유지하세요. 관리자 비밀번호나 비밀 토큰을 프런트엔드에 넣지 마세요.

## 로컬 실행

Node.js가 설치된 상태에서:

```bash
npm install
npx vercel login
npx vercel link
npx vercel dev
```

Blob Store를 연결해 `BLOB_READ_WRITE_TOKEN`이 로컬 환경에도 설정되어 있어야 게시판/채팅 저장 기능이 작동합니다.

## 프로젝트 구조

```text
.
├── index.html
├── style.css
├── script.js
├── api/
│   └── messages.js
├── content/
│   ├── devlogs.json
│   └── games.json
├── games/
├── package.json
└── vercel.json
```
