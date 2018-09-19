/**
 * Created by Илья on 14.09.2018.
 */
import {Request, Response} from "express";
import {postgreSqlManager} from "../../db/index";
import {DataForCreation} from "../../Helpers";
import Dictionary from "typescript-collections/dist/lib/Dictionary";

export class AuthorizationStrategies {
  public static authorize(res: Response) {
    res.status(200);
  }
  public static async register(req: Request, res: Response): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      try {
        const userData: DataForCreation = new Dictionary<string, any>();
        userData.setValue("name", req.query.name);
        userData.setValue("email", req.query.email);
        userData.setValue("password", req.query.password);

        await postgreSqlManager.users.create(userData);
        res.status(200);
      } catch (error) {
        reject(error);
      }
    });
  }
  public static sendAuthorizeError(res: Response, error: Error) {
    res.status(400).json({message: error.stack});
  }
}