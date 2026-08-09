import { Link } from 'react-router-dom'
import { BookOpen, FileText, Clock, Shield, Phone, Mail, MapPin, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react'
import { informaticaSubjects } from '../data/subjects'
import { useInscripcion } from '../context/InscripcionContext'
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

// Divide un arreglo en grupos del tamaño indicado
const agrupar = (items, tamano) => {
  const grupos = []
  for (let i = 0; i < items.length; i += tamano) {
    grupos.push(items.slice(i, i + tamano))
  }
  return grupos
}

function Home() {
  const { secciones } = useInscripcion()

  // Cuadrícula 4x4 = 16 materias por diapositiva del carrusel
  const gruposMaterias = agrupar(informaticaSubjects, 16)
  const gruposInfo = agrupar(infoDepartamento, 3)

  // Calcular qué materias tienen actualmente secciones abiertas con cupo disponible
  const materiasConCupoMap = {}
  secciones.forEach(sec => {
    if (sec.aprobada) return
    const capacidad = sec.capacidadMax || sec.capacidad_max || 0
    const ocupados = sec.estudiantes ? sec.estudiantes.length : 0
    const libres = capacidad - ocupados
    if (libres > 0) {
      if (!materiasConCupoMap[sec.materia]) {
        materiasConCupoMap[sec.materia] = { materia: sec.materia, cuposLibres: 0, seccionesAbiertas: 0 }
      }
      materiasConCupoMap[sec.materia].cuposLibres += libres
      materiasConCupoMap[sec.materia].seccionesAbiertas += 1
    }
  })

  let listaMateriasConCupo = Object.values(materiasConCupoMap)

  // Si aún no se han registrado secciones con cupo en la BD, mostrar asignaturas de ejemplo
  if (listaMateriasConCupo.length === 0) {
    const materiasEjemplo = ['Computación 1', 'Computación 2', 'Programación 1', 'Estructura de Datos', 'Base de Datos 1', 'Sistemas Operativos']
    listaMateriasConCupo = materiasEjemplo.map(m => ({
      materia: m,
      cuposLibres: 5,
      seccionesAbiertas: 1
    }))
  }

  return (
    <div className="min-h-screen space-y-0">

      {/* ===== BLOQUE PRINCIPAL: Inscripción + Materias del Departamento ===== */}
      <section className="bg-white py-8 md:py-12">
        <div className="container mx-auto px-4 sm:px-6 max-w-[1400px]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">

            {/* Columna izquierda: Cómo realizar tu inscripción (5/12 de ancho) */}
            <div className="lg:col-span-5 bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8 flex flex-col justify-between h-full">
              <div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-unet-blue mb-3">
                  Cómo realizar tu inscripción
                </h2>
                <p className="text-gray-600 text-sm md:text-base mb-6">
                  Inscripciones tardías del Departamento de Informática. Sigue estos pasos para
                  solicitar tu cupo en las asignaturas disponibles.
                </p>

                <ol className="space-y-3 mb-8">
                  {pasosInscripcion.map((paso, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="bg-unet-blue text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 flex-shrink-0 font-bold text-sm">
                        {idx + 1}
                      </span>
                      <p className="text-gray-700 text-sm md:text-base pt-1 font-medium">{paso}</p>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
                <Link
                  to="/inscripcion"
                  className="btn-primary flex-1 inline-flex items-center justify-center text-sm md:text-base font-bold px-5 py-3 shadow"
                >
                  Comenzar Inscripción <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
                <Link
                  to="/pensum"
                  className="btn-secondary flex-1 inline-flex items-center justify-center text-sm md:text-base font-bold px-5 py-3 border-gray-300"
                >
                  Ver Pensum
                </Link>
              </div>
            </div>

            {/* Columna derecha: Materias del Departamento (7/12 de ancho para recuadros anchos) */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8 flex flex-col justify-between h-full">
              <div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-center text-unet-blue mb-6">
                  Materias del Departamento
                </h2>

                <Carrusel intervalo={7000} slides={gruposMaterias.map((grupo, gIdx) => (
                  <div key={gIdx} className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-3.5">
                    {grupo.map((materia, idx) => (
                      <div
                        key={idx}
                        className="bg-gray-50/90 rounded-xl border border-gray-200 px-3.5 py-2.5 flex items-center min-h-[50px] sm:min-h-[54px] hover:bg-blue-50/60 hover:border-unet-blue/50 hover:shadow-md transition-all group cursor-default"
                      >
                        <BookOpen className="w-4 h-4 text-unet-blue mr-2.5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                        <span className="text-gray-800 text-xs sm:text-sm font-semibold leading-tight line-clamp-2">{materia}</span>
                      </div>
                    ))}
                  </div>
                ))} />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ===== NUEVO APARTADO: Materias con Cupo Disponible ===== */}
      <section className="bg-gradient-to-b from-gray-50 via-blue-50/30 to-white py-12 md:py-16 border-t border-b border-gray-200/80">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <span className="bg-emerald-100 text-emerald-800 text-xs font-extrabold px-3.5 py-1.5 rounded-full uppercase tracking-wider shadow-xs inline-flex items-center mb-3">
              <Sparkles className="w-3.5 h-3.5 mr-1.5 text-emerald-600" /> Oferta Académica Activa
            </span>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-unet-blue mb-3">
              Materias con Cupo Disponible
            </h2>
            <p className="text-gray-600 text-sm md:text-base">
              Asignaturas del semestre que actualmente cuentan con cupos abiertos y secciones disponibles para inscripción tardía.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {listaMateriasConCupo.map((item, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border-2 border-emerald-400/80 shadow-md hover:shadow-xl hover:border-emerald-500 transition-all p-6 flex flex-col justify-between group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-bl-full pointer-events-none transition-transform group-hover:scale-110" />

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="inline-flex items-center text-xs font-bold bg-emerald-500 text-white px-3 py-1 rounded-full shadow-xs">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Cupos Abiertos
                    </span>
                    <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                      {item.cuposLibres} cupo(s)
                    </span>
                  </div>

                  <h3 className="text-lg font-extrabold text-unet-blue mb-2 group-hover:text-emerald-700 transition-colors">
                    {item.materia}
                  </h3>

                  <p className="text-gray-500 text-xs font-medium mb-6">
                    {item.seccionesAbiertas > 1 ? `${item.seccionesAbiertas} secciones con disponibilidad` : 'Sección disponible para solicitud'}
                  </p>
                </div>

                <Link
                  to={`/inscripcion?materia=${encodeURIComponent(item.materia)}`}
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-center text-sm shadow-sm transition-all flex items-center justify-center space-x-2"
                >
                  <span>Solicitar Cupo</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
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
