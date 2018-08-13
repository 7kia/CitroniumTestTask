/**
 * Created by Илья on 10.08.2018.
 */
import { assert } from "chai";
import "mocha";
import {postgreSqlManager} from "../../src/db";
import {Game} from "../../src/db/Entity/Game";
import {Repository} from "../../src/db/repositories/Repository";
import * as pgPromise from "pg-promise";
import QueryResultError = pgPromise.errors.QueryResultError;
import {logger} from "../../src/Logger";

describe("GameDataRepository. " +
  "Позволяет брать и редактировать данные игровых партий.", () => {
  const deleteGameIfExist = async (gameData: {[id: string]: any} ) => {
    try {
      const foundGames: Game[] = await postgreSqlManager.games.find( gameData );
      if (foundGames) {
        await postgreSqlManager.games.deleteGame( gameData );
      }
    } catch (error: any) {
      logger.info("Удалены тестовое данные");
    }
  };
  it("Можно найти игровую партию по различным характеристикам.", async () => {
    const games: Game[] = await postgreSqlManager.games.find( { id: "0" } );
    const games2: Game[] = await postgreSqlManager.games.find( { creator_game_id: "2", field_size: "2" } );

    assert.strictEqual(games.length, 1);
    assert.strictEqual(games2.length, 1);
    assert.strictEqual(games[0].id, 0);
    assert.strictEqual(games2[0].id, 1);
  });
  it("Можно создать и удалить игровую партию.", async () => {
    const gameData: {[id: string]: any} = {
      creator_game_id: 4,
      participant_id: 5,
      field_size: 9,
      field: ["???", "???", "???"],
      access_token: "qwe",
      time: 0,
      leading_player_id: 4,
    };
    deleteGameIfExist(gameData);

    await postgreSqlManager.games.create(gameData);
    const foundGames: Game[] = await postgreSqlManager.games.find(gameData);
    assert.strictEqual(foundGames.length, 1);
    assert.strictEqual(foundGames[0].creatorGameId, gameData.creator_game_id);
    assert.strictEqual(foundGames[0].participantId, gameData.participant_id);
    assert.strictEqual(foundGames[0].fieldSize, gameData.field_size);
    assert.strictEqual(foundGames[0].accessToken, gameData.access_token);
    assert.strictEqual(foundGames[0].time, gameData.time);
    assert.strictEqual(foundGames[0].leadingPlayerId, gameData.leading_player_id);

    await postgreSqlManager.games.deleteGame( gameData );
    // TODO : не ловит исключение
    // assert.throws(
    //   async () => {
    //     await postgreSqlManager.games.find( userData );
    //   },
    //   QueryResultError,
    // );
  });
  it("Можно обновить данные игровой партии.", async () => {
    const gameData: {[id: string]: any} = {
      creator_game_id: 6,
      participant_id: 7,
      field_size: 9,
      field: ["???", "???", "???"],
      access_token: "qwe",
      time: 0,
      leading_player_id: 6,
    };
    const newGameData: {[id: string]: any} = {
      field: ["?X?", "???", "???"],
      time: 0.5,
      leading_player_id: 7,
    };
    deleteGameIfExist(gameData);
    deleteGameIfExist(newGameData);

    await postgreSqlManager.games.create(gameData);

    let games: Game[] = await postgreSqlManager.games.find(
      {
        creator_game_id: gameData.creator_game_id,
        participant_id: gameData.participant_id,
      },
    );
    let game: Game = games[0];
    game.field = newGameData.field;
    game.time = newGameData.time;
    game.leadingPlayerId = newGameData.leading_player_id;

    await postgreSqlManager.games.update(game);
    const updateGames: Game[] = await postgreSqlManager.games.find(
      {
        creator_game_id: gameData.creator_game_id,
        participant_id: gameData.participant_id,
      },
    );
    const updateGame: Game = updateGames[0];
    assert.deepEqual(updateGame.field, newGameData.field);
    assert.strictEqual(updateGame.time, newGameData.time);
    assert.strictEqual(updateGame.leadingPlayerId, newGameData.leading_player_id);

    await postgreSqlManager.games.deleteGame(
      {
        creator_game_id: gameData.creator_game_id,
        participant_id: gameData.participant_id,
      },
    );
  });
});
