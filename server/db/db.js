const knex = require("knex");
const knexFile = require("../knexfile.js");
const { attachPaginate } = require('knex-paginate');

const environment = process.env.NODE_ENV || "development"

module.exports = knex(knexFile[environment])

attachPaginate();
