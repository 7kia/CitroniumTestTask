/**
 * Created by Илья on 06.10.2018.
 */
export interface IGameReport {
  id: number;
  creatorName: string;
  participantName: string;
  creatorId: number;
  participantId: number;
  size: number;
  time: number;
  winPlayerId: number;
  gameState: number;
}