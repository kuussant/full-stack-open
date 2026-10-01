import { useState, useEffect } from 'react'
import personService from './services/persons'
import Notification from './components/Notification'
import Alert from './components/Alert'

const PersonForm = ({onSubmit, name, number, nameHandler, numberHandler}) => {
  return (
    <div>
      <form onSubmit={onSubmit}>
        <div>
          name: <input value={name} onChange={nameHandler}/>
        </div>
        <div>
          number: <input value={number} onChange={numberHandler}/>
        </div>
        <div>
          <button type="submit">add</button>
        </div>
      </form>
    </div>
  )
}

const DeleteButton = ({id, name, onDelete}) => {
  return (
    <button onClick={() => onDelete(id, name)}>delete</button>
  )
}

const Person = ({id, name, number, onDelete}) => {
  return (
    <div>
      <p>
        {name} {number} <DeleteButton id={id} name={name} onDelete={onDelete}/>
      </p>
    </div>
  )
}

const Persons = ({persons, onDelete}) => {
  return (
    <div>
      {persons.map(person => 
        <Person key={person.id}
          id={person.id}
          name={person.name}
          number={person.number}
          onDelete={onDelete}
        />)}
    </div>
  )
}

const Filter = ({value, handler}) => {
  return (
    <div>
      filter shown with <input value={value} onChange={handler}/>
    </div>
  )
}

const App = () => {
  const [persons, setPersons] = useState([])
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [filter, setFilter] = useState('')
  const [notification, setNotification] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)
  
  useEffect(() => {
    personService
      .getAll()
      .then(initialPersons => {
        setPersons(initialPersons)
      })
  }, [])

  const handleNewName = (event) => {
    setNewName(event.target.value)
  }

  const handleNewNumber = (event) => {
    setNewNumber(event.target.value)
  }

  const handleFilter = (event) => {
    setFilter(event.target.value)
  }
  
  const handleNewPerson = (event) => {
    event.preventDefault()

    const existingPerson = persons.find(person => person.name === newName)

    if (existingPerson) {
      const message = `${newName} is already added to phonebook, replace the old number with a new one?`
      const confirmation = window.confirm(message)
      
      if (confirmation) {
        const updatedNumber = {
          ...existingPerson,
          number: newNumber
        }

        personService
          .update(existingPerson.id, updatedNumber)
          .then(() => setPersons(
            persons.map(person => person.id === existingPerson.id ? updatedNumber : person)
          ))
          .catch(error => {
            setErrorMessage(`Information of ${existingPerson.name} has already been removed from server`)
            setTimeout(() => {
              setErrorMessage(null)
            }, 5000)
            setPersons(persons.filter(p => p.id !== existingPerson.id))
          })
        
        setNewName('')
        setNewNumber('')
      }
      return
    }

    const newPerson = {
      name: newName,
      number: newNumber
    }

    personService
      .create(newPerson)
      .then(returnedPerson => {
        setPersons(persons.concat(returnedPerson))

        setNotification(`Added ${newName}`)

        setTimeout(() => {
          setNotification(null)  
        }, 5000)

        setNewName('')
        setNewNumber('')
      })
      .catch(error => {
        console.log(error.response.data)
        setErrorMessage(error.response.data.error)
        setTimeout(() => {
          setErrorMessage(null)
        }, 5000)
      })
  }

  const handelDeletePerson = (id, name) => {
    const confirmDel = window.confirm(`Delete ${name}?`)

    if (confirmDel) {
      personService
        .deletePerson(id)
        .then(() => {
          setPersons(persons.filter(person => person.id !== id))
        })
    }
  }

  const personsToShow = persons.filter(person => 
    person.name.toLowerCase().includes(filter.toLowerCase()))

  return (
    <div>
      <h2>Phonebook</h2>
      <Notification message={notification}/>
      <Alert message={errorMessage}/>
      <Filter value={filter} handler={handleFilter}/>

      <h3>Add a new</h3>

      <PersonForm
        onSubmit={handleNewPerson}
        name={newName}
        number={newNumber}
        nameHandler={handleNewName}
        numberHandler={handleNewNumber}
      />

      <h3>Numbers</h3>

      <Persons persons={personsToShow} onDelete={handelDeletePerson}/>
    </div>
  )

}

export default App