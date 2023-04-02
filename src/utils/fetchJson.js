import fetch from "node-fetch";
// does the fetching
export default async function fetchJson(url, options, onCancel, n = 5) {
  try {
    return (await fetch(url, options)).json();
  } catch (err) {
    if (n < 1) throw err;
    return setTimeout(() => fetchJson(url, options, onCancel, n - 1), 5000);
  }
}
