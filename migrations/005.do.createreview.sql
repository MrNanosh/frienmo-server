CREATE TABLE review(
    id PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    reviewer INTEGER REFERENCES user(id) ON DELETE CASCADE,
    reviewee INTEGER REFERENCES user(id) ON DELETE CASCADE,
    comment TEXT,
);
