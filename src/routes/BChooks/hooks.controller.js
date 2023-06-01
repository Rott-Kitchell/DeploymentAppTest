import BCToMondayProcessor from "../../utils/BCToMondayProcessor.js";

import { getOrderInfo } from "./hooks.service.js";

import asyncErrorBoundary from "../../errors/asyncErrorBoundary.js";

export async function orderUpdated({ data }, res) {
  let orderId = data.id;
  const fullOrder = await getOrderInfo(orderId);
  BCToMondayProcessor(fullOrder, res);
}

async function BCOrderHook(req, res) {
  let order = req.body;
  console.log("BCOrderHook: " + JSON.stringify(order));
  if (order.scope == "store/order/statusUpdated") {
    console.log(
      `*~*~*~*~*~*Order ${order.data.id} is being updated!*~*~*~*~*~*`
    );
    orderUpdated(order, res);
  } else {
    res.status(200).send();
    console.log(order.scope);
  }
}

export default asyncErrorBoundary(BCOrderHook);
