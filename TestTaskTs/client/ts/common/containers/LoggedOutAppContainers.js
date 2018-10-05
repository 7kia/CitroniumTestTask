'use strict';
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
var React = require("react");
var react_router_dom_1 = require("react-router-dom");
var LoginView_1 = require("../auth/views/LoginView");
var SignupView_1 = require("../auth/views/SignupView");
var LoggedOutAppContainer = (function (_super) {
    __extends(LoggedOutAppContainer, _super);
    function LoggedOutAppContainer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    LoggedOutAppContainer.prototype.render = function () {
        return (<react_router_dom_1.Switch>
                <react_router_dom_1.Route path="/login" exact component={LoginView_1["default"]}/>
                <react_router_dom_1.Route path="/signup" exact component={SignupView_1["default"]}/>

                <react_router_dom_1.Redirect from="/*" to="/login"/>
            </react_router_dom_1.Switch>);
    };
    return LoggedOutAppContainer;
}(React.Component));
exports["default"] = LoggedOutAppContainer;
