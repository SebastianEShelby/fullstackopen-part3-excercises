require('dotenv').config()
const express = require('express');
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

const app = express();
app.use(express.json())
app.use(cors());
app.use(express.static('dist'))

morgan.token('request-body', (req, res) => {
  if (req.method !== 'POST') return;

  return JSON.stringify(req.body);
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

app.get('/api/persons', (req, res) => {
  Person.find({}).then(people => {
    res.json(people)
  })
})

app.get('/api/info', (req, res) => {

  Person.countDocuments().then(peopleCount => {
    const currentDate = new Date(Date.now());

    const htmlResponse = `
    <p>Phonebook has info for ${peopleCount} people</p>
    <p>${currentDate}</p>
    `
    res.send(htmlResponse)
  })

})

app.get('/api/persons/:id', (req, res) => {
  const id = req.params.id;

  Person.findById(id).then(person => {
    if (!person) return res.status(404).end();

    res.send(person)
  })
})

app.delete('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id);
  persons = persons.filter(person => person.id !== id);
  res.status(204).end()
})

const sendErrorResponse = (res, statusCode, message) => {
  return res.status(statusCode).json({
    error: message
  })
}


app.post('/api/persons', (req, res) => {

  if (!req.body.name) return sendErrorResponse(res, 400, 'name is missing');
  if (!req.body.number) return sendErrorResponse(res, 400, 'number is missing');

  const newPerson = new Person({
    name: req.body.name,
    number: req.body.number
  });

  newPerson.save().then(person => {
    res.json(person);
  })
})

app.put('/api/persons/:id', (req, res) => {
  const id = req.params.id;

  if (!id) return sendErrorResponse(res, 400, 'person id is missing');

  Person.findByIdAndUpdate(id, { number: req.body.number })
    .then(person => {
      res.json(person);
    })
})


const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})