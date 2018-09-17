/**
 * Created by Илья on 14.09.2018.
 */
import {Request, Response} from "express";
import {AuthorizationRules} from "../rules/AuthorizationRules";
import {AuthorizationStrategies} from "../strategies/AuthorizationStrategies";

export class AuthorizationActions {
  public static async signUp(req: Request, res: Response): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      const email: string = req.query.email;
      const password: string = req.query.password;
      const repeatPassword: string = req.query.repeatPassword;
      const username: string = req.query.name;
      try {
        if (await AuthorizationRules.canSignUp(email, password, repeatPassword, username)) {
          await AuthorizationStrategies.register(req, res);
        }
      } catch (error) {
        AuthorizationStrategies.sendAuthorizeError(res, error);
      }
    });
  }

  public static async signIn(req: Request, res: Response): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      const username: string = req.query.name;
      const password: string = req.query.password;
      try {
        if (await AuthorizationRules.canSignIn(username, password)) {
          AuthorizationStrategies.authorize(res);
        }
      } catch (error) {
        AuthorizationStrategies.sendAuthorizeError(res, error);
      }
    });
  }

}