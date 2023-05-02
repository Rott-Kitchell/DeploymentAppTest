import express from "express";
import BCHookRouter from "./routes/BChooks/hooks.router.js";

import errorHandler from "./errors/errorHandler.js";
import notFound from "./errors/notFound.js";

const app = express();

app.use(express.json());

//this hook path is currently the only one working
app.use("/hook", BCHookRouter);

app.use(errorHandler);
app.use(notFound);

export default app;
