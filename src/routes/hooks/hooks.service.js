const { BCACCESSTOKEN, BCCLIENTID, BCSTOREHASH } = await import(
  "../../../config.js"
);

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
export async function updateBCHook(hookId, data) {
  console.log("update: ", hookId, data);
  const url = new URL(
    `https://api.bigcommerce.com/stores/${BCSTOREHASH}/v3/hooks/${hookId}`
  );
  const options = {
    method: "PUT",
    headers,
    body: JSON.stringify({ ...data }),
  };
  return await fetchJson(url, options, {});
}

// finds the current hooks associated to the BigCommerce store
export async function listBCHooks(signal) {
  const url = new URL(
    `https://api.bigcommerce.com/stores/${BCSTOREHASH}/v3/hooks`
  );
  return await fetchJson(url, { headers, signal }, {});
}
// finds the id of the hook
export function findBCHookID(data, scope) {
  console.log("find hookID", data, scope);
  return data.find(
    (hook) => hook.scope === scope && hook.client_id === BCCLIENTID
  ).id;
}
