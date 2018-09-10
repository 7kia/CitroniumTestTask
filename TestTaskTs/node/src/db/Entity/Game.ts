/**
 * Created by Илья on 07.08.2018.
 */
import {GameReport} from "./GameReport";
import {DataForCreation} from "../../Helpers";

class Game {
  public id: number;
  public creatorGameId: number;
  public participantId: number;
  public fieldSize: number;
  public field: string[];
  public accessToken: string;
  public time: number;
  public lastMoveTime: number;
  public leadingPlayerId: number;
  public winPlayerId: number;
  constructor(data: DataForCreation) {
    this.id = data.getValue("id");
    this.creatorGameId = data.getValue("creator_game_id");
    this.participantId = data.getValue("participant_id");
    this.fieldSize = data.getValue("field_size");
    this.field = data.getValue("field");
    this.accessToken = data.getValue("access_token");
    this.time = data.getValue("time");
    this.lastMoveTime = data.getValue("last_move_time");
    this.leadingPlayerId = data.getValue("leading_player_id");
    this.winPlayerId = data.getValue("win_player_id");
  }

  public getReport(): GameReport {
    return new GameReport(this);
  }
}

export {
  Game,
  GameReport
};

