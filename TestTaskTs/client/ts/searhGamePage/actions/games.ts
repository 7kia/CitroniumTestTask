/**
 * Created by Илья on 23.09.2018.
 */
import {Dispatch as IDispatch} from "redux";
import {IStore} from "../../reducer";
import {IAction} from "../../common/interfaces/action";
import {createRequestActionTypes} from "../../common/helpers/actions";
import {BACKEND_SERVER_ADDRESS} from "../../consts/server";
import {apiGET, apiPOST} from "../../common/helpers/request";
import {Json} from "../../consts/types";
import {ICreateGameData} from "../interfaces/games";

export const gameFormSubmitActionTypes = createRequestActionTypes("games/CREATE_GAME_FORM_SUBMIT");

export const gameRequestStart: IAction = { type: gameFormSubmitActionTypes.start };
export const gameRequestSuccess: IAction = { type: gameFormSubmitActionTypes.success };
export const gameRequestError = (error: string): IAction => ({
  type: gameFormSubmitActionTypes.error,
  payload: error
});

export const getIncompleteGameUserId = (userId: number, onSuccess: Function) => {
  return (dispatch: IDispatch<IStore>) => {
      dispatch<IAction>(gameRequestStart);

      return apiGET(BACKEND_SERVER_ADDRESS + "/api/game/get-user-incomplete-game/", {userId})
        .then((data: Json) => {
          if (data.hasOwnProperty("message")) {
            dispatch<IAction>(gameRequestError(data.message));
            onSuccess(data);
          } else {
            dispatch<IAction>(gameRequestSuccess);
            onSuccess(data);
          }
        })
        .catch((err: any) => {
          dispatch<IAction>(gameRequestError("Error to getIncompleteGameUserId"));
        });
  };
};
export const createGame = (
  gameData: ICreateGameData,
  redirectToGame: (gameId: number) => void,
  handleError: (message: string) => void
) => {
  return (dispatch: IDispatch<IStore>) => {
    dispatch<IAction>(gameRequestStart);

    return apiPOST(BACKEND_SERVER_ADDRESS + "/api/game/create/", {userId: gameData.userId, size: gameData.size})
    .then((data: Json) => {
      if (data.hasOwnProperty("message")) {
        dispatch<IAction>(gameRequestError(data.message));
        handleError(data.message);
      } else {
        dispatch<IAction>(gameRequestSuccess);
        redirectToGame(data.gameId);
      }
    })
    .catch((err: any) => {
      dispatch<IAction>(gameRequestError("Error to createGame"));
    });
  };
};