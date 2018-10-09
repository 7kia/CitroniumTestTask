/**
 * Created by Илья on 23.09.2018.
 */
import {Dispatch as IDispatch} from "redux";
import {IStore} from "../../reducer";
import {IAction} from "../../common/interfaces/action";
import {createRequestActionTypes} from "../../common/helpers/actions";
import {BACKEND_SERVER_ADDRESS} from "../../consts/server";
import {apiGET} from "../../common/helpers/request";
import {Json, MyDictionary} from "../../consts/types";
import {ISearchGameData} from "../interfaces/searchGame";
import {IGameReport} from "../../common/interfaces/gameReport";
import {logErrorRequest, logSuccessfulRequest, logUnknownErrorRequest} from "../../Logger";

export const gameFormSubmitActionTypes = createRequestActionTypes("games/CREATE_GAME_FORM_SUBMIT");

export const gameRequestStart: IAction = { type: gameFormSubmitActionTypes.start };
export const gameRequestSuccess: IAction = { type: gameFormSubmitActionTypes.success };
export const gameRequestError = (error: string): IAction => ({
  type: gameFormSubmitActionTypes.error,
  payload: error,
});

export const searchGames = (gameData: ISearchGameData, updateGameList: Function) => {
  return (dispatch: IDispatch<IStore>) => {
    const creatorName: string = gameData.creatorName;
    const participantName: string = gameData.participantName;
    const size: number = gameData.size;
    dispatch<IAction>(gameRequestStart);
    console.log(
      "\"Search game\" request start. Params: "
      + "creatorName=" + creatorName +
      + "participantName=" + participantName +
      + "size=" + size,
    );
    return apiGET(BACKEND_SERVER_ADDRESS + "/api/game/find/", {creatorName, participantName, size})
      .then((data: string) => {
        const json: Json = JSON.parse(data);
        if (json.hasOwnProperty("message")) {
          dispatch<IAction>(gameRequestError(logErrorRequest("\"Search game\"", (json as MyDictionary).message)));
        } else {
          dispatch<IAction>(gameRequestSuccess);
          updateGameList(json as IGameReport[]);
          logSuccessfulRequest("\"Search game\"");
        }
      })
      .catch((err: any) => {
        dispatch<IAction>(gameRequestError(logUnknownErrorRequest("\"Search game\"")));
      });
  };
};