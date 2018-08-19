/**
 * Created by Илья on 10.08.2018.
 */
import {IDatabase, IMain} from "pg-promise";

import {Repository} from "./Repository";
import {Helpers} from "../../Helpers";
import {logger} from "../../Logger";
import * as pgPromise from "pg-promise";
import QueryResultError = pgPromise.errors.QueryResultError;
import {DataForCreation, Game} from "../Entity/Game";
import * as Collections from "typescript-collections";
import Dictionary from "typescript-collections/dist/lib/Dictionary";

class GameRepository extends Repository {
  public constructor(db: any, pgp: IMain) {
      super(db, pgp);
  }

  public async find(searchParameters: DataForCreation): Game[] {
    let properties: DataForCreation[] = [];
    await this.db.many(Repository.getSelectQueueString("Game", searchParameters))
      .then((data) => {
        for (const object of data) {
          let foundData: DataForCreation = new Dictionary<string, any>();
          foundData.setValue("id", object.id);
          foundData.setValue("creator_game_id", object.creator_game_id);
          foundData.setValue("participant_id", object.participant_id);
          foundData.setValue("field_size", object.field_size);
          foundData.setValue("field", object.field);
          foundData.setValue("access_token", object.access_token);
          foundData.setValue("time", object.time);
          foundData.setValue("last_move_time", object.last_move_time);
          foundData.setValue("leading_player_id", object.leading_player_id);
          foundData.setValue("win_player_id", object.win_player_id);

          properties.push(foundData);
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
      " Search parameters:" + Repository.generateNewDataString(searchParameters),
    );
    for (const object of properties) {
      logger.info("Found game with id=" + object.getValue("id"));
      gameList.push(new Game(object));
    }

    return gameList;
  }

  public async create(parameters: DataForCreation) {
    await this.db.none(Repository.getInsertQueueString("Game", parameters))
      .then((data) => {
        logger.info(
          "Create game. Creation parameters:" + Repository.generateNewDataString(parameters),
        );
      })
      .catch((error: Error) => {
        logger.error("Error to INSERT queue.");
        logger.error(error);
        throw error;
      });
  }

  public async deleteGame(searchParameters: DataForCreation) {
    let foundData: DataForCreation = new Dictionary<string, any>();
    await this.db.result(Repository.getDeleteQueueString("Game", searchParameters))
      .then((data) => {
        foundData.setValue("id", data.id);
        foundData.setValue("creator_game_id", data.creator_game_id);
        foundData.setValue("participant_id", data.participant_id);
        foundData.setValue("field_size", data.field_size);
        foundData.setValue("field", data.field);
        foundData.setValue("access_token", data.access_token);
        foundData.setValue("time", data.time);
        foundData.setValue("last_move_time", data.last_move_time);
        foundData.setValue("leading_player_id", data.leading_player_id);
        foundData.setValue("win_player_id", data.win_player_id);
      })
      .catch((error: Error) => {
        logger.error("Error to DELETE queue.");
        logger.error(error);
        throw error;
      });
    logger.info(
      "Delete game with id=" + foundData.getValue("id")//properties
      + ". Search parameters:" + Repository.generateNewDataString(searchParameters),
    );
  }
  public async update(gameId: number, whatUpdate: DataForCreation) {
    let searchParameters: DataForCreation = new Dictionary<string, any>();
    searchParameters.setValue("id", gameId);
    await this.db.none(Repository.getUpdateQueueString("Game", searchParameters, whatUpdate))
      .then((data) => {
        logger.info(
          "Update game. New parameters:" + Repository.generateNewDataString(whatUpdate),
        );
      })
      .catch((error: Error) => {
        logger.error("Error to UPDATE queue.");
        logger.error(error);
        throw error;
      });
  }
}

export {
  GameRepository,
};
