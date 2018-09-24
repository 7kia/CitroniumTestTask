import * as React from "react";

interface ICreateGameWindowProps  {
  closePopup: () => void;
}

interface ICreateGameWindowState {

}

class CreateGameWindow extends React.Component<ICreateGameWindowProps, ICreateGameWindowState> {
  constructor (props: ICreateGameWindowProps) {
    super(props);
  }

  public render(): JSX.Element {
    return (
      <div className="popup">
        <div className="popup_inner">
          <h1>{"this.props.text"}</h1>
          <button onClick={this.props.closePopup}>close me</button>
        </div>
      </div>
    );
  }
}

export default CreateGameWindow;