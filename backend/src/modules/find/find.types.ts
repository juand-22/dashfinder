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
