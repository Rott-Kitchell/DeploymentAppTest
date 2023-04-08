import express from "express";
import BCHookRouter from "./routes/BChooks/hooks.router.js";
import cors from "cors";
import errorHandler from "./errors/errorHandler.js";
import notFound from "./errors/notFound.js";

const app = express();

app.use(cors());
app.options("*", cors());
app.use(express.json());

//this hook path is currently the only one working
app.use("/hook", BCHookRouter);
process.on("unhandledRejection", (e, p) => {
  console.log("Unhandled Rejection at: Promise", p, "reason:", e);
  // application specific logging, throwing an error, or other logic here
});

app.use(errorHandler);
app.use(notFound);

export default app;
