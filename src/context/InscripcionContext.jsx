import { createContext, useContext, useState } from 'react'
import { informaticaSubjects } from '../data/subjects'

const InscripcionContext = createContext()

export const useInscripcion = () => {
  const context = useContext(InscripcionContext)
  if (!context) {
    throw new Error('useInscripcion debe usarse dentro de InscripcionProvider')
  }
  return context
}

export const InscripcionProvider = ({ children }) => {
  const [inscripcionHabilitada, setInscripcionHabilitada] = useState(true)
  const [materiasHabilitadas, setMateriasHabilitadas] = useState(
    informaticaSubjects.reduce((acc, materia) => {
      acc[materia] = true
      return acc
    }, {})
  )
  const [estudiantesPorMateria, setEstudiantesPorMateria] = useState(
    informaticaSubjects.reduce((acc, materia) => {
      acc[materia] = Math.floor(Math.random() * 20) + 1 // Datos de prueba aleatorios
      return acc
    }, {})
  )

  const toggleInscripciones = () => {
    setInscripcionHabilitada(!inscripcionHabilitada)
  }

  const toggleMateria = (materia) => {
    setMateriasHabilitadas(prev => ({
      ...prev,
      [materia]: !prev[materia]
    }))
  }

  const getMateriasHabilitadas = () => {
    return informaticaSubjects.filter(materia => materiasHabilitadas[materia])
  }

  const actualizarEstudiantesMateria = (materia, cantidad) => {
    setEstudiantesPorMateria(prev => ({
      ...prev,
      [materia]: cantidad
    }))
  }

  return (
    <InscripcionContext.Provider
      value={{
        inscripcionHabilitada,
        setInscripcionHabilitada,
        toggleInscripciones,
        materiasHabilitadas,
        setMateriasHabilitadas,
        toggleMateria,
        getMateriasHabilitadas,
        estudiantesPorMateria,
        actualizarEstudiantesMateria
      }}
    >
      {children}
    </InscripcionContext.Provider>
  )
}
