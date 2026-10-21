import { useState } from "react";
import { createNickname, NicknameRequestError } from "../api/nicknames.api";
import "./SaveNicknameButton.css";

/** `idle` = se puede apretar, `saving` = guardando, `saved` = ya está en la lista. */
type SaveStatus = "idle" | "saving" | "saved";

type SaveNicknameButtonProps = {
  /** El nick que se guarda: el jugador de la tarjeta. */
  nickname: string | null;
  /** Texto del botón mientras todavía no está guardado. */
  label?: string;
};

function AddNickIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="6.2" cy="5.4" r="2.4" />
      <path d="M2.3 13.2a3.9 3.9 0 0 1 7.8 0" />
      <path d="M12.6 6v4.4M10.4 8.2h4.4" />
    </svg>
  );
}

function SavedIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="m3.4 8.5 3 3 6.2-7.1" />
    </svg>
  );
}

/**
 * Botón «Guardar nickname» de las tarjetas de jugador.
 *
 * Guarda el nick en la misma lista que administra la página *Dash nicknames*
 * (`POST /api/mod/nicknames`), que es la que después lee el mod para entrar a
 * los servidores sin premium con ese nombre.
 *
 * El estado se muestra en el propio botón (`Guardando...` / `Guardado`) y los
 * errores como un aviso abajo, sin abrir nada. Si el nick ya estaba guardado el
 * backend responde 409: para el usuario es lo mismo, así que queda `Guardado`.
 */
export function SaveNicknameButton({
  nickname,
  label = "Guardar nickname",
}: SaveNicknameButtonProps) {
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const clean = nickname?.trim() ?? "";

  if (!clean) return null;

  async function save() {
    if (status === "saving") return;

    setStatus("saving");
    setError(null);

    try {
      await createNickname(clean);
      setStatus("saved");
    } catch (saveError) {
      // 409: ya estaba guardado, que para el usuario es un final feliz.
      if (saveError instanceof NicknameRequestError && saveError.status === 409) {
        setStatus("saved");
        return;
      }

      setStatus("idle");
      setError(
        saveError instanceof NicknameRequestError
          ? saveError.message
          : "No se pudo guardar el nick.",
      );
    }
  }

  return (
    <>
      <button
        className={`nick-save is-${status}`}
        type="button"
        disabled={status !== "idle"}
        aria-busy={status === "saving"}
        title={`Guardar ${clean} para poder entrar con ese nick desde el mod`}
        onClick={() => void save()}
      >
        {status === "saved" ? <SavedIcon /> : <AddNickIcon />}
        {status === "saving"
          ? "Guardando..."
          : status === "saved"
            ? "Guardado"
            : label}
      </button>
      {error && (
        <p className="nick-save-message is-error" role="status">
          {error}
        </p>
      )}
    </>
  );
}

/**
 * Fila con el botón, para las tarjetas que no tienen una fila de acciones
 * propia (las de la grilla). `align="start"` la pega a la izquierda, que es lo
 * que va dentro de los modales.
 */
export function SaveNicknameRow({
  nickname,
  align = "end",
}: {
  nickname: string | null;
  align?: "start" | "end";
}) {
  if (!nickname?.trim()) return null;

  return (
    <div className={`nick-save-row${align === "start" ? " is-start" : ""}`}>
      <SaveNicknameButton nickname={nickname} />
    </div>
  );
}
