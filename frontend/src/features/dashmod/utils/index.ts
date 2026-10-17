export const CONNECTED_WINDOW_MS = 3 * 60 * 1000;

export function isServerConnected(
  lastDateRequest: string | null | undefined,
  now: number,
) {
  if (!lastDateRequest) return false;

  const timestamp = new Date(lastDateRequest).getTime();
  if (Number.isNaN(timestamp)) return false;

  return now - timestamp < CONNECTED_WINDOW_MS;
}

export function formatRelativeTime(value: string, now: number) {
  const timestamp = new Date(value).getTime();
  if (Number.isNaN(timestamp)) return "—";

  const diff = now - timestamp;
  if (diff <= 0) return "Hace un momento";

  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return `Hace ${seconds} s`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `Hace ${minutes} min`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Hace ${hours} h`;

  const days = Math.floor(hours / 24);
  return `Hace ${days} d`;
}
