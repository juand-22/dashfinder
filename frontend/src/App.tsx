import { Outlet } from "react-router-dom";
import { AuthProvider } from "./features/auth/context/auth.context";

export default function App() {
  return (
    <AuthProvider>
      <div className="app-layout">
        <Outlet />
      </div>
    </AuthProvider>
  )
}