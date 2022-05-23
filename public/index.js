/** 
 * todo: 
 * - add pagination
 * - add register user function
 * - verify user is registered
 * - add user profile page
 */
document.addEventListener('alpine:init', () => {
    Alpine.data('shop', () => {
        return {
            signIn: false,
            signUp: false,
            showMenu: false,
            loading: false,
            signUpLoading: false,
            error: null,
            genderFilter: '',
            seasonFilter: '',
            maxPrice: 10,
            garments: [],
            addGarment: false,
            garmentData: {
                description: '',
                price: '',
                img: 'fashion.png',
                season: '',
                gender: ''
            },
            page: 1,
            user: {
                username: 'Gideon877',
                token: null,
                password: 'password',
                lastName: 'Smith',
                firstName: 'John',
            },
            showFeedback: false,

            errors: {
                header: 'Just one second',
                description: `We're fetching that content for you.`,
                status: 'violet'
            },

            init() {
                this.user.token = localStorage['token'];
                if (this.user.token == undefined) {
                    this.signIn = true;
                } else {
                    this.showMenu = true;
                    this.getGarments();
                }
            },

            add(garment) {
                alert('add' + JSON.stringify(garment.season));
            },

            paginate(number){
                this.page = Number(number)
                this.getGarments();

            },

            next() { 
                if(this.page < 3) {
                    this.page++;
                    this.getGarments();
                }
            },

            previous() {
                if (this.page > 1) {
                    this.page--;
                    this.getGarments();
                }
             },

            create() {
                const { token } = this.user;
                axios
                    .post(`/api/garment/`, { ...this.garmentData, token })
                    .then((result) => result.data.garments)
                    .then(garments => this.errors.description = `Garment added successfully`)
                    .catch(err =>
                        (err.response.status == 401)
                            ? this.signIn = true
                            : this.garments = []
                    );
            },

            edit(garment) {
                alert('edit' + JSON.stringify(garment.season));
            },

            remove(garment) {
                alert('remove' + JSON.stringify(garment.season));
            },

            login() {
                this.loading = true;
                const { username, password } = this.user;
                // Authenticate app on click handler
                axios.post('/api/login', { username, password })
                    .then(result => result.data)
                    .then(auth => {
                        setTimeout(() => {
                            localStorage.setItem('token', auth.token);
                            this.user = {
                                ...auth.user, token: auth.token
                            };
                            this.getGarments();
                            this.error = null;
                            this.signIn = false;
                            this.showMenu = true;
                        }, 1500);
                    })
                    .catch((e) => setTimeout(() => this.error = `Wrong username or password`, 500));
                setTimeout(() => {
                    this.loading = false;
                    this.error = null;
                }, 2000)
            },

            logout() {
                this.signIn = true;
                this.user = {}
                this.showMenu = false;
                localStorage.clear('token');
                this.errors = {
                    header: `Logging out`,
                    description: `You are logging out of the application`,
                    status: 'success'
                };
                this.showFeedback = true;
                this.clearMessage();
            },

            register() {
                this.signUpLoading = true;
                this.showFeedback = true;
                axios
                    .post(`/api/user/`, { ...this.user })
                    .then(() => setTimeout(() => {
                        this.signIn = true;
                        this.signUp = false;
                        this.signUpLoading = false;
                        this.errors = {
                            header: `Signup successfully. `,
                            status: 'success',
                            description: `Login with your username and password to access the dashboard.`
                        };
                        this.clearMessage();
                    }, 3000))
                    .catch(err => {
                        if (err.response.status == 501) {
                            this.signIn = false
                            this.signUpLoading = false;
                            this.errors = {
                                header: `Signup failed`,
                                description: 'A user with the same username already exists. Specify another username.',
                                status: 'negative',
                            }
                            this.showFeedback = true;
                            this.clearMessage();
                        }
                    });
            },

            clearMessage() {
                setTimeout(() => {
                    this.errors = {};
                    this.showFeedback = false;
                }, 3000)
            },

            getGarmentsByPrice() {
                const { token } = this.user;
                axios
                    .get(`/api/garments/price/${this.maxPrice}`, { params: { token } })
                    .then((result) => result.data.garments)
                    .then(garments => this.garments = garments)
                    .catch(err =>
                        (err.response.status == 401)
                            ? this.signIn = true
                            : this.garments = []
                    );
            },

            getGarments() {
                const { token } = this.user;
                const { genderFilter, seasonFilter } = this;
                axios
                    .get(`/api/garments?gender=${genderFilter}&season=${seasonFilter}&page=${this.page}`, {
                        params: { token }
                    })
                    .then((result) => result.data.garments)
                    .then(garments => this.garments = garments)
                    .catch(err =>
                        (err.response.status == 401)
                            ? this.signIn = true
                            : null
                    );
            },

        }
    });
})

