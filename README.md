# 한자 게임들

학생 프로젝트를 위한 친근한 게임 소개 사이트입니다. HTML/CSS/JavaScript 중심이며 Vercel Functions와 Vercel Blob을 사용합니다.

## 주요 기능
- 학생 프로젝트 느낌의 밝고 친근한 디자인
- 게임 개발일지와 게임 다운로드 카드
- 선생님 네이버 블로그로 이동
- Vercel Blob에 저장되는 의견 게시판 및 채팅
- 부적절한 표현을 일부 걸러내는 기본 자동 필터
- 게시물 신고 버튼과 신고 기록 저장

## GitHub → Vercel 배포
1. 프로젝트 파일을 GitHub 저장소에 올립니다.
2. Vercel에서 Add New → Project를 선택해 저장소를 가져옵니다.
3. Framework Preset은 Other를 선택합니다. 별도 빌드 명령은 필요하지 않습니다.
4. Vercel Storage에서 Blob Store를 만들고 프로젝트에 연결합니다.
5. Environment Variables에 `BLOB_READ_WRITE_TOKEN`이 있는지 확인하고 Deploy합니다.
6. Vercel Settings → Domains에서 `kudarabanjai.kro.kr`를 추가하고, 표시되는 DNS 설정을 도메인 관리 사이트에 입력합니다.

## 게임 추가
`games/my-game/MyGame.zip` 파일을 추가한 뒤 `content/games.json`에 등록합니다.

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

`file`은 `/games/`로 시작해야 합니다. 큰 게임 파일은 GitHub 저장소에 직접 넣기보다 GitHub Releases를 고려하세요.

## 개발일지 추가
`content/devlogs.json`에 `tag`, `date`, `title`, `description`을 추가하세요. 선택적으로 `url`을 넣어 자세히 보기 링크를 추가할 수 있습니다.

## 부적절한 글 관리에 관한 중요 안내
- 서버에서 일부 욕설/위협 표현과 링크를 필터링합니다. 다만 필터가 모든 부적절한 표현을 알아내지는 못하며, 오탐/누락이 있을 수 있습니다.
- 방문자는 각 게시물의 **신고** 버튼으로 이유를 남길 수 있고, 신고 내용은 Blob의 `community/reports/` 경로에 저장됩니다.
- **신고 접수만으로 해당 글이 자동 삭제되지는 않습니다.** 이 프로젝트에는 아직 운영자 인증 및 안전한 삭제 화면이 없습니다. 실제 공개 전 운영자 전용 삭제 기능을 추가해야 합니다. 공개 데이터 파일을 임의로 삭제하는 관리자 기능을 인증 없이 노출하면 누구나 다른 글을 지울 수 있으므로, 관리자 인증 없이 삭제 API를 만들지 않았습니다.
- 이 사이트는 학생/친구들을 위한 공간이므로 실명, 학교/학급, 전화번호, 주소 등 개인정보를 쓰지 않도록 안내하세요.
- 채팅은 WebSocket이 아니라 약 4초 간격으로 새 메시지를 불러오는 폴링 방식입니다.
- rate limit은 함수 인스턴스별 메모리 기반의 기본 제한이며 강력한 스팸 방지 기능은 아닙니다.

## 로컬 개발
```bash
npm install
npx vercel login
npx vercel link
npx vercel dev
```
Blob Store를 연결하고 로컬 환경에 `BLOB_READ_WRITE_TOKEN`을 설정해야 게시판/채팅이 작동합니다.
