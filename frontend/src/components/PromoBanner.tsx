import Carousel from './Carousel'

function PromoBanner() {
  const promoItems = [
    {
      id: 1,
      title: 'Blueberries - Большая распродажа года',
      description: 'Скидки до 50% на все товары! Не упустите возможность приобрести качественные товары по выгодным ценам.',
      image: '/assets/imgs/mchosejet75.webp'
    },
    {
      id: 2,
      title: 'Новинки 2024',
      description: 'Ознакомьтесь с новейшими моделями клавиатур и компьютерных мышей от ведущих производителей.',
      image: '/assets/imgs/mchosek7ultra.webp'
    },
    {
      id: 3,
      title: 'Музыкальная подписка',
      description: 'Подписка на всю музыку всего за 399 рублей в месяц. Безлимитный доступ к миллионам треков.',
      image: '/assets/imgs/Dora kiut rok.webp'
    }
  ]

  return (
    <section className="promo-banner">
      <Carousel items={promoItems} autoPlay={true} interval={5000} />
    </section>
  )
}

export default PromoBanner

