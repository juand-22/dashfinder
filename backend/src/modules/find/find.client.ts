import type {
  IpCountry,
  MinecraftProfile,
  MinecraftServerStatus,
} from "./find.types";

const IP_GEO_TIMEOUT_MS = 5000;
const PROFILE_TIMEOUT_MS = 5000;
const SERVER_STATUS_TIMEOUT_MS = 8000;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export async function fetchIpCountry(ip: string): Promise<IpCountry | null> {
  const response = await fetch(`https://ipwho.is/${encodeURIComponent(ip)}`, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(IP_GEO_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(`IP geolocation lookup failed with status ${response.status}`);
  }

  const result: unknown = await response.json();
  if (!isRecord(result) || result.success !== true) return null;
  if (
    typeof result.country_code !== "string" ||
    !/^[A-Z]{2}$/i.test(result.country_code) ||
    typeof result.country !== "string"
  ) {
    throw new Error("IP geolocation service returned an invalid response");
  }

  return {
    countryCode: result.country_code.toUpperCase(),
    country: result.country,
  };
}

export async function fetchMinecraftProfile(
  username: string,
): Promise<MinecraftProfile | null> {
  const response = await fetch(
    `https://api.minecraftservices.com/minecraft/profile/lookup/name/${encodeURIComponent(username)}`,
    {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(PROFILE_TIMEOUT_MS),
    },
  );

  if (response.status === 204 || response.status === 404) return null;
  if (!response.ok) {
    throw new Error(`Minecraft profile lookup failed with status ${response.status}`);
  }

  const profile: unknown = await response.json();
  if (
    typeof profile !== "object" ||
    profile === null ||
    !("id" in profile) ||
    typeof profile.id !== "string" ||
    !/^[a-f0-9]{32}$/i.test(profile.id) ||
    !("name" in profile) ||
    typeof profile.name !== "string"
  ) {
    throw new Error("Minecraft profile service returned an invalid response");
  }

  return { id: profile.id, name: profile.name };
}

export async function fetchMinecraftServerStatus(
  address: string,
): Promise<MinecraftServerStatus> {
  const response = await fetch(
    `https://api.mcstatus.io/v2/status/java/${encodeURIComponent(address)}`,
    {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(SERVER_STATUS_TIMEOUT_MS),
    },
  );

  if (!response.ok) {
    throw new Error(`Minecraft server status lookup failed with status ${response.status}`);
  }

  const status: unknown = await response.json();
  if (
    !isRecord(status) ||
    typeof status.online !== "boolean" ||
    typeof status.host !== "string" ||
    typeof status.port !== "number"
  ) {
    throw new Error("Minecraft server status service returned an invalid response");
  }

  const players =
    isRecord(status.players) &&
    typeof status.players.online === "number" &&
    typeof status.players.max === "number"
      ? { online: status.players.online, max: status.players.max }
      : null;
  const motd =
    isRecord(status.motd) && typeof status.motd.clean === "string"
      ? status.motd.clean
      : "";
  const icon =
    typeof status.icon === "string" &&
    status.icon.length <= 350_000 &&
    /^data:image\/(?:png|jpeg|webp);base64,[a-zA-Z0-9+/]+=*$/.test(status.icon)
      ? status.icon
      : null;
  const version =
    isRecord(status.version) && typeof status.version.name_clean === "string"
      ? status.version.name_clean
      : null;

  return {
    online: status.online,
    host: status.host,
    port: status.port,
    players,
    motd,
    icon,
    version,
  };
}
