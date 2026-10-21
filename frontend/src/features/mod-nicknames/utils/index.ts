const savedDateFormatter = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

/** La fecha en que se guardó el nick, corta (`19/10/2026`). Vacío si no se pudo leer. */
export function formatSavedDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return savedDateFormatter.format(date);
}
