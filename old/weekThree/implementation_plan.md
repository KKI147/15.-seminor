# 테트리스 기능 확장 및 멀티플레이 구현 계획

기존 테트리스 게임에 3가지 게임 모드(Solo, VS CPU, WebSocket 기반 Multi)를 도입하고, 시작 전 카운트다운 및 NEXT 프리뷰 숨김 기능을 추가하며, TETR.IO 기반의 공격/상쇄/가비지 큐 및 UI 게이지 시스템을 적용하여 완성도 높은 대전 테트리스를 구현하기 위한 개발 계획입니다.

> [!IMPORTANT]
> **JavaScript 개발 규칙 준수**
> - 화살표 함수(`=>`) 사용 금지, 기존 `function` 문법 사용.
> - `var` 사용 금지, `const` 및 `let` 사용.
> - DOM 조작 및 이벤트 처리는 jQuery 사용.
> - 인터넷 익스플로러(IE)를 포함한 레거시 브라우저 호환성 고려.

---

## 📌 기능 우선순위 및 로드맵

### 1단계: P1 - UX 개선 (NEXT 프리뷰 제어 & 카운트다운 모달) [완료]
* **NEXT 프리뷰 제어**: 게임이 실행 중(`isRunning = true`)일 때만 NEXT 블록들을 표시.
* **카운트다운 모달**: `3 -> 2 -> 1 -> START!` 후 게임 활성화. 오버레이는 `#game-container` 내부.

### 2단계: P2 - 모드 선택 및 닉네임 입력 UI [완료]
* **모드 선택 모달**: Solo / VS CPU / Multi.
* **닉네임 및 방 코드 입력**: 멀티플레이 UI.

### 3단계: P3 - VS CPU 모드 (컴퓨터 AI 대결) [완료]
* **2인 화면 분할**, El-Tetris AI, CPU 렌더링 루프 (800ms 틱).

### 4단계: P4 - 공격 및 상쇄 시스템 [완료]
* 공격력 테이블, B2B, 콤보, 가비지 큐, 상쇄, 주입, 가비지 미터.

### 5단계: P5 - WebSocket 기반 멀티플레이 [1차 완료 — 2026-05-22]
* [x] `server.js` (Node.js + `ws`, 포트 8765)
* [x] `CREATE_ROOM` / `JOIN_ROOM` / `MATCH_START` / `LEAVE_ROOM`
* [x] `BOARD_SYNC` / `ATTACK` / `GAME_OVER` / `OPPONENT_DISCONNECTED`
* [x] 클라이언트: 매칭 → 카운트다운 → 게임, P2 보드 렌더, 결과판
* [ ] 재접속, active piece 동기화 (2차)

### 6단계: P6 - 배포·멀티 UX [배포 1차 완료 — 2026-05-22]
* [x] `server.js` HTTP 정적 서빙 + WebSocket 동일 포트 (`process.env.PORT`)
* [x] `npm start` 로컬·Render 자동 기동 (`render.yaml`, `/health`)
* [x] `ws-config.js` — Vercel+Render 분리 시 WS URL 설정
* [x] [`SERVER_DEPLOY.md`](SERVER_DEPLOY.md) — Render 배포 절차 문서
* [ ] 재접속, active piece 동기화, 서버 URL 설정 UI

---

## 🧪 검증 계획

### 멀티플레이 (8차 추가)
1. 터미널에서 `npm start` 실행 후 `http://localhost:8765` 접속.
2. 브라우저 2개(또는 탭 2개)에서 Multi → 방 만들기 / 방 참여.
3. `MATCH_START` 후 카운트다운·양쪽 플레이 가능 확인.
4. 한쪽 라인 제거 시 상대 가비지 미터·주입 확인.
5. 한쪽 top-out 시 `GAME_OVER` → 상대 `YOU WIN` 결과판 확인.

### VS CPU (기존)
1. 공격·상쇄·가비지 주입·미터 동작 확인.

---

## 변경 파일 (8차)

| 파일 | 변경 |
|------|------|
| `server.js` | NEW — WebSocket 서버 |
| `package.json` | NEW — ws 의존성 |
| `script.js` | 멀티 클라이언트, 동기화, 공격 |
| `index.html` | 서버 실행 안내 문구 |
| `style.css` | `.multi-server-hint` |
| `README.md` | P5 완료 및 프로토콜 문서화 |
