# 테트리스 멀티플레이 서버 배포 가이드 (Render)

게임(HTML/JS)과 WebSocket 멀티 서버를 **한 Node 프로세스**에서 실행합니다.  
배포 후 Render가 `npm start`를 **자동으로** 실행하며, 재시작·재배포 시에도 동일합니다.

---

## 아키텍처

```
브라우저  ──HTTPS/WSS──▶  Render Web Service
                          ├─ HTTP  → index.html, script.js, common/ …
                          └─ WS    → 방 만들기, 매칭, 채팅, BOARD_SYNC …
```

| 항목 | 값 |
|------|-----|
| 진입 스크립트 | `package.json` → `"start": "node server.js"` |
| 포트 | Render가 주는 `process.env.PORT` (로컬 기본 `8765`) |
| 헬스체크 | `GET /health` → `{"ok":true,"service":"tetris-multi"}` |
| Blueprint | 저장소 루트 `render.yaml` |

**Vercel만으로는 WebSocket 상시 실행이 불가**합니다. 멀티플레이는 Render(또는 Railway 등 Node 호스팅)가 필요합니다.

---

## 당신이 할 일 (체크리스트)

배포는 **아래 순서대로** 진행하세요. (Render·GitHub 계정은 본인이 직접 로그인해야 합니다.)

### 1단계 — 로컬에서 동작 확인

```bash
cd "프로젝트 폴더"
npm install
npm start
```

1. 브라우저에서 **http://localhost:8765** 접속
2. **멀티플레이** → 닉네임 입력 → **방 만들기**
3. **시크릿 창** 또는 다른 브라우저에서 같은 URL 접속 → **방 참여** → 게임 시작되는지 확인

문제 없으면 터미널에서 `Ctrl+C`로 서버 종료.

---

### 2단계 — GitHub에 코드 올리기

아직 커밋·푸시하지 않았다면, 프로젝트 폴더에서:

```bash
git add server.js package.json render.yaml ws-config.js ws-config.example.js .gitignore index.html script.js README.md implementation_plan.md SERVER_DEPLOY.md
git status
git commit -m "feat: 통합 서버(HTTP+WS) 및 Render 배포 설정"
git push origin main
```

- 원격 저장소: `https://github.com/KKI147/15.-seminor.git`
- `main` 브랜치에 10차 변경(통합 서버, `render.yaml` 등)이 있어야 Render가 최신 코드를 받습니다.

> **참고:** `node_modules/`는 `.gitignore`에 있으므로 푸시하지 않습니다. Render에서 `npm install`이 실행됩니다.

---

### 3단계 — Render 계정·GitHub 연동

1. [https://render.com](https://render.com) 가입 또는 로그인
2. 대시보드 → **Account Settings** → **GitHub** 연결 (Authorize)
3. 저장소 `KKI147/15.-seminor` 접근 허용

---

### 4단계 — Blueprint로 배포 (권장)

1. Render 대시보드 → **New +** → **Blueprint**
2. **Connect a repository** → `15.-seminor` 선택
3. Render가 `render.yaml`을 읽으면 서비스 **`tetris-extra`** 가 표시됨
4. **Apply** (또는 Deploy Blueprint)
5. 첫 빌드:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
6. 상태가 **Live**가 될 때까지 대기 (무료 플랜은 5~10분 걸릴 수 있음)
7. 상단 URL 복사 (예: `https://tetris-extra-xxxx.onrender.com`)

#### Blueprint 대신 수동 Web Service

| 설정 | 값 |
|------|-----|
| Environment | **Node** |
| Build Command | `npm install` |
| Start Command | `npm start` |
| Health Check Path | `/health` |
| Plan | Free (테스트용) |

---

### 5단계 — 배포 URL로 멀티 테스트

1. Render URL을 브라우저에 입력 (예: `https://tetris-extra-xxxx.onrender.com`)
2. `/health` 접속 시 JSON `ok: true` 확인 (선택)
3. 게임 로비 → **멀티플레이** → 방 만들기 / 다른 탭에서 방 참여
4. 채팅·대전이 되면 배포 완료

**무료 플랜:** 15분 비접속 후 슬립 → 첫 접속 시 30초~1분 정도 느릴 수 있음 (Cold start).

---

### 6단계 — (선택) Vercel에 프론트만 올리는 경우

게임 파일은 Vercel, WS는 Render에 두는 **분리 배포**입니다.

1. Render URL을 메모 (예: `https://tetris-extra.onrender.com`)
2. `ws-config.js` 수정:

```javascript
(function () {
    window.TETRIS_WS_URL = 'wss://tetris-extra-xxxx.onrender.com';
})();
```

3. Vercel에 프로젝트 import → Root Directory: 저장소 루트 → Deploy
4. Vercel URL로 접속해 멀티 테스트

**권장:** 처음에는 Render URL 하나만 쓰는 것이 설정이 가장 단순합니다.

---

## 배포 후 자동 실행이 되는 이유

| 시점 | Render 동작 |
|------|-------------|
| 최초 배포 | `npm install` → `npm start` |
| Git push 후 Auto-Deploy | 동일 |
| 서비스 재시작 | `npm start` |
| 크래시 후 | Render가 프로세스 재기동 |

`server.js`는 `const PORT = parseInt(process.env.PORT, 10) || 8765` 로 호스팅 환경 포트를 사용합니다.

클라이언트(`script.js`)는 페이지와 **같은 호스트**로 WebSocket에 연결합니다 (`wss://배포도메인`).  
별도 포트 설정이 필요 없습니다.

---

## Render 대시보드에서 확인할 항목

- **Logs** 탭: `Tetris server ready`, `Game: http://...` 로그
- **Events**: Deploy succeeded
- **Settings → Health Check Path:** `/health`
- **Settings → Start Command:** `npm start`

---

## 문제 해결

| 증상 | 원인 | 해결 |
|------|------|------|
| 멀티 연결 실패 | `file://`로 HTML 열음 | 반드시 `https://배포URL` 로 접속 |
| 502 / 배포 실패 | `npm install` 실패 | Logs에서 Node 버전·의존성 확인 (`engines.node >= 18`) |
| 첫 접속 매우 느림 | Free tier 슬립 | 잠시 후 새로고침 또는 유료 플랜 |
| WS만 안 됨 | Vercel만 배포 | Render에 `npm start` 서비스 추가 또는 `ws-config.js`에 `wss://` URL 설정 |
| 로컬만 됨 | 코드 미푸시 | `git push origin main` 후 Render **Manual Deploy** |

---

## 관련 파일

| 파일 | 역할 |
|------|------|
| `server.js` | HTTP 정적 파일 + WebSocket |
| `package.json` | `npm start`, Node `engines` |
| `render.yaml` | Render Blueprint 정의 |
| `ws-config.js` | 분리 배포 시 WS URL (기본 빈 문자열 = same origin) |
| `ws-config.example.js` | 분리 배포 예시 |
| `README.md` | 프로젝트 전체 문서 |

---

## 요약 — 최소 4단계

1. 로컬: `npm start` → http://localhost:8765 멀티 확인  
2. Git: 변경사항 `commit` + `push` to `main`  
3. Render: Blueprint → repo `15.-seminor` → Apply  
4. 브라우저: Render URL로 멀티 2탭 테스트  

배포 URL을 받으면 README나 팀 공유용으로 URL만 기록해 두면 됩니다.

---

## 다음에 코드를 수정했을 때

```bash
git add .
git commit -m "fix: ..."
git push origin main
```

Render **Auto-Deploy**가 켜져 있으면 push 후 자동으로 다시 `npm install` → `npm start` 됩니다.
