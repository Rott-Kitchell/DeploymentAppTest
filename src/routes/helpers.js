import fetch from "node-fetch";
// does the fetching
export async function fetchJson(url, options, onCancel) {
  try {
    const response = await fetch(url, options);
    const payload = await response.json();
    if (payload.error) {
      return Promise.reject({ message: payload.error });
    }
    return payload;
  } catch (error) {
    if (error.name !== "AbortError") {
      console.error(error.stack);
      throw error;
    }
    return Promise.resolve(onCancel);
  }
}

export function BCToMondayOrderProcessor(fullOrder) {
  console.log("BCToMondayOrderProcessor", fullOrder);
}
