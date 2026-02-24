import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AppProvider } from "./context/AppContext.tsx";

export const authService = "http://localhost:5000";
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId="453932308328-sf59jeutapt0iv20isdgmtf9tgmfprrn.apps.googleusercontent.com">
      <AppProvider>
        <App/>
      </AppProvider>
    </GoogleOAuthProvider>
  </StrictMode>,
);
