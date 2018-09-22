/**
 * Created by Илья on 14.09.2018.
 */
import {Request, Response} from "express";
import {AuthorizationRules} from "../rules/AuthorizationRules";
import {AuthorizationStrategies} from "../strategies/AuthorizationStrategies";

export class AuthorizationActions {
  public static async signUp(req: Request, res: Response): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      const email: string = req.body.email;
      const username: string = req.body.name;
      try {
        if (await AuthorizationRules.canSignUp(email, username)) {
          await AuthorizationStrategies.register(req, res);
        }
      } catch (error) {
        AuthorizationStrategies.sendAuthorizeError(res, error);
      }
      resolve();
    });
  }

  public static async login(req: Request, res: Response): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      const email: string = req.body.email;
      const password: string = req.body.password;
      try {
        if (await AuthorizationRules.canSignIn(email, password)) {
          AuthorizationStrategies.authorize(email, res);
        }
      } catch (error) {
        AuthorizationStrategies.sendAuthorizeError(res, error);
      }
      resolve();
    });
  }

}