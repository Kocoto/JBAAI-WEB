// src/main.tsx

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./app/App.tsx";
import AppTheme from "./shared/theme/AppTheme.tsx";

// 1. Import AuthProvider
import { AuthProvider } from "./features/auth/context/AuthProvider.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppTheme>
        {/* 2. Bao bọc App bằng AuthProvider */}
        <AuthProvider>
          <App />
        </AuthProvider>
      </AppTheme>
    </BrowserRouter>
  </React.StrictMode>
);
