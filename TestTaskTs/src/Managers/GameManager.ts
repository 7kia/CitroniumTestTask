/**
 * Created by Илья on 11.08.2018.
 */
import {Game} from "../db/Entity/Game";
import {User} from "../db/Entity/User";
import {db} from "../db";
import {logger} from "../Logger";

class GameManeger {
  public static async getGame(
    creatorName: string,
    participantName: string,
    fieldSize: number,
  ): Game {
    try {
      let searchData: {[id: string]: any} = {};

      if (creatorName) {
        const user: User = await db.users.find({name: creatorName});
        searchData.creator_game_id = user.id;
      }
      if (participantName) {
        const user: User = await db.users.find({name: participantName});
        searchData.participant_id = user.id;
      }
      if (fieldSize) {
        searchData.field_size = fieldSize;
      }
      return await db.games.find(searchData);
    } catch (error: Error) {
      logger.error(error);
      throw Error(error);
    }
  }
}

export {GameManeger};
