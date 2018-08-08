"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pgPromise = require("pg-promise");
const pgp = pgPromise({});
const cn = 'postgres://postgres:postgres@localhost:5432/TicTacToe';
const db = pgp(cn);
