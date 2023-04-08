import { sendToMonday } from "../routes/Monday/hooks.service.js";
import { MONDAYBOARDID } from "../../config.js";

export default function doesItemExistMonday(orderId) {
  let query =
    'query ($boardId: Int!, $orderId: String!) { items_by_column_values (board_id: $boardId, column_id: "dup__of_order__", column_value: $orderId) { id }}';
  let vars = {
    boardId: MONDAYBOARDID,
    orderId: orderId.toString(),
  };
  // query that checks if an item with the orderId exists in Monday and returns a boolean value
  sendToMonday(query, vars).then(({ data: { items_by_column_values } }) => {
    console.log("did Monday item exist?", items_by_column_values.length > 0);
    return items_by_column_values.length <= 0;
  });
}
