import fetch from "node-fetch";
// does the fetching
export default async function fetchJson(url, options, onCancel, n = 5) {
  try {
    let res = await fetch(url, options);
    return res.json();
  } catch (err) {
    console.error(err);
    if (n < 1) throw err;
    return setTimeout(() => fetchJson(url, options, onCancel, n - 1), 5000);
  }
}
