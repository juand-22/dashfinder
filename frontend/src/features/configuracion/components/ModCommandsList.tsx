import { CopyButton } from "../../find/components/common/CopyButton";
import { useClipboardCopy } from "../hooks/useClipboardCopy";

type ModCommandsListProps = {
  apiKey: string | null;
};

type ModCommand = {
  /** Lo que se copia. */
  value: string;
  /** Lo que se muestra en pantalla. */
  label: string;
  description: string;
};

/** Lista de comandos del mod con su botón de copiado, compartida por la card y el modal. */
export function ModCommandsList({ apiKey }: ModCommandsListProps) {
  const { copiedValue, copyError, copy } = useClipboardCopy();

  const commands: ModCommand[] = [
    {
      value: apiKey ? `/dash key ${apiKey}` : "/dash key <tu-api-key>",
      label: "/dash key <tu-api-key>",
      description: "Vincula el mod con tu API key.",
    },
    {
      value: "/dash status",
      label: "/dash status",
      description: "Muestra si el mod está activo en el juego.",
    },
    {
      value: "/dash clear",
      label: "/dash clear",
      description: "Borra la API key guardada y desvincula el mod.",
    },
  ];

  return (
    <>
      <ul className="config-command-list">
        {commands.map((item) => (
          <li className="config-command-item" key={item.label}>
            <span className="config-command-info">
              <code>{item.label}</code>
              <span>{item.description}</span>
            </span>
            <CopyButton
              label={item.label}
              copied={copiedValue === item.value}
              onClick={() => void copy(item.value)}
            />
          </li>
        ))}
      </ul>

      {copyError && (
        <p className="config-error" role="alert">
          {copyError}
        </p>
      )}
    </>
  );
}
