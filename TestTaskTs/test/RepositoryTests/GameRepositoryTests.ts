/**
 * Created by Илья on 10.08.2018.
 */
import { assert } from "chai";
import "mocha";
import db = require("../../src/db");
import {Game} from "../../src/db/Entity/Game";
import {Repository} from "../../src/db/repositories/Repository";
import * as pgPromise from "pg-promise";
import QueryResultError = pgPromise.errors.QueryResultError;
import {logger} from "../../src/Logger";

describe("GameDataRepository. " +
  "Позволяет брать и редактировать данные игровых партий.", () => {
  it("Можно найти игровую партию по различным характеристикам.", async () => {
    const game: GameData = await db.db.games.find( { id: "0" } );
    const game2: GameData = await db.db.games.find( { creator_game_id: "2", field_size: "3" } );

    assert.strictEqual(game.id, 0);
    assert.strictEqual(game2.id, 1);
  });
  const gameData: {[id: string]: any} = {
    creator_game_id: 4,
    participant_id: 5,
    field_size: 9,
    field: "{\"???\",\"???\",\"???\"}",
    access_token: "qwe",
    time: 0,
    leading_player_id: 4,
  };
  it("Можно создать и удалить игровую партию.", async () => {
    try {
      const foundGame: Game = await db.db.games.find( gameData );
      if (foundGame) {
        await db.db.games.deleteGame( gameData );
      }
    } catch (error: any) {
      logger.info("Start test \"Можно создать и удалить игровую партию\"");
    }

    await db.db.games.create(gameData);
    const foundGame: Game = await db.db.games.find(gameData);
    assert.strictEqual(foundGame.creatorGameId, gameData.creator_game_id);
    assert.strictEqual(foundGame.participantId, gameData.participant_id);
    assert.strictEqual(foundGame.fieldSize, gameData.field_size);
    assert.strictEqual(foundGame.accessToken, gameData.access_token);
    assert.strictEqual(foundGame.time, gameData.time);
    assert.strictEqual(foundGame.leadingPlayerId, gameData.leading_player_id);

    await db.db.games.deleteGame( gameData );
    // TODO : не ловит исключение
    // assert.throws(
    //   async () => {
    //     await db.db.games.find( userData );
    //   },
    //   QueryResultError,
    // );
  });
});
