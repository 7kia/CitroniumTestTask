/**
 * Created by Илья on 11.08.2018.
 */
import { assert } from "chai";
import "mocha";
import {db} from "../../src/db";
import {Game} from "../../src/db/Entity/Game";
import {logger} from "../../src/Logger";
import {GameManeger} from "../../src/Managers/GameManager";

describe("GameManeger. " +
  "Менеджер игры. Позволяет игрокам взаимодействовать с конкретной " +
  "игровой партией, искать и подключаться к партиям.", () => {
  const gameData1: {[id: string]: any} = {
    creator_name: "Player1",
    participant_name: "Player2",
    field_size: 2,
  };
  const gameData2: {[id: string]: any} = {
    creator_name: "Player3",
    participant_name: "Player4",
    field_size: 2,
  };
  it("Позволяет найти игровую партию по имени игроков создателей " +
    "и участников, и по размеру поля.", async () => {
    const games: Game[] = await GameManeger.getGame(gameData1.creator_name, null, null);
    const games2: Game[] = await GameManeger.getGame(null, gameData1.participant_name, null);
    const games3: Game[] = await GameManeger.getGame(null, null, gameData1.field_size);
    const games4: Game[] = await GameManeger.getGame(
      gameData2.creator_name,
      gameData2.participant_name,
      null,
    );
    const games5: Game[] = await GameManeger.getGame(
      gameData2.creator_name,
      gameData2.participant_name,
      gameData2.field_size,
    );

    assert.strictEqual(games.length, 1);
    assert.strictEqual(games2.length, 1);
    assert.strictEqual(games3.length, 2);
    assert.strictEqual(games4.length, 1);
    assert.strictEqual(games5.length, 1);

    assert.strictEqual(games[0].id, 0);
    assert.strictEqual(games2[0].id, 0);

    assert.strictEqual(games3[0].id, 0);
    assert.strictEqual(games3[1].id, 1);

    assert.strictEqual(games4[0].id, 1);
    assert.strictEqual(games5[0].id, 1);
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

});
