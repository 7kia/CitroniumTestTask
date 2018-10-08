import * as React from "react";
import {IGame} from "../interface/game";
import {takePlayerMove} from "../actions/game";

interface IFieldCellProps {
  key: number;
  cellValue: string;
  x: number;
  y: number;
  userId: number;
  gameId: number;
  updateGame: (game: IGame) => void;
  sendMessage: (message: string) => void;
  takePlayerMove: typeof takePlayerMove;
}

class FieldCell extends React.Component<IFieldCellProps, {}> {
  constructor(props: IFieldCellProps) {
    super(props);
  }

  private takePlayerMove: () => void = () => {
    const x: number = this.props.x;
    const y: number = this.props.y;
    const userId: number = this.props.userId;
    const gameId: number = this.props.gameId;
    this.props.takePlayerMove(
      x,
      y,
      userId,
      gameId,
      this.props.updateGame,
      this.props.sendMessage,
    );
  };

  public render(): JSX.Element {
    const key: number = this.props.key;
    const cellValue: string = this.props.cellValue;
    return (
      <div className="cell" key={key} onClick={this.takePlayerMove}>
        {cellValue}
      </div>
    );
  }
}

export default FieldCell;