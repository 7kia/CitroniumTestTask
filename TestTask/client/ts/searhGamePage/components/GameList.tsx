import * as React from "react";
import {map} from "lodash";
import GameItem from "./GameItem";
import {DataList, IGameReport, MyDictionary} from "../../consts/types";
import {Grid, Col, Row, ListGroup} from "react-bootstrap";

interface IGameListProps {
    games: IGameReport[];
    redirectToGame: (gameId: number) => void;
}

// class GameList extends React.Component<IGameListProps, {}> {
//     constructor(props: IGameListProps) {
//         super(props);
//     }
//
//     private generateColumn(index: number): JSX.Element {
//       return  (
//         <Col xs={6} md={4}>
//           <GameItem
//             game={this.props.games[index]}
//             redirectToGame={this.props.redirectToGame}
//           />
//         </Col>
//       );
//     }
//
//   private static generateRow(columns: Array<JSX.Element>): JSX.Element {
//     let row: JSX.Element = (
//       <Row className="show-grid">
//
//       </Row>
//     );
//     row.props.children = {columns};
//     return row;
//   }
//
//
//
//   private generateRows(): JSX.Element {
//       let rows: Array<JSX.Element> = [];
//       let columns: Array<JSX.Element> = [];
//       let countToRow: number = 0;
//       const amountToRow: number = 3;
//       for (let index = 0; index < this.props.games.length; index++) {
//         if (countToRow >= amountToRow) {
//           rows.push(GameList.generateRow(columns));
//           columns = [];
//           countToRow = 0;
//         }
//         if (countToRow < amountToRow) {
//           columns.push(this.generateColumn(index));
//           countToRow++;
//         }
//       }
//       if (countToRow < amountToRow) {
//         rows.push(GameList.generateRow(columns));
//       }
//       return (
//         <Grid>
//           {rows}
//         </Grid>
//       );
//     }
//
//   private videoItems = () => {
//     return map(this.props.games, (game: MyDictionary) => {
//       console.log(game);
//
//       return (
//         <GameItem
//           game={game}
//           redirectToGame={this.props.redirectToGame}
//         />
//       );
//     })
//   };
//
//   public render(): JSX.Element {
//       return (
//         <ListGroup className="video-list">{this.videoItems}</ListGroup>
//       );
//     }
// }

const GameList = (props: IGameListProps) => {
  const videoItems = map(props.games, (game: IGameReport) => {
    return <GameItem game={game} key={game.gameId} redirectToGame={props.redirectToGame}/>;
  });

  return <ListGroup className="video-list">{videoItems}</ListGroup>;
};

export default GameList;