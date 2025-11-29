import { useState, useEffect } from 'react'
import { apiService } from '../services/api'
import './MusicSection.css'

interface MusicTrack {
  id: number
  title: string
  price: string
  image: string
  audio: string
}

function MusicSection() {
  const [tracks, setTracks] = useState<MusicTrack[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMusic = async () => {
      try {
        const response = await apiService.getMusic()
        if (response.data) {
          setTracks(response.data)
        }
      } catch (error) {
        console.error('Ошибка загрузки музыки:', error)
        // Fallback на пустой массив
        setTracks([])
      } finally {
        setLoading(false)
      }
    }

    fetchMusic()
  }, [])

  if (loading) {
    return (
      <section className="music-section" id="music">
        <h2>Музыка</h2>
        <div style={{ textAlign: 'center', padding: '40px', color: 'white' }}>
          Загрузка музыки...
        </div>
      </section>
    )
  }

  return (
    <section className="music-section" id="music">
      <h2>Музыка</h2>

      <div className="music-promo">
        <b>Подписка на всю музыку всего за 399 рублей в месяц</b>
        <button>Оформить подписку</button>
      </div>

      <div className="music-tracks">
        {tracks.length > 0 ? (
          tracks.map((track) => (
            <article key={track.id}>
              <img src={track.image} alt="обложка" />
              <h4>{track.title}</h4>
              <audio controls src={track.audio}></audio>
              <a href="#">Купить - {track.price}</a>
            </article>
          ))
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: 'white', width: '100%' }}>
            Музыка не найдена
          </div>
        )}
      </div>
    </section>
  )
}

export default MusicSection

