import * as React from "react";
import {IGameReport} from "../interfaces/gameReport";

interface IGameReportProps {
  gameReport: IGameReport;
}

class GameReport extends React.Component<IGameReportProps, {}> {
  constructor(props: IGameReportProps) {
    super(props);
  }

  private static playerIsMove(userId: number, leadingPlayerId: number): boolean {
    return (userId === leadingPlayerId);
  }

  private static renderNameMovePlayer(name: string): JSX.Element {
    return (
      <b>{name}</b>
    );
  }
  private static renderNamePlayer(name: string): JSX.Element {
    return (
      <b><u>{name}</u></b>
    );
  }
  public render(): JSX.Element {
    const gameReport: IGameReport = this.props.gameReport;
    return (
      <div className="game-report">
        <div className="creator-name">
          {
            GameReport.playerIsMove(gameReport.creatorId, gameReport.leadingPlayerId)
            ? GameReport.renderNameMovePlayer(gameReport.creatorName)
            : GameReport.renderNamePlayer(gameReport.creatorName)
          }
        </div>
        <div className="participant-name">
          {
            GameReport.playerIsMove(gameReport.participantId, gameReport.leadingPlayerId)
            ? GameReport.renderNameMovePlayer(gameReport.participantName)
            : GameReport.renderNamePlayer(gameReport.participantName)
          }
        </div>
        <div className="game-time">
          {gameReport.time / 1000}
        </div>
      </div>
    );
  }
}

export default GameReport;
