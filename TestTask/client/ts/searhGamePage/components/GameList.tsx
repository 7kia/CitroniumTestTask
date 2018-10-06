import * as React from "react";
import GameItem from "./GameItem";
import {map} from "lodash";
import {IGameReport} from "../../common/interfaces/gameReport";

interface IGameListProps {
    games: IGameReport[];
    redirectToGame: (gameId: number) => void;
}

class GameList extends React.Component<IGameListProps, {}> {
  constructor(props: IGameListProps) {
      super(props);
  }

  private generateGameList(): JSX.Element[] {
    return map(this.props.games, (game: IGameReport) => {
      return (
        <li>
          <GameItem game={game} key={game.id} redirectToGame={this.props.redirectToGame}/>
        </li>
      );
    });
  }

  public render(): JSX.Element {
    return (
      <ul className="game-list">{this.generateGameList()}</ul>
    );
  }
}

export default GameList;