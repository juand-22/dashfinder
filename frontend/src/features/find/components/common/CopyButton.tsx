type CopyButtonProps = {
  label: string;
  copied: boolean;
  onClick: () => void;
};

export function CopyButton({ label, copied, onClick }: CopyButtonProps) {
  return (
    <button
      className="copy-field-button"
      type="button"
      aria-label={copied ? `${label} copiado` : `Copiar ${label}`}
      title={copied ? "Copiado" : `Copiar ${label}`}
      onClick={onClick}
    >
      {copied ? (
        <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="m3 8.2 3.1 3.1L13 4.5" />
        </svg>
      ) : (
        <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <rect x="5.5" y="5.5" width="8" height="9" rx="1.5" />
          <path d="M10.5 3.5V3A1.5 1.5 0 0 0 9 1.5H3A1.5 1.5 0 0 0 1.5 3v7A1.5 1.5 0 0 0 3 11.5h.5" />
        </svg>
      )}
    </button>
  );
}
