/**
 * Created by Илья on 14.09.2018.
 */
import {DataForCreation, Helpers} from "../../Helpers";
import Dictionary from "typescript-collections/dist/lib/Dictionary";
import {postgreSqlManager} from "../../db/index";
import {User} from "../../db/Entity/User";
import {GameManager} from "../../GameManager";
import {Game, GameState} from "../../db/Entity/Game";
import {MyPosition} from "../../MyPosition";

const Cell: {[id: string]: string} = {
  Empty: "?",
  Cross: "X",
  Zero: "0",
};

enum PlayerRole {
  Creator = 1,
  Participant,
  Observer,
}

class GameRules {
  public static allCellFilled(game: Game) {
    for (const row of game.field) {
      for (const cell of row) {
        if (cell === Cell.Empty.toString()) {
          return false;
        }
      }
    }
    return true;
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

  public static findWinner(game: Game, position: MyPosition): number {
    const playerSign: string = GameManager.getLeadingPlayerSign(game);
    const firstDiagonalFunc: (x: number, pos: MyPosition) => number
      = (x: number, pos: MyPosition) => {
      return (x - pos.x) + pos.y;
    };
    const secondDiagonalFunc: (x: number, pos: MyPosition) => number
      = (x: number, pos: MyPosition) => {
      return pos.y - (x - pos.x);
    };
    if (GameRules.filledHorizontal(game.field, playerSign, position)
      || GameRules.filledVertical(game.field, playerSign, position)
      || GameRules.filledDiagonal(game.field, playerSign, position, firstDiagonalFunc)
      || GameRules.filledDiagonal(game.field, playerSign, position, secondDiagonalFunc)
    ) {
      return game.leadingPlayerId;
    }
    return GameManager.NO_WINNER;
  }

  public static filledHorizontal(
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
  public static filledVertical(
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
  public static filledDiagonal(
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

  public static async canCreateGame(userId: number, size: number): Promise<boolean> {
    return new Promise<boolean>(async (resolve, reject) => {
      try {
        let foundUser: User = await GameManager.findUser(userId);
        if (GameRules.userPlay(foundUser)) {
          reject(new Error("The user play in other game"));
        }
        resolve(GameRules.validateSize(size));
      } catch (error) {
        reject(error);
      }
      resolve(false);
    });
  }

  public static async checkSearchGameParameters(
    creatorName: string,
    participantName: string,
    size: number,
  ): Promise<boolean> {
    return new Promise<boolean>(async (resolve, reject) => {
      if (creatorName || participantName || size) {
        resolve(true);
      }
      reject(new Error("Parameters not set"));
    });
  }

  public static async canConnectToGame(userId: number, gameId: number): Promise<boolean> {
    return new Promise<boolean>(async (resolve, reject) => {
      try {
        const canStandParticipant: boolean =  await GameRules.canStandParticipant(userId, gameId);
        if (!canStandParticipant) {
          reject(new Error("Player not can connect"));
        }
        resolve(canStandParticipant);
      } catch (error) {
        reject(error);
      }
    });
  }

  private static validateSize(size: number): boolean {
    if (size > 2) {
      return true;
    }
    throw new Error("Size must be more 2");
  }

  private static userPlay(user: User) {
    return user.accessToken !== null;
  }

  public static async canStandLoser(userId: number, gameId: number): Promise<boolean> {
    return new Promise<boolean>(async (resolve, reject) => {
      try {
        const user: User = await GameManager.findUser(userId);
        const game: Game = await GameManager.findGameById(gameId);
        if (!game.participantId) {
          reject(new Error("Game with id =" + gameId + " not have participant"));
        }
        if (!game.creatorGameId) {
          reject(new Error("Game with id =" + gameId + " not have creator"));
        }
        if ((game.creatorGameId !== user.id) && (game.participantId !== user.id)) {
          reject(new Error("User not participant in the game"));
        }
        resolve(game.gameState === GameState.NoWinner);
      } catch (error) {
        reject(error);
      }
    });
  }

  public static async existGame(gameId: number): Promise<boolean> {
    return new Promise<boolean>(async (resolve, reject) => {
      try {
        const game: Game = await GameManager.findGameById(gameId);
        if (!game) {
          reject(new Error("Game with id =" + gameId + " not exist"));
        }
        resolve(true);
      } catch (error) {
        reject(error);
      }
      resolve(false);
    });
  }

  public static async canTakeMove(userId: number, gameId: number): Promise<boolean> {
    return new Promise<boolean>(async (resolve, reject) => {
      try {
        const user: User = await GameManager.findUser(userId);
        const game: Game = await GameManager.findGameById(gameId);

        if ((game.creatorGameId !== user.id) && (game.participantId !== user.id)) {
          reject(new Error("The player not participate in the game"));
        }
        if (game.leadingPlayerId === user.id) {
          resolve(true);
        } else {
          reject(new Error("Now take move another player"));
        }
      } catch (error) {
        reject(error);
      }
      resolve(false);
    });
  }

  public static async positionNotOutFiled(
    column: number,
    row: number,
    gameId: number,
  ): Promise<boolean> {
    return new Promise<boolean>(async (resolve, reject) => {
      try {
        const game: Game = await GameManager.findGameById(gameId);

        if (!Helpers.between(column, 0, game.fieldSize - 1)
          || !Helpers.between(row, 0, game.fieldSize - 1)) {
          reject(new Error("Position out of range"));
        }
      } catch (error) {
        reject(error);
      }
      resolve(false);
    });
  }
}

export {
  GameRules,
  PlayerRole,
  Cell,
};