export type ModServer = {
  id: number;
  name: string;
  ip: string;
  port: number;
  players_total: number;
  player_founds: number;
  players_not_hashed: number;
};

export type ServerPlayer = {
  name: string;
  rank: string | null;
  found: boolean;
  records_founds: number;
  hashedPassword: boolean;
  servername: string;
  serverip: string;
  serverport: number;
};
