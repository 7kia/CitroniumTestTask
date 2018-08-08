/**
 * Created by Илья on 07.08.2018.
 */
import {User} from "../Entity/User";

interface IUserRepository {
    findUser(searchParam: {[id: string]: string}): User ;
}

export {
    User,
    IUserRepository,
};

