import Editor from './components/Editor';

export default function App() {
  const docId = new URLSearchParams(window.location.search).get('doc') || 'demo';

  return (
    <div style={{ padding: 20 }}>
      <h2>Realtime Collaborative Editor</h2>
      <Editor docId={docId} />
    </div>
  );
}
