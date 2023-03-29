import express from "express";
import hookRouter from "./routes/BChooks/hooks.router.js";
import cors from "cors";
import errorHandler from "./errors/errorHandler.js";
import notFound from "./errors/notFound.js";

import { MYPORT, environment } from "../config.js";

const app = express();

app.use(cors());
app.options("*", cors());
app.use(express.json());

//this hook path is currently the only one working
app.use("/hook", hookRouter);

app.use(notFound);
app.use(errorHandler);

export default app;
