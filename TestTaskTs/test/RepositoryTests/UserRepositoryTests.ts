/**
 * Created by Илья on 07.08.2018.
 */
import { assert } from "chai";
import "mocha";
import db = require("../../src/db");
import {User} from "../../src/db/Entity/User";
import {Repository} from "../../src/db/repositories/Repository";
import * as pgPromise from "pg-promise";
import QueryResultError = pgPromise.errors.QueryResultError;

describe("UserRepository. " +
    "Позволяет брать и редактировать данные пользователей.", () => {

  it("Можно найти пользователя по различным характеристикам.", async () => {
    const user: User = await db.db.users.find( { id: "0" } );
    const user2: User = await db.db.users.find( { email: "e2.e@com", name: "Player2" } );

    assert.strictEqual(user.id, 0);
    assert.strictEqual(user2.id, 1);
  });
  const userData: {[id: string]: string} = {
    name: "Player3",
    email: "e3.e@com",
    password: "sdf",
  };
  it("Можно создать и удалить пользователя.", async () => {
    try {
      const foundUser: User = await db.db.users.find( userData );
      if (foundUser) {
        await db.db.users.deleteUser( userData );
      }
    } catch (error: any) {
      console.log(error);
    }

    await db.db.users.create(userData);


    const foundUser: User = await db.db.users.find(userData);
    assert.strictEqual(foundUser.name, userData.name);
    assert.strictEqual(foundUser.email, userData.email);
    assert.strictEqual(foundUser.password, userData.password);

    await db.db.users.deleteUser( userData );
    // assert.throw(
    //   async () => {
    //     await db.db.users.find( userData );
    //   },
    //   QueryResultError,
    // );
  });
});
