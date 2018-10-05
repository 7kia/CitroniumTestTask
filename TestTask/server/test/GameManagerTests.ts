/**
 * Created by Илья on 22.08.2018.
 */
/**
 * Created by Илья on 11.08.2018.
 */
import { assert } from "chai";
import "mocha";

import * as Parallel from "async-parallel";
import {DataForCreation} from "../src/Helpers";
import {Game, GameState} from "../src/db/Entity/Game";
import {postgreSqlManager} from "../src/db/index";
import {logger} from "../src/Logger";
import {ERROR_GAME_MESSAGES, GameManager, PlayerRole} from "../src/GameManager";
import {User} from "../src/db/Entity/User";
import Dictionary from "typescript-collections/dist/lib/Dictionary";
import {MyPosition} from "../src/MyPosition";
import {GameReport} from "../src/db/Entity/GameReport";
import {GameRules} from "../src/DomainModel/rules/GameRules";

describe("GameManager. " +
  "Менеджер игры. Позволяет игрокам взаимодействовать с конкретной " +
  "игровой партией, искать и подключаться к партиям.", () => {
  const assertThrowsAsync: (testFunc: () => any, regExp: any) => Promise<void>
    = async (testFunc: () => any, regExp: any) => {
    let func = () => {};
    try {
      await testFunc();
    } catch (error) {
      func = () => {throw error};
    } finally {
      assert.throws(func, regExp);
    }
  };
  const deleteGameIfExist = async (gameData: DataForCreation) => {
    try {
      const foundGames: Game[] = await postgreSqlManager.games.find(gameData);
      if (foundGames) {
        await postgreSqlManager.games.deleteGame(gameData);
      }
    } catch (error) {
      logger.info("Удалены тестовые данные");
    }
  };

  it("Позволяет найти игровую партию по имени игроков создателей " +
    "и участников, и по размеру поля.", async () => {
    const gameData: {[id: string]: any} = {
      creator_name: "Player2",
      participant_name: "Player3",
      field_size: 3,
    };

    const games: Game[] = await GameManager.getGame("Player0", null, null);
    const games2: Game[] = await GameManager.getGame(null, gameData.participant_name, null);
    const games3: Game[] = await GameManager.getGame(null, null, gameData.field_size);
    const games4: Game[] = await GameManager.getGame(
      gameData.creator_name,
      gameData.participant_name,
      null,
    );
    const games5: Game[] = await GameManager.getGame(
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
    assert.isTrue(expectedIds.indexOf(games3[0].id) > -1);
    assert.isTrue(expectedIds.indexOf(games3[1].id) > -1);

    assert.strictEqual(games4[0].id, 1);
    assert.strictEqual(games5[0].id, 1);
  });

  it("Игрок может отсутствовать в игре не более 5 минут.", async () => {
    assert.strictEqual(GameManager.MAX_INACTIVE_TIME, 300000);
  });

  describe("Может дать роль игрока в конкретной партии", async () => {
    it("Игрок может быть создателем.", async () => {
      const role1: PlayerRole = await GameManager.getRoleToGame(2, 1);
      assert.strictEqual(role1, PlayerRole.Creator);
    });
    it("Игрок может быть участником.", async () => {
      const role1: PlayerRole = await GameManager.getRoleToGame(3, 1);
      assert.strictEqual(role1, PlayerRole.Participant);
    });
    it("Игрок может быть наблюдателем, если не участвует в этой " +
      "партии.", async () => {
      const role1: PlayerRole = await GameManager.getRoleToGame(2, 0);
      const role2: PlayerRole = await GameManager.getRoleToGame(3, 0);
      assert.strictEqual(role1, PlayerRole.Observer);
      assert.strictEqual(role2, PlayerRole.Observer);
    });

  });
  it("Может определить: станет ли этот игрок участником в этой " +
    "партии.", async () => {

    let userData: DataForCreation = new Dictionary<string, any>();
    userData.setValue("name", "PlayerNeww");
    userData.setValue("email", "eNew2.e@com");
    userData.setValue("password", "sdf");

    await deleteUserIfExist(userData);
    await postgreSqlManager.users.create(userData);
    const user: User = await postgreSqlManager.users.find(userData);
    const willParticipantToGame0: boolean = await GameRules.canStandParticipant(user.id, 0);
    const willParticipantToGame1: boolean = await GameRules.canStandParticipant(user.id, 1);

    assert.strictEqual(willParticipantToGame0, true);
    assert.strictEqual(willParticipantToGame1, false);

    await postgreSqlManager.users.deleteUser(userData);
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
    await postgreSqlManager.users.create(creatorData);
    await postgreSqlManager.users.create(participantData);

    let creator: User = await postgreSqlManager.users.find(creatorData);
    let participant: User = await postgreSqlManager.users.find(participantData);

    await GameManager.unconnectPlayer(creator.id);
    await GameManager.unconnectPlayer(participant.id);
    creator = await postgreSqlManager.users.find(creatorData);
    participant = await postgreSqlManager.users.find(participantData);

    await deleteGameIfExist(gameData);
    await postgreSqlManager.games.create(gameData);
    let foundGames: Game[] = await postgreSqlManager.games.find(gameData);
    let newGame: Game = foundGames[0];

    assert.strictEqual(creator.accessToken, null);
    assert.strictEqual(participant.accessToken, null);
    assert.strictEqual(newGame.creatorGameId, null);
    assert.strictEqual(newGame.participantId, null);
    const connectCreator: boolean = await GameManager.connectPlayer(creator.id, newGame.id);
    const connectParticipant: boolean = await GameManager.connectPlayer(participant.id, newGame.id);
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

    await GameManager.unconnectPlayer(creator.id);
    await GameManager.unconnectPlayer(participant.id);
    await postgreSqlManager.games.deleteGame(gameData);
    await postgreSqlManager.users.deleteUser(creatorData);
    await postgreSqlManager.users.deleteUser(participantData);

  });
  it("Может дать время игровой партии.", async () => {
    const gameTime: number = await GameManager.getGameTime(0);

    assert.strictEqual(gameTime, 0);
  });

  const deleteUserIfExist = async (userData: DataForCreation) => {
    try {
      const foundUser: User = await postgreSqlManager.users.find(userData);
      if (foundUser) {
        await postgreSqlManager.users.deleteUser(userData);
      }
    } catch (error) {
      console.log("Удалены тестовое данные");
    }
  };

  enum WhoMove {
    Nobody = 0,
    Creator,
    Participant,
  }
  const testPlayerMoveToGame = async (
    creatorPlayerData: DataForCreation,
    participantPlayerData: DataForCreation,
    startGameData: DataForCreation,
    actions: (creator: User, participant: User, game: Game) => void,
    whoMove: WhoMove,
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
    let leadingPlayerId: number = null;
    switch (whoMove) {
      case WhoMove.Creator: {
        leadingPlayerId = creator.id;
        break;
      }
      case WhoMove.Participant: {
        leadingPlayerId = participant.id;
        break;
      }
    }
    gameData.setValue("leading_player_id", leadingPlayerId);

    let searchGameData: DataForCreation = new Dictionary<string, any>();
    searchGameData.setValue("access_token", startGameData.getValue("access_token"));

    await deleteGameIfExist(searchGameData);
    await postgreSqlManager.games.create(gameData);

    let foundGames: Game[] = await postgreSqlManager.games.find(searchGameData);
    let game: Game = foundGames[0];

    await GameManager.connectPlayer(creator.id, game.id);
    await GameManager.connectPlayer(participant.id, game.id);

    creator = await postgreSqlManager.users.find(creatorPlayerData);
    participant = await postgreSqlManager.users.find(participantPlayerData);
    foundGames = await postgreSqlManager.games.find(searchGameData);
    game = foundGames[0];
    await actions(creator, participant, game);

    await postgreSqlManager.games.deleteGame(searchGameData);
    await postgreSqlManager.users.deleteUser(creatorPlayerData);
    await postgreSqlManager.users.deleteUser(participantPlayerData);
  };
  describe("Может дать знак ходящего игрока.", async () => {
    it("Если ходит создатель, то будет крестик.", async () => {
      let creatorData: DataForCreation = new Dictionary<string, any>();
      creatorData.setValue("name", "PlayerCreatorSign_X");
      let participantData: DataForCreation = new Dictionary<string, any>();
      participantData.setValue("name", "PlayerParticipantSign_X");
      let gameData: DataForCreation = new Dictionary<string, any>();
      gameData.setValue("access_token", "PlayerParticipantSign_X");

      await testPlayerMoveToGame(
        creatorData,
        participantData,
        gameData,
        (creator: User, participant: User, game: Game): void => {
          assert.strictEqual(GameManager.getLeadingPlayerSign(game), "X");
        },
        WhoMove.Creator,
      );
    });
    it("Если ходит участник, то будет нолик.", async () => {
      let creatorData: DataForCreation = new Dictionary<string, any>();
      creatorData.setValue("name", "PlayerCreatorSign_0");
      let participantData: DataForCreation = new Dictionary<string, any>();
      participantData.setValue("name", "PlayerParticipantSign_0");
      let gameData: DataForCreation = new Dictionary<string, any>();
      gameData.setValue("access_token", "PlayerParticipantSign_0");

      await testPlayerMoveToGame(
        creatorData,
        participantData,
        gameData,
        (creator: User, participant: User, game: Game): void => {
          assert.strictEqual(GameManager.getLeadingPlayerSign(game), "0");
        },
        WhoMove.Participant,
      );
    });
    it("Если ходящего игрока нет, то будет брошено исключение.", async () => {
      let creatorData: DataForCreation = new Dictionary<string, any>();
      creatorData.setValue("name", "PlayerCreator_leadingNotSet");
      let participantData: DataForCreation = new Dictionary<string, any>();
      participantData.setValue("name", "PlayerParticipantSign_leadingNotSet");
      let gameData: DataForCreation = new Dictionary<string, any>();
      gameData.setValue("access_token", "PlayerParticipantSign_leadingNotSet");

      await testPlayerMoveToGame(
        creatorData,
        participantData,
        gameData,
        (creator: User, participant: User, game: Game): void => {
          assert.throws(
            () => {
              assert.strictEqual(GameManager.getLeadingPlayerSign(game), "X");
            },
            Error,
          );
        },
        WhoMove.Nobody,
      );
    });
  });
  describe("Может принять ход то игрока", async () => {
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
          async (creator: User, participant: User, game: Game): Promise<void> => {
            await assertThrowsAsync(
              async () => await GameManager.takePlayerMove(creator.id, new MyPosition(1, 0), game.id),
              ERROR_GAME_MESSAGES.thisCellFilled,
            );
            const foundGames: Game[] = await postgreSqlManager.games.find(gameData);
            game = foundGames[0];
            assert.deepEqual(game.field, gameData.getValue("field"));
            assert.strictEqual(game.winPlayerId, null);
            assert.strictEqual(game.leadingPlayerId, creator.id);
          },
          WhoMove.Creator,
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
            async (creator: User, participant: User, game: Game): Promise<void> => {
              await GameManager.takePlayerMove(creator.id, new MyPosition(2, 1), game.id);
              let foundGames: Game[] = await postgreSqlManager.games.find(searchGameData);
              game = foundGames[0];
              assert.deepEqual(game.field, ["???", "??X", "???"]);
              assert.strictEqual(game.gameState, GameState.NoWinner);
              assert.strictEqual(game.winPlayerId, null);
              assert.strictEqual(game.leadingPlayerId, participant.id);

              await GameManager.takePlayerMove(participant.id, new MyPosition(1, 1), game.id);
              foundGames = await postgreSqlManager.games.find(searchGameData);
              game = foundGames[0];
              assert.deepEqual(game.field, ["???", "?0X", "???"]);
              assert.strictEqual(game.gameState, GameState.NoWinner);
              assert.strictEqual(game.winPlayerId, null);
              assert.strictEqual(game.leadingPlayerId, creator.id);
            },
            WhoMove.Creator,
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
            async (creator: User, participant: User, game: Game): Promise<void> => {
              const newField: string[] = ["XXX", gameData.getValue("field")[1], gameData.getValue("field")[2]];
              await GameManager.takePlayerMove(creator.id, new MyPosition(2, 0), game.id);

              const foundGames: Game[] = await postgreSqlManager.games.find(searchGameData);
              game = foundGames[0];
              assert.deepEqual(game.field, newField);
              assert.strictEqual(game.gameState, GameState.CreatorWin);
              assert.strictEqual(game.winPlayerId, creator.id);
              assert.strictEqual(game.leadingPlayerId, creator.id);

              await assertThrowsAsync(
                async () => GameManager.takePlayerMove(participant.id, new MyPosition(2, 2), game.id),
                ERROR_GAME_MESSAGES.gameEnd
              );
            },
            WhoMove.Creator
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
            async (creator: User, participant: User, game: Game): Promise<void> => {
              assert.strictEqual(game.lastMoveTime, null);

              await GameManager.takePlayerMove(creator.id, new MyPosition(0, 0), game.id);
              const foundGames: Game[] = await postgreSqlManager.games.find(searchGameData);
              game = foundGames[0];
              assert.strictEqual(game.lastMoveTime, gameData.getValue("time"));
            },
            WhoMove.Creator
          );
        });
        it("Если после хода игрока все клетки заполнены и никто не выиграл, " +
          "то объявляется ничья. Дальнейшие ходы не принимаются", async () => {
          let creatorData: DataForCreation = new Dictionary<string, any>();
          creatorData.setValue("name", "CreatorTestMove_EmptyCellAndDraw");
          creatorData.setValue("email", "CreatorTestMove_EmptyCellAndDraw@e.com");
          let participantData: DataForCreation = new Dictionary<string, any>();
          participantData.setValue("name", "ParticipantTestMove_EmptyCellAndDraw");
          participantData.setValue("email", "ParticipantTestMove_EmptyCellAndDraw@e.com");
          let gameData: DataForCreation = new Dictionary<string, any>();
          gameData.setValue("field_size", 3);
          gameData.setValue("field", [
            "X0X",
            "X0X",
            "0?0"]);
          gameData.setValue("access_token", "CreatorTestMove_EmptyCellAndDraw");
          gameData.setValue("time", 10);

          let searchGameData: DataForCreation = new Dictionary<string, any>();
          searchGameData.setValue("access_token", gameData.getValue("access_token"));

          await testPlayerMoveToGame(
            creatorData,
            participantData,
            gameData,
            async (creator: User, participant: User, game: Game): Promise<void> => {
              await GameManager.takePlayerMove(creator.id, new MyPosition(1, 2), game.id);
              let foundGames: Game[] = await postgreSqlManager.games.find(searchGameData);
              game = foundGames[0];
              assert.deepEqual(game.field, [
                gameData.getValue("field")[0],
                gameData.getValue("field")[1],
                "0X0"]
              );
              assert.strictEqual(game.gameState, GameState.Draw);
              assert.strictEqual(game.winPlayerId, null);

              await assertThrowsAsync(
                async () => GameManager.takePlayerMove(participant.id, new MyPosition(2, 2), game.id),
                ERROR_GAME_MESSAGES.gameEnd
              );
            },
            WhoMove.Creator
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
          async (creator: User, participant: User, game: Game): Promise<void> => {
            await assertThrowsAsync(
              async () => await GameManager.takePlayerMove(participant.id, new MyPosition(2, 0), game.id),
              ERROR_GAME_MESSAGES.moveAnotherPlayer,
            );

            const foundGames: Game[] = await postgreSqlManager.games.find(searchGameData);
            game = foundGames[0];
            assert.deepEqual(game.field, gameData.getValue("field"));
            assert.strictEqual(game.gameState, GameState.NoWinner);
            assert.strictEqual(game.winPlayerId, null);
            assert.strictEqual(game.leadingPlayerId, creator.id);
          },
          WhoMove.Creator,
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
          async (creator: User, participant: User, game: Game): Promise<void> => {
            let observerData: DataForCreation = new Dictionary<string, any>();
            observerData.setValue("name", "ObserverUser");
            observerData.setValue("email", "ObserverUser@e.com");

            await deleteUserIfExist(observerData);
            await postgreSqlManager.users.create(observerData);
            const observer: User = await postgreSqlManager.users.find(observerData);
            await assertThrowsAsync(
              async () => await GameManager.takePlayerMove(observer.id, new MyPosition(2, 0), game.id),
              ERROR_GAME_MESSAGES.tokenNotCorrespond,
            );

            const foundGames: Game[] = await postgreSqlManager.games.find(searchGameData);
            game = foundGames[0];
            assert.deepEqual(game.field, gameData.getValue("field"));
            assert.strictEqual(game.winPlayerId, null);
            assert.strictEqual(game.leadingPlayerId, creator.id);

            await postgreSqlManager.users.deleteUser(observerData);
          },
          WhoMove.Creator,
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

    const testFindWinnerFunction: (testData: DataForCreation[]) => void
      = (testData: DataForCreation[]) => {
      let game: Game = new Game(gameData);

      for (const data of testData) {
        game.leadingPlayerId = data.getValue("leading_player_id");
        game.field = data.getValue("field");
        game.fieldSize = data.getValue("field_size");
        const winnerId: number = GameManager.findWinner(game, data.getValue("position"));
        assert.strictEqual(winnerId, data.getValue("winner_id"));
      }
    };
    describe("Если заполнена знаками одного типа:", () => {
      it("Горизонталь.", () => {
        let testData1: DataForCreation = new Dictionary<string, any>();
        testData1.setValue("leading_player_id", gameData.getValue("participant_id"));
        testData1.setValue("field", ["???", "???", "000"]);
        testData1.setValue("position", new MyPosition(1, 2));
        testData1.setValue("winner_id", gameData.getValue("participant_id"));
        testData1.setValue("field_size", 3);
        let testData2: DataForCreation = new Dictionary<string, any>();
        testData2.setValue("leading_player_id", gameData.getValue("creator_game_id"));
        testData2.setValue("field", ["XXX", "???", "???"]);
        testData2.setValue("position", new MyPosition(2, 0));
        testData2.setValue("winner_id", gameData.getValue("creator_game_id"));
        testData2.setValue("field_size", 3);
        let testData3: DataForCreation = new Dictionary<string, any>();
        testData3.setValue("leading_player_id", gameData.getValue("creator_game_id"));
        testData3.setValue("field", ["???", "XXX", "???"]);
        testData3.setValue("position", new MyPosition(2, 1));
        testData3.setValue("winner_id", gameData.getValue("creator_game_id"));
        testData3.setValue("field_size", 3);
        let testData4: DataForCreation = new Dictionary<string, any>();
        testData4.setValue("leading_player_id", gameData.getValue("creator_game_id"));
        testData4.setValue("field", ["????", "????", "XXXX", "????"]);
        testData4.setValue("position", new MyPosition(2, 2));
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
        testData1.setValue("position", new MyPosition(0, 1));
        testData1.setValue("winner_id", gameData.getValue("creator_game_id"));
        testData1.setValue("field_size", 3);
        let testData2: DataForCreation = new Dictionary<string, any>();
        testData2.setValue("leading_player_id", gameData.getValue("creator_game_id"));
        testData2.setValue("field", ["?X??", "?X??", "?X??", "?X??"]);
        testData2.setValue("position", new MyPosition(1, 3));
        testData2.setValue("winner_id", gameData.getValue("creator_game_id"));
        testData2.setValue("field_size", 4);
        let testData3: DataForCreation = new Dictionary<string, any>();
        testData3.setValue("leading_player_id", gameData.getValue("participant_id"));
        testData3.setValue("field", ["???0", "???0", "???0", "???0"]);
        testData3.setValue("position", new MyPosition(3, 2));
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
        testData1.setValue("position", new MyPosition(1, 1));
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
        testData2.setValue("position", new MyPosition(1, 1));
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
        testData3.setValue("position", new MyPosition(1, 2));
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
        testData4.setValue("position", new MyPosition(1, 2));
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
      testData1.setValue("position", new MyPosition(1, 1));
      testData1.setValue("winner_id", GameManager.NO_WINNER);
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
      testData2.setValue("position", new MyPosition(2, 1));
      testData2.setValue("winner_id", GameManager.NO_WINNER);
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
      testData3.setValue("position", new MyPosition(2, 2));
      testData3.setValue("winner_id", GameManager.NO_WINNER);
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
    it("Партия заканчивается когда кто-нибудь выигрывает", async () => {
      let creatorData: DataForCreation = new Dictionary<string, any>();
      creatorData.setValue("name", "CreatorGameMoveWinner");
      creatorData.setValue("email", "CreatorGameMoveWinner@e.com");
      let participantData: DataForCreation = new Dictionary<string, any>();
      participantData.setValue("name", "ParticipantGameMoveLoser");
      participantData.setValue("email", "ParticipantGameMoveLoser@e.com");
      const fieldSize: number = 3;

      await deleteUserIfExist(creatorData);
      await deleteUserIfExist(participantData);
      await postgreSqlManager.users.create(creatorData);
      await postgreSqlManager.users.create(participantData);

      const creator: User = await postgreSqlManager.users.find(creatorData);
      const participant: User = await postgreSqlManager.users.find(participantData);

      const createdGameId: number = await GameManager.createGameAndConnectCreator(creator.id, fieldSize);
      let searchGameData: DataForCreation = new Dictionary<string, any>();
      searchGameData.setValue("id", createdGameId);

      await Parallel.invoke(
        [
          async () => {
            await GameManager.waitParticipant(createdGameId);
          },
          async () => {
            await GameManager.connectPlayer(participant.id, createdGameId);
          },
        ],
      );
      await Parallel.invoke(
        [
          async () => {
            await GameManager.runGame(createdGameId);
          },
          async () => {
            await GameManager.takePlayerMove(creator.id, new MyPosition(0, 0), createdGameId);
            await GameManager.takePlayerMove(participant.id, new MyPosition(1, 0), createdGameId);
            await GameManager.takePlayerMove(creator.id, new MyPosition(1, 1), createdGameId);
            await GameManager.takePlayerMove(participant.id, new MyPosition(0, 1), createdGameId);
            await GameManager.takePlayerMove(creator.id, new MyPosition(2, 2), createdGameId);
          },
        ],
      );

      const foundGames: Game[] = await postgreSqlManager.games.find(searchGameData);
      const game: Game = foundGames[0];

      assert.strictEqual(game.gameState, GameState.CreatorWin);
      assert.strictEqual(game.winPlayerId, game.creatorGameId);
      await postgreSqlManager.users.deleteUser(creatorData);
      await postgreSqlManager.users.deleteUser(participantData);
      await deleteGameIfExist(searchGameData);
    });
  });
});
