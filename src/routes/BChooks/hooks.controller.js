import statuses from "../../db/statuses.json" assert { type: "json" };
import BCToMondayProcessor from "../../utils/BCToMondayProcessor.js";
import { BCToMondayStatusUpdate } from "../Monday/hooks.controller.js";
import BCOrderValidator from "../../utils/BCOrderValidator.js";
let statusMap = new Map();
statuses.map((stat) => {
  let { id, ...theRest } = stat;
  statusMap.set(id, theRest);
});

import { getOrderInfo } from "./hooks.service.js";

import asyncErrorBoundary from "../../errors/asyncErrorBoundary.js";

export async function newOrderCreated({ data }, res) {
  let orderId = data.id;
  const fullOrder = await getOrderInfo(orderId);
  const invalidFields = BCOrderValidator(fullOrder);
  if (invalidFields.length > 0) {
    // push status code
    res.status(400).send();
    throw new Error(`Invalid order field(s): ${invalidFields.join(", ")}`);
  }
  console.log("Order created: " + fullOrder.id);
  BCToMondayProcessor(fullOrder, res);
}

async function BCOrderHook(req, res) {
  let order = req.body;
  console.log("BCOrderHook: " + JSON.stringify(order));
  if (order.scope == "store/order/statusUpdated") {
    console.log("Status Updated");
    orderStatusUpdated(order, res);
  } else if (order.scope == "store/order/created") {
    console.log("New Order created");
    newOrderCreated(order, res);
  } else {
    console.log(order.scope);
  }
}

function orderStatusUpdated(order, res) {
  let orderId = order.data.id;
  let previous_status_id = order.data.status.previous_status_id;
  let new_status_id = order.data.status.new_status_id;
  let orderStatusLog = `Order ${orderId} changed from ${
    statusMap.get(previous_status_id).name
  } to ${statusMap.get(new_status_id).name} at ${new Date(
    order.created_at * 1000
  )}!`;
  console.log(orderStatusLog);
  // sends orderId and new staus name to Monday/hooks.controller
  BCToMondayStatusUpdate(
    orderId,
    statusMap.get(new_status_id).name,
    order.created_at,
    res
  );
}

export default asyncErrorBoundary(BCOrderHook);
