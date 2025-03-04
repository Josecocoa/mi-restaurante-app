import React from "react";
import ReactDOM from "react-dom/client";
import "/Users/a/Desktop/vite_react_ts_app/my-vite-app/POS-AI/pos-system/src/index.css";  // 📌 IMPORTANTE: Importar Tailwind
import POSSystem from "./POSSystem";

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <POSSystem />
  </React.StrictMode>
);
