/**
 * Created by Илья on 23.09.2018.
 */
import * as React from "react";
import {RouteComponentProps as IRouteComponentProps} from "react-router-dom";
import {bindActionCreators, Dispatch as IDispatch} from "redux";
import {IStore} from "../../reducer";
import {connect} from "react-redux";
import {createGame, getIncompleteGameUserId} from "../actions/games";
import {USER_ID} from "../../consts/auth";
import {MyDictionary} from "../../consts/types";
import {apiPOST} from "../../common/helpers/request";
import {BACKEND_SERVER_ADDRESS} from "../../consts/server";
import CreateGameWindow from "./CreateGameWindow";
import {Button} from "react-bootstrap";

interface IActionProps {
  getIncompleteGameUserId: typeof getIncompleteGameUserId;
  createGame: typeof createGame;
}

interface IStartPageViewState {
  gameData: MyDictionary;
  showCreateGameWindow: boolean;
}

interface IStartPageViewProps extends IActionProps, IRouteComponentProps<any> {
  dispatch: IDispatch<IStore>;
}

class StartPageViewC extends React.Component<IStartPageViewProps, IStartPageViewState> {

  constructor(props: IStartPageViewProps) {
    super(props);

    this.state = {
      gameData: {},
      showCreateGameWindow: false
    };
    this.props.getIncompleteGameUserId(parseInt(localStorage.getItem(USER_ID) as string, 10), this.setIncompleteGame);

  }

  private redirectToGame = (gameId: number) => {
    this.props.history.push("/games?id=" + gameId);
  };

  private setIncompleteGame = (data: MyDictionary) => {
    const gameData: MyDictionary = data;
    this.setState({gameData});
  };

  private togglePopup = () => {
    this.setState({
      gameData: this.state.gameData,
      showCreateGameWindow: !this.state.showCreateGameWindow
    });
  };

  private openSearchGamePage = () => {
    this.props.history.push("/search-game");
  };

  private openGamePage = () => {
    this.props.history.push("/games?id="  + this.state.gameData.id);
  };

  public render(): JSX.Element {
    return (
      <div className="start-page-container">
        <ul className="user-action-container">
          <li>
            <img src={"image/searchGame.png"} className="size200"/>
            <Button
              bsStyle="primary"
              bsSize="lg"
              className="action-button"
              onClick={this.openSearchGamePage}>
              Search game
            </Button>
          </li>
          <li>
            <img src={"image/createGame.png"} className="size200"/>
            <Button bsStyle="primary"
                    bsSize="lg"
                    className="action-button"
                    onClick={this.togglePopup}>
              Create game
            </Button>
          </li>
          <li>
            <img src={"image/continueGame.png"} className="size200"/>
            <Button
              bsStyle="primary"
              bsSize="lg"
              className="action-button"
              onClick={this.openGamePage}
              disabled={this.state.gameData.id === null}>
              Continue
            </Button>
          </li>
        </ul>
        {this.state.showCreateGameWindow
          ? <CreateGameWindow
              closePopup={this.togglePopup}
              createGame={this.props.createGame}
              redirectToGame={this.redirectToGame}
              show={this.state.showCreateGameWindow}
          />
          : null
        }
      </div>
    );
  }
}

function mapActionsToProps(dispatch: IDispatch<IStore>): IActionProps {
  return bindActionCreators({
    getIncompleteGameUserId,
    createGame
  }, dispatch);
}

const StartPageView = connect(undefined, mapActionsToProps)(StartPageViewC);

export default StartPageView;
