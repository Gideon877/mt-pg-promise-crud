const express = require('express');
const PgPromise = require("pg-promise")

const auth = require("./src/middleware/auth");
const API = require('./api');
require('dotenv').config()

const app = express();
// enable the static folder...
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// import the dataset to be used
const garments = require('./garments.json');
const jwt = require('jsonwebtoken');
const DATABASE_URL = process.env.DATABASE_URL;
const pgp = PgPromise({});
const db = pgp(DATABASE_URL);

API(app, db);

const PORT = process.env.PORT || 4017;

// API routes

app.post('/api/login', (req, res) => {
    const { username } = req.body;
    if (username && username === 'Gideon877') {
        const token = jwt.sign({ username }, 'secret', { expiresIn: '1h'});
        
        res.json({
            token,
            username
        })

    } else {
        console.log('error');
        res.status(500).json({
            error: 'Username does not exist!'
        })
    }
})

// app.get('/api/garments', auth, (req, res) => {
//     const gender = req.query.gender;
//     const season = req.query.season;
//     console.log('-------------------');
//     const filteredGarments = garments.filter(garment => {
//         // if both gender & season was supplied
//         if (gender != 'All' && season != 'All') {
//             return garment.gender === gender
//                 && garment.season === season;
//         } else if (gender != 'All') { // if gender was supplied
//             return garment.gender === gender
//         } else if (season != 'All') { // if season was supplied
//             return garment.season === season
//         }
//         return true;
//     });

//     res.json({ garments: filteredGarments });

// });

// app.get('/api/garments/price/:price', auth, (req, res) => {
//     const maxPrice = Number(req.params.price);
//     const filteredGarments = garments.filter(garment => {
//         // filter only if the maxPrice is bigger than maxPrice
//         if (maxPrice > 0) {
//             return garment.price <= maxPrice;
//         }
//         return true;
//     });

//     res.json({
//         garments: filteredGarments
//     });
// });


// app.post('/api/garments', auth, (req, res) => {

//     // get the fields send in from req.body
//     const {
//         description,
//         img,
//         gender,
//         season,
//         price
//     } = req.body;

//     // add some validation to see if all the fields are there.
//     // only 3 fields are made mandatory here
//     // you can change that

//     if (!description || !img || !price) {
//         let message = 'Required data not supplied';

//         if (!description && img && price) {
//             message = 'Description data not supplied'
//         }

//         if (description && !img && price) {
//             message = 'Image data not supplied'
//         }

//         if (description && img && !price) {
//             message = 'Price data not supplied'
//         }

//         res.json({
//             status: 'error',
//             message,
//         });
//     } else {

//         // you can check for duplicates here using garments.find
//         const check = garments.find(item =>
//             item.description === description
//             && item.img === img
//             && item.price === price
//         );

//         if (check === undefined) {
//             // add a new entry into the garments list
//             garments.push({
//                 description,
//                 img,
//                 gender,
//                 season,
//                 price
//             });

//             res.json({
//                 status: 'success',
//                 message: 'New garment added.',
//             });
//         } else {
//             res.json({
//                 status: 'error',
//                 message: 'Garment already exist! Please add a new one.',
//             });
//         }


//     }

// });


app.listen(PORT, function () {
    console.log(`App started on port ${PORT}`)
});