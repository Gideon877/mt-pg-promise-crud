CREATE OR REPLACE FUNCTION trigger_create_user_account()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO account (user_id)
    VALUES (new.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

create table account 
(
    id serial not null primary key,
    user_id int,
    balance decimal not null default 1500,
    name text not null default 'SAVINGS',
    foreign key (user_id) references users(id)
);

create table garment_receipt
(
    id serial not null primary key,
    garment_cart_id int,
    user_id int,
    account_id int,
    foreign key (user_id) references users(id),
    foreign key (garment_cart_id) references garment_cart(id),
    foreign key (account_id) references account(id)

);

CREATE TRIGGER on_create_user_account
AFTER INSERT ON users
FOR EACH ROW
EXECUTE PROCEDURE trigger_create_user_cart();