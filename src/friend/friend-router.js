const express = require('express');
const friendRouter = express.Router();
const bodyParser = express.json();
const { requireAuth } = require('../middleware/jwt-auth');
const friendService = require('./friend-service');


friendRouter
    .use(requireAuth)
    .route('/')
    //gets all friends with the user
    .get((req, res) => {
        friendService.getFriends(req.app.get('db'), req.user.id)
            .then(result => {
                console.log("result",result)
                res.json(result);
            })
    })//makes a friend request with the user
    .post(bodyParser, (req, res) => {
        const { friend_id } = req.body;
        console.log('friend_id',friend_id)
        if (!friend_id) {
            res.status(400).send('BAD request');
        }

        const id = req.user.id;
        console.log('my_id',id)
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
            .then(friend => {
                res.status(201).send(friend);
            })


    })

    friendRouter
    .use(requireAuth)
    .route('/pending')
    .get(async (req, res) =>{
        friendService.getFriendRequests(req.app.get('db'), req.user.id)
        .then(result =>{
            res.json(result);
        })
    })
    
    
    friendRouter
    .use(requireAuth)
    .route('/:id')
    //changed accepted to true
    .patch(async (req, res) => {
        let friend_id  = req.params;
        friend_id = parseInt(friend_id.id)
        let confirm = await friendService.getFriendRequestById(req.app.get('db'), req.user.id, friend_id);
        if (!!confirm) {
            if (confirm.accepted) {
                return res.status(400).send({ error: 'friend request does not exist' });
            }
            const acceptance = await friendService.confirmFriend(req.app.get('db'), req.user.id, friend_id);
            return res.status(201).send(acceptance[0]);
        } else {
            res.status(400).send({ error: 'friend request does not exist' });
        }
    })
    //deletes a friend request
    .delete(async (req, res) => {
        let friend_id  = req.params;
        friend_id = parseInt(friend_id.id);
        let confirm = await friendService.getFriendRequestById(req.app.get('db'), req.user.id, friend_id);
        if (!!confirm) {
            await friendService.deleteFriend(req.app.get('db'), req.user.id, friend_id);
            res.status(201).send();
        } else {
            res.status(400).send({ error: 'friend request does not exist' });
        }
    })

module.exports = friendRouter;