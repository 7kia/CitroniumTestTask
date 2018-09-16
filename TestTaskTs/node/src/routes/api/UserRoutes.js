"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var UsersController = require("../../controllers/UserController");
var UsersRoutes = function (app) {
    app.get('/api/1.0/allUsers', UsersController.getUser);
};
exports.default = UsersRoutes;
