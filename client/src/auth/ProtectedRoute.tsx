import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();

  // on attend le contexte pour éviter les faux négatifs au tout début
  if (loading) {
    return (
      <div
        style={{
          padding: "2rem",
          color: "#fff",
          textAlign: "center",
          fontSize: "0.95rem",
        }}
      >
        Chargement de la session...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  // très important : Outlet ici
  return <Outlet />;
}
