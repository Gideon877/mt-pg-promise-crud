const express = require('express');
const PgPromise = require("pg-promise")

const auth = require("./src/middleware/auth");
const API = require('./src/api');
require('dotenv').config()

const app = express();
// enable the static folder...
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// import the dataset to be used
const garments = require('./src/garments.json');
const DATABASE_URL = process.env.DATABASE_URL;
const pgp = PgPromise({});
const db = pgp(DATABASE_URL, {
    ssl: {
        rejectUnauthorized: false
    }
});

API(app, db);

const PORT = process.env.PORT || 4017;

app.listen(PORT, function () {
    console.log(`App started on http://localhost:${PORT}`);
});