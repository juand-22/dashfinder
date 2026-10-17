export const minecraftUsernamePattern = /^[a-zA-Z0-9_]{3,16}$/;

export function formatMinecraftUuid(id: string) {
  return `${id.slice(0, 8)}-${id.slice(8, 12)}-${id.slice(12, 16)}-${id.slice(16, 20)}-${id.slice(20)}`;
}
