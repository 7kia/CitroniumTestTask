/**
 * Created by Илья on 11.08.2018.
 */
import {Game} from "../db/Entity/Game";
import {User} from "../db/Entity/User";
import {postgreSqlManager} from "../db";
import {logger} from "../Logger";

enum PlayerRole {
  Creator = 1,
  Participant,
  Observer,
}

class GameManeger {
  public static async getGame(
    creatorName: string,
    participantName: string,
    fieldSize: number,
  ): Game {
    try {
      let searchData: {[id: string]: any} = {};

      if (creatorName) {
        const user: User = await postgreSqlManager.users.find({name: creatorName});
        searchData.creator_game_id = user.id;
      }
      if (participantName) {
        const user: User = await postgreSqlManager.users.find({name: participantName});
        searchData.participant_id = user.id;
      }
      if (fieldSize) {
        searchData.field_size = fieldSize;
      }
      return await postgreSqlManager.games.find(searchData);
    } catch (error: Error) {
      logger.error(error);
      throw Error(error);
    }
  }
  public static async getRoleToGame(
    playerId: number,
    gameId: number,
  ): PlayerRole {
    const player: User = await postgreSqlManager.users.find({id: playerId});
    const games: Game[] = await postgreSqlManager.games.find({id: gameId});
    const game: Game = games[0];
    if (player.accessToken && (player.accessToken === game.accessToken)) {
      if (player.id === game.creatorGameId) {
        return PlayerRole.Creator;
      } else if (player.id === game.participantId) {
        return PlayerRole.Participant;
      }
    }
    return PlayerRole.Observer;
  }

  public static async canStandParticipant(playerId: number, gameId: number) {
    const player: User = await postgreSqlManager.users.find({id: playerId});
    const role: PlayerRole = await GameManeger.getRoleToGame(playerId, gameId);
    const games: Game[] = await postgreSqlManager.games.find({id: gameId});
    const game: Game = games[0];
    if (role === PlayerRole.Observer) {
      if (!player.accessToken && !game.participantId) {
        return true;
      }
    }
    return false;
  }
}

export {
  GameManeger,
  PlayerRole,
};
