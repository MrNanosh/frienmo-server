Begin;

TRUNCATE
 "friend"
 RESTART IDENTITY CASCADE;
--     "user"
--     RESTART IDENTITY CASCADE;

-- INSERT INTO "user" ( 
--     "username", "password","name","phone"
-- )
-- VALUES
-- ('admin','pass','real admin','734123456'),
-- ('friend admin', 'passadmin', 'friend admin', '7341234587');

INSERT INTO "friend"(
    "user_id", "friend_id", "accepted"
)
VALUES
('1', '2', 'true'),
('2','1', 'true'),
('2','3', 'true'),
('2','4','true'),
('3', '2', 'true'),
('4','2', 'true');
-- ('4','1', 'true'),
-- ('5', '2', 'true'),
-- ('6','3', 'true'),
-- ('7', '3', 'true'),
-- ('8','3', 'true');


COMMIT;