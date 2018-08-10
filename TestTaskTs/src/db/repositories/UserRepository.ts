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


    public async findUser(searchParam: {[id: string]: string}): User {
      let properties: object = {};
      const promise = await this.db.one(Repository.getSelectQueueString("User", searchParam))
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
          logger.error(error);
        });
      const foundUser: User = new User(
        properties.id,
        properties.name,
        properties.email,
        properties.password,
        properties.accessToken,
      );
      logger.info(
        "Found user with " + properties.id
        + ". Search parameters:" + Repository.generateCriteriaString(searchParam),
      );
      return foundUser;
    }

}

export {
    UserRepository,
};
