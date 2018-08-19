/**
 * Created by Илья on 11.08.2018.
 */
import {Game} from "../db/Entity/Game";
import {User} from "../db/Entity/User";
import {postgreSqlManager} from "../db";
import {logger} from "../Logger";
import {DataForCreation, Helpers} from "../Helpers";
import * as crypto from "crypto";
import * as moment from "moment";
import * as Parallel from "async-parallel";
import * as now from "performance-now";
import Dictionary from "typescript-collections/dist/lib/Dictionary";

enum PlayerRole {
  Creator = 1,
  Participant,
  Observer,
}

enum Cell {
  Empty = "?",
  Cross = "X",
  Zero = "0",
}

class Position {
  public x: number;
  public y: number;
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}

const GAME_MESSAGES: {[id: string]: string} = {
  yourMove: "Your move",
};

const ACCESS_TOKEN_LENGTH: number = 10;// TODO: подкоректируй значения
const MAX_INACTIVE_TIME: number = moment.duration(5, "minute");

const ERROR_GAME_MESSAGES: {[id: string]: string} = {
  unknownSymbol: "Unknown symbol",
  tokenNotCorrespond: "Access token not correspond.",
  moveAnotherPlayer: "Now move another player.",
  gameEnd: "Game end.",
  thisCellFilled: "Player move to filled cell.",
};

class GameManeger {
  public static get NO_WINNER(): number {
    return -1;
  }
  public static async getGame(
    creatorName: string,
    participantName: string,
    fieldSize: number,
  ): Game {
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
    } catch (error: Error) {
      logger.error(error);
      throw new Error(error);
    }
  }
  public static async getRoleToGame(
    playerId: number,
    gameId: number,
  ): PlayerRole {
    let searchGameData: DataForCreation = new Dictionary<string, any>();
    searchGameData.setValue("id", gameId);
    let searchPlayerData: DataForCreation = new Dictionary<string, any>();
    searchPlayerData.setValue("id", playerId);

    const player: User = await postgreSqlManager.users.find(searchPlayerData);
    const games: Game[] = await postgreSqlManager.games.find(searchGameData);
    const game: Game = games[0];
    if (player.accessToken && (player.accessToken === game.accessToken)) {
      if (player.id === game.creatorGameId) {
        return PlayerRole.Creator;
      } else if (player.id === game.participantId) {
        return PlayerRole.Participant;
      }
    }
    return PlayerRole.Observer;
  }

  public static async canStandParticipant(playerId: number, gameId: number) {
    let searchGameData: DataForCreation = new Dictionary<string, any>();
    searchGameData.setValue("id", gameId);
    let searchPlayerData: DataForCreation = new Dictionary<string, any>();
    searchPlayerData.setValue("id", playerId);

    const player: User = await postgreSqlManager.users.find(searchPlayerData);
    const role: PlayerRole = await GameManeger.getRoleToGame(playerId, gameId);
    const games: Game[] = await postgreSqlManager.games.find(searchGameData);
    const game: Game = games[0];
    if (role === PlayerRole.Observer) {
      if (!player.accessToken && !game.participantId) {
        return true;
      }
    }
    return false;
  }

  public static async connectPlayer(playerId: number, gameId: number) {
    const willParticipant: boolean = await GameManeger.canStandParticipant(playerId, gameId);
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
    return willParticipant;
  }
  public static async unconnectPlayer(playerId: number) {
    let userData: DataForCreation = new Dictionary<string, any>();
    userData.setValue("access_token", null);

    await postgreSqlManager.users.update(playerId, userData);
  }

  public static async getGameTime(gameId: number) {
    let gameSearchData: DataForCreation = new Dictionary<string, any>();
    gameSearchData.setValue("id", gameId);

    const foundGames: Game[] = await postgreSqlManager.games.find(gameSearchData);
    const game: Game = foundGames[0];
    return game.time;
  }
  private static getLeadingPlayerSign(game: Game): string {
    if (game.leadingPlayerId === game.creatorGameId) {
      return Cell.Cross;
    } else if (game.leadingPlayerId === game.participantId) {
      return Cell.Zero;
    }
    logger.error(ERROR_GAME_MESSAGES.unknownSymbol);
    throw new Error(ERROR_GAME_MESSAGES.unknownSymbol);
  }
  public static async takePlayerMove(
    playerId: number,
    position: Position,
    gameId: number,
  ): boolean {
    let gameSearchData: DataForCreation = new Dictionary<string, any>();
    gameSearchData.setValue("id", gameId);
    let userSearchData: DataForCreation = new Dictionary<string, any>();
    userSearchData.setValue("id", playerId);

    const player: User = await postgreSqlManager.users.find(userSearchData);
    let foundGames: Game[] = await postgreSqlManager.games.find(gameSearchData);
    let game: Game = foundGames[0];


    const correspondToken: boolean = (player.accessToken === game.accessToken);
    const thisPlayerMove: boolean = (player.id === game.leadingPlayerId);
    const existWinner: boolean = (game.winPlayerId !== null);
    if (correspondToken && thisPlayerMove && !existWinner) {
      const selectCell: string = game.field[position.y][position.x];
      if (selectCell === Cell.Empty) {
        const playerSign: string = GameManeger.getLeadingPlayerSign(game);

        let newGameData: DataForCreation = new Dictionary<string, any>();
        game.field[position.y] = Helpers.replaceAt(game.field[position.y], position.x, playerSign);
        newGameData.setValue("field", game.field);
        newGameData.setValue("last_move_time", game.time);

        const winnerId: number = GameManeger.findWinner(game, position);
        if (winnerId !== GameManeger.NO_WINNER) {
          newGameData.setValue("win_player_id", winnerId);
        } else {
          GameManeger.swapMoveLaw(game);
          newGameData.setValue("leading_player_id", game.leadingPlayerId);
          await GameManeger.sendMessage(game.leadingPlayerId, GAME_MESSAGES.yourMove);
        }
        await postgreSqlManager.games.update(game.id, newGameData);
      } else {
        logger.error(
          ERROR_GAME_MESSAGES.thisCellFilled
          + "Game with id=" + game.id
          + ",player with id=" + player.id,
        );
        throw new Error(ERROR_GAME_MESSAGES.thisCellFilled);
      }
      return true;
    }

    let errorMessage: string = "";
    if (!correspondToken) {
      errorMessage += ERROR_GAME_MESSAGES.tokenNotCorrespond;
    } else {
      if (!thisPlayerMove) {
        errorMessage += ERROR_GAME_MESSAGES.moveAnotherPlayer;
      }
      if (existWinner) {
        errorMessage += ERROR_GAME_MESSAGES.gameEnd;
      }
    }

    logger.error(errorMessage);
    throw new Error(errorMessage);
  }

  public static findWinner(
    game: Game,
    position: Position,
  ): number {
    const playerSign: string = GameManeger.getLeadingPlayerSign(game);
    const firstDiagonalFunc: () => number = (x: number, pos: Position) => {
      return (x - pos.x) + pos.y;
    };
    const secondDiagonalFunc: () => number = (x: number, pos: Position) => {
      return pos.y - (x - pos.x);
    };
    if (GameManeger.filledHorizontal(game.field, playerSign, position)
      || GameManeger.filledVertical(game.field, playerSign, position)
      || GameManeger.filledDiagonal(game.field, playerSign, position, firstDiagonalFunc)
      || GameManeger.filledDiagonal(game.field, playerSign, position, secondDiagonalFunc)
    ) {
      return game.leadingPlayerId;
    }
    return GameManeger.NO_WINNER;
  }
  private static filledHorizontal(
    field: string[],
    playerSign: string,
    position: Position,
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
    position: Position,
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
    position: Position,
    diagonalFunction: () => number,
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
  public static async createGameAndConnectCreator(creatorId: number, fieldSize: number): number {
    const accessToken: string = GameManeger.generateAccessToken();
    let successCreation: boolean = false;
    while (!successCreation) {
      try {
        let newGameData: DataForCreation = new Dictionary<string, any>();
        newGameData.setValue("access_token", accessToken);
        newGameData.setValue("leading_player_id", creatorId);
        newGameData.setValue("field", GameManeger.generateField(fieldSize));

        await postgreSqlManager.games.create(newGameData);
        successCreation = true;
      } catch (error: Error) {
        logger.info(error);// TODO: подумай что здесь должно выводиться
      }
    }
    let searchGameData: DataForCreation = new Dictionary<string, any>();
    searchGameData.setValue("access_token", accessToken);

    const createdGames: Game[] = await postgreSqlManager.games.find(searchGameData);
    let createdGame: Game = createdGames[0];

    await GameManeger.connectPlayer(creatorId, createdGame.id);
    return createdGame.id;
  }
  public static async waitParticipant(gameId: number): boolean {
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

      await Parallel.sleep(500);
    }

    return participantConnect;
  }

  public static async runGame(createdGameId: number) {
    const startTime: any = now();

    let game: Game = null;
    let gameEnd: boolean = false;
    while (!gameEnd) {
      let searchGameData: DataForCreation = new Dictionary<string, any>();
      searchGameData.setValue("id", createdGameId);

      let foundGames: Game[] = await postgreSqlManager.games.find(searchGameData);
      game = foundGames[0];

      if (game.winPlayerId) {
        GameManager.sendGameReport(game.creatorGameId, game.id);
        GameManager.sendGameReport(game.participantId, game.id);
      } else {
        game.time = now() - startTime;

        let newGameData: DataForCreation = new Dictionary<string, any>();
        newGameData.setValue("time", game.time);
        await postgreSqlManager.games.update(game.id, newGameData);

        if ((game.time - game.lastMoveTime) < MAX_INACTIVE_TIME) {
          Parallel.sleep(500);
          continue;
        } else {
          gameEnd = true;
        }
      }
    }

    await GameManeger.unconnectPlayer(game.creatorGameId);
    await GameManeger.unconnectPlayer(game.participantId);
    if (game.winPlayerId) {
      await postgreSqlManager.games.deleteGame({id: createdGameId});
    }
  }

  public static async sendGameReport(playerId: number, gameId: number) {
    logger.info(
      "Send game report with gameId=" + gameId
      + " for player with id=" + playerId + ".",
    );
  }

  private static generateAccessToken(): string {
    return crypto.randomBytes(ACCESS_TOKEN_LENGTH).toString("hex");
  }
}

export {
  GameManeger,
  PlayerRole,
  Position,
  ERROR_GAME_MESSAGES,
};
