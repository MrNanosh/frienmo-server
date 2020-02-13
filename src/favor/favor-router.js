const express = require('express');
const path = require('path');
const FavorService = require('./favor-service');

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
  .post(
    '/issue',
    jsonBodyParser,
    async (req, res) => {
      let {
        favor_id,
        users_id,
        receiver_id
      } = req.body;
      //TODO:validation needed
      let db = req.app.get('db');
      let outstanding = await FavorService.getOutstanding(
        db,
        favor_id
      );
      let favor = await FavorService.getFavorById(
        db,
        favor_id
      );
      if (
        outstanding.length < favor.limit
      ) {
        //allow issuing of favor
        return await FavorService.insertOutstanding(
          db,
          {
            favor_id,
            users_id,
            receiver_id,
            receiver_redeemed: false,
            giver_redeemed: false
          }
        );
      } else {
        return res.status(403).json({
          error:
            'cannot issue any more of these favors without increasing limit'
        });
      }
    }
  )
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
        req.params.favor_id
      )[0];
      if (!ticket) {
        return res.status(404).json({
          error: 'favor must exist'
        });
      }
      //must be not redeemed by the user
      if (!req.user) {
        return res.status(401).json({
          error:
            'you must be logged in to redeem a favor'
        });
      } else {
        let person = req.user.id;
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
      }
      if (
        ticket.receiver_id === person
      ) {
        redeemedTicket = await FavorService.redeem(
          db,
          outstanding_id,
          { receiver_redeemed: true }
        );
      }
      return res.status(204);
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
          expiration_date = null;
        }
        if (!publicity) {
          publicity = 'dm';
        }
        if (!user_location) {
          user_location = '';
        }
        if (!limit) {
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
        }

        let favorRes = await FavorService.insertFavor(req.app.get('db'), newFavor);
        let newOutstanding = {
          favor_id: favorRes[0].id,
          users_id: favorRes[0].creator_id,
          receiver_id: null,
          receiver_redeemed: false,
          giver_redeemed: false
        }
        let outRes = await FavorService.insertOutstanding(req.app.get('db'), newOutstanding);
        res.status(201).send();
      } catch (error) {
        next(error);
      }
    }
  );

favorRouter
  .use(requireAuth)
  .route('/:id')
  .get(async (req, res) => {
    const favor = await FavorService.getFavorById(
      req.app.get('db'),
      req.params.id
    );
    if (!favor) {
      return res.status(401).json({
        error: 'favor non-existent'
      });
    }
    return res.status(200).json(favor);
  })
  .patch(
    jsonBodyParser,
    async (req, res) => {
      const db = req.app.get('db');
      // allowed: update any field if favor_outstanding does not reference its id
      const outstanding = await FavorService.getOutstanding(db, req.params.id);

      let { expiration_date, tags, category, user_location, limit } = req.body;

      let newFields;

      if (outstanding.length === 0) {
        let { title, description, publicity } = req.body;
        newFields = { title, description };
      }
      const currentFavor = await FavorService.getFavorById(db, req.params.id);
      //dates must be larger
      if (new Date(expiration_date).toLocaleString() >=
        new Date(currentFavor.expiration_date).toLocaleString()) {
        if (!!expiration_date) {
          newFields.expiration_date = expiration_date;
        }
      } else {
        return res.status(400).json({
          error:
            'can only increase date'
        });
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
        expiration_date,
        tags,
        category,
//        publicity,
        user_location,
        limit,
//        title,
//        description
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
