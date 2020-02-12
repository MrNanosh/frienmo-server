CREATE TABLE "tagged"(
    "favor_id" INTEGER REFERENCES "favor"(id) ON DELETE CASCADE,
    "tag_id" INTEGER REFERENCES "tag_table"(id) ON DELETE CASCADE
);