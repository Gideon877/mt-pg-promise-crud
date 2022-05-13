let seasonFilter = '';
let genderFilter = '';

const seasonOptions = document.querySelector('.seasons');
const genderOptions = document.querySelector('.genders');
const searchResultsElem = document.querySelector('.searchResults');
const priceRangeElem = document.querySelector('.priceRange');
const showPriceRangeElem = document.querySelector('.showPriceRange');

const garmentsTemplateText = document.querySelector('.garmentListTemplate');
const garmentsTemplate = Handlebars.compile(garmentsTemplateText.innerHTML);



seasonOptions.addEventListener('click', function (evt) {
	seasonFilter = evt.target.value;
	filterData();
});

genderOptions.addEventListener('click', function (evt) {
	genderFilter = evt.target.value;
	filterData();
});

const getToken = () => localStorage['token']
	? localStorage.getItem('token')
	: null



function filterData() {
	const token = getToken()
	axios
		.get(`/api/garments?gender=${genderFilter}&season=${seasonFilter}`, {
			params: { token }
		})
		.then(function (result) {
			console.log(result.data.data);
			searchResultsElem.innerHTML = garmentsTemplate({
				garments: result.data.garments
			})
		}).catch(err => console.log(err));
}

priceRangeElem.addEventListener('change', function (evt) {
	const maxPrice = evt.target.value;
	showPriceRangeElem.innerHTML = maxPrice;
	const token = getToken()

	axios
		.get(`/api/garments/price/${maxPrice}`, { params: { token } })
		.then(function (result) {
			searchResultsElem.innerHTML = garmentsTemplate({
				garments: result.data.garments
			})
		});
});


const login = () => {
	const username = document.querySelector('.username-filed').value;
	axios.post('/api/login', { username })
		.then(result => result.data)
		.then(data => localStorage.setItem('token', data.token))
		.catch(err => console.log(err));
	document.querySelector('.username')
		.innerHTML = username;
	showGarments();
	filterData();

}

const showGarments = () => {
	document.querySelector('.login-screen')
		.classList
		.toggle('hidden');

	document.getElementById('main')
		.className = 'container'
}

const hideGarments = () => {
	document.querySelector('.login-screen')
		.className = '.login-screen';
	document.getElementById('main')
		.className = 'container hidden'
}

document
	.querySelector('.sign-in')
	.addEventListener('click', login)

document.querySelector('.logout')
	.addEventListener('click', ()=> {
		localStorage.clear()
	});
