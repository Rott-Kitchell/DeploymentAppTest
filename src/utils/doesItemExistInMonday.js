import { sendToMonday } from "../routes/Monday/hooks.service.js";

export default function doesItemExistMonday(orderId) {
  let query =
    'query ($orderId: String!) { items_by_column_values (board_id: 4218719774, column_id: "dup__of_order__", column_value: $orderId) { id }}';
  let vars = {
    orderId: orderId.toString(),
  };
  sendToMonday(query, vars).then(({ data: { items_by_column_values } }) => {
    console.log("did Monday item exist?", items_by_column_values.length > 0);
    return items_by_column_values.length <= 0;
  });
}