const Alert = ({ message }) => {
  if (message === null) {
    return null
  }
  
  return (
    <div className="alert">
      {message}
    </div>
  )
}

export default Alert