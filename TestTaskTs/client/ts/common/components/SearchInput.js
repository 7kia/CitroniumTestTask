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
var react_bootstrap_1 = require("react-bootstrap");
var SearchInput = (function (_super) {
    __extends(SearchInput, _super);
    function SearchInput() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SearchInput.prototype.render = function () {
        var _a = this.props, help = _a.help, id = _a.id, placeholder = _a.placeholder, onChange = _a.onChange;
        return (<react_bootstrap_1.FormGroup controlId={id}>
                <react_bootstrap_1.FormControl bsSize="lg" onChange={onChange} placeholder={placeholder}/>
                {help && <react_bootstrap_1.HelpBlock>{help}</react_bootstrap_1.HelpBlock>}
            </react_bootstrap_1.FormGroup>);
    };
    return SearchInput;
}(React.Component));
exports["default"] = SearchInput;
