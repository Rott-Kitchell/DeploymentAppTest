require("@marko/compiler/register");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

import express from "express";
import compressionMiddleware from "compression";
import markoMiddleware from "@marko/express";
import indexPage from "./routes/pages/index.cjs";

import hookRouter from "./routes/hooks/hooks.router.js";

const app = express();

app.use(express.json());
app.use("/assets", express.static("dist/assets"));
app.use(compressionMiddleware());

app.use(markoMiddleware());
//this hook path is currently the only one working
app.use("/hook", hookRouter);
app.use("/", indexPage);
const port = parseInt(process.env.MYPORT);
console.log(port);
app.listen(port, listener);

// _________________________________________________________________________//
// the following is for testing purposes only, will need to rewrite before publishing
// _________________________________________________________________________//
const fetch = require("node-fetch");
const ngrok = require("ngrok");
let ngrokURL = "";
let hookId;
const nodemon = require("nodemon");

const BCSTOREHASH = process.env.BCSTOREHASH;
const BCACCESSTOKEN = process.env.BCACCESSTOKEN;
const BCCLIENTID = process.env.BCCLIENTID;
const NGROKTOKEN = process.env.NGROKTOKEN;
const ngrokBody = {
  proto: "http",
  addr: port,
  authtoken: NGROKTOKEN,
};
console.log(BCSTOREHASH, BCACCESSTOKEN, BCCLIENTID, NGROKTOKEN, ngrokBody);
const headers = {
  "Content-Type": "application/json",
  "X-Auth-Token": BCACCESSTOKEN,
  Accept: "application/json",
};

// does the fetching
async function fetchJson(url, options, onCancel) {
  try {
    const response = await fetch(url, options);
    const payload = await response.json();
    console.log(payload);
    if (payload.error) {
      return Promise.reject({ message: payload.error });
    }
    return payload.data;
  } catch (error) {
    if (error.name !== "AbortError") {
      console.error(error.stack);
      throw error;
    }
    return Promise.resolve(onCancel);
  }
}
// whenever you start the app, it will update the BigCommerce hook with the new tunnel address (this will be deleted eventually, only for testing purposes)
export async function updateHook(hookId, data) {
  const url = new URL(
    `https://api.bigcommerce.com/stores/${BCSTOREHASH}/v3/hooks/${hookId}`
  );
  const options = {
    method: "PUT",
    headers,
    body: JSON.stringify({ ...data }),
  };
  console.log(options);
  return await fetchJson(url, options, {});
}

// finds the current hooks associated to the BigCommerce store
export async function listHooks(params, signal) {
  const url = new URL(
    `https://api.bigcommerce.com/stores/${BCSTOREHASH}/v3/hooks`
  );
  if (params)
    Object.entries(params).forEach(([key, value]) => {
      return url.searchParams.append(key, value.toString());
    });
  return await fetchJson(url, { headers, signal }, {});
}
// finds the id of the hook
export function findHookID(data, scope, clientId) {
  return data.find(
    (hook) => hook.scope === scope && hook.client_id === clientId
  ).id;
}

/* 
Ok, here's what's happening:
1. ngrok tunnel is started
2. url of tunnel is stored as ngrokURL
2. listHooks is called then findHookID is called to find the id of the hook we need to update
3. updateHook is called to update the hook
4. nodemon is called while (in theory) excluding the ngrok tunnel since it doesn't need to be restarted. (WIP)
*/
ngrok
  .connect(ngrokBody)
  .then((url) => {
    ngrokURL = url;
    console.log(`ngrok tunnel opened at: ${ngrokURL}`);
    console.log("Open the ngrok dashboard at: https://localhost:4040\n");
    listHooks()
      .then((data) => {
        return (hookId = findHookID(data, "store/order/*", BCCLIENTID));
      })
      .then((hookId) => {
        let body = {
          scope: "store/order/*",
          destination: `${ngrokURL}/hook`,
          is_active: true,
          events_history_enabled: true,
        };

        updateHook(hookId, body);
      })
      .then(() => {
        nodemon({
          exec: `NGROK_URL=${url} node`,
        })
          .on("start", () => {
            console.log("The application has started");
          })
          .on("restart", (files) => {
            console.group("Application restarted due to:");
            files.forEach((file) => console.log(file));
            console.groupEnd();
          })
          .on("quit", () => {
            console.log("The application has quit, closing ngrok tunnel");
            ngrok.kill().then(() => process.exit(0));
          });
      });
  })
  .catch((error) => {
    console.error("Error opening ngrok tunnel: ", error);
    process.exitCode = 1;
  });

function listener() {
  console.log(`Listening on Port ${port}!`);
}

export default app;
