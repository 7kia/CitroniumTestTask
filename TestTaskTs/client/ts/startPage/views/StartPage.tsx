/**
 * Created by Илья on 23.09.2018.
 */
import * as React from "react";
import {RouteComponentProps as IRouteComponentProps} from "react-router-dom";
import {bindActionCreators, Dispatch as IDispatch} from "redux";
import {IStore} from "../../reducer";
import {connect} from "react-redux";
import {getIncompleteGameUserId} from "../actions/games";
import {USER_ID} from "../../consts/auth";
import {Json} from "../../consts/types";
import {apiPOST} from "../../common/helpers/request";
import {BACKEND_SERVER_ADDRESS} from "../../consts/server";
import CreateGameWindow from "../components/CreateGameWindow";
import {Button} from "react-bootstrap";

interface IActionProps {
  getIncompleteGameUserId: typeof getIncompleteGameUserId;
}

interface IStartPageViewState {
  gameData: Json;
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

  private setIncompleteGame = (data: Json) => {
    const gameData: Json = data;
    this.setState({
      gameData,
    });
    console.log("state = " + JSON.stringify(gameData));
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
        {this.state.showCreateGameWindow ? <CreateGameWindow closePopup={this.togglePopup}/> : null}
        <ul className="user-action-container">
          <li>
            <img src={"image/searchGame.png"} className="size200"/>
            <Button className="action-button" onClick={this.openSearchGamePage}>
              Search game
            </Button>
          </li>
          <li>
            <img src={"image/createGame.png"} className="size200"/>
            <Button className="action-button" onClick={this.togglePopup}>
              Create game
            </Button>
          </li>
          <li>
            <img src={"image/continueGame.png"} className="size200"/>
            <Button className="action-button" onClick={this.openGamePage} disabled={this.state.gameData.id === null}>
              Continue
            </Button>
          </li>
        </ul>
      </div>
    );
  }
}

function mapActionsToProps(dispatch: IDispatch<IStore>): IActionProps {
  return bindActionCreators({
    getIncompleteGameUserId
  }, dispatch);
}

const StartPageView = connect(undefined, mapActionsToProps)(StartPageViewC);

export default StartPageView;
