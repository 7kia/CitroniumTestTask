/**
 * Created by Илья on 11.08.2018.
 */
import { assert, expect, should } from "chai";
import "mocha";
import {postgreSqlManager} from "../../src/db";
import {DataForCreation, Game} from "../../src/db/Entity/Game";
import {logger} from "../../src/Logger";
import {ERROR_GAME_MESSAGES, GameManeger, PlayerRole, Position} from "../../src/Managers/GameManager";
import {User} from "../../src/db/Entity/User";
import {GameReport} from "../../src/db/Entity/GameReport";
import * as Parallel from "async-parallel";
import Dictionary from "typescript-collections/dist/lib/Dictionary";

describe("GameManeger. " +
  "Менеджер игры. Позволяет игрокам взаимодействовать с конкретной " +
  "игровой партией, искать и подключаться к партиям.", () => {
  const deleteGameIfExist = async (gameData: DataForCreation) => {
    try {
      const foundGames: Game[] = await postgreSqlManager.games.find(gameData);
      if (foundGames) {
        await postgreSqlManager.games.deleteGame(gameData);
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
    let gameData: DataForCreation = new Dictionary<string, any>();
    gameData.setValue("field_size", 3);
    gameData.setValue("field", ["???", "???", "???"]);
    gameData.setValue("access_token", "qwe1");
    gameData.setValue("time", 0);

    let creatorData: DataForCreation = new Dictionary<string, any>();
    creatorData.setValue("name", "PlayerCreator");
    let participantData: DataForCreation = new Dictionary<string, any>();
    participantData.setValue("name", "PlayerParticipant");

    let creator: User = await postgreSqlManager.users.find(creatorData);
    let participant: User = await postgreSqlManager.users.find(participantData);

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

    creator = await postgreSqlManager.users.find(creatorData);
    participant = await postgreSqlManager.users.find(participantData);

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
  describe("Может принять ход то игрока", async () => {
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

      let gameData: DataForCreation = new Dictionary<string, any>();
      gameData.setValue("field_size", startGameData.getValue("field_size"));
      gameData.setValue("field", startGameData.getValue("field"));
      gameData.setValue("access_token", startGameData.getValue("access_token"));
      gameData.setValue("time", startGameData.getValue("time"));
      gameData.setValue("leading_player_id", creator.id);

      let searchGameData: DataForCreation = new Dictionary<string, any>();
      searchGameData.setValue("access_token", startGameData.getValue("access_token"));

      await deleteGameIfExist(searchGameData);
      await postgreSqlManager.games.create(gameData);
      let foundGames: Game[] = await postgreSqlManager.games.find(gameData);
      let game: Game = foundGames[0];

      await GameManeger.connectPlayer(creator.id, game.id);
      await GameManeger.connectPlayer(participant.id, game.id);

      creator = await postgreSqlManager.users.find(creatorPlayerData);
      participant = await postgreSqlManager.users.find(participantPlayerData);
      foundGames = await postgreSqlManager.games.find(searchGameData);
      game = foundGames[0];
      await playerActions(creator, participant, game);

      await postgreSqlManager.games.deleteGame(searchGameData);
      await postgreSqlManager.users.deleteUser(creatorPlayerData);
      await postgreSqlManager.users.deleteUser(participantPlayerData);
    };

    const assertThrowsAsync: () => void = async (testFunc: () => any, regExp) => {
      let func = () => {};
      try {
        await testFunc();
      } catch (error: Error) {
        func = () => {throw error};
      } finally {
        assert.throws(func, regExp);
      }
    };
    describe("Если игрок участвует в этой партии.", async () => {
      it("Если игрок сходил в не пустую клетку, то будет брошено исключение.", async () => {
        let creatorData: DataForCreation = new Dictionary<string, any>();
        creatorData.setValue("name", "PlayerCreatorTestMove_EmptyCell");
        creatorData.setValue("email", "PlayerCreatorTestMove_EmptyCell@e.com");
        let participantData: DataForCreation = new Dictionary<string, any>();
        participantData.setValue("name", "PlayerParticipantTestMove_EmptyCell");
        participantData.setValue("email", "PlayerParticipantTestMove_EmptyCell@e.com");
        let gameData: DataForCreation = new Dictionary<string, any>();
        gameData.setValue("field_size", 3);
        gameData.setValue("field", ["?0?", "???", "???"]);
        gameData.setValue("access_token", "PlayerCreatorTestMove_EmptyCell");
        gameData.setValue("time", 10);

        await testPlayerMoveToGame(
          creatorData,
          participantData,
          gameData,
          async (creator: User, participant: User, game: Game): void => {
            await assertThrowsAsync(
              async () => await GameManeger.takePlayerMove(creator.id, new Position(1, 0), game.id),
              ERROR_GAME_MESSAGES.thisCellFilled,
            );
            const foundGames: Game[] = await postgreSqlManager.games.find(gameData);
            game = foundGames[0];
            assert.deepEqual(game.field, gameData.getValue("field"));
            assert.strictEqual(game.winPlayerId, null);
            assert.strictEqual(game.leadingPlayerId, creator.id);
          },
        );
      });
      describe("Если ход корректный.", async () => {
        it("Если игрок сходил в пустую клетку, то ставится знак " +
          "игрока и право хода передаётся другому игроку, " +
          "если сходивший игрок не выиграл. ", async () => {
          let creatorData: DataForCreation = new Dictionary<string, any>();
          creatorData.setValue("name", "CreatorTestMove_EmptyCellAndNoWinner");
          creatorData.setValue("email", "CreatorTestMove_EmptyCellAndNoWinner@e.com");
          let participantData: DataForCreation = new Dictionary<string, any>();
          participantData.setValue("name", "ParticipantTestMove_EmptyCellAndNoWinner");
          participantData.setValue("email", "ParticipantTestMove_EmptyCellAndNoWinner@e.com");
          let gameData: DataForCreation = new Dictionary<string, any>();
          gameData.setValue("field_size", 3);
          gameData.setValue("field", ["???", "???", "???"]);
          gameData.setValue("access_token", "CreatorTestMove_EmptyCellAndNoWinner");
          gameData.setValue("time", 10);

          let searchGameData: DataForCreation = new Dictionary<string, any>();
          searchGameData.setValue("access_token", gameData.getValue("access_token"));

          await testPlayerMoveToGame(
            creatorData,
            participantData,
            gameData,
            async (creator: User, participant: User, game: Game): void => {
              await GameManeger.takePlayerMove(creator.id, new Position(2, 1), game.id);
              let foundGames: Game[] = await postgreSqlManager.games.find(searchGameData);
              game = foundGames[0];
              assert.deepEqual(game.field, ["???", "??X", "???"]);
              assert.deepEqual(game.winPlayerId, null);
              assert.deepEqual(game.leadingPlayerId, participant.id);

              await GameManeger.takePlayerMove(participant.id, new Position(1, 1), game.id);
              foundGames = await postgreSqlManager.games.find(searchGameData);
              game = foundGames[0];
              assert.deepEqual(game.field, ["???", "?0X", "???"]);
              assert.strictEqual(game.winPlayerId, null);
              assert.strictEqual(game.leadingPlayerId, creator.id);
            },
          );
        });
        it("Если после хода игрок выиграл, то он отмечается как победитель " +
          "и последующие ходы не принимаются.", async () => {
          let creatorData: DataForCreation = new Dictionary<string, any>();
          creatorData.setValue("name", "CreatorTestMove_EmptyCellAndFoundWinner");
          creatorData.setValue("email", "CreatorTestMove_EmptyCellAndFoundWinner@e.com");
          let participantData: DataForCreation = new Dictionary<string, any>();
          participantData.setValue("name", "ParticipantTestMove_EmptyCellAndFoundWinner");
          participantData.setValue("email", "ParticipantTestMove_EmptyCellAndFoundWinner@e.com");
          let gameData: DataForCreation = new Dictionary<string, any>();
          gameData.setValue("field_size", 3);
          gameData.setValue("field", ["XX?", "00?", "???"]);
          gameData.setValue("access_token", "CreatorTestMove_EmptyCellAndFoundWinner");
          gameData.setValue("time", 10);

          let searchGameData: DataForCreation = new Dictionary<string, any>();
          searchGameData.setValue("access_token", gameData.getValue("access_token"));

          await testPlayerMoveToGame(
            creatorData,
            participantData,
            gameData,
            async (creator: User, participant: User, game: Game): void => {
              const newField: string[] = ["XXX", gameData.getValue("field")[1], gameData.getValue("field")[2]];
              await GameManeger.takePlayerMove(creator.id, new Position(2, 0), game.id);

              const foundGames: Game[] = await postgreSqlManager.games.find(searchGameData);
              game = foundGames[0];
              assert.deepEqual(game.field, newField);
              assert.strictEqual(game.winPlayerId, creator.id);
              assert.strictEqual(game.leadingPlayerId, creator.id);

              await assertThrowsAsync(
                async () => GameManeger.takePlayerMove(participant.id, new Position(2, 2), game.id),
                ERROR_GAME_MESSAGES.gameEnd,
              );
            },
          );
        });
        it("Когда игрок ходит фиксируется время последнего хода.", async () => {
          let creatorData: DataForCreation = new Dictionary<string, any>();
          creatorData.setValue("name", "CreatorTestMove_FixLastMoveTime");
          creatorData.setValue("email", "CreatorTestMove_FixLastMoveTime@e.com");
          let participantData: DataForCreation = new Dictionary<string, any>();
          participantData.setValue("name", "ParticipantTestMove_FixLastMoveTime");
          participantData.setValue("email", "ParticipantTestMove_FixLastMoveTime@e.com");
          let gameData: DataForCreation = new Dictionary<string, any>();
          gameData.setValue("field_size", 3);
          gameData.setValue("field", ["?0?", "???", "???"]);
          gameData.setValue("access_token", "CreatorTestMove_FixLastMoveTime");
          gameData.setValue("time", 10);

          let searchGameData: DataForCreation = new Dictionary<string, any>();
          searchGameData.setValue("access_token", gameData.getValue("access_token"));

          await testPlayerMoveToGame(
            creatorData,
            participantData,
            gameData,
            async (creator: User, participant: User, game: Game): void => {
              assert.strictEqual(game.lastMoveTime, null);

              await GameManeger.takePlayerMove(creator.id, new Position(0, 0), game.id);
              const foundGames: Game[] = await postgreSqlManager.games.find(searchGameData);
              game = foundGames[0];
              assert.strictEqual(game.lastMoveTime, gameData.getValue("time"));
            },
          );
        });
      });

      it("Если игрок сходил когда должен ходить другой " +
        "игрок, то будет брошено исключение.", async () => {
        let creatorData: DataForCreation = new Dictionary<string, any>();
        creatorData.setValue("name", "CreatorTestMove_MoveNotHaveRightMove");
        creatorData.setValue("email", "CreatorTestMove_MoveNotHaveRightMove@e.com");
        let participantData: DataForCreation = new Dictionary<string, any>();
        participantData.setValue("name", "ParticipantTestMove_MoveNotHaveRightMove");
        participantData.setValue("email", "ParticipantTestMove_MoveNotHaveRightMove@e.com");
        let gameData: DataForCreation = new Dictionary<string, any>();
        gameData.setValue("field_size", 3);
        gameData.setValue("field", ["XX?", "00?", "???"]);
        gameData.setValue("access_token", "CreatorTestMove_MoveNotHaveRightMove");
        gameData.setValue("time", 10);

        let searchGameData: DataForCreation = new Dictionary<string, any>();
        searchGameData.setValue("access_token", gameData.getValue("access_token"));

        await testPlayerMoveToGame(
          creatorData,
          participantData,
          gameData,
          async (creator: User, participant: User, game: Game): void => {
            await assertThrowsAsync(
              async () => await GameManeger.takePlayerMove(participant.id, new Position(2, 0), game.id),
              ERROR_GAME_MESSAGES.moveAnotherPlayer,
            );

            const foundGames: Game[] = await postgreSqlManager.games.find(searchGameData);
            game = foundGames[0];
            assert.deepEqual(game.field, gameData.getValue("field"));
            assert.strictEqual(game.winPlayerId, null);
            assert.strictEqual(game.leadingPlayerId, creator.id);
          },
        );
      });
    });
    describe("Если игрок не участвует в этой партии.", async () => {
      it("Ему нельзя ходить, будет брошено исключение.", async () => {
        let creatorData: DataForCreation = new Dictionary<string, any>();
        creatorData.setValue("name", "CreatorTestMove_ObserverMove");
        creatorData.setValue("email", "CreatorTestMove_ObserverMove@e.com");
        let participantData: DataForCreation = new Dictionary<string, any>();
        participantData.setValue("name", "ParticipantTestMove_ObserverMove");
        participantData.setValue("email", "ParticipantTestMove_ObserverMove@e.com");
        let gameData: DataForCreation = new Dictionary<string, any>();
        gameData.setValue("field_size", 3);
        gameData.setValue("field", ["XX?", "00?", "???"]);
        gameData.setValue("access_token", "CreatorTestMove_ObserverMove");
        gameData.setValue("time", 10);

        let searchGameData: DataForCreation = new Dictionary<string, any>();
        searchGameData.setValue("access_token", gameData.getValue("access_token"));

        await testPlayerMoveToGame(
          creatorData,
          participantData,
          gameData,
          async (creator: User, participant: User, game: Game): void => {
            let observerData: DataForCreation = new Dictionary<string, any>();
            observerData.setValue("name", "ObserverUser");
            observerData.setValue("email", "ObserverUser@e.com");

            await deleteUserIfExist(observerData);
            await postgreSqlManager.users.create(observerData);
            const observer: User = await postgreSqlManager.users.find(observerData);
            await assertThrowsAsync(
              async () => await GameManeger.takePlayerMove(observer.id, new Position(2, 0), game.id),
              ERROR_GAME_MESSAGES.tokenNotCorrespond,
            );

            const foundGames: Game[] = await postgreSqlManager.games.find(searchGameData);
            game = foundGames[0];
            assert.deepEqual(game.field, gameData.getValue("field"));
            assert.strictEqual(game.winPlayerId, null);
            assert.strictEqual(game.leadingPlayerId, creator.id);

            await postgreSqlManager.users.deleteUser(observerData);
          },
        );
      });
    });
  });
  describe("Может определить победителя в игре.", () => {
    let gameData: DataForCreation = new Dictionary<string, any>();
    gameData.setValue("creator_game_id", 6);
    gameData.setValue("participant_id", 7);
    gameData.setValue("access_token", "gameWinner");
    gameData.setValue("time", 0);
    gameData.setValue("leading_player_id", 6);

    const testFindWinnerFunction: () => void = (testData: DataForCreation[]) => {
      let game: Game = new Game(gameData);

      for (const data: DataForCreation of testData) {
        game.leadingPlayerId = data.getValue("leading_player_id");
        game.field = data.getValue("field");
        game.fieldSize = data.getValue("field_size");
        const winnerId: number = GameManeger.findWinner(game, data.getValue("position"));
        assert.strictEqual(winnerId, data.getValue("winner_id"));
      }
    };
    describe("Если заполнена знаками одного типа:", () => {
      it("Горизонталь.", () => {
        let testData1: DataForCreation = new Dictionary<string, any>();
        testData1.setValue("leading_player_id", gameData.getValue("participant_id"));
        testData1.setValue("field", ["???", "???", "000"]);
        testData1.setValue("position", new Position(1, 2));
        testData1.setValue("winner_id", gameData.getValue("participant_id"));
        testData1.setValue("field_size", 3);
        let testData2: DataForCreation = new Dictionary<string, any>();
        testData2.setValue("leading_player_id", gameData.getValue("creator_game_id"));
        testData2.setValue("field", ["XXX", "???", "???"]);
        testData2.setValue("position", new Position(2, 0));
        testData2.setValue("winner_id", gameData.getValue("creator_game_id"));
        testData2.setValue("field_size", 3);
        let testData3: DataForCreation = new Dictionary<string, any>();
        testData3.setValue("leading_player_id", gameData.getValue("creator_game_id"));
        testData3.setValue("field", ["???", "XXX", "???"]);
        testData3.setValue("position", new Position(2, 1));
        testData3.setValue("winner_id", gameData.getValue("creator_game_id"));
        testData3.setValue("field_size", 3);
        let testData4: DataForCreation = new Dictionary<string, any>();
        testData4.setValue("leading_player_id", gameData.getValue("creator_game_id"));
        testData4.setValue("field", ["????", "????", "XXXX", "????"]);
        testData4.setValue("position", new Position(2, 2));
        testData4.setValue("winner_id", gameData.getValue("creator_game_id"));
        testData4.setValue("field_size", 4);
        const testData: DataForCreation[] = [
          testData1,
          testData2,
          testData3,
          testData4,
        ];
        testFindWinnerFunction(testData);
      });
      it("Вертикаль.", () => {
        let testData1: DataForCreation = new Dictionary<string, any>();
        testData1.setValue("leading_player_id", gameData.getValue("creator_game_id"));
        testData1.setValue("field", ["X??", "X??", "X??"]);
        testData1.setValue("position", new Position(0, 1));
        testData1.setValue("winner_id", gameData.getValue("creator_game_id"));
        testData1.setValue("field_size", 3);
        let testData2: DataForCreation = new Dictionary<string, any>();
        testData2.setValue("leading_player_id", gameData.getValue("creator_game_id"));
        testData2.setValue("field", ["?X??", "?X??", "?X??", "?X??"]);
        testData2.setValue("position", new Position(1, 3));
        testData2.setValue("winner_id", gameData.getValue("creator_game_id"));
        testData2.setValue("field_size", 4);
        let testData3: DataForCreation = new Dictionary<string, any>();
        testData3.setValue("leading_player_id", gameData.getValue("participant_id"));
        testData3.setValue("field", ["???0", "???0", "???0", "???0"]);
        testData3.setValue("position", new Position(3, 2));
        testData3.setValue("winner_id", gameData.getValue("participant_id"));
        testData3.setValue("field_size", 4);
        const testData: DataForCreation[] = [
          testData1,
          testData2,
          testData3,
        ];
        testFindWinnerFunction(testData);
      });
      it("Диагональ.", () => {
        let testData1: DataForCreation = new Dictionary<string, any>();
        testData1.setValue("leading_player_id", gameData.getValue("creator_game_id"));
        testData1.setValue("field", ["X??", "?X?", "??X"]);
        testData1.setValue("position", new Position(1, 1));
        testData1.setValue("winner_id", gameData.getValue("creator_game_id"));
        testData1.setValue("field_size", 3);
        let testData2: DataForCreation = new Dictionary<string, any>();
        testData2.setValue("leading_player_id", gameData.getValue("participant_id"));
        testData2.setValue(
          "field",
          [
            "0???",
            "?0??",
            "??0?",
            "???0",
          ],
        );
        testData2.setValue("position", new Position(1, 1));
        testData2.setValue("winner_id", gameData.getValue("participant_id"));
        testData2.setValue("field_size", 4);
        let testData3: DataForCreation = new Dictionary<string, any>();
        testData3.setValue("leading_player_id", gameData.getValue("participant_id"));
        testData3.setValue(
          "field",
          [
            "???0",
            "??0?",
            "?0??",
            "0???",
          ],
        );
        testData3.setValue("position", new Position(1, 2));
        testData3.setValue("winner_id", gameData.getValue("participant_id"));
        testData3.setValue("field_size", 4);
        let testData4: DataForCreation = new Dictionary<string, any>();
        testData4.setValue("leading_player_id", gameData.getValue("creator_game_id"));
        testData4.setValue(
          "field",
          [
            "???X",
            "??X?",
            "?X??",
            "X???",
          ],
        );
        testData4.setValue("position", new Position(1, 2));
        testData4.setValue("winner_id", gameData.getValue("creator_game_id"));
        testData4.setValue("field_size", 4);

        const testData: DataForCreation[] = [
          testData1,
          testData2,
          testData3,
          testData4,
        ];
        testFindWinnerFunction(testData);
      });
    });
    it("Если победителя нет то функция возвращает null", () => {
      let testData1: DataForCreation = new Dictionary<string, any>();
      testData1.setValue("leading_player_id", gameData.getValue("participant_id"));
      testData1.setValue("field", ["???", "?0?", "?XX"]);
      testData1.setValue("position", new Position(1, 1));
      testData1.setValue("winner_id", GameManeger.NO_WINNER);
      testData1.setValue("field_size", 3);
      let testData2: DataForCreation = new Dictionary<string, any>();
      testData2.setValue("leading_player_id", gameData.getValue("participant_id"));
      testData2.setValue("field",
        [
          "?0??",
          "??0?",
          "???0",
          "????",
        ],
      );
      testData2.setValue("position", new Position(2, 1));
      testData2.setValue("winner_id", GameManeger.NO_WINNER);
      testData2.setValue("field_size", 4);
      let testData3: DataForCreation = new Dictionary<string, any>();
      testData3.setValue("leading_player_id", gameData.getValue("creator_game_id"));
      testData3.setValue("field",
        [
          "????",
          "???X",
          "??X?",
          "?X??",
        ],
      );
      testData3.setValue("position", new Position(2, 2));
      testData3.setValue("winner_id", GameManeger.NO_WINNER);
      testData3.setValue("field_size", 4);
      const testData: DataForCreation[] = [
        testData1,
        testData2,
        testData3,
      ];
      testFindWinnerFunction(testData);
    });
  });

  it("Может дать отчёт об игровой партии.", async () => {
    let searchGameData: DataForCreation = new Dictionary<string, any>();
    searchGameData.setValue("id", 1);

    const foundGames: Game[] = await postgreSqlManager.games.find(searchGameData);
    const game: Game = foundGames[0];
    const gameReport: GameReport = game.getReport();

    assert.strictEqual(gameReport.id, game.id);
    assert.strictEqual(gameReport.creatorGameId, game.creatorGameId);
    assert.strictEqual(gameReport.participantId, game.participantId);
    assert.strictEqual(gameReport.fieldSize, game.fieldSize);
    assert.strictEqual(gameReport.time, game.time);
    assert.strictEqual(gameReport.leadingPlayerId, game.leadingPlayerId);
    assert.strictEqual(gameReport.winPlayerId, game.winPlayerId);
  });

  describe("Может создать и запустить партию.", async () => {
    it("Партия уничтожается если игроки не ходят в течении " +
      "5 минут.", async () => {
      assert.strictEqual(false, true);
    });
    it("Партия заканчивается когда кто-нибудь выигрывает", async () => {
      const creatorData: DataForCreation = {
        name: "CreatorGameMove",
        email: "CreatorGameMove.e@com",
      };
      const participantData: DataForCreation = {
        name: "ParticipantGameMove",
        email: "ParticipantGameMove.e@com",
      };
      const fieldSize: number = 3;
      await deleteUserIfExist(creatorData);
      await deleteUserIfExist(participantData);
      await postgreSqlManager.users.create(creatorData);
      await postgreSqlManager.users.create(participantData);

      const creator: User = await postgreSqlManager.users.find(creatorData);
      const participant: User = await postgreSqlManager.users.find(participantData);

      const createdGameId: number = await GameManeger.createGameAndConnectCreator(creator.id, fieldSize);
      await GameManeger.connectPlayer(participant.id, createdGameId);
      await GameManeger.waitParticipant(createdGameId);

      try{
        await Parallel.invoke(
          [
            async () => {
              GameManeger.runGame(createdGameId);
            },
            async () => {
              await GameManeger.takePlayerMove(creator.id, new Position(0, 0), createdGameId);
              await GameManeger.takePlayerMove(participant.id, new Position(1, 0), createdGameId);
              await GameManeger.takePlayerMove(creator.id, new Position(1, 1), createdGameId);
              await GameManeger.takePlayerMove(participant.id, new Position(0, 1), createdGameId);
              await GameManeger.takePlayerMove(creator.id, new Position(2, 2), createdGameId);
            },
          ],
        );
      } catch (e) {
        logger.errror(e);
      }


      const foundGames: Game[] = await postgreSqlManager.games.find({id: createdGameId});
      const game: Game = foundGames[0];

      assert.strictEqual(game.winPlayerId, game.creatorGameId);

      await postgreSqlManager.users.deleteUser(creatorData);
      await postgreSqlManager.users.deleteUser(participantData);
      await postgreSqlManager.games.deleteGame({id: createdGameId});
    });
  });
});
