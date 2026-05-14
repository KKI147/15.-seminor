const COLS = 10;
const ROWS = 20;
const BLOCK = 30;

const COLORS = [
    0x000000,
    0x4ecdc4,
    0xff6b6b,
    0xf7b801,
    0x7b61ff,
    0x2ecc71,
    0x3da5ff,
    0xff8c42,
];

const SHAPES = [
    [],
    [[1, 1, 1, 1]],
    [[2, 2], [2, 2]],
    [[0, 3, 0], [3, 3, 3]],
    [[4, 0, 0], [4, 4, 4]],
    [[0, 0, 5], [5, 5, 5]],
    [[0, 6, 6], [6, 6, 0]],
    [[7, 7, 0], [0, 7, 7]],
];

const scoreEl = document.getElementById("score");
const linesEl = document.getElementById("lines");
const levelEl = document.getElementById("level");
const statusEl = document.getElementById("status");

// Pixi 앱(캔버스 + 렌더러 + ticker)을 관리하는 핵심 객체.
const app = new PIXI.Application();

let board = createBoard();
let dropCounter = 0;
let lastTime = 0;
let score = 0;
let lines = 0;
let level = 1;
let gameOver = false;

const piece = {
    x: 3,
    y: 0,
    shape: null,
};

(async function init() {
    // v8에서는 init()으로 실제 렌더러를 비동기 초기화한다.
    await app.init({ width: COLS * BLOCK, height: ROWS * BLOCK, background: 0x0b1220, antialias: false });
    document.getElementById("game").appendChild(app.canvas);

    spawnPiece();
    draw();
    updateHud();
    // 매 프레임마다 tick 실행.
    app.ticker.add(tick);
})();

function createBoard() {
    return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
}

function randomShape() {
    const id = 1 + Math.floor(Math.random() * 7);
    return SHAPES[id].map((r) => [...r]);
}

function spawnPiece() {
    piece.shape = randomShape();
    piece.y = 0;
    piece.x = Math.floor((COLS - piece.shape[0].length) / 2);

    if (collide(piece.x, piece.y, piece.shape)) {
        gameOver = true;
        statusEl.textContent = "게임 오버 - 새로고침으로 다시 시작";
    }
}

function collide(nx, ny, shape) {
    // 보드 밖으로 나가거나 이미 쌓인 블록과 겹치면 충돌.
    for (let y = 0; y < shape.length; y++) {
        for (let x = 0; x < shape[y].length; x++) {
            const v = shape[y][x];
            if (!v) continue;
            const bx = nx + x;
            const by = ny + y;
            if (bx < 0 || bx >= COLS || by >= ROWS) return true;
            if (by >= 0 && board[by][bx] !== 0) return true;
        }
    }
    return false;
}

function merge() {
    for (let y = 0; y < piece.shape.length; y++) {
        for (let x = 0; x < piece.shape[y].length; x++) {
            const v = piece.shape[y][x];
            if (!v) continue;
            board[piece.y + y][piece.x + x] = v;
        }
    }
}

function clearLines() {
    let cleared = 0;
    for (let y = ROWS - 1; y >= 0; y--) {
        if (board[y].every((v) => v !== 0)) {
            board.splice(y, 1);
            board.unshift(Array(COLS).fill(0));
            cleared++;
            y++;
        }
    }

    if (cleared > 0) {
        // 테트리스 기본 점수 테이블(1~4줄) * 현재 레벨.
        lines += cleared;
        score += [0, 100, 300, 500, 800][cleared] * level;
        level = 1 + Math.floor(lines / 10);
        updateHud();
    }
}

function rotate(shape) {
    const h = shape.length;
    const w = shape[0].length;
    const out = Array.from({ length: w }, () => Array(h).fill(0));
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            out[x][h - 1 - y] = shape[y][x];
        }
    }
    return out;
}

function move(dx) {
    if (!collide(piece.x + dx, piece.y, piece.shape)) {
        piece.x += dx;
        draw();
    }
}

function softDrop() {
    if (!collide(piece.x, piece.y + 1, piece.shape)) {
        piece.y++;
        score += 1;
        updateHud();
    } else {
        lockPiece();
    }
    draw();
}

function hardDrop() {
    while (!collide(piece.x, piece.y + 1, piece.shape)) {
        piece.y++;
        score += 2;
    }
    lockPiece();
    draw();
}

function tryRotate() {
    const r = rotate(piece.shape);
    // 벽 근처 회전을 위해 간단한 wall-kick 오프셋 시도.
    const kicks = [0, -1, 1, -2, 2];
    for (const k of kicks) {
        if (!collide(piece.x + k, piece.y, r)) {
            piece.x += k;
            piece.shape = r;
            draw();
            return;
        }
    }
}

function lockPiece() {
    merge();
    clearLines();
    spawnPiece();
    updateHud();
}

function dropInterval() {
    return Math.max(90, 700 - (level - 1) * 60);
}

function tick() {
    if (gameOver) return;
    const now = performance.now();
    const delta = now - lastTime;
    lastTime = now;
    dropCounter += delta;

    if (dropCounter >= dropInterval()) {
        dropCounter = 0;
        if (!collide(piece.x, piece.y + 1, piece.shape)) {
            piece.y++;
        } else {
            lockPiece();
        }
        draw();
    }
}

function updateHud() {
    scoreEl.textContent = String(score);
    linesEl.textContent = String(lines);
    levelEl.textContent = String(level);
}

function drawCell(x, y, color) {
    // 각 칸을 Graphics로 그린 뒤 stage에 올린다.
    const g = new PIXI.Graphics();
    g.rect(x * BLOCK, y * BLOCK, BLOCK, BLOCK).fill(color);
    g.rect(x * BLOCK, y * BLOCK, BLOCK, BLOCK).stroke({ color: 0x101522, width: 1 });
    app.stage.addChild(g);
}

function draw() {
    // 매 프레임 전체를 다시 그리는 단순한 렌더 방식.
    app.stage.removeChildren();

    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            drawCell(x, y, board[y][x] ? COLORS[board[y][x]] : 0x0d1525);
        }
    }

    if (!gameOver) {
        for (let y = 0; y < piece.shape.length; y++) {
            for (let x = 0; x < piece.shape[y].length; x++) {
                const v = piece.shape[y][x];
                if (v) drawCell(piece.x + x, piece.y + y, COLORS[v]);
            }
        }
    }
}

document.addEventListener("keydown", (e) => {
    if (gameOver) return;

    // 입력은 게임 상태만 바꾸고, 화면 갱신은 각 액션 내부 draw()에서 처리.
    switch (e.code) {
        case "ArrowLeft":
            move(-1);
            break;
        case "ArrowRight":
            move(1);
            break;
        case "ArrowDown":
            softDrop();
            break;
        case "ArrowUp":
            tryRotate();
            break;
        case "Space":
            e.preventDefault();
            hardDrop();
            break;
        default:
            break;
    }
});