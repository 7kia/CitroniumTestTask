/**
 * Created by Илья on 23.09.2018.
 */
import * as React from "react";
import {RouteComponentProps as IRouteComponentProps} from "react-router-dom";
import {bindActionCreators, Dispatch as IDispatch} from "redux";
import {IStore} from "../../reducer";
import {connect} from "react-redux";
import {DataList, IGameReport, MyDictionary} from "../../consts/types";
import {searchGame} from "../actions/games";
import SearchGameBar from "../components/SearchBar";
import GameList from "../components/GameList";
import {Col, Grid, Row} from "react-bootstrap";

interface IActionProps {
  searchGame: typeof searchGame;
}

interface ISearchGameViewState {
  games: IGameReport[];
}

interface ISearchGameViewProps extends IActionProps, IRouteComponentProps<any> {
  dispatch: IDispatch<IStore>;
}

class SearchGameC extends React.Component<ISearchGameViewProps, ISearchGameViewState> {

  constructor(props: ISearchGameViewProps) {
    super(props);

    this.state = {
      games: []
    };
  }

  private updateGameList: (games: IGameReport[]) => void = (games: IGameReport[]) => {
    this.setState({games});
  };

  private redirectToGame: (gameId: number) => void = (gameId: number) => {
    this.props.history.push("/games?id=" + gameId);
  };

  public render(): JSX.Element {
    return (
        <div>
          <SearchGameBar
            onGameSearch={this.props.searchGame}
            updateGameList={this.updateGameList}
          />

          <Grid className="pv-xxxl h100"> 
            <Row>
              <Col md={8}>
              </Col>
              <Col md={4}>
                <GameList games={this.state.games} redirectToGame={this.redirectToGame}/>
              </Col>
            </Row>
          </Grid>
        </div>

    );
  }
}

function mapActionsToProps(dispatch: IDispatch<IStore>): IActionProps {
  return bindActionCreators({
    searchGame
  }, dispatch);
}

const SearchGameView = connect(undefined, mapActionsToProps)(SearchGameC);

export default SearchGameView;
