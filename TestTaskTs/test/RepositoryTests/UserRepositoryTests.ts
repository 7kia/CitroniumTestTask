/**
 * Created by Илья on 07.08.2018.
 */
import { assert } from "chai";
import "mocha";
import db = require("../../src/db");
import {User } from "../../src/db/Entity/User";
import {Repository} from "../../src/db/repositories/Repository";
import $ from "jquery";

describe("UserRepository. " +
    "Позволяет брать и редактировать данные пользователей.", () => {
    it("Можно найти пользователя по различным характеристикам.", () => {

      const test = async () => {
        const user: User = await db.db.users.findUser( { id: "0" } );
        const user2 = await db.db.users.findUser( { email: "e2.e@com", name: "Player2" } );

        console.log(user.id);

        console.log(user.id === 2);
        console.log(user2.id === 2);
        assert.strintEqual(user.id, 2);
        assert.strintEqual(user2.id, 1);

      };
      assert.doesNotThrow(
        () => {
          test();
          },
        Error,
      );

    });

});
