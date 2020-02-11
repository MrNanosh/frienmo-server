const app = require('./app')
const knex = require('knex')
require('dotenv').config()
const { PORT, DATABASE_URL } = require('./config')

const db = knex({
  client: 'pg',
  connection: DATABASE_URL,
})

app.set('db', db)

app.use((error, req, res, next) => {
  let response
  if (process.env.NODE_ENV === 'production') {
    response = { error: { message: 'server error' }}
  } else {
    response = { error }
  }
  res.status(500).json(response)
})

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`)
})