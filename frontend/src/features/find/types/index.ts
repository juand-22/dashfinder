export type FindRecord = {
  name: string | null;
  ip: string | null;
  password: string | null;
  salt: string | null;
  serverip: string | null;
  server: string | null;
};

export type MinecraftProfile = {
  id: string;
  name: string;
};

export type MinecraftServerStatus = {
  online: boolean;
  host: string;
  port: number;
  players: { online: number; max: number } | null;
  motd: string;
  icon: string | null;
  version: string | null;
};

export type IpCountry = {
  countryCode: string;
  country: string;
};

export type MinecraftProfileLookup =
  | { status: "idle" | "invalid" | "loading" | "not-found"; username: string }
  | { status: "found"; username: string; profile: MinecraftProfile }
  | { status: "error"; username: string; message: string };

export type MinecraftServerStatusLookup =
  | { status: "loading"; address: string }
  | { status: "loaded"; address: string; server: MinecraftServerStatus }
  | { status: "error"; address: string; message: string };

export type SelectedResult = { record: FindRecord; index: number };
