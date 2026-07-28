function Footer() {
  return (
    <footer className="bg-unet-dark text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">UNET - Inscripciones Tardías</h3>
            <p className="text-gray-400">Sistema de inscripciones tardías para el Departamento de Informática</p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Enlaces</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="/" className="hover:text-unet-gold transition-colors">Inicio</a></li>
              <li><a href="/informatica" className="hover:text-unet-gold transition-colors">Departamentos</a></li>
              <li><a href="#contacto" className="hover:text-unet-gold transition-colors">Contacto</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Contacto</h4>
            <p className="text-gray-400">informatica@unet.edu.ve</p>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-4 text-center text-gray-400">
          <p>&copy; 2026 UNET. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
