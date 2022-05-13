const auth = require("./src/middleware/auth");

module.exports = function (app, db) {

	app.get('/api/test', function (req, res) {
		res.json({
			name: 'joe'
		});
	});

	app.get('/api/garments', auth, async function (req, res) {

		try {
			const { gender, season } = req.query;
			console.log(!gender);
			let garments = [];
			// add some sql queries that filter on gender & season
			if (!season && !gender) {
				garments = await db.many(`select * from garment`);
			}
			if (!gender && season) {
				garments = await db.many(`select * from garment where season = $1`, [season]);
			}
			if (gender && !season) {
				garments = await db.many(`select * from garment where gender = $1`, [gender]);
			}
			if (season && gender) {
				garments = await db.many(`select * from garment where gender = $1 and season = $2`, [gender, season]);
			}

			res.json({
				data: garments,
				garments
			})
		} catch (error) {
			console.log(error)
		}
	});

	app.put('/api/garment/:id', auth, async function (req, res) {

		try {

			// use an update query...

			const { id } = req.params;
			const garment = await db.oneOrNone(`select * from garment where id = $1`, [id]);

			// you could use code like this if you want to update on any column in the table
			// and allow users to only specify the fields to update
			let params = { ...garment, ...req.body };
			const { description, price, img, season, gender } = params;
			const sql = `update garment set description = $1, price = $2, img = $3, season = $4, gender = $5 where id = $6`
			await db.none(sql, [description, price, img, season, gender, id]);


			res.json({
				status: 'success'
			})
		} catch (err) {
			console.log(err);
			res.json({
				status: 'error',
				error: err.message
			})
		}
	});

	app.get('/api/garment/:id', auth, async function (req, res) {

		try {
			const { id } = req.params;
			// get the garment from the database
			const garment = await db.one(`select * from garment where id = $1`, [id])

			res.json({
				status: 'success',
				data: garment
			});

		} catch (err) {
			console.log(err);
			res.json({
				status: 'error',
				error: err.message
			})
		}
	});


	app.post('/api/garment/', auth, async function (req, res) {

		try {

			const { description, price, img, season, gender } = req.body;

			// insert a new garment in the database
			const sql = `insert into garment(description, price, img, season, gender) values ($1, $2, $3, $4, $5);`
			await db.none(sql, [description, price, img, season, gender])

			res.json({
				status: 'success',
			});

		} catch (err) {
			console.log(err);
			res.json({
				status: 'error',
				error: err.message
			})
		}
	});

	app.get('/api/garments/grouped', auth, async function (req, res) {
		// use group by query with order by asc on count(*)
		try {
			const result = await db.many(`select count(*), gender from garment group by gender order by gender desc`);
			res.json({
				data: result
			})
		} catch (error) {
			console.log(error)
		}
	});


	app.delete('/api/garments', auth, async function (req, res) {

		try {
			const { gender } = req.query;
			// delete the garments with the specified gender
			await db.none(`delete from garment where gender = $1`, [gender]);

			res.json({
				status: 'success'
			})
		} catch (err) {
			// console.log(err);
			res.json({
				status: 'success',
				error: err.stack
			})
		}
	});

	app.get('/api/garments/price/:price', auth, async (req, res) => {
		try {
			const maxPrice = Number(req.params.price);
			const garments = await db.many(`select * from garment where price >= $1`, [maxPrice]);
			res.json({
				garments
			});
		} catch (error) {
			res.json({
				status: 'failed',
				error: error.stack
			})
		}
	});



}