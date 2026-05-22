# 테트리스 UI 개편 · 기능 확장

## 개요

PixiJS 7 기반 테트리스. 좌측 HOLD·통계, 중앙 보드, 우측 NEXT 레이아웃을 적용했고,  
Solo / VS CPU / **WebSocket Multi** 3가지 모드와 대전용 공격·가비지 시스템을 지원합니다.

---

## 구현 현황 요약

| 구분 | 상태 |
|------|------|
| 기본 UI·게임플레이 | ✅ 구현 완료 |
| 카운트다운·로비·대전 결과판 | ✅ 구현 완료 |
| VS CPU (AI·2분할·공격) | ✅ 구현 완료 |
| WebSocket 멀티플레이 (P5) | ✅ 1차 구현 완료 |
| 멀티 채팅 (P5-1) | ✅ 구현 완료 |
| 채팅 UI·전송 버그 수정 | ✅ 구현 완료 (9차-2 ~ 9차-5) |
| 멀티 UX 보완 (끊김·재접속 등) | ⏳ 일부 미구현 |

---

## 멀티플레이 서버 실행 (로컬)

```bash
npm install
npm start
```

- 브라우저에서 **`http://localhost:8765`** 로 접속 (게임 + WebSocket 동일 포트)
- **멀티플레이** → 방 만들기 / 방 참여
- 두 탭이 같은 URL을 쓰면 `MATCH_START` 후 카운트다운·게임 시작
- `index.html`을 `file://`로 직접 열면 WS만 `ws://localhost:8765` 로 연결 시도 → **`npm start` 후 http 접속 권장**
- 프로토콜 변경 후: `Ctrl+C` → `npm start` 재실행

---

## 배포 (WebSocket 자동 실행)

게임 + WebSocket을 **Render 한 서비스**에 올리는 방식을 권장합니다.  
**단계별 절차·체크리스트·문제 해결**은 [`SERVER_DEPLOY.md`](SERVER_DEPLOY.md) 를 참고하세요.

| 파일 | 설명 |
|------|------|
| [`SERVER_DEPLOY.md`](SERVER_DEPLOY.md) | **배포 가이드 (필독)** |
| `render.yaml` | Render Blueprint (`npm start` 자동 실행) |
| `ws-config.js` | Vercel+Render 분리 시에만 `wss://` URL 설정 |

---

## ✅ 구현 완료

### 기본 UI · 레이아웃
- [x] 좌측 HOLD 고정 흰색 박스 + 블록 미리보기
- [x] 우측 NEXT 패널 (최대 5개, 7-bag `peekNext` / `ensureBagSize`)
- [x] 게임 보드 10×20, 흰색 테두리, 그리드
- [x] 고스트 피스(낙하 예상 위치) 표시
- [x] 좌측 패널 통계: **PIECES**, **LINES** (/40), **TIME**
- [x] 키보드 조작: 이동, 회전, 소프트/하드 드롭, 홀드(Shift / C)
- [x] 7-bag 조각 순서 (플레이어·CPU 각각 독립 bag)

### 게임 모드 · UX
- [x] **Solo** — 단일 보드 플레이, 게임오버 시 `GAME OVER` 상태
- [x] **VS CPU** — 캔버스 가로 2배 분할, 좌 플레이어 / 우 CPU 보드
- [x] 로비 오버레이: 모드 선택(Solo / VS CPU / Multi)
- [x] 게임 시작 시 **로비 패널(`lobby-content`) 즉시 숨김** → 카운트다운 → 플레이 시작
- [x] 카운트다운 `3 → 2 → 1 → START!` (**`#game-container` 영역만** 오버레이)
- [x] VS CPU / Multi 대전 종료 시 **YOU WIN / YOU LOSE** 결과판 + 점수 + 로비 복귀

### VS CPU · AI
- [x] CPU 독립 보드·HOLD·NEXT·통계 렌더링
- [x] El-Tetris 휴리스틱 AI, CPU 틱 **800ms**

### 대전 공격 · 가비지
- [x] 공격력·B2B·콤보·가비지 큐·상쇄·주입·가비지 미터
- [x] VS CPU 로컬 공격 루프
- [x] 멀티 `ATTACK` WebSocket 송수신 → 상대 `p1GarbageQueue` 반영

### P5 — WebSocket 멀티플레이 (8차)
- [x] `server.js` + `package.json` (`ws`, 포트 8765)
- [x] `CREATE_ROOM` / `JOIN_ROOM` / `MATCH_START` / `LEAVE_ROOM`
- [x] `BOARD_SYNC` — lock-down 시 보드·점수·라인 전송, 우측(P2) 보드 렌더
- [x] `ATTACK` — `sendMultiplayerAttack()` 연동
- [x] `GAME_OVER` / `OPPONENT_DISCONNECTED` — 승패 결과판 연동
- [x] 매칭 대기 → `MATCH_START` → `startGame()` 카운트다운 플로우
- [x] 멀티 결과판 상대 닉네임 표시

### P5-1 — 멀티플레이 채팅 (9차)
- [x] 매칭 대기·게임 중 채팅 패널 (`#multi-chat-panel`)
- [x] `CHAT` / `CHAT_ACK` 프로토콜
- [x] 시스템 메시지 (방 생성, 입장, 게임 시작, 연결 끊김, 상대 없을 때 안내)
- [x] 전송 버튼 + Enter, 최대 80자
- [x] 채팅 입력 포커스 시 테트리스 키 무시
- [x] 채팅 패널 **드래그 이동** (헤더, `localStorage` 키 `tetrisChatPos`)
- [x] 채팅 패널 **4모서리 리사이즈** (200~480 × 180~560px, 위치·크기 저장)

### 인프라 · 연동
- [x] `initTetris()` + `contentScript` switch 연동
- [x] jQuery DOM, `function` 문법, IE 호환 고려 구조

---

## 🔧 버그 수정 · 개선 이력 (상세)

### 7차 — 카운트다운 오버레이

| 문제 | 원인 | 수정 |
|------|------|------|
| 카운트다운이 **화면 전체**를 덮음 | `#countdown-overlay`가 `body` + `position:fixed` + `100vw/vh` | `#game-container` 내부로 이동, `.game-overlay` (absolute 100%) |
| `3·2·1·START` **텍스트 안 보임** | `script.js`가 `.pop` 클래스 추가 → `common.css` `.pop { display:none }` 충돌 | 애니메이션 클래스를 `countdown-pop`으로 변경, `display:block` 명시 |
| popscale과 좌표 불일치 | 카운트다운이 `#wrap` 스케일 밖에 있음 | 게임 컨테이너 내부 배치로 캔버스와 동일 영역 |

- 상세 계획: [`countdown_overlay_fix_plan.md`](countdown_overlay_fix_plan.md)

### 7차 — 로비 · 대전 결과

| 항목 | 수정 |
|------|------|
| 게임 시작 버튼 | 클릭 시 `$(".lobby-content").hide()` — 로비 UI 즉시 숨김 |
| VS CPU / Multi 게임오버 | `handleVersusEnd()` → `#result-overlay` YOU WIN / YOU LOSE |
| Lobby 버튼 | 결과판 숨김 + 로비 복귀 |

### 9차-2 — 채팅 수신 · 패널 배치

| 문제 | 원인 | 수정 |
|------|------|------|
| **상대 채팅이 안 보임** | 패널이 `#wrap` 안 → `overflow:hidden`에 가려짐 | 패널을 **`body` 직속** + `position:fixed` + `z-index:10050` |
| 닉네임 필터 | (초기) 수신 로직 불완전 | 서버 `CHAT` 수신 시 상대 메시지 항상 `appendChatMessage` |
| 상대 입장 전 전송 | 방에 1명만 있을 때 | 서버 `CHAT_ACK { delivered:false, reason:'no_peer' }` + 시스템 안내 |

### 9차-3 — 채팅 패널 리사이즈

- 네 모서리 핸들 (`.multi-chat-resize-nw/ne/sw/se`)
- 드래그로 너비·높이 조절, `tetrisChatPos`에 `width`/`height` 함께 저장
- 메시지 영역 `flex:1` + `overflow-y:auto`로 높이에 맞게 확장

### 9차-4 — Enter 이중 전송 (영문·완성 한글)

| 문제 | 원인 | 수정 |
|------|------|------|
| 메시지 **두 번** 전송 | `document` keydown Enter + `#multi-chat-input` keydown Enter **동시 처리** | document에서는 채팅 포커스 시 `return`만, **input에서만** Enter 전송 |
| 연속 전송 방어 | — | 전송 직후 `input.val("")` 먼저 비우기 |

### 9차-6 / 9차-7 — 멀티 방 만들기 · 방 참여 UX

| 역할 | 동작 |
|------|------|
| **방 만든 사람** | [방 만들기]만 사용 → 대기 문구 표시 (참여 버튼 효과 없음) |
| **참가자** | 멀티 선택 시 `LOBBY_WATCH`로 대기 → 방 생성 시 `ROOM_WAITING` 수신 → **[방 참여]** 깜빡임 |
| **방 코드** | UI에서 제거 (서버는 자동 매칭, `JOIN_ROOM` 코드 생략 시 대기 방 입장) |
| **텍스트 색** | 대기·안내 문구 `#c9d1d9` / `#8b949e` 등 밝은 색으로 수정 |

### 9차-5 — 한글 자음·모음 Enter 이중 전송 (IME)

| 문제 | 원인 | 수정 |
|------|------|------|
| `ㄱ`, `ㅏ` 등 **단일 자모**만 두 번 전송 | 한글 IME 조합 중 Enter → `keydown`이 조합 확정·전송으로 **연속 발생** | Enter **전송을 `keyup`으로만** 처리 |
| 조합 중 오전송 | `isComposing` / `keyCode 229` | `compositionstart`/`compositionend` + 조합 중 전송 차단 |
| 동일 문장 연속 | 짧은 간격 이중 이벤트 | `chatEnterSubmitLock` + `sendChatMessage` 400ms 동일 텍스트 debounce |

**현재 Enter 전송 흐름**

1. `keydown` Enter → `preventDefault`만 (전송 안 함), 조합 중이면 무시  
2. `keyup` Enter → 조합 끝났을 때만 `sendChatMessage()`  
3. `sendChatMessage` → 동일 텍스트 400ms 이내 재전송 차단  

---

## WebSocket 프로토콜 (클라이언트 ↔ 서버)

| type | 방향 | 설명 |
|------|------|------|
| `CREATE_ROOM` | C→S | 방 생성 + 닉네임 |
| `ROOM_CREATED` | S→C | 5자리 방 코드 반환 |
| `JOIN_ROOM` | C→S | 방 코드 + 닉네임으로 참여 |
| `JOIN_OK` | S→C | 참여 성공 |
| `OPPONENT_JOINED` | S→호스트 | 상대 입장 알림 |
| `MATCH_START` | S→양쪽 | 게임 시작 (hostNick, guestNick) |
| `BOARD_SYNC` | C→S→상대 | board[][], score, lines |
| `ATTACK` | C→S→상대 | 가비지 라인 수 |
| `GAME_OVER` | C→S→상대 | 패배 알림 → 상대 승리 처리 |
| `LEAVE_ROOM` | C→S | 방 퇴장 |
| `OPPONENT_DISCONNECTED` | S→C | 상대 연결 종료 |
| `CHAT` | C→S→상대 | nickname, text (최대 80자, 공백 정규화) |
| `CHAT_ACK` | S→C | 전송 결과 (`delivered`, `reason: no_peer` 등) |
| `LOBBY_WATCH` | C→S | 참가자 대기 등록 (방 생성 알림 수신) |
| `ROOM_WAITING` | S→C | 대기 중인 방 있음 (참가자에게 [방 참여] 유도) |
| `ROOM_CLOSED` | S→C | 대기 방 없음 (참가자 버튼 비활성) |
| `ERROR` | S→C | 오류 메시지 |

---

## 채팅 패널 UI 요약

| 기능 | 구현 |
|------|------|
| 위치 | `body` 고정 (`position: fixed`) |
| 이동 | 헤더 드래그 (마우스·터치) |
| 크기 | nw / ne / sw / se 모서리 드래그 |
| 저장 | `localStorage` → `tetrisChatPos` `{ left, top, width, height }` |
| 기본 크기 | 260 × 320px (min 200×180, max 480×560) |

---

## ⏳ 앞으로 구현할 항목 (TODO)

### 멀티 · UX 보완
- [ ] 연결 끊김 후 재접속·방 복구
- [ ] 상대 활성 피스(active piece) 실시간 동기화
- [ ] 상대 HOLD / NEXT 미리보기 동기화
- [x] 통합 서버 (`npm start` — 게임·WS 동일 포트) + Render 자동 기동 (`render.yaml`)
- [ ] 멀티 전용 서버 URL 설정 UI (현재 `ws-config.js` 수동 설정)

### 게임플레이 · 밸런스
- [ ] CPU AI 틱 600ms vs 800ms 난이도 옵션
- [ ] 가비지 주입 후 top-out 판정 강화 검증

### 문서 · 품질
- [ ] VS CPU / 멀티 / 가비지 수동 테스트 체크리스트 실행 기록

### 선택 (개선)
- [ ] 카운트다운·결과 애니메이션 강화
- [ ] 사운드 효과
- [ ] 모바일·터치 조작

---

## 변경 파일

| 파일 | 설명 |
|------|------|
| `index.html` | 로비, 카운트다운, 결과판, 채팅 패널·리사이즈 핸들, 멀티 서버 안내 |
| `style.css` | 게임·로비·결과판·채팅(고정·드래그·리사이즈) 스타일 |
| `script.js` | 게임·AI·공격·멀티 WS·채팅(IME·중복전송 방지) |
| `server.js` | WebSocket 서버 (방·동기화·CHAT·CHAT_ACK) |
| `package.json` | `ws` 의존성, `npm run server` |
| `README.md` | 기획·구현·수정 이력 문서 |
| `implementation_plan.md` | 단계별 로드맵 |
| `countdown_overlay_fix_plan.md` | 카운트다운 오버레이 수정 계획 |

---

## 구현 이력 (타임라인)

| 날짜 | 회차 | 요약 |
|------|------|------|
| 2026-05-22 | 1~5차 | UI 레이아웃, HOLD/NEXT, 통계, 고정 박스 |
| 2026-05-22 | 6차 | 로비 3모드, 카운트다운, VS CPU AI, 공격/가비지, 결과판 |
| 2026-05-22 | 7차 | 카운트다운 캔버스 영역·`countdown-pop`, 로비 숨김, VS 승패 결과판 |
| 2026-05-22 | 8차 | P5 WebSocket 멀티 (`server.js`, 매칭, 보드/공격 동기화) |
| 2026-05-22 | 9차 | 멀티 채팅 (`CHAT`, 패널 UI, 시스템 메시지) |
| 2026-05-22 | 9차-2 | 채팅 `body` 고정, 상대 메시지 수신, `CHAT_ACK` |
| 2026-05-22 | 9차-3 | 채팅 4모서리 리사이즈 + layout 저장 |
| 2026-05-22 | 9차-4 | Enter 이중 핸들러 제거 (document/input) |
| 2026-05-22 | 9차-5 | 한글 IME Enter 중복 수정 (keyup·composition·debounce) |
| 2026-05-22 | 9차-6 | 멀티 방 만들기 후 [방 참여] 깜빡임 유도 (초기) |
| 2026-05-22 | 9차-7 | 방 코드 UI 제거, 방장/참가자 역할 분리, `ROOM_WAITING`·자동 매칭 |
| 2026-05-22 | 10차 | 통합 서버(HTTP+WS), `process.env.PORT`, Render Blueprint, `ws-config.js` |

---

## 관련 문서

- 서버 배포: [`SERVER_DEPLOY.md`](SERVER_DEPLOY.md)
- 상세 로드맵: [`implementation_plan.md`](implementation_plan.md)
- 카운트다운 수정 계획: [`countdown_overlay_fix_plan.md`](countdown_overlay_fix_plan.md)
