import { useEffect, useState } from 'react'
import countriesService from './services/countries'

const Filter = ({value, handler}) => {
  return (
    <div>
      filter shown with <input value={value} onChange={handler}/>
    </div>
  )
}

const CountryNameList = ({countries, onShow}) => {
  return (
    <div>
      {countries.map(country => 
        <div key={country.cca2}>{country.name.common} <ShowButton id={country.cca2} onShow={onShow}/></div>
      )}
    </div>
  )
}

const ShowButton = ({id, onShow}) => {
  return (
    <button onClick={() => onShow(id)}>Show</button>
  )
}

const ReturnButton = ({onReturn}) => {
  return (
    <button onClick={() => onReturn()}>Return</button>
  )
}

const Country = ({country, selected = false, onReturn}) => {
  return (
    <div>
      <h1>{country.name.common} {selected ? <ReturnButton onReturn={onReturn}/> : null}</h1>
      Capital {country.capital}
      <br/>
      Area {country.area}
      <h2>Languages</h2>
      <ul>
        {Object.entries(country.languages).map(language => 
          <li key={language[0]}>{language[1]}</li>
        )}
      </ul>
      <img src={country.flags['png']} alt={country.flags['alt']}/>
    </div>
  )
}

const Countries = ({showMax, countries, shownCountry, onShow, onReturn}) => {
  // console.log(countries)
  
  if (shownCountry !== null) {
    return (
      <Country country={shownCountry} selected={true} onReturn={onReturn}/>
    )
  } else if (countries.length === 1) {
    const country = countries[0]
    return (
      <div>
        <Country country={country}/>
      </div>
    )
  } else if (countries.length > showMax) {
    return (
      <div>
        Too many matches, specify another filter
      </div>
    )
  }

  return (
    <div>
      <CountryNameList countries={countries} onShow={onShow} onReturn={onReturn}/>
    </div>
  )
}

function App() {
  const MAXCOUNTRIES = 10

  const [filter, setFilter] = useState('')
  const [countries, setCountries] = useState([])
  const [showCountry, setShowCountry] = useState(null)

  useEffect(() => {
    countriesService
      .getAll()
      .then(initialCountries => {
        setCountries(initialCountries)
      })
  }, [])

  const filterHandler = (event) => {
    setFilter(event.target.value)
  }

  const countriesToShow = countries.filter(country => 
    country.name.common.toLowerCase().includes(filter.toLowerCase()))
  
  const showCountryHandler = (id) => {
    for (const i in countriesToShow) {
      const country = countriesToShow[i]

      if (country.cca2 === id) {
        // console.log(`found ${id}`)
        setShowCountry(country)
        break
      }
    }
  }

  const returnHandler = () => {
    // console.log('clicked return')
    setShowCountry(null)
  }

  return (
    <div>
      <Filter value={filter} handler={filterHandler}/>
      <Countries showMax={MAXCOUNTRIES} 
        countries={countriesToShow} 
        shownCountry={showCountry} 
        onShow={showCountryHandler} 
        onReturn={returnHandler}
      />
    </div>
  )
}

export default App
