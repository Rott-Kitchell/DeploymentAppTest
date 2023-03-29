import { MYPORT, environment } from "../config.js";

import app from "./index.js";
const port = parseInt(MYPORT || 3000);
// _________________________________________________________________________//
// the following is for testing purposes only, will need to rewrite before publishing
// _________________________________________________________________________//


let hookId;

import {
  findBCHookID,
  listBCHooks,
  updateBCHook,
} from "./routes/BChooks/hooks.service.js";

if (environment && environment == "development") {
  let ngrokURL = "";

  const { NGROKTOKEN, NGROKAPIKEY } = import("../config.js");
  const ngrok = await import("ngrok");
  let nodemon = await import("nodemon");
  nodemon = nodemon.default;
  const ngrokBody = {
    proto: "http",
    addr: port,
    authtoken: NGROKTOKEN,
  };

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
      listBCHooks()
        .then((data) => {
          console.log("listHooksData",data);
          return (hookId = findBCHookID(data, "store/order/*"));
        })
        .then((hookId) => {
          let body = {
            scope: "store/order/*",
            destination: `${ngrokURL}/hook`,
            is_active: true,
            events_history_enabled: true,
          };

          updateBCHook(hookId, body);
        })
        .then(() => {
          nodemon({
            exec: `set NGROK_URL=${ngrokURL}&& node`,
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
}
app.listen(3000, listener);

function listener() {
  console.log(`Listening on Port 3000!`);
}
