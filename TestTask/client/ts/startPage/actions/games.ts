/**
 * Created by Илья on 23.09.2018.
 */
import {Dispatch as IDispatch} from "redux";
import {IStore} from "../../reducer";
import {IAction} from "../../common/interfaces/action";
import {createRequestActionTypes} from "../../common/helpers/actions";
import {BACKEND_SERVER_ADDRESS} from "../../consts/server";
import {apiGET, apiPOST} from "../../common/helpers/request";
import {MyDictionary} from "../../consts/types";
import {ICreateGameData} from "../interfaces/games";
import {logErrorRequest, logSuccessfulRequest, logUnknownErrorRequest} from "../../Logger";

export const gameFormSubmitActionTypes = createRequestActionTypes("games/CREATE_GAME_FORM_SUBMIT");

export const gameRequestStart: IAction = { type: gameFormSubmitActionTypes.start };
export const gameRequestSuccess: IAction = { type: gameFormSubmitActionTypes.success };
export const gameRequestError = (error: string): IAction => ({
  type: gameFormSubmitActionTypes.error,
  payload: error,
});

export const getIncompleteGameUserId = (userId: number, onSuccess: Function) => {
  return (dispatch: IDispatch<IStore>) => {
    dispatch<IAction>(gameRequestStart);
    console.log("\"Get incomplete game user\" request start. Params: userId=" + userId);
    return apiGET(BACKEND_SERVER_ADDRESS + "/api/game/get-user-incomplete-game", {userId})
      .then((data: MyDictionary) => {
        if (data.hasOwnProperty("message")) {
          dispatch<IAction>(gameRequestError(logErrorRequest("\"Get incomplete game user\"", data.message)));
          onSuccess(data);
        } else {
          dispatch<IAction>(gameRequestSuccess);
          logSuccessfulRequest("\"Get incomplete game user\"");
          onSuccess(data);
        }
      })
      .catch((err: any) => {
        dispatch<IAction>(gameRequestError(logUnknownErrorRequest("\"Get incomplete game user\"")));
      });
  };
};
export const createGame = (
  gameData: ICreateGameData,
  redirectToGame: (gameId: number) => void,
  handleError: (message: string) => void,
) => {
  return (dispatch: IDispatch<IStore>) => {
    dispatch<IAction>(gameRequestStart);
    console.log(
      "\"Create game\" request start. Params: "
      + "userId=" + gameData.userId +
      + "size=" + gameData.size,
    );
    return apiPOST(BACKEND_SERVER_ADDRESS + "/api/game/create/", {userId: gameData.userId, size: gameData.size})
    .then((data: MyDictionary) => {
      if (data.hasOwnProperty("message")) {
        dispatch<IAction>(gameRequestError(logErrorRequest("\"Create game\"", data.message)));
        handleError(data.message);
      } else {
        dispatch<IAction>(gameRequestSuccess);
        logSuccessfulRequest("\"Create game\"");
        redirectToGame(data.gameId);
      }
    })
    .catch((err: any) => {
      dispatch<IAction>(gameRequestError(logUnknownErrorRequest("\"Create game\"")));
    });
  };
};