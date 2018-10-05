/**
 * Created by Илья on 14.09.2018.
 */
import {DataForCreation} from "../../Helpers";
import Dictionary from "typescript-collections/dist/lib/Dictionary";
import {postgreSqlManager} from "../../db/index";
import {User} from "../../db/Entity/User";

export class AuthorizationRules {
  public static async canSignIn(email: string, password: string): Promise<boolean> {
    return new Promise<boolean>(async (resolve, reject) => {
      try {
        let foundUser: User = null;
        try {
          const userData: DataForCreation = new Dictionary<string, {}>();
          userData.setValue("email", email);

          foundUser = await postgreSqlManager.users.find(userData);
        } catch (error) {
          reject(new Error("User with email \"" + email + "\" not found"));
        }
        if (foundUser) {
          if (password === foundUser.password) {
            resolve(true);
          }
          reject(new Error("Password incorrect"));
        }
        resolve(false);
      } catch (error) {
        reject(error);
      }
    });
  }

  public static async canSignUp(email: string, username: string): Promise<boolean> {
    return new Promise<boolean>(async (resolve, reject) => {
      try {
        if (await AuthorizationRules.existUser("email", email)) {
          reject(new Error("User with the email exist"));
        }
        if (await AuthorizationRules.existUser("name", username)) {
          reject(new Error("User with the name exist"));
        }
        resolve(true);
      } catch (error) {
        reject(error);
      }
    });
  }

  private static async existUser(propertyName: string, value: string): Promise<boolean> {
    return new Promise<boolean>(async (resolve, reject) => {
      try {
        const userData: DataForCreation = new Dictionary<string, any>();
        userData.setValue(propertyName, value);

        const foundUser: User = await postgreSqlManager.users.find(userData);
        if (foundUser) {
          resolve(true);
        }
      } catch (error) {
        resolve(false);
      }
      resolve(false);
    });
  }
}