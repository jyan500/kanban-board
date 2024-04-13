require("dotenv").config()

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {
  development: {
    client: "mysql",
    connection: {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    },
    seeds: {
    	directory: "./db/seeds"
    },
    migrations: {
      directory: "./db/migrations",
    }
  },
  test: {
    client: "mysql",
    connection: {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME_TEST,
    },
    seeds: {
    	directory: "./db/seeds"
    },
    migrations: {
      directory: "./db/migrations",
    }
  }
};