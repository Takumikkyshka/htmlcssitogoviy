function MusicSection() {
  const tracks = [
    {
      id: 1,
      title: 'Дора - Кьют рок',
      price: '19 рублей',
      image: '/assets/imgs/Dora kiut rok.webp',
      audio: '/assets/audios/Dora - kiut rok.mp3'
    },
    {
      id: 2,
      title: 'Дора - Втюрилась',
      price: '19 рублей',
      image: '/assets/imgs/Dora kiut rok.webp',
      audio: '/assets/audios/Dora - vturilas.mp3'
    }
  ]

  // Дублируем треки для демонстрации
  const allTracks = [...tracks, ...tracks]

  return (
    <section className="music-section" id="music">
      <h2>Музыка</h2>

      <div className="music-promo">
        <b>Подписка на всю музыку всего за 399 рублей в месяц</b>
        <button>Оформить подписку</button>
      </div>

      <div className="music-tracks">
        {allTracks.map((track, index) => (
          <article key={`${track.id}-${index}`}>
            <img src={track.image} alt="обложка" />
            <h4>{track.title}</h4>
            <audio controls src={track.audio}></audio>
            <a href="#">Купить - {track.price}</a>
          </article>
        ))}
      </div>
    </section>
  )
}

export default MusicSection

