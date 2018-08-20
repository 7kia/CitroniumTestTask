/**
 * Created by Илья on 17.08.2018.
 */
import { assert } from "chai";
import "mocha";
import {Helpers} from "../../src/Helpers";

describe("Helpers." +
  "Содержит в себе вспомогательные функции.", () => {
  it("Может заменять символы в строке.", () => {
    const sourceString: string = "XXX";
    const symbol: string = "0";
    const position: number = 1;

    const newString: string = Helpers.replaceAt(sourceString, position, symbol);
    assert.strictEqual(newString, "X0X");
  });
});
