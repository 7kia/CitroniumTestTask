/**
 * Created by Илья on 06.10.2018.
 */
export interface IGame {
  id: number;
  creatorName: string;
  participantName: string;
  creatorGameId: number;
  participantId: number;
  size: number;
  time: number;
  leadingPlayerId: number;
  winPlayerId: number;
  gameState: number;
  field: string[];
}