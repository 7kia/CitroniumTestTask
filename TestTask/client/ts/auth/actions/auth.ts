"use strict";

import {Dispatch as IDispatch} from "redux";
import {IAction} from "../../common/interfaces/action";
import {IAuthLoginCreds, IAuthSignupCreds} from "../interfaces/auth";
import {IStore} from "../../reducer";
import {apiPOST} from "../../common/helpers/request";
import {AUTH_TOKEN_LS_KEY, USER_ID} from "../../consts/auth";
import {createRequestActionTypes} from "../../common/helpers/actions";
import {BACKEND_SERVER_ADDRESS} from "../../consts/server";
import {MyDictionary} from "../../consts/types";
import {logErrorRequest, logSuccessfulRequest, logUnknownErrorRequest} from "../../Logger";

/* TYPES */

export const AUTHENTICATE_USER = "auth/AUTHENTICATE_USER";
export const UNAUTHENTICATE_USER = "auth/UNAUTHENTICATE_USER";
export const RESET_AUTH_FORM = "auth/RESET_AUTH_FORM";
export const authFormSubmitActionTypes = createRequestActionTypes("auth/FORM_SUBMIT");

/* ACTIONS */

export const authenticateUser = (): IAction => ({ type: AUTHENTICATE_USER });
export const unauthenticateUser = (): IAction => ({ type: UNAUTHENTICATE_USER });
export const resetAuthForm = (): IAction => ({ type: RESET_AUTH_FORM });
export const authRequestStart: IAction = { type: authFormSubmitActionTypes.start };
export const authRequestSuccess: IAction = { type: authFormSubmitActionTypes.success };
export const authRequestError = (error: string): IAction => ({
    type: authFormSubmitActionTypes.error,
    payload: error
});

export const loginUser = (credentials: IAuthLoginCreds, onSuccess?: Function) => {
  return (dispatch: IDispatch<IStore>) => {
    const email: string = credentials.email;
    const password: string = credentials.password;
    dispatch<IAction>(authRequestStart);
    console.log("Login request start. User data: ");

    return apiPOST(BACKEND_SERVER_ADDRESS + "/api/auth/login/", {email, password})
    .then((data: MyDictionary) => {
      console.log(data);
      if (data.hasOwnProperty("message")) {
        dispatch<IAction>(authRequestError(logErrorRequest("\"Login\"", data.message)));
      } else {
        dispatch<IAction>(authRequestSuccess);
        dispatch<IAction>(authenticateUser());
        localStorage.setItem(AUTH_TOKEN_LS_KEY, data.token);
        localStorage.setItem(USER_ID, data.userId);
        logSuccessfulRequest("\"Login\"");
        if (onSuccess) {
          onSuccess(data);
        }
      }
    })
    .catch((err: any) => {
      dispatch<IAction>(authRequestError(logUnknownErrorRequest("\"Login\"")));
    });
  };
};

export const logoutUser = (): IAction => {
  console.log("User with id=" + localStorage.getItem(USER_ID) + " logout");
  localStorage.removeItem(AUTH_TOKEN_LS_KEY);
  localStorage.removeItem(USER_ID);
  return unauthenticateUser();
};

export const signupUser = (credentials: IAuthSignupCreds, onSuccess?: Function) => {
  return (dispatch: IDispatch<IStore>) => {
    const email: string = credentials.email;
    const password: string = credentials.password;
    const name: string = credentials.name;
    console.log(
      "User sign up. User data: "
      + "email=" + email
      + "name=" + name
      + "password=" + password,
    );
    dispatch<IAction>(authRequestStart);

    return apiPOST(BACKEND_SERVER_ADDRESS + "/api/auth/signUp/", {email, name, password})
    .then((data: MyDictionary) => {
      console.log(data);
      if (data.hasOwnProperty("message")) {
        dispatch<IAction>(authRequestError(logErrorRequest("\"Signup\"", data.message)));
      } else {
        dispatch<IAction>(authRequestSuccess);
        dispatch<IAction>(authenticateUser());
        localStorage.setItem(AUTH_TOKEN_LS_KEY, data.token);
        localStorage.setItem(USER_ID, data.userId);
        logSuccessfulRequest("\"Signup\"");
        if (onSuccess) {
          onSuccess(data);
        }
      }
    })
    .catch((error) => {
      dispatch<IAction>(authRequestError(logUnknownErrorRequest("\"Signup\"")));
    });
  };
};

