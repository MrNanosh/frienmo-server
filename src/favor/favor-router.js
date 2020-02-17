const express = require('express');
const path = require('path');
const FavorService = require('./favor-service');
const FriendService = require('../friend/friend-service');
const {
  requireAuth
} = require('../middleware/jwt-auth');
const favorRouter = express.Router();
const jsonBodyParser = express.json();
favorRouter
  .route('/')
  .get(async (req, res) => {
    let { limit, page } = req.query;
    if (!limit) {
      limit = 30;
    }
    if (!page) {
      page = 1;
    }
    let favors = await FavorService.getAllFavors(
      req.app.get('db'),
      limit,
      page
    );

    return res
      .status(200)
      .json({ favors, page, limit });
  });
favorRouter
  .use(requireAuth)
  .route('/issue')
  .post(
    jsonBodyParser,
    async (req, res) => {
      let {
        favor_id,
        users_id,
        receiver_id
      } = req.body;

      let db = req.app.get('db');

      let outstanding = await FavorService.getOutstanding(
        db,
        favor_id
      );

      for (
        let i = 0;
        i < outstanding.length;
        i++
      ) {
        if (
          outstanding[i].receiver_id ===
          null
        ) {
          await FavorService.updateOutstanding(
            req.app.get('db'),
            outstanding.id,
            receiver_id,
            users_id
          );

          const updatedOutstanding = FavorService.getOutstandingById(
            req.app.get('db'),
            outstanding.id
          );

          return res
            .status(204)
            .json(updatedOutstanding);
          // 204 is appropriate for this case
        }
      }

      // get a favor to check the limit if you can't find a null one.
      let favor = await FavorService.getFavorById(
        db,
        favor_id
      );

      if (
        outstanding.length < favor.limit
      ) {
        //allow issuing of favor
        await FavorService.insertOutstanding(
          db,
          {
            favor_id,
            users_id,
            receiver_id,
            receiver_redeemed: false,
            giver_redeemed: false
          }
        );
        return res.status(201).send();
      } else {
        return res.status(403).json({
          error:
            'cannot issue any more of these favors without increasing limit'
        });
      }
    }
  );
favorRouter
  .use(requireAuth)
  .get(
    '/personal',
    async (req, res) => {
      let db = req.app.get('db');
      let { limit, page } = req.query;
      let user_id = req.user.id;
      if (!user_id) {
        return res
          .status(404)
          .json(
            'must have an authorized account to use'
          );
      }
      if (!limit) {
        limit = 30;
      }
      if (!page) {
        page = 1;
      }
      let favors = await FavorService.getPersonalFavors(
        db,
        user_id,
        limit,
        page
      );
      return res
        .status(200)
        .json({ favors, page, limit });
    }
  )
  .get('/friend', async (req, res) => {
    let db = req.app.get('db');
    let { limit, page } = req.query;
    let user_id = req.user.id;
    if (!user_id) {
      return res
        .status(404)
        .json(
          'must have an authorized account to use'
        );
    }
    if (!limit) {
      limit = 30;
    }
    if (!page) {
      page = 1;
    }
    let favors = await FavorService.getFavorByFriends(
      db,
      user_id,
      limit,
      page
    );
    return res
      .status(200)
      .json({ favors, page, limit });
  })
  .get('/public', async (req, res) => {
    let db = req.app.get('db');
    let { limit, page } = req.query;
    let user_id = req.user.id;
    if (!user_id) {
      return res
        .status(404)
        .json(
          'must have an authorized account to use'
        );
    }
    if (!limit) {
      limit = 30;
    }
    if (!page) {
      page = 1;
    }
    let favors = await FavorService.getPublicFavors(
      db,
      user_id,
      limit,
      page
    );
    return res
      .status(200)
      .json({ favors, page, limit });
  })
  .patch(
    '/redeem/:favor_id',
    jsonBodyParser,
    async (req, res) => {
      //gets specific ticket
      const db = req.app.get('db');
      let { outstanding_id } = req.body;

      let confirmation;

      //favor must exist
      let ticket = await FavorService.getOutstanding(
        db,
        Number(req.params.favor_id)
      );
      ticket = ticket[0];
      if (!ticket) {
        return res.status(404).json({
          error: 'favor must exist'
        });
      }
      //must be not redeemed by the user
      let person;
      if (!req.user) {
        return res.status(401).json({
          error:
            'you must be logged in to redeem a favor'
        });
      } else {
        person = req.user.id;
      }
      let redeemedTicket;
      if (
        ticket.giver_redeemed === true
      ) {
        res.status(403).json({
          error:
            'this favor has already been redeemed'
        });
      }

      console.log(person, ticket);
      if (ticket.users_id === person) {
        if (
          ticket.receiver_redeemed ===
          false
        ) {
          return res.status(403).json({
            error:
              'this user may not yet confirm the favor'
          });
        }
        redeemedTicket = await FavorService.redeem(
          db,
          outstanding_id,
          { giver_redeemed: true }
        );
      } else if (
        ticket.receiver_id === person
      ) {
        redeemedTicket = await FavorService.redeem(
          db,
          outstanding_id,
          { receiver_redeemed: true }
        );
      } else {
        return res.status(403).json({
          error:
            'this user is unrelated'
        });
      }

      return res.status(204).end();
    }
  );

favorRouter
  .use(requireAuth)
  .route('/')
  .post(
    jsonBodyParser,
    async (req, res, next) => {
      let {
        title,
        description,
        tags,
        category,
        expiration_date,
        publicity,
        user_location,
        limit
      } = req.body;

      for (const field of [
        'title',
        'description'
      ]) {
        if (!req.body[field])
          return res.status(400).json({
            error: `Missing '${field}' in request body`
          });
      }

      try {
        let posted = new Date();
        if (!req.user.id) {
          throw new Error('protected');
        }
        let creator_id = req.user.id;
        //TODO: validate tags
        //TODO: handle tags
        if (!tags) {
          tags = '';
        }
        if (!category) {
          category = 1;
        }
        if (!expiration_date) {
          expiration_date = Date.now();
        }
        if (!publicity) {
          publicity = 'dm';
        }
        if (!user_location) {
          user_location = '';
        }
        if (!limit || limit < 1) {
          limit = 2000000000;
        }

        let newFavor = {
          title: title,
          description: description,
          creator_id: req.user.id,
          tags: tags,
          category: category,
          expiration_date: expiration_date,
          publicity: publicity,
          user_location: user_location,
          limit: limit,
          posted: null
        };

        let favorRes = await FavorService.insertFavor(
          req.app.get('db'),
          newFavor
        );
        //TODO: ask the team about this
        let newOutstanding = {
          favor_id: favorRes[0].id,
          users_id:
            favorRes[0].creator_id, //might be better as null by default
          receiver_id: null,
          receiver_redeemed: false,
          giver_redeemed: false
        }; //uhhhhhhhhhhhhhhhh make sure this is right cause it might not be right (user vs receiver)
        let outRes = await FavorService.insertOutstanding(
          req.app.get('db'),
          newOutstanding
        );
        res.status(201).send();
      } catch (error) {
        next(error);
      }
    } ///make sure this is right
  );

favorRouter
  .use(requireAuth)
  .route('/:id')
  .get(async (req, res) => {
    /**should be able to get only the ones that they are allowed to get
     *it should filter favors where the user id matches the auth user
     *or the receiver id matches the auth user
     *or the creator id matches the auth user
     *or any public one
     */
    const allOutstanding = await FavorService.getFavorById(
      req.app.get('db'),
      req.params.id
    );

    const favor = allOutstanding[0];

    if (!favor) {
      return res.status(401).json({
        error: 'favor non-existent'
      });
    }

    let authuser = req.user.id;
    if (favor.publicity !== 'public') {
      //if it returns a non public favor
      if (
        authuser !== favor.issuer_id ||
        authuser !==
          favor.receiver_id ||
        authuser !== favor.creator_id
      ) {
        if (
          favor.publicity === 'friends'
        ) {
          const issuerFriends = FriendService.getFriends(
            db,
            favor.issuer_id
          );
          const receiverFriends = FriendService.getFriends(
            db,
            favor.receiver_id
          );
          const creatorFriends = FriendService.getFriends(
            db,
            favor.creator_id
          );
          const hasIssuerAsFriend = (
            await issuerFriends
          ).reduce(
            (acc, curr) =>
              curr.id === authuser
                ? true
                : acc,
            false
          );
          const hasReceiverAsFriend = (
            await receiverFriends
          ).reduce(
            (acc, curr) =>
              curr.id === authuser
                ? true
                : acc,
            false
          );
          const hasCreatorAsFriend = (
            await creatorFriends
          ).reduce(
            (acc, curr) =>
              curr.id === authuser
                ? true
                : acc,
            false
          );
          if (
            !hasIssuerAsFriend ||
            !hasReceiverAsFriend ||
            !hasIssuerAsFriend
          ) {
            return res
              .status(403)
              .json({
                error:
                  'unable to use access this favor'
              });
          }
        } else {
          return res.status(403).json({
            error:
              'unable to use access this favor'
          });
        }
      }
    }

    return res
      .status(200)
      .json(allOutstanding);
  })
  .patch(
    jsonBodyParser,
    async (req, res) => {
      const db = req.app.get('db');
      // allowed: update any field if favor_outstanding does not reference its id
      const outstanding = await FavorService.getOutstanding(
        db,
        req.params.id
      );

      let {
        expiration_date,
        tags,
        category,
        user_location,
        limit
      } = req.body;

      let newFields = {};

      if (outstanding.length === 0) {
        let {
          title,
          description,
          publicity
        } = req.body;
        newFields = {
          title,
          description
        };
      }
      const currentFavor = await FavorService.getFavorById(
        db,
        req.params.id
      );
      //dates must be larger
      if (
        new Date(
          expiration_date
        ).toLocaleString() >=
        new Date(
          currentFavor.expiration_date
        ).toLocaleString()
      ) {
        if (!!expiration_date) {
          newFields.expiration_date = new Date(
            expiration_date
          ).toLocaleString();
        }
      } else {
        return res.status(400).json({
          error:
            'can only increase date'
        });
      }

      if (limit) {
        if (limit < outstanding.limit) {
          return res.status(400).json({
            error:
              'can not decrease limit below outstanding favors'
          });
        }
      }

      newFields = {
        ...newFields,
        tags,
        category,
        user_location,
        limit
      };
      const updatedFavor = await FavorService.updateFavor(
        db,
        req.params.id,
        newFields
      );

      return res
        .status(201)
        .json(updatedFavor);
    }
  )
  .delete(async (req, res) => {
    await FavorService.deleteFavor(
      req.app.get('db'),
      req.params.id
    );
    return res.status(204).end();
  });

module.exports = favorRouter;
