
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from './contexts/AuthContext.tsx';

// Importaciones necesarias para AG Grid
import { ModuleRegistry } from 'ag-grid-community';
// FIX: Using the correct singular 'AllCommunityModule' as recommended by the AG Grid error message.
import { AllCommunityModule } from 'ag-grid-community';

// Estilos para react-grid-layout
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

// Registrar los módulos de AG Grid
ModuleRegistry.registerModules([AllCommunityModule]);

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
