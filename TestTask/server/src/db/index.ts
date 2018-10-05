/**
 * Created by Илья on 05.08.2018.
 */
import {IDatabase, IMain, IOptions} from "pg-promise";
import * as pgPromise from "pg-promise";

import { IExtensions, UserRepository, GameRepository} from "./repositories";

const initOptions: IOptions<IExtensions> = {
    extend(obj: IExtensions, dc: any) {
        obj.users = new UserRepository(obj, pgp);
        obj.games = new GameRepository(obj, pgp);
    },
};

const config = {
    host: "localhost",
    port: 5432,
    database: "TicTacToe",
    user: "postgres",
    password: "postgres",
};

const pgp: IMain = pgPromise(initOptions);

const postgreSqlManager = pgp(config) as IDatabase<IExtensions> & IExtensions;

export {
    postgreSqlManager,
};

