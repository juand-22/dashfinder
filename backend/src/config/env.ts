const env = {
  DATABASE_URL: process.env.DATABASE_URL ?? "file:./app.db",
  JWT_SECRET: process.env.JWT_SECRET ?? "default_secret",
  EXPIRES_IN: process.env.EXPIRES_IN ?? "1h",
  FRONTEND_URL: process.env.FRONTEND_URL ?? "http://localhost:5173",
  DEHASH_API: process.env.DEHASH_API ?? "http://127.0.0.1:8000",
};

export default env;