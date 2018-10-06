import * as React from "react";
import {Button} from "react-bootstrap";
import {IGame} from "../interface/game";

interface IGameFieldProps {
  game: IGame;
}

class GameField extends React.Component<IGameFieldProps, {}> {
  constructor(props: IGameFieldProps) {
    super(props);
  }

  private static playerIsMove(userId: number, leadingPlayerId: number): boolean {
    return (userId === leadingPlayerId);
  }

  private static renderNameMovePlayer(name: string): JSX.Element {
    return (
      <b>{name}</b>
    );
  }
  private static renderNamePlayer(name: string): JSX.Element {
    return (
      <b><u>{name}</u></b>
    );
  }

  public render(): JSX.Element {
    const game: IGame = this.props.game;
    return (
      <div className="game-field">

      </div>
    );
  }
}

export default GameField;