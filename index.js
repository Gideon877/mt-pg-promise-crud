require('dotenv').config()
const express = require('express');
const PgPromise = require("pg-promise")

const API = require('./src/api');
const app = express();
// enable the static folder...
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const DATABASE_URL = process.env.DATABASE_URL;

const pgp = PgPromise({});
const db = pgp({
    connectionString: DATABASE_URL,
    max: 30,
    ssl: {
        rejectUnauthorized: false
    }
});

API(app, db);

const PORT = process.env.PORT || 4017;

app.listen(PORT, function () {
    console.log(`App started on http://localhost:${PORT}`);
});