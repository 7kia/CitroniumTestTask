import * as express from "express";
import {AuthorizationActions} from "../../DomainModel/actions/AuthorizationActions";
import * as passport from "passport";

const router = express.Router();
const loginMiddleware = passport.authenticate("local", { session: false });

router.post("/signUp/", AuthorizationActions.signUp);
router.post("/login/", loginMiddleware, AuthorizationActions.login);

export default router;
