import { useState, useEffect } from 'react'
import './Carousel.css'

interface CarouselItem {
  id: number
  title: string
  description: string
  image: string
}

interface CarouselProps {
  items: CarouselItem[]
  autoPlay?: boolean
  interval?: number
}

function Carousel({ items, autoPlay = true, interval = 5000 }: CarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  useEffect(() => {
    if (!autoPlay) return

    const timer = setInterval(() => {
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % items.length)
        setIsTransitioning(false)
      }, 300)
    }, interval)

    return () => clearInterval(timer)
  }, [autoPlay, interval, items.length])

  const goToSlide = (index: number) => {
    if (index === currentIndex) return
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentIndex(index)
      setIsTransitioning(false)
    }, 300)
  }

  const goToPrevious = () => {
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + items.length) % items.length)
      setIsTransitioning(false)
    }, 300)
  }

  const goToNext = () => {
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length)
      setIsTransitioning(false)
    }, 300)
  }

  return (
    <div className="carousel-container">
      <div className="carousel-wrapper">
        <button className="carousel-button carousel-button-prev" onClick={goToPrevious}>
          ‹
        </button>
        
        <div className="carousel-slides" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
          {items.map((item) => (
            <div
              key={item.id}
              className={`carousel-slide ${isTransitioning ? 'transitioning' : ''}`}
            >
              <img src={item.image} alt={item.title} />
              <div className="carousel-content">
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
            </div>
          ))}
        </div>

        <button className="carousel-button carousel-button-next" onClick={goToNext}>
          ›
        </button>
      </div>

      <div className="carousel-indicators">
        {items.map((_, index) => (
          <button
            key={index}
            className={`carousel-indicator ${index === currentIndex ? 'active' : ''}`}
            onClick={() => goToSlide(index)}
            aria-label={`Перейти к слайду ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

export default Carousel

