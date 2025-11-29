function SearchSection() {
  return (
    <section className="search-section">
      <div className="search-container">
        <div className="search-box">
          <input type="text" className="search-input" placeholder="Искать товары, бренды, категории..." />
          <button className="search-button">
            <img src="/assets/imgs/icons8-поиск-50.png" alt="Поиск" className="search-icon" />
          </button>
        </div>
      </div>

      <div className="search-categories">
        <a href="#" className="category-tag">Клавиатуры</a>
        <a href="#" className="category-tag">Компьютерные мыши</a>
        <a href="#" className="category-tag">Наушники</a>
        <a href="#" className="category-tag">Музыка</a>
        <a href="#" className="category-tag">Аксессуары</a>
        <a href="#" className="category-tag">Софт</a>
      </div>
    </section>
  )
}

export default SearchSection

