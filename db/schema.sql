create table roles
(
    role_id integer generated always as identity
        primary key,
    name    varchar(20) not null
);

alter table roles
    owner to postgres;

create table users
(
    user_id       integer generated always as identity
        primary key,
    name          varchar(20) default USER not null,
    login         varchar(20)              not null
        unique,
    password_hash text                     not null,
    role_id       integer     default 1    not null
        constraint fk_roles
            references roles
);

alter table users
    owner to postgres;

create table categories
(
    category_id integer generated always as identity
        primary key,
    name        varchar(20) not null
);

alter table categories
    owner to postgres;

create table cocktails
(
    cocktail_id integer generated always as identity
        primary key,
    name        varchar(40) not null,
    category_id integer     not null
        constraint cocktails_category__fk
            references categories,
    recipe      text,
    photourl    text,
    creator_id  integer     not null
        constraint cocktails_creator__fk
            references users
);

alter table cocktails
    owner to postgres;

create table ingredients
(
    ingredient_id    integer generated always as identity
        primary key,
    name             varchar(40) not null,
    description      text,
    photourl         text,
    contains_alcohol boolean,
    creator_id       integer     not null
        constraint ingredients_user_fk
            references users
);

alter table ingredients
    owner to postgres;

create table reviews
(
    review_id   integer generated always as identity
        primary key,
    user_id     integer
        constraint fk_reviews_users
            references users,
    cocktail_id integer
        constraint fk_reviews_cocktails
            references cocktails,
    text        varchar(255),
    note        integer not null
        constraint reviews_note_check
            check ((note >= 1) AND (note <= 5))
);

alter table reviews
    owner to postgres;

create table cocktail_ingredients
(
    ci_id         integer generated always as identity
        primary key,
    cocktail_id   integer not null,
    ingredient_id integer not null
        constraint fk_ci_ingredients
            references ingredients,
    amount        integer not null
        constraint ck_ci_amount_positive
            check (amount > 0)
);

alter table cocktail_ingredients
    owner to postgres;

create view v_user(user_id, name, login, role_name) as
SELECT u.user_id,
       u.name,
       u.login,
       r.name AS role_name
FROM users u
         JOIN roles r ON r.role_id = u.role_id;

alter table v_user
    owner to postgres;

create view v_cocktail_general (cocktail_id, name, photourl, category_name, creator_name, average_rating, creator_id) as
SELECT c.cocktail_id,
       c.name,
       c.photourl,
       cat.name    AS category_name,
       u.name      AS creator_name,
       avg(r.note) AS average_rating,
       u.user_id   AS creator_id
FROM cocktails c
         JOIN categories cat ON cat.category_id = c.category_id
         JOIN users u ON u.user_id = c.creator_id
         LEFT JOIN reviews r ON r.cocktail_id = c.cocktail_id
GROUP BY c.cocktail_id, c.name, c.photourl, cat.name, u.name, u.user_id;

alter table v_cocktail_general
    owner to postgres;

create view v_cocktail_details
            (cocktail_id, name, photourl, recipe, category_name, creator_name, average_rating, ingredients, reviews,
             creator_id) as
SELECT c.cocktail_id,
       c.name,
       c.photourl,
       c.recipe,
       cat.name                                                      AS category_name,
       u.name                                                        AS creator_name,
       (SELECT avg(r.note) AS avg
        FROM reviews r
        WHERE r.cocktail_id = c.cocktail_id)                         AS average_rating,
       COALESCE((SELECT jsonb_agg(jsonb_build_object('ingredient_id', i.ingredient_id, 'name', i.name, 'description',
                                                     i.description, 'photourl', i.photourl, 'contains_alcohol',
                                                     i.contains_alcohol, 'amount', ci.amount)) AS jsonb_agg
                 FROM cocktail_ingredients ci
                          JOIN ingredients i ON i.ingredient_id = ci.ingredient_id
                 WHERE ci.cocktail_id = c.cocktail_id), '[]'::jsonb) AS ingredients,
       COALESCE((SELECT jsonb_agg(jsonb_build_object('review_id', r.review_id, 'user_id', r.user_id, 'user_name',
                                                     ru.name, 'text', r.text, 'note', r.note)) AS jsonb_agg
                 FROM reviews r
                          LEFT JOIN users ru ON ru.user_id = r.user_id
                 WHERE r.cocktail_id = c.cocktail_id), '[]'::jsonb)  AS reviews,
       u.user_id                                                     AS creator_id
FROM cocktails c
         JOIN categories cat ON cat.category_id = c.category_id
         JOIN users u ON u.user_id = c.creator_id;

alter table v_cocktail_details
    owner to postgres;

