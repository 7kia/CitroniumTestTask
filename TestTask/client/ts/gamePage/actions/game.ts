import {apiGET, apiPOST} from "../../common/helpers/request";
import {BACKEND_SERVER_ADDRESS} from "../../consts/server";
import {Json, MyDictionary} from "../../consts/types";
import {Dispatch as IDispatch} from "redux";
import {IStore} from "../../reducer";
import {IGame} from "../interface/game";
import {logErrorRequest, logSuccessfulRequest, logUnknownErrorRequest} from "../../Logger";

export const surrender = (
  userId: number,
  gameId: number,
  updateGame: Function,
  sendMessage: Function,
) => {
  return (dispatch: IDispatch<IStore>) => {
    console.log(
      "Surrender request start. Data: "
      + "userId=" + userId
      + "gameId=" + gameId,
    );
    return apiPOST(BACKEND_SERVER_ADDRESS + "/api/game/set-loser/", {userId, gameId})
      .then((data: MyDictionary) => {
        console.log(data);
        if (data.hasOwnProperty("message")) {
          logErrorRequest("\"Surrender\"", data.message);
          sendMessage((data as MyDictionary).message);
        } else {
          updateGame();
          logSuccessfulRequest("\"Surrender\"");
        }
      })
      .catch((err: any) => {
        logUnknownErrorRequest("\"Surrender\"");
      });
  };
};

export const getGame = (gameId: number, updateGame: Function, sendMessage: Function) => {
  return (dispatch: IDispatch<IStore>) => {
    console.log("Get game request start. GameId=" + gameId);
    return apiGET(BACKEND_SERVER_ADDRESS + "/api/game/get", {gameId})
      .then((data: MyDictionary) => {
        if (data.hasOwnProperty("message")) {
          sendMessage((data as MyDictionary).message);
          logErrorRequest("\"Get game\"", data.message);
        } else {
          console.log("data");
          console.log(data);
          updateGame(data as IGame);
          logSuccessfulRequest("\"Get game\"");
        }
      })
      .catch((err: any) => {
        logUnknownErrorRequest("\"Get game\"");
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
    console.log(
      "\"Take player move\" request start. Data:"
      + " x=" + column
      + " y=" + row
      + " userId=" + userId
      + " gameId=" + gameId,
    );
    return apiPOST(BACKEND_SERVER_ADDRESS + "/api/game/take-player-move/", {column, row, userId, gameId})
      .then((data: MyDictionary) => {
        if (data.hasOwnProperty("message")) {
          sendMessage((data as MyDictionary).message);
          logErrorRequest("\"Take player move\"", data.message);
        } else {
          updateGame();
          logSuccessfulRequest("\"Take player move\"");
        }
      })
      .catch((err: any) => {
        logUnknownErrorRequest("\"Take player move\"");
      });
  };
};

