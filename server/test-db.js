const knex = require("knex");
const knexFile = require("./knexfile.js");

const environment = "production"

const db = knex(knexFile[environment])

db.raw("SELECT 1")
  .then(() => {
    console.log("Connected to CockroachDB successfully!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Database connection failed:", err);
    process.exit(1);
  });
