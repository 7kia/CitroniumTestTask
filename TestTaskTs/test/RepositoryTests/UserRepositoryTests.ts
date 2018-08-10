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
    it("Можно найти пользователя по различным характеристикам.", async () => {
      const user: User = await db.db.users.findUser( { id: "0" } );
      const user2: User = await db.db.users.findUser( { email: "e2.e@com", name: "Player2" } );

      assert.equal(user.id, 0);
      assert.equal(user2.id, 1);
    });

});
