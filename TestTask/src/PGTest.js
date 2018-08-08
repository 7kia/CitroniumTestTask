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

const foo = async function () {
  try {
    //const testObject = yield db.one("SELECT * FROM TestObject WHERE id = $1", [0]);
    db.one("SELECT * FROM public.\"TestObject\" WHERE id = $1", [0])
      .then(function (data) {
        console.log("DATA:", data.id);
      })
      .catch(function (error) {
        console.log("ERROR:", error);
      });
    //console.log(testObject.id);
    // success
  }
  catch(e) {
    // error
    console.log(e);
  }

};

foo();

