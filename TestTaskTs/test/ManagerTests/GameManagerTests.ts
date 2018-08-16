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
      access_token: "qwe1",
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

      let gameData: {[id: string]: any} = {
        field_size: startGameData.field_size,
        field: startGameData.field,
        access_token: startGameData.access_token,
        time: startGameData.time,
        leading_player_id: creator.id,
      };
      await deleteGameIfExist({access_token: gameData.access_token});
      await postgreSqlManager.games.create(gameData);
      let foundGames: Game[] = await postgreSqlManager.games.find(gameData);
      let game: Game = foundGames[0];

      await GameManeger.connectPlayer(creator.id, game.id);
      await GameManeger.connectPlayer(participant.id, game.id);

      creator = await postgreSqlManager.users.find(creatorPlayerData);
      participant = await postgreSqlManager.users.find(participantPlayerData);
      foundGames = await postgreSqlManager.games.find(gameData);
      game = foundGames[0];
      await playerActions(creator, participant, game);

      await postgreSqlManager.games.deleteGame(gameData);
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
        const creatorData: DataForCreation = {
          name: "PlayerCreatorTestMove_EmptyCell",
          email: "PlayerCreatorTestMove_EmptyCell.e@com",
          password: "123",
        };
        const participantData: DataForCreation = {
          name: "PlayerParticipantTestMove_EmptyCell",
          email: "PlayerParticipantTestMove_EmptyCell.e@com",
          password: "123",
        };
        const gameData: DataForCreation = {
          field_size: 3,
          field: ["?0?", "???", "???"],
          access_token: "PlayerCreatorTestMove_EmptyCell",
          time: 10,
        };
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
            assert.deepEqual(game.field, gameData.field);
            assert.deepEqual(game.winPlayerId, null);
            assert.deepEqual(game.leadingPlayerId, creator.id);
          },
        );
      });
      describe("Если ход корректный.", async () => {
        it("Если игрок сходил в пустую клетку, то ставится знак " +
          "игрока и право хода передаётся другому игроку, " +
          "если сходивший игрок не выиграл. ", async () => {
          const creatorData: DataForCreation = {
            name: "CreatorTestMove_EmptyCellAndNoWinner",
            email: "CreatorTestMove_EmptyCellAndNoWinner.e@com",
            password: "123",
          };
          const participantData: DataForCreation = {
            name: "ParticipantTestMove_EmptyCellAndNoWinner",
            email: "ParticipantTestMove_EmptyCellAndNoWinner.e@com",
            password: "123",
          };
          const gameData: DataForCreation = {
            field_size: 3,
            field: ["???", "???", "???"],
            access_token: "CreatorTestMove_EmptyCellAndNoWinner",
            time: 10,
          };
          await testPlayerMoveToGame(
            creatorData,
            participantData,
            gameData,
            async (creator: User, participant: User, game: Game): void => {
              await GameManeger.takePlayerMove(creator.id, new Position(2, 1), game.id);
              let foundGames: Game[] = await postgreSqlManager.games.find({access_token: gameData.access_token});
              game = foundGames[0];
              assert.deepEqual(game.field, ["???", "??X", "???"]);
              assert.deepEqual(game.winPlayerId, null);
              assert.deepEqual(game.leadingPlayerId, participant.id);

              await GameManeger.takePlayerMove(participant.id, new Position(1, 1), game.id);
              foundGames = await postgreSqlManager.games.find({access_token: gameData.access_token});
              game = foundGames[0];
              assert.deepEqual(game.field, ["???", "?0X", "???"]);
              assert.deepEqual(game.winPlayerId, null);
              assert.deepEqual(game.leadingPlayerId, creator.id);
            },
          );
        });
        it("Если после хода игрок выиграл, то он отмечается как победитель " +
          "и последующие ходы не принимаются.", async () => {
          const creatorData: DataForCreation = {
            name: "CreatorTestMove_EmptyCellAndFoundWinner",
            email: "CreatorTestMove_EmptyCellAndFoundWinner.e@com",
            password: "123",
          };
          const participantData: DataForCreation = {
            name: "ParticipantTestMove_EmptyCellAndFoundWinner",
            email: "ParticipantTestMove_EmptyCellAndFoundWinner.e@com",
            password: "123",
          };
          const gameData: DataForCreation = {
            field_size: 3,
            field: ["XX?", "00?", "???"],
            access_token: "CreatorTestMove_EmptyCellAndFoundWinner",
            time: 10,
          };
          await testPlayerMoveToGame(
            creatorData,
            participantData,
            gameData,
            async (creator: User, participant: User, game: Game): void => {
              const newField: string[] = ["XXX", gameData.field[1], gameData.field[2]];
              await GameManeger.takePlayerMove(creator.id, new Position(2, 0), game.id);

              const foundGames: Game[] = await postgreSqlManager.games.find({access_token: gameData.access_token});
              game = foundGames[0];
              assert.deepEqual(game.field, newField);
              assert.deepEqual(game.winPlayerId, creator.id);
              assert.deepEqual(game.leadingPlayerId, creator.id);

              await assertThrowsAsync(
                async () => GameManeger.takePlayerMove(participant.id, new Position(2, 2), game.id),
                ERROR_GAME_MESSAGES.gameEnd,
              );
            },
          );
        });
        it("Когда игрок ходит фиксируется время последнего хода.", async () => {
          const creatorData: DataForCreation = {
            name: "CreatorTestMove_FixLastMoveTime",
            email: "CreatorTestMove_FixLastMoveTime.e@com",
            password: "123",
          };
          const participantData: DataForCreation = {
            name: "ParticipantTestMove_FixLastMoveTime",
            email: "ParticipantTestMove_FixLastMoveTime.e@com",
            password: "123",
          };
          const gameData: DataForCreation = {
            field_size: 3,
            field: ["?0?", "???", "???"],
            access_token: "CreatorTestMove_FixLastMoveTime",
            time: 10,
          };
          await testPlayerMoveToGame(
            creatorData,
            participantData,
            gameData,
            async (creator: User, participant: User, game: Game): void => {
              assert.deepEqual(game.lastMoveTime, null);

              await GameManeger.takePlayerMove(creator.id, new Position(0, 0), game.id);
              const foundGames: Game[] = await postgreSqlManager.games.find({access_token: gameData.access_token});
              game = foundGames[0];
              assert.deepEqual(game.lastMoveTime, gameData.time);
            },
          );
        });
      });

      it("Если игрок сходил когда должен ходить другой " +
        "игрок, то будет брошено исключение.", async () => {
        const creatorData: DataForCreation = {
          name: "CreatorTestMove_MoveNotHaveRightMove",
          email: "CreatorTestMove_MoveNotHaveRightMove.e@com",
          password: "123",
        };
        const participantData: DataForCreation = {
          name: "ParticipantTestMove_MoveNotHaveRightMove",
          email: "ParticipantTestMove_MoveNotHaveRightMove.e@com",
          password: "123",
        };
        const gameData: DataForCreation = {
          field_size: 3,
          field: ["XX?", "00?", "???"],
          access_token: "CreatorTestMove_MoveNotHaveRightMove",
          time: 10,
        };
        await testPlayerMoveToGame(
          creatorData,
          participantData,
          gameData,
          async (creator: User, participant: User, game: Game): void => {
            await assertThrowsAsync(
              async () => await GameManeger.takePlayerMove(participant.id, new Position(2, 0), game.id),
              ERROR_GAME_MESSAGES.moveAnotherPlayer,
            );

            const foundGames: Game[] = await postgreSqlManager.games.find({access_token: gameData.access_token});
            game = foundGames[0];
            assert.deepEqual(game.field, gameData.field);
            assert.deepEqual(game.winPlayerId, null);
            assert.deepEqual(game.leadingPlayerId, creator.id);
          },
        );
      });
    });
    describe("Если игрок не участвует в этой партии.", async () => {
      it("Ему нельзя ходить, будет брошено исключение.", async () => {
        const creatorData: DataForCreation = {
          name: "CreatorTestMove_ObserverMove",
          email: "CreatorTestMove_ObserverMove.e@com",
          password: "123",
        };
        const participantData: DataForCreation = {
          name: "ParticipantTestMove_ObserverMove",
          email: "ParticipantTestMove_ObserverMove.e@com",
          password: "123",
        };
        const gameData: DataForCreation = {
          field_size: 3,
          field: ["XX?", "00?", "???"],
          access_token: "CreatorTestMove_ObserverMove",
          time: 10,
        };
        await testPlayerMoveToGame(
          creatorData,
          participantData,
          gameData,
          async (creator: User, participant: User, game: Game): void => {
            const observerData: DataForCreation = {
              name: "ObserverUser",
              email: "ObserverUser.e@com",
              //password: "123",
            };
            deleteUserIfExist(observerData);
            await postgreSqlManager.users.create(observerData);
            const observer: User = await postgreSqlManager.users.find(observerData);
            await assertThrowsAsync(
              async () => await GameManeger.takePlayerMove(observer.id, new Position(2, 0), game.id),
              ERROR_GAME_MESSAGES.tokenNotCorrespond,
            );

            const foundGames: Game[] = await postgreSqlManager.games.find({access_token: gameData.access_token});
            game = foundGames[0];
            assert.deepEqual(game.field, gameData.field);
            assert.deepEqual(game.winPlayerId, null);
            assert.deepEqual(game.leadingPlayerId, creator.id);

            await postgreSqlManager.users.deleteUser(observerData);
          },
        );
      });
    });
  });
  describe("Может определить победителя в игре.", () => {
    const gameData: {[id: string]: any} = {
      creator_game_id: 6,
      participant_id: 7,
      access_token: "gameWinner",
      time: 0,
      leading_player_id: 6,
    };
    const testFindWinnerFunction: () => void = (testData: Array<{[id: string]: any}>) => {
      let game: Game = new Game(gameData);

      for (const data: {[id: string]: any} of testData) {
        game.leadingPlayerId = data.leadingPlayerId;
        game.field = data.field;
        game.fieldSize = data.fieldSize;
        const winnerId: number = GameManeger.findWinner(game, data.position);
        assert.strictEqual(winnerId, data.winnerId);
      }
    };
    describe("Если заполнена знаками одного типа:", () => {
      it("Горизонталь.", () => {
        const testData: Array<{[id: string]: any}> = [
          {
            leadingPlayerId: gameData.participant_id,
            field: ["???", "???", "000"],
            position: new Position(1, 2),
            winnerId: gameData.participant_id,
            fieldSize: 3,
          },
          {
            leadingPlayerId: gameData.creator_game_id,
            field: ["XXX", "???", "???"],
            position: new Position(2, 0),
            winnerId: gameData.creator_game_id,
            fieldSize: 3,
          },
          {
            leadingPlayerId: gameData.creator_game_id,
            field: ["???", "XXX", "???"],
            position: new Position(2, 1),
            winnerId: gameData.creator_game_id,
            fieldSize: 3,
          },
          {
            leadingPlayerId: gameData.creator_game_id,
            field: ["????", "????", "XXXX", "????"],
            position: new Position(2, 2),
            winnerId: gameData.creator_game_id,
            fieldSize: 4,
          },
        ];
        testFindWinnerFunction(testData);
      });
      it("Вертикаль.", () => {
        const testData: Array<{[id: string]: any}> = [
          {
            leadingPlayerId: gameData.creator_game_id,
            field: ["X??", "X??", "X??"],
            position: new Position(0, 1),
            winnerId: gameData.creator_game_id,
            fieldSize: 3,
          },
          {
            leadingPlayerId: gameData.creator_game_id,
            field: ["?X??", "?X??", "?X??", "?X??"],
            position: new Position(1, 3),
            winnerId: gameData.creator_game_id,
            fieldSize: 4,
          },
          {
            leadingPlayerId: gameData.participant_id,
            field: ["???0", "???0", "???0", "???0"],
            position: new Position(3, 2),
            winnerId: gameData.participant_id,
            fieldSize: 4,
          },
        ];
        testFindWinnerFunction(testData);
      });
      it("Диагональ.", () => {
        const testData: Array<{[id: string]: any}> = [
          {
            leadingPlayerId: gameData.creator_game_id,
            field: ["X??", "?X?", "??X"],
            position: new Position(1, 1),
            winnerId: gameData.creator_game_id,
            fieldSize: 3,
          },
          {
            leadingPlayerId: gameData.participant_id,
            field: [
              "0???",
              "?0??",
              "??0?",
              "???0",
            ],
            position: new Position(1, 1),
            winnerId: gameData.participant_id,
            fieldSize: 4,
          },
          {
            leadingPlayerId: gameData.participant_id,
            field: [
              "???0",
              "??0?",
              "?0??",
              "0???",
            ],
            position: new Position(1, 2),
            winnerId: gameData.participant_id,
            fieldSize: 4,
          },
          {
            leadingPlayerId: gameData.creator_game_id,
            field: [
              "???X",
              "??X?",
              "?X??",
              "X???",
            ],
            position: new Position(1, 2),
            winnerId: gameData.creator_game_id,
            fieldSize: 4,
          },
        ];
        testFindWinnerFunction(testData);
      });
    });
    it("Если победителя нет то функция возвращает null", () => {
      const testData: Array<{[id: string]: any}> = [
        {
          leadingPlayerId: gameData.participant_id,
          field: [
            "???",
            "?0?",
            "?XX",
          ],
          position: new Position(1, 1),
          winnerId: GameManeger.NO_WINNER,
          fieldSize: 3,
        },
        {
          leadingPlayerId: gameData.participant_id,
          field: [
            "?0??",
            "??0?",
            "???0",
            "????",
          ],
          position: new Position(2, 1),
          winnerId: GameManeger.NO_WINNER,
          fieldSize: 4,
        },
        {
          leadingPlayerId: gameData.creator_game_id,
          field: [
            "????",
            "???X",
            "??X?",
            "?X??",
          ],
          position: new Position(2, 2),
          winnerId: GameManeger.NO_WINNER,
          fieldSize: 4,
        },
      ];
      testFindWinnerFunction(testData);
    });
  });

});
