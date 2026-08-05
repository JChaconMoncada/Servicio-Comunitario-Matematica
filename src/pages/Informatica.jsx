import { Link } from 'react-router-dom'
import { BookOpen, Users, Cpu, FileText, Clock, Shield, Phone, Mail, MapPin, ArrowRight } from 'lucide-react'
import { informaticaSubjects } from '../data/subjects'

function Informatica() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-unet-blue to-unet-lightBlue text-white py-12 md:py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">Informática</h1>
          <p className="text-lg md:text-xl lg:text-2xl mb-8 max-w-3xl mx-auto">
            Tecnología e Innovación para tu formación. Inscripciones tardías en asignaturas de computación.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/inscripcion" className="btn-primary bg-white text-unet-blue hover:bg-unet-gold hover:text-unet-blue inline-block text-center text-sm md:text-base">
              Comenzar Inscripción
            </Link>
            <Link to="/pensum" className="btn-secondary border-white text-white hover:bg-white hover:text-unet-blue inline-block text-center text-sm md:text-base">
              Ver Pensum
            </Link>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-8 md:py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-unet-blue mb-2">+{informaticaSubjects.length}</div>
              <div className="text-gray-600 text-sm md:text-base">Materias</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-unet-blue mb-2">18</div>
              <div className="text-gray-600 text-sm md:text-base">Profesores</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-unet-blue mb-2">100%</div>
              <div className="text-gray-600 text-sm md:text-base">Tecnológico</div>
            </div>
          </div>
        </div>
      </section>

      {/* Department Information */}
      <section className="py-12 md:py-16 bg-unet-gray">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12 text-unet-blue">Información del Departamento</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
            <div className="card">
              <FileText className="w-10 h-10 md:w-12 md:h-12 text-unet-blue mb-4" />
              <h3 className="text-lg md:text-xl font-bold mb-2 text-unet-blue">Requisitos</h3>
              <p className="text-gray-600 text-sm md:text-base">
                Estar inscrito en el semestre actual y tener aprobadas las prelaciones correspondientes.
              </p>
            </div>

            <div className="card">
              <Clock className="w-10 h-10 md:w-12 md:h-12 text-unet-blue mb-4" />
              <h3 className="text-lg md:text-xl font-bold mb-2 text-unet-blue">Periodo</h3>
              <p className="text-gray-600 text-sm md:text-base">
                Inscripciones tardías disponibles durante las primeras 3 semanas del semestre.
              </p>
            </div>

            <div className="card">
              <Shield className="w-10 h-10 md:w-12 md:h-12 text-unet-blue mb-4" />
              <h3 className="text-lg md:text-xl font-bold mb-2 text-unet-blue">Seguridad</h3>
              <p className="text-gray-600 text-sm md:text-base">
                Sistema seguro con validación de credenciales estudiantiles.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How to Register */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 text-unet-blue">Cómo realizar tu inscripción</h2>
          <div className="max-w-3xl mx-auto mb-6 md:mb-8">
            <div className="space-y-3 md:space-y-4 text-left">
              <div className="flex items-start">
                <div className="bg-unet-blue text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 md:mr-4 flex-shrink-0 text-sm">1</div>
                <p className="text-gray-700 text-sm md:text-base">Selecciona las asignaturas que deseas cursar</p>
              </div>
              <div className="flex items-start">
                <div className="bg-unet-blue text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 md:mr-4 flex-shrink-0 text-sm">2</div>
                <p className="text-gray-700 text-sm md:text-base">Verifica que cumplas con los requisitos y prelaciones</p>
              </div>
              <div className="flex items-start">
                <div className="bg-unet-blue text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 md:mr-4 flex-shrink-0 text-sm">3</div>
                <p className="text-gray-700 text-sm md:text-base">Completa el formulario de inscripción</p>
              </div>
              <div className="flex items-start">
                <div className="bg-unet-blue text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 md:mr-4 flex-shrink-0 text-sm">4</div>
                <p className="text-gray-700 text-sm md:text-base">Espera la confirmación por correo electrónico</p>
              </div>
            </div>
          </div>
          <Link to="/inscripcion" className="btn-primary inline-block text-sm md:text-base">
            Comenzar Inscripción
          </Link>
        </div>
      </section>

      {/* Subjects List */}
      <section className="py-12 md:py-16 bg-unet-gray">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12 text-unet-blue">Materias del Departamento</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 max-w-6xl mx-auto">
            {informaticaSubjects.map((subject, index) => (
              <div key={index} className="card flex items-center">
                <BookOpen className="w-5 h-5 md:w-6 md:h-6 text-unet-blue mr-2 md:mr-3 flex-shrink-0" />
                <span className="text-gray-700 text-sm md:text-base">{subject}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contacto" className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12 text-unet-blue">Contacto del Departamento</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-4xl mx-auto">
            <div className="card text-center">
              <Phone className="w-10 h-10 md:w-12 md:h-12 text-unet-blue mx-auto mb-4" />
              <h3 className="text-lg md:text-xl font-bold mb-2 text-unet-blue">Teléfono</h3>
              <p className="text-gray-600 text-sm md:text-base">+58 274 123 4567</p>
            </div>

            <div className="card text-center">
              <Mail className="w-10 h-10 md:w-12 md:h-12 text-unet-blue mx-auto mb-4" />
              <h3 className="text-lg md:text-xl font-bold mb-2 text-unet-blue">Correo</h3>
              <p className="text-gray-600 text-sm md:text-base">informatica@unet.edu.ve</p>
            </div>

            <div className="card text-center">
              <MapPin className="w-10 h-10 md:w-12 md:h-12 text-unet-blue mx-auto mb-4" />
              <h3 className="text-lg md:text-xl font-bold mb-2 text-unet-blue">Ubicación</h3>
              <p className="text-gray-600 text-sm md:text-base">Edificio C, Piso 1</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Informatica
