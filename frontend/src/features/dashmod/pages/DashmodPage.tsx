import { useRef, useState } from "react";
import { useAuth } from "../../auth/context/auth.context";
import { DashboardLayout } from "../../find/components/layout/DashboardLayout";
import { useModalAccessibility } from "../../find/hooks/useModalAccessibility";
import { useServerStatus } from "../../find/hooks/useServerStatus";
import { ModFeedback } from "../components/ModFeedback";
import { ModNotConfigured } from "../components/ModNotConfigured";
import { PlayerModal } from "../components/PlayerModal";
import { PlayersGrid } from "../components/PlayersGrid";
import { ServerModal } from "../components/ServerModal";
import { ServerSummary } from "../components/ServerSummary";
import { useModStatus } from "../hooks/useModStatus";
import { useNow } from "../hooks/useNow";
import type { ModPlayer } from "../types";
import { stripServerPort } from "../../../utils/server-address";
import "../styles/DashmodPage.css";

export function DashmodPage() {
  const { user } = useAuth();
  const { state, reload, isRefreshing } = useModStatus();
  const now = useNow(15000);
  const [isServerModalOpen, setIsServerModalOpen] = useState(false);
  const serverModalOpener = useRef<HTMLElement | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<ModPlayer | null>(null);
  const playerModalOpener = useRef<HTMLElement | null>(null);
  const isConfigured = state.status === "configured";

  const activity = state.status === "configured" ? state.activity : null;
  const serverip = activity?.serverip.trim() ?? "";
  const serverStatus = useServerStatus(
    serverip ? stripServerPort(serverip) : "",
  );
  const serverIcon =
    serverStatus?.status === "loaded" ? serverStatus.server.icon : null;

  useModalAccessibility(
    isServerModalOpen,
    () => setIsServerModalOpen(false),
    serverModalOpener,
  );

  useModalAccessibility(
    selectedPlayer !== null,
    () => setSelectedPlayer(null),
    playerModalOpener,
  );

  function openServerModal(opener: HTMLElement) {
    serverModalOpener.current = opener;
    setIsServerModalOpen(true);
  }

  function openPlayerModal(player: ModPlayer, opener: HTMLElement) {
    playerModalOpener.current = opener;
    setSelectedPlayer(player);
  }

  return (
    <DashboardLayout username={user?.username} section="DASHMOD">
      <div className="dashmod">
        <header className="results-heading dashmod-heading">
          <div>
            <span className="section-eyebrow">DASHMOD</span>
            <h2>Estado del mod</h2>
          </div>
          {isConfigured && (
            <button
              className={`dashmod-refresh${
                isRefreshing ? " is-refreshing" : ""
              }`}
              type="button"
              onClick={reload}
              disabled={isRefreshing}
              aria-busy={isRefreshing}
              aria-label="Actualizar el estado del mod"
            >
              <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M13 8a5 5 0 1 1-1.5-3.5M13 2v3h-3" />
              </svg>
              {isRefreshing ? "Actualizando" : "Actualizar"}
            </button>
          )}
        </header>

        {state.status === "loading" && <ModFeedback variant="loading" />}

        {state.status === "error" && (
          <ModFeedback
            variant="error"
            message={state.message}
            onRetry={reload}
          />
        )}

        {state.status === "not-configured" && <ModNotConfigured />}

        {isConfigured && (
          <>
            <ServerSummary
              key={state.activity?.lastDateRequest ?? "sin-actividad"}
              activity={state.activity}
              now={now}
              serverIcon={serverIcon}
              onOpen={openServerModal}
            />
            <PlayersGrid
              players={state.activity?.lastPlayers ?? []}
              onOpenPlayer={openPlayerModal}
            />
          </>
        )}
      </div>

      {isServerModalOpen && isConfigured && (
        <ServerModal
          activity={state.activity}
          serverStatus={serverStatus}
          now={now}
          onClose={() => setIsServerModalOpen(false)}
        />
      )}

      {selectedPlayer && (
        <PlayerModal
          key={selectedPlayer.name}
          playerName={selectedPlayer.name}
          onClose={() => setSelectedPlayer(null)}
        />
      )}
    </DashboardLayout>
  );
}
