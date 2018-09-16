/**
 * Created by Илья on 14.09.2018.
 */
import {Request, Response} from "express";
import {DataForCreation} from "../../Helpers";
import Dictionary from "typescript-collections/dist/lib/Dictionary";
import {GameManager} from "../../GameManager";
import {postgreSqlManager} from "../../db/index";
import {Game} from "../../db/Entity/Game";

export class GameStrategies {
  public static async createGame(req: Request, res: Response): Promise<void> {
    const userId: number = req.query.userId;
    const size: number = req.query.size;

    const gameId: number = await GameManager.createGameAndConnectCreator(userId, size);

    const gameData: DataForCreation = new Dictionary<string, any>();
    gameData.setValue("id", gameId);

    const games: Game[] = await postgreSqlManager.games.find(gameData);
    const createdGame: Game = games[0];

    res.status(200).json({gameId: gameId, accessToken: createdGame.accessToken});
  }
  public static async findGames(req: Request, res: Response): Promise<void> {
    const creatorName: string = req.query.creatorName;
    const participantName: string = req.query.participantName;
    const size: number = req.query.size;

    let foundGames: Game[] = null;
    if (participantName && !creatorName) {
      let foundGames: Game[] = await GameManager.getGame(null, participantName, null);
      if (!foundGames) {
        foundGames = await GameManager.getGame(creatorName, null, null);
      }
    } else {
      foundGames = await GameManager.getGame(creatorName, participantName, size);
    }
    res.status(200).json(GameStrategies.generateGameListJson(foundGames));
  }
  public static sendErrorMessage(res: Response, error: Error) {
    res.status(400).json({message: error.stack});
  }
  private static generateGameListJson(games: Game[]): Array<{}> {
    let json: Array<{}> = [];
    for (const game of games) {
      json.push({
        gameId: game.id,
        creatorId: game.creatorGameId,
        participantId: game.participantId,
        size: game.fieldSize,
        gameTime: game.time,
        gameResult: game.gameState
      });
    }
    return json;
  }

  public static async connectToGame(
    userId: number,
    gameId: number,
    res: Response
  ): Promise<void> {
    const successConnection: boolean = await GameManager.connectPlayer(userId, gameId);
    if (successConnection) {
      const gameData: DataForCreation = new Dictionary<string, {}>();
      gameData.setValue("id", gameId);

      const foundGames: Game[] = await postgreSqlManager.games.find(gameData);
      const game: Game = foundGames[0];
      res.status(200).json({accessToken: game.accessToken});
    } else {
      res.status(400).json({message: "Connection failed"});
    }
  }
}