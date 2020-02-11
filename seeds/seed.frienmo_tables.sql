Begin;

TRUNCATE
    user
    RESTART IDENTITY CASCADE;

INSERT INTO user ( 
    username, password,name,phone
)
VALUES
('admin','pass','real admin','734123456'),
('friend admin', 'passadmin', 'friend admin', '7341234587');

INSERT INTO friend(
    user_id, friend_id, accepted
)
VALUES
( 1, 2, true);

COMMIT;