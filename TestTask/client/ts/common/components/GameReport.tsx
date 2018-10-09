import * as React from "react";
import {IGameReport} from "../interfaces/gameReport";
import MyTimer from "./Timer";

interface IGameReportProps {
  gameReport: IGameReport;
}

class GameReport extends React.Component<IGameReportProps, {}> {
  constructor(props: IGameReportProps) {
    super(props);
  }

  private static playerIsWinner(userId: number, winPlayerId: number): boolean {
    return (userId === winPlayerId);
  }

  private static renderWinnerPlayerName(name: string): JSX.Element {
    return (
      <b><u>{name}</u></b>
    );
  }
  private static renderNamePlayer(name: string): JSX.Element {
    return (
      <b>{name}</b>
    );
  }
  public render(): JSX.Element {
    const gameReport: IGameReport = this.props.gameReport;
    return (
      <div className="game-report">
        <div className="creator-name">
          {
            GameReport.playerIsWinner(gameReport.creatorId, gameReport.winPlayerId)
            ? GameReport.renderWinnerPlayerName(gameReport.creatorName)
            : GameReport.renderNamePlayer(gameReport.creatorName)
          }
        </div>
        <div className="participant-name">
          {
            GameReport.playerIsWinner(gameReport.participantId, gameReport.winPlayerId)
            ? GameReport.renderWinnerPlayerName(gameReport.participantName)
            : GameReport.renderNamePlayer(gameReport.participantName)
          }
        </div>
        <div>
          <div className="game-time tac">
            <MyTimer milliseconds={gameReport.time}/>
          </div>
        </div>
      </div>
    );
  }
}

export default GameReport;
