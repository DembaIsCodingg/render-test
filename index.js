require('dotenv').config()

const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

const app = express()

app.use(express.json())
app.use(cors())
app.use(express.static('dist'))

const errorHandler = (error, request, response, next) => {
  console.log(error.message)
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'wrong ID' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)

morgan.token('postData', (req) => {
  if (req.method === 'POST') {
    return JSON.stringify(req.body)
  }
  return '-'
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :postData'))

console.log('dddd')

app.get('/api/persons', (request, response) => {
  Person.find({}).then((person) => {
    response.json(person)
  })
})

app.get('/info', (request, response) => {
  const reqTime = new Date().toUTCString()
  Person.find({}).then((persons) => {
    const info = `Phonebook has info for ${persons.length} people`
    response.send(`
      <div>
          <h1>${info}</h1>
          <p>Request received at: ${reqTime}</p>
      </div>
    `)
  })
})

app.get('/api/persons/:id', (request, response) => {
  Person.findById(request.params.id).then((person) => {
    response.json(person)
  })
})

app.delete('/api/persons/:id', (request, response) => {
  const id = request.params.id
  Person.findOneAndDelete({ _id: id })
    .then((result) => {
      if (result === null) {
        response.status(404).json({ error: 'Person not found' })
      } else {
        response.status(204).end()
      }
    })
    .catch((error) => {
      console.error('Error deleting person:', error)
      response.status(500).json({ error: 'Internal server error' })
    })
})

app.post('/api/persons', (request, response) => {
  console.log('POST received')
  const body = request.body
  if (!body.name || !body.number) {
    return response.status(400).json({ error: 'Both name and number are required' })
  }

  const person = new Person({
    name: body.name,
    number: body.number
  })

  person.save().then((savedPerson) => {
    response.json(savedPerson)
  })
    .catch((error) => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body

  const person = {
    name: body.name,
    number: body.number
  }

  Person.findByIdAndUpdate(request.params.id, person, { new: true, runValidators: true, content: 'query' })
    .then((updatedNote) => {
      response.json(updatedNote)
    })
    .catch((error) => next(error))
})

const PORT = process.env.PORT || 3002
app.listen(PORT, () => {
  console.log(`Started on port ${PORT}`)
})
