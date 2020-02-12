const express = require('express');
const friendRouter = express.Router();
const bodyParser = express.json();
const { requireAuth } = require('../middleware/jwt-auth');
const friendService = require('./friend-service');


friendRouter
    .use(requireAuth)
    .route('/')
    //gets all friends with the user
    .get((req, res) =>{

    })
    //makes a friend request with the user
    .post(bodyParser, (req, res) =>{

    })
    //changed accepted to true
    .patch(bodyParser, (req, res) =>{

    })
    //deletes a friend request
    .delete(bodyParser, (req, res) =>{

    })

module.exports = friendRouter;