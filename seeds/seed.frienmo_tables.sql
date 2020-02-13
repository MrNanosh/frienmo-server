Begin;

TRUNCATE
    review
    RESTART IDENTITY CASCADE;

-- INSERT INTO user ( 
--     username, password,name,phone
-- )
-- VALUES
-- ('admin','pass','real admin','734123456'),
-- ('friend admin', 'passadmin', 'friend admin', '7341234587');

INSERT INTO review (
    reviewer, reviewee, review
)
VALUES
( 1, 2, 'testy test');

COMMIT;