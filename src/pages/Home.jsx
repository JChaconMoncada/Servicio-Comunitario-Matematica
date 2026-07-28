import { Link } from 'react-router-dom'
import { BookOpen, Users, Calendar, CheckCircle } from 'lucide-react'

function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-unet-blue to-unet-lightBlue text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Departamentos</h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            Selecciona tu departamento para inscripciones tardías. Accede al sistema de inscripciones tardías de cada departamento académico de la UNET.
          </p>
        </div>
      </section>

      {/* Departments Section */}
      <section className="py-16 bg-unet-gray">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-unet-blue">Departamentos Académicos</h2>
          <div className="grid grid-cols-1 md:grid-cols-1 gap-8 max-w-2xl mx-auto">
            {/* Informática Card */}
            <div className="card border-2 border-unet-blue">
              <div className="flex items-center mb-4">
                <BookOpen className="w-12 h-12 text-unet-blue mr-4" />
                <h3 className="text-2xl font-bold text-unet-blue">Informática</h3>
              </div>
              <p className="text-gray-600 mb-6">
                Tecnología e innovación para tu formación. Inscripciones tardías en asignaturas de computación.
              </p>
              <Link to="/informatica" className="btn-primary w-full inline-block text-center">
                Ver Departamento
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Important Information Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-unet-blue">Información Importante</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="card text-center">
              <Calendar className="w-16 h-16 text-unet-blue mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2 text-unet-blue">Periodo de Inscripciones</h3>
              <p className="text-gray-600">
                Del 1 al 15 de cada mes. Verifica los horarios disponibles.
              </p>
            </div>

            <div className="card text-center">
              <CheckCircle className="w-16 h-16 text-unet-blue mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2 text-unet-blue">Requisitos</h3>
              <p className="text-gray-600">
                Estar regularmente inscrito en el semestre actual de la UNET.
              </p>
            </div>

            <div className="card text-center">
              <Users className="w-16 h-16 text-unet-blue mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2 text-unet-blue">Disponibilidad</h3>
              <p className="text-gray-600">
                Cupos limitados por asignatura. Primero en llegar, primero en servir.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
