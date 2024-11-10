CREATE TABLE users
(
    gamer_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id Text NOT NULL,
    password Text NOT NULL
);

SELECT *
from users


CREATE Table scoreboard
(
    score_id Integer PRIMARY KEY AUTOINCREMENT,
    user_id Text not null,
    score integer not null
);

SELECT *
from scoreboard