/**
 * Created by Илья on 07.08.2018.
 */
import { assert, expect } from "chai";
import db = require("../../src/db/index");
import "mocha";
import {UserRepository} from "../../src/db/repository/UserRepository";


describe("DatabaseManager. " +
    "Ползволяет брать и записывать данные", () => {
    it("should get all examples", () => {
        // const foo = async function () {
        //
        // };
        //
        // foo();
        assert.strictEqual(
          db.db.users.findUser( { "id": "1" } ).id,
          1
        );
    });

});