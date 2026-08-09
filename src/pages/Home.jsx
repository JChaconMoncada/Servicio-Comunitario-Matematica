import { Link } from 'react-router-dom'
import { BookOpen, FileText, Clock, Shield, Phone, Mail, MapPin, ArrowRight } from 'lucide-react'
import { informaticaSubjects } from '../data/subjects'
import Carrusel from '../components/Carrusel'

const pasosInscripcion = [
  'Selecciona las asignaturas que deseas cursar',
  'Verifica que cumplas con los requisitos y prelaciones',
  'Completa el formulario de inscripción',
  'Espera la confirmación por correo electrónico'
]

const infoDepartamento = [
  {
    icono: FileText,
    titulo: 'Requisitos',
    texto: 'Estar inscrito en el semestre actual y tener aprobadas las prelaciones correspondientes.'
  },
  {
    icono: Clock,
    titulo: 'Periodo',
    texto: 'Inscripciones tardías disponibles durante las primeras 3 semanas del semestre.'
  },
  {
    icono: Shield,
    titulo: 'Horario',
    texto: 'Lunes a Viernes de 8:00 am a 1:00 pm.'
  },
  {
    icono: Phone,
    titulo: 'Teléfono',
    texto: '+58 274 123 4567'
  },
  {
    icono: Mail,
    titulo: 'Correo',
    texto: 'informat@unet.edu.ve'
  },
  {
    icono: MapPin,
    titulo: 'Ubicación',
    texto: 'Edificio C, Piso 1. Universidad Nacional Experimental del Táchira.'
  }
]

// Divide un arreglo en grupos del tamaño indicado (para paginar el carrusel)
const agrupar = (items, tamano) => {
  const grupos = []
  for (let i = 0; i < items.length; i += tamano) {
    grupos.push(items.slice(i, i + tamano))
  }
  return grupos
}

function Home() {
  const gruposMaterias = agrupar(informaticaSubjects, 9)
  const gruposInfo = agrupar(infoDepartamento, 3)

  return (
    <div className="min-h-screen">

      {/* ===== BLOQUE PRINCIPAL: Inscripción + Materias del Departamento ===== */}
      <section className="bg-white">
        <div className="container mx-auto px-4 py-10 md:py-14">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-start">

            {/* Columna izquierda: cómo realizar tu inscripción */}
            <div className="lg:sticky lg:top-8">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-unet-blue mb-3">
                Cómo realizar tu inscripción
              </h2>
              <p className="text-gray-600 text-base md:text-lg mb-8">
                Inscripciones tardías del Departamento de Informática. Sigue estos pasos para
                solicitar tu cupo en las asignaturas disponibles.
              </p>

              <ol className="space-y-4 mb-8">
                {pasosInscripcion.map((paso, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className="bg-unet-blue text-white rounded-full w-9 h-9 flex items-center justify-center mr-4 flex-shrink-0 font-bold">
                      {idx + 1}
                    </span>
                    <p className="text-gray-700 text-base md:text-lg pt-1">{paso}</p>
                  </li>
                ))}
              </ol>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/inscripcion"
                  className="btn-primary inline-flex items-center justify-center text-base font-bold px-6 py-3"
                >
                  Comenzar Inscripción <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
                <Link
                  to="/pensum"
                  className="btn-secondary inline-flex items-center justify-center text-base font-bold px-6 py-3"
                >
                  Ver Pensum
                </Link>
              </div>
            </div>

            {/* Columna derecha: carrusel de materias del departamento */}
            <div className="bg-unet-gray rounded-2xl p-5 md:p-8">
              <h2 className="text-xl md:text-2xl font-bold text-center text-unet-blue mb-6">
                Materias del Departamento
              </h2>

              <Carrusel intervalo={7000} slides={gruposMaterias.map((grupo, gIdx) => (
                <div key={gIdx} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                  {grupo.map((materia, idx) => (
                    <div
                      key={idx}
                      className="bg-white rounded-xl border border-gray-200 shadow-sm p-3 flex items-center min-h-[64px] hover:shadow-md hover:border-unet-blue/40 transition-all"
                    >
                      <BookOpen className="w-5 h-5 text-unet-blue mr-2.5 flex-shrink-0" />
                      <span className="text-gray-700 text-sm font-medium leading-snug">{materia}</span>
                    </div>
                  ))}
                </div>
              ))} />
            </div>

          </div>
        </div>
      </section>

      {/* ===== INFORMACIÓN DEL DEPARTAMENTO (carrusel desplazable) ===== */}
      <section id="contacto" className="bg-unet-gray py-12 md:py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-center text-unet-blue mb-3">
            Información del Departamento
          </h2>
          <p className="text-center text-gray-600 text-base md:text-lg mb-10 max-w-2xl mx-auto">
            Todo lo que necesitas saber para tu inscripción tardía y cómo contactarnos.
          </p>

          <div className="max-w-5xl mx-auto px-2 md:px-8">
            <Carrusel intervalo={6000} slides={gruposInfo.map((grupo, gIdx) => (
              <div key={gIdx} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {grupo.map((item, idx) => {
                  const Icono = item.icono
                  return (
                    <div
                      key={idx}
                      className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 text-center hover:shadow-lg transition-all min-h-[210px] flex flex-col items-center justify-center"
                    >
                      <Icono className="w-12 h-12 text-unet-blue mb-4" />
                      <h3 className="text-lg md:text-xl font-bold mb-2 text-unet-blue">{item.titulo}</h3>
                      <p className="text-gray-600 text-sm md:text-base">{item.texto}</p>
                    </div>
                  )
                })}
              </div>
            ))} />
          </div>
        </div>
      </section>

    </div>
  )
}

export default Home
