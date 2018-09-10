import {Express} from "express";
import * as UsersController from "../../controllers/users.controller";

const UsersRoutes = (app: Express) => {
  app.get("/get-user/:name/:password", UsersController.getUser);
};

export default UsersRoutes;
