import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { InscripcionProvider } from './context/InscripcionContext'
import Header from './components/Header'
import Home from './pages/Home'
import Informatica from './pages/Informatica'
import Inscripcion from './pages/Inscripcion'
import Pensum from './pages/Pensum'
import Admin from './pages/Admin'
import Footer from './components/Footer'

function App() {
  return (
    <InscripcionProvider>
      <Router>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/informatica" element={<Informatica />} />
              <Route path="/inscripcion" element={<Inscripcion />} />
              <Route path="/pensum" element={<Pensum />} />
              <Route path="/admin" element={<Admin />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </InscripcionProvider>
  )
}

export default App
