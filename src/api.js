const auth = require("./middleware/auth");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
module.exports = async (app, db) => {

	const CartStatus = {
		Open: 'OPEN',
		Closed: 'CLOSED'
	}

	const createDefaultCart = async (userId) => await db.none('insert into cart (user_id) values ($1)', [userId]);

	const getUserCart = async (userId) => {
		let cart = await db.oneOrNone(`select * from cart where status = 'OPEN' AND user_id = $1`, [userId]);
		if (cart == null) {
			await createDefaultCart(userId);
			cart = await db.oneOrNone(`select * from cart where status = 'OPEN' AND user_id = $1`, [userId]);
		}
		const sql = `select * from garment_cart 
						join garment on garment.id = garment_id
						where cart_id = $1 order by description asc`
		const cartItems = await db.manyOrNone(sql, [cart.id]);
		return {
			...cart,
			cartItems
		}

	}

	const createReceipt = async ({ garmentCartIds, userId, accountId }) => {
		const sql = `insert into garment_receipt (garment_cart_id, user_id, account_id) values($1, $2, $3)`;
		await garmentCartIds.forEach(async (item) => {
			await db.none(sql, [item.id, userId, accountId]);
			// await db.none('update garment_cart set status')
		});


	}

	const userAccount = async (userId) => await db.oneOrNone('select * from account where user_id = $1', [userId]);

	const updateAccountBalance = async ({ accountId, balance }) => await db.none('update account set balance = balance - $1 where id = $2', [balance, accountId]);

	const getUserId = async (username) => await db.oneOrNone('select id from users where username = $1', [username], r => r.id);
	// console.log(await getUserId('johnsmith'))
	const getTotal = async (req, res) => {
		const result = await db.one('select count(*) from garment');
		return result.count;
	}

	app.get('/api/test', (req, res) => {
		res.json({
			name: 'joe'
		});
	});

	const getCartTotal = async (userId) => {
		const cart = await getUserCart(userId)
		const sum = _.sumBy(cart.cartItems, (item) => item.qty * item.price);
		return sum;
	}

	const getGarmentCartId = async (cartId) => {
		return await db.manyOrNone('select id from garment_cart where cart_id = $1', [cartId], r => r.id)
	}

	// API routes

	app.post('/api/login', async (req, res) => {
		try {
			const { username, password } = req.body;
			const user = await db.oneOrNone(`select * from users where username = $1`, [username]);
			if (username && user.username) {
				const isEqual = await bcrypt.compare(password, user.password);
				if (!isEqual) {
					throw new Error('Password is incorrect!');
				}
				const token = jwt.sign({ username }, 'secret', { expiresIn: '5h' });

				res.status(200).json({
					token,
					user: {
						firstName: user.first_name,
						lastName: user.last_name,
						username: user.username,
						id: user.id
					},
					cart: await getUserCart(user.id)
				})

			} else {
				res.status(501).json({})
			}
		} catch (error) {
			console.error(error)
			res.status(501).json(error)
		}
	})


	app.get('/api/garments', auth, async (req, res) => {

		let garments = [];
		const count = await getTotal() || 10;
		try {
			const { gender, season, page = 1, username } = req.query;
			const userId = await getUserId(username)
			const limit = Number(count / 3).toFixed();
			let offset = (page - 1) * limit + 1;
			offset = (offset == 1) ? 0 : offset;

			if (!season && !gender) {
				garments = await db.many(`select * from garment limit $1 offset $2`, [limit, offset]);
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
				garments,
				count,
				cart: await getUserCart(await getUserId(username)),
				account: await userAccount(userId)
			})
		} catch (error) {
			console.log(error)
			res.json({
				data: garments,
				count,
				garments
			})
		}
	});

	app.put('/api/garment/:id', auth, async (req, res) => {

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

	app.get('/api/garment/:id', auth, async (req, res) => {

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


	app.post('/api/garment/', auth, async (req, res) => {

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

	app.get('/api/garments/grouped', auth, async (req, res) => {
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


	app.delete('/api/garments/:id', auth, async (req, res) => {

		try {
			const { id } = req.params;
			// delete the garments with the specified id
			await db.none(`delete from garment where id = $1`, [id]);

			res.json({
				status: 'success'
			})
		} catch (err) {
			// console.log(err);
			res.json({
				status: 'failed',
				error: err.stack
			})
		}
	});

	app.get('/api/garments/price/:price', auth, async (req, res) => {
		try {
			const maxPrice = Number(req.params.price);
			const garments = await db.many(`select * from garment where price <= $1`, [maxPrice]);
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

	app.post('/api/user', async (req, res) => {
		try {
			const { username, password, firstName, lastName } = req.body;
			const existingUser = await db.oneOrNone(`select * from users where username = $1`, [username]);
			if (existingUser !== null) {
				throw new Error('A user with the same username already exists. Specify another username.')
			}
			const hashedPassword = await bcrypt.hash(password, 16);

			await db.none(`insert into users (username, password, first_name, last_name) values($1, $2, $3, $4)`, [username, hashedPassword, firstName, lastName]);
			res.status(200).json({});

		} catch (error) {
			console.log(error);
			res.status(501).json({
				status: 'failed',
				error: error.stack
			})
		}
	})


	app.post('/api/cartItem', async (req, res) => {
		try {
			const { garmentId, cartId, type } = req.body;
			const sql = `insert into garment_cart (cart_id, garment_id) values($1, $2);`;
			const cartItem = await db.oneOrNone('select * from garment_cart where cart_id = $1 AND garment_id = $2', [cartId, garmentId])
			if (cartItem == null) {
				await db.none(sql, [cartId, garmentId]);
			} else {
				if (type == 'ADD') {
					await db.none(`update garment_cart set qty = qty + 1 where cart_id = $1 AND garment_id = $2`, [cartId, garmentId]);
				}

				if (type == 'REMOVE') {
					if (cartItem.qty <= 1) {
						await db.none(`delete from garment_cart where cart_id = $1 AND garment_id = $2`, [cartId, garmentId]);
					} else {
						await db.none(`update garment_cart set qty = qty - 1 where cart_id = $1 AND garment_id = $2`, [cartId, garmentId]);
					}
				}
			}
			res.status(200)
				.json({ message: 'Added successfully' })
		} catch (error) {
			console.log(error);
			res.status(501).json({ error })
		}
	})


	app.post('/api/purchase', async (req, res) => {
		// update account balance
		// change garment_cart status
		// create a receipt
		try {
			const { userId, cartId } = req.body;
			const account = await userAccount(userId);
			const balance = await getCartTotal(userId);

			if (account.balance - balance >= 0) {
				await updateAccountBalance({ accountId: account.id, balance });
				await db.none('UPDATE garment_cart SET status = $1 where cart_id = $2', [CartStatus.Closed, cartId]);
				await db.none('UPDATE cart SET status = $1 where id = $2', [CartStatus.Closed, cartId]);
				const garmentCartIds = await getGarmentCartId(cartId)
				await createReceipt({ userId, accountId: account.id, garmentCartIds });
				res.status(200)
					.json({ message: 'Purchase successfully' });
			} else {
				throw Error('Lower balance')
			}
		} catch (error) {
			console.log(error)
			res.status(501).json({
				message: error.message
			})
		}

	})

}