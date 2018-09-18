/**
 * Created by Илья on 10.08.2018.
 */
import Dictionary from "typescript-collections/dist/lib/Dictionary";

class Helpers {
  public static replaceAt(
    changeString: string,
    index: number,
    replacement: string,
  ): string {
    return changeString.substr(0, index) + replacement + changeString.substr(index + replacement.length);
  }

  public static between (
    value: number,
    startRange: number,
    endRange: number
  ): boolean {
    return (startRange <= value) && (value <= endRange);
  }
}

type DataForCreation = Dictionary<string, any>;
type WhatUpdate = Dictionary<string, boolean>;

export {
  Helpers,
  DataForCreation,
  WhatUpdate,
};
