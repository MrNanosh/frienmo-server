const { JsonWebTokenError } = require('jsonwebtoken')
const AuthService = require('../auth/auth-service')

async function requireAuth(req, res, next) {
  const authToken = req.get('Authorization') || ''

  let bearerToken
  if (!authToken.toLowerCase().startsWith('bearer ')) {
    console.log('1');
    return res.status(401).json({ error: 'Missing bearer token' })
  } else {
    bearerToken = authToken.slice(7, authToken.length)
  }

  try {
    const payload = AuthService.verifyJwt(bearerToken)

    const user = await AuthService.getUserWithUserName(
      req.app.get('db'),
      payload.sub,
    )

    if (!user){
      console.log('2');
      return res.status(401).json({ error: 'Unauthorized request' })
    }

    req.user = user
    next()
  } catch (error) {
    if (error instanceof JsonWebTokenError){
      console.log('3');
      return res.status(401).json({ error: 'Unauthorized request' })
    }

    next(error)
  }
}

module.exports = {
  requireAuth,
}