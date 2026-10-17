import { ConfigCard } from "./ConfigCard";
import { ModCommandsList } from "./ModCommandsList";

type ModCommandsCardProps = {
  apiKey: string | null;
  onOpen: (opener: HTMLElement) => void;
};

export function ModCommandsCard({ apiKey, onOpen }: ModCommandsCardProps) {
  return (
    <ConfigCard
      className="config-commands"
      labelledBy="config-commands-title"
      onOpen={onOpen}
    >
      <header className="result-card-header">
        <span className="server-avatar config-avatar" aria-hidden="true">
          <svg viewBox="0 0 20 20" fill="none">
            <rect x="2.5" y="4" width="15" height="12" rx="2.2" />
            <path d="m6.2 8.6 2 1.9-2 1.9M10.6 12.4h3.4" />
          </svg>
        </span>
        <div className="server-details">
          <h3 id="config-commands-title">Comandos del mod</h3>
          <span>Se ejecutan dentro del juego</span>
        </div>
      </header>

      <ModCommandsList apiKey={apiKey} />

      <p className="config-note">
        El comando de vinculación se copia con tu API key ya incluida.
      </p>
    </ConfigCard>
  );
}
