import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import PromoBanner from './components/PromoBanner'
import SearchSection from './components/SearchSection'
import Products from './components/Products'
import MusicSection from './components/MusicSection'
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
            </>
          } />
        </Routes>
      </main>
      <Footer />
    </>
  )
}

export default App

