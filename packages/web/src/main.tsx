import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { TRPCProvider } from './trpc';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TRPCProvider>
      <App />
    </TRPCProvider>
  </StrictMode>
);
