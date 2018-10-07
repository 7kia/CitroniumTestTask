/**
 * Created by Илья on 23.09.2018.
 */
import * as React from "react";
import {RouteComponentProps as IRouteComponentProps} from "react-router-dom";
import {bindActionCreators, Dispatch as IDispatch} from "redux";
import {IStore} from "../../reducer";
import {connect} from "react-redux";
import {searchGames} from "../actions/games";
import SearchGameBar from "../components/SearchBar";
import GameList from "../components/GameList";
import {Col, Grid, Row} from "react-bootstrap";
import {IGameReport} from "../../common/interfaces/gameReport";

interface IActionProps {
  searchGames: typeof searchGames;
}

interface ISearchGameViewState {
  gameColumns: IGameReport[][];
}

interface ISearchGameViewProps extends IActionProps, IRouteComponentProps<any> {
  dispatch: IDispatch<IStore>;
}

class SearchGameC extends React.Component<ISearchGameViewProps, ISearchGameViewState> {
  private columnAmount: number = 3;

  constructor(props: ISearchGameViewProps) {
    super(props);

    this.state = {
      gameColumns: [],
    };
  }
  private static generateColumnData(
    columnNumber: number,
    columnAmount: number,
    games: IGameReport[],
  ): IGameReport[] {
    let columnData: IGameReport[] = [];
    let rowNumber: number = 0;
    while ((columnNumber + (rowNumber * columnAmount)) < games.length) {
      columnData.push(games[columnNumber + (rowNumber * columnAmount)]);
      rowNumber++;
    }
    return columnData;
  }

  private updateGameList: (games: IGameReport[]) => void = (games: IGameReport[]) => {
    const gameColumns: IGameReport[][] = [];
    for (let i = 0; i < this.columnAmount; i++) {
      gameColumns.push(SearchGameC.generateColumnData(i, this.columnAmount, games));
    }
    this.setState({gameColumns});
  };

  private redirectToGame: (gameId: number) => void  = (gameId: number) => {
    this.props.history.push("/game/" + gameId);
  };

  // private generateGameList(): JSX.Element[] {
  //   console.log(this.state.gameColumns);
  //   return map(this.state.gameColumns, (columnData: IGameReport[]) => {
  //     return (
  //       <Col md={4}>
  //         <GameList
  //           games={columnData}
  //           redirectToGame={this.redirectToGame}
  //         />
  //       </Col>
  //     );
  //   });
  // }

  public render(): JSX.Element {
    return (
      <div className="search-game-page w100">
        <div className="search-bar-container">
          <SearchGameBar
            onGameSearch={this.props.searchGames}
            updateGameList={this.updateGameList}
          />
        </div>
        <Grid className="pv-xxxl h100">
          <Row>
            <Col md={4}>
              <GameList
                games={this.state.gameColumns[0]}
                redirectToGame={this.redirectToGame}
              />
            </Col>
            <Col md={4}>
              <GameList
                games={this.state.gameColumns[1]}
                redirectToGame={this.redirectToGame}
              />
            </Col>
            <Col md={4}>
              <GameList
                games={this.state.gameColumns[2]}
                redirectToGame={this.redirectToGame}
              />
            </Col>
          </Row>
        </Grid>
      </div>

    );
  }
}

function mapActionsToProps(dispatch: IDispatch<IStore>): IActionProps {
  return bindActionCreators(
    {
      searchGames,
    },
    dispatch,
  );
}

const SearchGameView = connect(undefined, mapActionsToProps)(SearchGameC);

export default SearchGameView;
