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
import YouMoveNotification from "./YouMoveNotification";
import GameStateNotification from "./GameStateNotification";

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
  showYouMoveNotification: boolean;
  showGameStateNotification: boolean;
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
      showYouMoveNotification: false,
      showGameStateNotification: false,
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
      () => {
        if (this.state.game.gameState <= 0) {
          this.getGame();
        }
      },
      1000,
    );
  }

  public componentWillUnmount() {
    clearInterval(this.timerId);
  }

  private getGame() {
    this.props.getGame(this.state.gameId, this.updateGame, this.sendMessage);
    if (this.state.game.gameState > 0) {
      clearInterval(this.timerId);
    }
  }

  private updateGame: (game: IGame) => void = (game: IGame) => {
    this.setState({game: game, errorMessage: null, time: game.time});
    if (this.gameUpdated()) {
      this.setOldGameData();

      const userId: number = parseInt(localStorage.getItem(USER_ID) as string, 10);
      const gameData: IGame = this.state.game;
      if ((gameData.creatorGameId === userId) || (gameData.participantId === userId)) {
        this.showNotification();
      }
    }
    this.updateTimer(game.time);
  };

  private showNotification() {
    const userId: number = parseInt(localStorage.getItem(USER_ID) as string, 10);
    const game: IGame = this.state.game;

    if (game.gameState > 0) {
      this.toggleShowGameStateNotification();
    } else if (game.leadingPlayerId === userId) {
      this.toggleShowYouMoveNotification();
    }
  }

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

  private redirectToStartPage: () => void = () => {
    this.props.history.push("/start-page");
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
    this.props.surrender(userId, this.state.game.id, this.updateGame, this.sendMessage);
  }

  private renderSurrenderButton(): JSX.Element {
    return (
      <Button
        bsStyle="primary"
        bsSize="lg"
        onClick={this.surrender}
      >
        Surrender
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

  private toggleShowYouMoveNotification: () => void = () => {
    this.setState({
      showYouMoveNotification: !this.state.showYouMoveNotification
    });
  };

  private toggleShowGameStateNotification: () => void = () => {
    this.setState({
      showGameStateNotification: !this.state.showGameStateNotification
    });
  };

  private generateGameStateMessage: () => string = () => {
    const game: IGame = this.state.game;
    const userId: number = parseInt(localStorage.getItem(USER_ID) as string, 10);

    const isWinner: boolean = game.winPlayerId !== null;
    const draw: boolean = game.gameState === 3;
    const userIsCreator: boolean = game.creatorGameId === userId;
    const userIsParticipant: boolean = game.participantId === userId;
    if (isWinner) {
      if (game.winPlayerId === userId) {
        return "You win";
      } else if (userIsParticipant || userIsCreator) {
        return "You loser";
      }
    } else if (draw) {
      return "Draw";
    }
    return "";
  };

  private renderName(name: string): string {
    if (name) {
      return name;
    }
    return "No player";
  }

  public render(): JSX.Element {
    const userId: number = parseInt(localStorage.getItem(USER_ID) as string, 10);
    const game: IGame = this.state.game;
    const errorMessage: string | null = this.state.errorMessage;
    const isError: boolean = errorMessage !== null;
    const userParticipantToGame: boolean = ((userId === game.creatorGameId) || (userId === game.participantId));

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
                    X {this.renderName(game.creatorName)}
                  </div>
                  <div className="creator-state">
                    {CGamePageView.getPlayerState(game.creatorGameId, game)}
                  </div>
                </div>
                <div className="player-name float-right tar">
                  <div className="participant-name">
                    {this.renderName(game.participantName)} 0
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
                  (userParticipantToGame && (game.participantId !== null) && (game.gameState <= 0))
                    ? this.renderSurrenderButton()
                    : this.renderBackButton()
                }
              </div>

            {this.state.showYouMoveNotification
              ? <YouMoveNotification
                  closePopup={this.toggleShowYouMoveNotification}
                  show={this.state.showYouMoveNotification}
                />
              : null
            }
            {this.state.showGameStateNotification
              ? <GameStateNotification
                  closePopup={this.toggleShowGameStateNotification}
                  show={this.state.showGameStateNotification}
                  redirectToStartPage={this.redirectToStartPage}
                  message={this.generateGameStateMessage()}
                />
              : null
            }
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