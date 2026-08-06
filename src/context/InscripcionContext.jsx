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

  // Crear Sección (con validación de duplicados)
  const crearSeccion = async ({ materia, modalidad, seccion, aula, profesor }) => {
    // Validar que no exista una sección con la misma materia y número de sección
    const duplicada = secciones.find(s => 
      s.materia === materia && s.seccion === seccion
    )
    if (duplicada) {
      return { success: false, error: `Ya existe una sección ${seccion} para ${materia}. No se puede crear duplicada.` }
    }

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
      const nuevaSeccion = { ...data, capacidadMax: data.capacidad_max, estudiantes: [] }
      setSecciones(prev => [...prev, nuevaSeccion])
      return { success: true, data: nuevaSeccion }
    }
    return { success: false, error: error?.message || 'Error al crear la sección' }
  }

  // Eliminar una sección
  const eliminarSeccion = async (seccionId) => {
    const { error } = await supabase
      .from('secciones')
      .delete()
      .eq('id', seccionId)

    if (error) {
      alert('Error al eliminar la sección: ' + error.message)
      return
    }

    setSecciones(prev => prev.filter(s => s.id !== seccionId))
  }

  // Cargar estudiantes a una sección desde las solicitudes
  const cargarEstudiantesASeccion = async (seccionId, cantidadMax) => {
    const sec = secciones.find(s => s.id === seccionId)
    if (!sec) return

    // Obtener estudiantes que ya están en esta sección
    const cedulasYaEnSeccion = new Set(sec.estudiantes.map(e => e.cedula))

    // Obtener estudiantes que ya están en CUALQUIER sección de la misma materia
    const cedulasEnOtrasSecciones = new Set()
    secciones
      .filter(s => s.materia === sec.materia)
      .forEach(s => {
        s.estudiantes.forEach(e => cedulasEnOtrasSecciones.add(e.cedula))
      })

    // Filtrar solicitudes: estudiantes que pidieron esta materia y no están asignados
    const candidatos = solicitudes.filter(sol => {
      if (cedulasEnOtrasSecciones.has(sol.cedula)) return false
      return sol.materiasSolicitadas && sol.materiasSolicitadas.some(m => m.materia === sec.materia)
    })

    if (candidatos.length === 0) {
      alert(`No hay estudiantes pendientes por asignar para ${sec.materia}. Todos ya fueron asignados o no hay solicitudes.`)
      return
    }

    // Cuántos cupos hay disponibles
    const cuposDisponibles = cantidadMax - sec.estudiantes.length
    if (cuposDisponibles <= 0) {
      alert('Esta sección ya está llena. No hay cupos disponibles.')
      return
    }

    // Tomar solo los que caben
    const aInsertar = candidatos.slice(0, cuposDisponibles)
    const nroInicial = sec.estudiantes.length

    // Preparar datos para insertar en Supabase
    const datosInsert = aInsertar.map((est, idx) => ({
      seccion_id: seccionId,
      nro: nroInicial + idx + 1,
      nombre: est.nombre,
      cedula: est.cedula,
      correo: est.correo,
      verificado: false
    }))

    const { data, error } = await supabase
      .from('secciones_estudiantes')
      .insert(datosInsert)
      .select()

    if (error) {
      console.error('Error cargando estudiantes:', error)
      alert('Error al cargar estudiantes: ' + error.message)
      return
    }

    // Actualizar estado local
    const nuevosEstudiantes = data.map(e => ({
      id: e.id,
      nro: e.nro,
      nombre: e.nombre,
      cedula: e.cedula,
      correo: e.correo,
      verificado: e.verificado
    }))

    setSecciones(prev => prev.map(s => {
      if (s.id !== seccionId) return s
      return { ...s, estudiantes: [...s.estudiantes, ...nuevosEstudiantes] }
    }))

    alert(`Se cargaron ${nuevosEstudiantes.length} estudiante(s) a la sección ${sec.seccion} de ${sec.materia}.`)
  }

  // Autocompletar celdas vacías de una sección (llena los cupos restantes)
  const autocompletarSeccion = async (seccionId) => {
    const secTarget = secciones.find(s => s.id === seccionId)
    if (!secTarget) return
    const capacidad = secTarget.capacidadMax || secTarget.capacidad_max
    await cargarEstudiantesASeccion(seccionId, capacidad)
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
        eliminarSeccion,
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
