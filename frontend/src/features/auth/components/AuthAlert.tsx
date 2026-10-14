import "./AuthAlert.css";

export type AuthAlertType = "invalid-credentials" | "server-error";

type AuthAlertProps = {
  type: AuthAlertType;
  onDismiss: () => void;
};

const messages: Record<AuthAlertType, string> = {
  "invalid-credentials": "Usuario o contraseña incorrectos. Verifica tus datos e inténtalo de nuevo.",
  "server-error": "Ocurrió un error en el servidor. Inténtalo de nuevo más tarde.",
};

export function AuthAlert({ type, onDismiss }: AuthAlertProps) {
  return (
    <div className={`auth-alert auth-alert--${type}`} role="alert">
      <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <circle cx="10" cy="10" r="7.25" />
        <path d="M10 6v4.5m0 3h.01" />
      </svg>
      <span>{messages[type]}</span>
      <button
        className="auth-alert__dismiss"
        type="button"
        onClick={onDismiss}
        aria-label="Cerrar alerta"
      >
        <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="m5 5 10 10M15 5 5 15" />
        </svg>
      </button>
    </div>
  );
}
