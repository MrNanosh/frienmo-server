const express = require('express');
const path = require('path');
const FavorService = require('./favor-service');
const FriendService = require('../friend/friend-service');
const { add } = require('date-fns');
const {
  requireAuth
} = require('../middleware/jwt-auth');
const favorRouter = express.Router();
const jsonBodyParser = express.json();
const AuthService = require('../Auth/auth-service');

favorRouter
  .route('/')
  .get(async (req, res) => {
    let {
      limit,
      page,
      filter
    } = req.query;
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
    //////////////////// this is req auth but without sending 401s back on failure
    const authToken =
      req.get('Authorization') || '';

    let bearerToken;
    if (
      !authToken
        .toLowerCase()
        .startsWith('bearer ')
    ) {
      return res.status(401).json({
        error: 'Missing bearer token'
      });
    } else {
      bearerToken = authToken.slice(
        7,
        authToken.length
      );
    }
    const payload = AuthService.verifyJwt(
      bearerToken
    );
    const user = await AuthService.getUserWithUserName(
      req.app.get('db'),
      payload.sub
    );
    ///////////////
    favors = FavorService.favorFilter(
      favors,
      user,
      filter
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
      //TODO: issuer could be anybody tighten validation

      let {
        favor_id,
        users_id,
        receiver_id
      } = req.body;

      //CHECK make sure this is the right kind of validation
      if (
        !(req.user.id !== users_id) &&
        !(req.user.id !== receiver_id)
      ) {
        return res.status(403).send({
          error:
            'user isnt involved in this transaction'
        });
      }

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
            outstanding[i].id,
            receiver_id,
            users_id
          );

          const updatedOutstanding = await FavorService.getOutstandingById(
            req.app.get('db'),
            outstanding[i].id
          );

          let newFavor = await FavorService.getFavorById(
            db,
            favor_id
          );

          newFavor = newFavor.find(
            favor =>
              favor.outstanding_id ===
              updatedOutstanding.id
          );
          return res
            .status(204)
            .json(newFavor);
          // 204 is appropriate for this case
        }
      }

      // get a favor to check the limit if you can't find a null one.
      let favor = await FavorService.getFavorById(
        db,
        favor_id
      );
      favor = favor[0];
      if (
        outstanding.length < favor.limit
      ) {
        //allow issuing of favor
        let newOutstanding = await FavorService.insertOutstanding(
          db,
          {
            favor_id,
            users_id,
            receiver_id,
            receiver_redeemed: false,
            giver_redeemed: false
          }
        );

        let newFavor = await FavorService.getFavorById(
          db,
          favor_id
        );

        newFavor = newFavor.find(
          favor =>
            favor.outstanding_id ===
            newOutstanding[0].id
        );

        return res
          .status(201)
          .json(newFavor);
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
      let {
        limit,
        page,
        filter
      } = req.query;
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
      favors = FavorService.favorFilter(
        favors,
        req.user,
        filter
      );
      return res
        .status(200)
        .json({ favors, page, limit });
    }
  )
  .get('/friend', async (req, res) => {
    let db = req.app.get('db');
    let {
      limit,
      page,
      filter
    } = req.query;
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
    favors = FavorService.filterOtherExpired(
      favors,
      req.user
    );
    favors = FavorService.favorFilter(
      favors,
      req.user,
      filter
    );
    return res
      .status(200)
      .json({ favors, page, limit });
  })
  .get('/public', async (req, res) => {
    let db = req.app.get('db');
    let {
      limit,
      page,
      filter
    } = req.query;
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
    favors = FavorService.filterOtherExpired(
      favors,
      req.user
    );
    favors = FavorService.favorFilter(
      favors,
      req.user,
      filter
    );
    return res
      .status(200)
      .json({ favors, page, limit });
  })
  .patch(
    '/redeem/:favor_id',
    jsonBodyParser,
    async (req, res) => {
      //TODO: validate for the expiration date as well
      //gets specific ticket
      const db = req.app.get('db');
      let { outstanding_id } = req.body;

      let confirmation = await FavorService.getFavorById(
        db,
        req.params.favor_id
      );

      console.log(
        confirmation[0].expiration_date.toLocaleString(),
        new Date().toLocaleString()
      );
      if (
        confirmation[0].expiration_date.toLocaleString() <
        new Date().toLocaleString()
      ) {
        return res.status(401).send({
          error: 'favor has expired'
        });
      }

      // new Date(expiration_date).toLocaleString()
      // new Date(currentFavor.expiration_date).toLocaleString()

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

      //console.log(person, ticket);
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
          //TODO: make sure the expiration is a later date

          expiration_date = add(
            Date.now(),
            {
              months: 1,
              days: 1,
              hours: 1,
              minutes: 1,
              seconds: 1
            }
          );
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
          posted: posted
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
        let [
          outRes
        ] = await FavorService.insertOutstanding(
          req.app.get('db'),
          newOutstanding
        );
        res
          .status(201)
          .location(
            path.posix.join(
              req.originalUrl,
              `/${outRes.favor_id}`
            )
          )
          .json(outRes);
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
    const { filter } = req.query;
    let allOutstanding = await FavorService.getFavorById(
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
    //TODO: add pagination?

    allOutstanding = FavorService.favorFilter(
      allOutstanding,
      req.user,
      filter
    );

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
      const favor = await FavorService.getFavorById(
        db,
        req.params.id
      );

      const currentFavor = favor[0]; //done for comparison purposes
      //
      //dates must be larger
      if (expiration_date) {
        if (
          new Date(
            expiration_date
          ).toLocaleString() >=
          new Date(
            currentFavor.expiration_date
          ).toLocaleString()
        ) {
          let date = new Date(
            expiration_date
          );
          newFields = {
            ...newFields,
            expiration_date: date
          };
        } else {
          return res.status(400).json({
            error:
              'can only increase date'
          });
        }
      }

      if (limit) {
        if (
          limit < outstanding.length
        ) {
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
      await FavorService.updateFavor(
        db,
        req.params.id,
        newFields
      );

      return res.status(204).end();
    }
  )
  .delete(async (req, res) => {
    await FavorService.deleteFavor(
      req.app.get('db'),
      req.params.id
    );
    return res.status(204).end();
  });

favorRouter
  .use(requireAuth)
  .route('/count/:id')
  .get(async (req, res) => {
    const { id } = req.params;
    //get all the outstanding for the favor
    const outstanding = await FavorService.getOutstanding(
      req.app.get('db'),
      id
    );
    //get the favor
    const favor = await FavorService.getFavorById(
      req.app.get('db'),
      id
    );
    const num =
      favor[0].limit -
      outstanding.length;
    const result = {
      remaining: num
    };

    res.json(result);
  });

module.exports = favorRouter;
