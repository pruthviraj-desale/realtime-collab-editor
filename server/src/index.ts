import http from 'http';
import { Server, Socket } from 'socket.io';
import * as Y from 'yjs';

const server = http.createServer();

const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

/**
 * In-memory document store
 * Key = docId
 * Value = Y.Doc
 */
const docs = new Map<string, Y.Doc>();

/**
 * Track which document a socket is editing
 */
const socketDoc = new Map<string, string>();

io.on('connection', (socket: Socket) => {
  console.log('Client connected:', socket.id);

  // 🔹 Join document
  socket.on('join-doc', (docId: string) => {
    socket.join(docId);
    socketDoc.set(socket.id, docId);

    let doc = docs.get(docId);
    if (!doc) {
      doc = new Y.Doc();
      docs.set(docId, doc);
    }

    // Send full document state
    const state = Y.encodeStateAsUpdate(doc);
    socket.emit('sync-init', state);
  });

  // 🔹 Receive updates (REGISTERED ONCE)
  socket.on('sync-update', (update: Uint8Array) => {
    const docId = socketDoc.get(socket.id);
    if (!docId) return;

    const doc = docs.get(docId);
    if (!doc) return;

    // Apply update to server doc
    Y.applyUpdate(doc, update);

    // Broadcast ONLY to others
    socket.to(docId).emit('sync-update', update);
  });

  socket.on('disconnect', () => {
    socketDoc.delete(socket.id);
    console.log('Client disconnected:', socket.id);
  });
});

server.listen(3000, () => {
  console.log('✅ Socket.IO server running on http://localhost:3000');
});
