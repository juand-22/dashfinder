import { Link } from "react-router-dom";

export function ModNotConfigured() {
  return (
    <section
      className="feature-placeholder mod-not-configured"
      aria-labelledby="mod-not-configured-title"
    >
      <span className="section-eyebrow">MOD NO CONFIGURADO</span>
      <h1 id="mod-not-configured-title">Tu mod todavía no está configurado</h1>
      <p>
        Para empezar a recibir jugadores y actividad de tus servidores, primero
        debes configurar el mod con tu API key. Hasta entonces no podremos
        mostrar ningún dato.
      </p>
      <div className="mod-not-configured-actions">
        <Link className="mod-config-link" to="/configuracion">
          Ir a configuración
          <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M3 8h9m0 0-3.5-3.5M12 8l-3.5 3.5" />
          </svg>
        </Link>
      </div>
    </section>
  );
}
