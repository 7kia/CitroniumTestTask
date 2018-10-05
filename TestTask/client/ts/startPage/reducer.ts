"use strict";

import {IAction} from "../common/interfaces/action";
import {gameFormSubmitActionTypes} from "./actions/games";

export interface ICreateGameStore {
    createError: string | null;
    creating: boolean;
}

const initialState = {
    createError: null,
    creating: false
};

const gameReducer  = (state: ICreateGameStore = initialState, action: IAction): ICreateGameStore => {
    switch (action.type) {
        case gameFormSubmitActionTypes.start:
            return { ...state, creating: true };
        case gameFormSubmitActionTypes.success:
            return { ...state, creating: false, createError: null };
        case gameFormSubmitActionTypes.error:
            return { ...state, creating: false, createError: action.payload };
        default:
            return state;
    }
};

export default gameReducer;
