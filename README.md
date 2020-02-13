# Frenmo (working title)

## Summary

## Technologies used

## links

client github repo: https://github.com/MrNanosh/frienmo-client

api github repo: https://github.com/MrNanosh/frienmo-server

## API

---

---

### api/user

---

#### GET api/user/:id

gets information about particular users

#### GET api/user

returns an array of users with name and username

#### POST api/user

creates a new user and returns a json with the users name and username.

returns the location of the user

### api/friend

---

#### GET api/friend

gets a list of friends for a particular user:
user must be authorized otherwise returns a 401

#### POST api/friend <i>protected</i>

make an association with the authorized user with the user in the request
parameter

body takes the id of the friend

#### PATCH api/friend/:id

changes the accepted parameter to true

should only be used in the case of accepting a request to be friends
should not be able to patch a accepted property to false.
attempting to patch accepted as false will return a 401

id is the id of friend request.

#### DELETE api/friend/:id

deletes the friend (not their account but the association)
should be used in the event of declining a request for friend

### api/review

---

#### GET api/review/user/:user_id

gets all the reviews for the specified user only

#### GET api/review/:id

gets a specific review

#### POST api/review

makes a new review and returns the location of the review

#### PATCH api/review/:id

#### DELETE api/review/:id

### api/favor

---

#### GET api/favor/:id

will return an object with the specified favor.

```

```

#### GET api/favor/friend

gets favors that were posted among your friends and not just the general public

```

```

#### GET api/favor

gets a paginated list of favors from the local community.
Does not show

```

```

uses queries page and limit to paginate with a default page of 1
and a limit of 30 entries.

```

```

#### GET api/favor/personal

gets a list of favors created by the user, issued by the user, or received by the user

```

```

#### PATCH api/favor/:id

allowed: patching of certain fields under certain conditions:
allowed: increase the expiration date of a favor that has receiver_id set
allowed: update any field if favor_outstanding does not reference its id

```

```

#### POST api/favor/issue

This method should be used to update the giver and receiver of a favor in
favor_outstanding. if a favor is not outstanding and giver and receiver id is in the body then it will
add a row for it in favor_outstanding. The limit of that favor to be issued
will stop the patch if there is an attempt to go over. An error will be thrown in this case.

```

```

#### PATCH api/favor/redeem/:favor_id

takes favor id as a parameter
takes outstanding_id as the request body and should redeem or confirm redeeming
of a favor for the authorized user

```

```

#### DELETE api/favor/:id

an authorized user may delete a favor if favor_outstanding does not reference its id

```

```

#### POST api/favor

authorized post posts with the user as a creator of the favor but
makes a null outstanding. Makes 1 outstanding favor with a value
for the giver and receiver as null.

```

```

#### GET api/favor/public

gets the authorized route for the public

```

```

### api/category

---

#### GET api/category

only gets are allowed for this

gets a list of categories and their ids
