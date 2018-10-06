import {apiPOST} from "../../common/helpers/request";
import {AUTH_TOKEN_LS_KEY, USER_ID} from "../../consts/auth";
import {BACKEND_SERVER_ADDRESS} from "../../consts/server";
import {MyDictionary} from "../../consts/types";
import {Dispatch as IDispatch} from "redux";
import {IStore} from "../../reducer";

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

