import { Link } from 'react-router-dom'
import { BookOpen, ArrowLeft } from 'lucide-react'

function Pensum() {
  const pensumData = [
    {
      semestre: "1er Semestre",
      materias: [
        "Introducción a la Ingeniería en Informática",
        "Computación 1",
        "Programación 1",
        "Matemática I",
        "Física I"
      ]
    },
    {
      semestre: "2do Semestre",
      materias: [
        "Computación 2",
        "Programación 2",
        "Estructura de Datos",
        "Matemática II",
        "Física II"
      ]
    },
    {
      semestre: "3er Semestre",
      materias: [
        "Base de Datos 1",
        "Organización del Computador",
        "Fundamentos de Lógica Digital",
        "Matemática III",
        "Teoría General de Sistemas"
      ]
    },
    {
      semestre: "4to Semestre",
      materias: [
        "Sistemas Operativos",
        "Comunicaciones 1",
        "Sistemas de Información 1",
        "Multimedia",
        "Investigación de Operaciones 1"
      ]
    },
    {
      semestre: "5to Semestre",
      materias: [
        "Base de Datos 2",
        "Compiladores e Intérpretes",
        "Comunicaciones 2",
        "Sistemas de Información 2",
        "Investigación de Operaciones 2"
      ]
    },
    {
      semestre: "6to Semestre",
      materias: [
        "Sistemas Distribuidos",
        "Simulación de Sistemas",
        "Ingeniería de Software",
        "Computación Aplicada",
        "Administración de Base de Datos"
      ]
    },
    {
      semestre: "7mo Semestre",
      materias: [
        "Redes Neurales y Lógica Difusa",
        "Aprendizaje Automático",
        "Introducción a la Inteligencia Artificial",
        "Desarrollo de Aplicaciones Web",
        "Gerencia de Proyectos"
      ]
    },
    {
      semestre: "8vo Semestre",
      materias: [
        "Análisis y Procesamiento de Datos",
        "Introducción a las Telecomunicaciones",
        "Interfaces Digitales Biomédicas",
        "Gestión Tecnológica",
        "Formación de Emprendedores"
      ]
    },
    {
      semestre: "Materias Electivas",
      materias: [
        "Computación Aplicada a la Psicología",
        "Organización",
        "Administración de Redes"
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
                <span>Algunas materias como Computación 2 son exclusivas de Informática.</span>
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
