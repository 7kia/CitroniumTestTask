/**
 * Created by Илья on 06.08.2018.
 */
import "mocha";
import { expect } from "chai";
import { assert } from "chai";

describe("DatabaseManager. " +
    "Ползволяет брать и записывать данные", () => {
    it("should get all examples", () => {
        const foo = async function () {
            try {
                //const testObject = yield db.one("SELECT * FROM TestObject WHERE id = $1", [0]);
                db.one("SELECT * FROM public.\"User\" WHERE id = $1", [0])
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

        assert.strictEqual(db.findUser(0).id, 1);
    });

});