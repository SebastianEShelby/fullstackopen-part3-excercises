const mongoose = require('mongoose')
require('dotenv').config()

if (!process.env.MONGO_USERNAME || !process.env.MONGO_PASSWORD) {
  console.log('set username and password in .env file')
  process.exit(1)
}

const url =
  `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@homebrew.gbcyj2u.mongodb.net/phonebook?retryWrites=true&w=majority`

mongoose.set('strictQuery', false)
mongoose.connect(url)

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Person = mongoose.model('Person', personSchema)

if (process.argv.length > 2) {

  const name = process.argv[2]
  const number = process.argv[3]

  if (!name || !number) {
    console.log('please pass a valid name and number in commandline arguments')
    process.exit(2)
  }

  const person = new Person({
    name: name,
    number: number
  })

  person.save().then(result => {
    console.log(`added ${result.name} number ${result.number ?? 'Number Not found'} to phonebook`)
    mongoose.connection.close()
  })

} else {

  Person.find({}).then(people => {
    console.log('phonebook:')
    people.forEach(person => {
      console.log(`${person.name} ${person.number}`)
    })
    mongoose.connection.close()
  })

}