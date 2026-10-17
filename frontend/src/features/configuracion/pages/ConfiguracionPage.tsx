import { useRef, useState } from "react";
import { useAuth } from "../../auth/context/auth.context";
import { DashboardLayout } from "../../find/components/layout/DashboardLayout";
import { useModalAccessibility } from "../../find/hooks/useModalAccessibility";
import { ApiKeyCard } from "../components/ApiKeyCard";
import { ConfigCardModal } from "../components/ConfigCardModal";
import { ModCommandsCard } from "../components/ModCommandsCard";
import { ModSetupGuide } from "../components/ModSetupGuide";
import { useModCredentials } from "../hooks/useModCredentials";
import type { ConfigCardKind } from "../types";
import "../styles/ConfiguracionPage.css";

export function ConfiguracionPage() {
  const { user } = useAuth();
  const { state, reload, isRefreshing } = useModCredentials();
  const [openCard, setOpenCard] = useState<ConfigCardKind | null>(null);
  const cardModalOpener = useRef<HTMLElement | null>(null);

  useModalAccessibility(
    openCard !== null,
    () => setOpenCard(null),
    cardModalOpener,
  );

  function openCardModal(card: ConfigCardKind, opener: HTMLElement) {
    cardModalOpener.current = opener;
    setOpenCard(card);
  }

  return (
    <DashboardLayout username={user?.username} section="CONFIGURACIÓN">
      <div className="configuracion">
        <header className="results-heading configuracion-heading">
          <div>
            <span className="section-eyebrow">CONFIGURACIÓN</span>
            <h2>Tu cuenta</h2>
          </div>
        </header>

        {state.status === "loading" && (
          <section
            className="feature-placeholder config-feedback"
            aria-live="polite"
          >
            <span className="section-eyebrow">CONFIGURACIÓN</span>
            <div className="server-status-message" role="status">
              <span className="search-spinner" aria-hidden="true" />
              Cargando tu configuración...
            </div>
          </section>
        )}

        {state.status === "error" && (
          <section
            className="feature-placeholder config-feedback"
            role="alert"
          >
            <span className="section-eyebrow">CONFIGURACIÓN</span>
            <h1>No se pudo cargar</h1>
            <p>{state.message}</p>
            <div className="config-feedback-actions">
              <button
                className={`configuracion-refresh${
                  isRefreshing ? " is-refreshing" : ""
                }`}
                type="button"
                onClick={reload}
                disabled={isRefreshing}
                aria-busy={isRefreshing}
              >
                <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M13 8a5 5 0 1 1-1.5-3.5M13 2v3h-3" />
                </svg>
                {isRefreshing ? "Reintentando" : "Reintentar"}
              </button>
            </div>
          </section>
        )}

        {state.status === "ready" && (
          <div className="config-grid">
            <div className="config-column">
              <ApiKeyCard
                username={user?.username}
                apiKey={state.apiKey}
                modConfigurated={state.modConfigurated}
                onOpen={(opener) => openCardModal("account", opener)}
              />
              <ModCommandsCard
                apiKey={state.apiKey}
                onOpen={(opener) => openCardModal("commands", opener)}
              />
            </div>
            <ModSetupGuide
              modConfigurated={state.modConfigurated}
              onOpen={(opener) => openCardModal("setup", opener)}
            />
          </div>
        )}

        {openCard && state.status === "ready" && (
          <ConfigCardModal
            card={openCard}
            username={user?.username}
            apiKey={state.apiKey}
            modConfigurated={state.modConfigurated}
            onClose={() => setOpenCard(null)}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
