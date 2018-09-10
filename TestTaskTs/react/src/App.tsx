import * as React from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";

import HomeContainer from "./containers/Home";
import LoginPageContainer from "./pages/Login";

import "./styles/App.scss";
import StartPage from "./containers/StartPage";

class App extends React.Component {
  render() {
    return (
      <div className="App">
        <Router>
          <div>
            <Route exact={true} path="/" component={HomeContainer} />
            <Route exact={true} path="/login" component={LoginPageContainer} />
            <Route exact={true} path="/start" component={StartPage} />
          </div>
        </Router>
      </div>
    );
  }
}

export default App;
