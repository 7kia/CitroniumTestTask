/**
 * Created by Илья on 11.08.2018.
 */
import {Game} from "../db/Entity/Game";
import {User} from "../db/Entity/User";
import {postgreSqlManager} from "../db";
import {logger} from "../Logger";

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

const errorMessages: {[id: string]: string} = {
  unknownSymbol: "Unknown symbol",
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
      let searchData: {[id: string]: any} = {};

      if (creatorName) {
        const user: User = await postgreSqlManager.users.find({name: creatorName});
        searchData.creator_game_id = user.id;
      }
      if (participantName) {
        const user: User = await postgreSqlManager.users.find({name: participantName});
        searchData.participant_id = user.id;
      }
      if (fieldSize) {
        searchData.field_size = fieldSize;
      }
      return await postgreSqlManager.games.find(searchData);
    } catch (error: Error) {
      logger.error(error);
      throw Error(error);
    }
  }
  public static async getRoleToGame(
    playerId: number,
    gameId: number,
  ): PlayerRole {
    const player: User = await postgreSqlManager.users.find({id: playerId});
    const games: Game[] = await postgreSqlManager.games.find({id: gameId});
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
    const player: User = await postgreSqlManager.users.find({id: playerId});
    const role: PlayerRole = await GameManeger.getRoleToGame(playerId, gameId);
    const games: Game[] = await postgreSqlManager.games.find({id: gameId});
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
    const foundGames: Game[] = await postgreSqlManager.games.find({id: gameId});
    let game: Game = foundGames[0];
    let user: User = await postgreSqlManager.users.find({id: playerId});
    if (willParticipant) {
      if (game.creatorGameId !== null) {
        game.participantId = playerId;
      } else {
        game.creatorGameId = playerId;
      }
      user.accessToken = game.accessToken;

      postgreSqlManager.games.update(game);
      postgreSqlManager.users.update(user);
    }
    return willParticipant;
  }
  public static async unconnectPlayer(playerId: number) {
    let user: User = await postgreSqlManager.users.find({id: playerId});
    user.accessToken = null;
    await postgreSqlManager.users.update(user);
  }

  public static async getGameTime(gameId: number) {
    const foundGames: Game[] = await postgreSqlManager.games.find({id: gameId});
    const game: Game = foundGames[0];
    return game.time;
  }
  private static getLeadingPlayerSign(game: Game): string {
    if (game.leadingPlayerId === game.creatorGameId) {
      return Cell.Cross;
    } else if (game.leadingPlayerId === game.participantId) {
      return Cell.Zero;
    }
    logger.error(errorMessages.unknownSymbol);
    throw Error(errorMessages.unknownSymbol);
  }
  public static async takePlayerMove(
    playerId: number,
    position: Position,
    gameId: number,
  ): boolean {
    const player: User = await postgreSqlManager.users.find({id: playerId});
    const foundGames: Game[] = await postgreSqlManager.games.find({id: gameId});
    let game: Game = foundGames[0];


    const correspondToken: boolean = (player.accessToken === game.accessToken);
    const thisPlayerMove: boolean = (player.id === game.leadingPlayerId);
    const existWinner: boolean = (game.winPlayerId !== null);
    if (correspondToken && thisPlayerMove && !existWinner) {
      const selectCell: string = game.field[position.y][position.x];
      if (selectCell === Cell.Empty) {
        const playerSign: string = GameManeger.getLeadingPlayerSign(game);
        game.field[position.y][position.x] = playerSign;
        game.lastMoveTime = game.time;
        const winnerId: number = GameManeger.findWinner(game, position);

        postgreSqlManager.games.update(game);
      }
      return true;
    }

    let errorMessage: string = "";
    if (!correspondToken) {
      errorMessage += "Access token not correspond.";
    }
    if (!thisPlayerMove) {
      errorMessage += "Now move another player.";
    }
    if (existWinner) {
      errorMessage += "Game end.";
    }
    logger.error(errorMessage);
    throw Error(errorMessage);
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
}

export {
  GameManeger,
  PlayerRole,
  Position,
};
