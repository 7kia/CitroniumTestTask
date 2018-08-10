/**
 * Created by Илья on 10.08.2018.
 */
/**
 * Created by Илья on 07.08.2018.
 */
import {Game} from "../Entity/Game";

interface IGameRepository {
  find(searchParam: {[id: string]: string}): Game;
  create(parameters: {[id: string]: string});
  deleteGame(parameters: {[id: string]: string});
}

export {
  Game,
  IGameRepository,
};

