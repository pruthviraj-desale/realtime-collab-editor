import Editor from './components/Editor';
import './styles/header.css';

export default function App() {
  const docId =
    new URLSearchParams(window.location.search).get('doc') || 'test';

  return (
    <>
      <header className="app-header">
        <div className="app-title">
          Realtime Collaborative Editor
        </div>
      </header>

      <Editor docId={docId} />
    </>
  );
}
