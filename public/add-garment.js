const message = document.querySelector('.message');
const addGarmetBtn = document.querySelector('.addGarmentBtn');
const hideAddGarmetBtn = document.querySelector('.hideAddGarmetBtn');
const addGarmetSection = document.querySelector('.add.garment');
const addGarmetButtonSection = document.querySelector('.add.button');

function showMessage(value) {
	message.innerHTML = value;
	message.classList.toggle('hidden');

	setTimeout(() => {
		message.innerHTML = '';
		message.classList.toggle('hidden');
	}, 3000);
}

function toggleAddGarmetScreen() {
	addGarmetSection.classList.toggle('hidden');
	addGarmetButtonSection.classList.toggle('hidden');
}

hideAddGarmetBtn.addEventListener('click', function (evt) {
	toggleAddGarmetScreen()
});

const fieldManager = FieldManager({
	'description': '',
	'img': '',
	'season': '',
	'gender': '',
	'price': 0.00
});

addGarmetBtn.addEventListener('click', function (evt) {

	// fields on the screen
	const fields = fieldManager.getValues();

	axios
		.post('/api/garments', fields)
		.then(result => {
			if (result.data.status == 'error') {
				showSnackBar(result.data.message, '#AF2727');
			} else {
				toggleAddGarmetScreen();
				// show success message from API
				showSnackBar(result.data.message);
				fieldManager.clear();
				// show all the data
				filterData();
			}
		})
		.catch(err => {
			showSnackBar(err.stack)
		});
});

addGarmetButtonSection.addEventListener('click', function (evt) {
	evt.preventDefault();
	toggleAddGarmetScreen()
});

function showSnackBar(value, color) {
	var x = document.getElementById("snackbar");
	x.style.background = (color) ? color : 'green';

	x.innerHTML = value;
	x.className = "show";
	setTimeout(function () { x.className = x.className.replace("show", "show"); }, 3000);
}