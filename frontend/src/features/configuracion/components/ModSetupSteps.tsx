import { Button } from "../../../components";

/** Pasos para instalar y vincular el mod, compartidos por la card y el modal. */
export function ModSetupSteps() {
  return (
    <ol className="config-steps">
      <li className="config-step">
        <span className="config-step-index" aria-hidden="true">
          1
        </span>
        <div className="config-step-body">
          <strong>Descargá e instalá el mod</strong>
          <p>
            Necesitás el loader de Fabric y la Fabric API para tu versión de
            Minecraft. Después dejá el archivo del mod en la carpeta{" "}
            <code>mods</code>.
          </p>
          <div className="config-download">
            <Button className="config-download-button" disabled>
              <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M8 2v8m0 0 3-3M8 10 5 7M3 13h10" />
              </svg>
              Descargar mod
            </Button>
            <span className="config-download-note">Próximamente</span>
          </div>
        </div>
      </li>

      <li className="config-step">
        <span className="config-step-index" aria-hidden="true">
          2
        </span>
        <div className="config-step-body">
          <strong>Copiá tu API key</strong>
          <p>
            Es la credencial que vincula tu cuenta con el mod. La tenés en la
            tarjeta <em>Tu cuenta</em>, oculta detrás del botón mostrar.
          </p>
        </div>
      </li>

      <li className="config-step">
        <span className="config-step-index" aria-hidden="true">
          3
        </span>
        <div className="config-step-body">
          <strong>Vinculá el mod en el juego</strong>
          <p>
            Entrá a cualquier servidor y ejecutá el comando con tu API key. El
            mod te avisa por chat cuando queda activo.
          </p>
          <div className="config-command">
            <code>{"/dash key <tu-api-key>"}</code>
          </div>
          <p className="config-step-hint">
            Copialo desde la tarjeta <em>Comandos del mod</em>, que ya incluye tu
            API key.
          </p>
        </div>
      </li>
    </ol>
  );
}
