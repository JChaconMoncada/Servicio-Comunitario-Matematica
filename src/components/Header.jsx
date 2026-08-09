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
            <img src="/unet-logo.png" alt="UNET Logo" className="h-10 md:h-14 w-auto flex-shrink-0" />
            <span className="font-bold leading-tight text-[10px] sm:text-xs md:text-sm lg:text-base uppercase tracking-wide">
              Universidad Nacional Experimental del Táchira
              <span className="block font-semibold text-white/90">Vicerrectorado Académico</span>
              <span className="block font-semibold text-white/90">Decanato de Docencia Departamento de Informática</span>
            </span>
          </Link>
          
          {/* Mobile menu button */}
          <button 
            className="md:hidden p-2"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-4 lg:space-x-6 flex-shrink-0">
            <Link to="/" className="hover:text-unet-gold transition-colors text-sm lg:text-base">Inicio</Link>
            <Link to="/pensum" className="hover:text-unet-gold transition-colors text-sm lg:text-base">Pensum</Link>
            <Link to="/admin" className="hover:text-unet-gold transition-colors text-sm lg:text-base">Admin</Link>
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
              to="/pensum" 
              className="block hover:text-unet-gold transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Pensum
            </Link>
            <Link 
              to="/admin" 
              className="block hover:text-unet-gold transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Admin
            </Link>
          </nav>
        )}
      </div>
    </header>
  )
}

export default Header
