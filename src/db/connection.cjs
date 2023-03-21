const environment = process.env.NODE_ENV || "development";
const config = require("../../knexfile.cjs")[environment];
const knex = require("knex")(config);

module.exports = knex;
