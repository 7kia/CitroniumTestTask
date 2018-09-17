/**
 * Created by Илья on 11.08.2018.
 */
import {Game, GameState} from "./db/Entity/Game";
import {User} from "./db/Entity/User";
import {postgreSqlManager} from "./db";
import {logger} from "./Logger";
import {DataForCreation, Helpers} from "./Helpers";
import * as crypto from "crypto";
import * as moment from "moment";
import * as Parallel from "async-parallel";
import Dictionary from "typescript-collections/dist/lib/Dictionary";
import {MyPosition} from "./MyPosition";
import {Repository} from "./db/repositories/Repository";

enum PlayerRole {
  Creator = 1,
  Participant,
  Observer
}

enum Cell {
  Empty = "?",
  Cross = "X",
  Zero = "0"
}

const GAME_MESSAGES: {[id: string]: string} = {
  yourMove: "Your move",
};

const ACCESS_TOKEN_LENGTH: number = 10;// TODO: подкоректируй значения

const ERROR_GAME_MESSAGES: {[id: string]: string} = {
  unknownSymbol: "Unknown symbol",
  tokenNotCorrespond: "Access token not correspond.",
  moveAnotherPlayer: "Now move another player.",
  gameEnd: "Game end.",
  thisCellFilled: "Player move to filled cell.",
};

class GameManager {
  public static get NO_WINNER(): number {
    return -1;
  }
  public static get MAX_INACTIVE_TIME(): number {
    return moment.duration(5, "m").asMilliseconds();
  }
  public static async getGame(
    creatorName: string,
    participantName: string,
    fieldSize: number,
  ): Promise<Game[]> {
    try {
      let searchData: DataForCreation = new Dictionary<string, any>();

      if (creatorName) {
        let userData: DataForCreation = new Dictionary<string, any>();
        userData.setValue("name", creatorName);

        const user: User = await postgreSqlManager.users.find(userData);
        searchData.setValue("creator_game_id", user.id);
      }
      if (participantName) {
        let userData: DataForCreation = new Dictionary<string, any>();
        userData.setValue("name", participantName);

        const user: User = await postgreSqlManager.users.find(userData);
        searchData.setValue("participant_id", user.id);
      }
      if (fieldSize) {
        searchData.setValue("field_size", fieldSize);
      }
      return await postgreSqlManager.games.find(searchData);
    } catch (error) {
      logger.error(error.toString());
      throw new Error(error);
    }
  }
  public static async getRoleToGame(
    playerId: number,
    gameId: number,
  ): Promise<PlayerRole> {
    let searchGameData: DataForCreation = new Dictionary<string, any>();
    searchGameData.setValue("id", gameId);
    let searchPlayerData: DataForCreation = new Dictionary<string, any>();
    searchPlayerData.setValue("id", playerId);

    const player: User = await postgreSqlManager.users.find(searchPlayerData);
    const games: Game[] = await postgreSqlManager.games.find(searchGameData);
    const game: Game = games[0];
    let role: PlayerRole = PlayerRole.Observer;
    if (player.accessToken && (player.accessToken === game.accessToken)) {
      if (player.id === game.creatorGameId) {
        role = PlayerRole.Creator;
      } else if (player.id === game.participantId) {
        role = PlayerRole.Participant;
      }
    }
    return Promise.resolve(role);
  }

  public static async canStandParticipant(
    playerId: number,
    gameId: number,
  ): Promise<boolean> {
    let searchGameData: DataForCreation = new Dictionary<string, any>();
    searchGameData.setValue("id", gameId);
    let searchPlayerData: DataForCreation = new Dictionary<string, any>();
    searchPlayerData.setValue("id", playerId);

    const player: User = await postgreSqlManager.users.find(searchPlayerData);
    const role: PlayerRole = await GameManager.getRoleToGame(playerId, gameId);
    const games: Game[] = await postgreSqlManager.games.find(searchGameData);
    const game: Game = games[0];

    if (role === PlayerRole.Observer) {
      if (!player.accessToken && !game.participantId) {
        return Promise.resolve(true);
      }
    }
    return Promise.resolve(false);
  }

  public static async connectPlayer(playerId: number, gameId: number): Promise<boolean> {
    const willParticipant: boolean = await GameManager.canStandParticipant(playerId, gameId);
    let gameSearchData: DataForCreation = new Dictionary<string, any>();
    gameSearchData.setValue("id", gameId);
    let userSearchData: DataForCreation = new Dictionary<string, any>();
    userSearchData.setValue("id", playerId);

    const foundGames: Game[] = await postgreSqlManager.games.find(gameSearchData);
    const game: Game = foundGames[0];
    const user: User = await postgreSqlManager.users.find(userSearchData);
    if (willParticipant) {
      let newGameData: DataForCreation = new Dictionary<string, any>();
      let newUserData: DataForCreation = new Dictionary<string, any>();

      if (game.creatorGameId !== null) {
        newGameData.setValue("participant_id", playerId);
      } else {
        newGameData.setValue("creator_game_id", playerId);
      }
      newUserData.setValue("access_token", game.accessToken);

      await postgreSqlManager.games.update(game.id, newGameData);
      await postgreSqlManager.users.update(user.id, newUserData);
    }
    return Promise.resolve(willParticipant);
  }
  public static async unconnectPlayer(playerId: number): Promise<void> {
    let userData: DataForCreation = new Dictionary<string, any>();
    userData.setValue("access_token", null);

    await postgreSqlManager.users.update(playerId, userData);
  }

  public static async getIncompleteGame(userId: number): Promise<number> {
    return new Promise<number>(async (resolve, reject) => {
      try {
        let user: User = await GameManager.findUser(userId);

        console.log("user.accessToken " + user.accessToken);
        if (user.accessToken) {
          const gameData: DataForCreation = new Dictionary<string, any>();
          gameData.setValue("access_token", user.accessToken);

          const incompleteGame: Game = await GameManager.findGame(gameData);
          console.log("incompleteGame.id " + incompleteGame.id);
          resolve(incompleteGame.id);
        } else {
          resolve(null);
        }
      } catch (error) {
        reject(error);
      }
    });
  }
  public static async findGame(gameData: DataForCreation): Promise<Game> {
    return new Promise<Game>(async (resolve, reject) => {
      try {
        const foundGames: Game[] = await postgreSqlManager.games.find(gameData);
        resolve(foundGames[0]);
      } catch (error) {
        reject(new Error("Games with " + Repository.generateCriteriaString(gameData) + " not found"));
      }
    });
  }
  public static async findUser(userId: number): Promise<User> {
    return new Promise<User>(async (resolve, reject) => {
      try {
        const userData: DataForCreation = new Dictionary<string, any>();
        userData.setValue("id", userId);

        const user: User = await postgreSqlManager.users.find(userData);
        resolve(user);
      } catch (error) {
        reject(new Error("User with id = " + userId + " not found"));
      }
      resolve(null);
    });
  }
  public static async getGameTime(gameId: number): Promise<number> {
    return new Promise<User>(async (resolve, reject) => {
      try {
        let gameSearchData: DataForCreation = new Dictionary<string, any>();
        gameSearchData.setValue("id", gameId);

        const foundGames: Game[] = await postgreSqlManager.games.find(gameSearchData);
        const game: Game = foundGames[0];
        resolve(game.time);
      } catch (error) {
        reject(error);
      }
    });
  }
  public static async takePlayerMove(
    playerId: number,
    position: MyPosition,
    gameId: number,
  ): Promise<boolean> {
    return new Promise<boolean>(async (resolve, reject) => {
      let gameSearchData: DataForCreation = new Dictionary<string, any>();
      gameSearchData.setValue("id", gameId);
      let userSearchData: DataForCreation = new Dictionary<string, any>();
      userSearchData.setValue("id", playerId);

      const player: User = await postgreSqlManager.users.find(userSearchData);
      let foundGames: Game[] = await postgreSqlManager.games.find(gameSearchData);
      let game: Game = foundGames[0];

      const correspondToken: boolean = (player.accessToken === game.accessToken);
      const thisPlayerMove: boolean = (player.id === game.leadingPlayerId);
      const endGame: boolean = (game.gameState !== GameState.NoWinner);
      if (correspondToken && thisPlayerMove && !endGame) {
        const selectCell: string = game.field[position.y][position.x];
        if (selectCell === Cell.Empty) {
          const playerSign: string = GameManager.getLeadingPlayerSign(game);

          let newGameData: DataForCreation = new Dictionary<string, any>();
          game.field[position.y] = Helpers.replaceAt(game.field[position.y], position.x, playerSign);
          newGameData.setValue("field", game.field);
          newGameData.setValue("last_move_time", game.time);

          const winnerId: number = GameManager.findWinner(game, position);
          if (winnerId !== GameManager.NO_WINNER) {
            GameManager.signWinner(newGameData, winnerId, game.creatorGameId);
          } else if (GameManager.allCellFilled(game)) {
            newGameData.setValue("game_state", GameState.Draw);
          } else {
            GameManager.swapMoveLaw(game);
            newGameData.setValue("leading_player_id", game.leadingPlayerId);
            await GameManager.sendMessage(game.leadingPlayerId, GAME_MESSAGES.yourMove);
          }
          await postgreSqlManager.games.update(game.id, newGameData);
        } else {
          logger.error(
            ERROR_GAME_MESSAGES.thisCellFilled
            + "Game with id=" + game.id
            + ",player with id=" + player.id,
          );
          reject(new Error(ERROR_GAME_MESSAGES.thisCellFilled));
        }
        resolve(true);
      }

      let errorMessage: string = GameManager.setErrorMessage(
        correspondToken,
        thisPlayerMove,
        endGame
      );
      logger.error(errorMessage);
      reject(new Error(errorMessage));
    });
  }

  private static setErrorMessage(
    correspondToken: boolean,
    thisPlayerMove: boolean,
    endGame: boolean
  ): string {
    let errorMessage: string = "";
    if (!correspondToken) {
      errorMessage += ERROR_GAME_MESSAGES.tokenNotCorrespond;
    } else {
      if (!thisPlayerMove) {
        errorMessage += ERROR_GAME_MESSAGES.moveAnotherPlayer;
      }
      if (endGame) {
        errorMessage += ERROR_GAME_MESSAGES.gameEnd;
      }
    }
    return errorMessage;
  }
  private static signWinner(
    newGameData: DataForCreation,
    winnerId: number,
    creatorGameId: number
  ) {
    newGameData.setValue("win_player_id", winnerId);
    if (winnerId === creatorGameId) {
      newGameData.setValue("game_state", GameState.CreatorWin);
    } else {
      newGameData.setValue("game_state", GameState.ParticipantWin);
    }
  }

  public static findWinner(
    game: Game,
    position: MyPosition,
  ): number {
    const playerSign: string = GameManager.getLeadingPlayerSign(game);
    const firstDiagonalFunc: (x: number, pos: MyPosition) => number = (x: number, pos: MyPosition) => {
      return (x - pos.x) + pos.y;
    };
    const secondDiagonalFunc: (x: number, pos: MyPosition) => number = (x: number, pos: MyPosition) => {
      return pos.y - (x - pos.x);
    };
    if (GameManager.filledHorizontal(game.field, playerSign, position)
      || GameManager.filledVertical(game.field, playerSign, position)
      || GameManager.filledDiagonal(game.field, playerSign, position, firstDiagonalFunc)
      || GameManager.filledDiagonal(game.field, playerSign, position, secondDiagonalFunc)
    ) {
      return game.leadingPlayerId;
    }
    return GameManager.NO_WINNER;
  }
  public static async createGameAndConnectCreator(
    creatorId: number,
    fieldSize: number,
  ): Promise<number> {
    return new Promise<number>(async (resolve, reject) => {
      const accessToken: string = GameManager.generateAccessToken();
      let successCreation: boolean = false;
      while (!successCreation) {
        try {
          let newGameData: DataForCreation = new Dictionary<string, any>();
          newGameData.setValue("access_token", accessToken);
          newGameData.setValue("leading_player_id", creatorId);
          newGameData.setValue("field", GameManager.generateField(fieldSize));

          await postgreSqlManager.games.create(newGameData);
          successCreation = true;
        } catch (error) {
          logger.info(error.toString());// TODO: подумай что здесь должно выводиться
        }
      }
      let searchGameData: DataForCreation = new Dictionary<string, any>();
      searchGameData.setValue("access_token", accessToken);

      const createdGames: Game[] = await postgreSqlManager.games.find(searchGameData);
      let createdGame: Game = createdGames[0];

      await GameManager.connectPlayer(creatorId, createdGame.id);
      resolve(createdGame.id);
    });
  }
  public static async waitParticipant(gameId: number): Promise<boolean> {
    return new Promise<boolean>(async (resolve, reject) => {
      let gameSearchData: DataForCreation = new Dictionary<string, any>();
      gameSearchData.setValue("id", gameId);

      let participantConnect: boolean = false;
      while (!participantConnect) {
        const createdGames: Game[] = await postgreSqlManager.games.find(gameSearchData);
        let game: Game = createdGames[0];

        if (game.participantId) {
          let newGameData: DataForCreation = new Dictionary<string, any>();
          newGameData.setValue("time", 0);
          newGameData.setValue("last_move_time", 0);

          postgreSqlManager.games.update(game.id, newGameData);
          logger.info("Player with id=" + game.participantId + " stand participant " +
            "to game with id=" + gameId + ".");
          participantConnect = true;
        }

        Parallel.sleep(500);
      }

      resolve(participantConnect);
    });
  }

  public static async runGame(createdGameId: number): Promise<void> {
    let searchGameData: DataForCreation = new Dictionary<string, any>();
    searchGameData.setValue("id", createdGameId);
    const startTime: number = Date.now();

    let game: Game = null;
    let gameEnd: boolean = false;
    while (!gameEnd) {

      let foundGames: Game[] = await postgreSqlManager.games.find(searchGameData);
      game = foundGames[0];

      if (game.winPlayerId) {
        GameManager.sendGameReport(game.creatorGameId, game.id);
        GameManager.sendGameReport(game.participantId, game.id);
        gameEnd = true;
      } else {
        game.time = Date.now() - startTime;

        let newGameData: DataForCreation = new Dictionary<string, any>();
        newGameData.setValue("time", game.time);
        await postgreSqlManager.games.update(game.id, newGameData);

        if ((game.time - game.lastMoveTime) < GameManager.MAX_INACTIVE_TIME) {
          Parallel.sleep(500);
          continue;
        } else {
          gameEnd = true;
        }
      }
    }

    await GameManager.unconnectPlayer(game.creatorGameId);
    await GameManager.unconnectPlayer(game.participantId);
    if (!game.winPlayerId && gameEnd) {
      await GameManager.redirectToStartScreen(game.creatorGameId);
      await GameManager.redirectToStartScreen(game.participantId);
      await postgreSqlManager.games.deleteGame(searchGameData);
    }
  }
  public static async redirectToStartScreen(playerId: number): Promise<void> {
    logger.info(
      "Redirect player with id=" + playerId + " to start screen.",
    );
  }
  public static async sendGameReport(playerId: number, gameId: number): Promise<void> {
    logger.info(
      "Send game report with gameId=" + gameId
      + " for player with id=" + playerId + ".",
    );
  }

  public static getLeadingPlayerSign(game: Game): string {
    if (game.leadingPlayerId === game.creatorGameId) {
      return Cell.Cross;
    } else if (game.leadingPlayerId === game.participantId) {
      return Cell.Zero;
    }
    logger.error(ERROR_GAME_MESSAGES.unknownSymbol);
    throw new Error(ERROR_GAME_MESSAGES.unknownSymbol);
  }
  private static filledHorizontal(
    field: string[],
    playerSign: string,
    position: MyPosition,
  ): boolean {
    let filledHorizontal: boolean = true;
    for (let x: number = 0; x < field.length; x++) {
      if (field[position.y][x] === playerSign) {
        continue;
      }
      filledHorizontal = false;
      break;
    }
    return filledHorizontal;
  }
  private static filledVertical(
    field: string[],
    playerSign: string,
    position: MyPosition,
  ): boolean {
    let filledHorizontal: boolean = true;
    for (let y: number = 0; y < field.length; y++) {
      if (field[y][position.x] === playerSign) {
        continue;
      }
      filledHorizontal = false;
      break;
    }
    return filledHorizontal;
  }
  private static filledDiagonal(
    field: string[],
    playerSign: string,
    position: MyPosition,
    diagonalFunction: (x: number, position: MyPosition) => number,
  ): boolean {
    let filledDiagonal: boolean = true;
    for (let x: number = 0; x < field.length; x++) {
      const y: number = diagonalFunction(x, position);
      if ((y >= 0) && (y < field.length) && (field[y][x] === playerSign)) {
        continue;
      }
      filledDiagonal = false;
      break;
    }
    return filledDiagonal;
  }
  private static swapMoveLaw(game: Game) {
    if (game.leadingPlayerId === game.creatorGameId) {
      game.leadingPlayerId = game.participantId;
    } else {
      game.leadingPlayerId = game.creatorGameId;
    }
  }
  private static sendMessage(leadingPlayerId: number, message: string) {
    logger.info("Send message:\"" + message.toString() + "\" for player with id=" + leadingPlayerId);
  }
  private static generateField(fieldSize: number): string[] {
    let result: string[] = [];
    for (let i = 0; i < fieldSize; i++) {
      let addRow: string = "";
      for (let j = 0; j < fieldSize; j++) {
        addRow += Cell.Empty;
      }
      result.push(addRow);
    }
    return result;
  }
  private static generateAccessToken(): string {
    return crypto.randomBytes(ACCESS_TOKEN_LENGTH).toString("hex");
  }
  private static allCellFilled(game: Game) {
    for (const row of game.field) {
      for (const cell of row) {
        if (cell === Cell.Empty) {
          return false;
        }
      }
    }
    return true;
  }
}

export {
  GameManager,
  PlayerRole,
  MyPosition,
  ERROR_GAME_MESSAGES,
  Cell,
};
