const { MONDAYTOKEN } = await import("../../../config.js");
import fetchJson from "../../utils/fetchJson.js";
const headers = {
  "Content-Type": "application/json",
  Authorization: MONDAYTOKEN,
};

export async function sendToMonday(query, vars) {
  const url = new URL("https://api.monday.com/v2");
  const options = {
    method: "POST",
    headers,
    body: JSON.stringify({ query: query, variables: JSON.stringify(vars) }),
  };
  return await fetchJson(url, options, {});
}
