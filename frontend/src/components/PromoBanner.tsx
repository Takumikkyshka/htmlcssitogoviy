import Carousel from './Carousel'
import './PromoBanner.css'

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
    }
  ]

  return (
    <section className="promo-banner">
      <Carousel items={promoItems} autoPlay={true} interval={5000} />
    </section>
  )
}

export default PromoBanner

