CREATE TABLE friend(
    users_id INTEGER REFERENCES user(id) ON DELETE CASCADE,
    friend_id INTEGER REFERENCES user(id) ON DELETE CASCADE,
    accepted BOOLEAN,
);