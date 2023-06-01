import kitSKUs from "../db/kits.json" assert { type: "json" };
import { FromBCToMonday } from "../routes/Monday/hooks.controller.js";

export default function BCToMondayOrderProcessor(
  {
    id,
    date_created,
    date_modified,
    status,
    billing_address: { first_name: bFirst, last_name: bLast, company },
    shipping_addresses,
    products,
    staff_notes,
    customer_message,
  },
  res
) {
  //What Monday needs from order:
  //Order Number
  const orderId = id;
  // Billing Company/Customer Name
  let contact = { full_name: bFirst + " " + bLast, company: company };
  // date and time
  let dateCreated = new Date(date_created).toJSON(),
    dateCreatedTime = dateCreated.substring(
      dateCreated.indexOf("T") + 1,
      dateCreated.indexOf(".")
    ),
    dateCreatedDate = dateCreated.substring(0, dateCreated.indexOf("T"));
  let dateModified = new Date(date_modified).toJSON(),
    dateModifiedTime = dateModified.substring(
      dateModified.indexOf("T") + 1,
      dateModified.indexOf(".")
    ),
    dateModifiedDate = dateModified.substring(0, dateModified.indexOf("T"));

  console.log("Date Created: ", dateCreatedTime, dateCreatedDate);
  console.log("Date Modified: ", dateModifiedTime, dateModifiedDate);

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
  FromBCToMonday(
    orderId,
    status,
    contact,
    (dateCreated = { dateCreatedTime, dateCreatedDate }),
    (dateModified = { dateModifiedTime, dateModifiedDate }),
    shippingAddInfo,
    mergedProducts,
    staff_notes,
    customer_message,
    res
  );
}
