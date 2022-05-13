create table garment(
	id serial not null primary key,
	description text,
	img text,
	season text,
	gender text,
	price decimal(10,2)
);