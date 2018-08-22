/**
 * Created by Илья on 20.08.2018.
 */
import { assert } from "chai";
import "mocha";
import {DataForCreation} from "../../../src/Helpers";
import Dictionary from "typescript-collections/dist/lib/Dictionary";
import {User} from "../../../src/db/Entity/User";

describe("User. Пользователь", () => {
  it("Имеет конструктор.", () => {
    const userData: DataForCreation = new Dictionary<string, any>();
    userData.setValue("id", 0);
    userData.setValue("name", "q");
    userData.setValue("email", "q@q.com");
    userData.setValue("password", "w");
    userData.setValue("access_token", "sdf");

    const user: User = new User(userData);
    assert.strictEqual(user.id, userData.getValue("id"));
    assert.strictEqual(user.name, userData.getValue("name"));
    assert.strictEqual(user.email, userData.getValue("email"));
    assert.strictEqual(user.password, userData.getValue("password"));
    assert.strictEqual(user.accessToken, userData.getValue("access_token"));
  });
});
