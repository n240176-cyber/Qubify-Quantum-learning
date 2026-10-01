import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Guard against benign ResizeObserver loop limit errors
if (typeof window !== 'undefined') {
  const isResizeError = (msg?: unknown) => {
    if (!msg) return false;
    const str = typeof msg === 'string' ? msg : ((msg as any).message || String(msg));
    return (
      str.includes('ResizeObserver loop completed with undelivered notifications') ||
      str.includes('ResizeObserver loop limit exceeded')
    );
  };

  window.addEventListener('error', (e) => {
    if (isResizeError(e.message) || (e.error && isResizeError(e.error.message))) {
      e.stopImmediatePropagation();
      e.preventDefault();
    }
  });

  window.addEventListener('unhandledrejection', (e) => {
    const reason = e?.reason;
    if (reason && isResizeError(reason.message || reason)) {
      e.stopImmediatePropagation();
      e.preventDefault();
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

