import * as React from "react";
import {Button} from "react-bootstrap";
import {USER_ID} from "../../consts/auth";
import GameReport from "../../common/components/GameReport";
import {IGameReport} from "../../common/interfaces/gameReport";
import {connectUserToGame} from "../actions/games";

interface IGameItemProps {
    game: IGameReport;
    redirectToGame: (gameId: number) => void;
    connectUserToGame: typeof connectUserToGame;
}

class GameItem extends React.Component<IGameItemProps, {}> {
  constructor(props: IGameItemProps) {
      super(props);
  }

  private play: () => void = () => {
    const userId: number = parseInt(localStorage.getItem(USER_ID) as string, 10);
    const game: IGameReport = this.props.game;
    if ((game.participantId === null) && (game.creatorId !== userId)) {
      this.props.connectUserToGame(this.props.game.id, userId);
    }
    this.redirectToGame();
  };

  private redirectToGame: () => void = () => {
    this.props.redirectToGame(this.props.game.id);
  };

  private renderPlayButton(): JSX.Element {
    return (
      <Button
        className="mt-md"
        bsStyle="success"
        bsSize="lg"
        onClick={this.play}
      >
        Play
      </Button>
    );
  }

  private renderObserveButton(): JSX.Element {
    return (
      <Button
        className="mt-md"
        bsStyle="primary"
        bsSize="lg"
        onClick={this.redirectToGame}
      >
        Observe
      </Button>
    );
  }

  public render(): JSX.Element {
    const userId: number = parseInt(localStorage.getItem(USER_ID) as string, 10);
    const creatorId: number = this.props.game.creatorId;
    const participantId: number = this.props.game.participantId;
    const userPlayToGame: boolean = (userId === creatorId) || (userId === participantId);
    const gameHaveParticipant: boolean = (participantId !== null);
    const canParticipant: boolean = (
      (userPlayToGame)
      || (!userPlayToGame && !gameHaveParticipant)
    );
    return (
      <div className="game-item">
        <GameReport gameReport={this.props.game}/>
        <div className="buttons tac">
          {canParticipant ? this.renderPlayButton() : this.renderObserveButton()}
        </div>
      </div>
    );
  }
}

export default GameItem;
