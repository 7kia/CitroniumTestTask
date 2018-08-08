/**
 * Created by Илья on 06.08.2018.
 */
import {IDatabase, IMain} from "pg-promise";

import {IUserRepository, User} from "./IUserRepository";
import {Repository} from "./Repository";

class UserRepository implements IUserRepository {
    private db: IDatabase<any>;
    private pgp: IMain;
    public constructor(db: any, pgp: IMain) {
        this.db = db;
        this.pgp = pgp;
    }

    public findUser(searchParam: {[id: string]: string}): User {
        this.db.one(Repository.getSelectQueueString("User", searchParam), [searchParam.id])
        .then((data: any) => {
            return User(data);
        })
        .catch((error: any) => {
            throw Error(error);
        });
        return null;
    }

}

export {
    UserRepository,
};
