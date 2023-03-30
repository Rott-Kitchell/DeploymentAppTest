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

export function BCToMondayOrderProcessor({
  id,
  date_created,
  billing_address: { first_name: bFirst, last_name: bLast, company },
  shipping_addresses,
  products,
  staff_notes,
  customer_message,
}) {
  //What I need from order:
  //Order Number
  const orderId = id;
  // Billing Company/Customer Name
  let contact = { full_name: bFirst + " " + bLast, company: company };
  // date and time
  let date = new Date(date_created).toJSON(),
    dateTime = date.substring(date.indexOf("T") + 1, date.indexOf(".")),
    dateDate = date.substring(0, date.indexOf("T"));
  //shipping address/es w/ names

  let shippingAddInfo = (({
    first_name,
    last_name,
    company,
    street_1,
    street_2,
    city,
    state,
    zip,
    // Shipping Method
    shipping_method,
  }) => ({
    first_name,
    last_name,
    company,
    street_1,
    street_2,
    city,
    state,
    zip,
    shipping_method,
  }))(shipping_addresses[0]);
  shippingAddInfo = {
    ...shippingAddInfo,
    full_name: `${shippingAddInfo.first_name} ${shippingAddInfo.last_name}`,
  };
  delete shippingAddInfo.first_name, shippingAddInfo.last_name;
  
  //Products
  let mergedProducts = products.reduce((acc, prod) => {
    // remove kits
    if (kits.has(prod.sku)) return acc;
    let pId = prod.product_id;
    let index = acc.findIndex((obj) => obj.product_id === pId);
    if (index > -1) {
      acc[index].quantity =
        acc[index].quantity + prod.quantity;
    } else {
      // remove the extra 'kit' substrings
      if (prod.name[0] === "(")
        prod.name = prod.name.replace(
          /(\s)?(\(.*?\))(\s)?/g,
          ""
        );
      acc = [...acc, prod];
    }
    return acc;
  }, []);
  console.log(mergedProducts, 
  //*Staff Notes
  //*Customer Comments
}
