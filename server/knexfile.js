require("dotenv").config()

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {
  development: {
    client: process.env.DB_CLIENT,
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
    },
    log: {
      warn: (message) => {
        // Hiding this message
        // https://github.com/knex/knex/issues/3158
        if (message === '.returning() is not supported by mysql and will not have any effect.') {
          return;
        }
        console.warn(message);
      },
    },
  },
  test: {
    client: process.env.DB_CLIENT,
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
    },
    log: {
      warn: (message) => {
        // Hiding this message
        // https://github.com/knex/knex/issues/3158
        if (message === '.returning() is not supported by mysql and will not have any effect.') {
          return;
        }
        console.warn(message);
      },
    },
  }
};