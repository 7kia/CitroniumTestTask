/**
 * Created by Илья on 07.08.2018.
 */
import {UserRepository} from "./UserRepository";

// Database Interface Extensions:
interface IExtensions {
    users: UserRepository;
}

export {
    IExtensions,
    UserRepository,
};
