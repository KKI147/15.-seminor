function contentScript(_idx, _page) {
    if (typeof (videoCon) !== 'undefined') { videoCon.stop(); }
    if (typeof (resetPopIn) !== 'undefined') { resetPopIn(); }
    if (typeof (resetContentsIn) !== 'undefined') { resetContentsIn(); }

    switch (contentsIdx) {
        case 0:
            initTetris();
            break;
    }
}

/**
 * index.html용 PixiJS 7 테트리스 (03.js 로직 기반)
 * - 01.js 스타일: 라운드 블록 + 하이라이트, 낙하 위치 고스트
 * - 홀드: Shift 또는 C (한 번 잠금 전 1회만 교환)
 * - 조각 순서: 순수 난수가 아니라 7-bag(7종을 한 번씩 섞어 제공)으로 체감 편향·연속 출현을 줄임
 */
function initTetris() {
    const COLS = 10;
    const ROWS = 20;
    const BLOCK = 30;
    const DROP_INTERVAL = 650;
    const SOFT_DROP_MS = 45;
    const SCORE_PER_LINE = 100;
    const HOLD_PANEL = 5 * BLOCK + 24;
    const NEXT_PANEL = 5 * BLOCK + 24;
    const NEXT_COUNT = 5;
    const BOARD_PAD = 8;
    const PANEL_GAP = 12;               // 패널과 게임판 사이 간격
    const GHOST_ALPHA = 0.25;

    // HOLD 박스 고정 크기
    const HOLD_BOX_W = HOLD_PANEL - 16;
    const HOLD_BOX_H = 3 * BLOCK;
    const HOLD_BOX_Y = 24;              // HOLD 라벨 아래
    // NEXT 박스 고정 크기
    const NEXT_BOX_Y = 24;

    const COLORS = [
        0x000000,
        0x00d9ff,
        0x4dff6b,
        0xff4d4d,
        0x4d88ff,
        0xffa040,
        0xffea00,
        0xb056ff,
        0x7f8c8d, // 회색 (가비지 블록용)
    ];

    const SHAPES = [
        [[1, 1, 1, 1]],
        [[0, 2, 2], [2, 2, 0]],
        [[3, 3, 0], [0, 3, 3]],
        [[4, 0, 0], [4, 4, 4]],
        [[0, 0, 5], [5, 5, 5]],
        [[6, 6], [6, 6]],
        [[0, 7, 0], [7, 7, 7]],
    ];

    const appW = HOLD_PANEL + PANEL_GAP + BOARD_PAD * 2 + COLS * BLOCK + PANEL_GAP + NEXT_PANEL;
    const appH = BOARD_PAD * 2 + ROWS * BLOCK;

    const app = new PIXI.Application({
        width: appW,
        height: appH,
        backgroundColor: 0x161b22,
        antialias: true,
        resolution: window.devicePixelRatio || 1,
    });

    const host = document.getElementById("game-container");
    if (!host) return;
    host.style.width = appW + "px";
    host.style.height = appH + "px";
    app.view.style.position = "relative";
    app.view.style.zIndex = "1";
    host.insertBefore(app.view, host.firstChild);

    const stage = app.stage;
    stage.sortableChildren = true;

    const boardOriginX = HOLD_PANEL + PANEL_GAP + BOARD_PAD;
    const boardOriginY = BOARD_PAD;

    const panelGfx = new PIXI.Graphics();
    panelGfx.zIndex = 0;
    stage.addChild(panelGfx);

    const borderGfx = new PIXI.Graphics();
    borderGfx.zIndex = 1;
    stage.addChild(borderGfx);

    const boardGfx = new PIXI.Graphics();
    boardGfx.zIndex = 2;
    stage.addChild(boardGfx);

    const gridGfx = new PIXI.Graphics();
    gridGfx.zIndex = 3;
    stage.addChild(gridGfx);

    const ghostGfx = new PIXI.Graphics();
    ghostGfx.zIndex = 4;
    stage.addChild(ghostGfx);

    const activeGfx = new PIXI.Graphics();
    activeGfx.zIndex = 5;
    stage.addChild(activeGfx);

    const garbageGfx = new PIXI.Graphics();
    garbageGfx.zIndex = 10;
    stage.addChild(garbageGfx);

    // 좌측 패널 Graphics (HOLD 박스 + 통계)
    const holdGfx = new PIXI.Graphics();
    holdGfx.zIndex = 6;
    stage.addChild(holdGfx);

    // 우측 패널 Graphics (NEXT 박스 + 블록)
    const nextGfx = new PIXI.Graphics();
    nextGfx.zIndex = 8;
    stage.addChild(nextGfx);

    // --- 텍스트 스타일 ---
    const labelStyle = new PIXI.TextStyle({
        fill: 0xffffff,
        fontFamily: "Segoe UI, system-ui, sans-serif",
        fontSize: 11,
        fontWeight: "700",
        letterSpacing: 2,
    });
    const statLargeStyle = new PIXI.TextStyle({
        fill: 0xffffff,
        fontFamily: "Segoe UI, system-ui, sans-serif",
        fontSize: 22,
        fontWeight: "700",
    });
    const statSmallStyle = new PIXI.TextStyle({
        fill: 0xaaaaaa,
        fontFamily: "Segoe UI, system-ui, sans-serif",
        fontSize: 12,
        fontWeight: "400",
    });

    // HOLD 라벨
    const holdLabel = new PIXI.Text("HOLD", labelStyle);
    holdLabel.x = 8;
    holdLabel.y = 8;
    holdLabel.zIndex = 7;
    stage.addChild(holdLabel);

    // NEXT 라벨
    const nextPanelX = HOLD_PANEL + PANEL_GAP + BOARD_PAD * 2 + COLS * BLOCK + PANEL_GAP;
    const nextLabel = new PIXI.Text("NEXT", labelStyle);
    nextLabel.x = nextPanelX + 8;
    nextLabel.y = 8;
    nextLabel.zIndex = 9;
    stage.addChild(nextLabel);

    // --- 통계 텍스트 (PIECES / LINES / TIME) ---
    const statStartY = HOLD_BOX_Y + HOLD_BOX_H + 20;  // HOLD 박스 아래

    const piecesCaption = new PIXI.Text("PIECES", labelStyle);
    piecesCaption.x = 8;
    piecesCaption.y = statStartY;
    piecesCaption.zIndex = 7;
    stage.addChild(piecesCaption);

    const piecesValueTx = new PIXI.Text("0", statLargeStyle);
    piecesValueTx.x = 8;
    piecesValueTx.y = statStartY + 14;
    piecesValueTx.zIndex = 7;
    stage.addChild(piecesValueTx);

    const piecesRateTx = new PIXI.Text("0.00/S", statSmallStyle);
    piecesRateTx.x = 8;
    piecesRateTx.y = statStartY + 38;
    piecesRateTx.zIndex = 7;
    stage.addChild(piecesRateTx);

    const linesCaption = new PIXI.Text("LINES", labelStyle);
    linesCaption.x = 8;
    linesCaption.y = statStartY + 60;
    linesCaption.zIndex = 7;
    stage.addChild(linesCaption);

    const linesValueTx = new PIXI.Text("0", statLargeStyle);
    linesValueTx.x = 8;
    linesValueTx.y = statStartY + 74;
    linesValueTx.zIndex = 7;
    stage.addChild(linesValueTx);

    const linesSuffixTx = new PIXI.Text("/40", statSmallStyle);
    linesSuffixTx.zIndex = 7;
    stage.addChild(linesSuffixTx);

    const timeCaption = new PIXI.Text("TIME", labelStyle);
    timeCaption.x = 8;
    timeCaption.y = statStartY + 108;
    timeCaption.zIndex = 7;
    stage.addChild(timeCaption);

    const timeTx = new PIXI.Text("0:00.000", statLargeStyle);
    timeTx.x = 8;
    timeTx.y = statStartY + 122;
    timeTx.zIndex = 7;
    stage.addChild(timeTx);

    // --- 플레이어 2 (CPU/상대)용 그래픽스 및 텍스트 ---
    const singleAppW = appW;
    const p2Elements = [];

    const p2PanelGfx = new PIXI.Graphics();
    p2PanelGfx.zIndex = 0;
    stage.addChild(p2PanelGfx);
    p2Elements.push(p2PanelGfx);

    const p2BorderGfx = new PIXI.Graphics();
    p2BorderGfx.zIndex = 1;
    stage.addChild(p2BorderGfx);
    p2Elements.push(p2BorderGfx);

    const p2BoardGfx = new PIXI.Graphics();
    p2BoardGfx.zIndex = 2;
    stage.addChild(p2BoardGfx);
    p2Elements.push(p2BoardGfx);

    const p2GridGfx = new PIXI.Graphics();
    p2GridGfx.zIndex = 3;
    stage.addChild(p2GridGfx);
    p2Elements.push(p2GridGfx);

    const p2GhostGfx = new PIXI.Graphics();
    p2GhostGfx.zIndex = 4;
    stage.addChild(p2GhostGfx);
    p2Elements.push(p2GhostGfx);

    const p2ActiveGfx = new PIXI.Graphics();
    p2ActiveGfx.zIndex = 5;
    stage.addChild(p2ActiveGfx);
    p2Elements.push(p2ActiveGfx);

    const p2GarbageGfx = new PIXI.Graphics();
    p2GarbageGfx.zIndex = 10;
    stage.addChild(p2GarbageGfx);
    p2Elements.push(p2GarbageGfx);

    const p2HoldGfx = new PIXI.Graphics();
    p2HoldGfx.zIndex = 6;
    stage.addChild(p2HoldGfx);
    p2Elements.push(p2HoldGfx);

    const p2NextGfx = new PIXI.Graphics();
    p2NextGfx.zIndex = 8;
    stage.addChild(p2NextGfx);
    p2Elements.push(p2NextGfx);

    // 플레이어 2 라벨들
    const p2HoldLabel = new PIXI.Text("HOLD", labelStyle);
    p2HoldLabel.x = singleAppW + 8;
    p2HoldLabel.y = 8;
    p2HoldLabel.zIndex = 7;
    stage.addChild(p2HoldLabel);
    p2Elements.push(p2HoldLabel);

    const p2NextLabel = new PIXI.Text("NEXT", labelStyle);
    p2NextLabel.x = singleAppW + nextPanelX + 8;
    p2NextLabel.y = 8;
    p2NextLabel.zIndex = 9;
    stage.addChild(p2NextLabel);
    p2Elements.push(p2NextLabel);

    // 플레이어 2 통계 텍스트
    const p2PiecesCaption = new PIXI.Text("PIECES", labelStyle);
    p2PiecesCaption.x = singleAppW + 8;
    p2PiecesCaption.y = statStartY;
    p2PiecesCaption.zIndex = 7;
    stage.addChild(p2PiecesCaption);
    p2Elements.push(p2PiecesCaption);

    const p2PiecesValueTx = new PIXI.Text("0", statLargeStyle);
    p2PiecesValueTx.x = singleAppW + 8;
    p2PiecesValueTx.y = statStartY + 14;
    p2PiecesValueTx.zIndex = 7;
    stage.addChild(p2PiecesValueTx);
    p2Elements.push(p2PiecesValueTx);

    const p2PiecesRateTx = new PIXI.Text("0.00/S", statSmallStyle);
    p2PiecesRateTx.x = singleAppW + 8;
    p2PiecesRateTx.y = statStartY + 38;
    p2PiecesRateTx.zIndex = 7;
    stage.addChild(p2PiecesRateTx);
    p2Elements.push(p2PiecesRateTx);

    const p2LinesCaption = new PIXI.Text("LINES", labelStyle);
    p2LinesCaption.x = singleAppW + 8;
    p2LinesCaption.y = statStartY + 60;
    p2LinesCaption.zIndex = 7;
    stage.addChild(p2LinesCaption);
    p2Elements.push(p2LinesCaption);

    const p2LinesValueTx = new PIXI.Text("0", statLargeStyle);
    p2LinesValueTx.x = singleAppW + 8;
    p2LinesValueTx.y = statStartY + 74;
    p2LinesValueTx.zIndex = 7;
    stage.addChild(p2LinesValueTx);
    p2Elements.push(p2LinesValueTx);

    const p2LinesSuffixTx = new PIXI.Text("/40", statSmallStyle);
    p2LinesSuffixTx.zIndex = 7;
    stage.addChild(p2LinesSuffixTx);
    p2Elements.push(p2LinesSuffixTx);

    const p2TimeCaption = new PIXI.Text("OPPONENT", labelStyle);
    p2TimeCaption.x = singleAppW + 8;
    p2TimeCaption.y = statStartY + 108;
    p2TimeCaption.zIndex = 7;
    stage.addChild(p2TimeCaption);
    p2Elements.push(p2TimeCaption);

    const p2TimeTx = new PIXI.Text("AI CPU", statLargeStyle);
    p2TimeTx.x = singleAppW + 8;
    p2TimeTx.y = statStartY + 122;
    p2TimeTx.zIndex = 7;
    stage.addChild(p2TimeTx);
    p2Elements.push(p2TimeTx);

    function setP2Visible(visible) {
        for (let i = 0; i < p2Elements.length; i++) {
            p2Elements[i].visible = visible;
        }
    }
    setP2Visible(false);

    let board = createBoard();
    let current = null;
    let hold = null;
    let canHold = true;
    let isRunning = false;
    let isGameOver = false;
    let score = 0;
    let dropElapsed = 0;
    let dropMs = DROP_INTERVAL;
    let piecesCount = 0;    // 놓은 블록 수
    let totalLines = 0;     // 제거한 라인 수
    let gameMs = 0;         // 게임 진행 시간 (ms)
    let countdownTimeout = null; // 카운트다운 타이머 변수
    let gameMode = "solo";       // 게임 모드: "solo" | "cpu" | "multi"
    let versusEnded = false;     // CPU/멀티 대전 종료 여부
    let userNickname = "";       // 사용자 닉네임
    let roomCode = "";           // 방 코드
    let opponentNickname = "";   // 멀티 상대 닉네임
    let multiSocket = null;      // WebSocket 연결
    let multiRole = "";          // "host" | "guest"
    const MULTI_WS_PORT = 8765;
    const CHAT_MAX_LEN = 80;
    const CHAT_MAX_LINES = 50;
    const CHAT_MIN_W = 200;
    const CHAT_MIN_H = 180;
    const CHAT_MAX_W = 480;
    const CHAT_MAX_H = 560;
    const CHAT_SEND_DEBOUNCE_MS = 400;
    let chatImeComposing = false;
    let chatEnterSubmitLock = false;
    let lastChatSentText = "";
    let lastChatSentAt = 0;
    let multiRoomReady = false;
    let multiIsHostCreator = false;
    let p1Combo = 0;             // P1 콤보 수
    let p1B2b = false;           // P1 B2B 상태
    let p1GarbageQueue = 0;      // P1 가비지 큐 라인 수

    // CPU용 게임 상태 변수
    let cpuBoard = createBoard();
    let cpuCurrent = null;
    let cpuHold = null;
    let cpuCanHold = true;
    let cpuIsGameOver = false;
    let cpuPiecesCount = 0;
    let cpuTotalLines = 0;
    let cpuScore = 0;
    let cpuDropElapsed = 0;
    let cpuDropMs = DROP_INTERVAL;
    let cpuCombo = 0;            // CPU 콤보 수
    let cpuB2b = false;          // CPU B2B 상태
    let cpuGarbageQueue = 0;     // CPU 가비지 큐 라인 수

    /** 7-bag: 0..6 타입을 한 바퀴씩 무작위 순서로 소비, 비면 다시 채움 */
    let bag = [];

    function shuffle(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const t = arr[i];
            arr[i] = arr[j];
            arr[j] = t;
        }
    }

    function refillBag() {
        bag = [];
        for (let k = 0; k < SHAPES.length; k++) bag.push(k);
        shuffle(bag);
    }

    function nextTypeFromBag() {
        if (!bag.length) refillBag();
        return bag.pop();
    }

    /** bag에 최소 n개가 있도록 보충 (peek용) */
    function ensureBagSize(n) {
        while (bag.length < n) {
            const extra = [];
            for (let k = 0; k < SHAPES.length; k++) extra.push(k);
            shuffle(extra);
            for (let k = 0; k < extra.length; k++) bag.unshift(extra[k]);
        }
    }

    /** bag를 소비하지 않고 앞으로 나올 타입을 count개 반환 */
    function peekNext(count) {
        ensureBagSize(count);
        const result = [];
        for (let i = bag.length - 1; i >= bag.length - count; i--) {
            result.push(bag[i]);
        }
        return result;
    }

    /** CPU용 7-bag 상태 및 함수들 */
    let cpuBag = [];

    function cpuRefillBag() {
        cpuBag = [];
        for (let k = 0; k < SHAPES.length; k++) cpuBag.push(k);
        shuffle(cpuBag);
    }

    function cpuNextTypeFromBag() {
        if (!cpuBag.length) cpuRefillBag();
        return cpuBag.pop();
    }

    function cpuEnsureBagSize(n) {
        while (cpuBag.length < n) {
            const extra = [];
            for (let k = 0; k < SHAPES.length; k++) extra.push(k);
            shuffle(extra);
            for (let k = 0; k < extra.length; k++) cpuBag.unshift(extra[k]);
        }
    }

    function cpuPeekNext(count) {
        cpuEnsureBagSize(count);
        const result = [];
        for (let i = cpuBag.length - 1; i >= cpuBag.length - count; i--) {
            result.push(cpuBag[i]);
        }
        return result;
    }

    function createBoard() {
        const matrix = [];
        for (let y = 0; y < ROWS; y++) {
            const row = [];
            for (let x = 0; x < COLS; x++) row.push(0);
            matrix.push(row);
        }
        return matrix;
    }

    function resetBoard() {
        for (let y = 0; y < ROWS; y++) {
            for (let x = 0; x < COLS; x++) {
                board[y][x] = 0;
                cpuBoard[y][x] = 0;
            }
        }
    }

    function cloneMatrix(matrix) {
        const cloned = [];
        for (let y = 0; y < matrix.length; y++) cloned.push(matrix[y].slice());
        return cloned;
    }

    function rotateMatrixClockwise(matrix) {
        const h = matrix.length;
        const w = matrix[0].length;
        const rotated = [];
        for (let x = 0; x < w; x++) {
            const row = [];
            for (let y = h - 1; y >= 0; y--) row.push(matrix[y][x]);
            rotated.push(row);
        }
        return rotated;
    }

    // --- CPU Tetris AI Heuristics ---

    // 보드 상태 평가 지표 계산
    function evaluateBoard(matrix) {
        const heights = [];
        for (let i = 0; i < COLS; i++) heights.push(0);
        let holes = 0;
        let aggregateHeight = 0;

        for (let x = 0; x < COLS; x++) {
            let foundTop = false;
            for (let y = 0; y < ROWS; y++) {
                if (matrix[y][x] !== 0) {
                    if (!foundTop) {
                        heights[x] = ROWS - y;
                        foundTop = true;
                    }
                } else {
                    if (foundTop) {
                        holes++;
                    }
                }
            }
            aggregateHeight += heights[x];
        }

        let bumpiness = 0;
        for (let x = 0; x < COLS - 1; x++) {
            bumpiness += Math.abs(heights[x] - heights[x + 1]);
        }

        let linesCleared = 0;
        for (let y = 0; y < ROWS; y++) {
            let filled = true;
            for (let x = 0; x < COLS; x++) {
                if (matrix[y][x] === 0) {
                    filled = false;
                    break;
                }
            }
            if (filled) {
                linesCleared++;
            }
        }

        // 오리지널 엘테트리스 가중치 매개변수 적용
        const a = 0.51; // 높이 가중치
        const b = 0.76; // 구멍 개수 가중치
        const c = 0.18; // 평평도 가중치
        const d = 0.76; // 라인 제거 가중치

        // 구멍은 게임오버 위험을 크게 높이므로 가중치 보강
        const score = (d * linesCleared * 10) - (a * aggregateHeight) - (b * holes * 5) - (c * bumpiness);
        return score;
    }

    // 단일 블록의 최적의 착지 좌표 및 회전 값 탐색
    function findBestMoveForPiece(targetBoard, piece) {
        let bestScore = -999999;
        let bestX = 0;
        let bestRot = 0;

        let tempShape = cloneMatrix(piece.shape);
        for (let rot = 0; rot < 4; rot++) {
            if (rot > 0) {
                tempShape = rotateMatrixClockwise(tempShape);
            }

            const minX = -3;
            const maxX = COLS;

            for (let x = minX; x <= maxX; x++) {
                const testPiece = { x: x, y: 0, shape: tempShape, type: piece.type };
                if (collidesEx(targetBoard, testPiece, 0, 0)) {
                    continue;
                }

                let dy = 0;
                while (!collidesEx(targetBoard, testPiece, 0, dy + 1)) {
                    dy++;
                }

                const simBoard = cloneMatrix(targetBoard);
                let outOfBounds = false;

                for (let py = 0; py < tempShape.length; py++) {
                    for (let px = 0; px < tempShape[py].length; px++) {
                        const val = tempShape[py][px];
                        if (val === 0) continue;
                        const boardY = testPiece.y + py + dy;
                        const boardX = testPiece.x + px;
                        if (boardY >= 0 && boardY < ROWS && boardX >= 0 && boardX < COLS) {
                            simBoard[boardY][boardX] = val;
                        } else if (boardY < 0) {
                            outOfBounds = true;
                        }
                    }
                }

                if (outOfBounds) continue;

                const score = evaluateBoard(simBoard);
                if (score > bestScore) {
                    bestScore = score;
                    bestX = x;
                    bestRot = rot;
                }
            }
        }

        return { score: bestScore, x: bestX, rot: bestRot };
    }

    // 현재 블록과 홀드 블록 중 최종적으로 가장 좋은 경로를 선택
    function getBestMove(targetBoard, piece, holdPiece, allowHold) {
        let bestScore = -999999;
        let bestX = 0;
        let bestRot = 0;
        let useHold = false;

        const normalBest = findBestMoveForPiece(targetBoard, piece);
        if (normalBest.score > bestScore) {
            bestScore = normalBest.score;
            bestX = normalBest.x;
            bestRot = normalBest.rot;
            useHold = false;
        }

        if (allowHold) {
            let testHoldPiece = null;
            if (holdPiece) {
                testHoldPiece = spawnFromShape(holdPiece.shape, holdPiece.type);
            } else {
                const nextTypes = cpuPeekNext(1);
                if (nextTypes.length > 0) {
                    const nextType = nextTypes[0];
                    testHoldPiece = spawnFromShape(SHAPES[nextType], nextType);
                }
            }

            if (testHoldPiece) {
                const holdBest = findBestMoveForPiece(targetBoard, testHoldPiece);
                if (holdBest.score > bestScore + 12) {
                    bestScore = holdBest.score;
                    bestX = holdBest.x;
                    bestRot = holdBest.rot;
                    useHold = true;
                }
            }
        }

        return { x: bestX, rot: bestRot, useHold: useHold };
    }

    function collides(piece, dx, dy, testShape) {
        return collidesEx(board, piece, dx, dy, testShape);
    }
    function spawnPiece() {
        spawnPieceEx(false);
    }
    function hardDrop() {
        hardDropEx(false);
    }
    function move(dx) {
        moveEx(false, dx);
    }
    function rotate() {
        rotateEx(false);
    }
    function softDropStep() {
        softDropStepEx(false);
    }
    function ghostDy() {
        if (!current) return 0;
        let dy = 0;
        while (!collidesEx(board, current, 0, dy + 1)) {
            dy++;
        }
        return dy;
    }

    function collidesEx(targetBoard, piece, dx, dy, testShape) {
        const shape = testShape || piece.shape;
        for (let y = 0; y < shape.length; y++) {
            for (let x = 0; x < shape[y].length; x++) {
                if (shape[y][x] === 0) continue;
                const nx = piece.x + x + dx;
                const ny = piece.y + y + dy;
                if (nx < 0 || nx >= COLS || ny >= ROWS) return true;
                if (ny >= 0 && targetBoard[ny][nx] !== 0) return true;
            }
        }
        return false;
    }

    function mergePieceEx(targetBoard, piece) {
        for (let y = 0; y < piece.shape.length; y++) {
            for (let x = 0; x < piece.shape[y].length; x++) {
                const value = piece.shape[y][x];
                if (value === 0) continue;
                const by = piece.y + y;
                const bx = piece.x + x;
                if (by >= 0 && by < ROWS && bx >= 0 && bx < COLS) targetBoard[by][bx] = value;
            }
        }
    }

    function clearLinesEx(targetBoard, isCpu) {
        let lines = 0;
        for (let y = ROWS - 1; y >= 0; y--) {
            let filled = true;
            for (let x = 0; x < COLS; x++) {
                if (targetBoard[y][x] === 0) {
                    filled = false;
                    break;
                }
            }
            if (filled) {
                targetBoard.splice(y, 1);
                targetBoard.unshift(Array(COLS).fill(0));
                lines++;
                y++;
            }
        }
        if (lines > 0) {
            if (!isCpu) {
                score += lines * SCORE_PER_LINE;
                totalLines += lines;
                $("#score").text(score);
            } else {
                cpuScore += lines * SCORE_PER_LINE;
                cpuTotalLines += lines;
            }
        }
        return lines;
    }

    function calcAttackStrength(lines, isCpu) {
        if (lines <= 0) return 0;
        let base = 0;
        if (lines === 1) base = 0;
        else if (lines === 2) base = 1;
        else if (lines === 3) base = 2;
        else if (lines === 4) base = 4;

        let isB2B = isCpu ? cpuB2b : p1B2b;
        let b2bBonus = 0;
        if (lines === 4 && isB2B) {
            b2bBonus = 1;
        }

        let combo = isCpu ? cpuCombo : p1Combo;
        let comboBonus = 0;
        let actualCombo = combo - 1;
        if (actualCombo >= 2 && actualCombo <= 3) {
            comboBonus = 1;
        } else if (actualCombo >= 4 && actualCombo <= 5) {
            comboBonus = 2;
        } else if (actualCombo >= 6 && actualCombo <= 7) {
            comboBonus = 3;
        } else if (actualCombo >= 8) {
            comboBonus = 4;
        }

        return base + b2bBonus + comboBonus;
    }

    function sendAttackEx(senderIsCpu, attackStrength) {
        if (attackStrength <= 0) return;

        if (senderIsCpu) {
            if (cpuGarbageQueue > 0) {
                if (cpuGarbageQueue >= attackStrength) {
                    cpuGarbageQueue -= attackStrength;
                    attackStrength = 0;
                } else {
                    attackStrength -= cpuGarbageQueue;
                    cpuGarbageQueue = 0;
                }
            }
            if (attackStrength > 0) {
                if (gameMode === "cpu") {
                    p1GarbageQueue += attackStrength;
                } else if (gameMode === "multi") {
                    sendMultiplayerAttack(attackStrength);
                }
            }
        } else {
            if (p1GarbageQueue > 0) {
                if (p1GarbageQueue >= attackStrength) {
                    p1GarbageQueue -= attackStrength;
                    attackStrength = 0;
                } else {
                    attackStrength -= p1GarbageQueue;
                    p1GarbageQueue = 0;
                }
            }
            if (attackStrength > 0) {
                if (gameMode === "cpu") {
                    cpuGarbageQueue += attackStrength;
                } else if (gameMode === "multi") {
                    sendMultiplayerAttack(attackStrength);
                }
            }
        }
    }

    function getMultiWsUrl() {
        if (typeof window.TETRIS_WS_URL === "string" && window.TETRIS_WS_URL.length > 0) {
            return window.TETRIS_WS_URL;
        }
        if (window.location.protocol === "file:") {
            return "ws://localhost:" + MULTI_WS_PORT;
        }
        let protocol = "ws:";
        if (window.location.protocol === "https:") {
            protocol = "wss:";
        }
        return protocol + "//" + window.location.host;
    }

    function sendMultiMessage(payload) {
        if (!multiSocket || multiSocket.readyState !== WebSocket.OPEN) {
            return;
        }
        multiSocket.send(JSON.stringify(payload));
    }

    function escapeChatHtml(text) {
        return String(text)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    }

    function clampChatNum(value, minVal, maxVal) {
        if (value < minVal) {
            return minVal;
        }
        if (value > maxVal) {
            return maxVal;
        }
        return value;
    }

    function restoreChatPanelLayout() {
        let panel = $("#multi-chat-panel");
        let saved = null;
        try {
            saved = JSON.parse(localStorage.getItem("tetrisChatPos") || "null");
        } catch (e) {
            saved = null;
        }
        if (!saved) {
            return;
        }
        if (saved.left != null && saved.top != null) {
            panel.css({
                left: saved.left + "px",
                top: saved.top + "px",
                right: "auto",
                bottom: "auto"
            });
        }
        if (saved.width != null && saved.height != null) {
            panel.css({
                width: clampChatNum(saved.width, CHAT_MIN_W, CHAT_MAX_W) + "px",
                height: clampChatNum(saved.height, CHAT_MIN_H, CHAT_MAX_H) + "px"
            });
        }
    }

    function saveChatPanelLayout() {
        let panel = $("#multi-chat-panel");
        let off = panel.offset();
        try {
            localStorage.setItem("tetrisChatPos", JSON.stringify({
                left: Math.round(off.left),
                top: Math.round(off.top),
                width: Math.round(panel.outerWidth()),
                height: Math.round(panel.outerHeight())
            }));
        } catch (e) {
            /* localStorage unavailable */
        }
    }

    function showChatPanel() {
        restoreChatPanelLayout();
        $("#multi-chat-panel").removeClass("hidden");
    }

    function hideChatPanel() {
        $("#multi-chat-panel").addClass("hidden");
    }

    function clearChatLog() {
        $("#multi-chat-messages").empty();
    }

    function appendChatMessage(nickname, text, options) {
        let opts = options || {};
        let li = $('<li class="multi-chat-msg"></li>');
        if (opts.system) {
            li.addClass("system");
        }
        if (opts.mine) {
            li.addClass("mine");
        }
        let safeText = escapeChatHtml(text || "");
        if (opts.system) {
            li.html('<span class="multi-chat-body">' + safeText + "</span>");
        } else {
            let safeNick = escapeChatHtml(nickname || "익명");
            li.html(
                '<span class="multi-chat-nick">' + safeNick + '</span>' +
                '<span class="multi-chat-body">' + safeText + "</span>"
            );
        }
        let list = $("#multi-chat-messages");
        list.append(li);
        while (list.children().length > CHAT_MAX_LINES) {
            list.children().first().remove();
        }
        list.scrollTop(list[0].scrollHeight);
    }

    function appendChatSystem(text) {
        appendChatMessage("", text, { system: true });
    }

    function sendChatMessage() {
        let input = $("#multi-chat-input");
        let text = String(input.val() || "").replace(/\s+/g, " ").trim();
        if (!text) {
            return;
        }
        if (!multiSocket || multiSocket.readyState !== WebSocket.OPEN) {
            return;
        }
        if (text.length > CHAT_MAX_LEN) {
            text = text.substring(0, CHAT_MAX_LEN);
        }
        let now = Date.now();
        if (text === lastChatSentText && now - lastChatSentAt < CHAT_SEND_DEBOUNCE_MS) {
            return;
        }
        lastChatSentText = text;
        lastChatSentAt = now;
        input.val("");
        sendMultiMessage({
            type: "CHAT",
            text: text,
            nickname: userNickname
        });
        appendChatMessage(userNickname, text, { mine: true });
        input.focus();
    }

    function resetMultiLobbyForm() {
        multiRoomReady = false;
        multiIsHostCreator = false;
        $("#create-room-btn").prop("disabled", false).text("방 만들기");
        $("#join-room-btn").prop("disabled", true).removeClass("join-pulse");
        $("#join-group-wrap").removeClass("join-ready");
        $("#multi-join-hint")
            .removeClass("hidden join-hint-active")
            .text("방을 만든 사람이 [방 만들기]를 누르면 [방 참여]가 활성화됩니다.");
    }

    function clearJoinRoomGuide() {
        $("#join-room-btn").removeClass("join-pulse");
        $("#join-group-wrap").removeClass("join-ready");
        $("#multi-join-hint").addClass("hidden").removeClass("join-hint-active");
    }

    function setJoinRoomGuideActive(hintText) {
        $("#join-room-btn").prop("disabled", false).addClass("join-pulse");
        $("#join-group-wrap").addClass("join-ready");
        $("#multi-join-hint").text(hintText).removeClass("hidden").addClass("join-hint-active");
    }

    function onHostRoomCreated(code) {
        multiRoomReady = true;
        multiIsHostCreator = true;
        roomCode = code;
        $("#create-room-btn").prop("disabled", true).text("방 생성됨");
        $("#join-room-btn").prop("disabled", true).removeClass("join-pulse");
        $("#join-group-wrap").removeClass("join-ready");
        $("#multi-join-hint")
            .removeClass("join-hint-active")
            .text("상대방이 [방 참여]를 누를 때까지 대기 중입니다.");
        $(".multi-wait-area").show();
        $(".wait-status").text("상대방이 [방 참여]를 누를 때까지 대기 중...");
    }

    function onGuestRoomWaiting(hostNick) {
        if (multiIsHostCreator) {
            return;
        }
        const name = hostNick || "상대";
        setJoinRoomGuideActive(name + "님이 방을 만들었습니다. [방 참여]를 눌러 주세요!");
    }

    function onGuestRoomClosed() {
        if (multiIsHostCreator) {
            return;
        }
        clearJoinRoomGuide();
        $("#join-room-btn").prop("disabled", true);
        $("#multi-join-hint")
            .removeClass("join-hint-active")
            .text("방을 만든 사람이 [방 만들기]를 누르면 [방 참여]가 활성화됩니다.");
    }

    function initChatPanelInteraction() {
        const panel = $("#multi-chat-panel");
        const header = panel.find(".multi-chat-header");
        const resizeHandles = panel.find(".multi-chat-resize");
        let dragging = false;
        let resizing = false;
        let resizeDir = "";
        let offsetX = 0;
        let offsetY = 0;
        let startLeft = 0;
        let startTop = 0;
        let startW = 0;
        let startH = 0;
        let anchorRight = 0;
        let anchorBottom = 0;

        function startChatDrag(pageX, pageY) {
            dragging = true;
            panel.addClass("is-dragging");
            const pos = panel.offset();
            offsetX = pageX - pos.left;
            offsetY = pageY - pos.top;
            panel.css({ right: "auto", bottom: "auto" });
        }

        function moveChatDrag(pageX, pageY) {
            if (!dragging) {
                return;
            }
            let newLeft = pageX - offsetX;
            let newTop = pageY - offsetY;
            const maxLeft = $(window).width() - panel.outerWidth() - 4;
            const maxTop = $(window).height() - panel.outerHeight() - 4;
            if (newLeft < 4) {
                newLeft = 4;
            }
            if (newTop < 4) {
                newTop = 4;
            }
            if (newLeft > maxLeft) {
                newLeft = maxLeft;
            }
            if (newTop > maxTop) {
                newTop = maxTop;
            }
            panel.css({ left: newLeft + "px", top: newTop + "px" });
        }

        function startChatResize(dir, pageX, pageY) {
            resizing = true;
            resizeDir = dir;
            panel.addClass("is-resizing");
            const pos = panel.offset();
            startLeft = pos.left;
            startTop = pos.top;
            startW = panel.outerWidth();
            startH = panel.outerHeight();
            anchorRight = startLeft + startW;
            anchorBottom = startTop + startH;
            panel.css({ right: "auto", bottom: "auto" });
        }

        function moveChatResize(pageX, pageY) {
            if (!resizing) {
                return;
            }
            let newLeft = startLeft;
            let newTop = startTop;
            let newW = startW;
            let newH = startH;

            if (resizeDir.indexOf("e") >= 0) {
                newW = pageX - startLeft;
            }
            if (resizeDir.indexOf("w") >= 0) {
                newW = anchorRight - pageX;
                newLeft = pageX;
            }
            if (resizeDir.indexOf("s") >= 0) {
                newH = pageY - startTop;
            }
            if (resizeDir.indexOf("n") >= 0) {
                newH = anchorBottom - pageY;
                newTop = pageY;
            }

            newW = clampChatNum(newW, CHAT_MIN_W, CHAT_MAX_W);
            newH = clampChatNum(newH, CHAT_MIN_H, CHAT_MAX_H);

            if (resizeDir.indexOf("w") >= 0) {
                newLeft = anchorRight - newW;
            }
            if (resizeDir.indexOf("n") >= 0) {
                newTop = anchorBottom - newH;
            }

            if (newLeft < 4) {
                newLeft = 4;
            }
            if (newTop < 4) {
                newTop = 4;
            }

            panel.css({
                left: newLeft + "px",
                top: newTop + "px",
                width: newW + "px",
                height: newH + "px"
            });
        }

        function endChatPanelInteraction() {
            let wasActive = dragging || resizing;
            if (dragging) {
                dragging = false;
                panel.removeClass("is-dragging");
            }
            if (resizing) {
                resizing = false;
                resizeDir = "";
                panel.removeClass("is-resizing");
            }
            if (wasActive) {
                saveChatPanelLayout();
            }
        }

        header.on("mousedown", function (e) {
            if ($(e.target).closest("input, button, .multi-chat-resize").length) {
                return;
            }
            startChatDrag(e.pageX, e.pageY);
            e.preventDefault();
        });

        header.on("touchstart", function (e) {
            if ($(e.target).closest("input, button, .multi-chat-resize").length) {
                return;
            }
            const touch = e.originalEvent.touches[0];
            if (touch) {
                startChatDrag(touch.pageX, touch.pageY);
            }
            e.preventDefault();
        });

        resizeHandles.on("mousedown", function (e) {
            const dir = $(this).attr("data-resize") || "se";
            startChatResize(dir, e.pageX, e.pageY);
            e.preventDefault();
            e.stopPropagation();
        });

        resizeHandles.on("touchstart", function (e) {
            const dir = $(this).attr("data-resize") || "se";
            const touch = e.originalEvent.touches[0];
            if (touch) {
                startChatResize(dir, touch.pageX, touch.pageY);
            }
            e.preventDefault();
            e.stopPropagation();
        });

        $(document).on("mousemove.tetrisChatPanel", function (e) {
            if (resizing) {
                moveChatResize(e.pageX, e.pageY);
            } else if (dragging) {
                moveChatDrag(e.pageX, e.pageY);
            }
        });

        $(document).on("touchmove.tetrisChatPanel", function (e) {
            const touch = e.originalEvent.touches[0];
            if (!touch) {
                return;
            }
            if (resizing) {
                moveChatResize(touch.pageX, touch.pageY);
            } else if (dragging) {
                moveChatDrag(touch.pageX, touch.pageY);
            }
        });

        $(document).on("mouseup.tetrisChatPanel", function () {
            endChatPanelInteraction();
        });

        $(document).on("touchend.tetrisChatPanel touchcancel.tetrisChatPanel", function () {
            endChatPanelInteraction();
        });
    }

    initChatPanelInteraction();

    function disconnectMulti() {
        if (multiSocket) {
            if (multiSocket.readyState === WebSocket.OPEN) {
                sendMultiMessage({ type: "LEAVE_ROOM" });
            }
            multiSocket.close();
            multiSocket = null;
        }
        multiRole = "";
        hideChatPanel();
        clearChatLog();
        resetMultiLobbyForm();
    }

    function applyOpponentState(payload) {
        let y;
        let x;
        if (payload.board && payload.board.length === ROWS) {
            for (y = 0; y < ROWS; y++) {
                for (x = 0; x < COLS; x++) {
                    cpuBoard[y][x] = payload.board[y][x] || 0;
                }
            }
        }
        if (payload.score != null) {
            cpuScore = payload.score;
        }
        if (payload.lines != null) {
            cpuTotalLines = payload.lines;
        }
        if (payload.nickname) {
            opponentNickname = payload.nickname;
        }
        cpuCurrent = null;
    }

    function sendBoardSync() {
        if (gameMode !== "multi" || !isRunning) {
            return;
        }
        sendMultiMessage({
            type: "BOARD_SYNC",
            board: board,
            score: score,
            lines: totalLines,
            nickname: userNickname
        });
    }

    function sendMultiGameOver() {
        if (gameMode !== "multi") {
            return;
        }
        sendMultiMessage({ type: "GAME_OVER", nickname: userNickname });
    }

    function sendMultiplayerAttack(lines) {
        if (gameMode !== "multi" || lines <= 0) {
            return;
        }
        sendMultiMessage({ type: "ATTACK", lines: lines, nickname: userNickname });
    }

    function beginMultiMatch(msg) {
        if (multiRole === "host") {
            opponentNickname = msg.guestNick || "상대";
        } else {
            opponentNickname = msg.hostNick || "상대";
        }
        $(".multi-wait-area").hide();
        $(".lobby-content").hide();
        startGame();
    }

    function handleMultiIncoming(msg) {
        if (!msg || !msg.type) {
            return;
        }

        if (msg.type === "ROOM_CREATED") {
            onHostRoomCreated("");
            showChatPanel();
            appendChatSystem("방이 생성되었습니다. 상대방에게 [방 참여]를 안내하세요.");
            return;
        }

        if (msg.type === "ROOM_WAITING") {
            onGuestRoomWaiting(msg.hostNick);
            return;
        }

        if (msg.type === "ROOM_CLOSED") {
            onGuestRoomClosed();
            return;
        }

        if (msg.type === "JOIN_OK") {
            roomCode = msg.roomCode || roomCode;
            $(".wait-status").text("매칭 중...");
            showChatPanel();
            appendChatSystem("방에 참여했습니다.");
            return;
        }

        if (msg.type === "OPPONENT_JOINED") {
            opponentNickname = msg.nickname || "상대";
            clearJoinRoomGuide();
            $(".wait-status").text(opponentNickname + "님이 입장했습니다. 곧 시작합니다...");
            appendChatSystem(opponentNickname + "님이 입장했습니다.");
            return;
        }

        if (msg.type === "CHAT") {
            let nick = String(msg.nickname || "").trim();
            let text = String(msg.text || "").trim();
            let isMine = nick === String(userNickname || "").trim();
            if (text && !isMine) {
                appendChatMessage(nick, text, { mine: false });
            }
            return;
        }

        if (msg.type === "CHAT_ACK") {
            if (msg.delivered === false && msg.reason === "no_peer") {
                appendChatSystem("상대가 입장하기 전에는 메시지를 보낼 수 없습니다.");
            }
            return;
        }

        if (msg.type === "MATCH_START") {
            appendChatSystem("게임이 곧 시작됩니다!");
            if (!versusEnded && !isRunning) {
                beginMultiMatch(msg);
            }
            return;
        }

        if (msg.type === "BOARD_SYNC") {
            if (gameMode === "multi" && isRunning) {
                applyOpponentState(msg);
            }
            return;
        }

        if (msg.type === "ATTACK") {
            if (gameMode === "multi" && isRunning && !isGameOver) {
                p1GarbageQueue += msg.lines || 0;
            }
            return;
        }

        if (msg.type === "GAME_OVER") {
            if (gameMode === "multi" && isRunning && !versusEnded) {
                handleVersusEnd(true);
            }
            return;
        }

        if (msg.type === "OPPONENT_DISCONNECTED") {
            appendChatSystem("상대방 연결이 끊어졌습니다.");
            if (gameMode === "multi" && isRunning && !versusEnded) {
                alert("상대방 연결이 끊어졌습니다.");
                handleVersusEnd(true);
            } else {
                disconnectMulti();
                $(".multi-wait-area").hide();
                $(".multi-form-area").show();
            }
            return;
        }

        if (msg.type === "ERROR") {
            alert(msg.message || "멀티플레이 오류가 발생했습니다.");
            disconnectMulti();
            $(".multi-wait-area").hide();
            $(".multi-form-area").show();
        }
    }

    function connectMultiLobbyWatch() {
        if (multiSocket && multiSocket.readyState === WebSocket.OPEN) {
            return;
        }
        disconnectMulti();
        let ws;
        try {
            ws = new WebSocket(getMultiWsUrl());
        } catch (e) {
            return;
        }
        multiSocket = ws;
        ws.onopen = function () {
            sendMultiMessage({ type: "LOBBY_WATCH" });
        };
        ws.onmessage = function (ev) {
            let msg;
            try {
                msg = JSON.parse(ev.data);
            } catch (err) {
                return;
            }
            handleMultiIncoming(msg);
        };
        ws.onclose = function () {
            if (multiSocket === ws) {
                multiSocket = null;
            }
        };
    }

    function connectMultiAndSend(createPayload) {
        disconnectMulti();
        clearChatLog();

        let ws;
        try {
            ws = new WebSocket(getMultiWsUrl());
        } catch (e) {
            alert("WebSocket 연결을 만들 수 없습니다. 서버(npm run server) 실행 여부를 확인하세요.");
            return;
        }

        multiSocket = ws;

        ws.onopen = function () {
            sendMultiMessage(createPayload);
        };

        ws.onmessage = function (ev) {
            let msg;
            try {
                msg = JSON.parse(ev.data);
            } catch (err) {
                return;
            }
            handleMultiIncoming(msg);
        };

        ws.onclose = function () {
            if (multiSocket === ws) {
                multiSocket = null;
            }
        };

        ws.onerror = function () {
            alert("서버에 연결할 수 없습니다.\n터미널에서 npm install && npm run server 를 실행했는지 확인하세요.");
            disconnectMulti();
            $(".multi-wait-area").hide();
            $(".multi-form-area").show();
        };
    }

    function insertGarbageLinesEx(isCpu, lines) {
        let targetBoard = isCpu ? cpuBoard : board;
        targetBoard.splice(0, lines);
        for (let i = 0; i < lines; i++) {
            let row = Array(COLS).fill(8); // 회색 블록 (인덱스 8)
            let holeX = Math.floor(Math.random() * COLS);
            row[holeX] = 0;
            targetBoard.push(row);
        }
    }

    function drawGarbageMeters() {
        garbageGfx.clear();
        p2GarbageGfx.clear();

        if (p1GarbageQueue > 0) {
            let meterW = 6;
            let meterX = boardOriginX - meterW - 4;
            let maxMeterH = ROWS * BLOCK;
            let meterH = Math.min(p1GarbageQueue * BLOCK, maxMeterH);
            let meterY = boardOriginY + maxMeterH - meterH;

            garbageGfx.beginFill(0xff3b30);
            garbageGfx.drawRoundedRect(meterX, meterY, meterW, meterH, 3);
            garbageGfx.endFill();

            garbageGfx.lineStyle(1, 0xffffff, 0.4);
            garbageGfx.drawRoundedRect(meterX, meterY, meterW, meterH, 3);
        }

        if (gameMode !== "solo" && cpuGarbageQueue > 0) {
            let meterW = 6;
            let meterX = p2BoardOriginX - meterW - 4;
            let maxMeterH = ROWS * BLOCK;
            let meterH = Math.min(cpuGarbageQueue * BLOCK, maxMeterH);
            let meterY = p2BoardOriginY + maxMeterH - meterH;

            p2GarbageGfx.beginFill(0xff3b30);
            p2GarbageGfx.drawRoundedRect(meterX, meterY, meterW, meterH, 3);
            p2GarbageGfx.endFill();

            p2GarbageGfx.lineStyle(1, 0xffffff, 0.4);
            p2GarbageGfx.drawRoundedRect(meterX, meterY, meterW, meterH, 3);
        }
    }

    function spawnFromShape(shape, type) {
        const s = cloneMatrix(shape);
        return {
            x: Math.floor((COLS - s[0].length) / 2),
            y: 0,
            shape: s,
            type: type
        };
    }

    function randomPieceEx(isCpu) {
        const i = isCpu ? cpuNextTypeFromBag() : nextTypeFromBag();
        const shape = cloneMatrix(SHAPES[i]);
        const x = Math.floor((COLS - shape[0].length) / 2);
        return { x: x, y: 0, shape: shape, type: i };
    }

    function spawnPieceEx(isCpu) {
        if (!isCpu) {
            current = randomPieceEx(false);
            piecesCount++;
            if (collidesEx(board, current, 0, 0)) endGame();
        } else {
            cpuCurrent = randomPieceEx(true);
            cpuPiecesCount++;
            if (collidesEx(cpuBoard, cpuCurrent, 0, 0)) {
                cpuEndGame();
            } else {
                cpuPlanMove();
            }
        }
    }

    function hardDropEx(isCpu) {
        if (isCpu) {
            if (!isRunning || isGameOver || cpuIsGameOver || !cpuCurrent) return;
            while (!collidesEx(cpuBoard, cpuCurrent, 0, 1)) cpuCurrent.y++;
            lockCurrentPieceEx(true);
        } else {
            if (!isRunning || isGameOver || !current) return;
            while (!collidesEx(board, current, 0, 1)) current.y++;
            lockCurrentPieceEx(false);
        }
    }

    function moveEx(isCpu, dx) {
        if (isCpu) {
            if (!isRunning || isGameOver || cpuIsGameOver || !cpuCurrent) return;
            if (!collidesEx(cpuBoard, cpuCurrent, dx, 0)) cpuCurrent.x += dx;
        } else {
            if (!isRunning || isGameOver || !current) return;
            if (!collidesEx(board, current, dx, 0)) current.x += dx;
        }
    }

    function rotateEx(isCpu) {
        if (isCpu) {
            if (!isRunning || isGameOver || cpuIsGameOver || !cpuCurrent) return;
            const rotated = rotateMatrixClockwise(cpuCurrent.shape);
            if (!collidesEx(cpuBoard, cpuCurrent, 0, 0, rotated)) {
                cpuCurrent.shape = rotated;
                return;
            }
            if (!collidesEx(cpuBoard, cpuCurrent, -1, 0, rotated)) {
                cpuCurrent.x -= 1;
                cpuCurrent.shape = rotated;
                return;
            }
            if (!collidesEx(cpuBoard, cpuCurrent, 1, 0, rotated)) {
                cpuCurrent.x += 1;
                cpuCurrent.shape = rotated;
            }
        } else {
            if (!isRunning || isGameOver || !current) return;
            const rotated = rotateMatrixClockwise(current.shape);
            if (!collidesEx(board, current, 0, 0, rotated)) {
                current.shape = rotated;
                return;
            }
            if (!collidesEx(board, current, -1, 0, rotated)) {
                current.x -= 1;
                current.shape = rotated;
                return;
            }
            if (!collidesEx(board, current, 1, 0, rotated)) {
                current.x += 1;
                current.shape = rotated;
            }
        }
    }

    function lockCurrentPieceEx(isCpu) {
        if (isCpu) {
            mergePieceEx(cpuBoard, cpuCurrent);
            let linesCleared = clearLinesEx(cpuBoard, true);

            if (linesCleared > 0) {
                cpuCombo++;
                let attack = calcAttackStrength(linesCleared, true);
                sendAttackEx(true, attack);
                if (linesCleared === 4) {
                    cpuB2b = true;
                } else {
                    cpuB2b = false;
                }
            } else {
                cpuCombo = 0;
                if (cpuGarbageQueue > 0) {
                    insertGarbageLinesEx(true, cpuGarbageQueue);
                    cpuGarbageQueue = 0;
                }
            }

            cpuCanHold = true;
            spawnPieceEx(true);
        } else {
            mergePieceEx(board, current);
            let linesCleared = clearLinesEx(board, false);

            if (linesCleared > 0) {
                p1Combo++;
                let attack = calcAttackStrength(linesCleared, false);
                sendAttackEx(false, attack);
                if (linesCleared === 4) {
                    p1B2b = true;
                } else {
                    p1B2b = false;
                }
            } else {
                p1Combo = 0;
                if (p1GarbageQueue > 0) {
                    insertGarbageLinesEx(false, p1GarbageQueue);
                    p1GarbageQueue = 0;
                }
            }

            canHold = true;
            spawnPieceEx(false);
            if (gameMode === "multi") {
                sendBoardSync();
            }
        }
    }

    function softDropStepEx(isCpu) {
        if (isCpu) {
            if (!isRunning || isGameOver || cpuIsGameOver || !cpuCurrent) return;
            if (!collidesEx(cpuBoard, cpuCurrent, 0, 1)) cpuCurrent.y += 1;
            else lockCurrentPieceEx(true);
        } else {
            if (!isRunning || isGameOver || !current) return;
            if (!collidesEx(board, current, 0, 1)) current.y += 1;
            else lockCurrentPieceEx(false);
        }
    }

    function cpuEndGame() {
        cpuIsGameOver = true;
        if (gameMode === "cpu" || gameMode === "multi") {
            handleVersusEnd(true);
        }
    }

    function hideResultOverlay() {
        $("#result-overlay").addClass("hidden");
    }

    function showResultOverlay(p1Won) {
        let opponentLabel = "상대";
        if (gameMode === "cpu") {
            opponentLabel = "CPU";
        } else if (gameMode === "multi" && opponentNickname) {
            opponentLabel = opponentNickname;
        }
        const titleEl = $("#result-title");
        const subtitleEl = $("#result-subtitle");

        if (p1Won) {
            titleEl.text("YOU WIN").removeClass("result-lose").addClass("result-win");
            subtitleEl.text(opponentLabel + "를 이겼습니다!");
        } else {
            titleEl.text("YOU LOSE").removeClass("result-win").addClass("result-lose");
            subtitleEl.text(opponentLabel + "에게 패배했습니다.");
        }

        $("#result-p2-label").text(opponentLabel);
        $("#result-p1-score").text(String(score));
        $("#result-p2-score").text(String(cpuScore));
        $("#result-overlay").removeClass("hidden");
    }

    function handleVersusEnd(p1Won) {
        if (versusEnded) {
            return;
        }
        versusEnded = true;
        isRunning = false;
        isGameOver = true;
        cpuIsGameOver = true;
        $("#status").text(p1Won ? "WIN" : "LOSE");
        $("#start-btn").text("Lobby");
        showResultOverlay(p1Won);
    }

    let cpuTargetX = 0;
    let cpuTargetRot = 0;
    let cpuAiTickMs = 800;
    let cpuAiElapsed = 0;

    function cpuTryHold() {
        if (!isRunning || cpuIsGameOver || !cpuCurrent || !cpuCanHold) return;
        cpuCanHold = false;
        if (cpuHold === null) {
            cpuHold = { shape: cloneMatrix(cpuCurrent.shape), type: cpuCurrent.type };
            spawnPieceEx(true);
        } else {
            const next = spawnFromShape(cpuHold.shape, cpuHold.type);
            cpuHold = { shape: cloneMatrix(cpuCurrent.shape), type: cpuCurrent.type };
            cpuCurrent = next;
            if (collidesEx(cpuBoard, cpuCurrent, 0, 0)) cpuEndGame();
        }
        cpuPlanMove();
    }

    function cpuPlanMove() {
        if (!cpuCurrent || cpuIsGameOver) return;
        const moveInfo = getBestMove(cpuBoard, cpuCurrent, cpuHold, cpuCanHold);
        if (moveInfo.useHold) {
            cpuTryHold();
            return;
        }
        cpuTargetX = moveInfo.x;
        cpuTargetRot = moveInfo.rot;
    }

    function cpuExecuteMove() {
        if (!isRunning || isGameOver || cpuIsGameOver || !cpuCurrent) return;

        for (let i = 0; i < cpuTargetRot; i++) {
            rotateEx(true);
        }

        const diffX = cpuTargetX - cpuCurrent.x;
        if (diffX !== 0) {
            const step = diffX > 0 ? 1 : -1;
            const count = Math.abs(diffX);
            for (let i = 0; i < count; i++) {
                moveEx(true, step);
            }
        }

        hardDropEx(true);
    }

    function drawStyledCell(graphics, px, py, color, alpha) {
        const a = alpha == null ? 1 : alpha;
        graphics.beginFill(color, a);
        graphics.drawRoundedRect(px + 1, py + 1, BLOCK - 2, BLOCK - 2, 4);
        graphics.endFill();
        graphics.beginFill(0xffffff, a * 0.18);
        graphics.drawRoundedRect(px + 4, py + 4, BLOCK - 14, BLOCK - 14, 2);
        graphics.endFill();
    }

    function drawCellBoard(g, col, row, colorIndex, alpha) {
        const color = COLORS[colorIndex];
        if (!color || colorIndex === 0) return;
        const px = boardOriginX + col * BLOCK;
        const py = boardOriginY + row * BLOCK;
        drawStyledCell(g, px, py, color, alpha);
    }

    const p2BoardOriginX = singleAppW + boardOriginX;
    const p2BoardOriginY = boardOriginY;

    function drawCellBoardP2(g, col, row, colorIndex, alpha) {
        const color = COLORS[colorIndex];
        if (!color || colorIndex === 0) return;
        const px = p2BoardOriginX + col * BLOCK;
        const py = p2BoardOriginY + row * BLOCK;
        drawStyledCell(g, px, py, color, alpha);
    }

    function drawBoardP2() {
        p2BoardGfx.clear();
        if (gameMode === "solo") return;
        for (let y = 0; y < ROWS; y++) {
            for (let x = 0; x < COLS; x++) {
                const value = cpuBoard[y][x];
                if (value > 0) drawCellBoardP2(p2BoardGfx, x, y, value, 1);
            }
        }
    }

    function drawActiveP2() {
        p2ActiveGfx.clear();
        if (gameMode === "solo" || !cpuCurrent) return;
        for (let y = 0; y < cpuCurrent.shape.length; y++) {
            for (let x = 0; x < cpuCurrent.shape[y].length; x++) {
                const value = cpuCurrent.shape[y][x];
                if (value === 0) continue;
                const gx = cpuCurrent.x + x;
                const gy = cpuCurrent.y + y;
                if (gy >= 0) drawCellBoardP2(p2ActiveGfx, gx, gy, value, 1);
            }
        }
    }

    function cpuGhostDy() {
        if (!cpuCurrent) return 0;
        let dy = 0;
        while (!collidesEx(cpuBoard, cpuCurrent, 0, dy + 1)) {
            dy++;
        }
        return dy;
    }

    function drawGhostP2() {
        p2GhostGfx.clear();
        if (gameMode === "solo" || !cpuCurrent || cpuIsGameOver) return;
        const dy = cpuGhostDy();
        if (dy === 0) return;
        for (let y = 0; y < cpuCurrent.shape.length; y++) {
            for (let x = 0; x < cpuCurrent.shape[y].length; x++) {
                const value = cpuCurrent.shape[y][x];
                if (value === 0) continue;
                const gx = cpuCurrent.x + x;
                const gy = cpuCurrent.y + y + dy;
                if (gy >= 0) drawCellBoardP2(p2GhostGfx, gx, gy, value, GHOST_ALPHA);
            }
        }
    }

    function drawGridP2() {
        p2GridGfx.clear();
        if (gameMode === "solo") return;
        p2GridGfx.lineStyle(1, 0x2a2f3a, 0.65);
        const x0 = p2BoardOriginX;
        const y0 = p2BoardOriginY;
        const w = COLS * BLOCK;
        const h = ROWS * BLOCK;
        for (let i = 0; i <= COLS; i++) {
            p2GridGfx.moveTo(x0 + i * BLOCK, y0);
            p2GridGfx.lineTo(x0 + i * BLOCK, y0 + h);
        }
        for (let j = 0; j <= ROWS; j++) {
            p2GridGfx.moveTo(x0, y0 + j * BLOCK);
            p2GridGfx.lineTo(x0 + w, y0 + j * BLOCK);
        }
    }

    function drawHoldP2() {
        p2HoldGfx.clear();
        if (gameMode === "solo" || gameMode === "multi" || !cpuHold) return;

        const scale = 0.58;
        const b = BLOCK * scale;
        const shape = cpuHold.shape;
        const ph = shape.length;
        const pw = shape[0].length;
        
        const boxCx = singleAppW + 8 + HOLD_BOX_W / 2;
        const boxCy = HOLD_BOX_Y + HOLD_BOX_H / 2;
        const ox = boxCx - (pw * b) / 2;
        const oy = boxCy - (ph * b) / 2;

        for (let y = 0; y < ph; y++) {
            for (let x = 0; x < pw; x++) {
                const value = shape[y][x];
                if (value === 0) continue;
                const color = pieceColorFromCell(value);
                const px = ox + x * b;
                const py = oy + y * b;
                p2HoldGfx.beginFill(color, 1);
                p2HoldGfx.drawRoundedRect(px + 1, py + 1, b - 2, b - 2, 4);
                p2HoldGfx.endFill();
                p2HoldGfx.beginFill(0xffffff, 0.18);
                p2HoldGfx.drawRoundedRect(px + 3, py + 3, b - 8, b - 8, 2);
                p2HoldGfx.endFill();
            }
        }
    }

    function drawNextP2() {
        p2NextGfx.clear();
        if (gameMode === "solo" || gameMode === "multi" || !isRunning || cpuIsGameOver) return;
        const types = cpuPeekNext(NEXT_COUNT);
        const p2NextPanelX = singleAppW + nextPanelX;
        const nextBoxX = p2NextPanelX + 8;
        const nextBoxW = NEXT_PANEL - 24;
        const nextBoxH = appH - NEXT_BOX_Y - 8;
        const boxCx = nextBoxX + nextBoxW / 2;
        const slotH = nextBoxH / NEXT_COUNT;

        for (let i = 0; i < types.length; i++) {
            const scale = i === 0 ? 0.62 : 0.50;
            const b = BLOCK * scale;
            const shape = SHAPES[types[i]];
            const ph = shape.length;
            const pw = shape[0].length;

            const slotCy = NEXT_BOX_Y + (i + 0.5) * slotH;
            const ox = boxCx - (pw * b) / 2;
            const oy = slotCy - (ph * b) / 2;
            const alpha = 1.0 - i * 0.12;

            for (let y = 0; y < ph; y++) {
                for (let x = 0; x < pw; x++) {
                    const value = shape[y][x];
                    if (value === 0) continue;
                    const color = pieceColorFromCell(value);
                    const px = ox + x * b;
                    const py = oy + y * b;
                    p2NextGfx.beginFill(color, alpha);
                    p2NextGfx.drawRoundedRect(px + 1, py + 1, b - 2, b - 2, 4);
                    p2NextGfx.endFill();
                    p2NextGfx.beginFill(0xffffff, alpha * 0.18);
                    p2NextGfx.drawRoundedRect(px + 3, py + 3, b - 8, b - 8, 2);
                    p2NextGfx.endFill();
                }
            }
        }
    }

    function updateStatsP2() {
        if (gameMode === "solo") return;
        if (gameMode === "cpu") {
            p2TimeCaption.text = "OPPONENT";
            p2TimeTx.text = "AI CPU";
        } else if (gameMode === "multi") {
            p2TimeCaption.text = "OPPONENT";
            p2TimeTx.text = opponentNickname || "PLAYER 2";
        }
        p2PiecesValueTx.text = String(cpuPiecesCount);
        const sec = gameMs / 1000;
        const rate = sec > 0 ? (cpuPiecesCount / sec).toFixed(2) : "0.00";
        p2PiecesRateTx.text = rate + "/S";
        p2LinesValueTx.text = String(cpuTotalLines);
        
        p2LinesSuffixTx.x = p2LinesValueTx.x + p2LinesValueTx.width + 2;
        p2LinesSuffixTx.y = p2LinesValueTx.y + p2LinesValueTx.height - p2LinesSuffixTx.height - 2;
    }

    function drawPanelAndBorder() {
        panelGfx.clear();

        // 게임판 흰색 테두리
        borderGfx.clear();
        borderGfx.lineStyle(2, 0xffffff, 1);
        borderGfx.drawRect(
            boardOriginX - 2,
            boardOriginY - 2,
            COLS * BLOCK + 4,
            ROWS * BLOCK + 4
        );

        // HOLD 고정 흰색 테두리 박스
        panelGfx.lineStyle(2, 0xffffff, 1);
        panelGfx.beginFill(0x000000, 1);
        panelGfx.drawRect(8, HOLD_BOX_Y, HOLD_BOX_W, HOLD_BOX_H);
        panelGfx.endFill();

        // NEXT 고정 흰색 테두리 박스 (전체 높이의 대부분)
        const nPanelX = HOLD_PANEL + PANEL_GAP + BOARD_PAD * 2 + COLS * BLOCK + PANEL_GAP;
        const nextBoxX = nPanelX + 8;
        const nextBoxW = NEXT_PANEL - 24;
        const nextBoxH = appH - NEXT_BOX_Y - 8;
        panelGfx.lineStyle(2, 0xffffff, 1);
        panelGfx.beginFill(0x000000, 1);
        panelGfx.drawRect(nextBoxX, NEXT_BOX_Y, nextBoxW, nextBoxH);
        panelGfx.endFill();

        // Player 2 테두리 및 패널
        if (gameMode !== "solo") {
            p2BorderGfx.clear();
            p2PanelGfx.clear();

            p2BorderGfx.lineStyle(2, 0xffffff, 1);
            p2BorderGfx.drawRect(
                p2BoardOriginX - 2,
                p2BoardOriginY - 2,
                COLS * BLOCK + 4,
                ROWS * BLOCK + 4
            );

            p2PanelGfx.lineStyle(2, 0xffffff, 1);
            p2PanelGfx.beginFill(0x000000, 1);
            p2PanelGfx.drawRect(singleAppW + 8, HOLD_BOX_Y, HOLD_BOX_W, HOLD_BOX_H);
            p2PanelGfx.endFill();

            const p2NextBoxX = singleAppW + nextBoxX;
            p2PanelGfx.lineStyle(2, 0xffffff, 1);
            p2PanelGfx.beginFill(0x000000, 1);
            p2PanelGfx.drawRect(p2NextBoxX, NEXT_BOX_Y, nextBoxW, nextBoxH);
            p2PanelGfx.endFill();
        } else {
            p2BorderGfx.clear();
            p2PanelGfx.clear();
        }
    }

    function drawBoard() {
        boardGfx.clear();
        for (let y = 0; y < ROWS; y++) {
            for (let x = 0; x < COLS; x++) {
                const value = board[y][x];
                if (value > 0) drawCellBoard(boardGfx, x, y, value, 1);
            }
        }
    }

    function drawGhost() {
        ghostGfx.clear();
        if (!current || isGameOver) return;
        const dy = ghostDy();
        if (dy === 0) return;
        for (let y = 0; y < current.shape.length; y++) {
            for (let x = 0; x < current.shape[y].length; x++) {
                const value = current.shape[y][x];
                if (value === 0) continue;
                const gx = current.x + x;
                const gy = current.y + y + dy;
                if (gy >= 0) drawCellBoard(ghostGfx, gx, gy, value, GHOST_ALPHA);
            }
        }
    }

    function drawActive() {
        activeGfx.clear();
        if (!current) return;
        for (let y = 0; y < current.shape.length; y++) {
            for (let x = 0; x < current.shape[y].length; x++) {
                const value = current.shape[y][x];
                if (value === 0) continue;
                const gx = current.x + x;
                const gy = current.y + y;
                if (gy >= 0) drawCellBoard(activeGfx, gx, gy, value, 1);
            }
        }
    }

    function drawGrid() {
        gridGfx.clear();
        gridGfx.lineStyle(1, 0x2a2f3a, 0.65);
        const x0 = boardOriginX;
        const y0 = boardOriginY;
        const w = COLS * BLOCK;
        const h = ROWS * BLOCK;
        for (let i = 0; i <= COLS; i++) {
            gridGfx.moveTo(x0 + i * BLOCK, y0);
            gridGfx.lineTo(x0 + i * BLOCK, y0 + h);
        }
        for (let j = 0; j <= ROWS; j++) {
            gridGfx.moveTo(x0, y0 + j * BLOCK);
            gridGfx.lineTo(x0 + w, y0 + j * BLOCK);
        }
    }

    function pieceColorFromCell(v) {
        return COLORS[v] || 0xc9d1d9;
    }

    /** HOLD 박스 내부에 흩은 블록 렌더링 */
    function drawHold() {
        holdGfx.clear();
        if (!hold) return;

        const scale = 0.58;
        const b = BLOCK * scale;
        const shape = hold.shape;
        const ph = shape.length;
        const pw = shape[0].length;
        // HOLD 박스 중앙에 정렬
        const boxCx = 8 + HOLD_BOX_W / 2;
        const boxCy = HOLD_BOX_Y + HOLD_BOX_H / 2;
        const ox = boxCx - (pw * b) / 2;
        const oy = boxCy - (ph * b) / 2;

        for (let y = 0; y < ph; y++) {
            for (let x = 0; x < pw; x++) {
                const value = shape[y][x];
                if (value === 0) continue;
                const color = pieceColorFromCell(value);
                const px = ox + x * b;
                const py = oy + y * b;
                holdGfx.beginFill(color, 1);
                holdGfx.drawRoundedRect(px + 1, py + 1, b - 2, b - 2, 4);
                holdGfx.endFill();
                holdGfx.beginFill(0xffffff, 0.18);
                holdGfx.drawRoundedRect(px + 3, py + 3, b - 8, b - 8, 2);
                holdGfx.endFill();
            }
        }
    }

    /**
     * NEXT 패널: 하나의 큰 흰색 테두리 박스 안에 5개 블록 세로 정렬
     * - i=0 (다음 블록) → 박스 맨 위, i=4 → 맨 아래
     */
    function drawNext() {
        nextGfx.clear();
        if (!isRunning || isGameOver) return;
        const types = peekNext(NEXT_COUNT);
        const nPanelX = HOLD_PANEL + PANEL_GAP + BOARD_PAD * 2 + COLS * BLOCK + PANEL_GAP;
        const nextBoxX = nPanelX + 8;
        const nextBoxW = NEXT_PANEL - 24;
        const nextBoxH = appH - NEXT_BOX_Y - 8;
        const boxCx = nextBoxX + nextBoxW / 2;
        // 추사 영역: NEXT 박스 내부를 균등하게 n등분
        const slotH = nextBoxH / NEXT_COUNT;

        for (let i = 0; i < types.length; i++) {
            // i=0: 맨 위 (다음 블낅), 크고 밝게
            const scale = i === 0 ? 0.62 : 0.50;
            const b = BLOCK * scale;
            const shape = SHAPES[types[i]];
            const ph = shape.length;
            const pw = shape[0].length;

            const slotCy = NEXT_BOX_Y + (i + 0.5) * slotH;
            const ox = boxCx - (pw * b) / 2;
            const oy = slotCy - (ph * b) / 2;
            const alpha = 1.0 - i * 0.12;

            for (let y = 0; y < ph; y++) {
                for (let x = 0; x < pw; x++) {
                    const value = shape[y][x];
                    if (value === 0) continue;
                    const color = pieceColorFromCell(value);
                    const px = ox + x * b;
                    const py = oy + y * b;
                    nextGfx.beginFill(color, alpha);
                    nextGfx.drawRoundedRect(px + 1, py + 1, b - 2, b - 2, 4);
                    nextGfx.endFill();
                    nextGfx.beginFill(0xffffff, alpha * 0.18);
                    nextGfx.drawRoundedRect(px + 3, py + 3, b - 8, b - 8, 2);
                    nextGfx.endFill();
                }
            }
        }
    }

    /** 통계 텍스트 갱신 */
    function updateStats() {
        const sec = gameMs / 1000;
        const rate = sec > 0 ? (piecesCount / sec).toFixed(2) : "0.00";
        piecesValueTx.text = String(piecesCount);
        piecesRateTx.text = rate + "/S";
        linesValueTx.text = String(totalLines);
        // /40 접미사: 숫자 오른쪽에 배치
        linesSuffixTx.x = linesValueTx.x + linesValueTx.width + 2;
        linesSuffixTx.y = linesValueTx.y + linesValueTx.height - linesSuffixTx.height - 2;
        // 시간 포맷: m:ss.mmm
        const totalSec = Math.floor(sec);
        const min = Math.floor(totalSec / 60);
        const s = totalSec % 60;
        const ms = Math.floor(gameMs % 1000);
        const padS = s < 10 ? "0" + s : String(s);
        const padMs = ms < 100 ? (ms < 10 ? "00" + ms : "0" + ms) : String(ms);
        timeTx.text = min + ":" + padS + "." + padMs;
    }

    function renderAll() {
        drawPanelAndBorder();
        drawBoard();
        drawGhost();
        drawActive();
        drawGrid();
        drawHold();
        drawNext();
        drawGarbageMeters();
        updateStats();

        if (gameMode !== "solo") {
            drawBoardP2();
            drawGhostP2();
            drawActiveP2();
            drawGridP2();
            drawHoldP2();
            drawNextP2();
            updateStatsP2();
        } else {
            p2BoardGfx.clear();
            p2GhostGfx.clear();
            p2ActiveGfx.clear();
            p2GridGfx.clear();
            p2HoldGfx.clear();
            p2NextGfx.clear();
            p2GarbageGfx.clear();
        }
    }

    function endGame() {
        isGameOver = true;
        if (gameMode === "cpu" || gameMode === "multi") {
            if (gameMode === "multi") {
                sendMultiGameOver();
            }
            handleVersusEnd(false);
            return;
        }
        isRunning = false;
        $("#status").text("GAME OVER");
        $("#start-btn").text("Lobby");
    }

    function tryHold() {
        if (!isRunning || isGameOver || !current || !canHold) return;
        canHold = false;
        if (hold === null) {
            hold = { shape: cloneMatrix(current.shape), type: current.type };
            spawnPiece();
        } else {
            const next = spawnFromShape(hold.shape, hold.type);
            hold = { shape: cloneMatrix(current.shape), type: current.type };
            current = next;
            if (collides(current, 0, 0)) endGame();
        }
    }

    function runCountdown(step, callback) {
        const overlay = $("#countdown-overlay");
        const textEl = overlay.find(".countdown-text");
        
        textEl.removeClass("countdown-pop");
        
        if (step === 3) {
            overlay.removeClass("hidden");
            textEl.text("3").addClass("countdown-pop");
            countdownTimeout = setTimeout(function () { runCountdown(2, callback); }, 1000);
        } else if (step === 2) {
            textEl.text("2").addClass("countdown-pop");
            countdownTimeout = setTimeout(function () { runCountdown(1, callback); }, 1000);
        } else if (step === 1) {
            textEl.text("1").addClass("countdown-pop");
            countdownTimeout = setTimeout(function () { runCountdown(0, callback); }, 1000);
        } else if (step === 0) {
            textEl.text("START!").addClass("countdown-pop");
            if (callback) {
                callback();
            }
            countdownTimeout = setTimeout(function () {
                overlay.addClass("hidden");
                countdownTimeout = null;
            }, 800);
        }
    }

    function startGame() {
        if (countdownTimeout) {
            clearTimeout(countdownTimeout);
            countdownTimeout = null;
        }
        $("#countdown-overlay").addClass("hidden");
        hideResultOverlay();
        versusEnded = false;

        resetBoard();
        bag = [];
        hold = null;
        canHold = true;
        score = 0;
        dropElapsed = 0;
        dropMs = DROP_INTERVAL;
        isGameOver = false;
        isRunning = false;
        piecesCount = 0;
        totalLines = 0;
        gameMs = 0;
        current = null;
        p1Combo = 0;
        p1B2b = false;
        p1GarbageQueue = 0;
        $("#score").text(score);
        $("#status").text("READY");
        $("#start-btn").text("Lobby");

        // CPU 상태 초기화
        cpuBoard = createBoard();
        cpuCurrent = null;
        cpuHold = null;
        cpuCanHold = true;
        cpuIsGameOver = false;
        cpuPiecesCount = 0;
        cpuTotalLines = 0;
        cpuScore = 0;
        cpuDropElapsed = 0;
        cpuDropMs = DROP_INTERVAL;
        cpuBag = [];
        cpuAiElapsed = 0;
        cpuCombo = 0;
        cpuB2b = false;
        cpuGarbageQueue = 0;

        // 화면 분할 처리
        if (gameMode !== "solo") {
            app.renderer.resize(singleAppW * 2, appH);
            $("#game-container").css({ width: singleAppW * 2 + "px", height: appH + "px" });
            setP2Visible(true);
        } else {
            app.renderer.resize(singleAppW, appH);
            $("#game-container").css({ width: singleAppW + "px", height: appH + "px" });
            setP2Visible(false);
        }
        
        renderAll();

        runCountdown(3, function () {
            // 카운트다운 종료 시점에 로비 완전히 숨김
            $("#lobby-overlay").hide();
            
            isRunning = true;
            $("#status").text("RUNNING");
            spawnPieceEx(false);
            if (gameMode === "cpu") {
                spawnPieceEx(true);
            }
            if (gameMode === "multi") {
                cpuBoard = createBoard();
                cpuCurrent = null;
                cpuIsGameOver = false;
                cpuScore = 0;
                cpuTotalLines = 0;
                cpuGarbageQueue = 0;
            }
            renderAll();
        });
    }

    $("#start-btn").on("click", function () {
        if (countdownTimeout) {
            clearTimeout(countdownTimeout);
            countdownTimeout = null;
        }
        $("#countdown-overlay").addClass("hidden");
        hideResultOverlay();
        versusEnded = false;
        disconnectMulti();
        opponentNickname = "";
        roomCode = "";
        
        isRunning = false;
        isGameOver = false;
        cpuIsGameOver = false;
        current = null;
        resetBoard();

        // 화면 크기 원복 및 P2 비활성화
        app.renderer.resize(singleAppW, appH);
        $("#game-container").css({ width: singleAppW + "px", height: appH + "px" });
        setP2Visible(false);
        
        $("#status").text("READY");
        $("#start-btn").text("Lobby");
        renderAll();
        
        $(".multi-wait-area").hide();
        $(".multi-form-area").hide();
        $(".solo-cpu-actions").show();
        $(".mode-btn").removeClass("active");
        $(".mode-btn[data-mode='solo']").addClass("active");
        gameMode = "solo";
        
        $("#lobby-overlay").show();
        $(".lobby-content").show();
        resetMultiLobbyForm();
    });

    $(document).on("keydown", function (e) {
        if ($("#multi-chat-input").is(":focus")) {
            return;
        }
        if (e.code === "ShiftLeft" || e.code === "ShiftRight" || e.code === "KeyC") {
            if (isRunning && !isGameOver && current) {
                tryHold();
                renderAll();
                e.preventDefault();
            }
            return;
        }
        if (!isRunning || isGameOver) return;
        if (e.code === "ArrowLeft") {
            move(-1);
            renderAll();
            e.preventDefault();
        } else if (e.code === "ArrowRight") {
            move(1);
            renderAll();
            e.preventDefault();
        } else if (e.code === "ArrowDown") {
            dropMs = SOFT_DROP_MS;
            softDropStep();
            renderAll();
            e.preventDefault();
        } else if (e.code === "ArrowUp") {
            rotate();
            renderAll();
            e.preventDefault();
        } else if (e.code === "Space") {
            hardDrop();
            renderAll();
            e.preventDefault();
        }
    });

    $(document).on("keyup", function (e) {
        if (e.code === "ArrowDown") dropMs = DROP_INTERVAL;
    });

    app.ticker.add(function () {
        if (isRunning && !isGameOver) {
            gameMs += app.ticker.elapsedMS;

            // Player 1 낙하 처리
            if (current) {
                dropElapsed += app.ticker.elapsedMS;
                if (dropElapsed >= dropMs) {
                    dropElapsed = 0;
                    softDropStep();
                }
            }

            // CPU AI 실행 처리
            if (gameMode === "cpu" && !cpuIsGameOver && cpuCurrent) {
                cpuAiElapsed += app.ticker.elapsedMS;
                if (cpuAiElapsed >= cpuAiTickMs) {
                    cpuAiElapsed = 0;
                    cpuExecuteMove();
                }
            }
        }
        renderAll();
    });

    $("#status").text("READY");
    renderAll();

    // --- 로비 UI 이벤트 바인딩 ---

    // 모드 선택 버튼 클릭
    $(".mode-btn").on("click", function () {
        $(".mode-btn").removeClass("active");
        $(this).addClass("active");

        const mode = $(this).attr("data-mode");
        if (gameMode === "multi" && mode !== "multi") {
            disconnectMulti();
            $(".multi-wait-area").hide();
        }
        gameMode = mode;

        if (mode === "multi") {
            $(".multi-form-area").show();
            $(".solo-cpu-actions").hide();
            resetMultiLobbyForm();
            connectMultiLobbyWatch();
        } else {
            $(".multi-form-area").hide();
            $(".solo-cpu-actions").show();
            resetMultiLobbyForm();
        }
    });

    // 로비에서 싱글/CPU 게임 시작
    $("#lobby-start-btn").on("click", function () {
        $(".lobby-content").hide();
        startGame();
    });

    $("#result-lobby-btn").on("click", function () {
        $("#start-btn").trigger("click");
    });

    // 멀티플레이 WebSocket 이벤트
    $("#create-room-btn").on("click", function () {
        const nickname = $("#nickname-input").val().trim();
        if (!nickname) {
            alert("닉네임을 입력해주세요.");
            return;
        }
        userNickname = nickname;
        gameMode = "multi";
        multiRole = "host";
        multiIsHostCreator = true;
        multiRoomReady = false;
        $("#create-room-btn").prop("disabled", true).text("방 생성 중...");
        $("#join-room-btn").prop("disabled", true).removeClass("join-pulse");
        $("#join-group-wrap").removeClass("join-ready");
        $("#multi-join-hint").addClass("hidden").removeClass("join-hint-active");
        $(".multi-wait-area").show();
        $(".wait-status").text("방을 생성하는 중...");
        connectMultiAndSend({ type: "CREATE_ROOM", nickname: userNickname });
    });

    $("#join-room-btn").on("click", function () {
        const nickname = $("#nickname-input").val().trim();
        if (!nickname) {
            alert("닉네임을 입력해주세요.");
            return;
        }
        if (multiIsHostCreator) {
            return;
        }
        userNickname = nickname;
        gameMode = "multi";
        multiRole = "guest";

        clearJoinRoomGuide();
        $("#join-room-btn").prop("disabled", true);
        $(".multi-wait-area").show();
        $(".wait-status").text("매칭 중...");
        connectMultiAndSend({
            type: "JOIN_ROOM",
            nickname: userNickname
        });
    });

    $("#cancel-match-btn").on("click", function () {
        disconnectMulti();
        opponentNickname = "";
        roomCode = "";
        $(".multi-wait-area").hide();
        $(".multi-form-area").show();
        resetMultiLobbyForm();
    });

    $("#multi-chat-send").on("click", function () {
        sendChatMessage();
    });

    $("#multi-chat-input").on("compositionstart", function () {
        chatImeComposing = true;
    });

    $("#multi-chat-input").on("compositionend", function () {
        chatImeComposing = false;
    });

    $("#multi-chat-input").on("keydown", function (e) {
        if (e.code !== "Enter") {
            return;
        }
        e.preventDefault();
        e.stopPropagation();
        if (e.isComposing || chatImeComposing || e.keyCode === 229) {
            return;
        }
    });

    $("#multi-chat-input").on("keyup", function (e) {
        if (e.code !== "Enter") {
            return;
        }
        if (e.isComposing || chatImeComposing) {
            return;
        }
        if (chatEnterSubmitLock) {
            return;
        }
        chatEnterSubmitLock = true;
        sendChatMessage();
        setTimeout(function () {
            chatEnterSubmitLock = false;
        }, CHAT_SEND_DEBOUNCE_MS);
    });
}
