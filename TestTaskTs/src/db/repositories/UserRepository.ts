/**
 * Created by Илья on 06.08.2018.
 */
import {IDatabase, IMain} from "pg-promise";

import {IUserRepository, User} from "./IUserRepository";
import {Repository} from "./Repository";
import {Helpers} from "../../Helpers";
import {logger} from "../../Logger";

class UserRepository implements IUserRepository {
    private db: IDatabase<any>;
    private pgp: IMain;
    public constructor(db: any, pgp: IMain) {
        this.db = db;
        this.pgp = pgp;
    }

    public async find(searchParameters: {[id: string]: string}): User {
      let properties: object = {};
      await this.db.one(Repository.getSelectQueueString("User", searchParameters))
        .then((data) => {
          const datas =  {
            id: data.id,
            name: data.name,
            email: data.email,
            password: data.password,
            accessToken: data.accessToken,
          };
          properties = Helpers.copyByValue(datas);
        })
        .catch((error) => {
          logger.error("Error to SELECT queue.");
          logger.error(error);
          throw error;
        });
      const foundUser: User = new User(
        properties.id,
        properties.name,
        properties.email,
        properties.password,
        properties.accessToken,
      );
      logger.info(
        "Found user with id=" + properties.id
        + ". Search parameters:" + Repository.generateCriteriaString(searchParameters),
      );
      return foundUser;
    }

  public async create(parameters: {[id: string]: string}) {
    let properties: object = {};
    await this.db.none(Repository.getInsertQueueString("User", parameters))
      .then((data) => {
        logger.info(
          "Create user. Creation parameters:" + Repository.generateCriteriaString(parameters),
        );
      })
      .catch((error) => {
        logger.error("Error to INSERT queue.");
        logger.error(error);
        throw error;
      });
  }

  public async deleteUser(searchParameters: {[id: string]: string}) {
    let properties: object = {};
    await this.db.result(Repository.getDeleteQueueString("User", searchParameters))
      .then((result) => {
        const datas =  {
          id: result.id,
          name: result.name,
          email: result.email,
          password: result.password,
          accessToken: result.accessToken,
        };
        properties = Helpers.copyByValue(datas);
      })
      .catch((error) => {
        logger.error("Error to DELETE queue.");
        logger.error(error);
        throw error;
      });
    logger.info(
      "Delete user with id=" + properties.id
      + ". Search parameters:" + Repository.generateCriteriaString(searchParameters),
    );
  }
}

export {
    UserRepository,
};
