/**
 * Created by Илья on 14.09.2018.
 */
import {DataForCreation} from "../../Helpers";
import Dictionary from "typescript-collections/dist/lib/Dictionary";
import {postgreSqlManager} from "../../db/index";
import {User} from "../../db/Entity/User";

export class AuthorizationRules {
  public static async canSignIn(username: string, password: string): Promise<boolean> {
    let foundUser: User = null;
    try {
      const userData: DataForCreation = new Dictionary<string, {}>();
      userData.setValue("name", username);

      foundUser = await postgreSqlManager.users.find(userData);
    } catch (error) {
      throw new Error("User with name \"" + username + "\" not found");
    }
    if (foundUser) {
      if (password === foundUser.password) {
        return true;
      }
      throw new Error("Password incorrect");
    }
    return false;
  }

  public static async canSignUp(
    email: string,
    password: string,
    repeatPassword: string,
    username: string
  ): Promise<boolean> {
    if (await AuthorizationRules.existUser("email", email)) {
      throw new Error("User with the email exist");
    }
    if (await AuthorizationRules.existUser("name", username)) {
      throw new Error("User with the name exist");
    }
    if (password !== repeatPassword) {
      throw new Error("Passwords is not equal");
    }
    return true;
  }

  private static async existUser(propertyName: string, value: string): Promise<boolean> {
    try {
      const userData: DataForCreation = new Dictionary<string, {}>();
      userData.setValue(propertyName, value);

      const foundUser: User = await postgreSqlManager.users.find(userData);
      if (foundUser) {
        return true;
      }
    } catch (error) {
      return false;
    }
    return false;
  }
}