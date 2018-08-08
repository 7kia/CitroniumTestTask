/**
 * Created by Илья on 05.08.2018.
 */
const pgp = require("pg-promise")({
  // Initialization Options
});

const cn = {
  host: "localhost",
  port: 5432,
  database: "TicTacToe",
  user: "postgres",
  password: "postgres"
};
const db = pgp(cn);

module.export = db;