import { WebSocketServer } from 'ws';
import { setupWSConnection } from 'y-websocket/bin/utils.js';

const wss = new WebSocketServer({ port: 1234 });

wss.on('connection', (conn, req) => {
  setupWSConnection(conn, req);
});

console.log('✅ y-websocket server running on ws://localhost:1234');
