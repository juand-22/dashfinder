const env = {
  PORT: Number(process.env.PORT ?? 3000) || 3000,
  DATABASE_URL: process.env.DATABASE_URL ?? "file:./app.db",
  MC_DB: process.env.MC_DB ?? "./mc_dbs.db",
  JWT_SECRET: process.env.JWT_SECRET ?? "default_secret",
  EXPIRES_IN: process.env.EXPIRES_IN ?? "1h",
  FRONTEND_URL: process.env.FRONTEND_URL ?? "http://localhost:5173",
  DEHASH_API: process.env.DEHASH_API ?? "http://127.0.0.1:8000",
};

export default env;