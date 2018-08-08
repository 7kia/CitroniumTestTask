/**
 * Created by Илья on 05.08.2018.
 */

const assert = require("assert");
const testScript = require("../src/TestScript");

describe("Может проверить: является ли переданный аргумент словарём.", function () {
  it("Если передан не словарь, то бросается исключение.", function () {
    assert.strictEqual(testScript.method1(), 0);
  });


});