/**
 * Created by Илья on 14.09.2018.
 */
import {Request, Response} from "express";
import {GameRules} from "../rules/GameRules";
import {GameStrategies} from "../strategies/GameStrategies";

export class GameActions {
  public static async createGame(req: Request, res: Response) {
    const userId: number = req.query.userId;
    const size: number = req.query.size;
    try {
      if (await GameRules.canCreateGame(userId, size)) {
        await GameStrategies.createGame(req, res);
      }
    } catch (error) {
      GameStrategies.sendErrorMessage(res, error);
    }
  }
  public static async findGames(req: Request, res: Response) {
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
  }
  public static async connectToGame(req: Request, res: Response): Promise<void> {
    const userId: number = req.query.userId;
    const gameId: number = req.query.gameId;
    try {
      if (await GameRules.canConnectToGame(userId, gameId)) {
        GameStrategies.connectToGame(userId, gameId, res);
      }
    } catch (error) {
      GameStrategies.sendErrorMessage(res, error);
    }
  }
}