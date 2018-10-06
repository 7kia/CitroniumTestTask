import * as React from "react";
import {USER_ID} from "../../consts/auth";
import {Button} from "react-bootstrap";
import GameField from "../components/GameField";
import {IGame} from "../interface/game";
import {surrender} from "../actions/game";
import {bindActionCreators, Dispatch as IDispatch} from "redux";
import {RouteComponentProps as IRouteComponentProps} from "react-router-dom";
import {IStore} from "../../reducer";
import {connect} from "react-redux";

interface IActionProps {
  surrender: typeof surrender;
}

interface IOwnProps {
  game: IGame;
}

interface IGamePageViewProps extends IActionProps, IOwnProps, IRouteComponentProps<any> {
  dispatch: IDispatch<IStore>;
}

class CGamePageView extends React.Component<IGamePageViewProps, {}> {
  constructor(props: IGamePageViewProps) {
    super(props);
  }

  private redirectToSearchGamePage() {
    this.props.history.push("/search-game");
  }

  private renderBackButton(): JSX.Element {
    return (
      <Button
        className="float-right"
        bsStyle="primary"
        bsSize="lg"
        onClick={this.redirectToSearchGamePage}
      >
        Back
      </Button>
    );
  }

  private surrender() {
    const userId: number = parseInt(localStorage.getItem(USER_ID) as string, 10);
    this.props.surrender(userId, this.props.game.id);
  }

  private renderSurrenderButton(): JSX.Element {
    return (
      <Button
        className="float-right"
        bsStyle="primary"
        bsSize="lg"
        onClick={this.surrender}
      >
        Back
      </Button>
    );
  }

  public render(): JSX.Element {
    const userId: number = parseInt(localStorage.getItem(USER_ID) as string, 10);
    const game: IGame = this.props.game;
    return (
      <div className="game-page">
        <GameField game={this.props.game}/>
        <div className="buttons">
          {
            ((userId === game.creatorGameId) || (userId === game.participantId))
              ? this.renderSurrenderButton()
              : this.renderBackButton()
          }
        </div>
      </div>
    );
  }
}

function mapActionsToProps(dispatch: IDispatch<IStore>): IActionProps {
  return bindActionCreators({
    surrender,
  }, dispatch);
}
const GamePageView = connect(undefined, mapActionsToProps)(CGamePageView);

export default GamePageView;