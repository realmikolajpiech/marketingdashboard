import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { AuthProvider } from "./lib/auth.tsx";
import { isSupabaseConfigured, loadRuntimeConfig } from "./lib/config.ts";
import ConfigErrorPage from "./components/ConfigErrorPage.tsx";
import "./index.css";

async function bootstrap() {
  const root = document.getElementById("root");
  if (!root) return;

  await loadRuntimeConfig();

  if (!isSupabaseConfigured()) {
    createRoot(root).render(
      <StrictMode>
        <ConfigErrorPage />
      </StrictMode>
    );
    return;
  }

  createRoot(root).render(
    <StrictMode>
      <AuthProvider>
        <App />
      </AuthProvider>
    </StrictMode>
  );
}

void bootstrap();
