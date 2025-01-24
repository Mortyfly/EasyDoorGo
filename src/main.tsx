import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ErrorBoundary } from 'react-error-boundary';
import App from './App';
import { initializeApp } from '@/lib/utils/initialize';
import { ErrorFallback } from '@/components/ErrorFallback';
import './index.css';

const start = async () => {
  const root = document.getElementById('root');
  if (!root) throw new Error('Root element not found');

  try {
    await initializeApp();
    
    createRoot(root).render(
      <StrictMode>
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <App />
        </ErrorBoundary>
      </StrictMode>
    );
  } catch (error) {
    console.error('Failed to start app:', error);
    root.innerHTML = `
      <div class="flex items-center justify-center min-h-screen text-red-500">
        Une erreur est survenue lors du chargement de l'application
      </div>
    `;
  }
};

start();