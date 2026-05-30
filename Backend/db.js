// const { Pool } = require("pg");

// const pool = new Pool({
//   user: "postgres",
//   password: "1234",
//   host: "localhost",
//   port: 5432,
//   database: "quiz-app",
// });

// module.exports = pool;
const { Pool } = require("pg");

const pool = new Pool({
  user: "neondb_owner",
  password: "npg_JMp2PVU0kluK",
  host: "ep-holy-cell-apm1yacu.c-7.us-east-1.aws.neon.tech",
  database: "neondb",
  port: 5432,
  ssl: {
    rejectUnauthorized: false,
  },
});

module.exports = pool;