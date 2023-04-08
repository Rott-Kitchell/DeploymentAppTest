import kitSKUs from "../db/kits.json" assert { type: "json" };
import { newOrderFromBCToMonday } from "../routes/Monday/hooks.controller.js";

export default function BCToMondayOrderProcessor({
  id,
  date_created,
  status,
  billing_address: { first_name: bFirst, last_name: bLast, company },
  shipping_addresses,
  products,
  staff_notes,
  customer_message,
}) {
  //What Monday needs from order:
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
    country,
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
    country,
    shipping_method,
  }))(shipping_addresses[0]);
  shippingAddInfo = {
    ...shippingAddInfo,
    full_name: `${shippingAddInfo.first_name} ${shippingAddInfo.last_name}`,
  };
  delete shippingAddInfo.first_name;
  delete shippingAddInfo.last_name;

  //Products
  const kits = new Set(kitSKUs);
  let mergedProducts = products.reduce((acc, prod) => {
    // remove kits
    if (kits.has(prod.sku)) return acc;
    let pId = prod.product_id;
    let index = acc.findIndex((obj) => obj.product_id === pId);
    if (index > -1) {
      acc[index].quantity = acc[index].quantity + prod.quantity;
    } else {
      // remove the extra 'kit' substrings
      if (prod.name[0] === "(") {
        prod.name = prod.name.replace(/(\s)?(\(.*?\))(\s)?/g, "");
      }
      acc = [
        ...acc,
        {
          product_id: prod.product_id,
          name: prod.name,
          quantity: prod.quantity,
          sku: prod.sku,
        },
      ];
    }
    return acc;
  }, []);
  //*Staff Notes
  //*Customer Comments
  newOrderFromBCToMonday(
    orderId,
    status,
    contact,
    (date = { dateTime: dateTime, dateDate: dateDate }),
    shippingAddInfo,
    mergedProducts,
    staff_notes,
    customer_message
  );
}
