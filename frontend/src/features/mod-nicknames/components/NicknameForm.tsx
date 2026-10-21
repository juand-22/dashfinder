import type { FormEvent } from "react";

/** El aviso que aparece abajo del formulario. */
export type NicknameFormMessage = {
  tone: "info" | "error";
  text: string;
};

type NicknameFormProps = {
  value: string;
  isSaving: boolean;
  message: NicknameFormMessage | null;
  onValueChange: (value: string) => void;
  onSubmit: (nickname: string) => void;
};

export function NicknameForm({
  value,
  isSaving,
  message,
  onValueChange,
  onSubmit,
}: NicknameFormProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit(value);
  }

  return (
    <form className="modnick-form" onSubmit={handleSubmit}>
      <div className="modnick-input">
        <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <circle cx="10" cy="7.2" r="3.2" />
          <path d="M4.2 16.3c.6-2.9 3-4.6 5.8-4.6s5.2 1.7 5.8 4.6" />
        </svg>
        <input
          type="text"
          value={value}
          placeholder="nickname..."
          aria-label="Nick a guardar"
          autoComplete="off"
          spellCheck={false}
          maxLength={16}
          disabled={isSaving}
          onChange={(event) => onValueChange(event.target.value)}
        />
      </div>

      <button
        className="modnick-save"
        type="submit"
        disabled={isSaving || value.trim() === ""}
      >
        <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M8 3.2v9.6M3.2 8h9.6" />
        </svg>
        {isSaving ? "Guardando..." : "Guardar nick"}
      </button>

      {message && (
        <p className={`modnick-form-message is-${message.tone}`} role="status">
          {message.text}
        </p>
      )}
    </form>
  );
}
