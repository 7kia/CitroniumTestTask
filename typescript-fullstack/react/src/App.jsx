"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var react_router_dom_1 = require("react-router-dom");
// Public pages
var Home_1 = require("./containers/Home");
// Auth pages
var Login_1 = require("./containers/Login");
require("./styles/App.scss");
var App = (function (_super) {
    __extends(App, _super);
    function App() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    App.prototype.render = function () {
        return (<div className="App">
				<react_router_dom_1.BrowserRouter>
					<div>
						<react_router_dom_1.Route exact={true} path="/" component={Home_1.default}/>
						<react_router_dom_1.Route exact={true} path="/login" component={Login_1.default}/>
					</div>
				</react_router_dom_1.BrowserRouter>
			</div>);
    };
    return App;
}(React.Component));
exports.default = App;
