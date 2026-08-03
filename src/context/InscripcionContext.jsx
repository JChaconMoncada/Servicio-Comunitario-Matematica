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

// Datos iniciales de prueba para alimentar las hojas de cálculo y tablas
const initialNombres = [
  "Omar David Angola Leon", "Juan Carlos Pérez", "Sara María Rodríguez", "Lucía Fernanda Gómez", 
  "Verónica Alejandra Silva", "Marta Elena Castillo", "Carlos Eduardo Mendoza", "Ana Gabriel Torres",
  "Luis Fernando Rivas", "María José Gutiérrez", "José Gregorio Hernández", "Andrea Carolina Morales",
  "Diego Armando Maradona", "Patricia Isabel Benítez", "Gabriel Alejandro Díaz", "Sofía Valentina Ramírez",
  "Roberto Carlos Gómez", "Daniela Stephania López", "Javier Enrique Martínez", "Camila Andrea Romero",
  "Miguel Ángel Urbina", "Desiree Suárez", "Hendry Fourl", "Felida Moreno",
  "Alejandro José Blanco", "Valeria Isabel Medina", "Guillermo Antonio Soto", "Isabella María Vargas",
  "Enrique José Navarro", "Natalia Beatriz Paredes", "Francisco Javier Aguilar", "Paula Valentina Herrera"
]

const generateInitialSolicitudes = () => {
  const solicitudes = []
  initialNombres.forEach((nombre, idx) => {
    const cedula = (30023806 - idx).toString()
    const correo = idx === 0 ? "Omar.angola@unet.edu.ve" : `${nombre.split(' ')[0].toLowerCase()}.${nombre.split(' ')[1]?.toLowerCase() || 'est'}@unet.edu.ve`
    
    // Asignar algunas materias variadas
    const materias = [
      informaticaSubjects[idx % informaticaSubjects.length],
      informaticaSubjects[(idx + 3) % informaticaSubjects.length],
      informaticaSubjects[(idx + 7) % informaticaSubjects.length]
    ]

    solicitudes.push({
      id: `sol-${idx + 1}`,
      nro: idx + 1,
      nombre,
      cedula,
      correo,
      periodo: idx % 4 === 0 ? "Intensivo 2026" : "Semestre 2026-1",
      materiasSolicitadas: materias.map((m, mIdx) => {
        let estado = 'gris' // 'verde' | 'rojo' | 'gris'
        if (idx < 8) estado = 'verde'
        else if (idx >= 10 && idx <= 15) estado = 'rojo'
        else if (idx >= 16 && idx <= 21) estado = 'verde'
        else if (idx >= 21 && idx <= 22) estado = 'rojo'

        return {
          materia: m,
          estado: estado,
          seccionAsignada: estado === 'verde' ? `Seccion:0${(idx % 4) + 1}` : null
        }
      })
    })
  })
  return solicitudes
}

const initialSecciones = [
  {
    id: 'sec-01',
    materia: 'Programación I',
    seccion: '04',
    modalidad: 'Presencial',
    aula: '15C',
    profesor: 'Desiree Suarez',
    capacidadMax: 30,
    estudiantes: initialNombres.slice(0, 18).map((nombre, i) => ({
      nro: i + 1,
      nombre,
      cedula: (30023806 - i).toString(),
      correo: `${nombre.split(' ')[0].toLowerCase()}.${nombre.split(' ')[1]?.toLowerCase() || 'est'}@unet.edu.ve`,
      verificado: i < 10
    }))
  },
  {
    id: 'sec-02',
    materia: 'Sistemas Operativos',
    seccion: '10',
    modalidad: 'Virtual',
    aula: 'Aula Virtual 1',
    profesor: 'Miguel Urbina',
    capacidadMax: 20,
    estudiantes: initialNombres.slice(0, 12).map((nombre, i) => ({
      nro: i + 1,
      nombre,
      cedula: (30023806 - i).toString(),
      correo: `${nombre.split(' ')[0].toLowerCase()}.${nombre.split(' ')[1]?.toLowerCase() || 'est'}@unet.edu.ve`,
      verificado: i < 5
    }))
  },
  {
    id: 'sec-03',
    materia: 'Compiladores e Intérpretes',
    seccion: '01',
    modalidad: 'Virtual',
    aula: 'Aula Virtual 2',
    profesor: 'Miguel Urbina',
    capacidadMax: 20,
    estudiantes: initialNombres.slice(0, 15).map((nombre, i) => ({
      nro: i + 1,
      nombre,
      cedula: (30023806 - i).toString(),
      correo: `${nombre.split(' ')[0].toLowerCase()}.${nombre.split(' ')[1]?.toLowerCase() || 'est'}@unet.edu.ve`,
      verificado: true
    }))
  },
  {
    id: 'sec-04',
    materia: 'Introducción a la Ingeniería en Informática',
    seccion: '03',
    modalidad: 'Presencial',
    aula: '15C',
    profesor: 'Felida Moreno',
    capacidadMax: 30,
    estudiantes: initialNombres.slice(0, 14).map((nombre, i) => ({
      nro: i + 1,
      nombre,
      cedula: (30023806 - i).toString(),
      correo: `${nombre.split(' ')[0].toLowerCase()}.${nombre.split(' ')[1]?.toLowerCase() || 'est'}@unet.edu.ve`,
      verificado: false
    }))
  },
  {
    id: 'sec-05',
    materia: 'Teoría General de Sistemas',
    seccion: '06',
    modalidad: 'Presencial',
    aula: '13A',
    profesor: 'Desiree Suarez',
    capacidadMax: 30,
    estudiantes: initialNombres.slice(0, 10).map((nombre, i) => ({
      nro: i + 1,
      nombre,
      cedula: (30023806 - i).toString(),
      correo: `${nombre.split(' ')[0].toLowerCase()}.${nombre.split(' ')[1]?.toLowerCase() || 'est'}@unet.edu.ve`,
      verificado: true
    }))
  },
  {
    id: 'sec-06',
    materia: 'Sistemas Distribuidos',
    seccion: '12',
    modalidad: 'Virtual',
    aula: 'Aula Virtual 3',
    profesor: 'Hendry Fourl',
    capacidadMax: 20,
    estudiantes: initialNombres.slice(0, 16).map((nombre, i) => ({
      nro: i + 1,
      nombre,
      cedula: (30023806 - i).toString(),
      correo: `${nombre.split(' ')[0].toLowerCase()}.${nombre.split(' ')[1]?.toLowerCase() || 'est'}@unet.edu.ve`,
      verificado: false
    }))
  }
]

export const InscripcionProvider = ({ children }) => {
  const [periodoActivo, setPeriodoActivo] = useState('Semestre 2026-1')
  const [inscripcionHabilitada, setInscripcionHabilitada] = useState(true)
  const [materiasHabilitadas, setMateriasHabilitadas] = useState(
    informaticaSubjects.reduce((acc, materia) => {
      acc[materia] = true
      return acc
    }, {})
  )
  
  const [solicitudes, setSolicitudes] = useState(generateInitialSolicitudes)
  const [secciones, setSecciones] = useState(initialSecciones)

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

  // Agregar nueva solicitud del formulario de estudiante
  const agregarSolicitud = ({ nombre, cedula, correo, materias }) => {
    const nueva = {
      id: `sol-${Date.now()}`,
      nro: solicitudes.length + 1,
      nombre,
      cedula,
      correo,
      periodo: periodoActivo,
      materiasSolicitadas: materias.map(m => ({
        materia: m,
        estado: 'gris',
        seccionAsignada: null
      }))
    }
    setSolicitudes(prev => [nueva, ...prev])
    return nueva
  }

  // Crear Sección
  const crearSeccion = ({ materia, modalidad, seccion, aula, profesor }) => {
    const capacidadMax = modalidad === 'Virtual' ? 20 : 30
    const nuevaSeccion = {
      id: `sec-${Date.now()}`,
      materia,
      seccion,
      modalidad,
      aula,
      profesor,
      capacidadMax,
      estudiantes: []
    }
    setSecciones(prev => [...prev, nuevaSeccion])
    return nuevaSeccion
  }

  // Cargar estudiantes a una sección presencial (30) o virtual (20)
  const cargarEstudiantesASeccion = (seccionId, cantidadMax) => {
    setSecciones(prevSecciones => {
      return prevSecciones.map(sec => {
        if (sec.id !== seccionId) return sec

        // Buscar estudiantes que solicitaron esta materia y cuyo estado es 'gris' o 'rojo'
        const candidatos = solicitudes.filter(sol => 
          sol.materiasSolicitadas.some(m => m.materia === sec.materia && (m.estado === 'gris' || m.estado === 'rojo'))
        )

        const nuevosEstudiantes = [...sec.estudiantes]
        let añadidos = 0

        for (const sol of candidatos) {
          if (nuevosEstudiantes.length >= cantidadMax) break
          if (!nuevosEstudiantes.some(e => e.cedula === sol.cedula)) {
            nuevosEstudiantes.push({
              nro: nuevosEstudiantes.length + 1,
              nombre: sol.nombre,
              cedula: sol.cedula,
              correo: sol.correo,
              verificado: false
            })
            añadidos++
          }
        }

        return {
          ...sec,
          estudiantes: nuevosEstudiantes
        }
      })
    })

    // Actualizar estado en solicitudes a 'verde'
    setSolicitudes(prevSolicitudes => {
      const secTarget = secciones.find(s => s.id === seccionId)
      if (!secTarget) return prevSolicitudes

      return prevSolicitudes.map(sol => {
        const tieneMateria = sol.materiasSolicitadas.find(m => m.materia === secTarget.materia)
        if (tieneMateria && (tieneMateria.estado === 'gris' || tieneMateria.estado === 'rojo')) {
          return {
            ...sol,
            materiasSolicitadas: sol.materiasSolicitadas.map(m => {
              if (m.materia === secTarget.materia) {
                return { ...m, estado: 'verde', seccionAsignada: secTarget.seccion }
              }
              return m
            })
          }
        }
        return sol
      })
    })
  }

  // Autocompletar celdas vacías de una sección
  const autocompletarSeccion = (seccionId) => {
    const secTarget = secciones.find(s => s.id === seccionId)
    if (!secTarget) return
    cargarEstudiantesASeccion(seccionId, secTarget.capacidadMax)
  }

  // Marcar fila de estudiante como verificado (Verde en la lista)
  const marcarVerificado = (seccionId, indexEstudiante) => {
    setSecciones(prev => prev.map(sec => {
      if (sec.id !== seccionId) return sec
      const copy = [...sec.estudiantes]
      if (copy[indexEstudiante]) {
        copy[indexEstudiante] = { ...copy[indexEstudiante], verificado: true }
      }
      return { ...sec, estudiantes: copy }
    }))
  }

  // Marcar como no se pudo inscribir (dejar la fila vacía)
  const marcarNoInscrito = (seccionId, indexEstudiante) => {
    setSecciones(prev => prev.map(sec => {
      if (sec.id !== seccionId) return sec
      const copy = sec.estudiantes.filter((_, idx) => idx !== indexEstudiante)
      // Recalcular Nro
      const reindex = copy.map((est, i) => ({ ...est, nro: i + 1 }))
      return { ...sec, estudiantes: reindex }
    }))
  }

  // Agregar nueva fila (aumentar capacidad)
  const agregarFilaCupo = (seccionId) => {
    setSecciones(prev => prev.map(sec => {
      if (sec.id !== seccionId) return sec
      return {
        ...sec,
        capacidadMax: sec.capacidadMax + 1
      }
    }))
  }

  return (
    <InscripcionContext.Provider
      value={{
        periodoActivo,
        setPeriodoActivo,
        inscripcionHabilitada,
        setInscripcionHabilitada,
        toggleInscripciones,
        materiasHabilitadas,
        setMateriasHabilitadas,
        toggleMateria,
        getMateriasHabilitadas,
        solicitudes,
        secciones,
        agregarSolicitud,
        crearSeccion,
        cargarEstudiantesASeccion,
        autocompletarSeccion,
        marcarVerificado,
        marcarNoInscrito,
        agregarFilaCupo
      }}
    >
      {children}
    </InscripcionContext.Provider>
  )
}

