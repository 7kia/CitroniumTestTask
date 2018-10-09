import * as React from "react";
import {Alert, Button, Form, Modal} from "react-bootstrap";
import Input from "../../common/forms/fields/Input";
import CreateGameForm, {IFormData} from "../components/CreateGameForm";
import {ICreateGameData} from "../interfaces/games";
import {USER_ID} from "../../consts/auth";

interface ICreateGameWindowProps {
  closePopup: () => void;
  createGame: (
    gameData: ICreateGameData,
    redirectToGame: Function,
    handleError: Function,
  ) => void;
  redirectToGame: (gameId: number) => void;
  show: boolean;
}

interface ICreateGameWindowState {
}

class CreateGameWindow extends React.Component<ICreateGameWindowProps, ICreateGameWindowState> {
  constructor(props: ICreateGameWindowProps) {
    super(props);

  }

  private onSubmit = (formData: IFormData, handleError: (message: string) => void): void => {
    let gameData: ICreateGameData = {
      userId: parseInt(localStorage.getItem(USER_ID) as string, 10),
      size: parseInt(formData.size, 10),
    };
    this.props.createGame(gameData, this.props.redirectToGame, handleError);
  };

  public render(): JSX.Element {
    return (
      <Modal
        show={this.props.show}
        onHide={this.props.closePopup}
        backdrop="static"
        bsSize="small"
      >
        <Modal.Header>
          <Modal.Title>Create game</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <CreateGameForm
            onSubmit={this.onSubmit}
            closePopup={this.props.closePopup}
          />
        </Modal.Body>
      </Modal>
    );
  }
}

export default CreateGameWindow;