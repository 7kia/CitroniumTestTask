/**
 * Created by Илья on 11.08.2018.
 */
import { assert } from "chai";
import "mocha";
import {postgreSqlManager} from "../../src/db";
import {DataForCreation, Game} from "../../src/db/Entity/Game";
import {logger} from "../../src/Logger";
import {GameManeger, PlayerRole} from "../../src/Managers/GameManager";
import {User} from "../../src/db/Entity/User";

describe("GameManeger. " +
  "Менеджер игры. Позволяет игрокам взаимодействовать с конкретной " +
  "игровой партией, искать и подключаться к партиям.", () => {
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

  it("Позволяет найти игровую партию по имени игроков создателей " +
    "и участников, и по размеру поля.", async () => {
    const gameData: {[id: string]: any} = {
      creator_name: "Player3",
      participant_name: "Player4",
      field_size: 2,
    };
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
    const willParticipantToGame0: boolean = await GameManeger.canStandParticipant(4, 0);
    const willParticipantToGame1: boolean = await GameManeger.canStandParticipant(4, 1);

    assert.strictEqual(willParticipantToGame0, true);
    assert.strictEqual(willParticipantToGame1, false);
  });
  it("Может подключить игрока к партии.", async () => {
    const gameData: {[id: string]: any} = {
      field_size: 3,
      field: ["???", "???", "???"],
      access_token: "qwe",
      time: 0,
    };
    const creatorName: string = "PlayerCreator";
    const participantName: number = "PlayerParticipant";
    let creator: User = await postgreSqlManager.users.find({name: creatorName});
    let participant: User = await postgreSqlManager.users.find({name: participantName});

    await GameManeger.unconnectPlayer(creator.id);
    await GameManeger.unconnectPlayer(participant.id);
    await deleteGameIfExist(gameData);
    await postgreSqlManager.games.create(gameData);
    let foundGames: Game[] = await postgreSqlManager.games.find(gameData);
    let newGame: Game = foundGames[0];

    assert.strictEqual(creator.accessToken, null);
    assert.strictEqual(participant.accessToken, null);
    assert.strictEqual(newGame.creatorGameId, null);
    assert.strictEqual(newGame.participantId, null);
    const connectCreator: boolean = await GameManeger.connectPlayer(creator.id, newGame.id);
    const connectParticipant: boolean = await GameManeger.connectPlayer(participant.id, newGame.id);
    assert.strictEqual(connectCreator, true);
    assert.strictEqual(connectParticipant, true);

    creator = await postgreSqlManager.users.find({name: creatorName});
    participant = await postgreSqlManager.users.find({name: participantName});

    foundGames = await postgreSqlManager.games.find(gameData);
    newGame = foundGames[0];
    assert.strictEqual(creator.accessToken, newGame.accessToken);
    assert.strictEqual(participant.accessToken, newGame.accessToken);
    assert.strictEqual(newGame.creatorGameId, creator.id);
    assert.strictEqual(newGame.participantId, participant.id);

    await GameManeger.unconnectPlayer(creator.id);
    await GameManeger.unconnectPlayer(participant.id);
    await postgreSqlManager.games.deleteGame(gameData);
  });
  it("Может дать время игровой партии.", async () => {
    const gameTime: boolean = await GameManeger.getGameTime(0);

    assert.strictEqual(gameTime, 0);
  });

  describe("Может принять ход то игрока", async () => {
    describe("Если игрок участвует в этой партии.", async () => {
      const deleteUserIfExist = async (userData: {[id: string]: any} ) => {
        try {
          const foundUser: User = await postgreSqlManager.users.find( userData );
          if (foundUser) {
            await postgreSqlManager.users.deleteUser( userData );
          }
        } catch (error: any) {
          console.log("Удалены тестовое данные");
        }
      };

      const testPlayerMoveToGame = async (
        creatorPlayerData: DataForCreation,
        participantPlayerData: DataForCreation,
        startGameData: DataForCreation,
        playerActions: (creator: User, participant: User, game: Game) => void,
      ) => {
        await deleteUserIfExist(creatorPlayerData);
        await deleteUserIfExist(participantPlayerData);
        await postgreSqlManager.users.create(creatorPlayerData);
        await postgreSqlManager.users.create(participantPlayerData);
        let creator: User = await postgreSqlManager.users.find(creatorPlayerData);
        let participant: User = await postgreSqlManager.users.find(participantPlayerData);

        let gameData: {[id: string]: any} = {
          creator_game_id: creator.id,
          participant_id: participant.id,
          field_size: startGameData.field_size,
          field: startGameData.field,
          access_token: startGameData.access_token,
          time: startGameData.time,
          leading_player_id: creator.id,
        };
        await deleteGameIfExist(gameData);
        await postgreSqlManager.games.create(gameData);
        const foundGames: Game[] = await postgreSqlManager.games.find(gameData);
        let game: Game = foundGames[0];

        await GameManeger.connectPlayer(creator.id, game.id);
        await GameManeger.connectPlayer(participant.id, game.id);
        await playerActions(creator, participant, game);

        await postgreSqlManager.games.deleteGame(gameData);
        await postgreSqlManager.users.deleteUser(creatorPlayerData);
        await postgreSqlManager.users.deleteUser(participantPlayerData);
      };

      it("Если игрок сходил в не пустую клетку, ничего не происходит.", async () => {
        await testPlayerMoveToGame(
          {
            name: "PlayerCreatorTestMove1",
            email: "PlayerCreatorTestMove1.e@com",
            password: "123",
          },
          {
            name: "PlayerParticipantTestMove1",
            email: "PlayerParticipantTestMove1.e@com",
            password: "123",
          },
          {
            field_size: 3,
            field: ["?O?", "???", "???"],
            access_token: "PlayerCreatorTestMove1",
            time: 10,
          },
          async (creator: User, participant: User, game: Game): void => {
            logger.info("test");
          },
        );
      });
      describe("Если ход корректный.", async () => {
        it("Если игрок сходил в пустую клетку, то ставится знак " +
          "игрока и право хода передаётся другому игроку, " +
          "если сходивший игрок не выиграл. ", async () => {
        });
        it("Если после хода игрок выиграл, то он отмечается как победитель " +
          "и последующие ходы не принимаются.", async () => {
          // TODO : здесь используй другую игру и других игроков
        });
      });

      it("Если игрок сходил когда должен ходить другой " +
        "игрок, ничего не происзойдёт.", async () => {
      });
    });
    describe("Если игрок не участвует в этой партии.", async () => {
      it("Его действия никак не повлияют на игру.", async () => {
      });
    });
  });
});
