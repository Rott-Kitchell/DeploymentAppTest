//import "marko/node-require";
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

app.use("/hook", hookRouter);
app.use("/", indexPage);
const port = parseInt(process.env.MYPORT)
console.log(port)
app.listen(port, listener);

// this is for testing purposes only, will need to rewrite before publishing
const fetch = require('node-fetch')
const ngrok = require("ngrok");
let ngrokURL = ""
let hookId
const nodemon = require("nodemon");

const BCSTOREHASH = process.env.BCSTOREHASH
const BCACCESSTOKEN = process.env.BCACCESSTOKEN
const BCCLIENTID = process.env.BCCLIENTID
const NGROKTOKEN = process.env.NGROKTOKEN
const ngrokBody = {
  proto: "http",
  addr: port,
  authtoken: NGROKTOKEN
}
console.log(BCSTOREHASH, BCACCESSTOKEN, BCCLIENTID, NGROKTOKEN, ngrokBody)
const headers = { 
  "Content-Type": "application/json",
  "X-Auth-Token": BCACCESSTOKEN,
  "Accept": "application/json"
}


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

export async function updateHook(hookId, data) {
  const url = new URL(`https://api.bigcommerce.com/stores/${BCSTOREHASH}/v3/hooks/${hookId}`);
  const options = {
    method: "PUT",
    headers,
    body: JSON.stringify({ ...data }),
  };
  console.log(options)
  return await fetchJson(url, options, {});
}


export async function listHooks(params, signal) {
  const url = new URL(`https://api.bigcommerce.com/stores/${BCSTOREHASH}/v3/hooks`);
  if (params) Object.entries(params).forEach(([key, value]) => {
    return url.searchParams.append(key, value.toString());
  });
  return await fetchJson(url, { headers, signal }, {})
    
}

export function findHookID(data, scope, clientId) {
  return data.find(hook => hook.scope === scope && hook.client_id === clientId).id
}

ngrok
  .connect(ngrokBody).then((url) => {
    ngrokURL = url
    console.log(`ngrok tunnel opened at: ${ngrokURL}`);
    console.log("Open the ngrok dashboard at: https://localhost:4040\n");
    listHooks().then(data=>{
    return hookId = findHookID(data, 'store/order/*', BCCLIENTID)
    }).then(hookId => {
      let body = {
        "scope": "store/order/*",
        "destination": `${ngrokURL}/hook`,
        "is_active": true,
        "events_history_enabled": true
        
      }
      
      updateHook(hookId, body)
    }).then(()=>{
      nodemon({
        exec: `NGROK_URL=${url} node`,
      }).on("start", () => {
        console.log("The application has started");
      }).on("restart", files => {
        console.group("Application restarted due to:")
        files.forEach(file => console.log(file));
        console.groupEnd();
      }).on("quit", () => {
        console.log("The application has quit, closing ngrok tunnel");
        ngrok.kill().then(() => process.exit(0));
      });
    })
    }).catch((error) => {
    console.error("Error opening ngrok tunnel: ", error);
    process.exitCode = 1;
  });

function listener() {
  console.log(`Listening on Port ${port}!`);
}

export default app;
