import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
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
  const [periodoActivo, setPeriodoActivo] = useState('Semestre 2026-1')
  const [inscripcionHabilitada, setInscripcionHabilitada] = useState(true)
  const [materiasHabilitadas, setMateriasHabilitadas] = useState(
    informaticaSubjects.reduce((acc, materia) => {
      acc[materia] = true
      return acc
    }, {})
  )
  
  const [solicitudes, setSolicitudes] = useState([])
  const [secciones, setSecciones] = useState([])
  const [loading, setLoading] = useState(true)

  // Cargar datos iniciales desde Supabase
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Cargar secciones
        const { data: seccionesData, error: seccionesError } = await supabase
          .from('secciones')
          .select('*')
        
        if (seccionesError) throw seccionesError

        // Cargar estudiantes de las secciones
        const { data: estudiantesData, error: estudiantesError } = await supabase
          .from('secciones_estudiantes')
          .select('*')
        
        if (estudiantesError) throw estudiantesError

        // Formatear secciones
        const seccionesFormateadas = seccionesData.map(sec => {
          const estudiantes = estudiantesData
            .filter(e => e.seccion_id === sec.id)
            .sort((a, b) => a.nro - b.nro)
          return {
            ...sec,
            capacidadMax: sec.capacidad_max,
            estudiantes: estudiantes.map(e => ({
              id: e.id,
              nro: e.nro,
              nombre: e.nombre,
              cedula: e.cedula,
              correo: e.correo,
              verificado: e.verificado
            }))
          }
        })

        setSecciones(seccionesFormateadas)

        // Cargar materias habilitadas
        const { data: materiasData, error: materiasError } = await supabase
          .from('materias_habilitadas')
          .select('*')
        
        if (!materiasError && materiasData) {
          const matMap = { ...materiasHabilitadas }
          materiasData.forEach(m => {
            matMap[m.nombre] = m.habilitada
          })
          setMateriasHabilitadas(matMap)
        }

        // Cargar solicitudes con sus materias
        const { data: solicitudesData, error: solicitudesError } = await supabase
          .from('solicitudes')
          .select('*, solicitudes_materias(*)')
        
        if (!solicitudesError) {
          const solFormateadas = solicitudesData.map(s => ({
            ...s,
            materiasSolicitadas: s.solicitudes_materias || []
          }))
          setSolicitudes(solFormateadas)
        }

      } catch (error) {
        console.error("Error cargando datos de Supabase:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const toggleInscripciones = () => {
    setInscripcionHabilitada(!inscripcionHabilitada)
  }

  const toggleMateria = async (materia) => {
    const nuevoEstado = !materiasHabilitadas[materia]
    setMateriasHabilitadas(prev => ({
      ...prev,
      [materia]: nuevoEstado
    }))
    
    await supabase
      .from('materias_habilitadas')
      .upsert({ nombre: materia, habilitada: nuevoEstado })
  }

  const getMateriasHabilitadas = () => {
    return informaticaSubjects.filter(materia => materiasHabilitadas[materia])
  }

  // Agregar nueva solicitud del formulario de estudiante
  const agregarSolicitud = async ({ nombre, cedula, correo, materias }) => {
    // Validar duplicados localmente o en BD
    // En las solicitudes locales podemos revisar si esta cedula ya tiene alguna de estas materias
    const yaSolicito = solicitudes.find(s => 
      s.cedula === cedula && 
      s.materiasSolicitadas.some(m => materias.includes(m.materia))
    )
    
    if (yaSolicito) {
      const materiaDuplicada = yaSolicito.materiasSolicitadas.find(m => materias.includes(m.materia)).materia
      return { success: false, error: `Ya has enviado una solicitud previa para la materia: ${materiaDuplicada}` }
    }

    // 1. Verificar si ya existe el estudiante (la cédula es UNIQUE en solicitudes)
    // Para simplificar y permitir multiples envios en diferentes momentos, si ya existe 
    // la solicitud principal de ese estudiante, agregamos las nuevas materias a esa solicitud.
    let solicitudPrincipal = solicitudes.find(s => s.cedula === cedula)

    if (!solicitudPrincipal) {
      const { data, error } = await supabase
        .from('solicitudes')
        .insert([{ nombre, cedula, correo, periodo: periodoActivo }])
        .select()
        .single()
      
      if (error) return { success: false, error: error.message }
      solicitudPrincipal = data
    }

    // 2. Insertar en solicitudes_materias
    const insertMaterias = materias.map(m => ({
      solicitud_id: solicitudPrincipal.id,
      materia: m,
      estado: 'gris'
    }))

    const { data: materiasData, error: materiasError } = await supabase
      .from('solicitudes_materias')
      .insert(insertMaterias)
      .select()

    if (materiasError) {
      // Por si ocurre error de UNIQUE constraint (ya la habia insertado)
      return { success: false, error: 'Ocurrió un error o ya habías solicitado una de estas materias.' }
    }

    // 3. Actualizar estado local
    const nuevaSolicitudCompleta = {
      ...solicitudPrincipal,
      materiasSolicitadas: [
        ...(solicitudPrincipal.materiasSolicitadas || []),
        ...materiasData
      ]
    }
    
    setSolicitudes(prev => {
      const filtered = prev.filter(s => s.cedula !== cedula)
      return [nuevaSolicitudCompleta, ...filtered]
    })
    
    return { success: true, data: nuevaSolicitudCompleta }
  }

  // Crear Sección
  const crearSeccion = async ({ materia, modalidad, seccion, aula, profesor }) => {
    const capacidadMax = modalidad === 'Virtual' ? 20 : 30
    
    const { data, error } = await supabase
      .from('secciones')
      .insert([{
        materia,
        seccion,
        modalidad,
        aula,
        profesor,
        capacidad_max: capacidadMax
      }])
      .select()
      .single()

    if (!error && data) {
      const nuevaSeccion = { ...data, estudiantes: [] }
      setSecciones(prev => [...prev, nuevaSeccion])
      return nuevaSeccion
    }
    return null
  }

  // Cargar estudiantes a una sección
  const cargarEstudiantesASeccion = async (seccionId, cantidadMax) => {
    // Implementación simplificada para añadir localmente por ahora
    // Para producción, se debe hacer con Supabase Insert
    alert('Esta función masiva está en desarrollo para Supabase.')
  }

  // Autocompletar celdas vacías de una sección
  const autocompletarSeccion = (seccionId) => {
    const secTarget = secciones.find(s => s.id === seccionId)
    if (!secTarget) return
    cargarEstudiantesASeccion(seccionId, secTarget.capacidad_max)
  }

  // Marcar fila de estudiante como verificado (Verde en la lista)
  const marcarVerificado = async (seccionId, indexEstudiante) => {
    const sec = secciones.find(s => s.id === seccionId)
    if (!sec) return
    
    const estudiante = sec.estudiantes[indexEstudiante]
    if (!estudiante) return

    // Actualizar en Supabase
    if (estudiante.id) {
      await supabase
        .from('secciones_estudiantes')
        .update({ verificado: true })
        .eq('id', estudiante.id)
    }

    // Actualizar estado local
    setSecciones(prev => prev.map(s => {
      if (s.id !== seccionId) return s
      const copy = [...s.estudiantes]
      copy[indexEstudiante] = { ...copy[indexEstudiante], verificado: true }
      return { ...s, estudiantes: copy }
    }))
  }

  // Marcar como no se pudo inscribir (eliminar de la sección)
  const marcarNoInscrito = async (seccionId, indexEstudiante) => {
    const sec = secciones.find(s => s.id === seccionId)
    if (!sec) return
    
    const estudiante = sec.estudiantes[indexEstudiante]
    if (!estudiante) return

    // Eliminar de Supabase
    if (estudiante.id) {
      await supabase
        .from('secciones_estudiantes')
        .delete()
        .eq('id', estudiante.id)
    }

    // Actualizar estado local
    setSecciones(prev => prev.map(s => {
      if (s.id !== seccionId) return s
      const copy = s.estudiantes.filter((_, idx) => idx !== indexEstudiante)
      // Recalcular Nro
      const reindex = copy.map((est, i) => ({ ...est, nro: i + 1 }))
      return { ...s, estudiantes: reindex }
    }))
  }

  // Agregar nueva fila (aumentar capacidad)
  const agregarFilaCupo = async (seccionId) => {
    const sec = secciones.find(s => s.id === seccionId)
    if (!sec) return

    const nuevaCapacidad = (sec.capacidadMax || sec.capacidad_max) + 1

    await supabase
      .from('secciones')
      .update({ capacidad_max: nuevaCapacidad })
      .eq('id', seccionId)

    setSecciones(prev => prev.map(s => {
      if (s.id !== seccionId) return s
      return { ...s, capacidad_max: nuevaCapacidad, capacidadMax: nuevaCapacidad }
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
        agregarFilaCupo,
        loading
      }}
    >
      {children}
    </InscripcionContext.Provider>
  )
}
