import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X } from 'lucide-react'

function Header() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="bg-unet-blue text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2 md:space-x-3">
            <img src="/unet-logo.png" alt="UNET Logo" className="h-10 md:h-12 w-auto" />
            <span className="text-lg md:text-xl lg:text-2xl font-bold">UNET - Inscripciones Tardías</span>
          </Link>
          
          {/* Mobile menu button */}
          <button 
            className="md:hidden p-2"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-4 lg:space-x-6">
            <Link to="/" className="hover:text-unet-gold transition-colors text-sm lg:text-base">Inicio</Link>
            <Link to="/informatica" className="hover:text-unet-gold transition-colors text-sm lg:text-base">Departamentos</Link>
            <Link to="/admin" className="hover:text-unet-gold transition-colors text-sm lg:text-base">Admin</Link>
            <a href="#contacto" className="hover:text-unet-gold transition-colors text-sm lg:text-base">Contacto</a>
          </nav>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <nav className="md:hidden mt-4 pb-4 space-y-3">
            <Link 
              to="/" 
              className="block hover:text-unet-gold transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Inicio
            </Link>
            <Link 
              to="/informatica" 
              className="block hover:text-unet-gold transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Departamentos
            </Link>
            <Link 
              to="/admin" 
              className="block hover:text-unet-gold transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Admin
            </Link>
            <a 
              href="#contacto" 
              className="block hover:text-unet-gold transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Contacto
            </a>
          </nav>
        )}
      </div>
    </header>
  )
}

export default Header
