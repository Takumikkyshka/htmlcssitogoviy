function Loader() {
  return (
    <div className="loader-overlay">
      <div className="loader-spinner">
        <div className="loader-circle"></div>
        <div className="loader-circle"></div>
        <div className="loader-circle"></div>
      </div>
      <p className="loader-text">Загрузка...</p>
    </div>
  )
}

export default Loader

