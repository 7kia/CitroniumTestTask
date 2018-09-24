"use strict";

import * as React from "react";
import {Redirect, Route, Switch} from "react-router-dom";
import NotFoundView from "./NotFoundView";
import LogoutView from "../auth/views/LogoutView";
import VideoListView from "../videos/views/VideoListView";
import StartPageView from "../startPage/views/StartPage";


export interface ILoggedInAppContainerProps {}

class LoggedInAppContainer extends React.Component<ILoggedInAppContainerProps, {}> {
    public render(): JSX.Element {
        return (
            <Switch>
                <Route path="/" exact component={VideoListView}/>
                <Route path="/logout" exact component={LogoutView}/>
                <Route path="/startPage" exact component={StartPageView}/>
              
                <Redirect from="/login" to="/startPage"/>
                <Redirect from="/signup" to="/startPage"/>
                <Route path="/*" component={NotFoundView}/>
            </Switch>
        );
    }
}

export default LoggedInAppContainer;
