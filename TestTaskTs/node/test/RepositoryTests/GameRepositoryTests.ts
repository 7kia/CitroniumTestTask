/**
 * Created by Илья on 10.08.2018.
 */
import { assert } from "chai";
import "mocha";
import {postgreSqlManager} from "../../src/db";
import {Game} from "../../src/db/Entity/Game";
import * as pgPromise from "pg-promise";
import QueryResultError = pgPromise.errors.QueryResultError;
import {logger} from "../../src/Logger";
import * as Collections from "typescript-collections";
import Dictionary from "typescript-collections/dist/lib/Dictionary";
import {DataForCreation} from "../../src/Helpers";

describe("GameDataRepository. " +
  "Позволяет брать и редактировать данные игровых партий.", () => {
  const deleteGameIfExist = async (gameData: DataForCreation ) => {
    try {
      const foundGames: Game[] = await postgreSqlManager.games.find(gameData);
      if (foundGames) {
        await postgreSqlManager.games.deleteGame(gameData);
      }
    } catch (error) {
      logger.info("Удалены тестовое данные");
    }
  };

  const assertThrowsAsync: (testFunc: () => any, regExp: any) => Promise<void>
    = async (testFunc: () => any, regExp: any) => {
    let func: () => void = null;
    try {
      await testFunc();
    } catch (error) {
      func = () => {throw error};
    } finally {
      assert.throws(func, regExp);
    }
  };
  describe("Можно найти игровую партию по различным характеристикам.", async () => {
    it("Если партия(и) найдена(ы), то будет возвращён результат поиска.", async () => {
      let gameData: DataForCreation = new Dictionary<string, any>();
      gameData.setValue("id", 0);
      let gameData2: DataForCreation = new Dictionary<string, any>();
      gameData2.setValue("creator_game_id", 2);
      gameData2.setValue("field_size", 2);
      const games: Game[] = await postgreSqlManager.games.find(gameData);
      const games2: Game[] = await postgreSqlManager.games.find(gameData2);

      assert.strictEqual(games.length, 1);
      assert.strictEqual(games2.length, 1);
      assert.strictEqual(games[0].id, gameData.getValue("id"));
      assert.strictEqual(games2[0].id, 1);
    });
    it("Если переданы некорректные параметры, то будет брошено исключение.", async () => {
      let gameData: DataForCreation = new Dictionary<string, any>();
      gameData.setValue("creator_game_id", -1);

      assertThrowsAsync(
        async () => {
          await postgreSqlManager.games.find(gameData);
        },
        Error
      );
    });
  });
  it("Можно создать и удалить игровую партию.", async () => {
    let gameData: DataForCreation = new Dictionary<string, any>();
    gameData.setValue("creator_game_id", 4);
    gameData.setValue("participant_id", 5);
    gameData.setValue("field_size", 9);
    gameData.setValue("field", ["???", "???", "???"]);
    gameData.setValue("access_token", "gameDeleteAndCreate");
    gameData.setValue("time", 0);
    gameData.setValue("leading_player_id", 4);

    await deleteGameIfExist(gameData);

    await postgreSqlManager.games.create(gameData);
    const foundGames: Game[] = await postgreSqlManager.games.find(gameData);
    assert.strictEqual(foundGames.length, 1);
    assert.strictEqual(foundGames[0].creatorGameId, gameData.getValue("creator_game_id"));
    assert.strictEqual(foundGames[0].participantId, gameData.getValue("participant_id"));
    assert.strictEqual(foundGames[0].fieldSize, gameData.getValue("field_size"));
    assert.strictEqual(foundGames[0].accessToken, gameData.getValue("access_token"));
    assert.strictEqual(foundGames[0].time, gameData.getValue("time"));
    assert.strictEqual(foundGames[0].leadingPlayerId, gameData.getValue("leading_player_id"));

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
    let gameData: DataForCreation = new Dictionary<string, any>();
    gameData.setValue("creator_game_id", 6);
    gameData.setValue("participant_id", 7);
    gameData.setValue("field_size", 9);
    gameData.setValue("field", ["???", "???", "???"]);
    gameData.setValue("access_token", "gameUpdate");
    gameData.setValue("time", 0);
    gameData.setValue("leading_player_id", 6);
    let newGameData: DataForCreation = new Dictionary<string, any>();
    newGameData.setValue("field", ["?X?", "???", "???"]);
    newGameData.setValue("time", 0.5);
    newGameData.setValue("leading_player_id", 7);
    let createdGameData: DataForCreation = new Dictionary<string, any>();
    createdGameData.setValue("access_token", "gameUpdate");

    await deleteGameIfExist(createdGameData);

    await postgreSqlManager.games.create(gameData);

    let games: Game[] = await postgreSqlManager.games.find(createdGameData);
    let game: Game = games[0];

    let whatUpdate: Dictionary<string, boolean> = new Dictionary<string, boolean>();
    whatUpdate.setValue("field", newGameData.getValue("field"));
    whatUpdate.setValue("time", newGameData.getValue("time"));
    whatUpdate.setValue("leading_player_id", newGameData.getValue("leading_player_id"));
    await postgreSqlManager.games.update(game.id, whatUpdate);

    const updateGames: Game[] = await postgreSqlManager.games.find(createdGameData);
    const updateGame: Game = updateGames[0];
    assert.deepEqual(updateGame.field, newGameData.getValue("field"));
    assert.strictEqual(updateGame.time, newGameData.getValue("time"));
    assert.strictEqual(updateGame.leadingPlayerId, newGameData.getValue("leading_player_id"));

    await postgreSqlManager.games.deleteGame(createdGameData);
  });
});
