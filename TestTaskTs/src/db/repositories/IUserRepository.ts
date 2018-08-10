/**
 * Created by Илья on 07.08.2018.
 */
import {User} from "../Entity/User";

interface IUserRepository {
    find(searchParam: {[id: string]: string}): User;
    create(parameters: {[id: string]: string});
    deleteUser(parameters: {[id: string]: string});
}

export {
    User,
    IUserRepository,
};

