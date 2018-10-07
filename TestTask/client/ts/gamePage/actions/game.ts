import {apiGET, apiPOST} from "../../common/helpers/request";
import {BACKEND_SERVER_ADDRESS} from "../../consts/server";
import {Json, MyDictionary} from "../../consts/types";
import {Dispatch as IDispatch} from "redux";
import {IStore} from "../../reducer";
import {IGame} from "../interface/game";

export const surrender = (userId: number, gameId: number) => {
  return (dispatch: IDispatch<IStore>) => {
    return apiPOST(BACKEND_SERVER_ADDRESS + "/api/game/set-loser/", {userId, gameId})
      .then((data: MyDictionary) => {
        console.log(data);
        if (data.hasOwnProperty("message")) {
          // TODO: add logging
        } else {
          // TODO: add logging
        }
      })
      .catch((err: any) => {
        // TODO: add logging
      });
  };
};

export const getGame = (gameId: number, updateGame: Function, sendMessage: Function) => {
  return (dispatch: IDispatch<IStore>) => {
    return apiGET(BACKEND_SERVER_ADDRESS + "/api/game/get", {gameId})
      .then((data: MyDictionary) => {
        if (data.hasOwnProperty("message")) {
          sendMessage((data as MyDictionary).message);
        } else {
          console.log("data");
          console.log(data);
          updateGame(data as IGame);
        }
      })
      .catch((err: any) => {
        // TODO: add logging
      });
  };
};

