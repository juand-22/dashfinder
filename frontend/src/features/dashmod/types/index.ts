export type ModPlayer = {
  name: string;
  rank: string | null;
  found: boolean;
  records_founds: number;
  hashedPassword: boolean;
};

export type ModActivity = {
  serverip: string;
  lastDateRequest: string;
  lastPlayers: ModPlayer[];
};

export type PlayerInfo = {
  name: string | null;
  ip: string | null;
  password: string | null;
  salt: string | null;
  serverip: string | null;
  server: string | null;
};

export type PlayerFilter = "all" | "found" | "not-hashed";
