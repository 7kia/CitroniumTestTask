import * as express from "express";
import * as compression from "compression";
import * as session from "express-session";
import * as bodyParser from "body-parser";
import * as logger from "morgan";
import * as errorHandler from "errorhandler";
import * as lusca from "lusca";
import * as dotenv from "dotenv";
import * as flash from "express-flash";
import * as path from "path";
import * as clear from "clear-console";
import * as chalk from "chalk";
import * as cors from "cors";
import expressValidator = require("express-validator");
// API Routes imports
import UsersAPIRoutes from "./routes/api/UserRoutes";
import {NODE_SERVER_URL, REACT_SERVER_URL} from "./routes/constants";
import {NextFunction, Request, Response} from "express";

if (process.env.NODE_ENV !== "production") {
  dotenv.config({ path: ".env" });
  clear({toStart: true});
  clear({toStart: true});
}

const app = express();

app.set("port", process.env.PORT || 3000);

app.use(compression());
app.use(logger("dev"));
app.use(bodyParser.json());	
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressValidator());
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: "secret"// process.env.SESSION_SECRET
}));
app.use(flash());
app.use(lusca.xframe("SAMEORIGIN"));
app.use(lusca.xssProtection(true));

//get router
const router = express.Router();
//options for cors midddleware
const options: cors.CorsOptions = {
  allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept", "X-Access-Token"],
  credentials: true,
  methods: "GET,HEAD,OPTIONS,PUT,PATCH,POST,DELETE",
  origin: REACT_SERVER_URL,
  preflightContinue: false
};

//use cors middleware
router.use(cors(options));

//add your routes

//enable pre-flight
router.options("*", cors(options));

app.use((req: Request, res: Response, next: NextFunction) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// Initialization
UsersAPIRoutes(app);

if (process.env.NODE_ENV === "production") {
  app.use("/images", express.static(path.join(__dirname, "..", "dist-react", "images"), {maxAge: 31557600000}));
  app.use("/libs", express.static(path.join(__dirname, "..", "dist-react", "libs"), {maxAge: 31557600000}));
  app.use("/static", express.static(path.join(__dirname, "..", "dist-react", "static"), {maxAge: 31557600000}));
  app.get("*", (req, res) => res.sendFile(path.join(__dirname, "..", "dist-react", "index.html")));
}
// } else {
//   app.get("/:url", (req, res) => (res.redirect("http://localhost:3001/" + req.params.url)));
// }

app.use(errorHandler());

app.listen(app.get("port"), () => {
  console.info(chalk.green("Node server compiled succesfully!"));
  console.info("App is running at " + chalk.bold("http://localhost:" + app.get("port"))
    + " in " + chalk.bold(app.get("env").toUpperCase()) + " mode");
});

module.exports = app;