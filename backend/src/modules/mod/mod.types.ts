export type McUser = {
  name: string;
  ip: string | null;
  password: string | null;
  salt: string | null;
  serverip: string | null;
  server: string | null;
};

export type LastPlayerField = {
  name: string;
  rank: string;
  found: boolean;
  records_founds: number;
  hashedPassword: boolean;
};

export type FoundPlayerField = {
  name: string;
  rank: string;
  found: boolean;
  ip: string | null;
  password: string | null;
  salt: string | null;
  serverip: string | null;
  servername: string | null;
};

export type ServerPlayerField = {
  name: string;
  rank: string | null;
  found: boolean;
  records_founds: number;
  hashedPassword: boolean;
  ip: string | null;
  password: string | null;
  salt: string | null;
  serverip: string | null;
  servername: string | null;
};
