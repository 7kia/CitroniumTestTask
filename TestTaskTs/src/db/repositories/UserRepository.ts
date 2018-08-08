/**
 * Created by Илья on 06.08.2018.
 */
import {IDatabase, IMain} from "pg-promise";

import {IUserRepository, User} from "./IUserRepository";
import {Repository} from "./Repository";
import extend from "jquery";

class UserRepository implements IUserRepository {
    private db: IDatabase<any>;
    private pgp: IMain;
    public constructor(db: any, pgp: IMain) {
        this.db = db;
        this.pgp = pgp;
    }


    public async findUser(searchParam: {[id: string]: string}): User {
      function copy(mainObj): any {
        let objCopy = {}; // objCopy will store a copy of the mainObj
        let key;

        for (key in mainObj) {
          objCopy[key] = mainObj[key]; // copies each property to the objCopy object
        }
        return objCopy;
      }

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
            properties = copy(datas);
          return new User(
            properties.id,
            properties.name,
            properties.email,
            properties.password,
            properties.accessToken,
          );
        })
        .catch((error) => {
            console.log("ERROR:", error);
        });


        return new User(
          properties.id,
          properties.name,
          properties.email,
          properties.password,
          properties.accessToken,
        );
    }

}

export {
    UserRepository,
};
