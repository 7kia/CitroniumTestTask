import * as express from "express";
import {GameActions} from "../../DomainModel/actions/GameActions";

const router = express.Router();

router.use("/create", GameActions.createGame);
router.use("/find", GameActions.findGames);
router.use("/connect-user-to-game", GameActions.connectToGame);
router.use("/get-user-incomplete-game", GameActions.getUserIncompleteGame);
router.use("/set-loser", GameActions.setLoser);
router.use("/get-game-report", GameActions.getGameReport);
router.use("/take-player-move", GameActions.takePlayerMove);

export default router;
