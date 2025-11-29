import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import PromoBanner from './components/PromoBanner'
import SearchSection from './components/SearchSection'
import Products from './components/Products'
import MusicSection from './components/MusicSection'
import Map from './components/Map'
import Dashboard from './components/Dashboard'
import Catalog from './components/Catalog'
import Orders from './components/Orders'
import Favorites from './components/Favorites'
import ScrollToTop from './components/ScrollToTop'
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
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="*" element={
            <>
              <Products />
              <MusicSection />
              <Map />
            </>
          } />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </main>
      <ScrollToTop />
      <Footer />
    </>
  )
}

export default App

