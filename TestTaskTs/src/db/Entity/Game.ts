/**
 * Created by Илья on 07.08.2018.
 */
export class Game {
    public id: number;
    public creatorGameId: number;
    public participantId: number;
    public fieldSize: number;
    public field: string[];
    public accessToken: string;
    public time: number;
    public leadingPlayerId: number;
    public winPlayerId: number;
    constructor(data: any) {
        this.id = data.id;
        this.creatorGameId = data.creator_game_id;
        this.participantId = data.participant_id;
        this.fieldSize = data.field_size;
        this.field = data.field;
        this.accessToken = data.access_token;
        this.time = data.time;
        this.leadingPlayerId = data.leading_player_id;
        this.winPlayerId = data.win_player_id;
    }
}
