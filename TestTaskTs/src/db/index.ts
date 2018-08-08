/**
 * Created by Илья on 05.08.2018.
 */
import * as promise from "bluebird";
import {IDatabase, IMain, IOptions} from "pg-promise";
import * as pgPromise from "pg-promise";

import { IExtensions, UserRepository} from "./repository";

// pg-promise initialization options:
const initOptions: IOptions<IExtensions> = {
    // promiseLib: promise,
    // // Extending the database protocol with our custom repositories;
    // // API: http://vitaly-t.github.io/pg-promise/global.html#event:extend
    extend(obj: IExtensions, dc: any) {
        // Database Context (dc) is mainly needed for extending multiple databases
        // with different access API.
        // Do not use "require()" here, because this event occurs for every task
        // and transaction being executed, which should be as fast as possible.
        obj.users = new UserRepository(obj, pgp);
    }
    // extend: obj => {
    //     obj.users  => {
    //         return new UserRepository(obj, pgp);
    //     }
    // }
};


const config = {
    host: "localhost",
    port: 5432,
    database: "TicTacToe",
    user: "postgres",
    password: "postgres",
};

const pgp: IMain = pgPromise(initOptions);

// Create the database instance with extensions:
const db = pgp(config) as IDatabase<IExtensions> & IExtensions;

export {db};

