/**
 * Created by Илья on 14.09.2018.
 */
import {DataForCreation} from "../../Helpers";
import Dictionary from "typescript-collections/dist/lib/Dictionary";
import {postgreSqlManager} from "../../db/index";
import {User} from "../../db/Entity/User";
import {GameManager} from "../../GameManager";
import {Game} from "../../db/Entity/Game";

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
      const canStandParticipant: boolean =  await GameManager.canStandParticipant(userId, gameId);
      if (!canStandParticipant) {
        reject(new Error("Player not can connect"));
      }
      resolve(canStandParticipant);
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
}