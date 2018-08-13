/**
 * Created by Илья on 06.08.2018.
 */
import {IDatabase, IMain} from "pg-promise";

import {Repository} from "./Repository";
import {Helpers} from "../../Helpers";
import {logger} from "../../Logger";
import * as pgPromise from "pg-promise";
import QueryResultError = pgPromise.errors.QueryResultError;
import {User} from "../Entity/User";

class UserRepository extends Repository {
  public constructor(db: any, pgp: IMain) {
    super(db, pgp);
  }

  public async find(searchParameters: {[id: string]: any}): User {
    let properties: object = {};
    await this.db.one(Repository.getSelectQueueString("User", searchParameters))
      .then((data) => {
        const foundData: {[id: string]: any} =  {
          id: data.id,
          name: data.name,
          email: data.email,
          password: data.password,
          access_token: data.access_token,
        };
        properties = Helpers.copyByValue(foundData);
      })
      .catch((error: Error) => {
        logger.error("Error to SELECT queue.");
        logger.error(error);
        throw new QueryResultError(error);
      });
    const foundUser: User = new User(properties);
    logger.info(
      "Found user with id=" + properties.id
      + ". Search parameters:" + Repository.generateNewDataString(searchParameters),
    );
    return foundUser;
  }

  public async create(parameters: {[id: string]: any}) {
    await this.db.none(Repository.getInsertQueueString("User", parameters))
      .then((data) => {
        logger.info(
          "Create user. Creation parameters:" + Repository.generateNewDataString(parameters),
        );
      })
      .catch((error: Error) => {
        logger.error("Error to INSERT queue.");
        logger.error(error);
        throw error;
      });
  }

  public async deleteUser(searchParameters: {[id: string]: any}) {
    let properties: object = {};
    await this.db.result(Repository.getDeleteQueueString("User", searchParameters))
      .then((result) => {
        const foundData =  {
          id: result.id,
          name: result.name,
          email: result.email,
          password: result.password,
          access_token: result.access_token,
        };
        properties = Helpers.copyByValue(foundData);
      })
      .catch((error: Error) => {
        logger.error("Error to DELETE queue.");
        logger.error(error);
        throw error;
      });
    logger.info(
      "Delete user with id=" + properties.id
      + ". Search parameters:" + Repository.generateCriteriaString(searchParameters),
    );
  }

  public async update(user: User) {
    const newData: {[id: string]: any} = {
      name: user.name,
      email: user.email,
      password: user.password,
      access_token: user.accessToken,
    };
    await this.db.none(Repository.getUpdateQueueString("User", {id: user.id}, newData))
      .then((data) => {
        logger.info(
          "Update user. New parameters:" + Repository.generateNewDataString(newData),
        );
      })
      .catch((error: Error) => {
        logger.error("Error to UPDATE queue.");
        logger.error(error);
        throw error;
      });
  }
}

export {
    UserRepository,
};
