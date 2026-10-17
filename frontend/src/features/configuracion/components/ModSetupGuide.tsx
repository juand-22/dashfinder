import { ConfigCard } from "./ConfigCard";
import { ModSetupSteps } from "./ModSetupSteps";

type ModSetupGuideProps = {
  modConfigurated: boolean;
  onOpen: (opener: HTMLElement) => void;
};

export function ModSetupGuide({ modConfigurated, onOpen }: ModSetupGuideProps) {
  return (
    <ConfigCard
      className="config-setup"
      labelledBy="config-setup-title"
      onOpen={onOpen}
    >
      <header className="result-card-header">
        <span className="server-avatar config-avatar" aria-hidden="true">
          <svg viewBox="0 0 20 20" fill="none">
            <path d="M6.2 3.5h7.6l-1 5.1a2.8 2.8 0 0 1-5.6 0l-1-5.1Z" />
            <path d="M10 11.6v4.2M7.2 16.5h5.6" />
          </svg>
        </span>
        <div className="server-details">
          <h3 id="config-setup-title">Configurá el mod</h3>
          <span>Tres pasos para empezar a reportar</span>
        </div>
        <span
          className={`result-tag ${modConfigurated ? "is-plain" : "is-unknown"}`}
        >
          {modConfigurated ? "Vinculado" : "Sin vincular"}
        </span>
      </header>

      <ModSetupSteps />
    </ConfigCard>
  );
}
