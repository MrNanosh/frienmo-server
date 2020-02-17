Begin;

    TRUNCATE
    "user",
    "friend",
    "favor"
 --   "outstanding",
--    "review",
 --   "tags",
 --   "tagged"
    RESTART IDENTITY CASCADE;

    INSERT INTO "user"
        (
        "username", "password","name","phone"
        )
    VALUES
        ('test1', '$2a$12$hTdmJeXQjUWprS.XECKuou6V8swQySxeW5OApS7rm5iTF.naYxHE.', 'Test 1', '734123456'),
        ('test 2', 'test-2-pass', 'Test 2', '734123456'),
        ('test 3', 'test-3-pass', 'Test 3', '734123456'),
        ('test 4', 'test-4-pass', 'Test 4', '734123456'),
        ('test 5', 'test-5-pass', 'Test 5', '734123456');

    INSERT INTO "friend"
        ("user_id", "friend_id", "accepted")
    VALUES
        ('1', '2', 'true'),
        ('2', '1', 'true'),
        ('1', '3', 'true'),
        ('3', '1', 'false');

    INSERT INTO "favor"
        ("title", "description", "creator_id", "expiration_date", "publicity",
        "user_location", "tags", "category", "limit", "posted")
    VALUES
        ('title 1', 'description 1', '1', NOW(), 'dm', ' ', '', '1', 2, NOW()),
        ('title 1', 'description 1', '2', NOW(), 'friend', ' ', '', '1', 1, NOW()),
        ('title 1', 'description 1', '3', NOW(), 'public', ' ', '', '1', 2, NOW());

    INSERT INTO "outstanding"
        ("favor_id", "users_id", "receiver_id", "receiver_redeemed", "giver_redeemed")
    VALUES
        ('1', '1', '2', 'false', 'false'),
        ('2', '2', '3', 'true', 'false'),
        ('3', '3', '1', 'false', 'true'),
        ('1', '1', '3', 'true', 'true');

    --INSERT INTO "review"()
    --VALUES
    --stuff
    --;

    --INSERT INTO "tags"(--stuff)
    --VALUES
    --STUFF
    --;

    --INSERT INTO "tagged"(--STUFF)
    --VALUES
    ---STUFF
    --;

    COMMIT;