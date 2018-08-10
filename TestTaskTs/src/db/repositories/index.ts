/**
 * Created by Илья on 07.08.2018.
 */
import {UserRepository} from "./UserRepository";
import {GameRepository} from "./GameRepository";

// Database Interface Extensions:
interface IExtensions {
    users: UserRepository;
    games: GameRepository;
}

export {
    IExtensions,
    UserRepository,
    GameRepository,
};
