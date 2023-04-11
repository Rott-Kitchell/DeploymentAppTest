import statuses from "../../db/statuses.json" assert { type: "json" };
import BCToMondayOrderProcessor from "../../utils/BCToMondayProcessor.js";
import { BCToMondayStatusUpdate } from "../Monday/hooks.controller.js";
import hashChecker from "../../utils/hashChecker.js";
import BCOrderValidator from "../../utils/BCOrderValidator.js";
let statusMap = new Map();
statuses.map((stat) => {
  let { id, ...theRest } = stat;
  statusMap.set(id, theRest);
});

import { getOrderInfo } from "./hooks.service.js";

import asyncErrorBoundary from "../../errors/asyncErrorBoundary.js";
// const reservationValidator = require("../util/reservationValidator");
// const reservationsService = require("./reservations.service");

// async function reservationExists(req, res, next) {
//   const { reservationId } = req.params;
//   const reservation = await reservationsService.read(reservationId);
//   if (reservation) {
//     res.locals.reservation = reservation;
//     return next();
//   }
//   return next({
//     status: 404,
//     message: `Reservation ${reservationId} cannot be found.`,
//   });
// }

// function hasValidFields(req, res, next) {
//   const { data = {} } = req.body;

//   const invalidFields = reservationValidator(data);

//   if (invalidFields.length) {
//     return next({
//       status: 400,
//       message: `Invalid reservation field(s): ${invalidFields.join(", ")}`,
//     });
//   }

//   const reserveDate = new Date(
//       `${data.reservation_date} ${data.reservation_time} GMT-0500`
//     ),
//     start = new Date(`${data.reservation_date} 10:30:00 GMT-0500`),
//     end = new Date(`${data.reservation_date} 21:30:00 GMT-0500`);

//   const todaysDate = new Date();

//   if (reserveDate.getDay() === 2) {
//     return next({
//       status: 400,
//       message:
//         "Reservations cannot be made on a Tuesday (Restaurant is closed).",
//     });
//   }
//   if (reserveDate < todaysDate) {
//     return next({
//       status: 400,
//       message: "Reservations must be made in the future.",
//     });
//   }
//   if (
//     reserveDate.getTime() < start.getTime() ||
//     reserveDate.getTime() > end.getTime()
//   ) {
//     return next({
//       status: 400,
//       message: "Reservations cannot be made outside of 10:30am to 9:30pm.",
//     });
//   }

//   if (data.status && data.status !== "booked") {
//     return next({
//       status: 400,
//       message: `Status cannot be ${data.status}`,
//     });
//   }

//   next();
// }

export async function newOrderCreated({ data }) {
  let orderId = data.id;
  const fullOrder = await getOrderInfo(orderId);
  const invalidFields = BCOrderValidator(fullOrder);
  if (invalidFields.length > 0)
    // push status code
    throw new Error(`Invalid order field(s): ${invalidFields.join(", ")}`);
  console.log("Order created: " + fullOrder.id);
  BCToMondayOrderProcessor(fullOrder);
}

async function BCOrderHook(req, res) {
  let order = req.body;
  console.log("BCOrderHook: " + JSON.stringify(order));
  // checks if this particular event has been sent recently by checking the hash
  if (hashChecker(order.hash)) return res.status(200).send();
  // flip these scopes**
  if (order.scope == "store/order/statusUpdated") {
    console.log("Status Updated");
    orderStatusUpdated(order);
  } else if (order.scope == "store/order/created") {
    console.log("New Order created");
    newOrderCreated(order);
  } else {
    console.log(order.scope);
  }
  //BC always needs a 200 status back or it will retry to send the data in intervals and eventually close the webhook. https://developer.bigcommerce.com/api-docs/store-management/webhooks/about-webhooks
  res.status(200).send();
}

function orderStatusUpdated(order) {
  let orderId = order.data.id;
  let previous_status_id = order.data.status.previous_status_id;
  let new_status_id = order.data.status.new_status_id;
  let orderStatusLog = `Order ${orderId} changed from ${
    statusMap.get(previous_status_id).name
  } to ${statusMap.get(new_status_id).name}!`;
  console.log(orderStatusLog);
  // sends orderId and new staus name to Monday/hooks.controller
  BCToMondayStatusUpdate(orderId, statusMap.get(new_status_id).name);
}

// async function update(req, res, next) {
//   const { data } = req.body;
//   const { reservation } = res.locals;

//   const updatedRes = {
//     ...reservation,
//     ...data,
//   };

//   const newData = await reservationsService.update(updatedRes);

//   res.status(200).json({ data: newData });
// }

export default asyncErrorBoundary(BCOrderHook);
