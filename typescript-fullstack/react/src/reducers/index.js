"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var redux_1 = require("redux");
var users_1 = require("./users");
exports.default = redux_1.combineReducers({
    users: users_1.default
});
