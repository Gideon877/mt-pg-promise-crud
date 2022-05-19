
document.addEventListener('alpine:init', () => {
    Alpine.data('shop', () => {
        return {
            signIn: false,
            signUp: false,
            showMenu: false,
            loading: false,
            error: null,
            genderFilter: '',
            seasonFilter: '',
            maxPrice: 10,
            garments: [],
            addGarment: false,
            user: {
                username: 'Gideon877',
                token: null,
                password: 'password',
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

            login() {
                this.loading = true;
                // Authenticate app on click handler
                axios.post('/api/login', { username: this.user.username })
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
            },

            register() {
                alert(JSON.stringify(this.user));
                this.signIn = true;
                this.signUp = false;
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
                    .get(`/api/garments?gender=${genderFilter}&season=${seasonFilter}`, {
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

