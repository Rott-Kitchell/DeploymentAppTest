import statuses from "../../db/statuses.json" assert { type: "json" };
let statusMap = new Map();
statuses.map((stat) => {
  let { id, ...theRest } = stat;
  statusMap.set(id, theRest);
});

import { sendToMonday } from "./hooks.service.js";
import { MONDAYBOARDID } from "../../../config.js";
import { newOrderCreated } from "../BChooks/hooks.controller.js";
import doesItemExistInMonday from "../../utils/doesItemExistInMonday.js";

export async function BCToMondayStatusUpdate(orderId, status, created_at, res) {
  console.log("BCToMondayStatusUpdate", orderId.toString(), status, created_at);
  let doesItExist = await doesItemExistInMonday(orderId);
  console.log("checking ", doesItExist);
  if (doesItExist) {
    console.log(
      `doesItExist.updated_at > created_at: ${doesItExist[1]} > ${new Date(
        created_at * 1000
      ).toJSON()} = ${
        new Date(doesItExist[1]).getTime() >
        new Date(created_at * 1000).getTime()
      })
      }`
    );
    if (
      new Date(doesItExist[1]).getTime() > new Date(created_at * 1000).getTime()
    ) {
      console.log("BCToMondayStatusUpdate: This is old news!");
      res.status(200).send();
      return;
    }
    let query =
        "mutation ($boardId: Int!, $itemId: Int!, $colId: String! $colValue: String!) { change_simple_column_value (board_id: $boardId, item_id: $itemId, column_id: $colId, value: $colValue) { id }}",
      vars = {
        boardId: parseInt(MONDAYBOARDID),
        itemId: parseInt(doesItExist[0]),
        colId: "status",
        colValue: status,
      };
    res.status(200).send();
    sendToMonday(query, vars).then(console.log);
  } else {
    console.log("This order doesn't exist on our end yet, rerouting...");
    let order = { data: { id: orderId } };
    newOrderCreated(order, res);
  }
}

export async function newOrderFromBCToMonday(
  orderId,
  status,
  contact,
  dateCreated,
  dateModified,
  { shipping_method, ...shippingInfo } = shippingInfo,
  products,
  staffNotes,
  customerMessage,
  res
) {
  let doesItExist = await doesItemExistInMonday(orderId);
  console.log("checking ", doesItExist);
  if (!doesItExist) {
    let address = [
      shippingInfo.full_name,
      shippingInfo.company,
      shippingInfo.street_1,
      shippingInfo.street_2,
      shippingInfo.city,
      shippingInfo.state,
      shippingInfo.zip,
      shippingInfo.county,
    ]
      .filter((el) => el != "")
      .join(" ");

    let query =
      "mutation ($boardId: Int!, $myItemName: String!, $columnVals: JSON!){ create_item (board_id:$boardId, item_name:$myItemName, column_values:$columnVals) { id } }";
    let vars = {
      boardId: parseInt(MONDAYBOARDID),
      myItemName: `Order #${orderId} - ${contact.company ?? contact.full_name}`,
      columnVals: JSON.stringify({
        dup__of_order__: orderId,
        status: status,
        date4: {
          date: dateCreated.dateCreatedDate,
          time: dateCreated.dateTime,
        },
        text7: contact.company,
        shipping_address8: address,
        text58: shipping_method,
        text6: staffNotes,
        text0: contact.full_name,
        text3: customerMessage,
        date0: {
          date: dateModified.dateModifiedDate,
          time: dateModified.dateTime,
        },
      }),
    };
    sendToMonday(query, vars)
      .then(
        ({
          data: {
            create_item: { id },
          },
        }) => {
          products.forEach((prod) => {
            let prodQuery =
              "mutation ($parentItemID: Int!, $myItemName: String!, $columnVals: JSON!){ create_subitem (parent_item_id:$parentItemID, item_name:$myItemName, column_values:$columnVals) { id board { id }}}";
            let prodVars = {
              parentItemID: parseInt(id),
              myItemName: prod.name,
              columnVals: JSON.stringify({
                dup__of_prod_id: parseInt(prod.product_id),
                quantity3: prod.quantity,
                dup__of_sku: prod.sku,
              }),
            };
            sendToMonday(prodQuery, prodVars);
          });
        }
      )
      .catch((err) => {
        throw new Error(err.message);
      });
    console.log("New Order added!");
    res.status(200).send();
  } else {
    res.status(400).send({
      message: "This order already exists on our end",
    });
  }
}
