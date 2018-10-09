/**
 * Created by Илья on 09.10.2018.
 */
import {MyDictionary} from "./consts/types";


const logStartRequest: (requestName: string, params: MyDictionary) => void
  = (requestName: string, params: MyDictionary) => {
  // let paramString: string = "";
  // for (let param in params) {
  //   paramString += param;
  // }
  // logger.info(requestName + " request start. Parameters: " + paramString);
};

const logSuccessfulRequest: (requestName: string) => string = (requestName: string) => {
  const message: string = requestName + " request successful";
  console.log(message);
  return message;
};

const logErrorRequest: (requestName: string, errorMessage: string) => string
  = (requestName: string, errorMessage: string) => {
  const message: string = requestName + " request failed. Message: " + errorMessage;
  console.log(message);
  return message;
};

const logUnknownErrorRequest: (requestName: string) => string = (requestName: string) => {
  const message: string = requestName + " request failed, unknown error";
  console.log(message);
  return message;
};

export {
  logSuccessfulRequest,
  logErrorRequest,
  logUnknownErrorRequest,
};
