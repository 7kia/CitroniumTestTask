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
    const userId: string = req.query.userId;
    const size: string = req.query.size;

    const gameId: number = await GameManager.createGameAndConnectCreator(userId, size);

    const gameData: DataForCreation = new Dictionary<string, {}>();
    gameData.setValue("id", gameId);

    const games: Game[] = await postgreSqlManager.games.find(gameData);
    const createdGame: Game = games[0];

    res.status(200).json({gameId: gameId, accessToken: createdGame.accessToken});
  }
  public static async findGames(req: Request, res: Response): Promise<void> {
    const creatorName: string = req.query.creatorName;
    const participantName: string = req.query.participantName;
    const size: number = req.query.size;

    if (participantName && !creatorName) {
      await GameManager.getGame(null, participantName, null);
      await GameManager.getGame(creatorName, null, null);
      if (await !GameStrategies.searchGameByPlayer(participantName)) {
        await GameStrategies.searchGameByPlayer(creatorName);
      }
    } else {
      const foundGames: Game[] = await GameManager.getGame(creatorName, participantName, size);
      res.status(200).json(GameStrategies.generateGameListJson(foundGames));
    }
  }
  public static sendErrorMessage(res: Response, error: Error) {
    res.status(400).json({message: error.stack});
  }
  private static generateGameListJson(games: Game[]): Array<{}> {
    let json: Array<{}> = [];
    for (const game: Game of games) {
      json.push({
        gameId: game.id,
        creatorId: game.creatorGameId,
        participantId: game.participantId,
        size: game.size,
        gameTime: game.time,
        gameResult: game.getGameState()
      });
    }
    return json;
  }
}