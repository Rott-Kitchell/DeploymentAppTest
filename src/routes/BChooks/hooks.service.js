const { BCACCESSTOKEN, BCCLIENTID, BCSTOREHASH } = await import(
  "../../../config.js"
);
import fetchJson from "../../utils/fetchJson.js";
const headers = {
  "Content-Type": "application/json",
  "X-Auth-Token": BCACCESSTOKEN,
  Accept: "application/json",
};

// whenever you start the app, it will update the BigCommerce hook with the new tunnel address (this will be deleted eventually, only for testing purposes)
export async function updateBCHook(hookId, data) {
  console.log("update: ", hookId, data);
  let url = hookId
    ? new URL(
        `https://api.bigcommerce.com/stores/${BCSTOREHASH}/v3/hooks/${hookId}`
      )
    : new URL(`https://api.bigcommerce.com/stores/${BCSTOREHASH}/v3/hooks`);

  const options = {
    method: "PUT",
    headers,
    body: JSON.stringify({ ...data }),
  };
  return await fetchJson(url, options, {});
}

// finds the current hooks associated to the BigCommerce store
export async function listBCHooks() {
  const url = new URL(
    `https://api.bigcommerce.com/stores/${BCSTOREHASH}/v2/hooks`
  );
  return await fetchJson(url, { headers }, {});
}
// finds the id of the hook
export function findBCHookID(data, scope) {
  console.log("find hookID", data, scope);
  return data.find(
    (hook) => hook.scope === scope && hook.client_id === BCCLIENTID
  ).id;
}

export async function getOrderInfo(orderId) {
  const orderUrl = new URL(
      `https://api.bigcommerce.com/stores/${BCSTOREHASH}/v2/orders/${orderId}`
    ),
    shippingUrl = new URL(
      `https://api.bigcommerce.com/stores/${BCSTOREHASH}/v2/orders/${orderId}/shipping_addresses`
    ),
    productsUrl = new URL(
      `https://api.bigcommerce.com/stores/${BCSTOREHASH}/v2/orders/${orderId}/products`
    );

  return await Promise.all([
    await fetchJson(orderUrl, { headers }, {}),
    await fetchJson(shippingUrl, { headers }, {}),
    await fetchJson(productsUrl, { headers }, {}),
  ]).then((result) => {
    let main = result.find((x) => !Array.isArray(x)),
      shipping_addresses = result.find(
        (x) => Array.isArray(x) && x[0].street_1
      ),
      products = result.find((x) => Array.isArray(x) && x[0].product_id);
    return {
      ...main,
      shipping_addresses: shipping_addresses,
      products: products,
    };
  });
}
