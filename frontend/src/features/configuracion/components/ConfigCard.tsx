import type { KeyboardEvent, MouseEvent, ReactNode } from "react";

type ConfigCardProps = {
  /** Id del título de la card que le da el nombre accesible. */
  labelledBy: string;
  /** Clase extra para variantes (ej. config-commands, config-setup). */
  className?: string;
  onOpen: (opener: HTMLElement) => void;
  children: ReactNode;
};

/**
 * Card de configuración clicable: abre el modal con el detalle. Ignora los
 * clics y las teclas que caen sobre controles internos (copiar, mostrar) para
 * no abrir el modal de rebote.
 */
export function ConfigCard({
  labelledBy,
  className,
  onOpen,
  children,
}: ConfigCardProps) {
  function handleClick(event: MouseEvent<HTMLElement>) {
    if (event.target instanceof HTMLElement && event.target.closest("button, a")) {
      return;
    }
    onOpen(event.currentTarget);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.target !== event.currentTarget) return;
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    onOpen(event.currentTarget);
  }

  return (
    <section
      className={`result-card config-card config-card--interactive${
        className ? ` ${className}` : ""
      }`}
      role="button"
      tabIndex={0}
      aria-haspopup="dialog"
      aria-labelledby={labelledBy}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      {children}
      <span className="config-card-more">
        Ver detalle
        <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M6.4 3.4 11 8l-4.6 4.6" />
        </svg>
      </span>
    </section>
  );
}
