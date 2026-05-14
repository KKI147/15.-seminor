$(document).ready(function () {
    const COLS = 10;
    const ROWS = 20;
    const BLOCK_SIZE = 30;
    const DROP_INTERVAL = 650;
    const SOFT_DROP_INTERVAL = 45;
    const SCORE_PER_LINE = 100;
    const COLORS = [
        0x000000, // 0: empty
        0x00f5ff, // I
        0x2ecc71, // S
        0xe74c3c, // Z
        0x3498db, // J
        0xf39c12, // L
        0xf1c40f, // O
        0x9b59b6 // T
    ];
    const SHAPES = [
        [[1, 1, 1, 1]],
        [[0, 2, 2], [2, 2, 0]],
        [[3, 3, 0], [0, 3, 3]],
        [[4, 0, 0], [4, 4, 4]],
        [[0, 0, 5], [5, 5, 5]],
        [[6, 6], [6, 6]],
        [[0, 7, 0], [7, 7, 7]]
    ];

    const app = new PIXI.Application({
        width: COLS * BLOCK_SIZE,
        height: ROWS * BLOCK_SIZE,
        backgroundColor: 0x12151d,
        resolution: window.devicePixelRatio || 1
    });

    document.getElementById('game-container').appendChild(app.view);
    app.stage.sortableChildren = true;

    const boardGraphics = new PIXI.Graphics();
    const gridGraphics = new PIXI.Graphics();
    const activeGraphics = new PIXI.Graphics();
    const panelGraphics = new PIXI.Graphics();
    panelGraphics.zIndex = -1;
    panelGraphics.beginFill(0x0c0f14, 0.8);
    panelGraphics.drawRect(0, 0, COLS * BLOCK_SIZE, ROWS * BLOCK_SIZE);
    panelGraphics.endFill();
    app.stage.addChild(panelGraphics);
    app.stage.addChild(boardGraphics);
    app.stage.addChild(gridGraphics);
    app.stage.addChild(activeGraphics);

    const board = createBoard();
    let current = null;
    let isRunning = false;
    let isGameOver = false;
    let score = 0;
    let dropElapsed = 0;
    let dropMs = DROP_INTERVAL;

    function createBoard() {
        const matrix = [];
        for (let y = 0; y < ROWS; y++) {
            const row = [];
            for (let x = 0; x < COLS; x++) {
                row.push(0);
            }
            matrix.push(row);
        }
        return matrix;
    }

    function resetBoard() {
        for (let y = 0; y < ROWS; y++) {
            for (let x = 0; x < COLS; x++) {
                board[y][x] = 0;
            }
        }
    }

    function cloneMatrix(matrix) {
        const cloned = [];
        for (let y = 0; y < matrix.length; y++) {
            cloned.push(matrix[y].slice());
        }
        return cloned;
    }

    function rotateMatrixClockwise(matrix) {
        const h = matrix.length;
        const w = matrix[0].length;
        const rotated = [];
        for (let x = 0; x < w; x++) {
            const row = [];
            for (let y = h - 1; y >= 0; y--) {
                row.push(matrix[y][x]);
            }
            rotated.push(row);
        }
        return rotated;
    }

    function randomPiece() {
        const i = Math.floor(Math.random() * SHAPES.length);
        const shape = cloneMatrix(SHAPES[i]);
        const x = Math.floor((COLS - shape[0].length) / 2);
        return {
            x: x,
            y: 0,
            shape: shape
        };
    }

    function collides(piece, dx, dy, testShape) {
        const shape = testShape || piece.shape;
        for (let y = 0; y < shape.length; y++) {
            for (let x = 0; x < shape[y].length; x++) {
                if (shape[y][x] === 0) {
                    continue;
                }
                const nx = piece.x + x + dx;
                const ny = piece.y + y + dy;
                if (nx < 0 || nx >= COLS || ny >= ROWS) {
                    return true;
                }
                if (ny >= 0 && board[ny][nx] !== 0) {
                    return true;
                }
            }
        }
        return false;
    }

    function mergePiece(piece) {
        for (let y = 0; y < piece.shape.length; y++) {
            for (let x = 0; x < piece.shape[y].length; x++) {
                const value = piece.shape[y][x];
                if (value === 0) {
                    continue;
                }
                const by = piece.y + y;
                const bx = piece.x + x;
                if (by >= 0 && by < ROWS && bx >= 0 && bx < COLS) {
                    board[by][bx] = value;
                }
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
                const top = [];
                for (let i = 0; i < COLS; i++) {
                    top.push(0);
                }
                board.unshift(top);
                lines++;
                y++;
            }
        }
        if (lines > 0) {
            score = score + (lines * SCORE_PER_LINE);
            $('#score').text(score);
        }
    }

    function spawnPiece() {
        current = randomPiece();
        if (collides(current, 0, 0)) {
            endGame();
        }
    }

    function hardDrop() {
        if (!isRunning || isGameOver) {
            return;
        }
        while (!collides(current, 0, 1)) {
            current.y++;
        }
        lockCurrentPiece();
    }

    function move(dx) {
        if (!isRunning || isGameOver) {
            return;
        }
        if (!collides(current, dx, 0)) {
            current.x = current.x + dx;
        }
    }

    function rotate() {
        if (!isRunning || isGameOver) {
            return;
        }
        const rotated = rotateMatrixClockwise(current.shape);
        if (!collides(current, 0, 0, rotated)) {
            current.shape = rotated;
            return;
        }
        if (!collides(current, -1, 0, rotated)) {
            current.x = current.x - 1;
            current.shape = rotated;
            return;
        }
        if (!collides(current, 1, 0, rotated)) {
            current.x = current.x + 1;
            current.shape = rotated;
        }
    }

    function lockCurrentPiece() {
        mergePiece(current);
        clearLines();
        spawnPiece();
    }

    function softDropStep() {
        if (!isRunning || isGameOver) {
            return;
        }
        if (!collides(current, 0, 1)) {
            current.y = current.y + 1;
        } else {
            lockCurrentPiece();
        }
    }

    function drawCell(graphics, x, y, color) {
        graphics.beginFill(color, 1);
        graphics.drawRect(x * BLOCK_SIZE + 1, y * BLOCK_SIZE + 1, BLOCK_SIZE - 2, BLOCK_SIZE - 2);
        graphics.endFill();
    }

    function drawBoard() {
        boardGraphics.clear();
        for (let y = 0; y < ROWS; y++) {
            for (let x = 0; x < COLS; x++) {
                const value = board[y][x];
                if (value > 0) {
                    drawCell(boardGraphics, x, y, COLORS[value]);
                }
            }
        }
    }

    function drawCurrent() {
        activeGraphics.clear();
        if (!current) {
            return;
        }
        for (let y = 0; y < current.shape.length; y++) {
            for (let x = 0; x < current.shape[y].length; x++) {
                const value = current.shape[y][x];
                if (value === 0) {
                    continue;
                }
                const gx = current.x + x;
                const gy = current.y + y;
                if (gy >= 0) {
                    drawCell(activeGraphics, gx, gy, COLORS[value]);
                }
            }
        }
    }

    function drawGrid() {
        gridGraphics.clear();
        gridGraphics.lineStyle(1, 0x2a2f3a, 0.7);
        for (let i = 0; i <= COLS; i++) {
            gridGraphics.moveTo(i * BLOCK_SIZE, 0);
            gridGraphics.lineTo(i * BLOCK_SIZE, ROWS * BLOCK_SIZE);
        }
        for (let j = 0; j <= ROWS; j++) {
            gridGraphics.moveTo(0, j * BLOCK_SIZE);
            gridGraphics.lineTo(COLS * BLOCK_SIZE, j * BLOCK_SIZE);
        }
    }

    function renderAll() {
        drawBoard();
        drawCurrent();
        drawGrid();
    }

    function endGame() {
        isGameOver = true;
        isRunning = false;
        $('#status').text('GAME OVER');
        $('#start-btn').text('Restart');
    }

    function startGame() {
        resetBoard();
        score = 0;
        dropElapsed = 0;
        dropMs = DROP_INTERVAL;
        isGameOver = false;
        isRunning = true;
        $('#score').text(score);
        $('#status').text('RUNNING');
        $('#start-btn').text('Restart');
        spawnPiece();
        renderAll();
    }

    $('#start-btn').on('click', function () {
        startGame();
    });

    $(document).on('keydown', function (e) {
        if (!isRunning || isGameOver) {
            return;
        }
        if (e.key === 'ArrowLeft') {
            move(-1);
        } else if (e.key === 'ArrowRight') {
            move(1);
        } else if (e.key === 'ArrowDown') {
            dropMs = SOFT_DROP_INTERVAL;
            softDropStep();
        } else if (e.key === 'ArrowUp') {
            rotate();
        } else if (e.key === ' ') {
            hardDrop();
        }
    });

    $(document).on('keyup', function (e) {
        if (e.key === 'ArrowDown') {
            dropMs = DROP_INTERVAL;
        }
    });

    app.ticker.add(function () {
        if (isRunning && !isGameOver) {
            dropElapsed = dropElapsed + app.ticker.elapsedMS;
            if (dropElapsed >= dropMs) {
                dropElapsed = 0;
                softDropStep();
            }
        }
        renderAll();
    });

    renderAll();
});