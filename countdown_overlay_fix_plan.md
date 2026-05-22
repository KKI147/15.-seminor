# 카운트다운 오버레이 범위 및 텍스트 표시 수정 계획

## 문제 진단

### 1) 오버레이가 화면 전체를 덮는 이유

- `index.html`: `#countdown-overlay`가 `#wrap` 밖, `body` 직속에 있음
- `style.css`: `.fixed-overlay`가 `position: fixed` + `100vw`/`100vh`로 뷰포트 전체를 덮음
- 로비(`#lobby-overlay`)는 `#game-container` 안의 `.game-overlay`(absolute, 100%)로 캔버스 프레임만 덮음
- `popscale.js` + `responsive.js`는 `#wrap`에만 `transform: scale(...)` 적용 → 카운트다운 좌표계 불일치

### 2) 카운트다운 / START 텍스트가 안 보이는 이유 (핵심)

`script.js` `runCountdown()`에서 `.countdown-text`에 `pop` 클래스를 추가하는데, `common/css/common.css`의 `.pop`이 `display: none`을 지정함.

```css
/* common.css */
.pop {
    display: none;
    ...
}
```

`style.css`의 `.countdown-text.pop`은 `display`를 덮어쓰지 않아 텍스트가 숨겨짐.

---

## 개선 방향

로비 오버레이와 동일하게 `#game-container` 내부 절대 위치 오버레이로 통일하고, 애니메이션 클래스명을 `countdown-pop`으로 변경.

---

## 구현 단계

### Step 1 — HTML

- `body` 직속 `#countdown-overlay` 삭제
- `#game-container` 내부에 `#countdown-overlay` 추가 (`class="game-overlay hidden"`)
- `fixed-overlay` → `game-overlay`

### Step 2 — CSS

- `.fixed-overlay`, `.fixed-overlay.hidden` 제거
- `#countdown-overlay { z-index: 110; }`
- `.countdown-text.pop` → `.countdown-text.countdown-pop`
- `display: block` 명시

### Step 3 — JS

- `runCountdown()` 내 `pop` → `countdown-pop`

### Step 4 — 검증

1. 로비만 표시
2. 게임 시작 → 캔버스 영역만 덮고 3-2-1-START 텍스트 표시
3. 카운트다운 후 게임 RUNNING
4. Lobby 버튼으로 복귀
5. VS CPU 모드에서 2배 캔버스 오버레이 확인

---

## 수정 파일

| 파일 | 변경 |
|------|------|
| `index.html` | 오버레이 DOM 이동 |
| `style.css` | fixed-overlay 제거, countdown-pop |
| `script.js` | 클래스명 변경 |

`common` 폴더는 수정하지 않음.
