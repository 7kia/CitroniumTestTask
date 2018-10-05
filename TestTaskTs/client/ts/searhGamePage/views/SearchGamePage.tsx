/**
 * Created by Илья on 23.09.2018.
 */
import * as React from "react";
import {RouteComponentProps as IRouteComponentProps} from "react-router-dom";
import {bindActionCreators, Dispatch as IDispatch} from "redux";
import {IStore} from "../../reducer";
import {connect} from "react-redux";
import {USER_ID} from "../../consts/auth";
import {Json} from "../../consts/types";
import {Button} from "react-bootstrap";

interface IActionProps {
  searchGame: typeof searchGame;
}

interface IStartPageViewState {
}

interface IStartPageViewProps extends IActionProps, IRouteComponentProps<any> {
  dispatch: IDispatch<IStore>;
}

class SearchGameC extends React.Component<IStartPageViewProps, IStartPageViewState> {

  constructor(props: IStartPageViewProps) {
    super(props);
  }

  public render(): JSX.Element {
    return (
      <div> < /div>
    );
  }
}

function mapActionsToProps(dispatch: IDispatch<IStore>): IActionProps {
  return bindActionCreators({
    searchGame
  },                        dispatch);
}

const SearchGameView = connect(undefined, mapActionsToProps)(SearchGameC);

export default SearchGameView;
