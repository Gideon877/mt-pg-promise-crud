CREATE OR REPLACE FUNCTION trigger_create_user_cart()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO cart (user_id)
    VALUES (new.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


create table users
(
    id serial not null primary key,
    username text,
    first_name text,
    last_name text,
    password text,
    active boolean default true,
    role text default 'USER'
);

create table cart
(
    id serial not null primary key,
    name text default 'wishlish',
    status text not null default 'OPEN',
    user_id int,
	foreign key (user_id) references users(id)
);

create table garment_cart
(
    id serial not null primary key,
    cart_id int,
    garment_id int,
    qty int default 1,
    status text default 'OPEN',
	foreign key (cart_id) references cart(id),
    foreign key (garment_id) references garment(id)
);


CREATE TRIGGER on_create_user_cart
AFTER INSERT ON users
FOR EACH ROW
EXECUTE PROCEDURE trigger_create_user_cart();