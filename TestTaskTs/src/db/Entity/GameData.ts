/**
 * Created by Илья on 07.08.2018.
 */
class GameData {
    public id: number;
    public creatorGameId: number;
    public participantId: number;
    public fieldSize: number;
    public field: string[];
    public accessToken: string;
    public time: number;
    public leadingPlayerId: number;
    public winPlayerId: number;
    public constructor(data: any) {
        this.id = data.id;
        this.creatorGameId = data.creatorGameId;
        this.participantId = data.participantId;
        this.fieldSize = data.fieldSize;
        this.field = data.field;
        this.accessToken = data.accessToken;
        this.time = data.time;
        this.leadingPlayerId = data.leadingPlayerId;
        this.winPlayerId = data.winPlayerId;
    }
}

export = GameData;
