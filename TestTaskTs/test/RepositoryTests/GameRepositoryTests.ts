/**
 * Created by Илья on 10.08.2018.
 */
import { assert } from "chai";
import "mocha";
import {db} from "../../src/db";
import {Game} from "../../src/db/Entity/Game";
import {Repository} from "../../src/db/repositories/Repository";
import * as pgPromise from "pg-promise";
import QueryResultError = pgPromise.errors.QueryResultError;
import {logger} from "../../src/Logger";

describe("GameDataRepository. " +
  "Позволяет брать и редактировать данные игровых партий.", () => {
  it("Можно найти игровую партию по различным характеристикам.", async () => {
    const games: Game[] = await db.games.find( { id: "0" } );
    const games2: Game[] = await db.games.find( { creator_game_id: "2", field_size: "2" } );

    assert.strictEqual(games.length, 1);
    assert.strictEqual(games2.length, 1);
    assert.strictEqual(games[0].id, 0);
    assert.strictEqual(games2[0].id, 1);
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
      const foundGames: Game[] = await db.games.find( gameData );
      if (foundGames) {
        await db.games.deleteGame( gameData );
      }
    } catch (error: any) {
      logger.info("Start test \"Можно создать и удалить игровую партию\"");
    }

    await db.games.create(gameData);
    const foundGames: Game[] = await db.games.find(gameData);
    assert.strictEqual(foundGames.length, 1);
    assert.strictEqual(foundGames[0].creatorGameId, gameData.creator_game_id);
    assert.strictEqual(foundGames[0].participantId, gameData.participant_id);
    assert.strictEqual(foundGames[0].fieldSize, gameData.field_size);
    assert.strictEqual(foundGames[0].accessToken, gameData.access_token);
    assert.strictEqual(foundGames[0].time, gameData.time);
    assert.strictEqual(foundGames[0].leadingPlayerId, gameData.leading_player_id);

    await db.games.deleteGame( gameData );
    // TODO : не ловит исключение
    // assert.throws(
    //   async () => {
    //     await db.games.find( userData );
    //   },
    //   QueryResultError,
    // );
  });
});
