import { Link } from 'react-router-dom'
import { BookOpen, ArrowLeft } from 'lucide-react'

function Pensum() {
  const pensumData = [
    {
      semestre: "1er Semestre",
      materias: [
        "Introducción a la Ingeniería en Informática",
        "Computación 1",
        "Matemática 1",
        "Matemática Discreta",
        "Lenguaje y Comunicación",
        "Efectividad Personal"
      ]
    },
    {
      semestre: "2do Semestre",
      materias: [
        "Química General 1",
        "Programación 1",
        "Laboratorio de Física 1",
        "Física 1",
        "Matemática 2",
        "Inglés 1 (se desbloquea con 12 UC aprobadas)"
      ]
    },
    {
      semestre: "3er Semestre",
      materias: [
        "Teoría General de Sistemas",
        "Estructura de Datos",
        "Laboratorio de Física 2",
        "Física 2",
        "Matemática 3",
        "Inglés 2"
      ]
    },
    {
      semestre: "4to Semestre",
      materias: [
        "Ciencias y Sociedad 1",
        "Programación 2",
        "Fundamentos de Lógica Digital",
        "Matemática 4",
        "Estadística 1"
      ]
    },
    {
      semestre: "5to Semestre",
      materias: [
        "Necesidades, Valores y Proyecto de Vida",
        "Base de Datos 1",
        "Organización del Computador",
        "Automatización",
        "Análisis Numérico",
        "Estadística 2",
        "Proyecto Servicio Comunitario (se desbloquea con 78 UC aprobadas)",
        "Seminario Servicio Comunitario (se desbloquea con 78 UC aprobadas)"
      ]
    },
    {
      semestre: "6to Semestre",
      materias: [
        "Multimedia",
        "Sistemas de Información 1",
        "Sistemas Operativos",
        "Comunicaciones 1",
        "Investigación de Operaciones 1",
        "Servicio Comunitario",
        "Economía"
      ]
    },
    {
      semestre: "7mo Semestre",
      materias: [
        "Electiva 1 (se desbloquea con 90 UC aprobadas)",
        "Base de Datos 2",
        "Compiladores e Intérpretes",
        "Comunicaciones 2",
        "Investigación de Operaciones 2",
        "Ingeniería Económica"
      ]
    },
    {
      semestre: "8vo Semestre",
      materias: [
        "Ecología y Contaminación Ambiental (se desbloquea con 100 UC aprobadas)",
        "Sistemas de Información 2",
        "Sistemas Distribuidos",
        "Electiva 2",
        "Simulación de Sistemas",
        "Finanzas para Ingenieros"
      ]
    },
    {
      semestre: "9no Semestre",
      materias: [
        "Metodología de la Investigación (se desbloquea con 110 UC aprobadas)",
        "Ingeniería de Software",
        "Seminario (se desbloquea con 126 UC aprobadas)",
        "Electiva 3",
        "Electiva 4",
        "Legislación, Valores y Proyecto de País"
      ]
    },
    {
      semestre: "10mo Semestre",
      materias: [
        "TAP Tesis (80% de todas las UC aprobadas)",
        "TAP Pasantías (100% de todas las UC aprobadas)"
      ]
    },
    {
      semestre: "Materias Electivas Disponibles",
      materias: [
        "Redes Neurales y Lógica Difusa",
        "Aprendizaje Automático",
        "Formación de Emprendedores",
        "Introducción a la Inteligencia Artificial",
        "Análisis y Procesamiento de Datos",
        "Introducción a las Telecomunicaciones",
        "Interfaces Digitales Biomédicas",
        "Gestión Tecnológica",
        "Organización",
        "Administración de Base de Datos",
        "Desarrollo de Aplicaciones Web",
        "Gerencia de Proyectos",
        "Administración de Redes",
        "Computación Aplicada a la Psicología"
      ]
    },
    {
      semestre: "Materias que se tramitan en Informática (no son de la carrera)",
      materias: [
        "Computación 2",
        "Computación Aplicada"
      ]
    }
  ]

  return (
    <div className="min-h-screen py-16 md:py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6 md:mb-8">
            <Link to="/informatica" className="flex items-center text-unet-blue hover:underline mb-4 text-sm md:text-base">
              <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 mr-2" />
              Volver al Departamento
            </Link>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-unet-blue mb-4">Pensum de Ingeniería en Informática</h1>
            <p className="text-gray-600 text-sm md:text-base">
              Plan de estudios oficial del Departamento de Informática de la UNET
            </p>
          </div>

          <div className="space-y-6 md:space-y-8">
            {pensumData.map((semestre, index) => (
              <div key={index} className="card">
                <h2 className="text-xl md:text-2xl font-bold text-unet-blue mb-4 md:mb-6 flex items-center">
                  <BookOpen className="w-5 h-5 md:w-6 md:h-6 mr-2 md:mr-3" />
                  {semestre.semestre}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                  {semestre.materias.map((materia, materiaIndex) => (
                    <div
                      key={materiaIndex}
                      className="bg-gray-50 rounded-lg p-3 md:p-4 border-l-4 border-unet-blue hover:bg-unet-blue hover:text-white transition-all"
                    >
                      <p className="font-medium text-sm md:text-base">{materia}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 md:mt-12 card">
            <h3 className="text-lg md:text-xl font-bold text-unet-blue mb-4">Información Importante</h3>
            <ul className="space-y-2 md:space-y-3 text-gray-700 text-sm md:text-base">
              <li className="flex items-start">
                <span className="text-unet-blue mr-2">•</span>
                <span>Este pensum es exclusivo para la carrera de Ingeniería en Informática.</span>
              </li>
              <li className="flex items-start">
                <span className="text-unet-blue mr-2">•</span>
                <span>Las materias electivas pueden ser cursadas en diferentes semestres según disponibilidad.</span>
              </li>
              <li className="flex items-start">
                <span className="text-unet-blue mr-2">•</span>
                <span>Las prelaciones deben ser cumplidas antes de inscribir cada materia.</span>
              </li>
              <li className="flex items-start">
                <span className="text-unet-blue mr-2">•</span>
                <span>Consulte siempre con el departamento para actualizaciones del pensum.</span>
              </li>
            </ul>
          </div>

          <div className="mt-6 md:mt-8 text-center">
            <Link to="/inscripcion" className="btn-primary inline-block text-sm md:text-base">
              Realizar Inscripción Tardía
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Pensum
