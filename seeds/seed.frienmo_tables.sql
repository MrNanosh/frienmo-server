Begin;

TRUNCATE
    "user",
    "friend",
    "favor",
    "outstanding",
    "review",
    "tags",
    "tagged"
    RESTART IDENTITY CASCADE;

INSERT INTO "user" ( 
    "username", "password","name","phone"
)
VALUES
('test 1', 'test-1-pass', 'Test 1', '734123456'),
('test 2', 'test-2-pass', 'Test 2', '734123456'),
('test 3', 'test-3-pass', 'Test 3', '734123456'),
('test 4', 'test-4-pass', 'Test 4', '734123456'),
('test 5', 'test-5-pass', 'Test 5', '734123456');

INSERT INTO "friend"("user_id", "friend_id", "accepted")
VALUES
('1', '2', 'true'),
('2','1', 'true'),
('1','3', 'true'),
('3','1', 'false');

INSERT INTO "favor"(--stuff)
VALUES
--stuff
;

INSERT INTO "outstanding"(--stuff)
VALUES
--stuff
;

INSERT INTO "review"(--stuff)
VALUES
--stuff
;
    
INSERT INTO "tags"(--stuff)
VALUES
--STUFF
;

INSERT INTO "tagged"(--STUFF)
VALUES
---STUFF
;

COMMIT;