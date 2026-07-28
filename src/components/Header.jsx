import { Link } from 'react-router-dom'

function Header() {
  return (
    <header className="bg-unet-blue text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3">
            <img src="/unet-logo.png" alt="UNET Logo" className="h-12 w-auto" />
            <span className="text-xl md:text-2xl font-bold">UNET - Inscripciones Tardías</span>
          </Link>
          <nav className="hidden md:flex space-x-6">
            <Link to="/" className="hover:text-unet-gold transition-colors">Inicio</Link>
            <Link to="/informatica" className="hover:text-unet-gold transition-colors">Departamentos</Link>
            <Link to="/admin" className="hover:text-unet-gold transition-colors">Admin</Link>
            <a href="#contacto" className="hover:text-unet-gold transition-colors">Contacto</a>
          </nav>
        </div>
      </div>
    </header>
  )
}

export default Header
