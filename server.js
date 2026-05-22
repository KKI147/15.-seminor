/**
 * Tetris EXTRA — 정적 파일 + WebSocket 멀티플레이 (단일 포트)
 * 로컬: npm install && npm start  → http://localhost:8765
 * 배포: Render/Railway 등에서 npm start (PORT 환경 변수 자동 적용)
 */
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');

const PORT = parseInt(process.env.PORT, 10) || 8765;
const ROOT_DIR = __dirname;
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

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

/** @type {Record<string, { host: import('ws').WebSocket, guest: import('ws').WebSocket|null, hostNick: string, guestNick: string }>} */
const rooms = {};

function generateRoomCode() {
    let code = '';
    let i;
    for (i = 0; i < 5; i++) {
        code += CODE_CHARS.charAt(Math.floor(Math.random() * CODE_CHARS.length));
    }
    return code;
}

function sendJson(ws, data) {
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(data));
    }
}

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

function broadcastRoomClosed() {
    wss.clients.forEach(function (client) {
        if (client.readyState === WebSocket.OPEN && !getRoomBySocket(client)) {
            sendJson(client, { type: 'ROOM_CLOSED' });
        }
    });
}

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

function handleHttpRequest(req, res) {
    if (req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ ok: true, service: 'tetris-multi' }));
        return;
    }
    serveStatic(req, res);
}

const httpServer = http.createServer(handleHttpRequest);
wss = new WebSocket.Server({ server: httpServer });

httpServer.listen(PORT, function () {
    console.log('Tetris server ready');
    console.log('  Game:  http://localhost:' + PORT);
    console.log('  WS:    ws://localhost:' + PORT + ' (same origin)');
});

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

    ws.on('close', function () {
        cleanupSocket(ws);
    });
});
