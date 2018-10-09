import * as React from "react";
import {Button, Modal} from "react-bootstrap";

interface IGameStateNotificationProps {
  closePopup: () => void;
  show: boolean;
  redirectToStartPage: () => void;
  message: string;
}

class GameStateNotification extends React.Component<IGameStateNotificationProps, {}> {
  constructor(props: IGameStateNotificationProps) {
    super(props);

  }

  public render(): JSX.Element {
    return (
      <Modal
        show={this.props.show}
        onHide={this.props.closePopup}
        backdrop="static"
        bsSize="small"
      >
        <Modal.Header>
          <Modal.Title>{this.props.message}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Button onClick={this.props.closePopup}>
            Ok
          </Button>
        </Modal.Body>
      </Modal>
    );
  }
}

export default GameStateNotification;