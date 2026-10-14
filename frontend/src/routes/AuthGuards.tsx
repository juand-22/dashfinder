import { Navigate, Outlet } from "react-router-dom";
import { LoadingSnippet } from "../components/LoadingSnippet";
import { useAuth } from "../features/auth/context/auth.context";

function AuthLoading() {
  return <LoadingSnippet label="Cargando..." />;
}

function AuthCheckError() {
  const { retry } = useAuth();

  return (
    <main className="login-page">
      <section className="login-card" role="alert">
        <p>No se pudo verificar tu sesión. Comprueba tu conexión e inténtalo de nuevo.</p>
        <button className="auth-retry" type="button" onClick={retry}>
          Reintentar
        </button>
      </section>
    </main>
  );
}

export function RequireAuth() {
  const { status } = useAuth();

  if (status === "checking") return <AuthLoading />;
  if (status === "error") return <AuthCheckError />;
  if (status === "unauthenticated") return <Navigate to="/login" replace />;

  return <Outlet />;
}

export function GuestOnly() {
  const { status } = useAuth();

  if (status === "checking") return <AuthLoading />;
  if (status === "error") return <AuthCheckError />;
  if (status === "authenticated") return <Navigate to="/" replace />;

  return <Outlet />;
}
