import fetch from "node-fetch";
// does the fetching
export default async function fetchJson(url, options, onCancel) {
  try {
    let res = await fetch(url, options);
    return res.json();
  } catch (err) {
    console.error(err.stack);
  }
}
