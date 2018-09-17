/**
 * Created by Илья on 14.09.2018.
 */
import {Request, Response} from "express";
import {DataForCreation} from "../../Helpers";
import Dictionary from "typescript-collections/dist/lib/Dictionary";
import {GameManager} from "../../GameManager";
import {postgreSqlManager} from "../../db/index";
import {Game} from "../../db/Entity/Game";
import {User} from "../../db/Entity/User";

export class GameStrategies {
  public static async createGame(req: Request, res: Response): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      try {
        const userId: number = req.query.userId;
        const size: number = req.query.size;

        const gameId: number = await GameManager.createGameAndConnectCreator(userId, size);

        const gameData: DataForCreation = new Dictionary<string, any>();
        gameData.setValue("id", gameId);

        const games: Game[] = await postgreSqlManager.games.find(gameData);
        const createdGame: Game = games[0];

        res.status(200).json({gameId: gameId, accessToken: createdGame.accessToken});
      } catch (error) {
        reject(error);
      }
    });

  }
  public static async findGames(req: Request, res: Response): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      try {
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
      } catch (error) {
        reject(error);
      }
    });
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
    return new Promise<void>(async (resolve, reject) => {
      try {
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
      } catch (error) {
        reject(error);
      }
    });
  }

  public static async returnIncompleteGame(incompleteGameId: number, res: Response): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      try {
        const gameData: DataForCreation = new Dictionary<string, any>();
        gameData.setValue("id", incompleteGameId);

        const game: Game = await GameManager.findGame(gameData);
        GameStrategies.returnGameReport(game, res);
      } catch (error) {
        reject(error);
      }
    });
  }

  private static async returnGameReport(game: Game, res: Response): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      try {
        const creator: User = await GameManager.findUser(game.creatorGameId);
        const participantName: string = null;
        if (game.participantId) {
          try {
            const participant: User = await GameManager.findUser(game.participantId);
            participantName = participant.name;
          } catch (error) {
            reject(new Error("In game with id = " + game.id + " not found participant"));
          }
        }

        res.status(200).json({
          id: game.id,
          creatorName: creator.name,
          participantName: participantName,
          time: game.time,
          leadingPlayerId: game.leadingPlayerId,
          winPlayerId: game.winPlayerId
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  public static returnNullId(res: Response) {
    res.status(200).json({id: null});
  }
}