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
            cart: {},
            cartItemTotal: 0,
            maxPrice: 10,
            garments: [],
            addGarment: false,
            garmentData: {
                description: '',
                price: '',
                img: '',
                season: '',
                gender: ''
            },
            page: 1,
            count: 0,
            account: {},
            user: {
                username: 'johnsmith',
                id: null,
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
            defaultError: {
                header: 'Just one second',
                description: `We're fetching that content for you.`,
                status: 'violet'
            },

            init() {
                this.user.token = localStorage['token'];
                this.user.username = localStorage['username'];
                if (this.user.username == undefined) {
                    this.signIn = true;
                    return
                }

                if (this.user.token == undefined) {
                    this.signIn = true;
                } else {
                    this.showMenu = true;
                    this.getGarments();

                }
            },

            add(garment, type) {
                axios
                    .post('/api/cartItem', { garmentId: garment.id, cartId: this.cart.id, type })
                    .then(() => this.getGarments())
                    .catch(err => console.log(err))
            },

            paginate(number) {
                this.page = Number(number)
                this.getGarments();

            },

            next() {
                if (this.page < 3) {
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
                    .then(garments => this.errors.description = `Garment added successfully` && this.getGarments())
                    .then(() => {
                        this.garmentData = {
                            description: '',
                            price: '',
                            img: 'fashion.png',
                            season: '',
                            gender: ''
                        };
                        this.addGarment = !this.addGarment;
                        this.showFeedback = true;
                        this.clearMessage();
                    })
                    .catch(err =>
                        (err.response.status == 401)
                            ? this.signIn = true
                            : this.garments = []
                    );

            },

            edit(garment) {
                alert('edit' + JSON.stringify(garment.season));
            },

            remove(id) {
                axios
                    .delete(`/api/garments/${id}`, { data: { token: this.user.token } })
                    .then(r => r.data.status)
                    .then(r => console.log(r))
                    .then(() => this.getGarments())
                    .catch(err => console.log(err))
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
                            localStorage.setItem('username', auth.user.username);
                            this.user = {
                                ...auth.user, token: auth.token
                            };
                            this.cart = auth.cart;
                            console.table(this.cart)
                            this.cart = auth.cart;
                            this.getGarments();
                            this.error = null;
                            this.signIn = false;
                            this.showMenu = true;
                        }, 100);
                    })
                    .catch((e) => setTimeout(() => this.error = `Wrong username or password`, 500));
                setTimeout(() => {
                    this.loading = false;
                    this.error = null;
                }, 5000)
            },

            logout() {
                this.signIn = true;
                this.user = {}
                this.showMenu = false;
                localStorage.clear();
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
                        this.errors = {
                            header: `Signup successfully. `,
                            status: 'success',
                            description: `Login with your username and password to access the dashboard.`
                        };
                        this.signUpLoading = false;
                        this.signUp = false;
                        this.signIn = true;
                        this.clearMessage();
                    }, 1000))
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
                    this.errors = this.defaultError;
                    this.showFeedback = false;
                }, 1000)
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

            purchaseItems() {
                console.log(this.cart, this.user)
                const { id, user_id } = this.cart;
                const [cartId, userId] = [id, user_id];
                axios.post('/api/purchase', { cartId, userId })
                    .then(r => this.getGarments())
                    .catch(err => console.log(err))
            },

            clearCart() {
                alert('clear cart')
            },

            getGarments() {
                const { token, username } = this.user;
                const { genderFilter, seasonFilter } = this;
                axios
                    .get(`/api/garments?gender=${genderFilter}&season=${seasonFilter}&page=${this.page}`, {
                        params: { token, username }
                    })
                    .then((result) => result.data)
                    .then(data => {
                        this.garments = data.garments;
                        this.count = data.count;
                        this.cart = data.cart;
                        // console.table(data.cart);
                        this.cartItemTotal = _.sumBy(this.cart.cartItems, item => Number(item.qty))
                        // cartItemTotal
                        this.account = data.account;

                    })
                    .catch(err => {
                        if (err.response.status == 401) {
                            this.logout()
                            console.log(err);
                            this.showMenu = false;
                        }


                    });
            },

        }
    });
})

