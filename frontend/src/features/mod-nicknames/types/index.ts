/**
 * Un nick guardado para el mod (`GET /api/mod/nicknames`).
 *
 * El `found` todavía no se usa en el panel: al crear queda en `false` y desde
 * acá no se manda. Falta definir qué se hace con ese dato.
 */
export type ModNickname = {
  id: number;
  nickname: string;
  found: boolean;
  /** ISO de cuándo se guardó. */
  createdAt: string;
};

/**
 * Un servidor guardado en el que aparece el nick
 * (`GET /api/servers/players?name=`).
 *
 * `player_servers` guarda la foto del primer avistamiento: el rango y los
 * registros son los de ese momento y no se actualizan.
 */
export type NicknameServer = {
  serverId: number;
  servername: string;
  serverip: string;
  serverport: number;
  rank: string | null;
  found: boolean;
  records_founds: number;
  hashedPassword: boolean;
};
