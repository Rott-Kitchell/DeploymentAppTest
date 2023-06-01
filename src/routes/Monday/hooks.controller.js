import { sendToMonday } from "./hooks.service.js";
import { MONDAYBOARDID } from "../../../config.js";
import doesItemExistInMonday from "../../utils/doesItemExistInMonday.js";
import compareAndMerge from "../../utils/compareAndMerge.js";

export async function FromBCToMonday(
  orderId,
  status,
  contact,
  dateCreated,
  dateModified,
  { shipping_method, ...shippingInfo } = shippingInfo,
  mergedProducts,
  staffNotes,
  customerMessage,
  res
) {
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
  let vars = {
    boardId: parseInt(MONDAYBOARDID),
    myItemName: `Order #${orderId} - ${contact.company ?? contact.full_name}`,
    columnVals: JSON.stringify({
      dup__of_order__: orderId,
      status: status,
      date4: {
        date: dateCreated.dateCreatedDate,
        time: dateCreated.dateCreatedTime,
      },
      text7: contact.company,
      shipping_address8: address,
      text58: shipping_method,
      text6: staffNotes,
      text0: contact.full_name,
      text3: customerMessage,
      date0: {
        date: dateModified.dateModifiedDate,
        time: dateModified.dateModifiedTime,
      },
    }),
  };
  let doesItExist = await doesItemExistInMonday(orderId);
  if (!doesItExist.data.items_by_column_values[0]) {
    let query =
      "mutation ($boardId: Int!, $myItemName: String!, $columnVals: JSON!){ create_item (board_id:$boardId, item_name:$myItemName, column_values:$columnVals) { id } }";

    sendToMonday(query, vars)
      .then(
        ({
          data: {
            create_item: { id },
          },
        }) => {
          mergedProducts.forEach((prod) => {
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
  } else {
    let mergedVars = compareAndMerge(
      vars,
      mergedProducts,
      doesItExist.data.items_by_column_values[0]
    );
    console.log(mergedVars);

    let query =
      "mutation ($boardId: Int!, $itemId: Int!, $columnVals: JSON!) { change_multiple_column_values (board_id: $boardId, item_id: $itemId, column_values: $columnVals) { id } }";

    sendToMonday(query, mergedVars)
      .then((resback) => {
        console.log(resback);
        mergedVars.subitems.forEach((prod) => {
          console.log(
            "🚀 ~ file: hooks.controller.js:104 ~ mergedVars.subitems.forEach ~ prod:",
            prod
          );

          let prodQuery =
            "mutation ($boardId: Int!, $itemId: Int!, $columnVals: JSON!) { change_multiple_column_values (board_id: $boardId, item_id: $itemId, column_values: $columnVals) { id } }";
          let prodVars = {
            boardId: Number(prod.parent_item_id),
            itemId: Number(prod.subitem_id),
            columnVals: JSON.stringify({
              name: prod.name,
              dup__of_prod_id: prod.product_id,
              quantity3: prod.quantity,
              dup__of_sku: prod.sku,
              status: prod.status,
            }),
          };
          sendToMonday(prodQuery, prodVars);
        });
      })
      .catch((err) => {
        throw new Error(err.message);
      });
  }
  res.status(200).send();
}
