require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const Person = require('./models/person.cjs')

const app = express()

app.use(express.json())
app.use(express.static('dist'))
app.use(
    morgan(function (tokens, req, res) {
        return [
            tokens.method(req, res),
            tokens.url(req, res),
            tokens.status(req, res),
            tokens.res(req, res, 'content-length'), '-',
            tokens['response-time'](req, res), 'ms',
            JSON.stringify(req.body)
        ].join(' ')
    }))


app.get('/', (request, response) => {
    response.send('<h1>Hello world!</h1>')
})


app.get('/api/persons', (request, response) => {
    console.log("found")
    Person.find({}).then(result => {
        response.json(result)
    })
})


app.get('/info', async (request, response) => {
    var person_count = await Person.countDocuments()

    response.send(`Phonebook has info for ${person_count} people </br></br>${new Date()}`)
})


app.get('/api/persons/:id', (request, response, next) => {
    console.log("found")
    Person.findById(request.params.id).then(person => {
        if (person) {
            response.json(person)
        } else {
            response.status(404).end()
        }
    }).catch(error => next(error))
})


app.put('/api/persons/:id', (request, response) => {
    const { name, number } = request.body

    Person.findById(request.params.id)
        .then(person => {
            if (!person) {
                return response.status(404).end()
            }

            person.name = name
            person.number = number

            return person.save().then((updatedNumber) => {
                response.json(updatedNumber)
            })
        })
        .catch(error => next(error))
})


app.delete('/api/persons/:id', (request, response, error) => {
    Person.findByIdAndDelete(request.params.id)
        .then(result => {
            response.status(204).end()
        })
        .catch(error => next(error))
})


app.post('/api/persons', async (request, response, next) => {
    const body = request.body

    if (await Person.findOne({ name: body.name })) {
        return response.status(400).json({
            error: `${body.name} already exists`
        })
    }

    const person = new Person({
        name: body.name,
        number: body.number
    })

    person.save().then(savedPerson => {
        response.json(savedPerson)
    }).catch(error => next(error))
})


const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)


const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message })
    }

    next(error)
}

app.use(errorHandler)


const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})