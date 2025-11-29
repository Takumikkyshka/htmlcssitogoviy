import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import PromoBanner from './components/PromoBanner'
import SearchSection from './components/SearchSection'
import Products from './components/Products'
import MusicSection from './components/MusicSection'
import Map from './components/Map'
import Footer from './components/Footer'

function App() {
  return (
    <>
      <Header />
      <PromoBanner />
      <SearchSection />
      <main>
        <Routes>
          <Route path="/" element={
            <>
              <Products />
              <MusicSection />
              <Map />
            </>
          } />
        </Routes>
      </main>
      <Footer />
    </>
  )
}

export default App

