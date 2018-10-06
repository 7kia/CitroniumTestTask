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

  public render(): JSX.Element {
    const game: IGame = this.props.game;
    return (
      <div className="game-field">

      </div>
    );
  }
}

export default GameField;