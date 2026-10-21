/** Estados que puede tener un intento en el historial de dehash. */
export type DehashStatus =
  | "DEHASHING"
  | "FOUND"
  | "NOT_FOUND"
  | "SERVER_ERROR"
  | "INVALID";

/** Un intento del historial: lo que devuelve `GET /api/dehash/results`. */
export type DehashAttempt = {
  id: number;
  hash: string;
  name: string | null;
  result: string | null;
  status: DehashStatus;
};

/** Cuántos intentos hay de cada estado en todo el historial. */
export type DehashCounts = Record<DehashStatus, number>;

/** Una página del historial: lo que devuelve `GET /api/dehash/results`. */
export type DehashPage = {
  /** Las filas de esta página, de la más nueva a la más vieja. */
  attempts: DehashAttempt[];
  /** Cuántas filas hay con el filtro aplicado, para saber cuántas páginas son. */
  total: number;
  /** El resumen del historial completo (sin el filtro), para los números de arriba. */
  counts: DehashCounts;
};

/** Lo mínimo para mandar algo a dehashear (un registro de jugador). */
export type DehashableRecord = {
  name: string | null;
  password: string | null;
  salt: string | null;
};

/** El aviso que queda en el registro después de apretar "Deshashear". */
export type DehashFeedback = {
  /** Qué registro lo disparó (el índice en la lista o el id del intento). */
  key: string;
  tone: "info" | "error";
  message: string;
};
