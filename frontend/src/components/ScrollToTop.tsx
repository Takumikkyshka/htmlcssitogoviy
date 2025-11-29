import { useState, useEffect } from 'react'
import { smoothScrollToTop } from '../utils/smoothScroll'

function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener('scroll', toggleVisibility)

    return () => {
      window.removeEventListener('scroll', toggleVisibility)
    }
  }, [])

  return (
    <button
      className={`scroll-to-top ${isVisible ? 'visible' : ''}`}
      onClick={smoothScrollToTop}
      aria-label="Прокрутить наверх"
    >
      ↑
    </button>
  )
}

export default ScrollToTop

