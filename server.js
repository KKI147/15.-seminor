/**
 * Tetris EXTRA — Node.js 서버 (정적 파일 + WebSocket 멀티플레이)
 *
 * [이 파일의 역할]
 * 브라우저(script.js)가 열리는 HTML/CSS/JS를 제공하고,
 * 두 명이 같은 방에서 대전할 때 JSON 메시지를 중계(relay)합니다.
 * 게임 규칙(블록 이동, 라인 클리어 등)은 서버에 없고, 전부 클라이언트에서 처리합니다.
 *
 * [실행]
 * 로컬: npm install && npm start  → http://localhost:8765
 * 배포: Render/Railway 등에서 npm start (PORT 환경 변수 자동 적용)
 *
 * [전체 흐름 요약]
 * 1) HTTP: index.html, script.js 등 정적 파일 전송
 * 2) WebSocket: 클라이언트가 보낸 type별 메시지를 파싱 → 방(rooms) 상태 갱신 또는 상대에게 전달
 * 3) 방: host 1명 + guest 1명. guest 입장 시 MATCH_START를 양쪽에 보냄
 * 4) 게임 중: BOARD_SYNC / ATTACK / GAME_OVER / CHAT 은 보낸 사람 제외한 상대(peer)에게만 전달
 */
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');

// ---------------------------------------------------------------------------
// 설정 상수
// ---------------------------------------------------------------------------
const PORT = parseInt(process.env.PORT, 10) || 8765;
const ROOT_DIR = __dirname;  // 프로젝트 루트 = 정적 파일 기준 경로
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';  // 방 코드에 쓸 문자(혼동 문자 제외)

const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.otf': 'font/otf',
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav'
};

/** @type {import('ws').WebSocketServer} */
let wss;

/**
 * 메모리 상의 방 목록.
 * 키: 5자리 방 코드(대문자), 값: { host, guest, hostNick, guestNick }
 * DB 없음 — 서버 재시작 시 모든 방 정보는 사라집니다.
 */
const rooms = {};

// ---------------------------------------------------------------------------
// 방·소켓 유틸 (멀티플레이 핵심 헬퍼)
// ---------------------------------------------------------------------------

/** 5자리 랜덤 방 코드 생성 (이미 존재하면 CREATE_ROOM에서 다시 뽑음) */
function generateRoomCode() {
    let code = '';
    let i;
    for (i = 0; i < 5; i++) {
        code += CODE_CHARS.charAt(Math.floor(Math.random() * CODE_CHARS.length));
    }
    return code;
}

/** WebSocket이 열려 있을 때만 JSON 문자열로 전송 */
function sendJson(ws, data) {
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(data));
    }
}

/** 이 소켓이 host 또는 guest로 들어가 있는 방을 찾음. 없으면 null */
function getRoomBySocket(ws) {
    const keys = Object.keys(rooms);
    let i;
    for (i = 0; i < keys.length; i++) {
        const code = keys[i];
        const room = rooms[code];
        if (room.host === ws || room.guest === ws) {
            return { code: code, room: room };
        }
    }
    return null;
}

/**
 * 같은 방의 "상대"에게만 메시지 전달 (보낸 사람 senderWs 제외).
 * BOARD_SYNC, ATTACK, GAME_OVER, CHAT 등 게임·채팅 중계에 사용.
 */
function broadcastToPeer(roomCode, msg, senderWs) {
    const room = rooms[roomCode];
    if (!room) {
        return;
    }
    if (room.host && room.host !== senderWs) {
        sendJson(room.host, msg);
    }
    if (room.guest && room.guest !== senderWs) {
        sendJson(room.guest, msg);
    }
}

/**
 * 연결 종료·LEAVE_ROOM 시 호출.
 * 상대에게 OPPONENT_DISCONNECTED 알림 → 방 삭제 → 로비 대기자들에게 ROOM_CLOSED
 */
function cleanupSocket(ws) {
    const info = getRoomBySocket(ws);
    if (!info) {
        return;
    }
    const code = info.code;
    const room = info.room;
    const peer = room.host === ws ? room.guest : room.host;

    if (peer && peer.readyState === WebSocket.OPEN) {
        sendJson(peer, { type: 'OPPONENT_DISCONNECTED' });
    }

    delete rooms[code];
    broadcastRoomClosed();
}

/** guest 자리가 비어 있는 첫 번째 방 코드 (JOIN_ROOM에서 코드 미입력 시 사용) */
function findFirstOpenRoom() {
    const keys = Object.keys(rooms);
    let i;
    for (i = 0; i < keys.length; i++) {
        const code = keys[i];
        const room = rooms[code];
        if (room.host && !room.guest) {
            return code;
        }
    }
    return null;
}

/**
 * 방을 만든 직후: 아직 방에 없는 클라이언트(로비 감시 중)에게 ROOM_WAITING 브로드캐스트.
 * → script.js에서 [방 참여] 버튼 활성화 안내에 쓰임.
 */
function broadcastRoomWaiting(hostWs, hostNick) {
    wss.clients.forEach(function (client) {
        if (client !== hostWs && client.readyState === WebSocket.OPEN && !getRoomBySocket(client)) {
            sendJson(client, {
                type: 'ROOM_WAITING',
                hostNick: hostNick
            });
        }
    });
}

/** 방이 사라졌을 때 로비 대기자에게 ROOM_CLOSED (참여 버튼 비활성화 등) */
function broadcastRoomClosed() {
    wss.clients.forEach(function (client) {
        if (client.readyState === WebSocket.OPEN && !getRoomBySocket(client)) {
            sendJson(client, { type: 'ROOM_CLOSED' });
        }
    });
}

/** host·guest 모두 준비되면 양쪽에 MATCH_START → 클라이언트가 startGame() 호출 */
function startMatch(roomCode) {
    const room = rooms[roomCode];
    if (!room || !room.host || !room.guest) {
        return;
    }
    const payload = {
        type: 'MATCH_START',
        roomCode: roomCode,
        hostNick: room.hostNick,
        guestNick: room.guestNick
    };
    sendJson(room.host, payload);
    sendJson(room.guest, payload);
}

// ---------------------------------------------------------------------------
// HTTP 정적 파일 서빙 (게임 페이지 로드)
// ---------------------------------------------------------------------------

/** URL을 로컬 파일 경로로 변환. ../ 등 경로 탈취 차단 */
function resolveSafePath(urlPath) {
    let decoded = decodeURIComponent(urlPath.split('?')[0]);
    if (decoded === '/' || decoded === '') {
        decoded = '/index.html';
    }
    const relative = decoded.replace(/^\/+/, '').replace(/\.\./g, '');
    const full = path.normalize(path.join(ROOT_DIR, relative));
    if (full.indexOf(ROOT_DIR) !== 0) {
        return null;
    }
    return full;
}

function serveStatic(req, res) {
    const filePath = resolveSafePath(req.url || '/');
    if (!filePath) {
        res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Forbidden');
        return;
    }

    fs.stat(filePath, function (err, stat) {
        if (err || !stat.isFile()) {
            res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end('Not Found');
            return;
        }

        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';
        res.writeHead(200, { 'Content-Type': contentType });
        fs.createReadStream(filePath).pipe(res);
    });
}

/** /health → 배포 헬스체크, 그 외 → serveStatic */
function handleHttpRequest(req, res) {
    if (req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ ok: true, service: 'tetris-multi' }));
        return;
    }
    serveStatic(req, res);
}

// ---------------------------------------------------------------------------
// 서버 기동: HTTP + WebSocket 같은 포트
// ---------------------------------------------------------------------------
const httpServer = http.createServer(handleHttpRequest);
wss = new WebSocket.Server({ server: httpServer });

httpServer.listen(PORT, function () {
    console.log('Tetris server ready');
    console.log('  Game:  http://localhost:' + PORT);
    console.log('  WS:    ws://localhost:' + PORT + ' (same origin)');
});

// ---------------------------------------------------------------------------
// WebSocket: 클라이언트 메시지 라우팅
// script.js sendMultiMessage() ↔ 여기 ws.on('message') 가 쌍을 이룸
// ---------------------------------------------------------------------------
wss.on('connection', function (ws) {
    ws.on('message', function (raw) {
        let msg;
        try {
            msg = JSON.parse(String(raw));
        } catch (e) {
            sendJson(ws, { type: 'ERROR', message: '잘못된 메시지 형식입니다.' });
            return;
        }

        if (!msg || !msg.type) {
            sendJson(ws, { type: 'ERROR', message: 'type 필드가 필요합니다.' });
            return;
        }

        // --- 로비: 멀티 메뉴만 열었을 때 대기 방 목록 감시 ---
        if (msg.type === 'LOBBY_WATCH') {
            ws.lobbyWatch = true;
            const openCode = findFirstOpenRoom();
            if (openCode) {
                sendJson(ws, {
                    type: 'ROOM_WAITING',
                    hostNick: rooms[openCode].hostNick
                });
            }
            return;
        }

        // --- 방 만들기: host 등록 → ROOM_CREATED → 다른 사람에게 ROOM_WAITING ---
        if (msg.type === 'CREATE_ROOM') {
            let code = generateRoomCode();
            while (rooms[code]) {
                code = generateRoomCode();
            }
            const nick = (msg.nickname || 'Host').substring(0, 8);
            rooms[code] = {
                host: ws,
                guest: null,
                hostNick: nick,
                guestNick: ''
            };
            ws.roomCode = code;
            ws.role = 'host';
            sendJson(ws, { type: 'ROOM_CREATED', nickname: nick });
            broadcastRoomWaiting(ws, nick);
            return;
        }

        // --- 방 참여: guest 등록 → JOIN_OK / OPPONENT_JOINED → startMatch ---
        if (msg.type === 'JOIN_ROOM') {
            let code = String(msg.roomCode || '').toUpperCase();
            if (!code) {
                code = findFirstOpenRoom();
            }
            if (!code) {
                sendJson(ws, { type: 'ERROR', message: '참여할 수 있는 방이 없습니다. 방 만들기를 먼저 해 주세요.' });
                return;
            }
            const room = rooms[code];
            if (!room) {
                sendJson(ws, { type: 'ERROR', message: '방을 찾을 수 없습니다.' });
                return;
            }
            if (room.guest) {
                sendJson(ws, { type: 'ERROR', message: '방이 가득 찼습니다.' });
                return;
            }
            const nick = (msg.nickname || 'Guest').substring(0, 8);
            room.guest = ws;
            room.guestNick = nick;
            ws.roomCode = code;
            ws.role = 'guest';
            sendJson(ws, { type: 'JOIN_OK', roomCode: code, nickname: nick });
            sendJson(room.host, {
                type: 'OPPONENT_JOINED',
                nickname: nick,
                roomCode: code
            });
            startMatch(code);
            return;
        }

        if (msg.type === 'LEAVE_ROOM') {
            cleanupSocket(ws);
            return;
        }

        // --- 게임 중: 상대 보드·공격·게임오버 (서버는 중계만, 판정 없음) ---
        if (msg.type === 'BOARD_SYNC' || msg.type === 'ATTACK' || msg.type === 'GAME_OVER') {
            const info = getRoomBySocket(ws);
            if (!info) {
                return;
            }
            if (ws.role === 'host') {
                msg.nickname = info.room.hostNick;
            } else {
                msg.nickname = info.room.guestNick;
            }
            broadcastToPeer(info.code, msg, ws);
            return;
        }

        // --- 채팅: guest 없으면 CHAT_ACK delivered:false ---
        if (msg.type === 'CHAT') {
            const info = getRoomBySocket(ws);
            if (!info) {
                return;
            }
            let text = String(msg.text || '').replace(/\s+/g, ' ').trim();
            if (!text) {
                return;
            }
            if (text.length > 80) {
                text = text.substring(0, 80);
            }
            let nick = ws.role === 'host' ? info.room.hostNick : info.room.guestNick;
            if (!info.room.guest) {
                sendJson(ws, { type: 'CHAT_ACK', delivered: false, reason: 'no_peer' });
                return;
            }
            broadcastToPeer(info.code, {
                type: 'CHAT',
                nickname: nick,
                text: text
            }, ws);
            sendJson(ws, { type: 'CHAT_ACK', delivered: true });
            return;
        }
    });

    // 탭 닫기·네트워크 끊김 시에도 방 정리
    ws.on('close', function () {
        cleanupSocket(ws);
    });
});
