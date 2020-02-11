# Frenmo (working title)

## Summary

## Technologies used

## links

client github repo: https://github.com/MrNanosh/frienmo-client

api github repo: https://github.com/MrNanosh/frienmo-server

## API

### api/user

#### GET api/user/:id

gets information about particular users

### api/friend

#### GET api/friend

gets a list of friends for a particular user:
user must be authorized otherwise returns a 401

#### POST api/friend/:id <i>protected</i>

make an association with the authorized user with the user in the request
parameter

#### PATCH api/friend/:id

changes the accepted parameter to true

should only be used in the case of accepting a request to be friends
should not be able to patch a accepted property to false.
attempting to patch accepted as false will return a 401

#### DELETE api/friend/:id

deletes the friend (not their account but the association)
should be used in the event of declining a request for friend

### api/review

### api/favor

### api/category
