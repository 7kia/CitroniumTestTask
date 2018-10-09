/**
 * Created by Илья on 23.09.2018.
 */
import * as React from "react";
import {RouteComponentProps as IRouteComponentProps} from "react-router-dom";
import {bindActionCreators, Dispatch as IDispatch} from "redux";
import {IStore} from "../../reducer";
import {connect} from "react-redux";
import {connectUserToGame, searchGames} from "../actions/games";
import SearchGameBar from "../components/SearchBar";
import {IGameReport} from "../../common/interfaces/gameReport";
import MyGrid from "../../common/components/MyGrid";
import GameItem from "../components/GameItem";

interface IActionProps {
  searchGames: typeof searchGames;
  connectUserToGame: typeof connectUserToGame;
}

interface ISearchGameViewState {
  gameColumns: IGameReport[][];
  games: IGameReport[];
}

interface ISearchGameViewProps extends IActionProps, IRouteComponentProps<any> {
  dispatch: IDispatch<IStore>;
}

class SearchGameC extends React.Component<ISearchGameViewProps, ISearchGameViewState> {
  private columnAmount: number = 4;

  constructor(props: ISearchGameViewProps) {
    super(props);

    this.state = {
      gameColumns: [],
      games: [],
    };
  }

  private updateGameList: (games: IGameReport[]) => void = (games: IGameReport[]) => {
    this.setState({games});
  };

  private generateGameItems(): JSX.Element[] {
    const games: IGameReport[] = this.state.games;
    let gridElements: JSX.Element[] = [];
    for (let i = 0; i < games.length; i++) {
      gridElements.push(
        <div className="m-a">
          <GameItem
            game={games[i]}
            key={games[i].id}
            redirectToGame={this.redirectToGame}
            connectUserToGame={this.props.connectUserToGame}
          />
        </div>,
      );
    }
    return gridElements;
  }

  private redirectToGame: (gameId: number) => void  = (gameId: number) => {
    this.props.history.push("/game/" + gameId);
  };

  public render(): JSX.Element {
    return (
      <div className="search-game-page w100">
        <div className="search-bar-container">
          <SearchGameBar
            onGameSearch={this.props.searchGames}
            updateGameList={this.updateGameList}
          />
        </div>
        <div className="pv-xxxl h100">
          <MyGrid items={this.generateGameItems()} columnAmount={this.columnAmount} rowAmount={null}/>
        </div>
      </div>

    );
  }
}

function mapActionsToProps(dispatch: IDispatch<IStore>): IActionProps {
  return bindActionCreators(
    {
      searchGames,
      connectUserToGame,
    },
    dispatch,
  );
}

const SearchGameView = connect(undefined, mapActionsToProps)(SearchGameC);

export default SearchGameView;
