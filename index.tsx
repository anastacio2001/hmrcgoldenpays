
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { markBuildHealthy, reloadForNewBuild } from './utils/staleBuild';

// Vite fires this when a lazy chunk from a previous deploy cannot be loaded.
window.addEventListener('vite:preloadError', (event) => {
  if (reloadForNewBuild()) event.preventDefault();
});

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error("Could not find root element");

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

// Let a future stale build trigger a fresh reload again.
window.setTimeout(markBuildHealthy, 10000);
