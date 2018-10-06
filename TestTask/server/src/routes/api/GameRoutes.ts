import * as express from "express";
import {GameActions} from "../../DomainModel/actions/GameActions";
const router = express.Router();

router.post("/create", GameActions.createGame);
router.get("/find", GameActions.findGames);
router.post("/connect-user-to-game", GameActions.connectToGame);
router.get("/get-user-incomplete-game", GameActions.getUserIncompleteGame);
router.post("/set-loser", GameActions.setLoser);
router.get("/get-game-report", GameActions.getGameReport);
router.post("/take-player-move", GameActions.takePlayerMove);

export default router;
