/**
 * Created by Илья on 07.08.2018.
 */
import { assert } from "chai";
import "mocha";
import {postgreSqlManager} from "../../src/db";
import {User} from "../../src/db/Entity/User";
import * as pgPromise from "pg-promise";
import QueryResultError = pgPromise.errors.QueryResultError;
import {DataForCreation, WhatUpdate} from "../../src/Helpers";
import Dictionary from "typescript-collections/dist/lib/Dictionary";

describe("UserRepository. " +
    "Позволяет брать и редактировать данные пользователей.", () => {
  const deleteUserIfExist = async (userData: DataForCreation ): Promise<void> => {
    try {
      const foundUser: User = await postgreSqlManager.users.find(userData);
      if (foundUser) {
        await postgreSqlManager.users.deleteUser(userData);
      }
    } catch (error) {
      console.log("Удалены тестовое данные");
    }
  };
  const assertThrowsAsync: (testFunc: () => any, regExp: any) => Promise<void>
    = async (testFunc: () => any, regExp: any) => {
    let func: () => void = null;
    try {
      await testFunc();
    } catch (error) {
      func = () => {throw error;};
    } finally {
      assert.throws(func, regExp);
    }
  };
  it("Можно найти пользователя по различным характеристикам.", async () => {
    let userData1: DataForCreation = new Dictionary<string, any>();
    userData1.setValue("id", 0);
    let userData2: DataForCreation = new Dictionary<string, any>();
    userData2.setValue("email", "e2.e@com");
    userData2.setValue("name", "Player1");

    const user: User = await postgreSqlManager.users.find(userData1);
    const user2: User = await postgreSqlManager.users.find(userData2);

    assert.strictEqual(user.id, 0);
    assert.strictEqual(user2.id, 1);
  });
  it("Можно создать и удалить пользователя.", async () => {
    let userData: DataForCreation = new Dictionary<string, any>();
    userData.setValue("name", "PlayerNew");
    userData.setValue("email", "e6.e@com");
    userData.setValue("password", "sdf");

    await deleteUserIfExist(userData);
    await postgreSqlManager.users.create(userData);

    const foundUser: User = await postgreSqlManager.users.find(userData);
    assert.strictEqual(foundUser.name, userData.getValue("name"));
    assert.strictEqual(foundUser.email, userData.getValue("email"));
    assert.strictEqual(foundUser.password, userData.getValue("password"));

    await postgreSqlManager.users.deleteUser( userData );
    assertThrowsAsync(
      async () => {
        await postgreSqlManager.users.find( userData );
      },
      Error,
    );
  });
  it("Можно обновить данные пользователя.", async () => {
    let oldData: DataForCreation = new Dictionary<string, any>();
    oldData.setValue("name", "TestOldPlayer");
    oldData.setValue("email", "TestOldPlayer.e@com");
    oldData.setValue("password", "TestOldPlayer");
    let newUserData: DataForCreation = new Dictionary<string, any>();
    newUserData.setValue("email", "Update2.e@com");
    newUserData.setValue("password", "Update2");

    await deleteUserIfExist(oldData);
    await deleteUserIfExist(newUserData);
    await postgreSqlManager.users.create(oldData);

    const user: User = await postgreSqlManager.users.find( oldData );
    let whatUpdate: WhatUpdate = new Dictionary<string, boolean>();
    whatUpdate.setValue("email", newUserData.getValue("email"));
    whatUpdate.setValue("password", newUserData.getValue("password"));
    await postgreSqlManager.users.update(user.id, whatUpdate);

    const updateUser: User = await postgreSqlManager.users.find( newUserData );
    assert.strictEqual(updateUser.email, newUserData.getValue("email"));
    assert.strictEqual(updateUser.password, newUserData.getValue("password"));

    await postgreSqlManager.users.deleteUser( newUserData );
  });
});
