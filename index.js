const express = require('express');
const morgan = require('morgan')
const app = express();
app.use(express.json())

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


let persons = [
  {
    "id": 1,
    "name": "Arto Hellas",
    "number": "040-123456"
  },
  {
    "id": 2,
    "name": "Ada Lovelace",
    "number": "39-44-5323523"
  },
  {
    "id": 3,
    "name": "Dan Abramov",
    "number": "12-43-234345"
  },
  {
    "id": 4,
    "name": "Mary Poppendieck",
    "number": "39-23-6423122"
  }
]

app.get('/api/persons', (req, res) => {
  res.json(persons);
})

app.get('/api/info', (req, res) => {
  const personsCount = persons.length;
  const currentDate = new Date(Date.now());

  const htmlResponse = `
  <p>Phonebook has info for ${personsCount} people</p>
  <p>${currentDate}</p>
  `

  res.send(htmlResponse)
})

app.get('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id);
  const person = persons.find(person => person.id === id);

  if (!person) return res.status(404).end();

  res.send(person)
})

app.delete('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id);
  persons = persons.filter(person => person.id !== id);
  res.status(204).end()
})

const generateId = () => {
  let foundRandomId = false;
  let randomId = 0;
  const min = 1;
  const max = 100;

  if (persons.length >= max) throw new Error('could not generate a unique id for new person')

  while (!foundRandomId) {
    randomId = Math.floor(Math.random() * (max - min + 1) + min)
    foundRandomId = !persons.find(person => Number(person.id) === randomId)
  }

  return randomId;
}

const sendErrorResponse = (res, statusCode, message) => {
  return res.status(statusCode).json({
    error: message
  })
}


app.post('/api/persons', (req, res) => {

  if (!req.body.name) return sendErrorResponse(res, 400, 'name is missing');
  if (!req.body.number) return sendErrorResponse(res, 400, 'number is missing');

  const isduplicateName = !!persons.find(person => person.name.toLocaleLowerCase().match(req.body.name.toLocaleLowerCase()))
  if (isduplicateName) return sendErrorResponse(res, 400, 'name must be unique');

  const newId = generateId();
  if (!newId) return sendErrorResponse(res, 400, 'could not generate a unique id for new person')

  const newPerson = {
    ...req.body,
    id: newId
  }

  persons = persons.concat(newPerson)

  res.json(newPerson);

})


const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})