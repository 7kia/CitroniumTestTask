/**
 * Created by Илья on 06.10.2018.
 */
export interface IGame {
  id: number;
  creatorGameId: number;
  participantId: number;
  fieldSize: number;
  field: string[];
  time: number;
  leadingPlayerId: number;
  winPlayerId: number;
  gameState: number;
}