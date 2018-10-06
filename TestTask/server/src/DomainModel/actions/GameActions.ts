/**
 * Created by Илья on 14.09.2018.
 */
import {Request, Response} from "express";
import {GameRules} from "../rules/GameRules";
import {GameStrategies} from "../strategies/GameStrategies";
import {GameManager} from "../../GameManager";
import {MyPosition} from "../../MyPosition";
import {logger} from "../../Logger";

export class GameActions {
  public static async createGame(req: Request, res: Response): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      const userId: number = req.body.userId;
      const size: number = req.body.size;
      try {
        logger.info(
          "User create game. UserId=" + userId + "; size=" + size,
        );
        if (await GameRules.canCreateGame(userId, size)) {
          await GameStrategies.createGame(userId, size, res);
        }
      } catch (error) {
        GameStrategies.sendErrorMessage(res, error);
      }
      logger.info("Game create successful");
      resolve();
    });

  }
  public static async findGames(req: Request, res: Response): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      const creatorName: string = req.query.creatorName;
      const participantName: string = req.query.participantName;
      const size: number = req.query.size;
      try {
        logger.info(
          "User search games. Seatch parameters: CreatorName=" + creatorName
          + "; participantName=" + participantName
          + "; size=" + size,
        );
        if (await GameRules.checkSearchGameParameters(creatorName, participantName, size)) {
          await GameStrategies.findGames(req, res);
        }
      } catch (error) {
        GameStrategies.sendErrorMessage(res, error);
      }
      logger.info("Game search successful");
      resolve();
    });
  }
  public static async connectToGame(req: Request, res: Response): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      const userId: number = req.body.userId;
      const gameId: number = req.body.gameId;
      try {
        logger.info(
          "User connect to games. UserId=" + userId + "; gameId=" + gameId,
        );
        if (await GameRules.canConnectToGame(userId, gameId)) {
          await GameStrategies.connectToGame(userId, gameId, res);
        }
      } catch (error) {
        GameStrategies.sendErrorMessage(res, error);
      }
      logger.info("User connect successful");
      resolve();
    });
  }
  public static async getUserIncompleteGame(req: Request, res: Response): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      const userId: number = parseInt(req.query.userId, 10);
      try {
        logger.info("Search user incomplete game. UserId=" + userId);
        const incompleteGameId: number = await GameManager.getIncompleteGame(userId);
        if (incompleteGameId !== null) {
          await GameStrategies.returnIncompleteGame(incompleteGameId, res);
          logger.info("Incomplete game found");
        } else {
          await GameStrategies.returnNullId(res);
          logger.info("Player not play to any game");
        }
      } catch (error) {
        GameStrategies.sendErrorMessage(res, error);
      }
      resolve();
    });
  }

  public static async setLoser(req: Request, res: Response): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      const userId: number = req.body.userId;
      const gameId: number = req.body.gameId;
      try {
        logger.info(
          "User want stand loser. UserId=" + userId + "; gameId=" + gameId,
        );
        if (await GameRules.canStandLoser(userId, gameId)) {
          await GameStrategies.setLoser(userId, gameId, res);
        }
      } catch (error) {
        GameStrategies.sendErrorMessage(res, error);
      }
      logger.info("Player stand loser");
      resolve();
    });
  }
  public static async getGameReport(req: Request, res: Response): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      const gameId: number = req.query.gameId;
      try {
        logger.info("Get game report");
        if (await GameRules.existGame(gameId)) {
          await GameStrategies.returnGameReport(gameId, res);
        }
      } catch (error) {
        GameStrategies.sendErrorMessage(res, error);
      }
      logger.info("Report send");
      resolve();
    });
  }

  public static async takePlayerMove(req: Request, res: Response): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      const row: number = req.body.row;
      const column: number = req.body.column;
      const userId: number = req.body.userId;
      const gameId: number = req.body.gameId;
      try {
        logger.info(
          "User move to game. Data: UserId=" + userId
          + "; gameId=" + gameId
          + "; row=" + row
          + "; column=" + column,
        );
        if (await GameRules.canTakeMove(userId, gameId)) {
          if (await GameRules.positionNotOutFiled(column, row, gameId)) {
            await GameStrategies.takePlayerMove(new MyPosition(column, row), userId, gameId, res);
          }
        }
      } catch (error) {
        GameStrategies.sendErrorMessage(res, error);
      }
      logger.info("Player move successful");
      resolve();
    });
  }
}