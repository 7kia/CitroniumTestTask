import {Express} from "express";
import {GameActions} from "../../DomainModel/actions/GameActions";

const GamesRoutes = (app: Express) => {
  app.use("/create-game", GameActions.createGame);
  app.use("/find-games", GameActions.findGames);
  app.use("/connect-user-to-game", GameActions.connectToGame);
  app.use("/get-user-incomplete-game", GameActions.getUserIncompleteGame);
  app.use("/set-loser", GameActions.setLoser);
  app.use("/get-game-report", GameActions.getGameReport);
  app.use("/take-player-move", GameActions.takePlayerMove);

};

export default GamesRoutes;
