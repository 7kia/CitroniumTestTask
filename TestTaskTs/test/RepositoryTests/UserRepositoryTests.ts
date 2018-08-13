/**
 * Created by Илья on 07.08.2018.
 */
import { assert } from "chai";
import "mocha";
import {postgreSqlManager} from "../../src/db";
import {User} from "../../src/db/Entity/User";
import * as pgPromise from "pg-promise";
import QueryResultError = pgPromise.errors.QueryResultError;

describe("UserRepository. " +
    "Позволяет брать и редактировать данные пользователей.", () => {
  const deleteUserIfExist = async (userData: {[id: string]: any} ) => {
    try {
      const foundUser: User = await postgreSqlManager.users.find( userData );
      if (foundUser) {
        await postgreSqlManager.users.deleteUser( userData );
      }
    } catch (error: any) {
      console.log("Удалены тестовое данные");
    }
  };
  it("Можно найти пользователя по различным характеристикам.", async () => {
    const user: User = await postgreSqlManager.users.find( { id: "0" } );
    const user2: User = await postgreSqlManager.users.find( { email: "e2.e@com", name: "Player2" } );

    assert.strictEqual(user.id, 0);
    assert.strictEqual(user2.id, 1);
  });
  it("Можно создать и удалить пользователя.", async () => {
    const userData: {[id: string]: any} = {
      name: "Player6",
      email: "e6.e@com",
      password: "sdf",
    };
    deleteUserIfExist(userData);
    await postgreSqlManager.users.create(userData);

    const foundUser: User = await postgreSqlManager.users.find(userData);
    assert.strictEqual(foundUser.name, userData.name);
    assert.strictEqual(foundUser.email, userData.email);
    assert.strictEqual(foundUser.password, userData.password);

    await postgreSqlManager.users.deleteUser( userData );
    // TODO : не ловит исключение
    // assert.throws(
    //   async () => {
    //     await postgreSqlManager.users.find( userData );
    //   },
    //   QueryResultError,
    // );
  });
  it("Можно обновить данные пользователя.", async () => {
    const oldData: {[id: string]: string} = {
      name: "TestOldPlayer",
      email: "TestOldPlayer.e@com",
      password: "TestOldPlayer",
    };
    const newUserData: {[id: string]: string} = {
      email: "Update2.e@com",
      password: "Update2",
    };
    deleteUserIfExist(oldData);
    deleteUserIfExist(newUserData);

    await postgreSqlManager.users.create(oldData);

    let user: User = await postgreSqlManager.users.find( oldData );
    user.email = newUserData.email;
    user.password = newUserData.password;

    await postgreSqlManager.users.update(user);
    const updateUser: User = await postgreSqlManager.users.find( newUserData );
    assert.strictEqual(updateUser.email, newUserData.email);
    assert.strictEqual(updateUser.password, newUserData.password);

    await postgreSqlManager.users.deleteUser( newUserData );
  });
});
