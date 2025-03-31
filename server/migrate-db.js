// code from: https://github.com/cockroachlabs/example-app-node-knex/blob/main/app.js

const knex = require("knex");
const knexFile = require("./knexfile.js");

const environment = process.env.NODE_ENV || "development"
const db = knex(knexFile[environment])

async function initTable(client) {
  await client.migrate.latest();
}

(async () => {
  // Prevent knex migration framework from running
  // schema changes in a transaction
  await db.raw("SET autocommit_before_ddl = true");

  // Initialize table in without using a transaction,
  // since it involves schema changes.
  console.log("Running migrations...");
  await initTable(db);

  // Exit program
  process.exit();
})().catch((err) => console.log(err.stack));
