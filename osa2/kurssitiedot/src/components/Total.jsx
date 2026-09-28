const Total = ({parts}) => {
  return (
    <div>
      <p>
        <b>
          total of {parts.reduce((sum, part) => 
            sum + part.exercises, 0)} exercises
        </b>
      </p>
    </div>
  )
}

export default Total