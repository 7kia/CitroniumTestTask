import * as React from "react";
import {Button} from "react-bootstrap";
import {USER_ID} from "../../consts/auth";
import GameReport from "../../common/components/GameReport";
import {IGameReport} from "../../common/interfaces/gameReport";

interface IGameItemProps {
    game: IGameReport;
    redirectToGame: (gameId: number) => void;
}

class GameItem extends React.Component<IGameItemProps, {}> {
  constructor(props: IGameItemProps) {
      super(props);
  }

  private redirectToGame: () => void = () => {
      this.props.redirectToGame(this.props.game.id);
  };

  private renderPlayButton(): JSX.Element {
    return (
      <Button
        bsStyle="success"
        bsSize="lg"
        onClick={this.redirectToGame}
      >
        Play
      </Button>
    );
  }

  private renderObserveButton(): JSX.Element {
    return (
      <Button
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
    const canParticipant: boolean = (
      (userId === creatorId)
      || (userId === participantId)
      || (participantId === null)
    );
    return (
      <div className="game-item">
        <GameReport gameReport={this.props.game}/>
        <div className="buttons">
          {canParticipant ? this.renderPlayButton() : this.renderObserveButton()}
        </div>
      </div>
    );
  }
}

export default GameItem;
