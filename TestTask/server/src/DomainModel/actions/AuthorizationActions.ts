/**
 * Created by Илья on 14.09.2018.
 */
import {Request, Response} from "express";
import {AuthorizationRules} from "../rules/AuthorizationRules";
import {AuthorizationStrategies} from "../strategies/AuthorizationStrategies";
import {logger} from "../../Logger";

export class AuthorizationActions {
  public static async signUp(req: Request, res: Response): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      const email: string = req.body.email;
      const username: string = req.body.name;
      try {
        logger.info(
          "User try sign up. Email=" + email + "; username=" + username,
        );
        if (await AuthorizationRules.canSignUp(email, username)) {
          await AuthorizationStrategies.register(req, res);
        }
      } catch (error) {
        AuthorizationStrategies.sendAuthorizeError(res, error);
      }
      logger.info("Sign up successful");
      resolve();
    });
  }

  public static async login(req: Request, res: Response): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      const email: string = req.body.email;
      const password: string = req.body.password;
      try {
        logger.info(
          "User try login. Email=" + email + "; password=" + password,
        );
        if (await AuthorizationRules.canSignIn(email, password)) {
          await AuthorizationStrategies.authorize(email, res);
        }
      } catch (error) {
        AuthorizationStrategies.sendAuthorizeError(res, error);
      }
      logger.info("Login successful");
      resolve();
    });
  }
}