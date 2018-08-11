/**
 * Created by Илья on 10.08.2018.
 */
import {IDatabase, IMain} from "pg-promise";

import {IGameRepository, Game} from "./IGameRepository";
import {Repository} from "./Repository";
import {Helpers} from "../../Helpers";
import {logger} from "../../Logger";
import * as pgPromise from "pg-promise";
import QueryResultError = pgPromise.errors.QueryResultError;

class GameRepository extends Repository implements IGameRepository  {
  public constructor(db: any, pgp: IMain) {
      super(db, pgp);
  }

  public async find(searchParameters: {[id: string]: any}): Game[] {
    let properties: Array<{[id: string]: any}> = [];
    await this.db.many(Repository.getSelectQueueString("Game", searchParameters))
      .then((data) => {
        for (const object of data) {
          const foundData =  {
            id: object.id,
            creator_game_id: object.creator_game_id,
            participant_id: object.participant_id,
            field_size: object.field_size,
            field: object.field,
            access_token: object.access_token,
            time: object.time,
            leading_player_id: object.leading_player_id,
            win_player_id: object.win_player_id,
          };
          properties.push(Helpers.copyByValue(foundData));
        }
      })
      .catch((error: Error) => {
        logger.error("Error to SELECT queue.");
        logger.error(error);
        throw new QueryResultError(error);
      });
    let gameList: Game[] = [];
    logger.info(
      "Was search-request for game." +
      " Search parameters:" + Repository.generateCriteriaString(searchParameters),
    );
    for (const object of properties) {
      logger.info("Found game with id=" + properties.id);
      gameList.push(new Game(object));
    }

    return gameList;
  }

  public async create(parameters: {[id: string]: any}) {
    await this.db.none(Repository.getInsertQueueString("Game", parameters))
      .then((data) => {
        logger.info(
          "Create game. Creation parameters:" + Repository.generateCriteriaString(parameters),
        );
      })
      .catch((error: Error) => {
        logger.error("Error to INSERT queue.");
        logger.error(error);
        throw error;
      });
  }

  public async deleteGame(searchParameters: {[id: string]: any}) {
    let properties: object = {};
    await this.db.result(Repository.getDeleteQueueString("Game", searchParameters))
      .then((data) => {
        const foundData =  {
          id: data.id,
          creator_game_id: data.creator_game_id,
          participant_id: data.participant_id,
          field_size: data.field_size,
          field: data.field,
          access_token: data.access_token,
          time: data.time,
          leading_player_id: data.leading_player_id,
          win_player_id: data.win_player_id,
        };
        properties = Helpers.copyByValue(foundData);
      })
      .catch((error: Error) => {
        logger.error("Error to DELETE queue.");
        logger.error(error);
        throw error;
      });
    logger.info(
      "Delete game with id=" + properties.id
      + ". Search parameters:" + Repository.generateCriteriaString(searchParameters),
    );
  }
}

export {
  GameRepository,
};
