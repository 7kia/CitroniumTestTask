/**
 * Created by Илья on 20.09.2018.
 */
export type MyDictionary = {[id: string]: any};
export type DataList = MyDictionary[];
export type Json = MyDictionary | DataList;

export interface IGameReport {
  gameId: number;
  creatorId: number;
  participantId: number;
  size: number;
  gameTime: number;
  gameState: number;
}