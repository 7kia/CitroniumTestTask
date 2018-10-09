import * as React from "react";
import {USER_ID} from "../../consts/auth";
import {Button} from "react-bootstrap";
import GameField from "../components/GameField";
import {IGame, IOldGameData} from "../interface/game";
import {getGame, surrender, takePlayerMove} from "../actions/game";
import {bindActionCreators, Dispatch as IDispatch} from "redux";
import {RouteComponentProps as IRouteComponentProps} from "react-router-dom";
import {IStore} from "../../reducer";
import {connect} from "react-redux";
import MyTimer from "../../common/components/Timer";

interface IActionProps {
  surrender: typeof surrender;
  getGame: typeof getGame;
  takePlayerMove: typeof takePlayerMove;
}

interface IGamePageViewState {
  gameId: number;
  game: IGame;
  oldGameData: IOldGameData;
  time: number;
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
    const emptyOldGameData: IOldGameData = {
      creatorGameId: -1,
      participantId: null,
      leadingPlayerId: null,
      winPlayerId: null,
      gameState: 0,
    };
    this.state = {
      gameId: data.id,
      game: emptyGame,
      time: 0,
      oldGameData: emptyOldGameData,
      errorMessage: null,
    };

    this.getGame();
    this.setOldGameData();
  }

  private setOldGameData() {
    const game: IGame = this.state.game;
    const oldGameData: IOldGameData = {
      creatorGameId: game.creatorGameId,
      participantId: game.participantId,
      leadingPlayerId: game.leadingPlayerId,
      winPlayerId: game.winPlayerId,
      gameState: game.gameState,
    };
    this.setState({oldGameData: oldGameData});
  }

  public componentDidMount() {
    this.timerId = setInterval(
      () => this.getGame(),
      1000,
    );
  }

  public componentWillUnmount() {
    clearInterval(this.timerId);
  }

  private getGame() {
    this.props.getGame(this.state.gameId, this.updateGame, this.sendMessage);
    if (this.state.game.gameState === 0) {
      clearInterval(this.timerId);
    }
  }

  private updateGame: (game: IGame) => void = (game: IGame) => {
    this.setState({game: game, errorMessage: null, time: game.time});
    if (this.gameUpdated()) {
      this.setOldGameData();
      // TODO: notifications
    }
    this.updateTimer(game.time);
  };

  private updateTimer: (time: number) => void = (time: number) => {
    this.setState({time: time});
  };

  private gameUpdated(): boolean {
    const game: IGame = this.state.game;
    const oldGameData: IOldGameData = this.state.oldGameData;
    return (
      (oldGameData.participantId !== game.participantId)
      || (oldGameData.leadingPlayerId !== game.leadingPlayerId)
      || (oldGameData.winPlayerId !== game.winPlayerId)
      || (oldGameData.gameState !== game.gameState)
    );
  }

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
    if (playerId !== null) {
      if (playerId === game.winPlayerId) {
        return "Winner";
      } else if (playerId === game.leadingPlayerId) {
        return "Move";
      }
    }
    return "";
  }

  public render(): JSX.Element {
    const userId: number = parseInt(localStorage.getItem(USER_ID) as string, 10);
    const game: IGame = this.state.game;
    const errorMessage: string | null = this.state.errorMessage;
    const isError: boolean = errorMessage !== null;
    return (
      <div className="game-page m-a">
        <div className="error-message-container tac">
          {isError ? errorMessage : ""}
        </div>
        {!isError
          ? <div className="game-page-content">
              <div className="name-container">
                <div className="player-name float-left">
                  <div className="creator-name">
                    X {game.creatorName}
                  </div>
                  <div className="creator-state">
                    {CGamePageView.getPlayerState(game.creatorGameId, game)}
                  </div>
                </div>
                <div className="player-name float-right tar">
                  <div className="participant-name">
                    {game.participantName} 0
                  </div>
                  <div className="participant-state">
                    {CGamePageView.getPlayerState(game.participantId, game)}
                  </div>
                </div>
              </div>

              <div className="tac">
                <GameField
                  game={game}
                  userId={userId}
                  takePlayerMove={this.props.takePlayerMove}
                  sendMessage={this.sendMessage}
                  updateGame={this.updateGame}
                />
              </div>

              <div className="timer-container tac pt-md pb-md">
                <MyTimer milliseconds={game.time}/>
              </div>

              <div className="buttons tac">
                {
                  ((userId === game.creatorGameId) || (userId === game.participantId))
                    ? this.renderSurrenderButton()
                    : this.renderBackButton()
                }
              </div>
            </div>
          : null
        }

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