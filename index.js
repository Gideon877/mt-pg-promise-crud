const express = require('express');
const PgPromise = require("pg-promise")
const {ConnectionString} = require('connection-string');
const API = require('./src/api');
require('dotenv').config()

const app = express();
// enable the static folder...
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const DATABASE_URL = process.env.DATABASE_URL;
const cs = new ConnectionString(DATABASE_URL);

const getPSQLConnection = () => {
    return {
        host: cs.hostname,
        port: cs.port,
        database: cs.path?.[0],
        user: cs.user,
        password: cs.password,
        ssl: DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false },
        application_name: cs.params?.application_name
    };
}



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