import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, TextInput } from "../../../components";
import { AuthAlert, type AuthAlertType } from "../components/AuthAlert";
import { AuthRequestError, register } from "../auth.api";
import { useAuth } from "../context/auth.context";
import "./LoginPage.css";

export function RegisterPage() {
  const navigate = useNavigate();
  const { setAuthenticatedUser } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [registerError, setRegisterError] = useState<AuthAlertType | null>(null);
  const [alertAnimationKey, setAlertAnimationKey] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function showRegisterError(error: AuthAlertType | null) {
    setRegisterError(error);
    if (error) setAlertAnimationKey((key) => key + 1);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setRegisterError(null);

    const formData = new FormData(event.currentTarget);
    const username = String(formData.get("username") ?? "");
    const password = String(formData.get("password") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");

    if (password !== confirmPassword) {
      showRegisterError("password-mismatch");
      return;
    }

    setIsSubmitting(true);
    try {
      const user = await register({ username, password });
      setAuthenticatedUser(user);
      navigate("/");
    } catch (error) {
      showRegisterError(
        error instanceof AuthRequestError ? error.alertType : "server-error",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-card" aria-labelledby="register-title">
        <Link className="login-brand" to="/" aria-label="Dashfinder, inicio">
          <span className="login-brand-mark" aria-hidden="true">
            <svg viewBox="0 0 32 32" fill="none">
              <path d="M7 24.5 13.4 8l4.2 10.1 2.3-5.6L25 24.5" />
              <circle cx="23.5" cy="8.5" r="2.5" />
            </svg>
          </span>
          <span>dashfinder</span>
        </Link>

        <div className="login-heading">
          <span className="login-kicker">EMPIEZA TU RECORRIDO</span>
          <h1 id="register-title">Crea tu cuenta</h1>
          <p>Regístrate para comenzar a usar Dashfinder.</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {registerError && (
            <AuthAlert
              key={alertAnimationKey}
              type={registerError}
              onDismiss={() => setRegisterError(null)}
            />
          )}

          <label htmlFor="register-username">Usuario</label>
          <TextInput
            id="register-username"
            name="username"
            type="text"
            placeholder="Elige un nombre de usuario"
            autoComplete="username"
            minLength={3}
            maxLength={30}
            required
            startAdornment={
              <svg viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="6.5" r="3" />
                <path d="M3.8 17a6.2 6.2 0 0 1 12.4 0" />
              </svg>
            }
          />

          <div className="login-password-label">
            <label htmlFor="register-password">Contraseña</label>
          </div>
          <TextInput
            id="register-password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Mínimo 8 caracteres"
            autoComplete="new-password"
            minLength={8}
            maxLength={72}
            required
            startAdornment={
              <svg viewBox="0 0 20 20" fill="none">
                <rect x="3.5" y="8.5" width="13" height="9" rx="2" />
                <path d="M6.5 8.5V6a3.5 3.5 0 0 1 7 0v2.5M10 12v2" />
              </svg>
            }
            endAdornment={
              <button
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword ? (
                  <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                    <path d="M2 2 18 18M8.6 8.7a2 2 0 0 0 2.7 2.7" />
                    <path d="M7.2 4.2A8.7 8.7 0 0 1 10 3.7c4.5 0 7.5 4.3 8 5.2a1.9 1.9 0 0 1 0 1.8 12 12 0 0 1-2.4 2.7M5.1 5.2a12.3 12.3 0 0 0-3.1 3.7 1.9 1.9 0 0 0 0 1.8c.5.9 3.5 5.2 8 5.2a8.7 8.7 0 0 0 2.8-.5" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                    <path d="M2 10s2.9-5.3 8-5.3 8 5.3 8 5.3-2.9 5.3-8 5.3S2 10 2 10Z" />
                    <circle cx="10" cy="10" r="2.2" />
                  </svg>
                )}
              </button>
            }
          />

          <div className="login-password-label">
            <label htmlFor="register-confirm-password">Confirmar contraseña</label>
          </div>
          <TextInput
            id="register-confirm-password"
            name="confirmPassword"
            type={showConfirmation ? "text" : "password"}
            placeholder="Repite tu contraseña"
            autoComplete="new-password"
            minLength={8}
            maxLength={72}
            required
            startAdornment={
              <svg viewBox="0 0 20 20" fill="none">
                <rect x="3.5" y="8.5" width="13" height="9" rx="2" />
                <path d="M6.5 8.5V6a3.5 3.5 0 0 1 7 0v2.5M10 12v2" />
              </svg>
            }
            endAdornment={
              <button
                type="button"
                onClick={() => setShowConfirmation((visible) => !visible)}
                aria-label={showConfirmation ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showConfirmation ? (
                  <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                    <path d="M2 2 18 18M8.6 8.7a2 2 0 0 0 2.7 2.7" />
                    <path d="M7.2 4.2A8.7 8.7 0 0 1 10 3.7c4.5 0 7.5 4.3 8 5.2a1.9 1.9 0 0 1 0 1.8 12 12 0 0 1-2.4 2.7M5.1 5.2a12.3 12.3 0 0 0-3.1 3.7 1.9 1.9 0 0 0 0 1.8c.5.9 3.5 5.2 8 5.2a8.7 8.7 0 0 0 2.8-.5" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                    <path d="M2 10s2.9-5.3 8-5.3 8 5.3 8 5.3-2.9 5.3-8 5.3S2 10 2 10Z" />
                    <circle cx="10" cy="10" r="2.2" />
                  </svg>
                )}
              </button>
            }
          />

          <Button type="submit" disabled={isSubmitting}>
            <span>{isSubmitting ? "Creando cuenta..." : "Crear mi cuenta"}</span>
            <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M4 10h12m-5-5 5 5-5 5" />
            </svg>
          </Button>
        </form>

        <p className="login-security">
          <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M8 1.8 13 4v3.7c0 3.2-2.1 5.4-5 6.5-2.9-1.1-5-3.3-5-6.5V4l5-2.2Z" />
            <path d="m5.8 7.8 1.5 1.5 3-3" />
          </svg>
          Tus datos están protegidos y siempre son tuyos.
        </p>
        <p className="auth-switch">
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </p>
      </section>
    </main>
  );
}
