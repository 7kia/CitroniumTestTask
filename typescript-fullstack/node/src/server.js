"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var compression = require("compression");
var session = require("express-session");
var bodyParser = require("body-parser");
var logger = require("morgan");
var errorHandler = require("errorhandler");
var lusca = require("lusca");
var dotenv = require("dotenv");
var flash = require("express-flash");
var path = require("path");
var clear = require("clear-console");
var chalk = require("chalk");
var expressValidator = require("express-validator");
if (process.env.NODE_ENV !== 'production') {
    dotenv.config({ path: '.env' });
    clear({ toStart: true });
    clear({ toStart: true });
}
var app = express();
app.set('port', process.env.PORT || 3000);
app.use(compression());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressValidator());
app.use(session({
    resave: true,
    saveUninitialized: true,
    secret: process.env.SESSION_SECRET
}));
app.use(flash());
app.use(lusca.xframe('SAMEORIGIN'));
app.use(lusca.xssProtection(true));
// API Routes imports
var users_routes_1 = require("./routes/api/users.routes");
// Initialization
users_routes_1.default(app);
if (process.env.NODE_ENV === 'production') {
    app.use('/images', express.static(path.join(__dirname, '..', 'dist-react', 'images'), { maxAge: 31557600000 }));
    app.use('/libs', express.static(path.join(__dirname, '..', 'dist-react', 'libs'), { maxAge: 31557600000 }));
    app.use('/static', express.static(path.join(__dirname, '..', 'dist-react', 'static'), { maxAge: 31557600000 }));
    app.get('*', function (req, res) { return res.sendFile(path.join(__dirname, '..', 'dist-react', 'index.html')); });
}
else {
    app.get('/:url', function (req, res) { return (res.redirect('http://localhost:3001/' + req.params.url)); });
}
app.use(errorHandler());
app.listen(app.get('port'), function () {
    console.info(chalk.green('Node server compiled succesfully!'));
    console.info('App is running at ' + chalk.bold('http://localhost:' + app.get('port')) + ' in ' + chalk.bold(app.get('env').toUpperCase()) + ' mode');
});
module.exports = app;
