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
import {MyPosition} from "../../MyPosition";
import {logger} from "../../Logger";
import {MyDictionary} from "../../../../client/ts/consts/types";

export class GameStrategies {
  public static async createGame(userId: number, size: number, res: Response): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      try {
        const gameId: number = await GameManager.createGameAndConnectCreator(userId, size);

        const createdGame: Game = await GameManager.findGameById(gameId);
        res.status(200).json({gameId: gameId, accessToken: createdGame.accessToken});

        await GameManager.waitParticipant(createdGame.id);
        await GameManager.runGame(createdGame.id);
      } catch (error) {
        reject(error);
      }
      resolve();
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
          foundGames = await GameManager.getGames(null, participantName, null);
          if (!foundGames) {
            foundGames = await GameManager.getGames(creatorName, null, null);
          }
        } else {
          foundGames = await GameManager.getGames(creatorName, participantName, size);
        }
        const data: string = await GameStrategies.generateGameListJson(foundGames);
        res.status(200).json(data);
      } catch (error) {
        res.status(200).json("{}");
      }
      resolve();
    });
  }
  public static sendErrorMessage(res: Response, error: Error) {
    res.status(400).json({message: error.message});
    logger.info(error.message);
  }
  private static generateGameListJson(games: Game[]): Promise<string> {
    return new Promise<string>(async (resolve, reject) => {
      try {
        let json: Array<{}> = [];
        for (const game of games) {
          json.push(await this.generateGameJson(game, false));
        }
        resolve(JSON.stringify(json));

      } catch (error) {
        reject(error);
      }
      resolve(null);
    });
  }

  private static generateGameJson(game: Game, needField: boolean): Promise<MyDictionary> {
    return new Promise<MyDictionary>(async (resolve, reject) => {
      try {
        const creator: User = await GameManager.findUser(game.creatorGameId);
        let participantName: string;
        try {
          const participant: User = await GameManager.findUser(game.participantId);
          participantName = participant.name;
        } catch (error) {
          participantName = null;
        }

        let result: MyDictionary = {
          id: game.id,
          creatorName: creator.name,
          participantName: participantName,
          creatorGameId: game.creatorGameId,
          participantId: game.participantId,
          size: game.fieldSize,
          time: game.time,
          leadingPlayerId: game.leadingPlayerId,
          winPlayerId: game.winPlayerId,
          gameState: game.gameState,
        };
        if (needField) {
          result.field = game.field;
        }
        resolve(result);
      } catch (error) {
        reject(error);
      }
      resolve(null);
    });
  }

  public static async connectToGame(
    userId: number,
    gameId: number,
    res: Response,
  ): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      try {
        const successConnection: boolean = await GameManager.connectPlayer(userId, gameId);
        if (successConnection) {
          const gameData: DataForCreation = new Dictionary<string, {}>();
          gameData.setValue("id", gameId);

          const foundGames: Game[] = await postgreSqlManager.games.find(gameData);
          const game: Game = foundGames[0];
          res.status(200);
        } else {
          res.status(400).json({message: "Connection failed"});
        }
      } catch (error) {
        reject(error);
      }
      resolve();
    });
  }

  public static async returnIncompleteGame(incompleteGameId: number, res: Response): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      try {
        await GameStrategies.returnGameReport(incompleteGameId, res);
      } catch (error) {
        reject(error);
      }
      resolve();
    });
  }

  public static async returnGameReport(gameId: number, res: Response): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      try {
        const game: Game = await GameManager.findGameById(gameId);
        const creator: User = await GameManager.findUser(game.creatorGameId);
        let participant: User = null;
        if (game.participantId) {
          try {
             participant = await GameManager.findUser(game.participantId);
          } catch (error) {
            reject(new Error("In game with id = " + game.id + " not found participant"));
          }
        }

        res.status(200).json({
          id: game.id,
          creatorName: creator.name,
          participantName: participant ? participant.name : null,
          creatorId: creator.id,
          participantId: participant ? participant.id : null,
          time: game.time,
          leadingPlayerId: game.leadingPlayerId,
          gameState: game.gameState,
        });
      } catch (error) {
        reject(error);
      }
      resolve();
    });
  }

  public static returnNullId(res: Response) {
    res.status(200).json({id: null});
  }

  public static setLoser(
    userId: number,
    gameId: number,
    res: Response,
  ): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      try {
        await GameManager.setLoser(userId, gameId);
        res.status(200);
      } catch (error) {
        reject(error);
      }
      resolve();
    });
  }

  public static async takePlayerMove(
    position: MyPosition,
    userId: number,
    gameId: number,
    res: Response,
  ): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      try {
        console.log("TakePlayerMove");
        await GameManager.takePlayerMove(userId, position, gameId);
        res.status(200);
      } catch (error) {
        reject(error);
      }
      resolve();
    });

  }

  public static getGame(gameId: number, res: Response): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      try {
        const game: Game = await GameManager.findGameById(gameId);
        res.status(200).json(await this.generateGameJson(game, true));
      } catch (error) {
        reject(error);
      }
      resolve();
    });
  }
}