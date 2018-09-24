/**
 * Created by Илья on 14.09.2018.
 */
import {Request, Response} from "express";
import {postgreSqlManager} from "../../db/index";
import {DataForCreation} from "../../Helpers";
import Dictionary from "typescript-collections/dist/lib/Dictionary";
import * as jwt from "jwt-simple";
import {JWT_SECRET} from "../../config";
import {User} from "../../db/Entity/User";

const createToken = (username: string) => {
  const payload = { sub: username, iat: new Date().getTime() };
  return jwt.encode(payload , JWT_SECRET);
};

export class AuthorizationStrategies {
  public static authorize(email: string, res: Response): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      try {
        const userData: DataForCreation = new Dictionary<string, any>();
        userData.setValue("email", email);

        const user: User = await postgreSqlManager.users.find(userData);
        res.status(200).json({ token: createToken(email), userId: user.id });
      } catch (error) {
        reject(error);
      }
      resolve();
    });
  }
  public static async register(req: Request, res: Response): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      try {
        const userData: DataForCreation = new Dictionary<string, any>();
        userData.setValue("name", req.body.name);
        userData.setValue("email", req.body.email);
        userData.setValue("password", req.body.password);

        await postgreSqlManager.users.create(userData);
        const user: User = await postgreSqlManager.users.find(userData);
        res.status(200).json({ token: createToken(req.body.name), userId: user.id });
      } catch (error) {
        reject(error);
      }
      resolve();
    });
  }
  public static sendAuthorizeError(res: Response, error: Error) {
    res.status(400).json({message: error.message});
  }
}