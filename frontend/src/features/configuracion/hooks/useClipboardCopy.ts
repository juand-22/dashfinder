import { useCallback, useState } from "react";

const COPY_FEEDBACK_MS = 1800;

/**
 * Copia texto al portapapeles y devuelve el último valor copiado (para el
 * feedback del botón) más el error si el navegador bloquea el acceso.
 */
export function useClipboardCopy() {
  const [copiedValue, setCopiedValue] = useState<string | null>(null);
  const [copyError, setCopyError] = useState<string | null>(null);

  const copy = useCallback(async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopyError(null);
      setCopiedValue(value);
      window.setTimeout(() => {
        setCopiedValue((current) => (current === value ? null : current));
      }, COPY_FEEDBACK_MS);
    } catch {
      setCopyError(
        "No se pudo copiar al portapapeles. Comprueba los permisos del navegador.",
      );
    }
  }, []);

  return { copiedValue, copyError, copy };
}
