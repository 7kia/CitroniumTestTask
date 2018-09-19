/**
 * Created by Илья on 14.09.2018.
 */
import {DataForCreation, Helpers} from "../../Helpers";
import Dictionary from "typescript-collections/dist/lib/Dictionary";
import {postgreSqlManager} from "../../db/index";
import {User} from "../../db/Entity/User";
import {GameManager} from "../../GameManager";
import {Game, GameState} from "../../db/Entity/Game";

export class GameRules {
  public static async canCreateGame(userId: number, size: number): Promise<boolean> {
    return new Promise<boolean>(async (resolve, reject) => {
      let foundUser: User = await GameManager.findUser(userId);
      if (!GameRules.userPlay(foundUser)) {
        reject(new Error("The user play in other game"));
      }
      resolve(GameRules.validateSize(size));
    });
  }

  public static async checkSearchGameParameters(
    creatorName: string,
    participantName: string,
    size: number
  ): Promise<boolean> {
    return new Promise<boolean>(async (resolve, reject) => {
      if (creatorName || participantName || size) {
        resolve(true);
      }
      reject(new Error("Parameters not set"));
    });
  }

  public static async canConnectToGame(userId: number, gameId: number): Promise<boolean> {
    return new Promise<boolean>(async (resolve, reject) => {
      try {
        const canStandParticipant: boolean =  await GameManager.canStandParticipant(userId, gameId);
        if (!canStandParticipant) {
          reject(new Error("Player not can connect"));
        }
        resolve(canStandParticipant);
      } catch (error) {
        reject(error);
      }
    });
  }

  private static validateSize(size: number): boolean {
    if (size > 2) {
      return true;
    }
    throw new Error("Size must be more 2");
  }

  private static userPlay(user: User) {
    return user.accessToken !== null;
  }

  public static async canStandLoser(userId: number, gameId: number): Promise<boolean> {
    return new Promise<boolean>(async (resolve, reject) => {
      try {
        const user: User = await GameManager.findUser(userId);
        const game: Game = await GameManager.findGameById(gameId);
        if (!game.participantId) {
          reject(new Error("Game with id =" + gameId + " not have participant"));
        }
        if (!game.creatorGameId) {
          reject(new Error("Game with id =" + gameId + " not have creator"));
        }
        if ((game.creatorGameId !== user.id) && (game.participantId !== user.id)) {
          reject(new Error("User not participant in the game"));
        }
        resolve(game.gameState === GameState.NoWinner);
      } catch (error) {
        reject(error);
      }
    });
  }

  public static async existGame(gameId: number): Promise<boolean> {
    return new Promise<boolean>(async (resolve, reject) => {
      try {
        const game: Game = await GameManager.findGameById(gameId);
        if (!game) {
          reject(new Error("Game with id =" + gameId + " not exist"));
        }
        resolve(true);
      } catch (error) {
        reject(error);
      }
      resolve(false);
    });
  }

  public static async canTakeMove(userId: number, gameId: number): Promise<boolean> {
    return new Promise<boolean>(async (resolve, reject) => {
      try {
        const user: User = await GameManager.findUser(userId);
        const game: Game = await GameManager.findGameById(gameId);

        if ((game.creatorGameId !== user.id) && (game.participantId !== user.id)) {
          reject(new Error("The player not participate in the game"));
        }
        if (game.leadingPlayerId === user.id) {
          resolve(true);
        } else {
          reject(new Error("Now take move another player"));
        }
      } catch (error) {
        reject(error);
      }
      resolve(false);
    });
  }

  public static async positionNotOutFiled(
    column: number,
    row: number,
    gameId: number
  ): Promise<boolean> {
    return new Promise<boolean>(async (resolve, reject) => {
      try {
        const game: Game = await GameManager.findGameById(gameId);

        if (!Helpers.between(column, 0, game.fieldSize - 1)
          || !Helpers.between(row, 0, game.fieldSize - 1)) {
          reject(new Error("Position out of range"));
        }
      } catch (error) {
        reject(error);
      }
      resolve(false);
    });
  }
}