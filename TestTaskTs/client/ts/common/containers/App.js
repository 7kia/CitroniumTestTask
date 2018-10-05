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
var react_redux_1 = require("react-redux");
var react_router_dom_1 = require("react-router-dom");
var LoggedInAppContainer_1 = require("./LoggedInAppContainer");
var LoggedOutAppContainers_1 = require("./LoggedOutAppContainers");
var Header_1 = require("../common/components/Header");
var AppC = (function (_super) {
    __extends(AppC, _super);
    function AppC() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    AppC.prototype.renderContent = function () {
        var isUserAuthorized = this.props.isUserAuthorized;
        return isUserAuthorized ? <LoggedInAppContainer_1["default"] /> : <LoggedOutAppContainers_1["default"] />;
    };
    AppC.prototype.render = function () {
        return (<react_redux_1.Provider store={this.props.store}>
                <react_router_dom_1.BrowserRouter>
                    <div id="app" className="df fd-col vh100 vw100">
                        <Header_1["default"] authenticated={this.props.isUserAuthorized}/>
                        <main id="main" className="df fg-1 fs-1 fb-a overflow-y-a">
                            {this.renderContent()}
                        </main>
                    </div>
                </react_router_dom_1.BrowserRouter>
            </react_redux_1.Provider>);
    };
    return AppC;
}(React.Component));
function mapStateToProps(store, ownProps) {
    return {
        isUserAuthorized: store.auth.authenticated
    };
}
var App = react_redux_1.connect(mapStateToProps, {})(AppC);
exports["default"] = App;
