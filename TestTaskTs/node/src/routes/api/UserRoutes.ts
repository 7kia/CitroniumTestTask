import {Express} from "express";
import {AuthorizationActions} from "../../DomainModel/actions/AuthorizationActions";

const UsersRoutes = (app: Express) => {
  app.use("/signIn", AuthorizationActions.signIn);
  app.use("/signUn", AuthorizationActions.signUp);
};

export default UsersRoutes;
