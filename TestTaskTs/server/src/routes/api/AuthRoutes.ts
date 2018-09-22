import * as express from "express";
import {AuthorizationActions} from "../../DomainModel/actions/AuthorizationActions";

const router = express.Router();

router.post("/signUp/", AuthorizationActions.signUp);
router.post("/login/", AuthorizationActions.login);

export default router;
