const express = require('express');
const app = express();
app.use(express.json())

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
    console.log('randomId', randomId);
  }

  return randomId;
}

app.post('/api/persons', (req, res) => {

  const newId = generateId();

  if (!newId) return res.status(400).json({
    error: 'could not generate a unique id for new person'
  })

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