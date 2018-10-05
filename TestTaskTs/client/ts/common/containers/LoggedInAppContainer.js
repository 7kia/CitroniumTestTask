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
var NotFoundView_1 = require("./NotFoundView");
var LogoutView_1 = require("../auth/views/LogoutView");
var VideoListView_1 = require("../videos/views/VideoListView");
var LoggedInAppContainer = (function (_super) {
    __extends(LoggedInAppContainer, _super);
    function LoggedInAppContainer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    LoggedInAppContainer.prototype.render = function () {
        return (<react_router_dom_1.Switch>
                <react_router_dom_1.Route path="/" exact component={VideoListView_1["default"]}/>
                <react_router_dom_1.Route path="/logout" exact component={LogoutView_1["default"]}/>

                <react_router_dom_1.Redirect from="/login" to="/"/>
                <react_router_dom_1.Redirect from="/signup" to="/"/>
                <react_router_dom_1.Route path="/*" component={NotFoundView_1["default"]}/>
            </react_router_dom_1.Switch>);
    };
    return LoggedInAppContainer;
}(React.Component));
exports["default"] = LoggedInAppContainer;
