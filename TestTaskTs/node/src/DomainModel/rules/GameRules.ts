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
    let foundUser: User = null;
    try {
      const userData: DataForCreation = new Dictionary<string, any>();
      userData.setValue("id", userId);

      foundUser = await postgreSqlManager.users.find(userData);
    } catch (error) {
      throw new Error("User with id = " + userId + " not found");
    }
    if (!GameRules.userPlay(foundUser)) {
      throw new Error("The user play in other game");
    }
    return GameRules.validateSize(size);
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

  public static async canConnectToGame(userId: number, gameId: number): Promise<boolean> {
    return GameManager.canStandParticipant(userId, gameId);
  }

  private static async findUser(userId: number): Promise<User> {
    return new Promise<User>(async (resolve, reject) => {
      try {
        const userData: DataForCreation = new Dictionary<string, any>();
        userData.setValue("id", userId);

        const user: User = await postgreSqlManager.users.find(userData);
        resolve(user);
      } catch (error) {
        reject(new Error("User with id = " + userId + " not found"));
      }
    });
  }
  private static async findGame(gameId: number): Promise<Game> {
    return new Promise<Game>(async (resolve, reject) => {
      try {
        const gameData: DataForCreation = new Dictionary<string, any>();
        gameData.setValue("id", gameId);

        const foundGames: Game[] = await postgreSqlManager.games.find(gameData);
        resolve(foundGames[0]);
      } catch (error) {
        reject(new Error("Games with id = " + gameId + " not found"));
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
}