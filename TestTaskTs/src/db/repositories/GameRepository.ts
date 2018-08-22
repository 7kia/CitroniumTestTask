/**
 * Created by Илья on 10.08.2018.
 */
import {IDatabase, IMain} from "pg-promise";

import {Repository} from "./Repository";
import {DataForCreation, Helpers} from "../../Helpers";
import {logger} from "../../Logger";
import * as pgPromise from "pg-promise";
import QueryResultError = pgPromise.errors.QueryResultError;
import {Game} from "../Entity/Game";
import Dictionary from "typescript-collections/dist/lib/Dictionary";

class GameRepository extends Repository {
  public constructor(db: any, pgp: IMain) {
      super(db, pgp);
  }

  public async find(searchParameters: DataForCreation): Promise<Game[]> {
    return new Promise<Game[]>(async (resolve, reject) => {
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
      .catch((error) => {
        logger.error("Error to SELECT queue.");
        logger.error(error.toString());
        reject(new Error(error.toString()));
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

      resolve(gameList);
    });
  }

  public async create(parameters: DataForCreation): Promise<void> {
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

  public async deleteGame(searchParameters: DataForCreation): Promise<void> {
    await this.db.result(Repository.getDeleteQueueString("Game", searchParameters))
      .then(() => {
        logger.info(
          "Delete game. Search parameters:" + Repository.generateNewDataString(searchParameters),
        );
      })
      .catch((error: Error) => {
        logger.error("Error to DELETE queue.");
        logger.error(error);
        throw error;
      });

  }
  public async update(gameId: number, whatUpdate: DataForCreation): Promise<void> {
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
