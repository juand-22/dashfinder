import { Sequelize } from "sequelize";
import env from "../config/env";

export const mcDb = new Sequelize({
  dialect: "sqlite",
  storage: env.MC_DB,
  logging: false,
});

