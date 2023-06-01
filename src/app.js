import express from "express";
import BCHookRouter from "./routes/BChooks/hooks.router.js";
import cors from "cors";
import errorHandler from "./errors/errorHandler.js";
import notFound from "./errors/notFound.js";

const app = express();

app.use(cors());
app.options("*", cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("OhHaiMark!");
});

app.use("/hook", BCHookRouter);

app.use(errorHandler);
app.use(notFound);

export default app;
