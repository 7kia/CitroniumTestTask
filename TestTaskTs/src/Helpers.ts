/**
 * Created by Илья on 10.08.2018.
 */
class Helpers {
  public static copyByValue(mainObj): any {
    let objCopy = {}; // objCopy will store a copy of the mainObj
    for (let key in mainObj) {
      if (mainObj.hasOwnProperty(key)){
        objCopy[key] = mainObj[key]; // copies each property to the objCopy object
      }
    }
    return objCopy;
  }
}

export {
  Helpers,
};
