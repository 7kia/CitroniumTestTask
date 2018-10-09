import * as React from "react";
import {Button, Modal} from "react-bootstrap";

interface IYouMoveNotificationProps {
  closePopup: () => void;
  show: boolean;
}

class YouMoveNotification extends React.Component<IYouMoveNotificationProps, {}> {
  constructor(props: IYouMoveNotificationProps) {
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
          <Modal.Title>You move</Modal.Title>
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

export default YouMoveNotification;