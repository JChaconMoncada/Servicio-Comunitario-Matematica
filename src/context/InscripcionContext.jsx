import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { informaticaSubjects, MAX_MATERIAS_POR_ESTUDIANTE } from '../data/subjects'
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
    informaticaSubjects.reduce((acc, materia) => {
      acc[materia] = true
      return acc
    }, {})
  )
  
  const [solicitudes, setSolicitudes] = useState([])
  const [secciones, setSecciones] = useState([])
  const [historialChoques, setHistorialChoques] = useState([])
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

    // Filtrar solicitudes: estudiantes que pidieron esta materia en el periodo activo y no están asignados ni rechazados
    const candidatos = solicitudes.filter(sol => {
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

    // Al quedar inscrito, la materia solicitada pasa a 'verde'. Esto también
    // limpia un posible estado 'morado' previo si el estudiante había tenido un
    // choque de horario y fue reubicado en esta sección.
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

  // Rechazar estudiante por límite de UC/índice y notificarle. Se usa para motivos
  // 'exceso_uc' y 'bajo_indice', que son políticas generales del departamento y por
  // lo tanto aplican a TODAS las materias solicitadas por el estudiante que coincidan
  // con esa(s) UC. El choque de horario se maneja aparte con resolverChoqueHorario,
  // ya que es específico de una sola materia (la de la sección actual).
  const rechazarEstudiante = async (solicitud, reglasUC, razon, motivo = 'exceso_uc', seccionId = null, indexEstudiante = null) => {
    // reglasUC será un arreglo de los UCs prohibidos, ej: [3, 4] o [4]
    
    // Identificar qué materias solicitadas caen en la restricción
    const materiasARechazar = solicitud.materiasSolicitadas.filter(mReq => {
      const infoMateria = pensumMaterias.find(p => p.nombre === mReq.materia)
      if (infoMateria && reglasUC.includes(infoMateria.uc)) {
        return true
      }
      return false
    })

    if (materiasARechazar.length === 0) {
      return { success: false, error: 'El estudiante no solicitó materias que coincidan con esta restricción de UC.' }
    }

    const idsARechazar = materiasARechazar.map(m => m.id)
    // Cada motivo tiene su propio color según la leyenda del panel:
    // rojo = bajo índice, morado = choque de horario, anaranjado = exceso de UC.
    const estadosPorMotivo = {
      bajo_indice: 'rojo',
      choque_horario: 'morado',
      exceso_uc: 'anaranjado'
    }
    const estadoRechazo = estadosPorMotivo[motivo] || 'anaranjado'

    // 1. Actualizar en Supabase (solicitudes_materias)
    const { error } = await supabase
      .from('solicitudes_materias')
      .update({ estado: estadoRechazo }) // Estado anaranjado o rojo según el motivo
      .in('id', idsARechazar)

    if (error) {
      console.error("Error al rechazar estudiante en BD:", error)
      return { success: false, error: 'Error al actualizar base de datos.' }
    }

    // 2. Actualizar estado local
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
    // (no solo de la fila donde se hizo clic), para evitar que quede una copia
    // residual "verificado" en otra sección que haga que la Vista Completa
    // siga mostrándolo en verde a pesar del rechazo.
    const materiasNombresRechazadas = new Set(materiasARechazar.map(m => m.materia))
    const idsAEliminar = []
    secciones.forEach(s => {
      if (!materiasNombresRechazadas.has(s.materia)) return
      s.estudiantes.forEach(e => {
        if (e.cedula === solicitud.cedula && e.id) idsAEliminar.push(e.id)
      })
    })

    if (idsAEliminar.length > 0) {
      const { error: errDelete } = await supabase
        .from('secciones_estudiantes')
        .delete()
        .in('id', idsAEliminar)
      if (errDelete) console.error('Error eliminando filas residuales al rechazar:', errDelete)
    }

    setSecciones(prev => prev.map(s => {
      if (!materiasNombresRechazadas.has(s.materia)) return s
      const copy = s.estudiantes.filter(e => e.cedula !== solicitud.cedula)
      if (copy.length === s.estudiantes.length) return s
      return { ...s, estudiantes: copy.map((e, i) => ({ ...e, nro: i + 1 })) }
    }))

    // 4. Enviar correo de notificación
    const nombresMateriasRechazadas = materiasARechazar.map(m => m.materia).join(', ')
    const mensajeCorreo = `Hola ${solicitud.nombre}, tu solicitud para las siguientes materias ha sido rechazada por el departamento: ${nombresMateriasRechazadas}.\n\nRazón: ${razon}`

    try {
      await emailjs.send(
        'service_omar_angola',
        'template_UNET',
        {
          destinatario: solicitud.correo,
          mensaje: mensajeCorreo,
          message: mensajeCorreo,
        },
        'p3KE-_nNVZb3wCTBE'
      )
    } catch (err) {
      console.error("Error enviando correo de rechazo:", err)
      // Aunque falle el correo, el rechazo se procesó
    }

    // 5. Si el motivo es choque de horario, registrar en el historial de choques
    // para que la pestaña "Historial de Choques" refleje este rechazo. Cuando el
    // rechazo se hace desde el modal (ModalDetalleEstudiante) no pasa por
    // resolverChoqueHorario(), por lo que hay que registrarlo aquí también.
    if (motivo === 'choque_horario') {
      for (const matRechazada of materiasARechazar) {
        await registrarHistorialChoque({
          cedula: solicitud.cedula,
          nombre: solicitud.nombre,
          materia: matRechazada.materia,
          seccion_origen: '—',       // desde el modal no hay sección origen específica
          seccion_destino: null,
          transferido: false,
          periodo: periodoActivo
        })
      }
    }

    return { success: true, count: materiasARechazar.length }
  }

  // Resolver Choque de Horario: a diferencia de exceso_uc/bajo_indice, esto es
  // específico de UNA sola materia (la de la sección actual). Al presionarlo:
  // 1. Se elimina al estudiante de la sección actual (libera el cupo).
  // 2. Se busca automáticamente otra sección ABIERTA de la MISMA materia con cupo
  //    disponible y se transfiere ahí directamente.
  // 3. Si no hay ninguna sección disponible, queda con estado 'morado' (choque)
  //    pendiente de reubicación hasta que se abra/vacíe otra sección.
  // Registra en el historial (tabla historial_choques_horario) cada resolución
  // de choque de horario, exitosa (transferido) o pendiente (sin sección disponible).
  const registrarHistorialChoque = async ({ cedula, nombre, materia, seccion_origen, seccion_destino, transferido, periodo }) => {
    const { data, error } = await supabase
      .from('historial_choques_horario')
      .insert([{ cedula, nombre, materia, seccion_origen, seccion_destino, transferido, periodo }])
      .select()
      .single()

    if (error) {
      console.error('Error registrando historial de choque de horario:', error)
      return
    }

    setHistorialChoques(prev => [data, ...prev])
  }

  const resolverChoqueHorario = async (seccionId, indexEstudiante) => {
    const sec = secciones.find(s => s.id === seccionId)
    if (!sec) return { success: false, error: 'Sección no encontrada' }
    const estudiante = sec.estudiantes[indexEstudiante]
    if (!estudiante) return { success: false, error: 'Estudiante no encontrado' }

    const sol = solicitudes.find(s => s.cedula === estudiante.cedula)
    const materiaEnSeccion = sol?.materiasSolicitadas.find(m => m.materia === sec.materia)

    // 1. Eliminar de la sección actual y de cualquier otra copia residual del
    // estudiante en secciones de la MISMA materia (evita filas "verificado"
    // duplicadas que hagan que la Vista Completa lo siga mostrando en verde).
    const idsAEliminar = []
    secciones.forEach(s => {
      if (s.materia !== sec.materia) return
      s.estudiantes.forEach(e => {
        if (e.cedula === estudiante.cedula && e.id) idsAEliminar.push(e.id)
      })
    })
    if (idsAEliminar.length > 0) {
      const { error: errDelete } = await supabase
        .from('secciones_estudiantes')
        .delete()
        .in('id', idsAEliminar)
      if (errDelete) console.error('Error eliminando filas residuales al resolver choque:', errDelete)
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

      // El estudiante tuvo un choque de horario, así que su materia queda marcada
      // como 'morado' (Choque de Horario) aunque haya sido reubicado. Cuando se le
      // marque como Inscrito en la nueva sección, pasará a verde.
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
        periodo: periodoActivo
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
      periodo: periodoActivo
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

    // 2. Buscar materiasSolicitadas de esta materia con estado 'morado' (choque) para resetear a 'gris'
    const idsMorados = []
    solicitudes.forEach(sol => {
      sol.materiasSolicitadas?.forEach(m => {
        if (m.materia === secTarget.materia && m.estado === 'morado') {
          idsMorados.push(m.id)
        }
      })
    })

    if (idsMorados.length > 0) {
      await supabase
        .from('solicitudes_materias')
        .update({ estado: 'gris' })
        .in('id', idsMorados)
    }

    // 3. Actualizar estado local de secciones
    setSecciones(prev => prev.map(s => {
      if (s.id !== seccionId) return s
      return { ...s, aprobada: true }
    }))

    // 4. Actualizar estado local de solicitudes (morado -> gris)
    if (idsMorados.length > 0) {
      setSolicitudes(prev => prev.map(sol => {
        const tieneMorado = sol.materiasSolicitadas?.some(m => idsMorados.includes(m.id))
        if (!tieneMorado) return sol
        const mats = sol.materiasSolicitadas.map(m => {
          if (idsMorados.includes(m.id)) {
            return { ...m, estado: 'gris' }
          }
          return m
        })
        return { ...sol, materiasSolicitadas: mats }
      }))
    }

    return { success: true, countChoquesReseteados: idsMorados.length }
  }

  // Generar 60 solicitudes de prueba para una materia
  const generarDatosPrueba = async (materiaTarget = 'Introducción a la Ingeniería en Informática', cantidad = 60) => {
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
    const materiasDisponibles = informaticaSubjects.filter(m => materiasHabilitadas[m])
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
        crearSeccion,
        eliminarSeccion,
        cargarEstudiantesASeccion,
        autocompletarSeccion,
        marcarVerificado,
        marcarNoInscrito,
        agregarFilaCupo,
        rechazarEstudiante,
        resolverChoqueHorario,
        aprobarSeccion,
        generarDatosPrueba,
        generarDatosPruebaGlobal,
        loading
      }}
    >
      {children}
    </InscripcionContext.Provider>
  )
}
