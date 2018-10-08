import * as React from "react";
import {USER_ID} from "../../consts/auth";
import {Button} from "react-bootstrap";
import GameField from "../components/GameField";
import {IGame} from "../interface/game";
import {getGame, surrender, takePlayerMove} from "../actions/game";
import {bindActionCreators, Dispatch as IDispatch} from "redux";
import {RouteComponentProps as IRouteComponentProps} from "react-router-dom";
import {IStore} from "../../reducer";
import {connect} from "react-redux";

interface IActionProps {
  surrender: typeof surrender;
  getGame: typeof getGame;
  takePlayerMove: typeof takePlayerMove;
}

interface IGamePageViewState {
  gameId: number;
  game: IGame;
  errorMessage: string | null;
}

interface IGamePageViewProps extends IActionProps, IRouteComponentProps<any> {
  dispatch: IDispatch<IStore>;
}

class CGamePageView extends React.Component<IGamePageViewProps, IGamePageViewState> {
  private timerId: number;

  constructor(props: IGamePageViewProps) {
    super(props);

    let data = Object.create(this.props.match.params);
    const emptyGame: IGame = {
      id: -1,
      creatorGameId: -1,
      participantId: -1,
      creatorName: "",
      participantName: "",
      size: -1,
      field: [],
      time: -1,
      leadingPlayerId: -1,
      winPlayerId: -1,
      gameState: -1,
    };
    this.state = {
      gameId: data.id,
      game: emptyGame,
      errorMessage: null,
    };
    this.tick();
  }

  public componentDidMount() {
    this.timerId = setInterval(
      () => this.tick(),
      1000,
    );
  }

  public componentWillUnmount() {
    clearInterval(this.timerId);
  }

  private tick() {
    this.props.getGame(this.state.gameId, this.updateGame, this.sendMessage);
  }

  private updateGame: (game: IGame) => void = (game: IGame) => {
    this.setState({game: game, errorMessage: null});
  };

  private sendMessage: (message: string) => void = (message: string) => {
    this.setState({game: this.state.game, errorMessage: message});
  };

  private redirectToSearchGamePage: () => void = () => {
    this.props.history.push("/search-game");
  };

  private renderBackButton(): JSX.Element {
    return (
      <Button
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
    this.props.surrender(userId, this.state.game.id);
  }

  private renderSurrenderButton(): JSX.Element {
    return (
      <Button
        bsStyle="primary"
        bsSize="lg"
        onClick={this.surrender}
      >
        Back
      </Button>
    );
  }

  private static getPlayerState(playerId: number, game: IGame): string {
    if (playerId) {
      if (playerId === game.winPlayerId) {
        return "Winner";
      } else if (playerId === game.leadingPlayerId) {
        return "Move";
      }
    }
    return "";
  }

  private static getTimeToSeconds(milliseconds: number): number {
    return milliseconds / 1000;
  }

  private static getTimeToMinutes(milliseconds: number): number {
    return CGamePageView.getTimeToSeconds(milliseconds) / 60;
  }

  public render(): JSX.Element {
    const userId: number = parseInt(localStorage.getItem(USER_ID) as string, 10);
    const game: IGame = this.state.game;
    const errorMessage: string | null = this.state.errorMessage;
    return (
      <div className="game-page m-a">
        <div className="error-message-container">
          {errorMessage ? errorMessage : ""}
        </div>

        <div className="name-container">
          <div className="creator-name-container">
            <div className="creator-name">
              X {game.creatorName}
            </div>
            <div className="creator-state">
              {CGamePageView.getPlayerState(game.creatorGameId, game)}
            </div>
          </div>
          <div className="participant-name-container float-right">
            <div className="participant-name">
              {game.participantName} 0
            </div>
            <div className="participant-state">
              {CGamePageView.getPlayerState(game.participantId, game)}
            </div>
          </div>
        </div>

        <GameField
          game={game}
          userId={userId}
          takePlayerMove={this.props.takePlayerMove}
          sendMessage={this.sendMessage}
          updateGame={this.updateGame}
        />

        <div className="timer-container tac">
          <div className="timer">
             {CGamePageView.getTimeToMinutes(game.time)} : {CGamePageView.getTimeToSeconds(game.time)}
          </div>
        </div>

        <div className="buttons tac">
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
    getGame,
    takePlayerMove,
  }, dispatch);
}
const GamePageView = connect(undefined, mapActionsToProps)(CGamePageView);

export default GamePageView;