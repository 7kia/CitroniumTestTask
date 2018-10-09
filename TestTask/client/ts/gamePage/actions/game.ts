import {apiGET, apiPOST} from "../../common/helpers/request";
import {BACKEND_SERVER_ADDRESS} from "../../consts/server";
import {Json, MyDictionary} from "../../consts/types";
import {Dispatch as IDispatch} from "redux";
import {IStore} from "../../reducer";
import {IGame} from "../interface/game";

export const surrender = (
  userId: number,
  gameId: number,
  updateGame: Function,
  sendMessage: Function,
) => {
  return (dispatch: IDispatch<IStore>) => {
    return apiPOST(BACKEND_SERVER_ADDRESS + "/api/game/set-loser/", {userId, gameId})
      .then((data: MyDictionary) => {
        console.log(data);
        if (data.hasOwnProperty("message")) {
          // TODO: add logging
          sendMessage((data as MyDictionary).message);
        } else {
          updateGame();
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

export const takePlayerMove = (
  x: number,
  y: number,
  userId: number,
  gameId: number,
  updateGame: Function,
  sendMessage: Function,
) => {
  return (dispatch: IDispatch<IStore>) => {
    const row: number = y;
    const column: number = x;
    return apiPOST(BACKEND_SERVER_ADDRESS + "/api/game/take-player-move", {column, row, userId, gameId})
      .then((data: MyDictionary) => {
        if (data.hasOwnProperty("message")) {
          sendMessage((data as MyDictionary).message);
        } else {
          updateGame();
        }
      })
      .catch((err: any) => {
        // TODO: add logging
      });
  };
};

