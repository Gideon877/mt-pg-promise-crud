create table users
(
    id serial not null primary key,
    username text,
    first_name text,
    last_name text,
    password text,
    active boolean default true
);

create table cart
(
    id serial not null primary key,
    name text default 'shopping',
    user_id int,
	foreign key (user_id) references users(id)
);

create table garment_cart
(
    id serial not null primary key,
    cart_id int,
    garment_id int,
	foreign key (cart_id) references cart(id),
    foreign key (garment_id) references garment(id)
);


insert into users(first_name, last_name, username, password) values ('King', 'Gideon', 'Gideon877', 'password')