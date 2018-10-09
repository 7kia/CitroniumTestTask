import * as React from "react";
import {IGame} from "../interface/game";
import MyGrid from "../../common/components/MyGrid";
import FieldCell from "./FileldCell";
import {USER_ID} from "../../consts/auth";
import {takePlayerMove} from "../actions/game";

interface IGameFieldProps {
  game: IGame;
  userId: number;
  updateGame: (game: IGame) => void;
  sendMessage: (message: string) => void;
  takePlayerMove: typeof takePlayerMove;
}

class GameField extends React.Component<IGameFieldProps, {}> {
  constructor(props: IGameFieldProps) {
    super(props);
  }

  private generateCells(): JSX.Element[] {
    const game: IGame = this.props.game;
    const userId: number = parseInt(localStorage.getItem(USER_ID) as string, 10);
    let cells: JSX.Element[] = [];
    const field: string[] = game.field;
    for (let y = 0; y < game.size; y++) {
      for (let x = 0; x < game.size; x++) {
        const disable: boolean =
          (game.leadingPlayerId !== userId)
          || (game.participantId === null)
          || (field[y][x] !== "?");

        cells.push(
          <FieldCell
            key={x + y * game.size}
            cellValue={field[y][x]}
            x={x}
            y={y}
            userId={userId}
            gameId={game.id}
            takePlayerMove={this.props.takePlayerMove}
            sendMessage={this.props.sendMessage}
            updateGame={this.props.updateGame}
            disable={disable}
          />,
        );
      }
    }
    return cells;
  }

  public render(): JSX.Element {
    const game: IGame = this.props.game;
    return (
      <div className="game-field">
        <MyGrid items={this.generateCells()} rowAmount={game.size} columnAmount={game.size}/>
      </div>
    );
  }
}

export default GameField;