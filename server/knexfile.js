require("dotenv").config()

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {
  production: {
    client: process.env.DB_CLIENT,
    connection: process.env.DATABASE_URL,
    seeds: {
      directory: "./db/seeds"
    },
    migrations: {
      directory: "./db/migrations",
    },
    pool: {
      afterCreate: function (conn, done) {
        conn.query('SET serial_normalization = "sql_sequence";', function (err) {
          if (err) {
            done(err, conn);
          } else {
            conn.query('SET default_int_size = 4;', function (err) {
              done(err, conn);
            });
          }
        });
      }
    }
  },
  development: {
    client: process.env.DB_CLIENT,
    connection: {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      charset: 'utf8mb4',
      // causes warning issues on mysql2 client
      // collate: 'utf8mb4_unicode_ci',
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
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
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