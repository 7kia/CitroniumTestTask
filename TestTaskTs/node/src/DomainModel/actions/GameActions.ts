/**
 * Created by Илья on 14.09.2018.
 */
import {Request, Response} from "express";
import {GameRules} from "../rules/GameRules";
import {GameStrategies} from "../strategies/GameStrategies";
import {GameManager} from "../../GameManager";
import {MyPosition} from "../../MyPosition";

export class GameActions {
  public static async createGame(req: Request, res: Response): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      const userId: number = req.query.userId;
      const size: number = req.query.size;
      try {
        if (await GameRules.canCreateGame(userId, size)) {
          await GameStrategies.createGame(req, res);
        }
      } catch (error) {
        GameStrategies.sendErrorMessage(res, error);
      }
      resolve()
    });

  }
  public static async findGames(req: Request, res: Response): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      const creatorName: string = req.query.creatorName;
      const participantName: string = req.query.participantName;
      const size: number = req.query.size;
      try {
        if (await GameRules.checkSearchGameParameters(creatorName, participantName, size)) {
          await GameStrategies.findGames(req, res);
        }
      } catch (error) {
        GameStrategies.sendErrorMessage(res, error);
      }
      resolve();
    });
  }
  public static async connectToGame(req: Request, res: Response): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      const userId: number = req.query.userId;
      const gameId: number = req.query.gameId;
      try {
        if (await GameRules.canConnectToGame(userId, gameId)) {
          await GameStrategies.connectToGame(userId, gameId, res);
        }
      } catch (error) {
        GameStrategies.sendErrorMessage(res, error);
      }
      resolve();
    });
  }
  public static async getUserIncompleteGame(req: Request, res: Response): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      const userId: number = req.query.userId;
      try {
        const incompleteGameId: number = await GameManager.getIncompleteGame(userId);
        if (incompleteGameId !== null) {
          await GameStrategies.returnIncompleteGame(incompleteGameId, res);
        } else {
          await GameStrategies.returnNullId(res);
        }
      } catch (error) {
        GameStrategies.sendErrorMessage(res, error);
      }
      resolve();
    });
  }

  public static async setLoser(req: Request, res: Response): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      const userId: number = req.query.userId;
      const gameId: number = req.query.gameId;
      try {
        if (await GameRules.canStandLoser(userId, gameId)) {
          await GameStrategies.setLoser(userId, gameId, res);
        }
      } catch (error) {
        GameStrategies.sendErrorMessage(res, error);
      }
      resolve();
    });
  }
  public static async getGameReport(req: Request, res: Response): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      const gameId: number = req.query.gameId;
      try {
        if (await GameRules.existGame(gameId)) {
          await GameStrategies.returnGameReport(gameId, res);
        }
      } catch (error) {
        GameStrategies.sendErrorMessage(res, error);
      }
      resolve();
    });
  }

  public static async takePlayerMove(req: Request, res: Response): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      const row: number = req.query.row;
      const column: number = req.query.column;
      const userId: number = req.query.userId;
      const gameId: number = req.query.gameId;
      try {
        if (await GameRules.canTakeMove(userId, gameId)) {
          if (await GameRules.positionNotOutFiled(column, row, gameId)) {
            await GameStrategies.takePlayerMove(new MyPosition(column, row), userId, gameId, res);
          }
        }
      } catch (error) {
        GameStrategies.sendErrorMessage(res, error);
      }
      resolve();
    });
  }
}