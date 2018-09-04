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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var UserActions = require("../../actions/users");
var redux_1 = require("redux");
var react_redux_1 = require("react-redux");
var react_router_dom_1 = require("react-router-dom");
var Login = (function (_super) {
    __extends(Login, _super);
    function Login(props) {
        var _this = _super.call(this, props) || this;
        _this.addUser = _this.addUser.bind(_this);
        return _this;
    }
    Login.prototype.addUser = function () {
        var userActions = this.props.userActions;
        var userData = {
            id: 1,
            name: 'Dummy user'
        };
        userActions.loginUser(userData);
    };
    Login.prototype.render = function () {
        var users = this.props.users;
        return (<div>
				<h1 onClick={this.addUser}>
					Login page
				</h1>
				<br />
				<react_router_dom_1.Link to="/">Home page</react_router_dom_1.Link>
			</div>);
    };
    return Login;
}(React.Component));
Login = __decorate([
    react_redux_1.connect(mapStateToProps, mapDispatchToProps)
], Login);
exports.default = Login;
function mapStateToProps(state) {
    return {
        users: state.users
    };
}
function mapDispatchToProps(dispatch) {
    return {
        userActions: redux_1.bindActionCreators(UserActions, dispatch)
    };
}
