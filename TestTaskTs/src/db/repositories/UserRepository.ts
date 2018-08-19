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
import * as Collections from "typescript-collections";
import {DataForCreation} from "../../Helpers";
import Dictionary from "typescript-collections/dist/lib/Dictionary";

class UserRepository extends Repository {
  public constructor(db: any, pgp: IMain) {
    super(db, pgp);
  }

  public async find(searchParameters: DataForCreation): User {
    let foundData: DataForCreation =  new Dictionary<string, any>();

    await this.db.one(Repository.getSelectQueueString("User", searchParameters))
      .then((data) => {
        foundData.setValue("id", data.id);
        foundData.setValue("name", data.name);
        foundData.setValue("email", data.email);
        foundData.setValue("password", data.password);
        foundData.setValue("access_token", data.access_token);
      })
      .catch((error: Error) => {
        logger.error("Error to SELECT queue.");
        logger.error(error);
        throw new QueryResultError(error);
      });
    const foundUser: User = new User(foundData);
    logger.info(
      "Found user with id=" + foundData.getValue("id")
      + ". Search parameters:" + Repository.generateNewDataString(searchParameters),
    );
    return foundUser;
  }

  public async create(parameters: DataForCreation) {
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

  public async deleteUser(searchParameters: DataForCreation) {
    let foundData: DataForCreation =  new Dictionary<string, any>();

    await this.db.result(Repository.getDeleteQueueString("User", searchParameters))
      .then((data) => {
        foundData.setValue("id", data.id);
        foundData.setValue("name", data.name);
        foundData.setValue("email", data.email);
        foundData.setValue("password", data.password);
        foundData.setValue("access_token", data.access_token);
      })
      .catch((error: Error) => {
        logger.error("Error to DELETE queue.");
        logger.error(error);
        throw error;
      });
    logger.info(
      "Delete user with id=" + foundData.getValue("id")
      + ". Search parameters:" + Repository.generateCriteriaString(searchParameters),
    );
  }

  public async update(userId: number, whatUpdate: DataForCreation) {
    let searchParameters: DataForCreation = new Dictionary<string, any>();
    searchParameters.setValue("id", userId);
    await this.db.none(Repository.getUpdateQueueString("User", searchParameters, whatUpdate))
      .then((data) => {
        logger.info(
          "Update user. New parameters:" + Repository.generateNewDataString(whatUpdate),
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
