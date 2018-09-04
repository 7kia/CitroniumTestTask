"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var redux_actions_1 = require("redux-actions");
var Actions = require("../constants/actions");
var initialState = {
    id: 0,
    name: 'NotLoggedIn'
};
exports.default = redux_actions_1.handleActions((_a = {},
    _a[Actions.USER_LOGIN] = function (state, action) {
        return {
            id: action.payload.id,
            name: action.payload.name
        };
    },
    _a), initialState);
var _a;
