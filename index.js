require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

const app = express()
app.use(express.json())
app.use(cors())
app.use(express.static('dist'))

morgan.token('request-body', (req) => {
  if (req.method !== 'POST') return

  return JSON.stringify(req.body)
})

const morganLogger = morgan(function (tokens, req, res) {
  return [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'), '-',
    tokens['response-time'](req, res), 'ms',
    tokens['request-body'](req, res)
  ].join(' ')
})

app.use(morganLogger)

app.get('/api/persons/:id', (req, res, next) => {
  Person.findById(req.params.id)
    .then(person => {
      if (person) {
        res.json(person)
      } else {
        res.status(404).end()
      }
    }).catch(error => next(error))
})

app.get('/api/persons', (req, res, next) => {
  Person.find({})
    .then(people => {
      res.json(people)
    }).catch(error => next(error))
})

app.get('/api/info', (req, res, next) => {
  // get the number of person records from db
  Person.countDocuments()
    .then(peopleCount => {
      const currentDate = new Date(Date.now())

      const htmlResponse = `
    <p>Phonebook has info for ${peopleCount} people</p>
    <p>${currentDate}</p>
    `
      res.send(htmlResponse)
    }).catch(error => next(error))
})

app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndDelete(req.params.id, { strict: true })
    .then(result => {
      if (!result) throw Error('already deleted')
      res.status(204).end()
    }).catch(err => next(err))
})

const sendErrorResponse = (res, statusCode, message) => {
  return res.status(statusCode).json({
    error: message
  })
}


app.post('/api/persons', (req, res, next) => {

  if (!req.body.name) return sendErrorResponse(res, 400, 'name is missing')
  if (!req.body.number) return sendErrorResponse(res, 400, 'number is missing')

  const newPerson = new Person({
    name: req.body.name,
    number: req.body.number
  })

  newPerson.save()
    .then(person => {
      res.json(person)
    }).catch(error => next(error))
})

// update existing user's phone number
app.put('/api/persons/:id', (req, res, next) => {
  const id = req.params.id
  if (!id) return sendErrorResponse(res, 400, 'person id is missing')

  const { name, number } = req.body

  Person.findByIdAndUpdate(
    id,
    { name, number },
    { new: true, runValidators: true, context: 'query' }
  )
    .then(person => {
      res.json(person)
    }).catch(error => next(error))
})

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (err, req, res, next) => {
  console.error('errorHandler err.name', err.name)
  console.error('errorHandler err.message', err.message)

  if (err.name === 'CastError') {
    return res.status(400).send({ error: 'malformatted id' })
  } else if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message })
  }

  next(err)
}

// this has to be the last loaded middleware.
app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})