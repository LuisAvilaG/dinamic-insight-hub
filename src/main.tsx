import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';

// =====================================================================================
// CORRECCIÓN DEFINITIVA: Importar estilos para react-grid-layout
// La causa raíz de la pantalla de carga infinita era una ruta de importación incorrecta
// para los archivos CSS de la librería. La ruta no debe empezar con '/node_modules'
// sino que debe ser una importación directa del paquete.
// =====================================================================================
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

// By wrapping the entire App in BrowserRouter, we ensure the routing context
// is created only once and is available to the entire component tree.
// This is the correct way to set up react-router-dom.
createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
