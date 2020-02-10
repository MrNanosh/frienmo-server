CREATE TABLE "friend"(
    "user_id" INTEGER REFERENCES "user"(id) ON DELETE CASCADE NOT NULL,
    "friend_id" INTEGER REFERENCES "user"(id) ON DELETE CASCADE,
    "accepted" BOOLEAN
);