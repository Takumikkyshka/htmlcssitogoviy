import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Исправление иконок маркеров для Leaflet
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

L.Marker.prototype.options.icon = defaultIcon

// Компонент для центрирования карты на позиции пользователя
function MapCenter({ center }: { center: [number, number] }) {
  const map = useMap()
  useEffect(() => {
    map.setView(center, map.getZoom())
  }, [map, center])
  return null
}

interface MapMarker {
  id: number
  name: string
  description: string
  position: [number, number]
}

function Map() {
  const [userPosition, setUserPosition] = useState<[number, number] | null>(null)
  const [markers] = useState<MapMarker[]>([
    {
      id: 1,
      name: 'Магазин Blueberries - Центральный',
      description: 'г. Ростов-на-Дону, ул. Большая Садовая д. 77',
      position: [47.2225, 39.7187] // Ростов-на-Дону
    },
    {
      id: 2,
      name: 'Пункт выдачи заказов - Северный',
      description: 'г. Ростов-на-Дону, пр. Буденновский, 50',
      position: [47.2500, 39.7400] // Северная часть города, пр. Буденновский
    },
    {
      id: 3,
      name: 'Пункт выдачи заказов - Южный',
      description: 'г. Ростов-на-Дону, ул. Красноармейская, 100',
      position: [47.2000, 39.7000] // Южная часть города, ул. Красноармейская
    }
  ])

  // Получение координат пользователя
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserPosition([position.coords.latitude, position.coords.longitude])
        },
        (error) => {
          console.error('Ошибка получения геолокации:', error)
          // Устанавливаем координаты по умолчанию (Ростов-на-Дону)
          setUserPosition([47.2225, 39.7187])
        }
      )
    } else {
      // Если геолокация не поддерживается, используем координаты по умолчанию
      setUserPosition([47.2225, 39.7187])
    }
  }, [])

  if (!userPosition) {
    return (
      <div className="map-container">
        <div className="map-loading">Загрузка карты...</div>
      </div>
    )
  }

  return (
    <section className="map-section">
      <h2>Наши точки на карте</h2>
      <div className="map-container">
        <MapContainer
          center={userPosition}
          zoom={13}
          style={{ height: '500px', width: '100%', borderRadius: '15px', zIndex: 0 }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* Маркер позиции пользователя */}
          <Marker position={userPosition}>
            <Popup>
              <strong>Ваше местоположение</strong>
              <br />
              Координаты: {userPosition[0].toFixed(4)}, {userPosition[1].toFixed(4)}
            </Popup>
          </Marker>

          {/* Маркеры магазинов и пунктов выдачи */}
          {markers.map((marker) => (
            <Marker key={marker.id} position={marker.position}>
              <Popup>
                <strong>{marker.name}</strong>
                <br />
                {marker.description}
                <br />
                <button 
                  className="map-popup-button"
                  onClick={() => {
                    // Здесь можно добавить логику, например, открыть детали заказа
                    alert(`Выбрана точка: ${marker.name}`)
                  }}
                >
                  Выбрать эту точку
                </button>
              </Popup>
            </Marker>
          ))}

          <MapCenter center={userPosition} />
        </MapContainer>
      </div>
      <div className="map-info">
        <p>📍 Используйте карту для выбора ближайшей точки выдачи заказов</p>
        <button 
          className="map-locate-button"
          onClick={() => {
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(
                (position) => {
                  setUserPosition([position.coords.latitude, position.coords.longitude])
                },
                (_error) => {
                  alert('Не удалось получить ваше местоположение')
                }
              )
            }
          }}
        >
          Обновить моё местоположение
        </button>
      </div>
    </section>
  )
}

export default Map

