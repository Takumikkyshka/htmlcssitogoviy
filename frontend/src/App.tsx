import { Routes, Route, useLocation } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import Header from './components/Header'
import PromoBanner from './components/PromoBanner'
import ScrollToTop from './components/ScrollToTop'
import Footer from './components/Footer'

// Ленивая загрузка компонентов
const SearchSection = lazy(() => import('./components/SearchSection'))
const Products = lazy(() => import('./components/Products'))
const Map = lazy(() => import('./components/Map'))
const Dashboard = lazy(() => import('./components/Dashboard'))
const Catalog = lazy(() => import('./components/Catalog'))
const Orders = lazy(() => import('./components/Orders'))
const Favorites = lazy(() => import('./components/Favorites'))
const Cart = lazy(() => import('./components/Cart'))
const ProductDetails = lazy(() => import('./components/ProductDetails'))
const AdminPanel = lazy(() => import('./components/AdminPanel'))
const Blog = lazy(() => import('./components/Blog'))

function AppContent() {
  const location = useLocation()
  const showSearchSection = location.pathname === '/' || location.pathname === '/catalog'

  return (
    <>
      <Header />
      <PromoBanner />
      {showSearchSection && (
        <Suspense fallback={null}>
          <SearchSection />
        </Suspense>
      )}
      <main>
        <Suspense fallback={<div style={{ padding: '40px', textAlign: 'center', color: 'white' }}>Загрузка...</div>}>
          <Routes>
            <Route path="/" element={
              <>
                <Products />
                <Map />
              </>
            } />
            <Route path="/catalog" element={<Catalog />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="*" element={
              <>
                <Products />
                <Map />
              </>
            } />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </Suspense>
      </main>
      <ScrollToTop />
      <Footer />
    </>
  )
}

function App() {
  return <AppContent />
}

export default App

