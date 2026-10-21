import { useCallback, useState } from "react";
import { DehashRequestError, sendDehash } from "../api/dehash.api";
import type { DehashFeedback } from "../types";
import { buildDehashValue } from "../utils";

/** Lo que se le dice al usuario apenas aprieta "Deshashear". */
export const DEHASH_QUEUED_MESSAGE = "Dehasheando...";

type DehashSender = {
  feedback: DehashFeedback | null;
  send: (
    record: { name: string | null; password: string | null; salt: string | null },
    key: string,
  ) => void;
  clear: () => void;
};

/**
 * Manda un registro a dehashear sin bloquear la interfaz: el aviso aparece al
 * instante y la respuesta del backend (que puede tardar) solo se usa para
 * avisar si algo salió mal.
 */
export function useDehashSender(): DehashSender {
  const [feedback, setFeedback] = useState<DehashFeedback | null>(null);

  const send = useCallback<DehashSender["send"]>((record, key) => {
    const hash = buildDehashValue(record);

    if (hash === null) {
      setFeedback({
        key,
        tone: "error",
        message: "Ese registro no tiene contraseña para dehashear.",
      });
      return;
    }

    setFeedback({ key, tone: "info", message: DEHASH_QUEUED_MESSAGE });

    void sendDehash(hash, record.name).catch((error: unknown) => {
      setFeedback({
        key,
        tone: "error",
        message:
          error instanceof DehashRequestError
            ? error.message
            : "No se pudo mandar el hash a dehashear.",
      });
    });
  }, []);

  const clear = useCallback(() => setFeedback(null), []);

  return { feedback, send, clear };
}
