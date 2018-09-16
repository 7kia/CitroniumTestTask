/**
 * Created by Илья on 14.09.2018.
 */
import {DataForCreation} from "../../Helpers";
import Dictionary from "typescript-collections/dist/lib/Dictionary";
import {postgreSqlManager} from "../../db/index";
import {User} from "../../db/Entity/User";
import {GameManager} from "../../GameManager";

export class GameRules {
  public static async canCreateGame(userId: number, size: number): boolean {
    let foundUser: User = null;
    try {
      const userData: DataForCreation = new Dictionary<string, any>();
      userData.setValue("id", userId);

      foundUser = await postgreSqlManager.users.find(userData);
    } catch (error) {
      throw new Error("User with id = " + userId + " not found");
    }
    return foundUser
      && !GameRules.userPlay(foundUser)
      && GameRules.validateSize(size);
  }

  public static async checkSearchGameParameters(
    creatorName: string,
    participantName: string,
    size: number
  ) {
    if (creatorName || participantName || size) {
      return true;
    }
    throw new Error("Parameters not set");
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