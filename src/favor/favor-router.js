const express = require('express');
const path = require('path');
const FavorService = require('./favor-service');

const userRouter = express.Router();
const jsonBodyParser = express.json();

userRouter
  .route('/')
  .post(
    jsonBodyParser,
    async (req, res, next) => {
      let {title, description,receiver_id,} = req.body;

      for (const field of [])
        if (!req.body[field])
          return res.status(400).json({
            error: `Missing '${field}' in request body`
          });

      try {
        const passwordError = UserService.validatePassword();

        if (passwordError)
          return res.status(400).json({
            error: passwordError
          });

        const hasUserWithUserName = await UserService.hasUserWithUserName(
          req.app.get('db'),
          username
        );

        if (hasUserWithUserName)
          return res.status(400).json({
            error: `Username already taken`
          });

        const hashedPassword = await UserService.hashPassword(
          password
        );

        const newUser = {
          username,
          password: hashedPassword,
          name,
          phone,
          description
        };

        const user = await UserService.insertUser(
          req.app.get('db'),
          newUser
        );

        res
          .status(201)
          .location(
            path.posix.join(
              req.originalUrl,
              `/${user.id}`
            )
          )
          .json(
            UserService.serializeUser(
              user
            )
          );
      } catch (error) {
        next(error);
      }
    }
  )
  .get('/', (req, res) => {
    UserService.getAllUsers(
      req.app.get('db')
    ).then(result => {
      res.json(result);
    });
  });

userRouter
  .route('/:id')
  .get((req, res) => {
    const { id } = req.params;
    UserService.getUserById(
      req.app.get('db'),
      id
    ).then(result => {
      if (!result) {
        res.status(404).send({
          error: 'user not found'
        });
      }
      res.json(result);
    });
  })
  .patch(async (req, res) => {});
  .delete(async (req, res) => {});
  

userRouter
  .get('/personal', (req, res) => {
    const { id } = req.params;
    UserService.getUserById(
      req.app.get('db'),
      id
    ).then(result => {
      if (!result) {
        res.status(404).send({
          error: 'user not found'
        });
      }
      res.json(result);
    });
  })
  .get('/friend', (req, res) => {
    const { id } = req.params;
    UserService.getUserById(
      req.app.get('db'),
      id
    ).then(result => {
      if (!result) {
        res.status(404).send({
          error: 'user not found'
        });
      }
      res.json(result);
    });
  });

module.exports = favorRouter;
