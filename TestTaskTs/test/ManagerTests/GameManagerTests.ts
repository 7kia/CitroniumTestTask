/**
 * Created by Илья on 11.08.2018.
 */
import { assert } from "chai";
import "mocha";
import {postgreSqlManager} from "../../src/db";
import {Game} from "../../src/db/Entity/Game";
import {logger} from "../../src/Logger";
import {GameManeger, PlayerRole} from "../../src/Managers/GameManager";

describe("GameManeger. " +
  "Менеджер игры. Позволяет игрокам взаимодействовать с конкретной " +
  "игровой партией, искать и подключаться к партиям.", () => {
  const gameData: {[id: string]: any} = {
    creator_name: "Player3",
    participant_name: "Player4",
    field_size: 2,
  };
  it("Позволяет найти игровую партию по имени игроков создателей " +
    "и участников, и по размеру поля.", async () => {
    const games: Game[] = await GameManeger.getGame("Player1", null, null);
    const games2: Game[] = await GameManeger.getGame(null, gameData.participant_name, null);
    const games3: Game[] = await GameManeger.getGame(null, null, gameData.field_size);
    const games4: Game[] = await GameManeger.getGame(
      gameData.creator_name,
      gameData.participant_name,
      null,
    );
    const games5: Game[] = await GameManeger.getGame(
      gameData.creator_name,
      gameData.participant_name,
      gameData.field_size,
    );

    assert.strictEqual(games.length, 1);
    assert.strictEqual(games2.length, 1);
    assert.strictEqual(games3.length, 2);
    assert.strictEqual(games4.length, 1);
    assert.strictEqual(games5.length, 1);


    assert.strictEqual(games[0].id, 0);
    assert.strictEqual(games2[0].id, 1);

    const expectedIds: number[] = [0, 1];
    assert.isTrue(expectedIds.includes(games3[0].id));
    assert.isTrue(expectedIds.includes(games3[1].id));

    assert.strictEqual(games4[0].id, 1);
    assert.strictEqual(games5[0].id, 1);
  });

  describe("Может дать роль игрока в конкретной партии", async () => {
    it("Игрок может быть создателем.", async () => {
      const role1: PlayerRole = await GameManeger.getRoleToGame(2, 1);
      assert.strictEqual(role1, PlayerRole.Creator);
    });
    it("Игрок может быть участником.", async () => {
      const role1: PlayerRole = await GameManeger.getRoleToGame(3, 1);
      assert.strictEqual(role1, PlayerRole.Participant);
    });
    it("Игрок может быть наблюдателем, если не участвует в этой " +
      "партии.", async () => {
      const role1: PlayerRole = await GameManeger.getRoleToGame(2, 0);
      const role2: PlayerRole = await GameManeger.getRoleToGame(3, 0);
      assert.strictEqual(role1, PlayerRole.Observer);
      assert.strictEqual(role2, PlayerRole.Observer);
    });

  });

  it("Может определить: станет ли этот игрок участником в этой " +
    "партии.", async () => {
    const willParticipantToGame0: boolean = await await GameManeger.canStandParticipant(4, 0);
    const willParticipantToGame1: boolean = await await GameManeger.canStandParticipant(4, 1);

    assert.strictEqual(willParticipantToGame0, true);
    assert.strictEqual(willParticipantToGame1, false);
  });


});
