//import "marko/node-require";
require("@marko/compiler/register");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

import express from "express";
import cors from "cors";

const port = parseInt(3000);

import { join } from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";
import compressionMiddleware from "compression";
import markoMiddleware from "@marko/express";
import indexPage from "./routes/pages/index.cjs";

import hookRouter from "./routes/hooks/hooks.router.js";

const app = express();

app.use(express.json());
app.use("/assets", express.static("dist/assets"));
app.use(compressionMiddleware());

app.use(markoMiddleware());

app.use("/hook", hookRouter);
app.use("/", indexPage);

app.listen(port, listener);

function listener() {
  console.log(`Listening on Port ${port}!`);
}

export default app;
