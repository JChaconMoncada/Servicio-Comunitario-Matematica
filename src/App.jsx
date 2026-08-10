import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { InscripcionProvider } from './context/InscripcionContext'
import Header from './components/Header'
import Home from './pages/Home'
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
              {/* El inicio ya es la vista del Departamento de Matemática y Física, así que
                   redirigimos /matematica a / para mantener la URL limpia */}
              <Route path="/matematica" element={<Navigate to="/" replace />} />
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
