import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AppProvider } from "./context/AppContext.tsx";
import 'leaflet/dist/leaflet.css'
import { SocketProvider } from "./context/SocketContext.tsx";

export const authService ="https://zesto-auth.onrender.com";
export const restaurantService = "https://zesto-restaurant.onrender.com";
export const utilsSerive = "https://zesto-utils.onrender.com";
export const realTimeService = "https://zesto-realtime.onrender.com";
export const riderService = "https://zesto-rider.onrender.com";
export const adminService = "https://zesto-admin.onrender.com";
export const verificationService = "https://zesto-verification.onrender.com"

// export const authService = "http://localhost:5000";
// export const restaurantService = "http://localhost:5001";
// export const utilsSerive = "http://localhost:5002";
// export const realTimeService = "http://localhost:5004";
// export const riderService = "http://localhost:5005";
// export const adminService = "http://localhost:5006";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId="453932308328-sf59jeutapt0iv20isdgmtf9tgmfprrn.apps.googleusercontent.com">
      <AppProvider>
        <SocketProvider>
            <App/>
        </SocketProvider>
      </AppProvider>
    </GoogleOAuthProvider>
  </StrictMode>,
);
