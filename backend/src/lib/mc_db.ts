import { Sequelize } from "sequelize";

export const mcDb = new Sequelize({
  dialect: "sqlite",
  storage: "./mc_dbs.db",
  logging: false,
});

