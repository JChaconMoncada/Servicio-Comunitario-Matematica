import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { departamentoSubjects, MAX_MATERIAS_POR_ESTUDIANTE } from '../data/subjects'
import { pensumMaterias } from '../data/pensum'
import emailjs from '@emailjs/browser'

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
    departamentoSubjects.reduce((acc, materia) => {
      acc[materia] = false
      return acc
    }, {})
  )
  
  const [solicitudes, setSolicitudes] = useState([])
  const [secciones, setSecciones] = useState([])
  const [historialChoques, setHistorialChoques] = useState([])
  const [loading, setLoading] = useState(true)

  const refrescarDatos = async () => {
    setLoading(true)
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
          aprobada: sec.aprobada || false,
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
        .order('created_at', { ascending: true })
        .order('nro', { ascending: true })
      
      if (!solicitudesError) {
        const solFormateadas = solicitudesData.map(s => ({
          ...s,
          materiasSolicitadas: s.solicitudes_materias || []
        }))
        setSolicitudes(solFormateadas)
      }

      // Cargar historial de choques de horario (más reciente primero)
      const { data: historialData, error: historialError } = await supabase
        .from('historial_choques_horario')
        .select('*')
        .order('created_at', { ascending: false })

      if (!historialError && historialData) {
        setHistorialChoques(historialData)
      }

    } catch (error) {
      console.error("Error cargando datos de Supabase:", error)
    } finally {
      setLoading(false)
    }
  }

  // Cargar datos iniciales desde Supabase
  useEffect(() => {
    refrescarDatos()
  }, [])

  const toggleInscripciones = () => {
    setInscripcionHabilitada(!inscripcionHabilitada)
  }

  const limpiarDatosDelPeriodo = async (periodo) => {
    const solicitudesDelPeriodo = solicitudes.filter(s => s.periodo === periodo)
    const cedulas = solicitudesDelPeriodo.map(s => s.cedula)

    if (cedulas.length > 0) {
      // Separar en lotes de 200 para evitar límites de la URL en la petición REST
      for (let i = 0; i < cedulas.length; i += 200) {
        const lote = cedulas.slice(i, i + 200)
        await supabase.from('secciones_estudiantes').delete().in('cedula', lote)
      }
    }

    await supabase.from('solicitudes').delete().eq('periodo', periodo)
    await supabase.from('historial_choques_horario').delete().eq('periodo', periodo)

    await refrescarDatos()
    return { success: true }
  }

  const toggleMateria = async (materia) => {
    const nuevoEstado = !materiasHabilitadas[materia]
    setMateriasHabilitadas(prev => ({
      ...prev,
      [materia]: nuevoEstado
    }))
    
    const { error } = await supabase
      .from('materias_habilitadas')
      .upsert({ nombre: materia, habilitada: nuevoEstado })

    if (error) {
      console.error('Error guardando materia habilitada en Supabase:', error)
      alert(`Hubo un error al guardar en la base de datos: ${error.message}`)
    }
  }

  const getMateriasHabilitadas = () => {
    return departamentoSubjects.filter(materia => materiasHabilitadas[materia])
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

    // Límite acumulado de materias por estudiante: se cuentan TODAS las materias
    // que la cédula ya haya solicitado en envíos anteriores más las nuevas, de
    // modo que no pueda saltarse el tope haciendo varias solicitudes pequeñas.
    const solicitudPrevia = solicitudes.find(s => s.cedula === cedula)
    const yaSolicitadas = solicitudPrevia?.materiasSolicitadas?.length || 0
    if (yaSolicitadas + materias.length > MAX_MATERIAS_POR_ESTUDIANTE) {
      const restantes = Math.max(0, MAX_MATERIAS_POR_ESTUDIANTE - yaSolicitadas)
      return {
        success: false,
        error: restantes === 0
          ? `Ya alcanzaste el máximo de ${MAX_MATERIAS_POR_ESTUDIANTE} materias permitidas por estudiante.`
          : `Solo puedes solicitar ${MAX_MATERIAS_POR_ESTUDIANTE} materias en total. Ya tienes ${yaSolicitadas} solicitada(s), por lo que solo puedes agregar ${restantes} más.`
      }
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

  // Crear Sección (con validación de duplicados y horario)
  const crearSeccion = async ({ materia, modalidad, seccion, aula, profesor, horario }) => {
    // Validar que no exista una sección con la misma materia y número de sección
    const duplicada = secciones.find(s => 
      s.materia === materia && s.seccion === seccion
    )
    if (duplicada) {
      return { success: false, error: `Ya existe una sección ${seccion} para ${materia}. No se puede crear duplicada.` }
    }

    const capacidadMax = modalidad === 'Virtual' ? 20 : 30
    const horarioTexto = horario?.trim() || 'Por definir'

    try {
      const { data, error } = await supabase
        .from('secciones')
        .insert([{
          materia,
          seccion,
          modalidad,
          aula,
          profesor,
          horario: horarioTexto,
          capacidad_max: capacidadMax
        }])
        .select()
        .single()

      if (!error && data) {
        const nuevaSeccion = { ...data, horario: horarioTexto, capacidadMax: data.capacidad_max, estudiantes: [] }
        setSecciones(prev => [...prev, nuevaSeccion])
        return { success: true, data: nuevaSeccion }
      }
    } catch (err) {
      console.warn('Advertencia insertando sección en Supabase:', err)
    }

    // Fallback local si la columna 'horario' aún no existe en Supabase
    const nuevaSeccionLocal = {
      id: String(Date.now()),
      materia,
      seccion,
      modalidad,
      aula,
      profesor,
      horario: horarioTexto,
      capacidadMax,
      capacidad_max: capacidadMax,
      aprobada: false,
      estudiantes: []
    }
    setSecciones(prev => [...prev, nuevaSeccionLocal])
    return { success: true, data: nuevaSeccionLocal }
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
  const cargarEstudiantesASeccion = async (seccionId, cantidadMax, silent = false) => {
    const sec = secciones.find(s => s.id === seccionId)
    if (!sec) return 0

    // Obtener estudiantes que ya están en esta sección
    const cedulasYaEnSeccion = new Set(sec.estudiantes.map(e => e.cedula))

    // Obtener estudiantes que ya están en CUALQUIER sección de la misma materia
    const cedulasEnOtrasSecciones = new Set()
    secciones
      .filter(s => s.materia === sec.materia)
      .forEach(s => {
        s.estudiantes.forEach(e => cedulasEnOtrasSecciones.add(e.cedula))
      })

    // Filtrar solicitudes: estudiantes que pidieron esta materia en el periodo activo y no están asignados ni rechazados
    const candidatos = solicitudes
      .filter(sol => {
        if (sol.periodo && sol.periodo !== periodoActivo) return false
        if (cedulasEnOtrasSecciones.has(sol.cedula)) return false
        return sol.materiasSolicitadas && sol.materiasSolicitadas.some(m => 
          m.materia === sec.materia && 
          m.estado !== 'rojo' && 
          m.estado !== 'anaranjado' &&
          m.estado !== 'morado'
        )
      })

    if (candidatos.length === 0) {
      if (!silent) alert(`No hay estudiantes pendientes por asignar para ${sec.materia}. Todos ya fueron asignados o no hay solicitudes.`)
      return 0
    }

    // Cuántos cupos hay disponibles
    const cuposDisponibles = cantidadMax - sec.estudiantes.length
    if (cuposDisponibles <= 0) {
      if (!silent) alert('Esta sección ya está llena. No hay cupos disponibles.')
      return 0
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
      if (!silent) alert('Error al cargar estudiantes: ' + error.message)
      return 0
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

    if (!silent) alert(`Se cargaron ${nuevosEstudiantes.length} estudiante(s) a la sección ${sec.seccion} de ${sec.materia}.`)
    return nuevosEstudiantes.length;
  }

  // Autocompletar celdas vacías de una sección (llena los cupos restantes)
  const autocompletarSeccion = async (seccionId) => {
    const secTarget = secciones.find(s => s.id === seccionId)
    if (!secTarget) return
    const capacidad = secTarget.capacidadMax || secTarget.capacidad_max
    await cargarEstudiantesASeccion(seccionId, capacidad)
  }

  // Autocompletar todas las secciones pendientes (carga masiva)
  const autocompletarTodasLasSecciones = async () => {
    let totalCargados = 0;
    const seccionesPendientes = secciones.filter(s => !s.aprobada);
    
    for (const sec of seccionesPendientes) {
      const capacidad = sec.capacidadMax || sec.capacidad_max;
      if (sec.estudiantes.length < capacidad) {
        const cargados = await cargarEstudiantesASeccion(sec.id, capacidad, true);
        if (cargados) totalCargados += cargados;
      }
    }
    
    alert(`Autocompletado masivo finalizado. Se cargaron un total de ${totalCargados} estudiante(s) en las secciones.`);
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

    const sol = solicitudes.find(s => s.cedula === estudiante.cedula)
    const materiaEnSeccion = sol?.materiasSolicitadas?.find(m => m.materia === sec.materia)
    if (materiaEnSeccion && materiaEnSeccion.estado !== 'verde') {
      await supabase.from('solicitudes_materias').update({ estado: 'verde' }).eq('id', materiaEnSeccion.id)
      setSolicitudes(prev => prev.map(s => {
        if (s.id !== sol.id) return s
        return { ...s, materiasSolicitadas: s.materiasSolicitadas.map(m => m.id === materiaEnSeccion.id ? { ...m, estado: 'verde' } : m) }
      }))
    }
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
      const reindex = copy.map((est, i) => ({ ...est, nro: i + 1 }))
      return { ...s, estudiantes: reindex }
    }))
  }

  // Limpiar todos los estudiantes de una sección
  const limpiarSeccion = async (seccionId) => {
    const sec = secciones.find(s => s.id === seccionId)
    if (!sec || sec.aprobada || sec.estudiantes.length === 0) return

    // Revertir el estado a 'gris' en solicitudes_materias si estaban 'verde'
    const cedulas = sec.estudiantes.map(e => e.cedula)
    if (cedulas.length > 0) {
      const solicitudesEstudiantes = solicitudes.filter(s => cedulas.includes(s.cedula))
      const idsMateriasAResetear = []
      
      solicitudesEstudiantes.forEach(sol => {
        const mat = sol.materiasSolicitadas?.find(m => m.materia === sec.materia && m.estado === 'verde')
        if (mat) idsMateriasAResetear.push(mat.id)
      })

      if (idsMateriasAResetear.length > 0) {
        await supabase
          .from('solicitudes_materias')
          .update({ estado: 'gris' })
          .in('id', idsMateriasAResetear)
          
        setSolicitudes(prev => prev.map(sol => {
          if (!cedulas.includes(sol.cedula)) return sol
          return {
            ...sol,
            materiasSolicitadas: sol.materiasSolicitadas.map(m => 
              idsMateriasAResetear.includes(m.id) ? { ...m, estado: 'gris' } : m
            )
          }
        }))
      }
    }

    // Eliminar de Supabase (secciones_estudiantes)
    const { error } = await supabase
      .from('secciones_estudiantes')
      .delete()
      .eq('seccion_id', seccionId)

    if (error) {
      console.error('Error limpiando sección:', error)
      return { success: false, error: error.message }
    }

    // Actualizar estado local
    setSecciones(prev => prev.map(s => {
      if (s.id !== seccionId) return s
      return { ...s, estudiantes: [] }
    }))
    
    return { success: true }
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

  // Función para obtener UC de cualquier materia (fallback dinámico)
  const getUCForMateriaLocal = (nombreMateria) => {
    if (!nombreMateria) return 3
    const info = pensumMaterias.find(p => p.nombre === nombreMateria)
    if (info) return info.uc
    if (nombreMateria.includes('Computación 2') || nombreMateria.includes('Computación Aplicada') || nombreMateria.includes('Programación 2') || nombreMateria.includes('Base de Datos')) return 3
    if (nombreMateria.includes('Introducción') || nombreMateria.includes('Efectividad') || nombreMateria.includes('Laboratorio')) return 1
    return 3
  }

  // Rechazar estudiante por límite de UC/índice/choque y notificarle.
  const rechazarEstudiante = async (solicitud, reglasUC, razon, motivo = 'exceso_uc', seccionId = null, indexEstudiante = null) => {
    
    // Identificar qué materias solicitadas caen en la restricción
    const materiasARechazar = solicitud.materiasSolicitadas.filter(mReq => {
      const ucMateria = getUCForMateriaLocal(mReq.materia)
      return reglasUC.includes(ucMateria)
    })

    // Si no encontró por UC específica pero la lista no está vacía y reglasUC incluye todas las UCs posibles (o motivo choque/bajo indice), tomar todas
    const materiasFinales = materiasARechazar.length > 0 ? materiasARechazar : (
      (motivo === 'choque_horario' || motivo === 'bajo_indice') ? solicitud.materiasSolicitadas : []
    )

    if (materiasFinales.length === 0) {
      return { success: false, error: 'El estudiante no solicitó materias que coincidan con esta restricción de UC.' }
    }

    const idsARechazar = materiasFinales.map(m => m.id)
    const estadosPorMotivo = {
      bajo_indice: 'rojo',
      choque_horario: 'morado',
      exceso_uc: 'anaranjado'
    }
    const estadoRechazo = estadosPorMotivo[motivo] || 'anaranjado'

    // 1. Actualizar en Supabase (solicitudes_materias)
    const { error } = await supabase
      .from('solicitudes_materias')
      .update({ estado: estadoRechazo })
      .in('id', idsARechazar)

    if (error) {
      console.error("Error al rechazar estudiante en BD:", error)
    }

    // 2. Actualizar estado local de solicitudes
    setSolicitudes(prev => prev.map(s => {
      if (s.id !== solicitud.id) return s
      
      const materiasActualizadas = s.materiasSolicitadas.map(m => {
        if (idsARechazar.includes(m.id)) {
          return { ...m, estado: estadoRechazo }
        }
        return m
      })

      return { ...s, materiasSolicitadas: materiasActualizadas }
    }))

    // 3. Eliminar al estudiante de TODAS las secciones de las materias rechazadas
    const materiasNombresRechazadas = new Set(materiasFinales.map(m => m.materia))
    const idsAEliminar = []
    secciones.forEach(s => {
      if (!materiasNombresRechazadas.has(s.materia)) return
      s.estudiantes.forEach(e => {
        if (e.cedula === solicitud.cedula && e.id) idsAEliminar.push(e.id)
      })
    })

    if (idsAEliminar.length > 0) {
      await supabase
        .from('secciones_estudiantes')
        .delete()
        .in('id', idsAEliminar)
    }

    setSecciones(prev => prev.map(s => {
      if (!materiasNombresRechazadas.has(s.materia)) return s
      const copy = s.estudiantes.filter(e => e.cedula !== solicitud.cedula)
      if (copy.length === s.estudiantes.length) return s
      return { ...s, estudiantes: copy.map((e, i) => ({ ...e, nro: i + 1 })) }
    }))

    // 4. Enviar correo de notificación
    const nombresMateriasRechazadas = materiasFinales.map(m => m.materia).join(', ')
    const mensajeCorreo = `Hola ${solicitud.nombre}, tu solicitud para las siguientes materias ha sido rechazada por el departamento: ${nombresMateriasRechazadas}.\n\nRazón: ${razon}`

    try {
      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        {
          destinatario: solicitud.correo,
          mensaje: mensajeCorreo,
          message: mensajeCorreo,
        },
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      )
    } catch (err) {
      console.error("Error enviando correo de rechazo:", err)
    }

    // 5. Si el motivo es choque de horario, registrar en el historial de choques
    if (motivo === 'choque_horario') {
      const secOrigen = seccionId ? secciones.find(s => s.id === seccionId) : null
      for (const matRechazada of materiasFinales) {
        await registrarHistorialChoque({
          cedula: solicitud.cedula,
          nombre: solicitud.nombre,
          materia: matRechazada.materia,
          seccion_origen: secOrigen ? secOrigen.seccion : '—',
          seccion_destino: null,
          transferido: false,
          periodo: periodoActivo,
          horario: secOrigen?.horario || 'Por definir'
        })
      }
    }

    return { success: true, count: materiasFinales.length }
  }

  // Registra en el historial (tabla historial_choques_horario)
  const registrarHistorialChoque = async ({ cedula, nombre, materia, seccion_origen, seccion_destino, transferido, periodo, horario }) => {
    const nuevoRegistro = {
      id: String(Date.now() + Math.floor(Math.random() * 10000)),
      cedula,
      nombre,
      materia,
      seccion_origen: seccion_origen || '—',
      seccion_destino: seccion_destino || null,
      transferido: !!transferido,
      periodo: periodo || periodoActivo,
      horario: horario || 'Por definir',
      created_at: new Date().toISOString()
    }

    // Actualizar estado local inmediatamente para asegurar renderizado inmediato en el Admin UI
    setHistorialChoques(prev => [nuevoRegistro, ...prev])

    try {
      await supabase
        .from('historial_choques_horario')
        .insert([{
          cedula,
          nombre,
          materia,
          seccion_origen: nuevoRegistro.seccion_origen,
          seccion_destino: nuevoRegistro.seccion_destino,
          transferido: nuevoRegistro.transferido,
          periodo: nuevoRegistro.periodo,
          horario: nuevoRegistro.horario
        }])
    } catch (error) {
      console.warn('Error/Aviso guardando choque en Supabase (reflejado en estado local):', error)
    }
  }

  const resolverChoqueHorario = async (seccionId, indexEstudiante) => {
    const sec = secciones.find(s => s.id === seccionId)
    if (!sec) return { success: false, error: 'Sección no encontrada' }
    const estudiante = sec.estudiantes[indexEstudiante]
    if (!estudiante) return { success: false, error: 'Estudiante no encontrado' }

    const sol = solicitudes.find(s => s.cedula === estudiante.cedula)
    const materiaEnSeccion = sol?.materiasSolicitadas.find(m => m.materia === sec.materia)

    // 1. Eliminar de la sección actual
    const idsAEliminar = []
    secciones.forEach(s => {
      if (s.materia !== sec.materia) return
      s.estudiantes.forEach(e => {
        if (e.cedula === estudiante.cedula && e.id) idsAEliminar.push(e.id)
      })
    })
    if (idsAEliminar.length > 0) {
      await supabase
        .from('secciones_estudiantes')
        .delete()
        .in('id', idsAEliminar)
    }
    setSecciones(prev => prev.map(s => {
      if (s.materia !== sec.materia) return s
      const copy = s.estudiantes.filter(e => e.cedula !== estudiante.cedula)
      if (copy.length === s.estudiantes.length) return s
      return { ...s, estudiantes: copy.map((e, i) => ({ ...e, nro: i + 1 })) }
    }))

    // 2. Buscar otra sección de la misma materia, abierta y con cupo disponible
    const otraSeccion = secciones.find(s =>
      s.id !== seccionId &&
      s.materia === sec.materia &&
      !s.aprobada &&
      s.estudiantes.length < (s.capacidadMax || s.capacidad_max) &&
      !s.estudiantes.some(e => e.cedula === estudiante.cedula)
    )

    if (otraSeccion) {
      const nuevoNro = otraSeccion.estudiantes.length + 1
      const { data, error } = await supabase
        .from('secciones_estudiantes')
        .insert([{
          seccion_id: otraSeccion.id,
          nro: nuevoNro,
          nombre: estudiante.nombre,
          cedula: estudiante.cedula,
          correo: estudiante.correo,
          verificado: false
        }])
        .select()
        .single()

      if (!error && data) {
        setSecciones(prev => prev.map(s => {
          if (s.id !== otraSeccion.id) return s
          return {
            ...s,
            estudiantes: [...s.estudiantes, {
              id: data.id, nro: data.nro, nombre: data.nombre, cedula: data.cedula, correo: data.correo, verificado: data.verificado
            }]
          }
        }))
      }

      if (materiaEnSeccion && materiaEnSeccion.estado !== 'morado') {
        await supabase.from('solicitudes_materias').update({ estado: 'morado' }).eq('id', materiaEnSeccion.id)
        setSolicitudes(prev => prev.map(s => {
          if (s.id !== sol.id) return s
          return { ...s, materiasSolicitadas: s.materiasSolicitadas.map(m => m.id === materiaEnSeccion.id ? { ...m, estado: 'morado' } : m) }
        }))
      }

      await registrarHistorialChoque({
        cedula: estudiante.cedula,
        nombre: estudiante.nombre,
        materia: sec.materia,
        seccion_origen: sec.seccion,
        seccion_destino: otraSeccion.seccion,
        transferido: true,
        periodo: periodoActivo,
        horario: sec.horario || 'Por definir'
      })

      return { success: true, transferido: true, nuevaSeccion: otraSeccion.seccion }
    }

    // 3. No hay otra sección disponible: marcar como choque (morado), pendiente de reubicación
    if (materiaEnSeccion) {
      await supabase.from('solicitudes_materias').update({ estado: 'morado' }).eq('id', materiaEnSeccion.id)
      setSolicitudes(prev => prev.map(s => {
        if (s.id !== sol.id) return s
        return { ...s, materiasSolicitadas: s.materiasSolicitadas.map(m => m.id === materiaEnSeccion.id ? { ...m, estado: 'morado' } : m) }
      }))
    }

    await registrarHistorialChoque({
      cedula: estudiante.cedula,
      nombre: estudiante.nombre,
      materia: sec.materia,
      seccion_origen: sec.seccion,
      seccion_destino: null,
      transferido: false,
      periodo: periodoActivo,
      horario: sec.horario || 'Por definir'
    })

    return { success: true, transferido: false }
  }

  // Aprobar Sección (bloquea la sección y resetea a los estudiantes con choque de horario 'morado' a 'gris')
  const aprobarSeccion = async (seccionId) => {
    const secTarget = secciones.find(s => s.id === seccionId)
    if (!secTarget) return { success: false, error: 'Sección no encontrada' }

    // 1. Intentar actualizar en Supabase (si existe la columna aprobada)
    try {
      await supabase
        .from('secciones')
        .update({ aprobada: true })
        .eq('id', seccionId)
    } catch (err) {
      console.warn('Columna aprobada en BD:', err)
    }

    // 1.5 Marcar a todos los estudiantes de la sección como verificados (verde)
    const estudiantesIds = secTarget.estudiantes.map(e => e.id).filter(id => id);
    if (estudiantesIds.length > 0) {
      await supabase
        .from('secciones_estudiantes')
        .update({ verificado: true })
        .in('id', estudiantesIds);
    }

    // 2. Buscar materiasSolicitadas para resetear choques (morado -> gris) y aprobar inscritos (-> verde)
    const idsMorados = []
    const idsVerdes = []
    const cedulasEnSeccion = secTarget.estudiantes.map(e => e.cedula);

    solicitudes.forEach(sol => {
      sol.materiasSolicitadas?.forEach(m => {
        if (m.materia === secTarget.materia) {
          if (m.estado === 'morado') {
            idsMorados.push(m.id)
          } else if (cedulasEnSeccion.includes(sol.cedula) && m.estado !== 'verde') {
            idsVerdes.push(m.id)
          }
        }
      })
    })

    if (idsMorados.length > 0) {
      await supabase
        .from('solicitudes_materias')
        .update({ estado: 'gris' })
        .in('id', idsMorados)
    }

    if (idsVerdes.length > 0) {
      await supabase
        .from('solicitudes_materias')
        .update({ estado: 'verde' })
        .in('id', idsVerdes)
    }

    // 3. Actualizar estado local de secciones (aprobada y estudiantes verificados)
    setSecciones(prev => prev.map(s => {
      if (s.id !== seccionId) return s
      return { 
        ...s, 
        aprobada: true,
        estudiantes: s.estudiantes.map(e => ({ ...e, verificado: true }))
      }
    }))

    // 4. Actualizar estado local de solicitudes (morado -> gris, otros -> verde)
    if (idsMorados.length > 0 || idsVerdes.length > 0) {
      setSolicitudes(prev => prev.map(sol => {
        const tieneCambio = sol.materiasSolicitadas?.some(m => idsMorados.includes(m.id) || idsVerdes.includes(m.id))
        if (!tieneCambio) return sol
        const mats = sol.materiasSolicitadas.map(m => {
          if (idsMorados.includes(m.id)) {
            return { ...m, estado: 'gris' }
          }
          if (idsVerdes.includes(m.id)) {
            return { ...m, estado: 'verde' }
          }
          return m
        })
        return { ...sol, materiasSolicitadas: mats }
      }))
    }

    return { success: true, countChoquesReseteados: idsMorados.length }
  }

  // Generar 60 solicitudes de prueba para una materia
  const generarDatosPrueba = async (materiaTarget = 'Matemática 1', cantidad = 60) => {
    const nombresDemo = [
      'Alejandro Pérez', 'María Rodríguez', 'Carlos Gómez', 'Ana Fernández', 'José Luis Martínez',
      'Daniela Sánchez', 'Gabriel López', 'Patricia Díaz', 'Luis Eduardo Torres', 'Sofia Benítez',
      'Ricardo Mendoza', 'Valentina Ruiz', 'Fernando Castillo', 'Camila Morales', 'Javier Gutiérrez',
      'Andrea Romero', 'Diego Navarro', 'Isabella Flores', 'Manuel Acosta', 'Gabriela Gil',
      'Samuel Vargas', 'Lucía Paredes', 'Esteban Silva', 'Victoria Blanco', 'Mateo Medina',
      'Paula Suárez', 'Santiago Molina', 'Natalia Delgado', 'Sebastián Rojas', 'Elena Castro'
    ]

    const timestamp = Date.now().toString().slice(-5)
    // Base derivada del timestamp actual para evitar colisiones de cédula con
    // datos de prueba generados en ejecuciones anteriores (la restricción UNIQUE
    // de la BD hace que todo el lote falle si una sola cédula se repite).
    const cedulaBase = 30000000 + (Date.now() % 60000000)
    const solicitudesInsert = []
    
    for (let i = 1; i <= cantidad; i++) {
      const idxNombre = (i - 1) % nombresDemo.length
      const sufijo = Math.floor((i - 1) / nombresDemo.length) > 0 ? ` ${Math.floor((i - 1) / nombresDemo.length) + 1}` : ''
      const cedula = `${cedulaBase + i}`
      const nombre = `${nombresDemo[idxNombre]}${sufijo}`
      const correo = `estudiante.demo.${timestamp}.${i}@unet.edu.ve`
      solicitudesInsert.push({ nombre, cedula, correo, periodo: periodoActivo })
    }

    // Insertar en Supabase solicitudes
    const { data: solData, error: solError } = await supabase
      .from('solicitudes')
      .insert(solicitudesInsert)
      .select()

    if (solError) {
      console.error('Error creando datos de prueba:', solError)
      return { success: false, error: solError.message }
    }

    // Insertar solicitudes_materias para cada una
    const matInsert = solData.map(s => ({
      solicitud_id: s.id,
      materia: materiaTarget,
      estado: 'gris'
    }))

    const { data: matData, error: matError } = await supabase
      .from('solicitudes_materias')
      .insert(matInsert)
      .select()

    if (matError) {
      console.error('Error insertando materias de prueba:', matError)
      return { success: false, error: matError.message }
    }

    // Actualizar estado local
    const nuevasSolicitudes = solData.map(s => ({
      ...s,
      materiasSolicitadas: matData.filter(m => m.solicitud_id === s.id)
    }))

    setSolicitudes(prev => [...nuevasSolicitudes, ...prev])

    return { success: true, count: solData.length }
  }

  // Generar N solicitudes de prueba distribuidas aleatoriamente entre las materias habilitadas actuales
  const generarDatosPruebaGlobal = async (cantidad = 60) => {
    const materiasDisponibles = departamentoSubjects.filter(m => materiasHabilitadas[m])
    if (materiasDisponibles.length === 0) {
      return { success: false, error: 'No hay materias habilitadas para generar solicitudes de prueba.' }
    }

    const nombresDemo = [
      'Alejandro Pérez', 'María Rodríguez', 'Carlos Gómez', 'Ana Fernández', 'José Luis Martínez',
      'Daniela Sánchez', 'Gabriel López', 'Patricia Díaz', 'Luis Eduardo Torres', 'Sofia Benítez',
      'Ricardo Mendoza', 'Valentina Ruiz', 'Fernando Castillo', 'Camila Morales', 'Javier Gutiérrez',
      'Andrea Romero', 'Diego Navarro', 'Isabella Flores', 'Manuel Acosta', 'Gabriela Gil',
      'Samuel Vargas', 'Lucía Paredes', 'Esteban Silva', 'Victoria Blanco', 'Mateo Medina',
      'Paula Suárez', 'Santiago Molina', 'Natalia Delgado', 'Sebastián Rojas', 'Elena Castro'
    ]

    const timestamp = Date.now().toString().slice(-5)
    // Base derivada del timestamp actual (distinta de la usada en generarDatosPrueba)
    // para evitar colisiones de cédula entre ambos generadores y ejecuciones previas.
    const cedulaBase = 30000000 + (Date.now() % 60000000) + 100000
    const solicitudesInsert = []
    const materiasPorIndice = []

    for (let i = 1; i <= cantidad; i++) {
      const idxNombre = (i - 1) % nombresDemo.length
      const sufijo = Math.floor((i - 1) / nombresDemo.length) > 0 ? ` ${Math.floor((i - 1) / nombresDemo.length) + 1}` : ''
      const cedula = `${cedulaBase + i}`
      const nombre = `${nombresDemo[idxNombre]}${sufijo}`
      const correo = `estudiante.demo.${timestamp}.${i}@unet.edu.ve`
      solicitudesInsert.push({ nombre, cedula, correo, periodo: periodoActivo })

      // Cada estudiante solicita entre 1 y 2 materias aleatorias distintas de las habilitadas
      const cantidadMaterias = materiasDisponibles.length > 1 && Math.random() > 0.5 ? 2 : 1
      const materiasElegidas = []
      const disponiblesCopy = [...materiasDisponibles]
      for (let j = 0; j < cantidadMaterias && disponiblesCopy.length > 0; j++) {
        const idx = Math.floor(Math.random() * disponiblesCopy.length)
        materiasElegidas.push(disponiblesCopy.splice(idx, 1)[0])
      }
      materiasPorIndice.push(materiasElegidas)
    }

    // Insertar en Supabase solicitudes
    const { data: solData, error: solError } = await supabase
      .from('solicitudes')
      .insert(solicitudesInsert)
      .select()

    if (solError) {
      console.error('Error creando datos de prueba globales:', solError)
      return { success: false, error: solError.message }
    }

    // Insertar solicitudes_materias para cada una, respetando la materia(s) elegida por estudiante
    const matInsert = []
    solData.forEach((s, idx) => {
      materiasPorIndice[idx].forEach(materia => {
        matInsert.push({
          solicitud_id: s.id,
          materia,
          estado: 'gris'
        })
      })
    })

    const { data: matData, error: matError } = await supabase
      .from('solicitudes_materias')
      .insert(matInsert)
      .select()

    if (matError) {
      console.error('Error insertando materias de prueba globales:', matError)
      return { success: false, error: matError.message }
    }

    // Actualizar estado local
    const nuevasSolicitudes = solData.map(s => ({
      ...s,
      materiasSolicitadas: matData.filter(m => m.solicitud_id === s.id)
    }))

    setSolicitudes(prev => [...nuevasSolicitudes, ...prev])

    return { success: true, count: solData.length }
  }

  // Eliminar definitivamente a un estudiante (y todas sus materias solicitadas)
  const eliminarSolicitudCompleta = async (solicitudId) => {
    const sol = solicitudes.find(s => s.id === solicitudId)
    if (!sol) return { success: false, error: 'Solicitud no encontrada' }

    // 1. Eliminar de Supabase (la tabla solicitudes tiene CASCADE a solicitudes_materias)
    const { error } = await supabase
      .from('solicitudes')
      .delete()
      .eq('id', solicitudId)

    if (error) {
      console.error("Error eliminando la solicitud:", error)
      return { success: false, error: error.message }
    }

    // 2. Actualizar estado local eliminando toda la solicitud
    setSolicitudes(prev => prev.filter(s => s.id !== solicitudId))

    // 3. (Opcional) Si queremos limpiar la solicitud completa cuando se queda sin materias, 
    // lo haríamos aquí, pero por ahora conservamos sus datos generales.
    return { success: true }
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
        historialChoques,
        agregarSolicitud,
        limpiarDatosDelPeriodo,
        crearSeccion,
        eliminarSeccion,
        cargarEstudiantesASeccion,
        autocompletarSeccion,
        autocompletarTodasLasSecciones,
        limpiarSeccion,
        marcarVerificado,
        marcarNoInscrito,
        agregarFilaCupo,
        rechazarEstudiante,
        resolverChoqueHorario,
        aprobarSeccion,
        eliminarSolicitudCompleta,
        generarDatosPrueba,
        generarDatosPruebaGlobal,
        refrescarDatos,
        loading
      }}
    >
      {children}
    </InscripcionContext.Provider>
  )
}
