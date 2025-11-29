function Products() {
  const products = [
    {
      id: 1,
      title: 'Клавиатура mchose jet75',
      description: 'Высококачественные датчики Холла обеспечивают точное линейное считывание, сверхвысокую чувствительность и исключительную отзывчивость.',
      price: '9000 рублей',
      video: '/assets/videos/Распаковка MCHOSE JET75 НЕОЖИДАННО mchose magnetickeyboard keyboard review [get-speed.com].mp4',
      poster: '/assets/imgs/mchosejet75.webp'
    },
    {
      id: 2,
      title: 'Компьютерная мышь mchose k7 ultra',
      description: 'Сверхлёгкая беспроводная игровая мышь MCHOSE K7 Ultra - это идеальный выбор для тех, кто любит играть в компьютерные игры. Она обладает максимальным разрешением датчика 42000 DPI, что позволяет вам быстро перемещаться по экрану и точно контролировать курсор',
      price: '8500 рублей',
      video: '/assets/videos/mchosek7.mp4',
      poster: '/assets/imgs/mchosek7ultra.webp'
    }
  ]

  // Дублируем товары для демонстрации
  const allProducts = [...products, ...products, ...products, ...products]

  return (
    <section className="products">
      <h2 id="popular">Популярные товары</h2>
      <div>
        {allProducts.map((product, index) => (
          <article key={`${product.id}-${index}`}>
            <video width="320" height="240" controls poster={product.poster}>
              <source src={product.video} type="video/mp4" />
            </video>
            <h4>{product.title}</h4>
            <p>{product.description}</p>
            <div className="costbutton">
              <b>{product.price}</b>
              <button>Купить</button>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

export default Products

