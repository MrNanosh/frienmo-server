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
        friendService.getFriends(req.app.get('db'), req.user.id)
        .then(result =>{
            res.json(result);
        })
    })
    //makes a friend request with the user
    .post(bodyParser, (req, res) =>{
        const {friend_id} = req.body;
        if(!friend_id){
            res.status(400).send('bad request');
        }
        const id = req.user.id;
        friend1 = { 
            user_id: id, 
            friend_id: friend_id, 
            accepted: true 
        };
        friend2 = { 
            user_id: friend_id,
            friend_id: id,
            accepted: false
        }
        friendService.makeFriend(req.app.get('db'), friend1, friend2)
        .then(friend =>{
            console.log(friend);
            res.status(201).send(friend);
        })

        
    })
    //changed accepted to true
    .patch(bodyParser, (req, res) =>{
        const {friend_id} = req.body;
        console.log(friend_id);
    })
    //deletes a friend request
    .delete(bodyParser, (req, res) =>{

    })

module.exports = friendRouter;