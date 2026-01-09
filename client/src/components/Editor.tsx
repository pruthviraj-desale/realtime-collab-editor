import { useEffect, useRef } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { QuillBinding } from 'y-quill';

import '../styles/a4.css';
// cursor styles
import '../styles/cursors.css';

// quill cursors
import QuillCursors from 'quill-cursors';
Quill.register('modules/cursors', QuillCursors);

type Props = {
  docId: string;
};

/* ---------- helpers (stable identity) ---------- */
function getOrCreateUserId(): string {
  let id = localStorage.getItem('userId');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('userId', id);
  }
  return id;
}

function colorFromUserId(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 70%, 60%)`;
}

export default function Editor({ docId }: Props) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const quillRef = useRef<Quill | null>(null);

  useEffect(() => {
    if (!editorRef.current || quillRef.current) return;

    const container = editorRef.current;
    container.innerHTML = '';

    /* ---------- Quill ---------- */
    const quill = new Quill(container, {
      theme: 'snow',
      modules: {
        cursors: true,
        toolbar: [
          [{ header: [1, 2, 3, false] }],
          ['bold', 'italic', 'underline', 'strike'],
          [{ list: 'ordered' }, { list: 'bullet' }],
          ['link', 'image'],
          ['clean']
        ]
      }
    });

    quillRef.current = quill;

    /* ---------- Yjs ---------- */
    const ydoc = new Y.Doc();
    const ytext = ydoc.getText('quill');

    /* ---------- WebSocket Provider ---------- */
    const provider = new WebsocketProvider(
      'ws://localhost:1234',
      docId,
      ydoc
    );

    /* ---------- Awareness ---------- */
    const awareness = provider.awareness;

    const userId = getOrCreateUserId();

    const userName =
      localStorage.getItem('username') ?? 'User';

    localStorage.setItem('username', userName);

    const userColor = colorFromUserId(userId);

    awareness.setLocalStateField('user', {
      id: userId,
      name: userName,
      color: userColor
    });

    /* ---------- Binding ---------- */
    const binding = new QuillBinding(ytext, quill, awareness);

    /* ---------- Cleanup ---------- */
    return () => {
      binding.destroy();
      provider.destroy();
      ydoc.destroy();
      quillRef.current = null;
      container.innerHTML = '';
    };
  }, [docId]);

  return (
    <div className="editor-wrapper">
      <div className="a4-page">
        <div ref={editorRef} />
      </div>
    </div>
  );

}
