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
    host.appendChild(app.view);

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
            for (let x = 0; x < COLS; x++) board[y][x] = 0;
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

    function randomPiece() {
        const i = nextTypeFromBag();
        const shape = cloneMatrix(SHAPES[i]);
        const x = Math.floor((COLS - shape[0].length) / 2);
        return { x, y: 0, shape, type: i };
    }

    function collides(piece, dx, dy, testShape) {
        const shape = testShape || piece.shape;
        for (let y = 0; y < shape.length; y++) {
            for (let x = 0; x < shape[y].length; x++) {
                if (shape[y][x] === 0) continue;
                const nx = piece.x + x + dx;
                const ny = piece.y + y + dy;
                if (nx < 0 || nx >= COLS || ny >= ROWS) return true;
                if (ny >= 0 && board[ny][nx] !== 0) return true;
            }
        }
        return false;
    }

    function mergePiece(piece) {
        for (let y = 0; y < piece.shape.length; y++) {
            for (let x = 0; x < piece.shape[y].length; x++) {
                const value = piece.shape[y][x];
                if (value === 0) continue;
                const by = piece.y + y;
                const bx = piece.x + x;
                if (by >= 0 && by < ROWS && bx >= 0 && bx < COLS) board[by][bx] = value;
            }
        }
    }

    function clearLines() {
        let lines = 0;
        for (let y = ROWS - 1; y >= 0; y--) {
            let filled = true;
            for (let x = 0; x < COLS; x++) {
                if (board[y][x] === 0) {
                    filled = false;
                    break;
                }
            }
            if (filled) {
                board.splice(y, 1);
                board.unshift(Array(COLS).fill(0));
                lines++;
                y++;
            }
        }
        if (lines > 0) {
            score += lines * SCORE_PER_LINE;
            totalLines += lines;
            $("#score").text(score);
        }
    }

    function spawnFromShape(shape, type) {
        const s = cloneMatrix(shape);
        return {
            x: Math.floor((COLS - s[0].length) / 2),
            y: 0,
            shape: s,
            type,
        };
    }

    function spawnPiece() {
        current = randomPiece();
        piecesCount++;
        if (collides(current, 0, 0)) endGame();
    }

    function hardDrop() {
        if (!isRunning || isGameOver || !current) return;
        while (!collides(current, 0, 1)) current.y++;
        lockCurrentPiece();
    }

    function move(dx) {
        if (!isRunning || isGameOver || !current) return;
        if (!collides(current, dx, 0)) current.x += dx;
    }

    function rotate() {
        if (!isRunning || isGameOver || !current) return;
        const rotated = rotateMatrixClockwise(current.shape);
        if (!collides(current, 0, 0, rotated)) {
            current.shape = rotated;
            return;
        }
        if (!collides(current, -1, 0, rotated)) {
            current.x -= 1;
            current.shape = rotated;
            return;
        }
        if (!collides(current, 1, 0, rotated)) {
            current.x += 1;
            current.shape = rotated;
        }
    }

    function lockCurrentPiece() {
        mergePiece(current);
        clearLines();
        canHold = true;
        spawnPiece();
    }

    function softDropStep() {
        if (!isRunning || isGameOver || !current) return;
        if (!collides(current, 0, 1)) current.y += 1;
        else lockCurrentPiece();
    }

    function ghostDy() {
        if (!current) return 0;
        let dy = 0;
        while (!collides(current, 0, dy + 1)) dy++;
        return dy;
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
        updateStats();
    }

    function endGame() {
        isGameOver = true;
        isRunning = false;
        $("#status").text("GAME OVER");
        $("#start-btn").text("Restart");
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

    function startGame() {
        resetBoard();
        bag = [];
        hold = null;
        canHold = true;
        score = 0;
        dropElapsed = 0;
        dropMs = DROP_INTERVAL;
        isGameOver = false;
        isRunning = true;
        piecesCount = 0;
        totalLines = 0;
        gameMs = 0;
        $("#score").text(score);
        $("#status").text("RUNNING");
        $("#start-btn").text("Restart");
        spawnPiece();
        renderAll();
    }

    $("#start-btn").on("click", function () {
        startGame();
    });

    $(document).on("keydown", function (e) {
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
        if (isRunning && !isGameOver && current) {
            dropElapsed += app.ticker.elapsedMS;
            gameMs += app.ticker.elapsedMS;
            if (dropElapsed >= dropMs) {
                dropElapsed = 0;
                softDropStep();
            }
        }
        renderAll();
    });

    $("#status").text("READY");
    renderAll();
}
