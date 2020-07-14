# Frenmo

Team: Jack Pupel, Wendy Bartos, Angel Alicea, Javier Zapien, Dana Zinatbakhsh

## Live Demo Link: https://frenmo.now.sh

## Summary

Imagine Venmo, now imagine that but with favors instead of real money. Thats the app
This is the api for that app, it keeps track of users, favors, outstanding favors,
friends, reviews, categories, and other things that can be implemented later

## Technologies used

Express
Node
XSS

## links

client github repo: https://github.com/MrNanosh/frienmo-client

api github repo: https://github.com/MrNanosh/frienmo-server

## Image Guide

## Login Page

![frenmoLogin](https://i.gyazo.com/8260c4c000ccffcd1317c661c8b60f7a.png)

## Register Page

![frenmoSignup](https://i.gyazo.com/034fec250a7ab6bf43af6255b609a6a0.png)

## User Home (Desktop View)

![frenmoDT](https://i.gyazo.com/f0469d2d29a81d4782b0cc29570001c1.png)

## User Home (Mobile View)

![mblFrenmoView](https://i.gyazo.com/39023ec0f7e21f4e66eff67840ce173f.png)

## My Frenmos

![frenmoMyFs](https://i.gyazo.com/2147e05af7f93da0606299a7c3f1df85.png)

## Create Frenmo

![createFrenmo](https://gyazo.com/e3d01843225553f286267108ec9e610a)

## API

---

## test

### api/user

---

#### GET api/user/:id

gets information about particular users
returns username, name, phone, and description

#### POST api/user/search

takes username in the req body
returns id, username and name of the user found

#### GET api/user

get information about all users
returns an array of users with name and username

#### POST api/user

creates a new user and returns a json with the users name and username.
body takes in username, name, password, phone number and description
returns the location of the user, username, name, and id

#### GET api/user/username/:username

takes in username in params and searches the users table for a user
returns 200 on success and 404 on failure

### api/friend

all routes in friend require the user to be an authorized user
otherwise it will return a 401

---

#### GET api/friend

gets a list of friends for a particular user:
friend data includes, id, fav_accepted, fav_requested, username, name, description

#### POST api/friend <i>protected</i>

make an association with the authorized user and with the user in the request
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

```

```

### api/review

all routes in friend require the user to be an authorized user
will return a 401 otherwise

---

#### GET api/review/user/:user_id

gets all the reviews for the specified user only
user_id is the parameter, returns 404 if the user_id doesnt exist

#### GET api/review/:review_id

gets a specific review, returns all infromation from the review

#### POST api/review

makes a new review and returns the location of the review
body requires comment and reviewee

#### PATCH api/review/:id

updates a review with the id in the params
returns 204 and no data

#### DELETE api/review/:id

deletes a review with the id in the params
returns 204 and no data

```

```

### api/favor

all routes in favor require the user to be an authorized user
otherwise it will return a 401

---

#### GET api/favor/:id

will return an object with the specified favor.

if the favor doesnt exist it returns 401
if the user is not within the publicity of the favor (ie: user is a friend when the favor is dm):
returns a 403 error

otherwise returns 200 and an object containing:
favor_id, favor title, favor description, fa.category as category',
favor expiration_date, favor publicity, favor user_location, favor tags,
favor limit, outstanding id, outstanding receiver_redeemed,
oustanding giver_redeemed as issuer_redeemed, creator id,
creator name, creator username, issuer id, issuer name,
issuer username, receiver id, receiver name, receiver username

#### GET api/favor/friend

gets favors that were posted among your friends and not just the general public

otherwise returns 200 and an array of objects, each containing:
favor_id, favor title, favor description, fa.category as category',
favor expiration_date, favor publicity, favor user_location, favor tags,
favor limit, outstanding id, outstanding receiver_redeemed,
oustanding giver_redeemed as issuer_redeemed, creator id,
creator name, creator username, issuer id, issuer name,
issuer username, receiver id, receiver name, receiver username

#### GET api/favor

gets a list of favors from the local community.
Does not show private or friend favors

returns 200 and an array of objects, each containing:
favor_id, favor title, favor description, fa.category as category',
favor expiration_date, favor publicity, favor user_location, favor tags,
favor limit, outstanding id, outstanding receiver_redeemed,
oustanding giver_redeemed as issuer_redeemed, creator id,
creator name, creator username, issuer id, issuer name,
issuer username, receiver id, receiver name, receiver username

```

```

```

```

#### GET api/favor/personal

gets favors that were posted directly to you

returns 200 and an array of objects, each containing:
favor_id, favor title, favor description, fa.category as category',
favor expiration_date, favor publicity, favor user_location, favor tags,
favor limit, outstanding id, outstanding receiver_redeemed,
oustanding giver_redeemed as issuer_redeemed, creator id,
creator name, creator username, issuer id, issuer name,
issuer username, receiver id, receiver name, receiver username

#### PATCH api/favor/:id

allowed: patching of certain fields under certain conditions:
allowed: increase the expiration date of a favor that has receiver_id set
allowed: update any field if favor_outstanding does not reference its id
returns 400 if trying to do anything that isnt allowed

takes in expiration_date, tags, category, user_location, limit in the req body
returns 204 on success

```

```

#### POST api/favor/issue

This method should be used to update the giver and receiver of a favor in
favor_outstanding. if a favor is not outstanding and giver and receiver id is in the body then it will
add a row for it in favor_outstanding. The limit of that favor to be issued
will stop the patch if there is an attempt to go over. An error will be thrown in this case.

takes in favor_id, users_id, reciever_id in the req body
returns 204 and the updated outstanding favor on resolution

```

```

#### PATCH api/favor/redeem/:favor_id

takes favor id as a parameter
takes outstanding_id as the request body and should redeem or confirm redeeming
of a favor for the authorized user

returns 404 if the favor does not exist
returns 403 if the favor is already redeemed
returns 403 if the user is unrelated to the transaction
returns 204 on success

```

```

#### DELETE api/favor/:id

a user may deletes a favor
takes in id in the params
returns 204 in response

```

```

#### POST api/favor

authorized post posts with the user as a creator of the favor but
makes a null outstanding. Makes 1 outstanding favor with a value
for the giver and receiver as null.

takes title, description as required parts of the body returns 400 if those arent present
tags, category, expiration date, publicity, user location and limit as extra parts of the body

returns 201 and the outstanding favor

```

```

#### GET api/favor/public

gets favors that were posted to the general public

otherwise returns 200 and an array of objects, each containing:
favor_id, favor title, favor description, fa.category as category',
favor expiration_date, favor publicity, favor user_location, favor tags,
favor limit, outstanding id, outstanding receiver_redeemed,
oustanding giver_redeemed as issuer_redeemed, creator id,
creator name, creator username, issuer id, issuer name,
issuer username, receiver id, receiver name, receiver username

#### GET api/favor/count/:id

gets the number of times you can make an oustanding favor from a favor with the input id

returns json object with {remaining: number}

### api/category

---

#### GET api/category

only gets are allowed for this

returns a list of categories and their ids
