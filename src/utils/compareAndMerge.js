import _ from "lodash";

export default function (BCvars, BCProducts, oldOrder) {
  let oldProds = oldOrder.subitems.reduce((acc, prod) => {
    let reduced = prod.column_values.reduce((acc2, val) => {
      return {
        ...acc2,
        [val.id]:
          !isNaN(val.text) && !isNaN(_.toNumber(val.text))
            ? _.toNumber(val.text)
            : val.text,
      };
    }, []);

    return [
      ...acc,
      {
        subitem_id: prod.id,
        parent_item_id: prod.board.id,

        name: prod.name,
        product_id: reduced.dup__of_prod_id,
        quantity: reduced.quantity3,
        sku: reduced.dup__of_sku,
        status: reduced.status,

        // ...prod.column_values.reduce((acc2, val) => {
        //   return {
        //     ...acc2,
        //     [val.id]:
        //       !isNaN(val.text) && !isNaN(_.toNumber(val.text))
        //         ? _.toNumber(val.text)
        //         : val.text,
        //   };
        // }, []),
      },
    ];
  }, []);

  let oldColVals = oldOrder.column_values.reduce((acc, prod, i) => {
    if (prod.id === "subitems" || prod.id === "subitems_status") return acc;
    acc[prod.id] = JSON.parse(prod.value);
    return acc;
  });
  delete oldColVals.id;
  delete oldColVals.text;
  delete oldColVals.value;

  let newColVals = _.merge(oldColVals, JSON.parse(BCvars.columnVals));
  let newProdVals = _.merge(oldProds, BCProducts);

  return {
    boardId: BCvars.boardId,
    itemId: _.toNumber(oldOrder.id),
    columnVals: JSON.stringify({
      name: BCvars.myItemName,
      ...newColVals,
    }),
    subitems: newProdVals,
  };
}
