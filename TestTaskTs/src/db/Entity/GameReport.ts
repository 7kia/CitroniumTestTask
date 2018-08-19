/**
 * Created by Илья on 16.08.2018.
 */
import {Game} from "./Game";

export class GameReport {
  public id: number;
  public creatorGameId: number;
  public participantId: number;
  public fieldSize: number;
  public time: number;
  public leadingPlayerId: number;
  public winPlayerId: number;
  constructor(game: Game) {
    this.id = game.id;
    this.creatorGameId = game.creatorGameId;
    this.participantId = game.participantId;
    this.fieldSize = game.fieldSize;
    this.time = game.time;
    this.leadingPlayerId = game.leadingPlayerId;
    this.winPlayerId = game.winPlayerId;
  }
}
