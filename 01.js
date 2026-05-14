/**
 * tetris.js — Pixi.js 기반 테트리스 클라이언트 로직
 *
 * 역할 요약:
 * - Pixi Application을 초기화하고 캔버스를 #game-host에 붙인다.
 * - 고정형 보드(10×20), 7가지 테트로미노, 단순 회전/충돌, 라인 삭제, 점수·레벨을 처리한다.
 * - 렌더링은 Graphics로 타일을 그리며, 고스트(낙하 예상 위치)·HUD·게임 오버 오버레이를 표시한다.
 *
 * 주의: pixi.min.js가 먼저 로드되어 전역 PIXI가 있어야 한다 (index.html 순서 참고).
 */

(async () => {
    // ---------------------------------------------------------------------------
    // 레이아웃·그리드 상수
    // ---------------------------------------------------------------------------
    /** 보드 가로 칸 수 (고전 테트리스 표준 10) */
    const COLS = 10;
    /** 보드 세로 칸 수 (표준 플레이 영역 20) */
    const ROWS = 20;
    /** 한 칸의 픽셀 크기 (Pixi 좌표계와 동일) */
    const BLOCK = 30;
    /** 보드 왼쪽·위쪽 여백 (테두리와 HUD와의 간격) */
    const BOARD_PAD = 8;
    /** 보드 오른쪽에 점수 등을 넣기 위한 패널 폭 */
    const SIDE_PANEL = 140;

    const WIDTH = BOARD_PAD * 2 + COLS * BLOCK + SIDE_PANEL;
    const HEIGHT = BOARD_PAD * 2 + ROWS * BLOCK;

    /** CDN UMD 번들이 전역에 두는 Pixi 네임스페이스 */
    const PIXI_NS = globalThis.PIXI;

    // ---------------------------------------------------------------------------
    // Pixi Application 초기화
    // ---------------------------------------------------------------------------
    /** 전체 게임이 그려지는 루트 애플리케이션 (캔버스 1개) */
    const app = new PIXI_NS.Application();
    await app.init({
        width: WIDTH,
        height: HEIGHT,
        backgroundColor: 0x161b22,
        antialias: true,
    });

    const host = document.getElementById("game-host");
    if (!host) {
        console.error("tetris.js: #game-host 요소가 없습니다.");
        return;
    }
    host.appendChild(app.canvas);

    /**
     * stage 바로 아래 단일 컨테이너.
     * 나중에 카메라 이동·스케일을 넣을 때 이 노드만 조작하면 된다.
     */
    const root = new PIXI_NS.Container();
    app.stage.addChild(root);

    // ---------------------------------------------------------------------------
    // 렌더링 레이어 (나중에 그리는 객체가 위에 보임)
    // ---------------------------------------------------------------------------
    /** 고정된 블록 + 보드 테두리 */
    const boardGfx = new PIXI_NS.Graphics();
    root.addChild(boardGfx);

    /** 현재 조작 중인 조각 */
    const pieceGfx = new PIXI_NS.Graphics();
    root.addChild(pieceGfx);

    /** 하드 드롭 위치 미리보기 (반투명) */
    const ghostGfx = new PIXI_NS.Graphics();
    root.addChild(ghostGfx);

    /** 우측 패널: 점수·라인·레벨·낙하 간격 표시 */
    const hudStyle = new PIXI_NS.TextStyle({
        fill: 0xc9d1d9,
        fontFamily: "Segoe UI, system-ui, sans-serif",
        fontSize: 14,
        lineHeight: 20,
    });
    const hud = new PIXI_NS.Text({ text: "", style: hudStyle });
    hud.x = BOARD_PAD + COLS * BLOCK + 16;
    hud.y = BOARD_PAD;
    root.addChild(hud);

    /** 게임 오버 시 보드 중앙 안내 문구 */
    const overlayStyle = new PIXI_NS.TextStyle({
        fill: 0xf0f6fc,
        fontFamily: "Segoe UI, system-ui, sans-serif",
        fontSize: 22,
        fontWeight: "600",
        align: "center",
    });
    const overlay = new PIXI_NS.Text({ text: "", style: overlayStyle });
    overlay.anchor.set(0.5);
    overlay.x = BOARD_PAD + (COLS * BLOCK) / 2;
    overlay.y = BOARD_PAD + (ROWS * BLOCK) / 2;
    overlay.visible = false;
    root.addChild(overlay);

    // ---------------------------------------------------------------------------
    // 테트로미노 정의
    // ---------------------------------------------------------------------------
    /**
     * 각 타입별 블록 색상 (Pixi는 0xRRGGBB 정수).
     * 표준 가이드라인과 비슷하게 배치했으나 구현 단순화를 위해 SRS 공식 팔레트와는 다를 수 있다.
     */
    const COLORS = {
        I: 0x00d9ff,
        O: 0xffea00,
        T: 0xb056ff,
        S: 0x4dff6b,
        Z: 0xff4d4d,
        J: 0x4d88ff,
        L: 0xffa040,
    };

    /**
     * 각 타입의 “기본 모양”을 2차원 배열로 표현.
     * 값 1인 칸만 블록으로 취급한다 (0은 빈 칸).
     * 회전은 rotateCW()로 동적으로 만들며, O는 정사각형이라 회전해도 동일하다.
     */
    const SHAPES = {
        I: [[1, 1, 1, 1]],
        O: [
            [1, 1],
            [1, 1],
        ],
        T: [
            [0, 1, 0],
            [1, 1, 1],
        ],
        S: [
            [0, 1, 1],
            [1, 1, 0],
        ],
        Z: [
            [1, 1, 0],
            [0, 1, 1],
        ],
        J: [
            [1, 0, 0],
            [1, 1, 1],
        ],
        L: [
            [0, 0, 1],
            [1, 1, 1],
        ],
    };

    /**
     * 2차원 행렬을 시계 방향으로 90° 회전한다.
     * 비정방 행렬도 처리 가능하므로 I 조각처럼 가로·세로 길이가 바뀌는 경우에도 그대로 사용한다.
     *
     * @param {number[][]} matrix - 0/1 또는 숫자 채운 2차원 배열
     * @returns {number[][]} 회전된 새 배열 (원본 변경 없음과 동일한 효과를 내려면 호출측에서 대입)
     */
    function rotateCW(matrix) {
        const h = matrix.length;
        const w = matrix[0].length;
        const out = Array.from({ length: w }, () => Array(h).fill(0));
        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                // (x,y) → (y, h-1-x) 매핑의 전개; 시계 방향 90°
                out[x][h - 1 - y] = matrix[y][x];
            }
        }
        return out;
    }

    /**
     * 스폰 시 원본 SHAPES와 참조를 공유하지 않도록 얕은 복사.
     * @param {number[][]} m
     * @returns {number[][]}
     */
    function cloneMatrix(m) {
        return m.map((row) => row.slice());
    }

    // ---------------------------------------------------------------------------
    // 입력 상태 (키를 누르고 있는 동안 true — 연속 이동·소프트 드롭에 사용)
    // ---------------------------------------------------------------------------
    const KEYS = {
        left: false,
        right: false,
        down: false,
    };

    // ---------------------------------------------------------------------------
    // 게임 상태 변수
    // ---------------------------------------------------------------------------
    /**
     * 보드: board[row][col]
     * - null: 빈 칸
     * - 숫자(색상): 고정된 블록
     */
    let board = [];

    /**
     * 현재 떨어지는 조각. 없거나 게임 오버 직후에는 비워질 수 있다.
     * @type {{
     *   type: keyof typeof SHAPES,
     *   shape: number[][],
     *   x: number,
     *   y: number
     * } | null}
     */
    let current = null;

    /** 7-bag 랜덤용 남은 타입 목록 */
    let bag = [];

    let score = 0;
    let linesTotal = 0;
    let level = 1;
    let gameOver = false;

    /**
     * 중력 타이머용 누적(ms).
     * dropInterval마다 한 칸 아래로 시도한다.
     */
    let dropAccum = 0;

    /**
     * DAS(Delayed Auto Shift): 방향키를 누르고 있을 때 첫 이동 후 잠깐 기다렸다가 연속 이동.
     * dasDelay: 첫 입력 후 “추가 이동 금지”로 쓰는 카운트다운(ms). 0이면 즉시 한 칸 이동 허용 상태.
     */
    let dasDelay = 0;

    /** DAS 반복 간격 타이머(ms). 0 이하이면 한 칸 더 이동한다. */
    let dasRepeat = 0;

    /** 레벨 1 기준 자동 낙하 주기(ms). 레벨이 오를수록 간격이 짧아진다. */
    const DROP_MS_BASE = 800;

    /** 아래 키 홀드 시 중력 누적 배율 (2~3배는 800ms 주기에서 체감이 거의 없어 20 근처로 둔다). */
    const SOFT_DROP_MULT = 20;

    /** 빈 보드 2차원 배열 생성 */
    function emptyBoard() {
        return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
    }

    /**
     * Fisher–Yates 셔플. 7-bag에서 같은 패턴 반복을 줄인다.
     * @param {string[]} arr
     */
    function shuffle(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
    }

    /** 가방이 비면 7종을 다시 채워 넣고 섞는다. */
    function refillBag() {
        bag = Object.keys(SHAPES);
        shuffle(bag);
    }

    /** 다음에 나올 테트로미노 타입 한 글자 키(I,O,T,…) */
    function nextType() {
        if (!bag.length) refillBag();
        return bag.pop();
    }

    /**
     * 새 조각을 보드 상단 중앙에 둔다.
     * 스폰 직후 충돌이면 더 이상 놓을 공간이 없으므로 게임 오버 처리한다.
     */
    function spawn() {
        const type = nextType();
        const shape = cloneMatrix(SHAPES[type]);
        current = {
            type,
            shape,
            x: Math.floor((COLS - shape[0].length) / 2),
            y: 0,
        };
        if (!fits(current.shape, current.x, current.y)) {
            gameOver = true;
            overlay.text = "게임 오버\nR로 재시작";
            overlay.visible = true;
        }
    }

    /**
     * shape를 보드 좌표 (px, py)에 놓았을 때 유효한지 검사.
     * - 그리드 밖이면 false
     * - 이미 쌓인 블록과 겹치면 false
     * - 보드 위쪽(gy < 0)은 스폰 직후 일부 타일이 화면 밖에 있을 수 있어 허용
     *
     * @param {number[][]} shape
     * @param {number} px 그리드 X (조각 좌상단 기준)
     * @param {number} py 그리드 Y
     */
    function fits(shape, px, py) {
        for (let y = 0; y < shape.length; y++) {
            for (let x = 0; x < shape[y].length; x++) {
                if (!shape[y][x]) continue;
                const gx = px + x;
                const gy = py + y;
                if (gx < 0 || gx >= COLS || gy >= ROWS) return false;
                if (gy >= 0 && board[gy][gx]) return false;
            }
        }
        return true;
    }

    /** 현재 조각을 보드에 색을 채워 고정한다 (라인 클리어 전 단계). */
    function merge() {
        const { shape, x: px, y: py, type } = current;
        const color = COLORS[type];
        for (let y = 0; y < shape.length; y++) {
            for (let x = 0; x < shape[y].length; x++) {
                if (!shape[y][x]) continue;
                const gy = py + y;
                const gx = px + x;
                if (gy >= 0) board[gy][gx] = color;
            }
        }
    }

    /**
     * 가득 찬 가로 줄을 제거하고 위 블록을 내린다.
     * 점수는 단순화된 가이드라인식 배수(1~4줄) × 레벨.
     */
    function clearLines() {
        let cleared = 0;
        for (let y = ROWS - 1; y >= 0;) {
            if (board[y].every((c) => c !== null)) {
                board.splice(y, 1);
                board.unshift(Array(COLS).fill(null));
                cleared++;
            } else {
                y--;
            }
        }
        if (cleared > 0) {
            linesTotal += cleared;
            const mult = [0, 100, 300, 500, 800];
            score += (mult[cleared] || 800) * level;
            level = 1 + Math.floor(linesTotal / 10);
        }
    }

    /**
     * 충돌하지 않고 내릴 수 있는 최대 칸 수(고스트·하드 드롭에 공통 사용).
     * @returns {number} 추가로 더할 수 있는 y 오프셋
     */
    function hardDropY() {
        let dy = 0;
        while (fits(current.shape, current.x, current.y + dy + 1)) dy++;
        return dy;
    }

    /** 고정 → 줄 삭제 → 다음 조각 스폰 순으로 한 사이클 처리 */
    function lockAndSpawn() {
        merge();
        clearLines();
        spawn();
    }

    /**
     * 시계 방향 회전을 시도하고, 벽에 걸리면 좌우로 소폭 밀어 넣는 단순 월 킥.
     * (공식 SRS 테이블은 아니며 구현 복잡도와의 타협이다.)
     */
    function tryRotate() {
        const rotated = rotateCW(current.shape);
        const kicks = [0, -1, 1, -2, 2];
        for (const k of kicks) {
            if (fits(rotated, current.x + k, current.y)) {
                current.shape = rotated;
                current.x += k;
                return;
            }
        }
    }

    /** 고정 블록과 보드 외곽선을 그린다. */
    function drawBoard() {
        boardGfx.clear();
        boardGfx.roundRect(
            BOARD_PAD - 2,
            BOARD_PAD - 2,
            COLS * BLOCK + 4,
            ROWS * BLOCK + 4,
            4
        );
        boardGfx.stroke({ width: 2, color: 0x30363d });

        for (let y = 0; y < ROWS; y++) {
            for (let x = 0; x < COLS; x++) {
                const c = board[y][x];
                if (!c) continue;
                drawCell(boardGfx, BOARD_PAD + x * BLOCK, BOARD_PAD + y * BLOCK, c, 1);
            }
        }
    }

    /**
     * 단일 타일을 그림: 바깥 라운드 사각형 + 안쪽 하이라이트로 입체감.
     * @param {object} g Pixi Graphics 인스턴스
     * @param {number} px 픽셀 X
     * @param {number} py 픽셀 Y
     * @param {number} color fill 색
     * @param {number} alpha 전체 알파 (고스트에 낮게 사용)
     */
    function drawCell(g, px, py, color, alpha) {
        g.roundRect(px + 1, py + 1, BLOCK - 2, BLOCK - 2, 4);
        g.fill({ color, alpha });
        g.roundRect(px + 4, py + 4, BLOCK - 14, BLOCK - 14, 2);
        g.fill({ color: 0xffffff, alpha: alpha * 0.18 });
    }

    /**
     * 조각 전체를 하나의 Graphics에 그린다. 호출 전에 보통 g.clear()가 필요해 piece/ghost 전용으로 둔다.
     */
    function drawPiece(g, shape, px, py, color, alpha) {
        g.clear();
        for (let y = 0; y < shape.length; y++) {
            for (let x = 0; x < shape[y].length; x++) {
                if (!shape[y][x]) continue;
                const gx = BOARD_PAD + (px + x) * BLOCK;
                const gy = BOARD_PAD + (py + y) * BLOCK;
                drawCell(g, gx, gy, color, alpha);
            }
        }
    }

    /** 바닥까지 떨어졌을 때 위치를 반투명으로 표시해 판단을 돕는다. */
    function drawGhost() {
        if (!current || gameOver) {
            ghostGfx.clear();
            return;
        }
        const drop = hardDropY();
        const color = COLORS[current.type];
        drawPiece(ghostGfx, current.shape, current.x, current.y + drop, color, 0.22);
    }

    /** 플레이어가 움직이는 조각을 그린다. */
    function drawActive() {
        if (!current || gameOver) {
            pieceGfx.clear();
            return;
        }
        const color = COLORS[current.type];
        drawPiece(pieceGfx, current.shape, current.x, current.y, color, 1);
    }

    /** 우측 텍스트 HUD 내용 갱신 */
    function updateHud() {
        hud.text =
            `점수  ${score}\n` +
            `라인  ${linesTotal}\n` +
            `레벨  ${level}\n\n` +
            `낙하 주기\n${Math.max(80, Math.floor(DROP_MS_BASE / level))} ms`;
    }

    /** 한 프레임에 필요한 모든 그리기 순서를 묶는다. */
    function redraw() {
        drawBoard();
        drawGhost();
        drawActive();
        updateHud();
    }

    /** 상태 초기화 후 새 게임 시작 */
    function resetGame() {
        board = emptyBoard();
        score = 0;
        linesTotal = 0;
        level = 1;
        gameOver = false;
        dropAccum = 0;
        dasDelay = 0;
        dasRepeat = 0;
        bag = [];
        overlay.visible = false;
        spawn();
        redraw();
    }

    /**
     * 고정 프레임이 아닌 실제 경과 시간(deltaMS) 기준 업데이트.
     * - 중력: dropAccum으로 누적 후 일정 간격마다 한 칸 하강 시도
     * - 소프트 드롭: 아래 키를 누르면 중력 누적 속도를 높임 (별도 점수 보상은 없음)
     * - DAS: 좌우 키 홀드 시 첫 이동 후 짧은 간격으로 반복 이동
     *
     * @param {number} deltaMS 이전 틱 이후 경과 밀리초 (상한 100ms로 스파이크 완화)
     */
    function tickLocked(deltaMS) {
        if (gameOver || !current) return;

        const dropInterval = Math.max(80, DROP_MS_BASE / level);

        if (KEYS.down) {
            dropAccum += deltaMS * SOFT_DROP_MULT;
        } else {
            dropAccum += deltaMS;
        }

        while (dropAccum >= dropInterval) {
            dropAccum -= dropInterval;
            if (fits(current.shape, current.x, current.y + 1)) {
                current.y++;
            } else {
                lockAndSpawn();
                break;
            }
        }

        const repeatMs = 35;
        const initialDas = 170;

        /**
         * 좌우 한 칸 이동 시도 (충돌 시 무시).
         * @param {number} dx -1 또는 1
         */
        function tryMove(dx) {
            if (!current || gameOver) return;
            if (fits(current.shape, current.x + dx, current.y)) {
                current.x += dx;
            }
        }

        if (KEYS.left && !KEYS.right) {
            if (dasDelay === 0) {
                tryMove(-1);
                dasDelay = initialDas;
                dasRepeat = 0;
            } else {
                dasDelay -= deltaMS;
                if (dasDelay <= 0) {
                    dasRepeat -= deltaMS;
                    if (dasRepeat <= 0) {
                        tryMove(-1);
                        dasRepeat = repeatMs;
                    }
                }
            }
        } else if (KEYS.right && !KEYS.left) {
            if (dasDelay === 0) {
                tryMove(1);
                dasDelay = initialDas;
                dasRepeat = 0;
            } else {
                dasDelay -= deltaMS;
                if (dasDelay <= 0) {
                    dasRepeat -= deltaMS;
                    if (dasRepeat <= 0) {
                        tryMove(1);
                        dasRepeat = repeatMs;
                    }
                }
            }
        } else {
            // 양쪽 동시 입력이거나 둘 다 떼었을 때 DAS 타이머 리셋
            dasDelay = 0;
            dasRepeat = 0;
        }

        redraw();
    }

    // ---------------------------------------------------------------------------
    // 키보드 입력
    // ---------------------------------------------------------------------------
    window.addEventListener("keydown", (e) => {
        if (e.code === "ArrowLeft") {
            KEYS.left = true;
            e.preventDefault();
        }
        if (e.code === "ArrowRight") {
            KEYS.right = true;
            e.preventDefault();
        }
        if (e.code === "ArrowDown") {
            KEYS.down = true;
            e.preventDefault();
        }
        if (gameOver) {
            if (e.code === "KeyR") resetGame();
            return;
        }
        if (!current) return;

        if (e.code === "ArrowUp" || e.code === "KeyZ") {
            tryRotate();
            redraw();
            e.preventDefault();
        }
        if (e.code === "Space") {
            const dy = hardDropY();
            current.y += dy;
            score += dy * 2;
            lockAndSpawn();
            redraw();
            e.preventDefault();
        }
    });

    window.addEventListener("keyup", (e) => {
        if (e.code === "ArrowLeft") KEYS.left = false;
        if (e.code === "ArrowRight") KEYS.right = false;
        if (e.code === "ArrowDown") KEYS.down = false;
    });

    // ---------------------------------------------------------------------------
    // 메인 루프: Pixi ticker마다 경과 시간을 재어 tickLocked에 넘긴다.
    // ---------------------------------------------------------------------------
    let last = performance.now();
    app.ticker.add(() => {
        const now = performance.now();
        const delta = Math.min(now - last, 100);
        last = now;
        tickLocked(delta);
    });

    resetGame();
})();