# Create an API endpoint for adding data.

To extend the API to be able to add new garments we need to add a `post` route that can send data to the server.

The POST route should be callable form the DOM like this:

```js

// fields to be read from the DOM
const domFields = {
  description,
  image,
  gender,
  season,
  price
};

axios.post('/api/garments', domFields)
  .then((result) => {
      // show snackbar - with success message
      console.log(result.data);
  })
  .catch(err => {
    console.log(err);
  });

```

> Create a snackbar using these [instructions](https://www.w3schools.com/howto/howto_js_snackbar.asp). 

Note the `domFields` object which values should be read from the DOM.

## Create a new POST route

To create a new POST route called `/api/garments` copy the code below into `index.js` file. This route will add `garment add support` to the API.

This endpoint will receive data from the HttpRequest body attribute (`req.body`) in the post request. It then reads all the required fields from `req.body` and check if all the required fields have been entered. If not an error message is returned, otherwise the new entry is added to the `garments` list and a success message is returned.

Be sure to test the new API endpoint using `Thunder Client` after the appropriate middleware was added as instructed below.

```js

app.post('/api/garments', (req, res) => {

	// get the fields send in from req.body
	const {
		description,
		img,
		gender,
		season,
		price
	} = req.body;

	// add some validation to see if all the fields are there.
	// only 3 fields are made mandatory here
	// you can change that

	if (!description || !img || !price) {
		res.json({
			status: 'error',
			message: 'Required data not supplied',
		});
	} else {

		// you can check for duplicates here using garments.find
		
		// add a new entry into the garments list
		garments.push({
			description,
			img,
			gender,
			season,
			price
		});

		res.json({
			status: 'success',
			message: 'New garment added.',
		});
	}

});

```
## Required Middleware

For an `POST` routes to work correctly in ExpressJS you need to configure some [middleware](https://expressjs.com/en/api.html#express.json). Read more on that link about `express.json()` and `express.urlencoded({ extended: false })` [here](https://expressjs.com/en/api.html#req.body) as well.

Add this code to your `index.js` file, above any route declarations.

```js
// enable the req.body object - to allow us to use HTML forms
// when doing post requests
// put this before you declare any routes

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
```

This will ensure that the `req.body` property contains the form data that's sent to the server when doing a `POST` route.

## Install Thunder Client

Install the `Thunder Client VS Code extension` and test the new POST API endpoint at `/api/garments`.

> Thunder Client is a API testing tool, that is similar to [Postman](https://www.postman.com/) - but you can run it from within VS Code.

You can also call the previously created GET routes - `/api/garments` and `/api/garments?gender=Unisex&season=All season`

Test the `/api/garments` POST route:

* first with no JSON content - see what error are you getting.
* then with this a JSON field with `description`, `price` & `img` fields at least.

JSON to try:

```json
{
	"description": "Rainbow unicorn sweater",
	"price": 799.00,
	"img" : "placeholder.png",
	"gender" : "Unisex",
	"season" : "All season"
}
```

Test to see if the API call worked by using the `GET` API endpoints:

* `/api/garments` 
* `/api/garments?gender=Unisex&season=All season`

> **Note:** you can use `placeholder.png` or `fashion.png` as placeholder images.

## Create a screen to add new garments

The `app.js` file already contains the code for adding new garments - you will just need to unhide Add garment support by removing the `hidden` class from the 'Add garment' element.

In the `index.html` file find this HTML:

```html
<div class="add button mt1 hidden" >
	<a href="">Add garmet</a>
</div>
```

And remove the `hidden` className. It should look like this:

```html
<div class="add button mt1" >
	<a href="">Add garmet</a>
</div>
```

To see this link safe this change and refresh the page. When clicking on the link a screen will be displayed where a new garment can be added.

After a new garment is added the page will refresh and the newly entered garment will be displayed on the Missy Tee home page. You can use an image or `placeholder.png` or `fashion.png`.

Study the client side JavaScript code in the `public` folder in the files `app.js`, `field-manager.js` & `add-garments.js`. Email `gwi-mentors@projectcodex.co` with questions.
