import React from 'react';
import ReactDOM from 'react-dom/client';
import POSSystem from './POSSystem';  // Asegúrate de que la ruta sea correcta
import './index.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <POSSystem />
  </React.StrictMode>
);
