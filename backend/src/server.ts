import "dotenv/config";
import app from "./app";
import { mcDb } from "./lib/mc_db";
import { sweepStaleDehashes } from "./modules/dehash/dehash.service";

const PORT = process.env.PORT || 3000;


async function query() {
  try {
    
    mcDb.authenticate();
    mcDb.sync({force: false});

    const query = await mcDb.query(`select * from usuarios where name = 'no_ad'`);
    console.log(query)
  } catch (error) {
    console.log(error)
  }

}

query()



app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  sweepStaleDehashes();
});