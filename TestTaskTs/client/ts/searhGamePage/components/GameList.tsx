import * as React from "react";
import {map} from "lodash";
import {ListGroup} from "react-bootstrap";
import GameItem from "./GameItem";
import {DataList, MyDictionary} from "../../../consts/types";
//import Ingrid from "react-ingrid";
import InfiniteGrid from "react-infinite-grid/src/grid";

interface IGameListProps {
    games: DataList;
    redirectToGame: (gameId: number) => void;
}

// class GameList extends React.Component<IGameListProps, {}> {
//     constructor(props: IGameListProps) {
//         super(props);
//     }
//
//     private generateGameItems = () => {
//         return map(this.props.games, (gameData: MyDictionary) => {
//             return <GameItem
//               game={gameData}
//               key={gameData.id}
//               redirectToGame={this.props.redirectToGame}
//             />;
//         });
//     };
//
//     public render(): JSX.Element {
//         console.log(this.generateGameItems());
//         return (
//           <div>
//               <ListGroup className="game-list">{this.generateGameItems()}</ListGroup>
//           </div>
//         );
//     }
// }

const GameList = (props: IGameListProps) => {
    let items: any = [];
    for (let gameData of props.games) {
        items.push(
          <GameItem
              game={gameData}
              key={gameData.id}
              redirectToGame={props.redirectToGame}
            />
        );
    }

    return <InfiniteGrid wrapperHeight={400} entries={items} />;
};

export default GameList;