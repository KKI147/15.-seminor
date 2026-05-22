/**
 * Tetris EXTRA WebSocket 멀티플레이 서버
 * 실행: npm install && npm run server  (기본 포트 8765)
 */
'use strict';

const WebSocket = require('ws');

const PORT = 8765;
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

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

const wss = new WebSocket.Server({ port: PORT });

console.log('Tetris WebSocket server listening on ws://localhost:' + PORT);

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
