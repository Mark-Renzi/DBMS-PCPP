const { Pool } = require('pg');
const fs = require('fs');
require('dotenv').config();

let db = new Pool({
    user: process.env.DB_USERNAME,
    host: process.env.DB_ENDPOINT,
    password: process.env.DB_PASSWORD,
    port: 5432,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
    ssl: {
        rejectUnauthorized: false,
        ca: [fs.readFileSync('./config/rds-ca-2019-root.pem')],
    }
});

db.on('connect', client => {
    console.log('connected to database');
});

module.exports = db;