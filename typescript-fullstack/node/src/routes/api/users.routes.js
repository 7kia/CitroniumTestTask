"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var UsersController = require("../../controllers/users.controller");
var UsersRoutes = function (app) {
    app.get('/api/1.0/allUsers', UsersController.getAllUsers);
};
exports.default = UsersRoutes;
