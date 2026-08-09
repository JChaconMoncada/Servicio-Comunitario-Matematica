function Footer() {
  return (
    <footer className="bg-unet-blue text-white py-6 md:py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          <div>
            <h3 className="text-lg md:text-xl font-bold mb-4">UNET - Inscripciones Tardías</h3>
            <p className="text-blue-100 text-sm md:text-base">Sistema de inscripciones tardías para el Departamento de Informática</p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Enlaces</h4>
            <ul className="space-y-2 text-blue-100 text-sm md:text-base">
              <li><a href="/" className="hover:text-unet-gold transition-colors">Inicio</a></li>
              <li><a href="/pensum" className="hover:text-unet-gold transition-colors">Pensum</a></li>
              <li><a href="/inscripcion" className="hover:text-unet-gold transition-colors">Inscripción</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Contacto</h4>
            <p className="text-blue-100 text-sm md:text-base">informat@unet.edu.ve</p>
          </div>
        </div>
        <div className="border-t border-white/20 mt-6 md:mt-8 pt-4 text-center text-blue-100 text-sm md:text-base">
          <p>&copy; 2026 UNET. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
