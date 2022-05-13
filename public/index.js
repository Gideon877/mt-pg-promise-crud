
document.addEventListener('alpine:init', () => {
    Alpine.data('shop', () => {
        return {

            signIn: false,
            loading: false,
            error: null,
            genderFilter: '',
            seasonFilter: '',
            maxPrice: 10,
            garments: [],
            user: {
                username: 'Gideon877',
                token: null,
                getToken() {
                    return this.token;
                }
            },

            init() {
                this.user.token = localStorage['token'];
                if (this.user.token == undefined) {
                    this.signIn = true;
                } else {
                    this.getGarments();
                }
            },

            login() {
                this.loading = true;
                // Authenticate
                axios.post('/api/login', { username: this.user.username })
                    .then(result => result.data)
                    .then(auth => {
                        setTimeout(() => {
                            localStorage.setItem('token', auth.token);
                            this.user = {
                                ...this.user, token: auth.token
                            };
                            this.error = null;
                            this.signIn = false;
                            this.getGarments();
                        }, 1500);
                    })
                    .catch(() => setTimeout(() => this.error = `User not found!`, 500));

                setTimeout(() => {
                    this.loading = false;
                    this.error = null;
                    console.log('Done after 2 seconds', this.garments.length)
                }, 2000)
            },
            logout() {
                this.signIn = true;
                localStorage.clear('token')
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

                setTimeout(() => console.log(this.garments[0]), 1000)
            },


        }
    });
})

