/**
 * Created by Илья on 23.09.2018.
 */
import {IUserCreds} from "../interfaces/games";
import {Dispatch as IDispatch} from "redux";
import {IStore} from "../../reducer";
import {IAction} from "../../common/interfaces/action";
import {createRequestActionTypes} from "../../common/helpers/actions";
import {BACKEND_SERVER_ADDRESS} from "../../consts/server";
import {apiGET, apiPOST} from "../../common/helpers/request";
import {Json} from "../../consts/types";
export const AUTHENTICATE_USER = "game/AUTHENTICATE_USER";
export const UNAUTHENTICATE_USER = "game/UNAUTHENTICATE_USER";
export const RESET_AUTH_FORM = "game/RESET_AUTH_FORM";
export const gameFormSubmitActionTypes = createRequestActionTypes("game/FORM_SUBMIT");

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
            dispatch<IAction>(gameRequestSuccess);
            onSuccess(data);
          } else {
            dispatch<IAction>(gameRequestSuccess);
            onSuccess(data);
          }
        })
        .catch((err: any) => {
          //dispatch<IAction>(gameRequestError("Login failed, try again"));
        });
  };
};