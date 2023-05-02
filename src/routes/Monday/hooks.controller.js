let statuses = [
  {
    id: 0,
    name: "Incomplete",
  },
  {
    id: 1,
    name: "Pending",
  },
  {
    id: 2,
    name: "Shipped",
  },
  {
    id: 3,
    name: "Partially Shipped",
  },
  {
    id: 4,
    name: "Refunded",
  },
  {
    id: 5,
    name: "Cancelled",
  },
  {
    id: 6,
    name: "Declined",
  },
  {
    id: 7,
    name: "Awaiting Payment",
  },
  {
    id: 8,
    name: "Awaiting Pickup",
  },
  {
    id: 9,
    name: "Awaiting Shipment",
  },
  {
    id: 10,
    name: "Completed",
    system_label: "Completed",
  },
  {
    id: 11,
    name: "Awaiting Fulfillment",
  },
  {
    id: 12,
    name: "Manual Verification Required",
  },
  {
    id: 13,
    name: "Disputed",
  },
  {
    id: 14,
    name: "Partially Refunded",
  },
];
let statusMap = new Map();
statuses.map((stat) => {
  let { id, ...theRest } = stat;
  statusMap.set(id, theRest);
});

import { sendToMonday } from "./hooks.service.js";
import { newOrderCreated } from "../BChooks/hooks.controller.js";
import { MONDAYBOARDID } from "../../../config.js";
import asyncErrorBoundary from "../../errors/asyncErrorBoundary.js";
import doesItemExistInMonday from "../../utils/doesItemExistInMonday.js";
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

export async function BCToMondayStatusUpdate(orderId, status) {
  console.log("BCToMondayStatusUpdate", orderId.toString(), status);
  let doesItExist = await doesItemExistInMonday(orderId);
  console.log("checking ", doesItExist);
  if (doesItExist) {
    let query =
        "mutation ($boardId: Int!, $itemId: Int!, $colId: String! $colValue: String!) { change_simple_column_value (board_id: $boardId, item_id: $itemId, column_id: $colId, value: $colValue) { id }}",
      vars = {
        boardId: parseInt(MONDAYBOARDID),
        itemId: parseInt(doesItExist),
        colId: "status",
        colValue: status,
      };
    sendToMonday(query, vars).then(console.log);
  } else {
    throw new Error("Order is not in Monday!");
  }
}

export async function newOrderFromBCToMonday(
  orderId,
  status,
  contact,
  date,
  { shipping_method, ...shippingInfo } = shippingInfo,
  products,
  staffNotes,
  customerMessage
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

  let query =
    "mutation ($boardId: Int!, $myItemName: String!, $columnVals: JSON!){ create_item (board_id:$boardId, item_name:$myItemName, column_values:$columnVals) { id } }";
  let vars = {
    boardId: parseInt(MONDAYBOARDID),
    myItemName: `Order #${orderId} - ${contact.company ?? contact.full_name}`,
    columnVals: JSON.stringify({
      dup__of_order__: orderId,
      status: status,
      date4: { date: date.dateDate, time: date.dateTime },
      text7: contact.company,
      shipping_address8: address,
      text58: shipping_method,
      text6: staffNotes,
      text0: contact.full_name,
      text3: customerMessage,
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
}

// async function BCOrderHook(req, res) {
//   let order = req.body;

//   if (order.scope == "store/order/statusUpdated") {
//     console.log("Status Updated");
//     orderStatusUpdated(order);
//   } else if (order.scope == "store/order/created") {
//     console.log("New Order created");
//     newOrderCreated(order);
//   } else {
//     console.log(order.scope);
//   }
//   res.status(200).send();
// }

// function orderStatusUpdated(order) {
//   let orderId = order.data.id;
//   let previous_status_id = order.data.status.previous_status_id;
//   let new_status_id = order.data.status.new_status_id;
//   let orderStatus = `Order ${orderId} changed from ${
//     statusMap.get(previous_status_id).name
//   } to ${statusMap.get(new_status_id).name}!`;
//   console.log(orderStatus);
//   return { orderStatus: orderStatus };
// }

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

//export default newOrderFromBCToMonday;
