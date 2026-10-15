console.log("HOLA DESDE TEST_DB");

import Database from "better-sqlite3";

try {
  const db = new Database("./mc_dbs.db", { readonly: true });

  console.log("Base abierta");

  const tablas = db
    .prepare("SELECT name FROM sqlite_master WHERE type = 'table'")
    .all();

  console.log("Tablas:", tablas);

  db.close();
} catch (error) {
  console.error("ERROR:", error);
}