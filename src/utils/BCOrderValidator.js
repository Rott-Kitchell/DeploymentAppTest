export default function BCOrderValidator(data) {
  const {
    id,
    date_created,
    status,
    billing_address: { first_name: bFirst, last_name: bLast, company },
    shipping_addresses,
    products,
  } = data;
  const data2 = {
    id,
    date_created,
    status,
    bFirst,
    bLast,
    company,
    shipping_addresses,
    products,
  };
  const dataMap = new Map(Object.entries(data2));
  const dataKeys = Object.keys(data2);
  const invalidFields = [];

  const validFields = new Set([
    "id",
    "date_created",
    "status",
    "bFirst",
    "bLast",
    "company",
    "shipping_addresses",
    "products",
  ]);

  dataMap.forEach((value, key) => {
    if (value === "" || value === undefined || !validFields.has(key)) {
      invalidFields.push(key);
    }
  });
  console.log("validator, after value check", invalidFields);

  validFields.forEach((field) => {
    if (!dataKeys.includes(field) && !invalidFields.includes(field))
      invalidFields.push(field);
  });
  console.log("validator, after fields check", invalidFields);
  if (
    dataMap.get("products").length <= 0 ||
    !Array.isArray(dataMap.get("products"))
  ) {
    if (!invalidFields.includes("products")) invalidFields.push("products");
  }
  console.log("validator, after products check", invalidFields);
  return invalidFields;
}
