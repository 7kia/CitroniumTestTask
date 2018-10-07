"use strict";

import * as React from "react";
import {Redirect, Route, Switch} from "react-router-dom";
import NotFoundView from "./NotFoundView";
import LogoutView from "../../auth/views/LogoutView";
import VideoListView from "../../videos/views/VideoListView";
import StartPageView from "../../startPage/views/StartPage";
import SearchGameView from "../../searhGamePage/views/SearchGamePage";
import GamePageView from "../../gamePage/views/GamePageView";

export interface ILoggedInAppContainerProps {}

class LoggedInAppContainer extends React.Component<ILoggedInAppContainerProps, {}> {
  public render(): JSX.Element {
    return (
      <Switch>
        <Route path="/" exact={true} component={VideoListView}/>
        <Route path="/logout" exact={true} component={LogoutView}/>
        <Route path="/start-page" exact={true} component={StartPageView}/>
        <Route path="/search-game" exact={true} component={SearchGameView}/>
        <Route path="/game/:id" component={GamePageView}/>;

        <Redirect from="/login" to="/start-page"/>
        <Redirect from="/signup" to="/startPage"/>
        <Route path="/*" component={NotFoundView}/>
      </Switch>
    );
  }
}

export default LoggedInAppContainer;
