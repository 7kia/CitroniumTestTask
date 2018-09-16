import {Express} from "express";
import {GameController} from "../../controllers/GameController";

const GamesRoutes = (app: Express) => {
  app.use("/get-game", GameController.getGame);
};

export default GamesRoutes;
