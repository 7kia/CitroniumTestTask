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

class GameRepository implements IGameRepository {
  private db: IDatabase<any>;
  private pgp: IMain;
  public constructor(db: any, pgp: IMain) {
    this.db = db;
    this.pgp = pgp;
  }

  public async find(searchParameters: {[id: string]: string}): Game {
    let properties: object = {};
    await this.db.one(Repository.getSelectQueueString("Game", searchParameters))
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
      .catch((error) => {
        logger.error("Error to SELECT queue.");
        logger.error(error);
        throw new QueryResultError(error);
      });
    const foundUser: Game = new Game(properties);
    logger.info(
      "Found game with id=" + properties.id
      + ". Search parameters:" + Repository.generateCriteriaString(searchParameters),
    );
    return foundUser;
  }

  public async create(parameters: {[id: string]: string}) {
    await this.db.none(Repository.getInsertQueueString("Game", parameters))
      .then((data) => {
        logger.info(
          "Create game. Creation parameters:" + Repository.generateCriteriaString(parameters),
        );
      })
      .catch((error) => {
        logger.error("Error to INSERT queue.");
        logger.error(error);
        throw error;
      });
  }

  public async deleteGame(searchParameters: {[id: string]: string}) {
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
      .catch((error) => {
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
