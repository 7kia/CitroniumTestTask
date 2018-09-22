/**
 * Created by Илья on 14.09.2018.
 */
import {Request, Response} from "express";
import {postgreSqlManager} from "../../db/index";
import {DataForCreation} from "../../Helpers";
import Dictionary from "typescript-collections/dist/lib/Dictionary";
import * as jwt from "jwt-simple";
import {JWT_SECRET} from "../../config";

const createToken = (username: string) => {
  const payload = { sub: username, iat: new Date().getTime() };
  return jwt.encode(payload , JWT_SECRET);
};

export class AuthorizationStrategies {
  public static authorize(username: string, res: Response) {
    res.status(200).json({ token: createToken(username) });
  }
  public static async register(req: Request, res: Response): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      try {

        const userData: DataForCreation = new Dictionary<string, any>();
        userData.setValue("name", req.body.name);
        userData.setValue("email", req.body.email);
        userData.setValue("password", req.body.password);

        await postgreSqlManager.users.create(userData);
        res.status(200).json({ token: createToken(req.body.name) });
      } catch (error) {
        reject(error);
      }
    });
  }
  public static sendAuthorizeError(res: Response, error: Error) {
    res.status(400).json({message: error.message});
  }
}